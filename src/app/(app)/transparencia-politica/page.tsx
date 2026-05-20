"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Search, Users, FileText, Award, Info, BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Deputado, PartidoComposicao, IniciativaLegislativa, PartidoEstatisticas } from "@/lib/parlamento-api";
import { getEstatisticasPartidos } from "@/lib/parlamento-api";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ComposicaoBar({ composicao }: { composicao: PartidoComposicao[] }) {
  const total = composicao.reduce((s, p) => s + p.deputados, 0) || 230;
  return (
    <div className="space-y-4">
      {/* Visual parliament bar */}
      <div className="flex h-8 w-full overflow-hidden rounded-md" aria-label="Composição parlamentar">
        {composicao.map(p => (
          <div
            key={p.sigla}
            style={{ width: `${(p.deputados / total) * 100}%`, backgroundColor: p.cor }}
            title={`${p.sigla}: ${p.deputados} deputados (${p.percentagem}%)`}
          />
        ))}
      </div>
      {/* Legend + table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {composicao.map(p => (
          <div key={p.sigla} className="flex items-center gap-3 rounded-lg border p-3">
            <div className="h-4 w-4 flex-shrink-0 rounded-sm" style={{ backgroundColor: p.cor }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm truncate">{p.sigla}</span>
                <span className="text-sm font-bold">{p.deputados}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{p.nome}</p>
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">{p.percentagem}%</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeputadosTable({ deputados }: { deputados: Deputado[] }) {
  const [search, setSearch] = useState('');
  const [partido, setPartido] = useState('');
  const partidos = Array.from(new Set(deputados.map(d => d.partido))).sort();

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filtered = deputados.filter(d => {
    const matchSearch = !search || norm(d.nome).includes(norm(search)) || norm(d.circulo).includes(norm(search));
    const matchPartido = !partido || d.partido === partido;
    return matchSearch && matchPartido;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Pesquisar por nome ou círculo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={partido}
          onChange={e => setPartido(e.target.value)}
        >
          <option value="">Todos os partidos</option>
          {partidos.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} deputado(s) · Dados: XVI Legislatura (Março 2024)</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left font-semibold">Nome</th>
              <th className="py-2 px-3 text-left font-semibold">Partido</th>
              <th className="py-2 px-3 text-left font-semibold hidden sm:table-cell">Círculo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{d.genero === 'F' ? '♀' : '♂'}</span>
                    {d.nome}
                  </div>
                </td>
                <td className="py-2 px-3">
                  <Badge variant="outline" className="text-xs">{d.partido}</Badge>
                </td>
                <td className="py-2 px-3 hidden sm:table-cell text-muted-foreground">{d.circulo}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Nenhum resultado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IniciativasTable({ iniciativas }: { iniciativas: IniciativaLegislativa[] }) {
  const faseColor = (fase: string) => {
    if (fase.toLowerCase().includes('aprovad')) return 'default';
    if (fase.toLowerCase().includes('rejeitad')) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Dados: parlamento.pt · XVI Legislatura</p>
      {iniciativas.map(i => (
        <div key={i.id} className="rounded-lg border p-4 space-y-2 hover:bg-muted/30 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm leading-tight">{i.titulo}</p>
            <Badge variant={faseColor(i.fase)} className="text-xs flex-shrink-0">{i.fase}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{i.tipo}</span>
            <span>·</span>
            <Badge variant="outline" className="text-xs">{i.partido}</Badge>
            {i.dataEntrada && <><span>·</span><span>{new Date(i.dataEntrada).toLocaleDateString('pt-PT')}</span></>}
          </div>
          <a
            href={i.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver na AR <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ))}
    </div>
  );
}

function EstatisticasTable({ stats }: { stats: PartidoEstatisticas[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Estatísticas ilustrativas baseadas em dados públicos da AR · XVI Legislatura</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left font-semibold">Partido</th>
              <th className="py-2 px-3 text-right font-semibold">Deputados</th>
              <th className="py-2 px-3 text-right font-semibold hidden sm:table-cell">Iniciativas ✓</th>
              <th className="py-2 px-3 text-right font-semibold hidden sm:table-cell">Iniciativas ✗</th>
              <th className="py-2 px-3 text-right font-semibold">Presença</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => {
              const taxa = s.iniciativasAprovadas + s.iniciativasRejeitadas > 0
                ? Math.round(s.iniciativasAprovadas / (s.iniciativasAprovadas + s.iniciativasRejeitadas) * 100)
                : 0;
              return (
                <tr key={s.sigla} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.cor }} />
                      <span className="font-semibold">{s.sigla}</span>
                      <span className="text-muted-foreground hidden md:inline text-xs">{s.nome}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">{s.totalDeputados}</td>
                  <td className="py-2 px-3 text-right text-green-600 hidden sm:table-cell">{s.iniciativasAprovadas}</td>
                  <td className="py-2 px-3 text-right text-red-500 hidden sm:table-cell">{s.iniciativasRejeitadas}</td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {taxa > 50
                        ? <TrendingUp className="h-3 w-3 text-green-600" />
                        : taxa < 30
                          ? <TrendingDown className="h-3 w-3 text-red-500" />
                          : <Minus className="h-3 w-3 text-muted-foreground" />
                      }
                      <span>{s.presencaMedia}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransparenciaPoliticaPage() {
  const { t } = useTranslation();

  const [deputados, setDeputados] = useState<Deputado[]>([]);
  const [composicao, setComposicao] = useState<PartidoComposicao[]>([]);
  const [iniciativas, setIniciativas] = useState<IniciativaLegislativa[]>([]);
  const [stats] = useState<PartidoEstatisticas[]>(getEstatisticasPartidos());

  const [loadingDeputados, setLoadingDeputados] = useState(false);
  const [loadingIniciativas, setLoadingIniciativas] = useState(false);
  const [activeTab, setActiveTab] = useState('composicao');

  const loadDeputados = useCallback(async () => {
    if (deputados.length > 0) return;
    setLoadingDeputados(true);
    try {
      const res = await fetch('/api/parlamento/deputados');
      const json = await res.json() as any;
      setDeputados(json.deputados ?? []);
      setComposicao(json.composicao ?? []);
    } catch {
      // fallback already handled server-side
    } finally {
      setLoadingDeputados(false);
    }
  }, [deputados.length]);

  const loadIniciativas = useCallback(async () => {
    if (iniciativas.length > 0) return;
    setLoadingIniciativas(true);
    try {
      const res = await fetch('/api/parlamento/iniciativas?limite=20');
      const json = await res.json() as any;
      setIniciativas(json.iniciativas ?? []);
    } catch {
      // fallback server-side
    } finally {
      setLoadingIniciativas(false);
    }
  }, [iniciativas.length]);

  // Load composicao+deputados on mount so header stats populate immediately
  useEffect(() => { loadDeputados(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'composicao' && composicao.length === 0) loadDeputados();
    if (activeTab === 'deputados' && deputados.length === 0) loadDeputados();
    if (activeTab === 'iniciativas' && iniciativas.length === 0) loadIniciativas();
  }, [activeTab, composicao.length, deputados.length, iniciativas.length, loadDeputados, loadIniciativas]);

  const totalDeputados = composicao.reduce((s, p) => s + p.deputados, 0) || 230;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader>
        <PageHeaderHeading>{t('transparenciaPolitica.title')}</PageHeaderHeading>
        <PageHeaderDescription>{t('transparenciaPolitica.description')}</PageHeaderDescription>
      </PageHeader>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Deputados', value: String(totalDeputados), icon: Users, desc: 'XVI Legislatura' },
          { label: 'Partidos', value: composicao.length > 0 ? String(composicao.length) : '8', icon: BarChart3, desc: 'com assento parlamentar' },
          { label: 'Iniciativas', value: iniciativas.length >= 100 ? '100+' : iniciativas.length > 0 ? String(iniciativas.length) : '1.2k+', icon: FileText, desc: 'em 2024' },
          { label: 'Dados abertos', value: '100%', icon: Award, desc: 'fonte oficial AR' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <s.icon className="h-5 w-5 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
          <TabsTrigger value="composicao">Composição</TabsTrigger>
          <TabsTrigger value="deputados">Deputados</TabsTrigger>
          <TabsTrigger value="iniciativas">Iniciativas</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="transparencia">Transparência</TabsTrigger>
        </TabsList>

        {/* ── Composição parlamentar ── */}
        <TabsContent value="composicao">
          <Card>
            <CardHeader>
              <CardTitle>Composição do Parlamento</CardTitle>
              <CardDescription>
                XVI Legislatura · {totalDeputados} deputados · Eleições de 10 de Março de 2024
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDeputados ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">A carregar…</div>
              ) : (
                <ComposicaoBar composicao={composicao.length ? composicao : getEstatisticasPartidos().map(s => ({
                  sigla: s.sigla, nome: s.nome, deputados: s.totalDeputados, percentagem: s.percentagem, cor: s.cor
                }))} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Deputados ── */}
        <TabsContent value="deputados">
          <Card>
            <CardHeader>
              <CardTitle>Deputados</CardTitle>
              <CardDescription>
                Lista de deputados da XVI Legislatura · Fonte:{" "}
                <a href="https://www.parlamento.pt/Cidadania/Paginas/DadosAbertos.aspx" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">parlamento.pt <ExternalLink className="h-3 w-3" /></a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDeputados ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">A carregar…</div>
              ) : (
                <DeputadosTable deputados={deputados} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Iniciativas ── */}
        <TabsContent value="iniciativas">
          <Card>
            <CardHeader>
              <CardTitle>Iniciativas Legislativas</CardTitle>
              <CardDescription>
                Iniciativas recentes na Assembleia da República · Fonte:{" "}
                <a href="https://www.parlamento.pt/ActividadeParlamentar/Paginas/IniciativasLegislativas.aspx" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">parlamento.pt <ExternalLink className="h-3 w-3" /></a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingIniciativas ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">A carregar…</div>
              ) : (
                <IniciativasTable iniciativas={iniciativas} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Estatísticas ── */}
        <TabsContent value="estatisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Partido</CardTitle>
              <CardDescription>Resumo da atividade parlamentar por grupo parlamentar · XVI Legislatura</CardDescription>
            </CardHeader>
            <CardContent>
              <EstatisticasTable stats={stats} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Transparência ── */}
        <TabsContent value="transparencia">
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                As declarações de rendimentos, património e interesses de titulares de cargos políticos são públicas e acessíveis através da <strong>Entidade para a Transparência</strong> e do <strong>Tribunal Constitucional</strong>.
              </AlertDescription>
            </Alert>

            {[
              {
                title: 'Entidade para a Transparência',
                desc: 'Declarações de rendimentos e património de titulares de cargos políticos e públicos (Lei nº 52/2019 – RJET). Acesso público garantido por lei.',
                url: 'https://www.entidadetransparencia.pt/',
                badge: 'Declarações patrimoniais',
                detail: 'Ministros, Secretários de Estado, Deputados, Presidentes de Câmara e outros titulares têm obrigação legal de declarar rendimentos, património e interesses.',
              },
              {
                title: 'Tribunal Constitucional – Financiamento Partidário',
                desc: 'Contas anuais dos partidos políticos. O TC fiscaliza e publica as contas de campanha e de funcionamento ordinário de todos os partidos.',
                url: 'https://www.tribunalconstitucional.pt/tc/financiamento-partidos.html',
                badge: 'Finanças dos partidos',
                detail: 'As contas abrangem receitas (quotas, subvenção pública, donativos) e despesas de cada partido, com publicação obrigatória.',
              },
              {
                title: 'Assembleia da República – Dados Abertos',
                desc: 'Portal oficial com dados abertos da atividade parlamentar em formato JSON/XML: deputados, votações, iniciativas, presenças, intervenções.',
                url: 'https://www.parlamento.pt/Cidadania/Paginas/DadosAbertos.aspx',
                badge: 'API oficial',
                detail: 'Reutilização livre com menção à fonte (Assembleia da República). Dados disponíveis desde a Legislatura Constituinte.',
              },
              {
                title: 'Transparência Internacional Portugal',
                desc: 'ONG que publica o Índice de Percepção da Corrupção (IPC) para Portugal e monitoriza o financiamento público dos partidos.',
                url: 'https://transparencia.pt/',
                badge: 'ONG / Sociedade Civil',
                detail: 'Publica análises, alertas sobre financiamento partidário e relatórios de integridade. Conteúdo sob licença Creative Commons.',
              },
              {
                title: 'Registo Central de Beneficiário Efetivo (RCBE)',
                desc: 'Quem são os beneficiários efetivos (proprietários reais) das empresas portuguesas. Relevante para verificar interesses económicos de titulares de cargos.',
                url: 'https://rcbe.justica.gov.pt/',
                badge: 'Titularidade empresarial',
                detail: 'Acesso público a informação sobre quem controla as empresas registadas em Portugal.',
              },
              {
                title: 'Portal BASE – Contratos Públicos',
                desc: 'Todos os contratos públicos celebrados por entidades do Estado. Útil para cruzar com titulares de cargos e verificar conflitos de interesse.',
                url: 'https://www.base.gov.pt/',
                badge: 'Contratação pública',
                detail: 'Dados abertos via REST API. Fornece adjudicatário, valor, entidade adjudicante, data e tipo de processo.',
              },
            ].map(item => (
              <Card key={item.title}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">{item.badge}</Badge>
                  </div>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Aceder ao portal
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
