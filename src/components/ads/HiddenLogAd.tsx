"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import localFont from 'next/font/local';
import { X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { usePathname } from '@/i18n/routing';
import { CoffeeNudge, SupportBanner } from '../SupportLink';

/**
 * Direct-sold campaign: Hidden Log (더히든게임룸 시청역점), 2026-11-23 → 2026-12-02 KST.
 * It takes the two support slots (top strip, post-game card) on Korean pages only, and the
 * support banner/card come back on their own once the campaign ends.
 */
const CAMPAIGN = 'hiddenlog_2611';
const ENDS_AT = Date.parse('2026-12-02T23:59:59+09:00');
const LINKS = {
  top: 'https://thehiddenlog.web.app/go/pt-top',
  result: 'https://thehiddenlog.web.app/go/pt-result',
} as const;
const LOGO = '/ads/hiddenlog/logo.webp';
const TOP_DAY_KEY = 'puzzlthink_ad_hiddenlog_top_day';

// Only the glyphs of the four headlines (≈14 KB); everything else stays in the site font.
const heirOfLight = localFont({ src: './heiroflight-ad.woff2', weight: '700', display: 'swap', preload: false });

type Place = keyof typeof LINKS;
type AdEvent = 'impression' | 'click' | 'dismiss';

function trackAd(place: Place, event: AdEvent) {
  try { getSupabase()?.rpc('count_ad_event', { p_campaign: CAMPAIGN, p_place: place, p_event: event }).then(() => {}); } catch { /* optional */ }
}

const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

function useCampaignLive() {
  const locale = useLocale();
  const [running] = useState(() => Date.now() < ENDS_AT);
  return locale === 'ko' && running;
}

/** The advertiser counts arrivals by referrer, so the link keeps it (noopener only, no noreferrer). */
function AdLink({ place, className, children }: { place: Place; className: string; children: React.ReactNode }) {
  return (
    <a href={LINKS[place]} target="_blank" rel="noopener sponsored" referrerPolicy="strict-origin-when-cross-origin" onClick={() => trackAd(place, 'click')} className={className}>
      {children}
    </a>
  );
}

const GOLD_TEXT = 'bg-gradient-to-b from-[#fff6df] via-[#f7dc9c] to-[#e6b966] bg-clip-text text-transparent';
const CTA = 'shrink-0 whitespace-nowrap rounded-full bg-gradient-to-b from-[#ef7a5c] to-[#e2674a] font-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.12),0_2px_8px_rgba(226,103,74,.45)]';
const AD_TAG = 'shrink-0 rounded-[4px] border border-[#f7dc9c]/40 px-1 text-[9px] font-extrabold leading-3 tracking-[0.08em] text-[#f7dc9c]/75';

function HiddenLogTopBanner({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  useEffect(() => { trackAd('top', 'impression'); }, [pathname]);
  return (
    <div className="relative h-[38px] overflow-hidden border-b border-[#e6b966]/35 bg-[linear-gradient(90deg,#24170f_0%,#3b281d_22%,#4a3326_50%,#3b281d_78%,#24170f_100%)] text-[#fff3e2]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_220%_at_50%_-60%,rgba(230,185,102,.22),transparent_55%)]" />
      <div className="relative mx-auto flex h-full max-w-6xl items-center gap-1.5 pl-3 pr-2.5 sm:gap-2 sm:px-4">
        <AdLink place="top" className="flex min-w-0 flex-1 items-center gap-2 sm:justify-center sm:gap-2.5">
          <span className={AD_TAG}>AD</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo, no optimizer needed */}
          <img src={LOGO} alt="Hidden Log" width={48} height={24} className="h-6 w-auto shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,.5)] sm:h-7" />
          <span className={`${heirOfLight.className} min-w-0 truncate text-[14px] sm:shrink-0 sm:text-[15px] ${GOLD_TEXT}`}>
            <span className="sm:hidden">두뇌게임, 현실에서 직접!</span>
            <span className="hidden sm:inline">방송 속 두뇌게임, 이제 현실에서 직접</span>
          </span>
          <span className="hidden h-[3px] w-[3px] shrink-0 rounded-full bg-[#e6b966]/60 md:block" />
          <span className="hidden min-w-0 truncate text-[12px] font-semibold text-[#fff3e2]/60 md:block"><b className="font-extrabold text-[#fff3e2]/90">시청역 더히든게임룸</b> · 매주 주말 소셜게임 리그 · 테마 31종</span>
          <span className={`${CTA} ml-auto px-2.5 py-1 text-[11.5px] sm:ml-0 sm:px-3`}><span className="sm:hidden">해보기 →</span><span className="hidden sm:inline">직접 해보기 →</span></span>
        </AdLink>
        <button type="button" onClick={onClose} aria-label="오늘 하루 닫기" title="오늘 하루 닫기" className="shrink-0 rounded-full p-1 text-[#fff3e2]/45 transition hover:bg-white/10 hover:text-[#fff3e2]"><X size={14} /></button>
      </div>
    </div>
  );
}

/** Top strip above the header: the campaign while it runs, otherwise the support banner. Closing hides it for the day. */
export function TopBannerSlot() {
  const live = useCampaignLive();
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (!live) return;
    let off = false;
    try { off = localStorage.getItem(TOP_DAY_KEY) === todayKst(); } catch { /* optional */ }
    const id = window.setTimeout(() => setHidden(off), 0);
    return () => window.clearTimeout(id);
  }, [live]);
  if (!live) return <SupportBanner />;
  if (hidden) return null;
  const close = () => {
    trackAd('top', 'dismiss');
    try { localStorage.setItem(TOP_DAY_KEY, todayKst()); } catch { /* optional */ }
    setHidden(true);
  };
  return <HiddenLogTopBanner onClose={close} />;
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-[11px] w-[11px]" aria-hidden><path d={d} /></svg>
);
const CHIPS = [
  { label: '8~13명', d: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M17.5 11.6a2.6 2.6 0 1 0 0-5.2M17 14.2c2.7.2 4.6 2.3 4.6 5.3' },
  { label: '180분', d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2' },
  { label: '랭크·티어 기록', d: 'M8 4h8v5a4 4 0 0 1-8 0ZM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 20h8' },
];

function HiddenLogResultCard({ won, className }: { won?: boolean; className: string }) {
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    trackAd('result', 'impression');
  }, []);
  return (
    <div className={`relative overflow-hidden rounded-[18px] border border-[#e6b966]/40 bg-[radial-gradient(90%_70%_at_100%_0%,rgba(230,185,102,.20),transparent_60%),radial-gradient(70%_60%_at_0%_100%,rgba(226,103,74,.16),transparent_60%),linear-gradient(160deg,#4a3326_0%,#2f2018_55%,#22170f_100%)] px-4 pb-3.5 pt-4 text-left text-[#fff3e2] shadow-[inset_0_1px_0_rgba(247,220,156,.12)] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.12em] text-[#f7dc9c]/70">OFFLINE · SOCIAL GAME</span>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo, no optimizer needed */}
        <img src={LOGO} alt="Hidden Log" width={75} height={38} className="h-[38px] w-auto drop-shadow-[0_2px_3px_rgba(0,0,0,.55)]" />
      </div>
      <p className={`${heirOfLight.className} mt-2.5 break-keep text-[21px] leading-[1.28] ${GOLD_TEXT}`}>
        {won === false ? <>아쉬운 이번 판,<br />설욕은 현실에서 해볼까요?</> : <>방금 그 두뇌,<br />현실에서 증명해 볼까요?</>}
      </p>
      <p className="mt-1.5 break-keep text-[12.5px] leading-[1.6] text-[#fff3e2]/70">
        더지니어스·데블스플랜 같은 소셜게임 31종을 <b className="text-[#fff3e2]/95">8~13명이 한 테이블에서</b> 직접. 매주 주말 <b className="text-[#fff3e2]/95">시청역 더히든게임룸</b>에서 리그가 열려요.
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {CHIPS.map((c) => (
          <span key={c.label} className="inline-flex items-center gap-1 rounded-full border border-[#e6b966]/30 bg-[#e6b966]/10 px-2 py-[3px] text-[10.5px] font-extrabold text-[#f7dc9c]"><Icon d={c.d} />{c.label}</span>
        ))}
      </div>
      <AdLink place="result" className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#ef7a5c] to-[#e2674a] px-4 py-[11px] text-[13.5px] font-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.14),0_6px_18px_rgba(226,103,74,.35)] transition hover:brightness-105">
        직접 해보러 가기 →
      </AdLink>
      <div className="mt-2 flex justify-between text-[10px] text-[#fff3e2]/40"><span>AD · 광고</span><span>시청역점 · 네이버 예약</span></div>
    </div>
  );
}

/** Post-game card under the result buttons: the campaign while it runs, otherwise the support card. */
export function ResultBannerSlot({ won, className = '' }: { won?: boolean; className?: string }) {
  const live = useCampaignLive();
  if (!live) return <CoffeeNudge className={className} />;
  return <HiddenLogResultCard won={won} className={className} />;
}
