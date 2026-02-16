'use client';
        
import React from 'react';
import { usePathname } from 'next/navigation';

const AD_CLIENT = 'ca-pub-9018474620860214'; 
const AD_SLOT = '6109446763';

export function AdBanner() {
  const pathname = usePathname();

  // No carregamento inicial, o script adsbygoogle.js encontrará automaticamente todas as tags <ins>.
  // Para navegações de página subsequentes numa aplicação Next.js, precisamos de garantir que os novos espaços de anúncio são reconhecidos.
  // Ao definir uma 'key' única para a tag <ins> com base no URL (pathname), estamos a dizer
  // ao React para desmontar completamente o componente antigo e montar um novo a cada mudança de página.
  // Esta é a forma mais limpa de sinalizar ao script do AdSense que um novo espaço de anúncio vazio está disponível,
  // evitando o erro "already has ad in it" sem precisar de chamar manualmente adsbygoogle.push().

  return (
    <div className="py-4 text-center">
      <ins
        key={pathname} // ESTA É A PARTE CRUCIAL
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
