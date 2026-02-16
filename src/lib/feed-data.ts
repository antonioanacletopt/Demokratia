import { Check, Scale, FileText, TrendingUp } from 'lucide-react';

export interface FeedItem {
  id: string;
  type: 'Alegação' | 'Nova Lei' | 'Análise';
  title: string;
  source: string;
  date: string;
  description: string;
  actionLink?: {
    href: string;
    label: string;
  };
  icon: React.ElementType;
}

export const feedData: FeedItem[] = [
    {
        id: '1',
        type: 'Alegação',
        title: '"A taxa de desemprego jovem duplicou no último ano"',
        source: 'Deputado do Partido Y',
        date: '2024-07-28',
        description: 'Durante o debate parlamentar, foi afirmado que o desemprego entre os jovens com menos de 25 anos registou um aumento de 100% face ao ano anterior.',
        actionLink: {
            href: '/fact-check?claim="A taxa de desemprego jovem duplicou no último ano"',
            label: 'Verificar Facto',
        },
        icon: Check,
    },
    {
        id: '2',
        type: 'Nova Lei',
        title: 'Proposta de Redução do IVA na Eletricidade para 6%',
        source: 'Governo',
        date: '2024-07-25',
        description: 'O governo apresentou uma proposta de lei para reduzir a taxa de IVA sobre o consumo de eletricidade e gás natural para a taxa reduzida de 6%.',
        actionLink: {
            href: '/simulator?policy=Redução da taxa de IVA sobre a eletricidade para 6%',
            label: 'Simular Impacto',
        },
        icon: Scale,
    },
    {
        id: '3',
        type: 'Análise',
        title: 'Crescimento do PIB no 2º Trimestre de 2024',
        source: 'INE - Instituto Nacional de Estatística',
        date: '2024-07-22',
        description: 'O INE publicou a estimativa rápida para o 2º trimestre de 2024, apontando para um crescimento homólogo do PIB de 1.8%, impulsionado pelas exportações de serviços.',
        actionLink: {
            href: '/dashboard',
            label: 'Explorar Dados',
        },
        icon: TrendingUp,
    },
     {
        id: '4',
        type: 'Nova Lei',
        title: 'Lei de Bases da Habitação: Novas Medidas',
        source: 'Diário da República',
        date: '2024-07-19',
        description: 'Foram publicadas novas alterações à Lei de Bases da Habitação, com foco no reforço do arrendamento acessível e na simplificação de licenciamentos para construção.',
        icon: FileText,
    },
];
