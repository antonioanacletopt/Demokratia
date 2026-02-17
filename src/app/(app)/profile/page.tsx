'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { useUser, useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  notificationPreferences: z.object({
    emailNotifications: z.boolean().default(true),
    weeklyNewsletter: z.boolean().default(true),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileData {
  id: string;
  displayName: string;
  email: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    weeklyNewsletter: boolean;
  };
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  );
  
  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfileData>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      notificationPreferences: {
        emailNotifications: true,
        weeklyNewsletter: true,
      },
    },
  });

  // Populate form with data from Firestore
  useEffect(() => {
    if (profileData) {
      form.reset({
        displayName: profileData.displayName || '',
        notificationPreferences: {
          emailNotifications: profileData.notificationPreferences?.emailNotifications ?? true,
          weeklyNewsletter: profileData.notificationPreferences?.weeklyNewsletter ?? true,
        },
      });
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userProfileRef) return;
    setIsSaving(true);
    const dataToUpdate = {
      displayName: data.displayName,
      notificationPreferences: data.notificationPreferences,
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(userProfileRef, dataToUpdate);
      toast({
        title: 'Perfil atualizado!',
        description: 'As suas informações foram guardadas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      const permissionError = new FirestorePermissionError({ path: userProfileRef.path, operation: 'update', requestResourceData: dataToUpdate });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível guardar as suas alterações. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;
  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DP';

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-5 w-3/4 mt-2" />
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Foto de Perfil</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-10 w-2/3" />
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <Card>
              <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Perfil e Definições</h1>
        <p className="text-muted-foreground">Gira as informações da sua conta e preferências.</p>
      </div>
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Foto de Perfil</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 border-2 border-primary">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'Avatar'} />
                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                  </Avatar>
                  <Button disabled>Alterar Foto</Button>
                  <p className="text-xs text-muted-foreground text-center">A sua foto é gerida pela sua conta Google.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Pode alterar o seu nome de apresentação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Apresentação</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email ?? ''} readOnly disabled />
                    <p className="text-xs text-muted-foreground">O seu email não pode ser alterado.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Definições de Notificação</CardTitle>
                  <CardDescription>Escolha como pretende ser notificado. As alterações são guardadas em conjunto com o seu perfil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notificationPreferences.emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-medium">Notificações por Email</h3>
                          <p className="text-sm text-muted-foreground">Receba emails sobre novas funcionalidades e atualizações.</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                   <div className="flex items-center justify-between rounded-lg border p-4 opacity-50">
                    <div>
                      <h3 className="font-medium">Notificações Push</h3>
                      <p className="text-sm text-muted-foreground">Receba notificações push no seu browser (em breve).</p>
                    </div>
                    <Switch disabled />
                  </div>
                  <FormField
                    control={form.control}
                    name="notificationPreferences.weeklyNewsletter"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-medium">Newsletter Semanal</h3>
                          <p className="text-sm text-muted-foreground">Receba um resumo das principais análises e simulações.</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Todas as Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    