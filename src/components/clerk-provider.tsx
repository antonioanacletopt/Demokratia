'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

// Client-only wrapper — avoids satellite domain handshake loop in Cloudflare Workers
export function ClientClerkProvider({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
