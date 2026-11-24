import { useId } from 'react';

/** One black piece = one win against the 매우 어려움 AI: the same zigzag as the gold piece, in obsidian with a red neon edge. */
export function BlackPiece({ size = 18, glow = true }: { size?: number; glow?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 44 28" width={size * 1.57} height={size} className={`inline-block shrink-0 ${glow ? 'drop-shadow-[0_0_4px_rgba(255,51,85,.75)]' : ''}`} aria-hidden>
      <defs>
        <linearGradient id={`bp-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a4652" />
          <stop offset="45%" stopColor="#17151c" />
          <stop offset="100%" stopColor="#050407" />
        </linearGradient>
      </defs>
      <path d="M4 25 V4 H16 V24 H28 V4 H40 V25" fill="none" stroke="#ff3355" strokeWidth="6.6" strokeLinejoin="miter" strokeLinecap="square" strokeOpacity=".9" />
      <path d="M4 25 V4 H16 V24 H28 V4 H40 V25" fill="none" stroke={`url(#bp-${id})`} strokeWidth="4.6" strokeLinejoin="miter" strokeLinecap="square" />
      <path d="M2.6 23.5 V2.6 H17" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth=".8" />
    </svg>
  );
}

/** "[black piece] ×42". */
export function BlackPieceCount({ n, size = 14, className = '' }: { n: number; size?: number; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center gap-1 font-mono font-black ${className}`}><BlackPiece size={size} /><span className="text-white/35">×</span>{n}</span>;
}
