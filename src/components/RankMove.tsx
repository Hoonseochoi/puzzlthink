/**
 * Today's move on a ranking board: ▲2 / ▼1 / – (same) / NEW (on the board since today's first snapshot).
 * `prev` undefined = no data, so nothing is shown.
 */
export default function RankMove({ rank, prev, dark = false }: { rank: number; prev: number | null | undefined; dark?: boolean }) {
  if (prev === undefined) return null;
  const base = 'inline-flex w-9 shrink-0 items-center justify-center font-mono text-[10px] font-black';
  if (prev === null) return <span className={`${base} rounded-full bg-[#ff4d5e] py-0.5 tracking-wider text-white`} title="NEW">NEW</span>;
  const d = prev - rank;
  if (d > 0) return <span className={`${base} text-[#1fa463]`} title={`▲${d}`}>▲{d}</span>;
  if (d < 0) return <span className={`${base} text-[#e5484d]`} title={`▼${-d}`}>▼{-d}</span>;
  return <span className={`${base} ${dark ? 'text-white/30' : 'text-black/25'}`}>–</span>;
}
