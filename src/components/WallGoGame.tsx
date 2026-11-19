"use client";

import BugReport from '@/components/BugReport';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Check, Clock3, RotateCcw, ShieldOff, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { reportGame } from '@/lib/stats';
import { useReplayFrames, useReplayPlayer } from '@/hooks/useReplayFrames';
import {
  type AiDifficulty,
  type Direction,
  type ModeId,
  type Piece,
  type PieceKind,
  type PlayerId,
  type Variant,
  applyMove,
  chooseBotAction,
  chooseBotKind,
  chooseBotPlacement,
  kindsToPlace,
  MODES as MODES1,
  MODES2,
  modeWinners,
  getMoveOptions,
  getTerritory,
  getWallOptions,
  getBreakOptions,
  isOccupied,
  nextPlayerOf,
  noOneCanMove,
  placementOrder,
} from '@/lib/wallgo';
import LanguageSwitcher from './LanguageSwitcher';
import WallGoBoard from './WallGoBoard';
import ResultActions from './ResultActions';
import WallGoScoreStrip from './WallGoScoreStrip';
import WallGoCharacter, { WallGoVariant } from './WallGoCharacter';
import WallGoTutorial from './WallGoTutorial';
import Shards from './WallGoShards';
import { ReplayButton, ReplayControls, ReplayHeader } from './ui/ReplayBar';
import { accentVars } from './ui/gameUi';
import { cinzel, FOG, PANEL, PANEL_TITLE, STEEL_TEXT } from './wallgoTheme';

const DIFFICULTIES: AiDifficulty[] = ['easy', 'normal', 'hard'];
type MatchRecord = { id: number; won: boolean; score: number; difficulty: AiDifficulty; date: string; mode?: ModeId };

/** 벽바둑 (variant 1) and 벽바둑 II (variant 2) vs AI. II: square/round pieces, no staying put, the wall break crosses a wall on the path. */
export default function WallGoGame({ variant = 1 }: { variant?: Variant }) {
  const t = useTranslations('WallGo');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const v2 = variant === 2;
  const MODES = v2 ? MODES2 : MODES1;
  const RECORD_KEY = v2 ? 'puzzlthink_wallgo2_records' : 'puzzlthink_wallgo_records';
  const MODE_KEY = v2 ? 'puzzlthink_wallgo2_mode' : 'puzzlthink_wallgo_mode';
  const TUTORIAL_KEY = v2 ? 'puzzlthink_wallgo2_tutorial_seen' : 'puzzlthink_wallgo_tutorial_seen';
  const GAME = v2 ? 'wallgo2' : 'wallgo';
  const PATH = v2 ? '/wallgo-2' : '/wallgo';
  /** 벽바둑 II wording for keys whose rules differ ("v2" + Key). */
  const tv = (key: string) => (v2 && t.has(`v2${key[0].toUpperCase()}${key.slice(1)}`) ? t(`v2${key[0].toUpperCase()}${key.slice(1)}`) : t(key));
  const [modeId, setModeId] = useState<ModeId>('three');
  const [order, setOrder] = useState<PlayerId[]>(() => placementOrder(MODES1.three, 0));
  const [placeKind, setPlaceKind] = useState<PieceKind>('circle');
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
  const [winners, setWinners] = useState<PlayerId[]>([]); // a tie for most squares is a shared win
  const [pendingBreak, setPendingBreak] = useState<string | null>(null); // wall picked to knock down before moving
  const [history, setHistory] = useState<string[]>(() => [t('logFirst')]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [difficulty, setDifficulty] = useState<AiDifficulty>('normal');
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [gameNo, setGameNo] = useState(0); // bumps on every new game, so the replay starts over
  const [replaying, setReplaying] = useState(false);

  const mode = MODES[modeId];
  const playerNames = [t('you'), 'MIRA', 'NOVA'];
  const canBreak = (player: PlayerId) => mode.wallBreak && breakAvailable[player];
  const piecesPerPlayer = mode.totalPieces / mode.players.length;
  // Territory only means something once every piece is on the board.
  const territory = useMemo(() => getTerritory(phase === 'placement' ? [] : pieces, walls, mode.totalPieces), [phase, pieces, walls, mode.totalPieces]);
  const allMoves = useMemo(() => phase === 'playing' && currentPlayer === 0 && turnStep === 'move' ? getMoveOptions(pieces, walls, 0, mode.wallBreak && breakAvailable[0], mode.variant) : [], [phase, currentPlayer, turnStep, pieces, walls, breakAvailable, mode.wallBreak, mode.variant]);
  const selectedPiece = pieces.find((piece) => piece.id === selectedPieceId);
  // Walls next to the selected piece that it may knock down (only those that still leave a move).
  const breakOptions = !v2 && selectedPiece && canBreak(0) ? getBreakOptions(walls, selectedPiece).filter((option) => allMoves.some((move) => move.pieceId === selectedPiece.id && move.brokenWall === option.key)) : [];
  const activeBreak = breakOptions.some((option) => option.key === pendingBreak) ? pendingBreak : null;
  // 벽바둑 II: every destination of the selected piece at once; a square reachable only by breaking a wall is marked as a break move.
  const selectedMoves = !selectedPieceId ? [] : v2
    ? allMoves.filter((move) => move.pieceId === selectedPieceId)
      .sort((a, b) => Number(!!a.brokenWall) - Number(!!b.brokenWall))
      .filter((move, i, list) => list.findIndex((other) => other.to.row === move.to.row && other.to.col === move.to.col) === i)
    : allMoves.filter((move) => move.pieceId === selectedPieceId && (move.brokenWall ?? null) === activeBreak);
  const myKindsLeft = phase === 'placement' ? kindsToPlace(mode, pieces, 0) : [];
  const humanKind: PieceKind | undefined = myKindsLeft.length ? (myKindsLeft.includes(placeKind) ? placeKind : myKindsLeft[0]) : undefined;
  const modeRecords = records.filter((record) => (record.mode ?? 'three') === modeId);
  const games = modeRecords.length;
  const wins = modeRecords.filter((record) => record.won).length;


  // 복기: one snapshot per placement, move and wall (a turn's move and wall are separate steps).
  const frames = useReplayFrames(`${gameNo}`, { pieces, walls: [...walls], breaks: breakAvailable, caption: history[0] ?? '' },
    `${pieces.map((p) => `${p.id}${p.row}${p.col}`).join('')}|${[...walls].sort().join()}`);
  const replay = useReplayPlayer(Math.max(0, frames.length - 1), replaying);
  const frame = replaying ? frames[replay.at] : null;
  const shownPieces = frame?.pieces ?? pieces;
  const shownWalls = useMemo(() => (frame ? new Set(frame.walls) : walls), [frame, walls]);
  const shownTerritory = useMemo(() => (frame ? getTerritory(frame.pieces.length >= mode.totalPieces ? frame.pieces : [], shownWalls, mode.totalPieces) : territory), [frame, shownWalls, territory, mode.totalPieces]);

  const directionLabel = (direction: Direction) => t(direction);
  const addLog = (message: string) => setHistory((items) => [message, ...items].slice(0, 8));

  const saveRecord = (result: PlayerId[], resultTerritory: ReturnType<typeof getTerritory>) => {
    const record: MatchRecord = { id: Date.now(), won: result.includes(0), score: resultTerritory.scores[0], difficulty, date: new Date().toISOString(), mode: modeId };
    reportGame(`${GAME}-ai-${record.id}`, GAME, 'ai', !result.includes(0) ? 'loss' : result.length > 1 ? 'draw' : 'win', { players: MODES[modeId].players.length, difficulty, score: resultTerritory.scores[0] });
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
    setGameNo((n) => n + 1); setReplaying(false);
    setModeId(nextModeId); setOrder(nextOrder);
    setDifficulty(nextDifficulty); setPieces(nextMode.fixedPieces); setWalls(new Set()); setPlacementIndex(0); setPhase('placement');
    setCurrentPlayer(nextOrder[0]); setTurnStep('move'); setSelectedPieceId(null); setMovedPieceId(null);
    setBreakAvailable([true, true, true]); setSeconds(90); setWinner(null); setWinners([]); setPendingBreak(null);
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
      if (requested) { params.delete('mode'); window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}${window.location.hash}`); }
      if (requested === 'three') try { localStorage.setItem(MODE_KEY, 'three'); } catch { /* Optional preference. */ }
      if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishOrAdvance = (nextPieces: Piece[], nextWalls: Set<string>, actingPlayer: PlayerId, log: string) => {
    const nextTerritory = getTerritory(nextPieces, nextWalls, mode.totalPieces);
    setPieces(nextPieces); setWalls(nextWalls); addLog(log);
    setSelectedPieceId(null); setMovedPieceId(null); setTurnStep('move'); setSeconds(90); setPendingBreak(null);
    if (nextTerritory.separated || noOneCanMove(nextPieces, nextWalls, mode, breakAvailable)) {
      const result = modeWinners(nextTerritory, mode);
      setWinner(result[0]); setWinners(result); setPhase('finished'); saveRecord(result, nextTerritory);
      addLog(result.length > 1 ? t('logCoWinners', { players: result.map((p) => playerNames[p]).join(', ') }) : t('logWinner', { player: playerNames[result[0]] }));
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
      const position = chooseBotPlacement(pieces, player, difficulty, mode);
      const count = pieces.filter((piece) => piece.player === player).length;
      const kind = chooseBotKind(mode, pieces, player);
      const nextPieces: Piece[] = [...pieces, { id: `${player}-${count}`, player, ...position, ...(kind ? { kind } : {}) }];
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

  // Like the AI (and friend rooms), I skip a turn when none of my pieces can move — otherwise the game froze.
  useEffect(() => {
    if (phase !== 'playing' || currentPlayer !== 0 || turnStep !== 'move' || allMoves.length) return;
    const timer = window.setTimeout(() => {
      const next = nextPlayerOf(mode, 0);
      addLog(t('logSkipped', { player: playerNames[0] })); setCurrentPlayer(next); setSeconds(90); setSelectedPieceId(null);
      if (next === order[0]) setTurnNumber((turn) => turn + 1);
    }, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentPlayer, turnStep, allMoves]);

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
      // An automatic move only spends the one-time wall break when nothing else is possible.
      const plain = getMoveOptions(pieces, walls, 0, false, mode.variant);
      const options = plain.length ? plain : getMoveOptions(pieces, walls, 0, canBreak(0), mode.variant);
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
      const nextPieces: Piece[] = [...pieces, { id: `0-${count}`, player: 0, row, col, ...(humanKind ? { kind: humanKind } : {}) }];
      addLog(t('logPlaced', { player: playerNames[0], cell: `${String.fromCharCode(65 + col)}${row + 1}` })); advancePlacement(nextPieces); return;
    }
    if (phase !== 'playing' || currentPlayer !== 0 || turnStep !== 'move') return;
    const clickedPiece = pieces.find((piece) => piece.row === row && piece.col === col);
    const move = selectedMoves.find((option) => option.to.row === row && option.to.col === col);
    // Tapping another of my pieces selects it; tapping the selected piece again means "stay here".
    if (clickedPiece?.player === 0 && !(move && clickedPiece.id === selectedPieceId)) { setSelectedPieceId(clickedPiece.id); setPendingBreak(null); return; }
    if (!move) return;
    const moved = applyMove(pieces, walls, move);
    setPieces(moved.pieces); setWalls(moved.walls); setMovedPieceId(move.pieceId); setSelectedPieceId(null); setPendingBreak(null); setTurnStep('wall');
    if (move.brokenWall) { setBreakAvailable((available) => [false, available[1], available[2]]); addLog(t('logBreakUsed')); }
    addLog(t(move.distance === 0 ? 'logStayed' : 'logMoved'));
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
        : turnStep === 'move' ? (selectedPieceId ? t(selectedMoves.some((move) => move.distance === 0) ? 'chooseMoveStay' : 'chooseMove') : t('selectPiece')) : t('placeWall');


  const closeTutorial = () => { localStorage.setItem(TUTORIAL_KEY, '1'); setShowTutorial(false); };

  return <WallGoVariant.Provider value={variant}><div className="relative min-h-screen overflow-hidden bg-[#0b0b0e] text-[#e6e9f0]" style={{ ...accentVars('#e0283a'), backgroundImage: FOG }}>
    <Shards />
    {showTutorial && <WallGoTutorial onClose={closeTutorial} variant={variant} />}
    <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/50 px-4 py-2 backdrop-blur md:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link><span className="h-5 w-px bg-white/15" /><div className="min-w-0"><strong className={`${locale === 'ko' ? 'font-black' : cinzel.className} ${STEEL_TEXT} text-xl tracking-[0.12em]`}>{locale === 'ko' ? tc(GAME) : v2 ? 'WALLGO II' : 'WALLGO'}</strong><span className="ml-2 hidden text-[9px] font-bold tracking-[0.16em] text-[#ff4d5e]/70 sm:inline">{t(modeId === 'two' ? 'roundDuel' : 'roundSolo')}</span></div></div><div className="flex items-center gap-1.5"><button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button><BugReport /><LanguageSwitcher compact dark /><button onClick={() => resetGame()} className="flex items-center gap-2 rounded-md bg-[#e0283a] px-3 py-2 text-xs font-bold text-white shadow-[0_0_18px_rgba(224,40,58,.35)] hover:bg-[#f0354a]"><RotateCcw size={14} /><span className="hidden sm:inline">{t('playAgain')}</span></button></div></header>

    <main className="relative z-10 mx-auto grid w-full max-w-[1180px] gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,760px)_320px] lg:px-6 lg:py-8">
      <section className="rounded-[14px] border border-white/10 bg-[#121217]/85 p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur sm:p-5"><div className="mb-3 flex items-center justify-between px-1 sm:mb-4 sm:px-2"><div><p className="mb-1 font-mono text-[10px] font-bold tracking-[0.25em] text-[#ff4d5e]">TURN {String(turnNumber).padStart(2, '0')}</p><h2 className="text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{instruction}</h2></div><div className={`flex min-w-[82px] items-center justify-center gap-2 rounded-md px-3 py-2.5 font-mono text-base font-bold ${seconds <= 15 && currentPlayer === 0 && phase === 'playing' ? 'animate-pulse bg-[#e0283a] text-white shadow-[0_0_20px_rgba(224,40,58,.6)]' : 'border border-white/15 bg-black/60 text-[#c9cfdc]'}`}><Clock3 size={16} />{currentPlayer === 0 && phase === 'playing' ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : '--:--'}</div></div>
        {frame && <ReplayHeader player={replay} caption={replay.at === 0 ? tc('replayStart') : frame.caption} onClose={() => setReplaying(false)} />}
        <WallGoScoreStrip players={mode.players} current={currentPlayer} active={phase !== 'finished'} names={playerNames} scores={shownTerritory.scores} pieces={mode.players.map((p) => shownPieces.filter((piece) => piece.player === p).length)} total={piecesPerPlayer} breaks={mode.wallBreak ? (frame?.breaks ?? breakAvailable) : null} unit={t('unitTiles')} />
        {v2 && phase === 'placement' && currentPlayer === 0 && myKindsLeft.length > 0 && <KindPicker left={myKindsLeft} value={humanKind!} onChange={setPlaceKind} label={t('v2PlaceKind')} names={{ square: t('v2Square'), circle: t('v2Circle') }} />}
        {frame ? <WallGoBoard
          pieces={frame.pieces} walls={shownWalls} cellOwners={shownTerritory.cellOwners} selectedPieceId={null} moves={[]}
          wallPieceId={null} playerNames={playerNames} interactivePlayer={0}
          canPlace={false} onCellClick={() => {}} onWall={() => {}} breakOptions={[]} pendingBreak={null} onBreak={() => {}}
        /> : <WallGoBoard
          pieces={pieces} walls={walls} cellOwners={territory.cellOwners} selectedPieceId={selectedPieceId} moves={selectedMoves}
          wallPieceId={turnStep === 'wall' ? movedPieceId : null} playerNames={playerNames} interactivePlayer={0}
          canPlace={phase === 'placement' && currentPlayer === 0} onCellClick={handleCellClick} onWall={placeHumanWall}
          breakOptions={turnStep === 'move' ? breakOptions : []} pendingBreak={activeBreak}
          onBreak={(key) => setPendingBreak((current) => (current === key ? null : key))}
        />}
        {frame && <ReplayControls player={replay} onShowResult={() => setReplaying(false)} />}
        {phase !== 'finished' && !mode.wallBreak && <div className="mx-auto mt-4 flex max-w-[680px] flex-wrap items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/40 p-3"><div className="min-w-0"><p className="text-xs font-extrabold">{t('duelTitle')}</p><p className="text-[11px] text-white/45">{tv('duelHint')}</p></div><span className="flex items-center gap-1.5 text-[10px] font-bold text-white/45"><i className="h-2.5 w-2.5 rotate-45 bg-[#c9cfdc]" />{t('normalMove')}</span></div>}
        {phase !== 'finished' && mode.wallBreak && <div className="mx-auto mt-4 flex max-w-[680px] flex-wrap items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/40 p-3"><div className="flex min-w-0 items-center gap-3"><div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#0b0b0e]"><ShieldOff size={18} className={breakAvailable[0] ? 'text-[#ff4d5e]' : 'text-white/20'} /><span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0b0b0e] ${breakAvailable[0] ? 'bg-[#e0283a] shadow-[0_0_8px_rgba(224,40,58,.9)]' : 'bg-white/20'}`} /></div><div className="min-w-0"><p className="text-xs font-extrabold">{t('breakTitle')}</p><p className="text-[11px] text-white/45">{tv(breakAvailable[0] ? 'breakAvailableHint' : 'breakUsedHint')}</p></div></div><div className="flex items-center gap-3 text-[10px] font-bold text-white/45"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rotate-45 bg-[#c9cfdc]" />{t('normalMove')}</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rotate-45 bg-[#e0283a]" />{t('breakMove')}</span></div></div>}
      </section>

      <aside className="flex flex-col gap-4">
        <section className={`hidden lg:block ${PANEL}`}><div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60">{t(modeId === 'two' ? 'twoPlayers' : 'threePlayers')}</span></div><div className="space-y-2">{mode.players.map((player) => <div key={player} className={`flex items-center gap-3 rounded-[10px] border p-3 ${currentPlayer === player && phase !== 'finished' ? 'border-[#e0283a]/50 bg-white/[0.04] shadow-[inset_0_0_20px_rgba(224,40,58,.08)]' : 'border-transparent'}`}><WallGoCharacter player={player} className="h-10 shrink-0" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="text-sm font-extrabold">{playerNames[player]}</p>{player !== 0 && <span className="text-[9px] font-black text-white/30">AI</span>}</div><p className="text-[11px] text-white/45">{t('areaPieces', { area: territory.scores[player], pieces: pieces.filter((piece) => piece.player === player).length, total: piecesPerPlayer })}</p></div>{mode.wallBreak && <div className="text-right"><p className="text-[9px] font-bold text-white/35">{t('break')}</p><p className={`text-xs font-black ${breakAvailable[player] ? 'text-[#ff4d5e]' : 'text-white/25'}`}>{t(breakAvailable[player] ? 'ready' : 'used')}</p></div>}</div>)}</div></section>
        <section className={PANEL}><h2 className={PANEL_TITLE}>{t('mode')}</h2><div className="mt-3 grid grid-cols-2 gap-2">{(['three', 'two'] as ModeId[]).map((id) => <button key={id} onClick={() => resetGame(difficulty, id)} className={`rounded-md p-2.5 text-left transition ${modeId === id ? 'bg-[#e0283a] text-white shadow-[0_0_14px_rgba(224,40,58,.4)]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}><span className="block text-xs font-extrabold">{t(id === 'two' ? 'modeTwo' : 'modeThree')}</span><span className="mt-0.5 block text-[10px] opacity-70">{tv(id === 'two' ? 'modeTwoDesc' : 'modeThreeDesc')}</span></button>)}</div></section>
        <section className={PANEL}><h2 className={PANEL_TITLE}>{t('difficulty')}</h2><div className="mt-3 grid grid-cols-3 gap-2">{DIFFICULTIES.map((level) => <button key={level} onClick={() => resetGame(level)} className={`rounded-md p-2.5 text-xs font-extrabold transition ${difficulty === level ? 'bg-[#e0283a] text-white shadow-[0_0_14px_rgba(224,40,58,.4)]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}>{t(`difficulty${level[0].toUpperCase()}${level.slice(1)}`)}</button>)}</div></section>
        <section className="rounded-[14px] border border-[#e0283a]/30 bg-black/60 p-5"><div className="mb-4 flex items-center gap-2"><Sparkles size={15} className="text-[#ff4d5e]" /><h2 className={PANEL_TITLE}>{t('howToPlay')}</h2></div><ol className="space-y-3 text-xs leading-relaxed text-white/65">{(modeId === 'two' ? ['duelRule1', 'rule1', 'rule2', 'duelRule3'] : ['rule1', 'rule2', 'rule3']).map((key, index) => <li key={key} className="flex gap-3"><span className="font-mono text-[#ff4d5e]">0{index + 1}</span><span>{tv(key)}</span></li>)}</ol></section>
        <section className={`grid grid-cols-3 gap-2 ${PANEL}`}><h2 className={`col-span-3 ${PANEL_TITLE}`}>{t('record')}</h2>{games ? <><div><p className="text-[10px] text-white/35">{t('recordGames')}</p><p className="text-xl font-black">{games}</p></div><div><p className="text-[10px] text-white/35">{t('recordWins')}</p><p className="text-xl font-black text-[#ff4d5e]">{wins}</p></div><div><p className="text-[10px] text-white/35">{t('recordRate')}</p><p className="text-xl font-black">{Math.round(wins / games * 100)}%</p></div></> : <p className="col-span-3 text-xs text-white/40">{t('recordEmpty')}</p>}</section>
        <section className={`min-h-[142px] ${PANEL}`}><h2 className={`mb-3 ${PANEL_TITLE}`}>{t('matchLog')}</h2><div className="space-y-2">{history.slice(0,4).map((item,index) => <div key={`${item}-${index}`} className="flex gap-2 text-[11px] leading-relaxed text-white/55">{index === 0 ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#e0283a]" /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{item}</span></div>)}</div></section>
      </aside>
    </main>

    {phase === 'finished' && winner !== null && !replaying && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-[16px] border border-white/10 bg-[#121217] p-7 text-center shadow-[0_0_80px_rgba(224,40,58,.25)]"><div className="flex justify-center gap-2">{(winners.length ? winners : [winner]).map((p) => <WallGoCharacter key={p} player={p} className="h-20" />)}</div><p className={`${cinzel.className} mt-5 text-xs font-bold tracking-[0.3em] text-[#ff4d5e]`}>{t('gameOver')}</p><h2 className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{winners.length > 1 ? t('coWin', { players: winners.map((p) => playerNames[p]).join(' · ') }) : winner === 0 ? t('youWin') : t('playerWins', { player: playerNames[winner] })}</h2><p className="mt-2 text-sm text-white/50">{t('finalScore', { score: territory.scores[winner], largest: territory.largest[winner] })}</p>{v2 && winners.length === 1 && mode.players.filter((p) => p !== winner && territory.scores[p] === territory.scores[winner]).length > 0 && <p className="mt-1 text-[11px] font-bold text-[#ff4d5e]">{t('v2TieBreak')}</p>}{frames.length > 1 && <ReplayButton onClick={() => setReplaying(true)} />} <ResultActions onAgain={() => resetGame()} gamePath={PATH} exitPath="/" primaryClass="rounded-md bg-[#e0283a] text-white shadow-[0_0_20px_rgba(224,40,58,.45)] hover:bg-[#f0354a]" /></div></div>}
  </div></WallGoVariant.Provider>;
}

/** 벽바둑 II placement: which piece goes on the board next (square or round), while both are still in hand. */
export function KindPicker({ left, value, onChange, label, names }: { left: PieceKind[]; value: PieceKind; onChange: (kind: PieceKind) => void; label: string; names: Record<PieceKind, string> }) {
  const kinds = (['square', 'circle'] as PieceKind[]).filter((kind) => left.includes(kind));
  return <div className="mx-auto mb-3 flex max-w-[680px] items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/40 px-3 py-2"><span className="text-[11px] font-bold text-white/55">{label}</span><div className="flex gap-1.5">{kinds.map((kind) => <button key={kind} type="button" onClick={() => onChange(kind)} aria-pressed={value === kind} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-extrabold transition ${value === kind ? 'bg-[#e0283a] text-white shadow-[0_0_14px_rgba(224,40,58,.4)]' : 'border border-white/10 bg-white/[0.03] text-white/55 hover:text-white'}`}><i className={`h-3 w-3 border-2 border-current ${kind === 'circle' ? 'rounded-full' : 'rounded-[2px]'}`} />{names[kind]}</button>)}</div></div>;
}
