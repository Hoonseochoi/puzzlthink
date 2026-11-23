"use client";

import { useMemo } from 'react';
import { buildBoard } from '@/lib/logicPuzzles';
import { lineSums, magicSum } from '@/lib/magicswap';
import MagicSwapBoard from './MagicSwapBoard';

export type MagicFigureId = 'hero' | 'magicPair' | 'magicSame' | 'magicNotes' | 'magicDiag';

/** 공략 pictures for 마방진 스왑: small live boards (read-only) built from one 5×5 magic square. */
export default function MagicGuideFigure({ id }: { id: MagicFigureId }) {
  const fig = useMemo(() => {
    const b = buildBoard('magicswap', 5, 20271123);
    if (b.kind !== 'magicswap') return null;
    const n = 5, M = magicSum(n), a = b.answer;
    const swapped = (i: number, j: number) => { const g = a.slice(); [g[i], g[j]] = [g[j], g[i]]; return g; };
    if (id === 'hero') return { board: b, marks: a, demo: {}, solved: true };
    if (id === 'magicPair') return { board: b, marks: swapped(8, 16), demo: { sel: 8, target: 16 } };
    if (id === 'magicSame') return { board: b, marks: swapped(5, 8), demo: { sel: 5, target: 8 } };
    if (id === 'magicDiag') {
      // Rows 0 and 1 traded whole: every row and column still adds up, the diagonals do not.
      const g = a.slice();
      for (let c = 0; c < n; c++) [g[c], g[n + c]] = [g[n + c], g[c]];
      return { board: b, marks: g, demo: {} };
    }
    // magicNotes: the scrambled start, ✓ where row and column both add up, ● where two wrong lines cross.
    const s = lineSums(n, b.start);
    const pins: Record<number, 1 | 2> = {};
    for (let i = 0; i < n * n; i++) {
      const rOk = s.rows[Math.floor(i / n)] === M, cOk = s.cols[i % n] === M;
      if (rOk && cOk) pins[i] = 1; else if (!rOk && !cOk && b.swaps.some(([x, y]) => x === i || y === i)) pins[i] = 2;
    }
    return { board: b, marks: b.start, demo: { pins } };
  }, [id]);
  if (!fig) return null;
  return <MagicSwapBoard board={fig.board} marks={fig.marks} readOnly solved={'solved' in fig && fig.solved} demo={fig.demo} />;
}
