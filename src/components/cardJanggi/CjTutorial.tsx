"use client";

import InlineSteps from '@/components/ui/InlineSteps';
import { cjCopy } from './copy';
import { CjCardBack, CjCardFace, CjPiece } from './CjParts';

const TEXT = {
  ko: [
    ['큰 말을 지켜라', '6×5 판에서 큰 말 1개와 작은 말 3개로 겨뤄요. 상대 큰 말을 잡거나, 내 큰 말이 상대 큰 말의 시작 칸에 들어가면 승리. 단판 승부예요.'],
    ['행마 카드 5장', '쥐(상하좌우 1칸) · 말(나이트) · 원숭이(주변 8칸) · 코끼리(대각선 1–2칸) · 기린(상하좌우 2칸 점프). 둘 다 같은 5장을 써요.'],
    ['순서를 몰래 정하기', '라운드 시작에 카드 순서를 뒤집어 정해요. 선공은 5장, 후공은 첫 묶음만 5장 중 4장. 첫 카드는 동시에 공개하고, 선공·후공은 직접 골라요.'],
    ['보이는 카드로 한 수', '번갈아 공개된 카드대로 내 말 하나를 움직이고 다음 카드를 공개해요. 상대의 다음 카드는 늘 보이니, 그 카드가 닿는 칸에서 큰 말을 빼세요.'],
  ],
  en: [
    ['Guard your king', 'On a 6×5 board you each have a king and three small pieces. Take the enemy king, or move your king onto the square it started on, to win. One round decides it.'],
    ['Five movement cards', 'Rat (1 step orthogonally) · Horse (knight) · Monkey (any neighbour) · Elephant (1–2 diagonally) · Giraffe (jump 2 orthogonally). Both sides use the same five.'],
    ['Order them in secret', 'At the start you lay the cards face down in order: five for the first player, four of five for the second (first cycle only). The first cards turn up together. You pick first or second.'],
    ['Play the card you see', 'In turn, move one of your pieces as your face-up card allows, then turn up the next. Your opponent’s next card is always visible: keep your king out of its reach.'],
  ],
} as const;

const BOARD: (number | null)[] = [
  null, -1, -2, -1, null,
  null, null, -1, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, 1, null, null,
  null, 1, 2, 1, null,
];

/** The entry screen's four tutorial cards: the board, the cards, the secret order, a move. */
export function CjTutorialSteps({ locale }: { locale: string }) {
  const t = cjCopy(locale);
  const steps = TEXT[locale === 'en' ? 'en' : 'ko'];
  const visuals = [
    <div key="board" className="grid grid-cols-5 gap-px rounded-[8px] border border-[#6d5bd0]/60 bg-[#8f82e6]/30 p-px">
      {BOARD.map((v, i) => <span key={i} className="flex h-6 w-6 items-center justify-center bg-[#3a3172]">{v !== null && <span className="h-[18px] w-[18px]"><CjPiece seat={v < 0 ? 1 : 0} king={Math.abs(v) === 2} /></span>}</span>)}
    </div>,
    <div key="cards" className="flex flex-wrap justify-center gap-1.5">{[0, 1, 2, 3, 4].map((card) => <CjCardFace key={card} card={card} seat={0} size={46} name={t.cards[card]} />)}</div>,
    <div key="order" className="flex items-end gap-1.5"><CjCardFace card={2} seat={0} size={50} glow /><CjCardBack seat={0} size={44} label="2" /><CjCardBack seat={0} size={44} label="3" /><CjCardBack seat={0} size={44} label="4" /><CjCardBack seat={0} size={44} label="5" /></div>,
    <div key="move" className="flex items-center gap-4"><div className="flex flex-col items-center gap-1"><span className="text-[10px] font-black text-white/45">{locale === 'en' ? 'THEIRS NEXT' : '상대 다음 카드'}</span><CjCardFace card={3} seat={1} size={52} /></div><div className="flex flex-col items-center gap-1"><span className="text-[10px] font-black text-white/45">{locale === 'en' ? 'MINE NOW' : '내 카드'}</span><CjCardFace card={1} seat={0} size={52} glow /></div></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
