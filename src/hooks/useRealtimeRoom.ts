"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { type BaseRoom, type Peer, seatOf } from '@/lib/room';
import { cryptoReady, deriveKey, makeKeyPair, open, seal } from '@/lib/roomCrypto';

/**
 * Host-authoritative room over Supabase Realtime (broadcast + presence).
 * The browser that created the room holds the state, applies every action through
 * `engine.reduce`, and broadcasts the result; guests only send actions.
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
};

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

/** Creates a room code and marks this browser as its host. Returns the code to navigate to. */
export function prepareRoom(storage: string, hostValue: string): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
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

  const lastChange = useRef(0);
  // Encrypted per-seat secrets (only used when the engine defines privateFor).
  const keysRef = useRef<Promise<{ privateKey: CryptoKey; pub: string }> | null>(null);
  const peerPubs = useRef(new Map<string, string>()); // peer id -> public key
  const sharedKeys = useRef(new Map<string, Promise<CryptoKey>>()); // public key -> AES key
  const publicRef = useRef<S | null>(null); // guest: last public state from the host
  const secretRef = useRef<{ sid: string; seat: number; value: unknown } | null>(null); // guest: my decrypted secret

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

  const commit = useCallback((next: S) => {
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
    if (next) commit(next);
  }, [engine, commit]);

  useEffect(() => {
    const id = clientId();
    joinedAt.current = Date.now();
    const hostValue = read(hostKeyFor(engine.storage, code));
    const savedName = read(NAME_KEY);
    if (!savedName) write(NAME_KEY, defaultName);
    const host = { id, name: savedName || defaultName, at: joinedAt.current };
    const created = hostValue ? engine.create(hostValue, host) : null;
    const identity = { id, name: host.name, isHost: !!created };
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
      stateRef.current = initial;
      setState(initial);
    }

    const channel = supabase.channel(`${engine.channel}-${code}`, { config: { presence: { key: id }, broadcast: { self: false } } });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const presence = channel.presenceState<{ name: string; at: number; host: boolean; pub?: string }>();
      const list: Peer[] = Object.entries(presence).map(([key, metas]) => ({ id: key, name: metas[0]?.name ?? '', at: metas[0]?.at ?? 0 }));
      for (const [key, metas] of Object.entries(presence)) { const pub = metas[0]?.pub; if (pub) peerPubs.current.set(key, pub); }
      const hostMeta = Object.entries(presence).find(([, metas]) => metas.some((meta) => meta.host));
      if (hostMeta?.[1][0]?.pub) peerPubs.current.set('__host__', hostMeta[1][0].pub);
      setPeers(list);
      setHostOnline(Object.values(presence).some((metas) => metas.some((meta) => meta.host)));
      if (meRef.current?.isHost && stateRef.current) {
        const next = engine.syncSeats(stateRef.current, list);
        if (next !== stateRef.current) commit(next); else sendSecrets(next);
      }
    });
    channel.on('broadcast', { event: 'state' }, ({ payload }) => {
      if (meRef.current?.isHost) return;
      const incoming = payload as S;
      const current = publicRef.current;
      if (!current || incoming.sid !== current.sid || incoming.v >= current.v) { publicRef.current = incoming; showGuestView(); }
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
    channel.on('broadcast', { event: 'hello' }, () => {
      if (meRef.current?.isHost && stateRef.current) { channel.send({ type: 'broadcast', event: 'state', payload: engine.redact ? engine.redact(stateRef.current) : stateRef.current }); sendSecrets(stateRef.current); }
    });

    channel.subscribe(async (result) => {
      if (result === 'SUBSCRIBED') {
        setStatus('online');
        const pub = keysRef.current ? (await keysRef.current.catch(() => null))?.pub : undefined;
        await channel.track({ name: identity.name, at: joinedAt.current, host: identity.isHost, ...(pub ? { pub } : {}) });
        if (!identity.isHost) channel.send({ type: 'broadcast', event: 'hello', payload: {} });
      } else if (result === 'CHANNEL_ERROR' || result === 'TIMED_OUT') setStatus('error');
    });

    return () => { channelRef.current = null; supabase.removeChannel(channel); };
  }, [engine, code, defaultName, apply, commit, sendSecrets, showGuestView, keyFor]);

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
    if (identity.isHost) apply(action, identity.id);
    else channelRef.current?.send({ type: 'broadcast', event: 'action', payload: { from: identity.id, action } });
  }, [apply]);

  const rename = useCallback((name: string) => {
    const identity = meRef.current;
    const trimmed = name.trim().slice(0, 16);
    if (!identity || !trimmed) return;
    write(NAME_KEY, trimmed);
    meRef.current = { ...identity, name: trimmed };
    setMe(meRef.current);
    const keys = keysRef.current;
    (keys ? keys.then((k) => k.pub, () => undefined) : Promise.resolve(undefined)).then((pub) => channelRef.current?.track({ name: trimmed, at: joinedAt.current, host: identity.isHost, ...(pub ? { pub } : {}) }));
  }, []);

  const mySeat = state && me ? seatOf(state, me.id) : null;
  return { status, state, peers, hostOnline, me, mySeat, dispatch, rename };
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
