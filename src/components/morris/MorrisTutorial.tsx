"use client";

import { useTranslations } from 'next-intl';
import InlineSteps from '@/components/ui/InlineSteps';
import { POINTS, type Cell, type Move } from '@/lib/morris';
import { MorrisBoard } from './MorrisParts';

const at = (name: string) => POINTS.indexOf(name as (typeof POINTS)[number]);
/** A board from point names: `b` black, `w` white. */
function board(black: string[], white: string[]): Cell[] {
  const cells: Cell[] = POINTS.map(() => null);
  for (const n of black) cells[at(n)] = 0;
  for (const n of white) cells[at(n)] = 1;
  return cells;
}
type Mark = 'target' | 'movable' | 'remove' | null;
const marks = (names: string[], kind: Mark): Mark[] => POINTS.map((n) => (names.includes(n) ? kind : null));
const mv = (from: string | null, to: string, remove: string | null = null): Move => ({ from: from ? at(from) : null, to: at(to), remove: remove ? at(remove) : null });

function Mini(props: Parameters<typeof MorrisBoard>[0]) {
  return <div className="w-[170px]"><MorrisBoard labels={false} {...props} className="!rounded-[10px] !p-[3%]" /></div>;
}

export function MorrisTutorialSteps() {
  const t = useTranslations('MorrisTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <Mini board={board(['D6', 'B4'], ['F4'])} marks={marks(['A7', 'D7', 'G7', 'D5'], 'target')} /> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <Mini board={board(['A7', 'D7', 'G7'], ['B6', 'D6', 'F4'])} last={mv(null, 'G7')} /> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <Mini board={board(['A7', 'D7', 'G7'], ['B6', 'D6', 'F4'])} marks={marks(['B6', 'D6', 'F4'], 'remove')} /> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <Mini board={board(['A4', 'B4', 'D7'], ['C4', 'A7'])} selected={at('D7')} marks={marks(['D6', 'G7'], 'target')} /> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <Mini board={board(['A1', 'D1', 'G4'], ['B6', 'D6', 'F6', 'C3', 'E3'])} selected={at('G4')} marks={marks(['G1', 'D5', 'B2'], 'target')} /> },
    { title: t('s6Title'), desc: t('s6Desc'), visual: <Mini board={board(['A7', 'D7'], ['B6', 'D6', 'F6', 'C4', 'E4'])} /> },
  ];
  return <InlineSteps steps={steps} />;
}
