'use client';
import AppLayout from '@/components/app-layout';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isUserLoading } = useUser();

  // The layout is now public, but we can show a loading screen while
  // Firebase checks the initial authentication state. This layout does NOT
  // redirect unauthenticated users, allowing for public pages within this group.
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
