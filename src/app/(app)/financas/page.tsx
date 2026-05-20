'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Wallet, Calculator, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import BudgetPage from './_components/Budget';
import IrsPage from './_components/Irs';
import InflationPage from './_components/Inflation';

export default function FinancasPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = searchParams.get('tab');
  const activeTab = raw === 'irs' ? 'irs' : raw === 'inflacao' ? 'inflacao' : 'orcamento';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full h-12 mb-6">
          <TabsTrigger value="orcamento" className="flex-1 gap-2 text-sm">
            <Wallet className="h-4 w-4" />
            {t('nav.budget')}
          </TabsTrigger>
          <TabsTrigger value="irs" className="flex-1 gap-2 text-sm">
            <Calculator className="h-4 w-4" />
            {t('nav.irs')}
          </TabsTrigger>
          <TabsTrigger value="inflacao" className="flex-1 gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            {t('nav.inflation')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orcamento">
          <BudgetPage />
        </TabsContent>

        <TabsContent value="irs">
          <IrsPage />
        </TabsContent>

        <TabsContent value="inflacao">
          <InflationPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
