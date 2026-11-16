"use client";

import type { PlayerId } from '@/lib/wallgo';
import WallGoCharacter from './WallGoCharacter';

/** Phone-only scoreboard above the board: who is playing, territory, pieces and wall break. */
export default function WallGoScoreStrip({ players, current, active, names, scores, pieces, total, breaks, unit }: {
  players: PlayerId[]; current: PlayerId; active: boolean; names: string[];
  scores: number[]; pieces: number[]; total: number; breaks: boolean[] | null; unit: string;
}) {
  return (
    <div className="mb-3 grid gap-1.5 lg:hidden" style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}>
      {players.map((player) => (
        <div key={player} className={`flex min-w-0 items-center gap-2 rounded-[10px] border px-2 py-1.5 ${active && current === player ? 'border-[#e0283a]/60 bg-[#e0283a]/10' : 'border-white/10 bg-black/30'}`}>
          <WallGoCharacter player={player} className="h-6 shrink-0" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[11px] font-extrabold">{names[player]}</p>
            <p className="whitespace-nowrap font-mono text-[10px] text-white/50">{scores[player]}<span className="text-white/30">{unit}</span> · {pieces[player]}/{total}{breaks && <span className={breaks[player] ? 'text-[#ff4d5e]' : 'text-white/25'}> ◆</span>}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
