
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">{t('privacy.title')}</h1>
        <p className="text-muted-foreground italic">{t('privacy.lastUpdated')}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('privacy.introTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.intro')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('privacy.dataTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.dataDesc')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('privacy.dataItems.account')}</li>
            <li>{t('privacy.dataItems.history')}</li>
            <li>{t('privacy.dataItems.technical')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-accent/20 bg-accent/5">
        <CardHeader><CardTitle className="text-accent">{t('privacy.cookiesTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            {t('privacy.cookiesDesc')}{' '}
            <Link href="/cookies" className="text-primary font-medium hover:underline">{t('nav.cookies')}</Link>.
          </p>
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline">{t('privacy.adsenseTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
              {t('privacy.adsenseP2')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.adsenseP1')}
            </p>
            <a 
              href="https://policies.google.com/technologies/partner-sites" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-block"
            >
              {t('privacy.googleUsageLink')}
            </a>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('privacy.purposeTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.purposeDesc')}</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader><CardTitle>{t('privacy.rightsTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            {t('privacy.rightsDesc1')}
            <Link href="/profile" className="text-primary hover:underline font-medium">{t('nav.profile')}</Link>
            {t('privacy.rightsDesc2')}
            <Link href="/contact" className="text-primary hover:underline font-medium">{t('privacy.contactLinkText')}</Link>
            {t('privacy.rightsDesc3')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('privacy.aiTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-muted-foreground leading-relaxed">
          <p>{t('privacy.aiDesc')}</p>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader><CardTitle>{t('privacy.controllerTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-muted-foreground leading-relaxed">
          <p>{t('privacy.controllerDesc')}</p>
          <ul className="list-none space-y-1 pt-1">
            <li><span className="font-medium text-foreground">Demokratia Portugal</span></li>
            <li>demokratia.pt</li>
            <li>
              {t('privacy.controllerEmail')}{' '}
              <a href="mailto:antonio.anacleto@gmail.com" className="text-primary hover:underline font-medium">
                antonio.anacleto@gmail.com
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
