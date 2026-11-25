"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { Fireworks } from './HallCelebration';
import { Stone, refreshStoneChoices } from './StoneAvatar';
import { parseIcon } from './ProfileIcons';
import { MY_ICON_ANCHOR } from './StonePicker';
import { useIconLabel } from './useIconLabel';

/** Ask for this after something may have earned an icon (e.g. 2048 just made a 2048 block). */
export const ICONS_CHECK_EVENT = 'puzzlthink:icons-check';
export const checkNewIcons = (delayMs = 0) => window.dispatchEvent(new CustomEvent<{ delayMs: number }>(ICONS_CHECK_EVENT, { detail: { delayMs } }));

/**
 * "새 아이콘을 얻었어요!" popup. Icons are given by the server (weekly top threes, a game's #1, 2048) and switched on
 * as the player's stone at once; this tells the player the first time they come by (or right away when a game asks
 * with checkNewIcons). 확인하기 opens 기록실 › 내 프로필 아이콘.
 */
export default function IconUnlock() {
  const t = useTranslations('Icons');
  const label = useIconLabel();
  const { user } = useAuth();
  const [icons, setIcons] = useState<string[]>([]);
  const busy = useRef(false);

  const check = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || busy.current) return;
    busy.current = true;
    const { data } = await supabase.rpc('my_new_icons');
    busy.current = false;
    const fresh = (Array.isArray(data) ? (data as { icon: string }[]) : []).map((r) => r.icon).filter((i) => parseIcon(i));
    if (!fresh.length) return;
    setIcons((cur) => [...new Set([...fresh, ...cur])]);
    supabase.rpc('mark_icons_seen', { p_icons: fresh }).then(() => {});
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
  const close = () => setIcons([]);
  const name = user.user_metadata?.nickname ?? '';
  const crown = icons.some((i) => parseIcon(i)?.kind === 'crown');

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="icon-unlock-title">
      <Fireworks />
      <div className="hall-pop relative my-auto w-full max-w-sm overflow-hidden rounded-[26px] border border-[#ffd36b]/40 bg-gradient-to-b from-[#1d1a12] via-[#17201e] to-[#10140f] p-6 text-center text-white shadow-[0_0_120px_rgba(255,204,77,.3)]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#ffcc4d]/15 blur-3xl" />
        <button type="button" onClick={close} aria-label={t('close')} className="absolute right-4 top-4 text-white/40 hover:text-white"><X size={18} /></button>
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[#ffcc4d] px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#2a1d05]"><Sparkles size={11} />{t('popupBadge')}</span>
        <h2 id="icon-unlock-title" className="relative mt-3 break-keep text-2xl font-black leading-tight">{icons.length > 1 ? t('popupTitleN', { n: icons.length }) : t('popupTitle')}</h2>
        <ul className={`relative mt-5 grid gap-3 ${icons.length === 1 ? 'grid-cols-1' : icons.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {icons.slice(0, 6).map((icon, i) => (
            <li key={icon} className="flex flex-col items-center">
              <span className={i === 0 ? 'drop-shadow-[0_0_18px_rgba(255,204,77,.55)]' : ''}><Stone name={name} size={icons.length === 1 ? 104 : 64} icon={icon} /></span>
              <span className="mt-2 break-keep text-xs font-black leading-tight text-[#ffe08a]">{label(icon)}</span>
            </li>
          ))}
        </ul>
        <p className="relative mt-4 break-keep text-xs leading-5 text-white/65">{t('popupDesc')}</p>
        {crown && <p className="relative mt-2 break-keep text-[11px] leading-4 text-white/45">{t('popupCrownNote')}</p>}
        <Link href={{ pathname: '/records', hash: MY_ICON_ANCHOR }} onClick={close} className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ffcc4d] py-3 text-sm font-black text-[#2a1d05] transition hover:brightness-105">{t('confirm')}<ArrowRight size={16} /></Link>
        <button type="button" onClick={close} className="relative mt-2 w-full rounded-[14px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10">{t('close')}</button>
      </div>
    </div>
  );
}
