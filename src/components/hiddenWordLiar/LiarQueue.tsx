"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, Users, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabase';
import { type QueueState, queueAnswer, queueJoin, queueLeave, queuePing, queueState } from '@/lib/hiddenWordLiar';
import { LiarStone } from './LiarArt';

// The 라이어 게임 matchmaking queue, shared by the 신청 button (useLiarQueue) and the popup that follows the player
// across the whole site (LiarQueueListener, in the locale layout). The database pushes offer / go / retry / drop to
// the player's own ticket topic `hwlq-<ticket>`; a ping every 10 s keeps the place and catches anything the push missed.
const FLAG = 'hwl_queued';
type Store = { state: QueueState | null; notice: 'retry' | 'drop' | null; busy: boolean; skew: number };
let store: Store = { state: null, notice: null, busy: false, skew: 0 };
const subs = new Set<() => void>();
const set = (patch: Partial<Store>) => { store = { ...store, ...patch }; subs.forEach((f) => f()); };
const flag = (on: boolean) => { try { if (on) localStorage.setItem(FLAG, '1'); else localStorage.removeItem(FLAG); } catch { /* optional */ } };
const flagged = () => { try { return localStorage.getItem(FLAG) === '1'; } catch { return false; } };
const apply = (s: QueueState | null) => { if (!s || s.error) return; set({ state: s, ...(s.now ? { skew: s.now - Date.now() } : {}) }); flag(s.queued || !!s.offer); };

export function useLiarQueue() {
  const snap = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => store, () => store);
  const join = useCallback(async (name: string) => { set({ busy: true }); apply(await queueJoin(name)); set({ busy: false }); }, []);
  const leave = useCallback(async () => { set({ busy: true }); await queueLeave(); flag(false); set({ state: store.state ? { ...store.state, queued: false, offer: null } : null, busy: false }); }, []);
  const refresh = useCallback(async () => apply(await queueState()), []);
  return { ...snap, join, leave, refresh };
}

export default function LiarQueueListener() {
  const { user } = useAuth();
  const { state, notice, skew } = useLiarQueue();
  const router = useRouter();
  const locale = useLocale();
  const en = locale === 'en';
  const [now, setNow] = useState(() => Date.now());
  const goneTo = useRef<string | null>(null);

  // pick up a queue entry from an earlier page (only if this browser joined one)
  useEffect(() => {
    if (!user || !flagged()) return;
    void queuePing().then(apply);
  }, [user]);

  const go = useCallback((room: string) => {
    if (goneTo.current === room) return;
    goneTo.current = room;
    flag(false);
    set({ state: store.state ? { ...store.state, queued: false, offer: null, room } : null });
    router.push(`/hidden-word-liar/room/${room}`);
  }, [router]);

  const ticket = state?.ticket ?? null;
  const active = !!state && (state.queued || !!state.offer);
  // pushes from the database to my ticket
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !ticket || !active) return;
    const ch = supabase.channel(`hwlq-${ticket}`)
      .on('broadcast', { event: 'offer' }, () => { void queueState().then(apply); })
      .on('broadcast', { event: 'go' }, ({ payload }) => { const room = (payload as { room?: string })?.room; if (room) go(room); })
      .on('broadcast', { event: 'retry' }, () => { set({ notice: 'retry' }); void queueState().then(apply); })
      .on('broadcast', { event: 'drop' }, () => { flag(false); set({ notice: 'drop', state: store.state ? { ...store.state, queued: false, offer: null } : null }); })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [ticket, active, go]);

  // keep my place (every 30 s while the tab is visible)
  useEffect(() => {
    if (!active) return;
    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      void queuePing().then((s) => {
        const was = !!store.state?.queued, accepted = store.state?.offer?.accept === true;
        apply(s);
        if (s?.room) go(s.room);
        else if (s && !s.error && was && !s.queued && !s.offer) set({ notice: 'drop' });
        else if (s && !s.error && accepted && s.queued && !s.offer) set({ notice: 'retry' }); // the push was missed
      });
    };
    const id = window.setInterval(ping, 10_000);
    document.addEventListener('visibilitychange', ping);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', ping); };
  }, [active, go]);

  // the offer's clock: tick, and ask for the outcome just after it runs out
  const offer = state?.offer ?? null;
  useEffect(() => {
    if (!offer) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    const wait = Math.max(500, offer.deadline - (Date.now() + store.skew) + 800);
    const t = window.setTimeout(() => {
      const accepted = store.state?.offer?.accept === true;
      void queuePing().then((s) => { apply(s); if (s?.room) go(s.room); else if (s && !s.error && accepted && s.queued && !s.offer) set({ notice: 'retry' }); });
    }, wait);
    return () => { window.clearInterval(id); window.clearTimeout(t); };
  }, [offer, go]);

  useEffect(() => { if (!notice) return; const t = window.setTimeout(() => set({ notice: null }), 5000); return () => window.clearTimeout(t); }, [notice]);

  const answer = async (accept: boolean) => {
    if (!offer) return;
    const s = await queueAnswer(offer.id, accept);
    apply(s);
    if (s?.room) go(s.room);
    if (!accept) { flag(false); set({ state: store.state ? { ...store.state, queued: false, offer: null } : null }); }
  };

  if (offer) {
    const left = Math.max(0, Math.ceil((offer.deadline - (now + skew)) / 1000));
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="hwl-offer-title">
        <div className="w-full max-w-[340px] rounded-3xl border border-[#a98bff]/50 bg-[#17122a] p-5 text-center text-white shadow-[0_0_60px_rgba(169,139,255,.35)]">
          <div className="mx-auto w-fit"><LiarStone id="hwl-offer" name="" size={92} /></div>
          <h2 id="hwl-offer-title" className="mt-2 text-[21px] font-black">{en ? 'Match found!' : '라이어 게임이 잡혔어요!'}</h2>
          <p className="mt-1 break-keep text-[13px] text-white/65">{en ? 'Accept to join. It starts with 5 or more.' : '승낙하면 방으로 이동해요. 5명 이상 승낙하면 시작!'}</p>
          <p className="mt-3 font-mono text-[34px] font-black text-[#ffd36e]">{left}</p>
          {offer.accept === true
            ? <p className="mt-3 flex items-center justify-center gap-2 text-[13px] font-bold text-white/75"><Loader2 size={15} className="animate-spin" />{en ? 'Waiting for the others…' : '다른 사람들을 기다리는 중…'}</p>
            : <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
                <button type="button" onClick={() => answer(false)} className="rounded-xl bg-white/10 py-3 text-[14px] font-bold text-white/75">{en ? 'Decline' : '거절'}</button>
                <button type="button" autoFocus onClick={() => answer(true)} className="rounded-xl bg-[#a98bff] py-3 text-[15px] font-black text-[#1a1030]">{en ? 'Accept' : '승낙'}</button>
              </div>}
          <p className="mt-3 text-[10px] text-white/40">{en ? 'If you are in another game, you will leave it.' : '다른 게임 중이라면 그 판은 나가게 돼요.'}</p>
        </div>
      </div>
    );
  }
  if (notice) {
    return (
      <div className="fixed inset-x-3 top-3 z-[200] mx-auto flex max-w-[420px] items-center gap-3 rounded-2xl border border-[#a98bff]/40 bg-[#17122a]/95 p-3 text-white shadow-xl" role="status">
        <Users size={18} className="shrink-0 text-[#c9b6ff]" />
        <p className="flex-1 break-keep text-[13px] font-bold">{notice === 'retry'
          ? (en ? 'Not enough players accepted. You are back in the queue.' : '인원이 모이지 않았어요. 다시 대기할게요.')
          : (en ? 'You left the liar game queue.' : '라이어 게임 대기에서 빠졌어요.')}</p>
        <button type="button" aria-label="close" onClick={() => set({ notice: null })} className="text-white/50"><X size={16} /></button>
      </div>
    );
  }
  return null;
}
