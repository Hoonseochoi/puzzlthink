"use client";

// Pieces shared by the AI game and friend rooms: choosing a move with a preview before firing, the danger check on
// your king, the action bar, the turn beat, the move log and the captured-pieces tray.
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Crosshair, RotateCcw, RotateCw, Undo2, Volume2, VolumeX, Zap } from 'lucide-react';
import { BTN, BTN_ACCENT } from '@/components/ui/gameUi';
import { applyLaserAction, initialLaserPieces, legalActions, type LaserAction, type LaserOwner, type LaserPiece as Piece, type LaserShot } from '@/lib/laserJanggi';
import { kingShots } from '@/lib/laserJanggiAi';
import type { LaserPreview } from './LaserBoard';
import LaserPiece from './LaserPiece';
import { laserSoundOn, playTick, setLaserSound } from './laserSound';
import { LASER_CYAN, LASER_RED } from './theme';

const sig = (pieces: Piece[]) => pieces.map((p) => `${p.id}${p.row}${p.col}${p.direction}`).join();
const same = (a: LaserAction | null, b: LaserAction) => !!a && JSON.stringify(a) === JSON.stringify(b);
export const square = (row: number, col: number) => `${String.fromCharCode(65 + col)}${8 - row}`;

export type Warning = 'win' | 'selfKing' | 'opensKing' | 'selfPiece' | null;

/**
 * Selection and a two-step move: tapping a square or a turn button only previews the move (its beam drawn dashed,
 * every piece it would destroy marked); the same tap again, or 「발사」, fires it. 「취소」 undoes the choice.
 */
export function useLaserPlay(pieces: Piece[], me: LaserOwner | null, myTurn: boolean, fire: (action: LaserAction) => void) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<LaserAction | null>(null);
  const position = sig(pieces);
  const [seen, setSeen] = useState(position);
  if (seen !== position) { setSeen(position); setSelectedId(null); setPending(null); } // a new position clears the choice
  const active = myTurn && me !== null;

  const preview = useMemo<(LaserPreview & { warning: Warning; lost: number; taken: number }) | null>(() => {
    if (!active || !pending) return null;
    const result = applyLaserAction(pieces, me!, pending);
    if (!result) return null;
    const fallen = result.shot.fallen ?? [];
    const lost = fallen.filter((p) => p.owner === me).length;
    const taken = fallen.filter((p) => p.owner !== me).length;
    const warning: Warning = result.winner === me ? 'win' : result.winner !== null ? 'selfKing'
      : kingShots(result.pieces, (1 - me!) as LaserOwner).length ? 'opensKing' : lost ? 'selfPiece' : null;
    return { action: pending, pieces: [...result.pieces, ...fallen], shot: result.shot, warning, lost, taken };
  }, [active, pending, pieces, me]);

  // Can the opponent hit my king on their next turn if I leave things as they are?
  const danger = useMemo(() => {
    if (!active) return [] as string[];
    const king = pieces.find((p) => p.owner === me && p.type === 'king');
    return king && kingShots(pieces, (1 - me!) as LaserOwner).length ? [king.id] : [];
  }, [active, pieces, me]);

  const choose = (action: LaserAction) => {
    if (!active) return;
    if (same(pending, action)) { setPending(null); setSelectedId(null); fire(action); return; }
    playTick();
    setPending(action);
  };
  const select = (id: string) => { if (!active) return; setPending(null); setSelectedId((value) => (value === id ? null : id)); };
  const selected = pieces.find((p) => p.id === selectedId) ?? null;
  const rotations = selected && active ? legalActions(pieces, me!).filter((a) => a.type === 'rotate' && a.pieceId === selected.id) : [];
  const turn = (delta: -1 | 1) => { const a = rotations.find((r) => r.type === 'rotate' && r.delta === delta); if (a) choose(a); };
  const confirm = () => { if (pending) choose(pending); };
  const cancel = () => setPending(null);
  return { selectedId, selected, select, pending, preview, danger, choose, turn, confirm, cancel, rotations };
}

/** Under the board: the selected piece, turn buttons, and for a chosen move its preview verdict with 취소 / 발사. */
export function LaserActionBar({ play }: { play: ReturnType<typeof useLaserPlay> }) {
  const t = useTranslations('LaserJanggi');
  const { selected, preview, pending, rotations } = play;
  if (!selected) return null;
  const pendingTurn = pending?.type === 'rotate' ? pending.delta : 0;
  const tone = preview?.warning === 'win' ? 'border-[#ffd166]/60 bg-[#ffd166]/10 text-[#ffe7a3]'
    : preview?.warning === 'selfKing' || preview?.warning === 'opensKing' ? 'border-[#ff4d6d]/60 bg-[#ff4d6d]/10 text-[#ffb3c1]'
      : preview?.warning === 'selfPiece' ? 'border-[#ff9f43]/50 bg-[#ff9f43]/10 text-[#ffd0a3]' : 'border-[#59e6ff]/25 bg-[#59e6ff]/[.06] text-white/70';
  const verdict = !preview ? null : preview.warning === 'win' ? t('previewWin')
    : preview.warning === 'selfKing' ? t('previewSelfKing')
      : preview.warning === 'opensKing' ? t('previewOpensKing')
        : preview.lost && preview.taken ? t('previewTrade', { lost: preview.lost, taken: preview.taken })
          : preview.lost ? t('previewLose', { n: preview.lost })
            : preview.taken ? t('previewTake', { n: preview.taken }) : t('previewQuiet');
  return <div className="mx-auto mt-3 max-w-[700px] rounded-[10px] border border-[#59e6ff]/20 bg-black/55 p-2.5">
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2"><div className="h-9 w-9 shrink-0"><LaserPiece piece={selected} /></div><span className="truncate text-xs font-bold text-white/80">{t(`pieces.${selected.type}.name`)} · {square(selected.row, selected.col)}</span></div>
      <div className="flex shrink-0 gap-1.5">
        <button type="button" onClick={() => play.turn(-1)} disabled={!rotations.some((a) => a.type === 'rotate' && a.delta === -1)} aria-pressed={pendingTurn === -1} aria-label={t('rotateLeft')} className={`${BTN} !px-2.5 ${pendingTurn === -1 ? '!border-[#ffd166] !text-[#ffd166]' : ''}`}><RotateCcw size={15} />90°</button>
        <button type="button" onClick={() => play.turn(1)} disabled={!rotations.some((a) => a.type === 'rotate' && a.delta === 1)} aria-pressed={pendingTurn === 1} aria-label={t('rotateRight')} className={`${BTN} !px-2.5 ${pendingTurn === 1 ? '!border-[#ffd166] !text-[#ffd166]' : ''}`}>90°<RotateCw size={15} /></button>
      </div>
    </div>
    <p className="mt-1.5 text-[10.5px] leading-4 text-white/45">{pending ? t('confirmHint') : t('chooseHint')}</p>
    {preview && <div className={`mt-2 flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 ${tone}`}>
      <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-bold leading-4">{preview.warning && preview.warning !== 'win' ? <AlertTriangle size={14} className="shrink-0" /> : <Crosshair size={14} className="shrink-0" />}{verdict}</span>
      <span className="flex shrink-0 gap-1.5">
        <button type="button" onClick={play.cancel} className={BTN}><Undo2 size={14} />{t('cancel')}</button>
        <button type="button" onClick={play.confirm} className={`${BTN_ACCENT} px-3`}><Zap size={14} />{t('fire')}</button>
      </span>
    </div>}
  </div>;
}

/** A short 「내 차례」/「상대 차례」 beat laid over the board whenever the turn passes. */
export function TurnBeat({ beat }: { beat: { text: string; owner: LaserOwner; key: string | number } | null }) {
  const [shown, setShown] = useState(beat);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one beat per turn change, keyed by it
    setShown(beat);
    if (!beat) return;
    const timer = window.setTimeout(() => setShown(null), 950);
    return () => window.clearTimeout(timer);
  }, [beat]);
  if (!shown) return null;
  const color = shown.owner === 0 ? LASER_CYAN : LASER_RED;
  return <div key={shown.key} className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
    <span className="lj-beat inline-block rounded-full border bg-black/80 px-5 py-2 text-lg font-black tracking-tight text-white sm:text-2xl" style={{ borderColor: color, boxShadow: `0 0 26px ${color}66` }}>{shown.text}</span>
  </div>;
}

/** The pieces each side has lost so far (ids missing from the board, compared with the starting set). */
export function CapturedTray({ pieces, names }: { pieces: Piece[]; names: [string, string] }) {
  const t = useTranslations('LaserJanggi');
  const here = new Set(pieces.map((p) => p.id));
  const lost = initialLaserPieces().filter((p) => !here.has(p.id));
  return <div className="space-y-2">
    {([0, 1] as const).map((owner) => {
      const mine = lost.filter((p) => p.owner === owner);
      return <div key={owner} className="flex items-center gap-2">
        <span className="w-16 shrink-0 truncate text-[10px] font-bold" style={{ color: owner === 0 ? LASER_CYAN : LASER_RED }}>{names[owner]}</span>
        {mine.length ? <span className="flex flex-wrap gap-1">{mine.map((p) => <span key={p.id} className="h-6 w-6 opacity-70"><LaserPiece piece={p} /></span>)}</span> : <span className="text-[10px] text-white/30">{t('noneLost')}</span>}
      </div>;
    })}
  </div>;
}

/** The last moves, newest first: who, what (step or turn) and what the shot did. */
export function MoveLog({ shots, names }: { shots: LaserShot[]; names: [string, string] }) {
  const t = useTranslations('LaserJanggi');
  const rows = shots.map((shot, i) => ({ shot, n: i + 1 })).reverse().slice(0, 8);
  if (!rows.length) return <p className="text-[11px] text-white/35">{t('logEmpty')}</p>;
  return <ol className="space-y-1">
    {rows.map(({ shot, n }) => {
      const m = shot.moved;
      const a = shot.action;
      const what = !m || !a ? '' : a.type === 'move' ? `${t(`pieces.${m.type}.name`)} ${square(m.row, m.col)}→${square(a.row, a.col)}` : `${t(`pieces.${m.type}.name`)} ${square(m.row, m.col)} ${a.delta > 0 ? '↻' : '↺'}`;
      const result = shot.kingHits.length ? t('logKing') : shot.captured.length ? t('logHit', { n: shot.captured.length }) : '';
      return <li key={n} className="flex items-center gap-2 text-[11px] leading-5">
        <span className="w-6 shrink-0 font-mono text-white/30">{n}</span>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: shot.owner === 0 ? LASER_CYAN : LASER_RED }} />
        <span className="min-w-0 flex-1 truncate text-white/65"><b className="font-bold text-white/80">{names[shot.owner]}</b> {what}</span>
        {result && <span className={`shrink-0 font-black ${shot.kingHits.length ? 'text-[#ffd166]' : 'text-[#ff9fb0]'}`}>{result}</span>}
      </li>;
    })}
  </ol>;
}

/** Header toggle for the laser sounds. */
export function LaserSoundToggle() {
  const t = useTranslations('LaserJanggi');
  const [on, setOn] = useState(true);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the stored choice is only readable in the browser
  useEffect(() => { setOn(laserSoundOn()); }, []);
  return <button type="button" title={t('sound')} aria-label={t('sound')} onClick={() => { setLaserSound(!on); setOn(!on); }} className={BTN}>{on ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>;
}

/** Shown under the board while the opponent could hit your king next turn (and no move is being previewed). */
export function DangerNote({ play }: { play: ReturnType<typeof useLaserPlay> }) {
  const t = useTranslations('LaserJanggi');
  if (!play.danger.length || play.preview) return null;
  return <p className="mx-auto mt-3 flex max-w-[700px] items-center gap-1.5 rounded-md border border-[#ff4d6d]/50 bg-[#ff4d6d]/10 px-3 py-2 text-[12px] font-bold text-[#ffb3c1]"><AlertTriangle size={14} className="shrink-0" />{t('dangerKing')}</p>;
}
