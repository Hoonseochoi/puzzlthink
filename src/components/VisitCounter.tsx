"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';

const STORAGE_KEY = 'puzzlthink-visit-day';

function kstDay() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

/**
 * Small line at the bottom of the home page: games played today (KST) and in total, refreshed every 30 s
 * (`play_totals`). It also records one visit per browser per KST day (`record_visit`, which takes the daily rank
 * snapshot too), so it must stay mounted on the home page for phones and desktops alike.
 */
export default function VisitCounter() {
  const t = useTranslations('Home');
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const day = kstDay();
    let seen = false;
    try { seen = localStorage.getItem(STORAGE_KEY) === day; } catch { /* optional */ }
    supabase.rpc('record_visit', { p_increment: !seen }).then(({ error }) => {
      if (!error && !seen) { try { localStorage.setItem(STORAGE_KEY, day); } catch { /* optional */ } }
    });
    let cancelled = false;
    const load = () => supabase.rpc('play_totals').then(({ data, error }) => {
      if (cancelled || error || !data?.[0]) return;
      setStats({ today: Number(data[0].today), total: Number(data[0].total) });
    });
    load();
    const id = window.setInterval(load, 30_000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  if (!stats) return null;
  const fmt = (n: number) => n.toLocaleString();
  return (
    <p className="flex items-center justify-center gap-2.5 font-mono text-[10px] font-bold tracking-[0.14em] text-black/35">
      <span>{t('playsToday')} <b className="font-black text-black/60">{fmt(stats.today)}</b></span>
      <span aria-hidden>/</span>
      <span>{t('playsTotal')} <b className="font-black text-black/60">{fmt(stats.total)}</b></span>
    </p>
  );
}
