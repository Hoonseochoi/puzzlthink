"use client";

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { ADSENSE_CLIENT, AD_SLOTS, type AdPlacement } from '@/lib/adsense';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

const LABEL = { ko: '광고', en: 'Advertisement' } as const;

/**
 * One responsive AdSense display unit.
 * - `tone` matches the surrounding surface (dark game panels vs. the light site pages).
 * - `compact` caps the height for small spaces such as result panels.
 * Renders nothing when the publisher or slot ID is missing (except a placeholder in development),
 * and collapses itself if Google returns no ad.
 */
export default function AdSlot({ placement, tone = 'light', compact = false, className = '' }: {
  placement: AdPlacement; tone?: 'light' | 'dark'; compact?: boolean; className?: string;
}) {
  const slot = AD_SLOTS[placement];
  const locale = useLocale();
  const pathname = usePathname();
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = ref.current;
    // Each <ins> may be filled only once; StrictMode re-runs effects, so skip already-claimed units.
    if (!ins || ins.dataset.adsbygoogleStatus) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* blocked by an ad blocker */ }
  }, [slot, pathname]);

  const label = LABEL[locale as keyof typeof LABEL] ?? LABEL.en;
  const labelClass = `mb-1 text-center text-[9px] font-bold uppercase tracking-[0.2em] ${tone === 'dark' ? 'text-white/25' : 'text-black/30'}`;
  const height = compact ? 'min-h-[100px] max-h-[120px]' : 'min-h-[100px]';

  if (!ADSENSE_CLIENT || !slot) {
    if (process.env.NODE_ENV !== 'development') return null;
    return (
      <div className={className}>
        <p className={labelClass}>{label}</p>
        <div className={`flex ${height} items-center justify-center rounded-[12px] border border-dashed text-[10px] font-bold ${tone === 'dark' ? 'border-white/20 text-white/30' : 'border-black/20 text-black/30'}`}>
          AD · {placement}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-slot ${className}`}>
      <p className={labelClass}>{label}</p>
      <ins
        key={`${slot}-${pathname}`}
        ref={ref}
        className={`adsbygoogle block w-full overflow-hidden ${height}`}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={compact ? 'horizontal' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
