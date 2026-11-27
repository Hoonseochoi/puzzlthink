"use client";

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { useEndReveal } from '@/hooks/useEndReveal';

/**
 * The strip shown while a game's final position is on screen (useEndReveal): how the game ended and a
 * "결과 보기" button. It sits at the bottom of the screen and never covers the board's middle. Render it only
 * after the game is over (on the client), never during the server render.
 */
export function EndRevealBanner({ show, text, color = '#ffd76b', onSkip }: { show: boolean; text: ReactNode; color?: string; onSkip: () => void }) {
  const t = useTranslations('Common');
  if (!show || typeof document === 'undefined') return null;
  // Portalled to <body>: a blurred or transformed game panel would otherwise trap `fixed` inside itself.
  return createPortal(
    <div className="end-reveal-banner pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border bg-black/85 py-1.5 pl-4 pr-1.5 shadow-[0_10px_40px_rgba(0,0,0,.6)] backdrop-blur" style={{ borderColor: `${color}88`, boxShadow: `0 10px 40px rgba(0,0,0,.6), 0 0 22px ${color}40` }}>
        <span className="min-w-0 truncate text-sm font-black text-white sm:text-base"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />{text}</span>
        <button type="button" onClick={onSkip} className="flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-black" style={{ background: color, color: '#111' }}>
          {t('revealShow')}<ChevronRight size={14} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Wrap a result popup that is only mounted once the game is over: for the first moment it renders the
 * banner instead (the board stays visible underneath), then the popup. A tap anywhere skips the wait.
 */
export function EndRevealGate({ endKey, text, color, ms, until, children }: {
  endKey: string; text: ReactNode; color?: string; ms?: number; until?: number; children: ReactNode;
}) {
  const reveal = useEndReveal(endKey, ms, until);
  if (reveal.revealing) return <EndRevealBanner show text={text} color={color} onSkip={reveal.skip} />;
  return <>{children}</>;
}
