// 더 지니어스: 그랜드 파이널, main matches of rounds 7–11: 시드 포커, 마이너스 경매 II, 호러 레이스 II, 협동홀덤, 하우머치.
import { g4Game, wiki4, wikiSeason } from './shared';

export const seedPoker = g4Game({ slug: 'seed-poker', kind: 'main', ep: 7, related: ['indianPoker', 'twoSidedPoker', 'hitStay'], check: 'one' }, {
  meta: {
    title: '시드 포커 규칙 — 더 지니어스 그랜드 파이널 7회전 메인매치, 가장 낮은 숫자가 시드를 받는다',
    description: '더 지니어스: 그랜드 파이널 7회전 메인매치 시드 포커의 규칙을 정리했어요. 1–15 숫자 카드, 칩 15개, 카드 받기와 시드 카드 추가하기, 시드는 높은 3장만, 가장 낮은 카드부터 가장 높은 시드를 더하는 방식, 첫 베팅액 따라가기, 7라운드와 승부처까지.',
    keywords: ['시드 포커', '시드포커', '더 지니어스 시드포커', '그랜드 파이널 7회전', '더 지니어스 4'],
  },
  title: '시드 포커 — 더 지니어스: 그랜드 파이널 7회전 메인매치',
  name: '시드 포커',
  lead: '숫자가 큰 사람이 이기는 포커지만, 가장 낮은 카드를 든 사람부터 가장 높은 시드 카드를 더해 받아요. 낮은 카드가 오히려 무기가 될 수 있어요.',
  summary: '1–15 카드 한 장으로 겨루되, 낮은 카드일수록 높은 시드 카드를 더해 받는 7인 베팅 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 7명. 추첨으로 1–7번을 정하고, 7라운드 동안 1번부터 돌아가며 한 번씩 선이 돼요.',
      '**카드**: 1부터 15까지 숫자 카드 15장.',
      '**칩**: 1인 15개.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '배분', body: '딜러가 15장을 섞어 선부터 한 장씩 비공개로 나눠 줘요. 남은 8장은 뒤집어 가운데 쌓고, 맨 위 한 장을 펼쳐 첫 번째 시드 카드로 삼아요.' },
      { title: '행동 하나 고르기', body: '선부터 차례로 둘 중 하나를 해요. **카드 받기**: 더미에서 한 장을 받아 원래 카드와 비교해 하나를 최종 카드로 남기고, 버린 카드는 모두에게 공개해요. **시드 추가하기**: 더미에서 한 장을 펼쳐 시드에 더해요. 시드가 3장을 넘으면 가장 높은 3장만 남겨요. 시드를 추가한 사람은 처음 받은 카드가 최종 카드가 돼요.' },
      { title: '베팅', body: '모두 기본으로 칩 1개를 내고, 선부터 승부할지 포기할지 정해요. 가장 먼저 승부를 고른 사람이 걸 칩 수를 정하고, 그 뒤에 승부하는 사람은 같은 수를 걸어야 해요.' },
      { title: '공개와 시드 지원', body: '마지막으로 베팅한 사람부터 카드를 공개해요. 승부에 참여한 카드 중 **가장 낮은 카드부터 차례로 가장 높은 시드**를 받아 자기 숫자에 더해요.' },
      { title: '승부', body: '더한 숫자가 가장 높은 사람이 베팅된 칩을 모두 가져가고 가넷 1개도 받아요. 가장 높은 숫자가 여럿이면 선에 가까운 사람이 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '7라운드 뒤 칩이 가장 많은 사람이 우승자, 가장 적은 사람이 탈락후보예요. 단독 우승이면 생명의 징표 2개를 받아요.',
      '칩이 없으면 가넷을 칩 대신 써야 하고, **칩과 가넷을 모두 잃으면 자동으로 최하위**가 돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '포기한 사람의 카드는 공개하지 않아요.',
      '칩과 가넷이 모두 없는 사람은 라운드가 시작되기 전에 가넷을 양도받아 계속할지 정해야 하고, 한 번 빠지면 끝까지 빠져요. 빠진 사람이 있으면 라운드가 끝날 때 남는 카드 2장은 공개하지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '시드 규칙이 숫자의 힘을 뒤집어요. 시드가 15·14·13이라면 승부에 나선 카드 중 가장 낮은 카드가 15를 더해 받아요. 1을 든 사람도 16이 되어, 시드 없이 15를 든 사람을 이길 수 있어요. 그래서 이 게임의 질문은 "내 카드가 높은가"가 아니라 **"승부에 나선 사람들 중 내 카드가 몇 번째로 낮고, 그 순서에 어떤 시드가 붙는가"**예요.' },
    { type: 'cards', items: [
      { title: '카드는 거의 다 보인다', body: '15장 중 7장이 손에, 1장이 첫 시드로 나가고, 남은 7장은 일곱 사람의 행동 하나씩에 정확히 쓰여요. 카드 받기로 버린 카드와 시드로 펼친 카드는 공개되니, 행동이 끝나면 내가 모르는 카드는 거의 "다른 사람의 최종 카드"뿐이에요. 남은 숫자를 세면 상대 카드의 범위가 꽤 좁혀져요.' },
      { title: '시드 추가는 판을 바꾸는 행동', body: '시드를 추가하면 내 카드는 바꿀 수 없지만, 시드의 크기와 장수를 바꿔 낮은 카드의 가치를 올려요. 내 카드가 낮다면 시드를 키우는 것이 곧 내 카드를 키우는 길이에요. 반대로 높은 카드를 든 사람에게 큰 시드는 위협이에요.' },
      { title: '첫 베팅이 가격을 정한다', body: '레이즈가 없고 먼저 승부를 고른 사람이 칩 수를 정해요. 큰 수를 부르면 다른 사람이 따라오기 어려워 판을 혼자 가져가기 쉽고, 작은 수를 부르면 많은 사람이 들어와 시드 순서가 복잡해져요. 승부 인원이 바뀌면 누가 "가장 낮은 카드"인지도 바뀌어요.' },
    ], columns: 1 },
    { type: 'p', text: '지배 전략은 없어요. 다만 동점이면 선에 가까운 사람이 이기고, 자기가 선인 라운드에는 첫 베팅액을 정할 수 있어 선 라운드가 가장 공격하기 좋은 차례예요. 칩이 바닥나면 가넷까지 잃게 되니, 무리한 승부의 비용이 다른 포커보다 커요.' },
  ],
  similar: [
    { name: '러브 레터 (Love Letter)', players: '2–6명', alike: '카드를 한 장 더 받아 둘 중 하나를 남기고, 버린 카드는 공개돼요. 마지막에 가장 높은 카드를 쥔 사람이 이겨요.', differs: '러브 레터는 카드마다 특수 능력이 있고 베팅이 없어요.' },
    { name: '텍사스 홀덤 (Texas Hold’em)', players: '2–10명', alike: '기본 베팅 뒤 승부·포기를 정하고, 공유 카드가 각자의 패에 영향을 줘요.', differs: '홀덤은 공유 카드가 모두에게 똑같이 쓰이고 레이즈가 있어요. 시드 포커는 낮은 카드 순서대로 다른 시드를 받아요.' },
  ],
}, {
  meta: {
    title: 'Seed Poker rules — The Genius: Grand Final round 7 main match',
    description: 'The rules of Seed Poker (시드 포커), round 7 main match of The Genius: Grand Final: cards 1–15, 15 chips each, draw-a-card or add-a-seed, only the top three seeds kept, the lowest card receiving the highest seed, matching the first bet, and seven rounds.',
    keywords: ['Seed Poker', 'The Genius Grand Final', '시드 포커'],
  },
  title: 'Seed Poker — The Genius: Grand Final round 7 main match',
  name: 'Seed Poker (시드 포커)',
  lead: 'Highest number wins, but the lowest card in the showdown gets the highest seed card added to it, so a low card can be a weapon.',
  summary: 'A seven-player betting game with one card from 1–15, where lower cards receive higher seed bonuses.',
  setup: [
    { type: 'list', items: [
      '**Players**: 7, numbered by lot; each leads one of the 7 rounds.',
      '**Cards**: numbers 1 to 15.',
      '**Chips**: 15 each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Deal', body: 'Each player gets one card face down from the leader on; the other 8 form a face-down pile whose top card is flipped as the first seed.' },
      { title: 'One action each', body: 'From the leader: **Draw** a card, keep either it or your original as your final card, and show the discard to all; or **Add a seed** by flipping the pile’s top card onto the seeds, keeping only the highest three. Seed-adders keep their original card.' },
      { title: 'Bet', body: 'Everyone antes one chip, then from the leader each plays or folds. The first player to play sets the bet; later players must match it.' },
      { title: 'Reveal and seeds', body: 'Cards are shown from the last bettor. Among players in the showdown, **the lowest card gets the highest seed**, the next lowest the next seed, and so on.' },
      { title: 'Showdown', body: 'The highest total takes the pot and one garnet; ties go to the player nearest the leader.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After seven rounds the most chips wins and the fewest becomes the candidate; a sole winner gets two tokens.',
      'Without chips you must bet garnets, and **losing all chips and garnets makes you automatically last**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Folded cards are not shown.',
      'A player out of chips and garnets must decide before a round whether to take a garnet transfer and continue; once out, out for good. With someone out, the two leftover cards stay hidden.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Seeds turn card strength upside down. With seeds 15, 14 and 13, the lowest card in the showdown adds 15: a 1 becomes 16 and beats an unseeded 15. The real question is **where your card ranks among those who play, and which seed that rank receives**.' },
    { type: 'cards', items: [
      { title: 'Almost every card is visible', body: 'Seven cards are in hands, one is the first seed, and the remaining seven are used by exactly one action per player. Discards and seeds are public, so after the actions almost the only unknown cards are other players’ finals, and counting narrows them a lot.' },
      { title: 'Adding a seed reshapes the table', body: 'It freezes your card but grows the seeds, raising the value of low cards. If yours is low, growing the seeds grows your card; for a high card, big seeds are a threat.' },
      { title: 'The first bet sets the price', body: 'There are no raises. A big opening bet scares others off; a small one invites many players and changes who is "lowest".' },
    ], columns: 1 },
    { type: 'p', text: 'No strategy dominates, but ties go to the player nearest the leader and the leader can set the first bet, so your leading round is the best time to attack. Running out of chips costs garnets, which makes reckless calls dearer than in ordinary poker.' },
  ],
  similar: [
    { name: 'Love Letter', players: '2–6', alike: 'Draw one, keep one of two, discards are public, highest card at the end wins.', differs: 'Cards have special powers and there is no betting.' },
    { name: 'Texas Hold’em', players: '2–10', alike: 'Ante, play or fold, shared cards shape hands.', differs: 'Shared cards serve everyone equally and raises exist; here each rank gets a different seed.' },
  ],
});

export const minusAuction2 = g4Game({ slug: 'minus-auction-2', kind: 'main', ep: 8, related: ['piggyBank', 'hitStay', 'heavy13'], check: 'one', extra: [wikiSeason('The_Genius:_Rule_Breaker')] }, {
  note: '같은 이름의 원작 게임(룰 브레이커 8회전 마이너스 경매)은 영문 위키백과에도 정리되어 있지만, 이번 II의 규칙은 나무위키에서만 확인했어요.',
  meta: {
    title: '마이너스 경매 II 규칙 — 더 지니어스 그랜드 파이널 8회전 메인매치, 연속된 숫자는 하나만 계산',
    description: '더 지니어스: 그랜드 파이널 8회전 메인매치 마이너스 경매 II의 규칙을 정리했어요. −3부터 −35까지 숫자 큐브, 칩 9개로 낙찰 거부, 거부 칩은 낙찰자에게, 연속된 숫자는 절댓값이 가장 작은 하나만 계산, 히든 큐브 두 개와 가넷 경매, 남은 칩 +1점과 승부처까지.',
    keywords: ['마이너스 경매', '마이너스 경매 2', '마이너스경매', '더 지니어스 마이너스 경매', '그랜드 파이널 8회전', '노 땡스'],
  },
  title: '마이너스 경매 II — 더 지니어스: 그랜드 파이널 8회전 메인매치',
  name: '마이너스 경매 II',
  lead: '마이너스 숫자 큐브를 칩을 내서 피하거나, 쌓인 칩과 함께 떠안아요. 연속된 숫자는 하나만 계산되니, 큰 숫자도 이어 붙이면 덜 아파요.',
  summary: '칩으로 마이너스 큐브를 거부하거나 칩째 낙찰받고, 연속된 숫자로 점수를 줄이는 6인 경매.',
  setup: [
    { type: 'list', items: [
      '**인원**: 6명. 제비뽑기로 경매 순서를 정해요.',
      '**숫자 큐브**: −3부터 −35까지.',
      '**칩**: 1인 9개. 낙찰을 거부할 때 써요.',
      '**히든 큐브**: 시작 전에 무작위로 두 개를 뽑아 숨겨요. 첫 번째는 게임에서 완전히 빠지고 끝까지 공개되지 않아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '큐브 공개', body: '추첨으로 큐브 하나를 공개하고, 정해진 순서대로 가져갈지 거부할지 정해요.' },
      { title: '거부', body: '거부하려면 칩 1개를 그 큐브 위에 내요. 칩이 없으면 가넷 1개를 대신 낼 수 있고, 칩도 가넷도 없으면 반드시 가져가야 해요.' },
      { title: '낙찰', body: '가져가는 사람은 큐브와 함께 그동안 쌓인 칩·가넷을 모두 가져가요. 큐브는 모두가 보이게 앞에 놓아요. 다음 큐브는 방금 낙찰받은 사람부터 시작해요.' },
      { title: '히든 큐브 가넷 경매', body: '17번의 경매가 끝나면 두 번째 히든 큐브를 걸고 가넷 경매를 해요. 가장 많은 가넷을 낸 사람이 큐브를 혼자 확인하고, 그 큐브를 경매에 넣을지 뺄지 정해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '경매가 모두 끝나면 낙찰받은 숫자를 더하고, 남은 칩을 1개당 +1점으로 더해요. 가넷은 점수에 들어가지 않아요.',
      '**연속된 숫자를 가졌다면 그 묶음에서 절댓값이 가장 작은 숫자 하나만 계산**해요. 예를 들어 −20, −21, −22를 모두 가졌다면 −20만 세요.',
      '점수가 가장 높은(마이너스가 가장 적은) 사람이 우승자로 가넷 5개를 받고, 가장 낮은 사람이 탈락후보예요. 탈락후보를 뺀 나머지는 가넷 2개씩 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '낙찰받은 큐브와 칩은 양도·교환할 수 없지만, 가넷은 양도할 수 있어요.',
      '칩 개수는 남에게 공개하지 않아도 돼요. 가넷으로 거부하는 것은 칩이 없을 때만 가능해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '칩을 내고 큐브를 미룰 때마다 그 큐브에는 칩이 쌓여요. 결국 누군가는 **"이 큐브의 마이너스보다 쌓인 칩이 더 값지다"**고 판단하는 순간 가져가요. 그 판단을 크게 바꾸는 것이 연속 숫자 규칙이에요. −24를 가진 사람에게 −25는 거의 공짜예요. 묶음에서는 가장 작은 절댓값 하나만 세니까요.' },
    { type: 'cards', items: [
      { title: '연결 고리 사냥', body: '내 묶음에 붙는 숫자가 나오면 남들은 그 큐브를 거부하며 칩을 쌓아 주고, 나는 칩까지 받으며 사실상 손해 없이 가져가요. 그래서 다른 사람들은 그 숫자를 일부러 먼저 가져가 고리를 끊기도 해요. 남이 끊으려면 큰 마이너스를 떠안아야 하는 것이 견제의 비용이에요.' },
      { title: '칩이 떨어지면 끌려간다', body: '칩이 없으면 가넷을 내거나 무조건 받아야 해요. 칩이 바닥난 사람이 보이면 다른 사람들은 큰 숫자를 그 사람 차례로 몰아 떠넘길 수 있어요. 남은 칩은 점수이기도 해서, 칩 관리가 공격이자 수비예요.' },
      { title: '히든 큐브의 정보', body: '처음부터 빠진 큐브 하나 때문에, 어떤 숫자가 끝까지 안 나올지 아무도 확신할 수 없어요. 내 묶음 사이의 빈 숫자를 기다리는 계획은 그 숫자가 빠진 큐브일 수 있다는 위험을 안아요. 두 번째 히든 큐브는 가넷을 내고 확인해 넣고 빼는 권리라, 정보 자체를 사는 경매예요.' },
    ], columns: 1 },
    { type: 'p', text: '이 구조는 보드게임 "노 땡스!"와 거의 같아서 알려진 원리가 통해요. 초반에는 칩을 아끼며 큰 숫자를 남에게 미루고, 자기 묶음이 생기면 이어지는 숫자를 칩째 가져가는 것이 기본이에요. 지배 전략은 없지만 "누가 어떤 숫자 묶음을 노리는가"를 모두가 볼 수 있어 견제가 치열해요.' },
  ],
  similar: [
    { name: '노 땡스! (No Thanks!)', players: '3–7명', alike: '마이너스 카드를 칩을 내 거부하거나 쌓인 칩과 함께 가져가고, 연속된 숫자는 가장 작은 숫자만 계산해요. 구조가 거의 같아요.', differs: '노 땡스!는 3–35 카드에서 9장을 빼고 하며, 가넷 경매 같은 단계는 없어요.' },
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '경매로 좋은 카드와 나쁜 카드를 다투고, 나쁜 카드는 떠넘기기 위해 돈을 써야 해요.', differs: '하이 소사이어티는 돈 카드로 입찰하고, 끝에 돈이 가장 적은 사람은 탈락하는 규칙이 있어요.' },
  ],
}, {
  note: 'The original game (Rule Breaker round 8, Minus Auction) is summarised on English Wikipedia, but the rules of this second version were checked only in the fan wiki.',
  meta: {
    title: 'Minus Auction II rules — The Genius: Grand Final round 8 main match',
    description: 'The rules of Minus Auction II (마이너스 경매 II), round 8 main match of The Genius: Grand Final: cubes from −3 to −35, nine chips to refuse, refusal chips going to the taker, runs counting only the smallest number, two hidden cubes and a garnet auction, and +1 per leftover chip.',
    keywords: ['Minus Auction II', 'The Genius Grand Final', '마이너스 경매'],
  },
  title: 'Minus Auction II — The Genius: Grand Final round 8 main match',
  name: 'Minus Auction II (마이너스 경매 II)',
  lead: 'Pay a chip to dodge a negative cube, or take it along with the chips piled on it. Runs of consecutive numbers count only once, so big numbers hurt less when they connect.',
  summary: 'A six-player auction: refuse negative cubes with chips or take them with the pile, and shrink your score with consecutive runs.',
  setup: [
    { type: 'list', items: [
      '**Players**: 6, auction order by lot.',
      '**Cubes**: −3 to −35.',
      '**Chips**: nine each, used to refuse.',
      '**Hidden cubes**: two are drawn and hidden at the start; the first is removed entirely and never shown.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Reveal', body: 'A cube is drawn and offered to players in order: take it or refuse.' },
      { title: 'Refuse', body: 'Refusing costs one chip placed on the cube; with no chips, a garnet may be paid instead; with neither, you must take it.' },
      { title: 'Take', body: 'The taker gets the cube and every chip or garnet piled on it, displayed openly. The next cube starts with that player.' },
      { title: 'Hidden cube auction', body: 'After 17 auctions, the second hidden cube is auctioned for garnets; the top bidder alone sees it and decides whether it enters the auction or is removed.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'At the end, add your cubes and +1 per remaining chip; garnets do not count.',
      '**A run of consecutive numbers counts only the one with the smallest absolute value**: −20, −21 and −22 count as −20.',
      'The highest (least negative) score wins and gets five garnets; the lowest becomes the candidate; everyone else gets two.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Cubes and chips cannot be traded or given; garnets can.',
      'Chip counts may be kept secret, and garnets can refuse a cube only when you have no chips.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Each refusal adds a chip to the cube until someone judges **the pile worth more than the minus**. The run rule changes that judgement sharply: to a holder of −24, −25 is almost free.' },
    { type: 'cards', items: [
      { title: 'Hunting links', body: 'When a number that extends your run appears, others pile chips on it refusing, and you take both at little cost. So rivals may grab it to break the chain, at the price of a large minus.' },
      { title: 'Out of chips, out of control', body: 'With no chips you must pay garnets or take the cube, so rivals can steer big numbers onto a broke player. Leftover chips are also points, so chip management is attack and defence.' },
      { title: 'Information from hidden cubes', body: 'One cube is gone from the start, so nobody can be sure a gap in their run will ever fill. The second hidden cube auction sells information itself.' },
    ], columns: 1 },
    { type: 'p', text: 'The structure is nearly identical to No Thanks!, and its known principles apply: save chips early, push big numbers onto others, then take connecting numbers with their chips. Everyone can see whose runs are forming, so blocking is fierce.' },
  ],
  similar: [
    { name: 'No Thanks!', players: '3–7', alike: 'Refuse a negative card with a chip or take it with the pile; runs count only their lowest card. Almost the same structure.', differs: 'It uses cards 3–35 with nine removed and has no garnet auction.' },
    { name: 'High Society', players: '3–5', alike: 'An auction where you must spend to dodge bad cards.', differs: 'Bids are money cards, and the poorest player at the end is eliminated.' },
  ],
});

export const horrorRace2 = g4Game({ slug: 'horror-race-2', kind: 'main', ep: 9, related: ['hitStay', 'piggyBank', 'gradation'], check: 'one' }, {
  meta: {
    title: '호러 레이스 II 규칙 — 더 지니어스 그랜드 파이널 9회전 메인매치, 업히기와 웅덩이',
    description: '더 지니어스: 그랜드 파이널 9회전 메인매치 호러 레이스 II의 규칙을 정리했어요. 플레이어와 게스트 10명의 개인전, 1·2·3칸 구역, 새로 추가된 업히기와 6·11번째 칸 웅덩이, 코인 포기, 1·2·3등 승점과 가넷, 게스트 상금, 2회전 호러 레이스와 달라진 점과 승부처까지.',
    keywords: ['호러 레이스 2', '호러 레이스 II', '호러레이스2', '더 지니어스 호러 레이스', '그랜드 파이널 9회전', '더 지니어스 4'],
  },
  title: '호러 레이스 II — 더 지니어스: 그랜드 파이널 9회전 메인매치',
  name: '호러 레이스 II',
  lead: '2회전 호러 레이스에 두 규칙이 더해졌어요. 같은 칸에 멈추면 위에 업히고, 트랙의 웅덩이에서는 누구든 멈춰요.',
  summary: '응원 캐릭터 둘을 숨기고 코인으로 레이스를 움직이되, 업히기와 웅덩이가 추가된 게스트 참가 개인전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 10명. 남은 플레이어와 게스트가 함께 개인전을 하고, 순위는 플레이어와 게스트를 따로 매겨요. 제비뽑기로 1–10번을 정해요.',
      '**캐릭터**: 뱀파이어, 강시, 구미호, 미라, 좀비. 트랙은 12칸이에요.',
      '**코인**: 다섯 캐릭터 코인을 한 개씩. 응원할 둘을 딜러에게 내고 나머지 셋을 상자에 넣어, 상자에는 30개가 모여요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '코인 배치', body: '순서대로 상자에서 코인 세 개를 무작위로 뽑아 세 구역에 자유롭게 놓아요. 뽑은 코인은 그 차례에 모두 놓아야 해요.' },
      { title: '이동 (1·2·3칸)', body: '1구역 최다 캐릭터가 1칸, 2구역 최다가 2칸, 3구역 최다가 3칸 움직여요. 2회전과 달리 마지막 구역이 4칸이 아니라 3칸이에요. 최다가 동률이면 움직이지 못하고 그다음 캐릭터가 움직여요.' },
      { title: '새 규칙 1: 업히기', body: '움직인 캐릭터가 멈춘 칸에 이미 다른 캐릭터가 있으면, 나중에 온 캐릭터가 그 위에 업혀요.' },
      { title: '새 규칙 2: 웅덩이', body: '트랙의 6번째와 11번째 칸은 웅덩이예요. 웅덩이를 지나가는 캐릭터는 남은 이동과 상관없이 웅덩이에서 멈춰요.' },
      { title: '코인 포기', body: '자기 차례에 포기를 선언하면 다음 라운드에 마지막(10번째)으로 뽑아요. 한 라운드에 한 명만 할 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 캐릭터가 결승점을 통과하면 레이스가 끝나고, 결승점에 가까운 순서로 2·3등을 정해요. **업혀 있으면 가장 위의 캐릭터가 순위가 높아요.**',
      '응원 캐릭터가 1등이면 승점 3점, 2등 2점, 3등 1점이에요. 공동 2등이면 그 응원자 모두 1점이고 3등은 없어요. 공동 3등은 각각 1점이에요.',
      '플레이어 중 승점이 가장 높은 사람이 우승자, 가장 낮은 사람이 탈락후보예요. 가장 낮은 사람이 동률이면 우승자가 탈락후보를 정해요.',
      '모든 플레이어는 **승점 1점당 가넷 1개**를 받고, 게스트 중 승점이 가장 높은 사람(들)은 상금 900만 원을 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '1구역 이동에서 레이스가 끝나면 2·3구역은 움직이지 않아요. 한 구역의 코인 수가 모두 같으면 아무도 움직이지 않아요.',
      '공동 2등은 한 캐릭터만 계속 움직여 결승한 경우처럼, 나머지가 모두 출발점에 있어 업힐 수도 없는 경우에 생겨요.',
      '나무위키 정리에 따르면 이번에는 미라 코인이 다른 코인보다 지름이 0.5cm 커서 손으로 구별할 수 있었어요.',
      '업힌 캐릭터가 아래 캐릭터와 함께 움직이는지는 정리된 규칙에 적혀 있지 않아 이 페이지에서는 다루지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '2회전 호러 레이스의 원리(인기 캐릭터일수록 상자 속 코인이 적다, 막기가 밀기보다 쉽다, 뒤 순서가 정보를 쥔다)는 그대로예요. 달라진 것은 **멈추는 칸의 가치**예요. 업히기 때문에 같은 칸에 나중에 도착하는 쪽이 위에 서고, 순위는 위가 높으니 "앞질러 가기"보다 "따라가서 올라타기"가 나을 때가 생겨요.' },
    { type: 'cards', items: [
      { title: '웅덩이는 거리 차이를 지운다', body: '6번째와 11번째 칸에서는 이동량과 상관없이 멈추니, 3칸을 가든 1칸을 가든 그 칸에 모여요. 그리고 모이면 늦게 온 캐릭터가 위로 올라가요. 특히 결승 직전의 11번째 칸은 마지막 순위를 뒤집는 자리예요.' },
      { title: '이동량이 줄었다', body: '구역이 1·2·3칸이라 한 라운드 최대 6칸이에요. 레이스가 길어지는 만큼 라운드 수가 늘고, 코인 포기와 순서 싸움이 반복되는 횟수도 늘어요.' },
      { title: '게스트라는 변수', body: '게스트는 생명의 징표와 상관없고 상금만 걸려 있어요. 플레이어 입장에서는 게스트를 연합으로 끌어들이면 표(코인 배치)를 늘릴 수 있고, 게스트끼리는 한 명을 1등으로 밀어 상금을 나누자는 약속이 가능해요. 플레이어 수가 적은 만큼 게스트의 협조가 판을 크게 좌우해요.' },
    ], columns: 1 },
    { type: 'p', text: '응원 캐릭터 두 개를 같은 칸에 겹쳐 놓으면 둘이 함께 상위권을 차지하기 쉬워요. 웅덩이는 그런 겹침을 만들어 주는 장치라, 웅덩이 직전 칸의 캐릭터들은 늘 견제 대상이 돼요.' },
  ],
  similar: [
    { name: '카멜 업 (Camel Up)', players: '2–8명', alike: '같은 칸에 도착한 말이 위에 올라타고, 맨 위가 앞선 것으로 쳐요. 호러 레이스 II의 업히기와 같은 원리예요.', differs: '카멜 업은 아래 말이 움직이면 위의 말을 함께 태우고 가며, 주사위로 이동하고 베팅이 공개돼요.' },
    { name: '로열 터프 (Royal Turf)', players: '2–6명', alike: '응원하는 말을 숨기고 모두가 함께 말을 움직이는 경마 게임이에요.', differs: '로열 터프에는 올라타기나 강제 정지 칸이 없어요.' },
  ],
}, {
  meta: {
    title: 'Horror Race II rules — The Genius: Grand Final round 9 main match',
    description: 'The rules of Horror Race II (호러 레이스 II), round 9 main match of The Genius: Grand Final: ten players and guests in a free-for-all, 1-, 2- and 3-step zones, the new stacking rule and puddles on spaces 6 and 11, giving up a draw, 3-2-1 points converted to garnets, and the guests’ prize.',
    keywords: ['Horror Race II', 'The Genius Grand Final', '호러 레이스 II'],
  },
  title: 'Horror Race II — The Genius: Grand Final round 9 main match',
  name: 'Horror Race II (호러 레이스 II)',
  lead: 'Round 2’s Horror Race with two new rules: a character stopping on an occupied space climbs on top, and puddles stop everyone.',
  summary: 'Back two characters in secret and move the race with coins, now with stacking and puddles, guests included.',
  setup: [
    { type: 'list', items: [
      '**Players**: 10, the remaining contestants and guests, each for themselves; contestants and guests are ranked separately. Order 1–10 by lot.',
      '**Characters**: vampire, jiangshi, gumiho, mummy, zombie; a 12-space track.',
      '**Coins**: one of each; two backed coins go to the dealer, the other three into the box, which holds 30.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Placing', body: 'In turn, draw three coins and place them freely on the three zones, all that turn.' },
      { title: 'Moving (1, 2, 3)', body: 'The zone leaders move 1, 2 and 3 steps; unlike round 2 the last zone is 3, not 4. Tied leaders stay and the next-highest moves.' },
      { title: 'New rule 1: stacking', body: 'A character that stops where another already stands climbs on top of it.' },
      { title: 'New rule 2: puddles', body: 'Spaces 6 and 11 are puddles: any character passing one stops there, whatever its remaining movement.' },
      { title: 'Giving up', body: 'Declare it on your turn to draw last (10th) next round; one player per round.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The race ends when a character passes the finish; the next closest are 2nd and 3rd, and **in a stack the top character ranks higher**.',
      'Backing 1st scores 3, 2nd 2, 3rd 1; a tie for 2nd scores 1 each with no 3rd, a tie for 3rd 1 each.',
      'The top-scoring contestant wins and the lowest becomes the candidate; if the lowest tie, the winner chooses.',
      'Contestants get **one garnet per point**; the top guest(s) win ₩9 million.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If the race ends on the 1-zone move, the others do not move; a zone where all counts are equal moves nobody.',
      'A tie for 2nd happens when one character ran the whole race and the rest sit on the start, where stacking is impossible.',
      'According to the fan wiki, this time the mummy coin was 0.5 cm wider than the others and could be told apart by touch.',
      'Whether a stacked character moves with the one beneath was not stated in the transcribed rules, so this page leaves it out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Round 2’s principles still hold: popular characters are scarce in the box, blocking beats pushing, late seats hold information. What changed is **the value of where you stop**: with stacking, the later arrival stands on top and ranks higher, so following and climbing can beat overtaking.' },
    { type: 'cards', items: [
      { title: 'Puddles erase distance', body: 'Spaces 6 and 11 stop everyone, so a 3-step and a 1-step move can end in the same place, with the later one on top. Space 11, just before the finish, is where final places flip.' },
      { title: 'Less movement', body: 'Zones of 1, 2 and 3 give at most 6 steps a round, so the race lasts longer and the fight over order and giving up repeats more often.' },
      { title: 'Guests change the maths', body: 'Guests have no tokens at stake, only prize money. Contestants can recruit them to add coin placements, and guests can agree to push one of their own to the top and share the prize. With few contestants left, guest cooperation weighs heavily.' },
    ], columns: 1 },
    { type: 'p', text: 'Stacking both your characters on one space makes it easy for them to finish high together, and puddles create exactly such stacks, so characters just before a puddle draw constant blocking.' },
  ],
  similar: [
    { name: 'Camel Up', players: '2–8', alike: 'A runner landing on another climbs on top and counts as ahead, the same idea as stacking here.', differs: 'In Camel Up the bottom camel carries the stack, movement is by dice, and bets are public.' },
    { name: 'Royal Turf', players: '2–6', alike: 'Hidden backing and shared movement in a horse race.', differs: 'No stacking or forced stops.' },
  ],
});

export const coopHoldem = g4Game({ slug: 'cooperative-holdem', kind: 'main', ep: 10, related: ['indianPoker', 'twoSidedPoker', 'nemoCount'], check: 'one', extra: [wiki4] }, {
  note: '영문 위키백과에는 이 회전이 가넷매치였다는 사실만 적혀 있어요.',
  meta: {
    title: '협동홀덤 규칙 — 더 지니어스 그랜드 파이널 10회전 가넷매치, 파트너가 공유카드를 고른다',
    description: '더 지니어스: 그랜드 파이널 10회전 가넷매치 협동홀덤의 규칙을 정리했어요. 플레이어와 게스트 파트너 4팀, 20라운드, 1–10 카드 한 장과 공유카드 두 장, 더블·스트레이트·트리플, 성냥·저울·퍼즐 미니게임으로 공유카드 선택권, 역할 교대와 승부처까지.',
    keywords: ['협동홀덤', '협동 홀덤', '더 지니어스 협동홀덤', '그랜드 파이널 10회전', '가넷매치', '더 지니어스 4'],
  },
  title: '협동홀덤 — 더 지니어스: 그랜드 파이널 10회전 가넷매치',
  name: '협동홀덤',
  lead: '한쪽 방에서는 네 명이 가넷을 걸고 홀덤을 하고, 다른 방에서는 파트너 네 명이 퍼즐을 풀어 그 판의 공유카드를 골라요.',
  summary: '플레이어와 게스트가 팀을 이뤄, 한 명은 홀덤을 하고 한 명은 미니게임으로 공유카드를 고르는 20라운드 가넷매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 남은 플레이어 4명과 각자의 게스트 파트너 4명, 4팀.',
      '**홀덤**: 1–10 숫자카드 10장. 각자 한 장을 비공개로 받고, 공유카드 두 장과 조합해요. 베팅은 플레이어가 가진 가넷으로 해요.',
      '**미니게임**: 성냥, 저울, 퍼즐 세 종류. 라운드마다 한 종류가 두 문제 나와요.',
      '**라운드**: 20라운드. 가넷매치예요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '기본 베팅과 개인 카드', body: '홀덤을 하는 네 명이 가넷 1개씩 기본으로 내면, 딜러가 1–10 카드 10장을 섞어 한 장씩 비공개로 나눠 줘요.' },
      { title: '미니게임', body: '동시에 다른 방의 네 명이 미니게임을 풀어요. 첫 문제를 가장 먼저 맞힌 사람이 첫 번째 공유카드를, 두 번째 문제를 맞힌 사람이 두 번째 공유카드를 1–10 중에서 마음대로 골라요. 같은 숫자를 골라도 되고, 한 사람이 둘 다 이기면 두 장 모두 골라요.' },
      { title: '미니게임 쪽이 보는 정보', body: '미니게임을 하는 사람에게는 홀덤 네 명의 카드와 가넷 현황이 모두 보여요. 반대로 홀덤 쪽은 누가 공유카드를 골랐는지 알 수 없어요.' },
      { title: '두 번의 베팅', body: '첫 번째 공유카드가 공개되면 선부터 포커처럼 첫 베팅을 하고, 두 번째 공유카드가 공개되면 두 번째 베팅을 해요. 첫 베팅에서 포기한 사람은 두 번째에 참여할 수 없어요.' },
      { title: '승부', body: '남은 사람의 카드를 공개해 가장 높은 조합이 베팅된 가넷을 모두 가져가요. 이긴 사람이 다음 라운드의 선이에요.' },
    ] },
    { type: 'table', head: ['조합', '조건', '같은 조합끼리'], rows: [
      ['트리플', '공유카드 두 장과 내 카드가 모두 같은 숫자', '—'],
      ['스트레이트', '공유카드 두 장과 내 카드가 연속된 숫자 (10과 1도 이어짐)', '세 숫자의 합이 큰 쪽'],
      ['더블', '내 카드가 공유카드 중 한 장과 같은 숫자', '카드 숫자가 큰 쪽'],
      ['없음', '조합이 없음', '카드 숫자가 큰 쪽'],
    ] },
    { type: 'table', head: ['미니게임', '내용'], rows: [
      ['성냥', '정해진 개수의 성냥개비로 문제의 도형을 만들어요. 두 개비를 완전히 포갤 수 없고, 남는 개비가 있으면 안 돼요.'],
      ['저울', '주어진 개수의 추로 양팔 저울의 균형을 맞춰요. 칸마다 추 하나를 올렸을 때의 무게가 적혀 있어요.'],
      ['퍼즐', '7개의 조각을 모두 써서 문제의 그림과 같은 모양을 만들어요.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '홀덤에서 **가장 먼저 가넷을 모두 잃은 플레이어가 자동으로 탈락후보**가 되고, 그 팀을 뺀 나머지가 20라운드까지 진행해요.',
      '20라운드 뒤 가넷이 가장 많은 플레이어가 우승자로, 생명의 징표 1개와 가넷 10개를 받아요. 탈락후보는 생명의 징표가 없는 2명 중 1명을 데스매치 상대로 골라요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '1–5라운드는 플레이어가 홀덤, 게스트가 미니게임을 하고, 6–10라운드는 반대로 해요. 10라운드가 끝나면 팀별로 상의해 역할을 정하고, 20라운드까지 바꿀 수 없어요.',
      '미니게임에서 틀리면 그 사람을 뺀 세 명에게 새 문제가 나와요.',
      '실제 포커처럼 사이드 베팅이 있었는지는 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임의 정보 구조는 한쪽으로 기울어 있어요. **미니게임 쪽은 모든 카드를 보고, 홀덤 쪽은 아무것도 모른 채 공유카드만 봐요.** 그러니 공유카드를 누가 골랐는지가 곧 판의 결과예요. 내 파트너가 이겼다면 내 카드에 맞춘 더블이나 스트레이트를 만들어 줄 것이고, 상대 파트너가 이겼다면 내 카드와 상관없는 숫자가 나올 거예요.' },
    { type: 'cards', items: [
      { title: '공유카드는 신호다', body: '홀덤 쪽은 고른 사람을 모르지만, 공유카드의 숫자가 내 카드와 맞는지는 볼 수 있어요. 팀끼리 "내 카드보다 1 작은 수가 먼저 나오면 우리가 이긴 것" 같은 약속을 정해 두면 공유카드가 신호가 돼요. 상대가 그 신호를 알아채면 함정으로 역이용할 수 있다는 점까지가 수싸움이에요.' },
      { title: '두 장을 다 쥐면 낚시가 된다', body: '두 문제를 모두 이기면 첫 번째 카드로 상대에게 낮은 더블을 보여 베팅을 끌어낸 뒤, 두 번째 카드로 내 파트너에게 더 높은 조합을 줄 수 있어요. 두 번의 베팅이 있는 이유가 여기에 있어요.' },
      { title: '퍼즐 실력이 곧 패', body: '공유카드 선택권은 문제를 가장 빨리 푼 사람에게 가요. 그래서 파트너의 퍼즐 실력이 팀의 카드 운을 대신해요. 10라운드 뒤 역할을 고를 때는 누가 더 빨리 푸는지가 가장 큰 판단 기준이에요.' },
    ], columns: 1 },
    { type: 'p', text: '가넷을 모두 잃는 순간 탈락후보가 되니, 가넷이 적은 팀일수록 작은 베팅으로 버티며 파트너가 이긴 판에만 크게 걸어야 해요. 트리플은 공유카드 두 장이 같은 숫자일 때만 나오므로, 같은 숫자 두 장이 펼쳐지면 그 숫자를 든 사람은 사실상 이긴 판이에요.' },
  ],
  similar: [
    { name: '텍사스 홀덤 (Texas Hold’em)', players: '2–10명', alike: '개인 카드와 공유카드를 조합해 승부하고, 공유카드가 펼쳐질 때마다 베팅해요.', differs: '홀덤은 52장 덱으로 다섯 장의 공유카드가 무작위로 나와요. 협동홀덤은 숫자 하나짜리 카드에 공유카드를 사람이 골라요.' },
    { name: '우봉고 (Ubongo)', players: '1–4명', alike: '여러 사람이 동시에 조각 퍼즐을 풀고, 가장 빨리 푼 사람이 보상을 먼저 골라요.', differs: '우봉고는 퍼즐 자체가 게임이고, 보상이 다른 게임에 쓰이지 않아요.' },
  ],
}, {
  note: 'English Wikipedia only records that this round was a garnet match.',
  meta: {
    title: 'Cooperative Hold’em rules — The Genius: Grand Final round 10 garnet match',
    description: 'The rules of Cooperative Hold’em (협동홀덤), round 10 garnet match of The Genius: Grand Final: four contestant–guest teams over 20 rounds, one card from 1–10 and two shared cards, double, straight and triple, matchstick, scale and tangram mini-games that pick the shared cards, and switching roles.',
    keywords: ['Cooperative Hold’em', 'The Genius Grand Final', 'garnet match', '협동홀덤'],
  },
  title: 'Cooperative Hold’em — The Genius: Grand Final round 10 garnet match',
  name: 'Cooperative Hold’em (협동홀덤)',
  lead: 'In one room four players bet garnets at hold’em; in another, their four partners race to solve puzzles and choose that hand’s shared cards.',
  summary: 'Contestants and guests team up: one plays hold’em while the other wins mini-games to choose the shared cards, over twenty rounds.',
  setup: [
    { type: 'list', items: [
      '**Players**: the four remaining contestants and a guest partner each, four teams.',
      '**Hold’em**: ten cards 1–10; each player holds one and combines it with two shared cards, betting the contestant’s garnets.',
      '**Mini-games**: matchsticks, scales or a seven-piece puzzle; two problems of one kind per round.',
      '**Rounds**: 20; a garnet match.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Ante and cards', body: 'The four hold’em players ante one garnet, then each gets one of the ten cards face down.' },
      { title: 'Mini-games', body: 'Meanwhile the other four solve problems; the first to solve problem one picks the first shared card, the first on problem two the second, any number 1–10, repeats allowed. Win both and you pick both.' },
      { title: 'Who sees what', body: 'The mini-game side sees all four hold’em cards and garnet counts; the hold’em side never learns who picked the shared cards.' },
      { title: 'Two betting rounds', body: 'After the first shared card, bet as in poker from the first player; after the second, bet again. Anyone who folded in the first round is out.' },
      { title: 'Showdown', body: 'Remaining cards are shown and the best combination takes the garnets; the winner leads next round.' },
    ] },
    { type: 'table', head: ['Combination', 'Condition', 'Between equals'], rows: [
      ['Triple', 'Both shared cards and yours are the same number', '—'],
      ['Straight', 'Both shared cards and yours are consecutive (10 and 1 connect)', 'Higher sum'],
      ['Double', 'Your card matches one shared card', 'Higher card'],
      ['None', 'No combination', 'Higher card'],
    ] },
    { type: 'table', head: ['Mini-game', 'Task'], rows: [
      ['Matchsticks', 'Make the shape with the given number of sticks, no stick fully on another, none left over.'],
      ['Scales', 'Balance the scale with the given weights; each slot shows what one weight there counts for.'],
      ['Puzzle', 'Use all seven pieces to copy the picture.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first contestant to lose all their garnets becomes the elimination candidate**, and the other teams play on to round 20.',
      'After 20 rounds the contestant with the most garnets wins a token and ten garnets; the candidate picks one of the two players without a token as opponent.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'In rounds 1–5 contestants play hold’em and guests the mini-games; in 6–10 they swap; after round 10 each team chooses roles for the rest.',
      'A wrong mini-game answer gives the other three a new problem.',
      'Whether side pots existed as in real poker was not confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Information is lopsided: **the mini-game side sees every card, the hold’em side only the shared cards.** Who picked them decides the hand: a winning partner builds a double or straight on your card, a rival’s partner picks something useless to you.' },
    { type: 'cards', items: [
      { title: 'Shared cards as signals', body: 'You can’t see who chose, but you can see whether the cards fit yours. A team code ("one below my card first means we won") turns shared cards into signals, and a rival who cracks the code can turn it into a trap.' },
      { title: 'Two picks make a lure', body: 'Winning both problems lets you show a rival a low double with card one to draw bets, then give your partner something better with card two. That is why there are two betting rounds.' },
      { title: 'Puzzle speed is your hand', body: 'The fastest solver picks, so a partner’s puzzle skill replaces card luck. After round 10, the key question for roles is who solves faster.' },
    ], columns: 1 },
    { type: 'p', text: 'Running out of garnets makes you the candidate, so short-stacked teams should bet small and go big only when their partner has won. A triple needs two equal shared cards, so when a pair appears, whoever holds that number has all but won.' },
  ],
  similar: [
    { name: 'Texas Hold’em', players: '2–10', alike: 'Private and shared cards combine, with betting as shared cards appear.', differs: 'Five random shared cards from a 52-card deck; here shared cards are chosen by people.' },
    { name: 'Ubongo', players: '1–4', alike: 'Everyone races to solve piece puzzles and the fastest picks a reward first.', differs: 'The puzzles are the whole game; rewards feed nothing else.' },
  ],
});

export const howMuch = g4Game({ slug: 'how-much', kind: 'main', ep: 11, related: ['hitStay', 'piggyBank', 'gradation'], check: 'one' }, {
  meta: {
    title: '하우머치 규칙 — 더 지니어스 그랜드 파이널 11회전 메인매치, 게스트 최고가를 넘지 말고 맞혀라',
    description: '더 지니어스: 그랜드 파이널 11회전 메인매치 하우머치의 규칙을 정리했어요. 게스트들이 미리 매긴 상품 10개의 가격, 10분 토론, 공개·비공개 질문(순위·가격 확인), 1원–2억 원 가격 제시와 총합 2억 원 한도, 최고가를 넘지 않는 가장 높은 가격, 10라운드 4점과 승부처까지.',
    keywords: ['하우머치', '하우 머치', '더 지니어스 하우머치', '그랜드 파이널 11회전', '더 지니어스 4'],
  },
  title: '하우머치 — 더 지니어스: 그랜드 파이널 11회전 메인매치',
  name: '하우머치',
  lead: '게스트들이 미리 값을 매긴 상품의 "가장 높게 부른 값"을 넘지 않으면서 가장 가깝게 불러야 해요. 쓸 수 있는 돈은 열 라운드 합쳐 2억 원뿐이에요.',
  summary: '게스트가 매긴 최고가를 넘지 않는 선에서 가장 높은 값을 부르는, 예산 2억 원의 3인 가격 맞히기 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 남은 플레이어 3명과 게스트들.',
      '**상품**: 게스트들이 각자의 기준으로 미리 가격을 매겨 둔 10개. 가격은 다른 게스트와 플레이어에게 공개되지 않아요.',
      '**기본 정보**: 게임 전에 게스트별로 매긴 10개 가격의 총합을 알려 줘요.',
      '**예산**: 플레이어는 라운드마다 1원–2억 원을 부를 수 있지만, 10라운드 동안 부른 값의 총합이 2억 원을 넘으면 안 돼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '상품 공개', body: '게스트 가격을 합산해 합이 낮은 상품부터 한 라운드에 하나씩 공개해요.' },
      { title: '토론 (10분)', body: '플레이어와 게스트가 상품의 가치를 자유롭게 이야기해요. 게스트는 자기가 매긴 값을 바탕으로 말하되 구체적인 금액은 말할 수 없어요.' },
      { title: '정보 확인', body: '플레이어 셋이 상의해 공개 정보 하나를 고르고, 각자 비공개 정보 하나를 골라요. 질문은 "게스트 순위 확인"(그 게스트가 몇 번째로 높게 불렀는지)과 "가격 확인"(그 게스트가 부른 값) 두 종류예요.' },
      { title: '가격 제시', body: '각자 이번 상품의 가격을 정해요. 그 뒤 세 사람의 가격과, 이 상품을 가장 높게 부른 게스트의 가격(이름은 비공개)이 공개돼요.' },
      { title: '승점', body: '게스트 최고가를 넘지 않으면서 가장 높게 부른 플레이어가 승점을 얻어요. 1–7라운드 1점, 8–9라운드 2점, 10라운드 4점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '10라운드 뒤 승점이 가장 높은 사람이 우승자, **나머지 두 명은 자동으로 데스매치**에 나가요.',
      '가장 높은 승점이 여럿이면 10라운드 승점을 얻은 사람이 우승자예요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '가장 높은 가격을 부른 플레이어가 여럿이면 그다음으로 높게 부른 사람이 승점을 얻어요. 셋이 모두 같은 값이면 아무도 얻지 못해요.',
      '10라운드는 공개·비공개 정보를 볼 수 없고, 토론 뒤 바로 가격을 불러요.',
      '토론에서 특정 금액이나 다른 물건 값과 비교하는 질문은 할 수 없어요. 게스트 최고가나 순위가 동률이어도 따로 알려 주지 않아요.',
      '부른 금액은 승점을 얻었든 못 얻었든 쓴 것으로 쳐요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '목표는 "정답"이 아니라 **게스트 최고가 바로 아래**예요. 넘으면 0이고, 너무 낮으면 다른 플레이어에게 밀려요. 여기에 예산 2억 원이 걸려 있어, 비싼 상품에 크게 부르는 것은 그만큼 뒤 라운드의 선택지를 줄여요. 상품이 싼 것부터 나오므로, 예산의 대부분은 후반 상품을 위해 남겨 둬야 해요.' },
    { type: 'cards', items: [
      { title: '정보는 최고가 쪽으로', body: '가격 확인으로 한 게스트의 값을 알면, 최고가는 그 값 이상이라는 하한이 생겨요. 순위 확인으로 "1위" 게스트를 찾으면 그 사람의 값이 곧 최고가예요. 공개 정보 하나와 비공개 정보 하나를 어떻게 조합하느냐가 라운드의 승부예요. 게스트별 총합도 "누가 전반적으로 비싸게 부르는 사람인가"를 알려 주는 단서예요.' },
      { title: '남보다 조금 위, 최고가보다 조금 아래', body: '이기려면 다른 두 사람보다 높으면서 최고가를 넘지 않아야 해요. 그래서 상대가 같은 정보를 가졌다고 보면, 그보다 조금 더 부르는 쪽이 유리해요. 최고가에 딱 붙어 부를수록 위험하고, 셋이 같은 값을 부르면 아무도 얻지 못하니 같은 결론에 이르는 것도 피해야 해요.' },
      { title: '마지막 라운드 4점', body: '10라운드 하나가 1–7라운드 네 개와 같은 값이고, 정보 없이 토론만으로 불러야 해요. 앞에서 크게 앞서지 못했다면 결국 10라운드 승부가 되므로, 그때 쓸 예산을 남겨 둔 사람이 유리해요. 동점도 10라운드 승자에게 가요.' },
    ], columns: 1 },
    { type: 'p', text: '지배 전략은 없지만, 예산을 아끼는 것은 확실히 손해가 없어요. 승점을 못 얻을 라운드에는 최소 금액(1원)을 불러 예산을 지키고, 확신이 있는 라운드에 집중하는 것이 기본 틀이에요.' },
  ],
  similar: [
    { name: '위츠 앤 웨이저스 (Wits & Wagers)', players: '3–7명', alike: '숫자 정답을 맞히는 퀴즈에서 "넘지 않는 가장 가까운 답"이 이겨요. 남의 답을 보고 판단하는 것도 비슷해요.', differs: '위츠 앤 웨이저스는 정해진 사실이 정답이고, 남의 답에 베팅할 수 있어요.' },
    { name: '웨이브렝스 (Wavelength)', players: '2–12명', alike: '한 사람이 생각한 값을 말로 된 힌트와 토론으로 추측해 맞혀요.', differs: '웨이브렝스는 협력 게임이고, 예산이나 넘으면 실격 같은 규칙이 없어요.' },
  ],
}, {
  meta: {
    title: 'How Much rules — The Genius: Grand Final round 11 main match',
    description: 'The rules of How Much (하우머치), round 11 main match of The Genius: Grand Final: ten items priced in advance by guests, a ten-minute discussion, public and private questions (rank or price), bids from ₩1 to ₩200 million within a ₩200 million total, the highest bid not over the top guest price, and 4 points for round 10.',
    keywords: ['How Much', 'The Genius Grand Final', '하우머치'],
  },
  title: 'How Much — The Genius: Grand Final round 11 main match',
  name: 'How Much (하우머치)',
  lead: 'Bid as close as you can to the highest price any guest put on an item, without going over, on a total budget of ₩200 million for ten rounds.',
  summary: 'Three players bid under the guests’ top price on ten items, with a shared budget limit of ₩200 million each.',
  setup: [
    { type: 'list', items: [
      '**Players**: the three remaining contestants, plus guests.',
      '**Items**: ten, priced in advance by each guest as they saw fit; prices are hidden from other guests and contestants.',
      '**Starting information**: each guest’s total over the ten items.',
      '**Budget**: each bid is ₩1 to ₩200 million, but a contestant’s bids over ten rounds may not total more than ₩200 million.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Item', body: 'Items appear one per round, in order of their summed guest prices, lowest first.' },
      { title: 'Discussion (10 minutes)', body: 'Contestants and guests discuss the item; guests speak from their own price but may not state amounts.' },
      { title: 'Questions', body: 'The three agree on one public question and each picks one private one: a guest’s rank (how high they priced it among guests) or a guest’s price.' },
      { title: 'Bid', body: 'Each sets a price; then the three bids and the highest guest price (without the name) are shown.' },
      { title: 'Points', body: 'The highest bid not over the top guest price scores: 1 point in rounds 1–7, 2 in rounds 8–9, 4 in round 10.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After ten rounds the top scorer wins and **the other two go straight to the death match**.',
      'If several share the top score, the one who won round 10 wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If the highest qualifying bids tie, the next highest scores; if all three bid the same, nobody does.',
      'Round 10 has no questions: bids follow straight after the discussion.',
      'Comparing the item to specific amounts or other products is not allowed, and ties among guests’ prices or ranks are not announced.',
      'Every bid counts as spent, scoring or not.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The target is not "the right price" but **just under the top guest price**. Over is zero; too low loses to rivals. With a ₩200 million budget, a big bid now narrows later choices, and since cheap items come first, most of the budget belongs to the late rounds.' },
    { type: 'cards', items: [
      { title: 'Aim information at the top price', body: 'A guest’s price is a lower bound on the top price; finding the guest ranked first gives the top price itself. Combining one public and one private question is the round. Guests’ totals hint at who prices high in general.' },
      { title: 'Just above rivals, just below the top', body: 'You must beat both rivals without going over, so if they have the same information, bidding a little more pays. Hugging the top is risky, and three equal bids score nothing.' },
      { title: 'Four points at the end', body: 'Round 10 is worth four early rounds and is bid blind after discussion; unless someone pulled ahead early, it decides the game, and it also breaks ties. Save budget for it.' },
    ], columns: 1 },
    { type: 'p', text: 'No strategy dominates, but saving budget never hurts: bid ₩1 on rounds you can’t win and concentrate on rounds you’re sure of.' },
  ],
  similar: [
    { name: 'Wits & Wagers', players: '3–7', alike: 'Numeric trivia where the closest answer without going over wins, judged partly from others’ answers.', differs: 'The answer is a fixed fact, and you can bet on others’ answers.' },
    { name: 'Wavelength', players: '2–12', alike: 'Guess a value someone has in mind from clues and discussion.', differs: 'It is cooperative, with no budget and no going-over penalty.' },
  ],
});
