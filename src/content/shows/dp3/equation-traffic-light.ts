import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'equation-traffic-light',
  kind: 'final',
  when: { ko: '7일차 결승 3회전', en: 'Day 7, final game 3' },
  site: 'equationSignal',
  related: ['equationSignal', 'equationTower', 'hiddenWord'],
  updated: '2026-11-26',
  sources: [namuDay(7), siteEngine({ ko: '수식 신호등', en: 'Equation Signal' }, 'src/lib/equationSignal.ts'), broadcast],
  ko: {
    meta: {
      title: '수식 신호등 규칙 — 데블스플랜3 결승 3회전, 9칸 수식 맞히기',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 결승 3회전 수식 신호등의 규칙을 정리했어요. 9칸 정답 수식 만들기와 금지 사항, 아무 수식이나 제시하기, 빨강·노랑·초록 판정과 중복 처리, 동시 정답 재경기, 승부를 가르는 지점까지.',
      keywords: ['수식 신호등', '수식신호등', '데블스플랜3 수식 신호등', '데블스플랜3 결승', '데블스 플랜 3 결승 3회전', '수식 신호등 규칙', '수식 워들'],
    },
    title: '수식 신호등 — 데블스플랜3 결승 3회전',
    name: '수식 신호등',
    lead: '상대가 숨긴 9칸짜리 수식을 맞혀요. 내가 낸 수식의 칸마다 빨강·노랑·초록 불이 켜져요.',
    summary: '빨강·노랑·초록 힌트로 상대가 만든 9칸 수식을 먼저 맞히는 1:1 추리 대결.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 진출자 2명.',
        '**기호**: 숫자 0–9와 ＋, －, ×, ÷, ＝, ^. 같은 기호를 여러 번 써도 돼요.',
        '**정답 수식**: 각자 5분 안에 9칸짜리 수식 하나를 만들어 몰래 내요. 상대는 이 수식을 맞혀야 해요.',
      ] },
      { type: 'callout', tone: 'note', title: '정답 수식의 조건', text: '수식은 실제로 성립해야 하고 등호가 하나 이상 있어야 해요. 기호를 연달아 붙여 쓰거나, 0으로 시작하는 수를 쓰거나, 곱셈 기호 없이 숫자를 붙여 곱으로 치는 것은 모두 안 돼요.' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '수식 제시', body: '5분 안에 숫자와 기호로 9칸을 채워 제출해요. 이때는 정답 수식의 조건을 지키지 않아도 괜찮아요. 성립하지 않는 수식도 낼 수 있어요.' },
        { title: '색깔 공개', body: '상대 정답과 비교해 칸마다 색이 켜져요. **빨강**은 그 기호가 정답에 없음, **노랑**은 있지만 자리가 다름, **초록**은 자리까지 맞음이에요.' },
        { title: '반복', body: '제시와 색깔 공개를 되풀이하며 상대 수식을 좁혀 가요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '내가 낸 수식의 **9칸이 모두 초록**이면 이겨요.',
        '두 사람이 같은 차례에 동시에 맞히면, 한쪽만 이길 때까지 다시 해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '제시한 수식에 어떤 기호가 정답보다 많이 들어 있으면, 정답에 든 개수를 넘는 **뒤쪽의 같은 기호는 빨강**으로 판정돼요.',
        '5분 안에 제출하지 못하면 그 차례에는 색깔 공개가 없어요.',
        '상대 수식을 맞히는 데 쓰는 제시 수식은 아무렇게나 만들어도 돼요. 정보를 얻으려고 일부러 성립하지 않는 수식을 내는 것도 허용돼요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '수식 신호등은 단어 대신 수식을 쓰는 추리 게임처럼 보이지만, 결승답게 **두 사람이 동시에 출제자이자 해결자**예요. 상대의 수식을 빨리 맞히는 실력과, 내 수식을 맞히기 어렵게 만드는 실력이 모두 필요해요.' },
      { type: 'cards', items: [
        { title: '정답을 노리지 말고 정보를 사세요', body: '제시 수식은 성립하지 않아도 되므로, 초반에는 서로 다른 기호를 최대한 많이 넣어 무엇이 들어 있는지부터 확인하는 게 효율적이에요. 9칸에 아홉 가지 기호를 넣으면 한 번에 아홉 가지를 검사할 수 있어요.' },
        { title: '등호의 자리', body: '등호는 하나 이상 반드시 있고, 맨 앞이나 맨 뒤에는 올 수 없어요(기호로 시작하거나 끝나면 성립하지 않으니까요). 등호 위치가 정해지면 양쪽 길이가 정해지고, 가능한 수식의 범위가 크게 줄어요.' },
        { title: '중복 판정 활용', body: '같은 기호를 여러 번 넣으면, 몇 번째부터 빨강이 되는지로 그 기호가 정답에 몇 개인지 알 수 있어요. 숫자가 반복되는 수식(예: 11 같은 수)을 찾는 데 특히 유용해요.' },
        { title: '내 수식을 어렵게', body: '상대도 같은 방법으로 추리하므로, 같은 숫자를 반복하거나 ^처럼 잘 쓰지 않는 기호를 넣으면 맞히기 어려워져요. 다만 수식이 반드시 성립해야 하니 고를 수 있는 모양에는 한계가 있어요.' },
        { title: '지배 전략이 있을까요?', body: '가능한 9칸 수식의 수는 유한해서, 이론상으로는 매번 남은 후보를 가장 많이 줄이는 제시를 고르는 최적 전략이 있어요. 하지만 5분 안에 사람이 그 계산을 다 할 수는 없어서, 실전에서는 기호 확인 → 등호 위치 → 숫자 배치 순으로 좁혀 가는 방법이 현실적이에요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 수식 신호등은 방송의 9칸, 사용 기호, 빨강·노랑·초록 판정과 중복 처리를 그대로 따라요. 계산은 ^를 먼저(오른쪽부터), 그다음 ×÷, 마지막으로 +−를 해요.',
        '방송에서는 결승 진출자가 서로의 수식을 만들었지만, **사이트에서는 게임이 정답 수식을 만들어요.** 그래서 혼자서도, 친구 2–4명이 동시에도 같은 수식을 맞힐 수 있어요.',
        '친구전에서는 모두가 서로의 색깔은 보지만 기호는 자기 것만 보고, 맞힌 순서대로 점수를 받아요.',
      ] },
    ],
    similar: [
      { name: '마스터마인드 (Mastermind)', players: '2명', alike: '숨겨진 색 조합을 맞히고, "자리까지 맞음"과 "있지만 자리가 다름" 두 가지 힌트를 받는 구조가 수식 신호등과 같아요.', differs: '마스터마인드는 한쪽만 출제하고, 조합에 계산이 맞아야 한다는 조건이 없어요.' },
      { name: '숫자야구 (Bulls and Cows)', players: '2명', alike: '서로 숨긴 숫자를 스트라이크·볼 힌트로 동시에 맞혀 가는 종이·연필 게임이에요. 두 사람이 동시에 출제자이자 해결자라는 점이 같아요.', differs: '숫자야구는 몇 개가 맞았는지 개수만 알려 주고, 칸별 색깔은 알려 주지 않아요.' },
      { name: '블랙 박스 (Black Box)', players: '2명', alike: '질문을 하나씩 던져 받은 반응으로 숨겨진 배치를 좁혀 가는 추리 게임이에요.', differs: '블랙 박스는 격자 속 원자의 위치를 빛줄기가 꺾이는 모양으로 추리해요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Equation Traffic Light rules — The Devil's Plan 3, final game 3",
      description: "The rules of Equation Traffic Light (수식 신호등), the third game of The Devil's Plan: Dead Again (season 3) final: building a hidden nine-cell equation and what is forbidden, guessing with any nine cells, red/yellow/green feedback and duplicates, simultaneous solves, and what decides it.",
      keywords: ['Equation Traffic Light', 'Equation Signal', "Devil's Plan 3 final", 'equation guessing game', 'math Wordle'],
    },
    title: "Equation Traffic Light — The Devil's Plan 3, final game 3",
    name: 'Equation Traffic Light',
    lead: 'Guess the nine-cell equation your opponent hid. Every cell of your guess lights up red, yellow or green.',
    summary: 'A 1:1 deduction duel: solve the opponent’s nine-cell equation from red, yellow and green feedback first.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two finalists.',
        '**Symbols**: digits 0–9 and + − × ÷ = ^, each usable more than once.',
        '**Secret equation**: each writes one nine-cell equation within five minutes, hidden; the opponent must find it.',
      ] },
      { type: 'callout', tone: 'note', title: 'What a secret equation must be', text: 'It must be true and contain at least one equals sign. Two symbols side by side, a number starting with 0, or digits placed together to mean multiplication are all forbidden.' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Guess', body: 'Within five minutes, submit any nine cells of digits and symbols. A guess need not follow the rules of a secret equation, and need not be true.' },
        { title: 'Lights', body: 'Each cell is compared with the opponent’s equation: **red** — not in it; **yellow** — in it, elsewhere; **green** — right symbol, right place.' },
        { title: 'Repeat', body: 'Guess and read the lights again and again, narrowing it down.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**All nine cells green** wins.',
        'If both solve on the same turn, they replay until only one does.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'If a guess holds more copies of a symbol than the equation does, **the extra copies toward the end are red**.',
        'Missing the five-minute limit means no lights that turn.',
        'Guesses can be anything; a deliberately false equation used to gather information is allowed.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'It looks like a word-guessing game with maths, but as a final it makes **both players setter and solver at once**: you need to crack theirs fast and make yours hard to crack.' },
      { type: 'cards', items: [
        { title: 'Buy information, not answers', body: 'Guesses need not be true, so early on pack in as many different symbols as possible to learn what is there; nine different symbols test nine things at once.' },
        { title: 'Where the equals sign goes', body: 'There is at least one, and never at either end (an expression cannot start or end on a symbol). Once its place is known, both sides’ lengths are fixed and the candidates shrink a lot.' },
        { title: 'Using the duplicate rule', body: 'Repeat a symbol and see from which copy it turns red: that tells you how many the equation has — especially useful for repeated digits like 11.' },
        { title: 'Make yours hard', body: 'The opponent reasons the same way, so repeated digits and rarely used symbols like ^ make yours harder, within the limits of an equation that must be true.' },
        { title: 'Is there a dominant strategy?', body: 'The set of possible nine-cell equations is finite, so in theory there is an optimal guess that cuts the remaining candidates most each time. No one can compute that in five minutes, so in practice you narrow down symbols, then the equals sign, then the digits.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Equation Signal keeps the nine cells, the symbol set, and the red/yellow/green feedback with its duplicate rule. ^ is evaluated first (right to left), then × ÷, then + −.',
        'On the show each finalist wrote the other’s equation; **on the site the board writes it**, so you can play alone or with 2–4 friends solving the same equation at once.',
        'With friends, everyone sees the colours of every guess but only their own symbols, and points go by finishing order.',
      ] },
    ],
    similar: [
      { name: 'Mastermind', players: '2', alike: 'Find a hidden code from two kinds of feedback, "right place" and "right symbol, wrong place".', differs: 'Only one player sets the code, and it need not satisfy any arithmetic.' },
      { name: 'Bulls and Cows', players: '2', alike: 'A pencil-and-paper game where both players guess each other’s hidden number at once from feedback.', differs: 'You learn only how many are right, not which cells.' },
      { name: 'Black Box', players: '2', alike: 'Probe one question at a time and narrow down a hidden layout from the responses.', differs: 'You deduce atoms in a grid from how rays of light are deflected.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
