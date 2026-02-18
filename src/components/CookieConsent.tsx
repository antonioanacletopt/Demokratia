
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:max-w-md">
      <Card className="border-primary/20 shadow-2xl bg-background/95 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold leading-none pt-1">Respeitamos a sua privacidade</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos cookies para melhorar a sua experiência, autenticação e publicidade. Ao continuar, aceita a nossa{' '}
                <Link href="/privacy" className="text-primary font-medium hover:underline">
                  Política de Privacidade e Cookies
                </Link>.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleAccept} size="sm" className="w-full sm:w-auto px-8">
                  Aceitar
                </Button>
                <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Fechar
                </Button>
              </div>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
