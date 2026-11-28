"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Clock3, Eye, Flag, Shuffle, Trash2, Volume2, VolumeX } from 'lucide-react';
import {
  MO_MOVE_LIMIT, type MineOblivion, type MoSeat, type MoStep, canBury, legalMoves, moFrames, other, respawnOptions, treasuresBy,
} from '@/lib/mineOblivion';
import { MO_MEMORIZE_MS, MO_WARN_SEC, type MoRoom, type MoRoomAction } from '@/lib/mineOblivionRoom';
import { BTN, BTN_ACCENT } from '../ui/gameUi';
import { type MoCopy, endingText } from './copy';
import MineOblivionBoard, { type MoFlash, type ShownMine } from './MineOblivionBoard';
import type { MoItemsView } from './MineOblivionItems';
import { MineStone, ShieldRing, TreasureStone, WALKER, WalkerStone } from './MineStones';
import { moSoundOn, playBlast, playBury, playNumber, playSaved, playStep, playTreasure, setMoSound } from './sound';
import { useChatStatus } from '@/hooks/useChatStatus';

export const moName = (room: MoRoom, seat: MoSeat, mySeat: number | null, t: MoCopy) =>
  seat === mySeat ? t.you : room.ai[seat] && !room.away?.[seat] ? `${t.ai} · ${t.levelName[room.level]}` : room.seats[seat]?.name ?? t.opp;

/** Who scored each footprint cell (the first step that announced a number there). */
export function footprints(g: MineOblivion, upTo = g.log.length) {
  const seen = new Map<number, MoSeat>();
  for (const s of g.log.slice(0, upTo)) if (s.number !== null && !seen.has(s.to)) seen.set(s.to, s.seat);
  return [...seen.entries()].map(([cell, seat]) => ({ cell, seat }));
}

/** Every mine, for the end reveal and 복기: exploded ones (before `upTo`) are left out (the crater shows). */
export function allMines(g: MineOblivion, gone: number[], state: ShownMine['state'] = 'armed'): ShownMine[] {
  const out = new Map<number, ShownMine>();
  const dead = new Set(gone);
  g.buried.forEach((list, s) => list.forEach((cell) => {
    if (dead.has(cell)) return;
    const prev = out.get(cell);
    out.set(cell, { cell, owner: prev ? 2 : (s as MoSeat), state });
  }));
  return [...out.values()];
}

export function stepFlash(step: MoStep, savedText = '!'): MoFlash {
  if (step.shielded) return { cell: step.to, text: savedText, tone: 'saved', key: `s${step.n}`, number: null };
  const tone = step.kind;
  const text = tone === 'treasure' ? `+${step.gain}` : tone === 'blank' ? '0' : tone === 'mine' ? '−5' : String(step.number ?? 0);
  return { cell: step.to, text, tone, key: `s${step.n}`, number: step.number };
}

export function stepLine(step: MoStep, who: string, t: MoCopy) {
  return step.shielded ? t.saw.saved(who) : step.kind === 'mine' ? t.saw.mine(who) : step.kind === 'treasure' ? t.saw.treasure(who, step.treasure ?? 0) : step.kind === 'blank' ? t.saw.blank(who) : t.saw.score(who, step.number ?? 0);
}

/** 묻기 → 이동 → 결과 */
export function PhaseSteps({ t, phase }: { t: MoCopy; phase: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center justify-center gap-1.5 text-[11px] font-black" aria-label="phase">
      {t.phases.map((label, i) => (
        <li key={label} className="flex items-center gap-1.5">
          {i > 0 && <span className={`h-px w-4 ${i <= phase ? 'bg-(--accent)' : 'bg-white/15'}`} />}
          <span aria-current={i === phase ? 'step' : undefined} className={`rounded-full px-2.5 py-0.5 ${i === phase ? 'bg-(--accent) text-(--accent-ink)' : i < phase ? 'border border-(--accent)/50 text-(--accent)' : 'border border-white/15 text-white/40'}`}>{i + 1} {label}</span>
        </li>
      ))}
    </ol>
  );
}

function Seat({ room, seat, mySeat, t, active, right }: { room: MoRoom; seat: MoSeat; mySeat: number | null; t: MoCopy; active: boolean; right?: boolean }) {
  const g = room.game;
  const found = treasuresBy(g, seat);
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-[12px] border px-2 py-1 transition ${right ? 'flex-row-reverse text-right' : ''} ${active ? 'border-(--accent)/70 bg-(--accent)/10 shadow-[0_0_18px_rgba(255,176,32,.18)]' : 'border-white/10 bg-black/30'}`}>
      <WalkerStone seat={seat} size={30} glow={active} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold text-white/70">{moName(room, seat, mySeat, t)}</p>
        <p className={`flex items-center gap-1 ${right ? 'justify-end' : ''}`}>
          <b className="font-mono text-xl font-black leading-6 tabular-nums" style={{ color: WALKER[seat].color }}>{g.score[seat]}</b>
          {Array.from({ length: found }, (_, i) => <TreasureStone key={i} size={14} />)}
        </p>
      </div>
    </div>
  );
}

/** The game screen: shared by the AI match and rooms. */
export default function MineOblivionTable({ room, mySeat, onAction, t, rooms = false, reveal = false, items = null }: {
  room: MoRoom; mySeat: number | null; onAction: (a: MoRoomAction) => void; t: MoCopy; rooms?: boolean; reveal?: boolean;
  /** The AI match's item bar and effects (src/components/mineOblivion/MineOblivionItems.tsx); rooms pass nothing. */
  items?: MoItemsView | null;
}) {
  const g = room.game;
  const me = (mySeat === 0 || mySeat === 1 ? mySeat : null) as MoSeat | null;
  const view: MoSeat = me ?? 0;
  const [picks, setPicks] = useState<number[]>([]);
  const [sent, setSent] = useState<{ gid: string; cells: number[] } | null>(null);
  const [now, setNow] = useState(0);
  const [sound, setSound] = useState(true);
  // When this browser first saw the walk begin (guests cannot trust the host's clock for a short moment like this).
  const [walkSeen, setWalkSeen] = useState<{ gid: string; at: number } | null>(null);
  const [confirmResign, setConfirmResign] = useState(false);

  useEffect(() => { const id = window.setTimeout(() => setSound(moSoundOn()), 0); return () => window.clearTimeout(id); }, []);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);
  // A new game: clear the local picks.
  const gidRef = useRef(g.gid);
  useEffect(() => {
    if (gidRef.current === g.gid) return;
    gidRef.current = g.gid;
    const id = window.setTimeout(() => { setPicks([]); setConfirmResign(false); }, 0);
    return () => window.clearTimeout(id);
  }, [g.gid]);
  useEffect(() => {
    if (g.phase !== 'walk' || walkSeen?.gid === g.gid) return;
    const id = window.setTimeout(() => setWalkSeen({ gid: g.gid, at: g.log.length ? 0 : Date.now() }), 0);
    return () => window.clearTimeout(id);
  }, [g.phase, g.gid, g.log.length, walkSeen]);

  // Sounds for each new step.
  const lastStep = g.log.length ? g.log[g.log.length - 1] : null;
  const stepRef = useRef(g.log.length);
  useEffect(() => {
    if (g.log.length <= stepRef.current) { stepRef.current = g.log.length; return; }
    stepRef.current = g.log.length;
    if (!lastStep) return;
    playStep();
    if (lastStep.shielded) playSaved();
    else if (lastStep.kind === 'mine') playBlast();
    else if (lastStep.kind === 'treasure') playTreasure();
    else if (lastStep.number !== null) playNumber(lastStep.number);
  }, [g.log.length, lastStep]);

  const myMines = useMemo(() => (me === null ? [] : g.buried[me].length ? g.buried[me] : sent?.gid === g.gid ? sent.cells : []), [me, g.buried, g.gid, sent]);
  const memorizing = g.phase === 'walk' && !reveal && walkSeen?.gid === g.gid && walkSeen.at > 0 && now > 0 && now < walkSeen.at + MO_MEMORIZE_MS && g.log.length === 0;
  const memoLeft = memorizing ? Math.max(1, Math.ceil((walkSeen!.at + MO_MEMORIZE_MS - now) / 1000)) : 0;
  const finished = g.phase === 'finished';
  const phase: 0 | 1 | 2 = g.phase === 'bury' ? 0 : finished ? 2 : 1;
  const waiting = g.phase === 'walk' ? (g.respawn ?? g.turn) : null;
  const myTurn = me !== null && waiting === me && !memorizing;
  const respawning = me !== null && g.respawn === me;
  const probing = !!items?.probeCells && myTurn && !respawning;
  const targets = g.phase === 'bury'
    ? (me !== null && !g.ready[me] ? Array.from({ length: g.size * g.size }, (_, i) => i).filter((c) => canBury(c, g.size)) : [])
    : items?.busy ? []
      : probing ? items!.probeCells!
        : myTurn ? (respawning ? respawnOptions(g, me) : legalMoves(g, me)) : [];

  const frames = useMemo(() => (finished ? moFrames(g) : null), [finished, g]);
  const shown: ShownMine[] = useMemo(() => {
    if (finished) return allMines(g, g.craters);
    if (g.phase === 'bury' && me !== null) return (g.ready[me] ? myMines : picks).map((cell) => ({ cell, owner: me, state: 'armed' as const }));
    if (memorizing && me !== null) return myMines.map((cell) => ({ cell, owner: me, state: 'dormant' as const, fading: true }));
    // 기억 되살리기: my live mines, fading in and out.
    if (items?.recall && me !== null && g.phase === 'walk') return myMines.filter((c) => !g.craters.includes(c)).map((cell) => ({ cell, owner: me, state: 'dormant' as const, recall: true }));
    return [];
  }, [finished, g, me, myMines, picks, memorizing, items?.recall]);

  const flash = lastStep && !finished ? stepFlash(lastStep, t.savedFlash) : null;
  const nameOf = (s: MoSeat) => moName(room, s, mySeat, t);
  // The room chat's status line (my move / whose move); the turn clock comes from the room.
  useChatStatus(rooms && !finished && waiting !== null ? { mine: myTurn, who: waiting === me ? null : nameOf(waiting) } : null);
  const secLeft = rooms && !finished && room.deadline < Number.MAX_SAFE_INTEGER / 2 && now > 0 ? Math.max(0, Math.ceil((room.deadline - now) / 1000)) : null;

  const tap = (cell: number) => {
    if (g.phase === 'bury') {
      if (me === null || g.ready[me]) return;
      setPicks((list) => {
        if (list.includes(cell)) { playBury(false); return list.filter((c) => c !== cell); }
        if (list.length >= g.mines) return list;
        playBury(true);
        return [...list, cell];
      });
      return;
    }
    if (!myTurn || items?.busy) return;
    items?.onBoardTap();
    if (probing) { items!.onProbe(cell); return; }
    onAction(respawning ? { t: 'respawn', to: cell } : { t: 'move', to: cell });
  };
  const fillRandom = () => setPicks((list) => {
    const pool = Array.from({ length: g.size * g.size }, (_, i) => i).filter((c) => canBury(c, g.size) && !list.includes(c));
    const out = [...list];
    while (out.length < g.mines && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  });
  const submit = () => {
    if (me === null || picks.length !== g.mines) return;
    setSent({ gid: g.gid, cells: picks });
    onAction({ t: 'bury', cells: picks });
  };

  const prompt = (() => {
    if (finished) return null;
    if (g.phase === 'bury') return me === null ? t.buryWaitOpp : g.ready[me] ? (g.ready[other(me)] ? t.buryOppReady : t.buryWaitMe) : t.buryHelp(g.mines);
    if (memorizing) return null;
    if (waiting === null) return null;
    if (g.respawn !== null) return g.respawn === me ? t.respawnYou : t.respawnOpp(nameOf(g.respawn));
    return waiting === me ? t.turnYou : t.turnOpp(nameOf(waiting));
  })();

  const board = (
    <MineOblivionBoard
      size={g.size} view={view} pos={g.phase === 'bury' ? null : g.pos}
      scored={footprints(g)} craters={g.craters}
      treasures={g.treasures.map((tr) => ({ cell: tr.cell, found: tr.by !== null }))}
      mines={shown} zones={g.phase === 'bury' ? 'bury' : 'walk'}
      targets={targets} targetTone={g.phase === 'bury' ? 'bury' : probing ? 'probe' : respawning ? 'respawn' : 'move'} onCell={tap}
      flash={flash} shakeKey={lastStep?.kind === 'mine' && !lastStep.shielded && !finished ? `x${lastStep.n}` : null}
      probe={items?.probe ?? null} shield={me !== null && g.suit?.[me] && !finished ? me : null}
      trails={finished && frames ? frames[frames.length - 1].trail : null} ownerRings={finished}
      me={me} names={[nameOf(0), nameOf(1)]} label={t.title}
    />
  );

  return (
    <div className="mx-auto grid w-full max-w-[920px] gap-3 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-2" data-testid="mo-play">
        <PhaseSteps t={t} phase={phase} />
        <div className="flex items-stretch gap-2">
          <Seat room={room} seat={view} mySeat={mySeat} t={t} active={waiting === view && !finished} />
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-0.5 text-center">
            <span className="flex items-center gap-1 font-mono text-[13px] font-black text-white/85"><MineStone size={16} state="dormant" />{g.phase === 'bury' ? '?' : g.minedCells}</span>
            <span className="text-[9px] font-bold text-white/40">{t.minedCells}</span>
            <span className="mt-0.5 font-mono text-[10px] text-white/45">{t.moveCount} {t.ofMoves(g.log.length, MO_MOVE_LIMIT)}</span>
          </div>
          <Seat room={room} seat={other(view)} mySeat={mySeat} t={t} active={waiting === other(view) && !finished} right />
        </div>
        {/* status line */}
        <div className={`flex min-h-8 items-center gap-2 rounded-[10px] border px-3 py-1 text-[12px] font-bold ${myTurn || (g.phase === 'bury' && me !== null && !g.ready[me]) ? 'border-(--accent)/60 bg-(--accent)/12 text-white' : 'border-white/10 bg-black/35 text-white/70'}`} role="status" aria-live="polite">
          {memorizing ? (
            <span className="flex flex-1 items-center gap-2"><Brain size={16} className="shrink-0 text-(--accent)" /><span className="break-keep"><b className="text-(--accent)">{t.memorize}</b> · {t.memorizeSub(memoLeft)}</span></span>
          ) : <span className="flex-1 break-keep">{prompt ?? (finished ? endingText(t, g.ending, MO_MOVE_LIMIT, g.resigned !== undefined ? nameOf(g.resigned) : '') : '…')}</span>}
          {secLeft !== null && !memorizing && <span className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[12px] ${secLeft <= MO_WARN_SEC ? 'bg-[#ff3b30] text-white' : 'bg-white/10 text-white/80'}`}><Clock3 size={12} />{t.clock(secLeft)}</span>}
          <button type="button" onClick={() => { const on = !sound; setSound(on); setMoSound(on); }} aria-label={t.sound} className="shrink-0 rounded-md p-1 text-white/45 hover:bg-white/10 hover:text-white">{sound ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>
        </div>
        {g.phase !== 'bury' && <div className="lg:hidden"><Announcement room={room} t={t} step={lastStep} nameOf={nameOf} finished={finished} compact /></div>}
        {board}
        {items?.bar}
        {g.phase === 'bury' && me !== null && !g.ready[me] && (
          <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
            <span className="flex items-center gap-1 rounded-md border border-white/10 bg-black/40 px-2.5 py-2 font-mono text-sm font-black"><MineStone size={18} state="armed" />{t.buryCount(picks.length, g.mines)}</span>
            <button type="button" onClick={picks.length >= g.mines ? () => setPicks([]) : fillRandom} className={`${BTN} py-2.5`}>{picks.length >= g.mines ? <><Trash2 size={14} />{t.buryClear}</> : <><Shuffle size={14} />{t.buryRandom}</>}</button>
            <button type="button" onClick={submit} disabled={picks.length !== g.mines} className={`${BTN_ACCENT} py-2.5`}>{t.buryDone}</button>
          </div>
        )}
        {g.phase === 'bury' && me !== null && !g.ready[me] && <p className="break-keep px-1 text-[11px] leading-4 text-white/45">{t.buryTip}</p>}
      </div>
      <aside className="grid gap-2">
        {g.phase !== 'bury' && <div className="hidden lg:block"><Announcement room={room} t={t} step={lastStep} nameOf={nameOf} finished={finished} /></div>}
        {finished && (
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-white/60">
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full" style={{ boxShadow: `0 0 0 2px ${WALKER[view].color}` }} />{t.revealMine}</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full" style={{ boxShadow: `0 0 0 2px ${WALKER[other(view)].color}` }} />{t.revealOpp}</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full" style={{ boxShadow: '0 0 0 2px #c084fc' }} />{t.revealBoth}</span>
            <span className="flex items-center gap-1.5"><i className="h-0.5 w-4" style={{ background: WALKER[0].color }} /><i className="h-0.5 w-4" style={{ background: WALKER[1].color }} />{t.path}</span>
          </p>
        )}
        <div className="rounded-[12px] border border-white/10 bg-black/35 p-3 text-[11px] leading-4 text-white/60">
          <p className="flex items-center gap-1.5 font-black text-white/80"><Eye size={13} className="text-(--accent)" />{t.seeTitle}</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ul className="space-y-1">{t.see.map((line) => <li key={line} className="break-keep">· {line}</li>)}</ul>
            <ul className="space-y-1 text-(--accent)/85">{t.remember.map((line) => <li key={line} className="break-keep"><Brain size={10} className="mr-1 inline" />{line}</li>)}</ul>
          </div>
          <p className="mt-2 break-keep border-t border-white/10 pt-2 text-white/45">{t.legend}</p>
        </div>
        {g.phase === 'walk' && me !== null && (
          <div className="flex justify-end">
            {confirmResign
              ? <span className="flex items-center gap-2 text-[11px] text-white/60">{t.resignConfirm}<button type="button" onClick={() => onAction({ t: 'resign' })} className="rounded-md bg-[#ff3b30] px-2.5 py-1.5 font-black text-white">{t.resign}</button><button type="button" onClick={() => setConfirmResign(false)} className={BTN}>{t.close}</button></span>
              : <button type="button" onClick={() => setConfirmResign(true)} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-white/35 hover:bg-white/10 hover:text-white/70"><Flag size={12} />{t.resign}</button>}
          </div>
        )}
      </aside>
    </div>
  );
}

/** The last move, as announced: who, what, and the number in large type. Replaced by the next move. */
function Announcement({ room, t, step, nameOf, finished, compact = false }: { room: MoRoom; t: MoCopy; step: MoStep | null; nameOf: (s: MoSeat) => string; finished: boolean; compact?: boolean }) {
  void room;
  const h = compact ? 'min-h-[48px] py-1' : 'min-h-[64px] py-2';
  if (!step) return <div className={`flex ${h} items-center justify-center rounded-[12px] border border-dashed border-white/12 bg-black/25 px-3 text-center text-[11px] text-white/40 break-keep`}>{t.legend}</div>;
  const big = step.shielded ? '0' : step.kind === 'mine' ? '−5' : step.kind === 'blank' ? '0' : step.kind === 'treasure' ? `+${step.gain}` : String(step.number);
  const color = step.shielded ? '#5ee0ff' : step.kind === 'mine' ? '#ff6b5a' : step.kind === 'treasure' ? '#ffd23f' : step.kind === 'blank' ? '#9aa3ad' : '#ffffff';
  return (
    <div key={step.n} className={`mo-pop flex ${h} items-center gap-3 rounded-[12px] border px-3 ${step.kind === 'mine' ? 'border-[#ff6b5a]/60 bg-[#ff3b30]/12' : step.kind === 'treasure' ? 'border-[#ffd23f]/60 bg-[#ffd23f]/10' : 'border-white/12 bg-black/40'}`}>
      <span className={`relative flex shrink-0 items-center justify-center ${compact ? 'h-9 w-9' : 'h-12 w-12'}`}>
        {step.shielded ? <span className="relative block" style={{ width: compact ? 34 : 44, height: compact ? 34 : 44 }}><WalkerStone seat={step.seat} size={compact ? 30 : 40} className="absolute inset-0 m-auto" /><ShieldRing burst className="absolute inset-[-10%] h-[120%] w-[120%]" /></span>
          : step.kind === 'mine' ? <MineStone size={compact ? 38 : 48} state="blast" /> : step.kind === 'treasure' ? <TreasureStone size={compact ? 34 : 44} /> : <WalkerStone seat={step.seat} size={compact ? 32 : 42} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-bold text-white/80">{stepLine(step, nameOf(step.seat), t)}</p>
        <p className={`text-[10px] leading-4 text-white/45 break-keep ${compact ? 'line-clamp-1' : ''}`}>{step.kind === 'mine' ? (compact ? t.whoMine : `${t.craterNote} ${t.whoMine}`) : finished ? '' : t.sawHint}</p>
      </div>
      <b className={`shrink-0 font-mono font-black tabular-nums ${compact ? 'text-2xl' : 'text-3xl'}`} style={{ color }}>{big}</b>
    </div>
  );
}

