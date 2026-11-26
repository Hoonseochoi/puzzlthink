// 더 지니어스: 룰 브레이커, rounds 8–12: 마이너스 경매, 같은 그림 찾기, 정리해고, 흑과 백 (rounds 9 and 11), 빅딜 게임,
// 엘리베이터 게임, and the final's second game 진실탐지기 (its first and third games are on the 인디언 홀덤 and 콰트로 pages).
import { g2Game, namuGame } from './shared';

export const minusAuction = g2Game({ slug: 'minus-auction', kind: 'main', rounds: [8], related: ['piggyBank', 'hitStay', 'heavy13'], check: 'two' }, {
  meta: {
    title: '마이너스 경매 규칙 — 더 지니어스 시즌2 룰 브레이커 8회전 메인 매치, 받기 싫은 숫자 떠넘기기',
    description: '더 지니어스: 룰 브레이커 8회전 메인 매치 마이너스 경매의 규칙을 정리했어요. −3부터 −35까지의 숫자 큐브, 칩 9개, 칩을 내고 거부하기와 쌓인 칩째 낙찰받기, 연속 숫자는 0에 가까운 하나만 계산, 히든 큐브, 가넷으로 거부하기까지. 원작 보드게임 노 땡스와의 차이도.',
    keywords: ['마이너스 경매', '마이너스경매', '더 지니어스 마이너스 경매', '룰 브레이커 경매', '노 땡스', '더 지니어스2'],
  },
  title: '마이너스 경매 — 더 지니어스: 룰 브레이커 8회전 메인 매치',
  name: '마이너스 경매',
  lead: '경매에 오르는 건 모두 마이너스 숫자예요. 받기 싫으면 칩 하나를 내고 넘겨요. 칩이 쌓일수록, 누군가는 그 칩까지 함께 받아 가는 편이 이득이 돼요.',
  summary: '마이너스 숫자 큐브를 칩을 내고 떠넘기거나 쌓인 칩과 함께 받아 가는 경매. 보드게임 노 땡스와 같은 구조예요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 6명. 제비뽑기로 순서를 정해요.',
      '**숫자 큐브**: −3부터 −35까지. 시작 전 딜러가 하나를 **히든 큐브**로 빼 두고, 끝까지 공개하지 않아요.',
      '**칩**: 각자 9개.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '경매', body: '추첨으로 큐브 하나가 공개돼요. 차례가 된 사람은 받을지 거부할지 정해요.' },
      { title: '거부', body: '받기 싫으면 칩 하나를 큐브 옆에 내고 다음 사람에게 넘겨요. 낼 칩이 없으면 반드시 받아야 해요.' },
      { title: '낙찰', body: '받겠다고 하면 큐브와 그 옆에 쌓인 칩을 모두 가져가요. 낙찰된 큐브는 모두에게 공개돼요.' },
      { title: '다음 큐브', body: '새 큐브가 공개되고, 방금 낙찰받은 사람부터 다시 차례가 돌아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '끝나면 **받은 큐브의 합 + 남은 칩 수**가 점수예요.',
      '받은 숫자가 연속되면 그중 **0에 가장 가까운 숫자 하나만** 계산해요. 예를 들어 −6, −7, −8을 모으면 −6만 남아요.',
      '점수가 0에 가장 가까운 사람이 우승해 생명의 징표와 가넷 5개를 받고, 가장 낮은 사람이 탈락 후보예요. 공동 우승이면 생명의 징표가 하나씩, 단독 우승이면 하나 더 주어졌어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '거부할 때 칩 대신 **가넷 1개**를 낼 수도 있어요. 그 가넷도 큐브를 낙찰받은 사람이 가져가지만, 가넷은 점수에 넣지 않아요.',
      '낙찰받은 큐브와 칩은 남에게 넘길 수 없어요.',
      '공식 규칙 문구는 "가장 낮은 숫자만 계산"처럼 적혀 있었지만, 실제 진행과 영어 위키백과는 0에 가장 가까운 숫자를 남겼어요. 이 페이지는 실제 진행을 따랐어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '마이너스 경매는 **"이 큐브와 칩 묶음이 지금 얼마의 가치인가"**를 매번 계산하는 게임이에요. 큐브만 보면 받으면 손해지만, 쌓인 칩이 큐브의 손해보다 커지는 순간 받는 쪽이 이득이 돼요.' },
    { type: 'cards', items: [
      { title: '연속 숫자의 할인', body: '−13이 있는 사람에게 −14는 사실상 0점이에요. 연속으로 이어지면 0에 가까운 쪽만 남으니까요. 그래서 내 숫자와 이어지는 큐브는 나에게만 싸고, 남들은 그 사람이 칩까지 쓸어 가지 않도록 일부러 먼저 받아 가는 견제도 해요. 히든 큐브 하나가 빠져 있어서, 사이를 메울 숫자가 끝내 안 나올 수도 있어요.' },
      { title: '칩이 바닥나면 끝', body: '칩이 없으면 거부할 수 없어 무엇이든 받아야 해요. 칩을 너무 아끼면 점수는 좋아도 큰 숫자를 피할 수단이 없어요. 남은 칩 수가 꼴찌가 되지 않게 관리하는 것이 안전선이에요.' },
      { title: '가넷이 균형을 깬다', body: '원작과 다른 가장 큰 점은 가넷으로도 거부할 수 있다는 것이에요. 가넷은 점수에 들어가지 않으니, 가넷이 많은 사람은 칩을 쓰지 않고 거의 무한히 거부할 수 있어요. 가넷이 한 사람에게 몰려 있으면 그 사람이 매우 유리해져요.' },
    ], columns: 1 },
    { type: 'p', text: '원작 노 땡스는 칩 수가 같아 균형 잡힌 눈치 게임이지만, 이 버전은 **가넷 보유량이 사실상의 추가 칩**이 돼요. 가넷이 비슷하다면 우월 전략은 없고, 연속 숫자를 노리면서 칩을 적당히 남기는 쪽이 유리해요.' },
  ],
  similar: [
    { name: '노 땡스! (No Thanks! / Geschenkt)', players: '3–7명', alike: '마이너스 경매의 원작이에요. 칩을 내고 카드를 넘기거나 쌓인 칩째 가져가며, 연속된 숫자는 가장 작은 것만 계산해요.', differs: '노 땡스는 카드가 양수 벌점이고 칩이 1점씩 빼 주며, 모두 같은 칩으로 시작해 외부 자원이 없어요.' },
    { name: '6 니미트 (6 nimmt!)', players: '2–10명', alike: '벌점을 피하려 하다가 결국 누군가는 벌점 묶음을 받아 가야 하는 구조예요.', differs: '6 니미트는 모두 동시에 카드를 내고, 줄의 여섯 번째 카드를 놓는 사람이 줄을 가져가요.' },
  ],
}, {
  meta: {
    title: 'Minus Auction rules — The Genius: Rule Breaker, round 8 main match',
    description: 'The rules of the Minus Auction (마이너스 경매) from The Genius: Rule Breaker: number cubes from −3 to −35, nine chips each, paying a chip to pass or taking the cube with the chips piled on it, runs where only the number closest to zero counts, the hidden cube and passing with garnets — and how it differs from No Thanks!.',
    keywords: ['Minus Auction', 'The Genius Minus Auction', 'No Thanks', 'The Genius Rule Breaker', '마이너스 경매'],
  },
  title: 'Minus Auction — The Genius: Rule Breaker, round 8 main match',
  name: 'Minus Auction (마이너스 경매)',
  lead: 'Every lot is a negative number. Pay a chip to pass it on; the more chips pile up, the better it becomes for someone to take the cube and the chips together.',
  summary: 'An auction of negative cubes: pay chips to pass them or take them with the pile — the structure of No Thanks!.',
  setup: [
    { type: 'list', items: [
      '**Players**: 6, in an order drawn by lot.',
      '**Cubes**: −3 to −35; one is removed as a **hidden cube** and never revealed.',
      '**Chips**: nine each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Lot', body: 'A cube is drawn and shown; the player whose turn it is decides to take or pass.' },
      { title: 'Pass', body: 'Put a chip beside the cube and pass to the next player; with no chips you must take it.' },
      { title: 'Take', body: 'Take the cube and every chip on it; taken cubes are public.' },
      { title: 'Next', body: 'A new cube is drawn and the turn starts again from the taker.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Score = **sum of your cubes + chips left**.',
      'In a run of consecutive numbers **only the one closest to zero** counts: −6, −7 and −8 score −6.',
      'The score closest to zero wins a Token of Life and five garnets, and the lowest is the Death Match candidate; joint winners each got a Token, a sole winner one more.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'You may pass with **a garnet** instead of a chip; the taker collects it, but garnets do not count towards the score.',
      'Cubes and chips won cannot be handed over.',
      'The official wording said the "lowest" number in a run counts, but play and English Wikipedia kept the one closest to zero; this page follows the play.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Every turn asks **what this cube plus its chips is worth right now**. The cube alone is a loss, but once the pile outweighs it, taking it is a gain.' },
    { type: 'cards', items: [
      { title: 'Runs are discounts', body: 'If you hold −13, then −14 costs you nothing, because a run keeps only the number closest to zero. Cubes next to yours are cheap only for you, so others sometimes take them first to stop you sweeping the chips. With one hidden cube removed, the gap you need may never appear.' },
      { title: 'No chips, no choice', body: 'Out of chips you must take anything. Hoarding chips helps the score but leaves you unable to dodge big numbers; not having the fewest chips is the safety line.' },
      { title: 'Garnets break the balance', body: 'The big change from the original is passing with garnets, which do not count. A player rich in garnets can pass almost forever without touching chips.' },
    ], columns: 1 },
    { type: 'p', text: 'No Thanks! is balanced because everyone starts equal; here **garnet holdings act as extra chips**. With similar garnets there is no dominant strategy — chasing runs while keeping enough chips works best.' },
  ],
  similar: [
    { name: 'No Thanks! (Geschenkt)', players: '3–7', alike: 'The original: pay chips to refuse cards or take them with the pile, and runs count only their lowest card.', differs: 'Cards are positive penalties, chips are worth one point each, and everyone starts equal with no outside resource.' },
    { name: '6 nimmt!', players: '2–10', alike: 'Everyone dodges penalties until someone must take a pile.', differs: 'Cards are played simultaneously and the sixth card in a row takes it.' },
  ],
});

export const samePictureHunt = g2Game({ slug: 'same-picture-hunt', kind: 'death', rounds: [8], related: ['hexagon', 'gyulhap', 'hiddenWord'], check: 'two', extra: [namuGame('같은 그림 찾기', 'Same Picture Hunt')] }, {
  meta: {
    title: '같은 그림 찾기 규칙 — 더 지니어스 시즌2 룰 브레이커 8회전 데스매치, 그림판 16칸 기억하기',
    description: '더 지니어스: 룰 브레이커 8회전 데스매치 같은 그림 찾기의 규칙을 정리했어요. 앞면 알파벳·뒷면 그림 16칸의 그림판, 20칸 컨베이어 벨트, 가넷에 따른 출발 위치와 선후공, 맞히면 전진하고 틀리면 벨트가 밀려나는 규칙, 결승점과 떨어지기까지.',
    keywords: ['같은 그림 찾기', '같은그림찾기', '더 지니어스 같은 그림 찾기', '룰 브레이커 데스매치', '더 지니어스2'],
  },
  title: '같은 그림 찾기 — 더 지니어스: 룰 브레이커 8회전 데스매치',
  name: '같은 그림 찾기',
  lead: '알파벳이 적힌 16칸 그림판 뒤에 그림이 숨어 있어요. 내 컨베이어 벨트의 다음 그림과 같은 칸을 뒤집으면 한 칸 앞으로, 틀리면 벨트가 밀려 낭떠러지에 가까워져요.',
  summary: '16칸 그림판의 숨은 그림을 기억해 컨베이어 벨트 위를 전진하는 기억력 데스매치. 시즌1에도 나온 게임이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**그림판**: 앞면에 알파벳 16개, 뒷면에 서로 다른 그림 16개.',
      '**컨베이어 벨트**: 각자 하나. 16가지 그림 세 묶음을 섞어 그림 카드 20장을 벨트의 첫 칸부터 채워요.',
      '**출발**: 가넷이 많은 사람은 10번째 카드, 적은 사람은 8번째 카드에서 시작해요. 선후공도 가넷이 많은 사람이 정해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '찾기', body: '차례가 되면 내 말 바로 앞 칸의 그림과 같은 그림이 그림판의 어느 알파벳 뒤에 있는지 골라 뒤집어요.' },
      { title: '맞히면', body: '말이 한 칸 전진하고, 이어서 그림판을 한 번 더 뒤집을 수 있어요.' },
      { title: '틀리면', body: '컨베이어 벨트가 한 칸 뒤로 밀리고, 맨 앞에 새 그림 카드가 채워지며, 차례가 상대에게 넘어가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '먼저 **결승점에 도착**한 사람이 이겨요.',
      '계속 틀려 말이 벨트에서 **떨어지면** 그 사람이 져요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '시즌2는 시즌1과 같은 규칙으로 진행됐어요(영어 위키백과). 그랜드 파이널(시즌4)에서는 두 사람이 같은 칸에서 출발하고 선후공을 동전으로 정하는 등 규칙이 바뀌었어요.',
      '뒤집은 칸의 그림은 두 사람 모두 볼 수 있어서, 상대가 연 칸도 내 정보가 돼요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '같은 그림 찾기는 기억력 게임이지만, **뒤집는 칸이 두 사람에게 공평하게 공개**된다는 점 때문에 정보를 언제 열어 주느냐의 게임이기도 해요.' },
    { type: 'cards', items: [
      { title: '두 칸의 출발 차이', body: '가넷이 많은 사람은 두 칸 앞에서 출발하고 선후공까지 정해요. 처음에는 그림판에 대한 정보가 없으니, 두 사람 모두 처음 몇 번은 운에 기대야 해요. 이때 두 칸의 여유는 틀려도 버틸 수 있는 횟수의 차이가 돼요.' },
      { title: '모르는 칸을 열지 않기', body: '새 칸을 뒤집으면 그 그림을 상대도 알게 돼요. 앞서 있는 사람은 이미 열린 칸만 다시 고르며 새 정보를 주지 않고, 상대가 먼저 무너지기를 기다릴 수 있어요. 뒤진 사람은 새 칸을 열어야만 앞으로 갈 수 있어, 그 정보가 다시 앞선 사람을 돕는 악순환이 생겨요.' },
      { title: '외우는 방법', body: '알파벳 16개와 그림 16개를 짝지어 외워야 해요. 알파벳을 단어처럼 묶거나, 그림과 글자를 이야기로 이어 외우면 실수가 줄어요.' },
    ], columns: 1 },
    { type: 'p', text: '출발 위치와 선후공이 가넷으로 정해지는 시즌1·2 규칙에서는 **가넷이 많은 쪽이 정보를 아끼는 전략이 매우 강해요.** 뒤진 쪽은 초반에 운 좋게 여러 칸을 맞히는 것 말고는 뒤집기 어려워요.' },
  ],
  similar: [
    { name: '치킨 차차차 (Zicke Zacke Hühnerkacke)', players: '2–4명', alike: '뒤집힌 타일 중 다음 칸과 같은 그림을 기억해 찾으면 앞으로 가는 경주 게임이에요. 같은 그림 찾기의 바탕이 된 게임이에요.', differs: '치킨 차차차는 앞 사람을 따라잡아 꼬리 깃털을 빼앗는 규칙이 있고, 벨트에서 떨어지는 규칙은 없어요.' },
    { name: '메모리 (같은 그림 짝 맞추기)', players: '2명 이상', alike: '뒤집힌 그림의 위치를 기억해 맞혀요.', differs: '메모리는 같은 그림 두 장을 짝짓는 게임이고, 경주가 없어요.' },
  ],
}, {
  meta: {
    title: 'Same Picture Hunt rules — The Genius: Rule Breaker, round 8 Death Match',
    description: 'The rules of Same Picture Hunt (같은 그림 찾기) from The Genius: Rule Breaker: a 16-panel board with letters in front and pictures behind, a 20-card conveyor belt each, start positions and turn order by garnets, advancing on a match and sliding back on a miss, finishing first or falling off.',
    keywords: ['Same Picture Hunt', 'The Genius memory game', 'The Genius Rule Breaker death match', '같은 그림 찾기'],
  },
  title: 'Same Picture Hunt — The Genius: Rule Breaker, round 8 Death Match',
  name: 'Same Picture Hunt (같은 그림 찾기)',
  lead: 'Sixteen lettered panels hide sixteen pictures. Flip the one that matches the next card on your conveyor belt to move forward; miss, and the belt slides you towards the edge.',
  summary: 'A memory Death Match of finding hidden pictures to advance along a conveyor belt; it was also used in season 1.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two Death Match candidates.',
      '**Board**: 16 panels, letters on the front and 16 different pictures behind.',
      '**Belts**: one each, filled from the first space with 20 picture cards from three shuffled sets of the 16 pictures.',
      '**Start**: the player with more garnets starts on the 10th card, the other on the 8th, and the richer player picks who goes first.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Search', body: 'On your turn, choose the letter whose hidden picture matches the card just ahead of your piece, and flip it.' },
      { title: 'Match', body: 'Your piece moves forward one space and you may flip again.' },
      { title: 'Miss', body: 'Your belt slides back one space, a new card fills the front, and the turn passes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first to **reach the finish** wins.',
      'A player whose piece **falls off** the belt loses.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Season 2 used season 1’s rules unchanged (English Wikipedia); in The Genius: Grand Final (season 4) both started level and a coin decided who went first.',
      'Flipped pictures are seen by both players, so the opponent’s flips are information for you too.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is a memory game, but because **every flip is shown to both**, it is also about when to give information away.' },
    { type: 'cards', items: [
      { title: 'A two-space head start', body: 'The richer player starts two spaces ahead and picks the order. Early on nobody knows the board, so both must guess, and those two spaces are extra misses the leader can afford.' },
      { title: 'Don’t open new panels', body: 'A new flip teaches your opponent too. The leader can stick to panels already open, adding nothing, and wait for the other to slip; the trailer must open new panels to advance, and those flips help the leader in turn.' },
      { title: 'How to memorise', body: 'Sixteen letters must be paired with sixteen pictures; grouping letters into words or linking each picture to its letter in a story cuts errors.' },
    ], columns: 1 },
    { type: 'p', text: 'Under the season 1–2 rules, with start and order set by garnets, **the richer player’s withholding strategy is very strong**; the trailer’s main hope is a lucky early run of matches.' },
  ],
  similar: [
    { name: 'Chicken Cha Cha Cha (Zicke Zacke Hühnerkacke)', players: '2–4', alike: 'Remember hidden tiles and flip the one matching the next space to race forward; the inspiration for this game.', differs: 'You overtake others to steal tail feathers; nobody falls off a belt.' },
    { name: 'Memory (Concentration)', players: '2+', alike: 'Remember where pictures are hidden.', differs: 'You match pairs; there is no race.' },
  ],
});

export const layoff = g2Game({ slug: 'layoff', kind: 'main', rounds: [9], related: ['hiddenWord', 'russianRoulette', 'indianPoker'], check: 'two' }, {
  meta: {
    title: '정리해고 규칙 — 더 지니어스 시즌2 룰 브레이커 9회전 메인 매치, 회사판 먹이사슬',
    description: '더 지니어스: 룰 브레이커 9회전 메인 매치 정리해고의 규칙을 정리했어요. 사장·간부·사원·인턴 11명, 영업·인사·생산 부서, 해고 스티커, 직급과 연봉, 간부의 감축 목표, 노동조합·가족·커플 능력, 인사팀 엿보기, 공동 우승 재정까지.',
    keywords: ['정리해고', '정리해고 게임', '더 지니어스 정리해고', '룰 브레이커 정리해고', '더 지니어스2'],
  },
  title: '정리해고 — 더 지니어스: 룰 브레이커 9회전 메인 매치',
  name: '정리해고',
  lead: '1회전 먹이사슬의 회사 버전이에요. 사장과 간부, 사원이 된 11명이 부서를 오가며, 간부는 연봉 감축 목표를 채우려 사원을 해고하고 사원은 살아남으려 피해요.',
  summary: '직급과 연봉, 부서 이동으로 해고하고 피하는 정체 숨기기 게임. 1회전 먹이사슬을 회사로 옮겼어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 남은 플레이어 5명과 게스트 6명, 모두 11명. 제비뽑기로 캐릭터를 받고, 캐릭터는 공개되지 않아요.',
      '**부서**: 영업팀·인사팀·생산팀. 대부분의 캐릭터가 한 부서에 속해요.',
      '**도구**: 해고 스티커. 한 라운드에 한 번만 쓸 수 있어요.',
      '**엿보기**: 인사팀 소속은 시작할 때 한 명의 캐릭터를 확인하고, 인턴은 두 명을 확인해요.',
    ] },
    { type: 'table', head: ['캐릭터 (서열·부서)', '승리 조건', '특이 사항'], rows: [
      ['사장 (1위, 부서 없음)', '5명 이상 생존 + 해고된 연봉 합계 2억 2천만 원 이상', '직접 해고해도 아무 일이 없어요. 아들(세자)의 정체를 알고 시작해요.'],
      ['상무 (2위, 생산)', '생존', '직접 해고로 연봉 1억 2천만 원 이상을 줄이지 못하면 해고돼요.'],
      ['부장 (3위, 인사)', '생존', '직접 해고로 연봉 7천만 원 이상을 줄이지 못하면 해고돼요.'],
      ['차장 (4위, 영업)', '부장의 패배', '감축 목표가 없어요.'],
      ['세자 (사원, 생산)', '사장의 승리', '세자를 해고하려는 간부가 대신 해고돼요.'],
      ['사내 커플 2명 (사원, 영업·생산)', '생존', '서로의 정체를 알고 시작해요. 노동조합원이에요.'],
      ['노동조합 사원들 (영업·인사)', '생존', '한 명은 엿보기를 당할 때 정체를 위장할 수 있어요.'],
      ['차장의 조카 (사원, 인사)', '생존', '차장이 이기면 해고됐어도 복직해요.'],
      ['인턴 (부서 없음)', '생존', '두 명을 엿볼 수 있어요.'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '부서 선택', body: '라운드마다 영업·인사·생산 중 그 라운드에 있을 부서를 정해요. 자기 부서가 아닌 곳에 한 라운드 있었다면 다음 라운드에는 자기 부서로 돌아가야 해요. 부서가 없는 사장과 인턴은 제약이 없어요.' },
      { title: '해고', body: '같은 부서에 있는 사람 중 나보다 직급이 낮은 사람에게 해고 스티커를 붙여 해고해요. 해고된 사람은 게임에서 빠져요.' },
      { title: '상사를 노리면', body: '상대가 상사면 아무 일도 없어요. 단, 사장에게 스티커를 붙이면 붙인 사람이 해고돼요.' },
      { title: '공개', body: '해고 장면은 같은 부서 사람만 봐요. 해고된 사람의 이름만 모두에게 알려지고 캐릭터는 알려지지 않아요. 이렇게 네 라운드를 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '승리 조건을 채운 사람은 모두 승자예요. 플레이어는 생명의 징표와 가넷 1개를, 게스트는 가넷 1개 가치인 100만 원을 받아요.',
      '승자들이 패배한 플레이어 중 탈락 후보를 정하고, 탈락 후보는 승자가 아닌 플레이어 중 데스매치 상대를 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**노동조합**: 살아 있는 조합원이 모두 같은 부서에 있으면 해고되지 않아요.',
      '공동 우승에 대한 재정이 공개됐어요. 플레이어 5명이 모두 이기거나 모두 지면 가넷이 가장 많은 사람의 단독 우승이에요. 4명이 이기고 1명이 지면 생명의 징표가 모두 무효가 돼요. 3명이 이기고 2명이 지면 탈락 후보는 불멸의 징표를 쓸 수 없어요.',
      '사원 연봉은 3천만–4천만 원, 인턴은 1천만 원이에요. 캐릭터별 세부 능력은 나무위키에 가장 자세히 정리돼 있고, 영어 위키백과에는 대략적인 구성만 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '정리해고는 먹이사슬보다 **숫자 계산이 많아요.** 간부는 그냥 해고만 하면 되는 게 아니라 정해진 연봉 이상을 직접 줄여야 살아남고, 사장은 남이 해고한 연봉의 합과 생존자 수를 동시에 맞춰야 해요.' },
    { type: 'cards', items: [
      { title: '간부의 목표와 사장의 목표', body: '상무는 1억 2천만 원, 부장은 7천만 원을 직접 줄여야 해요. 사원 연봉이 3천–4천만 원이라 상무는 세 명 이상, 부장은 두 명 이상 해고해야 하는데, 스티커는 라운드당 한 번이에요. 그런데 사장은 5명 이상이 살아남아야 하니, 간부들이 너무 많이 해고하면 사장이 져요. 간부와 사장은 같은 편처럼 보이지만 숫자에서 부딪쳐요.' },
      { title: '차장이라는 변수', body: '차장은 해고 목표가 없고, 부장이 지기만 하면 이겨요. 부장이 목표를 못 채우면 해고되니, 차장은 부장의 먹잇감이 될 사원을 지켜 주는 것만으로 이길 수 있어요. 조카가 있어 차장의 승리는 조카의 복직으로도 이어져요.' },
      { title: '조합과 함정 카드', body: '조합원은 한 부서에 모이면 안전하지만, 부서가 다르면 한 라운드씩 걸러서만 모일 수 있어요. 세자를 해고하려는 간부는 대신 해고되고, 사장에게 스티커를 붙이면 자신이 해고되니, 간부도 상대의 정체를 모르고 섣불리 해고하면 위험해요.' },
    ], columns: 1 },
    { type: 'p', text: '캐릭터마다 목표가 엇갈려 **우월 전략은 없어요.** 사장·세자처럼 정체를 알고 시작하는 짝, 차장처럼 남의 실패로 이기는 캐릭터가 있어서, 엿보기 정보를 누구와 나누느냐가 판을 정해요. 게스트는 져도 잃을 게 없어서 플레이어들의 연합에 끌어들이기 쉬운 표가 돼요.' },
  ],
  similar: [
    { name: '뱅! (BANG!)', players: '4–7명', alike: '정체를 숨긴 역할마다 이기는 조건이 다르고, 서로를 제거하며 싸워요.', differs: '뱅!은 카드와 사거리로 공격하고, 직급이나 연봉 목표가 없어요.' },
    { name: '쿠 (Coup)', players: '2–6명', alike: '숨긴 역할의 능력을 쓰고, 상대의 정체를 짐작해 제거해요.', differs: '쿠는 역할을 거짓으로 주장할 수 있고, 들키면 카드를 잃어요.' },
  ],
  note: '캐릭터 표의 세부(연봉, 능력)는 나무위키에만 있어 요지만 옮겼어요.',
}, {
  meta: {
    title: 'Layoff rules — The Genius: Rule Breaker, round 9 main match',
    description: 'The rules of Layoff (정리해고) from The Genius: Rule Breaker: eleven players as a president, executives, employees and an intern, sales, HR and production departments, firing stickers, ranks and salaries, executives’ cost-cutting targets, union, family and couple abilities, HR peeks and the joint-win rulings.',
    keywords: ['Layoff', 'The Genius Layoff', 'The Genius Rule Breaker', '정리해고', '더 지니어스2'],
  },
  title: 'Layoff — The Genius: Rule Breaker, round 9 main match',
  name: 'Layoff (정리해고)',
  lead: 'Food Chain moved to an office: eleven players become a president, executives and staff moving between departments, with executives firing staff to meet salary-cutting targets and staff trying to stay employed.',
  summary: 'A hidden-role game of firing and dodging by rank, salary and department — round 1’s Food Chain in an office.',
  setup: [
    { type: 'list', items: [
      '**Players**: the five remaining contestants plus six guests, eleven in all, each drawing a secret character.',
      '**Departments**: sales, HR and production; most characters belong to one.',
      '**Tools**: firing stickers, one use per round.',
      '**Peeks**: HR members look at one character at the start; the intern looks at two.',
    ] },
    { type: 'table', head: ['Character (rank, dept.)', 'Wins if', 'Special'], rows: [
      ['President (1, none)', 'Five or more survive and fired salaries total ₩220 million or more', 'Firing does nothing; knows his son (the heir) from the start.'],
      ['Managing director (2, production)', 'Survives', 'Fired unless he personally cuts ₩120 million or more.'],
      ['General manager (3, HR)', 'Survives', 'Fired unless he personally cuts ₩70 million or more.'],
      ['Deputy manager (4, sales)', 'The general manager loses', 'No cutting target.'],
      ['Heir (staff, production)', 'The president wins', 'An executive who tries to fire him is fired instead.'],
      ['Office couple (staff, sales and production)', 'Survive', 'Know each other; union members.'],
      ['Union staff (sales, HR)', 'Survive', 'One can disguise their identity when peeked at.'],
      ['Deputy manager’s niece (staff, HR)', 'Survives', 'Rehired if the deputy manager wins.'],
      ['Intern (none)', 'Survives', 'Peeks at two players.'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose a department', body: 'Each round pick a department to be in; after a round outside your own you must return. The president and intern have no department and move freely.' },
      { title: 'Fire', body: 'Stick a firing sticker on someone of lower rank in the same department; they leave the game.' },
      { title: 'Aim higher', body: 'Nothing happens if the target is your superior — except that whoever stickers the president is fired.' },
      { title: 'Reveal', body: 'Only the department sees a firing; the fired player’s name is announced but not their character. Four rounds are played.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Everyone meeting their condition wins: contestants get a Token of Life and a garnet, guests ₩1,000,000 (a garnet’s value).',
      'Winners choose a losing contestant as the Death Match candidate, who names an opponent among non-winning contestants.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Union**: union members cannot be fired while all surviving members are in the same department.',
      'Joint-win rulings were published: if all five contestants win or all lose, the one with most garnets is the sole winner; if four win and one loses, all Tokens of Life are void; if three win and two lose, the candidate cannot use the Token of Immortality.',
      'Staff salaries were ₩30–40 million and the intern’s ₩10 million. Character details are most complete in the fan wiki; English Wikipedia gives only the outline.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Layoff has **more arithmetic than Food Chain**: executives must personally cut a set amount of salary, and the president must balance others’ cuts against how many survive.' },
    { type: 'cards', items: [
      { title: 'Executives versus the president', body: 'The managing director needs ₩120 million and the general manager ₩70 million; with staff at ₩30–40 million that is three firings and two, with one sticker per round. But the president needs five survivors, so too many firings sink him: allies on paper, rivals in the numbers.' },
      { title: 'The deputy manager', body: 'The deputy has no target and wins if the general manager loses — who is fired for missing his target. Simply protecting the general manager’s prey can be enough, and the niece’s rehiring rides on it.' },
      { title: 'Unions and traps', body: 'Union members are safe together but, in different departments, can gather only every other round. Firing the heir or stickering the president backfires on the executive, so careless firings are dangerous.' },
    ], columns: 1 },
    { type: 'p', text: 'Conflicting goals mean **no dominant strategy**. Linked pairs (president and heir) and characters that win from others’ failure (the deputy) make sharing peek information the decisive choice, and guests — with nothing to lose — are easy votes for any alliance.' },
  ],
  similar: [
    { name: 'BANG!', players: '4–7', alike: 'Hidden roles with different win conditions eliminating one another.', differs: 'Cards and range decide attacks; no ranks or salary targets.' },
    { name: 'Coup', players: '2–6', alike: 'Use hidden roles’ powers and guess identities to eliminate others.', differs: 'Roles may be bluffed, and being caught costs a card.' },
  ],
  note: 'Character details (salaries, abilities) come only from the fan wiki, so only their gist is given.',
});

export const blackAndWhite = g2Game({
  slug: 'black-and-white', kind: 'death', rounds: [9, 11], related: ['blackWhite2', 'twoSidedPoker', 'indianPoker'], check: 'two',
  extra: [namuGame('흑과 백(더 지니어스)', 'Black and White (The Genius)')],
  site: { id: 'blackWhite', name: { ko: '흑과 백', en: 'Black & White' }, file: 'src/lib/blackWhite.ts, src/lib/blackWhiteRoom.ts' },
}, {
  meta: {
    title: '흑과 백 규칙 — 더 지니어스 시즌2 룰 브레이커 9·11회전 데스매치, 색만 보이는 숫자 타일 대결',
    description: '더 지니어스: 룰 브레이커 9·11회전 데스매치 흑과 백의 규칙을 정리했어요. 0–8 숫자 타일 9개, 짝수는 검정·홀수는 흰색, 선 플레이어가 먼저 내고 후 플레이어가 응수, 높은 숫자가 승점, 숫자는 끝까지 비공개, 9라운드와 연장전. PUZZLTHINK에서 바로 플레이.',
    keywords: ['흑과 백', '흑과백', '흑백 게임', '더 지니어스 흑과 백', '룰 브레이커 데스매치', '더 지니어스2'],
  },
  title: '흑과 백 — 더 지니어스: 룰 브레이커 9·11회전 데스매치',
  name: '흑과 백',
  lead: '0부터 8까지 타일 9개로 아홉 번 겨뤄요. 더 큰 숫자를 낸 쪽이 1점. 상대 타일은 색(짝수 검정, 홀수 흰색)만 보이고, 숫자는 끝까지 공개되지 않아요.',
  summary: '색만 보이는 숫자 타일로 아홉 번 겨루는 1:1 심리전. 이 시즌에 두 번, 그랜드 파이널에서도 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**타일**: 각자 0–8 숫자 타일 9개. 0·2·4·6·8은 검정, 1·3·5·7은 흰색이에요.',
      '**선 플레이어**: 1라운드 선은 정해진 방식으로 정해요. 영어 위키백과에 따르면 가넷이 많은 사람이 먼저 내요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선 제출', body: '선 플레이어가 타일 하나를 뒷면이 보이게 내요. 상대는 그 타일의 색만 알 수 있어요.' },
      { title: '후 제출', body: '후 플레이어가 자기 타일을 내요.' },
      { title: '판정', body: '딜러만 숫자를 확인하고, 더 큰 숫자를 낸 사람이 승점 1점을 얻어요. 같으면 무승부예요.' },
      { title: '비공개', body: '승패가 정해진 뒤에도 상대가 낸 숫자는 공개되지 않아요. 내가 낸 숫자, 상대 타일의 색, 승패만으로 상대의 남은 타일을 추리해요.' },
      { title: '다음 선', body: '이긴 사람이 다음 라운드의 선이 돼요. 무승부면 직전 라운드의 선이 다시 선이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '9라운드 뒤 **승점이 높은 사람이 이겨요.** 진 사람이 탈락해요.',
      '동점이면 타일 9개를 새로 받아 연장전을 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '흑과 백은 9회전과 11회전 데스매치에 같은 규칙으로 쓰였고, 그랜드 파이널(시즌4)에도 나왔어요. 블랙가넷(시즌3)의 "흑과 백 II"는 규칙이 다른 별개의 게임이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '흑과 백의 핵심은 **"이길 때는 작게, 질 때는 크게"**예요. 승점은 숫자 차이와 상관없이 1점이니, 1 차이로 이기면 큰 숫자를 아끼고, 질 라운드에는 가장 작은 숫자를 버려야 해요.' },
    { type: 'cards', items: [
      { title: '색이 주는 정보', body: '검정은 0·2·4·6·8 다섯 개, 흰색은 1·3·5·7 네 개예요. 상대가 흰색을 냈다면 그 숫자는 최대 7이라, 8을 가진 쪽은 확실히 이길 수 있어요. 상대가 낸 색과 승패를 기록하면 남은 타일의 범위가 라운드마다 좁아져요. 그래서 한 가지 색을 몰아서 쓰면 남은 패가 읽혀요.' },
      { title: '0의 역할', body: '0은 어떤 타일에도 지거나 비기는 가장 약한 타일이에요. 상대가 큰 숫자를 낼 것 같은 라운드에 0을 버리면, 상대는 큰 타일을 쓰고 나는 손해가 거의 없어요. 같은 이유로 상대의 검정 타일은 0일 수 있다는 의심을 늘 남겨요.' },
      { title: '선과 후의 차이', body: '후 플레이어는 상대 타일의 색을 보고 내니 정보가 더 많아요. 그런데 이기면 다음 라운드의 선이 돼서, 앞선 사람이 계속 먼저 내며 정보를 주게 돼요. 무승부는 선후를 그대로 유지하는 수단이 될 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '서로 모르는 상태에서 동시에 수를 고르는 부분이 있어 **항상 이기는 수는 없어요.** 다만 남은 타일을 꼼꼼히 추리하고, 큰 숫자를 상대의 큰 숫자와 맞바꾸지 않도록 관리하는 사람이 확률적으로 앞서요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 흑과 백은 0–8 타일, 짝수 검정·홀수 흰색, 큰 숫자 1점, 숫자 비공개, 이긴 사람이 다음 선, 무승부면 같은 선이 방송과 같아요.',
      '사이트에서는 한쪽의 점수 차가 남은 라운드 수보다 커지면 9라운드 전에도 바로 끝나요.',
      '사이트에서는 9라운드 뒤 동점이면 연장전 없이 **무승부**로 끝나요.',
      '혼자 하면 AI(쉬움·보통·어려움)와 겨루고, 친구 방에서는 제출 시간을 15·30·60초 중에서 골라요.',
    ] },
  ],
  similar: [
    { name: '구프슈필 (Goofspiel)', players: '2명 이상', alike: '같은 숫자 카드 세트를 나눠 갖고, 한 장씩 내 더 큰 숫자가 이기는 구조예요. 큰 숫자를 언제 쓰느냐가 핵심이에요.', differs: '구프슈필은 모두 동시에 내고, 낸 카드를 공개하며 상품 카드의 점수를 따요.' },
    { name: '다빈치 코드 (Da Vinci Code)', players: '2–4명', alike: '검정과 흰색 숫자 타일을 쓰고, 색만 보이는 상대 타일의 숫자를 추리해요. 흑과 백의 바탕이 된 게임으로 알려져 있어요.', differs: '다빈치 코드는 타일을 순서대로 세워 두고 상대 타일의 숫자를 직접 맞히는 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Black and White rules — The Genius: Rule Breaker, rounds 9 and 11 Death Match',
    description: 'The rules of Black and White (흑과 백) from The Genius: Rule Breaker: nine tiles 0–8, even tiles black and odd tiles white, the leader plays first and the other answers, the higher number scores, numbers are never revealed, nine rounds and a replay on a tie — and play it on PUZZLTHINK.',
    keywords: ['Black and White', 'The Genius Black and White', 'Black & White tile game', '흑과 백', 'The Genius death match'],
  },
  title: 'Black and White — The Genius: Rule Breaker, rounds 9 and 11 Death Match',
  name: 'Black and White (흑과 백)',
  lead: 'Nine tiles from 0 to 8, nine duels. The higher number scores a point; you see only the colour of the opponent’s tile — even black, odd white — and never the number.',
  summary: 'A one-on-one duel of numbered tiles where only colours are seen, used twice this season and again in the Grand Final.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two Death Match candidates.',
      '**Tiles**: 0–8 each; 0, 2, 4, 6 and 8 black, 1, 3, 5 and 7 white.',
      '**Leader**: decided by a set rule for round 1; English Wikipedia says the player with more garnets leads.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Lead', body: 'The leader plays a tile face down; the opponent sees only its colour.' },
      { title: 'Answer', body: 'The other player plays a tile.' },
      { title: 'Judge', body: 'Only the dealer sees the numbers; the higher tile scores a point, equal tiles draw.' },
      { title: 'Hidden', body: 'Numbers are never revealed, even afterwards; infer the opponent’s remaining tiles from your own tile, their colour and the result.' },
      { title: 'Next leader', body: 'The round’s winner leads next; after a draw the same player leads again.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After nine rounds **the higher score wins**; the loser is eliminated.',
      'A tie is replayed with a fresh set of nine tiles.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The same rules were used in rounds 9 and 11, and the game returned in The Genius: Grand Final (season 4). Black Garnet’s (season 3) "Black and White II" is a different game.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The key is **win small, lose big**: a win is one point whatever the margin, so win by one to save big tiles and throw your smallest tile into rounds you will lose.' },
    { type: 'cards', items: [
      { title: 'What colours tell', body: 'Five black tiles (0–8 even) against four white (1–7 odd): a white tile is at most 7, so an 8 wins for sure. Logging colours and results narrows the opponent’s remaining tiles every round, and playing one colour in a streak makes your hand readable.' },
      { title: 'The zero', body: 'Zero loses or draws against everything. Dumping it when the opponent is likely to play big costs you almost nothing while they spend a big tile, and every black tile of theirs might be the zero.' },
      { title: 'Leading and following', body: 'The follower sees the leader’s colour, so following carries more information; but winners lead next, so the player in front keeps giving information first. A draw can be a way to keep the order.' },
    ], columns: 1 },
    { type: 'p', text: 'Choices are partly simultaneous and hidden, so **nothing always wins**; careful tracking of remaining tiles and not trading your big tiles for theirs gives the edge in probability.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      "PUZZLTHINK's Black & White matches the 0–8 tiles, black evens and white odds, one point for the higher tile, hidden numbers, the winner leading next and the same leader after a draw.",
      'On the site a game ends early once one side’s lead exceeds the rounds left.',
      'A tie after nine rounds is **a draw** on the site, with no replay.',
      'Solo you play an AI (easy, normal, hard); rooms with a friend offer 15, 30 or 60 seconds per play.',
    ] },
  ],
  similar: [
    { name: 'Goofspiel', players: '2+', alike: 'Identical number sets played one card at a time, higher wins; timing your big cards is the game.', differs: 'Cards are played at once and revealed, bidding for prize cards.' },
    { name: 'Da Vinci Code', players: '2–4', alike: 'Black and white number tiles whose numbers you infer from colour; known as this game’s inspiration.', differs: 'Tiles stand in order and you guess the opponent’s numbers directly.' },
  ],
});

export const bigDeal = g2Game({ slug: 'big-deal', kind: 'main', rounds: [10], related: ['piggyBank', 'hitStay', 'twoSidedPoker'], check: 'two' }, {
  meta: {
    title: '빅딜 게임 규칙 — 더 지니어스 시즌2 룰 브레이커 10회전 메인 매치, 색깔 조건 협상',
    description: '더 지니어스: 룰 브레이커 10회전 메인 매치 빅딜 게임의 규칙을 정리했어요. 비밀 팀원 게스트, 다섯 색 중 두 개의 고유색, 3라운드 24번의 협상, 마스터와 참가 조건, 승점 분배, 마스터의 거래 취소, 팀 점수와 공동 우승 규칙까지. 원작 보드게임 아임 더 보스와 비교.',
    keywords: ['빅딜 게임', '빅딜', '더 지니어스 빅딜', '룰 브레이커 빅딜', '아임 더 보스', '더 지니어스2'],
  },
  title: '빅딜 게임 — 더 지니어스: 룰 브레이커 10회전 메인 매치',
  name: '빅딜 게임',
  lead: '협상마다 필요한 색깔이 정해져요. 그 색을 가진 사람이 모두 동의해야 승점을 나눠 가질 수 있어요. 협상을 주관하는 마스터는 마음에 안 들면 거래를 깨고 혼자 기본 점수를 챙겨요.',
  summary: '색깔 조건에 맞는 사람들이 모여 승점을 나누는 협상 게임. 플레이어마다 비밀 팀원 게스트가 있어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 남은 플레이어 4명과 게스트 4명. 플레이어는 제비뽑기로 게스트 한 명을 비밀 팀원으로 뽑아요.',
      '**색깔**: 빨강·파랑·초록·노랑·하양 다섯 가지. 여덟 명 모두 제비뽑기로 두 색을 고유색으로 받아요.',
      '**협상**: 3라운드, 라운드마다 8명이 한 번씩 마스터가 되어 모두 24번 협상해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '추첨', body: '협상마다 마스터와 참가 조건(3–5가지 색깔 조합)을 추첨해요.' },
      { title: '모으기', body: '참가 조건의 색깔마다 그 색을 가진 사람 한 명씩이 참여해야 해요. 한 번의 협상에서 한 사람은 자기 고유색 하나만 쓸 수 있어요.' },
      { title: '승점', body: '걸린 승점은 기본 승점 × 색깔 수예요. 기본 승점은 1·2라운드 5점, 3라운드 10점이에요.' },
      { title: '성사', body: '참여한 사람이 모두 동의하면 거래가 이루어지고, 승점을 자유롭게 나눠 가져요.' },
      { title: '취소', body: '합의가 안 되거나 마스터가 원하지 않으면 마스터는 거래를 취소할 수 있어요. 그러면 마스터만 기본 승점을 얻고 그 협상은 끝나요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '3라운드 뒤 팀원이 공개되고, 플레이어와 게스트의 승점을 합친 **팀 점수가 가장 높은 팀이 우승**해요. 가장 낮은 팀의 플레이어가 탈락 후보예요.',
      '우승 팀의 플레이어는 생명의 징표 1개와 가넷 5개, 게스트는 상금 500만 원을 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '공동 우승 처리는 정리마다 달라요. 나무위키는 "플레이어 개인 승점이 높은 팀이 우승, 게스트 상금 없음", 영어 위키백과는 "두 팀 모두 가넷과 생명의 징표를 받고 게스트 상금 없음"으로 적고 있어요.',
      '세 팀이 공동 우승하면 생명의 징표가 모두 무효가 되고, 탈락 후보가 나머지 세 명 중 데스매치 상대를 골라요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '빅딜 게임은 **협상이 깨질 때의 점수가 정해져 있다**는 점이 핵심이에요. 마스터는 취소만 해도 기본 승점을 얻으니, 협상에서 기본 승점보다 적게 받을 바에는 깨는 게 나아요.' },
    { type: 'cards', items: [
      { title: '마스터의 바닥 점수', body: '마스터가 필요한 색을 갖지 않아 협상에 낄 수 없다면, 남에게 점수를 만들어 주느니 취소하고 기본 승점을 챙기는 것이 거의 항상 이득이에요. 그래서 마스터가 참여하지 못하는 협상은 대부분 성사되지 않아요.' },
      { title: '최소 세 명의 담합', body: '참가 조건은 최소 세 색이라, 거래가 되려면 적어도 세 사람이 동의해야 해요. 어떤 팀이 앞서고 있다는 것이 드러나면, 나머지 사람들이 그 팀이 필요한 협상을 일부러 깨서 견제할 수 있어요. 팀원이 비밀인 이유가 여기에 있어요.' },
      { title: '팀원 숨기기', body: '내 게스트 팀원에게 점수를 몰아주면 팀 점수는 오르지만, 누가 누구 팀인지 드러나요. 게스트도 팀이 이겨야 상금을 받으니, 점수를 어떻게 나누느냐가 곧 팀을 숨기는 연기예요.' },
    ], columns: 1 },
    { type: 'p', text: '모든 거래가 동의로만 이루어지니 **혼자 쓸 수 있는 우월 전략은 없어요.** 기본 승점이 3라운드에 두 배가 되므로, 마지막 라운드의 협상과 마스터 차례가 점수 차를 크게 벌려요.' },
  ],
  similar: [
    { name: '아임 더 보스 (I’m the Boss!)', players: '3–6명', alike: '거래마다 필요한 인물을 가진 사람들이 모여 돈을 나누고, 주관자가 거래를 성사시키거나 깨요. 빅딜 게임의 바탕이 된 게임이에요.', differs: '아임 더 보스는 특수 카드로 남을 거래에서 빼거나 끼어들 수 있고, 비밀 팀이 없어요.' },
    { name: '차이나타운 (Chinatown)', players: '3–5명', alike: '자유로운 협상으로 땅과 타일을 맞바꾸고, 거래 조건을 마음대로 정해요.', differs: '차이나타운은 가게를 완성해 수입을 얻는 게임이고, 거래를 주관하는 마스터가 없어요.' },
  ],
}, {
  meta: {
    title: 'Big Deal rules — The Genius: Rule Breaker, round 10 main match',
    description: 'The rules of the Big Deal game (빅딜 게임) from The Genius: Rule Breaker: secret guest teammates, two of five colours each, 24 negotiations over three rounds, the master and the colour condition, splitting points, the master cancelling a deal, team scores and the tie rules — compared with I’m the Boss!.',
    keywords: ['Big Deal Game', 'The Genius Big Deal', "I'm the Boss", 'The Genius Rule Breaker', '빅딜 게임'],
  },
  title: 'Big Deal — The Genius: Rule Breaker, round 10 main match',
  name: 'Big Deal (빅딜 게임)',
  lead: 'Each negotiation names the colours it needs, and everyone holding them must agree before points are shared. The master running it can break the deal and keep the base points alone.',
  summary: 'A negotiation game where players matching a colour condition share points, each contestant with a secret guest teammate.',
  setup: [
    { type: 'list', items: [
      '**Players**: the four remaining contestants and four guests; each contestant secretly draws one guest as a teammate.',
      '**Colours**: red, blue, green, yellow and white; all eight players draw two as their own.',
      '**Negotiations**: three rounds, each of the eight acting as master once per round — 24 in all.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Draw', body: 'Each negotiation draws a master and a condition of three to five colours.' },
      { title: 'Assemble', body: 'One holder of each required colour must take part; in one deal a player can use only one of their colours.' },
      { title: 'Stakes', body: 'The pot is the base value × number of colours; the base is 5 in rounds 1–2 and 10 in round 3.' },
      { title: 'Deal', body: 'If every participant agrees, the deal goes through and the points are split freely.' },
      { title: 'Cancel', body: 'With no agreement, or if the master does not want the deal, the master may cancel it and alone takes the base value.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After three rounds teams are revealed and **the team with the most combined points wins**; the contestant on the lowest team is the Death Match candidate.',
      'The winning contestant gets a Token of Life and five garnets; the guest teammate wins ₩5,000,000.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Ties are reported differently: the fan wiki says the team whose contestant scored more wins and guests get nothing; English Wikipedia says both contestants get the garnets and Tokens and guests get nothing.',
      'If three teams tie, all Tokens of Life are void and the candidate picks an opponent from the other three.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The key is that **a broken deal has a fixed value**: cancelling gives the master the base points, so accepting less than that in a deal never pays.' },
    { type: 'cards', items: [
      { title: 'The master’s floor', body: 'A master without a required colour cannot take part, so cancelling and pocketing the base almost always beats making points for others — such deals rarely go through.' },
      { title: 'Three to make a deal', body: 'Every condition has at least three colours, so at least three must agree. Once a team is seen to lead, everyone else can sink the deals it needs; that is why teams are secret.' },
      { title: 'Hiding your teammate', body: 'Feeding points to your guest raises the team total but reveals the pairing. Guests win money only if their team wins, so how points are split is also an act of concealment.' },
    ], columns: 1 },
    { type: 'p', text: 'Every deal needs consent, so **there is no solo dominant strategy**; with the base doubling in round 3, the last round’s deals and masters swing the result most.' },
  ],
  similar: [
    { name: "I'm the Boss!", players: '3–6', alike: 'Deals need players holding certain people, money is split by negotiation, and the deal-maker can close or break it; the game this is based on.', differs: 'Special cards push players out of deals or in, and there are no secret teams.' },
    { name: 'Chinatown', players: '3–5', alike: 'Open negotiation with any terms you like.', differs: 'You build shops for income; nobody presides over deals.' },
  ],
});

export const elevator = g2Game({ slug: 'elevator-game', kind: 'main', rounds: [11], related: ['monorail', 'russianRoulette', 'blackWhite'], check: 'two' }, {
  meta: {
    title: '엘리베이터 게임 규칙 — 더 지니어스 시즌2 룰 브레이커 11회전 메인 매치, 0과 1로 움직이는 뱀주사위놀이',
    description: '더 지니어스: 룰 브레이커 11회전 메인 매치 엘리베이터 게임의 규칙을 정리했어요. 지니어스 팀 3명과 리벤저 팀 3명, 1–100호 건물, 0·1 버튼과 1을 누른 사람 수만큼 전진, 상행·하행 엘리베이터, 2점·1점 표식 배치, 개인 승점과 팀 승리 보상까지.',
    keywords: ['엘리베이터 게임', '엘리베이터', '더 지니어스 엘리베이터', '룰 브레이커 엘리베이터', '더 지니어스2'],
  },
  title: '엘리베이터 게임 — 더 지니어스: 룰 브레이커 11회전 메인 매치',
  name: '엘리베이터 게임',
  lead: '100호짜리 건물에서 두 팀의 말이 1호부터 출발해요. 여섯 명이 0이나 1 버튼을 누르고, 1을 누른 사람 수만큼 말이 올라가요. 지니어스 팀은 같은 편이지만, 결승에 가는 건 승점이 가장 높은 한 명뿐이에요.',
  summary: '0과 1 버튼으로 말을 움직이는 엘리베이터판 뱀주사위놀이. 겉으로는 팀전, 속으로는 개인전이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 남은 플레이어 3명의 지니어스 팀과, 이미 탈락한 3명이 돌아온 리벤저 팀.',
      '**판**: 1–100호 건물. 칸에 따라 위로 가는 엘리베이터와 아래로 가는 엘리베이터가 있어요.',
      '**말**: 팀마다 1개, 1호에서 출발해요.',
      '**표식**: 지니어스 팀 3명은 자기 이름이 적힌 표식 10개(2점 2개, 1점 8개)를 받아요. 가넷이 많은 사람부터 돌아가며, 엘리베이터 타는 칸이 아닌 곳 10곳에 놓아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '버튼', body: '여섯 명이 0이나 1 중 하나를 눌러요. 1을 누른 사람 수만큼 차례인 팀의 말이 전진해요(0–6칸).' },
      { title: '비공개', body: '무엇을 누를지 상의할 수는 있지만, 누가 무엇을 눌렀는지는 공개되지 않고 1의 개수만 알려져요.' },
      { title: '엘리베이터', body: '말이 멈춘 칸에 상행이나 하행 엘리베이터가 있으면, 연결된 칸으로 바로 옮겨요.' },
      { title: '표식', body: '어느 팀의 말이든 표식이 있는 칸에 멈추면, 그 표식의 주인이 표식 점수를 얻어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '먼저 **100호에 도착하거나 지나간 팀**이 이겨요.',
      '팀 승패와 상관없이 지니어스 팀에서 **승점이 가장 높은 사람**이 우승해 생명의 징표를 받고, 나머지 두 명은 데스매치에 가요.',
      '지니어스 팀이 이기면 최고 득점자가 가넷 20개를 받아요. 리벤저 팀이 이기면 가넷 20개 가치인 2천만 원을 그동안 탈락한 10명이 200만 원씩 나눠 가져요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '최고 승점이 같으면 가넷이 많은 사람이 우승자예요.',
      '두 팀이 어떤 순서로 말을 움직였는지, 엘리베이터가 정확히 어느 칸에 있었는지는 정리된 자료가 부족해 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '엘리베이터 게임은 **팀 승리와 개인 승점이 따로 노는 게임**이에요. 지니어스 팀 세 명은 한 팀이지만 결승에 가는 건 한 명뿐이라, 팀을 이기게 하는 것보다 내 표식에 말을 세우는 것이 더 중요해요.' },
    { type: 'cards', items: [
      { title: '반드시 지나야 하는 칸', body: '한 번에 0–6칸만 움직이고 하행 엘리베이터는 피해야 하니, 100호 직전의 몇몇 칸은 거의 반드시 밟게 돼요. 그런 칸에 놓은 표식이 가장 값지고, 표식을 고르는 순서(가넷 순)가 이미 승부의 일부예요.' },
      { title: '한 표의 무게', body: '1의 총수만 공개되니, 누가 0을 눌렀는지는 숨길 수 있어요. 내 표식이 앞에 있으면 남들은 1을 조절해 그 칸을 건너뛰려 하고, 나는 정확히 멈추게 하려 해요. 여섯 명 중 세 명이 리벤저라, 지니어스 팀 한 명이 리벤저와 손잡으면 숫자를 거의 마음대로 맞출 수 있어요.' },
      { title: '리벤저의 목표는 단순하다', body: '리벤저 팀은 탈락 걱정이 없고 팀이 이기는 것만이 목표예요. 그래서 리벤저 팀은 하나로 움직이고, 지니어스 팀은 서로 견제하느라 흩어지기 쉬워요.' },
    ], columns: 1 },
    { type: 'p', text: '버튼은 동시에 비밀로 누르니 **확정된 우월 전략은 없어요.** 다만 지니어스 팀 안의 이해관계가 엇갈리는 구조라, 리벤저 팀과 거래할 수 있는 사람이 가장 큰 영향력을 가져요.' },
  ],
  similar: [
    { name: '뱀주사위놀이 (Snakes and Ladders)', players: '2명 이상', alike: '1부터 100까지의 판에서 사다리로 올라가고 뱀으로 내려가요. 엘리베이터 게임의 바탕이에요.', differs: '뱀주사위놀이는 주사위로 움직여 선택할 것이 없고, 표식 점수도 없어요.' },
    { name: '레지스탕스 (The Resistance)', players: '5–10명', alike: '여러 사람이 비밀로 카드를 내고, 결과의 개수만 공개돼 누가 무엇을 냈는지는 추리해야 해요.', differs: '레지스탕스는 숨은 스파이를 찾는 게임이고, 말을 움직이지 않아요.' },
  ],
}, {
  meta: {
    title: 'Elevator Game rules — The Genius: Rule Breaker, round 11 main match',
    description: 'The rules of the Elevator Game (엘리베이터 게임) from The Genius: Rule Breaker: three contestants against three returning players, a 100-room building, 0 and 1 buttons moving the token by the number of 1s, up and down elevators, 2-point and 1-point markers, individual scores and the team rewards.',
    keywords: ['Elevator Game', 'The Genius Elevator', 'The Genius Rule Breaker', '엘리베이터 게임', '더 지니어스2'],
  },
  title: 'Elevator Game — The Genius: Rule Breaker, round 11 main match',
  name: 'Elevator Game (엘리베이터 게임)',
  lead: 'Two teams’ tokens start in room 1 of a 100-room building. Six players press 0 or 1 and the token climbs by the number of 1s. The contestants are one team, yet only their top scorer reaches the final.',
  summary: 'Snakes and Ladders with elevators and 0/1 buttons — a team game on the surface, an individual one underneath.',
  setup: [
    { type: 'list', items: [
      '**Players**: the three remaining contestants against a "Revenger" team of three eliminated players.',
      '**Board**: rooms 1–100, with elevators going up or down from certain rooms.',
      '**Tokens**: one per team, starting in room 1.',
      '**Markers**: each contestant has ten (two worth 2 points, eight worth 1), placed in garnet order on rooms that are not elevator entrances.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Buttons', body: 'All six press 0 or 1; the moving team’s token advances by the number of 1s (0–6 rooms).' },
      { title: 'Secret', body: 'Players may discuss, but only the total of 1s is revealed, never who pressed what.' },
      { title: 'Elevators', body: 'A token stopping on an elevator moves straight to the room it connects to.' },
      { title: 'Markers', body: 'Whenever either team’s token stops on a marker, its owner scores it.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first team to reach or pass room 100** wins.',
      'Whatever the team result, **the contestant with the most points** wins a Token of Life; the other two go to the Death Match.',
      'If the contestants win, the top scorer gets 20 garnets; if the Revengers win, ₩20,000,000 is shared by all ten eliminated players.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If the top scores tie, the contestant with more garnets wins.',
      'The order in which the teams moved and the exact elevator rooms are not documented well enough to include.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Here **the team result and individual scores pull apart**: three contestants share a team, but only one goes to the final, so stopping the token on your own markers matters more than the team winning.' },
    { type: 'cards', items: [
      { title: 'Rooms you must cross', body: 'Moving 0–6 at a time and avoiding down elevators means a few rooms just before 100 are nearly unavoidable; markers there are the most valuable, and the garnet order for placing them is already part of the contest.' },
      { title: 'The weight of one press', body: 'Only the total of 1s is public, so a 0 can be hidden. With your marker ahead, others adjust their 1s to skip it while you try to land exactly; three of the six are Revengers, so a contestant who deals with them can nearly set the number.' },
      { title: 'The Revengers’ goal is simple', body: 'They cannot be eliminated and want only the team win, so they move as one while the contestants watch each other.' },
    ], columns: 1 },
    { type: 'p', text: 'Buttons are secret and simultaneous, so **there is no fixed dominant strategy**; but with the contestants’ interests split, whoever can bargain with the Revengers holds the most influence.' },
  ],
  similar: [
    { name: 'Snakes and Ladders', players: '2+', alike: 'A 1–100 board where ladders lift you and snakes drop you; the model for this game.', differs: 'Dice decide moves, so there are no choices and no markers.' },
    { name: 'The Resistance', players: '5–10', alike: 'Secret cards are played and only the count of each is revealed, so who played what must be inferred.', differs: 'It is about finding hidden spies; nothing moves on a board.' },
  ],
});

export const truthDetector = g2Game({ slug: 'truth-detector', kind: 'final', rounds: [12], label: { ko: '결승 2경기', en: 'Final, game 2' }, related: ['indianPoker', 'blackWhite2', 'hexagon'], check: 'two', extra: [namuGame('진실탐지기', 'Truth Detector')] }, {
  meta: {
    title: '진실탐지기 규칙 — 더 지니어스 시즌2 룰 브레이커 결승 2경기, 거짓말로만 답하는 숫자 맞히기',
    description: '더 지니어스: 룰 브레이커 결승 두 번째 경기 진실탐지기의 규칙을 정리했어요. 0–9로 만드는 네 자리 패스워드, 번갈아 하는 질문, 반드시 거짓으로 답하기, 진실 페널티로 없는 숫자 공개, 금지된 대답, 정답 선언, 선 플레이어·진실 페널티 면제·더블 턴 아이템까지.',
    keywords: ['진실탐지기', '진실 탐지기', '더 지니어스 진실탐지기', '룰 브레이커 결승', '숫자야구', '더 지니어스2'],
  },
  title: '진실탐지기 — 더 지니어스: 룰 브레이커 결승 2경기',
  name: '진실탐지기',
  lead: '서로의 네 자리 패스워드를 질문으로 알아내요. 단, 질문을 받은 사람은 반드시 거짓으로 답해야 해요. 진실을 말하면 탐지기가 울리고 벌칙이 따라요.',
  summary: '거짓말로만 답해야 하는 질문으로 상대의 네 자리 숫자를 먼저 맞히는 결승 게임. 숫자야구가 모티브예요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 2명.',
      '**패스워드**: 0–9로 네 자리를 만들어요. 제한이 없어 1111처럼 같은 숫자만 써도 되고, 1234처럼 모두 달라도 돼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '질문', body: '선 플레이어부터 번갈아 상대의 패스워드에 대해 질문해요.' },
      { title: '거짓 대답', body: '질문을 받은 사람은 반드시 거짓으로 답해요.' },
      { title: '진실 페널티', body: '진실을 말하면 진실 탐지기가 울리고, 0–9 중 자기 패스워드에 없는 숫자 하나를 상대에게 알려 줘야 해요.' },
      { title: '정답', body: '알아냈다고 생각하면 "정답"을 외치고 패스워드를 말해요. 정답 선언도 한 차례를 써요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '상대 패스워드의 **숫자와 순서를 먼저 정확히 맞힌 사람**이 이겨요.',
      '결승은 세 경기 중 두 경기를 먼저 이긴 사람이 우승해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '질문은 패스워드와 관련된 것만 할 수 있어요. 대답도 질문과 상관없는 말, 불가능한 말, 회피하는 말은 안 돼요.',
      '정답이 틀리면 차례가 상대에게 넘어가요(영어 위키백과).',
      '아이템 세 가지가 있었어요. **선 플레이어**(먼저 질문), **진실 페널티 면제**(실수로 진실을 말해도 숫자를 알려 주지 않음), **더블 턴**(한 차례에 질문 2개, 또는 질문과 정답을 함께).',
    ] },
  ],
  analysis: [
    { type: 'p', text: '진실탐지기의 가장 중요한 사실은 **예·아니요 질문에 대한 거짓말은 진실만큼 정확한 정보**라는 점이에요. "첫 자리가 짝수인가요?"에 "아니요"라는 거짓말이 돌아오면 첫 자리는 짝수예요.' },
    { type: 'cards', items: [
      { title: '질문은 두 갈래로', body: '답이 두 가지뿐인 질문은 거짓말을 뒤집기만 하면 돼서 한 번에 경우의 수를 절반으로 줄여요. 반대로 "첫 자리가 몇인가요?" 같은 질문에 대한 거짓말은 한 숫자만 지워 줘서 거의 쓸모가 없어요. 네 자리 패스워드는 1만 가지라, 절반씩 줄이면 약 14번이면 하나로 좁혀져요.' },
      { title: '먼저 묻는 사람이 유리하다', body: '양쪽 모두 같은 효율로 묻는다면, 같은 횟수에 답을 찾고 먼저 묻기 시작한 사람이 먼저 정답을 외쳐요. 그래서 선 플레이어 아이템과 더블 턴이 강하고, 정답 선언에 차례를 쓰는 규칙이 차이를 한 수 줄여요.' },
      { title: '진실을 말하게 만들기', body: '답하는 쪽은 거짓말만 하면 되니 막을 방법이 거의 없어요. 남은 변수는 실수예요. 이중 부정이나 복잡한 조건을 섞은 질문은 상대가 무심코 진실을 말하게 만들 수 있고, 그러면 없는 숫자 하나를 덤으로 얻어요.' },
    ], columns: 1 },
    { type: 'p', text: '예·아니요 질문으로 경우의 수를 반씩 줄이는 것이 **사실상의 우월 전략**이에요. 둘 다 이 방법을 쓰면 승부는 선후와 아이템, 그리고 누가 먼저 대답 실수를 하느냐로 갈려요.' },
  ],
  similar: [
    { name: '마스터마인드 (Mastermind)', players: '2명', alike: '상대의 숨긴 코드를 질문과 힌트로 좁혀 맞혀요.', differs: '마스터마인드는 추측한 코드에 대한 정확한 힌트를 받고, 거짓말 규칙이 없어요.' },
    { name: '숫자야구 (Bulls and Cows)', players: '2명', alike: '네 자리 숫자를 서로 맞히는 진실탐지기의 모티브예요.', differs: '숫자야구는 추측마다 스트라이크·볼로 참인 정보를 받아요.' },
  ],
}, {
  meta: {
    title: 'Truth Detector rules — The Genius: Rule Breaker, final game 2',
    description: 'The rules of the Truth Detector (진실탐지기) from The Genius: Rule Breaker’s final: four-digit codes from 0–9, alternating questions that must be answered with a lie, revealing an unused digit as the truth penalty, banned answers, calling the answer, and the first-player, penalty-exemption and double-turn advantages.',
    keywords: ['Truth Detector', 'The Genius Truth Detector', 'The Genius Rule Breaker final', '진실탐지기', 'Bulls and Cows'],
  },
  title: 'Truth Detector — The Genius: Rule Breaker, final game 2',
  name: 'Truth Detector (진실탐지기)',
  lead: 'Find the opponent’s four-digit code by asking questions — but every answer must be a lie. Tell the truth and the detector sounds, with a penalty.',
  summary: 'A final game of guessing a four-digit code from questions that must be answered with lies, inspired by Bulls and Cows.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two finalists.',
      '**Code**: four digits from 0–9 with no restrictions — 1111 is as legal as 1234.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Ask', body: 'Starting with the first player, take turns asking about the other’s code.' },
      { title: 'Lie', body: 'The one asked must answer with a lie.' },
      { title: 'Truth penalty', body: 'A truthful answer sets off the detector, and the answerer must reveal a digit that is not in their code.' },
      { title: 'Answer', body: 'Call "answer" and say the code when you think you have it; this uses your turn.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first to name the code exactly, digits and order,** wins.',
      'The final goes to whoever wins two of its three games first.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Questions must concern the code, and answers may not be irrelevant, impossible or evasive.',
      'A wrong answer passes the turn (English Wikipedia).',
      'Three advantages existed: **first player**, **truth-penalty exemption** (no digit revealed after a slip) and **double turn** (two questions, or a question and an answer, in one turn).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The crucial fact is that **a lie to a yes-or-no question is exactly as informative as the truth**: answer "no" to "is the first digit even?" and the first digit is even.' },
    { type: 'cards', items: [
      { title: 'Ask in two ways', body: 'With two possible answers you just invert the lie, halving the possibilities each time; a lie to "what is the first digit?" rules out only one digit and is nearly useless. Ten thousand codes halve to one in about fourteen questions.' },
      { title: 'Asking first wins ties', body: 'If both ask equally well, both need the same number of questions and the first to start calls first. Hence the strength of the first-player and double-turn advantages, and why spending a turn on the call matters.' },
      { title: 'Inducing the truth', body: 'The answerer only has to lie, so there is little defence — except mistakes. Double negatives and tangled conditions can trip an opponent into telling the truth and handing over a free unused digit.' },
    ], columns: 1 },
    { type: 'p', text: 'Halving the possibilities with yes-or-no questions is **effectively the dominant strategy**; if both use it, the game comes down to turn order, advantages and who slips first.' },
  ],
  similar: [
    { name: 'Mastermind', players: '2', alike: 'Narrow down a hidden code from feedback.', differs: 'Feedback on each guess is truthful and exact; no lying rule.' },
    { name: 'Bulls and Cows', players: '2', alike: 'Guessing each other’s four-digit numbers; the Truth Detector’s inspiration.', differs: 'Each guess gets truthful bulls-and-cows feedback.' },
  ],
});
