// 피의 게임3, days 4–6: 예측승패, 브릭빌드, 수식 링크, 블라인드 베팅.
import { bg3Game } from './shared';

export const predictWins = bg3Game('predict-wins', 'money', '4', ['hitStay', 'heavy13', 'blackWhite'], {
  meta: {
    title: '예측승패 규칙 — 피의 게임3 4일차 머니 챌린지, 이길 횟수를 맞히는 3팀 카드 게임',
    description: '피의 게임3 4일차 머니 챌린지 예측승패의 규칙을 정리했어요. 4색 1–16 카드와 100·0 카드, 오픈 카드, 라운드마다 3턴의 승수 예측, 첫 카드와 오픈 카드의 색을 따라 내기, 점수 계산과 2배 아이템, 전체 승수 예측 보너스까지.',
    keywords: ['예측승패', '피의 게임3 예측승패', '피의게임3 머니 챌린지', '트릭테이킹', '피의게임3'],
  },
  title: '예측승패 — 피의 게임3 4일차 머니 챌린지',
  name: '예측승패',
  lead: '세 팀이 대표를 한 명씩 내 세 판을 겨뤄요. 이번에 몇 판 이길지 미리 말하고, 정확히 맞혀야 점수예요.',
  summary: '오픈 카드와 첫 카드의 색을 따라 내며 겨루는 3인 트릭 게임. 팀은 라운드마다 정확한 승수를 예측해야 점수를 얻어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 낙원·저택·잔해 세 팀. 미리 낸 명단대로 라운드마다 팀에서 한 명씩 나와요(모두 한 번은 나와야 해요).',
      '**카드 72장**: 빨강·파랑·노랑·초록 1–16 각 한 장(64장), 무색 100 카드 4장, 0 카드 4장.',
      '**배분**: 팀마다 숫자 카드 16장, 100 카드 1장, 0 카드 1장을 무작위로 받고, 남은 18장은 오픈 카드로 써요.',
      '**점수**: 팀마다 100점으로 시작해요. 6라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '라운드 준비', body: '나온 사람은 팀 카드 중 3장을 들고 와요. 첫 오픈 카드가 공개되면, 세 턴 중 몇 번 이길지(0–3승) 예측해요.' },
      { title: '선 정하기', body: '가장 낮은 숫자 카드를 가져온 사람이 첫 턴의 선이에요(같으면 그다음으로 낮은 카드). 다음 턴부터는 직전 턴 승자가 선이에요.' },
      { title: '카드 내기', body: '선은 아무 카드나 내요. 둘째·셋째는 **선과 같은 색**을 내야 하고, 없으면 **오픈 카드와 같은 색**, 그것도 없으면 아무 카드나 내요.' },
      { title: '승자', body: '오픈 카드와 같은 색 카드가 있으면 그중 가장 높은 숫자, 없으면 선과 같은 색 중 가장 높은 숫자가 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**예측에 성공한 팀만** 점수를 얻어요: 1승당 10점 + 성공 보너스 10점. 실패하면 오차 1승당 10점을 잃어요.',
      '1라운드와 4라운드 전에 팀 전체의 총 승수(0–18승)도 예측해, 맞히면 각각 50점, 30점을 더 받아요.',
      '6라운드 뒤 **총점 1위 팀이 승리**(팀원마다 면제권 1장과 2,000만 원)하고, **꼴찌 팀**은 투표로 탈락 후보 한 명을 뽑아 데스매치에 보내요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**100 카드**는 색과 상관없이 낼 수 있고 모든 색을 이겨요(여럿이면 마지막에 낸 사람). **0 카드**도 언제든 낼 수 있고 모든 색에 져요(모두 0이면 먼저 낸 사람).',
      '오픈 카드가 0이나 100이면 선이 낸 카드만으로 기준을 정해요.',
      '팀마다 한 번 **2배 아이템**을 쓸 수 있어요. 예측이 맞으면 점수가 두 배, 틀려도 감점은 두 배가 아니에요.',
      '색을 따라 낼 수 있는데 다른 색을 내면 되돌려야 해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '예측승패는 **트럼프(오픈 카드 색)가 매 턴 공개되는 오 헬**이에요. 정확히 맞히는 게임이라, 강한 카드도 원치 않는 승리를 만들면 손해예요.' },
    { type: 'cards', items: [
      { title: '세 장을 고르는 것부터 예측', body: '팀이 가진 18장 중 어떤 3장을 들고 나갈지 정할 때 이미 예측이 시작돼요. 100 카드는 확실한 1승, 0 카드는 확실한 1패라서, 예측을 맞추기 위한 "조절용"으로 쓰기 좋아요.' },
      { title: '0승 예측이 의외로 쉬울 수 있어요', body: '작은 숫자와 0 카드를 들고 가면 이기지 않기는 비교적 쉬워요. 0승은 승리 점수가 없지만 성공 보너스 10점은 받아요. 감점을 피하는 안정적인 선택이에요.' },
      { title: '두 팀이 견제할 수 있어요', body: '세 팀이 한 테이블에 앉으니, 한 팀의 예측을 깨기 위해 다른 두 팀이 일부러 이기거나 져 줄 수 있어요. 예측이 공개되는지에 따라 이 견제가 가능해지는데, 각 팀의 누적 점수가 공개되므로 1위 팀을 겨냥하기 쉬워요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '오 헬 (Oh Hell)', players: '3–7명', alike: '이길 트릭 수를 미리 말하고 정확히 맞혀야 점수를 받는 트릭테이킹이에요.', differs: '오 헬은 트럼프가 라운드 내내 같고, 팀이나 0·100 카드가 없어요.' },
    { name: '위저드 (Wizard)', players: '3–6명', alike: '언제나 이기는 카드와 언제나 지는 카드가 있는 "예측" 트릭 게임이에요.', differs: '위저드는 개인전이고, 트럼프가 라운드마다 한 번 정해져요.' },
  ],
  note: '라운드마다 다른 팀의 예측이 공개되는지는 확인하지 못했어요.',
}, {
  meta: {
    title: 'Predict the Wins rules — The Bloody Game 3, day 4 money challenge',
    description: 'The rules of Predict the Wins (예측승패) from The Bloody Game 3: four colours of 1–16 plus 100 and 0 cards, the open card, predicting wins over three tricks each round, following the lead and open colours, scoring, the double item and the total-wins bonus.',
    keywords: ['Predict the Wins', 'Bloody Game 3 money challenge', 'trick-taking game'],
  },
  title: 'Predict the Wins — The Bloody Game 3, day 4 money challenge',
  name: 'Predict the Wins',
  lead: 'Three teams each send a player to play three tricks. Say how many you will win — and hit it exactly.',
  summary: 'A three-player trick game following the lead and open colours; teams score only for exact predictions.',
  setup: [
    { type: 'list', items: [
      '**Players**: the Paradise, Mansion and Wreckage teams, each sending one player a round by a pre-submitted line-up (everyone plays at least once).',
      '**72 cards**: 1–16 in red, blue, yellow and green, four colourless 100s and four 0s.',
      '**Deal**: each team gets 16 number cards, a 100 and a 0 at random; the other 18 are open cards.',
      '**Score**: teams start on 100. Six rounds.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Prepare', body: 'Each player brings three of the team’s cards; after the first open card is shown, predict 0–3 wins.' },
      { title: 'Leader', body: 'The lowest card brought leads the first trick (ties go to the next lowest); afterwards the trick winner leads.' },
      { title: 'Play', body: 'The leader plays anything; others must follow **the lead colour**, else **the open card’s colour**, else anything.' },
      { title: 'Winner', body: 'The highest card of the open colour, or failing that the highest of the lead colour, wins.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Only correct predictions score**: 10 per win plus 10 for success; a miss loses 10 per trick of error.',
      'Before rounds 1 and 4 teams also predict their total wins (0–18) for 50 and 30 bonus points.',
      'After six rounds **the top team wins** (an immunity pass and ₩20 million each); **the bottom team** votes one member into the death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**100s** may be played anytime and beat every colour (the last one played wins among them); **0s** may be played anytime and lose to every colour (if all play 0, the first wins).',
      'If the open card is a 0 or 100, only the leader’s card sets the standard.',
      'Each team has one **double item**: a correct prediction scores double; a miss is not doubled.',
      'Failing to follow when able must be taken back.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Predict the Wins is **Oh Hell with a trump revealed every trick** (the open card’s colour). It rewards exactness, so a strong card that forces an unwanted win hurts.' },
    { type: 'cards', items: [
      { title: 'Choosing three cards is the prediction', body: 'Which three of the team’s cards to bring already sets the prediction. A 100 is a sure win and a 0 a sure loss — ideal for tuning the count.' },
      { title: 'Zero can be easy', body: 'Small cards and a 0 make losing every trick fairly easy; zero earns the 10-point success bonus and avoids penalties.' },
      { title: 'Two teams can gang up', body: 'Three teams share a table, so two can win or duck tricks to break the third’s prediction; with scores public, the leader is the obvious target.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Oh Hell', players: '3–7', alike: 'Predict your exact tricks and score only for hitting it.', differs: 'Trumps stay fixed for a round, with no teams or 0/100 cards.' },
    { name: 'Wizard', players: '3–6', alike: 'A prediction trick game with cards that always win and always lose.', differs: 'Individual play, with trumps set once per round.' },
  ],
  note: 'Whether other teams’ predictions were visible each round could not be confirmed.',
});

export const brickBuild = bg3Game('brick-build', 'death', '4', ['nonogram', 'starbattle', 'slitherlink'], {
  meta: {
    title: '브릭빌드 규칙 — 피의 게임3 4일차 데스매치, 다섯 방향 그림으로 블록 쌓기',
    description: '피의 게임3 4일차 데스매치 브릭빌드의 규칙을 정리했어요. 위·앞·뒤·왼쪽·오른쪽 평면도와 총 블록 수, 여섯 색 블록으로 입체 구현, 정답 +1·오답 −1, 불가능 선언 ±2, 5라운드와 0점 아래로 안 내려가는 점수까지.',
    keywords: ['브릭빌드', '피의 게임3 브릭빌드', '피의게임3 데스매치', '입체 퍼즐', '피의게임3'],
  },
  title: '브릭빌드 — 피의 게임3 4일차 데스매치',
  name: '브릭빌드',
  lead: '다섯 방향에서 본 그림만 보고, 색 블록으로 그 모양을 실제로 쌓아요. 불가능한 그림이라면 "불가능"을 외쳐요.',
  summary: '다섯 방향 평면도와 블록 수에 맞는 입체를 먼저 쌓는 1:1:1 공간 퍼즐 데스매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 머니 챌린지 최하위자와 지하 감옥 수감자의 1:1:1.',
      '**문제**: 모니터에 정답 모형의 평면도 다섯 장(위·앞·뒤·왼쪽·오른쪽)과 사용된 총 블록 수가 나와요.',
      '**블록**: 여섯 가지 색의 블록.',
      '**라운드**: 5라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '쌓기', body: '다섯 평면도와 블록 수를 모두 만족하는 모양을 쌓아요.' },
      { title: '정답 선언', body: '다 쌓으면 정답을 외쳐요. 맞으면 +1점, 틀리면 −1점이에요. 확인하는 동안 다른 두 사람은 눈을 감고 고개를 돌려요.' },
      { title: '불가능 선언', body: '그림으로는 만들 수 없는 모양이라고 생각되면 정답 선언 뒤 "불가능"이라고 말해요. 맞으면 +2점, 틀리면 −2점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드 뒤 **점수가 가장 낮은 1명이 탈락**해요.',
      '살아남은 두 명은 지금 인원이 가장 적은 팀으로 옮겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '점수는 0점 아래로 내려가지 않아요.',
      '평면도에 색이 표시되므로, 색까지 맞춰야 해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '브릭빌드는 **투영도로 입체를 복원하는** 퍼즐이에요. 다섯 방향의 그림은 각 방향에서 가장 앞에 보이는 블록의 색만 알려 주므로, 안쪽 블록은 블록 수 조건으로 추리해야 해요.' },
    { type: 'cards', items: [
      { title: '위 그림이 기둥을 정해요', body: '위에서 본 그림은 어느 칸에 블록 기둥이 있는지를 알려 줘요. 옆 그림들은 각 줄의 가장 높은 기둥과 그 색을 알려 주고요. 위 그림으로 바닥을 깔고, 옆 그림으로 높이를 맞춘 뒤, 남는 블록 수로 숨은 블록을 조정하는 순서가 기본이에요.' },
      { title: '모순을 찾으면 불가능', body: '불가능은 +2점이라 큰 기회예요. 앞 그림과 뒤 그림은 같은 줄을 반대로 본 것이라, 높이는 거울처럼 같아야 해요. 높이가 맞지 않거나, 그림을 만족하는 최소 블록 수가 주어진 수보다 많으면 불가능이에요.' },
      { title: '빠른 손보다 정확한 눈', body: '틀리면 −1이고 0점 아래로는 안 내려가요. 셋 중 꼴찌만 탈락하므로, 무리한 선언보다 확실한 정답 한 번이 더 안전해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '우봉고 3D (Ubongo 3D)', players: '1–4명', alike: '정해진 모양에 맞게 입체 블록을 빨리 쌓는 속도 퍼즐이에요.', differs: '우봉고 3D는 바닥 모양과 높이 2층만 맞추면 되고, 투영도를 보지 않아요.' },
    { name: '메이크 앤 브레이크 (Make ’N’ Break)', players: '2–5명', alike: '카드에 그려진 구조를 보고 블록으로 똑같이 빨리 쌓는 속도 게임이에요.', differs: '카드에 한 방향 그림만 있고, 투영도를 해석하거나 불가능을 판단할 필요가 없어요.' },
  ],
}, {
  meta: {
    title: 'Brick Build rules — The Bloody Game 3, day 4 death match',
    description: 'The rules of Brick Build from The Bloody Game 3: five views (top, front, back, left, right) and a block count, building the shape in six colours, +1/−1 for answers, ±2 for calling impossible, five rounds and scores that never go below zero.',
    keywords: ['Brick Build', 'Bloody Game 3 death match', '3D puzzle'],
  },
  title: 'Brick Build — The Bloody Game 3, day 4 death match',
  name: 'Brick Build',
  lead: 'From five views alone, build the shape in coloured blocks — or call "impossible" if no shape can match.',
  summary: 'A three-way spatial death match: be first to build a block shape matching five views and a block count.',
  setup: [
    { type: 'list', items: [
      '**Players**: the money challenge’s last place and two prisoners from the underground cell, 1:1:1.',
      '**Problem**: five views of the target (top, front, back, left, right) and the total block count.',
      '**Blocks**: six colours.',
      '**Rounds**: five.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Build', body: 'Build a shape matching all five views and the count.' },
      { title: 'Declare', body: 'Call when done: +1 if right, −1 if wrong. The others close their eyes and turn away while it is checked.' },
      { title: 'Impossible', body: 'If no shape can match, declare and say "impossible": +2 if right, −2 if wrong.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After five rounds **the lowest score is eliminated**.',
      'The two survivors join the team with the fewest members.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Scores never drop below zero.',
      'The views are coloured, so colours must match too.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Brick Build is **reconstructing a solid from projections**. Each view shows only the frontmost block’s colour, so hidden blocks must be deduced from the count.' },
    { type: 'cards', items: [
      { title: 'The top view sets the columns', body: 'It shows which cells have columns; side views give the tallest column and its colour per line. Lay the base from the top, set heights from the sides, then use the remaining count for hidden blocks.' },
      { title: 'Find a contradiction', body: 'Impossible pays +2. Front and back views see the same lines reversed, so heights must mirror; a mismatch, or a minimum block count above the given total, means impossible.' },
      { title: 'Accuracy beats speed', body: 'Wrong costs a point (never below zero) and only last place goes, so one sure answer beats a risky call.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Ubongo 3D', players: '1–4', alike: 'Race to build block shapes to a pattern.', differs: 'You match a footprint two layers high, not projections.' },
    { name: "Make 'N' Break", players: '2–5', alike: 'Race to build the block structure pictured on a card.', differs: 'Cards show a single view; there are no projections to interpret or impossible shapes.' },
  ],
});

export const equationLink = bg3Game('equation-link', 'money', '6', ['equationTower', 'equationSignal', 'hexagon'], {
  meta: {
    title: '수식 링크 규칙 — 피의 게임3 6일차 머니 챌린지, 숨은 카드로 100 만들기',
    description: '피의 게임3 6일차 머니 챌린지 수식 링크의 규칙을 정리했어요. 낙원 곳곳의 카드 수색, 9×9 수식판, 고정된 시작점과 도착점, 이어지는 숫자의 결합, 왼쪽에서 오른쪽 계산, 같은 문양 연결 보너스와 ▼ 2배, 코인과 버리기 비용, 봉투 절도까지.',
    keywords: ['수식 링크', '피의 게임3 수식 링크', '피의게임3 머니 챌린지', '수식 게임', '피의게임3'],
  },
  title: '수식 링크 — 피의 게임3 6일차 머니 챌린지',
  name: '수식 링크',
  lead: '건물 곳곳에 숨은 숫자·기호 카드를 찾아 9×9 판에 깔고, 시작점에서 도착점까지 읽은 수식이 100이 되게 만들어요.',
  summary: '수색으로 모은 카드를 9×9 판에 깔아 값 100인 수식을 만들고, 같은 문양을 길게 이어 보너스를 받는 3팀 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 낙원·저택·잔해 세 팀. 라운드마다 팀당 두 명이 수색해요(명단은 미리 제출).',
      '**카드 200장**: 문양은 클로버·다이아·하트와 특수 문양 ▼. 숫자와 기호가 붙은 두 칸 카드와 숫자만 있는 한 칸 카드가 있어요. 숫자는 1–10, 기호는 사칙연산이에요.',
      '**수식판**: 9×9(81칸). 시작점과 도착점이 고정돼 있어요.',
      '**코인**: 팀마다 20개.',
      '**라운드**: 5라운드(1–3라운드 15분, 4–5라운드 30분). 시작 전 30분 작전 회의.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '수색 (1–4라운드)', body: '피의 낙원 곳곳에 숨은 카드 봉투를 찾아요. 봉투 겉에는 카드의 문양이 적혀 있어요(두 칸 카드는 첫 칸의 문양). 봉투는 라운드 안에 투표룸의 딜러에게 공개해야 판에 쓸 수 있어요.' },
      { title: '5라운드', body: '새로 수색하지 않고, 버려진 카드(남의 것, 우리 것)를 가져와요.' },
      { title: '배치', body: '카드를 판에 맞춰 놓아요(두 칸 카드를 반만 걸칠 수 없고, 돌릴 수도 없어요). 시작점, 도착점, 그리고 가로줄마다 한 곳 이상에는 카드가 있어야 해요.' },
      { title: '계산', body: '첫 줄부터 왼쪽에서 오른쪽으로 차례로 읽어요. 이어지는 숫자는 줄이 바뀌거나 빈칸이 있어도 하나의 여러 자리 수로 합쳐져요. 시작점부터 도착점까지 한 줄로 펼친 수식처럼 계산해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '수식값 **100**을 만들면, 같은 문양 카드를 맞닿게 이은 개수(n)에 따라 보너스를 받아요. 6–10장 n×5, 11–15장 n×10, 16장 이상 n×15점이고, **▼ 문양은 두 배**예요.',
      '**점수 1위 팀이 승리**해 팀원마다 2,000만 원과 면제권 1장을 받고, 남은 코인 5개당 1,000만 원도 받아요. 진 두 팀은 투표로 한 명씩 뽑아 1:1 데스매치를 해요.',
      '동점이면 먼저 제출한 팀이 위예요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '카드는 투표룸에서만 버릴 수 있고, 버려진 카드는 누구나 가져갈 수 있어요. 4라운드까지는 버리기가 공짜이고, 5라운드부터는 장당 3코인이에요. 코인이 모자라면 1코인당 5점을 잃어요.',
      '수색 담당은 다른 팀 수색 담당이 가진 봉투를 훔칠 수 있어요.',
      '수식판은 야외 탁자에 고정돼 있어, 제출할 때 말고는 옮길 수 없어요.',
      '문양별 카드 수나 한 칸·두 칸 카드의 수는 공개되지 않아요. 두 칸 카드의 두 칸은 문양이 서로 달라요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '수식 링크는 **숫자 이어 붙이기**가 열쇠예요. 연속된 숫자가 여러 자리 수로 합쳐지므로, 예를 들어 "5"와 "0"이 이어지면 50이 되고, 여기에 "×2"만 붙여도 100이 돼요.' },
    { type: 'cards', items: [
      { title: '100은 짧은 수식으로 만들어요', body: '수식은 하나여야 하고 값이 정확히 100이어야 해요. 긴 수식은 계산 실수가 쉽고 카드도 많이 들어요. 50×2, 10×10, 99+1처럼 짧은 핵심 수식을 먼저 정하고, 나머지 칸은 "+0"이나 "×1"처럼 값을 바꾸지 않는 카드로 길게 늘려 문양 보너스를 노리는 것이 효율적이에요.' },
      { title: '보너스가 점수의 대부분', body: '같은 문양 16장 이상이면 n×15점, ▼라면 n×30점이라, 100을 만드는 것보다 같은 문양을 길게 잇는 것이 점수를 정해요. 봉투 겉면의 문양만 보고 같은 문양 봉투를 모아 오는 수색 전략이 중요해요.' },
      { title: '수색은 몸싸움이 아닌 정보 싸움', body: '봉투에 문양만 보이고 숫자는 열어 봐야 알아요. 남의 봉투를 훔칠 수 있어서, 같은 문양을 노리는 다른 팀의 수색자를 견제하는 것도 전략이에요. 5라운드에 버려진 카드를 주워 가는 규칙 때문에, 버리는 카드는 상대에게 선물이 될 수 있어요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '숫자와 연산을 묶어 목표 값을 만드는 계산 게임이에요.', differs: '크립토는 카드를 찾을 필요가 없고, 판에 배치하지도 않아요.' },
    { name: '카르카손 (Carcassonne)', players: '2–5명', alike: '같은 무늬(지형)를 길게 이을수록 점수가 커지는 타일 배치 게임이에요.', differs: '카르카손은 무작위로 뽑은 타일을 놓고, 수식이 없어요.' },
  ],
}, {
  meta: {
    title: 'Equation Link rules — The Bloody Game 3, day 6 money challenge',
    description: 'The rules of Equation Link (수식 링크) from The Bloody Game 3: searching the Paradise for cards, a 9×9 board with fixed start and end, digits that join into numbers, reading left to right, bonuses for linking one suit and double for the ▼ symbol, coins and discard costs, and stealing envelopes.',
    keywords: ['Equation Link', 'Bloody Game 3 money challenge', 'maths game'],
  },
  title: 'Equation Link — The Bloody Game 3, day 6 money challenge',
  name: 'Equation Link',
  lead: 'Find number and operator cards hidden around the building, lay them on a 9×9 board, and make the equation read from start to end equal 100.',
  summary: 'Three teams search for cards, lay them on a 9×9 board to make 100, and link one suit for bonuses.',
  setup: [
    { type: 'list', items: [
      '**Players**: Paradise, Mansion and Wreckage teams; two searchers per team each round (line-up submitted in advance).',
      '**200 cards**: clubs, diamonds, hearts and the special ▼ symbol; two-cell cards (number plus operator) and one-cell cards (number). Numbers 1–10, the four operations.',
      '**Board**: 9×9 with fixed start and end points.',
      '**Coins**: 20 per team.',
      '**Rounds**: five (15 minutes for 1–3, 30 for 4–5), after 30 minutes of planning.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Search (rounds 1–4)', body: 'Find card envelopes hidden in the Paradise; each shows its card’s suit (the first cell’s for two-cell cards). An envelope must be opened with the dealer in the voting room within the round to be usable.' },
      { title: 'Round 5', body: 'No searching; take discarded cards instead.' },
      { title: 'Place', body: 'Cards must fit the grid (no half-placed two-cell cards, no rotating). The start, the end and at least one cell per row must be filled.' },
      { title: 'Calculate', body: 'Read row by row, left to right. Consecutive digits join into one number even across rows or gaps; the whole board reads as one equation from start to end.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'If the value is **100**, bonuses come from the number n of adjacent same-suit cards: 6–10 n×5, 11–15 n×10, 16+ n×15, **double for ▼**.',
      '**The top team wins** ₩20 million and an immunity pass each, plus ₩10 million per five coins left; the other two teams each vote one member into a 1:1 death match.',
      'Ties go to the team that submitted first.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Cards may only be discarded in the voting room, and anyone may take discards. Discarding is free through round 4 and costs 3 coins a card from round 5; each missing coin costs 5 points.',
      'Searchers may steal envelopes from other teams’ searchers.',
      'The board is fixed to an outdoor table and cannot be moved except to submit.',
      'Card counts by suit or size are secret; a two-cell card’s cells always differ in suit.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The key to Equation Link is **joining digits**: a 5 followed by a 0 is 50, and a single ×2 then makes 100.' },
    { type: 'cards', items: [
      { title: 'Make 100 with a short core', body: 'One equation, exactly 100: long ones invite mistakes and eat cards. Fix a short core (50×2, 10×10, 99+1) and pad the rest with value-neutral cards like +0 or ×1 to lengthen suit chains.' },
      { title: 'Bonuses are most of the score', body: 'Sixteen linked cards pay n×15, ▼ n×30, so chaining one suit outweighs making 100. Collecting envelopes of one suit by their covers is the search plan.' },
      { title: 'Searching is about information', body: 'Envelopes show only the suit; numbers appear on opening. Stealing is allowed, so watching rival searchers after the same suit matters, and round-5 scavenging makes your discards possible gifts.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Krypto', players: '1+', alike: 'Combine numbers and operations to hit a target.', differs: 'No searching or board placement.' },
    { name: 'Carcassonne', players: '2–5', alike: 'Longer chains of matching features score more.', differs: 'Tiles are drawn at random; there is no arithmetic.' },
  ],
  note: '보드의 시작점·도착점 위치는 적지 않았어요.',
});

export const blindBetting = bg3Game('blind-betting', 'death', '6', ['indianPoker', 'twoSidedPoker', 'hitStay'], {
  meta: {
    title: '블라인드 베팅 규칙 — 피의 게임3 6일차 데스매치, 내 카드만 못 보는 베팅',
    description: '피의 게임3 6일차 데스매치 블라인드 베팅의 규칙을 정리했어요. 1–12 블라인드 카드와 1–10 오픈 카드, 상대 카드만 보이는 베팅, 콜·레이즈·폴드, 오픈 카드를 더한 합의 대결, 11·12 포기 벌칙과 1·2 승리 보너스, 2라운드와 필기 금지까지.',
    keywords: ['블라인드 베팅', '피의 게임3 블라인드 베팅', '피의게임3 데스매치', '인디언 포커', '피의게임3'],
  },
  title: '블라인드 베팅 — 피의 게임3 6일차 데스매치',
  name: '블라인드 베팅',
  lead: '이마의 카드처럼, 상대의 블라인드 카드는 보이고 내 것은 안 보여요. 베팅이 끝나면 내 손의 카드 한 장을 더해 합으로 겨뤄요.',
  summary: '내 블라인드 카드만 모른 채 베팅하고, 손에 든 1–10 카드 한 장을 더해 합으로 겨루는 1:1 데스매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**오픈 카드**: 각자 1–10 한 벌(손에 들고 한 장씩 써요).',
      '**블라인드 카드**: 1–12 두 벌. 딜러가 한 장씩 각자 앞에 놓아요.',
      '**칩**: 각자 30개.',
      '**라운드**: 2라운드(라운드마다 오픈 카드 10장을 다 쓸 때까지).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '블라인드', body: '내 블라인드 카드는 볼 수 없고, 상대 것만 보여요.' },
      { title: '베팅', body: '직전 턴 승자부터, 기본 1개 뒤 레이즈·콜·폴드를 해요. 상대의 남은 칩보다 많이 레이즈할 수는 없어요.' },
      { title: '오픈 카드 내기', body: '베팅이 맞춰지면 각자 남은 오픈 카드 중 한 장을 골라 내요.' },
      { title: '승부', body: '블라인드 카드와 오픈 카드를 함께 공개해 **합이 큰 쪽**이 판돈을 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '2라운드 뒤 **칩이 많은 사람**이 이겨요. 상대의 칩을 모두 빼앗으면 바로 이겨요(벌칙 포함).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '폴드하면 오픈 카드를 내지 않고 상대가 판돈을 가져가요. 이때 **내 블라인드가 11이나 12였다면** 칩 10개를 벌칙으로 더 내요.',
      '**오픈 카드 1이나 2로 이기면** 판돈과 별도로 상대에게서 칩 10개를 더 받아요.',
      '필기도구를 쓸 수 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '블라인드 베팅은 **인디언 포커에 "손패 한 장"을 더한** 게임이에요. 블라인드 카드는 운이지만, 오픈 카드 열 장은 한 번씩만 쓸 수 있어 어느 판에 큰 카드를 쓸지가 전략이 돼요.' },
    { type: 'cards', items: [
      { title: '상대 블라인드로 판의 크기를 정해요', body: '상대 블라인드가 높으면 상대는 작은 오픈 카드로도 이길 수 있어요. 내 블라인드는 모르니, 상대의 베팅 태도로 짐작해야 해요. 상대가 나를 보고 크게 걸면 내 블라인드가 낮을 가능성이 커요.' },
      { title: '1·2의 반전', body: '오픈 카드 1이나 2로 이기면 10개를 더 받아요. 내 블라인드가 높다고 짐작될 때(상대가 소극적일 때) 작은 오픈 카드로 이기면 큰 보상이 돼요. 반대로 상대가 1·2를 남겨 두었다면, 그 카드가 나올 판을 조심해야 해요.' },
      { title: '11·12 폴드 벌칙', body: '높은 블라인드를 들고 포기하면 10개를 더 잃어요. 상대가 계속 레이즈해서 포기하게 만들려는 압박에 넘어가면 손해가 커져요. 상대가 나를 보고 강하게 나온다면, 내 블라인드가 낮을 확률과 벌칙의 크기를 함께 따져 봐야 해요.' },
      { title: '오픈 카드 카운팅', body: '양쪽 오픈 카드는 1–10 한 벌씩이라, 상대가 이미 쓴 카드를 기억하면 상대의 남은 최대값을 알 수 있어요. 필기가 금지라 기억이 곧 무기예요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '인디언 포커', players: '2명 이상', alike: '자기 카드는 못 보고 상대 카드만 보며 베팅하는 바탕이 같아요.', differs: '인디언 포커는 이마의 카드 한 장으로만 겨루고, 손패를 더하지 않아요.' },
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '남의 카드는 보이고 내 카드는 보이지 않는 정보 구조예요.', differs: '하나비는 협력 게임이고 베팅이 없어요.' },
  ],
}, {
  meta: {
    title: 'Blind Betting rules — The Bloody Game 3, day 6 death match',
    description: 'The rules of Blind Betting from The Bloody Game 3: blind cards 1–12 and open cards 1–10, betting while seeing only the opponent’s blind card, call, raise and fold, adding an open card and comparing totals, the penalty for folding an 11 or 12, the bonus for winning with a 1 or 2, two rounds and no notes.',
    keywords: ['Blind Betting', 'Bloody Game 3 death match', 'Indian poker variant'],
  },
  title: 'Blind Betting — The Bloody Game 3, day 6 death match',
  name: 'Blind Betting',
  lead: 'Like a card on your forehead, you see your opponent’s blind card but not your own. After betting, add one card from your hand and compare totals.',
  summary: 'A 1:1 death match: bet without seeing your own blind card, then add one of your 1–10 cards and compare.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Open cards**: a set of 1–10 each, held and used once each.',
      '**Blind cards**: two sets of 1–12; one is placed in front of each player.',
      '**Chips**: 30 each.',
      '**Rounds**: two (each until all ten open cards are used).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Blind', body: 'You cannot see your own blind card, only the opponent’s.' },
      { title: 'Betting', body: 'From the last winner: a one-chip base, then raise, call or fold, never raising beyond the opponent’s remaining chips.' },
      { title: 'Open card', body: 'Once bets match, each plays one remaining open card.' },
      { title: 'Showdown', body: 'Blind plus open card: **the higher total** takes the pot.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After two rounds **more chips** wins; taking all the opponent’s chips (penalties included) wins at once.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A fold plays no open card and hands over the pot; **folding with a blind 11 or 12** costs 10 extra chips.',
      '**Winning with an open 1 or 2** takes 10 extra chips from the opponent.',
      'No writing.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Blind Betting is **Indian poker plus one card from your hand**. The blind is luck, but each of ten open cards is used once, so where to spend big ones is the strategy.' },
    { type: 'cards', items: [
      { title: 'Their blind sizes the pot', body: 'A high opposing blind wins even with a small open card. Your own blind must be read from their betting: a big bet against you suggests your blind is low.' },
      { title: 'The 1-and-2 twist', body: 'Winning with a 1 or 2 pays 10 more, so when your blind seems high (they play timidly), win cheaply. Track whether they still hold 1 or 2.' },
      { title: 'The 11-12 fold penalty', body: 'Folding a high blind costs 10 extra, so giving in to pressure can be costly; weigh the chance your blind is low against the penalty.' },
      { title: 'Count open cards', body: 'Each side has one 1–10 set, so remembering what they have played tells you their remaining maximum — and notes are forbidden.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Indian poker', players: '2+', alike: 'Bet seeing the other’s card but not your own.', differs: 'Only the forehead card counts; no hand card is added.' },
    { name: 'Hanabi', players: '2–5', alike: 'You see others’ cards but not yours.', differs: 'It is cooperative, with no betting.' },
  ],
});
