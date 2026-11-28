"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BellRing, Loader2, LogIn, X } from 'lucide-react';
import type { GameId } from '@/lib/gameCatalog';
import { listOpenRooms } from '@/lib/openRooms';
import {
  INVITE_COOLDOWN_MS, INVITE_MAX, INVITE_MS, dismissInvite, getInvite, getNoInvite, sentTimes, setInvitesOffToday, subscribeInvite, watchAiLobby,
} from '@/lib/aiLobby';
import { useAuth } from './AuthProvider';
import { Stone } from './StoneAvatar';
import { openRoomHref } from './gameModes';

/**
 * Open room, host only, while it waits for players: "AI전 중인 N명에게 초대 보내기".
 * N is the presence count of the game's AI lobby. One send a minute, five per room; when the room fills, starts or
 * closes, a still-showing invite is taken back.
 */
export function AiInviteButton({ game, code, left }: { game: GameId; code: string; left: number }) {
  const t = useTranslations('OpenInvite');
  const { user, configured } = useAuth();
  const [count, setCount] = useState<number | null>(null);
  const [times, setTimes] = useState<number[]>(() => sentTimes(code));
  const [now, setNow] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const lobby = useRef<ReturnType<typeof watchAiLobby> | null>(null);
  const signedIn = !!user || !configured;
  const open = left > 0;

  useEffect(() => {
    if (!signedIn) return;
    const watch = watchAiLobby(game, setCount);
    lobby.current = watch;
    return () => { lobby.current = null; void watch.cancel(code).finally(watch.stop); };
  }, [signedIn, game, code]);
  // The room filled up: take the invite back.
  useEffect(() => { if (!open) void lobby.current?.cancel(code); }, [open, code]);
  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  if (!signedIn || !open) return null;
  const used = times.length;
  const wait = Math.max(0, Math.ceil((INVITE_COOLDOWN_MS - (now - (times.at(-1) ?? 0))) / 1000));
  const done = used >= INVITE_MAX;
  const disabled = sending || done || wait > 0 || !count;
  const label = done ? t('sendDone') : wait > 0 ? t('sendWait', { s: wait }) : count === null ? t('counting') : count === 0 ? t('nobody') : t('send', { n: count });

  const send = async () => {
    if (disabled || !lobby.current) return;
    setSending(true);
    await lobby.current.send(code);
    setTimes(sentTimes(code));
    setNow(Date.now());
    setSending(false);
  };

  return (
    <div>
      <button type="button" data-ai-invite disabled={disabled} onClick={send}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-(--accent)/45 bg-(--accent)/10 py-2.5 text-xs font-black text-white transition hover:bg-(--accent)/20 disabled:border-white/10 disabled:bg-white/[.03] disabled:text-white/45">
        {sending ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} className={disabled ? '' : 'text-(--accent)'} />}{label}
      </button>
      <p className="mt-1 text-center text-[10px] leading-4 text-white/35">{t('sendHint', { n: INVITE_MAX - used, max: INVITE_MAX })}</p>
    </div>
  );
}

type Note = 'gone' | 'full' | null;

/**
 * Mounted once in the layout. Shows an open-room invite to a player who is in an AI game of that game (only those
 * tabs are in the lobby, see lib/aiLobby). A small card at the top, away from the board: it slides in, takes no
 * focus, and its buttons wait a moment before they take taps so a tap meant for the game is not caught.
 */
export default function OpenInvitePopup() {
  const invite = useSyncExternalStore(subscribeInvite, getInvite, getNoInvite);
  const t = useTranslations('OpenInvite');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [armed, setArmed] = useState(false);
  const [off, setOff] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [joining, setJoining] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const key = invite ? `${invite.code}-${invite.until}` : null;

  // A new invite: fresh card, taps after the entry animation.
  useEffect(() => {
    if (!key) return;
    const reset = window.setTimeout(() => { setArmed(false); setOff(false); setNote(null); setJoining(false); setNow(Date.now()); }, 0);
    const arm = window.setTimeout(() => setArmed(true), 700);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearTimeout(reset); window.clearTimeout(arm); window.clearInterval(tick); };
  }, [key]);

  // Expired, or the room filled up / started / closed (checked against the open-room list every 15 s).
  useEffect(() => {
    if (!invite) return;
    const left = invite.until - Date.now();
    const expire = window.setTimeout(dismissInvite, Math.max(0, left));
    const check = window.setInterval(() => {
      listOpenRooms(invite.game).then((rows) => {
        const row = rows.find((r) => r.code === invite.code);
        if (!row || row.players >= row.capacity) dismissInvite();
      });
    }, 15_000);
    return () => { window.clearTimeout(expire); window.clearInterval(check); };
  }, [invite]);

  if (!invite) return null;
  const close = dismissInvite;
  const join = async () => {
    setJoining(true);
    const row = (await listOpenRooms(invite.game)).find((r) => r.code === invite.code);
    if (!row || row.players >= row.capacity) {
      setJoining(false);
      setNote(row ? 'full' : 'gone');
      window.setTimeout(dismissInvite, 2500);
      return;
    }
    // A full page load, the same way the home card joins, so the game page reads the open room from the URL.
    window.location.assign(new URL(`/${locale}${openRoomHref(invite.game, invite.code, row.variant)}`, window.location.origin));
  };
  const progress = Math.max(0, Math.min(1, (invite.until - now) / INVITE_MS));

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(0.5rem+env(safe-area-inset-top))] z-[70] flex justify-center px-3">
      <div key={key} data-open-invite role="status" aria-live="polite"
        className={`invite-pop relative w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/12 bg-[#15151b]/95 p-3 text-white shadow-[0_18px_44px_rgba(0,0,0,.5)] backdrop-blur ${armed ? 'pointer-events-auto' : ''}`}>
        <div className="flex items-start gap-2.5">
          <Stone name={invite.host} size={40} />
          <div className="min-w-0 flex-1">
            <p className="break-keep text-[13px] font-black leading-5">{t('title', { name: invite.host, game: tc(invite.game) })}</p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-white/55">{invite.title ? `${invite.title} · ` : ''}{t('left', { n: invite.left })}</p>
          </div>
          <button type="button" onClick={close} aria-label={t('close')} className="-mr-1 -mt-1 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={15} /></button>
        </div>
        {note ? (
          <p className="mt-2.5 rounded-md bg-[#ff6b5e]/12 px-3 py-2 text-center text-xs font-bold text-[#ffb3aa]">{t(note)}</p>
        ) : (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button type="button" data-invite-join onClick={join} disabled={joining}
              className="flex items-center justify-center gap-1.5 rounded-md bg-[#3ddc97] py-2 text-sm font-black text-[#06231a] transition hover:brightness-110 disabled:opacity-60">
              {joining ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}{t('join')}
            </button>
            <button type="button" data-invite-close onClick={close} className="rounded-md border border-white/15 bg-white/5 py-2 text-sm font-bold text-white/75 hover:bg-white/10">{t('close')}</button>
          </div>
        )}
        <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-white/50">
          <input type="checkbox" data-invite-off checked={off} onChange={(e) => { setOff(e.target.checked); setInvitesOffToday(e.target.checked); }} className="h-3.5 w-3.5 accent-[#3ddc97]" />
          {t('offToday')}
        </label>
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#3ddc97]/70 transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
