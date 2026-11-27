// Shared pieces for host-authoritative realtime rooms (WallGo, 12-janggi).
export type Seat = { id: string; name: string } | null;
/** A browser in the room. `emote` is the latest quick reaction (ㅎㅇ, ㅇㅋ…) and when it was sent.
 * `app`: the browser says it runs inside the Google Play app (src/lib/playApp.ts; a claim, used for app-only rooms). */
export type Peer = { id: string; name: string; at: number; emote?: string; emoteAt?: number; uid?: string; app?: boolean };
/** `term`: which host is running the room. It goes up by one each time a guest takes over from a host who left. */
export type BaseRoom = { sid: string; v: number; seats: Seat[]; phase: string; deadline: number; term?: number };

/** Whether `text` is a room code: the 4-digit invite codes, or the older 6-character ones (old links keep working). */
export const isRoomCode = (text: string) => /^\d{4}$/.test(text) || /^[a-z0-9]{6}$/.test(text);

export const newSid = () => Math.random().toString(36).slice(2, 10);

export function bump<S extends BaseRoom>(state: S): S {
  return { ...state, v: state.v + 1 };
}

export function seatOf(state: BaseRoom, clientId: string): number | null {
  const index = state.seats.findIndex((seat) => seat?.id === clientId);
  return index < 0 ? null : index;
}

/** In the lobby, seats follow who is present (host first, then join order). Later, seats are fixed. */
export function syncSeats<S extends BaseRoom>(state: S, peers: Peer[]): S {
  const byId = new Map(peers.map((peer) => [peer.id, peer]));
  let seats: Seat[];
  if (state.phase !== 'lobby') {
    seats = state.seats.map((seat) => (seat && byId.has(seat.id) ? { ...seat, name: byId.get(seat.id)!.name } : seat));
  } else {
    const host = state.seats[0]!;
    const others = peers.filter((peer) => peer.id !== host.id).sort((a, b) => a.at - b.at);
    seats = state.seats.map((_, i) => {
      if (i === 0) return { id: host.id, name: byId.get(host.id)?.name ?? host.name };
      const peer = others[i - 1];
      return peer ? { id: peer.id, name: peer.name } : null;
    });
  }
  return JSON.stringify(seats) === JSON.stringify(state.seats) ? state : bump({ ...state, seats });
}
