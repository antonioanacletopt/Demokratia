
import type { ReactNode } from 'react';
import AppLayout from '@/components/app-layout';
import { CookieConsent } from '@/components/CookieConsent';
import { AiQuotaBanner } from '@/components/AiQuotaBanner';

// Força renderização dinâmica em todas as páginas filhas.
// Necessário porque usam Firebase SDK (client-only) e useSearchParams sem Suspense.
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AppLayout>
      <AiQuotaBanner />
      {children}
      <CookieConsent />
    </AppLayout>
  );
}
