// 더 지니어스: 블랙가넷, rounds 1–3: 과일가게, 흑과 백 II, 배심원, 베팅 가위바위보, 중간 달리기.
import { ep, g3Game, namuGame, round } from './shared';

export const fruitStand = g3Game({
  slug: 'fruit-stand', kind: 'main', when: round(1), episode: ep(1), eps: [1], note: 'two',
  related: ['gradation', 'hitStay', 'piggyBank'],
}, {
  meta: {
    title: '과일가게 규칙 — 더 지니어스 시즌3 블랙가넷 1회전 메인매치, 최저가가 판매를 독차지하는 가격 게임',
    description: '더 지니어스: 블랙가넷 1회전 메인매치 과일가게의 규칙을 정리했어요. 과일 두 종류의 판매권, 1천–5천 원 비공개 희망가, 최저가가 전량을 파는 정산, 비밀·교체 능력, 4만·5만 원 가넷 보상과 담합이 깨지는 이유까지.',
    keywords: ['과일가게', '더 지니어스 과일가게', '더 지니어스3 과일가게', '블랙가넷 1회전', '더 지니어스 블랙가넷 메인매치', '지니어스 시즌3 게임'],
  },
  title: '과일가게 — 더 지니어스: 블랙가넷 1회전 메인매치',
  name: '과일가게',
  lead: '같은 과일을 파는 사람들끼리 몰래 가격을 써내요. 가장 싸게 부른 사람이 그 과일을 모두 팔아요. 다 같이 비싸게 팔면 모두가 이득인데, 혼자 깎으면 혼자 크게 벌어요.',
  summary: '같은 과일을 파는 상인끼리 비공개로 값을 부르고, 최저가가 판매를 독차지하는 4라운드 가격 경쟁.',
  setup: [
    { type: 'list', items: [
      '**인원**: 13명 전원.',
      '**과일**: 사과·포도·참외·감귤·딸기·수박 여섯 가지. 각자 무작위로 두 가지의 판매권을 받아요. 사과·포도·참외·감귤은 4명씩, 딸기와 수박은 5명씩 팔아요.',
      '**능력**: 게임 중 딱 한 번, **비밀**과 **교체** 중 하나를 쓸 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '희망가 제출', body: '라운드마다 자기가 파는 과일 각각에 1천–5천 원(천 원 단위) 중 하나를 딜러 룸에서 몰래 적어요.' },
      { title: '판매가 결정', body: '한 과일의 판매가는 그 과일을 파는 사람들이 적은 값 중 **가장 낮은 값**이에요. 최저가를 적은 사람이 "최저가 × 그 과일 판매자 수"만큼 벌어요.' },
      { title: '공동 최저가', body: '최저가를 적은 사람이 여럿이면 그 수입을 똑같이 나누고, 원 단위 아래는 버려요.' },
      { title: '공개', body: '라운드가 끝나면 과일별 판매가와 수입이 공개돼요. 각자의 누적 수입은 끝날 때까지 비공개예요.' },
      { title: '4라운드', body: '같은 방식으로 네 번 하면 끝나요.' },
    ] },
    { type: 'table', head: ['능력', '효과'], rows: [
      ['비밀', '그 라운드에 한해, 고른 과일 하나의 판매가와 수입을 가려요. 누가 썼는지는 알려지지 않고, 내가 팔지 않는 과일에도 쓸 수 있어요.'],
      ['교체', '내 과일 하나를 다른 과일로 바꿔요. 바꾼 사실은 곧바로 모두에게 공개되고, 희망가를 내기 전에만 쓸 수 있어요.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '누적 수입 1위가 우승, 꼴찌가 탈락후보예요. 단독 우승자는 생명의 징표를 하나 더 받아 다른 사람에게 줄 수 있어요.',
      '꼴찌가 여럿이면 우승자(들)가 그중 탈락후보를 정해요.',
      '수입 4만 원 이상이면 가넷 1개, 5만 원 이상이면 가넷 2개를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '끝났을 때 모두의 수입이 같으면 전원에게서 1만 원을 빼고 연장 라운드를 해요.',
      '영어 위키백과는 1–5달러 단위로 옮겨 설명하지만 구조는 같아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '과일가게는 경제학의 **가격 경쟁(베르트랑 경쟁)**을 그대로 옮긴 게임이에요. 혼자 한 단계만 싸게 불러도 판매를 몽땅 가져가니, 한 번의 판만 놓고 보면 모두가 서로를 깎아 결국 1천 원까지 내려가는 것이 계산상의 균형이에요.' },
    { type: 'cards', items: [
      { title: '담합의 크기', body: '과일 둘 다 모두가 5천 원에 맞추면 라운드마다 1만 원, 네 라운드면 4만 원으로 가넷 1개 선에 닿아요. 반대로 판매자가 다섯인 과일에서 혼자 4천 원을 부르면 한 번에 2만 원이라, 5만 원(가넷 2개)을 넘기려면 어딘가에서 한 번은 깎아야 해요. 보상 기준 자체가 배신을 부추기는 구조예요.' },
      { title: '비밀이 배신을 가려 준다', body: '배신의 대가는 "누가 깎았는지 들키는 것"인데, 비밀은 그 과일의 결과 자체를 가려요. 게다가 남의 과일에도 쓸 수 있어서, 결과가 가려졌다는 것만으로는 그 과일의 판매자가 배신했다고 단정할 수 없어요.' },
      { title: '마지막 라운드의 유혹', body: '보복할 기회가 남지 않는 4라운드가 가장 위험해요. 거꾸로 계산하면 앞 라운드의 약속도 흔들려서, 담합이 버티려면 게임 밖의 신뢰(다음 회전의 동맹)가 필요해요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략은 없어요.** 다 같이 5천 원을 지키는 것이 집단 최선이고 혼자 깎는 것이 개인 최선이라, 결국 같은 과일을 파는 상대가 누구이고 그 사람이 나를 믿을 이유가 있는지가 승부를 정해요. 교체로 믿을 만한 사람이 모인 과일로 옮기는 것도 수비가 돼요.' },
  ],
  similar: [
    { name: '컨테이너 (Container)', players: '3–5명', alike: '각자 상품 가격을 정해 두고 다른 사람이 그 값에 사 가는, 가격 설정이 곧 승부인 경제 게임이에요.', differs: '컨테이너는 생산·운송·경매가 이어지는 긴 게임이고, 최저가 독식 규칙은 없어요.' },
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '돈을 얼마나 쓸지 몰래 저울질하고, 너무 아끼거나 너무 쓰면 벌을 받는 심리전이에요.', differs: '하이 소사이어티는 공개 경매이고, 가장 가난한 사람이 탈락해요.' },
  ],
}, {
  meta: {
    title: 'Fruit Stand rules — The Genius: Black Garnet round 1 main match, the lowest price sells everything',
    description: 'The rules of Fruit Stand (과일가게), round 1 main match of The Genius: Black Garnet: two fruits to sell, secret prices of ₩1,000–5,000, the lowest price selling the whole stock, the Secret and Change abilities, garnet rewards at ₩40,000 and ₩50,000, and why price agreements break.',
    keywords: ['Fruit Stand', 'The Genius Fruit Stand', 'The Genius Black Garnet', 'The Genius season 3 games', '과일가게'],
  },
  title: 'Fruit Stand — The Genius: Black Garnet, round 1 main match',
  name: 'Fruit Stand (과일가게)',
  lead: 'Everyone selling the same fruit names a price in secret; the cheapest seller sells all of it. If all keep prices high, everyone gains; whoever undercuts alone gains a lot.',
  summary: 'Sellers of the same fruit name prices in secret and the lowest price takes every sale: four rounds of price war.',
  setup: [
    { type: 'list', items: [
      '**Players**: all thirteen.',
      '**Fruit**: apples, grapes, melons, tangerines, strawberries and watermelons. Each player draws the right to sell two; apples, grapes, melons and tangerines have four sellers each, strawberries and watermelons five.',
      '**Abilities**: once per game, either **Secret** or **Change**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Prices', body: 'Each round, every player privately writes a price of ₩1,000–5,000 (in thousands) for each of their fruits in the dealer’s room.' },
      { title: 'Sale price', body: 'A fruit sells at the **lowest** price its sellers wrote. Whoever wrote it earns that price × the number of sellers of that fruit.' },
      { title: 'Shared lowest price', body: 'If several wrote the lowest price, they split the income equally, dropping fractions of a won.' },
      { title: 'Reveal', body: 'Each fruit’s price and income are shown after the round; players’ running totals stay hidden until the end.' },
      { title: 'Four rounds', body: 'The game ends after four rounds.' },
    ] },
    { type: 'table', head: ['Ability', 'Effect'], rows: [
      ['Secret', 'For that round, hides the price and income of one fruit. Nobody learns who used it, and it can target a fruit you do not sell.'],
      ['Change', 'Swaps one of your fruits for another. The swap is announced at once and must be made before prices are written.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Highest total income wins; lowest is the elimination candidate. A sole winner gets a second token of life to give away.',
      'If several tie for last, the winner(s) choose the candidate.',
      'Income of ₩40,000 or more earns 1 garnet; ₩50,000 or more earns 2.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If everyone ends level, ₩10,000 is taken from every total and an extra round is played.',
      'English Wikipedia restates the prices as $1–5; the structure is the same.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Fruit Stand is **price competition (Bertrand competition)** from economics. Undercutting by a single step captures every sale, so in any one round the calculated equilibrium is everyone undercutting each other down to ₩1,000.' },
    { type: 'cards', items: [
      { title: 'What the cartel is worth', body: 'If everyone holds both fruits at ₩5,000, each player makes ₩10,000 a round, ₩40,000 over four: exactly one garnet. Undercutting alone to ₩4,000 on a five-seller fruit makes ₩20,000 at once, so reaching ₩50,000 (two garnets) takes at least one betrayal. The reward thresholds themselves invite it.' },
      { title: 'Secret hides betrayal', body: 'The cost of undercutting is being caught, and Secret hides a fruit’s result entirely. Because it can be used on any fruit, a hidden result does not prove that fruit’s sellers cheated.' },
      { title: 'The last round', body: 'Round 4 leaves no chance of revenge, so it is the most dangerous; reasoning backwards shakes the earlier promises too. A cartel holds only on trust from outside the game, such as alliances for the rounds ahead.' },
    ], columns: 1 },
    { type: 'p', text: '**There is no dominant strategy.** Holding ₩5,000 together is best for the group and undercutting is best for the individual, so it comes down to who sells your fruits and whether they have a reason to trust you. Change can move you to a fruit with trustworthy sellers.' },
  ],
  similar: [
    { name: 'Container', players: '3–5', alike: 'Players set prices on their goods and others buy at those prices; setting the price is the game.', differs: 'Container is a long game of production, shipping and auctions, with no lowest-price-takes-all rule.' },
    { name: 'High Society', players: '3–5', alike: 'A secret weighing of how much money to spend, where hoarding and overspending are both punished.', differs: 'It uses open auctions, and the poorest player is knocked out.' },
  ],
});

export const blackAndWhite2 = g3Game({
  slug: 'black-and-white-2', kind: 'death', when: { ko: '1·3회전', en: 'Rounds 1 and 3' }, episode: { ko: '1·3화', en: 'Episodes 1 and 3' },
  eps: [1, 3], extra: [namuGame('흑과 백(더 지니어스)', 'Black and White (The Genius)')], note: 'two',
  related: ['blackWhite2', 'blackWhite', 'gradation'],
  site: { id: 'blackWhite2', name: { ko: '흑과 백 II', en: 'Black and White II' }, file: 'src/lib/blackWhite2.ts' },
}, {
  meta: {
    title: '흑과 백 II 규칙 — 더 지니어스 시즌3 블랙가넷 1·3회전 데스매치, 99포인트 9라운드 숫자 심리전',
    description: '더 지니어스: 블랙가넷 1·3회전 데스매치 흑과 백 II의 규칙을 정리했어요. 99포인트, 한 자릿수는 검정·두 자릿수는 흰색, 20포인트 단위 표시등, 5승 선취, 동점 시 33포인트 연장전, 그리고 PUZZLTHINK에서 바로 플레이.',
    keywords: ['흑과 백 2', '흑과백2', '흑과 백 II', '더 지니어스 흑과 백', '더 지니어스3 데스매치', '블랙가넷 데스매치', '흑과백 규칙'],
  },
  title: '흑과 백 II — 더 지니어스: 블랙가넷 1·3회전 데스매치',
  name: '흑과 백 II',
  lead: '99포인트를 아홉 판에 나눠 걸어요. 상대가 건 숫자는 보이지 않고, 한 자릿수인지 두 자릿수인지와 남은 포인트의 대략만 보여요.',
  summary: '99포인트를 9라운드에 나눠 몰래 걸고, 색(한 자릿수·두 자릿수)과 표시등만 보고 상대를 읽는 1:1 심리전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**포인트**: 각자 99포인트. 9라운드 동안 원하는 만큼 나눠 써요. 쓴 포인트는 사라져요.',
      '**공개 정보**: 상대가 낸 포인트가 한 자릿수(0–9)면 **검정**, 두 자릿수(10 이상)면 **흰색**으로 표시돼요. 남은 포인트는 다섯 칸 표시등(0–19 / 20–39 / 40–59 / 60–79 / 80–99)으로 보여요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선 플레이어 제출', body: '선 플레이어가 먼저 포인트를 내면 색이 공개돼요. 그 숫자로 표시등 칸이 내려가면 후 플레이어가 고르기 전에 바로 꺼져요.' },
      { title: '후 플레이어 제출', body: '후 플레이어는 그 색과 표시등을 보고 자기 포인트를 내요. 후 플레이어의 색도 공개돼요.' },
      { title: '판정', body: '더 많이 낸 쪽이 승점 1점을 얻고 다음 라운드의 선이 돼요. 같으면 승점 없이 직전 선이 그대로 선을 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '승점 5점을 먼저 얻으면 그 자리에서 이겨요. 아니면 9라운드가 끝났을 때 승점이 많은 쪽이 이겨요. 진 쪽이 탈락해요.',
      '1라운드 선은 데스매치에 지목당한 사람이 정해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '9라운드 뒤 승점이 같으면, 남은 포인트를 버리고 새로 33포인트씩 받아 3라운드를 더 해요.',
      '시즌 2의 「흑과 백」(0–8 숫자 타일을 한 장씩 내는 게임)과 이름만 이어질 뿐 방식이 달라요.',
      '이 시즌에는 1회전과 3회전 두 번 나왔고, 다른 정규 시즌에는 다시 쓰이지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '흑과 백 II의 원리는 게임 이론의 **블로토 대령 게임**이에요. 한정된 자원을 여러 전장에 나눠 배치하고, 각 전장에서는 더 많이 쓴 쪽이 이겨요. 핵심은 이길 판은 **아슬아슬하게** 이기고, 질 판은 **크게** 지게 만드는 거예요.' },
    { type: 'cards', items: [
      { title: '경계선 10', body: '색은 9와 10 사이를 갈라 줘요. 그래서 선이 검정을 냈을 때 후는 10을 내면 확실히 이기지만, 실제로 9를 냈다면 1포인트 차로 이긴 셈이고, 0을 냈다면 10포인트를 버린 셈이에요. 검정끼리 맞붙는 판은 숫자를 전혀 알 수 없는 순수한 눈치 싸움이 돼요.' },
      { title: '이긴 쪽이 선을 잡는 부담', body: '라운드를 이기면 다음 판에 먼저 내야 해서 정보가 불리해져요. 반대로 진 쪽은 상대의 색과 표시등 변화를 보고 내는 이점을 얻어요. 표시등이 꺼지는 순간 "20의 경계를 넘었다"는 정보가 새어 나가는 것도 계산에 넣어야 해요.' },
      { title: '포인트 차가 곧 승점 차', body: '상대가 4점이면 남은 판에서 상대가 한 번만 이기면 끝나요. 그래서 뒤진 쪽은 마지막까지 상대보다 포인트를 더 많이 남겨 두어야 해요. 대략 "승점 차 × 10포인트" 이상의 여유가 없으면 한 번의 올인을 막기 어려워요.' },
    ], columns: 1 },
    { type: 'p', text: '모든 수를 상대가 읽을 수 있다면 늘 깨지는 구조라 **우월 전략은 없고**, 이론적으로는 섞어 내는(혼합) 전략만 남아요. 실전에서는 초반에 적은 포인트로 승점을 챙겨 압박하는 쪽과, 포인트를 아껴 후반에 몰아 쓰는 쪽의 성향 싸움이 돼요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      '규칙 수치(99포인트, 9라운드, 5승 선취, 20포인트 표시등, 동점 시 33포인트 3라운드 연장)는 방송과 같아요.',
      'PUZZLTHINK에서는 AI(난이도 선택)나 친구와 온라인으로 해요. 첫 선은 방송처럼 지목당한 사람이 고르는 대신, 시작 전에 나·상대·무작위 중에서 골라요.',
      '서로 낸 정확한 숫자는 게임이 끝난 뒤 복기로 확인할 수 있어요.',
    ] },
  ],
  similar: [
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '한정된 돈 카드를 여러 경매에 나눠 쓰고, 한 번 쓴 카드는 돌아오지 않아요.', differs: '공개 경매이고, 끝에 가장 돈이 적은 사람은 점수와 상관없이 탈락해요.' },
    { name: '훌스 데어 가이어 (Hol’s der Geier, 영어판 Raj)', players: '2–6명', alike: '1–15 숫자 카드를 한 번씩만 쓰며 동시에 내 점수 카드를 따는, 자원 배분 심리전이에요.', differs: '모두가 동시에 공개하고, 같은 숫자는 서로 상쇄돼요.' },
  ],
}, {
  meta: {
    title: 'Black and White II rules — The Genius: Black Garnet death match, 99 points over nine rounds',
    description: 'The rules of Black and White II (흑과 백 II), death match of rounds 1 and 3 of The Genius: Black Garnet: 99 points, one-digit bids shown black and two-digit bids white, 20-point indicator lamps, first to five, a 33-point tiebreak, and a playable version on PUZZLTHINK.',
    keywords: ['Black and White II', 'The Genius Black and White', 'The Genius death match', 'The Genius Black Garnet', '흑과 백 2'],
  },
  title: 'Black and White II — The Genius: Black Garnet, death match of rounds 1 and 3',
  name: 'Black and White II (흑과 백 II)',
  lead: 'Ninety-nine points split over nine rounds. You never see your opponent’s number, only whether it had one digit or two and roughly how much they have left.',
  summary: 'Split 99 points over nine secret bids and read the opponent from colours (one or two digits) and indicator lamps.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two death-match players.',
      '**Points**: 99 each, spent freely over nine rounds; spent points are gone.',
      '**Public information**: a one-digit bid (0–9) shows **black**, two digits (10+) **white**. Remaining points show on five lamps (0–19 / 20–39 / 40–59 / 60–79 / 80–99).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Lead bid', body: 'The leader bids first and the colour is shown; if the bid drops them into a lower band, a lamp goes out before the other player decides.' },
      { title: 'Reply', body: 'The other player bids after seeing the colour and lamps; their colour is shown too.' },
      { title: 'Result', body: 'The higher bid scores 1 and leads the next round. A tie scores nothing and the same player leads again.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'First to 5 wins at once; otherwise the higher score after nine rounds wins. The loser is eliminated.',
      'The player who was named for the death match decides who leads round 1.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Level after nine rounds: remaining points are discarded and each gets 33 new points for three more rounds.',
      'Only the name links it to season 2’s Black and White (playing tiles 0–8 one at a time); the game is different.',
      'It was played twice this season (rounds 1 and 3) and not used again in the regular seasons.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Black and White II is the **Colonel Blotto game** of game theory: split a fixed resource over several battlefields, each won by whoever spends more there. The skill is winning **narrowly** and losing **heavily**.' },
    { type: 'cards', items: [
      { title: 'The line at 10', body: 'The colour splits 9 from 10. Against a black lead, 10 always wins, but that is a 1-point win if the lead was 9 and ten wasted points if it was 0. Black against black gives no number at all: pure reading.' },
      { title: 'Winning hands you the lead', body: 'The round winner must bid first next time, an information handicap; the loser gets to bid after seeing a colour and any lamp change. A lamp going out leaks that you crossed a 20-point line.' },
      { title: 'The point gap is the score gap', body: 'Once the opponent has 4, one more win ends it, so the trailing player must keep more points in reserve—roughly the score gap × 10—or one all-in bid cannot be stopped.' },
    ], columns: 1 },
    { type: 'p', text: 'Any fixed plan an opponent can read loses, so **there is no dominant strategy**; in theory only mixed play is left. In practice it becomes a clash between grabbing cheap early wins to apply pressure and saving points for a late surge.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'The numbers (99 points, nine rounds, first to five, 20-point lamps, a 33-point three-round tiebreak) match the broadcast.',
      'On PUZZLTHINK you play the AI (choose a level) or a friend online. Instead of the named player choosing, the first leader is set before the game: you, the opponent or random.',
      'The exact bids can be reviewed after the game.',
    ] },
  ],
  similar: [
    { name: 'High Society', players: '3–5', alike: 'Limited money cards are spread over several auctions and never come back.', differs: 'Auctions are open, and the poorest player at the end is out whatever their score.' },
    { name: 'Hol’s der Geier (Raj)', players: '2–6', alike: 'Number cards 1–15 are each used once to win point cards: a resource-splitting mind game.', differs: 'Everyone reveals at once, and equal numbers cancel out.' },
  ],
});

export const juryGame = g3Game({
  slug: 'jury-game', kind: 'main', when: round(2), episode: ep(2), eps: [2], note: 'two',
  related: ['russianRoulette', 'indianPoker', 'hiddenWord'],
}, {
  meta: {
    title: '배심원 규칙 — 더 지니어스 시즌3 블랙가넷 2회전 메인매치, 시민 팀과 범죄자 팀의 재판 게임',
    description: '더 지니어스: 블랙가넷 2회전 메인매치 배심원의 규칙을 정리했어요. 시민 7명·범죄자 5명, 정체를 아는 시민 리더, 배심원단 선정과 찬반 투표, 만장일치 유죄, 4라운드 예외, 상대 리더 맞히기 역전까지.',
    keywords: ['배심원 게임', '더 지니어스 배심원', '더 지니어스3 배심원', '블랙가넷 2회전', '더 지니어스 아발론', '지니어스 정체 숨기기'],
  },
  title: '배심원 — 더 지니어스: 블랙가넷 2회전 메인매치',
  name: '배심원',
  lead: '시민 팀은 유죄 판결 세 번을, 숨어 있는 범죄자 팀은 무죄 판결 세 번을 노려요. 유죄는 배심원 전원이 유죄를 골라야 나와요.',
  summary: '숨은 범죄자 팀과 시민 팀이 배심원단을 꾸리고, 만장일치 유죄냐 무죄냐로 다투는 정체 숨기기 팀전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 12명. 제비뽑기로 **시민 팀 7명**, **범죄자 팀 5명**이 돼요. 팀마다 리더가 한 명 있어요.',
      '**범죄자 팀**: 서로의 정체를 알지만, 누가 자기 팀 리더인지는 몰라요.',
      '**시민 팀**: 서로를 몰라요. 단 **시민 리더**는 범죄자 리더를 뺀 범죄자 4명을 알고 시작해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '배심원장', body: '라운드마다 제비뽑기 순서대로 한 명이 배심원장이 되어 배심원단을 고르고, 자기 자신을 넣을 수도 있어요. 인원은 1·2라운드 4명, 3·4라운드 5명, 5라운드 6명이에요.' },
      { title: '찬반 투표', body: '전원이 손을 들어 찬반을 정해요. 과반이 찬성하면 그 배심원단으로 재판하고, 반대가 많거나 동수면 해산하고 다음 배심원장이 다시 골라요.' },
      { title: '재판', body: '배심원은 한 명씩 유죄나 무죄를 골라요. 결과는 유죄·무죄 수만 공개되고, 누가 무엇을 골랐는지는 알려지지 않아요.' },
      { title: '판결', body: '배심원 **전원이 유죄**여야 유죄 판결이고, 한 명이라도 무죄면 무죄예요. 단 4라운드만은 무죄가 두 명 이상이어야 무죄가 돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '유죄 판결이 먼저 세 번 나오면 시민 팀, 무죄 판결이 먼저 세 번 나오면 범죄자 팀이 재판에서 이겨요.',
      '**역전**: 재판에서 진 팀의 리더가 상대 팀 리더를 맞히면 진 팀이 최종 승리해요. 못 맞히면 재판에서 이긴 팀이 그대로 이겨요.',
      '이긴 팀은 모두 생명의 징표와 가넷 2개를 받고, 진 팀 중 한 명을 탈락후보로 정해요. 탈락후보는 자기 팀원 중에서 데스매치 상대를 골라요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '한 팀이 세 번을 먼저 채우면 남은 재판은 하지 않아요.',
      '영어 위키백과의 요약도 같은 구조(시민·범죄자, 리더 맞히기 역전)를 전해요. 4라운드 예외 같은 세부 수치는 나무위키에만 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '배심원은 보드게임 「레지스탕스: 아발론」의 구조를 그대로 가져온 게임이에요. 정보를 가진 소수(시민 리더)가 그 정보를 써야 이기지만, 너무 티 나게 쓰면 마지막의 리더 맞히기로 모든 것을 잃어요.' },
    { type: 'cards', items: [
      { title: '범죄자 한 명이면 충분하다', body: '유죄는 만장일치라, 배심원단에 범죄자가 한 명만 섞여도 무죄를 만들 수 있어요. 그래서 시민 쪽의 과제는 "범죄자가 없는 배심원단"을 투표로 통과시키는 것이고, 범죄자 쪽의 과제는 배심원단에 끼어드는 거예요. 4라운드만은 범죄자가 둘 있어야 무죄라 공수가 잠시 뒤집혀요.' },
      { title: '투표의 산수', body: '12명 중 과반은 7명이라 범죄자 5명만으로는 배심원단을 막지도, 통과시키지도 못해요. 범죄자는 시민 두 명 이상의 표를 얻어야 하고, 그래서 시민들의 의심을 다른 시민에게 돌리는 말솜씨가 중요해요.' },
      { title: '숨어야 하는 시민 리더', body: '시민 리더는 범죄자 넷을 알지만, 범죄자 리더 한 명은 몰라요. 그 한 명은 시민 리더의 레이더 밖에 있으니 가장 믿음직한 시민처럼 행동할 수 있어요. 한편 시민 리더가 정확한 지목을 거듭하면 정체가 드러나 역전의 표적이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '역할에 따라 목표가 정반대라 **우월 전략은 없어요.** 다만 범죄자 리더가 누구인지 모른다는 비대칭 덕분에 범죄자 팀은 역전 카드(시민 리더 맞히기)를, 시민 팀은 범죄자 리더 찾기라는 마지막 카드를 각자 쥐고 있어요.' },
  ],
  similar: [
    { name: '레지스탕스: 아발론 (The Resistance: Avalon)', players: '5–10명', alike: '원정대 선정 투표와 비공개 성공·실패 카드, 정보를 아는 멀린과 마지막 암살 역전까지 뼈대가 같아요.', differs: '아발론은 원정 실패 카드 한 장만으로 실패이고, 역전은 악 진영만 할 수 있어요.' },
    { name: '시크릿 히틀러 (Secret Hitler)', players: '5–10명', alike: '숨은 소수 진영이 지명·투표·비공개 정책 선택으로 다수 진영을 흔들어요.', differs: '정책 카드 덱의 운이 크고, 특정 인물의 선출이 즉시 승패를 정해요.' },
  ],
}, {
  meta: {
    title: 'Jury Game rules — The Genius: Black Garnet round 2 main match, citizens against hidden criminals',
    description: 'The rules of the Jury Game (배심원), round 2 main match of The Genius: Black Garnet: seven citizens and five criminals, a citizen leader who knows four criminals, picking and approving juries, unanimous guilty verdicts, the round-4 exception, and the reversal by naming the other side’s leader.',
    keywords: ['Jury Game', 'The Genius Jury Game', 'The Genius Black Garnet', 'The Genius season 3', '배심원'],
  },
  title: 'Jury Game — The Genius: Black Garnet, round 2 main match',
  name: 'Jury Game (배심원)',
  lead: 'Citizens want three guilty verdicts, the hidden criminals three not-guilty ones. A guilty verdict needs every juror to vote guilty.',
  summary: 'Hidden criminals and citizens fight over who sits on the jury and whether its verdict is unanimous: a hidden-role team game.',
  setup: [
    { type: 'list', items: [
      '**Players**: twelve, drawn into **seven citizens** and **five criminals**, each side with a leader.',
      '**Criminals** know each other but not which of them is their leader.',
      '**Citizens** know nobody, except the **citizen leader**, who knows the four criminals other than the criminal leader.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Foreperson', body: 'Each round a foreperson, in a drawn order, picks the jury and may include themselves: four jurors in rounds 1–2, five in 3–4, six in round 5.' },
      { title: 'Approval vote', body: 'Everyone votes by show of hands. A majority approves the jury; a majority against or a tie dissolves it and the next foreperson picks again.' },
      { title: 'Trial', body: 'Jurors one by one choose guilty or not guilty. Only the counts are revealed, not who chose what.' },
      { title: 'Verdict', body: 'Guilty needs **every juror** to vote guilty; one not-guilty vote acquits. In round 4 only, it takes two not-guilty votes to acquit.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Three guilty verdicts win the trials for the citizens; three acquittals win them for the criminals.',
      '**Reversal**: if the losing side’s leader names the other side’s leader, the losing side wins instead; otherwise the trial winners win.',
      'Winners all get a token of life and 2 garnets and choose one loser as the elimination candidate, who picks a death-match opponent from their own team.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Once one side reaches three, no more trials are held.',
      'English Wikipedia’s summary gives the same structure (citizens, criminals, the leader-guess reversal); details such as the round-4 exception appear only in the fan wiki.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The Jury Game borrows the frame of the board game The Resistance: Avalon: an informed minority (the citizen leader) has to use what it knows to win, but using it too openly loses everything to the final leader guess.' },
    { type: 'cards', items: [
      { title: 'One criminal is enough', body: 'Guilty needs unanimity, so a single criminal on a jury can acquit. Citizens must get a criminal-free jury approved; criminals must get onto juries. In round 4 criminals need two jurors, so the balance briefly flips.' },
      { title: 'Vote arithmetic', body: 'A majority of twelve is seven, so five criminals can neither block nor pass a jury alone. They need at least two citizen votes, which makes steering suspicion onto other citizens the key skill.' },
      { title: 'A leader who must hide', body: 'The citizen leader knows four criminals but not their leader, who sits outside that knowledge and can act as the most trusted citizen. A citizen leader whose picks are too accurate gives themselves away and becomes the reversal target.' },
    ], columns: 1 },
    { type: 'p', text: 'The sides want opposite things, so **there is no dominant strategy**. The asymmetry over who leads the criminals gives the criminals a last card (naming the citizen leader) and the citizens one too (finding the criminal leader).' },
  ],
  similar: [
    { name: 'The Resistance: Avalon', players: '5–10', alike: 'Team proposals, approval votes, secret success/fail cards, an informed Merlin and a final assassination share the same skeleton.', differs: 'A single fail card sinks a quest, and only the evil side gets a reversal.' },
    { name: 'Secret Hitler', players: '5–10', alike: 'A hidden minority shakes the majority through nominations, votes and secret policy choices.', differs: 'The policy deck adds much more luck, and electing one character can end the game at once.' },
  ],
});

export const bettingRps = g3Game({
  slug: 'betting-rock-paper-scissors', kind: 'death', when: { ko: '2·6회전 데스매치, 결승 3국', en: 'Death match of rounds 2 and 6; final, game 3' },
  episode: { ko: '2·6·12화', en: 'Episodes 2, 6 and 12' }, eps: [2, 6, 12], note: 'two',
  related: ['indianPoker', 'twoSidedPoker', 'russianRoulette'],
}, {
  meta: {
    title: '베팅 가위바위보 규칙 — 더 지니어스 시즌3 블랙가넷 2·6회전 데스매치·결승, 승부와 베팅',
    description: '더 지니어스: 블랙가넷 2·6회전 데스매치이자 결승 마지막 게임인 베팅 가위바위보의 규칙을 정리했어요. 관전자의 미리 정한 표식, 승부와 베팅의 교대, 라운드별 칩, 무승부 때 베팅 반환, 세 번의 규칙 차이와 결승 아이템까지.',
    keywords: ['베팅 가위바위보', '더 지니어스 가위바위보', '더 지니어스3 결승', '블랙가넷 데스매치', '블랙가넷 결승전', '지니어스 베팅 가위바위보 규칙'],
  },
  title: '베팅 가위바위보 — 더 지니어스: 블랙가넷 2·6회전 데스매치, 결승 3국',
  name: '베팅 가위바위보',
  lead: '한 사람은 관전자가 미리 정해 둔 가위바위보와 승부하고, 다른 한 사람은 그 결과에 칩을 걸어요. 무승부가 나면 건 칩은 그대로 돌아와요.',
  summary: '관전자가 미리 낸 표식과 가위바위보로 겨루는 쪽과 그 결과에 거는 쪽이 번갈아 바뀌는 칩 승부. 이 시즌에만 세 번 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 두 명이 겨루고, 나머지 플레이어가 관전자로 참여해요.',
      '**관전자**: 제비뽑기로 자기가 나설 라운드를 정하고, 가위·바위·보 중 하나를 골라 딜러에게 미리 내요.',
      '**칩**: 두 사람 모두 1개로 시작해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선의 선택', body: '라운드마다 선 플레이어가 **승부**와 **베팅** 중 하나를 고르면, 상대는 자동으로 나머지를 맡아요. 선은 라운드마다 번갈아 바뀌고, 1라운드 선은 지목당한 사람이에요.' },
      { title: '승부', body: '승부를 맡은 사람은 그 라운드 관전자가 미리 낸 표식을 상대로 자기 표식을 뒤집어 내요.' },
      { title: '베팅', body: '베팅을 맡은 사람은 결과가 공개되기 전, 상대의 승부가 이길지 질지에 칩을 1개 이상 걸어요. 칩이 없으면 걸지 않아도 돼요.' },
      { title: '정산', body: '승부에서 이기면 그 라운드에 걸린 칩을 받아요. 베팅을 맞히면 건 칩의 2배를 받고, 틀리면 건 칩을 잃어요. **무승부면 건 칩을 그대로 돌려받아요.**' },
    ] },
    { type: 'table', head: ['', '2회전', '6회전', '결승 3국'], rows: [
      ['라운드', '10', '12', '14'],
      ['승부 승리 칩', '1–4R 1개, 5–8R 2개, 9–10R 3개', '세 라운드마다 1개씩 늘어 1–4개', '세 라운드마다 1개씩 늘어 1–5개 (13–14R 5개)'],
      ['미리 공개된 표식', '없음', '2·3·6·7·10·11R은 표식이 공개된 가상의 상대', '2R 가위, 8R 바위, 13R 보로 정해진 가상의 상대'],
      ['관전자', '나머지 10명', '나머지 6명', '탈락자 11명. 표식은 자기가 아이템을 준 결승 진출자에게만 자동으로 전해져요.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '마지막 라운드가 끝났을 때 칩이 적은 사람이 져요. 데스매치에서는 진 사람이 탈락하고, 결승에서는 세 게임 중 하나를 내줘요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '데스매치에서 칩이 같으면, 관전자 표식을 모두 공개한 채로 처음부터 다시 해요.',
      '결승에서 칩이 같으면 표식이 공개된 가상의 상대와 2라운드를 더 해요.',
      '결승 아이템: **드로우 베팅**(무승부에 걸어 맞히면 2배), **표식 미리 뒤집기**(그 라운드 상대 표식을 미리 공개, 두 사람 모두 봄), **칩 1개 추가**(시작할 때 1개 더). 결승에서는 이기는 쪽과 지는 쪽에 나눠 걸 수도 있어요.',
      '영어 위키백과는 베팅 칩이 라운드마다 고정이라고 요약해요. 이 페이지는 칩을 1개 이상 자유롭게 건다는 나무위키의 규칙 설명을 따랐어요.',
      '이후 「더 지니어스: 그랜드 파이널」에도 다시 나왔어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '가위바위보 자체는 운이지만, 이 게임에서는 관전자의 표식이 **미리 정해져 있어요.** 관전자에게서 표식을 알아낸 사람에게는 승부가 운이 아니라 선택이 돼요. 이기기, 지기, 비기기 중 무엇을 고를지를 내가 정할 수 있거든요.' },
    { type: 'cards', items: [
      { title: '무승부라는 세 번째 답', body: '베팅하는 쪽은 이김과 짐 중 하나에만 걸 수 있고, 무승부면 칩이 그대로 돌아와요. 그래서 표식을 아는 승부자가 앞서 있다면, 비김을 골라 상대의 큰 베팅을 통째로 무효로 만들 수 있어요. 승부자는 그 라운드 칩을 못 받지만 역전의 기회를 지워요.' },
      { title: '정보가 곧 칩', body: '관전자는 두 사람 모두에게, 혹은 한쪽에만 표식을 알려 줄 수 있어요. 두 사람 다 표식을 안다면 승부는 "승부자가 무엇을 고를까"를 베팅자가 읽는 심리전이 돼요. 결승에서는 표식이 아이템을 준 쪽에만 전해져, 누가 어느 라운드를 아는지가 비대칭이 돼요.' },
      { title: '배율의 비대칭', body: '승부의 보상은 라운드별로 고정이지만, 베팅은 가진 칩에 비례해 커져요. 뒤진 쪽에게는 후반의 올인 베팅이 유일한 역전 수단이고, 앞선 쪽은 그 라운드를 비김으로 지우는 것이 최선의 수비예요. 그래서 누가 어느 라운드에 선인지(승부와 베팅 선택권)도 계산에 들어가요.' },
    ], columns: 1 },
    { type: 'p', text: '모든 표식을 둘 다 안다면 남는 것은 승부자의 선택(이김·짐·비김)을 읽는 3지선다라 **우월 전략은 없어요.** 다만 앞선 쪽이 무승부를 적극적으로 쓰면 뒤진 쪽의 역전 여지가 크게 줄어드는 구조예요.' },
  ],
  similar: [
    { name: '카멜 업 (Camel Up)', players: '3–8명', alike: '직접 경주하는 대신, 결과를 예측해 거는 쪽에 큰 보상이 걸려 있어요.', differs: '결과를 주사위가 정해, 누군가 결과를 고르는 심리전은 없어요.' },
    { name: '라이어스 다이스 (Liar’s Dice / Perudo)', players: '2–6명', alike: '상대가 무엇을 알고 무엇을 할지 읽어 거는 베팅 심리전이에요.', differs: '모두가 자기 주사위만 보고 입찰을 올려 가는 방식이에요.' },
  ],
}, {
  meta: {
    title: 'Betting Rock Paper Scissors rules — The Genius: Black Garnet death match and final',
    description: 'The rules of Betting Rock Paper Scissors (베팅 가위바위보), death match of rounds 2 and 6 and last game of the final of The Genius: Black Garnet: spectators’ pre-set signs, taking turns to play or bet, chips per round, bets returned on a draw, the three rule versions and the final’s items.',
    keywords: ['Betting Rock Paper Scissors', 'The Genius rock paper scissors', 'The Genius Black Garnet final', 'The Genius death match', '베팅 가위바위보'],
  },
  title: 'Betting Rock Paper Scissors — The Genius: Black Garnet, death match of rounds 2 and 6, final game 3',
  name: 'Betting Rock Paper Scissors (베팅 가위바위보)',
  lead: 'One player plays rock-paper-scissors against a sign a spectator chose in advance; the other bets on the result. On a draw, the bet comes back untouched.',
  summary: 'Two players take turns playing against spectators’ pre-set signs and betting on each other’s result; used three times this season.',
  setup: [
    { type: 'list', items: [
      '**Players**: two compete; the others take part as spectators.',
      '**Spectators** draw the round they will stand in and hand the dealer rock, paper or scissors in advance.',
      '**Chips**: both start with one.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'The leader chooses', body: 'Each round the leader picks **play** or **bet**, and the other player takes the remaining role. The lead alternates; the named player leads round 1.' },
      { title: 'Play', body: 'The player plays a face-down sign against that round’s pre-set spectator sign.' },
      { title: 'Bet', body: 'Before the reveal, the bettor stakes at least one chip on the player winning or losing (no chips, no bet).' },
      { title: 'Payout', body: 'A winning player takes that round’s chips. A right bet pays double, a wrong one is lost, and **on a draw the bet is returned**.' },
    ] },
    { type: 'table', head: ['', 'Round 2', 'Round 6', 'Final, game 3'], rows: [
      ['Rounds', '10', '12', '14'],
      ['Chips for winning a play', '1 in R1–4, 2 in R5–8, 3 in R9–10', 'Up one every three rounds, 1–4', 'Up one every three rounds, 1–5 (5 in R13–14)'],
      ['Known signs', 'None', 'R2, 3, 6, 7, 10, 11 against a virtual player with a public sign', 'A virtual player with set signs: scissors R2, rock R8, paper R13'],
      ['Spectators', 'The other ten', 'The other six', 'The eleven eliminated players; each sign goes automatically only to the finalist that guest gave an item to.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After the last round, the player with fewer chips loses: eliminated in a death match, one game down in the final.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A death-match tie is replayed from the start with every spectator sign revealed.',
      'A tie in the final adds two rounds against a virtual player whose signs are public.',
      'Final items: **Draw bet** (bet on a draw for double), **Flip early** (reveal that round’s spectator sign to both finalists), **Extra chip** (start with one more). In the final a stake may be split between win and loss.',
      'English Wikipedia summarises the bets as fixed per round; this page follows the fan wiki’s transcription, in which any stake of one chip or more is allowed.',
      'It returned later in The Genius: Grand Final.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Rock-paper-scissors is luck, but here the spectators’ signs are **fixed in advance**. For a player who has learned the sign, playing is a choice, not a gamble: they decide whether to win, lose or draw.' },
    { type: 'cards', items: [
      { title: 'Draw, the third answer', body: 'The bettor can back only a win or a loss, and a draw returns the stake. A leading player who knows the sign can therefore draw on purpose and void a big bet entirely, giving up that round’s chips to erase a comeback.' },
      { title: 'Information is chips', body: 'Spectators can tell both players, one, or none. If both know the sign, the bettor is reading which result the player will choose. In the final, signs go only to the finalist a guest supported, so who knows which round is lopsided.' },
      { title: 'Uneven payouts', body: 'Play rewards are fixed by round, but bets scale with your stack. A late all-in bet is the trailing player’s only comeback, and drawing that round is the leader’s best defence, so who leads which round (and so chooses the role) matters.' },
    ], columns: 1 },
    { type: 'p', text: 'With every sign known to both, what remains is a three-way read of the player’s choice, so **there is no dominant strategy**. Still, a leader willing to draw shrinks the trailing player’s room to come back sharply.' },
  ],
  similar: [
    { name: 'Camel Up', players: '3–8', alike: 'Players do not race themselves; the big rewards go to predicting and betting on the result.', differs: 'Dice decide the outcome, so nobody chooses the result.' },
    { name: 'Liar’s Dice (Perudo)', players: '2–6', alike: 'A betting mind game about what the others know and will do.', differs: 'Everyone sees only their own dice and raises bids in turn.' },
  ],
});

export const middleRace = g3Game({
  slug: 'middle-race', kind: 'main', when: round(3), episode: ep(3), eps: [3], note: 'two',
  related: ['hitStay', 'pointOmok', 'wallgo2'],
}, {
  meta: {
    title: '중간 달리기 규칙 — 더 지니어스 시즌3 블랙가넷 3회전 메인매치, 1등과 꼴찌가 지는 레이스',
    description: '더 지니어스: 블랙가넷 3회전 메인매치 중간 달리기의 규칙을 정리했어요. 30칸 트랙, 1–4 이동카드, 그래비티부터 퀵까지 11개 캐릭터 능력, 투표로 정하는 선택 순서, 1등과 꼴찌가 데스매치로 가는 이유까지.',
    keywords: ['중간 달리기', '더 지니어스 중간 달리기', '더 지니어스3 중간달리기', '블랙가넷 3회전', '중간달리기 캐릭터', '지니어스 레이스 게임'],
  },
  title: '중간 달리기 — 더 지니어스: 블랙가넷 3회전 메인매치',
  name: '중간 달리기',
  lead: '1등도 꼴찌도 지는 레이스예요. 11명이 저마다 다른 능력을 가진 캐릭터로 30칸을 달려, 한가운데로 들어와야 살아남아요.',
  summary: '능력이 다른 11개 캐릭터로 30칸을 달려, 1등과 꼴찌만 데스매치로 가는 역설적인 레이스.',
  setup: [
    { type: 'list', items: [
      '**인원**: 11명. 캐릭터 11개(능력과 이동 순서가 정해져 있어요), 30칸 트랙.',
      '**선택 순서**: 투표로 **11번째(마지막)로 캐릭터를 받을 사람**을 정해요. 그 사람이 자기 바로 앞 순서를 지목하고, 그 사람이 또 앞 순서를 지목하는 식으로 거꾸로 정해요. 그다음 1번부터 원하는 캐릭터를 골라요.',
      '**이동카드**: 1·2·3·4 네 장. 한 장 낼 때마다 그만큼 움직이고, 네 장을 다 쓰면 다시 네 장을 받아요.',
    ] },
    { type: 'table', head: ['순서', '캐릭터', '능력 (요약)'], rows: [
      ['1', '그래비티', '이동을 포기하고 카드 한 장을 공개해 버리면, 한 명을 내 바로 앞(그가 앞에 있을 때)이나 바로 뒤(뒤에 있을 때)로 끌어와요.'],
      ['2', '리셋', '내 말이 뒤로 밀릴 때마다 다른 한 명의 이동카드를 처음 네 장으로 되돌려요.'],
      ['3', '푸시', '다른 말과 같은 칸이 되면 그 말을 한 칸 앞이나 뒤로 밀어내요.'],
      ['4', '딜리트', '남의 능력으로 내가 움직이면, 한 명의 카드를 혼자 보고 한 장만 남기고 없애요.'],
      ['5', '위드', '마지막 한 장을 쓸 때 한 명을 지목해 같은 칸수만큼 같이 움직여요.'],
      ['6', '유니온', '내 바로 앞 칸에 있는 말을 모두 내 칸으로 끌어와요(자동).'],
      ['7', '원', '누군가 1을 내면 그보다 먼저 한 칸 앞이나 뒤로 움직여요.'],
      ['8', '미러', '남의 능력으로 내가 움직이면, 한 명을 같은 칸수만큼 반대 방향으로 보내요.'],
      ['9', '점프', '내 카드로 움직일 때 다른 말이 있는 칸을 건너뛰어요. 0–4 다섯 장을 쓰고, 두 장 남았을 때도 리셋할 수 있어요.'],
      ['10', '사일런스', '내 차례에 한 명을 지목해, 다음 내 차례까지 그 능력을 꺼요.'],
      ['11', '퀵', '모든 카드를 두 배로 써요. 단 네 장 중 앞으로 가는 데는 최대 두 장만 쓰고, 나머지는 뒤로 가요.'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '한 턴', body: '1번 그래비티부터 번호 순서대로 이동카드를 내고 움직여요. 카드를 다 썼으면 리셋해요.' },
      { title: '능력 처리', body: '한 능력으로 여러 말이 움직이면 번호가 빠른 캐릭터부터 처리하고, 그 과정에서 생긴 능력도 처리한 뒤 다음으로 넘어가요.' },
      { title: '골인', body: '결승선을 지나면 그 캐릭터의 능력은 사라지고, 더는 지목 대상이 아니에요. 모두 들어오면 끝나요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**1등과 꼴찌**는 자동으로 데스매치에 가요(이 회전은 지목이 없어요).',
      '2등부터 10등까지는 가넷 1개씩, 그중 **2등과 10등**은 블랙가넷 1개를 더 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '남을 지목하는 능력은 같은 사람에게 연달아 쓸 수 없어요.',
      '푸시와 유니온은 출발선에서는 발동하지 않아요. 둘의 조건이 동시에 맞으면 푸시가 먼저예요.',
      '위드로 함께 골인하면 움직이기 전에 결승선에 더 가까웠던 쪽, 같은 칸이었다면 번호가 빠른 쪽이 먼저 들어온 것으로 쳐요.',
      '사일런스에 막힌 퀵은 앞으로만 가야 하고, 그때 쓴 카드도 "앞으로 쓴 카드"로 세요.',
      '9회전에 캐릭터를 바꾼 두 번째 중간 달리기가 다시 나왔어요(따로 정리했어요).',
    ] },
  ],
  analysis: [
    { type: 'p', text: '중간 달리기는 "앞서는 것"이 목표가 아닌 레이스예요. 아홉 명이 안전하고 두 명만 지는 구조라, 결국은 **누구를 양 끝으로 몰지**를 정하는 다수결 게임에 가까워요.' },
    { type: 'cards', items: [
      { title: '카드는 셀 수 있다', body: '이동카드는 1–4 네 장이 한 묶음이라, 남이 낸 카드를 기억하면 남은 카드도 알 수 있어요. 네 장을 한 바퀴 쓰면 정확히 10칸이고 30칸은 세 바퀴라, 후반으로 갈수록 각자 어디까지 갈 수 있는지가 계산돼요. 리셋과 딜리트는 바로 이 계산을 깨는 능력이에요.' },
      { title: '수동 능력은 표적이 된다', body: '유니온·푸시·원처럼 남의 움직임에 반응하는 능력은 혼자서는 쓸모가 적지만, 남들이 그 칸으로 나를 몰아넣으면 나를 끝으로 보내는 장치가 돼요. 반대로 그래비티·사일런스처럼 직접 지목하는 능력은 연합의 무기가 돼요.' },
      { title: '투표가 먼저 승부를 정한다', body: '마지막으로 캐릭터를 받는 사람은 남은 하나를 받아야 하고, 그 순서를 투표로 정해요. 레이스가 시작되기 전부터 다수가 누구를 견제하는지가 드러나요.' },
    ], columns: 1 },
    { type: 'p', text: '캐릭터 간 상성이 얽혀 있어 **단독 우월 전략은 없어요.** 다만 2등과 10등에 블랙가넷이 걸려 있어 "가장 끝에 가까운 안전한 자리"를 노리는 사람과, 그 사람을 한 칸만 더 밀어 끝으로 보내려는 사람이 늘 부딪혀요.' },
  ],
  similar: [
    { name: '매지컬 애슬릿 (Magical Athlete)', players: '2–6명', alike: '능력이 서로 다른 캐릭터를 골라 달리고, 능력끼리 연쇄로 터지는 레이스예요.', differs: '주사위로 움직이고, 먼저 들어오는 것이 목표예요.' },
    { name: '다운포스 (Downforce)', players: '2–6명', alike: '내 카드로 남의 차까지 움직이며, 순위와 내기를 함께 노려요.', differs: '이동은 공용 카드로 하고, 목표는 내가 건 차가 잘 들어오는 거예요.' },
  ],
}, {
  meta: {
    title: 'Middle Race rules — The Genius: Black Garnet round 3 main match, a race where first and last lose',
    description: 'The rules of Middle Race (중간 달리기), round 3 main match of The Genius: Black Garnet: a 30-space track, move cards 1–4, the eleven characters from Gravity to Quick, a voted pick order, and why both first and last go to the death match.',
    keywords: ['Middle Race', 'The Genius Middle Race', 'The Genius Black Garnet', 'The Genius season 3 games', '중간 달리기'],
  },
  title: 'Middle Race — The Genius: Black Garnet, round 3 main match',
  name: 'Middle Race (중간 달리기)',
  lead: 'A race where first and last both lose. Eleven players run thirty spaces with characters that each have a different power, and only finishing in the middle is safe.',
  summary: 'Eleven characters with different powers race thirty spaces; only first and last go to the death match.',
  setup: [
    { type: 'list', items: [
      '**Players**: eleven, with eleven characters (each with a power and a fixed move order) and a 30-space track.',
      '**Pick order**: a vote chooses who gets a character **last (11th)**; that player names the one before them, and so on backwards. Then players pick from first to last.',
      '**Move cards**: 1, 2, 3 and 4. Each card played moves that far; after all four are used you get four again.',
    ] },
    { type: 'table', head: ['Order', 'Character', 'Power (summary)'], rows: [
      ['1', 'Gravity', 'Gives up a move and discards a card face up to pull one player to the space just ahead of (if they lead) or just behind (if they trail) Gravity.'],
      ['2', 'Reset', 'Whenever Reset is moved backwards, it resets another player’s cards to the full four.'],
      ['3', 'Push', 'When another piece shares its space, pushes it one space forward or back.'],
      ['4', 'Delete', 'When moved by someone’s power, privately looks at one player’s cards and leaves them only one.'],
      ['5', 'With', 'When playing its last card, takes one named player along the same distance.'],
      ['6', 'Union', 'Pulls every piece on the space just ahead onto its own space (automatic).'],
      ['7', 'One', 'Whenever someone plays a 1, moves one space forward or back first.'],
      ['8', 'Mirror', 'When moved by someone’s power, sends a named player the same distance the opposite way.'],
      ['9', 'Jump', 'Skips occupied spaces when moving by its own cards; uses five cards (0–4) and may reset with two left.'],
      ['10', 'Silence', 'On its turn names a player whose power is off until Silence’s next turn.'],
      ['11', 'Quick', 'Doubles every card, but at most two of the four may move forward; the rest move it back.'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'A turn', body: 'From Gravity (1) in number order, each plays a card and moves, resetting when out of cards.' },
      { title: 'Powers', body: 'If one power moves several pieces, the lowest-numbered moves first, and any power that triggers is resolved before continuing.' },
      { title: 'Finishing', body: 'Crossing the line removes that character’s power and makes it untargetable. The game ends when all have finished.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**First and last** go straight to the death match (no one is named this round).',
      'Places 2–10 earn 1 garnet each, and **2nd and 10th** also earn a black garnet.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A targeting power cannot hit the same player twice in a row.',
      'Push and Union do not work on the start line; if both trigger, Push goes first.',
      'Pieces finishing together through With count in order of who was closer to the line before moving, then by lower number.',
      'A silenced Quick must move forward, and that card counts as one of its forward cards.',
      'A second Middle Race with changed characters was played in round 9 (it has its own page).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Middle Race is a race where leading is not the goal. Nine are safe and two lose, so it is really a **majority game over whom to drive to the two ends**.' },
    { type: 'cards', items: [
      { title: 'Cards can be counted', body: 'Each set of cards is 1–4, so remembering what someone played tells you what they have left. One full cycle is exactly ten spaces and the track is three cycles, so late in the race everyone’s reach can be calculated. Reset and Delete exist to break that calculation.' },
      { title: 'Passive powers become targets', body: 'Reactive powers such as Union, Push and One do little alone, but if others herd you onto the right space they become the mechanism that sends you to an end. Targeting powers like Gravity and Silence are the alliance’s weapons.' },
      { title: 'The vote decides first', body: 'The last picker must take the leftover character, and that order is voted. Before the race starts, the majority’s target is already visible.' },
    ], columns: 1 },
    { type: 'p', text: 'The characters counter each other in tangled ways, so **no single strategy dominates**. With black garnets on 2nd and 10th, players aiming for the safe seat nearest an end constantly clash with those trying to push them one step further.' },
  ],
  similar: [
    { name: 'Magical Athlete', players: '2–6', alike: 'Pick characters with different powers and race while powers set each other off.', differs: 'Movement is by die, and finishing first is the goal.' },
    { name: 'Downforce', players: '2–6', alike: 'Your cards move other players’ cars too, and you play for placings and bets together.', differs: 'Cars are moved with shared cards, and the aim is for the car you backed to finish well.' },
  ],
});
