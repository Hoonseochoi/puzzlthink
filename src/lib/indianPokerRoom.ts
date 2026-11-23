import { type PokerDifficulty, type PokerRound, type PokerSide, POKER_START_CHIPS, choosePokerAiAction, maxMatchableBet, pokerOther, pokerWinner, shufflePokerDeck } from './indianPoker';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const POKER_TURN_OPTIONS = [30, 20, 45] as const;
export type PokerTurnSeconds = (typeof POKER_TURN_OPTIONS)[number];
/** Long enough for the staged showdown: suspense, the flip, then the chips sliding to the winner. */
export const POKER_REVEAL_MS = 4200;

/** The latest bet or fold of the hand, for the table's speech bubble and chip flight. */
export type PokerLastAct = { side: PokerSide; kind: 'open' | 'raise' | 'call' | 'allIn' | 'fold'; total: number; add: number };

export type IndianPokerRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'reveal' | 'finished';
  ai: boolean[];
  aiLevel: PokerDifficulty;
  turnSec: PokerTurnSeconds;
  chips: [number, number];
  deck: number[];
  deckPos: number;
  cards: [number, number];
  bets: [number, number];
  carry: number;
  first: PokerSide;
  turn: PokerSide;
  opened: boolean;
  rounds: PokerRound[];
  winner: PokerSide | 'draw' | null;
  reason: 'chips' | 'resign' | 'timeout' | null;
  timeouts: [number, number];
  /** Optional: rooms saved before it existed simply have none. */
  lastAct?: PokerLastAct | null;
};

export type IndianPokerAction =
  | { t: 'config'; turnSec?: PokerTurnSeconds; aiLevel?: PokerDifficulty }
  | { t: 'start' }
  | { t: 'bet'; total: number }
  | { t: 'fold' }
  | { t: 'resign' }
  | { t: 'timeout' }
  | { t: 'ai' };

const clock = (state: Pick<IndianPokerRoom, 'turnSec'>) => Date.now() + state.turnSec * 1000;

export function createIndianPokerRoom(host: Peer, solo = false): IndianPokerRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, solo ? { id: 'ai-1', name: 'AI VEGA' } : null];
  const base: IndianPokerRoom = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, ai: [false, solo], aiLevel: 'normal', turnSec: 30,
    chips: [POKER_START_CHIPS, POKER_START_CHIPS], deck: [], deckPos: 0, cards: [0, 0], bets: [0, 0], carry: 0,
    first: 0, turn: 0, opened: false, rounds: [], winner: null, reason: null, timeouts: [0, 0], lastAct: null,
  };
  return solo ? startGame(base)! : base;
}

export const syncIndianPokerSeats = (state: IndianPokerRoom, peers: Peer[]) => syncSeats(state, peers);

function deal(state: IndianPokerRoom, first: PokerSide): IndianPokerRoom {
  let deck = state.deck;
  let deckPos = state.deckPos;
  if (deck.length !== 20 || deckPos + 2 > deck.length) { deck = shufflePokerDeck(); deckPos = 0; }
  const cards = [deck[deckPos], deck[deckPos + 1]] as [number, number];
  const next = { ...state, phase: 'playing' as const, deck, deckPos: deckPos + 2, cards, bets: [0, 0] as [number, number], first, turn: first, opened: false, lastAct: null };
  return { ...next, deadline: clock(next) };
}

function startGame(state: IndianPokerRoom): IndianPokerRoom | null {
  if (state.seats.some((seat) => !seat)) return null;
  const first = (Math.random() < 0.5 ? 0 : 1) as PokerSide;
  const next: IndianPokerRoom = {
    ...state, sid: newSid(), chips: [POKER_START_CHIPS, POKER_START_CHIPS], deck: shufflePokerDeck(), deckPos: 0,
    carry: 0, rounds: [], winner: null, reason: null, timeouts: [0, 0], first, turn: first, opened: false,
  };
  return deal(next, first);
}

function finishIfBroke(state: IndianPokerRoom): IndianPokerRoom {
  if (state.chips[0] > 0 && state.chips[1] > 0) return deal(state, pokerOther(state.first));
  const winner: PokerSide | 'draw' = state.chips[0] === state.chips[1] ? 'draw' : state.chips[0] > state.chips[1] ? 0 : 1;
  return { ...state, phase: 'finished', winner, reason: 'chips', deadline: 0 };
}

function reveal(state: IndianPokerRoom, winner: PokerSide | 'draw', reason: 'showdown' | 'fold', tenPenalty = false, penalty = 0): IndianPokerRoom {
  const pot = state.bets[0] + state.bets[1] + state.carry;
  const chips = [...state.chips] as [number, number];
  let carry = 0;
  if (winner === 'draw' && chips.every((stack) => stack > 0)) carry = pot;
  else if (winner === 'draw') {
    // An all-in tie cannot carry into a hand where one player has no chips to bet.
    // Split the tied pot so the match can continue without creating a zero-bet deadlock.
    chips[0] += pot / 2;
    chips[1] += pot / 2;
  }
  else chips[winner] += pot;
  const round: PokerRound = { cards: state.cards, first: state.first, bets: state.bets, winner, reason, tenPenalty, penalty, pot };
  return { ...state, phase: 'reveal', chips, carry, rounds: [...state.rounds, round], deadline: Date.now() + POKER_REVEAL_MS };
}

function bet(state: IndianPokerRoom, side: PokerSide, total: number): IndianPokerRoom | null {
  const current = Math.max(...state.bets);
  const max = maxMatchableBet(state.chips, state.bets);
  const minimum = state.opened ? current : 1;
  if (!Number.isInteger(total) || total < minimum || total > max || total < state.bets[side]) return null;
  if (state.opened && total === current && state.bets[side] === current) return null;
  const delta = total - state.bets[side];
  if (delta > state.chips[side]) return null;
  const chips = [...state.chips] as [number, number];
  const bets = [...state.bets] as [number, number];
  chips[side] -= delta;
  bets[side] = total;
  const timeouts = state.timeouts.map((n, i) => i === side ? 0 : n) as [number, number];
  const called = state.opened && bets[0] === bets[1];
  const kind: PokerLastAct['kind'] = called ? 'call' : total === max ? 'allIn' : state.opened ? 'raise' : 'open';
  const lastAct: PokerLastAct = { side, kind, total, add: delta };
  if (called) return reveal({ ...state, chips, bets, timeouts, lastAct }, pokerWinner(state.cards), 'showdown');
  const next = { ...state, chips, bets, opened: true, turn: pokerOther(side), timeouts, lastAct };
  return { ...next, deadline: clock(next) };
}

function fold(state: IndianPokerRoom, side: PokerSide): IndianPokerRoom {
  const winner = pokerOther(side);
  const tenPenalty = state.cards[side] === 10;
  let penalty = 0;
  let base: IndianPokerRoom = { ...state, lastAct: { side, kind: 'fold', total: state.bets[side], add: 0 } };
  if (tenPenalty) {
    const chips = [...state.chips] as [number, number];
    penalty = Math.min(10, chips[side]);
    chips[side] -= penalty;
    chips[winner] += penalty;
    base = { ...base, chips };
  }
  return reveal(base, winner, 'fold', tenPenalty, penalty);
}

export function reduceIndianPokerRoom(state: IndianPokerRoom, action: IndianPokerAction, seat: number | null, isHost: boolean): IndianPokerRoom | null {
  let next: IndianPokerRoom | null = null;
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'reveal' || (state.phase === 'playing' && (state.rounds.length > 0 || state.opened || state.bets.some((n) => n > 0)))) break;
      next = {
        ...state,
        turnSec: action.turnSec && (POKER_TURN_OPTIONS as readonly number[]).includes(action.turnSec) ? action.turnSec : state.turnSec,
        aiLevel: action.aiLevel ?? state.aiLevel,
      };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing' || state.phase === 'reveal') break;
      next = startGame(state);
      break;
    case 'bet':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1) || state.ai[seat] || state.turn !== seat) break;
      next = bet(state, seat, action.total);
      break;
    case 'fold':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1) || state.ai[seat] || state.turn !== seat || !state.opened || state.bets[pokerOther(seat)] <= state.bets[seat]) break;
      next = fold(state, seat);
      break;
    case 'ai': {
      if (!isHost || state.phase !== 'playing' || !state.ai[state.turn]) break;
      const me = state.turn;
      const handsInDeck = Math.max(0, (state.deckPos - 2) / 2);
      const choice = choosePokerAiAction({
        opponentCard: state.cards[pokerOther(me)], usedCards: [...state.rounds.slice(-handsInDeck).flatMap((round) => round.cards), state.cards[pokerOther(me)]],
        chips: state.chips, bets: state.bets, carry: state.carry, me, level: state.aiLevel, canCheck: state.opened,
      });
      next = choice.t === 'fold' ? fold(state, me) : bet(state, me, choice.total);
      break;
    }
    case 'resign':
      if ((state.phase !== 'playing' && state.phase !== 'reveal') || (seat !== 0 && seat !== 1)) break;
      next = { ...state, phase: 'finished', winner: pokerOther(seat), reason: 'resign', deadline: 0 };
      break;
    case 'timeout':
      if (!isHost || Date.now() < state.deadline) break;
      if (state.phase === 'reveal') { next = finishIfBroke(state); break; }
      if (state.phase !== 'playing') break;
      if (state.timeouts[state.turn] >= 2) next = { ...state, phase: 'finished', winner: pokerOther(state.turn), reason: 'timeout', deadline: 0 };
      else {
        const late = state.turn;
        const timeouts = state.timeouts.map((n, i) => i === late ? n + 1 : n) as [number, number];
        next = fold({ ...state, timeouts }, late);
      }
      break;
  }
  return next ? bump(next) : null;
}

export const indianPokerAutoAction = (state: IndianPokerRoom): IndianPokerAction | null =>
  state.phase === 'playing' && state.ai[state.turn] ? { t: 'ai' } : null;

/** Guests are seat 1: they may see seat 0's forehead card, never their own or the shuffled deck. */
export function redactIndianPoker(state: IndianPokerRoom): IndianPokerRoom {
  if (state.phase !== 'playing') return { ...state, deck: [] };
  return { ...state, deck: [], cards: [state.cards[0], -1] };
}
