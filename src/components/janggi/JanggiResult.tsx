"use client";

import { useTranslations } from 'next-intl';
import { History, X } from 'lucide-react';
import type { JanggiState, Side } from '@/lib/janggi';
import JanggiPiece from './JanggiPiece';
import ResultActions from '../ResultActions';
import { MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT, accentVars } from '../ui/gameUi';
import { GOLD, hanjaFont } from './theme';

export default function JanggiResult({ game, viewer, names, onAgain, waitingLabel, exitPath, onReplay, onClose }: {
  game: JanggiState; viewer: Side | null; names: string[]; onAgain?: () => void; againLabel?: string; waitingLabel?: string; exitPath: string;
  onReplay?: () => void; onClose?: () => void;
}) {
  const t = useTranslations('Janggi');
  const draw = game.winner === null;
  const title = draw ? t('resultDraw') : game.winner === viewer ? t('resultWin') : t('resultWinner', { player: names[game.winner!] });
  return (
    <div className={MODAL_BACKDROP} style={accentVars(GOLD, '#1a1408')}>
      <div className={MODAL}>
        {onClose && <button onClick={onClose} aria-label={t('closeResult')} className={MODAL_CLOSE}><X size={16} /></button>}
        <div className="mx-auto h-20 w-20">{!draw && <JanggiPiece type="wang" owner={game.winner!} className="h-full w-full" />}</div>
        <p className={`${hanjaFont.className} mt-5 text-sm tracking-[0.4em] text-(--accent)`}>{draw ? '和' : '勝'}</p>
        <h2 className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{title}</h2>
        <p className="mt-2 text-sm text-white/50">{t(`reason_${game.reason}`)}</p>
        {onReplay && (game.moves?.length ?? 0) > 0 && (
          <button onClick={onReplay} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/10 py-3 text-sm font-extrabold text-(--accent) hover:bg-(--accent)/20"><History size={15} />{t('replay')}</button>
        )}
        <ResultActions onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/janggi" exitPath={exitPath} primaryClass={RESULT_PRIMARY} />
      </div>
    </div>
  );
}
