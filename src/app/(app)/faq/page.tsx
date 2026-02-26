
"use client";

import { useTranslation } from '@/lib/i18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FAQPage() {
  const { t } = useTranslation();

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { 
      q: 'Como posso sugerir novos dados?', 
      a: 'Pode utilizar o botão "Sugerir Nova Fonte" no Explorador de Dados ou enviar-nos uma mensagem direta através da nossa página de contacto.' 
    },
    { 
      q: 'O site tem publicidade?', 
      a: 'Sim. Utilizamos o Google AdSense para financiar os custos de servidor e processamento de IA, garantindo que o acesso à informação permanece gratuito para todos.' 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-headline tracking-tight flex items-center gap-3">
          <HelpCircle className="h-10 w-10 text-primary" />
          {t('faq.title')}
        </h1>
        <p className="text-xl text-muted-foreground">
          Respostas rápidas sobre a plataforma e a transparência de dados.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-2xl px-6 bg-card">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline hover:text-primary transition-colors text-left py-6">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="bg-primary/5 rounded-3xl p-10 border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold">Ainda tem dúvidas?</h2>
          <p className="text-muted-foreground">A nossa equipa está pronta para ajudar com qualquer questão técnica ou de dados.</p>
        </div>
        <Button asChild size="lg" className="px-8 shadow-lg">
          <Link href="/contact">
            <Mail className="mr-2 h-5 w-5" /> {t('nav.contact')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
