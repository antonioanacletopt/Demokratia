
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">{t('privacy.title')}</h1>
        <p className="text-muted-foreground italic">Última atualização: Março 2026</p>
      </div>

      <Card>
        <CardHeader><CardTitle>1. Introdução</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.intro')}</p>
          <p>A Demokratia está empenhada em proteger a privacidade dos cidadãos que utilizam a nossa plataforma de transparência de dados.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. {t('privacy.dataTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.dataDesc')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dados de conta (Nome e Email via Google Login).</li>
            <li>Histórico de pesquisas e simulações (apenas para utilizadores registados).</li>
            <li>Dados técnicos de navegação (endereço IP, tipo de navegador).</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-accent/20 bg-accent/5">
        <CardHeader><CardTitle className="text-accent">{t('privacy.cookiesTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.cookiesDesc')}</p>
          <div className="bg-background/50 p-4 rounded-xl border space-y-3">
            <h4 className="font-bold text-foreground">Google AdSense e Cookies DoubleClick</h4>
            <p className="text-sm">
              O Google, como fornecedor de terceiros, utiliza cookies para servir anúncios no nosso site. O uso do cookie DoubleClick pelo Google permite-lhe servir anúncios aos nossos utilizadores com base na sua visita à Demokratia e a outros sites na Internet.
            </p>
            <p className="text-sm">
              Os utilizadores podem desativar o uso do cookie DoubleClick visitando as definições de anúncios do Google.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>4. {t('privacy.purposeTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.purposeDesc')}</p>
          <p>Utilizamos os dados para melhorar o motor de IA, personalizar as simulações económicas e garantir que os fact-checks são relevantes para a comunidade.</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader><CardTitle>5. {t('privacy.rightsTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>{t('privacy.rightsDesc')}</p>
          <p>Nos termos do RGPD, tem o direito de aceder, retificar ou apagar os seus dados. Para exercer estes direitos, visite a página de <Link href="/profile" className="text-primary hover:underline font-medium">{t('nav.profile')}</Link> ou contacte-nos através do formulário de apoio.</p>
        </CardContent>
      </Card>
    </div>
  );
}
