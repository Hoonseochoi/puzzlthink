"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { Fireworks } from './HallCelebration';
import { Stone, refreshStoneChoices } from './StoneAvatar';
import { type IconRef, parseIcon } from './ProfileIcons';
import { MY_ICON_ANCHOR } from './StonePicker';
import { useIconLabel } from './useIconLabel';

/** Ask for this after something may have earned an icon (e.g. 2048 just made a 2048 block). */
export const ICONS_CHECK_EVENT = 'puzzlthink:icons-check';
export const checkNewIcons = (delayMs = 0) => window.dispatchEvent(new CustomEvent<{ delayMs: number }>(ICONS_CHECK_EVENT, { detail: { delayMs } }));

/** Which new icon leads the popup: HIDDEN MISSION, then the contest / #1 / 2048 icons, then the achievement badges. */
function weight(ref: IconRef | null): number {
  if (!ref) return 0;
  switch (ref.kind) {
    case 'mission': return 1000 + (ref.mission === 'rank' ? 3 : ref.mission === 'hell' ? 2 : 1);
    case 'tester': return ref.tier === 'founder' ? 960 : ref.tier === '14d' ? 955 : 950;
    case 'piece': case 'hell': case 'open': return 900 - ref.place;
    case 'crown': return 850;
    case 'liar': return 800;
    case 'm2048': return 700 + Math.log2(ref.tier);
    case 'play': return 500 + ref.hours;
    case 'hellClear': return 400;
    case 'openWin': return 380;
    case 'friendWin': return 370;
    case 'hard': return 300;
  }
}

type Theme = { kicker: string; card: string; glow: string; rays: string; ring: string; accent: string; ink: string; label: string };
const GOLD: Theme = {
  kicker: 'NEW ICON', card: 'from-[#2a2212] via-[#17201e] to-[#0f130f]', glow: 'rgba(255,204,77,.35)',
  rays: 'conic-gradient(from 0deg, transparent 0 8deg, rgba(255,214,110,.55) 10deg 14deg, transparent 16deg 30deg)',
  ring: '#ffcc4d', accent: '#ffcc4d', ink: '#2a1d05', label: '#ffe08a',
};
const MISSION: Theme = {
  kicker: 'HIDDEN MISSION CLEAR', card: 'from-[#2a1670] via-[#150b44] to-[#08041f]', glow: 'rgba(169,139,255,.45)',
  rays: 'conic-gradient(from 0deg, transparent 0 8deg, rgba(124,243,255,.5) 10deg 13deg, transparent 15deg 22deg, rgba(255,107,196,.45) 24deg 27deg, transparent 29deg 36deg)',
  ring: '#a98bff', accent: '#ffd36b', ink: '#1a0a4a', label: '#ffe08a',
};

const TESTER: Theme = {
  kicker: 'PLAY TESTER', card: 'from-[#1d1060] via-[#120a3a] to-[#071a14]', glow: 'rgba(184,255,58,.35)',
  rays: 'conic-gradient(from 0deg, transparent 0 8deg, rgba(184,255,58,.5) 10deg 13deg, transparent 15deg 22deg, rgba(169,139,255,.5) 24deg 27deg, transparent 29deg 36deg)',
  ring: '#b8ff3a', accent: '#b8ff3a', ink: '#12063a', label: '#d8ff7a',
};

/**
 * "새 아이콘을 얻었어요!" — shown once per new icon, the next time the player opens the site signed in (or right away
 * when a game asks with checkNewIcons). The best new icon takes the stage with turning light rays; the rest line up
 * under it. A HIDDEN MISSION icon gets its own cosmic version. 확인하기 opens 기록실 › 내 프로필 아이콘.
 */
export default function IconUnlock() {
  const { user } = useAuth();
  const [icons, setIcons] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string | null>(null);
  const busy = useRef(false);

  const check = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || busy.current) return;
    busy.current = true;
    const { data } = await supabase.rpc('my_new_icons');
    busy.current = false;
    const fresh = (Array.isArray(data) ? (data as { icon: string }[]) : []).map((r) => r.icon).filter((i) => parseIcon(i));
    if (!fresh.length) return;
    setIcons((cur) => [...new Set([...fresh, ...cur])].sort((a, b) => weight(parseIcon(b)) - weight(parseIcon(a))));
    supabase.rpc('mark_icons_seen', { p_icons: fresh }).then(() => {});
    supabase.rpc('my_stone_options').then(({ data: opts }) => setEquipped((opts as { chosen?: string | null } | null)?.chosen ?? null));
    refreshStoneChoices();
    window.dispatchEvent(new Event('puzzlthink:icons-changed'));
  }, []);

  useEffect(() => {
    if (!user) return;
    const timers: number[] = [window.setTimeout(check, 1500)];
    const onCheck = (e: Event) => { timers.push(window.setTimeout(check, (e as CustomEvent<{ delayMs?: number }>).detail?.delayMs ?? 0)); };
    window.addEventListener(ICONS_CHECK_EVENT, onCheck);
    return () => { window.removeEventListener(ICONS_CHECK_EVENT, onCheck); timers.forEach((id) => window.clearTimeout(id)); };
  }, [user, check]);

  if (!icons.length || !user) return null;
  return <UnlockCard icons={icons} equipped={equipped} name={user.user_metadata?.nickname ?? ''} onClose={() => setIcons([])} />;
}

/** The celebration card itself (icons sorted best first). */
export function UnlockCard({ icons, equipped, name, onClose: close }: { icons: string[]; equipped: string | null; name: string; onClose: () => void }) {
  const t = useTranslations('Icons');
  const label = useIconLabel();
  const [hero, ...rest] = icons;
  const heroRef = parseIcon(hero);
  const theme = heroRef?.kind === 'mission' ? MISSION : heroRef?.kind === 'tester' ? TESTER : GOLD;
  const crown = icons.some((i) => parseIcon(i)?.kind === 'crown');

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="icon-unlock-title">
      <Fireworks />
      <div className={`hall-pop relative my-auto w-full max-w-sm overflow-hidden rounded-[30px] border border-white/15 bg-gradient-to-b ${theme.card} px-6 pb-6 pt-7 text-center text-white`} style={{ boxShadow: `0 0 140px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,.12)` }}>
        <span className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ background: theme.glow }} />
        <span className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <button type="button" onClick={close} aria-label={t('close')} className="absolute right-4 top-4 z-10 text-white/40 hover:text-white"><X size={18} /></button>

        <span className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-black tracking-[0.22em]" style={{ background: theme.accent, color: theme.ink }}><Sparkles size={11} />{theme.kicker}</span>
        <h2 id="icon-unlock-title" className="relative mt-3 break-keep text-[26px] font-black leading-tight tracking-[-0.03em]">{heroRef?.kind === 'mission' ? t('popupTitleMission') : heroRef?.kind === 'tester' ? t('popupTitleTester') : icons.length > 1 ? t('popupTitleN', { n: icons.length }) : t('popupTitle')}</h2>

        {/* the stage: turning rays, a pulsing ring, the icon rising in */}
        <div className="relative mx-auto mt-4 flex h-[200px] w-[200px] items-center justify-center">
          <span className="icon-rays absolute inset-[-30px] rounded-full opacity-80" style={{ background: theme.rays, maskImage: 'radial-gradient(circle, #000 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 70%)' }} />
          <span className="icon-ring absolute inset-6 rounded-full border-2" style={{ borderColor: theme.ring }} />
          <span className="absolute inset-10 rounded-full blur-2xl" style={{ background: theme.glow }} />
          <span className="icon-rise relative" style={{ filter: `drop-shadow(0 0 22px ${theme.glow})` }}><Stone name={name} size={140} icon={hero} /></span>
        </div>

        <p className="icon-chip relative mt-1 break-keep text-lg font-black leading-tight" style={{ color: theme.label, animationDelay: '.45s' }}>{label(hero)}</p>
        {equipped === hero && <p className="icon-chip relative mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/80" style={{ animationDelay: '.6s' }}><Check size={12} strokeWidth={3} />{t('popupEquipped')}</p>}

        {rest.length > 0 && (
          <ul className="relative mt-5 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {rest.map((icon, i) => (
              <li key={icon} className="icon-chip flex w-[84px] shrink-0 snap-start flex-col items-center rounded-2xl border border-white/10 bg-white/[0.05] px-1.5 pb-2 pt-2.5" style={{ animationDelay: `${0.65 + i * 0.08}s` }}>
                <Stone name={name} size={52} icon={icon} />
                <span className="mt-1.5 line-clamp-2 break-keep text-[10px] font-black leading-tight text-white/75">{label(icon)}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="relative mt-4 break-keep text-xs leading-5 text-white/60">{t('popupDesc')}</p>
        {crown && <p className="relative mt-2 break-keep text-[11px] leading-4 text-white/45">{t('popupCrownNote')}</p>}
        <Link href={{ pathname: '/records', hash: MY_ICON_ANCHOR }} onClick={close} className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-black transition hover:brightness-105" style={{ background: theme.accent, color: theme.ink }}>{t('confirm')}<ArrowRight size={16} /></Link>
        <button type="button" onClick={close} className="relative mt-2 w-full rounded-[14px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10">{t('close')}</button>
      </div>
    </div>
  );
}
