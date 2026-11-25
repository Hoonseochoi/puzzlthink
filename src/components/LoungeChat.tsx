"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Ban, ChevronRight, Flag, MessageCircle, MessageCircleOff, Send, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { usePathname } from '@/i18n/routing';
import { LOUNGE_OPEN_EVENT, isGamePath, setLoungeUnread, useOnlineCount } from '@/lib/siteBus';
import { GAMES } from '@/lib/gameCatalog';
import { chatPrefs, chatPrefsServer, clearMuted, isMuted, roomPlaying, setMuted, subscribeChat } from '@/lib/roomChat';
import { LOUNGE_KEEP, LOUNGE_MAX_LEN, type LoungeBan, type LoungeMessage, type LoungeReason, isLoungeMessage, falseOnServer, loadLounge, loungeMini, loungeOff, loungeOffServer, loungeSeen, markLoungeSeen, setLoungeMini, trueOnServer, reportLounge, sendLounge, setLoungeOff, subscribeLoungeOff, visibilityStore } from '@/lib/lounge';
import { useAuth } from './AuthProvider';
import AuthButton from './AuthButton';
import { Stone } from './StoneAvatar';

type Notice = { reason: LoungeReason | 'reported'; wait: number; n: number };
let noticeSeq = 0;

/**
 * Lounge (라운지): one chat shared by the whole site, on every page (mounted once in the layout) except a friend or
 * open room whose match has started (its lobby shows both the room chat and the lounge); mostly to find
 * people for open rooms. A translucent button in the bottom-right corner (with an UPDATE tag until the lounge
 * is first opened) opens a drawer like the room chat's; "hide" shrinks it to a small faint icon.
 * Each line reads "[icon] 닉네임(게임) : message" (the player's profile icon, as everywhere else); site operators get a "퍼띵 운영자" badge and their own colour, and a
 * pinned card from the lounge host Viky says hello. It joins Realtime only while this page is visible and
 * the lounge is on; the database decides what may be sent (see src/lib/lounge.ts).
 */
export default function LoungeChat() {
  // Which game this page is (a name in the lounge shows it): the catalog entry whose route this page is under.
  const pathname = usePathname();
  const game = GAMES.find((g) => pathname === g.href || pathname.startsWith(`${g.href}/`))?.id ?? null;
  const playing = useSyncExternalStore(subscribeChat, roomPlaying, () => false);
  const t = useTranslations('Lounge');
  const tc = useTranslations('Common');
  const { user, configured } = useAuth();
  const prefs = useSyncExternalStore(subscribeChat, chatPrefs, chatPrefsServer);
  const off = useSyncExternalStore(subscribeLoungeOff, loungeOff, loungeOffServer);
  const visible = useSyncExternalStore(...visibilityStore);
  const mini = useSyncExternalStore(subscribeLoungeOff, loungeMini, falseOnServer);
  const seen = useSyncExternalStore(subscribeLoungeOff, loungeSeen, trueOnServer);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<LoungeMessage[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [ban, setBan] = useState<LoungeBan | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [reported, setReported] = useState<Set<number>>(() => new Set());
  const [unread, setUnread] = useState(0);
  const [now, setNow] = useState(0);
  // Swipe right on the open drawer to close it: how far it is being dragged, and where the touch began.
  const [dragX, setDragX] = useState(0);
  const touch = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Read by the Realtime handler (counts unread messages from others while the drawer is closed).
  const live = useRef({ open: false, me: null as string | null, muted: [] as string[] });
  useEffect(() => { live.current = { open, me, muted: prefs.muted }; });

  // Join while visible and on; history (last 50) is reloaded on every join so nothing is missed.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || off || !visible || playing) return; // no Realtime join during a room match
    let alive = true;
    const refresh = () => loadLounge().then((state) => {
      if (!alive || !state) return;
      setMessages(state.messages);
      setMe(state.me);
      setBan(state.ban);
    });
    const channel = supabase.channel('lounge')
      .on('broadcast', { event: 'msg' }, ({ payload }) => {
        if (!isLoungeMessage(payload)) return;
        setMessages((list) => (list.some((m) => m.id === payload.id) ? list : [...list, payload].slice(-LOUNGE_KEEP)));
        const s = live.current;
        if (!s.open && payload.sender !== s.me && !isMuted(s.muted, { from: payload.sender })) setUnread((n) => n + 1);
      })
      .on('broadcast', { event: 'del' }, ({ payload }) => {
        const id = Number((payload as { id?: unknown })?.id);
        setMessages((list) => list.filter((m) => m.id !== id));
      })
      .subscribe((status) => { if (status === 'SUBSCRIBED') refresh(); });
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [off, visible, playing, user?.id]);

  // A clock for the ban countdown.
  useEffect(() => {
    if (!ban) return;
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(first); window.clearInterval(timer); };
  }, [ban]);

  // Short notices fade after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice((cur) => (cur?.n === notice.n ? null : cur)), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const shown = messages.filter((m) => m.sender === me || !isMuted(prefs.muted, { from: m.sender }));
  useEffect(() => {
    const list = listRef.current;
    if (open && list) list.scrollTop = list.scrollHeight;
  }, [open, shown.length]);

  const toggle = useCallback((value: boolean) => { setOpen(value); setUnread(0); if (value) markLoungeSeen(); }, []);
  const turn = (value: boolean) => { setLoungeOff(value); if (value) { setMessages([]); setUnread(0); } };
  // The phone tab bar's lounge button opens the drawer and shows the unread count.
  useEffect(() => {
    const onOpen = () => { setLoungeOff(false); toggle(true); };
    window.addEventListener(LOUNGE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(LOUNGE_OPEN_EVENT, onOpen);
  }, [toggle]);
  useEffect(() => { setLoungeUnread(off ? 0 : unread); }, [off, unread]);
  const online = useOnlineCount();
  const inGame = isGamePath(pathname);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const result = await sendLounge(text, game);
    setSending(false);
    if (result.ok) {
      setDraft(''); setNotice(null);
      return; // the broadcast brings it back to this tab too
    }
    if (result.ban) setBan(result.ban);
    setNotice({ reason: result.reason, wait: Math.max(1, Math.ceil((result.waitMs ?? 0) / 1000)), n: ++noticeSeq });
  };

  const report = async (m: LoungeMessage) => {
    if (reported.has(m.id)) return;
    if (await reportLounge(m.id)) {
      setReported((set) => new Set(set).add(m.id));
      setNotice({ reason: 'reported', wait: 0, n: ++noticeSeq });
    }
  };

  // Every page has the lounge, except a friend or open room whose match is on.
  if (!configured || playing) return null;

  const mutedHere = new Set(messages.filter((m) => m.sender !== me && isMuted(prefs.muted, { from: m.sender })).map((m) => m.sender)).size;
  const banLeft = ban && ban.until > now ? ban.until - now : 0;
  const banText = (reason: string) => (reason === 'reports' ? 'bannedReports' : reason === 'repeat' ? 'bannedRepeat' : 'banned');
  const showNotice = notice;
  const gameName = (id: string | null) => (id && tc.has(id) ? tc(id) : null);
  const minutes = (ms: number) => Math.max(1, Math.ceil(ms / 60_000));

  return (
    <>
      {/* Floating button in the bottom-right corner, just above the "지금 N명 접속 중" pill (both move up over a
          game entry screen's start bar). Hidden, it shrinks to a small faint icon that brings it back. */}
      {/* Phones: the tab bar holds the lounge button outside games; inside a game it is a slim handle on the right
          edge (under the room chat's handle), with the online count. */}
      {inGame && (
        <button type="button" onClick={() => { if (off) turn(false); toggle(true); }} aria-label={t('open')}
          className={`fixed right-0 top-[74%] z-40 flex flex-col items-center gap-0.5 rounded-l-xl border border-r-0 border-white/15 bg-[#0d0d11]/85 px-1.5 py-2 text-white shadow-[0_0_18px_rgba(0,0,0,.35)] backdrop-blur-md transition sm:hidden ${open ? 'pointer-events-none opacity-0' : mini ? 'opacity-55' : ''}`}>
          {off ? <MessageCircleOff size={15} className="text-white/45" /> : <MessageCircle size={15} className="text-(--accent,#e8b04a)" />}
          {online != null && <span className="flex items-center gap-[3px] text-[9px] font-black leading-none text-white/75"><i className="h-1 w-1 rounded-full bg-[#34c47c]" />{online > 999 ? '999+' : online}</span>}
          {!off && unread > 0 && <UnreadBadge n={unread} className="-left-2 -top-2" />}
        </button>
      )}
      <div className={`max-sm:hidden fixed bottom-[calc(2.6rem+env(safe-area-inset-bottom))] right-3 z-40 [body:has([data-gate-bar])_&]:bottom-[calc(6.6rem+env(safe-area-inset-bottom))] ${open ? 'pointer-events-none opacity-0' : ''}`}>
        {mini ? (
          <button type="button" onClick={() => setLoungeMini(false)} aria-label={t('show')} title={t('show')}
            className="relative grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-black/35 text-white/60 opacity-70 backdrop-blur-md transition hover:opacity-100">
            <MessageCircle size={13} />
            {!off && unread > 0 && <UnreadBadge n={unread} className="-right-2 -top-2" />}
          </button>
        ) : (
          <div className="relative flex items-center">
            {!seen && <span className="pointer-events-none absolute -top-[19px] left-0.5 rounded-full bg-[#ff4d5e] px-1.5 py-px text-[8.5px] font-black tracking-wide text-white shadow-[0_0_10px_rgba(255,77,94,.45)]">UPDATE</span>}
            <button type="button" onClick={() => { if (off) turn(false); toggle(true); }} aria-label={t('open')}
              className="relative flex items-center gap-1.5 rounded-l-full rounded-r-md border border-white/15 bg-black/45 py-1.5 pl-3 pr-2.5 text-[12px] font-black text-white/90 shadow-[0_4px_16px_rgba(0,0,0,.25)] backdrop-blur-md transition hover:bg-black/60">
              {off ? <MessageCircleOff size={14} className="text-white/45" /> : <MessageCircle size={14} className="text-(--accent,#e8b04a)" />}
              {t('title')}
              {!off && unread > 0 && <UnreadBadge n={unread} className="-right-2 -top-2.5" />}
            </button>
            <button type="button" onClick={() => setLoungeMini(true)} aria-label={t('hide')} title={t('hide')}
              className="ml-px grid h-[30px] place-items-center rounded-l-md rounded-r-full border border-white/15 bg-black/45 pl-1 pr-1.5 text-white/50 backdrop-blur-md transition hover:bg-black/60 hover:text-white">
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed inset-0 z-50">
        <div onClick={() => toggle(false)} className={`absolute inset-0 bg-black/40 transition-opacity lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'opacity-0'}`} />
        <aside
          onTouchStart={(event) => { const p = event.touches[0]; touch.current = { x: p.clientX, y: p.clientY, horizontal: null }; }}
          onTouchMove={(event) => {
            const start = touch.current;
            if (!start) return;
            const p = event.touches[0];
            const dx = p.clientX - start.x, dy = p.clientY - start.y;
            // Decide once per touch whether this is a sideways swipe; vertical moves keep scrolling the list.
            if (start.horizontal === null && Math.abs(dx) + Math.abs(dy) > 8) start.horizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
            if (start.horizontal) setDragX(Math.max(0, dx));
          }}
          onTouchEnd={() => { if (touch.current?.horizontal && dragX > 70) toggle(false); touch.current = null; setDragX(0); }}
          onTouchCancel={() => { touch.current = null; setDragX(0); }}
          style={dragX > 0 ? { transform: `translateX(${dragX}px)`, transition: 'none' } : undefined}
          className={`${open ? 'pointer-events-auto' : ''} absolute bottom-0 right-0 top-0 flex w-[84vw] max-w-[320px] flex-col border-l border-white/10 bg-[#0d0d11]/97 text-[#e6e9f0] shadow-2xl backdrop-blur transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">{t('title')}</p>
              <p className="truncate text-[10px] text-white/40">{t('desc')}</p>
            </div>
            <button type="button" onClick={() => turn(!off)} className="rounded-md border border-white/15 px-2 py-1 text-[11px] font-bold text-white/60 hover:bg-white/10">{off ? t('turnOn') : t('turnOff')}</button>
            <button type="button" onClick={() => toggle(false)} className="rounded-md p-1 text-white/45 hover:bg-white/10 hover:text-white" aria-label={t('close')}><X size={16} /></button>
          </div>

          {off ? (
            <p className="flex flex-1 items-center justify-center break-keep px-6 text-center text-xs leading-5 text-white/45">{t('offDesc')}</p>
          ) : (
            <div ref={listRef} className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2.5">
              {/* Pinned welcome from the lounge host. */}
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[.04] p-2.5">
                <div className="flex items-center gap-2">
                  <img src="/lounge/viky.jpg" alt={t('hostName')} width={36} height={36} className="h-9 w-9 shrink-0 rounded-[10px] object-cover" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-black">{t('hostName')} <span className="ml-0.5 rounded bg-(--accent,#e8b04a)/20 px-1 py-px text-[9px] font-black text-(--accent,#e8b04a)">{t('hostBadge')}</span></p>
                    <p className="break-keep text-[11px] leading-4 text-white/70">{t('hostHello')}</p>
                  </div>
                </div>
              </div>
              {shown.length === 0 && <p className="break-keep pt-2 text-center text-xs leading-5 text-white/35">{t('empty')}</p>}
              {/* One line each: [icon] 닉네임(게임) : message; operators get a badge and their own colour instead of an icon. */}
              {shown.map((m) => {
                const label = gameName(m.game);
                const mine = m.sender === me;
                return (
                  <div key={m.id} className={`group flex items-start gap-1 rounded-lg px-1.5 py-1 text-[13px] leading-5 ${m.staff ? 'border border-[#5ec8ff]/30 bg-[#5ec8ff]/10' : mine ? 'bg-(--accent,#e8b04a)/10' : 'hover:bg-white/[.04]'}`}>
                    <p className="min-w-0 flex-1 break-words">
                      {m.staff ? <span className="mr-1 rounded bg-[#5ec8ff] px-1 py-px align-[1px] text-[9.5px] font-black text-[#04121c]">{t('staffBadge')}</span>
                        : <span className="mr-1.5 inline-block align-[-5px]"><Stone name={m.name} size={20} /></span>}
                      <b className={`text-[12px] ${m.staff ? 'text-[#7fd6ff]' : mine ? 'text-(--accent,#e8b04a)' : 'text-white/70'}`}>{m.name}</b>
                      {label && <span className="text-[11px] text-white/35">({label})</span>}
                      <span className="mx-1 text-white/30">:</span>
                      <span className={m.staff ? 'font-bold text-[#dff4ff]' : 'text-white/90'}>{m.text}</span>
                      <time dateTime={new Date(m.at).toISOString()} className="ml-1.5 whitespace-nowrap font-mono text-[9.5px] text-white/30">{sentAt(m.at)}</time>
                    </p>
                    {!mine && !m.staff && (
                      <>
                        <button type="button" onClick={() => report(m)} disabled={!user || reported.has(m.id)} className="mt-0.5 shrink-0 rounded p-0.5 text-white/25 hover:bg-white/10 hover:text-[#ffb35c] disabled:opacity-30" aria-label={t('report')} title={reported.has(m.id) ? t('reportedOne') : t('report')}><Flag size={12} /></button>
                        <button type="button" onClick={() => setMuted({ from: m.sender }, true)} className="mt-0.5 shrink-0 rounded p-0.5 text-white/25 hover:bg-white/10 hover:text-[#ff8b96]" aria-label={t('mute', { name: m.name })} title={t('mute', { name: m.name })}><Ban size={12} /></button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!off && mutedHere > 0 && (
            <p className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-1.5 text-[10px] text-white/40">
              <span>{t('mutedHere', { n: mutedHere })}</span>
              <button type="button" onClick={clearMuted} className="font-bold text-white/60 underline-offset-2 hover:underline">{t('unmuteAll')}</button>
            </p>
          )}

          {!off && (
            <div className="border-t border-white/10 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
              {!user ? (
                <div className="flex flex-col items-center gap-2 px-1 py-1 text-center">
                  <p className="break-keep text-[11px] font-bold leading-5 text-white/55">{t('login')}</p>
                  <AuthButton source="lounge" />
                </div>
              ) : banLeft > 0 ? (
                <p className="break-keep px-1 py-2 text-center text-[12px] font-bold leading-5 text-[#ffb3aa]">{t(banText(ban?.reason ?? ''), { m: minutes(banLeft) })}</p>
              ) : (
                <form onSubmit={send}>
                  {showNotice && (
                    <p className="mb-1.5 px-1 text-[11px] font-bold text-[#ffb3aa]">
                      {showNotice.reason === 'reported' ? t('reportedOne') : t(`block_${showNotice.reason}`, { s: showNotice.wait })}
                    </p>
                  )}
                  <div className="flex gap-1.5">
                    <input
                      value={draft} maxLength={LOUNGE_MAX_LEN} onChange={(event) => setDraft(event.target.value)}
                      // Keep game shortcuts (letters, Space, Enter) from firing while typing.
                      onKeyDown={(event) => { event.stopPropagation(); if (event.key === 'Escape') toggle(false); }} onKeyUp={(event) => event.stopPropagation()}
                      placeholder={t('placeholder')} enterKeyHint="send" autoComplete="off"
                      className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-(--accent,#e8b04a)"
                    />
                    <button type="submit" disabled={!draft.trim() || sending} className="flex items-center justify-center rounded-lg bg-(--accent,#e8b04a) px-3 text-(--accent-ink,#1c1406) disabled:opacity-40" aria-label={t('send')}><Send size={15} /></button>
                  </div>
                </form>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

/** When a message was sent, small: "15:42" today, "11/22 15:42" on an earlier day (viewer's local time). */
function sentAt(at: number) {
  const d = new Date(at);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return d.toDateString() === new Date().toDateString() ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

/** Red count of new messages on top of the lounge button; 99+ past 99. */
function UnreadBadge({ n, className }: { n: number; className: string }) {
  return (
    <span className={`pointer-events-none absolute min-w-[18px] rounded-full border border-[#0d0d11]/60 bg-[#ff3b4f] px-1 text-center font-mono text-[10px] font-black leading-[16px] text-white shadow-[0_0_10px_rgba(255,59,79,.55)] ${className}`}>
      {n > 99 ? '99+' : n}
    </span>
  );
}
