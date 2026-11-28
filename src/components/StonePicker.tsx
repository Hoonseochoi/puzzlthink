"use client";

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Lock, Sparkles } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { STONE_COLORS, Stone, refreshStoneChoices } from './StoneAvatar';
import { parseIcon } from './ProfileIcons';
import { useIconLabel } from './useIconLabel';
import IconCollectionLink from './IconCollectionLink';
import { SupporterCoverCard } from './SupporterCover';
import { StoneIconSwitch } from './StoneIconToggle';

type Options = { chosen: string | null; earned: string[]; lost: string[] };
export const MY_ICON_ANCHOR = 'my-icon';

/**
 * 기록실 › 닉네임: pick your profile icon. Earned icons come first (피스·블랙피스 weekly top three, 2048, a game's #1),
 * then the four colours open to everyone. A newly earned icon is switched on by the server; a lost #1 icon shows
 * greyed out below. The server checks ownership (set_my_stone). Picking saves at once.
 * Reached from the "new icon" popup with /records#my-icon: it scrolls itself into view.
 * The dark head is the profile card: the icon in use, the nickname, and `form` (the nickname editor) under it.
 */
export default function StonePicker({ name, form }: { name: string; form?: ReactNode }) {
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
          className={`relative flex w-full flex-col items-center gap-1.5 rounded-[20px] px-2 pb-2.5 pt-3.5 transition active:scale-95 disabled:cursor-wait ${on ? 'bg-[#17201e] text-white shadow-[0_0_0_2px_#ffd36e,0_10px_24px_rgba(23,32,30,.28)]' : 'bg-white text-black/70 shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,.22)]'} ${saving === stone ? 'animate-pulse' : ''}`}>
          <Stone name={name} size={icon ? 50 : 42} stone={stone} cover={false} />
          <span className="line-clamp-2 w-full break-keep text-center text-[10.5px] font-black leading-tight">{text}</span>
          {on && <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ffd36e] text-[#17201e]"><Check size={11} strokeWidth={3.5} /></span>}
        </button>
      </li>
    );
  };
  const chosen = opts?.chosen ?? null;
  const chosenLabel = !chosen ? null : parseIcon(chosen) ? label(chosen) : t(`stoneColor.${chosen}`);

  return (
    <section ref={ref} id={MY_ICON_ANCHOR} className={`mt-4 scroll-mt-24 overflow-hidden rounded-[28px] border bg-[#f9f7f1] transition-shadow duration-700 ${flash ? 'border-[#ff6b4a] shadow-[0_0_0_4px_rgba(255,107,74,.25)]' : 'border-black/10'}`}>
      {/* profile card: the icon in use, the nickname, the nickname editor */}
      <div className="relative overflow-hidden bg-[#17201e] p-5 text-white sm:p-6">
        <span className="pointer-events-none absolute -left-10 -top-16 h-52 w-52 rounded-full bg-[#ffd36e]/25 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-[#ff6b4a]/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[28px] bg-white/[.07] ring-1 ring-white/15"><Stone name={name} size={68} stone={chosen ?? undefined} /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffd36e]">{t('stoneTitle')}</p>
            <p className="mt-0.5 truncate text-2xl font-black tracking-[-0.04em]">{name}</p>
            <p className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/80"><Sparkles size={11} className="shrink-0 text-[#ffd36e]" /><span className="truncate">{chosenLabel ?? t('stoneBasic')}</span></p>
          </div>
        </div>
        {form && <div className="relative mt-4">{form}</div>}
      </div>

      <div className="p-5 sm:p-6">
      <p className="break-keep text-[11px] font-bold text-black/45">{saving ? t('stoneSaving') : error ? <span className="text-[#c2410c]">{t('stoneError')}</span> : opts?.chosen ? t('stoneSavedNote') : t('stoneAutoNote')}</p>

      <p className="mt-4 flex items-center gap-1 text-[11px] font-black text-black/55"><Sparkles size={12} className="text-[#e8a33c]" />{t('stoneEarned')}</p>
      {opts && opts.earned.length ? (
        <ul className="mt-2 grid grid-cols-3 gap-2.5 sm:grid-cols-5">{opts.earned.map((s) => option(s, label(s)))}</ul>
      ) : (
        <p className="mt-2 flex items-center gap-2 break-keep rounded-2xl border border-dashed border-black/15 px-3 py-2.5 text-[11px] font-bold text-black/45"><Lock size={13} className="shrink-0" />{t('stoneEarnedEmpty')}</p>
      )}

      <p className="mt-4 text-[11px] font-black text-black/55">{t('stoneBasic')}</p>
      <ul className="mt-2 grid grid-cols-4 gap-2 sm:max-w-md">{STONE_COLORS.map((c) => option(c, t(`stoneColor.${c}`)))}</ul>

      <StoneIconSwitch className="mt-4" />

      {opts && opts.lost.length > 0 && <>
        <p className="mt-4 text-[11px] font-black text-black/40">{ti('lostTitle')} <span className="font-bold text-black/30">· {ti('lostNote')}</span></p>
        <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {opts.lost.map((s) => (
            <li key={s} className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-black/10 px-1.5 pb-1.5 pt-2 opacity-50 grayscale">
              <Stone name={name} size={34} icon={s} cover={false} />
              <span className="line-clamp-2 w-full break-keep text-center text-[9.5px] font-bold leading-tight text-black/60">{label(s)}</span>
            </li>
          ))}
        </ul>
      </>}

      <div className="mt-5"><SupporterCoverCard name={name} stone={chosen} signedIn place="cover_records" /></div>

      <IconCollectionLink owned={opts ? opts.earned.length : undefined} className="mt-5" />
      </div>
    </section>
  );
}
