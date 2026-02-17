'use client';

import { useState } from 'react';
import Link from 'next/link';
import { collection, serverTimestamp, addDoc, updateDoc, doc, query, orderBy, increment, arrayUnion, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, MessageSquare, User, ThumbsUp, GitCommit, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface CommunityProposal {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  title: string;
  description: string;
  createdAt: any; // Firestore Timestamp
  voteCount: number;
  votedBy: string[];
}

const proposalFormSchema = z.object({
  title: z.string().min(10, 'O título deve ter pelo menos 10 caracteres.'),
  description: z.string().min(30, 'A descrição deve ter pelo menos 30 caracteres.'),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;


export default function ProposalsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposal, setEditingProposal] = useState<CommunityProposal | null>(null);
  
  const proposalsCollectionRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'communityProposals'), orderBy('voteCount', 'desc'));
  }, [firestore]);

  const { data: proposals, isLoading: isLoadingProposals } = useCollection<CommunityProposal>(proposalsCollectionRef);
  
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: { title: '', description: '' },
  });

  const handleOpenEditDialog = (proposal: CommunityProposal) => {
    setEditingProposal(proposal);
    form.reset({
      title: proposal.title,
      description: proposal.description,
    });
  };

  const handleCloseEditDialog = () => {
    setEditingProposal(null);
    form.reset({ title: '', description: '' });
  };
  
  const handleNewProposalSubmit = async (values: ProposalFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ação Requer Autenticação' });
      return;
    }

    setIsSubmitting(true);
    const proposalsCollection = collection(firestore, 'communityProposals');

    const proposalData = {
      userId: user.uid,
      userName: user.displayName || 'Utilizador Anónimo',
      userPhotoURL: user.photoURL || '',
      title: values.title,
      description: values.description,
      createdAt: serverTimestamp(),
      voteCount: 0,
      votedBy: [],
    };

    try {
        await addDoc(proposalsCollection, proposalData);
        toast({ title: 'Proposta submetida!', description: 'A sua proposta está visível para toda a comunidade.' });
        form.reset();
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: proposalsCollection.path,
          operation: 'create',
          requestResourceData: proposalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Erro ao submeter', description: 'Não foi possível guardar a sua proposta.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditProposalSubmit = async (values: ProposalFormValues) => {
    if (!user || !firestore || !editingProposal) return;
    
    setIsEditing(true);
    const proposalRef = doc(firestore, 'communityProposals', editingProposal.id);

    try {
        await updateDoc(proposalRef, {
            title: values.title,
            description: values.description,
        });
        toast({ title: 'Proposta atualizada!' });
        handleCloseEditDialog();
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'update',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Não foi possível guardar as alterações.' });
    } finally {
        setIsEditing(false);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!user || !firestore) return;
    const proposalRef = doc(firestore, 'communityProposals', proposalId);
    try {
        await deleteDoc(proposalRef);
        toast({ title: 'Proposta apagada.' });
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Erro ao apagar', description: 'Não foi possível apagar a proposta.' });
    }
  }

  const handleVote = async (proposalId: string) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ação Requer Autenticação', description: 'Inicie sessão para poder apoiar propostas.' });
      return;
    }

    const proposalRef = doc(firestore, 'communityProposals', proposalId);
    
    try {
        await updateDoc(proposalRef, {
            voteCount: increment(1),
            votedBy: arrayUnion(user.uid)
        });
        toast({ title: 'Obrigado pelo seu apoio!' });
    } catch (serverError: any) {
         const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'update',
          requestResourceData: { voteCount: 'increment(1)', votedBy: `arrayUnion(${user.uid})` },
        });
        errorEmitter.emit('permission-error', permissionError);
        
        toast({ variant: 'destructive', title: 'Erro ao votar', description: 'Poderá já ter votado nesta proposta ou ocorreu um erro de permissões.' });
    }
  }
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">O Povo Propõe</h1>
        <p className="text-muted-foreground">Submeta as suas próprias propostas de políticas e apoie as ideias da comunidade.</p>
      </div>

      <Dialog open={!!editingProposal} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Proposta</DialogTitle>
                <DialogDescription>Refine os detalhes da sua proposta. O corretor ortográfico do seu navegador está ativo.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEditProposalSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Textarea rows={6} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isEditing}>
                            {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />Submeter Nova Proposta</CardTitle>
          { user ? (
            <CardDescription>Descreva a sua ideia. O corretor ortográfico do seu navegador está ativo para ajudar.</CardDescription>
          ) : (
             <CardDescription className="!mt-2 flex items-center gap-2 text-amber-600">
                <User className="h-4 w-4" /> <span><Link href="/login" className="font-semibold text-primary hover:underline">Inicie sessão</Link> para submeter uma proposta.</span>
            </CardDescription>
          )}
        </CardHeader>
        { user && (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleNewProposalSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título da Proposta</FormLabel>
                                <FormControl><Input placeholder="Ex: Passe cultural gratuito para jovens até aos 25 anos" {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição Detalhada</FormLabel>
                                <FormControl><Textarea placeholder="Descreva a sua proposta, os seus objetivos e como poderia ser implementada." rows={5} {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submeter Proposta
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Propostas da Comunidade</h2>
        
        {isLoadingProposals && (
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
             </div>
        )}

        {!isLoadingProposals && proposals && proposals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {proposals.map((proposal) => {
               const hasVoted = !!(user && proposal.votedBy?.includes(user.uid));
               const timeAgo = proposal.createdAt ? formatDistanceToNow(proposal.createdAt.toDate(), { addSuffix: true, locale: pt }) : 'há algum tempo';
               const isOwner = !!(user && user.uid === proposal.userId);

              return (
              <Card key={proposal.id} className="flex flex-col">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={proposal.userPhotoURL} alt={proposal.userName} />
                                <AvatarFallback>{getInitials(proposal.userName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{proposal.userName}</p>
                                <p className="text-xs text-muted-foreground">Submetido {timeAgo}</p>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(proposal)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Tem a certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação é irreversível e irá apagar a proposta e todos os seus votos.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteProposal(proposal.id)}>Apagar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                  <CardTitle className="pt-4">{proposal.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground whitespace-pre-wrap">{proposal.description}</p>
                </CardContent>
                 <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-6">
                    <div className="flex items-center gap-2 font-bold text-lg text-primary">
                        <ThumbsUp className="h-5 w-5" />
                        <span>{proposal.voteCount}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={`/simulator?policy=${encodeURIComponent(proposal.description)}`}>
                                <GitCommit className="mr-2 h-4 w-4" />
                                Simular
                            </Link>
                        </Button>
                        <Button size="sm" onClick={() => handleVote(proposal.id)} disabled={!user || hasVoted || isOwner}>
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            {hasVoted ? 'Apoiado' : 'Apoiar'}
                        </Button>
                    </div>
                </CardFooter>
              </Card>
            )})}
          </div>
        ) : !isLoadingProposals && (
           <Card className="flex flex-col items-center justify-center text-center py-16">
            <CardHeader>
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <CardTitle className="mt-4">Nenhuma proposta encontrada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Seja o primeiro a submeter uma proposta à comunidade!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
