
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { collection, serverTimestamp, addDoc, updateDoc, doc, query, orderBy, increment, arrayUnion, deleteDoc, where, limit, getDocs } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@/lib/i18n';
import { getTranslation } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, MessageSquare, ThumbsUp, GitCommit, Edit, Trash2, Search, Frown, Languages, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { formatDistanceToNow } from 'date-fns';
import { pt, enGB } from 'date-fns/locale';

interface CommunityProposal {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  title: string;
  description: string;
  createdAt: any;
  voteCount: number;
  votedBy: string[];
}

const proposalFormSchema = (t: any) => z.object({
  title: z.string().min(10, t('proposals.titleMinError')),
  description: z.string().min(30, t('proposals.descMinError')),
});

type ProposalFormValues = z.infer<ReturnType<typeof proposalFormSchema>>;

function TranslatedContent({ originalTitle, originalDescription }: { originalTitle: string, originalDescription: string }) {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ title: string, desc: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (language === 'en') {
      const checkCache = async () => {
        const cacheRef = collection(firestore, 'translations_cache');
        const targetLang = 'English';
        
        const fetchCached = async (text: string) => {
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', targetLang), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };

        const [tTitle, tDesc] = await Promise.all([
          fetchCached(originalTitle),
          fetchCached(originalDescription)
        ]);

        if (tTitle && tDesc) {
          setTranslated({ title: tTitle, desc: tDesc });
          setShowOriginal(false);
        }
      };
      checkCache();
    } else {
      setTranslated(null);
      setShowOriginal(true);
    }
  }, [language, originalTitle, originalDescription, firestore]);

  const handleTranslate = () => {
    startTransition(async () => {
      const resTitle = await getTranslation(originalTitle, language);
      const resDesc = await getTranslation(originalDescription, language);
      
      setTranslated({ title: resTitle, desc: resDesc });
      setShowOriginal(false);

      const cacheRef = collection(firestore, 'translations_cache');
      const targetLang = language === 'en' ? 'English' : 'Portuguese';
      
      addDoc(cacheRef, {
        originalText: originalTitle,
        translatedText: resTitle,
        targetLanguage: targetLang,
        createdAt: serverTimestamp()
      });
      addDoc(cacheRef, {
        originalText: originalDescription,
        translatedText: resDesc,
        targetLanguage: targetLang,
        createdAt: serverTimestamp()
      });
    });
  };

  const currentTitle = !showOriginal && translated ? translated.title : originalTitle;
  const currentDesc = !showOriginal && translated ? translated.desc : originalDescription;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <CardTitle className="pt-0 text-xl">{currentTitle}</CardTitle>
        {language !== 'pt' && (
          <Button 
              variant="ghost" 
              size="sm" 
              onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
              disabled={isTranslating} 
              className="h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary shrink-0"
          >
            {isTranslating ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : translated ? (
                <RefreshCw className="mr-1 h-3 w-3" />
            ) : (
                <Languages className="mr-1 h-3 w-3" />
            )}
            {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
          </Button>
        )}
      </div>
      <div className="p-0">
        <p className="text-muted-foreground whitespace-pre-wrap">{currentDesc}</p>
        {!showOriginal && <p className="text-[10px] text-muted-foreground mt-2 italic">Translated by IA</p>}
      </div>
    </div>
  );
}

export default function ProposalsPage() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposal, setEditingProposal] = useState<CommunityProposal | null>(null);
  
  const proposalsCollectionRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'communityProposals'), orderBy('voteCount', 'desc'));
  }, [firestore]);

  const { data: proposals, isLoading: isLoadingProposals } = useCollection<CommunityProposal>(proposalsCollectionRef);

  const filteredProposals = useMemo(() => {
    if (!proposals) return [];
    if (!searchTerm.trim()) return proposals;

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return proposals.filter(
      (proposal) =>
        proposal.title.toLowerCase().includes(lowercasedSearchTerm) ||
        proposal.description.toLowerCase().includes(lowercasedSearchTerm) ||
        proposal.userName.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [proposals, searchTerm]);
  
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema(t)),
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
      toast({ variant: 'destructive', title: t('common.warning'), description: t('nav.login') });
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
        toast({ title: t('common.success'), description: t('proposals.successMsg') });
        form.reset();
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: proposalsCollection.path,
          operation: 'create',
          requestResourceData: proposalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: t('common.error') });
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
        toast({ title: t('common.success') });
        handleCloseEditDialog();
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'update',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: t('common.error') });
    } finally {
        setIsEditing(false);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!user || !firestore) return;
    const proposalRef = doc(firestore, 'communityProposals', proposalId);
    try {
        await deleteDoc(proposalRef);
        toast({ title: t('common.success') });
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: t('common.error') });
    }
  };

  const handleVote = async (proposalId: string) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: t('common.warning'), description: t('nav.login') });
      return;
    }

    const proposalRef = doc(firestore, 'communityProposals', proposalId);
    
    try {
        await updateDoc(proposalRef, {
            voteCount: increment(1),
            votedBy: arrayUnion(user.uid)
        });
        toast({ title: t('proposals.votedBtn') });
    } catch (serverError: any) {
         const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'update',
          requestResourceData: { voteCount: 'increment(1)', votedBy: `arrayUnion(${user.uid})` },
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: t('common.error') });
    }
  };
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('proposals.title')}</h1>
        <p className="text-muted-foreground">{t('proposals.description')}</p>
      </div>

      <Dialog open={!!editingProposal} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('proposals.editTitle')}</DialogTitle>
                <DialogDescription>{t('proposals.editDesc')}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEditProposalSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('proposals.titleLabel')}</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('proposals.descLabel')}</FormLabel>
                            <FormControl><Textarea rows={6} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">{t('common.cancel')}</Button></DialogClose>
                        <Button type="submit" disabled={isEditing}>
                            {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />{t('proposals.newTitle')}</CardTitle>
          { user ? (
            <CardDescription>{t('proposals.newDesc')}</CardDescription>
          ) : (
             <div className="!mt-2 flex items-center gap-2 text-amber-600 text-sm">
                <ThumbsUp className="h-4 w-4" /> <span><Link href="/login" className="font-semibold text-primary hover:underline">{t('nav.login')}</Link> {t('proposals.loginToSubmit')}</span>
            </div>
          )}
        </CardHeader>
        { user && (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleNewProposalSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('proposals.titleLabel')}</FormLabel>
                                <FormControl><Input placeholder={t('proposals.titlePlaceholder')} {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('proposals.descLabel')}</FormLabel>
                                <FormControl><Textarea placeholder={t('proposals.descPlaceholder')} rows={5} {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('proposals.submitBtn')}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        )}
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold font-headline tracking-tight">{t('proposals.communityTitle')}</h2>
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('proposals.searchPlaceholder')}
              className="w-full sm:w-72 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoadingProposals && (
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
             </div>
        )}

        {!isLoadingProposals && filteredProposals && filteredProposals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredProposals.map((proposal) => {
               const hasVoted = !!(user && proposal.votedBy?.includes(user.uid));
               const locale = language === 'pt' ? pt : enGB;
               const timeAgo = proposal.createdAt ? formatDistanceToNow(proposal.createdAt.toDate(), { addSuffix: true, locale }) : '...';
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
                                <p className="text-xs text-muted-foreground">{timeAgo}</p>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(proposal)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>{t('common.warning')}</AlertDialogTitle><AlertDialogDescription>{t('profile.deleteWarning')}</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteProposal(proposal.id)}>{t('common.delete')}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                  <TranslatedContent originalTitle={proposal.title} originalDescription={proposal.description} />
                </CardContent>
                 <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-6 rounded-b-lg">
                    <div className="flex items-center gap-2 font-bold text-lg text-primary">
                        <ThumbsUp className="h-5 w-5" />
                        <span>{proposal.voteCount}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={`/simulations?policy=${encodeURIComponent(proposal.description)}`}>
                                <GitCommit className="mr-2 h-4 w-4" />
                                {t('common.simulate')}
                            </Link>
                        </Button>
                        <Button size="sm" onClick={() => handleVote(proposal.id)} disabled={!user || hasVoted || isOwner}>
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            {hasVoted ? t('common.supported') : t('common.support')}
                        </Button>
                    </div>
                </CardFooter>
              </Card>
            )})}
          </div>
        ) : !isLoadingProposals && (
           <Card className="flex flex-col items-center justify-center text-center py-16">
            <CardHeader>
                {searchTerm ? <Frown className="mx-auto h-12 w-12 text-muted-foreground/50" /> : <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />}
                <CardTitle className="mt-4">{searchTerm ? t('proposals.noProposalsTitle') : t('proposals.noProposalsDesc')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {searchTerm ? t('common.noResults') : t('proposals.noProposalsDesc')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
