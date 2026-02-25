'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Loader2, ThumbsUp, Edit, Trash2, Languages, RefreshCw, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AIResultButton } from '@/components/AIResultButton';

const MAX_CACHE_LENGTH = 1000;

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
        if (originalTitle.length > MAX_CACHE_LENGTH || originalDescription.length > MAX_CACHE_LENGTH) return;
        const cacheRef = collection(firestore, 'translations_cache');
        const q = query(cacheRef, where('originalText', '==', originalTitle), where('targetLanguage', '==', 'English'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const qDesc = query(cacheRef, where('originalText', '==', originalDescription), where('targetLanguage', '==', 'English'), limit(1));
          const snapDesc = await getDocs(qDesc);
          if (!snapDesc.empty) {
            setTranslated({ title: snap.docs[0].data().translatedText, desc: snapDesc.docs[0].data().translatedText });
            setShowOriginal(false);
          }
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
      const saveToCache = (orig: string, trans: string) => {
        if (orig.length > MAX_CACHE_LENGTH) return;
        addDoc(cacheRef, { originalText: orig, translatedText: trans, targetLanguage: 'English', createdAt: serverTimestamp() });
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
        <CardTitle className="text-xl">{currentTitle}</CardTitle>
        {language !== 'pt' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
            disabled={isTranslating} 
            className="h-8 text-[10px] uppercase font-bold tracking-wider border-accent/50 text-accent hover:bg-accent/10 hover:text-accent shrink-0"
          >
            {isTranslating ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : (translated ? <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> : <Languages className="h-3.5 w-3.5 mr-1.5" />)}
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
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposal, setEditingProposal] = useState<CommunityProposal | null>(null);
  
  const proposalsCollectionRef = useMemoFirebase(() => { if (!firestore) return null; return query(collection(firestore, 'communityProposals'), orderBy('voteCount', 'desc')); }, [firestore]);
  const { data: proposals, isLoading: isLoadingProposals } = useCollection<CommunityProposal>(proposalsCollectionRef);

  const filteredProposals = useMemo(() => {
    if (!proposals) return [];
    if (!searchTerm.trim()) return proposals;
    const low = searchTerm.toLowerCase();
    return proposals.filter(p => p.title.toLowerCase().includes(low) || p.description.toLowerCase().includes(low));
  }, [proposals, searchTerm]);
  
  const form = useForm<ProposalFormValues>({ 
    resolver: zodResolver(proposalFormSchema(t)), 
    defaultValues: { 
      title: searchParams.get('title') || '', 
      description: searchParams.get('description') || '' 
    } 
  });

  useEffect(() => {
    const title = searchParams.get('title');
    const desc = searchParams.get('description');
    if (title || desc) {
      form.reset({ title: title || '', description: desc || '' });
    }
  }, [searchParams, form]);

  const handleNewProposalSubmit = async (values: ProposalFormValues) => {
    if (!user || !firestore) return;
    setIsSubmitting(true);
    try {
        await addDoc(collection(firestore, 'communityProposals'), { userId: user.uid, userName: user.displayName || 'Anon', userPhotoURL: user.photoURL || '', title: values.title, description: values.description, createdAt: serverTimestamp(), voteCount: 0, votedBy: [], });
        toast({ title: t('common.success') });
        form.reset();
    } finally { setIsSubmitting(false); }
  };

  const handleEditProposalSubmit = async (values: ProposalFormValues) => {
    if (!user || !firestore || !editingProposal) return;
    setIsEditing(true);
    try { await updateDoc(doc(firestore, 'communityProposals', editingProposal.id), values); toast({ title: t('common.success') }); setEditingProposal(null); } finally { setIsEditing(false); }
  };

  const handleVote = async (id: string) => {
    if (!user || !firestore) return;
    await updateDoc(doc(firestore, 'communityProposals', id), { voteCount: increment(1), votedBy: arrayUnion(user.uid) });
    toast({ title: t('proposals.votedBtn') });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('proposals.title')}</h1>
        <p className="text-muted-foreground">{t('proposals.description')}</p>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('proposals.howItWorks')}
          </p>
        </div>
      </div>

      <Dialog open={!!editingProposal} onOpenChange={(o) => !o && setEditingProposal(null)}>
        <DialogContent><DialogHeader><DialogTitle>{t('proposals.editTitle')}</DialogTitle></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(handleEditProposalSubmit)} className="space-y-4 pt-4"><FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('proposals.titleLabel')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>{t('proposals.descLabel')}</FormLabel><FormControl><Textarea rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} /><DialogFooter><Button type="submit" disabled={isEditing}>{isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('common.save')}</Button></DialogFooter></form></Form></DialogContent>
      </Dialog>
      <Card><CardHeader><CardTitle>{t('proposals.newTitle')}</CardTitle></CardHeader>{ user ? (<Form {...form}><form onSubmit={form.handleSubmit(handleNewProposalSubmit)}><CardContent className="space-y-4"><FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('proposals.titleLabel')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>{t('proposals.descLabel')}</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} /></CardContent><CardFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('proposals.submitBtn')}</Button></CardFooter></form></Form>) : <CardContent><p className="text-muted-foreground">{t('nav.login')}</p></CardContent> }</Card>
      <div className="space-y-4">
        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">{t('proposals.communityTitle')}</h2><Input className="w-72" placeholder={t('proposals.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        {isLoadingProposals && <div className="grid gap-6 md:grid-cols-2"><Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader></Card><Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader></Card></div>}
        {!isLoadingProposals && filteredProposals.length > 0 ? (<div className="grid gap-6 md:grid-cols-2">{filteredProposals.map((p) => { const hasVoted = !!(user && p.votedBy?.includes(user.uid)); const isOwner = !!(user && user.uid === p.userId); return (<Card key={p.id} className="flex flex-col"><CardHeader><div className="flex justify-between items-center"><div className="flex items-center gap-3"><Avatar><AvatarImage src={p.userPhotoURL} /><AvatarFallback>{p.userName[0]}</AvatarFallback></Avatar><div><p className="font-semibold">{p.userName}</p></div></div>{isOwner && <div className="flex"><Button variant="ghost" size="icon" onClick={() => { setEditingProposal(p); form.reset({ title: p.title, description: p.description }); }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(firestore, 'communityProposals', p.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>}</div></CardHeader><CardContent className="flex-grow"><TranslatedContent originalTitle={p.title} originalDescription={p.description} /></CardContent><CardFooter className="flex justify-between bg-muted/50 p-4"><div className="flex items-center gap-2 font-bold"><ThumbsUp className="h-4 w-4" />{p.voteCount}</div><div className="flex gap-2"><AIResultButton href={`/simulations?policy=${encodeURIComponent(p.description)}`} label={t('common.simulate')} /><Button size="sm" onClick={() => handleVote(p.id)} disabled={!user || hasVoted || isOwner}>{hasVoted ? t('common.supported') : t('common.support')}</Button></div></CardFooter></Card>)})}</div>) : !isLoadingProposals && <p className="text-center py-12 text-muted-foreground">{t('common.noResults')}</p>}
      </div>
    </div>
  );
}