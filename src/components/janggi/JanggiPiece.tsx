import { DIRS, HANJA, type PieceType, type Side } from '@/lib/janggi';
import { SIDE_COLORS, hanjaFont } from './theme';

const READING: Record<PieceType, string> = { jang: '장', sang: '상', wang: '왕', ja: '자', hu: '후' };

/**
 * An ivory tile with the hanja and a pip on every side the piece can move toward.
 * `flipped` turns the tile 180° for pieces that face the viewer (the opponent's).
 * Renders as an <svg>; pass x/y/size to nest it inside another SVG.
 */
export default function JanggiPiece({ type, owner, flipped = false, x, y, size, showReading = true, className }: {
  type: PieceType; owner: Side; flipped?: boolean; x?: number; y?: number; size?: number; showReading?: boolean; className?: string;
}) {
  const color = SIDE_COLORS[owner];
  const id = `jp-${type}-${owner}`;
  const promoted = type === 'hu';
  return (
    <svg viewBox="0 0 100 100" x={x} y={y} width={size} height={size} className={className} role="img" aria-label={`${READING[type]} (${HANJA[type]})`}>
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffdf7" /><stop offset="1" stopColor="#efe5cf" /></linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.95" /><stop offset="1" stopColor={color} stopOpacity="0.55" /></linearGradient>
      </defs>
      <g transform={flipped ? 'rotate(180 50 50)' : undefined}>
        <rect x="4" y="6" width="92" height="92" rx="18" fill="#000" opacity="0.28" />
        <rect x="4" y="3" width="92" height="92" rx="18" fill={`url(#${id}-face)`} />
        <rect x="10" y="9" width="80" height="80" rx="13" fill="none" stroke={`url(#${id}-edge)`} strokeWidth={promoted ? 3.2 : 2} />
        {promoted && <rect x="14.5" y="13.5" width="71" height="71" rx="10" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1" />}
        {DIRS[type].map(([dr, dc]) => {
          const cx = 50 + dc * 33, cy = 49 + dr * 33;
          const angle = (Math.atan2(dr, dc) * 180) / Math.PI;
          return <path key={`${dr}${dc}`} d="M -4.6 -4.2 L 4.6 0 L -4.6 4.2 Z" fill={color} transform={`translate(${cx} ${cy}) rotate(${angle})`} />;
        })}
        <text x="50" y={showReading ? 47 : 50} textAnchor="middle" dominantBaseline="central" fontSize={showReading ? 38 : 44} fill={color} style={{ fontFamily: hanjaFont.style.fontFamily, fontWeight: 900 }}>{HANJA[type]}</text>
        {showReading && <text x="50" y="73.5" textAnchor="middle" dominantBaseline="central" fontSize="8.5" fontWeight="800" fill={color} opacity="0.7" letterSpacing="1">{READING[type]}</text>}
      </g>
    </svg>
  );
}
