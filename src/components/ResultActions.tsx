"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, LogOut, RotateCcw, Share2, Trophy } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { displayName, useAuth } from './AuthProvider';
import AuthButton from './AuthButton';
import AdSlot from './AdSlot';
import { CoffeeNudge } from './SupportLink';
import { clearPendingGame } from '@/lib/stats';

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
      <div className="mt-3 flex justify-center"><AuthButton /></div>
    </div>
  );
}

/**
 * End-of-game panel: sign-in prompt (signed-out players), then quit / play again / share — share copies the game's page link.
 * `gamePath` is the game page (e.g. "/heavy13"); `exitPath` is where 끝내기 goes.
 */
export default function ResultActions({ onAgain, waitingLabel, gamePath, exitPath, primaryClass }: {
  onAgain?: () => void; waitingLabel?: string; gamePath: string; exitPath: string; primaryClass: string;
}) {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

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
  return (
    <>
      <RecordPrompt />
      <div className="mt-4 space-y-2">
        {!onAgain && waitingLabel && <p className="pb-1 text-center text-xs text-white/45">{waitingLabel}</p>}
        <div className={`grid gap-2 ${onAgain ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <button onClick={() => { clearPendingGame(); router.push(exitPath); }} className={secondary}><LogOut size={14} />{t('quit')}</button>
          {onAgain && <button onClick={() => { clearPendingGame(); onAgain(); }} className={`flex items-center justify-center gap-1.5 py-3 text-xs font-black ${primaryClass}`}><RotateCcw size={14} />{t('playAgainShort')}</button>}
          <button onClick={share} className={copied ? `${secondary} !border-[#3ddc97]/60 !bg-[#3ddc97]/15 !text-[#7ff0bf]` : secondary}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}{copied ? t('linkCopied') : t('share')}
          </button>
        </div>
      </div>
      <CoffeeNudge className="mt-4" />
      {/* Below the buttons so a late-loading ad never shifts them under the player's finger. */}
      <AdSlot placement="result" tone="dark" compact className="mt-5 border-t border-white/10 pt-4" />
    </>
  );
}
