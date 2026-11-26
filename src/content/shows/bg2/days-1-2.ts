// 피의 게임2, days 1–2: 선착순, 정글 메이즈, 오름차순, 컬러턴.
import { bg2Game, day } from './shared';

export const firstCome = bg2Game('first-come', 'money', day('1'), ['1'], ['nemoCount', 'equationTower', 'hexagon'], {
  meta: {
    title: '선착순 규칙 — 피의 게임2 1일차 머니 챌린지, 자물쇠를 풀고 저택까지 달리기',
    description: '피의 게임2 1일차 머니 챌린지 선착순의 규칙을 정리했어요. 안대와 밧줄로 묶인 11명, 화면 속 문제의 답이 자물쇠 비밀번호, 정글을 빠져나와 피의 저택에 먼저 도착하기, 1등의 상금·면제권과 꼴찌의 지목까지.',
    keywords: ['선착순', '피의 게임2 선착순', '피의게임2 머니 챌린지', '피의 게임 시즌2', '피의게임2'],
  },
  title: '선착순 — 피의 게임2 1일차 머니 챌린지',
  name: '선착순',
  lead: '정글 한가운데 의자에 묶인 채 시작해요. 문제를 풀어 자물쇠를 열고, 피의 저택에 가장 먼저 들어가면 이겨요.',
  summary: '문제의 답으로 자물쇠를 풀고 정글을 빠져나와 저택에 먼저 도착하는 레이스.',
  setup: [
    { type: 'list', items: [
      '**인원**: 11명.',
      '**구속**: 안대를 쓰고 의자에 밧줄과 자물쇠로 묶인 상태.',
      '**문제**: 화면에 나오는 숫자 문제. 정답이 자물쇠 비밀번호예요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '시작', body: '신호와 함께 안대를 벗고 화면의 문제를 봐요.' },
      { title: '풀기', body: '문제에서 비밀번호를 찾아 자물쇠를 열어요.' },
      { title: '달리기', body: '정글을 빠져나와 피의 저택으로 이동해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**1등**은 머니 챌린지 상금과 탈락 면제권 1장, 판도라의 상자를 열 기회를 얻어요.',
      '**11등**은 최하위 탈락후보가 되어 1등이 아닌 두 사람을 지목하고, 투표로 고른 한 명과 데스매치(정글 메이즈)를 치러요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '돈을 챙기는 선택이 있던 피의 게임3의 선착순과 달리, 여기서는 순서만 따져요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임은 **문제 풀이 속도**가 거의 전부예요. 보상이 1등과 꼴찌에만 걸려 있어서, 실제로는 "꼴찌만 피하자"가 대부분의 사람에게 합리적인 목표가 돼요.' },
    { type: 'cards', items: [
      { title: '첫날의 정보', body: '아직 서로를 모르는 첫날이라, 누가 빨리 풀었는지가 이후 동맹을 고를 때 첫 정보가 돼요. 늦게 도착한 사람은 데스매치 상대를 지목해야 하므로, 도착하는 동안 누가 자신에게 우호적인지 판단할 시간도 없어요.' },
      { title: '혼자 푸는 문제', body: '모두 같은 화면을 보므로, 먼저 푼 사람이 답을 외쳐 주면 남들도 바로 풀 수 있어요. 숨길지 알려 줄지는 그 사람의 선택이고, 공개하면 꼴찌 경쟁만 남아요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '언락! (Unlock!)', players: '1–6명', alike: '퍼즐을 풀어 나온 숫자로 자물쇠를 여는 방탈출 게임이에요.', differs: '언락은 협력해서 함께 탈출해요.' },
    { name: '이스케이프: 저주받은 사원 (Escape: The Curse of the Temple)', players: '1–5명', alike: '제한된 시간 안에 사원을 빠져나가는 실시간 탈출 레이스예요.', differs: '이스케이프는 주사위를 굴리는 협력 게임이고, 순위가 없어요.' },
  ],
}, {
  meta: {
    title: 'First Come rules — The Bloody Game 2, day 1 money challenge',
    description: 'The rules of First Come (선착순) from The Bloody Game 2: eleven players blindfolded and tied to chairs, a puzzle whose answer opens the lock, the run out of the jungle to the mansion, and the stakes for first and last.',
    keywords: ['First Come', 'Bloody Game 2', 'Bloody Game 2 money challenge'],
  },
  title: 'First Come — The Bloody Game 2, day 1 money challenge',
  name: 'First Come (선착순)',
  lead: 'Start tied to a chair in the jungle. Solve the puzzle to open the lock, and be first into the mansion.',
  summary: 'Solve a puzzle to unlock yourself and race out of the jungle to the mansion.',
  setup: [
    { type: 'list', items: [
      '**Players**: eleven.',
      '**Restraints**: blindfolded and tied to a chair with a rope and padlock.',
      '**Puzzle**: a number puzzle on screen whose answer is the lock code.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Start', body: 'On the signal, remove the blindfold and look at the screen.' },
      { title: 'Solve', body: 'Find the code and open the lock.' },
      { title: 'Run', body: 'Leave the jungle and head for the mansion.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**First** gets the prize money, an immunity pass and the chance to open Pandora’s box.',
      '**Last** becomes the candidate, names two players other than the winner, and plays the death match (Jungle Maze) against the one voted in.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Unlike season 3’s First Come, there is no money to grab; only the order counts.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is almost purely **solving speed**. Only first and last carry stakes, so for most players "just do not be last" is the sensible aim.' },
    { type: 'cards', items: [
      { title: 'Day-one information', body: 'On the first day, who solved fast is the first clue for choosing allies. The last to arrive must nominate opponents with no time to learn who is friendly.' },
      { title: 'A shared screen', body: 'Everyone sees the same puzzle, so a solver who shouts the answer frees everyone; keeping it quiet or not is a choice, and sharing leaves only the race for last.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Unlock!', players: '1–6', alike: 'Puzzles produce numbers that open locks.', differs: 'It is cooperative.' },
    { name: 'Escape: The Curse of the Temple', players: '1–5', alike: 'A real-time race to get out before time runs out.', differs: 'It is a cooperative dice game with no ranking.' },
  ],
});

export const jungleMaze = bg2Game('jungle-maze', 'death', { ko: '1·7일차, 파이널 최종 라운드', en: 'Days 1 and 7, final round' }, ['1', '7', '11'], ['wallgo', 'wallgo2', 'monorail'], {
  meta: {
    title: '정글 메이즈 규칙 — 피의 게임2 데스매치·파이널, 미로 타일을 밀어 목표물 찾기',
    description: '피의 게임2 1·7일차 데스매치이자 파이널 최종 라운드인 정글 메이즈의 규칙을 정리했어요. 고정 타일 16개와 움직이는 타일 33개, 여분 타일 밀어넣기, 되돌리기 금지, 길이 이어진 곳까지 이동, 목표물 네 개를 찾고 출발점으로 돌아오기까지.',
    keywords: ['정글 메이즈', '피의 게임2 정글 메이즈', '피의게임2 데스매치', '라비린스 보드게임', '피의게임2'],
  },
  title: '정글 메이즈 — 피의 게임2 데스매치·파이널',
  name: '정글 메이즈',
  lead: '판 가장자리에서 여분의 타일을 밀어 넣어 미로를 바꾸고, 열린 길로 말을 움직여 목표물을 찾아요. 네 개를 찾고 출발점에 먼저 돌아오면 이겨요.',
  summary: '미로 타일을 밀어 길을 바꾸며 목표물 네 개를 먼저 찾는 1:1 게임. 데스매치로 두 번, 파이널 최종 라운드로 한 번 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**미로판**: 고정된 미로 타일 16개와 움직일 수 있는 미로 타일 33개(판 위 32개와 여분 1개로 보여요).',
      '**목표 카드**: 각자 4장. 공개된 카드의 상징이 지금의 목표물이에요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '타일 밀기', body: '판 가장자리 화살표 자리에서 여분 타일을 밀어 넣어 한 줄을 움직여요. 반대쪽으로 밀려 나온 타일이 다음 여분이 돼요. **직전 차례에 밀려 나온 타일을 나온 자리에 바로 다시 넣을 수는 없어요**(직전 상태로 되돌리기 금지).' },
      { title: '말 이동', body: '그다음 길이 이어진 곳이라면 어디든 말을 옮길 수 있어요. 움직이지 않아도 돼요.' },
      { title: '목표', body: '목표물에 닿으면 그 카드를 회수하고, 다음 카드의 상징이 새 목표물이 돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '목표물 네 개를 모두 찾고 **자기 출발점으로 먼저 돌아온 사람**이 이겨요. 데스매치에서는 진 사람이 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '타일을 미는 것은 반드시 해야 하는 행동이에요. 말 이동만 선택 사항이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '정글 메이즈는 보드게임 라비린스의 1:1 판이에요. 내 길을 여는 것과 **상대의 길을 끊는 것**이 같은 한 번의 밀기로 이뤄지는 게 핵심이에요.' },
    { type: 'cards', items: [
      { title: '한 번의 밀기, 두 가지 효과', body: '한 줄을 밀면 그 줄에 있는 말도 함께 밀려 가요. 그래서 내 목표물까지 길을 이으면서 상대 말을 엉뚱한 곳으로 보내는 수가 가장 좋아요. 목표물을 숨긴 공개 카드가 서로 보인다면, 상대의 목표물 주변 줄을 흔드는 것이 강력한 방해가 돼요.' },
      { title: '되돌리기 금지의 의미', body: '상대가 방금 밀어 낸 타일을 그대로 되돌릴 수 없으므로, 상대의 수를 단순히 취소할 수 없어요. 상대가 만든 미로를 기준으로 다음 수를 계산해야 해, 미로의 변화를 머릿속으로 미리 그려 보는 공간 지각력이 승패를 갈라요.' },
      { title: '마지막 귀환', body: '목표물 네 개를 찾아도 출발점으로 돌아와야 끝나요. 출발점은 고정된 자리라 상대가 그 주변을 막기 쉬워서, 막판에는 귀환 경로를 지키는 싸움이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '타일과 목표 순서에 운이 섞여 **우월 전략은 없어요.** 다만 "내 길 + 상대 방해"를 동시에 만드는 수를 찾는 계산량이 승부를 정해요.' },
  ],
  similar: [
    { name: '라비린스 (Das verrückte Labyrinth)', players: '2–4명', alike: '여분 타일을 밀어 넣어 미로를 바꾸고, 목표 카드의 보물을 찾아 출발점으로 돌아오는 바로 그 규칙이에요.', differs: '라비린스는 보통 3–4명이 하고 목표 카드가 더 많아요.' },
    { name: '카루바 (Karuba)', players: '1–4명', alike: '길 타일로 탐험가에서 사원까지 길을 이어요.', differs: '카루바는 모두 같은 타일을 자기 판에 놓는 경쟁이라 상대 길을 바꿀 수 없어요.' },
  ],
}, {
  meta: {
    title: 'Jungle Maze rules — The Bloody Game 2 death match and final',
    description: 'The rules of Jungle Maze (정글 메이즈) from The Bloody Game 2: 16 fixed and 33 movable maze tiles, pushing in the spare tile, no undoing the last push, moving anywhere the path connects, and finding four targets before returning home.',
    keywords: ['Jungle Maze', 'Bloody Game 2 death match', 'Labyrinth board game', '피의 게임2 정글 메이즈'],
  },
  title: 'Jungle Maze — The Bloody Game 2 death match and final',
  name: 'Jungle Maze (정글 메이즈)',
  lead: 'Push the spare tile into the edge of the maze to shift a row, then move along open paths to your target. Find four and get home first.',
  summary: 'A one-on-one maze-shifting race to four targets: twice a death match, then the final round.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one.',
      '**Maze**: 16 fixed and 33 movable tiles (apparently 32 on the board and one spare).',
      '**Target cards**: four each; the face-up card shows your current target.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Push', body: 'Slide the spare tile in at an arrow on the edge, shifting a row; the tile pushed out becomes the next spare. **You cannot push the tile just pushed out straight back where it came from.**' },
      { title: 'Move', body: 'Then move your piece anywhere the path connects, or stay.' },
      { title: 'Target', body: 'Reach the target and collect its card; the next card’s symbol becomes your target.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first to find all four targets and **get back to their own start** wins; in a death match the loser is out.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Pushing is compulsory; only moving is optional.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Jungle Maze is a one-on-one Labyrinth. The key is that **opening your path and cutting your opponent’s** happen in the same push.' },
    { type: 'cards', items: [
      { title: 'One push, two effects', body: 'A pushed row carries any piece on it, so the best move connects you to your target while shoving the rival somewhere useless. If target cards are visible, shaking the rows around the rival’s target is strong interference.' },
      { title: 'No undo', body: 'You cannot simply reverse the rival’s last push, so each move must be planned on the maze they left you; picturing the shifted maze in your head decides games.' },
      { title: 'Getting home', body: 'Four targets are not enough: you must return to a fixed start, which is easy to block, so the end becomes a fight over the way home.' },
    ], columns: 1 },
    { type: 'p', text: 'Tiles and target order add luck, so **there is no dominant strategy**; the volume of calculation needed to find "my path plus your obstruction" decides it.' },
  ],
  similar: [
    { name: 'Labyrinth (Das verrückte Labyrinth)', players: '2–4', alike: 'Push a spare tile to shift the maze, collect treasures from target cards and return home: the same rules.', differs: 'It is usually played by 3–4 with more target cards.' },
    { name: 'Karuba', players: '1–4', alike: 'Path tiles connect explorers to temples.', differs: 'Everyone builds their own board with the same tiles, so you cannot change a rival’s paths.' },
  ],
});

export const ascending = bg2Game('ascending-order', 'money', day('2'), ['2'], ['magicswap', 'equationTower', 'nemoCount'], {
  meta: {
    title: '오름차순 규칙 — 피의 게임2 2일차 머니 챌린지, 남이 부른 숫자로 오름차순 만들기',
    description: '피의 게임2 2일차 머니 챌린지 오름차순의 규칙을 정리했어요. 순서 결정권 비공개 경매(홀수·짝수 순번), 랜덤 숫자 하나와 9명이 차례로 부르는 숫자, 10칸 시트, 같은 숫자도 인정되는 가장 긴 오름차순, 2라운드 누적 점수까지.',
    keywords: ['오름차순', '피의 게임2 오름차순', '피의게임2 2일차', '피의게임2 머니 챌린지', '피의게임2'],
  },
  title: '오름차순 — 피의 게임2 2일차 머니 챌린지',
  name: '오름차순',
  lead: '모두가 부른 숫자를 각자 10칸 시트의 빈칸에 적어, 가장 길게 이어지는 오름차순을 만들어요. 숫자는 남이 부르지만 어느 칸에 쓸지는 내가 정해요.',
  summary: '9명이 차례로 부르는 숫자를 10칸에 배치해 오름차순을 길게 잇는 2라운드 게임. 부르는 순서를 경매로 사요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 9명.',
      '**시트**: 각자 10칸.',
      '**숫자**: 1–10.',
      '**라운드**: 2라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '순서 경매', body: '라운드마다 30분 동안 딜러룸에서 비공개로 입찰해요. 1위는 홀수 순번(1·3·5·7·9번)에 누구를 넣을지, 2위는 짝수 순번(2·4·6·8번)을 정해요. 낙찰자는 공개되지만 금액은 비공개예요.' },
      { title: '랜덤 숫자', body: '순서대로 딜러룸에 들어가 1–10 중 랜덤 숫자 하나를 받아요. 이 숫자는 자기 시트의 해당 칸에 자동으로 적혀요.' },
      { title: '숫자 선언', body: '다시 1번부터 한 사람씩 1–10 중 숫자 하나를 선언해요(이미 나온 숫자도 괜찮아요). 모든 사람이 그 숫자를 자기 시트의 빈칸 중 원하는 곳에 적어요.' },
      { title: '라운드 종료', body: '9명이 모두 선언해 시트 10칸이 차면 끝나요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '시트에서 **오름차순으로 이어진 가장 긴 구간의 칸 수**가 그 라운드 점수예요. 같은 숫자가 이어지는 것도 오름차순으로 인정해요.',
      '2라운드 누적 1위가 우승해 탈락 면제권과 개인자금 2,000만 원(이 날은 판도라의 상자 열쇠도)을 받고, 최하위는 탈락후보가 되어 두 사람을 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '랜덤 숫자는 "해당 칸"에 자동 기입돼요. 즉 숫자 n은 n번째 칸에 들어가는 것으로 보여요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '모든 사람이 **같은 숫자열**을 받는 게임이에요. 다른 건 랜덤 숫자 하나와, 숫자를 어느 칸에 적느냐 하는 결정뿐이에요.' },
    { type: 'cards', items: [
      { title: '칸 배치의 원칙', body: '10칸에 1–10이 들어가니, 숫자 n을 n번째 칸 근처에 두는 것이 기본이에요. 그래야 나중에 어떤 숫자가 와도 들어갈 자리가 남아요. 같은 숫자가 반복되면 이웃 칸에 나란히 적어 길이를 늘릴 수 있어요.' },
      { title: '부르는 사람이 판을 흔든다', body: '내 차례에 부르는 숫자는 모두의 시트에 들어가요. 내 시트에 꼭 필요한 숫자를 부르면 남들에게도 같은 숫자가 가지만, 남들의 빈칸은 각자 달라서 효과는 달라요. 경쟁자의 시트가 어떤지 짐작할 수 있다면, 그 사람에게만 곤란한 숫자를 부를 수 있어요.' },
      { title: '순서 경매의 가치', body: '마지막 순번은 남은 칸을 보고 숫자를 부를 수 있어서 가장 유리해요. 1위 낙찰자는 홀수 순번 다섯 자리를 배정하니, 자신과 동맹을 9번 같은 좋은 자리에 넣고 경쟁자를 앞쪽에 둘 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '모두가 같은 정보로 시작해 **우월 전략은 없어요.** 랜덤 숫자의 차이와 부르는 숫자의 선택, 그리고 경매로 산 순서가 점수 차이를 만들어요.' },
  ],
  similar: [
    { name: '웰컴 투 (Welcome To...)', players: '1–100명', alike: '모두 같은 숫자를 받아 각자 시트의 빈칸에 오름차순이 되도록 적는 롤 앤 라이트예요.', differs: '웰컴 투는 세 거리의 집 번호를 채우고, 수영장·공원 같은 추가 득점이 있어요.' },
    { name: '젝스 님트 (6 nimmt!)', players: '2–10명', alike: '숫자를 오름차순 줄에 이어 붙이는 것이 핵심이에요.', differs: '젝스 님트는 공용 줄에 카드를 내고, 여섯 번째 카드를 놓은 사람이 벌점을 가져가요.' },
  ],
}, {
  meta: {
    title: 'Ascending Order rules — The Bloody Game 2, day 2 money challenge',
    description: 'The rules of Ascending Order (오름차순) from The Bloody Game 2: a sealed auction for the calling order, one random number plus nine called numbers, a ten-cell sheet, the longest run counting equal numbers, and two rounds.',
    keywords: ['Ascending Order', 'Bloody Game 2 money challenge', '피의 게임2 오름차순'],
  },
  title: 'Ascending Order — The Bloody Game 2, day 2 money challenge',
  name: 'Ascending Order (오름차순)',
  lead: 'Everyone writes every called number into an empty cell of their own ten-cell sheet, aiming for the longest ascending run. Others call the numbers; you choose the cells.',
  summary: 'Place nine called numbers in ten cells to build the longest ascending run, over two rounds; the calling order is auctioned.',
  setup: [
    { type: 'list', items: [
      '**Players**: nine.',
      '**Sheet**: ten cells each.',
      '**Numbers**: 1–10.',
      '**Rounds**: two.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Order auction', body: 'Each round, 30 minutes of sealed bids in the dealer room. The top bidder fills the odd positions (1, 3, 5, 7, 9), the second the even ones; winners are named, amounts are not.' },
      { title: 'Random number', body: 'In order, each player gets one random number from 1–10, written automatically in its matching cell.' },
      { title: 'Calls', body: 'From player 1, each calls a number from 1–10 (repeats allowed), and everyone writes it in any empty cell.' },
      { title: 'End of round', body: 'When all nine have called, the sheets are full.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Your score is **the length of your longest ascending run**; equal numbers in a row count as ascending.',
      'The two-round leader wins immunity and ₩20 million (that day also Pandora’s key); last place becomes the candidate and names two players.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The random number goes in "its" cell automatically, which appears to mean number n in cell n.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Everyone receives **the same sequence**; only the random number and where you write each number differ.' },
    { type: 'cards', items: [
      { title: 'Where to write', body: 'Ten cells for 1–10 means putting n near cell n keeps room for whatever comes. Repeated numbers can sit side by side to lengthen a run.' },
      { title: 'Callers shape the board', body: 'What you call goes on every sheet, but everyone’s empty cells differ, so the same number helps people differently; if you can guess a rival’s sheet, you can call what hurts only them.' },
      { title: 'The value of order', body: 'The last caller sees the board and calls accordingly, the best seat. The top bidder assigns five odd seats, so can put themselves and allies in spots like 9th and rivals early.' },
    ], columns: 1 },
    { type: 'p', text: 'All start with the same information, so **there is no dominant strategy**; the random number, the calls and the bought order make the difference.' },
  ],
  similar: [
    { name: 'Welcome To...', players: '1–100', alike: 'Everyone gets the same numbers and writes them in ascending order on their own sheet.', differs: 'It fills three streets of house numbers with pools, parks and other bonuses.' },
    { name: '6 nimmt!', players: '2–10', alike: 'Extending ascending rows of numbers is the core.', differs: 'Cards go to shared rows and whoever places the sixth card takes penalty points.' },
  ],
});

export const colorTurn = bg2Game('color-turn', 'death', { ko: '2일차, 파이널 1라운드', en: 'Day 2, final round 1' }, ['2', '11'], ['flipOmok', 'blindGomoku', 'pointOmok'], {
  meta: {
    title: '컬러턴 규칙 — 피의 게임2 데스매치·파이널, 색이 바뀌는 지뢰가 숨은 사목',
    description: '피의 게임2 2일차 데스매치이자 파이널 1라운드인 컬러턴의 규칙을 정리했어요. 6×6판, 흑·백 칩 7개씩, 내 앞줄에만 놓기와 아무 칩이나 옮기기, 직전 수의 칩 금지, 줄마다 3개씩 숨은 지뢰 18개, 내 색으로 4개를 잇는 승리 조건까지.',
    keywords: ['컬러턴', '피의 게임2 컬러턴', '피의게임2 데스매치', '지뢰 사목', '피의게임2'],
  },
  title: '컬러턴 — 피의 게임2 데스매치·파이널',
  name: '컬러턴',
  lead: '칩을 놓거나 옮겨 내 색 네 개를 한 줄로 잇는 사목인데, 판의 절반이 칩의 색을 뒤집는 지뢰예요. 지뢰 위치는 암기해야 해요.',
  summary: '지뢰를 밟은 칩은 색이 바뀌는 6×6 사목. 상대 칩도 옮길 수 있어요. 데스매치와 파이널 1라운드에 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**판**: 6×6(A1–F6).',
      '**칩**: 각자 검정 또는 하양 7개.',
      '**지뢰**: 플레이어가 바라보는 방향으로 가로 한 줄에 3개씩, 모두 18개가 숨어 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '차례', body: '번갈아 둘 중 하나를 해요.' },
      { title: '배치', body: '아직 놓지 않은 내 칩 하나를 **내 바로 앞 첫 줄**에만 놓아요.' },
      { title: '이동', body: '**색과 상관없이** 판 위의 칩 하나를 주변 8칸 중 빈칸으로 옮겨요. 단, 상대가 직전 차례에 움직인 칩은 고를 수 없어요.' },
      { title: '지뢰', body: '지뢰가 있는 칸에 칩이 들어가면 그 칩의 색이 바뀌어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**자기 색 칩 4개**를 가로·세로·대각선 한 줄로 먼저 이으면 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '이어야 하는 것은 판 위의 "내 색" 칩이에요. 내가 처음 놓은 칩인지는 상관없어요. 색이 바뀐 상대 칩도 내 줄이 돼요.',
      '데스매치 키워드로 암기력과 상황 판단 능력이 제시됐어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '컬러턴은 **누구의 칩이냐가 아니라 지금 무슨 색이냐**로 승부가 나요. 지뢰가 색을 바꾸고, 아무 칩이나 옮길 수 있으니 판 위의 모든 칩이 공용 자원이에요.' },
    { type: 'cards', items: [
      { title: '지뢰는 18칸, 판의 절반', body: '36칸 중 18칸이 지뢰라, 칩을 옮길 때마다 색이 바뀔 확률이 높아요. 지뢰 위치를 기억하는 사람은 상대 칩을 지뢰로 밀어 내 색으로 만들 수 있어요. 어떤 칸이 지뢰였는지는 칩이 들어갈 때마다 드러나므로, 게임이 진행될수록 지도가 완성돼요.' },
      { title: '상대 칩을 움직이는 수', body: '이동은 색을 가리지 않으므로, 상대의 위협 줄에서 칩 하나를 빼내거나 지뢰로 보내 색을 바꾸는 것이 가장 강한 수비예요. 직전에 움직인 칩만 못 건드리므로, 상대가 방금 옮긴 칩으로 만든 위협은 한 턴 동안 지켜져요.' },
      { title: '배치는 내 앞줄에만', body: '새 칩은 앞줄에만 들어오니 판 깊숙한 곳은 이동으로만 닿아요. 일곱 개를 일찍 다 놓기보다 남겨 두면, 필요할 때 앞줄에 새 위협을 만드는 카드로 쓸 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '지뢰 위치가 정보 싸움을 만들기 때문에 **우월 전략은 없어요.** 규칙상 "내 색으로 잇기"가 목표라는 점을 정확히 이해하는 것부터가 출발이에요.' },
  ],
  similar: [
    { name: '사목 (Connect Four)', players: '2명', alike: '내 색 네 개를 가로·세로·대각선으로 먼저 잇는 목표가 같아요.', differs: '사목은 칩을 떨어뜨려 쌓기만 하고, 옮기거나 색이 바뀌는 일이 없어요.' },
    { name: '스트라테고 (Stratego)', players: '2명', alike: '숨겨진 위험(폭탄)이 있는 판에서 기억과 추리로 말을 움직여요.', differs: '스트라테고는 말의 계급을 숨기고 상대 깃발을 잡는 전쟁 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Color Turn rules — The Bloody Game 2 death match and final',
    description: 'The rules of Color Turn (컬러턴) from The Bloody Game 2: a 6×6 board, seven black or white chips each, placing only on your front row or moving any chip, the last-moved chip rule, eighteen hidden mines that flip colour, and four of your colour in a row.',
    keywords: ['Color Turn', 'Bloody Game 2 death match', 'connect four with mines', '피의 게임2 컬러턴'],
  },
  title: 'Color Turn — The Bloody Game 2 death match and final',
  name: 'Color Turn (컬러턴)',
  lead: 'Place or move chips to line up four of your colour — but half the board is mines that flip a chip’s colour, and you have to remember where they are.',
  summary: 'Connect four on a 6×6 board where mines flip chips and either player may move any chip: a death match and final round 1.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one.',
      '**Board**: 6×6 (A1–F6).',
      '**Chips**: seven black or seven white each.',
      '**Mines**: three hidden in every row (as seen by the players), eighteen in all.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Turn', body: 'Players alternate, doing one of two things.' },
      { title: 'Place', body: 'Put one of your unplaced chips on **the row directly in front of you**.' },
      { title: 'Move', body: 'Move **any chip, either colour**, to an empty adjacent cell (eight directions), except the chip your opponent just moved.' },
      { title: 'Mines', body: 'A chip entering a mined cell changes colour.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first to line up **four chips of their colour** in a row, column or diagonal wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'What counts is the chips’ current colour, not who placed them: a flipped enemy chip is part of your line.',
      'The stated skills for this death match were memory and situational judgement.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Color Turn is decided by **what colour a chip is now, not whose it was**. Mines flip colours and anyone may move any chip, so every chip on the board is shared.' },
    { type: 'cards', items: [
      { title: 'Eighteen mines, half the board', body: 'With half the cells mined, moves flip colours often. Whoever remembers the mines can push enemy chips onto them to turn them into their own. Each entry reveals a mine, so the map fills in as the game goes.' },
      { title: 'Moving enemy chips', body: 'Pulling a chip out of the rival’s threat, or onto a mine, is the strongest defence. Only the chip just moved is protected, so a threat built with it survives one turn.' },
      { title: 'Placing only in front', body: 'New chips enter only your front row, so the far side is reached by moving. Keeping some of your seven in hand lets you create a fresh threat when you need one.' },
    ], columns: 1 },
    { type: 'p', text: 'The hidden mines make it an information fight with **no dominant strategy**; understanding that the aim is four of your colour, whoever placed them, is the starting point.' },
  ],
  similar: [
    { name: 'Connect Four', players: '2', alike: 'Line up four of your colour in a row, column or diagonal.', differs: 'Chips are only dropped, never moved or flipped.' },
    { name: 'Stratego', players: '2', alike: 'Hidden dangers (bombs) and memory shape every move.', differs: 'It is a war game of hidden ranks and capturing the flag.' },
  ],
});
