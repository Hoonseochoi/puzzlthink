"use client";

import { useEffect, useSyncExternalStore } from 'react';
import { getSupabase } from '@/lib/supabase';
import { HALL_RANK_EVENT } from '@/lib/stats';

// Who wears the 그라데이션 champion badge: the holder of the game's crown (public.game_crowns), which the server
// moves to the AI Hall of Fame #1 every 5 minutes (icon_tick) and which also gives that player the
// 'c-gradation' profile icon. Nicknames are unique, so the name is enough to find them.

let champion: string | null = null;
let loadedAt = 0;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const TTL = 60_000;

function load(force = false) {
  if (loading || (!force && Date.now() - loadedAt < TTL)) return;
  const supabase = getSupabase();
  if (!supabase) return;
  loading = Promise.resolve(supabase.rpc('game_crowns_public'))
    .then(({ data }) => {
      const top = ((data as { game: string; nickname: string }[] | null) ?? []).find((e) => e.game === 'gradation');
      const next = top?.nickname ?? null;
      loadedAt = Date.now();
      if (next !== champion) { champion = next; listeners.forEach((fn) => fn()); }
    })
    .catch(() => {})
    .finally(() => { loading = null; });
}

const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

/** The current champion's nickname (null while unknown or when nobody has won yet). */
export function useGradationChampion(): string | null {
  const name = useSyncExternalStore(subscribe, () => champion, () => null);
  useEffect(() => {
    load();
    // A finished game may have changed the #1; the crown moves on the server's next 5-minute tick.
    const refresh = () => { window.setTimeout(() => load(true), 1500); window.setTimeout(() => load(true), 5 * 60_000 + 5_000); };
    const onFocus = () => load();
    window.addEventListener('puzzlthink:game-saved', refresh);
    window.addEventListener(HALL_RANK_EVENT, refresh);
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('puzzlthink:game-saved', refresh); window.removeEventListener(HALL_RANK_EVENT, refresh); window.removeEventListener('focus', onFocus); };
  }, []);
  return name;
}

/** Whether `name` is the champion right now. */
export function useIsGradationChampion(name: string | null | undefined): boolean {
  const top = useGradationChampion();
  return !!name && !!top && name.trim() === top.trim();
}
