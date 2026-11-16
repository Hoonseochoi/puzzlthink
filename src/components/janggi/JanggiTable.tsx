"use client";

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { type Action, type JanggiState, type Side, dropTargets, inCamp, targets } from '@/lib/janggi';
import JanggiBoard, { JanggiHand, type Selection } from './JanggiBoard';

/** Board plus both hands, with click-to-select / click-to-move. `viewer` is shown at the bottom. */
export default function JanggiTable({ game, viewer, canAct, onAction }: {
  game: JanggiState; viewer: Side; canAct: boolean; onAction: (action: Action) => void;
}) {
  const t = useTranslations('Janggi');
  const [selection, setSelection] = useState<Selection>(null);
  const [selectedAt, setSelectedAt] = useState(-1);
  const opponent: Side = viewer === 0 ? 1 : 0;
  // Selection belongs to one position; it clears itself when the game moves on.
  const active = canAct && selectedAt === game.ply ? selection : null;

  const legalTargets = useMemo(() => {
    if (!active) return [];
    if (active.kind === 'hand') return dropTargets(game, viewer);
    return targets(game, active.index);
  }, [active, game, viewer]);

  const select = (next: Selection) => { setSelection(next); setSelectedAt(game.ply); };

  const onCell = (index: number) => {
    if (!canAct) return;
    const piece = game.board[index];
    if (active && legalTargets.includes(index)) {
      onAction(active.kind === 'hand' ? { kind: 'drop', type: active.type, to: index } : { kind: 'move', from: active.index, to: index });
      select(null);
      return;
    }
    select(piece?.owner === viewer ? { kind: 'cell', index } : null);
  };

  const kingIn = (side: Side) => game.board.some((p, i) => p?.type === 'wang' && p.owner === side && inCamp(i, side === 0 ? 1 : 0));

  return (
    <div className="space-y-3">
      <JanggiHand side={opponent} types={game.hands[opponent]} viewer={viewer} label={t('opponentHand')} emptyLabel={t('emptyHand')} selectable={false} selectedType={null} onSelect={() => {}} />
      <JanggiBoard game={game} viewer={viewer} selection={active} targets={legalTargets} onCell={onCell} campLabel={t('camp')} />
      <JanggiHand
        side={viewer} types={game.hands[viewer]} viewer={viewer} label={t('myHand')} emptyLabel={t('emptyHand')} selectable={canAct}
        selectedType={active?.kind === 'hand' ? active.type : null}
        onSelect={(type) => select(active?.kind === 'hand' && active.type === type ? null : { kind: 'hand', type })}
      />
      {game.winner === null && !game.reason && (kingIn(viewer) || kingIn(opponent)) && (
        <p className="mx-auto max-w-[440px] rounded-[12px] border border-[#e8c170]/30 bg-[#e8c170]/10 px-3 py-2 text-center text-xs font-bold text-[#f3d99a]">
          {kingIn(viewer) ? t('kingEntryMine') : t('kingEntryTheirs')}
        </p>
      )}
    </div>
  );
}
