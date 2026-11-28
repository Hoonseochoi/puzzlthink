"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { GAMES } from '@/lib/gameCatalog';
import { inviteCopy, playCopy, preloadKakao, shareKakao, type KakaoShareInput } from '@/lib/kakaoShare';

/** KakaoTalk's speech-bubble mark, inline (no image request). */
export function KakaoMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 3.2c-5.3 0-9.6 3.37-9.6 7.53 0 2.68 1.79 5.03 4.48 6.37l-.92 3.37c-.08.3.26.54.52.37l4.03-2.66c.49.05.99.08 1.49.08 5.3 0 9.6-3.37 9.6-7.53S17.3 3.2 12 3.2Z" />
    </svg>
  );
}

/** The game whose pages we are on (by the first path segment), localised; '' outside a game. */
export function useGameName(): string {
  const tc = useTranslations('Common');
  const pathname = usePathname();
  const seg = `/${pathname.split('/')[1] ?? ''}`;
  const game = GAMES.find((g) => g.href === seg);
  return game && tc.has(game.id) ? tc(game.id) : '';
}

/**
 * The yellow 「카카오톡」 button. `get` builds the card at tap time (so it can read window/document).
 * `preload` warms the SDK on idle once the button is on screen (invite panels); otherwise it loads on tap.
 */
export default function KakaoShareButton({ get, preload = false, className = '', label }: {
  get: () => KakaoShareInput; preload?: boolean; className?: string; label?: string;
}) {
  const en = useLocale() === 'en';
  const [note, setNote] = useState('');
  useEffect(() => { if (preload) preloadKakao(); }, [preload]);

  const onClick = async () => {
    const outcome = await shareKakao(get());
    if (outcome === 'copied') { setNote(en ? 'Link copied' : '링크 복사됨'); window.setTimeout(() => setNote(''), 1800); }
  };

  return (
    <button type="button" onClick={onClick} data-kakao-share=""
      className={`flex items-center justify-center gap-1.5 rounded-[10px] bg-[#FEE500] px-3 py-2.5 text-xs font-black text-[#191600] transition hover:bg-[#f5dc00] active:scale-[.98] ${className}`}>
      <KakaoMark size={15} />{note || label || (en ? 'KakaoTalk' : '카카오톡')}
    </button>
  );
}

/**
 * Friend/open-room invite: "{닉네임}님이 {게임} 친구 대전에 초대했어요 · 방 코드 ABCD", button 참가하기.
 * `url` defaults to the current room page (the invite link), `game` to the game of the current path.
 */
export function KakaoInviteButton({ code, host, game, url, className = 'mt-2 w-full' }: {
  code: string; host?: string | null; game?: string; url?: string; className?: string;
}) {
  const en = useLocale() === 'en';
  const pathGame = useGameName();
  return (
    <KakaoShareButton preload className={className} get={() => {
      const name = game || pathGame || 'PUZZLTHINK';
      return { ...inviteCopy({ game: name, code, host, en }), url: url || `${window.location.origin}${window.location.pathname}` };
    }} />
  );
}

/** Game / result share: "{게임} 한 판 할래요?", button 플레이하기. `url` is a page on this site. */
export function KakaoPlayButton({ url, text, game, imageUrl, className = 'w-full', label }: {
  url: string; text?: string; game?: string; imageUrl?: string; className?: string; label?: string;
}) {
  const en = useLocale() === 'en';
  const pathGame = useGameName();
  return (
    <KakaoShareButton className={className} label={label} get={() => ({
      ...playCopy({ game: game || pathGame, text, en }), url, ...(imageUrl ? { imageUrl } : {}),
    })} />
  );
}
