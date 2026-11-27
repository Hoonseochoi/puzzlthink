"use client";

import { memo } from 'react';
import { type MoSeat, canBury, rc, startOf } from '@/lib/mineOblivion';
import { Crater, Footprint, type MineState, MineStone, ShieldRing, TreasureStone, WALKER, WalkerStone } from './MineStones';

export type ShownMine = { cell: number; owner: MoSeat | 2; state: MineState; fading?: boolean; recall?: boolean };
export type MoFlash = { cell: number; text: string; tone: 'score' | 'blank' | 'mine' | 'treasure' | 'saved'; key: string; number?: number | null };
/** A 탐지기 reading on the board: the sweep, then the number for a moment. */
export type MoProbeFlash = { cell: number; number: number; key: string; label: string };

export type MoBoardProps = {
  size: number;
  view: MoSeat; // whose start is drawn bottom-left
  pos?: [number, number] | null;
  scored?: { cell: number; seat: MoSeat }[];
  craters?: number[];
  treasures: { cell: number; found: boolean }[];
  mines?: ShownMine[];
  zones?: 'bury' | 'walk';
  targets?: number[];
  targetTone?: 'move' | 'respawn' | 'bury' | 'probe';
  /** AI matches: a 탐지기 reading, and whose walker wears an armed 방폭복. */
  probe?: MoProbeFlash | null;
  shield?: MoSeat | null;
  onCell?: (cell: number) => void;
  flash?: MoFlash | null;
  shakeKey?: string | null;
  trails?: [number[], number[]] | null;
  me?: MoSeat | null;
  names?: [string, string];
  /** Ring each mine in its owner's colour (the end reveal, 복기). */
  ownerRings?: boolean;
  label: string;
};

const CSS = `
.mo-board{--mo-cell:calc(100%/var(--mo-n))}
.mo-piece{transition:left .28s cubic-bezier(.3,.9,.4,1.15),top .28s cubic-bezier(.3,.9,.4,1.15)}
.mo-pop{animation:moPop .34s cubic-bezier(.2,1.5,.4,1) both}
.mo-fade{animation:moFade 3.2s ease-in forwards}
.mo-shake{animation:moShake .42s ease-out}
.mo-ring{animation:moRing .7s ease-out forwards}
.mo-target{animation:moTarget 1.3s ease-in-out infinite}
.mo-vanish{animation:moVanish 1s ease-in forwards}
.mo-recall{animation:moRecall 2s ease-in-out forwards}
.mo-sweep{animation:moSweep .7s linear 2 both}
.mo-probe-n{animation:moProbeN 3.2s ease-in .55s both}
.mo-shield{animation:moShield 1.8s ease-in-out infinite}
.mo-saved{animation:moSaved 1.6s cubic-bezier(.2,1.4,.4,1) both}
@keyframes moRecall{0%{opacity:0;transform:scale(.6)}18%{opacity:1;transform:scale(1.08)}28%,78%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.85)}}
@keyframes moSweep{0%{transform:rotate(0deg);opacity:.95}100%{transform:rotate(360deg);opacity:.95}}
@keyframes moProbeN{0%{transform:scale(.4);opacity:0}12%{transform:scale(1.1);opacity:1}20%,75%{transform:scale(1);opacity:1}100%{opacity:0}}
@keyframes moShield{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
@keyframes moSaved{0%{transform:scale(.3);opacity:0}25%{transform:scale(1.15);opacity:1}70%{transform:scale(1);opacity:1}100%{transform:scale(1.05);opacity:0}}
@keyframes moPop{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes moFade{0%,72%{opacity:1}100%{opacity:0}}
@keyframes moShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-4px,2px)}40%{transform:translate(4px,-2px)}60%{transform:translate(-3px,1px)}80%{transform:translate(2px,-1px)}}
@keyframes moRing{0%{transform:scale(.3);opacity:.9}100%{transform:scale(2.6);opacity:0}}
@keyframes moTarget{0%,100%{box-shadow:inset 0 0 0 2px var(--mo-t),0 0 0 0 transparent}50%{box-shadow:inset 0 0 0 2px var(--mo-t),0 0 10px 1px var(--mo-t)}}
@keyframes moVanish{0%{opacity:1;filter:none}100%{opacity:0;transform:scale(.6)}}
@media (prefers-reduced-motion: reduce){
  .mo-piece{transition:none}.mo-pop,.mo-shake,.mo-ring,.mo-target,.mo-vanish,.mo-sweep,.mo-shield{animation:none}
  .mo-sweep{display:none}.mo-recall{animation:moFadeStep 2s steps(1,end) forwards}.mo-probe-n{animation:moFadeStep 3.75s steps(1,end) forwards}
  .mo-saved{animation:moFadeStep 1.6s steps(1,end) forwards}
  .mo-vanish{animation:moVanishStep 1s steps(1,end) forwards}.mo-fade{animation:moFadeStep 3.2s steps(1,end) forwards}
  @keyframes moFadeStep{0%{opacity:1}100%{opacity:0}}
  @keyframes moVanishStep{0%{opacity:1}100%{opacity:0}}
}`;

/** Earth tones for the cells, varied per cell so the field does not look like a spreadsheet. */
const EARTH = ['#3a3524', '#353322', '#3d3826', '#33301f', '#383424', '#3f3a28'];
const tone = (cell: number) => EARTH[(cell * 7 + ((cell * 13) >> 2)) % EARTH.length];
const numColor = (n: number) => (n === 0 ? '#9aa3ad' : n <= 2 ? '#5ee0c8' : n <= 4 ? '#ffd23f' : '#ff6b5a');

/** The minefield. Pure display: everything it shows comes in through props. */
function MineOblivionBoard(p: MoBoardProps) {
  const n = p.size;
  const N = n * n;
  // Screen position of a cell: the viewer's start bottom-left.
  const place = (cell: number) => {
    const [r, c] = rc(cell, n);
    const [vr, vc] = p.view === 1 ? [n - 1 - r, n - 1 - c] : [r, c];
    return { left: `${(vc * 100) / n}%`, top: `${(vr * 100) / n}%`, width: `${100 / n}%`, height: `${100 / n}%` };
  };
  const centre = (cell: number) => { const [r, c] = rc(cell, n); const [vr, vc] = p.view === 1 ? [n - 1 - r, n - 1 - c] : [r, c]; return [vc + 0.5, vr + 0.5]; };
  // A badge over a cell in the first or last screen column is pulled inward so the board edge never cuts it.
  const edge = (cell: number) => { const x = centre(cell)[0]; return x < 1 ? 'left' : x > n - 1 ? 'right' : null; };
  const inward = (cell: number): React.CSSProperties => (edge(cell) === 'left' ? { left: 0 } : edge(cell) === 'right' ? { right: 0 } : {});
  const targets = new Set(p.targets ?? []);
  const tColor = p.targetTone === 'respawn' ? '#5ee0ff' : p.targetTone === 'bury' ? '#ffb020' : p.targetTone === 'probe' ? '#5ee0c8' : '#ffd23f';
  const minesAt = new Map((p.mines ?? []).map((m) => [m.cell, m]));
  const craters = new Set(p.craters ?? []);
  const starts = [startOf(0, n), startOf(1, n)];
  const order = Array.from({ length: N }, (_, i) => i);
  return (
    <div className={`mo-board relative mx-auto w-full max-w-[560px] select-none rounded-[14px] p-[7px] ${p.shakeKey ? 'mo-shake' : ''}`} key={p.shakeKey ?? 'board'} style={{ ['--mo-n' as string]: n, background: 'repeating-linear-gradient(135deg,#f5c518 0 11px,#141006 11px 22px)', boxShadow: '0 22px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.6)' }}>
      <style>{CSS}</style>
      <div className="relative aspect-square w-full overflow-hidden rounded-[8px]" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #4b3a2a 0%, #2b2619 55%, #1a1710 100%)' }} role="grid" aria-label={p.label}>
        {/* cells */}
        {order.map((cell) => {
          const safe = !canBury(cell, n) && !p.treasures.some((t) => t.cell === cell);
          const target = targets.has(cell);
          const style = { ...place(cell), background: tone(cell), ['--mo-t' as string]: tColor } as React.CSSProperties;
          const hatch = safe && (p.zones === 'bury' ? 'repeating-linear-gradient(135deg,rgba(245,197,24,.32) 0 4px,transparent 4px 9px)' : 'repeating-linear-gradient(135deg,rgba(245,197,24,.1) 0 4px,transparent 4px 9px)');
          return (
            <button key={cell} type="button" tabIndex={target ? 0 : -1} disabled={!target || !p.onCell} onClick={() => p.onCell?.(cell)}
              aria-label={`${rc(cell, n)[0] + 1}-${rc(cell, n)[1] + 1}`}
              className={`absolute border-[0.5px] border-black/35 outline-none ${target ? 'mo-target z-[1] cursor-pointer' : ''}`} style={style}>
              {hatch && <span className="absolute inset-0" style={{ background: hatch }} />}
              {starts.includes(cell) && <span className="absolute inset-[12%] rounded-[4px]" style={{ background: `${WALKER[starts.indexOf(cell) as MoSeat].color}38`, boxShadow: `inset 0 0 0 1.5px ${WALKER[starts.indexOf(cell) as MoSeat].color}99` }} />}
              {target && <span className="absolute inset-[18%] rounded-full" style={{ background: `${tColor}26` }} />}
            </button>
          );
        })}
        {/* footprints and craters */}
        {(p.scored ?? []).filter((s) => !starts.includes(s.cell)).map((s) => (
          <span key={`f${s.cell}`} className="pointer-events-none absolute z-[1] flex items-end justify-end p-[5%]" style={{ ...place(s.cell), background: 'rgba(255,236,190,.075)', boxShadow: `inset 0 0 0 1px ${WALKER[s.seat].color}30` }}><Footprint seat={s.seat} size={15} /></span>
        ))}
        {[...craters].map((c) => <span key={`c${c}`} className="pointer-events-none absolute z-[1] flex items-center justify-center" style={place(c)}><Crater size={26} className="h-[86%] w-[86%]" /></span>)}
        {/* treasure */}
        {p.treasures.map((t) => (
          <span key={`t${t.cell}`} className="pointer-events-none absolute z-[2] flex items-center justify-center" style={place(t.cell)}>
            <TreasureStone dim={t.found} className="h-[88%] w-[88%]" />
          </span>
        ))}
        {/* trails (end reveal, 복기) */}
        {p.trails && (
          <svg viewBox={`0 0 ${n} ${n}`} className="pointer-events-none absolute inset-0 z-[1] h-full w-full">
            {p.trails.map((trail, s) => trail.length > 1 && (
              <polyline key={s} points={trail.map((c) => centre(c).join(',')).join(' ')} fill="none" stroke={WALKER[s].color} strokeOpacity=".75" strokeWidth=".09" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s ? '.22 .14' : undefined} />
            ))}
          </svg>
        )}
        {/* mines (burying, the memorize moment, the reveal, 복기): above the tappable cells (z-1), which are opaque */}
        {[...minesAt.values()].map((m) => (
          <span key={`m${m.cell}${m.recall ? 'r' : ''}`} className={`pointer-events-none absolute z-[2] flex items-center justify-center ${m.fading ? 'mo-vanish' : m.recall ? 'mo-recall' : ''}`} style={{ ...place(m.cell), animationDelay: m.fading ? '3.1s' : undefined }}>
            {m.recall && <span className="absolute inset-[4%] rounded-full" style={{ boxShadow: '0 0 0 2px #c4a3ff, 0 0 14px 2px #9b6cf0', background: 'rgba(155,108,240,.22)' }} />}
            {p.ownerRings && <span className="absolute inset-[6%] rounded-full" style={{ boxShadow: `0 0 0 2px ${m.owner === 2 ? '#c084fc' : WALKER[m.owner].color}`, background: `${m.owner === 2 ? '#c084fc' : WALKER[m.owner].color}22` }} />}
            <MineStone state={m.state} mark={m.owner === 2 ? '#c084fc' : WALKER[m.owner].color} className={m.state === 'blast' ? 'relative h-[96%] w-[96%]' : 'relative h-[80%] w-[80%]'} />
            {m.owner === 2 && <b className="absolute right-[2%] top-[0%] rounded-sm bg-[#c084fc] px-[2px] text-[8px] font-black leading-[10px] text-black">×2</b>}
          </span>
        ))}
        {/* pieces */}
        {p.pos && ([0, 1] as MoSeat[]).map((s) => (
          <span key={`p${s}`} className="mo-piece pointer-events-none absolute z-[2] flex items-center justify-center" style={place(p.pos![s])}>
            <WalkerStone seat={s} glow={p.me === s} title={p.names?.[s]} className="h-[86%] w-[86%]" />
            {p.shield === s && <span className="mo-shield absolute inset-[-8%]"><ShieldRing className="h-full w-full" /></span>}
          </span>
        ))}
        {/* 탐지기: a radar sweep over the cell, then its number (teal, so it never reads as a score) */}
        {p.probe && (
          <span key={p.probe.key} className="pointer-events-none absolute z-[3] flex items-center justify-center" style={place(p.probe.cell)}>
            <span className="absolute inset-[-55%] rounded-full" style={{ boxShadow: 'inset 0 0 0 2px rgba(94,224,200,.55)' }} />
            <span className="mo-sweep absolute inset-[-55%] rounded-full" style={{ background: 'conic-gradient(from 0deg, rgba(94,224,200,0) 0deg, rgba(94,224,200,0) 250deg, rgba(94,224,200,.65) 360deg)' }} />
            <b style={inward(p.probe.cell)} className="mo-probe-n absolute -translate-y-[78%] whitespace-nowrap rounded-full border-2 border-[#0b2e2b] bg-[#5ee0c8] px-2 py-[1px] text-[15px] font-black leading-[20px] text-[#062320] shadow-[0_3px_0_rgba(0,0,0,.5)] sm:text-lg" aria-label={p.probe.label}>
              ◎{p.probe.number}
            </b>
          </span>
        )}
        {/* the announced number, on the cell, for a moment */}
        {p.flash && (
          <span key={p.flash.key} className="pointer-events-none absolute z-[3] flex items-center justify-center" style={place(p.flash.cell)}>
            {p.flash.tone === 'mine' && <span className="mo-ring absolute h-full w-full rounded-full border-[3px] border-[#ffb020]" />}
            <span className="mo-fade flex items-center justify-center">
              {p.flash.tone === 'saved'
                ? (
                  <span className="mo-saved relative flex flex-col items-center" style={{ width: '170%', height: '170%' }}>
                    <ShieldRing burst className="h-full w-full" />
                    <b style={edge(p.flash.cell) === 'left' ? { left: '22%' } : edge(p.flash.cell) === 'right' ? { right: '22%' } : undefined} className="absolute -top-[55%] whitespace-nowrap rounded-full border-2 border-black bg-[#5ee0ff] px-2 py-[1px] text-[14px] font-black leading-[20px] text-[#04222b] shadow-[0_3px_0_rgba(0,0,0,.5)]">{p.flash.text}</b>
                  </span>
                )
                : p.flash.tone === 'mine'
                ? <span className="mo-pop block h-[150%] w-[150%]" style={{ width: '170%', height: '170%' }}><MineStone state="blast" className="h-full w-full" /></span>
                : (
                  <b className="mo-pop absolute -translate-y-[78%] whitespace-nowrap rounded-full border-2 border-black px-2 py-[1px] text-[15px] font-black leading-[20px] shadow-[0_3px_0_rgba(0,0,0,.5)] sm:text-lg"
                    style={{ background: p.flash.tone === 'treasure' ? '#ffd23f' : p.flash.tone === 'blank' ? '#5b606a' : numColor(p.flash.number ?? 0), color: '#111' }}>
                    {p.flash.text}
                  </b>
                )}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(MineOblivionBoard);
