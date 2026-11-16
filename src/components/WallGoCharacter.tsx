"use client";

import type { PlayerId } from '@/lib/wallgo';
import { PLAYER_COLORS as colors } from './wallgoTheme';

export default function WallGoCharacter({ player, selected = false, label, className = '' }: { player: PlayerId; selected?: boolean; label?: string; className?: string }) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`relative flex aspect-square items-center justify-center rounded-full transition ${selected ? 'scale-110 shadow-[0_0_0_3px_#f1f4fa,0_0_18px_rgba(241,244,250,.55)]' : 'shadow-[0_6px_14px_rgba(0,0,0,.55)]'} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="50" r="48" fill={colors[player]} />
        <circle cx="50" cy="50" r="46.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
        <rect x="47" y="31" width="9" height="18" rx="4.5" fill="#ffffff" transform="rotate(-20 51.5 40)" />
        <rect x="74" y="27" width="8" height="17" rx="4" fill="#ffffff" transform="rotate(-20 78 35.5)" />
      </svg>
    </span>
  );
}
