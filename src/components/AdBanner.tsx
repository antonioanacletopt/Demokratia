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
      // Este erro é comum em ambientes de desenvolvimento com navegação rápida (SPA)
      // e pode ser ignorado. Ocorre quando o AdSense tenta preencher um espaço
      // que já contém um anúncio. A 'key' no div abaixo resolve isto para navegações de página.
      console.warn("AdSense warning (can be ignored in dev):", err);
    }
  }, [pathname]);

  // A 'key={pathname}' é crucial. Ela força o React a desmontar e remontar este componente
  // sempre que a URL muda, o que dá ao AdSense um novo elemento <ins> limpo para trabalhar,
  // resolvendo o erro "All 'ins' elements already have ads in them".
  return (
    <div key={pathname} className="py-4 text-center">
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
