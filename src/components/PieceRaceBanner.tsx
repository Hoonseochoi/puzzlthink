"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import { Piece, PieceCount } from './CompetitionBoard';
import { Stone } from './StoneAvatar';

type Top = { rank: number; nickname: string; pieces: number };

/**
 * Home announcement for 피스 경쟁전: every hard-AI win in any game is one piece, and the records page ranks
 * everyone by pieces. Shows the live top three as a small podium and links to the board.
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
  return (
    <Link href={{ pathname: '/records', hash: 'competition' }} className="group relative mt-8 block overflow-hidden rounded-[24px] border border-[#e8a33c]/40 bg-gradient-to-br from-[#1d1a12] via-[#17201e] to-[#2a2112] p-5 text-white shadow-[0_18px_50px_rgba(120,80,10,0.22)] transition hover:-translate-y-1 sm:mt-12 sm:rounded-[32px] sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#ffcc4d]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 right-6 rotate-[-14deg] opacity-[.12]"><Piece size={150} /></div>
      <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffcc4d] px-3 py-1 text-[10px] font-black tracking-[0.14em] text-[#2a1d05]"><Piece size={10} />{t('badge')}</span>
            <span className="text-[10px] font-black tracking-[0.2em] text-[#ffcc4d]/70">PIECE RACE</span>
          </div>
          <h2 className="mt-3 break-keep text-[1.7rem] font-black leading-[1.15] tracking-[-0.04em] sm:text-4xl">{t('title')}</h2>
          <p className="mt-2 max-w-xl break-keep text-[13px] leading-6 text-white/65 sm:text-sm">{t('desc')}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ffcc4d]/35 bg-white/5 px-3 py-1.5 text-xs font-black text-[#ffe08a]"><Piece size={13} />{t('rule')}</p>
          <span className="mt-4 flex w-fit items-center gap-2 rounded-full bg-[#ffcc4d] px-4 py-2.5 text-sm font-black text-[#2a1d05] transition group-hover:gap-3">{t('cta')}<ArrowRight size={16} /></span>
        </div>

        {/* The current top three, as a little podium. */}
        <div className="grid w-full grid-cols-3 items-end gap-1.5 sm:w-[280px]">
          {podium.map((row, i) => {
            const place = [2, 1, 3][i];
            const block = place === 1 ? 'h-16 from-[#ffd45c] to-[#e8a33c]' : place === 2 ? 'h-11 from-[#e7e9ee] to-[#9aa0ab]' : 'h-8 from-[#f0c39a] to-[#b9783f]';
            return (
              <div key={place} className="flex min-w-0 flex-col items-center text-center">
                {row ? <Stone name={row.nickname} pieceRank={place} size={place === 1 ? 34 : 28} /> : <span className="text-lg">{['🥇', '🥈', '🥉'][place - 1]}</span>}
                <span className="w-full truncate px-0.5 text-[11px] font-black">{row?.nickname ?? t('emptySpot')}</span>
                {row ? <PieceCount n={row.pieces} size={10} className="text-[11px] [&>span:nth-child(2)]:text-white/40" /> : <span className="text-[11px] text-white/35">—</span>}
                <span className={`mt-1 flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-1 text-lg font-black text-white/90 ${block}`}>{place}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
