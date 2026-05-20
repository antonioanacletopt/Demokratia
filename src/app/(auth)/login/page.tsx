'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { useTranslation } from '@/lib/i18n';
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 2.04-4.82 2.04-5.84 0-10.62-4.7-10.62-10.62s4.78-10.62 10.62-10.62c3.32 0 5.62 1.36 6.96 2.62l2.54-2.54C20.46 2.22 16.98 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.28 0 12.12-4.92 12.12-12.36 0-.8-.08-1.56-.2-2.28z" fill="#4285F4" fillRule="evenodd" />
  </svg>
);

export default function LoginPage() {
  const clerk = useClerk();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isUserLoading && user) router.push('/home');
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    try {
      const signIn = (clerk as any).client?.signIn;
      if (signIn?.authenticateWithRedirect) {
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/home',
        });
      } else {
        await clerk.redirectToSignIn();
      }
    } catch {
      toast({
        title: t('login.errorTitle'),
        description: 'Erro ao iniciar autenticação Google. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center">
            <Logo className="size-12" />
          </div>
        </div>
        <CardTitle className="text-2xl font-headline">{t('login.welcome')}</CardTitle>
        <CardDescription>{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full gap-2" onClick={handleGoogleSignIn}>
          <GoogleIcon />
          {t('login.googleBtn')}
        </Button>
      </CardContent>
    </Card>
  );
}