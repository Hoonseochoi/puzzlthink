// Shared room for 히든 워드 with a friend (1:1). Seat 0 is the host. Same match as against MORA: each player
// picks an envelope of five words; four turns (two rounds, round 2 doubled) in which one sets a hidden word and
// gives hints, the other guesses. Similarity numbers come from the server (hw_room_* functions): the player who
// acts asks for them and sends them with the action, the host checks the rest. Friends may see the state; the
// screen only hides the hidden word from the guesser.
import { getSupabase } from './supabase';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import { HW_ENVELOPES, type HwLevel, isHwWord } from './hiddenWord';

export const HWR_SEATS = 2;
export const HWR_CFG = { cut: 95, stages: 3, maxHints: 5, setPoints: [1, 2, 3], guessPoints: [6, 3, 1], hintSecs: 120, guessSecs: 75 } as const;
export const REVEAL_WAIT_MS = 10_000; // the host fetches the closest word; past this the round goes on without it

export type HwrHint = { w: string; s: number; stage: number; by: 'set' | 'reveal' };
export type HwrGuess = { w: string[]; s: number[]; stage: number; ok: boolean };
export type HwrTurn = {
  setter: number; word: string; lock: string; stage: number; hints: HwrHint[]; guesses: HwrGuess[];
  chance: boolean; gained: number[]; solved?: number; round: number;
};
export type HwrRoom = BaseRoom & {
  phase: 'lobby' | 'envelope' | 'pick' | 'hint' | 'reveal' | 'guess' | 'turnEnd' | 'finished';
  deal: string; envelopes: string[][]; picks: (number | null)[]; hands: string[][];
  first: number; round: number; turnNo: number; setter: number;
  t: HwrTurn | null; history: HwrTurn[]; scores: number[];
  /** The word set: 히든 워드 rooms are 기본, 확장판 rooms 확장 (set when the room is made); missing in rooms saved before levels: 기본. */
  level?: HwLevel;
};

export type HwrAction =
  | { t: 'start'; deal?: string; envelopes?: string[][] }
  | { t: 'envelope'; i: number }
  | { t: 'pick'; word: string; lock: string }
  | { t: 'hint'; word: string; s: number; rev?: { w: string; s: number } | null }
  | { t: 'reveal'; rev: { w: string; s: number } | null }
  | { t: 'guess'; words: string[]; s: number[] }
  | { t: 'next' }
  | { t: 'timeout' };

export function createHwrRoom(host: Peer, level: HwLevel = 'basic'): HwrRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    deal: '', envelopes: [], picks: [null, null], hands: [[], []], first: 0, round: 1, turnNo: 0, setter: 0,
    t: null, history: [], scores: [0, 0], level,
  };
}

export const syncHwrSeats = (state: HwrRoom, peers: Peer[]) => syncSeats(state, peers);
/** Setter of a turn: the first setter opens round 1, and round 2 swaps the order. */
export const setterOf = (first: number, round: number, turnNo: number) => (first + turnNo + (round - 1)) % 2;
const other = (seat: number) => 1 - seat;
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100 ? Math.round(v * 10) / 10 : null);
const used = (t: HwrTurn) => [...t.hints.map((h) => h.w), ...t.guesses.flatMap((g) => g.w)];
const hintsThisStage = (t: HwrTurn) => t.hints.filter((h) => h.stage === t.stage && h.by === 'set').length;

function beginTurn(state: HwrRoom, round: number, turnNo: number): HwrRoom {
  return { ...state, phase: 'pick', deadline: 0, round, turnNo, setter: setterOf(state.first, round, turnNo), t: null };
}
const toGuess = (state: HwrRoom, t: HwrTurn): HwrRoom => ({ ...state, t, phase: 'guess', deadline: Date.now() + HWR_CFG.guessSecs * 1000 });
const toHint = (state: HwrRoom, t: HwrTurn): HwrRoom => ({ ...state, t, phase: 'hint', deadline: Date.now() + HWR_CFG.hintSecs * 1000 });
/** Out of hints or time below the cut: the host looks up the closest word, then the guesser answers. */
const toReveal = (state: HwrRoom, t: HwrTurn): HwrRoom => ({ ...state, t, phase: 'reveal', deadline: Date.now() + REVEAL_WAIT_MS });

function answer(state: HwrRoom, words: string[], s: number[]): HwrRoom {
  const t = state.t!;
  const ok = words.includes(t.word);
  const guesser = other(t.setter);
  const guesses = [...t.guesses, { w: words, s, stage: t.stage, ok }];
  const chance = t.chance && words.length < 2;
  if (ok) {
    const n = HWR_CFG.guessPoints[t.stage - 1] * state.round;
    const gained = t.gained.map((g, i) => (i === guesser ? g + n : g));
    return { ...state, phase: 'turnEnd', deadline: 0, scores: state.scores.map((x, i) => (i === guesser ? x + n : x)), t: { ...t, guesses, chance, gained, solved: t.stage } };
  }
  const n = HWR_CFG.setPoints[t.stage - 1] * state.round;
  const gained = t.gained.map((g, i) => (i === t.setter ? g + n : g));
  const scores = state.scores.map((x, i) => (i === t.setter ? x + n : x));
  if (t.stage >= HWR_CFG.stages) return { ...state, phase: 'turnEnd', deadline: 0, scores, t: { ...t, guesses, chance, gained, solved: 0 } };
  return toHint({ ...state, scores }, { ...t, guesses, chance, gained, stage: t.stage + 1 });
}

export function reduceHwrRoom(state: HwrRoom, action: HwrAction, seat: number | null, isHost: boolean): HwrRoom | null {
  let next: HwrRoom | null = null;
  const now = Date.now();
  const playing = seat === 0 || seat === 1;
  const t = state.t;
  switch (action.t) {
    case 'start': {
      if (!isHost || (state.phase !== 'lobby' && state.phase !== 'finished') || state.seats.some((s) => !s)) break;
      const envs = action.envelopes;
      if (typeof action.deal !== 'string' || !Array.isArray(envs) || envs.length !== HW_ENVELOPES || !envs.every((e) => Array.isArray(e) && e.length === 5 && e.every((w) => typeof w === 'string'))) break;
      next = {
        ...state, sid: newSid(), phase: 'envelope', deadline: 0, deal: action.deal, envelopes: envs, picks: [null, null], hands: [[], []],
        first: Math.random() < 0.5 ? 0 : 1, round: 1, turnNo: 0, setter: 0, t: null, history: [], scores: [0, 0],
      };
      break;
    }
    case 'envelope': {
      const i = action.i;
      if (state.phase !== 'envelope' || !playing || state.picks[seat!] !== null || !Number.isInteger(i) || i < 0 || i >= HW_ENVELOPES || state.picks.includes(i)) break;
      const picks = state.picks.map((p, s) => (s === seat ? i : p));
      const hands = state.hands.map((h, s) => (s === seat ? [...state.envelopes[i]] : h));
      next = picks.every((p) => p !== null) ? beginTurn({ ...state, picks, hands }, 1, 0) : { ...state, picks, hands };
      break;
    }
    case 'pick': {
      if (state.phase !== 'pick' || seat !== state.setter || !state.hands[seat].includes(action.word) || typeof action.lock !== 'string' || !action.lock) break;
      const hands = state.hands.map((h, s) => (s === seat ? h.filter((w) => w !== action.word) : h));
      next = toHint({ ...state, hands }, { setter: seat, word: action.word, lock: action.lock, stage: 1, hints: [], guesses: [], chance: true, gained: [0, 0], round: state.round });
      break;
    }
    case 'hint': {
      const s = num(action.s);
      if (state.phase !== 'hint' || !t || seat !== t.setter || s === null || !isHwWord(action.word) || action.word === t.word || used(t).includes(action.word)) break;
      if (hintsThisStage(t) >= HWR_CFG.maxHints) break;
      const hinted: HwrTurn = { ...t, hints: [...t.hints, { w: action.word, s, stage: t.stage, by: 'set' }] };
      if (s >= HWR_CFG.cut) { next = toGuess(state, hinted); break; }
      if (hintsThisStage(hinted) < HWR_CFG.maxHints) { next = { ...state, t: hinted }; break; }
      // the last hint missed the cut: the setter sent the closest word with it
      const rev = action.rev && typeof action.rev.w === 'string' && num(action.rev.s) !== null && !used(hinted).includes(action.rev.w) ? action.rev : null;
      next = toGuess(state, rev ? { ...hinted, hints: [...hinted.hints, { w: rev.w, s: num(rev.s)!, stage: t.stage, by: 'reveal' }] } : hinted);
      break;
    }
    case 'reveal': {
      if (state.phase !== 'reveal' || !t || !isHost) break;
      const rev = action.rev && typeof action.rev.w === 'string' && num(action.rev.s) !== null && !used(t).includes(action.rev.w) ? action.rev : null;
      next = toGuess(state, rev ? { ...t, hints: [...t.hints, { w: rev.w, s: num(rev.s)!, stage: t.stage, by: 'reveal' }] } : t);
      break;
    }
    case 'guess': {
      if (state.phase !== 'guess' || !t || seat !== other(t.setter) || !Array.isArray(action.words) || !Array.isArray(action.s)) break;
      const words = action.words;
      if (words.length < 1 || words.length > 2 || (words.length === 2 && (!t.chance || words[0] === words[1]))) break;
      if (!words.every(isHwWord) || words.some((w) => used(t).includes(w)) || action.s.length !== words.length) break;
      const s = action.s.map(num);
      if (s.some((x) => x === null)) break;
      next = answer(state, words, s as number[]);
      break;
    }
    case 'next': {
      if (state.phase !== 'turnEnd' || !t || !playing) break;
      const done = { ...state, history: [...state.history, t] };
      if (state.turnNo === 0) next = beginTurn(done, state.round, 1);
      else if (state.round === 1) next = beginTurn(done, 2, 0);
      else next = { ...done, phase: 'finished', deadline: 0, t: null };
      break;
    }
    case 'timeout': {
      if (!isHost || !t || now < state.deadline) break;
      if (state.phase === 'hint') {
        // below the cut when time runs out: the closest word comes from the server (or a stage with no hints just goes on)
        next = toReveal(state, t);
      } else if (state.phase === 'reveal') next = toGuess(state, t);
      else if (state.phase === 'guess') next = answer(state, [], []);
      break;
    }
  }
  return next ? bump(next) : null;
}

// ---- server calls (similarity stays on the server) ----
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc(name, args);
    return error ? null : (data as T);
  } catch { return null; }
}
export const hwrDeal = (level: HwLevel = 'basic') => rpc<{ deal: string; envelopes: string[][]; error?: string }>('hw_room_deal', level === 'basic' ? {} : { p_level: level });
export const hwrLock = (deal: string, word: string) => rpc<string>('hw_room_lock', { p_deal: deal, p_word: word });
/** Similarity of each word to the locked hidden word (null: not in the dictionary). Null when the server refused. */
export const hwrScore = (lock: string, words: string[]) => rpc<(number | null)[]>('hw_room_score', { p_lock: lock, p_words: words });
export const hwrReveal = (lock: string, usedWords: string[]) => rpc<{ w: string; s: number } | null>('hw_room_reveal', { p_lock: lock, p_used: usedWords });
export const hwrUsed = used;
export const hwrHintsLeft = (t: HwrTurn) => HWR_CFG.maxHints - hintsThisStage(t);
