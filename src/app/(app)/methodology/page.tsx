'use client';

import { getSystemDataSources } from '@/lib/system-data-sources';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Globe, Bot, Database, Workflow, ShieldCheck, Scale, Info } from 'lucide-react';

export default function MethodologyPage() {
  const { t } = useTranslation();

  // Follow the pattern from legislation/page.tsx: define data with keys, translate in JSX.
  const methodologySections = [
    { 
      id: 'data-sourcing', 
      titleKey: 'methodology.sourcing.title',
      contentKey: 'methodology.sourcing.content',
      icon: <Globe className="h-5 w-5" />
    },
    { 
      id: 'ai-integration', 
      titleKey: 'methodology.ai.title',
      contentKey: 'methodology.ai.content',
      icon: <Bot className="h-5 w-5" />
    },
    { 
      id: 'data-processing', 
      titleKey: 'methodology.processing.title',
      contentKey: 'methodology.processing.content',
      icon: <Workflow className="h-5 w-5" />
    },
    { 
      id: 'validation-and-quality', 
      titleKey: 'methodology.validation.title',
      contentKey: 'methodology.validation.content',
      icon: <ShieldCheck className="h-5 w-5" />
    },
    { 
      id: 'ethical-considerations', 
      titleKey: 'methodology.ethics.title',
      contentKey: 'methodology.ethics.content',
      icon: <Scale className="h-5 w-5" />
    }
  ];

  // The function getSystemDataSources returns already translated data.
  const officialSources = getSystemDataSources(t);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('nav.methodology')}</h1>
        <p className="text-muted-foreground text-lg">{t('methodology.description')}</p>
      </div>

      <Card className="mb-8 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="text-accent"/>
            {t('methodology.officialSources')}
          </CardTitle>
          <CardDescription>{t('methodology.sourcesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officialSources.map(source => (
              <li key={source.name} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                <Link href={source.url} target="_blank" className="font-bold text-primary hover:underline">
                  {source.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.description}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mb-8">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('methodology.disclaimer')} <Link href="/terms" className="underline hover:text-primary">{t('methodology.termsLink')}</Link>.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">{t('methodology.detailedProcess')}</h2>
        <Accordion type="single" collapsible defaultValue="data-sourcing">
          {methodologySections.map(section => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">{section.icon}</div>
                  {t(section.titleKey)}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base prose prose-neutral dark:prose-invert max-w-none px-4 text-muted-foreground leading-relaxed">
                {t(section.contentKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
