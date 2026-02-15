'use client';
        
import Script from 'next/script';
import { Card } from '@/components/ui/card';

// IMPORTANTE: Para usar os seus próprios anúncios, substitua estes valores
// pelos seus códigos de cliente e de bloco de anúncios do Google AdMob.
//
// CRIAR UMA CONTA ADMOB É GRATUITO. Esta conta serve para que a Google
// lhe possa pagar pela publicidade mostrada na sua app. Não tem qualquer
// custo associado e é um serviço separado dos custos de alojamento da Firebase.
//
// Pode criar a sua conta e obter os códigos em: https://admob.google.com/
const AD_CLIENT = 'ca-pub-xxxxxxxxxxxxxxxx'; // Este é um código de teste
const AD_SLOT = 'yyyyyyyyyy'; // Este é um código de teste

export function AdBanner() {
  // Para evitar mostrar anúncios em ambiente de desenvolvimento e violar
  // as políticas do AdSense, mostramos um placeholder.
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className="p-4 text-center">
        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-sm text-muted-foreground">
            Espaço reservado para anúncio (visível apenas em produção).
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <div className="p-4 text-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <Script id="adsbygoogle-init" strategy="lazyOnload">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>
    </>
  );
}
