// 결! 합! guide. Rules and numbers follow src/lib/gyulhap.ts (27 cards = 3 shapes × 3 colours × 3 backgrounds, 9 dealt,
// isHap: each attribute all the same or all different, allHaps/remainingHaps, GYUL_ROUNDS 10), src/lib/gyulhapRoom.ts
// (2–4 players, turns rotate after every hap, 결 or pass, 10/15/20-second turns, a timeout passes, hap +1/−1, 결 +3/−1,
// a right 결 deals the next board, ties share the win, no AI seats), src/components/gyulhap/GyulhapGame.tsx (10- and
// 5-minute challenges, practice with "check answers", give-up in challenges; a wrong 결 stays on the same board),
// src/components/gyulhap/GyulhapParts.tsx (circle/triangle/square; blue/red/yellow; white/grey/black backgrounds) and the
// Gyulhap / GyulhapGuide messages.
// The hap-count distribution was computed exactly over all 4,686,825 possible 9-card boards; the example board's haps
// were listed with allHaps().
import type { GameGuide, GuideBlock } from './types';

type Lang = 'ko' | 'en';
const NAMES: Record<Lang, { s: string[]; c: string[]; b: string[]; head: string[] }> = {
  ko: { s: ['원', '세모', '네모'], c: ['파랑', '빨강', '노랑'], b: ['흰', '회색', '검정'], head: ['카드', '도형', '도형색', '배경'] },
  en: { s: ['circle', 'triangle', 'square'], c: ['blue', 'red', 'yellow'], b: ['white', 'grey', 'black'], head: ['Card', 'Shape', 'Colour', 'Background'] },
};
// [shape, colour, background] for cards 1–9.
const BOARD: [number, number, number][] = [[1, 0, 1], [1, 2, 2], [2, 0, 1], [0, 2, 0], [2, 2, 1], [1, 1, 2], [2, 2, 2], [1, 1, 0], [0, 2, 1]];
const cards = (lang: Lang, caption: string): GuideBlock => ({
  type: 'table',
  caption,
  head: NAMES[lang].head,
  rows: BOARD.map(([s, c, b], i) => [String(i + 1), NAMES[lang].s[s], NAMES[lang].c[c], NAMES[lang].b[b]]),
});

const guide: GameGuide = {
  game: 'gyulhap',
  origin: { kind: 'show', show: 'genius1' },
  updated: '2026-11-26',
  related: ['nemoCount', 'equationSignal', 'sudoku', 'merge2048'],
  inlineNamespace: 'GyulhapGuide',
  ko: {
    meta: {
      title: '결합 공략 — 더 지니어스 결! 합!, 합 찾기 순서와 결 선언 타이밍 | PUZZLTHINK',
      description: '더 지니어스 결합(결! 합!)에서 합을 빨리 찾고 결을 정확히 외치는 법. 두 장으로 세 번째 카드를 정하는 법, 한 판에 합이 몇 개 나오는지, 실제 판으로 따라 찾는 예시, 친구전에서 마지막 합과 결의 차례 계산까지 정리했어요.',
      keywords: ['결합 공략', '결합 게임', '결! 합!', '더 지니어스 결합', '결합 규칙', '결합 게임 방법', '합 찾기', '패턴 인식 게임'],
    },
    title: '결합 공략',
    lead: '두 장을 고르면 세 번째는 이미 정해져 있어요.',
    intro: [
      '결합(결! 합!)은 카드 9장 중에서 **합**이 되는 세 장을 찾는 패턴 게임이에요. 카드마다 도형·도형색·배경색 세 가지 속성이 있고, 세 장이 속성마다 **모두 같거나 모두 달라야** 합이에요. 더는 찾을 합이 없다고 생각되면 **결**을 외쳐요. 맞으면 +3점, 아직 합이 남아 있으면 −1점이에요.',
      '이 공략은 "보이는 대로 찾기"에서 "빠짐없이 찾기"로 넘어가는 방법을 다뤄요. 두 장만 보고 세 번째 카드를 바로 떠올리는 법, 한 판에 합이 보통 몇 개인지, 실제 판에서 합을 모두 찾는 순서, 그리고 친구전에서 마지막 합과 결의 차례를 계산하는 법까지 정리했어요.',
    ],
    gamePageTitle: '결합 — 세 속성을 동시에 보는 법',
    summary: '세 번째 카드 떠올리기, 한 판의 합 개수, 빠짐없이 찾는 순서, 결 타이밍.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '결합은 「더 지니어스: 게임의 법칙」에 나온 게임이에요. 카드 속성을 동시에 비교하는 패턴 인식 게임이라 처음엔 눈이 바쁘지만, 원리를 알면 찾는 속도가 확 빨라져요. 점수는 합 하나(+1)보다 결 한 번(+3)이 커서, 언제 결을 외칠지가 승부를 가르는 경우가 많아요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 10분·5분 챌린지와 시간 제한 없는 연습으로 혼자 즐기거나, 친구 방에서 2~4명이 차례로 겨룰 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**카드**: 도형(원·세모·네모) × 도형색(파랑·빨강·노랑) × 배경색(흰·회색·검정)의 모든 조합, 27장이에요. 같은 카드는 없어요.',
            '**판**: 27장 중 9장이 무작위로 공개돼요.',
            '**합**: 세 장이 도형·도형색·배경색 **각각에서** 모두 같거나 모두 달라야 해요. 한 속성이라도 "같은 값 둘 + 다른 값 하나"면 합이 아니에요.',
            '**점수**: 맞는 합 +1, 틀린 합 −1. 이미 맞힌 세 장을 다시 고르면 틀린 합이에요.',
            '**결**: 아직 찾지 않은 합이 하나도 없을 때 외치면 +3점이고 새 판으로 넘어가요. 합이 남아 있으면 −1점이에요.',
            '**카드는 그대로**: 맞힌 합의 카드도 판에 남아 다른 합에 다시 쓰일 수 있어요. 조합만 "찾음"으로 기록돼요.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리기 쉬운 장면',
        blocks: [
          { type: 'cards', items: [
            { title: '두 개만 같으면 탈락', body: '빨강·빨강·파랑처럼 한 속성에서 2:1로 갈리면, 다른 두 속성이 완벽해도 합이 아니에요.' },
            { title: '세 속성 모두 같을 수는 없어요', body: '같은 카드가 없어서, 세 장이 세 속성 모두 같을 수는 없어요. 적어도 한 속성은 모두 달라야 해요.' },
            { title: '한 카드가 여러 합에', body: '카드는 사라지지 않아서 한 카드가 두세 개의 합에 들어가기도 해요. 같은 카드가 들어 있다고 이미 찾은 합으로 착각하지 마세요.' },
            { title: '틀린 결 뒤에는', body: '혼자 하기에서 틀린 결은 −1점만 받고 같은 판에 그대로 남아요. 친구전에서는 −1점과 함께 차례가 다음 사람에게 넘어가요.' },
            { title: '합이 0개인 판', body: '아주 드물게(약 2,200판에 1판) 처음부터 합이 없는 판이 나와요. 그때는 바로 결을 외치면 +3점이에요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 두 장을 고르면 세 번째는 하나',
        blocks: [
          { type: 'p', text: '아무 카드 두 장을 고르면, 그 둘과 합이 되는 세 번째 카드는 **정확히 한 장**으로 정해져요. 속성마다 생각하면 돼요.' },
          { type: 'list', items: [
            '**두 장이 같은 값이면** 세 번째도 같은 값이어야 해요. (빨강·빨강 → 빨강)',
            '**두 장이 다른 값이면** 세 번째는 남은 하나의 값이어야 해요. (빨강·파랑 → 노랑)',
          ] },
          { type: 'p', text: '그래서 세 장을 한꺼번에 비교하지 말고, 두 장을 고른 뒤 "세 번째는 이런 카드"를 머릿속에 그리고 판에서 그 카드를 찾으세요. 있으면 합, 없으면 다음 쌍으로 넘어가요. 27장이 모든 조합을 한 장씩 갖고 있어서, 그 카드는 판에 있거나 없거나 둘 중 하나예요.' },
          { type: 'callout', tone: 'tip', title: '결은 서두르지 마세요', text: '9장짜리 판에는 합이 평균 3.4개 있어요. 하나도 없는 판은 0.05%도 안 되니, 처음부터 결을 외치는 건 거의 언제나 −1점이에요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 찾기 — 한 판의 합을 모두',
        lead: '9장의 속성을 표로 적었어요. 쌍을 골라 세 번째 카드를 떠올리는 방식으로 모든 합을 찾아봐요.',
        blocks: [
          cards('ko', '예시 판 (카드 번호는 게임 화면의 왼쪽 위 숫자와 같아요)'),
          { type: 'steps', items: [
            { title: '카드 1을 기준으로', body: '1(세모 파랑 회색)과 2(세모 노랑 검정): 도형은 같으니 세모, 색은 파랑·노랑이니 빨강, 배경은 회색·검정이니 흰. "세모 빨강 흰"은 8번이에요. **합 1-2-8**. 1과 3(네모 파랑 회색)이면 세 번째는 "원 파랑 회색"인데 판에 없어요. 이렇게 1과 나머지 여덟 장을 짝지어 보면 합은 1-2-8 하나예요.' },
            { title: '카드 2를 기준으로', body: '2와 4(원 노랑 흰)의 세 번째는 "네모 노랑 회색", 5번이에요. **합 2-4-5**. 1과의 쌍은 이미 봤으니 2는 3~9와만 짝지으면 돼요.' },
            { title: '카드 3을 기준으로', body: '3(네모 파랑 회색)과 4(원 노랑 흰)의 세 번째는 "세모 빨강 검정", 6번이에요. **합 3-4-6**.' },
            { title: '나머지 쌍', body: '4번 이후의 쌍(4-7, 5-9, 6-8 …)도 같은 식으로 확인하면 새 합이 없어요. 예를 들어 4·5·9는 색이 모두 노랑이지만 도형이 원·네모·원으로 2:1이라 합이 아니에요.' },
            { title: '결', body: '합 세 개를 다 찾았으니 결을 외쳐요. 혼자 하기에서 이 판의 값은 합 3점 + 결 3점 = 6점이에요.' },
          ] },
          { type: 'callout', tone: 'note', title: '쌍은 36개지만 다 볼 필요는 없어요', text: '9장에서 두 장을 고르는 방법은 36가지이고, 합 하나는 그 안의 쌍 세 개로 세 번 나타나요. 기준 카드를 앞에서부터 하나씩 옮기며 뒤쪽 카드와만 짝지으면 같은 쌍을 두 번 보지 않아요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 한 속성으로 먼저 묶기',
        blocks: [
          { type: 'p', text: '쌍을 하나하나 보는 게 느리게 느껴지면, 속성 하나로 판을 먼저 나눠 보세요. 합은 각 속성에서 "모두 같음" 아니면 "모두 다름"이라, 한 속성만 보면 합의 후보가 두 종류로 나뉘어요.' },
          { type: 'list', items: [
            '**같은 색 무리 안에서**: 노랑 카드끼리만 보면 색은 자동으로 "모두 같음". 이제 도형과 배경만 맞추면 돼요. 예시 판의 노랑 다섯 장(2·4·5·7·9)에서 합 2-4-5가 나와요.',
            '**색이 하나씩 다른 세 장**: 파랑·빨강·노랑을 한 장씩 고르는 조합에서는 색은 자동으로 "모두 다름". 예시 판의 1-2-8과 3-4-6이 이쪽이에요.',
            '**희귀한 값부터**: 어떤 값이 판에 한 장뿐이면(예: 빨강이 두 장뿐), 그 값을 가진 카드는 "모두 다름" 쪽의 합에만 들어갈 수 있어요. 후보가 확 줄어요.',
          ] },
          { type: 'table', caption: '9장 판에 합이 몇 개 있을까 (가능한 모든 판 4,686,825가지를 셈)', head: ['합의 수', '비율'], rows: [
            ['0개', '0.04%'], ['1개', '4.9%'], ['2개', '17.3%'], ['3개', '33.1%'], ['4개', '28.5%'], ['5개', '14.0%'], ['6개', '2.0%'], ['8개', '0.13%'], ['12개', '극히 드묾'],
          ] },
          { type: 'p', text: '셋이나 넷이 가장 흔하고, 일곱 개는 나올 수 없어요. 두 개를 찾고 더 안 보인다면 한 번 더 훑을 가치가 있고, 다섯 개를 찾았다면 결이 거의 확실해요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 친구전의 차례 계산',
        blocks: [
          { type: 'p', text: '친구전은 차례제예요. 내 차례에는 합 하나를 내거나, 결을 외치거나, 넘기기 중 하나만 할 수 있고, 무엇을 하든(정답이든 오답이든) 차례는 다음 사람에게 넘어가요. 그래서 **마지막 합을 맞힌 사람은 결을 외칠 수 없어요**. 결 +3은 그다음 사람의 몫이에요.' },
          { type: 'list', items: [
            '**마지막 하나가 보일 때**: 남은 합이 하나라고 확신한다면, 그걸 맞혀 +1을 얻는 대신 다음 사람에게 결 +3을 넘겨주는 셈이에요. 상대가 그 합을 못 찾았을 것 같다면 넘기기로 버티는 것도 방법이에요.',
            '**상대가 합을 맞힌 직후**: 지금까지 찾은 합의 수와 판을 다시 보고, 남은 합이 없다고 판단되면 바로 결을 외치세요.',
            '**인원 수에 따라 달라요**: 2인전은 차례가 번갈아 오니 남은 합의 수가 짝수인지 홀수인지가 중요하고, 3~4인전은 결을 외칠 차례가 누구에게 갈지 한 바퀴 앞을 보세요.',
            '**시간 관리**: 차례마다 10·15·20초 중 방장이 고른 시간이 있고, 시간이 지나면 자동으로 넘기기가 돼요. 결을 외칠 판단은 상대 차례 동안 미리 해 두세요.',
          ] },
          { type: 'p', text: '결을 맞히면 다음 라운드의 새 판이 나오고, 차례는 결을 외친 사람의 다음 사람부터 시작해요. 10라운드가 끝나면 총점으로 승부하고, 최고점이 같으면 공동 승리예요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**한 속성만 보고 고르기**: 도형만 모두 다르면 합이라고 착각하기 쉬워요. 세 속성을 다 확인하세요.',
            '**이미 찾은 합 다시 내기**: 카드가 그대로 남아 있어서 같은 세 장을 또 고르기 쉬워요. 찾은 합은 번호 세 개로 기억하세요.',
            '**성급한 결**: 합은 보통 서너 개예요. 둘밖에 못 찾았다면 결 전에 한 번 더 훑어보세요.',
            '**배경색 놓치기**: 도형과 도형색에 눈이 가서 배경색의 2:1을 못 보는 실수가 가장 흔해요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['10분·5분 챌린지', '제한 시간 동안 판을 넘기며 점수를 모아요. 한 판에서 얻을 수 있는 건 "찾은 합의 수 + 결 3점"이에요. 막히면 포기로 정답을 보고 다음 판으로 갈 수 있어요. 다른 탭이나 앱으로 3번 이상 넘어가면 그 기록은 순위에 들어가지 않아요.'],
            ['무제한 연습', '시간 제한과 기록 없이 계속해요. "정답 확인"으로 그 판의 모든 합을 보고, 조합을 눌러 세 장을 강조해 볼 수 있어요.'],
            ['친구 방', '2~4명, 링크나 4자리 코드로 초대해요. 첫 차례는 무작위, 10라운드 총점으로 승부해요. 빈자리를 AI가 채우지는 않아요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '합', def: '도형·도형색·배경색이 각각 모두 같거나 모두 다른 세 장.' },
            { term: '결', def: '남은 합이 하나도 없다는 선언. 맞으면 +3점, 틀리면 −1점.' },
            { term: '2:1', def: '한 속성에서 같은 값 둘과 다른 값 하나가 나온 모양. 합이 아니라는 표시예요.' },
            { term: '세 번째 카드', def: '두 장이 정해지면 그 둘과 합이 되는 유일한 카드.' },
            { term: '기준 카드', def: '빠짐없이 찾으려고 고정해 두고 나머지와 짝지어 보는 카드.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '합은 정확히 어떤 조합인가요?', a: '도형·도형색·배경색 세 속성이 각각 모두 같거나 모두 다른 세 장이에요. 한 속성이라도 같은 값 둘과 다른 값 하나면 합이 아니에요.' },
      { q: '합을 빨리 찾는 방법이 있나요?', a: '두 장을 고르면 세 번째 카드가 하나로 정해져요. 속성마다 같으면 같은 값, 다르면 남은 값을 떠올리고 그 카드가 판에 있는지만 보면 돼요.' },
      { q: '한 판에 합은 몇 개 있나요?', a: '평균 3.4개예요. 셋이나 넷이 가장 흔하고, 하나도 없는 판은 0.05%도 안 돼요.' },
      { q: '카드는 맞히면 없어지나요?', a: '아니요. 조합만 찾음으로 기록되고 카드는 그대로라, 한 카드가 여러 합에 쓰일 수 있어요.' },
      { q: '친구와 할 수 있나요?', a: '친구 방 링크나 4자리 코드로 2~4명이 차례대로 대전할 수 있어요. 10라운드 총점으로 승부해요.' },
    ],
    cta: { title: '첫 판을 열어 볼까요?', body: '연습에서 세 번째 카드 떠올리기를 익힌 뒤 5분 챌린지에 도전해 보세요.', button: '결합 하러 가기' },
    disclaimer: '방송 게임 규칙을 참고한 비공식 팬 구현이며 방송사·제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: 'Gyul! Hap! strategy — The Genius pattern game, finding haps and timing Gyul | PUZZLTHINK',
      description: 'How to find haps fast and call Gyul at the right moment in Gyul! Hap! from The Genius: picking the third card from two, how many haps a board holds, a full board solved step by step, and turn counting in friend rooms.',
      keywords: ['Gyul Hap strategy', 'Gyul! Hap!', 'The Genius Gyul Hap', 'Gyul Hap rules', 'pattern recognition game', 'find the set game'],
    },
    title: 'Gyul! Hap! strategy guide',
    lead: 'Pick two cards and the third is already decided.',
    intro: [
      'Gyul! Hap! is a pattern game: find **haps**, sets of three among nine cards. Every card has three attributes — shape, shape colour and background — and three cards form a hap when, for each attribute, they are **all the same or all different**. When you think no hap is left, call **Gyul**: +3 if you are right, −1 if a hap remains.',
      'This guide takes you from "spotting haps" to "finding every hap": seeing the third card from any two, how many haps a board usually holds, an order that finds them all on a real board, and counting turns for the last hap and the Gyul call in friend rooms.',
    ],
    gamePageTitle: 'Gyul! Hap! — seeing three attributes at once',
    summary: 'Seeing the third card, haps per board, a no-miss search order and Gyul timing.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: 'Gyul! Hap! comes from The Genius: Rules of the Game. Comparing three attributes at once keeps your eyes busy at first, but once you see the principle you find haps much faster. A Gyul (+3) is worth three haps (+1 each), so when to call it often decides the game.' },
          { type: 'p', text: 'On PUZZLTHINK you can play 10- and 5-minute challenges or untimed practice alone, or take turns with 2–4 players in a friend room.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Cards**: every combination of shape (circle, triangle, square) × colour (blue, red, yellow) × background (white, grey, black) — 27 cards, no duplicates.',
            '**Board**: 9 of the 27 are dealt face up at random.',
            '**Hap**: three cards that are all the same or all different **in each attribute** — shape, colour and background. Any attribute split "two the same, one different" means no hap.',
            '**Scoring**: a right hap +1, a wrong one −1. Picking a hap already found counts as wrong.',
            '**Gyul**: called when no unfound hap is left, it scores +3 and deals a new board. If a hap remains, −1.',
            '**Cards stay**: cards of a found hap stay on the board and can be part of other haps. Only the combination is marked as found.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Easy to get wrong',
        blocks: [
          { type: 'cards', items: [
            { title: 'Two of a kind fails', body: 'Red, red, blue in one attribute — a 2:1 split — rules out a hap even if the other two attributes are perfect.' },
            { title: 'Never all three the same', body: 'There are no duplicate cards, so three cards cannot match in every attribute. At least one attribute must be all different.' },
            { title: 'One card, several haps', body: 'Cards stay on the board, so one card can be in two or three haps. Sharing a card does not make it a hap you already found.' },
            { title: 'After a wrong Gyul', body: 'Alone, a wrong Gyul costs 1 point and you stay on the same board. In a friend room it costs 1 point and the turn passes on.' },
            { title: 'Boards with no hap', body: 'Very rarely (about one board in 2,200) there is no hap at all from the start. Call Gyul straight away for +3.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — two cards decide the third',
        blocks: [
          { type: 'p', text: 'Pick any two cards and the third card that completes a hap with them is **exactly one card**. Work it out attribute by attribute:' },
          { type: 'list', items: [
            '**If the two match**, the third must match too. (red, red → red)',
            '**If the two differ**, the third must be the remaining value. (red, blue → yellow)',
          ] },
          { type: 'p', text: 'So do not compare three cards at once. Pick two, picture "the third looks like this", and look for that card on the board. If it is there, it is a hap; if not, move on to the next pair. The 27 cards contain every combination once, so that card is either on the board or it is not.' },
          { type: 'callout', tone: 'tip', title: 'Do not rush Gyul', text: 'A 9-card board holds 3.4 haps on average. Fewer than 0.05% of boards have none, so calling Gyul at the start almost always costs a point.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — every hap on one board',
        lead: 'The nine cards’ attributes are listed below. Pick pairs, picture the third card, and find every hap.',
        blocks: [
          cards('en', 'Example board (card numbers match the numbers in the corner of each card in the game)'),
          { type: 'steps', items: [
            { title: 'Anchor on card 1', body: '1 (triangle, blue, grey) and 2 (triangle, yellow, black): shapes match, so triangle; blue and yellow, so red; grey and black, so white. "Triangle, red, white" is card 8: **hap 1-2-8**. With 1 and 3 (square, blue, grey) the third would be "circle, blue, grey" — not on the board. Pairing 1 with each of the other eight finds just 1-2-8.' },
            { title: 'Anchor on card 2', body: 'The third card for 2 and 4 (circle, yellow, white) is "square, yellow, grey": card 5. **Hap 2-4-5**. Its pair with 1 is done already, so card 2 only needs pairing with 3–9.' },
            { title: 'Anchor on card 3', body: 'The third card for 3 (square, blue, grey) and 4 (circle, yellow, white) is "triangle, red, black": card 6. **Hap 3-4-6**.' },
            { title: 'The remaining pairs', body: 'Checking the pairs from card 4 on (4-7, 5-9, 6-8 …) the same way turns up nothing new. For example 4, 5 and 9 are all yellow, but their shapes are circle, square, circle — a 2:1 split, no hap.' },
            { title: 'Gyul', body: 'All three haps found, so call Gyul. Alone, this board is worth 3 points for the haps plus 3 for Gyul: 6.' },
          ] },
          { type: 'callout', tone: 'note', title: '36 pairs, but you need not see them all', text: 'Nine cards make 36 pairs, and each hap shows up in three of them. Move the anchor forward one card at a time and pair it only with the cards after it, and you never look at the same pair twice.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — group by one attribute first',
        blocks: [
          { type: 'p', text: 'If going pair by pair feels slow, split the board by one attribute first. In a hap each attribute is either "all the same" or "all different", so one attribute divides the candidates into two kinds.' },
          { type: 'list', items: [
            '**Within one colour**: among the yellow cards only, colour is automatically "all the same"; you only need shape and background to work. The example board’s five yellows (2, 4, 5, 7, 9) give hap 2-4-5.',
            '**One of each colour**: choosing one blue, one red and one yellow makes colour automatically "all different". Haps 1-2-8 and 3-4-6 are of this kind.',
            '**Start from rare values**: if a value appears on only one or two cards (red appears twice on the example board), those cards can only be in the "all different" kind of hap for that attribute. The candidates shrink fast.',
          ] },
          { type: 'table', caption: 'How many haps a 9-card board holds (counted over all 4,686,825 possible boards)', head: ['Haps', 'Share'], rows: [
            ['0', '0.04%'], ['1', '4.9%'], ['2', '17.3%'], ['3', '33.1%'], ['4', '28.5%'], ['5', '14.0%'], ['6', '2.0%'], ['8', '0.13%'], ['12', 'vanishingly rare'],
          ] },
          { type: 'p', text: 'Three or four is the most common and seven is impossible. If you have found two and see no more, another sweep is worth it; with five found, Gyul is almost certain.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — counting turns in friend rooms',
        blocks: [
          { type: 'p', text: 'Friend rooms are turn-based. On your turn you may submit one hap, call Gyul or pass — and whatever you do, right or wrong, the turn moves on. So **whoever finds the last hap cannot call Gyul**: the +3 goes to the next player.' },
          { type: 'list', items: [
            '**When you see the last one**: if you are sure only one hap remains, taking it for +1 hands the next player +3 for Gyul. If you think they have not spotted it, passing to wait can be the better play.',
            '**Right after someone scores a hap**: recount the haps found and look at the board again. If none is left, call Gyul at once.',
            '**It depends on the player count**: with two players turns alternate, so whether the number of remaining haps is odd or even matters; with three or four, look one round ahead to see whose turn the Gyul call will fall on.',
            '**Mind the clock**: each turn has 10, 15 or 20 seconds (the host chooses), and running out passes automatically. Make your Gyul decision during other players’ turns.',
          ] },
          { type: 'p', text: 'A right Gyul deals the next round’s board, and the turn starts with the player after the one who called it. After 10 rounds the total score decides; players tied on the top score share the win.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Checking only one attribute**: three different shapes is not enough. Check all three attributes.',
            '**Resubmitting a found hap**: the cards stay, so it is easy to pick the same three again. Remember found haps by their three numbers.',
            '**Early Gyul**: boards usually hold three or four haps. With only two found, sweep again before calling.',
            '**Missing the background**: eyes go to shape and colour, and a 2:1 split in the background is the most common miss.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes',
        blocks: [
          { type: 'table', head: ['Mode', 'Good to know'], rows: [
            ['10- and 5-minute challenges', 'Collect points board after board until time runs out. A board is worth "haps found + 3 for Gyul". Stuck? Give up to see the answers and move to the next board. Switching to another tab or app 3 times or more voids the run for the ranking.'],
            ['Untimed practice', 'No clock, no records. "Check answers" lists every hap on the board, and tapping one highlights its three cards.'],
            ['Friend room', '2–4 players, invited by link or 4-digit code. The first turn is random and 10 rounds decide the total. Empty seats are not filled by AI.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Hap', def: 'Three cards that are all the same or all different in shape, colour and background, each.' },
            { term: 'Gyul', def: 'The call that no hap is left: +3 if right, −1 if wrong.' },
            { term: '2:1', def: 'An attribute with two equal values and one different — a sign of no hap.' },
            { term: 'Third card', def: 'The single card that completes a hap with a given pair.' },
            { term: 'Anchor card', def: 'A card held fixed and paired with the others so no hap is missed.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What exactly is a hap?', a: 'Three cards that, in each of shape, shape colour and background, are all the same or all different. If any attribute has two equal values and one different, it is not a hap.' },
      { q: 'Is there a fast way to find haps?', a: 'Two cards decide the third. For each attribute, take the same value if they match or the remaining value if they differ, then just check whether that card is on the board.' },
      { q: 'How many haps does a board have?', a: '3.4 on average. Three or four is most common, and fewer than 0.05% of boards have none.' },
      { q: 'Do cards disappear when used?', a: 'No. Only the combination is marked as found; the cards stay, and one card can be part of several haps.' },
      { q: 'Can I play with friends?', a: 'Yes — 2–4 players take turns in a friend room joined by link or 4-digit code. The total over 10 rounds decides the winner.' },
    ],
    cta: { title: 'Ready to open the first board?', body: 'Learn to picture the third card in practice, then take on the 5-minute challenge.', button: 'Play Gyul! Hap!' },
    disclaimer: 'An unofficial fan implementation based on the programme’s game rules; not affiliated with the broadcaster or producers.',
  },
};
export default guide;
