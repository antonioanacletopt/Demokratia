'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { systemDataSources, type DataSource } from '@/lib/system-data-sources';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Edit, Trash2, Database, Inbox, MailWarning, MailCheck, Archive, ShieldAlert, CheckCircle2, XCircle, Server, Globe, Sparkles, TrendingUp, BarChartBig, ExternalLink, ShieldCheck } from 'lucide-react';

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

const dataSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Min 3 chars."),
  url: z.string().url("Invalid URL."),
  description: z.string().min(10, "Min 10 chars."),
  type: z.enum(['API', 'Website']),
  requiresAuth: z.boolean().default(false),
  authMethod: z.enum(['None', 'API Key', 'Bearer Token']).default('None'),
  credentials: z.string().optional(),
  isSystemSource: z.boolean().optional().default(false),
});

type DataSourceFormValues = z.infer<typeof dataSourceSchema>;

interface ContactMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: any;
}

interface Refutation {
  id: string;
  userId: string;
  userName: string;
  aiContentIdentifier: string;
  refutationText: string;
  evidenceLinks?: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: any;
  adminNotes?: string;
}

const statusConfig = {
  new: { labelKey: 'contact.status.new', icon: MailWarning, color: 'text-blue-500' },
  read: { labelKey: 'contact.status.read', icon: MailCheck, color: 'text-green-500' },
  archived: { labelKey: 'contact.status.archived', icon: Archive, color: 'text-muted-foreground' },
};

function generateSlug(text: string): string {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function DataSourceForm({ source, onSave, onFinished, isSaving }: { source?: DataSourceFormValues, onSave: (data: DataSourceFormValues) => void, onFinished: () => void, isSaving: boolean }) {
  const { t } = useTranslation();
  const form = useForm<DataSourceFormValues>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: source || {
      name: '', url: '', description: '', type: 'Website',
      requiresAuth: false, authMethod: 'None', credentials: '', isSystemSource: false,
    },
  });

  const requiresAuth = form.watch('requiresAuth');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>{t('admin.sourceName')}</FormLabel><FormControl><Input placeholder="Ex: INE" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>{t('proposals.descLabel')}</FormLabel><FormControl><Textarea placeholder="..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem><FormLabel>{t('admin.sourceType')}</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Website" /></FormControl><FormLabel className="font-normal">Website</FormLabel></FormItem>
            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="API" /></FormControl><FormLabel className="font-normal">API</FormLabel></FormItem>
          </RadioGroup></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="requiresAuth" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <FormLabel>Auth Required</FormLabel>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />
        {requiresAuth && (
          <>
            <FormField control={form.control} name="authMethod" render={({ field }) => (
              <FormItem><FormLabel>Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="API Key">API Key</SelectItem><SelectItem value="Bearer Token">Bearer Token</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="credentials" render={({ field }) => (
              <FormItem><FormLabel>Credentials</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        )}
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="ghost" onClick={onFinished}>{t('common.cancel')}</Button></DialogClose>
          <Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{source ? t('common.save') : t('common.submit')}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | undefined>(undefined);
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const [isSeedingSources, setIsSeedingSources] = useState(false);
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);
  const [viewingRefutation, setViewingRefutation] = useState<Refutation | null>(null);

  const dataSourcesCollection = useMemoFirebase(() => collection(firestore, 'dataSources'), [firestore]);
  const { data: dataSources, isLoading: isLoadingDataSources } = useCollection<DataSource>(dataSourcesCollection);
  
  const contactMessagesCollection = useMemoFirebase(() => collection(firestore, 'contactMessages'), [firestore]);
  const { data: contactMessages, isLoading: isLoadingMessages } = useCollection<ContactMessage>(contactMessagesCollection);

  const refutationsCollection = useMemoFirebase(() => collection(firestore, 'refutations'), [firestore]);
  const { data: refutations, isLoading: isLoadingRefutations } = useCollection<Refutation>(refutationsCollection);
  
  const sortedMessages = useMemo(() => {
    if (!contactMessages) return [];
    return [...contactMessages].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [contactMessages]);

  const sortedRefutations = useMemo(() => {
    if (!refutations) return [];
    return [...refutations].sort((a, b) => (b.submissionDate?.seconds || 0) - (a.submissionDate?.seconds || 0));
  }, [refutations]);

  useEffect(() => {
    if (!isUserLoading && (!user || (user.email !== ADMIN_EMAIL && user.uid !== 'id5hDeMIVZeR9i9HG5vvqnjEto32'))) {
      toast({ variant: 'destructive', title: 'Access Denied' });
      router.replace('/home');
    }
  }, [user, isUserLoading, router, toast]);

  const handleMakeAdmin = async () => {
    if (!user) return;
    setIsSettingAdmin(true);
    try {
      const docRef = doc(firestore, 'roles_admin', user.uid);
      setDocumentNonBlocking(docRef, { 
        email: user.email, 
        displayName: user.displayName,
        assignedAt: serverTimestamp(),
        grantedBy: 'admin-panel'
      });
      toast({ title: 'Perfil de administrador ativado!' });
    } finally {
      setIsSettingAdmin(false);
    }
  };

  const handleSaveDataSource = (data: DataSourceFormValues) => {
    setIsSaving(true);
    const id = data.id || generateSlug(data.name);
    const docRef = doc(firestore, 'dataSources', id);
    setDocumentNonBlocking(docRef, { ...data, id }, { merge: true });
    setTimeout(() => {
      toast({ title: t('common.success') });
      setIsSaving(false);
      setIsFormOpen(false);
      setEditingSource(undefined);
    }, 1000);
  };

  const handleSeedPublicData = async () => {
    setIsSeedingPublic(true);
    try {
      for (const key in publicDataToSeed) {
        const dataSet = publicDataToSeed[key as DataSetKey];
        const docRef = doc(firestore, 'publicData', key);
        setDocumentNonBlocking(docRef, dataSet, { merge: true });
      }
      toast({ title: t('common.success') });
    } catch (e) { toast({ variant: 'destructive', title: t('common.error') }); }
    finally { setIsSeedingPublic(false); }
  };

  const handleSeedStatisticalData = async () => {
    setIsSeedingStats(true);
    try {
      for (const dataSet of statisticalDataToSeed) {
        const docRef = doc(firestore, 'statisticalData', dataSet.id);
        setDocumentNonBlocking(docRef, { ...dataSet, data: JSON.stringify(dataSet.data) }, { merge: true });
      }
      toast({ title: t('common.success') });
    } catch (e) { toast({ variant: 'destructive', title: t('common.error') }); }
    finally { setIsSeedingStats(false); }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    try {
      for (const source of systemDataSources) {
        const docRef = doc(firestore, 'dataSources', source.id);
        setDocumentNonBlocking(docRef, source, { merge: true });
      }
      toast({ title: t('common.success') });
    } catch (e) { toast({ variant: 'destructive', title: t('common.error') }); }
    finally { setIsSeedingSources(false); }
  };

  const handleUpdateRefutationStatus = (id: string, status: 'approved' | 'rejected') => {
    updateDocumentNonBlocking(doc(firestore, 'refutations', id), { status, adminReviewDate: serverTimestamp() });
    toast({ title: t('common.success') });
  };

  const handleDeleteDataSource = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'dataSources', id));
    toast({ title: t('common.success') });
  };

  const handleUpdateMessageStatus = (id: string, status: 'read' | 'archived') => {
    updateDocumentNonBlocking(doc(firestore, 'contactMessages', id), { status });
    toast({ title: t('common.success') });
  };

  if (isUserLoading || !user || (user.email !== ADMIN_EMAIL && user.uid !== 'id5hDeMIVZeR9i9HG5vvqnjEto32')) {
    return <div className="flex h-full items-center justify-center py-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('admin.title')}</h1>
          <p className="text-muted-foreground">{t('admin.description')}</p>
        </div>
      </div>

      <Tabs defaultValue="refutations" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="refutations" className="gap-2"><ShieldAlert className="h-4 w-4" />{t('admin.tabs.refutations')}</TabsTrigger>
          <TabsTrigger value="sources" className="gap-2"><Database className="h-4 w-4" />{t('admin.tabs.sources')}</TabsTrigger>
          <TabsTrigger value="messages" className="gap-2"><Inbox className="h-4 w-4" />{t('admin.tabs.messages')}</TabsTrigger>
          <TabsTrigger value="seed" className="gap-2"><Sparkles className="h-4 w-4" />{t('admin.tabs.seed')}</TabsTrigger>
        </TabsList>

        <TabsContent value="refutations" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('refutation.adminTitle')}</CardTitle><CardDescription>{t('admin.refutationsDesc')}</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow>
                    <TableHead>{t('refutation.user')}</TableHead>
                    <TableHead>{t('refutation.targetContent')}</TableHead>
                    <TableHead>{t('contact.status.title') || 'Status'}</TableHead>
                    <TableHead>{t('refutation.submission')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {!isLoadingRefutations && sortedRefutations.length > 0 ? sortedRefutations.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">{ref.userName}</TableCell>
                        <TableCell className="max-w-[200px] truncate italic text-muted-foreground">"{ref.aiContentIdentifier}"</TableCell>
                        <TableCell><Badge variant={ref.status === 'approved' ? 'default' : ref.status === 'rejected' ? 'destructive' : 'secondary'}>{t(`refutation.status.${ref.status}`)}</Badge></TableCell>
                        <TableCell className="text-xs">{ref.submissionDate ? formatDistanceToNow(ref.submissionDate.toDate(), { addSuffix: true, locale: pt }) : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Dialog open={viewingRefutation?.id === ref.id} onOpenChange={(o) => !o && setViewingRefutation(null)}>
                            <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => setViewingRefutation(ref)}>{t('common.view')}</Button></DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader><DialogTitle>{t('admin.reviewTitle')}</DialogTitle><DialogDescription>{t('admin.reviewBy')} {ref.userName} para "{ref.aiContentIdentifier}"</DialogDescription></DialogHeader>
                              <div className="space-y-4 my-4">
                                <div className="rounded-md border bg-muted/30 p-4 text-sm"><h4 className="font-semibold mb-2">{t('admin.userExplanation')}</h4><p className="whitespace-pre-wrap leading-relaxed">{ref.refutationText}</p></div>
                                {ref.evidenceLinks && <div className="rounded-md border border-accent/20 bg-accent/5 p-4 text-sm">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" />{t('admin.evidenceLinks')}</h4>
                                    <div className="space-y-2">
                                        {ref.evidenceLinks.split('\n').map((link, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <ExternalLink className="h-3 w-3 opacity-50" />
                                                <span className="break-all">{link}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>}
                              </div>
                              <DialogFooter className="gap-2">
                                <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => { handleUpdateRefutationStatus(ref.id, 'rejected'); setViewingRefutation(null); }}><XCircle className="mr-2 h-4 w-4" /> {t('admin.reject')}</Button>
                                <Button variant="default" onClick={() => { handleUpdateRefutationStatus(ref.id, 'approved'); setViewingRefutation(null); }}><CheckCircle2 className="mr-2 h-4 w-4" /> {t('admin.approve')}</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )) : !isLoadingRefutations && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">{t('refutation.noRefutations')}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>{t('admin.sourcesTitle')}</CardTitle><CardDescription>{t('admin.sourcesDesc')}</CardDescription></div>
              <Button size="sm" onClick={() => { setEditingSource(undefined); setIsFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />{t('admin.addSource')}</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow><TableHead>{t('admin.sourceName')}</TableHead><TableHead>{t('admin.sourceType')}</TableHead><TableHead>{t('admin.isSystem')}</TableHead><TableHead className="text-right">{t('common.actions')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {isLoadingDataSources ? <TableRow><TableCell colSpan={4} className="text-center py-8">{t('common.loading')}</TableCell></TableRow> : dataSources?.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="outline" className="gap-1.5">{s.type === 'API' ? <Server className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}{s.type}</Badge></TableCell>
                        <TableCell>{s.isSystemSource ? <Badge variant="secondary">Sim</Badge> : <span className="text-muted-foreground text-xs">User</span>}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingSource(s); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('admin.deleteSourceConfirm')}</AlertDialogTitle><AlertDialogDescription>{t('admin.deleteSourceDesc')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteDataSource(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('admin.messagesTitle')}</CardTitle><CardDescription>{t('admin.messagesDesc')}</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow><TableHead>{t('admin.from')}</TableHead><TableHead>{t('admin.subject')}</TableHead><TableHead>{t('admin.status')}</TableHead><TableHead className="text-right">{t('common.actions')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {isLoadingMessages ? <TableRow><TableCell colSpan={4} className="text-center py-8">{t('common.loading')}</TableCell></TableRow> : sortedMessages.length > 0 ? sortedMessages.map(m => (
                      <TableRow key={m.id} className={m.status === 'new' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                        <TableCell className="font-medium">{m.userName}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{m.subject}</TableCell>
                        <TableCell><Badge variant={m.status === 'new' ? 'default' : 'secondary'}>{t(statusConfig[m.status].labelKey)}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Dialog>
                            <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => m.status === 'new' && handleUpdateMessageStatus(m.id, 'read')}>{t('common.view')}</Button></DialogTrigger>
                            <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{m.subject}</DialogTitle><DialogDescription>{t('admin.from')}: {m.userName} ({m.userEmail})</DialogDescription></DialogHeader><div className="bg-muted/30 p-6 rounded-md border whitespace-pre-wrap mt-4 leading-relaxed">{m.message}</div></DialogContent>
                          </Dialog>
                          {m.status !== 'archived' && <Button variant="ghost" size="icon" onClick={() => handleUpdateMessageStatus(m.id, 'archived')} title={t('admin.archive')}><Archive className="h-4 w-4" /></Button>}
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">{t('contact.noMessagesTitle')}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seed" className="space-y-6">
          <Card className="border-primary bg-primary/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Ativação de Admin</CardTitle><CardDescription>Regista permanentemente o teu acesso nas regras de segurança.</CardDescription></CardHeader>
            <CardContent><Button onClick={handleMakeAdmin} disabled={isSettingAdmin}>{isSettingAdmin ? <Loader2 className="mr-2 animate-spin" /> : <ShieldCheck className="mr-2" />}Ativar Perfil de Administrador Oficial</Button></CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />{t('admin.seedTitle')}</CardTitle><CardDescription>{t('admin.seedDesc')}</CardDescription></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-3 p-4 rounded-lg border bg-background/50">
                <h3 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4" />{t('admin.indicators')}</h3>
                <p className="text-xs text-muted-foreground">{t('admin.indicatorsDesc')}</p>
                <Button onClick={handleSeedPublicData} disabled={isSeedingPublic} size="sm" className="mt-auto">
                  {isSeedingPublic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                  {t('admin.loadIndicators')}
                </Button>
              </div>
              <div className="flex flex-col gap-3 p-4 rounded-lg border bg-background/50">
                <h3 className="font-bold flex items-center gap-2"><BarChartBig className="h-4 w-4" />{t('admin.stats')}</h3>
                <p className="text-xs text-muted-foreground">{t('admin.statsDesc')}</p>
                <Button onClick={handleSeedStatisticalData} disabled={isSeedingStats} size="sm" className="mt-auto">
                  {isSeedingStats ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {t('admin.loadStats')}
                </Button>
              </div>
              <div className="flex flex-col gap-3 p-4 rounded-lg border bg-background/50">
                <h3 className="font-bold flex items-center gap-2"><Server className="h-4 w-4" />{t('admin.sourcesSeed')}</h3>
                <p className="text-xs text-muted-foreground">{t('admin.sourcesSeedDesc')}</p>
                <Button onClick={handleSeedDataSources} disabled={isSeedingSources} size="sm" className="mt-auto">
                  {isSeedingSources ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                  {t('admin.loadSources')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingSource ? t('admin.editSource') : t('admin.addSource')}</DialogTitle></DialogHeader>
          <DataSourceForm source={editingSource} onSave={handleSaveDataSource} onFinished={() => setIsFormOpen(false)} isSaving={isSaving} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
