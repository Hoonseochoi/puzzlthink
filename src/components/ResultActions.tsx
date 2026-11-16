"use client";

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, LogOut, RotateCcw, Share2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

/**
 * End-of-game buttons: play again (if allowed), leave, and share — share copies the game's page link.
 * `gamePath` is the game page (e.g. "/heavy13"); `exitPath` is where 나가기 goes.
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

  return (
    <div className="mt-6 space-y-2">
      {onAgain
        ? <button onClick={onAgain} className={`flex w-full items-center justify-center gap-2 py-3.5 text-sm font-black ${primaryClass}`}><RotateCcw size={15} />{t('playAgainShort')}</button>
        : waitingLabel && <p className="pb-1 text-center text-xs text-white/45">{waitingLabel}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => router.push(exitPath)} className="flex items-center justify-center gap-1.5 rounded-[12px] border border-white/15 bg-white/5 py-3 text-xs font-bold text-white/80 hover:bg-white/10"><LogOut size={14} />{t('exit')}</button>
        <button onClick={share} className={`flex items-center justify-center gap-1.5 rounded-[12px] border py-3 text-xs font-bold transition ${copied ? 'border-[#3ddc97]/60 bg-[#3ddc97]/15 text-[#7ff0bf]' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}>
          {copied ? <Check size={14} /> : <Share2 size={14} />}{copied ? t('linkCopied') : t('share')}
        </button>
      </div>
    </div>
  );
}
