'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection } from '@/firebase';
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
  'true': { icon: Check, className: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' },
  'false': { icon: X, className: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200' },
  'misleading': { icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200' },
  'no_evidence': { icon: HelpCircle, className: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200' },
};

export default function AIResultButton({ href, label, variant = "default", size = "default" }: AIResultButtonProps) {
  const { t } = useTranslation();

  const verdictTranslationMap = useMemo(() => ({
    'true': t('verdict.true'),
    'false': t('verdict.false'),
    'misleading': t('verdict.misleading'),
    'no_evidence': t('verdict.no_evidence'),
  }), [t]);
  
  const articleId = useMemo(() => {
    try {
      const url = new URL(href, 'http://dummy.com');
      const b64 = url.pathname.split('/').pop() || '';
      return safeDecode(b64);
    } catch {
      return null;
    }
  }, [href]);

  const { data: factCheckResults } = useCollection(
    articleId ? 'fact-checks' : null,
    { where: [['articleId', '==', articleId]], limit: 1 },
    30_000, // slower poll for badge enrichment
  );

  const { data: simulationResults } = useCollection(
    articleId ? 'simulations' : null,
    { where: [['articleId', '==', articleId]], limit: 1 },
    30_000,
  );

  const factCheck = factCheckResults?.[0];
  const simulation = simulationResults?.[0];

  if (factCheck) {
    const verdictKey = factCheck.verdict as keyof typeof verdictStyles;
    const style = verdictStyles[verdictKey] || verdictStyles['no_evidence'];
    const Icon = style.icon;
    const verdictText = verdictTranslationMap[verdictKey] || verdictTranslationMap['no_evidence'];

    return (
      <Button asChild variant="default" size={size} className={style.className}>
        <Link href={href}>
          <Icon className="mr-2 h-4 w-4" />
          <span className="font-bold">[{verdictText.toUpperCase()}]</span>
          <span className="mx-2 opacity-50">|</span>
          <span className="flex items-center gap-1">{t('common.view')} <Eye className="h-3.5 w-3.5 ml-1" /></span>
        </Link>
      </Button>
    );
  }

  if (simulation) {
    return (
      <Button asChild variant="default" size={size} className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200">
        <Link href={href}>
          <Zap className="mr-2 h-4 w-4" />
          <span className="font-bold">[{t('common.simulation').toUpperCase()}]</span>
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
