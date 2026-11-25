"use client";

import { markGuess } from '@/lib/equationSignal';
import InlineSteps from '@/components/ui/InlineSteps';
import { SignalLegend, SignalRow } from './SignalParts';
import { eqsCopy } from './copy';

const ANSWER = '6*7-12=30';
const row = (text: string) => <SignalRow text={text} marks={markGuess(ANSWER, text).join('')} small />;

const TEXT = {
  ko: [
    ['숨은 수식 9칸', '숫자 0~9와 + − × ÷ = ^(제곱)으로 이루어진, 계산이 맞는 9칸짜리 등식을 찾아요. 0으로 시작하는 수(07)는 정답에 없어요.'],
    ['아무 9칸이나 제출', '제출하는 줄은 계산이 안 맞아도, 기호가 붙어 있어도 괜찮아요. 처음엔 서로 다른 숫자와 기호를 많이 넣어 정보를 모으세요.'],
    ['신호 읽기', '초록은 그 자리에 그 글자, 노랑은 수식에 있지만 다른 자리, 빨강은 수식에 없거나 실제 개수보다 많이 쓴 글자예요.'],
    ['계산 순서로 좁히기', '제곱 → 곱셈·나눗셈 → 덧셈·뺄셈 순서로 계산해요. = 위치와 양쪽 크기를 맞춰 보며 후보를 줄이면 적은 횟수로 맞힐 수 있어요.'],
  ],
  en: [
    ['A hidden nine-cell equation', 'Find a true equation nine cells long, made of digits 0–9 and + − × ÷ = ^ (power). No number in the answer starts with 0 (like 07).'],
    ['Guess any nine cells', 'A guess does not have to be true or even well formed. Early on, use many different digits and signs to learn the most.'],
    ['Read the signals', 'Green: right symbol, right place. Yellow: in the equation, somewhere else. Red: not in it, or more copies than it has.'],
    ['Narrow it with the math', 'Powers first, then × ÷, then + −. Place the = and balance both sides to cut the candidates and solve in fewer guesses.'],
  ],
} as const;

/** The entry screen's four tutorial cards: the answer, a guess, the colors, solving. */
export function SignalTutorialSteps({ locale }: { locale: string }) {
  const c = eqsCopy(locale);
  const steps = TEXT[locale === 'en' ? 'en' : 'ko'];
  const visuals = [
    <div key="hidden" className="w-[230px]"><SignalRow text="?????????" small /></div>,
    <div key="guess" className="w-[230px]">{row('1+2*3^4=5')}</div>,
    <div key="read" className="flex w-[230px] flex-col gap-2">{row('30-6*2=18')}<SignalLegend g={c.legendG} y={c.legendY} r={c.legendR} /></div>,
    <div key="solve" className="flex w-[230px] flex-col gap-1.5">{row('30-6*2=18')}{row(ANSWER)}</div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
