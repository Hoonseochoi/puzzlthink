"use client";

import { useTranslations } from 'next-intl';

/**
 * A challenge map's clear rate (맵 완성률): challengers who solved it inside the holder's time ÷ challengers.
 * `attempts` / `clears` are the board's beat starts and takeovers; the maker's own first clear isn't counted.
 * Green = most challengers make it, yellow = about a coin flip, red = few do.
 */
export default function ClearRate({ ns, attempts, clears, full = false, className = '' }: { ns: 'Logic' | 'Slitherlink'; attempts: number; clears: number; full?: boolean; className?: string }) {
  const t = useTranslations(ns);
  const base = `inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none ring-1 ${className}`;
  if (attempts <= 0) return <span title={t('clearRateTitleNone')} className={`${base} bg-white/8 text-white/55 ring-white/15`}>{t('clearRateNone')}</span>;
  const c = Math.min(Math.max(clears, 0), attempts);
  const pct = Math.round((c / attempts) * 100);
  const tone = pct >= 60 ? 'bg-[#3ddc97]/15 text-[#3ddc97] ring-[#3ddc97]/35' : pct >= 30 ? 'bg-[#ffcf3f]/15 text-[#ffcf3f] ring-[#ffcf3f]/35' : 'bg-[#ff6b6b]/15 text-[#ff8a8a] ring-[#ff6b6b]/35';
  return <span title={t('clearRateTitle', { c, n: attempts })} className={`${base} ${tone}`}>{t(full ? 'clearRateFull' : 'clearRate', { pct, c, n: attempts })}</span>;
}
