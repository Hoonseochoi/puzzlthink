"use client";

import { useTranslations } from 'next-intl';
import { History, X } from 'lucide-react';
import type { RJState, Side } from '@/lib/russianJanggi';
import RJPiece from './RJPiece';
import ResultActions from '../ResultActions';
import { MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';

export default function RJResult({ game, viewer, names, onAgain, waitingLabel, exitPath, onReplay, onClose }: {
  game: RJState; viewer: Side | null; names: string[]; onAgain?: () => void; waitingLabel?: string; exitPath: string;
  onReplay?: () => void; onClose?: () => void;
}) {
  const t = useTranslations('RussianJanggi');
  const draw = game.winner === null;
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
        {onReplay && (game.moves?.length ?? 0) > 0 && (
          <button onClick={onReplay} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/10 py-3 text-sm font-black text-(--accent) hover:bg-(--accent)/20"><History size={15} />{t('replay')}</button>
        )}
        <ResultActions onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/russian-janggi" exitPath={exitPath} primaryClass={RESULT_PRIMARY} />
      </div>
    </div>
  );
}
