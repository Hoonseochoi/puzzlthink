"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Share, X } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import { PLAY_APP_HIDE, isPlayApp } from '@/lib/playApp';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Mode = 'prompt' | 'ios' | 'kakao' | null;

const DISMISS_KEY = 'puzzlthink:install-dismissed';
const COOLDOWN_MS = 3 * 3600_000; // closing it, or seeing the after-win card, rests it for 3 hours
// The top bar shows once (first visit); the card after a win or a cleared puzzle at most once every 3 hours.
const SHOWN_KEY = 'puzzlthink:install-shown';
const GAME_AT_KEY = 'puzzlthink:install-game-at';
const gameCardRested = () => { try { return Date.now() - Number(localStorage.getItem(GAME_AT_KEY) || 0) >= COOLDOWN_MS; } catch { return false; } };
export const GAME_FINISHED_EVENT = 'puzzlthink:game-finished';
type Spot = 'top' | 'game';
const shownSpots = (): Spot[] => { try { return JSON.parse(localStorage.getItem(SHOWN_KEY) || '[]'); } catch { return []; } };
const markShown = (spot: Spot) => {
  try {
    if (spot === 'game') localStorage.setItem(GAME_AT_KEY, String(Date.now()));
    else localStorage.setItem(SHOWN_KEY, JSON.stringify([...new Set([...shownSpots(), spot])]));
  } catch { /* private mode */ }
};
// Same pages the global header hides on: never cover a game in progress.
const HIDE_ON = ['/play', '/wallgo', '/janggi', '/heavy13', '/russian-roulette', '/russian-janggi'];

function dismissedRecently() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < COOLDOWN_MS;
  } catch { return false; }
}

type AppEvent = 'shown_top' | 'shown_game' | 'click' | 'accepted' | 'installed' | 'open';
const platform = () => (/Android/i.test(navigator.userAgent) ? 'android' : /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)) ? 'ios' : 'desktop');
/** Daily counts for the install funnel and for opens of the installed app (no personal data). */
function trackApp(event: AppEvent) {
  try { getSupabase()?.rpc('count_app_event', { p_event: event, p_platform: platform() }).then(() => {}); } catch { /* optional */ }
}
const OPEN_DAY_KEY = 'puzzlthink:app-open-day';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Slim "add to home screen" bar at the top of the page on iPhone/iPad; registers the service worker everywhere. */
export default function InstallBanner() {
  const t = useTranslations('Install');
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null); // where it is showing now

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

    // Installed-app opens, once per device per day (iOS has no install event, so this is how we see its installs).
    const day = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
    try { if (isStandalone() && localStorage.getItem(OPEN_DAY_KEY) !== day) { localStorage.setItem(OPEN_DAY_KEY, day); trackApp('open'); } } catch { /* private mode */ }
    const onAnyInstall = () => trackApp('installed');
    window.addEventListener('appinstalled', onAnyInstall);

    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
    // Inside the Google Play app the user already has the app: no install prompt.
    if (!mobile || isStandalone() || (PLAY_APP_HIDE.install && isPlayApp())) return () => window.removeEventListener('appinstalled', onAnyInstall);

    // Android gets the Google Play app (closed test now, see AppTesterInvite), so the site no longer offers the
    // home-screen web app there: the browser's own install prompt is swallowed and no banner is shown.
    // iPhone/iPad have no Play app, so the Share-sheet guide stays for them.
    const onPrompt = (e: Event) => { e.preventDefault(); };
    const onInstalled = () => setMode(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // In-app browsers can't install; KakaoTalk can hand the page to the phone's real browser.
    // iOS has no install prompt: Safari users add it from the Share sheet.
    const ios = /iPhone|iPad|iPod|Macintosh/.test(ua);
    const iosSafari = ios && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Instagram|FBAN|FBAV|Line|NAVER/i.test(ua);
    const fallback: Mode = !ios ? null : /KAKAOTALK/i.test(ua) ? 'kakao' : iosSafari ? 'ios' : null;
    // Shown a beat after load so the page paints first (and Android's own prompt event can win).
    const timer = fallback ? window.setTimeout(() => setMode((m) => m ?? fallback), 800) : undefined;
    // First visit: the top bar, once.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- whether it was shown before lives in this browser
    if (!shownSpots().includes('top') && !dismissedRecently()) setSpot('top');
    // After a win (or a cleared puzzle / new score): a card at the bottom, once the result has landed.
    // The rest time is checked at that moment, so a long session gets it again three hours later.
    let later: number | undefined;
    const onFinished = (e: Event) => {
      if ((e as CustomEvent<{ result?: string }>).detail?.result !== 'win') return;
      if (isStandalone() || dismissedRecently() || !gameCardRested()) return;
      window.clearTimeout(later);
      later = window.setTimeout(() => setSpot('game'), 2500);
    };
    window.addEventListener(GAME_FINISHED_EVENT, onFinished);

    return () => {
      window.clearTimeout(timer); window.clearTimeout(later);
      window.removeEventListener(GAME_FINISHED_EVENT, onFinished);
      window.removeEventListener('appinstalled', onAnyInstall);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const onGamePage = HIDE_ON.some((segment) => pathname.includes(segment));
  const visible = !!mode && (spot === 'game' || (spot === 'top' && !onGamePage));
  // Count it as shown the moment it appears (a reload doesn't bring it back).
  useEffect(() => { if (visible && spot) { markShown(spot); trackApp(spot === 'top' ? 'shown_top' : 'shown_game'); } }, [visible, spot]);
  if (!visible) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* private mode */ }
    setSpot(null); // the install route (mode) stays, so the card can come back after the rest
  };

  const install = async () => {
    trackApp('click');
    if (mode === 'prompt' && deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      setDeferred(null);
      if (outcome === 'accepted') trackApp('accepted'); else dismiss();
      setMode(null); // a used prompt can't be reused; the browser sends a fresh one when it can be asked again
    } else if (mode === 'kakao') {
      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(window.location.href)}`;
    } else if (mode === 'ios') {
      setShowIosHelp((v) => !v);
    }
  };

  if (spot === 'game') {
    return (
      <div data-play-hide="install" data-focus-hide className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-[18px] border border-white/10 bg-[#17201e]/95 p-3.5 text-white shadow-[0_18px_50px_rgba(0,0,0,.45)] backdrop-blur" role="dialog" aria-label={t('title')}>
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-[11px] bg-white/10 p-1" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-black">{t('winTitle')}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-white/65">{mode === 'kakao' ? t('kakaoDesc') : t('winDesc')}</p>
          </div>
          <button onClick={() => setSpot(null)} aria-label={t('close')} className="-mr-1 -mt-1 shrink-0 p-1 text-white/45 hover:text-white"><X size={16} /></button>
        </div>
        {mode !== 'kakao' && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5 text-[10.5px] font-bold text-white/80">
            {(['winPoint1', 'winPoint2', 'winPoint3'] as const).map((k) => <li key={k} className="rounded-full bg-white/10 px-2 py-1">{t(k)}</li>)}
          </ul>
        )}
        {mode === 'ios' ? (
          // iOS has no install button: the two steps are the whole install, so they are shown straight away.
          <div className="mt-2.5 rounded-[12px] bg-white/[0.07] px-3 py-2 text-[12px] leading-5 text-white/85">
            <p className="flex flex-wrap items-center gap-1">{t('iosStep1a')}<Share size={13} className="inline text-[#7fb4ff]" />{t('iosStep1b')}</p>
            <p>{t('iosStep2')}</p>
          </div>
        ) : (
          <button onClick={install} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#ff6b4a] px-4 py-2.5 text-[13px] font-black text-white"><Download size={14} />{mode === 'kakao' ? t('openBrowser') : t('winInstall')}</button>
        )}
      </div>
    );
  }

  return (
    <div data-play-hide="install" data-focus-hide className="relative z-40 border-b border-black/[0.07] bg-[#17201e] text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-[10px] bg-white/10 p-1" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-black">{t('title')}</p>
          <p className="truncate text-[11px] text-white/55">{mode === 'kakao' ? t('kakaoDesc') : t('desc')}</p>
        </div>
        <button onClick={install} className="flex shrink-0 items-center gap-1 rounded-full bg-[#ff6b4a] px-3.5 py-2 text-xs font-black text-white">
          <Download size={13} />{mode === 'kakao' ? t('openBrowser') : t('install')}
        </button>
        <button onClick={dismiss} aria-label={t('close')} className="-mr-1 shrink-0 p-1.5 text-white/45 hover:text-white"><X size={16} /></button>
      </div>
      {showIosHelp && (
        <div className="mx-auto max-w-6xl px-4 pb-3 text-[12px] leading-5 text-white/75">
          <p className="flex flex-wrap items-center gap-1">{t('iosStep1a')}<Share size={13} className="inline text-[#7fb4ff]" />{t('iosStep1b')}</p>
          <p>{t('iosStep2')}</p>
        </div>
      )}
    </div>
  );
}
