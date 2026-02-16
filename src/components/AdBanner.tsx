'use client';
        
import Script from 'next/script';
import { Card } from '@/components/ui/card';

// =================================================================================
//  PASSO CRÍTICO: CONFIGURAR OS SEUS CÓDIGOS DE ANÚNCIOS
// =================================================================================
// Para que a publicidade funcione e para que possa receber pagamentos da Google,
// tem de substituir os valores abaixo pelos seus próprios códigos do Google AdMob.
//
// 1. Crie uma conta GRATUITA no Google AdMob: https://admob.google.com/
// 2. Crie um novo bloco de anúncios para a sua aplicação.
// 3. Copie o seu "ID do editor" (Publisher ID) e cole-o em `AD_CLIENT`.
// 4. Copie o seu "ID do bloco de anúncios" (Ad unit ID) e cole-o em `AD_SLOT`.
//
// DEIXAR OS VALORES DE EXEMPLO ABAIXO NÃO VAI FUNCIONAR EM PRODUÇÃO.
// =================================================================================
const AD_CLIENT = 'ca-pub-YOUR_PUBLISHER_ID'; // SUBSTITUA ESTE VALOR
const AD_SLOT = 'YOUR_AD_UNIT_ID'; // SUBSTITUA ESTE VALOR


// Verifica se os códigos de anúncio ainda são os valores de exemplo
const isPlaceholder = AD_CLIENT.includes('YOUR_PUBLISHER_ID') || AD_SLOT.includes('YOUR_AD_UNIT_ID');

export function AdBanner() {
  // Em ambiente de desenvolvimento, mostramos sempre um placeholder.
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

  // Em produção, se os códigos não foram substituídos, mostramos um aviso.
  if (isPlaceholder) {
    return (
      <div className="p-4 text-center">
        <Card className="p-4 bg-destructive/10 border-destructive/50 border-dashed">
          <p className="text-sm font-medium text-destructive">
            Ação necessária: Configure os seus códigos de anúncio em <code className="bg-destructive/20 px-1 py-0.5 rounded">src/components/AdBanner.tsx</code>.
          </p>
        </Card>
      </div>
    );
  }

  // Em produção e com os códigos configurados, mostramos o anúncio real.
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
