"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, BookOpen, Crown, Eye, HelpCircle, Lightbulb, Loader2, LogOut, MessageCircle, Music, Send, Timer, UserX, Volume2, VolumeX, X } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import { RimStone } from '@/components/match/PlayerPlate';
import { checkNewIcons } from '@/components/IconUnlock';
import GameUpdates from '@/components/GameUpdates';
import { useChatBottom } from '@/hooks/useChatBottom';
import {
  LIAR_ACCENT, REVEAL, type LiarClue, type LiarMember, type LiarView, decideLiar, extendLiar, guessLiar, inviteLiar, talkExtendLiar, kickLiar, leaveLiar, myName, readyLiar,
  revealFlip, sayClue, phaseSecs, scoreColor, secondsLeft, startLiar, talkLiar, voteLiar,
} from '@/lib/hiddenWordLiar';
import { bgmOn, buzz, onSoundChange, setBgm, setMood, setSfx, sfx, sfxOn, unlock } from './liarSound';
import LiarTutorial, { TipBubble, openLiarTutorial, resetLiarTips, useTip } from './LiarTutorial';
import { LiarStone } from './LiarArt';
import { liarCopy } from './copy';
import LiarShare from './LiarShare';
import { type LiarChat, useLiarRoom } from './useLiarRoom';

const RUNNING = ['cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide', 'guess'];
type T = ReturnType<typeof liarCopy>;
type Typing = Record<number, { kind: 'clue' | 'chat'; until: number }>;
const shownScore = (c: LiarClue, t: T) => c.word == null ? t.silent : c.score != null ? String(Math.round(c.score)) : c.hot ? t.hot : c.masked ? t.masked : '';
/** A clue with no word: the player's 20 s ran out, or they had left the table. */
const silentOf = (view: LiarView, c: LiarClue, t: T) => view.members.find((m) => m.seat === c.seat)?.gone ? t.gone : t.silent;
const isWord = (s: string) => /^[가-힣]{1,12}$/.test(s.trim());
/** Seat i of n around the oval, in % of the table box. */
const seatPos = (i: number, n: number, big: boolean) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return { a, x: 50 + 41 * Math.cos(a), y: 50 + (big ? 40 : 42) * Math.sin(a) };
};

/** The room's light and music follow the phase: calm while clues go round, warm and tense from the vote on. */
type Mood = 'none' | 'calm' | 'tense';
const moodOf = (phase: string | undefined): Mood => !phase ? 'none' : ['vote', 'runoff', 'last', 'decide', 'guess'].includes(phase) ? 'tense' : ['cards', 'clue', 'talk'].includes(phase) ? 'calm' : 'none';
const PARTICLES = ['', 'ㄹ', '를', '을', '이', '가', '은', '는', '도', '의', '에', '로', '와', '과', '랑', '만', '요', '으로', '에서', '이랑', '처럼'];
/** The clue already said this game that `typed` would repeat (spaces, case and a particle stuck on are ignored). */
const repeatOf = (view: LiarView, typed: string) => {
  const w = typed.replace(/\s+/g, '').toLowerCase();
  if (!w) return null;
  return view.clues.find((c) => c.word && w.startsWith(c.word) && PARTICLES.includes(w.slice(c.word.length)))?.word ?? null;
};
/** Who has the most 👁 marks right now (all of them on a tie), from two marks up. */
const topSuspects = (marks: Record<number, number>) => {
  const n: Record<number, number> = {};
  Object.values(marks).forEach((s) => { n[s] = (n[s] ?? 0) + 1; });
  const top = Math.max(0, ...Object.values(n));
  return top >= 2 ? Object.keys(n).map(Number).filter((s) => n[s] === top) : [];
};

/** Where the end-of-game show is (seconds since the server's reveal.at; everyone sees the same moment). */
type Show = { t: number; order: number[]; flipAt: (seat: number) => number; flipsEnd: number; verdictAt: number; end: number; over: boolean; serverWait: boolean };
function revealShow(view: LiarView, now: number, skew: number, skipped: boolean): Show | null {
  const r = view.result;
  if (view.phase !== 'done' || !r || !view.reveal) return null;
  const playing = view.order.filter((s) => view.members.some((m) => m.seat === s));
  const order = [...playing.filter((s) => s !== r.liar), ...(playing.includes(r.liar) ? [r.liar] : [])];
  const flipsEnd = revealFlip(Math.max(0, order.length - 1)) + 0.6;
  const verdictAt = flipsEnd + (r.guess ? REVEAL.guess : 0);
  const end = (view.reveal.until - view.reveal.at) / 1000;
  const raw = (now + skew - view.reveal.at) / 1000;
  const t = r.outcome === 'void' || skipped ? Infinity : raw;
  return { t, order, flipAt: (s) => revealFlip(Math.max(0, order.indexOf(s))), flipsEnd, verdictAt, end, over: t >= end, serverWait: raw < end };
}

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
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 200); return () => window.clearInterval(id); }, []);
  const [skippedGame, setSkippedGame] = useState<number | null>(null);
  const kb = useKeyboard();
  const chatFocus = kb.chat;

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
    if (last?.word) window.setTimeout(() => sfx.clue(last.hot && last.score == null), 550);   // as the flying clue lands
  }, [view, pushSystem, clearTyping, t]);

  // sound waits for the first touch; the music follows the phase
  useEffect(() => {
    const go = () => unlock();
    document.addEventListener('pointerdown', go, { once: true });
    return () => { document.removeEventListener('pointerdown', go); setMood('none'); };
  }, []);
  useEffect(() => { setMood(moodOf(view?.phase)); }, [view?.phase]);
  // ⏱ a player took +30 s: tell everyone, and let the speaker's ring count the longer turn
  const extSeen = useRef<string | null>(null);
  const [extTurn, setExtTurn] = useState<string | null>(null);
  const [extToast, setExtToast] = useState<{ key: string; text: string } | null>(null);
  const extKey = view ? `${view.game}:${view.members.filter((m) => m.extended).map((m) => m.seat).join(',')}` : null;
  useEffect(() => {
    if (!view || !extKey) return;
    const was = extSeen.current;
    extSeen.current = extKey;
    if (was == null || was === extKey || was.split(':')[0] !== extKey.split(':')[0]) return;
    const before = new Set(was.split(':')[1].split(',').filter(Boolean).map(Number));
    const who = view.members.find((m) => m.extended && !before.has(m.seat));
    if (!who) return;
    const k = `${view.game}:${view.round}:${view.turn}`;
    const s = window.setTimeout(() => { setExtTurn(k); setExtToast({ key: extKey, text: t.extendToast(who.name) }); sfx.banner(); }, 0);
    const h = window.setTimeout(() => setExtToast((x) => (x?.key === extKey ? null : x)), 2600);
    return () => { window.clearTimeout(s); window.clearTimeout(h); };
  }, [extKey]); // eslint-disable-line react-hooks/exhaustive-deps
  // ⏱ 토론 +30 s: the same toast for the talk phase
  const talkExtKey = view ? `${view.game}:${view.members.filter((m) => m.talkExtended).map((m) => m.seat).join(',')}` : null;
  const talkSeen = useRef<string | null>(null);
  useEffect(() => {
    if (!view || !talkExtKey) return;
    const was = talkSeen.current;
    talkSeen.current = talkExtKey;
    if (was == null || was === talkExtKey || was.split(':')[0] !== talkExtKey.split(':')[0]) return;
    const before = new Set(was.split(':')[1].split(',').filter(Boolean).map(Number));
    const who = view.members.find((m) => m.talkExtended && !before.has(m.seat));
    if (!who) return;
    const s = window.setTimeout(() => { setExtToast({ key: talkExtKey, text: t.talkExtendToast(who.name) }); pushSystem(t.talkExtendToast(who.name), -1, 'event'); sfx.banner(); }, 0);
    const h = window.setTimeout(() => setExtToast((x) => (x?.key === talkExtKey ? null : x)), 2600);
    return () => { window.clearTimeout(s); window.clearTimeout(h); };
  }, [talkExtKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // the play-by-play in the chat: phases, rounds, my turn, 👁 marks, votes coming in
  const evKey = view ? `${view.game}:${view.phase}:${view.round}:${view.accused ?? ''}:${view.phase === 'clue' && view.turn === view.me?.seat ? 'me' : ''}` : null;
  const evSeen = useRef<string | null>(null);
  useEffect(() => {
    if (!view || !evKey) return;
    const was = evSeen.current;
    evSeen.current = evKey;
    if (was == null || was === evKey) return;
    const [, wasPhase, wasRound] = was.split(':');
    const name = (s: number | null) => view.members.find((m) => m.seat === s)?.name ?? '?';
    const line = view.phase === 'talk' && wasPhase !== 'talk' ? t.ev.talk
      : view.phase === 'vote' && wasPhase !== 'vote' ? t.ev.vote
      : view.phase === 'runoff' && wasPhase !== 'runoff' ? t.ev.runoff
      : view.phase === 'last' ? t.ev.last(name(view.accused))
      : view.phase === 'decide' && wasPhase !== 'decide' ? t.ev.decide(name(view.accused))
      : view.phase === 'guess' && wasPhase !== 'guess' ? t.ev.guess(name(view.liar))
      : view.phase === 'clue' && view.turn === view.me?.seat ? t.ev.myTurn
      : view.phase === 'clue' && (wasPhase !== 'clue' || wasRound !== String(view.round)) ? t.ev.round(view.round) : null;
    if (line) { const id = window.setTimeout(() => pushSystem(line, -1, 'event'), 0); return () => window.clearTimeout(id); }
  }, [evKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const markSeen = useRef<Record<number, number>>({});
  useEffect(() => {
    if (!view) return;
    const was = markSeen.current;
    markSeen.current = marks;
    const name = (s: number) => view.members.find((m) => m.seat === s)?.name ?? '?';
    const fresh = Object.entries(marks).filter(([k, v]) => was[Number(k)] !== v);
    if (!fresh.length) return;
    const id = window.setTimeout(() => fresh.forEach(([k, v]) => pushSystem(t.ev.mark(name(Number(k)), name(v)), -1, 'event')), 0);
    return () => window.clearTimeout(id);
  }, [marks]); // eslint-disable-line react-hooks/exhaustive-deps
  const voteN = view && (view.phase === 'vote' || view.phase === 'runoff') ? view.members.filter((m) => m.playing && m.voted).length : 0;
  const voteSeen = useRef(0);
  useEffect(() => {
    const was = voteSeen.current;
    voteSeen.current = voteN;
    if (!view || voteN <= was || voteN === 0) return;
    const all = view.members.filter((m) => m.playing && !m.gone).length;
    const id = window.setTimeout(() => pushSystem(t.ev.votes(voteN, all), -1, 'event'), 0);
    return () => window.clearTimeout(id);
  }, [voteN]); // eslint-disable-line react-hooks/exhaustive-deps

  // 다시 하기: a pop when someone readies, a fanfare when the next game starts
  const readyN = view && (view.phase === 'done' || view.phase === 'closed') ? view.members.filter((m) => m.ready && !m.gone).length : 0;
  const lastReady = useRef(0);
  useEffect(() => { if (readyN > lastReady.current) { sfx.mark(); buzz(15); } lastReady.current = readyN; }, [readyN]);
  const gameNo = view?.game ?? 0;
  const lastGame = useRef<number | null>(null);
  useEffect(() => {
    if (lastGame.current != null && gameNo > lastGame.current) { sfx.banner(); buzz([30, 40, 30]); }
    lastGame.current = gameNo;
  }, [gameNo]);
  const myTurnNow = !!view?.me && view.phase === 'clue' && view.turn === view.me.seat;
  useEffect(() => { if (myTurnNow) sfx.myTurn(); }, [myTurnNow]);

  // a finished game may have paid an icon: ask the icon popup to look (after the show)
  const phase = view?.phase;
  useEffect(() => { if (phase === 'done') checkNewIcons(9000); }, [phase]);

  // the last five seconds of my own turn (or my guess): a soft tick and a tap on the phone
  const left = view ? secondsLeft(view, skew, now) : null;
  const mine = !!view?.me && ((view.phase === 'clue' && view.turn === view.me.seat) || (view.phase === 'guess' && view.liar === view.me.seat));
  const ticked = useRef<number | null>(null);
  useEffect(() => {
    if (!mine || left == null || left > 5 || left < 1 || ticked.current === left) return;
    ticked.current = left;
    sfx.tick(left <= 2);
  }, [mine, left]);

  // typing chat while my own clue clock runs low: back to the table before it times out
  useEffect(() => {
    if (!chatFocus || !kb.open || !mine || left == null || left > 8) return;
    (document.activeElement as HTMLElement | null)?.blur();
    const id = window.setTimeout(() => (document.querySelector('[data-hwl-focus]') as HTMLInputElement | null)?.focus(), 300);
    return () => window.clearTimeout(id);
  }, [chatFocus, kb.open, mine, left]);

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
  const total = (phaseSecs(view) ?? 0) + (view.phase === 'clue' && extTurn === `${view.game}:${view.round}:${view.turn}` ? 30 : 0) + (view.phase === 'talk' ? view.talkExt ?? 0 : 0);
  const frac = view.deadline && total ? Math.max(0, Math.min(1, (view.deadline - (now + skew)) / (total * 1000))) : null;
  const myTurn = view.phase === 'clue' && view.turn === me?.seat;
  const show = revealShow(view, now, skew, skippedGame === view.game);
  const submitClue = async (word: string, mask: boolean) => {
    const res = await sayClue(code, word, mask);
    typingNow('clue', true);
    void refresh();
    return res?.error ? (t.clueErr[res.error] ?? t.error) : res ? null : t.error;
  };
  // the moments the table needs me (my clue, my vote, my last words, my choice, my guess)
  const need = !me?.playing ? null
    : myTurn ? 'clue'
    : view.phase === 'guess' && view.liar === me.seat ? 'guess'
    : (view.phase === 'vote' || view.phase === 'runoff') && me.voted == null ? 'vote'
    : view.phase === 'last' && view.accused === me.seat ? 'last'
    : view.phase === 'decide' && view.accused !== me.seat && !me.decide ? 'decide' : null;
  const chatMode = kb.chat;
  const backToTable = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    window.setTimeout(kb.recheck, 30);   // focus events do not always fire (e.g. the page has no window focus)
    window.setTimeout(() => (document.querySelector('[data-hwl-focus]') as HTMLInputElement | null)?.focus(), 350);
  };
  return (
    <Shell t={t} code={code} onLeave={leave} timer={show && !show.over ? null : left} view={view} frame={kb.open ? kb.frame : undefined}>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className={`min-h-0 flex-1 flex-col ${chatMode ? 'hidden' : 'flex'}`}>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 [scrollbar-color:rgba(255,255,255,.18)_transparent] lg:px-6">
          <MyWord view={view} t={t} />
          {view.phase === 'lobby' && <Actions view={view} t={t} en={en} code={code} refresh={refresh} show={show} />}
          <Table view={view} t={t} marks={marks} typing={typing} now={now} frac={frac} left={left} show={show} toast={extToast}
            onTap={(seat) => onSeatTap(view, seat, mark, marks, refresh)}>
            <Center key={`${view.game}-${view.phase}-${view.turn ?? ''}-${view.accused ?? ''}`} view={view} t={t} left={left} frac={frac} marks={marks} mark={mark}
              refresh={refresh} submitClue={submitClue} typingNow={typingNow} typing={typing} now={now} show={show} onSkip={() => setSkippedGame(view.game)} />
          </Table>
          {view.phase !== 'lobby' && (!show || show.over) && <Actions view={view} t={t} en={en} code={code} refresh={refresh} show={show} />}
          <ClueBoard view={view} t={t} />
          {view.phase === 'lobby' || !me?.playing ? <Rules t={t} /> : null}
        </div>
        <PinnedAgain view={view} t={t} code={code} refresh={refresh} show={show} now={now} skew={skew} />
        </div>
        <ChatPanel chat={chat} t={t} say={say} view={view} myTurn={myTurn} submitClue={submitClue} typingNow={typingNow} marks={marks} now={now}
          chatMode={chatMode}
          hud={chatMode ? <>
            {need && <AlertBar text={t.alert[need]} onTap={backToTable} left={need === 'clue' || need === 'guess' ? left : null} />}
            <StatusStrip view={view} t={t} left={left} typing={typing} now={now} marks={marks} onTap={(seat) => onSeatTap(view, seat, mark, marks, refresh)} />
            <PinnedAgain view={view} t={t} code={code} refresh={refresh} show={show} now={now} skew={skew} />
          </> : null} />
      </div>
      <CardReveal view={view} t={t} />
      <LiarTutorial auto pause={mine || view.phase === 'cards'} />
    </Shell>
  );
}

function onSeatTap(view: LiarView, seat: number, mark: (s: number | null) => void, marks: Record<number, number>, refresh: () => Promise<void>) {
  const me = view.me;
  if (!me || seat === me.seat) return;
  if (view.phase === 'vote' || view.phase === 'runoff') {
    if (!me.playing || view.excluded.includes(seat)) return;
    if (view.phase === 'runoff' && !view.runoff?.includes(seat)) return;
    void voteLiar(view.code, seat).then(() => refresh());
    return;
  }
  if (RUNNING.includes(view.phase)) mark(marks[me.seat] === seat ? null : seat);
}

function Shell({ t, code, onLeave, timer, view, frame, children }: { t: T; code: string; onLeave: () => void; timer?: number | null; view?: LiarView; frame?: { top: number; height: number }; children: React.ReactNode }) {
  const urgent = timer != null && timer <= 5 && view && RUNNING.includes(view.phase);
  const tense = moodOf(view?.phase) === 'tense';
  return (
    // with the keyboard open the room is pinned to exactly the visible part of the screen (no page scroll)
    <div className={`isolate flex flex-col overflow-hidden bg-[#08060e] text-[#ece8f7] ${frame ? 'fixed inset-x-0 z-[60]' : 'relative h-[100dvh]'}`} style={frame ? { top: frame.top, height: frame.height } : undefined}>
      <RoomBackdrop tense={tense} />
      <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-white/10 bg-black/40 px-2.5 backdrop-blur">
        <button type="button" onClick={onLeave} aria-label={t.leave} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"><ArrowLeft size={18} /></button>
        <strong className="min-w-0 truncate text-[15px] font-black tracking-tight">{t.title}</strong>
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-white/60">{code.toUpperCase()}</span>
        {view && RUNNING.includes(view.phase) && view.round > 0 && <span className="shrink-0 whitespace-nowrap text-[11px] font-bold text-white/50">{t.round(view.round, view.roundsMax)}</span>}
        <span className="flex-1" />
        {(!view || view.phase === 'lobby' || view.phase === 'done') && <span className="hidden shrink-0 whitespace-nowrap min-[400px]:block"><GameUpdates game="hidden_word_liar" /></span>}
        {timer != null && view && view.phase !== 'lobby' && (
          <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[13px] font-black ${urgent ? 'animate-pulse bg-[#ff5a3d] text-white' : 'bg-white/10 text-white/80'}`}><Timer size={13} />{timer}</span>
        )}
        <HeaderMenu t={t} />
        <button type="button" onClick={onLeave} aria-label={t.leave} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10"><LogOut size={16} /></button>
      </header>
      {children}
    </div>
  );
}

/**
 * Is the on-screen keyboard up, and what part of the screen is still visible? From visualViewport: the tallest height
 * seen is the screen without a keyboard; well under that while something is focused = a keyboard. Works whether the
 * browser resizes the page (Android Chrome / the Play app, interactive-widget=resizes-content) or overlays it (Safari).
 */
function useKeyboard() {
  const [st, setSt] = useState<{ open: boolean; chat: boolean; frame: { top: number; height: number } }>({ open: false, chat: false, frame: { top: 0, height: 0 } });
  const recheck = useRef<() => void>(() => {});
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let tallest = Math.max(vv.height, window.innerHeight);
    const read = () => {
      tallest = Math.max(tallest, vv.height);
      const focused = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
      const open = focused && vv.height < tallest * 0.78;
      const chat = open && !!(document.activeElement as HTMLElement | null)?.closest('[data-hwl-chat]');
      setSt((p) => (p.open === open && p.chat === chat && p.frame.height === Math.round(vv.height) && p.frame.top === Math.round(vv.offsetTop) ? p
        : { open, chat, frame: { top: Math.round(vv.offsetTop), height: Math.round(vv.height) } }));
    };
    const later = () => window.setTimeout(read, 120);
    recheck.current = read;
    read();
    vv.addEventListener('resize', read);
    vv.addEventListener('scroll', read);
    document.addEventListener('focusin', read);
    document.addEventListener('focusout', later);
    return () => { vv.removeEventListener('resize', read); vv.removeEventListener('scroll', read); document.removeEventListener('focusin', read); document.removeEventListener('focusout', later); };
  }, []);
  return { ...st, recheck: () => recheck.current() };
}

/** The table needs me (my turn, my vote…) while I type chat: a big bar that takes me back without losing the text. */
function AlertBar({ text, onTap, left }: { text: string; onTap: () => void; left: number | null }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onTap}
      className="hwl-next mx-2 mt-1.5 flex w-[calc(100%-1rem)] items-center justify-center gap-2 rounded-xl bg-[#ffd36e] py-2.5 text-[15px] font-black text-[#241457] shadow-[0_6px_20px_rgba(255,211,110,.4)]">
      {text}{left != null && <span className="rounded-full bg-[#241457] px-2 py-0.5 font-mono text-[12px] text-[#ffd36e]">{left}</span>}
    </button>
  );
}

/** Chat mode (keyboard up): the table in two lines above the chat — the phase and clock, NEXT, my word, every seat with its last clue. */
function StatusStrip({ view, t, left, typing, now, marks, onTap }: { view: LiarView; t: T; left: number | null; typing: Typing; now: number; marks: Record<number, number>; onTap: (seat: number) => void }) {
  const nameOf = (s: number | null | undefined) => view.members.find((m) => m.seat === s)?.name ?? '?';
  const me = view.me;
  const phase = view.phase === 'clue' ? (view.turn === me?.seat ? t.hud.mine : t.hud.clue(nameOf(view.turn)))
    : view.phase === 'last' ? t.hud.last(nameOf(view.accused))
    : (t.hud as Record<string, unknown>)[view.phase] as string ?? '';
  const ti = view.turn != null ? view.order.indexOf(view.turn) : -1;
  const next = view.phase === 'clue' && ti >= 0 ? view.order.slice(ti + 1).find((s) => view.members.some((m) => m.seat === s && m.playing && !m.gone)) : undefined;
  const seats = view.order.length ? view.order.map((s) => view.members.find((m) => m.seat === s)).filter(Boolean) as LiarMember[] : view.members;
  const sus: Record<number, number> = {};
  Object.values(marks).forEach((s) => { sus[s] = (sus[s] ?? 0) + 1; });
  const last = (seat: number) => [...view.clues].reverse().find((c) => c.seat === seat);
  return (
    <div className="border-b border-white/10 bg-[#120d22]/95 px-2 pb-1.5 pt-1.5">
      <div className="flex items-center gap-1.5 text-[12.5px] font-black">
        <span className="min-w-0 truncate">{phase}</span>
        {left != null && RUNNING.includes(view.phase) && <span className={`shrink-0 rounded-full px-1.5 font-mono text-[12px] ${left <= 5 ? 'bg-[#ff5a3d] text-white' : 'bg-white/10 text-white/85'}`}>{left}{t.sec}</span>}
        <span className="flex-1" />
        {next != null && <span className="shrink-0 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80 ring-1 ring-white/15">NEXT {next === me?.seat ? t.me : nameOf(next)}</span>}
        {me?.playing && RUNNING.includes(view.phase) && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${me.liar ? 'bg-[#ff5a3d]/25 text-[#ff8a6d]' : 'bg-white text-[#241457]'}`}>{me.liar ? '🎭' : me.word}</span>}
      </div>
      <div className="mt-1 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {seats.map((m) => {
          const c = last(m.seat);
          const typer = typing[m.seat] && typing[m.seat].until > now && m.seat !== me?.seat;
          const turn = view.phase === 'clue' && view.turn === m.seat;
          return (
            <button key={m.seat} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onTap(m.seat)}
              className={`flex shrink-0 items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2 text-[11px] font-bold ${turn ? 'bg-[#ffd36e]/25 ring-1 ring-[#ffd36e]' : view.accused === m.seat && ['last', 'decide', 'guess'].includes(view.phase) ? 'bg-[#ff8a6d]/25 ring-1 ring-[#ff8a6d]' : 'bg-white/[.08]'} ${m.gone ? 'opacity-40' : ''}`}>
              <RimStone name={m.name} size={22} rim={1} />
              <span className="max-w-[64px] truncate text-white/85">{m.seat === me?.seat ? t.me : m.name}</span>
              {typer ? <Dots /> : c?.word ? <span className="font-black" style={{ color: c.score == null ? (c.hot ? '#ff5a3d' : '#9a94b0') : scoreColor(c.score) }}>{c.word} {shownScore(c, t)}</span> : c ? <span className="text-white/45">⏰</span> : null}
              {(sus[m.seat] ?? 0) > 0 && <span className="text-[10px] text-[#ffd36e]">👁{sus[m.seat]}</span>}
              {(view.phase === 'vote' || view.phase === 'runoff') && m.voted && <span className="text-[#7fe3a0]">✓</span>}
              {(view.phase === 'done' || view.phase === 'closed') && m.ready && <span className="text-[#7fe3a0]">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The room behind the table: a dark velvet hall, curtain folds, one lamp over the table and a little dust in its light. */
const DUST = [[8, 62, 0], [17, 34, 3.1], [26, 71, 1.4], [33, 48, 5.2], [41, 24, 2.3], [49, 66, 4.4], [57, 38, 0.7], [64, 58, 3.8], [72, 28, 2.9], [79, 70, 1.1], [86, 44, 4.9], [92, 30, 2.0]];
function RoomBackdrop({ tense }: { tense: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 75% at 50% 8%, #2b1c52 0%, #140e27 52%, #07050c 100%)' }} />
      <div className="absolute inset-x-0 top-0 h-[62%] opacity-70 [mask-image:linear-gradient(#000,transparent)]"
        style={{ background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.28) 0 3px, rgba(255,255,255,.028) 3px 9px, rgba(0,0,0,0) 9px 34px)' }} />
      <div className="absolute left-1/2 top-0 h-[78%] w-[150%] -translate-x-1/2 transition-[background] duration-1000"
        style={{ background: `radial-gradient(ellipse 30% 100% at 50% 0%, ${tense ? 'rgba(255,150,110,.20)' : 'rgba(196,170,255,.17)'}, transparent 72%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.55))' }} />
      {DUST.map(([x, y, d], i) => (
        <span key={i} className="hwl-dust absolute h-[3px] w-[3px] rounded-full bg-white/50" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

/** The header's two small menus: help (tutorial, tips again) and sound (effects, music). */
function HeaderMenu({ t }: { t: T }) {
  const [open, setOpen] = useState<'help' | 'sound' | null>(null);
  const on = useSyncExternalStore(onSoundChange, sfxOn, () => true);
  const music = useSyncExternalStore(onSoundChange, bgmOn, () => false);
  const item = 'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-bold hover:bg-white/10';
  return (
    <div className="relative flex items-center">
      <button type="button" aria-label={t.help} onClick={() => setOpen(open === 'help' ? null : 'help')} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"><HelpCircle size={17} /></button>
      <button type="button" aria-label={t.sound} onClick={() => setOpen(open === 'sound' ? null : 'sound')} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10">{on ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
      {open && <>
        <button type="button" aria-label={t.close} className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(null)} />
        <div className="hwl-pop absolute right-0 top-10 z-50 w-[190px] rounded-xl border border-white/10 bg-[#1b1530] p-1.5 shadow-2xl">
          {open === 'help' ? <>
            <button type="button" className={item} onClick={() => { setOpen(null); openLiarTutorial(); }}><BookOpen size={15} />{t.tutorial}</button>
            <button type="button" className={item} onClick={() => { setOpen(null); resetLiarTips(); }}><Lightbulb size={15} />{t.tipsAgain}</button>
          </> : <>
            <button type="button" className={item} onClick={() => { unlock(); setSfx(!on); }}>{on ? <Volume2 size={15} /> : <VolumeX size={15} />}{t.sfx}<span className={`ml-auto text-[11px] font-black ${on ? 'text-[#7fe3a0]' : 'text-white/40'}`}>{on ? 'ON' : 'OFF'}</span></button>
            <button type="button" className={item} onClick={() => { unlock(); setBgm(!music); }}><Music size={15} />{t.bgm}<span className={`ml-auto text-[11px] font-black ${music ? 'text-[#7fe3a0]' : 'text-white/40'}`}>{music ? 'ON' : 'OFF'}</span></button>
          </>}
        </div>
      </>}
    </div>
  );
}

function MyWord({ view, t }: { view: LiarView; t: T }) {
  const [show, setShow] = useState(false);
  const word = view.me?.word;
  if (view.me?.liar && RUNNING.includes(view.phase)) return (
    <div className="mx-auto mt-3 flex max-w-[520px] items-center justify-center gap-2 rounded-2xl border border-[#ff5a3d]/50 bg-[linear-gradient(90deg,#3a1220,#1b1530)] px-4 py-2.5 shadow-[0_0_24px_rgba(255,90,61,.18)]">
      <span className="text-[16px] font-black tracking-tight text-[#ff8a6d]">{t.myWordLiar}</span>
    </div>
  );
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

/** The card each player is dealt, shown big at the start of a game: the word, or "you are the liar" (no word). */
function CardReveal({ view, t }: { view: LiarView; t: T }) {
  const [closed, setClosed] = useState<number | null>(null);
  const liar = !!view.me?.liar;
  const open = view.phase === 'cards' && !!view.me?.playing && closed !== view.game;
  useEffect(() => { if (open && liar) buzz([60, 80, 140]); }, [open, liar]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm" onClick={() => setClosed(view.game)}>
      <div onClick={(e) => e.stopPropagation()}
        className={`hwl-deal relative w-full max-w-[320px] overflow-hidden rounded-[26px] p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,.6)] ${liar ? 'border-2 border-[#ff5a3d]/70 bg-[radial-gradient(ellipse_at_50%_20%,#5a1a2a,#1a0d18_70%)]' : 'border border-[#a98bff]/45 bg-[radial-gradient(ellipse_at_50%_20%,#3b2a75,#15111f_72%)]'}`}>
        {liar ? <>
          <div className="mx-auto w-fit" style={{ filter: 'drop-shadow(0 0 22px rgba(255,90,61,.55))' }}><span className="hwl-turn block"><LiarStone id="card-liar" name="" size={110} /></span></div>
          <p className="hwl-stamp mt-3 text-[26px] font-black tracking-tight text-[#ff8a6d]">🎭 {t.cardLiar}</p>
          <p className="mt-2 break-keep text-[13px] font-bold leading-[1.6] text-white/80">{t.cardLiarNote}</p>
        </> : <>
          <p className="text-[12px] font-black tracking-[0.12em] text-[#c9b6ff]">{t.cardCitizen}</p>
          <p className="hwl-pop mx-auto mt-3 w-fit rounded-2xl bg-white px-6 py-3 text-[34px] font-black tracking-tight text-[#241457] shadow-[0_10px_30px_rgba(169,139,255,.35)]">{view.me?.word}</p>
          <p className="mt-3 break-keep text-[12.5px] font-bold leading-[1.6] text-white/70">{t.cardCitizenNote}</p>
        </>}
        <button type="button" onClick={() => setClosed(view.game)} className={`mt-5 w-full rounded-xl py-2.5 text-[14px] font-black ${liar ? 'bg-[#ff5a3d] text-white' : 'bg-[#a98bff] text-[#1a1030]'}`}>{t.cardOk}</button>
      </div>
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
function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now() + delay;
    let id = 0;
    const step = (t: number) => { const k = Math.max(0, Math.min(1, (t - t0) / 600)); setV(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) id = requestAnimationFrame(step); };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [to, delay]);
  return <>{v}</>;
}

const Dots = () => <span className="hwl-dots inline-flex items-center"><i /><i /><i /></span>;

/** The table box's size in px, for the transforms that move seats and fly things across it. */
function useBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 360, h: 310 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

/** Short staged moments over the table: a banner sweeping across when the phase changes (and on my turn). */
function useBanner(view: LiarView, t: T) {
  const myTurn = view.phase === 'clue' && view.turn === view.me?.seat;
  const key = `${view.game}:${view.phase}:${view.round}:${myTurn ? 'me' : ''}:${view.revotes}`;
  const prev = useRef<string | null>(null);
  const [banner, setBanner] = useState<{ key: string; text: string } | null>(null);
  useEffect(() => {
    const was = prev.current;
    prev.current = key;
    if (was == null || was === key) return;
    const wasPhase = was.split(':')[1];
    const text = myTurn ? t.banner.mine : wasPhase !== view.phase ? t.banner[view.phase] : null;
    if (!text) return;
    const show = window.setTimeout(() => { setBanner({ key, text }); sfx.banner(); }, 0);
    const hide = window.setTimeout(() => setBanner((b) => (b?.key === key ? null : b)), 1700);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [key, myTurn, view.phase, t]);
  return banner;
}

// warmer the more 👁 a seat has
const HEAT = ['0 0 0 3px rgba(255,180,80,.55), 0 0 14px rgba(255,160,60,.45)', '0 0 0 3px rgba(255,130,60,.75), 0 0 20px rgba(255,110,50,.6)', '0 0 0 4px rgba(255,70,50,.9), 0 0 26px rgba(255,60,40,.75)'];
// felt grain: a tiny SVG noise tile
const FELT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** The one tip that fits this moment (shown the first few times; tap to dismiss). */
function TableTip({ view, t, pos, top }: { view: LiarView; t: T; pos: Record<number, { x: number; y: number }>; top: number[] }) {
  const me = view.me;
  const myTurn = view.phase === 'clue' && view.turn === me?.seat;
  const numbered = [...view.clues].reverse().find((c) => c.word && (c.score != null || c.hot));
  let id: string | null = null; let text = ''; let at: { x: number; y: number } = { x: 50, y: 13 };
  if (!me?.playing) id = null;
  else if (myTurn) { id = me.liar ? 'myturnLiar' : 'myturn'; text = me.liar ? t.tips.myTurnLiar : t.tips.myTurn; }
  else if (view.phase === 'guess' && view.liar === me.seat) { id = 'guess'; text = t.tips.guess; }
  else if (top.includes(me.seat)) { id = 'suspected'; text = t.tips.suspected; }
  else if (view.phase === 'clue' && numbered && pos[numbered.seat]) { id = me.liar ? 'numbersLiar' : 'numbers'; text = me.liar ? t.tips.numbersLiar : t.tips.numbers; at = { x: Math.max(26, Math.min(74, pos[numbered.seat].x)), y: pos[numbered.seat].y < 30 ? pos[numbered.seat].y + 16 : pos[numbered.seat].y - 20 }; }
  else if (view.phase === 'talk') { id = 'talk'; text = t.tips.talk; }
  else if (view.phase === 'vote' || view.phase === 'runoff') { id = me.voted == null ? 'vote' : null; text = t.tips.vote; }
  else if (view.phase === 'last') { id = view.accused === me.seat ? 'lastMine' : 'last'; text = view.accused === me.seat ? t.tips.lastMine : t.tips.last; }
  else if (view.phase === 'decide' && view.accused !== me.seat) { id = 'decide'; text = t.tips.decide; }
  const tip = useTip(id);
  if (!id || !tip.show) return null;
  const below = id === 'numbers' && at.y > (pos[numbered!.seat]?.y ?? 0);   // under a top seat: point up at it
  return <TipBubble key={id} text={text} onClose={tip.dismiss} arrow={below ? 'up' : 'down'} style={{ left: `${at.x}%`, top: `${at.y}%`, transform: below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)' }} />;
}

/** Seats around an oval table, icons first; the table's centre (children) is where the current phase is played. */
function Table({ view, t, marks, typing, now, frac, left, show, toast, onTap, children }: {
  view: LiarView; t: T; marks: Record<number, number>; typing: Typing; now: number; frac: number | null; left: number | null; show: Show | null;
  toast: { key: string; text: string } | null;
  onTap: (seat: number) => void; children: React.ReactNode;
}) {
  const [ref, box] = useBox();
  const banner = useBanner(view, t);
  const seats = view.phase === 'lobby' ? view.members : view.members.filter((m) => m.playing || RUNNING.includes(view.phase) === false);
  const order = view.order.length && view.phase !== 'lobby' ? view.order.map((s) => seats.find((m) => m.seat === s)).filter(Boolean) as LiarMember[] : seats;
  const empty = view.phase === 'lobby' && view.kind === 'friend' ? Math.max(0, Math.max(view.cfg.min, Math.min(6, order.length + 1)) - order.length) : 0;
  const n = order.length + empty;
  const big = n <= 6;
  const size = big ? 52 : 42;
  const pos: Record<number, { a: number; x: number; y: number }> = {};
  order.forEach((m, i) => { pos[m.seat] = seatPos(i, n, big); });
  const lastClue = (seat: number) => [...view.clues].reverse().find((c) => c.seat === seat);
  const suspects: Record<number, number> = {};
  Object.values(marks).forEach((s) => { suspects[s] = (suspects[s] ?? 0) + 1; });
  const stage = view.votes?.some((x) => x.stage === 'runoff') ? 'runoff' : 'vote';
  const lastVotes = (view.votes ?? []).filter((v) => v.stage === stage);
  const votes: Record<number, number> = {};
  lastVotes.forEach((v) => { votes[v.target] = (votes[v.target] ?? 0) + 1; });
  const turn = view.turn;
  // the next speaker this round (the server skips anyone who left)
  const ti = turn != null ? view.order.indexOf(turn) : -1;
  const next = ti >= 0 ? view.order.slice(ti + 1).find((s) => view.members.some((m) => m.seat === s && m.playing && !m.gone)) : undefined;
  const voting = view.phase === 'vote' || view.phase === 'runoff';
  const over = view.phase === 'done' && view.result;
  // the spotlight: the speaker, or the accused through last words, the decision and the guess
  const focus = view.phase === 'clue' ? turn : ['last', 'decide', 'guess'].includes(view.phase) ? view.accused : null;
  const pull = view.phase === 'clue' ? 0.16 : 0.09;

  // the beam turns around the table to the spotlit seat, always the short way
  const target = focus != null && pos[focus] ? (pos[focus].a * 180) / Math.PI + 90 : null;
  const [angle, setAngle] = useState<number | null>(null);
  useEffect(() => {
    if (target == null) return;
    const id = window.setTimeout(() => setAngle((a) => (a == null ? target : a + ((((target - a) % 360) + 540) % 360) - 180)), 0);
    return () => window.clearTimeout(id);
  }, [target]);

  // a clue flies from the centre to its seat as it lands; votes fly to the accused as the last words begin
  const clueCount = useRef<string | null>(null);
  const [fly, setFly] = useState<{ n: number; seat: number; label: string; hot: boolean } | null>(null);
  const lastC = view.clues[view.clues.length - 1];
  const ck = `${view.game}:${view.clues.length}`;
  useEffect(() => {
    const was = clueCount.current;
    clueCount.current = ck;
    if (was == null || was === ck || was.split(':')[0] !== ck.split(':')[0] || !lastC?.word) return;
    const s = window.setTimeout(() => setFly({ n: lastC.n, seat: lastC.seat, label: lastC.word!, hot: lastC.hot }), 0);
    const h = window.setTimeout(() => setFly((f) => (f?.n === lastC.n ? null : f)), 900);
    return () => { window.clearTimeout(s); window.clearTimeout(h); };
  }, [ck]); // eslint-disable-line react-hooks/exhaustive-deps
  const phaseKey = `${view.game}:${view.phase}:${view.accused}`;
  const prevPhase = useRef<string | null>(null);
  const [voteFly, setVoteFly] = useState<string | null>(null);
  useEffect(() => {
    const was = prevPhase.current;
    prevPhase.current = phaseKey;
    if (was == null || was === phaseKey || view.phase !== 'last') return;
    const s = window.setTimeout(() => { setVoteFly(phaseKey); sfx.tally((view.votes ?? []).length); }, 0);
    const h = window.setTimeout(() => setVoteFly((v) => (v === phaseKey ? null : v)), 1900);
    return () => { window.clearTimeout(s); window.clearTimeout(h); };
  }, [phaseKey, view.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // 👁 marks: an eye flies from the one who marked to the one they suspect
  const prevMarks = useRef<Record<number, number>>({});
  const [eyes, setEyes] = useState<{ key: string; from: number; to: number }[]>([]);
  useEffect(() => {
    const was = prevMarks.current;
    prevMarks.current = marks;
    const fresh = Object.entries(marks).filter(([k, v]) => was[Number(k)] !== v).map(([k, v]) => ({ key: `${k}-${v}-${Date.now()}`, from: Number(k), to: v }));
    if (!fresh.length) return;
    const s = window.setTimeout(() => { setEyes((e) => [...e, ...fresh]); sfx.mark(); }, 0);
    const h = window.setTimeout(() => setEyes((e) => e.filter((x) => !fresh.some((f) => f.key === x.key))), 1000);
    return () => { window.clearTimeout(s); window.clearTimeout(h); };
  }, [marks]);
  const top = RUNNING.includes(view.phase) ? topSuspects(marks) : [];

  // the show's sounds: a card per flip (the liar's heavier), then the stamp
  const flips = show ? show.order.filter((seat) => show.t >= show.flipAt(seat)).length : 0;
  const verdict = !!show && show.t >= show.verdictAt;
  const heard = useRef({ flips: 0, verdict: false, game: -1 });
  useEffect(() => {
    const h = heard.current;
    if (h.game !== view.game) { heard.current = { flips, verdict, game: view.game }; return; }   // nothing for a show already under way
    if (flips > h.flips && show && Number.isFinite(show.t)) sfx.flip(flips === show.order.length);
    if (verdict && !h.verdict && show && Number.isFinite(show.t)) (view.result?.outcome === 'citizens' ? sfx.caught : sfx.failed)();
    heard.current = { flips, verdict, game: view.game };
  }, [flips, verdict, view.game]); // eslint-disable-line react-hooks/exhaustive-deps

  // NEXT: who speaks after this turn, so they can get ready (a tap on the phone when it is me)
  const nextMember = next != null ? view.members.find((m) => m.seat === next) : null;
  const meNext = next != null && next === view.me?.seat;
  useEffect(() => { if (meNext) buzz(25); }, [meNext]);

  const px = (dx: number, dy: number) => `${(dx / 100) * box.w}px, ${(dy / 100) * box.h}px`;
  return (
    <div ref={ref} className="relative mx-auto mb-10 mt-10 w-full max-w-[520px]" style={{ aspectRatio: big ? '1 / 0.86' : '1 / 1.02' }}>
      {/* the table: a shadow on the floor, a polished rim, a velvet top with a lamp's light on it */}
      <div aria-hidden className="pointer-events-none absolute inset-[26%_9%_4%] rounded-[50%] bg-black/70 blur-2xl" />
      <div aria-hidden className={`absolute inset-[15.5%_13.5%] rounded-[50%] p-[5px] transition-shadow duration-700 ${view.phase === 'clue' && turn === view.me?.seat ? 'shadow-[0_0_0_2px_rgba(255,211,110,.55),0_18px_40px_rgba(0,0,0,.6)]' : 'shadow-[0_18px_40px_rgba(0,0,0,.6)]'}`}
        style={{ background: 'conic-gradient(from 210deg, #4b3898, #e8dcff 9%, #8f74f2 20%, #34237c 36%, #b7a2ff 52%, #fbf6ff 58%, #7a5fe0 70%, #2a1b66 86%, #4b3898)' }}>
        <div className="relative h-full w-full overflow-hidden rounded-[50%] transition-[background] duration-1000"
          style={{ background: `radial-gradient(ellipse 75% 65% at 50% 38%, ${['vote', 'runoff', 'last', 'decide', 'guess'].includes(view.phase) ? '#5a2a52' : '#3e2b80'} 0%, ${['vote', 'runoff', 'last', 'decide', 'guess'].includes(view.phase) ? '#2a1330' : '#1f1648'} 62%, #0f0a22 100%)`, boxShadow: 'inset 0 0 0 2px rgba(15,8,40,.8), inset 0 12px 34px rgba(0,0,0,.6), inset 0 -10px 26px rgba(0,0,0,.45)' }}>
          {/* felt grain, a thin gold inlay, the masked seal in the middle */}
          <span className="absolute inset-0 opacity-[.22] mix-blend-overlay" style={{ backgroundImage: FELT, backgroundSize: '140px 140px' }} />
          <span className="absolute inset-[7%] rounded-[50%] border border-[#ffd36e]/15" />
          <span className="absolute inset-[9.5%] rounded-[50%] border border-[#ffd36e]/[.07]" />
          <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${['lobby', 'cards', 'closed'].includes(view.phase) ? 'opacity-30' : 'opacity-[.07]'}`}><LiarStone id="table-seal" name="" size={Math.round(box.w * 0.24)} /></span>
          <span className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 18%, rgba(255,255,255,.13), transparent 70%)' }} />
          {/* the beam: a soft light from the centre toward the spotlit seat */}
          <span className="pointer-events-none absolute inset-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.3,.8,.3,1)] motion-reduce:transition-none"
            style={{ transform: `rotate(${angle ?? target ?? 0}deg)`, opacity: focus != null ? 1 : 0 }}>
            <span className="absolute left-1/2 top-[-12%] h-[70%] w-[70%] -translate-x-1/2"
              style={{ background: `radial-gradient(ellipse 50% 60% at 50% 30%, ${view.phase === 'clue' ? 'rgba(255,211,110,.24)' : 'rgba(255,120,90,.26)'}, transparent 70%)` }} />
          </span>
        </div>
      </div>
      {/* a little brass place for every seat on the rim */}
      {order.map((m) => {
        const { a } = pos[m.seat];
        const lit = focus === m.seat;
        return <span key={`place-${m.seat}`} aria-hidden className={`absolute h-[6px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-500 ${lit ? 'bg-[#ffd36e] shadow-[0_0_10px_rgba(255,211,110,.8)]' : 'bg-[#e8dcff]/30'}`}
          style={{ left: `${50 + 36.5 * Math.cos(a)}%`, top: `${50 + 34.5 * Math.sin(a)}%`, rotate: `${(a * 180) / Math.PI + 90}deg` }} />;
      })}
      {/* NEXT: the next speaker, so they can get ready */}
      {view.phase === 'clue' && nextMember && !toast && (
        <span className={`absolute -top-9 right-0 z-30 flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[11px] font-black shadow-lg ${meNext ? 'hwl-next bg-[#ffd36e] text-[#241457]' : 'bg-black/55 text-white/85 ring-1 ring-white/15'}`}>
          <RimStone name={nextMember.name} size={20} rim={1} />
          <span className="text-[9px] tracking-[0.14em] opacity-70">NEXT</span>
          <span className="max-w-[92px] truncate">{meNext ? t.nextMe : nextMember.name}</span>
        </span>
      )}
      {Array.from({ length: empty }, (_, k) => {
        const { x, y } = seatPos(order.length + k, n, big);
        return (
          <span key={`empty-${k}`} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="flex items-center justify-center rounded-full border-2 border-dashed border-white/25 text-[20px] font-black text-white/35" style={{ width: size, height: size }}>+</span>
            <span className="mt-1 text-[10px] font-bold text-white/35">{t.emptySeat}</span>
          </span>
        );
      })}
      {order.map((m) => {
        const { x, y } = pos[m.seat];
        const clue = view.phase === 'lobby' ? null : lastClue(m.seat);
        const isTurn = view.phase === 'clue' && turn === m.seat;
        const lit = focus === m.seat;
        const mine = view.me?.seat === m.seat;
        const flipped = !show || show.t >= show.flipAt(m.seat);
        const liarSeat = !!over && view.result!.liar === m.seat;
        const liar = liarSeat && flipped;
        const accused = view.accused === m.seat && (['last', 'decide', 'guess'].includes(view.phase) || (over && flipped));
        const canVote = voting && view.me?.playing && !mine && !view.excluded.includes(m.seat) && (view.phase !== 'runoff' || view.runoff?.includes(m.seat));
        const myVote = view.me?.voted === m.seat;
        const typer = !mine && typing[m.seat] && typing[m.seat].until > now && RUNNING.includes(view.phase) ? typing[m.seat] : null;
        const hotOnly = clue?.word && clue.hot && clue.score == null;
        const landing = fly?.n === clue?.n;
        const dim = focus != null && !lit;
        // my own turn: the centre is my input, so my seat only glows where it is
        const lift = lit ? (isTurn && mine ? 'scale(1.06)' : `translate(${px((50 - x) * pull, (50 - y) * pull)}) scale(${view.phase === 'clue' ? 1.16 : 1.22})`) : '';
        return (
          <button key={m.seat} type="button" onClick={() => onTap(m.seat)}
            className={`absolute flex flex-col items-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${canVote ? 'cursor-pointer' : ''} ${lit ? 'z-20' : 'z-[5]'}`}
            style={{ left: `${x}%`, top: `${y}%`, width: big ? 92 : 86, transform: `translate(-50%, -50%) ${lift}`, opacity: m.gone ? 0.35 : dim ? 0.55 : 1 }}>
            {/* the reveal card, typing "…", or the last clue */}
            {over && show && view.result!.outcome !== 'void' ? (
              <RevealCard key={flipped ? 'f' : 'b'} flipped={flipped} word={liarSeat ? t.liarCard : view.result!.answer} liar={liarSeat} big={big} />
            ) : typer ? (
              <span className={`mb-1 flex h-[20px] items-center rounded-full px-2.5 shadow ${typer.kind === 'clue' ? 'bg-[#ffd36e] text-[#241457]' : 'bg-white/20 text-white'}`} title={typer.kind === 'clue' ? t.typingClue : t.typingChat}><Dots /></span>
            ) : clue && (
              <span key={clue.n} className={`hwl-pop mb-1 flex items-center rounded-full py-0.5 font-black shadow ${big ? 'max-w-full gap-1 px-2 text-[11px]' : 'max-w-[86px] gap-0.5 px-1.5 text-[10px] tracking-tight'} ${clue.word ? 'bg-white text-[#241457]' : 'bg-white/15 text-white/70'}`}
                style={landing ? { animationDelay: '.55s' } : undefined}>
                <span className="truncate">{clue.word ?? silentOf(view, clue, t)}</span>
                {clue.word && <span className={`shrink-0 rounded-full px-1 text-[10px] text-white ${hotOnly ? 'hwl-hot' : ''}`} style={{ background: hotOnly ? '#ff5a3d' : clue.score == null ? '#6b6680' : scoreColor(clue.score), animationDelay: landing ? '.6s' : undefined }}>
                  {clue.score != null ? <CountUp to={Math.round(clue.score)} delay={landing ? 550 : 0} /> : shownScore(clue, t)}
                </span>}
              </span>
            )}
            <span key={liar ? 'liar' : 'seat'} style={!over && (suspects[m.seat] ?? 0) > 0 ? { boxShadow: HEAT[Math.min(3, suspects[m.seat]) - 1], transition: 'box-shadow .5s' } : undefined}
              className={`relative rounded-full ${isTurn ? 'hwl-glow' : ''} ${liar ? 'hwl-turn ring-[3px] ring-[#ff5a3d] ring-offset-2 ring-offset-[#15111f]' : ''} ${lit && !isTurn ? 'ring-[3px] ring-[#ff8a6d] ring-offset-2 ring-offset-[#15111f]' : ''} ${myVote ? 'ring-[3px] ring-[#ff5a3d] ring-offset-2 ring-offset-[#15111f]' : ''} ${canVote && !myVote ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-[#15111f]' : ''}`}>
              <RimStone name={m.name} size={size} />
              {isTurn && <span className="pointer-events-none absolute -inset-[6px]"><Ring frac={frac} left={left} size={size + 12}><span /></Ring></span>}
              {isTurn && left != null && <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-1.5 font-mono text-[10px] font-black ${left <= 5 ? 'bg-[#ff5a3d] text-white' : 'bg-[#ffd36e] text-[#241457]'}`}>{left}</span>}
              {liar && <span className="hwl-maskoff pointer-events-none absolute inset-0 flex items-center justify-center text-[30px]">🎭</span>}
              {liar && <span className="hwl-stamp absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5a3d] text-[15px] shadow-lg ring-2 ring-white">🎭</span>}
              {accused && !liar && <span className="absolute -right-2 -top-2 rounded-full bg-[#ffd36e] px-1.5 text-[10px] font-black text-[#241457]">?</span>}
              {view.excluded.includes(m.seat) && !over && <span className="absolute -right-2 -top-2 rounded-full bg-black/70 px-1 text-[9px] font-black text-white/70">⚖️</span>}
              {(suspects[m.seat] ?? 0) > 0 && !over && <span key={`s${suspects[m.seat]}`} className={`hwl-pop absolute -left-2 -top-1.5 flex items-center gap-0.5 rounded-full px-1 font-black ${suspects[m.seat] >= 3 ? 'bg-[#ff5a3d] text-[12px] text-white' : suspects[m.seat] === 2 ? 'bg-[#ff9a3d] text-[11px] text-[#2a0d05]' : 'bg-black/75 text-[10px] text-[#ffd36e]'}`}><Eye size={suspects[m.seat] >= 2 ? 12 : 10} />{suspects[m.seat]}</span>}
              {(votes[m.seat] ?? 0) > 0 && !over && <span key={`v${voteFly}`} className="hwl-pop absolute -bottom-1.5 -right-2 rounded-full bg-[#ff5a3d] px-1.5 text-[10px] font-black text-white" style={voteFly ? { animationDelay: '1.1s' } : undefined}>{votes[m.seat]}</span>}
              {voting && m.voted && <span className="absolute -bottom-1 -left-1.5 rounded-full bg-[#3fd67a] px-1 text-[9px] font-black text-[#0b2b16]">✓</span>}
              {(view.phase === 'done' || view.phase === 'closed') && m.ready && <span key="rdy" className="hwl-pop absolute -bottom-1 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#3fd67a] text-[11px] font-black text-[#0b2b16] shadow-[0_0_10px_rgba(63,214,122,.7)] ring-2 ring-[#120d22]">✓</span>}
              {view.phase === 'talk' && m.talked && <span className="absolute -bottom-1 -left-1.5 rounded-full bg-[#7fd0ff] px-1 text-[9px] font-black text-[#082033]">✓</span>}
              {view.phase === 'decide' && m.decided && <span className="absolute -bottom-1 -left-1.5 rounded-full bg-[#7fd0ff] px-1 text-[9px] font-black text-[#082033]">✓</span>}
              {(m.extended || m.talkExtended) && RUNNING.includes(view.phase) && <span title={t.extendUsed} className="absolute -right-2.5 top-[38%] rounded-full bg-[#7fd0ff] px-[3px] text-[9px] leading-[14px] shadow">⏱</span>}
              {view.host === m.seat && view.kind === 'friend' && <Crown size={13} className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#ffd36e]" />}
            </span>
            <span className={`mt-1 max-w-full truncate text-[12px] font-black ${liar ? 'rounded-full bg-[#ff5a3d] px-1.5 text-white' : mine ? 'text-[#ffe9a8]' : 'text-white/80'} ${isTurn ? 'mt-2' : ''}`}>{m.name}{mine ? ` (${t.me})` : ''}</span>
            {top.includes(m.seat) && !over ? <span className="hwl-pop mt-0.5 rounded-full bg-[#ff5a3d] px-1.5 text-[9px] font-black text-white shadow-[0_0_10px_rgba(255,90,61,.6)]">👁 {t.topSuspect}</span>
              : view.phase === 'clue' && next === m.seat && <span className="mt-0.5 rounded-full border border-[#ffd36e]/50 px-1.5 text-[9px] font-black text-[#ffd36e]/90">{t.next}</span>}
            {over && m.pieces && (!show || show.over) ? <span className="hwl-pop mt-0.5 rounded-full bg-[#ffd36e] px-1.5 text-[10px] font-black text-[#3a2600]">🧩 {t.pieces(m.pieces)}</span> : null}
            {!m.here && view.phase === 'lobby' && <span className="text-[9px] text-white/40">{t.away}</span>}
          </button>
        );
      })}
      {/* a clue on its way from the centre to the speaker's seat */}
      {fly && pos[fly.seat] && (
        <span key={`fly${fly.n}`} className="hwl-fly pointer-events-none absolute left-1/2 top-1/2 z-30 rounded-full bg-white px-3 py-1 text-[14px] font-black text-[#241457] shadow-[0_6px_24px_rgba(255,211,110,.45)]"
          style={{ ['--dx' as string]: `${((pos[fly.seat].x - 50) / 100) * box.w}px`, ['--dy' as string]: `${((pos[fly.seat].y - 50) / 100) * box.h - 26}px` }}>
          {fly.label}{fly.hot ? ' 🔥' : ''}
        </span>
      )}
      {/* the ballots, flying from each voter to the one they picked */}
      {voteFly && lastVotes.map((v, k) => pos[v.seat] && pos[v.target] && (
        <span key={`${voteFly}-${v.seat}`} className="hwl-fly-vote pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 text-[18px]"
          style={{ left: `${pos[v.seat].x}%`, top: `${pos[v.seat].y}%`, animationDelay: `${k * 90}ms`,
            ['--dx' as string]: `${((pos[v.target].x - pos[v.seat].x) / 100) * box.w}px`, ['--dy' as string]: `${((pos[v.target].y - pos[v.seat].y) / 100) * box.h}px` }}>🗳</span>
      ))}
      {/* 👁 on its way to the suspect */}
      {eyes.map((e) => pos[e.from] && pos[e.to] && (
        <span key={e.key} className="hwl-fly-vote pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 text-[20px]"
          style={{ left: `${pos[e.from].x}%`, top: `${pos[e.from].y}%`,
            ['--dx' as string]: `${((pos[e.to].x - pos[e.from].x) / 100) * box.w}px`, ['--dy' as string]: `${((pos[e.to].y - pos[e.from].y) / 100) * box.h}px` }}>👁</span>
      ))}
      <TableTip view={view} t={t} pos={pos} top={top} />
      {/* the centre sits above the seats' wide buttons, but lets taps through where it is empty */}
      <div className="pointer-events-none absolute inset-[19%_20%_27%] z-10 flex items-center justify-center">{children}</div>
      {toast && (
        <div key={toast.key} className="pointer-events-none absolute inset-x-0 -top-9 z-40 flex justify-center">
          <span className="hwl-pop rounded-full bg-[#7fd0ff] px-3.5 py-1.5 text-[12.5px] font-black text-[#082033] shadow-[0_8px_26px_rgba(127,208,255,.45)]">{toast.text}</span>
        </div>
      )}
      {banner && (
        <div key={banner.key} className="pointer-events-none absolute inset-x-0 top-[42%] z-40 flex justify-center overflow-hidden">
          <span className="hwl-banner whitespace-nowrap rounded-xl bg-gradient-to-r from-[#ffd36e] via-[#ffb27a] to-[#ff8a6d] px-6 py-2 text-[22px] font-black tracking-tight text-[#241457] shadow-[0_10px_40px_rgba(255,170,90,.45)]">{banner.text}</span>
        </div>
      )}
    </div>
  );
}

/** A seat's word card at the end: face down, then flipped (the liar's in red). */
function RevealCard({ flipped, word, liar, big }: { flipped: boolean; word: string; liar: boolean; big: boolean }) {
  return (
    <span className={`mb-1 flex h-[22px] items-center justify-center rounded-md px-2 font-black shadow ${big ? 'min-w-[44px] text-[12px]' : 'min-w-[38px] text-[10.5px]'} ${flipped ? `hwl-flip ${liar ? 'bg-[#ff5a3d] text-white ring-2 ring-white/70' : 'bg-white text-[#241457]'}` : 'bg-[linear-gradient(135deg,#6d4fd6,#2a1a5e)] text-white/70 ring-1 ring-white/25'}`}>
      {flipped ? word : '?'}
    </span>
  );
}

/** The middle of the table: what this phase asks of me, right where everyone is looking. */
function Center({ view, t, left, frac, marks, mark, refresh, submitClue, typingNow, typing, now, show, onSkip }: {
  view: LiarView; t: T; left: number | null; frac: number | null; marks: Record<number, number>; mark: (s: number | null) => void;
  refresh: () => Promise<void>; submitClue: (word: string, mask: boolean) => Promise<string | null>; typingNow: (kind: 'clue' | 'chat', stop?: boolean) => void;
  typing: Typing; now: number; show: Show | null; onSkip: () => void;
}) {
  const r = view.result;
  const me = view.me;
  const nameOf = (seat: number | null | undefined) => view.members.find((m) => m.seat === seat)?.name ?? '?';
  const liarName = nameOf(view.liar ?? r?.liar);
  const [word, setWord] = useState('');
  const [mask, setMask] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [extending, setExtending] = useState(false);
  const [extBusy, setExtBusy] = useState(false);
  const myTurn = view.phase === 'clue' && view.turn === me?.seat;
  const myGuess = view.phase === 'guess' && view.liar === me?.seat;
  const myMark = me ? marks[me.seat] : undefined;
  const ring = <Ring frac={frac} left={left} />;
  const live = 'pointer-events-auto';
  // a player in the spotlight: their big icon inside the countdown ring
  const spot = (seat: number | null | undefined, tone = '#ffd36e') => (
    <span className="hwl-pop relative" style={{ filter: `drop-shadow(0 0 14px ${tone}55)` }}>
      <Ring frac={frac} left={left} size={64}><span className="relative"><RimStone name={nameOf(seat)} size={50} /></span></Ring>
      {left != null && <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 font-mono text-[10px] font-black ${left <= 5 ? 'bg-[#ff5a3d] text-white' : 'bg-[#ffd36e] text-[#241457]'}`}>{left}</span>}
    </span>
  );
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
  const repeat = myTurn ? repeatOf(view, word) : null;
  const field = (ph: string, kind: 'clue' | 'guess') => (
    <input autoFocus data-hwl-focus value={word} maxLength={12} placeholder={ph} enterKeyHint="send"
      onChange={(e) => { setWord(e.target.value); setErr(null); unlock(); if (kind === 'clue') typingNow('clue'); }}
      className="w-0 min-w-0 flex-1 rounded-xl border-2 border-[#ffd36e] bg-black/60 px-2 py-2 text-center text-[16px] font-black text-white outline-none placeholder:text-[11px] placeholder:font-bold placeholder:text-white/35" />
  );

  let body: React.ReactNode = null;
  if (view.phase === 'lobby') body = <><p className="text-[13px] font-black">{view.kind === 'house' ? t.houseLobby : t.lobbyTitle}</p><p className="mt-1 text-[11px] text-white/55">{view.members.length}/10</p></>;
  else if (view.phase === 'cards') body = me?.liar
    ? <><p className="text-[17px] font-black text-[#ff8a6d]">🎭 {t.cardLiar}</p><p className="mt-1 break-keep text-[11px] text-white/60">{t.cardLiarNote}</p></>
    : <><p className="text-[15px] font-black">{t.cards}</p><p className="mt-1 break-keep text-[11px] text-white/55">{t.wordNote}</p></>;
  else if (myTurn) body = (
    <form className={`${live} hwl-enter w-full rounded-2xl border border-[#ffd36e]/60 bg-[#1b1530]/95 p-2 shadow-[0_0_30px_rgba(255,211,110,.25)]`}
      onSubmit={(e) => { e.preventDefault(); if (word.trim() && !repeat) void send(() => submitClue(word, mask)); }}>
      <div className="flex items-center gap-1.5">
        {ring}
        <p className={`min-w-0 flex-1 break-keep text-left text-[12px] font-black leading-tight ${me?.liar ? 'text-[#ff8a6d]' : 'text-[#ffd36e]'}`}>{me?.liar ? t.myTurnLiar : t.myTurn}</p>
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" disabled={me?.maskUsed} onClick={() => setMask((m) => !m)} title={t.maskTip}
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${mask ? 'bg-[#a98bff] text-[#1a1030]' : 'bg-white/10 text-white/75'} disabled:opacity-35`}>{me?.maskUsed ? t.maskUsed : mask ? t.maskOn : t.mask}</button>
          <button type="button" disabled={me?.extended || extending} title={t.extendTip}
            onClick={async () => { setExtending(true); const res = await extendLiar(view.code); setExtending(false); if (res?.error) setErr(t.error); void refresh(); }}
            className={`rounded-full px-2 py-0.5 text-[10px] font-black disabled:opacity-35 ${me?.extended ? 'bg-white/10 text-white/60' : `bg-[#7fd0ff] text-[#082033] ${left != null && left <= 5 ? 'hwl-next' : ''}`}`}>{me?.extended ? t.extendUsed : t.extend}</button>
        </div>
      </div>
      <div className="mt-1.5 flex gap-1">
        {field(t.cluePh, 'clue')}
        <button type="submit" disabled={busy || !word.trim() || !!repeat} className="shrink-0 rounded-xl bg-[#ffd36e] px-2.5 text-[12px] font-black text-[#241457] disabled:opacity-40">{busy ? <Loader2 size={14} className="animate-spin" /> : t.say}</button>
      </div>
      {repeat ? <p className="mt-1 break-keep text-[11px] font-bold text-[#ff8a6d]">{t.repeatWarn(repeat)}</p>
        : err ? <p className="mt-1 break-keep text-[11px] font-bold text-[#ff8a6d]">{err}</p>
        : !me?.extended && left != null && left <= 5 && <p className="mt-1 text-right text-[11px] font-black text-[#7fd0ff]">{t.extendHint} ↑</p>}
    </form>
  );
  else if (view.phase === 'clue') {
    const typer = view.turn != null && typing[view.turn] && typing[view.turn].until > now && typing[view.turn].kind === 'clue';
    body = <>
      {spot(view.turn)}
      <p className="mt-1.5 max-w-full truncate text-[14px] font-black">{nameOf(view.turn)}</p>
      <p className="flex items-center gap-1 text-[11px] font-bold text-[#ffd36e]/90">{t.thinking}{typer ? <Dots /> : '…'}</p>
      {markLine}
    </>;
  }
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
                className={`flex flex-col items-center rounded-xl px-1 py-1.5 font-black leading-tight transition-colors ${me.talk === k ? (k === 'accuse' ? 'bg-[#ff8a6d] text-[#2a0d05]' : 'bg-[#7fd0ff] text-[#082033]') : 'bg-white/10 text-white'}`}>
                <span className="text-[12px]">{k === 'accuse' ? t.accuse : t.more}</span>
                <span className="text-[10px] opacity-70">{view.talk[k]}</span>
              </button>
            ))}
          </div>)}
      {me?.playing && (() => {
        const used = !!me.talkExtended, capped = (view.talkExt ?? 0) >= 90;
        return (
          <button type="button" data-hwl-talkext disabled={used || capped || extBusy} title={t.talkExtendTip}
            onClick={async () => { setExtBusy(true); await talkExtendLiar(view.code); setExtBusy(false); void refresh(); }}
            className={`${live} mt-1.5 rounded-full px-3 py-1 text-[11px] font-black disabled:opacity-40 ${used || capped ? 'bg-white/10 text-white/60' : `bg-[#7fd0ff] text-[#082033] ${left != null && left <= 10 ? 'hwl-next' : ''}`}`}>
            {used ? t.talkExtendUsed : capped ? t.talkExtendCap : t.talkExtend}{!used && !capped && left != null && left <= 10 ? ` · ${t.talkExtendHint}` : ''}
          </button>
        );
      })()}
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
  else if (view.phase === 'last') {
    const k = (view.votes ?? []).filter((v) => v.target === view.accused && v.stage === (view.votes?.some((x) => x.stage === 'runoff') ? 'runoff' : 'vote')).length;
    body = <>
      {spot(view.accused, '#ff8a6d')}
      <p className="mt-1.5 text-[15px] font-black text-[#ff8a6d]">{t.lastTitle}</p>
      <p className="break-keep text-[11px] font-bold leading-tight text-white/75">{view.accused === me?.seat ? t.lastMine : t.lastOther(nameOf(view.accused))}</p>
      {k > 0 && <p className="mt-0.5 text-[10px] font-black text-white/45">{t.votesFor(k)}</p>}
    </>;
  }
  else if (view.phase === 'decide') {
    const can = me?.playing && me.seat !== view.accused;
    const final = view.revotes >= 1;
    body = <>
      <div className="flex items-center gap-2">{ring}<p className="break-keep text-left text-[14px] font-black leading-tight">{t.decideTitle(nameOf(view.accused))}</p></div>
      {can
        ? <div className={`${live} mt-1.5 grid w-full grid-cols-2 gap-1.5`}>
            {(['arrest', 'revote'] as const).map((k) => (
              <button key={k} type="button" onClick={() => { void decideLiar(view.code, k).then(refresh); }}
                className={`flex flex-col items-center rounded-xl px-1 py-1.5 font-black leading-tight transition-colors ${me?.decide === k ? (k === 'arrest' ? 'bg-[#ff8a6d] text-[#2a0d05]' : 'bg-[#7fd0ff] text-[#082033]') : 'bg-white/10 text-white'}`}>
                <span className="text-[12px]">{k === 'arrest' ? t.arrest : final ? t.release : t.revote}</span>
                <span className="text-[10px] opacity-70">{view.decide[k]}</span>
              </button>
            ))}
          </div>
        : <p className="mt-1.5 text-[11px] font-bold text-white/65">{t.decideWait} · 🚔 {view.decide.arrest} / {final ? '🕊' : '🔄'} {view.decide.revote}</p>}
      <p className="mt-1 break-keep text-[10px] leading-tight text-white/45">{final ? t.decideHintRelease : t.decideHintRevote(nameOf(view.accused))}</p>
    </>;
  }
  else if (myGuess) body = (
    <form className={`${live} hwl-enter w-full rounded-2xl border border-[#ffd36e]/60 bg-[#1b1530]/95 p-2`} onSubmit={(e) => { e.preventDefault(); if (word.trim()) void send(async () => { const res = await guessLiar(view.code, word); void refresh(); return res?.error ? ({ empty: t.clueErr.empty, turn: t.clueErr.turn } as Record<string, string>)[res.error] ?? t.error : null; }); }}>
      <div className="flex items-center justify-center gap-2">{ring}<p className="break-keep text-left text-[12px] font-black leading-tight text-[#ffd36e]">{t.guessMine}</p></div>
      <div className="mt-1.5 flex gap-1">
        {field(t.guessPh, 'guess')}
        <button type="submit" disabled={busy || !word.trim()} className="shrink-0 rounded-xl bg-[#ffd36e] px-3 text-[13px] font-black text-[#241457] disabled:opacity-40">{t.guessBtn}</button>
      </div>
      {err && <p className="mt-1 text-[11px] font-bold text-[#ff8a6d]">{err}</p>}
    </form>
  );
  else if (view.phase === 'guess') body = <>
    {spot(view.liar, '#ff5a3d')}
    <p className="mt-1.5 text-[15px] font-black text-[#ffd36e]">{t.guessTitle(liarName)}</p>
    <p className="break-keep text-[11px] text-white/60">{t.guessOther(liarName)}</p>
  </>;
  else if (view.phase === 'done' && r) {
    const s = show;
    if (s && !s.over && s.t < s.flipsEnd) body = (
      <button type="button" onClick={onSkip} className={`${live} flex flex-col items-center`}>
        <p className="hwl-pop text-[17px] font-black">{t.revealTitle}</p>
        <p className="mt-1 text-[10px] font-bold text-white/40">{t.skip}</p>
      </button>
    );
    else if (s && !s.over && r.guess && s.t < s.verdictAt) {
      const right = r.outcome === 'liar' && r.reason === 'guessed';
      body = (
        <button type="button" onClick={onSkip} className={`${live} flex flex-col items-center`}>
          <p className="text-[11px] font-black text-white/60">{t.liarGuess}</p>
          <p className="hwl-pop mt-0.5 rounded-xl bg-white px-3 py-1 text-[20px] font-black text-[#241457]">{r.guess}</p>
          {s.t >= s.flipsEnd + 0.9 && <p className={`hwl-stamp mt-1.5 text-[24px] font-black ${right ? 'text-[#7fe3a0]' : 'text-[#ff5a3d]'}`}>{right ? t.guessRight : t.guessWrong}</p>}
        </button>
      );
    }
    else {
      const verdict = r.outcome === 'citizens' ? t.verdictCaught : r.reason === 'guessed' ? t.verdictLiar : t.verdictFailed;
      body = r.outcome === 'void'
        ? <><p className="text-[30px] leading-none">·</p><p className="mt-1 text-[16px] font-black text-white/70">{t.resultVoid}</p></>
        : (
          <>
            <p className={`hwl-verdict rotate-[-4deg] mt-2 rounded-xl border-[3px] px-2.5 py-0.5 text-[17px] font-black leading-tight ${r.outcome === 'citizens' ? 'border-[#7fe3a0] text-[#7fe3a0]' : 'border-[#ff8a6d] text-[#ff8a6d]'}`}>{verdict}</p>
            <p className="mt-1.5 text-[11px] font-black text-white/80">{t.liarIs(liarName)} 🎭</p>
            {t.reason[r.reason] && <p className="text-[10.5px] text-white/55">{t.reason[r.reason]}</p>}
            <div className="mt-1.5 flex items-center justify-center gap-2 text-[12px]">
              <span className="text-[10.5px] font-bold text-white/55">{t.answer}</span>
              <span className="rounded-lg bg-white px-2 py-0.5 font-black text-[#241457]">{r.answer}</span>
            </div>
            {r.guess && <p className="mt-0.5 text-[10.5px] text-white/70">{t.guessed}: <b>{r.guess}</b></p>}
          </>
        );
    }
  }
  else if (view.phase === 'closed') body = <><p className="text-[14px] font-black">{t.closed}</p><p className="mt-1 break-keep text-[11px] text-white/55">{t.closedNote}</p></>;
  const pop = ['talk', 'vote', 'runoff', 'decide'].includes(view.phase);
  return <div className={`flex w-full flex-col items-center justify-center text-center ${pop ? 'hwl-pop' : ''}`}>{body}</div>;
}

function Actions({ view, t, en, code, refresh }: { view: LiarView; t: T; en: boolean; code: string; refresh: () => Promise<void>; show?: Show | null }) {
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
          <CallIn code={code} t={t} />
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
    return (
      <div className={`${box} hwl-pop`}>
        {!r.valid && r.outcome !== 'void' && <p className="mb-2 break-keep text-center text-[10px] text-white/40">{t.noReward}</p>}
        {me?.piecesToday != null && <p className="mb-2 text-center text-[11px] font-black text-[#ffd36e]">🧩 {t.todayLeft(Math.max(0, view.cfg.dailyCap - me.piecesToday), view.cfg.dailyCap)}</p>}
        {me?.playing && r.outcome !== 'void' && <>
          <p className="mt-3 mb-1.5 text-[11px] font-black text-[#c9b6ff]">{t.share}</p>
          <LiarShare compact url={`${url.replace(/\/room\/.*$/, '')}`} title={t.title} text={`${t.shareResult(iWasLiar, r.outcome)} · ${t.answer} ${r.answer}`} button={en ? 'Play' : '플레이하기'} en={en} />
        </>}
        <p className="mt-3 mb-1.5 text-[11px] font-black text-[#c9b6ff]">{t.invite}</p>
        <LiarShare compact url={url} title={t.title} text={t.inviteText(code.toUpperCase())} button={t.inviteButton} en={en} />
        <CallIn code={code} t={t} />
      </div>
    );
  }
  return null;
}

/**
 * 다시 하기, pinned above the chat once the show is over (it stays when the result card is scrolled away):
 * ready count n/4, a countdown ring, a gentle pulse until I am ready. Friend rooms: the host gets 「다시 시작」,
 * everyone else 「준비」. A closed room that still has people: 「한 판 더 (방 다시 열기)」.
 */
function PinnedAgain({ view, t, code, refresh, show, now, skew }: { view: LiarView; t: T; code: string; refresh: () => Promise<void>; show: Show | null; now: number; skew: number }) {
  const me = view.me;
  const [busy, setBusy] = useState(false);
  if (!me) return null;
  const closed = view.phase === 'closed';
  if (!closed && !(view.phase === 'done' && view.result && (!show || show.over))) return null;
  const present = view.members.filter((m) => !m.gone);
  const ready = present.filter((m) => m.ready).length;
  const min = view.cfg.min;
  const host = view.kind === 'friend' && view.host === me.seat;
  const wait = !!show?.serverWait;
  const left = !closed && view.deadline ? Math.max(0, Math.ceil((view.deadline - (now + skew)) / 1000)) : null;
  const total = ready >= min ? view.cfg.readyWait ?? 10 : view.cfg.again ?? 25;
  const frac = left != null ? Math.max(0, Math.min(1, left / total)) : null;
  const act = async (fn: () => Promise<unknown>) => { if (busy) return; setBusy(true); unlock(); await fn(); setBusy(false); void refresh(); };
  const label = closed ? t.reopen
    : host ? t.restart
    : me.ready ? `✓ ${t.readyOn} · ${ready}/${min}`
    : view.kind === 'friend' ? `${t.readyBtn} · ${ready}/${min}` : `${t.againBig} ${ready}/${min}${left != null ? ` · ${left}${t.sec}` : ''}`;
  const primary = !me.ready || host || closed;
  return (
    <div className="shrink-0 border-t border-white/10 bg-[#120d22]/95 px-3 py-2 backdrop-blur lg:px-6">
      <div className="mx-auto flex max-w-[520px] items-center gap-2.5">
        {frac != null && <Ring frac={frac} left={left} size={42} />}
        <button type="button" disabled={busy || (host && (wait || present.length < min)) || (!host && !closed && me.ready)}
          onClick={() => { void act(() => (host ? startLiar(code) : readyLiar(code, true))); }}
          className={`relative flex-1 overflow-hidden rounded-2xl py-3.5 text-[17px] font-black disabled:cursor-default ${primary ? `text-[#1a1030] shadow-[0_8px_30px_rgba(169,139,255,.45)] ${me.ready && !host ? '' : 'hwl-again'}` : 'bg-[#3fd67a]/20 text-[#7fe3a0] ring-1 ring-[#3fd67a]/50'}`}
          style={primary ? { background: 'linear-gradient(90deg,#c4b0ff,#a98bff 55%,#8d6cf0)' } : undefined}>
          {!closed && <span className="absolute inset-y-0 left-0 bg-white/25 transition-all duration-500" style={{ width: `${Math.min(100, (ready / min) * 100)}%` }} />}
          <span className="relative">{host && wait ? t.showing : label}</span>
        </button>
        {host && !closed && (
          <button type="button" disabled={busy || me.ready} onClick={() => { void act(() => readyLiar(code, true)); }}
            className="shrink-0 rounded-2xl bg-white/10 px-3 py-3.5 text-[13px] font-black text-white disabled:text-[#7fe3a0]">{me.ready ? '✓' : t.readyBtn} {ready}/{min}</button>
        )}
      </div>
      <p className="mx-auto mt-1 max-w-[520px] text-center text-[10.5px] font-bold text-white/50">{closed ? t.closedNote : ready >= min && left != null ? <span className="text-[#ffd36e]">⏱ {t.againSoon(left)}</span> : t.againNote(min)}</p>
    </div>
  );
}

/** 📣 call players from the home card and the 공개방 queue (the server allows it once a minute). */
function CallIn({ code, t }: { code: string; t: T }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const call = async () => {
    setBusy(true);
    const res = await inviteLiar(code);
    setBusy(false);
    if (!res) return setMsg(t.error);
    if (res.error === 'wait') return setMsg(t.callInWait(res.wait ?? 60));
    if (res.error === 'full') return setMsg(t.callInFull);
    if (res.error) return setMsg(t.error);
    setMsg(t.callInDone(res.sent ?? 0, res.seats ?? 0));
  };
  return (
    <div className="mt-2">
      <button type="button" disabled={busy} onClick={() => { void call(); }} className="w-full rounded-xl bg-[#ffd36e]/15 py-2.5 text-[13px] font-black text-[#ffd36e] ring-1 ring-[#ffd36e]/40 disabled:opacity-50">{t.callIn}</button>
      <p className="mt-1 break-keep text-center text-[10.5px] font-bold text-white/50">{msg ?? t.callInNote}</p>
    </div>
  );
}

function ClueBoard({ view, t }: { view: LiarView; t: T }) {
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
              <span className="text-white/90">{c.word ?? silentOf(view, c, t)}</span>
              {c.word && <span className="font-black" style={{ color: c.score == null ? (c.hot ? '#ff5a3d' : '#9a94b0') : scoreColor(c.score) }}>{shownScore(c, t)}{over && c.masked ? '🎭' : ''}</span>}
              {over && c.decoyScore != null && <span className="text-[9px] text-white/40">/{Math.round(c.decoyScore)}</span>}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Rules({ t }: { t: T }) {
  return (
    <ul className="mx-auto mt-3 max-w-[520px] space-y-1 rounded-2xl border border-white/10 bg-white/[.03] p-3 text-[11px] text-white/60">
      {t.rules.map((r) => <li key={r} className="break-keep">· {r}</li>)}
    </ul>
  );
}

function ChatPanel({ chat, t, say, view, myTurn, submitClue, typingNow, marks, now, chatMode, hud }: {
  chat: LiarChat[]; t: T; say: (text: string, emote?: boolean) => Promise<string | null>; view: LiarView; myTurn: boolean;
  submitClue: (word: string, mask: boolean) => Promise<string | null>; typingNow: (kind: 'clue' | 'chat', stop?: boolean) => void;
  marks: Record<number, number>; now: number; chatMode: boolean; hud: React.ReactNode;
}) {
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [offer, setOffer] = useState<string | null>(null); // a lone noun typed here on my turn: "submit it as my clue?"
  const [sent, setSent] = useState(0); // my own lines: always back to the bottom
  // the newest line stays in view: new lines (also once the list is capped), keyboard / chat mode, phase changes, resizes
  const { list, unread, jump } = useChatBottom(chat[chat.length - 1]?.key, `${chatMode}|${view.game}|${view.phase}|${sent}`);
  useEffect(() => { if (!myTurn) { const id = window.setTimeout(() => setOffer(null), 0); return () => window.clearTimeout(id); } }, [myTurn]);
  const word = view.me?.word;
  const inGame = RUNNING.includes(view.phase);
  const lastWords = view.phase === 'last' ? view.accused : null;
  const top = inGame ? topSuspects(marks) : [];
  const meTop = view.me != null && top.includes(view.me.seat);
  // the top suspect's newest line stays pinned above the chat for a few seconds, so everyone reads their defence
  const pinned = [...chat].reverse().find((m) => m.kind === 'chat' && top.includes(m.seat) && now - m.at < 8000);
  const send = async (raw: string, emote = false, force = false) => {
    const flat = raw.replace(/\s+/g, '');
    if (word && inGame && flat.includes(word)) { setErr(t.chatBlocked.word); return; }   // the server checks too (and more)
    if (myTurn && !emote && !force && isWord(raw)) { setOffer(raw.trim()); return; }
    if (!emote) setText('');
    setSent((n) => n + 1);
    const block = await say(raw, emote);
    if (block) { setErr(t.chatBlocked[block] ?? t.chatBlocked.error); if (!emote) setText(raw); return; }
    setErr(null); setOffer(null);
    if (!emote) typingNow('chat', true);
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
    <div className={`flex flex-col border-t border-white/10 bg-black/45 transition-opacity lg:h-auto lg:w-[340px] lg:border-l lg:border-t-0 ${chatMode ? 'min-h-0 flex-1' : `shrink-0 ${view.phase === 'lobby' ? 'h-[28dvh]' : 'h-[34dvh]'}`} ${myTurn && !offer && !chatMode ? 'opacity-55 focus-within:opacity-100' : ''}`}>
      {hud}
      {inGame && !chatMode && (
        <p className={`flex items-center gap-1 border-b border-white/5 px-3 py-1 text-[10.5px] font-bold ${myTurn ? 'bg-[#ffd36e]/10 text-[#ffd36e]' : lastWords != null ? 'bg-[#ff8a6d]/10 text-[#ff8a6d]' : 'text-white/40'}`}>
          <MessageCircle size={11} />{myTurn ? t.chatNote : lastWords != null ? t.lastChat : t.chat}
        </p>
      )}
      {meTop && !myTurn && <p className="hwl-pop mx-2 mt-1 rounded-lg bg-[#ff5a3d]/20 px-2.5 py-1 text-[11.5px] font-black text-[#ffb09c] ring-1 ring-[#ff5a3d]/50">{t.suspectedMe}</p>}
      {pinned && !meTop && (
        <div key={pinned.key} className="hwl-pop mx-2 mt-1 rounded-lg border-l-[3px] border-[#ff5a3d] bg-[#ff5a3d]/15 px-2.5 py-1">
          <p className="text-[9.5px] font-black text-[#ff8a6d]">{t.suspectSays}</p>
          <p className="break-words text-[14px] font-bold leading-snug"><b className="text-[#ffb09c]">{pinned.name}</b> {pinned.text}</p>
        </div>
      )}
      <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={list} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 text-[14.5px] lg:text-[13.5px]">
        <div className="space-y-1">
        {chat.map((m) => m.kind === 'event'
          ? <p key={m.key} className="my-0.5 flex justify-center"><span className="rounded-full bg-white/[.07] px-2.5 py-0.5 text-[11.5px] font-black text-[#ffd36e]/90 ring-1 ring-white/10">{m.text}</span></p>
          : m.kind === 'system'
          ? <p key={m.key} className="text-[13px] font-bold text-[#c9b6ff]/90">{m.text}</p>
          : (
            <p key={m.key} className={`break-words leading-snug ${lastWords === m.seat ? 'rounded-lg border-l-[3px] border-[#ff8a6d] bg-[#ff8a6d]/12 px-2 py-1 text-[14px]' : top.includes(m.seat) ? 'rounded-lg border-l-[3px] border-[#ff5a3d] bg-[#ff5a3d]/10 px-2 py-0.5 text-[13.5px]' : ''}`}>
              <b style={{ color: colorOf(m.seat) }}>{m.name}</b>{' '}
              {m.kind === 'hidden'
                ? <span className="text-[12px] italic text-white/40">{t.hiddenLine}</span>
                : <span className={m.kind === 'emote' ? 'rounded bg-white/10 px-1 font-bold' : 'text-white/90'}>{m.text}</span>}
            </p>
          ))}
        </div>
      </div>
      {unread && (
        <button type="button" onClick={jump} className="hwl-pop absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#a98bff] px-3 py-1 text-[12px] font-black text-[#1a1030] shadow-lg shadow-black/40">{t.newLines}</button>
      )}
      </div>
      {offer ? (
        <div className="mx-2 mb-1 rounded-xl border border-[#ffd36e]/60 bg-[#1b1530] p-2">
          <p className="text-center text-[12px] font-black text-[#ffd36e]">{t.asClue(offer)}</p>
          {err && <p className="mt-0.5 text-center text-[11px] font-bold text-[#ff8a6d]">{err}</p>}
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => { void asClue(); }} className="rounded-lg bg-[#ffd36e] py-1.5 text-[12px] font-black text-[#241457]">{t.asClueYes}</button>
            <button type="button" onClick={() => { void send(offer, false, true); }} className="rounded-lg bg-white/10 py-1.5 text-[12px] font-bold text-white/80">{t.asClueNo}</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1 overflow-x-auto px-2 pb-1 [scrollbar-width:none]">
          {t.quick.map((q) => <button key={q} type="button" onClick={() => { void send(q, true); }} className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80 active:bg-white/20">{q}</button>)}
        </div>
      )}
      {err && !offer && <p className="px-3 text-[11px] font-bold text-[#ff8a6d]">{err}</p>}
      <form className="flex gap-1.5 px-2 pb-2 pt-1" onSubmit={(e) => { e.preventDefault(); void send(text); }}>
        <input data-hwl-chat value={text} onChange={(e) => { setText(e.target.value); setErr(null); setOffer(null); if (e.target.value) typingNow('chat'); }} maxLength={100} placeholder={inGame ? t.chatPhGame : t.chatPh}
          className={`min-w-0 flex-1 rounded-xl border bg-white/5 px-3 py-2 text-[16px] outline-none ${err ? 'border-[#ff8a6d]' : 'border-white/10'}`} />
        <button type="submit" aria-label={t.send} className="flex w-11 items-center justify-center rounded-xl bg-[#a98bff] text-[#1a1030]"><Send size={16} /></button>
      </form>
    </div>
  );
}
