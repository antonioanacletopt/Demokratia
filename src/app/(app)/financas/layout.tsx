import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'As Minhas Finanças | Demokratia Portugal',
  description: 'Calcule o seu IRS, simule o orçamento familiar e acompanhe a inflação real em Portugal.',
  keywords: ['IRS', 'simulador IRS', 'orçamento familiar', 'inflação Portugal', 'custo de vida', 'finanças pessoais'],
  openGraph: {
    title: 'As Minhas Finanças | Demokratia',
    description: 'Calcule o seu IRS, simule o orçamento familiar e acompanhe a inflação real em Portugal.',
    url: 'https://demokratia.pt/financas',
  },
};

export default function FinancasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
