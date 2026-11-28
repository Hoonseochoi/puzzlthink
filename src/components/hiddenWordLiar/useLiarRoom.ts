"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { CHAT_KEEP, cleanChat, floodCheck, setRoomPlaying } from '@/lib/roomChat';
import { type LiarView, joinLiar, tickLiar, viewLiar } from '@/lib/hiddenWordLiar';

export type LiarChat = { key: string; seat: number; name: string; text: string; at: number; mine: boolean; kind: 'chat' | 'emote' | 'system' };
type Status = 'connecting' | 'online' | 'missing' | 'full' | 'started' | 'login' | 'error' | 'unconfigured';

/**
 * One 히든 워드: 라이어 room: joins (or re-joins) this browser's seat, keeps `view` fresh from the database's pushes
 * (topic hwl-<code>, event 'v') with a slow poll as a safety net, nudges the server when a clock runs out, and carries
 * chat, 👁 marks and quick reactions between the browsers in the room (broadcast only, nothing stored).
 */
export function useLiarRoom(code: string, name: string) {
  const [view, setView] = useState<LiarView | null>(null);
  const [status, setStatus] = useState<Status>('connecting');
  const [chat, setChat] = useState<LiarChat[]>([]);
  const [marks, setMarks] = useState<Record<number, number>>({}); // seat → the seat they suspect
  const [skew, setSkew] = useState(0);
  const [typing, setTyping] = useState<Record<number, { kind: 'clue' | 'chat'; until: number }>>({}); // seat → who is typing what
  const typedAt = useRef(0);
  const channel = useRef<RealtimeChannel | null>(null);
  const viewRef = useRef<LiarView | null>(null);
  const loading = useRef(false);
  const again = useRef(false);
  const sentLog = useRef<{ at: number; text: string }[]>([]);
  const recvLog = useRef<Record<number, { at: number; text: string }[]>>({});

  const refresh = useCallback(async () => {
    if (loading.current) { again.current = true; return; }
    loading.current = true;
    try {
      const v = await viewLiar(code);
      if (!v) return;
      if (v.error) { setStatus(v.error === 'missing' ? 'missing' : 'error'); return; }
      if (viewRef.current && v.v < viewRef.current.v && v.game === viewRef.current.game) return; // an older answer arrived late
      setSkew(v.now - Date.now());
      viewRef.current = v;
      setView(v);
      setStatus('online');
    } finally {
      loading.current = false;
      if (again.current) { again.current = false; void refresh(); }
    }
  }, [code]);

  // join, then listen
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { const t = window.setTimeout(() => setStatus('unconfigured'), 0); return () => window.clearTimeout(t); }
    let alive = true;
    (async () => {
      const res = await joinLiar(code, name);
      if (!alive) return;
      if (!res) { setStatus('error'); return; }
      if (res.error) { setStatus((['missing', 'full', 'started', 'login'].includes(res.error) ? res.error : 'error') as Status); return; }
      await refresh();
    })();
    const ch = supabase.channel(`hwl-${code}`, { config: { broadcast: { self: false } } });
    ch.on('broadcast', { event: 'v' }, () => { void refresh(); })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        const p = payload as { seat: number; name: string; text: string; emote?: boolean };
        if (typeof p?.seat !== 'number' || typeof p.text !== 'string') return;
        const text = cleanChat(p.text);
        if (!text) return;
        const log = (recvLog.current[p.seat] ??= []);
        if (!p.emote && floodCheck(log, Date.now(), text, true)) return; // a modified client is held back too
        log.push({ at: Date.now(), text }); if (log.length > 20) log.shift();
        setChat((c) => [...c, { key: `${Date.now()}-${Math.random()}`, seat: p.seat, name: String(p.name ?? '').slice(0, 16), text, at: Date.now(), mine: false, kind: p.emote ? 'emote' as const : 'chat' as const }].slice(-CHAT_KEEP));
        setTyping((m) => { if (!m[p.seat]) return m; const n = { ...m }; delete n[p.seat]; return n; });
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const p = payload as { seat: number; kind?: string; stop?: boolean };
        if (typeof p?.seat !== 'number') return;
        setTyping((m) => {
          const n = { ...m };
          if (p.stop) delete n[p.seat]; else n[p.seat] = { kind: p.kind === 'clue' ? 'clue' : 'chat', until: Date.now() + 3000 };
          return n;
        });
      })
      .on('broadcast', { event: 'mark' }, ({ payload }) => {
        const p = payload as { seat: number; target: number | null };
        if (typeof p?.seat !== 'number') return;
        setMarks((m) => { const n = { ...m }; if (p.target == null) delete n[p.seat]; else n[p.seat] = p.target; return n; });
      })
      .subscribe();
    channel.current = ch;
    setRoomPlaying(true); // the lounge chat stays out of the way
    return () => { alive = false; channel.current = null; void supabase.removeChannel(ch); setRoomPlaying(false); };
  }, [code, name, refresh]);

  // clocks: nudge the server just after a deadline (it checks its own time), and poll slowly as a safety net
  useEffect(() => {
    if (!view?.deadline) return;
    const wait = Math.max(300, view.deadline - (Date.now() + skew) + 400);
    const t = window.setTimeout(async () => { await tickLiar(code); void refresh(); }, wait);
    return () => window.clearTimeout(t);
  }, [view?.deadline, view?.v, skew, code, refresh]);
  useEffect(() => {
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh]);

  // a new game clears the marks
  const game = view?.game;
  useEffect(() => { const t = window.setTimeout(() => setMarks({}), 0); return () => window.clearTimeout(t); }, [game]);

  const mySeat = view?.me?.seat ?? null;
  const say = useCallback((raw: string, emote = false): string | null => {
    const text = cleanChat(raw);
    if (!text || mySeat == null || !channel.current) return null;
    if (!emote) {
      const block = floodCheck(sentLog.current, Date.now(), text);
      if (block) return block;
      sentLog.current = [...sentLog.current, { at: Date.now(), text }].slice(-20);
    }
    void channel.current.send({ type: 'broadcast', event: 'chat', payload: { seat: mySeat, name, text, emote } });
    setChat((c) => [...c, { key: `${Date.now()}-me`, seat: mySeat, name, text, at: Date.now(), mine: true, kind: emote ? 'emote' as const : 'chat' as const }].slice(-CHAT_KEEP));
    return null;
  }, [mySeat, name]);
  const mark = useCallback((target: number | null) => {
    if (mySeat == null || !channel.current) return;
    setMarks((m) => { const n = { ...m }; if (target == null) delete n[mySeat]; else n[mySeat] = target; return n; });
    void channel.current.send({ type: 'broadcast', event: 'mark', payload: { seat: mySeat, target } });
  }, [mySeat]);
  // "…" over my icon on the other screens while I type: at most one push every 1.5 s, gone 3 s after the last one
  const typingNow = useCallback((kind: 'clue' | 'chat', stop = false) => {
    if (mySeat == null || !channel.current) return;
    const at = Date.now();
    if (!stop && at - typedAt.current < 1500) return;
    typedAt.current = stop ? 0 : at;
    void channel.current.send({ type: 'broadcast', event: 'typing', payload: { seat: mySeat, kind, stop } });
  }, [mySeat]);
  const clearTyping = useCallback((seat: number) => {
    setTyping((m) => { if (!m[seat]) return m; const n = { ...m }; delete n[seat]; return n; });
  }, []);
  const pushSystem = useCallback((text: string, seat = -1) => {
    setChat((c) => [...c, { key: `${Date.now()}-${Math.random()}`, seat, name: '', text, at: Date.now(), mine: false, kind: 'system' as const }].slice(-CHAT_KEEP));
  }, []);

  return { view, status, chat, marks, skew, typing, refresh, say, mark, pushSystem, typingNow, clearTyping };
}
