import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import GoogleAnalyticsTag from '@/components/GoogleAnalyticsTag';
import GlobalHeader from '@/components/GlobalHeader';
import { AuthProvider } from '@/components/AuthProvider';
import HallCelebration from '@/components/HallCelebration';
import HardClearCelebration from '@/components/HardClearCelebration';
import HellClearCelebration from '@/components/hell/HellClearCelebration';
import OpenResultCelebration from '@/components/OpenResultCelebration';
import NicknamePrompt from '@/components/NicknamePrompt';
import GlobalFooter from '@/components/GlobalFooter';
import InstallBanner from '@/components/InstallBanner';
import OnlineCount from '@/components/OnlineCount';
import LiveIsland from '@/components/LiveIsland';
import RoomChat from '@/components/RoomChat';
import LoungeChat from '@/components/LoungeChat';
import { routing } from '@/i18n/routing';
import { GA_ID } from '@/lib/analytics';
import '../globals.css';
import { ADSENSE_CLIENT } from '@/lib/adsense';

// Search-console ownership tags. These codes are public (they sit in the page HTML); an env var overrides.
const GOOGLE_VERIFY = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_VERIFY = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || 'daac49e52f997a9e91b9d086787f073f54eb3b65'; // Naver Search Advisor (public value)

export const metadata: Metadata = {
  metadataBase: new URL('https://www.puzzlthink.com'),
  applicationName: 'PUZZLTHINK',
  title: { default: 'PUZZLTHINK', template: '%s' },
  creator: 'PUZZLTHINK',
  publisher: 'PUZZLTHINK',
  category: 'games',
  formatDetection: { telephone: false },
  appleWebApp: { capable: true, title: 'PUZZLTHINK', statusBarStyle: 'default' },
  ...(GOOGLE_VERIFY || NAVER_VERIFY ? {
    verification: {
      ...(GOOGLE_VERIFY ? { google: GOOGLE_VERIFY } : {}),
      ...(NAVER_VERIFY ? { other: { 'naver-site-verification': NAVER_VERIFY } } : {}),
    },
  } : {}),
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
          <HardClearCelebration />
          <HellClearCelebration />
          <OpenResultCelebration />
          <NicknamePrompt />
          <OnlineCount />
          <LiveIsland />
          <RoomChat />
          <LoungeChat />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
      {GA_ID && <GoogleAnalyticsTag gaId={GA_ID} />}
    </html>
  );
}
