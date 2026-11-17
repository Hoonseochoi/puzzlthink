"use client";

import { useTranslations } from 'next-intl';
import { LASER_BOARD_SIZE, legalActions, type LaserAction, type LaserOwner, type LaserPiece as Piece, type LaserShot } from '@/lib/laserJanggi';
import LaserPiece from './LaserPiece';
import { LASER_CYAN, LASER_RED } from './theme';

const cellCenter = (value: number) => ((value + 0.5) / LASER_BOARD_SIZE) * 100;

export default function LaserBoard({ pieces, current, interactive, selectedId, shot, onSelect, onMove }: {
  pieces: Piece[];
  current: LaserOwner;
  interactive: boolean;
  selectedId: string | null;
  shot: LaserShot | null;
  onSelect: (id: string) => void;
  onMove: (action: LaserAction) => void;
}) {
  const t = useTranslations('LaserJanggi');
  const selected = pieces.find((item) => item.id === selectedId);
  const moves = selected ? legalActions(pieces, current).filter((action): action is Extract<LaserAction, { type: 'move' }> => action.type === 'move' && action.pieceId === selected.id) : [];
  const moveAt = (row: number, col: number) => moves.find((action) => action.row === row && action.col === col);
  const beamColor = shot?.owner === 0 ? LASER_CYAN : LASER_RED;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[700px] rounded-[14px] bg-gradient-to-br from-[#64edff] via-[#28333e] to-[#ff4d6d] p-[3px] shadow-[0_28px_80px_rgba(0,0,0,.76),0_0_34px_rgba(63,218,255,.12)]">
      <div className="relative h-full w-full overflow-hidden rounded-[11px] border border-white/10 bg-[#06090e] p-[4.4%] shadow-[inset_0_0_65px_rgba(0,0,0,.92)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_80%,rgba(69,218,255,.08),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(255,61,98,.08),transparent_36%)]" />
        <div className="relative grid h-full w-full grid-cols-8 grid-rows-8 border-l border-t border-[#65e8ff]/20">
          {Array.from({ length: LASER_BOARD_SIZE * LASER_BOARD_SIZE }, (_, index) => {
            const row = Math.floor(index / LASER_BOARD_SIZE);
            const col = index % LASER_BOARD_SIZE;
            const item = pieces.find((candidate) => candidate.row === row && candidate.col === col);
            const move = moveAt(row, col);
            const selectable = interactive && item?.owner === current;
            return (
              <button
                key={`${row}:${col}`} type="button" disabled={!selectable && !move}
                aria-label={item ? `${String.fromCharCode(65 + col)}${8 - row} ${t(`pieces.${item.type}.name`)}` : `${String.fromCharCode(65 + col)}${8 - row}`}
                onClick={() => item && selectable ? onSelect(item.id) : move ? onMove(move) : undefined}
                className={`group/cell relative flex items-center justify-center border-b border-r border-[#65e8ff]/20 outline-none transition ${((row + col) % 2) ? 'bg-white/[.018]' : 'bg-[#57dbff]/[.022]'} ${move ? 'cursor-pointer bg-[#ffd166]/10 hover:bg-[#ffd166]/20' : ''} ${selectable ? 'cursor-pointer hover:bg-white/[.05]' : ''}`}
              >
                {move && <span className="absolute h-[18%] w-[18%] rotate-45 bg-[#ffd166] shadow-[0_0_12px_#ffd166] transition group-hover/cell:scale-125" />}
                {item && <div className="group/piece relative z-10 h-[78%] w-[78%]">
                  <LaserPiece piece={item} selected={item.id === selectedId} label={t(`pieces.${item.type}.name`)} className="h-full w-full" />
                  <span className={`pointer-events-none absolute ${row <= 1 ? 'top-[108%]' : 'bottom-[108%]'} ${col <= 1 ? 'left-0' : col >= LASER_BOARD_SIZE - 2 ? 'right-0' : 'left-1/2 -translate-x-1/2'} z-50 hidden w-40 rounded-md border border-white/10 bg-[#0a0d13]/95 px-2.5 py-2 text-left text-[10px] leading-4 text-white/75 shadow-xl [@media(hover:hover)]:group-hover/piece:block`}>
                    <b className="block text-[11px] text-white">{t(`pieces.${item.type}.name`)}</b>{t(`pieces.${item.type}.tip`)}
                  </span>
                </div>}
              </button>
            );
          })}
        </div>

        {shot && <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-[4.4%] z-30 h-[91.2%] w-[91.2%] overflow-visible" aria-hidden>
          <defs><filter id="laser-beam-glow"><feGaussianBlur stdDeviation="1.35" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          {shot.segments.map((segment, index) => <line
            key={`${index}-${segment.branch}`} x1={cellCenter(segment.from.col)} y1={cellCenter(segment.from.row)} x2={cellCenter(segment.to.col)} y2={cellCenter(segment.to.row)}
            stroke={beamColor} strokeWidth=".75" strokeLinecap="round" filter="url(#laser-beam-glow)"
            className="laser-janggi-beam" style={{ animationDelay: `${index * 85}ms` }}
          />)}
          {shot.segments.filter((segment) => segment.hitId).map((segment, index) => <circle key={`hit-${index}`} cx={cellCenter(segment.to.col)} cy={cellCenter(segment.to.row)} r="3.8" fill="none" stroke={segment.outcome === 'king' || segment.outcome === 'capture' ? '#fff2b2' : beamColor} strokeWidth=".55" className="laser-janggi-hit" />)}
        </svg>}

        <div className="pointer-events-none absolute inset-x-[4.4%] bottom-[1.2%] flex justify-around font-mono text-[8px] text-[#7aeaff]/35">{'ABCDEFGH'.split('').map((letter) => <span key={letter}>{letter}</span>)}</div>
        <div className="pointer-events-none absolute inset-y-[4.4%] left-[1.5%] flex flex-col justify-around font-mono text-[8px] text-[#7aeaff]/35">{[8, 7, 6, 5, 4, 3, 2, 1].map((number) => <span key={number}>{number}</span>)}</div>
      </div>
    </div>
  );
}
