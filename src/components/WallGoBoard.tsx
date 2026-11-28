"use client";

import { useContext } from 'react';
import { useTranslations } from 'next-intl';
import { Hammer } from 'lucide-react';
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
import WallGoCharacter, { WallGoVariant } from './WallGoCharacter';
import { TERRITORY_TINTS, V2_TERRITORY_TINTS } from './wallgoTheme';

const WALL_BUTTON: Record<Direction, string> = {
  up: '-top-1 left-1/2 h-3 w-10 -translate-x-1/2',
  right: '-right-1 top-1/2 h-10 w-3 -translate-y-1/2',
  down: '-bottom-1 left-1/2 h-3 w-10 -translate-x-1/2',
  left: '-left-1 top-1/2 h-10 w-3 -translate-y-1/2',
};

const BREAK_BUTTON: Record<Direction, string> = {
  up: '-top-2.5 left-1/2 h-5 w-5 -translate-x-1/2',
  right: '-right-2.5 top-1/2 h-5 w-5 -translate-y-1/2',
  down: '-bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2',
  left: '-left-2.5 top-1/2 h-5 w-5 -translate-y-1/2',
};

export default function WallGoBoard({
  pieces, walls, cellOwners, selectedPieceId, moves, wallPieceId, playerNames, interactivePlayer, canPlace, onCellClick, onWall,
  breakOptions = [], pendingBreak = null, onBreak,
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
  breakOptions?: { direction: Direction; key: string }[]; // walls next to the selected piece it may knock down (3-player)
  pendingBreak?: string | null; // wall chosen to knock down before moving
  onBreak?: (key: string) => void;
}) {
  const t = useTranslations('WallGo');
  const wallOptions = wallPieceId ? getWallOptions(pieces, walls, wallPieceId) : [];
  const v2 = useContext(WallGoVariant) === 2;
  const tints = v2 ? V2_TERRITORY_TINTS : TERRITORY_TINTS;

  return (
    // 전체 모드: no taller than the screen leaves room for (data-focus-board, globals.css).
    <div data-focus-board style={{ '--focus-reserve': '300px' } as React.CSSProperties} className={`relative mx-auto aspect-square w-full max-w-[680px] rounded-[8px] p-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${v2 ? 'bg-gradient-to-br from-[#9a9da4] via-[#5d6068] to-[#9a9da4]' : 'bg-gradient-to-br from-[#8d95a8] via-[#24252d] to-[#8d95a8]'}`}>
      {['-left-1.5 -top-1.5', '-right-1.5 -top-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((corner) => <span key={corner} aria-hidden className={`absolute z-30 h-3 w-3 rotate-45 border border-[#b9c1d3] bg-[#0b0b0e] ${corner}`} />)}
      <div className={`h-full w-full rounded-[6px] p-2 sm:p-3 ${v2 ? 'bg-[#6e7179] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.04)_0_2px,transparent_2px_7px)]' : 'bg-[#0e0e12]'}`}>
        <div className={`relative grid h-full w-full grid-cols-7 grid-rows-7 overflow-hidden rounded-[3px] ${v2 ? 'bg-[#e79b8a] ring-2 ring-[#f3c6ba]' : 'bg-[#17181e]'}`}>
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
                className={`group relative flex items-center justify-center border-b border-r ${v2 ? 'border-[#c97b6b]' : 'border-[#2a2c35]'} transition-colors ${placeable ? 'cursor-pointer hover:bg-[#e0283a]/10' : ''} ${move ? move.brokenWall ? 'cursor-pointer bg-[#e0283a]/15' : 'cursor-pointer bg-white/[0.06]' : ''} ${selected ? 'bg-white/[0.05]' : ''}`}
              >
                {owner !== null && owner !== undefined && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundColor: tints[owner] }} />}
                {topWall && <span className={`pointer-events-none absolute -top-[3px] left-[-2px] right-[-2px] z-20 h-[6px] rounded-[2px] ${v2 ? 'bg-gradient-to-b from-[#55585f] to-[#26282d] shadow-[0_2px_4px_rgba(0,0,0,.4)]' : 'bg-gradient-to-b from-[#f1f4fa] to-[#7d8597] shadow-[0_0_8px_rgba(200,210,230,.35)]'}`} />}
                {leftWall && <span className={`pointer-events-none absolute -left-[3px] bottom-[-2px] top-[-2px] z-20 w-[6px] rounded-[2px] ${v2 ? 'bg-gradient-to-r from-[#55585f] to-[#26282d] shadow-[2px_0_4px_rgba(0,0,0,.4)]' : 'bg-gradient-to-r from-[#f1f4fa] to-[#7d8597] shadow-[0_0_8px_rgba(200,210,230,.35)]'}`} />}
                {move && move.distance === 0 && <span aria-hidden className="pointer-events-none absolute inset-[8%] z-20 animate-pulse rounded-full border-2 border-dashed border-[#c9cfdc]/80" />}
                {move && move.distance > 0 && <span className={`absolute z-0 h-4 w-4 rotate-45 border-2 sm:h-5 sm:w-5 ${move.brokenWall ? 'border-[#0b0b0e] bg-[#e0283a] shadow-[0_0_12px_rgba(224,40,58,.9)] before:absolute before:-inset-2 before:animate-ping before:border before:border-[#e0283a]' : 'border-[#0b0b0e] bg-[#c9cfdc] shadow-[0_0_10px_rgba(201,207,220,.5)]'}`} />}
                {placeable && <span className={`h-2 w-2 rotate-45 transition group-hover:scale-150 group-hover:bg-[#e0283a] ${v2 ? 'bg-black/15' : 'bg-white/15'}`} />}
                {piece && <WallGoCharacter player={piece.player} kind={piece.kind} selected={selected} label={piece.kind ? `${playerNames[piece.player]} · ${t(piece.kind === 'square' ? 'v2Square' : 'v2Circle')}` : playerNames[piece.player]} className="z-10 h-[58%]" />}
                {piece && selected && onBreak && breakOptions.map((option) => (
                  <button
                    key={`break-${option.direction}`} aria-label={`${t(option.direction)} ${t('breakWallLabel')}`} aria-pressed={pendingBreak === option.key}
                    onClick={(event) => { event.stopPropagation(); onBreak(option.key); }}
                    className={`absolute z-40 flex items-center justify-center rounded-full border-2 transition hover:scale-110 ${pendingBreak === option.key ? 'border-[#ffd166] bg-[#e0283a] text-white shadow-[0_0_16px_rgba(224,40,58,.9)]' : 'border-[#0b0b0e] bg-[#ffd166] text-[#1a1408] shadow-[0_0_10px_rgba(255,209,102,.6)]'} ${BREAK_BUTTON[option.direction]}`}
                  ><Hammer size={11} /></button>
                ))}
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
