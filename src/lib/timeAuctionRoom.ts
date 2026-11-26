/*
 * 시간 경매 rooms: the AI match (in this browser) and friend / open rooms for 2–6 players (empty seats AI or left out).
 *
 * ── Timing and fairness ────────────────────────────────────────────────────────────────────────────────────────
 * Rooms here are host-authoritative (src/hooks/useRealtimeRoom.ts): the creator's browser holds the state and relays
 * it over Supabase Realtime; there is no server clock and no clock sync anywhere in the room system (turn deadlines
 * are host Date.now() values). Time Auction needs 0.1 s, so:
 *
 * 1. Each player's hold is measured on their own device, from their own countdown. A guest's countdown starts when the
 *    host's "countdown" state reaches it (performance.now()), and the bid is (let-go time − that countdown's end). The
 *    one-way delay shifts when a guest's auction starts in wall time, but not how long they hold, and nobody can see
 *    anyone else's button, so a shifted start changes nothing anyone can observe. No clock sync is needed.
 * 2. The host checks every claim against its own clock. A guest's true hold d satisfies d = E − (L1 + L2), where E is
 *    the host's elapsed time when the claim arrives and L1/L2 the two network legs. The host accepts
 *    max(E − TA_LAG_MAX, min(claim, E + TA_EARLY_MS)): nobody can claim to have held past the moment their message
 *    arrived, and nobody can keep the board running and then claim a tiny bid (they pay at least E − TA_LAG_MAX).
 *    The bid is then truncated to 0.1 s and capped at the player's time (taRelease).
 * 3. Hidden information stays hidden from other guests, including traffic. Presses and releases are sealed to the
 *    host (end-to-end encrypted, engine.sealed). While an auction runs, every seated player's browser sends a
 *    fixed-size heartbeat about once a second whether or not it is holding; the real let-go rides in the next
 *    heartbeat (the delay does not matter: the claim is the device-measured time). Host-side changes that only
 *    record a release are kept quiet (engine.quiet: not broadcast), so nobody learns when someone let go. The board
 *    only stops — and everyone learns the price and winner — when the last holder has let go.
 * 4. A holder who vanishes pays up to their last sign of life: heartbeats missing for TA_BEAT_LOST_MS (tab closed,
 *    phone locked, network gone) → released at the last heartbeat; a holder whose time is used up is pushed out at
 *    exactly their time (the device does it at once, the host after TA_LAG_MAX as a fallback). On the device, losing
 *    the pointer (pointercancel, lost capture), hiding the tab or leaving the page counts as letting go, and a page
 *    loaded mid-auction reports "unknown", which the host settles at E − TA_LAG_MAX.
 * 5. Limits: the host's browser is trusted — it holds everyone's time and live bids, as Hit,Stay's host holds the deck.
 *    A modified guest can at most keep the board running TA_LAG_MAX ms longer than it pays for. If the host leaves
 *    mid-match, the hidden times leave with it, so the room goes back to the lobby (resume → null). A host refresh
 *    within the hand-off window restores from its saved state.
 *
 * The AI match uses the same reducer locally: no network, the bid is the device-measured time.
 */
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import { type AwayFields, clearMiss, giveBack, humansBack, noteMiss, resetAway, seatDueForAway, takeOver, trackPresence } from './roomAway';
import {
  TA_COUNTDOWN_MS, TA_MAX_PLAYERS, type TaFormatId, type TimeAuction, newTimeAuction, taAllReady, taBeginCountdown, taCanBid, taHolding, taNextRound, taPress, taRelease, taSettle,
} from './timeAuction';
import { TA_PERSONA, TA_STYLES, type TaLevel, type TaMind, type TaStyle, chooseTaBid, pickTaStyles, rollTaMind, taAiView } from './timeAuctionAi';

/** Seconds people in a room have to press before an auction (then they sit it out). Two misses in a row: the AI plays the seat. */
export const TA_READY_SEC = 15;
/** How long the result of an auction stays up. */
export const TA_REVEAL_MS = 3800;
/** The most a release may lag behind the host's clock before the host charges for the lag (see header, point 2). */
export const TA_LAG_MAX = 2600;
/** How far ahead of the host's clock a claim may be (timer jitter). */
export const TA_EARLY_MS = 120;
/** Heartbeat period of a seated player's browser while an auction runs. */
export const TA_BEAT_MS = 1000;
/** No heartbeat for this long from someone holding: released at their last heartbeat. */
export const TA_BEAT_LOST_MS = 4200;

export type TaRoom = BaseRoom & AwayFields & {
  phase: 'lobby' | 'playing' | 'finished';
  style: (TaStyle | null)[]; // AI personality per seat (kept when the AI stands in for an away player)
  /** This match's rolled mind per seat (aggression, patience, chaos, mood seed): host only, redacted for guests. */
  mind?: (TaMind | null)[];
  level: TaLevel;
  format: TaFormatId;
  fillAi?: boolean; // rooms: empty seats become AI (default) or stay out
  /** Rooms: the broadcast rule — players do not see even their own remaining time (default off: you see yours). */
  hideOwn?: boolean;
  solo?: boolean; // the AI match: no ready clock
  game: TimeAuction;
  liveAt: number; // host clock: when this auction's countdown started
  readyUntil: number; // host clock: end of the ready step (rooms)
  revealUntil: number; // host clock: next auction after this
  /** Host only (redacted): AI holds for this auction, and each seat's last heartbeat (host clock). */
  hidden: { plan: (number | null)[]; beat: number[] };
};

/** Heartbeat payload: `m` = 'h' + 8 digits while holding, 'r' + (ms + 10000) padded to 8 after letting go, 'u' unknown. */
export type TaBeat = string;
export const taBeat = (ms: number | null | 'unknown'): TaBeat =>
  ms === 'unknown' ? 'u00000000' : ms === null ? 'h00000000' : `r${String(Math.max(0, Math.round(ms) + 10_000)).padStart(8, '0').slice(-8)}`;
const readBeat = (m: string): number | null | 'unknown' => (m[0] === 'u' ? 'unknown' : m[0] === 'r' ? Number(m.slice(1)) - 10_000 : null);

export type TaRoomAction =
  | { t: 'start' }
  | { t: 'fillAi'; on: boolean }
  | { t: 'hideOwn'; on: boolean }
  | { t: 'format'; format: TaFormatId }
  | { t: 'level'; level: TaLevel }
  | { t: 'press'; r: number; on: boolean; pass?: boolean }
  | { t: 'hb'; r: number; m: TaBeat }
  | { t: 'tick' }
  | { t: 'away'; seat: number }
  | { t: 'rejoin' };

const N = TA_MAX_PLAYERS;
const fill = <T,>(value: T) => Array<T>(N).fill(value);
const elapsedAt = (state: TaRoom, now: number) => now - state.liveAt - TA_COUNTDOWN_MS;

export function createTaRoom(host: Peer, opts: { solo?: boolean; format?: TaFormatId; level?: TaLevel } = {}): TaRoom {
  const seats: Seat[] = fill(null);
  seats[0] = { id: host.id, name: host.name };
  const room: TaRoom = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, ai: fill(false), style: fill(null),
    level: opts.level ?? 'hard', format: opts.format ?? 'standard', solo: !!opts.solo,
    game: newTimeAuction(fill(false), opts.format ?? 'standard'), liveAt: 0, readyUntil: 0, revealUntil: 0, hidden: { plan: fill(null), beat: fill(0) },
  };
  return opts.solo ? startRoom(room, false) : room;
}

export const syncTaSeats = (state: TaRoom, peers: Peer[]) => trackPresence(syncSeats(state, peers), peers);

/** People in the room's seats (AI seats of a finished game do not count). */
export const taPeople = (state: TaRoom) => state.seats.filter((seat, i) => seat && !state.ai[i]).length;

function startRoom(state: TaRoom, shuffleHumans = true): TaRoom {
  let humans = state.seats.flatMap((seat, i) => (seat && !state.ai[i] ? [seat] : []));
  if (shuffleHumans) humans = humans.sort(() => Math.random() - 0.5);
  // A random handful from the roster of ten: no two AI at a table share a personality.
  const styles = pickTaStyles(TA_STYLES.length);
  const seats: Seat[] = [];
  const ai: boolean[] = [];
  const style: (TaStyle | null)[] = [];
  for (let i = 0; i < N; i += 1) {
    if (i < humans.length) { seats.push(humans[i]); ai.push(false); style.push(styles[i % styles.length]); continue; }
    if (state.fillAi === false) { seats.push(null); ai.push(false); style.push(null); continue; }
    const st = styles[(i - humans.length) % styles.length];
    const p = TA_PERSONA[st];
    seats.push({ id: `ai-${st}-${i}`, name: p.name }); ai.push(true); style.push(st);
  }
  // A person's own persona (used only if the AI stands in for them) must not repeat a table AI's: pick unused ones.
  const used = new Set(style.filter((s, i) => s && ai[i]));
  const spare = TA_STYLES.filter((s) => !used.has(s));
  humans.forEach((_, i) => { style[i] = spare[i % Math.max(1, spare.length)] ?? 'steady'; });
  const inGame = seats.map((seat) => !!seat);
  const game = newTimeAuction(inGame, state.format, newSid());
  // Every seat gets a freshly rolled mind (people's are used only if the AI stands in for them).
  const mind = style.map((st) => (st ? rollTaMind(st) : null));
  return toReady({ ...state, seats, ai, style, mind, phase: 'playing', ...resetAway(N), game, liveAt: 0, revealUntil: 0, hidden: { plan: fill(null), beat: fill(0) } }, Date.now());
}

/**
 * A new ready step: AI seats press at once. In the AI match a person with no time left sits out automatically (in
 * rooms their own browser does it after a short random wait, so an instant "ready" does not give them away).
 */
function toReady(state: TaRoom, now: number): TaRoom {
  let game = state.game;
  state.ai.forEach((ai, s) => { if ((ai || (state.solo && !taCanBid(game, s))) && game.inGame[s]) game = taPress(game, s, true) ?? game; });
  const next = { ...state, game, readyUntil: state.solo ? Number.MAX_SAFE_INTEGER : now + TA_READY_SEC * 1000 };
  return taAllReady(game) ? begin(next, now) : next;
}

/** The countdown starts: AI seats plan their holds now, from what they can see. */
function begin(state: TaRoom, now: number): TaRoom {
  const game = taBeginCountdown(state.game);
  if (!game) return state;
  const plan = game.joined.map((j, s) => (j && state.ai[s] ? chooseTaBid(taAiView(game, s), state.mind?.[s] ?? state.style[s] ?? 'steady', state.level) : null));
  // An AI that sits out lets go during the countdown, like a person would.
  let g = game;
  plan.forEach((p, s) => { if (game.joined[s] && state.ai[s] && p === null) g = taRelease(g, s, -1) ?? g; });
  return { ...state, game: g, liveAt: now, hidden: { plan, beat: fill(now) } };
}

/**
 * Brings a live auction up to `now`: AI holds that have run out, people whose time is used up (with the lag grace),
 * holders whose heartbeat stopped or who went offline, AI stand-ins for away players. Settles once nobody holds and
 * the host's countdown is over.
 */
function advance(state: TaRoom, now: number): TaRoom {
  if (state.game.phase !== 'live') return state;
  const e = elapsedAt(state, now);
  let g = state.game;
  for (const s of taHolding(g)) {
    if (state.ai[s]) {
      const p = state.hidden.plan[s];
      if (p === null || p === undefined) g = taRelease(g, s, e) ?? g; // the AI just took over a holding seat
      else if (p <= e) g = taRelease(g, s, p) ?? g;
      continue;
    }
    const lost = !state.solo && now - (state.hidden.beat[s] ?? state.liveAt) >= TA_BEAT_LOST_MS;
    const off = state.offlineSince?.[s];
    if (off !== null && off !== undefined) g = taRelease(g, s, elapsedAt(state, off)) ?? g;
    else if (lost) g = taRelease(g, s, elapsedAt(state, state.hidden.beat[s] ?? state.liveAt)) ?? g;
    else if (e >= g.bank[s] + (state.solo ? 0 : TA_LAG_MAX)) g = taRelease(g, s, g.bank[s]) ?? g;
  }
  let next = g === state.game ? state : { ...state, game: g };
  if (!taHolding(g).length && e >= 0) {
    const settled = taSettle(g);
    if (settled) next = { ...next, game: settled, revealUntil: now + TA_REVEAL_MS };
  }
  return next;
}

/** A release claim from a person, checked against the host's clock (header, point 2). */
function claim(state: TaRoom, seat: number, m: number | 'unknown', now: number): TaRoom {
  const e = elapsedAt(state, now);
  const ms = state.solo ? (m === 'unknown' ? e : m) : Math.max(e - TA_LAG_MAX, m === 'unknown' ? -Infinity : Math.min(m, e + TA_EARLY_MS));
  const game = taRelease(state.game, seat, ms);
  return game ? { ...state, game } : state;
}

/** The next moment the host must look at the room (for a precise timer; the room hook also polls). */
export function taNextEventAt(state: TaRoom): number {
  if (state.phase !== 'playing') return Number.MAX_SAFE_INTEGER;
  const g = state.game;
  if (g.phase === 'ready') return state.readyUntil;
  if (g.phase === 'reveal') return state.revealUntil;
  if (g.phase !== 'live') return Number.MAX_SAFE_INTEGER;
  const end = state.liveAt + TA_COUNTDOWN_MS;
  const holding = taHolding(g);
  if (!holding.length) return end;
  const times = holding.map((s) => {
    if (state.ai[s]) return end + (state.hidden.plan[s] ?? 0);
    const exhaust = end + g.bank[s] + (state.solo ? 0 : TA_LAG_MAX);
    return state.solo ? exhaust : Math.min(exhaust, (state.hidden.beat[s] ?? state.liveAt) + TA_BEAT_LOST_MS);
  });
  return Math.max(end, Math.min(...times));
}

export function reduceTaRoom(state: TaRoom, action: TaRoomAction, seat: number | null, isHost: boolean): TaRoom | null {
  const now = Date.now();
  const g = state.game;
  let next: TaRoom | null = null;
  switch (action.t) {
    case 'fillAi':
      if (isHost && state.phase !== 'playing') next = { ...state, fillAi: action.on };
      break;
    case 'hideOwn':
      if (isHost && state.phase !== 'playing') next = { ...state, hideOwn: action.on };
      break;
    case 'format':
      if (isHost && state.phase !== 'playing') next = { ...state, format: action.format };
      break;
    case 'level':
      if (isHost && state.phase !== 'playing') next = { ...state, level: action.level };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing') break;
      if (state.fillAi === false && taPeople(state) < 2) break;
      const base = humansBack(state);
      next = startRoom(state.phase === 'finished' ? { ...base, seats: base.seats.map((v, i) => (base.ai[i] ? null : v)), ai: fill(false) } : state, !state.solo);
      break;
    }
    case 'press': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing' || g.phase !== 'ready' || action.r !== g.round) break;
      const game = taPress(g, seat, action.on, action.pass);
      if (!game) break;
      next = { ...clearMiss(state, seat), game };
      if (taAllReady(game)) next = begin(next, now);
      break;
    }
    case 'hb': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing' || g.phase !== 'live' || action.r !== g.round || typeof action.m !== 'string') break;
      const beat = state.hidden.beat.map((b, i) => (i === seat ? now : b));
      next = { ...state, hidden: { ...state.hidden, beat } };
      const m = readBeat(action.m);
      if (m !== null && g.joined[seat] && g.bids[seat] === null) next = claim(next, seat, m, now);
      next = advance(next, now);
      break;
    }
    case 'tick': {
      if (!isHost || state.phase !== 'playing') break;
      if (g.phase === 'ready') {
        if (taAllReady(g)) { next = begin(state, now); break; }
        if (now < state.readyUntil) break;
        // Time is up: whoever has not pressed sits this one out; a second miss in a row hands the seat to the AI.
        let counted = state;
        g.inGame.forEach((on, s) => { if (on && !g.pressed[s] && !state.ai[s] && taCanBid(g, s)) counted = noteMiss(counted, s); });
        next = begin(counted, now);
      } else if (g.phase === 'live') {
        const advanced = advance(state, now);
        if (advanced !== state) next = advanced;
      } else if (g.phase === 'reveal' && now >= state.revealUntil) {
        const game = taNextRound(g)!;
        next = game.phase === 'finished'
          ? { ...state, game, phase: 'finished' }
          : toReady({ ...state, game, hidden: { plan: fill(null), beat: fill(0) } }, now);
      }
      break;
    }
    case 'away':
      if (isHost && state.phase === 'playing' && seatDueForAway(state) === action.seat) {
        next = takeOver(state, action.seat);
        if (next.game.phase === 'ready') next = { ...next, game: taPress(next.game, action.seat, true) ?? next.game };
        next = next.game.phase === 'live' ? advance(next, now) : next.game.phase === 'ready' && taAllReady(next.game) ? begin(next, now) : next;
      }
      break;
    case 'rejoin':
      if (seat !== null && state.phase === 'playing') next = giveBack(state, seat);
      break;
  }
  return next ? bump(next) : null;
}

/** Host-run steps: hand away seats to the AI, and anything due (ready clock, AI holds, settling, next auction). */
export function taAutoAction(state: TaRoom): TaRoomAction | null {
  if (state.phase !== 'playing') return null;
  const gone = seatDueForAway(state);
  if (gone !== null) return { t: 'away', seat: gone };
  if (state.game.phase === 'ready' && taAllReady(state.game)) return { t: 'tick' };
  return Date.now() >= taNextEventAt(state) ? { t: 'tick' } : null;
}

/**
 * Not broadcast: a change during a live auction that only records a let-go or a heartbeat (and the AI's), so other
 * browsers cannot learn when someone let go (header, point 3). Settling, a take-over or anything else is sent.
 */
export const taQuiet = (prev: TaRoom, next: TaRoom) =>
  prev.phase === 'playing' && next.phase === 'playing' && prev.game.phase === 'live' && next.game.phase === 'live' &&
  prev.game.round === next.game.round && prev.ai === next.ai && prev.offlineSince === next.offlineSince;

/** Everything a guest may see while the match runs: no times, no live bids, no losing bids, no AI plans. */
export function redactTaRoom(state: TaRoom): TaRoom {
  if (state.phase !== 'playing') return state;
  const g = state.game;
  return {
    ...state, hidden: { plan: [], beat: [] }, mind: undefined,
    game: { ...g, bank: fill(-1), pass: fill(false), joined: fill(false), bids: fill<number | null>(0), log: g.log.map((r) => ({ ...r, bids: [] })) },
  };
}

export type TaSecret = { bank: number; pass: boolean; joined: boolean; bid: number | null; bids: number[] };
export const taRoomSecret = (state: TaRoom, seat: number): TaSecret => {
  const g = state.game;
  return { bank: g.bank[seat], pass: g.pass[seat], joined: g.joined[seat], bid: g.bids[seat], bids: g.log.map((r) => r.bids[seat] ?? 0) };
};
export function withTaRoomSecret(state: TaRoom, secret: unknown, seat: number): TaRoom {
  if (state.phase !== 'playing') return state;
  const x = secret as TaSecret;
  const g = state.game;
  if (!x || typeof x.bank !== 'number' || x.bids?.length !== g.log.length) return state;
  const put = <T,>(list: T[], value: T) => list.map((v, i) => (i === seat ? value : v));
  return {
    ...state, game: {
      ...g, bank: put(g.bank, x.bank), pass: put(g.pass, x.pass), joined: put(g.joined, x.joined), bids: put(g.bids, x.bid),
      log: g.log.map((r, i) => ({ ...r, bids: Array.from({ length: N }, (_, s) => (s === seat ? x.bids[i] : 0)) })),
    },
  };
}

/** My own view of the current auction: what my device knows about me. */
export function taMine(state: TaRoom, seat: number | null) {
  const g = state.game;
  if (seat === null || !g.inGame[seat]) return null;
  return { bank: g.bank[seat], tokens: g.tokens[seat], joined: g.joined[seat], bid: g.bids[seat], pressed: g.pressed[seat], pass: g.pass[seat] };
}
