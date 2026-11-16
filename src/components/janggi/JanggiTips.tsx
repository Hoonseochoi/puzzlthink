"use client";

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { type Action, type JanggiState, type Side, COLS, HANJA, ROWS, colOf, rowOf, turningPointAt, turnsOf } from '@/lib/janggi';
import JanggiDiagram, { type JanggiDiagramSpec } from './JanggiDiagram';
import { Analyzing, TipList, TipsModal, useFirstMatch } from '../ui/TipsModal';

const LOOK_BACK = 10; // how many of my moves to check, latest first
const BUDGET_MS = 350; // search time per position

/** The position before the turning point, drawn from `viewer`'s side, with both moves as arrows. */
function spec(before: JanggiState, viewer: Side, played: Action, better: Action): JanggiDiagramSpec {
  const flip = viewer === 1;
  const rc = (i: number): [number, number] => (flip ? [ROWS - 1 - rowOf(i), COLS - 1 - colOf(i)] : [rowOf(i), colOf(i)]);
  const side = (owner: Side): Side => (owner === viewer ? 0 : 1);
  const arrow = (a: Action, kind: 'capture' | 'move' | 'drop'): [number, number, number, number, 'capture' | 'move' | 'drop'] => {
    const [r2, c2] = rc(a.to);
    if (a.kind === 'drop') return [ROWS, 1, r2, c2, kind];
    const [r1, c1] = rc(a.from);
    return [r1, c1, r2, c2, kind];
  };
  const opponent: Side = viewer === 0 ? 1 : 0;
  return {
    pieces: before.board.flatMap((p, i) => (p ? [[p.type, side(p.owner), ...rc(i)] as [typeof p.type, Side, number, number]] : [])),
    hands: ([[0, before.hands[viewer]], [1, before.hands[opponent]]] as [Side, typeof before.hands[0]][]).filter(([, types]) => types.length > 0),
    arrows: [arrow(played, 'capture'), arrow(better, better.kind === 'drop' ? 'drop' : 'move')],
    glow: [rc(better.to)],
  };
}

export default function JanggiTips({ game, viewer, onClose }: { game: JanggiState; viewer: Side; onClose: () => void }) {
  const t = useTranslations('Janggi');
  const indices = useMemo(() => turnsOf(game, viewer).slice(0, LOOK_BACK), [game, viewer]);
  const { done, result } = useFirstMatch(indices, (i) => turningPointAt(game, i, BUDGET_MS), true);

  const describe = (before: JanggiState, a: Action) => {
    if (a.kind === 'drop') return t('tipDrop', { piece: HANJA[a.type] });
    const piece = before.board[a.from]!, target = before.board[a.to];
    return target ? t('tipCapture', { piece: HANJA[piece.type], target: HANJA[target.type] }) : t('tipMove', { piece: HANJA[piece.type] });
  };

  return (
    <TipsModal title={t('tipsTitle')} closeLabel={t('tipsClose')} onClose={onClose}>
      {!done && <Analyzing label={t('tipsAnalyzing')} />}
      {done && result && (
        <div className="mt-4">
          <p className="text-[11px] font-bold text-(--accent)">{t('tipsMoveNo', { n: result.index + 1 })}</p>
          <div className="mx-auto mt-3 w-48"><JanggiDiagram spec={spec(result.before, viewer, result.played, result.better)} label={t('tipsTitle')} /></div>
          <p className="mt-2 text-center text-[10px] text-white/40">{t('tipsLegend')}</p>
          <dl className="mt-4 space-y-2 text-[13px]">
            <div className="flex gap-2 rounded-md border border-[#ff5b3a]/30 bg-[#ff5b3a]/[0.06] px-3 py-2"><dt className="shrink-0 font-black text-[#ff8a70]">{t('tipsPlayed')}</dt><dd className="text-white/75">{describe(result.before, result.played)}</dd></div>
            <div className="flex gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/[0.08] px-3 py-2"><dt className="shrink-0 font-black text-(--accent)">{t('tipsBetter')}</dt><dd className="text-white/85">{describe(result.before, result.better)}</dd></div>
          </dl>
          <p className="mt-3 text-[13px] leading-6 text-white/65">{t(`tipsOutcome_${result.outcome}`)} {t('tipsPlayedLoses')}</p>
        </div>
      )}
      {done && !result && <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-[13px] leading-6 text-white/60">{t('tipsNotFound')}</p>}
      <TipList heading={t('tipsGeneral')} tips={t.raw('tipsList') as { title: string; body: string }[]} />
    </TipsModal>
  );
}
