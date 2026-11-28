"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, Crown, Loader2, RotateCcw, Share2, Timer, UserRound, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import HomeButton from '@/components/ui/HomeButton';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, HEADING, INPUT, KICKER, MODAL, MODAL_BACKDROP, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { Link } from '@/i18n/routing';
import { useMerge2048Room } from '@/hooks/useMerge2048Room';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { unlockGameAudio } from '@/lib/gameAudio';
import { type Dir, type M2State, isState, newGame } from '@/lib/merge2048';
import { M2_MIN_PLAYERS, M2_MINUTE_OPTIONS, type M2Room, m2Outcome, m2Place, m2Ranking, snapOf } from '@/lib/merge2048Room';
import { reportGame } from '@/lib/stats';
import { BlockFace, M2Board, M2MiniBoard, M2_ACCENT, M2_INK, StatBox, clock, useM2Input } from './M2Parts';
import { useM2Game } from './useM2Game';

const SEND_GAP_MS = 250; // snapshots go out at most four times a second
const boardKey = (sid: string) => `puzzlthink_2048_room_${sid}`;
const PLACE_MEDAL = ['🥇', '🥈', '🥉', '4'];

/** Friend / open room: 2–4 people race on their own boards for 5 or 10 minutes; the biggest block wins. */
export default function Merge2048RoomView({ code }: { code: string }) {
  const t = useTranslations('Merge2048');
  const to = useTranslations('Merge2048Online');
  const locale = useLocale();
  const [defaultName] = useState(() => `${to('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useMerge2048Room(code, defaultName);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [resultOpen, setResultOpen] = useState(true);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/2048/room/${code}`);
    return () => window.clearTimeout(slow);
  }, [code, locale]);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);

  // ── My own board: played here, saved per match, sent to the host as snapshots ──
  const inMatch = state?.phase !== 'lobby' && !!state && mySeat !== null && state.players.includes(mySeat);
  const playing = inMatch && state?.phase === 'playing';
  const lastSent = useRef(0);
  const pending = useRef<number | undefined>(undefined);
  const latest = useRef<M2State | null>(null);
  const send = useCallback(() => {
    window.clearTimeout(pending.current);
    pending.current = undefined;
    if (!latest.current) return;
    lastSent.current = Date.now();
    dispatch({ t: 'snap', snap: snapOf(latest.current) });
  }, [dispatch]);
  const onMoved = useCallback((next: M2State) => {
    latest.current = next;
    if (state) { try { sessionStorage.setItem(boardKey(state.sid), JSON.stringify(next)); } catch { /* Optional. */ } }
    const wait = SEND_GAP_MS - (Date.now() - lastSent.current);
    if (next.over || wait <= 0) send();
    else if (pending.current === undefined) pending.current = window.setTimeout(send, wait);
  }, [state, send]);
  const { game, view, step, setGame } = useM2Game(onMoved);
  useEffect(() => () => window.clearTimeout(pending.current), []);

  const sid = state?.sid, seed = state?.seed;
  useEffect(() => {
    if (!inMatch || !sid || seed === undefined) { if (!inMatch) setGame(null); return; }
    let saved: unknown = null;
    try { saved = JSON.parse(sessionStorage.getItem(boardKey(sid)) || 'null'); } catch { saved = null; }
    const board = isState(saved) ? saved : newGame(seed);
    latest.current = board;
    setGame(board);
    if (isState(saved)) send(); // back after a reload: tell the host where we are
  }, [inMatch, sid, seed, setGame, send]);

  const startAt = state?.startAt ?? 0, endAt = state?.endAt ?? 0;
  const counting = playing && now < startAt;
  const live = playing && now >= startAt && now < endAt && !game?.over;
  const onDir = useCallback((dir: Dir) => { if (live) { unlockGameAudio(); step(dir); } }, [live, step]);
  const boardRef = useRef<HTMLDivElement>(null);
  useM2Input(boardRef, onDir, !!live);

  // Report a finished match once, when the room moves into "finished".
  const prevPhase = useRef<string | null>(null);
  useEffect(() => {
    const phase = state?.phase ?? null;
    if (phase === 'finished' && prevPhase.current === 'playing' && state && mySeat !== null && state.players.includes(mySeat)) {
      const snap = state.snaps[mySeat];
      reportGame(`m2-friend-${state.sid}-${mySeat}`, 'merge2048', 'friend', m2Outcome(state, mySeat), {
        place: m2Place(state, mySeat), max: snap?.max ?? 0, score: snap?.score ?? 0, players: state.players.length, minutes: state.minutes,
      });
      setResultOpen(true);
    }
    prevPhase.current = phase;
  }, [state, mySeat]);

  const online = new Set(peers.map((p) => p.id));
  const seated = state ? state.seats.filter(Boolean).length : 0;
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK 2048', text: to('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } }
    copyLink();
  };
  const notice = status === 'unconfigured' ? to('unconfigured') : status === 'error' ? to('connectionError')
    : !state && waitedLong ? to('roomNotFound') : state && !me?.isHost && !hostOnline ? to('hostOffline') : null;
  const nameOf = (seat: number) => state?.seats[seat]?.name ?? to('emptySeat');

  return (
    <div className={SHELL} style={{ ...accentVars(M2_ACCENT, M2_INK), backgroundImage: fog('255, 143, 163') }}>
      <Shards tint="#3a2630" />
      <RoomAlerts alerts={alerts} accent={M2_ACCENT} joinText={(name) => to('joined', { name })} leaveText={(name) => to('left', { name })} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/2048" backLabel="2048" title="2048" subtitle={`ONLINE · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <p className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffb3a8] lg:px-6"><WifiOff size={14} />{notice}</p>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{to('connecting')}</p>
            : <Link href="/2048" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{to('back')}</Link>}
        </main>
      ) : state.phase === 'lobby' ? (
        <main className="relative z-10 mx-auto grid w-full max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
          <section className={`space-y-5 ${STAGE}`}>
            <div className="px-1 sm:px-2"><p className={`mb-1 ${KICKER}`}>LOBBY</p><h1 className={HEADING}>{to('lobbyTitle')}</h1></div>
            <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
              <p className={PANEL_TITLE}>{to('inviteTitle')}</p>
              <p className="mt-2 text-sm text-white/60">{to('inviteDesc')}</p>
              <InviteCode code={code} host={me?.name} url={shareUrl} />
              <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                <button type="button" onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? to('copied') : to('copy')}</button>
                <button type="button" onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{to('share')}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {state.seats.map((seat, i) => (
                <div key={i} data-chat-seat={seat?.id} className={`flex items-center gap-2 rounded-[10px] border px-3 py-2.5 ${seat ? 'border-white/15 bg-white/[0.04]' : 'border-dashed border-white/15 bg-transparent text-white/40'}`}>
                  <UserRound size={14} />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">{seat ? (seat.id === me?.id ? `${seat.name} (${to('me')})` : seat.name) : to('emptySeat')}</span>
                  {i === 0 && <Crown size={11} className="text-[#f2c14e]" />}
                  {seat && <span className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={to('nickname')} className={INPUT} />
              <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{to('rename')}</button>
            </form>
            {me?.isHost
              ? <button type="button" disabled={seated < M2_MIN_PLAYERS} onClick={() => dispatch({ t: 'start' })} className={`w-full py-3.5 text-sm ${BTN_ACCENT}`}>{seated < M2_MIN_PLAYERS ? to('needPlayers') : to('start', { n: seated, m: state.minutes })}</button>
              : <p className="text-center text-sm text-white/50">{mySeat === null ? to('roomFull') : to('waitingHost')}</p>}
          </section>
          <aside className="space-y-4">
            <section className={PANEL}>
              <p className={PANEL_TITLE}>{to('timeLimit')}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">{M2_MINUTE_OPTIONS.map((m) => <button key={m} type="button" disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', minutes: m })} className={`py-2.5 disabled:cursor-default ${seg(state.minutes === m)}`}>{to('minutes', { n: m })}</button>)}</div>
              {!me?.isHost && <p className="mt-2 text-[10px] text-white/40">{to('hostSets')}</p>}
            </section>
            <section className={NOTE}>
              <h2 className={PANEL_TITLE}>{to('rulesTitle')}</h2>
              <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-white/65">{['room1', 'room2', 'room3', 'room4'].map((k, i) => <li key={k} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{to(k)}</span></li>)}</ol>
            </section>
          </aside>
        </main>
      ) : (
        <PlayArea room={state} mySeat={mySeat} now={now} nameOf={nameOf}
          mine={inMatch && game ? (
            <M2Board tiles={game.tiles} ghosts={view.ghosts} merged={view.merged} spawned={view.spawned} boardRef={boardRef} dim={state.phase === 'finished' || !!game.over}>
              {counting && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-[10px] bg-[#fbfaf5]/80 text-[#17201e] backdrop-blur-[1px]">
                  <p className="text-xs font-black tracking-[0.2em] text-black/45">{to('getReady')}</p>
                  <p key={Math.ceil((startAt - now) / 1000)} className="bw-result mt-1 font-mono text-7xl font-black">{Math.max(1, Math.ceil((startAt - now) / 1000))}</p>
                </div>
              )}
              {game.over && state.phase === 'playing' && (
                <div className="absolute inset-x-0 top-1/2 z-40 mx-auto w-[86%] -translate-y-1/2 rounded-[14px] bg-[#17201e]/92 p-4 text-center text-white shadow-2xl">
                  <p className="text-sm font-black">{to('stuck')}</p>
                  <p className="mt-1 text-xs text-white/55">{to('stuckDesc')}</p>
                </div>
              )}
            </M2Board>
          ) : null}
          myGame={inMatch ? game : null} gained={view.gained} gainKey={view.key}
        />
      )}

      {state?.phase === 'finished' && resultOpen && (
        <div className={MODAL_BACKDROP} onClick={() => setResultOpen(false)}>
          <div className={`${MODAL} !max-w-md !p-5 sm:!p-6`} onClick={(e) => e.stopPropagation()}>
            <p className={KICKER}>TIME UP · {to('minutes', { n: state.minutes })}</p>
            <h2 className="mt-1 text-2xl font-black">{mySeat !== null && state.players.includes(mySeat) ? to(`place${Math.min(m2Place(state, mySeat), 4)}`) : to('finalTitle')}</h2>
            <ol className="mt-4 space-y-2 text-left">
              {m2Ranking(state).map((seat) => {
                const snap = state.snaps[seat];
                const place = m2Place(state, seat);
                return (
                  <li key={seat} className={`flex items-center gap-3 rounded-[12px] border p-2.5 ${seat === mySeat ? 'border-(--accent)/60 bg-(--accent)/10' : 'border-white/10 bg-black/30'}`}>
                    <span className="w-7 text-center text-lg font-black">{PLACE_MEDAL[place - 1]}</span>
                    <div className="w-14 shrink-0">{snap && <M2MiniBoard cells={snap.cells} />}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{nameOf(seat)}{seat === mySeat ? ` (${to('me')})` : ''}</p>
                      <p className="font-mono text-[11px] text-white/50">{t('points', { n: snap?.score ?? 0 })}</p>
                    </div>
                    <div className="h-10 w-10 shrink-0">{snap && snap.max > 0 && <BlockFace v={snap.max} happy={place === 1} />}</div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <HomeButton block className="!rounded-md" />
              {me?.isHost
                ? <button type="button" onClick={() => dispatch({ t: 'start' })} disabled={seated < M2_MIN_PLAYERS} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{to('rematch')}</button>
                : <button type="button" onClick={() => setResultOpen(false)} className={`${BTN} py-3`}>{to('rematchWait')}</button>}
            </div>
            {me?.isHost && (
              <div className="mt-3 grid grid-cols-2 gap-2">{M2_MINUTE_OPTIONS.map((m) => <button key={m} type="button" onClick={() => dispatch({ t: 'config', minutes: m })} className={`py-2 ${seg(state.minutes === m)}`}>{to('minutes', { n: m })}</button>)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** The match: my board big, the others small beside it (above it on a phone), with the clock on top. */
function PlayArea({ room, mySeat, now, nameOf, mine, myGame, gained, gainKey }: {
  room: M2Room; mySeat: number | null; now: number; nameOf: (seat: number) => string;
  mine: React.ReactNode; myGame: M2State | null; gained: number; gainKey: number;
}) {
  const t = useTranslations('Merge2048');
  const to = useTranslations('Merge2048Online');
  const left = room.phase === 'playing' ? Math.max(0, room.endAt - Math.max(now, room.startAt)) : 0;
  const others = room.players.filter((s) => s !== mySeat);
  const order = m2Ranking(room);
  const placeOf = (seat: number) => order.indexOf(seat) + 1;
  const mySnap = mySeat !== null ? room.snaps[mySeat] : null;
  const score = myGame?.score ?? mySnap?.score ?? 0;
  const max = myGame ? Math.max(...myGame.tiles.map((x) => x.v)) : mySnap?.max ?? 0;

  const friend = (seat: number) => {
    const snap = room.snaps[seat];
    const leading = placeOf(seat) === 1 && (snap?.max ?? 0) > 0;
    return (
      <div key={seat} className={`min-w-0 rounded-[12px] border p-1.5 sm:p-2 ${leading ? 'border-[#ffd23f]/50 bg-[#ffd23f]/[.06]' : 'border-white/10 bg-black/30'}`}>
        <div className="mb-1 flex items-center gap-1 px-0.5">
          {leading && <Crown size={11} className="shrink-0 text-[#ffd23f]" />}
          <span className="min-w-0 flex-1 truncate text-[11px] font-black">{nameOf(seat)}</span>
          <span className="shrink-0 font-mono text-[10px] text-white/45">#{placeOf(seat)}</span>
        </div>
        {snap ? <M2MiniBoard cells={snap.cells} dim={snap.over}>{snap.over && <span className="absolute inset-0 z-20 grid place-items-center text-[10px] font-black text-[#17201e]">{to('stuckShort')}</span>}</M2MiniBoard> : <div className="aspect-square rounded-[8px] bg-white/5" />}
        <div className="mt-1 flex items-center justify-between gap-1 px-0.5 font-mono text-[10px]">
          <span className="text-white/55">{snap?.score ?? 0}</span>
          <span className="flex items-center gap-1 font-black text-(--accent)">{snap && snap.max > 0 && <span className="h-3.5 w-3.5"><BlockFace v={snap.max} plain /></span>}{snap?.max ?? 0}</span>
        </div>
      </div>
    );
  };

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1100px] px-3 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-8">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
        <section className={`${STAGE} order-2 lg:order-1`}>
          <div className="mx-auto w-full max-w-[540px]">
            <div className="mb-3 flex items-stretch gap-2">
              <StatBox label={t('score')} value={score} accent>
                {gained > 0 && <span key={gainKey} className="m2-float pointer-events-none absolute -top-2 right-2 font-mono text-xs font-black text-(--accent)">+{gained}</span>}
              </StatBox>
              <StatBox label={t('biggest')} value={max || '—'} />
              <StatBox label={t('timeLeft')} value={<span className={`flex items-center justify-center gap-1 ${room.phase === 'playing' && left < 30_000 ? 'animate-pulse text-[#ff7b71]' : ''}`}><Timer size={14} />{clock(left)}</span>} />
            </div>
            {mine ?? (
              <div className="grid aspect-square place-items-center rounded-[16px] border border-dashed border-white/15 text-center text-sm text-white/45">
                <p className="max-w-[240px] break-keep">{room.phase === 'finished' ? to('finalTitle') : to('spectating')}</p>
              </div>
            )}
            {mine && <p className="mt-3 text-center text-[11px] text-white/40">{t('controls')}</p>}
          </div>
        </section>
        <aside className="order-1 lg:order-2">
          <p className={`mb-2 hidden lg:block ${PANEL_TITLE}`}>{to('friends')}</p>
          <div className={`grid gap-2 ${mySeat === null ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-2' : 'grid-cols-3 lg:grid-cols-2'}`}>
            {(mySeat === null ? room.players : others).map(friend)}
          </div>
          <p className="mt-3 hidden break-keep text-[11px] leading-5 text-white/40 lg:block">{to('rankNote')}</p>
        </aside>
      </div>
    </main>
  );
}
