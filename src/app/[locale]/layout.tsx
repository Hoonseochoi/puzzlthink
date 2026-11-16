import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const BASE_URL = 'https://puzzlthink.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'PUZZL THINK — Online Board Games',
    template: '%s | PUZZL THINK',
  },
  description: 'Play Wallgo and Sudoku online. Clean, thoughtful board games you can start instantly.',
  keywords: [
    '벽바둑', 'wallgo', '스도쿠', 'sudoku', 'online board game', 'logic game', 'puzzlthink',
  ],
  authors: [{ name: 'PUZZL THINK', url: BASE_URL }],
  openGraph: {
    type: 'website',
    siteName: 'PUZZL THINK',
    title: 'PUZZL THINK — Online Board Games',
    description: 'Play Wallgo and Sudoku online — no download needed.',
    url: BASE_URL,
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'PUZZL THINK — Free Sudoku Game' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUZZL THINK — Online Board Games',
    description: 'Play Wallgo and Sudoku online.',
    images: [`${BASE_URL}/og-image.png`],
  },
  alternates: { canonical: BASE_URL },
  robots: { index: true, follow: true },
  verification: {
    google: 'LVGChmL_LA3ejr3mhQtjZYICee9HypNE6k9NnqaZprA',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PUZZL THINK',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};


export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {

  // We need to await params in Next.js 15
  const { locale } = await params;

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#f3f0e8] text-[#17201e] font-sans`} suppressHydrationWarning>
        <div suppressHydrationWarning>
          <NextIntlClientProvider messages={messages}>
            <GlobalHeader />
            {children}
            <GlobalFooter />
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
