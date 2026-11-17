"use client";

import { BOARD_SIZE, STONE_COLORS, coordinateLabel, type GomokuMove, type StoneColor, type WinningLine } from '@/lib/blindGomoku';
import BlindStone from './BlindStone';

const MARGIN = 5.4;
const SPAN = 100 - MARGIN * 2;
const point = (value: number) => MARGIN + value * (SPAN / (BOARD_SIZE - 1));
const colorHex = (color: StoneColor) => STONE_COLORS.find((item) => item.id === color)?.hex ?? '#ef4957';
const STAR_POINTS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

function GridFace({ moves, revealed, lastMove, winningLine, interactive, previewColor, onPlace }: {
  moves: GomokuMove[];
  revealed: boolean;
  lastMove?: GomokuMove;
  winningLine?: WinningLine | null;
  interactive: boolean;
  previewColor: StoneColor;
  onPlace: (row: number, col: number) => void;
}) {
  const occupied = new Set(moves.map((move) => `${move.row}:${move.col}`));
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[7px] border border-[#67e8ff]/20 bg-[#080c12] shadow-[inset_0_0_55px_rgba(0,0,0,.9),inset_0_0_24px_rgba(71,213,255,.08)]"
      style={{ backgroundImage: revealed ? 'radial-gradient(circle at 50% 45%, rgba(255,209,102,.07), transparent 48%), linear-gradient(145deg,#0c121a,#06080d)' : 'radial-gradient(circle at 50% 45%, rgba(72,213,255,.09), transparent 50%), linear-gradient(145deg,#0c121a,#06080d)' }}
    >
      <div className="absolute inset-[5.4%]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {Array.from({ length: BOARD_SIZE }, (_, index) => {
            const p = (index / (BOARD_SIZE - 1)) * 100;
            return <g key={index}><line x1={p} y1="0" x2={p} y2="100" stroke="#67e8ff" strokeOpacity=".31" strokeWidth=".32" /><line x1="0" y1={p} x2="100" y2={p} stroke="#67e8ff" strokeOpacity=".31" strokeWidth=".32" /></g>;
          })}
        </svg>
      </div>
      {STAR_POINTS.map(([row, col]) => <span key={`${row}:${col}`} className="absolute h-[1.25%] w-[1.25%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8f6ff] shadow-[0_0_8px_#56ddff]" style={{ left: `${point(col)}%`, top: `${point(row)}%` }} />)}
      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        const key = `${row}:${col}`;
        const move = moves.find((item) => item.row === row && item.col === col);
        const canPlace = interactive && !occupied.has(key);
        return (
          <button
            key={key}
            type="button"
            disabled={!canPlace}
            aria-label={move ? `${coordinateLabel(row, col)} ${move.owner}` : coordinateLabel(row, col)}
            onClick={() => onPlace(row, col)}
            className={`group absolute z-10 h-[6.35%] w-[6.35%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none ${canPlace ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-[#ffd76b]' : ''}`}
            style={{ left: `${point(col)}%`, top: `${point(row)}%` }}
          >
            {move ? <BlindStone color={colorHex(move.color)} owner={move.owner} revealed={revealed} latest={move === lastMove} /> : canPlace ? <span className="block h-full w-full scale-75 rounded-full border border-white/25 opacity-0 shadow-[0_4px_10px_rgba(0,0,0,.45)] transition group-hover:scale-100 group-hover:opacity-55 group-focus-visible:scale-100 group-focus-visible:opacity-55" style={{ background: colorHex(previewColor) }} /> : null}
          </button>
        );
      })}
      {revealed && winningLine && <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-30 h-full w-full" aria-hidden>
        <line
          x1={point(winningLine.start.col)} y1={point(winningLine.start.row)}
          x2={point(winningLine.end.col)} y2={point(winningLine.end.row)}
          stroke="#ff334d" strokeWidth="1.5" strokeLinecap="round"
          className="blind-gomoku-win-line"
        />
        <line
          x1={point(winningLine.start.col)} y1={point(winningLine.start.row)}
          x2={point(winningLine.end.col)} y2={point(winningLine.end.row)}
          stroke="#fff4cb" strokeWidth=".38" strokeLinecap="round"
          className="blind-gomoku-win-line"
        />
      </svg>}
    </div>
  );
}

export default function BlindGomokuBoard({ moves, flipped, interactive, previewColor, winningLine, onPlace }: {
  moves: GomokuMove[];
  flipped: boolean;
  interactive: boolean;
  previewColor: StoneColor;
  winningLine?: WinningLine | null;
  onPlace: (row: number, col: number) => void;
}) {
  const lastMove = moves.at(-1);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[700px] [perspective:1500px]">
      <div className={`relative h-full w-full transition-transform duration-1000 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        <div aria-hidden={flipped} className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-[#74efff] via-[#26313f] to-[#9a69dc] p-[3px] shadow-[0_24px_60px_rgba(0,0,0,.78),0_0_28px_rgba(80,220,255,.12)] [backface-visibility:hidden]">
          <GridFace moves={moves} revealed={false} lastMove={lastMove} interactive={interactive} previewColor={previewColor} onPlace={onPlace} />
        </div>
        <div aria-hidden={!flipped} className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-[#ffd166] via-[#26313f] to-[#67e8ff] p-[3px] shadow-[0_24px_60px_rgba(0,0,0,.78),0_0_32px_rgba(255,209,102,.14)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <GridFace moves={moves} revealed lastMove={lastMove} winningLine={winningLine} interactive={false} previewColor={previewColor} onPlace={onPlace} />
        </div>
      </div>
    </div>
  );
}
