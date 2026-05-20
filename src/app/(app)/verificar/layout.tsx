import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar | Demokratia Portugal',
  description: 'Verifique factos políticos e económicos com IA e consulte legislação portuguesa em vigor.',
  keywords: ['fact-check', 'verificação de factos', 'legislação portuguesa', 'lei', 'Portugal', 'política'],
  openGraph: {
    title: 'Verificar Factos & Legislação | Demokratia',
    description: 'Verifique factos políticos e económicos com IA e consulte legislação portuguesa em vigor.',
    url: 'https://demokratia.pt/verificar',
  },
};

export default function VerificarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
