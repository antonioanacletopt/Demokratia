
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9018474620860214"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
