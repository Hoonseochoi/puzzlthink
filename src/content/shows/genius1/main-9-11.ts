// 더 지니어스: 게임의 법칙, main matches of rounds 9–11: 수식 경매, 감금! 사기 경마, 5 대 5.
import { g1Game, round } from './shared';

export const equationAuction = g1Game('equation-auction', 'main', round(9), [9], ['equationTower', 'equationSignal', 'blackWhite'], {
  meta: {
    title: '수식 경매 규칙 — 더 지니어스 시즌1 9회전 메인 매치, 숫자 큐브로 타일을 사서 10 만들기',
    description: '더 지니어스: 게임의 법칙 9회전 메인 매치 수식 경매의 규칙을 정리했어요. 1–10 숫자 큐브, 미리 공개된 24번의 경매 순서, 5초 입찰과 쓰고 나면 버려지는 큐브, 같은 숫자를 내면 바로 유찰, 낙찰 타일을 모두 써서 답이 10인 수식, 가넷으로 하는 특별 경매와 10에 가까운 순 판정까지.',
    keywords: ['수식 경매', '수식경매', '더 지니어스 수식 경매', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 9회전'],
  },
  title: '수식 경매 — 더 지니어스 시즌1 9회전 메인 매치',
  name: '수식 경매',
  lead: '1부터 10까지의 숫자 큐브로 숫자·기호 타일을 경매해 사요. 산 타일을 하나도 빠짐없이 써서 답이 10인 수식을 가장 먼저 만들면 이겨요.',
  summary: '한 번 쓰면 사라지는 숫자 큐브로 타일을 사 모아, 답이 10인 수식을 먼저 완성하는 경매 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 5명.',
      '**숫자 큐브**: 한 사람당 1–10이 새겨진 큐브 10개.',
      '**경매 물품**: 숫자와 기호 타일. 6번씩 4묶음, 모두 24번의 경매가 정해진 순서대로 열리고, 그 순서는 미리 공개돼요.',
    ] },
    { type: 'table', caption: '출품 순서 (나무위키 정리 기준)', head: ['회차', '1–6', '7–12', '13–18', '19–24'], rows: [
      ['물품', '1, 2, 3, 4, 5, 6', '+, ×, −, ÷, 6, 7', '특별 경매, 1×, 2×, 3+, 4+, 8÷', '9÷, 10÷, 6−, 7−, +, 10'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '입찰', body: '사고 싶은 사람은 5초 안에 입찰 의사를 밝히고 숫자 큐브 하나를 내요. 아무도 입찰하지 않으면 그 타일은 버려져요.' },
      { title: '응찰', body: '누군가 입찰한 뒤 5초 안에 더 높은 큐브를 내는 사람이 없으면 낙찰이에요. 더 높은 큐브가 나오면 다시 5초가 주어져요. 한 사람이 여러 번 응찰할 수 있어요.' },
      { title: '큐브 소모', body: '경매에 낸 큐브는 낙찰 여부와 상관없이 모두 버려져요.' },
      { title: '준비 시간', body: '6번의 경매가 끝날 때마다 10분의 준비 시간이 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**답이 10인 수식을 가장 먼저 완성한 사람**이 우승하고, 그 즉시 게임이 끝나요.',
      '24번이 끝날 때까지 아무도 10을 못 만들면 **10에 가장 가까운 답**이 우승해요. 차이가 같으면(예: 9와 11) 더 큰 수가 이겨요.',
      '우승자는 수식의 답만큼 가넷을 받아요(최대 20개).',
      '끝날 때까지 수식을 완성하지 못한 사람이 탈락 후보가 되고, 모두 완성했다면 10에서 가장 먼 답이 탈락 후보예요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '상대와 **같은 숫자의 큐브**를 내면 그 즉시 유찰돼요. 낸 큐브와 타일이 모두 버려지고, 더 높은 큐브로 다시 살 수도 없어요.',
      '낙찰받은 타일은 모두 써야 하고, 숫자를 이어 붙여 두 자리 수를 만들 수 없어요. 연산 기호는 하나 이상 있어야 해요.',
      '13회차는 큐브가 아니라 **가넷으로 입찰하는 특별 경매**였고, 물품은 숫자 11 큐브였어요. 낙찰받지 못하면 가넷은 돌려받아요.',
      '숫자 큐브와 경매 타일은 주고받을 수 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '수식 경매의 자원은 **큐브 열 개뿐**이고, 한 번 내면 사라져요. 그래서 "얼마에 살까"보다 **"어떤 큐브를 언제 버릴까"**가 중요해요. 10 큐브는 어떤 입찰도 이기는 대신 한 번밖에 못 써요.' },
    { type: 'cards', items: [
      { title: '필요한 타일을 거꾸로 계산하기', body: '출품 순서가 미리 공개되니, 처음부터 어떤 조합으로 10을 만들지 정해 둘 수 있어요. 예를 들어 2와 5에 × 하나, 3과 7에 + 하나처럼 타일 세 개면 되는 조합이 있어요. 다만 산 타일은 모두 써야 해서, 필요 없는 타일을 사면 수식이 망가져요.' },
      { title: '유찰이라는 방해 수단', body: '같은 숫자의 큐브가 나오면 즉시 유찰되고 아무도 그 타일을 살 수 없어요. 두 사람이 짜고 같은 큐브를 내면 큐브 두 개로 원하는 타일을 판에서 지울 수 있어요. 가장 강한 큐브를 가진 사람도 이 방법에는 막혀요.' },
      { title: '남의 수식 읽기', body: '누가 어떤 타일을 샀는지는 모두가 봐요. 상대에게 필요한 다음 타일을 예상하고 그 회차에 큐브를 쓰면 상대의 계획을 무너뜨릴 수 있어요. 반대로 타일 배치를 숨기고 다른 답을 노리는 것처럼 보이게 할 수도 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '큐브 수가 같고 경매 순서가 공개된 **완전 정보에 가까운 게임**이지만, 다섯 명이 서로 견제하기 때문에 우월 전략은 없어요. 10을 노리는 사람은 많은 타일이 필요한 계획보다 **적은 타일로 끝나는 계획**을 세워야 방해를 덜 받아요.' },
  ],
  similar: [
    { name: '라 (Ra)', players: '2–5명', alike: '숫자가 적힌 태양 타일로 입찰하고, 한 번 쓴 타일은 다시 쓰지 못해요. 어떤 숫자를 언제 쓰느냐가 핵심이에요.', differs: '이긴 사람이 낸 타일은 다음 경매의 물품이 되고, 수식이 아니라 세트를 모아 점수를 내요.' },
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '숫자와 사칙연산을 모두 써서 목표 숫자를 만드는 계산 게임이에요.', differs: '경매 없이 주어진 숫자로 바로 계산해요.' },
  ],
}, {
  meta: {
    title: 'The Equation Auction rules — The Genius season 1, round 9 main match',
    description: 'The rules of the Equation Auction (수식 경매) from The Genius: Rules of the Game: number cubes 1–10, 24 auctions in a published order, five-second bids, spent cubes discarded, matching cubes cancelling the lot, using every tile to make 10, a special garnet auction, and the closest-to-ten fallback.',
    keywords: ['The Genius Equation Auction', 'Expression Auction', 'The Genius Rules of the Game', '더 지니어스 수식 경매'],
  },
  title: 'The Equation Auction — The Genius season 1, round 9 main match',
  name: 'The Equation Auction (수식 경매)',
  lead: 'Bid number cubes from 1 to 10 for number and operator tiles. The first to use every tile they bought in an equation equal to 10 wins.',
  summary: 'An auction where each cube is spent once: collect tiles and be first to make 10.',
  setup: [
    { type: 'list', items: [
      '**Players**: 5.',
      '**Cubes**: ten each, numbered 1–10.',
      '**Lots**: number and operator tiles, 24 auctions in four groups of six, in an order announced beforehand.',
    ] },
    { type: 'table', caption: 'Auction order (per the fan wiki)', head: ['Lots', '1–6', '7–12', '13–18', '19–24'], rows: [
      ['Items', '1, 2, 3, 4, 5, 6', '+, ×, −, ÷, 6, 7', 'special, 1×, 2×, 3+, 4+, 8÷', '9÷, 10÷, 6−, 7−, +, 10'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Bid', body: 'Within five seconds a bidder declares and shows a cube; with no bids the tile is discarded.' },
      { title: 'Raise', body: 'If nobody shows a higher cube within five seconds, the lot is sold; a higher cube restarts the five seconds. One player may raise several times.' },
      { title: 'Spend', body: 'Every cube shown is discarded, sold or not.' },
      { title: 'Breaks', body: 'Ten minutes of preparation after every six auctions.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first equation equal to 10** wins and ends the game at once.',
      'If nobody makes 10 in 24 auctions, the answer **closest to 10** wins; at equal distance (9 and 11) the larger wins.',
      'The winner takes garnets equal to the answer, up to 20.',
      'A player without a complete equation is the elimination candidate; if all finished, the answer furthest from 10.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Showing **the same number** as a rival cancels the lot at once: cubes and tile are discarded and no higher bid can save it.',
      'All bought tiles must be used, numbers cannot be joined into two digits, and at least one operator is required.',
      'Lot 13 was a **special auction bid in garnets** for an extra cube numbered 11; unsuccessful bids were refunded.',
      'Cubes and tiles cannot be traded.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The only resource is **ten cubes, each gone once used**, so the question is less "how much?" than **"which cube, and when?"**. The 10 beats any bid — once.' },
    { type: 'cards', items: [
      { title: 'Plan backwards', body: 'With the order public you can choose your route to 10 in advance: 2 and 5 with a ×, or 3 and 7 with a +, need only three tiles. Since every tile must be used, buying a useless one ruins the equation.' },
      { title: 'Cancelling as sabotage', body: 'Matching cubes cancel a lot outright, so two players working together can wipe a tile from the game with two cubes — even against the strongest cube.' },
      { title: 'Reading others’ equations', body: 'Everyone sees who bought what. Spending a cube on the tile a rival needs next breaks their plan; arranging tiles to suggest a different target hides your own.' },
    ], columns: 1 },
    { type: 'p', text: 'Equal resources and a public schedule make it **close to perfect information**, but with five players policing each other nothing dominates. Plans that **finish with few tiles** are hardest to block.' },
  ],
  similar: [
    { name: 'Ra', players: '2–5', alike: 'Numbered sun tiles serve as bids and are spent; which to use when is the game.', differs: 'The winning tile becomes a future bid, and you score sets, not equations.' },
    { name: 'Krypto', players: '1+', alike: 'Combine numbers with arithmetic to hit a target.', differs: 'No auction — just calculation.' },
  ],
});

export const lockedHorseRace = g1Game('locked-fraud-horse-race', 'main', round(10), [10, 5], ['piggyBank', 'hitStay', 'indianPoker'], {
  meta: {
    title: '감금! 사기 경마 규칙 — 더 지니어스 시즌1 10회전 메인 매치, 방에 갇힌 플레이어와 대리 베팅하는 게스트',
    description: '더 지니어스: 게임의 법칙 10회전 메인 매치 감금! 사기 경마의 규칙을 정리했어요. 5회전 사기 경마와 같은 경주, 방에 갇힌 플레이어 4명과 대신 움직이는 게스트, 팀당 단서 하나와 갈수록 비싸지는 추가 단서, 세 라운드마다 공개 단서, 생명의 징표 두 개와 자동 데스 매치 진출까지.',
    keywords: ['감금 사기 경마', '감금! 사기 경마', '더 지니어스 감금 사기경마', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 10회전'],
  },
  title: '감금! 사기 경마 — 더 지니어스 시즌1 10회전 메인 매치',
  name: '감금! 사기 경마',
  lead: '5회전 사기 경마를 다시 하지만, 이번엔 플레이어가 각자 방에 갇혀요. 단서를 사고 칩을 거는 일은 모두 한 팀이 된 게스트가 대신해요.',
  summary: '사기 경마의 규칙에 "감금"을 더해, 내 손발이 되어 줄 게스트와의 소통이 승부가 되는 변형판.',
  setup: [
    { type: 'list', items: [
      '**인원**: 플레이어 4명과 게스트 4명이 짝을 지어 4팀.',
      '**감금**: 플레이어는 게임이 끝날 때까지 각자 지정된 방에서 나갈 수 없어요. 단서 확인과 베팅은 게스트가 대신해요.',
      '**경주**: 5회전과 같아요. 말 8마리, 20칸, 12라운드, 라운드당 0–3칸.',
      '**칩**: 8명 모두 20개씩. 게스트가 자기 몫과 플레이어 몫을 함께 걸어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '단서', body: '게임 전에 팀마다 단서 하나를 받아요. 추가 단서 세 개는 가넷을 내고 볼 수 있는데, 먼저 사는 사람이 3가넷이고 다음 구매자부터 1가넷씩 비싸져요.' },
      { title: '베팅', body: '라운드당 최대 3개, 베팅 금지 구역 규칙도 5회전과 같아요.' },
      { title: '작전 타임', body: '세 라운드가 끝날 때마다 작전 타임이 있고, 모두에게 공개 단서가 하나씩 주어져요.' },
      { title: '정산', body: '1·2등 말에 건 칩이 5회전과 같은 배당률로 돌아와요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '게스트를 포함해 **칩을 가장 많이 모은 1·2위**가 생명의 징표를 받아요. 게스트가 받은 징표는 짝인 플레이어에게 넘어가요.',
      '한 팀의 플레이어와 게스트가 1·2위를 모두 차지하면, 그 플레이어가 남은 징표를 누구에게 줄지 정해요.',
      '생명의 징표를 받지 못한 **플레이어 2명이 자동으로 데스 매치**에 나가요.',
      '칩은 10개당 가넷 1개로 바꿔요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '5회전과 달리 이번에는 최하위가 상대를 지목하지 않아요. 징표가 없는 두 사람이 그대로 데스 매치에 나가요.',
      '추가 단서 가격을 나무위키 정리는 3·4·5·6가넷으로, 영문 위키백과는 "첫 구매 3가넷, 이후 1개씩 증가"로 적고 있어요. 같은 규칙이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '경주와 배당 구조는 5회전과 같으니, 핵심은 그대로 **"정답을 알면서 남이 모르게 하기"**예요. 달라진 점은 **플레이어가 직접 움직일 수 없다**는 것이에요. 정보를 모으고, 거짓말을 걸러 내고, 칩을 거는 일까지 모두 게스트를 거쳐야 해요.' },
    { type: 'cards', items: [
      { title: '한 팀이 두 몫을 건다', body: '게스트도 칩 20개를 받아서, 한 팀이 40개를 움직여요. 그리고 징표는 칩 1·2위에게 가니, 플레이어 본인이 아니라 게스트가 순위에 들어도 징표가 플레이어에게 와요. 팀 안에서 칩을 어떻게 나눠 걸지는 순위 싸움에 직결돼요.' },
      { title: '먼저 사는 단서가 싸다', body: '추가 단서는 살수록 비싸져서, 일찍 산 팀이 적은 가넷으로 정보를 얻어요. 하지만 공개 단서가 세 라운드마다 나오니, 기다리면 공짜로 알게 되는 정보도 있어요. 언제 사느냐가 가넷과 정보의 교환 비율을 정해요.' },
      { title: '갇힌 사람의 판단력', body: '방에 갇힌 플레이어는 게스트가 전해 주는 말만 들을 수 있어요. 다른 팀 게스트의 거짓 정보가 섞이기 쉬워서, 무엇을 믿을지 정하는 기준을 게스트와 미리 맞춰 두는 것이 중요해요.' },
    ], columns: 1 },
    { type: 'p', text: '네 팀 중 두 팀만 살아남는 구조라, 다른 한 팀과 진짜 단서를 나누고 나머지 두 팀을 속이는 **2:2 구도**가 자연스럽게 생겨요. 우월 전략은 없지만, 정보를 나눌 상대를 빨리 정하는 쪽이 유리해요.' },
  ],
  similar: [
    { name: '카멜 업 (Camel Up)', players: '2–8명', alike: '경주의 1·2등을 맞히는 베팅이 중심이고, 같은 낙타에 늦게 걸수록 받는 몫이 줄어요.', differs: '팀이나 대리인이 없고, 주사위가 결과를 정해요.' },
    { name: '코드네임 (Codenames)', players: '2–8명 이상', alike: '한 사람은 정보를 알고, 다른 사람은 그 말을 듣고 움직이는 팀 소통 게임이에요. 전달이 틀리면 엉뚱한 선택을 해요.', differs: '베팅이 없고, 정보를 아는 쪽이 단어 하나로만 힌트를 줘요.' },
  ],
}, {
  meta: {
    title: 'Locked! Fraud Horse Race rules — The Genius season 1, round 10 main match',
    description: 'The rules of Locked! Fraud Horse Race (감금! 사기 경마) from The Genius: Rules of the Game: the round-5 race again, with four players locked in rooms and guest partners betting for them, one clue per team, extra clues that get dearer, a public clue every three rounds, two tokens of life and an automatic death match.',
    keywords: ['The Genius Locked Horse Race', 'Confined Scamming Horse Race', 'The Genius Rules of the Game', '더 지니어스 감금 사기경마'],
  },
  title: 'Locked! Fraud Horse Race — The Genius season 1, round 10 main match',
  name: 'Locked! Fraud Horse Race (감금! 사기 경마)',
  lead: 'Round 5’s horse race again — but now each player is locked in a room, and a guest partner buys the clues and places the bets.',
  summary: 'The fraud horse race with a lock-in: communicating with your guest decides it.',
  setup: [
    { type: 'list', items: [
      '**Players**: four players paired with four guests.',
      '**Lock-in**: players may not leave their rooms until the end; guests check clues and bet for them.',
      '**Race**: as in round 5 — eight horses, 20 spaces, 12 rounds, 0–3 spaces a round.',
      '**Chips**: 20 for each of the eight; a guest bets both their own and their player’s.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Clues', body: 'Each team gets one clue; three extra clues cost garnets, 3 for the first buyer and one more for each later buyer.' },
      { title: 'Betting', body: 'At most three chips a round, with the same no-betting zone as round 5.' },
      { title: 'Strategy time', body: 'After every three rounds there is a break and a public clue for everyone.' },
      { title: 'Payout', body: 'Bets on the first two horses pay at the round-5 odds.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The **top two chip totals**, guests included, earn tokens of life; a guest’s token goes to their player.',
      'If one team’s player and guest take both places, that player decides who gets the other token.',
      'The **two players without a token go straight to the death match**.',
      'Ten chips convert to one garnet.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Unlike round 5, nobody nominates an opponent: the two without tokens play the death match.',
      'The fan wiki lists the clue prices as 3, 4, 5 and 6 garnets; English Wikipedia says the first costs 3 and each later one 1 more — the same rule.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The race and the odds are unchanged, so the core is still **knowing the answer while others don’t**. What changes is that **players cannot act themselves**: gathering, filtering and betting all go through the guest.' },
    { type: 'cards', items: [
      { title: 'Two stakes per team', body: 'Guests get 20 chips too, so a team moves 40, and since tokens go to the top two chip totals, a guest placing high earns a token for the player. How the team splits its bets decides the ranking.' },
      { title: 'Early clues are cheap', body: 'Prices rise with each purchase, so early buyers pay less — but a public clue arrives every three rounds for free. When to buy sets the exchange rate between garnets and information.' },
      { title: 'Judging from a locked room', body: 'Players hear only what their guest relays, and other guests’ lies slip in easily, so agreeing beforehand on what to trust matters.' },
    ], columns: 1 },
    { type: 'p', text: 'With only two of four teams safe, a **two-against-two** shape forms naturally: share real clues with one team, mislead the other two. No strategy dominates, but choosing that partner early helps.' },
  ],
  similar: [
    { name: 'Camel Up', players: '2–8', alike: 'Betting on the first two places, with later bets on the same camel paying less.', differs: 'No teams or proxies, and dice decide.' },
    { name: 'Codenames', players: '2–8+', alike: 'One teammate knows, the other acts on what they hear; miscommunication leads astray.', differs: 'No betting, and clues are single words.' },
  ],
});

export const fiveFive = g1Game('five-to-five', 'main', round(11), [11], ['hiddenWord', 'nemoCount', 'gyulhap'], {
  meta: {
    title: '5 대 5 규칙 — 더 지니어스 시즌1 11회전 메인 매치, 게스트 10명을 반으로 가르는 질문',
    description: '더 지니어스: 게임의 법칙 11회전 메인 매치 5 대 5의 규칙을 정리했어요. 직업이 다양한 게스트 10명, 한 시간의 정보 조사, 게스트가 O·X로 답할 명제, 12글자 제한과 같은 뜻 반복 금지, 결과가 5:5면 승점 1점, 두 라운드와 공개되지 않은 게스트 전용 규칙까지.',
    keywords: ['5 대 5', '5대5 게임', '더 지니어스 5 대 5', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 11회전'],
  },
  title: '5 대 5 — 더 지니어스 시즌1 11회전 메인 매치',
  name: '5 대 5',
  lead: '처음 만난 게스트 열 명에게 한 시간 동안 이것저것 물어봐요. 그다음 열 명의 답이 정확히 O 다섯, X 다섯으로 갈리는 문장을 만들어야 점수가 나요.',
  summary: '게스트 10명에 대한 정보를 모아, 답이 정확히 반으로 갈리는 질문을 만드는 언어·추론 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 플레이어 3명, 다양한 직업의 게스트 10명.',
      '**정보 조사 시간**: 게임 내용이 공개되기 전에 1시간 동안 게스트와 자유롭게 이야기할 수 있어요. 그 밖의 시간에는 게스트와 접촉하거나 대화할 수 없어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '명제 제시', body: '게임이 공개되면 플레이어는 게스트의 답이 O와 X로 나뉠 수 있는 명제를 내요. 가넷이 가장 적은 사람부터 차례로 내요.' },
      { title: '게스트 응답', body: '게스트는 사실대로 O나 X를 정해요. 명제를 낸 사람 말고 다른 두 플레이어는 명제의 내용과 결과를 알 수 없어요.' },
      { title: '채점', body: '결과가 정확히 5:5로 나오면 그 플레이어가 승점 1점을 얻어요.' },
      { title: '두 라운드', body: '1라운드는 한 사람당 3개의 명제를 내고, 끝나면 10분의 추가 정보 조사 시간이 있어요. 2라운드 명제 개수는 라운드가 시작할 때 알려 줘요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**승점이 가장 많은 사람**이 우승해 승점 1점당 가넷 1개를 받아요.',
      '우승하지 못한 **두 사람이 자동으로 데스 매치**에 나가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '명제는 12글자를 넘을 수 없어요. 띄어쓰기는 없어도 되고, 영어와 숫자는 한 자에 한 글자로 세요. 같은 뜻의 질문을 되풀이할 수 없어요.',
      '게스트는 사생활을 침해한다고 생각하는 질문에는 답하지 않아도 돼요.',
      '플레이어에게 알리지 않은 게스트 전용 규칙이 있었어요. 플레이어 세 명이 모두 모여 있을 때는 대답하지 않고, 플레이어의 부탁은 들어주지 않아요.',
      '2라운드 명제 개수를 나무위키 정리는 5개로, 영문 위키백과는 라운드당 3개로 적고 있어 일치하지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '5 대 5는 **정보를 질문으로 바꾸는 게임**이에요. 게스트 열 명에 대해 아는 것이 많아도, 정확히 다섯 명만 해당하는 조건을 열두 글자 안에 담지 못하면 점수가 되지 않아요.' },
    { type: 'cards', items: [
      { title: '확실한 다섯을 만드는 조건', body: '"안경을 썼다"처럼 겉으로 보이는 사실은 세기 쉽지만, 정확히 다섯이 될 확률은 낮아요. 반대로 나이, 생일 달, 이름의 글자처럼 정확한 값을 알면 조건을 조합해 다섯 명을 골라낼 수 있어요. 조사 시간에 무엇을 물을지가 점수를 정해요.' },
      { title: '내가 만든 정보', body: '조사 시간에 게스트에게 무언가를 알려 주거나 함께 정하면, 그것을 아는 사람의 수를 내가 정할 수 있어요. 정확히 다섯 명에게만 같은 것을 알려 두면 "그것을 안다"는 명제는 5:5가 돼요. 다만 부탁을 들어주지 말라는 게스트 규칙이 있어 어디까지 통할지는 판단이 필요해요.' },
      { title: '같은 뜻 반복 금지', body: '같은 의미의 질문은 다시 낼 수 없으니, 한 가지 정보로 여러 점을 얻기 어려워요. 1라운드 결과(내 명제의 5:5 성공 여부)는 나만 알기 때문에, 그 결과를 보고 다음 명제를 고칠 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '게스트의 답은 사실에 따르므로 운보다 **준비한 정보의 정확도**가 승부를 가려요. 우월 전략은 없지만, 정확한 숫자로 나눌 수 있는 정보를 많이 모으거나 내가 통제할 수 있는 정보를 만드는 쪽이 유리해요.' },
  ],
  similar: [
    { name: '웨이브렝스 (Wavelength)', players: '2–12명', alike: '사람들이 어떻게 답할지를 예측해 말을 고르는 파티 게임이에요. 질문이나 단서의 표현 하나로 결과가 갈려요.', differs: '정확한 인원을 맞히는 것이 아니라 눈금 위의 위치를 맞혀요.' },
    { name: '허드 멘탈리티 (Herd Mentality)', players: '4–20명', alike: '다른 사람들의 답이 어떻게 나뉠지 읽는 게임이에요.', differs: '다수의 답과 같게 쓰는 게 목표라, 반으로 가르는 질문을 만드는 것과는 반대예요.' },
  ],
}, {
  meta: {
    title: 'Five to Five rules — The Genius season 1, round 11 main match',
    description: 'The rules of Five to Five (5 대 5) from The Genius: Rules of the Game: ten guests from varied jobs, an hour of questioning, true-or-false statements of at most twelve characters, a point for an exact 5–5 split, two rounds, and the guests’ secret rules.',
    keywords: ['The Genius 5 vs 5', '5:5 Game', 'The Genius Rules of the Game', '더 지니어스 5 대 5'],
  },
  title: 'Five to Five — The Genius season 1, round 11 main match',
  name: 'Five to Five (5 대 5)',
  lead: 'Spend an hour quizzing ten guests you have just met. Then write statements that split them exactly five true, five false.',
  summary: 'A language-and-deduction game: turn what you learned about ten guests into statements that divide them in half.',
  setup: [
    { type: 'list', items: [
      '**Players**: 3 players and 10 guests from varied occupations.',
      '**Research hour**: before the game is revealed, an hour of free conversation with the guests; no contact outside it.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Statements', body: 'Players propose statements each guest can answer true or false, starting with whoever has fewest garnets.' },
      { title: 'Answers', body: 'Guests answer truthfully; the other two players never learn the statement or its result.' },
      { title: 'Scoring', body: 'An exact 5–5 split earns a point.' },
      { title: 'Two rounds', body: 'Three statements each in round 1, then ten more minutes of research; the number for round 2 is announced when it starts.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Most points** wins, with a garnet per point.',
      'The **other two go straight to the death match**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Statements are at most twelve Korean characters (spaces optional; Latin letters and digits count one each), and no repeating a meaning.',
      'Guests may decline questions they consider an invasion of privacy.',
      'Guests had rules the players were not told: say nothing while all three players are present, and grant no favours.',
      'The sources disagree on round 2: the fan wiki gives five statements, English Wikipedia three per round.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Five to Five is about **turning information into questions**: knowing a lot about the guests is worthless unless it fits into twelve characters that catch exactly five of them.' },
    { type: 'cards', items: [
      { title: 'Conditions that give exactly five', body: 'Visible facts ("wears glasses") are easy to count but rarely split five–five. Exact values — ages, birth months, letters in names — can be combined to single out five people, so what you ask in the research hour sets your score.' },
      { title: 'Information you create', body: 'Tell exactly five guests the same thing during research and "knows X" splits five–five by design — though the no-favours rule makes it a judgement call how far that works.' },
      { title: 'No repeats', body: 'Meanings cannot repeat, so one fact rarely scores twice; and only you know whether your round-1 statements hit, so you can adjust in round 2.' },
    ], columns: 1 },
    { type: 'p', text: 'Guests answer truthfully, so **the precision of your research** decides, not luck. No strategy dominates, but exact, countable facts — or facts you control — win.' },
  ],
  similar: [
    { name: 'Wavelength', players: '2–12', alike: 'Predict how people will respond and phrase a clue to match.', differs: 'You aim for a point on a dial, not an exact head-count.' },
    { name: 'Herd Mentality', players: '4–20', alike: 'Reading how a group’s answers will split.', differs: 'You want to match the majority — the opposite of splitting it.' },
  ],
});
