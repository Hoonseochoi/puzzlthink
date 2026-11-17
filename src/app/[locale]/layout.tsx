import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import GlobalHeader from '@/components/GlobalHeader';
import { AuthProvider } from '@/components/AuthProvider';
import HallCelebration from '@/components/HallCelebration';
import GlobalFooter from '@/components/GlobalFooter';
import InstallBanner from '@/components/InstallBanner';
import OnlineCount from '@/components/OnlineCount';
import { routing } from '@/i18n/routing';
import { ADSENSE_CLIENT } from '@/lib/adsense';
import { GA_ID } from '@/lib/analytics';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.puzzlthink.com'),
  applicationName: 'PUZZLTHINK',
  appleWebApp: { capable: true, title: 'PUZZLTHINK', statusBarStyle: 'default' },
};

export const viewport: Viewport = { themeColor: '#f3f0e8' };

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
          <AuthProvider>
          <InstallBanner />
          <GlobalHeader />
          {children}
          <GlobalFooter />
          <HallCelebration />
          <OnlineCount />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
