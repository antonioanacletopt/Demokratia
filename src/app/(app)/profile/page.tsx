'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

import { useUser, useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError, useAuth } from '@/firebase';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

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
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!user || !firestore) return;
    
    setIsDeleting(true);
    toast({ title: 'A processar eliminação...', description: 'A apagar todos os seus dados da plataforma.' });

    try {
      const batch = writeBatch(firestore);
      
      // 1. Clean up Firestore collections
      const collectionsToCleanup = [
        `users/${user.uid}/simulationScenarios`,
        `users/${user.uid}/savedDataViews`,
        `users/${user.uid}/factChecks`,
        `users/${user.uid}/legislationQueries`,
      ];

      for (const colPath of collectionsToCleanup) {
        const q = query(collection(firestore, colPath));
        const snapshot = await getDocs(q);
        snapshot.forEach(d => batch.delete(d.ref));
      }

      // 2. Clean up user profile
      batch.delete(doc(firestore, 'userProfiles', user.uid));

      // 3. Clean up contact messages sent by the user
      const contactMessagesQuery = query(collection(firestore, 'contactMessages'), where('userId', '==', user.uid));
      const contactSnapshot = await getDocs(contactMessagesQuery);
      contactSnapshot.forEach(d => batch.delete(d.ref));

      await batch.commit();

      // 4. Delete the Auth User
      await deleteUser(user);
      
      toast({ title: 'Conta apagada', description: 'Os seus dados foram removidos com sucesso.' });
      router.replace('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast({ 
          variant: 'destructive', 
          title: 'Sessão expirada', 
          description: 'Para apagar a sua conta, por motivos de segurança, deve terminar sessão e voltar a entrar antes de tentar novamente.' 
        });
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'Erro ao apagar conta', 
          description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.' 
        });
      }
    } finally {
      setIsDeleting(false);
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
        <p className="text-muted-foreground">Gira as informações da sua conta e preferências de privacidade.</p>
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
                  <Button disabled variant="outline">Alterar Foto</Button>
                  <p className="text-xs text-muted-foreground text-center">A sua foto é gerida automaticamente pela sua conta Google.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Pode alterar o seu nome de apresentação na plataforma.</CardDescription>
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
                    <p className="text-xs text-muted-foreground">O seu email é a sua identidade principal e não pode ser alterado.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Definições de Notificação</CardTitle>
                  <CardDescription>Escolha como pretende ser notificado sobre atualizações e novos dados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notificationPreferences.emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-medium">Notificações por Email</h3>
                          <p className="text-sm text-muted-foreground">Receba avisos sobre novas funcionalidades e fontes de dados.</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notificationPreferences.weeklyNewsletter"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-medium">Newsletter Semanal</h3>
                          <p className="text-sm text-muted-foreground">Receba um resumo das simulações e fact-checks mais votados da semana.</p>
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

            <div className="md:col-span-3">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Zona de Perigo
                  </CardTitle>
                  <CardDescription>
                    Gerir a eliminação permanente da sua conta e de todos os dados associados (RGPD).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ao apagar a sua conta, removeremos permanentemente o seu perfil, todas as suas simulações guardadas, 
                    histórico de consultas e fact-checks. Esta ação é **irreversível**.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Apagar a minha conta e dados
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá apagar permanentemente a sua conta e todos os seus dados da plataforma Demokratia. 
                          Não será possível recuperar as suas simulações ou histórico.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Sim, apagar tudo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
