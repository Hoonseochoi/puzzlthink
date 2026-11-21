"use client";

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CornerDownRight, Minus, Undo2 } from 'lucide-react';
import { BOARD_SIZE, SHAPES, STATIONS, TILE_COUNT, keyOf, legalMove, type MonorailMove, type MonorailState, type RailShape, type RailTile } from '@/lib/monorail';
import { BTN, BTN_ACCENT, PANEL_TITLE, seg } from '@/components/ui/gameUi';

export const MONORAIL_ACCENT = '#f3b64a';
export const MONORAIL_INK = '#241607';

const TRACK_PATH: Record<RailShape, string> = {
  h: 'M -8 50 L 108 50', v: 'M 50 -8 L 50 108',
  ne: 'M 50 -8 L 50 20 Q 50 50 80 50 L 108 50',
  se: 'M 108 50 L 80 50 Q 50 50 50 80 L 50 108',
  sw: 'M 50 108 L 50 80 Q 50 50 20 50 L -8 50',
  nw: 'M -8 50 L 20 50 Q 50 50 50 20 L 50 -8',
};

const TREE_POS = [
  ['12%', '14%'], ['80%', '18%'], ['14%', '78%'], ['78%', '76%'], ['22%', '48%'], ['74%', '48%'],
];

export function RailCard({ tile, station = false, ghost = false, pending = false, compact = false }: { tile: RailTile; station?: boolean; ghost?: boolean; pending?: boolean; compact?: boolean }) {
  const skin = Math.abs(tile.skin) % 6;
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[8%] border ${ghost ? 'border-[#ffe08a] opacity-45 saturate-50' : pending ? 'border-[#fff0a8] shadow-[0_0_18px_rgba(255,221,107,.65)]' : 'border-[#143e27]/45'} bg-[#78ad3e] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]`}>
      <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%,#d7ef82 0 2%,transparent 3%),linear-gradient(135deg,rgba(255,255,255,.12),transparent 45%)' }} />
      {!compact && TREE_POS.slice(skin % 3, skin % 3 + 3).map(([left, top], i) => <i key={i} className="absolute h-[8%] w-[8%] rounded-full bg-[#2f692f] shadow-[3px_2px_0_#244d28]" style={{ left, top }} />)}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d={TRACK_PATH[tile.shape]} fill="none" stroke="#27302e" strokeWidth="24" />
        <path d={TRACK_PATH[tile.shape]} fill="none" stroke="#e7e4d6" strokeWidth="15" />
        <path d={TRACK_PATH[tile.shape]} fill="none" stroke="#59605d" strokeWidth="2.6" strokeDasharray="5 4" />
        <path d={TRACK_PATH[tile.shape]} fill="none" stroke="#ffffff" strokeOpacity=".48" strokeWidth="1.1" transform="translate(-4 -4)" />
      </svg>
      {station && <span className="absolute left-1/2 top-1/2 flex h-[30%] min-h-3 w-[38%] min-w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2px] border border-[#5a3510] bg-[#e3a431] shadow-md"><i className="h-[38%] w-[52%] rounded-[1px] bg-[#6b3a18]" /></span>}
      {ghost && <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_5px,rgba(255,255,255,.18)_5px_8px)]" />}
    </div>
  );
}

export function MonorailBoard({ state, pending = [], interactive = false, onCell, onPending, className = '' }: {
  state: MonorailState; pending?: RailTile[]; interactive?: boolean;
  onCell?: (r: number, c: number) => void; onPending?: (tile: RailTile) => void; className?: string;
}) {
  const fixed = useMemo(() => new Map([...STATIONS.map((tile) => ({ tile, station: true })), ...state.tiles.map((tile) => ({ tile, station: false }))].map((x) => [keyOf(x.tile), x])), [state.tiles]);
  const draft = useMemo(() => new Map(pending.map((tile) => [keyOf(tile), tile])), [pending]);
  const proof = useMemo(() => new Map((state.proof ?? []).filter((tile) => !fixed.has(keyOf(tile))).map((tile) => [keyOf(tile), tile])), [state.proof, fixed]);
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[720px] overflow-hidden rounded-[18px] border border-[#efc16b]/25 bg-[#4b161d] p-[2.5%] shadow-[0_24px_80px_rgba(0,0,0,.52),inset_0_0_50px_rgba(25,0,7,.6)] ${className}`}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 22% 18%,#e17c64 0 1px,transparent 1.5px)', backgroundSize: '17px 17px' }} />
      <div className="relative grid h-full w-full gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE},minmax(0,1fr))` }}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
          const r = Math.floor(index / BOARD_SIZE), c = index % BOARD_SIZE, k = `${r},${c}`;
          const here = fixed.get(k), draftTile = draft.get(k), proofTile = proof.get(k);
          const canClick = interactive && !here && !proofTile;
          return (
            <button key={k} type="button" disabled={!canClick && !draftTile} aria-label={`${String.fromCharCode(65 + c)}${BOARD_SIZE - r}`}
              onClick={() => draftTile ? onPending?.(draftTile) : onCell?.(r, c)}
              className={`relative aspect-square min-w-0 rounded-[7%] transition ${here || draftTile || proofTile ? '' : 'border border-white/[.045] bg-black/[.08]'} ${canClick ? 'hover:border-[#f6ca68]/45 hover:bg-[#f6ca68]/10' : ''}`}>
              {here && <RailCard tile={here.tile} station={here.station} />}
              {draftTile && <RailCard tile={draftTile} pending />}
              {proofTile && <RailCard tile={proofTile} ghost />}
              {!here && !draftTile && !proofTile && <span className="absolute bottom-[8%] right-[8%] font-mono text-[6px] text-white/[.08] sm:text-[8px]">{String.fromCharCode(65 + c)}{BOARD_SIZE - r}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function useMonorailDraft(state: MonorailState, enabled: boolean) {
  const [shape, setShape] = useState<RailShape>('h');
  const [tiles, setTiles] = useState<RailTile[]>([]);
  const add = (r: number, c: number) => {
    if (!enabled || tiles.length >= 3) return;
    const next = [...tiles, { r, c, shape, skin: (r * 7 + c * 3 + state.moveNo + tiles.length) % 6 }];
    if (legalMove(state, { tiles: next })) setTiles(next);
  };
  const remove = (tile: RailTile) => setTiles((list) => list.filter((x) => keyOf(x) !== keyOf(tile)));
  const clear = () => setTiles([]);
  const rotate = () => setShape((current) => SHAPES[(SHAPES.indexOf(current) + 1) % SHAPES.length]);
  return { shape, setShape, tiles, add, remove, clear, rotate, move: { tiles } satisfies MonorailMove };
}

export function ShapePicker({ shape, onShape, disabled = false, title = 'TILE FACE' }: { shape: RailShape; onShape: (shape: RailShape) => void; disabled?: boolean; title?: string }) {
  return (
    <div>
      <p className={PANEL_TITLE}>{title}</p>
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {SHAPES.map((item) => <button key={item} type="button" disabled={disabled} onClick={() => onShape(item)} className={`aspect-square p-1 ${seg(shape === item)} disabled:opacity-35`}><RailCard compact tile={{ r: 0, c: 0, shape: item, skin: 0 }} /></button>)}
      </div>
    </div>
  );
}

export function TurnControls({ state, draft, disabled, onCommit, onImpossible }: {
  state: MonorailState; draft: ReturnType<typeof useMonorailDraft>; disabled?: boolean; onCommit: () => void; onImpossible: () => void;
}) {
  const t = useTranslations('Monorail');
  const left = TILE_COUNT - state.tiles.length;
  return (
    <div className="space-y-3">
      <ShapePicker shape={draft.shape} onShape={draft.setShape} disabled={disabled} title={t('tileFace')} />
      <div className="flex items-center justify-between text-[11px] text-white/45"><span>{t('selected', { n: draft.tiles.length })}</span><span>{t('tilesLeft', { n: left })}</span></div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button type="button" disabled={disabled || !draft.tiles.length} onClick={onCommit} className={`${BTN_ACCENT} py-3 disabled:opacity-35`}><CornerDownRight size={15} />{t('place', { n: draft.tiles.length || 0 })}</button>
        <button type="button" disabled={disabled || !draft.tiles.length} onClick={draft.clear} className={`${BTN} px-3 disabled:opacity-35`} aria-label="Undo selection"><Undo2 size={15} /></button>
      </div>
      <button type="button" disabled={disabled || !!draft.tiles.length} onClick={onImpossible} className="flex w-full items-center justify-center gap-2 rounded-md border border-[#ff7d75]/35 bg-[#7f2929]/20 px-4 py-2.5 text-xs font-black text-[#ffaaa4] transition hover:bg-[#7f2929]/35 disabled:cursor-not-allowed disabled:opacity-30"><Minus size={14} />{t('impossible')}</button>
      <p className="break-keep text-[10px] leading-4 text-white/35">{t('impossibleHint')}</p>
    </div>
  );
}

export function TileDeck({ used }: { used: number }) {
  const left = TILE_COUNT - used;
  return <div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0">{Array.from({ length: Math.min(5, left) }, (_, i) => <span key={i} className="absolute inset-0" style={{ transform: `translate(${i * 2}px,${-i * 2}px)` }}><RailCard compact tile={{ r: 0, c: 0, shape: i % 2 ? 'se' : 'h', skin: i }} /></span>)}</div><div><p className="font-mono text-2xl font-black text-[#f5cb6b]">{left}</p><p className="text-[10px] font-bold tracking-widest text-white/35">RAIL TILES</p></div></div>;
}
