'use client';
        
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';

const AD_CLIENT = 'ca-pub-9018474620860214'; 
const AD_SLOT = '6109446763';

export function AdBanner() {

  useEffect(() => {
    // Apenas executamos a lógica de anúncios em ambiente de produção
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    try {
      // A chamada .push() diz ao AdSense para renderizar um anúncio neste espaço.
      // Colocamos num try/catch porque os bloqueadores de anúncios (ad blockers)
      // podem bloquear o 'adsbygoogle' e causar um erro.
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // É normal que isto dê erro se um bloqueador de anúncios estiver ativo,
      // por isso podemos ignorar silenciosamente em produção.
      if (process.env.NODE_ENV === 'development') {
        console.error("AdSense error:", err);
      }
    }
  }, []); // O array vazio [] garante que este efeito corre apenas uma vez

  // Em desenvolvimento, mostramos um placeholder para saber que o componente está lá.
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className="py-4 text-center">
        <Card className="p-4 bg-muted/30 border-dashed">
          <p className="text-sm text-muted-foreground">
            Espaço reservado para anúncio (visível apenas em produção).
          </p>
        </Card>
      </div>
    );
  }

  // Em produção, renderizamos o espaço <ins> que o useEffect irá preencher.
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
