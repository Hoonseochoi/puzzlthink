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
import IconUnlock from '@/components/IconUnlock';
import SupporterThanks from '@/components/SupporterThanks';
import CrownLost from '@/components/CrownLost';
import PlayTimeTracker from '@/components/PlayTimeTracker';
import OpenResultCelebration from '@/components/OpenResultCelebration';
import NicknamePrompt from '@/components/NicknamePrompt';
import { AppTesterPopup } from '@/components/AppTesterInvite';
import GlobalFooter from '@/components/GlobalFooter';
import MobileTabBar from '@/components/MobileTabBar';
import InstallBanner from '@/components/InstallBanner';
import OnlineCount from '@/components/OnlineCount';
import LiveIsland from '@/components/LiveIsland';
import RoomChat from '@/components/RoomChat';
import LoungeChat from '@/components/LoungeChat';
import RoomHostNotice from '@/components/RoomHostNotice';
import { routing } from '@/i18n/routing';
import { GA_ID } from '@/lib/analytics';
import '../globals.css';
import { ADSENSE_CLIENT } from '@/lib/adsense';
import { GAMES } from '@/lib/gameCatalog';
import { hiddenGameRoutes, playAppCss, playAppHeadScript } from '@/lib/playApp';
import PlayAppGuard from '@/components/playApp/PlayAppGuard';

// Google Play app mode (src/lib/playApp.ts): decided before the first paint; the stylesheet is inert on the web.
const PLAY_APP_SCRIPT = playAppHeadScript(ADSENSE_CLIENT);
const PLAY_APP_CSS = playAppCss(hiddenGameRoutes(GAMES));

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

/**
 * Right after a deploy a browser can ask for a new /_next/static file a moment before it is served everywhere, get
 * a 404, and keep that 404 for a year (the static files are cached `immutable`, and so are their 404s): the page
 * then shows "couldn't load" on every visit. When a static file fails to load, fetch it again past the cache
 * (which replaces the stuck 404) and, if it is there now, reload once. sessionStorage stops it from looping.
 */
const STATIC_HEAL = String.raw`(function(){
var bad={},timer=0;
function add(u){if(!u||u.indexOf('/_next/static/')<0)return;bad[u]=1;clearTimeout(timer);timer=setTimeout(heal,400)}
function scan(){try{performance.getEntriesByType('resource').forEach(function(x){if(x.responseStatus===404)add(x.name)})}catch(e){}}
function heal(){scan();var list=Object.keys(bad).filter(function(u){try{if(sessionStorage.getItem('ptk-heal:'+u))return false;sessionStorage.setItem('ptk-heal:'+u,'1')}catch(e){}return true});bad={};
if(!list.length)return;Promise.all(list.map(function(u){return fetch(u,{cache:'reload'}).then(function(r){return r.ok}).catch(function(){return false})})).then(function(ok){if(ok.indexOf(true)>=0)location.reload()})}
addEventListener('error',function(e){var t=e.target;if(t&&t!==window)add(t.src||t.href)},true);
addEventListener('unhandledrejection',function(e){var m=String(e.reason&&e.reason.message||'').match(/https?:[^\s'"]+\/_next\/static\/[^\s'"]+/);if(m)add(m[0])});
addEventListener('load',function(){setTimeout(function(){scan();if(Object.keys(bad).length)heal()},1500)});
})();`;

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
      <head>
        {/* Runs before the app's own scripts so it sees their load errors. AdSense later inserts its own script at
            the top of <head>, which React then compares with this one: suppressHydrationWarning keeps that quiet. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: STATIC_HEAL }} />
        {/* Sets <html data-app="play"> inside the Google Play app and adds the AdSense script everywhere else. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: PLAY_APP_SCRIPT }} />
        <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: PLAY_APP_CSS }} />
        {ADSENSE_CLIENT && <meta name="google-adsense-account" content={ADSENSE_CLIENT} />}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f3f0e8] font-sans text-[#17201e] antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
          <InstallBanner />
          <GlobalHeader />
          {children}
          <GlobalFooter />
          <MobileTabBar />
          <HallCelebration />
          <HardClearCelebration />
          <HellClearCelebration />
          <IconUnlock />
          <SupporterThanks />
          <CrownLost />
          <PlayTimeTracker />
          <OpenResultCelebration />
          <NicknamePrompt />
          <AppTesterPopup />
          <OnlineCount />
          <LiveIsland />
          <RoomChat />
          <LoungeChat />
          <RoomHostNotice />
          <PlayAppGuard />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
      {GA_ID && <GoogleAnalyticsTag gaId={GA_ID} />}
    </html>
  );
}
