'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  
  if (pathname === '/home' || pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  
  return (
    <nav className="flex items-center space-x-2 text-xs text-muted-foreground/60 mb-6 px-1" aria-label="Breadcrumb">
      <Link href="/home" className="hover:text-primary transition-colors flex items-center gap-1">
        <Home className="size-3" />
        <span>{t('nav.home')}</span>
      </Link>
      
      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        
        // Try to translate the segment, otherwise capitalize
        let label = segment;
        try {
           // Basic heuristic for common paths
           if (segment === 'partidos') label = t('nav.partidos');
           else if (segment === 'budget') label = t('nav.budget');
           else if (segment === 'irs') label = t('nav.irs');
           else if (segment === 'library') label = t('nav.library');
           else if (segment === 'about') label = t('nav.about');
           else if (segment === 'privacy') label = t('nav.privacy');
           else {
             label = segment.charAt(0).toUpperCase() + segment.slice(1);
           }
        } catch (e) {
           label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }

        return (
          <React.Fragment key={href}>
            <ChevronRight className="size-3 flex-shrink-0" />
            {isLast ? (
              <span className="font-medium text-foreground/80 truncate max-w-[150px]">{label}</span>
            ) : (
              <Link href={href} className="hover:text-primary transition-colors truncate max-w-[120px]">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
