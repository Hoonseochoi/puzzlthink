import type { LaserPiece as Piece } from '@/lib/laserJanggi';
import { LASER_CYAN, LASER_RED } from './theme';

export default function LaserPiece({ piece, selected = false, label, className = '' }: { piece: Piece; selected?: boolean; label?: string; className?: string }) {
  const color = piece.owner === 0 ? LASER_CYAN : LASER_RED;
  const dark = piece.owner === 0 ? '#092b34' : '#360c17';
  return (
    <span role={label ? 'img' : undefined} aria-label={label} className={`relative block aspect-square transition ${selected ? 'scale-110' : ''} ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible drop-shadow-[0_8px_12px_rgba(0,0,0,.65)]">
        <defs>
          <linearGradient id={`body-${piece.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={color} stopOpacity=".92" /><stop offset=".5" stopColor={dark} /><stop offset="1" stopColor="#06090f" /></linearGradient>
          <filter id={`glow-${piece.id}`}><feGaussianBlur stdDeviation="2.4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx="50" cy="52" r="42" fill="#070a10" stroke={color} strokeOpacity={selected ? 1 : .55} strokeWidth={selected ? 4 : 2} />
        <g transform={`rotate(${piece.direction * 90} 50 50)`}>
          {piece.type === 'laser' && <>
            <path d="M50 13 L84 74 H16 Z" fill={`url(#body-${piece.id})`} stroke={color} strokeWidth="3" />
            <path d="M50 20 V4" stroke={color} strokeWidth="5" strokeLinecap="round" filter={`url(#glow-${piece.id})`} />
            <ellipse cx="50" cy="51" rx="15" ry="10" fill="#03050a" stroke={color} strokeWidth="2" />
            <circle cx="50" cy="51" r="4.5" fill="#fff" filter={`url(#glow-${piece.id})`} />
          </>}
          {piece.type === 'king' && <>
            <path d="M18 72 L24 31 L40 45 L50 20 L60 45 L76 31 L82 72 Z" fill={`url(#body-${piece.id})`} stroke={color} strokeWidth="3" />
            <path d="M27 62 H73" stroke="#fff" strokeOpacity=".7" strokeWidth="3" />
            <circle cx="50" cy="53" r="7" fill={color} filter={`url(#glow-${piece.id})`} />
          </>}
          {piece.type === 'triangle' && <>
            <path d="M17 78 L83 78 L50 16 Z" fill={`url(#body-${piece.id})`} stroke={color} strokeWidth="3" />
            <path d="M23 72 L67 28" stroke="#e9fdff" strokeWidth="8" strokeLinecap="round" filter={`url(#glow-${piece.id})`} />
            <path d="M25 72 L69 28" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </>}
          {piece.type === 'square' && <>
            <rect x="18" y="18" width="64" height="64" rx="10" fill={`url(#body-${piece.id})`} stroke={color} strokeWidth="3" />
            <path d="M24 20 H76" stroke="#fff" strokeWidth="8" strokeLinecap="round" filter={`url(#glow-${piece.id})`} />
            <path d="M29 48 H71 M29 60 H71" stroke={color} strokeOpacity=".5" strokeWidth="3" />
          </>}
          {piece.type === 'splitter' && <>
            <rect x="16" y="16" width="68" height="68" rx="14" fill={`url(#body-${piece.id})`} stroke={color} strokeWidth="3" />
            <path d="M25 75 L75 25" stroke="#fff" strokeWidth="9" strokeLinecap="round" filter={`url(#glow-${piece.id})`} />
            <path d="M25 75 L75 25" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <path d="M18 50 H82" stroke={color} strokeOpacity=".5" strokeWidth="2" strokeDasharray="5 5" />
          </>}
        </g>
      </svg>
    </span>
  );
}
