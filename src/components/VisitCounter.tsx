"use client";

import { useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

const STORAGE_KEY = 'puzzlthink-visit-day';

function kstDay() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

/**
 * Counts one visit per browser per KST day (Supabase `record_visit`). Nothing is shown: the live
 * "N online now" pill (OnlineCount) replaced the today / total badge on the home page, but the
 * daily visit numbers keep being recorded.
 */
export default function VisitCounter() {
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const day = kstDay();
    let seen = false;
    try { seen = localStorage.getItem(STORAGE_KEY) === day; } catch {}
    let cancelled = false;
    if (seen) return; // already counted today; nothing to fetch since nothing is shown
    supabase.rpc('record_visit', { p_increment: true }).then(({ data, error }) => {
      if (cancelled || error || !data?.[0]) return;
      try { localStorage.setItem(STORAGE_KEY, day); } catch {}
    });
    return () => { cancelled = true; };
  }, []);

  return null;
}
