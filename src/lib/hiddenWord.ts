// 히든 워드 AI match: the server (hw_* functions) runs the game, the browser only shows it.
import { getSupabase } from './supabase';

export type HwHint = { w: string; s: number; stage: number; by: 'me' | 'ai' | 'reveal' };
export type HwGuess = { w: string[]; s: number[]; stage: number; by: 'me' | 'ai'; ok: boolean };
/** One turn: `set` = I hide a word and the AI guesses, `guess` = the AI hides one and I guess. */
export type HwTurn = {
  kind: 'set' | 'guess'; word?: string; stage: number; hints: HwHint[]; guesses: HwGuess[];
  chance: boolean; me: number; ai: number; solved?: number; round?: number;
};
export type HwCfg = { cut: number; stages: number; maxHints: number; setPoints: number[]; guessPoints: number[]; hintSecs: number; guessSecs: number };
export type HwPhase = 'envelope' | 'pick' | 'hint' | 'guess' | 'turnEnd' | 'over';
export type HwView = {
  id: string; phase: HwPhase; hand: string[]; envelope?: number; first: 'set' | 'guess';
  round: number; turnNo: number; me: number; ai: number; t?: HwTurn; history: HwTurn[];
  deadline: number | null; now: number; cfg: HwCfg; recorded?: boolean;
  /** Why the last word was refused (nothing changed). */
  error?: 'invalid' | 'secret' | 'duplicate' | 'unknown' | 'missing' | 'unavailable'; word?: string;
};
export type HwAction =
  | { t: 'envelope'; i: number } | { t: 'pick'; word: string } | { t: 'hint'; word: string }
  | { t: 'guess'; words: string[] } | { t: 'timeout' } | { t: 'next' };
export type HwRankRow = { rank: number; nickname: string; avatar_url: string | null; points: number; games: number; best: number; wins: number; is_me: boolean };

export const HW_ENVELOPES = 6;
export const isHwWord = (word: string) => /^[가-힣]{1,8}$/.test(word);
export const hwClean = (word: string) => word.trim().normalize('NFC');

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc(name, args);
    return error ? null : (data as T);
  } catch { return null; }
}

export const hwStart = () => rpc<HwView>('hw_start', {});
export const hwState = (game: string) => rpc<HwView | null>('hw_state', { p_game: game });
export const hwAct = (game: string, action: HwAction) => rpc<HwView>('hw_act', { p_game: game, p_action: action });
export const hwRanking = (limit = 20) => rpc<HwRankRow[]>('hw_ranking', { p_limit: limit });

/** Everything shown on the clue board, in the order it happened: each stage's hints, then its answer. */
export type HwEntry = { key: string; stage: number } & ({ hint: HwHint } | { guess: HwGuess });
export function hwTimeline(turn: HwTurn | undefined, stages: number): HwEntry[] {
  if (!turn) return [];
  const out: HwEntry[] = [];
  for (let stage = 1; stage <= stages; stage++) {
    turn.hints.forEach((hint, i) => { if (hint.stage === stage) out.push({ key: `h${i}`, stage, hint }); });
    turn.guesses.forEach((guess, i) => { if (guess.stage === stage) out.push({ key: `g${i}`, stage, guess }); });
  }
  return out;
}

/** Colour of a similarity number: cold when far, hot at the cut. */
export function hwHeat(score: number, cut = 95): string {
  if (score >= cut) return '#ff5d73';
  if (score >= 90) return '#ffc857';
  if (score >= 80) return '#a8ef70';
  if (score >= 60) return '#3fd0c9';
  if (score >= 40) return '#5aa9e6';
  return '#6b7388';
}
