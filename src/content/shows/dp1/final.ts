// 데블스 플랜 (season 1), day 7 final: 나인 멘스 모리스, 헥사곤. Both are playable on PUZZLTHINK.
import { dp1Game } from './shared';

export const ninMensMorris = dp1Game('nine-mens-morris', 'final', { ko: '결승 1회전', en: 'Final, game 1' }, [7], ['wallgo', 'janggi', 'pointOmok'], {
  meta: {
    title: '나인 멘스 모리스 규칙 — 데블스 플랜 시즌1 결승 1회전, 밀을 만들어 말을 잡는 고전 게임',
    description: '데블스 플랜 시즌1 결승 1회전 나인 멘스 모리스의 규칙을 정리했어요. 24개의 점과 말 9개씩, 놓기와 옮기기 단계, 밀(3목)로 상대 말 잡기, 밀 안의 말 보호, 3개 남으면 날기, 2개가 되거나 못 움직이면 패배, 교착 10턴 규칙, 3판 2선승과 PUZZLTHINK 버전과의 차이까지.',
    keywords: ['나인 멘스 모리스', '나인멘스모리스', '데블스 플랜 나인 멘스 모리스', '데블스플랜 결승', '데블스플랜1'],
  },
  title: '나인 멘스 모리스 — 데블스 플랜 시즌1 결승 1회전',
  name: '나인 멘스 모리스',
  lead: '세 겹의 사각형 판에 말을 놓고 옮기며, 내 말 세 개를 한 줄로 만들 때마다 상대 말을 하나씩 잡아요. 로마 시대부터 전해지는 고전 보드게임이에요.',
  summary: '말 세 개를 한 줄(밀)로 만들어 상대 말을 잡는 고전 추상 전략 게임. 결승 첫 경기로 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 2명.',
      '**게임판**: 세 겹의 사각형을 선으로 이은 판, 점 24개.',
      '**말**: 한 사람은 검정 9개, 다른 사람은 하양 9개.',
      '**경기**: 3판 2선승. 피스가 더 많은 사람은 1·3판의 선후공을 정할 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '놓기 단계', body: '선 플레이어부터 90초 안에 빈 점 하나에 말을 놓아요. 9개를 모두 놓을 때까지 번갈아 놓고, 그동안은 말을 옮길 수 없어요.' },
      { title: '옮기기 단계', body: '모두 놓은 뒤에는 차례마다 말 하나를 선으로 이어진 이웃한 빈 점으로 옮겨요.' },
      { title: '밀', body: '놓거나 옮긴 결과 선으로 이어진 세 점에 내 말 3개가 서면(밀), 상대 말 하나를 골라 판에서 없애요. 단, 상대의 밀 안에 있는 말은 잡을 수 없어요.' },
      { title: '날기', body: '내 말이 3개만 남으면, 선과 상관없이 아무 빈 점으로나 옮길 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '상대 말이 **2개**가 되거나, 상대가 **움직일 수 없게** 되면 이겨요.',
      '한 사람의 말이 3개 남은 상태로 교착이 10턴 이상 이어지면, 말이 적은 쪽이 져요.',
      '세 판 중 두 판을 먼저 이기면 결승 1회전 승리예요. 결승은 세 경기 중 두 경기를 먼저 이긴 사람이 우승해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '밀이 된 세 말은 보호돼요. 정리된 방송 규칙에는 상대 말이 모두 밀 안에 있을 때의 처리가 따로 적혀 있지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '나인 멘스 모리스의 핵심은 **밀을 반복해서 만들 수 있는 형태**와 **상대를 가두는 것**이에요. 말 하나를 앞뒤로 옮길 때마다 밀이 다시 생기는 구조를 만들면, 차례마다 상대 말을 하나씩 잡을 수 있어요.' },
    { type: 'cards', items: [
      { title: '놓기 단계는 위치 싸움', body: '놓기 단계에서 밀을 서두르기보다, 교차점(이웃이 많은 점)을 차지하고 상대의 이동을 막는 배치가 나중에 더 커요. 판의 꼭짓점은 이웃이 둘뿐이라 갇히기 쉬워, 상대 말을 꼭짓점으로 몰면 옮기기 단계에서 움직일 수 없게 만들 수 있어요.' },
      { title: '이중 밀', body: '말 하나가 두 밀 사이를 오가며 매번 밀을 만드는 형태(이른바 연발 밀)는 거의 막을 수 없어요. 상대가 이 형태를 만들기 전에 그 빈 점을 먼저 막는 것이 수비의 기본이에요.' },
      { title: '3개 남은 쪽의 반격', body: '3개가 남으면 날 수 있어 갑자기 강해져요. 앞서 있는 쪽은 상대를 3개로 만들기 직전에 날기에 대비한 배치를 갖춰야 해요. 교착 10턴 규칙 때문에 적은 쪽도 무작정 버틸 수는 없어요.' },
    ], columns: 1 },
    { type: 'p', text: '나인 멘스 모리스는 컴퓨터로 완전히 풀린 게임으로, 양쪽이 최선을 두면 **무승부**가 된다고 알려져 있어요. 사람끼리의 대결에서는 놓기 단계의 배치 감각이 승부를 크게 좌우해요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 나인 멘스 모리스는 판, 말 9개, 밀과 보호, 날기, 2개·이동 불능 패배, 교착 10턴 규칙이 방송과 같아요. 점 이름도 방송 판 표기(A–G, 1–7)를 따라요.',
      '혼자 하면 AI와 둬요. 쉬움은 몇 수 앞만 보고 가끔 실수하고, 어려움은 더 깊이 읽어요. 같은 수순을 반복해 이기는 일이 없도록 AI가 비슷한 수 중에서 고르게 되어 있어요.',
      '친구와 방을 만들면 방송처럼 **3판 2선승**으로 해요. 1판 흑은 무작위로 정하고 판마다 바꾸며, 무승부 판은 세지 않고 5판이 지나면 그 상태로 끝나요. 차례 시간은 90·60·30초 중에서 골라요.',
      '사이트에서는 잡지 않은 채 120수가 지나면 그 판을 무승부로 끝내요. 피스 베네핏(선후공 결정권)은 없어요.',
    ] },
  ],
  similar: [
    { name: '모리스 / 밀 (Mühle)', players: '2명', alike: '이 게임 그 자체예요. 유럽에서는 "밀"이라는 이름으로 널리 알려져 있어요.', differs: '지역에 따라 날기 규칙을 쓰지 않거나, 밀 안의 말도 잡을 수 있게 하는 변형이 있어요.' },
    { name: '고누 (우물고누·참고누)', players: '2명', alike: '선으로 이은 판에서 말을 놓고 옮기며 세 개를 이어 상대 말을 잡는 우리나라 전통 놀이예요. 참고누는 모리스와 구조가 매우 비슷해요.', differs: '고누는 지역마다 판과 규칙이 다양하고, 놓기·옮기기 규칙이 조금씩 달라요.' },
  ],
}, {
  meta: {
    title: "Nine Men's Morris rules — The Devil's Plan season 1 final, game 1",
    description: "The rules of Nine Men's Morris (나인 멘스 모리스) from The Devil's Plan season 1 final: 24 points and nine pieces each, placing then moving, mills that remove an enemy piece, protected mills, flying with three, losing at two pieces or no move, the ten-turn stalemate rule, best of three, and how the PUZZLTHINK version differs.",
    keywords: ["Nine Men's Morris", "The Devil's Plan final", 'Mill board game', '데블스 플랜 나인 멘스 모리스'],
  },
  title: "Nine Men's Morris — The Devil's Plan season 1 final, game 1",
  name: "Nine Men's Morris (나인 멘스 모리스)",
  lead: 'Place and move pieces on three nested squares; each time three of yours line up you remove an enemy piece. A classic played since Roman times.',
  summary: 'The classic abstract game of forming mills to capture pieces, played as the final’s first game.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two finalists.',
      '**Board**: three nested squares joined by lines, 24 points.',
      '**Pieces**: nine black for one player, nine white for the other.',
      '**Match**: best of three; the player with more pieces chooses who starts rounds 1 and 3.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Placing', body: 'From the first player, place a piece on an empty point within 90 seconds, alternating until all nine are down; no moving before then.' },
      { title: 'Moving', body: 'Then each turn move one piece along a line to an adjacent empty point.' },
      { title: 'Mills', body: 'Three of yours on a line (a mill) after placing or moving removes one enemy piece, but not one standing in a mill.' },
      { title: 'Flying', body: 'With only three pieces left, you may move to any empty point.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'You win when your opponent is down to **two** pieces or **cannot move**.',
      'If a player is down to three and ten turns pass in deadlock, the side with fewer pieces loses.',
      'Two of three rounds wins final game 1; the final goes to whoever wins two of its three games first.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Pieces in mills are protected; the broadcast rules do not state what happens if every enemy piece is in a mill.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Morris is about **shapes that let you remake a mill again and again** and **trapping the opponent**. A piece that shuttles back and forth closing a mill each time captures every turn.' },
    { type: 'cards', items: [
      { title: 'Placing is about position', body: 'Rather than rushing mills while placing, taking junction points (with many neighbours) and blocking enemy movement pays off later. Corners have only two neighbours, so driving enemy pieces into corners can leave them unable to move.' },
      { title: 'The double mill', body: 'A piece swinging between two mills, closing one each move, is nearly unstoppable; blocking its empty point before it forms is basic defence.' },
      { title: 'The flying comeback', body: 'With three pieces left a player can fly and suddenly becomes dangerous, so the leader must be ready before reducing the opponent to three; the ten-turn rule stops the smaller side stalling forever.' },
    ], columns: 1 },
    { type: 'p', text: "Nine Men's Morris has been solved by computer and is known to be **a draw with perfect play**; between people, a feel for placement in the opening phase decides a great deal." },
  ],
  siteDiff: [
    { type: 'list', items: [
      "PUZZLTHINK's Nine Men's Morris matches the board, nine pieces, protected mills, flying, losing at two pieces or no move, and the ten-turn deadlock rule; points use the broadcast names (A–G, 1–7).",
      'Solo you play an AI: easy looks a few moves ahead and slips sometimes, hard reads deeper, and it varies between near-equal moves so a winning line cannot simply be replayed.',
      'Rooms with a friend are **best of three** like the show: round 1’s black is random and sides swap each round; drawn rounds do not count and the match stops after five rounds. Turn time is 90, 60 or 30 seconds.',
      'The site also draws a round after 120 moves without a capture, and there is no piece benefit for choosing who starts.',
    ] },
  ],
  similar: [
    { name: 'Mill (Mühle)', players: '2', alike: 'The same game, widely known in Europe as Mill.', differs: 'Some regional variants drop flying or allow capturing from mills.' },
    { name: 'Gonu (Korean traditional)', players: '2', alike: 'Place and move pieces on a lined board, capturing by lining up three; chamgonu is very close to Morris.', differs: 'Boards and rules vary by region.' },
  ],
}, { id: 'nineMensMorris', name: { ko: '나인 멘스 모리스', en: "Nine Men's Morris" }, file: 'src/lib/morris.ts' });

export const hexagon = dp1Game('hexagon', 'final', { ko: '결승 2회전', en: 'Final, game 2' }, [7], ['gyulhap', 'nemoCount', 'equationTower'], {
  meta: {
    title: '헥사곤 규칙 — 데블스 플랜 시즌1 결승 2회전, 외운 육각형 숫자로 타겟 넘버 만들기',
    description: '데블스 플랜 시즌1 결승 2회전 헥사곤의 규칙을 정리했어요. 3·4·5·4·3줄의 육각형 19칸, 30초 암기 뒤 알파벳으로 뒤집히는 판, 일직선 세 칸의 합이 타겟 넘버, 버저와 10초, +1·−1점, 90초 무응답 종료, 10라운드와 PUZZLTHINK 버전과의 차이까지.',
    keywords: ['헥사곤', '헥사곤 게임', '데블스 플랜 헥사곤', '데블스플랜 결승', '데블스플랜1'],
  },
  title: '헥사곤 — 데블스 플랜 시즌1 결승 2회전',
  name: '헥사곤',
  lead: '육각형 19칸의 숫자를 30초 동안 외우면 판이 알파벳으로 뒤집혀요. 일직선으로 이어진 세 칸의 합이 타겟 넘버가 되는 조합을 알파벳으로 불러요.',
  summary: '외운 숫자로 합이 타겟 넘버인 세 칸을 찾아 버저로 부르는 암기·연산 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 2명.',
      '**게임판**: 정육각형 19칸이 3·4·5·4·3개씩 다섯 줄로 놓여 있어요. 앞면은 숫자, 뒷면은 A–S 알파벳이에요.',
      '**피스 베네핏**: 피스가 많은 사람은 1점을 안고 시작해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기', body: '라운드가 시작되면 30초 동안 숫자 면이 공개돼요. 그 뒤 판이 알파벳 면으로 바뀌고 타겟 넘버가 나와요.' },
      { title: '찾기', body: '가로나 대각선으로 일렬로 이어진 세 칸 중, 숫자 합이 타겟 넘버인 조합을 찾아요.' },
      { title: '선언', body: '버저를 누르고 10초 안에 그 조합을 알파벳으로 말해요.' },
      { title: '라운드 종료', body: '모든 정답이 나오거나, 90초 동안 아무도 버저를 누르지 않으면 끝나요. 정답 개수는 알려 주지 않아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '정답 +1점, 오답 −1점. 이미 나온 답, 숫자로 말한 답, 10초를 넘긴 답도 오답이에요.',
      '10라운드 뒤 점수가 높은 사람이 이겨요. 동률이면 연장 라운드를 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '선언한 칸의 숫자는 다시 보여 주지 않고, 나온 정답도 판에 표시하지 않아요. 이미 나온 답도 외워야 해요.',
      '라운드마다 판 전체가 새 숫자로 바뀌어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '헥사곤은 **암기**, **연산**, 그리고 **말하지 않는 판단**의 게임이에요. 정답 수가 한 라운드에 몇 개 안 되니, 많이 맞히는 것보다 틀리지 않는 것이 점수를 지켜요.' },
    { type: 'cards', items: [
      { title: '19칸 대신 27줄', body: '세 칸짜리 일직선은 모두 27개예요. 30초 동안 숫자 19개를 외우기보다, 어떤 줄의 합이 얼마인지 몇 개라도 외워 두는 편이 타겟 넘버가 나온 뒤 바로 답하기 좋아요. 다만 어떤 줄의 합이 타겟이 될지는 미리 알 수 없어요.' },
      { title: '오답은 정답 하나를 지운다', body: '정답 +1과 오답 −1이 같은 크기라, 확신이 반반이면 부르지 않는 게 나아요. 이미 나온 답을 다시 말해도 오답이라, 상대가 맞힌 답도 기억해야 해요. 앞서 있는 사람은 버저를 아끼고, 뒤진 사람은 위험을 감수해야 하는 구조예요.' },
      { title: '피스 베네핏 1점', body: '라운드당 정답이 적어서, 처음 1점의 차이가 생각보다 커요. 뒤진 쪽이 그 차이를 뒤집으려면 많이 외워 여러 정답을 먼저 불러야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '두 사람이 같은 판을 보는 순수한 실력 게임이라 **우월 전략은 없어요.** 다만 정답보다 오답 관리가 승패에 더 직접적인 영향을 줘요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 헥사곤은 19칸 배치, 30초 암기, 일직선 세 칸(27줄), 알파벳 선언, 10초 답변, ±1점, 90초 무응답 종료, 10라운드가 방송과 같아요.',
      '**방송에 나온 열 개의 판**을 그대로 풀어 볼 수 있고, 무작위 판도 있어요. 무작위 판은 숫자 1–9로 만들고, 정답이 2–5개인 타겟을 골라요.',
      '혼자 하는 10분 챌린지와, 친구와 2–4명이 겨루는 방이 있어요. 방에서는 5라운드나 10라운드를 고를 수 있어요.',
      '피스 베네핏(1점 먼저 받기)은 없어요.',
    ] },
  ],
  similar: [
    { name: 'SET', players: '1명 이상', alike: '판 위의 카드에서 조건을 만족하는 세 장의 조합을 남보다 먼저 외쳐요.', differs: 'SET은 카드가 계속 보이고, 숫자 계산이 아니라 속성의 같음·다름을 봐요.' },
    { name: '메모리 (같은 그림 찾기)', players: '2명 이상', alike: '잠깐 본 뒤 가려진 칸의 내용을 기억해 답해요.', differs: '메모리는 짝을 찾는 게임이고, 합을 계산하지 않아요.' },
  ],
}, {
  meta: {
    title: "Hexagon rules — The Devil's Plan season 1 final, game 2",
    description: "The rules of Hexagon (헥사곤) from The Devil's Plan season 1 final: 19 hexagons in rows of 3-4-5-4-3, 30 seconds to memorise before they flip to letters, three tiles in a straight line summing to the target, buzzer and 10 seconds, +1 and −1, rounds ending after 90 silent seconds, ten rounds, and how the PUZZLTHINK version differs.",
    keywords: ['Hexagon', "The Devil's Plan final", 'memory math game', '데블스 플랜 헥사곤'],
  },
  title: "Hexagon — The Devil's Plan season 1 final, game 2",
  name: 'Hexagon (헥사곤)',
  lead: 'Memorise the numbers on 19 hexagons for 30 seconds; they flip to letters. Name, by letters, three tiles in a straight line that add up to the target.',
  summary: 'A memory-and-arithmetic buzzer duel: find straight lines of three tiles that sum to the target.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two finalists.',
      '**Board**: 19 regular hexagons in rows of 3, 4, 5, 4 and 3; numbers on the front, letters A–S on the back.',
      '**Piece benefit**: the player with more pieces starts with 1 point.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise', body: 'Each round shows the numbers for 30 seconds, then flips to letters and reveals the target.' },
      { title: 'Find', body: 'Look for three tiles in a straight line, across or diagonal, whose numbers sum to the target.' },
      { title: 'Call', body: 'Buzz and name the line by letters within 10 seconds.' },
      { title: 'End', body: 'The round ends when all answers are found or nobody buzzes for 90 seconds; the number of answers is not announced.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Correct +1, wrong −1; repeats, answers in numbers and answers over 10 seconds count as wrong.',
      'After ten rounds the higher score wins; ties go to extra rounds.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Called tiles are not shown again and found answers are not marked, so you must remember them.',
      'Each round uses a completely new board.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Hexagon is **memory, arithmetic and knowing when not to speak**. Rounds have few answers, so avoiding mistakes protects your score more than calling many.' },
    { type: 'cards', items: [
      { title: '27 lines, not 19 tiles', body: 'There are 27 straight lines of three. Rather than nineteen numbers, memorising some line sums lets you answer the moment the target appears, though you cannot know which sum will be the target.' },
      { title: 'A miss cancels a hit', body: '+1 and −1 are equal, so at fifty-fifty it is better to stay silent; repeating an answer is also wrong, so remember your rival’s. The leader conserves buzzes; the trailer must take risks.' },
      { title: 'The 1-point benefit', body: 'With few answers per round, a starting point matters more than it looks; overturning it takes memorising enough to call several answers first.' },
    ], columns: 1 },
    { type: 'p', text: 'Both players see the same board, so **there is no dominant strategy**; managing wrong calls affects the result more directly than finding answers.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Hexagon matches the 19-tile layout, 30-second memorising, the 27 lines of three, letter calls, 10-second answers, ±1 scoring, the 90-second idle end and ten rounds.',
      'You can replay **the ten boards from the broadcast**, or random boards using numbers 1–9 with a target that has 2–5 answers.',
      'There is a 10-minute solo challenge and rooms for 2–4 friends, with a choice of 5 or 10 rounds.',
      'There is no piece benefit.',
    ] },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'Race to call a qualifying set of three from a layout.', differs: 'Cards stay visible and the test is sameness, not sums.' },
    { name: 'Memory (Concentration)', players: '2+', alike: 'Answer from what you saw briefly before it was hidden.', differs: 'You match pairs instead of adding.' },
  ],
}, { id: 'hexagon', name: { ko: '헥사곤', en: 'Hexagon' }, file: 'src/lib/hexagon.ts' });
