"use client";

import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Dices, Eraser, Flag, Loader2, Lock, Timer } from 'lucide-react';
import { CJ_CARDS, type CjGame, cardsLeft, currentCard, isKing, layoutSize, other, redactGame, seatOfPiece, startBoard, targetsOf } from '@/lib/cardJanggi';
import { type CjAction, type CjRoom, CJ_BETWEEN_MS, CJ_COIN_MS, CJ_LAYOUT_SEC, cjWaitingOn } from '@/lib/cardJanggiRoom';
import { PANEL, PANEL_TITLE, accentVars } from '../ui/gameUi';
import { CJ_ACCENT, CJ_INK, type CjCopy, sideColor } from './copy';
import { CARD_EMOJI, CjBoard, CjCardBack, CjCardFace, CjCardSlot, CjPiece, squareName } from './CjParts';
import { CjRulesTip } from './CjTips';

type Props = {
  room: CjRoom;
  mySeat: number | null;
  onAction: (action: CjAction) => void;
  t: CjCopy;
  names: [string, string];
  thinking?: boolean; // the AI is working on its move (solo)
  onResign?: () => void;
  aside?: ReactNode;
};

const NEVER = Number.MAX_SAFE_INTEGER / 2;

function useNow(on: boolean, every = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const timer = window.setInterval(() => setNow(Date.now()), every);
    return () => window.clearInterval(timer);
  }, [on, every]);
  return now;
}

export default function CjTable({ room, mySeat, onAction, t, names, thinking = false, onResign, aside }: Props) {
  const viewer = mySeat ?? 0;
  const opp = other(viewer);
  const g = redactGame(room.game, mySeat);
  const playing = room.phase === 'playing';
  const now = useNow(playing || room.phase === 'between');
  const seconds = playing && room.deadline < NEVER ? Math.max(0, Math.ceil((room.deadline - now) / 1000)) : null;
  const waiting = cjWaitingOn(room);
  const myTurn = mySeat !== null && waiting.includes(mySeat) && !room.ai[mySeat];
  const arranging = myTurn && g.phase === 'arrange';
  const moving = myTurn && g.phase === 'move';
  const actorCard = g.phase === 'move' ? currentCard(g, g.turn) : -1;
  const coin = room.round === 1 && room.results.length === 0 && now < room.coinAt + CJ_COIN_MS && g.ply === 0;

  // A tap on the phone when it becomes your turn, and a buzz when the clock is nearly out.
  const wasMyTurn = useRef(false);
  useEffect(() => {
    if (myTurn && !wasMyTurn.current) { try { navigator.vibrate?.(28); } catch { /* optional */ } }
    wasMyTurn.current = myTurn;
  }, [myTurn]);
  const urgent = myTurn && seconds !== null && seconds <= 10;
  const wasUrgent = useRef(false);
  useEffect(() => {
    if (urgent && !wasUrgent.current) { try { navigator.vibrate?.([60, 60, 60]); } catch { /* optional */ } }
    wasUrgent.current = urgent;
  }, [urgent]);

  // Move input: tap a piece, then a lit square. After a timeout the opponent's pieces are the ones to move.
  const [sel, setSel] = useState<{ key: string; cell: number | null } | null>(null);
  const moveKey = `${room.sid}-${room.round}-${g.ply}-${room.proxy}`;
  const picked = sel?.key === moveKey ? sel : null; // null: nothing tapped yet this move
  const moverSeat = g.turn;
  const selectable = moving ? g.board.map((p, cell) => (p && seatOfPiece(p) === moverSeat && targetsOf(g.board, cell, actorCard).length ? cell : -1)).filter((c) => c >= 0) : [];
  // With a single piece able to move, it is picked for you (until you tap something else).
  const autoPick = moving && !picked && selectable.length === 1 ? selectable[0] : null;
  const shownSel = picked ? picked.cell : autoPick;
  const shownTargets = moving && shownSel !== null ? targetsOf(g.board, shownSel, actorCard) : [];
  const tapCell = (cell: number) => {
    if (!moving) return;
    if (shownSel !== null && shownTargets.includes(cell)) { onAction({ t: 'move', from: shownSel, to: cell }); setSel(null); return; }
    if (selectable.includes(cell)) setSel({ key: moveKey, cell: shownSel === cell ? null : cell });
  };

  // Layout draft (kept per cycle).
  const draftKey = `${room.sid}-${room.round}-${g.cycle[viewer]}`;
  const [draftState, setDraft] = useState<{ key: string; order: number[] }>({ key: '', order: [] });
  const draft = draftState.key === draftKey ? draftState.order : [];
  const size = layoutSize(g, viewer);
  const put = (card: number) => { if (!draft.includes(card) && draft.length < size) setDraft({ key: draftKey, order: [...draft, card] }); };
  const take = (i: number) => setDraft({ key: draftKey, order: draft.filter((_, k) => k !== i) });
  const fillRandom = (base: number[]) => [...base, ...CJ_CARDS.filter((c) => !base.includes(c)).sort(() => Math.random() - 0.5)].slice(0, size);
  const submit = (order: number[]) => onAction({ t: 'arrange', order });
  // The clock is about to run out: lock in what is there (the rest at random) rather than all at random.
  const sent = useRef('');
  useEffect(() => {
    if (!arranging || seconds === null || seconds > 1 || sent.current === draftKey) return;
    sent.current = draftKey;
    submit(fillRandom(draft));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arranging, seconds, draftKey]);

  // Card preview: tap a face-up card (long-press while laying out) to light up the squares it reaches.
  const [peekState, setPeek] = useState<{ key: string; card: number; seat: number } | null>(null);
  const peek = peekState?.key === moveKey ? peekState : null;
  const togglePeek = (card: number, seat: number) => setPeek(peek && peek.card === card && peek.seat === seat ? null : { key: moveKey, card, seat });
  const hints = peek ? [...new Set(g.board.flatMap((p, cell) => (
    p && seatOfPiece(p) === peek.seat && (shownSel === null || seatOfPiece(g.board[shownSel] ?? 0) !== peek.seat || shownSel === cell) ? targetsOf(g.board, cell, peek.card) : []
  )))] : [];

  const last = g.history[g.history.length - 1];
  const flash = last && !last.pass && last.cap ? { cell: last.to, key: `${room.round}-${g.ply}` } : null;
  // The dock is fixed to the bottom: the page leaves room for it, and the board shrinks so everything fits one screen.
  const [dockH, setDockH] = useState(76);
  const reserve = 64 + 24 + 80 + (arranging ? 92 : 98) + 16 + dockH;

  return (
    <div className="mx-auto grid w-full max-w-[1100px] gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="mx-auto flex w-full min-w-0 max-w-[480px] flex-col gap-2" style={{ paddingBottom: dockH + 8 }}>
        <SideBar room={room} g={g} seat={opp} me={false} name={names[opp]} t={t} acting={waiting.includes(opp)} seconds={seconds} thinking={thinking && waiting.includes(opp)} onPeek={togglePeek} peek={peek} />
        <div className="relative mx-auto w-full" style={{ maxWidth: `min(100%, calc((100dvh - ${reserve}px) * 0.833))` }}>
          <CjBoard g={g} viewer={viewer} selected={shownSel} targets={shownTargets} selectable={selectable} onCell={moving || peek ? (cell) => { if (peek) setPeek(null); tapCell(cell); } : undefined}
            flash={flash} labels={{ goal: t.goal, home: t.home }} hints={hints} hintSeat={peek?.seat} />
          <div className="absolute -top-2.5 right-2 z-[2]"><CjRulesTip t={t} seat={viewer} /></div>
          {peek && (
            <button type="button" onClick={() => setPeek(null)} className="absolute -top-2.5 left-2 z-[2] flex max-w-[70%] items-center gap-1 truncate rounded-full bg-black/80 px-2.5 py-1 text-[10.5px] font-black ring-1" style={{ color: peek.seat === viewer ? '#5ee7ff' : '#ff8a96', ['--tw-ring-color' as string]: peek.seat === viewer ? '#5ee7ff66' : '#ff4f5e66' }}>
              <span className="truncate">{(peek.seat === viewer ? t.peekMine : t.peekTheirs)(`${CARD_EMOJI[peek.card]} ${t.cards[peek.card]}`)}</span><span className="text-white/50">✕</span>
            </button>
          )}
        </div>
        <SideBar room={room} g={g} seat={viewer} me={mySeat !== null} name={names[viewer]} t={t} acting={waiting.includes(viewer)} seconds={seconds}
          draft={arranging ? draft : null} draftSize={size} onTake={take} thinking={thinking && waiting.includes(viewer)} onPeek={togglePeek} peek={peek} />
        <section className={`${PANEL} lg:hidden`}><LogList g={g} t={t} viewer={viewer} names={names} /></section>
      </div>

      <aside className="hidden flex-col gap-3 lg:flex">
        {aside}
        <section className={PANEL}><LogList g={g} t={t} viewer={viewer} names={names} /></section>
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t.rules}</p>
          <ol className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-white/60">{t.quick.map((line, i) => <li key={i} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        </section>
      </aside>

      <Layer>
        {mySeat !== null && (room.phase === 'playing' || room.phase === 'between') && (
          <Dock room={room} g={g} t={t} seat={mySeat} seconds={seconds} myTurn={myTurn} arranging={arranging} moving={moving} thinking={thinking} onPeek={(card) => togglePeek(card, mySeat)}
            draft={draft} size={size} onPut={put} onClear={() => setDraft({ key: draftKey, order: [] })} onRandom={() => setDraft({ key: draftKey, order: fillRandom([]) })}
            onSubmit={() => { sent.current = draftKey; submit(draft); }} selected={shownSel} onResign={onResign} onHeight={setDockH} />
        )}
        <AnimatePresence>{coin && <CoinToss key="coin" first={g.first} names={names} t={t} />}</AnimatePresence>
        <AnimatePresence>{room.phase === 'between' && <RoundBanner key={`r${room.results.length}`} room={room} viewer={viewer} t={t} now={now} spectator={mySeat === null} names={names} />}</AnimatePresence>
        <AnimatePresence>{playing && room.round > 1 && g.ply === 0 && g.cycle[0] + g.cycle[1] === 0 && now < room.deadline - (CJ_LAYOUT_SEC - 3) * 1000 && <RoundStart key={`s${room.round}`} round={room.round} name={names[g.first]} t={t} />}</AnimatePresence>
      </Layer>
    </div>
  );
}

const noop = () => () => {};
/** Docks and overlays go straight into <body>, above the site's floating widgets. */
function Layer({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<div style={accentVars(CJ_ACCENT, CJ_INK)} className="relative z-[70] text-[#e6e9f0]">{children}</div>, document.body);
}

/** One side: name, 선/후, round wins and its cards this cycle (used · face-up · face-down or, for you, the rest). */
function SideBar({ room, g, seat, me, name, t, acting, seconds, thinking, draft = null, draftSize = 5, onTake, onPeek, peek }: {
  room: CjRoom; g: CjGame; seat: number; me: boolean; name: string; t: CjCopy; acting: boolean; seconds: number | null; thinking: boolean;
  draft?: number[] | null; draftSize?: number; onTake?: (i: number) => void; onPeek: (card: number, seat: number) => void; peek: { card: number; seat: number } | null;
}) {
  const color = sideColor(seat);
  const seq = g.seq[seat] ?? [];
  const pos = g.pos[seat];
  const cardSize = me ? 46 : 34;
  const left = cardsLeft(g, seat);
  const showHint = !me && g.phase !== 'over' && left.hidden > 0 && left.pool.length > 0;
  return (
    <section className={`rounded-[12px] border px-2.5 py-2 transition ${acting && room.phase === 'playing' ? 'border-(--accent)/50 bg-(--accent)/[0.07] shadow-[inset_0_0_24px_var(--accent-soft)]' : 'border-white/10 bg-[#121217]/85'}`}>
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 shrink-0"><CjPiece seat={seat} king size={16} /></span>
        <span className="min-w-0 truncate text-[13px] font-extrabold" data-chat-seat={room.seats[seat]?.id}>{name}</span>
        <span className="shrink-0 rounded px-1.5 py-px text-[9px] font-black" style={{ background: g.first === seat ? color : 'transparent', color: g.first === seat ? '#fff' : 'rgba(255,255,255,.5)', border: g.first === seat ? 'none' : '1px solid rgba(255,255,255,.2)' }}>{g.first === seat ? t.first : t.second}</span>
        <span className="flex shrink-0 gap-0.5" aria-label={`${t.score} ${room.wins[seat]}`}>{[0, 1].map((i) => <i key={i} className={`h-2 w-2 rounded-full ${i < room.wins[seat] ? '' : 'bg-white/15'}`} style={i < room.wins[seat] ? { background: color, boxShadow: `0 0 6px ${color}` } : undefined} />)}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-white/50">
          {thinking && <span className="flex items-center gap-1 text-(--accent)"><Loader2 size={12} className="animate-spin" />{t.aiThinking}</span>}
          {acting && room.phase === 'playing' && seconds !== null && <span className={`flex items-center gap-1 font-mono ${seconds <= 10 ? 'animate-pulse text-[#ff5d6c]' : 'text-white/70'}`}><Timer size={12} />{seconds}</span>}
        </span>
      </div>
      <div className="mt-0.5 flex items-end gap-1.5 overflow-x-auto pt-2">
        {draft ? (
          Array.from({ length: draftSize }, (_, i) => (
            <button key={i} type="button" onClick={() => draft[i] !== undefined && onTake?.(i)} className="flex flex-col items-center gap-0.5">
              {draft[i] !== undefined ? <CjCardFace card={draft[i]} seat={seat} size={cardSize} name={t.cards[draft[i]]} /> : <CjCardSlot size={cardSize} label={String(i + 1)} active={i === draft.length} />}
            </button>
          ))
        ) : g.phase === 'arrange' && g.arranging[seat] ? (
          <span className="flex h-[40px] items-center gap-1.5 text-[11px] font-bold text-white/40"><Loader2 size={13} className="animate-spin" />{me ? t.layoutDone : t.layoutWaiting}</span>
        ) : (
          seq.map((card, i) => {
            const used = i < pos;
            const now = i === pos && g.phase === 'move';
            return (
              <span key={i} className="relative flex flex-col items-center">
                {card >= 0
                  ? <button type="button" onClick={() => onPeek(card, seat)} aria-label={`${t.cards[card]} · ${t.cardMoves[card]}`} className={`rounded-[8px] ${peek?.card === card && peek.seat === seat ? 'ring-2 ring-[#5ee7ff]' : ''}`}><CjCardFace card={card} seat={seat} size={now ? cardSize + 6 : cardSize} name={t.cards[card]} dim={used} glow={now} /></button>
                  : <CjCardBack seat={seat} size={cardSize} label={String(i + 1)} />}
                {now && <span className="absolute -top-1.5 rounded bg-white px-1 text-[8px] font-black leading-[12px] text-black">NOW</span>}
              </span>
            );
          })
        )}
        {showHint && <span className="ml-1 min-w-0 self-center text-[10px] leading-tight text-white/40">{t.oppLeft(left.pool.map((c) => CARD_EMOJI[c]).join(''))}</span>}
      </div>
    </section>
  );
}

function Dock({ room, g, t, seat, seconds, myTurn, arranging, moving, thinking, draft, size, onPut, onClear, onRandom, onSubmit, selected, onResign, onHeight, onPeek }: {
  room: CjRoom; g: CjGame; t: CjCopy; seat: number; seconds: number | null; myTurn: boolean; arranging: boolean; moving: boolean; thinking: boolean;
  draft: number[]; size: number; onPut: (c: number) => void; onClear: () => void; onRandom: () => void; onSubmit: () => void; selected: number | null; onResign?: () => void; onHeight: (h: number) => void; onPeek: (card: number) => void;
}) {
  // A long press on a card in the layout picker previews its moves instead of adding it.
  const press = useRef<{ timer: number; fired: boolean } | null>(null);
  const startPress = (card: number) => { const p = { timer: window.setTimeout(() => { p.fired = true; onPeek(card); try { navigator.vibrate?.(12); } catch { /* optional */ } }, 420), fired: false }; press.current = p; };
  const endPress = () => { if (press.current) window.clearTimeout(press.current.timer); };
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => onHeight(Math.round(el.getBoundingClientRect().height)));
    observer.observe(el);
    return () => { observer.disconnect(); onHeight(0); };
  }, [onHeight]);
  const card = g.phase === 'move' ? currentCard(g, g.turn) : -1;
  const cardName = card >= 0 ? `${CARD_EMOJI[card]} ${t.cards[card]}` : '';
  const proxyMine = room.proxy && moving;
  const proxyTheirs = room.proxy && !moving && g.turn === seat && room.phase === 'playing';
  const lastPass = g.history[g.history.length - 1];
  let line: ReactNode;
  if (room.phase === 'between') line = <span className="text-white/60">{t.round(room.round)} · {room.wins[0]} : {room.wins[1]}</span>;
  else if (arranging) line = <span className="text-(--accent)">{t.layoutTitle(size)}</span>;
  else if (g.phase === 'arrange') line = <span className="text-white/55">{g.arranging[seat] ? t.layoutDone : t.layoutWaiting}</span>;
  else if (proxyMine) line = <span className="text-[#ffd36b]">{t.proxyMine(cardName)}</span>;
  else if (moving) line = <span className="text-(--accent)">{t.yourMove(cardName)} · <span className="text-white/70">{selected === null ? t.pickPiece : t.pickTarget}</span></span>;
  else if (proxyTheirs) line = <span className="text-[#ffd36b]">{t.proxyTheirs}</span>;
  else line = <span className="flex items-center gap-1.5 text-white/55">{thinking ? <><Bot size={13} className="text-(--accent)" />{t.aiThinking}…</> : <>{t.theirMove} · {cardName}</>}</span>;

  return (
    <div ref={ref} className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0b0e]/92 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-md">
      <div className="mx-auto max-w-[520px]">
        {arranging && (
          <div className="mb-2">
            <p className="mb-1.5 truncate text-[10px] font-bold text-white/40">{t.layoutHint}</p>
            <div className="flex justify-between gap-1">
              {CJ_CARDS.map((c) => {
                const usedAt = draft.indexOf(c);
                return (
                  <button key={c} type="button" onPointerDown={() => startPress(c)} onPointerUp={endPress} onPointerLeave={endPress} onContextMenu={(e) => e.preventDefault()}
                    onClick={() => { const fired = press.current?.fired; press.current = null; if (fired) return; if (usedAt < 0 && draft.length < size) onPut(c); }}
                    aria-disabled={usedAt >= 0 || draft.length >= size} className="relative flex flex-1 select-none flex-col items-center rounded-[9px] p-0.5 transition [-webkit-touch-callout:none] active:scale-95">
                    <CjCardFace card={c} seat={seat} size={58} name={t.cards[c]} dim={usedAt >= 0} />
                    <span className="mt-0.5 text-[8.5px] font-bold leading-tight text-white/45">{t.cardMoves[c]}</span>
                    {usedAt >= 0 && <span className="absolute left-1/2 top-[30%] flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-white font-mono text-xs font-black text-black shadow">{usedAt + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 text-[12px] font-black leading-snug">
            {line}
            {myTurn && seconds !== null && <span className={`ml-1.5 font-mono text-[11px] ${seconds <= 10 ? 'animate-pulse text-[#ff5d6c]' : 'text-white/45'}`}>{t.seconds(seconds)}</span>}
            {lastPass?.pass && room.phase === 'playing' && <span className="block text-[10px] font-bold text-white/35">{t.noMove}</span>}
          </div>
          {arranging ? (
            <>
              <button type="button" onClick={draft.length ? onClear : onRandom} className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-[9px] font-bold text-white/70" aria-label={draft.length ? t.layoutClear : t.layoutRandom}>
                {draft.length ? <Eraser size={16} /> : <Dices size={16} />}{draft.length ? t.layoutClear : t.layoutRandom}
              </button>
              <button type="button" disabled={draft.length !== size} onClick={onSubmit} className="flex h-12 shrink-0 items-center gap-1.5 rounded-[10px] bg-(--accent) px-4 text-sm font-black text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] transition active:scale-[.98] disabled:opacity-35 disabled:shadow-none">
                <Lock size={15} />{t.layoutConfirm}
              </button>
            </>
          ) : onResign && room.phase === 'playing' ? (
            <button type="button" onClick={onResign} className="flex h-10 shrink-0 items-center gap-1 rounded-[10px] border border-white/10 px-2.5 text-[10px] font-bold text-white/40 hover:text-white/70" aria-label={t.resign}><Flag size={13} />{t.resign}</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CoinToss({ first, names, t }: { first: number; names: [string, string]; t: CjCopy }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
      <p className="font-mono text-[11px] font-black tracking-[0.3em] text-white/50">{t.coinToss}</p>
      <motion.div
        initial={{ rotateY: 0, y: 0 }} animate={{ rotateY: 360 * 5 + (first === 0 ? 0 : 180), y: [0, -90, 0] }} transition={{ duration: 1.6, ease: 'easeOut' }}
        className="relative mt-6 h-28 w-28" style={{ transformStyle: 'preserve-3d' }}
      >
        {[0, 1].map((s) => (
          <span key={s} className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-white/80 text-3xl font-black text-white shadow-[0_10px_30px_rgba(0,0,0,.6)]"
            style={{ background: sideColor(s), backfaceVisibility: 'hidden', transform: s === 1 ? 'rotateY(180deg)' : undefined }}>{t.first}</span>
        ))}
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }} className="mt-6 text-2xl font-black" style={{ color: sideColor(first) }}>{t.coinResult(names[first])}</motion.p>
    </motion.div>
  );
}

function RoundStart({ round, name, t }: { round: number; name: string; t: CjCopy }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-x-0 top-[30%] z-[60] flex justify-center px-4">
      <p className="rounded-[14px] border border-(--accent)/40 bg-black/85 px-6 py-4 text-center text-lg font-black shadow-[0_0_40px_var(--accent-glow)]">{t.roundStart(round, name)}</p>
    </motion.div>
  );
}

function RoundBanner({ room, viewer, t, now, spectator, names }: { room: CjRoom; viewer: number; t: CjCopy; now: number; spectator: boolean; names: [string, string] }) {
  const result = room.results[room.results.length - 1];
  if (!result) return null;
  const won = result.winner === viewer;
  const title = result.winner === 'draw' ? t.roundDraw : spectator ? t.winnerIs(names[result.winner]) : won ? t.roundWin : t.roundLose;
  const reason = result.reason ? (won || spectator ? t.reason : t.reasonLost)[result.reason] : '';
  const left = Math.max(0, Math.ceil((room.holdUntil - now) / 1000));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-6 backdrop-blur-[2px]">
      <motion.div initial={{ scale: 0.85, y: 12 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xs rounded-[18px] border border-white/10 bg-[#121217] p-6 text-center shadow-[0_0_80px_var(--accent-glow)]">
        <p className="font-mono text-[10px] font-black tracking-[0.25em] text-(--accent)">{t.round(room.results.length)}</p>
        <h2 className={`mt-2 text-3xl font-black ${result.winner === 'draw' ? 'text-white' : won || spectator ? 'text-[#ffd36b]' : 'text-white/80'}`}>{title}</h2>
        <p className="mt-1 text-xs font-bold text-white/50">{reason}</p>
        <div className="mt-4 flex items-center justify-center gap-4 font-mono text-4xl font-black">
          <span style={{ color: sideColor(viewer) }}>{room.wins[viewer]}</span><span className="text-white/25">:</span><span style={{ color: sideColor(1 - viewer) }}>{room.wins[1 - viewer]}</span>
        </div>
        <p className="mt-4 text-[11px] font-bold text-white/40">{t.nextRound(left)}</p>
        <div className="mx-auto mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: CJ_BETWEEN_MS / 1000, ease: 'linear' }} className="h-full bg-(--accent)" /></div>
      </motion.div>
    </motion.div>
  );
}

function LogList({ g, t, viewer, names }: { g: CjGame; t: CjCopy; viewer: number; names: [string, string] }) {
  // Which piece made each move: replayed from the start position.
  const board = startBoard();
  const kingMove = g.history.map((m) => {
    if (m.pass) return false;
    const king = isKing(board[m.from]);
    board[m.to] = board[m.from]; board[m.from] = 0;
    return king;
  });
  const order = g.history.map((m, i) => ({ m, i })).reverse();
  return (
    <div>
      <p className={PANEL_TITLE}>{t.log}</p>
      {!order.length ? <p className="mt-2 text-xs text-white/35">{t.logEmpty}</p> : (
        <ol className="mt-2 max-h-[220px] space-y-1 overflow-y-auto pr-1 text-[11.5px]">
          {order.map(({ m, i }) => (
            <li key={i} className="flex items-center gap-1.5 text-white/70">
              <span className="w-5 shrink-0 text-right font-mono text-[10px] text-white/30">{i + 1}</span>
              <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: sideColor(m.seat) }} />
              <span className="shrink-0">{CARD_EMOJI[m.card]}</span>
              <span className="min-w-0 truncate">
                <b className="font-bold text-white/80">{names[m.seat]}</b>{' '}
                {m.pass ? <span className="text-white/40">{t.passMark}</span> : <>
                  {kingMove[i] ? '👑 ' : ''}{squareName(m.from, viewer)}→{squareName(m.to, viewer)}
                  {m.cap ? <span className="ml-1 font-black text-[#ff5d6c]">✕{isKing(m.cap) ? t.king : ''}</span> : null}
                  {m.proxy && <span className="ml-1 text-[10px] text-[#ffd36b]">({t.proxyMark})</span>}
                </>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
