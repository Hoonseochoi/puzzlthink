"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Ban, MessageCircle, MessageCircleOff, Send, X } from 'lucide-react';
import {
  CHAT_MAX_LEN, type ChatBlock, chatPrefs, chatPrefsServer, chatSnapshot, clearMuted, isMuted, setChatOff, setMuted, subscribeChat,
} from '@/lib/roomChat';

const PREVIEW_MS = 4000;

/**
 * Floating chat for friend and open rooms, on every page with a live room (lobby and during the game).
 * Messages are not saved anywhere. Players can mute someone (kept in this browser) or turn chat off.
 */
export default function RoomChat() {
  const t = useTranslations('RoomChat');
  const room = useSyncExternalStore(subscribeChat, chatSnapshot, () => null);
  const prefs = useSyncExternalStore(subscribeChat, chatPrefs, chatPrefsServer);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<{ block: ChatBlock; at: number } | null>(null);
  const [seenAt, setSeenAt] = useState(0);
  const [now, setNow] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!room) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [room]);

  const messages = (room?.messages ?? []).filter((m) => m.mine || !isMuted(prefs.muted, m));
  useEffect(() => {
    const list = listRef.current;
    if (open && list) list.scrollTop = list.scrollHeight;
  }, [open, messages.length]);

  if (!room) return null;

  const others = messages.filter((m) => !m.mine);
  const unread = prefs.off || open ? 0 : others.filter((m) => m.at > seenAt).length;
  const latest = others[others.length - 1];
  const preview = !open && !prefs.off && latest && latest.at > seenAt && now - latest.at < PREVIEW_MS ? latest : null;
  const mutedHere = new Set((room.messages ?? []).filter((m) => !m.mine && isMuted(prefs.muted, m)).map((m) => m.from)).size;

  const toggle = (value: boolean) => { setOpen(value); setSeenAt(Date.now()); };
  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const block = room.send(draft);
    if (block) { setNotice({ block, at: Date.now() }); return; }
    setDraft(''); setNotice(null);
  };
  const showNotice = notice && now - notice.at < 2500 ? notice : null;

  return (
    <>
      {preview && (
        <button type="button" onClick={() => toggle(true)} className="bw-result fixed bottom-[calc(3.1rem+env(safe-area-inset-bottom))] right-[3.6rem] z-40 max-w-[min(260px,calc(100vw-5rem))] truncate rounded-2xl rounded-br-sm border border-white/10 bg-[#16161c]/95 px-3 py-2 text-left text-xs text-white/85 shadow-[0_8px_24px_rgba(0,0,0,.45)] backdrop-blur">
          <b className="mr-1.5 text-(--accent,#e8b04a)">{latest.name}</b>{latest.text}
        </button>
      )}
      <button
        type="button" onClick={() => toggle(!open)} aria-label={t('open')} aria-expanded={open}
        className="fixed bottom-[calc(2.75rem+env(safe-area-inset-bottom))] right-3 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#16161c]/95 text-white shadow-[0_8px_24px_rgba(0,0,0,.45)] backdrop-blur transition hover:border-white/30 active:scale-95"
      >
        {prefs.off ? <MessageCircleOff size={19} className="text-white/45" /> : <MessageCircle size={19} />}
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#ff4d5e] px-1 text-center text-[10px] font-black leading-5 text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] right-3 z-40 flex h-[min(420px,58svh)] w-[min(320px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111116]/97 text-[#e6e9f0] shadow-[0_18px_50px_rgba(0,0,0,.55)] backdrop-blur">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">{t('title')}</p>
              <p className="truncate text-[10px] text-white/40">{t('notSaved')}</p>
            </div>
            <button type="button" onClick={() => setChatOff(!prefs.off)} className="rounded-md border border-white/15 px-2 py-1 text-[11px] font-bold text-white/60 hover:bg-white/10">{prefs.off ? t('turnOn') : t('turnOff')}</button>
            <button type="button" onClick={() => toggle(false)} className="rounded-md p-1 text-white/45 hover:bg-white/10 hover:text-white" aria-label={t('close')}><X size={16} /></button>
          </div>

          {prefs.off ? (
            <p className="flex flex-1 items-center justify-center break-keep px-6 text-center text-xs leading-5 text-white/45">{t('offDesc')}</p>
          ) : (
            <div ref={listRef} className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2.5">
              {messages.length === 0 && <p className="break-keep pt-6 text-center text-xs leading-5 text-white/35">{t('empty')}</p>}
              {messages.map((m) => (
                <div key={m.key} className={`group flex items-start gap-1.5 text-[13px] leading-5 ${m.mine ? 'justify-end' : ''}`}>
                  {m.mine ? (
                    <p className="max-w-[85%] break-words rounded-2xl rounded-br-sm bg-(--accent,#e8b04a) px-2.5 py-1 text-(--accent-ink,#1c1406)">{m.text}</p>
                  ) : (
                    <>
                      <p className="min-w-0 max-w-[85%] break-words rounded-2xl rounded-bl-sm bg-white/[.07] px-2.5 py-1"><b className="mr-1.5 text-[12px] text-white/55">{m.name}</b>{m.text}</p>
                      <button type="button" onClick={() => setMuted(m, true)} className="mt-1 shrink-0 rounded p-0.5 text-white/25 hover:bg-white/10 hover:text-[#ff8b96]" aria-label={t('mute', { name: m.name })} title={t('mute', { name: m.name })}><Ban size={12} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {!prefs.off && (mutedHere > 0 || prefs.muted.length > 0) && (
            <p className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-1.5 text-[10px] text-white/40">
              <span>{mutedHere > 0 ? t('mutedHere', { n: mutedHere }) : t('mutedSome')}</span>
              <button type="button" onClick={clearMuted} className="font-bold text-white/60 underline-offset-2 hover:underline">{t('unmuteAll')}</button>
            </p>
          )}

          {!prefs.off && (
            <form onSubmit={send} className="border-t border-white/10 p-2">
              {showNotice && <p className="mb-1.5 px-1 text-[11px] font-bold text-[#ffb3aa]">{t(`block_${showNotice.block}`)}</p>}
              <div className="flex gap-1.5">
                <input
                  value={draft} maxLength={CHAT_MAX_LEN} onChange={(event) => setDraft(event.target.value)}
                  // Keep game shortcuts (letters, Space, Enter) from firing while typing.
                  onKeyDown={(event) => { event.stopPropagation(); if (event.key === 'Escape') toggle(false); }} onKeyUp={(event) => event.stopPropagation()}
                  placeholder={t('placeholder')} enterKeyHint="send" autoComplete="off"
                  className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-(--accent,#e8b04a)"
                />
                <button type="submit" disabled={!draft.trim()} className="flex items-center justify-center rounded-lg bg-(--accent,#e8b04a) px-3 text-(--accent-ink,#1c1406) disabled:opacity-40" aria-label={t('send')}><Send size={15} /></button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
