"use client";

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  BOARD_SIZE,
  DIRECTION_LABELS,
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
import { ArrowLeft, Bot, Check, Clock3, RotateCcw, ShieldOff, Sparkles, UserRound } from 'lucide-react';

const PLACEMENT_ORDER: PlayerId[] = [0, 1, 2, 2, 1, 0];
const PLAYER_NAMES = ['나', 'MIRA', 'NOVA'];
const PLAYER_COLORS = ['#ff6b4a', '#4b7bff', '#12a594'];
const PLAYER_BG = ['#fff0eb', '#edf2ff', '#e8faf6'];

function pieceLabel(piece: Piece) {
  const index = Number(piece.id.split('-')[1] ?? 0) + 1;
  return `${piece.player === 0 ? 'Y' : piece.player === 1 ? 'M' : 'N'}${index}`;
}

export default function WallGoGame() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [placementIndex, setPlacementIndex] = useState(0);
  const [phase, setPhase] = useState<'placement' | 'playing' | 'finished'>('placement');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(0);
  const [turnStep, setTurnStep] = useState<'move' | 'wall'>('move');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [movedPieceId, setMovedPieceId] = useState<string | null>(null);
  const [breakMode, setBreakMode] = useState(false);
  const [breakAvailable, setBreakAvailable] = useState<[boolean, boolean, boolean]>([true, true, true]);
  const [seconds, setSeconds] = useState(90);
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [history, setHistory] = useState<string[]>(['원하는 칸에 Y1을 놓아주세요.']);
  const [turnNumber, setTurnNumber] = useState(1);

  const territory = useMemo(() => getTerritory(pieces, walls), [pieces, walls]);
  const allMoves = useMemo(
    () => phase === 'playing' && currentPlayer === 0 && turnStep === 'move'
      ? getMoveOptions(pieces, walls, 0, breakAvailable[0])
      : [],
    [phase, currentPlayer, turnStep, pieces, walls, breakAvailable],
  );
  const visibleMoves = allMoves.filter((move) => breakMode ? Boolean(move.brokenWall) : !move.brokenWall);
  const selectedMoves = selectedPieceId ? visibleMoves.filter((move) => move.pieceId === selectedPieceId) : [];

  const addLog = (message: string) => setHistory((items) => [message, ...items].slice(0, 8));

  const resetGame = () => {
    setPieces([]); setWalls(new Set()); setPlacementIndex(0); setPhase('placement');
    setCurrentPlayer(0); setTurnStep('move'); setSelectedPieceId(null); setMovedPieceId(null);
    setBreakMode(false); setBreakAvailable([true, true, true]); setSeconds(90); setWinner(null);
    setHistory(['원하는 칸에 Y1을 놓아주세요.']); setTurnNumber(1);
  };

  const finishOrAdvance = (nextPieces: Piece[], nextWalls: Set<string>, actingPlayer: PlayerId, log: string) => {
    const nextTerritory = getTerritory(nextPieces, nextWalls);
    setPieces(nextPieces); setWalls(nextWalls); addLog(log);
    setSelectedPieceId(null); setMovedPieceId(null); setBreakMode(false); setTurnStep('move'); setSeconds(90);
    if (nextTerritory.separated) {
      const result = getWinner(nextTerritory);
      setWinner(result); setPhase('finished');
      addLog(`${PLAYER_NAMES[result]}의 영역이 가장 넓습니다. 게임 종료!`);
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
      setPhase('playing'); setCurrentPlayer(0); setSeconds(90);
      addLog('배치 완료. 내 차례입니다. 말을 이동하세요.');
    } else {
      setCurrentPlayer(PLACEMENT_ORDER[nextIndex]);
    }
  };

  useEffect(() => {
    if (phase !== 'placement') return;
    const player = PLACEMENT_ORDER[placementIndex];
    if (player === 0) return;
    const timer = window.setTimeout(() => {
      const position = chooseBotPlacement(pieces, player);
      const count = pieces.filter((piece) => piece.player === player).length;
      const nextPieces = [...pieces, { id: `${player}-${count}`, player, ...position }];
      addLog(`${PLAYER_NAMES[player]}가 ${String.fromCharCode(65 + position.col)}${position.row + 1}에 말을 놓았습니다.`);
      advancePlacement(nextPieces);
    }, 520);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, placementIndex, pieces]);

  useEffect(() => {
    if (phase !== 'playing' || currentPlayer === 0) return;
    const timer = window.setTimeout(() => {
      const action = chooseBotAction(pieces, walls, currentPlayer, breakAvailable[currentPlayer]);
      if (!action) {
        const next = ((currentPlayer + 1) % 3) as PlayerId;
        addLog(`${PLAYER_NAMES[currentPlayer]}가 움직일 수 없어 차례를 넘겼습니다.`);
        setCurrentPlayer(next);
        if (next === 0) setTurnNumber((turn) => turn + 1);
        return;
      }
      if (action.move.brokenWall) {
        setBreakAvailable((available) => {
          const next = [...available] as [boolean, boolean, boolean];
          next[currentPlayer] = false;
          return next;
        });
      }
      const target = `${String.fromCharCode(65 + action.move.to.col)}${action.move.to.row + 1}`;
      finishOrAdvance(action.pieces, action.walls, currentPlayer,
        `${PLAYER_NAMES[currentPlayer]}가 ${action.move.brokenWall ? '벽을 부수고 ' : ''}${target}로 이동해 ${DIRECTION_LABELS[action.direction]}에 벽을 세웠습니다.`,
      );
    }, 760);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentPlayer, pieces, walls, breakAvailable]);

  useEffect(() => {
    if (phase !== 'playing' || currentPlayer !== 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase, currentPlayer]);

  useEffect(() => {
    if (seconds !== 0 || phase !== 'playing' || currentPlayer !== 0) return;
    if (turnStep === 'wall' && movedPieceId) {
      const wallOptions = getWallOptions(pieces, walls, movedPieceId);
      const wall = wallOptions[Math.floor(Math.random() * wallOptions.length)];
      if (!wall) return;
      finishOrAdvance(pieces, new Set(walls).add(wall.key), 0, '시간이 끝나 가능한 면에 벽이 자동으로 설치되었습니다.');
      return;
    }
    const options = getMoveOptions(pieces, walls, 0, breakAvailable[0]);
    const move = options[Math.floor(Math.random() * options.length)];
    if (!move) return;
    const moved = applyMove(pieces, walls, move);
    const wallOptions = getWallOptions(moved.pieces, moved.walls, move.pieceId);
    const wall = wallOptions[Math.floor(Math.random() * wallOptions.length)];
    if (!wall) return;
    const nextWalls = new Set(moved.walls).add(wall.key);
    if (move.brokenWall) setBreakAvailable((available) => [false, available[1], available[2]]);
    finishOrAdvance(moved.pieces, nextWalls, 0, '시간이 끝나 가능한 행동이 자동으로 처리되었습니다.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const handleCellClick = (row: number, col: number) => {
    if (phase === 'placement' && currentPlayer === 0) {
      if (isOccupied(pieces, { row, col })) return;
      const count = pieces.filter((piece) => piece.player === 0).length;
      const nextPieces: Piece[] = [...pieces, { id: `0-${count}`, player: 0, row, col }];
      addLog(`내 말 Y${count + 1}을 ${String.fromCharCode(65 + col)}${row + 1}에 놓았습니다.`);
      advancePlacement(nextPieces);
      return;
    }
    if (phase !== 'playing' || currentPlayer !== 0 || turnStep !== 'move') return;
    const clickedPiece = pieces.find((piece) => piece.row === row && piece.col === col);
    if (clickedPiece?.player === 0) { setSelectedPieceId(clickedPiece.id); return; }
    const move = selectedMoves.find((option) => option.to.row === row && option.to.col === col);
    if (!move) return;
    const moved = applyMove(pieces, walls, move);
    setPieces(moved.pieces); setWalls(moved.walls); setMovedPieceId(move.pieceId);
    setSelectedPieceId(null); setTurnStep('wall');
    if (move.brokenWall) {
      setBreakAvailable((available) => [false, available[1], available[2]]);
      addLog('벽 부수기를 사용해 이동했습니다. 이제 벽을 세우세요.');
    } else addLog('말을 이동했습니다. 이동한 말의 한 면에 벽을 세우세요.');
  };

  const placeHumanWall = (direction: Direction) => {
    if (phase !== 'playing' || currentPlayer !== 0 || turnStep !== 'wall' || !movedPieceId) return;
    const option = getWallOptions(pieces, walls, movedPieceId).find((item) => item.direction === direction);
    if (!option) return;
    const movedPiece = pieces.find((piece) => piece.id === movedPieceId)!;
    const nextWalls = new Set(walls).add(option.key);
    const target = `${String.fromCharCode(65 + movedPiece.col)}${movedPiece.row + 1}`;
    finishOrAdvance(pieces, nextWalls, 0, `${target}의 ${DIRECTION_LABELS[direction]}에 벽을 세웠습니다.`);
  };

  const currentInstruction = phase === 'finished'
    ? (winner === 0 ? '승리했습니다!' : `${PLAYER_NAMES[winner ?? 1]}가 승리했습니다`)
    : phase === 'placement'
      ? currentPlayer === 0 ? '빈 칸을 눌러 말을 배치하세요' : `${PLAYER_NAMES[currentPlayer]}가 배치 중입니다`
      : currentPlayer !== 0 ? `${PLAYER_NAMES[currentPlayer]}가 생각 중입니다`
        : turnStep === 'move' ? selectedPieceId ? '빛나는 칸으로 이동하세요' : '이동할 내 말을 선택하세요'
          : '이동한 말의 한 면에 벽을 세우세요';

  return (
    <div className="min-h-screen bg-[#f3f0e8] text-[#17201e]">
      <header className="flex h-16 items-center justify-between border-b border-black/10 bg-[#f8f6ef]/90 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#33413e] transition hover:text-black"><ArrowLeft size={17} /><span className="hidden sm:inline">게임 목록</span></Link>
          <span className="h-5 w-px bg-black/10" />
          <div className="flex items-baseline gap-2"><span className="text-lg font-black tracking-[-0.04em]">WALLGO</span><span className="hidden text-[10px] font-bold tracking-[0.18em] text-black/40 sm:inline">ROUND 01 · SOLO</span></div>
        </div>
        <button onClick={resetGame} className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><RotateCcw size={14} /> 새 게임</button>
      </header>

      <main className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,760px)_320px] lg:px-6 lg:py-8">
        <section className="rounded-[28px] border border-black/10 bg-[#e8e2d5] p-3 shadow-[0_24px_70px_rgba(33,42,39,0.12)] sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1 sm:px-2">
            <div><p className="mb-1 text-[10px] font-black tracking-[0.2em] text-black/35">TURN {String(turnNumber).padStart(2, '0')}</p><h1 className="text-base font-extrabold tracking-tight sm:text-xl">{currentInstruction}</h1></div>
            <div className={`flex min-w-[82px] items-center justify-center gap-2 rounded-2xl px-3 py-2.5 font-mono text-base font-bold ${seconds <= 15 ? 'bg-[#ff6b4a] text-white' : 'bg-[#17201e] text-white'}`}><Clock3 size={16} />{currentPlayer === 0 && phase === 'playing' ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : '--:--'}</div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[680px] rounded-[22px] bg-[#181f1d] p-2.5 shadow-[0_18px_36px_rgba(16,23,21,0.24)] sm:p-4">
            <div className="relative grid h-full w-full grid-cols-7 grid-rows-7 overflow-hidden rounded-[12px] bg-[#fbfaf5]">
              {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
                const row = Math.floor(index / BOARD_SIZE); const col = index % BOARD_SIZE;
                const position = { row, col };
                const piece = pieces.find((item) => item.row === row && item.col === col);
                const selected = piece?.id === selectedPieceId;
                const move = selectedMoves.find((item) => item.to.row === row && item.to.col === col);
                const moved = piece?.id === movedPieceId;
                const canPlace = phase === 'placement' && currentPlayer === 0 && !piece;
                const topWall = row > 0 && hasWall(walls, position, { row: row - 1, col });
                const leftWall = col > 0 && hasWall(walls, position, { row, col: col - 1 });
                return (
                  <button key={positionKey(position)} type="button" aria-label={`${String.fromCharCode(65 + col)}${row + 1}`} onClick={() => handleCellClick(row, col)}
                    className={`group relative flex items-center justify-center border-b border-r border-[#d9d5ca] transition-colors ${canPlace ? 'hover:bg-[#fff0eb]' : ''} ${move ? 'bg-[#fff4d8]' : ''} ${selected ? 'bg-black/[0.04]' : ''}`}>
                    {topWall && <span className="pointer-events-none absolute -top-[3px] left-[-2px] right-[-2px] z-20 h-[6px] rounded-full bg-[#1a211f] shadow-sm" />}
                    {leftWall && <span className="pointer-events-none absolute -left-[3px] bottom-[-2px] top-[-2px] z-20 w-[6px] rounded-full bg-[#1a211f] shadow-sm" />}
                    {move && <span className={`absolute h-4 w-4 rounded-full border-[3px] ${move.brokenWall ? 'border-[#ff6b4a] bg-white' : 'border-white bg-[#d3a62f]'} shadow-[0_2px_8px_rgba(0,0,0,0.22)] sm:h-5 sm:w-5`} />}
                    {canPlace && <span className="h-2 w-2 rounded-full bg-black/10 transition group-hover:scale-150 group-hover:bg-[#ff6b4a]" />}
                    {piece && <span className={`relative z-10 flex h-[58%] w-[58%] items-center justify-center rounded-full text-[9px] font-black text-white shadow-[0_5px_10px_rgba(0,0,0,0.22)] ring-[3px] ring-white/70 transition sm:text-sm ${selected ? 'scale-110 ring-[5px] ring-[#f2c14e]' : ''}`} style={{ background: PLAYER_COLORS[piece.player] }}>{pieceLabel(piece)}</span>}
                    {moved && turnStep === 'wall' && getWallOptions(pieces, walls, movedPieceId!).map((option) => {
                      const placement: Record<Direction, string> = {
                        up: '-top-1 left-1/2 h-3 w-10 -translate-x-1/2', right: '-right-1 top-1/2 h-10 w-3 -translate-y-1/2',
                        down: '-bottom-1 left-1/2 h-3 w-10 -translate-x-1/2', left: '-left-1 top-1/2 h-10 w-3 -translate-y-1/2',
                      };
                      return <span key={option.direction} role="button" aria-label={`${DIRECTION_LABELS[option.direction]}에 벽 설치`} onClick={(event) => { event.stopPropagation(); placeHumanWall(option.direction); }} className={`absolute z-30 rounded-full bg-[#f2c14e] shadow-[0_0_0_3px_white,0_4px_12px_rgba(0,0,0,.28)] transition hover:scale-110 ${placement[option.direction]}`} />;
                    })}
                  </button>
                );
              })}
            </div>
          </div>

          {phase === 'playing' && currentPlayer === 0 && turnStep === 'move' && (
            <div className="mx-auto mt-4 flex max-w-[680px] items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#f8f6ef] p-3">
              <div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"><ShieldOff size={18} /></div><div className="min-w-0"><p className="text-xs font-extrabold">벽 부수기</p><p className="truncate text-[11px] text-black/45">게임 중 한 번, 이동 경로의 벽을 제거합니다</p></div></div>
              <button disabled={!breakAvailable[0]} onClick={() => { setBreakMode((value) => !value); setSelectedPieceId(null); }} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition ${breakMode ? 'bg-[#ff6b4a] text-white shadow-md' : 'bg-white text-[#17201e] shadow-sm'} disabled:cursor-not-allowed disabled:opacity-40`}>{!breakAvailable[0] ? '사용 완료' : breakMode ? '사용 중' : '사용하기'}</button>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[24px] border border-black/10 bg-[#f8f6ef] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-black tracking-[0.14em] text-black/40">PLAYERS</h2><span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-bold">3인전</span></div>
            <div className="space-y-2">
              {([0, 1, 2] as PlayerId[]).map((player) => (
                <div key={player} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${currentPlayer === player && phase !== 'finished' ? 'border-black/20 bg-white shadow-sm' : 'border-transparent'}`}>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm" style={{ background: PLAYER_COLORS[player] }}>{player === 0 ? <UserRound size={18} /> : <Bot size={18} />}{currentPlayer === player && phase !== 'finished' && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#f2c14e]" />}</div>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="text-sm font-extrabold">{PLAYER_NAMES[player]}</p>{player !== 0 && <span className="text-[9px] font-black tracking-wider text-black/30">AI</span>}</div><p className="text-[11px] text-black/45">영역 {territory.scores[player]}칸 · 말 {pieces.filter((piece) => piece.player === player).length}/2</p></div>
                  <div className="text-right"><p className="text-[9px] font-bold text-black/35">BREAK</p><p className={`text-xs font-black ${breakAvailable[player] ? 'text-[#15937f]' : 'text-black/25'}`}>{breakAvailable[player] ? 'READY' : 'USED'}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-[#17201e] p-5 text-white shadow-lg">
            <div className="mb-4 flex items-center gap-2"><Sparkles size={15} className="text-[#f2c14e]" /><h2 className="text-xs font-black tracking-[0.14em] text-white/55">HOW TO PLAY</h2></div>
            <ol className="space-y-3 text-xs leading-relaxed text-white/65">
              <li className="flex gap-3"><span className="font-mono text-[#f2c14e]">01</span><span>내 말 하나를 상하좌우로 1칸 또는 2칸 이동하세요.</span></li>
              <li className="flex gap-3"><span className="font-mono text-[#f2c14e]">02</span><span>이동한 말의 한 면에 빛나는 벽을 반드시 세우세요.</span></li>
              <li className="flex gap-3"><span className="font-mono text-[#f2c14e]">03</span><span>세 플레이어의 공간이 갈라지면 가장 넓은 영역이 승리합니다.</span></li>
            </ol>
          </section>

          <section className="min-h-[150px] rounded-[24px] border border-black/10 bg-[#f8f6ef] p-4">
            <h2 className="mb-3 text-xs font-black tracking-[0.14em] text-black/40">MATCH LOG</h2>
            <div className="space-y-2">{history.slice(0, 4).map((item, index) => <div key={`${item}-${index}`} className="flex gap-2 text-[11px] leading-relaxed text-black/55">{index === 0 ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b4a]" /> : <Check size={11} className="mt-0.5 shrink-0 text-black/25" />}<span>{item}</span></div>)}</div>
          </section>
        </aside>
      </main>

      {phase === 'finished' && winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17201e]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[30px] bg-[#f8f6ef] p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg" style={{ background: PLAYER_COLORS[winner] }}>{winner === 0 ? 'W' : <Bot />}</div>
            <p className="mb-1 text-[10px] font-black tracking-[0.22em] text-black/35">GAME OVER</p>
            <h2 className="mb-2 text-3xl font-black tracking-tight">{winner === 0 ? '영역 확보 성공!' : `${PLAYER_NAMES[winner]} 승리`}</h2>
            <p className="mb-6 text-sm text-black/50">최종 영역 {territory.scores[winner]}칸 · 최대 단일 영역 {territory.largest[winner]}칸</p>
            <div className="mb-6 grid grid-cols-3 gap-2">{([0, 1, 2] as PlayerId[]).map((player) => <div key={player} className="rounded-2xl p-3" style={{ background: PLAYER_BG[player] }}><p className="text-[10px] font-bold text-black/40">{PLAYER_NAMES[player]}</p><p className="text-xl font-black">{territory.scores[player]}</p></div>)}</div>
            <button onClick={resetGame} className="w-full rounded-2xl bg-[#17201e] py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-lg">다시 플레이</button>
          </div>
        </div>
      )}
    </div>
  );
}
