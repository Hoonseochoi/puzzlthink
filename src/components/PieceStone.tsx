"use client";

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { Stone, useStoneChoice, useStoneChoiceMap } from './StoneAvatar';

/**
 * 내 바둑알 on the board: a game's pieces drawn as their player's own profile stone (the colour or earned icon
 * picked in 기록실), for players who have one. Everyone else — the AI, guests, players who never picked — keeps
 * the game's own piece.
 *
 * A game says who sits where with <PieceOwners.Provider value={[nickname per seat]}> (or <MyPieces seat={n}> for
 * a game against the AI) and draws each piece with <PieceStone seat colors>{the game's own piece}</PieceStone>.
 * The stone is the piece: drawn at the piece's own size, with no ring and no supporter cover. Sides must still
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

/**
 * One piece. `colors` are the game's own colours per seat (see usePiece). A `square` piece (벽바둑 II, where the
 * shape is the kind of piece) keeps a rounded-square plate in the side's colour under the stone; every other
 * piece is the stone alone. `overlay` is drawn over it (a selection ring, a cross). Fills its parent.
 */
export default function PieceStone({ seat, colors, square = false, className = '', overlay, children }: {
  seat: number | null | undefined; colors: readonly (string | undefined)[]; square?: boolean; className?: string; overlay?: ReactNode; children: ReactNode;
}) {
  const piece = usePiece(seat, colors);
  if (!piece) return <>{children}</>;
  const own = (seat != null && colors[seat]) || '#888888';
  return (
    <span className={`relative block h-full w-full ${square ? 'rounded-[18%]' : 'rounded-full'} ${className}`}
      style={square ? { background: `linear-gradient(145deg, color-mix(in srgb, ${own} 70%, white), ${own} 55%, color-mix(in srgb, ${own} 65%, black))`, boxShadow: '0 3px 8px rgba(0,0,0,.5)' } : { filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' }}>
      <span className="pointer-events-none absolute [&>svg]:h-full [&>svg]:w-full" style={{ inset: square ? '10%' : 0, filter: piece.filter ?? undefined }}>
        {piece.tint ? <TintStone color={piece.tint} /> : <Stone name={piece.name} size={64} cover={false} />}
      </span>
      {overlay}
    </span>
  );
}
