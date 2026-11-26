import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'myeongdang',
  kind: 'final',
  when: { ko: '결승', en: 'Final' },
  episode: { ko: '9화', en: 'Episode 9' },
  related: ['blindGomoku', 'gradation', 'colorlink'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '명당 규칙 — 데스게임2 결승, 풍수 속성을 외우며 터를 채우는 퍼즐',
      description: '넷플릭스 데스게임2 결승 명당의 규칙을 정리했어요. 8×8 터와 1–5칸 타일 21쌍, 산·들·강·나무·집·재해 주사위, 타일 나눠 갖기와 100초 배치, 기록 없이 외우는 속성, 밀집 구역(7칸)과 명당(5속성 5칸) 선언, 재해와 종료 조건까지.',
      keywords: ['명당', '데스게임2 명당', '데스게임 결승', '넷플릭스 데스게임', '타일 배치 게임'],
    },
    title: '명당 — 데스게임2 결승',
    name: '명당',
    lead: '같은 타일을 나눠 받아 각자의 터에 놓아요. 주사위가 정한 풍수 속성은 적어 둘 수 없어서, 어디에 무엇을 놓았는지 외워야 해요.',
    summary: '같은 타일을 나눠 받아 8×8 터에 놓고, 외워 둔 속성으로 "명당"과 "밀집 구역"을 선언하는 1:1 결승.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 2명.',
        '**터**: 각자 8×8 판(1–64번 좌표).',
        '**타일**: 1–5칸짜리 타일 21종을 두 사람이 한 쌍씩 나눠 가져요.',
        '**주사위**: 육각기둥. 눈은 산·들·강·나무·집·재해.',
        '**선**: 준결승 1라운드 승자.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '주사위', body: '차례인 사람이 주사위를 굴려 속성을 정해요.' },
        { title: '타일 고르기', body: '굴린 사람이 타일 하나를 골라 상대와 한 쌍을 나눠 가져요. 그 타일에는 주사위의 속성이 붙어요.' },
        { title: '배치 (100초)', body: '두 사람 모두 자기 터의 원하는 곳에 타일을 놓아요. 시간을 넘기면 −1점이에요. 타일의 속성은 **기록하지 않고 외워야** 해요.' },
        { title: '선언', body: '차례와 상관없이, 조건을 이룬 좌표와 이름을 정확히 선언하면 점수를 받아요. 이뤄도 선언하지 않으면 점수가 없고, 좌표나 이름이 틀리면 −1점이에요.' },
      ] },
      { type: 'table', head: ['조합', '조건', '점수'], rows: [
        ['밀집 구역', '같은 속성 7칸이 가로·세로·대각선 한 방향으로 연속. 산맥(산)·광야(들)·바다(강)·숲(나무)·마을(집)', '1점'],
        ['명당', '한 방향으로 연속된 5칸에 산·들·강·나무·집이 하나씩', '3점'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '남은 타일이 없거나, 주사위를 굴린 사람이 남은 공간에 어떤 타일도 놓을 수 없으면 끝나요.',
        '점수가 높은 사람이 우승하고, 같으면 명당을 더 많이 만든 사람이 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**재해**: 타일을 놓지 않고, 각자 상대 터에서 아직 부서진 적 없는 칸 하나를 골라 부숴요. 부서진 칸에는 다시 놓을 수 있고, 이미 얻은 점수는 그대로예요. 다만 같은 좌표 조합으로는 다시 점수를 얻을 수 없어요. 재해는 턴을 쓰지 않아, 같은 사람이 다시 굴려요.',
        '굴린 사람이 고른 타일을 **상대만** 놓을 수 없으면, 상대가 1점을 잃고 게임은 계속돼요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '명당은 **같은 재료, 다른 설계**의 게임이에요. 두 사람이 똑같은 타일과 속성을 받으니, 점수 차는 오직 배치와 기억에서 나와요.' },
      { type: 'cards', items: [
        { title: '명당이 밀집 구역보다 세 배', body: '명당은 5칸에 3점, 밀집 구역은 7칸에 1점이에요. 다섯 속성을 한 줄에 섞는 명당이 칸당 효율이 훨씬 높아요. 한 칸이 가로·세로·대각선 여러 줄에 동시에 들어갈 수 있어서, 속성을 체스판처럼 엇갈리게 배치하면 한 칸이 여러 명당에 쓰여요(같은 좌표 조합은 한 번만 점수).' },
        { title: '기억이 곧 점수', body: '선언해야만 점수가 나고, 틀리면 감점이에요. 64칸의 속성을 외우기는 어려우니, 속성을 일정한 규칙(예: 줄마다 산·들·강·나무·집 순서)으로 놓는 사람이 기억 부담을 크게 줄여요. 설계 자체를 외우기 쉽게 만드는 것이 전략이에요.' },
        { title: '타일을 고르는 쪽의 공격', body: '주사위를 굴린 사람이 타일을 고르고, 상대도 같은 타일을 받아요. 상대 터의 빈 공간에 맞지 않는 큰 타일을 고르면 상대만 못 놓아 1점을 잃게 할 수 있어요. 상대의 빈칸 모양을 기억하는 것이 공격 수단이에요.' },
        { title: '재해는 상대의 줄을 끊는 수', body: '재해 때 상대 터의 한 칸을 부술 수 있어요. 이미 얻은 점수는 그대로지만, 상대가 완성하려던 줄의 핵심 칸을 부수면 계획을 무너뜨릴 수 있어요. 상대가 무엇을 노리는지 읽어야 쓸 수 있는 수예요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '킹도미노 (Kingdomino)', players: '2–4명', alike: '타일을 골라 자기 영토 판에 놓고, 같은 지형을 모아 점수를 내는 타일 배치 게임이에요.', differs: '킹도미노는 지형이 타일에 그려져 있어 외울 필요가 없고, 고른 타일을 나눠 갖지 않아요.' },
      { name: '빙고', players: '2명 이상', alike: '판 위에서 가로·세로·대각선 한 줄을 조건대로 채우면 점수가 나는 구조예요.', differs: '빙고는 칸이 미리 정해져 있고 뽑힌 숫자를 지우기만 해요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 타일 21종의 모양은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Myeongdang rules — Death Game 2 (The Risk Takers season 2), final',
      description: 'The rules of Myeongdang (명당), the final of Netflix’s Death Game season 2: an 8×8 plot and 21 pairs of 1–5 cell tiles, a die of mountain, field, river, tree, house and disaster, sharing tiles and 100 seconds to place, memorising attributes, declaring dense zones (seven) and myeongdang (five attributes in five), disasters and the end.',
      keywords: ['Myeongdang', 'Death Game 2 final', 'tile placement game', 'The Risk Takers season 2'],
    },
    title: 'Myeongdang — Death Game 2, final',
    name: 'Myeongdang',
    lead: 'Both players get the same tiles for their own plots. The feng-shui attribute the die gives them cannot be written down — you must remember what you put where.',
    summary: 'A 1:1 final: share identical tiles, place them on an 8×8 plot and declare remembered patterns for points.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two finalists.',
        '**Plot**: an 8×8 board each, cells numbered 1–64.',
        '**Tiles**: 21 kinds of 1–5 cell tiles, one of each kind per player.',
        '**Die**: hexagonal: mountain, field, river, tree, house, disaster.',
        '**First player**: the semifinal round-1 winner.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Roll', body: 'The active player rolls for an attribute.' },
        { title: 'Choose', body: 'They choose a tile kind; both players take one, carrying that attribute.' },
        { title: 'Place (100 seconds)', body: 'Both place their tile anywhere on their plot; over time costs a point. Attributes must be **memorised, not written**.' },
        { title: 'Declare', body: 'At any time, name the coordinates and name of a completed pattern to score; undeclared patterns score nothing and a wrong declaration costs a point.' },
      ] },
      { type: 'table', head: ['Pattern', 'Needs', 'Points'], rows: [
        ['Dense zone', 'Seven of one attribute in a row (any line): range, plain, sea, forest, village', '1'],
        ['Myeongdang', 'Five consecutive cells holding mountain, field, river, tree and house once each', '3'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        'It ends when the tiles run out or the roller cannot place any tile in their remaining space.',
        'Higher score wins; ties go to more myeongdang.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Disaster**: no tile; each player destroys one never-destroyed cell on the other’s plot. It may be refilled and points already scored stay, but the same coordinates cannot score the same pattern again. A disaster uses no turn; the same player rolls again.',
        'If the chosen tile fits only the roller’s plot, the opponent loses a point and play continues.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Myeongdang is **same materials, different designs**: both get identical tiles and attributes, so the gap comes only from placement and memory.' },
      { type: 'cards', items: [
        { title: 'Myeongdang pays triple', body: 'Three points for five cells against one for seven: mixing all five attributes in a line is far more efficient. A cell sits on several lines at once, so staggering attributes lets one cell serve several myeongdang (each set of coordinates scoring once).' },
        { title: 'Memory is the score', body: 'Only declarations score and mistakes cost. Sixty-four cells are hard to remember, so placing attributes by a fixed rule (say mountain–field–river–tree–house along each row) slashes the memory load. Designing for memorability is strategy.' },
        { title: 'Choosing tiles to attack', body: 'The roller picks a tile both must place; choosing one that will not fit the opponent’s gaps costs them a point. Remembering their empty spaces is a weapon.' },
        { title: 'Disaster breaks lines', body: 'A disaster destroys a cell on the opponent’s plot; points are kept, but hitting the key cell of a line they were building wrecks the plan — if you have read what they are aiming for.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Kingdomino', players: '2–4', alike: 'Choose tiles for your own kingdom and score by grouping terrains.', differs: 'Terrain is printed on the tiles and the chosen tile is not shared.' },
      { name: 'Bingo', players: '2+', alike: 'Fill a line across, down or diagonally to score.', differs: 'The grid is fixed in advance; you only mark drawn numbers.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The shapes of the 21 tiles are not reproduced.',
  },
};

export default game;
