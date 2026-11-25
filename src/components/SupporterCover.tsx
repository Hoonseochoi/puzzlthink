"use client";

import { useEffect, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { SUPPORT_URL, trackSupportClick } from './SupportLink';
import { Stone } from './StoneAvatar';

/**
 * 후원자 커버: a ring around the profile icon of players who supported the site (granted by hand, see
 * supabase/migrations/20271126090000_supporter_cover.sql). It wraps whatever icon the player uses.
 */

// Nicknames with the cover on, fetched once per page load and shared by every avatar.
let namesPromise: Promise<Set<string>> | null = null;
const listeners = new Set<() => void>();
function loadNames() {
  namesPromise ??= (async () => {
    const supabase = getSupabase();
    if (!supabase) return new Set<string>();
    const { data } = await supabase.rpc('supporter_names');
    return new Set(Array.isArray(data) ? (data as { nickname: string }[]).map((r) => r.nickname) : []);
  })();
  return namesPromise;
}
/** Call after a player switches their cover on or off: every avatar on the page redraws. */
export function refreshSupporters() {
  namesPromise = null;
  listeners.forEach((fn) => fn());
}

/** Whether this nickname's icon wears the cover. `skip` (a preview of some icon) never looks it up. */
export function useSupporter(name: string, skip = false) {
  const [on, setOn] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    listeners.add(bump);
    return () => { listeners.delete(bump); };
  }, []);
  useEffect(() => {
    if (skip || !name) return;
    let alive = true;
    loadNames().then((s) => { if (alive) setOn(s.has(name)); });
    return () => { alive = false; };
  }, [name, skip, version]);
  return !skip && on;
}

/** Golden laurel leaves up both sides from the heart: [x, y, rotation] on a circle just outside the band. */
const LEAVES: [number, number, number][] = [115, 135, 155, 175, 195].flatMap((deg, i) => {
  const out: [number, number, number][] = [];
  for (const side of [1, -1]) {
    const a = ((side === 1 ? deg : 180 - deg) * Math.PI) / 180;
    const r = 51.5 - i * 0.4;
    const x = +(50 + r * Math.cos(a)).toFixed(2), y = +(50 + r * Math.sin(a)).toFixed(2);
    out.push([x, y, Math.round((side === 1 ? deg : 180 - deg) + 90 + side * 35)]);
  }
  return out;
});

/** The share of the box the icon keeps inside the cover. */
export const COVER_INNER = 0.76;

/**
 * The ring itself, drawn over a box of `size`: a slowly turning coral-gold-pink band, a fine inner line,
 * a heart at the bottom and (from 36px up) a few sparkles.
 */
export function CoverRing({ size }: { size: number }) {
  const id = useId().replace(/:/g, '');
  const big = size >= 36;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      <defs>
        <linearGradient id={`cv-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6b4a" />
          <stop offset="35%" stopColor="#ffd36e" />
          <stop offset="65%" stopColor="#ff6bc4" />
          <stop offset="100%" stopColor="#a98bff" />
        </linearGradient>
        <linearGradient id={`cl-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3b8" />
          <stop offset="100%" stopColor="#e8a33c" />
        </linearGradient>
        <linearGradient id={`ch-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a73" />
          <stop offset="100%" stopColor="#e8365f" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#ff6b4a" strokeOpacity=".18" strokeWidth="7" />
      <g>
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#cv-${id})`} strokeWidth="4.5" strokeLinecap="round" strokeDasharray="62 10 40 10" />
        {big && <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="14s" repeatCount="indefinite" />}
      </g>
      <circle cx="50" cy="50" r="41.5" fill="none" stroke="#ffffff" strokeOpacity=".75" strokeWidth="1" />
      {big && LEAVES.map(([x, y, rot], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="2.1" transform={`rotate(${rot} ${x} ${y})`} fill={`url(#cl-${id})`} stroke="#9c6c0a" strokeWidth=".5" />
      ))}
      {big && <>
        <path d="M13 17 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8z" fill="#ffd36e" stroke="#ffffff" strokeWidth=".8" />
        <path d="M88 22 l1.3 3.2 3.2 1.3 -3.2 1.3 -1.3 3.2 -1.3 -3.2 -3.2 -1.3 3.2 -1.3z" fill="#ffffff" />
        <path d="M90 70 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1z" fill="#ffb3dc" />
      </>}
      <path d="M50 99 C39 91 38 82.5 44 81.5 C47 81 49 83 50 85 C51 83 53 81 56 81.5 C62 82.5 61 91 50 99 Z" fill={`url(#ch-${id})`} stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** The signed-in player's cover: has it, and whether it is switched on. Null while loading or signed out. */
export function useMyCover(signedIn: boolean) {
  const [mine, setMine] = useState<{ has: boolean; on: boolean } | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    getSupabase()?.rpc('my_supporter_cover').then(({ data }) => {
      const d = data as { has?: boolean; on?: boolean } | null;
      if (alive && d) setMine({ has: !!d.has, on: !!d.on });
    });
    return () => { alive = false; };
  }, [signedIn]);
  const toggle = async (on: boolean) => {
    const supabase = getSupabase();
    if (!supabase || !mine?.has) return;
    setMine({ ...mine, on });
    const { error } = await supabase.rpc('set_my_cover', { p_on: on });
    if (error) setMine(mine); else refreshSupporters();
  };
  return { mine: signedIn ? mine : null, toggle };
}

/**
 * The cover explained, with a preview on this player's icon: a support button when they do not have it yet
 * (their nickname goes in the support message), an on/off switch when they do.
 * `name`/`stone` preview on the player's own icon; without them (signed out) a plain stone is shown.
 */
export function SupporterCoverCard({ name, stone, signedIn, place, tone = 'light' }: {
  name?: string; stone?: string | null; signedIn: boolean; place: 'cover_records' | 'cover_icons'; tone?: 'light' | 'dark';
}) {
  const t = useTranslations('SupporterCover');
  const { mine, toggle } = useMyCover(signedIn);
  const dark = tone === 'dark';
  const has = !!mine?.has;
  return (
    <section className={`relative overflow-hidden rounded-[24px] border p-5 ${dark ? 'border-[#ff8a73]/30 bg-[#1d1418] text-white' : 'border-[#ff6b4a]/30 bg-[linear-gradient(135deg,#fff4ec,#ffeef7)] text-[#17201e]'}`}>
      <span className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-[#ff6bc4]/20 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <span className={`flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[24px] ${dark ? 'bg-white/[.06]' : 'bg-white/80'}`}>
          <Stone name={name || 'PUZZLTHINK'} size={72} stone={stone ?? (name ? undefined : 'white')} cover={has ? mine!.on : true} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff6b4a]">SUPPORTER COVER</p>
          <h3 className="mt-0.5 break-keep text-lg font-black leading-tight">{t('title')}</h3>
          <p className={`mt-1 break-keep text-[12px] leading-5 ${dark ? 'text-white/65' : 'text-black/60'}`}>{has ? t('ownedDesc') : t('desc')}</p>
        </div>
      </div>
      {has ? (
        <div className="relative mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-[#ff6b4a] px-3 py-1 text-[11px] font-black text-white"><Heart size={12} fill="currentColor" />{t('owned')}</span>
          <div className={`ml-auto flex rounded-full p-1 ${dark ? 'bg-white/10' : 'bg-black/[.06]'}`} role="group" aria-label={t('title')}>
            {[true, false].map((v) => (
              <button key={String(v)} type="button" onClick={() => toggle(v)} aria-pressed={mine!.on === v}
                className={`rounded-full px-3 py-1 text-[11px] font-black transition ${mine!.on === v ? 'bg-[#17201e] text-white' : dark ? 'text-white/60' : 'text-black/55'}`}>{v ? t('on') : t('off')}</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <ol className={`relative mt-4 space-y-1.5 text-[12px] font-bold leading-5 ${dark ? 'text-white/70' : 'text-black/65'}`}>
            <li className="flex gap-2"><span className="font-mono text-[#ff6b4a]">01</span><span className="break-keep">{t('step1')}</span></li>
            <li className="flex gap-2"><span className="font-mono text-[#ff6b4a]">02</span><span className="break-keep">{name && signedIn ? t('step2Name', { name }) : t('step2')}</span></li>
            <li className="flex gap-2"><span className="font-mono text-[#ff6b4a]">03</span><span className="break-keep">{t('step3')}</span></li>
          </ol>
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick(place)}
            className="relative mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-[#ff6b4a] py-3 text-sm font-black text-white transition hover:bg-[#ff5530]">
            <Heart size={15} fill="currentColor" />{t('cta')}
          </a>
          <p className={`relative mt-2 text-center text-[10px] leading-4 ${dark ? 'text-white/40' : 'text-black/40'}`}>{t('note')}</p>
        </>
      )}
    </section>
  );
}
