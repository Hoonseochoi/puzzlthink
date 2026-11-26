/*
 * 시간 경매 (Time Auction) — the day-2 prison match of 데블스 플랜: 데스룸 (The Devil's Plan season 2, Netflix).
 *
 * ── Broadcast rules ─────────────────────────────────────────────────────────────────────────────────────────────
 * Sources, checked 2026-11-26:
 *   [N]  나무위키 「데블스 플랜: 데스룸/2일차」 §5 (rule card, strategy notes and a round-by-round table of all 19
 *        auctions with every visible bid and the final tokens / remaining time).
 *   [R]  English recaps found by web search (Sportskeeda's season-2 rules explainer and episode recap, as quoted in
 *        search results — the pages themselves refused automated reading) and a fan simulator README on tilde.town
 *        (which cites [N], so it only counts where it adds nothing new).
 *   [T]  [N]'s round table, used as a check: every player's bids add up to their stated remaining time.
 * Status: ✓✓ two sources agree · ✓ one source · ≈ inferred from the round table / footnotes · ◇ our own gap-filling.
 *
 *  1. Players: the six prison-wing players (김하린, 박상연, 손은유, 이세돌, 저스틴민, 최현준). ✓ [N] (+ [T]: six columns)
 *  2. Money: 10 minutes of time each. ✓✓ [N][R]
 *  3. Precision: time is recorded to 0.1 s only. ✓✓ [N][R]
 *     ◇ We truncate (floor) to the tenth: holding 12.38 s is a 12.3 s bid. Every number in [T] is a whole tenth.
 *  4. Auctions: 19. ✓ [N] (+ [T]: 19 rows whose sums match the totals). [R] says 18 — [T] settles it: 19.
 *  5. Buttons: one each, screened so nobody can see who is pressing. ✓✓ [N][R]
 *  6. Start: everyone holds the button down, then a 5-second countdown runs; when it ends, the time of everyone still
 *     pressing starts to drain. ✓ [N]
 *  7. Giving up: let go during the countdown and you are out of that auction at no cost. ✓ [N]
 *     ◇ Once you let go you stay out for that auction (pressing again does not re-enter).
 *     ◇ A hold that is still 0.0 s after truncation counts as giving up (no time is taken).
 *  8. Bidding: those still holding let go whenever they have spent what they want to bid. ✓✓ [N][R]
 *  9. Hidden information: nobody — not even you — is shown your remaining time; only the time running in the current
 *     auction is on the board. You must remember what you spent. ✓✓ [N][R]
 *     ◇ SITE RULE (owner's request, 2026-11-27): each player's OWN remaining time is shown on their own screen
 *       (draining live while they hold). Everyone else's stays hidden and is never sent to other browsers. A room
 *       host can restore the broadcast rule (TaRoom.hideOwn).
 * 10. Running out: when your remaining time is used up the button is pushed out at once, so you cannot bid more than
 *     you have. ✓✓ [N][R] ([N] notes the rule card did not say it; the dealer's answer and play showed it, and a
 *     player's device vibrated when their time ran out ≈.) ◇ A player with 0:00.0 left cannot take part at all.
 * 11. Winner: the board keeps running until the last player lets go; then it stops and that player wins a victory
 *     token. ✓✓ [N][R]  So the winner pays their whole hold, which can be far more than the runner-up's.
 * 12. All-pay: losers also lose the time they held. ✓ [N] (strategy notes) + ≈ [T] (손은유: six bids, three of them
 *     lost, sum 9:46.0 → 0:14.0 left, as shown). [R] the simulator charges losers too.
 * 13. Announced: only the round's winner (and, because the board stops there, the winning time). Who took part is not
 *     revealed. ✓✓ [N][R] (winning time ≈ [N] strategy notes: "you learn what the winner spent").
 * 14. Tie: if two or more bid exactly the same time to the 0.1 s, the token is not awarded (유찰). ✓✓ [N][R]
 *     ◇ This is about the top bid; two losers who tie change nothing. Tied bidders still pay.
 * 15. Nobody bids: ◇ the token is not awarded (the rule card is silent).
 * 16. End: most tokens → one piece (in our version: 1st place). Tie → more remaining time; still tied → no piece.
 *     ✓✓ [N][R]
 * 17. Elimination: fewest tokens is eliminated; tie → less remaining time is eliminated. ✓✓ [N][R]
 *     ◇ If players are still tied (same tokens and same time, e.g. both at 0:00.0 — [N] says the broadcast never
 *       showed this case), they share last place and are all eliminated.
 * 18. Survival maths from [N]: with 6 players and 19 auctions, 4 tokens guarantee survival (5 others × 4 > 15 left).
 *
 * ── House rule: the minus stone (owner's request, 2026-11-27; on in every match) ───────────────────────────────
 * Not in the broadcast. In every auction where at least two players actually bid (held past the countdown, so a
 * recorded bid ≥ 0.1 s), the single shortest bid takes a −1 stone. A tie for the shortest bid (to 0.1 s) voids it,
 * like the top-bid tie; dropping out in the countdown never takes it; a lone bidder only wins.
 *
 * ── House rule: stone values (owner's request, 2026-11-27) ─────────────────────────────────────────────────────
 * Each auction puts up a piece whose worth is fixed and shown in advance (taLotValue): the last auction's piece is
 * worth 3 points, every third auction's 2, every other 1. (The UI draws them as the site's profile icons by tier —
 * src/components/timeAuction/TimeAuctionParts.tsx — as points only; no icon is granted.) A player's score is points won −
 * minus stones (it can go below zero), and every ranking rule above uses the score where it says "tokens". With
 * values and minus stones the survival maths of rule 18 no longer guarantees anything.
 *
 * ── This site's version ────────────────────────────────────────────────────────────────────────────────────────
 * Same rules, but a full broadcast match lasts well over half an hour, so a match picks a format (TA_FORMATS):
 * 표준 5:00 × 13 auctions (default), 빠른 경매 2:00 × 9, 방송 규칙 10:00 × 19. Players: 6 vs the AI (you + 5),
 * 2–6 in friend and open rooms (empty seats can be AI). The ready step has a time limit in rooms, and a "이번엔 포기"
 * shortcut does the same as pressing and letting go in the countdown. Final ranking: tokens, then remaining time.
 *
 * ── Engine contract ────────────────────────────────────────────────────────────────────────────────────────────
 * Everything here is pure and deterministic: no timers, no clock reads. Times are milliseconds RELATIVE TO THE END
 * OF THE COUNTDOWN ("elapsed"): negative while the countdown runs. The caller (src/lib/timeAuctionRoom.ts) turns
 * clock readings into elapsed times and decides when to call each step. Bids are stored in ms, always a multiple of
 * TA_UNIT (100 ms).
 */

export const TA_MAX_PLAYERS = 6;
export const TA_COUNTDOWN_MS = 5000;
/** Recording precision: 0.1 s. */
export const TA_UNIT = 100;

export type TaFormatId = 'quick' | 'standard' | 'broadcast';
export const TA_FORMATS: Record<TaFormatId, { bank: number; rounds: number }> = {
  quick: { bank: 120_000, rounds: 9 },
  standard: { bank: 300_000, rounds: 13 },
  broadcast: { bank: 600_000, rounds: 19 },
};
export const TA_FORMAT_IDS: TaFormatId[] = ['quick', 'standard', 'broadcast'];

/** ready: waiting for everyone to press · live: countdown (elapsed < 0) and bidding · reveal: round result · finished. */
export type TaPhase = 'ready' | 'live' | 'reveal' | 'finished';
export type TaOutcome = 'won' | 'void' | 'empty';

/** One settled auction. `bids` (ms, 0 = did not bid) is hidden from other players until the match ends. */
export type TaRound = { round: number; outcome: TaOutcome; winner: number | null; price: number; bids: number[]; minus: number | null; value: number };

export type TimeAuction = {
  gid: string;
  format: TaFormatId;
  rounds: number;
  startBank: number;
  inGame: boolean[]; // seats taking part (rooms without AI leave some empty)
  bank: number[]; // remaining time, ms (hidden)
  tokens: number[]; // stones won (public)
  minus: number[]; // minus stones taken (public)
  points: number[]; // value of the stones won (public)
  round: number; // 1-based
  phase: TaPhase;
  /** ready: pressing (or passing). Public: the table shows how many are ready. */
  pressed: boolean[];
  /** ready: chose to sit this auction out (hidden). */
  pass: boolean[];
  /** live: took part (held through the end of the countdown) — hidden. */
  joined: boolean[];
  /** live: this round's bid once the player let go (0 = gave up / not in), null while still holding (hidden). */
  bids: (number | null)[];
  log: TaRound[];
  /** finished: final places (1 = best; ties share a place). */
  place: (number | null)[];
};

const fill = <T,>(n: number, value: T) => Array<T>(n).fill(value);
/** Truncate to the recording unit (0.1 s). */
export const taFloor = (ms: number) => Math.max(0, Math.floor(ms / TA_UNIT) * TA_UNIT);

export function newTimeAuction(inGame: boolean[], format: TaFormatId = 'standard', gid = 'g'): TimeAuction {
  const { bank, rounds } = TA_FORMATS[format];
  const n = inGame.length;
  return {
    gid, format, rounds, startBank: bank, inGame: [...inGame],
    bank: inGame.map((on) => (on ? bank : 0)), tokens: fill(n, 0), minus: fill(n, 0), points: fill(n, 0), round: 1, phase: 'ready',
    pressed: fill(n, false), pass: fill(n, false), joined: fill(n, false), bids: fill<number | null>(n, null), log: [], place: fill<number | null>(n, null),
  };
}

/** Seats that can bid this round: in the game with time left. */
export const taCanBid = (g: TimeAuction, seat: number) => g.inGame[seat] && g.bank[seat] >= TA_UNIT;

/** Ready step: press (or let go) before the countdown; `pass` = sit this auction out. */
export function taPress(g: TimeAuction, seat: number, on: boolean, pass = false): TimeAuction | null {
  if (g.phase !== 'ready' || !g.inGame[seat]) return null;
  const wantPass = on && (pass || !taCanBid(g, seat));
  if (g.pressed[seat] === on && g.pass[seat] === wantPass) return null;
  return { ...g, pressed: g.pressed.map((v, i) => (i === seat ? on : v)), pass: g.pass.map((v, i) => (i === seat ? wantPass : v)) };
}

/** Whether every seat in the game has pressed (or passed). */
export const taAllReady = (g: TimeAuction) => g.inGame.every((on, i) => !on || g.pressed[i]);

/**
 * The countdown starts. Everyone pressing (and not passing) with time left is in for now; seats that never pressed
 * are out. Out seats get a 0 bid straight away.
 */
export function taBeginCountdown(g: TimeAuction): TimeAuction | null {
  if (g.phase !== 'ready') return null;
  const joined = g.inGame.map((on, i) => on && g.pressed[i] && !g.pass[i] && taCanBid(g, i));
  return { ...g, phase: 'live', joined, bids: joined.map((j) => (j ? null : 0)) };
}

/**
 * A player lets go `elapsed` ms after the end of the countdown (negative = during it: gives up for free).
 * The bid is truncated to 0.1 s and capped at the player's remaining time (the button would have been pushed out).
 */
export function taRelease(g: TimeAuction, seat: number, elapsed: number): TimeAuction | null {
  if (g.phase !== 'live' || !g.joined[seat] || g.bids[seat] !== null) return null;
  const bid = elapsed <= 0 ? 0 : Math.min(taFloor(elapsed), g.bank[seat]);
  return { ...g, bids: g.bids.map((v, i) => (i === seat ? bid : v)) };
}

/** Seats still holding at `elapsed` whose time has run out are pushed out at exactly their remaining time. */
export function taExhaust(g: TimeAuction, elapsed: number): TimeAuction {
  if (g.phase !== 'live') return g;
  let changed = false;
  const bids = g.bids.map((v, i) => {
    if (v !== null || !g.joined[i] || elapsed < g.bank[i]) return v;
    changed = true;
    return g.bank[i];
  });
  return changed ? { ...g, bids } : g;
}

/** Seats still holding the button. */
export const taHolding = (g: TimeAuction) => g.bids.flatMap((v, i) => (g.phase === 'live' && v === null && g.joined[i] ? [i] : []));

/**
 * The round's result for a list of bids (ms, 0 = none): the top bid wins (a tie voids it) and, with two or more
 * bidders, the single shortest bid takes the minus stone (a tie voids that too).
 */
export function taJudge(bids: number[]): { outcome: TaOutcome; winner: number | null; price: number; minus: number | null } {
  const price = Math.max(0, ...bids);
  const bidders = bids.flatMap((b, i) => (b > 0 ? [i] : []));
  let minus: number | null = null;
  if (bidders.length >= 2) {
    const low = Math.min(...bidders.map((i) => bids[i]));
    const lows = bidders.filter((i) => bids[i] === low);
    if (lows.length === 1 && low < price) minus = lows[0];
  }
  if (price <= 0) return { outcome: 'empty', winner: null, price: 0, minus };
  const top = bids.flatMap((b, i) => (b === price ? [i] : []));
  return top.length > 1 ? { outcome: 'void', winner: null, price, minus } : { outcome: 'won', winner: top[0], price, minus };
}

/** What auction `round` (1-based) is worth: the last one 3, every third one 2, the rest 1. */
export const taLotValue = (round: number, rounds: number) => (round === rounds ? 3 : round % 3 === 0 ? 2 : 1);

/** A seat's score: points won (stone values) minus minus stones. */
export const taScore = (g: Pick<TimeAuction, 'points' | 'minus'>, seat: number) => (g.points?.[seat] ?? 0) - (g.minus?.[seat] ?? 0);

/**
 * Everyone has let go: the board stops at the top bid. Every bidder pays their own bid; a unique top bid takes the
 * token, a tie at the top voids it. Moves to `reveal`.
 */
export function taSettle(g: TimeAuction): TimeAuction | null {
  if (g.phase !== 'live' || taHolding(g).length) return null;
  const bids = g.bids.map((b) => b ?? 0);
  const { outcome, winner, price, minus } = taJudge(bids);
  return {
    ...g, phase: 'reveal',
    bank: g.bank.map((b, i) => b - bids[i]),
    tokens: g.tokens.map((t, i) => (i === winner ? t + 1 : t)),
    minus: g.minus.map((m, i) => (i === minus ? m + 1 : m)),
    points: g.points.map((p, i) => (i === winner ? p + taLotValue(g.round, g.rounds) : p)),
    log: [...g.log, { round: g.round, outcome, winner, price, bids, minus, value: taLotValue(g.round, g.rounds) }],
  };
}

/** After the reveal: the next auction, or the final standings after the last one. */
export function taNextRound(g: TimeAuction): TimeAuction | null {
  if (g.phase !== 'reveal') return null;
  const n = g.inGame.length;
  if (g.round >= g.rounds) return { ...g, phase: 'finished', place: taStandings(g).place };
  return { ...g, round: g.round + 1, phase: 'ready', pressed: fill(n, false), pass: fill(n, false), joined: fill(n, false), bids: fill<number | null>(n, null) };
}

/**
 * Final standings: higher score (points won − minus stones) first, then more time left. Equal on both = shared place. The best seat wins the
 * piece only if it is alone at the top; the last place (possibly shared) is eliminated.
 */
export function taStandings(g: TimeAuction): { order: number[]; place: (number | null)[]; piece: number | null; eliminated: number[] } {
  const seats = g.inGame.flatMap((on, i) => (on ? [i] : []));
  const key = (s: number) => [taScore(g, s), g.bank[s]] as const;
  const order = [...seats].sort((a, b) => key(b)[0] - key(a)[0] || key(b)[1] - key(a)[1] || a - b);
  const place: (number | null)[] = fill(g.inGame.length, null);
  order.forEach((s, i) => {
    const prev = order[i - 1];
    place[s] = i > 0 && key(prev)[0] === key(s)[0] && key(prev)[1] === key(s)[1] ? place[prev] : i + 1;
  });
  const top = order.filter((s) => place[s] === 1);
  const worst = Math.max(...order.map((s) => place[s]!));
  return { order, place, piece: top.length === 1 ? top[0] : null, eliminated: order.length > 1 ? order.filter((s) => place[s] === worst) : [] };
}

/** Tokens that guarantee you are not alone at the bottom: more than rounds / players. */
export const taSafeTokens = (rounds: number, players: number) => Math.floor(rounds / Math.max(1, players)) + 1;

/** "1:23.4" — minutes:seconds.tenths, as on the broadcast board. */
export function taClock(ms: number, withMinutes = true) {
  const t = Math.max(0, Math.floor(ms / TA_UNIT));
  const tenths = t % 10;
  const sec = Math.floor(t / 10);
  if (!withMinutes) return `${sec}.${tenths}`;
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}.${tenths}`;
}
