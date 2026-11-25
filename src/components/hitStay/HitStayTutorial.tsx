"use client";

import InlineSteps from '@/components/ui/InlineSteps';
import { HsCard, HsChip, HsDie } from './HitStayParts';

const TEXT = {
  ko: [
    ['한계 숫자와 카드 3장', '8면체 주사위(5~12)가 이번 라운드 한계 숫자를 정해요. 카드 3장을 받고 그중 1장을 골라 모두에게 공개합니다. 나머지 2장은 승부 때까지 나만 봐요.'],
    ['1차 베팅', '선부터 차례로 체크·콜·레이즈·포기. 한 라운드에 걸 수 있는 칩은 가장 적게 가진 사람의 칩까지라, 칩이 많아도 혼자 밀어붙일 수는 없어요.'],
    ['HIT 또는 STAY', 'HIT은 카드 1장을 더 받기(모두에게 공개), STAY는 여기서 멈추기. -1 카드는 합을 줄여 줘요. 모두 정하면 2차 베팅을 한 번 더 합니다.'],
    ['한계에 가장 가깝게', '한계 숫자에 가장 가까운 합이 판돈을 가져가요. 같으면 카드가 많은 쪽, 한계를 넘으면 최하위. 칩이 0이 되면 탈락하고, 마지막까지 남은 1명이 1위예요.'],
  ],
  en: [
    ['A limit and three cards', 'An eight-sided die (5–12) sets this round’s limit. You get three cards and show one of them to everyone. The other two stay hidden until the showdown.'],
    ['First bet', 'In turn from the lead: check, call, raise or fold. No one can bet more than the smallest stack at the table, so a big stack cannot simply push everyone out.'],
    ['HIT or STAY', 'HIT takes one more card (face up), STAY stops. The -1 cards bring your total down. When everyone has chosen, there is a second round of betting.'],
    ['Closest to the limit', 'The total closest to the limit takes the pot. A tie goes to more cards; over the limit is last. At 0 chips you are out, and the last one standing wins.'],
  ],
} as const;

/** The entry screen's four tutorial cards: the die and the deal, betting, HIT/STAY, the showdown. */
export function HitStayTutorialSteps({ locale }: { locale: string }) {
  const steps = TEXT[locale === 'en' ? 'en' : 'ko'];
  const visuals = [
    <div key="deal" className="flex items-center gap-4"><HsDie value={9} rollKey={0} size={58} still /><div className="flex gap-1.5"><HsCard value={4} size="md" lifted tag="OPEN" /><HsCard value={null} size="md" /><HsCard value={null} size="md" /></div></div>,
    <div key="bet" className="flex flex-col items-center gap-2"><div className="flex gap-2">{['CALL 2', 'RAISE 5', 'FOLD'].map((label, i) => <span key={label} className={`rounded-md px-2.5 py-1.5 text-[11px] font-black ${i === 1 ? 'bg-(--accent) text-(--accent-ink)' : 'border border-white/15 text-white/70'}`}>{label}</span>)}</div><HsChip n={30} className="text-lg text-[#ffd36b]" /></div>,
    <div key="hit" className="flex items-center gap-3"><div className="flex gap-1.5"><HsCard value={4} size="md" /><HsCard value={3} size="md" /></div><span className="rounded-md bg-[#ff4d6d] px-2 py-1 text-xs font-black text-white">HIT</span><HsCard value={-1} size="md" lifted /></div>,
    <div key="show" className="flex items-center gap-3"><HsDie value={9} rollKey={0} size={44} still /><div className="flex flex-col gap-1.5 font-mono text-sm font-black"><span className="rounded-md bg-(--accent) px-2 py-0.5 text-(--accent-ink)">9 · WIN</span><span className="rounded-md border border-white/15 px-2 py-0.5 text-white/60">8</span><span className="rounded-md border border-[#ff4d6d]/50 px-2 py-0.5 text-[#ff4d6d] line-through">11</span></div></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
