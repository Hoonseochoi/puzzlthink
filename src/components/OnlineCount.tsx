"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';

const CHANNEL = 'site-online';
const CLIENT_KEY = 'puzzlthink_client_id'; // shared with friend rooms: one id per browser

function browserId() {
  try {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(CLIENT_KEY, id); }
    return id;
  } catch { return crypto.randomUUID(); }
}

/**
 * "지금 N명 접속 중": a small live count in the bottom-right corner of every page (site and installed
 * app). Each open browser joins one Supabase Realtime presence channel keyed by its browser id, so
 * several tabs of the same browser count once. Nothing is shown until the first count arrives.
 * It sits above a game entry screen's sticky start bar (marked data-gate-bar) when there is one.
 */
export default function OnlineCount() {
  const t = useTranslations('Common');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase.channel(CHANNEL, { config: { presence: { key: browserId() } } });
    channel.on('presence', { event: 'sync' }, () => setCount(Math.max(1, Object.keys(channel.presenceState()).length)));
    channel.subscribe((status) => { if (status === 'SUBSCRIBED') channel.track({ at: Date.now() }); });
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (count === null) return null;
  return (
    <div className="online-pill pointer-events-none fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-20 [body:has([data-gate-bar])_&]:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white/75 shadow-sm backdrop-blur-md" aria-live="polite">
      <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c47c] opacity-70" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34c47c]" /></span>
      {t('onlineNow', { count: count.toLocaleString() })}
    </div>
  );
}
