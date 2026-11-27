import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'mine-of-oblivion-2',
  kind: 'tournament',
  when: { ko: '6강 2차', en: 'Last six, match 2' },
  episode: { ko: '6화', en: 'Episode 6' },
  site: 'mineOblivion',
  related: ['mineOblivion', 'blindGomoku', 'russianRoulette'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '망각의 지뢰 2 규칙 — 데스게임2 6강, 외워 둔 지뢰밭에서 보물 찾기',
      description: '넷플릭스 데스게임2 6강 2차 망각의 지뢰 2의 규칙을 정리했어요. 11×11 판과 보물 3곳, 지뢰 12개·시한폭탄 3개 비밀 설치, 표시되지 않는 지뢰 위치, 8방향 이동과 주변 지뢰 수만큼의 점수, 지뢰·폭발 −5점, 보물 +15·+20·+25, 종료 조건까지.',
      keywords: ['망각의 지뢰', '망각의 지뢰 2', '데스게임2 망각의 지뢰', '지뢰 찾기 게임', '넷플릭스 데스게임'],
    },
    title: '망각의 지뢰 2 — 데스게임2 6강',
    name: '망각의 지뢰 2',
    lead: '서로의 지뢰를 몰래 묻고 시작해요. 판에는 아무것도 표시되지 않아서, 내가 묻은 곳도 외워 둬야 해요.',
    summary: '지뢰와 시한폭탄을 몰래 묻은 판 위를 걸으며 주변 지뢰 수만큼 점수를 얻고 보물을 찾는 1:1 기억력 대결.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1.',
        '**판**: 11×11. 가운데와, 대각선으로 마주 보는 두 모서리에 **보물**이 있어요. 나머지 두 모서리가 각자의 출발 지점이에요.',
        '**지뢰 12개**(각 1점 가치)와 **시한폭탄 3개**(각 2점 가치, 1–3번)를 각자 10분 안에 몰래 설치해요.',
        '**설치 금지 구역**: 양쪽 출발 지점에서 가로·세로 2칸 이내, 그리고 보물 칸. 한 칸에 하나씩만 놓을 수 있어요(두 사람의 것이 겹칠 수는 있어요).',
        '설치된 칸의 **개수**는 공개되지만 **위치**는 표시되지 않고, 필기도 못 해요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '이동', body: '추첨으로 선후를 정해, 차례마다 내 말을 둘러싼 8칸 중 한 곳으로 옮겨요. 상대 말이 있는 칸으로는 못 가요.' },
        { title: '점수 획득', body: '옮긴 칸에 지뢰·폭탄이 없으면, 둘레 8칸의 지뢰·폭탄 수만큼 점수를 받아요(한 칸에 둘이면 2점). 누군가 한 번 점수를 받은 칸은 다시 밟아도 점수가 없어요.' },
        { title: '지뢰 밟음', body: '누가 묻은 지뢰든 밟으면 −5점이고, 출발지 주변 3칸 중 한 곳으로 돌아가요. 밟힌 지뢰는 사라져요.' },
        { title: '시한폭탄', body: '"n번 시한폭탄 발동"을 선언하면 상대의 2턴 뒤에 터져, 둘레 9칸 안에 있는 사람이 −5점을 받고 출발지로 돌아가요. 한 턴에 하나만 발동할 수 있고, 출발 구역은 피해를 받지 않아요.' },
        { title: '보물', body: '보물 칸에 도착하면 찾은 순서대로 +15, +20, +25점이에요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**보물 3개가 모두 발견되거나 70턴을 넘기면** 끝나고, 점수가 높은 쪽이 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '발동하지 않은 시한폭탄 칸을 밟으면 터지지 않고, 그 칸을 뺀 둘레 8칸의 점수를 받아요.',
        '시한폭탄이 터져도 주변 지뢰는 없어지지 않아요. 지뢰와 폭탄이 한 칸에 있으면 밟을 때 지뢰만 사라져요.',
        '같은 칸에 두 사람의 지뢰가 겹쳐 있으면 밟을 때 둘 다 사라져요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '망각의 지뢰는 **내 지뢰가 나에게도 위험한** 게임이에요. 판에 표시가 없어서, 상대 지뢰는 추리로, 내 지뢰는 기억으로 피해야 해요.' },
      { type: 'cards', items: [
        { title: '점수는 지뢰 옆에 있어요', body: '점수는 둘레의 지뢰 수만큼이라, 안전하게 점수를 벌려면 지뢰 바로 옆을 걸어야 해요. 내 지뢰를 기억하고 있으면 그 옆이 가장 안전한 점수 밭이에요. 그래서 지뢰를 묻을 때부터 "내가 밟고 다닐 길"을 함께 설계하는 것이 좋아요.' },
        { title: '보물로 가는 길목', body: '보물이 25점까지 커서 지뢰 몇 번의 손해를 상쇄해요. 상대가 보물로 가는 가장 짧은 길목에 지뢰를 몰아 묻으면, 상대는 돌아가거나 위험을 감수해야 해요. 반대로 상대도 내 길목을 노리니, 보물 세 곳 중 어느 쪽을 먼저 갈지가 수읽기예요.' },
        { title: '시한폭탄은 2턴 예고', body: '발동하면 상대 2턴 뒤에 터지므로, 상대가 그 사이 범위를 벗어날 수 있어요. 상대가 보물이나 좁은 길목에 들어가 빠져나오기 어려울 때 발동해야 효과가 있어요. 폭탄도 점수 계산에 포함돼(2점 가치) 숫자 정보를 흐리는 역할을 해요.' },
        { title: '숫자는 정보예요', body: '어떤 칸에서 받은 점수(둘레 지뢰 수)가 공지되므로, 상대가 지나간 칸의 숫자를 모으면 지뢰 위치를 지뢰 찾기처럼 추리할 수 있어요. 기억과 추리를 함께 하는 사람이 유리해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '지뢰 찾기 (Minesweeper)', players: '1명', alike: '칸을 열 때마다 둘레의 지뢰 수가 나오고, 그 숫자로 지뢰 위치를 추리하는 바탕이 같아요.', differs: '지뢰 찾기는 혼자 하는 컴퓨터 퍼즐이고, 지뢰를 직접 묻거나 기억할 필요가 없어요.' },
      { name: '배틀십 (Battleship)', players: '2명', alike: '서로 몰래 배치한 것을 상대가 찾아내는 숨겨진 배치 게임이에요.', differs: '배틀십은 상대 판을 맞히는 게임이고, 같은 판을 함께 걸어 다니지 않아요.' },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 망각의 지뢰는 **시즌 1 규칙**이 바탕이에요: 지뢰 15개씩(시즌 2는 지뢰 12개 + 시한폭탄 3개), 보물 +10·+15·+20(시즌 2는 +15·+20·+25).',
        '**시한폭탄은 없어요.** 한 가지 규칙을 제대로 다듬기 위해 시즌 2의 폭탄 발동 규칙은 넣지 않았어요.',
        '시즌 2에서 **70턴 제한**을 가져왔어요(양쪽 합쳐 70수). 같은 점수는 무승부예요.',
        '숫자는 화면에 잠깐 보였다 사라지고, 발자국과 터진 자리는 판에 남아요. 돌아갈 칸은 직접 골라요.',
      ] },
    ],
    sourceNote: ONE_SOURCE_KO + ' 시즌 1의 「망각의 지뢰」를 바꾼 버전이에요.',
  },
  en: {
    meta: {
      title: 'Mine of Oblivion 2 rules — Death Game 2 (The Risk Takers season 2), last six',
      description: 'The rules of Mine of Oblivion 2 (망각의 지뢰2) from Netflix’s Death Game season 2: an 11×11 board with three treasures, twelve mines and three time bombs laid secretly, unmarked positions, moving in eight directions and scoring the mines around you, −5 for mines and blasts, treasure worth 15, 20 and 25, and the end conditions.',
      keywords: ['Mine of Oblivion', 'Death Game 2', 'minesweeper board game', 'The Risk Takers season 2'],
    },
    title: 'Mine of Oblivion 2 — Death Game 2, last six',
    name: 'Mine of Oblivion 2',
    lead: 'Both players secretly bury mines before starting. Nothing is marked on the board — you have to remember even your own.',
    summary: 'A 1:1 memory duel: walk a board seeded with secret mines and bombs, scoring the mines around you and racing to treasure.',
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1.',
        '**Board**: 11×11, with **treasure** in the centre and in two diagonally opposite corners; the other two corners are the starting points.',
        '**Twelve mines** (worth 1 each) and **three time bombs** (worth 2, numbered 1–3) per player, placed secretly within ten minutes.',
        '**No-go zones**: within two cells orthogonally of either start, and treasure cells; one item per cell (though both players’ items may share a cell).',
        'How many cells are mined is public; where is not, and no notes are allowed.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Move', body: 'After a draw for order, move to any of the eight surrounding cells, never onto the opponent.' },
        { title: 'Score', body: 'On a clear cell, score the mines and bombs in the eight around it (a double cell counts 2). A cell already scored by anyone scores nothing again.' },
        { title: 'Mine', body: 'Stepping on any mine costs 5 points and sends you to one of three cells by your start; that mine is removed.' },
        { title: 'Time bomb', body: 'Declare "bomb n" and it explodes after the opponent’s second turn, costing 5 points and a return to start to anyone in its nine cells. One per turn; start zones are safe.' },
        { title: 'Treasure', body: 'Reaching treasure scores +15, +20 and +25 in order of discovery.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**All three treasures found, or 70 turns passed**: the higher score wins.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'An unarmed bomb stepped on does not explode; you score the eight cells around it.',
        'Explosions do not clear mines; a cell with a mine and a bomb loses only the mine when stepped on.',
        'Two players’ mines on one cell are both removed when stepped on.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'In Mine of Oblivion **your own mines are dangerous to you too**: nothing is marked, so the opponent’s must be deduced and yours remembered.' },
      { type: 'cards', items: [
        { title: 'Points live next to mines', body: 'You score the mines around you, so safe scoring means walking right beside mines. Your own remembered mines make the safest fields, so plan your route as you bury them.' },
        { title: 'Choke points to treasure', body: 'Treasure up to 25 outweighs a few blasts. Mining the opponent’s shortest path forces detours or risks; they will do the same, so which treasure to go for first is the read.' },
        { title: 'Bombs come with notice', body: 'A bomb explodes two opponent turns later, giving them time to leave. Trigger it when they are deep in treasure or a narrow passage. Bombs also count in the numbers, muddying them.' },
        { title: 'Numbers are information', body: 'Scores announced on each cell are mine counts, so collecting the numbers on the opponent’s route lets you deduce mines like Minesweeper. Memory plus deduction wins.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Minesweeper', players: '1', alike: 'Opening a cell shows how many mines surround it, and you deduce positions from the numbers.', differs: 'A solo computer puzzle: you never bury mines or have to remember them.' },
      { name: 'Battleship', players: '2', alike: 'Each side hides an arrangement the other must find.', differs: 'You target the other’s grid instead of walking a shared board.' },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Mine of Oblivion is built on the **season 1 rules**: 15 mines each (season 2: 12 mines and 3 time bombs) and treasure +10 +15 +20 (season 2: +15 +20 +25).',
        '**No time bombs.** One mode done properly instead of two; season 2’s bomb rules are left out.',
        'From season 2 it keeps the **70-turn limit** (70 moves in all). Equal scores draw.',
        'Numbers show for a moment and fade; footprints and craters stay on the board. You pick your respawn cell.',
      ] },
    ],
    sourceNote: ONE_SOURCE_EN + ' A revised version of season 1’s Mine of Oblivion.',
  },
};

export default game;
