import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'doubles-plan-2',
  kind: 'tournament',
  when: { ko: '6강 3차', en: 'Last six, match 3' },
  episode: { ko: '7화', en: 'Episode 7' },
  related: ['blackWhite', 'blackWhite2', 'gradation'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '더블스 플랜 2 규칙 — 데스게임2 6강, 두 배를 넘으면 작은 수가 이기는 블록 대결',
      description: '넷플릭스 데스게임2 6강 3차 더블스 플랜 2의 규칙을 정리했어요. 1–12 숫자 블록과 빨강(3–9)·검정 뒷면, 세트마다 5개 비밀 선택과 사용 횟수 제한, 기본승·역전승·더블승·무승부, 세트별 점수, 6세트와 연장전까지.',
      keywords: ['더블스 플랜', '더블스 플랜 2', '데스게임2 더블스 플랜', '숫자 블록 게임', '넷플릭스 데스게임'],
    },
    title: '더블스 플랜 2 — 데스게임2 6강',
    name: '더블스 플랜 2',
    lead: '큰 수가 이기지만, 두 배보다 더 크면 작은 수가 이겨요. 정확히 두 배면 "더블승"으로 큰 점수예요.',
    summary: '숫자 블록을 하나씩 내 겨루는 1:1 대결. 두 배를 넘는 차이는 작은 수의 역전승, 정확히 두 배는 더블승이에요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1.',
        '**블록**: 각자 1–12 숫자 블록 12개. 뒷면은 **3–9가 빨강**(7종), **나머지(1·2·10·11·12)가 검정**(5종)이에요.',
        '**세트**: 6세트. 세트마다 그 세트에 쓸 블록 5개를 비밀로 골라요. 고른 뒤에는 바꿀 수 없어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '블록 내기', body: '선이 블록 하나를 내면 후가 그 뒷면 색을 보고 블록 하나를 내요. 두 블록의 앞면을 공개해 판정해요. 이렇게 한 세트에 다섯 번 겨뤄요.' },
        { title: '판정', body: '아래 표대로 승부를 가려 점수를 받아요.' },
        { title: '선후', body: '처음은 추첨이고, 그 뒤로는 승패와 상관없이 번갈아 맡되, 세트가 끝나면 그 세트 점수가 높은 사람이 다음 세트 선이에요.' },
      ] },
      { type: 'table', head: ['결과', '조건'], rows: [
        ['기본승', '큰 수가 이겨요.'],
        ['역전승', '큰 수가 작은 수의 **두 배보다 크면**, 작은 수가 이겨요.'],
        ['더블승', '큰 수가 작은 수의 **정확히 두 배**면, 큰 수가 이겨요.'],
        ['무승부', '같은 수면 점수 변동이 없어요.'],
      ] },
      { type: 'table', head: ['세트', '점수'], rows: [
        ['1–2세트', '모든 승리 1점'],
        ['3–4세트', '기본승·역전승 1점, 더블승 2점'],
        ['5–6세트', '기본승·역전승 2점, 더블승 4점'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '6세트 뒤 점수가 높은 사람이 이겨요. 같으면 1세트를 더 해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '게임 전체에서 **검정 블록은 각 2번, 빨강 블록은 각 3번**까지 쓸 수 있어요. 다 쓴 블록은 버려요.',
        '6세트를 빼고, **직전 세트에 쓴 블록은 다음 세트에 쓸 수 없어요.**',
        '이 제약 때문에 5개 조합을 만들지 못하면 그 자리에서 실격패예요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '더블스 플랜은 **가위바위보처럼 순환하는 숫자**예요. 12는 6을 정확히 두 배로 이기고 7–11을 기본으로 이기지만, 5 이하에게는 역전패해요. 어떤 숫자도 모든 숫자를 이기지 못해요.' },
      { type: 'cards', items: [
        { title: '작은 수가 강한 상대', body: '1은 3 이상의 모든 수에게 역전승하고(3은 1의 세 배), 2를 만나면 더블승을 내줘요. 2는 5 이상에게 역전승해요. 작은 수는 큰 수 사냥꾼이지만, 바로 위의 작은 수에게는 약해요. 큰 수와 작은 수 사이의 중간 숫자(5–7)가 의외로 안정적인 이유예요.' },
        { title: '뒷면 색이 범위를 알려 줘요', body: '후는 선 블록의 색을 보고 고르는데, 빨강은 3–9, 검정은 1·2·10·11·12예요. 검정은 극단(아주 작거나 아주 큰) 숫자라, 후는 "역전을 노릴지, 크게 이길지"를 판단해야 해요. 선에게 불리한 정보 구조라 선을 받는 세트에서는 중간 숫자로 위험을 줄이는 게 좋아요.' },
        { title: '사용 횟수가 미래를 막아요', body: '검정은 두 번, 빨강은 세 번이고 연속 세트 사용도 금지라, 강한 블록을 앞 세트에 다 쓰면 점수가 두 배인 5–6세트에 낼 패가 없어져요. 6세트에는 연속 사용 금지가 풀리므로, 5세트까지의 배분을 거꾸로 계산해야 해요. 다섯 개를 못 채우면 실격이라는 점도 잊으면 안 돼요.' },
        { title: '더블승을 노리는 쌍', body: '더블승은 후반에 4점이에요. 상대가 6을 낼 것 같으면 12, 4라면 8처럼 정확히 두 배를 준비하면 큰 점수가 나요. 반대로 내가 낼 수의 두 배와 절반을 상대가 쓸 수 있는지 세어 두면 위험을 줄일 수 있어요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '스트라테고 (Stratego)', players: '2명', alike: '숨겨진 계급끼리 부딪쳐 큰 쪽이 이기지만, 가장 약한 스파이가 가장 강한 원수를 이기는 순환 예외가 있어요. "작은 수의 역전승"과 같은 발상이에요.', differs: '스트라테고는 판 위에서 말을 움직이는 전쟁 게임이고, 역전은 스파이 한 장에만 있어요.' },
      { name: '하이에나 (Hol’s der Geier)', players: '2–5명', alike: '한 번씩만 쓸 수 있는 숫자 카드를 라운드마다 내며 겨루는 예산 게임이에요.', differs: '하이에나는 동시에 내고, 큰 수가 늘 이기는 방향이 정해져 있어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 시즌 1의 「더블스 플랜」을 바꾼 버전이에요.',
  },
  en: {
    meta: {
      title: 'Doubles Plan 2 rules — Death Game 2 (The Risk Takers season 2), last six',
      description: 'The rules of Doubles Plan 2 (더블스 플랜2) from Netflix’s Death Game season 2: number blocks 1–12 with red (3–9) and black backs, choosing five secretly per set with usage limits, normal, upset and double wins, points per set, six sets and an extra set.',
      keywords: ['Doubles Plan', 'Doubles Plan 2', 'Death Game 2', 'number block game'],
    },
    title: 'Doubles Plan 2 — Death Game 2, last six',
    name: 'Doubles Plan 2',
    lead: 'The higher number wins — unless it is more than double the other, when the lower wins. Exactly double is a "double win" worth more.',
    summary: 'A 1:1 duel of number blocks: more than double is an upset for the smaller number, exactly double is a double win.',
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1.',
        '**Blocks**: 1–12 each. **3–9 have red backs** (seven), **1, 2, 10, 11, 12 black** (five).',
        '**Sets**: six; before each, secretly pick five blocks to use, fixed for the set.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Play', body: 'The leader plays a block; the other sees its back colour and replies. Fronts are revealed and judged. Five duels per set.' },
        { title: 'Judge', body: 'Scored as in the table.' },
        { title: 'Order', body: 'Drawn at first, then alternating, but the set winner leads the next set.' },
      ] },
      { type: 'table', head: ['Result', 'When'], rows: [
        ['Normal win', 'Higher number wins.'],
        ['Upset', 'If the higher is **more than double** the lower, the lower wins.'],
        ['Double win', 'If the higher is **exactly double**, the higher wins.'],
        ['Draw', 'Equal numbers; no points.'],
      ] },
      { type: 'table', head: ['Sets', 'Points'], rows: [
        ['1–2', 'Every win 1'],
        ['3–4', 'Normal and upset 1, double 2'],
        ['5–6', 'Normal and upset 2, double 4'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After six sets the higher score wins; a tie adds one more set.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Over the whole game **black blocks may be used twice each and red blocks three times**; spent blocks are discarded.',
        'Except into set 6, **blocks used in one set cannot be used in the next**.',
        'Failing to make five legal blocks for a set is an instant loss.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Doubles Plan makes numbers **cycle like rock-paper-scissors**: 12 double-wins against 6 and beats 7–11, but loses to anything 5 or below. No number beats everything.' },
      { type: 'cards', items: [
        { title: 'Small numbers hunt big ones', body: '1 upsets everything from 3 up but concedes a double win to 2; 2 upsets 5 and above. Small numbers kill big ones yet lose to the next small number, which is why middle numbers (5–7) are surprisingly steady.' },
        { title: 'The back colour gives a range', body: 'Red is 3–9, black is 1, 2, 10, 11 or 12 — the extremes — so the replier must decide between an upset and a big win. The leader is at an information disadvantage; middling numbers reduce the risk when leading.' },
        { title: 'Usage limits bind the future', body: 'Blacks twice, reds three times, and no consecutive sets: burn strong blocks early and you have nothing for the doubled sets 5–6. Set 6 lifts the consecutive rule, so plan backwards — and never fail to have five.' },
        { title: 'Setting up doubles', body: 'A late double win is worth 4: expect a 6, hold a 12; expect a 4, hold an 8. Conversely, track whether the opponent can still play double or half of your number.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Stratego', players: '2', alike: 'Hidden ranks clash and the higher wins, except that the weakest spy beats the strongest marshal — the same idea as a small-number upset.', differs: 'It is a board war game, and the only upset is the spy.' },
      { name: "Hol's der Geier (Raj)", players: '2–5', alike: 'A budget game of number cards each used once over many rounds.', differs: 'Cards are played simultaneously and high always wins.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' A revised version of season 1’s Doubles Plan.',
  },
};

export default game;
