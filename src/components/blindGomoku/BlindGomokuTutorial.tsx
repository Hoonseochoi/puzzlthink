"use client";

import { useTranslations } from 'next-intl';
import { Eye, FlipHorizontal2, Timer } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { STONE_COLORS, type StoneColor, type StoneOwner } from '@/lib/blindGomoku';
import BlindStone from './BlindStone';

const hex = (color: StoneColor) => STONE_COLORS.find((c) => c.id === color)!.hex;
type Mini = [row: number, col: number, color: StoneColor, owner: StoneOwner];

/** A 5×5 corner of the board for the tutorial cards. `line` draws the winning line on the truth side. */
function MiniBoard({ stones, revealed = false, line, mark }: { stones: Mini[]; revealed?: boolean; line?: [number, number, number, number]; mark?: [number, number] }) {
  const at = (n: number) => 10 + n * 20;
  return (
    <div className={`relative h-[150px] w-[150px] rounded-[8px] border p-0 shadow-[inset_0_0_30px_rgba(0,0,0,.8)] ${revealed ? 'border-[#ffd166]/45 bg-[#0d0f14]' : 'border-[#67e8ff]/25 bg-[#080c12]'}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1={at(i)} y1="10" x2={at(i)} y2="90" stroke={revealed ? '#ffd166' : '#67e8ff'} strokeOpacity=".3" strokeWidth=".6" /><line x1="10" y1={at(i)} x2="90" y2={at(i)} stroke={revealed ? '#ffd166' : '#67e8ff'} strokeOpacity=".3" strokeWidth=".6" /></g>)}
      </svg>
      {stones.map(([r, c, color, owner]) => (
        <span key={`${r}${c}`} className="absolute h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${at(c)}%`, top: `${at(r)}%` }}>
          <BlindStone color={hex(color)} owner={owner} revealed={revealed} />
        </span>
      ))}
      {mark && <span className="absolute h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-dashed border-[#ffd166]" style={{ left: `${at(mark[1])}%`, top: `${at(mark[0])}%` }} />}
      {line && revealed && (
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <line x1={at(line[1])} y1={at(line[0])} x2={at(line[3])} y2={at(line[2])} stroke="#ff334d" strokeWidth="3" strokeLinecap="round" />
          <line x1={at(line[1])} y1={at(line[0])} x2={at(line[3])} y2={at(line[2])} stroke="#fff4cb" strokeWidth=".9" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

// A small game: black (you) builds the long diagonal, white answers in the same colours.
const GAME: Mini[] = [
  [0, 0, 'red', 'black'], [0, 1, 'red', 'white'],
  [1, 1, 'blue', 'black'], [2, 1, 'blue', 'white'],
  [2, 2, 'green', 'black'], [1, 3, 'green', 'white'],
  [3, 3, 'pink', 'black'], [4, 2, 'pink', 'white'],
];
const FINAL: Mini[] = [...GAME, [4, 4, 'yellow', 'black']];

export function BlindGomokuTutorialSteps() {
  const t = useTranslations('BlindGomokuTutorial');
  const steps = [
    {
      title: t('s1Title'), desc: t('s1Desc'),
      visual: (
        <div className="grid grid-cols-7 gap-1.5">
          {STONE_COLORS.map((c) => <span key={c.id} className={`h-8 w-8 rounded-full p-[2px] ${c.id === 'blue' ? 'scale-110 ring-2 ring-white' : 'opacity-60'}`}><BlindStone color={c.hex} owner="black" /></span>)}
        </div>
      ),
    },
    {
      title: t('s2Title'), desc: t('s2Desc'),
      visual: (
        <div className="flex items-center gap-5">
          {[['you', 'black'], ['them', 'white']].map(([who, owner]) => (
            <div key={who} className="text-center">
              <div className="mx-auto h-14 w-14"><BlindStone color={hex('blue')} owner={owner as StoneOwner} /></div>
              <p className="mt-2 text-[11px] font-black text-white/60">{t(who)}</p>
            </div>
          ))}
        </div>
      ),
    },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <MiniBoard stones={GAME} mark={[4, 4]} /> },
    {
      title: t('s4Title'), desc: t('s4Desc'),
      visual: (
        <div className="flex items-center gap-3">
          <MiniBoard stones={GAME} revealed />
          <div className="flex flex-col items-center gap-1 text-[#ffe6a1]"><Eye size={18} /><span className="flex items-center gap-1 font-mono text-xs font-black"><Timer size={12} />5s</span><span className="font-mono text-[10px] text-white/40">×2</span></div>
        </div>
      ),
    },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <MiniBoard stones={FINAL} revealed line={[0, 0, 4, 4]} /> },
    {
      title: t('s6Title'), desc: t('s6Desc'),
      visual: (
        <div className="flex items-center gap-2">
          <div className="origin-right scale-[.72]"><MiniBoard stones={FINAL} /></div>
          <FlipHorizontal2 size={18} className="shrink-0 text-[#ffd166]" />
          <div className="origin-left scale-[.72]"><MiniBoard stones={FINAL} revealed line={[0, 0, 4, 4]} /></div>
        </div>
      ),
    },
  ];
  return <InlineSteps steps={steps} />;
}
