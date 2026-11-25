"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Lock } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { STONE_COLORS, Stone, championOf, refreshStoneChoices } from './StoneAvatar';

type Options = { chosen: string | null; earned: string[] };

/**
 * 기록실 › 닉네임: pick your stone. The four colours are open to everyone; champion stones (a finished 피스 경쟁전
 * week's top three) show up once earned. The server checks ownership (set_my_stone). Picking saves at once.
 */
export default function StonePicker({ name }: { name: string }) {
  const t = useTranslations('Records');
  const [opts, setOpts] = useState<Options | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    getSupabase()?.rpc('my_stone_options').then(({ data }) => {
      if (!alive) return;
      const d = (data ?? {}) as Partial<Options>;
      setOpts({ chosen: d.chosen ?? null, earned: Array.isArray(d.earned) ? d.earned : [] });
    });
    return () => { alive = false; };
  }, []);

  const pick = async (stone: string) => {
    const supabase = getSupabase();
    if (!supabase || !opts || saving) return;
    setSaving(stone); setError(false);
    const { error: err } = await supabase.rpc('set_my_stone', { p_stone: stone });
    setSaving(null);
    if (err) { setError(true); return; }
    setOpts({ ...opts, chosen: stone });
    refreshStoneChoices();
  };

  const option = (stone: string, label: string) => {
    const on = opts?.chosen === stone;
    const champ = championOf(stone);
    return (
      <li key={stone}>
        <button type="button" onClick={() => pick(stone)} disabled={!opts || !!saving} aria-pressed={on}
          className={`relative flex w-full flex-col items-center gap-1.5 rounded-2xl border px-2 pb-2 pt-3 transition disabled:cursor-wait ${on ? 'border-[#ff6b4a] bg-[#fff0eb] shadow-[0_0_0_2px_rgba(255,107,74,.25)]' : 'border-black/10 bg-white hover:border-black/25'}`}>
          <Stone name={name} size={champ ? 46 : 40} stone={stone} />
          <span className="w-full truncate text-center text-[10.5px] font-black text-black/70">{label}</span>
          {on && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6b4a] text-white"><Check size={10} strokeWidth={3} /></span>}
        </button>
      </li>
    );
  };

  return (
    <section className="mt-4 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">{t('stoneTitle')}</p>
        <p className="text-[11px] font-bold text-black/40">{saving ? t('stoneSaving') : error ? <span className="text-[#c2410c]">{t('stoneError')}</span> : opts?.chosen ? t('stoneSavedNote') : t('stoneAutoNote')}</p>
      </div>
      <p className="mt-3 text-[11px] font-black text-black/55">{t('stoneBasic')}</p>
      <ul className="mt-2 grid grid-cols-4 gap-2 sm:max-w-md">{STONE_COLORS.map((c) => option(c, t(`stoneColor.${c}`)))}</ul>
      <p className="mt-4 text-[11px] font-black text-black/55">{t('stoneEarned')}</p>
      {opts && opts.earned.length ? (
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:max-w-md sm:grid-cols-4">
          {opts.earned.map((s) => { const c = championOf(s)!; return option(s, t('stoneChampLabel', { week: c.week, place: c.place, name: t(`stoneChampName.w${c.week}_${c.place}`) })); })}
        </ul>
      ) : (
        <p className="mt-2 flex items-center gap-2 rounded-2xl border border-dashed border-black/15 px-3 py-2.5 text-[11px] font-bold text-black/45"><Lock size={13} className="shrink-0" />{t('stoneEarnedEmpty')}</p>
      )}
    </section>
  );
}
