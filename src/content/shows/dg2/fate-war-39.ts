import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'fate-war-39',
  kind: 'tournament',
  when: { ko: '예선 1차', en: 'Qualifier 1' },
  episode: { ko: '1화', en: 'Episode 1' },
  related: ['hitStay', 'blackWhite', 'heavy13'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '운명전쟁39 규칙 — 데스게임2 예선 1차, 이길 횟수를 맞히는 카드 게임',
      description: '넷플릭스 데스게임2(최후의 승자) 예선 1차 운명전쟁39의 규칙을 정리했어요. 1–39 카드와 0 카드 5장·데스 카드, 라운드마다 늘어나는 패, 승수 예측과 동시 공개, 리버스(11의 배수)와 0·데스의 관계, 점수 정산과 히든 선언까지.',
      keywords: ['운명전쟁39', '데스게임2 운명전쟁39', '데스게임 시즌2', '데스게임2 최후의 승자', '넷플릭스 데스게임 게임'],
    },
    title: '운명전쟁39 — 데스게임2 예선 1차',
    name: '운명전쟁39',
    lead: '받은 카드로 이번 라운드에 몇 번 이길지 먼저 말하고, 정확히 그만큼 이겨야 점수를 받아요. 1부터 9장까지 패가 늘어나는 9라운드예요.',
    summary: '라운드마다 이길 판 수를 예측하고 정확히 맞히는 5인 카드 게임. 11의 배수는 승패 기준을 뒤집어요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 예선 참가자 5명.',
        '**카드 45장**: 1–39 숫자 카드 39장, 0 카드 5장, 데스 카드 1장.',
        '**라운드**: 9라운드. 1라운드에 한 장, 라운드마다 한 장씩 늘어 9라운드에는 9장을 받아요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '카드 확인', body: '이번 라운드의 패를 받아요.' },
        { title: '승수 예측', body: '이번 라운드에 몇 번(턴) 이길지 정해 동시에 공개해요. 불가능한 승수를 말하면 0승으로 쳐요.' },
        { title: '카드 대결', body: '1라운드는 한 장이라 동시에 내요. 2라운드부터는 직전 턴 승자가 먼저, 시계 방향으로 한 명씩 내요. 이기면 승리 표식 하나를 받아요.' },
        { title: '점수 정산', body: '라운드가 끝나면 예측과 표식 수를 비교해요.' },
      ] },
      { type: 'table', head: ['카드', '힘'], rows: [
        ['숫자 (1–39)', '기본은 높은 숫자가 이겨요.'],
        ['리버스 (11·22·33)', '나온 장수만큼 기준이 뒤집혀요. 1장이면 낮은 숫자가, 2장이면 다시 높은 숫자가, 3장이면 낮은 숫자가 이겨요.'],
        ['데스', '1 이상의 모든 숫자를 이기고, 리버스의 영향을 받지 않아요. 0에게는 져요.'],
        ['0', '데스를 이겨요. 단, 리버스·0·데스가 한 턴에 모두 나오면 데스가 이겨요.'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '예측이 맞으면 **승수 × 2**점을 받고, 틀리면 **오차 × 2**점을 잃어요.',
        '**0승을 예측**했다면 맞히거나 틀릴 때의 점수가 그 라운드 번호만큼이에요.',
        '9라운드 뒤 **점수가 가장 낮은 1명이 탈락**해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '각자 게임 중 한 번 **히든**을 쓸 수 있어요. 히든을 쓴 라운드에는 예측이 라운드가 끝날 때 공개돼요.',
        '리버스로 낮은 숫자가 이기는 턴에 0이 여러 장 나오면, 먼저 낸 0이 이겨요.',
        '라운드마다 점수 변동이 모두에게 공개돼요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '운명전쟁39는 **오 헬(Oh Hell)** 계열의 "정확히 맞히기" 트릭 게임이에요. 많이 이기는 게 목표가 아니라 말한 만큼만 이기는 게 목표라서, 강한 카드도 "원치 않는 승리"를 만드는 짐이 될 수 있어요.' },
      { type: 'cards', items: [
        { title: '예측은 패의 "확실한 승리" 수부터', body: '데스 카드나 아주 큰 숫자는 거의 확실한 승리예요. 반대로 0이나 작은 숫자는 거의 확실한 패배죠. 확실한 승리와 확실한 패배를 먼저 세고, 애매한 카드(중간 숫자)를 몇 개 이길지 추정해 더하는 방식이 기본이에요.' },
        { title: '리버스가 계산을 흔들어요', body: '11·22·33이 한 턴에 몇 장 나오느냐로 기준이 뒤집혀서, 큰 숫자가 갑자기 가장 약한 카드가 돼요. 리버스 카드를 쥔 사람은 그 턴의 승패를 상당 부분 조종할 수 있어서, "내가 이겨야 할 때 기준을 맞추는" 도구로 써요.' },
        { title: '나중에 내는 사람이 유리해요', body: '2라운드부터는 순서대로 카드를 공개하므로, 뒤에 내는 사람은 앞 카드를 보고 이기거나 질 카드를 고를 수 있어요. 직전 턴 승자가 먼저 내는 규칙 때문에, 이긴 사람이 다음 턴에 정보 면에서 불리해져요.' },
        { title: '0승 예측의 무게', body: '0승은 점수가 라운드 번호에 따라 정해져서, 후반 라운드의 0승 성공은 큰 점수예요. 하지만 패가 9장이나 되는 후반에 한 번도 이기지 않기는 어렵고, 다른 사람들이 일부러 져서 나를 이기게 만들 수도 있어요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '오 헬 (Oh Hell)', players: '3–7명', alike: '라운드마다 패의 장수가 바뀌고, 이길 트릭 수를 미리 말해 정확히 맞혀야 점수를 받아요. 운명전쟁39의 바탕과 같아요.', differs: '오 헬은 트럼프 무늬가 있고, 리버스나 데스 같은 특수 카드가 없어요.' },
      { name: '위저드 (Wizard)', players: '3–6명', alike: '라운드마다 패가 한 장씩 늘고, 모든 카드를 이기는 특수 카드와 지는 특수 카드가 있어요.', differs: '위저드는 무늬를 따라 내야 하고, 승패 기준을 뒤집는 카드가 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: 'Fate War 39 rules — Death Game 2 (The Risk Takers season 2), qualifier 1',
      description: 'The rules of Fate War 39 (운명전쟁39), the first qualifier of Netflix’s Death Game season 2: cards 1–39, five zeros and the Death card, a hand that grows each round, predicting your wins, reverse cards (multiples of 11), how 0 and Death interact, scoring and the hidden call.',
      keywords: ['Fate War 39', 'Death Game 2', 'The Risk Takers season 2', 'Netflix Death Game games'],
    },
    title: 'Fate War 39 — Death Game 2, qualifier 1',
    name: 'Fate War 39',
    lead: 'Say how many tricks you will win with the cards you hold — and win exactly that many. Nine rounds, the hand growing from one card to nine.',
    summary: 'A five-player trick game where you predict your exact wins each round; multiples of 11 flip what wins.',
    setup: [
      { type: 'list', items: [
        '**Players**: the five qualifiers.',
        '**45 cards**: 1–39, five 0 cards and one Death card.',
        '**Rounds**: nine; one card in round 1, one more each round, nine in round 9.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Cards', body: 'Receive the round’s hand.' },
        { title: 'Predict', body: 'Everyone reveals at once how many turns they will win; an impossible number counts as zero.' },
        { title: 'Play', body: 'Round 1’s single card is played simultaneously; from round 2 the last winner leads and players reveal clockwise one at a time. Each win earns a token.' },
        { title: 'Score', body: 'Predictions are compared with tokens at the end of the round.' },
      ] },
      { type: 'table', head: ['Card', 'Power'], rows: [
        ['Numbers 1–39', 'Normally the highest wins.'],
        ['Reverse (11, 22, 33)', 'Each one flips the direction: one makes low win, two high, three low again.'],
        ['Death', 'Beats every number from 1 up and ignores reverses; loses to 0.'],
        ['0', 'Beats Death — but if a reverse, a 0 and Death all appear in one turn, Death wins.'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        'A correct prediction scores **wins × 2**; a wrong one loses **the miss × 2**.',
        'For a **zero prediction**, the gain or loss equals the round number.',
        'After nine rounds **the lowest score is eliminated**.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Once per game a player may go **hidden**: that round their prediction is only revealed at the end.',
        'With low winning after a reverse, several 0s go to the earliest played.',
        'Score changes are shown to all after every round.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Fate War 39 belongs to the **Oh Hell** family of exact-bid trick games: the aim is to win exactly what you said, so a strong card can be a burden that forces an unwanted win.' },
      { type: 'cards', items: [
        { title: 'Count sure wins first', body: 'Death and very high numbers are near-certain wins, 0s and tiny numbers near-certain losses. Count those, then estimate how many middling cards will win.' },
        { title: 'Reverses shake everything', body: 'How many of 11, 22, 33 appear in a turn decides the direction, turning big cards into the weakest. Holding a reverse lets you steer a turn when you need it.' },
        { title: 'Playing late is an advantage', body: 'From round 2 cards are revealed in turn, so later players choose to win or lose seeing what came before. The winner leads next, so winning costs information.' },
        { title: 'The weight of zero', body: 'Zero scores by round number, so a late zero is big — but avoiding every win with nine cards is hard, and others can deliberately duck to hand you a trick.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Oh Hell', players: '3–7', alike: 'Hand size changes each round and you must predict and hit your exact trick count — the same basis.', differs: 'It has a trump suit and no reverse or Death cards.' },
      { name: 'Wizard', players: '3–6', alike: 'Hands grow by one each round, with special cards that always win or always lose.', differs: 'Suits must be followed, and nothing flips the direction.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
