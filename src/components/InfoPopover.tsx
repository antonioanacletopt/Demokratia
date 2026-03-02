
'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Info, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface InfoPopoverProps {
  title: string;
  content: string;
  link?: string;
  linkLabel?: string;
  className?: string;
}

export function InfoPopover({ title, content, link, linkLabel, className }: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-4 w-4 ml-1.5 rounded-full text-muted-foreground hover:text-primary shrink-0", className)}
        >
          <Info className="h-3.5 w-3.5" />
          <span className="sr-only">Mais informações sobre {title}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-xl border-primary/20 z-[110]">
        <div className="space-y-2">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {content}
          </p>
          {link && (
            <Link 
              href={link} 
              target="_blank" 
              className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline pt-1"
            >
              {linkLabel || 'Consultar Fonte Oficial'} <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
