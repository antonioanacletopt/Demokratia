/**
 * auth-server.ts — Server-side auth helpers (Clerk).
 * Replaces firebase-admin.ts auth verification.
 */

import { auth, currentUser } from '@clerk/nextjs/server';

export const ADMIN_UIDS: string[] =
  (process.env.ADMIN_UIDS ?? 'id5hDeMIVZeR9i9HG5vvqnjEto32').split(',').map(s => s.trim());

export const ADMIN_EMAILS: string[] =
  (process.env.ADMIN_EMAILS ?? 'antonio.anacleto@gmail.com').split(',').map(s => s.trim());

export function isAdminId(userId: string | null | undefined): boolean {
  return userId ? ADMIN_UIDS.includes(userId) : false;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false;
}

/** Returns true if the current request comes from an authenticated admin. */
export async function requireAdmin(): Promise<{ userId: string; email: string | undefined } | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  const email = sessionClaims?.email as string | undefined;
  if (isAdminId(userId) || isAdminEmail(email)) return { userId, email };
  return null;
}

/** Returns the current user or null. */
export async function getServerUser() {
  return currentUser();
}
