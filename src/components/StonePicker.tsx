"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Lock, Sparkles } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { STONE_COLORS, Stone, refreshStoneChoices } from './StoneAvatar';
import { parseIcon } from './ProfileIcons';
import { useIconLabel } from './useIconLabel';

type Options = { chosen: string | null; earned: string[]; lost: string[] };
export const MY_ICON_ANCHOR = 'my-icon';

/**
 * 기록실 › 닉네임: pick your profile icon. Earned icons come first (피스·블랙피스 weekly top three, 2048, a game's #1),
 * then the four colours open to everyone. A newly earned icon is switched on by the server; a lost #1 icon shows
 * greyed out below. The server checks ownership (set_my_stone). Picking saves at once.
 * Reached from the "new icon" popup with /records#my-icon: it scrolls itself into view.
 */
export default function StonePicker({ name }: { name: string }) {
  const t = useTranslations('Records');
  const ti = useTranslations('Icons');
  const label = useIconLabel();
  const [opts, setOpts] = useState<Options | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hashTick, setHashTick] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () => getSupabase()?.rpc('my_stone_options').then(({ data }) => {
      if (!alive) return;
      const d = (data ?? {}) as Partial<Options>;
      const list = (v: unknown) => (Array.isArray(v) ? (v as string[]).filter((s) => parseIcon(s)) : []);
      setOpts({ chosen: d.chosen ?? null, earned: list(d.earned), lost: list(d.lost) });
    });
    load();
    window.addEventListener('puzzlthink:icons-changed', load);
    return () => { alive = false; window.removeEventListener('puzzlthink:icons-changed', load); };
  }, []);

  const loaded = opts !== null;
  // Opened from the popup (#my-icon): bring the picker into view once it has loaded, and light it up briefly.
  useEffect(() => {
    const onHash = () => setHashTick((n) => n + 1);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (!loaded || window.location.hash.slice(1) !== MY_ICON_ANCHOR) return;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFlash(true); // eslint-disable-line react-hooks/set-state-in-effect -- the hash is only readable in the browser
    const id = window.setTimeout(() => setFlash(false), 2200);
    return () => window.clearTimeout(id);
  }, [loaded, hashTick]);

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

  const option = (stone: string, text: string) => {
    const on = opts?.chosen === stone;
    const icon = !!parseIcon(stone);
    return (
      <li key={stone}>
        <button type="button" onClick={() => pick(stone)} disabled={!opts || !!saving} aria-pressed={on}
          className={`relative flex w-full flex-col items-center gap-1.5 rounded-2xl border px-2 pb-2 pt-3 transition disabled:cursor-wait ${on ? 'border-[#ff6b4a] bg-[#fff0eb] shadow-[0_0_0_2px_rgba(255,107,74,.25)]' : 'border-black/10 bg-white hover:border-black/25'}`}>
          <Stone name={name} size={icon ? 46 : 40} stone={stone} />
          <span className="line-clamp-2 w-full break-keep text-center text-[10.5px] font-black leading-tight text-black/70">{text}</span>
          {on && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6b4a] text-white"><Check size={10} strokeWidth={3} /></span>}
        </button>
      </li>
    );
  };

  return (
    <section ref={ref} id={MY_ICON_ANCHOR} className={`mt-4 scroll-mt-24 rounded-[24px] border bg-[#f9f7f1] p-5 transition-shadow duration-700 ${flash ? 'border-[#ff6b4a] shadow-[0_0_0_4px_rgba(255,107,74,.25)]' : 'border-black/10'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">{t('stoneTitle')}</p>
        <p className="text-[11px] font-bold text-black/40">{saving ? t('stoneSaving') : error ? <span className="text-[#c2410c]">{t('stoneError')}</span> : opts?.chosen ? t('stoneSavedNote') : t('stoneAutoNote')}</p>
      </div>

      <p className="mt-3 flex items-center gap-1 text-[11px] font-black text-black/55"><Sparkles size={12} className="text-[#e8a33c]" />{t('stoneEarned')}</p>
      {opts && opts.earned.length ? (
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">{opts.earned.map((s) => option(s, label(s)))}</ul>
      ) : (
        <p className="mt-2 flex items-center gap-2 break-keep rounded-2xl border border-dashed border-black/15 px-3 py-2.5 text-[11px] font-bold text-black/45"><Lock size={13} className="shrink-0" />{t('stoneEarnedEmpty')}</p>
      )}

      <p className="mt-4 text-[11px] font-black text-black/55">{t('stoneBasic')}</p>
      <ul className="mt-2 grid grid-cols-4 gap-2 sm:max-w-md">{STONE_COLORS.map((c) => option(c, t(`stoneColor.${c}`)))}</ul>

      {opts && opts.lost.length > 0 && <>
        <p className="mt-4 text-[11px] font-black text-black/40">{ti('lostTitle')} <span className="font-bold text-black/30">· {ti('lostNote')}</span></p>
        <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {opts.lost.map((s) => (
            <li key={s} className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-black/10 px-1.5 pb-1.5 pt-2 opacity-50 grayscale">
              <Stone name={name} size={34} icon={s} />
              <span className="line-clamp-2 w-full break-keep text-center text-[9.5px] font-bold leading-tight text-black/60">{label(s)}</span>
            </li>
          ))}
        </ul>
      </>}
    </section>
  );
}
