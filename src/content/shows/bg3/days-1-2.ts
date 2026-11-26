// 피의 게임3, days 1–2: 선착순, 스위치 포커, 미스터리 타임, 밸런스 매치.
import { bg3Game } from './shared';

export const firstCome = bg3Game('first-come', 'money', '1', ['nemoCount', 'equationTower', 'hexagon'], {
  meta: {
    title: '선착순 규칙 — 피의 게임3 1일차 머니 챌린지, 자물쇠를 풀고 돈을 챙겨 달리기',
    description: '피의 게임3 1일차 머니 챌린지 선착순의 규칙을 정리했어요. 수갑과 밧줄, 문제의 답이 비밀번호인 자물쇠, 탁상 위 개인 자금을 원하는 만큼 챙기기, 먼저 도착한 우승자와 마지막 도착자의 지목·투표까지.',
    keywords: ['선착순', '피의 게임3 선착순', '피의게임3 머니 챌린지', '피의 게임 시즌3', '피의게임3'],
  },
  title: '선착순 — 피의 게임3 1일차 머니 챌린지',
  name: '선착순',
  lead: '문제를 풀어 다리의 자물쇠를 열고, 탁자 위 돈을 원하는 만큼 챙겨 건물까지 달려요. 많이 챙길수록 무겁고 느려져요.',
  summary: '자물쇠를 풀고 돈을 챙겨 피의 낙원에 먼저 도착하는 레이스. 챙긴 돈이 그대로 첫 개인 자금이 돼요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 피의 낙원에서 시작하는 9명.',
      '**구속**: 수갑과 다리 밧줄(자물쇠). 시작하면 수갑만 풀려요.',
      '**돈**: 앞쪽 탁자에 참가자들의 연봉에 비례한 개인 자금 총량만큼의 돈이 쌓여 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '문제 풀기', body: '화면에 나오는 문제의 정답이 다리 밧줄 자물쇠의 비밀번호예요.' },
      { title: '돈 챙기기', body: '밧줄을 푼 사람은 탁자의 돈을 원하는 만큼 챙겨요. 챙긴 돈이 그 사람의 첫 개인 자금이 돼요.' },
      { title: '도착', body: '피의 낙원 건물에 도착하면 끝이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**가장 먼저 도착한 사람**이 우승해 데스매치 진출자 투표에서 면제돼요.',
      '**마지막에 도착한 사람**은 최하위가 되어, 우승자를 뺀 사람 중 두 명을 지목해요. 나머지가 그중 한 명을 투표로 골라, 그 사람이 최하위자와 함께 데스매치에 나가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '돈을 얼마나 챙기든 순위와는 상관없어요. 돈과 속도 사이의 선택일 뿐이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '선착순은 **돈과 속도의 교환**이에요. 개인 자금은 이후 추가 투표권(2,000만 원)이나 거래에 쓰이므로 많을수록 유리하지만, 꼴찌만 되지 않으면 순위는 크게 중요하지 않아요.' },
    { type: 'cards', items: [
      { title: '꼴찌만 피하면 돼요', body: '보상은 1등(면제)과 꼴찌(데스매치) 두 자리에만 걸려 있어요. 그래서 중간 순위가 확실하다면 시간을 들여 돈을 많이 챙기는 것이 이득이에요. 문제를 빨리 푼 사람일수록 돈을 챙길 여유가 생겨요.' },
      { title: '돈은 이후의 투표력', body: '데스매치 진출자는 투표로 정해지고, 추가 투표권을 돈으로 살 수 있어요. 첫날 챙긴 돈이 곧 이후 며칠 동안의 정치력이 되는 구조예요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '언락! (Unlock!)', players: '1–6명', alike: '퍼즐을 풀어 나온 숫자로 자물쇠를 여는 방탈출 게임이에요.', differs: '언락은 협력해서 함께 탈출하고, 돈을 챙기는 선택이 없어요.' },
    { name: '포 세일 (For Sale)', players: '3–6명', alike: '돈과 다른 이득(여기서는 속도) 사이의 교환이 핵심인 게임이에요.', differs: '포 세일은 경매로 건물을 사고팔아요.' },
  ],
}, {
  meta: {
    title: 'First Come rules — The Bloody Game 3, day 1 money challenge',
    description: 'The rules of First Come (선착순) from The Bloody Game 3: handcuffs and a locked rope, a puzzle whose answer opens the lock, grabbing as much of the money on the table as you like, the first arrival’s immunity and the last arrival’s nominations.',
    keywords: ['First Come', 'Bloody Game 3', 'Bloody Game 3 money challenge'],
  },
  title: 'First Come — The Bloody Game 3, day 1 money challenge',
  name: 'First Come (선착순)',
  lead: 'Solve the puzzle to unlock your legs, grab as much money from the table as you like, and run to the building. More money, more weight.',
  summary: 'Unlock yourself, grab money and race to the Paradise; what you carry becomes your starting funds.',
  setup: [
    { type: 'list', items: [
      '**Players**: the nine starting in the Paradise.',
      '**Restraints**: handcuffs and a locked leg rope; the cuffs come off at the start.',
      '**Money**: a pile on the table equal to the players’ total funds, set in proportion to their salaries.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Solve', body: 'The puzzle’s answer is the code for the leg lock.' },
      { title: 'Grab', body: 'Once free, take as much money as you like; it becomes your starting personal funds.' },
      { title: 'Arrive', body: 'Reach the Paradise building.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first to arrive** wins and is exempt from the death-match vote.',
      '**The last** names two players (not the winner); the rest vote one of them into the death match alongside.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How much you carry does not affect your place; it is a trade of money against speed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'First Come trades **money against speed**. Funds later buy extra votes (₩20 million each) and deals, but only first and last place matter.' },
    { type: 'cards', items: [
      { title: 'Just avoid last', body: 'Only first (immunity) and last (death match) carry stakes, so a safely mid-placed player should take time to grab more. Fast solvers can afford to carry more.' },
      { title: 'Money is future votes', body: 'Death-match entrants are voted in and extra votes cost money, so day-1 cash is political power for days to come.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Unlock!', players: '1–6', alike: 'Puzzles produce numbers that open locks.', differs: 'It is cooperative, with no money to grab.' },
    { name: 'For Sale', players: '3–6', alike: 'A game about trading money against another advantage.', differs: 'You buy and sell properties at auction.' },
  ],
});

export const switchPoker = bg3Game('switch-poker', 'death', '1', ['indianPoker', 'twoSidedPoker', 'hitStay'], {
  meta: {
    title: '스위치 포커 규칙 — 피의 게임3 1일차 데스매치, 팀원과 카드를 바꾸는 2:2 포커',
    description: '피의 게임3 1일차 데스매치 스위치 포커의 규칙을 정리했어요. 1–15 카드와 칩 20개, 2:2 팀전, 오픈 카드 변경·팀원과 교환·버리기·패스, 베팅과 합계 비교, 가장 낮은 합이 오픈 카드를 얻는 규칙, 주 플레이어 칩으로 정하는 승패까지.',
    keywords: ['스위치 포커', '피의 게임3 스위치 포커', '피의게임3 데스매치', '팀 포커', '피의게임3'],
  },
  title: '스위치 포커 — 피의 게임3 1일차 데스매치',
  name: '스위치 포커',
  lead: '두 장의 카드 합으로 겨루는 포커인데, 같은 팀끼리 카드를 바꿀 수 있어요. 합이 가장 낮은 사람은 가운데 카드를 덤으로 받아요.',
  summary: '팀원과 카드를 맞바꿔 두 장의 합을 키우는 2:2 데스매치 포커. 주 플레이어의 칩이 승패를 정해요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 2:2. 낙원과 저택의 탈락 후보가 **주 플레이어**, 그들이 지목한 사람이 **조력자**예요.',
      '**카드**: 1–15가 한 장씩.',
      '**칩**: 각자 20개. 라운드마다 1개씩 기본 베팅해요.',
      '**라운드**: 7라운드. 1라운드 선공 팀은 추첨, 이후 번갈아 가요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '카드', body: '각자 2장을 무작위로 받고, 남은 7장 중 1장이 가운데 공개돼요(오픈 카드).' },
      { title: '행동', body: '차례마다 하나를 골라요. **오픈 카드 변경**(더미 한 장을 뒤집어 바꾸기), **카드 교환**(팀원과 한 장 교환 — 먼저 건네면 상대가 보고 바꿔 주거나 그대로 돌려줘요), **카드 버리기**(더미에서 한 장 받고 세 장 중 하나를 공개로 버리기), **패스**.' },
      { title: '베팅', body: '모두 행동한 뒤 콜·레이즈·폴드로 베팅해요.' },
      { title: '공개', body: '베팅이 맞춰지면 남은 사람이 두 장을 공개해요. **합이 가장 낮은 사람 한 명**이 오픈 카드를 가져가고, 그 뒤 **합이 가장 큰 사람**이 판돈을 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '7라운드 뒤 **주 플레이어끼리 칩을 비교**해, 더 많은 쪽 팀이 이겨요.',
      '누구든 칩을 모두 잃으면 그 사람의 팀이 바로 져요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '합이 가장 낮은 사람이 여럿이면 오픈 카드는 아무도 못 가져가요.',
      '합이 가장 큰 사람이 여럿이면 판돈이 다음 라운드로 넘어가고, 그 라운드에는 기본 베팅이 없어요.',
      '자기 카드를 말로 직접 공개하는 건 금지예요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '스위치 포커의 핵심은 **팀원 사이의 카드 이동**이에요. 결국 판돈을 가져가는 건 한 사람이니, 팀은 두 사람의 좋은 카드를 한쪽에 몰아 주는 것이 기본 전략이에요.' },
    { type: 'cards', items: [
      { title: '꼴찌의 덤', body: '합이 가장 낮은 사람이 오픈 카드를 받으므로, 팀원 한 명은 일부러 약한 패로 남아 오픈 카드를 챙기는 역할을 할 수 있어요. 오픈 카드는 다음 라운드의 재료가 돼요. 다만 덤을 받으려면 끝까지 베팅에 남아 있어야 해요.' },
      { title: '주 플레이어를 지켜요', body: '승패는 주 플레이어의 칩으로만 정해지지만, 조력자가 칩을 다 잃어도 팀이 져요. 그래서 조력자는 판돈을 키우는 역할과 위험을 피하는 역할 사이에서 균형을 잡아야 해요.' },
      { title: '버린 카드와 오픈 카드는 정보', body: '1–15가 한 장씩이라, 공개된 카드를 빼면 남은 카드의 범위를 정확히 셀 수 있어요. 상대 팀이 버린 카드를 보면 그들이 무엇을 노리는지도 보여요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '텍사스 홀덤 포커', players: '2–10명', alike: '콜·레이즈·폴드 베팅과 패의 강약 비교가 같아요.', differs: '홀덤은 족보로 겨루고, 같은 팀끼리 카드를 바꾸지 않아요.' },
    { name: '진 러미 (Gin Rummy)', players: '2명', alike: '더미에서 한 장 가져오고 한 장을 공개로 버리며 패를 다듬어요.', differs: '진 러미는 조합을 만드는 게임이고 베팅이 없어요.' },
  ],
}, {
  meta: {
    title: 'Switch Poker rules — The Bloody Game 3, day 1 death match',
    description: 'The rules of Switch Poker from The Bloody Game 3: cards 1–15 and 20 chips, two against two, changing the open card, swapping with a teammate, discarding or passing, betting and comparing totals, the open card for the lowest total, and winning on the main players’ chips.',
    keywords: ['Switch Poker', 'Bloody Game 3 death match', 'team poker'],
  },
  title: 'Switch Poker — The Bloody Game 3, day 1 death match',
  name: 'Switch Poker',
  lead: 'Poker on the total of two cards — but teammates may swap cards, and the lowest total picks up the open card as a consolation.',
  summary: 'A 2-vs-2 death-match poker where teammates swap cards to build two-card totals; the main players’ chips decide it.',
  setup: [
    { type: 'list', items: [
      '**Players**: 2 v 2: the Paradise and Mansion candidates are **main players**, each with the **helper** they nominated.',
      '**Cards**: one each of 1–15.',
      '**Chips**: 20 each; ante one per round.',
      '**Rounds**: seven; the first team is drawn, then alternates.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Cards', body: 'Two random cards each; one of the remaining seven is turned up in the centre (the open card).' },
      { title: 'Actions', body: 'On your turn: **change the open card** (turn up a new one), **swap** a card with your teammate (they see it and may hand back the same card), **discard** (draw one and openly discard one of three), or **pass**.' },
      { title: 'Betting', body: 'Then call, raise or fold.' },
      { title: 'Showdown', body: 'Remaining players reveal both cards: **the single lowest total** takes the open card, then **the highest total** wins the pot.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After seven rounds **the main players compare chips**; the richer one’s team wins.',
      'Anyone running out of chips loses for their team at once.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A shared lowest total means nobody takes the open card.',
      'A shared highest total carries the pot over, with no ante next round.',
      'Stating your cards aloud is forbidden.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Switch Poker hinges on **moving cards within a team**. Only one player takes the pot, so concentrating the team’s best cards in one hand is the basic plan.' },
    { type: 'cards', items: [
      { title: 'The consolation card', body: 'The lowest total takes the open card, so one teammate can deliberately stay weak to collect it for next round — though only by staying in the betting.' },
      { title: 'Protect the main player', body: 'The result depends on main players’ chips, yet a helper going broke also loses, so helpers balance building pots against avoiding risk.' },
      { title: 'Visible cards are information', body: 'With one of each number, discarded and open cards pin down what remains; the other team’s discards show what they want.' },
    ], columns: 1 },
  ],
  similar: [
    { name: "Texas hold'em poker", players: '2–10', alike: 'Call, raise and fold betting and comparing hand strength.', differs: 'Hands are ranked combinations, and teammates never swap cards.' },
    { name: 'Gin Rummy', players: '2', alike: 'Draw one, discard one face up to improve a hand.', differs: 'It is about melds, with no betting.' },
  ],
});

export const mysteryTime = bg3Game('mystery-time', 'money', '2', ['hiddenWord', 'piggyBank', 'equationSignal'], {
  meta: {
    title: '미스터리 타임 규칙 — 피의 게임3 2일차 머니 챌린지, 질문할수록 늘어나는 시간',
    description: '피의 게임3 2일차 머니 챌린지 미스터리 타임의 규칙을 정리했어요. 사건 설명과 그림, 질문 1개당 1분, 네·아니오·그럴 수도·중요하지 않음, 메인 키워드와 추가 키워드, 오답 5분, 3명 정답 시 종료와 20분 벌칙, 우승자 보상까지.',
    keywords: ['미스터리 타임', '피의 게임3 미스터리 타임', '피의게임3 머니 챌린지', '바다거북 수프', '피의게임3'],
  },
  title: '미스터리 타임 — 피의 게임3 2일차 머니 챌린지',
  name: '미스터리 타임',
  lead: '사건의 인과관계를 질문으로 알아내요. 시간이 가장 적게 든 사람이 1등, 가장 많이 든 사람이 데스매치예요.',
  summary: '질문 하나에 1분씩 쌓이는 시간 싸움으로 사건의 전말을 맞히는 개인전. 낙원과 저택에서 따로 동시에 열렸어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 낙원 8명, 저택 7명이 각자의 장소에서 따로 동시에 하는 개인전(이 사실은 알려 주지 않았어요).',
      '**라운드**: 2라운드. 사건 설명, 문제, 그림이 공개되는 순간부터 모두의 시간이 흘러요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '질문하기', body: '투표룸에 한 번 들어갈 때 질문을 3개까지 하고, 질문마다 내 시간에 1분이 더해져요. 답은 "네 / 아니오 / 그럴 수도 있습니다 / 중요하지 않습니다" 넷 중 하나예요.' },
      { title: '정답 말하기', body: '메인 키워드가 모두 들어가고 인과관계가 맞으면 정답이에요. 정답이면 시간이 멈추고, 오답이면 5분이 더해져요. 추가 키워드까지 맞히면 키워드 하나당 1분이 빠져요. 정답자는 라운드가 끝날 때까지 격리돼요.' },
      { title: '힌트', body: '30분이 지나거나 정답자가 나오면 힌트가 전체 공개돼요.' },
      { title: '라운드 종료', body: '정답자가 3명 나오면 끝나고, 못 맞힌 사람은 20분이 더해져요. 1라운드 뒤에는 시간 순위만 공개돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '두 라운드 합계 시간이 **가장 적은 사람이 우승**(개인 자금 2,000만 원, 면제권 2장, 판도라의 상자 열쇠), **가장 많은 사람이 탈락 후보**예요.',
      '탈락 후보는 면제된 사람을 빼고 두 명을 지목하고, 나머지의 투표로 정해진 한 명과 함께 데스매치에 나가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '면제권 한 장은 탈락 후보가 아닌 다른 사람에게 줄 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '미스터리 타임은 질문 하나하나에 값이 붙은 **수평적 사고 퍼즐**이에요. 피의 게임X의 「미스터리 타임 Ⅱ」의 원형이고, 이 시즌은 팀이 아닌 개인전이라 질문의 정보를 남과 나누지 않아도 돼요.' },
    { type: 'cards', items: [
      { title: '3명이 맞히면 끝나요', body: '정답자 세 명이 나오면 라운드가 끝나고 나머지는 20분을 더 받아요. 그래서 일찍 맞히지 못하면 큰 벌칙이 붙어, 질문을 아끼다 늦어지는 것보다 적당히 질문해 빨리 맞히는 것이 유리해요.' },
      { title: '추가 키워드는 보너스', body: '추가 키워드는 하나에 1분씩 빼 줘요. 정답을 확신한 뒤 한두 개의 질문으로 추가 키워드를 확인하면, 그 질문의 1분을 되찾고도 남을 수 있어요.' },
      { title: '힌트를 기다릴까', body: '30분이 지나거나 첫 정답자가 나오면 힌트가 공개돼요. 힌트를 기다리면 질문을 아낄 수 있지만 그동안 시간이 흘러요. 누가 먼저 맞히느냐가 다른 모두에게 힌트를 주는 구조예요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '블랙 스토리 (Black Stories)', players: '2명 이상', alike: '결말만 듣고 예·아니오 질문으로 사건의 전말을 맞혀요.', differs: '질문에 비용이 없고, 경쟁보다 함께 푸는 놀이예요.' },
    { name: '스무고개', players: '2명 이상', alike: '예·아니오 질문으로 숨은 답을 좁혀 가요.', differs: '답이 물건 하나이고, 인과관계나 키워드가 없어요.' },
  ],
  note: '사건 문제는 적지 않았어요.',
}, {
  meta: {
    title: 'Mystery Time rules — The Bloody Game 3, day 2 money challenge',
    description: 'The rules of Mystery Time from The Bloody Game 3: an incident and a picture, one minute per question, yes/no/maybe/not important, main and extra keywords, five minutes per wrong answer, the round ending after three solvers with a 20-minute penalty, and the winner’s rewards.',
    keywords: ['Mystery Time', 'Bloody Game 3 money challenge', 'lateral thinking puzzle'],
  },
  title: 'Mystery Time — The Bloody Game 3, day 2 money challenge',
  name: 'Mystery Time',
  lead: 'Work out an incident’s cause and effect by questioning. Least time wins; most time goes to the death match.',
  summary: 'An individual race of costed questions to solve an incident, held separately and simultaneously in the Paradise and the Mansion.',
  setup: [
    { type: 'list', items: [
      '**Players**: eight in the Paradise and seven in the Mansion, each group playing separately at the same time (they were not told).',
      '**Rounds**: two; clocks start as the incident, question and picture are shown.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Ask', body: 'Up to three questions per visit to the voting room, each adding a minute; answers are "yes", "no", "maybe" or "not important".' },
      { title: 'Answer', body: 'Correct if every main keyword is there and the causality is right: your clock stops. Wrong adds five minutes. Each extra keyword also included takes a minute off. Solvers are isolated until the round ends.' },
      { title: 'Hints', body: 'After 30 minutes or the first solver, a hint is shown to all.' },
      { title: 'Round end', body: 'After three solvers the round ends and everyone else gets 20 minutes added. After round 1 only the ranking is shown.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Least total time wins** (₩20 million, two immunity passes, the Pandora’s box key); **most time is the candidate**.',
      'The candidate names two non-immune players; the others vote one of them into the death match too.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'One immunity pass may be given to anyone except the candidate.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Mystery Time is **a lateral-thinking puzzle with a price on every question** — the original of Bloody Game X’s Mystery Time II, here played individually.' },
    { type: 'cards', items: [
      { title: 'Three solvers end it', body: 'Everyone else then gets 20 minutes, so being slow is heavily punished; asking a few questions and solving early beats hoarding questions.' },
      { title: 'Extra keywords are a bonus', body: 'Each takes a minute off; once sure, a question or two to confirm extras can more than pay for itself.' },
      { title: 'Wait for the hint?', body: 'Hints arrive after 30 minutes or the first solver, saving questions but costing time — and whoever solves first hands everyone a hint.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Black Stories', players: '2+', alike: 'Reconstruct a story from its outcome with yes/no questions.', differs: 'Questions are free and it is not a race.' },
    { name: 'Twenty Questions', players: '2+', alike: 'Yes/no questions narrow down a hidden answer.', differs: 'The answer is one thing, with no keywords.' },
  ],
  note: 'The incidents are not described.',
});

export const balanceMatch = bg3Game('balance-match', 'death', '2', ['nemoCount', 'blindGomoku', 'onestroke'], {
  meta: {
    title: '밸런스 매치 규칙 — 피의 게임3 2일차 데스매치, 해낼 수 있는 만큼 거는 2:2 미션',
    description: '피의 게임3 2일차 데스매치 밸런스 매치의 규칙을 정리했어요. 2:2 팀전, 라운드마다 바뀌는 능력 미션(틀린그림찾기·블럭 옮기기·미로코드·카드 메모리), 성공 횟수 베팅과 도전권, 성공 2점·상대 성공 1점, 5라운드 승점까지.',
    keywords: ['밸런스 매치', '피의 게임3 밸런스 매치', '피의게임3 데스매치', '피의게임3'],
  },
  title: '밸런스 매치 — 피의 게임3 2일차 데스매치',
  name: '밸런스 매치',
  lead: '이번 미션을 몇 번 해낼 수 있는지 서로 높게 부르고, 더 높게 부른 팀이 실제로 해내야 해요.',
  summary: '능력 미션의 성공 횟수를 경매처럼 부르고, 부른 만큼 해내면 점수를 얻는 2:2 팀 데스매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 낙원과 저택 탈락 후보의 2:2 팀전(현장에서 팀전임을 알려 줘요).',
      '**라운드**: 5라운드. 라운드마다 다른 능력을 시험하는 미션이 공개돼요.',
    ] },
    { type: 'table', head: ['라운드', '미션', '능력'], rows: [
      ['1', '틀린그림찾기: 그림을 보고 나서, 두 번째 그림에서 달라진 곳 찾기', '관찰력'],
      ['2', '블럭 옮기기: 블럭을 쌓아 들어 목표 지점까지 떨어뜨리지 않고 옮기기', '집중력'],
      ['3', '미로코드: 3D 미로 속 물음표의 위치를 평면도의 좌표로 찾기(3문제, 몇 분 안에)', '공간 지각'],
      ['4', '카드 메모리: 숫자 카드 50장과 알파벳 두 벌을 섞은 카드를 순서대로 외우기(최대 102장)', '암기력'],
      ['5', '방송에서 공개되지 않음', '—'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '상의 (10분)', body: '팀원이 각자 최대 몇 번 성공할 수 있을지 상의해요.' },
      { title: '베팅', body: '10분 동안, 상대 팀이 건 횟수를 보고 우리 팀 횟수를 몇 번이든 바꿀 수 있어요. 더 많이(또는 더 빨리) 하겠다고 건 팀이 먼저 도전해요.' },
      { title: '도전', body: '도전 팀은 건 횟수 이상을 해내야 해요. 성공하면 승점 2점, 실패하면 상대 팀이 도전해서 성공하면 상대가 1점, 실패하면 0점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['5라운드 뒤 **승점이 많은 팀**이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '1·2라운드 선언 방식(몇 개를 찾을지, 몇 개를 옮길지)은 정리 자료에서 추정으로 적혀 있어 단정하지 않았어요.',
      '상대 팀이 도전할 때 필요한 기준은 정리 자료에 자세히 나오지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '밸런스 매치는 **자기 실력을 정확히 아는 능력**을 시험해요. 높게 부르면 도전권을 얻지만 실패 위험이 커지고, 낮게 부르면 상대에게 도전권을 내줘요.' },
    { type: 'cards', items: [
      { title: '도전권의 값', body: '먼저 도전해 성공하면 2점, 상대가 대신 성공하면 1점이라, 도전권을 가져오는 것이 1점 이상의 가치예요. 상대 팀의 능력을 낮게 볼수록 내 팀은 무리해서 높게 부를 필요가 없어요.' },
      { title: '팀원 중 누가 할까', body: '미션마다 필요한 능력이 달라서, 팀원 중 그 능력이 강한 사람이 맡도록 정하는 것이 핵심이에요. 다섯 라운드의 능력이 공개되는 순서를 보고 역할을 나누면 돼요.' },
      { title: '상대의 허세', body: '베팅은 10분 동안 몇 번이든 바꿀 수 있어서, 일부러 높게 불러 상대를 무리하게 만들고 마지막에 내리는 수도 가능해요. 마감 직전의 숫자가 진짜예요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '라이어스 다이스 (Liar’s Dice)', players: '2–6명', alike: '점점 높게 부르다 누군가 의심하면 확인하는 "올려 부르기" 구조예요.', differs: '라이어스 다이스는 주사위 개수를 부르고, 실제 실력을 시험하지 않아요.' },
    { name: '젠가 (Jenga)', players: '1명 이상', alike: '블럭을 떨어뜨리지 않고 다루는 손재주를 시험해요(2라운드 미션과 닮았어요).', differs: '젠가는 탑에서 블럭을 빼 올리는 게임이고, 베팅이 없어요.' },
  ],
}, {
  meta: {
    title: 'Balance Match rules — The Bloody Game 3, day 2 death match',
    description: 'The rules of Balance Match from The Bloody Game 3: two against two, a different skill mission each round (spot the difference, block carrying, maze code, card memory), bidding success counts for the right to try, 2 points for success and 1 for the other team’s, and five rounds.',
    keywords: ['Balance Match', 'Bloody Game 3 death match'],
  },
  title: 'Balance Match — The Bloody Game 3, day 2 death match',
  name: 'Balance Match',
  lead: 'Bid how many times you can complete this round’s mission; the higher bidder must then actually do it.',
  summary: 'A 2-vs-2 death match: bid how many successes you can manage at a skill mission, then deliver.',
  setup: [
    { type: 'list', items: [
      '**Players**: the Paradise and Mansion candidates, two against two (announced on site).',
      '**Rounds**: five, each revealing a mission testing a different skill.',
    ] },
    { type: 'table', head: ['Round', 'Mission', 'Skill'], rows: [
      ['1', 'Spot the difference: study a picture, then find what changed in a second one', 'Observation'],
      ['2', 'Block carrying: stack and carry blocks to a target without dropping them', 'Concentration'],
      ['3', 'Maze code: locate a "?" in a 3D maze as coordinates on its plan (three problems, within a time)', 'Spatial sense'],
      ['4', 'Card memory: memorise a shuffle of 50 digit cards and two alphabets in order (up to 102)', 'Memory'],
      ['5', 'Not shown on air', '—'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Discuss (10 minutes)', body: 'Teammates work out how much each can achieve.' },
      { title: 'Bid', body: 'For ten minutes bids can change freely after seeing the other team’s; the team promising more (or faster) attempts first.' },
      { title: 'Attempt', body: 'The attempting team must meet its bid: success scores 2; failure lets the other team try for 1 point (0 if it also fails).' },
    ] },
  ],
  win: [
    { type: 'list', items: ['After five rounds **the higher score** wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How rounds 1 and 2 are bid is only estimated in the source and is not asserted.',
      'What the second team must achieve when it attempts is not detailed in the source.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Balance Match tests **knowing exactly what you can do**: bid high and you attempt first but risk failing; bid low and the other team gets the chance.' },
    { type: 'cards', items: [
      { title: 'What the first attempt is worth', body: 'A first-attempt success scores 2, the other team’s 1, so winning the attempt is worth at least a point. The weaker you think the other team, the less you need to overbid.' },
      { title: 'Who takes which mission', body: 'Each mission needs a different skill, so assign the teammate strongest at it; the revealed order of skills sets the split.' },
      { title: 'Bluffing in the bids', body: 'Bids can change for ten minutes, so bidding high to push the other team and dropping late is possible; only the final numbers are real.' },
    ], columns: 1 },
  ],
  similar: [
    { name: "Liar's Dice", players: '2–6', alike: 'Ever-higher claims until someone tests them.', differs: 'It claims dice counts and never tests real skill.' },
    { name: 'Jenga', players: '1+', alike: 'A test of steady hands with blocks, like round 2.', differs: 'You pull blocks from a tower; there is no bidding.' },
  ],
});
