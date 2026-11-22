"use client";

import { useTranslations } from 'next-intl';
import InlineSteps from '@/components/ui/InlineSteps';
import { type Board, CELLS, LINES } from '@/lib/fourThree';
import { type CellMark, FtBoard } from './FourThreeParts';

const at = (name: string) => (Number(name[1]) - 1) * 4 + 'ABCD'.indexOf(name[0]);
/** A board from cell names: each value is the stack from the bottom (0 red, 1 yellow, 2 green, 3 blue). */
function board(cells: Record<string, number[]>): Board {
  const b: Board = Array.from({ length: CELLS }, () => []);
  for (const [name, stack] of Object.entries(cells)) b[at(name)] = stack as Board[number];
  return b;
}
const marks = (names: string[], kind: CellMark): CellMark[] => Array.from({ length: CELLS }, (_, i) => (names.map(at).includes(i) ? kind : null));
const line = (a: string, b: string, c: string) => LINES.find((l) => l.join() === [at(a), at(b), at(c)].join()) ?? [];
const GUEST = 3; // blue plays the guest in these pictures

function Mini(props: Parameters<typeof FtBoard>[0]) {
  return <div className="w-[170px]"><FtBoard compact guest={GUEST} {...props} /></div>;
}

export function FourThreeTutorialSteps() {
  const t = useTranslations('FourThreeTutorial');
  const all = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2', 'A3', 'B3', 'C3', 'D3', 'A4', 'B4', 'C4', 'D4'];
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <Mini board={board({ B2: [0], C2: [1], B3: [2], C3: [3] })} /> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <Mini board={board({ B2: [1, 0], C3: [3, 2, 1], A1: [0] })} marks={marks(all.filter((n) => n !== 'C3'), 'place')} /> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <Mini board={board({ B2: [0], C2: [1], B3: [3] })} selected={at('B2')} marks={marks(['A1', 'B1', 'C1', 'A2', 'C2', 'A3', 'B3', 'C3'], 'target')} /> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <Mini board={board({ A1: [0], B2: [1, 0], C3: [0], D4: [2] })} lines={[line('A1', 'B2', 'C3')]} /> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <Mini board={board({ A2: [3], B2: [3], C2: [3, 0], B3: [1] })} lastTo={at('C2')} /> },
    { title: t('s6Title'), desc: t('s6Desc'), visual: <Mini board={board({ B1: [1], B2: [1], B3: [3, 1], C2: [3], D3: [0] })} lines={[line('B1', 'B2', 'B3')]} /> },
  ];
  return <InlineSteps steps={steps} />;
}
