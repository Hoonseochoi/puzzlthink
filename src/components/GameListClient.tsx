"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { GAMES } from '@/lib/gameCatalog';
import { GamePreview } from './HomeClient';
import { FitTile } from './OpenMatchCard';

/** Two columns (four on wide screens) of game tiles: the home-card picture fitted to a square, and the name. */
export default function GameListClient() {
  const tc = useTranslations('Common');
  return (
    <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
      {GAMES.map((game) => (
        <li key={game.id}>
          <Link href={game.href} className="group block rounded-[18px] border border-black/10 bg-[#f9f7f1] p-2 shadow-[0_8px_24px_rgba(30,38,36,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(30,38,36,0.12)]">
            <FitTile title={tc(game.id)} className="rounded-[12px] bg-white/70">
              <GamePreview id={game.id} />
            </FitTile>
            <p className="mt-2 flex items-center gap-1.5 truncate px-1 pb-0.5 text-[13px] font-black tracking-[-0.02em] sm:text-sm">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: game.color }} />{tc(game.id)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
