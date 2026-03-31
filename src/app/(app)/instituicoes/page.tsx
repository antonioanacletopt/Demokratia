'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Landmark, Gavel, Scale, History, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function InstituicoesPage() {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'pr',
      icon: Landmark,
      color: 'text-blue-600 bg-blue-50',
      title: t('instituicoes.pr.title'),
      role: t('instituicoes.pr.role'),
      desc: t('instituicoes.pr.desc'),
      election: t('instituicoes.pr.election'),
      powers: [
        t('instituicoes.pr.powers.p1'),
        t('instituicoes.pr.powers.p2'),
        t('instituicoes.pr.powers.p3'),
        t('instituicoes.pr.powers.p4'),
      ]
    },
    {
      id: 'ar',
      icon: Gavel,
      color: 'text-orange-600 bg-orange-50',
      title: t('instituicoes.ar.title'),
      role: t('instituicoes.ar.role'),
      desc: t('instituicoes.ar.desc'),
      election: t('instituicoes.ar.election'),
      powers: [
        t('instituicoes.ar.powers.p1'),
        t('instituicoes.ar.powers.p2'),
        t('instituicoes.ar.powers.p3'),
        t('instituicoes.ar.powers.p4'),
      ]
    },
    {
      id: 'gov',
      icon: BookOpen,
      color: 'text-green-600 bg-green-50',
      title: t('instituicoes.gov.title'),
      role: t('instituicoes.gov.role'),
      desc: t('instituicoes.gov.desc'),
      composition: t('instituicoes.gov.composition'),
      powers: [
        t('instituicoes.gov.powers.p1'),
        t('instituicoes.gov.powers.p2'),
        t('instituicoes.gov.powers.p3'),
        t('instituicoes.gov.powers.p4'),
      ]
    },
    {
      id: 'courts',
      icon: Scale,
      color: 'text-purple-600 bg-purple-50',
      title: t('instituicoes.courts.title'),
      role: t('instituicoes.courts.role'),
      desc: t('instituicoes.courts.desc'),
      independence: t('instituicoes.courts.independence'),
      types: [
        t('instituicoes.courts.types.tc'),
        t('instituicoes.courts.types.tj'),
        t('instituicoes.courts.types.taf'),
        t('instituicoes.courts.types.tcontas'),
      ]
    }
  ];

  return (
    <div className="container mx-auto max-w-5xl space-y-12 py-12 px-4">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Badge variant="outline" className="px-4 py-1 text-primary animate-pulse">
          Literacia Democrática
        </Badge>
        <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl">
          {t('instituicoes.title')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t('instituicoes.subtitle')}
        </p>
      </div>

      <Card className="border-none bg-muted/30">
        <CardContent className="flex gap-4 p-6 italic text-muted-foreground/80">
          <Info className="size-6 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed">{t('instituicoes.intro')}</p>
        </CardContent>
      </Card>

      <div className="grid gap-8">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className={`flex w-full md:w-16 items-center justify-center p-4 md:p-0 ${section.color}`}>
                <section.icon className="h-8 w-8" />
              </div>
              <div className="flex-1 p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                    <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase tracking-wider font-bold">
                      {section.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{section.desc}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70">
                      Função & Nomeação
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {section.election || section.composition || section.independence}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70">
                      Competências
                    </h3>
                    <ul className="space-y-1.5">
                      {section.powers?.map((power, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-primary font-bold">•</span>
                          {power}
                        </li>
                      )) || section.types?.map((type, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-primary font-bold">•</span>
                          {type}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-8 grid sm:grid-cols-2 gap-8">
        <Card className="border-primary/10 bg-primary/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="size-5 text-primary" />
              {t('instituicoes.cycle.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-primary/5 pb-2">
              <span className="font-medium text-muted-foreground">Presidenciais</span>
              <span className="font-bold">{t('instituicoes.cycle.presidential')}</span>
            </div>
            <div className="flex justify-between border-b border-primary/5 pb-2">
              <span className="font-medium text-muted-foreground">Legislativas</span>
              <span className="font-bold">{t('instituicoes.cycle.legislative')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Autárquicas</span>
              <span className="font-bold">{t('instituicoes.cycle.local')}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-center space-y-4 p-4 text-center sm:text-left">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            {t('instituicoes.legalBasis')}
          </p>
          <Separator className="bg-primary/10" />
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "A soberania, una e indivisível, reside no povo, que a exerce segundo as formas previstas na Constituição." — Art. 2º da CRP.
          </p>
        </div>
      </div>
    </div>
  );
}
