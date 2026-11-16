"use client";

import { useTranslations } from 'next-intl';
import {
  BOARD_SIZE,
  type Direction,
  type MoveOption,
  type Piece,
  type PlayerId,
  getWallOptions,
  hasWall,
  positionKey,
} from '@/lib/wallgo';
import WallGoCharacter from './WallGoCharacter';
import { TERRITORY_TINTS } from './wallgoTheme';

const WALL_BUTTON: Record<Direction, string> = {
  up: '-top-1 left-1/2 h-3 w-10 -translate-x-1/2',
  right: '-right-1 top-1/2 h-10 w-3 -translate-y-1/2',
  down: '-bottom-1 left-1/2 h-3 w-10 -translate-x-1/2',
  left: '-left-1 top-1/2 h-10 w-3 -translate-y-1/2',
};

export default function WallGoBoard({
  pieces, walls, cellOwners, selectedPieceId, moves, wallPieceId, playerNames, interactivePlayer, canPlace, onCellClick, onWall,
}: {
  pieces: Piece[];
  walls: Set<string>;
  cellOwners: Record<string, PlayerId | null>;
  selectedPieceId: string | null;
  moves: MoveOption[];
  wallPieceId: string | null; // piece whose wall buttons are shown
  playerNames: string[];
  interactivePlayer: PlayerId | null;
  canPlace: boolean;
  onCellClick: (row: number, col: number) => void;
  onWall: (direction: Direction) => void;
}) {
  const t = useTranslations('WallGo');
  const wallOptions = wallPieceId ? getWallOptions(pieces, walls, wallPieceId) : [];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[680px] rounded-[8px] bg-gradient-to-br from-[#8d95a8] via-[#24252d] to-[#8d95a8] p-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
      {['-left-1.5 -top-1.5', '-right-1.5 -top-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((corner) => <span key={corner} aria-hidden className={`absolute z-30 h-3 w-3 rotate-45 border border-[#b9c1d3] bg-[#0b0b0e] ${corner}`} />)}
      <div className="h-full w-full rounded-[6px] bg-[#0e0e12] p-2 sm:p-3">
        <div className="relative grid h-full w-full grid-cols-7 grid-rows-7 overflow-hidden rounded-[3px] bg-[#17181e]">
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const row = Math.floor(index / BOARD_SIZE), col = index % BOARD_SIZE, position = { row, col };
            const piece = pieces.find((item) => item.row === row && item.col === col);
            const selected = piece?.id === selectedPieceId;
            const move = moves.find((item) => item.to.row === row && item.to.col === col);
            const owner = cellOwners[positionKey(position)];
            const placeable = canPlace && !piece;
            const topWall = row > 0 && hasWall(walls, position, { row: row - 1, col });
            const leftWall = col > 0 && hasWall(walls, position, { row, col: col - 1 });
            const focusable = placeable || !!move || (interactivePlayer !== null && piece?.player === interactivePlayer);
            return (
              <div
                key={positionKey(position)} role="button" tabIndex={focusable ? 0 : -1}
                aria-label={`${String.fromCharCode(65 + col)}${row + 1}`}
                onClick={() => onCellClick(row, col)}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onCellClick(row, col); }}
                className={`group relative flex items-center justify-center border-b border-r border-[#2a2c35] transition-colors ${placeable ? 'cursor-pointer hover:bg-[#e0283a]/10' : ''} ${move ? move.brokenWall ? 'cursor-pointer bg-[#e0283a]/15' : 'cursor-pointer bg-white/[0.06]' : ''} ${selected ? 'bg-white/[0.05]' : ''}`}
              >
                {owner !== null && owner !== undefined && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundColor: TERRITORY_TINTS[owner] }} />}
                {topWall && <span className="pointer-events-none absolute -top-[3px] left-[-2px] right-[-2px] z-20 h-[6px] rounded-[2px] bg-gradient-to-b from-[#f1f4fa] to-[#7d8597] shadow-[0_0_8px_rgba(200,210,230,.35)]" />}
                {leftWall && <span className="pointer-events-none absolute -left-[3px] bottom-[-2px] top-[-2px] z-20 w-[6px] rounded-[2px] bg-gradient-to-r from-[#f1f4fa] to-[#7d8597] shadow-[0_0_8px_rgba(200,210,230,.35)]" />}
                {move && <span className={`absolute z-0 h-4 w-4 rotate-45 border-2 sm:h-5 sm:w-5 ${move.brokenWall ? 'border-[#0b0b0e] bg-[#e0283a] shadow-[0_0_12px_rgba(224,40,58,.9)] before:absolute before:-inset-2 before:animate-ping before:border before:border-[#e0283a]' : 'border-[#0b0b0e] bg-[#c9cfdc] shadow-[0_0_10px_rgba(201,207,220,.5)]'}`} />}
                {placeable && <span className="h-2 w-2 rotate-45 bg-white/15 transition group-hover:scale-150 group-hover:bg-[#e0283a]" />}
                {piece && <WallGoCharacter player={piece.player} selected={selected} label={playerNames[piece.player]} className="z-10 h-[58%]" />}
                {piece && piece.id === wallPieceId && wallOptions.map((option) => (
                  <button
                    key={option.direction} aria-label={`${t(option.direction)} wall`}
                    onClick={(event) => { event.stopPropagation(); onWall(option.direction); }}
                    className={`absolute z-30 animate-pulse rounded-[2px] bg-[#e0283a] shadow-[0_0_0_2px_#0b0b0e,0_0_16px_rgba(224,40,58,.85)] transition hover:scale-110 hover:animate-none ${WALL_BUTTON[option.direction]}`}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
