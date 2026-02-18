"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">{t('privacy.title')}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>1. {t('common.language')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.intro')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. {t('privacy.dataTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.dataDesc')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. {t('privacy.purposeTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.purposeDesc')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>4. {t('privacy.cookiesTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.cookiesDesc')}</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader><CardTitle>5. {t('privacy.rightsTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t('privacy.rightsDesc')}</p>
          <p>
            <Link href="/profile" className="text-primary hover:underline font-medium">{t('nav.profile')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
