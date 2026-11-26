// 피의 게임 (season 1), days 8–11: 전략 수식 게임, 전략 카드게임, 세미파이널 돈·벌레 게임, 파이널 마이너스 사다리·러닝 퍼즐.
import { bg1Game } from './shared';

export const strategicEquation = bg1Game('strategic-equation-game', 'revival', '8', ['equationTower', 'equationSignal', 'heavy13'], {
  meta: {
    title: '전략 수식 게임 규칙 — 피의 게임 시즌1 8일차 피의 복수 챌린지, 숨은 카드로 37 만들기',
    description: '피의 게임 시즌1 8일차 피의 복수 챌린지 전략 수식 게임의 규칙을 정리했어요. 폐공장의 카드 55장(숫자 0–20, 사칙 기호), 팀별 수색 담당 2명과 전화·지도, 15분 5라운드, 상대가 버린 카드 사용, 37 완성과 카드 수 판정까지.',
    keywords: ['전략 수식 게임', '피의 게임 전략 수식 게임', '피의 게임 시즌1 8일차', '37 만들기', '피의게임1'],
  },
  title: '전략 수식 게임 — 피의 게임 시즌1 8일차 피의 복수 챌린지',
  name: '전략 수식 게임',
  lead: '3일차 수식 게임의 팀전이에요. 수색조가 폐공장에서 카드를 찾아 오면, 수식조가 값이 37인 수식을 만들어요.',
  summary: '지상층과 지하층이 숨겨진 카드 55장으로 37을 만드는 팀전. 카드를 더 많이 쓴 팀이 동점에서 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 지상층 팀 대 지하층 팀.',
      '**카드 55장**: 빨간 스티커 봉투는 숫자(0–10 각 1장, 11–20 각 2장, 모두 25장), 초록 스티커 봉투는 기호(+, −, ×, ÷ 각 5장, 모두 20장). 집사를 거쳐야 열 수 있어요.',
      '**도구**: 수색 담당에게 수식 담당과 통화할 휴대폰과 카드 위치가 대략 표시된 지도.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '역할', body: '5라운드, 라운드마다 15분. 팀마다 2명이 수색, 나머지가 수식을 맡아요. 같은 사람이 연속 라운드에 수색할 수는 없어요.' },
      { title: '버리기', body: '연 카드는 언제든 버릴 수 있고, **상대 팀이 버린 카드는 대가 없이** 쓸 수 있어요.' },
      { title: '정리', body: '5라운드 뒤 10분의 최종 수식 정리 시간이 있고, 카드 버리기는 그중 처음 5분까지만 돼요.' },
      { title: '수식', body: '기호 카드가 1장 이상 있어야 하고, 숫자 카드는 2장 이상 붙여 쓸 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**37**을 만든 팀이 이겨요. 둘 다 37이면 **카드를 더 많이 쓴 팀**, 그것도 같으면 쓴 숫자 카드 중 가장 큰 값이 높은 팀이 이겨요.',
      '이긴 팀은 지상층에 머물거나 복귀하고, 진 팀은 지하층으로 가며 투표로 최종 탈락자를 정해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '정리된 자료에는 숫자 25장과 기호 20장을 합쳐 45장인데 전체가 55장으로 적혀 있어, 나머지 10장의 정체는 확인하지 못했어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '3일차와 달리 **카드 수 자체가 동점 판정**이 돼요. 37을 만드는 것은 쉬워서, 결국 얼마나 많은 카드를 값을 바꾸지 않고 끼워 넣느냐의 싸움이에요.' },
    { type: 'cards', items: [
      { title: '전부 쓰는 수식', body: '이상적인 답은 모은 카드를 전부 쓰는 수식이에요. 같은 숫자 두 장은 "15÷15"처럼 1을 만들고, 1은 곱해도 값이 그대로예요. ÷가 많으면 "a÷a" 묶음으로 숫자를 흡수할 수 있어요. 카드가 많을수록 37로 맞추는 퍼즐은 어려워지지만, 그 퍼즐을 푼 팀이 이겨요.' },
      { title: '버리면 상대의 재료', body: '버린 카드는 상대가 공짜로 쓸 수 있어요. 카드 수가 판정 기준이니 내가 버린 카드가 상대의 동점 승리를 만들 수 있어요. 마지막 5분의 버리기 제한까지 고려해, 끝까지 쓸 수 있는 카드만 남기는 판단이 필요해요.' },
      { title: '전화로 하는 분업', body: '수색조는 지도와 전화로 수식조의 요청을 받아요. 수식조가 "기호가 더 필요하다", "11 이상 같은 숫자 두 장" 같은 구체적인 주문을 할수록 수색이 효율적이에요.' },
    ], columns: 1 },
    { type: 'p', text: '카드 수가 승패를 가르기 때문에 **우월 전략은** "최대한 많이 모아 전부 쓰기"에 가까워요. 실제 차이는 그 많은 카드를 37로 맞추는 계산력에서 나요.' },
  ],
  similar: [
    { name: '이퀘이트 (Equate)', players: '2–4명', alike: '숫자와 기호 타일로 맞는 식을 만들어요.', differs: '이퀘이트는 판 위에 등식을 엮고, 목표 숫자가 없어요.' },
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자로 목표 숫자를 만들어요.', differs: '크립토는 다섯 장을 모두 한 번씩 쓰면 끝이고, 카드 수 경쟁이 없어요.' },
  ],
}, {
  meta: {
    title: 'Strategic Equation Game rules — The Bloody Game season 1, day 8 revenge challenge',
    description: 'The rules of the Strategic Equation Game (전략 수식 게임) from The Bloody Game season 1: 55 cards in a disused factory (numbers 0–20 and operators), two searchers per team with a phone and a map, five 15-minute rounds, using the rivals’ discards, and making 37 with card count as tie-break.',
    keywords: ['Strategic Equation Game', 'Bloody Game season 1', 'make 37', '피의 게임 전략 수식 게임'],
  },
  title: 'Strategic Equation Game — The Bloody Game season 1, day 8 revenge challenge',
  name: 'Strategic Equation Game (전략 수식 게임)',
  lead: 'Day 3’s equation game as a team match: searchers bring cards from a disused factory and builders make an equation worth 37.',
  summary: 'Upper floor against basement making 37 from 55 hidden cards; more cards used breaks a tie.',
  setup: [
    { type: 'list', items: [
      '**Teams**: the upper floor against the basement.',
      '**55 cards**: red-sticker envelopes hold numbers (0–10 once each, 11–20 twice each, 25 in all); green ones hold operators (+, −, ×, ÷, five each, 20 in all). Only the butler opens them.',
      '**Tools**: searchers get a phone to the builders and a rough map of card locations.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Roles', body: 'Five rounds of 15 minutes; two per team search, the rest build. Nobody searches two rounds running.' },
      { title: 'Discards', body: 'Opened cards may be discarded at any time, and **the rivals’ discards are free to use**.' },
      { title: 'Wrap-up', body: 'After round 5 there are 10 minutes to finalise; discarding is allowed only in the first 5.' },
      { title: 'Equation', body: 'At least one operator; two or more number cards may be joined.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Making **37** wins; if both do, **more cards used**, then the highest number card, decides.',
      'Winners stay on or return to the upper floor; losers go to the basement and vote out one player for good.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The written rules list 25 numbers and 20 operators (45) but 55 cards in all; the other ten could not be identified.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Unlike day 3, **card count itself breaks ties**. Reaching 37 is easy; the fight is over how many cards you can slot in without changing the value.' },
    { type: 'cards', items: [
      { title: 'Use everything', body: 'The ideal answer uses every card collected. Two equal numbers make 1 ("15÷15"), and multiplying by 1 changes nothing; plenty of ÷ lets "a÷a" pairs soak up numbers. More cards make the puzzle harder, but solving it wins.' },
      { title: 'Discards feed rivals', body: 'Discards are free for the other team, and card count decides ties, so what you throw away can hand them the win; plan around the 5-minute discard cut-off.' },
      { title: 'Division of labour by phone', body: 'Searchers take orders by phone; precise requests such as "more operators" or "two equal numbers above 11" make searching efficient.' },
    ], columns: 1 },
    { type: 'p', text: 'Because card count decides, the **near-dominant strategy** is to gather as much as possible and use it all; the real difference is the arithmetic of making it all equal 37.' },
  ],
  similar: [
    { name: 'Equate', players: '2–4', alike: 'Build correct equations from number and operator tiles.', differs: 'Equations interlock on a board with no target.' },
    { name: 'Krypto', players: '1+', alike: 'Make a target from given numbers.', differs: 'You use five cards once each; no card-count race.' },
  ],
});

export const strategyCard = bg1Game('strategy-card-game', 'revival', '9', ['indianPoker', 'twoSidedPoker', 'hiddenWord'], {
  meta: {
    title: '전략 카드게임 규칙 — 피의 게임 시즌1 9일차 피의 복수 챌린지, 킹·퀸·잭·에이스의 서열 싸움과 정체 맞히기',
    description: '피의 게임 시즌1 9일차 피의 복수 챌린지 전략 카드게임의 규칙을 정리했어요. 팀원마다 킹·퀸·잭·에이스 역할 카드, 서열과 점수(1·2·3·3점), 한 번뿐인 조커 0.5점, 결과만 공개, 5라운드 뒤 상대 역할 예측, 동점 연장전까지.',
    keywords: ['전략 카드게임', '피의 게임 전략 카드게임', '피의 게임 시즌1 9일차', '피의 복수 챌린지', '피의게임1'],
  },
  title: '전략 카드게임 — 피의 게임 시즌1 9일차 피의 복수 챌린지',
  name: '전략 카드게임',
  lead: '팀원 네 명이 킹·퀸·잭·에이스 중 하나를 몰래 맡아 1:1로 겨뤄요. 약한 카드가 이기면 점수가 커요. 끝나면 상대 팀 네 명의 역할을 맞혀요.',
  summary: '서열이 순환하는 네 장의 역할 카드로 다섯 번 겨루고, 상대의 역할을 추리해 점수를 더하는 팀전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 지상층 4명 대 지하층 4명.',
      '**카드**: 팀마다 킹·퀸·잭·에이스·조커 5장. 조커를 뺀 네 장을 한 명씩 **역할 카드**로 맡고, 게임 중 바꿀 수 없어요.',
    ] },
    { type: 'table', head: ['카드', '이기는 상대', '이겼을 때 점수'], rows: [
      ['킹', '퀸, 잭', '1점'],
      ['퀸', '잭, 에이스', '2점'],
      ['잭', '에이스', '3점'],
      ['에이스', '킹', '3점'],
      ['조커', '모든 카드', '0.5점'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '승부', body: '라운드마다 팀에서 한 명씩 나와 자기 역할 카드로 겨뤄요. 같은 사람이 연속으로 나갈 수도 있어요.' },
      { title: '조커', body: '조커는 전체 승부 중 한 번만 쓸 수 있어요.' },
      { title: '결과', body: '집사는 승부 결과만 알리고, 점수 현황은 알려 주지 않아요.' },
      { title: '역할 예측', body: '5라운드 뒤 상대 팀 네 명의 역할을 예측해, 맞힐 때마다 1점, 네 명 모두 맞히면 1점을 더 받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '승부 점수와 예측 점수의 합이 높은 팀이 이겨요.',
      '동점이면 3라운드 연장전을 해요. 연장전에서는 같은 사람이 연속으로 나갈 수 없고 조커도 쓸 수 없어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '같은 카드끼리 붙으면 무승부로 보여요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임에는 두 개의 승부가 겹쳐 있어요. **카드 승부**는 출전 선수를 고르는 심리전이고, **역할 예측**은 그 승부에서 새어 나간 정보를 모으는 추리예요.' },
    { type: 'cards', items: [
      { title: '점수가 서열을 뒤집는다', body: '킹은 두 장을 이기지만 1점, 잭과 에이스는 한 장만 이기지만 3점이에요. 강한 카드는 자주 이기지만 적게 벌고, 약한 카드는 드물게 이기지만 크게 벌어요. 그래서 상대가 킹을 낼 것 같으면 에이스로 3점을 노리는 식의 역수 읽기가 핵심이에요.' },
      { title: '출전은 곧 정보 공개', body: '승부 결과가 공개되면 두 선수의 카드 관계가 드러나요. 예를 들어 "A가 B에게 졌다"는 결과 하나로 두 사람의 가능한 조합이 몇 가지로 줄어요. 같은 사람을 계속 내보내면 정체가 쉽게 드러나니, 승부 점수와 예측 점수 사이의 저울질이 생겨요.' },
      { title: '예측 점수는 최대 5점', body: '네 명을 모두 맞히면 5점으로, 승부 다섯 판에서 얻을 수 있는 점수에 견줄 만해요. 그래서 출전을 아예 섞어 정체를 숨기는 것도 하나의 전략이고, 상대의 정체를 일찍 확정하면 남은 승부도 유리해져요.' },
    ], columns: 1 },
    { type: 'p', text: '서열이 순환해 **우월 전략은 없어요.** 다만 결과만 공개되는 정보 구조에서, 내 쪽의 정보를 덜 흘리면서 상대 정보를 더 얻는 출전 순서를 짜는 팀이 앞서요.' },
  ],
  similar: [
    { name: '스트라테고 (Stratego)', players: '2명', alike: '말의 계급을 숨긴 채 맞붙고, 대결 결과로 상대 말의 정체를 추리해요. 약한 말이 가장 강한 말을 잡는 예외(스파이)가 있는 것도 비슷해요.', differs: '스트라테고는 판 위에서 말을 움직이고 깃발을 잡아야 이겨요.' },
    { name: '하나미코지 (Hanamikoji)', players: '2명', alike: '한정된 카드를 언제 어떻게 쓸지 상대의 수를 읽으며 정하는 심리전이에요.', differs: '하나미코지는 게이샤의 호감을 두고 카드를 나누는 방식이에요.' },
  ],
}, {
  meta: {
    title: 'Strategy Card Game rules — The Bloody Game season 1, day 9 revenge challenge',
    description: 'The rules of the Strategy Card Game (전략 카드게임) from The Bloody Game season 1: King, Queen, Jack and Ace role cards per player, the cyclic ranking worth 1, 2, 3 and 3 points, a one-time Joker worth 0.5, results-only announcements, guessing the rival roles after five rounds, and the tie-break.',
    keywords: ['Strategy Card Game', 'Bloody Game season 1', 'revenge challenge', '피의 게임 전략 카드게임'],
  },
  title: 'Strategy Card Game — The Bloody Game season 1, day 9 revenge challenge',
  name: 'Strategy Card Game (전략 카드게임)',
  lead: 'Four players per team each secretly take King, Queen, Jack or Ace and duel one-on-one; weaker cards score more when they win. At the end, guess the other team’s roles.',
  summary: 'Five duels with a cyclic four-card ranking, plus points for deducing the rivals’ roles.',
  setup: [
    { type: 'list', items: [
      '**Teams**: four from the upper floor against four from the basement.',
      '**Cards**: King, Queen, Jack, Ace and Joker per team; each player takes one of the four as a fixed **role card**.',
    ] },
    { type: 'table', head: ['Card', 'Beats', 'Points for a win'], rows: [
      ['King', 'Queen, Jack', '1'],
      ['Queen', 'Jack, Ace', '2'],
      ['Jack', 'Ace', '3'],
      ['Ace', 'King', '3'],
      ['Joker', 'anything', '0.5'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Duel', body: 'Each round one player per team duels with their role card; the same player may go repeatedly.' },
      { title: 'Joker', body: 'The Joker can be used once in the whole game.' },
      { title: 'Results', body: 'The butler announces only who won, not the score.' },
      { title: 'Guess', body: 'After five rounds, guess the rival team’s four roles: 1 point each, plus 1 for all four.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Duel points plus guess points decide the winner.',
      'A tie goes to a three-round extra time with no repeated players and no Joker.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Equal cards appear to draw.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Two contests overlap: **the duels**, a mind game of whom to send, and **the role guess**, deduction from what the duels leak.' },
    { type: 'cards', items: [
      { title: 'Points invert the ranking', body: 'The King beats two cards for 1 point; Jack and Ace beat one for 3. Strong cards win often and earn little, weak cards rarely and earn big, so expecting a King and sending the Ace for 3 is the core counter-read.' },
      { title: 'Playing reveals', body: 'Each result exposes the relation between two players’ cards: "A lost to B" leaves only a few possibilities. Sending the same player repeatedly exposes them, so duel points trade against guess points.' },
      { title: 'Guesses are worth 5', body: 'All four right is 5 points, comparable to the duels, so mixing players to stay hidden is a strategy in itself, and identifying rivals early helps the remaining duels.' },
    ], columns: 1 },
    { type: 'p', text: 'The ranking is cyclic, so **there is no dominant strategy**; the team that leaks less while learning more through its order of play has the edge.' },
  ],
  similar: [
    { name: 'Stratego', players: '2', alike: 'Hidden ranks clash and results reveal identities; a weak piece (the Spy) beats the strongest.', differs: 'Pieces move on a board and you must capture the flag.' },
    { name: 'Hanamikoji', players: '2', alike: 'A mind game over when to use a few cards while reading the opponent.', differs: 'Cards are split to win geishas’ favour.' },
  ],
});

export const moneyBug = bg1Game('money-and-bug-game', 'semi', '10', ['russianRoulette', 'hitStay', 'indianPoker'], {
  meta: {
    title: '돈·벌레 게임 규칙 — 피의 게임 시즌1 세미파이널, 돈 카드와 벌레 카드를 뒤집는 2인 1조 내기',
    description: '피의 게임 시즌1 세미파이널 돈·벌레 게임의 규칙을 정리했어요. 2인 1조 세 팀, 돈 카드 3장과 벌레 카드 1장, 카드 추가·베팅·패스, 선언한 수만큼 뒤집기, 첫 장은 내 카드, 벌레가 나오면 실패와 카드 몰수, 20점 선승까지.',
    keywords: ['돈 벌레 게임', '돈·벌레 게임', '피의 게임 세미파이널', '스컬 보드게임', '피의게임1'],
  },
  title: '돈·벌레 게임 — 피의 게임 시즌1 세미파이널',
  name: '돈·벌레 게임',
  lead: '각자 돈 카드 세 장과 벌레 카드 한 장을 엎어 내요. 몇 장을 뒤집어도 벌레가 안 나올지 선언하고, 그만큼 뒤집어 돈만 나오면 성공이에요.',
  summary: '보드게임 스컬과 같은 구조의 2인 1조 블러핑 게임. 20점을 먼저 얻은 팀이 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 생존자 6명이 자유롭게 2인 1조 세 팀(A·B·C)을 만들어요. 순서는 A–B–C–A–B–C로 무작위로 정해져요.',
      '**카드**: 각자 **돈 카드 3장**, **벌레 카드 1장**. 교환·양도·폐기 불가.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '첫 카드', body: '라운드가 시작되면 모두 카드 한 장을 뒷면으로 테이블에 내요.' },
      { title: '행동', body: '차례마다 셋 중 하나를 해요. **카드 추가**(한 장 더 뒷면으로, 앞사람이 베팅을 선언했다면 불가), **베팅**(뒤집을 카드 수를 선언, 앞사람보다 많아야 하고 테이블의 카드 수를 넘을 수 없어요), **패스**(그 라운드에는 더 행동할 수 없어요).' },
      { title: '강제 베팅', body: '내 차례에 테이블에 더 올릴 카드가 없으면 반드시 베팅해야 해요.' },
      { title: '오픈', body: '베팅한 한 명만 남고 모두 패스하면, 그 사람이 선언한 수만큼 카드를 뒤집어요. **첫 장은 반드시 자기 카드**이고, 그다음은 팀과 상관없이 자유롭게 골라요.' },
      { title: '판정', body: '돈 카드만 나오면 성공해 점수를 얻어요. 벌레가 나오면 그 즉시 실패하고, 카드 한 장을 무작위로 몰수당해요. 몰수된 카드가 무엇인지는 공개되지 않아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 팀이 **20점**에 닿으면 끝나고, 그 팀 두 사람이 탈락 면제권 2장과 상금 2,000만 원을 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '카드를 모두 몰수당한 사람은 베팅에 참여할 수 없지만 팀원과 상의는 할 수 있어요. 두 팀원이 모두 카드를 잃으면 우승할 수 없어요.',
      '오픈 말고는 팀원이 아닌 사람의 카드를 확인하거나 공개할 수 없어요.',
      '성공했을 때 몇 점을 얻는지는 정리된 규칙에서 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '돈·벌레 게임은 보드게임 **스컬**의 2인 1조판이에요. 스컬에서 알려진 원리가 그대로 통하고, 여기에 **팀원끼리 서로의 카드를 안다**는 변수가 더해져요.' },
    { type: 'cards', items: [
      { title: '첫 장은 내 카드', body: '오픈할 때 내 카드부터 뒤집어야 하니, 내가 벌레를 깔았다면 베팅을 해도 스스로 실패해요. 그래서 벌레를 깐 사람은 베팅 경쟁을 부추기기만 하고 자신은 빠지는 것이 기본이에요. 반대로 베팅을 높이는 사람은 "내 카드는 모두 돈"이라는 신호로 읽혀요.' },
      { title: '팀원은 안전지대', body: '팀원의 카드는 서로 알 수 있으니, 내 카드 다음으로 팀원 카드를 뒤집으면 확실한 장수가 늘어나요. 두 사람이 모두 돈만 깔았다면 꽤 큰 수를 안전하게 선언할 수 있어요. 상대 팀도 이를 알기에, 팀원 카드가 많이 깔린 팀의 베팅은 의심받지 않아요.' },
      { title: '몰수는 비공개', body: '실패하면 카드 한 장이 무작위로 사라지는데, 무엇이 사라졌는지 아무도 몰라요. 벌레가 사라졌다면 그 사람은 이제 돈만 가진 안전한 카드 주인이지만, 남들은 그걸 모르니 블러핑의 무기가 하나 생겨요.' },
    ], columns: 1 },
    { type: 'p', text: '스컬과 마찬가지로 **우월 전략은 없어요.** 다만 팀 구조 때문에 "팀원 카드까지 합친 안전한 장수"를 정확히 세는 팀이 꾸준히 유리해요.' },
  ],
  similar: [
    { name: '스컬 (Skull)', players: '3–6명', alike: '꽃(돈) 카드와 해골(벌레) 카드를 엎어 놓고, 몇 장을 뒤집을지 경매로 올린 뒤 자기 카드부터 뒤집는 규칙, 실패하면 카드를 잃는 것까지 같아요.', differs: '스컬은 개인전이고, 두 번 성공하면 이겨요.' },
    { name: '라이어스 다이스 (Perudo)', players: '2–6명', alike: '숨겨진 것의 개수를 두고 점점 높게 선언하고, 확인해서 틀린 쪽이 손해를 봐요.', differs: '페루도는 주사위 눈의 개수를 두고 선언해요.' },
  ],
}, {
  meta: {
    title: 'Money and Bug Game rules — The Bloody Game season 1 semifinal',
    description: 'The rules of the Money and Bug Game (돈·벌레 게임) from The Bloody Game season 1: three teams of two, three money cards and one bug card each, adding, betting or passing, flipping the number you bid starting with your own, failing on a bug and losing a card, and first team to 20.',
    keywords: ['Money and Bug Game', 'Bloody Game semifinal', 'Skull board game', '피의 게임 돈 벌레 게임'],
  },
  title: 'Money and Bug Game — The Bloody Game season 1 semifinal',
  name: 'Money and Bug Game (돈·벌레 게임)',
  lead: 'Everyone plays face-down cards from three money cards and one bug. Bid how many you can flip without hitting a bug, then flip that many.',
  summary: 'A two-player-team bluffing game built like Skull; first team to 20 points wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: the six survivors form three free teams of two (A, B, C); the order A–B–C–A–B–C is random.',
      '**Cards**: **three money cards** and **one bug card** each; no trading.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'First card', body: 'At the start of a round everyone puts one card face down.' },
      { title: 'Actions', body: 'On your turn: **add** a card face down (not after someone has bid), **bid** a number of cards to flip (higher than the last bid, no more than are on the table), or **pass** (out for the round).' },
      { title: 'Forced bid', body: 'With no card left to add on your turn, you must bid.' },
      { title: 'Open', body: 'When all but the bidder pass, the bidder flips that many cards. **The first must be your own**; after that, any cards regardless of team.' },
      { title: 'Result', body: 'All money scores; a bug fails at once and you lose a random card, its type not announced.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first team to **20 points** wins two immunity passes and ₩20 million.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A player with no cards left cannot bid but may advise their partner; a team with both out of cards cannot win.',
      'Apart from opening, you may not look at or reveal non-teammates’ cards.',
      'How many points a success is worth could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is **Skull** for teams of two: Skull’s principles hold, plus **partners know each other’s cards**.' },
    { type: 'cards', items: [
      { title: 'Your own card first', body: 'You must flip your own cards first, so a player who laid the bug fails their own bid; they should drive the bidding up and drop out. A high bidder signals "all my cards are money".' },
      { title: 'Partners are safe ground', body: 'Partners know each other’s cards, so flipping your partner’s next adds certain cards; two all-money players can bid high safely, and rivals know it.' },
      { title: 'Secret losses', body: 'A lost card is random and unannounced. If the bug was lost, that player is now all money, but nobody else knows: a new bluffing weapon.' },
    ], columns: 1 },
    { type: 'p', text: 'As in Skull, **there is no dominant strategy**; the team that counts "safe cards including my partner’s" accurately has a steady edge.' },
  ],
  similar: [
    { name: 'Skull', players: '3–6', alike: 'Face-down flowers and skulls, bidding how many to flip, flipping your own first, and losing a card on failure: the same rules.', differs: 'It is individual, and two successes win.' },
    { name: 'Liar’s Dice (Perudo)', players: '2–6', alike: 'Escalating claims about hidden counts, checked at the end.', differs: 'Claims are about dice faces.' },
  ],
});

export const minusLadder = bg1Game('minus-ladder', 'final', '11', ['monorail', 'piggyBank', 'hitStay'], {
  meta: {
    title: '마이너스 사다리 규칙 — 피의 게임 시즌1 파이널 1라운드, 칩을 걸고 사다리를 놓는 게임',
    description: '피의 게임 시즌1 파이널 1라운드 마이너스 사다리의 규칙을 정리했어요. 4열 15칸 사다리, 지울 수 있는 빨간 선 4개와 마이너스 선 1개, 도착점 ×−1·×0·×1·×2, 비공개 칩 베팅, 사다리 설치·제거, 마지막 라운드의 동시 설치, 상위 2명 진출까지.',
    keywords: ['마이너스 사다리', '피의 게임 마이너스 사다리', '피의 게임 시즌1 파이널', '사다리 타기 게임', '피의게임1'],
  },
  title: '마이너스 사다리 — 피의 게임 시즌1 파이널 1라운드',
  name: '마이너스 사다리',
  lead: '사다리 타기의 출발점에 칩을 걸고, 라운드마다 가로선을 하나씩 놓거나 지워 길을 바꿔요. 도착점의 ×2, ×1, ×0, ×−1이 내 칩에 곱해져요.',
  summary: '네 명이 비공개로 칩을 걸고 사다리를 함께 바꾸는 5라운드 결승 1라운드. 상위 2명이 최종 라운드로 가요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 4명.',
      '**칩**: 기본 10개에 조력자에게 받은 추가 칩.',
      '**사다리**: 4열, 줄마다 고정점 15개. 지울 수 있는 빨간 가로선 4개와 지울 수 없는 **마이너스 선** 1개가 처음부터 있어요.',
      '**도착점**: ×−1, ×0, ×1, ×2 네 가지(어느 열이 무엇인지는 숨겨져 있어요).',
      '**순서**: 10일차까지 개인 자금이 가장 적은 사람부터 라운드마다 진행 순서를 정해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '칩 베팅', body: '원하는 출발점에 원하는 만큼 칩을 걸어요. 베팅은 비공개예요.' },
      { title: '아이템', body: '1,000만 원으로 칩 1개를 사거나, 한 도착점의 연산을 확인할 수 있어요. 횟수 제한은 없어요.' },
      { title: '사다리', body: '그 라운드에 주어진 가로선 하나를 놓거나, 칩 1개를 써서 빨간 선 하나를 지워요. 둘 중 하나만 할 수 있고, 다른 선과 고정점이 겹치게 놓을 수 없어요. 설치 현황은 공개돼요.' },
      { title: '5라운드', body: '마지막 라운드는 순서를 추첨하고, 앞사람의 설치를 볼 수 없어요. 같은 고정점에 겹친 선은 라운드가 끝날 때 사라져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '사다리를 타서 **"건 칩 수 × 도착점 연산"의 합**이 내 점수예요. 가는 길에 마이너스 선을 지나면 그 연산에 ×−1이 더해져요.',
      '상위 2명이 최종 라운드(러닝 퍼즐)에 나가요. 동점이면 지원한 조력자가 많은 사람이 앞서요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드마다 칩을 더 걸 수 있어서, 마지막에 크게 거는 것도 가능해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '마이너스 사다리는 **공용 경로를 네 사람이 함께 바꾸는** 게임이에요. 내 칩이 어디로 가는지는 남의 선 하나로 뒤집혀요.' },
    { type: 'cards', items: [
      { title: '선 하나는 두 열을 바꾼다', body: '사다리 타기에서 가로선 하나는 이웃한 두 출발점의 도착을 맞바꿔요. 그래서 남이 어디에 걸었는지 모르더라도, 내가 건 출발점이 ×2로 가게 선을 놓는 것은 다른 누군가의 길을 반드시 바꿔요. 베팅이 비공개라 상대의 선이 나를 노린 것인지 아닌지 알 수 없어요.' },
      { title: '마이너스 선의 의미', body: '지울 수 없는 마이너스 선을 지나는 길은 결과가 뒤집혀요. ×2로 가더라도 마이너스 선을 지났다면 ×−2가 되고, ×−1로 가는 길이 마이너스 선을 지나면 오히려 ×1이 돼요. 그래서 "어느 도착점인가"와 "마이너스 선을 지나는가"를 함께 계산해야 해요.' },
      { title: '마지막 라운드의 어둠', body: '5라운드에는 서로의 설치를 못 보고, 겹친 선은 사라져요. 4라운드까지 만든 길이 마지막에 무너질 수 있어, 칩을 마지막 라운드에 거는 사람이 정보는 가장 많지만 선의 변화에는 가장 취약해요.' },
    ], columns: 1 },
    { type: 'p', text: '연산 정보는 돈으로 살 수 있고 베팅은 비공개라 **우월 전략은 없어요.** 칩을 여러 출발점에 나눠 거는 것은 위험을 줄이지만, 상위 2명 안에 들려면 어느 정도의 집중이 필요해요.' },
  ],
  similar: [
    { name: '사다리 타기 (아미다쿠지)', players: '2명 이상', alike: '세로줄과 가로선으로 출발점과 도착점을 짝짓는 바로 그 장치예요.', differs: '보통의 사다리 타기는 결과를 숨긴 채 한 번에 정하는 놀이이고, 내기나 선 지우기가 없어요.' },
    { name: '로보 랠리 (Robo Rally)', players: '2–8명', alike: '모두의 행동이 겹쳐 한 경로의 결과가 예측과 달라지는 혼돈을 다뤄요.', differs: '로보 랠리는 로봇을 프로그래밍해 깃발을 차례로 밟는 경주예요.' },
  ],
}, {
  meta: {
    title: 'Minus Ladder rules — The Bloody Game season 1 final, round 1',
    description: 'The rules of Minus Ladder (마이너스 사다리) from The Bloody Game season 1: a four-column ladder with 15 points per column, four removable red rungs and one minus rung, endpoints of ×−1, ×0, ×1 and ×2, secret chip bets, adding and removing rungs, the blind last round, and the top two advancing.',
    keywords: ['Minus Ladder', 'Bloody Game season 1 final', 'ladder game', '피의 게임 마이너스 사다리'],
  },
  title: 'Minus Ladder — The Bloody Game season 1 final, round 1',
  name: 'Minus Ladder (마이너스 사다리)',
  lead: 'Bet chips on the starting points of a ladder and, each round, add or remove a rung to change the paths. The endpoint’s ×2, ×1, ×0 or ×−1 multiplies your chips.',
  summary: 'Four finalists secretly bet chips and reshape one shared ladder over five rounds; the top two advance.',
  setup: [
    { type: 'list', items: [
      '**Players**: the four finalists.',
      '**Chips**: 10 each plus extras from supporters.',
      '**Ladder**: four columns with 15 fixed points each; four removable red rungs and one permanent **minus rung** at the start.',
      '**Endpoints**: ×−1, ×0, ×1 and ×2 (which is where is hidden).',
      '**Order**: each round the player with the least personal funds after day 10 sets the turn order.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Bet', body: 'Put any number of chips on any starting points, secretly.' },
      { title: 'Items', body: 'For ₩10 million buy a chip or check one endpoint’s operation, without limit.' },
      { title: 'Ladder', body: 'Place the round’s rung, or spend a chip to remove a red rung; one or the other, and rungs may not share a fixed point. Placements are public.' },
      { title: 'Round 5', body: 'Order is drawn and earlier placements are hidden; rungs placed on the same point are removed at the end of the round.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Run the ladder: your score is the **sum of chips bet × endpoint operation**; passing the minus rung multiplies that path by −1.',
      'The top two go to the last round (Running Puzzle); ties go to whoever had more supporters.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Chips can be added every round, so a big last bet is possible.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Minus Ladder has **four players reshaping one shared set of paths**; one rung from someone else can reverse where your chips end up.' },
    { type: 'cards', items: [
      { title: 'One rung swaps two paths', body: 'A rung swaps the destinations of two neighbouring starts, so steering your start to ×2 always moves someone else’s path, and with secret bets you cannot tell whether a rival’s rung targets you.' },
      { title: 'The minus rung', body: 'Paths across the permanent minus rung flip sign: ×2 becomes ×−2, and ×−1 becomes ×1. Compute both the endpoint and whether you cross it.' },
      { title: 'A blind last round', body: 'In round 5 nobody sees placements and collisions vanish, so paths built over four rounds can collapse; late bettors have the most information but are most exposed to last changes.' },
    ], columns: 1 },
    { type: 'p', text: 'Endpoint information is for sale and bets are hidden, so **there is no dominant strategy**; spreading chips lowers risk, but reaching the top two needs some concentration.' },
  ],
  similar: [
    { name: 'Ghost Leg (Amidakuji)', players: '2+', alike: 'Vertical lines and rungs pair starts with ends: the same device.', differs: 'It is usually a one-shot lottery with no betting or removing rungs.' },
    { name: 'Robo Rally', players: '2–8', alike: 'Everyone’s actions interact so one path ends up somewhere unexpected.', differs: 'You program robots to race across flags.' },
  ],
}, { ko: '파이널 1라운드', en: 'Final, round 1' });

export const runningPuzzle = bg1Game('running-puzzle', 'final', '11', ['nonogram', 'binairo', 'gradation'], {
  meta: {
    title: '러닝 퍼즐 규칙 — 피의 게임 시즌1 파이널 최종 라운드, 외워 와서 맞추는 흑백 퍼즐',
    description: '피의 게임 시즌1 파이널 최종 라운드 러닝 퍼즐의 규칙을 정리했어요. 떨어진 정답존의 흑백 퍼즐을 외워 미션존에서 맞추기, 두 사람의 서로 다른 정답, 대화는 자유·몸싸움 금지, 집사 확인 뒤 트로피를 들고 종 치기까지.',
    keywords: ['러닝 퍼즐', '피의 게임 러닝 퍼즐', '피의 게임 시즌1 파이널', '피의 게임 결승', '피의게임1'],
  },
  title: '러닝 퍼즐 — 피의 게임 시즌1 파이널 최종 라운드',
  name: '러닝 퍼즐',
  lead: '멀리 떨어진 정답존에서 흑백 퍼즐을 외우고, 타일을 들고 미션존으로 달려와 똑같이 맞춰요. 기억이 흐려지면 다시 달려가야 해요.',
  summary: '흑백 퍼즐을 외워 와 맞추는 1:1 최종 라운드. 먼저 맞추고 종을 치면 우승이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 최종 진출자 2명.',
      '**정답존**: 하양과 검정으로 된 퍼즐 그림. 두 사람의 정답은 서로 달라요. 미션존에서 일정 거리 떨어져 있어요.',
      '**미션존**: 타일을 놓아 퍼즐을 완성하는 곳.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '외우기', body: '미션존에서 출발해 정답존에서 퍼즐을 외워요.' },
      { title: '맞추기', body: '타일을 들고 미션존으로 돌아와 정답 그림과 똑같이 맞춰요. 필요하면 다시 정답존에 다녀와요.' },
      { title: '확인', body: '다 맞췄으면 집사에게 확인받아요. 맞으면 집사가 우승 트로피를 건네요.' },
      { title: '종', body: '트로피를 들고 미션존의 종을 울려요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**종을 먼저 울린 사람**이 피의 게임의 최종 우승자가 되어, 파이널 1라운드에서 쓰고 남은 개인 자금에 우승 상금 1억 원을 더해 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두 사람 사이의 대화는 자유롭지만, 몸으로 방해하는 것은 금지예요.',
      '퍼즐의 크기와 타일 수는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '러닝 퍼즐은 **기억의 양과 달리기 횟수의 교환**이에요. 한 번에 많이 외우면 왕복이 줄지만, 틀린 칸이 생기면 처음부터 다시 확인해야 해요.' },
    { type: 'cards', items: [
      { title: '묶어서 외우기', body: '흑백 칸을 하나씩 외우면 금방 한계가 와요. 줄마다 "검정 세 칸, 하양 두 칸"처럼 길이로 외우거나, 그림의 모양(글자·도형)으로 외우면 한 번에 훨씬 많이 가져올 수 있어요. 노노그램의 줄 단서와 같은 원리예요.' },
      { title: '대화가 자유롭다는 것', body: '몸싸움은 금지지만 말은 자유예요. 상대의 정답은 내 것과 다르니, 말로 상대의 기억을 흐트러뜨리는 것도 규칙 안의 수예요. 반대로 귀를 닫고 내 리듬을 지키는 집중력이 중요해요.' },
      { title: '확인 전의 검토', body: '집사 확인에서 틀리면 다시 고쳐야 하니, 마지막 왕복 한 번을 "검토용"으로 쓰는 것이 결과적으로 빠를 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '두 사람의 퍼즐이 다르지만 구조는 같아 **우월 전략은 없고**, 기억 방식과 체력이 승부를 정해요.' },
  ],
  similar: [
    { name: '노노그램 (네모 로직)', players: '1명', alike: '흑백 칸으로 된 그림을 줄 단위의 길이 정보로 다뤄요.', differs: '노노그램은 단서로 그림을 추리하고, 외우거나 달릴 필요가 없어요.' },
    { name: '메모리 (같은 그림 찾기)', players: '2명 이상', alike: '본 것을 기억해 되살리는 기억력 게임이에요.', differs: '메모리는 짝을 맞추는 방식이고, 그림을 재현하지 않아요.' },
  ],
}, {
  meta: {
    title: 'Running Puzzle rules — The Bloody Game season 1 final, last round',
    description: 'The rules of the Running Puzzle (러닝 퍼즐) from The Bloody Game season 1: memorising a black-and-white puzzle in a distant answer zone and rebuilding it in the mission zone, a different answer for each player, free talk but no physical interference, and ringing the bell with the trophy.',
    keywords: ['Running Puzzle', 'Bloody Game season 1 final', '피의 게임 러닝 퍼즐'],
  },
  title: 'Running Puzzle — The Bloody Game season 1 final, last round',
  name: 'Running Puzzle (러닝 퍼즐)',
  lead: 'Memorise a black-and-white puzzle in a distant answer zone, run back with tiles and rebuild it. When memory fades, run again.',
  summary: 'The one-on-one last round: memorise, run and rebuild a black-and-white puzzle; first to ring the bell wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two remaining finalists.',
      '**Answer zone**: a black-and-white puzzle picture, different for each player, some distance from the mission zone.',
      '**Mission zone**: where tiles are laid to build the puzzle.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise', body: 'Start in the mission zone and study your puzzle in the answer zone.' },
      { title: 'Build', body: 'Carry tiles back and rebuild it exactly; return to look again as often as needed.' },
      { title: 'Check', body: 'When done, the butler checks; if correct, you receive the trophy.' },
      { title: 'Bell', body: 'Carry the trophy to the mission zone and ring the bell.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first to ring the bell** is champion, receiving the funds left after final round 1 plus ₩100 million.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Talking is allowed; physical interference is not.',
      'The puzzle size and number of tiles are not in the written rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Running Puzzle trades **how much you memorise against how often you run**: more per trip means fewer trips, but one wrong cell means rechecking.' },
    { type: 'cards', items: [
      { title: 'Chunk it', body: 'Cell by cell runs out fast; memorise rows as run lengths ("three black, two white") or the picture’s shape to carry much more per trip — the same idea as nonogram clues.' },
      { title: 'Free talk', body: 'Words are allowed, and the rival’s answer differs from yours, so talking to disrupt their memory is within the rules; holding your own rhythm matters.' },
      { title: 'Review before the check', body: 'A failed check means fixing, so spending the last trip on review can be faster overall.' },
    ], columns: 1 },
    { type: 'p', text: 'The puzzles differ but share a structure, so **there is no dominant strategy**; memory technique and stamina decide it.' },
  ],
  similar: [
    { name: 'Nonogram', players: '1', alike: 'Black-and-white pictures handled as run lengths per row.', differs: 'You deduce the picture from clues, with no memorising or running.' },
    { name: 'Memory (Concentration)', players: '2+', alike: 'Recalling what you saw.', differs: 'You match pairs rather than rebuild a picture.' },
  ],
}, { ko: '파이널 최종 라운드', en: 'Final, last round' });
