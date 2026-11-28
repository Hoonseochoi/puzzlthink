"use client";

import { useTranslations } from 'next-intl';
import { KakaoInviteButton } from './KakaoShareButton';

/**
 * The room's invite code, large, for friends to type on the game's entry screen. Shown above the link, with the
 * 「카카오톡」 invite button under it (card: "{host}님이 {게임} 친구 대전에 초대했어요 · 방 코드 …").
 * `host` is the inviting player's room nickname; `game` / `url` default to the current game and room page.
 */
export default function InviteCode({ code, host, game, url }: { code: string; host?: string | null; game?: string; url?: string }) {
  const t = useTranslations('GameGate');
  return (
    <>
      <div className="mt-4 rounded-md border border-white/10 bg-[#0b0b0e] p-3">
        <p className="text-[9px] font-black tracking-widest text-white/30">{t('inviteCode')}</p>
        <p className="mt-1 font-mono text-3xl font-black uppercase tracking-[.3em] text-(--accent)">{code}</p>
        <p className="mt-1 text-[11px] leading-5 text-white/45">{t('inviteCodeHint')}</p>
      </div>
      <KakaoInviteButton code={code} host={host} game={game} url={url} />
    </>
  );
}
