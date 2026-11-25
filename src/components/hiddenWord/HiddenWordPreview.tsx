import { KeyRound } from 'lucide-react';

const HINTS: [string, number, string][] = [['과일', 96.5, '#ff5d73'], ['여름', 88, '#a8ef70'], ['바다', 61, '#3fd0c9']];

function Gauges({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`w-full ${compact ? 'space-y-1.5' : 'space-y-2'}`}>
      {HINTS.map(([word, score, color]) => (
        <li key={word} className="rounded-[9px] border border-white/10 bg-black/35 px-2.5 py-1.5">
          <div className="flex items-baseline justify-between"><b lang="ko" className="text-[13px] font-black text-[#f2f5ee]">{word}</b><span className="font-mono text-[11px] font-black" style={{ color }}>{score}%</span></div>
          <div className="mt-1 h-1 rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${score}%`, background: color }} /></div>
        </li>
      ))}
    </ul>
  );
}

/** Entry-screen art: a sealed word over three hints and their similarity gauges. */
export default function HiddenWordPreview() {
  return (
    <div aria-hidden className="relative mx-auto flex h-[230px] w-[240px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_25%,rgba(168,239,112,.28),rgba(18,18,23,.96)_70%)] px-6 md:w-full">
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-white/40">HIDDEN WORD</p>
      <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-[#ffc857]/45 bg-[#ffc857]/10 px-4 py-2">
        <KeyRound size={15} className="text-[#ffc857]" /><span className="font-mono text-xl font-black tracking-[0.3em] text-[#ffc857]">???</span>
      </div>
      <Gauges />
    </div>
  );
}

/** Home-card picture (laid out in the 300px preview box like the other games). */
export function HiddenWordTile() {
  return (
    <div aria-hidden className="relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_25%,#2f5a2c,#0f1a12_72%)] px-4 shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <div className="flex items-center gap-1.5 rounded-[10px] border border-[#ffc857]/50 bg-black/30 px-3 py-1.5">
        <KeyRound size={13} className="text-[#ffc857]" /><span className="font-mono text-base font-black tracking-[0.3em] text-[#ffc857]">???</span>
      </div>
      <Gauges compact />
    </div>
  );
}
