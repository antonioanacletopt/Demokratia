'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BarChart3, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import ExplorerPage from './_components/Explorer';
import SimulationsPage from './_components/Simulations';

export default function ExplorarPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get('tab') === 'simular' ? 'simular' : 'dados';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    if (value === 'dados') params.delete('policy');
    if (value === 'simular') params.delete('request');
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full h-12 mb-6">
          <TabsTrigger value="dados" className="flex-1 gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            {t('nav.explorer')}
          </TabsTrigger>
          <TabsTrigger value="simular" className="flex-1 gap-2 text-sm">
            <Zap className="h-4 w-4" />
            {t('nav.simulations')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <ExplorerPage />
        </TabsContent>

        <TabsContent value="simular">
          <SimulationsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
