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

/** The share of the box the icon keeps inside the cover. */
export const COVER_INNER = 0.64;

/** A pointed feather from its root (bx, by) out along `deg` (screen degrees, y down), as a path. */
function feather(bx: number, by: number, deg: number, len: number, width: number) {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a), dy = Math.sin(a);
  const tx = bx + len * dx, ty = by + len * dy;
  const mx = bx + len * 0.42 * dx, my = by + len * 0.42 * dy;
  const f = (n: number) => n.toFixed(2);
  return {
    d: `M${f(bx)} ${f(by)} Q${f(mx - width * dy)} ${f(my + width * dx)} ${f(tx)} ${f(ty)} Q${f(mx + width * dy)} ${f(my - width * dx)} ${f(bx)} ${f(by)}Z`,
    vein: `M${f(bx)} ${f(by)} L${f(bx + len * 0.78 * dx)} ${f(by + len * 0.78 * dy)}`,
  };
}
// The left wing: long flight feathers fanning from up-and-out to straight out, short coverts over their roots.
const PRIMARIES = Array.from({ length: 7 }, (_, i) => feather(13 - i * 0.3, 36 + i * 3.4, 252 - i * 9.5, 22 + i * 1.6, 5 + i * 0.15));
const COVERTS = Array.from({ length: 6 }, (_, i) => feather(12, 40 + i * 3.2, 238 - i * 8.5, 15 + i * 0.6, 4));

/** One wing (the left one), flapping gently from its root at the band. */
function Wing({ id, motion }: { id: string; motion: boolean }) {
  return (
    <g>
      {motion && <animateTransform attributeName="transform" type="rotate" values="-7 12 48;10 12 48;-7 12 48" keyTimes="0;.45;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="1.9s" repeatCount="indefinite" />}
      {[...PRIMARIES].reverse().map((p, i) => (
        <g key={`p${i}`}>
          <path d={p.d} fill={`url(#cw-${id})`} stroke="#b0700f" strokeWidth=".6" strokeLinejoin="round" />
          <path d={p.vein} stroke="#ffffff" strokeOpacity=".7" strokeWidth=".55" strokeLinecap="round" />
        </g>
      ))}
      {[...COVERTS].reverse().map((p, i) => <path key={`c${i}`} d={p.d} fill={`url(#cf-${id})`} stroke="#c98a1a" strokeWidth=".5" strokeLinejoin="round" />)}
    </g>
  );
}

/**
 * The cover, drawn over a box of `size` (the icon sits inside at COVER_INNER): a holographic band with a light
 * sweeping round it, a turning ring of gold dots, feathered wings that flap (from 48px, reaching past the box), a star on top and a ruby heart on a ribbon.
 * Under 36px only the band and the heart are drawn, without motion.
 */
export function CoverRing({ size }: { size: number }) {
  const id = useId().replace(/:/g, '');
  const big = size >= 36;
  // The wings reach about 15% past each side of the box, so they only open where the icon has room.
  const winged = size >= 48;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      <defs>
        <linearGradient id={`cv-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6bc4" />
          <stop offset="30%" stopColor="#a98bff" />
          <stop offset="55%" stopColor="#7cf3ff" />
          <stop offset="80%" stopColor="#ffd36e" />
          <stop offset="100%" stopColor="#ff6b4a" />
        </linearGradient>
        <linearGradient id={`cw-${id}`} x1="1" y1=".6" x2="0" y2="0">
          <stop offset="0%" stopColor="#fff6d6" />
          <stop offset="40%" stopColor="#ffc93c" />
          <stop offset="78%" stopColor="#ff8fb4" />
          <stop offset="100%" stopColor="#b48cff" />
        </linearGradient>
        <linearGradient id={`cf-${id}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe3a0" />
        </linearGradient>
        <linearGradient id={`ch-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7a8a" />
          <stop offset="100%" stopColor="#c8103e" />
        </linearGradient>
        <linearGradient id={`cr-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#d9901c" />
        </linearGradient>
        <filter id={`cg-${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6" /></filter>
      </defs>

      {big && <circle cx="50" cy="50" r="42" fill="none" stroke={`url(#cv-${id})`} strokeWidth="9" opacity=".55" filter={`url(#cg-${id})`} />}
      {winged && <><Wing id={id} motion /><g transform="matrix(-1 0 0 1 100 0)"><Wing id={id} motion /></g></>}

      <circle cx="50" cy="50" r="44.6" fill="none" stroke="#d9a53a" strokeWidth=".9" strokeOpacity=".9" />
      <circle cx="50" cy="50" r="40.5" fill="none" stroke={`url(#cv-${id})`} strokeWidth="6.5" />
      <circle cx="50" cy="50" r="36.8" fill="none" stroke="#ffffff" strokeWidth="1.1" strokeOpacity=".9" />
      {big && (
        <>
          <g>
            <circle cx="50" cy="50" r="40.5" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeDasharray="14 240" opacity=".85" />
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="3.6s" repeatCount="indefinite" />
          </g>
          <g>
            <circle cx="50" cy="50" r="47.6" fill="none" stroke="#ffd36e" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 6.1" />
            <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="40s" repeatCount="indefinite" />
          </g>
          <path d="M50 -1 l2.4 5.8 5.8 2.4 -5.8 2.4 -2.4 5.8 -2.4 -5.8 -5.8 -2.4 5.8 -2.4z" fill="#fff6cf" stroke="#d9901c" strokeWidth=".8">
            <animate attributeName="opacity" values="1;.55;1" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M33 87 L67 87 L72 92.5 L64.5 92.5 L62 95.5 L38 95.5 L35.5 92.5 L28 92.5 Z" fill={`url(#cr-${id})`} stroke="#9c6c0a" strokeWidth=".7" strokeLinejoin="round" />
        </>
      )}
      <path d="M50 100 C38.5 92 37.5 82.5 43.8 81.4 C47 80.9 49 83 50 85.2 C51 83 53 80.9 56.2 81.4 C62.5 82.5 61.5 92 50 100 Z" fill={`url(#ch-${id})`} stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
      {big && <path d="M44 84.5 C42.5 85.5 42.6 87.8 44.2 89.6" fill="none" stroke="#ffffff" strokeOpacity=".8" strokeWidth="1.4" strokeLinecap="round" />}
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
