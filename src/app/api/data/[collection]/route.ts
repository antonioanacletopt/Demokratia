/**
 * GET  /api/data/[collection]          → list documents
 * POST /api/data/[collection]          → create document (returns { id })
 *
 * Query params for GET:
 *   orderBy, orderDir, limit, userId
 *   where=field,op,value (repeatable)
 *
 * Auth: user-scoped collections (user_movements, user_budgetConfig, user_savedViews)
 * automatically restrict access to the authenticated user only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dbGetDocs, dbAddDoc, type QueryParams } from '@/lib/db';

// Collections that are always scoped to the authenticated user
const USER_SCOPED = new Set(['user_movements', 'user_budgetConfig', 'user_savedViews']);

// Collections that require authentication to write
const AUTH_WRITE = new Set([
  'user_movements', 'user_budgetConfig', 'user_savedViews',
  'communityProposals', 'refutations', 'contactMessages',
  'publicFactChecks', 'publicLegislationQueries', 'publicSimulations', 'publicScenarios',
]);

// Collections only admins can write
const ADMIN_WRITE = new Set(['dataSources', 'statisticalData', 'roles_admin', 'analytics_sessions']);

function isAdmin(userId: string | null, email?: string | null): boolean {
  const ADMIN_UIDS = process.env.ADMIN_UIDS?.split(',') ?? ['id5hDeMIVZeR9i9HG5vvqnjEto32'];
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') ?? ['antonio.anacleto@gmail.com'];
  return (userId ? ADMIN_UIDS.includes(userId) : false) || (email ? ADMIN_EMAILS.includes(email) : false);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  const { userId } = await auth();

  // User-scoped collections require auth
  if (USER_SCOPED.has(collection) && !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const queryParams: QueryParams = {};

  const orderBy = searchParams.get('orderBy');
  if (orderBy) queryParams.orderBy = orderBy;

  const orderDir = searchParams.get('orderDir');
  if (orderDir === 'asc' || orderDir === 'desc') queryParams.orderDir = orderDir;

  const limitStr = searchParams.get('limit');
  if (limitStr) queryParams.limit = parseInt(limitStr, 10);

  // User-scoped: always filter by authenticated user
  if (USER_SCOPED.has(collection) && userId) {
    queryParams.userId = userId;
  }

  // Explicit userId filter override (admin use)
  const userIdParam = searchParams.get('userId');
  if (userIdParam && !USER_SCOPED.has(collection)) {
    queryParams.userId = userIdParam;
  }

  // where[]=field,op,value
  const whereParams = searchParams.getAll('where');
  if (whereParams.length > 0) {
    queryParams.where = whereParams.map(w => {
      const [field, op, ...rest] = w.split(',');
      const value: unknown = rest.join(',');
      return [field, op as '==', value] as [string, '==', unknown];
    });
  }

  const data = await dbGetDocs(collection, queryParams);
  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  const { userId } = await auth();

  if (AUTH_WRITE.has(collection) && !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (ADMIN_WRITE.has(collection)) {
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string | undefined;
    if (!isAdmin(userId, email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const body = await request.json() as Record<string, unknown>;
  const id = await dbAddDoc(collection, body, userId ?? undefined);
  return NextResponse.json({ id }, { status: 201 });
}
