"use client";

import { useTranslations } from 'next-intl';
import { ArrowRight, Skull } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { HELL_LIVE } from '@/lib/hell';
import { Stone } from '../StoneAvatar';
import { BlackPiece, BlackPieceCount } from './BlackPiece';
import { useBlackPieceRanking } from './BlackPieceBoard';

/** Home announcement where the 피스 경쟁전 podium used to be: AI 헬모드 is out, the black-piece rule, the top three. */
export default function HellLaunchBanner() {
  const t = useTranslations('Hell');
  const tc = useTranslations('Common');
  const rows = useBlackPieceRanking(3);
  const top = (rows ?? []).filter((r) => r.rank <= 3);
  const podium = [top[1], top[0], top[2]];

  return (
    <Link href="/hell" className="hell-surface hell-scan group relative mt-6 block overflow-hidden rounded-[22px] border border-[#ff3355]/45 p-4 text-white shadow-[0_0_0_1px_rgba(255,51,85,.15),0_18px_60px_rgba(255,36,72,0.28)] transition hover:-translate-y-1 sm:mt-12 sm:rounded-[32px] sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#ff2448]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 right-4 rotate-[-14deg] opacity-[.18]"><BlackPiece size={150} /></div>
      <div className="relative grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_280px] sm:gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="hell-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-[0.14em] text-white"><Skull size={11} />{t('bannerBadge')}</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-[#ff3355]/80">AI HELL MODE</span>
          </div>
          <h2 className="mt-2 break-keep text-[1.6rem] font-black leading-[1.1] tracking-[-0.04em] sm:mt-3 sm:text-[2.6rem]"><span className="hell-glitch hell-neon" data-text={t('bannerTitle')}>{t('bannerTitle')}</span></h2>
          <p className="mt-2 hidden max-w-xl break-keep text-sm leading-6 text-white/65 sm:block">{t('bannerDesc')}</p>
          <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
            {HELL_LIVE.map((g) => <span key={g.id} className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-[11px] font-bold text-white/80">{tc(g.id)}{g.hell.query ? ' 1:1' : ''}</span>)}
          </div>
          <p className="mt-2 flex items-start gap-1.5 break-keep text-[11px] font-black leading-4 text-[#ff8ea0] sm:mt-3 sm:inline-flex sm:items-center sm:gap-2 sm:rounded-full sm:border sm:border-[#ff3355]/40 sm:bg-black/40 sm:px-3 sm:py-1.5 sm:text-xs"><BlackPiece size={12} />{t('bannerRule')}</p>
          <span className="hell-btn mt-3 flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-black text-white transition group-hover:gap-3 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">{t('bannerCta')}<ArrowRight size={16} /></span>
        </div>

        {/* Black-piece top three. */}
        <div className="w-full">
          <p className="mb-1.5 text-center text-[9px] font-black tracking-[0.12em] text-white/45 sm:mb-2 sm:text-[10px] sm:tracking-[0.2em]">{t('bannerTop')}</p>
          <div className="grid grid-cols-3 items-end gap-0.5 sm:gap-1.5">
            {podium.map((row, i) => {
              const place = [2, 1, 3][i];
              const block = place === 1 ? 'h-10 sm:h-16 from-[#ff2448] to-[#4a0614]' : place === 2 ? 'h-7 sm:h-11 from-[#c8126f] to-[#33061f]' : 'h-5 sm:h-8 from-[#7a1430] to-[#1f050d]';
              return (
                <div key={place} className="flex min-w-0 flex-col items-center text-center">
                  {row ? <Stone name={row.nickname} size={place === 1 ? 28 : 22} /> : <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-[#ff3355]/40 text-[10px] text-[#ff3355]/70 sm:h-7 sm:w-7 sm:text-[11px]">?</span>}
                  <span className={`w-full truncate px-0.5 text-[9px] font-black sm:text-[11px] ${row ? '' : 'hidden sm:block'}`}>{row?.nickname ?? t('emptySpot')}</span>
                  {row ? <BlackPieceCount n={row.pieces} size={8} className="text-[9px] sm:text-[11px]" /> : <span className="text-[9px] text-white/35 sm:text-[11px]">—</span>}
                  <span className={`mt-1 flex w-full items-start justify-center rounded-t-xl border-x border-t border-[#ff3355]/35 bg-gradient-to-b pt-0.5 text-xs font-black text-white/90 sm:pt-1 sm:text-lg ${block}`}>{place}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
