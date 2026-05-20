'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

/**
 * SSO callback page — Clerk redirects here after Google OAuth.
 * AuthenticateWithRedirectCallback handles the token exchange and
 * then redirects to the `redirectUrlComplete` set in the sign-in call.
 */
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
