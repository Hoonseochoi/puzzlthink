"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';
import { Coffee, Heart, X } from 'lucide-react';

/** Voluntary support goes through CTEE: supporters see only "PUZZLTHINK", never the developer's name or account. */
export const SUPPORT_URL = 'https://ctee.kr/place/puzzlthink/donation';

type SupportPlace = 'footer' | 'result' | 'hall' | 'open_rank' | 'hard_clear' | 'banner' | 'header' | 'cover_records' | 'cover_icons';
/** Counts clicks by place and page so we can measure whether each quiet link is useful. */
export function trackSupportClick(place: SupportPlace = 'footer') {
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

/** After a game: support keeps the free games running (server costs), with a clear button. Never replaces "play again". */
export function CoffeeNudge({ tone = 'dark', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  const t = useTranslations('Common');
  const dark = tone === 'dark';
  return (
    <div className={`rounded-[18px] border p-4 text-left ${dark ? 'border-[#ff8a65]/25 bg-[#ff6b4a]/[0.08]' : 'border-[#e8590c]/20 bg-[#fff4ec]'} ${className}`}>
      <p className={`flex items-center gap-1.5 text-[13px] font-black ${dark ? 'text-[#ffb199]' : 'text-[#c2410c]'}`}><Heart size={15} className="shrink-0" />{t('supportBannerTitle')}</p>
      <p className={`mt-1.5 break-keep text-[12px] leading-5 ${dark ? 'text-white/65' : 'text-black/60'}`}>{t('supportBannerBody')}</p>
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('result')}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#ff6b4a] px-4 py-2.5 text-[13px] font-black text-white transition hover:bg-[#ff5530]">
        <Heart size={14} fill="currentColor" />{t('supportCta')}
      </a>
      <p className={`mt-2 text-center text-[10px] leading-4 ${dark ? 'text-white/35' : 'text-black/35'}`}>{t('supportNote')}</p>
    </div>
  );
}

/** Heart button in the global header (desktop row and phones). */
export function HeaderSupportButton({ full = false }: { full?: boolean }) {
  const t = useTranslations('Common');
  return (
    <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('header')}
      className={`group flex shrink-0 flex-col items-center whitespace-nowrap ${full ? 'w-full' : ''}`}>
      <span className={`flex items-center justify-center gap-1.5 rounded-full bg-[#ff6b4a] font-extrabold text-white transition group-hover:bg-[#ff5530] ${full ? 'w-full rounded-xl px-4 py-3 text-sm' : 'px-3 py-1 text-xs'}`}><Heart size={full ? 15 : 13} fill="currentColor" />{t('supportShort')}</span>
      {/* the amount, small, under the header button */}
      {!full && <span className="mt-0.5 text-[9px] font-black leading-none text-[#e0512f]">{t('supportPrice')}</span>}
    </a>
  );
}

const BANNER_DAY_KEY = 'puzzlthink_support_banner_day';

/** Slim notice above the header: the games are free, support covers the servers. Hidden for the rest of the day once closed. */
export function SupportBanner() {
  const t = useTranslations('Common');
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    let off = false;
    try { off = localStorage.getItem(BANNER_DAY_KEY) === todayKst(); } catch { /* optional */ }
    const id = window.setTimeout(() => setHidden(off), 0);
    return () => window.clearTimeout(id);
  }, []);
  if (hidden) return null;
  const close = () => { try { localStorage.setItem(BANNER_DAY_KEY, todayKst()); } catch { /* optional */ } setHidden(true); };
  return (
    <div className="bg-[#17201e] text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('banner')} className="flex min-w-0 flex-1 items-center justify-center gap-2 text-[12px] font-bold">
          <Heart size={14} className="shrink-0 text-[#ff8a65]" />
          <span className="min-w-0 truncate">{t('supportBannerShort')}</span>
          <span className="shrink-0 rounded-full bg-[#ff6b4a] px-2.5 py-0.5 text-[11px] font-black">{t('supportCta')} →</span>
        </a>
        <button type="button" onClick={close} aria-label={t('supportDismiss')} title={t('supportDismiss')} className="shrink-0 rounded-full p-1 text-white/45 transition hover:bg-white/10 hover:text-white"><X size={14} /></button>
      </div>
    </div>
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
