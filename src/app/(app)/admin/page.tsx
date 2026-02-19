'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, doc, setDoc, query, where, orderBy } from 'firebase/firestore';
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
import { Loader2, PlusCircle, Edit, Trash2, Wrench, Globe, Server, Database, Inbox, MailWarning, MailCheck, Archive, ArchiveRestore, Search, Frown, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

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
  if (data.requiresAuth && data.authMethod === 'None') {
    return false;
  }
  return true;
}, { message: "Se requer autenticação, deve escolher um método.", path: ["authMethod"] })
  .refine(data => {
    if (data.requiresAuth && data.authMethod !== 'None' && (!data.credentials || data.credentials.length === 0)) {
      return false;
    }
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
      name: '',
      url: '',
      description: '',
      type: 'Website',
      requiresAuth: false,
      authMethod: 'None',
      credentials: '',
      isSystemSource: false,
    },
  });

  const requiresAuth = form.watch('requiresAuth');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Fonte</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Instituto Nacional de Estatística" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Breve descrição da fonte de dados." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Fonte</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Website" id="r1" />
                    </FormControl>
                    <FormLabel htmlFor="r1" className="font-normal">Website</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="API" id="r2" />
                    </FormControl>
                    <FormLabel htmlFor="r2" className="font-normal">API</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requiresAuth"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Requer Autenticação</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        {requiresAuth && (
          <>
            <FormField
              control={form.control}
              name="authMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Autenticação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="API Key">API Key</SelectItem>
                      <SelectItem value="Bearer Token">Bearer Token</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credenciais (Chave ou Token)</FormLabel>
                  <FormControl>
                    <Input placeholder="Colar a credencial aqui" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {source ? 'Guardar Alterações' : 'Criar Fonte'}
          </Button>
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
    return [...contactMessages].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return 0;
    });
  }, [contactMessages]);

  const sortedRefutations = useMemo(() => {
    if (!refutations) return [];
    return [...refutations].sort((a, b) => {
      if (a.submissionDate && b.submissionDate) {
        return b.submissionDate.seconds - a.submissionDate.seconds;
      }
      return 0;
    });
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
      return msg.subject.toLowerCase().includes(lowercased) ||
             msg.userName.toLowerCase().includes(lowercased) ||
             msg.userEmail.toLowerCase().includes(lowercased);
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
    const id = data.id || data.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (!data.requiresAuth) {
      data.authMethod = 'None';
      data.credentials = '';
    }

    const docRef = doc(firestore, 'dataSources', id);
    setDocumentNonBlocking(docRef, { ...data, id }, { merge: true });

    setTimeout(() => {
      toast({ title: 'Fonte de dados guardada!' });
      setIsSaving(false);
      handleDialogClose();
    }, 1000);
  };

  const handleDeleteDataSource = (source: DataSource) => {
    if (source.isSystemSource) {
      toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Não pode apagar uma fonte de dados do sistema.' });
      return;
    }
    const docRef = doc(firestore, 'dataSources', source.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Fonte de dados apagada.' });
  };
  
  const handleDialogClose = () => {
      setIsFormOpen(false);
      setEditingSource(undefined);
  }

  const handleSeedPublicData = async () => {
    setIsSeedingPublic(true);
    toast({ title: 'A semear os dados de indicadores...', description: 'A carregar dados públicos para o Firestore.' });

    try {
      const dataKeys = Object.keys(publicDataToSeed) as DataSetKey[];
      for (const key of dataKeys) {
        const dataSet = publicDataToSeed[key];
        const docRef = doc(firestore, 'publicData', key);
        await setDoc(docRef, dataSet);
      }
      toast({ title: 'Indicadores carregados!', description: 'Pode navegar para o Dashboard para os ver.' });
    } catch (error: any) {
      console.error("Error seeding public data: ", error);
      const permissionError = new FirestorePermissionError({ path: 'publicData', operation: 'create', requestResourceData: { detail: 'Batch write failed.' }});
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message || 'Verifique as permissões e tente novamente.' });
    } finally {
      setIsSeedingPublic(false);
    }
  };

  const handleSeedStatisticalData = async () => {
    setIsSeedingStats(true);
    toast({ title: 'A semear os dados estatísticos...', description: 'A carregar os dados para o Explorador.' });

    try {
      for (const dataSet of statisticalDataToSeed) {
        const docData = { ...dataSet, data: JSON.stringify(dataSet.data) };
        const docRef = doc(firestore, 'statisticalData', dataSet.id);
        await setDoc(docRef, docData);
      }
      toast({ title: 'Dados estatísticos carregados!', description: 'Pode navegar para o Explorador para os ver.' });
    } catch (error: any) {
      console.error("Error seeding statistical data: ", error);
      const permissionError = new FirestorePermissionError({ path: 'statisticalData', operation: 'create', requestResourceData: { detail: 'Batch write failed.' }});
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message || 'Verifique as permissões e tente novamente.' });
    } finally {
      setIsSeedingStats(false);
    }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    toast({ title: 'A semear as fontes de dados...', description: 'A carregar as fontes de dados do sistema.' });

    try {
      for (const source of systemDataSources) {
        const id = source.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const docRef = doc(firestore, 'dataSources', id);
        await setDoc(docRef, { ...source, id }, { merge: true });
      }
      toast({ title: 'Fontes de dados carregadas!', description: 'As fontes foram carregadas e estão visíveis abaixo.' });
    } catch (error: any) {
      console.error("Error seeding data sources: ", error);
      const permissionError = new FirestorePermissionError({ path: 'dataSources', operation: 'create', requestResourceData: { detail: 'Batch write failed.' }});
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Erro ao carregar fontes', description: error.message || 'Verifique as permissões e tente novamente.' });
    } finally {
      setIsSeedingSources(false);
    }
  };

  const handleUpdateMessageStatus = (message: ContactMessage, status: 'new' | 'read' | 'archived') => {
    const docRef = doc(firestore, 'contactMessages', message.id);
    updateDocumentNonBlocking(docRef, { status });
    toast({ title: 'Estado da mensagem atualizado!' });
  };

  const handleDeleteMessage = (message: ContactMessage) => {
    const docRef = doc(firestore, 'contactMessages', message.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Mensagem apagada.' });
  };

  const handleUpdateRefutationStatus = (refutationId: string, status: 'approved' | 'rejected') => {
    const docRef = doc(firestore, 'refutations', refutationId);
    updateDocumentNonBlocking(docRef, { status, adminReviewDate: serverTimestamp() });
    toast({ title: 'Refutação atualizada!' });
  };


  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">A verificar permissões...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Painel de Administração</h1>
            <p className="text-muted-foreground">Gira as fontes de dados, carregue dados iniciais e veja as mensagens.</p>
        </div>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sources" className="gap-2"><Database className="h-4 w-4" />Fontes e Dados</TabsTrigger>
          <TabsTrigger value="messages" className="gap-2"><Inbox className="h-4 w-4" />Caixa de Entrada</TabsTrigger>
          <TabsTrigger value="refutations" className="gap-2"><ShieldAlert className="h-4 w-4" />Refutações</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Carregar Dados Iniciais (Seed)</CardTitle>
                <CardDescription>
                  Estes botões populam a base de dados com os conjuntos de dados iniciais. 
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                        <h3 className="font-semibold">Indicadores</h3>
                        <p className="text-sm text-muted-foreground">Popula 'publicData'.</p>
                        <Button onClick={handleSeedPublicData} disabled={isSeedingPublic} className="mt-auto w-full">
                            {isSeedingPublic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Carregar
                        </Button>
                    </div>
                    <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                        <h3 className="font-semibold">Estatísticas</h3>
                        <p className="text-sm text-muted-foreground">Popula 'statisticalData'.</p>
                        <Button onClick={handleSeedStatisticalData} disabled={isSeedingStats} className="mt-auto w-full">
                            {isSeedingStats ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Carregar
                        </Button>
                    </div>
                    <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                        <h3 className="font-semibold">Fontes de Dados</h3>
                        <p className="text-sm text-muted-foreground">Popula 'dataSources'.</p>
                        <Button onClick={handleSeedDataSources} disabled={isSeedingSources} className="mt-auto w-full">
                            {isSeedingSources ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Carregar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Fontes de Dados</CardTitle>
                            <CardDescription className="mt-1.5">Configuração de APIs e Webhooks.</CardDescription>
                        </div>
                        <Dialog open={isFormOpen} onOpenChange={(open) => {
                            if (!open) handleDialogClose();
                            else setIsFormOpen(true);
                        }}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                <PlusCircle className="mr-2" />
                                Adicionar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>{editingSource ? 'Editar' : 'Adicionar'} Fonte de Dados</DialogTitle>
                                </DialogHeader>
                                <DataSourceForm 
                                source={editingSource} 
                                onSave={handleSaveDataSource}
                                onFinished={handleDialogClose}
                                isSaving={isSaving}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingDataSources && Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                        ))}
                        {!isLoadingDataSources && filteredDataSources?.map((source) => (
                        <TableRow key={source.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <span>{source.name}</span>
                                    {source.isSystemSource && <Badge variant="secondary">Sistema</Badge>}
                                </div>
                            </TableCell>
                            <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                                {source.type === 'API' ? <Server className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                                {source.type}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => {
                                setEditingSource(source);
                                setIsFormOpen(true);
                                }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={source.isSystemSource}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Tem a certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDataSource(source)}>Apagar</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Inbox />Caixa de Entrada</CardTitle>
                <CardDescription>Mensagens de contacto enviadas pelos utilizadores.</CardDescription>
                 <div className="flex flex-col gap-4 sm:flex-row pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Pesquisar..."
                            className="w-full pl-10"
                            value={messageSearch}
                            onChange={(e) => setMessageSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="new">Novas</SelectItem>
                            <SelectItem value="read">Lidas</SelectItem>
                            <SelectItem value="archived">Arquivadas</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                <Table>
                    <TableHeader><TableRow><TableHead>De</TableHead><TableHead>Assunto</TableHead><TableHead>Estado</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {isLoadingMessages && Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}><TableCell><Skeleton className="h-5 w-28" /></TableCell><TableCell><Skeleton className="h-5 w-36" /></TableCell><TableCell><Skeleton className="h-5 w-20" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell></TableRow>
                    ))}
                    {!isLoadingMessages && filteredMessages.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhuma mensagem.</TableCell></TableRow>
                    )}
                    {!isLoadingMessages && filteredMessages.map((msg) => {
                        const StatusIcon = statusConfig[msg.status].icon;
                        const timeAgo = msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true, locale: pt }) : 'N/A';
                        return (
                        <TableRow key={msg.id} className={msg.status === 'new' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}>
                            <TableCell className="font-medium">{msg.userName}</TableCell>
                            <TableCell>{msg.subject}</TableCell>
                            <TableCell>
                            <div className={`flex items-center gap-2 text-sm ${statusConfig[msg.status].color}`}>
                                <StatusIcon className="h-4 w-4" />
                                <span>{statusConfig[msg.status].label}</span>
                            </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{timeAgo}</TableCell>
                            <TableCell className="text-right">
                                <Dialog open={viewingMessage?.id === msg.id} onOpenChange={(open) => !open && setViewingMessage(null)}>
                                    <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => { setViewingMessage(msg); if(msg.status === 'new') handleUpdateMessageStatus(msg, 'read')}}>Ver</Button></DialogTrigger>
                                    <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{msg.subject}</DialogTitle><DialogDescription>De: {msg.userName} ({msg.userEmail})</DialogDescription></DialogHeader><div className="my-4 whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm">{msg.message}</div></DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateMessageStatus(msg, msg.status === 'archived' ? 'read' : 'archived')}><Archive className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(msg)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                        </TableRow>
                    )})}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="refutations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" />{t('refutation.adminTitle')}</CardTitle>
              <CardDescription>Reveja as refutações enviadas pelos utilizadores sobre os dados da IA.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilizador</TableHead>
                      <TableHead>Alvo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRefutations && Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))}
                    {!isLoadingRefutations && sortedRefutations.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center">{t('refutation.noRefutations')}</TableCell></TableRow>
                    )}
                    {!isLoadingRefutations && sortedRefutations.map((ref) => {
                      const timeAgo = ref.submissionDate ? formatDistanceToNow(ref.submissionDate.toDate(), { addSuffix: true, locale: pt }) : 'N/A';
                      return (
                        <TableRow key={ref.id}>
                          <TableCell className="font-medium">{ref.userName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{ref.aiContentIdentifier}</TableCell>
                          <TableCell>
                            <Badge variant={ref.status === 'approved' ? 'default' : ref.status === 'rejected' ? 'destructive' : 'secondary'}>
                              {t(`refutation.status.${ref.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{timeAgo}</TableCell>
                          <TableCell className="text-right">
                            <Dialog open={viewingRefutation?.id === ref.id} onOpenChange={(open) => !open && setViewingRefutation(null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setViewingRefutation(ref)}>Rever</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Revisão de Refutação</DialogTitle>
                                  <DialogDescription>De: {ref.userName} | Alvo: {ref.aiContentIdentifier}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 my-4">
                                  <div className="rounded-md border bg-muted p-4 text-sm">
                                    <h4 className="font-semibold mb-2">Explicação:</h4>
                                    <p className="whitespace-pre-wrap">{ref.refutationText}</p>
                                  </div>
                                  {ref.evidenceLinks && (
                                    <div className="rounded-md border p-4 text-sm">
                                      <h4 className="font-semibold mb-2">Provas/Links:</h4>
                                      <p className="whitespace-pre-wrap">{ref.evidenceLinks}</p>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button variant="outline" className="text-destructive" onClick={() => { handleUpdateRefutationStatus(ref.id, 'rejected'); setViewingRefutation(null); }}>
                                    <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                                  </Button>
                                  <Button variant="default" onClick={() => { handleUpdateRefutationStatus(ref.id, 'approved'); setViewingRefutation(null); }}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
