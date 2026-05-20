'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, dbAdd, nowTs } from '@/firebase';
import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareWarning, ShieldAlert } from 'lucide-react';

const refutationSchema = (t: any) => z.object({
  refutationText: z.string().min(20, t('refutation.textMinError')),
  evidenceLinks: z.string().optional(),
});

type RefutationFormValues = z.infer<ReturnType<typeof refutationSchema>>;

interface RefutationDialogProps {
  contentId: string;
  trigger?: React.ReactNode;
}

export function RefutationDialog({ contentId, trigger }: RefutationDialogProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RefutationFormValues>({
    resolver: zodResolver(refutationSchema(t)),
    defaultValues: { refutationText: '', evidenceLinks: '' },
  });

  const onSubmit = (values: RefutationFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    dbAdd('refutations', {
      userId: user.uid,
      userName: user.displayName || t('refutation.anonymous'),
      aiContentIdentifier: contentId,
      refutationText: values.refutationText,
      evidenceLinks: values.evidenceLinks,
      status: 'pending',
      submissionDate: nowTs(),
    })
      .then(() => {
        toast({ title: t('common.success'), description: t('refutation.success') });
        setIsOpen(false);
        form.reset();
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive">
            <MessageSquareWarning className="h-3.5 w-3.5" />
            {t('refutation.refuteBtn')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {t('refutation.title')}
          </DialogTitle>
          <DialogDescription>{t('refutation.description')}</DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">{t('refutation.loginPrompt')}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="refutationText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('refutation.label')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('refutation.placeholder')} 
                        rows={5} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evidenceLinks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('refutation.evidence')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('refutation.evidencePlaceholder')} 
                        rows={2} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">{t('common.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('refutation.submitBtn')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
