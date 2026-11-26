// The "상대 성향 읽는 법" section the five betting games share in their guides: the cast from src/lib/aiPersona.ts
// with each game's own tells (BW_TELLS, POKER_TELLS, …), plus a few game-specific lines before the table.
import { type PersonaId, PERSONAS, PERSONA_IDS } from '@/lib/aiPersona';
import type { GuideLocale, GuideSection } from './types';

export function personaSection(locale: GuideLocale, tells: Record<PersonaId, { ko: string; en: string }>, intro: string[], extra: string[] = []): GuideSection {
  const ko = locale === 'ko';
  return {
    id: 'personas',
    title: ko ? '상대 성향 읽는 법 — AI 열 명의 스타일' : 'Reading the AI personalities',
    level: 'intermediate',
    lead: ko
      ? 'AI전마다 열 가지 성향 중 하나가 무작위로 나와요. 모두 같은 계산(정확한 확률과 카운팅)으로 판단하고, 비슷하게 좋은 수 사이에서 고르는 방식만 달라요.'
      : 'Every AI match draws one of ten personalities. All of them judge with the same calculation (exact odds and counting); they only differ in how they choose between moves that are about equally good.',
    blocks: [
      ...intro.map((text) => ({ type: 'p' as const, text })),
      {
        type: 'table',
        head: ko ? ['이름', '성향', '읽는 법'] : ['Name', 'Style', 'Tell'],
        rows: PERSONA_IDS.map((id) => [ko ? PERSONAS[id].name : PERSONAS[id].nameEn, ko ? PERSONAS[id].style.ko : PERSONAS[id].style.en, ko ? tells[id].ko : tells[id].en]),
      },
      {
        type: 'callout', tone: 'tip',
        title: ko ? '성향은 경향일 뿐이에요' : 'A style is a tendency, not a rule',
        text: ko
          ? '어떤 성향이든 가끔은 일부러 스타일을 벗어나요. 그리고 AI도 **이번 판에 내가 보여 준 것**(색, 승패, 베팅 크기, 공개된 카드)만으로 내 버릇을 읽어요. 같은 방식만 반복하면 그 방식이 공략당해요. 어떤 성향이었는지는 게임이 끝나면 결과 화면에 공개돼요.'
          : 'Every personality breaks its own pattern now and then. The AI also reads **what you have shown this match** (colours, results, bet sizes, revealed cards) and nothing else; repeat one approach and it gets punished. The personality is revealed on the result screen.',
      },
      ...extra.map((text) => ({ type: 'p' as const, text })),
    ],
  };
}
