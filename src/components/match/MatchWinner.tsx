"use client";

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Crown } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useStoneChoice } from '../StoneAvatar';
import { useIconLabel } from '../useIconLabel';
import { getMatch, getMatchResult, getNoMatch, subscribeMatch, type MatchPlayer } from '@/lib/matchStore';
import { RARITY_LOOK, rarityOf, rareLineKey } from './rarity';
import { RimStone } from './PlayerPlate';

/**
 * On a friend / open match's result screen (inside ResultActions): the winner's icon, big. My win shows me; a loss
 * in a two-player match shows the opponent; a draw shows both. A loss with several opponents shows nothing (the
 * shared panel does not know which of them won). AI games and solo games never have a match, so it stays empty.
 */
export default function MatchWinner() {
  const match = useSyncExternalStore(subscribeMatch, getMatch, getNoMatch);
  const result = useSyncExternalStore(subscribeMatch, getMatchResult, getNoMatch);
  const t = useTranslations('Match');
  const { nickname } = useAuth();
  if (!match || !result || result.key !== match.key) return null;
  const players = match.players.map((p) => (p.me && nickname ? { ...p, name: nickname } : p));
  const others = players.filter((p) => !p.me);
  const me = players.find((p) => p.me);
  if (!me) return null;
  const winners = result.result === 'win' ? [me] : result.result === 'draw' ? (others.length === 1 ? [me, others[0]] : []) : others.length === 1 ? others : [];
  if (!winners.length) return null;
  const draw = result.result === 'draw';
  return (
    <div className="hall-pop mt-5 rounded-[16px] border border-white/10 bg-gradient-to-b from-white/[.06] to-transparent px-3 pb-4 pt-3 text-center">
      <p className="inline-flex items-center gap-1 font-mono text-[10px] font-black tracking-[0.3em] text-[#ffd36e]"><Crown size={11} strokeWidth={3} />{draw ? t('drawKicker') : t('winnerKicker')}</p>
      <div className="mt-3 flex items-start justify-center gap-5">
        {winners.map((p) => <Winner key={p.seat} p={p} size={draw ? 76 : 96} />)}
      </div>
    </div>
  );
}

function Winner({ p, size }: { p: MatchPlayer; size: number }) {
  const t = useTranslations('Match');
  const label = useIconLabel();
  const stone = useStoneChoice(p.name);
  const rarity = rarityOf(stone);
  const line = rareLineKey(stone);
  const look = rarity ? RARITY_LOOK[rarity] : null;
  return (
    <div className="flex min-w-0 max-w-[150px] flex-col items-center">
      <div style={{ filter: look ? `drop-shadow(0 0 ${size / 6}px ${look.glow})` : undefined }}><RimStone name={p.name} size={size} rim={3} /></div>
      <p className="mt-2 w-full truncate text-sm font-black text-white">{p.name}{p.me && <span className="ml-1 text-[11px] text-[#ffd36e]">({t('me')})</span>}</p>
      {stone && label(stone) !== stone && <p className="mt-0.5 line-clamp-2 break-keep text-[10.5px] font-bold leading-tight text-white/55">{label(stone)}</p>}
      {line && look && <span className="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: look.chip, color: look.ink }}>{t(line)}</span>}
    </div>
  );
}
