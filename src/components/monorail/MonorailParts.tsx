"use client";

import { useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Check, CornerDownRight, Eye, Flag, Minus, Siren, Undo2 } from 'lucide-react';
import { BOARD_SIZE, SHAPES, STATIONS, TILE_COUNT, inChallenge, isComplete, keyOf, legalMove, moveText, validProofTiles, type LogEntry, type MonorailMove, type MonorailState, type Player, type RailShape, type RailTile } from '@/lib/monorail';
import { BTN, BTN_ACCENT, PANEL_TITLE, accentVars, seg } from '@/components/ui/gameUi';
import { ReplayButton } from '@/components/ui/ReplayBar';

export const MONORAIL_ACCENT = '#f3b64a';
export const MONORAIL_INK = '#241607';

// Every track runs through the tile centre and leaves through the middle of two edges. Curves are true
// quarter circles, so neighbouring tiles join seamlessly and the sleeper pattern stays even.
const TRACK_PATH: Record<RailShape, string> = {
  h: 'M -8 50 L 108 50', v: 'M 50 -8 L 50 108',
  ne: 'M 50 -8 L 50 0 A 50 50 0 0 0 100 50 L 108 50',
  se: 'M 108 50 L 100 50 A 50 50 0 0 0 50 100 L 50 108',
  sw: 'M 50 108 L 50 100 A 50 50 0 0 0 0 50 L -8 50',
  nw: 'M -8 50 L 0 50 A 50 50 0 0 0 50 0 L 50 -8',
};

// Small scenery so that sixteen identical-looking cards still read as different pieces of land.
// Each entry lists trees/bushes placed in the corners the track never crosses.
const SCENERY: readonly (readonly [number, number, number])[][] = [
  [[16, 16, 7], [84, 84, 6]], [[84, 16, 6], [16, 84, 7], [26, 80, 4]], [[18, 18, 5], [28, 12, 4], [82, 82, 7]],
  [[82, 18, 7], [18, 82, 5]], [[14, 14, 6], [86, 14, 4], [84, 86, 6]], [[20, 82, 7], [80, 20, 5], [88, 88, 4]],
];

function TrackSvg({ shape, station = false }: { shape: RailShape; station?: boolean }) {
  const d = TRACK_PATH[shape];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d={d} fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="34" transform="translate(1.5 2.5)" />
      <path d={d} fill="none" stroke="#a69a86" strokeWidth="32" />
      <path d={d} fill="none" stroke="#c4b9a3" strokeWidth="26" />
      <path d={d} fill="none" stroke="#6b4a2f" strokeWidth="24" strokeDasharray="3.6 4.73" />
      <path d={d} fill="none" stroke="#e9edf0" strokeWidth="15" />
      <path d={d} fill="none" stroke="#7d8790" strokeWidth="12" />
      <path d={d} fill="none" stroke="#c4b9a3" strokeWidth="10" />
      <path d={d} fill="none" stroke="#6b4a2f" strokeWidth="10" strokeDasharray="3.6 4.73" />
      {station && <>
        <rect x="18" y="14" width="64" height="15" rx="2.5" fill="#efb54a" stroke="#6b3c12" strokeWidth="1.6" />
        <rect x="24" y="17.5" width="52" height="4" rx="1" fill="#7a3f13" opacity=".55" />
        <path d="M 14 14 L 50 4 L 86 14 Z" fill="#c2412f" stroke="#6b1f14" strokeWidth="1.6" strokeLinejoin="round" />
        <rect x="18" y="71" width="64" height="9" rx="2" fill="#e8dfc9" stroke="#6b5a3e" strokeWidth="1.2" />
      </>}
    </svg>
  );
}

export function RailCard({ tile, station = false, ghost = false, pending = false, compact = false, last = false }: {
  tile: RailTile; station?: boolean; ghost?: boolean; pending?: boolean; compact?: boolean; last?: boolean;
}) {
  const skin = Math.abs(tile.skin) % SCENERY.length;
  const tone = station ? 'from-[#8cc456] to-[#5f9a35]' : skin % 2 ? 'from-[#86c04f] to-[#5b9531]' : 'from-[#7fba4a] to-[#55902e]';
  const ring = ghost ? 'ring-2 ring-dashed ring-[#ffe08a]/80 opacity-55 saturate-[.35]'
    : pending ? 'ring-[3px] ring-[#fff0a8] shadow-[0_0_22px_rgba(255,221,107,.7)] -translate-y-[3%]'
      : last ? 'ring-2 ring-[#ffd36b] shadow-[0_0_16px_rgba(255,200,90,.55)]' : 'ring-1 ring-black/25';
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[10%] bg-gradient-to-br ${tone} shadow-[inset_0_2px_0_rgba(255,255,255,.28),inset_0_-3px_0_rgba(0,0,0,.18),0_3px_6px_rgba(0,0,0,.35)] transition-transform ${ring}`}>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle,#c9ec7d 0 1px,transparent 1.6px)', backgroundSize: '11% 11%' }} />
      {!compact && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {SCENERY[skin].map(([x, y, r], i) => <g key={i}><circle cx={x + 1.2} cy={y + 1.8} r={r} fill="#24481f" opacity=".45" /><circle cx={x} cy={y} r={r} fill="#2f6b2c" /><circle cx={x - r * .3} cy={y - r * .3} r={r * .45} fill="#4f9642" /></g>)}
        </svg>
      )}
      <TrackSvg shape={tile.shape} station={station} />
      {ghost && <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_5px,rgba(255,255,255,.2)_5px_8px)]" />}
    </div>
  );
}

type View = { r0: number; c0: number; size: number };

/** The square window of the 9×9 table worth showing: everything in play plus `pad` empty rings around it. */
function viewOf(points: { r: number; c: number }[], pad: number, min: number): View {
  const rs = points.map((p) => p.r), cs = points.map((p) => p.c);
  const r0 = Math.max(0, Math.min(...rs) - pad), r1 = Math.min(BOARD_SIZE - 1, Math.max(...rs) + pad);
  const c0 = Math.max(0, Math.min(...cs) - pad), c1 = Math.min(BOARD_SIZE - 1, Math.max(...cs) + pad);
  const size = Math.min(BOARD_SIZE, Math.max(min, r1 - r0 + 1, c1 - c0 + 1));
  // Centre the shorter side inside the square window, then slide it back onto the table if needed.
  const fit = (lo: number, hi: number) => Math.max(0, Math.min(BOARD_SIZE - size, lo - Math.floor((size - (hi - lo + 1)) / 2)));
  return { r0: fit(r0, r1), c0: fit(c0, c1), size };
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

/**
 * The table. A camera frames the tiles in play (plus room to place more) and glides smoothly as the
 * layout grows, so tiles stay large instead of floating in the middle of an empty 9×9 grid.
 * `pad = null` shows the whole table.
 */
export function MonorailBoard({ state, pending = [], interactive = false, onCell, onPending, className = '', pad = 2, minView = 5, showLast = true }: {
  state: MonorailState; pending?: RailTile[]; interactive?: boolean;
  onCell?: (r: number, c: number) => void; onPending?: (tile: RailTile) => void; className?: string;
  pad?: number | null; minView?: number; showLast?: boolean;
}) {
  const fixed = useMemo(() => new Map([...STATIONS.map((tile) => ({ tile, station: true })), ...state.tiles.map((tile) => ({ tile, station: false }))].map((x) => [keyOf(x.tile), x])), [state.tiles]);
  const draft = useMemo(() => new Map(pending.map((tile) => [keyOf(tile), tile])), [pending]);
  const proof = useMemo(() => new Map((state.proof ?? []).filter((tile) => !fixed.has(keyOf(tile))).map((tile) => [keyOf(tile), tile])), [state.proof, fixed]);
  const lastKeys = useMemo(() => new Set(showLast && state.winner === null ? (state.last?.tiles ?? []).map(keyOf) : []), [state.last, state.winner, showLast]);
  const view = useMemo<View>(() => pad === null ? { r0: 0, c0: 0, size: BOARD_SIZE }
    : viewOf([...STATIONS, ...state.tiles, ...pending, ...(state.proof ?? [])], pad, minView), [pad, minView, state.tiles, state.proof, pending]);
  // Empty cells next to the layout: where the next tile can go. Shown as soft landing pads on your turn.
  const frontier = useMemo(() => {
    const out = new Set<string>();
    if (!interactive) return out;
    for (const tile of [...fixed.values()].map((x) => x.tile).concat(pending)) for (const [dr, dc] of DIRS) {
      const r = tile.r + dr, c = tile.c + dc, k = `${r},${c}`;
      if (r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE && !fixed.has(k) && !draft.has(k)) out.add(k);
    }
    return out;
  }, [interactive, fixed, pending, draft]);

  const scale = BOARD_SIZE / view.size;
  const cell = 100 / BOARD_SIZE;
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[720px] overflow-hidden rounded-[18px] border border-[#f3b64a]/30 bg-[#16201d] p-[2%] shadow-[0_24px_80px_rgba(0,0,0,.52),inset_0_0_60px_rgba(0,0,0,.55)] ${className}`}>
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%,rgba(120,170,120,.16),transparent 70%)' }} />
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute transition-[left,top,width,height] duration-500 ease-out"
          style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, left: `${-view.c0 * cell * scale}%`, top: `${-view.r0 * cell * scale}%` }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)', backgroundSize: `${cell}% ${cell}%` }} />
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const r = Math.floor(index / BOARD_SIZE), c = index % BOARD_SIZE, k = `${r},${c}`;
            const here = fixed.get(k), draftTile = draft.get(k), proofTile = proof.get(k);
            const open = frontier.has(k) && !proofTile;
            const canClick = interactive && !here && !proofTile;
            if (!here && !draftTile && !proofTile && !canClick) return null;
            return (
              <button key={k} type="button" disabled={!canClick && !draftTile} aria-label={`${String.fromCharCode(65 + c)}${BOARD_SIZE - r}`}
                onClick={() => draftTile ? onPending?.(draftTile) : onCell?.(r, c)}
                className={`group absolute p-[.45%] ${canClick && !draftTile ? 'cursor-pointer' : ''}`}
                style={{ left: `${c * cell}%`, top: `${r * cell}%`, width: `${cell}%`, height: `${cell}%` }}>
                {here && <RailCard tile={here.tile} station={here.station} last={lastKeys.has(k)} />}
                {draftTile && <RailCard tile={draftTile} pending />}
                {proofTile && <RailCard tile={proofTile} ghost />}
                {canClick && !draftTile && <span className={`absolute inset-[6%] rounded-[12%] transition ${open ? 'border-2 border-dashed border-[#f3b64a]/35 bg-[#f3b64a]/[.06] group-hover:border-[#f3b64a]/80 group-hover:bg-[#f3b64a]/15' : 'group-hover:bg-white/[.04]'}`} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function useMonorailDraft(state: MonorailState, enabled: boolean) {
  const [shape, setShape] = useState<RailShape>('h');
  const [tiles, setTiles] = useState<RailTile[]>([]);
  // Answering an Impossible call: any empty cells, up to every remaining tile, no straight-line limit.
  const proving = inChallenge(state);
  const limit = proving ? TILE_COUNT - state.tiles.length : 3;
  const add = (r: number, c: number) => {
    if (!enabled || tiles.length >= limit) return;
    const next = [...tiles, { r, c, shape, skin: (r * 7 + c * 3 + state.moveNo + tiles.length) % 6 }];
    if (proving ? validProofTiles(state, next) : legalMove(state, { tiles: next })) setTiles(next);
  };
  // Tapping a placed draft tile with another face selected turns it into that face; same face removes it.
  const remove = (tile: RailTile) => setTiles((list) => tile.shape !== shape
    ? list.map((x) => keyOf(x) === keyOf(tile) ? { ...x, shape } : x)
    : list.filter((x) => keyOf(x) !== keyOf(tile)));
  const clear = () => setTiles([]);
  const rotate = () => setShape((current) => SHAPES[(SHAPES.indexOf(current) + 1) % SHAPES.length]);
  const complete = proving && tiles.length > 0 && isComplete({ tiles: [...state.tiles, ...tiles] });
  return { shape, setShape, tiles, add, remove, clear, rotate, proving, limit, complete, move: { tiles } satisfies MonorailMove };
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

type Draft = ReturnType<typeof useMonorailDraft>;
type TurnActions = { onCommit: () => void; onImpossible: () => void; onProve: () => void; onGiveUp: () => void };

const GIVE_UP = 'flex w-full items-center justify-center gap-2 rounded-md border border-[#ff7d75]/35 bg-[#7f2929]/20 px-4 py-2.5 text-xs font-black text-[#ffaaa4] transition hover:bg-[#7f2929]/35 disabled:cursor-not-allowed disabled:opacity-30';

/** Status line while answering an Impossible call: how many tiles are down and whether the loop closes. */
function ProofStatus({ draft }: { draft: Draft }) {
  const t = useTranslations('Monorail');
  return <p className={`rounded-md px-3 py-2 text-center text-[11px] font-black ${draft.complete ? 'bg-[#3ddc97]/15 text-[#7ff0bd]' : 'bg-white/[.05] text-white/50'}`}>
    {draft.complete ? t('proveReady') : draft.tiles.length ? t('proveNotYet') : t('proveStart', { n: draft.limit })}
  </p>;
}

export function TurnControls({ state, draft, disabled, onCommit, onImpossible, onProve, onGiveUp }: TurnActions & {
  state: MonorailState; draft: Draft; disabled?: boolean;
}) {
  const t = useTranslations('Monorail');
  const left = TILE_COUNT - state.tiles.length;
  if (draft.proving) return (
    <div className="space-y-3">
      <ShapePicker shape={draft.shape} onShape={draft.setShape} disabled={disabled} title={t('tileFace')} />
      {!disabled && <ProofStatus draft={draft} />}
      <div className="flex items-center justify-between text-[11px] text-white/45"><span>{t('proofSelected', { n: draft.tiles.length, max: draft.limit })}</span><span>{t('tilesLeft', { n: left })}</span></div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button type="button" disabled={disabled || !draft.complete} onClick={onProve} className={`${BTN_ACCENT} py-3 disabled:opacity-35`}><Check size={15} />{t('proveSubmit')}</button>
        <button type="button" disabled={disabled || !draft.tiles.length} onClick={draft.clear} className={`${BTN} px-3 disabled:opacity-35`} aria-label={t('undo')}><Undo2 size={15} /></button>
      </div>
      <button type="button" disabled={disabled} onClick={onGiveUp} className={GIVE_UP}><Flag size={14} />{t('giveUp')}</button>
      <p className="break-keep text-[10px] leading-4 text-white/35">{t('proveHint')}</p>
    </div>
  );
  return (
    <div className="space-y-3">
      <ShapePicker shape={draft.shape} onShape={draft.setShape} disabled={disabled} title={t('tileFace')} />
      <div className="flex items-center justify-between text-[11px] text-white/45"><span>{t('selected', { n: draft.tiles.length })}</span><span>{t('tilesLeft', { n: left })}</span></div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button type="button" disabled={disabled || !draft.tiles.length} onClick={onCommit} className={`${BTN_ACCENT} py-3 disabled:opacity-35`}><CornerDownRight size={15} />{t('place', { n: draft.tiles.length || 0 })}</button>
        <button type="button" disabled={disabled || !draft.tiles.length} onClick={draft.clear} className={`${BTN} px-3 disabled:opacity-35`} aria-label={t('undo')}><Undo2 size={15} /></button>
      </div>
      <button type="button" disabled={disabled || !!draft.tiles.length} onClick={onImpossible} className={GIVE_UP}><Minus size={14} />{t('impossible')}</button>
      <p className="break-keep text-[10px] leading-4 text-white/35">{t('impossibleHint')}</p>
    </div>
  );
}

/** Shown above the board while an Impossible call is being answered. */
export function ChallengeBanner({ state, mine, caller, answerer }: { state: MonorailState; mine: boolean; caller: string; answerer: string }) {
  const t = useTranslations('Monorail');
  if (!inChallenge(state)) return null;
  return (
    <div className="mb-3 flex items-start gap-3 rounded-[14px] border border-[#ff8d85]/40 bg-[#43181d]/80 px-4 py-3">
      <Siren size={18} className="mt-0.5 shrink-0 text-[#ff9d95]" />
      <div className="min-w-0">
        <p className="text-[10px] font-black tracking-[.18em] text-[#ff9d95]">IMPOSSIBLE · {t('challengeKicker', { name: caller })}</p>
        <p className="mt-1 break-keep text-sm font-bold text-white/85">{mine ? t('challengeYou', { n: TILE_COUNT - state.tiles.length }) : t('challengeWait', { name: answerer })}</p>
      </div>
    </div>
  );
}

const noop = () => () => {};

/** Phone / installed-app turn dock: keeps every action reachable without scrolling below the board. */
export function MonorailTurnDock({ active, state, draft, onCommit, onImpossible, onProve, onGiveUp }: TurnActions & {
  active: boolean; state: MonorailState; draft: Draft;
}) {
  const t = useTranslations('Monorail');
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!active || !mounted) return null;
  const left = TILE_COUNT - state.tiles.length;
  const proving = draft.proving;
  const pill = 'pointer-events-auto absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#ff8d85]/45 bg-[#43181d]/95 px-4 py-2 text-[12px] font-black text-[#ffb0aa] shadow-[0_8px_28px_rgba(0,0,0,.5)] backdrop-blur-md active:scale-95';
  const ready = proving ? draft.complete : draft.tiles.length > 0;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(.5rem,env(safe-area-inset-bottom))] z-50 px-2 lg:hidden" style={accentVars(MONORAIL_ACCENT, MONORAIL_INK)}>
      <div className="relative mx-auto w-full max-w-[560px]">
        {proving ? <button type="button" onClick={onGiveUp} className={pill}><Flag size={14} />{t('giveUp')}</button>
          : !draft.tiles.length && <button type="button" onClick={onImpossible} className={pill}><Minus size={14} />{t('impossible')}</button>}
        <section aria-label={t('turnDock')} className={`pointer-events-auto rounded-[18px] border bg-[#171014]/95 p-3 shadow-[0_14px_55px_rgba(0,0,0,.72),0_0_25px_rgba(243,182,74,.12)] backdrop-blur-xl ${proving ? 'border-[#ff8d85]/50' : 'border-[#f3b64a]/45'}`}>
          <div className="mb-2 flex items-center justify-between gap-3 px-0.5">
            <p className={`flex items-center gap-1.5 text-[13px] font-black ${proving ? (draft.complete ? 'text-[#7ff0bd]' : 'text-[#ffb0aa]') : 'text-[#f6cc72]'}`}>
              {proving ? <Siren size={14} /> : <CornerDownRight size={14} />}
              {proving ? (draft.complete ? t('proveReady') : t('proveDock')) : t('turnDock')}
            </p>
            <p className="text-[11px] font-bold text-white/45">{proving ? t('proofSelected', { n: draft.tiles.length, max: draft.limit }) : `${t('selected', { n: draft.tiles.length })} · ${t('tilesLeft', { n: left })}`}</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <div className="grid grid-cols-6 gap-1.5">
              {SHAPES.map((item) => (
                <button key={item} type="button" onClick={() => draft.setShape(item)} aria-label={`${t('tileFace')} ${item}`}
                  className={`aspect-square min-w-0 rounded-[9px] p-1 transition ${shapeDockClass(draft.shape === item)}`}>
                  <RailCard compact tile={{ r: 0, c: 0, shape: item, skin: 0 }} />
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {draft.tiles.length > 0 && <button type="button" onClick={draft.clear} aria-label={t('undo')} className="flex h-12 w-10 items-center justify-center rounded-[10px] border border-white/15 bg-white/[.06] text-white/60 active:scale-95"><Undo2 size={16} /></button>}
              <button type="button" disabled={!ready} onClick={proving ? onProve : onCommit}
                className="flex h-12 min-w-[76px] items-center justify-center gap-1 rounded-[10px] bg-[#f3b64a] px-3 text-[12px] font-black text-[#241607] shadow-[0_0_20px_rgba(243,182,74,.25)] active:scale-95 disabled:bg-white/10 disabled:text-white/25 disabled:shadow-none">
                {proving ? <><Check size={15} />{t('proveSubmit')}</> : <><CornerDownRight size={15} />{draft.tiles.length ? t('placeShort', { n: draft.tiles.length }) : t('pickTile')}</>}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}

const shapeDockClass = (on: boolean) => on
  ? 'bg-[#f3b64a] shadow-[0_0_14px_rgba(243,182,74,.35)] ring-2 ring-[#ffe5a4]'
  : 'border border-white/10 bg-white/[.04] opacity-70';

export function TileDeck({ used }: { used: number }) {
  const left = TILE_COUNT - used;
  return <div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0">{Array.from({ length: Math.min(5, left) }, (_, i) => <span key={i} className="absolute inset-0" style={{ transform: `translate(${i * 2}px,${-i * 2}px)` }}><RailCard compact tile={{ r: 0, c: 0, shape: i % 2 ? 'se' : 'h', skin: i }} /></span>)}</div><div><p className="font-mono text-2xl font-black text-[#f5cb6b]">{left}</p><p className="text-[10px] font-bold tracking-widest text-white/35">RAIL TILES</p></div></div>;
}

export type MonorailFrame = { no: number; entry: LogEntry | null; state: MonorailState };

/**
 * 복기 frames rebuilt from the turn log: frame 0 is the two stations, then one frame per turn. Tiles are
 * stored in play order, so each frame is a prefix of `tiles`; the turn's own tiles glow as the last move.
 */
export function monorailFrames(game: MonorailState): MonorailFrame[] {
  const log = game.log ?? [];
  const blank = { ...game, tiles: [], winner: null, reason: null, challenger: null, last: null, proof: null };
  const frames: MonorailFrame[] = [{ no: 0, entry: null, state: blank }];
  let used = 0;
  log.forEach((entry, i) => {
    const placed = game.tiles.slice(used, used + entry.n);
    used += entry.n;
    const final = i === log.length - 1;
    frames.push({ no: i + 1, entry, state: { ...blank, tiles: game.tiles.slice(0, used), last: placed.length ? { tiles: placed } : null, proof: final && entry.kind === 'give-up' ? game.proof : null } });
  });
  return frames;
}

/** One-line caption for a 복기 frame. */
export function useFrameCaption(name: (p: Player) => string) {
  const t = useTranslations('Monorail');
  const tc = useTranslations('Common');
  return (frame: MonorailFrame) => {
    const { entry, no, state } = frame;
    if (!entry) return tc('replayStart');
    const who = name(entry.by);
    if (entry.kind === 'call') return t('replayCall', { n: no, name: who });
    if (entry.kind === 'give-up') return t('replayGiveUp', { n: no, name: who });
    const at = state.last ? moveText(state.last) : '';
    return entry.kind === 'prove' ? t('replayProve', { n: no, name: who, at: entry.n }) : t('replayMove', { n: no, name: who, at });
  };
}

/** Result popup actions: replay and "view the board". */
export function ResultExtras({ canReplay, onReplay, onViewBoard }: { canReplay: boolean; onReplay: () => void; onViewBoard: () => void }) {
  const t = useTranslations('Monorail');
  return <>
    {canReplay && <ReplayButton onClick={onReplay} className="!mt-2" />}
    <button type="button" onClick={onViewBoard} className={`${BTN} mt-2 w-full py-2.5`}><Eye size={14} />{t('viewBoard')}</button>
  </>;
}
