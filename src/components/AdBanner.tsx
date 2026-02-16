'use client';
        
import React from 'react';
import Script from 'next/script';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// =================================================================================
//  PASSO CRÍTICO: CONFIGURAR O SEU CÓDIGO DE ANÚNCIO DO GOOGLE ADSENSE
// =================================================================================
// O seu ID de Editor já foi configurado. Só precisa de substituir o valor
// de AD_SLOT abaixo quando o tiver.
//
// 1. Após o seu site ser aprovado no AdSense, crie um "Bloco de anúncios" (Ad Unit).
// 2. Copie o seu "ID do bloco de anúncios" (Ad unit ID) e cole-o em `AD_SLOT`.
//    É um número com cerca de 10 dígitos.
//
// DEIXAR O VALOR DE EXEMPLO ABAIXO NÃO VAI FUNCIONAR.
// =================================================================================
const AD_CLIENT = 'ca-pub-9018474620860214'; // O seu ID de Editor (Já configurado)
const AD_SLOT = '6109446763';             // SUBSTITUA ESTE VALOR PELO SEU ID DE BLOCO DE ANÚNCIOS


// Verifica se o código do bloco de anúncio ainda é o valor de exemplo
const isPlaceholder = AD_SLOT.includes('0000000000');

export function AdBanner() {
  const id = React.useId();

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

  // Em produção, se o código do bloco de anúncio não foi substituído, mostramos um aviso bem visível.
  if (isPlaceholder) {
    return (
      <div className="py-4 text-center">
        <Card className="p-4 bg-destructive/10 border-destructive/50 border-dashed text-destructive">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Ação necessária: Configure o seu código <code className="bg-destructive/20 px-1 py-0.5 rounded text-red-900 dark:text-red-200">AD_SLOT</code> em <code className="bg-destructive/20 px-1 py-0.5 rounded text-red-900 dark:text-red-200">src/components/AdBanner.tsx</code> para ativar a publicidade.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Em produção e com os códigos configurados, mostramos o anúncio real.
  // O script principal do AdSense já é carregado no layout (src/app/layout.tsx).
  // Aqui, apenas "empurramos" um anúncio para o espaço <ins>.
  return (
    <div className="py-4 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <Script id={`adsbygoogle-init-${id}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
