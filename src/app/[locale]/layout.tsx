import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import { routing } from '@/i18n/routing';
import { ADSENSE_CLIENT } from '@/lib/adsense';
import '../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'ko')) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {ADSENSE_CLIENT && (
        <head>
          <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous" />
        </head>
      )}
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f3f0e8] font-sans text-[#17201e] antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <GlobalHeader />
          {children}
          <GlobalFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
