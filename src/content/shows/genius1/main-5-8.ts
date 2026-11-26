// 더 지니어스: 게임의 법칙, main matches of rounds 5–8: 사기 경마, 도둑잡기, 오픈 패스, 콩의 딜레마.
import { g1Game, round } from './shared';

export const horseRace = g1Game('fraud-horse-race', 'main', round(5), [5], ['piggyBank', 'hitStay', 'indianPoker'], {
  meta: {
    title: '사기 경마 규칙 — 더 지니어스 시즌1 5회전 메인 매치, 순위가 정해진 경주에 거는 정보전',
    description: '더 지니어스: 게임의 법칙 5회전 메인 매치 사기 경마의 규칙을 정리했어요. 순위가 미리 정해진 말 8마리와 20칸 코스, 12라운드, 라운드당 0–3칸 이동, 한 사람에 단서 하나와 칩 20개, 3가넷짜리 추가 단서, 라운드당 3칩 베팅 제한, 베팅 금지 구역, 1·2등 말의 배당률 계산과 칩 10개당 가넷 1개까지.',
    keywords: ['사기 경마', '사기경마', '더 지니어스 사기 경마', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 5회전'],
  },
  title: '사기 경마 — 더 지니어스 시즌1 5회전 메인 매치',
  name: '사기 경마',
  lead: '여덟 마리 말의 순위는 이미 정해져 있어요. 각자 받은 단서 한 조각을 맞춰 보면 1·2등이 보이지만, 같은 말에 거는 사람이 많을수록 배당은 줄어들어요.',
  summary: '진실을 나누면 배당이 줄고, 거짓을 퍼뜨리면 배당이 커지는 경마 베팅 정보전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 9명.',
      '**경주**: 말 8마리가 20칸 코스를 12라운드에 걸쳐 달려요. 한 라운드에 말마다 0–3칸씩 움직이고, 최종 순위는 미리 정해져 있어요.',
      '**나눠 주는 것**: 한 사람당 말의 순위에 관한 단서 하나와 베팅용 칩 20개. 칩은 주고받을 수 없어요.',
      '**추가 단서**: 세 종류가 있고, 하나에 가넷 3개를 내면 볼 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '베팅', body: '라운드마다 원하는 말에 칩을 걸어요. 여러 말에 나눠 걸어도 되지만 **한 라운드에 최대 3개**까지예요.' },
      { title: '말 이동', body: '말들이 정해진 대로 0–3칸씩 움직여요.' },
      { title: '베팅 금지 구역', body: '결승점 앞의 베팅 금지 구역에 들어간 말에는 더 이상 걸 수 없어요. 영문 위키백과 정리는 결승점 3칸 이내라고 적고 있어요.' },
      { title: '자유 시간', body: '세 라운드가 끝날 때마다 15분의 자유 시간이 있어요. 이때 단서를 맞춰 보거나 거래를 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '경주가 끝나면 **1등 말과 2등 말**에 건 칩만 배당을 받아요. 배당률은 "(모든 말에 걸린 칩의 합 ÷ 2) ÷ 그 말에 걸린 칩"이에요. 즉 1등 말과 2등 말이 전체 판돈의 절반씩을 그 말에 건 사람들끼리 나눠요.',
      '최종 칩이 **가장 많은 사람**이 우승, **가장 적은 사람**이 탈락 후보가 돼요.',
      '받은 칩은 10개당 가넷 1개로 바꿔요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '끝날 때까지 걸지 않은 칩은 경기와 함께 회수돼요. 아껴 둔 칩은 점수가 되지 않아요.',
      '배당률 계산식은 방송 규칙 설명에 나오지 않고, 화면에 공개된 배당 현황으로 확인된 것이라고 나무위키 정리가 밝히고 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '사기 경마는 **패리뮤추얼(판돈 나누기) 베팅**이에요. 1·2등 말에 걸린 칩이 적을수록 그 말에 건 사람이 받는 몫이 커져요. 그래서 정답을 아는 것만으로는 부족하고, **다른 사람이 정답을 모르게 하는 것**이 점수를 키워요.' },
    { type: 'cards', items: [
      { title: '단서는 나눌수록 값이 떨어진다', body: '아홉 사람이 단서를 전부 공개하면 모두 정답을 알고, 모두 같은 말에 걸어 배당이 바닥이에요. 단서를 숨기거나 거짓 단서를 퍼뜨리면 남이 틀린 말에 걸고, 그 칩이 정답자의 몫으로 돌아와요. 정직한 정보 교환과 거짓 정보 사이의 선택이 이 게임의 이름 그대로예요.' },
      { title: '칩 20개, 라운드당 3개', body: '라운드당 최대 3개라서 20개를 모두 걸려면 적어도 일곱 라운드가 필요해요. 정답이 확실해질 때까지 기다리면, 말이 베팅 금지 구역에 들어가 걸 기회를 놓칠 수 있어요. 일찍 걸면 불확실하고, 늦게 걸면 칩이 남는 구조예요.' },
      { title: '말의 움직임도 정보다', body: '순위가 정해져 있다고 해서 말이 순위대로 달리는 것은 아니에요. 중간 위치에 속지 않고, 단서와 실제 이동을 함께 보며 정답을 좁혀야 해요. 추가 단서는 3가넷이라는 확실한 비용이 들어서, 그만큼 배당으로 되찾을 수 있을 때만 의미가 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '모두가 정보를 숨기면 아무도 정답을 확신하지 못하고, 모두가 공개하면 배당이 사라져요. **우월 전략은 없지만**, 믿을 만한 소수와만 진짜 단서를 나누고 나머지에게는 다른 말을 보이게 만드는 쪽이 가장 많이 가져가요.' },
  ],
  similar: [
    { name: '카멜 업 (Camel Up)', players: '2–8명', alike: '경주하는 낙타의 순위에 걸어 점수를 얻어요. 같은 낙타에 먼저 건 사람일수록 더 많이 받아, 남보다 먼저 판세를 읽어야 해요.', differs: '낙타 이동은 주사위로 정해지는 운의 요소가 크고, 단서나 거짓 정보는 없어요.' },
    { name: '로열 터프 (Royal Turf)', players: '2–6명', alike: '여러 말이 달리는 경마에 몰래 걸고, 말을 직접 움직이며 결과에 영향을 줘요.', differs: '순위가 정해져 있지 않고, 플레이어가 주사위로 말을 움직여 결과를 만들어요.' },
  ],
}, {
  meta: {
    title: 'The Fraud Horse Race rules — The Genius season 1, round 5 main match',
    description: 'The rules of the Fraud Horse Race (사기 경마) from The Genius: Rules of the Game: eight horses with a fixed finishing order on a 20-space track, 12 rounds, one clue and 20 chips each, 3-garnet extra clues, three chips per round, a no-betting zone, the pari-mutuel odds on the first two horses, and ten chips to a garnet.',
    keywords: ['The Genius horse race', 'Scamming Horse Race', 'The Genius Rules of the Game', '더 지니어스 사기 경마'],
  },
  title: 'The Fraud Horse Race — The Genius season 1, round 5 main match',
  name: 'The Fraud Horse Race (사기 경마)',
  lead: 'The order in which eight horses finish is already fixed. Pooling everyone’s clues would reveal the top two — but the more people back a horse, the less it pays.',
  summary: 'A betting game where sharing the truth shrinks your payout and spreading lies grows it.',
  setup: [
    { type: 'list', items: [
      '**Players**: 9.',
      '**Race**: eight horses run a 20-space track over 12 rounds, moving 0–3 spaces per round; the finishing order is predetermined.',
      '**Each player gets**: one clue about the order and 20 chips, which cannot be traded.',
      '**Extra clues**: three kinds, 3 garnets each to see.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Bet', body: 'Each round place chips on any horses, split as you like, but **at most three per round**.' },
      { title: 'Move', body: 'The horses move 0–3 spaces as scripted.' },
      { title: 'No-betting zone', body: 'Horses inside the zone before the finish cannot be bet on; English Wikipedia puts it at three spaces.' },
      { title: 'Free time', body: 'After every three rounds there are 15 minutes to compare clues and make deals.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Only bets on **the first and second horse** pay. The odds are (total chips on all horses ÷ 2) ÷ chips on that horse: each of the two horses shares half the whole pool among its backers.',
      '**Most chips** wins; **fewest** becomes the elimination candidate.',
      'Ten chips convert to one garnet.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Chips never bet are taken back at the end; saving them scores nothing.',
      'The fan wiki notes the odds formula was not in the rules briefing but was worked out from the odds shown on screen.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is **pari-mutuel betting**: the fewer chips on the top two horses, the more their backers collect. Knowing the answer is not enough — **keeping others from knowing it** is what makes it pay.' },
    { type: 'cards', items: [
      { title: 'Shared clues lose value', body: 'If all nine pooled their clues, everyone would back the same horses and the odds would collapse. Hiding clues or spreading false ones sends others’ chips to losers, and those chips flow to whoever was right.' },
      { title: 'Twenty chips, three a round', body: 'Betting all 20 needs at least seven rounds. Waiting for certainty risks the horse entering the no-betting zone; betting early means betting blind.' },
      { title: 'Movement is information too', body: 'A fixed order does not mean the horses run in order, so mid-race positions can mislead. An extra clue costs a sure 3 garnets and is only worth it if the odds can repay it.' },
    ], columns: 1 },
    { type: 'p', text: 'If everyone hides, nobody is sure; if everyone shares, the payout vanishes. **No strategy dominates**, but sharing real clues with a trusted few while steering the rest elsewhere collects the most.' },
  ],
  similar: [
    { name: 'Camel Up', players: '2–8', alike: 'Bet on the order of a race; earlier bets on the same camel pay more, so reading the race first matters.', differs: 'Dice drive the camels, and there are no clues or lies.' },
    { name: 'Royal Turf', players: '2–6', alike: 'Secret bets on a multi-horse race whose horses the players move.', differs: 'Nothing is predetermined; dice and players create the result.' },
  ],
});

export const catchThief = g1Game('catch-the-thief', 'main', round(6), [6], ['hiddenWord', 'twoSidedPoker', 'russianRoulette'], {
  meta: {
    title: '도둑잡기 규칙 — 더 지니어스 시즌1 6회전 메인 매치, 두 마을과 숨은 도둑, 유배지',
    description: '더 지니어스: 게임의 법칙 6회전 메인 매치 도둑잡기의 규칙을 정리했어요. 다섯 명의 큰 마을과 세 명의 작은 마을, 정체를 숨긴 도둑 한 명, 금 10개, 낮의 추방과 밤의 도둑질, 유배지에서 반대 마을로 옮기기, 두 라운드마다 이름 없이 공개되는 금, 10라운드와 마을의 승패까지.',
    keywords: ['도둑잡기', '도둑 잡기', '더 지니어스 도둑잡기', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 6회전'],
  },
  title: '도둑잡기 — 더 지니어스 시즌1 6회전 메인 매치',
  name: '도둑잡기',
  lead: '다섯 명의 큰 마을과 세 명의 작은 마을, 그리고 어딘가에 숨은 도둑 한 명. 낮마다 마을에서 한 명을 유배지로 보내고, 밤이면 도둑이 이웃의 금을 훔쳐요.',
  summary: '추방과 이동을 거듭하며 도둑이 어느 마을에 있는지 맞히는 마을 대항 추리 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 8명. 5명은 큰 마을, 3명은 작은 마을 주민이에요.',
      '**도둑**: 8명 중 한 명이 도둑이고, 정체는 본인만 알아요.',
      '**재산**: 주민은 금 10개로 시작해요. 도둑은 재산이 없어요.',
      '**진행**: 낮과 밤이 한 라운드, 모두 10라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '낮 (10분)', body: '마을마다 유배지로 보낼 추방자 한 명을 정해요. 시간 안에 못 정하면 다수결로 정해요.' },
      { title: '밤', body: '도둑은 자기가 있는 마을의 주민들에게서 금을 1개씩 훔쳐요. 도둑이 유배지에 있으면 훔칠 수 없어요. 유배지에 간 주민도 그날 밤은 도둑맞지 않아요.' },
      { title: '아침', body: '유배지에서 밤을 보낸 추방자는 반대편 마을로 옮겨 가요.' },
      { title: '금 공개', body: '두 라운드마다 모두의 금 개수가 공개돼요. 단, 누구의 금인지는 알려 주지 않아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '게임이 끝났을 때 **도둑이 있는 마을이 지고**, 도둑이 없는 마을이 이겨요.',
      '이긴 마을에서 금이 가장 많은 주민이 우승하고, 진 마을에서 금이 가장 적은 주민이 탈락 후보가 돼요.',
      '도둑은 **모든 플레이어 중 금이 가장 많으면** 주민 우승자와 공동 우승, 그렇지 않으면 주민 탈락 후보와 함께 공동 탈락 후보가 돼요.',
      '이긴 마을의 주민은 가넷 2개씩, 도둑은 우승했을 때 가넷 2개를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '마을마다 매일 한 명이 나가고, 다른 마을에서 한 명이 들어오니 두 마을의 인원은 계속 5명과 3명이에요. 그래서 도둑이 큰 마을에 있으면 하룻밤에 3개, 작은 마을에 있으면 1개를 훔치게 돼요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임의 승패는 사실상 **마지막 밤이 지난 뒤 도둑이 어느 마을에 있느냐**로 정해져요. 추방된 사람은 반대 마을로 옮겨 가니, 추방은 벌이 아니라 **사람을 옮기는 수단**이에요. 도둑이 의심되는 사람을 다른 마을로 보내는 것은 우리 마을을 이기게 만들고, 동시에 상대 마을을 지게 만드는 수예요.' },
    { type: 'cards', items: [
      { title: '도둑의 산수', body: '도둑은 0개에서 시작해 금이 가장 많아야 우승이에요. 주민 최고 재산이 10개 근처라면, 도둑은 큰 마을에서 여러 밤을 보내야 해요(하룻밤 3개). 하지만 큰 마을에 오래 있을수록 금이 줄어드는 사람이 늘고, 이름 없는 금 공개에서도 "늘어나는 숫자" 하나가 눈에 띄어요.' },
      { title: '유배지는 금고다', body: '유배지에 있는 밤에는 도둑맞지 않아요. 그래서 금이 많은 주민에게는 스스로 추방되는 것이 재산을 지키는 방법이에요. 다만 추방되면 반대 마을로 옮겨 가니, 마지막에 어느 마을에 서게 될지를 함께 계산해야 해요.' },
      { title: '익명 공개 읽기', body: '두 라운드마다 금이 공개돼도 이름은 없어요. 하지만 누가 언제 어느 마을에 있었는지는 모두가 알아요. 금이 줄어든 개수와 마을 이동 기록을 맞춰 보면, 도둑이 어느 마을에 있었는지 좁힐 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '인원이 많은 큰 마을은 다수결로 추방을 결정하기 쉬워 판을 주도하기 좋아요. **우월 전략은 없지만**, 금 공개와 이동 기록을 꼼꼼히 맞춰 보는 쪽이 도둑의 위치를 먼저 알아내고, 마지막 추방으로 도둑을 반대 마을에 남기는 쪽이 이겨요.' },
  ],
  similar: [
    { name: '마피아 / 늑대인간 (Werewolf)', players: '6명 이상', alike: '숨은 범인이 밤마다 피해를 주고, 낮에는 모두가 의논해 한 명을 내보내요.', differs: '내보낸 사람은 게임에서 빠지고, 마을이 둘로 나뉘거나 자리를 옮기는 구조는 없어요.' },
    { name: '레지스탕스 (The Resistance)', players: '5–10명', alike: '숨은 배신자를 찾아내기 위해 지난 결과 기록과 사람들의 행동을 맞춰 보며 추리해요.', differs: '아무도 탈락하지 않고, 임무의 성공과 실패를 놓고 팀 승부를 내요.' },
  ],
}, {
  meta: {
    title: 'Catch the Thief rules — The Genius season 1, round 6 main match',
    description: 'The rules of Catch the Thief (도둑잡기) from The Genius: Rules of the Game: a village of five and a village of three, one hidden thief, ten gold each, daily exiles and nightly theft, exiles moving to the other village, anonymous gold counts every two rounds, ten rounds, and which village wins.',
    keywords: ['The Genius Catch the Thief', 'Catch the Burglar', 'The Genius Rules of the Game', '더 지니어스 도둑잡기'],
  },
  title: 'Catch the Thief — The Genius season 1, round 6 main match',
  name: 'Catch the Thief (도둑잡기)',
  lead: 'A big village of five, a small village of three, and a thief hidden among them. Each day a village exiles one person; each night the thief robs the neighbours.',
  summary: 'A village-versus-village deduction game of exiles and moves, about where the thief ends up.',
  setup: [
    { type: 'list', items: [
      '**Players**: 8 — five in the big village, three in the small one.',
      '**Thief**: one of the eight, known only to themself.',
      '**Wealth**: villagers start with 10 gold; the thief with none.',
      '**Pace**: ten rounds of day and night.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Day (10 minutes)', body: 'Each village picks one person to send into exile; if time runs out, a majority vote decides.' },
      { title: 'Night', body: 'The thief steals one gold from each villager in their village, unless the thief is in exile; exiled villagers are not robbed that night either.' },
      { title: 'Morning', body: 'The exiles move on to the other village.' },
      { title: 'Gold count', body: 'Every two rounds everyone’s gold is shown — without names.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'At the end **the thief’s village loses** and the other village wins.',
      'The richest villager of the winning village wins; the poorest of the losing village becomes the elimination candidate.',
      'The thief shares the win if they **hold the most gold of anyone**; otherwise they are a second elimination candidate.',
      'Villagers of the winning village get 2 garnets each, and a winning thief 2 garnets.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Each village sends one person away and receives one each day, so the villages stay at five and three: the thief takes three gold a night in the big village and one in the small one.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The result comes down to **which village the thief is in after the last night**. Exiles move to the other village, so exile is not a punishment but **a way to move people**: sending a suspect across both wins it for your village and loses it for theirs.' },
    { type: 'cards', items: [
      { title: 'The thief’s arithmetic', body: 'Starting from zero, the thief must end richest — around ten gold — so needs several nights in the big village at three a night. But the longer they stay, the more villagers lose gold, and one rising number stands out in the anonymous counts.' },
      { title: 'Exile is a safe', body: 'Nobody is robbed in exile, so a rich villager can protect their gold by volunteering — while working out which village they will end up in.' },
      { title: 'Reading anonymous counts', body: 'The counts carry no names, but everyone knows who was where. Matching the drops in gold with the movement record narrows down where the thief was.' },
    ], columns: 1 },
    { type: 'p', text: 'The big village can push its exiles through by majority and steer the game. **No strategy dominates**, but the side that reconciles the counts and the moves first finds the thief, and the side that strands the thief across the border with the last exile wins.' },
  ],
  similar: [
    { name: 'Mafia / Werewolf', players: '6+', alike: 'A hidden culprit strikes at night and everyone talks by day to send someone away.', differs: 'Those sent away leave the game, and there are no villages to move between.' },
    { name: 'The Resistance', players: '5–10', alike: 'Hidden traitors are found by matching past results against people’s behaviour.', differs: 'Nobody is eliminated; teams win or lose missions.' },
  ],
});

export const openPass = g1Game('open-pass', 'main', round(7), [7], ['equationTower', 'equationSignal', 'hitStay'], {
  meta: {
    title: '오픈, 패스 규칙 — 더 지니어스 시즌1 7회전 메인 매치, 뒤집힌 카드로 가장 큰 수식 만들기',
    description: '더 지니어스: 게임의 법칙 7회전 메인 매치 오픈, 패스의 규칙을 정리했어요. 숫자와 기호가 섞인 기본 카드 20장, 가넷으로 사는 추가 카드, 직접 고른 20장을 딜러가 섞어 한 장씩, 오픈과 패스, 10칸 수식판, 연속된 숫자·기호 처리, 가넷이 적은 사람부터의 순서와 우승 보상까지.',
    keywords: ['오픈 패스', '오픈, 패스', '더 지니어스 오픈 패스', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 7회전'],
  },
  title: '오픈, 패스 — 더 지니어스 시즌1 7회전 메인 매치',
  name: '오픈, 패스',
  lead: '내가 고른 카드 20장을 딜러가 섞어 한 장씩 엎어 놓아요. 앞면을 보기 전에 "오픈"으로 수식에 넣을지, "패스"로 버릴지 정해요. 열 칸이 차면 수식의 답이 내 점수예요.',
  summary: '뒷면만 보고 수식에 넣을지 말지를 정해, 가장 큰 답을 만드는 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 7명.',
      '**기본 카드**: 숫자와 기호가 섞인 20장. 영문 위키백과 정리에 따르면 숫자 0–9가 10장, 사칙연산 기호가 10장이에요.',
      '**추가 카드**: 가넷 1개, 2개, 3개짜리 세트가 있고, 모두 20장 한 세트예요.',
      '**수식판**: 등호 왼쪽에 카드 10장이 들어가는 판.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '카드 고르기', body: '가진 카드 중에서 원하는 숫자와 기호를 골라 20장을 만들어 딜러에게 내요.' },
      { title: '배치', body: '딜러가 20장을 섞어, 뒷면이 보이게 한 장씩 수식판 왼쪽부터 놓아요.' },
      { title: '오픈 또는 패스', body: '"오픈"하면 앞면을 공개하고 수식에 넣어요. "패스"하면 그 카드는 빠지고 다음 카드로 넘어가요. 오픈한 카드는 되돌릴 수 없고, 패스는 최대 10번까지예요.' },
      { title: '수식 완성', body: '수식판의 10칸이 모두 차면 수식이 완성되고 답을 계산해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '수식의 답이 **가장 큰 사람**이 우승해 가넷 5개를, **두 번째**는 가넷 2개를 받아요.',
      '답이 **가장 작은 사람**이 탈락 후보가 돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '숫자나 기호가 연달아 놓이면 가장 왼쪽 카드만 유효해요. 여러 자리 숫자를 만들 수 없어요.',
      '등호 바로 왼쪽 칸이 기호면 그 기호는 없어져요.',
      '맨 왼쪽 카드가 기호면 그 앞에 숫자 0이 있는 것으로 계산해요.',
      '수식은 가넷이 적은 사람부터 내요(라운드 시작 때의 가넷 기준, 같으면 가나다순). 추가 카드를 사도 순서는 바뀌지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '카드 앞면을 보지 않고 오픈과 패스를 정해야 하니, 이 게임의 실력은 두 곳에서 나와요. **어떤 20장을 낼지(덱 설계)**와, **이미 나온 카드로 다음 카드를 짐작하는 것(카운팅)**이에요.' },
    { type: 'cards', items: [
      { title: '덱 설계', body: '연속된 숫자·기호는 가장 왼쪽만 남으니, 쓸모 있는 수식은 숫자와 기호가 번갈아 놓인 형태예요. 큰 숫자와 곱셈이 많을수록 답이 커지지만, 빼기나 나누기가 섞이면 한 장으로 점수가 무너져요. 기본 카드에는 0과 작은 숫자, 빼기·나누기도 들어 있어서, 20장을 고를 때 무엇을 넣지 않을지가 중요해요.' },
      { title: '내 덱은 내가 안다', body: '20장은 내가 직접 고른 카드라, 이미 공개된 카드를 빼면 남은 카드의 구성을 정확히 알아요. 남은 카드 중 좋은 카드의 비율이 높을 때 오픈하고, 나쁜 카드가 몰려 있다고 판단되면 패스하는 식으로 확률을 따질 수 있어요.' },
      { title: '패스 10번의 무게', body: '20장 중 10칸을 채우니, 패스를 10번 다 쓰면 나머지는 자동으로 들어가요. 초반에 패스를 아끼면 후반에 나쁜 카드를 피할 수 없고, 초반에 다 쓰면 좋은 카드도 놓쳐요. 나중에 내는 사람은 앞사람의 답을 알고 필요한 만큼만 위험을 감수할 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '운의 비중이 크지만 **덱 설계와 카운팅으로 확률을 끌어올릴 수 있는 게임**이에요. 추가 카드 세트는 가넷이 드는 대신 덱을 더 좋게 만들 여지를 주니, 그 비용을 우승 보상(가넷 5개)과 비교해 판단해야 해요.' },
  ],
  similar: [
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '숫자 카드와 사칙연산으로 수식을 만들어 목표를 맞히는 계산 카드 게임이에요.', differs: '카드를 모두 보고 계산하며, 운에 맡겨 카드를 뽑지 않아요.' },
    { name: '포트 로얄 (Port Royal)', players: '2–5명', alike: '카드를 한 장씩 뒤집으며 계속할지 멈출지 정하는 푸시 유어 럭 게임이에요. 남은 카드 구성을 기억하면 유리해요.', differs: '카드를 뒤집어 본 뒤에 고르고, 수식이 아니라 배와 사람 카드를 모아요.' },
  ],
}, {
  meta: {
    title: 'Open, Pass rules — The Genius season 1, round 7 main match',
    description: 'The rules of Open, Pass (오픈, 패스) from The Genius: Rules of the Game: a base set of 20 number and operator cards, extra sets for garnets, a 20-card deck you build yourself, open or pass on face-down cards, a ten-slot equation, how repeated numbers and operators are handled, the order of play and the prizes.',
    keywords: ['The Genius Open Pass', 'The Genius Rules of the Game', '더 지니어스 오픈 패스', 'The Genius season 1'],
  },
  title: 'Open, Pass — The Genius season 1, round 7 main match',
  name: 'Open, Pass (오픈, 패스)',
  lead: 'The dealer shuffles the twenty cards you chose and deals them face down. Before seeing each one you say "open" to put it in your equation or "pass" to drop it; when ten slots are full, the answer is your score.',
  summary: 'Decide from the back alone which cards go into your equation, and make the biggest answer.',
  setup: [
    { type: 'list', items: [
      '**Players**: 7.',
      '**Base cards**: 20 numbers and operators; per English Wikipedia, ten numbers 0–9 and ten arithmetic operators.',
      '**Extra cards**: sets of 20 for 1, 2 or 3 garnets.',
      '**Board**: ten slots to the left of an equals sign.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Build a deck', body: 'Choose 20 of your cards and hand them to the dealer.' },
      { title: 'Deal', body: 'The dealer shuffles them and lays them face down one at a time, from the left of the board.' },
      { title: 'Open or pass', body: '"Open" reveals the card and adds it to the equation; "pass" drops it and moves on. Opened cards stay, and at most ten passes are allowed.' },
      { title: 'Complete', body: 'When all ten slots are filled, the equation is worked out.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The **largest answer** wins 5 garnets; **second** gets 2.',
      'The **smallest answer** becomes the elimination candidate.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Of consecutive numbers or consecutive operators only the leftmost counts; no multi-digit numbers.',
      'An operator right before the equals sign is dropped.',
      'If the leftmost card is an operator, a 0 is assumed before it.',
      'Players go in order of fewest garnets (counted at the start of the round; ties alphabetical in Korean); buying extra cards does not change the order.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Since cards are judged face down, skill comes from two places: **which twenty cards you submit** and **counting what has already appeared** to guess what comes next.' },
    { type: 'cards', items: [
      { title: 'Deck building', body: 'Only the leftmost of a run survives, so a useful equation alternates numbers and operators. Big numbers and multiplication grow the answer; one minus or divide can wreck it. The base set includes zero, small numbers and those operators, so what you leave out matters most.' },
      { title: 'You know your own deck', body: 'You chose the twenty cards, so once some are revealed you know exactly what remains. Open when the good cards dominate the rest, pass when the bad ones cluster.' },
      { title: 'The weight of ten passes', body: 'Ten slots from twenty cards: use all ten passes and the rest go in automatically. Saving passes risks being stuck later; spending them early misses good cards. Later players know earlier scores and can take only the risk they need.' },
    ], columns: 1 },
    { type: 'p', text: 'Luck weighs heavily, but **deck building and counting raise the odds**. Extra sets cost garnets but improve the deck, a trade to weigh against the 5-garnet prize.' },
  ],
  similar: [
    { name: 'Krypto', players: '1+', alike: 'Number cards and arithmetic combined into an equation.', differs: 'All cards are visible; nothing is left to chance.' },
    { name: 'Port Royal', players: '2–5', alike: 'A push-your-luck game of turning cards one by one; remembering what is left helps.', differs: 'You see each card before deciding, and collect ships and characters, not equations.' },
  ],
});

export const beanDilemma = g1Game('bean-dilemma', 'main', round(8), [8], ['blackWhite', 'blackWhite2', 'heavy13'], {
  meta: {
    title: '콩의 딜레마 규칙 — 더 지니어스 시즌1 8회전 메인 매치, 팀을 위해 콩을 쓸까 아낄까',
    description: '더 지니어스: 게임의 법칙 8회전 메인 매치 콩의 딜레마의 규칙을 정리했어요. 화이트 팀 3명과 레드 팀 3명, 한 사람에 콩 10개, 한 명씩 들어가는 보관소, 병에 넣는 콩, 진 팀만 공개되는 개수, 5라운드와 3승 선착, 이긴 팀에서 남은 콩이 많은 사람이 우승하는 구조까지.',
    keywords: ['콩의 딜레마', '더 지니어스 콩의 딜레마', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 8회전'],
  },
  title: '콩의 딜레마 — 더 지니어스 시즌1 8회전 메인 매치',
  name: '콩의 딜레마',
  lead: '팀이 이기려면 병에 콩을 넣어야 하지만, 우승은 이긴 팀에서 콩이 가장 많이 남은 사람의 몫이에요. 내 콩을 쓸지 남의 콩에 기댈지의 딜레마예요.',
  summary: '팀 승리와 개인 승리가 정반대를 가리키는 3:3 콩 베팅 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 6명. 제비뽑기로 화이트 팀 3명, 레드 팀 3명으로 나뉘어요.',
      '**콩**: 각자 팀 색깔 콩 10개가 든 개인 보관함을 받아요.',
      '**진행**: 한 라운드 15분, 모두 5라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '보관소', body: '보관소에는 한 번에 한 명씩, 라운드마다 한 번만 들어가요. 자기 보관함에서 원하는 만큼 콩을 꺼내 팀 병에 넣어요. 0개도 괜찮아요. 남의 보관함은 건드릴 수 없어요.' },
      { title: '라운드 판정', body: '모두가 보관소를 다녀가면 라운드가 끝나요. 병에 든 콩이 더 많은 팀이 그 라운드를 이겨요.' },
      { title: '공개', body: '라운드가 끝날 때마다 **진 팀의 병**에 든 콩 개수만 공개돼요. 비기면 두 팀 모두 공개하지 않아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드가 끝났을 때 승점이 높은 팀, 또는 **먼저 3승을 거둔 팀**이 이겨요.',
      '이긴 팀에서 **남은 콩이 가장 많은 사람**이 우승해요. 개수가 같으면 공동 우승이에요.',
      '진 팀에서 **남은 콩이 가장 적은 사람**이 탈락 후보가 돼요.',
      '이긴 팀의 모든 사람은 남은 콩 1개당 가넷 1개를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '병에 넣은 콩은 돌려받지 못하는 것으로 정리돼 있어요. 라운드마다 병이 비워지는지, 비긴 라운드가 어떻게 세어지는지는 확인하지 못했어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이름 그대로 **사회적 딜레마**예요. 팀이 이기려면 누군가 콩을 써야 하지만, 개인으로서는 콩을 아낄수록 우승에 가까워지고 가넷도 늘어요. 모두가 아끼면 팀이 지고, 나만 쓰면 내가 팀 안에서 가장 가난해져요.' },
    { type: 'cards', items: [
      { title: '한 번도 쓰지 않은 사람', body: '콩을 하나도 쓰지 않으면 10개가 그대로 남아요. 내 팀이 이기면 팀에서 콩이 가장 많아 우승에 가장 가깝고, 내 팀이 지더라도 콩이 가장 적은 사람이 될 일은 없어요. 그래서 **아끼는 쪽이 개인적으로는 거의 항상 유리**하고, 문제는 팀 동료도 똑같이 생각한다는 점이에요.' },
      { title: '진 쪽만 보이는 정보', body: '진 팀의 개수만 공개되니, 이긴 팀은 몇 개로 이겼는지 상대에게 들키지 않아요. 진 팀은 숫자를 드러낸 채 다음 라운드를 준비해야 해요. 최소한의 차이로 이기는 것, 예를 들어 상대가 0개일 때 1개로 이기는 것이 가장 효율적이에요.' },
      { title: '팀을 넘는 약속', body: '팀이 정해진 뒤에도 협상은 자유라서, 상대 팀 사람과 "둘 다 아끼자"는 약속을 할 수도 있어요. 개인 보상이 팀 결과와 엇갈리는 구조라, 팀 안의 신뢰보다 팀 밖의 약속이 더 강하게 작동할 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '팀 전체로 보면 콩을 아끼면서 이기는 것이 최선이지만, 그 부담을 누가 질지는 정해 주지 않아요. **개인에게는 아끼는 것이 우월한 선택에 가깝고**, 그래서 팀 안에서 콩을 쓰는 사람을 어떻게 보상하고 보호할지가 승부를 가르는 게임이에요.' },
  ],
  similar: [
    { name: '포 세일 (For Sale)', players: '3–6명', alike: '한정된 자금을 어디에 얼마나 쓸지 정하는 경매 게임이에요. 덜 쓰고 원하는 것을 얻는 것이 핵심이에요.', differs: '팀이 없고, 입찰에서 물러나면 낸 돈의 절반을 돌려받아요.' },
    { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '봉인 입찰처럼 상대가 얼마를 낼지 모른 채 금액을 정하는 순간이 있어요.', differs: '팀 대항이 아니고, 낙찰된 그림의 값이 시장 흐름으로 정해져요.' },
  ],
}, {
  meta: {
    title: 'The Bean Dilemma rules — The Genius season 1, round 8 main match',
    description: 'The rules of the Bean Dilemma (콩의 딜레마) from The Genius: Rules of the Game: white and red teams of three, ten beans each, a store room entered one at a time, beans in the team bottle, only the losing count revealed, five rounds or first to three, and why the winner is whoever kept the most beans.',
    keywords: ['The Genius Bean Dilemma', "Kong's Dilemma", 'The Genius Rules of the Game', '더 지니어스 콩의 딜레마'],
  },
  title: 'The Bean Dilemma — The Genius season 1, round 8 main match',
  name: 'The Bean Dilemma (콩의 딜레마)',
  lead: 'Your team needs beans in its bottle to win, but the prize goes to whoever on the winning team has the most beans left. Spend yours, or lean on everyone else’s?',
  summary: 'A three-on-three bean-betting game in which team victory and personal victory point opposite ways.',
  setup: [
    { type: 'list', items: [
      '**Players**: 6, drawn into a white team of three and a red team of three.',
      '**Beans**: each gets a private box of ten beans in their team colour.',
      '**Pace**: five rounds of 15 minutes.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Store room', body: 'One person at a time, once a round, enters the store room and moves any number of their own beans — even none — into the team bottle. Other boxes are off limits.' },
      { title: 'Round result', body: 'When everyone has been in, the team with more beans in its bottle wins the round.' },
      { title: 'Reveal', body: 'Only **the losing team’s** count is announced; after a tie, neither is.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The team ahead after five rounds, or **first to three round wins**, wins.',
      'On the winning team, **the most beans left** wins (ties share).',
      'On the losing team, **the fewest beans left** is the elimination candidate.',
      'Every winning-team player gets a garnet per bean left.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Beans in the bottle are not returned. Whether the bottle is emptied each round, and how a tied round counts, could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'A true **social dilemma**: the team needs someone to spend, but each individual gets closer to the prize, and more garnets, by saving. If all save, the team loses; if only you spend, you become your team’s poorest.' },
    { type: 'cards', items: [
      { title: 'The player who never spends', body: 'Spend nothing and you keep ten. If your team wins you are the likeliest winner; if it loses, you cannot be the poorest. **Saving is almost always better individually** — and your teammates know it too.' },
      { title: 'Only the loser is seen', body: 'Only the losing count is public, so the winners’ margin stays hidden while the losers plan in the open. Winning by the smallest margin, such as one bean against zero, is the efficient result.' },
      { title: 'Deals across teams', body: 'Negotiation stays open after the draw, so players can agree with opponents that both will save. Because personal rewards cut across team results, promises outside the team can bind harder than trust inside it.' },
    ], columns: 1 },
    { type: 'p', text: 'For the team, winning cheaply is best, but nothing says who pays. **For the individual, saving is close to dominant**, so the match turns on how a team rewards and protects whoever spends.' },
  ],
  similar: [
    { name: 'For Sale', players: '3–6', alike: 'Deciding how much of a limited budget to spend; getting what you want for less is the point.', differs: 'No teams, and dropping out of a bid refunds half.' },
    { name: 'Modern Art', players: '3–5', alike: 'Sealed bids made without knowing what others offer.', differs: 'No teams, and painting values come from the market.' },
  ],
});
