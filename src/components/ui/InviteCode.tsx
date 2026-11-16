"use client";

import { useTranslations } from 'next-intl';

/** The room's invite code, large, for friends to type on the game's entry screen. Shown above the link. */
export default function InviteCode({ code }: { code: string }) {
  const t = useTranslations('GameGate');
  return (
    <div className="mt-4 rounded-md border border-white/10 bg-[#0b0b0e] p-3">
      <p className="text-[9px] font-black tracking-widest text-white/30">{t('inviteCode')}</p>
      <p className="mt-1 font-mono text-3xl font-black uppercase tracking-[.3em] text-(--accent)">{code}</p>
      <p className="mt-1 text-[11px] leading-5 text-white/45">{t('inviteCodeHint')}</p>
    </div>
  );
}
