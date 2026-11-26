// 데블스 플랜 (season 1), days 1–3: 바이러스 게임, 협동 퍼즐, 규칙 레이스, 기억의 조각, 시크릿 넘버, 워드 타워.
import { day, dp1Game } from './shared';

export const virusGame = dp1Game('virus-game', 'main', day(1), [1], ['russianRoulette', 'hiddenWord', 'indianPoker'], {
  meta: {
    title: '바이러스 게임 규칙 — 데블스 플랜 시즌1 1일차 메인 매치, 테러리스트와 시민의 정체 숨기기',
    description: '데블스 플랜 시즌1 1일차 메인 매치 바이러스 게임의 규칙을 정리했어요. 테러리스트 2명, 시민·연구원·기자, 중립 광신도·수사관, 고유번호 순으로 번지는 감염, 항체 보유자와 치료제, 총알·해독제, 진영별 피스 보상까지.',
    keywords: ['바이러스 게임', '데블스 플랜 바이러스 게임', '데블스플랜 시즌1', '데블스 플랜 1일차', '데블스플랜1'],
  },
  title: '바이러스 게임 — 데블스 플랜 시즌1 1일차 메인 매치',
  name: '바이러스 게임',
  lead: '숨은 테러리스트 둘이 바이러스를 퍼뜨리고, 시민들은 치료제를 만들거나 테러리스트를 찾아내야 해요. 감염은 고유번호 순서대로 양옆으로 번져요.',
  summary: '고유번호를 따라 번지는 바이러스를 두고 테러리스트·시민·중립이 각자의 목표를 쫓는 정체 숨기기 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 12명. 추첨으로 캐릭터와 1–12 고유번호를 받아요. 캐릭터마다 능력과 비공개 미션이 있어요.',
      '**테러리스트 팀(2명)**: 서로를 알아요. 상의해 한 명을 감염시키는 바이러스, 각자 한 번씩 쓰는 총알(살해)과 해독제(치료), 서로를 확인하는 접선 능력이 있어요.',
      '**시민 팀(8명)**: 일반 시민 5명(그중 무작위 한 명이 본인도 모르는 **항체 보유자**), 서로를 아는 연구원 2명, 라운드마다 한 명의 캐릭터를 확인하는 기자 1명.',
      '**중립(2명)**: 라운드마다 총알을 쓸 수 있는 수사관, 자기가 죽어야 피스를 얻는 광신도.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '라운드', body: '한 라운드는 30분이에요. 2라운드부터 시작할 때마다 치료제 단계, 바이러스 사망자, 감염자 수가 공지돼요.' },
      { title: '감염', body: '최초 감염자의 고유번호부터 라운드마다 **양방향으로 한 명씩** 번져요(1번과 12번은 이웃). 사망자 번호는 건너뛰고, 해독제를 먹은 사람이 있으면 그 방향은 멈춰요. 감염된 뒤 두 라운드가 지나면 죽어요.' },
      { title: '확진 검사', body: '누구나 게임 중 한 번 검사소에서 자기 감염 여부를 비공개로 확인할 수 있어요.' },
      { title: '치료제', body: '연구원은 항체 보유자를 찾아 라운드당 한 번 제조 미션을 해요. 두 번 성공하면 치료제가 완성돼요. 첫 성공은 다음 라운드에 전체에 알려져요.' },
      { title: '사망', body: '죽은 사람은 이름과 캐릭터가 공개되고 딜러룸에 격리돼요. 고유번호와 항체 여부는 공개되지 않아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**테러리스트**: 항체 보유자를 뺀 모두가 죽으면 각자 피스 4개.',
      '**시민 팀**: 테러리스트가 모두 죽거나 치료제가 완성되면 각자 피스 1개. 살아남은 일반 시민·기자는 1개 더, 치료제로 이기면 연구원은 1개 더.',
      '**수사관**: 테러리스트 둘이 모두 죽으면 피스를 얻는데, 2라운드면 4개이고 라운드가 지날수록 1개씩 줄어요.',
      '**광신도**: 1라운드에 죽으면 3개, 2–3라운드 2개, 4라운드 1개, 그 뒤로는 없어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '항체 보유자는 감염되어도 한 라운드 뒤 저절로 나아요. 기자의 취재로도 항체 보유자는 알 수 없어요.',
      '캐릭터별 미션과 능력의 세부(접선 방식 등)는 화면에서 모두 공개되지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '바이러스 게임은 마피아 게임에 **위치(고유번호)와 시간**을 더한 구조예요. 누가 언제 죽는지는 감염 경로로 계산되기 때문에, 사망 공지 자체가 단서가 돼요.' },
    { type: 'cards', items: [
      { title: '감염 경로로 거꾸로 추리', body: '감염은 번호 순으로 양옆으로 번지고 두 라운드 뒤 사망으로 드러나요. 그래서 사망자들의 번호를 이어 보면 최초 감염자와 감염 방향을 거꾸로 짐작할 수 있어요. 고유번호를 서로 알려 주는 것이 시민에게는 정보이지만, 테러리스트에게는 다음 표적의 지도가 돼요.' },
      { title: '항체 보유자 찾기 경쟁', body: '치료제는 시민 팀이 이기는 가장 확실한 길이고, 그 열쇠는 본인도 모르는 항체 보유자예요. 감염됐다가 나은 사람이 바로 항체 보유자라, 확진 검사를 언제 쓰느냐가 중요해요. 테러리스트에게는 항체 보유자를 총알로 없애는 것이 최우선이 될 수 있어요.' },
      { title: '중립의 엇갈린 목표', body: '광신도는 일찍 죽고 싶어 하고, 수사관은 테러리스트를 빨리 잡고 싶어 하지만 총알을 아무에게나 쏠 수 있어요. 둘의 행동이 시민과 테러리스트 어느 쪽의 추리도 흐리게 만들어, 판이 단순한 2팀 대결로 정리되지 않아요.' },
    ], columns: 1 },
    { type: 'p', text: '역할이 많고 보상이 진영마다 달라 **우월 전략은 없어요.** 다만 시민 팀 피스 보상(1개)이 테러리스트(4개)보다 훨씬 작아, 개인 입장에서는 생존 보너스를 챙기는 것이 실질적인 목표가 돼요.' },
  ],
  similar: [
    { name: '판데믹 (Pandemic)', players: '2–4명', alike: '질병이 이웃 지역으로 번지고, 치료제를 만들어 막는 구조예요.', differs: '판데믹은 완전한 협력 게임이라 숨은 배신자가 없어요.' },
    { name: '한밤의 늑대인간 (One Night Ultimate Werewolf)', players: '3–10명', alike: '여러 직업의 능력으로 정보를 얻고, 숨은 늑대인간을 추리해요.', differs: '한밤의 늑대인간은 한 번의 밤과 한 번의 투표로 끝나요.' },
  ],
}, {
  meta: {
    title: "The Virus Game rules — The Devil's Plan season 1, day 1 main match",
    description: "The rules of The Virus Game (바이러스 게임) from The Devil's Plan season 1: two terrorists, citizens, researchers and a reporter, a neutral fanatic and investigator, infection spreading by player number, the antibody carrier and the cure, bullets and antidotes, and piece rewards by side.",
    keywords: ['The Virus Game', "The Devil's Plan season 1", "Devil's Plan day 1", '데블스 플랜 바이러스 게임'],
  },
  title: "The Virus Game — The Devil's Plan season 1, day 1 main match",
  name: 'The Virus Game (바이러스 게임)',
  lead: 'Two hidden terrorists spread a virus; citizens must make a cure or find them. The infection spreads both ways along the players’ numbers.',
  summary: 'A hidden-role game where a virus spreads along player numbers and terrorists, citizens and neutrals chase different goals.',
  setup: [
    { type: 'list', items: [
      '**Players**: twelve, each drawing a character and a number 1–12; every character has powers and a secret mission.',
      '**Terrorists (2)**: know each other; together infect one player; each has one bullet (kill) and one antidote (cure); can confirm each other.',
      '**Citizens (8)**: five ordinary citizens (one, unknown even to themselves, is the **antibody carrier**), two researchers who know each other, and a reporter who checks one character per round.',
      '**Neutrals (2)**: an investigator with a bullet every round, and a fanatic who scores by dying.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Rounds', body: '30 minutes each. From round 2, each round opens with the cure stage, virus deaths and number infected.' },
      { title: 'Infection', body: 'From the first infected number it spreads **one player each way per round** (1 and 12 are neighbours), skipping the dead; an antidote stops that direction. The infected die two rounds later.' },
      { title: 'Test', body: 'Once per game anyone may privately check whether they are infected.' },
      { title: 'Cure', body: 'Researchers find the antibody carrier and attempt a production mission once per round; two successes complete the cure, and the first is announced.' },
      { title: 'Death', body: 'The dead are named with their character and isolated; their number and antibody status stay secret.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Terrorists**: everyone but the antibody carrier dead → 4 pieces each.',
      '**Citizens**: both terrorists dead or the cure made → 1 piece each, +1 for surviving citizens and the reporter, +1 for researchers on a cure win.',
      '**Investigator**: scores if both terrorists die: 4 pieces by round 2, one fewer each later round.',
      '**Fanatic**: dying in round 1 pays 3, rounds 2–3 pay 2, round 4 pays 1, later nothing.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The antibody carrier recovers a round after infection; the reporter cannot identify them.',
      'Details of each character’s mission and powers were not all shown, so they are left out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The Virus Game is Mafia plus **position (player numbers) and time**: who dies when follows from the infection path, so death announcements are clues.' },
    { type: 'cards', items: [
      { title: 'Reading the path backwards', body: 'Infection runs along the numbers and shows up as deaths two rounds later, so the dead players’ numbers point back to the first victim and the direction. Sharing numbers informs citizens but also maps the next targets for terrorists.' },
      { title: 'The race for the carrier', body: 'The cure is the citizens’ surest win, and its key is a carrier who does not know it. Someone infected who recovers is the carrier, so when to use the test matters; for terrorists, shooting the carrier can be the top priority.' },
      { title: 'Neutrals blur everything', body: 'The fanatic wants to die early and the investigator wants terrorists dead fast but can shoot anyone; together they muddy both sides’ deductions.' },
    ], columns: 1 },
    { type: 'p', text: 'Many roles with different payouts mean **no dominant strategy**. With citizens earning 1 piece against the terrorists’ 4, survival bonuses become the practical aim for individuals.' },
  ],
  similar: [
    { name: 'Pandemic', players: '2–4', alike: 'Disease spreads to neighbouring areas while players race to make cures.', differs: 'It is fully cooperative, with no hidden traitor.' },
    { name: 'One Night Ultimate Werewolf', players: '3–10', alike: 'Role powers give information to find hidden werewolves.', differs: 'It is one night and one vote.' },
  ],
});

export const coopPuzzle = dp1Game('cooperative-puzzle', 'prize', day(1), [1], ['magicswap', 'nemoCount', 'gradation'], {
  meta: {
    title: '협동 퍼즐 규칙 — 데블스 플랜 시즌1 1일차 상금 매치, 도는 회전판 위의 이어 맞추기',
    description: '데블스 플랜 시즌1 1일차 상금 매치 협동 퍼즐의 규칙을 정리했어요. 회전판 위 발판, 10라운드 퍼즐 상자, 테이블이 멀어지면 다음 사람이 이어받기, 3분 제한, 회전판이 멈췄을 때 앞사람이 완성자, 두 번 이상 완성하면 피스까지.',
    keywords: ['협동 퍼즐', '데블스 플랜 협동 퍼즐', '데블스플랜 상금 매치', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '협동 퍼즐 — 데블스 플랜 시즌1 1일차 상금 매치',
  name: '협동 퍼즐',
  lead: '돌아가는 회전판 위에 서서, 앞을 지나가는 퍼즐을 이어서 맞춰요. 내 앞에서 멀어지면 다음 사람이 이어받아요.',
  summary: '회전판 위에서 10개의 퍼즐을 3분 안에 이어 맞추는 협동 상금 매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 감옥에 가지 않은 참가자. 제비뽑기로 회전판 위 발판 자리를 정해요.',
      '**퍼즐**: 라운드마다 퍼즐 상자 하나(조각과 문제 그림). 모두 10라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '시작', body: '딜러가 상자를 열면 회전판이 시계 방향으로 돌고, 1번부터 퍼즐을 맞춰요.' },
      { title: '이어받기', body: '테이블이 멀어져 더 맞출 수 없으면 다음 사람이 이어받아요.' },
      { title: '완성', body: '모든 조각을 써서 그림과 같은 모양을 만들면 회전판이 멈추고, 그때 테이블 앞에 있는 사람이 완성한 것으로 쳐요. 제한 시간은 3분이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '10라운드 모두 성공하면 상금 5,000만 원이 쌓여요. 한 번이라도 시간을 넘기면 그 자리에서 실패해요.',
      '두 번 이상 완성한 사람은 피스 1개를 받고, 그 뒤로 완성할 때마다 1개씩 더 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '퍼즐 조각의 모양과 회전 속도는 정리된 규칙에 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '협동 퍼즐은 모두가 같은 목표(상금)를 갖지만, 피스는 **마지막 조각을 놓은 사람**에게만 가요. 협동과 개인 이익이 살짝 어긋나는 구조예요.' },
    { type: 'cards', items: [
      { title: '넘겨주는 상태가 중요', body: '퍼즐은 여러 사람의 손을 거쳐 완성돼요. 다음 사람이 바로 이어 갈 수 있도록 정리된 상태로 넘기는 것이 3분을 지키는 핵심이에요. 앞사람이 거의 다 맞춘 것을 뒷사람이 마무리하면 피스는 뒷사람이 받지만, 상금은 모두의 것이에요.' },
      { title: '피스를 위한 욕심의 위험', body: '완성자가 되려고 일부러 마지막 조각을 미루면 시간이 부족해질 수 있어요. 실패하면 상금 전부가 날아가니, 개인 피스를 위한 지연은 팀 전체에 큰 손해예요.' },
    ], columns: 1 },
    { type: 'p', text: '실력과 협력이 중심이고 **우월 전략은 없어요.** 칠교놀이처럼 모양 퍼즐에 익숙한 사람이 앞 순서보다 마무리 쪽에 서는 배치가 유리할 수 있어요.' },
  ],
  similar: [
    { name: '우봉고 (Ubongo)', players: '1–4명', alike: '정해진 조각으로 그림의 빈칸을 빠르게 채우는 시간제 퍼즐이에요.', differs: '우봉고는 각자 자기 퍼즐을 푸는 경쟁이에요.' },
    { name: '칠교놀이 (탱그램)', players: '1명 이상', alike: '조각을 모두 써서 주어진 실루엣을 만드는 퍼즐이에요.', differs: '칠교놀이는 혼자 푸는 퍼즐이고, 이어받기나 시간 제한이 없어요.' },
  ],
}, {
  meta: {
    title: "The Cooperative Puzzle rules — The Devil's Plan season 1, day 1 prize match",
    description: "The rules of The Cooperative Puzzle (협동 퍼즐) from The Devil's Plan season 1: footholds on a turntable, ten rounds of puzzle boxes, handing over as the table moves away, a 3-minute limit, the player in front when it stops counting as the solver, and pieces for solving twice or more.",
    keywords: ['The Cooperative Puzzle', "The Devil's Plan prize match", '데블스 플랜 협동 퍼즐'],
  },
  title: "The Cooperative Puzzle — The Devil's Plan season 1, day 1 prize match",
  name: 'The Cooperative Puzzle (협동 퍼즐)',
  lead: 'Standing on a rotating platform, players take turns at a puzzle as it passes; when it moves out of reach, the next player carries on.',
  summary: 'Ten puzzles, three minutes each, solved in relay on a turntable: a cooperative prize match.',
  setup: [
    { type: 'list', items: [
      '**Players**: everyone not in prison, placed on footholds by lot.',
      '**Puzzles**: one box per round (pieces and a target picture), ten rounds.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Start', body: 'When the dealer opens the box the platform turns clockwise and player 1 starts.' },
      { title: 'Hand over', body: 'When the table moves out of reach, the next player continues.' },
      { title: 'Finish', body: 'Using every piece to match the picture stops the platform; whoever is in front of the table then counts as the solver. The limit is 3 minutes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'All ten solved adds ₩50 million to the prize pool; one failure ends it at once.',
      'Solving twice earns a piece, and each further solve another.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Piece shapes and rotation speed are not in the written rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Everyone shares the prize, but pieces go only to **whoever places the last piece**: cooperation and self-interest slightly diverge.' },
    { type: 'cards', items: [
      { title: 'Hand over clean', body: 'Puzzles pass through several hands, so leaving them in a state the next person can continue at once is how three minutes are kept. Finishing someone else’s near-complete puzzle gives you the piece but the money is everyone’s.' },
      { title: 'Greed is risky', body: 'Delaying the last piece to be the solver can run out the clock, and failure loses the whole prize.' },
    ], columns: 1 },
    { type: 'p', text: 'Skill and teamwork dominate and **there is no dominant strategy**; strong shape-solvers placed where puzzles finish may help most.' },
  ],
  similar: [
    { name: 'Ubongo', players: '1–4', alike: 'Fill a shape quickly with given pieces against the clock.', differs: 'Everyone races their own puzzle.' },
    { name: 'Tangram', players: '1+', alike: 'Use every piece to form a silhouette.', differs: 'Solo, with no relay or time limit.' },
  ],
});

export const rulesRace = dp1Game('rules-race', 'main', day(2), [2], ['monorail', 'piggyBank', 'hitStay'], {
  meta: {
    title: '규칙 레이스 규칙 — 데블스 플랜 시즌1 2일차 메인 매치, 내가 만든 규칙으로 달리는 주사위 레이스',
    description: '데블스 플랜 시즌1 2일차 메인 매치 규칙 레이스의 규칙을 정리했어요. 글자 블록으로 만드는 비공개 개인 규칙(조건부+수행부), 사무소 칸의 단체 규칙, 일반·특수 주사위, 감옥과 탈출 티켓, 순위별 피스 증감까지.',
    keywords: ['규칙 레이스', '데블스 플랜 규칙 레이스', '데블스플랜 2일차', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '규칙 레이스 — 데블스 플랜 시즌1 2일차 메인 매치',
  name: '규칙 레이스',
  lead: '글자 블록으로 "~하면 ~한다" 꼴의 나만의 규칙을 몰래 만든 뒤, 주사위 레이스를 해요. 규칙이 발동하면 결과만 공개돼요.',
  summary: '비공개 개인 규칙과 공동 단체 규칙이 판을 바꾸는 12인 주사위 레이스.',
  setup: [
    { type: 'list', items: [
      '**개인 규칙**: 120분 동안 글자 블록 더미에서 블록을 골라 문장을 만들어요. 아홉 가지 색 중 같은 색 블록은 한 문장에 한 번만 쓸 수 있어요. 문장은 **조건부와 수행부**로 되어 있어야 하고, 두 부분의 주어가 같으면 안 돼요. 문법에 맞고, 대상이 구체적이며, 모순이 없어야 해요.',
      '**등록**: 한 명씩 딜러룸에서 등록하고, 다른 사람에게는 공개되지 않아요. 글자 수가 적은 사람부터 먼저 출발해요(같으면 가위바위보).',
      '**주사위**: 일반 주사위는 1, 2, 2, 3, 감옥, 탈출. 특수 주사위는 1, 2, 2, 3, 3, 3. 특정 규칙이 아니면 일반 주사위를 써요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '이동', body: '1번부터 주사위를 굴려 그만큼 말을 옮겨요.' },
      { title: '감옥', body: '감옥이 나오면 지금 위치를 표시하고 감옥 칸으로 가요. 다음 차례에 탈출이 나오거나 탈출 티켓을 내야 나와요. 나오면 바로 주사위를 굴려요.' },
      { title: '사무소 칸', body: '주사위로 도착하면 셋 중 하나를 골라요: 탈출 티켓 1장, 주사위 한 번 더, 단체 규칙 등록·수정.' },
      { title: '단체 규칙', body: '세 가지 색 문구에서 하나씩 골라 문장을 만들어 모두에게 적용해요. 이미 있으면 문구를 빼거나 더해 고칠 수 있어요.' },
      { title: '규칙 발동', body: '누군가의 개인 규칙이 발동하면 결과만 공개돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '모두 결승점을 지나면 끝나고, 순위대로 피스가 바뀌어요: 1등 +3, 2등 +2, 3등 +1, 4–9등 변동 없음, 10등 −1, 11등 −2, **12등 −5**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '주사위가 아닌 규칙의 효과로 사무소 칸에 도착하면 사무소 혜택을 받을 수 없어요.',
      '규칙 문장의 세부 재정과 게임판 구성은 정리된 규칙에서 모두 확인하지 못해 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '규칙 레이스의 진짜 경기는 레이스 전 120분에 있어요. **어떤 개인 규칙을 만드느냐**가 주사위 운보다 훨씬 큰 차이를 만들어요.' },
    { type: 'cards', items: [
      { title: '자주 발동하는 조건', body: '좋은 규칙은 "자주 일어나는 조건"과 "큰 효과"를 묶어요. 예를 들어 다른 사람의 흔한 행동을 조건으로 삼으면 내 규칙이 계속 발동해요. 조건부와 수행부의 주어가 달라야 한다는 제약 때문에, 남의 행동을 조건으로 나를 움직이거나, 내 행동을 조건으로 남을 움직이는 문장이 자연스러워요.' },
      { title: '짧은 규칙의 선공', body: '글자 수가 적을수록 먼저 출발해요. 강한 긴 규칙과 약한 짧은 규칙 사이의 선택이 생기고, 같은 색 블록 제한까지 있어 문장 설계가 퍼즐이 돼요.' },
      { title: '꼴찌의 −5', body: '4–9등은 변동이 없지만 12등은 5개를 잃어요. 그래서 1등을 노리기보다 꼴찌를 피하는 연합(서로를 밀어 주는 규칙, 감옥 탈출을 돕는 단체 규칙)이 합리적인 목표가 될 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '규칙이 비공개라 서로의 규칙을 추리하는 정보전도 생겨요. **우월 전략은 없지만**, 발동 빈도가 높고 남과 손잡기 좋은 규칙을 설계한 사람이 유리해요.' },
  ],
  similar: [
    { name: '플럭스 (Fluxx)', players: '2–6명', alike: '게임 중에 규칙이 계속 바뀌고, 그 규칙을 플레이어가 직접 바꿔요.', differs: '플럭스의 규칙은 공개된 카드이고, 레이스가 아니에요.' },
    { name: '뱀과 사다리', players: '2명 이상', alike: '주사위로 칸을 옮기고 특수 칸에서 앞뒤로 크게 움직이는 레이스예요.', differs: '뱀과 사다리는 선택이 거의 없는 순수한 운 게임이에요.' },
  ],
}, {
  meta: {
    title: "Rules Race rules — The Devil's Plan season 1, day 2 main match",
    description: "The rules of Rules Race (규칙 레이스) from The Devil's Plan season 1: secret personal rules built from letter blocks (condition plus effect), shared group rules at office spaces, normal and special dice, jail and escape tickets, and pieces by finishing place.",
    keywords: ['Rules Race', "The Devil's Plan season 1", '데블스 플랜 규칙 레이스'],
  },
  title: "Rules Race — The Devil's Plan season 1, day 2 main match",
  name: 'Rules Race (규칙 레이스)',
  lead: 'Secretly build your own "if…, then…" rule from letter blocks, then run a dice race; when a rule fires, only its effect is announced.',
  summary: 'A twelve-player dice race reshaped by secret personal rules and shared group rules.',
  setup: [
    { type: 'list', items: [
      '**Personal rule**: 120 minutes to build a sentence from letter blocks; of nine colours, each may be used only once per sentence. It needs **a condition and an effect** with different subjects, correct grammar, specific targets and no contradiction.',
      '**Registration**: one by one in the dealer room, hidden from others; shorter rules start first (rock-paper-scissors on ties).',
      '**Dice**: normal 1, 2, 2, 3, jail, escape; special 1, 2, 2, 3, 3, 3. The normal die is used unless a rule says otherwise.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Move', body: 'From player 1, roll and move.' },
      { title: 'Jail', body: 'Rolling jail marks your spot and sends you to jail; next turn roll escape or hand in a ticket, then roll at once.' },
      { title: 'Office', body: 'Landing by dice offers one of: an escape ticket, another roll, or registering or editing the group rule.' },
      { title: 'Group rule', body: 'Combine one phrase of each of three colours into a rule for everyone; an existing one can be edited.' },
      { title: 'Triggers', body: 'When a personal rule fires, only the result is announced.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'When everyone has finished, pieces change by place: +3, +2, +1, nothing for 4th–9th, then −1, −2 and **−5 for 12th**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Reaching an office by a rule rather than dice gives no office benefit.',
      'Detailed rulings and the board layout could not all be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The real contest is the 120 minutes before the race: **which personal rule you build** matters far more than dice.' },
    { type: 'cards', items: [
      { title: 'Conditions that fire often', body: 'Good rules pair a common condition with a big effect, such as triggering on others’ routine actions. Because subjects must differ, sentences naturally use others’ actions to move you, or yours to move others.' },
      { title: 'Short rules start first', body: 'Fewer letters means earlier starts, trading power for tempo, and the colour limit makes sentence design a puzzle.' },
      { title: 'The −5 for last', body: '4th–9th change nothing but 12th loses five, so alliances to avoid last (rules that push each other, group rules that ease jail) can be the sensible aim.' },
    ], columns: 1 },
    { type: 'p', text: 'Hidden rules add a guessing war. **There is no dominant strategy**, but rules that fire often and suit alliances help most.' },
  ],
  similar: [
    { name: 'Fluxx', players: '2–6', alike: 'Players change the rules as the game goes.', differs: 'Rules are public cards and it is not a race.' },
    { name: 'Snakes and Ladders', players: '2+', alike: 'A dice race with special spaces that move you far.', differs: 'It has almost no choices.' },
  ],
});

export const memoryFragments = dp1Game('fragments-of-memory', 'prize', day(2), [2], ['nemoCount', 'gradation', 'hiddenWord'], {
  meta: {
    title: '기억의 조각 규칙 — 데블스 플랜 시즌1 2일차 상금 매치, 20분 동안 본 그림으로 푸는 문제',
    description: '데블스 플랜 시즌1 2일차 상금 매치 기억의 조각의 규칙을 정리했어요. 20분 동안 공개되는 그림, 메모 금지, 한 명씩 나와 푸는 10문제, 패스하면 제외, 오답이면 즉시 실패와 피스 반납까지.',
    keywords: ['기억의 조각', '데블스 플랜 기억의 조각', '데블스플랜 상금 매치', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '기억의 조각 — 데블스 플랜 시즌1 2일차 상금 매치',
  name: '기억의 조각',
  lead: '20분 동안 정보가 가득한 그림을 보고, 메모 없이 기억만으로 10문제를 이어서 풀어요. 한 사람이라도 틀리면 끝이에요.',
  summary: '그림을 외워 한 명씩 문제를 이어 푸는 상금 매치. 오답 한 번이면 실패해요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 감옥에 가지 않은 참가자.',
      '**그림**: LED 화면에 20분 동안 공개돼요. 보는 동안 중앙홀을 떠날 수 없고 메모도 할 수 없어요.',
      '**문제**: 그림에 관한 10문제, 뒤로 갈수록 어려워요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '이동', body: '그림 공개가 끝나면 모두 주방으로 가서 순서를 정해요.' },
      { title: '도전', body: '5분 뒤부터 한 명씩 중앙홀로 나와 문제를 풀어요. 다른 사람에게는 문제가 공개되지 않아요.' },
      { title: '패스', body: '모르면 패스할 수 있지만, 패스한 사람은 게임에서 빠지고 다시 도전할 수 없어요. 다음 사람이 그 문제부터 이어 가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '10문제를 모두 맞히면 상금 5,000만 원이 쌓여요.',
      '모두 패스해 빠지거나, 누구든 틀린 답을 말하면 즉시 실패하고, 틀린 사람은 피스 1개를 반납해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '문제 내용은 다른 사람에게 공개되지 않아, 주방에 있는 사람들은 앞사람이 어떤 문제에서 멈췄는지 모르고 나와요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '기억의 조각은 **분업 암기**와 **패스의 판단**이 승부예요. 20분 동안 모두가 모든 것을 외울 필요는 없고, 오히려 나눠 외우는 것이 강해요.' },
    { type: 'cards', items: [
      { title: '영역을 나눠 외우기', body: '그림을 구역이나 정보 종류(숫자, 색, 글자)로 나눠 사람마다 맡으면, 어떤 문제가 나와도 답할 수 있는 사람이 있을 확률이 커져요. 다만 문제가 비공개라, 다음 사람이 자기 담당 문제인지 모른 채 나간다는 약점이 있어요.' },
      { title: '패스는 공짜가 아니다', body: '패스하면 다시는 도전할 수 없어 남은 인원이 줄어요. 하지만 틀리면 모두가 끝나니, 확신이 없으면 패스가 정답이에요. 뒤 문제가 어려우니 확실한 사람을 뒷순서에 남겨 두는 배치도 생각해 볼 만해요.' },
    ], columns: 1 },
    { type: 'p', text: '협동 게임이라 **우월 전략은 없어요.** 오답 한 번의 대가가 너무 크기 때문에, 팀 전체가 "모르면 패스"를 철저히 지키는 것이 기본이에요.' },
  ],
  similar: [
    { name: '메모리 (같은 그림 찾기)', players: '2명 이상', alike: '본 것을 기억해 답하는 기억력 게임이에요.', differs: '메모리는 카드 위치를 외워 짝을 맞춰요.' },
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '협력하면서 각자 가진 정보를 기억하고, 실수 한 번이 팀 전체의 손해가 돼요.', differs: '하나비는 남의 카드만 보이는 카드 게임이에요.' },
  ],
}, {
  meta: {
    title: "Fragments of Memory rules — The Devil's Plan season 1, day 2 prize match",
    description: "The rules of Fragments of Memory (기억의 조각) from The Devil's Plan season 1: a picture shown for 20 minutes, no notes, ten questions answered one player at a time, passing removes you, and a wrong answer ends the match and costs a piece.",
    keywords: ['Fragments of Memory', "The Devil's Plan prize match", '데블스 플랜 기억의 조각'],
  },
  title: "Fragments of Memory — The Devil's Plan season 1, day 2 prize match",
  name: 'Fragments of Memory (기억의 조각)',
  lead: 'Study an information-packed picture for 20 minutes, then answer ten questions from memory in relay. One wrong answer ends it.',
  summary: 'Memorise a picture and answer questions one player at a time; a single mistake fails the match.',
  setup: [
    { type: 'list', items: [
      '**Players**: everyone not in prison.',
      '**Picture**: shown on an LED screen for 20 minutes; you may not leave the hall or take notes.',
      '**Questions**: ten about the picture, getting harder.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Move', body: 'Afterwards everyone goes to the kitchen and sets an order.' },
      { title: 'Answer', body: 'From 5 minutes later, players come out one at a time; questions are not shown to the others.' },
      { title: 'Pass', body: 'You may pass, but then you are out for good; the next player continues from that question.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Ten correct answers add ₩50 million.',
      'If everyone has passed, or anyone answers wrongly, it fails at once and the wrong answerer returns a piece.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Questions are hidden from the kitchen, so the next player does not know where the last one stopped.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is about **splitting the memorising** and **judging when to pass**; nobody needs everything if the team divides the picture.' },
    { type: 'cards', items: [
      { title: 'Divide the picture', body: 'Assigning areas or kinds of detail (numbers, colours, text) raises the chance someone knows each answer, though hidden questions mean the next player does not know whether it is theirs.' },
      { title: 'Passing has a cost', body: 'A pass removes you, but a wrong answer ends everything, so pass when unsure; keeping reliable memories for the harder late questions can help.' },
    ], columns: 1 },
    { type: 'p', text: 'It is cooperative with **no dominant strategy**; with one mistake fatal, a strict "pass if unsure" rule is the basis.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '2+', alike: 'Answer from what you saw.', differs: 'You match pairs of cards.' },
    { name: 'Hanabi', players: '2–5', alike: 'Cooperation where remembered information matters and one error hurts everyone.', differs: 'You see only others’ cards.' },
  ],
});

export const secretNumber = dp1Game('secret-number', 'main', day(3), [3], ['hiddenWord', 'indianPoker', 'nemoCount'], {
  meta: {
    title: '시크릿 넘버 규칙 — 데블스 플랜 시즌1 3일차 메인 매치, 콘택트로 내 숫자 알아내기',
    description: '데블스 플랜 시즌1 3일차 메인 매치 시크릿 넘버의 규칙을 정리했어요. 자기도 모르는 1–100 고유번호, 콘택트룸에서 두 사람이 같은 티켓 내기, 더하기·곱하기 끝자리·나누기 몫·0의 개수, 정답지 점수와 피스 증감까지.',
    keywords: ['시크릿 넘버', '데블스 플랜 시크릿 넘버', '데블스플랜 3일차', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '시크릿 넘버 — 데블스 플랜 시즌1 3일차 메인 매치',
  name: '시크릿 넘버',
  lead: '내 숫자는 나를 포함해 아무도 몰라요. 다른 사람과 둘이 콘택트룸에 들어가 숫자의 합이나 곱의 끝자리 같은 단서를 받아 내 숫자를 추리해요.',
  summary: '두 사람의 숨은 숫자에 대한 단서를 주고받아 내 숫자와 남의 숫자를 맞히는 추리 게임.',
  setup: [
    { type: 'list', items: [
      '**고유번호**: 각자 1–100 중 하나. 본인을 포함해 아무에게도 공개되지 않아요.',
      '**콘택트 티켓 1세트**: 더하기, 곱하기, 나누기, 0 각 1장. 피스 1개로 1세트를 더 살 수 있어요.',
      '**시간**: 2시간.',
    ] },
    { type: 'table', head: ['티켓', '알려 주는 것'], rows: [
      ['더하기', '두 번호의 합. 단 20 이하면 "3–20 사이", 180 이상이면 "180–199 사이"로만 알려 줘요.'],
      ['곱하기', '두 번호를 곱한 값의 일의 자리.'],
      ['나누기', '큰 수를 작은 수로 나눈 몫(나머지는 버려요).'],
      ['0', '두 번호 사이에 있는 모든 수에 들어 있는 0의 개수(두 번호 자신은 빼요).'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '콘택트', body: '두 사람이 콘택트룸 두 곳 중 하나에 들어가 **같은 종류의 티켓**을 한 장씩 내면 그 단서를 받아요.' },
      { title: '정답지', body: '2시간 뒤 자신을 포함한 모든 사람의 번호를 추측해 내요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '내 번호: 맞히면 +5, 틀리면 −5. 남의 번호: 맞히면 +1, 틀리면 −1, 빈칸은 0. 모두 맞히면 +5 보너스. 남이 내 번호를 맞히면 한 명당 −1.',
      '피스: 16점 이상 +3, 11–15점 +2, 6–10점 +1, 5점 0, 0–4점 −1, −1점 이하 −2. **최하위는 3개 더 잃어요**(공동 최하위면 1위가 정해요). 전원이 같은 점수면 모두 −1.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '이 날은 감옥에 갈 사람을 맞히는 이벤트 베팅도 있었어요(맞히면 피스 1개).',
    ] },
  ],
  analysis: [
    { type: 'p', text: '시크릿 넘버는 **협력해야 풀리고, 남이 내 답을 알면 손해**인 게임이에요. 내 번호를 알려면 상대와 콘택트해야 하는데, 그 단서는 상대에게도 똑같이 가요.' },
    { type: 'cards', items: [
      { title: '단서의 조합', body: '상대 번호를 이미 아는 사람과 "더하기"를 하면 내 번호가 바로 나와요. 그래서 내 번호는 남들이 보는 정보이니, 다른 사람의 번호를 알려 주는 대가로 콘택트를 요구하는 거래가 생겨요. 곱하기 끝자리나 나누기 몫은 단독으로는 약하지만 후보를 크게 줄여요.' },
      { title: '남이 맞히면 −1', body: '남이 내 번호를 맞힐 때마다 1점씩 깎여요. 그래서 내 번호 정보가 퍼지지 않게 하면서 나만 알아내는 것이 이상적이에요. 그러나 그렇게 하려면 남을 속여야 하고, 거짓 정보는 정답지에서 서로의 점수를 흔들어요.' },
      { title: '빈칸의 가치', body: '남의 번호는 틀리면 −1이고 빈칸이면 0이에요. 확실한 것만 적는 것이 기본이고, 내 번호(±5)의 확신이 점수의 대부분을 정해요.' },
    ], columns: 1 },
    { type: 'p', text: '정보 교환에 거짓이 섞일 수 있어 **우월 전략은 없어요.** 다만 최하위 −3이 크므로, 적어도 자기 번호를 확실히 알아내는 최소한의 협력은 모두에게 이득이에요.' },
  ],
  similar: [
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '내 카드는 나만 못 보고, 남들이 주는 단서로 추리해요.', differs: '하나비는 완전한 협력이라 남이 내 패를 아는 것이 손해가 아니에요.' },
    { name: '인디언 포커', players: '2명 이상', alike: '자기 숫자만 모르는 상태에서 남의 반응으로 내 숫자를 짐작해요.', differs: '인디언 포커는 베팅으로 겨루고, 숫자를 맞히지 않아요.' },
  ],
}, {
  meta: {
    title: "Secret Number rules — The Devil's Plan season 1, day 3 main match",
    description: "The rules of Secret Number (시크릿 넘버) from The Devil's Plan season 1: a hidden number from 1 to 100 that even its owner cannot see, contact rooms where two players play matching tickets, the sum, last digit of the product, quotient and count of zeros, the answer sheet scoring and pieces.",
    keywords: ['Secret Number', "The Devil's Plan season 1", '데블스 플랜 시크릿 넘버'],
  },
  title: "Secret Number — The Devil's Plan season 1, day 3 main match",
  name: 'Secret Number (시크릿 넘버)',
  lead: 'Everyone has a number nobody, including themselves, can see. Two players enter a contact room together to learn clues such as their sum, and deduce their own numbers.',
  summary: 'Trade clues about two hidden numbers to work out your own and everyone else’s.',
  setup: [
    { type: 'list', items: [
      '**Numbers**: each player has one from 1–100, hidden from everyone including themselves.',
      '**Contact tickets** (one set): plus, times, divide and zero; another set costs a piece.',
      '**Time**: two hours.',
    ] },
    { type: 'table', head: ['Ticket', 'What it tells you'], rows: [
      ['Plus', 'The sum; at 20 or less only "between 3 and 20", at 180 or more only "between 180 and 199".'],
      ['Times', 'The last digit of the product.'],
      ['Divide', 'The larger divided by the smaller, remainder dropped.'],
      ['Zero', 'How many zeros appear in all numbers strictly between the two.'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Contact', body: 'Two players enter one of two contact rooms and each hands in **the same kind of ticket** to get that clue.' },
      { title: 'Answer sheet', body: 'After two hours everyone writes down all numbers, their own included.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Your own: +5 right, −5 wrong. Others: +1 right, −1 wrong, 0 blank. All correct: +5 bonus. Each player who gets your number right: −1.',
      'Pieces: 16+ points +3, 11–15 +2, 6–10 +1, 5 none, 0–4 −1, below 0 −2. **Last place loses 3 more** (the leader decides ties). If everyone ties, all lose 1.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'That day also had a side bet on who would go to prison (a correct guess earned a piece).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Secret Number **needs cooperation, yet others knowing your answer costs you**: every clue you get, your partner gets too.' },
    { type: 'cards', items: [
      { title: 'Combining clues', body: 'A plus contact with someone whose number you know gives yours outright, so your number is information others hold, and contacts get traded for it. Last digits and quotients are weak alone but cut candidates sharply.' },
      { title: 'Being guessed costs', body: 'Each correct guess of your number costs a point, so the ideal is learning yours while keeping it from spreading, which takes deception, and false information shakes everyone’s sheets.' },
      { title: 'Blanks are free', body: 'Wrong guesses of others cost a point and blanks nothing, so write only certainties; your own number (±5) carries most of the score.' },
    ], columns: 1 },
    { type: 'p', text: 'Lies can enter any exchange, so **there is no dominant strategy**; with −3 for last, at least enough cooperation to learn your own number helps everyone.' },
  ],
  similar: [
    { name: 'Hanabi', players: '2–5', alike: 'You cannot see your own cards and deduce them from others’ clues.', differs: 'It is fully cooperative.' },
    { name: 'Indian Poker', players: '2+', alike: 'Only your own number is hidden from you.', differs: 'You bet rather than name numbers.' },
  ],
});

export const wordTower = dp1Game('word-tower', 'prize', day(3), [3], ['hiddenWord', 'magicswap', 'nemoCount'], {
  meta: {
    title: '워드 타워 규칙 — 데블스 플랜 시즌1 3일차 상금 매치, 알파벳 큐브로 주제어 쌓기',
    description: '데블스 플랜 시즌1 3일차 상금 매치 워드 타워의 규칙을 정리했어요. 3라운드, 주제와 알파벳 큐브 더미, 참가자 수만큼의 단어, 큐브를 모두 써야 하는 조건, 10분 제한, 실패하면 단어를 못 만든 사람의 피스 반납까지.',
    keywords: ['워드 타워', '데블스 플랜 워드 타워', '데블스플랜 상금 매치', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '워드 타워 — 데블스 플랜 시즌1 3일차 상금 매치',
  name: '워드 타워',
  lead: '주제가 주어지면 알파벳 큐브를 모두 나눠 써서, 참가자 수만큼의 주제어를 각자 매트 위에 쌓아요.',
  summary: '알파벳 큐브를 남김없이 써서 주제에 맞는 단어를 사람 수만큼 만드는 협동 상금 매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 감옥에 가지 않은 참가자. 각자 개인 매트.',
      '**라운드**: 3라운드. 라운드마다 주제와 알파벳 큐브 더미가 공개돼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '단어 만들기', body: '큐브를 조합해 주제에 맞는 영어 단어를 만들어, 각자 매트에 큐브를 쌓아 워드 타워를 완성해요.' },
      { title: '조건', body: '10분 안에 **참가자 수만큼** 단어를 만들어야 하고, 주어진 큐브를 **모두** 써야 해요.' },
      { title: '다음 라운드', body: '성공하면 새 주제와 큐브로 다음 라운드를 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '3라운드를 모두 성공하면 상금 1억 원이 쌓여요.',
      '시간 안에 못 하면 즉시 끝나고, 자기 매트에 단어를 완성하지 못한 사람은 피스 1개를 반납해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '주제와 큐브 구성은 정리된 규칙에 모두 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '워드 타워는 단어 퍼즐이면서 **분배 문제**예요. 모든 큐브를 남김없이 써야 하니, 쉬운 단어부터 만들면 마지막 사람에게 쓰기 어려운 글자만 남아요.' },
    { type: 'cards', items: [
      { title: '어려운 글자부터', body: 'Q, Z, X처럼 쓰기 어려운 글자가 들어갈 단어를 먼저 정하고, 모음이 넉넉한 쉬운 단어는 나중에 남은 글자로 맞추는 것이 효율적이에요. 전체 글자를 먼저 세어 보고 단어 수와 길이를 맞추는 계획이 필요해요.' },
      { title: '내 매트의 책임', body: '실패하면 자기 매트에 단어를 못 만든 사람만 피스를 잃어요. 그래서 각자 자기 단어부터 쌓고 싶어지지만, 그러면 남은 큐브가 맞지 않아 모두 실패할 수 있어요. 개인의 보험과 전체의 성공이 엇갈리는 지점이에요.' },
    ], columns: 1 },
    { type: 'p', text: '협동 게임이라 **우월 전략은 없어요.** 영어 어휘력이 좋은 한 사람이 전체 배분을 지휘하는 방식이 가장 안정적이에요.' },
  ],
  similar: [
    { name: '바나나그램스 (Bananagrams)', players: '1–8명', alike: '알파벳 타일을 남김없이 써서 단어를 만드는 속도 게임이에요.', differs: '바나나그램스는 각자 자기 격자를 만드는 경쟁이고 주제가 없어요.' },
    { name: '스크래블 (Scrabble)', players: '2–4명', alike: '주어진 알파벳으로 단어를 만들어요.', differs: '스크래블은 판 위에 단어를 엮어 점수를 겨뤄요.' },
  ],
}, {
  meta: {
    title: "Word Tower rules — The Devil's Plan season 1, day 3 prize match",
    description: "The rules of Word Tower (워드 타워) from The Devil's Plan season 1: three rounds, a theme and a pile of letter cubes, as many words as players, every cube used, a 10-minute limit, and a piece back from anyone without a finished word on failure.",
    keywords: ['Word Tower', "The Devil's Plan prize match", '데블스 플랜 워드 타워'],
  },
  title: "Word Tower — The Devil's Plan season 1, day 3 prize match",
  name: 'Word Tower (워드 타워)',
  lead: 'Given a theme, share out every letter cube to build as many theme words as there are players, each stacked on a personal mat.',
  summary: 'Use every letter cube to make one theme word per player: a cooperative prize match.',
  setup: [
    { type: 'list', items: [
      '**Players**: everyone not in prison, each with a mat.',
      '**Rounds**: three, each with a theme and a pile of letter cubes.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Build', body: 'Combine cubes into English words on the theme, stacked on each mat as a tower.' },
      { title: 'Conditions', body: 'Within 10 minutes make **one word per player** using **all** the cubes.' },
      { title: 'Next', body: 'Success brings a new theme and cubes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Three rounds cleared adds ₩100 million.',
      'Failing ends it at once, and anyone without a finished word returns a piece.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Themes and cube sets are not fully recorded.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Word Tower is a word puzzle and **an allocation problem**: easy words first leave the last player the awkward letters.' },
    { type: 'cards', items: [
      { title: 'Hard letters first', body: 'Fix words for awkward letters like Q, Z and X first and fit vowel-rich easy words around the leftovers; count all letters and plan word lengths first.' },
      { title: 'Your own mat', body: 'Only those without a word lose a piece, which tempts everyone to build their own first and can leave unusable leftovers: personal insurance against collective success.' },
    ], columns: 1 },
    { type: 'p', text: 'It is cooperative with **no dominant strategy**; one strong speller directing the allocation is the steadiest approach.' },
  ],
  similar: [
    { name: 'Bananagrams', players: '1–8', alike: 'Use up all letter tiles in words, fast.', differs: 'Each player builds a grid in competition, with no theme.' },
    { name: 'Scrabble', players: '2–4', alike: 'Words from given letters.', differs: 'Words interlock on a board for points.' },
  ],
});
