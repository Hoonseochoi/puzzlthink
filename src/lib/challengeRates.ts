"use client";
// 챌린지 성공률 on the home cards: every challenge run of a map game (새로운 맵 + 맵 뺏기) against the runs that cleared,
// so a player can tell how hard a game is before opening it. Shown in place of the NEW tag.
import { useEffect, useState } from 'react';
import { CERT_GAMES } from './hardClear';
import { getSupabase } from './supabase';
import type { GameId } from './stats';

/** The map-challenge games, by home-card href. */
export const CHALLENGE_RATE_HREFS = new Set<string>(['slitherlink', 'binairo', 'onestroke', 'colorlink', 'starbattle', 'masyu', 'nonogram'].map((g) => CERT_GAMES[g as GameId].href));

export type ClearRate = { attempts: number; clears: number; pct: number; level: 'easy' | 'medium' | 'hard' };
const level = (pct: number): ClearRate['level'] => (pct >= 50 ? 'easy' : pct >= 25 ? 'medium' : 'hard');

let cache: Promise<Map<string, ClearRate>> | null = null;
/** Success rate per game href, loaded once per visit. Games with no runs yet are left out. */
function loadRates(): Promise<Map<string, ClearRate>> {
  cache ??= (async () => {
    const supabase = getSupabase();
    const out = new Map<string, ClearRate>();
    if (!supabase) return out;
    const { data } = await supabase.rpc('challenge_clear_rates');
    for (const r of (data as { game: string; attempts: number; clears: number }[] | null) ?? []) {
      const href = CERT_GAMES[r.game as GameId]?.href;
      if (!href || r.attempts <= 0) continue;
      const pct = Math.round((Math.min(r.clears, r.attempts) / r.attempts) * 100);
      out.set(href, { attempts: r.attempts, clears: r.clears, pct, level: level(pct) });
    }
    return out;
  })().catch(() => new Map());
  return cache;
}

export function useChallengeRates() {
  const [rates, setRates] = useState<Map<string, ClearRate> | null>(null);
  useEffect(() => { let alive = true; loadRates().then((m) => { if (alive) setRates(m); }); return () => { alive = false; }; }, []);
  return rates;
}
