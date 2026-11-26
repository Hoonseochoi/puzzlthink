// 데스게임 season 1, matches 1–4: 기억의 만찬, 위치 콤보!, 러브 윈즈 올, 언어의 조각.
import { dg1Game } from './make';

export const memoryFeast = dg1Game('memory-feast', 1, ['blindGomoku', 'piggyBank', 'nemoCount'], {
  meta: {
    title: '기억의 만찬 규칙 — 데스게임 1회차, 같은 개수의 접시 두 개 찾기',
    description: '넷플릭스 데스게임(천만원을 걸어라) 1회차 기억의 만찬의 규칙을 정리했어요. 커버를 덮은 접시 20개, 1개부터 9개까지 늘려 가며 놓는 토큰 45개, 기록 금지, 두 접시 열기와 짝 맞추기, 실패 벌칙, 토큰을 먼저 다 쓰면 이기는 조건까지.',
    keywords: ['기억의 만찬', '데스게임 기억의 만찬', '넷플릭스 데스게임', '데스게임 1회차', '기억력 게임'],
  },
  title: '기억의 만찬 — 데스게임 1회차',
  name: '기억의 만찬',
  lead: '접시 20개에 토큰을 1개, 2개, … 9개씩 몰래 나눠 담아요. 그다음엔 같은 개수가 든 접시 두 개를 정확히 찾아 열어야 해요.',
  summary: '덮은 접시에 토큰을 나눠 담고, 같은 개수가 든 두 접시를 맞혀 여는 1:1 기억력 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**접시**: 1–20번 커버가 덮인 접시 20개.',
      '**토큰**: 각자 45개(1+2+…+9).',
      '**금지**: 토큰 개수를 적거나 표시하면 몰수패예요. 오직 기억으로만 해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '배치', body: '선부터 번갈아, 빈 접시 하나에 토큰을 놓고 커버를 덮어요. 처음엔 1개씩, 다음엔 2개씩… 9개까지 늘려 가며 45개를 다 놓아요. 이미 토큰이 든 접시에는 놓을 수 없어요.' },
      { title: '추가 토큰', body: '배치가 끝나면 각자 토큰 10개를 더 받아요.' },
      { title: '두 접시 열기 (1분)', body: '선부터, 접시 두 개의 커버를 열어요.' },
      { title: '판정', body: '두 접시의 토큰 수가 같으면 내 토큰 1개를 둘 중 한 접시에 넣어요. 다르면 벌칙으로 토큰 1개를 더 받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['**자기 토큰을 먼저 모두 써 버린 사람**이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '1분 안에 고르지 못하면 벌칙으로 토큰 2개를 더 받아요.',
      '짝을 맞혀 토큰을 넣으면 그 접시의 개수가 하나 늘어, 이후 짝이 바뀌어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '기억의 만찬은 **판이 계속 바뀌는 메모리 게임**이에요. 짝을 맞힐 때마다 한 접시의 토큰이 늘어나므로, 처음 외운 정보가 점점 낡아 가요.' },
    { type: 'cards', items: [
      { title: '같은 개수는 처음부터 생겨요', body: '두 사람이 똑같이 1개짜리 접시, 2개짜리 접시를 하나씩 만들므로, 처음부터 1부터 9까지 개수마다 접시가 두 개씩 생겨요(20개 중 18개). 남는 두 접시는 비어 있고요. 그래서 "상대가 몇 개를 어디에 놓았는지"만 외우면 짝을 바로 찾을 수 있어요.' },
      { title: '짝을 맞히면 짝이 깨져요', body: '맞힌 두 접시 중 한쪽에 토큰을 넣으면, 그 접시는 n+1개가 되어 원래 n+1개였던 두 접시와 함께 세 접시가 같은 개수가 되고, 다른 쪽은 짝을 잃어요. 어느 접시에 넣느냐로 상대가 쓸 짝을 만들어 줄 수도, 없앨 수도 있어요.' },
      { title: '토큰 수의 경주', body: '각자 10개를 들고 시작해 한 번 맞힐 때 1개씩 줄고, 틀리면 1개씩 늘어요. 틀림 한 번이 맞힘 한 번을 지우므로, 정확도가 속도보다 중요해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '뒤집힌 것 중 같은 짝 두 개를 기억해 찾아 여는 게임이에요.', differs: '메모리는 그림이 고정돼 있고, 맞힌 짝은 판에서 빠져요.' },
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '보이지 않는 정보를 기억에 의지해 정확한 순간에 써야 하는 게임이에요.', differs: '하나비는 협력 게임이고, 남의 카드는 보이지만 내 카드는 보이지 않아요.' },
  ],
  note: '방송에 나온 세부 규칙 일부(정리 자료에서 접혀 있는 부분)는 적지 않았어요.',
}, {
  meta: {
    title: 'Memory Feast rules — Death Game (The Risk Takers) match 1',
    description: 'The rules of Memory Feast (기억의 만찬) from Netflix’s Death Game season 1: twenty covered plates, 45 tokens placed one, two… nine at a time, no writing, opening two plates to find a match, penalties, and winning by using up your tokens.',
    keywords: ['Memory Feast', 'Death Game match 1', 'The Risk Takers', 'memory game'],
  },
  title: 'Memory Feast — Death Game match 1',
  name: 'Memory Feast',
  lead: 'Hide tokens under twenty plates — one, two, up to nine at a time — then find two plates holding the same number.',
  summary: 'A 1:1 memory duel: hide tokens under covered plates, then open matching pairs.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Plates**: twenty, covers numbered 1–20.',
      '**Tokens**: 45 each (1 + 2 + … + 9).',
      '**No notes**: writing counts is an instant loss.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Placing', body: 'Alternately put tokens on an empty plate and cover it: one at first, then two, up to nine, until all 45 are placed.' },
      { title: 'More tokens', body: 'Each player then receives ten more tokens.' },
      { title: 'Open two (one minute)', body: 'In turn, uncover two plates.' },
      { title: 'Judging', body: 'Equal counts: add one of your tokens to either plate. Different: take one more token as a penalty.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['**The first to get rid of all their tokens** wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Failing to choose within a minute costs two extra tokens.',
      'Adding a token changes that plate’s count, so pairs shift as the game goes on.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Memory Feast is **a memory game whose layout keeps changing**: every match changes a plate, so what you memorised slowly goes stale.' },
    { type: 'cards', items: [
      { title: 'Pairs exist from the start', body: 'Both players make one plate of each count, so every count 1–9 starts on two plates (18 of 20), with two plates empty. Remembering where the opponent put each count finds the pairs.' },
      { title: 'A match breaks a pair', body: 'Adding to one plate of a matched pair makes it n+1 — joining the two existing n+1 plates — and leaves its partner single. Which plate you add to can create or destroy pairs for the opponent.' },
      { title: 'A race of tokens', body: 'Each starts with ten; a match removes one, a miss adds one, so a single miss cancels a hit. Accuracy beats speed.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1+', alike: 'Remember hidden items and open matching pairs.', differs: 'The pictures never change and matched pairs leave the table.' },
    { name: 'Hanabi', players: '2–5', alike: 'You must rely on memory to use hidden information at the right moment.', differs: 'It is cooperative; you see others’ cards but not your own.' },
  ],
  note: 'Some detailed rules folded away in the source are not described.',
});

export const positionCombo = dg1Game('position-combo', 2, ['blindGomoku', 'nemoCount', 'indianPoker'], {
  meta: {
    title: '위치, 콤보! 규칙 — 데스게임 2회차, 외운 숫자판으로 족보 만들기',
    description: '넷플릭스 데스게임 2회차 위치, 콤보!의 규칙을 정리했어요. 10면체 주사위로 채우는 5×5 숫자판, 가려진 판을 외워 가로·세로·대각선 4칸 족보 선언, 쿼드부터 하이까지 7단계 족보, 같은 조합 재사용 금지와 12라운드 승점까지.',
    keywords: ['위치 콤보', '위치, 콤보', '데스게임 위치 콤보', '넷플릭스 데스게임', '데스게임 2회차'],
  },
  title: '위치, 콤보! — 데스게임 2회차',
  name: '위치, 콤보!',
  lead: '주사위로 나온 숫자를 내 5×5 판에 채운 뒤, 판이 가려진 상태에서 한 줄 네 칸의 족보를 외워서 선언해요.',
  summary: '주사위 숫자로 채운 5×5 판을 외워, 한 줄 4칸으로 만든 족보를 번갈아 겨루는 1:1 기억·조합 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**판**: 각자 5×5(A1–E5).',
      '**주사위**: 1–10이 적힌 10면체.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '판 채우기', body: '선부터 번갈아, 딜러가 굴린 숫자를 내 판의 빈칸 하나에 놓아요. 25칸이 다 찰 때까지 해요.' },
      { title: '판 가리기', body: '판의 숫자는 가려지고, 이제부터는 외운 내용으로만 선언해요.' },
      { title: '족보 선언', body: '라운드마다 내 판에서 가로·세로·대각선 한 방향으로 이어진 4칸을 골라 족보로 선언해요. 한 번 선언한 조합은 다시 쓸 수 없어요.' },
      { title: '판정', body: '족보가 높은 쪽이 승점을 얻어요. 같은 족보면 쓴 숫자가 높은 쪽, 그것도 같으면 무승부예요.' },
    ] },
    { type: 'table', head: ['족보 (높은 순)', '조건'], rows: [
      ['쿼드', '네 숫자가 모두 같음 (1,1,1,1)'],
      ['로열 스트레이트', '네 숫자가 순서대로 이어짐 (1,2,3,4)'],
      ['스트레이트', '연속이지만 순서가 섞임 (1,3,2,4)'],
      ['투페어', '같은 숫자 두 쌍'],
      ['트리플', '같은 숫자 셋'],
      ['원페어', '같은 숫자 둘'],
      ['하이', '어느 것도 아님'],
    ] },
  ],
  win: [
    { type: 'list', items: ['**12라운드 뒤 승점이 높은 사람**이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '판에서 4칸 한 줄은 가로 10개, 세로 10개, 대각선 8개(긴 대각선 2개에서 2개씩, 짧은 대각선 4개)로 모두 28개뿐이에요. 12라운드 동안 같은 줄을 다시 쓸 수 없으니, 좋은 줄을 아껴 써야 해요.',
      '투페어가 트리플보다 높아요. 일반 포커와 순서가 달라요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '위치, 콤보!는 **판을 짓는 단계와 꺼내 쓰는 단계**가 나뉜 게임이에요. 주사위는 운이지만, 숫자를 어디에 놓을지는 내가 정하므로 좋은 줄을 미리 설계할 수 있어요.' },
    { type: 'cards', items: [
      { title: '교차점이 중요해요', body: '한 칸은 가로·세로·대각선 여러 줄에 동시에 속해요. 같은 숫자를 줄이 많이 겹치는 칸(가운데 근처)에 모으면 여러 줄이 페어·트리플을 공유해 강한 족보가 많아져요.' },
        { title: '12번 쓸 줄을 계산하세요', body: '선언할 기회는 12번이고, 같은 조합은 한 번뿐이에요. 강한 줄 몇 개만 있으면 초반에 다 쓰고 후반에 약해지므로, 강한 줄을 라운드에 고르게 나누는 설계가 필요해요. 상대가 이미 쓴 강한 족보를 기억하면, 남은 상대의 패가 짐작돼요.' },
      { title: '기억이 곧 족보', body: '판이 가려지므로 25칸을 정확히 외워야 해요. 놓을 때부터 "기억하기 쉬운 패턴"(같은 숫자를 한 줄에, 연속된 숫자를 대각선에)을 만들면 외울 부담과 실수가 함께 줄어요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '야추 (Yahtzee)', players: '1명 이상', alike: '주사위 눈으로 같은 숫자 묶음이나 연속을 만들어 족보 점수를 내요.', differs: '야추는 다시 굴리며 조합을 만들고, 판을 외우지 않아요.' },
      { name: '빙고', players: '2명 이상', alike: '5×5 판의 가로·세로·대각선 줄로 승부를 내요.', differs: '빙고는 한 줄을 채우기만 하면 되고, 숫자 조합의 강약이 없어요.' },
  ],
}, {
  meta: {
    title: 'Position, Combo! rules — Death Game (The Risk Takers) match 2',
    description: 'The rules of Position, Combo! (위치, 콤보!) from Netflix’s Death Game season 1: a 5×5 board filled from a ten-sided die, declaring four-in-a-line hands from memory once the board is hidden, seven hand ranks from quad to high, no repeated lines, and twelve rounds.',
    keywords: ['Position Combo', 'Death Game match 2', 'The Risk Takers', 'memory combination game'],
  },
  title: 'Position, Combo! — Death Game match 2',
  name: 'Position, Combo!',
  lead: 'Fill your 5×5 board with the numbers a die rolls, then — with the board hidden — declare four-in-a-line hands from memory.',
  summary: 'A 1:1 duel of memory and combinations: fill a 5×5 board from dice rolls, then trade four-cell hands.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Board**: 5×5 each (A1–E5).',
      '**Die**: ten-sided, 1–10.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Filling', body: 'Alternately, place each rolled number on an empty cell of your board until all 25 are filled.' },
      { title: 'Hiding', body: 'The boards are hidden; from now on you declare from memory.' },
      { title: 'Declaring', body: 'Each round, pick four cells in a line (across, down or diagonal) as your hand; a line used once cannot be used again.' },
      { title: 'Judging', body: 'The better hand scores; equal hands compare numbers, then draw.' },
    ] },
    { type: 'table', head: ['Hand (high to low)', 'Needs'], rows: [
      ['Quad', 'Four equal (1,1,1,1)'],
      ['Royal straight', 'Four consecutive in order (1,2,3,4)'],
      ['Straight', 'Consecutive but out of order (1,3,2,4)'],
      ['Two pair', 'Two pairs'],
      ['Triple', 'Three equal'],
      ['One pair', 'Two equal'],
      ['High', 'None of the above'],
    ] },
  ],
  win: [
    { type: 'list', items: ['**After twelve rounds the higher score** wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A 5×5 board has only 28 four-cell lines (10 across, 10 down, 8 diagonal), and none can be reused in twelve rounds, so good lines must be rationed.',
      'Two pair ranks above a triple, unlike poker.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Position, Combo! splits into **building the board and spending it**. The dice are luck, but where numbers go is yours, so strong lines can be designed in advance.' },
    { type: 'cards', items: [
      { title: 'Intersections matter', body: 'A cell belongs to several lines; clustering equal numbers where many lines cross (near the centre) lets several lines share pairs and triples.' },
      { title: 'Plan twelve declarations', body: 'Twelve chances, each line once: a few strong lines spent early leave you weak late, so spread them. Remembering the strong hands your opponent has used tells you what they have left.' },
      { title: 'Memory is the hand', body: 'The board is hidden, so all 25 cells must be remembered. Building memorable patterns from the start (equal numbers in a row, runs on a diagonal) cuts both load and mistakes.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Yahtzee', players: '1+', alike: 'Score dice combinations of equal numbers and runs.', differs: 'You reroll to build combinations and never memorise a board.' },
    { name: 'Bingo', players: '2+', alike: 'Lines across, down or diagonally on a 5×5 board decide it.', differs: 'Any complete line wins; there are no ranked combinations.' },
  ],
});

export const loveWinsAll = dg1Game('love-wins-all', 3, ['indianPoker', 'twoSidedPoker', 'hitStay'], {
  meta: {
    title: '러브 윈즈 올 규칙 — 데스게임 3회차, 가위바위보 포커',
    description: '넷플릭스 데스게임 3회차 러브 윈즈 올의 규칙을 정리했어요. 가위 12·바위 7·보 7·러브 4장, 3장으로 만드는 족보 6단계와 가위바위보 상성, 기본 베팅과 두 번의 베팅, 한 장 공개 후 거짓말도 되는 족보 선언, 칩 25개를 모두 따면 승리까지.',
    keywords: ['러브 윈즈 올', '러브윈즈올', '데스게임 러브 윈즈 올', '가위바위보 포커', '넷플릭스 데스게임'],
  },
  title: '러브 윈즈 올 — 데스게임 3회차',
  name: '러브 윈즈 올',
  lead: '가위바위보 카드 세 장으로 포커를 해요. 한 장을 보여 주고 족보를 말하는데, 그 말은 거짓이어도 돼요.',
  summary: '가위·바위·보·러브 카드 3장으로 족보를 만들고, 거짓 선언도 허용되는 1:1 베팅 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**카드 30장**: 가위 12, 바위 7, 보 7, 러브 4.',
      '**칩**: 각자 25개(본게임 전 연습 게임은 20개).',
    ] },
    { type: 'table', head: ['족보 (높은 순)', '조건'], rows: [
      ['러브 윈즈 올', '러브 3장'],
      ['트리플', '같은 가위바위보 3장'],
      ['투 러브', '러브 2장'],
      ['믹스', '가위·바위·보 1장씩'],
      ['더블', '러브 없이 같은 카드 2장'],
      ['원 러브', '러브 1장'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '기본 베팅과 카드', body: '칩 1개씩 걸고 카드 3장을 받아요. 1라운드 선은 추첨, 그 뒤로는 직전 승자가 선이에요.' },
      { title: '1차 베팅', body: '일반 포커처럼 베팅해요.' },
      { title: '한 장 공개와 선언', body: '각자 카드 1장을 공개하고 자기 족보를 선언해요. **거짓 선언도 가능**해요.' },
      { title: '2차 베팅과 승부', body: '베팅한 뒤 모든 카드를 공개해 족보가 높은 쪽이 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['**상대의 칩 25개를 모두 가져온 사람**이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '같은 족보끼리는 가위바위보 상성으로, 그것도 비기면 나머지 카드의 상성으로 비교해요. 투 러브끼리는 나머지 한 장의 상성, 원 러브끼리는 무승부예요.',
      '무승부면 판돈이 다음 라운드로 넘어가요. 포기로 끝나면 카드를 공개하지 않아요.',
      '실수로 카드가 보이면, 바꾸지 않고 그대로 진행해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '러브 윈즈 올은 **거짓말이 허용되는 선언**이 핵심이에요. 시즌 2 버전과 달리 선언이 가능성에 묶이지 않아서, 공개한 한 장과 베팅이 선언의 신빙성을 판단하는 유일한 근거예요.' },
    { type: 'cards', items: [
      { title: '러브는 30장 중 4장', body: '러브 3장(러브 윈즈 올)은 매우 드물고, 러브 2장도 흔하지 않아요. 상대가 러브를 공개하고 "러브 윈즈 올"을 선언하면 확률상 대부분 허세예요. 반대로 가위가 12장이라 가위 트리플은 상대적으로 잘 나와요.' },
      { title: '한 장 공개는 정보를 줘요', body: '공개한 한 장은 진짜 카드이므로, 그 카드와 모순되는 선언은 허세로 드러나요. 그래서 어떤 카드를 보여 줄지 고르는 것이 곧 어떤 이야기를 할지 고르는 일이에요.' },
      { title: '상성으로 갈리는 같은 족보', body: '같은 족보라면 가위바위보 상성이 결정해요. 상대가 바위 계열로 보이면, 내 족보가 같아도 보 계열이어야 이겨요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '라이어스 포커 (Liar’s Poker)', players: '2명 이상', alike: '자기 패에 대해 거짓말도 섞어 선언하고, 상대가 믿을지 의심할지 판단해요.', differs: '라이어스 포커는 지폐 일련번호를 패로 쓰고, 베팅 칩이 없어요.' },
    { name: '포커 (드로우·스터드)', players: '2–8명', alike: '족보와 베팅, 허세로 상대의 칩을 빼앗아요.', differs: '포커는 52장 트럼프로 하고, 족보를 말로 선언하지 않아요.' },
  ],
}, {
  meta: {
    title: 'Love Wins All rules — Death Game (The Risk Takers) match 3',
    description: 'The rules of Love Wins All from Netflix’s Death Game season 1: 12 scissors, 7 rock, 7 paper and 4 love cards, six three-card hand ranks and rock-paper-scissors tie-breaks, ante and two betting rounds, revealing one card and declaring a hand that may be a lie, and winning all 25 chips.',
    keywords: ['Love Wins All', 'Death Game match 3', 'rock paper scissors poker', 'The Risk Takers'],
  },
  title: 'Love Wins All — Death Game match 3',
  name: 'Love Wins All',
  lead: 'Poker with three rock-paper-scissors cards. Show one card and declare your hand — the declaration may be a lie.',
  summary: 'A 1:1 betting game of scissors, rock, paper and love cards where declarations may be bluffs.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**30 cards**: 12 scissors, 7 rock, 7 paper, 4 love.',
      '**Chips**: 25 each (20 in the practice game).',
    ] },
    { type: 'table', head: ['Hand (high to low)', 'Needs'], rows: [
      ['Love wins all', 'Three loves'],
      ['Triple', 'Three of the same RPS card'],
      ['Two love', 'Two loves'],
      ['Mix', 'One each of rock, paper, scissors'],
      ['Double', 'Two alike, no love'],
      ['One love', 'One love'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Ante and cards', body: 'Ante one chip and take three cards. Round 1’s leader is drawn; then the previous winner leads.' },
      { title: 'First bet', body: 'Ordinary poker betting.' },
      { title: 'Reveal and declare', body: 'Each reveals one card and declares a hand — **lying is allowed**.' },
      { title: 'Second bet and showdown', body: 'Bet again, show everything; the better hand wins.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['**Take all 25 of the opponent’s chips** to win.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Equal hands go by rock-paper-scissors, then by the other cards; two-loves compare their third card, one-loves tie.',
      'A tie carries the pot; a fold reveals nothing.',
      'A card exposed by accident stays in play.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The core is **declarations that may be lies**. Unlike season 2, claims are not bound to what is possible, so the shown card and the betting are the only evidence.' },
    { type: 'cards', items: [
      { title: 'Four loves in thirty', body: 'Three loves are very rare and two uncommon; a revealed love with a "love wins all" claim is usually a bluff. With twelve scissors, a scissors triple is comparatively common.' },
      { title: 'The shown card informs', body: 'It is real, so a declaration contradicting it is exposed. Choosing which card to show is choosing what story you can tell.' },
      { title: 'The cycle settles ties', body: 'Equal hands go to rock-paper-scissors; against an apparent rock hand you need paper.' },
    ], columns: 1 },
  ],
  similar: [
    { name: "Liar's Poker", players: '2+', alike: 'Declare your holdings, lies included, and judge whether the opponent believes it.', differs: 'It uses banknote serial numbers and no chips.' },
    { name: 'Poker (draw or stud)', players: '2–8', alike: 'Hands, betting and bluffing to win chips.', differs: 'It uses a standard deck and hands are never declared aloud.' },
  ],
});

export const piecesOfLanguage = dg1Game('pieces-of-language', 4, ['hiddenWord', 'equationSignal', 'gyulhap'], {
  meta: {
    title: '언어의 조각 규칙 — 데스게임 4회차, 자모 타일로 맞히는 한글 워들',
    description: '넷플릭스 데스게임 4회차 언어의 조각의 규칙을 정리했어요. 정답 단어에 쓰이는 자모 타일, 돌리고 합쳐 만드는 자모(ㄱ→ㄴ, ㅏ→ㅗ, ㅏ+ㅣ→ㅐ 등), 1분 등록과 빨강·노랑·초록 판정, 상대에게는 개수만 보이는 정보, 라운드마다 늘어나는 글자 수와 13점까지.',
    keywords: ['언어의 조각', '데스게임 언어의 조각', '한글 워들', '넷플릭스 데스게임', '데스게임 4회차'],
  },
  title: '언어의 조각 — 데스게임 4회차',
  name: '언어의 조각',
  lead: '정답 단어에 쓰이는 자음·모음 타일을 받아, 돌리고 붙여 단어를 맞혀요. 칸마다 빨강·노랑·초록 불이 켜지는 한글판 워들이에요.',
  summary: '정답에 쓰이는 자모 타일을 돌리고 합쳐 단어를 맞히는 1:1 한글 단어 추리. 상대에게는 불빛 개수만 보여요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**정답**: 표준국어대사전에 실린 단어. 1라운드는 3글자로 시작해 라운드마다 한 글자씩 늘어요.',
      '**타일**: 라운드마다 정답에 쓰이는 자모 타일과 정답 칸이 주어져요.',
    ] },
    { type: 'table', head: ['타일 바꿔 쓰기', '예'], rows: [
      ['돌리기 (자음)', 'ㄱ을 돌려 ㄴ'],
      ['붙이기 (자음)', '자음 둘을 붙여 겹받침이나 쌍자음'],
      ['돌리기 (모음)', 'ㅏ → ㅗ·ㅜ·ㅓ, ㅑ → ㅛ·ㅠ·ㅕ'],
      ['합치기 (모음)', 'ㅏ+ㅣ → ㅔ·ㅐ·ㅚ·ㅟ, ㅑ+ㅣ → ㅖ·ㅒ, ㅏ+ㅏ+ㅣ → ㅙ·ㅞ'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '등록 (1분)', body: '선부터, 타일을 정답 칸에 놓고 등록해요. 상대도 등록 과정을 볼 수 있어요. 빈칸이 있거나 타일을 다 쓰지 않아도 되지만, 자음만 또는 모음만 쓸 수는 없어요.' },
      { title: '판정', body: '타일마다 불이 켜져요. **빨강**은 그 글자가 안 쓰임, **노랑**은 쓰이지만 위치가 다름, **초록**은 위치까지 맞음이에요.' },
      { title: '정보 차이', body: '등록한 사람은 불빛의 정확한 위치를 보지만, 상대에게는 색깔별 개수만 보여요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '모든 칸을 초록으로 만든 사람이 그 라운드를 이기고, **글자 수만큼** 승점을 받아요.',
      '최대 5라운드, **먼저 13점을 얻은 사람**이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '타일 수가 정해져 있어서, 같은 타일을 돌려 쓰느냐 합쳐 쓰느냐에 따라 만들 수 있는 글자가 달라요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '언어의 조각은 **워들과 한글 자모 퍼즐**을 합친 게임이에요. 타일이 이미 정답에 쓰이는 것들이라, "무엇이 들어가는지"보다 "어떻게 조합해 어디에 놓는지"가 문제예요.' },
    { type: 'cards', items: [
      { title: '상대의 시도도 정보예요', body: '상대가 등록하는 모습을 볼 수 있고, 불빛의 개수도 보여요. 상대가 놓은 단어와 초록 개수를 보면 내 차례에 그대로 활용할 수 있어서, 먼저 시도하는 사람이 정보를 주는 셈이에요. 그래서 완성 직전까지 가는 시도가 오히려 상대에게 답을 넘겨줄 수 있어요.' },
      { title: '자모 변형이 경우의 수를 키워요', body: 'ㅏ 하나가 ㅏ·ㅗ·ㅜ·ㅓ 네 가지가 되고, 합치면 더 많아져요. 타일 구성만 보고 가능한 모음 조합을 먼저 따져 보면, 후보 단어가 빠르게 줄어요.' },
      { title: '긴 단어일수록 큰 점수', body: '점수가 글자 수만큼이라 뒤 라운드일수록 커요. 13점에 먼저 닿으면 끝나므로, 3·4글자에서 앞서도 5·6글자 라운드 한 판에 뒤집힐 수 있어요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '마스터마인드 (Mastermind)', players: '2명', alike: '"맞는 자리 / 있지만 다른 자리" 피드백으로 숨은 답을 좁혀 가요.', differs: '마스터마인드는 색 말로 하고, 상대의 시도를 볼 수 없어요.' },
    { name: '스크래블 (Scrabble)', players: '2–4명', alike: '정해진 글자 타일로 사전에 있는 단어를 만드는 단어 게임이에요.', differs: '스크래블은 정답이 없고, 판 위에 단어를 이어 붙여 점수를 내요.' },
  ],
}, {
  meta: {
    title: 'Pieces of Language rules — Death Game (The Risk Takers) match 4 (a Korean Wordle)',
    description: 'The rules of Pieces of Language (언어의 조각) from Netflix’s Death Game season 1: jamo tiles from the answer, rotating and combining them into letters, one-minute entries with red, yellow and green lights, the opponent seeing only counts, words growing a syllable each round, and the race to 13.',
    keywords: ['Pieces of Language', 'Death Game match 4', 'Korean Wordle', 'The Risk Takers'],
  },
  title: 'Pieces of Language — Death Game match 4',
  name: 'Pieces of Language',
  lead: 'Rotate and combine the consonant and vowel tiles of the answer to spell it — a Korean Wordle where each cell lights red, yellow or green.',
  summary: 'A 1:1 Korean word duel: rotate and combine the answer’s jamo tiles; the opponent sees only how many lights you got.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Answer**: a word in the standard Korean dictionary; three syllables in round 1, one more each round.',
      '**Tiles**: each round gives the jamo used in the answer and the answer slots.',
    ] },
    { type: 'table', head: ['Changing tiles', 'Example'], rows: [
      ['Rotate (consonant)', 'ㄱ becomes ㄴ'],
      ['Join (consonants)', 'two consonants make a double consonant or cluster'],
      ['Rotate (vowel)', 'ㅏ → ㅗ, ㅜ, ㅓ; ㅑ → ㅛ, ㅠ, ㅕ'],
      ['Combine (vowels)', 'ㅏ+ㅣ → ㅔ, ㅐ, ㅚ, ㅟ; ㅑ+ㅣ → ㅖ, ㅒ; ㅏ+ㅏ+ㅣ → ㅙ, ㅞ'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Entry (one minute)', body: 'From the first player, place tiles in the slots and register (the opponent watches). Gaps and unused tiles are allowed, but not consonants only or vowels only.' },
      { title: 'Lights', body: '**Red**: not used; **yellow**: used elsewhere; **green**: right place.' },
      { title: 'Information gap', body: 'The entrant sees exactly where the lights are; the opponent sees only how many of each colour.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'All green wins the round for **as many points as letters**.',
      'Up to five rounds; **first to 13** wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Tiles are limited, so whether you rotate or combine a tile changes which letters you can make.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Pieces of Language combines **Wordle with Korean jamo puzzles**. The tiles are already the answer’s, so the question is how to combine and place them, not what is in it.' },
    { type: 'cards', items: [
      { title: 'Their attempts inform you', body: 'You watch the opponent build and see their light counts, so their attempt feeds your next one. A near-complete try can hand them the answer.' },
      { title: 'Variants multiply options', body: 'One ㅏ can be four vowels, more when combined. Working out the possible vowels from the tiles first shrinks the candidates quickly.' },
      { title: 'Longer words pay more', body: 'Points equal length, so later rounds are bigger and one five- or six-syllable round can overturn an early lead.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Mastermind', players: '2', alike: '"Right place / wrong place" feedback narrows down a hidden answer.', differs: 'It uses coloured pegs and you never see the other side’s attempts.' },
    { name: 'Scrabble', players: '2–4', alike: 'Spell dictionary words with a fixed set of letter tiles.', differs: 'There is no hidden answer; words are built across a board for points.' },
  ],
});
