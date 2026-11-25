"use client";

import { useEffect, useId, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

/**
 * Ranking profile pictures: our PUZZLTHINK stones (a glossy disc with the two eyes) instead of Google photos or
 * initials, so no one's real name or face shows on a board. Each player gets one colour, picked from their
 * nickname, so it looks random across a list but stays the same for the same person everywhere.
 * 피스 경쟁전 rankers get a special stone: 1–3 are gold / silver / bronze with a crown, 4–10 gold with a sparkle.
 * A finished week's top three (1W: 오현민 · 식느 · Xogh) keep a platinum gold / silver / bronze stone and crown for good,
 * whatever their current rank.
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

/** Champions of a finished 피스 경쟁전 week: platinum gold, platinum silver, platinum bronze. */
const PLATINUM: Record<1 | 2 | 3, Tone & { crown: [string, string, string]; glow: string }> = {
  1: { hi: '#fffdf0', mid: '#f4df92', lo: '#b8903a', rim: '#6f5115', eye: '#3b2604', crown: ['#fffbe0', '#f5cf4a', '#b07d12'], glow: '#ffe27a' },
  2: { hi: '#ffffff', mid: '#e9eef6', lo: '#9eabbe', rim: '#55647a', eye: '#1e2430', crown: ['#ffffff', '#dfe6f0', '#8f9cb0'], glow: '#d9f1ff' },
  3: { hi: '#fff3ea', mid: '#ebb892', lo: '#a3653b', rim: '#6a3c1c', eye: '#3a1d08', crown: ['#ffeede', '#e79a62', '#9a5426'], glow: '#ffc79c' },
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

// Past weeks' top three by nickname (their best finish), fetched once per page load.
let championsPromise: Promise<Map<string, 1 | 2 | 3>> | null = null;
function loadChampions() {
  championsPromise ??= (async () => {
    const supabase = getSupabase();
    const map = new Map<string, 1 | 2 | 3>();
    if (!supabase) return map;
    const { data } = await supabase.rpc('piece_champions');
    if (Array.isArray(data)) for (const r of data as { rank: number; nickname: string }[]) {
      const best = map.get(r.nickname);
      if (r.rank >= 1 && r.rank <= 3 && (!best || r.rank < best)) map.set(r.nickname, r.rank as 1 | 2 | 3);
    }
    return map;
  })();
  return championsPromise;
}

/** A past week's podium place (1–3) for this nickname, or null. Pass `known` to skip the lookup. */
export function useChampion(name: string, known?: 1 | 2 | 3 | null) {
  const [place, setPlace] = useState<1 | 2 | 3 | null>(null);
  useEffect(() => {
    if (known !== undefined || !name) return;
    let alive = true;
    loadChampions().then((m) => { if (alive) setPlace(m.get(name) ?? null); });
    return () => { alive = false; };
  }, [name, known]);
  return known !== undefined ? known : place;
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

/**
 * The stone itself; `pieceRank` 1–10 makes it a ranker's stone. A past week's champion (looked up by nickname
 * unless `champion` is given) always wears the platinum crown, which outranks the current-week look.
 */
export function Stone({ name, size, pieceRank = null, champion }: { name: string; size: number; pieceRank?: number | null; champion?: 1 | 2 | 3 | null }) {
  const id = useId().replace(/:/g, '');
  const champ = useChampion(name, champion);
  if (champ) return <ChampionStone id={id} name={name} size={size} place={champ} />;
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

/** A finished week's top three: platinum stone, a gem-set platinum crown, a halo and two sparkles. */
function ChampionStone({ id, name, size, place }: { id: string; name: string; size: number; place: 1 | 2 | 3 }) {
  const tone = PLATINUM[place];
  const cy = 58, r = 40;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <radialGradient id={`ps-${id}`} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="50%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.lo} />
        </radialGradient>
        <linearGradient id={`pc-${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={tone.crown[0]} />
          <stop offset="45%" stopColor={tone.crown[1]} />
          <stop offset="100%" stopColor={tone.crown[2]} />
        </linearGradient>
      </defs>
      <circle cx="50" cy={cy} r={r + 7} fill="none" stroke={tone.glow} strokeOpacity=".35" strokeWidth="6" />
      <circle cx="50" cy={cy} r={r + 4} fill="none" stroke={tone.rim} strokeOpacity=".55" strokeWidth="1.2" />
      <circle cx="50" cy={cy + 3} r={r} fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#ps-${id})`} stroke={tone.rim} strokeWidth="2" />
      <ellipse cx="38" cy={cy - 20} rx="11" ry="5" fill="#ffffff" opacity=".55" transform={`rotate(-28 38 ${cy - 20})`} />
      <rect x={50 - r * 0.33} y={cy - r * 0.35} width={r * 0.2} height={r * 0.37} rx={r * 0.1} fill={tone.eye} />
      <rect x={50 + r * 0.13} y={cy - r * 0.35} width={r * 0.2} height={r * 0.37} rx={r * 0.1} fill={tone.eye} />
      <g>
        <path d="M24 27 L29 3 L40 16 L50 -3 L60 16 L71 3 L76 27 Z" fill={`url(#pc-${id})`} stroke={tone.rim} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M27 24 L31 7 L40 18" fill="none" stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="24" y="24" width="52" height="7" rx="2.5" fill={`url(#pc-${id})`} stroke={tone.rim} strokeWidth="2" />
        <path d="M50 7 L55 13 L50 19 L45 13 Z" fill="#c9f6ff" stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="35" cy="27.5" r="2" fill="#c9f6ff" stroke="#ffffff" strokeWidth=".8" />
        <circle cx="65" cy="27.5" r="2" fill="#c9f6ff" stroke="#ffffff" strokeWidth=".8" />
      </g>
      <path d="M86 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#ffffff" opacity=".9" />
      <path d="M13 44 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#ffffff" opacity=".8" />
    </svg>
  );
}

/** A ranking avatar: looks up the 피스 경쟁전 rank by nickname unless `pieceRank` is given. */
export default function StoneAvatar({ name, size, pieceRank }: { name: string; size: number; pieceRank?: number | null }) {
  const rank = usePieceRank(name, pieceRank);
  return <Stone name={name} size={size} pieceRank={rank} />;
}
