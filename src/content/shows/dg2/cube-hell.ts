import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'cube-hell',
  kind: 'tournament',
  when: { ko: '예선 2차', en: 'Qualifier 2' },
  episode: { ko: '2화', en: 'Episode 2' },
  related: ['nonogram', 'starbattle', 'slitherlink'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '큐브 지옥 규칙 — 데스게임2 예선 2차, 질문으로 3×3×3 큐브 배열 추리',
      description: '넷플릭스 데스게임2 예선 2차 큐브 지옥의 규칙을 정리했어요. 4색 큐브 20개와 3×3×3 공간, 같은 색끼리 이어진 덩어리와 공중에 뜨지 않는 조건, 다섯 방향에서 세 칸을 골라 묻는 질문, 층별 파괴 선언과 종치기까지.',
      keywords: ['큐브 지옥', '큐브지옥', '데스게임2 큐브 지옥', '데스게임 시즌2', '공간 추리 게임'],
    },
    title: '큐브 지옥 — 데스게임2 예선 2차',
    name: '큐브 지옥',
    lead: '보이지 않는 3×3×3 공간에 색 큐브 20개가 쌓여 있어요. 어느 방향에서 어느 세 칸을 볼지 물어 가며, 맨 위층부터 배열을 맞혀 부숴요.',
    summary: '방향과 세 칸을 골라 보이는 큐브의 색과 개수를 묻고, 층별 배열을 맞혀 먼저 파괴하는 공간 추리 대결.',
    setup: [
      { type: 'list', items: [
        '**인원**: 예선 남은 4명.',
        '**큐브 20개**: 빨강·노랑·초록·파랑 각 5개.',
        '**공간**: 가상의 3×3×3(27칸). 같은 색 5개는 면끼리 이어진 한 덩어리이고, 아래가 빈 칸 위에 떠 있을 수 없어요(물리적으로 가능한 모양).',
        '**방향**: 바닥을 뺀 다섯 방향(동·서·남·북·위). 각 방향에서 본 면에 1–9번 칸이 매겨져 있어요.',
        '필기도구를 쓸 수 있어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '질문 (내 차례 1분)', body: '방향 하나를 고르고, 그 면에서 서로 면으로 맞닿은 **서로 다른 세 칸**을 골라 물어요(대각선 연결은 안 돼요).' },
        { title: '답', body: '딜러가 그 방향에서 보이는 큐브의 **색과 개수**를 알려 줘요. 순서는 실제 배치와 상관없이 빨강·노랑·초록·파랑 순으로 말해요. 맨 앞 칸이 비어 있으면 그 뒤에 보이는 큐브의 색을 말해요.' },
        { title: '층 파괴', body: '위에서 내려다본 1–9번 칸에 어떤 색 큐브가 있는지를 선언해 9칸을 정확히 맞히면 그 층이 부서져 없어져요. 3층 → 2층 → 1층 순서로만 부술 수 있고, 그 층에 실제로 있는 큐브만 말해야 해요.' },
        { title: '종 치기', body: '파괴 도전은 내 차례가 아니어도 종을 쳐서 언제든 할 수 있어요. 단, 선언 뒤 1분 동안은 다시 도전할 수 없어요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**큐브 파괴에 성공한 사람은 바로 승리**해 본선으로 가고 게임에서 빠져요.',
        '끝까지 살아남지 못한 **1명이 탈락**해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '1분 안에 질문하지 못하면 차례가 넘어가요.',
        '정리 자료만으로는 "파괴 성공"이 한 층인지 세 층 모두인지가 다소 모호해요. 이 페이지는 위층부터 차례로 부수어 나간다는 규칙만 적었어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '큐브 지옥은 **질문 설계의 게임**이에요. 한 번에 세 칸만 볼 수 있고, 답은 색의 순서 없이 개수만 알려 주므로, 어느 방향에서 어떤 세 칸을 고르느냐가 정보의 양을 정해요.' },
      { type: 'cards', items: [
        { title: '조건이 경우의 수를 크게 줄여요', body: '같은 색 5개가 한 덩어리이고 공중에 뜨지 않는다는 두 조건이 강력해요. 예를 들어 위에서 본 칸이 비어 있다면 그 기둥 전체가 비었거나 아래층만 차 있다는 뜻이고, 쌓임 규칙 때문에 3층에 있는 큐브 밑은 반드시 다 차 있어요.' },
        { title: '위에서의 질문이 가장 직접적이에요', body: '파괴 선언은 위에서 본 배열로 하므로, 위(TOP) 방향 질문이 맨 위층의 답에 가장 가까워요. 하지만 위에서 보이는 큐브가 3층인지 2층인지는 알 수 없어서, 옆 방향 질문으로 높이를 확인해야 해요.' },
        { title: '세 칸을 겹치게 고르세요', body: '한 줄의 세 칸, ㄱ자 모양의 세 칸처럼 모양을 바꿔 가며 이전 질문과 두 칸을 겹치면, 바뀐 한 칸의 색을 알아낼 수 있어요. 차이로 정보를 얻는 방식이 질문 횟수를 아껴요.' },
        { title: '남의 답도 내 정보', body: '모두의 질문과 답이 공개되는지에 따라 전략이 달라져요. 공개된다면 다른 사람의 좋은 질문에 올라타 내 차례 전에 종을 치는 것이 가장 빠른 길이에요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '블랙 박스 (Black Box)', players: '2명', alike: '판 가장자리에서 빛을 쏘아 보내 나오는 결과로, 안에 숨은 원자의 배치를 추리해요. 바깥에서 본 정보로 내부를 맞히는 점이 같아요.', differs: '블랙 박스는 평면 격자이고 색이 없어요.' },
      { name: '마스터마인드 (Mastermind)', players: '2명', alike: '색과 개수에 대한 피드백만으로 숨은 배열을 좁혀 가요.', differs: '마스터마인드는 한 줄짜리 배열이고, 공간이나 쌓임 조건이 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 질문과 답이 다른 참가자에게 공개되는지는 확인하지 못했어요.',
  },
  en: {
    meta: {
      title: 'Cube Hell rules — Death Game 2 (The Risk Takers season 2), qualifier 2',
      description: 'The rules of Cube Hell (큐브 지옥), the second qualifier of Netflix’s Death Game season 2: twenty cubes in four colours in a 3×3×3 space, connected colours and no floating cubes, asking about three cells from one of five directions, destroying layers from the top, and ringing in.',
      keywords: ['Cube Hell', 'Death Game 2', 'The Risk Takers season 2', 'spatial deduction game'],
    },
    title: 'Cube Hell — Death Game 2, qualifier 2',
    name: 'Cube Hell',
    lead: 'Twenty coloured cubes are stacked in an unseen 3×3×3 space. Ask what you see from a direction and three cells, then name each layer from the top to destroy it.',
    summary: 'Ask which colours show through three cells from a direction, then be first to name and destroy the layers.',
    setup: [
      { type: 'list', items: [
        '**Players**: the four remaining qualifiers.',
        '**20 cubes**: five each of red, yellow, green and blue.',
        '**Space**: a virtual 3×3×3. Each colour’s five cubes form one face-connected group, and no cube floats over an empty cell.',
        '**Directions**: five (east, west, south, north, top), each face numbered 1–9.',
        'Writing is allowed.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Ask (one minute)', body: 'Choose a direction and **three different, edge-connected cells** on that face (no diagonals).' },
        { title: 'Answer', body: 'The dealer gives **the colours and counts** visible there, always listed red, yellow, green, blue regardless of position; if a front cell is empty, the colour behind it counts.' },
        { title: 'Destroy a layer', body: 'Name which colour sits in each of cells 1–9 seen from the top; get all nine right and that layer is destroyed. Layers go top, middle, bottom, and only cubes actually in that layer may be named.' },
        { title: 'Ring in', body: 'Destruction can be attempted at any time by ringing the bell, but not again for a minute after a declaration.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**A successful destruction wins at once**: that player advances and leaves the game.',
        '**The one left at the end is eliminated.**',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'No question within the minute ends the turn.',
        'The source is slightly unclear whether "destroying the cube" means one layer or all three; this page only states that layers are destroyed from the top down.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Cube Hell is **about designing questions**. Only three cells per question, and answers give counts without order, so the choice of direction and cells decides how much you learn.' },
      { type: 'cards', items: [
        { title: 'The constraints do heavy lifting', body: 'Connected colours and no floating cubes are powerful: an empty top view means an empty column or only lower layers filled, and any top-layer cube has full support beneath it.' },
        { title: 'Top questions are most direct', body: 'Declarations are made from the top, so top questions get closest to the answer — but they cannot tell layer 3 from 2, so side views are needed for height.' },
        { title: 'Overlap your triples', body: 'Change shape (a line, an L) while sharing two cells with a previous question, and the difference reveals the third. Learning by difference saves questions.' },
        { title: 'Others’ answers', body: 'If questions and answers are public, riding on someone else’s good question and ringing before your turn is the fastest route.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Black Box', players: '2', alike: 'Deduce atoms hidden inside from rays fired in from the edges — inferring the interior from outside views.', differs: 'It is a flat grid with no colours.' },
      { name: 'Mastermind', players: '2', alike: 'Narrow down a hidden arrangement from colour and count feedback.', differs: 'A single row, with no space or stacking rules.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Whether questions and answers were public to other players could not be confirmed.',
  },
};

export default game;
