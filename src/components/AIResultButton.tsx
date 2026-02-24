
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { collection, query, where, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X, AlertTriangle, HelpCircle, Zap, Eye } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { safeDecode } from '@/lib/safe-decode';

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
  
  const getParam = (paramName: string) => {
      try {
          const url = new URL(href, 'https://demokratia.pt');
          const val = url.searchParams.get(paramName);
          return val ? safeDecode(val).trim() : null;
      } catch (e) { return null; }
  };

  const rawClaim = getParam('claim');
  const rawPolicy = getParam('policy');

  // Normalização e Limite para evitar erros de permissão em strings complexas
  const claim = useMemo(() => rawClaim ? rawClaim.substring(0, 500) : null, [rawClaim]);
  const policy = useMemo(() => rawPolicy ? rawPolicy.substring(0, 500) : null, [rawPolicy]);

  const factCheckQuery = useMemoFirebase(() => {
    if (!firestore || !claim) return null;
    try {
      const colRef = collection(firestore, 'publicFactChecks');
      return query(colRef, where('claim', '==', claim), limit(1));
    } catch (e) { return null; }
  }, [firestore, claim]);
  
  const { data: factCheckResults } = useCollection(factCheckQuery);

  const simulationQuery = useMemoFirebase(() => {
    if (!firestore || !policy) return null;
    try {
      const colRef = collection(firestore, 'publicSimulations');
      return query(colRef, where('title', '==', policy), limit(1));
    } catch (e) { return null; }
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
          <span className="flex items-center gap-1">{t('common.view')} <Eye className="h-3.5 w-3.5 ml-1" /></span>
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
          <span className="flex items-center gap-1">{t('common.view')} <Eye className="h-3.5 w-3.5 ml-1" /></span>
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} size={size}>
      <Link href={href}>
        {label}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
