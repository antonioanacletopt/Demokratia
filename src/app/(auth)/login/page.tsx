'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 2.04-4.82 2.04-5.84 0-10.62-4.7-10.62-10.62s4.78-10.62 10.62-10.62c3.32 0 5.62 1.36 6.96 2.62l2.54-2.54C20.46 2.22 16.98 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.28 0 12.12-4.92 12.12-12.36 0-.8-.08-1.56-.2-2.28z" fill="#4285F4" fillRule="evenodd"/></svg>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged in FirebaseProvider will handle the state update
      // and the useEffect above will trigger the redirect.
      toast({
        title: 'Sucesso!',
        description: 'Sessão iniciada com sucesso. A redirecionar...',
      });
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: error.message || 'Não foi possível iniciar sessão com o Google.',
      });
    }
  };

  if (isUserLoading || user) {
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
           <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Bot className="size-8" />
          </div>
         </div>
        <CardTitle className="text-2xl font-headline">Bem-vindo ao Demokratia</CardTitle>
        <CardDescription>Para continuar, por favor, inicie sessão com a sua conta Google.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleSignIn}>
          <GoogleIcon />
          Iniciar sessão com o Google
        </Button>
      </CardContent>
    </Card>
  );
}
