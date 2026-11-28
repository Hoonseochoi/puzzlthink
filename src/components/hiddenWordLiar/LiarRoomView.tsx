"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, Crown, Eye, Loader2, LogOut, MessageCircle, Send, Timer, UserX, X } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import { RimStone } from '@/components/match/PlayerPlate';
import { checkNewIcons } from '@/components/IconUnlock';
import GameUpdates from '@/components/GameUpdates';
import {
  LIAR_ACCENT, type LiarClue, type LiarMember, type LiarView, guessLiar, kickLiar, leaveLiar, myName, readyLiar, sayClue,
  phaseSecs, scoreColor, secondsLeft, startLiar, talkLiar, voteLiar,
} from '@/lib/hiddenWordLiar';
import { playLiarReveal, playLiarTick, unlockGameAudio } from '@/lib/gameAudio';
import { liarCopy } from './copy';
import LiarShare from './LiarShare';
import { type LiarChat, useLiarRoom } from './useLiarRoom';

const RUNNING = ['cards', 'clue', 'talk', 'vote', 'runoff', 'guess'];
type T = ReturnType<typeof liarCopy>;
type Typing = Record<number, { kind: 'clue' | 'chat'; until: number }>;
const shownScore = (c: LiarClue, t: T) => c.word == null ? t.silent : c.score != null ? String(Math.round(c.score)) : c.hot ? t.hot : c.masked ? t.masked : '';
/** A clue with no word: the player's 20 s ran out, or they had left the table. */
const silentOf = (view: LiarView, c: LiarClue, t: T) => view.members.find((m) => m.seat === c.seat)?.gone ? t.gone : t.silent;
const isWord = (s: string) => /^[가-힣]{1,12}$/.test(s.trim());

/** 히든 워드: 라이어 — one room (friend or matchmaking), driven by the server (src/lib/hiddenWordLiar.ts). */
export default function LiarRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const en = locale === 'en';
  const t = liarCopy(locale);
  const { nickname } = useAuth();
  const [guest] = useState(() => `${en ? 'Guest' : '손님'} ${Math.floor(1000 + Math.random() * 9000)}`);
  const name = (nickname || myName(guest)).slice(0, 16);
  const { view, status, chat, marks, skew, typing, refresh, say, mark, pushSystem, typingNow, clearTyping } = useLiarRoom(code, name);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);

  // clue lines also go into the chat, so talk and clues read as one stream; a new one chimes as its number lands
  const seen = useRef<string>('');
  useEffect(() => {
    if (!view) return;
    const key = `${view.game}`;
    const prev = seen.current.startsWith(`${key}:`) ? Number(seen.current.split(':')[1]) : (seen.current ? 0 : view.clues.length);
    const fresh = view.clues.slice(prev);
    seen.current = `${key}:${view.clues.length}`;
    for (const c of fresh) {
      const who = view.members.find((m) => m.seat === c.seat)?.name ?? '?';
      clearTyping(c.seat);
      pushSystem(t.clueSys(who, c.word ?? silentOf(view, c, t), c.word ? shownScore(c, t) : ''), c.seat);
    }
    const last = fresh[fresh.length - 1];
    if (last?.word) playLiarReveal(last.hot && last.score == null);
  }, [view, pushSystem, clearTyping, t]);

  // a finished game may have paid an icon: ask the icon popup to look
  const phase = view?.phase;
  useEffect(() => { if (phase === 'done') checkNewIcons(1500); }, [phase]);

  // the last five seconds of my own turn (or my guess): a soft tick and a tap on the phone
  const left = view ? secondsLeft(view, skew, now) : null;
  const mine = !!view?.me && ((view.phase === 'clue' && view.turn === view.me.seat) || (view.phase === 'guess' && view.liar === view.me.seat));
  const ticked = useRef<number | null>(null);
  useEffect(() => {
    if (!mine || left == null || left > 5 || left < 1 || ticked.current === left) return;
    ticked.current = left;
    playLiarTick(left <= 2);
    try { navigator.vibrate?.(left <= 2 ? 40 : 15); } catch { /* optional */ }
  }, [mine, left]);

  const router = useRouter();
  const leave = async () => { await leaveLiar(code); router.push('/hidden-word-liar'); };

  if (!view) {
    const msg = status === 'connecting' ? t.connecting : (t as Record<string, unknown>)[status] as string ?? t.error;
    return (
      <Shell t={t} code={code} onLeave={() => router.push('/hidden-word-liar')}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-sm text-white/70">
          {status === 'connecting' && <Loader2 className="animate-spin" size={22} />}
          <p className="break-keep">{msg}</p>
          {status !== 'connecting' && <Link href="/hidden-word-liar" className="rounded-xl bg-white/10 px-4 py-2 font-bold">{t.back}</Link>}
        </div>
      </Shell>
    );
  }

  const me = view.me;
  const total = phaseSecs(view);
  const frac = view.deadline && total ? Math.max(0, Math.min(1, (view.deadline - (now + skew)) / (total * 1000))) : null;
  const myTurn = view.phase === 'clue' && view.turn === me?.seat;
  const submitClue = async (word: string, mask: boolean) => {
    const res = await sayClue(code, word, mask);
    typingNow('clue', true);
    void refresh();
    return res?.error ? (t.clueErr[res.error] ?? t.error) : res ? null : t.error;
  };
  return (
    <Shell t={t} code={code} onLeave={leave} timer={left} view={view}>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 lg:px-6">
          <MyWord view={view} t={t} />
          {view.phase === 'lobby' && <Actions view={view} t={t} en={en} code={code} refresh={refresh} />}
          <Table view={view} t={t} marks={marks} typing={typing} now={now} frac={frac} left={left}
            onTap={(seat) => onSeatTap(view, seat, mark, marks, refresh)}>
            <Center key={`${view.game}-${view.phase}-${view.turn ?? ''}`} view={view} t={t} left={left} frac={frac} marks={marks} mark={mark} refresh={refresh} submitClue={submitClue} typingNow={typingNow} />
          </Table>
          {view.phase !== 'lobby' && <Actions view={view} t={t} en={en} code={code} refresh={refresh} />}
          <ClueBoard view={view} t={t} />
          {view.phase === 'lobby' || !me?.playing ? <Rules t={t} /> : null}
        </div>
        <ChatPanel chat={chat} t={t} say={say} view={view} myTurn={myTurn} submitClue={submitClue} typingNow={typingNow} />
      </div>
    </Shell>
  );
}

function onSeatTap(view: LiarView, seat: number, mark: (s: number | null) => void, marks: Record<number, number>, refresh: () => Promise<void>) {
  const me = view.me;
  if (!me || seat === me.seat) return;
  if (view.phase === 'vote' || view.phase === 'runoff') {
    if (!me.playing) return;
    if (view.phase === 'runoff' && !view.runoff?.includes(seat)) return;
    void voteLiar(view.code, seat).then(() => refresh());
    return;
  }
  if (RUNNING.includes(view.phase)) mark(marks[me.seat] === seat ? null : seat);
}

function Shell({ t, code, onLeave, timer, view, children }: { t: ReturnType<typeof liarCopy>; code: string; onLeave: () => void; timer?: number | null; view?: LiarView; children: React.ReactNode }) {
  const urgent = timer != null && timer <= 5 && view && RUNNING.includes(view.phase);
  return (
    <div className="flex h-[100dvh] flex-col bg-[#0d0b14] text-[#ece8f7]" style={{ backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(150,110,255,.22), transparent 70%)' }}>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 bg-black/40 px-3 backdrop-blur">
        <button type="button" onClick={onLeave} aria-label={t.leave} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"><ArrowLeft size={18} /></button>
        <strong className="min-w-0 truncate text-[15px] font-black tracking-tight">{t.title}</strong>
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-white/60">{code.toUpperCase()}</span>
        {view && RUNNING.includes(view.phase) && view.round > 0 && <span className="text-[11px] font-bold text-white/50">{t.round(view.round, view.roundsMax)}</span>}
        <span className="flex-1" />
        {(!view || view.phase === 'lobby' || view.phase === 'done') && <GameUpdates game="hidden_word_liar" />}
        {timer != null && view && view.phase !== 'lobby' && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[13px] font-black ${urgent ? 'animate-pulse bg-[#ff5a3d] text-white' : 'bg-white/10 text-white/80'}`}><Timer size={13} />{timer}</span>
        )}
        <button type="button" onClick={onLeave} aria-label={t.leave} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10"><LogOut size={16} /></button>
      </header>
      {children}
    </div>
  );
}

function MyWord({ view, t }: { view: LiarView; t: ReturnType<typeof liarCopy> }) {
  const [show, setShow] = useState(false);
  const word = view.me?.word;
  if (!word || !RUNNING.includes(view.phase)) return null;
  const first = view.phase === 'cards';
  return (
    <div className="mx-auto mt-3 flex max-w-[520px] items-center gap-3 rounded-2xl border border-[#a98bff]/40 bg-[#1b1530] px-4 py-2.5">
      <span className="text-[11px] font-black text-[#c9b6ff]">{t.myWord}</span>
      <button type="button"
        onPointerDown={() => setShow(true)} onPointerUp={() => setShow(false)} onPointerLeave={() => setShow(false)} onContextMenu={(e) => e.preventDefault()}
        className={`min-w-0 flex-1 select-none rounded-xl px-3 py-1.5 text-center text-[20px] font-black tracking-tight transition ${show || first ? 'bg-white text-[#241457]' : 'bg-white/10 text-transparent [text-shadow:0_0_14px_rgba(255,255,255,.7)]'}`}>
        {show || first ? word : '●●●'}
      </button>
      {!show && !first && <span className="text-[10px] font-bold text-white/45">{t.holdToSee}</span>}
    </div>
  );
}

/** A countdown ring: `frac` of the phase left, the seconds in the middle. Red and beating in the last five. */
function Ring({ frac, left, size = 34, children }: { frac: number | null; left: number | null; size?: number; children?: React.ReactNode }) {
  const r = size / 2 - 2.5;
  const c = 2 * Math.PI * r;
  const urgent = left != null && left <= 5;
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${urgent ? 'hwl-urgent' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.14)" strokeWidth="3" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={urgent ? '#ff5a3d' : '#ffd36e'} strokeWidth="3" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - (frac ?? 0))} style={{ transition: 'stroke-dashoffset .25s linear' }} />
      </svg>
      {children ?? <span className={`relative font-mono text-[13px] font-black ${urgent ? 'text-[#ff8a6d]' : ''}`}>{left ?? ''}</span>}
    </span>
  );
}

/** A clue's number counting up as it lands. */
function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let id = 0;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 600); setV(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) id = requestAnimationFrame(step); };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [to]);
  return <>{v}</>;
}

const Dots = () => <span className="hwl-dots inline-flex items-center"><i /><i /><i /></span>;

/** Seats around an oval table, icons first; the table's centre (children) is where the current phase is played. */
function Table({ view, t, marks, typing, now, frac, left, onTap, children }: {
  view: LiarView; t: T; marks: Record<number, number>; typing: Typing; now: number; frac: number | null; left: number | null;
  onTap: (seat: number) => void; children: React.ReactNode;
}) {
  const seats = view.phase === 'lobby' ? view.members : view.members.filter((m) => m.playing || RUNNING.includes(view.phase) === false);
  const order = view.order.length && view.phase !== 'lobby' ? view.order.map((s) => seats.find((m) => m.seat === s)).filter(Boolean) as LiarMember[] : seats;
  const empty = view.phase === 'lobby' && view.kind === 'friend' ? Math.max(0, Math.max(view.cfg.min, Math.min(6, order.length + 1)) - order.length) : 0;
  const n = order.length + empty;
  const big = n <= 6;
  const size = big ? 52 : 42;
  const lastClue = (seat: number) => [...view.clues].reverse().find((c) => c.seat === seat);
  const suspects: Record<number, number> = {};
  Object.values(marks).forEach((s) => { suspects[s] = (suspects[s] ?? 0) + 1; });
  const votes: Record<number, number> = {};
  (view.votes ?? []).filter((v) => v.stage === (view.votes?.some((x) => x.stage === 'runoff') ? 'runoff' : 'vote')).forEach((v) => { votes[v.target] = (votes[v.target] ?? 0) + 1; });
  const turn = view.turn;
  // the next speaker this round (the server skips anyone who left)
  const ti = turn != null ? view.order.indexOf(turn) : -1;
  const next = ti >= 0 ? view.order.slice(ti + 1).find((s) => view.members.some((m) => m.seat === s && m.playing && !m.gone)) : undefined;
  const voting = view.phase === 'vote' || view.phase === 'runoff';
  const over = view.phase === 'done' && view.result;
  return (
    <div className="relative mx-auto mb-10 mt-10 w-full max-w-[520px]" style={{ aspectRatio: big ? '1 / 0.86' : '1 / 1.02' }}>
      {/* the table */}
      <div className={`absolute inset-[17%_15%] rounded-[50%] border-2 bg-[radial-gradient(ellipse_at_50%_35%,#2a2147,#15111f_72%)] shadow-[inset_0_0_40px_rgba(0,0,0,.6),0_0_40px_rgba(150,110,255,.15)] transition-colors ${view.phase === 'clue' && turn === view.me?.seat ? 'border-[#ffd36e]/60' : 'border-[#a98bff]/25'}`} />
      {Array.from({ length: empty }, (_, k) => {
        const a = -Math.PI / 2 + ((order.length + k) * 2 * Math.PI) / n;
        const x = 50 + 41 * Math.cos(a), y = 50 + (big ? 40 : 42) * Math.sin(a);
        return (
          <span key={`empty-${k}`} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="flex items-center justify-center rounded-full border-2 border-dashed border-white/25 text-[20px] font-black text-white/35" style={{ width: size, height: size }}>+</span>
            <span className="mt-1 text-[10px] font-bold text-white/35">{t.emptySeat}</span>
          </span>
        );
      })}
      {order.map((m, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = 50 + 41 * Math.cos(a), y = 50 + (big ? 40 : 42) * Math.sin(a);
        const clue = view.phase === 'lobby' ? null : lastClue(m.seat);
        const isTurn = view.phase === 'clue' && turn === m.seat;
        const mine = view.me?.seat === m.seat;
        const accused = view.accused === m.seat && (view.phase === 'guess' || over);
        const liar = over && view.result!.liar === m.seat;
        const canVote = voting && view.me?.playing && !mine && (view.phase !== 'runoff' || view.runoff?.includes(m.seat));
        const myVote = view.me?.voted === m.seat;
        const typer = !mine && typing[m.seat] && typing[m.seat].until > now && RUNNING.includes(view.phase) ? typing[m.seat] : null;
        const hotOnly = clue?.word && clue.hot && clue.score == null;
        return (
          <button key={m.seat} type="button" onClick={() => onTap(m.seat)}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${m.gone ? 'opacity-35' : ''} ${canVote ? 'cursor-pointer' : ''}`}
            style={{ left: `${x}%`, top: `${y}%`, width: big ? 92 : 86 }}>
            {/* typing "…", else the last clue */}
            {typer ? (
              <span className={`mb-1 flex h-[20px] items-center rounded-full px-2.5 shadow ${typer.kind === 'clue' ? 'bg-[#ffd36e] text-[#241457]' : 'bg-white/20 text-white'}`} title={typer.kind === 'clue' ? t.typingClue : t.typingChat}><Dots /></span>
            ) : clue && (
              <span key={clue.n} className={`hwl-pop mb-1 flex items-center rounded-full py-0.5 font-black shadow ${big ? 'max-w-full gap-1 px-2 text-[11px]' : 'max-w-[86px] gap-0.5 px-1.5 text-[10px] tracking-tight'} ${clue.word ? 'bg-white text-[#241457]' : 'bg-white/15 text-white/70'}`}>
                <span className="truncate">{clue.word ?? silentOf(view, clue, t)}</span>
                {clue.word && <span className={`shrink-0 rounded-full px-1 text-[10px] text-white ${hotOnly ? 'hwl-hot' : ''}`} style={{ background: hotOnly ? '#ff5a3d' : clue.score == null ? '#6b6680' : scoreColor(clue.score) }}>
                  {clue.score != null ? <CountUp to={Math.round(clue.score)} /> : shownScore(clue, t)}
                </span>}
              </span>
            )}
            <span className={`relative rounded-full ${isTurn ? 'hwl-glow' : ''} ${liar ? 'ring-[3px] ring-[#ff5a3d] ring-offset-2 ring-offset-[#15111f]' : ''} ${myVote ? 'ring-[3px] ring-[#ff5a3d] ring-offset-2 ring-offset-[#15111f]' : ''} ${canVote && !myVote ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-[#15111f]' : ''}`}>
              <RimStone name={m.name} size={size} />
              {isTurn && <span className="pointer-events-none absolute -inset-[6px]"><Ring frac={frac} left={left} size={size + 12}><span /></Ring></span>}
              {isTurn && left != null && <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-1.5 font-mono text-[10px] font-black ${left <= 5 ? 'bg-[#ff5a3d] text-white' : 'bg-[#ffd36e] text-[#241457]'}`}>{left}</span>}
              {liar && <span className="hwl-stamp absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5a3d] text-[15px] shadow-lg ring-2 ring-white">🎭</span>}
              {accused && !liar && <span className="absolute -right-2 -top-2 rounded-full bg-[#ffd36e] px-1.5 text-[10px] font-black text-[#241457]">?</span>}
              {(suspects[m.seat] ?? 0) > 0 && !over && <span className="absolute -left-2 -top-1.5 flex items-center gap-0.5 rounded-full bg-black/75 px-1 text-[10px] font-black text-[#ffd36e]"><Eye size={10} />{suspects[m.seat]}</span>}
              {(votes[m.seat] ?? 0) > 0 && <span className="absolute -bottom-1.5 -right-2 rounded-full bg-[#ff5a3d] px-1.5 text-[10px] font-black text-white">{votes[m.seat]}</span>}
              {voting && m.voted && <span className="absolute -bottom-1 -left-1.5 rounded-full bg-[#3fd67a] px-1 text-[9px] font-black text-[#0b2b16]">✓</span>}
              {view.phase === 'talk' && m.talked && <span className="absolute -bottom-1 -left-1.5 rounded-full bg-[#7fd0ff] px-1 text-[9px] font-black text-[#082033]">✓</span>}
              {view.host === m.seat && view.kind === 'friend' && <Crown size={13} className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#ffd36e]" />}
            </span>
            <span className={`mt-1 max-w-full truncate text-[11px] font-black ${liar ? 'rounded-full bg-[#ff5a3d] px-1.5 text-white' : mine ? 'text-[#ffe9a8]' : 'text-white/80'} ${isTurn ? 'mt-2' : ''}`}>{m.name}{mine ? ` (${t.me})` : ''}</span>
            {view.phase === 'clue' && next === m.seat && <span className="mt-0.5 rounded-full border border-[#ffd36e]/50 px-1.5 text-[9px] font-black text-[#ffd36e]/90">{t.next}</span>}
            {over && m.pieces ? <span className="hwl-pop mt-0.5 rounded-full bg-[#ffd36e] px-1.5 text-[10px] font-black text-[#3a2600]">🧩 {t.pieces(m.pieces)}</span> : null}
            {!m.here && view.phase === 'lobby' && <span className="text-[9px] text-white/40">{t.away}</span>}
          </button>
        );
      })}
      {/* the centre sits above the seats' wide buttons, but lets taps through where it is empty */}
      <div className="pointer-events-none absolute inset-[19%_20%_27%] z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** The middle of the table: what this phase asks of me, right where everyone is looking. */
function Center({ view, t, left, frac, marks, mark, refresh, submitClue, typingNow }: {
  view: LiarView; t: T; left: number | null; frac: number | null; marks: Record<number, number>; mark: (s: number | null) => void;
  refresh: () => Promise<void>; submitClue: (word: string, mask: boolean) => Promise<string | null>; typingNow: (kind: 'clue' | 'chat', stop?: boolean) => void;
}) {
  const r = view.result;
  const me = view.me;
  const nameOf = (seat: number | null | undefined) => view.members.find((m) => m.seat === seat)?.name ?? '?';
  const liarName = nameOf(view.liar ?? r?.liar);
  const [word, setWord] = useState('');
  const [mask, setMask] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const myTurn = view.phase === 'clue' && view.turn === me?.seat;
  const myGuess = view.phase === 'guess' && view.liar === me?.seat;
  const myMark = me ? marks[me.seat] : undefined;
  const ring = <Ring frac={frac} left={left} />;
  const live = 'pointer-events-auto';
  const markLine = me?.playing && (view.phase === 'clue' || view.phase === 'talk') && (
    myMark != null
      ? <button type="button" onClick={() => mark(null)} className={`${live} mt-1.5 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-black text-[#ffd36e]`}>{t.markOn(nameOf(myMark))}<X size={11} /></button>
      : <p className="mt-1.5 break-keep text-[10px] leading-tight text-white/45">{t.markShort}</p>
  );
  const send = async (fn: () => Promise<string | null>) => {
    if (busy) return; setBusy(true); setErr(null);
    const e = await fn(); setBusy(false);
    if (e) setErr(e); else { setWord(''); setMask(false); }
  };
  const field = (ph: string, kind: 'clue' | 'guess') => (
    <input autoFocus value={word} maxLength={12} placeholder={ph} enterKeyHint="send"
      onChange={(e) => { setWord(e.target.value); setErr(null); unlockGameAudio(); if (kind === 'clue') typingNow('clue'); }}
      className="w-0 min-w-0 flex-1 rounded-xl border-2 border-[#ffd36e] bg-black/60 px-2 py-2 text-center text-[16px] font-black text-white outline-none placeholder:text-[11px] placeholder:font-bold placeholder:text-white/35" />
  );

  let body: React.ReactNode = null;
  if (view.phase === 'lobby') body = <><p className="text-[13px] font-black">{view.kind === 'house' ? t.houseLobby : t.lobbyTitle}</p><p className="mt-1 text-[11px] text-white/55">{view.members.length}/10</p></>;
  else if (view.phase === 'cards') body = <><p className="text-[15px] font-black">{t.cards}</p><p className="mt-1 break-keep text-[11px] text-white/55">{t.wordNote}</p></>;
  else if (myTurn) body = (
    <form className={`${live} hwl-pop w-full rounded-2xl border border-[#ffd36e]/60 bg-[#1b1530]/95 p-2 shadow-[0_0_30px_rgba(255,211,110,.25)]`}
      onSubmit={(e) => { e.preventDefault(); if (word.trim()) void send(() => submitClue(word, mask)); }}>
      <div className="flex items-center gap-1.5">
        {ring}
        <p className="min-w-0 flex-1 break-keep text-left text-[12px] font-black leading-tight text-[#ffd36e]">{t.myTurn}</p>
        <button type="button" disabled={me?.maskUsed} onClick={() => setMask((m) => !m)} title={t.maskTip}
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${mask ? 'bg-[#a98bff] text-[#1a1030]' : 'bg-white/10 text-white/75'} disabled:opacity-35`}>{me?.maskUsed ? t.maskUsed : mask ? t.maskOn : t.mask}</button>
      </div>
      <div className="mt-1.5 flex gap-1">
        {field(t.cluePh, 'clue')}
        <button type="submit" disabled={busy || !word.trim()} className="shrink-0 rounded-xl bg-[#ffd36e] px-2.5 text-[12px] font-black text-[#241457] disabled:opacity-40">{busy ? <Loader2 size={14} className="animate-spin" /> : t.say}</button>
      </div>
      {err && <p className="mt-1 break-keep text-[11px] font-bold text-[#ff8a6d]">{err}</p>}
    </form>
  );
  else if (view.phase === 'clue') body = <>
    {ring}
    <p className="mt-1 text-[14px] font-black">{t.turnOf(nameOf(view.turn))}</p>
    {markLine}
  </>;
  else if (view.phase === 'talk') {
    const last = view.round >= view.roundsMax;
    body = <>
      <div className="flex items-center gap-2">{ring}<p className="text-[15px] font-black">{t.talkTitle}</p></div>
      {last && <p className="mt-1 break-keep text-[10.5px] leading-tight text-white/60">{t.talkLast}</p>}
      {me?.playing && (last
        ? <button type="button" disabled={!!me.talk} onClick={() => { void talkLiar(view.code, 'accuse').then(refresh); }} className={`${live} mt-1.5 w-full rounded-xl bg-[#ff8a6d] py-2 text-[13px] font-black text-[#2a0d05] disabled:opacity-50`}>{me.talk ? '✓ ' : ''}{t.ready}</button>
        : <div className={`${live} mt-1.5 grid w-full grid-cols-2 gap-1.5`}>
            {(['accuse', 'more'] as const).map((k) => (
              <button key={k} type="button" onClick={() => { void talkLiar(view.code, k).then(refresh); }}
                className={`flex flex-col items-center rounded-xl px-1 py-1.5 font-black leading-tight ${me.talk === k ? (k === 'accuse' ? 'bg-[#ff8a6d] text-[#2a0d05]' : 'bg-[#7fd0ff] text-[#082033]') : 'bg-white/10 text-white'}`}>
                <span className="text-[12px]">{k === 'accuse' ? t.accuse : t.more}</span>
                <span className="text-[10px] opacity-70">{view.talk[k]}</span>
              </button>
            ))}
          </div>)}
      {markLine}
    </>;
  }
  else if (view.phase === 'vote' || view.phase === 'runoff') body = <>
    {ring}
    <p className="mt-1 text-[15px] font-black text-[#ff8a6d]">{view.phase === 'runoff' ? t.runoffTitle : t.voteTitle}</p>
    {me?.playing && (me.voted != null
      ? <p className="mt-1 rounded-full bg-[#3fd67a]/20 px-2 py-0.5 text-[11px] font-black text-[#7fe3a0]">✓ {t.voted} · {nameOf(me.voted)}</p>
      : <p className="mt-1 break-keep text-[11px] leading-tight text-white/65">👆 {t.voteHint}</p>)}
  </>;
  else if (myGuess) body = (
    <form className={`${live} hwl-pop w-full rounded-2xl border border-[#ffd36e]/60 bg-[#1b1530]/95 p-2`} onSubmit={(e) => { e.preventDefault(); if (word.trim()) void send(async () => { const res = await guessLiar(view.code, word); void refresh(); return res?.error ? ({ empty: t.clueErr.empty, turn: t.clueErr.turn } as Record<string, string>)[res.error] ?? t.error : null; }); }}>
      <div className="flex items-center justify-center gap-2">{ring}<p className="break-keep text-left text-[12px] font-black leading-tight text-[#ffd36e]">{t.guessMine}</p></div>
      <div className="mt-1.5 flex gap-1">
        {field(t.guessPh, 'guess')}
        <button type="submit" disabled={busy || !word.trim()} className="shrink-0 rounded-xl bg-[#ffd36e] px-3 text-[13px] font-black text-[#241457] disabled:opacity-40">{t.guessBtn}</button>
      </div>
      {err && <p className="mt-1 text-[11px] font-bold text-[#ff8a6d]">{err}</p>}
    </form>
  );
  else if (view.phase === 'guess') body = <>
    {ring}
    <p className="mt-1 text-[15px] font-black text-[#ffd36e]">{t.guessTitle(liarName)}</p>
    <p className="mt-1 break-keep text-[11px] text-white/60">{t.guessWait}</p>
  </>;
  else if (view.phase === 'done' && r) body = (
    <>
      <p className="text-[30px] leading-none">{r.outcome === 'liar' ? '🎭' : r.outcome === 'citizens' ? '🕵️' : '·'}</p>
      <p className={`mt-1 text-[20px] font-black ${r.outcome === 'liar' ? 'text-[#ff8a6d]' : r.outcome === 'citizens' ? 'text-[#7fe3a0]' : 'text-white/70'}`}>{r.outcome === 'liar' ? t.resultLiar : r.outcome === 'citizens' ? t.resultCitizens : t.resultVoid}</p>
      {t.reason[r.reason] && <p className="mt-0.5 text-[11px] text-white/60">{t.reason[r.reason]}</p>}
      <div className="mt-2 flex items-center justify-center gap-2 text-[12px]">
        <span className="rounded-lg bg-white px-2 py-0.5 font-black text-[#241457]">{r.answer}</span>
        <span className="text-white/40">vs</span>
        <span className="rounded-lg bg-[#ff5a3d] px-2 py-0.5 font-black text-white">{r.decoy}</span>
      </div>
      <p className="mt-1 text-[10px] text-white/50">{t.answer} · {t.decoy}</p>
      {r.guess && <p className="mt-1 text-[11px] text-white/70">{t.guessed}: <b>{r.guess}</b></p>}
    </>
  );
  else if (view.phase === 'closed') body = <p className="text-[14px] font-black">{t.closed}</p>;
  const pop = view.phase === 'done' || view.phase === 'guess' || view.phase === 'talk' || view.phase === 'vote' || view.phase === 'runoff';
  return <div key={`${view.phase}-${view.game}-${view.phase === 'clue' ? view.turn : ''}`} className={`flex w-full flex-col items-center justify-center text-center ${pop ? 'hwl-pop' : ''}`}>{body}</div>;
}

function Actions({ view, t, en, code, refresh }: { view: LiarView; t: ReturnType<typeof liarCopy>; en: boolean; code: string; refresh: () => Promise<void> }) {
  const me = view.me;
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => { const id = window.setTimeout(() => setUrl(`${window.location.origin}/${en ? 'en' : 'ko'}/hidden-word-liar/room/${code}`), 0); return () => window.clearTimeout(id); }, [code, en]);
  const isHost = view.kind === 'friend' && view.host === me?.seat;
  const submit = async (fn: () => Promise<unknown>) => {
    if (busy) return; setBusy(true);
    await fn(); setBusy(false);
    void refresh();
  };
  const box = 'mx-auto mt-3 max-w-[520px] rounded-2xl border border-white/10 bg-white/[.04] p-3';

  if (view.phase === 'lobby') {
    const n = view.members.length;
    return (
      <div className={box}>
        {view.kind === 'friend' && <>
          <p className="break-keep text-center text-[12px] font-bold text-white/70">{t.lobbyHint(n, view.cfg.min)}</p>
          <p className="mt-3 mb-1.5 text-[11px] font-black text-[#c9b6ff]">{t.invite}</p>
          <LiarShare url={url} title={t.title} text={t.inviteText(code.toUpperCase())} button={t.inviteButton} en={en} />
          {isHost
            ? <button type="button" disabled={n < view.cfg.min || busy} onClick={() => submit(() => startLiar(code))} className="mt-3 w-full rounded-xl py-3 text-[15px] font-black text-[#1a1030] disabled:opacity-40" style={{ background: LIAR_ACCENT }}>{t.start} ({n}/10)</button>
            : <p className="mt-3 text-center text-[12px] text-white/50">{t.waitHost}</p>}
          {isHost && view.members.filter((m) => m.seat !== me?.seat).length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {view.members.filter((m) => m.seat !== me?.seat).map((m) => (
                <button key={m.seat} type="button" onClick={() => { void kickLiar(code, m.seat).then(refresh); }} className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/50"><UserX size={11} />{m.name}</button>
              ))}
            </div>
          )}
        </>}
        {view.kind === 'house' && <p className="text-center text-[12px] text-white/70">{t.houseLobby}</p>}
      </div>
    );
  }
  if (view.phase === 'done' && view.result) {
    const r = view.result;
    const iWasLiar = me?.seat === r.liar;
    const ready = view.members.filter((m) => m.ready && !m.gone).length;
    return (
      <div className={box}>
        {!r.valid && r.outcome !== 'void' && <p className="mb-2 break-keep text-center text-[10px] text-white/40">{t.noReward}</p>}
        {me?.piecesToday != null && <p className="mb-2 text-center text-[11px] font-black text-[#ffd36e]">🧩 {t.todayLeft(Math.max(0, view.cfg.dailyCap - me.piecesToday), view.cfg.dailyCap)}</p>}
        {view.kind === 'friend'
          ? (isHost
              ? <button type="button" disabled={busy || view.members.length < view.cfg.min} onClick={() => submit(() => startLiar(code))} className="w-full rounded-xl py-3 text-[15px] font-black text-[#1a1030] disabled:opacity-40" style={{ background: LIAR_ACCENT }}>{t.againHost}</button>
              : <p className="text-center text-[12px] text-white/50">{t.waitHost}</p>)
          : <button type="button" disabled={!me || me.ready} onClick={() => { void readyLiar(code, true).then(refresh); }} className="w-full rounded-xl py-3 text-[15px] font-black text-[#1a1030] disabled:opacity-60" style={{ background: LIAR_ACCENT }}>{me?.ready ? `✓ ${t.readyOn}` : t.again} · {t.againWait(ready)}</button>}
        {me?.playing && r.outcome !== 'void' && <>
          <p className="mt-3 mb-1.5 text-[11px] font-black text-[#c9b6ff]">{t.share}</p>
          <LiarShare compact url={`${url.replace(/\/room\/.*$/, '')}`} title={t.title} text={`${t.shareResult(iWasLiar, r.outcome)} · ${r.answer} vs ${r.decoy}`} button={en ? 'Play' : '플레이하기'} en={en} />
        </>}
        {view.kind === 'friend' && <>
          <p className="mt-3 mb-1.5 text-[11px] font-black text-[#c9b6ff]">{t.invite}</p>
          <LiarShare compact url={url} title={t.title} text={t.inviteText(code.toUpperCase())} button={t.inviteButton} en={en} />
        </>}
      </div>
    );
  }
  return null;
}

function ClueBoard({ view, t }: { view: LiarView; t: ReturnType<typeof liarCopy> }) {
  if (!view.clues.length) return null;
  const over = view.phase === 'done';
  const rounds = [...new Set(view.clues.map((c) => c.round))];
  const nameOf = (seat: number) => view.members.find((m) => m.seat === seat)?.name ?? '?';
  return (
    <div className="mx-auto mt-3 max-w-[520px] rounded-2xl border border-white/10 bg-black/30 p-3">
      <p className="mb-2 text-[11px] font-black text-[#c9b6ff]">{t.board}</p>
      {rounds.map((r) => (
        <div key={r} className="mb-1.5 flex flex-wrap gap-1.5">
          <span className="w-full text-[9px] font-bold text-white/35">{t.round(r, view.roundsMax)}</span>
          {view.clues.filter((c) => c.round === r).map((c) => (
            <span key={c.n} className={`flex items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2 text-[11px] font-bold ${over && view.result?.liar === c.seat ? 'bg-[#ff5a3d]/20 ring-1 ring-[#ff5a3d]/60' : 'bg-white/[.07]'}`}>
              <RimStone name={nameOf(c.seat)} size={18} rim={1} />
              <span className="text-white/90">{c.word ?? t.silent}</span>
              {c.word && <span className="font-black" style={{ color: c.score == null ? (c.hot ? '#ff5a3d' : '#9a94b0') : scoreColor(c.score) }}>{shownScore(c, t)}{over && c.masked ? '🎭' : ''}</span>}
              {over && c.decoyScore != null && <span className="text-[9px] text-white/40">/{Math.round(c.decoyScore)}</span>}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Rules({ t }: { t: ReturnType<typeof liarCopy> }) {
  return (
    <ul className="mx-auto mt-3 max-w-[520px] space-y-1 rounded-2xl border border-white/10 bg-white/[.03] p-3 text-[11px] text-white/60">
      {t.rules.map((r) => <li key={r} className="break-keep">· {r}</li>)}
    </ul>
  );
}

function ChatPanel({ chat, t, say, view, myTurn, submitClue, typingNow }: {
  chat: LiarChat[]; t: T; say: (text: string, emote?: boolean) => string | null; view: LiarView; myTurn: boolean;
  submitClue: (word: string, mask: boolean) => Promise<string | null>; typingNow: (kind: 'clue' | 'chat', stop?: boolean) => void;
}) {
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [offer, setOffer] = useState<string | null>(null); // a lone noun typed here on my turn: "submit it as my clue?"
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [chat.length]);
  useEffect(() => { if (!myTurn) { const id = window.setTimeout(() => setOffer(null), 0); return () => window.clearTimeout(id); } }, [myTurn]);
  const word = view.me?.word;
  const inGame = RUNNING.includes(view.phase);
  const send = (raw: string, emote = false, force = false) => {
    const flat = raw.replace(/\s+/g, '');
    if (word && inGame && flat.includes(word)) { setErr(t.chatBlocked.word); return; }
    if (myTurn && !emote && !force && isWord(raw)) { setOffer(raw.trim()); return; }
    const block = say(raw, emote);
    if (block) { setErr(t.chatBlocked[block] ?? null); return; }
    setErr(null); setOffer(null);
    if (!emote) { setText(''); typingNow('chat', true); }
  };
  const asClue = async () => {
    if (!offer) return;
    const e = await submitClue(offer, false);
    if (e) setErr(e); else { setText(''); setOffer(null); }
  };
  const colorOf = useMemo(() => {
    const palette = ['#ffd36e', '#7fd0ff', '#ff9ab8', '#9dff9a', '#c9b6ff', '#ffb27a', '#7fffe0', '#ff8a6d', '#b6e33a', '#e0c3ff'];
    return (seat: number) => palette[seat % palette.length];
  }, []);
  return (
    <div className={`flex shrink-0 flex-col border-t border-white/10 bg-black/45 transition-opacity lg:h-auto lg:w-[340px] lg:border-l lg:border-t-0 ${view.phase === 'lobby' ? 'h-[28dvh]' : 'h-[34dvh]'} ${myTurn && !offer ? 'opacity-55 focus-within:opacity-100' : ''}`}>
      {inGame && (
        <p className={`flex items-center gap-1 border-b border-white/5 px-3 py-1 text-[10.5px] font-bold ${myTurn ? 'bg-[#ffd36e]/10 text-[#ffd36e]' : 'text-white/40'}`}>
          <MessageCircle size={11} />{myTurn ? t.chatNote : t.chat}
        </p>
      )}
      <div ref={list} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2 text-[13px]">
        {chat.map((m) => m.kind === 'system'
          ? <p key={m.key} className="text-[12px] font-bold text-[#c9b6ff]/90">{m.text}</p>
          : <p key={m.key} className="break-words leading-snug"><b style={{ color: colorOf(m.seat) }}>{m.name}</b> <span className={m.kind === 'emote' ? 'rounded bg-white/10 px-1 font-bold' : 'text-white/90'}>{m.text}</span></p>)}
      </div>
      {offer ? (
        <div className="mx-2 mb-1 rounded-xl border border-[#ffd36e]/60 bg-[#1b1530] p-2">
          <p className="text-center text-[12px] font-black text-[#ffd36e]">{t.asClue(offer)}</p>
          {err && <p className="mt-0.5 text-center text-[11px] font-bold text-[#ff8a6d]">{err}</p>}
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => { void asClue(); }} className="rounded-lg bg-[#ffd36e] py-1.5 text-[12px] font-black text-[#241457]">{t.asClueYes}</button>
            <button type="button" onClick={() => send(offer, false, true)} className="rounded-lg bg-white/10 py-1.5 text-[12px] font-bold text-white/80">{t.asClueNo}</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1 overflow-x-auto px-2 pb-1">
          {t.quick.map((q) => <button key={q} type="button" onClick={() => send(q, true)} className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80 active:bg-white/20">{q}</button>)}
        </div>
      )}
      <form className="flex gap-1.5 px-2 pb-2 pt-1" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <input value={text} onChange={(e) => { setText(e.target.value); setErr(null); setOffer(null); if (e.target.value) typingNow('chat'); }} maxLength={100} placeholder={err ?? (inGame ? t.chatPhGame : t.chatPh)}
          className={`min-w-0 flex-1 rounded-xl border bg-white/5 px-3 py-2 text-[16px] outline-none ${err ? 'border-[#ff8a6d] placeholder:text-[#ff8a6d]' : 'border-white/10'}`} />
        <button type="submit" aria-label={t.send} className="flex w-11 items-center justify-center rounded-xl bg-[#a98bff] text-[#1a1030]"><Send size={16} /></button>
      </form>
    </div>
  );
}
