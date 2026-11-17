"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Crown, DoorOpen, Loader2, Play, Users, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import type { GameId } from '@/lib/gameCatalog';
import { EMOTES, EMOTE_MS, closeOpenRoom, putOpenRoom } from '@/lib/openRooms';
import type { Peer } from '@/lib/room';
import { GAME_MODES, type RoomHook } from './gameModes';

/** A quick reaction bubble over a name, for a few seconds after it was sent. */
export function EmoteBubble({ peer, now }: { peer?: Peer; now: number }) {
  if (!peer?.emote || !peer.emoteAt || now - peer.emoteAt > EMOTE_MS) return null;
  return (
    <span key={peer.emoteAt} className="bw-result pointer-events-none absolute -top-3.5 left-2 z-10 rounded-full bg-(--accent) px-2 py-0.5 text-[11px] font-black text-(--accent-ink) shadow-[0_4px_14px_rgba(0,0,0,.5)]">
      {peer.emote}
    </span>
  );
}

/** Row of quick reactions (ㅎㅇ, ㄱㄷ, ㅇㅋ, ㅈㅈ, ㅂㅂ). */
export function EmoteButtons({ onEmote, className = '' }: { onEmote: (text: string) => void; className?: string }) {
  return (
    <div className={`grid grid-cols-5 gap-1.5 ${className}`}>
      {EMOTES.map((text) => (
        <button key={text} type="button" onClick={() => onEmote(text)} className="rounded-md border border-white/15 bg-white/5 py-2 text-sm font-black text-white/85 transition hover:border-(--accent)/60 hover:bg-(--accent)/15 active:scale-95">{text}</button>
      ))}
    </div>
  );
}

/**
 * The waiting room for an open room, shown beside the solo game while players gather.
 * Desktop: a fixed column on the left. Phone: a tab on the left edge that slides the panel in.
 * The host's browser lists the room publicly until it starts; when the host presses start, everyone
 * moves to the room page and empty seats go to the AI (in games that have AI seats).
 */
export default function OpenRoomPanel({ game, code, variant }: { game: GameId; code: string; variant: number }) {
  const modes = GAME_MODES[game];
  return modes.useRoom ? <Panel game={game} code={code} variant={variant} useRoom={modes.useRoom} /> : null;
}

function Panel({ game, code, variant, useRoom }: { game: GameId; code: string; variant: number; useRoom: RoomHook }) {
  const t = useTranslations('OpenRoom');
  const tc = useTranslations('Common');
  const tg = useTranslations('GameGate');
  const router = useRouter();
  const modes = GAME_MODES[game];
  const option = modes.rooms[variant] ?? modes.rooms[0];
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, dispatch, emote } = useRoom(code, defaultName);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const leaving = useRef(false);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(tick);
  }, []);

  const seats = state?.seats ?? [];
  const capacity = state ? Math.min(seats.length, state.playerCount ?? seats.length) : 0;
  const humans = seats.filter((seat, i) => seat && !state?.ai?.[i]).length;
  const need = option.openMin ?? capacity;
  const canStart = !!me?.isHost && state?.phase === 'lobby' && humans >= need;
  const isHost = !!me?.isHost;

  // The host keeps the room in the public list while it waits, and takes it off when it starts or closes.
  useEffect(() => {
    if (!isHost || state?.phase !== 'lobby' || !me) return;
    const put = () => putOpenRoom(game, code, { variant, host: me.name, players: humans, capacity });
    put();
    const timer = window.setInterval(put, 20_000);
    return () => window.clearInterval(timer);
  }, [isHost, state?.phase, me, game, code, variant, humans, capacity]);
  useEffect(() => {
    if (!isHost) return;
    const close = () => { closeOpenRoom(game, code); };
    window.addEventListener('pagehide', close);
    return () => { window.removeEventListener('pagehide', close); };
  }, [isHost, game, code]);

  // Once the host starts, everyone moves to the room page (the host's room state carries over).
  useEffect(() => {
    if (!state || state.phase === 'lobby' || leaving.current) return;
    leaving.current = true;
    if (isHost) closeOpenRoom(game, code);
    router.push(`${modes.path}/room/${code}`);
  }, [state, isHost, game, code, modes.path, router]);

  const leave = () => {
    leaving.current = true;
    if (isHost) closeOpenRoom(game, code);
    window.location.href = window.location.pathname; // back to the entry screen, closing the room channel
  };

  const peerOf = (id: string) => peers.find((peer) => peer.id === id);
  const startLabel = humans < capacity && need < capacity ? t('startWithAi', { n: humans, cap: capacity }) : t('start');

  const body = (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-black tracking-[0.2em] text-(--accent)">OPEN ROOM · {code}</p>
          <h2 className="mt-1 truncate text-base font-black text-white">{tc(game)}{modes.rooms.length > 1 ? ` · ${tg(option.label)}` : ''}</h2>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-white/45"><Users size={12} />{t('players', { n: humans, cap: capacity || '–' })}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white lg:hidden" aria-label={t('close')}><X size={16} /></button>
      </div>

      {status !== 'online' || !state ? (
        <p className="flex items-center gap-2 text-xs text-white/50"><Loader2 size={14} className="animate-spin" />{status === 'error' ? t('error') : t('connecting')}</p>
      ) : (
        <>
          <ul className="space-y-2.5">
            {seats.slice(0, capacity).map((seat, i) => {
              const ai = state.ai?.[i];
              return (
                <li key={i} className={`relative flex items-center gap-2 rounded-[10px] border px-3 py-2.5 ${seat ? 'border-white/10 bg-white/[.04]' : 'border-dashed border-white/10 text-white/30'}`}>
                  {seat && <EmoteBubble peer={peerOf(seat.id)} now={now} />}
                  <span className={`h-2 w-2 shrink-0 rounded-full ${seat && !ai ? 'bg-[#3ddc97]' : 'bg-white/15'}`} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{seat ? seat.name : t('emptySeat')}{seat?.id === me?.id ? ` (${t('me')})` : ''}</span>
                  {i === 0 && seat && <Crown size={13} className="shrink-0 text-[#f2c14e]" aria-label={t('host')} />}
                </li>
              );
            })}
          </ul>
          {!isHost && !hostOnline && <p className="rounded-md bg-[#ff6b5e]/10 px-3 py-2 text-[11px] font-bold text-[#ffb3aa]">{t('hostAway')}</p>}

          <div>
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-white/40">{t('emotesTitle')}</p>
            <EmoteButtons onEmote={emote} />
          </div>

          <div className="mt-auto space-y-2">
            {isHost ? (
              <>
                <button type="button" disabled={!canStart} onClick={() => dispatch({ t: 'start' })} className="flex w-full items-center justify-center gap-2 rounded-md bg-(--accent) py-3 text-sm font-extrabold text-(--accent-ink) shadow-[0_0_20px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none">
                  <Play size={15} fill="currentColor" />{startLabel}
                </button>
                <p className="break-keep text-center text-[10px] leading-4 text-white/40">{canStart ? t('startHint') : t('needMore', { n: need })}</p>
              </>
            ) : <p className="break-keep text-center text-[11px] leading-5 text-white/50">{t('waitHost')}</p>}
            <p className="break-keep text-center text-[10px] leading-4 text-white/35">{t('soloHint')}</p>
            <button type="button" onClick={leave} className="flex w-full items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/60 hover:bg-white/10"><DoorOpen size={13} />{t('leave')}</button>
          </div>
        </>
      )}
    </div>
  );

  const latest = peers.filter((peer) => peer.emote && peer.emoteAt && now - peer.emoteAt < EMOTE_MS).sort((a, b) => (b.emoteAt ?? 0) - (a.emoteAt ?? 0))[0];

  return (
    <>
      {/* Desktop: fixed column on the left. */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[272px] border-r border-white/10 bg-[#0d0d11]/95 text-[#e6e9f0] backdrop-blur lg:block">{body}</aside>

      {/* Phone/tablet: a tab on the left edge that slides the panel in. */}
      <button type="button" onClick={() => setOpen(true)} className="fixed left-0 top-[34%] z-40 flex flex-col items-center gap-1 rounded-r-xl border border-l-0 border-(--accent)/50 bg-[#0d0d11]/95 px-2 py-3 text-[10px] font-black text-white shadow-[0_0_18px_var(--accent-glow)] lg:hidden" aria-label={t('openPanel')}>
        <Users size={14} className="text-(--accent)" />
        <span className="[writing-mode:vertical-rl]">{t('tab')}</span>
        <span className="font-mono text-(--accent)">{humans}/{capacity || '–'}</span>
        {latest && <span key={latest.emoteAt} className="bw-result absolute -right-9 top-1 rounded-full bg-(--accent) px-1.5 py-0.5 text-[10px] text-(--accent-ink)">{latest.emote}</span>}
      </button>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute bottom-0 left-0 top-0 w-[84vw] max-w-[300px] border-r border-white/10 bg-[#0d0d11] text-[#e6e9f0] shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>{body}</aside>
      </div>
    </>
  );
}
