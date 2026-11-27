"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { History, X } from 'lucide-react';
import type { RJState, Side } from '@/lib/russianJanggi';
import RJPiece from './RJPiece';
import ResultActions from '../ResultActions';
import RJTips from './RJTips';
import { TipsButton } from '../ui/TipsModal';
import { MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';

/** One line on how the game ended (the end-reveal banner): who won and why. */
export function rjEndText(t: (key: string, values?: Record<string, string>) => string, game: RJState, viewer: Side | null, names: string[]) {
  if (!game.reason) return '';
  const title = game.winner === null ? t('resultDraw') : game.winner === viewer ? t('resultWin') : viewer === null ? t('resultWinner', { player: names[game.winner] }) : t('resultLose');
  return `${title} · ${t(`reason_${game.reason}`)}`;
}

export default function RJResult({ game, viewer, names, onAgain, waitingLabel, onReplay, onClose }: {
  game: RJState; viewer: Side | null; names: string[]; onAgain?: () => void; waitingLabel?: string;
  onReplay?: () => void; onClose?: () => void;
}) {
  const t = useTranslations('RussianJanggi');
  const draw = game.winner === null;
  const [tipsOpen, setTipsOpen] = useState(false);
  // Only the player who lost gets the winning tips (spectators and winners do not).
  const lost = viewer !== null && game.winner !== null && game.winner !== viewer && (game.moves?.length ?? 0) > 0;
  const title = draw ? t('resultDraw') : game.winner === viewer ? t('resultWin') : viewer === null ? t('resultWinner', { player: names[game.winner!] }) : t('resultLose');
  return (
    <div className={MODAL_BACKDROP}>
      <div className={MODAL}>
        {onClose && <button onClick={onClose} aria-label={t('closeResult')} className={MODAL_CLOSE}><X size={16} /></button>}
        <div className="mx-auto flex h-20 items-end justify-center gap-1">
          {draw
            ? <><RJPiece owner={0} size={1} className="h-12 w-12" /><RJPiece owner={1} size={1} className="h-12 w-12" /></>
            : <><RJPiece owner={game.winner!} size={0} className="h-9 w-9" /><RJPiece owner={game.winner!} size={2} className="h-20 w-20" /><RJPiece owner={game.winner!} size={1} className="h-12 w-12" /></>}
        </div>
        <h2 className={`mt-5 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{title}</h2>
        <p className="mt-2 text-sm text-white/55">{t(`reason_${game.reason}`)}</p>
        <ResultActions replay={<>
          {onReplay && (game.moves?.length ?? 0) > 0 && (
            <button onClick={onReplay} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/10 py-3 text-sm font-black text-(--accent) hover:bg-(--accent)/20"><History size={15} />{t('replay')}</button>
          )}
          {lost && <TipsButton label={t('tipsButton')} onOpen={() => setTipsOpen(true)} />}
        </>} won={draw || viewer === null ? undefined : game.winner === viewer} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/russian-janggi" primaryClass={RESULT_PRIMARY} />
        {tipsOpen && lost && <RJTips game={game} viewer={viewer!} onClose={() => setTipsOpen(false)} />}
      </div>
    </div>
  );
}
