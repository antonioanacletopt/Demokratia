'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

import { useUser, useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, type Language } from '@/lib/i18n';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2, AlertTriangle, Languages } from 'lucide-react';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Min 2 chars.'),
  preferredLanguage: z.enum(['pt', 'en']),
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
  preferredLanguage: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    weeklyNewsletter: boolean;
  };
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { t, setLanguage } = useTranslation();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfileData>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      preferredLanguage: 'pt',
      notificationPreferences: { emailNotifications: true, weeklyNewsletter: true },
    },
  });

  useEffect(() => {
    if (profileData) {
      form.reset({
        displayName: profileData.displayName || '',
        preferredLanguage: (profileData.preferredLanguage as any) || 'pt',
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
      preferredLanguage: data.preferredLanguage,
      notificationPreferences: data.notificationPreferences,
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(userProfileRef, dataToUpdate);
      setLanguage(data.preferredLanguage);
      toast({ title: t('common.success') });
    } catch (error) {
      const permissionError = new FirestorePermissionError({ path: userProfileRef.path, operation: 'update', requestResourceData: dataToUpdate });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !firestore) return;
    setIsDeleting(true);
    toast({ title: t('profile.deleting'), description: t('profile.deletingDesc') });

    try {
      const batch = writeBatch(firestore);
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

      batch.delete(doc(firestore, 'users', user.uid));
      await batch.commit();
      await deleteUser(user);
      router.replace('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;
  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DP';

  if (isLoading || !user) {
    return <div className="space-y-6"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-5 w-3/4 mt-2" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('profile.title')}</h1>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </div>
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader><CardTitle>{t('profile.photoTitle')}</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 border-2 border-primary">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'Avatar'} />
                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground text-center">{t('profile.photoDesc')}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader><CardTitle>{t('profile.personalInfo')}</CardTitle><CardDescription>{t('profile.displayNameDesc')}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="displayName" render={({ field }) => (
                    <FormItem><FormLabel>{t('profile.displayName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="preferredLanguage" render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center gap-2"><Languages className="h-4 w-4" />{t('profile.language')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="pt">{t('common.portuguese')}</SelectItem>
                          <SelectItem value="en">{t('common.english')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{t('profile.langDesc')}</p>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={user.email ?? ''} readOnly disabled /></div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <Card>
                <CardHeader><CardTitle>{t('profile.notifications')}</CardTitle><CardDescription>{t('profile.notifDesc')}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="notificationPreferences.emailNotifications" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div><h3 className="font-medium">{t('profile.emailNotif')}</h3><p className="text-sm text-muted-foreground">{t('profile.emailNotifDesc')}</p></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="notificationPreferences.weeklyNewsletter" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div><h3 className="font-medium">{t('profile.newsletter')}</h3><p className="text-sm text-muted-foreground">{t('profile.newsletterDesc')}</p></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" />{t('profile.dangerZone')}</CardTitle><CardDescription>{t('profile.deleteWarning')}</CardDescription></CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />{t('profile.deleteAccount')}</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>{t('common.warning')}</AlertDialogTitle><AlertDialogDescription>{t('profile.deleteWarning')}</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('common.delete')}</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end gap-4"><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('common.save')}</Button></div>
        </form>
      </Form>
    </div>
  );
}
