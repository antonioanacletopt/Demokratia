'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
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
import { Loader2, PlusCircle, Edit, Trash2, Globe, Server, Database, Inbox, MailWarning, MailCheck, Archive, Search, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

const dataSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  url: z.string().url("Por favor, introduza um URL válido."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  type: z.enum(['API', 'Website']),
  requiresAuth: z.boolean().default(false),
  authMethod: z.enum(['None', 'API Key', 'Bearer Token']).default('None'),
  credentials: z.string().optional(),
  isSystemSource: z.boolean().optional().default(false),
}).refine(data => {
  if (data.requiresAuth && data.authMethod === 'None') return false;
  return true;
}, { message: "Se requer autenticação, deve escolher um método.", path: ["authMethod"] })
  .refine(data => {
    if (data.requiresAuth && data.authMethod !== 'None' && (!data.credentials || data.credentials.length === 0)) return false;
    return true;
  }, { message: "Se requer autenticação, as credenciais são obrigatórias.", path: ["credentials"] });

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
  new: { label: 'Nova', icon: MailWarning, color: 'text-blue-500' },
  read: { label: 'Lida', icon: MailCheck, color: 'text-green-500' },
  archived: { label: 'Arquivada', icon: Archive, color: 'text-muted-foreground' },
};

function DataSourceForm({ source, onSave, onFinished, isSaving }: { source?: DataSourceFormValues, onSave: (data: DataSourceFormValues) => void, onFinished: () => void, isSaving: boolean }) {
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
          <FormItem><FormLabel>Nome da Fonte</FormLabel><FormControl><Input placeholder="Ex: INE" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Breve descrição." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem><FormLabel>Tipo de Fonte</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Website" /></FormControl><FormLabel className="font-normal">Website</FormLabel></FormItem>
            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="API" /></FormControl><FormLabel className="font-normal">API</FormLabel></FormItem>
          </RadioGroup></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="requiresAuth" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <FormLabel>Requer Autenticação</FormLabel>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />
        {requiresAuth && (
          <>
            <FormField control={form.control} name="authMethod" render={({ field }) => (
              <FormItem><FormLabel>Método</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="API Key">API Key</SelectItem><SelectItem value="Bearer Token">Bearer Token</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="credentials" render={({ field }) => (
              <FormItem><FormLabel>Credenciais</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        )}
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button></DialogClose>
          <Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{source ? 'Guardar' : 'Criar'}</Button>
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
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
  const [viewingRefutation, setViewingRefutation] = useState<Refutation | null>(null);

  const [dataSourceSearch, setDataSourceSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');

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

  const filteredDataSources = useMemo(() => {
    if (!dataSources) return [];
    if (!dataSourceSearch.trim()) return dataSources;
    const lowercased = dataSourceSearch.toLowerCase();
    return dataSources.filter(source => source.name.toLowerCase().includes(lowercased));
  }, [dataSources, dataSourceSearch]);

  const filteredMessages = useMemo(() => {
    if (!sortedMessages) return [];
    return sortedMessages.filter(msg => {
      const matchesFilter = statusFilter === 'all' || msg.status === statusFilter;
      if (!matchesFilter) return false;
      if (!messageSearch.trim()) return true;
      const lowercased = messageSearch.toLowerCase();
      return msg.subject.toLowerCase().includes(lowercased) || msg.userName.toLowerCase().includes(lowercased);
    });
  }, [sortedMessages, messageSearch, statusFilter]);

  useEffect(() => {
    if (!isUserLoading && (!user || user.email !== ADMIN_EMAIL)) {
      toast({ variant: 'destructive', title: 'Acesso Negado' });
      router.replace('/home');
    }
  }, [user, isUserLoading, router, toast]);

  const handleSaveDataSource = (data: DataSourceFormValues) => {
    setIsSaving(true);
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const docRef = doc(firestore, 'dataSources', id);
    updateDocumentNonBlocking(docRef, { ...data, id });
    setTimeout(() => {
      toast({ title: 'Fonte guardada!' });
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
        updateDocumentNonBlocking(docRef, dataSet);
      }
      toast({ title: 'Indicadores carregados!' });
    } catch (e) { toast({ variant: 'destructive', title: 'Erro' }); }
    finally { setIsSeedingPublic(false); }
  };

  const handleSeedStatisticalData = async () => {
    setIsSeedingStats(true);
    try {
      for (const dataSet of statisticalDataToSeed) {
        const docRef = doc(firestore, 'statisticalData', dataSet.id);
        updateDocumentNonBlocking(docRef, { ...dataSet, data: JSON.stringify(dataSet.data) });
      }
      toast({ title: 'Estatísticas carregadas!' });
    } catch (e) { toast({ variant: 'destructive', title: 'Erro' }); }
    finally { setIsSeedingStats(false); }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    try {
      for (const source of systemDataSources) {
        const id = source.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const docRef = doc(firestore, 'dataSources', id);
        updateDocumentNonBlocking(docRef, { ...source, id });
      }
      toast({ title: 'Fontes carregadas!' });
    } catch (e) { toast({ variant: 'destructive', title: 'Erro' }); }
    finally { setIsSeedingSources(false); }
  };

  const handleUpdateRefutationStatus = (id: string, status: 'approved' | 'rejected') => {
    updateDocumentNonBlocking(doc(firestore, 'refutations', id), { status, adminReviewDate: serverTimestamp() });
    toast({ title: 'Refutação atualizada!' });
  };

  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="flex h-full items-center justify-center py-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Painel de Administração</h1>
      <Tabs defaultValue="refutations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="refutations" className="gap-2"><ShieldAlert className="h-4 w-4" />Refutações</TabsTrigger>
          <TabsTrigger value="sources" className="gap-2"><Database className="h-4 w-4" />Dados</TabsTrigger>
          <TabsTrigger value="messages" className="gap-2"><Inbox className="h-4 w-4" />Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="refutations" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('refutation.adminTitle')}</CardTitle><CardDescription>Analise as correções da comunidade.</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow><TableHead>Utilizador</TableHead><TableHead>Alvo</TableHead><TableHead>Estado</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {!isLoadingRefutations && sortedRefutations.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">{ref.userName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ref.aiContentIdentifier}</TableCell>
                        <TableCell><Badge variant={ref.status === 'approved' ? 'default' : ref.status === 'rejected' ? 'destructive' : 'secondary'}>{t(`refutation.status.${ref.status}`)}</Badge></TableCell>
                        <TableCell className="text-xs">{ref.submissionDate ? formatDistanceToNow(ref.submissionDate.toDate(), { addSuffix: true, locale: pt }) : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Dialog open={viewingRefutation?.id === ref.id} onOpenChange={(o) => !o && setViewingRefutation(null)}>
                            <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => setViewingRefutation(ref)}>Rever</Button></DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader><DialogTitle>Revisão de Refutação</DialogTitle></DialogHeader>
                              <div className="space-y-4 my-4">
                                <div className="rounded-md border bg-muted p-4 text-sm"><h4 className="font-semibold mb-2">Explicação:</h4><p className="whitespace-pre-wrap">{ref.refutationText}</p></div>
                                {ref.evidenceLinks && <div className="rounded-md border p-4 text-sm"><h4 className="font-semibold mb-2">Provas:</h4><p className="whitespace-pre-wrap">{ref.evidenceLinks}</p></div>}
                              </div>
                              <DialogFooter className="gap-2">
                                <Button variant="outline" className="text-destructive" onClick={() => { handleUpdateRefutationStatus(ref.id, 'rejected'); setViewingRefutation(null); }}><XCircle className="mr-2 h-4 w-4" /> Rejeitar</Button>
                                <Button variant="default" onClick={() => { handleUpdateRefutationStatus(ref.id, 'approved'); setViewingRefutation(null); }}><CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Carregamento de Dados</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Button onClick={handleSeedPublicData} disabled={isSeedingPublic}>Indicadores</Button>
                <Button onClick={handleSeedStatisticalData} disabled={isSeedingStats}>Estatísticas</Button>
                <Button onClick={handleSeedDataSources} disabled={isSeedingSources}>Fontes</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fontes de Dados</CardTitle>
                <Button size="sm" onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border"><Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>{filteredDataSources.map(s => (
                    <TableRow key={s.id}><TableCell>{s.name}</TableCell><TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingSource(s); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    </TableCell></TableRow>
                  ))}</TableBody>
                </Table></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Mensagens</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border"><Table>
                <TableHeader><TableRow><TableHead>De</TableHead><TableHead>Assunto</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>{filteredMessages.map(m => (
                  <TableRow key={m.id}><TableCell>{m.userName}</TableCell><TableCell>{m.subject}</TableCell>
                    <TableCell className="text-right">
                      <Dialog><DialogTrigger asChild><Button variant="ghost">Ver</Button></DialogTrigger>
                      <DialogContent><DialogHeader><DialogTitle>{m.subject}</DialogTitle></DialogHeader><div className="bg-muted p-4 rounded">{m.message}</div></DialogContent></Dialog>
                    </TableCell></TableRow>
                ))}</TableBody>
              </Table></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingSource ? 'Editar' : 'Adicionar'} Fonte</DialogTitle></DialogHeader>
          <DataSourceForm source={editingSource} onSave={handleSaveDataSource} onFinished={() => setIsFormOpen(false)} isSaving={isSaving} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
