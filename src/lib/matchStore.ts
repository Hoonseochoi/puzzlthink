import type { GameId, GameResult } from './stats';

/**
 * The friend / open match this page is in, for the shared match pieces (VS intro, winner on the result screen).
 * `useRealtimeRoom` publishes it once a room leaves its lobby; `reportGame` adds my result when the match ends.
 * Nothing here is fetched: names and seats come from the room state, account ids from Realtime presence.
 */
export type MatchPlayer = { seat: number; name: string; uid?: string; me: boolean };
export type Match = {
  key: string; // channel-code-sid: one per match (a rematch gets a new sid)
  game: GameId | null;
  players: MatchPlayer[]; // seated humans, in seat order (AI seats left out)
  clock: boolean; // whether the turn clock was already running when this client first saw the match
  sawLobby: boolean; // whether this client saw the lobby of this room before the match began
};
export type MatchResult = { key: string; result: GameResult };

let match: Match | null = null;
let result: MatchResult | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

export const subscribeMatch = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getMatch = () => match;
export const getMatchResult = () => result;
export const getNoMatch = () => null;

export function setMatch(next: Match | null) {
  if (next && match && next.key === match.key) {
    // Same match: keep the first look (clock / lobby), only follow seat names.
    if (JSON.stringify(next.players) === JSON.stringify(match.players)) return;
    match = { ...match, players: next.players };
  } else {
    match = next;
    if (result && result.key !== next?.key) result = null;
  }
  emit();
}

/** Called by reportGame for a friend/open result: the match that is on now ended this way for me. */
export function setMatchResult(r: GameResult) {
  if (!match) return;
  if (result?.key === match.key && result.result === r) return;
  result = { key: match.key, result: r };
  emit();
}

// Room channel ('flip-omok-room') → game id, for the "이 게임 1위" line. Most are the channel with _ for -.
const CHANNEL_GAME: Record<string, GameId> = {
  'slither-room': 'slitherlink', 'morris-room': 'nine_mens_morris', 'hidden-word-party-room': 'hidden_word_plus',
};
export function gameOfChannel(channel: string): GameId | null {
  if (CHANNEL_GAME[channel]) return CHANNEL_GAME[channel];
  const id = channel.replace(/-room$/, '').replace(/-/g, '_');
  return /^[a-z0-9_]+$/.test(id) ? (id as GameId) : null;
}

// Matches whose intro already played in this browser (so a refresh or reconnect mid-game does not replay it).
const SEEN_KEY = 'puzzlthink_vs_seen';
export function introSeen(key: string): boolean {
  try { return (JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') as string[]).includes(key); } catch { return true; }
}
export function markIntroSeen(key: string) {
  try {
    const list = (JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') as string[]).filter((k) => k !== key);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...list, key].slice(-40)));
  } catch { /* Storage is optional. */ }
}
