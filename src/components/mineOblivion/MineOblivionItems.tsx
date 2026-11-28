"use client";

import { SageToken } from '@/components/SageToken';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2, LockKeyhole, X } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { type MoItem, type MoSeat } from '@/lib/mineOblivion';
import { MO_ITEMS, MO_ITEM_ORDER, MO_PROBE_MS, MO_RECALL_MS, itemBlock, itemsLeft, probeTargets } from '@/lib/mineOblivionItems';
import { MO_MEMORIZE_MS, type MoRoom } from '@/lib/mineOblivionRoom';
import type { MoSoloAction } from '@/lib/mineOblivionSolo';
import { type MoBuyError, type MoWallet, buyMoItem, fetchMoWallet, newNonce } from '@/lib/moItemsApi';
import { markSignupSource } from '@/lib/signupSource';
import type { MoCopy } from './copy';
import type { MoProbeFlash } from './MineOblivionBoard';
import { ProbeStone, RecallStone, SuitStone } from './MineStones';
import { playProbe, playRecall, playSuit } from './sound';

/** What the game screen needs from the items (src/components/mineOblivion/MineOblivionTable.tsx). */
export type MoItemsView = {
  bar: ReactNode;
  /** Picking a cell for 탐지기: the cells to offer (the board shows them instead of moves). */
  probeCells: number[] | null;
  onProbe: (cell: number) => void;
  probe: MoProbeFlash | null;
  /** 기억 되살리기 is showing my mines. */
  recall: string | null;
  /** A charge is on its way: no moves until it settles. */
  busy: boolean;
  /** Called on every board tap (the bar ignores a tap that lands right after one). */
  onBoardTap: () => void;
};

const HINT_KEY = 'puzzlthink_mo_items_hint';
/** A tap on the bar this soon after a tap on the board is taken as a slip of the thumb. */
const SLIP_MS = 450;

export const ITEM_ICON: Record<MoItem, (p: { size?: number; dim?: boolean; className?: string }) => ReactNode> = {
  probe: (p) => <ProbeStone {...p} />, recall: (p) => <RecallStone {...p} />, suit: (p) => <SuitStone {...p} />,
};

/** The item bar of the AI match, and the state behind it. Rooms never call this. */
export function useMoItems(room: MoRoom | null, dispatch: (a: MoSoloAction) => void, t: MoCopy, mySeat: MoSeat = 0): MoItemsView | null {
  const { user, ready, signIn } = useAuth();
  const [wallet, setWallet] = useState<MoWallet | null>(null);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState<MoItem | null>(null);
  const [error, setError] = useState<MoBuyError | null>(null);
  const [probe, setProbe] = useState<MoProbeFlash | null>(null);
  const [recall, setRecall] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const lastBoardTap = useRef(0);
  const [now, setNow] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 400); return () => window.clearInterval(id); }, []);
  const g = room?.game ?? null;
  const uid = user?.id ?? null;

  useEffect(() => {
    if (!uid) return;
    let live = true;
    fetchMoWallet().then((w) => { if (live) setWallet(w); });
    return () => { live = false; };
  }, [uid, g?.gid]);

  // One-time hint for a member who has something to spend.
  useEffect(() => {
    if (!wallet || wallet.pieces + wallet.black_pieces <= 0) return;
    let seen = true;
    try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch { /* storage optional */ }
    if (seen) return;
    const id = window.setTimeout(() => setHint(true), 0);
    return () => window.clearTimeout(id);
  }, [wallet]);
  const slipped = useCallback(() => Date.now() - lastBoardTap.current < SLIP_MS, []);
  const markBoardTap = useCallback(() => { lastBoardTap.current = Date.now(); }, []);
  const closeHint = useCallback(() => { setHint(false); try { localStorage.setItem(HINT_KEY, '1'); } catch { /* optional */ } }, []);

  // Effects end on their own; a new game clears everything.
  useEffect(() => { if (!probe) return; const id = window.setTimeout(() => setProbe(null), MO_PROBE_MS + 600); return () => window.clearTimeout(id); }, [probe]);
  useEffect(() => { if (!recall) return; const id = window.setTimeout(() => setRecall(null), MO_RECALL_MS); return () => window.clearTimeout(id); }, [recall]);
  useEffect(() => { if (!error) return; const id = window.setTimeout(() => setError(null), 3200); return () => window.clearTimeout(id); }, [error]);
  const gidRef = useRef(g?.gid);
  useEffect(() => {
    if (gidRef.current === g?.gid) return;
    gidRef.current = g?.gid;
    const id = window.setTimeout(() => { setPicking(false); setProbe(null); setRecall(null); setError(null); }, 0);
    return () => window.clearTimeout(id);
  }, [g?.gid]);
  // The move was made (or the turn passed): no more cell picking.
  const myMove = !!g && g.phase === 'walk' && g.turn === mySeat && g.respawn === null;
  useEffect(() => { if (myMove || !picking) return; const id = window.setTimeout(() => setPicking(false), 0); return () => window.clearTimeout(id); }, [myMove, picking]);

  const buy = useCallback(async (item: MoItem, cell?: number) => {
    if (!room || !g || busy || itemBlock(g, mySeat, item)) return;
    setBusy(item); setError(null);
    const res = await buyMoItem(g.gid, item, room.level, g.log.length, newNonce());
    setBusy(null);
    if (res.wallet) setWallet(res.wallet);
    if (!res.ok) { setError(res.error ?? 'network'); return; }
    closeHint();
    dispatch({ t: 'item', item, cell });
    if (item === 'recall') { setRecall(`${g.gid}-${g.log.length}-${Date.now()}`); playRecall(); }
    if (item === 'suit') playSuit();
  }, [room, g, busy, dispatch, closeHint, mySeat]);

  // The 탐지기 number comes back through the game state (the reducer reads it from the mines).
  const lastUse = g?.items?.length ? g.items[g.items.length - 1] : null;
  const useKey = lastUse ? `${g!.gid}-${g!.items!.length}` : null;
  const shownRef = useRef<string | null>(null);
  useEffect(() => {
    if (!lastUse || lastUse.item !== 'probe' || lastUse.cell === undefined || lastUse.number === undefined || shownRef.current === useKey) return;
    shownRef.current = useKey;
    const flash = { cell: lastUse.cell, number: lastUse.number, key: useKey!, label: t.items.probeSaid(lastUse.number) };
    const id = window.setTimeout(() => { setProbe(flash); playProbe(lastUse.number!); }, 0);
    return () => window.clearTimeout(id);
  }, [lastUse, useKey, t]);

  if (!room || !g || !room.solo) return null;
  const signedIn = !!uid;
  const walking = g.phase === 'walk';
  // The memorize moment (and the first tick before the clock runs): items wait, as moves do.
  const memorizing = walking && g.log.length === 0 && (now === 0 || now < room.walkAt + MO_MEMORIZE_MS - 300);

  const tapItem = (item: MoItem) => {
    if (slipped()) return;
    if (item === 'probe') { setPicking((p) => !p); return; }
    setPicking(false);
    void buy(item);
  };

  const balance = (item: MoItem) => (MO_ITEMS[item].currency === 'piece' ? wallet?.pieces ?? 0 : wallet?.black_pieces ?? 0);
  const reasonOf = (item: MoItem): string | null => {
    if (!signedIn) return t.items.block.signin;
    const block = itemBlock(g, mySeat, item);
    if (block === 'over' || block === 'cap' || block === 'armed') return t.items.block[block];
    if (!walking || g.turn !== mySeat || g.respawn !== null || memorizing) return t.items.block.turn;
    if (block) return t.items.block.turn;
    if (wallet && balance(item) < MO_ITEMS[item].price) return t.items.block.funds;
    if (!wallet) return '…';
    return null;
  };

  const bar = g.phase === 'bury' ? null : (
    <div className="relative" data-testid="mo-items">
      <div className="rounded-[14px] p-[5px]" style={{ background: 'repeating-linear-gradient(135deg,rgba(245,197,24,.55) 0 7px,rgba(20,16,6,.9) 7px 14px)' }}>
        <div className="rounded-[10px] bg-[#16120b]/95 px-2 pb-2 pt-1.5">
          <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5 text-[10px] font-black">
            <span className="tracking-[.18em] text-(--accent)">{t.items.title} <span className="font-bold tracking-normal text-white/40">· {t.items.aiOnly}</span></span>
            {signedIn ? (
              <span className="flex items-center gap-2 font-mono text-[11px]" aria-label={t.items.walletLabel}>
                {!!wallet?.tokens && <span className="flex items-center gap-1 text-[#d9c4ff]"><SageToken size={12} />{t.items.token} <b>{wallet.tokens}</b></span>}
                <span className="flex items-center gap-1 text-white/85"><i className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-white to-[#9aa3ad]" />{t.items.piece} <b>{wallet ? Math.max(0, wallet.pieces - wallet.tokens) : '·'}</b></span>
                <span className="flex items-center gap-1 text-[#ff6b7f]"><i className="h-2.5 w-2.5 rounded-full bg-[#07060a] ring-1 ring-[#ff3355]" />{t.items.black} <b>{wallet ? wallet.black_pieces : '·'}</b></span>
              </span>
            ) : <span className="flex items-center gap-1 text-white/45"><LockKeyhole size={11} />{t.items.membersOnly}</span>}
          </div>
          {hint && signedIn && (
            // One-time pointer at the bar, inside it (never over the board, where the start corner is).
            <div className="mo-pop relative mb-1.5 rounded-[9px] border border-(--accent)/60 bg-(--accent)/12 px-2.5 py-1.5 pr-8 text-[11.5px] leading-4 text-white" role="note">
              <b className="text-(--accent)">{t.items.hintTitle}</b> <span className="break-keep text-white/80">{t.items.hint}</span>
              <button type="button" onClick={closeHint} aria-label={t.close} className="absolute right-1 top-1 rounded p-1 text-white/55 hover:bg-white/10"><X size={13} /></button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-1.5">
            {MO_ITEM_ORDER.map((item) => {
              const reason = reasonOf(item);
              const spec = MO_ITEMS[item];
              const left = itemsLeft(g, mySeat, item);
              const on = (item === 'probe' && picking) || (item === 'suit' && !!g.suit?.[mySeat]);
              const disabled = !!reason || !!busy;
              const black = spec.currency === 'black_piece';
              const tok = !black && (wallet?.tokens ?? 0) > 0; // 현자의 징표 go first
              return (
                <button key={item} type="button" disabled={disabled && !(item === 'probe' && picking)} onClick={() => tapItem(item)} aria-pressed={on}
                  aria-label={`${t.items.name[item]} · ${tok ? t.items.priceToken(spec.price) : t.items.price(spec.price, black)} · ${t.items.left(left)}${reason ? ` · ${reason}` : ''}`}
                  className={`relative flex min-h-[78px] flex-col items-center justify-center gap-0.5 rounded-[10px] border px-1 pb-1 pt-1.5 text-center transition active:scale-[.97] sm:min-h-[62px] sm:flex-row sm:gap-1.5 sm:px-1.5 sm:text-left ${on ? 'border-[#5ee0c8] bg-[#5ee0c8]/15 shadow-[0_0_14px_rgba(94,224,200,.35)]' : disabled ? 'border-white/8 bg-white/[0.03]' : 'border-white/15 bg-white/[0.06] hover:border-(--accent)/70'}`}>
                  <span className="relative shrink-0">
                    {ITEM_ICON[item]({ size: 30, dim: disabled && !on })}
                    {!signedIn && <LockKeyhole size={12} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-black p-[1px] text-white/80" />}
                    {busy === item && <Loader2 size={16} className="absolute inset-0 m-auto animate-spin text-white" />}
                  </span>
                  <span className="w-full min-w-0 sm:flex-1">
                    <b className={`block truncate text-[11.5px] tracking-[-.02em] font-black leading-4 ${disabled && !on ? 'text-white/45' : 'text-white'}`}>{t.items.name[item]}</b>
                    <span className={`block truncate font-mono text-[10px] leading-3 ${black ? 'text-[#ff6b7f]' : 'text-white/60'}`}>{tok ? t.items.priceTokenShort(spec.price) : t.items.priceShort(spec.price, black)} · {left}/{spec.cap}</span>
                    <span className={`block truncate text-[9.5px] leading-3 ${on ? 'text-[#5ee0c8]' : reason ? 'text-white/40' : 'text-white/50'}`}>{on ? (item === 'suit' ? t.items.armed : t.items.picking) : reason ?? t.items.desc[item]}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 break-keep px-0.5 text-[10px] leading-[13px] text-white/45">
            {picking ? <span className="font-bold text-[#5ee0c8]">{t.items.pickCell}</span>
              : error ? <span className="font-bold text-[#ff8a7a]">{t.items.errors[error]}</span>
                : !signedIn && ready ? <>{t.items.locked} <button type="button" onClick={() => { markSignupSource('mine_oblivion'); void signIn(); }} className="font-black text-(--accent) underline underline-offset-2">{t.items.signIn}</button></>
                  : t.items.suitNote}
          </p>
        </div>
      </div>
    </div>
  );

  return {
    bar,
    probeCells: picking && myMove ? probeTargets(g, mySeat) : null,
    onProbe: (cell: number) => { setPicking(false); void buy('probe', cell); },
    probe, recall, busy: !!busy,
    onBoardTap: markBoardTap,
  };
}
