'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Declaração para informar ao TypeScript sobre a propriedade adsbygoogle no objeto window.
declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const AD_CLIENT = 'ca-pub-9018474620860214';
const AD_SLOT = '6109446763';

export function AdBanner() {
  const pathname = usePathname();

  useEffect(() => {
    // Só tentamos carregar o anúncio se estivermos no browser
    if (typeof window === 'undefined') return;

    // Usamos um pequeno timeout para garantir que o componente está montado
    // e o Next.js completou a transição de rota.
    const timer = setTimeout(() => {
      try {
        // Verificamos se existe algum bloco de anúncios na página que ainda não foi processado.
        // O AdSense adiciona o atributo 'data-adsbygoogle-status' quando preenche o bloco.
        const unpopulatedAds = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
        
        if (unpopulatedAds.length > 0 && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (err) {
        // Silenciamos o erro "All ins elements already have ads" que é comum em SPAs
        // e não deve interromper a experiência do utilizador nem o build do Next.js.
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div key={pathname} className="py-6 my-4 border-y border-border/10 bg-muted/5 rounded-lg overflow-hidden flex justify-center items-center min-h-[100px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', height: 'auto' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
