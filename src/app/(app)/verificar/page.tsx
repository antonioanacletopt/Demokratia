'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, Scale } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import FactCheckPage from './_components/FactCheck';
import LegislationPage from './_components/Legislation';

export default function VerificarPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get('tab') === 'legislation' ? 'legislation' : 'facto';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    // Clear the other tab's params to avoid confusion
    if (value === 'facto') params.delete('question');
    if (value === 'legislation') params.delete('claim');
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full h-12 mb-6">
          <TabsTrigger value="facto" className="flex-1 gap-2 text-sm">
            <ShieldCheck className="h-4 w-4" />
            {t('factCheck.title')}
          </TabsTrigger>
          <TabsTrigger value="legislation" className="flex-1 gap-2 text-sm">
            <Scale className="h-4 w-4" />
            {t('legislation.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facto">
          <FactCheckPage />
        </TabsContent>

        <TabsContent value="legislation">
          <LegislationPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
