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
    // Só tentamos carregar o anúncio se não estivermos num ambiente de desenvolvimento local
    // e se o objeto adsbygoogle estiver disponível.
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // O erro "All 'ins' elements already have ads in them" é comum e inofensivo em SPAs
      console.warn("AdSense logic executing...", err);
    }
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
