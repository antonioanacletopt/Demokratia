
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Cookie, X, Settings2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const CONSENT_KEY = 'cookie-consent-v2';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
    const handleOpen = () => {
      setIsVisible(true);
      setShowCustomize(false);
    };
    window.addEventListener('openCookieConsent', handleOpen);
    return () => window.removeEventListener('openCookieConsent', handleOpen);
  }, []);

  const saveAndClose = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () =>
    saveAndClose({ essential: true, analytics: true, advertising: true });
  const handleRejectAll = () =>
    saveAndClose({ essential: true, analytics: false, advertising: false });
  const handleSavePreferences = () => saveAndClose(preferences);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:max-w-lg">
      <Card className="border-primary/20 shadow-2xl bg-background/95 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full shrink-0">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold leading-none">{t('cookies.title')}</h3>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label={t('common.close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('cookies.desc')}{' '}
                <Link href="/cookies" className="text-primary font-medium hover:underline">
                  {t('nav.cookies')}
                </Link>.
              </p>

              {showCustomize && (
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Essenciais */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm font-medium">{t('cookies.essential')}</p>
                      <p className="text-xs text-muted-foreground">{t('cookies.essentialDesc')}</p>
                    </div>
                    <Switch checked disabled aria-readonly />
                  </div>
                  {/* Análise */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm font-medium">{t('cookies.analytics')}</p>
                      <p className="text-xs text-muted-foreground">{t('cookies.analyticsDesc')}</p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
                    />
                  </div>
                  {/* Publicidade */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm font-medium">{t('cookies.advertising')}</p>
                      <p className="text-xs text-muted-foreground">{t('cookies.advertisingDesc')}</p>
                    </div>
                    <Switch
                      checked={preferences.advertising}
                      onCheckedChange={(v) => setPreferences((p) => ({ ...p, advertising: v }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button onClick={handleAcceptAll} size="sm" className="flex-1 sm:flex-none">
                  {t('cookies.acceptAll')}
                </Button>
                {showCustomize ? (
                  <Button
                    onClick={handleSavePreferences}
                    size="sm"
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                  >
                    {t('cookies.savePreferences')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleRejectAll}
                    size="sm"
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                  >
                    {t('cookies.rejectAll')}
                  </Button>
                )}
                <Button
                  onClick={() => setShowCustomize((v) => !v)}
                  size="sm"
                  variant="ghost"
                  className="flex-none gap-1.5 text-muted-foreground"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  {t('cookies.customize')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
