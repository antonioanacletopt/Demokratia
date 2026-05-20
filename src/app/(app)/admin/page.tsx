'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useCollection, dbSet, dbDelete, dbUpdate, nowTs } from '@/firebase';
import { getSystemDataSources, type DataSource } from '@/lib/system-data-sources';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';
import { formatDistanceToNow } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';
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
import { Loader2, PlusCircle, Edit, Trash2, Database, Inbox, MailWarning, MailCheck, Archive, ShieldAlert, CheckCircle2, XCircle, Server, Globe, Sparkles, TrendingUp, BarChartBig, ExternalLink, ShieldCheck, FileSpreadsheet, Fingerprint, Users, UserCheck, Eye, MousePointer2, Zap, User, Scale, RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? '';

const dataSourceSchema = (t: any) => z.object({
  id: z.string().optional(),
  name: z.string().min(3, t('admin.dataSourceNameError')),
  url: z.string().url(t('admin.dataSourceUrlError')),
  description: z.string().min(10, t('admin.dataSourceDescError')),
  type: z.enum(['API', 'Website']),
  requiresAuth: z.boolean().default(false),
  authMethod: z.enum(['None', 'API Key', 'Bearer Token']).default('None'),
  credentials: z.string().optional(),
  isSystemSource: z.boolean().optional().default(false),
});

type DataSourceFormValues = z.infer<ReturnType<typeof dataSourceSchema>>;

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

interface StatisticalData {
  id: string;
  title: string;
  category: string;
  source: string;
  description: string;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: any;
}

interface AnalyticsSession {
  id: string;
  isAnonymous: boolean;
  timestamp: any;
}

interface PublicSimulation {
  id: string;
  userName: string;
  title: string;
  inputVariables: string;
  runTimestamp: any;
}

interface PublicFactCheck {
  id: string;
  claim: string;
  verdict: string;
  createdAt: any;
}

interface PublicLegislation {
  id: string;
  question: string;
  createdAt: any;
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
    resolver: zodResolver(dataSourceSchema(t)),
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
            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Website" /></FormControl><FormLabel className="font-normal">{t('admin.website')}</FormLabel></FormItem>
            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="API" /></FormControl><FormLabel className="font-normal">{t('admin.api')}</FormLabel></FormItem>
          </RadioGroup></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="requiresAuth" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <FormLabel>{t('admin.authRequired')}</FormLabel>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />
        {requiresAuth && (
          <>
            <FormField control={form.control} name="authMethod" render={({ field }) => (
              <FormItem><FormLabel>{t('admin.authMethod')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="API Key">{t('admin.apiKey')}</SelectItem><SelectItem value="Bearer Token">{t('admin.bearer')}</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="credentials" render={({ field }) => (
              <FormItem><FormLabel>{t('admin.credentials')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
  const { toast } = useToast();
  const router = useRouter();
  const { t, language } = useTranslation();
  
  const systemDataSources = getSystemDataSources(t);
  const dateLocale = language === 'pt' ? pt : enUS;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | undefined>(undefined);
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const [isSeedingSources, setIsSeedingSources] = useState(false);
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);
  const [viewingRefutation, setViewingRefutation] = useState<Refutation | null>(null);
  const [cacheStatuses, setCacheStatuses] = useState<any[]>([]);
  const [isLoadingCache, setIsLoadingCache] = useState(false);
  const [refreshingType, setRefreshingType] = useState<string | null>(null);

  const { data: dataSources, isLoading: isLoadingDataSources } = useCollection<any>('dataSources');
  const { data: contactMessages, isLoading: isLoadingMessages } = useCollection<ContactMessage>('contactMessages');
  const { data: refutations, isLoading: isLoadingRefutations } = useCollection<Refutation>('refutations');
  const { data: statsData, isLoading: isLoadingStats } = useCollection<StatisticalData>('statisticalData');
  const { data: appUsers, isLoading: isLoadingUsers } = useCollection<UserProfile>('users');
  const { data: analyticsSessions, isLoading: isLoadingSessions } = useCollection<AnalyticsSession>('analytics_sessions');
  const { data: publicSims, isLoading: isLoadingPublicSims } = useCollection<PublicSimulation>('publicSimulations');
  const { data: publicFactChecks, isLoading: isLoadingPublicFactChecks } = useCollection<PublicFactCheck>('publicFactChecks');
  const { data: publicLegislation, isLoading: isLoadingPublicLegislation } = useCollection<PublicLegislation>('publicLegislationQueries');
  
  const sortedMessages = useMemo(() => {
    if (!contactMessages) return [];
    return [...contactMessages].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [contactMessages]);

  const sortedRefutations = useMemo(() => {
    if (!refutations) return [];
    return [...refutations].sort((a, b) => (b.submissionDate?.seconds || 0) - (a.submissionDate?.seconds || 0));
  }, [refutations]);

  const sortedStats = useMemo(() => {
    if (!statsData) return [];
    return [...statsData].sort((a, b) => a.title.localeCompare(b.title));
  }, [statsData]);

  const sortedUsers = useMemo(() => {
    if (!appUsers) return [];
    return [...appUsers].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [appUsers]);

  const sortedPublicSims = useMemo(() => {
    if (!publicSims) return [];
    return [...publicSims].sort((a, b) => (b.runTimestamp?.seconds || 0) - (a.runTimestamp?.seconds || 0));
  }, [publicSims]);

  const sortedPublicFactChecks = useMemo(() => {
    if (!publicFactChecks) return [];
    return [...publicFactChecks].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [publicFactChecks]);

  const sortedPublicLegislation = useMemo(() => {
    if (!publicLegislation) return [];
    return [...publicLegislation].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [publicLegislation]);

  const sessionStats = useMemo(() => {
    if (!analyticsSessions) return { total: 0, anon: 0, reg: 0 };
    return {
      total: analyticsSessions.length,
      anon: analyticsSessions.filter(s => s.isAnonymous).length,
      reg: analyticsSessions.filter(s => !s.isAnonymous).length,
    };
  }, [analyticsSessions]);

  useEffect(() => {
    if (!isUserLoading && (!user || (user.email !== ADMIN_EMAIL && user.uid !== ADMIN_UID))) {
      toast({ variant: 'destructive', title: t('admin.accessDenied') });
      router.replace('/home');
    }
  }, [user, isUserLoading, router, toast, t]);

  const handleMakeAdmin = async () => {
    if (!user) return;
    setIsSettingAdmin(true);
    try {
      await dbSet('roles_admin', user.uid, {
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        assignedAt: nowTs(),
        grantedBy: 'admin-panel'
      });
      toast({ title: t('admin.adminProfileActivated') });
    } finally {
      setIsSettingAdmin(false);
    }
  };

  const handleSaveDataSource = (data: DataSourceFormValues) => {
    setIsSaving(true);
    const id = data.id || generateSlug(data.name);
    dbSet('dataSources', id, { ...data, id });
    setTimeout(() => {
      toast({ title: t('common.success') });
      setIsSaving(false);
      setIsFormOpen(false);
      setEditingSource(undefined);
    }, 1000);
  };

  const handleApproveSource = (id: string) => {
    dbUpdate('dataSources', id, { isSystemSource: true, status: 'approved' });
    toast({ title: t('common.success') });
  };

  const handleSeedPublicData = async () => {
    setIsSeedingPublic(true);
    try {
      for (const key in publicDataToSeed) {
        const dataSet = publicDataToSeed(t)[key as DataSetKey];
        await dbSet('publicData', key, dataSet);
      }
      toast({ title: t('common.success') });
    } catch (e) { toast({ variant: 'destructive', title: t('common.error') }); }
    finally { setIsSeedingPublic(false); }
  };

  const handleSeedStatisticalData = async () => {
    setIsSeedingStats(true);
    try {
      for (const dataSet of statisticalDataToSeed(t)) {
        await dbSet('statisticalData', dataSet.id, { ...dataSet, data: JSON.stringify(dataSet.data) });
      }
      toast({ title: t('common.success') });
    } catch (e) { toast({ variant: 'destructive', title: t('common.error') }); }
    finally { setIsSeedingStats(false); }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    try {
      for (const source of systemDataSources) {
        await dbSet('dataSources', source.id, source as unknown as Record<string, unknown>);
      }
      toast({ title: t('common.success') });
    } catch (e) { toast({ variant: 'destructive', title: t('common.error') }); }
    finally { setIsSeedingSources(false); }
  };

  const handleUpdateRefutationStatus = (id: string, status: 'approved' | 'rejected') => {
    dbUpdate('refutations', id, { status, adminReviewDate: nowTs() });
    toast({ title: t('common.success') });
  };

  const handleDeleteDataSource = (id: string) => {
    dbDelete('dataSources', id);
    toast({ title: t('common.success') });
  };

  const handleDeleteStatisticalData = (id: string) => {
    dbDelete('statisticalData', id);
    toast({ title: t('common.success') });
  };

  const handleDeletePublicSimulation = (id: string) => {
    dbDelete('publicSimulations', id);
    toast({ title: t('common.success') });
  };

  const handleDeletePublicFactCheck = (id: string) => {
    dbDelete('publicFactChecks', id);
    toast({ title: t('common.success') });
  };

  const handleDeletePublicLegislation = (id: string) => {
    dbDelete('publicLegislationQueries', id);
    toast({ title: t('common.success') });
  };

  const handleUpdateMessageStatus = (id: string, status: 'read' | 'archived') => {
    dbUpdate('contactMessages', id, { status });
    toast({ title: t('common.success') });
  };

  const loadCacheStatuses = async () => {
    if (!user) return;
    setIsLoadingCache(true);
    try {
      const res = await fetch('/api/admin/cache', { headers: { Authorization: `Bearer ${user.uid}` } });
      const json = await res.json() as { statuses?: any[] };
      setCacheStatuses(json.statuses ?? []);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar estado do cache' });
    } finally {
      setIsLoadingCache(false);
    }
  };

  const handleRefreshCache = async (dataType: string) => {
    if (!user) return;
    setRefreshingType(dataType);
    try {
      const res = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.uid}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType }),
      });
      const json = await res.json() as { success?: boolean; status?: string; error?: string };
      if (json.success) {
        toast({ title: `Cache "${dataType}" actualizado`, description: `Status: ${json.status}` });
        await loadCacheStatuses();
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: json.error });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao actualizar cache' });
    } finally {
      setRefreshingType(null);
    }
  };

  if (isUserLoading || !user || (user.email !== ADMIN_EMAIL && user.uid !== ADMIN_UID)) {
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

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 flex flex-wrap h-auto">
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />{t('admin.tabs.users')}</TabsTrigger>
          <TabsTrigger value="simulations" className="gap-2"><Zap className="h-4 w-4" />{t('admin.tabs.simulations')}</TabsTrigger>
          <TabsTrigger value="factchecks" className="gap-2"><ShieldAlert className="h-4 w-4" />{t('admin.tabs.factchecks')}</TabsTrigger>
          <TabsTrigger value="legislation" className="gap-2"><Scale className="h-4 w-4" />{t('admin.tabs.legislation')}</TabsTrigger>
          <TabsTrigger value="refutations" className="gap-2"><ShieldAlert className="h-4 w-4" />{t('admin.tabs.refutations')}</TabsTrigger>
          <TabsTrigger value="sources" className="gap-2"><Database className="h-4 w-4" />{t('admin.tabs.sources')}</TabsTrigger>
          <TabsTrigger value="data" className="gap-2"><FileSpreadsheet className="h-4 w-4" />{t('admin.tabs.data')}</TabsTrigger>
          <TabsTrigger value="messages" className="gap-2"><Inbox className="h-4 w-4" />{t('admin.tabs.messages')}</TabsTrigger>
          <TabsTrigger value="seed" className="gap-2"><Sparkles className="h-4 w-4" />{t('admin.tabs.seed')}</TabsTrigger>
          <TabsTrigger value="cache" className="gap-2" onClick={loadCacheStatuses}><RefreshCw className="h-4 w-4" />Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">{t('admin.totalUsers')}</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2"><UserCheck className="h-6 w-6 text-primary" /> {isLoadingUsers ? '...' : sortedUsers.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">{t('admin.totalAccesses')}</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2"><Eye className="h-6 w-6 text-accent" /> {isLoadingSessions ? '...' : sessionStats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">{t('admin.anonymousAccesses')}</CardDescription>
                <CardTitle className="text-xl">{isLoadingSessions ? '...' : sessionStats.anon}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs uppercase font-bold tracking-wider">{t('admin.registeredAccesses')}</CardDescription>
                <CardTitle className="text-xl">{isLoadingSessions ? '...' : sessionStats.reg}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" />{t('admin.usersTitle')}</CardTitle>
              <CardDescription>{t('admin.usersDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow>
                    <TableHead>{t('profile.displayName')}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>{t('admin.registrationDate')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {isLoadingUsers ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8">{t('common.loading')}</TableCell></TableRow>
                    ) : sortedUsers.length > 0 ? sortedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.displayName || 'Anon'}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-xs">
                          {u.createdAt ? formatDistanceToNow(u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt), { addSuffix: true, locale: dateLocale }) : t('common.na')}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">{t('admin.noUsers')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />{t('admin.simulationsTitle')}</CardTitle>
              <CardDescription>{t('admin.simulationsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>{t('admin.simTitleInput')}</TableHead>
                      <TableHead>{t('scenarios.citizen')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPublicSims ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8">{t('common.loading')}</TableCell></TableRow>
                    ) : sortedPublicSims.length > 0 ? sortedPublicSims.map((sim) => (
                      <TableRow key={sim.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {sim.title || sim.inputVariables}
                          <br />
                          <code className="text-[10px] bg-muted px-1 rounded text-muted-foreground">{sim.id}</code>
                        </TableCell>
                        <TableCell className="text-sm">{sim.userName}</TableCell>
                        <TableCell className="text-xs">
                          {sim.runTimestamp ? formatDistanceToNow(sim.runTimestamp.toDate(), { addSuffix: true, locale: dateLocale }) : t('common.na')}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('common.warning')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('common.confirm_delete')}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePublicSimulation(sim.id)} className="bg-destructive text-destructive-foreground">{t('common.delete')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">{t('admin.noPublicSimulations')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factchecks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" />{t('admin.factchecksTitle')}</CardTitle>
              <CardDescription>{t('admin.factchecksDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>{t('factCheck.claim')}</TableHead>
                      <TableHead>{t('factCheck.verdict')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPublicFactChecks ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8">{t('common.loading')}</TableCell></TableRow>
                    ) : sortedPublicFactChecks.length > 0 ? sortedPublicFactChecks.map((fc) => (
                      <TableRow key={fc.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {fc.claim}
                          <br />
                          <code className="text-[10px] bg-muted px-1 rounded text-muted-foreground">{fc.id}</code>
                        </TableCell>
                        <TableCell><Badge variant="outline">{fc.verdict}</Badge></TableCell>
                        <TableCell className="text-xs">
                          {fc.createdAt ? formatDistanceToNow(fc.createdAt.toDate(), { addSuffix: true, locale: dateLocale }) : t('common.na')}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('common.warning')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('common.confirm_delete')}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePublicFactCheck(fc.id)} className="bg-destructive text-destructive-foreground">{t('common.delete')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">{t('admin.noPublicFactChecks')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legislation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" />{t('admin.legislationTitle')}</CardTitle>
              <CardDescription>{t('admin.legislationDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>{t('legislation.question')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPublicLegislation ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8">{t('common.loading')}</TableCell></TableRow>
                    ) : sortedPublicLegislation.length > 0 ? sortedPublicLegislation.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium max-w-[400px] truncate">
                          {l.question}
                          <br />
                          <code className="text-[10px] bg-muted px-1 rounded text-muted-foreground">{l.id}</code>
                        </TableCell>
                        <TableCell className="text-xs">
                          {l.createdAt ? formatDistanceToNow(l.createdAt.toDate(), { addSuffix: true, locale: dateLocale }) : t('common.na')}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('common.warning')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('common.confirm_delete')}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePublicLegislation(l.id)} className="bg-destructive text-destructive-foreground">{t('common.delete')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">{t('admin.noPublicLegislation')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refutations" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('refutation.adminTitle')}</CardTitle><CardDescription>{t('admin.refutationsDesc')}</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow>
                    <TableHead>{t('refutation.user')}</TableHead>
                    <TableHead>{t('refutation.targetContent')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead>{t('refutation.submission')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {!isLoadingRefutations && sortedRefutations.length > 0 ? sortedRefutations.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">{ref.userName}</TableCell>
                        <TableCell className="max-w-[200px] truncate italic text-muted-foreground">"{ref.aiContentIdentifier}"</TableCell>
                        <TableCell><Badge variant={ref.status === 'approved' ? 'default' : ref.status === 'rejected' ? 'destructive' : 'secondary'}>{t(`refutation.status.${ref.status}`)}</Badge></TableCell>
                        <TableCell className="text-xs">{ref.submissionDate ? formatDistanceToNow(ref.submissionDate.toDate(), { addSuffix: true, locale: dateLocale }) : t('common.na')}</TableCell>
                        <TableCell className="text-right">
                          <Dialog open={viewingRefutation?.id === ref.id} onOpenChange={(o) => !o && setViewingRefutation(null)}>
                            <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => setViewingRefutation(ref)}>{t('common.view')}</Button></DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader><DialogTitle>{t('admin.reviewTitle')}</DialogTitle><DialogDescription>{t('admin.reviewBy')} {ref.userName} {t('admin.for')} "{ref.aiContentIdentifier}"</DialogDescription></DialogHeader>
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
                    )) : !isLoadingRefutations && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">{t('admin.noRefutations')}</TableCell></TableRow>}
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
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>{t('admin.sourceName')}</TableHead>
                      <TableHead>{t('admin.sourceType')}</TableHead>
                      <TableHead>{t('admin.origin')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingDataSources ? <TableRow><TableCell colSpan={4} className="text-center py-8">{t('common.loading')}</TableCell></TableRow> : dataSources?.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {s.name}
                          {s.status === 'pending' && <Badge variant="destructive" className="ml-2">{t('admin.suggestion')}</Badge>}
                        </TableCell>
                        <TableCell><Badge variant="outline" className="gap-1.5">{s.type === 'API' ? <Server className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}{s.type}</Badge></TableCell>
                        <TableCell>
                          {s.isSystemSource ? <Badge variant="secondary">{t('admin.system')}</Badge> : (
                            <div className="flex flex-col">
                              <span className="text-xs flex items-center gap-1"><User className="h-3 w-3" /> {s.submittedByName || t('refutation.user')}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {s.status === 'pending' && (
                            <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApproveSource(s.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> {t('admin.approve')}
                            </Button>
                          )}
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

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.tabs.data')}</CardTitle>
              <CardDescription>{t('admin.dataDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow>
                    <TableHead>{t('proposals.titleLabel')}</TableHead>
                    <TableHead className="flex items-center gap-1"><Fingerprint className="h-3 w-3" /> {t('admin.technicalId')}</TableHead>
                    <TableHead>{t('budget.movements.categoryLabel')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {isLoadingStats ? <TableRow><TableCell colSpan={4} className="text-center py-8">{t('common.loading')}</TableCell></TableRow> : sortedStats?.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{d.title}</TableCell>
                        <TableCell><code className="text-[10px] bg-muted p-1 rounded font-mono">{d.id}</code></TableCell>
                        <TableCell><Badge variant="secondary">{d.category}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Dialog>
                            <DialogTrigger asChild><Button variant="ghost" size="sm">{t('common.view')}</Button></DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>{d.title}</DialogTitle><DialogDescription>ID: {d.id}</DialogDescription></DialogHeader>
                                <div className="space-y-4 my-4">
                                    <div className="p-4 rounded-md bg-muted/30 border"><h4 className="font-bold text-xs uppercase mb-2">{t('proposals.descLabel')}</h4><p className="text-sm">{d.description}</p></div>
                                    <div className="p-4 rounded-md bg-muted/30 border"><h4 className="font-bold text-xs uppercase mb-2">{t('home.source')}</h4><p className="text-sm">{d.source}</p></div>
                                </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t('common.warning')}</AlertDialogTitle><AlertDialogDescription>{t('admin.deleteDataConfirm')}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteStatisticalData(d.id)} className="bg-destructive">{t('common.delete')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
          <Card className="border-primary padding-4 bg-primary/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />{t('admin.adminActivation')}</CardTitle><CardDescription>{t('admin.adminActivationDesc')}</CardDescription></CardHeader>
            <CardContent><Button onClick={handleMakeAdmin} disabled={isSettingAdmin}>{isSettingAdmin ? <Loader2 className="mr-2 animate-spin" /> : <ShieldCheck className="mr-2" />}{t('admin.activateAdmin')}</Button></CardContent>
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

        {/* ── Cache de Dados Externos ── */}
        <TabsContent value="cache" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Cache de Dados Externos</CardTitle>
                  <CardDescription>Estado do cache Firestore para todas as fontes de dados externos. Os dados são servidos daqui em vez de chamar APIs externas a cada pedido.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadCacheStatuses} disabled={isLoadingCache}>
                  {isLoadingCache ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Actualizar estado</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCache && cacheStatuses.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground text-sm"><Loader2 className="animate-spin mr-2" />A carregar estado do cache…</div>
              ) : cacheStatuses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-3 text-muted-foreground">
                  <Database className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Clique em "Actualizar estado" para ver o estado do cache</p>
                  <Button variant="outline" size="sm" onClick={loadCacheStatuses}>Ver estado</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cacheStatuses.map((s: any) => {
                    const isExpired = s.isExpired || s.status === 'missing';
                    const statusIcon = s.status === 'ok' && !isExpired
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : s.status === 'fallback'
                        ? <AlertCircle className="h-4 w-4 text-amber-500" />
                        : s.status === 'missing'
                          ? <XCircle className="h-4 w-4 text-muted-foreground" />
                          : <Clock className="h-4 w-4 text-orange-400" />;
                    const statusLabel = s.status === 'ok' && !isExpired ? 'Válido'
                      : s.status === 'fallback' ? 'Fallback'
                      : s.status === 'missing' ? 'Sem dados'
                      : 'Expirado';
                    return (
                      <div key={s.key} className="flex items-center justify-between rounded-lg border p-4 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {statusIcon}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{s.label}</p>
                            <p className="text-xs text-muted-foreground">{s.updateFrequency}</p>
                            {s.fetchedAt && (
                              <p className="text-xs text-muted-foreground">
                                Actualizado: {new Date(s.fetchedAt).toLocaleString('pt-PT')}
                                {s.expiresAt && ` · Expira: ${new Date(s.expiresAt).toLocaleString('pt-PT')}`}
                              </p>
                            )}
                            {s.errorMsg && <p className="text-xs text-red-500 truncate">Erro: {s.errorMsg}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={s.status === 'ok' && !isExpired ? 'default' : s.status === 'fallback' ? 'secondary' : 'outline'} className="text-xs">{statusLabel}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefreshCache(s.dataType)}
                            disabled={refreshingType === s.dataType}
                          >
                            {refreshingType === s.dataType
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <RefreshCw className="h-3 w-3" />}
                            <span className="ml-1 hidden sm:inline">Forçar</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Política de Actualização</CardTitle>
              <CardDescription>Tempos de TTL configurados por tipo de dado, baseados na frequência real de publicação de cada fonte.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="py-2 px-3 text-left">Tipo</th><th className="py-2 px-3 text-left">Fonte</th><th className="py-2 px-3 text-left">TTL</th><th className="py-2 px-3 text-left hidden md:table-cell">Justificação</th></tr></thead>
                  <tbody>
                    {[
                      { label: 'Contratos Públicos', source: 'base.gov.pt', ttl: '30 min', rationale: 'Novos contratos diariamente' },
                      { label: 'Crime (RASI)', source: 'DGPJ / dados.gov.pt', ttl: '7 dias', rationale: 'Publicação anual em março/abril' },
                      { label: 'Saúde (SNS)', source: 'transparencia.sns.gov.pt', ttl: '24 horas', rationale: 'Dados mensais/sazonais' },
                      { label: 'Deputados (AR)', source: 'parlamento.pt', ttl: '24 horas', rationale: 'Estável por legislatura (4 anos)' },
                      { label: 'Iniciativas (AR)', source: 'parlamento.pt', ttl: '1 hora', rationale: 'Actividade parlamentar semanal' },
                    ].map(row => (
                      <tr key={row.label} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium">{row.label}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.source}</td>
                        <td className="py-2 px-3"><Badge variant="outline">{row.ttl}</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground hidden md:table-cell">{row.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setOpen => !setOpen && setIsFormOpen(false)}>
        <DialogContent><DialogHeader><DialogTitle>{editingSource ? t('admin.editSource') : t('admin.addSource')}</DialogTitle></DialogHeader>
          <DataSourceForm source={editingSource} onSave={handleSaveDataSource} onFinished={() => setIsFormOpen(false)} isSaving={isSaving} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
