"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock3, Copy, Crown, Eraser, Eye, Flag, Lightbulb, Loader2, PenLine, RotateCcw, Share2, Swords, Trash2, Undo2, Users, WifiOff, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg } from '@/components/ui/gameUi';
import { useSlitherRoom } from '@/hooks/useSlitherRoom';
import { type Mark, formatClock, hintEdges, isSolved, loopOrder } from '@/lib/slitherlink';
import { ROOM_SIZES, roomPuzzle } from '@/lib/slitherRoom';
import { reportGame } from '@/lib/stats';
import GameUpdates from '@/components/GameUpdates';
import SlitherBoard, { SLITHER_ACCENT, SLITHER_INK, type Tool, undoOf, useUndoKey } from './SlitherBoard';

const COLORS = ['#8f7cff', '#ff6b8a', '#4ac9ff', '#8ce06b'];
const ROOM_HINTS = 1;

/** My lines for one game (reset when the host starts a new one). */
type Local = { sid: string; marks: Mark[]; locked: number[]; hints: number; undo: [number, Mark][][] };

/** 슬리더링크 친구방: 2–4 players race on the same board; the first correct loop wins. */
export default function SlitherRoomView({ code }: { code: string }) {
  const t = useTranslations('SlitherOnline');
  const ts = useTranslations('Slitherlink');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, hostOnline, me, mySeat, dispatch, rename } = useSlitherRoom(code, defaultName);
  const [now, setNow] = useState(0);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [confirmClear, setConfirmClear] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [local, setLocal] = useState<Local>({ sid: '', marks: [], locked: [], hints: 0, undo: [] });
  const localRef = useRef(local);
  // Ctrl/⌘+Z presses the 되돌리기 button (a disabled button ignores it).
  const undoBtn = useRef<HTMLButtonElement>(null);
  useUndoKey(() => undoBtn.current?.click());
  const [shareUrl] = useState(() => (typeof window === 'undefined' ? '' : `${window.location.origin}/${locale}/slitherlink/room/${code}`));
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 500); return () => window.clearInterval(id); }, []);

  const puzzle = useMemo(() => (state && state.phase !== 'lobby' && state.seed ? roomPuzzle(state) : null), [state?.phase, state?.seed, state?.dots]); // eslint-disable-line react-hooks/exhaustive-deps
  // A new game: start from an empty board.
  if (state && puzzle && local.sid !== state.sid) {
    const fresh = { sid: state.sid, marks: new Array<Mark>(puzzle.solution.length).fill(0), locked: [], hints: 0, undo: [] };
    setLocal(fresh); setShowAnswer(false); setTool('pen');
  }

  // Results go on the record (open rooms also count for the open ranking).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || mySeat >= state.playerCount) return;
    const won = state.winners.includes(mySeat);
    reportGame(`slitherlink-friend-${state.sid}`, 'slitherlink', 'friend', state.winners.length === 0 ? 'draw' : won ? 'win' : 'loss', {
      players: state.playerCount, size: state.dots, ms: state.solvedMs[mySeat], gaveUp: state.gaveUp[mySeat],
    });
  }, [state, mySeat]);

  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* blocked */ } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: ts('title'), url: shareUrl }); return; } catch { return; } } copy(); };

  if (!state) {
    return <div className={SHELL} style={accentVars(SLITHER_ACCENT, SLITHER_INK)}>
      <GameHeader backHref="/slitherlink" backLabel={tc('slitherlink')} title={ts('title')} subtitle={`ONLINE · ${code}`} />
      <main className="flex min-h-[70vh] items-center justify-center">{status === 'online' ? <Loader2 className="animate-spin" /> : <p className="flex items-center gap-2 text-sm text-white/50"><WifiOff size={15} />{t(status === 'error' ? 'connectionError' : 'connecting')}</p>}</main>
    </div>;
  }

  const playing = state.phase === 'playing';
  const iPlay = playing && mySeat !== null && mySeat < state.playerCount && state.solvedMs[mySeat] === null && !state.gaveUp[mySeat];
  const seatName = (n: number) => state.seats[n]?.name ?? t('emptySeat');
  const activeCount = state.phase === 'lobby' ? state.seats.filter(Boolean).length : state.playerCount;
  const lockedSet = new Set(local.locked);
  const elapsed = playing ? Math.max(0, now - state.startedAt) : 0;

  const apply = (changes: [number, Mark][], hint = false, undoing = false) => {
    if (!puzzle || !iPlay) return;
    // Several pointer moves can land before a re-render: build on the newest marks of this game.
    const cur = localRef.current.sid === local.sid ? localRef.current : local;
    const marks = [...cur.marks];
    for (const [e, v] of changes) marks[e] = v;
    const undo = undoing ? cur.undo.slice(0, -1) : hint ? cur.undo : [...cur.undo, undoOf(cur.marks, changes)];
    const next = { ...cur, marks, undo, locked: hint ? [...cur.locked, ...changes.map(([e]) => e)] : cur.locked, hints: cur.hints + (hint ? 1 : 0) };
    localRef.current = next; setLocal(next);
    const lines = marks.filter((m) => m === 1).length;
    if (isSolved(puzzle, marks)) dispatch({ t: 'solve', edges: marks.flatMap((m, e) => (m === 1 ? [e] : [])) });
    else if (lines !== cur.marks.filter((m) => m === 1).length) dispatch({ t: 'progress', lines });
  };
  const takeHint = (r: number, c: number) => {
    if (!puzzle || local.hints >= ROOM_HINTS) return;
    setTool('pen');
    apply(hintEdges(puzzle, r, c).map((e) => [e, puzzle.solution[e] ? 1 : 2] as [number, Mark]), true);
  };
  /** 되돌리기: steps back one move (edges a hint fixed stay). */
  const undo = () => {
    const cur = localRef.current.sid === local.sid ? localRef.current : local;
    const last = cur.undo[cur.undo.length - 1];
    if (!last) return;
    apply(last.filter(([e]) => !cur.locked.includes(e)), false, true);
  };
  const clearAll = () => {
    if (!confirmClear) { setConfirmClear(true); window.setTimeout(() => setConfirmClear(false), 2500); return; }
    setConfirmClear(false);
    const changes = local.marks.map((m, e) => [e, 0] as [number, Mark]).filter(([e]) => local.marks[e] !== 0 && !lockedSet.has(e));
    if (changes.length) apply(changes);
  };

  const winner = state.phase === 'finished' ? state.winners[0] ?? null : null;
  const heading = state.phase === 'lobby' ? t('lobbyTitle')
    : state.phase === 'finished' ? (winner === null ? t('noWinner')
      : state.solvedMs[winner] === null ? (winner === mySeat ? t('youWinForfeit') : t('winnerForfeit', { name: seatName(winner) }))
        : winner === mySeat ? t('youWin') : t('winnerIs', { name: seatName(winner) }))
      : mySeat !== null && state.gaveUp[mySeat] ? t('gaveUpWatching') : t('race');
  const tools: [Tool, typeof PenLine, string][] = [['pen', PenLine, ts('toolPen')], ['eraser', Eraser, ts('toolEraser')], ['marker', X, ts('toolMarker')]];

  return <div className={SHELL} style={{ ...accentVars(SLITHER_ACCENT, SLITHER_INK), backgroundImage: fog('120, 100, 220') }}>
    
    <GameHeader backHref="/slitherlink" backLabel={tc('slitherlink')} title={ts('title')} subtitle={`ONLINE · 2–4 · ${code}`}><GameUpdates game="slitherlink" /><BugReport /><LanguageSwitcher compact dark /></GameHeader>
    {!hostOnline && !me?.isHost && <p className="mx-auto mt-3 max-w-[1180px] px-4 text-xs text-[#ffb3aa]">{t('hostOffline')}</p>}
    <main className={MAIN}>
      <section className={STAGE}>
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div><p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : `${state.dots}×${state.dots}`}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>
          {playing && <p className="flex items-center gap-1 font-mono text-sm font-bold text-white/70"><Clock3 size={14} />{formatClock(elapsed)}</p>}
          {state.phase === 'finished' && winner !== null && state.solvedMs[winner] !== null && <p className="font-mono text-sm font-black text-(--accent)">{formatClock(state.solvedMs[winner]!)}</p>}
        </div>

        {state.phase === 'lobby' ? <div className="mx-auto max-w-md space-y-4">
          <section className={PANEL}><p className={PANEL_TITLE}>{t('inviteTitle')}</p><InviteCode code={code} /><div className="mt-3 flex gap-2"><button onClick={copy} className={`${BTN} flex-1`}><Copy size={14} />{copied ? t('copied') : t('copy')}</button><button onClick={share} className={`${BTN_ACCENT} flex-1`}><Share2 size={14} />{t('share')}</button></div></section>
          <form onSubmit={(e) => { e.preventDefault(); rename(name); setName(''); }} className="flex gap-2"><input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder={me?.name ?? ''} maxLength={16} /><button className={BTN}>{t('rename')}</button></form>
          {me?.isHost
            ? <><button disabled={activeCount < 2} onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3 disabled:opacity-35`}><Swords size={15} />{activeCount >= 2 ? t('startCount', { n: activeCount }) : t('startLocked')}</button><p className="text-center text-[11px] text-white/40">{t('startHint')}</p></>
            : <p className="text-center text-sm text-white/45">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
        </div> : puzzle && <>
          <SlitherBoard
            puzzle={puzzle} marks={local.marks.length ? local.marks : new Array<Mark>(puzzle.solution.length).fill(0)} locked={lockedSet} tool={tool}
            readOnly={!iPlay} onEdges={(changes) => apply(changes)} onHint={takeHint}
            dimLines={showAnswer} solutionUpTo={showAnswer ? loopOrder(puzzle) : null}
          />
          {iPlay ? (
            <div className="mx-auto mt-3 max-w-[560px] space-y-2">
              <div className="grid grid-cols-5 gap-1.5">
                {tools.map(([id, Icon, label]) => <button key={id} type="button" onClick={() => setTool(id)} aria-pressed={tool === id} className={`flex flex-col items-center gap-1 py-2.5 ${seg(tool === id)}`}><Icon size={17} />{label}</button>)}
                <button ref={undoBtn} type="button" onClick={undo} disabled={!local.undo.length} title={ts('undoKey')} className={`flex flex-col items-center gap-1 py-2.5 ${seg(false)} disabled:opacity-35`}><Undo2 size={17} />{ts('toolUndo')}</button>
                <button type="button" onClick={clearAll} className={`flex flex-col items-center gap-1 py-2.5 ${confirmClear ? 'rounded-md bg-[#e5484d]/20 text-xs font-extrabold text-[#ff8f8f] ring-1 ring-[#e5484d]/50' : seg(false)}`}><Trash2 size={17} />{confirmClear ? ts('clearConfirm') : ts('toolClear')}</button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" disabled={local.hints >= ROOM_HINTS} onClick={() => setTool(tool === 'hint' ? 'pen' : 'hint')} className={`py-2.5 ${tool === 'hint' ? BTN_ACCENT : BTN} disabled:opacity-40`}><Lightbulb size={14} />{tool === 'hint' ? ts('hintPick') : ts('hintsLeft', { n: ROOM_HINTS - local.hints })}</button>
                <button type="button" onClick={() => window.confirm(t('giveUpConfirm')) && dispatch({ t: 'giveUp' })} className={`py-2.5 ${BTN}`}><Flag size={14} />{ts('giveUpChallenge')}</button>
              </div>
              <p className="text-center text-[11px] text-white/40">{tool === 'hint' ? ts('hintHelp') : ts(`help_${tool}`)}</p>
            </div>
          ) : state.phase === 'finished' ? (
            <div className="mx-auto mt-4 max-w-md space-y-2 text-center">
              <button type="button" onClick={() => setShowAnswer((v) => !v)} className={`${BTN} w-full py-2.5`}><Eye size={14} />{showAnswer ? t('hideAnswer') : t('showAnswer')}</button>
              {me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3`}><RotateCcw size={14} />{t('rematch')}</button> : <p className="text-xs text-white/45">{t('rematchWait')}</p>}
            </div>
          ) : <p className="mt-3 text-center text-xs text-white/45">{t('watching')}</p>}
        </>}
      </section>

      <aside className="flex flex-col gap-4">
        <section className={PANEL}>
          <div className="mb-3 flex items-center justify-between"><p className={PANEL_TITLE}>{t('players')}</p><span className={CHIP}><Users size={12} />{activeCount}/4</span></div>
          {Array.from({ length: state.phase === 'lobby' ? 4 : state.playerCount }, (_, seat) => {
            const solved = state.phase !== 'lobby' ? state.solvedMs[seat] : null;
            const out = state.phase !== 'lobby' && state.gaveUp[seat];
            return <div key={seat} data-chat-seat={state.seats[seat]?.id} className={`${playerRow(state.winners.includes(seat))} mb-2`}>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[seat] }} />
              <span className="min-w-0 flex-1 truncate text-sm font-black">{seatName(seat)}{mySeat === seat ? ` (${t('me')})` : ''}</span>
              {seat === 0 && <Crown size={12} className="text-[#f2c14e]" />}
              {state.phase !== 'lobby' && <span className="shrink-0 font-mono text-[11px] text-white/55">
                {solved !== null ? <span className="flex items-center gap-1 font-black text-[#7ee2ae]"><Check size={12} />{formatClock(solved)}</span> : out ? t('out') : t('linesN', { n: state.lines[seat] ?? 0 })}
              </span>}
            </div>;
          })}
        </section>
        {me?.isHost && state.phase !== 'playing' && <section className={PANEL}>
          <p className={PANEL_TITLE}>{t('boardSize')}</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">{ROOM_SIZES.map((d) => <button key={d} onClick={() => dispatch({ t: 'config', dots: d })} className={`py-2 ${seg(state.dots === d)}`}>{d}×{d}</button>)}</div>
          <p className="mt-2 text-[11px] text-white/40">{t('boardSizeHint')}</p>
        </section>}
        <section className={NOTE}>
          <p className={PANEL_TITLE}>{t('rulesTitle')}</p>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('rules') as string[]).map((rule) => <li key={rule}>· {rule}</li>)}</ul>
        </section>
      </aside>
    </main>
  </div>;
}
