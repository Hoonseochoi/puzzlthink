"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Eye, Flag, Info, Lightbulb, RotateCcw, ShieldCheck, Trophy, Undo2, Users, X } from 'lucide-react';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { ReplayButton, ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import { chooseMove, coordinateLabel, emptyBoard, forbiddenPoints, isFull, other, owner, play, type Board, type FlipDifficulty, type Line, type Player } from '@/lib/flipOmok';
import { Dot, FLIP_ACCENT, FLIP_INK, FlipOmokBoard } from './FlipOmokParts';

type Mode = 'ai' | 'local';
interface Snapshot { board: Board; turn: Player; last: number | null; flipped: number[] }

/** Tips and tooltips shared by the solo game and the friend room. */
export function FlipTips() {
  const t = useTranslations('FlipOmok');
  return <section className={PANEL}>
    <p className={`${PANEL_TITLE} flex items-center gap-1.5`}><Lightbulb size={12} className="text-(--accent)" />{t('tipsTitle')}</p>
    <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">
      {(t.raw('tips') as string[]).map((tip) => <li key={tip} className="flex gap-2.5 break-keep"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" />{tip}</li>)}
    </ul>
  </section>;
}

/** Shown in the result popup after a loss: how to stop the open three. */
export function LossTip() {
  const t = useTranslations('FlipOmok');
  return <div className="mt-3 rounded-[10px] border border-(--accent)/30 bg-(--accent)/[.07] p-3 text-left">
    <p className="flex items-center gap-1.5 text-[11px] font-black text-(--accent)"><Lightbulb size={12} />{t('lossTipTitle')}</p>
    <p className="mt-1 break-keep text-[11px] leading-[1.6] text-white/65">{t('lossTip')}</p>
  </div>;
}

/** The rule people miss: stepping between two enemy stones is safe. */
export function SafeGapCallout() {
  const t = useTranslations('FlipOmok');
  return <section className="rounded-[14px] border border-[#7dffc4]/40 bg-[#7dffc4]/[.07] p-4">
    <p className="flex items-center gap-1.5 text-[11px] font-black text-[#7dffc4]"><ShieldCheck size={14} />{t('safeTitle')}</p>
    <p className="mt-1.5 break-keep text-xs leading-5 text-white/65">{t('safeBody')}</p>
  </section>;
}

/** Legend for what's on the board: eye colours, ✕, the gold ring. */
export function FlipLegend() {
  const t = useTranslations('FlipOmok');
  return <section className={PANEL}>
    <p className={`${PANEL_TITLE} flex items-center gap-1.5`}><Info size={12} className="text-(--accent)" />{t('legendTitle')}</p>
    <ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">
      {(t.raw('legend') as string[]).map((item) => <li key={item} className="break-keep">{item}</li>)}
    </ul>
  </section>;
}

export default function FlipOmokGame() {
  const t = useTranslations('FlipOmok');
  const tc = useTranslations('Common');
  const [mode, setMode] = useState<Mode>('ai');
  const [difficulty, setDifficulty] = useState<FlipDifficulty>('normal');
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<Player>(1);
  const [last, setLast] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [win, setWin] = useState<Line | null>(null);
  const [draw, setDraw] = useState(false);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [gameNo, setGameNo] = useState(0);
  const [resigned, setResigned] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const [replaying, setReplaying] = useState(false);

  const over = !!win || draw || resigned;
  const aiTurn = mode === 'ai' && turn === 2 && !over;
  const started = history.length > 0;

  const apply = (at: number, p: Player) => {
    const res = play(board, at, p);
    setHistory((h) => [...h, { board, turn, last, flipped }]);
    setBoard(res.board);
    setLast(at);
    setFlipped(res.flipped);
    if (res.win) setWin(res.win);
    else if (isFull(res.board)) setDraw(true);
    else setTurn(other(p));
    if ((res.win || isFull(res.board)) && mode === 'ai') {
      reportGame(`flip_omok-ai-${gameNo}-${history.length + 1}`, 'flip_omok', 'ai', !res.win ? 'draw' : res.win.owner === 1 ? 'win' : 'loss',
        { difficulty, moves: history.length + 1 });
    }
  };

  const place = (at: number) => {
    if (over || aiTurn || board[at]) return;
    apply(at, turn);
  };

  useEffect(() => {
    if (!aiTurn) return;
    const timer = window.setTimeout(() => apply(chooseMove(board, 2, difficulty), 2), difficulty === 'hard' ? 120 : 520); // 어려움 spends its own time thinking
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTurn, board]);

  const reset = (nextMode = mode) => {
    setMode(nextMode); setBoard(emptyBoard()); setTurn(1); setLast(null); setFlipped([]); setWin(null); setDraw(false); setHistory([]); setGameNo((n) => n + 1); setResigned(false); setShowResult(true); setReplaying(false);
  };

  // Against COCO, undo takes back the AI's reply too.
  const undo = () => {
    if (!history.length || aiTurn) return;
    const back = mode === 'ai' && history.length >= 2 && !(win && win.owner === 1) ? 2 : 1;
    const snap = history[history.length - back];
    setBoard(snap.board); setTurn(snap.turn); setLast(snap.last); setFlipped(snap.flipped); setWin(null); setDraw(false); setResigned(false); setShowResult(true); setReplaying(false);
    setHistory((h) => h.slice(0, h.length - back));
  };

  // 기권: against COCO it counts as a loss; on one device the side to move gives up.
  const resign = () => {
    if (over || !history.length || !window.confirm(t('resignConfirm'))) return;
    setResigned(true);
    if (mode === 'ai') reportGame(`flip_omok-ai-${gameNo}-${history.length}-resign`, 'flip_omok', 'ai', 'loss', { difficulty, moves: history.length, resign: true });
  };

  // 복기: every position of this game, from the empty board to the last move.
  const frames = [...history.map((h) => ({ board: h.board, last: h.last, flipped: h.flipped })), { board, last, flipped }];
  const replay = useReplayPlayer(frames.length - 1, replaying && over, 900);
  const frame = replaying && over ? frames[replay.at] : null;

  const name = (p: Player) => mode === 'ai' ? (p === 1 ? t('you') : 'COCO') : (p === 1 ? t('black') : t('white'));
  const count = (p: Player) => board.filter((c) => owner(c) === p).length;
  const status = win ? t('wins', { name: name(win.owner) }) : resigned ? t('resigned', { name: name(mode === 'ai' ? 1 : turn) }) : draw ? t('draw') : aiTurn ? t('aiThinking') : t('turnOf', { name: name(turn) });
  // 쌍삼 points for whoever moves now (hidden while the AI thinks).
  const banned = useMemo(() => new Set(over || aiTurn ? [] : forbiddenPoints(board, turn)), [board, turn, over, aiTurn]);

  // AI game: the human lost; two players on one device: someone lost.
  const lost = mode === 'ai' ? (win?.owner === 2 || resigned) : !!win || resigned;
  const result = over && showResult && !frame && <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">
    <div className="relative w-full max-w-[300px] rounded-[16px] border border-(--accent)/40 bg-[#0e1316]/95 p-5 text-center shadow-[0_0_60px_rgba(103,232,255,.25)]">
      <button type="button" onClick={() => setShowResult(false)} aria-label={t('viewBoard')} title={t('viewBoard')} className="absolute right-2 top-2 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={15} /></button>
      <Trophy className="mx-auto text-(--accent)" size={30} />
      <p className={`${KICKER} mt-3`}>RESULT</p>
      <h2 className="mt-1 text-2xl font-black">{status}</h2>
      <p className="mt-2 text-xs text-white/50">{t('movesPlayed', { n: history.length })}</p>
      {lost && <LossTip />}
      <button type="button" onClick={() => reset()} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{t('again')}</button>
      {frames.length > 1 && <ReplayButton onClick={() => setReplaying(true)} className="!mt-2" />}
      <button type="button" onClick={() => setShowResult(false)} className={`${BTN} mt-2 w-full py-2.5`}><Eye size={14} />{t('viewBoard')}</button>
    </div>
  </div>;

  return (
    <div className={SHELL} style={{ ...accentVars(FLIP_ACCENT, FLIP_INK), backgroundImage: fog('63, 184, 255') }}>
      <GameHeader backHref="/flip-omok" backLabel={t('title')} title={t('title')} subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark />
        {!over && history.length > 0 && <button type="button" title={t('resignTip')} onClick={resign} className={`${BTN} text-white/60`}><Flag size={14} /><span className="hidden sm:inline">{t('resign')}</span></button>}
        <button type="button" title={t('undoTip')} onClick={undo} disabled={!history.length || aiTurn} className={`${BTN} disabled:opacity-35`}><Undo2 size={14} /><span className="hidden sm:inline">{t('undo')}</span></button>
        <button type="button" title={t('newGameTip')} onClick={() => reset()} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div>
              <p className={KICKER}>{over ? t('resultKicker') : t('moveKicker', { n: history.length + 1 })}</p>
              <h1 className="mt-1 text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{status}</h1>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-black" title={t('countTip')}>
              {([1, 2] as Player[]).map((p) => <span key={p} className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 ${turn === p && !over ? 'border-(--accent)/60 bg-(--accent)/10' : 'border-white/10 bg-black/40'}`}><Dot p={p} />{count(p)}</span>)}
            </div>
          </div>

          {frame && <ReplayHeader player={replay} caption={replay.at === 0 ? tc('replayStart') : t('replayMove', { n: replay.at, name: name(owner(frame.board[frame.last ?? 0]) as Player), at: coordinateLabel(frame.last ?? 0) })} onClose={() => setReplaying(false)} />}
          {frame
            ? <FlipOmokBoard board={frame.board} last={frame.last} flipped={frame.flipped} flipKey={replay.at} win={replay.at === replay.total ? win : null} turn={turn} interactive={false} banned={new Set()} onPlace={() => {}} />
            : <FlipOmokBoard board={board} last={last} flipped={flipped} flipKey={history.length} win={win} turn={turn}
              interactive={!over && !aiTurn} banned={banned} onPlace={place} overlay={result} />}
          {frame && <ReplayControls player={replay} onShowResult={() => { setReplaying(false); setShowResult(true); }} />}
          {over && !frame && !showResult && <div className="mx-auto mt-2 flex max-w-[440px] flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => setShowResult(true)} className={`${BTN} py-2.5`}><Trophy size={14} />{tc('replayShowResult')}</button>
            {frames.length > 1 && <button type="button" onClick={() => setReplaying(true)} className={`${BTN} py-2.5`}>{tc('replayOpen')}</button>}
            <button type="button" onClick={() => reset()} className={`${BTN_ACCENT} py-2.5`}><RotateCcw size={14} />{t('again')}</button>
          </div>}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('mode')}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {(['ai', 'local'] as Mode[]).map((m) => <button key={m} type="button" title={t(`modeTips.${m}`)} onClick={() => reset(m)} className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-black transition ${mode === m ? 'bg-(--accent) text-(--accent-ink)' : 'border border-white/10 bg-white/[.03] text-white/50 hover:text-white'}`}>{m === 'ai' ? <Bot size={14} /> : <Users size={14} />}{t(`modes.${m}`)}</button>)}
            </div>
            {mode === 'ai' && <>
              <p className={`${PANEL_TITLE} mt-4`}>{t('difficulty')}</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {(['normal', 'hard'] as FlipDifficulty[]).map((d) => <button key={d} type="button" title={t(`levelTips.${d}`)} disabled={started} onClick={() => setDifficulty(d)} className={`rounded-md px-2 py-2 text-xs font-black transition ${difficulty === d ? 'bg-(--accent) text-(--accent-ink)' : 'border border-white/10 bg-white/[.03] text-white/45 hover:text-white disabled:opacity-35'}`}>{t(`levels.${d}`)}</button>)}
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/35">{started ? t('difficultyLocked') : t(`levelTips.${difficulty}`)}</p>
            </>}
          </section>

          <SafeGapCallout />
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('rulesTitle')}</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">
              {(t.raw('rules') as string[]).map((rule) => <li key={rule} className="flex gap-2.5 break-keep"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" />{rule}</li>)}
            </ul>
          </section>
          <FlipLegend />
          <FlipTips />
          {last !== null && <p className="text-center text-[11px] text-white/35">{t('lastMove', { name: name(owner(board[last]) as Player), at: coordinateLabel(last) })}</p>}
        </aside>
      </main>
    </div>
  );
}
