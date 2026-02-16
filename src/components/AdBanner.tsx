'use client';
        
import React, { useEffect } from 'react';

const AD_CLIENT = 'ca-pub-9018474620860214'; 
const AD_SLOT = '6109446763';

export function AdBanner() {

  useEffect(() => {
    try {
      // A chamada .push() diz ao AdSense para renderizar um anúncio neste espaço.
      // Colocamos num try/catch porque os bloqueadores de anúncios (ad blockers)
      // podem bloquear o 'adsbygoogle' e causar um erro.
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // É normal que isto dê erro se um bloqueador de anúncios estiver ativo,
      // por isso podemos ignorar silenciosamente. A consola do browser mostrará
      // o erro em ambiente de desenvolvimento se 'adsbygoogle' não for encontrado.
      console.error("AdSense error (expected if using an ad blocker):", err);
    }
  }, []); // O array vazio [] garante que este efeito corre apenas uma vez

  // Renderizamos sempre o espaço <ins> que o AdSense irá preencher.
  // Em desenvolvimento, se não houver anúncios, o espaço ficará vazio.
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
