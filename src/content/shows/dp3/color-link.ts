import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'color-link',
  kind: 'final',
  when: { ko: '7일차 결승 2회전', en: 'Day 7, final game 2' },
  site: 'colorLinkDuel',
  related: ['colorLinkDuel', 'colorlink', 'monorail'],
  updated: '2026-11-26',
  sources: [namuDay(7), siteEngine({ ko: '컬러 링크', en: 'Color Link' }, 'src/lib/colorLinkDuel.ts'), broadcast],
  ko: {
    meta: {
      title: '컬러 링크 규칙 — 데블스플랜3 결승 2회전, 같은 색 말을 잇는 길이 겹치면 안 돼요',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 결승 2회전 컬러 링크의 규칙을 정리했어요. 14색 28개 말, 한 번에 두 색 배치, 경로가 겹치지 않아야 하는 조건과 6칸 이상 규칙, 불가능 선언과 증명, 5라운드 3선승, 승부를 가르는 지점까지.',
      keywords: ['컬러 링크', '컬러링크', '데블스플랜3 컬러 링크', '데블스플랜3 결승', '데블스 플랜 3 결승 2회전', '컬러 링크 규칙', '불가능 선언'],
    },
    title: '컬러 링크 — 데블스플랜3 결승 2회전',
    name: '컬러 링크',
    lead: '같은 색 말 두 개를 잇는 길이 서로 겹치지 않게 말을 놓아요. 상대가 놓은 판이 더는 이어질 수 없다고 생각되면 "불가능"을 외쳐요.',
    summary: '같은 색끼리 이은 길이 겹치지 않도록 번갈아 말을 놓고, 불가능하다고 보이면 증명을 요구하는 1:1 대결.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 진출자 2명.',
        '**말**: 14가지 색, 색마다 2개씩 28개(A–N으로 표기).',
        '**게임판**: 라운드마다 시작할 때 공개되는 판.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '선후공', body: '1라운드는 동전 던지기로 정하고, 그다음부터는 직전 라운드에서 진 사람이 선후공을 골라요.' },
        { title: '첫 배치', body: '첫 차례에만 선 플레이어가 말 1개를 놓아요.' },
        { title: '배치', body: '그 뒤로는 각자 자기 차례에 3분 안에 **서로 다른 색의 말 2개**를 놓아요.' },
        { title: '불가능 선언', body: '상대가 놓고 나서 판이 조건을 어겼다고 판단하면 불가능을 선언할 수 있어요. 그러면 방금 놓은 사람이 5분 안에 판 위의 같은 색 말들을 모두 겹치지 않게 잇는 방법을 보여 줘야 해요.' },
      ] },
      { type: 'h3', text: '배치 조건' },
      { type: 'list', items: [
        '판 위의 모든 같은 색 쌍을 잇는다고 할 때, 그 **경로들이 서로 겹치거나 교차하지 않아야** 해요.',
        '아직 하나만 놓인 색도, 나중에 놓일 짝과 같은 방식으로 이어질 수 있어야 해요.',
        '한 쌍을 잇는 경로는 **말이 있는 칸을 포함해 6칸 이상**이어야 해요.',
      ] },
    ],
    win: [
      { type: 'list', items: [
        '불가능 선언 뒤 증명에 성공하면 **증명한 사람**이, 실패하면 **선언한 사람**이 승점 1점을 얻어요.',
        '3분 안에 말을 놓지 못하면 그 라운드에서 바로 져요.',
        '최대 5라운드, **먼저 3점을 얻은 사람**이 2회전을 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '하나만 놓인 색은, 아직 안 놓인 짝의 자리까지 증명하는 사람이 직접 정해서 이어질 수 있음을 보여 줘야 해요.',
        '한 차례에 놓는 두 말은 서로 다른 색이어야 해요.',
        '증명은 판 위의 모든 쌍을 한꺼번에 이어야 해요. 일부만 이을 수 있는 건 증명이 아니에요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '컬러 링크는 **판을 조금씩 좁혀 가다가, 상대가 판을 망가뜨린 순간을 잡아내는** 게임이에요. 내 차례에는 판이 여전히 풀릴 수 있게 놓아야 하고, 상대 차례 뒤에는 판이 아직 풀리는지 판단해야 해요.' },
      { type: 'cards', items: [
        { title: '두 가지 실력', body: '하나는 판이 풀리는지 빨리 판단하는 눈이고, 다른 하나는 실제로 모든 경로를 그려 증명하는 손이에요. 판이 풀린다고 믿고 놓았는데 5분 안에 증명하지 못하면 점수를 내줘요.' },
        { title: '불가능 선언의 계산', body: '선언이 맞으면 1점이지만, 상대가 증명해 내면 상대가 1점을 얻어요. 확신이 없으면 선언하지 않고 내 차례에 계속 놓아야 하는데, 이미 망가진 판에 말을 더 놓으면 이번엔 내가 선언당할 수 있어요.' },
        { title: '6칸 규칙의 효과', body: '같은 색을 바로 옆에 붙여 놓는 쉬운 해결이 막혀 있어서, 모든 쌍이 일정한 길이의 길을 차지해요. 말이 많아질수록 판의 빈칸이 빠르게 부족해지고, 어느 순간 갑자기 풀리지 않는 판이 돼요.' },
        { title: '선후공을 고르는 권리', body: '진 사람이 선후공을 고르므로, 판의 모양을 보고 어느 쪽이 유리한지 판단하는 능력도 필요해요. 첫 차례에 하나만 놓는 선과, 그다음부터 두 개씩 놓는 흐름 때문에 판이 막히는 차례가 누구에게 올지가 달라져요.' },
        { title: '지배 전략이 있을까요?', body: '판과 말이 모두 공개된 게임이라 이론상 끝까지 계산할 수 있지만, 경로의 조합이 너무 많아서 사람이 3분 안에 다 볼 수는 없어요. 상대가 판단하기 어려운 애매한 모양을 만들어 실수를 유도하는 쪽이 유리해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 컬러 링크는 방송 규칙(한 차례 두 색, 경로가 겹치지 않는 조건, 하나만 놓인 색의 짝까지 고려, 6칸 이상, 불가능 선언과 증명)을 그대로 구현했어요.',
        '방송의 7×7 판에 더해, 9×9–11×11 크기에 칸을 도려낸 **모양 판 12개**를 쓸 수 있어요. AI전은 고른 난이도에서 판을 무작위로 골라요.',
        '증명에 실패하면 가능한 경로 하나를 보여 줘요.',
      ] },
    ],
    similar: [
      { name: '트윅스트 (TwixT)', players: '2명', alike: '말과 말을 잇는 연결선이 서로 교차할 수 없어서, 판의 길을 먼저 차지하는 싸움이 돼요.', differs: '트윅스트는 내 색으로 판의 양쪽 끝을 잇는 경주이고, 같은 색끼리 짝을 맞추는 조건이 없어요.' },
      { name: '헥스 (Hex)', players: '2명', alike: '연결 경로가 서로를 막는 연결 게임이에요. 한쪽이 이으면 다른 쪽은 이을 수 없어요.', differs: '헥스는 육각 칸에 돌을 놓아 마주 보는 변을 잇고, 비기는 경우가 없어요.' },
      { name: '스프라우츠 (Sprouts)', players: '2명', alike: '점과 점을 잇는 선이 서로 교차할 수 없고, 더 그을 수 없는 쪽이 지는 종이·연필 게임이에요.', differs: '스프라우츠는 판이 없고 선을 그을 때마다 새 점이 생겨요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Color Link rules — The Devil's Plan 3, final game 2",
      description: "The rules of Color Link, the second game of The Devil's Plan: Dead Again (season 3) final: 28 pieces in 14 colours, placing two colours a turn, paths that must never cross and must be at least 6 cells, calling impossible and proving it, first to 3 points, and what decides it.",
      keywords: ['Color Link', "Devil's Plan 3 Color Link", "Devil's Plan final", 'Color Link rules'],
    },
    title: "Color Link — The Devil's Plan 3, final game 2",
    name: 'Color Link',
    lead: 'Place pieces so that the paths joining each colour’s pair never cross. If your opponent’s placement can no longer be solved, call it impossible.',
    summary: 'Take turns placing coloured pieces so every pair can still be joined without crossing; call impossible to demand proof.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two finalists.',
        '**Pieces**: 14 colours, two of each — 28 pieces (marked A–N).',
        '**Board**: revealed at the start of each round.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Who goes first', body: 'A coin decides round 1; after that the previous round’s loser chooses.' },
        { title: 'Opening', body: 'On the very first turn the first player places one piece.' },
        { title: 'Placing', body: 'After that, each turn you place **two pieces of different colours** within three minutes.' },
        { title: 'Calling impossible', body: 'After the opponent places, you may call impossible if you think the board breaks the conditions. The player who just placed must then show, within five minutes, a way to join every same-coloured pair without overlap.' },
      ] },
      { type: 'h3', text: 'Placement conditions' },
      { type: 'list', items: [
        'If every pair on the board were joined, **no two paths may overlap or cross**.',
        'A colour with one piece so far must still be joinable to its future partner the same way.',
        'A pair’s path must be **at least 6 cells long, counting the pieces’ cells**.',
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After an impossible call, a successful proof scores 1 for **the prover**; a failed one scores 1 for **the caller**.',
        'Failing to place within three minutes loses the round at once.',
        'Up to five rounds; **the first to 3 points** wins game 2.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'For a colour with only one piece down, the prover places its missing partner themselves as part of the proof.',
        'The two pieces of one turn must be different colours.',
        'A proof must join every pair at once; joining only some is not a proof.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Color Link is about **squeezing the board and catching the moment your opponent breaks it**. On your turn you must keep the board solvable; after theirs, you must judge whether it still is.' },
      { type: 'cards', items: [
        { title: 'Two skills', body: 'An eye for whether a board is still solvable, and the hands to draw every path as proof. Believing a board works but failing to prove it in five minutes gives away the point.' },
        { title: 'The cost of calling', body: 'A right call is a point; a successful proof gives the opponent the point. Without confidence you keep placing — but adding pieces to an already broken board lets them call it on you.' },
        { title: 'The six-cell rule', body: 'It forbids the easy fix of placing pairs side by side, so every pair claims a path of real length. Space runs out fast as pieces accumulate, and at some moment the board suddenly stops being solvable.' },
        { title: 'Choosing who goes first', body: 'The loser chooses, so reading which side a board favours matters. The single opening piece followed by pairs shifts whose turn the board will jam on.' },
        { title: 'Is there a dominant strategy?', body: 'Everything is visible, so in theory it can be calculated, but there are far too many path combinations to see in three minutes. Building ambiguous shapes that are hard to judge and inviting a mistake is the practical edge.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Color Link implements the broadcast rules: two colours a turn, no crossing paths, single pieces counted with their future partner, the six-cell minimum, and the impossible call with its proof.',
        'Besides the show’s 7×7 board there are **twelve shaped boards** (9×9 to 11×11 with cells cut out); an AI game deals a random board from the chosen difficulty.',
        'After a failed proof the site shows one possible way out.',
      ] },
    ],
    similar: [
      { name: 'TwixT', players: '2', alike: 'Links between pegs may never cross, so it becomes a fight over the board’s paths.', differs: 'It is a race to connect your two sides of the board, with no matching pairs of colours.' },
      { name: 'Hex', players: '2', alike: 'A connection game where one player’s path blocks the other’s.', differs: 'Stones go on hexagons to join opposite edges, and there are no draws.' },
      { name: 'Sprouts', players: '2', alike: 'A pencil-and-paper game where lines between dots may never cross and whoever cannot draw loses.', differs: 'There is no board, and each line adds a new dot.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
