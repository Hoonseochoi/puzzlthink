"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Skull } from 'lucide-react';
import { GAMES } from '@/lib/gameCatalog';
import { HELL_LIVE } from '@/lib/hell';
import { GamePreview } from './HomeClient';
import { FitTile } from './OpenMatchCard';

/** Two columns (four on wide screens) of game tiles: the home-card picture fitted to a square, and the name. */
export default function GameListClient() {
  const tc = useTranslations('Common');
  const th = useTranslations('Hell');
  return (
    <>
    {/* 게임 카테고리: only the games with a 매우 어려움 AI, on the hell page. */}
    {HELL_LIVE.length > 0 && <Link href="/hell" className="hell-surface hell-scan mt-4 flex items-center gap-3 rounded-[18px] border border-[#ff3355]/45 px-4 py-3 text-white shadow-[0_0_24px_rgba(255,36,72,.2)] transition hover:-translate-y-0.5">
      <Skull size={20} className="shrink-0 text-[#ff3355]" />
      <span className="min-w-0 flex-1"><span className="block text-sm font-black">{th('listTitle')}</span><span className="block truncate text-[11px] text-white/55">{th('listDesc', { n: HELL_LIVE.length })}</span></span>
      <span className="hell-btn shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black">{tc('hellModeGo')}</span>
    </Link>}
    <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
      {GAMES.map((game) => (
        <li key={game.id}>
          <Link href={game.href} className="group block rounded-[18px] border border-black/10 bg-[#f9f7f1] p-2 shadow-[0_8px_24px_rgba(30,38,36,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(30,38,36,0.12)]">
            <FitTile title={tc(game.id)} className="rounded-[12px] bg-white/70">
              <GamePreview id={game.id} />
            </FitTile>
            <p className="mt-2 flex items-center gap-1.5 truncate px-1 pb-0.5 text-[13px] font-black tracking-[-0.02em] sm:text-sm">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: game.color }} />{tc(game.id)}
              {game.hell?.live && <span className="ml-auto shrink-0 rounded-full bg-[#07060a] px-1.5 py-0.5 text-[9px] font-black text-[#ff3355] ring-1 ring-[#ff3355]/50">HELL</span>}
            </p>
          </Link>
        </li>
      ))}
    </ul>
    </>
  );
}
