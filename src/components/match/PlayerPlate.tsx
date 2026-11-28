"use client";

import type { CSSProperties } from 'react';
import { Bot } from 'lucide-react';
import StoneAvatar, { useStoneChoice } from '../StoneAvatar';
import { RARITY_LOOK, rarityOf } from './rarity';

/**
 * A player's profile icon with, for rare icons, a turning rim and a soft glow behind it (the rim stands
 * still under prefers-reduced-motion). Looks the icon up by nickname, from the list every avatar on the page already shares.
 */
export function RimStone({ name, size, rim = 2 }: { name: string; size: number; rim?: number }) {
  const rarity = rarityOf(useStoneChoice(name));
  if (!rarity) return <StoneAvatar name={name} size={size} />;
  const look = RARITY_LOOK[rarity];
  return (
    <span className="match-rim relative inline-flex shrink-0 items-center justify-center rounded-full" data-rarity={rarity}
      style={{ width: size, height: size, '--rim': look.rim, '--rim-w': `${rim}px`, '--rim-glow': look.glow } as CSSProperties}>
      <StoneAvatar name={name} size={size} />
    </span>
  );
}

/**
 * The plate at the top of a game: icon first (36 px), the nickname beside it. `mine` marks this browser's player.
 * The height matches the old 28 px plate with its padding, so phones keep the same bar height.
 */
export default function PlayerPlate({ name, mine, ai, light, meLabel }: { name: string; mine: boolean; ai?: boolean; light?: boolean; meLabel: string }) {
  return (
    <span className={`flex min-w-0 shrink-0 items-center gap-1.5 rounded-full py-0 pl-0 pr-2.5 ${mine ? (light ? 'bg-[#17201e] ring-1 ring-[#ffd36e]/60' : 'bg-[#ffd36e]/[.12] ring-1 ring-[#ffd36e]/45') : light ? 'bg-black/[.05]' : 'bg-white/[.06]'}`}>
      {ai
        ? <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70"><Bot size={18} /></span>
        : <RimStone name={name} size={36} />}
      <span className={`max-w-[6.5rem] truncate text-[12px] font-black sm:max-w-[10rem] ${mine ? 'text-[#ffe9a8]' : light ? 'text-black/75' : 'text-white/85'}`}>{name}</span>
      {mine && <span className="shrink-0 rounded-full bg-[#ffd36e] px-1.5 text-[9px] font-black leading-[15px] text-[#17201e]">{meLabel}</span>}
    </span>
  );
}
