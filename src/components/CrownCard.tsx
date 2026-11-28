"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Crown } from 'lucide-react';
import type { GameId } from '@/lib/stats';
import { getSupabase } from '@/lib/supabase';
import { Stone } from './StoneAvatar';

// Who holds each game's #1 icon, fetched once per page load.
let holdersPromise: Promise<Map<string, string>> | null = null;
export function loadCrownHolders() {
  holdersPromise ??= (async () => {
    const map = new Map<string, string>();
    const { data } = (await getSupabase()?.rpc('game_crowns_public')) ?? { data: null };
    if (Array.isArray(data)) for (const r of data as { game: string; nickname: string }[]) map.set(r.game, r.nickname);
    return map;
  })();
  return holdersPromise;
}

/** Ranking page: this game's #1 icon and who holds it now (it moves with the #1 spot). */
export default function CrownCard({ game }: { game: GameId }) {
  const t = useTranslations('Icons');
  const [holder, setHolder] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    loadCrownHolders().then((m) => { if (alive) setHolder(m.get(game) ?? null); });
    return () => { alive = false; };
  }, [game]);

  return (
    <section className="mt-3 flex items-center gap-4 rounded-[22px] border border-[#e8a33c]/35 bg-gradient-to-r from-[#fff6e2] to-[#fffdf7] p-4">
      <span className="drop-shadow-[0_4px_10px_rgba(232,163,60,.35)]"><Stone name={t('crownCardTitle')} size={64} icon={`c-${game}`} /></span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-[#a0670f]"><Crown size={13} />{t('crownCardTitle')}</p>
        <p className="mt-0.5 truncate text-base font-black">{holder === undefined ? '…' : holder ? t('crownCardHolder', { name: holder }) : t('crownCardEmpty')}</p>
        <p className="mt-0.5 break-keep text-[11px] leading-4 text-black/50">{t('crownCardDesc')}</p>
      </div>
    </section>
  );
}
