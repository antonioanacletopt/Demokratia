'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X, AlertTriangle, HelpCircle, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface AIResultButtonProps {
  href: string;
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const verdictStyles = {
  'Verdadeiro': { icon: Check, className: 'bg-green-600 hover:bg-green-700 text-white border-none' },
  'Falso': { icon: X, className: 'bg-red-600 hover:bg-red-700 text-white border-none' },
  'Enganador': { icon: AlertTriangle, className: 'bg-amber-500 hover:bg-amber-600 text-white border-none' },
  'Sem Evidência': { icon: HelpCircle, className: 'bg-slate-500 hover:bg-slate-600 text-white border-none' },
};

export function AIResultButton({ href, label, variant = "secondary", size = "sm" }: AIResultButtonProps) {
  const { t } = useTranslation();
  const firestore = useFirestore();
  
  // Analisamos o link para ver se já existe um resultado na base de dados
  const url = new URL(href, 'https://demokratia.pt');
  const claim = url.searchParams.get('claim');
  const policy = url.searchParams.get('policy');

  const factCheckQuery = useMemoFirebase(() => {
    if (!firestore || !claim) return null;
    return query(collection(firestore, 'publicFactChecks'), where('claim', '==', claim), limit(1));
  }, [firestore, claim]);
  const { data: factCheckResults } = useCollection(factCheckQuery);

  const simulationQuery = useMemoFirebase(() => {
    if (!firestore || !policy) return null;
    return query(collection(firestore, 'publicSimulations'), where('inputVariables', '==', policy), limit(1));
  }, [firestore, policy]);
  const { data: simulationResults } = useCollection(simulationQuery);

  const factCheck = factCheckResults?.[0];
  const simulation = simulationResults?.[0];

  if (factCheck) {
    const style = verdictStyles[factCheck.verdict as keyof typeof verdictStyles] || verdictStyles['Sem Evidência'];
    const Icon = style.icon;
    return (
      <Button asChild variant="default" size={size} className={style.className}>
        <Link href={href}>
          <Icon className="mr-2 h-4 w-4" />
          <span className="font-bold">[{factCheck.verdict.toUpperCase()}]</span>
          <span className="mx-2 opacity-50">|</span>
          {t('common.view')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  if (simulation) {
    return (
      <Button asChild variant="default" size={size} className="bg-primary hover:bg-primary/90 text-white border-none">
        <Link href={href}>
          <Zap className="mr-2 h-4 w-4 fill-current" />
          <span className="font-bold">[{t('common.simulate').toUpperCase()}]</span>
          <span className="mx-2 opacity-50">|</span>
          {t('common.view')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  // Botão padrão se não houver resultado prévio
  return (
    <Button asChild variant={variant} size={size}>
      <Link href={href}>
        {label}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
