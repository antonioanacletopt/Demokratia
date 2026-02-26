
"use client";

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Target, Users, BookOpen, Fingerprint } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <Logo className="size-20" />
        </div>
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
          {t('about.title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
          "{t('about.subtitle')}"
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="text-accent" /> {t('about.missionTitle')}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('about.missionDesc')}
            </p>
          </section>

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> {t('about.teamTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('about.teamDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-accent" /> {t('about.valuesTitle')}
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-xl bg-card">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> {t('about.neutrality')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{t('about.neutralityDesc')}</p>
            </div>
            
            <div className="p-4 border rounded-xl bg-card">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Fingerprint className="h-4 w-4" /> {t('about.transparency')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{t('about.transparencyDesc')}</p>
            </div>
            
            <div className="p-4 border rounded-xl bg-card">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> {t('about.innovation')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{t('about.innovationDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-muted/30 p-8 rounded-3xl border text-center space-y-4">
        <h2 className="text-2xl font-bold">Compromisso com o Futuro</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Portugal enfrenta desafios complexos em 2026. A habitação, a demografia e a competitividade fiscal são temas que requerem dados, não ideologias. A Demokratia fornece a bússola para que cada cidadão possa navegar na atualidade política com independência crítica.
        </p>
      </section>
    </div>
  );
}
