"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Hourglass, RotateCcw, Share2, Trophy } from 'lucide-react';
import { usePractice } from './OpenPractice';
import HomeButton from './ui/HomeButton';
import { displayName, useAuth } from './AuthProvider';
import AuthButton from './AuthButton';
import { clearPendingGame } from '@/lib/stats';
import { ResultBannerSlot } from './ads/HiddenLogAd';
import AdSlot from './AdSlot';
import { AppTesterCard } from './AppTesterInvite';
import MatchWinner from './match/MatchWinner';
import { KakaoPlayButton } from './ui/KakaoShareButton';
import { useFocusResult } from './focus/focusStore';

/** "Keep this on record?" card with Google sign-in, shown on result screens to signed-out players. */
function RecordPrompt() {
  const t = useTranslations('Common');
  const { user, ready, configured } = useAuth();
  const [wasSignedOut, setWasSignedOut] = useState(false);
  const [saved, setSaved] = useState(false);
  if (ready && !user && !wasSignedOut) setWasSignedOut(true);

  useEffect(() => {
    const onSaved = () => setSaved(true);
    window.addEventListener('puzzlthink:game-saved', onSaved);
    return () => window.removeEventListener('puzzlthink:game-saved', onSaved);
  }, []);

  if (!ready || !configured) return null;
  if (user) {
    // Only confirm when the player signed in from this screen.
    if (!wasSignedOut && !saved) return null;
    return (
      <div className="mt-5 flex items-center justify-center gap-2 rounded-[14px] border border-[#3ddc97]/35 bg-[#3ddc97]/10 px-4 py-3 text-xs font-bold text-[#7ff0bf]">
        <Check size={14} />{saved ? t('recordSaved') : t('recordSignedIn', { name: displayName(user) })}
      </div>
    );
  }
  return (
    <div className="mt-5 rounded-[16px] border border-[#ffd36e]/30 bg-gradient-to-b from-[#ffd36e]/12 to-white/[0.03] px-4 py-4 text-center">
      <Trophy size={22} className="mx-auto text-[#ffd36e]" />
      <p className="mt-2 text-sm font-black text-white">{t('recordTitle')}</p>
      <p className="mt-1 text-xs text-white/60">{t('recordDesc')}</p>
      <div className="mt-3 flex justify-center"><AuthButton source="result" /></div>
    </div>
  );
}

/**
 * End-of-game panel: sign-in prompt (signed-out players), then quit / play again / share — share copies the game's page link.
 * Order: sponsor card, then `replay` (the screen's 복기 button and anything tied to it), then sign-in and the buttons,
 * so the card sits in the middle and players scroll past it to 복기 / 다시 하기.
 * `won` picks the sponsor card's copy (unknown → the winning line).
 * `gamePath` is the game page (e.g. "/heavy13"); 홈으로 (HomeButton) leaves for the home page.
 */
export default function ResultActions({ onAgain, waitingLabel, gamePath, primaryClass, won, replay }: {
  onAgain?: () => void; waitingLabel?: string; gamePath: string; primaryClass: string; won?: boolean; replay?: React.ReactNode;
}) {
  const t = useTranslations('Common');
  const tp = useTranslations('OpenPractice');
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const practice = usePractice();
  useFocusResult(); // a result is showing: the game is over, leaving it costs nothing

  const share = async () => {
    const url = `${window.location.origin}/${locale}${gamePath}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers or blocked clipboard: fall back to a hidden textarea.
      const area = document.createElement('textarea');
      area.value = url; area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.appendChild(area); area.select();
      try { document.execCommand('copy'); } catch { /* nothing else to try */ }
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const secondary = 'flex items-center justify-center gap-1.5 rounded-[12px] border border-white/15 bg-white/5 py-3 text-xs font-bold text-white/80 hover:bg-white/10';
  // Practice beside an open room: back to waiting, or another practice game.
  if (practice) {
    return (
      <>
      {replay}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={practice.wait} className={secondary}><Hourglass size={14} />{tp('wait')}</button>
        <button onClick={practice.again} className={`flex items-center justify-center gap-1.5 py-3 text-xs font-black ${primaryClass}`}><RotateCcw size={14} />{tp('again')}</button>
      </div>
      </>
    );
  }
  return (
    <>
      {/* Friend / open matches: the winner's icon, big (nothing in AI and solo games). */}
      <MatchWinner />
      <ResultBannerSlot won={won} className="mt-5" />
      {replay}
      <RecordPrompt />
      <div className="mt-4 space-y-2">
        {!onAgain && waitingLabel && <p className="pb-1 text-center text-xs text-white/45">{waitingLabel}</p>}
        <div className={`grid gap-2 ${onAgain ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <HomeButton block onClick={clearPendingGame} />
          {onAgain && <button onClick={() => { clearPendingGame(); onAgain(); }} className={`flex items-center justify-center gap-1.5 py-3 text-xs font-black ${primaryClass}`}><RotateCcw size={14} />{t('playAgainShort')}</button>}
          <button onClick={share} className={copied ? `${secondary} !border-[#3ddc97]/60 !bg-[#3ddc97]/15 !text-[#7ff0bf]` : secondary}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}{copied ? t('linkCopied') : t('share')}
          </button>
        </div>
        <KakaoPlayButton url={`/${locale}${gamePath}`} className="w-full rounded-[12px] py-3" />
      </div>
      {/* Below the buttons (it loads the member's status first), so it never shifts them under the player's finger. */}
      <AppTesterCard className="mt-5" />
      {/* Below the buttons so a late-loading ad never shifts them under the player's finger. */}
      <AdSlot placement="result" tone="dark" compact className="mt-5 border-t border-white/10 pt-4" />
    </>
  );
}
