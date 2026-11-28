"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Check, Eraser, Flag, Loader2, Timer, Undo2, X, Zap } from 'lucide-react';
import { CLD_COLORS, CLD_TARGET, type CldPaths, checkProof, leftOf, letterOf, loneColors, solve } from '@/lib/colorLinkDuel';
import { emptyPaths, lineStatus, strokeStart, strokeTo } from '@/lib/colorLinkDuelDraw';
import { type CldAction, type CldRoom, type CldSeat, CLD_COIN_MS, canDeclare, other, toPlace } from '@/lib/colorLinkDuelRoom';
import { ColorStone } from '../logic/ColorStone';
import { BTN, BTN_ACCENT, KICKER, PANEL, PANEL_TITLE, accentVars } from '../ui/gameUi';
import CldBoard from './CldBoard';
import { BoardChip } from './CldBoardPicker';
import { CLD_ACCENT, CLD_INK, type CldCopy, cldColor } from './copy';
import { useChatStatus } from '@/hooks/useChatStatus';

/** Ticks every quarter second (for the clocks). */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [active]);
  return now;
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const buzz = (pattern: number | number[]) => { try { navigator.vibrate?.(pattern); } catch { /* optional */ } };

/** A stone on its own (palette, chips). */
export function StoneIcon({ k, size = 30, dim = false }: { k: number; size?: number; dim?: boolean }) {
  return (
    <svg viewBox="0 0 1 1" width={size} height={size} className={dim ? 'opacity-25 grayscale' : ''} aria-hidden>
      <ColorStone id="cld" k={k} cx={0.5} cy={0.5} r={0.42} mood="idle" color={cldColor(k)} label={letterOf(k)} />
    </svg>
  );
}

/**
 * Overlays and the action dock go straight into <body>: the page's blurred, transformed layers would
 * otherwise trap `position: fixed` (the dock would scroll away on a phone).
 */
function Layer({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setMounted(true), 0); return () => window.clearTimeout(timer); }, []);
  if (!mounted) return null;
  return createPortal(<div style={accentVars(CLD_ACCENT, CLD_INK)} className="relative z-[70] text-[#e6e9f0]">{children}</div>, document.body);
}

export default function CldTable({ room, mySeat, dispatch, names, t, thinking = false, aside }: {
  room: CldRoom;
  mySeat: CldSeat | null;
  dispatch: (action: CldAction) => void;
  names: [string, string];
  t: CldCopy;
  thinking?: boolean;
  aside?: ReactNode;
}) {
  const en = useLocale() === 'en';
  const now = useNow(room.phase !== 'lobby' && room.phase !== 'finished');
  const me = mySeat ?? 0;
  const opp = other(me);
  const myTurn = mySeat !== null && room.phase === 'place' && room.turn === mySeat;
  const iProve = mySeat !== null && room.phase === 'proof' && room.proof?.prover === mySeat;
  const iChoose = mySeat !== null && room.phase === 'choose' && room.chooser === mySeat;
  const coinUntil = room.coin && room.phase === 'place' && room.placements === 0 ? room.startedAt + CLD_COIN_MS : 0;
  const coinShowing = now < coinUntil;

  // Haptics when something is asked of me.
  const asked = myTurn || iProve || iChoose;
  const wasAsked = useRef(false);
  useEffect(() => {
    if (asked && !wasAsked.current) buzz(iProve ? [60, 50, 60] : 28);
    wasAsked.current = asked;
  }, [asked, iProve]);

  // Stones being placed this turn (kept until the turn changes).
  const turnKey = `${room.sid}-${room.round}-${room.placements}-${room.phase}`;
  const [draftState, setDraftState] = useState<{ key: string; stones: [number, number][]; pick: number | null }>({ key: '', stones: [], pick: null });
  const draft = draftState.key === turnKey ? draftState.stones : [];
  const pick = draftState.key === turnKey ? draftState.pick : null;
  const setDraft = (stones: [number, number][], nextPick: number | null) => setDraftState({ key: turnKey, stones, pick: nextPick });
  const need = room.phase === 'place' ? toPlace(room) : 0;
  const [confirm, setConfirm] = useState<string | null>(null); // turnKey the declare confirmation is open for

  // My proof lines (with undo), sent to the room as I draw so the caller can watch.
  const proofKey = room.proof ? `${room.sid}-${room.round}-${room.proof.at}` : '';
  const [proofState, setProofState] = useState<{ key: string; paths: CldPaths; history: CldPaths[] }>({ key: '', paths: emptyPaths(), history: [] });
  const myPaths = proofState.key === proofKey ? proofState.paths : emptyPaths();
  const history = proofState.key === proofKey ? proofState.history : [];
  const stroke = useRef<{ color: number; before: CldPaths } | null>(null);
  // Pointer events can outrun renders: strokes read and write the latest lines through this ref.
  const live = useRef(proofState);
  const updateProof = (next: { key: string; paths: CldPaths; history: CldPaths[] }) => { live.current = next; setProofState(next); };
  const sent = useRef(0);
  useEffect(() => {
    if (!iProve || proofState.key !== proofKey) return;
    const wait = Math.max(0, 450 - (Date.now() - sent.current));
    const timer = window.setTimeout(() => { sent.current = Date.now(); dispatch({ t: 'draft', paths: proofState.paths }); }, wait);
    return () => window.clearTimeout(timer);
  }, [iProve, proofState, proofKey, dispatch]);

  const lastLog = room.log[room.log.length - 1];
  const reviewing = (room.phase === 'break' || room.phase === 'finished') && !!lastLog && room.reason !== 'resign';
  const shownBoard = reviewing ? lastLog.board : room.board;
  // After a round lost on a failed proof: show a way the board could have been joined, if there is one.
  const wayOut = useMemo(() => {
    if (!reviewing || lastLog.reason === 'proved' || lastLog.reason === 'timeout') return undefined;
    return solve(lastLog.board, { cap: 400_000 }).paths;
  }, [reviewing, lastLog]);
  const shownPaths: CldPaths | null = room.phase === 'proof' ? (iProve ? myPaths : room.proof?.draft ?? null)
    : reviewing ? (lastLog.reason === 'proved' ? lastLog.proof : wayOut ?? lastLog.proof) : null;
  const proofCheck = useMemo(() => (iProve ? checkProof(room.board, myPaths) : null), [iProve, room.board, myPaths]);

  const onCell = (cell: number) => {
    if (!myTurn || coinShowing) return;
    const at = draft.findIndex(([c]) => c === cell);
    if (at >= 0) { setDraft(draft.filter((_, i) => i !== at), draft[at][1]); return; }
    if (room.board[cell] || pick === null || draft.length >= need) return;
    buzz(10);
    setDraft([...draft, [cell, pick]], null);
  };
  const onStroke = (kind: 'start' | 'move' | 'end', cell: number) => {
    if (!iProve) return;
    const cur = live.current.key === proofKey ? live.current : { key: proofKey, paths: emptyPaths(), history: [] };
    const paths = cur.paths;
    if (kind === 'start') {
      const started = strokeStart(room.board, paths, cell);
      if (!started) return;
      stroke.current = { color: started.color, before: paths };
      updateProof({ ...cur, paths: started.paths });
    } else if (kind === 'move' && stroke.current) {
      const next = strokeTo(room.board, paths, stroke.current.color, cell);
      if (next !== paths) updateProof({ ...cur, paths: next });
    } else if (kind === 'end' && stroke.current) {
      const before = stroke.current.before;
      stroke.current = null;
      if (JSON.stringify(before) !== JSON.stringify(paths)) updateProof({ ...cur, history: [...cur.history, before].slice(-60) });
    }
  };

  const seconds = (room.deadline - now) / 1000;
  const clockSeat: CldSeat | null = room.phase === 'place' ? room.turn : room.phase === 'proof' ? room.proof!.prover : room.phase === 'choose' ? room.chooser : null;
  const nameOf = (seat: CldSeat) => names[seat];
  // The room chat's status line (my move / whose move); the turn clock comes from the room.
  useChatStatus(clockSeat !== null ? { mine: mySeat !== null && clockSeat === mySeat, who: clockSeat === mySeat ? null : nameOf(clockSeat) } : null);

  let status: ReactNode;
  if (room.phase === 'place') {
    if (coinShowing) status = t.coinToss;
    else if (myTurn) status = need === 0 ? t.yourTurnOnlyDeclare : room.placements === 0 ? t.yourOpen : t.yourTurn(need);
    else status = <>{t.theirTurn(nameOf(room.turn))}{thinking && <span className="ml-1.5 inline-flex items-center gap-1 text-white/45"><Loader2 size={12} className="animate-spin" />{t.thinking}</span>}</>;
  } else if (room.phase === 'proof') status = iProve ? t.proveYou : t.proveThem(nameOf(room.proof!.prover));
  else if (room.phase === 'choose') status = iChoose ? t.chooseYou : t.chooseThem(nameOf(room.chooser!));
  else if (room.phase === 'break' && lastLog) status = `${t.round(lastLog.round)} · ${lastLog.winner === me ? t.roundWin : t.roundLoss}`;
  else status = '';

  const dockOpen = mySeat !== null && (myTurn || iProve || iChoose || room.phase === 'break' || room.phase === 'proof' || room.phase === 'place');

  return (
    <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,600px)_300px] lg:justify-center">
      <div className="flex min-w-0 flex-col gap-2 pb-[calc(env(safe-area-inset-bottom)+176px)] sm:gap-3 lg:pb-[200px]">
        <ScoreBar room={room} me={me} names={names} t={t} clockSeat={clockSeat} seconds={coinShowing ? null : seconds} />
        {room.layout && <div className="flex justify-center"><BoardChip id={room.layout} t={t} en={en} /></div>}
        <p className={`flex min-h-[22px] items-center justify-center gap-1 text-center text-[13px] font-black tracking-tight sm:text-sm ${asked ? 'text-(--accent)' : 'text-white/75'}`}>
          {asked && <Zap size={13} className="shrink-0" />}<span className="break-keep">{status}</span>
        </p>
        <div className="mx-auto w-full max-w-[min(100%,calc(100svh-345px))] lg:max-w-[min(100%,calc(100svh-400px))]">
          <CldBoard
            board={shownBoard} draft={myTurn ? draft : []} lastCells={room.phase === 'place' || room.phase === 'proof' ? room.last?.cells ?? [] : []}
            paths={shownPaths} bad={proofCheck && history.length ? proofCheck.bad.filter((k) => (myPaths[k]?.length ?? 0) > 1) : []} clash={proofCheck?.clash ?? []}
            onCell={myTurn ? onCell : undefined} onStroke={iProve ? onStroke : undefined}
          />
        </div>
        {room.phase === 'proof' && <LineChips board={room.board} paths={shownPaths ?? emptyPaths()} t={t} />}
        {reviewing && lastLog.reason !== 'proved' && lastLog.reason !== 'timeout' && (
          <p className="text-center text-[12px] font-bold text-white/55">{wayOut ? t.wayOut : t.noWay}</p>
        )}
      </div>
      <aside className="hidden space-y-4 lg:block">
        <RoundLog room={room} me={me} names={names} t={t} />
        {aside}
      </aside>

      <Layer>
        <AnimatePresence>{coinShowing && <CoinToss key="coin" opener={nameOf(room.first)} t={t} />}</AnimatePresence>
        {dockOpen && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0b10]/94 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-md">
            <div className="mx-auto w-full max-w-[600px]">
              {room.phase === 'place' && myTurn && !coinShowing && (confirm === turnKey ? (
                <div className="flex flex-col gap-2">
                  <p className="break-keep text-center text-[12px] font-bold leading-5 text-white/75">{t.declareConfirm}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setConfirm(null)} className={`${BTN} h-12`}><X size={15} />{t.close}</button>
                    <button type="button" onClick={() => { setConfirm(null); dispatch({ t: 'declare' }); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#ff4d5e] text-sm font-black text-white shadow-[0_0_18px_rgba(255,77,94,.5)]"><Flag size={15} />{t.declare}</button>
                  </div>
                </div>
              ) : (
                <>
                  {need > 0 && <Palette board={room.board} draft={draft} pick={pick} onPick={(k) => setDraft(draft, pick === k ? null : k)} t={t} full={draft.length >= need} />}
                  <div className="mt-2 grid grid-cols-[auto_auto_1fr] gap-2">
                    <button type="button" disabled={!canDeclare(room)} onClick={() => setConfirm(turnKey)} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-[#ff4d5e]/60 bg-[#ff4d5e]/12 px-3 text-[12px] font-black text-[#ff8792] disabled:opacity-30"><Flag size={14} />{t.declare}</button>
                    <button type="button" disabled={!draft.length} onClick={() => setDraft(draft.slice(0, -1), null)} className={`${BTN} h-12 disabled:opacity-30`} aria-label={t.undo}><Undo2 size={15} /></button>
                    <button type="button" disabled={!need || draft.length < need} onClick={() => dispatch({ t: 'place', stones: draft })} className={`${BTN_ACCENT} h-12 text-sm`}><Check size={16} />{t.place} {need > 0 && <span className="font-mono opacity-70">{draft.length}/{need}</span>}</button>
                  </div>
                </>
              ))}
              {room.phase === 'place' && !myTurn && (
                <div className="flex h-12 items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-[12px] font-bold text-white/55">{coinShowing ? t.coinToss : t.theirTurn(nameOf(room.turn))}</p>
                  {thinking && <Loader2 size={16} className="animate-spin text-(--accent)" />}
                </div>
              )}
              {room.phase === 'proof' && (iProve ? (
                <div className="flex flex-col gap-2">
                  <p className="break-keep text-center text-[11px] leading-4 text-white/50">{t.proofHelp}</p>
                  <div className="grid grid-cols-[auto_auto_auto_1fr] gap-2">
                    <button type="button" disabled={!history.length} onClick={() => updateProof({ key: proofKey, paths: history[history.length - 1], history: history.slice(0, -1) })} className={`${BTN} h-12 disabled:opacity-30`} aria-label={t.undo}><Undo2 size={15} /></button>
                    <button type="button" onClick={() => updateProof({ key: proofKey, paths: emptyPaths(), history: [...history, myPaths] })} className={`${BTN} h-12`} aria-label={t.clear}><Eraser size={15} /></button>
                    <button type="button" onClick={() => { if (window.confirm(t.concedeConfirm)) dispatch({ t: 'concede' }); }} className={`${BTN} h-12 text-[11px]`}>{t.concede}</button>
                    <button type="button" disabled={!proofCheck?.ok} onClick={() => dispatch({ t: 'prove', paths: myPaths })} className={`${BTN_ACCENT} h-12 text-sm`}><Check size={16} />{t.submitProof}</button>
                  </div>
                </div>
              ) : (
                <p className="flex h-12 items-center justify-center gap-2 text-[12px] font-bold text-white/55"><Timer size={14} className="text-(--accent)" />{t.watching}</p>
              ))}
              {room.phase === 'choose' && (iChoose ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => dispatch({ t: 'choose', first: me })} className={`${BTN_ACCENT} h-14 text-sm`}>{t.goFirst}</button>
                  <button type="button" onClick={() => dispatch({ t: 'choose', first: opp })} className={`${BTN} h-14 text-sm`}>{t.goSecond}</button>
                </div>
              ) : <p className="flex h-12 items-center justify-center text-[12px] font-bold text-white/55">{t.chooseThem(nameOf(room.chooser!))}</p>)}
              {room.phase === 'break' && lastLog && <RoundCard room={room} me={me} names={names} t={t} now={now} onReady={() => dispatch({ t: 'ready' })} />}
            </div>
          </div>
        )}
      </Layer>
    </div>
  );
}

/* ------------------------------------------------------------------ parts */

function ScoreBar({ room, me, names, t, clockSeat, seconds }: { room: CldRoom; me: CldSeat; names: [string, string]; t: CldCopy; clockSeat: CldSeat | null; seconds: number | null }) {
  const side = (seat: CldSeat) => {
    const on = clockSeat === seat && room.phase !== 'break';
    const urgent = on && seconds !== null && seconds <= 30;
    return (
      <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-[12px] border px-2.5 py-2 ${seat === me ? '' : 'flex-row-reverse text-right'} ${on ? 'border-(--accent)/60 bg-(--accent)/[0.09] shadow-[inset_0_0_18px_var(--accent-soft)]' : 'border-white/10 bg-white/[0.03]'}`}>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-[12px] font-black sm:text-sm" style={{ justifyContent: seat === me ? 'flex-start' : 'flex-end' }}>
            {room.phase !== 'lobby' && room.first === seat && room.phase !== 'choose' && <span className="shrink-0 rounded-full bg-[#ff4d5e] px-1.5 py-[1px] text-[9px] font-black text-white">{t.firstMark}</span>}
            <span className="truncate">{names[seat]}</span>
          </p>
          <div className={`mt-1 flex gap-1 ${seat === me ? '' : 'justify-end'}`}>
            {Array.from({ length: CLD_TARGET }, (_, i) => <i key={i} className={`h-2 w-4 rounded-full ${i < room.score[seat] ? 'bg-(--accent) shadow-[0_0_8px_var(--accent-glow)]' : 'bg-white/12'}`} />)}
          </div>
        </div>
        {on && seconds !== null && (
          <span className={`shrink-0 rounded-md px-1.5 py-1 font-mono text-[13px] font-black tabular-nums sm:text-[15px] ${urgent ? 'animate-pulse bg-[#ff4d5e] text-white' : 'bg-black/50 text-white/85'}`}>{clock(seconds * 1000)}</span>
        )}
      </div>
    );
  };
  return (
    <div className="flex items-stretch gap-2">
      {side(me)}
      <div className="flex shrink-0 flex-col items-center justify-center px-0.5">
        <span className="font-mono text-[9px] font-black tracking-[0.2em] text-white/35">R{Math.min(room.round, 5)}</span>
        <span className="font-mono text-lg font-black leading-none tabular-nums">{room.score[me]}<span className="mx-0.5 text-white/30">:</span>{room.score[other(me)]}</span>
      </div>
      {side(other(me))}
    </div>
  );
}

function Palette({ board, draft, pick, onPick, t, full }: { board: number[]; draft: [number, number][]; pick: number | null; onPick: (k: number) => void; t: CldCopy; full: boolean }) {
  const lone = loneColors(board);
  return (
    <div>
      <p className="mb-1.5 text-center text-[11px] font-bold text-white/50">{pick ? t.pickCell(letterOf(pick)) : t.pickColor}</p>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: CLD_COLORS }, (_, i) => i + 1).map((k) => {
          const left = leftOf(board, k) - draft.filter(([, c]) => c === k).length;
          const used = draft.some(([, c]) => c === k);
          const off = left <= 0 || used || full;
          return (
            <button key={k} type="button" disabled={off} onClick={() => onPick(k)} aria-pressed={pick === k} aria-label={letterOf(k)}
              className={`relative flex h-[42px] items-center justify-center rounded-[10px] border transition ${pick === k ? 'border-(--accent) bg-(--accent)/20 shadow-[0_0_12px_var(--accent-glow)]' : lone.includes(k) && !used ? 'border-white/30 bg-white/[0.06]' : 'border-white/8 bg-white/[0.02]'} disabled:opacity-100`}>
              <StoneIcon k={k} size={32} dim={left <= 0 && !used} />
              {left === 1 && !used && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-(--accent)" title={t.lone} />}
              {(used || full) && left > 0 && !used && <span className="absolute inset-0 rounded-[10px] bg-black/45" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LineChips({ board, paths, t }: { board: number[]; paths: CldPaths; t: CldCopy }) {
  const status = lineStatus(board, paths);
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {status.map(({ color, cells, done }) => (
        <span key={color} className={`flex items-center gap-1 rounded-full border py-0.5 pl-0.5 pr-2 text-[11px] font-black ${done ? 'border-[#3ddc97]/50 bg-[#3ddc97]/10 text-[#7cf0bd]' : 'border-white/10 bg-white/[0.04] text-white/55'}`}>
          <StoneIcon k={color} size={20} />{done ? <Check size={12} /> : t.shortLine(cells)}
        </span>
      ))}
    </div>
  );
}

function CoinToss({ opener, t }: { opener: string; t: CldCopy }) {
  const [landed, setLanded] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setLanded(true), 1500); return () => window.clearTimeout(timer); }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05060c]/80 backdrop-blur-[3px]">
      <p className={KICKER}>{t.coinToss}</p>
      <motion.div animate={{ rotateY: landed ? 1440 : [0, 1440] }} transition={{ duration: 1.5, ease: 'easeOut' }}
        className="mt-5 flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#f5d76e] bg-[radial-gradient(circle_at_35%_30%,#fff2b0,#e0b23c_55%,#9c7414)] text-4xl font-black text-[#5a3d00] shadow-[0_0_50px_rgba(245,215,110,.5)]"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {landed ? '선' : '?'}
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: landed ? 1 : 0, y: landed ? 0 : 8 }} className="mt-5 text-2xl font-black text-white">{t.opensFirst(opener)}</motion.p>
    </motion.div>
  );
}

function RoundCard({ room, me, names, t, now, onReady }: { room: CldRoom; me: CldSeat; names: [string, string]; t: CldCopy; now: number; onReady: () => void }) {
  const log = room.log[room.log.length - 1];
  const won = log.winner === me;
  const prover = log.declarer !== null ? names[other(log.declarer)] : '';
  const reason = log.reason === 'timeout' ? t.reason.timeout(names[other(log.winner)]) : t.reason[log.reason](prover);
  return (
    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className={KICKER}>{t.round(log.round)}{log.declarer !== null ? ` · ${t.declaredBy(names[log.declarer])}` : ''}</p>
          <p className={`mt-0.5 text-xl font-black ${won ? 'text-[#ffd36b]' : 'text-white/80'}`}>{won ? t.roundWin : t.roundLoss}</p>
          <p className="break-keep text-[12px] font-bold leading-5 text-white/55">{reason}</p>
        </div>
        <p className="shrink-0 font-mono text-3xl font-black tabular-nums">{room.score[me]}<span className="mx-1 text-white/30">:</span>{room.score[other(me)]}</p>
      </div>
      <button type="button" disabled={room.ready[me]} onClick={onReady} className={`${BTN_ACCENT} h-12 text-sm`}>
        {room.ready[me] ? <><Loader2 size={14} className="animate-spin" />{t.waitingOther}</> : t.nextRound}
      </button>
      <p className="text-center font-mono text-[10px] text-white/35">{t.autoNext(Math.max(0, Math.ceil((room.deadline - now) / 1000)))}</p>
    </motion.div>
  );
}

function RoundLog({ room, me, names, t }: { room: CldRoom; me: CldSeat; names: [string, string]; t: CldCopy }) {
  if (!room.log.length) return null;
  return (
    <section className={PANEL}>
      <p className={PANEL_TITLE}>ROUNDS</p>
      <ol className="mt-3 space-y-1.5">
        {room.log.map((log) => (
          <li key={log.round} className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-2 text-[12px]">
            <span className="font-mono text-white/40">R{log.round}</span>
            <span className={`font-black ${log.winner === me ? 'text-[#ffd36b]' : 'text-white/70'}`}>{names[log.winner]}</span>
            <span className="min-w-0 flex-1 truncate text-right text-white/40">{log.reason === 'timeout' ? t.reason.timeout(names[other(log.winner)]) : t.reason[log.reason](log.declarer !== null ? names[other(log.declarer)] : '')}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
