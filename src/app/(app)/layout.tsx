
'use client';
import AppLayout from '@/components/app-layout';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { CookieConsent } from '@/components/CookieConsent';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      {children}
      <CookieConsent />
    </AppLayout>
  );
}
