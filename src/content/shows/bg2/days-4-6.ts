// 피의 게임2, days 4–6: 넘버 체인지, 시크릿 다이스, 수식 로드, 미스터리 넘버, 리얼 타임, 미로 코드.
import { bg2Game, day } from './shared';

export const numberChange = bg2Game('number-change', 'money', day('4'), ['4'], ['blackWhite', 'blackWhite2', 'hitStay'], {
  meta: {
    title: '넘버 체인지 규칙 — 피의 게임2 4일차 머니 챌린지, 숫자 블록을 내고 큰 쪽을 넘겨주는 팀전',
    description: '피의 게임2 4일차 머니 챌린지 넘버 체인지의 규칙을 정리했어요. 저택 팀과 야생 팀의 1:1 대결, 1–7 숫자 블록 두 세트, 두 개를 동시에 내 합이 큰 쪽이 1점, 큰 블록은 상대와 교환, 히든 찬스, 12라운드와 7점 선승까지.',
    keywords: ['넘버 체인지', '피의 게임2 넘버 체인지', '피의게임2 4일차', '피의게임2 팀전', '피의게임2'],
  },
  title: '넘버 체인지 — 피의 게임2 4일차 머니 챌린지',
  name: '넘버 체인지',
  lead: '숫자 블록 두 개를 동시에 내서 합이 큰 쪽이 이겨요. 그런데 낸 블록 중 큰 것은 상대 팀에게 넘어가요.',
  summary: '두 블록의 합으로 이기되 큰 블록을 상대에게 넘겨주는 저택 팀 대 야생 팀의 12라운드 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 저택 내부 팀 대 저택 외부(야생) 팀. 모든 플레이어가 한 번씩 1:1로 나서고, 인원이 적은 팀은 같은 사람이 여러 번 나갈 수 있어요.',
      '**블록**: 팀마다 1–7 숫자 블록 두 세트(14개).',
      '**격리**: 대결에 나선 사람은 팀과 떨어져 의사소통할 수 없어요. 대결마다 승부가 두 번이에요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '제출', body: '두 사람이 블록 두 개를 동시에 내고 공개해요.' },
      { title: '판정', body: '합이 큰 쪽 팀이 1점을 얻어요.' },
      { title: '교환과 회수', body: '각자 낸 두 블록 중 **큰 숫자 블록은 상대 팀 블록과 교환**하고, 작은 블록은 딜러가 가져가요.' },
      { title: '히든 찬스', body: '팀마다 한 번, 그 승부에서 자기 블록과 합계를 비공개로 할 수 있어요. 승패만 공개되고, 상대는 자기가 낸 블록 중 하나를 무작위로 골라 교환해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '12라운드 뒤 점수가 높은 팀이 이기고, **7점에 먼저 닿으면 즉시** 이겨요. 동점이면 남은 블록으로 연장해요.',
      '이긴 팀은 다음 챌린지까지 저택에서, 진 팀은 야생에서 지내요. 진 팀은 투표로 탈락후보 1명을 정해, 지하감옥 수감자와 데스매치를 치르게 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '블록은 팀 공용이라, 앞사람이 쓰고 받은 블록이 다음 사람의 재료가 돼요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '넘버 체인지는 **이길수록 약해지는** 구조예요. 큰 블록을 내서 이기면 그 블록이 상대에게 가고, 작은 블록은 사라져요.' },
    { type: 'cards', items: [
      { title: '교환의 계산', body: '내 7과 상대의 3이 맞바뀌면 이번 판은 이겼지만 다음 판의 재료는 상대가 더 좋아져요. 반대로 작은 합으로 지는 판은 큰 블록을 지키는 투자가 돼요. 그래서 "어느 판을 버릴지"가 이 게임의 핵심 결정이에요. 7점 선승이므로 12판 중 7판만 이기면 돼요.' },
      { title: '격리된 개인의 판단', body: '대결에 나선 사람은 팀과 상의할 수 없어서, 남은 블록 구성을 보고 스스로 판단해야 해요. 미리 팀 전체의 순서와 버릴 판을 정해 두지 않으면 개인마다 다른 판단이 나와요.' },
      { title: '히든 찬스의 정보 봉쇄', body: '이 규칙의 힘은 블록 정보를 숨기는 데 있어요. 상대는 무엇이 넘어오고 무엇이 사라졌는지 알 수 없어, 남은 블록 추적이 끊겨요. 교환도 무작위라 상대가 큰 블록을 지키려던 계획도 흔들려요.' },
    ], columns: 1 },
    { type: 'p', text: '양 팀이 같은 블록으로 시작해 **우월 전략은 없어요.** 상대의 남은 블록을 끝까지 세는 팀, 그리고 버릴 판에 작은 블록을 정확히 쓰는 팀이 유리해요.' },
  ],
  similar: [
    { name: '하겐 (Hol’s der Geier)', players: '2–5명', alike: '숫자 카드를 동시에 내 큰 쪽이 이기고, 한 번 쓴 카드는 다시 못 쓰는 자원 관리가 핵심이에요.', differs: '하겐은 카드가 상대에게 넘어가지 않고, 점수 카드의 값이 판마다 달라요.' },
    { name: '쇼텐 토텐 (Schotten Totten)', players: '2명', alike: '숫자 조합의 크기로 겨루며, 어느 승부를 버리고 어느 승부에 힘을 줄지 정해요.', differs: '쇼텐 토텐은 아홉 개의 돌 앞에 세 장씩 패를 만들고, 교환이 없어요.' },
  ],
}, {
  meta: {
    title: 'Number Change rules — The Bloody Game 2, day 4 money challenge',
    description: 'The rules of Number Change (넘버 체인지) from The Bloody Game 2: mansion team against the wild team in one-on-one bouts, two sets of 1–7 blocks, two blocks played at once with the higher sum scoring, the larger block swapped to the rivals, the hidden chance, twelve rounds and first to seven.',
    keywords: ['Number Change', 'Bloody Game 2 day 4', '피의 게임2 넘버 체인지'],
  },
  title: 'Number Change — The Bloody Game 2, day 4 money challenge',
  name: 'Number Change (넘버 체인지)',
  lead: 'Play two number blocks at once and the higher sum wins — but the larger block you played goes to the other team.',
  summary: 'A twelve-round team match where you win with block sums but hand your bigger block to the rivals.',
  setup: [
    { type: 'list', items: [
      '**Teams**: inside the mansion against outside (the wild). Everyone plays one bout; the smaller team may send players more than once.',
      '**Blocks**: two sets of 1–7 per team (fourteen).',
      '**Isolation**: players in a bout cannot talk to their team; each bout is two contests.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Play', body: 'Both put down two blocks at once and reveal.' },
      { title: 'Score', body: 'The higher sum scores 1 point for its team.' },
      { title: 'Swap', body: 'Each side’s **larger block goes to the other team**; the smaller is taken by the dealer.' },
      { title: 'Hidden chance', body: 'Once per game a team can keep its blocks and sum secret for one contest; only the result is shown, and the rival swaps one of their blocks chosen at random.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After twelve rounds the higher score wins; **reaching 7 wins at once**. Ties go to extra rounds with the remaining blocks.',
      'Winners live in the mansion until the next challenge, losers in the wild; the losers vote one candidate to face the prisoner in the death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Blocks are shared by the team, so what one player uses and receives is the next player’s material.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Number Change **weakens you as you win**: a big block that wins goes to the rivals, and your small one disappears.' },
    { type: 'cards', items: [
      { title: 'The swap arithmetic', body: 'Win with a 7 against a 3 and the rivals now hold the 7. Losing cheaply preserves big blocks, so choosing which contests to throw is the central decision; only seven of twelve are needed.' },
      { title: 'Isolated judgement', body: 'Players in a bout cannot consult, so without an agreed team plan of which contests to throw, individuals judge differently.' },
      { title: 'The hidden chance blinds trackers', body: 'Its real power is hiding information: the rivals no longer know what came over and what vanished, and the random swap disrupts any plan to keep big blocks.' },
    ], columns: 1 },
    { type: 'p', text: 'Both teams start equal, so **there is no dominant strategy**; the team that tracks the rivals’ blocks to the end and throws contests with exactly the right small blocks has the edge.' },
  ],
  similar: [
    { name: 'Raj (Hol’s der Geier)', players: '2–5', alike: 'Simultaneous number cards, higher wins, each card used once.', differs: 'Cards never pass to opponents and prize values vary.' },
    { name: 'Schotten Totten', players: '2', alike: 'Compete with number combinations and choose which contests to concede.', differs: 'You build three-card hands at nine stones, with no swapping.' },
  ],
});

export const secretDice = bg2Game('secret-dice', 'death', { ko: '4·9일차', en: 'Days 4 and 9' }, ['4', '9'], ['heavy13', 'hitStay', 'russianRoulette'], {
  meta: {
    title: '시크릿 다이스 규칙 — 피의 게임2 데스매치, 상대가 고를 눈을 읽는 요트',
    description: '피의 게임2 4·9일차 데스매치 시크릿 다이스의 규칙을 정리했어요. 주사위 5개 중 3개는 굴리고 2개는 두 사람이 고르는 방식, 고정 개수에 따른 배분, 동시 공개, 1–6·총합·2·3 다이스·연속·4·5 다이스 점수표, 1과 6의 연속 인정, 12라운드까지.',
    keywords: ['시크릿 다이스', '피의 게임2 시크릿 다이스', '피의게임2 데스매치', '요트 다이스', '피의게임2'],
  },
  title: '시크릿 다이스 — 피의 게임2 데스매치',
  name: '시크릿 다이스',
  lead: '요트처럼 다섯 주사위로 점수표를 채우는데, 주사위 일부는 내가, 일부는 상대가 눈을 골라 내요. 상대는 당연히 내 조합을 망치려 해요.',
  summary: '주사위 다섯 개 중 몇 개의 눈을 두 사람이 직접 골라 내는 요트식 심리전. 데스매치로 두 번 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1. 12라운드이고, 라운드마다 두 사람이 한 번씩 **주 플레이어**가 돼요.',
      '**주사위**: 5개. 두 사람이 하나씩 들고, 나머지 3개는 집사가 굴려요.',
      '**점수표**: 1–6번(그 눈의 합), 총합(다섯 눈의 합), 2·3 다이스(2개·3개가 각각 같을 때 20점), 4연속(20점), 5연속(30점), 4 다이스(20점), 5 다이스 또는 조커(40점, 혹은 원하는 조합 항목의 점수).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '고정', body: '주 플레이어는 굴린 3개 중 마음에 드는 것을 1개 이상 고정해요. 3개를 모두 고정할 기회는 게임 중 한 번뿐이에요.' },
      { title: '배분', body: '고정하지 않은 주사위는 두 사람에게 나뉘어요. 1개 고정이면 주 플레이어 2개·상대 2개, 2개 고정이면 주 1개·상대 2개, 3개 고정이면 각자 1개를 손에 쥐어요.' },
      { title: '동시 공개', body: '각자 손에 든 주사위의 눈을 정해 신호에 맞춰 동시에 공개해요.' },
      { title: '기록', body: '주 플레이어는 다섯 눈으로 조건이 맞는 항목 하나를 채워요. 맞는 항목이 없으면 원하는 항목 하나에 0점을 써요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '12라운드 뒤 누적 점수가 높은 사람이 살아남아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '연속을 따질 때 **1과 6도 이어진 것**으로 봐요(6-1-2-3처럼).',
    ] },
  ],
  analysis: [
    { type: 'p', text: '시크릿 다이스의 주사위 일부는 운이 아니라 **사람의 선택**이에요. 상대가 고르는 눈은 언제나 나를 방해하는 쪽으로 가니, 내가 노리는 조합을 상대가 막기 어렵게 만드는 것이 핵심이에요.' },
    { type: 'cards', items: [
      { title: '고정 개수의 트레이드오프', body: '많이 고정하면 상대가 건드릴 주사위가 줄지만, 내가 고를 주사위도 줄어요. 2개 고정은 상대가 2개를 쥐어 가장 위험하고, 1개 고정은 나도 2개를 쥐어 맞대응할 수 있어요. 3개 고정의 한 번뿐인 기회는 5 다이스나 5연속처럼 큰 항목을 노릴 때 가치가 커요.' },
      { title: '막기 어려운 항목을 노려라', body: '상대는 내 조합을 깨는 눈을 내겠지만, 항목이 많아 하나를 막아도 다른 항목이 남을 수 있어요. 예를 들어 같은 눈 세 개가 고정되면 상대가 무엇을 내든 "그 눈의 합"이나 2·3 다이스, 총합 중 하나는 성립해요. 1과 6도 이어지는 규칙 때문에 연속은 생각보다 만들기 쉬워요.' },
      { title: '내 차례가 아닐 때', body: '상대가 주 플레이어일 때 나는 방해자예요. 상대의 점수표에서 아직 비어 있는 큰 항목을 보고, 그것을 깨는 눈을 고르는 게 기본이에요. 상대도 이를 알기에, 방해를 예상한 역수까지 읽는 심리전이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '굴리는 주사위의 운과 동시 선택의 심리가 섞여 **우월 전략은 없어요.** 점수표 칸이 한정되어 있으니, 0점을 써야 할 때 버릴 칸을 미리 정해 두는 관리도 중요해요.' },
  ],
  similar: [
    { name: '요트 다이스 (Yahtzee)', players: '1명 이상', alike: '주사위 다섯 개로 같은 눈·연속·풀하우스 같은 항목을 채우는 점수표 구조가 같아요.', differs: '요트는 세 번까지 다시 굴릴 수 있고, 상대가 내 주사위를 건드리지 않아요.' },
    { name: '라이어스 다이스 (Perudo)', players: '2–6명', alike: '주사위를 두고 상대의 의도를 읽는 심리전이에요.', differs: '페루도는 주사위를 숨기고 전체 개수를 두고 내기를 해요.' },
  ],
}, {
  meta: {
    title: 'Secret Dice rules — The Bloody Game 2 death match',
    description: 'The rules of Secret Dice (시크릿 다이스) from The Bloody Game 2: five dice of which three are rolled and the rest set by the two players, how dice are split by how many you keep, simultaneous reveal, the score sheet, 1 and 6 counting as consecutive, and twelve rounds.',
    keywords: ['Secret Dice', 'Bloody Game 2 death match', 'Yahtzee variant', '피의 게임2 시크릿 다이스'],
  },
  title: 'Secret Dice — The Bloody Game 2 death match',
  name: 'Secret Dice (시크릿 다이스)',
  lead: 'Fill a Yahtzee-like score sheet with five dice — but some of the faces are chosen by you and some by your opponent, who wants to wreck your combination.',
  summary: 'A Yahtzee-style mind game where players set some of the five dice by hand; twice a death match.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one, twelve rounds; each round both take a turn as **main player**.',
      '**Dice**: five; each player holds one and the butler rolls three.',
      '**Score sheet**: 1s–6s (sum of that face), total (sum of all five), 2·3 dice (a pair and a triple, 20), four in a row (20), five in a row (30), four of a kind (20), five of a kind or joker (40, or any combination’s score).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Keep', body: 'The main player keeps one or more of the three rolled dice; keeping all three is allowed once per game.' },
      { title: 'Split', body: 'The rest go to the players: keep 1 → main holds 2, rival 2; keep 2 → main 1, rival 2; keep 3 → one each.' },
      { title: 'Reveal', body: 'Each sets the faces of the dice in hand and both reveal on the signal.' },
      { title: 'Score', body: 'The main player fills one category the five dice satisfy, or writes 0 in any category if none fits.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After twelve rounds the higher total survives.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'For runs, **1 and 6 count as consecutive** (6-1-2-3, for example).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Some dice here are **choices, not luck**. The rival’s faces always aim to hurt you, so the trick is to aim at combinations that are hard to block.' },
    { type: 'cards', items: [
      { title: 'How many to keep', body: 'Keeping more leaves the rival fewer dice to spoil, but leaves you fewer too. Keeping two gives the rival two dice, the riskiest; keeping one lets you hold two and answer. The single keep-three is most valuable for big categories like five of a kind or five in a row.' },
      { title: 'Aim where blocking fails', body: 'There are many categories, so blocking one often leaves another: three equal faces kept guarantee something among that face’s sum, 2·3 dice or the total, whatever the rival shows. With 1 and 6 linked, runs are easier than they look.' },
      { title: 'When it is not your turn', body: 'As the spoiler, look at the big empty categories on the rival’s sheet and pick faces that break them. The rival knows this, so it becomes a game of reading the counter-read.' },
    ], columns: 1 },
    { type: 'p', text: 'Rolled luck and simultaneous choices mix, so **there is no dominant strategy**. With limited boxes, deciding in advance which box to sacrifice for a zero also matters.' },
  ],
  similar: [
    { name: 'Yahtzee', players: '1+', alike: 'Five dice fill categories such as kinds, straights and full houses.', differs: 'You may reroll up to three times and nobody touches your dice.' },
    { name: 'Liar’s Dice (Perudo)', players: '2–6', alike: 'Reading an opponent’s intentions over dice.', differs: 'Dice are hidden and players bid on the total count.' },
  ],
});

export const equationRoad = bg2Game('equation-road', 'money', day('5'), ['5'], ['equationTower', 'equationSignal', 'monorail'], {
  meta: {
    title: '수식 로드 규칙 — 피의 게임2 5일차 머니 챌린지, 숨은 카드로 길을 이어 100 만들기',
    description: '피의 게임2 5일차 머니 챌린지 수식 로드의 규칙을 정리했어요. 야생에 숨긴 100장의 카드, 길 방향과 숫자·기호, 수색 담당 2명과 수식 담당, 라운드별 제한 시간, 6×6판에서 출발점부터 도착점까지 끊기지 않는 수식, 숫자 이어 붙이기, 코인으로 버리기까지.',
    keywords: ['수식 로드', '피의 게임2 수식 로드', '피의게임2 5일차', '피의게임2 팀전', '피의게임2'],
  },
  title: '수식 로드 — 피의 게임2 5일차 머니 챌린지',
  name: '수식 로드',
  lead: '야생 곳곳에 숨은 카드를 찾아 와, 길이 끊기지 않게 이어 붙이면서 값이 100이 되는 수식을 만들어요.',
  summary: '수색조가 찾아온 길·숫자 카드로 6×6판에 값이 100인 수식 길을 잇는 팀전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 저택 팀 대 야생 팀.',
      '**카드**: 야생에 숨긴 100장. 봉투 겉면에 숫자 또는 기호가 적혀 있고, 카드에는 **길의 방향**(직선 또는 ㄱ자로 꺾인 길)과 **1–10 숫자나 사칙연산 기호** 하나가 있어요.',
      '**게임판**: 팀마다 6×6, 출발점과 도착점이 있어요.',
      '**코인**: 팀마다 20개.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '역할', body: '라운드마다 카드 수색 담당(2명 고정)과 수식 작성 담당을 나눠요. 수색 담당에게는 타이머가 주어져요.' },
      { title: '수색', body: '제한 시간(1–3라운드 15분, 4–5라운드 30분) 안에 딜러에게 가져온 봉투만 등록할 수 있어요.' },
      { title: '배치', body: '출발점부터 도착점까지 길이 끊기지 않게 카드를 놓아, 길을 따라 읽은 수식의 값이 100이 되게 해요. 카드를 돌려 쓸 수 없고, 숫자 카드는 붙여 두 자리 이상으로 쓸 수 있어요. 등호는 적지 않아요.' },
      { title: '버리기', body: '등록한 숫자 카드는 모두 써야 하고, 안 쓰는 카드는 버려야 해요. 1–4라운드는 무료, 5라운드에는 장당 3코인, 5라운드가 끝난 뒤에는 장당 5코인이에요. 버린 카드는 공개되고, 상대 팀이 가져갈 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '값이 100인 팀이 이겨요. 둘 다 100이면 **카드를 더 많이 쓴 팀**, 둘 다 아니면 100에 더 가까운 팀이 이겨요.',
      '이긴 팀은 저택에 남고, 남은 코인 5개당 개인자금 1,000만 원을 팀이 나눠 받아요. 진 팀은 투표로 탈락후보를 정해 지하감옥 수감자와 데스매치를 치르게 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '봉투 겉면으로 숫자인지 기호인지는 알 수 있지만, 길의 방향은 열어 봐야 알아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '수식 로드는 **수학 문제와 길 잇기 퍼즐**이 한 장의 카드에 묶여 있어요. 원하는 숫자라도 길 방향이 맞지 않으면 쓸 수 없어요.' },
    { type: 'cards', items: [
      { title: '등록한 숫자는 짐', body: '숫자 카드는 등록하면 반드시 써야 하므로, 많이 가져올수록 수식이 복잡해져요. 앞 라운드에서는 무료로 버릴 수 있지만 막판엔 코인이 들고, 남은 코인은 상금이 돼요. 그래서 초반에 넉넉히 모으고 4라운드까지 정리하는 흐름이 효율적이에요.' },
      { title: '100을 만드는 쉬운 길', body: '숫자를 이어 붙일 수 있으니 1과 0이 없어도 10×10, 50+50, 99+1처럼 만드는 방법은 많아요. 진짜 제약은 그 숫자들이 길 방향까지 맞춰 이어져야 한다는 점이에요. 직선 카드는 많을수록 좋고, 꺾인 길은 출발·도착의 방향에 맞춰 써야 해요.' },
      { title: '동점의 기준은 카드 수', body: '두 팀이 모두 100이면 카드를 많이 쓴 쪽이 이겨요. 100을 만든 뒤에도 "+1−1"처럼 값을 바꾸지 않는 카드를 길에 더 끼워 넣는 것이 마지막 경쟁이에요. 상대가 버린 카드를 가져올 수 있다는 점도 이 경쟁에 쓰여요.' },
    ], columns: 1 },
    { type: 'p', text: '카드가 숨겨져 있어 수색에 운과 체력이 섞이지만, 수식 담당의 계획이 무엇을 찾을지 정해 줘야 해요. **우월 전략은 없고**, 수색과 계산의 분업이 잘 맞는 팀이 앞서요.' },
  ],
  similar: [
    { name: '쯔로 (Tsuro)', players: '2–8명', alike: '길이 그려진 타일을 이어 하나의 경로를 만드는 게임이에요.', differs: '쯔로는 자기 말이 판 밖으로 나가지 않게 버티는 게임이고, 수식이 없어요.' },
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자를 사칙연산으로 묶어 목표 숫자를 만들어요.', differs: '크립토는 숫자 다섯 장이 모두 주어지고 길이나 수색이 없어요.' },
  ],
}, {
  meta: {
    title: 'Equation Road rules — The Bloody Game 2, day 5 money challenge',
    description: 'The rules of Equation Road (수식 로드) from The Bloody Game 2: 100 cards hidden outdoors, each with a path direction and a number or operator, two searchers and the equation builders, round time limits, an unbroken path on a 6×6 board worth 100, joining digits, and paying coins to discard.',
    keywords: ['Equation Road', 'Bloody Game 2 day 5', '피의 게임2 수식 로드'],
  },
  title: 'Equation Road — The Bloody Game 2, day 5 money challenge',
  name: 'Equation Road (수식 로드)',
  lead: 'Find cards hidden around the grounds and lay them in an unbroken path whose expression equals 100.',
  summary: 'A team game: searchers bring back path-and-number cards, builders lay a path on a 6×6 board that equals 100.',
  setup: [
    { type: 'list', items: [
      '**Teams**: the mansion team against the wild team.',
      '**Cards**: 100 hidden outdoors in envelopes marked number or operator; each card shows a **path piece** (straight or a corner) and **a number 1–10 or an operator**.',
      '**Board**: 6×6 per team, with a start and an end.',
      '**Coins**: 20 per team.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Roles', body: 'Each round splits the team into two searchers (always two, with a timer) and builders.' },
      { title: 'Search', body: 'Only envelopes handed to the dealer within the limit (15 minutes in rounds 1–3, 30 in 4–5) are registered.' },
      { title: 'Build', body: 'Lay cards from start to end with no break so the expression along the path equals 100. Cards cannot be rotated; number cards can be joined into multi-digit numbers; no equals sign is needed.' },
      { title: 'Discard', body: 'Every registered number card must be used or discarded: free in rounds 1–4, 3 coins each in round 5, 5 coins each after it. Discards are public and the other team may take them.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'A team reaching 100 wins; if both do, **more cards used** wins; if neither, the closer to 100.',
      'Winners stay in the mansion and get ₩10 million per 5 coins left, split as they choose; losers vote a candidate to face the prisoner in the death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Envelopes show number or operator, but the path piece is seen only when opened.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Equation Road ties **an arithmetic problem to a path puzzle** on every card: the right number is useless if its path piece does not fit.' },
    { type: 'cards', items: [
      { title: 'Registered numbers are baggage', body: 'Every registered number must be used, so hoarding complicates the expression; discards are free early but cost coins late, and coins are prize money. Collecting generously early and tidying up by round 4 is efficient.' },
      { title: 'Easy roads to 100', body: 'Joining digits allows 10×10, 50+50, 99+1 and more. The real constraint is that the numbers must connect by their path pieces: straights are valuable, corners must fit the start and end directions.' },
      { title: 'Ties go to card count', body: 'If both reach 100, more cards wins, so the last contest is inserting value-neutral cards such as +1−1; taking the rivals’ discards helps.' },
    ], columns: 1 },
    { type: 'p', text: 'Hidden cards bring luck and legwork into it, but the builders must tell searchers what to look for. **There is no dominant strategy**; the team whose search and arithmetic mesh best wins.' },
  ],
  similar: [
    { name: 'Tsuro', players: '2–8', alike: 'Connect tiles printed with paths into routes.', differs: 'You try to keep your piece on the board; there is no arithmetic.' },
    { name: 'Krypto', players: '1+', alike: 'Combine numbers with arithmetic to hit a target.', differs: 'All five numbers are dealt; no paths or searching.' },
  ],
});

export const mysteryNumber = bg2Game('mystery-number', 'death', day('5'), ['5'], ['indianPoker', 'hiddenWord', 'nemoCount'], {
  meta: {
    title: '미스터리 넘버 규칙 — 피의 게임2 5일차 데스매치, 상대의 숨은 숫자 블록 맞히기',
    description: '피의 게임2 5일차 데스매치 미스터리 넘버의 규칙을 정리했어요. 1–10 블록 네 세트 40개 중 비공개로 5개씩, 상대 블록 맞히기와 상대 앞에 블록 추가, 맞히면 연속으로 부르기, 모두 맞히면 2점 보너스, 블록이 떨어지면 합계 공개까지.',
    keywords: ['미스터리 넘버', '피의 게임2 미스터리 넘버', '피의게임2 데스매치', '다빈치 코드 보드게임', '피의게임2'],
  },
  title: '미스터리 넘버 — 피의 게임2 5일차 데스매치',
  name: '미스터리 넘버',
  lead: '상대 앞에 놓인 숨은 숫자 블록을 하나씩 맞혀요. 맞히면 계속 부를 수 있고, 틀리면 차례가 넘어가요.',
  summary: '상대의 숨은 숫자 블록을 추리해 맞히는 1:1 데스매치. 다빈치 코드와 비슷해요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1. 투표로 데스매치에 오른 사람부터 시작해요.',
      '**블록**: 1–10이 네 세트, 모두 40개. 각자 5개씩 비공개로 받고, 나머지는 집사가 가져요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '행동', body: '내 차례에는 **상대의 블록 맞히기**나 **상대 앞에 블록 추가하기**를 할 수 있어요.' },
      { title: '맞히기', body: '상대 앞의 블록 숫자를 맞히면 점수를 얻고, 맞힌 블록은 버리고 새 블록이 추가돼요. 맞힌 사람은 틀릴 때까지 계속 부를 수 있어요.' },
      { title: '보너스', body: '상대 앞의 블록을 모두 맞히면 2점을 더 받아요.' },
      { title: '합계 공개', body: '집사의 블록이 모두 떨어지면 각자 앞에 있는 블록의 숫자 합이 공개돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 사람의 블록이 모두 없어지면 게임이 끝나고, 점수가 높은 사람이 살아남아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '정리된 규칙에는 맞혔을 때의 점수가 "블록 개수대로"라고만 적혀 있어, 정확한 배점은 확인하지 못했어요. 블록 추가 행동의 세부도 확인되지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '미스터리 넘버는 **남은 숫자를 세는 게임**이에요. 1–10이 네 장씩 정해져 있으니, 공개된 블록과 내 블록을 빼면 상대가 가진 숫자의 후보가 좁혀져요.' },
    { type: 'cards', items: [
      { title: '카운팅', body: '같은 숫자는 네 개뿐이에요. 내 손에 7이 두 개 있고 7이 하나 공개됐다면, 상대에게 7은 많아야 하나예요. 맞힌 블록이 버려질 때마다 정보가 쌓이므로, 게임 후반으로 갈수록 추리가 정확해져요.' },
      { title: '연속으로 부를까, 멈출까', body: '맞히면 계속 부를 수 있지만 틀리면 차례가 넘어가요. 확실한 것만 부르고 멈추는 판단이 중요해요. 블록을 모두 맞혔을 때의 보너스 2점은 마지막 한두 개를 과감하게 부르게 만드는 유혹이에요.' },
      { title: '합계 공개의 순간', body: '집사의 블록이 떨어지면 각자 앞 블록의 합이 공개돼요. 남은 블록이 두세 개라면 합 하나로 후보 조합이 크게 줄어들어, 이 순간 이후는 계산 싸움이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '처음 블록 배분에 운이 있지만, 기록과 계산을 꼼꼼히 하는 쪽이 꾸준히 유리해요. **우월 전략은 없어요.**' },
  ],
  similar: [
    { name: '다빈치 코드 (Coda)', players: '2–4명', alike: '상대가 숨긴 숫자 타일을 하나씩 추리해 맞히고, 맞히면 계속 부를 수 있는 규칙이 같아요.', differs: '다빈치 코드는 타일이 크기 순으로 정렬되어 있어 위치가 단서가 되고, 틀리면 내 타일 하나를 공개해요.' },
    { name: '마스터마인드 (Mastermind)', players: '2명', alike: '숨긴 숫자·색의 조합을 단서로 좁혀 가는 추리예요.', differs: '마스터마인드는 한쪽만 숨기고 한쪽만 추리해요.' },
  ],
}, {
  meta: {
    title: 'Mystery Number rules — The Bloody Game 2, day 5 death match',
    description: 'The rules of Mystery Number (미스터리 넘버) from The Bloody Game 2: four sets of 1–10 blocks, five hidden blocks each, guessing the rival’s blocks or adding a block in front of them, continuing after a hit, a 2-point bonus for clearing them all, and the sums revealed when the pool runs out.',
    keywords: ['Mystery Number', 'Bloody Game 2 death match', 'Da Vinci Code game', '피의 게임2 미스터리 넘버'],
  },
  title: 'Mystery Number — The Bloody Game 2, day 5 death match',
  name: 'Mystery Number (미스터리 넘버)',
  lead: 'Guess the hidden number blocks in front of your rival, one by one. A hit lets you keep going; a miss passes the turn.',
  summary: 'A one-on-one death match of deducing the rival’s hidden number blocks, close to Da Vinci Code.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one; the player voted in starts.',
      '**Blocks**: four sets of 1–10, forty in all; five each, hidden, and the butler keeps the rest.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Action', body: 'On your turn, **guess one of the rival’s blocks** or **add a block in front of the rival**.' },
      { title: 'Guess', body: 'A correct guess scores; the block is discarded and a new one added. You may keep guessing until you miss.' },
      { title: 'Bonus', body: 'Guessing every block in front of the rival is worth 2 more points.' },
      { title: 'Sums', body: 'When the butler’s blocks run out, the sum of each player’s blocks is revealed.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The game ends when one player has no blocks left; the higher score survives.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The written rules say only that a hit scores "by the number of blocks", so the exact scoring could not be confirmed, nor the details of adding a block.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Mystery Number is **a counting game**. With four of each number, subtracting what you hold and what has been revealed narrows the rival’s candidates.' },
    { type: 'cards', items: [
      { title: 'Counting', body: 'There are only four of each. Hold two 7s with one revealed, and the rival has at most one. Each discarded hit adds information, so guesses sharpen as the game goes.' },
      { title: 'Press on or stop', body: 'A hit lets you continue but a miss hands over the turn, so stopping after the sure ones is key. The 2-point bonus for clearing everything tempts bold guesses at the end.' },
      { title: 'When the sums appear', body: 'Once the pool runs out, each sum is revealed; with two or three blocks left, one sum slashes the possibilities and it becomes pure calculation.' },
    ], columns: 1 },
    { type: 'p', text: 'The deal adds luck, but careful records and arithmetic win steadily. **There is no dominant strategy.**' },
  ],
  similar: [
    { name: 'Da Vinci Code (Coda)', players: '2–4', alike: 'Deduce opponents’ hidden number tiles one at a time, continuing after a hit.', differs: 'Tiles are sorted so position is a clue, and a miss reveals one of yours.' },
    { name: 'Mastermind', players: '2', alike: 'Narrowing down a hidden combination from clues.', differs: 'Only one side hides and only one guesses.' },
  ],
});

export const realTime = bg2Game('real-time', 'money', day('6'), ['6'], ['russianRoulette', 'hitStay', 'piggyBank'], {
  meta: {
    title: '리얼 타임 규칙 — 피의 게임2 6일차 머니 챌린지, 시계 없이 시간 구간 고르기',
    description: '피의 게임2 6일차 머니 챌린지 리얼 타임의 규칙을 정리했어요. 실제 60분 라운드 3번, 5분마다 울리는 알림, 코인 15개와 추가 구매, 투표룸 1분 제한, 구간 선택·시간 확인·시간 이동, 구간별 3–10점과 함께 들어간 사람끼리 나누기, 권력자 보상까지.',
    keywords: ['리얼 타임', '피의 게임2 리얼 타임', '피의게임2 6일차', '시간 감각 게임', '피의게임2'],
  },
  title: '리얼 타임 — 피의 게임2 6일차 머니 챌린지',
  name: '리얼 타임',
  lead: '시계 없이 60분을 보내며, 점수가 높은 시간 구간에 맞춰 투표룸에 들어가요. 같은 구간에 여럿이 들어가면 점수를 나눠요.',
  summary: '시간 감각으로 점수가 높은 구간을 노리되, 남들과 겹치지 않아야 하는 3라운드 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 개인전.',
      '**라운드**: 3라운드, 한 라운드는 실제 60분. 시계는 볼 수 없고 5분마다 알림만 울려요.',
      '**코인**: 각자 15개(교환·양도·파기 불가). 라운드 시작 전 1,000만 원에 2개씩, 최대 3번 더 살 수 있어요.',
    ] },
    { type: 'table', head: ['구간', '0–10분', '10–20', '20–28', '28–32', '32–40', '40–50', '50–60'], rows: [
      ['승점', '3', '5', '7', '10', '8', '6', '3'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '투표룸', body: '라운드 중 투표룸에 들어가면 1분 안에 아래 중 하나 이상을 해야 해요. 아무것도 안 하거나 1분을 넘기면 1분마다 코인 1개가 빠져요.' },
      { title: '구간 선택', body: '지금 시간대의 구간에 들어가요. 라운드당 한 번, 바꾸거나 취소할 수 없고, 어느 구간이었는지는 알려 주지 않아요.' },
      { title: '시간 확인', body: '코인 1개로 지금 시간을 확인해요.' },
      { title: '시간 이동', body: '코인 2개당 2분씩 미래나 과거 시간대로 옮겨 가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 구간에 여럿이 들어가면 점수를 **인원수로 나누고 소수점은 버려요**. 라운드마다 점수가 공지돼요.',
      '3라운드 누적 1위는 **권력자**가 되어 2,000만 원을 받고, 데스매치 뒤 생존자 한 명을 다음 챌린지까지 저택에서 내보내요. 최하위는 탈락후보가 되어 두 사람을 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드 중에는 개인자금을 주고받을 수 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '리얼 타임은 **시간 감각**과 **눈치 싸움**이 겹친 게임이에요. 가장 좋은 28–32분 구간은 4분밖에 안 되고, 모두가 노리는 만큼 나눠 가질 위험도 커요.' },
    { type: 'cards', items: [
      { title: '나누면 손해가 크다', body: '10점 구간에 셋이 들어가면 각자 3점, 넷이면 2점이에요. 아무도 없는 6점 구간이 더 나아요. 그래서 가장 좋은 구간을 피해 덜 붐빌 구간을 고르는 역발상이 합리적일 수 있어요. 모두가 이렇게 생각하면 다시 좋은 구간이 비어요.' },
      { title: '알림과 코인', body: '5분 알림 덕분에 큰 오차는 줄지만, 28–32분처럼 좁은 구간은 알림만으로 맞추기 어려워요. 시간 확인(코인 1개)과 시간 이동(2분당 2개)은 이 오차를 돈으로 줄이는 수단이에요. 1분 제한과 벌금 때문에 투표룸에 들어갈 때 할 일을 미리 정해 두어야 해요.' },
      { title: '비공개 선택의 효과', body: '어느 구간에 들어갔는지 알려 주지 않으니, 동맹끼리 구간을 나누기로 약속해도 지켰는지 라운드 결과로만 알 수 있어요. 점수 공지를 보고 누가 겹쳤는지 거꾸로 추리하는 것이 다음 라운드의 정보예요.' },
    ], columns: 1 },
    { type: 'p', text: '구간을 나누는 것은 일종의 혼잡 게임이라 **우월 전략은 없어요.** 동맹이 구간을 미리 나누면 서로 겹치지 않아 모두의 기대 점수가 올라가요.' },
  ],
  similar: [
    { name: '더 마인드 (The Mind)', players: '2–4명', alike: '말없이 시간이 흐르는 감각만으로 행동할 때를 정하는 게임이에요.', differs: '더 마인드는 숫자 카드를 순서대로 내는 협력 게임이에요.' },
    { name: '다이아몬드 (Incan Gold)', players: '3–8명', alike: '같은 곳에 남은 사람끼리 보물을 똑같이 나누고 나머지는 버리는 분배 규칙이 비슷해요.', differs: '다이아몬드는 동굴에서 언제 돌아갈지 정하는 위험 감수 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Real Time rules — The Bloody Game 2, day 6 money challenge',
    description: 'The rules of Real Time (리얼 타임) from The Bloody Game 2: three real 60-minute rounds with a chime every 5 minutes, 15 coins plus purchases, the 1-minute limit in the voting room, choosing a slot, checking or shifting time, slots worth 3–10 points shared among those inside, and the ruler’s reward.',
    keywords: ['Real Time', 'Bloody Game 2 day 6', 'sense of time game', '피의 게임2 리얼 타임'],
  },
  title: 'Real Time — The Bloody Game 2, day 6 money challenge',
  name: 'Real Time (리얼 타임)',
  lead: 'Spend sixty minutes without a clock and step into the voting room during the slot worth the most. Share a slot and you share its points.',
  summary: 'Use your sense of time to hit valuable slots without crowding into the same one, over three rounds.',
  setup: [
    { type: 'list', items: [
      '**Players**: individual.',
      '**Rounds**: three of a real 60 minutes. No clocks; a chime every 5 minutes.',
      '**Coins**: 15 each (no trading). Before a round you may buy 2 for ₩10 million, up to three times.',
    ] },
    { type: 'table', head: ['Slot', '0–10 min', '10–20', '20–28', '28–32', '32–40', '40–50', '50–60'], rows: [
      ['Points', '3', '5', '7', '10', '8', '6', '3'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Voting room', body: 'Inside, within 1 minute you must do at least one of the following; doing nothing or overstaying costs a coin per minute.' },
      { title: 'Enter a slot', body: 'Join the current slot, once per round, with no changes; which slot it was is not announced.' },
      { title: 'Check time', body: 'Pay 1 coin to see the time.' },
      { title: 'Shift time', body: 'Pay 2 coins per 2 minutes to move into a future or past slot.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Players in the same slot **split its points, rounding down**; scores are announced each round.',
      'The three-round leader becomes **ruler**, receives ₩20 million and expels one survivor from the mansion until the next challenge; last place becomes the candidate and names two players.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'No transfers of personal funds during a round.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Real Time combines **a sense of time** with **crowd-reading**. The best slot, 28–32, lasts only four minutes, and everyone wants it.' },
    { type: 'cards', items: [
      { title: 'Sharing hurts', body: 'Three in the 10-point slot get 3 each, four get 2: an empty 6-point slot is better. Avoiding the obvious slot can be rational, until everyone thinks so and it empties again.' },
      { title: 'Chimes and coins', body: 'Chimes limit big errors, but a narrow slot is hard to hit by chimes alone. Checking (1 coin) and shifting (2 per 2 minutes) buy precision; the 1-minute limit means planning before you enter.' },
      { title: 'Secret choices', body: 'Slots are not announced, so allies who agree to split slots can only check through the scores. Working backwards from the announced points to who overlapped is the information for the next round.' },
    ], columns: 1 },
    { type: 'p', text: 'Dividing slots is a congestion game, so **there is no dominant strategy**; allies who pre-assign slots avoid overlaps and all score more.' },
  ],
  similar: [
    { name: 'The Mind', players: '2–4', alike: 'Acting on a silent sense of passing time.', differs: 'It is cooperative: number cards played in order.' },
    { name: 'Incan Gold (Diamant)', players: '3–8', alike: 'Treasure is split evenly among those present, the remainder left behind.', differs: 'It is a push-your-luck game about when to leave the cave.' },
  ],
});

export const mazeCode = bg2Game('maze-code', 'death', day('6'), ['6'], ['monorail', 'wallgo', 'nemoCount'], {
  meta: {
    title: '미로 코드 규칙 — 피의 게임2 6일차 데스매치, 3D 장면으로 평면도 좌표 찾기',
    description: '피의 게임2 6일차 데스매치 미로 코드의 규칙을 정리했어요. 좌표가 표시된 미로 평면도와 한 지점을 보여 주는 3D 미로, 평면도 두 장에 문제 세 개씩, 먼저 외친 사람의 정답 1점, 오답 시 상대에게 10초까지.',
    keywords: ['미로 코드', '피의 게임2 미로 코드', '피의게임2 데스매치', '공간지각 게임', '피의게임2'],
  },
  title: '미로 코드 — 피의 게임2 6일차 데스매치',
  name: '미로 코드',
  lead: '미로 속 한 지점을 3D로 보여 주면, 평면도에서 그 지점의 좌표를 먼저 찾아 외쳐요.',
  summary: '3D 미로 장면을 평면도와 맞춰 좌표를 찾는 공간 지각 속도전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**자료**: 좌표가 표시된 미로 평면도 2장과, 미로 안 한 지점을 보여 주는 3D 미로 장면.',
      '**문제**: 평면도 한 장당 3문제, 모두 6문제.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '문제', body: '물음표가 있는 3D 미로 장면이 나와요.' },
      { title: '대조', body: '장면의 벽과 길의 모양을 평면도와 비교해 물음표의 좌표를 찾아요.' },
      { title: '정답', body: '먼저 외친 사람이 맞히면 1점이에요. 틀리면 상대에게 10초 동안 답할 기회가 가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '모든 문제가 끝난 뒤 점수가 높은 사람이 살아남아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '동점일 때의 처리는 정리된 규칙에서 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '미로 코드는 **시점 전환**을 겨루는 게임이에요. 눈앞의 3D 장면을 위에서 내려다본 지도로 바꿔 생각할 수 있어야 해요.' },
    { type: 'cards', items: [
      { title: '특징부터 찾기', body: '모든 칸을 비교하면 늦어요. 장면에서 막다른 길, T자 갈림길, 긴 직선 같은 눈에 띄는 모양을 먼저 찾고, 평면도에서 같은 모양이 있는 곳만 후보로 삼으면 빨라요. 같은 모양이 여러 곳이면 바라보는 방향을 바꿔 가며 확인해요.' },
      { title: '오답의 대가', body: '틀리면 상대가 10초 동안 독점으로 답할 수 있어요. 상대가 이미 후보를 좁혀 둔 상태라면 내 오답이 상대의 점수가 돼요. 확신이 설 때까지 기다리는 것과 먼저 외치는 것 사이의 저울질이 승부예요.' },
    ], columns: 1 },
    { type: 'p', text: '순수한 실력 게임이라 **우월 전략은 없어요.** 한 평면도의 문제 세 개는 같은 지도를 쓰므로, 첫 문제를 풀며 지도를 익혀 두면 두 번째부터 빨라져요.' },
  ],
  similar: [
    { name: '우봉고 3D (Ubongo 3-D)', players: '2–4명', alike: '입체 조각을 머릿속으로 돌려 맞추는 공간 지각 속도전이에요.', differs: '우봉고는 블록으로 정해진 모양을 직접 채워요.' },
    { name: '라비린스 (Das verrückte Labyrinth)', players: '2–4명', alike: '미로의 구조를 읽어 목표 지점을 찾아요.', differs: '라비린스는 미로를 직접 바꾸며 말을 움직여요.' },
  ],
}, {
  meta: {
    title: 'Maze Code rules — The Bloody Game 2, day 6 death match',
    description: 'The rules of Maze Code (미로 코드) from The Bloody Game 2: a maze floor plan with coordinates and a 3D view of one spot, three questions per plan over two plans, a point for the first correct call, and 10 seconds for the rival after a miss.',
    keywords: ['Maze Code', 'Bloody Game 2 death match', 'spatial reasoning game', '피의 게임2 미로 코드'],
  },
  title: 'Maze Code — The Bloody Game 2, day 6 death match',
  name: 'Maze Code (미로 코드)',
  lead: 'You are shown a 3D view of one spot in a maze; be first to call its coordinates on the floor plan.',
  summary: 'A spatial-reasoning race matching a 3D maze view to a floor plan.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one.',
      '**Material**: two floor plans with coordinates, and 3D views of points inside the maze.',
      '**Questions**: three per plan, six in all.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Question', body: 'A 3D view with a question mark appears.' },
      { title: 'Match', body: 'Compare the walls and paths with the plan to find the question mark’s coordinates.' },
      { title: 'Answer', body: 'The first to call correctly scores 1; a miss gives the rival 10 seconds to answer.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After all questions the higher score survives.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Tie handling could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Maze Code tests **switching viewpoint**: turning the scene in front of you into a map seen from above.' },
    { type: 'cards', items: [
      { title: 'Find landmarks first', body: 'Comparing every cell is slow. Spot distinctive shapes — dead ends, T-junctions, long straights — and consider only plan locations with the same shape, checking facing directions when several match.' },
      { title: 'The cost of a miss', body: 'A miss gives the rival 10 exclusive seconds, and if they have narrowed it down, your error is their point. Waiting for certainty versus calling first is the whole contest.' },
    ], columns: 1 },
    { type: 'p', text: 'It is pure skill, so **there is no dominant strategy**. Three questions share each plan, so learning the map on the first makes the next two faster.' },
  ],
  similar: [
    { name: 'Ubongo 3-D', players: '2–4', alike: 'A speed race of rotating solid pieces in your head.', differs: 'You physically fill a shape with blocks.' },
    { name: 'Labyrinth', players: '2–4', alike: 'Reading a maze’s structure to find a target.', differs: 'You shift the maze and move a piece.' },
  ],
});
