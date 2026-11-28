/**
 * 히든 워드: 라이어 drawings, in the same 100×100 box as every stone:
 * - LiarStone ('lw', won once as the liar): a chubby lavender stone in a little black bandit mask, big sparkly eyes,
 *   a cheeky tongue out (메롱) and a "?" speech bubble.
 * - LiarMask: the bandit mask alone, put over the eyes of the #1 crown stone (CrownIcons) and the game emblem.
 * Gradient ids are suffixed with the instance `id`, like the other icons.
 */

export function LiarStone({ id, name, size }: { id: string; name: string; size: number }) {
  const cy = 56, r = 35;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <radialGradient id={`lb-${id}`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#f3ecff" /><stop offset="55%" stopColor="#b89cff" /><stop offset="100%" stopColor="#5b3fc4" />
        </radialGradient>
        <radialGradient id={`lg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d6c4ff" stopOpacity=".75" /><stop offset="100%" stopColor="#d6c4ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy={cy} r="49" fill={`url(#lg-${id})`} />
      <ellipse cx="50" cy={cy + r - 1} rx={r * 0.78} ry="4" fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#lb-${id})`} stroke="#3d2690" strokeWidth="2" />
      <ellipse cx="37" cy={cy - 20} rx="9" ry="4" fill="#ffffff" opacity=".6" transform={`rotate(-30 37 ${cy - 20})`} />
      {/* big sparkly eyes */}
      <g>
        <ellipse cx="38.5" cy={cy - 3} rx="7.4" ry="8.6" fill="#ffffff" />
        <ellipse cx="61.5" cy={cy - 3} rx="7.4" ry="8.6" fill="#ffffff" />
        <ellipse cx="39.6" cy={cy - 1.6} rx="4.6" ry="5.6" fill="#241457" />
        <ellipse cx="60.4" cy={cy - 1.6} rx="4.6" ry="5.6" fill="#241457" />
        <circle cx="41.4" cy={cy - 4.2} r="1.9" fill="#ffffff" /><circle cx="62.2" cy={cy - 4.2} r="1.9" fill="#ffffff" />
        <circle cx="38" cy={cy + 0.6} r=".9" fill="#ffffff" /><circle cx="58.8" cy={cy + 0.6} r=".9" fill="#ffffff" />
      </g>
      {LiarMask({ cy: cy - 3 })}
      {/* blush */}
      <ellipse cx="25.5" cy={cy + 10} rx="5.4" ry="3" fill="#ff8fb0" opacity=".7" />
      <ellipse cx="74.5" cy={cy + 10} rx="5.4" ry="3" fill="#ff8fb0" opacity=".7" />
      {/* cheeky smile with the tongue out */}
      <path d={`M42 ${cy + 13} Q50 ${cy + 19} 58 ${cy + 13}`} fill="none" stroke="#241457" strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M51 ${cy + 15.6} q0.6 6.4 4.6 6 q3.6 -0.6 2.2 -7.4`} fill="#ff6b8a" stroke="#241457" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`M55 ${cy + 16.6} v3`} stroke="#d94a6c" strokeWidth="1" strokeLinecap="round" />
      {/* speech bubble */}
      <g>
        <rect x="68" y="4" width="26" height="19" rx="9.5" fill="#ffffff" stroke="#3d2690" strokeWidth="1.8" />
        <path d="M74 21.5 L70.5 29 L80 22" fill="#ffffff" stroke="#3d2690" strokeWidth="1.8" strokeLinejoin="round" />
        <rect x="73" y="19" width="8" height="3" fill="#ffffff" />
        <path d="M77.6 10.6 q0 -3.4 3.6 -3.4 q3.8 0 3.8 3.1 q0 2.1 -2.4 3.1 q-1.4 .6 -1.4 2.2" fill="none" stroke="#7b55f0" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="81.2" cy="19.2" r="1.5" fill="#7b55f0" />
      </g>
      {/* sparkles */}
      <path d="M12 26 l1.6 3.8 3.8 1.6 -3.8 1.6 -1.6 3.8 -1.6 -3.8 -3.8 -1.6 3.8 -1.6z" fill="#ffd66b" />
      <path d="M90 64 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2z" fill="#ffffff" />
    </svg>
  );
}

/** The bandit mask, centred on the eyes at height `cy` (eyes at x 38.5 / 61.5 in the 100 box). */
export function LiarMask({ cy, eyeGap = 23, holeRx = 6.6, holeRy = 7.4 }: { cy: number; eyeGap?: number; holeRx?: number; holeRy?: number }) {
  const l = 50 - eyeGap / 2, rr = 50 + eyeGap / 2;
  const band = `M17 ${cy - 4} Q22 ${cy - 13} 33 ${cy - 11} Q50 ${cy - 7} 67 ${cy - 11} Q78 ${cy - 13} 83 ${cy - 4} Q85 ${cy + 7} 74 ${cy + 9} Q60 ${cy + 11} 50 ${cy + 5} Q40 ${cy + 11} 26 ${cy + 9} Q15 ${cy + 7} 17 ${cy - 4} Z`;
  const holes = `M${l - holeRx} ${cy} a${holeRx} ${holeRy} 0 1 0 ${holeRx * 2} 0 a${holeRx} ${holeRy} 0 1 0 -${holeRx * 2} 0 Z M${rr - holeRx} ${cy} a${holeRx} ${holeRy} 0 1 0 ${holeRx * 2} 0 a${holeRx} ${holeRy} 0 1 0 -${holeRx * 2} 0 Z`;
  return (
    <g>
      <path d={`${band} ${holes}`} fillRule="evenodd" fill="#1d1630" stroke="#0d0a16" strokeWidth="1.2" strokeLinejoin="round" />
      <path d={`M20 ${cy - 4} Q24 ${cy - 10} 32 ${cy - 9}`} fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.4" strokeLinecap="round" />
      {/* the knot's two little tails */}
      <path d={`M83 ${cy - 3} q6 -3 9 -8 M83.6 ${cy + 1} q6 1 9.4 5`} fill="none" stroke="#14101f" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

/** 24×24 emblem (game lists, records): a little masked face with a "?" bubble. `c` is the game colour. */
export function liarEmblem(c: string) {
  return (
    <>
      <circle cx="11" cy="14" r="8.6" fill={c} stroke="#17201e" strokeWidth=".9" />
      <path d="M3.4 12.6 Q11 9.4 18.6 12.6 Q19 16.6 15 16.4 Q12.6 16.2 11 14.6 Q9.4 16.2 7 16.4 Q3 16.6 3.4 12.6Z" fill="#17201e" />
      <circle cx="7.4" cy="13.4" r="1.5" fill="#ffffff" /><circle cx="14.6" cy="13.4" r="1.5" fill="#ffffff" />
      <path d="M9.4 18.6 q1.6 1.2 3.2 0" fill="none" stroke="#17201e" strokeWidth=".9" strokeLinecap="round" />
      <path d="M11.6 19.2 q.3 2.2 1.8 1.9 q1.1 -.4 .5 -2.4" fill="#ff6b8a" stroke="#17201e" strokeWidth=".6" />
      <rect x="15" y="1.4" width="8.4" height="6.6" rx="3.3" fill="#ffffff" stroke="#17201e" strokeWidth=".8" />
      <text x="19.2" y="6.9" textAnchor="middle" fontSize="5.6" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#7b55f0">?</text>
    </>
  );
}
