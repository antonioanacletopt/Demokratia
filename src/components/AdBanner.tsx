'use client';
        
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AD_CLIENT = 'ca-pub-9018474620860214'; 
const AD_SLOT = '6109446763';

export function AdBanner() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // Este erro pode acontecer se um bloqueador de anúncios estiver ativo.
      // Podemos ignorá-lo silenciosamente.
    }
  }, [pathname]); // O efeito volta a ser executado quando o caminho muda

  return (
    <div className="py-4 text-center">
      <ins
        key={pathname} // Força a recriação do elemento na navegação
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
