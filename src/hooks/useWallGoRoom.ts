"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import type { ModeId } from '@/lib/wallgo';
import { type Peer, type RoomAction, type RoomState, createRoom, reduceRoom, seatOf, syncSeats } from '@/lib/wallgoRoom';

const CLIENT_KEY = 'puzzlthink_client_id';
const NAME_KEY = 'puzzlthink_nickname';
export const hostKey = (code: string) => `puzzlthink_room_host_${code}`;
const stateKey = (code: string) => `puzzlthink_room_state_${code}`;

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } };

function clientId() {
  let id = read(CLIENT_KEY);
  if (!id) { id = crypto.randomUUID(); write(CLIENT_KEY, id); }
  return id;
}

export type RoomStatus = 'connecting' | 'online' | 'unconfigured' | 'error';

export function useWallGoRoom(code: string, defaultName: string) {
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const [state, setState] = useState<RoomState | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [hostOnline, setHostOnline] = useState(true);
  const [me, setMe] = useState<{ id: string; name: string; isHost: boolean } | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef<RoomState | null>(null);
  const meRef = useRef(me);
  const joinedAt = useRef(0);

  const commit = useCallback((next: RoomState) => {
    stateRef.current = next;
    setState(next);
    write(stateKey(code), JSON.stringify(next));
    channelRef.current?.send({ type: 'broadcast', event: 'state', payload: next });
  }, [code]);

  const apply = useCallback((action: RoomAction, fromId: string) => {
    const current = stateRef.current;
    if (!current) return;
    const next = reduceRoom(current, action, seatOf(current, fromId), meRef.current?.isHost ?? false);
    if (next) commit(next);
  }, [commit]);

  useEffect(() => {
    const id = clientId();
    joinedAt.current = Date.now();
    const hostMode = read(hostKey(code)) as ModeId | null;
    const savedName = read(NAME_KEY);
    if (!savedName) write(NAME_KEY, defaultName);
    const identity = { id, name: savedName || defaultName, isHost: hostMode === 'two' || hostMode === 'three' };
    meRef.current = identity;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- identity comes from localStorage, only available on the client
    setMe(identity);

    const supabase = getSupabase();
    if (!supabase) { setStatus('unconfigured'); return; }

    if (identity.isHost) {
      let saved: RoomState | null = null;
      try { saved = JSON.parse(read(stateKey(code)) || 'null'); } catch { saved = null; }
      const initial = saved && saved.mode === hostMode ? saved : createRoom(hostMode!, { id, name: identity.name, at: joinedAt.current });
      stateRef.current = initial;
      setState(initial);
    }

    const channel = supabase.channel(`wallgo-room-${code}`, { config: { presence: { key: id }, broadcast: { self: false } } });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const presence = channel.presenceState<{ name: string; at: number; host: boolean }>();
      const list: Peer[] = Object.entries(presence).map(([key, metas]) => ({ id: key, name: metas[0]?.name ?? '', at: metas[0]?.at ?? 0 }));
      setPeers(list);
      setHostOnline(Object.values(presence).some((metas) => metas.some((meta) => meta.host)));
      if (meRef.current?.isHost && stateRef.current) {
        const next = syncSeats(stateRef.current, list);
        if (next !== stateRef.current) commit(next);
      }
    });
    channel.on('broadcast', { event: 'state' }, ({ payload }) => {
      if (meRef.current?.isHost) return;
      const incoming = payload as RoomState;
      const current = stateRef.current;
      if (!current || incoming.sid !== current.sid || incoming.v >= current.v) { stateRef.current = incoming; setState(incoming); }
    });
    channel.on('broadcast', { event: 'action' }, ({ payload }) => {
      if (meRef.current?.isHost) apply(payload.action as RoomAction, payload.from as string);
    });
    channel.on('broadcast', { event: 'hello' }, () => {
      if (meRef.current?.isHost && stateRef.current) channel.send({ type: 'broadcast', event: 'state', payload: stateRef.current });
    });

    channel.subscribe(async (result) => {
      if (result === 'SUBSCRIBED') {
        setStatus('online');
        await channel.track({ name: identity.name, at: joinedAt.current, host: identity.isHost });
        if (!identity.isHost) channel.send({ type: 'broadcast', event: 'hello', payload: {} });
      } else if (result === 'CHANNEL_ERROR' || result === 'TIMED_OUT') setStatus('error');
    });

    return () => { channelRef.current = null; supabase.removeChannel(channel); };
  }, [code, defaultName, apply, commit]);

  // The host enforces the 90-second turn limit for everyone.
  useEffect(() => {
    if (!me?.isHost) return;
    const timer = window.setInterval(() => {
      const current = stateRef.current;
      if (current && (current.phase === 'placement' || current.phase === 'playing') && Date.now() >= current.deadline) apply({ t: 'timeout' }, me.id);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [me, apply]);

  const dispatch = useCallback((action: RoomAction) => {
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
    channelRef.current?.track({ name: trimmed, at: joinedAt.current, host: identity.isHost });
  }, []);

  const mySeat = state && me ? seatOf(state, me.id) : null;
  return { status, state, peers, hostOnline, me, mySeat, dispatch, rename };
}
