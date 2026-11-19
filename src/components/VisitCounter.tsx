"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';

const STORAGE_KEY = 'puzzlthink-visit-day';

function kstDay() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

/** Counts one visit per browser per KST day (Supabase `record_visit`), then shows today / total. */
export default function VisitCounter() {
  const t = useTranslations('Home');
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const day = kstDay();
    let seen = false;
    try { seen = localStorage.getItem(STORAGE_KEY) === day; } catch { /* optional */ }
    let cancelled = false;
    supabase.rpc('record_visit', { p_increment: !seen }).then(({ data, error }) => {
      if (cancelled || error || !data?.[0]) return;
      if (!seen) { try { localStorage.setItem(STORAGE_KEY, day); } catch { /* optional */ } }
      setStats({ today: Number(data[0].today), total: Number(data[0].total) });
    });
    return () => { cancelled = true; };
  }, []);

  if (!stats) return null;
  const fmt = (n: number) => n.toLocaleString();
  return (
    <div className="mt-6 inline-flex items-center gap-4 rounded-full border border-black/10 bg-white/60 px-4 py-1.5 text-[11px] font-bold text-black/45 backdrop-blur">
      <span>{t('visitToday')} <b className="font-black text-[#17201e]">{fmt(stats.today)}</b></span>
      <span className="h-3 w-px bg-black/15" />
      <span>{t('visitTotal')} <b className="font-black text-[#17201e]">{fmt(stats.total)}</b></span>
    </div>
  );
}
