import { CLD_N } from '@/lib/colorLinkDuel';
import { ColorStone } from '../logic/ColorStone';
import { cldColor } from './copy';

// A small joined board: four colours, every line six cells or more, and one lone stone with its dashed partner.
const STONES: [number, number][] = [[8, 1], [11, 1], [15, 2], [36, 2], [26, 8], [46, 8], [5, 6], [25, 6], [42, 11]];
const LINES: [number, number[]][] = [
  [1, [8, 1, 2, 3, 4, 11]],
  [2, [15, 22, 23, 30, 37, 36]],
  [8, [26, 33, 34, 41, 48, 47, 46]],
  [6, [5, 12, 19, 18, 17, 24, 25]],
  [11, [42, 43, 44, 45, 38, 31]],
];
const GHOST = 31;
const at = (cell: number) => [(cell % CLD_N) + 0.5, Math.floor(cell / CLD_N) + 0.5];

/** Entry-screen and home art: a 7×7 컬러 링크 board with its lines drawn. */
export default function CldPreview({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={`-0.15 -0.15 ${CLD_N + 0.3} ${CLD_N + 0.3}`} className={`block aspect-square w-full ${className}`} aria-hidden>
      <rect x={-0.15} y={-0.15} width={CLD_N + 0.3} height={CLD_N + 0.3} rx={0.35} fill="#2a2470" />
      <rect x={0} y={0} width={CLD_N} height={CLD_N} rx={0.14} fill="#f7f2e8" />
      {Array.from({ length: CLD_N - 1 }, (_, i) => <g key={i} stroke="#e1d6c2" strokeWidth={0.03}><line x1={i + 1} y1={0} x2={i + 1} y2={CLD_N} /><line x1={0} y1={i + 1} x2={CLD_N} y2={i + 1} /></g>)}
      {LINES.map(([k, cells]) => <polyline key={k} points={cells.map((c) => at(c).join(',')).join(' ')} fill="none" stroke={cldColor(k).fill} strokeWidth={0.3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={k === 11 ? '0.25 0.12' : undefined} opacity={0.9} />)}
      <circle cx={at(GHOST)[0]} cy={at(GHOST)[1]} r={0.34} fill="#fff" stroke={cldColor(11).fill} strokeWidth={0.06} strokeDasharray="0.12 0.08" />
      {STONES.map(([cell, k]) => <ColorStone key={cell} id="cldp" k={k} cx={at(cell)[0]} cy={at(cell)[1]} r={0.4} mood="happy" color={cldColor(k)} label={'ABCDEFGHIJKLMN'[k - 1]} />)}
    </svg>
  );
}

/** Home-card picture (laid out in the 300px preview box like the other games). */
export function CldTile() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_30%,#4b3fc4,#15123e_72%)] p-2 shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:p-3 sm:shadow-2xl">
      <CldPreview />
    </div>
  );
}
