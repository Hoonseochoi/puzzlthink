// 수식 신호등 guide. Rules and numbers follow src/lib/equationSignal.ts (CELLS 9, SYMBOLS, evaluate: ^ right to left,
// then × ÷, then + −, no leading zeros, no operators side by side; isEquation; markGuess: greens first, then yellows
// left to right while copies remain; generateEquation: 1–3 operators, at most one ^ with exponent 2–3 on a base of
// 2–12, × and ÷ operands 2+, a whole value of 1–99,999, sometimes an expression on both sides; CHALLENGE_MS 10 min),
// src/lib/equationSignalRoom.ts (2–4 players, 3 or 5 rounds, 120/180/300 s, 12 guesses a round, placePoints),
// src/lib/equationSignalDuel.ts (1:1 출제 대결: 3 min to write, 8 min to solve, 12 guesses, duelResult),
// src/components/equationSignal/EquationSignalGame.tsx (practice give-up, challenge skip), src/hooks/useBoardExits.tsx
// (3 tab switches void a challenge) and the EquationSignalGuide messages.
// The worked example's colours were computed with markGuess, and a search over every 9-cell string with the known
// greens confirmed 48/6+7=15 is the only equation left after the two guesses.
import type { GameGuide, GuideBlock } from './types';

type Lang = 'ko' | 'en';
const MARK: Record<Lang, Record<string, string>> = {
  ko: { g: '초록', y: '노랑', r: '빨강' },
  en: { g: 'G', y: 'Y', r: 'R' },
};
const glyph = (ch: string) => (ch === '*' ? '×' : ch === '/' ? '÷' : ch === '-' ? '−' : ch);
/** A guess and its colours as a two-row table. */
const signal = (lang: Lang, guess: string, marks: string, caption: string): GuideBlock => ({
  type: 'table',
  caption,
  head: [lang === 'ko' ? '칸' : 'Cell', ...Array.from({ length: 9 }, (_, i) => String(i + 1))],
  rows: [
    [lang === 'ko' ? '수식' : 'Guess', ...[...guess].map(glyph)],
    [lang === 'ko' ? '신호' : 'Signal', ...[...marks].map((m) => MARK[lang][m])],
  ],
});

const G1 = '12+3*4=24';
const M1 = 'yryrrygrr';
const G2 = '98/7-6=50';
const M2 = 'rggyrygyr';

const guide: GameGuide = {
  game: 'equationSignal',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['equationTower', 'hiddenWord', 'colorLinkDuel', 'merge2048'],
  inlineNamespace: 'EquationSignalGuide',
  ko: {
    meta: {
      title: '수식 신호등 공략 — 데블스플랜3 결승 게임, 신호로 수식 좁히기 | PUZZLTHINK',
      description: '데블스 플랜 3 결승 수식 신호등, 몇 번 만에 맞힐 수 있을까요? 초록·노랑·빨강 신호 읽는 법, 개수 세기로 글자를 확정하는 법, 기호 자리 규칙, 실제로 두 번 만에 답이 하나로 좁혀지는 예시, 챌린지·대결 요령까지 정리했어요.',
      keywords: ['수식 신호등 공략', '수식 신호등 규칙', '데블스플랜3 수식 신호등', '데블스 플랜 결승 게임', '수식 맞히기', '너들 공략', 'Nerdle 공략', '수식 워들'],
    },
    title: '수식 신호등 공략',
    lead: '신호 두 줄이면 답이 하나로 좁혀질 때도 있어요.',
    intro: [
      '수식 신호등은 숨겨진 9칸짜리 수식을 맞히는 추리 게임이에요. 9칸을 채워 내면 칸마다 신호가 켜져요. **초록**은 그 글자가 그 자리에 맞다는 뜻, **노랑**은 수식에 있지만 자리가 다르다는 뜻, **빨강**은 수식에 없거나 이미 다 셌다는 뜻이에요. 9칸이 모두 초록이 되면 성공이에요.',
      '이 공략은 신호를 "정보"로 바꾸는 법을 다뤄요. 빨강이 알려 주는 개수, 수식의 문법이 막아 주는 자리, 결괏값의 자릿수 같은 도구로 후보를 줄이고, 실제로 두 번의 제출만으로 답이 하나로 정해지는 과정을 한 칸씩 따라가요. 혼자 연습·10분 챌린지·친구 대결에서 쓰는 요령도 정리했어요.',
    ],
    gamePageTitle: '수식 신호등 온라인 — 데블스 플랜 3 결승 게임, 규칙과 공략',
    summary: '신호 읽기, 개수 세기, 기호 자리 규칙, 두 번 만에 좁혀지는 예시.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '수식 신호등은 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3) 결승전 3회전에 나온 게임이에요. 단어를 맞히는 워들(Wordle)을 수식으로 바꾼 너들(Nerdle)과 비슷한데, 기호에 **제곱(^)**이 하나 더 있어요. 방송에서는 두 결승 진출자가 서로 상대가 맞힐 수식을 만들었고, PUZZLTHINK에서는 수식을 자동으로 만들어 혼자서도, 2~4명이 같은 수식을 두고도 겨룰 수 있게 했어요. 방송처럼 서로 문제를 내는 **1:1 출제 대결** 방도 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**정답 수식**: 9칸, 숫자 0~9와 기호 + − × ÷ = ^로 이루어진 올바른 등식이에요. 같은 글자가 여러 번 나올 수 있고, 등호는 하나 이상이에요.',
            '**정답의 문법**: 기호를 연달아 쓰거나 기호로 시작·끝나지 않고, 0으로 시작하는 두 자리 이상 수(07)가 없고, 곱셈 기호를 생략하지 않아요. 0으로 나누는 식도 없어요.',
            '**제출은 자유**: 내가 내는 수식은 계산이 틀려도, 등호가 없어도, 기호가 붙어 있어도 돼요. 9칸만 채우면 돼요.',
            '**신호**: 먼저 자리와 글자가 모두 맞는 칸이 초록이 돼요. 남은 칸은 왼쪽부터, 정답에 그 글자가 아직 남아 있으면 노랑, 아니면 빨강이에요.',
            '**계산 순서**: 제곱 → 곱셈·나눗셈 → 덧셈·뺄셈. 같은 순위는 왼쪽부터, 제곱이 이어지면 오른쪽부터예요.',
          ] },
          { type: 'h3', text: '이 사이트가 만드는 수식의 특징' },
          { type: 'list', items: [
            '왼쪽에 연산 기호가 1~3개 있는 식, 오른쪽에 그 값이 오는 모양이 대부분이고, 가끔 양쪽이 모두 식이에요(3×4=2×6).',
            '값은 1 이상 99,999 이하의 자연수예요. 음수나 0, 소수 결과는 나오지 않아요.',
            '제곱은 한 수식에 많아야 한 번, 밑은 2~12, 지수는 2나 3이에요. ^0, ^1, 이어진 제곱은 나오지 않아요.',
            '×와 ÷ 뒤에는 2 이상의 수가 와요. +0, ×1, ÷1처럼 아무 일도 하지 않는 계산은 없어요.',
            '숫자가 0과 1뿐인 것처럼 단서가 너무 적은 수식은 빼고, 서로 다른 숫자가 3개 이상 들어가요.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 신호',
        blocks: [
          { type: 'cards', items: [
            { title: '같은 글자를 두 번 냈을 때', body: '3을 두 번 냈는데 하나는 초록, 하나는 빨강이면 정답에 3이 **딱 한 개**예요. 빨강은 "없다"가 아니라 "이 개수 이상은 없다"는 뜻이에요.' },
            { title: '노랑과 빨강이 같이 나올 때', body: '정답에 4가 하나뿐인데 4를 두 번 냈고 둘 다 자리가 틀리면, 왼쪽 4가 노랑, 오른쪽 4가 빨강이 돼요. 노랑이 왼쪽부터 붙기 때문이에요.' },
            { title: '초록이 노랑보다 먼저', body: '오른쪽 칸이 초록이면, 그 글자가 왼쪽에도 하나 더 있을 때 왼쪽은 빨강이 될 수 있어요. 초록을 먼저 세고 남은 개수로 노랑을 주기 때문이에요.' },
            { title: '제곱이 가장 먼저', body: '2+3^2는 2+9 = 11이에요. 2×3^2 = 18, 3^2×2 = 18처럼 제곱은 바로 옆 두 수끼리만 먼저 계산해요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 첫 두 줄로 글자를 모으기',
        blocks: [
          { type: 'p', text: '처음 두 번은 정답을 노리기보다 **어떤 글자가 들어 있는지**를 모으는 데 쓰세요. 16가지 글자 중 정답에 쓰인 건 많아야 9가지라, 두 줄에 서로 다른 글자를 고르게 넣으면 거의 다 드러나요.' },
          { type: 'list', ordered: true, items: [
            '**첫 줄**: 자주 나오는 기호(+, −, ×, ÷)와 서로 다른 숫자를 섞어요. 등호는 6~8번째 칸 어딘가에 두면 자리 정보도 함께 얻어요. 제출은 계산이 맞지 않아도 되니 기호를 마음껏 넣어도 돼요.',
            '**둘째 줄**: 첫 줄에 쓰지 않은 숫자를 모두 넣어요. 두 줄이면 0~9 대부분과 연산 기호의 여부가 드러나요.',
            '**셋째 줄부터 정답 후보로**: 이제 남은 글자로 성립하는 수식을 만들어 내요. 초록은 그대로 두고, 노랑은 다른 자리로 옮겨요.',
            '**등호 자리 먼저**: 등호가 초록이 되면 수식의 뼈대가 서요. 오른쪽에 남은 칸 수가 곧 결괏값의 자릿수예요.',
          ] },
          { type: 'callout', tone: 'tip', title: '개수를 세세요', text: '노랑과 초록으로 확인한 서로 다른 글자가 9개가 되면, 정답은 그 9개를 한 번씩만 쓴 수식이에요. 남은 건 순서뿐이에요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 풀기 — 두 줄로 답을 하나로 좁히기',
        lead: '정답은 48÷6+7=15예요. 신호는 게임과 같은 방식으로 계산했어요.',
        blocks: [
          signal('ko', G1, M1, '1번째 제출: 12+3×4=24 (성립하는 수식으로 시작)'),
          { type: 'p', text: '등호(7번)가 초록이라 오른쪽은 **두 자리 결괏값**이에요. 1, +, 4가 노랑이니 정답에 들어 있고, 2·3·×는 빨강이라 없어요. 4를 두 번 냈는데 앞의 4만 노랑이니 4는 한 개뿐이에요. 노랑 자리에서 1은 1번 칸, +는 3번 칸, 4는 6번 칸이 아니라는 것도 알아요.' },
          signal('ko', G2, M2, '2번째 제출: 98÷7−6=50 (계산은 틀려도 새 글자를 모으는 줄)'),
          { type: 'p', text: '8(2번)과 ÷(3번)가 초록, 7·6·5가 노랑이에요. 9·0·−는 빨강이에요. 이제 확인한 글자를 세면 = 8 ÷ 1 + 4 7 6 5, **서로 다른 글자가 9개**예요. 칸도 9개이니 각 글자가 정확히 한 번씩 쓰이고, ^는 없어요.' },
          { type: 'steps', items: [
            { title: '뼈대 세우기', body: '2번 8, 3번 ÷, 7번 =가 정해졌어요. 1번 칸은 수의 시작이라 숫자이고, 8·9번은 결괏값의 두 자리라 숫자예요. 남은 +는 4·5·6번 중 하나예요.' },
            { title: '+ 자리 정하기', body: '4번에 오면 ÷+로 기호가 붙고, 6번에 오면 왼쪽 식이 기호로 끝나요. 둘 다 정답의 문법에 어긋나니 +는 5번이에요. 모양은 □8÷□+□=□□예요.' },
            { title: '남은 숫자 1·4·5·6·7 배치', body: '1번 칸에는 1이 못 와요(1번째 줄 노랑). 그래서 앞의 수는 48·58·68·78 중 하나예요. 7은 4번, 4와 6은 6번, 5는 8번에 못 와요(노랑 자리).' },
            { title: '나눗셈과 자릿수로 거르기', body: '48÷6=8이고 8+7=15, 남는 숫자도 1과 5로 딱 맞아요. 다른 경우는 모두 막혀요. 예를 들어 48÷1=48이면 더해서 두 자리가 되는 조합이 남은 숫자로 안 나오고, 78÷6=13이면 13+1=14가 되는데 1이 두 번 필요해요.' },
            { title: '3번째 제출: 48÷6+7=15', body: '9칸이 모두 초록이에요. 두 줄의 신호만으로 답이 하나뿐이었다는 걸 확인할 수 있어요(모든 9칸 조합을 검사해도 이 수식 하나만 남아요).' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 문법과 자릿수로 후보 줄이기',
        blocks: [
          { type: 'p', text: '정답은 문법이 맞는 등식이라, 칸마다 들어갈 수 있는 글자가 생각보다 적어요. 아래 규칙만으로도 자리 후보가 크게 줄어요.' },
          { type: 'list', items: [
            '**1번 칸과 등호 바로 오른쪽은 숫자**: 수식은 기호로 시작하지 않고, 결괏값은 숫자로 시작해요. 9번 칸도 숫자예요.',
            '**기호끼리 붙지 않아요**: 기호 바로 옆 칸은 반드시 숫자예요. 기호가 둘 이상 있으면 서로 최소 한 칸씩 떨어져요.',
            '**0은 앞에 못 와요**: 기호나 등호 바로 뒤, 1번 칸에는 0이 올 수 없어요(그 수가 0 한 자리가 아니라면). 이 사이트의 수식은 +0이나 ×0을 만들지 않으니 0은 대개 수의 끝이나 가운데에 있어요.',
            '**자릿수 맞추기**: 두 자리 × 두 자리는 세~네 자리, 두 자리 ÷ 한 자리는 대개 한~두 자리예요. 등호 오른쪽 칸 수와 왼쪽 식의 크기가 맞는지 보세요.',
            '**나눗셈은 나누어떨어지는 쪽으로**: 값이 자연수라, ÷가 있으면 앞의 수가 뒤의 수의 배수인 경우가 대부분이에요.',
          ] },
          { type: 'h3', text: '제곱이 있을 때' },
          { type: 'p', text: '제곱은 밑이 2~12, 지수가 2나 3뿐이라 나올 수 있는 값이 정해져 있어요. 제곱수는 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 세제곱수는 8, 27, 64, 125, 216, 343, 512, 729, 1000, 1331, 1728이에요. ^가 초록이나 노랑이면 그 바로 뒤 칸은 2나 3이고, 2와 3 중 빨강인 쪽은 지수가 아니에요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 버리는 줄을 똑똑하게',
        blocks: [
          { type: 'p', text: '후보가 서넛 남았을 때, 그중 하나를 내는 것보다 **후보들을 서로 다른 신호로 갈라 주는 줄**을 내는 게 빠를 때가 있어요. 예를 들어 남은 후보가 48÷6+7=15, 48÷8+9=15, 45÷9+7=12라면, 갈리는 칸(2·4·6·9번)에 후보마다 다른 글자를 넣은 줄 하나로 셋을 모두 구별할 수 있어요.' },
          { type: 'list', items: [
            '**확정된 칸에는 새 글자를**: 이미 초록인 칸에 같은 글자를 또 넣으면 정보가 없어요. 탐색 줄이라면 그 칸에 아직 모르는 글자를 넣으세요.',
            '**반복 글자 확인하기**: 숫자가 겹치는 수식(예: 11, 100)이 의심되면 같은 숫자를 두 번 넣어 보세요. 두 번째가 빨강이면 한 개, 노랑이나 초록이면 두 개 이상이에요.',
            '**양쪽이 식인 모양**: 등호가 4~5번째 칸에서 초록이면 오른쪽도 식일 수 있어요(3×4=2×6). 이때는 오른쪽에도 기호가 하나 있다는 걸 염두에 두세요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**빨강을 "아예 없음"으로만 읽기**: 같은 글자를 두 번 냈다면 빨강은 개수를 알려 줘요.',
            '**노랑 자리를 잊기**: 노랑은 "그 자리는 아니다"라는 정보도 담고 있어요. 같은 자리에 다시 넣지 마세요.',
            '**계산 순서 실수**: 3+4×2는 11이에요. 제곱, 곱셈·나눗셈을 먼저 하세요.',
            '**정답 후보에 문법 어긋난 식 넣기**: 기호가 붙거나 0으로 시작하는 식은 정답이 될 수 없어요. 탐색 줄이 아니라면 낼 필요가 없어요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — 연습, 10분 챌린지, 친구·공개방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['혼자 연습', '제출 횟수 제한이 없어요. 막히면 "포기"로 답을 보고 다음 수식으로 넘어가요.'],
            ['10분 챌린지', '10분 동안 맞힌 수식의 개수가 점수예요. 막히면 넘기기로 다음 수식으로 가요. 로그인하면 랭킹에 오르고 1위에게 수식 신호등 아이콘이 주어져요. 도중에 다른 탭이나 앱으로 3번 이상 넘어가면 그 기록은 순위에 들어가지 않아요.'],
            ['친구·공개방', '2~4명이 같은 수식을 동시에 풀어요. 라운드는 3판 또는 5판, 라운드 시간은 2분·3분·5분 중에서 고르고, 한 라운드에 12번까지 낼 수 있어요.'],
            ['대결 점수', '먼저 맞힌 순서대로 점수를 받아요. 4명이면 4·3·2·1점, 3명이면 3·2·1점, 2명이면 2·1점. 다른 사람의 신호 색은 보이지만 글자는 라운드가 끝나야 보여요.'],
            ['1:1 출제 대결', '둘이 3분 동안 상대가 풀 9칸 수식을 내요(계산이 맞아야 제출돼요. 시간이 지나면 무작위 수식). 그다음 8분 동안 동시에 상대의 수식을 맞히고, 한 사람당 12번까지 낼 수 있어요. 맞힌 쪽이 이기고, 둘 다 맞히면 제출이 적은 쪽, 같으면 더 빨리 맞힌 쪽이 이겨요. 내 수식은 끝날 때까지 내 기기에만 있고, 끝나면 서로 공개해 신호가 맞았는지 확인해요.'],
          ] },
          { type: 'p', text: '챌린지와 대결은 속도가 점수예요. 완벽하게 하나로 좁힐 때까지 기다리기보다, 후보가 둘셋일 때 가장 그럴듯한 것을 내서 신호를 한 번 더 받는 편이 대개 빨라요. 챌린지에서 한 수식에 2분 넘게 묶여 있다면 넘기는 게 이득이에요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '초록', def: '글자와 자리가 모두 맞은 칸.' },
            { term: '노랑', def: '정답에 있지만 다른 자리에 있는 글자. 그 자리에는 없다는 뜻이기도 해요.' },
            { term: '빨강', def: '정답에 없거나, 정답에 있는 개수보다 많이 쓴 글자.' },
            { term: '탐색 줄', def: '정답을 노리지 않고 글자 정보를 모으려고 내는 제출. 성립하지 않아도 돼요.' },
            { term: '결괏값', def: '등호 오른쪽의 수. 오른쪽 칸 수가 자릿수예요.' },
            { term: '너들(Nerdle)', def: '워들의 수식판 퍼즐. 수식 신호등은 여기에 제곱을 더한 규칙과 닮았어요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '수식 신호등은 어떤 게임인가요?', a: '넷플릭스 「데블스 플랜: 데드 어게인」(데블스 플랜 3) 결승전 3회전에 나온 게임이에요. 9칸짜리 숨은 수식을 맞히는 게임으로, 낸 수식의 칸마다 초록·노랑·빨강 신호가 켜져 정답과 얼마나 가까운지 알려 줘요.' },
      { q: '초록, 노랑, 빨강은 무슨 뜻인가요?', a: '초록은 그 숫자나 기호가 정확한 자리에 있다는 뜻, 노랑은 정답 수식에 있지만 다른 자리라는 뜻, 빨강은 정답 수식에 없다는 뜻이에요. 정답에 있는 개수보다 많이 쓴 글자도 빨강이 돼요.' },
      { q: '계산이 안 맞는 수식도 낼 수 있나요?', a: '네. 제출하는 수식은 성립하지 않아도 되고 기호를 연달아 써도 돼요. 정답 수식만 올바른 등식이에요. 그래서 처음 한두 번은 새 글자를 모으는 탐색 줄로 쓰는 게 좋아요.' },
      { q: '몇 번 만에 맞힐 수 있나요?', a: '글자를 고르게 모으면 세 번째나 네 번째에 맞히는 경우가 많아요. 두 줄로 서로 다른 글자 9개를 다 찾으면 남은 건 순서뿐이라, 문법과 계산으로 답이 하나로 정해지기도 해요.' },
      { q: '무료인가요? 가입해야 하나요?', a: '무료이고 가입 없이 바로 할 수 있어요. 로그인하면 10분 챌린지 기록이 랭킹에 올라가고, 1위에게는 수식 신호등 아이콘이 주어져요.' },
      { q: '친구와 서로 문제를 내고 맞힐 수 있나요?', a: '네. 친구 방이나 공개방에서 「1:1 출제 대결」을 고르면 돼요. 둘이 3분 동안 상대가 풀 수식을 내고, 동시에 상대의 수식을 맞혀요. 맞힌 쪽이 이기고, 둘 다 맞히면 제출이 적은 쪽, 같으면 더 빨리 맞힌 쪽이 이겨요.' },
    ],
    cta: { title: '첫 신호를 켜 볼까요?', body: '혼자 연습으로 두 줄 탐색을 익힌 뒤 10분 챌린지에 도전해 보세요.', button: '수식 신호등 하러 가기' },
    disclaimer: '수식 신호등은 넷플릭스 「데블스 플랜: 데드 어게인」에 등장한 게임의 규칙을 참고한 비공식 팬 게임이며, 넷플릭스 및 제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: "Equation Signal strategy — the Devil's Plan 3 final game, narrowing the equation | PUZZLTHINK",
      description: "How to solve Equation Signal from The Devil's Plan 3 final in fewer guesses: reading green, yellow and red, counting symbols, where operators can go, a worked example that pins the answer in two guesses, and tips for the challenge and rooms.",
      keywords: ['Equation Signal strategy', 'Equation Signal rules', "Devil's Plan 3 final game", 'Nerdle strategy', 'equation guessing game tips', 'math wordle'],
    },
    title: 'Equation Signal strategy guide',
    lead: 'Sometimes two rows of signals leave only one equation.',
    intro: [
      'Equation Signal is a deduction game about a hidden 9-cell equation. Fill nine cells, submit, and every cell lights up: **green** means that symbol is in that cell, **yellow** that it is in the equation somewhere else, **red** that it is not in the equation — or all its copies are already counted. Nine greens and you have it.',
      'This guide is about turning signals into information: what a red says about counts, which cells the equation’s grammar rules out, how the size of the result helps, and a worked example in which two submissions leave a single possible answer. It ends with tips for practice, the 10-minute challenge and rooms with friends.',
    ],
    gamePageTitle: "Equation Signal online — the Devil's Plan 3 final game, rules and tips",
    summary: 'Reading signals, counting symbols, operator placement and a two-guess example.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "Equation Signal was the third game of the final of Netflix's The Devil's Plan: Dead Again (season 3). It is close to Nerdle, the equation version of Wordle, with one extra symbol: **the power sign (^)**. On the show each finalist wrote the equation the other had to find; PUZZLTHINK generates the equations, so you can play alone or race 2–4 players on the same one. A **1:1 puzzle duel** room plays it the show's way: each of you writes the other's equation." },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**The answer**: a true equation of 9 cells using the digits 0–9 and + − × ÷ = ^. Symbols may repeat, and there is at least one equals sign.',
            '**Its grammar**: no operators side by side, none at the start or end, no numbers with a leading zero (07), no implied multiplication, no division by zero.',
            '**Your guesses are free**: a guess need not be true, need not contain =, and may put operators side by side. It only has to fill nine cells.',
            '**Signals**: first, cells with the right symbol in the right place turn green. Then, from left to right, a cell turns yellow if the answer still has an uncounted copy of its symbol, otherwise red.',
            '**Order of operations**: powers, then × and ÷, then + and −. Equal ranks go left to right; chained powers go right to left.',
          ] },
          { type: 'h3', text: 'What the generated equations look like' },
          { type: 'list', items: [
            'Mostly an expression with 1–3 operators on the left and its value on the right; now and then an expression on both sides (3×4=2×6).',
            'The value is a whole number from 1 to 99,999 — never negative, zero or a fraction.',
            'At most one power per equation, with a base of 2–12 and an exponent of 2 or 3. No ^0, ^1 or chained powers.',
            '× and ÷ are followed by 2 or more. Nothing that does no work, like +0, ×1 or ÷1.',
            'At least three different digits, so the equation always gives you something to work with.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky signals',
        blocks: [
          { type: 'cards', items: [
            { title: 'The same symbol twice', body: 'Submit 3 twice and get one green and one red: the answer has **exactly one** 3. Red does not only mean "absent" — it means "no more than this".' },
            { title: 'Yellow and red together', body: 'If the answer has one 4, and you play two 4s both in wrong places, the left one is yellow and the right one red, because yellows are handed out from the left.' },
            { title: 'Green beats yellow', body: 'If a cell on the right is green, a copy of the same symbol further left can come back red: greens are counted first and only the copies left over make yellows.' },
            { title: 'Powers come first', body: '2+3^2 is 2+9 = 11. 2×3^2 = 18 and 3^2×2 = 18 — the power binds only the two numbers beside it.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — collect symbols with your first two rows',
        blocks: [
          { type: 'p', text: 'Spend your first two guesses finding out **which symbols are in the equation** rather than aiming for the answer. The answer uses at most 9 of the 16 symbols, so two rows of varied symbols uncover nearly all of them.' },
          { type: 'list', ordered: true, items: [
            '**First row**: mix the common operators (+, −, ×, ÷) with different digits, and put = somewhere in cells 6–8 to learn about its position too. Guesses do not have to be true, so cram in symbols freely.',
            '**Second row**: use every digit you have not tried yet. After two rows you know most of 0–9 and which operators appear.',
            '**From the third row, real candidates**: build a true equation from what is left. Keep greens in place and move yellows.',
            '**Find the equals sign first**: once = is green the frame stands — the number of cells to its right is the number of digits in the result.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Count the symbols', text: 'Once greens and yellows have shown you nine different symbols, the answer uses each of them exactly once. All that is left is the order.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — two rows to a single answer',
        lead: 'The answer is 48÷6+7=15. The signals were computed exactly as the game computes them.',
        blocks: [
          signal('en', G1, M1, 'Guess 1: 12+3×4=24 (a true equation to start)'),
          { type: 'p', text: 'The = in cell 7 is green, so the right side is a **two-digit result**. 1, + and 4 are yellow, so they are in the answer; 2, 3 and × are red, so they are not. Two 4s were played and only the first is yellow, so there is just one 4. The yellows also say 1 is not in cell 1, + not in cell 3 and 4 not in cell 6.' },
          signal('en', G2, M2, 'Guess 2: 98÷7−6=50 (false, but it collects new symbols)'),
          { type: 'p', text: '8 (cell 2) and ÷ (cell 3) are green; 7, 6 and 5 are yellow; 9, 0 and − are red. Count what is confirmed: = 8 ÷ 1 + 4 7 6 5 — **nine different symbols**. There are nine cells, so each is used exactly once, and there is no ^.' },
          { type: 'steps', items: [
            { title: 'Build the frame', body: 'Cell 2 is 8, cell 3 is ÷, cell 7 is =. Cell 1 starts a number, so it is a digit, and cells 8–9 are the two digits of the result. The + must be in cell 4, 5 or 6.' },
            { title: 'Place the +', body: 'In cell 4 it would sit right after ÷; in cell 6 the left side would end with an operator. Both break the grammar, so + is in cell 5: □8÷□+□=□□.' },
            { title: 'Place the digits 1, 4, 5, 6, 7', body: 'Cell 1 cannot be 1 (yellow in guess 1), so the first number is 48, 58, 68 or 78. From the yellows, 7 is not in cell 4, 4 and 6 are not in cell 6, and 5 is not in cell 8.' },
            { title: 'Filter with division and digits', body: '48÷6 = 8 and 8+7 = 15 — and the leftover digits are exactly 1 and 5. Everything else fails: 48÷1 = 48 cannot reach a two-digit result made of the remaining digits, and 78÷6 = 13 would give 13+1 = 14, which needs two 1s.' },
            { title: 'Guess 3: 48÷6+7=15', body: 'Nine greens. The two rows of signals really did leave one answer — checking every possible 9-cell string leaves this equation alone.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — grammar and digit counts',
        blocks: [
          { type: 'p', text: 'The answer is a grammatical equation, so far fewer symbols fit each cell than you might think. These rules alone cut the options sharply.' },
          { type: 'list', items: [
            '**Cell 1 and the cell after = are digits**: equations do not start with an operator and results start with a digit. Cell 9 is a digit too.',
            '**Operators never touch**: the cells beside an operator are digits, so two operators are always at least one cell apart.',
            '**No leading zeros**: a 0 cannot follow an operator or = or sit in cell 1 unless it is the number 0 on its own. Generated equations avoid +0 and ×0, so a 0 usually ends or sits inside a number.',
            '**Match the sizes**: two digits times two digits gives three or four; two digits divided by one usually gives one or two. Check the left side against the number of cells right of =.',
            '**Division divides evenly**: the result is a whole number, so with ÷ the number before it is usually a multiple of the one after.',
          ] },
          { type: 'h3', text: 'When there is a power' },
          { type: 'p', text: 'Powers use a base of 2–12 and an exponent of 2 or 3, so their values are a short list. Squares: 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144. Cubes: 8, 27, 64, 125, 216, 343, 512, 729, 1000, 1331, 1728. If ^ is green or yellow, the cell after it is 2 or 3 — and if one of those is red, it is the other.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — spend a row to split candidates',
        blocks: [
          { type: 'p', text: 'With three or four candidates left, a row that **gives each candidate a different signal** can be faster than guessing one of them. If the candidates are 48÷6+7=15, 48÷8+9=15 and 45÷9+7=12, one row with different symbols in the cells where they differ (2, 4, 6, 9) tells all three apart.' },
          { type: 'list', items: [
            '**New symbols in solved cells**: repeating a green symbol in its green cell teaches nothing. In a probing row, put an unknown symbol there instead.',
            '**Test for repeats**: if you suspect a repeated digit (11, 100), play it twice. A red second copy means one; yellow or green means two or more.',
            '**Expressions on both sides**: a green = in cell 4 or 5 can mean the right side is an expression too (3×4=2×6), with an operator of its own.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Reading red as "never"**: if you played a symbol twice, red tells you how many there are.',
            '**Forgetting where yellows were**: yellow also means "not in this cell". Do not put it back there.',
            '**Order-of-operations slips**: 3+4×2 is 11. Powers, then × and ÷, first.',
            '**Ungrammatical candidates**: equations with touching operators or leading zeros can never be the answer. Only play them as probes.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — practice, 10-minute challenge, rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Good to know'], rows: [
            ['Practice', 'Unlimited guesses. Stuck? Give up to see the answer and move on.'],
            ['10-minute challenge', 'Your score is the number of equations solved in 10 minutes; skip to move on. Signed in, you are ranked and first place gets the Equation Signal icon. Switching to another tab or app 3 times or more voids the run for the ranking.'],
            ['Friend and open rooms', '2–4 players solve the same equation at once: 3 or 5 rounds, 2, 3 or 5 minutes a round, up to 12 guesses a round.'],
            ['Room scoring', 'Points by finishing order: 4-3-2-1 with four players, 3-2-1 with three, 2-1 with two. You see everyone’s colours, but their symbols only after the round.'],
            ['1:1 puzzle duel', 'Each of you has 3 minutes to write a true 9-cell equation for the other (a random one if time runs out). Then you both find the other’s at once: 8 minutes, up to 12 guesses each. Solving wins; if both solve, fewer guesses wins, then the faster solve. Your equation stays on your device until the end, when both are revealed and checked against the signals.'],
          ] },
          { type: 'p', text: 'In the challenge and in rooms, speed is the score. Rather than waiting until only one candidate remains, play the likeliest of two or three and get another row of signals. In the challenge, if one equation has held you for over 2 minutes, skipping usually pays.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Green', def: 'Right symbol, right cell.' },
            { term: 'Yellow', def: 'In the answer but elsewhere — and so not in this cell.' },
            { term: 'Red', def: 'Not in the answer, or more copies played than it has.' },
            { term: 'Probe', def: 'A guess made to collect symbols, not to hit the answer. It does not have to be true.' },
            { term: 'Result', def: 'The number right of =. The cells it fills give its number of digits.' },
            { term: 'Nerdle', def: 'The equation version of Wordle. Equation Signal plays like it with powers added.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is Equation Signal?', a: "A game from the third round of the final of Netflix's The Devil's Plan: Dead Again (season 3). You find a hidden 9-cell equation; every cell of your guess lights green, yellow or red to show how close it is." },
      { q: 'What do green, yellow and red mean?', a: 'Green: that digit or symbol is in the right cell. Yellow: it is in the equation, but elsewhere. Red: it is not in the equation — or you used it more times than the equation does.' },
      { q: 'Can I submit an equation that is not true?', a: 'Yes. Guesses need not be true and may even have operators side by side; only the answer is a proper equation. That is why your first one or two rows are best used as probes for new symbols.' },
      { q: 'How many guesses does it take?', a: 'Collecting symbols evenly, three or four guesses is common. If two rows reveal all nine different symbols, only their order is left, and grammar and arithmetic can pin the answer down.' },
      { q: 'Is it free? Do I need an account?', a: 'It is free and needs no account. Sign in and your 10-minute challenge results go on the ranking, where first place earns the Equation Signal icon.' },
      { q: 'Can I write a puzzle for a friend?', a: 'Yes: open a 1:1 puzzle duel, as a friend room or an open room. Each of you writes an equation for the other in 3 minutes, then you both solve at once. Solving wins; if both solve, fewer guesses wins, then the faster solve.' },
    ],
    cta: { title: 'Ready for the first signal?', body: 'Practise the two-row probe alone, then take on the 10-minute challenge.', button: 'Play Equation Signal' },
    disclaimer: "Equation Signal is an unofficial fan game based on a game from Netflix's The Devil's Plan: Dead Again and is not affiliated with Netflix or the producers.",
  },
};
export default guide;
