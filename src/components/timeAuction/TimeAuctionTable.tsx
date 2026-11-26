"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Bot, Hand, History, Timer } from 'lucide-react';
import { TA_COUNTDOWN_MS, TA_UNIT, taClock, taScore } from '@/lib/timeAuction';
import { TA_PERSONA } from '@/lib/timeAuctionAi';
import { TA_BEAT_MS, TA_READY_SEC, type TaBeat, type TaRoom, type TaRoomAction, taBeat } from '@/lib/timeAuctionRoom';
import { PANEL, PANEL_TITLE } from '../ui/gameUi';
import type { TaCopy } from './copy';
import { AuctionBlock, HoldRing, LotStone, MinusStone, SeatStone, Tray, lotFor, lotName, minusLot, taTalk } from './TimeAuctionParts';

type Status = number | null | 'unknown'; // let-go time (ms after the countdown), still holding, or not known (page loaded mid-auction)
type Rec = { round: number; cdEnd: number; released: Status; pushed: boolean; sentAt: number };

/** Seat names: AI personas in the viewer's language, people by nickname. */
export function taName(room: TaRoom, seat: number, t: TaCopy, en: boolean, mySeat: number | null) {
  if (seat === mySeat) return t.you;
  const style = room.style[seat];
  if (room.ai[seat] && style && !room.away?.[seat]) return en ? TA_PERSONA[style].nameEn : TA_PERSONA[style].name;
  return room.seats[seat]?.name ?? '—';
}
export const taColor = (room: TaRoom, seat: number) => (room.ai[seat] && room.style[seat] && !room.away?.[seat] ? TA_PERSONA[room.style[seat]!].color : '#e6e9f0');

/**
 * The hold button's state machine and timing. The hold is measured on this device (performance.now) from this
 * device's countdown; the result goes to the host in a heartbeat (rooms) or straight away (host / AI match).
 * See src/lib/timeAuctionRoom.ts for the fairness design.
 */
function useHold(room: TaRoom, mySeat: number | null, onAction: (a: TaRoomAction) => void, direct: boolean, rooms: boolean) {
  const g = room.game;
  const me = mySeat !== null && g.inGame[mySeat] && !room.ai[mySeat] ? mySeat : null;
  const down = useRef(false);
  const pointer = useRef<number | null>(null);
  const [isDown, setIsDown] = useState(false);
  const rec = useRef<Rec | null>(null);
  const sawReady = useRef(0); // the last round whose ready step this page saw
  const [view, setView] = useState<Rec | null>(null); // render copy of rec
  const [counting, setCounting] = useState(false);
  const show = useCallback(() => setView(rec.current ? { ...rec.current } : null), []);
  const act = useRef(onAction);
  useEffect(() => { act.current = onAction; }, [onAction]);
  const myBank = me !== null ? g.bank[me] : -1;
  const bankRef = useRef(myBank);
  useEffect(() => { bankRef.current = myBank; }, [myBank]);

  const send = useCallback((status: Status) => {
    const r = rec.current;
    if (!r) return;
    r.sentAt = performance.now();
    const m: TaBeat = taBeat(status === null ? null : status);
    act.current({ t: 'hb', r: r.round, m });
  }, []);

  /** Let go now (or at `at` ms after the countdown, e.g. when the time ran out). */
  const letGo = useCallback((at?: number, pushed = false) => {
    const r = rec.current;
    if (!r || r.released !== null) return;
    r.released = at ?? performance.now() - r.cdEnd;
    r.pushed = pushed;
    if (pushed && typeof navigator !== 'undefined' && 'vibrate' in navigator) { try { navigator.vibrate?.([120, 60, 120]); } catch { /* optional */ } }
    // The host and the AI match record it at once; a guest's let-go rides in the next heartbeat (rooms only).
    if (direct) send(r.released);
    show();
  }, [direct, send, show]);

  // The auction changes phase: a new countdown starts on this device when its state arrives.
  useEffect(() => {
    if (g.phase === 'ready') { sawReady.current = g.round; return; }
    if (g.phase !== 'live' || me === null || rec.current?.round === g.round) return;
    const now = performance.now();
    // The host's own clock gives the countdown exactly; a guest counts from when the state reached it.
    const cdEnd = direct ? now + (room.liveAt + TA_COUNTDOWN_MS - Date.now()) : now + TA_COUNTDOWN_MS;
    const midway = sawReady.current !== g.round;
    rec.current = { round: g.round, cdEnd, released: null, pushed: false, sentAt: 0 };
    // Decide from what this device knows (is the button down?), not from the per-seat secret, which can arrive a
    // moment after the public state. The host ignores a let-go from a seat that is not in the auction.
    if (midway && !direct) rec.current.released = 'unknown'; // loaded mid-auction: the host charges up to now
    else if (!down.current) letGo(now - cdEnd);
    show();
    setCounting(cdEnd > now);
    const timer = window.setTimeout(() => setCounting(false), Math.max(0, cdEnd - now) + 10);
    return () => window.clearTimeout(timer);
  }, [g.phase, g.round, me, direct, room.liveAt, letGo, show]);

  // Heartbeats while an auction runs (rooms): every seated person, holding or not, about once a second.
  useEffect(() => {
    if (!rooms || me === null || g.phase !== 'live') return;
    let timer = 0;
    const beat = () => {
      const r = rec.current;
      if (r && r.round === g.round) send(r.released === null && !down.current ? null : r.released);
      timer = window.setTimeout(beat, TA_BEAT_MS - 80 + Math.random() * 160);
    };
    beat();
    return () => window.clearTimeout(timer);
  }, [rooms, me, g.phase, g.round, send]);

  // Out of time: the button is pushed out on this device at exactly the time left.
  useEffect(() => {
    if (g.phase !== 'live') return;
    let frame = 0;
    const loop = () => {
      const r = rec.current;
      const bank = bankRef.current;
      if (r && r.released === null && down.current && bank >= TA_UNIT && performance.now() - r.cdEnd >= bank) { letGo(bank, true); return; }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [g.phase, g.round, letGo]);

  const press = useCallback(() => {
    if (me === null || down.current) return;
    down.current = true;
    setIsDown(true);
    if (g.phase === 'ready' && !g.pressed[me]) act.current({ t: 'press', r: g.round, on: true });
  }, [me, g.phase, g.round, g.pressed]);

  const release = useCallback(() => {
    if (!down.current) return;
    down.current = false;
    pointer.current = null;
    setIsDown(false);
    if (me === null) return;
    if (g.phase === 'ready') { if (g.pressed[me] && !g.pass[me]) act.current({ t: 'press', r: g.round, on: false }); return; }
    if (g.phase === 'live') {
      letGo();
      // Leaving the page: send now rather than at the next heartbeat.
      if (!direct && document.visibilityState === 'hidden') send(rec.current?.released ?? null);
    }
  }, [me, g.phase, g.round, g.pressed, g.pass, letGo, direct, send]);

  const pass = useCallback(() => { if (me !== null && g.phase === 'ready') act.current({ t: 'press', r: g.round, on: true, pass: true }); }, [me, g.phase, g.round]);

  // No time left: sit out by itself after a short random wait (rooms; the AI match does it on the host).
  const empty = me !== null && myBank >= 0 && myBank < TA_UNIT;
  const waiting = g.phase === 'ready' && me !== null && !g.pressed[me];
  useEffect(() => {
    if (!rooms || !empty || !waiting) return;
    const timer = window.setTimeout(() => act.current({ t: 'press', r: g.round, on: true, pass: true }), 600 + Math.random() * 1800);
    return () => window.clearTimeout(timer);
  }, [rooms, empty, waiting, g.round]);

  // Hiding the tab, leaving the page or the window losing focus counts as letting go.
  useEffect(() => {
    const hide = () => { if (document.visibilityState === 'hidden') release(); };
    window.addEventListener('blur', release);
    window.addEventListener('pagehide', release);
    document.addEventListener('visibilitychange', hide);
    return () => { window.removeEventListener('blur', release); window.removeEventListener('pagehide', release); document.removeEventListener('visibilitychange', hide); };
  }, [release]);

  /** Pointer handling for the button: the first finger or mouse button only, captured so a slide cannot drop it. */
  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (pointer.current !== null || e.button > 0) return;
      e.preventDefault();
      pointer.current = e.pointerId;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* capture is optional */ }
      press();
    },
    onPointerUp: (e: React.PointerEvent) => { if (e.pointerId === pointer.current) release(); },
    onPointerCancel: (e: React.PointerEvent) => { if (e.pointerId === pointer.current) release(); },
    onLostPointerCapture: (e: React.PointerEvent) => { if (e.pointerId === pointer.current) release(); },
    onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); } },
    onKeyUp: (e: React.KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); release(); } },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
  return { me, isDown, rec: view && view.round === g.round ? view : null, counting, press, release, pass, handlers };
}

/** The board: countdown digits, then the time running in this auction, then the price when it stops. */
function Board({ room, rec, t, mySeat, en }: { room: TaRoom; rec: Rec | null; t: TaCopy; mySeat: number | null; en: boolean }) {
  const g = room.game;
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (g.phase !== 'live') return;
    let frame = 0;
    let last = -1;
    const loop = () => {
      const tenth = Math.floor(performance.now() / 50);
      if (tenth !== last) { last = tenth; setNow(performance.now()); }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [g.phase]);
  const last = g.log[g.log.length - 1];
  let big = '0:00.0';
  let small = t.round(g.round, g.rounds);
  let tone = 'text-(--accent)';
  if (g.phase === 'ready') { big = '0:00.0'; tone = 'text-white/25'; }
  else if (g.phase === 'live' && rec) {
    const left = rec.cdEnd - now;
    if (left > 0) { big = String(Math.ceil(left / 1000)); tone = 'text-[#ffd166]'; small = 'COUNTDOWN'; }
    else big = taClock(now - rec.cdEnd);
  } else if (g.phase === 'live') big = '—';
  else if (last && (g.phase === 'reveal' || g.phase === 'finished')) {
    big = taClock(last.price);
    tone = last.outcome === 'won' ? 'text-(--accent)' : 'text-white/45';
    small = last.outcome === 'won' ? (last.winner === mySeat ? t.wonMe(taClock(last.price)) : t.won(taName(room, last.winner!, t, en, mySeat), taClock(last.price)))
      : last.outcome === 'void' ? t.void(taClock(last.price)) : t.empty;
  }
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[#050506] px-3 pb-4 text-center shadow-[inset_0_0_40px_rgba(255,59,48,0.08)] sm:pb-6">
      <AuctionBlock room={room} mySeat={mySeat} en={en} winnerLabel={last?.outcome === 'won' && (g.phase === 'reveal' || g.phase === 'finished') ? taName(room, last.winner!, t, en, mySeat) : null}
        minusLabel={last && last.minus !== null ? taName(room, last.minus, t, en, mySeat) : null}
        outcomeLabel={t.lot((g.phase === 'reveal' || g.phase === 'finished') && last ? last.round : g.round, lotName(lotFor((g.phase === 'reveal' || g.phase === 'finished') && last ? last.round : g.round, g.rounds, g.gid), en))} />
      <p className="mt-1 font-mono text-[9px] font-black tracking-[0.35em] text-white/30">{t.board} · {t.round(g.round, g.rounds)}</p>
      <p aria-live="off" className={`mt-1 font-mono text-[56px] font-black leading-none tabular-nums tracking-tight sm:text-[84px] ${tone}`} style={{ textShadow: '0 0 24px currentColor' } as CSSProperties}>{big}</p>
      <p className="mt-2 min-h-[18px] break-keep text-[12px] font-bold text-white/60" aria-live="polite">{g.phase === 'reveal' || g.phase === 'finished' ? small : g.phase === 'live' ? t.watching : t.ready}</p>
      {(g.phase === 'reveal' || g.phase === 'finished') && last && (
        <p className="mt-0.5 min-h-[16px] break-keep text-[11.5px] font-bold text-[#ff7b72]">{last.minus === null ? t.noMinus : last.minus === mySeat ? t.minusMe : t.minusTo(taName(room, last.minus, t, en, mySeat))}</p>
      )}
    </div>
  );
}

/** One auction table: the board, the hold button and the public record (tokens and winners). */
export default function TimeAuctionTable({ room, mySeat, onAction, t, locale, direct, rooms }: {
  room: TaRoom; mySeat: number | null; onAction: (a: TaRoomAction) => void; t: TaCopy; locale: string;
  /** This browser records its own let-go directly (the AI match, or the room's host). */
  direct: boolean;
  /** A friend or open room (heartbeats, ready clock). */
  rooms: boolean;
}) {
  const en = locale === 'en';
  const g = room.game;
  const { me, isDown, rec, counting, pass, handlers } = useHold(room, mySeat, onAction, direct, rooms);
  const players = g.inGame.filter(Boolean).length;
  const ready = g.inGame.filter((on, i) => on && g.pressed[i]).length;
  const myBank = me !== null ? g.bank[me] : -1;
  const noTime = me !== null && myBank >= 0 && myBank < TA_UNIT && g.phase !== 'finished';
  const [readyLeft, setReadyLeft] = useState(0);
  useEffect(() => {
    if (!rooms || g.phase !== 'ready') return;
    const tick = () => setReadyLeft(Math.max(0, Math.ceil((room.readyUntil - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [rooms, g.phase, room.readyUntil]);

  // What the button says.
  let label: string = t.holdToReady;
  let sub = '';
  let state: 'idle' | 'armed' | 'counting' | 'holding' | 'done' | 'off' = 'idle';
  if (me === null) { label = t.out; state = 'off'; }
  else if (noTime) { label = t.noTime; state = 'off'; }
  else if (g.phase === 'ready') {
    if (g.pass[me]) { label = t.passed; state = 'off'; }
    else if (isDown) { label = t.holding; sub = t.ready; state = 'armed'; }
  } else if (g.phase === 'live' && rec) {
    if (rec.released !== null) {
      state = 'done';
      label = rec.pushed ? t.pushedOut : typeof rec.released === 'number' && rec.released >= TA_UNIT ? t.released(taClock(rec.released)) : g.joined[me] || rec.released === 'unknown' ? t.passed : t.out;
    } else if (isDown) {
      state = counting ? 'counting' : 'holding';
      label = t.holding; sub = counting ? t.countdown : t.bidding;
    }
  } else if (g.phase === 'reveal' || g.phase === 'finished') { label = '—'; state = 'off'; }
  const disabled = state === 'off' || state === 'done' || (g.phase === 'live' && !isDown);
  const ring = state === 'holding' ? 'border-(--accent) bg-(--accent) text-white shadow-[0_0_60px_var(--accent-glow)] scale-[0.97]'
    : state === 'counting' ? 'border-[#ffd166] bg-[#ffd166]/90 text-black scale-[0.97]'
      : state === 'armed' ? 'border-(--accent) bg-(--accent)/80 text-white scale-[0.97]'
        : state === 'done' || state === 'off' ? 'border-white/10 bg-white/[0.04] text-white/45'
          : 'border-(--accent)/70 bg-[radial-gradient(circle_at_50%_35%,rgba(255,59,48,0.45),rgba(60,8,6,0.95)_70%)] text-white hover:brightness-110';

  return (
    <div className="mx-auto grid w-full max-w-[980px] gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="grid gap-3">
        <Board room={room} rec={rec} t={t} mySeat={mySeat} en={en} />
        <div className="flex flex-col items-center gap-2 rounded-[14px] border border-white/10 bg-[#121217]/85 px-3 pb-4 pt-3">
          <div className="flex w-full items-center justify-between text-[11px] font-bold text-white/50">
            <span className="flex items-center gap-1"><Hand size={12} className="text-(--accent)" />{g.phase === 'ready' ? t.readyCount(ready, players) : g.phase === 'live' ? t.watching : ' '}</span>
            {rooms && g.phase === 'ready' && <span className="flex items-center gap-1 font-mono"><Timer size={12} />{readyLeft}s</span>}
          </div>
          <button
            type="button" aria-label={label} aria-pressed={isDown} disabled={disabled && !isDown}
            {...handlers}
            className={`relative flex aspect-square w-[min(68vw,260px)] select-none flex-col items-center justify-center rounded-full border-[6px] text-center transition-[transform,background-color,box-shadow] duration-100 disabled:cursor-default ${ring}`}
            style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent' } as CSSProperties}
          >
            <HoldRing cdEnd={g.phase === 'live' && rec && rec.released === null ? rec.cdEnd : null} holding={isDown} />
            <span className="pointer-events-none font-mono text-[10px] font-black tracking-[0.3em] opacity-70">{state === 'holding' ? 'HOLD' : state === 'counting' ? 'READY' : 'PRESS'}</span>
            <span className="pointer-events-none mt-1 max-w-[80%] break-keep text-[15px] font-black leading-tight sm:text-lg">{label}</span>
            {sub && <span className="pointer-events-none mt-1 max-w-[78%] break-keep text-[10.5px] font-bold leading-tight opacity-80">{sub}</span>}
          </button>
          {g.phase === 'ready' && me !== null && !noTime && !g.pass[me] && !isDown && (
            <button type="button" onClick={pass} className="rounded-md border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/60 hover:bg-white/10">{t.pass}</button>
          )}
          {rooms && g.phase === 'ready' && <p className="text-[10.5px] text-white/35">{t.readyClock(TA_READY_SEC)}</p>}
          <p className="max-w-sm break-keep text-center text-[11px] leading-4 text-white/40">{t.memory}</p>
        </div>
      </section>
      <aside className="grid content-start gap-3">
        <section className={PANEL}>
          <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t.tokens}</p><span className="text-[10px] font-bold text-white/35">{t.scoreNote}</span></div>
          <ul className="mt-2 grid gap-1">
            {g.inGame.flatMap((on, s) => (on ? [s] : [])).map((s) => (
              <li key={s} data-chat-seat={room.seats[s]?.id} className={`flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 ${s === mySeat ? 'bg-(--accent)/10 ring-1 ring-(--accent)/40' : 'bg-white/[0.03]'}`}>
                <SeatStone room={room} seat={s} mySeat={mySeat} size={24} label={taName(room, s, t, en, mySeat)} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold">{taName(room, s, t, en, mySeat)}</span>
                {room.away?.[s] && <span title={t.away}><Bot size={12} className="text-[#ffb547]" /></span>}
                <Tray room={room} seat={s} size={15} en={en} />
                <b className="w-5 text-right font-mono text-[12px]">{taScore(g, s)}</b>
                {(() => {
                  const talk = taTalk(room, s, en);
                  const style = room.ai[s] && !room.away?.[s] ? room.style[s] : null;
                  if (talk) return <span className="basis-full pl-8 text-[11px] font-bold text-white/85">💬 {talk}</span>;
                  return style ? <span className="basis-full truncate pl-8 text-[10.5px] text-white/40">{en ? TA_PERSONA[style].blurb.en : TA_PERSONA[style].blurb.ko}</span> : null;
                })()}
              </li>
            ))}
          </ul>
        </section>
        <section className={PANEL}>
          <p className={`${PANEL_TITLE} flex items-center gap-1.5`}><History size={11} />{t.history}</p>
          {g.log.length === 0 ? <p className="mt-2 text-[11px] text-white/35">—</p> : (
            <ol className="mt-2 grid max-h-[260px] gap-0.5 overflow-y-auto pr-1 text-[12px]">
              {[...g.log].reverse().map((r) => (
                <li key={r.round} className="flex items-center gap-2 rounded px-1.5 py-1 odd:bg-white/[0.03]">
                  <span className="w-6 font-mono text-[10px] text-white/35">{r.round}R</span>
                  <LotStone lot={lotFor(r.round, g.rounds, g.gid)} size={14} dim={r.outcome !== 'won'} label={lotName(lotFor(r.round, g.rounds, g.gid), en)} />
                  {r.outcome === 'won' ? <><span className="min-w-0 flex-1 truncate font-bold">{taName(room, r.winner!, t, en, mySeat)}</span></>
                    : <span className="flex-1 text-white/40">{r.outcome === 'void' ? (en ? 'Void (tie)' : '유찰') : (en ? 'No bids' : '입찰 없음')}</span>}
                  {r.minus !== null && <span className="flex items-center gap-0.5 text-[10.5px] text-[#ff7b72]" title={t.minusTo(taName(room, r.minus, t, en, mySeat))}><MinusStone size={11} lot={minusLot(r.round, g.gid)} />{taName(room, r.minus, t, en, mySeat)}</span>}
                  <span className="font-mono tabular-nums text-white/70">{r.outcome === 'empty' ? '' : taClock(r.price)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </aside>
    </div>
  );
}
