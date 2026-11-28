"use client";

// 뒤집기 오목, the "전략적 뒤집기" prototype (`/flip-omok?rules=next`): AI match only, nothing recorded.
// Rules: `NEXT_RULES` in src/lib/flipOmokNext.ts. The live game (FlipOmokGame) is untouched without the switch.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, FlaskConical, Lock, RotateCcw, Sparkles, Trophy, Undo2, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { useEndReveal } from '@/hooks/useEndReveal';
import { EndRevealBanner } from '@/components/ui/EndReveal';
import { ReplayButton, ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import HomeButton from '@/components/ui/HomeButton';
import { Link } from '@/i18n/routing';
import { SIZE, coordinateLabel, isFlipped, isGap, owner, type Line, type Player } from '@/lib/flipOmok';
import {
  NEXT_RULES, actionsAt, apply, chooseAction, isFullBoard, legalActions, lineCells, newState, type NAction, type NState, type NextLevel,
} from '@/lib/flipOmokNext';
import { Dot, FLIP_ACCENT, FLIP_INK, STONE_HEX, Stone } from './FlipOmokParts';
import { MyPieces } from '../PieceStone';

const RULES = NEXT_RULES;
const GOLD = '#ffd76b';
const MARGIN = 4.2;
const pos = (v: number) => MARGIN + v * ((100 - MARGIN * 2) / (SIZE - 1));
const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

// ---- sound: a short whoosh, a thump, and a rising tick per stone turned ----
type WebkitWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
const MUTE_KEY = 'puzzlthink_flip_next_mute';
let audio: AudioContext | null = null;
const soundOn = () => { try { return localStorage.getItem(MUTE_KEY) !== '1'; } catch { return true; } };
function ctx() {
  if (typeof window === 'undefined' || !soundOn()) return null;
  const C = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!C) return null;
  audio ??= new C();
  if (audio.state === 'suspended') void audio.resume();
  return audio;
}
function tone(c: AudioContext, f: number, d: number, v: number, type: OscillatorType, delay = 0, to?: number) {
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + d);
}
function playFlipSound(n: number) {
  const c = ctx();
  if (!c) return;
  tone(c, 140, 0.32, 0.22, 'sine', 0, 55); // thump
  tone(c, 300, 0.22, 0.05, 'sawtooth', 0, 1200); // whoosh up
  for (let i = 0; i < Math.min(n, 6); i++) tone(c, 660 * 2 ** (i / 5), 0.12, 0.06, 'triangle', 0.12 + i * 0.09);
}
function playPlaceSound() { const c = ctx(); if (c) tone(c, 420, 0.06, 0.05, 'triangle'); }

/** The player's flip charges as 벽바둑 II shows its wall break: lit diamonds while ready, dim once spent. */
export function ChargeDiamonds({ left, max, color, size = 9 }: { left: number; max: number; color: string; size?: number }) {
  return <span className="inline-flex items-center gap-[3px]" aria-label={`${left}/${max}`}>
    {Array.from({ length: max }, (_, i) => <i key={i} className="inline-block rotate-45 rounded-[1px] transition-all duration-300"
      style={{ width: size, height: size, background: i < left ? color : 'rgba(255,255,255,.14)', boxShadow: i < left ? `0 0 7px ${color}` : undefined }} />)}
  </span>;
}

interface Pending { at: number; acts: NAction[] } // a point the player tapped where a flip is possible
interface Snap { s: NState; last: number | null; flips: number[] }

function NextBoard({ s, last, flips, flipKey, win, pending, ghost, banned, interactive, onTap, overlay, callout }: {
  s: NState; last: number | null; flips: number[]; flipKey: number; win: Line | null;
  pending: { at: number; flips: number[]; who: Player } | null; ghost: Player; banned: Set<number>; interactive: boolean;
  onTap: (at: number) => void; overlay?: ReactNode; callout: ReactNode;
}) {
  const t = useTranslations('FlipOmok');
  const [hover, setHover] = useState<number | null>(null);
  const flipSet = new Set(flips), winSet = new Set(win ? lineCells(win) : []), pendSet = new Set(pending?.flips ?? []);
  const shake = flips.length > 0 && flipKey > 0;
  return <div key={shake ? `shake-${flipKey}` : 'still'} className={`relative mx-auto aspect-square w-full max-w-[700px] rounded-[10px] bg-gradient-to-br from-[#ff4d6d] via-[#26313f] to-[#3fb8ff] p-[3px] shadow-[0_24px_60px_rgba(0,0,0,.78),0_0_30px_rgba(63,184,255,.14)] ${shake ? 'flip-next-shake' : ''}`}>
    <div className="relative h-full w-full overflow-hidden rounded-[7px] border border-[#67e8ff]/20 bg-[#080c12]" style={{ backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(72,213,255,.09), transparent 50%), linear-gradient(145deg,#0c121a,#06080d)' }} onMouseLeave={() => setHover(null)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: SIZE }, (_, i) => <g key={i}>
          <line x1={pos(i)} y1={pos(0)} x2={pos(i)} y2={pos(SIZE - 1)} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".22" />
          <line x1={pos(0)} y1={pos(i)} x2={pos(SIZE - 1)} y2={pos(i)} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".22" />
        </g>)}
        {STARS.map(([r, c]) => <circle key={`${r}${c}`} cx={pos(c)} cy={pos(r)} r=".65" fill="#b8f6ff" />)}
      </svg>
      {s.board.map((cell, at) => {
        const r = Math.floor(at / SIZE), c = at % SIZE;
        const canTap = interactive && !cell && !banned.has(at);
        const dist = last === null ? 0 : Math.max(Math.abs(r - Math.floor(last / SIZE)), Math.abs(c - (last % SIZE))) - 1;
        return <button key={at} type="button" data-v={cell} data-lock={s.locked[at] || undefined} disabled={!canTap} aria-label={coordinateLabel(at)} title={!cell && banned.has(at) && interactive ? t('banned') : undefined}
          onClick={() => onTap(at)} onMouseEnter={() => setHover(at)}
          className={`absolute z-10 h-[6.2%] w-[6.2%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none [perspective:300px] ${canTap ? 'cursor-pointer' : ''}`}
          style={{ left: `${pos(c)}%`, top: `${pos(r)}%` }}>
          {cell ? <span className="relative block h-full w-full">
            {winSet.has(at) && <span className="end-reveal-pulse pointer-events-none absolute -inset-[10%] rounded-full" style={{ ['--reveal' as string]: STONE_HEX[win!.owner] }} />}
            <Stone key={`${cell}-${flipSet.has(at) ? flipKey : 0}`} cell={cell} latest={at === last} flip={flipSet.has(at)} delay={120 + dist * 90} />
            {isFlipped(cell) && <span className="pointer-events-none absolute -bottom-[14%] -right-[14%] flex h-[52%] w-[52%] items-center justify-center rounded-full border border-[#ffd76b]/80 bg-[#14110a]" aria-hidden><Lock className="h-[66%] w-[66%] text-[#ffd76b]" strokeWidth={3} /></span>}
            {pendSet.has(at) && <span className="flip-next-target pointer-events-none absolute -inset-[16%] rounded-full border-2" style={{ borderColor: GOLD, boxShadow: `0 0 10px ${GOLD}, inset 0 0 8px ${STONE_HEX[pending!.who]}` }}>
              <span className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: STONE_HEX[pending!.who], boxShadow: `0 0 6px ${STONE_HEX[pending!.who]}` }} />
            </span>}
          </span>
            : pending?.at === at ? <span className="flip-next-ghost block h-full w-full rounded-full border-2 border-white/70" style={{ background: STONE_HEX[pending.who], boxShadow: `0 0 14px ${STONE_HEX[pending.who]}` }} />
              : banned.has(at) && interactive ? <svg viewBox="0 0 10 10" className="h-full w-full p-[22%]" aria-hidden><path d="M1 1L9 9M9 1L1 9" stroke="#ff4d6d" strokeOpacity=".75" strokeWidth="1.6" strokeLinecap="round" /></svg>
                : hover === at && canTap ? <span className="block h-full w-full rounded-full opacity-40" style={{ background: STONE_HEX[ghost] }} /> : null}
        </button>;
      })}
      {shake && last !== null && <span key={`wave-${flipKey}`} className="flip-next-wave pointer-events-none absolute z-20 aspect-square w-[40%] rounded-full border-[3px]"
        style={{ left: `${pos(last % SIZE)}%`, top: `${pos(Math.floor(last / SIZE))}%`, borderColor: GOLD }} />}
      {win && <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden><g className="flip-omok-win">
        <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke={STONE_HEX[win.owner]} strokeWidth="1.6" strokeLinecap="round" />
        <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke="#fff" strokeWidth=".4" strokeLinecap="round" />
      </g></svg>}
      {callout}
      {overlay}
    </div>
  </div>;
}

export default function FlipOmokNextGame() {
  const t = useTranslations('FlipOmok');
  const tn = useTranslations('FlipOmokNext');
  const tc = useTranslations('Common');
  const [level, setLevel] = useState<NextLevel>('normal');
  const [s, setS] = useState<NState>(() => newState(RULES));
  const [last, setLast] = useState<number | null>(null);
  const [flips, setFlips] = useState<number[]>([]);
  const [win, setWin] = useState<Line | null>(null);
  const [draw, setDraw] = useState(false);
  const [history, setHistory] = useState<Snap[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [aiPreview, setAiPreview] = useState<NAction | null>(null);
  const [callout, setCallout] = useState<{ who: Player; n: number; key: number; void: boolean } | null>(null);
  const [gameNo, setGameNo] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [replaying, setReplaying] = useState(false);
  const [sound, setSound] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const quietRef = useRef<HTMLButtonElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- read the stored preference once on mount
  useEffect(() => { setSound(soundOn()); }, []);

  const over = !!win || draw;
  const aiTurn = s.turn === 2 && !over;
  const started = history.length > 0;
  const name = (p: Player) => (p === 1 ? t('you') : 'COCO');

  const commit = (act: NAction) => {
    const p = s.turn;
    const res = apply(RULES, s, act);
    setHistory((h) => [...h, { s, last, flips }]);
    setS(res.state); setLast(act.at); setFlips(act.flips); setPending(null); setAiPreview(null);
    if (act.flips.length) {
      setCallout({ who: p, n: act.flips.length, key: res.state.ply, void: !res.win && !act.post && fiveRun(res.state.board, act.at, p) });
      playFlipSound(act.flips.length);
      try { navigator.vibrate?.(act.spend ? [30, 40, 60] : 20); } catch { /* optional */ }
    } else playPlaceSound();
    if (res.win) setWin(res.win);
    else if (isFullBoard(res.state.board)) setDraw(true);
  };

  useEffect(() => {
    if (!callout) return;
    const timer = window.setTimeout(() => setCallout(null), callout.void ? 2600 : 1500);
    return () => window.clearTimeout(timer);
  }, [callout]);

  // COCO: think, and when it is about to flip, show the stones it is aiming at for a beat first.
  useEffect(() => {
    if (!aiTurn) return;
    let inner = 0;
    const timer = window.setTimeout(() => {
      const act = chooseAction(RULES, s, level);
      if (!act.flips.length) { commit(act); return; }
      setAiPreview(act);
      inner = window.setTimeout(() => commit(act), 750);
    }, level === 'hard' ? 120 : 480);
    return () => { window.clearTimeout(timer); window.clearTimeout(inner); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTurn, s]);

  // The legal actions for the player, by point; a point with none is a 쌍삼 ✕.
  const legalByPoint = useMemo(() => {
    const m = new Map<number, NAction[]>();
    if (over || aiTurn) return m;
    for (const a of legalActions(RULES, s)) m.set(a.at, [...(m.get(a.at) ?? []), a]);
    return m;
  }, [s, over, aiTurn]);
  const banned = useMemo(() => {
    const out = new Set<number>();
    if (over || aiTurn) return out;
    s.board.forEach((v, i) => { if (!v && !legalByPoint.has(i) && actionsAt(RULES, s, i).length && hasNeighbour(s.board, i)) out.add(i); });
    return out;
  }, [s, legalByPoint, over, aiTurn]);

  const tap = (at: number) => {
    if (over || aiTurn || s.board[at]) return;
    if (pending?.at === at) { const quiet = pending.acts.find((a) => !a.flips.length); if (quiet) commit(quiet); return; } // second tap = the safe default
    const acts = legalByPoint.get(at) ?? actionsAt(RULES, s, at).filter(() => !banned.has(at));
    if (!acts.length) return;
    if (acts.some((a) => a.flips.length)) { setPending({ at, acts }); return; }
    commit(acts[0]);
  };
  useEffect(() => { if (pending) quietRef.current?.focus({ preventScroll: true }); }, [pending]);

  const reset = () => {
    setS(newState(RULES)); setLast(null); setFlips([]); setWin(null); setDraw(false); setHistory([]); setPending(null); setAiPreview(null);
    setCallout(null); setGameNo((n) => n + 1); setShowResult(true); setReplaying(false);
  };
  const undo = () => {
    if (!history.length || aiTurn) return;
    const back = history.length >= 2 && !(win && win.owner === 1) ? 2 : 1;
    const snap = history[history.length - back];
    setS(snap.s); setLast(snap.last); setFlips(snap.flips); setWin(null); setDraw(false); setPending(null); setShowResult(true); setReplaying(false);
    setHistory((h) => h.slice(0, h.length - back));
  };
  const toggleSound = () => { const on = !sound; setSound(on); try { localStorage.setItem(MUTE_KEY, on ? '0' : '1'); } catch { /* optional */ } };

  const frames = [...history.map((h) => ({ s: h.s, last: h.last, flips: h.flips })), { s, last, flips }];
  const replay = useReplayPlayer(frames.length - 1, replaying && over, 900);
  const frame = replaying && over ? frames[replay.at] : null;

  const status = win ? t('wins', { name: name(win.owner) }) : draw ? t('draw') : aiTurn ? (aiPreview ? tn('aiAiming') : t('aiThinking')) : pending ? tn('choose') : t('turnOf', { name: name(s.turn) });
  const reveal = useEndReveal(over && `${gameNo}-${history.length}-${win ? 'w' : 'd'}`);
  const flipAct = pending?.acts.find((a) => a.flips.length);
  const quietAct = pending?.acts.find((a) => !a.flips.length);
  const shownPending = pending && flipAct ? { at: pending.at, flips: flipAct.flips, who: 1 as Player }
    : aiPreview ? { at: aiPreview.at, flips: aiPreview.flips, who: 2 as Player } : null;
  const gap = pending ? isGap(s.board, pending.at, 1) : false;

  // The call-out stands in the half of the board away from the stones that just turned, so they stay visible.
  const calloutTop = last !== null && last >= 0 && Math.floor(last / SIZE) < SIZE / 2 ? '76%' : '22%';
  const calloutNode = callout && <div key={callout.key} className="flip-next-callout pointer-events-none absolute left-1/2 z-30 whitespace-nowrap text-center" style={{ top: calloutTop }}>
    <p className="text-[42px] font-black italic leading-none tracking-tight sm:text-6xl" style={{ color: '#fff', textShadow: `0 0 18px ${STONE_HEX[callout.who]}, 0 0 4px ${STONE_HEX[callout.who]}, 0 3px 0 #000` }}>{tn('callout')}</p>
    <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-xs font-black text-white"><Sparkles size={12} style={{ color: GOLD }} />{tn('calloutSub', { name: name(callout.who), n: callout.n })}</p>
    {callout.void && <p className="mt-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-black text-[#ffd166]">{t('voidFiveToast')}</p>}
  </div>;

  const result = over && showResult && reveal.showResult && !frame && <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">
    <div className="relative w-full max-w-[300px] rounded-[16px] border border-(--accent)/40 bg-[#0e1316]/95 p-5 text-center">
      <button type="button" onClick={() => setShowResult(false)} aria-label={t('viewBoard')} className="absolute right-2 top-2 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={15} /></button>
      <Trophy className="mx-auto text-(--accent)" size={30} />
      <p className={`${KICKER} mt-3`}>RESULT</p>
      <h2 className="mt-1 text-2xl font-black">{status}</h2>
      <p className="mt-2 text-xs text-white/50">{t('movesPlayed', { n: history.length })} · {tn('usedSummary', { you: RULES.charges - s.charges[1], coco: RULES.charges - s.charges[2] })}</p>
      <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2"><HomeButton block className="!rounded-md" /><button type="button" onClick={reset} className={`${BTN_ACCENT} w-full py-3`}><RotateCcw size={14} />{t('again')}</button></div>
      {frames.length > 1 && <ReplayButton onClick={() => setReplaying(true)} className="!mt-2" />}
      <button type="button" onClick={() => setShowResult(false)} className={`${BTN} mt-2 w-full py-2.5`}><Eye size={14} />{t('viewBoard')}</button>
    </div>
  </div>;

  const chips = <div className="flex items-center gap-1.5">
    {([1, 2] as Player[]).map((p) => <span key={p} className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 ${s.turn === p && !over ? 'border-(--accent)/60 bg-(--accent)/10' : 'border-white/10 bg-black/40'}`}>
      <Dot p={p} size={10} /><span className="text-[10px] font-black text-white/70">{p === 1 ? t('you') : 'COCO'}</span>
      <ChargeDiamonds left={(frame?.s ?? s).charges[p]} max={RULES.charges} color={STONE_HEX[p]} />
    </span>)}
  </div>;

  // Under the board: the charge panel (as 벽바둑 II's wall break), which turns into the two-button choice.
  const myCharges = s.charges[1];
  const panel = pending && flipAct ? <div className="mx-auto mt-3 max-w-[680px] rounded-[12px] border border-[#ffd76b]/50 bg-black/60 p-2.5 shadow-[0_0_24px_rgba(255,215,107,.15)]">
    <p className="mb-2 text-center text-[11px] font-bold text-white/60">{tn('chooseHint', { n: flipAct.flips.length })}{gap && <span className="text-[#7dffc4]"> · {t('gapHint')}</span>}</p>
    <div className="grid grid-cols-2 gap-2">
      <button ref={quietRef} type="button" disabled={!quietAct} onClick={() => quietAct && commit(quietAct)}
        className="rounded-[10px] border-2 border-white/70 bg-white/10 px-2 py-3 text-sm font-black text-white outline-none ring-(--accent) focus-visible:ring-2 disabled:opacity-30">
        {tn('quiet')}<span className="mt-0.5 block text-[10px] font-bold text-white/50">{quietAct ? tn('quietSub') : t('banned')}</span>
      </button>
      <button type="button" onClick={() => commit(flipAct)}
        className="rounded-[10px] px-2 py-3 text-sm font-black text-[#1a1200] shadow-[0_0_18px_rgba(255,215,107,.55)]" style={{ background: `linear-gradient(135deg, ${GOLD}, #ffb03b)` }}>
        <span className="inline-flex items-center gap-1"><Zap size={14} />{tn('flip', { n: flipAct.flips.length })}</span>
        <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-bold text-[#1a1200]/70">{tn('flipSub')} <ChargeDiamonds left={myCharges - 1} max={RULES.charges} color="#7a2a00" size={7} /></span>
      </button>
    </div>
  </div>
    : !over && !frame && <div className="mx-auto mt-3 flex max-w-[680px] items-center gap-3 rounded-[10px] border border-white/10 bg-black/40 p-3">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#0b0b0e]">
        <Zap size={18} className={myCharges ? 'text-[#ffd76b]' : 'text-white/20'} />
        <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0b0b0e] ${myCharges ? 'bg-[#ffd76b] shadow-[0_0_8px_rgba(255,215,107,.9)]' : 'bg-white/20'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-xs font-extrabold">{tn('panelTitle')} <ChargeDiamonds left={myCharges} max={RULES.charges} color={STONE_HEX[1]} /></p>
        <p className="text-[11px] leading-4 text-white/45">{myCharges ? tn('panelHint', { n: myCharges }) : tn('panelEmpty')}</p>
      </div>
    </div>;

  return <MyPieces seat={1}>
    <div className={SHELL} style={{ ...accentVars(FLIP_ACCENT, FLIP_INK), backgroundImage: fog('63, 184, 255') }}>
      <GameHeader ai backHref="/flip-omok" backLabel={t('title')} title={t('title')} subtitle={<span className="inline-flex items-center gap-1 rounded-full border border-[#ffd76b]/50 bg-[#ffd76b]/10 px-2 py-0.5 text-[10px] font-black text-[#ffd76b]"><FlaskConical size={10} />{tn('badge')}</span>}>
        <button type="button" onClick={toggleSound} title={tn('sound')} className={BTN}>{sound ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>
        <button type="button" onClick={undo} disabled={!history.length || aiTurn} title={t('undoTip')} className={`${BTN} disabled:opacity-35`}><Undo2 size={14} /></button>
        <button type="button" onClick={reset} title={t('newGameTip')} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          {showTutorial && !started && <div className="relative mx-auto mb-3 max-w-[680px] rounded-[12px] border border-[#ffd76b]/40 bg-[#ffd76b]/[.06] p-3 pr-8">
            <button type="button" onClick={() => setShowTutorial(false)} aria-label={tn('close')} className="absolute right-1.5 top-1.5 rounded p-1 text-white/40 hover:text-white"><X size={14} /></button>
            <p className="text-[11px] font-black text-[#ffd76b]">{tn('tutorialTitle')}</p>
            <ol className="mt-1.5 space-y-1 text-[11.5px] leading-[1.45] text-white/75">
              {(tn.raw('tutorial') as string[]).map((line, i) => <li key={line} className="flex gap-2 break-keep"><span className="font-black text-[#ffd76b]">{i + 1}</span>{line}</li>)}
            </ol>
          </div>}
          <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2 px-1">
            <div>
              <p className={KICKER}>{over ? t('resultKicker') : t('moveKicker', { n: history.length + 1 })}</p>
              <h1 className="mt-1 text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{status}</h1>
            </div>
            {chips}
          </div>
          {frame && <ReplayHeader player={replay} caption={replay.at === 0 ? tc('replayStart') : t('replayMove', { n: replay.at, name: name(frame.last !== null && frame.last >= 0 ? owner(frame.s.board[frame.last]) as Player : 1), at: frame.last !== null && frame.last >= 0 ? coordinateLabel(frame.last) : '' })} onClose={() => setReplaying(false)} />}
          {frame
            ? <NextBoard s={frame.s} last={frame.last} flips={frame.flips} flipKey={replay.at} win={replay.at === replay.total ? win : null} pending={null} ghost={1} banned={new Set()} interactive={false} onTap={() => {}} callout={null} />
            : <NextBoard s={s} last={last} flips={flips} flipKey={s.ply} win={win} pending={shownPending} ghost={1} banned={banned} interactive={!over && !aiTurn} onTap={tap} overlay={result} callout={calloutNode} />}
          {frame && <ReplayControls player={replay} onShowResult={() => { setReplaying(false); setShowResult(true); }} />}
          {panel}
          <EndRevealBanner show={reveal.revealing && !frame} text={status} color={win ? STONE_HEX[win.owner] : undefined} onSkip={reveal.skip} />
          {over && !frame && !showResult && <div className="mx-auto mt-2 flex max-w-[440px] flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => setShowResult(true)} className={`${BTN} py-2.5`}><Trophy size={14} />{tc('replayShowResult')}</button>
            <button type="button" onClick={reset} className={`${BTN_ACCENT} py-2.5`}><RotateCcw size={14} />{t('again')}</button>
          </div>}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('difficulty')}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {(['normal', 'hard'] as NextLevel[]).map((d) => <button key={d} type="button" disabled={started} onClick={() => setLevel(d)} className={`rounded-md px-2 py-2 text-xs font-black transition ${level === d ? 'bg-(--accent) text-(--accent-ink)' : 'border border-white/10 bg-white/[.03] text-white/45 hover:text-white disabled:opacity-35'}`}>{t(`levels.${d}`)}</button>)}
            </div>
            <p className="mt-2 text-[10px] leading-4 text-white/35">{started ? t('difficultyLocked') : t(`levelTips.${level}`)}</p>
          </section>
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{tn('rulesTitle')}</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">
              {(tn.raw('rules') as string[]).map((rule) => <li key={rule} className="flex gap-2.5 break-keep"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" />{rule}</li>)}
            </ul>
          </section>
          <p className="text-center text-[11px] text-white/40">{tn('prototypeNote')} <Link href="/flip-omok" className="font-bold text-(--accent) underline">{tn('liveLink')}</Link></p>
        </aside>
      </main>
    </div>
  </MyPieces>;
}

/** Whether the stone at `at` now sits in exactly five in a row (after a flip that didn't win: a dead five). */
function fiveRun(board: NState['board'], at: number, p: Player) {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  return [[0, 1], [1, 0], [1, 1], [1, -1]].some(([dr, dc]) => {
    let n = 1;
    for (const d of [1, -1]) for (let k = 1; k < 6; k++) {
      const r = r0 + dr * k * d, c = c0 + dc * k * d;
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || owner(board[r * SIZE + c]) !== p) break;
      n++;
    }
    return n === 5;
  });
}

function hasNeighbour(board: NState['board'], i: number) {
  const r = Math.floor(i / SIZE), c = i % SIZE;
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr * SIZE + cc]) return true;
  }
  return false;
}
