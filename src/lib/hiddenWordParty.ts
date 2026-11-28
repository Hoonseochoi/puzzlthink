// 히든 워드 확장판 party room: 2–6 players (friend or open room), the broadcast's main-match rules, one turn each.
//
// Rules (데블스 플랜: 데드 어게인, day 5 main match, as written up in src/content/shows/dp3/hidden-word.ts from
// 나무위키's day-5 page and the broadcast). Confirmation status: the write-up was checked on 11/26; re-checking on 11/28
// failed (나무위키 and the recap pages refused automated reading), so the rules below rest on that write-up.
//   Broadcast                                         Here
//   6 players, envelopes of 5 nouns, pick 1          2–6 players (the host sets the seat count), same six envelopes of five
//   2 rounds; each player sets once per round,       one round (the owner's call, 11/28): each player sets once, so a
//     order drawn                                      game is as many turns as players (6 at a full table); order drawn
//   setter: up to 10 hints in 15 min; a hint at      up to 5 hints in 2 minutes (the site's pace, as in every 히든 워드
//     95%+ ends the hints; without one the            match); 95%+ ends the hints; without one, the closest word of the
//     closest word is revealed                       list is revealed
//   everyone else answers within 5 min, all          everyone else answers within 75 s, shown when all have answered
//     shown at once; a piece buys a second answer      (or time is up); once per word a second answer, free (as in the
//                                                      1:1 room)
//   a right answer: +1 to each who got it, next      same; the word goes to the next setter
//     setter
//   nobody right: setter +1 / +2 / +3 by stage,      same
//     next stage, at most 3 stages
//   round 2 doubles every point; rank by points     no round 2, so no doubling; rank by points; not ranked on the site
// Online adaptations: a setter who does not pick a word in 60 s (or has left) loses the turn, nobody scores; a guesser
// who does not answer in time simply has no answer; after a turn ends the room moves on by itself after 20 s.
// Secrecy: envelopes are dealt and claimed on the server (hw_party_*), so a browser holds only its own five words and the
// room state carries a lock id, never a hidden word. Hints, the closest word and answers are scored by the server only
// for the browser that holds the right secret (the setter for hints, another player of the deal for answers), so a lock
// id is no way to probe the word; the setter's browser shows the word to everyone when the turn ends.
// Seats are human only (no AI filling). Open party rooms are listed like every 히든 워드 open room (hosted only in the
// Play app, joined by anyone signed in).
import { getSupabase } from './supabase';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import { isHwWord } from './hiddenWord';

export const HWP_MAX = 6;
export const HWP_CFG = { cut: 95, stages: 3, maxHints: 5, setPoints: [1, 2, 3], guessPoints: [1, 1, 1], pickSecs: 60, hintSecs: 120, answerSecs: 75, endSecs: 20, revealMs: 10_000, envelopes: 6 } as const;

export type HwpHint = { w: string; s: number; stage: number; by: 'set' | 'reveal' };
export type HwpAnswer = { seat: number; w: string[]; s: number[]; stage: number; ok: boolean };
export type HwpTurn = {
  setter: number; lock: string; stage: number; round: number; hints: HwpHint[]; answers: HwpAnswer[];
  /** seats that have given two answers for this word (once per word) */
  chance: number[]; gained: number[];
  /** stage the word was found at, 0 = held to the end, -1 = turn lost (no word picked) */
  solved?: number; word?: string;
};
export type HwpRoom = BaseRoom & {
  phase: 'lobby' | 'envelope' | 'pick' | 'hint' | 'reveal' | 'answer' | 'turnEnd' | 'finished';
  /** seats open in the lobby (2–6) */
  capacity: number;
  deal: string; picks: (number | null)[]; players: number[]; order: number[];
  round: number; turnIdx: number; t: HwpTurn | null; history: HwpTurn[]; scores: number[];
};
export type HwpAction =
  | { t: 'capacity'; n: number }
  | { t: 'start'; deal: string }
  | { t: 'envelope'; i: number }
  | { t: 'pick'; lock: string }
  | { t: 'hint'; word: string; s: number; rev?: { w: string; s: number } | null }
  | { t: 'reveal'; rev: { w: string; s: number } | null }
  | { t: 'answer'; words: string[]; s: number[] }
  | { t: 'word'; word: string }
  | { t: 'next' }
  | { t: 'timeout' };

const zeros = () => Array(HWP_MAX).fill(0) as number[];
export function createHwpRoom(host: Peer): HwpRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, ...Array(HWP_MAX - 1).fill(null)] as Seat[], phase: 'lobby', deadline: 0,
    capacity: HWP_MAX, deal: '', picks: Array(HWP_MAX).fill(null), players: [], order: [], round: 1, turnIdx: 0, t: null, history: [], scores: zeros(),
  };
}
/** Lobby seats follow who is here, up to the seat count the host chose. */
export function syncHwpSeats(state: HwpRoom, peers: Peer[]): HwpRoom {
  const next = syncSeats(state, peers);
  if (next.phase !== 'lobby' || next.seats.every((s, i) => i < next.capacity || !s)) return next;
  return bump({ ...next, seats: next.seats.map((s, i) => (i < next.capacity ? s : null)) });
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100 ? Math.round(v * 10) / 10 : null);
export const hwpUsed = (t: HwpTurn) => [...t.hints.map((h) => h.w), ...t.answers.flatMap((a) => a.w)];
/** Words an answer may not use: the hints, and answers of earlier stages (answers of this stage are sent blind, so two players may say the same word). */
export const hwpTaken = (t: HwpTurn) => [...t.hints.map((h) => h.w), ...t.answers.filter((a) => a.stage < t.stage).flatMap((a) => a.w)];
export const hwpHintsThisStage = (t: HwpTurn) => t.hints.filter((h) => h.stage === t.stage && h.by === 'set').length;
export const hwpGuessers = (state: HwpRoom, t: HwpTurn) => state.players.filter((p) => p !== t.setter);
export const hwpAnswered = (t: HwpTurn) => t.answers.filter((a) => a.stage === t.stage).map((a) => a.seat);

function beginTurn(state: HwpRoom, round: number, turnIdx: number): HwpRoom {
  const setter = state.order[turnIdx];
  return { ...state, phase: 'pick', round, turnIdx, deadline: Date.now() + HWP_CFG.pickSecs * 1000,
    t: { setter, lock: '', stage: 1, round, hints: [], answers: [], chance: [], gained: zeros() } };
}
const toHint = (state: HwpRoom, t: HwpTurn): HwpRoom => ({ ...state, t, phase: 'hint', deadline: Date.now() + HWP_CFG.hintSecs * 1000 });
const toAnswer = (state: HwpRoom, t: HwpTurn): HwpRoom => ({ ...state, t, phase: 'answer', deadline: Date.now() + HWP_CFG.answerSecs * 1000 });
const toEnd = (state: HwpRoom, t: HwpTurn): HwpRoom => ({ ...state, t, phase: 'turnEnd', deadline: Date.now() + HWP_CFG.endSecs * 1000 });

/** Everyone has answered (or time is up): a right answer scores each who found it; otherwise the setter holds. */
function resolve(state: HwpRoom): HwpRoom {
  const t = state.t!;
  const found = t.answers.filter((a) => a.stage === t.stage && a.ok).map((a) => a.seat);
  if (found.length) {
    const gained = t.gained.map((g, i) => (found.includes(i) ? g + HWP_CFG.guessPoints[t.stage - 1] : g));
    const scores = state.scores.map((x, i) => (found.includes(i) ? x + HWP_CFG.guessPoints[t.stage - 1] : x));
    return toEnd({ ...state, scores }, { ...t, gained, solved: t.stage });
  }
  const n = HWP_CFG.setPoints[t.stage - 1];
  const gained = t.gained.map((g, i) => (i === t.setter ? g + n : g));
  const scores = state.scores.map((x, i) => (i === t.setter ? x + n : x));
  if (t.stage >= HWP_CFG.stages) return toEnd({ ...state, scores }, { ...t, gained, solved: 0 });
  return toHint({ ...state, scores }, { ...t, gained, stage: t.stage + 1 });
}

function nextTurn(state: HwpRoom): HwpRoom {
  const done = { ...state, history: [...state.history, state.t!] };
  if (state.turnIdx + 1 < state.order.length) return beginTurn(done, state.round, state.turnIdx + 1);
  return { ...done, phase: 'finished', deadline: 0, t: null };
}

export function reduceHwpRoom(state: HwpRoom, action: HwpAction, seat: number | null, isHost: boolean): HwpRoom | null {
  let next: HwpRoom | null = null;
  const t = state.t;
  const now = Date.now();
  const playing = seat !== null && state.players.includes(seat);
  switch (action.t) {
    case 'capacity': {
      if (!isHost || state.phase !== 'lobby' || !Number.isInteger(action.n) || action.n < 2 || action.n > HWP_MAX) break;
      next = { ...state, capacity: action.n, seats: state.seats.map((s, i) => (i < action.n ? s : null)) };
      break;
    }
    case 'start': {
      if (!isHost || (state.phase !== 'lobby' && state.phase !== 'finished') || typeof action.deal !== 'string' || !action.deal) break;
      const players = state.seats.flatMap((s, i) => (s && i < state.capacity ? [i] : []));
      if (players.length < 2) break;
      const order = [...players].sort(() => Math.random() - 0.5);
      next = { ...state, sid: newSid(), phase: 'envelope', deadline: 0, deal: action.deal, picks: Array(HWP_MAX).fill(null), players, order,
        round: 1, turnIdx: 0, t: null, history: [], scores: zeros() };
      break;
    }
    case 'envelope': {
      const i = action.i;
      if (state.phase !== 'envelope' || !playing || state.picks[seat!] !== null || !Number.isInteger(i) || i < 0 || i >= HWP_CFG.envelopes || state.picks.includes(i)) break;
      const picks = state.picks.map((p, s) => (s === seat ? i : p));
      next = state.players.every((p) => picks[p] !== null) ? beginTurn({ ...state, picks }, 1, 0) : { ...state, picks };
      break;
    }
    case 'pick': {
      if (state.phase !== 'pick' || !t || seat !== t.setter || typeof action.lock !== 'string' || !action.lock) break;
      next = toHint(state, { ...t, lock: action.lock });
      break;
    }
    case 'hint': {
      if (state.phase !== 'hint' || !t || seat !== t.setter || !isHwWord(action.word) || hwpUsed(t).includes(action.word)) break;
      const s = num(action.s);
      if (s === null || hwpHintsThisStage(t) >= HWP_CFG.maxHints) break;
      const hinted = { ...t, hints: [...t.hints, { w: action.word, s, stage: t.stage, by: 'set' as const }] };
      if (s >= HWP_CFG.cut) { next = toAnswer(state, hinted); break; }
      if (hwpHintsThisStage(hinted) < HWP_CFG.maxHints) { next = { ...state, t: hinted }; break; }
      // the fifth hint below the cut: the setter's page sends the closest word along with it
      const rev = action.rev && typeof action.rev.w === 'string' && num(action.rev.s) !== null && !hwpUsed(hinted).includes(action.rev.w) ? action.rev : null;
      next = toAnswer(state, rev ? { ...hinted, hints: [...hinted.hints, { w: rev.w, s: num(rev.s)!, stage: t.stage, by: 'reveal' }] } : hinted);
      break;
    }
    case 'reveal': {
      // only the setter's browser can ask the server for the closest word; without it the reveal times out to answers
      if (state.phase !== 'reveal' || !t || seat !== t.setter) break;
      const rev = action.rev && typeof action.rev.w === 'string' && num(action.rev.s) !== null && !hwpUsed(t).includes(action.rev.w) ? action.rev : null;
      next = toAnswer(state, rev ? { ...t, hints: [...t.hints, { w: rev.w, s: num(rev.s)!, stage: t.stage, by: 'reveal' }] } : t);
      break;
    }
    case 'answer': {
      if (state.phase !== 'answer' || !t || !playing || seat === t.setter || hwpAnswered(t).includes(seat!)) break;
      const words = action.words;
      if (!Array.isArray(words) || words.length < 1 || words.length > 2 || (words.length === 2 && (t.chance.includes(seat!) || words[0] === words[1]))) break;
      if (!words.every(isHwWord) || words.some((w) => hwpTaken(t).includes(w)) || !Array.isArray(action.s) || action.s.length !== words.length) break;
      const s = action.s.map(num);
      if (s.some((x) => x === null)) break;
      const answer: HwpAnswer = { seat: seat!, w: words, s: s as number[], stage: t.stage, ok: (s as number[]).some((x) => x >= 100) };
      const answered = { ...t, answers: [...t.answers, answer], chance: words.length === 2 ? [...t.chance, seat!] : t.chance };
      const all = hwpGuessers(state, t).every((g) => hwpAnswered(answered).includes(g));
      next = all ? resolve({ ...state, t: answered }) : { ...state, t: answered };
      break;
    }
    case 'word': {
      if (state.phase !== 'turnEnd' && state.phase !== 'finished') break;
      if (!t || seat !== t.setter || t.word || !isHwWord(action.word)) break;
      next = { ...state, t: { ...t, word: action.word } };
      break;
    }
    case 'next': {
      if (state.phase !== 'turnEnd' || !t || !playing) break;
      next = nextTurn(state);
      break;
    }
    case 'timeout': {
      if (!isHost || !t || now < state.deadline) break;
      if (state.phase === 'pick') next = toEnd(state, { ...t, solved: -1 });
      else if (state.phase === 'hint') next = { ...state, phase: 'reveal', deadline: now + HWP_CFG.revealMs };
      else if (state.phase === 'reveal') next = toAnswer(state, t);
      else if (state.phase === 'answer') next = resolve(state);
      else if (state.phase === 'turnEnd') next = nextTurn(state);
      break;
    }
  }
  return next ? bump(next) : null;
}

// ---- server calls (words stay on the server) ----
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc(name, args);
    return error ? null : (data as T);
  } catch { return null; }
}
export const hwpDeal = (players: number) => rpc<{ deal: string; envelopes: number; error?: string }>('hw_party_deal', { p_players: players });
/** My five words from envelope i (null: taken by someone else). `secret` stays in this browser. */
export const hwpClaim = (deal: string, i: number, secret: string) => rpc<string[] | null>('hw_party_claim', { p_deal: deal, p_envelope: i, p_secret: secret });
export const hwpLock = (deal: string, word: string, secret: string) => rpc<string | null>('hw_party_lock', { p_deal: deal, p_word: word, p_secret: secret });
/** Similarity of the setter's hint (null: refused; [null]: not a list word). */
export const hwpHint = (deal: string, lock: string, word: string) => rpc<(number | null)[]>('hw_party_hint', { p_lock: lock, p_secret: hwpMine(deal).secret, p_word: word });
/** The closest unused list word (setter only). */
export const hwpReveal = (deal: string, lock: string, used: string[]) => rpc<{ w: string; s: number } | null>('hw_party_reveal', { p_lock: lock, p_secret: hwpMine(deal).secret, p_used: used });
/** A guesser's answer: the numbers and whether it is right, from the server. */
export const hwpAnswer = (deal: string, lock: string, words: string[]) => rpc<{ s?: (number | null)[]; ok?: boolean; error?: string }>('hw_party_answer', { p_lock: lock, p_secret: hwpMine(deal).secret, p_words: words });

/** What this browser keeps for a deal: its secret, envelope and five words, and the words it has set so far. */
export type HwpMine = { secret: string; envelope: number | null; words: string[]; set: string[]; locks?: Record<string, string> };
const mineKey = (deal: string) => `puzzlthink_hwp_mine_${deal}`;
export function hwpMine(deal: string): HwpMine {
  try {
    const saved = JSON.parse(localStorage.getItem(mineKey(deal)) ?? 'null') as HwpMine | null;
    if (saved?.secret) return saved;
  } catch { /* private mode */ }
  const mine: HwpMine = { secret: `${crypto.randomUUID()}${crypto.randomUUID()}`, envelope: null, words: [], set: [] };
  hwpSaveMine(deal, mine);
  return mine;
}
export function hwpSaveMine(deal: string, mine: HwpMine) {
  try { localStorage.setItem(mineKey(deal), JSON.stringify(mine)); } catch { /* private mode: only this tab keeps it */ }
}
