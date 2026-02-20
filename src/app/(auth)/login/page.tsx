'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { useTranslation } from '@/lib/i18n';

const GoogleIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 2.04-4.82 2.04-5.84 0-10.62-4.7-10.62-10.62s4.78-10.62 10.62-10.62c3.32 0 5.62 1.36 6.96 2.62l2.54-2.54C20.46 2.22 16.98 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.28 0 12.12-4.92 12.12-12.36 0-.8-.08-1.56-.2-2.28z" fill="#4285F4" fillRule="evenodd"/></svg>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<{title: string, description: string, isDomainError?: boolean} | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/home');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: t('common.success') });
    } catch (error: any) {
      let title = t('login.errorTitle');
      let description = error.message;
      let isDomainError = false;

      if (error.code === 'auth/unauthorized-domain') {
        isDomainError = true;
        description = "O domínio 'demokratia.pt' ainda não foi autorizado na sua consola Firebase. Por favor, adicione-o em Authentication > Settings > Authorized domains.";
      }
      setAuthError({ title, description, isDomainError });
    }
  };

  if (isUserLoading || user) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
         <div className="flex justify-center mb-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Logo className="size-8" /></div></div>
        <CardTitle className="text-2xl font-headline">{t('login.welcome')}</CardTitle>
        <CardDescription>{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{authError.title}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{authError.description}</p>
              {authError.isDomainError && (
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold underline mt-2"
                >
                  Abrir Consola Firebase <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </AlertDescription>
          </Alert>
        )}
        <Button className="w-full" onClick={handleSignIn}><GoogleIcon />{t('login.googleBtn')}</Button>
      </CardContent>
    </Card>
  );
}
