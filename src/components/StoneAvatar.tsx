"use client";

import { useEffect, useId, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

/**
 * Ranking profile pictures: our PUZZLTHINK stones (a glossy disc with the two eyes) instead of Google photos or
 * initials, so no one's real name or face shows on a board. Each player gets one colour, picked from their
 * nickname, so it looks random across a list but stays the same for the same person everywhere.
 * 피스 경쟁전 rankers get a special stone: 1–3 are gold / silver / bronze with a crown, 4–10 gold with a sparkle.
 */

type Tone = { hi: string; mid: string; lo: string; rim: string; eye: string };
const TONES: Tone[] = [
  { hi: '#5a5d66', mid: '#1d1f25', lo: '#050507', rim: '#000000', eye: '#ffffff' }, // black
  { hi: '#ffffff', mid: '#eceae4', lo: '#b9b5aa', rim: '#9b978c', eye: '#17201e' }, // white
  { hi: '#ff9a8a', mid: '#ff5b45', lo: '#b8291a', rim: '#8f1f12', eye: '#ffffff' }, // red
  { hi: '#ffc58a', mid: '#ff8a2b', lo: '#b9560c', rim: '#8e4208', eye: '#ffffff' }, // orange
  { hi: '#fff0a0', mid: '#ffd23f', lo: '#c99a08', rim: '#9c7705', eye: '#17201e' }, // yellow
  { hi: '#a8f0b4', mid: '#3fcf6a', lo: '#1c8a3d', rim: '#156a2e', eye: '#ffffff' }, // green
  { hi: '#9cf2ea', mid: '#21c2b5', lo: '#0d7d74', rim: '#0a5f58', eye: '#ffffff' }, // teal
  { hi: '#9cc7ff', mid: '#3f8cff', lo: '#1b54b8', rim: '#143f8c', eye: '#ffffff' }, // blue
  { hi: '#c9b0ff', mid: '#8b5cf6', lo: '#5326b8', rim: '#3f1c8c', eye: '#ffffff' }, // purple
  { hi: '#ffb3dc', mid: '#f05aa8', lo: '#b0216b', rim: '#861851', eye: '#ffffff' }, // pink
  { hi: '#d7c2a4', mid: '#a47b4f', lo: '#64431f', rim: '#4b3116', eye: '#ffffff' }, // brown
  { hi: '#cfd8e3', mid: '#7f8ea3', lo: '#4a5668', rim: '#36404f', eye: '#ffffff' }, // slate
];
const METAL: Record<1 | 2 | 3 | 'gold', Tone> = {
  1: { hi: '#fff6c4', mid: '#f2c53d', lo: '#a8740c', rim: '#7d5306', eye: '#3b2604' },
  2: { hi: '#ffffff', mid: '#c9ced8', lo: '#7d8594', rim: '#5d6573', eye: '#1e2430' },
  3: { hi: '#ffd9b8', mid: '#d38a4c', lo: '#8a4f1f', rim: '#683a15', eye: '#ffffff' },
  gold: { hi: '#fff3b8', mid: '#e8b730', lo: '#9c6c0a', rim: '#7d5306', eye: '#3b2604' },
};

/** Same nickname → same colour. */
function toneFor(seed: string): Tone {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return TONES[(h >>> 0) % TONES.length];
}

// 피스 경쟁전 top 10 by nickname, fetched once per page load and shared by every avatar.
let rankersPromise: Promise<Map<string, number>> | null = null;
function loadRankers() {
  rankersPromise ??= (async () => {
    const supabase = getSupabase();
    if (!supabase) return new Map<string, number>();
    const { data } = await supabase.rpc('competition_ranking', { p_limit: 10 });
    const map = new Map<string, number>();
    if (Array.isArray(data)) for (const r of data as { rank: number; nickname: string }[]) if (r.rank <= 10 && !map.has(r.nickname)) map.set(r.nickname, r.rank);
    return map;
  })();
  return rankersPromise;
}

/** The player's 피스 경쟁전 rank (1–10), or null. Pass `known` when the caller already has it. */
export function usePieceRank(name: string, known?: number | null) {
  const [rank, setRank] = useState<number | null>(known ?? null);
  useEffect(() => {
    if (known !== undefined) return;
    let alive = true;
    loadRankers().then((m) => { if (alive) setRank(m.get(name) ?? null); });
    return () => { alive = false; };
  }, [name, known]);
  return known !== undefined ? (known && known <= 10 ? known : null) : rank;
}

/** The stone itself; `pieceRank` 1–10 makes it a ranker's stone. */
export function Stone({ name, size, pieceRank = null }: { name: string; size: number; pieceRank?: number | null }) {
  const id = useId().replace(/:/g, '');
  const ranker = pieceRank != null && pieceRank <= 10;
  const crown = ranker && pieceRank <= 3;
  const tone = crown ? METAL[pieceRank as 1 | 2 | 3] : ranker ? METAL.gold : toneFor(name || '?');
  // A crowned stone sits a little lower so the crown fits inside the same box.
  const cy = crown ? 58 : 50, r = crown ? 40 : 46;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <radialGradient id={`sa-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="55%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.lo} />
        </radialGradient>
      </defs>
      {ranker && <circle cx="50" cy={cy} r={r + 5} fill="none" stroke={crown ? tone.mid : '#f2c53d'} strokeOpacity=".45" strokeWidth="4" />}
      <circle cx="50" cy={cy + 3} r={r} fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#sa-${id})`} stroke={tone.rim} strokeWidth="2" />
      <rect x={50 - r * 0.33} y={cy - r * 0.35} width={r * 0.2} height={r * 0.37} rx={r * 0.1} fill={tone.eye} />
      <rect x={50 + r * 0.13} y={cy - r * 0.35} width={r * 0.2} height={r * 0.37} rx={r * 0.1} fill={tone.eye} />
      {ranker && !crown && <path d="M79 14 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#fff3b8" stroke="#c99a08" strokeWidth="1.2" />}
      {crown && (
        <g>
          <path d="M28 26 L33 6 L42 17 L50 2 L58 17 L67 6 L72 26 Z" fill={pieceRank === 1 ? '#ffd23f' : pieceRank === 2 ? '#dfe3ea' : '#e09a5c'} stroke={tone.rim} strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="28" y="23" width="44" height="6" rx="2" fill={pieceRank === 1 ? '#f2b51d' : pieceRank === 2 ? '#b9bfca' : '#c27a3c'} stroke={tone.rim} strokeWidth="2" />
          <circle cx="50" cy="15" r="3.2" fill="#ff5b6e" />
        </g>
      )}
    </svg>
  );
}

/** A ranking avatar: looks up the 피스 경쟁전 rank by nickname unless `pieceRank` is given. */
export default function StoneAvatar({ name, size, pieceRank }: { name: string; size: number; pieceRank?: number | null }) {
  const rank = usePieceRank(name, pieceRank);
  return <Stone name={name} size={size} pieceRank={rank} />;
}
