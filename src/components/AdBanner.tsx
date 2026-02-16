'use client';
        
import Script from 'next/script';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// =================================================================================
//  PASSO CRÍTICO: CONFIGURAR OS SEUS CÓDIGOS DE ANÚNCIOS DO GOOGLE ADMOB
// =================================================================================
// Para que a publicidade funcione e para que possa receber pagamentos da Google,
// tem de substituir os valores abaixo pelos seus próprios códigos.
//
// 1. Crie uma conta GRATUITA no Google AdMob: https://admob.google.com/
// 2. No AdMob, crie um novo bloco de anúncios ("Ad unit") para a sua aplicação.
// 3. Copie o seu "ID do editor" (Publisher ID) e cole-o em `AD_CLIENT`.
//    O formato é "ca-pub-XXXXXXXXXXXXXXXX".
// 4. Copie o seu "ID do bloco de anúncios" (Ad unit ID) e cole-o em `AD_SLOT`.
//    É um número de 10 dígitos.
//
// DEIXAR OS VALORES DE EXEMPLO ABAIXO NÃO VAI FUNCIONAR.
// =================================================================================
const AD_CLIENT = 'ca-pub-0000000000000000'; // SUBSTITUA ESTE VALOR
const AD_SLOT = '0000000000';             // SUBSTITUA ESTE VALOR


// Verifica se os códigos de anúncio ainda são os valores de exemplo
const isPlaceholder = AD_CLIENT.includes('0000000000000000') || AD_SLOT.includes('0000000000');

export function AdBanner() {
  // Em ambiente de desenvolvimento, mostramos sempre um placeholder informativo.
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className="py-4 text-center">
        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-sm text-muted-foreground">
            Espaço reservado para anúncio (visível apenas em produção após configuração).
          </p>
        </Card>
      </div>
    );
  }

  // Em produção, se os códigos não foram substituídos, mostramos um aviso bem visível.
  if (isPlaceholder) {
    return (
      <div className="py-4 text-center">
        <Card className="p-4 bg-destructive/10 border-destructive/50 border-dashed text-destructive">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Ação necessária: Configure os seus códigos de anúncio em <code className="bg-destructive/20 px-1 py-0.5 rounded text-red-900 dark:text-red-200">src/components/AdBanner.tsx</code> para ativar a publicidade.
            </p>
          </div>
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
        strategy="afterInteractive"
      />
      <div className="py-4 text-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <Script id="adsbygoogle-init" strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>
    </>
  );
}
