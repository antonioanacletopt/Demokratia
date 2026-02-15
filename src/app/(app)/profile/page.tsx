'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth state is checked and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DP';

  // Show a loader while checking auth or if user is null (before redirect).
  if (isUserLoading || !user) {
    return (
       <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">A carregar dados do utilizador...</h3>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Perfil e Definições</h1>
        <p className="text-muted-foreground">Gira as informações da sua conta e preferências.</p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-2 border-primary">
                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'Avatar'} />
                <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
              </Avatar>
              <Button disabled>Alterar Foto</Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Os seus dados são fornecidos pela sua conta Google.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={user?.displayName || 'Utilizador Demokratia'} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || 'user@demokratia.pt'} readOnly />
              </div>
              <Button disabled>Guardar Alterações</Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Definições de Notificação</CardTitle>
              <CardDescription>Escolha como pretende ser notificado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Notificações por Email</h3>
                  <p className="text-sm text-muted-foreground">Receba emails sobre novas funcionalidades e atualizações.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Notificações Push</h3>
                  <p className="text-sm text-muted-foreground">Receba notificações push no seu browser.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Newsletter Semanal</h3>
                  <p className="text-sm text-muted-foreground">Receba um resumo das principais análises e simulações.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
                <Button>Guardar Preferências</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
