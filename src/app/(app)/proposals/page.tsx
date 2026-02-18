
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { collection, serverTimestamp, addDoc, updateDoc, doc, query, orderBy, increment, arrayUnion, deleteDoc, where, limit, getDocs } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
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
import { Loader2, ThumbsUp, Edit, Trash2, Languages, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
      
      const saveToCache = (orig: string, trans: string) => {
        addDoc(cacheRef, {
          originalText: orig,
          translatedText: trans,
          targetLanguage: targetLang,
          createdAt: serverTimestamp()
        });
      };

      saveToCache(originalTitle, resTitle);
      saveToCache(originalDescription, resDesc);
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
            {isTranslating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : translated ? <RefreshCw className="mr-1 h-3 w-3" /> : <Languages className="mr-1 h-3 w-3" />}
            {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap">{currentDesc}</p>
    </div>
  );
}

export default function ProposalsPage() {
  const { t } = useTranslation();
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
    const low = searchTerm.toLowerCase();
    return proposals.filter(p => p.title.toLowerCase().includes(low) || p.description.toLowerCase().includes(low) || p.userName.toLowerCase().includes(low));
  }, [proposals, searchTerm]);
  
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema(t)),
    defaultValues: { title: '', description: '' },
  });

  const handleOpenEditDialog = (proposal: CommunityProposal) => {
    setEditingProposal(proposal);
    form.reset({ title: proposal.title, description: proposal.description });
  };

  const handleCloseEditDialog = () => {
    setEditingProposal(null);
    form.reset({ title: '', description: '' });
  };
  
  const handleNewProposalSubmit = async (values: ProposalFormValues) => {
    if (!user || !firestore) return;
    setIsSubmitting(true);
    const data = {
      userId: user.uid,
      userName: user.displayName || 'Anon',
      userPhotoURL: user.photoURL || '',
      title: values.title,
      description: values.description,
      createdAt: serverTimestamp(),
      voteCount: 0,
      votedBy: [],
    };
    try {
        await addDoc(collection(firestore, 'communityProposals'), data);
        toast({ title: t('common.success') });
        form.reset();
    } finally { setIsSubmitting(false); }
  };

  const handleEditProposalSubmit = async (values: ProposalFormValues) => {
    if (!user || !firestore || !editingProposal) return;
    setIsEditing(true);
    try {
        await updateDoc(doc(firestore, 'communityProposals', editingProposal.id), values);
        toast({ title: t('common.success') });
        handleCloseEditDialog();
    } finally { setIsEditing(false); }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!user || !firestore) return;
    await deleteDoc(doc(firestore, 'communityProposals', id));
    toast({ title: t('common.success') });
  };

  const handleVote = async (id: string) => {
    if (!user || !firestore) return;
    await updateDoc(doc(firestore, 'communityProposals', id), {
        voteCount: increment(1),
        votedBy: arrayUnion(user.uid)
    });
    toast({ title: t('proposals.votedBtn') });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('proposals.title')}</h1>
        <p className="text-muted-foreground">{t('proposals.description')}</p>
      </div>

      <Dialog open={!!editingProposal} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent>
            <DialogHeader><DialogTitle>{t('proposals.editTitle')}</DialogTitle></DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEditProposalSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>{t('proposals.titleLabel')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>{t('proposals.descLabel')}</FormLabel><FormControl><Textarea rows={6} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <DialogFooter>
                        <Button type="submit" disabled={isEditing}>{isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('common.save')}</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader><CardTitle>{t('proposals.newTitle')}</CardTitle></CardHeader>
        { user ? (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleNewProposalSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>{t('proposals.titleLabel')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>{t('proposals.descLabel')}</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                    <CardFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('proposals.submitBtn')}</Button></CardFooter>
                </form>
            </Form>
        ) : <CardContent><p className="text-muted-foreground">{t('nav.login')}</p></CardContent> }
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">{t('proposals.communityTitle')}</h2>
          <Input className="w-full sm:w-72" placeholder={t('proposals.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        {isLoadingProposals ? (
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
             </div>
        ) : filteredProposals && filteredProposals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredProposals.map((p) => {
               const hasVoted = !!(user && p.votedBy?.includes(user.uid));
               const isOwner = !!(user && user.uid === p.userId);
               return (
              <Card key={p.id} className="flex flex-col">
                <CardHeader>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar><AvatarImage src={p.userPhotoURL} /><AvatarFallback>{p.userName[0]}</AvatarFallback></Avatar>
                            <div><p className="font-semibold">{p.userName}</p></div>
                        </div>
                        {isOwner && <div className="flex"><Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(p)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteProposal(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow"><TranslatedContent originalTitle={p.title} originalDescription={p.description} /></CardContent>
                <CardFooter className="flex justify-between bg-muted/50 p-4 rounded-b-lg">
                    <div className="flex items-center gap-2 font-bold"><ThumbsUp className="h-4 w-4" />{p.voteCount}</div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" asChild><Link href={`/simulations?policy=${encodeURIComponent(p.description)}`}>{t('common.simulate')}</Link></Button>
                        <Button size="sm" onClick={() => handleVote(p.id)} disabled={!user || hasVoted || isOwner}>{hasVoted ? t('common.supported') : t('common.support')}</Button>
                    </div>
                </CardFooter>
              </Card>
            )})}
          </div>
        ) : <p className="text-center py-12 text-muted-foreground">{t('common.noResults')}</p>}
      </div>
    </div>
  );
}
