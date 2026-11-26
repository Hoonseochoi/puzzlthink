// 데스게임 season 1, matches 5–8: 쇼 미 더 코인, 망각의 지뢰, 말 달리자, 진실의 고개.
import { dg1Game } from './make';

export const showMeTheCoin = dg1Game('show-me-the-coin', 5, ['blackWhite2', 'indianPoker', 'twoSidedPoker'], {
  meta: {
    title: '쇼 미 더 코인 규칙 — 데스게임 5회차, 개수만 보이는 코인 베팅',
    description: '넷플릭스 데스게임 5회차 쇼 미 더 코인의 규칙을 정리했어요. 칩 30개와 코인 50개(500·100·50·10), 개수만 공개되는 비밀 코인 제출과 "1개 차이" 규칙, 포커식 베팅, 합계 비교, 남은 코인 7개 이하의 최종 라운드와 환전까지.',
    keywords: ['쇼 미 더 코인', '데스게임 쇼 미 더 코인', '넷플릭스 데스게임', '데스게임 5회차', '코인 베팅 게임'],
  },
  title: '쇼 미 더 코인 — 데스게임 5회차',
  name: '쇼 미 더 코인',
  lead: '코인을 몇 개 냈는지는 보이지만, 무슨 코인인지는 안 보여요. 그 합계를 두고 칩을 걸어요.',
  summary: '값이 다른 코인을 몰래 내고 개수만 보여 준 채 칩을 거는 1:1 베팅 게임. 낸 코인은 돌아오지 않아요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**칩**: 각자 30개.',
      '**코인 50개**: 500코인 3개, 100코인 7개, 50코인 10개, 10코인 30개.',
      '**선**: 1라운드는 추첨, 그 뒤로는 번갈아 맡아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '코인 제출', body: '선이 코인 2–6개를 몰래 내고, 후는 선과 **개수가 최대 1개 차이**가 나도록 내요. 개수만 공개되고, 낸 코인은 돌려받지 못해요.' },
      { title: '베팅', body: '칩 1개씩 기본 베팅을 하고 일반 포커처럼 베팅해요.' },
      { title: '공개', body: '같은 칩이 걸리면 낸 코인을 공개해 **합계가 큰 쪽**이 판돈을 가져가요. 한쪽이 포기하면 코인을 공개하지 않고 상대가 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '어느 한쪽의 남은 코인이 7개 이하가 되면 그 라운드가 마지막이에요. 끝나면 500코인을 뺀 남은 코인을 **20코인당 칩 1개**로 바꿔요.',
      '바꾼 뒤 **칩이 많은 사람**이 이겨요. 진행 중 칩이 0개가 되면 바로 져요(환전 없음).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '합계가 같거나 마지막 칩 수가 같을 때의 처리는 확인되지 않았어요.',
      '500코인은 환전되지 않으므로, 끝까지 남은 500코인은 아무 가치가 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '쇼 미 더 코인은 **세 가지 예산**을 함께 관리하는 게임이에요. 이기려고 쓰는 코인, 거는 칩, 그리고 끝에 칩으로 바뀔 남은 코인이요.' },
    { type: 'cards', items: [
      { title: '500코인은 써야 하는 돈', body: '500코인은 끝에 환전되지 않으니 세 개를 언제 쓰느냐가 큰 판을 정해요. 상대가 500을 몇 개 썼는지는 공개된 판에서만 알 수 있으므로, 공개된 합계로 상대의 남은 500을 세는 것이 중요해요.' },
      { title: '개수는 거짓말을 못 해요', body: '개수는 보이니, 6개를 낸 사람은 적어도 합이 60이고, 2개를 낸 사람은 500 두 개일 수도 있어요. 적은 개수가 오히려 큰 금액일 수 있다는 점이 허세의 재료예요. 후는 개수를 선에 맞춰야 해서, 선의 개수 선택이 판의 성격을 정해요.' },
      { title: '포기는 코인만 잃어요', body: '포기하면 판돈 칩은 잃지만 기본 베팅 정도로 손해를 줄일 수 있고, 코인은 이미 낸 뒤라 어차피 사라져요. 그래서 코인을 아껴 낸 판에서는 일찍 포기하고, 큰 코인을 낸 판에서 크게 거는 리듬이 생겨요.' },
      { title: '끝내는 타이밍', body: '남은 코인이 7개 이하가 되면 마지막 판이에요. 10코인을 많이 남기면 환전으로 칩이 되지만, 그만큼 승부에 쓸 수 없어요. 칩 차이가 클 때는 빨리 코인을 써 게임을 끝내는 것이 앞선 사람에게 유리해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '포 세일 (For Sale)', players: '3–6명', alike: '한정된 예산을 여러 라운드에 나눠 쓰고, 끝에 남은 돈도 점수에 더해지는 구조예요.', differs: '포 세일은 공개 입찰이고 칩 베팅이 없어요.' },
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '액면이 다른 돈 카드로 입찰하고, 끝에 남은 돈도 승패에 영향을 줘요.', differs: '하이 소사이어티는 공개 경매이고, 베팅이 없어요.' },
  ],
}, {
  meta: {
    title: 'Show Me the Coin rules — Death Game (The Risk Takers) match 5',
    description: 'The rules of Show Me the Coin from Netflix’s Death Game season 1: 30 chips and 50 coins (500, 100, 50, 10), secret coin submissions where only the count shows and the one-coin difference rule, poker-style betting, comparing totals, and the last round with seven coins or fewer and the exchange.',
    keywords: ['Show Me the Coin', 'Death Game match 5', 'The Risk Takers', 'betting game'],
  },
  title: 'Show Me the Coin — Death Game match 5',
  name: 'Show Me the Coin',
  lead: 'You can see how many coins were played, not which. Bet chips on whose total is bigger.',
  summary: 'A 1:1 betting game: play coins of hidden value with only their count shown, then bet chips; played coins never return.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Chips**: 30 each.',
      '**50 coins**: three 500s, seven 100s, ten 50s, thirty 10s.',
      '**First player**: drawn, then alternating.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Coins', body: 'The leader secretly plays 2–6 coins; the other plays a number **within one** of that. Only counts are shown; coins played are gone.' },
      { title: 'Betting', body: 'Ante a chip each and bet as in poker.' },
      { title: 'Reveal', body: 'If bets are matched, coins are revealed and **the higher total** takes the pot; a fold hands it over without revealing.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'When either player has seven or fewer coins left, that round is the last; afterwards all coins except 500s convert at **20 per chip**.',
      '**More chips** wins; reaching zero chips loses at once (no exchange).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How equal totals or equal final chips are resolved could not be confirmed.',
      '500s are not exchanged, so any left at the end are worthless.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Show Me the Coin juggles **three budgets**: coins to win rounds, chips to bet, and leftover coins that become chips.' },
    { type: 'cards', items: [
      { title: '500s must be spent', body: 'They are worthless at the end, so when you spend your three shapes the big rounds. Count the opponent’s remaining 500s from revealed totals.' },
      { title: 'Counts cannot lie', body: 'Six coins guarantee at least 60; two coins might be two 500s. Few coins can mean a big total — material for bluffing — and since the reply must match the count, the leader sets the round’s character.' },
      { title: 'Folding only loses chips', body: 'Coins are spent anyway, so fold rounds where you played cheap and bet big where you played big.' },
      { title: 'When to end it', body: 'Seven coins left triggers the last round. Hoarding 10s gives chips at exchange but nothing to fight with; a leader benefits from spending fast to finish.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'For Sale', players: '3–6', alike: 'A limited budget split over several rounds, with leftover money counting at the end.', differs: 'Bids are open and there is no chip betting.' },
    { name: 'High Society', players: '3–5', alike: 'Bid with money cards of different values; leftover money matters at the end.', differs: 'Auctions are open and there is no betting.' },
  ],
});

export const mineOfOblivion = dg1Game('mine-of-oblivion', 6, ['blindGomoku', 'russianRoulette', 'wallgo'], {
  meta: {
    title: '망각의 지뢰 규칙 — 데스게임 6회차, 외워 둔 지뢰밭에서 보물 찾기',
    description: '넷플릭스 데스게임 6회차 망각의 지뢰의 규칙을 정리했어요. 11×11 판과 보물 3곳, 지뢰 15개 비밀 설치와 금지 구역, 표시되지 않는 지뢰, 8방향 이동과 주변 지뢰 수만큼의 점수, 지뢰 −5점, 보물 +10·+15·+20, 연습 게임까지.',
    keywords: ['망각의 지뢰', '데스게임 망각의 지뢰', '넷플릭스 데스게임', '데스게임 6회차', '지뢰 찾기 게임'],
  },
  title: '망각의 지뢰 — 데스게임 6회차',
  name: '망각의 지뢰',
  lead: '각자 지뢰 15개를 몰래 묻고, 아무 표시 없는 판 위를 걸어 보물을 찾아요. 내가 묻은 지뢰도 밟으면 터져요.',
  summary: '지뢰를 묻은 판을 걸으며 주변 지뢰 수만큼 점수를 얻고 보물을 찾는 1:1 기억·추리 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**판**: 11×11. 가운데와 대각선으로 마주 보는 두 모서리에 보물, 나머지 두 모서리가 출발 지점이에요.',
      '**지뢰**: 각자 15개를 10분 안에 몰래 설치해요. 출발 지점에서 가로·세로 2칸 이내와 보물 칸에는 못 놓아요. 서로 모르니 한 칸에 두 개가 겹칠 수도 있어요.',
      '지뢰 칸의 **개수**만 공개되고 위치는 표시되지 않으며, 필기도 못 해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '이동', body: '추첨으로 선후를 정하고, 차례마다 둘레 8칸 중 하나로 옮겨요. 상대 말이 있는 칸은 안 돼요.' },
      { title: '점수', body: '지뢰가 없는 칸이면 둘레 8칸의 지뢰 수만큼 점수를 받아요(두 개 겹친 칸은 2점). 누가 이미 점수를 받은 칸은 다시 점수가 없어요.' },
      { title: '지뢰', body: '누구의 것이든 밟으면 −5점, 출발지 주변 3칸 중 하나로 돌아가요. 밟힌 지뢰는 모두 사라져요.' },
      { title: '보물', body: '찾은 순서대로 +10, +15, +20점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['**보물 3개가 모두 발견되면** 바로 끝나고, 점수가 높은 쪽이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '본게임 전에 9×9 판, 지뢰 12개로 연습 게임을 해요.',
      '시즌 2의 「망각의 지뢰 2」와 달리 시한폭탄은 없고, 보물 점수가 조금 낮아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '망각의 지뢰는 **지뢰 찾기를 둘이 동시에, 기억으로** 하는 게임이에요. 내 지뢰는 외워서 피하고, 상대 지뢰는 공지되는 숫자로 추리해요.' },
    { type: 'cards', items: [
      { title: '지뢰는 점수 밭이에요', body: '점수는 둘레 지뢰 수만큼이니, 내 지뢰 옆을 걷는 것이 가장 안전한 득점이에요. 지뢰를 몰아서 묻으면 그 근처가 고득점 지역이 되지만, 상대도 그 숫자를 보고 위험 지역을 피해요.' },
      { title: '보물까지의 경로가 승부', body: '보물 세 개를 다 찾으면 바로 끝나므로, 앞선 사람은 보물을 서둘러 줍고, 뒤진 사람은 보물을 남겨 둔 채 점수를 모아야 해요. 상대가 갈 보물로 가는 길목에 지뢰를 몰아 두는 것이 가장 직접적인 방어예요.' },
      { title: '숫자를 모아 지도 그리기', body: '모든 이동 결과가 공지되므로, 상대가 밟은 칸의 숫자도 내 정보예요. 숫자들이 겹치는 곳을 따져 지뢰 위치를 지워 나가는 것이 지뢰 찾기의 기본 추리예요. 기록할 수 없으니 기억할 범위를 좁게 정하는 것이 좋아요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '지뢰 찾기 (Minesweeper)', players: '1명', alike: '둘레 지뢰 수를 보고 지뢰 위치를 추리하는 바탕이 같아요.', differs: '혼자 하는 컴퓨터 퍼즐이고, 지뢰를 묻거나 외울 필요가 없어요.' },
    { name: '배틀십 (Battleship)', players: '2명', alike: '서로 몰래 배치한 것을 찾아내는 게임이에요.', differs: '배틀십은 상대 판을 맞히고, 함께 걸어 다니는 판이 없어요.' },
  ],
}, {
  meta: {
    title: 'Mine of Oblivion rules — Death Game (The Risk Takers) match 6',
    description: 'The rules of Mine of Oblivion (망각의 지뢰) from Netflix’s Death Game season 1: an 11×11 board with three treasures, fifteen secret mines each and no-go zones, unmarked mines, moving in eight directions and scoring nearby mines, −5 for a mine, treasure worth 10, 15 and 20, and the practice game.',
    keywords: ['Mine of Oblivion', 'Death Game match 6', 'The Risk Takers', 'minesweeper board game'],
  },
  title: 'Mine of Oblivion — Death Game match 6',
  name: 'Mine of Oblivion',
  lead: 'Each player secretly buries fifteen mines, then both walk an unmarked board looking for treasure. Your own mines explode too.',
  summary: 'A 1:1 duel of memory and deduction: walk a secretly mined board, score nearby mines and find the treasure.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Board**: 11×11, treasure in the centre and two opposite corners; the other corners are starts.',
      '**Mines**: fifteen each, placed secretly in ten minutes, not within two cells of a start nor on treasure; unaware of each other, two may share a cell.',
      'Only the number of mined cells is public; nothing is marked and no notes are allowed.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Move', body: 'After a draw, each turn move to one of the eight surrounding cells, never onto the opponent.' },
      { title: 'Score', body: 'On a clear cell, score the mines around it (a doubled cell counts 2); a cell already scored scores nothing.' },
      { title: 'Mine', body: 'Any mine costs 5 points and sends you to one of three cells by your start; the mines there are removed.' },
      { title: 'Treasure', body: '+10, +15 and +20 in order of discovery.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['**When all three treasures are found** the game ends; the higher score wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A practice game uses a 9×9 board and twelve mines.',
      'Unlike season 2’s Mine of Oblivion 2 there are no time bombs, and treasure is worth a little less.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Mine of Oblivion is **two-player Minesweeper played from memory**: avoid your mines by remembering them, theirs by deduction from announced numbers.' },
    { type: 'cards', items: [
      { title: 'Mines are scoring fields', body: 'You score the mines around you, so walking beside your own mines is the safest scoring. Clustering them makes a rich area — but the numbers warn the opponent away too.' },
      { title: 'The route to treasure', body: 'The game ends with the third treasure, so a leader grabs treasure while a trailing player leaves it and scores. Mining the path to the opponent’s likely treasure is the most direct defence.' },
      { title: 'Mapping from numbers', body: 'Every move’s result is announced, so the opponent’s numbers inform you too. Overlap them to rule out cells, Minesweeper-style — and keep the area you track small, since you cannot write.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Minesweeper', players: '1', alike: 'Deduce mines from the counts around cells.', differs: 'A solo computer puzzle with nothing to bury or remember.' },
    { name: 'Battleship', players: '2', alike: 'Find what the other side secretly placed.', differs: 'You target the other’s grid rather than walking a shared board.' },
  ],
});

export const runHorse = dg1Game('run-horse', 7, ['wallgo', 'cardJanggi', 'janggi'], {
  meta: {
    title: '말 달리자 규칙 — 데스게임 7회차, 미끄러지는 말로 오아시스 먼저 가기',
    description: '넷플릭스 데스게임 7회차 말 달리자의 규칙을 정리했어요. 11×11 판의 오아시스·초원·사막, 대각선 마주 보는 말 10개, 막힐 때까지 미끄러지는 슬라이드 이동과 사막 칸으로만 가는 L자 이동, 3판 2선승까지.',
    keywords: ['말 달리자', '데스게임 말 달리자', '넷플릭스 데스게임', '데스게임 7회차', '슬라이딩 보드게임'],
  },
  title: '말 달리자 — 데스게임 7회차',
  name: '말 달리자',
  lead: '판 한가운데의 오아시스에 말을 먼저 세우면 이겨요. 그런데 말은 멈추고 싶은 곳에서 멈추지 못하고, 막힐 때까지 미끄러져요.',
  summary: '막힐 때까지 미끄러지는 이동과 나이트식 이동으로, 판 정중앙 오아시스에 먼저 도착하는 1:1 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**판**: 11×11. 정중앙 한 칸이 **오아시스**, 그 둘레가 초록 **초원**, 나머지가 노란 **사막**이에요.',
      '**말**: 각자 10개. 판의 대각선 쪽에 5개씩, 서로 마주 보게 놓여요.',
      '**라운드**: 3라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '슬라이드 이동', body: '말 하나를 가로나 세로로 움직여요. 판 가장자리나 다른 말에 막힐 때까지 곧장 미끄러져요.' },
      { title: 'L자 이동', body: '체스의 나이트처럼 한 칸 앞으로 간 뒤 대각선으로 한 칸 가요. 도착하는 칸이 **빈 사막 칸**일 때만 할 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**오아시스 칸에 말을 먼저 도착시킨 사람**이 그 라운드를 이겨요.',
      '**두 라운드를 먼저 이긴 사람**이 승리해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'L자 이동은 초원이나 오아시스로 갈 수 없어요. 그래서 오아시스에는 미끄러지기로만 들어갈 수 있어요.',
      '정리 자료의 L자 이동 세부(뛰어넘기 가능 여부 등)는 확인되지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '말 달리자의 핵심은 **"멈출 벽"**이에요. 말은 막혀야만 멈추므로, 오아시스에 서려면 그 바로 너머에 무언가가 있어야 해요. 결국 이 게임은 벽을 세우는 싸움이에요.' },
    { type: 'cards', items: [
      { title: '오아시스 뒤에 말을 두세요', body: '오아시스로 미끄러져 들어가 멈추려면, 오아시스 다음 칸에 말이 있어야 해요. 내 말이든 상대 말이든 상관없어요. 그래서 오아시스 둘레의 초원 칸에 말이 하나라도 서면, 그 반대편에서 미끄러져 오는 말이 오아시스에 설 수 있어요. 초원에 말을 놓는 순간이 곧 상대에게도 기회를 주는 순간이에요.' },
      { title: 'L자는 사막에서만', body: 'L자 이동은 빈 사막 칸으로만 가서, 중앙으로 가는 데는 직접 쓸 수 없어요. 대신 미끄러지기 좋은 줄로 말을 옮기거나, 상대의 미끄러짐을 막을 위치로 갈 때 써요.' },
      { title: '한 수 앞의 위협', body: '상대가 다음 수에 오아시스에 설 수 있는지 매 수마다 확인해야 해요. 오아시스로 통하는 네 방향 줄 가운데, 반대편에 멈출 벽이 있는 줄이 있으면 그 줄의 상대 말을 먼저 막아야 해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '리코셰 로봇 (Ricochet Robots)', players: '1명 이상', alike: '로봇이 막힐 때까지 미끄러지고, 다른 로봇을 벽으로 써서 목표 칸에 세워요. 말 달리자의 이동과 같아요.', differs: '리코셰 로봇은 모든 로봇을 누구나 움직이는 퍼즐 경쟁이고, 상대를 막는 대결이 아니에요.' },
    { name: '헤이, 내 물고기야! (Hey, That’s My Fish!)', players: '2–4명', alike: '말이 막힐 때까지 곧게 미끄러지는 이동 방식이 같아요. 어디에 멈출 수 있는지가 늘 다른 말의 위치에 달려 있어요.', differs: '물고기 게임은 떠난 얼음 판이 사라지고, 원하는 칸에서 멈출 수 있어요. 목표 칸에 먼저 도착하는 경주가 아니에요.' },
  ],
}, {
  meta: {
    title: 'Run, Horse rules — Death Game (The Risk Takers) match 7',
    description: 'The rules of Run, Horse (말 달리자) from Netflix’s Death Game season 1: an 11×11 board of oasis, grass and desert, ten horses each facing across the diagonal, sliding moves that stop only when blocked, knight-like moves onto desert only, and best of three.',
    keywords: ['Run Horse', 'Death Game match 7', 'The Risk Takers', 'sliding board game'],
  },
  title: 'Run, Horse — Death Game match 7',
  name: 'Run, Horse',
  lead: 'First horse onto the oasis in the centre wins — but horses cannot stop where they like; they slide until something blocks them.',
  summary: 'A 1:1 race to the central oasis with sliding moves and knight-like jumps.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Board**: 11×11: the centre cell is the **oasis**, ringed by green **grass**, the rest yellow **desert**.',
      '**Horses**: ten each, five on each of two diagonal corners, facing each other.',
      '**Rounds**: three.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Slide', body: 'Move a horse across or down; it slides until the edge or another horse stops it.' },
      { title: 'L-move', body: 'Like a chess knight, one square forward then one diagonally — only onto an **empty desert** cell.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**First to put a horse on the oasis** wins the round.',
      '**First to two rounds** wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'L-moves cannot reach grass or the oasis, so the oasis can only be entered by sliding.',
      'Finer details of the L-move (such as jumping) could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Everything is about **a wall to stop against**: a horse halts only when blocked, so standing on the oasis needs something just beyond it. It is a fight over walls.' },
    { type: 'cards', items: [
      { title: 'Something behind the oasis', body: 'To slide into the oasis and stop, a horse must be on the next cell — yours or theirs. One horse on the grass gives a stopping wall to anything sliding from the opposite side, so placing on the grass also opens a chance for your opponent.' },
      { title: 'L-moves only on desert', body: 'They cannot head into the centre, but they reposition horses onto useful sliding lines or into blocking spots.' },
      { title: 'Check the threat every move', body: 'On each of the four lines into the oasis, if there is a stopping wall on the far side, an opposing horse on that line must be blocked first.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Ricochet Robots', players: '1+', alike: 'Robots slide until blocked and use each other as walls to stop on a target — the same movement.', differs: 'Anyone may move any robot; it is a race to find a solution, not a duel.' },
    { name: "Hey, That's My Fish!", players: '2–4', alike: 'Pieces slide in straight lines, so where they can stop always depends on other pieces.', differs: 'Vacated ice disappears and you may stop anywhere; it is not a race to a target.' },
  ],
});

export const passOfTruth = dg1Game('pass-of-truth', 8, ['hiddenWord', 'piggyBank', 'equationSignal'], {
  meta: {
    title: '진실의 고개 규칙 — 데스게임 8회차, 예·아니오 질문으로 사건 풀기',
    description: '넷플릭스 데스게임 8회차 진실의 고개의 규칙을 정리했어요. 사건 개요와 단서, 차례마다 질문 또는 정답 선언, 초록·빨강·노랑 불빛과 "중요하지 않습니다", 내용이 숨겨지는 히든 질문 5회, 3판 2선승까지.',
    keywords: ['진실의 고개', '데스게임 진실의 고개', '넷플릭스 데스게임', '데스게임 8회차', '바다거북 수프'],
  },
  title: '진실의 고개 — 데스게임 8회차',
  name: '진실의 고개',
  lead: '같은 사건을 두고 두 사람이 번갈아 질문해요. 상대의 질문과 답도 보이니, 남이 얻은 정보가 내 정보이기도 해요.',
  summary: '예·아니오 질문을 번갈아 하며 사건의 진상을 먼저 맞히는 1:1 추리. 답은 불빛으로 공개돼요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**문제**: 라운드마다 사건 개요와 단서들이 주어져요.',
      '**라운드**: 3라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '질문', body: '자기 차례에 예/아니오로 답할 수 있는 질문을 해요. 답은 화면의 불빛으로 공개돼요. 예는 **초록**, 아니오는 **빨강**, 사실과 거짓이 섞였거나 해석의 여지가 있으면 **노랑**이에요. 풀이에 도움이 안 되면 불이 켜지지 않고 "중요하지 않습니다"라는 안내가 나와요.' },
      { title: '히든 질문', body: '게임 중 다섯 번까지, 질문 내용을 상대에게 숨길 수 있어요. 답의 불빛은 똑같이 공개돼요.' },
      { title: '정답 선언', body: '진상을 공개적으로 선언하면, 맞으면 초록, 틀리면 빨강이 켜져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**정답 선언에 먼저 초록 불을 켠 사람**이 그 라운드를 이겨요.',
      '**두 라운드를 먼저 이긴 사람**이 승리해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '틀린 정답 선언의 벌칙은 따로 없지만, 그 차례를 쓰는 셈이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '진실의 고개는 **정보를 나눠 갖는 추리 게임**이에요. 내 질문의 답은 상대에게도 보이므로, 좋은 질문이 상대의 추리까지 도와줄 수 있어요.' },
    { type: 'cards', items: [
      { title: '히든 질문은 결정적인 순간에', body: '히든 질문은 내용이 숨겨지지만 답의 색은 공개돼요. 그래서 상대는 "무언가에 초록이 켜졌다"는 것만 알아요. 정답에 거의 닿았을 때 마지막 확인을 히든으로 하면, 상대에게 결정적 단서를 주지 않고 확신을 얻을 수 있어요.' },
      { title: '공개 질문은 넓게', body: '공개 질문의 답은 상대도 쓰므로, 판을 좁히는 넓은 질문은 공개로, 정답을 확정하는 날카로운 질문은 히든으로 나누는 것이 효율적이에요.' },
      { title: '선언도 질문이에요', body: '틀린 선언에 큰 벌칙이 없다면, 거의 맞았다고 생각될 때 선언해 보는 것도 정보가 돼요. 다만 공개 선언이라 상대가 내 가설을 그대로 보게 돼요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '블랙 스토리 (Black Stories)', players: '2명 이상', alike: '기이한 사건의 결말만 듣고, 예·아니오 질문으로 전말을 맞혀요.', differs: '블랙 스토리는 경쟁이 아니고, 질문 내용을 숨기는 규칙이 없어요.' },
    { name: '스무고개', players: '2명 이상', alike: '예·아니오 질문으로 숨은 답을 좁혀 가요.', differs: '답이 물건 하나이고, 사건의 인과를 맞히지 않아요.' },
  ],
  note: '사건의 내용은 적지 않았어요.',
}, {
  meta: {
    title: 'Pass of Truth rules — Death Game (The Risk Takers) match 8',
    description: 'The rules of Pass of Truth (진실의 고개) from Netflix’s Death Game season 1: an incident and clues, a question or a solution each turn, green, red and yellow lights and "not important", five hidden questions, and best of three.',
    keywords: ['Pass of Truth', 'Death Game match 8', 'The Risk Takers', 'lateral thinking game'],
  },
  title: 'Pass of Truth — Death Game match 8',
  name: 'Pass of Truth',
  lead: 'Two players take turns questioning the same mystery. You see their questions and answers too, so what they learn is yours as well.',
  summary: 'A 1:1 deduction race of alternating yes/no questions, answered by lights, to solve an incident first.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Problem**: each round an incident summary and some clues.',
      '**Rounds**: three.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Question', body: 'On your turn ask a yes/no question; the answer lights up: **green** yes, **red** no, **yellow** mixed or open to interpretation. If it does not help, no light comes on and the dealer says "not important".' },
      { title: 'Hidden question', body: 'Up to five times a game, hide the question’s wording from the opponent; the light still shows.' },
      { title: 'Solution', body: 'Declare the truth aloud: green if right, red if wrong.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**First green on a declared solution** wins the round.',
      '**First to two rounds** wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A wrong solution has no separate penalty beyond using the turn.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Pass of Truth is **deduction with shared information**: your answers are visible, so a good question may help your opponent too.' },
    { type: 'cards', items: [
      { title: 'Save hidden questions', body: 'The opponent sees only that something lit green. Making your final confirmation hidden gains certainty without handing over the decisive clue.' },
      { title: 'Ask broad questions openly', body: 'Since open answers help both, use them for broad narrowing and keep the sharp, confirming questions hidden.' },
      { title: 'A solution is a question too', body: 'With no big penalty, a near-certain declaration also yields information — but it shows the opponent your hypothesis.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Black Stories', players: '2+', alike: 'Hear a strange outcome and reconstruct the story with yes/no questions.', differs: 'It is not a race and nothing is hidden.' },
    { name: 'Twenty Questions', players: '2+', alike: 'Yes/no questions narrow down a hidden answer.', differs: 'The answer is a single thing, not a chain of cause and effect.' },
  ],
  note: 'The incidents are not described.',
});
