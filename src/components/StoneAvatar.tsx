"use client";

import { useEffect, useId, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { CrownStone, HellStone, Tile2048, parseIcon } from './ProfileIcons';

/**
 * Ranking profile pictures: our PUZZLTHINK stones (a glossy disc with the two eyes) instead of Google photos or
 * initials, so no one's real name or face shows on a board. Each player gets one colour, picked from their
 * nickname, so it looks random across a list but stays the same for the same person everywhere.
 * 피스 경쟁전 rankers get a special stone: 1–3 are gold / silver / bronze with a crown, 4–10 gold with a sparkle.
 * Earned icons (a finished week's champion stone — 1W platinum, 2W jewels — 블랙피스 weekly top three, 2048,
 * a game's #1; see ProfileIcons) replace the stone wherever it shows.
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

/** A finished week's podium place. */
export type Champion = { week: number; place: 1 | 2 | 3 };
type ChampionLook = Tone & { crown: [string, string, string]; gem: string; halo: string[] };
/**
 * Each week's champions get their own edition, so a stone tells which week it was won in.
 * 1W: platinum gold / silver / bronze. 2W: jewels — diamond (a prism halo) / sapphire / emerald.
 */
export const CHAMPION_LOOKS: Record<number, Record<1 | 2 | 3, ChampionLook>> = {
  1: {
    1: { hi: '#fffdf0', mid: '#f4df92', lo: '#b8903a', rim: '#6f5115', eye: '#3b2604', crown: ['#fffbe0', '#f5cf4a', '#b07d12'], gem: '#c9f6ff', halo: ['#ffe27a'] },
    2: { hi: '#ffffff', mid: '#e9eef6', lo: '#9eabbe', rim: '#55647a', eye: '#1e2430', crown: ['#ffffff', '#dfe6f0', '#8f9cb0'], gem: '#c9f6ff', halo: ['#d9f1ff'] },
    3: { hi: '#fff3ea', mid: '#ebb892', lo: '#a3653b', rim: '#6a3c1c', eye: '#3a1d08', crown: ['#ffeede', '#e79a62', '#9a5426'], gem: '#c9f6ff', halo: ['#ffc79c'] },
  },
  2: {
    1: { hi: '#ffffff', mid: '#e2f3ff', lo: '#93b8de', rim: '#3d5f86', eye: '#13243a', crown: ['#ffffff', '#cdeeff', '#9ab8ff'], gem: '#ffffff', halo: ['#ff9ad5', '#ffe680', '#8ff5d2', '#8ec5ff', '#c9a2ff'] },
    2: { hi: '#d2e2ff', mid: '#3f6fe0', lo: '#142f7a', rim: '#0b1c4c', eye: '#ffffff', crown: ['#eaf1ff', '#7199f6', '#203c96'], gem: '#a9d6ff', halo: ['#7fa6ff'] },
    3: { hi: '#d6ffea', mid: '#2fbf7a', lo: '#0d6b3f', rim: '#08432a', eye: '#ffffff', crown: ['#ecfff4', '#52d996', '#16784a'], gem: '#cffff0', halo: ['#7ff0b6'] },
  },
};
const lookOf = (c: Champion) => (CHAMPION_LOOKS[c.week] ?? CHAMPION_LOOKS[1])[c.place];

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

/** The four colours anyone can pick in 기록실 › 닉네임 (champion stones are picked as 'w{week}-{place}'). */
export const STONE_COLORS = ['black', 'white', 'red', 'blue'] as const;
export type StoneColor = typeof STONE_COLORS[number];
const COLOR_TONE: Record<StoneColor, Tone> = { black: TONES[0], white: TONES[1], red: TONES[2], blue: TONES[7] };
/** A champion stone choice ('w1-1') as a week and place, or null for anything else. */
export const championOf = (stone: string | null | undefined): Champion | null => {
  const ref = parseIcon(stone);
  return ref?.kind === 'piece' ? { week: ref.week, place: ref.place } : null;
};

// Every player's stone by nickname: their pick, or the icon they earned (the server decides, stone_choices_public). Refetched (and every avatar redrawn) after a player changes theirs.
let choicesPromise: Promise<Map<string, string>> | null = null;
const choiceListeners = new Set<() => void>();
function loadChoices() {
  choicesPromise ??= (async () => {
    const supabase = getSupabase();
    const map = new Map<string, string>();
    if (!supabase) return map;
    const { data } = await supabase.rpc('stone_choices_public');
    if (Array.isArray(data)) for (const r of data as { nickname: string; stone: string }[]) map.set(r.nickname, r.stone);
    return map;
  })();
  return choicesPromise;
}
/** Call after saving a stone: every avatar on the page picks up the new choice. */
export function refreshStoneChoices() {
  choicesPromise = null;
  choiceListeners.forEach((fn) => fn());
}

/** The stone this nickname picked ('red', 'w1-1', …), or null. Pass `known` to skip the lookup. */
export function useStoneChoice(name: string, known?: string | null) {
  const [choice, setChoice] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    choiceListeners.add(bump);
    return () => { choiceListeners.delete(bump); };
  }, []);
  useEffect(() => {
    if (known !== undefined || !name) return;
    let alive = true;
    loadChoices().then((m) => { if (alive) setChoice(m.get(name) ?? null); });
    return () => { alive = false; };
  }, [name, known, version]);
  return known !== undefined ? known : choice;
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
 * The stone itself. What it looks like, first match wins:
 * - `icon` (or `champion`) given — a preview: that icon.
 * - the player's stone (looked up by nickname unless `stone` is given): an earned icon (champion, 블랙피스, 2048,
 *   a game's #1), or a picked colour (a current 피스 경쟁전 top-10 rank still shows its metal look over a colour);
 * - nothing: the rank look or the nickname's colour.
 */
export function Stone({ name, size, pieceRank = null, champion, stone, icon }: { name: string; size: number; pieceRank?: number | null; champion?: Champion | null; stone?: string | null; icon?: string }) {
  const id = useId().replace(/:/g, '');
  const preview = icon ?? (champion ? `w${champion.week}-${champion.place}` : undefined);
  const choice = useStoneChoice(name, preview ?? stone);
  const ref = parseIcon(choice);
  if (ref?.kind === 'piece') return <ChampionStone id={id} name={name} size={size} champion={ref} />;
  if (ref?.kind === 'hell') return <HellStone id={id} name={name} size={size} place={ref.place} />;
  if (ref?.kind === 'm2048') return <Tile2048 id={id} name={name} size={size} />;
  if (ref?.kind === 'crown') return <CrownStone id={id} name={name} size={size} game={ref.game} />;
  const ranker = pieceRank != null && pieceRank <= 10;
  const crown = ranker && pieceRank <= 3;
  const picked = choice && choice in COLOR_TONE ? COLOR_TONE[choice as StoneColor] : null;
  const tone = crown ? METAL[pieceRank as 1 | 2 | 3] : ranker ? METAL.gold : picked ?? toneFor(name || '?');
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

/** A finished week's top three: the week's edition of stone, a gem-set crown, a halo and two sparkles. */
function ChampionStone({ id, name, size, champion }: { id: string; name: string; size: number; champion: Champion }) {
  const tone = lookOf(champion);
  const cy = 58, r = 40;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <radialGradient id={`ps-${id}`} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="50%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.lo} />
        </radialGradient>
        <linearGradient id={`ph-${id}`} x1="0" y1="0" x2="1" y2="1">
          {tone.halo.map((c, i) => <stop key={i} offset={`${tone.halo.length > 1 ? (i / (tone.halo.length - 1)) * 100 : 0}%`} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`pc-${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={tone.crown[0]} />
          <stop offset="45%" stopColor={tone.crown[1]} />
          <stop offset="100%" stopColor={tone.crown[2]} />
        </linearGradient>
      </defs>
      <circle cx="50" cy={cy} r={r + 7} fill="none" stroke={`url(#ph-${id})`} strokeOpacity={tone.halo.length > 1 ? 0.7 : 0.35} strokeWidth="6" />
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
        <path d="M50 7 L55 13 L50 19 L45 13 Z" fill={tone.gem} stroke="#ffffff" strokeWidth="1.4" />
        <circle cx="35" cy="27.5" r="2" fill={tone.gem} stroke="#ffffff" strokeWidth=".8" />
        <circle cx="65" cy="27.5" r="2" fill={tone.gem} stroke="#ffffff" strokeWidth=".8" />
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
