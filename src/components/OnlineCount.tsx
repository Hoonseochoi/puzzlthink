"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';
import { setOnlineCount } from '@/lib/siteBus';

const CLIENT_KEY = 'puzzlthink_client_id'; // shared with friend rooms: one id per browser
const PING_MS = 120_000; // the server counts browsers seen in the last 240 s

function browserId() {
  try {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(CLIENT_KEY, id); }
    return id;
  } catch { return crypto.randomUUID(); }
}

/**
 * "지금 N명 접속 중": a small live count in the bottom-right corner of every page on wider screens; on phones the
 * number sits under the lounge button instead (tab bar, or the edge handle inside a game). Each open, visible browser pings a tiny database function every 2 minutes; the count is the
 * browsers seen in the last 4 minutes. No Realtime connection is used, so the free plan's Realtime
 * connections stay free for friend rooms. Hidden tabs stop pinging and drop off. Nothing is shown until
 * the first count arrives (or if the database function is missing).
 * It sits above a game entry screen's sticky start bar (marked data-gate-bar) when there is one.
 */
export default function OnlineCount() {
  const t = useTranslations('Common');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const id = browserId();
    let stopped = false;
    const ping = async () => {
      if (stopped || document.visibilityState !== 'visible') return;
      const { data, error } = await supabase.rpc('online_ping', { p_id: id });
      if (!stopped) setCount(error || typeof data !== 'number' ? null : Math.max(1, data));
    };
    ping();
    const timer = window.setInterval(ping, PING_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') ping(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { stopped = true; window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  // The phone tab bar and the in-game lounge handle show this number too.
  useEffect(() => { setOnlineCount(count); }, [count]);

  if (count === null) return null;
  return (
    <div data-focus-hide className="online-pill pointer-events-none fixed max-lg:hidden bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-20 [body:has([data-gate-bar])_&]:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white/75 shadow-sm backdrop-blur-md" aria-live="polite">
      <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c47c] opacity-70" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34c47c]" /></span>
      {t('onlineNow', { count: count.toLocaleString() })}
    </div>
  );
}
