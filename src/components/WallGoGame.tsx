"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Check, Clock3, RotateCcw, ShieldOff, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import {
  BOARD_SIZE,
  type AiDifficulty,
  type Direction,
  type Piece,
  type PlayerId,
  applyMove,
  chooseBotAction,
  chooseBotPlacement,
  getMoveOptions,
  getTerritory,
  getWallOptions,
  getWinner,
  hasWall,
  isOccupied,
  positionKey,
} from '@/lib/wallgo';
import LanguageSwitcher from './LanguageSwitcher';
import WallGoCharacter from './WallGoCharacter';
import WallGoTutorial from './WallGoTutorial';

const PLACEMENT_ORDER: PlayerId[] = [0, 1, 2, 2, 1, 0];
const DIFFICULTIES: AiDifficulty[] = ['easy', 'normal', 'hard'];
const RECORD_KEY = 'puzzlthink_wallgo_records';
type MatchRecord = { id: number; won: boolean; score: number; difficulty: AiDifficulty; date: string };

export default function WallGoGame() {
  const t = useTranslations('WallGo');
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [placementIndex, setPlacementIndex] = useState(0);
  const [phase, setPhase] = useState<'placement' | 'playing' | 'finished'>('placement');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(0);
  const [turnStep, setTurnStep] = useState<'move' | 'wall'>('move');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [movedPieceId, setMovedPieceId] = useState<string | null>(null);
  const [breakAvailable, setBreakAvailable] = useState<[boolean, boolean, boolean]>([true, true, true]);
  const [seconds, setSeconds] = useState(90);
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [history, setHistory] = useState<string[]>(() => [t('logFirst')]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [difficulty, setDifficulty] = useState<AiDifficulty>('normal');
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);

  const playerNames = [t('you'), 'MIRA', 'NOVA'];
  const territory = useMemo(() => getTerritory(pieces, walls), [pieces, walls]);
  const allMoves = useMemo(() => phase === 'playing' && currentPlayer === 0 && turnStep === 'move' ? getMoveOptions(pieces, walls, 0, breakAvailable[0]) : [], [phase, currentPlayer, turnStep, pieces, walls, breakAvailable]);
  const selectedMoves = selectedPieceId ? allMoves.filter((move) => move.pieceId === selectedPieceId) : [];
  const games = records.length;
  const wins = records.filter((record) => record.won).length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setRecords(JSON.parse(localStorage.getItem(RECORD_KEY) || '[]')); } catch { /* Optional local history. */ }
      if (!localStorage.getItem('puzzlthink_wallgo_tutorial_seen')) setShowTutorial(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const directionLabel = (direction: Direction) => t(direction);
  const addLog = (message: string) => setHistory((items) => [message, ...items].slice(0, 8));

  const saveRecord = (result: PlayerId, resultTerritory: ReturnType<typeof getTerritory>) => {
    const record: MatchRecord = { id: Date.now(), won: result === 0, score: resultTerritory.scores[0], difficulty, date: new Date().toISOString() };
    setRecords((current) => {
      const next = [record, ...current].slice(0, 30);
      localStorage.setItem(RECORD_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetGame = (nextDifficulty: AiDifficulty = difficulty) => {
    setDifficulty(nextDifficulty); setPieces([]); setWalls(new Set()); setPlacementIndex(0); setPhase('placement');
    setCurrentPlayer(0); setTurnStep('move'); setSelectedPieceId(null); setMovedPieceId(null);
    setBreakAvailable([true, true, true]); setSeconds(90); setWinner(null);
    setHistory([t('logFirst')]); setTurnNumber(1);
  };

  const finishOrAdvance = (nextPieces: Piece[], nextWalls: Set<string>, actingPlayer: PlayerId, log: string) => {
    const nextTerritory = getTerritory(nextPieces, nextWalls);
    setPieces(nextPieces); setWalls(nextWalls); addLog(log);
    setSelectedPieceId(null); setMovedPieceId(null); setTurnStep('move'); setSeconds(90);
    if (nextTerritory.separated) {
      const result = getWinner(nextTerritory);
      setWinner(result); setPhase('finished'); saveRecord(result, nextTerritory);
      addLog(t('logWinner', { player: playerNames[result] }));
      return;
    }
    const nextPlayer = ((actingPlayer + 1) % 3) as PlayerId;
    setCurrentPlayer(nextPlayer);
    if (nextPlayer === 0) setTurnNumber((turn) => turn + 1);
  };

  const advancePlacement = (nextPieces: Piece[]) => {
    const nextIndex = placementIndex + 1;
    setPieces(nextPieces); setPlacementIndex(nextIndex);
    if (nextIndex >= PLACEMENT_ORDER.length) {
      setPhase('playing'); setCurrentPlayer(0); setSeconds(90); addLog(t('logPlacementDone'));
    } else setCurrentPlayer(PLACEMENT_ORDER[nextIndex]);
  };

  useEffect(() => {
    if (phase !== 'placement') return;
    const player = PLACEMENT_ORDER[placementIndex];
    if (player === 0) return;
    const timer = window.setTimeout(() => {
      const position = chooseBotPlacement(pieces, player);
      const count = pieces.filter((piece) => piece.player === player).length;
      const nextPieces = [...pieces, { id: `${player}-${count}`, player, ...position }];
      addLog(t('logPlaced', { player: playerNames[player], cell: `${String.fromCharCode(65 + position.col)}${position.row + 1}` }));
      advancePlacement(nextPieces);
    }, difficulty === 'easy' ? 380 : 560);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, placementIndex, pieces]);

  useEffect(() => {
    if (phase !== 'playing' || currentPlayer === 0) return;
    const timer = window.setTimeout(() => {
      const action = chooseBotAction(pieces, walls, currentPlayer, breakAvailable[currentPlayer], difficulty);
      if (!action) {
        const next = ((currentPlayer + 1) % 3) as PlayerId;
        addLog(t('logSkipped', { player: playerNames[currentPlayer] })); setCurrentPlayer(next);
        if (next === 0) setTurnNumber((turn) => turn + 1);
        return;
      }
      if (action.move.brokenWall) setBreakAvailable((available) => { const next = [...available] as [boolean, boolean, boolean]; next[currentPlayer] = false; return next; });
      finishOrAdvance(action.pieces, action.walls, currentPlayer, t('logBotTurn', {
        player: playerNames[currentPlayer], breakText: action.move.brokenWall ? t('logBroke') : '',
        cell: `${String.fromCharCode(65 + action.move.to.col)}${action.move.to.row + 1}`, direction: directionLabel(action.direction),
      }));
    }, difficulty === 'easy' ? 420 : difficulty === 'hard' ? 900 : 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentPlayer, pieces, walls, breakAvailable, difficulty]);

  useEffect(() => {
    if (phase !== 'playing' || currentPlayer !== 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase, currentPlayer]);

  useEffect(() => {
    if (seconds !== 0 || phase !== 'playing' || currentPlayer !== 0) return;
    const timer = window.setTimeout(() => {
      if (turnStep === 'wall' && movedPieceId) {
        const options = getWallOptions(pieces, walls, movedPieceId);
        const wall = options[Math.floor(Math.random() * options.length)];
        if (wall) finishOrAdvance(pieces, new Set(walls).add(wall.key), 0, t('logTimeoutWall'));
        return;
      }
      const options = getMoveOptions(pieces, walls, 0, breakAvailable[0]);
      const move = options[Math.floor(Math.random() * options.length)];
      if (!move) return;
      const moved = applyMove(pieces, walls, move);
      const wallOptions = getWallOptions(moved.pieces, moved.walls, move.pieceId);
      const wall = wallOptions[Math.floor(Math.random() * wallOptions.length)];
      if (!wall) return;
      if (move.brokenWall) setBreakAvailable((available) => [false, available[1], available[2]]);
      finishOrAdvance(moved.pieces, new Set(moved.walls).add(wall.key), 0, t('logTimeoutTurn'));
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const handleCellClick = (row: number, col: number) => {
    if (phase === 'placement' && currentPlayer === 0) {
      if (isOccupied(pieces, { row, col })) return;
      const count = pieces.filter((piece) => piece.player === 0).length;
      const nextPieces: Piece[] = [...pieces, { id: `0-${count}`, player: 0, row, col }];
      addLog(t('logPlaced', { player: playerNames[0], cell: `${String.fromCharCode(65 + col)}${row + 1}` })); advancePlacement(nextPieces); return;
    }
    if (phase !== 'playing' || currentPlayer !== 0 || turnStep !== 'move') return;
    const clickedPiece = pieces.find((piece) => piece.row === row && piece.col === col);
    if (clickedPiece?.player === 0) { setSelectedPieceId(clickedPiece.id); return; }
    const move = selectedMoves.find((option) => option.to.row === row && option.to.col === col);
    if (!move) return;
    const moved = applyMove(pieces, walls, move);
    setPieces(moved.pieces); setWalls(moved.walls); setMovedPieceId(move.pieceId); setSelectedPieceId(null); setTurnStep('wall');
    if (move.brokenWall) { setBreakAvailable((available) => [false, available[1], available[2]]); addLog(t('logBreakUsed')); }
    else addLog(t('logMoved'));
  };

  const placeHumanWall = (direction: Direction) => {
    if (phase !== 'playing' || currentPlayer !== 0 || turnStep !== 'wall' || !movedPieceId) return;
    const option = getWallOptions(pieces, walls, movedPieceId).find((item) => item.direction === direction);
    if (!option) return;
    const movedPiece = pieces.find((piece) => piece.id === movedPieceId)!;
    finishOrAdvance(pieces, new Set(walls).add(option.key), 0, t('logWall', { cell: `${String.fromCharCode(65 + movedPiece.col)}${movedPiece.row + 1}`, direction: directionLabel(direction) }));
  };

  const instruction = phase === 'finished' ? (winner === 0 ? t('youWin') : t('playerWins', { player: playerNames[winner ?? 1] }))
    : phase === 'placement' ? (currentPlayer === 0 ? t('placement') : t('placing', { player: playerNames[currentPlayer] }))
      : currentPlayer !== 0 ? t('thinking', { player: playerNames[currentPlayer] })
        : turnStep === 'move' ? (selectedPieceId ? t('chooseMove') : t('selectPiece')) : t('placeWall');

  const closeTutorial = () => { localStorage.setItem('puzzlthink_wallgo_tutorial_seen', '1'); setShowTutorial(false); };

  return <div className="min-h-screen bg-[#f3f0e8] text-[#17201e]">
    {showTutorial && <WallGoTutorial onClose={closeTutorial} />}
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-black/10 bg-[#f8f6ef]/90 px-4 py-2 backdrop-blur md:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link><span className="h-5 w-px bg-black/10" /><div className="min-w-0"><strong className="text-lg tracking-[-0.04em]">WALLGO</strong><span className="ml-2 hidden text-[9px] font-bold tracking-[0.16em] text-black/35 sm:inline">{t('roundSolo')}</span></div></div><div className="flex items-center gap-1.5"><button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button><LanguageSwitcher compact /><button onClick={() => resetGame()} className="flex items-center gap-2 rounded-full bg-[#17201e] px-3 py-2 text-xs font-bold text-white"><RotateCcw size={14} /><span className="hidden sm:inline">{t('playAgain')}</span></button></div></header>

    <main className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,760px)_320px] lg:px-6 lg:py-8">
      <section className="rounded-[28px] border border-black/10 bg-[#e8e2d5] p-3 shadow-[0_24px_70px_rgba(33,42,39,0.12)] sm:p-5"><div className="mb-4 flex items-center justify-between px-1 sm:px-2"><div><p className="mb-1 text-[10px] font-black tracking-[0.2em] text-black/35">TURN {String(turnNumber).padStart(2, '0')}</p><h1 className="text-base font-extrabold tracking-tight sm:text-xl">{instruction}</h1></div><div className={`flex min-w-[82px] items-center justify-center gap-2 rounded-2xl px-3 py-2.5 font-mono text-base font-bold text-white ${seconds <= 15 ? 'bg-[#ff6b4a]' : 'bg-[#17201e]'}`}><Clock3 size={16} />{currentPlayer === 0 && phase === 'playing' ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : '--:--'}</div></div>
        <div className="relative mx-auto aspect-square w-full max-w-[680px] rounded-[22px] bg-[#181f1d] p-2.5 shadow-[0_18px_36px_rgba(16,23,21,0.24)] sm:p-4"><div className="relative grid h-full w-full grid-cols-7 grid-rows-7 overflow-hidden rounded-[12px] bg-[#fbfaf5]">{Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
          const row = Math.floor(index / BOARD_SIZE), col = index % BOARD_SIZE, position = { row, col };
          const piece = pieces.find((item) => item.row === row && item.col === col);
          const selected = piece?.id === selectedPieceId, move = selectedMoves.find((item) => item.to.row === row && item.to.col === col), moved = piece?.id === movedPieceId;
          const territoryOwner = territory.cellOwners[positionKey(position)];
          const canPlace = phase === 'placement' && currentPlayer === 0 && !piece;
          const topWall = row > 0 && hasWall(walls, position, { row: row - 1, col }), leftWall = col > 0 && hasWall(walls, position, { row, col: col - 1 });
          return <div key={positionKey(position)} role="button" tabIndex={canPlace || move || piece?.player === 0 ? 0 : -1} aria-label={`${String.fromCharCode(65 + col)}${row + 1}`} onClick={() => handleCellClick(row, col)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') handleCellClick(row, col); }} className={`group relative flex items-center justify-center border-b border-r border-[#d9d5ca] transition-colors ${canPlace ? 'cursor-pointer hover:bg-[#fff0eb]' : ''} ${move ? move.brokenWall ? 'cursor-pointer bg-[#ff6b4a]/15' : 'cursor-pointer bg-[#fff4d8]' : ''} ${selected ? 'bg-black/[0.04]' : ''}`}>
            {territoryOwner !== null && territoryOwner !== undefined && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundColor: ['rgba(255, 107, 74, 0.09)', 'rgba(75, 123, 255, 0.09)', 'rgba(18, 165, 148, 0.09)'][territoryOwner] }} />}
            {topWall && <span className="pointer-events-none absolute -top-[3px] left-[-2px] right-[-2px] z-20 h-[6px] rounded-full bg-[#1a211f]" />}{leftWall && <span className="pointer-events-none absolute -left-[3px] bottom-[-2px] top-[-2px] z-20 w-[6px] rounded-full bg-[#1a211f]" />}
            {move && <span className={`absolute z-0 h-4 w-4 rounded-full border-[3px] shadow-md sm:h-5 sm:w-5 ${move.brokenWall ? 'border-white bg-[#ff6b4a] before:absolute before:-inset-2 before:animate-ping before:rounded-full before:border before:border-[#ff6b4a]' : 'border-white bg-[#d3a62f]'}`} />}
            {canPlace && <span className="h-2 w-2 rounded-full bg-black/10 transition group-hover:scale-150 group-hover:bg-[#ff6b4a]" />}
            {piece && <WallGoCharacter player={piece.player} selected={selected} label={playerNames[piece.player]} className="z-10 h-[58%]" />}
            {moved && turnStep === 'wall' && getWallOptions(pieces, walls, movedPieceId!).map((option) => { const placement: Record<Direction,string> = { up: '-top-1 left-1/2 h-3 w-10 -translate-x-1/2', right: '-right-1 top-1/2 h-10 w-3 -translate-y-1/2', down: '-bottom-1 left-1/2 h-3 w-10 -translate-x-1/2', left: '-left-1 top-1/2 h-10 w-3 -translate-y-1/2' }; return <button key={option.direction} aria-label={`${directionLabel(option.direction)} wall`} onClick={(event) => { event.stopPropagation(); placeHumanWall(option.direction); }} className={`absolute z-30 rounded-full bg-[#f2c14e] shadow-[0_0_0_3px_white,0_4px_12px_rgba(0,0,0,.28)] transition hover:scale-110 ${placement[option.direction]}`} />; })}
          </div>;
        })}</div></div>
        {phase !== 'finished' && <div className="mx-auto mt-4 flex max-w-[680px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#f8f6ef] p-3"><div className="flex min-w-0 items-center gap-3"><div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"><ShieldOff size={18} className={breakAvailable[0] ? 'text-[#ff6b4a]' : 'text-black/25'} /><span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${breakAvailable[0] ? 'bg-[#ff6b4a]' : 'bg-black/20'}`} /></div><div className="min-w-0"><p className="text-xs font-extrabold">{t('breakTitle')}</p><p className="text-[11px] text-black/45">{t(breakAvailable[0] ? 'breakAvailableHint' : 'breakUsedHint')}</p></div></div><div className="flex items-center gap-3 text-[10px] font-bold text-black/45"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#d3a62f] ring-2 ring-white" />{t('normalMove')}</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ff6b4a] ring-2 ring-white" />{t('breakMove')}</span></div></div>}
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-[24px] border border-black/10 bg-[#f8f6ef] p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-black tracking-[0.14em] text-black/40">{t('players')}</h2><span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-bold">{t('threePlayers')}</span></div><div className="space-y-2">{([0,1,2] as PlayerId[]).map((player) => <div key={player} className={`flex items-center gap-3 rounded-2xl border p-3 ${currentPlayer === player && phase !== 'finished' ? 'border-black/20 bg-white shadow-sm' : 'border-transparent'}`}><WallGoCharacter player={player} className="h-10 shrink-0" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="text-sm font-extrabold">{playerNames[player]}</p>{player !== 0 && <span className="text-[9px] font-black text-black/30">AI</span>}</div><p className="text-[11px] text-black/45">{t('areaPieces', { area: territory.scores[player], pieces: pieces.filter((piece) => piece.player === player).length })}</p></div><div className="text-right"><p className="text-[9px] font-bold text-black/35">{t('break')}</p><p className={`text-xs font-black ${breakAvailable[player] ? 'text-[#15937f]' : 'text-black/25'}`}>{t(breakAvailable[player] ? 'ready' : 'used')}</p></div></div>)}</div></section>
        <section className="rounded-[24px] border border-black/10 bg-[#f8f6ef] p-4"><h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-black/35">{t('difficulty')}</h2><div className="mt-3 grid grid-cols-3 gap-2">{DIFFICULTIES.map((level) => <button key={level} onClick={() => resetGame(level)} className={`rounded-xl p-2.5 text-xs font-extrabold ${difficulty === level ? 'bg-[#17201e] text-white' : 'bg-white text-black/50'}`}>{t(`difficulty${level[0].toUpperCase()}${level.slice(1)}`)}</button>)}</div></section>
        <section className="rounded-[24px] bg-[#17201e] p-5 text-white"><div className="mb-4 flex items-center gap-2"><Sparkles size={15} className="text-[#f2c14e]" /><h2 className="text-xs font-black tracking-[0.14em] text-white/55">{t('howToPlay')}</h2></div><ol className="space-y-3 text-xs leading-relaxed text-white/65">{[1,2,3].map((number) => <li key={number} className="flex gap-3"><span className="font-mono text-[#f2c14e]">0{number}</span><span>{t(`rule${number}`)}</span></li>)}</ol></section>
        <section className="grid grid-cols-3 gap-2 rounded-[24px] border border-black/10 bg-[#f8f6ef] p-4"><h2 className="col-span-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/35">{t('record')}</h2>{games ? <><div><p className="text-[10px] text-black/35">{t('recordGames')}</p><p className="text-xl font-black">{games}</p></div><div><p className="text-[10px] text-black/35">{t('recordWins')}</p><p className="text-xl font-black">{wins}</p></div><div><p className="text-[10px] text-black/35">{t('recordRate')}</p><p className="text-xl font-black">{Math.round(wins / games * 100)}%</p></div></> : <p className="col-span-3 text-xs text-black/40">{t('recordEmpty')}</p>}</section>
        <section className="min-h-[142px] rounded-[24px] border border-black/10 bg-[#f8f6ef] p-4"><h2 className="mb-3 text-xs font-black tracking-[0.14em] text-black/40">{t('matchLog')}</h2><div className="space-y-2">{history.slice(0,4).map((item,index) => <div key={`${item}-${index}`} className="flex gap-2 text-[11px] leading-relaxed text-black/55">{index === 0 ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b4a]" /> : <Check size={11} className="mt-0.5 shrink-0 text-black/25" />}<span>{item}</span></div>)}</div></section>
      </aside>
    </main>

    {phase === 'finished' && winner !== null && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201e]/70 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-[30px] bg-[#f8f6ef] p-7 text-center shadow-2xl"><WallGoCharacter player={winner} className="mx-auto h-20" /><p className="mt-5 text-[10px] font-black tracking-[0.22em] text-black/35">{t('gameOver')}</p><h2 className="mt-1 text-3xl font-black tracking-tight">{winner === 0 ? t('youWin') : t('playerWins', { player: playerNames[winner] })}</h2><p className="mt-2 text-sm text-black/50">{t('finalScore', { score: territory.scores[winner], largest: territory.largest[winner] })}</p><button onClick={() => resetGame()} className="mt-6 w-full rounded-2xl bg-[#17201e] py-3.5 text-sm font-extrabold text-white">{t('playAgain')}</button></div></div>}
  </div>;
}
