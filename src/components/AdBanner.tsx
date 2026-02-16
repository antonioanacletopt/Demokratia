'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Declaração para informar ao TypeScript sobre a propriedade adsbygoogle no objeto window.
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AD_CLIENT = 'ca-pub-9018474620860214';
const AD_SLOT = '6109446763';

export function AdBanner() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Tenta acionar um anúncio. O `window.adsbygoogle` é inicializado pelo script
      // no layout principal. O `|| []` é uma segurança.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Erro ao acionar o anúncio do AdSense:", err);
    }
  }, [pathname]); // O 'pathname' como dependência garante que isto é re-executado em cada navegação de página.

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
    </div>
  );
}
