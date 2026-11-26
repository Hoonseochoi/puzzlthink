// 더 지니어스: 블랙가넷, rounds 10–12: 체인 옥션, 모노레일, 의심 윷놀이, 베팅! 흑과 백, 같은 숫자 찾기 (final).
import { ep, g3Game, namuGame, round } from './shared';

export const chainAuction = g3Game({
  slug: 'chain-auction', kind: 'main', when: round(10), episode: ep(10), eps: [10], note: 'two',
  related: ['equationTower', 'equationSignal', 'hiddenWord'],
}, {
  meta: {
    title: '체인 옥션 규칙 — 더 지니어스 시즌3 블랙가넷 10회전 메인매치, 10을 만드는 수식 경매',
    description: '더 지니어스: 블랙가넷 10회전 메인매치 체인 옥션의 규칙을 정리했어요. 숨겨진 고유번호 1–12, 기호·숫자 타일 4라운드 우선권 경매, 코인 20개, 10에 가까울수록 높은 승점표, 고유번호 맞히기 ±3점, 사슬로 묶인 협상까지.',
    keywords: ['체인 옥션', '체인옥션', '더 지니어스 체인 옥션', '더 지니어스3 체인옥션', '블랙가넷 10회전', '지니어스 수식 경매'],
  },
  title: '체인 옥션 — 더 지니어스: 블랙가넷 10회전 메인매치',
  name: '체인 옥션',
  lead: '나만 아는 고유번호에 경매로 산 숫자와 기호를 붙여, 답이 10에 가장 가까운 수식을 만들어요. 무엇을 사는지가 내 번호를 드러내니, 남의 번호를 맞히면 점수를 빼앗아요.',
  summary: '숨긴 고유번호에 경매로 산 숫자·기호 타일을 붙여 10에 가까운 수식을 만들고, 남의 번호까지 맞히는 6인 경매.',
  setup: [
    { type: 'list', items: [
      '**인원**: 지니어스 플레이어 4명과 게스트 2명(이전 시즌 우승자), 모두 6명. 협상을 몰래 하지 못하도록 모두를 사슬로 이어 둔 채 진행해요.',
      '**고유번호**: 각자 1–12 중 하나를 제비뽑기로 받아요. 공개되지 않고, 뽑히지 않은 6개 번호도 공개되지 않아요.',
      '**타일**: 1·3라운드에는 기호 타일 6개(＋ 2, － 2, × 1, ÷ 1), 2·4라운드에는 1–12를 섞은 숫자 타일 6개씩이 나와요.',
      '**코인**: 각자 20개. 다른 사람에게 줄 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '우선권 경매', body: '라운드마다 선 플레이어부터 시계 방향으로 돌며 앞사람보다 많은 코인을 부르거나 패스해요. 가장 많이 부른 사람이 우선권을 가져가요.' },
      { title: '타일 고르기', body: '우선권을 딴 사람부터 **시계 반대 방향**으로 한 명씩 타일 하나를 골라요. 다음 라운드 경매는 직전 우선권을 딴 사람부터 시작해요.' },
      { title: '협상', body: '라운드마다 타일을 다 나눈 뒤 협상 시간이 있어요. 코인으로 다른 사람과 타일을 바꿀 수 있고, 이번 라운드 것이 아닌 타일도, 여러 개를 한꺼번에도 바꿀 수 있어요.' },
      { title: '번호 예측', body: '4라운드가 끝나면 수식을 만들기 전에 다른 5명의 고유번호를 예측해 적어요.' },
      { title: '수식 완성', body: '가장 오른쪽 사람부터 다른 사람들의 예측을 공개하고, 가진 기호·숫자 타일을 모두 써서 고유번호가 들어간 수식을 만든 뒤 번호를 밝혀요.' },
    ] },
    { type: 'table', head: ['수식의 값', '~4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16~'], rows: [
      ['승점', '0', '5', '6', '8', '11', '15', '20', '15', '11', '8', '6', '5', '0'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '수식 승점 + 남은 코인 + 번호 예측 점수의 합이 가장 높은 사람이 우승, 지니어스 플레이어 중 가장 낮은 사람이 탈락후보예요.',
      '번호 예측: 내가 남의 번호를 맞히면 한 명당 3점을 얻고, 누가 내 번호를 맞히면 한 명당 3점을 잃어요.',
      '지니어스 플레이어가 우승하면 생명의 징표와 가넷 10개를 받아요. 게스트가 우승하면 게스트는 상금 1천만 원을 받고, 지니어스 플레이어 중 최고점이 생명의 징표를(가넷 없이) 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '얻은 타일은 모두 수식에 써야 해요. 답이 정수가 아니면 소수점 아래는 버려요.',
      '지니어스 플레이어 3명이 공동 우승하면 아무도 생명의 징표를 받지 못하고, 꼴찌가 데스매치 상대를 지목해요. 4명이 모두 같으면 가넷이 가장 많은 사람이 생명의 징표를 받아요.',
      '**확인되지 않은 점**: 남은 코인 하나의 값을 나무위키는 승점 1점, 영어 위키백과는 2점으로 적고 있어요. 두 자료가 달라 어느 쪽인지 단정하지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '체인 옥션은 세 가지가 맞물린 게임이에요. 10을 만드는 **계산**, 코인을 쓰는 **경매**, 그리고 남의 행동으로 숨긴 번호를 읽는 **추리**예요.' },
    { type: 'cards', items: [
      { title: '사는 순간 번호가 새어 나간다', body: '숫자 두 개와 기호 두 개를 내 번호에 붙여 10을 만들어야 하니, 내가 무엇을 원하는지가 곧 내 번호의 단서예요. ÷를 애타게 원하거나 특정 숫자에 코인을 크게 쓰면, 남들은 그 조합으로 10이 되는 번호를 거꾸로 계산해요. 그래서 일부러 필요 없는 타일을 사거나 협상으로 바꿀 타일을 미리 사 두는 눈속임이 의미가 있어요.' },
      { title: '코인과 승점의 환율', body: '10을 정확히 맞히면 20점, 9나 11이면 15점이에요. 그 5점 차이를 얻으려고 코인을 5개 넘게 쓰면 오히려 손해예요(남은 코인이 점수가 되므로). 처음 20코인을 아예 지키는 것만으로도 상당한 점수라, 모두가 아끼면 우선권은 싸게 넘어가요.' },
      { title: '예측의 크기', body: '다섯 명의 번호를 모두 맞히면 15점, 내 번호가 다 읽히면 15점을 잃어요. 수식 점수 차이만큼 큰 값이라, 숨기기와 맞히기가 계산만큼 중요해요. 사슬로 모두 묶여 있어 몰래 하는 협상이 없으니, 모든 거래가 모두에게 정보가 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '타일이 정해진 순서로 공개되고 경매와 협상이 얽혀 **우월 전략은 없어요.** 다만 "필요한 것을 들키지 않고 얻기"라는 한 가지 원칙이 경매·협상·예측 모두를 관통해요.' },
  ],
  similar: [
    { name: '라 (Ra)', players: '2–5명', alike: '경매로 타일 묶음을 사고, 돈(태양 타일)을 언제 얼마에 쓰느냐가 점수를 정해요.', differs: '수식이나 숨긴 번호는 없고, 타일 세트의 조합으로 점수를 내요.' },
    { name: '이퀘이트 (Equate)', players: '2–4명', alike: '숫자와 기호 타일을 이어 맞는 식을 만들며 점수를 내요.', differs: '경매 없이 판 위에 낱말 맞추기처럼 식을 놓아요.' },
  ],
}, {
  meta: {
    title: 'Chain Auction rules — The Genius: Black Garnet round 10 main match, auctioning tiles to make 10',
    description: 'The rules of the Chain Auction (체인 옥션), round 10 main match of The Genius: Black Garnet: a hidden number 1–12, four rounds of priority auctions for operator and number tiles, 20 coins, a score table peaking at exactly 10, ±3 points for guessing hidden numbers, and negotiations with everyone chained together.',
    keywords: ['Chain Auction', 'The Genius Chain Auction', 'The Genius Black Garnet', 'The Genius season 3', '체인 옥션'],
  },
  title: 'Chain Auction — The Genius: Black Garnet, round 10 main match',
  name: 'Chain Auction (체인 옥션)',
  lead: 'Attach auctioned numbers and operators to a number only you know, aiming for an expression worth as close to 10 as possible. What you buy gives your number away, and guessing others’ numbers steals their points.',
  summary: 'Build an expression near 10 from a hidden number and auctioned tiles, and guess everyone else’s hidden number: a six-player auction.',
  setup: [
    { type: 'list', items: [
      '**Players**: four Genius players and two guests (earlier seasons’ winners), six in all, chained together so no deal can be made in secret.',
      '**Hidden number**: each draws one of 1–12. It stays secret, as do the six numbers not drawn.',
      '**Tiles**: rounds 1 and 3 offer six operator tiles (two +, two −, one ×, one ÷); rounds 2 and 4 each offer six number tiles from a shuffled 1–12.',
      '**Coins**: 20 each, and they may be given to others.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Priority auction', body: 'Each round bidding goes clockwise from the starting player: outbid the last bid or pass. The highest bid takes priority.' },
      { title: 'Choosing tiles', body: 'From the priority winner, players take one tile each going **counter-clockwise**. The next auction starts with the previous priority winner.' },
      { title: 'Negotiation', body: 'After each round’s tiles are taken there is time to trade tiles for coins, including older tiles and several at once.' },
      { title: 'Guessing', body: 'After round 4, before building expressions, everyone writes guesses of the other five hidden numbers.' },
      { title: 'Expressions', body: 'Starting from the rightmost seat, the guesses about each player are shown, then the player builds an expression with all their tiles plus their hidden number and reveals the number.' },
    ] },
    { type: 'table', head: ['Value', '≤4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '≥16'], rows: [
      ['Points', '0', '5', '6', '8', '11', '15', '20', '15', '11', '8', '6', '5', '0'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Expression points + remaining coins + guessing points: the highest total wins; the lowest Genius player is the candidate.',
      'Guessing: +3 for each hidden number you guess right, −3 for each player who guesses yours.',
      'A Genius player who wins gets a token of life and 10 garnets. A guest who wins gets ₩10 million, and the top Genius player gets the token (without garnets).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Every tile you hold must be used; non-integer results are rounded down.',
      'If three Genius players tie for the win, nobody gets a token and the last-placed player names an opponent. If all four are level, the one with most garnets gets the token.',
      '**Not settled**: the fan wiki values each remaining coin at 1 point, English Wikipedia at 2. The sources disagree, so this page does not state which.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The Chain Auction meshes three games: **arithmetic** to reach 10, an **auction** for coins’ worth, and **deduction** of hidden numbers from behaviour.' },
    { type: 'cards', items: [
      { title: 'Buying leaks your number', body: 'You need two numbers and two operators around your hidden number to make 10, so what you want is a clue to what you hold. Chasing ÷ or spending big on one number lets others work back to the numbers that make 10 with it, which is why buying a decoy or a tile to trade later has real value.' },
      { title: 'Coins against points', body: 'Exactly 10 is worth 20; 9 or 11 is 15. Spending more than five coins to close that gap loses points, since leftover coins score. Simply keeping the 20 starting coins is a solid score, so when everyone saves, priority goes cheaply.' },
      { title: 'How big guessing is', body: 'Guessing all five numbers is 15 points, and having yours read by all costs 15—as large as the gaps in the expression table. With everyone chained together there are no secret deals, so every trade informs everyone.' },
    ], columns: 1 },
    { type: 'p', text: 'Tiles appear in a fixed order and auctions and trades interlock, so **there is no dominant strategy**. One principle runs through the auction, the trading and the guessing alike: get what you need without showing that you need it.' },
  ],
  similar: [
    { name: 'Ra', players: '2–5', alike: 'Auctions for lots of tiles, where when and how high you spend your money (sun tiles) decides the score.', differs: 'No expressions or hidden numbers; points come from tile sets.' },
    { name: 'Equate', players: '2–4', alike: 'Number and operator tiles are joined into true equations for points.', differs: 'No auction: equations are laid crossword-style on a board.' },
  ],
});

export const monorail = g3Game({
  slug: 'monorail', kind: 'death', when: round(10), episode: ep(10), eps: [10], extra: [namuGame('모노레일(게임)', 'Monorail (game)')], note: 'two',
  related: ['monorail', 'onestroke', 'masyu'],
  site: { id: 'monorail', name: { ko: '모노레일', en: 'Monorail' }, file: 'src/lib/monorail.ts' },
}, {
  meta: {
    title: '모노레일 규칙 — 더 지니어스 시즌3 블랙가넷 10회전 데스매치, 순환선을 완성하는 타일 게임',
    description: '더 지니어스: 블랙가넷 10회전 데스매치 모노레일의 규칙을 정리했어요. 기차역 2장과 양면 철로 타일 16장, 한 턴에 1–3장 일렬 놓기, 마지막 타일로 순환선 완성, 불가능 선언과 완성 시도, 그리고 PUZZLTHINK에서 바로 플레이.',
    keywords: ['모노레일', '모노레일 게임', '더 지니어스 모노레일', '더 지니어스3 데스매치', '블랙가넷 데스매치', '모노레일 규칙', '베니스 커넥션'],
  },
  title: '모노레일 — 더 지니어스: 블랙가넷 10회전 데스매치',
  name: '모노레일',
  lead: '기차역 두 장에서 시작해 직선·곡선 철로 타일을 번갈아 1–3장씩 놓아요. 판 위의 철로를 하나의 순환선으로 완성하는 마지막 타일을 놓으면 이겨요.',
  summary: '직선·곡선 양면 타일을 1–3장씩 번갈아 놓아, 순환선을 완성하는 마지막 수를 두는 사람이 이기는 운 없는 추상 전략 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**타일**: 양쪽 끝으로 철로가 열린 기차역 타일 2장(처음부터 놓여 있어요), 철로 타일 16장. 철로 타일은 앞면이 직선, 뒷면이 ㄱ자 곡선이에요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '놓기', body: '선부터 번갈아 자기 차례에 타일을 **1–3장** 놓아요. 원하는 면으로 놓을 수 있고, 시간 제한은 없어요.' },
      { title: '붙이기', body: '새 타일은 이미 놓인 타일의 상하좌우 한 면에 맞닿아야 해요. 철로가 이어지게 놓을 필요는 없어요.' },
      { title: '일렬', body: '두 장 이상 놓을 때는 한 줄로 나란히 놓아야 해요.' },
      { title: '완성', body: '16장을 다 쓸 필요는 없지만, 완성할 때는 판에 놓인 모든 철로가 하나로 이어진 순환선이어야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '기차역에서 출발해 기차역으로 돌아오는 순환선을 **완성하는 마지막 타일을 놓은 사람**이 이겨요.',
      '**불가능 선언**: 내 차례가 시작될 때, 남은 타일로는 하나의 순환선을 만들 수 없다고 판단되면 선언할 수 있어요. 그러면 상대가 남은 타일로 완성을 시도해요. 완성하면 상대가 이기고, 못 하면 선언한 사람이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '원작은 알렉스 랜돌프의 보드게임 「베니스 커넥션(Venice Connection)」이에요.',
      '이 시즌 10회전에 처음 나왔고, 이후 「그랜드 파이널」 데스매치로 규칙 그대로 다시 나왔어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '모노레일은 운도, 숨겨진 정보도 없는 게임이에요. 그래서 수학적으로는 둘 중 한쪽에 반드시 이기는 수순이 있는 게임이지만, 경우의 수가 많아 실전에서는 **남은 칸과 남은 장수를 세는 능력**으로 승부가 갈려요.' },
    { type: 'cards', items: [
      { title: '순환선은 늘 짝수', body: '격자 위의 닫힌 고리는 가로로 나간 만큼 돌아오고 세로로 나간 만큼 돌아와야 해서, 칸 수가 항상 짝수예요. 기차역 두 장을 빼도 철로 타일 수는 짝수라, 남은 장수와 완성까지 필요한 장수를 맞춰 보면 불가능한 모양을 빨리 알아볼 수 있어요.' },
      { title: '1–3장, 일렬이 만드는 끝내기', body: '완성까지 남은 칸이 한 줄로 세 칸 이하이면, 차례가 온 사람이 바로 끝내요. 그래서 상대에게 "한 줄 세 칸 이하"를 남기지 않는 것이 수비의 기본이고, 남은 칸이 일렬이 아니거나 네 칸이 되도록 모양을 비트는 것이 공격이에요.' },
      { title: '이어지지 않아도 놓는다', body: '철로가 당장 맞지 않아도 놓을 수 있어서, 지금은 엉뚱해 보이는 타일이 나중에 완성 경로를 바꿔요. 길을 우회시켜 필요한 장수를 늘리면 차례의 짝·홀을 뒤집을 수 있고, 장수가 바닥나는 시점을 노려 불가능 선언으로 이기는 길도 열려요.' },
    ], columns: 1 },
    { type: 'p', text: '이론적 필승 수순은 존재하지만 사람이 그 자리에서 다 읽기는 어려워 **실전의 우월 전략은 없어요.** 결국 상대가 끝낼 수 있는 모양을 남기지 않으면서, 내 차례에 끝낼 수 있는 모양을 만드는 쪽이 이겨요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      '타일 구성(기차역 2장, 양면 철로 16장), 1–3장 일렬 놓기, 연결되지 않아도 되는 배치, 완성 승리, 불가능 선언과 완성 시도는 방송과 같아요.',
      '방송은 시간 제한이 없었지만, PUZZLTHINK는 차례마다 90·60·30초 중 고른 제한 시간이 있고 시간을 넘기면 져요.',
      '불가능 선언을 받은 쪽은 남은 타일을 1–3장·일렬 제한 없이 한꺼번에 놓아 완성을 보여 줘요. 포기하면 선언한 쪽이 이기고, 가능했던 완성 예를 결과 화면에서 보여 줘요.',
      'AI나 친구와 온라인으로 해요.',
    ] },
  ],
  similar: [
    { name: '베니스 커넥션 (Venice Connection)', players: '2명', alike: '모노레일의 원작이에요. 직선·곡선 양면 타일로 하나의 닫힌 운하를 완성하는 마지막 수를 다퉈요.', differs: '기차역 같은 시작 타일 없이 시작하는 등 세부가 조금 달라요.' },
    { name: '트랙스 (Trax)', players: '2명', alike: '양면 타일을 붙여 가며 선으로 닫힌 고리를 만드는 2인 추상 게임이에요.', differs: '타일마다 두 색 선이 있어, 내 색으로 고리나 긴 선을 먼저 만드는 쪽이 이겨요.' },
  ],
}, {
  meta: {
    title: 'Monorail rules — The Genius: Black Garnet death match of round 10, completing a loop of track',
    description: 'The rules of Monorail (모노레일), death match of round 10 of The Genius: Black Garnet: two station tiles and sixteen double-sided rail tiles, one to three tiles in a row per turn, winning with the tile that closes the loop, the Impossible call and the completion attempt, and a playable version on PUZZLTHINK.',
    keywords: ['Monorail', 'The Genius Monorail', 'Venice Connection', 'The Genius death match', '모노레일'],
  },
  title: 'Monorail — The Genius: Black Garnet, death match of round 10',
  name: 'Monorail (모노레일)',
  lead: 'Starting from two station tiles, players take turns laying one to three straight or curved rail tiles. Whoever lays the tile that turns everything on the table into one loop wins.',
  summary: 'Lay double-sided straight/curve tiles one to three at a time; the player who completes the loop wins. Pure abstract strategy.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two death-match players.',
      '**Tiles**: two station tiles open at both ends (already placed) and sixteen rail tiles, straight on one side and a right-angle curve on the other.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Placing', body: 'Players alternate laying **one to three** tiles, either face up, with no time limit.' },
      { title: 'Touching', body: 'A new tile must touch an existing tile on one of its four sides; the track does not have to connect yet.' },
      { title: 'In a row', body: 'Two or more tiles must be laid in one straight row.' },
      { title: 'Completion', body: 'Not all sixteen need be used, but at completion every rail on the table must form one connected loop.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Laying the last tile** of a loop that leaves a station and returns to it wins.',
      '**Impossible**: at the start of your turn you may declare that the remaining tiles cannot make one loop. The opponent then tries to complete it with what is left: success wins for them, failure wins for the declarer.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'It is based on Alex Randolph’s board game Venice Connection.',
      'It debuted in this season’s round 10 and returned unchanged as a death match in The Genius: Grand Final.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Monorail has no luck and no hidden information. Mathematically one side must have a winning line, but there are so many positions that at the table it comes down to **counting the squares and tiles left**.' },
    { type: 'cards', items: [
      { title: 'Loops are always even', body: 'A closed loop on a grid must come back as far as it goes in each direction, so it always has an even number of squares; with the two stations taken off, the rail-tile count is even too. Comparing tiles left with tiles needed spots impossible shapes early.' },
      { title: 'Finishing with one to three in a row', body: 'If the squares left to finish lie in one row of three or fewer, the player to move ends the game. Never leaving “three or fewer in a row” is basic defence; bending the gap so it is not in a row, or is four long, is the attack.' },
      { title: 'Tiles need not connect', body: 'A tile that fits nothing now can change the completion path later. Detours that raise the tiles needed can flip whose turn the finish falls on, and aiming for the moment tiles run out opens a win by the Impossible call.' },
    ], columns: 1 },
    { type: 'p', text: 'A theoretical winning line exists, but nobody can read it all at the table, so **in practice there is no dominant strategy**. The winner is the one who never leaves a finishable shape and builds one for their own turn.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'The tiles (two stations, sixteen double-sided rails), one to three in a row, unconnected placement, the completion win and the Impossible call with its completion attempt match the broadcast.',
      'The broadcast had no time limit; PUZZLTHINK has a per-turn limit of 90, 60 or 30 seconds, and running out loses.',
      'After an Impossible call, the challenged player lays the remaining tiles all at once, free of the one-to-three and in-a-row limits. Giving up hands the win to the declarer, and the result screen shows a completion that was possible.',
      'You play the AI or a friend online.',
    ] },
  ],
  similar: [
    { name: 'Venice Connection', players: '2', alike: 'Monorail’s original: double-sided straight/curve tiles and a race to lay the last piece of one closed canal.', differs: 'It starts without station tiles, among small differences.' },
    { name: 'Trax', players: '2', alike: 'A two-player abstract game of adding double-sided tiles and closing loops of track.', differs: 'Each tile carries two colours of line, and the first to make a loop or long line in their colour wins.' },
  ],
});

export const doubtingYutnori = g3Game({
  slug: 'doubting-yutnori', kind: 'main', when: round(11), episode: ep(11), eps: [11], note: 'two',
  related: ['russianRoulette', 'indianPoker', 'twoSidedPoker'],
}, {
  meta: {
    title: '의심 윷놀이 규칙 — 더 지니어스 시즌3 블랙가넷 11회전 메인매치, 거짓말할 수 있는 윷놀이와 베팅',
    description: '더 지니어스: 블랙가넷 11회전 메인매치 의심 윷놀이의 규칙을 정리했어요. 게스트 4명의 10면체 주사위 윷놀이, 나만 보는 결과와 거짓말, 지니어스 플레이어의 의심·먼저 들어올 말 베팅·최종 우승자 베팅, 가넷으로 정하는 순위까지.',
    keywords: ['의심 윷놀이', '더 지니어스 의심 윷놀이', '더 지니어스3 윷놀이', '블랙가넷 11회전', '지니어스 윷놀이', '의심윷놀이 규칙'],
  },
  title: '의심 윷놀이 — 더 지니어스: 블랙가넷 11회전 메인매치',
  name: '의심 윷놀이',
  lead: '게스트 넷이 윷 대신 10면체 주사위로 윷놀이를 해요. 결과는 굴린 사람만 보니 거짓말을 할 수 있어요. 남은 지니어스 플레이어 셋은 그 거짓을 의심하고, 누가 이길지에 가넷을 걸어요.',
  summary: '게스트들이 거짓말할 수 있는 주사위 윷놀이를 하고, 지니어스 플레이어 셋은 의심과 베팅으로 가넷을 불리는 게임.',
  setup: [
    { type: 'list', items: [
      '**게스트(4명)**: 이번 시즌 탈락자 넷이 각자 말 6개를 가지고 윷놀이를 해요.',
      '**주사위**: 10면체. 도·개·걸이 두 면씩, 윷·모가 한 면씩, 꽝이 두 면이에요. 결과는 **굴린 게스트만** 봐요.',
      '**지니어스 플레이어(3명)**: 가진 가넷으로 의심하고 베팅해요. 가넷 테이블에는 처음에 가넷 4개가 놓여 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '게스트의 차례', body: '주사위를 굴려 결과를 말하고 말을 옮겨요. 거짓으로 말해도 돼요. 꽝이면 판 위의 자기 말 하나가 제거돼요. 말 2개가 먼저 들어온 게스트가 윷놀이에서 우승해요.' },
      { title: '의심', body: '게스트가 결과를 말하고 말을 옮길 때마다 지니어스 플레이어는 의심할 수 있어요(한 번에 한 명, 먼저 외친 사람). 맞으면 테이블에서 가넷 1개를 가져오고 그 게스트의 말 하나가 판에서 제거돼요. 틀리면 내 가넷 1개를 테이블에 내요.' },
      { title: '먼저 들어올 말 베팅', body: '시작 전에 어느 게스트의 말이 가장 먼저 들어올지 한 명을 골라 가넷 1–5개를 몰래 걸어요. 맞히면 2배를 받고 틀리면 잃어요. 말이 하나 들어올 때마다 다음 말에 대해 다시 걸어요.' },
      { title: '최종 우승자 베팅', body: '시작 전에 게스트 이름 카드 4장 중 1장을 무작위로 뽑아(뽑은 카드는 비공개, 남은 한 장도 비공개) 그 게스트에게 가넷 1–10개를 몰래 걸어요. 그 게스트가 우승하면 3배를 받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '윷놀이가 끝났을 때 **원래 가지고 있던 가넷을 포함해** 가넷이 가장 많은 지니어스 플레이어가 우승하고, 나머지 두 명은 자동으로 데스매치에 가요.',
      '윷놀이에서 이긴 게스트는 테이블에 남은 가넷 하나당 100만 원(최대 1천만 원)을 받고, 11개를 넘는 가넷은 결승 특별 보상으로 넘어가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '가넷이 없으면 의심할 수 없고, 먼저 들어올 말 베팅도 할 수 없어요. 베팅은 정해진 때에만, 게임 도중 추가로 걸 수 없어요.',
      '가넷 수가 같으면 게임을 시작할 때 가넷이 더 적었던 사람이 우승해요.',
      '게스트 쪽: 윷·모가 나오면 추가 이동을 모아 두지 않고 바로 움직여요. 윷·모로 말을 잡았을 때 더 던지는 기회는 한 번뿐이에요. 출발점을 지나야 들어온 것으로 쳐요. 잡힌 말은 제거되지 않고 주인에게 돌아가요.',
      '의심으로 제거되는 말은 그 결과로 옮긴 말이고, 업힌 말이면 둘 중 하나만 제거돼요. 판에 말이 없는데 꽝이라고 하면 출발하지 않은 말 하나가 제거돼요.',
      '영어 위키백과는 꽝과 의심 성공을 "말이 출발점으로 돌아가는 것"으로 요약하지만, 이 페이지는 "말이 제거된다"는 나무위키의 규칙 설명을 따랐어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '의심 윷놀이에서 윷을 노는 것은 게스트지만, 진짜 승부는 **지니어스 플레이어 셋 사이**에 있어요. 셋 중 둘이 데스매치에 가니, 가넷을 가장 많이 남기는 한 명만 살아요.' },
    { type: 'cards', items: [
      { title: '출발선이 다르다', body: '원래 가진 가넷까지 세어 순위를 정하므로, 시작할 때 가넷이 많은 사람이 크게 유리해요. 뒤진 사람은 3배를 주는 최종 우승자 베팅에 크게 걸어야 따라잡을 수 있고, 앞선 사람은 적게 걸고 잃지 않는 것이 최선이에요. 동점이면 시작 가넷이 적었던 사람이 이기는 규칙이 이 격차를 조금 메워요.' },
      { title: '의심은 수입이자 무기', body: '테이블에 가넷이 남아 있는 동안 의심은 가넷을 버는 수단이에요. 테이블이 비면 성공해도 얻는 것이 없지만, 상대 게스트의 말을 지우는 효과는 남아요. 그래서 후반의 의심은 내가 건 게스트를 이기게 하려는 경주 조작 수단이 돼요.' },
      { title: '숨긴 카드와 게스트 포섭', body: '최종 우승자 베팅의 게스트는 무작위로 뽑고 아무에게도 알려지지 않아요. 그래서 "당신 카드를 뽑았다"는 말로 여러 게스트를 동시에 내 편으로 만들 수 있고, 게스트는 그 말을 믿고 남의 말을 견제해 줄 수 있어요. 거짓 결과를 말하는 게스트와 그것을 눈감아 주는 플레이어가 손을 잡을 수도 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '주사위 운, 게스트의 거짓말, 숨긴 베팅이 겹쳐 **우월 전략은 없어요.** 다만 순위가 가넷 총량으로 정해진다는 점 때문에, 이 게임은 앞선 사람의 지키기와 뒤진 사람의 도박이 맞서는 구도가 돼요.' },
  ],
  similar: [
    { name: '차오차오 (Ciao Ciao)', players: '2–4명', alike: '컵 속 주사위를 혼자 보고 결과를 말한 뒤 말을 옮기고, 다른 사람은 거짓이라고 의심할 수 있어요.', differs: '모두가 직접 경주에 참여하고, 의심이 틀리면 의심한 사람이 말을 잃어요.' },
    { name: '윷놀이', players: '2명 이상', alike: '도·개·걸·윷·모로 말을 옮기고, 말을 잡고 업는 기본 규칙이 같아요.', differs: '윷가락을 모두가 보는 앞에서 던져 거짓말이 없어요.' },
  ],
}, {
  meta: {
    title: 'Doubting Yutnori rules — The Genius: Black Garnet round 11 main match, yut with lies and bets',
    description: 'The rules of Doubting Yutnori (의심 윷놀이), round 11 main match of The Genius: Black Garnet: four guests playing yut with a ten-sided die only the roller sees, the lies that allows, and the three Genius players’ doubts, first-piece bets and winner bets, ranked by garnets.',
    keywords: ['Doubting Yutnori', 'The Genius Yutnori', 'The Genius Black Garnet', 'The Genius season 3', '의심 윷놀이'],
  },
  title: 'Doubting Yutnori — The Genius: Black Garnet, round 11 main match',
  name: 'Doubting Yutnori (의심 윷놀이)',
  lead: 'Four guests play yut with a ten-sided die instead of sticks. Only the roller sees the result, so they can lie. The three remaining Genius players doubt those claims and bet garnets on who will win.',
  summary: 'Guests play a yut race in which lying about the die is allowed; the three Genius players grow their garnets by doubting and betting.',
  setup: [
    { type: 'list', items: [
      '**Guests (4)**: four of the season’s eliminated players, six pieces each, play yut (yutnori), the Korean race game.',
      '**Die**: ten-sided—two faces each of do, gae and geol (1–3 spaces), one each of yut (4) and mo (5), and two blanks. **Only the roller** sees it.',
      '**Genius players (3)**: doubt and bet with their garnets. A garnet table starts with four garnets.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'A guest’s turn', body: 'Roll, announce a result and move—lying is allowed. A blank removes one of that guest’s pieces on the board. The first guest to bring two pieces home wins the race.' },
      { title: 'Doubt', body: 'Whenever a guest announces and moves, a Genius player may doubt (one at a time, first to call). If right, they take a garnet from the table and that guest’s piece is removed; if wrong, they put one of their own garnets on the table.' },
      { title: 'First-piece bet', body: 'Before the race, each secretly stakes 1–5 garnets on which guest’s piece will finish first: double if right, lost if wrong. After each piece finishes, they bet again on the next.' },
      { title: 'Winner bet', body: 'Before the race, each draws one of four guest-name cards at random (kept secret; the undrawn card stays hidden too) and secretly stakes 1–10 garnets on that guest: triple if that guest wins.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'When the race ends, the Genius player with the most garnets **including those held before the game** wins; the other two go straight to the death match.',
      'The winning guest receives ₩1 million per garnet left on the table (up to ₩10 million); garnets beyond the eleventh go to the final as a special reward.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Without garnets you cannot doubt or make the first-piece bet; bets are made only at their set times.',
      'If garnet totals tie, the player who started with fewer garnets wins.',
      'Guest rules: yut and mo are moved at once rather than saved; capturing with yut or mo gives only one extra roll; a piece must pass the start to count as home; captured pieces go back to their owner, not out of the game.',
      'Doubt removes the piece that was moved on the doubted claim; from a stacked pair only one is removed. Claiming a blank with no piece on the board removes an unstarted piece.',
      'English Wikipedia summarises blanks and successful doubts as sending a piece back to the start; this page follows the fan wiki’s transcription, in which the piece is removed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The guests play the yut, but the real contest is **among the three Genius players**: two go to the death match, so only the one with the most garnets survives.' },
    { type: 'cards', items: [
      { title: 'Different starting lines', body: 'Garnets held beforehand count, so whoever starts richer has a big edge. Trailing players must stake heavily on the triple-paying winner bet; the leader does best betting small and losing little. The tie-break favouring the poorer starter narrows the gap slightly.' },
      { title: 'Doubt as income and weapon', body: 'While garnets remain on the table, doubting earns. Once it is empty a correct doubt earns nothing but still removes a rival guest’s piece, so late doubts become a way to steer the race toward the guest you backed.' },
      { title: 'Hidden cards and recruited guests', body: 'Nobody knows which guest each player drew for the winner bet, so “I drew you” can win over several guests at once, who may then harass rival pieces. A lying guest and a player who never doubts them can work together.' },
    ], columns: 1 },
    { type: 'p', text: 'Dice luck, guests’ lies and hidden bets overlap, so **there is no dominant strategy**. Because ranking is by total garnets, the game sets the leader’s caution against the trailers’ gambles.' },
  ],
  similar: [
    { name: 'Ciao Ciao', players: '2–4', alike: 'Look at the die alone in a cup, announce a result and move; others may call it a lie.', differs: 'Everyone races in person, and a wrong doubt costs the doubter a piece.' },
    { name: 'Yut (yutnori)', players: '2+', alike: 'Pieces move by do, gae, geol, yut and mo, capturing and stacking as usual.', differs: 'The sticks are thrown in full view, so there is no lying.' },
  ],
});

export const bettingBlackAndWhite = g3Game({
  slug: 'betting-black-and-white', kind: 'death', when: round(11), episode: ep(11), eps: [11],
  extra: [namuGame('흑과 백(더 지니어스)', 'Black and White (The Genius)')], note: 'two',
  related: ['blackWhite', 'blackWhite2', 'indianPoker'],
}, {
  meta: {
    title: '베팅! 흑과 백 규칙 — 더 지니어스 시즌3 블랙가넷 11회전 데스매치, 숫자 타일에 미리 거는 칩',
    description: '더 지니어스: 블랙가넷 11회전 데스매치 베팅! 흑과 백의 규칙을 정리했어요. 0–9 숫자 타일(짝수 흑·홀수 백), 칩 30개를 열 타일에 미리 나눠 걸기, 콜할 때 다른 타일 칩 끌어오기, 포기하면 비공개, 60칩 중 30칩 넘기기까지.',
    keywords: ['베팅 흑과 백', '베팅! 흑과 백', '더 지니어스 흑과 백', '더 지니어스3 데스매치', '블랙가넷 11회전', '흑과백 베팅'],
  },
  title: '베팅! 흑과 백 — 더 지니어스: 블랙가넷 11회전 데스매치',
  name: '베팅! 흑과 백',
  lead: '0–9 숫자 타일 열 장의 순서와, 타일마다 걸 칩을 시작 전에 모두 정해 둬요. 칩을 적게 건 쪽은 따라 걸지 포기할지 고르고, 끝에 칩이 많은 사람이 이겨요.',
  summary: '0–9 숫자 타일의 순서와 칩 30개 배분을 미리 정하고, 타일마다 따라 걸지 포기할지 겨루는 1:1 승부.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명. 가운데 가림막을 두고 시작해요.',
      '**타일**: 각자 0–9 숫자 타일 10개. 짝수(0·2·4·6·8)는 흑, 홀수(1·3·5·7·9)는 백이에요.',
      '**칩**: 각자 30개.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '미리 배치', body: '가림막 뒤에서 열 타일의 대결 순서를 정해 뒷면으로 놓고, 칩 30개를 열 타일에 나눠 걸어요. 타일마다 1개 이상, 30개를 모두 걸어야 해요. 시작하면 건 칩은 바꾸거나 더할 수 없어요.' },
      { title: '대결', body: '가림막을 치우고 첫 타일부터 차례로 겨뤄요. 두 사람이 같은 수를 걸었으면 바로 타일을 공개해요.' },
      { title: '적게 건 쪽의 선택', body: '건 칩이 다르면 적게 건 사람이 **따라 걸기**(상대만큼 맞추기)나 **포기** 중 하나를 골라요.' },
      { title: '공개와 정산', body: '맞추면 두 타일을 공개해 큰 숫자가 그 자리의 칩을 모두 가져가요. 같은 숫자면 각자 건 칩을 돌려받아요. 포기하면 타일은 공개되지 않고 그 자리 칩은 상대가 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '열 타일을 모두 겨룬 뒤 칩이 더 많은 사람이 이기고, 진 사람이 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '따라 걸 칩이 손에 없으면, 내 다른(아직 겨루지 않은) 타일에 건 칩을 빼서 쓸 수 있어요. 단 타일마다 1개는 남겨야 해요. 게임 중 딴 칩도 따라 걸기에 쓸 수 있어요.',
      '시즌 2의 「흑과 백」을 변형한 게임으로, 이후 「그랜드 파이널」에도 다시 나왔어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '베팅! 흑과 백은 **모든 결정을 미리 내려 두는 포커**예요. 시작 전에 순서와 베팅을 다 정하므로, 게임 중에 할 수 있는 선택은 "따라 걸까, 포기할까" 하나뿐이에요.' },
    { type: 'cards', items: [
      { title: '칩 배치가 곧 패', body: '두 사람 모두 같은 0–9를 가지고 있으니 차이는 순서와 칩 배치뿐이에요. 가림막을 치우면 상대가 어느 자리에 칩을 많이 걸었는지가 보이는데, 그 자리에는 큰 숫자가 있을 가능성이 높아요. 그 기대를 역이용해 작은 숫자에 크게 거는 블러핑도 가능하지만, 상대의 큰 숫자와 맞물려 콜을 받으면 한 번에 무너져요.' },
      { title: '포기는 정보를 숨긴다', body: '포기하면 타일이 공개되지 않아요. 작은 칩만 잃고 내 숫자를 감출 수 있어서, 남은 타일에 대한 상대의 추리를 흐려요. 반대로 콜해서 공개된 타일은 지워지므로, 뒤로 갈수록 상대에게 남은 숫자의 후보가 좁혀져요.' },
      { title: '30을 넘기면 끝', body: '전체 칩은 60개라 31개를 확보하는 순간 사실상 승부가 나요. 큰 판 한두 번이 결과를 정하므로, 질 것 같은 타일에는 1개씩만 걸고 이길 만한 타일에 모으는 것이 기본이에요. 콜할 때 다른 타일에서 칩을 빌려 오면 그 타일의 판돈이 줄어든다는 점도 계산해야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '순서와 배치를 미리 정하는 동시 결정 게임이라 **우월 전략은 없어요.** 큰 숫자에 크게 거는 정석과 그 정석을 노리는 블러핑이 서로를 이기는 가위바위보 구조라, 배치 단계의 수읽기와 운이 함께 작용해요.' },
  ],
  similar: [
    { name: '다빈치 코드 (Da Vinci Code)', players: '2–4명', alike: '흑·백 숫자 타일을 숨기고 상대 타일의 숫자를 추리해요. 「흑과 백」 시리즈의 모티브로 알려진 게임이에요.', differs: '칩 베팅 없이, 상대 타일을 하나씩 맞혀 모두 공개시키면 이겨요.' },
    { name: '배틀 라인 (Battle Line)', players: '2명', alike: '아홉 자리마다 카드를 놓아 자리별로 승부하고, 어디에 힘을 실을지가 핵심이에요.', differs: '카드를 한 장씩 번갈아 놓아 조합을 만들고, 미리 배치하지 않아요.' },
  ],
}, {
  meta: {
    title: 'Betting Black and White rules — The Genius: Black Garnet death match of round 11, chips pre-set on number tiles',
    description: 'The rules of Betting! Black and White (베팅! 흑과 백), death match of round 11 of The Genius: Black Garnet: number tiles 0–9 (even black, odd white), 30 chips spread over ten tiles in advance, borrowing from later tiles to call, folds that stay hidden, and passing 30 of the 60 chips.',
    keywords: ['Betting Black and White', 'The Genius Black and White', 'The Genius death match', 'The Genius Black Garnet', '베팅! 흑과 백'],
  },
  title: 'Betting! Black and White — The Genius: Black Garnet, death match of round 11',
  name: 'Betting! Black and White (베팅! 흑과 백)',
  lead: 'Before play, each player fixes the order of ten number tiles (0–9) and the chips on each. The player who bet less on a tile chooses to match or fold; more chips at the end wins.',
  summary: 'Pre-set the order of tiles 0–9 and the spread of 30 chips, then match or fold tile by tile.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two death-match players, with a screen between them at the start.',
      '**Tiles**: ten each, 0–9: even numbers (0, 2, 4, 6, 8) black, odd (1, 3, 5, 7, 9) white.',
      '**Chips**: 30 each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Set-up', body: 'Behind the screen, lay the ten tiles face down in the order they will fight and spread all 30 chips across them, at least one per tile. Once play starts, bets cannot be moved or added to.' },
      { title: 'Duels', body: 'The screen comes down and the tiles meet in order. If both bet the same, the tiles are revealed at once.' },
      { title: 'The smaller bet decides', body: 'If the bets differ, the player who bet less either **matches** or **folds**.' },
      { title: 'Reveal and payout', body: 'After a match, both tiles are revealed and the higher number takes all chips on that spot; equal numbers return each stake. A fold leaves the tiles hidden and hands that spot’s chips to the opponent.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After all ten tiles, the player with more chips wins; the loser is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Short of chips to match, you may take chips from your own later tiles, leaving at least one on each; chips won during play can be used too.',
      'It is a variant of season 2’s Black and White and returned later in The Genius: Grand Final.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Betting! Black and White is **poker with every decision made in advance**. Order and bets are fixed before play, so the only live choice is match or fold.' },
    { type: 'cards', items: [
      { title: 'Your chip layout is your hand', body: 'Both hold the same 0–9, so the only differences are order and chip layout. When the screen comes down, big stacks point to big numbers. Stacking a small number to exploit that is possible, but if it meets a big number and gets called, it collapses at once.' },
      { title: 'Folding hides information', body: 'A fold keeps the tiles hidden: you lose a small stake and conceal your number, clouding the opponent’s reading of what remains. Called tiles are revealed and crossed off, so later on the candidates for the opponent’s remaining tiles shrink.' },
      { title: 'Past 30 it is over', body: 'There are 60 chips in all, so securing 31 effectively decides it. One or two big spots settle the game, so the baseline is one chip on likely losers and stacks on likely winners. Borrowing chips to call shrinks the stake on the tile you borrow from.' },
    ], columns: 1 },
    { type: 'p', text: 'It is a simultaneous, pre-committed game, so **there is no dominant strategy**: the standard play (big chips on big numbers) and the bluff against it beat each other like rock-paper-scissors, and reading and luck at the layout stage both count.' },
  ],
  similar: [
    { name: 'Da Vinci Code', players: '2–4', alike: 'Hidden black and white number tiles whose values you deduce; known as the inspiration for the Black and White series.', differs: 'No chips: you win by guessing and exposing all of the opponent’s tiles.' },
    { name: 'Battle Line', players: '2', alike: 'Cards are committed to nine spots, each fought separately, and choosing where to concentrate is the core.', differs: 'Cards are played one at a time to build formations, not laid out in advance.' },
  ],
});

export const sameNumberHunt = g3Game({
  slug: 'same-number-hunt', kind: 'final', when: { ko: '결승 2국', en: 'Final, game 2' }, episode: ep(12), eps: [12], note: 'two',
  related: ['equationTower', 'equationSignal', 'gyulhap'],
}, {
  meta: {
    title: '같은 숫자 찾기 규칙 — 더 지니어스 시즌3 블랙가넷 결승 2국, 5초 기억으로 수식 만들기',
    description: '더 지니어스: 블랙가넷 결승 두 번째 게임 같은 숫자 찾기의 규칙을 정리했어요. A–P 16칸 뒷면의 숫자 1–12와 사칙연산, 단 한 번 5초 공개, 타깃넘버와 버저, 숫자·기호·숫자 호명, 10점 선취, 우선권·더블찬스·엿보기 아이템까지.',
    keywords: ['같은 숫자 찾기', '더 지니어스 같은 숫자 찾기', '더 지니어스3 결승', '블랙가넷 결승전', '지니어스 기억력 게임', '같은 숫자 찾기 규칙'],
  },
  title: '같은 숫자 찾기 — 더 지니어스: 블랙가넷 결승 2국',
  name: '같은 숫자 찾기',
  lead: '알파벳 16칸 뒤에 숨은 숫자와 사칙연산 기호를 단 5초 동안 외워요. 타깃넘버가 나오면 버저를 누르고, 그 수가 되는 "숫자·기호·숫자"를 알파벳으로 불러요.',
  summary: '5초 동안 본 16칸의 숫자·기호를 기억해, 타깃넘버가 되는 식을 알파벳으로 부르는 결승 기억력·암산 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 2명.',
      '**판**: A–P 알파벳이 적힌 16칸. 뒷면에는 숫자 1–12와 기호 ＋·－·×·÷가 하나씩 있어요.',
      '**공개**: 시작 전에 뒷면을 **딱 한 번, 5초** 보여 줘요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '타깃넘버', body: '라운드마다 딜러가 타깃넘버를 하나 뽑아요. 판의 숫자와 기호로 만들 수 있는 자연수 가운데서 나오고, 같은 수는 다시 나오지 않아요.' },
      { title: '버저', body: '먼저 버저를 누른 사람이 5초 안에 "숫자·기호·숫자" 순서대로 알파벳 세 개를 불러요. 한 식에 같은 숫자를 두 번 쓸 수 없어요.' },
      { title: '공개', body: '부른 세 칸이 순서대로 뒤집혀요. 틀렸어도 세 칸의 뒷면은 모두 공개돼요. 5초 안에 세 개를 다 부르지 못하면 공개되지 않아요.' },
      { title: '기회 넘기기', body: '틀리거나 시간을 넘기면 기회가 상대에게 가요. 이때는 5초를 세지 않고, 버저도 누르지 않아도 돼요. 맞힐 때까지 번갈아 기회를 얻어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '맞히면 승점 1점. **10점을 먼저 얻은 사람**이 이 게임을 이겨요(결승은 세 게임 중 두 게임을 먼저 이기는 쪽이 우승).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**아이템** — 우선권: 라운드 시작 때 써서 버저와 상관없이 먼저 부를 기회를 가져요. 더블찬스: 버저를 누른 뒤 써서 숫자 3개·기호 2개짜리 식을 만들고, 맞히면 2점. 엿보기: 버저를 누른 뒤 원하는 칸 하나의 뒷면을 보고 식을 만들어요(두 사람 모두에게 공개).',
      '더블찬스나 엿보기를 쓰면 그 확인을 마친 직후부터 5초를 세요.',
      '이 시즌에 새로 나온 결승 게임이고, 이후 「그랜드 파이널」 데스매치로 다시 나왔어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '같은 숫자 찾기는 기억과 암산을 동시에 묻는 게임이에요. 5초 만에 16칸을 다 외우기는 거의 불가능하니, **무엇을 먼저 외울지**가 첫 번째 전략이에요.' },
    { type: 'cards', items: [
      { title: '기호 네 칸이 열쇠', body: '모든 식에는 기호가 꼭 하나 들어가요. 기호 네 칸의 위치만 확실히 외워도, 숫자는 틀린 답에서 공개되는 칸들로 점점 채워 나갈 수 있어요. 반대로 기호 위치를 모르면 숫자를 아무리 많이 알아도 식을 부를 수 없어요.' },
      { title: '틀린 답은 상대에게 주는 선물', body: '틀린 답의 세 칸은 두 사람 모두에게 공개되고, 기회는 시간 제한 없이 상대에게 넘어가요. 확신 없이 버저를 누르면 상대에게 정보와 여유를 함께 넘겨주는 셈이라, 버저를 누를지 말지가 기억력만큼 중요해요.' },
      { title: '만들기 쉬운 수, 어려운 수', body: '12처럼 여러 식(곱하기·더하기 등)으로 만들 수 있는 수는 아는 칸이 적어도 맞히기 쉬워요. 큰 소수처럼 만드는 방법이 한두 개뿐인 수는 정확한 두 칸을 알아야 해요. 타깃넘버가 무작위라, 어떤 수에 강한 기억을 가졌는지가 운처럼 작용하기도 해요.' },
    ], columns: 1 },
    { type: 'p', text: '기억은 사람마다 다르고 공개되는 정보는 두 사람이 공유하니 **우월 전략은 없어요.** 다만 판이 공개될수록 기억의 차이가 줄어들어, 초반 몇 라운드에서 얼마나 앞서느냐가 승부에 크게 작용해요.' },
  ],
  similar: [
    { name: '같은 그림 찾기 (Memory / Concentration)', players: '1명 이상', alike: '뒤집힌 카드의 위치를 기억하고, 상대가 뒤집은 카드도 내 정보가 돼요.', differs: '같은 그림 두 장을 찾을 뿐, 계산은 없어요.' },
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자 카드와 사칙연산으로 목표 숫자를 빨리 만드는 암산 게임이에요.', differs: '숫자가 모두 공개되어 있어 기억할 필요가 없어요.' },
  ],
}, {
  meta: {
    title: 'Same Number Hunt rules — The Genius: Black Garnet final, game 2: memorise for five seconds, then calculate',
    description: 'The rules of Same Number Hunt (같은 숫자 찾기), second game of the final of The Genius: Black Garnet: sixteen squares A–P hiding the numbers 1–12 and the four operators, one five-second look, target numbers and buzzers, calling number–operator–number by letter, first to ten, and the Priority, Double Chance and Peek items.',
    keywords: ['Same Number Hunt', 'The Genius Same Number Hunt', 'The Genius final', 'The Genius Black Garnet', '같은 숫자 찾기'],
  },
  title: 'Same Number Hunt — The Genius: Black Garnet, final game 2',
  name: 'Same Number Hunt (같은 숫자 찾기)',
  lead: 'Memorise, in just five seconds, the numbers and operators hidden behind sixteen lettered squares. When a target number appears, buzz in and call the letters of a number–operator–number that makes it.',
  summary: 'Remember sixteen hidden numbers and operators from one five-second look, then call expressions for target numbers: the final’s memory and arithmetic duel.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two finalists.',
      '**Board**: sixteen squares labelled A–P, hiding the numbers 1–12 and the operators +, −, × and ÷, one each.',
      '**The look**: before play, the backs are shown **once, for five seconds**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Target', body: 'Each round the dealer draws a target number from the natural numbers the board can make; no target repeats.' },
      { title: 'Buzzer', body: 'The first to buzz has five seconds to call three letters in the order number, operator, number. The same number cannot be used twice in one expression.' },
      { title: 'Reveal', body: 'The three squares flip in order; even if wrong, all three are shown. If three letters are not called in time, nothing is shown.' },
      { title: 'Passing over', body: 'A wrong answer or time-out passes the chance to the opponent, with no five-second count and no need to buzz. Chances alternate until someone is right.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Each correct answer scores 1; **the first to 10** wins this game (the final goes to whoever wins two of three games).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Items** — Priority: used at the start of a round to answer first regardless of the buzzer. Double Chance: after buzzing, build an expression of three numbers and two operators for 2 points. Peek: after buzzing, look at one square before answering (shown to both).',
      'With Double Chance or Peek, the five seconds start once that check is done.',
      'It was new to this season’s final and returned as a death match in The Genius: Grand Final.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Same Number Hunt tests memory and mental arithmetic together. Memorising all sixteen squares in five seconds is close to impossible, so **what to memorise first** is the first strategy.' },
    { type: 'cards', items: [
      { title: 'The four operators are the key', body: 'Every expression needs exactly one operator. Knowing just the four operator squares lets you fill in numbers from squares revealed by wrong answers; without them, no number of remembered digits lets you answer.' },
      { title: 'A wrong answer is a gift', body: 'The three squares of a wrong answer are shown to both, and the chance passes to the opponent with no clock. Buzzing without certainty hands over information and time together, so when to buzz matters as much as memory.' },
      { title: 'Easy and hard targets', body: 'A number like 12 can be made many ways (multiplying, adding and so on) and is easy even with few squares known; a large prime with only one or two expressions needs exactly the right pair. Targets are random, so which numbers your memory happens to cover acts a little like luck.' },
    ], columns: 1 },
    { type: 'p', text: 'Memory differs and revealed squares are shared, so **there is no dominant strategy**. As the board opens up the memory gap shrinks, so the lead built in the first few rounds weighs heavily.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1+', alike: 'Remember where face-down cards are; cards the opponent flips are information for you too.', differs: 'You only match pairs; there is no arithmetic.' },
    { name: 'Krypto', players: '1+', alike: 'Reach a target number quickly from given number cards and the four operations.', differs: 'All numbers are face up, so nothing needs memorising.' },
  ],
});
