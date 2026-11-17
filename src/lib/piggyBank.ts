// 돼지 저금통 (draft). Four players each own a slot under the table (아래칸) and one on it (위칸).
// Only the player whose turn it is holds a pig on the table. On their turn they put 1–5 coins
// (black/white) into the pig under the table, say truthfully what they put in, and hand that pig to
// another player, where it goes on the table; their own table pig drops into their under slot.
// The receiver must say how many coins of the asked colour (black, white, black, …) the pig holds.
// Others may doubt the answer: the pig is opened and leaves the game. A right doubt: doubter +1,
// answerer −1; a wrong doubt: doubter −1. The player who lost a point gets a new pig (1 black,
// 1 white) on the table and takes the next turn; with no doubt the receiver takes it.
// Three reset votes restart every pig; first, anyone who did not vote may try to name every pig's
// coins (+3 / −2). The game ends when someone reaches 5 points; players are ranked by score.

export const PB_PLAYERS = 4;
export const PB_WIN = 5;
export const PB_MAX_PUT = 5;
export const ANSWER_MS = 20_000;
export const PUT_MS = 30_000; // time to put coins and pick who gets the pig
export const DOUBT_MS = 5_000; // the doubt window right after an answer
export const RESET_VOTES = 3;
export const ALLIN_MS = 45_000; // time to fill in every pig before the reset

export type Color = 'black' | 'white';
export type Pig = { id: number; label: number; black: number; white: number };
export type PbPlayer = { name: string; ai: boolean; score: number; upper: number | null; lower: number | null; resetVote: boolean };
export type PbEvent =
  | { k: 'put'; seat: number; to: number; pig: number; black: number; white: number }
  | { k: 'answer'; seat: number; pig: number; color: Color; value: number }
  | { k: 'doubt'; seat: number; target: number; pig: number; label: number; color: Color; value: number; actual: number; right: boolean; pigBlack: number; pigWhite: number }
  | { k: 'pass'; seat: number } // nobody doubted
  | { k: 'allIn'; seat: number; right: boolean; pigs: { label: number; black: number; white: number }[] }
  | { k: 'reset' };

export type PbState = {
  players: PbPlayer[];
  pigs: Record<number, Pig>;
  nextId: number;
  nextLabel: number;
  order: number[]; // turn order drawn at the start (used for display and ties)
  turn: number; // seat holding a pig on the table
  phase: 'put' | 'answer' | 'doubt' | 'allIn' | 'finished';
  ask: Color; // colour asked next
  answer: { seat: number; pig: number; color: Color; value: number } | null;
  deadline: number;
  allInSeats: number[]; // non-voters who may still try the all-pigs guess before a reset
  resume: 'put' | 'answer' | 'doubt' | null; // where play continues after a reset
  last: PbEvent | null; // the latest public event (shown briefly, never as a log)
  seq: number;
};

const newPig = (state: PbState, black = 1, white = 1): [PbState, number] => {
  const id = state.nextId;
  const pig: Pig = { id, label: state.nextLabel, black, white };
  return [{ ...state, pigs: { ...state.pigs, [id]: pig }, nextId: id + 1, nextLabel: state.nextLabel + 1 }, id];
};

export function createPiggyBank(names: string[], ai: boolean[], now = Date.now()): PbState {
  const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  let state: PbState = {
    players: names.map((name, i) => ({ name, ai: ai[i], score: 0, upper: null, lower: null, resetVote: false })),
    pigs: {}, nextId: 1, nextLabel: 1, order, turn: order[0], phase: 'put', ask: 'black', answer: null,
    deadline: 0, allInSeats: [], resume: null, last: null, seq: 0,
  };
  // Pigs 1–4 go under each player's table slot in turn order; pig 5 goes on the first player's table.
  for (const seat of order) {
    const [next, id] = newPig(state);
    state = next;
    state.players = state.players.map((p, i) => (i === seat ? { ...p, lower: id } : p));
  }
  const [next, id] = newPig(state);
  state = { ...next, players: next.players.map((p, i) => (i === order[0] ? { ...p, upper: id } : p)) };
  return { ...state, deadline: now + PUT_MS };
}

const setPlayer = (state: PbState, seat: number, patch: Partial<PbPlayer>): PbState =>
  ({ ...state, players: state.players.map((p, i) => (i === seat ? { ...p, ...patch } : p)) });
const bump = (state: PbState, event: PbEvent): PbState => ({ ...state, last: event, seq: state.seq + 1 });
const flip = (c: Color): Color => (c === 'black' ? 'white' : 'black');
const over = (state: PbState) => state.players.some((p) => p.score >= PB_WIN);

/** The turn player puts coins in the pig under their table and hands it to `to`. */
export function putCoins(state: PbState, seat: number, black: number, white: number, to: number, now = Date.now()): PbState | null {
  const me = state.players[seat];
  const total = black + white;
  if (state.phase !== 'put' || seat !== state.turn || to === seat || !state.players[to] || me.lower === null) return null;
  if (!Number.isInteger(black) || !Number.isInteger(white) || black < 0 || white < 0 || total < 1 || total > PB_MAX_PUT) return null;
  const pigId = me.lower;
  const pig = state.pigs[pigId];
  let next: PbState = { ...state, pigs: { ...state.pigs, [pigId]: { ...pig, black: pig.black + black, white: pig.white + white } } };
  next = setPlayer(next, seat, { lower: me.upper, upper: null });
  next = setPlayer(next, to, { upper: pigId });
  return bump({ ...next, phase: 'answer', turn: to, answer: null, deadline: now + ANSWER_MS }, { k: 'put', seat, to, pig: pigId, black, white });
}

/** The receiver names the count of the asked colour in their table pig. */
export function answerCount(state: PbState, seat: number, value: number, now = Date.now()): PbState | null {
  const pigId = state.players[seat]?.upper;
  if (state.phase !== 'answer' || seat !== state.turn || pigId == null || !Number.isInteger(value) || value < 0) return null;
  const answer = { seat, pig: pigId, color: state.ask, value };
  return bump({ ...state, phase: 'doubt', answer, deadline: now + DOUBT_MS }, { k: 'answer', ...answer });
}

/** Someone doubts the answer: the pig is opened and leaves the game. */
export function doubt(state: PbState, seat: number, now = Date.now()): PbState | null {
  const a = state.answer;
  if (state.phase !== 'doubt' || !a || seat === a.seat) return null;
  const pig = state.pigs[a.pig];
  const actual = pig[a.color];
  const right = actual !== a.value;
  let next = setPlayer(state, a.seat, { upper: null });
  next = { ...next, pigs: Object.fromEntries(Object.entries(next.pigs).filter(([id]) => Number(id) !== a.pig)) };
  next = setPlayer(next, seat, { score: next.players[seat].score + (right ? 1 : -1) });
  if (right) next = setPlayer(next, a.seat, { score: next.players[a.seat].score - 1 });
  const loser = right ? a.seat : seat;
  const event: PbEvent = { k: 'doubt', seat, target: a.seat, pig: a.pig, label: pig.label, color: a.color, value: a.value, actual, right, pigBlack: pig.black, pigWhite: pig.white };
  if (over(next)) return bump({ ...next, phase: 'finished', answer: null }, event);
  const [withPig, id] = newPig(next);
  next = setPlayer(withPig, loser, { upper: id });
  return bump({ ...next, phase: 'put', turn: loser, ask: flip(a.color), answer: null, deadline: now + PUT_MS }, event);
}

/** Nobody doubted in time: the receiver keeps the turn and the asked colour flips. */
export function noDoubt(state: PbState, now = Date.now()): PbState | null {
  if (state.phase !== 'doubt' || !state.answer) return null;
  return bump({ ...state, phase: 'put', ask: flip(state.answer.color), answer: null, deadline: now + PUT_MS }, { k: 'pass', seat: state.answer.seat });
}

/** Timed out answering: counts as answering 0 (others can still doubt it). */
export const answerTimeout = (state: PbState, now = Date.now()) => answerCount(state, state.turn, 0, now);

/** A reset vote. At three votes, non-voters get one chance at the all-pigs guess, then every pig restarts. */
export function voteReset(state: PbState, seat: number): PbState | null {
  if (state.phase === 'finished' || state.phase === 'allIn' || state.players[seat].resetVote) return null;
  const next = setPlayer(state, seat, { resetVote: true });
  if (next.players.filter((p) => p.resetVote).length < RESET_VOTES) return { ...next, seq: next.seq + 1 };
  const allInSeats = next.players.flatMap((p, i) => (p.resetVote ? [] : [i]));
  return { ...next, phase: 'allIn', allInSeats, resume: state.phase, deadline: Date.now() + ALLIN_MS, seq: next.seq + 1 };
}

/** A non-voter guesses every pig (black and white): +3 if all right, −2 otherwise. Null guess = pass. */
export function allInGuess(state: PbState, seat: number, guess: Record<number, { black: number; white: number }> | null): PbState | null {
  if (state.phase !== 'allIn' || !state.allInSeats.includes(seat)) return null;
  let next: PbState = { ...state, allInSeats: state.allInSeats.filter((s) => s !== seat) };
  if (guess) {
    const right = Object.values(state.pigs).every((pig) => guess[pig.id]?.black === pig.black && guess[pig.id]?.white === pig.white);
    const pigs = Object.values(state.pigs).map((p) => ({ label: p.label, black: p.black, white: p.white }));
    next = bump(setPlayer(next, seat, { score: next.players[seat].score + (right ? 3 : -2) }), { k: 'allIn', seat, right, pigs });
    if (over(next)) return { ...next, phase: 'finished' };
  }
  return next; // once nobody is left to guess, finishReset() restarts the pigs (after the result is shown)
}

/** Everyone eligible has guessed (or passed): restart every pig. */
export const finishReset = (state: PbState): PbState | null => (state.phase === 'allIn' && !state.allInSeats.length ? resetPigs(state) : null);

/** Every pig goes back to 1 black, 1 white; the turn player keeps a pig on the table. */
function resetPigs(state: PbState, now = Date.now()): PbState {
  const pigs: Record<number, Pig> = {};
  for (const pig of Object.values(state.pigs)) pigs[pig.id] = { ...pig, black: 1, white: 1 };
  const players = state.players.map((p) => ({ ...p, resetVote: false }));
  const phase = state.resume ?? 'put';
  return bump({ ...state, pigs, players, phase, resume: null, allInSeats: [], deadline: now + (phase === 'doubt' ? DOUBT_MS : phase === 'put' ? PUT_MS : ANSWER_MS) }, { k: 'reset' });
}

/** Final order: higher score first, then earlier in the drawn turn order. */
export const ranking = (state: PbState) =>
  state.players.map((p, i) => i).sort((a, b) => state.players[b].score - state.players[a].score || state.order.indexOf(a) - state.order.indexOf(b));

// ---------------------------------------------------------------------------------------------
// AI memory. Each AI keeps its own idea of every pig. When a coin drop is announced it remembers it
// with some chance; otherwise it misremembers by one coin and becomes unsure about that pig.

export type Memory = Record<number, { black: number; white: number; unsure: number }>;
export type PbLevel = 'easy' | 'normal' | 'hard';
const RECALL: Record<PbLevel, number> = { easy: 0.62, normal: 0.8, hard: 0.93 };

export function freshMemory(state: PbState): Memory {
  return Object.fromEntries(Object.values(state.pigs).map((p) => [p.id, { black: p.black, white: p.white, unsure: 0 }]));
}

/** Update one AI's memory with the latest public event. */
export function remember(memory: Memory, state: PbState, level: PbLevel, rand = Math.random): Memory {
  const m: Memory = { ...memory };
  for (const pig of Object.values(state.pigs)) if (!m[pig.id]) m[pig.id] = { black: pig.black, white: pig.white, unsure: 0 }; // new pigs start 1/1, known
  const e = state.last;
  if (e?.k === 'put') {
    const was = m[e.pig] ?? { black: 1, white: 1, unsure: 0 };
    const slip = () => (rand() < RECALL[level] ? 0 : rand() < 0.5 ? -1 : 1);
    const db = slip(), dw = slip();
    m[e.pig] = { black: Math.max(0, was.black + e.black + db), white: Math.max(0, was.white + e.white + dw), unsure: was.unsure + (db || dw ? 1 : 0) };
  }
  if (e?.k === 'reset') for (const id of Object.keys(m)) m[Number(id)] = { black: 1, white: 1, unsure: 0 };
  for (const id of Object.keys(m)) if (!state.pigs[Number(id)]) delete m[Number(id)];
  return m;
}

/** What the AI puts in and whom it hands the pig to. */
export function aiPut(state: PbState, seat: number, rand = Math.random): { black: number; white: number; to: number } {
  const total = 1 + Math.floor(rand() * PB_MAX_PUT);
  const black = Math.floor(rand() * (total + 1));
  const others = state.players.map((_, i) => i).filter((i) => i !== seat);
  // Prefer the current leader (harder for them to keep up), otherwise anyone.
  const leader = [...others].sort((a, b) => state.players[b].score - state.players[a].score)[0];
  const to = rand() < 0.45 ? leader : others[Math.floor(rand() * others.length)];
  return { black, white: total - black, to };
}

export const aiAnswer = (state: PbState, seat: number, memory: Memory) => {
  const pig = state.players[seat].upper!;
  return memory[pig]?.[state.ask] ?? 1;
};

/** Whether the AI doubts an answer: when its memory disagrees and it feels sure enough. */
export function aiDoubts(state: PbState, memory: Memory, rand = Math.random) {
  const a = state.answer;
  if (!a) return false;
  const known = memory[a.pig];
  if (!known || known[a.color] === a.value) return false;
  const sureness = known.unsure === 0 ? 0.8 : known.unsure === 1 ? 0.12 : 0.03;
  return rand() < sureness;
}

/** The AI tries the all-pigs guess only when it is sure of every pig. */
export const aiAllIn = (state: PbState, memory: Memory) =>
  Object.values(state.pigs).every((p) => memory[p.id]?.unsure === 0) ? Object.fromEntries(Object.values(state.pigs).map((p) => [p.id, { black: memory[p.id].black, white: memory[p.id].white }])) : null;
