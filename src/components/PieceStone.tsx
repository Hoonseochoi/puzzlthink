"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { Stone, useStoneChoice, useStoneChoiceMap } from './StoneAvatar';
import { parseIcon, type IconRef } from './ProfileIcons';
import { useSupporter } from './SupporterCover';

/**
 * 내 바둑알 on the board: a game's pieces drawn as their player's own profile stone (the colour or earned icon
 * picked in 기록실), for players who have one. Everyone else — the AI, guests, players who never picked — keeps
 * the game's own piece.
 *
 * A game says who sits where with <PieceOwners.Provider value={[nickname per seat]}> (or <MyPieces seat={n}> for
 * a game against the AI) and draws each piece with <PieceStone seat colors>{the game's own piece}</PieceStone>.
 * The stone is the piece: drawn at the piece's own size, with no ring (a supporter's piece wears a thin rainbow
 * rim instead of the full cover). Sides must still
 * read apart, so a stone is recoloured (never reshaped) when it would be mistaken for another side's:
 * - two players with the same stone: the later seat's is recoloured;
 * - a plain colour close to the colour of a side that plays the game's own pieces (my black stone against the
 *   AI's black): mine is drawn in my side's colour instead.
 */
export const PieceOwners = createContext<readonly (string | null | undefined)[]>([]);

/** A game in this browser against the AI: the signed-in player's stone on `seat`, nothing on the others. */
export function MyPieces({ seat = 0, children }: { seat?: number; children: ReactNode }) {
  const { nickname } = useAuth();
  const owners: (string | null)[] = [];
  owners[seat] = nickname || null;
  return <PieceOwners.Provider value={owners}>{children}</PieceOwners.Provider>;
}

/**
 * A friend or open room: every seat's player by the name they sit under; my own seat by my nickname (a room name
 * can be typed freely, the stone belongs to the account).
 */
export function RoomPieces({ seats, me = null, ai, children }: { seats: readonly ({ name: string } | null | undefined)[] | null | undefined; me?: number | null; ai?: readonly unknown[]; children: ReactNode }) {
  const { nickname } = useAuth();
  const owners = (seats ?? []).map((s, i) => (ai?.[i] ? null : (i === me && nickname) || s?.name || null));
  return <PieceOwners.Provider value={owners}>{children}</PieceOwners.Provider>;
}

/** The signed-in player's nickname, for a game that maps seats to pieces itself (pieces keyed by colour). */
export function useMyNickname() {
  return useAuth().nickname || null;
}

/**
 * Where each icon's round body sits in its 100×100 drawing (centre height, radius). Icons leave room for hats,
 * horns and badges, so their body is only about two thirds of the box; on a board the body is scaled to the
 * size of a plain stone (radius BODY_R) and centred on the point. The hat may reach past the piece.
 */
const ICON_BODY: Record<IconRef['kind'], [number, number] | null> = {
  piece: [58, 40], hell: [58, 39], open: [54, 34], m2048: null, crown: [56, 38], hard: [61, 33], friendWin: [60, 32],
  openWin: [54, 34], hellClear: [58, 34], play: [58, 33], mission: [56, 36], tester: [56, 36], dev: [56, 34],
};
const BODY_R = 48;
function bodyFit(choice: string | null | undefined) {
  const ref = parseIcon(choice);
  const body = ref ? ICON_BODY[ref.kind] : null;
  if (!body) return undefined;
  const [cy, r] = body, k = BODY_R / r;
  return `translateY(${(-(cy - 50) * k).toFixed(1)}%) scale(${k.toFixed(3)})`;
}

const PLAIN: Record<string, string> = { black: '#1d1f25', white: '#eceae4', red: '#ff5b45', blue: '#3f8cff' };
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const near = (a: string, b: string) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 110; };
/**
 * A CSS filter that recolours an icon towards `color` (the side's own colour) and keeps its drawing: a hue for a
 * coloured side, darker or lighter grey for a black or white side. Sepia sits near 38° of hue, so the turn is
 * counted from there.
 */
function recolour(color: string) {
  const [r, g, b] = rgb(color).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 0.12) return (max + min) / 2 < 0.5 ? 'grayscale(1) brightness(.5) contrast(1.25)' : 'grayscale(1) brightness(1.5)';
  const hue = 60 * (max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4);
  return `sepia(.9) saturate(2.6) hue-rotate(${Math.round(hue - 38)}deg)`;
}

/**
 * What `seat` plays with: null for the game's own piece, else the owner's nickname and how to recolour the stone
 * (`tint`: draw a plain stone in this colour; `filter`: a CSS filter that moves the icon to the side's colour).
 * `colors` are the game's own colours for every seat (holes allowed), so a clash with them can be seen.
 */
export function usePiece(seat: number | null | undefined, colors: readonly (string | undefined)[]) {
  const owners = useContext(PieceOwners);
  const choices = useStoneChoiceMap();
  const pick = (i: number) => { const n = owners[i]; return (n && choices.get(n)) || null; };
  const name = (seat != null && owners[seat]) || null;
  const mine = seat != null ? pick(seat) : null;
  if (seat == null || !name || !mine) return null;
  const plain = PLAIN[mine];
  let same = 0, clash = false;
  colors.forEach((color, i) => {
    if (i === seat || !color) return;
    const theirs = pick(i);
    if (theirs === mine) { if (i < seat) same += 1; }
    else if (plain && (theirs ? !!PLAIN[theirs] && near(plain, PLAIN[theirs]) && i < seat : near(plain, color))) clash = true;
  });
  const own = colors[seat];
  if (plain) return { name, tint: (same || clash) && own ? own : null, filter: null };
  return { name, tint: null, filter: same && own ? recolour(own) : null };
}

/** The nickname whose stone is drawn for `seat`, or null when that seat keeps the game's own piece. */
export function usePieceOwner(seat: number | null | undefined) {
  const owners = useContext(PieceOwners);
  const name = (seat != null && owners[seat]) || '';
  const choice = useStoneChoice(name);
  return name && choice ? name : null;
}

/** A plain stone (the glossy disc with the two eyes) in any colour: a picked colour moved to the side's own. */
function TintStone({ color }: { color: string }) {
  const [r, g, b] = rgb(color);
  const dark = r * 0.299 + g * 0.587 + b * 0.114 < 150;
  return (
    <span className="relative block h-full w-full rounded-full"
      style={{ background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 55%, white) 0%, ${color} 55%, color-mix(in srgb, ${color} 58%, black) 100%)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 55%, black)` }}>
      <i className="absolute left-[30%] top-[30%] h-[19%] w-[10%] rounded-full" style={{ background: dark ? '#ffffff' : '#17201e' }} />
      <i className="absolute right-[30%] top-[30%] h-[19%] w-[10%] rounded-full" style={{ background: dark ? '#ffffff' : '#17201e' }} />
    </span>
  );
}

// 벽바둑 II square pieces: everyone's highest 2048 block character by nickname, fetched once per page load.
let tilesPromise: Promise<Map<string, number>> | null = null;
function loadTiles() {
  tilesPromise ??= (async () => {
    const map = new Map<string, number>();
    const { data } = (await getSupabase()?.rpc('best_2048_public')) ?? { data: null };
    if (Array.isArray(data)) for (const r of data as { nickname: string; tier: number }[]) map.set(r.nickname, r.tier);
    return map;
  })();
  return tilesPromise;
}
function useBestTiles(enabled: boolean) {
  const [map, setMap] = useState<Map<string, number>>(() => new Map());
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadTiles().then((m) => { if (alive) setMap(m); });
    return () => { alive = false; };
  }, [enabled]);
  return map;
}

const RAINBOW = 'conic-gradient(from 210deg, #ff5f6d, #ffb347, #f9f871, #5ee7a5, #56ccf2, #b28dff, #ff5f6d)';
/** How far a supporter's piece sits inside its rainbow rim, in percent of the piece. */
const RIM = 8;
/** The supporter cover on the board: only a thin rainbow rim round the piece (no wings, star or ribbon). */
function Rainbow({ square }: { square: boolean }) {
  const mask = square ? 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)' : `radial-gradient(closest-side, transparent ${100 - RIM * 2 - 1}%, #000 ${100 - RIM * 2 + 1}%)`;
  return <span aria-hidden className={`pointer-events-none absolute inset-0 ${square ? 'rounded-[18%]' : 'rounded-full'}`}
    style={{ background: RAINBOW, padding: square ? `${RIM}%` : undefined, WebkitMask: mask, mask, WebkitMaskComposite: square ? 'xor' : undefined, maskComposite: square ? 'exclude' : undefined, boxShadow: '0 0 6px rgba(255,255,255,.35)' }} />;
}

/**
 * One piece. `colors` are the game's own colours per seat (see usePiece).
 * - Round pieces: the player's own stone alone, at the piece's size.
 * - `square` pieces (벽바둑 II, where the shape is the kind of piece): the highest 2048 block character the player
 *   has earned (recoloured for a later seat with the same block), or the game's own square without one.
 * - A supporter's piece — their stone, block or the game's own piece — wears a thin rainbow rim.
 * `overlay` is drawn over it (a selection ring, a cross). Fills its parent.
 */
export default function PieceStone({ seat, colors, square = false, className = '', overlay, children }: {
  seat: number | null | undefined; colors: readonly (string | undefined)[]; square?: boolean; className?: string; overlay?: ReactNode; children: ReactNode;
}) {
  const owners = useContext(PieceOwners);
  const name = (seat != null && owners[seat]) || '';
  const supporter = useSupporter(name);
  const tiles = useBestTiles(square);
  const piece = usePiece(seat, colors);
  const own = seat != null ? colors[seat] : undefined;
  const fit = bodyFit(useStoneChoice(piece?.name ?? ''));

  let body: ReactNode = null;
  if (square) {
    const tier = name ? tiles.get(name) : undefined;
    if (tier && seat != null) {
      const same = colors.some((c, i) => !!c && i < seat && !!owners[i] && tiles.get(owners[i]!) === tier);
      body = <span className="pointer-events-none absolute inset-0 [&>svg]:h-full [&>svg]:w-full" style={{ filter: same && own ? recolour(own) : undefined }}><Stone name={name} size={64} icon={`m${tier}`} cover={false} /></span>;
    }
  } else if (piece) {
    body = <span className="pointer-events-none absolute inset-0 [&>svg]:h-full [&>svg]:w-full" style={{ filter: piece.filter ?? undefined, transform: piece.tint ? undefined : fit }}>{piece.tint ? <TintStone color={piece.tint} /> : <Stone name={piece.name} size={64} cover={false} />}</span>;
  }
  if (!body && !supporter) return <>{children}</>;
  return (
    <span className={`relative block h-full w-full ${body ? className : ''}`} style={body ? { filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' } : undefined}>
      <span className="absolute" style={{ inset: supporter ? `${RIM}%` : 0 }}>{body ?? children}</span>
      {supporter && <Rainbow square={square} />}
      {body ? overlay : null}
    </span>
  );
}
