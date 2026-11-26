"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Bot, ChevronLeft, ChevronRight, Crosshair, RotateCcw, ShieldQuestion, Sparkles } from 'lucide-react';
import BugReport from '@/components/BugReport';
import { reportGame } from '@/lib/stats';
import { useReplayFrames, useReplayPlayer } from '@/hooks/useReplayFrames';
import { ReplayButton, ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import { LASER_MAX_TURNS } from '@/lib/laserJanggiRoom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { applyLaserAction, chooseLaserAiAction, initialLaserPieces, legalActions, type LaserAction, type LaserDifficulty, type LaserOwner, type LaserPiece as Piece, type LaserPieceType, type LaserShot } from '@/lib/laserJanggi';
import LaserBoard from './LaserBoard';
import LaserPiece from './LaserPiece';
import { LASER_CYAN } from './theme';
import GameUpdates from '@/components/GameUpdates';

export default function LaserJanggiGame() {
  const t = useTranslations('LaserJanggi');
  const tc = useTranslations('Common');
  const [pieces, setPieces] = useState<Piece[]>(initialLaserPieces);
  const [current, setCurrent] = useState<LaserOwner>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shot, setShot] = useState<LaserShot | null>(null);
  const [winner, setWinner] = useState<LaserOwner | null>(null);
  const [difficulty, setDifficulty] = useState<LaserDifficulty>('normal');
  const [busy, setBusy] = useState(false);
  const [turn, setTurn] = useState(1);
  const [showRules, setShowRules] = useState(false);
  const [draw, setDraw] = useState(false); // turn limit reached
  const [guideType, setGuideType] = useState<LaserPieceType | null>(null); // piece guide entry opened by tap
  const [gameNo, setGameNo] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const gameRef = useRef(0); // bumps on "new game" so a beam timer from the old game can't change turns

  const reset = () => {
    gameRef.current += 1; setGameNo((n) => n + 1); setReplaying(false);
    setPieces(initialLaserPieces()); setCurrent(0); setSelectedId(null); setShot(null);
    setWinner(null); setBusy(false); setTurn(1); setDraw(false);
  };

  const commit = (action: LaserAction, owner: LaserOwner) => {
    const result = applyLaserAction(pieces, owner, action);
    if (!result) return;
    setPieces(result.pieces); setShot(result.shot); setSelectedId(null); setBusy(true);
    const over = result.winner !== null || turn >= LASER_MAX_TURNS;
    if (result.winner !== null) setWinner(result.winner);
    else if (over) setDraw(true);
    if (over) {
      reportGame(`laser_janggi-ai-${gameRef.current}-${Date.now()}`, 'laser_janggi', 'ai', result.winner === null ? 'draw' : result.winner === 0 ? 'win' : 'loss',
        { difficulty, turns: turn, pieces: result.pieces.filter((item) => item.owner === 0).length });
    }
    const game = gameRef.current;
    window.setTimeout(() => {
      if (gameRef.current !== game) return;
      setBusy(false);
      if (!over) { setCurrent((1 - owner) as LaserOwner); setTurn((value) => value + 1); }
    }, 1050);
  };

  useEffect(() => {
    if (current !== 1 || busy || winner !== null || draw) return;
    const timer = window.setTimeout(() => {
      const action = chooseLaserAiAction(pieces, 1, difficulty);
      if (action) commit(action, 1);
    }, 650);
    return () => window.clearTimeout(timer);
    // The position is frozen whenever the AI receives its turn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, busy, winner, draw]);

  // 복기: the position and beam after every move or turn.
  const frames = useReplayFrames(`${gameNo}`, { pieces, shot }, pieces.map((p) => `${p.id}${p.row}${p.col}${p.direction}`).join());
  const over = winner !== null || draw;
  const replay = useReplayPlayer(Math.max(0, frames.length - 1), replaying && over, 1300);
  const frame = replaying && over ? frames[replay.at] : null;
  const shotCaption = (s: LaserShot | null) => {
    if (!s) return tc('replayStart');
    const player = s.owner === 0 ? t('replayYou') : t('replayAi');
    return s.kingHits.length ? t('replayKing', { player }) : s.captured.length ? t('replayCaptured', { player, n: s.captured.length }) : t('replayShot', { player });
  };

  const selected = pieces.find((item) => item.id === selectedId) ?? null;
  const rotations = selected ? legalActions(pieces, current).filter((action) => action.type === 'rotate' && action.pieceId === selected.id) : [];
  const rotate = (delta: -1 | 1) => {
    const action = rotations.find((item) => item.type === 'rotate' && item.delta === delta);
    if (action && current === 0 && !busy && winner === null) commit(action, 0);
  };
  const status = draw ? t('draw') : winner !== null ? (winner === 0 ? t('youWin') : t('aiWins')) : busy ? t('laserFiring') : current === 0 ? t('yourTurn') : t('aiThinking');

  return <div className={SHELL} style={{ ...accentVars(LASER_CYAN, '#041015'), backgroundImage: fog('35, 190, 220') }}>
    <Shards />
    <GameHeader ai backHref="/" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
      <button type="button" onClick={() => setShowRules(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('rules')}</span></button>
      <GameUpdates game="laser_janggi" /><BugReport /><LanguageSwitcher compact dark />
      <button type="button" onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
    </GameHeader>

    <main className={MAIN}>
      <section className={STAGE}>
        <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
          <div><p className={KICKER}>{winner !== null || draw ? t('result') : t('turn', { turn })}</p><h1 className="mt-1 text-base font-extrabold text-[#eef1f7] sm:text-xl">{status}</h1></div>
          <span className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${busy ? 'border-[#59e6ff]/60 bg-[#59e6ff]/10 text-[#a8f5ff]' : 'border-white/10 bg-black/40 text-white/45'}`}><Crosshair size={14} />{busy ? t('beamLive') : t('beamReady')}</span>
        </div>
        {frame && <ReplayHeader player={replay} caption={replay.at === 0 ? tc('replayStart') : shotCaption(frame.shot)} onClose={() => setReplaying(false)} />}
        {frame ? <LaserBoard key={`replay-${replay.at}`} pieces={frame.pieces} current={0} interactive={false} selectedId={null} shot={frame.shot} onSelect={() => {}} onMove={() => {}} /> : <LaserBoard pieces={pieces} current={current} interactive={current === 0 && !busy && winner === null && !draw} selectedId={selectedId} shot={shot} onSelect={(id) => setSelectedId((value) => value === id ? null : id)} onMove={(action) => commit(action, 0)} />}
        {frame && <ReplayControls player={replay} onShowResult={() => setReplaying(false)} />}
        {over && !frame && <div className="mx-auto mt-4 flex max-w-[440px] flex-col items-center gap-2">{frames.length > 1 && <ReplayButton onClick={() => setReplaying(true)} className="!mt-0" />}<button type="button" onClick={reset} className={`${BTN_ACCENT} px-6 py-2.5`}><RotateCcw size={14} />{t('newGame')}</button></div>}
        {selected && current === 0 && !busy && winner === null && <div className="mx-auto mt-3 flex max-w-[700px] items-center justify-between rounded-[10px] border border-[#59e6ff]/20 bg-black/50 px-3 py-2">
          <div className="flex items-center gap-2"><div className="h-9 w-9"><LaserPiece piece={selected} /></div><span className="min-w-0"><span className="block text-xs font-bold text-white/70">{t(`pieces.${selected.type}.name`)}</span><span className="block text-[10px] leading-4 text-white/45">{t(`pieces.${selected.type}.tip`)}</span></span></div>
          <div className="flex gap-2"><button type="button" onClick={() => rotate(-1)} disabled={!rotations.some((a) => a.type === 'rotate' && a.delta === -1)} className={BTN}><ChevronLeft size={15} />{t('rotateLeft')}</button><button type="button" onClick={() => rotate(1)} disabled={!rotations.some((a) => a.type === 'rotate' && a.delta === 1)} className={BTN}>{t('rotateRight')}<ChevronRight size={15} /></button></div>
        </div>}
      </section>

      <aside className="flex flex-col gap-4">
        <section className={PANEL}><div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('difficulty')}</p><Bot size={14} className="text-[#59e6ff]" /></div><div className="mt-3 grid grid-cols-3 gap-1.5">{(['easy','normal','hard'] as LaserDifficulty[]).map((level) => <button key={level} type="button" disabled={turn > 1} onClick={() => setDifficulty(level)} className={`py-2.5 ${seg(difficulty === level)} disabled:opacity-40`}>{t(`difficultyLevels.${level}`)}</button>)}</div><p className="mt-2 text-[10px] leading-4 text-white/35">{t(`difficultyTips.${difficulty}`)}</p></section>

        <section className={PANEL}><p className={PANEL_TITLE}>{t('selectedPiece')}</p>{selected ? <div className="mt-3 flex items-center gap-3"><div className="h-14 w-14"><LaserPiece piece={selected} selected /></div><div><p className="font-black">{t(`pieces.${selected.type}.name`)}</p><p className="mt-1 text-xs leading-5 text-white/50">{t(`pieces.${selected.type}.tip`)}</p></div></div> : <p className="mt-3 text-xs leading-5 text-white/45">{t('selectHint')}</p>}</section>

        <section className={PANEL}><p className={PANEL_TITLE}>{t('pieceGuide')}</p><div className="mt-3 grid grid-cols-5 gap-1">{(['laser','splitter','king','triangle','square'] as const).map((type) => { const example = pieces.find((item) => item.type === type) ?? { id: `guide-${type}`, owner: 0 as const, type, row: 0, col: 0, direction: 0 as const }; return <button key={type} type="button" aria-pressed={guideType === type} onClick={() => setGuideType((value) => value === type ? null : type)} className={`rounded-md border p-1 transition ${guideType === type ? 'border-[#59e6ff]/70 bg-[#59e6ff]/10' : 'border-white/5 bg-black/25 hover:border-white/20'}`}><LaserPiece piece={example} label={t(`pieces.${type}.name`)} /></button>; })}</div>{guideType ? <p className="mt-2 rounded-md border border-white/10 bg-black/40 p-2 text-[11px] leading-5 text-white/65"><b className="block text-white">{t(`pieces.${guideType}.name`)}</b>{t(`pieces.${guideType}.tip`)}</p> : <p className="mt-2 text-[10px] text-white/35">{t('tooltipHint')}</p>}</section>

        <section className="rounded-[14px] border border-[#59e6ff]/25 bg-[#59e6ff]/[.05] p-4"><p className={PANEL_TITLE}>{t('quickRules')}</p><ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/55">{(['quick1','quick2','quick3','quick4'] as const).map((key, i) => <li key={key} className="flex gap-2.5"><span className="font-mono text-[#59e6ff]">0{i + 1}</span><span>{t(key)}</span></li>)}</ol></section>
        <section className={PANEL}><div className="flex items-center gap-2 text-xs text-white/55"><Sparkles size={14} className="text-[#ffd166]" />{t('fairPlay')}</div></section>
      </aside>
    </main>

    {showRules && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur" onClick={() => setShowRules(false)}><section className="max-h-[86vh] w-full max-w-lg overflow-auto rounded-[18px] border border-[#59e6ff]/20 bg-[#0b1017] p-6" onClick={(event) => event.stopPropagation()}><ShieldQuestion size={28} className="text-[#59e6ff]" /><p className={`${KICKER} mt-4`}>{t('rulesKicker')}</p><h2 className="mt-1 text-2xl font-black">{t('rulesTitle')}</h2><ol className="mt-5 space-y-3">{(t.raw('fullRules') as string[]).map((rule, i) => <li key={rule} className="flex gap-3 text-sm leading-6 text-white/65"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#59e6ff] text-[10px] font-black text-[#041015]">{i + 1}</span><span>{rule}</span></li>)}</ol><button type="button" onClick={() => setShowRules(false)} className={`${BTN_ACCENT} mt-6 w-full py-3`}>{t('understood')}</button></section></div>}
  </div>;
}
