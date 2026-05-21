
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ClientClerkProvider } from '@/components/clerk-provider';
import { LanguageProvider } from '@/lib/i18n';

const title = 'Demokratia Portugal: Dados, Análises e Simulações';
const description = 'Plataforma para exploração de dados públicos, verificação de factos e simulação de políticas económicas e sociais em Portugal.';
const url = 'https://demokratia.pt';

export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: ['Portugal', 'economia', 'política', 'dados públicos', 'simulador económico', 'fact-checking', 'orçamento de estado', 'INE', 'Pordata', 'eleições'],
  metadataBase: new URL(url),
  openGraph: {
    title: title,
    description: description,
    url: url,
    siteName: 'Demokratia Portugal',
    images: [
      {
        url: 'https://demokratia.pt/marketing_post_final.png',
        width: 1200,
        height: 630,
        alt: 'Demokratia Portugal - Transparência de Dados',
      },
    ],
    locale: 'pt_PT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: ['https://demokratia.pt/marketing_post_final.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <body className="font-body antialiased">
        <ClientClerkProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ClientClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
