"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Share, X } from 'lucide-react';
import { usePathname } from '@/i18n/routing';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Mode = 'prompt' | 'ios' | 'kakao' | null;

const DISMISS_KEY = 'puzzlthink:install-dismissed';
const DISMISS_DAYS = 7;
// Same pages the global header hides on: never cover a game in progress.
const HIDE_ON = ['/play', '/wallgo', '/janggi', '/heavy13', '/russian-roulette', '/russian-janggi'];

function dismissedRecently() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 864e5;
  } catch { return false; }
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Slim "install as app" bar at the top of the page on phones; registers the service worker everywhere. */
export default function InstallBanner() {
  const t = useTranslations('Install');
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
    if (!mobile || isStandalone() || dismissedRecently()) return;

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent); setMode('prompt'); };
    const onInstalled = () => setMode(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // In-app browsers can't install; KakaoTalk can hand the page to the phone's real browser.
    // iOS has no install prompt: Safari users add it from the Share sheet.
    const ios = /iPhone|iPad|iPod|Macintosh/.test(ua);
    const iosSafari = ios && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Instagram|FBAN|FBAV|Line|NAVER/i.test(ua);
    const fallback: Mode = /KAKAOTALK/i.test(ua) ? 'kakao' : iosSafari ? 'ios' : null;
    // Shown a beat after load so the page paints first (and Android's own prompt event can win).
    const timer = fallback ? window.setTimeout(() => setMode((m) => m ?? fallback), 800) : undefined;

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!mode || HIDE_ON.some((segment) => pathname.includes(segment))) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* private mode */ }
    setMode(null);
  };

  const install = async () => {
    if (mode === 'prompt' && deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      setDeferred(null);
      if (outcome === 'accepted') setMode(null); else dismiss();
    } else if (mode === 'kakao') {
      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(window.location.href)}`;
    } else if (mode === 'ios') {
      setShowIosHelp((v) => !v);
    }
  };

  return (
    <div className="relative z-40 border-b border-black/[0.07] bg-[#17201e] text-white">
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
