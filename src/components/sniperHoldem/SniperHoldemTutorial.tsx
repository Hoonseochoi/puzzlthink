"use client";

import InlineSteps from '@/components/ui/InlineSteps';
import { Scope, ShCard, ShChip } from './SniperHoldemParts';

const TEXT = {
  ko: [
    ['개인 카드 2장, 공유 카드 4장', '1~10 숫자 카드 4세트(문양 없음). 기본 베팅(처음 4라운드 1칩, 그 뒤 2라운드마다 올라요)을 내고 나만 보는 개인 카드 2장을 받아요. 공유 카드는 2장 먼저, 1차 베팅 뒤 2장 더 공개돼요.'],
    ['체크 없는 두 번의 베팅', '선부터 최소 1칩을 걸거나 포기해요. 콜·레이즈로 모두 같은 칩을 내면 끝. 한 라운드에 거는 칩은 가장 적게 가진 사람의 칩까지예요.'],
    ['저격: 숫자 + 족보', '개인 카드를 공개하기 전, 선부터 족보 하나를 저격할 수 있어요. 4-5-6-7-8이면 "8 스트레이트", 풀하우스는 트리플 숫자로. 맞히면 그 족보는 꼴찌가 돼요.'],
    ['75칩이면 생존', '저격당하지 않은 가장 높은 족보가 팟을 가져가요. 75칩을 모은 사람은 칩을 내고 생존 확정, 끝까지 남은 1명이 탈락해요.'],
  ],
  en: [
    ['Two private cards, four shared', 'Four sets of 1–10, no suits. Pay the ante (1 for the first 4 rounds, then rising every 2) and take two private cards only you see. Two shared cards go up first, two more after the first bet.'],
    ['Two bets, no checking', 'From the first player: bet at least 1 or fold, then call or raise until everyone has put in the same. Nobody puts in more than the smallest stack in a round.'],
    ['Snipe: number + hand', 'Before private cards are shown, each player in turn may snipe one hand. 4-5-6-7-8 is "8 straight"; a full house goes by its triple. Hit it and that hand ranks last.'],
    ['Safe at 75', 'The best unsniped hand takes the pot. Whoever reaches 75 chips pays them and is safe; the last one left is eliminated.'],
  ],
} as const;

/** The entry screen's four tutorial cards. */
export function SniperHoldemTutorialSteps({ locale }: { locale: string }) {
  const steps = TEXT[locale === 'en' ? 'en' : 'ko'];
  const visuals = [
    <div key="deal" className="flex flex-col items-center gap-2"><div className="flex gap-1">{[9, 6, null, null].map((v, i) => <ShCard key={i} value={v} size="sm" />)}</div><div className="flex gap-1"><ShCard value={8} size="md" /><ShCard value={7} size="md" /></div></div>,
    <div key="bet" className="flex flex-col items-center gap-2"><div className="flex gap-2">{['FOLD', 'CALL 3', 'RAISE 8'].map((label, i) => <span key={label} className={`rounded-md px-2.5 py-1.5 text-[11px] font-black ${i === 2 ? 'bg-(--accent) text-white' : 'border border-white/15 text-white/70'}`}>{label}</span>)}</div><ShChip n={60} className="text-lg text-[#ffd36b]" /></div>,
    <div key="snipe" className="flex items-center gap-2"><div className="flex gap-1">{[4, 5, 6, 7, 8].map((v) => <ShCard key={v} value={v} size="sm" />)}</div><span className="flex items-center gap-1 rounded-md bg-(--accent) px-2 py-1 text-xs font-black text-white"><Scope size={13} />8</span></div>,
    <div key="safe" className="flex flex-col items-center gap-1.5 font-black"><span className="rounded-md bg-[#7ef0b0]/20 px-2 py-0.5 text-sm text-[#7ef0b0]">75 · SAFE</span><span className="rounded-md border border-white/15 px-2 py-0.5 text-xs text-white/60 line-through">9 스트레이트</span><span className="rounded-md bg-[#ffd36b]/15 px-2 py-0.5 text-xs text-[#ffd36b]">9 원페어 WIN</span></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
