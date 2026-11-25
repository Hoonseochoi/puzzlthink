"use client";

import { layoutById } from '@/lib/colorLinkDuelBoards';
import InlineSteps from '@/components/ui/InlineSteps';
import CldPreview from './CldPreview';
import { LayoutThumb, TierBadge } from './CldBoardPicker';
import { StoneIcon } from './CldTable';
import { cldColor, cldCopy } from './copy';

const TEXT = {
  ko: [
    ['판 고르기', '7×7 클래식과 하트·도넛·네 방 같은 모양 판까지 13가지. 판마다 쉬움·보통·어려움 난이도가 있고, 직접 고르거나 랜덤으로 정해요. AI 성능은 같고 판이 난이도를 정해요.'],
    ['서로 다른 색 2개씩', 'A~N 14가지 색 말(색마다 2개)을 번갈아 놓아요. 라운드를 여는 선공은 1개, 그다음부터는 차례마다 1분 안에 서로 다른 색 2개. 시간을 넘기면 패배예요.'],
    ['언제나 이을 수 있게', '같은 색끼리 선으로 이을 때 선이 겹치거나 교차하면 안 되고, 선 하나는 말 포함 6칸 이상이어야 해요. 하나만 놓인 색도 나중의 짝과 이어질 수 있어야 합니다.'],
    ['불가능 선언!', '상대가 놓은 판이 이어질 수 없어 보이면 내 차례에 불가능 선언. 상대가 2분 안에 선을 모두 그려 증명하면 상대 승, 못 하면 내 승. 단판 승부예요.'],
  ],
  en: [
    ['Pick a board', 'Thirteen boards, from the classic 7×7 to shapes like the heart, the donut and four rooms. Each is rated Easy, Normal or Hard; pick one or go random. The AI stays the same; the board sets the difficulty.'],
    ['Two different colors', 'Take turns placing stones of 14 colors (A–N, two each). The opener places one; after that each turn is two stones of different colors within a minute. Miss the clock and you lose.'],
    ['Always joinable', 'If every same-colored pair were joined, no lines may cross or share a cell, and each line is at least 6 cells, stones included. A lone stone must still be joinable to its partner later.'],
    ['Call it impossible!', 'Think the board your opponent made cannot be joined? Call it on your turn. They have 2 minutes to draw every line: prove it and they win, fail and you do. One round decides it.'],
  ],
} as const;

/** The entry screen's four tutorial cards: the boards, a turn, the joining rule, the call. */
export function CldTutorialSteps({ locale }: { locale: string }) {
  const en = locale === 'en';
  const t = cldCopy(locale);
  const steps = TEXT[en ? 'en' : 'ko'];
  const visuals = [
    <div key="boards" className="flex gap-3">{['four_rooms', 'stairs', 'heart'].map((id) => { const l = layoutById(id); return <div key={id} className="flex w-[70px] flex-col items-center gap-1.5"><LayoutThumb layout={l} /><span className="flex items-center gap-1 text-[10px] font-black text-white/70">{en ? l.en : l.ko}<TierBadge tier={l.tier} t={t} /></span></div>; })}</div>,
    <div key="turn" className="flex items-center gap-2"><StoneIcon k={3} size={46} /><span className="text-xl font-black text-white/40">+</span><StoneIcon k={9} size={46} /><span className="ml-2 rounded-md border border-white/15 px-2 py-1 font-mono text-xs font-black text-white/70">60s</span></div>,
    <div key="join" className="w-[132px]"><CldPreview /></div>,
    <div key="call" className="flex flex-col items-center gap-2"><span className="rounded-lg px-4 py-2 text-sm font-black tracking-[0.14em] text-white shadow-[0_0_24px_rgba(255,77,109,.5)]" style={{ background: '#ff4d6d' }}>{en ? 'IMPOSSIBLE!' : '불가능 선언!'}</span><span className="flex items-center gap-1.5 font-mono text-[11px] font-black" style={{ color: cldColor(1).fill }}>{en ? 'PROVE IT IN 2:00' : '2:00 안에 증명'}</span></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
