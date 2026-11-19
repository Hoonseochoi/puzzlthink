"use client";

import { createContext, useContext } from 'react';
import type { PieceKind, PlayerId, Variant } from '@/lib/wallgo';
import { PLAYER_COLORS, V2_PLAYER_COLORS } from './wallgoTheme';

/** Which game the pieces belong to (벽바둑 II uses the broadcast colours). Provided by the game and room screens. */
export const WallGoVariant = createContext<Variant>(1);

/** A player's piece. 벽바둑 II square pieces are drawn as a rounded square, round pieces (and all 벽바둑 pieces) as a disc. */
export default function WallGoCharacter({ player, selected = false, label, className = '', kind }: { player: PlayerId; selected?: boolean; label?: string; className?: string; kind?: PieceKind }) {
  const square = kind === 'square';
  const colors = useContext(WallGoVariant) === 2 ? V2_PLAYER_COLORS : PLAYER_COLORS;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`relative flex aspect-square items-center justify-center ${square ? 'rounded-[18%]' : 'rounded-full'} transition ${selected ? 'scale-110 shadow-[0_0_0_3px_#f1f4fa,0_0_18px_rgba(241,244,250,.55)]' : 'shadow-[0_6px_14px_rgba(0,0,0,.55)]'} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {square ? <>
          <rect x="2" y="2" width="96" height="96" rx="17" fill={colors[player]} />
          <rect x="3.5" y="3.5" width="93" height="93" rx="15.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
        </> : <>
          <circle cx="50" cy="50" r="48" fill={colors[player]} />
          <circle cx="50" cy="50" r="46.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
        </>}
        <rect x="47" y="31" width="9" height="18" rx="4.5" fill="#ffffff" transform="rotate(-20 51.5 40)" />
        <rect x="74" y="27" width="8" height="17" rx="4" fill="#ffffff" transform="rotate(-20 78 35.5)" />
      </svg>
    </span>
  );
}
