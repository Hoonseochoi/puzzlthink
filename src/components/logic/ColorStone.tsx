// The coloured PUZZLTHINK stone used by 컬러 잇기 (board, home art and guide pictures). Plain module: safe in server pages.

/** Pair colours: the PUZZLTHINK stone palette (eye colour picked for contrast). */
export const LINK_COLORS = [
  { fill: '#ff5b45', hi: '#ff9a8a', lo: '#b8291a', eye: '#ffffff' },
  { fill: '#3f8cff', hi: '#9cc2ff', lo: '#1b56b8', eye: '#ffffff' },
  { fill: '#ffd23f', hi: '#fff0a0', lo: '#c99a08', eye: '#2a2000' },
  { fill: '#3fcf6a', hi: '#a8f0b4', lo: '#1c8a3d', eye: '#ffffff' },
  { fill: '#8b5cf6', hi: '#c3a8ff', lo: '#5530b0', eye: '#ffffff' },
  { fill: '#ff8a2b', hi: '#ffc58a', lo: '#b9560c', eye: '#ffffff' },
  { fill: '#f05aa8', hi: '#ff9fcf', lo: '#a82a6b', eye: '#ffffff' },
];

/** A coloured PUZZLTHINK stone with eyes (^ ^ when happy, slanted inside a red ring when worried). */
export function ColorStone({ id, k, cx, cy, r, mood }: { id: string; k: number; cx: number; cy: number; r: number; mood: 'idle' | 'happy' | 'worried' }) {
  const c = LINK_COLORS[(k - 1) % LINK_COLORS.length];
  const ew = r * 0.2, eh = r * 0.38, ex = r * 0.3, ey = cy - r * 0.12;
  return (
    <g>
      <defs><radialGradient id={`${id}-${k}`} cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor={c.hi} /><stop offset="55%" stopColor={c.fill} /><stop offset="100%" stopColor={c.lo} /></radialGradient></defs>
      {mood === 'worried' && <circle cx={cx} cy={cy} r={r * 1.22} fill="none" stroke="#ff4d5e" strokeWidth={r * 0.14} />}
      <circle cx={cx} cy={cy + r * 0.08} r={r} fill="rgba(40,24,10,.18)" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-${k})`} stroke={c.lo} strokeWidth={r * 0.05} />
      {mood === 'happy' ? (
        <g fill="none" stroke={c.eye} strokeWidth={r * 0.13} strokeLinecap="round">
          <path d={`M${cx - ex - ew * 0.9} ${ey + eh * 0.15} Q${cx - ex} ${ey - eh * 0.55} ${cx - ex + ew * 0.9} ${ey + eh * 0.15}`} />
          <path d={`M${cx + ex - ew * 0.9} ${ey + eh * 0.15} Q${cx + ex} ${ey - eh * 0.55} ${cx + ex + ew * 0.9} ${ey + eh * 0.15}`} />
        </g>
      ) : (
        <g fill={c.eye}>
          <rect x={cx - ex - ew / 2} y={ey - eh / 2} width={ew} height={eh} rx={ew / 2} transform={mood === 'worried' ? `rotate(25 ${cx - ex} ${ey})` : undefined} />
          <rect x={cx + ex - ew / 2} y={ey - eh / 2} width={ew} height={eh} rx={ew / 2} transform={mood === 'worried' ? `rotate(-25 ${cx + ex} ${ey})` : undefined} />
        </g>
      )}
      <ellipse cx={cx - r * 0.42} cy={cy - r * 0.5} rx={r * 0.18} ry={r * 0.1} fill="#ffffff" opacity={0.5} transform={`rotate(-35 ${cx - r * 0.42} ${cy - r * 0.5})`} />
    </g>
  );
}
