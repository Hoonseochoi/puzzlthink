"use client";

import StoneAvatar from '@/components/StoneAvatar';
import { BlockFace } from './M2Parts';

/** The block a run on the 2048 board is stored with: the board's `sub` holds minus the run's biggest block. */
export const blockOfSub = (sub: number | null | undefined) => (typeof sub === 'number' && sub < 0 ? -sub : null);

/** A 2048 ranking picture: the player's final block character (falls back to their stone when unknown). */
export default function RankBlock({ block, name, size }: { block: number | null; name: string; size: number }) {
  if (!block) return <StoneAvatar name={name} size={size} />;
  return (
    <span className="inline-block shrink-0" style={{ width: size, height: size }} title={String(block)}>
      <BlockFace v={block} />
    </span>
  );
}
