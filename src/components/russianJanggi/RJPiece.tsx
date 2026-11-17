import { useId } from 'react';
import type { Side, Size } from '@/lib/russianJanggi';
import { SIDE_COLORS } from './theme';

// Cup shading per side: [edge, body, light].
const SHADES = [
  ['#8a1a12', '#ec3b2c', '#ff9a8a'],
  ['#0d2f78', '#2f6fe8', '#9cc4ff'],
] as const;

/** Cup ratio (width : height) — pieces sit on their rim, so they are drawn bottom-aligned. */
export const CUP_RATIO = 100 / 92;

/**
 * A hollow cup seen from the side, like the pieces on the show's board.
 * Bigger cups go over smaller ones. The side mark grows with the size: red cups carry a "+", blue cups
 * a "○", so the two sides differ in shape as well as colour.
 */
export default function RJPiece({ owner, size, className = '', style, ghost = false }: {
  owner: Side; size: Size; className?: string; style?: React.CSSProperties; ghost?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const [edge, body, light] = SHADES[owner];
  const arm = 7 + size * 2; // plus-mark half length
  return (
    <svg
      viewBox="0 0 100 92" preserveAspectRatio="xMidYMax meet" aria-hidden className={className}
      style={{ filter: ghost ? undefined : `drop-shadow(0 0 10px ${SIDE_COLORS[owner]}40)`, ...style }}
    >
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={edge} />
          <stop offset="0.28" stopColor={light} />
          <stop offset="0.55" stopColor={body} />
          <stop offset="1" stopColor={edge} />
        </linearGradient>
        <linearGradient id={`v${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      {ghost ? (
        <path d="M6 86 C6 52 14 10 50 8 C86 10 94 52 94 86 Z" fill={`${SIDE_COLORS[owner]}26`} stroke="#f2b84b" strokeWidth="3" strokeDasharray="7 5" />
      ) : (
        <>
          <ellipse cx="50" cy="88" rx="47" ry="4" fill="#000" opacity="0.45" />
          <path d="M6 86 C6 52 14 10 50 8 C86 10 94 52 94 86 Z" fill={`url(#b${id})`} />
          <path d="M6 86 C6 52 14 10 50 8 C86 10 94 52 94 86 Z" fill={`url(#v${id})`} />
          <ellipse cx="50" cy="86" rx="44" ry="4.5" fill={edge} />
          <ellipse cx="50" cy="85" rx="42" ry="2.6" fill="#000" opacity="0.35" />
          <ellipse cx="32" cy="34" rx="7" ry="17" fill="#fff" opacity="0.38" transform="rotate(18 32 34)" />
          {owner === 0 ? (
            <g opacity="0.8" fill="#fff">
              <rect x={50 - arm} y={52 - 2.6} width={arm * 2} height="5.2" rx="2.6" />
              <rect x={50 - 2.6} y={52 - arm} width="5.2" height={arm * 2} rx="2.6" />
            </g>
          ) : (
            <circle cx="50" cy="52" r={arm - 1.5} fill="none" stroke="#fff" strokeWidth="5" opacity="0.8" />
          )}
        </>
      )}
    </svg>
  );
}
