"use client";

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { PoStone } from './PoParts';

type Mini = [row: number, col: number, seat: number];

/** A 5×5 corner of the board. `marks` are the three points put up (numbered), `line` a finished five. */
export function PoMiniBoard({ stones = [], marks = [], line, size = 150 }: { stones?: Mini[]; marks?: [number, number][]; line?: [number, number, number, number]; size?: number }) {
  const at = (n: number) => 10 + n * 20;
  return (
    <div className="relative rounded-[8px] border border-white/15 bg-[#12131a] shadow-[inset_0_0_30px_rgba(0,0,0,.8)]" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1={at(i)} y1="10" x2={at(i)} y2="90" stroke="#c9cfe3" strokeOpacity=".25" strokeWidth=".6" /><line x1="10" y1={at(i)} x2="90" y2={at(i)} stroke="#c9cfe3" strokeOpacity=".25" strokeWidth=".6" /></g>)}
      </svg>
      {stones.map(([r, c, seat]) => <span key={`${r}${c}`} className="absolute h-[17%] w-[17%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${at(c)}%`, top: `${at(r)}%` }}><PoStone seat={seat} /></span>)}
      {marks.map(([r, c], i) => <span key={`m${r}${c}`} className="absolute flex h-[17%] w-[17%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-(--accent)/25 font-mono text-[11px] font-black text-white ring-2 ring-(--accent)" style={{ left: `${at(c)}%`, top: `${at(r)}%` }}>{i + 1}</span>)}
      {line && <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden><line x1={at(line[1])} y1={at(line[0])} x2={at(line[3])} y2={at(line[2])} stroke="#ff5d8f" strokeWidth="3" strokeLinecap="round" /><line x1={at(line[1])} y1={at(line[0])} x2={at(line[3])} y2={at(line[2])} stroke="#fff" strokeWidth=".9" strokeLinecap="round" /></svg>}
    </div>
  );
}

const BASE: Mini[] = [[1, 1, 0], [2, 2, 0], [1, 3, 1], [3, 1, 1], [2, 3, 1]];

function Bids({ values, dim = false }: { values: number[]; dim?: boolean }) {
  return <div className="flex gap-1.5">{values.map((v, i) => <span key={i} className={`flex h-10 w-10 flex-col items-center justify-center rounded-[10px] border font-mono text-base font-black ${dim ? 'border-white/10 bg-white/5 text-white/55' : 'border-(--accent)/50 bg-(--accent)/15 text-white'}`}><span className="text-[8px] text-white/40">{i + 1}</span>{v}</span>)}</div>;
}

export function PointOmokTutorialSteps() {
  const t = useTranslations('PointOmokTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <PoMiniBoard stones={BASE} marks={[[3, 2], [3, 3], [3, 4]]} /> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <div className="flex flex-col items-center gap-2"><Bids values={[5, 3, 2]} /><span className="font-mono text-xs font-bold text-white/55">5 + 3 + 2 = 10P</span></div> },
    {
      title: t('s3Title'), desc: t('s3Desc'), visual: (
        <div className="flex items-center gap-3">
          <div className="space-y-1.5"><Bids values={[5, 3, 2]} /><Bids values={[4, 3, 3]} dim /></div>
          <ArrowRight size={16} className="text-(--accent)" />
          <div className="flex gap-1">{[0, 1, 1].map((s, i) => <span key={i} className="h-8 w-8"><PoStone seat={s} /></span>)}</div>
        </div>
      ),
    },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <div className="flex flex-col items-center gap-2 font-mono text-sm font-black"><Bids values={[3, 1, 1]} /><span className="text-white/60">10 − 5 = 5 → ⌊5 ÷ 2⌋ = <span className="text-[#7ff0bf]">+2</span></span><span className="text-white">10 + 2 = 12P</span></div> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <PoMiniBoard stones={[[0, 0, 0], [1, 1, 0], [2, 2, 0], [3, 3, 0], [4, 4, 0], [0, 2, 1], [1, 2, 1], [3, 2, 1], [4, 2, 1]]} line={[0, 0, 4, 4]} /> },
  ];
  return <InlineSteps steps={steps} />;
}

/** Home card picture: a board corner mid-game with three points put up. */
export function PointOmokPreview() {
  return (
    <div className="flex items-center justify-center rounded-[12px] bg-[#0b0c11] p-2 [--accent:#ff5d8f]">
      <PoMiniBoard size={176} stones={[[0, 1, 0], [1, 1, 1], [1, 2, 0], [2, 1, 0], [2, 3, 1], [3, 2, 1], [3, 0, 1], [0, 3, 0]]} marks={[[4, 1], [4, 2], [4, 3]]} />
    </div>
  );
}
