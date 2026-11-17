"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Eye, EyeOff, RotateCcw, ShieldQuestion, Sparkles } from 'lucide-react';
import BugReport from '@/components/BugReport';
import { reportGame } from '@/lib/stats';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import { STONE_COLORS, chooseAiMove, coordinateLabel, playableColors, findWinningLine, type GomokuDifficulty, type GomokuMove, type StoneColor, type StoneOwner, type WinningLine } from '@/lib/blindGomoku';
import BlindGomokuBoard from './BlindGomokuBoard';
import BlindStone from './BlindStone';
import { ColorPicker, ReplayBar, useReplay } from './BlindParts';
import { CoffeeNudge } from '../SupportLink';

type Phase = 'human' | 'ai' | 'finished';
const ACCENT = '#ffd166';

export default function BlindGomokuGame() {
  const t = useTranslations('BlindGomoku');
  const [moves, setMoves] = useState<GomokuMove[]>([]);
  const [phase, setPhase] = useState<Phase>('human');
  const [selectedColor, setSelectedColor] = useState<StoneColor>('red');
  const [difficulty, setDifficulty] = useState<GomokuDifficulty>('normal');
  const [colorCount, setColorCount] = useState(STONE_COLORS.length);
  const [mustChange, setMustChange] = useState(false);
  const [revealUses, setRevealUses] = useState(2);
  const [revealSeconds, setRevealSeconds] = useState(0);
  const [winner, setWinner] = useState<StoneOwner | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [gameNo, setGameNo] = useState(0);
  const replay = useReplay(moves, phase === 'finished', `${gameNo}-${phase}`);

  const finish = (nextMoves: GomokuMove[], result: StoneOwner | 'draw', line: WinningLine | null) => {
    // One record per game (the key holds the game number and length, so a rerender can't count it twice).
    reportGame(`blind_gomoku-ai-${gameNo}-${nextMoves.length}-${Date.now()}`, 'blind_gomoku', 'ai', result === 'draw' ? 'draw' : result === 'black' ? 'win' : 'loss',
      { difficulty, colors: colorCount, mustChange, moves: nextMoves.length, peeksUsed: 2 - revealUses });
    setMoves(nextMoves);
    setWinner(result);
    setWinningLine(line);
    setPhase('finished');
    setRevealSeconds(0);
  };

  const reset = () => {
    setMoves([]);
    setPhase('human');
    setSelectedColor('red');
    setRevealUses(2);
    setRevealSeconds(0);
    setWinner(null);
    setWinningLine(null);
    setGameNo((n) => n + 1);
  };

  // Colours black may use now; the picked colour falls back to the first allowed one.
  const playable = playableColors(colorCount, mustChange, moves.at(-1)?.color);
  const color = playable.includes(selectedColor) ? selectedColor : playable[0];

  const placeHuman = (row: number, col: number) => {
    if (phase !== 'human' || revealSeconds > 0 || moves.some((move) => move.row === row && move.col === col)) return;
    const move: GomokuMove = { row, col, owner: 'black', color, turn: moves.length + 1 };
    const nextMoves = [...moves, move];
    const line = findWinningLine(nextMoves, move);
    if (line) return finish(nextMoves, 'black', line);
    if (nextMoves.length === 225) return finish(nextMoves, 'draw', null);
    setMoves(nextMoves);
    setPhase('ai');
  };

  useEffect(() => {
    if (phase !== 'ai') return;
    const timer = window.setTimeout(() => {
      const position = chooseAiMove(moves, difficulty);
      const copiedColor = moves.at(-1)!.color;
      const move: GomokuMove = { ...position, owner: 'white', color: copiedColor, turn: moves.length + 1 };
      const nextMoves = [...moves, move];
      const line = findWinningLine(nextMoves, move);
      if (line) finish(nextMoves, 'white', line);
      else if (nextMoves.length === 225) finish(nextMoves, 'draw', null);
      else { setMoves(nextMoves); setPhase('human'); }
    }, 620);
    return () => window.clearTimeout(timer);
    // `moves` is the exact position handed to the AI when the phase changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (revealSeconds <= 0 || phase === 'finished') return;
    const timer = window.setInterval(() => setRevealSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [revealSeconds, phase]);

  const useReveal = () => {
    if (phase !== 'human' || revealUses <= 0 || revealSeconds > 0 || moves.length === 0) return;
    setRevealUses((uses) => uses - 1);
    setRevealSeconds(5);
  };

  const boardMoves = phase === 'finished' ? moves.slice(0, replay.step) : moves;
  const replayLine = useMemo(() => phase === 'finished' ? findWinningLine(boardMoves, boardMoves.at(-1)) : null, [phase, boardMoves]);
  const flipped = phase === 'finished' ? replay.truth : revealSeconds > 0;
  const latest = moves.at(-1);
  const status = phase === 'finished'
    ? winner === 'draw' ? t('draw') : winner === 'black' ? t('youWin') : t('aiWins')
    : revealSeconds > 0 ? t('revealing', { seconds: revealSeconds })
      : phase === 'ai' ? t('aiThinking') : t('yourTurn');

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('190, 132, 35') }}>
      <Shards />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <button type="button" onClick={() => setShowRules(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('rules')}</span></button>
        <BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div>
              <p className={KICKER}>{phase === 'finished' ? t('resultKicker') : t('turnKicker', { turn: Math.floor(moves.length / 2) + 1 })}</p>
              <h1 className="mt-1 text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{status}</h1>
            </div>
            <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${flipped ? 'border-[#ffd166]/60 bg-[#ffd166]/15 text-[#ffe6a1]' : 'border-white/10 bg-black/40 text-white/45'}`}>
              {flipped ? <Eye size={15} /> : <EyeOff size={15} />}{flipped ? t('truthVisible') : t('colorsOnly')}
            </div>
          </div>

          <BlindGomokuBoard
            moves={boardMoves}
            flipped={flipped}
            interactive={phase === 'human' && revealSeconds === 0}
            previewColor={color}
            winningLine={phase === 'finished' ? replayLine : winningLine}
            onPlace={placeHuman}
          />

          {phase === 'finished' && <><ReplayBar moves={moves} replay={replay} /><CoffeeNudge className="mt-3" /></>}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('difficulty')}</p><span className="text-[10px] font-bold text-white/35">{t(`memory.${difficulty}`)}</span></div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {(['easy', 'normal', 'hard'] as GomokuDifficulty[]).map((level) => <button key={level} type="button" disabled={moves.length > 0} onClick={() => setDifficulty(level)} className={`rounded-md px-2 py-2.5 text-xs font-black transition ${difficulty === level ? 'bg-[#ffd166] text-[#17120a] shadow-[0_0_14px_rgba(255,209,102,.32)]' : 'border border-white/10 bg-white/[.03] text-white/45 hover:text-white disabled:opacity-35'}`}>{t(`difficultyLevels.${level}`)}</button>)}
            </div>
            {moves.length > 0 && <p className="mt-2 text-[10px] leading-4 text-white/35">{t('difficultyLocked')}</p>}
          </section>

          <section className={PANEL}>
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('colorRule')}</p><span className="text-[10px] font-bold text-white/35">{t('colorCountValue', { count: colorCount })}</span></div>
            <div className="mt-3 grid grid-cols-6 gap-1.5">
              {[2, 3, 4, 5, 6, 7].map((n) => <button key={n} type="button" disabled={moves.length > 0} aria-pressed={colorCount === n} onClick={() => setColorCount(n)} className={`rounded-md py-2 font-mono text-xs font-black transition ${colorCount === n ? 'bg-[#ffd166] text-[#17120a]' : 'border border-white/10 bg-white/[.03] text-white/45 hover:text-white disabled:opacity-35'}`}>{n}</button>)}
            </div>
            <label className={`mt-3 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-3 py-2.5 text-xs font-bold ${moves.length > 0 ? 'opacity-50' : 'cursor-pointer'}`}>
              <span>{t('mustChange')}<span className="mt-0.5 block text-[10px] font-medium text-white/40">{t('mustChangeDesc')}</span></span>
              <input type="checkbox" checked={mustChange} disabled={moves.length > 0} onChange={(event) => setMustChange(event.target.checked)} className="h-4 w-4 accent-[#ffd166]" />
            </label>
            <p className="mt-2 text-[10px] leading-4 text-white/35">{t('colorRuleHint')}</p>
          </section>

          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('players')}</p>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className={`rounded-[10px] border p-3 text-center ${phase === 'human' ? 'border-[#ffd166]/55 bg-[#ffd166]/10' : 'border-white/10 bg-black/30'}`}><div className="mx-auto h-11 w-11"><BlindStone color="#ef4957" owner="black" revealed /></div><p className="mt-2 text-xs font-black">{t('you')}</p><p className="text-[10px] text-white/40">{t('blackHidden')}</p></div>
              <span className="font-mono text-[10px] font-black text-white/25">VS</span>
              <div className={`rounded-[10px] border p-3 text-center ${phase === 'ai' ? 'border-[#ffd166]/55 bg-[#ffd166]/10' : 'border-white/10 bg-black/30'}`}><div className="mx-auto h-11 w-11"><BlindStone color="#4e87ed" owner="white" revealed /></div><p className="mt-2 text-xs font-black">MIRA</p><p className="text-[10px] text-white/40">{t('whiteHidden')}</p></div>
            </div>
            {latest && <p className="mt-3 flex items-center justify-center gap-2 rounded-md bg-black/30 px-3 py-2 text-[11px] text-white/55"><Sparkles size={12} className="text-[#ffd166]" />{t('lastMove', { player: latest.owner === 'black' ? t('you') : 'MIRA', coordinate: coordinateLabel(latest.row, latest.col) })}</p>}
          </section>

          <ColorPicker selected={color} onSelect={setSelectedColor} disabled={phase !== 'human' || revealSeconds > 0} note={t('aiCopies')}
            colors={playableColors(colorCount, false)} blocked={mustChange ? moves.at(-1)?.color : null} />

          <section className="rounded-[14px] border border-[#ffd166]/30 bg-[#ffd166]/[.07] p-4">
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('handicap')}</p><span className="rounded-md border border-[#ffd166]/30 bg-black/25 px-2 py-1 font-mono text-[10px] font-black text-[#ffe39a]">{t('usesLeft', { count: revealUses })}</span></div>
            <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t('handicapDesc')}</p>
            <button type="button" onClick={useReveal} disabled={phase !== 'human' || revealUses <= 0 || revealSeconds > 0 || moves.length === 0} className={`${BTN_ACCENT} mt-3 w-full py-3`}><Eye size={15} />{revealSeconds > 0 ? t('revealingButton', { seconds: revealSeconds }) : t('revealButton')}</button>
          </section>

          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('quickRules')}</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/55">
              {[t('ruleOne'), t('ruleTwo'), t('ruleThree')].map((rule) => <li key={rule} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#ffd166]" />{rule}</li>)}
            </ul>
          </section>
        </aside>
      </main>

      {showRules && <div role="dialog" aria-modal="true" aria-labelledby="blind-rules-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowRules(false)}>
        <section className="w-full max-w-md rounded-[18px] border border-white/10 bg-[#15151a] p-6 shadow-[0_0_80px_rgba(255,209,102,.2)]" onClick={(event) => event.stopPropagation()}>
          <ShieldQuestion className="text-[#ffd166]" size={28} /><p className={KICKER + ' mt-4'}>{t('rulesKicker')}</p><h2 id="blind-rules-title" className="mt-1 text-2xl font-black text-white">{t('rulesTitle')}</h2>
          <ol className="mt-5 space-y-3">{(t.raw('fullRules') as string[]).map((rule, index) => <li key={rule} className="flex gap-3 text-sm leading-6 text-white/65"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffd166] text-[10px] font-black text-[#17120a]">{index + 1}</span><span className="break-keep">{rule}</span></li>)}</ol>
          <button type="button" onClick={() => setShowRules(false)} className={`${BTN_ACCENT} mt-6 w-full py-3`}>{t('understood')}</button>
        </section>
      </div>}
    </div>
  );
}
