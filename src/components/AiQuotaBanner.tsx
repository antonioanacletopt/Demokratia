'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, CloudOff } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AiQuotaBanner() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  // We only show this if the environment variable is set to 'true'.
  // This allows us to toggle the error banner gracefully via Vercel/environment.
  const isQuotaExhausted = process.env.NEXT_PUBLIC_AI_QUOTA_EXHAUSTED === 'true';

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isQuotaExhausted || !isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-100 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 mt-0.5 bg-amber-200 dark:bg-amber-900/50 p-2 rounded-full">
              <CloudOff className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            </div>
            <div className="flex-1 pr-4">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400">
                {t('aiQuota.title')}
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">
                {t('aiQuota.description')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 -mr-1 -mt-1 p-2 rounded-md transition-colors hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 focus:outline-none"
            title={t('common.close')}
          >
            <span className="sr-only">{t('common.close')}</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
