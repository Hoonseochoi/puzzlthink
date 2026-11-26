// 소사이어티 게임 (season 1), day 14 final challenge: 하프 파이프, 퍼즐 타워, 불굴의 러너Ⅱ.
// Three per village; each takes one area (body, brain, sense) and may not help the others. First to two rounds wins.
import { finalRound, sg1Game } from './shared';

const FINAL_KO = '파이널은 마을마다 3명이 신체·두뇌·감각을 한 명씩 맡고, 다른 영역은 도울 수 없어요. 세 라운드 중 **2라운드를 먼저 이긴 마을**이 최종 우승해요.';
const FINAL_EN = 'In the final, three players per village each take one area (body, brain, sense) and may not help in the others; **the first village to win two rounds** takes the title.';

export const halfPipe = sg1Game('half-pipe', 'final', finalRound(1), 12, ['hiddenWord', 'nemoCount', 'fourThree'], {
  meta: {
    title: '하프 파이프 규칙 — 소사이어티 게임 시즌1 파이널 1라운드, 공 나르기·표적·세 글자 단어 6개',
    description: '소사이어티 게임 시즌1 파이널 1라운드 하프 파이프의 규칙을 정리했어요. 반원 관으로 공을 세 개씩 나르는 신체, 16칸 표적을 맞혀 글자를 여는 감각, 공개된 글자로 세 글자 단어 6개를 20초 안에 말하는 두뇌까지.',
    keywords: ['하프 파이프', '소사이어티 게임 하프 파이프', '소사이어티 게임 파이널', '소사이어티게임 시즌1', '소사이어티 게임 12화'],
  },
  title: '하프 파이프 — 소사이어티 게임 시즌1 파이널 1라운드',
  name: '하프 파이프',
  lead: '신체가 반원 관으로 공을 나르고, 감각이 그 공으로 표적을 맞혀 글자를 열고, 두뇌가 열린 글자로 세 글자 단어 6개를 만들어요.',
  summary: '공 나르기 → 표적 맞히기 → 단어 만들기가 이어지는 파이널 첫 라운드.',
  setup: [
    { type: 'p', text: FINAL_KO },
    { type: 'list', items: [
      '**신체**: 출발 지점에서 반원 모양 관(하프 파이프)으로 공을 받아 날라요.',
      '**감각**: 바구니의 공을 던져 **16칸 표적**을 떨어뜨려요.',
      '**두뇌**: 표적 뒤에서 드러나는 글자로 단어를 만들어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '공 나르기', body: '신체 대표는 진행 요원이 주는 공을 하프 파이프로 받아 감각 대표의 바구니에 넣어요. 한 번에 **세 개까지** 옮길 수 있고, 관은 **아래쪽 손잡이만** 잡을 수 있어요.' },
      { title: '표적 맞히기', body: '감각 대표가 공을 던져 표적 칸을 하나 떨어뜨릴 때마다 **글자가 하나** 드러나요.' },
      { title: '단어 만들기', body: '두뇌 대표는 드러난 글자를 조합해 **세 글자 단어 6개**를 만들어요.' },
      { title: '답하기', body: '깃발을 든 뒤 **20초 안에** 6개를 이어서 말해야 해요. 표준국어대사전에 있는 단어만 인정해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '단어 6개를 먼저 맞힌 마을이 1라운드를 가져가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '16칸 표적 뒤의 글자가 모두 쓰여야 하는지, 오답 뒤 다시 시도하기까지의 조건은 정리된 규칙에 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '하프 파이프는 세 영역이 **앞 단계가 뒤 단계의 재료를 대는** 생산 라인이에요. 다만 마지막 두뇌 단계가 "모든 글자가 열려야" 시작하는 게 아니라는 점이 승부를 흥미롭게 만들어요.' },
    { type: 'cards', items: [
      { title: '글자가 다 열리기 전에 맞힐 수 있어요', body: '단어 6개는 16칸 가운데 일부로 만들 수 있고, 이미 열린 글자로 빈칸의 글자를 짐작할 수도 있어요. 그래서 두뇌 대표의 추리력은 앞 단계의 느림을 메우는 수단이 돼요. 반대로 표적이 다 열려도 단어가 떠오르지 않으면 앞의 우위는 사라져요.' },
      { title: '감각이 병목', body: '공은 세 개씩 오고, 감각 대표가 맞히는 확률이 글자가 열리는 속도를 정해요. 공 나르기는 크게 차이가 나기 어려운 반면 표적의 명중률은 사람마다 크게 달라서, 실제 속도 차는 대개 여기서 생겨요.' },
      { title: '20초 안에 6개', body: '깃발을 들면 6개를 연달아 말해야 해요. 5개가 확실할 때 드느냐, 6개를 다 확인하고 드느냐는 상대 진행 속도를 보며 정해야 하는 판단이에요.' },
    ], columns: 1 },
    { type: 'p', text: '세 사람이 서로를 도울 수 없으니 개인 실력의 합이 그대로 드러나 **우월 전략은 없어요.** 두뇌 대표가 일찍 추리에 들어가는 것이 가장 큰 변수예요.' },
  ],
  similar: [
    { name: '보글 (Boggle)', players: '1명 이상', alike: '정해진 글자들 속에서 제한 시간 안에 단어를 최대한 찾아내요.', differs: '글자가 처음부터 모두 보이고, 단어를 찾는 개인전이에요.' },
    { name: '캡틴 소나 (Captain Sonar)', players: '2–8명', alike: '팀원마다 맡은 역할이 따로 있고, 각자의 일이 이어져야 팀이 움직여요.', differs: '잠수함 전투를 실시간으로 하는 팀전이고, 역할끼리 말로 주고받는 정보가 많아요.' },
  ],
}, {
  meta: {
    title: 'Half Pipe rules — The Society Game season 1, final round 1',
    description: 'The rules of Half Pipe (하프 파이프), the first round of The Society Game season 1 final: carrying balls three at a time in a half pipe, knocking down a 16-cell target to reveal syllables, and saying six three-syllable words within 20 seconds.',
    keywords: ['Half Pipe', 'The Society Game final', 'Society Game season 1', '소사이어티 게임 하프 파이프'],
  },
  title: 'Half Pipe — The Society Game season 1, final round 1',
  name: 'Half Pipe (하프 파이프)',
  lead: 'The body player carries balls in a half pipe, the sense player uses them to knock down targets that reveal syllables, and the brain player builds six three-syllable words from them.',
  summary: 'Carrying balls, hitting targets and building words, in sequence: the final’s first round.',
  setup: [
    { type: 'p', text: FINAL_EN },
    { type: 'list', items: [
      '**Body**: carries balls from the start in a half-pipe channel.',
      '**Sense**: throws the balls at a **16-cell target**.',
      '**Brain**: makes words from the syllables revealed behind it.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Carrying', body: 'The body player takes balls from staff in the half pipe and drops them in the sense player’s basket, **up to three at a time**, holding **only the lower handle**.' },
      { title: 'Targets', body: 'Each target cell the sense player knocks down reveals **one syllable**.' },
      { title: 'Words', body: 'The brain player combines revealed syllables into **six three-syllable words**.' },
      { title: 'Answering', body: 'After raising the flag, all six must be said in a row **within 20 seconds**; only Standard Korean Dictionary words count.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first village to name all six takes round 1.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Whether every syllable must be used, and the conditions for retrying after a miss, are not in the written rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is **a production line**, each stage feeding the next, with one twist: the brain stage need not wait for every syllable.' },
    { type: 'cards', items: [
      { title: 'Solving before all is revealed', body: 'Six words use only some of the sixteen cells, and revealed syllables hint at hidden ones, so the brain player’s inference can make up for a slow front end — and a blank mind wastes a fast one.' },
      { title: 'Sense is the bottleneck', body: 'Balls arrive three at a time and the hit rate sets how fast syllables appear. Carrying rarely differs much; accuracy does, so that is where gaps open.' },
      { title: 'Six in twenty seconds', body: 'Raise the flag with five sure words, or wait for six? That depends on how fast the other side is moving.' },
    ], columns: 1 },
    { type: 'p', text: 'Nobody may help another area, so individual skill adds up openly and **there is no dominant strategy**; how early the brain player starts inferring is the biggest variable.' },
  ],
  similar: [
    { name: 'Boggle', players: '1+', alike: 'Find as many words as possible in a set of letters against the clock.', differs: 'All letters are visible from the start; individual play.' },
    { name: 'Captain Sonar', players: '2–8', alike: 'Each teammate has a separate station, and the team moves only when they mesh.', differs: 'A real-time submarine battle with lots of spoken coordination.' },
  ],
});

export const puzzleTower = sg1Game('puzzle-tower', 'final', finalRound(2), 12, ['nonogram', 'equationTower', 'heavy13'], {
  meta: {
    title: '퍼즐 타워 규칙 — 소사이어티 게임 시즌1 파이널 2라운드, 기우는 시소 위 108조각 탑과 그림 암호',
    description: '소사이어티 게임 시즌1 파이널 2라운드 퍼즐 타워의 규칙을 정리했어요. 모래 20kg이 떨어지는 시소의 평형을 줄로 잡는 신체, 1–108 번호 블록을 전개도대로 6×18로 쌓는 감각, 안대를 풀고 뒷면의 그림 암호를 푸는 두뇌까지.',
    keywords: ['퍼즐 타워', '소사이어티 게임 퍼즐 타워', '소사이어티 게임 파이널', '소사이어티게임 시즌1', '소사이어티 게임 12화'],
  },
  title: '퍼즐 타워 — 소사이어티 게임 시즌1 파이널 2라운드',
  name: '퍼즐 타워',
  lead: '모래가 계속 떨어지는 시소를 신체가 줄로 버티고, 그 위에 감각이 108개 블록으로 탑을 쌓아요. 탑이 완성되면 두뇌가 안대를 풀고 탑 뒷면의 그림 암호를 풀어요.',
  summary: '기울어지는 시소 위에 108조각 탑을 쌓고, 탑 뒷면의 그림 암호를 먼저 푸는 파이널 두 번째 라운드.',
  setup: [
    { type: 'p', text: FINAL_KO },
    { type: 'list', items: [
      '**신체**: 줄을 당겨 시소의 평형을 지켜요. 게임 내내 상자 안으로 **모래 20kg**이 계속 떨어져요.',
      '**감각**: 앞면에 **1–108 번호**가 적힌 퍼즐 블록 108개를 시소 가운데에 **가로 6 × 세로 18**로 쌓아요.',
      '**두뇌**: 탑이 완성될 때까지 **안대**를 쓰고 기다려요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '평형 유지', body: '모래가 떨어지는 동안 신체 대표가 줄을 당겨 시소가 기울지 않게 해요.' },
      { title: '탑 쌓기', body: '감각 대표가 주어진 **퍼즐 타워 전개도**와 똑같이 블록을 쌓아요.' },
      { title: '암호 풀기', body: '탑이 완성되면 두뇌 대표가 안대를 풀고, 탑 **뒷면에 그려진 그림 암호**를 풀어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '두 마을이 동시에 시작해 **암호를 먼저 푼 마을**이 2라운드를 가져가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두뇌 대표가 안대를 벗은 뒤 탑이 무너지면, 다시 쌓는 동안에는 **안대를 다시 쓰지 않아도** 돼요.',
      '감각 대표는 탑을 완성한 뒤에도 탑에 손을 댈 수 있어요.',
      '그림 암호가 어떤 형태였는지는 정리된 규칙에 자세히 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '퍼즐 타워는 **흔들리는 바닥 위의 정밀 작업**이에요. 신체가 버티는 평형이 감각의 탑 쌓기 속도를 정하고, 탑이 서야 두뇌가 시작해요.' },
    { type: 'cards', items: [
      { title: '108조각은 번호가 길잡이', body: '블록마다 번호가 있고 전개도가 주어지니, 탑 쌓기는 "어디에 무엇을"보다 "얼마나 빨리, 무너지지 않게"의 문제예요. 번호 순서대로 집기 좋게 미리 늘어놓는 요령이 속도를 크게 바꿔요.' },
      { title: '무너짐 규칙의 역설', body: '안대를 벗은 뒤 탑이 무너지면 두뇌는 안대 없이 기다려요. 즉 한 번 완성된 탑의 뒷면 그림을 두뇌가 이미 봤다면, 다시 쌓는 동안에도 머릿속으로 암호를 풀 수 있어요. 완성 뒤의 붕괴는 생각보다 손해가 작을 수 있어요.' },
      { title: '평형이 무너지면 모든 게 늦어져요', body: '모래는 계속 쌓이니 시간이 갈수록 줄을 당기는 힘이 더 들어요. 감각이 느릴수록 신체의 부담이 커지고, 신체가 흔들리면 감각이 더 느려지는 악순환이 생겨요.' },
    ], columns: 1 },
    { type: 'p', text: '서로 돕지 못하는 세 사람이 사슬처럼 이어져 **우월 전략은 없어요.** 다만 감각 대표의 준비(블록 정리)가 셋 모두의 부담을 줄이는 가장 효과적인 지점이에요.' },
  ],
  similar: [
    { name: '서스펜드 (Suspend)', players: '1–4명', alike: '흔들리는 구조물의 균형을 지키며 조각을 하나씩 더해 가요.', differs: '막대를 매다는 손재주 게임이고, 퍼즐이나 암호가 없어요.' },
    { name: '메이크 앤 브레이크 (Make ’N’ Break)', players: '2–5명', alike: '주어진 그림과 똑같이 블록을 빠르게 쌓는 시간 경쟁이에요.', differs: '바닥이 흔들리지 않고, 쌓은 뒤 풀어야 할 암호가 없어요.' },
  ],
}, {
  meta: {
    title: 'Puzzle Tower rules — The Society Game season 1, final round 2',
    description: 'The rules of Puzzle Tower (퍼즐 타워), the second round of The Society Game season 1 final: a body player balancing a seesaw while 20 kg of sand pours in, a sense player stacking 108 numbered blocks 6 wide and 18 high to a plan, and a blindfolded brain player solving the picture cipher on the back.',
    keywords: ['Puzzle Tower', 'The Society Game final', 'Society Game season 1', '소사이어티 게임 퍼즐 타워'],
  },
  title: 'Puzzle Tower — The Society Game season 1, final round 2',
  name: 'Puzzle Tower (퍼즐 타워)',
  lead: 'The body player holds a seesaw level as sand pours in; the sense player builds a 108-block tower on it; then the brain player removes a blindfold to crack the picture cipher on its back.',
  summary: 'Build a 108-block tower on a tilting seesaw and be first to solve the picture cipher on its back: the final’s second round.',
  setup: [
    { type: 'p', text: FINAL_EN },
    { type: 'list', items: [
      '**Body**: pulls a rope to keep the seesaw level while **20 kg of sand** keeps pouring into a box.',
      '**Sense**: stacks 108 blocks numbered **1–108** on the front, **6 wide by 18 high**, in the middle of the seesaw.',
      '**Brain**: waits **blindfolded** until the tower is complete.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Balance', body: 'As sand falls, the body player keeps the seesaw from tipping.' },
      { title: 'Building', body: 'The sense player stacks blocks to match the given **tower plan**.' },
      { title: 'Cipher', body: 'When the tower is done, the brain player takes off the blindfold and solves the **picture cipher drawn on its back**.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Both start together; **the first to solve the cipher** takes round 2.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If the tower falls after the blindfold is off, the brain player **need not put it back on** during the rebuild.',
      'The sense player may touch the tower even after completing it.',
      'The exact form of the picture cipher is not in the written rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is **precision work on a moving floor**: the body’s balance sets the sense player’s pace, and the brain starts only when the tower stands.' },
    { type: 'cards', items: [
      { title: 'Numbers guide 108 blocks', body: 'With numbers and a plan, building is about speed and stability rather than where pieces go. Laying blocks out in pick-up order beforehand changes the pace a lot.' },
      { title: 'The collapse paradox', body: 'After the blindfold is off, a collapse does not re-blind the brain player, who may already have seen the back and can keep solving during the rebuild. A late collapse may cost less than it looks.' },
      { title: 'Losing balance slows everything', body: 'Sand keeps accumulating, so holding gets harder over time. A slow builder burdens the puller, and a shaky seesaw slows the builder further.' },
    ], columns: 1 },
    { type: 'p', text: 'Three players who cannot help each other form a chain, so **there is no dominant strategy**; the builder’s preparation is the point that eases all three.' },
  ],
  similar: [
    { name: 'Suspend', players: '1–4', alike: 'Add pieces one at a time while keeping a wobbling structure balanced.', differs: 'A hanging-rods dexterity game with no puzzle or cipher.' },
    { name: 'Make ’N’ Break', players: '2–5', alike: 'Race to build blocks exactly like a picture.', differs: 'The table stays still and there is no cipher afterwards.' },
  ],
});

export const indomitableRunner2 = sg1Game('indomitable-runner-2', 'final', finalRound(3), 12, ['equationSignal', 'hiddenWord', 'russianRoulette'], {
  meta: {
    title: '불굴의 러너Ⅱ 규칙 — 소사이어티 게임 시즌1 파이널 3라운드, 재배열 문제와 링토스, 10단계 러닝머신',
    description: '소사이어티 게임 시즌1 파이널 3라운드 불굴의 러너Ⅱ의 규칙을 정리했어요. 멈춘 러닝머신 위의 신체, 수식·문장 재배열 문제를 알파벳으로 답하는 두뇌, 못 맞히면 한 번의 링토스로 막아야 하는 감각, 4km/h부터 16km/h까지 10단계까지.',
    keywords: ['불굴의 러너2', '불굴의 러너Ⅱ', '소사이어티 게임 파이널', '소사이어티게임 시즌1', '소사이어티 게임 12화'],
  },
  title: '불굴의 러너Ⅱ — 소사이어티 게임 시즌1 파이널 3라운드',
  name: '불굴의 러너Ⅱ',
  lead: '두 마을의 두뇌가 재배열 문제로 맞붙고, 문제를 놓친 쪽은 감각이 링토스 한 번으로 막아야 해요. 막지 못하면 신체가 달리는 러닝머신이 한 단계 빨라져요.',
  summary: '재배열 문제를 놓치면 링토스 한 번에 운명이 걸리고, 실패할 때마다 러닝머신이 빨라지는 파이널 세 번째 라운드.',
  setup: [
    { type: 'p', text: FINAL_KO },
    { type: 'list', items: [
      '**신체**: 멈춰 있는 러닝머신 위에서 시작해요.',
      '**두뇌**: 수식 또는 문장 **재배열 문제**를 풀어요.',
      '**감각**: 링토스를 맡아요.',
      '**속도 단계**: 10단계. 4 → 6 → 8 → 10 → 11 → 12 → 13 → 14 → 15 → 16km/h.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '문제 공개', body: '두뇌 대표들에게 수식이나 문장이 조각으로 공개돼요. 등호가 성립하거나 문장이 말이 되도록 **재배열**하고, 답은 조각 아래 적힌 **알파벳 순서**로 말해요.' },
      { title: '답하기', body: '**스틱을 잡아야** 답을 말할 수 있어요.' },
      { title: '링토스', body: '재배열 문제를 맞히지 못한 팀은 감각 대표가 **단 한 번의 링토스**를 성공시켜야 해요.' },
      { title: '속도 상승', body: '링토스에 실패하면 그 팀 러닝머신 속도가 한 단계 올라가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '같은 방식을 되풀이해 **마지막까지 버티는 마을**이 3라운드를 가져가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '러닝머신이 **10단계에 이르면** 문제를 놓쳐도 더는 속도가 오르지 않아요.',
      '두 팀이 모두 문제를 놓쳤을 때나 오답을 말했을 때의 처리, 문제 하나의 제한 시간은 정리된 규칙에 분명하지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '불굴의 러너Ⅱ는 8일차 불굴의 러너와 달리 **공격하지 않고 방어하는** 구조예요. 두뇌가 문제를 따내면 내 러닝머신은 안전하고, 놓치면 감각의 링토스가 마지막 방패가 돼요.' },
    { type: 'cards', items: [
      { title: '두 겹의 방어', body: '속도가 오르려면 "문제를 놓치고" "링토스도 실패해야" 해요. 두뇌가 약해도 감각의 링토스 성공률이 높으면 속도 상승을 꽤 막을 수 있어요. 세 영역이 각자 따로 실패 확률을 줄이는 구조예요.' },
      { title: '최고 단계 뒤의 계산', body: '10단계(16km/h)에서는 더 이상 속도가 오르지 않아요. 상대 러닝머신이 이미 최고 단계라면, 문제를 빨리 맞혀도 상대에게 줄 추가 피해가 없어요. 그때부터는 상대 러너가 그 속도로 얼마나 버티는지가 전부라, **문제를 빨리 끝내기보다 시간을 쓰게 만드는 것**이 유리해질 수 있어요.' },
      { title: '처음부터 시작이 낮아요', body: '1단계가 4km/h로, 8일차(8km/h 시작)보다 훨씬 느리게 시작해요. 초반 몇 문제는 피해가 작아서, 진짜 승부는 속도가 높아진 뒤의 몇 문제에서 나요.' },
    ], columns: 1 },
    { type: 'p', text: '두뇌·감각·신체가 각자 다른 단계에서 결과를 바꾸니 **우월 전략은 없어요.** 다만 상대가 최고 속도에 이른 뒤에는 "빨리 맞히는 것"의 가치가 달라진다는 점을 아는 쪽이 유리해요.' },
  ],
  similar: [
    { name: '킹 오브 도쿄 (King of Tokyo)', players: '2–6명', alike: '공격을 막지 못할 때마다 체력이 깎이고, 끝까지 버티는 쪽이 이겨요.', differs: '주사위로 공격과 회복을 정하는 개인전이에요.' },
    { name: '스페이스 얼럿 (Space Alert)', players: '1–5명', alike: '팀원마다 맡은 구역이 있고, 위협을 제때 막지 못하면 피해가 쌓여요.', differs: '실시간으로 계획한 뒤 결과를 확인하는 협력 게임이에요.' },
  ],
}, {
  meta: {
    title: 'The Indomitable Runner II rules — The Society Game season 1, final round 3',
    description: 'The rules of The Indomitable Runner II (불굴의 러너Ⅱ), the third round of The Society Game season 1 final: a body player on a stopped treadmill, brain players racing to solve equation or sentence rearrangements answered in letters, a single ring toss to block a speed-up, and ten speeds from 4 to 16 km/h.',
    keywords: ['The Indomitable Runner II', 'The Society Game final', 'Society Game season 1', '소사이어티 게임 불굴의 러너2'],
  },
  title: 'The Indomitable Runner II — The Society Game season 1, final round 3',
  name: 'The Indomitable Runner II (불굴의 러너Ⅱ)',
  lead: 'The brain players race on rearrangement problems; the side that misses must land a single ring toss, or its runner’s treadmill speeds up a level.',
  summary: 'Miss a rearrangement and a single ring toss decides whether your treadmill speeds up: the final’s third round.',
  setup: [
    { type: 'p', text: FINAL_EN },
    { type: 'list', items: [
      '**Body**: starts on a stopped treadmill.',
      '**Brain**: solves equation or sentence **rearrangements**.',
      '**Sense**: handles the ring toss.',
      '**Speed levels**: ten — 4, 6, 8, 10, 11, 12, 13, 14, 15, 16 km/h.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Problem', body: 'An equation or sentence appears in pieces; rearrange it so the equation holds or the sentence makes sense, answering with **the letters printed under the pieces**.' },
      { title: 'Answering', body: 'You must **grab the stick** to answer.' },
      { title: 'Ring toss', body: 'The team that fails the rearrangement must have its sense player land **a single ring toss**.' },
      { title: 'Speed-up', body: 'If the toss misses, that team’s treadmill goes up one level.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Repeat until one runner gives out; **the village that lasts** takes round 3.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'At **level 10** the speed no longer rises, even after a miss.',
      'What happens if both teams miss or someone answers wrongly, and the time per problem, are unclear in the written rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Unlike day 8’s version, this one is **defence, not attack**: winning the problem keeps your treadmill safe, and the ring toss is the last shield when you lose it.' },
    { type: 'cards', items: [
      { title: 'Two layers of defence', body: 'Speed rises only if you lose the problem **and** miss the toss. A strong ring-tosser can cover for a weaker brain player; each area independently cuts the chance of failure.' },
      { title: 'After the cap', body: 'At level 10 nothing more happens. Once the opposing treadmill is capped, answering quickly inflicts no further damage; what matters is how long their runner lasts, so **making the clock run** can become better than finishing fast.' },
      { title: 'A slow start', body: 'Level 1 is only 4 km/h, far slower than day 8’s 8 km/h start, so early problems cost little and the decisive ones come once speeds are high.' },
    ], columns: 1 },
    { type: 'p', text: 'Brain, sense and body each change the outcome at different points, so **there is no dominant strategy**; knowing that a fast answer loses its value once the opponent is capped is an edge.' },
  ],
  similar: [
    { name: 'King of Tokyo', players: '2–6', alike: 'Every attack you fail to stop costs health; the last one standing wins.', differs: 'Dice-driven, individual play.' },
    { name: 'Space Alert', players: '1–5', alike: 'Each teammate covers a station, and threats not stopped in time pile up damage.', differs: 'A cooperative game of planning in real time, then resolving.' },
  ],
});
