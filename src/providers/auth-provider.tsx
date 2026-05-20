'use client';

/**
 * auth-provider.tsx — Clerk-based auth context.
 * Provides useUser(), useAuth() with the same hook interface as the old FirebaseProvider,
 * so consumer components only need minimal import updates.
 */

import React, { type ReactNode } from 'react';
import {
  useUser as useClerkUser,
  useClerk,
} from '@clerk/nextjs';

// ─── App user type ─────────────────────────────────────────────────────────────

export interface AppUser {
  uid: string;          // Clerk userId
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserHookResult {
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
  isAdmin: boolean;
}

export interface AuthHookResult {
  signOut: () => Promise<void>;
}

// ─── Admin detection ───────────────────────────────────────────────────────────

const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS ?? 'id5hDeMIVZeR9i9HG5vvqnjEto32')
  .split(',')
  .map(s => s.trim());

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? 'antonio.anacleto@gmail.com')
  .split(',')
  .map(s => s.trim());

function checkIsAdmin(user: ReturnType<typeof useClerkUser>['user']): boolean {
  if (!user) return false;
  if (ADMIN_UIDS.includes(user.id)) return true;
  const email = user.primaryEmailAddress?.emailAddress;
  return email ? ADMIN_EMAILS.includes(email) : false;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

/** Returns the current user with the same shape as the old Firebase hook. */
export function useUser(): UserHookResult {
  const { user, isLoaded } = useClerkUser();

  const appUser: AppUser | null = user
    ? {
        uid: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        displayName: user.fullName ?? user.username ?? null,
        photoURL: user.imageUrl ?? null,
      }
    : null;

  return {
    user: appUser,
    isUserLoading: !isLoaded,
    userError: null,
    isAdmin: checkIsAdmin(user),
  };
}

/** Returns auth actions (sign-out). Sign-in is handled by the login page directly. */
export function useAuth(): AuthHookResult {
  const { signOut } = useClerk();
  return {
    signOut: async () => { await signOut(); },
  };
}

// ─── Re-exports for convenience ────────────────────────────────────────────────
export { SignIn as SignedIn, SignOutButton as SignedOut } from '@clerk/nextjs';
