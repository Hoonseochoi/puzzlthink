// 더 지니어스: 게임의 법칙, final game 2: 결! 합! (new in the final; later a death match in every season). Playable on PUZZLTHINK.
import { g1Game, namuPage } from './shared';

export const gyulHap = g1Game('gyul-hap', 'final', {
  when: { ko: '결승 2회전', en: 'Final, game 2' },
  episode: { ko: '12화', en: 'Episode 12' },
}, [12], ['nemoCount', 'hexagon', 'colorlink'], {
  meta: {
    title: '결! 합! 규칙 — 더 지니어스 시즌1 결승 2회전, 아홉 장에서 합 찾고 결 외치기',
    description: '더 지니어스: 게임의 법칙 결승 2회전 결! 합!의 규칙을 정리했어요. 도형·도형 색·배경색 세 속성의 그림 27장, 라운드마다 9장 공개, 모두 같거나 모두 다른 세 장이 합, 10초 차례와 5초 호명, 합 +1·오답 −1, 결 +3, 틀린 결 뒤 게스트의 기회, 합 개수 공개·점수 2배 아이템, 10라운드와 PUZZLTHINK 버전과의 차이까지.',
    keywords: ['결합', '결! 합!', '결합 게임', '더 지니어스 결합', '더 지니어스 결승', '더 지니어스 시즌1', '결합 규칙'],
  },
  title: '결! 합! — 더 지니어스 시즌1 결승 2회전',
  name: '결! 합!',
  lead: '그림 아홉 장 중에서 도형, 도형 색, 배경색이 각각 모두 같거나 모두 다른 세 장을 찾아 "합!"을 외쳐요. 더 이상 합이 없다고 생각되면 "결!"을 외쳐 큰 점수를 노려요.',
  summary: '아홉 장의 그림에서 조건을 만족하는 세 장(합)을 찾고, 남은 합이 없을 때 결을 외치는 관찰·계산 대결. 결승에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 2명. 관전석에는 그때까지의 탈락자들이 게스트로 앉아요.',
      '**그림**: 도형(○, △, □), 도형의 색(파랑, 빨강, 노랑), 배경색(흰색, 회색, 검정)을 하나씩 조합한 27장. 모두 서로 달라요.',
      '**라운드**: 라운드마다 27장 중 9장이 공개돼요. 모두 10라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '합 찾기', body: '세 가지 속성이 **각각 모두 같거나 모두 다른** 세 장의 그림이 "합"이에요. 예를 들어 배경이 모두 같고, 도형이 모두 같고, 도형 색이 모두 다르면 합이에요. 도형 두 개는 네모, 하나는 세모라면 합이 아니에요.' },
      { title: '차례', body: '두 사람이 번갈아 10초씩 차례를 가져요. 합을 찾았으면 "합"을 외치고 5초 안에 세 그림의 번호를 불러요.' },
      { title: '채점', body: '부른 세 장이 합이면 +1점, 아니면 −1점이에요. 차례 10초 동안 아무것도 부르지 않으면 점수 변동 없이 상대에게 넘어가요. 단, "합"을 외친 뒤 번호를 부르지 않으면 틀린 것으로 쳐요.' },
      { title: '결', body: '아홉 장에 더 이상 합이 없다고 판단되면 "결"을 외칠 수 있어요. 정말 남은 합이 없으면 +3점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '10라운드 뒤 **점수가 더 높은 사람**이 이겨요.',
      '결승은 세 경기 중 두 경기를 먼저 이긴 사람이 우승이에요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**틀린 결**: 합이 남아 있는데 결을 외치면 −1점이고, 기회가 관전석의 게스트들에게 넘어가요. 게스트 중 한 명이 합을 맞히면 그 게스트가 지지하는 결승 진출자가 +1점을 얻고, 기회는 다시 결승 진출자에게 돌아와요. 게스트의 오답은 점수에 영향이 없어요.',
      '**아이템**: 이 경기에서는 "합 개수 공개"(라운드 시작 전에 쓰면 그 라운드의 합이 몇 개인지 나만 알게 돼요)와 "점수 2배"(그 라운드의 점수 변화를 두 배로) 아이템을 쓸 수 있었어요.',
      '이미 나온 합을 다시 부르는 경우의 처리는 시즌1 규칙 정리에 따로 적혀 있지 않아요. 이후 시즌의 규칙에서는 감점이에요.',
      '결! 합!은 이후 시즌2·3·4에도 모두 나왔어요(시즌2·4는 데스 매치, 시즌3은 1인 미션). 시즌별 규칙 차이는 각 시즌 페이지에서 다뤄요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '결! 합!의 바탕에는 깔끔한 수학이 있어요. 27장은 세 속성 × 세 값의 모든 조합이라, **아무 두 장을 골라도 합을 완성하는 세 번째 그림은 정확히 하나로 정해져요.** 같은 속성은 같은 값, 다른 속성은 남은 하나의 값이 되니까요. 그래서 합 찾기는 "두 장을 고르고, 필요한 세 번째가 판에 있는지 확인하는" 작업이에요.' },
    { type: 'cards', items: [
      { title: '36쌍을 빠르게 훑기', body: '아홉 장에서 두 장을 고르는 방법은 36가지예요. 한 장을 기준으로 정하고 나머지 여덟 장과 짝지어 세 번째를 떠올리면, 8쌍씩 체계적으로 확인할 수 있어요. 무작정 세 장을 맞춰 보는 것보다 빠르고 빠뜨리는 합이 적어요.' },
      { title: '결 3점의 무게', body: '결은 합 세 개와 같은 점수예요. 그래서 마지막 합 하나가 남았을 때 그것을 내가 맞히면 1점을 얻지만, 상대에게 결을 외칠 기회(3점)를 넘겨줘요. 남은 합을 알면서도 패스하고, 상대가 그 합을 부른 뒤 내가 결을 외치는 편이 더 이득일 수 있어요. 합 개수를 정확히 세는 사람이 이 싸움에서 이겨요.' },
      { title: '틀린 결과 관전석', body: '결승 규칙에서는 틀린 결 뒤의 기회가 게스트에게 가고, 게스트가 맞히면 그 게스트가 지지하는 쪽이 1점을 얻어요. 나를 지지하는 게스트가 많고 실력이 좋을수록 틀린 결의 손해가 줄어드니, 확신이 조금 모자라도 결을 시도할 여지가 커져요.' },
    ], columns: 1 },
    { type: 'p', text: '합의 개수는 판마다 달라서 선후공에 따라 유불리가 생길 수 있지만, 기본적으로 **관찰과 계산 속도, 합 개수를 끝까지 세는 정확함**이 승부를 가르는 실력 게임이에요. 이길 수 있는 우월 전략은 없고, 마지막 합과 결을 둘러싼 판단이 점수 차를 크게 만들어요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 결합은 27장(도형·도형 색·배경색 세 속성), 9장 공개, 합 +1·오답 −1, 결 +3·틀린 결 −1, 10라운드가 방송과 같아요. 맞는 결을 외치면 다음 판으로 넘어가요.',
      '혼자 하는 **10분·5분 챌린지**와 시간 제한 없는 연습이 있어요. 혼자 하기에서 틀린 결은 −1점만 받고 같은 판이 그대로 남아요.',
      '친구 방은 **2–4명**이 차례로 겨뤄요. 차례 시간은 10·15·20초 중에서 고르고, 첫 차례는 무작위예요. 친구전에서 틀린 결은 −1점과 함께 차례가 넘어가고, 시간이 지나면 점수 변동 없이 차례만 넘어가요. 10라운드 총점이 같으면 공동 승리예요.',
      '관전석의 게스트 기회, 합 개수 공개·점수 2배 같은 결승 아이템은 없어요. 이미 나온 합을 다시 부르면 오답(−1점)으로 처리해요.',
    ] },
  ],
  similar: [
    { name: 'SET', players: '1명 이상', alike: '네 속성이 각각 모두 같거나 모두 다른 세 장을 찾아 먼저 외치는 카드 게임이에요. 결! 합!의 바탕이 된 것으로 알려져 있어요.', differs: 'SET은 속성이 네 가지(81장)이고 12장을 펼쳐 놓으며, 차례 없이 먼저 찾은 사람이 가져가요. "결" 같은 선언은 없어요.' },
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '여러 그림 중 조건에 맞는 것을 남보다 빨리 찾아내는 관찰력 게임이에요.', differs: '두 카드 사이의 같은 그림 하나를 찾는 단순한 규칙이고, 계산이나 감점이 없어요.' },
  ],
}, {
  meta: {
    title: 'Gyul! Hap! rules — The Genius season 1 final, game 2',
    description: 'The rules of Gyul! Hap! (결! 합!) from The Genius: Rules of the Game final: 27 pictures combining shape, shape colour and background, nine shown each round, three that are all same or all different in every feature make a hap, ten-second turns, +1 and −1, +3 for a correct gyul, guests stepping in after a wrong gyul, the final’s items, ten rounds, and how the PUZZLTHINK version differs.',
    keywords: ['Gyul Hap', 'Gyeol Hap', 'The Genius Gyul Hap', 'The Genius final', 'Set card game Korean', '더 지니어스 결합'],
  },
  title: 'Gyul! Hap! — The Genius season 1 final, game 2',
  name: 'Gyul! Hap! (결! 합!)',
  lead: 'Among nine pictures, find three that are all the same or all different in shape, shape colour and background, and call "Hap!". When you think none are left, call "Gyul!" for a big score.',
  summary: 'A duel of spotting valid trios (hap) among nine pictures and calling "gyul" when none remain — introduced in the final.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two finalists, with the eliminated players seated as guests.',
      '**Pictures**: 27, each combining a shape (○, △, □), a shape colour (blue, red, yellow) and a background (white, grey, black) — all different.',
      '**Rounds**: nine of the 27 are shown each round, for ten rounds.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Find a hap', body: 'Three pictures that are, **feature by feature, all the same or all different** make a hap — for example the same background, the same shape and three different colours. Two squares and a triangle is not one.' },
      { title: 'Turns', body: 'The two alternate ten-second turns; call "hap" and name the three numbers within five seconds.' },
      { title: 'Score', body: 'A real hap is +1, a wrong one −1. Saying nothing in ten seconds passes the turn without change, but calling "hap" and naming nothing counts as wrong.' },
      { title: 'Gyul', body: 'Call "gyul" when you believe no hap remains; if none does, +3.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After ten rounds **the higher score** wins.',
      'The final goes to whoever first wins two of its three games.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Wrong gyul**: −1, and the chance passes to the guests; a guest who finds a hap earns +1 for the finalist they support, then play returns to the finalists. Guests’ mistakes cost nothing.',
      '**Items**: "number of haps" (used before a round, tells only you how many there are) and "double score" (doubles that round’s changes).',
      'Season 1’s rules as summarised do not say what happens if an already-found hap is called again; later seasons penalise it.',
      'Gyul! Hap! appeared in every later season too (death matches in seasons 2 and 4, a solo mission in season 3); those seasons’ pages cover their rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'There is neat maths underneath. The 27 pictures are every combination of three features with three values, so **any two pictures fix exactly one third picture that completes a hap**: same features stay the same, different ones take the remaining value. Finding haps means picking two and checking whether the needed third is on the board.' },
    { type: 'cards', items: [
      { title: 'Sweep the 36 pairs', body: 'Nine pictures make 36 pairs. Anchor on one picture and pair it with the other eight, imagining the third each time; it is faster than testing trios and misses fewer haps.' },
      { title: 'The weight of gyul', body: 'A gyul is worth three haps. With one hap left, taking it scores 1 but hands your opponent the chance to call gyul for 3; passing, letting them take the last hap and then calling gyul yourself can be better. Whoever counts the haps exactly wins this fight.' },
      { title: 'Wrong gyuls and the gallery', body: 'In the final, a wrong gyul passes the chance to the guests, and a correct guest scores for the finalist they back. The more able guests support you, the cheaper a wrong gyul, and the bolder you can be.' },
    ], columns: 1 },
    { type: 'p', text: 'The number of haps varies by board, so turn order can matter, but this is fundamentally a **skill game of observation, calculation speed and counting haps to the end**. No strategy dominates; judgement around the last hap and the gyul makes the biggest swings.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Gyul Hap matches the 27 pictures (shape, shape colour, background), nine on the board, +1/−1 for haps, +3/−1 for gyul and ten rounds; a correct gyul deals the next board.',
      'Solo there are **10- and 5-minute challenges** and untimed practice; a wrong gyul in solo costs 1 point and the board stays.',
      'Friend rooms seat **2–4 players** taking turns, with 10, 15 or 20-second turns and a random first player. A wrong gyul costs 1 point and passes the turn; a timeout just passes; equal totals after ten rounds share the win.',
      'There are no guest chances or final items, and calling an already-found hap counts as wrong (−1).',
    ] },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'Find three cards that are all the same or all different in every feature, and call it first; widely cited as Gyul! Hap!’s inspiration.', differs: 'Four features (81 cards), twelve on the table, no turns, and no "gyul" call.' },
    { name: 'Dobble / Spot It!', players: '2–8', alike: 'A speed-observation game of spotting the right picture before others.', differs: 'You find the one shared symbol between two cards; no arithmetic or penalties.' },
  ],
}, { extra: [namuPage('결! 합!', 'rules and later seasons')], site: { id: 'gyulhap', name: { ko: '결합', en: 'Gyul Hap' }, file: 'src/lib/gyulhap.ts' } });
