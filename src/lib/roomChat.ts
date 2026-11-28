// In-room chat: messages go over the room's Realtime channel (broadcast) and live only in the open
// tabs. Nothing is written to the database, and a message is gone once everyone leaves the room.
// The room hook feeds this store; the floating chat (RoomChat) reads it on every page with a room.

export const CHAT_MAX_LEN = 100;
export const CHAT_KEEP = 60; // messages kept in memory per room
// Flood control, checked when sending and again when receiving (so a modified client is held back too).
export const CHAT_GAP_MS = 1000; // one message a second
export const CHAT_BURST = 5; // and at most five in ten seconds
export const CHAT_BURST_MS = 10_000;
const REPEAT_LIMIT = 3; // the same text three times in a row

export type ChatMessage = { key: string; from: string; uid?: string; name: string; text: string; at: number; mine: boolean };
export type ChatBlock = 'fast' | 'burst' | 'repeat';

export type ChatPeer = { id: string; name: string; emote?: string; emoteAt?: number };
type Room = { token: number; messages: ChatMessage[]; send: (text: string) => ChatBlock | null; emote: (text: string) => void; myId: string; peers: ChatPeer[] };
let room: Room | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

export const subscribeChat = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const chatSnapshot = () => room;

/** Called by the room hook when it connects; returns a token used to update or leave. */
let nextToken = 1;
export function openChat(myId: string, send: (text: string) => ChatBlock | null, emote: (text: string) => void) {
  const token = nextToken++;
  room = { token, messages: [], send, emote, myId, peers: [] };
  emit();
  return token;
}
export function closeChat(token: number) {
  if (room?.token !== token) return;
  room = null;
  baseStatus = null;
  mergeStatus();
  emit();
}
export function pushChat(token: number, message: ChatMessage) {
  if (room?.token !== token) return;
  room = { ...room, messages: [...room.messages, message].slice(-CHAT_KEEP) };
  emit();
}

/** Whether a room's match is on (past its waiting lobby): the lounge chat stays out of the way then. */
let playing = false;
export const roomPlaying = () => playing;
export function setRoomPlaying(value: boolean) {
  if (playing === value) return;
  playing = value;
  emit();
}

/** Who is in the room (for names and quick reactions). */
export function setChatPeers(token: number, peers: ChatPeer[]) {
  if (room?.token !== token) return;
  room = { ...room, peers };
  emit();
}

/** Cleans what a player typed: one line, trimmed, capped. */
export const cleanChat = (text: string) => text.replace(/\s+/g, ' ').trim().slice(0, CHAT_MAX_LEN);

/** Times and texts a sender sent recently; says whether one more is allowed. */
/** `received` allows for network jitter: messages can arrive closer together than they were sent. */
export function floodCheck(log: { at: number; text: string }[], now: number, text: string, received = false): ChatBlock | null {
  const last = log[log.length - 1];
  if (last && now - last.at < (received ? CHAT_GAP_MS / 3 : CHAT_GAP_MS)) return 'fast';
  if (log.filter((m) => now - m.at < CHAT_BURST_MS).length >= CHAT_BURST + (received ? 1 : 0)) return 'burst';
  const tail = log.slice(-(REPEAT_LIMIT - 1));
  if (tail.length === REPEAT_LIMIT - 1 && tail.every((m) => m.text === text)) return 'repeat';
  return null;
}

// Muted players, by browser id and account id, kept in this browser.
const MUTE_KEY = 'puzzlthink_chat_muted';
const OFF_KEY = 'puzzlthink_chat_off';
let muted: string[] | null = null;
let off: boolean | null = null;
function loadPrefs() {
  if (muted !== null) return;
  try { muted = JSON.parse(localStorage.getItem(MUTE_KEY) || '[]'); off = localStorage.getItem(OFF_KEY) === '1'; } catch { muted = []; off = false; }
  if (!Array.isArray(muted)) muted = [];
}
let prefs = { muted: [] as string[], off: false };
export const chatPrefs = () => { loadPrefs(); if (prefs.muted !== muted || prefs.off !== off) prefs = { muted: muted!, off: !!off }; return prefs; };
const serverPrefs = { muted: [] as string[], off: false };
export const chatPrefsServer = () => serverPrefs;

export const isMuted = (list: string[], m: { from: string; uid?: string }) => list.includes(m.from) || (!!m.uid && list.includes(m.uid));
export function setMuted(m: { from: string; uid?: string }, value: boolean) {
  loadPrefs();
  const ids = [m.from, ...(m.uid ? [m.uid] : [])];
  muted = value ? [...new Set([...muted!, ...ids])].slice(-200) : muted!.filter((id) => !ids.includes(id));
  try { localStorage.setItem(MUTE_KEY, JSON.stringify(muted)); } catch { /* optional */ }
  emit();
}
export function clearMuted() {
  muted = [];
  try { localStorage.removeItem(MUTE_KEY); } catch { /* optional */ }
  emit();
}
export function setChatOff(value: boolean) {
  loadPrefs();
  off = value;
  try { localStorage.setItem(OFF_KEY, value ? '1' : '0'); } catch { /* optional */ }
  emit();
}

/**
 * The game's state in one line, shown at the top of the room chat so a player typing never loses the game.
 * The room hook fills in what every game has (lobby or not, the turn clock); a game adds what only it knows with
 * `useChatStatus` (src/hooks/useChatStatus.ts): whose move it is, the score, the last move, what I do next.
 */
export type ChatStatus = {
  idle?: boolean;           // not in play: the waiting room, or the match is over (the chat shows its plain title)
  mine?: boolean;           // it is my move now: the chat shows "내 차례 — 게임으로" and buzzes once
  who?: string | null;      // whose move it is, when it is someone else's
  text?: string | null;     // one short line: what is going on, or what I do next
  score?: string | null;    // score / chips / position, short
  last?: string | null;     // the last move, short
  deadline?: number | null; // when the current clock runs out (ms since epoch)
};
let baseStatus: { token: number; status: ChatStatus } | null = null;
let gameStatus: ChatStatus | null = null;
let status: ChatStatus | null = null;
const sameStatus = (a: ChatStatus | null | undefined, b: ChatStatus | null | undefined) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
function mergeStatus() {
  const base = baseStatus && room?.token === baseStatus.token ? baseStatus.status : null;
  const next = base || gameStatus ? { ...base, ...gameStatus } : null;
  if (sameStatus(next, status)) return;
  status = next;
  emit();
}
export const chatStatus = () => status;
/** Room hook: what every game has. */
export function setChatBase(token: number, value: ChatStatus) {
  if (room?.token !== token || (baseStatus?.token === token && sameStatus(baseStatus.status, value))) return;
  baseStatus = { token, status: value };
  mergeStatus();
}
/** Game view: what only it knows (null when it unmounts). */
export function setGameChatStatus(value: ChatStatus | null) {
  gameStatus = value;
  mergeStatus();
}
