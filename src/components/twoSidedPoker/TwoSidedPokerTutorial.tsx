"use client";

import InlineSteps from '@/components/ui/InlineSteps';
import { tspCopy } from './copy';
import { FaceTile, PokerChip, TwoFaceCard } from './TwoSidedPokerParts';

/** The entry screen's four tutorial cards: a card, a bet, the showdown, the 양면베팅 bonus. */
export function TwoSidedPokerTutorialSteps({ locale }: { locale: string }) {
  const t = tspCopy(locale);
  const visuals = [
    <TwoFaceCard key="card" card={{ front: 7, back: 4 }} showBack size="md" />,
    <div key="bet" className="flex flex-col items-center gap-3"><div className="flex gap-2"><FaceTile kind="front" value={7} size="sm" /><FaceTile kind="back" value={4} size="sm" active /></div><div className="flex gap-1.5">{[1, 2, 5].map((n) => <PokerChip key={n} tone="me" size={34} label={`+${n}`} />)}</div></div>,
    <div key="call" className="flex items-center gap-3"><FaceTile kind="back" value={9} size="md" active /><span className="font-mono text-lg font-black text-white/35">vs</span><FaceTile kind="front" value={6} size="md" /></div>,
    <div key="both" className="flex flex-col items-center gap-2"><TwoFaceCard card={{ front: 9, back: 8 }} showBack chosen="both" size="md" /><span className="rounded-md bg-(--accent) px-2 py-0.5 text-xs font-black text-(--accent-ink)">+10</span></div>,
  ];
  return <InlineSteps steps={t.tutorial.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
