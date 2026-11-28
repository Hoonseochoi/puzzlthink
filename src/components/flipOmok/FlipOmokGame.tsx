"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Eye, Flag, Info, Lightbulb, RotateCcw, ShieldCheck, Trophy, Undo2, Users, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { REVEAL_MS, useEndReveal } from '@/hooks/useEndReveal';
import { EndRevealBanner } from '@/components/ui/EndReveal';
import { ReplayButton, ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import BugReport from '@/components/BugReport';
import StoneIconToggle from '@/components/StoneIconToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import HomeButton from '@/components/ui/HomeButton';
import { reportGame } from '@/lib/stats';
import { FLIP_CHARGES, FLIP_RULES_VERSION, chooseMove, coordinateLabel, emptyBoard, fullCharges, isFull, other, owner, play, type Board, type Charges, type FlipDifficulty, type FlipMove, type Line, type Player } from '@/lib/flipOmok';
import { ChargeDiamonds, Dot, FLIP_ACCENT, FLIP_INK, FlipOmokBoard, FlipPanel, STONE_HEX, flipSoundOn, setFlipSound, useFlipMoment, useFlipPicker } from './FlipOmokParts';
import GameUpdates from '@/components/GameUpdates';
import { OriginalMark } from '@/components/propositionGo/PropParts';
import { MyPieces } from '../PieceStone';

type Mode = 'ai' | 'local';
const NONE = new Set<number>();
interface Snapshot { board: Board; turn: Player; last: number | null; flipped: number[]; charges: Charges }
const RULES_SEEN_KEY = 'puzzlthink_flip_omok_rules2_seen';

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

/** The new rules in three lines, over the board until dismissed (once per browser): players of the old rules need it. */
export function RulesCard({ onClose }: { onClose?: () => void }) {
  const t = useTranslations('FlipOmok');
  return <div className="relative mx-auto mb-3 max-w-[680px] rounded-[12px] border border-[#ffd76b]/40 bg-[#ffd76b]/[.06] p-3 pr-8">
    {onClose && <button type="button" onClick={onClose} aria-label={t('close')} className="absolute right-1.5 top-1.5 rounded p-1.5 text-white/40 hover:text-white"><X size={14} /></button>}
    <p className="flex items-center gap-1 text-[11px] font-black text-[#ffd76b]"><Zap size={12} />{t('rulesCardTitle')}</p>
    <ol className="mt-1.5 space-y-1 text-[11.5px] leading-[1.45] text-white/75">
      {(t.raw('rulesCard') as string[]).map((line, i) => <li key={line} className="flex gap-2 break-keep"><span className="font-black text-[#ffd76b]">{i + 1}</span>{line}</li>)}
    </ol>
  </div>;
}

/** The sound toggle in the header (the flip moment's thump and chime). */
export function SoundToggle() {
  const t = useTranslations('FlipOmok');
  const [on, setOn] = useState(true);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- read the stored preference once on mount
  useEffect(() => { setOn(flipSoundOn()); }, []);
  return <button type="button" title={t('sound')} aria-label={t('sound')} onClick={() => { setFlipSound(!on); setOn(!on); }} className={BTN}>{on ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>;
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
  const [charges, setCharges] = useState<Charges>(fullCharges);
  const [aiAim, setAiAim] = useState<FlipMove | null>(null); // COCO's 뒤집기, shown for a beat before it lands
  const [rulesCard, setRulesCard] = useState(false);
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

  // eslint-disable-next-line react-hooks/set-state-in-effect -- the card shows until it is dismissed once in this browser
  useEffect(() => { try { setRulesCard(localStorage.getItem(RULES_SEEN_KEY) !== '1'); } catch { /* optional */ } }, []);
  const closeRulesCard = () => { setRulesCard(false); try { localStorage.setItem(RULES_SEEN_KEY, '1'); } catch { /* optional */ } };

  const apply = ({ at, flip }: FlipMove, p: Player) => {
    const res = play(board, at, p, flip);
    const nextCharges = [...charges] as Charges;
    if (flip) nextCharges[p]--;
    setHistory((h) => [...h, { board, turn, last, flipped, charges }]);
    setBoard(res.board);
    setLast(at);
    setFlipped(res.flipped);
    setCharges(nextCharges);
    setAiAim(null);
    if (res.win) setWin(res.win);
    else if (isFull(res.board)) setDraw(true);
    else setTurn(other(p));
    if ((res.win || isFull(res.board)) && mode === 'ai') {
      reportGame(`flip_omok-ai-${gameNo}-${history.length + 1}`, 'flip_omok', 'ai', !res.win ? 'draw' : res.win.owner === 1 ? 'win' : 'loss',
        { difficulty, moves: history.length + 1, rules: FLIP_RULES_VERSION, flips: FLIP_CHARGES - nextCharges[1] }, { revealDelayMs: REVEAL_MS + 300 });
    }
  };

  const picker = useFlipPicker({ board, turn, charges, active: !over && !aiTurn, onMove: (move) => apply(move, turn) });

  // COCO: think, and when it is about to flip, show the stones it is aiming at for a beat first.
  useEffect(() => {
    if (!aiTurn) return;
    let land = 0;
    const timer = window.setTimeout(() => {
      const move = chooseMove(board, 2, charges, difficulty);
      if (!move.flip) { apply(move, 2); return; }
      setAiAim(move);
      land = window.setTimeout(() => apply(move, 2), 750);
    }, difficulty === 'hard' ? 120 : 520); // 어려움 spends its own time thinking
    return () => { window.clearTimeout(timer); window.clearTimeout(land); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTurn, board]);

  const reset = (nextMode = mode) => {
    setMode(nextMode); setBoard(emptyBoard()); setTurn(1); setLast(null); setFlipped([]); setCharges(fullCharges()); setAiAim(null); picker.cancel(); setWin(null); setDraw(false); setHistory([]); setGameNo((n) => n + 1); setResigned(false); setShowResult(true); setReplaying(false);
  };

  // Against COCO, undo takes back the AI's reply too.
  const undo = () => {
    if (!history.length || aiTurn) return;
    const back = mode === 'ai' && history.length >= 2 && !(win && win.owner === 1) ? 2 : 1;
    const snap = history[history.length - back];
    setBoard(snap.board); setTurn(snap.turn); setLast(snap.last); setFlipped(snap.flipped); setCharges(snap.charges); setAiAim(null); picker.cancel(); setWin(null); setDraw(false); setResigned(false); setShowResult(true); setReplaying(false);
    setHistory((h) => h.slice(0, h.length - back));
  };

  // 기권: against COCO it counts as a loss; on one device the side to move gives up.
  const resign = () => {
    if (over || !history.length || !window.confirm(t('resignConfirm'))) return;
    setResigned(true);
    if (mode === 'ai') reportGame(`flip_omok-ai-${gameNo}-${history.length}-resign`, 'flip_omok', 'ai', 'loss', { difficulty, moves: history.length, resign: true, rules: FLIP_RULES_VERSION, flips: FLIP_CHARGES - charges[1] }, { revealDelayMs: REVEAL_MS + 300 });
  };

  // 복기: every position of this game, from the empty board to the last move.
  const frames = [...history.map((h) => ({ board: h.board, last: h.last, flipped: h.flipped, charges: h.charges })), { board, last, flipped, charges }];
  const replay = useReplayPlayer(frames.length - 1, replaying && over, 900);
  const frame = replaying && over ? frames[replay.at] : null;

  const name = (p: Player) => mode === 'ai' ? (p === 1 ? t('you') : 'COCO') : (p === 1 ? t('black') : t('white'));
  const count = (p: Player) => (frame?.board ?? board).filter((c) => owner(c) === p).length;
  const status = win ? t('wins', { name: name(win.owner) }) : resigned ? t('resigned', { name: name(mode === 'ai' ? 1 : turn) }) : draw ? t('draw')
    : aiTurn ? (aiAim ? t('aiAiming') : t('aiThinking')) : picker.held !== null ? t('choose') : t('turnOf', { name: name(turn) });
  // The flip moment for every move, the replay's included.
  const shown = frame ?? { board, last, flipped, charges };
  const callout = useFlipMoment({ board: shown.board, last: shown.last, flipped: shown.flipped, moveKey: frame ? `r${replay.at}` : `${gameNo}-${history.length}`, name });
  const preview = aiAim ? { at: aiAim.at, flips: play(board, aiAim.at, 2, true).flipped, who: 2 as Player } : picker.preview;

  // AI game: the human lost; two players on one device: someone lost.
  const lost = mode === 'ai' ? (win?.owner === 2 || resigned) : !!win || resigned;
  // The final board (and the line through the five) stays up a moment before the popup.
  const reveal = useEndReveal(over && `${gameNo}-${history.length}-${win ? 'w' : draw ? 'd' : 'r'}`);
  const result = over && showResult && reveal.showResult && !frame && <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">
    <div className="relative w-full max-w-[300px] rounded-[16px] border border-(--accent)/40 bg-[#0e1316]/95 p-5 text-center shadow-[0_0_60px_rgba(103,232,255,.25)]">
      <button type="button" onClick={() => setShowResult(false)} aria-label={t('viewBoard')} title={t('viewBoard')} className="absolute right-2 top-2 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={15} /></button>
      <Trophy className="mx-auto text-(--accent)" size={30} />
      <p className={`${KICKER} mt-3`}>RESULT</p>
      <h2 className="mt-1 text-2xl font-black">{status}</h2>
      <p className="mt-2 text-xs text-white/50">{t('movesPlayed', { n: history.length })} · {t('flipsUsed', { a: name(1), x: FLIP_CHARGES - charges[1], b: name(2), y: FLIP_CHARGES - charges[2] })}</p>
      {lost && <LossTip />}
      <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2"><HomeButton block className="!rounded-md" /><button type="button" onClick={() => reset()} className={`${BTN_ACCENT} w-full py-3`}><RotateCcw size={14} />{t('again')}</button></div>
      {frames.length > 1 && <ReplayButton onClick={() => setReplaying(true)} className="!mt-2" />}
      <button type="button" onClick={() => setShowResult(false)} className={`${BTN} mt-2 w-full py-2.5`}><Eye size={14} />{t('viewBoard')}</button>
    </div>
  </div>;

  return (
    <MyPieces seat={1}>
    <div className={SHELL} style={{ ...accentVars(FLIP_ACCENT, FLIP_INK), backgroundImage: fog('63, 184, 255') }}>
      <GameHeader ai={mode === 'ai'} backHref="/flip-omok" backLabel={t('title')} title={t('title')} subtitle={<OriginalMark size="xs" className="align-middle" />}>
        <GameUpdates game="flip_omok" /><BugReport /><StoneIconToggle /><SoundToggle /><LanguageSwitcher compact dark />
        {!over && history.length > 0 && <button type="button" title={t('resignTip')} onClick={resign} className={`${BTN} text-white/60`}><Flag size={14} /><span className="hidden sm:inline">{t('resign')}</span></button>}
        <button type="button" title={t('undoTip')} onClick={undo} disabled={!history.length || aiTurn} className={`${BTN} disabled:opacity-35`}><Undo2 size={14} /><span className="hidden sm:inline">{t('undo')}</span></button>
        <button type="button" title={t('newGameTip')} onClick={() => reset()} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          {rulesCard && !started && <RulesCard onClose={closeRulesCard} />}
          <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2 px-1 sm:mb-4 sm:px-2">
            <div>
              <p className={KICKER}>{over ? t('resultKicker') : t('moveKicker', { n: history.length + 1 })}</p>
              <h1 className="mt-1 text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{status}</h1>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-black" title={t('countTip')}>
              {([1, 2] as Player[]).map((p) => <span key={p} className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 ${turn === p && !over ? 'border-(--accent)/60 bg-(--accent)/10' : 'border-white/10 bg-black/40'}`}><Dot p={p} size={10} />{count(p)}<ChargeDiamonds left={shown.charges[p]} color={STONE_HEX[p]} /></span>)}
            </div>
          </div>

          {frame && <ReplayHeader player={replay} caption={replay.at === 0 ? tc('replayStart') : t('replayMove', { n: replay.at, name: name(owner(frame.board[frame.last ?? 0]) as Player), at: coordinateLabel(frame.last ?? 0) })} onClose={() => setReplaying(false)} />}
          {frame
            ? <FlipOmokBoard board={frame.board} last={frame.last} flipped={frame.flipped} flipKey={replay.at} win={replay.at === replay.total ? win : null} ghost={turn} interactive={false} banned={NONE} onTap={() => {}} callout={callout} />
            : <FlipOmokBoard board={board} last={last} flipped={flipped} flipKey={history.length} win={win} ghost={turn} pending={preview}
              interactive={!over && !aiTurn} banned={picker.banned} onTap={picker.tap} overlay={result} callout={callout} />}
          {frame && <ReplayControls player={replay} onShowResult={() => { setReplaying(false); setShowResult(true); }} />}
          <FlipPanel picker={picker} left={charges[turn]} color={STONE_HEX[turn]} show={!over && !frame && !aiTurn} />
          <EndRevealBanner show={reveal.revealing && !frame} text={status} color={win ? STONE_HEX[win.owner] : undefined} onSkip={reveal.skip} />
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
    </MyPieces>
  );
}
