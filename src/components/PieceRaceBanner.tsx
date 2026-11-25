"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import { PIECE_WEEKS, Piece, PieceCount } from './CompetitionBoard';
import { Stone } from './StoneAvatar';

type Top = { rank: number; nickname: string; pieces: number };

/**
 * Home announcement for 피스 경쟁전: every hard-AI win in any game is one piece, and the records page ranks
 * everyone by pieces. Same size and layout as the AI 헬모드 banner above it: text on the left, the live top three
 * as a small podium on the right (also on phones, so the banner stays short). The podium shows the 2W champion icons
 * each place will get (diamond, sapphire, emerald), not the players' own stones.
 */
export default function PieceRaceBanner() {
  const t = useTranslations('PieceRace');
  const [top, setTop] = useState<Top[]>([]);

  useEffect(() => {
    let alive = true;
    getSupabase()?.rpc('competition_ranking', { p_limit: 3 }).then(({ data }) => {
      if (alive && Array.isArray(data)) setTop((data as Top[]).filter((r) => r.rank <= 3));
    });
    return () => { alive = false; };
  }, []);

  const podium = [top[1], top[0], top[2]];
  const [ended] = useState(() => Date.now() >= PIECE_WEEKS[2].ends);
  return (
    <Link href={{ pathname: '/records', hash: 'competition' }} className="group relative mt-3 block overflow-hidden rounded-[22px] border border-[#e8a33c]/40 bg-gradient-to-br from-[#1d1a12] via-[#17201e] to-[#2a2112] p-4 text-white shadow-[0_14px_36px_rgba(120,80,10,0.18)] transition hover:-translate-y-1 sm:mt-4 sm:rounded-[32px] sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#ffcc4d]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 right-4 rotate-[-14deg] opacity-[.12]"><Piece size={150} /></div>
      <div className="relative grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_280px] sm:gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffcc4d] px-3 py-1 text-[10px] font-black tracking-[0.14em] text-[#2a1d05]"><Piece size={10} />{t('badge')}</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-[#ffcc4d]/70">PIECE RACE</span>
          </div>
          <h2 className="mt-2 break-keep text-[1.6rem] font-black leading-[1.1] tracking-[-0.04em] sm:mt-3 sm:text-[2.6rem]">{t('shortTitle')}</h2>
          <p className="mt-2 hidden max-w-xl break-keep text-sm leading-6 text-white/65 sm:block">{t('desc')}</p>
          <p className="mt-2 flex items-start gap-1.5 break-keep text-[11px] font-black leading-4 text-[#ffe08a] sm:mt-3 sm:inline-flex sm:items-center sm:gap-2 sm:rounded-full sm:border sm:border-[#ffcc4d]/35 sm:bg-white/5 sm:px-3 sm:py-1.5 sm:text-xs"><Piece size={12} />{t('rule')}</p>
          <p className="mt-1.5 flex items-center gap-1.5 break-keep text-[11px] font-black leading-4 text-white/80 sm:ml-2 sm:inline-flex sm:rounded-full sm:bg-[#ffcc4d]/15 sm:px-3 sm:py-1.5 sm:text-xs"><CalendarDays size={12} className="shrink-0 text-[#ffcc4d]" /><span className="sm:hidden">{ended ? t('periodEnded') : t('periodShort')}</span><span className="hidden sm:inline">{ended ? t('periodEnded') : t('period')}</span></p>
          <span className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-[#ffcc4d] px-4 py-2 text-[13px] font-black text-[#2a1d05] transition group-hover:gap-3 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">{t('cta')}<ArrowRight size={16} /></span>
        </div>

        {/* The current top three, as a little podium. */}
        <div className="w-full">
          <p className="mb-1.5 text-center text-[9px] font-black tracking-[0.12em] text-white/45 sm:mb-2 sm:text-[10px] sm:tracking-[0.2em]">{ended ? t('topEnded') : t('top')}</p>
          <div className="grid grid-cols-3 items-end gap-0.5 sm:gap-1.5">
            {podium.map((row, i) => {
              const place = [2, 1, 3][i];
              const block = place === 1 ? 'h-10 sm:h-16 from-[#ffd45c] to-[#e8a33c]' : place === 2 ? 'h-7 sm:h-11 from-[#e7e9ee] to-[#9aa0ab]' : 'h-5 sm:h-8 from-[#f0c39a] to-[#b9783f]';
              return (
                <div key={place} className="flex min-w-0 flex-col items-center text-center">
                  <span className={`${row ? '' : 'opacity-45'} ${place === 1 ? 'drop-shadow-[0_0_8px_rgba(200,230,255,.55)]' : ''}`}><Stone name={row?.nickname ?? ''} icon={`w2-${place}`} size={place === 1 ? 40 : 32} /></span>
                  <span className={`w-full truncate px-0.5 text-[9px] font-black sm:text-[11px] ${row ? '' : 'hidden sm:block'}`}>{row?.nickname ?? t('emptySpot')}</span>
                  {row ? <PieceCount n={row.pieces} size={8} className="text-[9px] sm:text-[11px] [&>span:nth-child(2)]:text-white/40" /> : <span className="text-[9px] text-white/35 sm:text-[11px]">—</span>}
                  <span className={`mt-1 flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-0.5 text-xs font-black text-white/90 sm:pt-1 sm:text-lg ${block}`}>{place}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
