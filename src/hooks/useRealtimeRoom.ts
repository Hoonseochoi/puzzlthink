"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { type BaseRoom, type Peer, seatOf } from '@/lib/room';
import { cryptoReady, deriveKey, makeKeyPair, open, seal } from '@/lib/roomCrypto';
import { setRoomOpen, setRoomOpponents } from '@/lib/stats';
import { isOpenRoom, pingLiveRoom } from '@/lib/openRooms';
import { isPlayApp } from '@/lib/playApp';
import { type ChatBlock, cleanChat, closeChat, floodCheck, openChat, pushChat, setChatPeers, setRoomPlaying } from '@/lib/roomChat';
import { pushHostNotice } from '@/lib/roomHost';

/**
 * Host-authoritative room over Supabase Realtime (broadcast + presence).
 * The browser that created the room holds the state, applies every action through
 * `engine.reduce`, and broadcasts the result; guests only send actions.
 *
 * Host handoff: when the host has been gone from presence for HANDOFF_MS, the guest who joined earliest
 * (seated players first) takes over with the last state it saw, under a higher `term`. Hidden information
 * (other players' cards, the deck) left with the old host, so such games use `engine.resume`, or go back to
 * the lobby. If the old host comes back, the higher term wins and the old host continues as a guest.
 */
export type RoomEngine<S extends BaseRoom, A> = {
  channel: string; // channel prefix, e.g. "wallgo-room"
  storage: string; // localStorage prefix for host flag and saved state
  create: (hostValue: string, host: Peer) => S | null;
  restorable: (saved: S, hostValue: string) => boolean;
  reduce: (state: S, action: A, seat: number | null, isHost: boolean) => S | null;
  syncSeats: (state: S, peers: Peer[]) => S;
  running: (state: S) => boolean; // whether the turn clock applies
  timeoutAction: A;
  autoAction?: (state: S) => A | null; // host-run steps, e.g. AI seats (one per tick)
  autoDelay?: number; // minimum ms between a state change and the next auto step (slows AI tempo)
  redact?: (state: S) => S; // what guests may see (hide secret picks)
  // Per-seat secrets, delivered end-to-end encrypted to that seat's browser only.
  privateFor?: (state: S, seat: number) => unknown;
  withPrivate?: (state: S, secret: unknown, seat: number) => S;
  // Guest actions that only the host may read (e.g. a hidden bid), sent end-to-end encrypted to the host.
  sealed?: (action: A) => boolean;
  /**
   * Host handoff in a game with hidden information (`redact`): turn the new host's view (public state plus its own
   * secret) into a state it can run, e.g. the current hand dealt again with the bets given back. Return null to send
   * the room back to the lobby. Not called in the lobby or once the game is finished (nothing is hidden then).
   */
  resume?: (view: S, seat: number | null) => S | null;
  /**
   * Host: a change to keep without broadcasting it (or sending secrets), e.g. a hidden release in 시간 경매 whose timing
   * must not reach other browsers. The next ordinary change carries it.
   */
  quiet?: (prev: S, next: S) => boolean;
};

/** How long the host may be missing from presence (a refresh takes a few seconds) before a guest takes over. */
const HANDOFF_MS = 9000;
type HostMeta = { name: string; at: number; host: boolean; term?: number; hv?: string; pub?: string };
/** The host that counts when two claim it: the higher term, then the one who joined first. */
const hostRank = (a: [string, HostMeta], b: [string, HostMeta]) => (b[1].term ?? 0) - (a[1].term ?? 0) || a[1].at - b[1].at || a[0].localeCompare(b[0]);

const CLIENT_KEY = 'puzzlthink_client_id';
const NAME_KEY = 'puzzlthink_nickname';
const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } };
export const hostKeyFor = (storage: string, code: string) => `${storage}_host_${code}`;
const stateKeyFor = (storage: string, code: string) => `${storage}_state_${code}`;

function clientId() {
  let id = read(CLIENT_KEY);
  if (!id) { id = crypto.randomUUID(); write(CLIENT_KEY, id); }
  return id;
}

/** A 4-digit invite code (1000–9999), easy to read out and type. */
const randomCode = () => String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));

/**
 * Whether nobody is in the room channel right now. Listens without joining presence (so it is
 * invisible to others) and gives up after a short wait, treating an unreachable server as free.
 */
function roomIsFree(channelPrefix: string, code: string): Promise<boolean> {
  return probeRoom(channelPrefix, code);
}

/** Whether someone is in that room channel right now (e.g. to send a typed code to the right kind of room). */
export const roomIsBusy = async (channelPrefix: string, code: string) => !(await probeRoom(channelPrefix, code));

function probeRoom(channelPrefix: string, code: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return Promise.resolve(true);
  return new Promise((resolve) => {
    const channel = supabase.channel(`${channelPrefix}-${code}`, { config: { presence: { key: `probe-${crypto.randomUUID()}` } } });
    let settled = false;
    const finish = (free: boolean) => {
      if (settled) return;
      settled = true;
      supabase.removeChannel(channel);
      resolve(free);
    };
    channel.on('presence', { event: 'sync' }, () => { if (Object.keys(channel.presenceState()).length) finish(false); });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') window.setTimeout(() => finish(Object.keys(channel.presenceState()).length === 0), 700);
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') finish(true);
    });
    window.setTimeout(() => finish(true), 2500);
  });
}

/**
 * Picks a free 4-digit room code and marks this browser as its host. Returns the code to navigate to.
 * Codes are short, so a code someone is still playing in is skipped; any old saved game this browser
 * kept under the same code is cleared so the new room starts fresh.
 */
export async function prepareRoom(channelPrefix: string, storage: string, hostValue: string): Promise<string> {
  let code = randomCode();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (await roomIsFree(channelPrefix, code)) break;
    code = randomCode();
  }
  try { localStorage.removeItem(stateKeyFor(storage, code)); } catch { /* Storage is optional. */ }
  write(hostKeyFor(storage, code), hostValue);
  return code;
}


export type RoomStatus = 'connecting' | 'online' | 'unconfigured' | 'error';

export function useRealtimeRoom<S extends BaseRoom, A>(engine: RoomEngine<S, A>, code: string, defaultName: string) {
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const [state, setState] = useState<S | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [hostOnline, setHostOnline] = useState(true);
  const [me, setMe] = useState<{ id: string; name: string; isHost: boolean } | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef<S | null>(null);
  const meRef = useRef(me);
  const joinedAt = useRef(0);
  const pubRef = useRef<string | undefined>(undefined);
  const uidRef = useRef<string | undefined>(undefined); // signed-in account id, shared so results can name opponents
  const termRef = useRef(0); // host: the term this browser runs the room under
  const hostValueRef = useRef<string | null>(null); // the room's host flag value (learned from the host's presence)
  const peersRef = useRef<Peer[]>([]);
  const hostSeenAt = useRef(0);
  const hostIdRef = useRef<string | null>(null);
  const presenceMeta = useCallback((identity: { name: string; isHost: boolean }) => ({
    name: identity.name, at: joinedAt.current, host: identity.isHost,
    ...(identity.isHost ? { term: termRef.current, ...(hostValueRef.current ? { hv: hostValueRef.current } : {}) } : {}),
    ...(pubRef.current ? { pub: pubRef.current } : {}), ...(uidRef.current ? { uid: uidRef.current } : {}),
    ...(isPlayApp() ? { app: true } : {}),
  }), []);

  const lastChange = useRef(0);
  const emoteRef = useRef<((text: string) => void) | null>(null); // for the chat drawer's quick reactions
  // Encrypted per-seat secrets (only used when the engine defines privateFor).
  const keysRef = useRef<Promise<{ privateKey: CryptoKey; pub: string }> | null>(null);
  const peerPubs = useRef(new Map<string, string>()); // peer id -> public key
  const sharedKeys = useRef(new Map<string, Promise<CryptoKey>>()); // public key -> AES key
  const publicRef = useRef<S | null>(null); // guest: last public state from the host
  const secretRef = useRef<{ sid: string; seat: number; value: unknown } | null>(null); // guest: my decrypted secret
  const takeOverRef = useRef<(() => void) | null>(null);

  const keyFor = useCallback(async (pub: string) => {
    const keys = await keysRef.current;
    if (!keys) throw new Error('no keys');
    let key = sharedKeys.current.get(pub);
    if (!key) { key = deriveKey(keys.privateKey, pub); sharedKeys.current.set(pub, key); }
    return key;
  }, []);

  const sendSecrets = useCallback((next: S) => {
    if (!engine.privateFor || !keysRef.current || !meRef.current?.isHost) return;
    const hostId = meRef.current.id;
    next.seats.forEach((seat, index) => {
      if (!seat || seat.id === hostId) return;
      const pub = peerPubs.current.get(seat.id);
      if (!pub) return;
      const value = engine.privateFor!(next, index);
      keyFor(pub).then((key) => seal(key, value)).then((box) => {
        channelRef.current?.send({ type: 'broadcast', event: 'secret', payload: { to: seat.id, sid: next.sid, v: next.v, seat: index, ...box } });
      }).catch(() => { /* peer key not usable */ });
    });
  }, [engine, keyFor]);

  // Guest view = public state + my own secret (when it belongs to this game).
  const showGuestView = useCallback(() => {
    const pub = publicRef.current;
    if (!pub) return;
    const secret = secretRef.current;
    const view = engine.withPrivate && secret && secret.sid === pub.sid ? engine.withPrivate(pub, secret.value, secret.seat) : pub;
    stateRef.current = view;
    setState(view);
  }, [engine]);

  const commit = useCallback((raw: S) => {
    // Every state the host sends carries its term, so guests can drop a stale host's late broadcasts.
    const next = termRef.current && raw.term !== termRef.current ? { ...raw, term: termRef.current } : raw;
    stateRef.current = next;
    lastChange.current = Date.now();
    setState(next);
    write(stateKeyFor(engine.storage, code), JSON.stringify(next));
    channelRef.current?.send({ type: 'broadcast', event: 'state', payload: engine.redact ? engine.redact(next) : next });
    sendSecrets(next);
  }, [engine, code, sendSecrets]);

  const apply = useCallback((action: A, fromId: string) => {
    const current = stateRef.current;
    if (!current) return;
    const next = engine.reduce(current, action, seatOf(current, fromId), meRef.current?.isHost ?? false);
    if (!next) return;
    if (engine.quiet?.(current, next)) {
      stateRef.current = next;
      lastChange.current = Date.now();
      setState(next);
      write(stateKeyFor(engine.storage, code), JSON.stringify(next));
      return;
    }
    commit(next);
  }, [engine, commit, code]);

  useEffect(() => {
    const id = clientId();
    joinedAt.current = Date.now();
    const hostValue = read(hostKeyFor(engine.storage, code));
    const savedName = read(NAME_KEY);
    if (!savedName) write(NAME_KEY, defaultName);
    const host = { id, name: savedName || defaultName, at: joinedAt.current };
    const created = hostValue ? engine.create(hostValue, host) : null;
    const identity = { id, name: host.name, isHost: !!created };
    hostValueRef.current = created ? hostValue : null;
    termRef.current = 0;
    hostSeenAt.current = Date.now();
    hostIdRef.current = null;
    meRef.current = identity;
    setMe(identity);

    const supabase = getSupabase();
    if (!supabase) { setStatus('unconfigured'); return; }
    if (engine.privateFor && cryptoReady()) keysRef.current = makeKeyPair();
    publicRef.current = null; secretRef.current = null;

    if (created && hostValue) {
      let saved: S | null = null;
      try { saved = JSON.parse(read(stateKeyFor(engine.storage, code)) || 'null'); } catch { saved = null; }
      const initial = saved && engine.restorable(saved, hostValue) ? saved : created;
      termRef.current = initial.term ?? 0;
      stateRef.current = initial;
      setState(initial);
    }

    const channel = supabase.channel(`${engine.channel}-${code}`, { config: { presence: { key: id }, broadcast: { self: false } } });
    channelRef.current = channel;

    const setIdentity = (isHost: boolean) => {
      const self = meRef.current;
      if (!self) return;
      meRef.current = { ...self, isHost };
      setMe(meRef.current);
      channel.track(presenceMeta(meRef.current));
    };
    /** This browser was the host, but another took over meanwhile: drop the old state and follow the new host. */
    const stepDown = () => {
      try { localStorage.removeItem(hostKeyFor(engine.storage, code)); localStorage.removeItem(stateKeyFor(engine.storage, code)); } catch { /* optional */ }
      termRef.current = 0;
      publicRef.current = null; secretRef.current = null;
      setIdentity(false);
      channel.send({ type: 'broadcast', event: 'hello', payload: {} });
    };
    /** The host is gone: run the room from the last state this browser saw. */
    takeOverRef.current = () => {
      const view = stateRef.current;
      const self = meRef.current;
      if (!view || !self || self.isHost) return;
      const meAsPeer: Peer = { id: self.id, name: self.name, at: joinedAt.current };
      const others = peersRef.current;
      let next: S | null;
      let restarted = false;
      if (view.phase === 'lobby') {
        // The lobby keeps its settings; this browser takes the host seat and the others follow in join order.
        next = { ...view, seats: view.seats.map((seat, i) => (i === 0 ? { id: self.id, name: self.name } : seat?.id === self.id ? null : seat)) };
      } else if (!engine.redact || view.phase === 'finished') {
        next = view; // everyone already had the whole state
      } else {
        restarted = true;
        next = engine.resume?.(view, seatOf(view, self.id)) ?? null;
        if (!next && hostValueRef.current) next = engine.create(hostValueRef.current, meAsPeer);
        if (!next) { next = view; restarted = false; }
      }
      termRef.current = (view.term ?? 0) + 1;
      if (hostValueRef.current) write(hostKeyFor(engine.storage, code), hostValueRef.current);
      publicRef.current = null; secretRef.current = null;
      hostIdRef.current = self.id;
      setIdentity(true);
      const synced = engine.syncSeats(next, others);
      commit({ ...synced, term: termRef.current, v: Math.max(view.v, synced.v) + 1 });
      pushHostNotice(self.name, true, restarted);
    };

    channel.on('presence', { event: 'sync' }, () => {
      const presence = channel.presenceState<HostMeta & { emote?: string; emoteAt?: number; uid?: string; app?: boolean }>();
      const list: Peer[] = Object.entries(presence).map(([key, metas]) => ({ id: key, name: metas[0]?.name ?? '', at: metas[0]?.at ?? 0, emote: metas[0]?.emote, emoteAt: metas[0]?.emoteAt, uid: metas[0]?.uid, ...(metas[0]?.app ? { app: true } : {}) }));
      for (const [key, metas] of Object.entries(presence)) { const pub = metas[0]?.pub; if (pub) peerPubs.current.set(key, pub); }
      const hosts = Object.entries(presence).flatMap(([key, metas]) => { const meta = metas.find((m) => m.host); return meta ? [[key, meta] as [string, HostMeta]] : []; }).sort(hostRank);
      const top = hosts[0];
      if (top?.[1].pub) peerPubs.current.set('__host__', top[1].pub);
      if (top) {
        hostSeenAt.current = Date.now();
        if (top[1].hv && !meRef.current?.isHost) hostValueRef.current = top[1].hv;
        const before = hostIdRef.current;
        hostIdRef.current = top[0];
        // Someone else took over from a host who left: tell everyone (the new host tells itself in takeOver).
        if (before && before !== top[0] && top[0] !== meRef.current?.id && (top[1].term ?? 0) > 0 && !list.some((p) => p.id === before)) {
          pushHostNotice(top[1].name, false, false);
        }
      }
      peersRef.current = list;
      setPeers(list);
      setChatPeers(chatToken, list);
      setHostOnline(hosts.length > 0);
      // A host that came back after someone else took over continues as a guest.
      if (meRef.current?.isHost && top && top[0] !== meRef.current.id) { stepDown(); return; }
      if (meRef.current?.isHost && stateRef.current) {
        const next = engine.syncSeats(stateRef.current, list);
        if (next !== stateRef.current) commit(next); else sendSecrets(next);
      }
    });
    channel.on('broadcast', { event: 'state' }, ({ payload }) => {
      if (meRef.current?.isHost) return;
      const incoming = payload as S;
      const current = publicRef.current;
      const term = incoming.term ?? 0;
      const known = current?.term ?? 0;
      if (term < known) return; // a host that has since been replaced
      hostSeenAt.current = Date.now();
      if (!current || term > known || incoming.sid !== current.sid || incoming.v >= current.v) { publicRef.current = incoming; showGuestView(); }
    });
    channel.on('broadcast', { event: 'secret' }, ({ payload }) => {
      if (meRef.current?.isHost || payload?.to !== meRef.current?.id) return;
      const hostPub = peerPubs.current.get('__host__');
      if (!hostPub) return;
      keyFor(hostPub).then((key) => open(key, payload)).then((value) => {
        secretRef.current = { sid: payload.sid, seat: payload.seat, value };
        showGuestView();
      }).catch(() => { /* not for this key */ });
    });
    channel.on('broadcast', { event: 'action' }, ({ payload }) => {
      if (meRef.current?.isHost) apply(payload.action as A, payload.from as string);
    });
    channel.on('broadcast', { event: 'sealed' }, ({ payload }) => {
      if (!meRef.current?.isHost || typeof payload?.from !== 'string') return;
      const pub = peerPubs.current.get(payload.from);
      if (!pub) return;
      keyFor(pub).then((key) => open<A>(key, payload)).then((action) => apply(action, payload.from)).catch(() => { /* not readable */ });
    });
    channel.on('broadcast', { event: 'hello' }, () => {
      if (meRef.current?.isHost && stateRef.current) { channel.send({ type: 'broadcast', event: 'state', payload: engine.redact ? engine.redact(stateRef.current) : stateRef.current }); sendSecrets(stateRef.current); }
    });

    // Chat: broadcast only, never stored. Each sender is flood-checked on both ends.
    const chatLogs = new Map<string, { at: number; text: string }[]>();
    const logChat = (from: string, at: number, text: string) => chatLogs.set(from, [...(chatLogs.get(from) ?? []), { at, text }].slice(-8));
    const chatToken = openChat(id, (raw): ChatBlock | null => {
      const text = cleanChat(raw);
      const self = meRef.current;
      if (!text || !self) return null;
      const at = Date.now();
      const block = floodCheck(chatLogs.get(self.id) ?? [], at, text);
      if (block) return block;
      logChat(self.id, at, text);
      const message = { from: self.id, uid: uidRef.current, name: self.name, text };
      channel.send({ type: 'broadcast', event: 'chat', payload: message });
      pushChat(chatToken, { ...message, key: `${self.id}-${at}`, at, mine: true });
      return null;
    }, (text) => emoteRef.current?.(text));
    channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
      const from = typeof payload?.from === 'string' ? payload.from : '';
      const text = typeof payload?.text === 'string' ? cleanChat(payload.text) : '';
      if (!from || !text || from === meRef.current?.id) return;
      const at = Date.now();
      // Received 'repeat' is let through (the sender already blocks it); speed limits are not.
      const block = floodCheck(chatLogs.get(from) ?? [], at, text, true);
      if (block === 'fast' || block === 'burst') return;
      logChat(from, at, text);
      const name = typeof payload.name === 'string' ? payload.name.slice(0, 16) : '';
      pushChat(chatToken, { key: `${from}-${at}`, from, uid: typeof payload.uid === 'string' ? payload.uid : undefined, name, text, at, mine: false });
    });

    channel.subscribe(async (result) => {
      if (result === 'SUBSCRIBED') {
        setStatus('online');
        const pub = keysRef.current ? (await keysRef.current.catch(() => null))?.pub : undefined;
        pubRef.current = pub;
        uidRef.current = (await supabase.auth.getSession()).data.session?.user.id;
        await channel.track(presenceMeta(identity));
        if (!identity.isHost) channel.send({ type: 'broadcast', event: 'hello', payload: {} });
      } else if (result === 'CHANNEL_ERROR' || result === 'TIMED_OUT') setStatus('error');
    });

    return () => { channelRef.current = null; takeOverRef.current = null; closeChat(chatToken); supabase.removeChannel(channel); };
  }, [engine, code, defaultName, apply, commit, sendSecrets, showGuestView, keyFor, presenceMeta]);

  // Guests: if the host has been gone long enough, the guest who joined first (seated players first) takes over.
  useEffect(() => {
    if (!me || me.isHost) return;
    const timer = window.setInterval(() => {
      const view = stateRef.current;
      if (!view || !channelRef.current || Date.now() - hostSeenAt.current < HANDOFF_MS) return;
      const present = peersRef.current;
      const seated = present.filter((p) => seatOf(view, p.id) !== null);
      const next = [...(seated.length ? seated : present)].sort((a, b) => a.at - b.at || a.id.localeCompare(b.id))[0];
      if (next?.id === me.id) takeOverRef.current?.();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [me]);

  // The host enforces the turn limit for everyone.
  useEffect(() => {
    if (!me?.isHost) return;
    const timer = window.setInterval(() => {
      const current = stateRef.current;
      if (!current) return;
      const auto = engine.autoAction?.(current);
      if (auto) { if (Date.now() - lastChange.current >= (engine.autoDelay ?? 0)) apply(auto, me.id); return; }
      if (engine.running(current) && Date.now() >= current.deadline) apply(engine.timeoutAction, me.id);
    }, 900);
    return () => window.clearInterval(timer);
  }, [engine, me, apply]);

  const dispatch = useCallback((action: A) => {
    const identity = meRef.current;
    if (!identity) return;
    if (identity.isHost) { apply(action, identity.id); return; }
    const hostPub = peerPubs.current.get('__host__');
    if (engine.sealed?.(action) && keysRef.current && hostPub) {
      keyFor(hostPub).then((key) => seal(key, action)).then((box) => {
        channelRef.current?.send({ type: 'broadcast', event: 'sealed', payload: { from: identity.id, ...box } });
      }).catch(() => { /* key not usable: the host's clock settles it */ });
      return;
    }
    channelRef.current?.send({ type: 'broadcast', event: 'action', payload: { from: identity.id, action } });
  }, [apply, engine, keyFor]);

  /** A quick reaction shown over this player's name for a few seconds (sent through presence, no chat log). */
  const lastEmote = useRef(0);
  const emote = useCallback((text: string) => {
    const identity = meRef.current;
    const now = Date.now();
    if (!identity || now - lastEmote.current < 1500) return; // light rate limit keeps Realtime traffic small
    lastEmote.current = now;
    channelRef.current?.track({ ...presenceMeta(identity), emote: text.slice(0, 4), emoteAt: now });
  }, [presenceMeta]);

  useEffect(() => { emoteRef.current = emote; }, [emote]);

  const rename = useCallback((name: string) => {
    const identity = meRef.current;
    const trimmed = name.trim().slice(0, 16);
    if (!identity || !trimmed) return;
    write(NAME_KEY, trimmed);
    meRef.current = { ...identity, name: trimmed };
    setMe(meRef.current);
    channelRef.current?.track(presenceMeta(meRef.current));
  }, [presenceMeta]);

  // Signed-in players seated with me this game, remembered even if they drop out before it ends.
  const met = useRef<{ sid: string; ids: Map<string, { uid: string; name: string }> }>({ sid: '', ids: new Map() });
  useEffect(() => {
    if (!state || !me) return;
    if (met.current.sid !== state.sid) met.current = { sid: state.sid, ids: new Map() };
    const seated = new Set(state.seats.flatMap((seat) => (seat && seat.id !== me.id ? [seat.id] : [])));
    for (const peer of peers) if (peer.uid && seated.has(peer.id)) met.current.ids.set(peer.id, { uid: peer.uid, name: peer.name });
    setRoomOpponents([...met.current.ids.values()]);
  }, [state, peers, me]);
  useEffect(() => {
    setRoomOpen(isOpenRoom(code));
    return () => { setRoomOpponents([]); setRoomOpen(false); };
  }, [code]);

  // "지금 플레이 중" on the home card: the host pings once a minute while a match is on — a friend room with two or more
  // people, or an open room once it has started (waiting open rooms are listed on their own).
  const openRoom = isOpenRoom(code);
  const started = !!state && state.phase !== 'lobby';
  // The site-wide lounge hides while the match is on (it shows again in the lobby, next to the room chat).
  useEffect(() => {
    setRoomPlaying(started);
    return () => setRoomPlaying(false);
  }, [started]);
  const live = !!me?.isHost && status === 'online' && peers.length >= 2 && (!openRoom || started);
  useEffect(() => {
    if (!live) return;
    const room = `${engine.channel}-${code}`;
    pingLiveRoom(room, openRoom);
    const timer = window.setInterval(() => pingLiveRoom(room, openRoom), 60_000);
    return () => window.clearInterval(timer);
  }, [live, openRoom, engine.channel, code]);

  const mySeat = state && me ? seatOf(state, me.id) : null;
  return { status, state, peers, hostOnline, me, mySeat, dispatch, rename, emote };
}

/** Same engine, played entirely in this browser (solo vs AI). Seat 0 is the local player. */
export function useLocalRoom<S extends BaseRoom, A>(engine: RoomEngine<S, A>, create: () => S) {
  const [state, setState] = useState<S | null>(null);
  const stateRef = useRef<S | null>(null);
  const lastChange = useRef(0);
  const apply = useCallback((action: A, seat: number | null, isHost = true) => {
    const current = stateRef.current;
    if (!current) return;
    const next = engine.reduce(current, action, seat, isHost);
    if (next) { stateRef.current = next; lastChange.current = Date.now(); setState(next); }
  }, [engine]);
  const reset = useCallback(() => { const s = create(); stateRef.current = s; setState(s); }, [create]);
  useEffect(() => {
    const timer = window.setTimeout(reset, 0);
    return () => window.clearTimeout(timer);
  }, [reset]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = stateRef.current;
      if (!current) return;
      const auto = engine.autoAction?.(current);
      if (auto) { if (Date.now() - lastChange.current >= (engine.autoDelay ?? 0)) apply(auto, null); }
      else if (engine.running(current) && Date.now() >= current.deadline) apply(engine.timeoutAction, null);
    }, 750);
    return () => window.clearInterval(timer);
  }, [engine, apply]);
  const dispatch = useCallback((action: A) => apply(action, 0), [apply]);
  return { state, dispatch, reset, mySeat: 0 };
}
