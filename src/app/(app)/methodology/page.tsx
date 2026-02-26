
"use client";

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookOpen, LineChart, Cpu, GraduationCap, ExternalLink, Youtube, Info, ShieldCheck, Globe, Database, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function MethodologyPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const vizImg = PlaceHolderImages.find(img => img.id === 'data-viz');

  const sourcesRef = useMemoFirebase(() => query(collection(firestore, 'dataSources'), where('isSystemSource', '==', true)), [firestore]);
  const { data: officialSources } = useCollection<any>(sourcesRef);

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
          {t('methodology.title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('methodology.subtitle')}
        </p>
      </div>

      {vizImg && (
        <div className="relative h-[300px] w-full rounded-3xl overflow-hidden shadow-xl border">
          <Image 
            src={vizImg.imageUrl} 
            alt={vizImg.description} 
            fill 
            className="object-cover"
            data-ai-hint={vizImg.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <p className="text-white text-sm font-medium italic opacity-90">{t('methodology.intro')}</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="text-accent" /> {t('methodology.modelsTitle')}
          </h2>
          
          <div className="space-y-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  {t('methodology.okunTitle')}
                  <Link href="https://pt.wikipedia.org/wiki/Lei_de_Okun" target="_blank" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-4 w-4" /></Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('methodology.okunDesc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  {t('methodology.phillipsTitle')}
                  <Link href="https://pt.wikipedia.org/wiki/Curva_de_Phillips" target="_blank" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-4 w-4" /></Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('methodology.phillipsDesc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {t('methodology.multiplierTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('methodology.multiplierDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="text-accent" /> {t('methodology.aiTitle')}
          </h2>
          <Card className="bg-accent/5 border-dashed border-accent/20">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm leading-relaxed">
                {t('methodology.aiDesc')}
              </p>
              <div className="bg-background/50 p-4 rounded-xl border flex items-center gap-4">
                <Info className="h-8 w-8 text-primary shrink-0" />
                <p className="text-xs italic">"O RAG permite que a IA cite fontes como o Diário da República sem inventar vereditos legais."</p>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold flex items-center gap-2 pt-4">
            <Youtube className="text-red-600" /> {t('methodology.videoTitle')}
          </h2>
          <div className="aspect-video w-full rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed relative group">
             <div className="text-center p-6">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Vídeo Recomendado</p>
                <p className="text-sm font-medium">Como funciona o Orçamento do Estado?</p>
                <Button variant="link" className="mt-2 text-primary" asChild>
                  <Link href="https://www.youtube.com/results?search_query=como+funciona+or%C3%A7amento+do+estado+portugal" target="_blank">
                    Pesquisar no YouTube <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
             </div>
          </div>
        </section>
      </div>

      <Separator />

      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-headline flex items-center justify-center gap-3">
            <ShieldCheck className="text-primary h-8 w-8" /> {t('methodology.transparencyTitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('methodology.transparencyDesc')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {officialSources?.map((source: any) => (
            <Card key={source.id} className="hover:shadow-lg transition-all border-primary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-accent" />
                  {source.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[100px]">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {source.description}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3">
                <Button asChild variant="link" size="sm" className="p-0 h-auto font-bold">
                  <Link href={source.url} target="_blank">
                    Consultar Portal Oficial <ExternalLink className="ml-1.5 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button asChild size="lg" className="px-10 shadow-xl group">
            <Link href="/explorer">
              Explorar Dados destas Fontes <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-primary/5 p-10 rounded-3xl border border-primary/10 space-y-6">
        <h2 className="text-2xl font-bold text-center">{t('methodology.linksTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Conselho Finanças Públicas', url: 'https://www.cfp.pt' },
            { name: 'INE - Estatísticas Oficiais', url: 'https://www.ine.pt' },
            { name: 'Pordata - Base de Dados', url: 'https://www.pordata.pt' },
            { name: 'DRE - Legislação', url: 'https://dre.pt' },
            { name: 'Banco de Portugal - Lab', url: 'https://www.bportugal.pt' },
            { name: 'Portal da Transparência', url: 'https://www.transparencia.gov.pt' }
          ].map(link => (
            <Link key={link.name} href={link.url} target="_blank" className="p-4 bg-card border rounded-xl flex justify-between items-center hover:shadow-md transition-all group">
              <span className="font-medium text-sm group-hover:text-primary">{link.name}</span>
              <ExternalLink className="h-4 w-4 opacity-20 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
