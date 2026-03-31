'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, serverTimestamp, query, where } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, History, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const contactFormSchema = (t) => z.object({
  subject: z.string().min(5, { message: t('contact.errors.subjectMin') }),
  message: z.string().min(20, { message: t('contact.errors.messageMin') }),
});

export default function ContactPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<ReturnType<typeof contactFormSchema>>>({ 
    resolver: zodResolver(contactFormSchema(t)),
    defaultValues: { subject: '', message: '' },
  });

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'contactMessages'), where('userId', '==', user.uid));
  }, [user, firestore]);
  const { data: history } = useCollection(historyQuery);

  const onSubmit = (data: z.infer<ReturnType<typeof contactFormSchema>>) => {
    if (!user || !firestore) return;
    setIsSaving(true);

    const contactMessagesCollection = collection(firestore, 'contactMessages');
    const messageData = {
      userId: user.uid,
      userName: user.displayName || t('refutation.anonymous'),
      userEmail: user.email,
      subject: data.subject,
      message: data.message,
      status: 'new',
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(contactMessagesCollection, messageData)
      .then(() => {
        toast({ title: t('common.success') });
        form.reset();
      })
      .catch((error) => {
        // O erro já é emitido pelo non-blocking-updates, mas podemos tratar feedback local se necessário
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline tracking-tight'>{t('contact.title')}</h1>
        <p className='text-muted-foreground'>{t('contact.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><Mail className='h-5 w-5' />{t('contact.newTitle')}</CardTitle>
          <CardDescription>{t('contact.newDesc')}</CardDescription>
        </CardHeader>
        {!user ? <CardContent><p>{t('nav.login')}</p></CardContent> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='subject'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.subject')}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='message'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.message')}</FormLabel>
                      <FormControl><Textarea rows={6} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type='submit' disabled={isSaving}>
                  {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  <Send className='mr-2 h-4 w-4' />
                  {t('contact.sendBtn')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><History className='h-5 w-5' />{t('contact.historyTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? <p>{t('nav.login')}</p> : history && history.length > 0 ? (
            <div className='space-y-4'>
              {history.map((m: any) => (
                <div key={m.id} className='p-4 border rounded-lg flex justify-between'>
                  <div>
                    <p className='font-semibold'>{m.subject}</p>
                    <Badge variant='outline' className='mt-2'>{t(`contact.status.${m.status}`)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>{t('contact.noMessagesTitle')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
