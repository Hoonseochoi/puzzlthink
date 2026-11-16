"use client";

import { useTranslations } from 'next-intl';
import type { JanggiState, Side } from '@/lib/janggi';
import JanggiPiece from './JanggiPiece';
import ResultActions from '../ResultActions';
import { GOLD_TEXT, hanjaFont } from './theme';

export default function JanggiResult({ game, viewer, names, onAgain, waitingLabel, exitPath }: {
  game: JanggiState; viewer: Side | null; names: string[]; onAgain?: () => void; againLabel?: string; waitingLabel?: string; exitPath: string;
}) {
  const t = useTranslations('Janggi');
  const draw = game.winner === null;
  const title = draw ? t('resultDraw') : game.winner === viewer ? t('resultWin') : t('resultWinner', { player: names[game.winner!] });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-[#e8c170]/30 bg-[#11131a] p-7 text-center shadow-[0_0_90px_rgba(232,193,112,.18)]">
        <div className="mx-auto h-20 w-20">{!draw && <JanggiPiece type="wang" owner={game.winner!} className="h-full w-full" />}</div>
        <p className={`${hanjaFont.className} mt-5 text-sm tracking-[0.4em] text-[#e8c170]`}>{draw ? '和' : '勝'}</p>
        <h2 className={`mt-1 text-3xl font-black tracking-tight ${GOLD_TEXT}`}>{title}</h2>
        <p className="mt-2 text-sm text-white/55">{t(`reason_${game.reason}`)}</p>
        <ResultActions onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/janggi" exitPath={exitPath} primaryClass="rounded-[12px] bg-[#e8c170] text-[#1a1408] hover:bg-[#f3d38d]" />
      </div>
    </div>
  );
}
