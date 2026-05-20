/**
 * GET    /api/data/[collection]/[id]  → get single document
 * PUT    /api/data/[collection]/[id]  → upsert document
 * PATCH  /api/data/[collection]/[id]  → merge-update document
 * DELETE /api/data/[collection]/[id]  → delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dbGetDoc, dbSetDoc, dbUpdateDoc, dbDeleteDoc } from '@/lib/db';

const USER_SCOPED = new Set(['user_movements', 'user_budgetConfig', 'user_savedViews']);

function isAdmin(userId: string | null, email?: string | null): boolean {
  const ADMIN_UIDS = process.env.ADMIN_UIDS?.split(',') ?? ['id5hDeMIVZeR9i9HG5vvqnjEto32'];
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') ?? ['antonio.anacleto@gmail.com'];
  return (userId ? ADMIN_UIDS.includes(userId) : false) || (email ? ADMIN_EMAILS.includes(email) : false);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  const { userId } = await auth();

  if (USER_SCOPED.has(collection) && !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doc = await dbGetDoc(collection, id);

  // Guard: user-scoped docs can only be read by their owner (or admin)
  if (USER_SCOPED.has(collection) && doc) {
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string | undefined;
    const docWithUserId = doc as unknown as { user_id?: string };
    if (docWithUserId.user_id && docWithUserId.user_id !== userId && !isAdmin(userId, email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: doc });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  await dbSetDoc(collection, id, body, userId);
  return NextResponse.json({ id });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  await dbUpdateDoc(collection, id, body);
  return NextResponse.json({ id });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  const { userId, sessionClaims } = await auth();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // User-scoped: only owner or admin can delete
  if (USER_SCOPED.has(collection)) {
    const existing = await dbGetDoc<{ user_id?: string }>(collection, id);
    const email = sessionClaims?.email as string | undefined;
    if (existing && (existing as unknown as { user_id?: string }).user_id !== userId && !isAdmin(userId, email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  await dbDeleteDoc(collection, id);
  return NextResponse.json({ ok: true });
}
