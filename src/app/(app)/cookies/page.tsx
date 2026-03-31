"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { CONSENT_KEY } from '@/components/CookieConsent';

function ManageCookiesButton({ label }: { label: string }) {
  const handleClick = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new Event('openCookieConsent'));
  };
  return (
    <Button onClick={handleClick} variant="outline" size="sm">
      {label}
    </Button>
  );
}

type CookieRow = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  type: 'essential' | 'analytics' | 'advertising';
};

export default function CookiesPage() {
  const { t } = useTranslation();

  const cookies: CookieRow[] = [
    {
      name: 'cookie-consent-v2',
      provider: 'Demokratia',
      purpose: t('cookiePage.table.consentPurpose'),
      duration: t('cookiePage.table.persistent'),
      type: 'essential',
    },
    {
      name: 'sidebar_state',
      provider: 'Demokratia',
      purpose: t('cookiePage.table.sidebarPurpose'),
      duration: '7 ' + t('cookiePage.table.days'),
      type: 'essential',
    },
    {
      name: '__session / Firebase Auth',
      provider: 'Google Firebase',
      purpose: t('cookiePage.table.authPurpose'),
      duration: t('cookiePage.table.session'),
      type: 'essential',
    },
    {
      name: '_ga',
      provider: 'Google Analytics',
      purpose: t('cookiePage.table.gaPurpose'),
      duration: '2 ' + t('cookiePage.table.years'),
      type: 'analytics',
    },
    {
      name: '_ga_*',
      provider: 'Google Analytics',
      purpose: t('cookiePage.table.gaSessionPurpose'),
      duration: '2 ' + t('cookiePage.table.years'),
      type: 'analytics',
    },
    {
      name: 'IDE / DSID',
      provider: 'Google DoubleClick',
      purpose: t('cookiePage.table.adsensePurpose'),
      duration: '13 ' + t('cookiePage.table.months'),
      type: 'advertising',
    },
    {
      name: 'test_cookie',
      provider: 'Google DoubleClick',
      purpose: t('cookiePage.table.testCookiePurpose'),
      duration: t('cookiePage.table.session'),
      type: 'advertising',
    },
  ];

  const typeBadge = (type: CookieRow['type']) => {
    if (type === 'essential') return <Badge variant="secondary">{t('cookies.essential')}</Badge>;
    if (type === 'analytics') return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{t('cookies.analytics')}</Badge>;
    return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">{t('cookies.advertising')}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">
          {t('cookiePage.title')}
        </h1>
        <p className="text-muted-foreground italic">{t('cookiePage.lastUpdated')}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('cookiePage.whatTitle')}</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground leading-relaxed space-y-2">
          <p>{t('cookiePage.whatDesc')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('cookiePage.typesTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <div className="space-y-1">
            <p className="font-medium text-foreground">{t('cookies.essential')}</p>
            <p>{t('cookiePage.essentialDesc')}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{t('cookies.analytics')}</p>
            <p>{t('cookiePage.analyticsFullDesc')}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{t('cookies.advertising')}</p>
            <p>{t('cookiePage.advertisingFullDesc')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('cookiePage.listTitle')}</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-semibold text-foreground">{t('cookiePage.table.name')}</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">{t('cookiePage.table.provider')}</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground hidden md:table-cell">{t('cookiePage.table.purpose')}</th>
                  <th className="pb-3 pr-4 font-semibold text-foreground hidden sm:table-cell">{t('cookiePage.table.duration')}</th>
                  <th className="pb-3 font-semibold text-foreground">{t('cookiePage.table.type')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cookies.map((c) => (
                  <tr key={c.name} className="align-top">
                    <td className="py-3 pr-4 font-mono text-xs text-foreground">{c.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.provider}</td>
                    <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{c.purpose}</td>
                    <td className="py-3 pr-4 text-muted-foreground hidden sm:table-cell whitespace-nowrap">{c.duration}</td>
                    <td className="py-3">{typeBadge(c.type)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader><CardTitle>{t('cookiePage.controlTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('cookiePage.controlDesc')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('cookiePage.controlBanner')}</li>
            <li>{t('cookiePage.controlBrowser')}</li>
            <li>
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {t('cookiePage.controlGoogle')}
              </a>
            </li>
          </ul>
          <div className="pt-2">
            <ManageCookiesButton label={t('cookies.managePreferences')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('cookiePage.contactTitle')}</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground leading-relaxed">
          <p>{t('cookiePage.contactDesc')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
