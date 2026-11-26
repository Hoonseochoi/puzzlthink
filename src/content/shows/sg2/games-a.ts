// 소사이어티 게임 2, challenges 1–6 (days 2–7): 텐메이드, 정글짐, 러시아 장기, 흔들다리, 삼각 줄다리기, 큐브 코드.
// 러시아 장기 is playable on PUZZLTHINK.
import { day, sg2Game } from './shared';

export const tenMade = sg2Game('ten-made', 'main', day(2), 1, ['equationTower', 'equationSignal', 'hexagon'], {
  meta: {
    title: '텐메이드 규칙 — 소사이어티 게임2 첫 번째 챌린지, 1:1 대결로 타일을 따서 10 만들기',
    description: '소사이어티 게임2 첫 번째 챌린지 텐메이드의 규칙을 정리했어요. 기본 타일 3개, 상대 팀이 지키는 추가 타일 11개, 4가지 1:1 대결, 12라운드 뒤 답이 10인 수식, 사용한 타일 수로 가리는 승패와 0·기호 타일이 왜 중요한지까지.',
    keywords: ['텐메이드', '소사이어티 게임2 텐메이드', '소사이어티게임2 첫 번째 챌린지', '소사이어티 게임2 게임', '수식 10 만들기'],
  },
  title: '텐메이드 — 소사이어티 게임2 첫 번째 챌린지',
  name: '텐메이드',
  lead: '두 마을이 1:1 대결로 숫자와 기호 타일을 빼앗아 와요. 12라운드가 끝나면 가진 타일로 답이 10인 수식을 만들고, 더 긴 수식을 만든 쪽이 이겨요.',
  summary: '1:1 대결로 타일을 모아, 답이 10인 수식을 더 많은 타일로 만드는 팀전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 두 마을 주민 전원. 두 마을의 참가 인원은 같아야 해요.',
      '**기본 타일**: 마을마다 + 타일, ÷ 타일, 그리고 0–8 중 숫자 타일 1개, 모두 3개를 먼저 받아요.',
      '**추가 타일**: × 타일, − 타일, 0–8 숫자 타일로 이루어진 마을별 추가 타일 11개. 내 마을의 추가 타일은 **상대 마을 주민들이 하나씩 맡아** 지키고 있어요.',
      '**1:1 대결 종목**: 4가지. 주민마다 정해진 방식에 따라 자기가 나설 종목을 골라 둬요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '공격 선언', body: '공격권을 가진 마을의 주민이 갖고 싶은 타일과 대결 종목을 골라요.' },
      { title: '1:1 대결', body: '그 타일을 맡고 있는 상대 마을 주민과 고른 종목으로 겨뤄요. 이긴 사람이 상대가 쥔 타일을 가져가고, 진 사람은 챌린지에서 빠져요.' },
      { title: '12라운드', body: '이렇게 모두 12라운드를 치러요.' },
      { title: '수식 완성', body: '라운드가 끝나면 마을마다 가진 타일로 답이 **10**인 수식을 만들어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '두 마을 모두 수식을 완성하면, 수식에 **타일을 더 많이 쓴** 마을이 이겨요. 쓴 타일 수가 같으면 남은 타일이 더 많은 마을이 이겨요.',
      '두 마을 모두 수식을 만들지 못하면, 모은 타일이 더 많은 마을이 이겨요.',
      '이긴 마을은 상금 1,000만 원(리더가 주민 한 명에게 몰아서 줘요)과 블랙리스트 작성 권한을 얻고, 진 마을은 그날 저녁 탈락자를 한 명 정해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '대결에서 진 주민은 그 뒤 라운드에 다시 나설 수 없어요. 그래서 라운드가 지날수록 남은 사람과 남은 타일의 조합이 바뀌어요.',
      '나무위키 정리에 따르면 숫자 타일을 나란히 붙여 여러 자리 수로 쓸 수 있고(1, 2, 3을 붙이면 123), 계산 중 나누어떨어지지 않아 소수가 나오면 10으로 인정되지 않아요. 또 1과 0만 붙여 "10"이라고 내는 것처럼 수식이 아닌 답은 안 돼요.',
      '4가지 1:1 대결 종목은 몸싸움·민첩성·기억력이 섞여 있었어요. 종목별 세부 규칙은 공개된 규칙 설명에 나오지 않아 여기 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '텐메이드는 **수식 퍼즐**처럼 보이지만, 점수는 "10을 만들었느냐"가 아니라 "몇 장을 썼느냐"로 갈려요. 그래서 대결에서 어떤 타일을 노리느냐가 승패의 대부분을 정해요.' },
    { type: 'cards', items: [
      { title: '0은 다른 숫자를 모두 삼키는 타일', body: '0이 있으면 "… + 0 ÷ (남은 숫자를 전부 붙인 큰 수)"처럼, 남는 숫자를 한 덩어리로 묶어 값에 아무 영향 없이 수식에 넣을 수 있어요. × 타일이 있으면 "0 × …"도 같은 역할을 해요. 앞부분에서 10만 만들 수 있으면 나머지 숫자를 모두 쓸 수 있으니, 0은 다른 숫자 타일 몇 장의 가치가 있어요.' },
      { title: '기호가 수식의 길이를 정한다', body: '기본으로 받는 기호는 +와 ÷뿐이라, 숫자가 많아도 연결할 기호가 모자라면 길게 만들 수 없어요. − 타일은 큰 수끼리 상쇄할 수 있게 해 주고, × 타일은 0과 함께 쓰면 남은 숫자를 처리해 줘요. 기호 두 장은 숫자 한 장보다 값어치가 커요.' },
      { title: '누구를 상대로 고르느냐', body: '공격하는 쪽이 타일과 종목을 고르니, 사실상 "상대 마을의 누구와 어떤 종목으로 붙을지"를 고르는 셈이에요. 중요한 타일을 맡은 상대가 약한 종목을 찾고, 내 쪽 강자는 꼭 필요한 타일에 아껴 두는 배치 싸움이 돼요. 진 사람은 빠지니, 강한 주민이 일찍 지면 그 뒤 선택지가 크게 줄어요.' },
      { title: '동점 규칙도 계산에 넣기', body: '쓴 타일 수가 같으면 남은 타일 수로 가르니, 끝까지 타일을 한 장이라도 더 따 두는 것이 손해가 아니에요. 두 마을 모두 수식을 못 만들면 모은 타일 수로 가르는 점도 같은 방향이에요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없지만 **우선순위**는 분명해요. 0과 기호 타일을 먼저 확보하고, 그다음 숫자 타일을 모으는 쪽이 같은 수의 대결 승리로 더 긴 수식을 만들 수 있어요.' },
  ],
  similar: [
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자 카드와 사칙연산으로 목표 숫자를 만들어요.', differs: '크립토는 카드 다섯 장을 모두 써서 정해진 목표를 맞히는 계산 경쟁이고, 카드를 빼앗아 오는 대결이 없어요.' },
    { name: '이퀘이트 (Equate)', players: '2–4명', alike: '숫자와 기호 타일을 이어 맞는 식을 만들고, 많이·길게 쓸수록 점수가 커요.', differs: '이퀘이트는 스크래블처럼 판 위에 등식을 놓아 가는 게임이고, 답이 10으로 정해져 있지 않아요.' },
  ],
  note: '숫자 이어 붙이기와 소수 처리는 나무위키 정리에만 있어요.',
}, {
  meta: {
    title: 'Ten Made rules — The Society Game 2, challenge 1: win tiles in duels, then make 10',
    description: 'The rules of Ten Made (텐메이드), the first challenge of The Society Game 2: three starting tiles, eleven extra tiles guarded by the other village, four kinds of one-on-one duel, an equation equal to 10 after twelve rounds, and why the 0 and operator tiles matter most.',
    keywords: ['Ten Made', 'The Society Game 2', 'Society Game 2 challenge', '소사이어티 게임2 텐메이드'],
  },
  title: 'Ten Made — The Society Game 2, challenge 1',
  name: 'Ten Made (텐메이드)',
  lead: 'The two villages win number and operator tiles from each other in one-on-one duels. After twelve rounds each builds an equation equal to 10; the longer equation wins.',
  summary: 'A team game of winning tiles in duels, then making 10 with as many tiles as possible.',
  setup: [
    { type: 'list', items: [
      '**Players**: everyone in both villages; both must field the same number.',
      '**Starting tiles**: each village gets a + tile, a ÷ tile and one number tile from 0–8.',
      '**Extra tiles**: eleven per village — ×, − and number tiles 0–8. Your village’s extra tiles are **each held by a player of the other village**.',
      '**Duels**: four kinds; each player picks, by a set procedure, which kind they will play.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Attack', body: 'A player of the attacking village names the tile they want and the kind of duel.' },
      { title: 'Duel', body: 'They face the opposing player holding that tile. The winner takes the loser’s tile; the loser is out of the challenge.' },
      { title: 'Twelve rounds', body: 'This repeats for twelve rounds.' },
      { title: 'Build the equation', body: 'Each village then uses its tiles to make an equation whose answer is **10**.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'If both complete an equation, the one **using more tiles** wins; if tied, the village with more tiles left over wins.',
      'If neither can, the village with more tiles wins.',
      'The winners get ₩10 million (given by the leader to one villager) and the right to write on the blacklist; the losers eliminate one player that evening.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A player who loses a duel cannot play again, so the mix of remaining players and tiles changes every round.',
      'According to the fan wiki, number tiles placed side by side read as one number (1, 2, 3 → 123); a division that leaves a fraction does not count as 10; and a bare "10" from 1 and 0 is not an equation.',
      'The four duels mixed strength, agility and memory; their detailed rules were not in the published rules and are left out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Ten Made looks like an equation puzzle, but the score is **how many tiles you use**, not whether you reach 10. Which tiles you go after decides most of it.' },
    { type: 'cards', items: [
      { title: 'The 0 swallows everything', body: 'With a 0 you can write "… + 0 ÷ (all leftover digits as one big number)", adding every spare number without changing the value; with × the same works as "0 × …". Once the front part makes 10, every remaining digit can be used, so the 0 is worth several number tiles.' },
      { title: 'Operators set the length', body: 'You start with only + and ÷, and without enough operators extra numbers cannot be linked. − lets large numbers cancel, × pairs with 0 to absorb leftovers. Two operator tiles are worth more than one number.' },
      { title: 'Choosing the opponent', body: 'Since the attacker names both tile and duel, the real choice is which opposing player to face in which event: find weak events for whoever holds a key tile, and save your strongest for the tiles you need most. Losers drop out, so an early loss by a strong player narrows every later option.' },
      { title: 'Count the tiebreaks', body: 'Equal tile counts are split by leftover tiles, and if neither village completes an equation the tile count decides — so one more tile is never wasted.' },
    ], columns: 1 },
    { type: 'p', text: 'There is no dominant strategy, but the **priorities** are clear: secure the 0 and the operators first, then numbers, and the same number of duel wins turns into a longer equation.' },
  ],
  similar: [
    { name: 'Krypto', players: '1+', alike: 'Combine number cards with the four operations to hit a target.', differs: 'All five cards must be used to hit a given target; there is no winning cards from opponents.' },
    { name: 'Equate', players: '2–4', alike: 'Link number and operator tiles into valid equations; more and longer scores more.', differs: 'It is played Scrabble-style on a board, with no fixed answer of 10.' },
  ],
  note: 'Joining digits and the fraction rule come only from the fan wiki.',
});

export const jungleGym = sg2Game('jungle-gym', 'main', day(3), 2, ['hexagon', 'gyulhap', 'nemoCount'], {
  meta: {
    title: '정글짐 규칙 — 소사이어티 게임2 두 번째 챌린지, 신체·두뇌 2인 1조 그림 위치 암기',
    description: '소사이어티 게임2 두 번째 챌린지 정글짐의 규칙을 정리했어요. 신체·두뇌 대표 2인 1조, 4×4 좌표의 그림 16장 암기, 로프를 단 채 정글짐 통과해 상대 문제판 덮기, 한 팀만 틀릴 때까지 이어지는 문제, 5라운드 3선승과 암기 요령까지.',
    keywords: ['정글짐', '소사이어티 게임2 정글짐', '소사이어티게임2 두 번째 챌린지', '소사이어티 게임2 게임', '그림 위치 암기'],
  },
  title: '정글짐 — 소사이어티 게임2 두 번째 챌린지',
  name: '정글짐',
  lead: '두뇌 대표가 그림 16장의 위치를 외우는 동안, 신체 대표는 정글짐을 넘어 상대 팀의 문제판을 덮으러 가요. 덮이는 순간 외우기는 끝나요.',
  summary: '신체 대표가 상대의 암기 시간을 끊고, 두뇌 대표가 그림 위치를 맞히는 2인 1조 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 라운드마다 마을별 신체 대표 1명 + 두뇌 대표 1명, 2인 1조.',
      '**문제판**: 세로 A–D, 가로 1–4 좌표가 붙은 4×4 칸에 그림 16장.',
      '**정글짐**: 신체 대표는 로프에 묶인 채 정글짐을 통과해야 해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '동시 출발', body: '시작과 함께 두뇌 대표는 자기 팀 문제판을 열고 그림 16장의 위치를 외워요. 신체 대표는 정글짐을 통과해 **상대 팀의** 문제판을 닫으러 가요.' },
      { title: '문제', body: '두 문제판이 모두 닫히면 문제가 나오고, 두뇌 대표는 답을 종이에 적어 내요.' },
      { title: '라운드 판정', body: '한 팀만 틀릴 때까지 문제가 이어지고, 틀린 팀이 그 라운드를 져요.' },
      { title: '다음 라운드', body: '라운드마다 그림 배치가 새로 바뀌어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드 중 **3라운드를 먼저 이긴** 마을이 챌린지에서 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두 팀이 같은 문제를 함께 맞히거나 함께 틀리면 승부가 나지 않고 다음 문제로 넘어가요.',
      '내 팀의 암기 시간은 상대 신체 대표가 내 문제판을 덮을 때까지예요. 내 신체 대표가 빠를수록 상대의 암기 시간이 짧아져요.',
      '문제의 형식(그림 → 좌표인지, 좌표 → 그림인지 등)은 공개된 규칙 설명에 자세히 나오지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '정글짐의 묘미는 **내 암기 시간을 상대가 정한다**는 점이에요. 신체 대표의 속도는 우리 팀 점수를 직접 올리지 않고, 상대 두뇌 대표의 시간을 깎아요.' },
    { type: 'cards', items: [
      { title: '시간이 짧을 때의 암기 순서', body: '16장을 다 외울 시간이 없다고 보고, 한 줄씩(A행부터) 끊어 외우는 편이 안전해요. 뒤죽박죽 외우면 몇 장을 확실히 아는지 스스로 판단하기 어렵거든요. 그림을 줄 단위 이야기로 엮으면 "몇 번째 칸"이 함께 기억돼요.' },
      { title: '한 팀만 틀릴 때까지', body: '둘 다 맞히면 계속 이어지니, 결국 **어느 쪽이 먼저 모르는 칸에 걸리느냐**의 싸움이에요. 많이 외운 쪽이 유리하지만, 몇 장 차이라면 운이 크게 작용해요. 그래서 신체 대표가 몇 초 빨리 덮는 것이 그 몇 장의 차이를 만들어요.' },
      { title: '짝 고르기', body: '두뇌가 가장 강한 주민을 한 라운드에 쓰고 끝낼지, 라운드마다 고르게 나눌지가 마을의 선택이에요. 3선승이라 최강의 조합을 세 번 낼 수 없다면, 상대의 약한 조와 내 강한 조가 만나도록 순서를 짜는 것이 중요해요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 신체와 두뇌 두 사람 모두 평균 이상이어야 이기는 구조라, 한쪽만 뛰어난 조는 의외로 약해요.' },
  ],
  similar: [
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '뒤집힌 그림 카드의 위치를 기억해 맞혀요.', differs: '메모리는 직접 뒤집어 보며 짝을 찾고, 암기 시간을 상대가 끊는 장치가 없어요.' },
    { name: '메모아르! (Memoarrr!)', players: '2–6명', alike: '격자에 놓인 그림 카드의 위치를 기억하는 것이 핵심이에요.', differs: '카드를 하나씩 뒤집으며 앞 카드와 이어지는지 판단하고, 틀리면 그 판에서 빠지는 방식이에요.' },
  ],
}, {
  meta: {
    title: 'Jungle Gym rules — The Society Game 2, challenge 2: memorise picture positions in pairs',
    description: 'The rules of Jungle Gym (정글짐), the second challenge of The Society Game 2: one strength and one brain player per pair, sixteen pictures on a 4×4 grid, a roped climb to cover the other team’s board, questions until one team misses, best of five.',
    keywords: ['Jungle Gym', 'The Society Game 2', 'Society Game 2 challenge', '소사이어티 게임2 정글짐'],
  },
  title: 'Jungle Gym — The Society Game 2, challenge 2',
  name: 'Jungle Gym (정글짐)',
  lead: 'While the brain player memorises where sixteen pictures sit, the strength player climbs a jungle gym to cover the other team’s board — and covering it ends their memorising.',
  summary: 'A pairs duel: the climber cuts the rival’s study time, the brain answers where each picture was.',
  setup: [
    { type: 'list', items: [
      '**Players**: each round, one strength and one brain player per village.',
      '**Board**: sixteen pictures on a 4×4 grid marked A–D down and 1–4 across.',
      '**Jungle gym**: the strength player crosses it while roped.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Go', body: 'The brain player opens their team’s board and memorises the sixteen positions; the strength player crosses the jungle gym to close **the other team’s** board.' },
      { title: 'Questions', body: 'When both boards are closed, questions begin; brain players write their answers.' },
      { title: 'Round', body: 'Questions continue until only one team is wrong; that team loses the round.' },
      { title: 'Next round', body: 'The pictures are reshuffled every round.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['The first village to win **three of five** rounds wins the challenge.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If both teams are right, or both wrong, the round goes on to the next question.',
      'Your study time lasts until the rival climber closes your board; your own climber shortens theirs.',
      'The exact question format is not given in the published rules and is left out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The twist is that **your study time is set by your opponent**. The climber’s speed does not score; it cuts the rival brain player’s time.' },
    { type: 'cards', items: [
      { title: 'Memorising under a cut-off', body: 'Assume you will not get all sixteen and learn row by row from A; a jumbled sweep leaves you unsure how many you really know. Linking each row into a little story keeps the column positions too.' },
      { title: 'Until one team misses', body: 'Both right means play on, so it comes down to **who first hits a cell they do not know**. More memorised helps, but a few cards’ difference leaves room for luck — which is exactly what a few seconds of climbing buys.' },
      { title: 'Pairing', body: 'A village chooses whether to spend its best brain in one round or spread talent across rounds; in a best of five, ordering so your strong pairs meet their weak ones matters.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy: both members must be decent, so a pair strong on one side only is weaker than it looks.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1+', alike: 'Remember where face-down pictures are.', differs: 'You flip cards yourself to find pairs; no one cuts your time short.' },
    { name: 'Memoarrr!', players: '2–6', alike: 'Remembering picture positions on a grid is the core.', differs: 'Cards are revealed one by one and must link to the last; a miss knocks you out of the round.' },
  ],
});

export const russianJanggi = sg2Game('russian-janggi', 'main', day(4), 3, ['russianJanggi', 'fourThree', 'flipOmok'], {
  meta: {
    title: '러시아 장기 규칙 — 소사이어티 게임2 세 번째 챌린지, 덮는 틱택토와 양동이 버티기',
    description: '소사이어티 게임2 세 번째 챌린지 러시아 장기의 규칙을 정리했어요. 3×3 판, 크기 3종 말 2개씩, 놓거나 옮기기, 큰 말로 덮기, 10초 제한, 이기면 상대 양동이에 물 5L, 3연속 출전 뒤 교체, 양동이 들고 버티기까지. PUZZLTHINK에서 바로 플레이.',
    keywords: ['러시아 장기', '러시아장기', '소사이어티 게임2 러시아 장기', '소사이어티게임2 세 번째 챌린지', '고블렛 고블러스', '덮는 틱택토'],
  },
  title: '러시아 장기 — 소사이어티 게임2 세 번째 챌린지',
  name: '러시아 장기',
  lead: '큰 말이 작은 말을 덮는 3×3 틱택토로 1:1 대결을 하고, 이길 때마다 상대 마을이 들고 있는 양동이에 물을 부어요. 양동이를 먼저 모두 내려놓는 마을이 져요.',
  summary: '덮을 수 있는 틱택토로 상대 양동이에 물을 채우는, 두뇌 대결과 버티기가 이어진 챌린지.',
  setup: [
    { type: 'list', items: [
      '**러시아 장기**: 마을마다 5명이 나서는 1:1 대결이에요. 3×3 판에, 크기가 다른 말 세 종류를 2개씩, 모두 6개 받아요.',
      '**양동이 들고 버티기**: 나머지 주민은 원형으로 놓인 큐브 위에 올라가, 양옆 주민과 함께 양동이를 들어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '한 수', body: '차례마다 10초 안에 손에 든 말 하나를 판에 놓거나, 판 위의 내 말 하나를 옮겨요. 10초를 넘기면 차례가 상대에게 넘어가요.' },
      { title: '덮기', body: '더 큰 말로 더 작은 말을 덮을 수 있어요. 덮인 말은 위의 말이 떠날 때까지 보이지 않아요.' },
      { title: '판의 승리', body: '내 말 3개를 가로·세로·대각선 한 줄로 먼저 이으면 그 판을 이겨요. 이긴 주민은 상대 마을의 양동이 하나를 골라 물 5L를 더 부어요(양동이 하나에 최대 35L).' },
      { title: '교체', body: '이긴 주민은 계속 두고, 진 주민은 다음 순서와 교체돼요. 이긴 주민도 세 판을 연속으로 두면 교체돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 마을의 버티기 주민이 **모두** 양동이를 포기하면 그 마을이 챌린지에서 져요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '양동이는 정해진 한 손으로만 들어야 해요. 균형을 잃고 물이 넘쳐도 양동이를 떨어뜨린 것으로 봐요.',
      '한 마을의 남은 양동이가 모두 가득 차면, 그 뒤로는 장기에서 져도 물을 더 붓지 않아요.',
      '나무위키 정리에 따르면 제작진이 이 게임을 보드게임 「고블렛 고블러스」에서 가져왔다고 밝혔어요. 말을 들어 올려 아래의 상대 줄이 드러나는 경우와 무승부의 처리는 공개된 방송 규칙에 따로 적혀 있지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '러시아 장기는 틱택토에 **덮기**와 **옮기기**를 더한 게임이에요. 덮인 말은 사라지지 않고 아래에 남아 있다는 점, 그리고 큰 말이 두 개뿐이라는 점이 모든 판단의 바탕이에요.' },
    { type: 'cards', items: [
      { title: '큰 말은 무적이지만 둘뿐', body: '큰 말은 무엇에도 덮이지 않아요. 가운데에 큰 말을 놓으면 그 칸은 영원히 내 것이 되고, 가운데를 지나는 네 줄을 모두 위협할 수 있어요. 대신 상대가 놓은 말을 덮는 데 큰 말을 써 버리면, 나중에 막을 수 없는 위협이 나왔을 때 대응할 말이 없어요.' },
      { title: '양수(두 줄 동시 위협)', body: '한 수로 두 줄을 동시에 위협하면 상대는 하나만 막을 수 있어요. 덮기가 있어서 "막았다"고 끝이 아니에요. 상대가 작은 말로 막았다면 내 중간·큰 말로 그 말을 덮어 다시 줄을 만들 수 있으니, 상대가 어떤 크기로 막을 수 있는지까지 세어야 해요.' },
      { title: '옮기기는 양날의 검', body: '판 위의 말을 옮기면 그 아래 말이 드러나요. 내 말이 드러나면 이득이지만, 상대 말이 드러나 상대 줄이 완성될 수도 있어요. 말을 들기 전에 그 아래에 무엇이 있었는지 기억해 두는 것이 필수예요.' },
      { title: '선공의 이점', body: '판이 작고 말이 정해져 있어, 이 계열의 게임은 컴퓨터 분석으로 **선공이 정확히 두면 이긴다**고 알려져 있어요. 다만 10초 안에 그 수순을 정확히 두는 것은 사람에게 쉽지 않아, 실전에서는 위협 수를 빨리 읽는 쪽이 이겨요.' },
    ], columns: 1 },
    { type: 'p', text: '챌린지 전체로 보면 이긴 주민이 최대 세 판을 이어서 두니, **강한 기사 한두 명이 연승하는 것**이 양동이를 빨리 채워요. 버티기 쪽은 물이 한 양동이에 몰리도록 상대가 고르기 때문에, 누가 가장 오래 버틸 수 있는지를 미리 정해 두는 것이 좋아요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 러시아장기는 3×3 판, 크기 3종 2개씩, 놓기와 옮기기, 더 작은 말(색 상관없음) 위에 덮기, 차례 10초와 시간 초과 시 차례 넘김이 방송과 같아요.',
      '양동이와 교체 릴레이는 없고, 장기 한 판만 둬요.',
      '방송 규칙에 없는 처리를 정해 두었어요. 말을 들어 올려 상대 줄이 드러나면 **상대가 이겨요**(같은 수로 내 줄도 생겨도 상대 승). 둘 곳이 없으면 차례가 넘어가고, 80수가 지나면 무승부예요.',
      '혼자 하면 AI(쉬움·보통·어려움·매우 어려움)와 두고, 선공과 10초 제한 여부를 고를 수 있어요. 친구와 방을 만들면 선공은 무작위예요.',
    ] },
  ],
  similar: [
    { name: '고블렛 고블러스 (Gobblet Gobblers)', players: '2명', alike: '3×3 판, 크기 세 가지 말 2개씩, 놓기·옮기기·덮기까지 규칙이 사실상 같아요.', differs: '어린이용으로 나온 보드게임이라 시간 제한이 없고, 드러난 줄의 처리 같은 세부 규칙이 규칙서에 정해져 있어요.' },
    { name: '고블렛 (Gobblet)', players: '2명 (4인 변형 있음)', alike: '큰 말이 작은 말을 덮고, 덮인 말이 아래에 남아요.', differs: '4×4 판에서 4개를 이어야 하고, 말을 겹친 더미에서 꺼내 써요.' },
    { name: '오트리오 (Otrio)', players: '2–4명', alike: '크기가 다른 세 종류의 말로 3×3 판에서 줄을 만들어요.', differs: '고리가 서로 덮지 않고 한 칸에 크기별로 함께 들어가며, 같은 크기·크기 순서로도 줄이 돼요.' },
  ],
}, {
  meta: {
    title: 'Russian Janggi rules — The Society Game 2, challenge 3: covering tic-tac-toe and the bucket hold',
    description: 'The rules of Russian Janggi (러시아 장기), the third challenge of The Society Game 2: a 3×3 board, two pieces in each of three sizes, place or move, bigger covers smaller, ten seconds a turn, 5 L of water into a rival bucket per win, and the bucket hold. Play it on PUZZLTHINK.',
    keywords: ['Russian Janggi', 'The Society Game 2', 'Gobblet Gobblers', 'covering tic-tac-toe', '러시아장기'],
  },
  title: 'Russian Janggi — The Society Game 2, challenge 3',
  name: 'Russian Janggi (러시아 장기)',
  lead: 'One-on-one games of tic-tac-toe where bigger pieces cover smaller ones; every win pours water into a bucket the rival village is holding. The village that lets every bucket go loses.',
  summary: 'Covering tic-tac-toe duels that fill the rivals’ buckets, joined to an endurance hold.',
  setup: [
    { type: 'list', items: [
      '**Russian Janggi**: five players per village play one-on-one on a 3×3 board, each with six pieces — two in each of three sizes.',
      '**Bucket hold**: everyone else stands on cubes set in a circle, holding buckets together with the players on either side.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'A move', body: 'Within ten seconds, place a piece from your hand or move one of yours on the board; run out of time and the turn passes.' },
      { title: 'Covering', body: 'A larger piece may cover a smaller one; the covered piece stays hidden until the top one leaves.' },
      { title: 'Winning a game', body: 'Three of yours in a row — across, down or diagonal — wins the game, and the winner pours 5 L into a rival bucket of their choice (35 L at most per bucket).' },
      { title: 'Rotation', body: 'Winners stay on and losers are replaced by the next in line; a winner is also replaced after three games in a row.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['A village loses when **all** its holders have given up their buckets.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Each bucket must be held with one set hand; spilling water through losing balance counts as dropping it.',
      'Once all of a village’s remaining buckets are full, losing a game adds no more water.',
      'The fan wiki notes the producers said the game came from the board game Gobblet Gobblers. The broadcast rules say nothing about lifting a piece to reveal an opposing line, or about draws.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Russian Janggi is tic-tac-toe plus **covering** and **moving**. A covered piece is not gone, and you have only two big pieces — every decision rests on those two facts.' },
    { type: 'cards', items: [
      { title: 'Big pieces are safe, but scarce', body: 'Nothing covers a big piece, so one in the centre owns that cell for good and threatens all four lines through it. Spend a big piece covering an enemy piece, though, and you may have nothing left for an unstoppable threat later.' },
      { title: 'Forks', body: 'Threaten two lines at once and only one can be blocked. Because of covering, a block is not the end: a small blocker can be covered by your medium or big piece, so count which sizes your opponent can still block with.' },
      { title: 'Moving cuts both ways', body: 'Lifting a piece reveals what is beneath — maybe yours, maybe an enemy piece that completes their line. Remember what lies under every stack before you lift.' },
      { title: 'The first move', body: 'With a tiny board and fixed pieces, games of this family are known from computer analysis to be **a first-player win with perfect play** — but finding that line in ten seconds is hard for people, and in practice the quicker reader of threats wins.' },
    ], columns: 1 },
    { type: 'p', text: 'Across the challenge, a winner plays up to three games in a row, so **one or two strong players on a streak** fill buckets fast. The rivals choose which bucket gets water, so decide in advance who can hold the longest.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      "PUZZLTHINK's Russian Janggi matches the 3×3 board, two pieces of each size, placing and moving, covering any smaller piece of either colour, and ten seconds per turn with the turn passing on timeout.",
      'There are no buckets or relay; you play the board game alone.',
      'The site settles what the broadcast rules leave open: lifting a piece that reveals an opposing line **hands the win to the opponent** (even if your move also makes your own line); with no legal move the turn passes; after 80 moves it is a draw.',
      'Solo you play an AI (easy, normal, hard, very hard) and can choose who starts and whether the ten-second limit applies; in rooms with a friend the first player is random.',
    ] },
  ],
  similar: [
    { name: 'Gobblet Gobblers', players: '2', alike: '3×3 board, two pieces in three sizes, placing, moving and covering — practically the same rules.', differs: 'A children’s board game with no time limit; its rulebook settles details such as revealed lines.' },
    { name: 'Gobblet', players: '2 (4-player variant)', alike: 'Bigger pieces cover smaller ones, which stay underneath.', differs: 'A 4×4 board needing four in a row, with pieces drawn from nested stacks.' },
    { name: 'Otrio', players: '2–4', alike: 'Pieces in three sizes make lines on a 3×3 board.', differs: 'Rings nest together in one cell instead of covering, and lines can also be same-size or ordered by size.' },
  ],
}, { id: 'russianJanggi', name: { ko: '러시아장기', en: 'Russian Janggi' }, file: 'src/lib/russianJanggi.ts' });

export const swingBridge = sg2Game('swing-bridge', 'main', day(5), 4, ['hexagon', 'gyulhap', 'gradation'], {
  meta: {
    title: '흔들다리 규칙 — 소사이어티 게임2 네 번째 챌린지, 줄어드는 다리와 회전 삼각형 암기',
    description: '소사이어티 게임2 네 번째 챌린지 흔들다리의 규칙을 정리했어요. 널빤지 20개 흔들다리를 90초 안에 한 명씩 건너기, 떨어지면 제외, 12칸 정삼각형 숫자 10초 암기 뒤 회전, 0–5 주사위로 답하기, 라운드마다 널빤지 4개 제거, 6라운드 승점제까지.',
    keywords: ['흔들다리', '소사이어티 게임2 흔들다리', '소사이어티게임2 네 번째 챌린지', '회전 삼각형', '소사이어티 게임2 게임'],
  },
  title: '흔들다리 — 소사이어티 게임2 네 번째 챌린지',
  name: '흔들다리',
  lead: '마을 전원이 90초 안에 흔들다리를 건너야 하고, 건넌 사람 가운데 한 명이 돌아가는 삼각형의 숫자를 맞혀요. 다리는 라운드마다 짧아지고, 문제를 푼 사람은 빠져요.',
  summary: '줄어드는 흔들다리 건너기와 회전하는 삼각형 숫자 암기를 6라운드 반복하는 승점 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 두 마을 주민 전원.',
      '**흔들다리**: 처음에는 널빤지 20개. 한 번에 한 명씩 건너요.',
      '**회전 삼각형**: 12칸으로 나뉜 정삼각형. 칸마다 숫자가 적혀 있어요.',
      '**답 주사위**: 0–5가 적힌 주사위로 답을 보여 줘요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '다리 건너기', body: '마을 전원이 90초 안에 한 명씩 흔들다리를 건너 반대편으로 가야 해요. 시간 안에 못 건너거나 다리에서 떨어진 주민은 그 자리에서 게임에서 빠져요.' },
      { title: '삼각형 암기', body: '건넌 뒤 마을마다 한 명이 나와요. 삼각형 12칸의 숫자가 10초 동안 보이다가 모두 지워지고, 삼각형이 회전해요.' },
      { title: '답하기', body: '지목된 칸에 있던 숫자를 주사위로 보여 줘요. 맞히면 승점 1점이에요.' },
      { title: '라운드 끝', body: '문제를 푼 주민은 맞히든 틀리든 게임에서 빠져요. 라운드가 끝날 때마다 다리의 널빤지가 4개씩 줄고, 삼각형 문제는 쉬워져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['6라운드가 끝났을 때 **승점이 더 높은** 마을이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '다리에서 빠진 주민도, 문제를 푼 주민도 그 뒤 라운드에 나설 수 없어요. 그래서 라운드가 지날수록 문제를 풀 수 있는 사람이 줄어요.',
      '정답은 0–5 사이의 숫자예요.',
      '승점이 같을 때의 처리는 공개된 규칙 설명에 나오지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '흔들다리는 **두 가지 줄어드는 자원**을 관리하는 게임이에요. 다리는 짧아지고, 문제를 풀 수 있는 사람도 한 명씩 줄어요. 언제 누구를 문제에 내보낼지가 핵심이에요.' },
    { type: 'cards', items: [
      { title: '암기력은 뒤로 갈수록 덜 중요해진다', body: '삼각형 문제는 라운드마다 쉬워지고, 다리는 갈수록 건너기 어려워져요. 그러니 암기에 강한 주민은 **어려운 초반 문제**에 쓰고, 균형이 좋은 주민은 후반의 짧은 다리를 건너도록 남겨 두는 게 계산상 맞아요. 다만 초반에 다리에서 떨어지면 아무것도 못 하고 빠지니, 암기 담당은 일찍 쓰는 편이 안전해요.' },
      { title: '회전을 따라가는 법', body: '삼각형은 돌아도 꼭짓점 세 개는 그대로 꼭짓점이에요. 숫자를 "어느 꼭짓점에서 몇 번째"로 외워 두면, 삼각형이 돌아도 기준 꼭짓점 하나만 따라가면 돼요. 칸 위치가 아니라 **꼭짓점 기준 상대 위치**로 외우는 것이 회전에 강해요.' },
      { title: '답의 범위가 작다', body: '답이 0–5 사이라 모르면 찍어도 맞힐 확률이 있어요. 기억이 흐릿하다면, 위치는 몰라도 숫자 몇 개의 분포만 기억해 두는 것도 도움이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없지만, 몸과 머리가 서로 다른 라운드에서 빛나도록 **출전 순서를 설계**하는 마을이 유리해요.' },
  ],
  similar: [
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '잠깐 본 칸의 내용을 기억해 답해요.', differs: '판이 돌지 않고, 직접 뒤집으며 짝을 맞춰요.' },
    { name: '사이먼 (Simon)', players: '1명 이상', alike: '짧게 보여 준 신호를 기억해 그대로 재현해요.', differs: '빛과 소리의 순서를 외우는 전자 게임이라 공간 회전이 없어요.' },
  ],
}, {
  meta: {
    title: 'Swing Bridge rules — The Society Game 2, challenge 4: a shrinking bridge and a rotating triangle',
    description: 'The rules of Swing Bridge (흔들다리), the fourth challenge of The Society Game 2: everyone crosses a 20-plank rope bridge one at a time in 90 seconds, falling knocks you out, a twelve-cell triangle shown for ten seconds then rotated, answers on a 0–5 die, four planks removed each round, six rounds on points.',
    keywords: ['Swing Bridge', 'The Society Game 2', 'rotating triangle memory', '소사이어티 게임2 흔들다리'],
  },
  title: 'Swing Bridge — The Society Game 2, challenge 4',
  name: 'Swing Bridge (흔들다리)',
  lead: 'The whole village must cross a swaying bridge in 90 seconds; then one of them recalls numbers from a triangle that has rotated. The bridge shortens every round and whoever answers drops out.',
  summary: 'Six rounds of crossing a shrinking rope bridge and recalling numbers from a rotated triangle, on points.',
  setup: [
    { type: 'list', items: [
      '**Players**: everyone in both villages.',
      '**Bridge**: twenty planks to start; one person on it at a time.',
      '**Rotating triangle**: an equilateral triangle split into twelve cells, each with a number.',
      '**Answer die**: a die marked 0–5 shows the answer.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Cross', body: 'The whole village crosses one by one within 90 seconds; anyone who does not make it, or falls, is out of the game at once.' },
      { title: 'Memorise', body: 'Each village then sends one player. The twelve numbers show for ten seconds, vanish, and the triangle rotates.' },
      { title: 'Answer', body: 'Show the number that was in the indicated cell using the die; a correct answer is 1 point.' },
      { title: 'End of round', body: 'The answerer is out whether right or wrong. Each round four planks are removed and the triangle question gets easier.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['After six rounds the village with **more points** wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Players who fell and players who answered cannot take part later, so fewer people remain to answer each round.',
      'Answers are always 0–5.',
      'The published rules do not say how a tie on points is settled.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Swing Bridge manages **two shrinking resources**: the bridge gets shorter and the pool of possible answerers loses one per round. When to send whom is the game.' },
    { type: 'cards', items: [
      { title: 'Memory matters less over time', body: 'The questions get easier while the bridge gets harder, so in theory your best memorisers take the hard early questions and your best balancers stay for the short late bridge. A memoriser who falls early never gets to answer, which also argues for using them soon.' },
      { title: 'Following the rotation', body: 'However the triangle turns, its three corners stay corners. Memorise each number as "so many from this corner" and you only need to track one reference corner as it turns — **relative to a corner**, not by screen position.' },
      { title: 'A small answer range', body: 'Answers are 0–5, so a guess has a real chance. If positions blur, remembering which numbers appeared at all still helps.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy, but villages that **plan the order** so bodies and brains shine in different rounds have the edge.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1+', alike: 'Recall what was in a cell you saw briefly.', differs: 'Nothing rotates and you flip cards yourself.' },
    { name: 'Simon', players: '1+', alike: 'Recall a signal shown briefly and reproduce it.', differs: 'An electronic sequence of lights and sounds, with no spatial rotation.' },
  ],
});

export const triangleTug = sg2Game('triangle-tug-of-war', 'main', day(6), 5, ['binairo', 'equationSignal', 'gyulhap'], {
  meta: {
    title: '삼각 줄다리기 규칙 — 소사이어티 게임2 다섯 번째 챌린지, 끌려가며 푸는 이진법 문제',
    description: '소사이어티 게임2 다섯 번째 챌린지 삼각 줄다리기의 규칙을 정리했어요. 공격수 2명과 상대 수비수 1명이 줄로 이어진 90초, 문제 주사위 6개, 숫자를 이진법으로 바꿨을 때 1의 개수, 주사위를 제자리에 두어야 정답, 3라운드 승점제와 빠른 계산법까지.',
    keywords: ['삼각 줄다리기', '소사이어티 게임2 삼각 줄다리기', '소사이어티게임2 다섯 번째 챌린지', '이진법 1의 개수', '소사이어티 게임2 게임'],
  },
  title: '삼각 줄다리기 — 소사이어티 게임2 다섯 번째 챌린지',
  name: '삼각 줄다리기',
  lead: '공격수 두 명은 상대 수비수에게 끌려가지 않으려 버티며 문제 주사위까지 가서, 숫자를 이진법으로 바꿨을 때 1이 몇 개인지 맞혀요.',
  summary: '상대 수비수와 줄로 묶인 채 주사위 문제(이진법의 1 개수)를 푸는 힘·계산 혼합 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 마을마다 3개 조. 한 조는 공격수 2명 + 수비수 1명이에요.',
      '**줄**: 내 공격수 2명은 **상대 마을의 수비수** 1명과 줄로 이어져 있어요.',
      '**문제 주사위**: 6개. 윗면에는 물음표, 다른 면에는 1–5가 적혀 있고, 물음표 종이를 떼면 문제 숫자가 나와요.',
      '**시간**: 한 라운드 90초. 두 마을이 동시에 해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '당기기', body: '공격수 2명은 줄을 당겨 문제 주사위가 있는 곳까지 가고, 상대 수비수는 반대쪽으로 당겨 막아요.' },
      { title: '문제 풀기', body: '주사위의 물음표 종이를 떼고, 나온 숫자를 이진법으로 바꿨을 때 **1이 몇 개인지** 계산해요.' },
      { title: '답 놓기', body: '정답이라고 생각하는 숫자의 면이 위로 오도록 주사위를 놓아요.' },
      { title: '3라운드', body: '조를 바꿔 모두 3라운드를 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '정답 하나에 승점 1점. 3라운드 합계 **승점이 높은** 마을이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '주사위는 **원래 있던 자리**에 놓여 있어야 정답으로 쳐요. 들고 가거나 자리를 옮기면 안 돼요.',
      '답은 1–5 중 하나예요. 문제 숫자는 이진법으로 썼을 때 1이 다섯 개 이하인 수로 나와요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '삼각 줄다리기는 **힘이 계산 시간을 산다**는 구조예요. 공격수가 빨리 주사위에 닿을수록 계산할 시간이 늘고, 수비수가 잘 버틸수록 상대의 계산 시간이 줄어요.' },
    { type: 'cards', items: [
      { title: '이진법 1의 개수, 빠르게 세는 법', body: '가장 쉬운 방법은 **가장 큰 2의 거듭제곱부터 빼기**예요. 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192… 를 외워 두고, 문제 숫자에서 뺄 수 있는 가장 큰 수를 계속 빼요. 0이 될 때까지 뺀 횟수가 답이에요. 예를 들어 100이면 100−64=36, 36−32=4, 4−4=0이라 답은 3이에요.' },
      { title: '반으로 나누기', body: '다른 방법은 짝수면 2로 나누고, 홀수면 1을 빼고(그 횟수를 세고) 다시 2로 나누는 것이에요. 뺀 1의 횟수가 답이에요. 큰 수에서는 빼기 방식이, 외운 거듭제곱이 적을 때는 나누기 방식이 편해요.' },
      { title: '역할 나누기', body: '두 공격수가 모두 계산하는 것보다, 힘이 센 사람은 줄을 버티고 계산이 빠른 사람은 주사위에 집중하는 편이 효율적이에요. 수비수 자리에는 계산을 못 해도 되니, 마을에서 가장 힘센 주민을 써요.' },
      { title: '틀릴 바에는 놓기', body: '오답에 감점이 없으니, 시간이 모자라면 어림한 답이라도 주사위를 돌려 놓는 게 이득이에요. 다만 자리를 옮기면 무효라 놓는 위치를 꼭 지켜야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 조 편성에서 상대의 강한 수비수를 피할 수는 없으니, 결국 **수비수의 힘과 공격수의 계산 속도**가 함께 높은 마을이 이겨요.' },
  ],
  similar: [
    { name: '님 (Nim)', players: '2명', alike: '이길 수를 찾으려면 각 더미를 이진법으로 보고 계산해야 해요.', differs: '님은 몸을 쓰지 않는 순수한 수학 게임이고, 1의 개수가 아니라 자리별 짝·홀(XOR)을 봐요.' },
    { name: '튜링 텀블 (Turing Tumble)', players: '1명', alike: '구슬이 지나가며 비트를 뒤집어, 이진법 계산을 손으로 체험해요.', differs: '혼자 푸는 퍼즐이고, 시간 압박이나 상대가 없어요.' },
  ],
}, {
  meta: {
    title: 'Triangle Tug of War rules — The Society Game 2, challenge 5: binary sums while being pulled back',
    description: 'The rules of Triangle Tug of War (삼각 줄다리기), the fifth challenge of The Society Game 2: two attackers roped to a rival defender for 90 seconds, six question dice, the number of 1s in a number written in binary, dice left in place, three rounds on points, and quick ways to count.',
    keywords: ['Triangle Tug of War', 'The Society Game 2', 'binary ones count', '소사이어티 게임2 삼각 줄다리기'],
  },
  title: 'Triangle Tug of War — The Society Game 2, challenge 5',
  name: 'Triangle Tug of War (삼각 줄다리기)',
  lead: 'Two attackers drag themselves to the question dice against a rival defender pulling the other way, then work out how many 1s a number has in binary.',
  summary: 'Roped to a rival defender, attackers solve dice questions on the number of 1s in binary.',
  setup: [
    { type: 'list', items: [
      '**Players**: three groups per village, each two attackers and one defender.',
      '**Rope**: your two attackers are tied to **a defender from the other village**.',
      '**Question dice**: six; the top shows a question mark, the other faces 1–5, and peeling the sticker reveals the number.',
      '**Time**: 90 seconds per round, both villages at once.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Pull', body: 'The attackers haul themselves to the dice while the rival defender pulls the other way.' },
      { title: 'Solve', body: 'Peel a die’s sticker and work out **how many 1s** the number has when written in binary.' },
      { title: 'Set the die', body: 'Turn the die so the face with your answer is on top.' },
      { title: 'Three rounds', body: 'Groups rotate over three rounds.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['Each correct die is 1 point; the village with **more points** after three rounds wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A die counts only if it stays **where it was**; carrying or moving it voids the answer.',
      'Answers are 1–5, so the numbers have at most five 1s in binary.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Here **strength buys thinking time**: the faster the attackers reach the dice, the longer they have to calculate, and a strong defender steals time from the rivals.' },
    { type: 'cards', items: [
      { title: 'Counting binary 1s fast', body: 'Subtract **the largest power of two** that fits, again and again: know 1, 2, 4, 8, … 8192 by heart and count the subtractions until zero. For 100: 100−64=36, 36−32=4, 4−4=0 — the answer is 3.' },
      { title: 'Halving', body: 'Or halve even numbers and, for odd ones, subtract 1 (counting it) before halving; the count of subtracted 1s is the answer. Subtraction suits big numbers, halving suits players who know fewer powers.' },
      { title: 'Split the roles', body: 'Rather than both attackers calculating, let the stronger one anchor the rope while the faster calculator works the dice. Defenders need no maths, so put your strongest villager there.' },
      { title: 'Always set an answer', body: 'Wrong answers cost nothing, so set a best guess before time runs out — just never move the die from its spot.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy: you cannot dodge a strong rival defender, so villages strong in **both defender strength and attacker arithmetic** win.' },
  ],
  similar: [
    { name: 'Nim', players: '2', alike: 'Winning play means reading each heap in binary.', differs: 'Pure mathematics with no physical side, and it uses bitwise parity (XOR), not a count of 1s.' },
    { name: 'Turing Tumble', players: '1', alike: 'Marbles flip bits, letting you work binary arithmetic by hand.', differs: 'A solo puzzle with no clock and no opponent.' },
  ],
});

export const cubeCode = sg2Game('cube-code', 'main', day(7), 6, ['nonogram', 'hiddenWord', 'gradation'], {
  meta: {
    title: '큐브 코드 규칙 — 소사이어티 게임2 여섯 번째 챌린지, 네 큐브의 무늬를 겹쳐 글자 읽기',
    description: '소사이어티 게임2 여섯 번째 챌린지 큐브 코드의 규칙을 정리했어요. 대형 큐브 4개를 규칙대로 거치대에 올리는 신체 영역, 보이는 코드 4개를 합쳐 한글 글자를 읽는 두뇌 대표 4명, 오답 시 30초 금지, 점점 쉬워지는 문제와 두뇌 대표 전원 통과까지.',
    keywords: ['큐브 코드', '소사이어티 게임2 큐브 코드', '소사이어티게임2 여섯 번째 챌린지', '코드 조합', '소사이어티 게임2 게임'],
  },
  title: '큐브 코드 — 소사이어티 게임2 여섯 번째 챌린지',
  name: '큐브 코드',
  lead: '신체 대표들이 커다란 큐브 네 개를 지시대로 쌓으면, 두뇌 대표들은 큐브에 보이는 네 개의 무늬를 머릿속에서 겹쳐 하나의 글자로 읽어요.',
  summary: '큐브를 규칙대로 배치하고, 보이는 무늬 네 개를 합친 글자를 맞히는 협동 레이스.',
  setup: [
    { type: 'list', items: [
      '**두뇌 영역**: 마을마다 대표 4명이 "코드 조합"을 맡아요.',
      '**신체 영역**: 나머지 주민이 "큐브 배치"를 맡아요.',
      '**큐브**: 마을마다 빨강·파랑·노랑·초록 대형 큐브 4개와 거치대. 큐브 각 면에는 1–6의 숫자와 서로 다른 무늬(코드)가 그려져 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '큐브 배치', body: '신체 대표들이 화면에 나온 규칙에 맞게 큐브 4개를 거치대에 올려요.' },
      { title: '코드 조합', body: '두뇌 대표들은 큐브에 보이는 코드 4개를 하나로 합쳤을 때 나타나는 글자를 읽어요.' },
      { title: '정답 외치기', body: '답을 안 주민은 "정답"을 외치고 깃발을 든 뒤 말해요. 맞히면 정답자 대기석으로 가서 게임에서 빠져요.' },
      { title: '다음 문제', body: '누군가 맞히면 그 마을에 새 배치 규칙이 나오고, 문제는 점점 쉬워져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['**두뇌 대표 4명이 모두** 먼저 정답을 맞힌 마을이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '오답이 나오면 그 마을 두뇌 대표 전원이 **30초 동안** 정답을 외칠 수 없어요.',
      '한 문제에 한 명씩만 통과해요. 이미 맞힌 주민은 다음 문제에 참여하지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '큐브 코드의 핵심은 **겹쳐 보기**예요. 네 무늬는 각각으로는 의미가 없고, 겹쳐야 글자의 획이 완성돼요. 그리고 가장 느린 두뇌 대표가 승부를 정해요.' },
    { type: 'cards', items: [
      { title: '마지막 한 명의 게임', body: '네 명이 모두 맞혀야 끝나고, 문제는 점점 쉬워져요. 그러니 가장 잘 읽는 주민이 어려운 첫 문제를 빨리 통과하고, 약한 주민은 쉬운 마지막 문제를 맡는 흐름이 자연스러워요. 약한 주민이 쉬운 문제를 맞힐 수 있느냐가 실제 승부처예요.' },
      { title: '30초 벌칙의 계산', body: '오답이면 30초 동안 막히지만, 큐브 하나를 옮기는 데도 시간이 꽤 걸려요. 배치가 끝나기 전이라면 일부만 보고 짐작한 글자를 외쳐 보는 것이 손해가 적어요. 반대로 배치가 끝난 뒤의 오답은 그대로 30초를 잃어요.' },
      { title: '읽는 요령', body: '한글은 초성·중성·종성 자리가 정해져 있어, 겹친 무늬에서 먼저 모음(세로·가로 긴 획)을 찾으면 글자의 틀이 잡혀요. 점 하나 차이로 다른 글자가 되는 자모(ㅂ/ㅃ, ㅏ/ㅑ)는 마지막에 확인해요.' },
      { title: '신체 영역의 정확도', body: '배치 규칙을 틀리게 따르면 엉뚱한 무늬가 보여 두뇌 대표들이 아무리 잘 읽어도 답이 안 나와요. 빠르게보다 **정확하게** 놓는 것이 먼저예요.' },
    ], columns: 1 },
    { type: 'p', text: '우월 전략은 없어요. 다만 통과 순서를 미리 정해 두고, 배치가 끝나기 전의 짐작 정답을 적극적으로 쓰는 마을이 시간을 아껴요.' },
  ],
  similar: [
    { name: '큐비츠 (Q-bitz)', players: '2–4명', alike: '무늬가 다른 면을 가진 큐브를 돌리고 배치해 그림을 맞춰요.', differs: '각자 자기 큐브로 그림을 재현하는 속도 경쟁이고, 겹쳐 읽는 글자가 없어요.' },
    { name: '우봉고 (Ubongo)', players: '1–4명', alike: '조각을 머릿속에서 돌리고 맞춰 모양을 완성하는 공간 지각 레이스예요.', differs: '평면 조각으로 판을 채우는 퍼즐이고, 팀 협동이 없어요.' },
  ],
}, {
  meta: {
    title: 'Cube Code rules — The Society Game 2, challenge 6: overlay four cube patterns to read a letter',
    description: 'The rules of Cube Code (큐브 코드), the sixth challenge of The Society Game 2: the strength side sets four giant cubes by on-screen rules, four brain players overlay the four visible patterns to read a Korean syllable, a 30-second lockout for wrong answers, easier puzzles each time, until all four brains are through.',
    keywords: ['Cube Code', 'The Society Game 2', 'pattern overlay puzzle', '소사이어티 게임2 큐브 코드'],
  },
  title: 'Cube Code — The Society Game 2, challenge 6',
  name: 'Cube Code (큐브 코드)',
  lead: 'The strength side stacks four giant cubes as instructed; the brain side overlays, in their heads, the four patterns facing them and reads the Korean syllable they make.',
  summary: 'A team race: set the cubes by the rules, then read the letter made by overlaying their four patterns.',
  setup: [
    { type: 'list', items: [
      '**Brain side**: four players per village do the "code combination".',
      '**Strength side**: everyone else does the "cube placement".',
      '**Cubes**: four giant cubes (red, blue, yellow, green) and a stand per village; each face has a number 1–6 and a different pattern (code).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Place', body: 'The strength side sets the four cubes on the stand following the on-screen rule.' },
      { title: 'Combine', body: 'The brain side reads the syllable formed when the four visible codes are combined into one.' },
      { title: 'Answer', body: 'Shout "answer", raise the flag and say it; if right, go to the finished bench — that player is done.' },
      { title: 'Next puzzle', body: 'After a correct answer that village gets a new placement rule, and puzzles get easier.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['The first village whose **four brain players have all** answered correctly wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A wrong answer locks the whole brain side of that village out of answering for **30 seconds**.',
      'One player clears per puzzle; those already through do not join later puzzles.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The key is **overlaying**: each pattern means nothing alone, and only together do the strokes form a letter. And the slowest brain player decides the result.' },
    { type: 'cards', items: [
      { title: 'A game about the last player', body: 'All four must clear and puzzles get easier, so the natural flow is your best reader clearing the hard first one fast and the weakest taking the easy last one. Whether that player can read the easy one is the real decider.' },
      { title: 'Pricing the 30 seconds', body: 'A wrong answer costs 30 seconds, but moving a cube takes a while too. Before the placement is finished, shouting a guess from the cubes already set costs little; after it is finished, a miss loses the full 30 seconds.' },
      { title: 'Reading tips', body: 'Korean syllables have fixed slots for initial, vowel and final; find the vowel (the long vertical or horizontal stroke) first to frame the letter, and check one-stroke differences (ㅂ/ㅃ, ㅏ/ㅑ) last.' },
      { title: 'Placement accuracy', body: 'A misplaced cube shows the wrong pattern and no amount of reading will help, so **accurate** beats fast for the strength side.' },
    ], columns: 1 },
    { type: 'p', text: 'No dominant strategy, but villages that fix the clearing order in advance and use early guesses while cubes are still moving save time.' },
  ],
  similar: [
    { name: 'Q-bitz', players: '2–4', alike: 'Turn and arrange patterned cubes to match a picture.', differs: 'Each player recreates a picture with their own cubes; nothing is overlaid into a letter.' },
    { name: 'Ubongo', players: '1–4', alike: 'A spatial race of turning and fitting pieces in your head.', differs: 'Flat pieces fill a board; no teamwork.' },
  ],
});
