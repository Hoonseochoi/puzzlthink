"use client";

import { useTranslations } from 'next-intl';
import { History, X } from 'lucide-react';
import type { RJState, Side } from '@/lib/russianJanggi';
import RJPiece from './RJPiece';
import ResultActions from '../ResultActions';
import { ACCENT_TEXT } from './theme';

export default function RJResult({ game, viewer, names, onAgain, waitingLabel, exitPath, onReplay, onClose }: {
  game: RJState; viewer: Side | null; names: string[]; onAgain?: () => void; waitingLabel?: string; exitPath: string;
  onReplay?: () => void; onClose?: () => void;
}) {
  const t = useTranslations('RussianJanggi');
  const draw = game.winner === null;
  const title = draw ? t('resultDraw') : game.winner === viewer ? t('resultWin') : viewer === null ? t('resultWinner', { player: names[game.winner!] }) : t('resultLose');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-[24px] border border-[#f2b84b]/30 bg-[#13110f] p-7 text-center shadow-[0_0_90px_rgba(242,184,75,.18)]">
        {onClose && <button onClick={onClose} aria-label={t('closeResult')} className="absolute right-3 top-3 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={16} /></button>}
        <div className="mx-auto flex h-20 items-end justify-center gap-1">
          {draw
            ? <><RJPiece owner={0} size={1} className="h-12 w-12" /><RJPiece owner={1} size={1} className="h-12 w-12" /></>
            : <><RJPiece owner={game.winner!} size={0} className="h-9 w-9" /><RJPiece owner={game.winner!} size={2} className="h-20 w-20" /><RJPiece owner={game.winner!} size={1} className="h-12 w-12" /></>}
        </div>
        <h2 className={`mt-5 text-3xl font-black tracking-tight ${ACCENT_TEXT}`}>{title}</h2>
        <p className="mt-2 text-sm text-white/55">{t(`reason_${game.reason}`)}</p>
        {onReplay && (game.moves?.length ?? 0) > 0 && (
          <button onClick={onReplay} className="mt-5 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#f2b84b]/40 bg-[#f2b84b]/10 py-3 text-sm font-black text-[#ffdc95] hover:bg-[#f2b84b]/20"><History size={15} />{t('replay')}</button>
        )}
        <ResultActions onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/russian-janggi" exitPath={exitPath} primaryClass="rounded-[12px] bg-[#f2b84b] text-[#1d1405] hover:bg-[#ffcd6e]" />
      </div>
    </div>
  );
}
