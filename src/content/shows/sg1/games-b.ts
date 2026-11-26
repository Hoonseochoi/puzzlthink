// 소사이어티 게임 (season 1), challenges of days 8–13: 불굴의 러너, 럼버잭, 모자이크, 롤링워드, 빨래 짜기.
import { day, sg1Game } from './shared';

export const indomitableRunner = sg1Game('indomitable-runner', 'main', day(8), 7, ['russianRoulette', 'heavy13', 'hitStay'], {
  meta: {
    title: '불굴의 러너 규칙 — 소사이어티 게임 시즌1 8일차 챌린지, 표적을 맞히면 상대 러닝머신이 빨라져요',
    description: '소사이어티 게임 시즌1 8일차 챌린지 불굴의 러너의 규칙을 정리했어요. 러닝머신을 달리는 대표 3명, 공을 던져 표적 떨어뜨리기, 한 칸마다 상대 러닝머신 한 대의 속도 올리기, 8km/h부터 16km/h까지 7단계, 마지막까지 남은 러너의 마을이 승리까지.',
    keywords: ['불굴의 러너', '소사이어티 게임 불굴의 러너', '러닝머신 챌린지', '소사이어티게임 시즌1', '소사이어티 게임 7화'],
  },
  title: '불굴의 러너 — 소사이어티 게임 시즌1 8일차 챌린지',
  name: '불굴의 러너',
  lead: '세 명이 러닝머신 위를 달리고, 나머지는 공을 던져 표적을 떨어뜨려요. 표적 한 칸을 떨어뜨릴 때마다 상대 러닝머신 한 대의 속도를 올릴 수 있어요.',
  summary: '표적을 맞힐 때마다 상대 러너의 러닝머신을 한 단계씩 빠르게 만들어, 마지막까지 달리는 러너를 남긴 마을이 이기는 챌린지.',
  setup: [
    { type: 'list', items: [
      '**러너**: 마을마다 3명. 각자 러닝머신 한 대 위에서 달려요.',
      '**투수**: 나머지 주민은 공을 던져 표적을 떨어뜨려요.',
      '**속도 단계**: 7단계. 8 → 10 → 12 → 13 → 14 → 15 → 16km/h.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '표적 맞히기', body: '투수들이 공을 던져 표적을 한 칸씩 떨어뜨려요.' },
      { title: '속도 올리기', body: '한 칸을 떨어뜨릴 때마다 **상대 마을 러닝머신 중 한 대를 골라** 속도를 한 단계 올려요.' },
      { title: '버티기', body: '속도를 견디지 못하고 러닝머신에서 내려온 러너는 빠져요. 속도는 7단계(16km/h)가 최고예요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**마지막까지 남은 러너가 속한 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '표적이 몇 칸인지, 투수들이 던지는 순서와 공의 개수는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
      '같은 이름의 게임이 파이널 3라운드에 "불굴의 러너Ⅱ"로 규칙을 바꿔 다시 나와요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '불굴의 러너는 **내 공격력으로 상대 체력을 깎는** 대결이에요. 표적을 잘 맞히는 쪽이 이기지만, 그 공격을 상대의 어느 러너에게 쓰느냐가 결과를 크게 바꿔요.' },
    { type: 'cards', items: [
      { title: '최고 단계의 낭비', body: '속도는 16km/h에서 멈춰요. 이미 7단계인 러닝머신을 다시 고르면 그 한 번은 아무 효과가 없어요. 그래서 한 사람에게만 몰아 주기보다, 최고 단계에 닿은 러너를 두고 다른 러너를 올리는 배분이 필요해요.' },
      { title: '약한 러너부터? 강한 러너부터?', body: '이기려면 상대 러너 세 명을 모두 떨어뜨려야 해요. 약한 러너는 조금만 올려도 떨어지니 먼저 끝내면 상대의 남은 버팀이 강한 러너에게만 걸려요. 반대로 강한 러너를 일찍 최고 단계로 올려 두면, 그가 버티는 시간 동안 다른 러너에게 공격을 돌릴 수 있어요. 어느 쪽이 나은지는 상대 러너들의 체력 차이에 달려 있어요.' },
      { title: '러너 선발', body: '러너는 세 명뿐이고, 마지막 한 명만 남아도 이겨요. 체력이 고르게 좋은 셋보다 **아주 오래 버티는 한 명**이 더 가치 있을 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '맞히는 실력과 달리는 체력이 기본이고, 공격 배분은 상대 러너에 따라 달라져 **우월 전략은 없어요.** "이미 최고 속도인 기계에 다시 쓰지 않기"만은 늘 옳아요.' },
  ],
  similar: [
    { name: '킹 오브 도쿄 (King of Tokyo)', players: '2–6명', alike: '내가 낸 공격으로 상대의 체력을 깎고, 마지막까지 살아남은 쪽이 이겨요.', differs: '주사위로 공격하고, 각자 자기 괴물 하나만 챙기는 개인전이에요.' },
    { name: '플릭 뎀 업! (Flick ’em Up!)', players: '2–10명', alike: '손가락으로 말을 튕겨 상대 말을 맞혀 쓰러뜨리는 정확도 대결이에요.', differs: '맞히면 바로 피해를 주고, 러닝머신처럼 시간이 지나며 쌓이는 압박은 없어요.' },
  ],
}, {
  meta: {
    title: 'The Indomitable Runner rules — The Society Game season 1, day 8 challenge',
    description: 'The rules of The Indomitable Runner (불굴의 러너) from The Society Game season 1: three runners on treadmills, everyone else throwing balls at targets, each target hit raising one enemy treadmill’s speed, seven levels from 8 to 16 km/h, and the last runner standing wins.',
    keywords: ['The Indomitable Runner', 'The Society Game', 'treadmill challenge', '소사이어티 게임 불굴의 러너'],
  },
  title: 'The Indomitable Runner — The Society Game season 1, day 8 challenge',
  name: 'The Indomitable Runner (불굴의 러너)',
  lead: 'Three run on treadmills while the rest throw balls at targets; every target knocked down speeds up one enemy treadmill.',
  summary: 'Hit targets to speed up the other side’s treadmills one level at a time; the village with the last runner standing wins.',
  setup: [
    { type: 'list', items: [
      '**Runners**: three per village, one treadmill each.',
      '**Throwers**: everyone else throws balls at a target.',
      '**Speed levels**: seven — 8, 10, 12, 13, 14, 15, 16 km/h.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Throwing', body: 'Throwers knock down the target one cell at a time.' },
      { title: 'Speeding up', body: 'Each cell lets you **pick one of the opposing treadmills** and raise its speed by a level.' },
      { title: 'Lasting', body: 'A runner who can no longer keep up and leaves the treadmill is out; level 7 (16 km/h) is the maximum.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village with the last runner standing** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The number of target cells, the throwing order and the number of balls are not in the written rules.',
      'A reworked version, "The Indomitable Runner II", returned as the final’s third round.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is **your offence against their stamina**. Better throwers win, but which runner you spend each hit on changes a lot.' },
    { type: 'cards', items: [
      { title: 'Wasted hits at the cap', body: 'Speed stops at 16 km/h, so choosing a treadmill already at level 7 does nothing. Instead of piling onto one runner, shift hits once a runner is capped.' },
      { title: 'Weakest first or strongest first?', body: 'You must topple all three. Finishing the weakest quickly leaves the opponent relying on the strong; capping the strongest early lets you turn on the others while they grind. Which is better depends on the gap between their runners.' },
      { title: 'Choosing runners', body: 'Only one runner needs to survive, so **one exceptional endurance athlete** may be worth more than three solid ones.' },
    ], columns: 1 },
    { type: 'p', text: 'Aim and stamina are the base, and allocation depends on the opposing runners, so **there is no dominant strategy** — except that hitting a capped treadmill is never right.' },
  ],
  similar: [
    { name: 'King of Tokyo', players: '2–6', alike: 'Damage opponents with your attacks; the last one standing wins.', differs: 'Dice-driven, and each player looks after a single monster.' },
    { name: 'Flick ’em Up!', players: '2–10', alike: 'Flick pieces to knock down the opponent’s: a contest of aim.', differs: 'Hits do damage at once, with no pressure building over time.' },
  ],
});

export const lumberjack = sg1Game('lumberjack', 'main', day(9), 8, ['equationTower', 'heavy13', 'nemoCount'], {
  meta: {
    title: '럼버잭 규칙 — 소사이어티 게임 시즌1 9일차 챌린지, 장작 패기·암호·주사위 쌓기 이어달리기',
    description: '소사이어티 게임 시즌1 9일차 챌린지 럼버잭의 규칙을 정리했어요. 도끼로 통나무를 쪼개 파이프를 채우는 신체 대표 2명, 밀려 나온 원형 상자의 암호를 푸는 두뇌 대표, 자물쇠 상자 속 주사위, 전원이 주사위 15개 쌓기까지.',
    keywords: ['럼버잭', '소사이어티 게임 럼버잭', '주사위 쌓기', '소사이어티게임 시즌1', '소사이어티 게임 8화'],
  },
  title: '럼버잭 — 소사이어티 게임 시즌1 9일차 챌린지',
  name: '럼버잭',
  lead: '신체 대표가 장작을 패서 파이프를 채우면 반대편으로 상자가 밀려 나와요. 두뇌 대표가 그 안의 암호를 풀어 주사위를 꺼내면, 나머지 주민 모두가 주사위를 쌓아요.',
  summary: '장작 패기 → 암호 풀기 → 주사위 15개 쌓기로 이어지는, 신체·두뇌·감각 이어달리기 챌린지.',
  setup: [
    { type: 'list', items: [
      '**신체 대표**: 마을마다 2명. 도끼와 통나무, 긴 파이프.',
      '**두뇌 대표**: 파이프 반대쪽에서 기다려요.',
      '**나머지 주민**: 주사위 쌓기에 참여해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '장작 패기', body: '신체 대표가 도끼로 통나무를 쪼개 파이프 안에 채워 넣어요. 장작이 차오를수록 파이프 안의 **원형 상자**가 반대쪽으로 밀려가요.' },
      { title: '암호 풀기', body: '반대쪽의 두뇌 대표가 밀려 나온 상자를 받아 안에 든 암호를 풀어요. 파이프에 손을 넣어 상자를 꺼내면 안 돼요.' },
      { title: '주사위 꺼내기', body: '암호로 자물쇠 상자를 열면 주사위가 나와요.' },
      { title: '주사위 쌓기', body: '나머지 주민 **전원이 각자 주사위 15개**를 쌓아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '참여한 주민 전원이 **주사위 15개 쌓기를 먼저 끝낸 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '주사위 탑이 무너졌을 때 처음부터 다시 쌓는지, 암호가 어떤 종류였는지는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
      '전날 미니게임의 보상으로 한 마을이 연습용 주사위를 받았고, 이날 미니게임도 주사위 쌓기였어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '럼버잭은 세 단계가 **차례로 이어지는** 이어달리기예요. 앞 단계가 끝나야 다음 단계가 시작되니, 마을의 총 시간은 세 단계 시간을 더한 값이에요.' },
    { type: 'cards', items: [
      { title: '가장 느린 단계가 전부를 정해요', body: '장작 패기가 빨라도 암호에서 막히면 그 시간은 되돌릴 수 없어요. 반대로 주사위 단계는 여러 명이 동시에 쌓으니 가장 늦은 한 명의 시간이 곧 그 단계의 시간이에요. 각 단계에서 "가장 느린 지점"을 줄이는 것이 중요해요.' },
      { title: '쌓는 사람이 적을수록 유리', body: '전원이 15개를 쌓아야 하니, 쌓을 사람이 많은 마을일수록 누군가 무너뜨릴 확률이 커요. 같은 실력이라면 인원이 적은 쪽이 이 단계에서 유리해요.' },
      { title: '기다리는 동안 할 일', body: '주사위가 나오기 전까지 쌓는 팀은 할 일이 없어요. 하지만 손을 풀고 쌓는 순서와 자세를 맞춰 두면, 주사위가 나온 뒤의 시간을 줄일 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '단계마다 사람의 실력이 그대로 드러나는 구조라 **우월 전략은 없어요.** 다만 가장 약한 고리를 미리 연습으로 메운 마을이 유리해요.' },
  ],
  similar: [
    { name: '라이노 히어로 (Rhino Hero)', players: '2–5명', alike: '흔들리는 탑을 차례로 높이 쌓고, 무너뜨린 사람이 져요.', differs: '카드로 층을 만들고, 앞 단계 퍼즐이 없어요.' },
    { name: '바우자크 (Bausack)', players: '2–8명', alike: '모양이 제각각인 나무 조각을 무너지지 않게 쌓는 균형 게임이에요.', differs: '조각을 경매로 나눠 갖는 단계가 있고, 시간 경쟁이 아니에요.' },
  ],
}, {
  meta: {
    title: 'Lumberjack rules — The Society Game season 1, day 9 challenge',
    description: 'The rules of Lumberjack (럼버잭) from The Society Game season 1: two body players splitting logs to fill a pipe, a brain player solving the cipher in the box it pushes out, dice in a locked box, and everyone else stacking fifteen dice each.',
    keywords: ['Lumberjack', 'The Society Game', 'dice stacking', '소사이어티 게임 럼버잭'],
  },
  title: 'Lumberjack — The Society Game season 1, day 9 challenge',
  name: 'Lumberjack (럼버잭)',
  lead: 'Body players split logs to fill a pipe and push out a box; a brain player cracks the cipher inside to free the dice; then everyone else stacks dice.',
  summary: 'A relay of splitting logs, cracking a cipher and stacking fifteen dice: body, brain and touch in sequence.',
  setup: [
    { type: 'list', items: [
      '**Body**: two per village, with an axe, logs and a long pipe.',
      '**Brain**: one waits at the far end of the pipe.',
      '**Everyone else**: stacks dice.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Splitting', body: 'The body players split logs and push the wood into the pipe; as it fills, a **round box** inside moves to the far end.' },
      { title: 'Cipher', body: 'The brain player takes the box and solves the cipher inside. Reaching into the pipe for the box is not allowed.' },
      { title: 'Dice', body: 'The answer opens a padlocked box holding the dice.' },
      { title: 'Stacking', body: '**Every remaining resident stacks fifteen dice.**' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village whose stackers all reach fifteen first** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Whether a collapsed tower restarts from zero, and what kind of cipher it was, are not in the written rules.',
      'One village had won practice dice the day before, and that day’s mini-game was also dice stacking.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Lumberjack is a **sequential relay**: each stage starts only when the previous ends, so the total is the sum of the three.' },
    { type: 'cards', items: [
      { title: 'The slowest stage rules', body: 'Fast chopping cannot buy back time lost on the cipher. In the dice stage everyone stacks at once, so the slowest stacker’s time is the stage’s time. Cut the slowest point of each stage.' },
      { title: 'Fewer stackers help', body: 'Everyone must reach fifteen, so more stackers means more chances that someone topples. At equal skill, the smaller village has the edge here.' },
      { title: 'While waiting', body: 'Stackers are idle until the dice arrive, but warming up and agreeing on technique shortens the final stage.' },
    ], columns: 1 },
    { type: 'p', text: 'Every stage exposes raw skill, so **there is no dominant strategy**; the village that has drilled its weakest link is favoured.' },
  ],
  similar: [
    { name: 'Rhino Hero', players: '2–5', alike: 'Build a wobbly tower in turns; whoever topples it loses.', differs: 'Floors are cards; no earlier puzzle stage.' },
    { name: 'Bausack', players: '2–8', alike: 'Stack odd wooden pieces without collapse.', differs: 'Pieces are auctioned first and there is no race.' },
  ],
});

export const mosaic = sg1Game('mosaic', 'main', day(10), 9, ['nonogram', 'blindGomoku', 'gradation'], {
  meta: {
    title: '모자이크 규칙 — 소사이어티 게임 시즌1 10일차 챌린지, 바뀐 칸 찾기와 주사위 탑',
    description: '소사이어티 게임 시즌1 10일차 챌린지 모자이크의 규칙을 정리했어요. 먼저 주사위 10개 쌓기, 1–10과 A–J 좌표의 100칸 그림, 10초 공개 뒤 바뀐 칸 개수 예고, 한 명씩 좌표로 답하기, 오답마다 주사위 한 개, 탑이 무너지면 탈락, 마지막 생존자의 마을이 승리까지.',
    keywords: ['모자이크', '소사이어티 게임 모자이크', '틀린 그림 찾기', '소사이어티게임 시즌1', '소사이어티 게임 9화'],
  },
  title: '모자이크 — 소사이어티 게임 시즌1 10일차 챌린지',
  name: '모자이크',
  lead: '100칸짜리 그림을 10초 동안 보고, 바뀐 그림에서 달라진 칸을 좌표로 찾아요. 틀릴 때마다 자기 주사위 탑에 주사위를 하나 더 올리고, 탑이 무너지면 탈락이에요.',
  summary: '10초 동안 본 100칸 그림에서 바뀐 칸을 좌표로 맞히고, 오답마다 주사위를 더 쌓다 탑이 무너지면 탈락하는 생존 챌린지.',
  setup: [
    { type: 'list', items: [
      '**인원**: 두 마을의 주민 전원이 각자 참여해요.',
      '**모자이크**: 가로 1–10, 세로 A–J 좌표로 된 **100칸 그림**.',
      '**주사위 탑**: 주민마다 하나씩 쌓아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '준비', body: '챌린지가 시작되면 모든 주민이 **주사위 10개**를 쌓아요. 전원이 다 쌓아야 원본 모자이크가 공개돼요.' },
      { title: '원본 공개', body: '원본 그림을 **10초** 동안 보여 주고, 달라질 칸의 개수를 미리 알려 줘요.' },
      { title: '좌표로 답하기', body: '바뀐 그림이 공개되면 주민들이 **한 명씩 번갈아** 달라진 칸을 "숫자+알파벳" 좌표로 말해요.' },
      { title: '벌칙', body: '한 문제가 끝날 때마다 **오답 1개당 주사위 1개**를 자기 탑에 더 쌓아요. 탑이 무너지면 그 주민은 탈락해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**마지막까지 남은 주민이 속한 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '답하는 순서가 두 마을 주민이 번갈아 서는 방식이었다고 정리돼 있어요. 남은 바뀐 칸보다 차례가 많을 때 어떻게 되는지, 답하는 제한 시간은 확인하지 못했어요.',
      '이날 아침에도 두 마을이 주민 한 명씩을 맞바꾸는 주민 교환이 있었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '모자이크는 **기억 게임과 손재주 게임이 벌칙으로 연결된** 구조예요. 기억에서 틀리면 바로 탈락이 아니라 탑이 높아질 뿐이라, 실력 차가 있어도 탑을 잘 쌓는 사람은 오래 버텨요.' },
    { type: 'cards', items: [
      { title: '정답은 상대에게 정보가 돼요', body: '바뀐 칸은 정해진 개수만큼만 있고, 누가 하나를 맞히면 그 칸은 후보에서 빠져요. 두 마을이 번갈아 답하니 내가 맞힐수록 상대가 찾을 칸이 줄어 어려워지고, 반대로 앞사람이 맞힌 칸은 내 후보를 줄여 줘요. 순서의 앞뒤에 따라 유불리가 생겨요.' },
      { title: '10초를 나눠 외우기', body: '100칸을 10초에 다 외우기는 어려워요. 마을 안에서 구역을 나눠 각자 맡은 줄을 외우면, 바뀐 칸이 내 구역일 때 확실히 맞힐 수 있어요. 다만 답은 한 명씩 하니, 맡은 구역이 아닌 칸을 물을 때를 대비해 겹치는 구역도 필요해요.' },
      { title: '주사위는 체력이에요', body: '오답 하나는 주사위 하나예요. 이미 탑이 높은 주민은 모르는 칸이라도 찍는 것이 위험해지고, 탑이 낮은 주민은 과감하게 찍어도 돼요. 탑 높이에 따라 위험을 다르게 감수하는 판단이 필요해요.' },
    ], columns: 1 },
    { type: 'p', text: '바뀐 칸의 위치와 순서, 탑의 흔들림이 모두 변수라 **우월 전략은 없어요.** 마을 단위로 구역을 나눠 외우는 준비가 가장 큰 차이를 만들어요.' },
  ],
  similar: [
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '두 그림에서 같은(또는 다른) 부분을 남보다 빨리 찾아내는 관찰력 게임이에요.', differs: '기억할 필요 없이 두 카드를 동시에 보고 찾아요.' },
    { name: '메이크 앤 브레이크 (Make ’N’ Break)', players: '2–5명', alike: '나무 블록을 무너지지 않게 쌓는 손재주와, 그림을 정확히 보는 눈을 함께 써요.', differs: '카드의 그림대로 블록을 쌓는 시간 경쟁이고, 기억 요소가 없어요.' },
  ],
}, {
  meta: {
    title: 'Mosaic rules — The Society Game season 1, day 10 challenge',
    description: 'The rules of Mosaic (모자이크) from The Society Game season 1: first stack ten dice, a 100-cell picture with columns 1–10 and rows A–J shown for ten seconds, the number of changes announced, players naming changed cells in turn, one more die per wrong answer, and a collapsed tower means you are out.',
    keywords: ['Mosaic', 'The Society Game', 'spot the difference', '소사이어티 게임 모자이크'],
  },
  title: 'Mosaic — The Society Game season 1, day 10 challenge',
  name: 'Mosaic (모자이크)',
  lead: 'See a 100-cell picture for ten seconds, then find the changed cells by coordinate. Each wrong answer adds a die to your tower; topple it and you are out.',
  summary: 'Name the changed cells of a 100-cell picture you saw for ten seconds; every miss adds a die to your tower, and a collapse knocks you out.',
  setup: [
    { type: 'list', items: [
      '**Players**: every resident of both villages, individually.',
      '**Mosaic**: a **100-cell picture** with columns 1–10 and rows A–J.',
      '**Dice tower**: one per resident.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Warm-up', body: 'Everyone first stacks **ten dice**; the original is shown only when all are done.' },
      { title: 'Original', body: 'The picture is shown for **ten seconds**, and the number of cells that will change is announced.' },
      { title: 'Answers', body: 'The changed picture appears and residents **take turns** naming a changed cell by number and letter.' },
      { title: 'Penalty', body: 'After each problem, **one die per wrong answer** goes on your tower; if it collapses, you are out.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village of the last resident standing** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Residents of the two villages reportedly alternated in the answering order; what happens when turns outnumber the remaining changes, and the time to answer, could not be confirmed.',
      'That morning the villages swapped one resident each again.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Mosaic **links a memory game to a dexterity game through the penalty**. A memory slip does not knock you out, it raises your tower, so a steady stacker survives even with a weaker memory.' },
    { type: 'cards', items: [
      { title: 'Answers inform the opponent', body: 'There is a fixed number of changes and each correct answer removes one. With villages alternating, every cell you find leaves fewer for the next player, while a cell found before you narrows your own options. Position in the order matters.' },
      { title: 'Splitting ten seconds', body: 'Nobody memorises 100 cells in ten seconds. Dividing the picture into zones within a village makes answers certain when the change is in your zone, but since answers come one at a time, some overlap is needed.' },
      { title: 'Dice are hit points', body: 'Each miss is one die. A resident with a tall tower should not guess; one with a short tower can afford to. Risk should follow tower height.' },
    ], columns: 1 },
    { type: 'p', text: 'Positions, order and wobble are all variables, so **there is no dominant strategy**; dividing the picture by zones as a village is the biggest edge.' },
  ],
  similar: [
    { name: 'Dobble (Spot It!)', players: '2–8', alike: 'Spot what matches between pictures faster than anyone.', differs: 'Both cards are visible; no memory.' },
    { name: 'Make ’N’ Break', players: '2–5', alike: 'Steady hands with wooden blocks and a sharp eye for pictures.', differs: 'A timed copy-the-card building race with no memory element.' },
  ],
});

export const rollingWord = sg1Game('rolling-word', 'main', day(12), 10, ['hiddenWord', 'gyulhap', 'nemoCount'], {
  meta: {
    title: '롤링워드 규칙 — 소사이어티 게임 시즌1 12일차 챌린지, 삼각기둥을 돌려 세 글자 단어 만들기',
    description: '소사이어티 게임 시즌1 12일차 챌린지 롤링워드의 규칙을 정리했어요. 높동·마동 글자와 물음표가 적힌 삼각기둥 20개, 기둥을 돌리는 대표 2명, 회전판 위에서 고유 글자로 세 글자 단어 4개, 깃발 뒤 10초, 표준국어대사전 기준까지.',
    keywords: ['롤링워드', '롤링 워드', '소사이어티 게임 롤링워드', '소사이어티게임 시즌1', '소사이어티 게임 10화'],
  },
  title: '롤링워드 — 소사이어티 게임 시즌1 12일차 챌린지',
  name: '롤링워드',
  lead: '삼각기둥 20개의 면에는 높동 글자, 마동 글자, 물음표가 하나씩 있어요. 대표가 기둥을 돌려 자기 마을 글자를 보여 주면, 회전판 위의 주민들이 그 글자로 세 글자 단어 4개를 만들어요.',
  summary: '두 마을이 같은 삼각기둥을 서로 자기 글자 쪽으로 돌리며, 고유 글자 하나와 마을 글자 둘로 세 글자 단어 4개를 먼저 만드는 챌린지.',
  setup: [
    { type: 'list', items: [
      '**삼각기둥**: 20개. 세 면에 각각 **높동 글자 1개, 마동 글자 1개, 물음표**가 있어요.',
      '**기둥 돌리기 대표**: 마을마다 2명. 2교대로 자기 마을 글자가 잘 보이게 기둥을 돌려요.',
      '**단어 팀**: 나머지 주민은 돌아가는 회전판에 앉아요. 주민마다 **고유 글자 1개**를 받아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '단어 만들기', body: '내 고유 글자 1개와 **자기 마을 글자 2개**를 조합해 **세 글자 단어 4개**를 만들어요.' },
      { title: '답하기', body: '4개가 완성되면 깃발을 들고 **10초 안에 4개를 모두** 말해요.' },
      { title: '합류', body: '4개를 성공한 주민은 회전판에서 내려와 기둥 돌리기에 합류할 수 있어요.' },
      { title: '정보 전달', body: '회전판 위의 주민과 이야기를 나눌 수 있는 사람은 **기둥을 돌리는 주민뿐**이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '단어 만들기에 참여한 **모든 주민이 먼저 성공한 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
      '국립국어원 **표준국어대사전**에 오른 단어만 인정하고, 인명·외래어·외국어는 빼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '틀렸을 때 다시 도전하기까지의 제한, 고유 글자를 다른 주민에게 알려 줄 수 있는지는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
      '전날(11일차)은 비로 챌린지 없이 쉬었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '롤링워드의 핵심은 **기둥이 두 마을의 공용 자원**이라는 점이에요. 한 기둥을 내 마을 글자 쪽으로 돌리면 상대 글자는 가려지니, 글자 판 자체가 줄다리기 대상이에요.' },
    { type: 'cards', items: [
      { title: '보이는 글자가 곧 재료', body: '단어는 보이는 마을 글자로만 만들 수 있어요. 기둥 돌리기 대표가 많이, 오래 돌려 둘수록 우리 팀 재료가 늘고 상대 재료가 줄어요. 처음에는 신체 대표 둘의 싸움이지만, 단어를 끝낸 주민이 합류하면서 일손이 늘어나는 **눈덩이 구조**예요.' },
      { title: '먼저 끝낸 사람이 도우미가 돼요', body: '회전판 위에서는 서로 상의할 수 없고, 기둥을 돌리는 주민만 정보를 전할 수 있어요. 그러니 가장 빨리 끝낼 수 있는 주민이 먼저 성공해 내려오면, 밖에서 단어를 찾아 남은 주민에게 알려 주는 역할까지 맡아요. 초반 한두 명의 성공 속도가 전체를 좌우해요.' },
      { title: '10초 안에 4개', body: '깃발을 든 뒤에는 10초 안에 4개를 모두 말해야 해서, 3개만 확실하고 1개가 애매하면 시도할지 말지 고민이 생겨요. 사전 등재 여부를 모르는 단어는 위험해요.' },
    ], columns: 1 },
    { type: 'p', text: '어휘력과 협업 구조, 기둥 다툼이 함께 작용해 **우월 전략은 없어요.** 다만 "빨리 끝낼 사람을 먼저 끝내게 돕는" 순서 설계는 거의 늘 이득이에요.' },
  ],
  similar: [
    { name: '스크래블 (Scrabble)', players: '2–4명', alike: '주어진 글자를 조합해 사전에 있는 단어를 만들고, 사전이 판정 기준이에요.', differs: '판에 단어를 놓는 차례제 게임이고, 글자를 빼앗는 줄다리기가 없어요.' },
    { name: '바나나그램스 (Bananagrams)', players: '1–8명', alike: '자기 글자로 단어를 빨리 완성하는 속도 경쟁이에요.', differs: '각자 자기 글자 조각으로 십자말을 만들어요.' },
  ],
}, {
  meta: {
    title: 'Rolling Word rules — The Society Game season 1, day 12 challenge',
    description: 'The rules of Rolling Word (롤링워드) from The Society Game season 1: twenty triangular prisms with a Nopdong syllable, a Madong syllable and a question mark, two rotators per village, players on a turntable making four three-syllable words from their own syllable, ten seconds after the flag, and the Standard Korean Dictionary as judge.',
    keywords: ['Rolling Word', 'The Society Game', 'Korean word game', '소사이어티 게임 롤링워드'],
  },
  title: 'Rolling Word — The Society Game season 1, day 12 challenge',
  name: 'Rolling Word (롤링워드)',
  lead: 'Twenty triangular prisms each show a Nopdong syllable, a Madong syllable and a question mark. Rotators turn them to their village’s side, and players on a turntable build three-syllable words from what shows.',
  summary: 'Both villages turn the same prisms toward their own syllables while their players race to make four three-syllable words each.',
  setup: [
    { type: 'list', items: [
      '**Prisms**: twenty, each with **one Nopdong syllable, one Madong syllable and a question mark**.',
      '**Rotators**: two per village, in shifts, turning prisms to show their own syllables.',
      '**Word team**: everyone else sits on a rotating platform, each with **one personal syllable**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Making words', body: 'Combine your personal syllable with **two of your village’s syllables** into **four three-syllable words**.' },
      { title: 'Answering', body: 'Raise the flag and say **all four within ten seconds**.' },
      { title: 'Joining in', body: 'Those who succeed leave the platform and may help turn prisms.' },
      { title: 'Information', body: '**Only rotators** may talk to players on the platform.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village whose word-makers all succeed first** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
      'Only words in the National Institute of Korean Language’s **Standard Korean Dictionary** count; no names, loanwords or foreign words.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Limits on retrying after a miss, and whether players could reveal their personal syllable, are not in the written rules.',
      'The day before (day 11) was a rest day because of rain.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The key is that **the prisms are shared**: turning one to your syllable hides the other village’s, so the board itself is a tug of war.' },
    { type: 'cards', items: [
      { title: 'Visible syllables are ammunition', body: 'Words can use only syllables that are showing. The more your rotators turn and hold, the more material you have and the less they do. It starts as two against two but **snowballs** as finished players join the turning.' },
      { title: 'Early finishers become helpers', body: 'Platform players cannot confer; only rotators can pass on information. A fast player who finishes first can then hunt words outside and feed them in, so the first one or two successes shape everything.' },
      { title: 'Four in ten seconds', body: 'Once the flag is up all four must come within ten seconds, so three sure words and one doubtful one is a dilemma; a word you are not sure is in the dictionary is a risk.' },
    ], columns: 1 },
    { type: 'p', text: 'Vocabulary, the helper structure and the fight over prisms interact, so **there is no dominant strategy**; arranging for the fastest players to finish first is nearly always right.' },
  ],
  similar: [
    { name: 'Scrabble', players: '2–4', alike: 'Combine given letters into words the dictionary accepts.', differs: 'Turn-based placement on a board, with no tug of war over letters.' },
    { name: 'Bananagrams', players: '1–8', alike: 'Race to complete words from your own tiles.', differs: 'Each player builds a private crossword.' },
  ],
});

export const wringingLaundry = sg1Game('wringing-laundry', 'main', day(13), 11, ['magicswap', 'equationTower', 'sudoku'], {
  meta: {
    title: '빨래 짜기 규칙 — 소사이어티 게임 시즌1 13일차 챌린지, 물을 옮겨 비밀번호를 얻고 수식 퍼즐',
    description: '소사이어티 게임 시즌1 13일차 챌린지 빨래 짜기의 규칙을 정리했어요. 수건으로 공동 수조의 물을 팀 수조로 옮기는 대표 2명, 나무 큐브 속 비밀번호, 숫자 타일로 수식을 성립시키는 수식 퍼즐, 깃발로 확인, 전원이 먼저 완성하는 마을이 승리까지.',
    keywords: ['빨래 짜기', '소사이어티 게임 빨래 짜기', '수식 퍼즐', '소사이어티게임 시즌1', '소사이어티 게임 11화'],
  },
  title: '빨래 짜기 — 소사이어티 게임 시즌1 13일차 챌린지',
  name: '빨래 짜기',
  lead: '두 사람이 수건을 적셔 짜며 물을 옮겨 팀 수조를 채워요. 수조 속 큐브에 적힌 비밀번호로 상자를 열면, 나머지 주민 모두가 숫자 타일로 수식 퍼즐을 맞춰요.',
  summary: '수건으로 물을 옮겨 얻은 비밀번호로 퍼즐 상자를 열고, 전원이 수식 퍼즐을 먼저 완성하는 마을이 이기는 챌린지.',
  setup: [
    { type: 'list', items: [
      '**빨래 대표**: 마을마다 2명. 수건, 두 마을이 함께 쓰는 **공동 수조**, 마을마다 **팀 수조**.',
      '**퍼즐 팀**: 나머지 주민. 자물쇠로 잠긴 상자 안에 **수식 퍼즐 판과 숫자 타일**이 들어 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '물 옮기기', body: '빨래 대표가 수건을 공동 수조에 적셔 팀 수조에 짜기를 되풀이해요.' },
      { title: '비밀번호', body: '팀 수조의 물이 차면 그 안의 **나무 큐브**를 건져 비밀번호를 확인하고, 퍼즐 팀에게 **소리 내어** 알려요.' },
      { title: '수식 퍼즐', body: '퍼즐 팀은 비밀번호로 상자를 열고, 숫자 타일을 판에 놓아 **수식이 모두 성립하도록** 맞춰요.' },
      { title: '확인', body: '퍼즐을 완성한 주민은 깃발을 들어 정답인지 확인받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**모든 주민이 수식 퍼즐을 먼저 완성한 마을**이 이겨요.',
      '이긴 마을은 상금 1,000만 원과 블랙리스트 작성권을, 진 마을은 탈락자 한 명을 내야 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '옮기던 수건을 바닥에 떨어뜨리는 등 이물질이 묻으면 **씻은 뒤에** 써야 해요.',
      '정리된 자료의 예시를 보면 퍼즐은 3×3 칸에 숫자를 넣어 가로 세 줄과 세로 세 줄의 사칙연산 식이 모두 맞게 만드는 형태였어요. 주민마다 문제가 같았는지는 확인하지 못했어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '빨래 짜기는 **신체 단계가 두뇌 단계의 출발 신호**인 구조예요. 비밀번호가 나오기 전까지 퍼즐 팀은 아무것도 할 수 없으니, 물을 옮기는 속도가 곧 퍼즐에 주어지는 출발 시점이에요.' },
    { type: 'cards', items: [
      { title: '공동 수조는 경쟁 자원', body: '두 마을이 같은 수조에서 물을 퍼 가요. 한 번에 더 많은 물을 옮기는 방법(수건을 크게 쓰거나, 짜는 사람과 나르는 사람을 나누는 식)을 찾는 쪽이 빨리 끝내요. 수건을 떨어뜨리면 씻어야 하니, 서두르다 생기는 실수가 그대로 시간 손해예요.' },
      { title: '수식 퍼즐은 제약 퍼즐이에요', body: '가로·세로 식이 모두 맞아야 하니 한 칸을 정하면 이웃 칸이 정해지는 스도쿠 같은 제약 풀이예요. 가장 큰 수와 가장 작은 수가 들어갈 수 있는 자리부터 좁히면 빨라요. 예를 들어 "A − B = C"에서 가장 큰 수는 B나 C 자리에 올 수 없어요.' },
      { title: '가장 느린 한 명', body: '전원이 완성해야 하니 마을의 기록은 퍼즐을 가장 늦게 푸는 사람의 시간이에요. 먼저 푼 사람이 도와줄 수 있는지가 규칙에 없으니, 약한 주민의 풀이 순서를 미리 연습해 두는 것이 가장 확실한 대비예요.' },
    ], columns: 1 },
    { type: 'p', text: '물 옮기기는 체력과 요령, 퍼즐은 논리력이라 **우월 전략은 없어요.** 다만 퍼즐은 운이 없는 순수 논리라, 연습량이 그대로 시간으로 나타나요.' },
  ],
  similar: [
    { name: '이퀘이트 (Equate)', players: '2–4명', alike: '숫자와 연산 타일로 판 위에 성립하는 수식을 만들어요.', differs: '스크래블처럼 점수를 겨루는 차례제 게임이고, 정해진 답이 하나인 퍼즐이 아니에요.' },
    { name: '매스 다이스 (Math Dice)', players: '1명 이상', alike: '주어진 숫자를 사칙연산으로 엮어 목표 식을 만드는 계산 퍼즐이에요.', differs: '주사위로 숫자를 정하고, 칸이 맞물리는 제약이 없어요.' },
  ],
}, {
  meta: {
    title: 'Wringing Laundry rules — The Society Game season 1, day 13 challenge',
    description: 'The rules of Wringing Laundry (빨래 짜기) from The Society Game season 1: two players moving water from a shared tank to their team tank with towels, a password in a wooden cube, an equation puzzle with number tiles, checking by flag, and the village whose players all finish first wins.',
    keywords: ['Wringing Laundry', 'The Society Game', 'equation puzzle', '소사이어티 게임 빨래 짜기'],
  },
  title: 'Wringing Laundry — The Society Game season 1, day 13 challenge',
  name: 'Wringing Laundry (빨래 짜기)',
  lead: 'Two players soak and wring towels to fill their team tank; the password in a cube at the bottom opens a box, and everyone else solves an equation puzzle with number tiles.',
  summary: 'Move water with towels to win a password, open the puzzle box, and race for every player to complete the equation puzzle.',
  setup: [
    { type: 'list', items: [
      '**Wringers**: two per village, with towels, a **shared tank** and a **team tank** each.',
      '**Puzzle team**: everyone else; a padlocked box holds an **equation board and number tiles**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Moving water', body: 'Wringers soak towels in the shared tank and wring them into their team tank, again and again.' },
      { title: 'Password', body: 'When the team tank is full they fish out a **wooden cube**, read the password and **call it out** to the puzzle team.' },
      { title: 'Equation puzzle', body: 'The puzzle team opens the box and places number tiles so that **every equation holds**.' },
      { title: 'Check', body: 'A player who finishes raises a flag to have it checked.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The village where every player completes the puzzle first** wins.',
      'The winners take ₩10 million and the blacklist; the losers must eliminate a resident.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A towel dropped on the floor or otherwise soiled must be **washed before use**.',
      'The written account’s example shows a 3×3 grid where three rows and three columns of arithmetic must all hold; whether every player had the same puzzle could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The body stage is **the starting gun for the brain stage**: until the password arrives the puzzlers can do nothing, so the water sets their start time.' },
    { type: 'cards', items: [
      { title: 'A shared tank', body: 'Both villages draw from the same tank. Whoever finds a way to move more water per trip (bigger towels, splitting wringing from carrying) finishes sooner; a dropped towel must be washed, so haste costs time.' },
      { title: 'A constraint puzzle', body: 'Rows and columns must all hold, so fixing one cell fixes its neighbours, as in sudoku. Narrow where the largest and smallest tiles can go first: in "A − B = C", for instance, the largest number cannot be B or C.' },
      { title: 'The slowest solver', body: 'Everyone must finish, so the village’s time is its slowest solver’s. Nothing says finishers may help, so drilling the weakest solver is the surest preparation.' },
    ], columns: 1 },
    { type: 'p', text: 'Water is stamina and knack, the puzzle pure logic, so **there is no dominant strategy**; with no luck in the puzzle, practice shows directly in the time.' },
  ],
  similar: [
    { name: 'Equate', players: '2–4', alike: 'Build valid equations on a board from number and operator tiles.', differs: 'A Scrabble-style scoring game, not a puzzle with one answer.' },
    { name: 'Math Dice', players: '1+', alike: 'Combine given numbers with arithmetic to hit a target.', differs: 'Numbers come from dice and there are no interlocking cells.' },
  ],
});
