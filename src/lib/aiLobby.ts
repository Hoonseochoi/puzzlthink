// Open-room invites to people playing the AI.
//
// While a player is in an AI (or solo) game of X, their tab is a presence member of the Realtime channel
// `ai-lobby-<X>`. The presence key is a random id made per tab (never a user id) and the tracked payload is
// empty, so the channel shows only how many are playing. An open room's host counts the members (listening,
// not tracked) and may broadcast an invite on that channel: just the room code. Receivers check the code
// against the public open-room list before showing anything, and take the host's name, the seats left and
// the room's variant from that list, not from the message. No database writes, nothing on the Worker.
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { GameId } from './gameCatalog';
import { isRoomCode } from './room';
import { listOpenRooms } from './openRooms';
import { getSupabase } from './supabase';

export const lobbyTopic = (game: string) => `ai-lobby-${game}`;

export const INVITE_MS = 60_000; // an invite lasts this long
export const INVITE_COOLDOWN_MS = 60_000; // one send per room per minute
export const INVITE_MAX = 5; // sends per room
const HIDDEN_MS = 30_000; // a tab hidden this long leaves presence until it is visible again
const CHECK_GAP_MS = 4_000; // receivers check the open-room list at most this often

/** A verified invite, as shown in the popup. */
export type Invite = { game: GameId; code: string; variant: number; host: string; title: string; left: number; until: number };

// ---- "오늘은 초대 받지 않기" (this browser, until midnight KST) ----
const OFF_KEY = 'puzzlthink_invite_off';
const kstDay = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
export function invitesOffToday() { try { return localStorage.getItem(OFF_KEY) === kstDay(); } catch { return false; } }
/** Turning it on also leaves the lobby presence, so the host's count drops this player too. */
export function setInvitesOffToday(off: boolean) {
  try { if (off) localStorage.setItem(OFF_KEY, kstDay()); else localStorage.removeItem(OFF_KEY); } catch { /* optional */ }
  for (const h of hubs.values()) if (off) untrack(h); else track(h);
}

// ---- the invite being shown (one at a time) ----
let invite: Invite | null = null;
const listeners = new Set<() => void>();
function setInvite(next: Invite | null) { invite = next; listeners.forEach((fn) => fn()); }
export const subscribeInvite = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getInvite = () => invite;
export const getNoInvite = () => null;
export const dismissInvite = () => setInvite(null);

// ---- one channel per game, shared by the player and host sides of this tab ----
// supabase-js hands back the old channel for a topic until it has finished leaving, so a quick remount (a page
// change, React's dev double mount) must reuse the channel instead of making a new one: count users, leave late.
type Hub = {
  game: GameId; channel: RealtimeChannel; refs: number; subscribed: boolean;
  players: number; tracked: boolean; counts: Set<(n: number) => void>; drop: number;
};
const hubs = new Map<GameId, Hub>();
const tabKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random()).slice(2);
const seen = new Map<string, { n: number; last: number }>(); // per room code: invites shown here
let lastCheck = 0;

function track(h: Hub) {
  if (!h.subscribed || h.tracked || h.players === 0 || invitesOffToday() || document.visibilityState !== 'visible') return;
  h.tracked = true;
  void h.channel.track({});
}
function untrack(h: Hub) { if (h.tracked) { h.tracked = false; void h.channel.untrack(); } }

function hub(game: GameId): Hub | null {
  const supabase = getSupabase();
  if (!supabase) return null;
  let h = hubs.get(game);
  if (!h) {
    const channel = supabase.channel(lobbyTopic(game), { config: { presence: { key: tabKey } } });
    const made: Hub = { game, channel, refs: 0, subscribed: false, players: 0, tracked: false, counts: new Set(), drop: 0 };
    channel.on('presence', { event: 'sync' }, () => { const n = Object.keys(channel.presenceState()).length; made.counts.forEach((fn) => fn(n)); });
    channel.on('broadcast', { event: 'invite' }, ({ payload }) => { if (made.tracked) void receive(game, payload); });
    channel.on('broadcast', { event: 'cancel' }, ({ payload }) => { if (invite?.game === game && invite.code === (payload as { code?: unknown } | null)?.code) setInvite(null); });
    channel.subscribe((status) => { if (status === 'SUBSCRIBED') { made.subscribed = true; track(made); } });
    hubs.set(game, made);
    h = made;
  }
  window.clearTimeout(h.drop);
  h.refs += 1;
  return h;
}
function release(h: Hub) {
  h.refs -= 1;
  if (h.refs > 0) return;
  h.drop = window.setTimeout(() => {
    if (h.refs > 0) return;
    hubs.delete(h.game);
    void getSupabase()?.removeChannel(h.channel);
  }, 2000);
}

async function receive(game: GameId, payload: unknown) {
  const code = (payload as { code?: unknown } | null)?.code;
  if (typeof code !== 'string' || !isRoomCode(code) || invite || invitesOffToday()) return;
  const now = Date.now();
  const mine = seen.get(code);
  if (mine && (mine.n >= INVITE_MAX || now - mine.last < INVITE_COOLDOWN_MS)) return; // the same limits as the sender's
  if (now - lastCheck < CHECK_GAP_MS) return;
  lastCheck = now;
  // Only a real open room of this game that still has a seat; its name and seats come from the list.
  const row = (await listOpenRooms(game)).find((r) => r.code === code);
  if (!row || row.players >= row.capacity || !hubs.get(game)?.tracked || invite || invitesOffToday()) return;
  seen.set(code, { n: (mine?.n ?? 0) + 1, last: now });
  setInvite({ game, code, variant: row.variant, host: row.host, title: row.title ?? '', left: row.capacity - row.players, until: now + INVITE_MS });
}

/** GameGate: I am playing `game` against the AI (or solo). Returns the leave function. */
export function joinAiLobby(game: GameId) {
  const h = hub(game);
  if (!h) return () => {};
  if (invite && invite.game !== game) setInvite(null);
  let hiddenTimer = 0;
  const onVisibility = () => {
    window.clearTimeout(hiddenTimer);
    if (document.visibilityState === 'visible') track(h);
    else hiddenTimer = window.setTimeout(() => untrack(h), HIDDEN_MS);
  };
  h.players += 1;
  track(h);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    window.clearTimeout(hiddenTimer);
    document.removeEventListener('visibilitychange', onVisibility);
    h.players -= 1;
    if (h.players === 0) { untrack(h); if (invite?.game === game) setInvite(null); }
    release(h);
  };
}

// ---- host side ----
const sentKey = (code: string) => `puzzlthink_invite_sent_${code}`;
/** When this browser sent invites for the room (kept across reloads). */
export function sentTimes(code: string): number[] {
  try { const list = JSON.parse(localStorage.getItem(sentKey(code)) || '[]'); return Array.isArray(list) ? list.filter((n) => typeof n === 'number') : []; } catch { return []; }
}
function markSent(code: string) { try { localStorage.setItem(sentKey(code), JSON.stringify([...sentTimes(code), Date.now()].slice(-INVITE_MAX))); } catch { /* optional */ } }

/**
 * The host's view of a game's lobby: how many are playing it now, and a way to send them an invite.
 * Listens without tracking, so the host never counts as an AI player.
 */
export function watchAiLobby(game: GameId, onCount: (n: number) => void) {
  const h = hub(game);
  if (!h) return { send: async () => false, cancel: async () => {}, stop: () => {} };
  const listen = (n: number) => onCount(n); // its own function: a late stop() of an earlier watch must not remove it
  h.counts.add(listen);
  if (h.subscribed) listen(Object.keys(h.channel.presenceState()).length);
  let stopped = false;
  return {
    /** Broadcast an invite for `code` (the caller checks the limits; they are kept here too). */
    send: async (code: string) => {
      const times = sentTimes(code);
      if (times.length >= INVITE_MAX || Date.now() - (times.at(-1) ?? 0) < INVITE_COOLDOWN_MS) return false;
      markSent(code);
      await h.channel.send({ type: 'broadcast', event: 'invite', payload: { code } });
      return true;
    },
    /** The room filled up, started or closed: take back an invite that may still be showing. */
    cancel: async (code: string) => {
      if (Date.now() - (sentTimes(code).at(-1) ?? 0) > INVITE_MS) return;
      await h.channel.send({ type: 'broadcast', event: 'cancel', payload: { code } });
    },
    stop: () => { if (stopped) return; stopped = true; h.counts.delete(listen); release(h); },
  };
}
