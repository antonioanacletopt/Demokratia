import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorar | Demokratia Portugal',
  description: 'Explore dados públicos portugueses com IA e simule o impacto económico de políticas públicas.',
  keywords: ['dados públicos', 'explorador de dados', 'simulação económica', 'Portugal', 'INE', 'política económica'],
  openGraph: {
    title: 'Explorar Dados & Simular Políticas | Demokratia',
    description: 'Explore dados públicos portugueses com IA e simule o impacto económico de políticas públicas.',
    url: 'https://demokratia.pt/explorar',
  },
};

export default function ExplorarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
