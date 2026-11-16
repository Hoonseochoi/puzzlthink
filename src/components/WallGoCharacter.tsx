"use client";

import type { PlayerId } from '@/lib/wallgo';
import { PLAYER_COLORS as colors } from './wallgoTheme';

export default function WallGoCharacter({ player, selected = false, label, className = '' }: { player: PlayerId; selected?: boolean; label?: string; className?: string }) {
  const shapes = [
    'rounded-[48%_52%_46%_54%/52%_44%_56%_48%]',
    'rounded-[32%] rotate-3',
    '[clip-path:polygon(25%_4%,75%_4%,100%_50%,75%_96%,25%_96%,0_50%)]',
  ];
  return (
    <span aria-label={label} className={`relative flex aspect-square items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,.55)] ring-[2px] ring-[#0b0b0e] transition ${shapes[player]} ${selected ? 'scale-110 ring-[3px] ring-[#f1f4fa] shadow-[0_0_18px_rgba(241,244,250,.55)]' : ''} ${className}`} style={{ background: colors[player] }}>
      <span className="absolute left-[25%] top-[28%] h-[25%] w-[20%] rounded-full bg-white"><i className="absolute bottom-[12%] right-[12%] h-[45%] w-[45%] rounded-full bg-[#0b0b0e]" /></span>
      <span className="absolute right-[25%] top-[28%] h-[25%] w-[20%] rounded-full bg-white"><i className="absolute bottom-[12%] left-[12%] h-[45%] w-[45%] rounded-full bg-[#0b0b0e]" /></span>
      <span className="absolute bottom-[22%] h-[10%] w-[28%] rounded-b-full border-b-2 border-white/90" />
      {player === 0 && <><i className="absolute -left-[5%] top-[42%] h-[13%] w-[16%] -rotate-[24deg] rounded-full bg-[#e0283a]" /><i className="absolute -right-[5%] top-[42%] h-[13%] w-[16%] rotate-[24deg] rounded-full bg-[#e0283a]" /></>}
    </span>
  );
}
