// 소사이어티 게임 2, challenges 7–11 (days 8–12): 컬러 펀치, 기억의 홀덤, 멀티 카운트, 언락 릴레이, 기억의 탑.
import { day, sg2Game } from './shared';

export const colorPunch = sg2Game('color-punch', 'main', day(8), 7, ['gradation', 'colorlink', 'hitStay'], {
  meta: {
    title: '컬러 펀치 규칙 — 소사이어티 게임2 일곱 번째 챌린지, 빠진 색을 치는 1:1 대결과 나무막대 탑',
    description: '소사이어티 게임2 일곱 번째 챌린지 컬러 펀치의 규칙을 정리했어요. 다섯 색 중 두 색 이름이 다른 색 글씨로 나오면 남는 한 색의 판넬 치기, 오답은 즉시 패배, 3연속 출전 뒤 교체, 진 팀은 30초 안에 나무막대 1개 쌓기, 탑이 무너지면 패배까지.',
    keywords: ['컬러 펀치', '소사이어티 게임2 컬러 펀치', '소사이어티게임2 일곱 번째 챌린지', '스트룹', '소사이어티 게임2 게임'],
  },
  title: '컬러 펀치 — 소사이어티 게임2 일곱 번째 챌린지',
  name: '컬러 펀치',
  lead: '화면에 색 이름 두 개가 엉뚱한 색 글씨로 나와요. 다섯 색 가운데 어디에도 쓰이지 않은 한 색을 먼저 치는 사람이 이기고, 진 팀은 흔들리는 탑에 막대를 하나 더 올려야 해요.',
  summary: '빠진 한 색을 먼저 치는 순발력 대결과, 질 때마다 높아지는 나무막대 탑 버티기.',
  setup: [
    { type: 'list', items: [
      '**신체 영역**: 마을마다 4명. 3명은 나무 큐브 위에 올라가 나무 봉으로 탑의 지지대를 만들고, 1명은 그 위에 나무막대를 쌓아요.',
      '**두뇌 영역**: 나머지 주민이 1:1 대결 "컬러 펀치"에 나서요. 대전 순서는 미리 정해 둬요.',
      '**색**: 빨강·파랑·노랑·초록·검정 다섯 가지. 가운데에 다섯 색의 판넬이 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '문제', body: '모니터에 다섯 색 중 두 색의 **이름**이 단어로 나와요. 각 단어는 제 뜻과 다른 색 글씨로 적혀 있어요.' },
      { title: '판넬 치기', body: '두 단어의 뜻과 글씨 색, 그 어디에도 해당하지 않는 남은 한 색을 찾아 그 색 판넬을 쳐요.' },
      { title: '판정', body: '정답 판넬을 먼저 친 사람이 그 라운드를 이겨요. 오답 판넬을 치면 그 자리에서 져요.' },
      { title: '탑 쌓기', body: '진 마을의 쌓기 담당은 30초 안에 지지대 위에 나무막대를 하나 더 올려요. 그 30초 동안에는 탑을 고치거나 다시 쌓을 수 있어요.' },
      { title: '교체', body: '이긴 주민은 계속 나서고, 진 마을은 다음 순서로 바꿔요. 이긴 주민도 세 번 연속 대결한 뒤에는 교체돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['한 마을의 **탑이 무너지면** 그 마을이 져요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두 단어는 모두 다섯 색 안에서 나오고, 글씨 색도 다섯 색 중 하나라서, 뜻 두 개와 글씨 색 두 개를 지우면 한 색만 남아요.',
      '탑을 고칠 수 있는 시간은 막대를 올리는 30초뿐이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '컬러 펀치는 **스트룹 효과**를 이용한 게임이에요. 사람은 글자를 읽으면 뜻이 먼저 떠올라, 글씨 색을 따로 떠올리기가 어려워요. 이 게임은 뜻 둘과 색 둘, 네 가지를 동시에 지워야 해요.' },
    { type: 'cards', items: [
      { title: '지우는 순서를 정해 두기', body: '매번 "첫 단어 뜻 → 첫 단어 색 → 둘째 단어 뜻 → 둘째 단어 색"처럼 같은 순서로 다섯 색을 하나씩 지워 나가면, 헷갈려서 오답을 치는 일이 줄어요. 다섯 색을 늘 같은 순서로 떠올리는 연습(예: 빨·파·노·초·검)도 도움이 돼요.' },
      { title: '오답은 즉시 패배', body: '느린 정답은 질 수도 있지만, 빠른 오답은 반드시 져요. 상대가 머뭇거리면 확실해질 때까지 기다리는 것이 낫고, 상대가 빠르면 위험을 감수해야 하는 구조예요.' },
      { title: '지는 것도 손해만은 아니다', body: '진 마을은 막대를 하나 더 올리는 대신 30초 동안 탑을 고칠 수 있어요. 탑이 기울어진 상태라면 이 30초가 오히려 탑을 살리기도 해요. 그래서 승패가 한 판의 대결이 아니라 **탑의 안정성**에서 갈려요.' },
      { title: '쌓기의 기본', body: '막대를 같은 방향으로만 포개면 금방 기울어요. 층마다 방향을 엇갈리게 놓는 우물 정(井)자 쌓기는 젠가처럼 무게가 고르게 퍼져 오래 버텨요. 지지대를 든 사람들의 손이 흔들리지 않게 교대 방법도 미리 정해 둬야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 두뇌 쪽 대결 실력과 신체 쪽 탑 관리가 함께 맞아야 이기는, 시즌 중반의 대표적인 혼합형 챌린지예요.' },
  ],
  similar: [
    { name: '고스트 블리츠 (Geistesblitz)', players: '2–8명', alike: '그림을 보고, 색과 모양 조건에 맞지 않는 나머지 물건을 남보다 먼저 집어요.', differs: '카드의 그림을 보고 물건을 집는 방식이고, 탑 쌓기 같은 신체 요소가 없어요.' },
    { name: '젠가 (Jenga)', players: '1명 이상', alike: '나무 막대 탑을 무너뜨리지 않고 버티는 것이 승패를 정해요.', differs: '젠가는 탑에서 막대를 빼서 위에 올리고, 대결로 차례를 정하지 않아요.' },
  ],
}, {
  meta: {
    title: 'Color Punch rules — The Society Game 2, challenge 7: hit the missing colour and keep the tower up',
    description: 'The rules of Color Punch (컬러 펀치), the seventh challenge of The Society Game 2: two colour names in other colours’ ink, hit the one colour left out of five, a wrong panel loses at once, winners rotate after three duels, losers add a stick to their tower in 30 seconds, and a fallen tower loses.',
    keywords: ['Color Punch', 'The Society Game 2', 'Stroop game', '소사이어티 게임2 컬러 펀치'],
  },
  title: 'Color Punch — The Society Game 2, challenge 7',
  name: 'Color Punch (컬러 펀치)',
  lead: 'Two colour names appear in the wrong colours’ ink. Hit the one colour of five that appears nowhere first; the losing team adds one more stick to a wobbling tower.',
  summary: 'A reflex duel for the missing colour, tied to a wooden tower that grows with every loss.',
  setup: [
    { type: 'list', items: [
      '**Strength side**: four per village — three stand on wooden cubes holding rods as the tower’s base, one stacks sticks on top.',
      '**Brain side**: everyone else plays one-on-one Color Punch in a pre-set order.',
      '**Colours**: red, blue, yellow, green and black, with a panel of each in the middle.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Question', body: 'The screen shows the **names** of two of the five colours, each printed in a colour other than its meaning.' },
      { title: 'Punch', body: 'Find the one colour that is neither word’s meaning nor ink and hit its panel.' },
      { title: 'Result', body: 'The first correct hit wins the round; hitting a wrong panel loses on the spot.' },
      { title: 'Stack', body: 'The losing village’s stacker adds one stick to the tower within 30 seconds, and may adjust or rebuild it during that time.' },
      { title: 'Rotation', body: 'Winners stay on and losers rotate in order; a winner also rotates out after three duels in a row.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['A village loses when **its tower falls**.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Both words and both inks are among the five colours, so striking out two meanings and two inks leaves exactly one.',
      'The tower can be adjusted only during those 30 seconds.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Color Punch is built on the **Stroop effect**: reading a word brings its meaning to mind before its ink colour. Here you must strike out four things at once — two meanings, two inks.' },
    { type: 'cards', items: [
      { title: 'Strike out in a fixed order', body: 'Always eliminate in the same order — first meaning, first ink, second meaning, second ink — and recall the five colours in a fixed sequence too. Fewer muddles means fewer wrong punches.' },
      { title: 'A wrong hit always loses', body: 'A slow right answer may lose; a fast wrong one always does. Wait for certainty against a hesitant opponent, take risks against a fast one.' },
      { title: 'Losing is not all bad', body: 'The losing side adds a stick but gets 30 seconds to fix its tower, which can save a leaning one. The result hinges on **tower stability**, not single duels.' },
      { title: 'Stacking basics', body: 'Sticks all laid one way soon lean; crossing each layer, Jenga-style, spreads the weight and lasts. The base holders also need a plan for steady hands.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy: duel skill and tower care must both hold up — a typical mid-season hybrid challenge.' },
  ],
  similar: [
    { name: 'Ghost Blitz (Geistesblitz)', players: '2–8', alike: 'Grab the object that matches neither the colour nor the shape shown, faster than anyone.', differs: 'You grab objects from a card picture, with no physical tower.' },
    { name: 'Jenga', players: '1+', alike: 'Keeping a wooden tower standing decides the game.', differs: 'Blocks come out of the tower and go on top; no duel decides the turns.' },
  ],
});

export const memoryHoldem = sg2Game('memory-holdem', 'main', day(9), 8, ['indianPoker', 'twoSidedPoker', 'hitStay'], {
  meta: {
    title: '기억의 홀덤 규칙 — 소사이어티 게임2 여덟 번째 챌린지, 외운 카드 위치로 하는 포커',
    description: '소사이어티 게임2 여덟 번째 챌린지 기억의 홀덤의 규칙을 정리했어요. 수건으로 물을 옮겨 칩 띄우기, 8×5로 놓인 카드 40장(A–10) 5분 암기, 공유카드 3장, 좌표로 번갈아 고르는 2장, 베팅 담당, 폴드하면 공개되지 않는 카드와 칩을 모두 가져올 때까지의 대결.',
    keywords: ['기억의 홀덤', '소사이어티 게임2 기억의 홀덤', '소사이어티게임2 여덟 번째 챌린지', '암기 포커', '소사이어티 게임2 게임'],
  },
  title: '기억의 홀덤 — 소사이어티 게임2 여덟 번째 챌린지',
  name: '기억의 홀덤',
  lead: '먼저 수건으로 물을 날라 칩을 띄워 모아요. 그 칩으로 하는 포커에서는, 뒷면만 보이는 카드 40장 가운데 외워 둔 위치를 불러 내 패를 골라요.',
  summary: '수건으로 물을 옮겨 칩을 따고, 외운 카드 위치로 패를 골라 베팅하는 2단계 챌린지.',
  setup: [
    { type: 'list', items: [
      '**칩 획득**: 홀덤 대표 3명을 뺀 주민들. 손목에 묶인 수건을 공동 수조에서 적셔 짜는 식으로, 물을 자기 팀 유리관으로 옮겨요. 유리관은 팀마다 10개, 바닥마다 칩이 1개씩 있어요.',
      '**홀덤 대표 3명**: 2명은 카드 암기와 선택, 1명은 베팅을 맡아요.',
      '**카드**: J·Q·K와 조커를 뺀 40장(스페이드·다이아몬드·하트·클로버, A–10). 가로 1–8, 세로 A–E 좌표로 8×5에 놓여요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '칩 띄우기', body: '유리관에 물이 차 칩이 떠오르면 그 칩을 얻어요. 한 팀이 칩 10개를 모두 얻으면 칩 획득이 끝나고, 두 팀은 그때까지 얻은 칩으로 홀덤을 해요.' },
      { title: '카드 암기', body: '카드 담당 2명이 모니터에 공개된 카드 40장의 무늬·숫자·위치를 5분 동안 외워요.' },
      { title: '기본 베팅과 공유카드', body: '판마다 베팅 담당이 칩 1개를 먼저 걸고, 모두에게 공유카드 3장이 공개돼요.' },
      { title: '카드 고르기', body: '모니터에는 카드 뒷면과 좌표만 보여요. 선 베팅 팀부터 한 명씩 번갈아 좌표를 불러, 공유카드 3장과 합쳐 높은 족보가 되도록 2장을 골라요.' },
      { title: '베팅', body: '고른 카드는 베팅 담당에게 전달되고 베팅이 시작돼요. 이긴 팀이 그 판의 칩을 모두 가져가요.' },
      { title: '공개', body: '판이 끝나면 그 판에 쓰인 카드의 앞면을 카드 담당에게도 보여 줘요. 단, 베팅 포기로 끝난 판은 공개하지 않아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['한 팀이 상대의 **칩을 모두** 가져오면 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '족보는 J·Q·K가 없다는 점을 빼면 일반 포커와 같아요. 패는 공유카드 3장 + 고른 2장, 모두 5장이에요.',
      '나무위키 정리에 따르면 이 챌린지에서는 같은 족보일 때 무늬에도 순서가 있었어요. 무늬의 정확한 순서는 여기 적지 않았어요.',
      '카드를 고를 때 부른 좌표는 모두가 들을 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '기억의 홀덤은 이름은 포커지만, 실제로는 **기억으로 하는 드래프트**예요. 일반 홀덤에서는 받은 카드가 운이지만, 여기서는 40장의 위치를 정확히 외울수록 원하는 카드를 고를 수 있어요.' },
    { type: 'cards', items: [
      { title: '완벽한 기억이면 최소 트리플', body: '숫자마다 4장씩 있으니, 공유카드 중 하나와 같은 숫자 2장을 고르면 언제나 트리플이 돼요. 공유카드에 같은 숫자가 2장 있으면 남은 2장으로 포카드도 노릴 수 있어요. 그래서 이 게임의 실력은 "트리플보다 높은 패를 남보다 먼저 집을 수 있는가"에서 갈려요.' },
      { title: '번갈아 고르기의 수읽기', body: '한 장씩 번갈아 고르니, 내가 원하는 카드가 상대에게도 필요하면 먼저 집어 막을 수 있어요. 먼저 고르는 팀은 가장 강한 조합의 핵심 카드를 가져가고, 나중 팀은 남은 것 중 최선을 찾거나 상대의 완성 카드를 빼앗아야 해요.' },
      { title: '무엇부터 외울까', body: '5분에 40장을 다 외우기 어렵다면, 높은 숫자(10·9·A 등)부터 확실히 외우는 편이 효율적이에요. 높은 트리플은 자주 쓸모가 있어요. 두 사람이 나눠서 외우되(예: 앞 네 줄과 뒤 네 줄), 서로 겹치는 부분을 조금 두면 실수를 줄일 수 있어요.' },
      { title: '좌표는 공개 정보', body: '상대가 부른 좌표는 모두에게 들려요. 그 자리에 무슨 카드가 있었는지 외워 둔 사람은 상대의 패를 거의 알 수 있어요. 판이 끝날 때 공개되는 앞면도 기억을 보충해 줘요. 반대로 베팅 포기로 끝내면 카드가 공개되지 않으니, 정보를 숨기고 싶을 때 쓸 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 칩을 많이 띄운 팀이 베팅 여유를 가지지만, 결국 **암기한 양과 정확도**가 판마다의 우위를 정해요. 베팅 담당은 상대가 부른 좌표에서 상대 패를 추측해 크게 걸지, 접을지를 판단해야 해요.' },
  ],
  similar: [
    { name: '텍사스 홀덤 (Texas Hold\'em)', players: '2–10명', alike: '공유카드와 내 카드로 5장 족보를 만들고, 베팅으로 칩을 따요.', differs: '홀덤은 받은 카드가 운이고 공유카드가 5장이에요. 기억의 홀덤은 공유카드 3장에, 내 카드를 기억으로 골라요.' },
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '뒤집힌 카드의 위치를 기억해 원하는 카드를 찾아요.', differs: '짝을 맞추는 게임이라 족보와 베팅이 없어요.' },
  ],
}, {
  meta: {
    title: 'Memory Hold’em rules — The Society Game 2, challenge 8: poker with memorised card positions',
    description: 'The rules of Memory Hold’em (기억의 홀덤), the eighth challenge of The Society Game 2: wringing towels to float chips, forty cards (A–10) on an 8×5 grid memorised in five minutes, three community cards, two cards picked by coordinates in turn, a betting player, folds that keep cards hidden, until one team has every chip.',
    keywords: ['Memory Holdem', 'The Society Game 2', 'memory poker', '소사이어티 게임2 기억의 홀덤'],
  },
  title: 'Memory Hold’em — The Society Game 2, challenge 8',
  name: 'Memory Hold’em (기억의 홀덤)',
  lead: 'First, carry water with towels to float your chips. Then play poker where you choose your cards by calling the positions you memorised among forty face-down cards.',
  summary: 'A two-stage challenge: towel-wringing for chips, then poker with cards picked from memory.',
  setup: [
    { type: 'list', items: [
      '**Chip stage**: everyone but the three hold’em players soaks and wrings towels tied to their wrists, moving water from a shared tank into their team’s glass tubes — ten per team, each with a chip at the bottom.',
      '**Hold’em players**: two memorise and pick cards, one bets.',
      '**Cards**: forty (spades, diamonds, hearts, clubs; A–10 — no J, Q, K or jokers), laid out 8×5 with columns 1–8 and rows A–E.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Float the chips', body: 'A chip is won when its tube fills and it floats up. When one team has all ten, the stage ends and both play hold’em with what they have.' },
      { title: 'Memorise', body: 'The two card players study the suit, number and position of all forty cards for five minutes.' },
      { title: 'Ante and flop', body: 'Each hand the bettor antes one chip and three community cards are revealed to all.' },
      { title: 'Pick', body: 'The screen now shows only card backs and coordinates. Starting with the first-betting team, one player at a time calls a coordinate, choosing two cards that make the best hand with the three community cards.' },
      { title: 'Bet', body: 'The chosen cards go to the team’s bettor and betting begins; the winner takes the pot.' },
      { title: 'Reveal', body: 'After each hand the cards used are shown face up to the card players too — except when the hand ended with a fold.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['A team wins by taking **all** of the other team’s chips.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Hand rankings are standard poker apart from the missing J, Q and K; a hand is the three community cards plus the two picked.',
      'According to the fan wiki, suits also ranked when hands tied in this challenge; the exact order is left out here.',
      'Every coordinate called while picking is heard by everyone.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is called hold’em, but it is really **a draft played from memory**: the better you know the forty positions, the more you choose your cards instead of being dealt them.' },
    { type: 'cards', items: [
      { title: 'Perfect memory means trips at least', body: 'With four of each number, picking the two that match any community card always gives three of a kind; a paired board lets you go for four of a kind. Skill shows in grabbing something better than trips before the other team does.' },
      { title: 'Alternating picks', body: 'Picks alternate one card at a time, so if your card is also theirs you can take it first. The first picker takes the key card of the strongest combination; the second must find the best of the rest or steal the opponent’s finisher.' },
      { title: 'What to learn first', body: 'If forty cards in five minutes is too many, nail the high numbers (10, 9, A) first — high trips come up often. Split the grid between the two players (say, four columns each) with a small overlap to catch errors.' },
      { title: 'Coordinates are public', body: 'Everyone hears the other team’s calls; anyone who knows those positions practically knows their hand. Revealed cards after each hand refresh your memory — and folding keeps your own cards secret when that matters.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy. More chips give the bettor room, but **how much you memorised, and how accurately**, decides each hand; the bettor must read the rival’s calls to judge whether to push or fold.' },
  ],
  similar: [
    { name: "Texas Hold'em", players: '2–10', alike: 'Make a five-card hand from community and own cards and bet for chips.', differs: 'Your cards are dealt by luck and there are five community cards; here there are three and you pick your own by memory.' },
    { name: 'Memory (Concentration)', players: '1+', alike: 'Remember where face-down cards are to find the one you want.', differs: 'A pairing game with no hands or betting.' },
  ],
});

export const multiCount = sg2Game('multi-count', 'main', day(10), 9, ['nemoCount', 'equationSignal', 'hexagon'], {
  meta: {
    title: '멀티 카운트 규칙 — 소사이어티 게임2 아홉 번째 챌린지, 밀어내기 뒤 블록 개수와 숫자 합 맞히기',
    description: '소사이어티 게임2 아홉 번째 챌린지 멀티 카운트의 규칙을 정리했어요. 방어벽을 사이에 둔 1:1 밀어내기, 이긴 사람만 얻는 문제 기회, 화면 왼쪽 입체 블록의 개수와 오른쪽에 바뀌는 숫자들의 합을 30초 안에, 7라운드 승점제와 블록을 빨리 세는 법까지.',
    keywords: ['멀티 카운트', '소사이어티 게임2 멀티 카운트', '소사이어티게임2 아홉 번째 챌린지', '블록 개수 세기', '소사이어티 게임2 게임'],
  },
  title: '멀티 카운트 — 소사이어티 게임2 아홉 번째 챌린지',
  name: '멀티 카운트',
  lead: '방어벽을 사이에 두고 상대를 나무 바닥 밖으로 밀어내야 문제를 풀 기회가 와요. 문제는 두 가지를 동시에 세는 것, 입체 블록의 개수와 지나가는 숫자들의 합이에요.',
  summary: '1:1 밀어내기로 문제 기회를 얻고, 블록 개수와 숫자 합을 함께 맞히는 7라운드 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 라운드마다 마을별 1명. 출전 순서는 미리 정해 둬요.',
      '**경기장**: 나무 바닥 위에 방어벽이 있고, 두 사람이 방어벽을 사이에 두고 마주 서요.',
      '**문제 화면**: 왼쪽에 입체 블록 그림, 오른쪽에 차례로 바뀌며 나타나는 숫자들.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '밀어내기', body: '시작과 함께 방어벽을 상대 쪽으로 밀어, 그 뒤에 있는 상대를 나무 바닥 밖으로 밀어내요.' },
      { title: '문제 기회', body: '먼저 상대를 밀어낸 사람만 문제를 풀 수 있어요.' },
      { title: '멀티 카운트', body: '문제가 공개되면 30초 안에 왼쪽 입체 블록의 **총개수**와 오른쪽에 나타난 숫자들의 **총합**을 말해요.' },
      { title: '7라운드', body: '라운드가 진행될수록 문제가 어려워져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '정답이면 승점 1점, 오답이면 점수 없이 다음 라운드로 가요.',
      '7라운드 뒤 **승점이 높은** 마을이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '밀어내기에서 진 쪽은 그 라운드에 문제를 풀 수 없어요. 문제를 틀려도 상대에게 기회가 넘어가지 않아요.',
      '블록 개수와 숫자 합, 두 가지를 모두 맞혀야 정답이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '멀티 카운트는 **몸으로 기회를 따고 머리로 점수를 내는** 구조예요. 힘센 사람은 기회를 따도 문제를 틀릴 수 있고, 계산이 빠른 사람은 기회를 못 딸 수 있어요. 그래서 승부는 출전 순서에서 먼저 갈려요.' },
    { type: 'cards', items: [
      { title: '순서 싸움', body: '상대 순서를 모른 채 내 순서를 정하니, 일종의 가위바위보예요. 내 마을의 계산 잘하는 주민이 상대의 약한 몸싸움 상대와 만나면 득점, 상대의 힘센 주민과 만나면 기회 자체가 사라져요. 문제는 뒤로 갈수록 어려워지니, 계산 강자를 후반에 둘지도 함께 고민해야 해요.' },
      { title: '두 가지를 동시에 세기', body: '숫자는 차례로 바뀌며 지나가니 놓치면 다시 볼 수 없어요. 그래서 **숫자 합을 먼저**, 실시간으로 더하고, 블록은 화면에 남아 있다면 그다음에 세는 편이 안전해요. 누적합을 입으로 작게 되뇌면 블록을 세는 동안에도 잊지 않아요.' },
      { title: '블록 빨리 세기', body: '층마다 윗면에서 보이는 블록 수를 세고 층 수로 더하거나, 블록이 들어갈 가장 작은 직육면체를 떠올려 빈 칸을 빼는 방법이 있어요. 계단 모양처럼 규칙이 있는 부분은 반복 단위만 세고 곱해요. 그림에서 보이지 않는 받침 블록이 있는지(떠 있는 블록은 없다는 전제) 꼭 생각해야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 다만 오답에 벌칙이 없으니, 기회를 얻었다면 시간 안에 반드시 답을 말하는 것이 기본이에요.' },
  ],
  similar: [
    { name: '할리갈리 (Halli Galli)', players: '2–6명', alike: '빠르게 바뀌는 그림 속 숫자를 세어 더하고, 몸으로 먼저 반응해야 해요.', differs: '과일이 정확히 5개일 때 종을 치는 게임이고, 밀어내기 같은 몸싸움이 없어요.' },
    { name: '메이크 앤 브레이크 (Make \'n\' Break)', players: '2–4명', alike: '입체 블록 구조를 그림으로 보고 빠르게 파악해야 해요.', differs: '그림대로 블록을 직접 쌓는 게임이고, 개수를 세어 답하지 않아요.' },
  ],
}, {
  meta: {
    title: 'Multi Count rules — The Society Game 2, challenge 9: push your rival out, then count blocks and sum numbers',
    description: 'The rules of Multi Count (멀티 카운트), the ninth challenge of The Society Game 2: one-on-one shoving across a barrier, only the winner gets the question, the total of 3D blocks on the left plus the sum of changing numbers on the right in 30 seconds, seven rounds on points, and quick ways to count blocks.',
    keywords: ['Multi Count', 'The Society Game 2', 'block counting', '소사이어티 게임2 멀티 카운트'],
  },
  title: 'Multi Count — The Society Game 2, challenge 9',
  name: 'Multi Count (멀티 카운트)',
  lead: 'Push your rival off the wooden floor across a barrier to earn the question — then count two things at once: the blocks in a 3D picture and the sum of numbers flashing by.',
  summary: 'Win a shoving bout for the question, then give both a block count and a running sum; seven rounds.',
  setup: [
    { type: 'list', items: [
      '**Players**: one per village each round, in a pre-set order.',
      '**Arena**: a barrier on a wooden floor, the two players facing each other across it.',
      '**Question screen**: a 3D block picture on the left, numbers appearing one after another on the right.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Shove', body: 'Push the barrier towards your rival to drive them off the wooden floor.' },
      { title: 'Earn the question', body: 'Only the player who pushes the other out first may answer.' },
      { title: 'Multi count', body: 'Within 30 seconds, give the **number of blocks** on the left and the **sum of the numbers** that appeared on the right.' },
      { title: 'Seven rounds', body: 'Questions get harder as the rounds go on.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'A correct answer is 1 point; a wrong one scores nothing and play moves on.',
      'After seven rounds the village with **more points** wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The loser of the shove cannot answer that round, and a wrong answer does not pass the chance over.',
      'Both the block count and the sum must be right.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Multi Count **wins the chance with the body and scores with the head**. Strong players may earn the chance and miss; quick counters may never get it. So the order is decided before anyone shoves.' },
    { type: 'cards', items: [
      { title: 'The order game', body: 'You set your order blind to theirs, a kind of rock-paper-scissors: your best counter against their weakest shover scores, against their strongest gets nothing. Questions get harder, so whether to save counters for late rounds is part of it.' },
      { title: 'Counting two things', body: 'Numbers pass and do not come back, so **add them first**, live, and count blocks afterwards if the picture stays up. Muttering the running total keeps it while you count.' },
      { title: 'Counting blocks fast', body: 'Count the tops visible on each layer and add by layer, or picture the smallest box that holds the shape and subtract the gaps; for regular parts like stairs, count one unit and multiply. Always think about hidden supporting blocks — nothing floats.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy, but with no penalty for a wrong answer, always say something before time runs out.' },
  ],
  similar: [
    { name: 'Halli Galli', players: '2–6', alike: 'Count fast-changing fruit and react physically before the others.', differs: 'You ring the bell at exactly five fruit; no shoving.' },
    { name: "Make 'n' Break", players: '2–4', alike: 'Read a 3D block structure from a picture quickly.', differs: 'You build the structure with real blocks rather than counting them.' },
  ],
});

export const unlockRelay = sg2Game('unlock-relay', 'main', day(11), 10, ['equationTower', 'equationSignal', 'monorail'], {
  meta: {
    title: '언락 릴레이 규칙 — 소사이어티 게임2 열 번째 챌린지, 얼음 깨기·수식 주사위·체스판 만들기',
    description: '소사이어티 게임2 열 번째 챌린지 언락 릴레이의 규칙을 정리했어요. 미션상자 세 개를 차례로 여는 릴레이, 얼음 속 비밀번호, 같은 색 주사위 3개로 네 면의 수식 값을 맞추는 수식 주사위, 조각으로 정사각형 체스판 만들기와 체스판 퍼즐의 수학적 함정까지.',
    keywords: ['언락 릴레이', '소사이어티 게임2 언락 릴레이', '소사이어티게임2 열 번째 챌린지', '수식 주사위', '체스판 퍼즐', '소사이어티 게임2 게임'],
  },
  title: '언락 릴레이 — 소사이어티 게임2 열 번째 챌린지',
  name: '언락 릴레이',
  lead: '자물쇠가 달린 미션상자 세 개를 차례로 열어요. 얼음 속 비밀번호, 주사위 수식, 그리고 체스판 퍼즐까지 먼저 끝낸 마을이 이겨요.',
  summary: '얼음 깨기 → 수식 주사위 → 체스판 만들기, 비밀번호를 넘겨받으며 잇는 3단계 릴레이.',
  setup: [
    { type: 'list', items: [
      '**얼음 깨기**: 2명. 상자 안에 망치, 얼음 안에 다음 비밀번호.',
      '**수식 주사위**: 3명. 빨강·노랑·파랑 주사위가 3개씩, 모두 9개. 각 면에는 1–9의 눈이나 사칙연산 기호(+, −, ×, ÷)가 있어요.',
      '**체스판 만들기**: 1명. 상자 안의 타일로 정사각형 체스판을 만들어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '얼음 깨기', body: 'LED 화면에 나온 비밀번호로 첫 상자를 열고, 안의 망치로 얼음을 깨요. 얼음 속 종이의 비밀번호를 큰 소리로 외쳐 다음 주자에게 전해요.' },
      { title: '수식 주사위', body: '전달받은 번호로 둘째 상자를 열어요. 같은 색 주사위 3개를 쌓아, 탑의 각 옆면에 나타나는 수식의 값이 모두 같아지게 만들어요. 세 색 모두 완성하면, 탑 윗면의 숫자를 테이블의 색깔 수식에 넣어 다음 비밀번호 네 자리 중 앞 세 자리를 구해 외쳐요.' },
      { title: '체스판 만들기', body: '마지막 주자가 셋째 상자를 열고, 안의 타일로 정사각형 체스판을 만들어요. 완성하면 깃발을 들어 확인받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['체스판을 **먼저 완성해 확인받은** 마을이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '체스판 타일의 모양은 미리 알려 주지 않았어요.',
      '셋째 상자 비밀번호의 마지막 한 자리를 어떻게 구하는지는 공개된 규칙 설명에 나오지 않아 적지 않았어요.',
      '나무위키 정리에 따르면 체스판 조각은 1×3 막대 21개와 1×1 한 칸 1개였어요(8×8 = 64칸).',
    ] },
  ],
  analysis: [
    { type: 'p', text: '언락 릴레이는 세 단계가 **직렬**로 이어져, 한 단계의 지연이 그대로 쌓여요. 첫 단계는 힘, 둘째는 탐색, 셋째는 발상이에요.' },
    { type: 'cards', items: [
      { title: '수식 주사위는 기호부터', body: '주사위 탑의 옆면은 "숫자 · 기호 · 숫자"처럼 읽히는 수식이에요. 숫자 면은 많고 기호 면은 적으니, **기호가 어느 면에 올지 먼저 정하고** 그에 맞는 숫자를 찾는 편이 경우의 수가 훨씬 적어요. 또 비밀번호 한 자리가 되려면 윗면 숫자가 수식에 들어가 0–9가 나와야 하니, 그 조건으로도 후보를 줄일 수 있어요. 세 색을 세 사람이 나눠 맡으면 동시에 풀 수 있어요.' },
      { title: '체스판 퍼즐의 함정', body: '64칸을 1×3 막대 21개(63칸)와 1×1 한 칸으로 채워야 해요. 막대만 먼저 깔다 보면 남는 자리가 한 칸이 아니라 엉뚱한 모양이 되기 쉬워요. 수학적으로 이 퍼즐은 **1×1 칸이 놓일 수 있는 자리가 정해져 있어요**. 8×8 판을 세 가지 색으로 대각선 따라 칠해 보면, 막대 하나는 늘 세 색을 하나씩 덮으니, 한 칸짜리는 개수가 하나 더 많은 색에만 놓일 수 있어요. 방향을 바꿔 칠해도 성립해야 하니, 결국 가운데 쪽의 네 자리(가장자리에서 셋째 줄·셋째 칸 교차점들) 가운데 하나에만 놓을 수 있어요. 한 칸짜리를 그중 한 곳에 먼저 놓으면 나머지 막대는 비교적 쉽게 채워져요.' },
      { title: '사람 배치', body: '수식 주사위는 세 명이 함께 풀 수 있는 유일한 단계라, 다른 단계에 자신 없는 주민을 이곳에 모으는 것이 합리적이에요. 마지막 주자 한 명에게 발상 퍼즐이 걸려 있으니, 침착하게 경우를 따질 줄 아는 사람이 맡아야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없지만, 체스판 단계는 **알고 있으면 거의 바로 풀리는** 퍼즐이라 미리 수학적 성질을 아는 쪽이 크게 유리해요.' },
  ],
  similar: [
    { name: '언락! (Unlock!)', players: '1–6명', alike: '카드로 하는 방탈출 게임으로, 퍼즐을 풀어 얻은 숫자로 다음 단계를 열어요.', differs: '협동으로 한 팀이 시간과 싸우는 게임이고, 상대 팀이나 몸 쓰는 미션이 없어요.' },
    { name: '카타미노 (Katamino)', players: '1–2명', alike: '정해진 조각으로 직사각형 판을 빈틈없이 채우는 퍼즐이에요.', differs: '5칸짜리 펜토미노를 쓰고, 판 크기를 바꿔 가며 난이도를 조절해요.' },
  ],
  note: '체스판 조각의 구성은 나무위키 정리에만 있어요.',
}, {
  meta: {
    title: 'Unlock Relay rules — The Society Game 2, challenge 10: ice, equation dice and a chessboard puzzle',
    description: 'The rules of Unlock Relay (언락 릴레이), the tenth challenge of The Society Game 2: three locked mission boxes in turn, a code frozen in ice, stacking same-colour dice so every side shows an equation of the same value, building a square chessboard from tiles, and the mathematical catch in the chessboard puzzle.',
    keywords: ['Unlock Relay', 'The Society Game 2', 'equation dice', 'chessboard tiling puzzle', '소사이어티 게임2 언락 릴레이'],
  },
  title: 'Unlock Relay — The Society Game 2, challenge 10',
  name: 'Unlock Relay (언락 릴레이)',
  lead: 'Open three locked mission boxes in turn: a code in a block of ice, an equation made of dice, then a chessboard puzzle. The first village through wins.',
  summary: 'A three-leg relay — break the ice, solve the equation dice, assemble the chessboard — passing codes along.',
  setup: [
    { type: 'list', items: [
      '**Ice breaking**: two players; a hammer in the box, the next code inside the ice.',
      '**Equation dice**: three players; nine dice, three each of red, yellow and blue, each face a 1–9 pip count or an operator (+, −, ×, ÷).',
      '**Chessboard**: one player; build a square chessboard from the tiles in the box.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Ice', body: 'Open the first box with the code on the LED screen and smash the ice with the hammer inside; shout the code found in the ice to the next leg.' },
      { title: 'Equation dice', body: 'Open the second box. Stack three dice of one colour so that every side of the tower shows an equation with the same value. With all three colours done, put each tower’s top number into the colour formula on the table to get the first three digits of the next four-digit code, and shout them.' },
      { title: 'Chessboard', body: 'The last player opens the third box and builds a square chessboard from its tiles, then raises the flag for a check.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['The first village to **complete and confirm** its chessboard wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The tile shapes were not announced in advance.',
      'How the fourth digit of the last code was found is not in the published rules and is left out.',
      'According to the fan wiki the chessboard pieces were twenty-one 1×3 bars and one 1×1 square (8×8 = 64 cells).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The three legs run **in series**, so every delay adds up. The first leg is strength, the second is search, the third is insight.' },
    { type: 'cards', items: [
      { title: 'Dice: operators first', body: 'Each side of the tower reads like "number, operator, number". There are many number faces and few operator faces, so **fix where the operators go first** and then find numbers to match — far fewer cases. The top number must also produce a single digit 0–9 in the colour formula, which trims candidates further. Three players can take a colour each.' },
      { title: 'The chessboard catch', body: 'Sixty-four cells must be covered by twenty-one 1×3 bars (63 cells) and one single square. Laying bars first usually leaves an awkward gap. Mathematically, **the single square has only a few possible spots**: colour the board in three colours along the diagonals and every bar covers one of each, so the single square must sit on the colour that has one extra; requiring this for both diagonal directions leaves only four spots, where the third row and third column from each edge cross. Place the single square on one of them first and the bars fall in easily.' },
      { title: 'Who goes where', body: 'Equation dice is the one leg three people can share, so it is the natural place for those weak elsewhere. The last leg is a lone insight puzzle — give it to someone calm who checks cases.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy, but the chessboard is a puzzle that **falls almost instantly if you know the trick**, so knowing its mathematics beforehand is a big edge.' },
  ],
  similar: [
    { name: 'Unlock!', players: '1–6', alike: 'A card-based escape room: solve puzzles for numbers that open the next stage.', differs: 'One cooperative team racing a clock, with no rival team or physical tasks.' },
    { name: 'Katamino', players: '1–2', alike: 'Fill a rectangle exactly with a given set of pieces.', differs: 'It uses five-cell pentominoes and varies the board size for difficulty.' },
  ],
  note: 'The chessboard piece set comes only from the fan wiki.',
});

export const towerOfMemory = sg2Game('tower-of-memory', 'main', day(12), 11, ['hexagon', 'gradation', 'hiddenWord'], {
  meta: {
    title: '기억의 탑 규칙 — 소사이어티 게임2 열한 번째 챌린지, 줄로 끌어올리고 그림 타일 찾기',
    description: '소사이어티 게임2 열한 번째 챌린지 기억의 탑의 규칙을 정리했어요. A–F 그림 6개를 3초씩 반복해 보는 두뇌 대표 2명, 줄을 당겨 탑 꼭대기로 올리는 신체 영역, 1–50번 그림 타일 50개 중 같은 그림 찾기, 정답판 표시, 오답 1분 금지까지.',
    keywords: ['기억의 탑', '소사이어티 게임2 기억의 탑', '소사이어티게임2 열한 번째 챌린지', '그림 찾기', '소사이어티 게임2 게임'],
  },
  title: '기억의 탑 — 소사이어티 게임2 열한 번째 챌린지',
  name: '기억의 탑',
  lead: '두뇌 대표 두 명이 그림 여섯 개를 외우면, 나머지 주민이 줄을 당겨 둘을 탑 꼭대기로 올려 보내요. 꼭대기의 그림 타일 50개 가운데 같은 그림을 찾아 번호를 맞혀요.',
  summary: '그림 6개를 외워 탑 위의 그림 50개 중 짝을 찾는, 줄 당기기와 이어진 암기 레이스.',
  setup: [
    { type: 'list', items: [
      '**두뇌 영역**: 마을마다 대표 2명이 그림을 외우고 찾아요.',
      '**신체 영역**: 나머지 주민이 몸에 연결된 줄을 당겨 두뇌 대표를 탑 위로 올려요.',
      '**문제 그림**: 오른쪽 위에 A–F가 적힌 그림 6개. 한 장에 3초씩 알파벳 순서로 되풀이해 보여 줘요.',
      '**그림 타일**: 탑 꼭대기에 1–50번이 적힌 그림 타일 50개.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '그림 보기', body: '두뇌 대표들이 문제 테이블에서 A–F 그림을 봐요.' },
      { title: '끌어올리기', body: '신체 영역 주민들이 줄을 당겨 두뇌 대표 2명을 기억의 탑 꼭대기로 올려요.' },
      { title: '찾기', body: '꼭대기의 타일 50개 중에서 A–F와 같은 그림 6개를 찾아요.' },
      { title: '표시하기', body: '찾았다면 탑에서 내려와 정답판에 그 타일의 번호를 표시해요. 문제 그림은 언제든 다시 볼 수 있어요.' },
      { title: '정답 확인', body: 'A–F 여섯 칸을 모두 채우면 "정답"을 외치고 깃발을 들어 확인받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['여섯 개를 모두 맞혀 **먼저 정답을 확인받은** 마을이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '오답이면 1분 동안 정답을 낼 수 없어요. 몇 개가 틀렸는지는 알려 주지 않아요.',
      '나무위키 정리에 따르면 그림은 서로 아주 비슷한 고양이 그림이었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '기억의 탑은 **문제를 다시 볼 수 있는 암기 게임**이에요. 그래서 "외우기"보다 "오가는 횟수 줄이기"가 실제 과제예요. 탑을 오르내릴 때마다 신체 영역의 힘과 시간이 들어요.' },
    { type: 'cards', items: [
      { title: '특징 하나가 아니라 둘', body: '비슷한 그림이 많으면 특징 하나(예: 무늬 하나)로는 후보가 여럿 남아요. 그림마다 **서로 다른 특징 두세 개**를 외워 가면, 탑 위에서 후보를 바로 하나로 좁힐 수 있어요.' },
      { title: '두 사람의 분담', body: '두 사람이 여섯 장을 3장씩 나눠 맡으면 외울 양이 절반이 돼요. 대신 서로의 그림도 한 가지 특징씩은 알아 두면, 한 사람이 헷갈릴 때 확인해 줄 수 있어요.' },
      { title: '후보를 번호로 적어 오기', body: '확신이 없으면 후보 타일 번호를 두세 개씩 기억해 내려와, 문제 그림과 다시 비교해 고르는 것이 좋아요. 그림을 다시 볼 수 있다는 규칙은 이렇게 써야 가치가 있어요.' },
      { title: '오답 1분의 무게', body: '틀린 개수를 알려 주지 않으니, 1분 벌칙 뒤에도 어느 칸이 틀렸는지 찾아야 해요. 그래서 한 칸이라도 애매하면 제출 전에 한 번 더 확인하는 것이, 찍어 내는 것보다 대개 빨라요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 신체 영역이 빨리 올려 주고, 두뇌 대표가 오가는 횟수를 줄이는 팀이 이겨요.' },
  ],
  similar: [
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '여러 그림 가운데 같은 그림을 남보다 빨리 찾아요.', differs: '두 카드에 공통인 그림 하나를 찾는 순발력 게임이고, 암기가 필요 없어요.' },
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '그림을 기억해 같은 그림을 찾아내요.', differs: '판의 카드를 직접 뒤집어 짝을 맞추고, 몸을 쓰는 부분이 없어요.' },
  ],
}, {
  meta: {
    title: 'Tower of Memory rules — The Society Game 2, challenge 11: hauled up a tower to find matching pictures',
    description: 'The rules of Tower of Memory (기억의 탑), the eleventh challenge of The Society Game 2: two brain players study six pictures A–F shown three seconds each on a loop, the strength side hauls them up the tower by rope, find the matches among fifty numbered picture tiles, mark them below, and a one-minute lockout for a wrong answer.',
    keywords: ['Tower of Memory', 'The Society Game 2', 'picture matching', '소사이어티 게임2 기억의 탑'],
  },
  title: 'Tower of Memory — The Society Game 2, challenge 11',
  name: 'Tower of Memory (기억의 탑)',
  lead: 'Two brain players memorise six pictures; the rest of the village hauls them to the top of a tower by rope, where they must find the same pictures among fifty numbered tiles.',
  summary: 'A memory race joined to a rope haul: match six pictures among fifty tiles on a tower.',
  setup: [
    { type: 'list', items: [
      '**Brain side**: two players per village memorise and search.',
      '**Strength side**: everyone else pulls ropes tied to them to lift the brain players up the tower.',
      '**Question pictures**: six, marked A–F in the top right, each shown for three seconds in order on a loop.',
      '**Picture tiles**: fifty tiles numbered 1–50 at the top of the tower.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Study', body: 'The brain players watch pictures A–F at the question table.' },
      { title: 'Haul', body: 'The strength side pulls the two up to the top of the Tower of Memory.' },
      { title: 'Search', body: 'Find the six tiles matching A–F among the fifty.' },
      { title: 'Mark', body: 'Come down and mark the tile numbers on the answer board; the question pictures can be checked again at any time.' },
      { title: 'Check', body: 'With all six slots filled, shout "answer" and raise the flag.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['The first village to have all six **confirmed correct** wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A wrong answer bars answering for one minute, without saying how many were wrong.',
      'According to the fan wiki, the pictures were cats that looked very much alike.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Because the question can be seen again, the real task is **cutting down the trips**, not memorising: every climb costs the strength side effort and time.' },
    { type: 'cards', items: [
      { title: 'Two features, not one', body: 'With look-alikes, one feature leaves several candidates. Learn **two or three distinct features** per picture and you can settle on one tile at the top.' },
      { title: 'Split the six', body: 'Three pictures each halves the load; knowing one feature of your partner’s pictures lets you check each other.' },
      { title: 'Bring back candidates', body: 'When unsure, remember two or three candidate numbers, come down and compare with the question picture — that is how the "look again" rule pays off.' },
      { title: 'The one-minute cost', body: 'You are not told how many are wrong, so after a lockout you still have to find the bad slot. Double-checking a doubtful slot before submitting is usually faster than guessing.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy: a fast haul and fewer trips win.' },
  ],
  similar: [
    { name: 'Dobble (Spot It!)', players: '2–8', alike: 'Spot the identical picture among many before anyone else.', differs: 'You find the one symbol two cards share; no memory needed.' },
    { name: 'Memory (Concentration)', players: '1+', alike: 'Remember pictures to find their match.', differs: 'You flip cards yourself; nothing physical.' },
  ],
});
