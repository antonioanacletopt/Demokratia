import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';

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
        url: 'https://images.unsplash.com/photo-1527768487232-249051d95e86?w=1200', // Imagem de Lisboa
        width: 1200,
        height: 630,
        alt: 'Vista sobre os telhados de Lisboa, Portugal',
      },
    ],
    locale: 'pt_PT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: ['https://images.unsplash.com/photo-1527768487232-249051d95e86?w=1200'],
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <Script
          id="adsense-verification"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9018474620860214"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
