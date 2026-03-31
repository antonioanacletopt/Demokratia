'use client';

import { useState } from 'react';
import { Share2, Check, Copy, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  size?: 'default' | 'sm';
}

export function SocialShare({
  url,
  title,
  description,
  className,
  size = 'sm',
}: SocialShareProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || 'Demokratia Portugal';
  const shareText = description
    ? `${shareTitle} — ${description}`
    : shareTitle;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const networks = [
    {
      label: 'X / Twitter',
      icon: Twitter,
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'hover:bg-black hover:text-white',
    },
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2] hover:text-white',
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366] hover:text-white',
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2] hover:text-white',
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: t('common.linkCopied') });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: 'destructive', title: t('common.error') });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn('gap-1.5', size === 'sm' && 'h-8 text-xs', className)}
        >
          <Share2 className="h-3.5 w-3.5" />
          {t('common.share')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3" align="end">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {t('common.shareVia')}
        </p>
        <div className="grid grid-cols-4 gap-1 mb-2">
          {networks.map(({ label, icon: Icon, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors border border-transparent',
                'text-muted-foreground hover:border-current',
                color
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] leading-none">{label.split(' ')[0]}</span>
            </a>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : (
            <Copy className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">{copied ? t('common.linkCopied') : t('common.copyLink')}</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
