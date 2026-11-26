// 소사이어티 게임 (season 1), challenges of days 2–7: 인간장기, 고난의 원탁, 4인 5각, 바닥빼기, 숫자 클라이밍, 파울볼.
import { day, sg1Game } from './shared';

export const humanJanggi = sg1Game('human-janggi', 'main', day(2), 1, ['janggi', 'cardJanggi', 'russianJanggi'], {
  meta: {
    title: '인간장기 규칙 — 소사이어티 게임 시즌1 첫 챌린지, 숫자 말이 맞닿으면 벌어지는 대결',
    description: '소사이어티 게임 시즌1 2일차 첫 챌린지 인간장기의 규칙을 정리했어요. 1–11 숫자 말과 숨긴 왕, 층이 나뉜 6×8 판, 전진만 되는 이동, 두 숫자의 합으로 정해지는 두뇌·감각·신체 대결, 왕을 잡거나 적진에 들어가면 승리까지.',
    keywords: ['인간장기', '소사이어티 게임 인간장기', '소사이어티게임 시즌1', '소사이어티 게임 1화', '소사이어티 게임 챌린지'],
  },
  title: '인간장기 — 소사이어티 게임 시즌1 2일차 챌린지',
  name: '인간장기',
  lead: '주민이 직접 숫자 말이 되어 판 위에 서요. 두 말이 맞닿으면 두 숫자의 합에 따라 두뇌·감각·신체 중 한 종목으로 대결하고, 진 말은 판에서 빠져요.',
  summary: '숫자 말이 된 주민들이 맞닿을 때마다 숫자 합으로 정해진 종목으로 겨루고, 숨긴 왕을 먼저 잡는 장기형 챌린지.',
  setup: [
    { type: 'list', items: [
      '**인원**: 두 마을(높동·마동)의 주민 전원. 마을마다 말을 움직이는 **대표** 한 명을 정하고, 나머지 주민은 1부터 11까지의 숫자 중 하나씩을 받아 말이 돼요.',
      '**왕**: 각 마을은 자기 말 가운데 한 숫자를 **왕**으로 정해요. 상대 마을은 어느 숫자가 왕인지 몰라요.',
      '**판**: 가로 8칸, 세로 6칸. 판 가운데 4×4 구역의 바깥 테두리는 2층, 그 안의 2×2는 3층으로 높아져 있고 나머지는 1층이에요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '말 이동', body: '두 마을의 대표가 번갈아 말을 옮겨요. 뒤로는 갈 수 없어요. 같은 층 안에서 앞으로 갈 때는 최대 2칸, 층을 올라가거나 대각선으로 갈 때는 1칸만 움직일 수 있어요.' },
      { title: '맞닿으면 대결', body: '두 말이 맞닿으면 두 주민이 대결해요. 한 번에 여러 말이 맞닿으면, 말을 움직여 맞닿게 만든 쪽이 먼저 붙을 상대를 골라요. 대결은 **같은 층에 있는 말끼리만** 벌어져요.' },
      { title: '종목 결정', body: '두 말의 숫자를 더해 종목을 정해요. 합이 **10 이하면 두뇌**, **11–13이면 감각(링토스)**, **14 이상이면 신체(석상 떨어뜨리기)** 대결이에요.' },
      { title: '제거', body: '대결에서 진 말은 곧바로 판에서 빠져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**상대 마을의 왕을 찾아 먼저 제거**하거나, **자기 마을의 왕이 상대 진영에 도착**하면 이겨요.',
      '이긴 마을은 챌린지 상금 1,000만 원과 보상을 얻고, 리더가 상금을 나누고 블랙리스트를 쓸 수 있어요. 진 마을은 그날 저녁 주민 한 명을 탈락시켜야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '석상 떨어뜨리기는 상대 등 뒤에 세워진 상대의 석상을 먼저 떨어뜨리는 몸싸움이고, 링토스는 고리를 던져 기둥에 거는 종목이에요.',
      '두뇌 대결이 어떤 문제였는지, 말의 처음 배치와 "진영"의 정확한 범위는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '인간장기의 진짜 승부는 판 위가 아니라 **누구에게 어떤 숫자를 주느냐**에서 시작돼요. 종목이 두 숫자의 합으로 정해지기 때문에, 숫자가 곧 그 주민이 치를 수 있는 종목의 범위예요.' },
    { type: 'cards', items: [
      { title: '숫자가 종목을 제한해요', body: '상대 숫자는 1–11이니, 1번 말이 만들 수 있는 합은 2–12라 신체 대결을 절대 하지 않아요. 2번도 최대 13이라 마찬가지예요. 반대로 10번과 11번은 합이 최소 11이라 두뇌 대결을 하지 않아요. 그래서 몸이 약한 주민에게 작은 숫자, 힘이 센 주민에게 큰 숫자를 주면 각자 자기 종목만 치르게 만들 수 있어요. 가운데 숫자(5–7)는 상대에 따라 세 종목이 모두 나올 수 있어 가장 다루기 어려워요.' },
      { title: '상대 숫자를 모르는 맞대결', body: '내 말의 숫자는 알아도 상대 말의 숫자는 붙어 보기 전까지 몰라요. 대결이 끝날 때마다 드러난 숫자로 남은 숫자를 좁혀 가는 추리가 생기고, 왕이 어느 숫자인지도 남은 말이 줄수록 드러나요. 왕 후보를 숨기려면 왕이 아닌 말도 왕처럼 움직이는 연기가 필요해요.' },
      { title: '층은 벽이에요', body: '대결은 같은 층끼리만 되니, 다른 층에 있는 말은 바로 옆에 있어도 안전해요. 높은 층으로 오르면 그 순간 1층 말들과는 싸울 수 없게 되지만, 올라가는 데 한 칸씩밖에 못 움직이니 시간이 걸려요. 층을 방패로 쓰는 것과 왕을 적진으로 보내는 속도 사이의 저울질이 생겨요.' },
    ], columns: 1 },
    { type: 'p', text: '숫자 배정이 숨겨진 정보라 상대가 어떻게 짰는지에 따라 최선이 달라지고, 대결 결과도 사람의 실력에 달려 있어 **우월 전략은 없어요.** 다만 "작은 숫자는 두뇌형, 큰 숫자는 신체형"이라는 배정은 손해를 줄이는 기본값에 가까워요.' },
  ],
  similar: [
    { name: '스트라테고 (Stratego)', players: '2명', alike: '상대 말의 계급을 모른 채 움직이다가, 맞붙는 순간 정체가 드러나고 진 말이 빠져요. 깃발(왕 격)을 찾아 잡으면 이겨요.', differs: '스트라테고는 계급 비교로 승부가 바로 나고, 사람이 직접 겨루는 대결이 없어요.' },
    { name: '장기', players: '2명', alike: '왕(궁)을 잡으면 이기는 판 위의 전쟁이에요.', differs: '장기는 말의 정체가 공개되고 말마다 움직임이 다르며, 잡는 쪽이 늘 이겨요.' },
    { name: '라타크 (L’Attaque)', players: '2명', alike: '스트라테고의 원형으로, 계급을 숨긴 말이 맞붙어야 결과가 드러나요.', differs: '정해진 계급표로 승패가 정해지고, 판에 층이 없어요.' },
  ],
}, {
  meta: {
    title: 'Human Janggi rules — The Society Game season 1, first challenge',
    description: 'The rules of Human Janggi (인간장기), the day 2 challenge of The Society Game season 1: residents as numbered pieces 1–11 with a hidden king, a 6×8 board with raised levels, forward-only moves, duels in brain, sense or body chosen by the sum of two numbers, and winning by taking the king or reaching the enemy camp.',
    keywords: ['Human Janggi', 'The Society Game', 'Society Game season 1', '소사이어티 게임 인간장기'],
  },
  title: 'Human Janggi — The Society Game season 1, day 2 challenge',
  name: 'Human Janggi (인간장기)',
  lead: 'Residents become numbered pieces on a giant board. When two pieces touch, their players duel in brain, sense or body depending on the sum of their numbers; the loser leaves the board.',
  summary: 'Residents as numbered pieces duel whenever they touch, the event set by the sum of their numbers; the first village to take the hidden king wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: both villages (Nopdong and Madong). Each picks a **representative** who moves the pieces; every other resident takes one number from 1 to 11 and becomes a piece.',
      '**King**: each village secretly makes one of its numbers the **king**.',
      '**Board**: 8 columns by 6 rows. The rim of the central 4×4 area is raised to level 2 and its inner 2×2 to level 3; the rest is level 1.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Moving', body: 'The representatives take turns moving pieces. No moving backwards; up to 2 squares forward on the same level, but only 1 square when climbing a level or moving diagonally.' },
      { title: 'Contact means a duel', body: 'When two pieces touch, their players duel. If several touch at once, the side that made the move picks the opponent first. Duels happen **only between pieces on the same level**.' },
      { title: 'The event', body: 'Add the two numbers: **10 or less is a brain duel**, **11–13 a sense duel (ring toss)**, **14 or more a body duel (knocking down the statue)**.' },
      { title: 'Removal', body: 'The loser’s piece leaves the board at once.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Win by **finding and removing the opposing king first**, or by **getting your own king into the enemy camp**.',
      'The winning village earns the ₩10 million challenge prize and rewards; its leader splits the money and may write the blacklist. The losing village must eliminate one resident that evening.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The statue event is a scramble to knock down the statue standing behind your opponent; ring toss means throwing rings onto a post.',
      'What the brain duels were, the starting layout and the exact extent of the "camp" are not in the written rules, so they are left out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The real contest starts **before a piece moves, in who gets which number**. Because the event is set by the sum, a number fixes which events its player can ever face.' },
    { type: 'cards', items: [
      { title: 'Numbers limit events', body: 'Opposing numbers run 1–11, so piece 1 can only make sums of 2–12 and never faces a body duel; piece 2 tops out at 13 and is safe too. Pieces 10 and 11 always sum to at least 11 and never face a brain duel. Small numbers for the thinkers and large numbers for the strong let each player fight only their own event; the middle numbers (5–7) can meet all three and are the hardest to place.' },
      { title: 'Duels against unknown numbers', body: 'You know your own numbers but not the opponent’s until contact. Each duel reveals a number and narrows what is left, and the king’s identity leaks as pieces fall. Hiding the king means moving decoys as if they mattered.' },
      { title: 'Levels are walls', body: 'Since duels need the same level, a piece one level up is safe even right next to an enemy. Climbing only one square at a time makes that shelter slow to reach, so there is a trade-off between using levels as shields and racing the king to the enemy camp.' },
    ], columns: 1 },
    { type: 'p', text: 'The number assignment is hidden and duels depend on people’s skill, so **there is no dominant strategy**. "Small numbers for brains, large numbers for brawn" is still the safest default.' },
  ],
  similar: [
    { name: 'Stratego', players: '2', alike: 'Pieces of unknown rank meet, reveal themselves and the loser is removed; capturing the flag wins.', differs: 'Ranks decide the outcome instantly; nobody plays a contest.' },
    { name: 'Janggi (Korean chess)', players: '2', alike: 'A board war won by capturing the general.', differs: 'Pieces are visible, each moves differently, and the capturer always wins.' },
    { name: 'L’Attaque', players: '2', alike: 'The ancestor of Stratego: hidden ranks resolved only on contact.', differs: 'A fixed rank table decides; the board is flat.' },
  ],
});

export const roundTable = sg1Game('round-table-of-hardship', 'main', day(3), 2, ['equationSignal', 'equationTower', 'heavy13'], {
  meta: {
    title: '고난의 원탁 규칙 — 소사이어티 게임 시즌1 3일차 챌린지, 오답마다 무거워지는 원탁',
    description: '소사이어티 게임 시즌1 3일차 챌린지 고난의 원탁의 규칙을 정리했어요. 80kg 원탁을 받치는 대표 3명, 밑에 놓인 달걀, 답이 1–6인 산수 문제를 주사위로 답하는 주사위 산수, 오답자 한 명당 5kg 모래주머니, 달걀이 먼저 깨지면 패배까지.',
    keywords: ['고난의 원탁', '소사이어티 게임 고난의 원탁', '주사위 산수', '소사이어티게임 시즌1', '소사이어티 게임 2화'],
  },
  title: '고난의 원탁 — 소사이어티 게임 시즌1 3일차 챌린지',
  name: '고난의 원탁',
  lead: '세 사람이 원탁을 받치고, 나머지는 산수 문제를 주사위로 답해요. 누군가 틀릴 때마다 원탁 위에 모래주머니가 하나씩 올라가요.',
  summary: '주사위 산수에서 틀린 사람 수만큼 원탁이 무거워지고, 버티던 원탁이 내려와 달걀을 먼저 깨는 마을이 지는 챌린지.',
  setup: [
    { type: 'list', items: [
      '**원탁 대표**: 마을마다 3명. 기본 무게 **80kg**인 원탁을 받쳐 들어요. 원탁 밑에는 **달걀**이 놓여 있어요.',
      '**나머지 주민**: 각자 큰 주사위를 하나씩 들고 "주사위 산수"에 참여해요.',
      '**모래주머니**: 한 개 **5kg**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '문제', body: '화면에 산수 문제가 나와요. 답은 언제나 1부터 6 사이의 수예요.' },
      { title: '주사위로 답하기', body: '답에 해당하는 면이 위로 오게 주사위를 들어 보여요.' },
      { title: '벌칙', body: '한 문제가 끝날 때마다 **틀린 주민 한 명당 5kg** 모래주머니가 그 마을 원탁에 더해져요.' },
      { title: '반복', body: '원탁이 버티는 동안 문제가 이어져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '원탁을 떨어뜨려 **달걀을 먼저 깨뜨린 마을이 져요.**',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '정리된 자료에 따르면 주사위 가운데 일부는 면 배치가 보통 주사위(마주 보는 면의 합이 7)와 달랐어요. 자기 주사위의 배치를 미리 익혀야 답을 빨리 찾을 수 있어요.',
      '같은 형식의 미니게임에서는 3초 안에 답해야 했어요. 본 챌린지의 답하는 시간은 정리된 규칙에 따로 나와 있지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '고난의 원탁은 두뇌 팀의 실수를 신체 팀이 **몸으로 갚는** 구조예요. 문제 하나는 쉬워도, 틀린 사람 수가 그대로 무게로 쌓이니 오래 갈수록 작은 실수가 결정적이 돼요.' },
    { type: 'cards', items: [
      { title: '인원이 많으면 불리할 수 있어요', body: '벌칙은 "틀린 사람 수"에 비례해요. 문제를 푸는 주민이 많은 마을은 같은 정답률이라도 문제마다 평균적으로 더 많은 모래주머니를 받아요. 사람 수가 많은 쪽이 오히려 정확도를 더 높여야 하는 셈이에요.' },
      { title: '정확도가 속도보다 먼저', body: '답이 1–6으로 좁아서 문제를 끝까지 풀지 않아도 범위를 좁히기 쉬워요. 대신 주사위를 잘못 돌려 엉뚱한 면을 보이면 똑같이 오답이에요. 계산보다 "내 주사위에서 그 면을 바로 찾는 것"이 의외의 변수예요.' },
      { title: '누가 원탁을 드나', body: '세 명이 버티는 시간은 원탁 무게가 늘수록 급격히 짧아져요. 가장 힘 센 세 명을 원탁에 두는 게 당연해 보이지만, 그만큼 산수에서 빠지는 사람의 실력도 따져야 해요. 산수를 잘하는 사람이 원탁에 가면 무게가 더 빨리 늘어요.' },
    ], columns: 1 },
    { type: 'p', text: '전략의 여지는 배치 정도라 **우월 전략은 없어요.** 정답률을 높이는 연습과 버티는 힘이 그대로 결과가 되는 정직한 게임이에요.' },
  ],
  similar: [
    { name: '할리갈리 (Halli Galli)', players: '2–6명', alike: '카드에 보이는 수를 빠르게 셈해 반응하고, 틀리면 벌칙을 받아요.', differs: '할리갈리는 개인전이고 벌칙이 카드를 내주는 것이에요.' },
    { name: '젠가 (Jenga)', players: '1명 이상', alike: '조금씩 쌓이는 부담이 한계를 넘는 순간 무너지는 긴장감이 같아요.', differs: '젠가는 손재주 게임이고, 문제를 푸는 부분이 없어요.' },
  ],
}, {
  meta: {
    title: 'The Round Table of Hardship rules — The Society Game season 1, day 3 challenge',
    description: 'The rules of The Round Table of Hardship (고난의 원탁) from The Society Game season 1: three players holding an 80 kg table over an egg, dice arithmetic with answers from 1 to 6, a 5 kg sandbag for every wrong answer, and losing when your egg breaks first.',
    keywords: ['The Round Table of Hardship', 'The Society Game', 'dice arithmetic', '소사이어티 게임 고난의 원탁'],
  },
  title: 'The Round Table of Hardship — The Society Game season 1, day 3 challenge',
  name: 'The Round Table of Hardship (고난의 원탁)',
  lead: 'Three players hold up a table while the rest answer arithmetic with dice. Every wrong answer adds a sandbag to the table.',
  summary: 'Each wrong answer in dice arithmetic adds weight to the table; the village whose table drops and breaks its egg first loses.',
  setup: [
    { type: 'list', items: [
      '**Table holders**: three per village, holding a table that weighs **80 kg** to start, with an **egg** underneath.',
      '**Everyone else**: holds a large die and plays "dice arithmetic".',
      '**Sandbags**: **5 kg** each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Question', body: 'An arithmetic problem appears; the answer is always between 1 and 6.' },
      { title: 'Answer with the die', body: 'Hold up your die with the answer facing up.' },
      { title: 'Penalty', body: 'After each problem, **5 kg per wrong resident** is added to that village’s table.' },
      { title: 'Repeat', body: 'Problems continue while the tables hold.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village whose table drops and breaks its egg first loses.**',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'According to the written account, some dice had non-standard layouts (opposite faces not summing to 7), so players had to learn their own die.',
      'In the mini-game of the same format answers had to come within 3 seconds; the challenge’s answer time is not stated in the written rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The thinkers’ mistakes are **paid for in muscle** by the holders. Each problem is easy, but every wrong answer stays on the table as weight, so small errors decide long games.' },
    { type: 'cards', items: [
      { title: 'More solvers can hurt', body: 'The penalty scales with the number of wrong residents. With the same accuracy, a village with more solvers collects more sandbags per problem on average, so the larger side must be more accurate.' },
      { title: 'Accuracy before speed', body: 'Answers lie in 1–6, so narrowing them down is easy; but turning the die to the wrong face counts as wrong too. Finding the face fast on your own die is the hidden skill.' },
      { title: 'Who holds the table', body: 'Endurance falls quickly as weight rises. The three strongest seem obvious, but a strong arithmetician sent to the table makes the weight grow faster.' },
    ], columns: 1 },
    { type: 'p', text: 'Only line-up choices are strategic, so **there is no dominant strategy**: practice and endurance decide it.' },
  ],
  similar: [
    { name: 'Halli Galli', players: '2–6', alike: 'Count what you see quickly and get penalised for mistakes.', differs: 'It is individual, and the penalty is giving away cards.' },
    { name: 'Jenga', players: '1+', alike: 'Pressure builds bit by bit until it collapses.', differs: 'Pure dexterity, with no problems to solve.' },
  ],
});

export const fourLegged = sg1Game('four-person-five-legged-race', 'main', day(4), 3, ['magicswap', 'nemoCount', 'fourThree'], {
  meta: {
    title: '4인 5각 규칙 — 소사이어티 게임 시즌1 4일차 챌린지, 발을 묶고 칠교와 링토스',
    description: '소사이어티 게임 시즌1 4일차 챌린지 4인 5각의 규칙을 정리했어요. 발을 묶은 4명, 트랙 양 끝의 칠교 퍼즐과 링토스, 네 명이 모두 미션을 마치면 끝나는 라운드, 3판 2선승, 라운드마다 다른 조합과 1–2회 출전 제한까지.',
    keywords: ['4인 5각', '소사이어티 게임 4인 5각', '소사이어티게임 칠교', '소사이어티게임 시즌1', '소사이어티 게임 3화'],
  },
  title: '4인 5각 — 소사이어티 게임 시즌1 4일차 챌린지',
  name: '4인 5각',
  lead: '네 명이 발을 묶은 채 트랙 양 끝을 오가며 칠교 퍼즐과 링토스를 해요. 라운드마다 다른 네 명이 나서야 해서, 출전 순서 짜기가 곧 전략이에요.',
  summary: '발을 묶은 네 명이 칠교 퍼즐과 링토스를 모두 해내야 끝나는 라운드를 3판 2선승으로 겨루는 챌린지.',
  setup: [
    { type: 'list', items: [
      '**출전**: 라운드마다 각 마을에서 4명이 나와 4인 5각으로 발을 묶어요.',
      '**트랙**: 양 끝에 **칠교 퍼즐**과 **링토스** 미션이 준비돼 있어요.',
      '**출전 제한**: 라운드마다 멤버 조합이 달라야 하고, 모든 주민은 **최소 1번, 최대 2번** 출전해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '함께 이동', body: '묶인 네 명이 함께 트랙을 오가요.' },
      { title: '미션', body: '네 명이 **각자 한 번씩** 미션을 해내야 해요. 칠교 퍼즐은 조각으로 주어진 모양을 만드는 것이고, 링토스는 고리를 던져 기둥에 거는 거예요.' },
      { title: '라운드 종료', body: '네 명이 모두 미션을 마치면 그 라운드가 끝나요. 먼저 끝낸 마을이 라운드를 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '라운드를 **먼저 2번 이긴 마을**이 승리해요(최대 3라운드).',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드마다 어느 미션을 하는지(칠교와 링토스를 라운드별로 나눴는지, 한 라운드에 둘 다 했는지)는 자료마다 설명이 조금 달라 적지 않았어요. tvN 소개는 "양 끝에 두 미션이 있고 각자 하나씩 수행"이라고만 해요.',
      '이 회차에는 리더가 주민 한 명을 감옥에 넣으면 갇힌 시간만큼 얼음을 받는 제안이 있었고, 수감된 주민은 챌린지에서 빠졌어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '4인 5각은 달리기보다 **출전표 싸움**이에요. 모두가 한 번은 나와야 하니 약한 주민도 반드시 어느 라운드엔가 서고, 그 라운드를 어디에 두느냐가 승부를 가르게 돼요.' },
    { type: 'cards', items: [
      { title: '자리 배분 게임', body: '세 라운드에 네 자리씩, 최대 12자리를 마을 주민이 나눠 써요. 주민이 많으면 대부분 한 번만 나오고 몇 명만 두 번 나와요. 강한 주민을 앞 두 라운드에 몰아 빨리 2승을 노리면, 약한 주민들이 남게 되는데 3라운드까지 가지 않으면 그들은 나올 일이 없어요. 반대로 앞에서 한 판을 지면 약한 조가 꼭 이겨야 하는 상황이 돼요.' },
      { title: '상대 배치를 읽기', body: '같은 고민을 상대도 해요. 상대가 강한 조를 어느 라운드에 낼지 예측해, 그 라운드는 버리고 다른 라운드에 힘을 주는 식의 "져 줄 판 고르기"가 가능해요. 이 구조는 게임 이론의 **블로토 게임**(한정된 병력을 여러 전장에 나누는 게임)과 닮았어요.' },
      { title: '약한 고리 하나', body: '라운드는 네 명 모두가 미션을 끝내야 끝나요. 한 명이 칠교에서 막히거나 링토스를 계속 놓치면 나머지 셋이 아무리 빨라도 기다려야 해요. 조를 짤 때 평균보다 **가장 약한 한 명**이 중요해요.' },
    ], columns: 1 },
    { type: 'p', text: '상대의 출전표에 따라 최선이 달라지므로 **우월 전략은 없어요.** "필수 출전"을 언제 쓰느냐는 문제를 먼저 정리한 마을이 유리해요.' },
  ],
  similar: [
    { name: '우봉고 (Ubongo)', players: '1–4명', alike: '정해진 조각으로 모양을 빠르게 채우는 시간제 퍼즐이에요. 칠교 미션과 같은 감각을 써요.', differs: '우봉고는 각자 퍼즐을 푸는 개인전이고, 몸을 묶는 요소가 없어요.' },
    { name: '칠교놀이 (탱그램)', players: '1명 이상', alike: '일곱 조각을 모두 써서 주어진 실루엣을 만드는 퍼즐, 바로 이 챌린지의 미션이에요.', differs: '혼자 푸는 퍼즐이고, 출전 순서나 라운드가 없어요.' },
  ],
}, {
  meta: {
    title: 'Four-Person Five-Legged Race rules — The Society Game season 1, day 4 challenge',
    description: 'The rules of the Four-Person Five-Legged Race (4인 5각) from The Society Game season 1: four players tied together, a tangram puzzle and ring toss at the ends of the track, rounds that end when all four finish, best of three, and a different line-up each round with everyone playing once or twice.',
    keywords: ['Four-Person Five-Legged Race', 'The Society Game', 'tangram', '소사이어티 게임 4인 5각'],
  },
  title: 'Four-Person Five-Legged Race — The Society Game season 1, day 4 challenge',
  name: 'Four-Person Five-Legged Race (4인 5각)',
  lead: 'Four players with legs tied shuttle along a track to solve tangrams and toss rings. Each round needs a new foursome, so the line-up is the strategy.',
  summary: 'Four tied-together players must each finish a tangram or ring-toss mission; best of three rounds with a different line-up every time.',
  setup: [
    { type: 'list', items: [
      '**Line-up**: each round, four players per village are tied together.',
      '**Track**: a **tangram puzzle** and a **ring toss** wait at its ends.',
      '**Limits**: a different combination every round; every resident plays **at least once and at most twice**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Move together', body: 'The four tied players travel the track as one.' },
      { title: 'Missions', body: '**Each of the four** must complete one mission: building a shape from tangram pieces, or throwing a ring onto a post.' },
      { title: 'End of round', body: 'The round ends when all four have finished; the faster village takes it.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**First to two rounds** wins (at most three).',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Which mission each round used (tangram and ring toss in alternate rounds, or both in one) is described slightly differently by the sources, so it is left out; tvN’s synopsis says only that the two missions sit at the ends and each player does one.',
      'That day the leaders were offered ice for every hour a resident spent in prison; a prisoner sat out the challenge.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is less a race than **a line-up battle**. Everyone must play once, so weaker players appear somewhere, and where you put them decides the match.' },
    { type: 'cards', items: [
      { title: 'Allocating seats', body: 'Three rounds of four make at most twelve seats. With many residents, most play once and a few twice. Stacking the strong in rounds 1 and 2 aims for a quick 2–0, and the weak never need to play if there is no round 3; lose one early and the weak foursome must win.' },
      { title: 'Reading the opponent', body: 'The other village faces the same puzzle. Predicting where its strongest four go lets you concede that round and win elsewhere — the shape of the **Colonel Blotto game**, where limited forces are split across battlefields.' },
      { title: 'One weak link', body: 'A round ends only when all four finish, so one player stuck on a tangram holds up the rest. The **weakest member** matters more than the average.' },
    ], columns: 1 },
    { type: 'p', text: 'The best line-up depends on the opponent’s, so **there is no dominant strategy**; the village that first works out when to spend its mandatory appearances has the edge.' },
  ],
  similar: [
    { name: 'Ubongo', players: '1–4', alike: 'Timed puzzles filling a shape with given pieces, the same skill as the tangram mission.', differs: 'Everyone solves alone; nobody is tied together.' },
    { name: 'Tangram', players: '1+', alike: 'Use all seven pieces to form a silhouette: the mission itself.', differs: 'A solo puzzle with no rounds or line-ups.' },
  ],
});

export const floorRemoval = sg1Game('floor-removal', 'main', day(5), 4, ['gyulhap', 'equationSignal', 'nemoCount'], {
  meta: {
    title: '바닥빼기 규칙 — 소사이어티 게임 시즌1 5일차 챌린지, 곱셈 수식을 틀리면 사라지는 발판',
    description: '소사이어티 게임 시즌1 5일차 챌린지 바닥빼기의 규칙을 정리했어요. 블록 100개 위에 서는 6명, 숫자판에서 A × B = C 곱셈 수식 찾기, 마을별 교대 10초 제한, 오답자 수만큼 빠지는 블록, 더 오래 버티는 마을이 승리까지.',
    keywords: ['바닥빼기', '소사이어티 게임 바닥빼기', '곱셈 수식 찾기', '소사이어티게임 시즌1', '소사이어티 게임 4화'],
  },
  title: '바닥빼기 — 소사이어티 게임 시즌1 5일차 챌린지',
  name: '바닥빼기',
  lead: '여섯 명이 블록 위에 서 있고, 나머지는 숫자판에서 곱셈 수식을 찾아요. 틀리거나 시간을 넘길 때마다 발밑 블록이 하나씩 사라져요.',
  summary: '숫자판에서 A × B = C 곱셈 수식을 번갈아 찾고, 오답만큼 블록이 빠지는 바닥 위에서 더 오래 버티는 챌린지.',
  setup: [
    { type: 'list', items: [
      '**블록 팀**: 마을마다 6명이 **정사각형 블록 100개**로 된 바닥 위에 올라서요.',
      '**수식 팀**: 나머지 주민은 숫자가 깔린 판을 보고 **A × B = C**가 되는 곱셈 수식을 찾아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '교대로 답하기', body: '두 마을이 번갈아 수식을 말해요. 한 번 답하는 데 **10초** 제한이 있어요.' },
      { title: '오답 처리', body: '틀린 수식을 말하거나 10초를 넘기면 오답이에요.' },
      { title: '블록 빼기', body: '한 문제가 끝날 때마다 그 문제에서 나온 **오답자 수만큼 블록이 빠져요.**' },
      { title: '버티기', body: '블록이 줄어드는 동안 블록 팀은 떨어지지 않고 버텨야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '줄어드는 블록 위에서 **더 오래 버틴 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두 자료 모두 "양 팀 오답자 수만큼 블록이 빠진다"고만 적고 있어서, 오답한 마을의 블록만 빠지는지 정확한 방식은 확인하지 못했어요.',
      '이미 나온 수식을 다시 말하면 안 되는 것으로 정리돼 있어요. 숫자 순서를 바꿔 말하는 것이 허용되는지는 방송 중 설명과 실제 진행이 달랐다는 지적이 있어 적지 않았어요.',
      '이날 아침에는 두 마을이 주민을 한 명씩 맞바꾸는 **주민 교환**이 있었어요. 옮긴 주민의 개인 상금과 블랙리스트 기록도 함께 옮겨 가요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '바닥빼기는 **유한한 정답을 두 팀이 나눠 먹는** 게임이에요. 숫자판의 곱셈 수식은 정해진 개수만큼만 있고, 한 번 말한 것은 다시 쓸 수 없으니 판이 길어질수록 남은 수식을 찾기가 어려워져요.' },
    { type: 'cards', items: [
      { title: '쉬운 수식은 금방 사라져요', body: '2 × 3 = 6처럼 눈에 띄는 수식은 초반에 소진돼요. 뒤로 갈수록 판을 체계적으로 훑는 방법(한 숫자를 기준으로 이웃한 칸을 차례로 확인하는 식)이 있는 팀이 버텨요. 이미 나온 수식을 모두 기억하는 것도 실력이에요. 중복 답은 오답이니까요.' },
      { title: '10초를 어떻게 쓰나', body: '내 차례의 10초는 상대 팀에게도 생각할 시간이에요. 답을 빨리 말하면 상대가 찾을 시간이 줄고, 끝까지 끌면 우리 팀 다른 사람이 찾을 시간이 늘어요. 남은 수식이 적을수록 시간 끌기의 가치가 커져요.' },
      { title: '블록 위의 인내', body: '수식 팀이 같은 수의 실수를 해도, 줄어든 바닥에서 여섯 명이 얼마나 촘촘히 서고 버티느냐는 블록 팀의 몫이에요. 두뇌와 신체가 각자 따로 실력을 보태는 구조예요.' },
    ], columns: 1 },
    { type: 'p', text: '정답 풀을 함께 쓰는 경쟁이라 상대 실력에 따라 판이 달라지고, **우월 전략은 없어요.** 다만 "남은 정답 수"를 의식하는 팀이 후반에 유리해요.' },
  ],
  similar: [
    { name: '세트 (SET)', players: '1명 이상', alike: '깔린 카드 속에서 규칙에 맞는 조합을 남보다 먼저 찾아 외쳐요.', differs: '세트는 색·모양·개수 조합이고, 틀려도 벌칙이 가벼워요.' },
    { name: '고스트 블리츠 (Geistesblitz)', players: '2–8명', alike: '눈앞의 정보에서 정답을 순간적으로 찾는 반응 속도 게임이에요.', differs: '한 문제에 정답이 하나뿐이고, 정답 풀이 줄어드는 구조가 없어요.' },
  ],
}, {
  meta: {
    title: 'Floor Removal rules — The Society Game season 1, day 5 challenge',
    description: 'The rules of Floor Removal (바닥빼기) from The Society Game season 1: six players standing on 100 square blocks, finding A × B = C equations on a number board, alternating turns with a 10-second limit, a block removed for every wrong answer, and the side that stays up longer wins.',
    keywords: ['Floor Removal', 'The Society Game', 'multiplication search', '소사이어티 게임 바닥빼기'],
  },
  title: 'Floor Removal — The Society Game season 1, day 5 challenge',
  name: 'Floor Removal (바닥빼기)',
  lead: 'Six players stand on blocks while the rest find multiplication equations on a number board. Every wrong or late answer removes a block from under their feet.',
  summary: 'Find A × B = C equations on a number board in turn; each wrong answer removes a block, and the side that stays standing longer wins.',
  setup: [
    { type: 'list', items: [
      '**Block team**: six per village stand on a floor of **100 square blocks**.',
      '**Equation team**: the rest search a board of numbers for **A × B = C**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Turns', body: 'The villages take turns naming equations, **10 seconds** each.' },
      { title: 'Wrong answers', body: 'A false equation or running out of time is wrong.' },
      { title: 'Removing blocks', body: 'After each problem, **one block is removed per wrong answer** in it.' },
      { title: 'Hold on', body: 'The block team must stay on the shrinking floor.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village that stays on its blocks longer** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Both sources say only that blocks are removed "by the number of wrong answers on both teams", so whether a village loses only its own blocks could not be confirmed.',
      'An equation already named cannot be repeated. Whether the numbers may be said in a different order is disputed (the explanation and the actual play reportedly differed), so it is left out.',
      'That morning the villages had to **swap one resident**; a mover takes their prize money and blacklist marks along.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Floor Removal is two teams **drawing from one finite pool of answers**. The board holds a fixed number of equations and each can be used once, so the longer it lasts the harder the next one is to find.' },
    { type: 'cards', items: [
      { title: 'Easy ones go first', body: 'Obvious equations like 2 × 3 = 6 vanish early. Later, the team with a systematic scan (anchor on one number and check its neighbours in order) survives, and remembering every used equation matters, because repeats are wrong.' },
      { title: 'Spending ten seconds', body: 'Your ten seconds are thinking time for the other side too. Answering fast denies them time; running the clock gives your own teammates more. The fewer equations left, the more stalling is worth.' },
      { title: 'Endurance on top', body: 'Even with equal mistakes, how tightly six people can stand on a shrinking floor is the block team’s contribution: brain and body add separately.' },
    ], columns: 1 },
    { type: 'p', text: 'With a shared pool the game depends on the opponent, so **there is no dominant strategy**; the side that tracks how many answers remain has the late edge.' },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'Spot a valid combination among the cards on the table before anyone else and call it.', differs: 'Combinations of colour, shape and count; mistakes cost little.' },
    { name: 'Ghost Blitz (Geistesblitz)', players: '2–8', alike: 'Find the right answer in front of you in an instant.', differs: 'Each card has one answer; there is no shrinking pool.' },
  ],
});

export const numberClimbing = sg1Game('number-climbing', 'main', day(6), 5, ['nemoCount', 'gradation', 'hiddenWord'], {
  meta: {
    title: '숫자 클라이밍 규칙 — 소사이어티 게임 시즌1 6일차 챌린지, 밧줄 위에서 드러나는 숫자 16개 외우기',
    description: '소사이어티 게임 시즌1 6일차 챌린지 숫자 클라이밍의 규칙을 정리했어요. 6m 클라이밍 세트와 1–30 숫자 타일 16개, 밧줄을 타고 가림 종이를 떼는 대표 2명, 숫자를 외워 한 명씩 들어가는 문제의 방, 필기 도구 금지, 더 빨리 끝낸 마을이 승리까지.',
    keywords: ['숫자 클라이밍', '소사이어티 게임 숫자 클라이밍', '문제의 방', '소사이어티게임 시즌1', '소사이어티 게임 5화'],
  },
  title: '숫자 클라이밍 — 소사이어티 게임 시즌1 6일차 챌린지',
  name: '숫자 클라이밍',
  lead: '두 사람이 밧줄을 타고 6m 벽에 걸린 숫자 타일을 하나씩 드러내요. 나머지는 그 숫자 16개를 외워, 한 명씩 문제의 방에 들어가 문제를 풀어요.',
  summary: '밧줄로 드러낸 숫자 16개를 외워 한 사람씩 문제의 방에서 답하고, 전원이 먼저 통과하는 마을이 이기는 챌린지.',
  setup: [
    { type: 'list', items: [
      '**클라이밍 세트**: 마을마다 높이 **6m**. 1부터 30 사이의 숫자가 적힌 **타일 16개**가 가려진 채 걸려 있어요.',
      '**클라이밍 대표**: 마을마다 2명.',
      '**나머지 주민**: 숫자를 외우고 문제를 풀어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '숫자 공개', body: '클라이밍 대표가 밧줄을 타고 올라가, 위에서부터 타일을 가린 종이를 떼며 내려와요.' },
      { title: '암기', body: '16개가 모두 드러나면 나머지 주민들이 숫자를 외워요.' },
      { title: '문제의 방', body: '한 사람씩 "문제의 방"에 들어가 제시되는 문제를 풀어요. 클라이밍 대표를 뺀 **모든 주민이 한 문제씩** 맞혀야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '전원이 문제를 **더 빨리 통과한 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**필기 도구 등 외부 물건으로 표시하는 것은 금지**예요. 외우는 방법은 각자의 머리와 몸으로만 해결해야 해요.',
      '문제의 방에서 어떤 문제가 나왔는지(숫자의 위치를 묻는지, 계산을 시키는지), 틀렸을 때 다시 도전할 수 있는지는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
      '이날 미니게임의 보상으로 높동에는 개인 상금 100만 원으로 사는 복권 이벤트가 있었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '숫자 클라이밍은 **팀 전체의 기억을 한 사람씩 검사하는** 게임이에요. 문제를 푸는 순간에는 혼자이고 아무것도 적을 수 없으니, 외우는 방법을 미리 팀 단위로 정해 두는 것이 핵심이에요.' },
    { type: 'cards', items: [
      { title: '16개를 어떻게 줄이나', body: '1–30 중 16개는 절반이 넘어요. 그래서 "있는 숫자 16개"를 외우는 것보다 "없는 숫자 14개"를 외우는 편이 가벼울 수 있어요. 위치까지 필요하다면 네 줄씩 묶거나 이야기로 엮는 등, 모두가 같은 방식으로 외우면 서로 확인해 주기도 쉬워요.' },
      { title: '물건 없이 기록하기', body: '외부 물건이 금지됐다는 것은 반대로 말하면 **몸**은 쓸 수 있다는 뜻으로 읽힐 여지가 있어요. 손가락 모양이나 자세처럼 몸에 남기는 기억 보조를 팀이 미리 맞추면 암기 부담을 크게 덜 수 있어요. 다만 방 안에서 그걸 읽어 낼 시간도 시간이에요.' },
      { title: '가장 느린 한 명', body: '전원이 통과해야 하니 순서대로 들어가는 동안 시간은 모두 더해져요. 기억력이 약한 주민을 누가 어떻게 도와 외우게 하느냐가, 잘 외우는 사람이 더 빨리 푸는 것보다 결과에 크게 작용해요.' },
    ], columns: 1 },
    { type: 'p', text: '팀의 암기 체계를 얼마나 잘 설계하느냐의 게임이라 **우월 전략은 없어요.** 다만 모두가 같은 방식으로 외우는 마을이 실수를 줄여요.' },
  ],
  similar: [
    { name: '메모리 (Memory, 짝 맞추기)', players: '2명 이상', alike: '뒤집힌 카드의 그림과 위치를 기억해 맞히는 기억력 게임이에요.', differs: '카드를 한 장씩 뒤집으며 진행하고, 팀 단위로 외우지 않아요.' },
    { name: '메모아! (Memoarrr!)', players: '2–4명', alike: '한 번 본 카드의 위치를 기억해야 살아남는, 기억 실수가 곧 탈락인 게임이에요.', differs: '라운드마다 카드를 한 장씩 뒤집고, 다른 사람이 본 정보도 함께 쓰는 구조예요.' },
  ],
}, {
  meta: {
    title: 'Number Climbing rules — The Society Game season 1, day 6 challenge',
    description: 'The rules of Number Climbing (숫자 클라이밍) from The Society Game season 1: a 6 m climbing set with sixteen hidden tiles numbered 1–30, two climbers peeling off the covers, everyone else memorising them and entering the question room one by one, no writing tools, and the faster village wins.',
    keywords: ['Number Climbing', 'The Society Game', 'memory challenge', '소사이어티 게임 숫자 클라이밍'],
  },
  title: 'Number Climbing — The Society Game season 1, day 6 challenge',
  name: 'Number Climbing (숫자 클라이밍)',
  lead: 'Two climbers uncover sixteen number tiles on a 6 m wall; the rest memorise them and enter the question room one at a time.',
  summary: 'Memorise the sixteen numbers the climbers reveal, then answer one by one in the question room; the village that gets everyone through first wins.',
  setup: [
    { type: 'list', items: [
      '**Climbing set**: **6 m** tall per village, with **16 tiles** numbered between 1 and 30, covered.',
      '**Climbers**: two per village.',
      '**Everyone else**: memorises and answers.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Reveal', body: 'The climbers go up the rope and come down removing the paper covers from the top.' },
      { title: 'Memorise', body: 'Once all sixteen show, the others memorise them.' },
      { title: 'Question room', body: 'One at a time, each enters the "question room" and solves a question. **Everyone except the climbers** must get one right.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village that gets everyone through faster** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Marking with writing tools or any outside object is forbidden.**',
      'What the questions were (positions, arithmetic) and whether a wrong answer could be retried are not in the written rules, so they are left out.',
      'That day Nopdong’s mini-game prize was a lottery bought with ₩1 million of personal prize money.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Number Climbing **tests a team’s memory one person at a time**. In the room you are alone and can write nothing, so the method must be agreed as a team beforehand.' },
    { type: 'cards', items: [
      { title: 'Shrinking sixteen', body: 'Sixteen of thirty is more than half, so memorising the fourteen missing numbers may be lighter than the sixteen present. If positions matter, chunk by rows or weave a story; if everyone uses the same scheme, they can check each other.' },
      { title: 'Recording without objects', body: 'Banning outside objects leaves room to read the **body** as allowed. Agreed finger shapes or postures can carry part of the load, though decoding them in the room also takes time.' },
      { title: 'The slowest member', body: 'Everyone must pass and the times add up, so helping the weakest memoriser matters more than the best one answering faster.' },
    ], columns: 1 },
    { type: 'p', text: 'It is a contest of designing a team memory system, so **there is no dominant strategy**; a village where everyone memorises the same way makes fewer mistakes.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '2+', alike: 'Remember pictures and positions of face-down cards.', differs: 'Cards are turned one at a time; no team memorising.' },
    { name: 'Memoarrr!', players: '2–4', alike: 'Remembering where cards lie keeps you alive; a memory slip knocks you out.', differs: 'Cards are revealed one per turn and shared information matters.' },
  ],
});

export const foulBall = sg1Game('foul-ball', 'main', day(7), 6, ['nemoCount', 'equationSignal', 'heavy13'], {
  meta: {
    title: '파울볼 규칙 — 소사이어티 게임 시즌1 7일차 챌린지, 이어 외우는 숫자와 공 받기, 표적 맞히기',
    description: '소사이어티 게임 시즌1 7일차 챌린지 파울볼의 규칙을 정리했어요. 공 받는 3명과 던지는 1명, 앞사람의 숫자를 모두 외운 뒤 수식의 답을 잇는 두뇌 게임, 오답 팀 1개·상대 팀 2개의 공, 20회 반복 뒤 표적판 떨어뜨리기까지.',
    keywords: ['파울볼', '소사이어티 게임 파울볼', '소사이어티게임 시즌1', '소사이어티 게임 6화', '소사이어티 게임 챌린지'],
  },
  title: '파울볼 — 소사이어티 게임 시즌1 7일차 챌린지',
  name: '파울볼',
  lead: '두뇌 팀이 숫자를 이어 외우다 누군가 틀리면 공이 떨어지고, 허리에 바구니를 찬 주민들이 그 공을 받아요. 모은 공으로 표적판을 더 많이 떨어뜨리는 마을이 이겨요.',
  summary: '이어 외우기 수식 게임의 오답으로 공이 생기고, 그 공을 받아 표적판을 맞히는 두뇌·신체·감각 복합 챌린지.',
  setup: [
    { type: 'list', items: [
      '**공 받는 주민**: 마을마다 3명. 허리에 바구니를 매달아요.',
      '**공 던지는 주민**: 마을마다 1명.',
      '**두뇌 게임 주민**: 나머지 전원.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '이어 외우기', body: '두뇌 게임 주민은 앞 차례 주민이 말한 숫자를 **모두 외워 다시 말한 뒤**, 새로 제시된 수식의 답까지 이어 말해요.' },
      { title: '공 배분', body: '오답자가 나오면 **틀린 팀은 공 1개, 상대 팀은 공 2개**를 받아요. 공은 위에서 떨어지고, 공 받는 주민이 허리 바구니로 받아요.' },
      { title: '20회 반복', body: '두뇌 게임과 공 받기를 20회 되풀이해요.' },
      { title: '표적 맞히기', body: '공 던지는 주민이 모은 공으로 표적을 맞혀 표적판을 떨어뜨려요. 공이 다 떨어질 때까지 던져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**표적판을 더 많이 떨어뜨린 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두 마을이 한 줄의 숫자를 번갈아 이어 가는지, 마을마다 따로 이어 가는지, 오답 뒤 줄이 처음부터 다시 시작하는지는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
      '이날 미니게임의 보상으로 리더가 주민 한 명을 감옥에 넣으면 갇힌 시간만큼 상금이 쌓이는 이벤트가 있었고, 수감된 주민은 챌린지에 참여하지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '파울볼의 재미있는 점은 **공이 오직 오답에서만 생긴다**는 거예요. 아무도 틀리지 않으면 어느 마을도 공을 얻지 못하고, 누군가 틀릴 때마다 틀린 쪽보다 상대가 공을 하나 더 가져가요.' },
    { type: 'cards', items: [
      { title: '실수의 값은 "공 1개 차이"', body: '내 팀이 틀려도 공 1개는 들어와요. 실수 하나의 실제 손해는 상대와의 차이 1개뿐이에요. 그래서 승부는 두뇌 게임만으로 정해지지 않고, 받는 쪽과 던지는 쪽이 그 차이를 뒤집을 여지가 커요.' },
      { title: '길어지는 기억 사슬', body: '앞사람이 말한 숫자를 모두 다시 말해야 하니, 차례가 갈수록 외울 양이 늘어요. 뒤 순서일수록 틀릴 확률이 높아지고, 순서를 누구에게 주느냐가 오답 수를 좌우해요.' },
      { title: '공을 표적판으로 바꾸는 효율', body: '받아 낸 공만 던질 수 있다고 보면, 공을 놓치는 만큼 기회가 줄고 던지는 정확도가 낮으면 표적판으로 바뀌지 않아요. 두뇌 게임은 기회를, 받기와 던지기는 그 기회를 점수로 바꾸는 역할이에요.' },
    ], columns: 1 },
    { type: 'p', text: '세 영역이 순서대로 곱해지는 구조라 **우월 전략은 없어요.** 한 영역이 크게 앞서도 다른 영역의 효율이 낮으면 따라잡힐 수 있어요.' },
  ],
  similar: [
    { name: '바퀴벌레 샐러드 (Kakerlakensalat)', players: '2–6명', alike: '차례대로 규칙에 맞는 말을 이어 가다 틀리면 벌칙을 받는, 순서와 기억의 압박이 같아요.', differs: '카드 그림을 보고 채소 이름을 말하는 개인전이에요.' },
    { name: '크로키놀 (Crokinole)', players: '2–4명', alike: '정확하게 맞히는 손 감각으로 점수를 내요.', differs: '원판 위에서 말을 손가락으로 튕기는 게임이고, 두뇌 게임과 연결돼 있지 않아요.' },
  ],
}, {
  meta: {
    title: 'Foul Ball rules — The Society Game season 1, day 7 challenge',
    description: 'The rules of Foul Ball (파울볼) from The Society Game season 1: three catchers and one thrower, a brain game where you repeat every earlier number before answering the next equation, a wrong answer giving one ball to the guilty team and two to the other, twenty rounds, then knocking down target boards.',
    keywords: ['Foul Ball', 'The Society Game', 'memory chain', '소사이어티 게임 파울볼'],
  },
  title: 'Foul Ball — The Society Game season 1, day 7 challenge',
  name: 'Foul Ball (파울볼)',
  lead: 'When someone slips in a chain-memory game, balls drop and catchers with baskets on their waists catch them; the village that knocks down more target boards with its balls wins.',
  summary: 'Mistakes in a chain-memory equation game create balls, which are caught and thrown at target boards: brain, body and aim in one.',
  setup: [
    { type: 'list', items: [
      '**Catchers**: three per village, baskets tied at the waist.',
      '**Thrower**: one per village.',
      '**Brain game**: everyone else.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Chain memory', body: 'Each player **repeats every number said before them**, then adds the answer to the new equation.' },
      { title: 'Balls', body: 'On a wrong answer, **the team that erred gets 1 ball and the other team 2**. Balls drop from above into the catchers’ waist baskets.' },
      { title: 'Twenty times', body: 'The brain game and catching repeat twenty times.' },
      { title: 'Targets', body: 'The thrower uses the collected balls to knock down target boards until the balls run out.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village that knocks down more target boards** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Whether the villages share one chain or keep separate ones, and whether the chain restarts after a mistake, are not in the written rules.',
      'That day a resident could be jailed to build up prize money by the hour; the prisoner sat out the challenge.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The twist is that **balls come only from mistakes**. If nobody errs, nobody gets a ball, and each slip gives the other side one more than the side that slipped.' },
    { type: 'cards', items: [
      { title: 'A mistake costs one ball', body: 'Even when you err you receive a ball, so the real cost is a margin of one. The brain game alone cannot decide it; catching and throwing can easily overturn the margin.' },
      { title: 'A growing chain', body: 'Every number said so far must be repeated, so the load grows with each turn and late positions are riskiest. Who speaks when shapes the error count.' },
      { title: 'Converting balls to boards', body: 'If only caught balls can be thrown, every drop is a lost chance, and missed throws score nothing. The brain game creates chances; catching and throwing turn them into points.' },
    ], columns: 1 },
    { type: 'p', text: 'Three stages multiply together, so **there is no dominant strategy**; a big lead in one stage can be undone by poor efficiency in another.' },
  ],
  similar: [
    { name: 'Cockroach Salad (Kakerlakensalat)', players: '2–6', alike: 'Keep a spoken chain going under rules; a slip is penalised.', differs: 'Individual play naming vegetables from cards.' },
    { name: 'Crokinole', players: '2–4', alike: 'Scoring by accurate aim.', differs: 'Flicking discs on a board, with no brain game attached.' },
  ],
});
