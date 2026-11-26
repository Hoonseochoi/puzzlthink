"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Heart, Server, Sparkles, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { isGamePath } from '@/lib/siteBus';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { Fireworks } from './HallCelebration';
import { Stone } from './StoneAvatar';
import { MY_ICON_ANCHOR } from './StonePicker';
import { refreshSupporters } from './SupporterCover';

/**
 * "후원해 주셔서 감사합니다": shown once, the first time a supporter opens the site after their 후원자 커버 was
 * granted (scripts/supporter/grant.sh). Fireworks, the player's own icon wearing the cover on a turning stage, a
 * thank-you and the promise that the support goes to the servers. Not shown in the middle of a game.
 */
export default function SupporterThanks() {
  const { user, nickname } = useAuth();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const inGame = isGamePath(pathname);
  const userId = user?.id;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId || inGame) return;
    let alive = true;
    const timer = window.setTimeout(async () => {
      const { data } = await supabase.rpc('claim_supporter_thanks');
      if (!alive || data !== true) return;
      refreshSupporters();
      setShow(true);
    }, 900);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [userId, inGame]);

  if (!show || !user) return null;
  return <SupporterThanksCard name={nickname?.trim() || ''} onClose={() => setShow(false)} />;
}

const RAYS = 'conic-gradient(from 0deg, transparent 0 7deg, rgba(255,214,110,.6) 9deg 12deg, transparent 14deg 21deg, rgba(255,107,196,.45) 23deg 26deg, transparent 28deg 35deg, rgba(124,243,255,.45) 37deg 40deg, transparent 42deg 45deg)';
const HOLO = 'linear-gradient(100deg, #ffd36e, #ff6bc4, #a98bff, #7cf3ff, #ffd36e)';

export function SupporterThanksCard({ name, onClose }: { name: string; onClose: () => void }) {
  const t = useTranslations('SupporterCover');
  return (
    <div className="fixed inset-0 z-[116] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="supporter-thanks-title">
      <Fireworks />
      {/* a holographic frame around the card */}
      <div className="hall-pop relative my-auto w-full max-w-sm rounded-[32px] p-[2px] shadow-[0_0_160px_rgba(255,180,90,.45)]" style={{ background: HOLO }}>
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-b from-[#2b1a2e] via-[#17101f] to-[#0b0810] px-6 pb-6 pt-7 text-center text-white">
          <span className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ff6bc4]/25 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-[#ffd36e]/20 blur-3xl" />
          <span className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.7)_1px,transparent_1.4px)] [background-size:22px_22px] [mask-image:radial-gradient(circle_at_50%_30%,#000,transparent_70%)]" />
          <button type="button" onClick={onClose} aria-label={t('thanksClose')} className="absolute right-4 top-4 z-10 text-white/40 hover:text-white"><X size={18} /></button>

          <span className="relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 font-mono text-[10px] font-black tracking-[0.22em] text-[#2a1205]" style={{ background: HOLO }}><Sparkles size={11} />THANK YOU, SUPPORTER</span>

          {/* the stage: turning rays, a pulsing ring, the player's icon in the cover */}
          <div className="relative mx-auto mt-6 flex h-[210px] w-[210px] items-center justify-center">
            <span className="icon-rays absolute inset-[-34px] rounded-full opacity-90" style={{ background: RAYS, maskImage: 'radial-gradient(circle, #000 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 70%)' }} />
            <span className="icon-ring absolute inset-5 rounded-full border-2 border-[#ffd36e]" />
            <span className="absolute inset-9 rounded-full bg-[#ffb85a]/40 blur-2xl" />
            <span className="icon-rise relative drop-shadow-[0_0_26px_rgba(255,196,110,.6)]"><Stone name={name || 'PUZZLTHINK'} size={150} cover /></span>
          </div>

          <h2 id="supporter-thanks-title" className="relative mt-5 break-keep bg-clip-text text-[27px] font-black leading-tight tracking-[-0.03em] text-transparent" style={{ backgroundImage: HOLO }}>{t('thanksTitle')}</h2>
          {name && <p className="relative mt-1.5 text-[15px] font-black text-[#ffe08a]">{t('thanksName', { name })}</p>}
          <p className="icon-chip relative mt-3 break-keep text-[13px] leading-6 text-white/75" style={{ animationDelay: '.45s' }}>{t('thanksBody')}</p>

          <div className="icon-chip relative mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left" style={{ animationDelay: '.6s' }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffd36e] text-[#2a1205]"><Server size={17} /></span>
            <span className="min-w-0 break-keep text-[12px] font-bold leading-[18px] text-white/85">{t('thanksServer')}</span>
          </div>
          <p className="icon-chip relative mt-3 flex items-center justify-center gap-1.5 text-[11.5px] font-black text-[#ff9db5]" style={{ animationDelay: '.72s' }}><Heart size={12} fill="currentColor" />{t('thanksCover')}</p>

          <Link href={{ pathname: '/records', hash: MY_ICON_ANCHOR }} onClick={onClose} className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-black text-[#2a1205] transition hover:brightness-105" style={{ background: HOLO }}>{t('thanksSee')}<ArrowRight size={16} /></Link>
          <button type="button" onClick={onClose} className="relative mt-2 w-full rounded-[14px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10">{t('thanksClose')}</button>
        </div>
      </div>
    </div>
  );
}
