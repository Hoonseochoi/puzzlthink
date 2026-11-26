"use client";

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { Stone, useStoneChoice } from './StoneAvatar';

/**
 * 내 바둑알 on the board: a game's pieces drawn as their player's own profile stone (the colour or earned icon
 * picked in 기록실), for players who have one. Everyone else — the AI, guests, players who never picked — keeps
 * the game's own piece.
 *
 * A game says who sits where with <PieceOwners.Provider value={[nickname per seat]}> (or <MyPieces seat={n}> for
 * a game against the AI) and draws each piece with <PieceStone seat color>{the game's own piece}</PieceStone>.
 * The stone sits inside a ring of the seat's colour, so two players with the same stone still tell sides apart,
 * and it is drawn without the supporter cover and smaller than the piece, so it never reaches past its square.
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

/** The nickname whose stone is drawn for `seat`, or null when that seat keeps the game's own piece. */
export function usePieceOwner(seat: number | null | undefined) {
  const owners = useContext(PieceOwners);
  const name = (seat != null && owners[seat]) || '';
  const choice = useStoneChoice(name);
  return name && choice ? name : null;
}

/**
 * One piece. `color` is the seat's colour (the ring); `square` for a rounded-square piece; `inset` is how far the
 * stone sits inside the ring, in percent of the piece; `overlay` is drawn over the stone (a selection ring, a
 * cross). Fills its parent, like the pieces it replaces.
 */
export default function PieceStone({ seat, color, square = false, inset = 13, className = '', overlay, children }: {
  seat: number | null | undefined; color: string; square?: boolean; inset?: number; className?: string; overlay?: ReactNode; children: ReactNode;
}) {
  const owner = usePieceOwner(seat);
  if (!owner) return <>{children}</>;
  return (
    <span className={`relative block h-full w-full ${square ? 'rounded-[18%]' : 'rounded-full'} ${className}`}
      style={{ background: `radial-gradient(circle at 35% 28%, color-mix(in srgb, ${color} 62%, white) 0%, ${color} 55%, color-mix(in srgb, ${color} 62%, black) 100%)`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.22), 0 3px 8px rgba(0,0,0,.5)' }}>
      <span className="pointer-events-none absolute [&>svg]:h-full [&>svg]:w-full" style={{ inset: `${inset}%` }}>
        <Stone name={owner} size={64} cover={false} />
      </span>
      {overlay}
    </span>
  );
}
