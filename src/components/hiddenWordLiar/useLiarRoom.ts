"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { CHAT_KEEP, cleanChat, floodCheck, setRoomPlaying } from '@/lib/roomChat';
import { type LiarView, chatLiar, chatSince, joinLiar, tickLiar, viewLiar } from '@/lib/hiddenWordLiar';
import { liarCopy } from './copy';

export type LiarChat = { key: string; seat: number; name: string; text: string; at: number; mine: boolean; kind: 'chat' | 'emote' | 'system' | 'hidden' | 'event' };
// quick reactions still go browser to browser, but only these fixed lines are shown (a modified client cannot smuggle text)
const EMOTES = new Set([...liarCopy('ko').quick, ...liarCopy('en').quick]);
type Status = 'connecting' | 'online' | 'missing' | 'full' | 'started' | 'login' | 'error' | 'unconfigured';

/**
 * One 히든 워드: 라이어 room: joins (or re-joins) this browser's seat, keeps `view` fresh from the database's pushes
 * (topic hwl-<code>, event 'v') with a slow poll as a safety net, nudges the server when a clock runs out, and carries
 * 👁 marks, typing dots and quick reactions between the browsers (broadcast only, nothing stored). Chat lines go through the
 * server (hwl_chat filters them); its push 'c' only says "there is a new line", which every browser then reads back.
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
  const lastLine = useRef(0);
  const lineLoading = useRef(false);
  const mySeatRef = useRef<number | null>(null);

  // the server's chat lines after the last one this browser has
  const pullChat = useCallback(async () => {
    if (lineLoading.current) return;
    lineLoading.current = true;
    try {
      const lines = await chatSince(code, lastLine.current);
      if (!lines?.length) return;
      const fresh = lines.filter((l) => l.id > lastLine.current);
      if (!fresh.length) return;
      lastLine.current = fresh[fresh.length - 1].id;
      setChat((c) => [...c, ...fresh.map((l) => ({
        key: `l${l.id}`, seat: l.seat, name: l.name, text: l.text ?? '', at: l.at, mine: l.seat === mySeatRef.current,
        kind: l.text == null ? 'hidden' as const : 'chat' as const,
      }))].slice(-CHAT_KEEP));
      setTyping((m) => { const n = { ...m }; let changed = false; for (const l of fresh) if (n[l.seat]) { delete n[l.seat]; changed = true; } return changed ? n : m; });
    } finally { lineLoading.current = false; }
  }, [code]);

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
      void pullChat();
    })();
    const ch = supabase.channel(`hwl-${code}`, { config: { broadcast: { self: false } } });
    ch.on('broadcast', { event: 'v' }, () => { void refresh(); })
      .on('broadcast', { event: 'c' }, () => { void pullChat(); })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {   // quick reactions only
        const p = payload as { seat: number; name: string; text: string; emote?: boolean };
        if (typeof p?.seat !== 'number' || typeof p.text !== 'string' || !p.emote || !EMOTES.has(p.text)) return;
        setChat((c) => [...c, { key: `${Date.now()}-${Math.random()}`, seat: p.seat, name: String(p.name ?? '').slice(0, 16), text: p.text, at: Date.now(), mine: false, kind: 'emote' as const }].slice(-CHAT_KEEP));
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
  }, [code, name, refresh, pullChat]);

  // clocks: nudge the server just after a deadline (it checks its own time), and poll slowly as a safety net
  useEffect(() => {
    if (!view?.deadline) return;
    const wait = Math.max(300, view.deadline - (Date.now() + skew) + 400);
    const t = window.setTimeout(async () => { await tickLiar(code); void refresh(); }, wait);
    return () => window.clearTimeout(t);
  }, [view?.deadline, view?.v, skew, code, refresh]);
  useEffect(() => {
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') { void refresh(); void pullChat(); } }, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh, pullChat]);

  // a new game clears the marks
  const game = view?.game;
  useEffect(() => { const t = window.setTimeout(() => setMarks({}), 0); return () => window.clearTimeout(t); }, [game]);

  const mySeat = view?.me?.seat ?? null;
  useEffect(() => { mySeatRef.current = mySeat; }, [mySeat]);
  /** Sends a chat line (through the server) or a quick reaction; resolves to a block reason, or null when sent. */
  const say = useCallback(async (raw: string, emote = false): Promise<string | null> => {
    const text = cleanChat(raw);
    if (!text || mySeat == null || !channel.current) return null;
    if (emote) {
      void channel.current.send({ type: 'broadcast', event: 'chat', payload: { seat: mySeat, name, text, emote: true } });
      setChat((c) => [...c, { key: `${Date.now()}-me`, seat: mySeat, name, text, at: Date.now(), mine: true, kind: 'emote' as const }].slice(-CHAT_KEEP));
      return null;
    }
    const block = floodCheck(sentLog.current, Date.now(), text);
    if (block) return block;
    sentLog.current = [...sentLog.current, { at: Date.now(), text }].slice(-20);
    const res = await chatLiar(code, text);
    if (!res) return 'error';
    if (res.error) return res.error;
    void pullChat();
    return null;
  }, [mySeat, name, code, pullChat]);
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
  const pushSystem = useCallback((text: string, seat = -1, kind: 'system' | 'event' = 'system') => {
    setChat((c) => [...c, { key: `${Date.now()}-${Math.random()}`, seat, name: '', text, at: Date.now(), mine: false, kind }].slice(-CHAT_KEEP));
  }, []);

  return { view, status, chat, marks, skew, typing, refresh, say, mark, pushSystem, typingNow, clearTyping };
}
