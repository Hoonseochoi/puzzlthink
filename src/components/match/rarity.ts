import { parseIcon } from '../ProfileIcons';

/**
 * How rare a profile icon is, for the match pieces (VS intro, plates, winner): rare icons get a frame, a glow and
 * a short line ("히든 미션 달성자"), so an opponent's icon reads as "this one knows how to play".
 * - mythic: HIDDEN MISSION (hm-*)
 * - legend: a game's #1 crown, a 피스 / 블랙피스 / 오픈 대전 podium place
 * - epic:   2048 tiles from 8192, PLAY TESTER founder
 * - rare:   어려움 / 매우 어려움 clears, the other 2048 tiles and tester icons
 * - null:   colours and the common badges (friend/open win, play time)
 */
export type Rarity = 'mythic' | 'legend' | 'epic' | 'rare';

export function rarityOf(stone: string | null | undefined): Rarity | null {
  const ref = parseIcon(stone);
  if (!ref) return null;
  switch (ref.kind) {
    case 'mission': return 'mythic';
    case 'crown': case 'piece': case 'hell': case 'open': return 'legend';
    case 'm2048': return ref.tier >= 8192 ? 'epic' : 'rare';
    case 'tester': return ref.tier === 'founder' ? 'epic' : 'rare';
    case 'hard': case 'hellClear': case 'liar': return 'rare';
    default: return null;
  }
}

/** The message key (namespace Match) of the short line under a rare icon, or null. */
export function rareLineKey(stone: string | null | undefined): string | null {
  const ref = parseIcon(stone);
  if (!ref) return null;
  switch (ref.kind) {
    case 'mission': return `line_mission_${ref.mission}`;
    case 'crown': return 'line_crown';
    case 'piece': return 'line_piece';
    case 'hell': return 'line_hell';
    case 'open': return 'line_open';
    case 'hard': return 'line_hard';
    case 'hellClear': return 'line_hellClear';
    case 'liar': return 'line_liar';
    case 'm2048': return ref.tier >= 8192 ? 'line_m2048' : null;
    case 'tester': return ref.tier === 'founder' ? 'line_founder' : null;
    default: return null;
  }
}

/** Colours for each rarity: the rim (a conic sweep), the glow and the chip. */
export const RARITY_LOOK: Record<Rarity, { rim: string; glow: string; chip: string; ink: string }> = {
  mythic: { rim: 'conic-gradient(#ff9ad5, #ffe680, #8ff5d2, #8ec5ff, #c9a2ff, #ff9ad5)', glow: 'rgba(201,162,255,.6)', chip: 'linear-gradient(90deg,#ff9ad5,#ffe680,#8ff5d2,#8ec5ff)', ink: '#1a1030' },
  legend: { rim: 'conic-gradient(#fff3b8, #f2c53d, #a8740c, #f2c53d, #fff3b8)', glow: 'rgba(255,211,110,.55)', chip: 'linear-gradient(90deg,#fff3b8,#f2c53d)', ink: '#2a2118' },
  epic: { rim: 'conic-gradient(#e6d6ff, #8b5cf6, #3f1c8c, #8b5cf6, #e6d6ff)', glow: 'rgba(139,92,246,.5)', chip: 'linear-gradient(90deg,#c9b0ff,#8b5cf6)', ink: '#ffffff' },
  rare: { rim: 'conic-gradient(#c9fff6, #21c2b5, #0d7d74, #21c2b5, #c9fff6)', glow: 'rgba(33,194,181,.45)', chip: 'linear-gradient(90deg,#9cf2ea,#21c2b5)', ink: '#06302c' },
};
