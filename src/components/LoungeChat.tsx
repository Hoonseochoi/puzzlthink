"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Ban, Flag, MessageCircleOff, Send, Users, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { chatPrefs, chatPrefsServer, chatSnapshot, clearMuted, isMuted, setMuted, subscribeChat } from '@/lib/roomChat';
import { LOUNGE_KEEP, LOUNGE_MAX_LEN, type LoungeBan, type LoungeMessage, type LoungeReason, isLoungeMessage, loadLounge, loungeOff, loungeOffServer, reportLounge, sendLounge, setLoungeOff, subscribeLoungeOff, visibilityStore } from '@/lib/lounge';
import { useAuth } from './AuthProvider';
import AuthButton from './AuthButton';

type Notice = { reason: LoungeReason | 'reported'; wait: number; n: number };
let noticeSeq = 0;

/**
 * Lounge (라운지): one chat shared by the whole site, on the home page and every game page, mostly to find
 * people for open rooms. Same look as the room chat (a tab on the right edge opens a drawer); in an open room
 * its tab sits under the room chat's. Each name shows the game that person is on, and a pinned card from the
 * lounge host Viky gives the rules. It joins Realtime only while this page is visible and the lounge is on;
 * the database decides what may be sent (see src/lib/lounge.ts).
 */
export default function LoungeChat({ game }: { game: string | null }) {
  const t = useTranslations('Lounge');
  const tc = useTranslations('Common');
  const { user, configured } = useAuth();
  const prefs = useSyncExternalStore(subscribeChat, chatPrefs, chatPrefsServer);
  const off = useSyncExternalStore(subscribeLoungeOff, loungeOff, loungeOffServer);
  const visible = useSyncExternalStore(...visibilityStore);
  const roomChat = useSyncExternalStore(subscribeChat, chatSnapshot, () => null);
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
  const listRef = useRef<HTMLDivElement>(null);
  // Read by the Realtime handler (counts unread messages from others while the drawer is closed).
  const seen = useRef({ open: false, me: null as string | null, muted: [] as string[] });
  useEffect(() => { seen.current = { open, me, muted: prefs.muted }; });

  // Join while visible and on; history (last 50) is reloaded on every join so nothing is missed.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || off || !visible) return;
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
        const s = seen.current;
        if (!s.open && payload.sender !== s.me && !isMuted(s.muted, { from: payload.sender })) setUnread((n) => n + 1);
      })
      .on('broadcast', { event: 'del' }, ({ payload }) => {
        const id = Number((payload as { id?: unknown })?.id);
        setMessages((list) => list.filter((m) => m.id !== id));
      })
      .subscribe((status) => { if (status === 'SUBSCRIBED') refresh(); });
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [off, visible, user?.id]);

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

  const toggle = useCallback((value: boolean) => { setOpen(value); setUnread(0); }, []);
  const turn = (value: boolean) => { setLoungeOff(value); if (value) { setMessages([]); setUnread(0); } };

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

  if (!configured) return null;

  const mutedHere = new Set(messages.filter((m) => m.sender !== me && isMuted(prefs.muted, { from: m.sender })).map((m) => m.sender)).size;
  const banLeft = ban && ban.until > now ? ban.until - now : 0;
  const banText = (reason: string) => (reason === 'reports' ? 'bannedReports' : reason === 'repeat' ? 'bannedRepeat' : 'banned');
  const showNotice = notice;
  const gameName = (id: string | null) => (id && tc.has(id) ? tc(id) : null);
  const minutes = (ms: number) => Math.max(1, Math.ceil(ms / 60_000));

  return (
    <>
      {/* Tab on the right edge, the room chat's spot; under the room chat's tab when a room is open. */}
      <button type="button" onClick={() => { if (off) turn(false); toggle(!open); }} aria-label={t('open')} aria-expanded={open}
        className={`fixed right-0 z-40 ${roomChat ? 'top-[calc(60%+5.5rem)] lg:top-[calc(46%+5.5rem)]' : 'top-[60%] lg:top-[46%]'} flex flex-col items-center gap-1 rounded-l-xl border border-r-0 border-white/15 bg-[#0d0d11]/95 px-2 py-3 text-[10px] font-black text-white shadow-[0_0_18px_rgba(0,0,0,.35)] backdrop-blur`}>
        {off ? <MessageCircleOff size={14} className="text-white/45" /> : <Users size={14} className="text-(--accent,#e8b04a)" />}
        <span className="[writing-mode:vertical-rl]">{t('title')}</span>
        {!off && !open && unread > 0 && <span className="absolute -left-2 -top-2 min-w-5 rounded-full bg-[#ff4d5e] px-1 text-center text-[10px] font-black leading-5 text-white shadow-[0_0_10px_rgba(255,77,94,.5)]">{unread > 9 ? '9+' : unread}</span>}
      </button>

      <div className="pointer-events-none fixed inset-0 z-50">
        <div onClick={() => toggle(false)} className={`absolute inset-0 bg-black/40 transition-opacity lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'opacity-0'}`} />
        <aside className={`${open ? 'pointer-events-auto' : ''} absolute bottom-0 right-0 top-0 flex w-[84vw] max-w-[320px] flex-col border-l border-white/10 bg-[#0d0d11]/97 text-[#e6e9f0] shadow-2xl backdrop-blur transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
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
            <div ref={listRef} className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2.5">
              {/* Pinned welcome from the lounge host, with the rules. */}
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[.04] p-2.5">
                <div className="flex items-center gap-2">
                  <img src="/lounge/viky.jpg" alt={t('hostName')} width={36} height={36} className="h-9 w-9 shrink-0 rounded-[10px] object-cover" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-black">{t('hostName')} <span className="ml-0.5 rounded bg-(--accent,#e8b04a)/20 px-1 py-px text-[9px] font-black text-(--accent,#e8b04a)">{t('hostBadge')}</span></p>
                    <p className="break-keep text-[11px] leading-4 text-white/70">{t('hostHello')}</p>
                  </div>
                </div>
                <ul className="mt-2 space-y-0.5 break-keep text-[10.5px] leading-4 text-white/50">
                  {(['rule1', 'rule2', 'rule3', 'rule4'] as const).map((key) => <li key={key}>· {t(key)}</li>)}
                </ul>
              </div>
              {shown.length === 0 && <p className="break-keep pt-2 text-center text-xs leading-5 text-white/35">{t('empty')}</p>}
              {shown.map((m) => {
                const label = gameName(m.game);
                const mine = m.sender === me;
                return (
                  <div key={m.id} className={`group flex items-start gap-1 text-[13px] leading-5 ${mine ? 'flex-col items-end' : ''}`}>
                    {mine ? (
                      <>
                        {label && <span className="px-1 text-[10px] text-white/35">{label}</span>}
                        <p className="max-w-[85%] break-words rounded-2xl rounded-br-sm bg-(--accent,#e8b04a) px-2.5 py-1 text-(--accent-ink,#1c1406)">{m.text}</p>
                      </>
                    ) : (
                      <>
                        <p className="min-w-0 max-w-[80%] break-words rounded-2xl rounded-bl-sm bg-white/[.07] px-2.5 py-1">
                          <b className="mr-1.5 text-[12px] text-white/55">{m.name}{label && <span className="font-normal text-white/35">({label})</span>}</b>{m.text}
                        </p>
                        <button type="button" onClick={() => report(m)} disabled={!user || reported.has(m.id)} className="mt-1 shrink-0 rounded p-0.5 text-white/25 hover:bg-white/10 hover:text-[#ffb35c] disabled:opacity-30" aria-label={t('report')} title={reported.has(m.id) ? t('reportedOne') : t('report')}><Flag size={12} /></button>
                        <button type="button" onClick={() => setMuted({ from: m.sender }, true)} className="mt-1 shrink-0 rounded p-0.5 text-white/25 hover:bg-white/10 hover:text-[#ff8b96]" aria-label={t('mute', { name: m.name })} title={t('mute', { name: m.name })}><Ban size={12} /></button>
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
