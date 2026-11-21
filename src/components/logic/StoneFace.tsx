/**
 * PUZZLTHINK's stone character (the glossy 바둑알 with two eyes) drawn inside a board's SVG.
 * `mood`: idle (two upright eyes), happy (^ ^ when its rule is kept) or worried (a red ring and slanted eyes when broken).
 * Put <StoneDefs prefix=…/> once in the SVG for the gradients.
 */
export const STONE_TONES = {
  white: { hi: '#ffffff', mid: '#eeebe4', lo: '#bdb8ad', rim: '#9b978c', eye: '#17201e' },
  black: { hi: '#62656f', mid: '#22242b', lo: '#060608', rim: '#000000', eye: '#ffffff' },
} as const;
export type StoneKind = keyof typeof STONE_TONES;
export type StoneMood = 'idle' | 'happy' | 'worried';

export function StoneDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      {(Object.keys(STONE_TONES) as StoneKind[]).map((k) => (
        <radialGradient key={k} id={`${prefix}-${k}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={STONE_TONES[k].hi} />
          <stop offset="55%" stopColor={STONE_TONES[k].mid} />
          <stop offset="100%" stopColor={STONE_TONES[k].lo} />
        </radialGradient>
      ))}
    </defs>
  );
}

export function StoneFace({ prefix, kind, cx, cy, r, mood = 'idle' }: { prefix: string; kind: StoneKind; cx: number; cy: number; r: number; mood?: StoneMood }) {
  const tone = STONE_TONES[kind];
  const ew = r * 0.2, eh = r * 0.38, ex = r * 0.3, ey = cy - r * 0.12;
  return (
    <g>
      {mood === 'worried' && <circle cx={cx} cy={cy} r={r * 1.22} fill="none" stroke="#ff4d5e" strokeWidth={r * 0.14} opacity={0.9} />}
      <circle cx={cx} cy={cy + r * 0.08} r={r} fill="rgba(40,24,10,.18)" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${prefix}-${kind})`} stroke={tone.rim} strokeWidth={r * 0.05} />
      {mood === 'happy' ? (
        <g fill="none" stroke={tone.eye} strokeWidth={r * 0.13} strokeLinecap="round">
          <path d={`M${cx - ex - ew * 0.9} ${ey + eh * 0.15} Q${cx - ex} ${ey - eh * 0.55} ${cx - ex + ew * 0.9} ${ey + eh * 0.15}`} />
          <path d={`M${cx + ex - ew * 0.9} ${ey + eh * 0.15} Q${cx + ex} ${ey - eh * 0.55} ${cx + ex + ew * 0.9} ${ey + eh * 0.15}`} />
        </g>
      ) : mood === 'worried' ? (
        <g fill={tone.eye}>
          <rect x={cx - ex - ew / 2} y={ey - eh / 2} width={ew} height={eh} rx={ew / 2} transform={`rotate(25 ${cx - ex} ${ey})`} />
          <rect x={cx + ex - ew / 2} y={ey - eh / 2} width={ew} height={eh} rx={ew / 2} transform={`rotate(-25 ${cx + ex} ${ey})`} />
        </g>
      ) : (
        <g fill={tone.eye}>
          <rect x={cx - ex - ew / 2} y={ey - eh / 2} width={ew} height={eh} rx={ew / 2} />
          <rect x={cx + ex - ew / 2} y={ey - eh / 2} width={ew} height={eh} rx={ew / 2} />
        </g>
      )}
      {/* A small glint keeps the stone glossy at any size. */}
      <ellipse cx={cx - r * 0.42} cy={cy - r * 0.5} rx={r * 0.18} ry={r * 0.1} fill="#ffffff" opacity={kind === 'white' ? 0.9 : 0.28} transform={`rotate(-35 ${cx - r * 0.42} ${cy - r * 0.5})`} />
    </g>
  );
}
