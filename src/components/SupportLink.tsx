"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';
import { Coffee, Heart } from 'lucide-react';

/** Voluntary support goes through CTEE: supporters see only "PUZZLTHINK", never the developer's name or account. */
export const SUPPORT_URL = 'https://ctee.kr/place/puzzlthink/donation';

type SupportPlace = 'footer' | 'result' | 'hall' | 'open_rank' | 'hard_clear';
/** Counts clicks by place and page so we can measure whether each quiet link is useful. */
function trackSupportClick(place: SupportPlace = 'footer') {
  try {
    const page = window.location.pathname.replace(/^\/(ko|en)(?=\/|$)/, '').split('/')[1] ?? '';
    getSupabase()?.rpc('count_support_click', { p_place: place, p_page: page || 'home' }).then(() => {});
  } catch { /* optional */ }
}

/** A single, unobtrusive voluntary-support link in the global footer. */
export default function SupportLink() {
  const t = useTranslations('Common');
  return (
    <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('footer')} className="inline-flex items-center gap-1 text-black/35 transition hover:text-black/60">
      <Heart size={10} />{t('supportShort')}
    </a>
  );
}

/** One quiet line under a game's result buttons. Small, no box, never competes with "play again". */
export function CoffeeNudge({ tone = 'dark', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  const t = useTranslations('Common');
  return (
    <p className={`text-center ${className}`}>
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('result')}
        className={`inline-flex items-center gap-1 text-[11px] font-bold underline-offset-4 transition hover:underline ${tone === 'dark' ? 'text-white/40 hover:text-[#ffb199]' : 'text-black/40 hover:text-[#e8590c]'}`}>
        <Coffee size={12} />{t('coffeeNudge')}
      </a>
    </p>
  );
}

const CHEER_DAY_KEY = 'puzzlthink_support_cheer_day';
const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

/** One warm line inside a ranking/clear celebration, under its share buttons. At most once a day per browser. */
export function CelebrationSupport({ place }: { place: 'hall' | 'open_rank' | 'hard_clear' }) {
  const t = useTranslations('Common');
  const [show] = useState(() => { try { return localStorage.getItem(CHEER_DAY_KEY) !== todayKst(); } catch { return false; } });
  useEffect(() => { if (show) try { localStorage.setItem(CHEER_DAY_KEY, todayKst()); } catch { /* optional */ } }, [show]);
  if (!show) return null;
  return (
    <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick(place)}
      className="mt-3 flex items-center justify-center gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11px] font-bold leading-4 text-white/60 transition hover:bg-white/[0.08] hover:text-white/80">
      <Coffee size={13} className="shrink-0" /><span className="break-keep">{t('celebrationSupport')}</span>
    </a>
  );
}
