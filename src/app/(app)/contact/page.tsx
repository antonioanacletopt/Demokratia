'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, serverTimestamp, addDoc, query, where } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, History, User, FileText, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const contactFormSchema = z.object({
  subject: z.string().min(5, 'O assunto deve ter pelo menos 5 caracteres.'),
  message: z.string().min(20, 'A mensagem deve ter pelo menos 20 caracteres.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactMessage {
    id: string;
    subject: string;
    createdAt: any;
    status: 'new' | 'read' | 'archived';
}

const statusConfig = {
  new: { label: 'Nova', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800' },
  read: { label: 'Lida', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' },
  archived: { label: 'Arquivada', color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600' },
};


export default function ContactPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const userMessagesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'contactMessages'), where('userId', '==', user.uid));
  }, [user, firestore]);
  
  const { data: pastMessages, isLoading: isLoadingHistory } = useCollection<ContactMessage>(userMessagesQuery);
  
  const sortedPastMessages = useMemo(() => {
    if (!pastMessages) return [];
    return [...pastMessages].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
        }
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return 0;
    });
  }, [pastMessages]);

  const onSubmit = async (data: ContactFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ação Requer Autenticação' });
      return;
    }
    
    setIsSaving(true);
    const contactMessagesCollection = collection(firestore, 'contactMessages');
    
    const messageData = {
      userId: user.uid,
      userName: user.displayName || 'Utilizador Anónimo',
      userEmail: user.email,
      subject: data.subject,
      message: data.message,
      status: 'new',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(contactMessagesCollection, messageData);
      toast({ title: 'Mensagem enviada!', description: 'Obrigado pelo seu contacto. Responderemos assim que possível.' });
      form.reset();
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: contactMessagesCollection.path,
        operation: 'create',
        requestResourceData: messageData,
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Erro ao enviar', description: 'Não foi possível enviar a sua mensagem.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Contacto</h1>
        <p className="text-muted-foreground">Envie-nos as suas sugestões, reclamações ou questões.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Nova Mensagem
          </CardTitle>
          {!user ? (
             <CardDescription className="!mt-2 flex items-center gap-2 text-amber-600">
                <User className="h-4 w-4" /> <span><Link href="/login" className="font-semibold text-primary hover:underline">Inicie sessão</Link> para enviar uma mensagem.</span>
            </CardDescription>
          ) : (
             <CardDescription>A sua mensagem será enviada para a nossa equipa de administração.</CardDescription>
          )}
        </CardHeader>
        {user && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={user.displayName || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user.email || ''} disabled />
                    </div>
                </div>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sugestão para o simulador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Escreva aqui a sua mensagem..." rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Minhas Mensagens Enviadas
          </CardTitle>
          {!user ? (
             <CardDescription className="!mt-2 flex items-center gap-2 text-amber-600">
              <User className="h-4 w-4" /> <span><Link href="/login" className="underline font-semibold">Inicie sessão</Link> para ver o seu histórico.</span>
            </CardDescription>
          ) : (
            <CardDescription>As suas mensagens anteriores e o estado das mesmas.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingHistory && user && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {!user && !isLoadingHistory && (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                  <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                    Inicie sessão para ver o seu histórico
                  </h3>
                </div>
          )}
          {user && !isLoadingHistory && sortedPastMessages && sortedPastMessages.length > 0 ? (
            <div className="space-y-4">
              {sortedPastMessages.map(msg => {
                const statusInfo = statusConfig[msg.status] || statusConfig.new;
                const timeAgo = msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true, locale: pt }) : 'há algum tempo';
                return (
                  <div key={msg.id} className="rounded-lg border p-4">
                    <p className="font-semibold text-muted-foreground">Assunto: {msg.subject}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Enviada {timeAgo}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : user && !isLoadingHistory && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                Nenhuma mensagem encontrada
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use o formulário acima para enviar a sua primeira mensagem.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
