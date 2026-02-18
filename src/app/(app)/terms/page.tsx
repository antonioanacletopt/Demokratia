
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">{t('terms.title')}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>1. {t('common.accept')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('terms.intro')}</p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
        <CardHeader><CardTitle className="text-amber-800 dark:text-amber-400">2. {t('terms.aiTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('terms.aiDesc')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. {t('terms.usageTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('terms.usageDesc')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>4. {t('terms.ipTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('terms.ipDesc')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
