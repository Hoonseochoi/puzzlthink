// 소사이어티 게임 2, day 13 final challenge: three rounds, first village to two wins. 중력 빙고, 수식 스크래블, 장애물 계주.
import { sg2Game } from './shared';

export const gravityBingo = sg2Game('gravity-bingo', 'final', { ko: '파이널 1라운드', en: 'Final, round 1' }, 12, ['blindGomoku', 'fourThree', 'pointOmok'], {
  meta: {
    title: '중력 빙고 규칙 — 소사이어티 게임2 파이널 1라운드, 외운 칩 배치로 하는 보이지 않는 사목',
    description: '소사이어티 게임2 파이널 1라운드 중력 빙고의 규칙을 정리했어요. 몸무게의 2/3 무게 상자를 드는 3분, 9구역 9×9 칩 배치도 암기, 색이 가려진 채 고르는 칩, 8줄 세로 빙고판에 떨어뜨려 쌓기, 앞면이 가려진 판에서 4개 잇기와 수읽기까지.',
    keywords: ['중력 빙고', '소사이어티 게임2 중력 빙고', '소사이어티게임2 파이널', '보이지 않는 사목', '소사이어티 게임2 게임'],
  },
  title: '중력 빙고 — 소사이어티 게임2 파이널 1라운드',
  name: '중력 빙고',
  lead: '신체 대표가 무거운 상자를 드는 동안, 두뇌 대표가 칩 81개의 색 배치를 외워요. 그 기억으로 칩을 골라 보이지 않는 세로 판에 떨어뜨리고, 내 색 4개를 먼저 이어요.',
  summary: '외운 칩 배치로 칩을 고르고, 앞이 가려진 판에서 4개를 잇는 파이널 첫 라운드.',
  setup: [
    { type: 'list', items: [
      '**인원**: 마을마다 파이널 진출자 3명. 신체 대표 1명, 두뇌 대표 2명(암기 담당·칩 넣기 담당).',
      '**칩 배치도**: 3×3으로 놓인 9개 구역, 구역마다 칩 9개가 3×3으로 있어 모두 9×9. 칩은 초록(높동)과 주황(마동) 두 색이에요.',
      '**상자**: 칩 배치도가 붙은 상자. 무게는 신체 대표 몸무게의 2/3이에요.',
      '**빙고판**: 세로줄 8개. 칩을 넣으면 맨 아래부터 쌓이고, 판의 앞면은 가려져 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기', body: '신체 대표가 상자를 들어 올려 암기 담당에게 배치도를 보여 줘요. 들 수 있는 시간은 모두 3분이고, 그 사이 내려놓았다 다시 들 수 있어요.' },
      { title: '선후공', body: '동전 던지기로 선공을 정하고, 두 마을이 번갈아 칩을 골라요.' },
      { title: '칩 고르기', body: '모니터에 아홉 구역 중 한 곳이 표시되면, 암기 담당이 그 구역 칩 9개 중 하나의 번호를 불러요. 칩의 색은 보이지 않아요.' },
      { title: '칩 넣기', body: '칩 넣기 담당이 실제 배치도에서 그 칩을 가져와, 색이 무엇이든 반드시 빙고판의 세로줄 하나에 넣어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '가로·세로·대각선 중 한 방향으로 **내 마을 색 칩 4개**를 먼저 이은 마을이 이 라운드를 이겨요.',
      '파이널은 세 라운드 중 **두 라운드를 먼저 이긴** 마을이 우승하고, 그 마을의 진출자들이 각자 모은 개인 상금을 우승 상금으로 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '상대 색 칩을 뽑아도 내 차례에 내 손으로 빙고판에 넣어야 해요.',
      '빙고판 앞면이 가려져 있어, 어느 줄에 어떤 색이 쌓였는지는 기억해야 해요.',
      '구역마다 두 색 칩의 개수는 다를 수 있어요. 빙고판의 가로 칸 수(높이)는 정리된 규칙에 나오지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '중력 빙고는 **두 번의 기억**이 이어진 게임이에요. 칩 배치를 기억해야 내 색을 뽑고, 빙고판을 기억해야 그 칩을 제대로 놓아요. 둘 중 하나만 무너져도 이길 수 없어요.' },
    { type: 'cards', items: [
      { title: '암기는 신체 대표의 3분 안에서', body: '배치도를 볼 수 있는 시간은 상자를 드는 시간뿐이에요. 신체 대표가 3분을 다 버텨야 81칸을 볼 수 있으니, 이 라운드는 사실상 신체 대표와 암기 담당의 2인 작업이에요. 81칸을 다 외우기 어렵다면, 구역마다 **내 색이 있는 자리 한두 개**만 확실히 외워도 대부분의 차례에 내 색을 뽑을 수 있어요.' },
      { title: '구역 지정이 만드는 운', body: '고를 구역은 모니터가 정해요. 내 색이 적은 구역이 걸리면 확실한 칩이 없을 수 있어요. 그래서 내 색이 적은 구역일수록 더 꼼꼼히 외워 둘 가치가 있어요.' },
      { title: '상대 색 칩은 "막는 돌"', body: '상대 색을 뽑으면 그 칩을 상대에게 가장 도움이 안 되는 자리, 혹은 상대 위협 위에 쌓아 막는 데 써요. 쌓이는 판이라, 어떤 줄에 칩을 넣으면 그 위 칸이 다음 사람에게 열린다는 점도 함께 계산해야 해요(사목·커넥트 포 같은 원리예요).' },
      { title: '보이지 않는 판의 기억법', body: '판이 가려져 있으니, 8개 줄의 높이와 색을 순서대로 손가락이나 손등에 표시해 두는 식으로 외워 두는 방법이 있어요. 상대가 넣는 줄도 반드시 지켜봐야 해요. 한 번이라도 놓치면 그 뒤의 수읽기가 전부 어긋나요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 칩 배치를 더 많이 외운 쪽이 내 색을 더 자주 놓고, 판을 정확히 기억한 쪽이 그 차이를 승리로 바꿔요.' },
  ],
  similar: [
    { name: '사목 (Connect Four)', players: '2명', alike: '세로줄에 칩을 넣으면 아래부터 쌓이고, 같은 색 4개를 먼저 이어요.', differs: '판이 다 보이고, 내 색 칩을 늘 내가 고를 수 있어요.' },
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '가려진 칸의 내용을 기억해 원하는 것을 골라요.', differs: '짝 맞추기만 하고, 고른 것을 판에 놓는 수읽기가 없어요.' },
  ],
}, {
  meta: {
    title: 'Gravity Bingo rules — The Society Game 2 final, round 1: connect four on a hidden board from a memorised chip map',
    description: 'The rules of Gravity Bingo (중력 빙고), round 1 of The Society Game 2 final: three minutes holding a box weighing two-thirds of your body weight, a 9×9 chip map in nine zones, chips picked with their colours hidden, dropped into eight columns of a covered board, and four in a row.',
    keywords: ['Gravity Bingo', 'The Society Game 2 final', 'blind connect four', '소사이어티 게임2 중력 빙고'],
  },
  title: 'Gravity Bingo — The Society Game 2 final, round 1',
  name: 'Gravity Bingo (중력 빙고)',
  lead: 'While the strength player holds up a heavy box, the brain player memorises the colours of eighty-one chips. From that memory they pick chips to drop into a covered upright board, racing to connect four of their colour.',
  summary: 'Pick chips from a memorised map and connect four on a board you cannot see — the final’s first round.',
  setup: [
    { type: 'list', items: [
      '**Players**: each village’s three finalists — one strength player and two brain players (a memoriser and a chip dropper).',
      '**Chip map**: nine zones in a 3×3 grid, each with nine chips in 3×3 — 9×9 in all, in green (높동) and orange (마동).',
      '**Box**: the chip map is fixed to a box weighing two-thirds of the strength player’s body weight.',
      '**Bingo board**: eight columns; chips stack from the bottom, and the front is covered.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise', body: 'The strength player lifts the box so the memoriser can see the map — three minutes in all, and the box may be set down and lifted again.' },
      { title: 'First move', body: 'A coin toss decides who starts; the villages then take turns.' },
      { title: 'Pick', body: 'The screen shows one of the nine zones; the memoriser calls the number of one of its nine chips, whose colour is hidden.' },
      { title: 'Drop', body: 'The dropper takes that chip from the real map and must put it, whatever its colour, into one of the board’s columns.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first village to connect **four chips of its colour** across, down or diagonally wins the round.',
      'The final goes to the first village to win **two of three rounds**; its finalists take their individual prize money as winnings.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A chip of the rival colour must still be dropped by you, on your turn.',
      'The board’s front is covered, so the stacks must be remembered.',
      'Zones may hold unequal numbers of each colour; the board’s height is not given in the transcribed rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Gravity Bingo chains **two memories**: the chip map, to draw your colour, and the board, to place it well. Lose either and you cannot win.' },
    { type: 'cards', items: [
      { title: 'Memorising inside the three minutes', body: 'The map is visible only while the box is held, so the strength player must last the full three minutes for all eighty-one cells to be studied — the round is really a two-person job. If eighty-one is too many, knowing **one or two cells of your colour in each zone** is enough to draw your colour most turns.' },
      { title: 'Luck from the zone', body: 'The screen picks the zone; land on one with little of your colour and you may have no sure chip. Zones poor in your colour deserve the most careful study.' },
      { title: 'Rival chips as blockers', body: 'Drawn a rival chip? Put it where it helps them least, or on top of their threat. Because chips stack, dropping into a column also opens the cell above for the next player — Connect Four thinking.' },
      { title: 'Remembering a hidden board', body: 'Track the height and colours of the eight columns, perhaps marking them on your fingers or hand, and watch every rival drop — miss one and all later reading goes wrong.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy: whoever memorised more of the map places their colour more often, and whoever remembers the board turns that into the win.' },
  ],
  similar: [
    { name: 'Connect Four', players: '2', alike: 'Chips dropped into columns stack from the bottom; first to four in a row wins.', differs: 'The board is visible and you always play your own colour.' },
    { name: 'Memory (Concentration)', players: '1+', alike: 'Remember hidden cells to pick what you want.', differs: 'Only pairing; nothing is then placed on a board.' },
  ],
});

export const equationScrabble = sg2Game('equation-scrabble', 'final', { ko: '파이널 2라운드', en: 'Final, round 2' }, 12, ['equationTower', 'equationSignal', 'hiddenWord'], {
  meta: {
    title: '수식 스크래블 규칙 — 소사이어티 게임2 파이널 2라운드, 10의 거듭제곱 수식과 기와 버티기',
    description: '소사이어티 게임2 파이널 2라운드 수식 스크래블의 규칙을 정리했어요. 13×13 판, 기호 타일 2개와 숫자 타일 5개, 답이 10·100·1000… 인 수식, 첫 수식은 정중앙, 기존 타일 하나 이상 쓰기, 기호 1점·숫자 5개 모두 쓰면 3점, 점수만큼 상대가 쌓는 기와까지.',
    keywords: ['수식 스크래블', '소사이어티 게임2 수식 스크래블', '소사이어티게임2 파이널', '10의 거듭제곱', '소사이어티 게임2 게임'],
  },
  title: '수식 스크래블 — 소사이어티 게임2 파이널 2라운드',
  name: '수식 스크래블',
  lead: '스크래블처럼 판 위에 타일을 이어 놓되, 단어 대신 답이 10, 100, 1000… 인 수식을 만들어요. 내가 점수를 낼 때마다 상대 신체 대표들이 들고 있는 판 위에 기와가 한 장씩 올라가요.',
  summary: '10의 거듭제곱이 답인 수식을 판에 이어 놓아, 점수만큼 상대 쪽에 기와를 쌓게 하는 라운드.',
  setup: [
    { type: 'list', items: [
      '**인원**: 마을마다 두뇌 대표 1명이 수식을 만들고, 신체 대표 2명이 둥근 널판을 들고 버텨요.',
      '**게임판**: 가로 13칸, 세로 13칸.',
      '**타일**: 차례마다 기호 타일 2개(−, +, ×, ÷ 순서로 돌아가며 나와요)와 1–9 숫자 타일 5개(순서는 임의)를 가지고 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선공', body: '동전 던지기로 선공을 정하고 번갈아 둬요.' },
      { title: '수식 놓기', body: '90초 안에 가진 타일로, 답이 **10의 거듭제곱**(10, 100, 1000 …)인 수식을 판에 놓아요. 답 1(10의 0제곱)은 안 돼요. 수식은 왼쪽에서 오른쪽, 위에서 아래로만 읽어요.' },
      { title: '첫 수식과 그 뒤', body: '첫 수식은 판의 정중앙을 지나야 해요. 그 뒤로는 판에 이미 놓인 타일을 하나 이상 수식에 포함해야 해요.' },
      { title: '점수', body: '쓴 기호 타일 1개당 1점이에요. 숫자 타일은 가진 5개를 **모두** 썼을 때만 3점이에요.' },
      { title: '기와 쌓기', body: '상대 두뇌 대표가 점수를 낼 때마다, 내 신체 대표들은 들고 있는 둥근 널판 위에 1점당 기와 한 장을 쌓아요.' },
      { title: '보충', body: '차례가 끝나면 기호 2개, 숫자 5개가 되도록 타일을 다시 채워요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['기와를 떨어뜨리지 않고 **더 오래 버티는** 마을이 이 라운드를 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '타일을 쓰지 않고 차례를 넘겨도, 가진 타일 중 하나는 골라서 바꿔야 해요.',
      '숫자 타일을 네 개만 쓰면 숫자 쪽 점수는 0점이에요. 3점은 다섯 개를 모두 썼을 때만이에요.',
      '숫자 타일을 붙여 여러 자리 수로 쓸 수 있는지는 정리된 규칙에 따로 적혀 있지 않아요. 다만 나무위키의 전략 설명은 두 자리 이상의 수를 쓰는 것을 전제로 해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '수식 스크래블은 **점수가 곧 상대의 무게**예요. 내가 낸 점수만큼 상대 신체 대표의 판에 기와가 쌓이니, 두뇌 대표의 계산 실력이 상대 팀의 체력을 갉아먹는 구조예요.' },
    { type: 'cards', items: [
      { title: '기호 두 개가 기본기', body: '기호 2개를 모두 쓰면 2점이 확실해요. 숫자 5개를 모두 쓰는 3점은 훨씬 어려워요. 그래서 먼저 **기호 두 개를 다 쓰는 수식**을 찾고, 그게 되면 숫자까지 모두 쓸 수 있는지를 보는 순서가 효율적이에요. 기호를 남기면 그 점수는 그냥 사라져요.' },
      { title: '같은 숫자 두 개는 공짜 점수', body: '같은 숫자가 두 개 있으면 기존 수식 끝에 "+ n − n"이나 "× n ÷ n"을 붙여 값은 그대로 두고 기호 2점을 얻을 수 있어요. 이런 상쇄 꼴은 계산 부담 없이 쓸 수 있는 점수예요.' },
      { title: '판 위 타일을 빌려 쓰기', body: '두 번째 수식부터는 판의 타일을 하나 이상 써야 해요. 판에 이미 있는 "10"이나 "100"의 일부를 빌리면 남은 계산이 쉬워지고, 내 숫자를 덜 쓰고도 식을 완성할 수 있어요. 반대로 내가 놓는 수식은 상대가 빌리기 쉬운 자리가 되지 않도록 신경 써야 해요.' },
      { title: '버티는 쪽의 설계', body: '두 신체 대표가 한 판을 드니, 키 차이가 크면 판이 기울어 기와가 쏠려요. 키를 맞추고, 기와를 판 가운데부터 고르게 놓는 것이 오래 버티는 기본이에요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 점수를 꾸준히 내는 두뇌 대표와, 그 점수를 견디는 신체 대표가 함께 있어야 이겨요. 점수 차이가 작으면 결국 **체력 싸움**이 돼요.' },
  ],
  similar: [
    { name: '이퀘이트 (Equate)', players: '2–4명', alike: '스크래블처럼 판 위에 숫자·기호 타일을 이어 맞는 등식을 만들고, 기존 타일에 붙여 놓아요.', differs: '답이 정해져 있지 않고, 타일마다 점수가 다르며 보너스 칸이 있어요.' },
    { name: '스크래블 (Scrabble)', players: '2–4명', alike: '정중앙에서 시작해 놓인 타일에 이어 붙이고, 손패를 매번 보충해요.', differs: '수식이 아니라 단어를 만들고, 몸을 쓰는 부분이 없어요.' },
  ],
}, {
  meta: {
    title: 'Equation Scrabble rules — The Society Game 2 final, round 2: powers of ten and a stack of roof tiles',
    description: 'The rules of Equation Scrabble (수식 스크래블), round 2 of The Society Game 2 final: a 13×13 board, two operator and five number tiles, equations equal to 10, 100, 1000…, the first through the centre, at least one existing tile after that, 1 point per operator and 3 for using all five numbers, and roof tiles stacked on the rivals’ board for every point.',
    keywords: ['Equation Scrabble', 'The Society Game 2 final', 'powers of ten equation game', '소사이어티 게임2 수식 스크래블'],
  },
  title: 'Equation Scrabble — The Society Game 2 final, round 2',
  name: 'Equation Scrabble (수식 스크래블)',
  lead: 'Lay tiles on a board as in Scrabble, but build equations equal to 10, 100, 1000… instead of words. Every point you score puts another roof tile on the board the rival strength players are holding.',
  summary: 'Build powers-of-ten equations on a shared board; each point loads a roof tile onto the rivals.',
  setup: [
    { type: 'list', items: [
      '**Players**: per village, one brain player builds equations and two strength players hold a round board.',
      '**Board**: 13 × 13 cells.',
      '**Tiles**: each turn you hold two operator tiles (dealt in the order −, +, ×, ÷) and five number tiles 1–9 (random order).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'First move', body: 'A coin toss decides who starts; turns alternate.' },
      { title: 'Lay an equation', body: 'Within 90 seconds, lay an equation equal to **a power of ten** (10, 100, 1000 …) — not 1 — reading left to right or top to bottom.' },
      { title: 'Opening and after', body: 'The first equation must cross the centre; every later one must use at least one tile already on the board.' },
      { title: 'Scoring', body: 'Each operator tile used is 1 point; number tiles score 3 points only if **all five** are used.' },
      { title: 'Roof tiles', body: 'Each time the rival brain player scores, your strength players stack one roof tile per point on their round board.' },
      { title: 'Refill', body: 'After each turn, refill to two operators and five numbers.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['The village that **holds out longer** without dropping a roof tile wins the round.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Passing without playing still requires swapping one tile of your choice.',
      'Using four number tiles scores nothing for numbers; the 3 points need all five.',
      'The transcribed rules do not say whether digits may be joined into multi-digit numbers, though the fan wiki’s strategy notes assume they can.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'In Equation Scrabble **your score is your rival’s weight**: every point lands on their strength players, so arithmetic wears down the other team’s stamina.' },
    { type: 'cards', items: [
      { title: 'Both operators first', body: 'Using both operators is a reliable 2 points; using all five numbers for 3 is much harder. Look first for an equation that **uses both operators**, then see whether all the numbers fit too. An operator left in hand is a point thrown away.' },
      { title: 'Pairs are free points', body: 'Two equal numbers let you tack "+ n − n" or "× n ÷ n" onto an equation, leaving its value unchanged for two operator points with no hard arithmetic.' },
      { title: 'Borrow the board', body: 'From the second turn you must use a board tile; borrowing part of an existing "10" or "100" eases the arithmetic and saves your own numbers. Likewise, avoid laying equations that are easy for the rival to borrow.' },
      { title: 'Holding the board', body: 'Two players share one board, so a big height difference tips it and the tiles slide. Match heights and place tiles evenly from the centre out.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy: you need a brain player who scores steadily and strength players who can bear the rival’s score. When the scores are close, it becomes **a test of endurance**.' },
  ],
  similar: [
    { name: 'Equate', players: '2–4', alike: 'Lay number and operator tiles on a board, Scrabble-style, attached to existing tiles, to form valid equations.', differs: 'No fixed answer; tiles have different values and there are bonus squares.' },
    { name: 'Scrabble', players: '2–4', alike: 'Start in the centre, build onto placed tiles and refill your rack each turn.', differs: 'Words instead of equations, and nothing physical.' },
  ],
});

export const obstacleRelay = sg2Game('obstacle-relay', 'final', { ko: '파이널 3라운드', en: 'Final, round 3' }, 12, ['equationSignal', 'nemoCount', 'hexagon'], {
  meta: {
    title: '장애물 계주 규칙 — 소사이어티 게임2 파이널 3라운드, 슬라이딩 퍼즐·그림 수식·장애물 코스',
    description: '소사이어티 게임2 파이널 3라운드 장애물 계주의 규칙을 정리했어요. 1번 주자의 슬라이딩 퍼즐로 열쇠 조각 빼기, 2번 주자의 그림 수식 암기와 직진 장애물, 주사위로 구한 비밀번호 앞 두 자리, 마지막 주자의 V자 정글짐과 종료 버튼까지.',
    keywords: ['장애물 계주', '소사이어티 게임2 장애물 계주', '소사이어티게임2 파이널', '슬라이딩 퍼즐', '소사이어티 게임2 게임'],
  },
  title: '장애물 계주 — 소사이어티 게임2 파이널 3라운드',
  name: '장애물 계주',
  lead: '세 명이 차례로 이어 달려요. 첫 주자는 퍼즐로 열쇠를 빼내고, 둘째는 그림 수식을 외워 장애물을 지나 비밀번호를 구하고, 마지막 주자는 정글짐을 넘어 돌아와 버튼을 눌러요.',
  summary: '슬라이딩 퍼즐 → 그림 수식 암기와 장애물 → 정글짐 왕복, 세 주자가 잇는 파이널 계주.',
  setup: [
    { type: 'list', items: [
      '**인원**: 마을마다 파이널 진출자 3명이 1·2·3번 주자로 나서요.',
      '**1번 주자**: 조각을 밀어 움직이는 퍼즐. 열쇠가 그려진 조각을 빼내야 해요.',
      '**2번 주자**: 자물쇠가 달린 그림 수식 문제 2개, 직진 장애물 코스, 코스 끝의 주사위 2개.',
      '**3번 주자**: 자물쇠로 묶인 채 출발을 기다리고, V자 장애물 코스(정글짐)를 통과해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '퍼즐', body: '1번 주자가 퍼즐 조각들을 움직여 열쇠 조각을 빼내고, 거기서 얻은 비밀번호를 2번 주자에게 외쳐 전해요.' },
      { title: '그림 수식', body: '2번 주자가 자물쇠를 풀고 그림 수식 문제 두 개를 확인해요. 그림 수식은 그림 두 개 사이에 + 또는 − 가 있는 식이에요.' },
      { title: '장애물과 주사위', body: '그림 수식을 외운 채 직진 장애물 코스를 지나, 끝에 놓인 주사위 2개에서 외운 그림과 같은 면을 찾아요. 그 면의 숫자를 식에 넣어 계산한 두 답이, 마지막 주자 자물쇠의 세 자리 비밀번호 중 앞 두 자리가 돼요.' },
      { title: '자물쇠 풀기', body: '2번 주자는 앞의 두 자리만 가지고 마지막 주자의 자물쇠를 열어야 해요.' },
      { title: '마지막 주자', body: '풀려난 3번 주자가 V자 장애물 코스를 통과해 출발점으로 돌아와 종료 버튼을 눌러요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '종료 버튼을 **먼저 누른** 마을이 이 라운드를 이겨요.',
      '파이널은 세 라운드 중 두 라운드를 먼저 이긴 마을이 우승해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '비밀번호 세 자리 중 마지막 자리는 주어지지 않아요. 정리된 규칙에는 "앞 두 자리만으로 열어야 한다"고만 되어 있어, 남은 한 자리는 직접 맞춰 봐야 하는 것으로 읽혀요.',
      '그림을 잘못 외우면 주사위에서 다른 면을 고르게 되고, 그러면 비밀번호가 맞지 않아요. 다시 돌아가 그림을 볼 수 있는지는 정리된 규칙에 나오지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '장애물 계주는 파이널 세 라운드 가운데 **가장 신체 비중이 큰** 라운드예요. 그래도 두 군데의 두뇌 관문(퍼즐, 그림 수식)에서 한 번 막히면, 달리기로는 되찾기 어려울 만큼 시간이 벌어져요.' },
    { type: 'cards', items: [
      { title: '슬라이딩 퍼즐의 요령', body: '러시아워 같은 슬라이딩 퍼즐은 **목표 조각의 길을 막는 조각부터 거꾸로** 따져요. "열쇠 조각이 나가려면 이 조각이 비켜야 하고, 그러려면 저 조각이 먼저…"처럼 막는 관계를 뒤에서부터 풀면, 무작정 밀어 보는 것보다 훨씬 빨라요. 구석을 비워 긴 조각이 돌아 나갈 자리를 먼저 만드는 것도 기본이에요.' },
      { title: '그림 외우기는 계산보다 먼저', body: '2번 주자는 그림을 외운 채 장애물을 지나야 해요. 달리는 동안 잊지 않도록, 그림 전체가 아니라 **주사위 면과 구별되는 특징**(가운데 무늬, 대칭의 일부, 색 조합)을 짧은 말로 바꿔 외우는 편이 안전해요. 식의 기호(+, −)도 함께 외워야 해요.' },
      { title: '남은 한 자리', body: '앞 두 자리를 정확히 구했다면 남은 한 자리는 0–9, 많아야 열 번이면 맞출 수 있어요. 그러니 앞 두 자리의 정확도가 중요해요. 앞자리가 틀리면 아무리 돌려도 열리지 않아요.' },
      { title: '주자 배치', body: '1번은 퍼즐, 2번은 암기·계산·달리기, 3번은 순수한 체력이에요. 가장 바쁜 2번 자리에 멀티가 되는 사람을 두고, 3번에는 가장 빠르고 힘센 사람을 두는 것이 자연스러워요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 세 주자 모두 제 몫을 해야 하고, 그중 두뇌 관문에서 **실수하지 않는 것**이 달리기 속도보다 큰 차이를 만들어요.' },
  ],
  similar: [
    { name: '러시아워 (Rush Hour)', players: '1명', alike: '막고 있는 조각들을 밀어 목표 조각을 빼내는 슬라이딩 블록 퍼즐이에요.', differs: '혼자 푸는 퍼즐이고, 뒤에 이어지는 다른 미션이 없어요.' },
    { name: '엑시트: 더 게임 (EXIT: The Game)', players: '1–4명', alike: '단서를 풀어 자물쇠 숫자를 구하고, 다음 단계로 넘어가는 방탈출 게임이에요.', differs: '한 팀이 협동해 시간과 싸우고, 몸을 쓰는 코스가 없어요.' },
  ],
}, {
  meta: {
    title: 'Obstacle Relay rules — The Society Game 2 final, round 3: sliding puzzle, picture equations and an obstacle course',
    description: 'The rules of Obstacle Relay (장애물 계주), round 3 of The Society Game 2 final: runner one frees the key piece of a sliding puzzle, runner two memorises picture equations and runs an obstacle course to find the first two digits of a code on dice, and the last runner crosses a V-shaped jungle gym and hits the finish button.',
    keywords: ['Obstacle Relay', 'The Society Game 2 final', 'sliding puzzle relay', '소사이어티 게임2 장애물 계주'],
  },
  title: 'Obstacle Relay — The Society Game 2 final, round 3',
  name: 'Obstacle Relay (장애물 계주)',
  lead: 'Three runners in turn: the first frees a key from a sliding puzzle, the second memorises picture equations and runs a course to work out a code, and the last crosses a jungle gym and back to hit the button.',
  summary: 'Sliding puzzle → picture equations and obstacles → jungle-gym run: the final’s three-person relay.',
  setup: [
    { type: 'list', items: [
      '**Players**: each village’s three finalists run legs 1, 2 and 3.',
      '**Leg 1**: a sliding-block puzzle; the piece showing a key must be freed.',
      '**Leg 2**: two picture-equation problems behind a lock, a straight obstacle course, and two dice at its end.',
      '**Leg 3**: locked in at the start, then a V-shaped obstacle course (a jungle gym).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Puzzle', body: 'Runner one slides pieces until the key piece comes out, then shouts the code it gives to runner two.' },
      { title: 'Picture equations', body: 'Runner two unlocks and reads two picture equations — two pictures joined by + or −.' },
      { title: 'Course and dice', body: 'Holding the pictures in memory, they run the straight course and find, on the two dice at the end, the faces matching the pictures. Putting those faces’ numbers into the equations gives two answers: the first two digits of the last runner’s three-digit lock.' },
      { title: 'Unlock', body: 'Runner two must open the last runner’s lock with only those two digits.' },
      { title: 'Last leg', body: 'Freed, runner three crosses the V-shaped course, returns to the start and presses the finish button.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The village that **presses the button first** wins the round.',
      'The final goes to the first village to win two of three rounds.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The lock’s last digit is not given; the transcribed rules say only that it must be opened with the first two digits, which reads as finding the third by trial.',
      'Misremembering a picture means choosing the wrong die face and a wrong code; whether the runner may go back to look again is not stated.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Obstacle Relay is the **most physical** round of the final, yet a stall at either brain gate — the puzzle or the picture equations — costs more time than running can win back.' },
    { type: 'cards', items: [
      { title: 'Sliding puzzles backwards', body: 'In Rush Hour-style puzzles, reason **backwards from the pieces blocking the target**: "the key needs this piece out of the way, which needs that one first…". Unravelling the blocking chain beats trial pushes, and clearing a corner for long pieces to swing through is basic.' },
      { title: 'Memorise before you run', body: 'Runner two must carry the pictures through the course. Rather than the whole image, turn **the feature that sets it apart on the die** (centre motif, part of its symmetry, colour pair) into a short phrase — and remember each + or − as well.' },
      { title: 'The missing digit', body: 'With the first two digits right, the last is 0–9 — ten tries at most. So accuracy on the first two is what matters; get one wrong and no amount of spinning opens it.' },
      { title: 'Who runs where', body: 'Leg 1 is a puzzle, leg 2 memory plus arithmetic plus running, leg 3 pure fitness. Put your best all-rounder on the busy second leg and your fastest, strongest on the last.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy: all three must deliver, and **not erring at the brain gates** matters more than raw speed.' },
  ],
  similar: [
    { name: 'Rush Hour', players: '1', alike: 'A sliding-block puzzle: move the blockers to free the target piece.', differs: 'A solo puzzle with no further stages.' },
    { name: 'EXIT: The Game', players: '1–4', alike: 'An escape game where solving clues gives lock numbers for the next stage.', differs: 'One cooperative team against the clock, with no physical course.' },
  ],
});
