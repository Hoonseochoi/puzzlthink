"use client";

import { useEffect, useRef, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { LASER_BOARD_SIZE, legalActions, type LaserAction, type LaserOwner, type LaserPiece as Piece, type LaserShot } from '@/lib/laserJanggi';
import LaserPiece from './LaserPiece';
import { FX, shotTimeline } from './laserFx';
import { playShotSound } from './laserSound';
import { LASER_CYAN, LASER_GOLD, LASER_RED } from './theme';

const N = LASER_BOARD_SIZE;
const at = (value: number) => ((value + 0.5) / N) * 100; // cell centre in the 0–100 overlay
const ms = (value: number) => `${Math.round(value)}ms`;
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

export type LaserPreview = { action: LaserAction; pieces: Piece[]; shot: LaserShot };

/**
 * The board. `pieces` is the position the player moves from; `shot` (re-played whenever `shotKey` changes) is the
 * last turn: the moved piece slides or turns, the laser charges, the beam draws out along its path, mirrors flash,
 * hit pieces break apart with shards and a shake, and a king hit gets a slow, bigger finish.
 * `preview` shows a move before it is fired: the piece where it would go, the beam it would fire (dashed) and
 * every piece that beam would destroy. `dangerIds` rings pieces the opponent can hit next turn.
 */
export default function LaserBoard({ pieces, current, interactive, selectedId, shot, shotKey = 0, preview = null, dangerIds = [], sound = false, onSelect, onMove }: {
  pieces: Piece[];
  current: LaserOwner;
  interactive: boolean;
  selectedId: string | null;
  shot: LaserShot | null;
  shotKey?: string | number;
  preview?: LaserPreview | null;
  dangerIds?: string[];
  sound?: boolean;
  onSelect: (id: string) => void;
  onMove: (action: LaserAction) => void;
}) {
  const t = useTranslations('LaserJanggi');
  const shown = preview ? preview.pieces : pieces;
  const selected = pieces.find((item) => item.id === selectedId);
  const moves = selected && interactive ? legalActions(pieces, current).filter((action): action is Extract<LaserAction, { type: 'move' }> => action.type === 'move' && action.pieceId === selected.id) : [];
  const moveAt = (row: number, col: number) => moves.find((action) => action.row === row && action.col === col);
  const pending = preview?.action.type === 'move' ? preview.action : null;
  const doomed = new Set(preview?.shot.captured ?? []);
  const live = preview ? null : shot;
  const timeline = shotTimeline(live);
  const beamColor = (owner: LaserOwner) => (owner === 0 ? LASER_CYAN : LASER_RED);
  const kingHit = live ? live.kingHits.length > 0 : false;
  const firstHit = timeline.hits.length ? Math.min(...timeline.hits.map((h) => h.at)) : null;
  const moved = live?.moved;
  const movedNow = moved ? pieces.find((item) => item.id === moved.id) : undefined;

  // Sound for each new shot, timed with the animation.
  const heard = useRef<string | number | null>(null);
  useEffect(() => {
    if (!sound || !live || heard.current === shotKey) return;
    heard.current = shotKey;
    const ends = live.segments.map((seg, i) => ({ seg, end: timeline.segs[i]?.end ?? 0 }));
    playShotSound({
      fire: timeline.fire,
      slide: !!live.action,
      bounces: ends.filter(({ seg }) => seg.outcome === 'reflect').map(({ end }) => end),
      splits: ends.filter(({ seg }) => seg.outcome === 'split').map(({ end }) => end),
      hits: timeline.hits.filter((h) => !h.king).map((h) => h.at),
      king: timeline.hits.find((h) => h.king)?.at ?? null,
    });
    try { if (timeline.hits.length) navigator.vibrate?.(kingHit ? [60, 60, 160] : 40); } catch { /* optional */ }
  }, [sound, live, shotKey, timeline, kingHit]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[700px] rounded-[14px] bg-gradient-to-br from-[#64edff] via-[#28333e] to-[#ff4d6d] p-[3px] shadow-[0_28px_80px_rgba(0,0,0,.76),0_0_34px_rgba(63,218,255,.12)]">
      <div className="relative h-full w-full overflow-hidden rounded-[11px] border border-white/10 bg-[#06090e] p-[4.4%] shadow-[inset_0_0_65px_rgba(0,0,0,.92)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_80%,rgba(69,218,255,.08),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(255,61,98,.08),transparent_36%)]" />
        <div key={`shake-${shotKey}`} className={`relative h-full w-full ${firstHit !== null ? (kingHit ? 'lj-shake-big' : 'lj-shake') : ''}`} style={v({ '--t': ms(firstHit ?? 0) })}>
          <div className="relative grid h-full w-full grid-cols-8 grid-rows-8 border-l border-t border-[#65e8ff]/20">
            {Array.from({ length: N * N }, (_, index) => {
              const row = Math.floor(index / N);
              const col = index % N;
              const item = shown.find((candidate) => candidate.row === row && candidate.col === col);
              const base = pieces.find((candidate) => candidate.row === row && candidate.col === col);
              const move = moveAt(row, col);
              const selectable = interactive && base?.owner === current;
              const isPending = pending && pending.row === row && pending.col === col;
              const vacated = pending && selected && selected.row === row && selected.col === col;
              const slide = movedNow && item && item.id === movedNow.id && moved && !preview;
              const dr = slide ? moved.row - item.row : 0, dc = slide ? moved.col - item.col : 0;
              const turn = slide ? ((((moved.direction - item.direction) % 4) + 6) % 4) - 2 : 0; // -1, 0 or +1 quarter turns back
              return (
                <button
                  key={`${row}:${col}`} type="button" disabled={!selectable && !move}
                  aria-label={item ? `${String.fromCharCode(65 + col)}${8 - row} ${t(`pieces.${item.type}.name`)}` : `${String.fromCharCode(65 + col)}${8 - row}`}
                  onClick={() => (base && selectable && !move ? onSelect(base.id) : move ? onMove(move) : undefined)}
                  className={`group/cell relative flex items-center justify-center border-b border-r border-[#65e8ff]/20 outline-none transition ${((row + col) % 2) ? 'bg-white/[.018]' : 'bg-[#57dbff]/[.022]'} ${move ? 'cursor-pointer bg-[#ffd166]/10 hover:bg-[#ffd166]/20' : ''} ${isPending ? '!bg-[#ffd166]/25' : ''} ${selectable ? 'cursor-pointer hover:bg-white/[.05]' : ''}`}
                >
                  {move && !isPending && <span className="absolute h-[18%] w-[18%] rotate-45 bg-[#ffd166] shadow-[0_0_12px_#ffd166] transition group-hover/cell:scale-125" />}
                  {vacated && <span className="absolute inset-[14%] rounded-full border-2 border-dashed border-[#ffd166]/50" />}
                  {item && <div
                    key={slide ? `${item.id}-${shotKey}` : item.id}
                    className={`group/piece relative z-10 h-[78%] w-[78%] ${slide && (dr || dc || turn) ? 'lj-slide' : ''} ${doomed.has(item.id) ? 'lj-doomed' : ''}`}
                    style={slide ? v({ '--dx': `${dc * 128}%`, '--dy': `${dr * 128}%`, '--rot': `${turn * 90}deg`, '--d': ms(FX.slide) }) : undefined}
                  >
                    <LaserPiece piece={item} selected={item.id === selectedId} label={t(`pieces.${item.type}.name`)} className={`h-full w-full ${isPending ? 'opacity-80' : ''}`} />
                    {doomed.has(item.id) && <span className={`pointer-events-none absolute -inset-[10%] rounded-full border-[3px] ${item.owner === current ? 'border-[#ff4d6d]' : 'border-[#ffd166]'} lj-pulse`} />}
                    {doomed.has(item.id) && <span className={`pointer-events-none absolute -right-[12%] -top-[12%] flex h-[42%] w-[42%] items-center justify-center rounded-full text-[min(2.6vw,13px)] font-black ${item.owner === current ? 'bg-[#ff4d6d] text-white' : 'bg-[#ffd166] text-black'}`}>{item.owner === current ? '!' : '✕'}</span>}
                    {dangerIds.includes(item.id) && !preview && <span className="pointer-events-none absolute -inset-[14%] rounded-full border-[3px] border-[#ff4d6d] shadow-[0_0_14px_#ff4d6d] lj-pulse" />}
                    <span className={`pointer-events-none absolute ${row <= 1 ? 'top-[108%]' : 'bottom-[108%]'} ${col <= 1 ? 'left-0' : col >= N - 2 ? 'right-0' : 'left-1/2 -translate-x-1/2'} z-50 hidden w-40 rounded-md border border-white/10 bg-[#0a0d13]/95 px-2.5 py-2 text-left text-[10px] leading-4 text-white/75 shadow-xl [@media(hover:hover)]:group-hover/piece:block`}>
                      <b className="block text-[11px] text-white">{t(`pieces.${item.type}.name`)}</b>{t(`pieces.${item.type}.tip`)}
                    </span>
                  </div>}
                </button>
              );
            })}
          </div>

          {/* pieces this shot destroys: whole until the beam arrives, then they crack in two and fall away */}
          {live?.fallen && live.fallen.map((item) => {
            const hit = timeline.hits.find((h) => h.id === item.id);
            if (!hit) return null;
            const box = { left: `${(item.col / N) * 100 + 1.4}%`, top: `${(item.row / N) * 100 + 1.4}%`, width: `${(100 / N) * 0.78}%`, height: `${(100 / N) * 0.78}%` };
            return <div key={`fallen-${item.id}-${shotKey}`} className="pointer-events-none absolute z-20" style={box}>
              <div className="lj-break lj-break-a absolute inset-0" style={v({ '--t': ms(hit.at) })}><LaserPiece piece={item} className="h-full w-full" /></div>
              <div className="lj-break lj-break-b absolute inset-0" style={v({ '--t': ms(hit.at) })}><LaserPiece piece={item} className="h-full w-full" /></div>
            </div>;
          })}

          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible" aria-hidden>
            {/* User-space filter region: every beam segment is horizontal or vertical, so its bounding box has zero height or
                width and a default (bounding-box) filter region would hide it entirely. */}
            <defs>
              <filter id="laser-beam-glow" filterUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120"><feGaussianBlur stdDeviation="1.35" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <radialGradient id="lj-king-glow"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".35" stopColor={LASER_GOLD} stopOpacity=".6" /><stop offset="1" stopColor={LASER_GOLD} stopOpacity="0" /></radialGradient>
            </defs>

            {preview && <g opacity=".85">
              {preview.shot.segments.map((segment, index) => <line key={`ghost-${index}`} x1={at(segment.from.col)} y1={at(segment.from.row)} x2={at(segment.to.col)} y2={at(segment.to.row)}
                stroke={beamColor(preview.shot.owner)} strokeWidth=".7" strokeLinecap="round" strokeDasharray="2.2 1.6" className="lj-march" />)}
              {preview.shot.segments.filter((s) => s.outcome === 'reflect' || s.outcome === 'split').map((s, i) => <circle key={`gb-${i}`} cx={at(s.to.col)} cy={at(s.to.row)} r="1.1" fill={beamColor(preview.shot.owner)} opacity=".8" />)}
            </g>}

            {live && <g key={`beam-${shotKey}`}>
              {timeline.fire > 0 && live.segments[0] && <circle cx={at(live.segments[0].from.col)} cy={at(live.segments[0].from.row)} r="4.6" fill="none" stroke={beamColor(live.owner)} strokeWidth="1.2" className="lj-charge" style={v({ '--t': ms(timeline.fire - FX.charge), '--d': ms(FX.charge) })} />}
              {live.segments.map((segment, index) => {
                const time = timeline.segs[index];
                const style = v({ '--t': ms(time.start), '--d': ms(Math.max(1, time.end - time.start)) });
                return <g key={`seg-${index}`}>
                  <line x1={at(segment.from.col)} y1={at(segment.from.row)} x2={at(segment.to.col)} y2={at(segment.to.row)} pathLength={1}
                    stroke={beamColor(live.owner)} strokeOpacity=".35" strokeWidth={kingHit ? 3.2 : 2.4} className="lj-beam" style={style} />
                  <line x1={at(segment.from.col)} y1={at(segment.from.row)} x2={at(segment.to.col)} y2={at(segment.to.row)} pathLength={1}
                    stroke={beamColor(live.owner)} strokeWidth=".8" filter="url(#laser-beam-glow)" className="lj-beam" style={style} />
                  <line x1={at(segment.from.col)} y1={at(segment.from.row)} x2={at(segment.to.col)} y2={at(segment.to.row)} pathLength={1}
                    stroke="#fff" strokeOpacity=".85" strokeWidth=".25" className="lj-beam" style={style} />
                </g>;
              })}
              {live.segments.map((segment, index) => (segment.outcome === 'reflect' || segment.outcome === 'split') && <circle key={`bounce-${index}`}
                cx={at(segment.to.col)} cy={at(segment.to.row)} r={segment.outcome === 'split' ? 5 : 3} fill={segment.outcome === 'split' ? '#fff' : beamColor(live.owner)}
                className="lj-flash" style={v({ '--t': ms(timeline.segs[index].end) })} />)}
              {timeline.hits.map((hit) => <g key={`hit-${hit.id}`}>
                <circle cx={at(hit.col)} cy={at(hit.row)} r={hit.king ? 9 : 6} fill={hit.king ? 'url(#lj-king-glow)' : '#fff2b2'} className="lj-flash" style={v({ '--t': ms(hit.at) })} />
                {Array.from({ length: hit.king ? 14 : 9 }, (_, i) => {
                  const angle = (i / (hit.king ? 14 : 9)) * Math.PI * 2 + (i % 2) * 0.4;
                  const dist = (hit.king ? 16 : 9) + (i % 3) * 3;
                  return <g key={i} transform={`translate(${at(hit.col)} ${at(hit.row)})`}><polygon points="0,-1.3 1.1,0.9 -1.1,0.9"
                    fill={i % 3 === 0 ? '#fff' : hit.king ? LASER_GOLD : beamColor(live.owner)}
                    className="lj-shard" style={v({ '--t': ms(hit.at), '--dx': `${Math.cos(angle) * dist}px`, '--dy': `${Math.sin(angle) * dist}px`, '--r': `${(i % 2 ? 1 : -1) * (120 + i * 25)}deg` })} /></g>;
                })}
              </g>)}
            </g>}
          </svg>

          {live && kingHit && firstHit !== null && <div key={`king-${shotKey}`} className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
            <div className="lj-king-flash absolute inset-0" style={v({ '--t': ms(firstHit) })} />
            <p className="lj-king-text relative text-center text-[clamp(28px,9vw,56px)] font-black italic tracking-tight text-white" style={v({ '--t': ms(firstHit + 120), textShadow: `0 0 22px ${beamColor(live.owner)}, 0 0 6px ${beamColor(live.owner)}, 0 3px 0 #000` })}>{live.kingHits.includes(live.owner) ? t('kingSelf') : t('kingDown')}</p>
          </div>}
        </div>

        <div className="pointer-events-none absolute inset-x-[4.4%] bottom-[1.2%] flex justify-around font-mono text-[8px] text-[#7aeaff]/35">{'ABCDEFGH'.split('').map((letter) => <span key={letter}>{letter}</span>)}</div>
        <div className="pointer-events-none absolute inset-y-[4.4%] left-[1.5%] flex flex-col justify-around font-mono text-[8px] text-[#7aeaff]/35">{[8, 7, 6, 5, 4, 3, 2, 1].map((number) => <span key={number}>{number}</span>)}</div>
      </div>
    </div>
  );
}
