"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';
import { Coffee, Heart } from 'lucide-react';

/** Voluntary support goes through CTEE: supporters see only "PUZZLTHINK", never the developer's name or account. */
export const SUPPORT_URL = 'https://ctee.kr/place/puzzlthink/donation';

export type SupportPlace = 'card' | 'footer' | 'result' | 'hall' | 'open_rank' | 'hard_clear';
/** Counts a click per place and page (which game), so we can see which spots people use. Nothing personal. */
export function trackSupportClick(place: SupportPlace) {
  try {
    const page = window.location.pathname.replace(/^\/(ko|en)(?=\/|$)/, '').split('/')[1] ?? '';
    getSupabase()?.rpc('count_support_click', { p_place: place, p_page: page || 'home' }).then(() => {});
  } catch { /* optional */ }
}

/**
 * "Support the developer". `card` is a small panel (home, game entry screens); `link` is a footer link.
 * Opens CTEE in a new tab; nothing is sent from this site.
 */
export default function SupportLink({ variant = 'card', tone = 'light' }: { variant?: 'card' | 'link'; tone?: 'light' | 'dark' }) {
  const t = useTranslations('Common');
  if (variant === 'link') {
    return <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('footer')} className="inline-flex items-center gap-1 text-[#e8590c] hover:text-[#c2410c]"><Heart size={11} fill="currentColor" />{t('supportShort')}</a>;
  }
  const dark = tone === 'dark';
  return (
    <div className={`mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-[20px] border px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white/60'}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a]"><Coffee size={19} /></span>
        <div>
          <p className={`text-sm font-black ${dark ? 'text-white' : 'text-[#17201e]'}`}>{t('supportTitle')}</p>
          <p className={`mt-0.5 break-keep text-xs leading-5 ${dark ? 'text-white/50' : 'text-black/50'}`}>{t('supportDesc')}</p>
        </div>
      </div>
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('card')} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#ff6b4a] px-5 py-2.5 text-xs font-black text-white shadow-[0_6px_18px_rgba(255,107,74,.35)] transition hover:-translate-y-0.5 hover:bg-[#f25a38]">
        <Heart size={13} fill="currentColor" />{t('supportButton')}
      </a>
    </div>
  );
}

/**
 * One quiet line for end-of-game screens: "☕ 재밌었다면 개발자에게 커피 한 잔". Small, centred, no box,
 * so it never competes with "play again".
 */
export function CoffeeNudge({ tone = 'dark', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  const t = useTranslations('Common');
  return (
    <p className={`text-center ${className}`}>
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('result')} className={`inline-flex items-center gap-1 text-[11px] font-bold underline-offset-4 transition hover:underline ${tone === 'dark' ? 'text-white/45 hover:text-[#ffb199]' : 'text-black/45 hover:text-[#e8590c]'}`}>
        <Coffee size={12} />{t('coffeeNudge')}
      </a>
    </p>
  );
}

const CHEER_DAY_KEY = 'puzzlthink_support_cheer_day';
const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

/**
 * One warm line inside a celebration (Hall of Fame, ranking up, hard clear), right under the share buttons.
 * At most once a day per browser, so it never nags.
 */
export function CelebrationSupport({ place }: { place: Extract<SupportPlace, 'hall' | 'open_rank' | 'hard_clear'> }) {
  const t = useTranslations('Common');
  // Decided once when the popup opens; the day is written after it is shown.
  const [show] = useState(() => { try { return localStorage.getItem(CHEER_DAY_KEY) !== todayKst(); } catch { return false; } });
  useEffect(() => { if (show) try { localStorage.setItem(CHEER_DAY_KEY, todayKst()); } catch { /* optional */ } }, [show]);
  if (!show) return null;
  return (
    <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick(place)}
      className="mt-3 flex items-center justify-center gap-1.5 rounded-[12px] border border-[#ffb199]/25 bg-[#ff6b4a]/[0.08] px-3 py-2.5 text-[11px] font-bold leading-4 text-[#ffc7b5] transition hover:bg-[#ff6b4a]/[0.15]">
      <Coffee size={13} className="shrink-0" /><span className="break-keep">{t('celebrationSupport')}</span>
    </a>
  );
}
