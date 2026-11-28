"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Dices, Eraser, Loader2, Lock, Timer } from 'lucide-react';
import {
  type Gradation, GR_CUPS, GR_PERSONA, GR_ROUNDS, GR_SUM, GR_TIER_COUNT, grRandomRow, grTier, grUsed, grValid, grWaitingOn,
} from '@/lib/gradation';
import { type GradationRoom, type GradationRoomAction, GR_WARN_SEC } from '@/lib/gradationRoom';
import { useGradationChampion } from '@/hooks/useGradationChampion';
import { PANEL, PANEL_TITLE, accentVars } from '../ui/gameUi';
import { GR_ACCENT, GR_INK, type GrCopy } from './copy';
import { GradationCrown, GrAvatar, GrCube, GrCup } from './GradationParts';
import { Stone } from '../StoneAvatar';

type Props = {
  room: GradationRoom;
  mySeat: number | null;
  onAction: (action: GradationRoomAction) => void;
  t: GrCopy;
  locale: string;
  /** The signed-in player's nickname (for the champion badge on "me"). */
  myNick?: string | null;
};

const NEVER = Number.MAX_SAFE_INTEGER / 2;
const POSITIONS = Array.from({ length: GR_CUPS }, (_, p) => p);

function buzz(pattern: number | number[]) {
  try { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(pattern); } catch { /* optional */ }
}

function useCountdown(deadline: number, on: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [on]);
  return on && deadline < NEVER ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
}

export default function GradationTable({ room, mySeat, onAction, t, locale, myNick }: Props) {
  const g = room.game;
  const en = locale === 'en';
  const me = mySeat ?? 0;
  const opp = 1 - me;
  const champion = useGradationChampion();
  const persona = room.style ? GR_PERSONA[room.style] : null;
  const nameOf = (s: number) => {
    if (s === mySeat) return t.you;
    if (room.ai[s] && persona) return en ? persona.nameEn : persona.name;
    return room.seats[s]?.name ?? `P${s + 1}`;
  };
  // The badge follows the ranking: my own nickname, or a room opponent's name.
  const isChamp = (s: number) => {
    if (!champion || room.ai[s]) return false;
    const name = s === mySeat ? myNick : room.seats[s]?.name;
    return !!name && name.trim() === champion.trim();
  };
  const colorOf = (s: number) => (room.ai[s] && persona ? persona.color : s === mySeat ? GR_ACCENT : '#e8b84f');
  const playing = room.phase === 'playing';
  const waiting = playing ? grWaitingOn(g) : [];
  const myTurn = mySeat !== null && waiting.includes(mySeat) && !room.ai[mySeat];
  const seconds = useCountdown(room.deadline, playing && (g.phase === 'place' || !room.solo));

  const wasMyTurn = useRef(false);
  useEffect(() => {
    if (myTurn && !wasMyTurn.current) buzz(28);
    wasMyTurn.current = myTurn;
  }, [myTurn]);

  // The cup picked in my rack this round.
  const turnKey = `${g.set}-${g.log.length}-${g.phase}`;
  const [chosen, setChosen] = useState<{ key: string; pos: number } | null>(null);
  const pick = chosen?.key === turnKey ? chosen.pos : null;
  const submitPick = () => { if (pick !== null) { onAction({ t: 'act', action: { kind: 'pick', pos: pick } }); setChosen(null); } };

  // Placing: my draft row (sorted), kept per match.
  const [draft, setDraft] = useState<{ set: number; gid: string; cubes: number[] }>({ set: g.set, gid: g.gid, cubes: [] });
  const cubes = useMemo(() => (draft.set === g.set && draft.gid === g.gid ? draft.cubes : []), [draft, g.set, g.gid]);
  const setCubes = (next: number[]) => setDraft({ set: g.set, gid: g.gid, cubes: [...next].sort((a, b) => a - b) });
  const placing = g.phase === 'place' && mySeat !== null && !g.ready[me];
  const submitRow = () => { if (grValid(cubes)) onAction({ t: 'act', action: { kind: 'place', row: cubes } }); };
  // Time nearly up with a finished draft: hand it in rather than get a random row.
  const autoSent = useRef('');
  useEffect(() => {
    if (placing && seconds !== null && seconds <= 1 && grValid(cubes) && autoSent.current !== turnKey) {
      autoSent.current = turnKey;
      onAction({ t: 'act', action: { kind: 'place', row: cubes } });
    }
  }, [placing, seconds, cubes, onAction, turnKey]);

  const last = g.log[g.log.length - 1];
  const revealing = g.phase === 'reveal' && !!last;

  return (
    <div className="mx-auto grid w-full max-w-[1100px] gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-2 pb-[calc(env(safe-area-inset-bottom)+84px)] sm:gap-3 lg:pb-6">
        <Scoreboard g={g} me={me} opp={opp} nameOf={nameOf} colorOf={colorOf} isChamp={isChamp} t={t} waiting={waiting} ai={room.ai}
          stoneOf={(s) => (room.ai[s] ? null : s === mySeat ? myNick || t.you : room.seats[s]?.name ?? null)} />

        {g.phase === 'place' ? (
          placing
            ? <PlaceBoard cubes={cubes} setCubes={setCubes} t={t} />
            : <PlacedWait g={g} me={me} opp={opp} t={t} ai={room.ai[opp]} />
        ) : (
          <>
            <OppRack g={g} opp={opp} t={t} />
            <Arena g={g} me={me} opp={opp} t={t} nameOf={nameOf} revealing={revealing} pick={pick} />
            <MyRack g={g} me={me} t={t} canPick={myTurn && (g.phase === 'lead' || g.phase === 'follow')} pick={pick}
              onPick={(pos) => setChosen({ key: turnKey, pos })} />
            <RoundTrack g={g} me={me} opp={opp} t={t} />
          </>
        )}
      </div>

      <aside className="hidden flex-col gap-3 lg:flex">
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t.rules}</p>
          <ol className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-white/60">{t.quick.map((line, i) => <li key={i} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        </section>
        {g.phase !== 'place' && <section className={PANEL}><RoundTrack g={g} me={me} opp={opp} t={t} list /></section>}
      </aside>

      <Layer>
        {mySeat !== null && room.phase !== 'finished' && (
          <Dock g={g} me={me} t={t} myTurn={myTurn} seconds={seconds} placing={placing} cubes={cubes} pick={pick}
            onSubmitRow={submitRow} onSubmitPick={submitPick} waitingName={waiting.length ? nameOf(waiting[0]) : null} winnerName={last && last.win >= 0 ? nameOf(last.win) : ''}
            aiWaiting={waiting.some((s) => room.ai[s])} revealing={revealing} solo={room.solo} />
        )}
      </Layer>
    </div>
  );
}

const noop = () => () => {};
/** Wider than a phone (the sm breakpoint). */
function useWide() {
  return useSyncExternalStore(
    (fn) => { const m = window.matchMedia('(min-width: 640px)'); m.addEventListener('change', fn); return () => m.removeEventListener('change', fn); },
    () => window.matchMedia('(min-width: 640px)').matches, () => false,
  );
}
/** Dock goes straight into <body> so the site's floating widgets never cover it. */
function Layer({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<div style={accentVars(GR_ACCENT, GR_INK)} className="relative z-[70] text-[#e6e9f0]">{children}</div>, document.body);
}

/* ------------------------------------------------------------------ scoreboard */

function Scoreboard({ g, me, opp, nameOf, colorOf, isChamp, t, waiting, ai, stoneOf }: {
  g: Gradation; me: number; opp: number; nameOf: (s: number) => string; colorOf: (s: number) => string; isChamp: (s: number) => boolean;
  t: GrCopy; waiting: number[]; ai: boolean[]; stoneOf: (s: number) => string | null;
}) {
  const side = (s: number, right: boolean) => {
    const leading = g.phase !== 'place' && g.phase !== 'finished' && g.leader === s;
    const acting = waiting.includes(s) && g.phase !== 'place';
    return (
      <div className={`flex min-w-0 items-center gap-2 ${right ? 'flex-row-reverse text-right' : ''}`}>
        <span className={`relative rounded-full ${acting ? 'ring-2 ring-(--accent) ring-offset-2 ring-offset-[#1a1426]' : ''}`}>
          {stoneOf(s) ? <Stone name={stoneOf(s)!} size={34} /> : <GrAvatar name={nameOf(s)} color={colorOf(s)} size={34} />}
          {ai[s] && <Bot size={12} className="absolute -bottom-1 -right-1 rounded-full bg-[#1a1426] p-[1px] text-white/70" />}
        </span>
        <div className="min-w-0">
          <p className={`flex items-center gap-1 text-[13px] font-black ${right ? 'flex-row-reverse' : ''}`}>
            <span className="truncate">{nameOf(s)}</span>
            {isChamp(s) && <GradationCrown size={17} title={t.champion} />}
          </p>
          <p className={`flex h-4 items-center gap-1 ${right ? 'justify-end' : ''}`}>
            {leading && <span className="rounded-[3px] bg-[#ffd36b] px-1 text-[9px] font-black leading-[14px] text-[#2a1d00]">{t.lead}</span>}
            {acting && <span className="flex gap-0.5">{[0, 1, 2].map((i) => <i key={i} className="h-1 w-1 animate-pulse rounded-full bg-(--accent)" style={{ animationDelay: `${i * 0.2}s` }} />)}</span>}
          </p>
        </div>
      </div>
    );
  };
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-[14px] border border-[#8a6fd1]/30 bg-[linear-gradient(180deg,rgba(72,48,120,.55),rgba(30,22,48,.85))] px-2.5 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,.45)] sm:px-4 sm:py-3">
      {side(me, false)}
      <div className="flex flex-col items-center">
        <p className="font-serif text-[11px] font-bold tracking-[0.12em] text-[#e9dcff] sm:text-[13px]">
          {g.phase === 'place' ? t.placeTitle : t.round(Math.min(g.log.length + (g.phase === 'reveal' ? 0 : 1), GR_ROUNDS))}
          {g.set > 1 && <span className="ml-1 rounded bg-[#ff6b5e]/20 px-1 font-sans text-[9px] text-[#ff9b92]">{t.set(g.set)}</span>}
        </p>
        <div className="mt-1 flex overflow-hidden rounded-[6px] border border-[#cbb6ff]/40 bg-black/50 font-serif text-[26px] font-bold leading-none sm:text-[32px]">
          <motion.span key={`a${g.score[me]}`} initial={{ scale: 1.4, color: '#fff' }} animate={{ scale: 1, color: '#f4efff' }} className="w-9 py-0.5 text-center sm:w-11 sm:py-1">{g.score[me]}</motion.span>
          <span className="w-px bg-[#cbb6ff]/40" />
          <motion.span key={`b${g.score[opp]}`} initial={{ scale: 1.4, color: '#fff' }} animate={{ scale: 1, color: '#f4efff' }} className="w-9 py-0.5 text-center sm:w-11 sm:py-1">{g.score[opp]}</motion.span>
        </div>
      </div>
      {side(opp, true)}
    </section>
  );
}

/* ------------------------------------------------------------------ placing */

function PlaceBoard({ cubes, setCubes, t }: { cubes: number[]; setCubes: (c: number[]) => void; t: GrCopy }) {
  const sum = cubes.reduce((a, b) => a + b, 0);
  const [warn, setWarn] = useState(false);
  const warnTimer = useRef<number | null>(null);
  useEffect(() => () => { if (warnTimer.current !== null) window.clearTimeout(warnTimer.current); }, []);
  const add = (v: number) => {
    if (cubes.length >= GR_CUPS) return;
    if (sum + v > GR_SUM) {
      setWarn(true);
      if (warnTimer.current !== null) window.clearTimeout(warnTimer.current);
      warnTimer.current = window.setTimeout(() => setWarn(false), 2500);
      return;
    }
    setCubes([...cubes, v]);
  };
  const removeAt = (i: number) => setCubes(cubes.filter((_, k) => k !== i));
  const count = (v: number) => cubes.filter((c) => c === v).length;
  const left = GR_CUPS - cubes.length;
  const pct = Math.min(100, (sum / GR_SUM) * 100);
  return (
    <section className="rounded-[14px] border border-white/10 bg-[#141119]/90 p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11.5px] leading-relaxed text-white/55 break-keep">{t.placeHint}</p>
      </div>
      {/* the rack, dark → white → dark */}
      <div className="mx-auto mt-3 grid max-w-[460px] grid-cols-7 items-end gap-1 sm:gap-2">
        {POSITIONS.map((p) => (
          <GrCup key={p} fluid tier={grTier(p)} value={cubes[p]} onClick={cubes[p] !== undefined ? () => removeAt(p) : undefined}
            label={cubes[p] !== undefined ? `${cubes[p]}` : t.shadeCup(grTier(p))} pulse={p === cubes.length} />
        ))}
      </div>
      {/* sum meter */}
      <div className="mx-auto mt-3 max-w-[460px]">
        <div className="flex items-baseline justify-between text-[11px] font-bold">
          <span className="text-white/50">{t.sum}</span>
          <span className={`font-mono text-lg font-black ${sum === GR_SUM ? 'text-(--accent)' : 'text-white'}`}>{sum}<span className="text-xs text-white/40"> / {GR_SUM}</span></span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><motion.div animate={{ width: `${pct}%` }} className="h-full rounded-full bg-[linear-gradient(90deg,#1f7f3d,#3fd67a)]" /></div>
        <p className="mt-1 h-4 text-[10.5px] font-bold text-white/45">
          {warn ? <span className="text-[#ff8a7a]">{t.tooBig}</span>
            : left > 0 ? t.pickMore(left) : sum === GR_SUM ? <span className="text-(--accent)">{t.sumFull}</span> : t.sumUnder(GR_SUM - sum)}
        </p>
      </div>
      {/* cube tray: two of each number */}
      <p className={`${PANEL_TITLE} mt-2`}>{t.cubeTray}</p>
      <div className="mt-2 grid grid-cols-10 gap-x-0.5 gap-y-1 rounded-[10px] border border-white/10 bg-black/35 p-1.5 sm:gap-x-1.5 sm:p-2.5">
        {[0, 1].map((copy) => Array.from({ length: 10 }, (_, v) => {
          const gone = count(v) > copy;
          return (
            <div key={`${copy}-${v}`} className="flex justify-center">
              <GrCube value={v} size={30} faded={gone} muted={!gone && cubes.length >= GR_CUPS} onClick={gone || cubes.length >= GR_CUPS ? undefined : () => add(v)} label={`${v}`} />
            </div>
          );
        }))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setCubes([])} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/75"><Eraser size={14} />{t.clear}</button>
        <button type="button" onClick={() => setCubes(grRandomRow())} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/75"><Dices size={14} />{t.random}</button>
      </div>
    </section>
  );
}

function PlacedWait({ g, me, opp, t, ai }: { g: Gradation; me: number; opp: number; t: GrCopy; ai: boolean }) {
  const row = g.rows[me];
  return (
    <section className="rounded-[14px] border border-white/10 bg-[#141119]/90 p-4 text-center sm:p-6">
      <p className="flex items-center justify-center gap-2 text-sm font-black text-(--accent)"><Lock size={15} />{t.placedWait}</p>
      {row && (
        <div className="mx-auto mt-4 grid max-w-[420px] grid-cols-7 items-end gap-1 sm:gap-2">
          {POSITIONS.map((p) => <GrCup key={p} fluid tier={grTier(p)} value={row[p]} />)}
        </div>
      )}
      <p className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-white/50">
        {g.ready[opp] ? <><Lock size={13} className="text-(--accent)" />{t.oppPlaced}</> : <><Loader2 size={13} className="animate-spin" />{ai ? t.aiThinking : t.oppPlacing}</>}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ rounds */

/** The other side's cups, grouped by shade: unused ones plain, used ones crossed out with their number. */
function OppRack({ g, opp, t }: { g: Gradation; opp: number; t: GrCopy }) {
  const usedByTier: number[][] = [[], [], [], []];
  for (const l of g.log) usedByTier[l.tier[opp]].push(l.value[opp]);
  const pending = g.pickTier[opp];
  return (
    <section className="rounded-[14px] border border-white/10 bg-[#141119]/80 px-2.5 py-1.5 sm:px-4 sm:py-2">
      <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t.oppRack}</p><p className="text-[9.5px] font-bold text-white/30">{t.oppRackNote}</p></div>
      <div className="mt-0.5 flex items-end justify-center gap-2.5 sm:gap-4">
        {GR_TIER_COUNT.map((n, tier) => {
          const used = usedByTier[tier];
          const cups = Array.from({ length: n }, (_, i) => i);
          const pendingHere = pending === tier ? 1 : 0;
          return (
            <div key={tier} className="flex items-end gap-0.5">
              {cups.map((i) => {
                const k = n - 1 - i; // used cups at the right of each pair
                if (k < used.length) return <GrCup key={i} tier={tier} value={used[k]} used width={30} />;
                if (k < used.length + pendingHere) return <GrCup key={i} tier={tier} width={30} dim />;
                return <GrCup key={i} tier={tier} width={30} />;
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Arena({ g, me, opp, t, nameOf, revealing, pick }: {
  g: Gradation; me: number; opp: number; t: GrCopy; nameOf: (s: number) => string; revealing: boolean; pick: number | null;
}) {
  const last = g.log[g.log.length - 1];
  const myRow = g.rows[me];
  // This round's cups: during the reveal, the last log; otherwise whatever has been handed in.
  const mine = revealing ? { tier: last.tier[me], value: last.value[me] as number | null }
    : g.pickTier[me] !== null ? { tier: g.pickTier[me]!, value: (myRow && g.pickPos[me] !== null ? myRow[g.pickPos[me]!] : null) as number | null }
      : pick !== null && myRow ? { tier: grTier(pick), value: myRow[pick], ghost: true } : null;
  const theirs = revealing ? { tier: last.tier[opp], value: last.value[opp] as number | null }
    : g.pickTier[opp] !== null ? { tier: g.pickTier[opp]!, value: null } : null;
  const result = revealing ? (last.win === -1 ? 'tie' : last.win === me ? 'win' : 'lose') : null;
  const cupW = useWide() ? 70 : 58;
  const plate = (cup: { tier: number; value: number | null; ghost?: boolean } | null, who: number, stamp: 'win' | 'lose' | 'tie' | null) => (
    <div className="relative flex flex-col items-center">
      <p className="mb-1 max-w-[120px] truncate text-[10.5px] font-black text-white/55">{nameOf(who)}</p>
      <div className={`relative grid h-[92px] w-[86px] place-items-end justify-center rounded-[14px] border pb-1 sm:h-[132px] sm:w-[116px] sm:pb-1.5 ${cup ? 'border-white/15 bg-[radial-gradient(circle_at_50%_70%,rgba(255,255,255,.08),transparent_70%)]' : 'border-dashed border-white/10'}`}>
        <AnimatePresence mode="popLayout">
          {cup && (
            <motion.div key={`${cup.tier}-${cup.value}-${revealing}`} initial={{ y: -24, opacity: 0, scale: 0.85 }} animate={{ y: 0, opacity: cup.ghost ? 0.45 : 1, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
              <GrCup tier={cup.tier} value={cup.value} width={cupW} />
            </motion.div>
          )}
        </AnimatePresence>
        {!cup && <span className="mb-8 font-serif text-2xl text-white/15">?</span>}
        {stamp && (
          <motion.span initial={{ scale: 2.2, opacity: 0, rotate: -14 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ delay: 0.45, type: 'spring', stiffness: 260, damping: 15 }}
            className={`absolute left-1/2 top-1 -translate-x-1/2 rounded-md border-2 px-2 py-0.5 text-[13px] font-black tracking-[0.12em] ${stamp === 'win' ? 'border-(--accent) bg-(--accent)/20 text-(--accent)' : stamp === 'lose' ? 'border-[#ff6b5e] bg-[#ff6b5e]/15 text-[#ff8a7a]' : 'border-white/40 bg-white/10 text-white/70'}`}>
            {stamp === 'win' ? t.revealWin : stamp === 'lose' ? t.revealLose : t.revealTie}
          </motion.span>
        )}
      </div>
      <p className="mt-0.5 h-3.5 text-[10px] font-bold text-white/45">{cup && !revealing ? t.shadeCup(cup.tier) : ''}</p>
    </div>
  );
  const msg = revealing
    ? (last.win === -1 ? t.roundTie : t.roundWin(nameOf(last.win)))
    : null;
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#8a6fd1]/25 bg-[radial-gradient(ellipse_at_50%_100%,rgba(63,214,122,.10),transparent_60%),linear-gradient(180deg,#19141f,#0f0d13)] px-3 py-2 sm:py-4">
      <div className="flex items-start justify-center gap-4 sm:gap-10">
        {plate(mine, me, result)}
        <span className="mt-11 font-serif text-lg font-bold italic text-[#cbb6ff]/50 sm:mt-16">vs</span>
        {plate(theirs, opp, result === 'win' ? 'lose' : result === 'lose' ? 'win' : result)}
      </div>
      <AnimatePresence>{msg && <motion.p key={g.log.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }} className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center text-sm font-black text-white drop-shadow">{msg}</motion.p>}</AnimatePresence>
    </section>
  );
}

function MyRack({ g, me, t, canPick, pick, onPick }: { g: Gradation; me: number; t: GrCopy; canPick: boolean; pick: number | null; onPick: (p: number) => void }) {
  const row = g.rows[me];
  const used = grUsed(g, me);
  const inArena = g.pickPos[me];
  const left = row ? POSITIONS.filter((p) => !used[p]).reduce((a, p) => a + row[p], 0) : 0;
  return (
    <section className={`rounded-[14px] border px-2.5 pb-1.5 pt-1.5 transition sm:px-4 sm:pb-2 sm:pt-2 ${canPick ? 'border-(--accent)/45 bg-(--accent)/[0.05] shadow-[inset_0_0_30px_var(--accent-soft)]' : 'border-white/10 bg-[#141119]/80'}`}>
      <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t.myRack}</p><p className="font-mono text-[10px] font-bold text-white/35">{t.sumLeft(left)}</p></div>
      <div className="mx-auto mt-1 grid max-w-[400px] grid-cols-7 items-end gap-1 sm:mt-2 sm:max-w-[460px] sm:gap-2">
        {POSITIONS.map((p) => {
          const gone = used[p] && p !== inArena;
          return (
            <GrCup key={p} fluid tier={grTier(p)} value={row ? row[p] : null} used={gone} dim={p === inArena}
              selected={pick === p} onClick={canPick && !used[p] ? () => onPick(p) : undefined}
              label={row ? `${t.shadeCup(grTier(p))} ${row[p]}` : undefined} />
          );
        })}
      </div>

    </section>
  );
}

/** Seven slots: my cube over theirs, coloured by who took the round. */
function RoundTrack({ g, me, opp, t, list = false }: { g: Gradation; me: number; opp: number; t: GrCopy; list?: boolean }) {
  const slots = Array.from({ length: GR_ROUNDS }, (_, i) => g.log[i] ?? null);
  return (
    <section className={list ? '' : 'rounded-[14px] border border-white/10 bg-[#141119]/80 px-2.5 py-1.5 sm:px-4 sm:py-2 lg:hidden'}>
      {list && <p className={`${PANEL_TITLE} mb-1.5`}>{t.track}</p>}
      <div className="grid grid-cols-7 gap-1">
        {slots.map((l, i) => {
          const tone = !l ? 'border-white/10 text-white/20' : l.win === me ? 'border-(--accent)/60 bg-(--accent)/10' : l.win === opp ? 'border-[#ff6b5e]/50 bg-[#ff6b5e]/10' : 'border-white/25 bg-white/5';
          return (
            <div key={i} className={`flex flex-col items-center rounded-md border py-0.5 font-serif text-[13px] font-bold leading-[1.15] sm:py-1 sm:text-[15px] ${tone}`}>
              <span className="font-sans text-[8px] font-black text-white/35">R{i + 1}</span>
              {l ? <><span className={l.win === me ? 'text-(--accent)' : 'text-white'}>{l.value[me]}</span><span className={l.win === opp ? 'text-[#ff8a7a]' : 'text-white/70'}>{l.value[opp]}</span></> : <span className="py-[7px] text-white/15">·</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ dock */

function Dock({ g, me, t, myTurn, seconds, placing, cubes, pick, onSubmitRow, onSubmitPick, waitingName, winnerName, aiWaiting, revealing, solo }: {
  g: Gradation; me: number; t: GrCopy; myTurn: boolean; seconds: number | null; placing: boolean; cubes: number[]; pick: number | null;
  onSubmitRow: () => void; onSubmitPick: () => void; waitingName: string | null; winnerName: string; aiWaiting: boolean; revealing: boolean; solo: boolean;
}) {
  const row = g.rows[me];
  const urgent = seconds !== null && (placing ? seconds <= 30 : seconds <= GR_WARN_SEC);
  const clock = seconds !== null && (placing || myTurn || (!solo && g.phase !== 'reveal'))
    ? <span className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 font-mono text-sm font-black ${urgent ? 'animate-pulse bg-[#ff6b5e] text-white' : 'border border-white/15 bg-black/50 text-white/80'}`}><Timer size={13} />{g.phase === 'place' ? t.timeLeft(seconds) : `${seconds}`}</span>
    : null;
  const oppTier = g.pickTier[1 - me];
  let text: ReactNode;
  let button: ReactNode = null;
  if (placing) {
    text = <span>{cubes.length < GR_CUPS ? t.pickMore(GR_CUPS - cubes.length) : `${t.sum} ${cubes.reduce((a, b) => a + b, 0)}`}</span>;
    button = <button type="button" disabled={!grValid(cubes)} onClick={onSubmitRow} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-(--accent) px-4 py-3 text-sm font-black text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] disabled:opacity-35 disabled:shadow-none"><Lock size={15} />{t.confirmPlace}</button>;
  } else if (g.phase === 'place') {
    text = <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" />{t.placedWait}</span>;
  } else if (revealing) {
    const last = g.log[g.log.length - 1];
    text = <span className="font-black">{last.win === -1 ? t.roundTie : t.roundWin(winnerName)}</span>;
  } else if (myTurn) {
    text = <span className="font-black text-(--accent)">{g.phase === 'lead' ? t.myLeadTurn : t.myFollowTurn(t.shadeCup(oppTier ?? 0))}</span>;
    button = <button type="button" disabled={pick === null} onClick={onSubmitPick} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-(--accent) px-4 py-3 text-sm font-black text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] disabled:opacity-35 disabled:shadow-none">{pick !== null && row ? t.submitCup(t.shade[grTier(pick)], row[pick]) : t.submit}</button>;
  } else if (waitingName) {
    text = <span className="flex items-center gap-1.5 text-white/65">{aiWaiting && <Bot size={14} />}{g.phase === 'lead' ? t.waitLead(waitingName) : t.waitFollow(waitingName)}<Loader2 size={13} className="animate-spin" /></span>;
  }
  return (
    <div data-focus-dock className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#0d0b12]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-[760px] items-center gap-2.5">
        <div className="min-w-0 flex-1 text-[12.5px] leading-snug break-keep">{text}</div>
        {clock}
        {button}
      </div>
    </div>
  );
}
