"use client";

import InlineSteps from '@/components/ui/InlineSteps';
import { Envelope, MoraFace, SimRow } from './HiddenWordParts';

const noop = () => {};

const TEXT = {
  ko: [
    ['봉투 고르기', '봉투 6개 중 하나를 고르면 명사 5개를 받아요. 라운드마다 그중 하나가 내 히든 워드가 됩니다.'],
    ['수비: 힌트 내기', '히든 워드와 관련된 단어를 힌트로 내요. 힌트마다 유사도가 공개되고, 95% 이상이 나오면 힌트가 끝나요. 너무 가까운 힌트는 모라에게 답을 알려 주는 셈이에요.'],
    ['공격: 모라의 단어 맞히기', '모라의 힌트와 유사도를 보고 히든 워드를 맞혀요. 단어마다 한 번, 피스 1개를 쓰면 답을 2개 낼 수 있어요. 오답은 그 단어의 유사도가 공개돼요.'],
    ['승점과 랭킹', '공격은 1차 6점 · 2차 3점 · 3차 1점, 수비는 모라가 틀릴 때마다 +1 · +2 · +3. 2라운드는 모든 승점이 2배이고, 합계로 랭킹을 겨뤄요.'],
  ],
  en: [
    ['Pick an envelope', 'Choose one of six envelopes to get five Korean nouns. Each round one of them is your hidden word.'],
    ['Defense: give hints', 'Give words related to your hidden word. Each hint shows its similarity, and one at 95% or more ends the hints. A hint that is too close all but hands MORA the answer.'],
    ['Attack: find MORA’s word', 'Read MORA’s hints and their similarity, then guess its hidden word. Once per word you can spend 1 piece to give two answers. A wrong answer shows its similarity.'],
    ['Points and ranking', 'Attack scores 6, 3 or 1 by stage; defense scores +1, +2, +3 each time MORA misses. Round 2 doubles every point, and your total makes the ranking.'],
  ],
} as const;

/** 히든 워드 확장판: the same match; what changes is the words and how MORA hints. */
const PLUS_TEXT = {
  ko: [
    ['186단어, 닮은 단어 30묶음', '봉투 6개 중 하나를 고르면 명사 5개를 받아요. 확장판 단어는 감정·직업·장소·음식·문화·과학·계절처럼 서로 닮은 단어끼리 묶여 있고, 한 봉투에는 한 묶음에서 하나씩만 들어 있어요.'],
    ['수비: 묶음을 숨기는 힌트', '힌트마다 유사도가 공개되고 95% 이상이면 끝나요. 묶음 전체에 맞는 95% 힌트(감정, 직업)는 오히려 무리를 넓게 열어 줘요. 내 단어만의 뜻으로 넘기면 모라가 묶음 안에서 헤매요.'],
    ['공격: 덜 직접적인 모라의 힌트', '확장판의 모라는 차마다 데우기 힌트를 하나만 내고, 2·3차에도 묶음 전체에 들어맞는 쪽의 힌트로 마무리해요. 오답의 숫자로 묶음 안의 후보를 갈라 보세요. 단어마다 한 번, 피스 1개로 답을 2개 낼 수 있어요.'],
    ['승점과 확장판 랭킹', '점수는 기본과 같아요: 공격 6 · 3 · 1점, 수비 +1 · +2 · +3, 2라운드 2배. 랭킹은 기본 히든 워드와 따로이고, 1위는 확장판 아이콘을 가져가요.'],
  ],
  en: [
    ['186 words, 30 look-alike groups', 'Choose one of six envelopes for five Korean nouns. Expansion words come in groups of look-alikes (feelings, jobs, places, food, culture, science, seasons), at most one per group in an envelope.'],
    ['Defense: hide the group', 'Each hint shows its similarity and one at 95% ends the hints. A 95% hint that fits the whole group (feeling, job) opens it wide; one that only your word has keeps MORA lost inside the group.'],
    ['Attack: MORA hints less directly', 'In the Expansion MORA gives one warm-up per stage and closes even stages 2 and 3 with a hint that suits the whole group. Use the numbers on wrong answers to split the group. Once per word, 1 piece buys two answers.'],
    ['Points and the Expansion ranking', 'Points are as in Hidden Word: 6, 3, 1 for guessing, +1, +2, +3 for holding, round 2 doubled. The ranking is separate from the original, and #1 holds the Expansion icon.'],
  ],
} as const;

/** The entry screen's four tutorial cards: the envelopes, hints, guessing, scoring. */
export function HiddenWordTutorialSteps({ locale, level = 'basic' }: { locale: string; level?: 'basic' | 'plus' }) {
  const en = locale === 'en';
  const steps = (level === 'plus' ? PLUS_TEXT : TEXT)[en ? 'en' : 'ko'];
  const plus = level === 'plus';
  const visuals = [
    <div key="env" className="pointer-events-none flex gap-2">{[1, 2, 3].map((n) => <div key={n} className="w-16"><Envelope n={n} plus={plus} label={`${n}`} onPick={noop} state={n === 2 ? 'idle' : 'dim'} /></div>)}</div>,
    <ul key="hint" className="w-[230px] space-y-1.5">{plus ? <><SimRow word="편지" score={93} cut={95} /><SimRow word="첫사랑" score={95} cut={95} /></> : <><SimRow word="여름" score={88} cut={95} /><SimRow word="과일" score={96.5} cut={95} /></>}</ul>,
    <div key="guess" className="flex w-[240px] items-center gap-2"><MoraFace size={36} thinking /><ul className="flex-1 space-y-1.5">{plus ? <><SimRow word="외로움" score={93} cut={95} tone="wrong" /><SimRow word="그리움" score={100} cut={95} tone="right" /></> : <><SimRow word="사과" score={72.4} cut={95} tone="wrong" /><SimRow word="수박" score={100} cut={95} tone="right" /></>}</ul></div>,
    <div key="score" className="flex items-end gap-2 font-mono font-black">{[['1', 6], ['2', 3], ['3', 1]].map(([stage, pts]) => <div key={stage} className="flex flex-col items-center gap-1"><span className="rounded-md bg-(--accent) px-2.5 py-1 text-lg text-(--accent-ink)">{pts}</span><span className="text-[10px] text-white/45">{en ? `STAGE ${stage}` : `${stage}차`}</span></div>)}<span className="ml-2 rounded-md border border-white/15 px-2 py-1 text-xs text-white/70">R2 ×2</span></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
