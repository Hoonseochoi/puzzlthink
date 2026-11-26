"use client";

import type { Block } from '@/lib/equationTower';
import InlineSteps from '@/components/ui/InlineSteps';
import { BlockChip, TargetCard } from './TowerParts';
import { eqtCopy } from './copy';

const PLAIN: Block[] = [{ n: 5, op: '' }, { n: 8, op: '' }, { n: 6, op: '' }];
const SIGNED: Block[] = [{ n: 2, op: '*' }, { n: 3, op: '+' }, { n: 4, op: '-' }, { n: 2, op: '/' }, { n: 7, op: '+' }, { n: 1, op: '-' }];
const TOWER: Block[] = [{ n: 5, op: '' }, { n: 2, op: '*' }, { n: 3, op: '+' }];

const Column = ({ blocks, win = false }: { blocks: Block[]; win?: boolean }) => (
  <div className={`flex w-12 flex-col gap-1 rounded-lg p-1 ${win ? 'bg-[#2fbf71]/20 ring-1 ring-[#7ee2ae]' : 'bg-white/[0.04]'}`}>{blocks.map((b, i) => <BlockChip key={i} block={b} small />)}</div>
);

const TEXT = {
  ko: [
    ['블록 9개', '블록에는 소수 2·3·5·7만 적혀 있어요. 숫자만 있는 블록 3개와 기호(+ − × ÷)가 붙은 블록 6개가 4자리에 나뉘어 쌓여 있어요.'],
    ['한 번의 이동', '한 자리의 위에서부터 원하는 개수를 들어 다른 자리에 놓아요. 묶음을 위아래로 뒤집어 놓을 수 있고, 제자리에서 뒤집기만 해도 1회예요.'],
    ['위에서 아래로 읽기', '탑의 맨 위는 기호 없는 숫자, 그 아래는 모두 기호 블록. 위에서 아래로 읽고 ×·÷를 먼저 계산해요: 5, +3, ×2 → 5+3×2 = 11.'],
    ['타깃 넘버 완성', '목표 층수(3~5층)와 정확히 같은 높이로 타깃 넘버를 만들면 라운드 완성. 탑 상태는 다음 라운드로 이어지니, 다음 판에 쓸 블록도 생각해 두세요.'],
  ],
  en: [
    ['Nine blocks', 'Every block carries a prime: 2, 3, 5 or 7. Three plain number blocks and six with a sign (+ − × ÷), stacked across four spots.'],
    ['One move', 'Lift any number of blocks off the top of a stack and set them on another. You may turn the bundle upside down; flipping in place is a move too.'],
    ['Read top down', 'A tower has a plain number on top and signed blocks under it, read from the top with × and ÷ first: 5, +3, ×2 → 5+3×2 = 11.'],
    ['Hit the target', 'Build a tower of exactly the asked height worth the target to finish the round. The stacks carry over, so keep the next round in mind.'],
  ],
} as const;

/** The entry screen's four tutorial cards: the blocks, a move, reading a tower, the target. */
export function TowerTutorialSteps({ locale }: { locale: string }) {
  const c = eqtCopy(locale);
  const steps = TEXT[locale === 'en' ? 'en' : 'ko'];
  const visuals = [
    <div key="blocks" className="grid w-[220px] grid-cols-3 gap-1.5">{[...PLAIN, ...SIGNED].map((b, i) => <BlockChip key={i} block={b} small />)}</div>,
    <div key="move" className="flex items-end gap-2"><Column blocks={[PLAIN[0]]} /><span className="pb-2 text-lg font-black text-(--accent)">→</span><Column blocks={[SIGNED[0], SIGNED[1]]} /><span className="pb-2 text-lg font-black text-white/40">=</span><Column blocks={TOWER} win /></div>,
    <div key="read" className="flex items-center gap-3"><Column blocks={TOWER} win /><span className="font-mono text-sm font-black text-(--accent)">5×2+3 = 13</span></div>,
    <div key="target" className="flex items-center gap-3"><TargetCard target={13} floors={3} c={c} /><Column blocks={TOWER} win /></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
