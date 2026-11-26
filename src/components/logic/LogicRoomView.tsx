"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock3, Copy, Crown, Eye, Flag, Loader2, PaintBucket, RotateCcw, Share2, Swords, Trash2, Undo2, Users, WifiOff, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg } from '@/components/ui/gameUi';
import { useUndoKey } from '@/components/slitherlink/SlitherBoard';
import { useLogicRoom } from '@/hooks/useLogicRoom';
import { type LogicGameId, LOGIC, emptyMarks, encodeMarks, formatClock, progressOf, solved } from '@/lib/logicPuzzles';
import { maxPlayers, roomBoard } from '@/lib/logicRoom';
import { reportGame } from '@/lib/stats';
import MasyuBoard from './MasyuBoard';
import NonogramBoard, { type NonoTool } from './NonogramBoard';
import StarBoard from './StarBoard';
import BinairoBoard from './BinairoBoard';
import OneStrokeBoard from './OneStrokeBoard';
import ColorLinkBoard from './ColorLinkBoard';
import MagicSwapBoard from './MagicSwapBoard';
import MagicSwapTutorial from './MagicSwapTutorial';
import LogicRulesTip from './LogicRulesTip';

const COLORS = ['#ff4d5e', '#3f8cff', '#3fcf6a', '#ffd23f', '#e45bd6', '#ff8a2b'];

/** My work for one game (reset when the host starts a new one), with one undo entry per tap or drag. */
type Local = { sid: string; marks: number[]; moves: { gesture: number; undo: [number, number][] }[] };

/** 마슈 · 노노그램 … 친구방 / 공개방: 2–4 players (마방진 스왑 2–6) race on the same board; the first correct answer wins. */
export default function LogicRoomView({ game, code }: { game: LogicGameId; code: string }) {
  const spec = LOGIC[game];
  const t = useTranslations('LogicOnline');
  const tl = useTranslations('Logic');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const name = tc(spec.catalog);
  const max = maxPlayers(game);
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, hostOnline, me, mySeat, dispatch, rename } = useLogicRoom(game, code, defaultName);
  const [now, setNow] = useState(0);
  const [nick, setNick] = useState('');
  const [copied, setCopied] = useState(false);
  const [tool, setTool] = useState<NonoTool>('fill');
  const [confirmClear, setConfirmClear] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [local, setLocal] = useState<Local>({ sid: '', marks: [], moves: [] });
  const localRef = useRef(local);
  const undoBtn = useRef<HTMLButtonElement>(null);
  useUndoKey(() => undoBtn.current?.click());
  const [shareUrl] = useState(() => (typeof window === 'undefined' ? '' : `${window.location.origin}/${locale}${spec.path}/room/${code}`));
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 500); return () => window.clearInterval(id); }, []);

  const board = useMemo(() => (state && state.phase !== 'lobby' && state.seed ? roomBoard(state) : null), [state?.phase, state?.seed, state?.size]); // eslint-disable-line react-hooks/exhaustive-deps
  // A new game: start from an empty board.
  if (state && board && local.sid !== state.sid) {
    const fresh = { sid: state.sid, marks: emptyMarks(board), moves: [] };
    setLocal(fresh); setShowAnswer(false); setTool('fill');
  }

  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || mySeat >= state.playerCount) return;
    const won = state.winners.includes(mySeat);
    reportGame(`${game}-friend-${state.sid}`, game, 'friend', state.winners.length === 0 ? 'draw' : won ? 'win' : 'loss', {
      players: state.playerCount, size: state.size, ms: state.solvedMs[mySeat], gaveUp: state.gaveUp[mySeat],
    });
  }, [state, mySeat, game]);

  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* blocked */ } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: name, url: shareUrl }); return; } catch { return; } } copy(); };
  const shell = { ...accentVars(spec.accent, spec.ink), backgroundImage: fog(spec.fog) };

  if (!state) {
    return <div className={SHELL} style={shell}>
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref={spec.path} backLabel={name} title={name} subtitle={`ONLINE · ${code}`} />
      <main className="flex min-h-[70vh] items-center justify-center">{status === 'online' ? <Loader2 className="animate-spin" /> : <p className="flex items-center gap-2 text-sm text-white/50"><WifiOff size={15} />{t(status === 'error' ? 'connectionError' : 'connecting')}</p>}</main>
    </div>;
  }

  const playing = state.phase === 'playing';
  const iPlay = playing && mySeat !== null && mySeat < state.playerCount && state.solvedMs[mySeat] === null && !state.gaveUp[mySeat];
  const seatName = (n: number) => state.seats[n]?.name ?? t('emptySeat');
  const activeCount = state.phase === 'lobby' ? state.seats.filter(Boolean).length : state.playerCount;
  const elapsed = playing ? Math.max(0, now - state.startedAt) : 0;
  const winner = state.phase === 'finished' ? state.winners[0] ?? null : null;

  const apply = (changes: [number, number][], gesture: number, undoing = false) => {
    if (!board || !iPlay) return;
    const cur = localRef.current.sid === local.sid ? localRef.current : local;
    const real = changes.filter(([i, v]) => cur.marks[i] !== v);
    if (!real.length) return;
    const marks = [...cur.marks];
    for (const [i, v] of real) marks[i] = v;
    let moves = cur.moves;
    if (!undoing) {
      const inverse = real.map(([i]) => [i, cur.marks[i]] as [number, number]);
      const last = moves[moves.length - 1];
      moves = last && last.gesture === gesture
        ? [...moves.slice(0, -1), { gesture, undo: [...last.undo, ...inverse.filter(([i]) => !last.undo.some(([j]) => j === i))] }]
        : [...moves, { gesture, undo: inverse }];
    }
    const next = { ...cur, marks, moves };
    localRef.current = next; setLocal(next);
    if (solved(board, marks)) dispatch({ t: 'solve', answer: encodeMarks(board, marks) });
    else if (progressOf(marks, board) !== progressOf(cur.marks, board)) dispatch({ t: 'progress', n: progressOf(marks, board) });
  };
  const undo = () => {
    const cur = localRef.current.sid === local.sid ? localRef.current : local;
    const last = cur.moves[cur.moves.length - 1];
    if (!last) return;
    const popped = { ...cur, moves: cur.moves.slice(0, -1) };
    localRef.current = popped;
    apply(last.undo, -1, true);
    if (localRef.current === popped) setLocal(popped);
  };
  const clearAll = () => {
    if (!confirmClear) { setConfirmClear(true); window.setTimeout(() => setConfirmClear(false), 2500); return; }
    setConfirmClear(false);
    const base = board ? emptyMarks(board) : [];
    apply(local.marks.map((m, i) => [i, base[i] ?? 0] as [number, number]).filter(([i, v]) => local.marks[i] !== v), -2);
  };

  const heading = state.phase === 'lobby' ? t('lobbyTitle')
    : state.phase === 'finished' ? (winner === null ? t('noWinner')
      : state.solvedMs[winner] === null ? (winner === mySeat ? t('youWinForfeit') : t('winnerForfeit', { name: seatName(winner) }))
        : winner === mySeat ? t('youWin') : t('winnerIs', { name: seatName(winner) }))
      : mySeat !== null && state.gaveUp[mySeat] ? t('gaveUpWatching') : t('race');
  const marks = local.marks.length && board ? local.marks : board ? emptyMarks(board) : [];

  return <div className={SHELL} style={shell}>
    {game === 'magicswap' && <MagicSwapTutorial />}
    <GameHeader players={roomPlayers(state)} me={mySeat} backHref={spec.path} backLabel={name} title={name} subtitle={`ONLINE · 2–${max} · ${code}`}><BugReport /><LanguageSwitcher compact dark /></GameHeader>
    {!hostOnline && !me?.isHost && <p className="mx-auto mt-3 max-w-[1180px] px-4 text-xs text-[#ffb3aa]">{t('hostOffline')}</p>}
    <main className={MAIN}>
      <section className={STAGE}>
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div><p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : `${state.size}×${state.size}`}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>
          {playing && <div className="flex items-center gap-1.5"><LogicRulesTip game={game} running /><p className="flex items-center gap-1 font-mono text-sm font-bold text-white/70"><Clock3 size={14} />{formatClock(elapsed)}</p></div>}
          {state.phase === 'finished' && winner !== null && state.solvedMs[winner] !== null && <p className="font-mono text-sm font-black text-(--accent)">{formatClock(state.solvedMs[winner]!)}</p>}
        </div>

        {state.phase === 'lobby' ? <div className="mx-auto max-w-md space-y-4">
          <section className={PANEL}><p className={PANEL_TITLE}>{t('inviteTitle')}</p><InviteCode code={code} /><div className="mt-3 flex gap-2"><button onClick={copy} className={`${BTN} flex-1`}><Copy size={14} />{copied ? t('copied') : t('copy')}</button><button onClick={share} className={`${BTN_ACCENT} flex-1`}><Share2 size={14} />{t('share')}</button></div></section>
          <form onSubmit={(e) => { e.preventDefault(); rename(nick); setNick(''); }} className="flex gap-2"><input className={INPUT} value={nick} onChange={(e) => setNick(e.target.value)} placeholder={me?.name ?? ''} maxLength={16} /><button className={BTN}>{t('rename')}</button></form>
          {me?.isHost
            ? <><button disabled={activeCount < 2} onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3 disabled:opacity-35`}><Swords size={15} />{activeCount >= 2 ? t('startCount', { n: activeCount }) : t('startLocked')}</button><p className="text-center text-[11px] text-white/40">{t('startHint')}</p></>
            : <p className="text-center text-sm text-white/45">{mySeat === null ? t('roomFull', { max }) : t('waitingHost')}</p>}
        </div> : board && <>
          {board.kind === 'masyu'
            ? <MasyuBoard board={board} marks={showAnswer ? board.answer : marks} onMarks={(c, g) => apply(c, g)} readOnly={!iPlay || showAnswer} />
            : board.kind === 'nonogram'
              ? <NonogramBoard board={board} marks={marks} tool={tool} onMarks={(c, g) => apply(c, g)} readOnly={!iPlay} showAnswer={showAnswer} solvedGlow={state.phase === 'finished' && winner === mySeat} />
              : board.kind === 'starbattle'
                ? <StarBoard board={board} marks={marks} onMarks={(c, g) => apply(c, g)} readOnly={!iPlay || showAnswer} showAnswer={showAnswer} solved={state.phase === 'finished' && winner === mySeat} />
                : board.kind === 'binairo'
                  ? <BinairoBoard board={board} marks={showAnswer ? board.answer : marks} onMarks={(c, g) => apply(c, g)} readOnly={!iPlay || showAnswer} solved={showAnswer || (state.phase === 'finished' && winner === mySeat)} />
                  : board.kind === 'onestroke'
                    ? <OneStrokeBoard board={board} marks={marks} onMarks={(c, g) => apply(c, g)} readOnly={!iPlay || showAnswer} showAnswer={showAnswer} solved={state.phase === 'finished' && winner === mySeat} />
                    : board.kind === 'magicswap'
                      ? <MagicSwapBoard board={board} marks={marks} onMarks={(c, g) => apply(c, g)} readOnly={!iPlay || showAnswer} showAnswer={showAnswer} solved={state.phase === 'finished' && winner === mySeat} />
                      : <ColorLinkBoard board={board} marks={showAnswer ? board.answer : marks} onMarks={(c, g) => apply(c, g)} readOnly={!iPlay || showAnswer} solved={showAnswer || (state.phase === 'finished' && winner === mySeat)} />}
          {iPlay ? (
            <div className="mx-auto mt-3 max-w-[560px] space-y-2">
              <div className={`grid gap-1.5 ${game === 'nonogram' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                {game === 'nonogram' && <>
                  <button type="button" onClick={() => setTool('fill')} aria-pressed={tool === 'fill'} className={`flex flex-col items-center gap-1 py-2.5 ${seg(tool === 'fill')}`}><PaintBucket size={17} />{tl('toolFill')}</button>
                  <button type="button" onClick={() => setTool('cross')} aria-pressed={tool === 'cross'} className={`flex flex-col items-center gap-1 py-2.5 ${seg(tool === 'cross')}`}><X size={17} />{tl('toolCross')}</button>
                </>}
                <button ref={undoBtn} type="button" onClick={undo} disabled={!local.moves.length} title={tl('undoKey')} className={`flex flex-col items-center gap-1 py-2.5 ${seg(false)} disabled:opacity-35`}><Undo2 size={17} />{tl('toolUndo')}</button>
                <button type="button" onClick={clearAll} className={`flex flex-col items-center gap-1 py-2.5 ${confirmClear ? 'rounded-md bg-[#e5484d]/20 text-xs font-extrabold text-[#ff8f8f] ring-1 ring-[#e5484d]/50' : seg(false)}`}><Trash2 size={17} />{confirmClear ? tl('clearConfirm') : tl(game === 'magicswap' ? 'magicReset' : 'toolClear')}</button>
              </div>
              <button type="button" onClick={() => window.confirm(t('giveUpConfirm')) && dispatch({ t: 'giveUp' })} className={`w-full py-2.5 ${BTN}`}><Flag size={14} />{tl('giveUpChallenge')}</button>
              <p className="break-keep text-center text-[11px] leading-5 text-white/40">{tl(`help_${game}${game === 'nonogram' ? `_${tool}` : ''}`)}</p>
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
          <div className="mb-3 flex items-center justify-between"><p className={PANEL_TITLE}>{t('players')}</p><span className={CHIP}><Users size={12} />{activeCount}/{max}</span></div>
          {Array.from({ length: state.phase === 'lobby' ? max : state.playerCount }, (_, seat) => {
            const done = state.phase !== 'lobby' ? state.solvedMs[seat] : null;
            const out = state.phase !== 'lobby' && state.gaveUp[seat];
            return <div key={seat} data-chat-seat={state.seats[seat]?.id} className={`${playerRow(state.winners.includes(seat))} mb-2`}>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[seat] }} />
              <span className="min-w-0 flex-1 truncate text-sm font-black">{seatName(seat)}{mySeat === seat ? ` (${t('me')})` : ''}</span>
              {seat === 0 && <Crown size={12} className="text-[#f2c14e]" />}
              {state.phase !== 'lobby' && <span className="shrink-0 font-mono text-[11px] text-white/55">
                {done !== null ? <span className="flex items-center gap-1 font-black text-[#7ee2ae]"><Check size={12} />{formatClock(done)}</span> : out ? t('out') : t(spec.progress, { n: state.progress[seat] ?? 0 })}
              </span>}
            </div>;
          })}
        </section>
        {me?.isHost && state.phase !== 'playing' && <section className={PANEL}>
          <p className={PANEL_TITLE}>{t('boardSize')}</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">{spec.roomSizes.map((s) => <button key={s} onClick={() => dispatch({ t: 'config', size: s })} className={`py-2 ${seg(state.size === s)}`}>{s}×{s}</button>)}</div>
        </section>}
        <section className={NOTE}>
          <p className={PANEL_TITLE}>{t('rulesTitle')}</p>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('rules') as string[]).map((rule) => <li key={rule}>· {rule.replace('{game}', name)}</li>)}</ul>
        </section>
      </aside>
    </main>
  </div>;
}
