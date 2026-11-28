"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDown, Ban, ChevronDown, MessageCircle, MessageCircleOff, Send, Timer } from 'lucide-react';
import { EMOTE_MS, EMOTES } from '@/lib/openRooms';
import {
  CHAT_MAX_LEN, type ChatBlock, type ChatMessage, type ChatStatus, chatPrefs, chatPrefsServer, chatSnapshot, chatStatus, clearMuted, isMuted,
  setChatOff, setMuted, subscribeChat,
} from '@/lib/roomChat';
import { useChatBottom } from '@/hooks/useChatBottom';

const BUBBLE_MS = 4500;
const noStatus = () => null;

/**
 * Chat for friend and open rooms, on every page with a live room (lobby and during the game).
 *
 * The chat never covers the whole game:
 * - Phones (portrait): a bottom sheet over the lower ~40% of the screen, no backdrop, so the board above stays visible
 *   and playable; the page gets room at the bottom so anything under the sheet can be scrolled up into view. With the
 *   keyboard up the sheet shrinks and sits right on the keyboard (sized from visualViewport), leaving a strip of the
 *   game above it.
 * - Wide screens (desktop, phones on their side): a panel at the right edge, and the page makes room for it.
 * - On top of the chat, a live status line each game feeds (useChatStatus): whose move it is, the clock, the score,
 *   the last move. On my move it turns into a big "내 차례 — 게임으로" button (with one buzz) that closes the chat;
 *   whatever I was typing stays in the box.
 * - Closed: a tab on the right edge with the unread count. New messages and quick reactions pop up as a speech bubble
 *   over that player's box when the game shows one (any element marked `data-chat-seat={peer id}`), else beside the tab.
 * Nothing is saved; players can mute someone or turn chat off.
 */
export default function RoomChat() {
  const t = useTranslations('RoomChat');
  const room = useSyncExternalStore(subscribeChat, chatSnapshot, () => null);
  const prefs = useSyncExternalStore(subscribeChat, chatPrefs, chatPrefsServer);
  const status = useSyncExternalStore(subscribeChat, chatStatus, noStatus);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<{ block: ChatBlock; at: number } | null>(null);
  const [seenAt, setSeenAt] = useState(0);
  const [sent, setSent] = useState(0);
  const [now, setNow] = useState(0);
  const vp = useViewport(!!room);

  // A quick tick keeps bubbles fading out on time, the clock running and bubbles following their boxes on scroll.
  useEffect(() => {
    if (!room) return;
    const update = () => setNow(Date.now());
    const tick = window.setInterval(update, 250);
    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    return () => { window.clearInterval(tick); window.removeEventListener('scroll', update, { capture: true }); window.removeEventListener('resize', update); };
  }, [room]);

  const live = !!room && !!status && !status.idle;
  const mine = live && !!status.mine;
  // My move came while the chat is open: one short buzz (only once the player has touched the page; browsers refuse before).
  const wasMine = useRef(false);
  useEffect(() => {
    if (mine && !wasMine.current && open) {
      try { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.([40, 60, 40]); } catch { /* optional */ }
    }
    wasMine.current = mine;
  }, [mine, open]);

  // The page makes room for the open chat: the sheet's height at the bottom, the panel's width at the right.
  const side = vp.wide;
  const sheetH = Math.round(Math.min(360, Math.max(230, vp.tall * 0.42)));
  const sideW = vp.width >= 1024 ? 320 : 280;
  const shown = !!room && open;
  useEffect(() => {
    const html = document.documentElement;
    if (!shown) { delete html.dataset.roomChat; return; }
    html.dataset.roomChat = side ? 'side' : 'sheet';
    html.style.setProperty('--room-chat-h', `${sheetH}px`);
    html.style.setProperty('--room-chat-w', `${sideW}px`);
    return () => { delete html.dataset.roomChat; };
  }, [shown, side, sheetH, sideW]);

  if (!room) return null;

  const messages = room.messages.filter((m) => m.mine || !isMuted(prefs.muted, m));
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
  // Back to the game: the keyboard goes down and the chat closes; the text being typed stays for later.
  const backToGame = () => { (document.activeElement as HTMLElement | null)?.blur?.(); toggle(false); };
  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const block = room.send(draft);
    if (block) { setNotice({ block, at: Date.now() }); return; }
    setDraft(''); setNotice(null); setSent((n) => n + 1);
  };
  const showNotice = notice && now - notice.at < 2500 ? notice : null;

  // Where the open chat sits. With the keyboard up it follows the visible part of the screen (iOS overlays the keyboard).
  const kb = vp.kb;
  let frame: React.CSSProperties;
  if (side) frame = kb ? { top: vp.top, height: vp.height, right: 0, width: sideW } : { top: 0, bottom: 0, right: 0, width: sideW };
  else if (kb) {
    const h = Math.round(Math.max(150, Math.min(260, vp.height - Math.max(110, vp.height * 0.36))));
    frame = { top: vp.top + vp.height - h, height: h, left: 0, right: 0 };
  } else frame = { bottom: 0, height: sheetH, left: 0, right: 0 };
  const hidden = side ? 'translate-x-full' : 'translate-y-full';

  return (
    <>
      {/* Speech bubbles over player boxes. */}
      {bubbles.map((b) => (
        <span key={`${b.id}-${b.at}`} style={{ left: b.x, top: b.y }}
          className={`bw-result pointer-events-none fixed z-[78] max-w-[200px] -translate-y-[calc(100%+4px)] truncate rounded-2xl rounded-bl-sm px-2.5 py-1 text-xs font-bold shadow-[0_6px_18px_rgba(0,0,0,.45)] ${b.emote ? 'bg-(--accent,#e8b04a) text-(--accent-ink,#1c1406)' : 'border border-black/10 bg-white text-[#17140d]'}`}>
          {b.text}
        </span>
      ))}

      {/* Tab on the right edge: opens the chat, shows the unread count and messages with no box to sit on. */}
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

      {/* No backdrop: the game stays visible and playable with the chat open. Above game layers (some portal their table at
          z-70 with a fixed dock), under full-screen intros and modals (z-100 and up). */}
      <aside data-room-chat-panel aria-hidden={!open} inert={!open} style={frame}
        className={`fixed z-[80] flex flex-col border-white/10 bg-[#0d0d11]/97 text-[#e6e9f0] shadow-[0_-10px_40px_rgba(0,0,0,.5)] backdrop-blur transition-transform duration-300 ${side ? 'border-l' : 'rounded-t-2xl border-t'} ${open ? 'translate-x-0 translate-y-0' : `pointer-events-none ${hidden}`}`}>
        <StatusBar t={t} status={live ? status : null} now={now} off={prefs.off} compact={kb} onBack={backToGame}
          onOff={() => setChatOff(!prefs.off)} onClose={backToGame} />

        {prefs.off ? (
          <p className="flex min-h-0 flex-1 items-center justify-center break-keep px-6 text-center text-xs leading-5 text-white/45">{t('offDesc')}</p>
        ) : (
          <Lines t={t} messages={messages} reset={`${open}|${kb}|${side}|${sent}`} />
        )}

        {!prefs.off && !kb && (mutedHere > 0 || prefs.muted.length > 0) && (
          <p className="flex shrink-0 items-center justify-between gap-2 border-t border-white/5 px-3 py-1 text-[10px] text-white/40">
            <span>{mutedHere > 0 ? t('mutedHere', { n: mutedHere }) : t('mutedSome')}</span>
            <button type="button" onClick={clearMuted} className="font-bold text-white/60 underline-offset-2 hover:underline">{t('unmuteAll')}</button>
          </p>
        )}

        {!prefs.off && (
          <form onSubmit={send} className={`shrink-0 border-t border-white/10 px-2 pt-1.5 ${kb ? 'pb-1.5' : 'pb-[calc(0.375rem+env(safe-area-inset-bottom))]'}`}>
            {/* Quick reactions; hidden while typing so the keyboard leaves room for the game. */}
            {!kb && (
              <div className="mb-1.5 grid grid-cols-5 gap-1">
                {EMOTES.map((text) => (
                  <button key={text} type="button" onClick={() => room.emote(text)} className="rounded-md border border-white/15 bg-white/5 py-1 text-xs font-black text-white/80 hover:border-(--accent,#e8b04a)/60 active:scale-95">{text}</button>
                ))}
              </div>
            )}
            {showNotice && <p className="mb-1 px-1 text-[11px] font-bold text-[#ffb3aa]">{t(`block_${showNotice.block}`)}</p>}
            <div className="flex gap-1.5">
              <input
                data-room-chat-input value={draft} maxLength={CHAT_MAX_LEN} onChange={(event) => setDraft(event.target.value)}
                // Keep game shortcuts (letters, Space, Enter) from firing while typing.
                onKeyDown={(event) => { event.stopPropagation(); if (event.key === 'Escape') backToGame(); }} onKeyUp={(event) => event.stopPropagation()}
                placeholder={t('placeholder')} enterKeyHint="send" autoComplete="off"
                // 16px: iOS Safari zooms the page into smaller inputs.
                className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-[16px] text-white outline-none placeholder:text-[14px] placeholder:text-white/30 focus:border-(--accent,#e8b04a)"
              />
              <button type="submit" onMouseDown={(event) => event.preventDefault()} disabled={!draft.trim()} className="flex items-center justify-center rounded-lg bg-(--accent,#e8b04a) px-3 text-(--accent-ink,#1c1406) disabled:opacity-40" aria-label={t('send')}><Send size={15} /></button>
            </div>
          </form>
        )}
      </aside>
    </>
  );
}

type T = ReturnType<typeof useTranslations<'RoomChat'>>;

/**
 * The game in one or two lines at the top of the chat. My move: a big button back to the game, with the clock.
 * Otherwise whose move it is and the clock, then the game's own line (score, last move, what I do next).
 */
function StatusBar({ t, status, now, off, compact, onBack, onOff, onClose }: {
  t: T; status: ChatStatus | null; now: number; off: boolean; compact: boolean; onBack: () => void; onOff: () => void; onClose: () => void;
}) {
  // a clock far off (some games park the deadline at "never") is no clock
  const left = status?.deadline && status.deadline - now < 3_600_000 ? Math.max(0, Math.ceil((status.deadline - now) / 1000)) : null;
  const clock = left != null && (
    <span className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[12px] font-black ${left <= 5 ? 'animate-pulse bg-[#ff5a3d] text-white' : 'bg-white/10 text-white/85'}`}>
      <Timer size={11} />{left}
    </span>
  );
  const extra = status ? [status.text, status.score, status.last].filter(Boolean) as string[] : [];
  const controls = (
    <>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onOff} className="shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 text-[10.5px] font-bold text-white/55 hover:bg-white/10">{off ? t('turnOn') : t('turnOff')}</button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClose} className="shrink-0 rounded-md p-1 text-white/55 hover:bg-white/10 hover:text-white" aria-label={t('close')} title={t('close')}><ChevronDown size={18} /></button>
    </>
  );
  if (!status) {
    return (
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">{t('title')}</p>
          {!compact && <p className="truncate text-[10px] text-white/40">{t('notSaved')}</p>}
        </div>
        {controls}
      </div>
    );
  }
  return (
    <div data-room-chat-status className="shrink-0 border-b border-white/10 bg-white/[.03] px-2 pb-1.5 pt-1.5">
      <div className="flex items-center gap-1.5">
        {status.mine ? (
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onBack}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ffd36e] py-2 text-[15px] font-black text-[#241457] shadow-[0_6px_20px_rgba(255,211,110,.35)] active:scale-[.98]">
            <span className="truncate">{t('myTurn')}</span>
            {left != null && <span className="shrink-0 rounded-full bg-[#241457] px-2 py-0.5 font-mono text-[12px] text-[#ffd36e]">{left}</span>}
          </button>
        ) : (
          <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px] font-black">
            <span className="h-2 w-2 shrink-0 rounded-full bg-(--accent,#e8b04a) shadow-[0_0_8px_var(--accent,#e8b04a)]" />
            <span className="min-w-0 truncate">{status.who ? t('theirTurn', { name: status.who }) : t('playing')}</span>
            {clock}
          </p>
        )}
        {controls}
      </div>
      {extra.length > 0 && (
        <p className="mt-1 truncate px-0.5 text-[11.5px] font-bold text-white/65">
          {extra.map((x, i) => <span key={i}>{i > 0 && <span className="mx-1.5 text-white/25">·</span>}{x}</span>)}
        </p>
      )}
    </div>
  );
}

/** The message list, kept on the newest line (useChatBottom) unless the player scrolled up to read. */
function Lines({ t, messages, reset }: { t: T; messages: ChatMessage[]; reset: string }) {
  const { list, unread, jump } = useChatBottom(messages[messages.length - 1]?.key, reset);
  return (
    <div className="relative min-h-0 flex-1">
      <div ref={list} className="h-full overflow-y-auto overscroll-contain px-3 py-2">
        <div className="space-y-1.5">
          {messages.length === 0 && <p className="break-keep pt-3 text-center text-xs leading-5 text-white/35">{t('empty')}</p>}
          {messages.map((m) => (
            <div key={m.key} className={`flex items-start gap-1.5 text-[13px] leading-5 ${m.mine ? 'justify-end' : ''}`}>
              {m.mine ? (
                <p className="max-w-[85%] break-words rounded-2xl rounded-br-sm bg-(--accent,#e8b04a) px-2.5 py-1 text-(--accent-ink,#1c1406)">{m.text}</p>
              ) : (
                <>
                  <p className="min-w-0 max-w-[85%] break-words rounded-2xl rounded-bl-sm bg-white/[.07] px-2.5 py-1"><b className="mr-1.5 text-[12px] text-white/55">{m.name}</b>{m.text}</p>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setMuted(m, true)} className="mt-1 shrink-0 rounded p-0.5 text-white/25 hover:bg-white/10 hover:text-[#ff8b96]" aria-label={t('mute', { name: m.name })} title={t('mute', { name: m.name })}><Ban size={12} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {unread && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={jump}
          className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-(--accent,#e8b04a) px-3 py-1 text-[11px] font-black text-(--accent-ink,#1c1406) shadow-lg">
          {t('newBelow')}<ArrowDown size={12} />
        </button>
      )}
    </div>
  );
}

/**
 * The screen as the chat needs it, from visualViewport: is the keyboard up (something focused and the visible height
 * well under the tallest seen, whether the browser resizes the page — Android Chrome, the Play app — or overlays it —
 * iOS Safari), the visible part's top and height, and whether the screen is wide (desktop, or a phone on its side).
 */
function useViewport(active: boolean) {
  const [vp, setVp] = useState({ kb: false, top: 0, height: 0, width: 0, tall: 0, wide: false });
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    let width = window.innerWidth;
    let tallest = Math.max(window.innerHeight, vv?.height ?? 0);
    const read = () => {
      if (Math.abs(window.innerWidth - width) > 40) { width = window.innerWidth; tallest = window.innerHeight; } // turned
      const h = vv?.height ?? window.innerHeight;
      tallest = Math.max(tallest, h, document.activeElement instanceof HTMLInputElement ? 0 : window.innerHeight);
      const el = document.activeElement;
      const focused = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el instanceof HTMLElement && el.isContentEditable);
      const next = {
        kb: focused && h < tallest * 0.78,
        top: Math.round(vv?.offsetTop ?? 0), height: Math.round(h), width: window.innerWidth, tall: Math.round(tallest),
        wide: window.innerWidth >= 1024 || (window.innerWidth >= 600 && window.innerWidth > tallest),
      };
      setVp((p) => (p.kb === next.kb && p.top === next.top && p.height === next.height && p.width === next.width && p.tall === next.tall && p.wide === next.wide ? p : next));
    };
    const later = () => window.setTimeout(read, 120);
    read();
    vv?.addEventListener('resize', read);
    vv?.addEventListener('scroll', read);
    window.addEventListener('resize', read);
    document.addEventListener('focusin', read);
    document.addEventListener('focusout', later);
    return () => {
      vv?.removeEventListener('resize', read); vv?.removeEventListener('scroll', read); window.removeEventListener('resize', read);
      document.removeEventListener('focusin', read); document.removeEventListener('focusout', later);
    };
  }, [active]);
  return vp;
}

/** The on-screen box marked for this player, if any (the first one that is actually visible). */
function visibleBox(id: string) {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-chat-seat="${CSS.escape(id)}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && r.left >= 0 && r.right <= window.innerWidth + 1) return r;
  }
  return null;
}
