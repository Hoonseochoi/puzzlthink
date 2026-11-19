"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Ban, MessageCircle, MessageCircleOff, Send, X } from 'lucide-react';
import { EMOTE_MS, EMOTES } from '@/lib/openRooms';
import {
  CHAT_MAX_LEN, type ChatBlock, chatPrefs, chatPrefsServer, chatSnapshot, clearMuted, isMuted, setChatOff, setMuted, subscribeChat,
} from '@/lib/roomChat';

const BUBBLE_MS = 4500;

/**
 * Chat for friend and open rooms, on every page with a live room (lobby and during the game).
 * A tab on the right edge opens a drawer and closes it again, like the open-room waiting panel, so the
 * board stays clear; the tab counts unread messages. New messages and quick reactions pop up as a speech
 * bubble over that player's box when the game shows one (any element marked `data-chat-seat={peer id}`),
 * otherwise beside the tab. Nothing is saved; players can mute someone or turn chat off.
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

  // A quick tick keeps bubbles fading out on time and following their boxes when the page scrolls.
  useEffect(() => {
    if (!room) return;
    const update = () => setNow(Date.now());
    const tick = window.setInterval(update, 250);
    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    return () => { window.clearInterval(tick); window.removeEventListener('scroll', update, { capture: true }); window.removeEventListener('resize', update); };
  }, [room]);

  const messages = (room?.messages ?? []).filter((m) => m.mine || !isMuted(prefs.muted, m));
  useEffect(() => {
    const list = listRef.current;
    if (open && list) list.scrollTop = list.scrollHeight;
  }, [open, messages.length]);

  if (!room) return null;

  const others = messages.filter((m) => !m.mine);
  const unread = prefs.off || open ? 0 : others.filter((m) => m.at > seenAt).length;
  const mutedHere = new Set(room.messages.filter((m) => !m.mine && isMuted(prefs.muted, m)).map((m) => m.from)).size;

  // Latest thing each player said or reacted with, still fresh.
  const said = new Map<string, { text: string; at: number; name: string; emote: boolean }>();
  if (!prefs.off) {
    for (const m of messages) if (now - m.at < BUBBLE_MS) said.set(m.from, { text: m.text, at: m.at, name: m.name, emote: false });
    for (const p of room.peers) {
      if (!p.emote || !p.emoteAt || now - p.emoteAt > EMOTE_MS || isMuted(prefs.muted, { from: p.id })) continue;
      const prev = said.get(p.id);
      if (!prev || prev.at < p.emoteAt) said.set(p.id, { text: p.emote, at: p.emoteAt, name: p.name, emote: true });
    }
  }
  const bubbles: { id: string; text: string; at: number; emote: boolean; x: number; y: number }[] = [];
  const loose: { id: string; text: string; at: number; name: string }[] = [];
  for (const [id, s] of said) {
    const box = typeof document === 'undefined' ? null : visibleBox(id);
    if (box) bubbles.push({ id, text: s.text, at: s.at, emote: s.emote, x: box.left + 10, y: Math.max(box.top, 40) });
    else if (!open && id !== room.myId) loose.push({ id, text: s.text, at: s.at, name: s.name });
  }

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
      {/* Speech bubbles over player boxes. */}
      {bubbles.map((b) => (
        <span key={`${b.id}-${b.at}`} style={{ left: b.x, top: b.y }}
          className={`bw-result pointer-events-none fixed z-[45] max-w-[200px] -translate-y-[calc(100%+4px)] truncate rounded-2xl rounded-bl-sm px-2.5 py-1 text-xs font-bold shadow-[0_6px_18px_rgba(0,0,0,.45)] ${b.emote ? 'bg-(--accent,#e8b04a) text-(--accent-ink,#1c1406)' : 'border border-black/10 bg-white text-[#17140d]'}`}>
          {b.text}
        </span>
      ))}

      {/* Tab on the right edge: opens the drawer, shows the unread count and messages with no box to sit on. */}
      <button type="button" onClick={() => toggle(!open)} aria-label={t('open')} aria-expanded={open}
        className="fixed right-0 top-[60%] z-40 lg:top-[46%] flex flex-col items-center gap-1 rounded-l-xl border border-r-0 border-white/15 bg-[#0d0d11]/95 px-2 py-3 text-[10px] font-black text-white shadow-[0_0_18px_rgba(0,0,0,.35)] backdrop-blur">
        {prefs.off ? <MessageCircleOff size={14} className="text-white/45" /> : <MessageCircle size={14} className="text-(--accent,#e8b04a)" />}
        <span className="[writing-mode:vertical-rl]">{t('title')}</span>
        {unread > 0 && <span className="absolute -left-2 -top-2 min-w-5 rounded-full bg-[#ff4d5e] px-1 text-center text-[10px] font-black leading-5 text-white shadow-[0_0_10px_rgba(255,77,94,.5)]">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {loose.length > 0 && (
        <div className="pointer-events-none fixed right-11 top-[60%] z-40 lg:top-[46%] flex max-w-[min(240px,calc(100vw-4rem))] flex-col items-end gap-1">
          {loose.slice(-3).map((m) => (
            <span key={`${m.id}-${m.at}`} className="bw-result max-w-full truncate rounded-2xl rounded-br-sm border border-white/10 bg-[#16161c]/95 px-3 py-1.5 text-xs text-white/85 shadow-lg">
              <b className="mr-1.5 text-(--accent,#e8b04a)">{m.name}</b>{m.text}
            </span>
          ))}
        </div>
      )}

      {/* Phones: a dimmed backdrop closes it. Desktop: no backdrop, so the game stays playable with chat open. */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div onClick={() => toggle(false)} className={`absolute inset-0 bg-black/40 transition-opacity lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'opacity-0'}`} />
        <aside className={`${open ? 'pointer-events-auto' : ''} absolute bottom-0 right-0 top-0 flex w-[84vw] max-w-[320px] flex-col border-l border-white/10 bg-[#0d0d11]/97 text-[#e6e9f0] shadow-2xl backdrop-blur transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
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
                <div key={m.key} className={`flex items-start gap-1.5 text-[13px] leading-5 ${m.mine ? 'justify-end' : ''}`}>
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
            <form onSubmit={send} className="border-t border-white/10 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
              <div className="mb-2 grid grid-cols-5 gap-1">
                {EMOTES.map((text) => (
                  <button key={text} type="button" onClick={() => room.emote(text)} className="rounded-md border border-white/15 bg-white/5 py-1.5 text-xs font-black text-white/80 hover:border-(--accent,#e8b04a)/60 active:scale-95">{text}</button>
                ))}
              </div>
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
        </aside>
      </div>
    </>
  );
}

/** The on-screen box marked for this player, if any (the first one that is actually visible). */
function visibleBox(id: string) {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-chat-seat="${CSS.escape(id)}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && r.left >= 0 && r.right <= window.innerWidth + 1) return r;
  }
  return null;
}
