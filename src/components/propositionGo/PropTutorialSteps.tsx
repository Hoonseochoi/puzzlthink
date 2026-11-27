"use client";

import { useLocale, useTranslations } from 'next-intl';
import { Lightbulb, Timer } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import type { Prop } from '@/lib/propositionGo';
import { BOARD_BG, type CardState, NeonGrid, PgDefs, PgStone, PropCard } from './PropParts';

/** A small static board: stones (colour, point) on the 4×4 points. */
function MiniBoard({ stones, lit = [] }: { stones: [number, number, 'idle' | 'happy' | 'worried' | 'proud'][]; lit?: number[] }) {
  return (
    <div className={`relative h-[132px] w-[132px] rounded-[12px] ${BOARD_BG}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0"><NeonGrid lit={lit.reduce((m, c) => m | (1 << c), 0)} /></svg>
      {stones.map(([colour, c, mood]) => <span key={colour} className="absolute" style={{ left: `${(c & 3) * 25 + 2}%`, top: `${(c >> 2) * 25 + 2}%` }}><PgStone colour={colour} size={28} mood={mood} /></span>)}
    </div>
  );
}

const card = (prop: Prop, stones: number[], state: CardState, locale: 'ko' | 'en', hint = false) => <PropCard prop={prop} stones={stones} locale={locale} state={state} hint={hint} flash={0} />;

export function PropTutorialSteps() {
  const t = useTranslations('PropositionGo');
  const locale = useLocale() === 'en' ? 'en' : 'ko';
  const S = [0, 1, 2];
  const steps = [
    { title: t('ts1Title'), desc: t('ts1Desc'), visual: <div className="flex w-full max-w-[300px] items-center gap-3"><MiniBoard stones={[[0, 0, 'happy']]} lit={[0, 3, 12, 15]} /><div className="flex min-w-0 flex-1 flex-col gap-1.5">{card({ t: 'in', s: 0, r: 'corner' }, S, 'true', locale)}{card({ t: 'above', a: 1, b: 2 }, S, 'open', locale)}</div></div> },
    { title: t('ts2Title'), desc: t('ts2Desc'), visual: <div className="flex w-full max-w-[300px] items-center gap-3"><MiniBoard stones={[[0, 0, 'proud'], [1, 1, 'proud'], [2, 5, 'proud']]} /><div className="flex min-w-0 flex-1 flex-col gap-1.5">{card({ t: 'next', a: 0, b: 1, d: 'right' }, S, 'true', locale)}{card({ t: 'next', a: 1, b: 2, d: 'down' }, S, 'true', locale)}</div></div> },
    { title: t('ts3Title'), desc: t('ts3Desc'), visual: <div className="flex w-full max-w-[300px] flex-col gap-1.5">{card({ t: 'in', s: 0, r: 'r0' }, S, 'true', locale)}{card({ t: 'in', s: 0, r: 'r3' }, S, 'lie', locale)}</div> },
    { title: t('ts4Title'), desc: t('ts4Desc'), visual: <div className="flex items-center gap-5 text-(--accent)"><span className="flex flex-col items-center gap-2"><Timer size={34} /><b className="text-xs">3 / 10:00</b></span><span className="flex flex-col items-center gap-2 text-[#ffd36e]"><Lightbulb size={32} /><b className="text-xs">+30s</b></span></div> },
  ];
  return <><PgDefs /><InlineSteps steps={steps} /></>;
}
