"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Check, Clock3, Link2, RotateCcw, ShieldOff, Sparkles } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { prepareHostedRoom } from '@/hooks/useWallGoRoom';
import {
  type AiDifficulty,
  type Direction,
  type ModeId,
  type Piece,
  type PlayerId,
  applyMove,
  chooseBotAction,
  chooseBotPlacement,
  getMoveOptions,
  getTerritory,
  getWallOptions,
  getWinner,
  isOccupied,
  MODES,
  nextPlayerOf,
  noOneCanMove,
  placementOrder,
} from '@/lib/wallgo';
import LanguageSwitcher from './LanguageSwitcher';
import WallGoBoard from './WallGoBoard';
import WallGoCharacter from './WallGoCharacter';
import WallGoTutorial from './WallGoTutorial';
import Shards from './WallGoShards';
import { cinzel, FOG, PANEL, PANEL_TITLE, STEEL_TEXT } from './wallgoTheme';

const DIFFICULTIES: AiDifficulty[] = ['easy', 'normal', 'hard'];
const RECORD_KEY = 'puzzlthink_wallgo_records';
const MODE_KEY = 'puzzlthink_wallgo_mode';
type MatchRecord = { id: number; won: boolean; score: number; difficulty: AiDifficulty; date: string; mode?: ModeId };

export default function WallGoGame() {
  const t = useTranslations('WallGo');
  const to = useTranslations('WallGoOnline');
  const router = useRouter();
  const [modeId, setModeId] = useState<ModeId>('three');
  const [order, setOrder] = useState<PlayerId[]>(() => placementOrder(MODES.three, 0));
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

  const mode = MODES[modeId];
  const playerNames = [t('you'), 'MIRA', 'NOVA'];
  const canBreak = (player: PlayerId) => mode.wallBreak && breakAvailable[player];
  const piecesPerPlayer = mode.totalPieces / mode.players.length;
  // Territory only means something once every piece is on the board.
  const territory = useMemo(() => getTerritory(phase === 'placement' ? [] : pieces, walls, mode.totalPieces), [phase, pieces, walls, mode.totalPieces]);
  const allMoves = useMemo(() => phase === 'playing' && currentPlayer === 0 && turnStep === 'move' ? getMoveOptions(pieces, walls, 0, mode.wallBreak && breakAvailable[0]) : [], [phase, currentPlayer, turnStep, pieces, walls, breakAvailable, mode.wallBreak]);
  const selectedMoves = selectedPieceId ? allMoves.filter((move) => move.pieceId === selectedPieceId) : [];
  const modeRecords = records.filter((record) => (record.mode ?? 'three') === modeId);
  const games = modeRecords.length;
  const wins = modeRecords.filter((record) => record.won).length;


  const directionLabel = (direction: Direction) => t(direction);
  const addLog = (message: string) => setHistory((items) => [message, ...items].slice(0, 8));

  const saveRecord = (result: PlayerId, resultTerritory: ReturnType<typeof getTerritory>) => {
    const record: MatchRecord = { id: Date.now(), won: result === 0, score: resultTerritory.scores[0], difficulty, date: new Date().toISOString(), mode: modeId };
    setRecords((current) => {
      const next = [record, ...current].slice(0, 30);
      localStorage.setItem(RECORD_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetGame = (nextDifficulty: AiDifficulty = difficulty, nextModeId: ModeId = modeId) => {
    const nextMode = MODES[nextModeId];
    const first: PlayerId = nextModeId === 'two' ? (Math.random() < 0.5 ? 0 : 1) : 0;
    const nextOrder = placementOrder(nextMode, first);
    try { localStorage.setItem(MODE_KEY, nextModeId); } catch { /* Optional preference. */ }
    setModeId(nextModeId); setOrder(nextOrder);
    setDifficulty(nextDifficulty); setPieces(nextMode.fixedPieces); setWalls(new Set()); setPlacementIndex(0); setPhase('placement');
    setCurrentPlayer(nextOrder[0]); setTurnStep('move'); setSelectedPieceId(null); setMovedPieceId(null);
    setBreakAvailable([true, true, true]); setSeconds(90); setWinner(null);
    setHistory(nextModeId === 'two' ? [t('logDraw', { player: playerNames[first] })] : [t('logFirst')]); setTurnNumber(1);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setRecords(JSON.parse(localStorage.getItem(RECORD_KEY) || '[]')); } catch { /* Optional local history. */ }
      // ?mode= from the home screen wins over the last mode played here.
      const params = new URLSearchParams(window.location.search);
      const requested = params.get('mode');
      const wanted = requested === 'two' || requested === 'three' ? requested : localStorage.getItem(MODE_KEY);
      if (wanted === 'two') resetGame(difficulty, 'two');
      if (requested) { params.delete('mode'); window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`); }
      if (requested === 'three') try { localStorage.setItem(MODE_KEY, 'three'); } catch { /* Optional preference. */ }
      if (!localStorage.getItem('puzzlthink_wallgo_tutorial_seen')) setShowTutorial(true);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishOrAdvance = (nextPieces: Piece[], nextWalls: Set<string>, actingPlayer: PlayerId, log: string) => {
    const nextTerritory = getTerritory(nextPieces, nextWalls, mode.totalPieces);
    setPieces(nextPieces); setWalls(nextWalls); addLog(log);
    setSelectedPieceId(null); setMovedPieceId(null); setTurnStep('move'); setSeconds(90);
    if (nextTerritory.separated || noOneCanMove(nextPieces, nextWalls, mode, breakAvailable)) {
      const result = getWinner(nextTerritory, mode.players);
      setWinner(result); setPhase('finished'); saveRecord(result, nextTerritory);
      addLog(t('logWinner', { player: playerNames[result] }));
      return;
    }
    const nextPlayer = nextPlayerOf(mode, actingPlayer);
    setCurrentPlayer(nextPlayer);
    if (nextPlayer === order[0]) setTurnNumber((turn) => turn + 1);
  };

  const advancePlacement = (nextPieces: Piece[]) => {
    const nextIndex = placementIndex + 1;
    setPieces(nextPieces); setPlacementIndex(nextIndex);
    if (nextIndex >= order.length) {
      setPhase('playing'); setCurrentPlayer(order[0]); setSeconds(90); addLog(t(order[0] === 0 ? 'logPlacementDone' : 'logPlacementDoneBot'));
    } else setCurrentPlayer(order[nextIndex]);
  };

  useEffect(() => {
    if (phase !== 'placement') return;
    const player = order[placementIndex];
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
  }, [phase, placementIndex, pieces, order]);

  useEffect(() => {
    if (phase !== 'playing' || currentPlayer === 0) return;
    const timer = window.setTimeout(() => {
      const action = chooseBotAction(pieces, walls, currentPlayer, canBreak(currentPlayer), difficulty, mode);
      if (!action) {
        const next = nextPlayerOf(mode, currentPlayer);
        addLog(t('logSkipped', { player: playerNames[currentPlayer] })); setCurrentPlayer(next);
        if (next === order[0]) setTurnNumber((turn) => turn + 1);
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
  }, [phase, currentPlayer, pieces, walls, breakAvailable, difficulty, modeId]);

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
      const options = getMoveOptions(pieces, walls, 0, canBreak(0));
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

  const createRoom = (roomMode: ModeId) => router.push(`/wallgo/room/${prepareHostedRoom(roomMode)}`);

  const closeTutorial = () => { localStorage.setItem('puzzlthink_wallgo_tutorial_seen', '1'); setShowTutorial(false); };

  return <div className="relative min-h-screen overflow-hidden bg-[#0b0b0e] text-[#e6e9f0]" style={{ backgroundImage: FOG }}>
    <Shards />
    {showTutorial && <WallGoTutorial onClose={closeTutorial} />}
    <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/50 px-4 py-2 backdrop-blur md:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link><span className="h-5 w-px bg-white/15" /><div className="min-w-0"><strong className={`${cinzel.className} ${STEEL_TEXT} text-xl tracking-[0.12em]`}>WALLGO</strong><span className="ml-2 hidden text-[9px] font-bold tracking-[0.16em] text-[#ff4d5e]/70 sm:inline">{t(modeId === 'two' ? 'roundDuel' : 'roundSolo')}</span></div></div><div className="flex items-center gap-1.5"><button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button><LanguageSwitcher compact dark /><button onClick={() => resetGame()} className="flex items-center gap-2 rounded-md bg-[#e0283a] px-3 py-2 text-xs font-bold text-white shadow-[0_0_18px_rgba(224,40,58,.35)] hover:bg-[#f0354a]"><RotateCcw size={14} /><span className="hidden sm:inline">{t('playAgain')}</span></button></div></header>

    <main className="relative z-10 mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,760px)_320px] lg:px-6 lg:py-8">
      <section className="rounded-[14px] border border-white/10 bg-[#121217]/85 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur sm:p-5"><div className="mb-4 flex items-center justify-between px-1 sm:px-2"><div><p className="mb-1 font-mono text-[10px] font-bold tracking-[0.25em] text-[#ff4d5e]">TURN {String(turnNumber).padStart(2, '0')}</p><h2 className="text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{instruction}</h2></div><div className={`flex min-w-[82px] items-center justify-center gap-2 rounded-md px-3 py-2.5 font-mono text-base font-bold ${seconds <= 15 && currentPlayer === 0 && phase === 'playing' ? 'animate-pulse bg-[#e0283a] text-white shadow-[0_0_20px_rgba(224,40,58,.6)]' : 'border border-white/15 bg-black/60 text-[#c9cfdc]'}`}><Clock3 size={16} />{currentPlayer === 0 && phase === 'playing' ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : '--:--'}</div></div>
        <WallGoBoard
          pieces={pieces} walls={walls} cellOwners={territory.cellOwners} selectedPieceId={selectedPieceId} moves={selectedMoves}
          wallPieceId={turnStep === 'wall' ? movedPieceId : null} playerNames={playerNames} interactivePlayer={0}
          canPlace={phase === 'placement' && currentPlayer === 0} onCellClick={handleCellClick} onWall={placeHumanWall}
        />
        {phase !== 'finished' && !mode.wallBreak && <div className="mx-auto mt-4 flex max-w-[680px] flex-wrap items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/40 p-3"><div className="min-w-0"><p className="text-xs font-extrabold">{t('duelTitle')}</p><p className="text-[11px] text-white/45">{t('duelHint')}</p></div><span className="flex items-center gap-1.5 text-[10px] font-bold text-white/45"><i className="h-2.5 w-2.5 rotate-45 bg-[#c9cfdc]" />{t('normalMove')}</span></div>}
        {phase !== 'finished' && mode.wallBreak && <div className="mx-auto mt-4 flex max-w-[680px] flex-wrap items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/40 p-3"><div className="flex min-w-0 items-center gap-3"><div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#0b0b0e]"><ShieldOff size={18} className={breakAvailable[0] ? 'text-[#ff4d5e]' : 'text-white/20'} /><span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0b0b0e] ${breakAvailable[0] ? 'bg-[#e0283a] shadow-[0_0_8px_rgba(224,40,58,.9)]' : 'bg-white/20'}`} /></div><div className="min-w-0"><p className="text-xs font-extrabold">{t('breakTitle')}</p><p className="text-[11px] text-white/45">{t(breakAvailable[0] ? 'breakAvailableHint' : 'breakUsedHint')}</p></div></div><div className="flex items-center gap-3 text-[10px] font-bold text-white/45"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rotate-45 bg-[#c9cfdc]" />{t('normalMove')}</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rotate-45 bg-[#e0283a]" />{t('breakMove')}</span></div></div>}
      </section>

      <aside className="flex flex-col gap-4">
        <section className={PANEL}><div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60">{t(modeId === 'two' ? 'twoPlayers' : 'threePlayers')}</span></div><div className="space-y-2">{mode.players.map((player) => <div key={player} className={`flex items-center gap-3 rounded-[10px] border p-3 ${currentPlayer === player && phase !== 'finished' ? 'border-[#e0283a]/50 bg-white/[0.04] shadow-[inset_0_0_20px_rgba(224,40,58,.08)]' : 'border-transparent'}`}><WallGoCharacter player={player} className="h-10 shrink-0" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="text-sm font-extrabold">{playerNames[player]}</p>{player !== 0 && <span className="text-[9px] font-black text-white/30">AI</span>}</div><p className="text-[11px] text-white/45">{t('areaPieces', { area: territory.scores[player], pieces: pieces.filter((piece) => piece.player === player).length, total: piecesPerPlayer })}</p></div>{mode.wallBreak && <div className="text-right"><p className="text-[9px] font-bold text-white/35">{t('break')}</p><p className={`text-xs font-black ${breakAvailable[player] ? 'text-[#ff4d5e]' : 'text-white/25'}`}>{t(breakAvailable[player] ? 'ready' : 'used')}</p></div>}</div>)}</div></section>
        <section className={PANEL}><h2 className={PANEL_TITLE}>{t('mode')}</h2><div className="mt-3 grid grid-cols-2 gap-2">{(['three', 'two'] as ModeId[]).map((id) => <button key={id} onClick={() => resetGame(difficulty, id)} className={`rounded-md p-2.5 text-left transition ${modeId === id ? 'bg-[#e0283a] text-white shadow-[0_0_14px_rgba(224,40,58,.4)]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}><span className="block text-xs font-extrabold">{t(id === 'two' ? 'modeTwo' : 'modeThree')}</span><span className="mt-0.5 block text-[10px] opacity-70">{t(id === 'two' ? 'modeTwoDesc' : 'modeThreeDesc')}</span></button>)}</div></section>
        <section className="rounded-[14px] border border-[#e0283a]/40 bg-[#1a0d10]/80 p-4"><div className="flex items-center gap-2"><Link2 size={14} className="text-[#ff4d5e]" /><h2 className={PANEL_TITLE}>{to('panelTitle')}</h2></div><p className="mt-2 text-[11px] leading-5 text-white/50">{to('panelDesc')}</p><div className="mt-3 grid grid-cols-2 gap-2">{(['two', 'three'] as ModeId[]).map((id) => <button key={id} onClick={() => createRoom(id)} className="rounded-md border border-white/15 bg-white/5 p-2.5 text-xs font-extrabold text-white/85 transition hover:border-[#e0283a]/60 hover:bg-[#e0283a]/15">{to(id === 'two' ? 'createTwo' : 'createThree')}</button>)}</div></section>
        <section className={PANEL}><h2 className={PANEL_TITLE}>{t('difficulty')}</h2><div className="mt-3 grid grid-cols-3 gap-2">{DIFFICULTIES.map((level) => <button key={level} onClick={() => resetGame(level)} className={`rounded-md p-2.5 text-xs font-extrabold transition ${difficulty === level ? 'bg-[#e0283a] text-white shadow-[0_0_14px_rgba(224,40,58,.4)]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}>{t(`difficulty${level[0].toUpperCase()}${level.slice(1)}`)}</button>)}</div></section>
        <section className="rounded-[14px] border border-[#e0283a]/30 bg-black/60 p-5"><div className="mb-4 flex items-center gap-2"><Sparkles size={15} className="text-[#ff4d5e]" /><h2 className={PANEL_TITLE}>{t('howToPlay')}</h2></div><ol className="space-y-3 text-xs leading-relaxed text-white/65">{(modeId === 'two' ? ['duelRule1', 'rule1', 'rule2', 'duelRule3'] : ['rule1', 'rule2', 'rule3']).map((key, index) => <li key={key} className="flex gap-3"><span className="font-mono text-[#ff4d5e]">0{index + 1}</span><span>{t(key)}</span></li>)}</ol></section>
        <section className={`grid grid-cols-3 gap-2 ${PANEL}`}><h2 className={`col-span-3 ${PANEL_TITLE}`}>{t('record')}</h2>{games ? <><div><p className="text-[10px] text-white/35">{t('recordGames')}</p><p className="text-xl font-black">{games}</p></div><div><p className="text-[10px] text-white/35">{t('recordWins')}</p><p className="text-xl font-black text-[#ff4d5e]">{wins}</p></div><div><p className="text-[10px] text-white/35">{t('recordRate')}</p><p className="text-xl font-black">{Math.round(wins / games * 100)}%</p></div></> : <p className="col-span-3 text-xs text-white/40">{t('recordEmpty')}</p>}</section>
        <section className={`min-h-[142px] ${PANEL}`}><h2 className={`mb-3 ${PANEL_TITLE}`}>{t('matchLog')}</h2><div className="space-y-2">{history.slice(0,4).map((item,index) => <div key={`${item}-${index}`} className="flex gap-2 text-[11px] leading-relaxed text-white/55">{index === 0 ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#e0283a]" /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{item}</span></div>)}</div></section>
      </aside>
    </main>

    {phase === 'finished' && winner !== null && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-[16px] border border-white/10 bg-[#121217] p-7 text-center shadow-[0_0_80px_rgba(224,40,58,.25)]"><WallGoCharacter player={winner} className="mx-auto h-20" /><p className={`${cinzel.className} mt-5 text-xs font-bold tracking-[0.3em] text-[#ff4d5e]`}>{t('gameOver')}</p><h2 className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{winner === 0 ? t('youWin') : t('playerWins', { player: playerNames[winner] })}</h2><p className="mt-2 text-sm text-white/50">{t('finalScore', { score: territory.scores[winner], largest: territory.largest[winner] })}</p><button onClick={() => resetGame()} className="mt-6 w-full rounded-md bg-[#e0283a] py-3.5 text-sm font-extrabold text-white shadow-[0_0_20px_rgba(224,40,58,.45)] hover:bg-[#f0354a]">{t('playAgain')}</button></div></div>}
  </div>;
}
