'use client';

import { useState } from 'react';
import Link from 'next/link';
import { collection, serverTimestamp, addDoc, updateDoc, doc, query, orderBy, increment, arrayUnion } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, MessageSquare, User, ThumbsUp, GitCommit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default function ProposalsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [newProposalDescription, setNewProposalDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const proposalsCollectionRef = useMemoFirebase(() => {
      if (!firestore) return null;
      // A consulta foi simplificada para ordenar apenas por 'voteCount' para evitar a necessidade de um índice composto,
      // que estava provavelmente a causar erros de permissão para utilizadores não autenticados.
      return query(collection(firestore, 'communityProposals'), orderBy('voteCount', 'desc'));
  }, [firestore]);

  const { data: proposals, isLoading: isLoadingProposals } = useCollection<CommunityProposal>(proposalsCollectionRef);

  const handleSaveProposal = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ação Requer Autenticação' });
      return;
    }
    
    if (!newProposalTitle.trim() || !newProposalDescription.trim()) {
      toast({ variant: 'destructive', title: 'Campos em falta', description: 'Por favor, preencha o título e a descrição.' });
      return;
    }

    setIsSaving(true);
    const proposalsCollection = collection(firestore, 'communityProposals');

    const proposalData = {
      userId: user.uid,
      userName: user.displayName || 'Utilizador Anónimo',
      userPhotoURL: user.photoURL || '',
      title: newProposalTitle,
      description: newProposalDescription,
      createdAt: serverTimestamp(),
      voteCount: 0,
      votedBy: [],
    };

    try {
        await addDoc(proposalsCollection, proposalData);
        toast({ title: 'Proposta submetida!', description: 'A sua proposta está visível para toda a comunidade.' });
        setNewProposalTitle('');
        setNewProposalDescription('');
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: proposalsCollection.path,
          operation: 'create',
          requestResourceData: proposalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Erro ao submeter', description: 'Não foi possível guardar a sua proposta.' });
    } finally {
        setIsSaving(false);
    }
  };

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
         // Because Firestore security rules might reject the update, we create a contextual error.
         // This is more likely to happen if the user has already voted.
         const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'update',
          requestResourceData: { voteCount: 'increment(1)', votedBy: `arrayUnion(${user.uid})` }, // Approximate data
        });
        errorEmitter.emit('permission-error', permissionError);
        
        // Also provide user-facing feedback
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Submeter Nova Proposta
          </CardTitle>
          { user ? (
            <CardDescription>Descreva a sua ideia. As propostas mais votadas podem ser destacadas na aplicação.</CardDescription>
          ) : (
             <CardDescription className="!mt-2 flex items-center gap-2 text-amber-600">
                <User className="h-4 w-4" /> <span><Link href="/login" className="font-semibold text-primary hover:underline">Inicie sessão</Link> para submeter uma proposta.</span>
            </CardDescription>
          )}
        </CardHeader>
        { user && (
            <>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="proposal-title">Título da Proposta</Label>
                    <Input
                    id="proposal-title"
                    placeholder="Ex: Passe cultural gratuito para jovens até aos 25 anos"
                    value={newProposalTitle}
                    onChange={(e) => setNewProposalTitle(e.target.value)}
                    disabled={isSaving}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="proposal-description">Descrição Detalhada</Label>
                    <Textarea
                    id="proposal-description"
                    placeholder="Descreva a sua proposta, os seus objetivos e como poderia ser implementada."
                    value={newProposalDescription}
                    onChange={(e) => setNewProposalDescription(e.target.value)}
                    rows={5}
                    disabled={isSaving}
                    />
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={handleSaveProposal} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submeter Proposta
                </Button>
                </CardFooter>
            </>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Propostas da Comunidade</h2>
        
        {isLoadingProposals && (
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
             </div>
        )}

        {!isLoadingProposals && proposals && proposals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {proposals.map((proposal) => {
               const hasVoted = user && proposal.votedBy.includes(user.uid);
               const timeAgo = proposal.createdAt ? formatDistanceToNow(proposal.createdAt.toDate(), { addSuffix: true, locale: pt }) : 'há algum tempo';

              return (
              <Card key={proposal.id} className="flex flex-col">
                <CardHeader>
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
                  <CardTitle className="pt-4">{proposal.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-4">{proposal.description}</p>
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
                        <Button size="sm" onClick={() => handleVote(proposal.id)} disabled={!user || hasVoted}>
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

    