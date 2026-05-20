'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map as MapIcon, Coins, AlertCircle, Users, Home, ShieldAlert, ShieldCheck,
  Sparkles, Target, Info, Building2, MapPin, TrendingDown, TrendingUp,
  FileText, ExternalLink, BarChart3, Loader2, Euro, Heart, Clock,
  Stethoscope, ChevronLeft, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import PortugalMap from './mapa_portugal.svg';
import { DISTRICT_DATA_2026, type DistrictData } from '@/lib/statistical-data';
import {
  MUNICIPIOS_DATA, NUTS_CRIME_INDEX, NUTS_TO_ARS,
  type MunicipioInfo, type ContratoPublico, type CriminalityRecord, type HealthRecord,
} from '@/lib/municipios-api';

// ─── Types ───────────────────────────────────────────────────────────────────

type IndicatorKey = 'salary' | 'poverty' | 'population' | 'housing' | 'crime';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEur(v: number | null) {
  if (v == null) return '—';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
}
function formatNum(v: number | null) {
  if (v == null) return '—';
  return new Intl.NumberFormat('pt-PT').format(v);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color = 'text-primary' }: {
  label: string; value: string; icon: React.ElementType; color?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-semibold">{value}</p></div>
    </div>
  );
}

function CrimeTable({ records, loading, error, t }: {
  records: CriminalityRecord[]; loading: boolean; error: boolean; t: (k: string) => string;
}) {
  if (loading) return <div className="flex items-center gap-2 py-8 text-muted-foreground justify-center"><Loader2 className="h-4 w-4 animate-spin" />{t('municipios.crime.loading')}</div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('municipios.crime.error')}</AlertDescription></Alert>;
  if (!records.length) return <p className="text-muted-foreground py-6 text-center">{t('municipios.crime.noData')}</p>;
  const byYear = records.reduce((acc, r) => { if (!acc[r.year]) acc[r.year] = []; acc[r.year].push(r); return acc; }, {} as Record<number, CriminalityRecord[]>);
  return (
    <div className="space-y-6">
      {Object.keys(byYear).map(Number).sort((a, b) => b - a).map(year => (
        <div key={year}>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">{year}</h4>
          <div className="divide-y rounded-md border overflow-hidden">
            {byYear[year].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/50 transition-colors">
                <span className="text-sm">{r.category}</span>
                <Badge variant="secondary" className="font-mono">{r.rate.toFixed(1)} ‰</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">{t('municipios.crime.source')}</p>
    </div>
  );
}

function HealthTable({ records, loading, error, ars, t }: {
  records: HealthRecord[]; loading: boolean; error: boolean; ars: string; t: (k: string) => string;
}) {
  if (loading) return <div className="flex items-center gap-2 py-8 text-muted-foreground justify-center"><Loader2 className="h-4 w-4 animate-spin" />{t('municipios.health.loading')}</div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('municipios.health.error')}</AlertDescription></Alert>;
  if (!records.length) return <p className="text-muted-foreground py-6 text-center">{t('municipios.health.noData')}</p>;
  const byInd: Record<string, HealthRecord[]> = {};
  records.forEach(r => { if (!byInd[r.indicador]) byInd[r.indicador] = []; byInd[r.indicador].push(r); });
  Object.values(byInd).forEach(arr => arr.sort((a, b) => b.periodo.localeCompare(a.periodo)));
  const icon = (ind: string) => {
    if (/m[eé]dico/i.test(ind)) return <Stethoscope className="h-4 w-4 text-blue-500" />;
    if (/cama/i.test(ind)) return <Heart className="h-4 w-4 text-red-400" />;
    if (/espera|urg/i.test(ind)) return <Clock className="h-4 w-4 text-orange-400" />;
    if (/mortalidade/i.test(ind)) return <TrendingDown className="h-4 w-4 text-red-600" />;
    if (/esperan/i.test(ind)) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
  };
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{t('municipios.health.arsLabel')}: <strong>{ars}</strong></p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.keys(byInd).map(ind => {
          const latest = byInd[ind][0]; const prev = byInd[ind][1];
          const delta = prev ? latest.valor - prev.valor : null;
          return (
            <div key={ind} className="rounded-lg border bg-card p-4 space-y-1">
              <div className="flex items-center gap-2">{icon(ind)}<p className="text-xs text-muted-foreground font-medium leading-tight">{ind}</p></div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-primary">{latest.valor % 1 === 0 ? latest.valor : latest.valor.toFixed(1)}</span>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">{latest.unidade}</span>
                  {delta != null && <span className={`text-xs font-semibold ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{delta > 0 ? '+' : ''}{delta.toFixed(1)} vs {prev?.periodo}</span>}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{latest.periodo}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t('municipios.health.source')}</p>
    </div>
  );
}

function ContratosTable({ contratos, loading, error, municipio, t }: {
  contratos: ContratoPublico[]; loading: boolean; error: boolean; municipio: MunicipioInfo; t: (k: string) => string;
}) {
  if (loading) return <div className="flex items-center gap-2 py-8 text-muted-foreground justify-center"><Loader2 className="h-4 w-4 animate-spin" />{t('municipios.contracts.loading')}</div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('municipios.contracts.error')}</AlertDescription></Alert>;
  if (!contratos.length) return <p className="text-muted-foreground py-6 text-center">{t('municipios.contracts.noData')}</p>;
  return (
    <div className="space-y-3">
      {contratos.map((c, i) => (
        <div key={c.id || i} className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug flex-1">{c.objectoBrev}</p>
            {c.precoContratual != null && <span className="font-semibold text-primary text-sm whitespace-nowrap">{formatEur(c.precoContratual)}</span>}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{c.entidade}</span>
            {c.tipoProcedimento && <Badge variant="outline" className="text-xs">{c.tipoProcedimento}</Badge>}
            {c.dataPublicacao && <span>{c.dataPublicacao}</span>}
          </div>
          {c.id > 0 && <a href={c.linkDetalhe} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" />Ver no Portal BASE</a>}
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">{t('municipios.contracts.source')}</p>
        <a href={`https://www.base.gov.pt/Base4/pt/resultados/?type=contratos&localidade=${encodeURIComponent(municipio.nome)}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-1 text-xs"><ExternalLink className="h-3 w-3" />{t('municipios.contracts.viewAll')}</Button>
        </a>
      </div>
    </div>
  );
}

// ─── Municipality Detail Panel ─────────────────────────────────────────────

function MunicipioDetail({ municipio, t, onBack }: {
  municipio: MunicipioInfo; t: (k: string) => string; onBack: () => void;
}) {
  const [contratos, setContratos] = useState<ContratoPublico[]>([]);
  const [contratosLoading, setContratosLoading] = useState(false);
  const [contratosError, setContratosError] = useState(false);
  const [crimeData, setCrimeData] = useState<CriminalityRecord[]>([]);
  const [crimeLoading, setCrimeLoading] = useState(false);
  const [crimeError, setCrimeError] = useState(false);
  const [healthData, setHealthData] = useState<HealthRecord[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadContratos = useCallback(async () => {
    if (contratos.length) return;
    setContratosLoading(true); setContratosError(false);
    try { const r = await fetch(`/api/municipios/contratos?localidade=${encodeURIComponent(municipio.nome)}`); if (!r.ok) throw new Error(); setContratos(await r.json()); }
    catch { setContratosError(true); } finally { setContratosLoading(false); }
  }, [municipio.nome, contratos.length]);

  const loadCrime = useCallback(async () => {
    if (crimeData.length) return;
    setCrimeLoading(true); setCrimeError(false);
    try { const r = await fetch(`/api/municipios/criminalidade?nuts=${encodeURIComponent(municipio.nutsII)}`); if (!r.ok) throw new Error(); setCrimeData(await r.json()); }
    catch { setCrimeError(true); } finally { setCrimeLoading(false); }
  }, [municipio.nutsII, crimeData.length]);

  const loadHealth = useCallback(async () => {
    if (healthData.length) return;
    setHealthLoading(true); setHealthError(false);
    try { const r = await fetch(`/api/municipios/saude?nuts=${encodeURIComponent(municipio.nutsII)}`); if (!r.ok) throw new Error(); setHealthData(await r.json()); }
    catch { setHealthError(true); } finally { setHealthLoading(false); }
  }, [municipio.nutsII, healthData.length]);

  useEffect(() => {
    if (activeTab === 'contracts') loadContratos();
    if (activeTab === 'crime') loadCrime();
    if (activeTab === 'health') loadHealth();
  }, [activeTab, loadContratos, loadCrime, loadHealth]);

  const crimeIndex = NUTS_CRIME_INDEX[municipio.nutsII];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> {t('map.backToDistrict') || 'Voltar ao distrito'}
        </Button>
        <div>
          <h2 className="text-2xl font-bold font-headline">{municipio.nome}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{municipio.distrito} · {municipio.nutsII}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">{formatNum(municipio.populacao)} hab.</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1"><BarChart3 className="h-4 w-4 mr-2 hidden sm:block" />{t('municipios.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="contracts" className="flex-1"><FileText className="h-4 w-4 mr-2 hidden sm:block" />{t('municipios.tabs.contracts')}</TabsTrigger>
          <TabsTrigger value="crime" className="flex-1"><ShieldAlert className="h-4 w-4 mr-2 hidden sm:block" />{t('municipios.tabs.crime')}</TabsTrigger>
          <TabsTrigger value="health" className="flex-1"><Heart className="h-4 w-4 mr-2 hidden sm:block" />{t('municipios.tabs.health')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label={t('municipios.overview.population')} value={formatNum(municipio.populacao)} icon={Users} />
            <StatCard label={t('municipios.overview.area')} value={`${formatNum(municipio.area)} km²`} icon={MapPin} />
            <StatCard label={t('municipios.overview.density')} value={`${formatNum(municipio.densidade)} hab/km²`} icon={Users} />
            <StatCard label={t('municipios.overview.unemployment')} value={`${municipio.desemprego.toFixed(1)}%`} icon={TrendingDown} color={municipio.desemprego > 9 ? 'text-destructive' : 'text-primary'} />
            <StatCard label="Salário Médio" value={formatEur(municipio.salarioMedio)} icon={Euro} />
            <StatCard label="Taxa de Pobreza" value={`${municipio.txPobreza.toFixed(1)}%`} icon={TrendingDown} color={municipio.txPobreza > 20 ? 'text-destructive' : municipio.txPobreza > 16 ? 'text-yellow-500' : 'text-green-600'} />
          </div>
          {crimeIndex != null && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-orange-500" />Índice de Criminalidade — {municipio.nutsII}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-primary">{crimeIndex.toFixed(1)}</span>
                  <span className="text-muted-foreground mb-1">crimes / 1000 hab. (RASI 2024)</span>
                </div>
                <Button variant="ghost" size="sm" className="mt-2 text-xs gap-1 px-0 text-primary" onClick={() => setActiveTab('crime')}>Ver detalhes por categoria →</Button>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground">{t('municipios.overview.source')}</p>
          <div className="flex flex-wrap gap-2">
            <a href={`https://www.pordata.pt/municipios/${municipio.nome.toLowerCase().replace(/\s/g, '+')}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="gap-1 text-xs"><ExternalLink className="h-3 w-3" />Pordata</Button></a>
            <a href={`https://www.base.gov.pt/Base4/pt/resultados/?type=contratos&localidade=${encodeURIComponent(municipio.nome)}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="gap-1 text-xs"><ExternalLink className="h-3 w-3" />Portal BASE</Button></a>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="pt-2">
          <Card><CardHeader><CardTitle className="text-base">{t('municipios.contracts.title')}</CardTitle><CardDescription>{t('municipios.contracts.description')}</CardDescription></CardHeader>
            <CardContent><ContratosTable contratos={contratos} loading={contratosLoading} error={contratosError} municipio={municipio} t={t} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="crime" className="pt-2">
          <Card><CardHeader><CardTitle className="text-base">{t('municipios.crime.title')}</CardTitle><CardDescription>{t('municipios.crime.description')} · <strong>{municipio.nutsII}</strong></CardDescription></CardHeader>
            <CardContent><CrimeTable records={crimeData} loading={crimeLoading} error={crimeError} t={t} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="health" className="pt-2">
          <Card><CardHeader><CardTitle className="text-base">{t('municipios.health.title')}</CardTitle><CardDescription>{t('municipios.health.description')}</CardDescription></CardHeader>
            <CardContent><HealthTable records={healthData} loading={healthLoading} error={healthError} ars={NUTS_TO_ARS[municipio.nutsII] ?? municipio.nutsII} t={t} /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const { t } = useTranslation();
  const [activeIndicator, setActiveIndicator] = useState<IndicatorKey>('salary');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioInfo | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Municipalities belonging to the selected district
  const districtMunicipios = selectedDistrict
    ? MUNICIPIOS_DATA.filter(m => m.distrito.toLowerCase() === selectedDistrict.name.toLowerCase())
    : [];

  const getIndicatorColor = (districtId: string) => {
    const data = DISTRICT_DATA_2026.find(d => d.id === districtId);
    if (!data) return 'hsl(var(--muted))';
    const values = DISTRICT_DATA_2026.map(d => d[activeIndicator]);
    const min = Math.min(...values); const max = Math.max(...values);
    const isReversed = activeIndicator === 'poverty' || activeIndicator === 'crime';
    const ratio = max === min ? 0.5 : (data[activeIndicator] - min) / (max - min);
    const opacity = 0.2 + ((isReversed ? 1 - ratio : ratio) * 0.8);
    return `hsl(217 91% 60% / ${opacity})`;
  };

  const handleDistrictClick = (districtId: string) => {
    const district = DISTRICT_DATA_2026.find(d => d.id === districtId);
    if (district) { setSelectedDistrict(district); setSelectedMunicipio(null); }
  };

  useEffect(() => {
    const load = async () => {
      if (!mapContainerRef.current) return;
      const response = await fetch(PortugalMap.src);
      const svgText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      if (!svgElement || !mapContainerRef.current) return;
      svgElement.style.width = '100%'; svgElement.style.height = '100%';
      mapContainerRef.current.innerHTML = '';
      mapContainerRef.current.appendChild(svgElement);
      DISTRICT_DATA_2026.forEach(district => {
        const path = svgElement.querySelector(`#${district.id}`) as SVGPathElement | null;
        if (path) {
          path.style.fill = getIndicatorColor(district.id);
          path.style.transition = 'fill 0.3s ease'; path.style.cursor = 'pointer';
          path.addEventListener('click', () => handleDistrictClick(district.id));
          path.addEventListener('mouseenter', () => { path.style.filter = 'brightness(1.2)'; });
          path.addEventListener('mouseleave', () => { path.style.filter = 'none'; });
        }
      });
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndicator]);

  const isReversed = activeIndicator === 'poverty';
  const gradientStyle = { background: `linear-gradient(to right, hsl(217 91% 60% / ${isReversed ? 1.0 : 0.2}), hsl(217 91% 60% / ${isReversed ? 0.2 : 1.0}))` };

  const indicators: { id: IndicatorKey; icon: React.ElementType }[] = [
    { id: 'salary', icon: Coins },
    { id: 'poverty', icon: AlertCircle },
    { id: 'population', icon: Users },
    { id: 'housing', icon: Home },
    { id: 'crime', icon: ShieldAlert },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <MapIcon className="h-10 w-10" /> {t('map.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('map.description')}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {['INE / Pordata', 'RASI 2024 (MAI/DGPJ)', 'Portal BASE (IMPIC)', 'SNS Transparência'].map(src => (
            <Badge key={src} variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />{src}</Badge>
          ))}
        </div>
      </div>

      {/* Map + Controls */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* SVG Map */}
        <div className="lg:col-span-8">
          <Card className="overflow-hidden border-primary/10 shadow-2xl relative bg-zinc-50 dark:bg-zinc-900/20">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                {t(`map.${activeIndicator}`)}
              </CardTitle>
              <Badge variant="outline" className="bg-background/50 uppercase tracking-tighter">{t('map.atlas')}</Badge>
            </CardHeader>
            <CardContent className="p-4 flex justify-center items-center min-h-[700px]">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-6 right-6 p-4 bg-background/90 backdrop-blur-md rounded-2xl border shadow-lg space-y-3 min-w-[180px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('map.legend')}</p>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full shadow-inner" style={gradientStyle} />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>{t(isReversed ? 'map.high' : 'map.low')}</span>
                    <span>{t(isReversed ? 'map.low' : 'map.high')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Indicator Selector */}
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />{t('map.indicators')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {indicators.map(ind => (
                <button key={ind.id}
                  className={cn("flex items-center gap-3 h-12 px-4 rounded-xl border transition-all hover:scale-[1.02] text-left text-sm font-medium",
                    activeIndicator === ind.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50")}
                  onClick={() => { setActiveIndicator(ind.id); setSelectedDistrict(null); setSelectedMunicipio(null); }}
                >
                  <ind.icon className={cn("h-5 w-5", activeIndicator === ind.id ? "text-primary-foreground" : "text-primary")} />
                  {t(`map.${ind.id}`)}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* District Detail */}
          {selectedDistrict ? (
            <Card className="border-accent/20 bg-accent/5 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="bg-accent/10 border-b">
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-accent" />{selectedDistrict.name}
                </CardTitle>
                <CardDescription>{t('map.dataFor')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('map.salary'), value: `${selectedDistrict.salary}€` },
                    { label: t('map.poverty'), value: `${selectedDistrict.poverty}%` },
                    { label: t('map.population'), value: `${selectedDistrict.population}k` },
                    { label: t('map.housing'), value: `${selectedDistrict.housing}€/m²` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-background border shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{item.label}</p>
                      <p className="text-lg font-bold font-headline text-primary">{item.value}</p>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl bg-background border shadow-sm col-span-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.crime')}</p>
                    <p className="text-lg font-bold font-headline text-primary">{selectedDistrict.crime} ‰</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">crimes/1000 hab · RASI 2024</p>
                  </div>
                </div>

                {/* Municipalities in this district */}
                {districtMunicipios.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t('map.municipiosInDistrict') || 'Municípios com dados disponíveis'}
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border">
                      {districtMunicipios.map(m => (
                        <button key={m.id} onClick={() => setSelectedMunicipio(m)}
                          className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-muted/60 transition-colors border-b last:border-b-0 bg-card">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{m.nome}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{formatNum(m.populacao)} hab.</p>
                          </div>
                          <span className="ml-auto text-[10px] text-primary font-semibold">{formatEur(m.salarioMedio)}/mês</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 py-3">
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Info className="h-3 w-3" /> {t('map.source')}
                </p>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <MapIcon className="h-8 w-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">{t('map.selectDistrict')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Municipality Detail — full width, appears below map when a municipality is selected */}
      {selectedMunicipio && (
        <div className="border rounded-2xl p-6 bg-card shadow-lg">
          <MunicipioDetail
            municipio={selectedMunicipio}
            t={t}
            onBack={() => setSelectedMunicipio(null)}
          />
        </div>
      )}

      {/* Data sources footer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Fontes:</strong> Dados macroeconómicos — INE / Pordata 2024. Crime — RASI 2024 (MAI/DGPJ). Contratos públicos —
          <a href="https://www.base.gov.pt" target="_blank" rel="noopener noreferrer" className="underline ml-1">Portal BASE</a>.
          Saúde — <a href="https://transparencia.sns.gov.pt" target="_blank" rel="noopener noreferrer" className="underline ml-1">SNS Transparência</a>.
          Todos os dados abertos ao abrigo de licença Creative Commons.
        </AlertDescription>
      </Alert>
    </div>
  );
}
