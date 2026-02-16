'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { systemDataSources, type DataSource } from '@/lib/system-data-sources';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';

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
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Edit, Trash2, Wrench, Globe, Server, Database } from 'lucide-react';

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

  // State for data sources
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | undefined>(undefined);

  // State for seeding
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const [isSeedingSources, setIsSeedingSources] = useState(false);

  const dataSourcesCollection = useMemoFirebase(() => collection(firestore, 'dataSources'), [firestore]);
  const { data: dataSources, isLoading: isLoadingDataSources } = useCollection<DataSource>(dataSourcesCollection);

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
    // Use the robust non-blocking update
    setDocumentNonBlocking(docRef, { ...data, id }, { merge: true });

    // Optimistic UI update
    setTimeout(() => {
      toast({ title: 'Fonte de dados guardada!' });
      setIsSaving(false);
      handleDialogClose();
    }, 1000); // Give Firestore a moment
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

  // --- SEEDING LOGIC ---

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
            <p className="text-muted-foreground">Gira as fontes de dados e carregue dados iniciais.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            if (!open) handleDialogClose();
            else setIsFormOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Adicionar Fonte Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSource ? 'Editar' : 'Adicionar'} Fonte de Dados</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da fonte de dados.
              </DialogDescription>
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

      <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Carregar Dados Iniciais (Seed)</CardTitle>
            <CardDescription>Popule as coleções da base de dados com os conjuntos de dados iniciais. Esta operação só precisa de ser executada uma vez.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                 <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <h3 className="font-semibold">Dados de Indicadores</h3>
                    <p className="text-sm text-muted-foreground">Popula a coleção 'publicData' para o Dashboard.</p>
                    <Button onClick={handleSeedPublicData} disabled={isSeedingPublic} className="mt-auto">
                        {isSeedingPublic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSeedingPublic ? 'A carregar...' : 'Carregar Indicadores'}
                    </Button>
                </div>
                 <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <h3 className="font-semibold">Dados Estatísticos</h3>
                    <p className="text-sm text-muted-foreground">Popula a coleção 'statisticalData' para o Explorador.</p>
                    <Button onClick={handleSeedStatisticalData} disabled={isSeedingStats} className="mt-auto">
                        {isSeedingStats ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSeedingStats ? 'A carregar...' : 'Carregar Estatísticas'}
                    </Button>
                </div>
                <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <h3 className="font-semibold">Fontes de Dados do Sistema</h3>
                    <p className="text-sm text-muted-foreground">Popula a coleção 'dataSources' com as fontes de dados padrão.</p>
                     <Button onClick={handleSeedDataSources} disabled={isSeedingSources} className="mt-auto">
                        {isSeedingSources ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSeedingSources ? 'A carregar...' : 'Carregar Fontes'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Fontes de Dados Atuais</CardTitle>
            <CardDescription>Lista de todas as fontes de dados configuradas no sistema. As fontes do sistema são usadas pela IA.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">URL</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingDataSources && Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                    ))}
                    {!isLoadingDataSources && dataSources?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        Nenhuma fonte de dados encontrada. Carregue as fontes de dados do sistema acima.
                        </TableCell>
                    </TableRow>
                    )}
                    {!isLoadingDataSources && dataSources?.map((source) => (
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
                        <TableCell className="hidden md:table-cell">
                        <a href={source.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary truncate max-w-xs block">{source.url}</a>
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
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isto irá apagar permanentemente a fonte de dados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
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
    </div>
  );
}
