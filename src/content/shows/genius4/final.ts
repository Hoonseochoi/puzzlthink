// 더 지니어스: 그랜드 파이널, round 12 final (best of three, order fixed in advance): 숫자장기, 미스터리 사인.
// The third game, 베팅 흑과 백, was not played and has no page (see the show page).
import { g4Game, wiki4 } from './shared';

const ITEMS_KO = '결승에서는 탈락한 플레이어 11명이 각자 결승 진출자 한 명을 골라 일회용 아이템을 하나씩 건네요. 모든 게임에 쓰는 "아이템 복사하기"(가진 아이템 하나를 두 번 쓰기)와 "상대 아이템 무효화"가 있고, 게임마다 쓰는 아이템이 따로 있어요.';
const ITEMS_EN = 'In the final, each of the eleven eliminated players gives one single-use item to a finalist of their choice. "Copy an item" (use one of your items twice) and "Cancel the opponent’s item" work in every game; the others belong to one game each.';

export const numberJanggi = g4Game({ slug: 'number-janggi', kind: 'final', ep: 12, when: { ko: '결승 1회전', en: 'Final, game 1' }, related: ['janggi', 'cardJanggi', 'blindGomoku'], check: 'one', extra: [wiki4] }, {
  note: '영문 위키백과에는 게임 이름과 결승 순서만 적혀 있어요.',
  meta: {
    title: '숫자장기 규칙 — 더 지니어스 그랜드 파이널 결승 1회전, 숫자를 숨긴 말끼리 맞붙는 장기',
    description: '더 지니어스: 그랜드 파이널 결승 1회전 숫자장기의 규칙을 정리했어요. 6×9 판, 1–10 숫자 말과 지뢰 3개·왕 1개, 뒤집어 배치, 맞닿으면 대결, 합이 10 이상이면 큰 수·미만이면 작은 수 승리, 마이너스 표시, 지뢰와 왕, 끝줄 도착 시 부활, 60초와 네 가지 승리 조건, BLIND·+1·−1 아이템과 승부처까지.',
    keywords: ['숫자장기', '숫자 장기', '더 지니어스 숫자장기', '그랜드 파이널 결승', '더 지니어스 4 결승', '스트라테고'],
  },
  title: '숫자장기 — 더 지니어스: 그랜드 파이널 결승 1회전',
  name: '숫자장기',
  lead: '정체를 숨긴 말 14개를 큰 판에 놓고 전진시켜요. 상대 말과 맞닿으면 두 숫자의 합으로 승패를 가리는데, 합이 10 이상이면 큰 수가, 10 미만이면 작은 수가 이겨요.',
  summary: '숫자를 숨긴 말끼리 맞닿으면 두 수의 합으로 승패를 가리는, 스트라테고를 닮은 결승 1회전 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 2명. 결승은 3전 2선승이고, 세 게임의 순서는 미리 정해져 있었어요.',
      '**게임판**: 가로 6칸, 세로 9칸의 54칸. 자기 앞쪽 3줄이 자기 진영이에요. 판 곳곳에 마이너스 표시가 18개 있어요.',
      '**말 14개**: 1–10 숫자 말 10개, 지뢰 3개, 왕 1개. 앞면에 정체가 적혀 있고, 뒷면은 모두 같아요.',
      '**배치**: 각자 자기 진영에 14개를 자유롭게 놓고, 상대가 볼 수 없게 뒤집어 둬요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '이동', body: '선부터 번갈아 말 하나를 옮겨요. 옆(좌·우)과 대각선으로 1칸, 앞으로는 최대 2칸 갈 수 있고, 뒤로는 못 가요. 말이 있는 칸으로는 못 가고, 2칸 전진할 때 다른 말을 뛰어넘을 수 없어요. 지뢰는 움직일 수 없어요.' },
      { title: '대결', body: '이동 뒤 내 말과 상대 말이 앞·뒤·좌·우로 맞닿으면 즉시 대결해요. 두 말의 앞면을 공개해, 둘 다 숫자 말이면 두 수를 더해요.' },
      { title: '판정', body: '합이 **10 이상이면 큰 수**가, **10 미만이면 작은 수**가 이겨요. 진 말은 판에서 빠지고, 이긴 말은 그대로 남아요. 같은 숫자면 둘 다 빠져요.' },
      { title: '마이너스 대결', body: '맞닿은 두 말 사이에 마이너스 표시가 있으면 합 대신 큰 수에서 작은 수를 뺀 값으로 승부를 정해요.' },
      { title: '지뢰와 왕', body: '지뢰와 대결하면 지뢰와 그 말이 모두 빠져요. 왕은 대결 능력이 없어, 다른 말과 대결하면 바로 빠지고 그쪽이 져요. 왕끼리 만나면 아무 일도 없어요.' },
      { title: '끝줄 도착', body: '내 말이 상대 진영 맨 끝 줄에 닿으면 그 말을 빼고, 이미 빠진 내 말 하나를 숫자가 보이게 되살려 내 진영 맨 끝 줄에 놓아요.' },
    ] },
  ],
  win: [
    { type: 'p', text: '다음 넷 중 하나를 이루는 순간 이겨요.' },
    { type: 'list', ordered: true, items: [
      '상대가 제한 시간(한 차례 60초) 안에 말을 옮기지 못했을 때.',
      '상대의 **왕을 잡았을 때**.',
      '상대의 왕을 뺀 **모든 말을 잡았을 때**.',
      '내 **왕이 상대 진영 맨 끝 줄에 닿았을 때**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '한 말이 셋 이상과 맞닿으면 모든 대결을 동시에 하고, 빠질 조건이 하나라도 맞으면 빠져요.',
      '아이템: **BLIND**는 대결할 때 내 말 하나의 정체를 숨기고 결과만 알려요. **+1**과 **−1**은 대결하는 내 숫자 말에 1을 더하거나 빼요. 모두 대결 전에 쓸지 정하고, 그 대결에만 적용돼요.',
      ITEMS_KO,
      '정리된 규칙 원문에는 이동 방향이 "양, 옆, 좌, 우, 대각선으로 1칸"이라고 적혀 있어요. "좌·우와 대각선 1칸"으로 읽었지만, 뒤쪽 대각선까지 되는지는 분명하지 않아요.',
      '마이너스 대결의 판정은 "뺀 값으로 정한다"고만 적혀 있어요. 정리된 우열 관계를 보면 합 대결과 같은 기준(10 이상이면 큰 수)을 뺀 값에 적용한 것으로 보여요. 그러면 1–10끼리는 뺀 값이 10이 되지 않아 작은 수가 이겨요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '판정 규칙을 정리하면 숫자마다 "누구에게 이기는가"가 정해져요. 합 대결에서 10은 상대가 무엇이든 합이 10 이상이 되니 늘 이기고(같은 10이면 함께 빠짐), 1은 상대가 8 이하면 합이 10 미만이라 이겨요(9를 만나면 합이 10이라 져요). 반대로 5는 상대가 5보다 크면 합이 10 이상이라 지고, 작으면 합이 10 미만이라 또 져요. **5는 합 대결에서 이길 상대가 없는 말**이에요.' },
    { type: 'cards', items: [
      { title: '정체를 알아내는 게임', body: '대결하면 두 말의 숫자가 공개되니, 약한 말로 상대 말을 확인하는 것만으로도 가치가 있어요. 특히 한 말이 상대 말 둘과 동시에 맞닿도록 들어가면 한 번에 둘을 확인할 수 있어요. 지뢰는 움직이지 못하니, 끝까지 한 번도 움직이지 않은 말은 지뢰일 가능성이 커요.' },
      { title: '합인가 차인가', body: '마이너스 표시 위에서 붙으면 판정이 바뀌어 작은 수가 강해져요. 그래서 큰 수(9·10)는 마이너스 표시를 피해 판의 가장자리로, 합과 차 모두에 강한 작은 수(1·2)는 가운데로 보내는 배치가 자연스러워요.' },
      { title: '아이템이 확정승을 만든다', body: '10에 +1을 쓰면 11이 되어 합 대결에서 같은 10에게도 이기고 살아남아요. 1에 −1을 쓰면 0이 되어 차 대결에서 확실히 이겨요. 이런 아이템 앞에서 유일하게 버티는 것은 지뢰예요.' },
    ], columns: 1 },
    { type: 'p', text: '왕은 싸우지 못하지만 상대 끝줄에 닿으면 이기는 말이라, 공격 수단이자 가장 큰 약점이에요. 상대의 말이 줄어들수록 왕의 전진로가 열리고, 남은 말의 숫자가 공개될수록 추리가 쉬워져요. 결국 **상대 말의 정체를 먼저 많이 알아낸 쪽**이 이기는 게임이에요.' },
  ],
  similar: [
    { name: '스트라테고 (Stratego)', players: '2명', alike: '정체를 숨긴 말을 배치하고 움직여, 맞붙을 때만 정체를 공개해 강약을 가려요. 움직이지 못하는 폭탄과 잡히면 지는 깃발도 있어요.', differs: '스트라테고는 계급이 높은 말이 이기는 단순한 서열이고, 숫자의 합으로 판정이 뒤바뀌는 규칙은 없어요.' },
    { name: '군인장기 (Game of the Generals)', players: '2명(+심판)', alike: '정체를 숨긴 말끼리 맞붙으면 심판이 결과만 알려 주는 필리핀의 전략 게임이에요. 깃발이 상대 끝줄에 닿으면 이기는 규칙도 숫자장기의 왕과 닮았어요.', differs: '군인장기는 계급 서열로 판정하고, 대결 뒤에도 말의 정체를 공개하지 않아요.' },
  ],
}, {
  note: 'English Wikipedia gives only the game’s name and its place in the final.',
  meta: {
    title: 'Number Janggi rules — The Genius: Grand Final, final game 1',
    description: 'The rules of Number Janggi (숫자장기), the first game of The Genius: Grand Final’s final: a 6×9 board, pieces 1–10 plus three mines and a king placed face down, battles on contact where a sum of 10 or more favours the higher number and less favours the lower, minus marks, mines and kings, revival at the back row, four ways to win and the BLIND, +1 and −1 items.',
    keywords: ['Number Janggi', 'The Genius Grand Final', 'final', 'Stratego', '숫자장기'],
  },
  title: 'Number Janggi — The Genius: Grand Final, final game 1',
  name: 'Number Janggi (숫자장기)',
  lead: 'Fourteen face-down pieces advance across a large board. When pieces touch they fight by their sum: at 10 or more the higher number wins, below 10 the lower.',
  summary: 'A Stratego-like final game: hidden numbered pieces fight on contact, judged by their sum.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two finalists; the final is best of three, its order fixed in advance.',
      '**Board**: six squares wide and nine deep, 54 in all; the three rows nearest each player are their camp. Eighteen minus marks are scattered across it.',
      '**Fourteen pieces**: numbers 1–10, three mines and a king, identities on the front and identical backs.',
      '**Set-up**: each places all fourteen freely in their camp, face down.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Move', body: 'Take turns moving one piece: one square sideways or diagonally, up to two forward, never backward; not onto occupied squares or jumping over pieces. Mines cannot move.' },
      { title: 'Battle', body: 'When a move leaves your piece orthogonally next to an enemy piece, they fight at once: both are revealed and, if both are numbers, added.' },
      { title: 'Judge', body: 'A sum of **10 or more favours the higher number**, **under 10 the lower**. The loser is removed; equal numbers both go.' },
      { title: 'Minus battle', body: 'If a minus mark lies between them, the difference (larger minus smaller) decides instead of the sum.' },
      { title: 'Mines and kings', body: 'A mine and whatever fights it are both removed. A king cannot fight: in any battle it is removed and its owner loses; two kings meeting do nothing.' },
      { title: 'Back row', body: 'A piece reaching the enemy back row is removed, and one of your lost pieces returns face up to your own back row.' },
    ] },
  ],
  win: [
    { type: 'p', text: 'You win the moment you achieve any of these:' },
    { type: 'list', ordered: true, items: [
      'Your opponent fails to move within the 60-second turn.',
      'You **capture their king**.',
      'You capture **every piece except their king**.',
      'Your **king reaches their back row**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A piece touching three or more enemies fights them all at once and is removed if any removal condition is met.',
      'Items: **BLIND** hides one of your pieces in a battle so only the result is shown; **+1** and **−1** change your number by one. All are declared before the battle and apply to it alone.',
      ITEMS_EN,
      'The transcribed rule reads "one square sideways, left, right, diagonally"; it is read here as sideways and diagonal, but whether backward diagonals are allowed is unclear.',
      'The minus battle is only described as decided "by the difference". The fan wiki’s ranking of pieces suggests the same 10-threshold applied to the difference, in which case between 1 and 10 the lower number always wins.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Work through the judging and each number has fixed prey. In a sum battle a 10 always reaches 10 or more and wins (another 10 trades), and a 1 wins against anything up to 8 (against a 9 the sum is 10 and it loses). A 5 loses to anything larger (sum 10 or more) and anything smaller (sum below 10): **in sum battles a 5 can beat nothing**.' },
    { type: 'cards', items: [
      { title: 'A game of identification', body: 'Battles reveal both numbers, so even a weak piece is useful for scouting, especially one that touches two enemies at once. Mines never move, so a piece that has never moved is probably a mine.' },
      { title: 'Sum or difference', body: 'Fighting across a minus mark favours small numbers, so big numbers (9, 10) belong on the edges away from the marks and small ones (1, 2), strong either way, in the centre.' },
      { title: 'Items make sure wins', body: 'A 10 with +1 becomes 11 and survives even another 10; a 1 with −1 becomes 0 and wins any difference battle. Only a mine stands up to that.' },
    ], columns: 1 },
    { type: 'p', text: 'The king cannot fight but wins by reaching the back row, so it is both a weapon and the biggest weakness. As enemy pieces fall the king’s path opens, and as numbers are revealed deduction gets easier; **whoever identifies more enemy pieces first** usually wins.' },
  ],
  similar: [
    { name: 'Stratego', players: '2', alike: 'Hidden pieces placed and moved, revealed only in battle, with immobile bombs and a flag you must protect.', differs: 'Plain rank order decides battles; no sum that flips the result.' },
    { name: 'Game of the Generals', players: '2 (+ arbiter)', alike: 'A Filipino hidden-piece game where an arbiter reports only the result; a flag reaching the far row wins, like the king here.', differs: 'Rank order decides, and identities stay hidden after battles.' },
  ],
});

export const mysterySign = g4Game({ slug: 'mystery-sign', kind: 'final', ep: 12, when: { ko: '결승 2회전', en: 'Final, game 2' }, related: ['equationTower', 'equationSignal', 'hexagon'], check: 'one', extra: [wiki4] }, {
  note: '영문 위키백과에는 게임 이름과 결승 순서만 적혀 있어요. 방송에 나온 문제와 정답은 이 페이지에 옮기지 않았어요.',
  meta: {
    title: '미스터리 사인 규칙 — 더 지니어스 그랜드 파이널 결승 2회전, 숨은 연산 규칙을 찾아라',
    description: '더 지니어스: 그랜드 파이널 결승 2회전 미스터리 사인의 규칙을 정리했어요. 두 수와 미스터리 사인으로 된 문제, 0이 아닌 수를 하나씩 제시해 얻는 힌트, 1분마다 버저, 정답 +1·오답 −1, 힌트 16개, 11라운드, DOUBLE·SECRET·무감점 아이템과 승부처까지.',
    keywords: ['미스터리 사인', '더 지니어스 미스터리 사인', '그랜드 파이널 결승', '더 지니어스 4 결승', '규칙 찾기 게임'],
  },
  title: '미스터리 사인 — 더 지니어스: 그랜드 파이널 결승 2회전',
  name: '미스터리 사인',
  lead: '"두 수 ◇ 미스터리 사인" 꼴의 문제가 나와요. 두 사람이 수를 하나씩 넣어 같은 규칙으로 계산된 힌트를 받고, 숨은 규칙을 먼저 찾아 정답을 말하는 사람이 점수를 얻어요.',
  summary: '수를 넣어 받은 힌트로 미지의 연산 규칙을 추리해 먼저 답을 맞히는 결승 2회전 귀납 추리 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 진출자 2명.',
      '**문제**: 두 개의 수와 그 사이의 미스터리 사인으로 이루어진 식. 사인이 어떤 계산을 뜻하는지는 알려 주지 않아요.',
      '**라운드**: 11라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '수 제시', body: '문제가 공개되면 두 사람이 0이 아닌 수를 하나씩 제시해요.' },
      { title: '힌트', body: '선 플레이어의 수를 앞에, 후 플레이어의 수를 뒤에 넣어 문제와 같은 규칙으로 계산한 결과가 힌트로 나와요.' },
      { title: '버저 (1분)', body: '힌트가 나오면 1분이 주어지고, 규칙을 찾았으면 버저를 눌러 문제의 답을 말해요. 맞으면 +1점, 틀리면 −1점이고 기회가 상대에게 넘어가요.' },
      { title: '다음 힌트', body: '1분 안에 아무도 맞히지 못하면 다시 수를 하나씩 내 다음 힌트를 받아요. 힌트가 16개 나올 때까지 아무도 못 맞히면 다음 문제로 넘어가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 사람이 정답을 맞히면 그 라운드가 끝나요. 11라운드 뒤 승점이 높은 사람이 이 게임을 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '문제에 나온 수를 힌트용으로 써도 되지만, 두 수를 동시에 똑같이 넣어 문제 자체를 계산하게 할 수는 없어요.',
      '정답을 맞힌 뒤에도 풀이는 상대에게 공개하지 않아요.',
      '아이템: **DOUBLE**은 그 라운드에 맞히면 내 점수만 두 배예요(틀리면 −2가 아니라 −1). **SECRET**은 첫 힌트 때 내가 낸 수를 상대에게 숨겨요. **무감점**은 그 라운드에 틀려도 감점이 없어요. 모두 라운드 시작 전에 쓸지 정해요.',
      ITEMS_KO,
      '규칙에는 "0이 아닌 수"라고만 적혀 있고, 음수나 분수를 낼 수 있는지는 정해져 있지 않았어요. 방송에서는 자연수만 쓰였다고 정리되어 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임은 실험 설계 게임이에요. **내가 어떤 수를 넣느냐가 곧 내가 얻는 정보**예요. 같은 힌트를 둘이 함께 보지만, 앞자리와 뒷자리를 각자 하나씩 정하니, 힌트는 두 사람의 실험이 섞인 결과예요. 좋은 수를 넣으면 규칙이 바로 드러나고, 나쁜 수를 넣으면 상대에게만 유리한 정보가 될 수도 있어요.' },
    { type: 'cards', items: [
      { title: '쉬운 수로 실험하기', body: '1이나 10처럼 계산이 단순한 수를 넣으면 규칙의 모양이 잘 보여요. 예를 들어 한쪽을 1로 고정하면 다른 쪽 수에 따라 결과가 어떻게 바뀌는지 보기 쉬워요. 상대가 무엇을 넣을지 모르니, 상대의 수와 섞여도 의미가 남는 수를 고르는 것이 좋아요.' },
      { title: '버저의 기대값', body: '맞히면 +1, 틀리면 −1이니, 확신이 반을 넘을 때 누르는 것이 이득이에요. 하지만 틀리면 기회가 상대에게 넘어가고, 상대도 같은 힌트를 봤으니 그 사이 규칙을 찾았을 수 있어요. 무감점 아이템은 이 계산을 바꿔, 확신이 낮아도 누를 이유를 만들어요.' },
      { title: '숨기는 것도 전략', body: 'SECRET으로 내 수를 숨기면, 상대는 결과는 보지만 그 결과를 만든 입력을 다 알 수 없어요. 같은 힌트에서 나만 정보를 얻는 셈이에요. 풀이를 공개하지 않는 규칙 때문에, 상대가 맞힌 문제에서 무엇을 놓쳤는지도 알 수 없어요.' },
    ], columns: 1 },
    { type: 'p', text: '숨은 규칙은 라운드마다 달라 외워 둘 수 있는 필승법은 없어요. 사칙연산, 자릿수 다루기, 두 수의 순서가 중요한 계산 등 흔한 규칙의 유형을 빨리 떠올려 하나씩 지워 가는 사람이 유리해요.' },
  ],
  similar: [
    { name: '엘루시스 (Eleusis)', players: '4–8명', alike: '한 사람이 정한 숨은 규칙을, 카드를 내 보고 맞다·틀리다는 반응을 보며 추리해 가는 귀납 추리 카드 게임이에요.', differs: '엘루시스는 규칙을 정하는 사람이 플레이어이고, 숫자 계산이 아니라 카드 순서의 규칙이에요.' },
    { name: '젠도 (Zendo)', players: '2–6명', alike: '예시를 만들어 보여 주고 규칙에 맞는지 확인받으며 숨은 규칙을 찾아요. 실험을 고르는 능력이 핵심이에요.', differs: '젠도는 피라미드 조각 배치의 규칙을 다루고, 정답을 맞히면 그 사람이 다음 규칙을 정해요.' },
  ],
}, {
  note: 'English Wikipedia gives only the game’s name and its place in the final. The puzzles and answers from the broadcast are not reproduced here.',
  meta: {
    title: 'Mystery Sign rules — The Genius: Grand Final, final game 2',
    description: 'The rules of Mystery Sign (미스터리 사인), the second game of The Genius: Grand Final’s final: a puzzle of two numbers and an unknown operator, each player feeding in a nonzero number for a hint, a minute to buzz, +1 or −1, up to 16 hints, eleven rounds, and the DOUBLE, SECRET and no-penalty items.',
    keywords: ['Mystery Sign', 'The Genius Grand Final', 'final', '미스터리 사인'],
  },
  title: 'Mystery Sign — The Genius: Grand Final, final game 2',
  name: 'Mystery Sign (미스터리 사인)',
  lead: 'A puzzle reads "number, mystery sign, number". Each player feeds in a number to get a hint computed by the same hidden rule; the first to crack it and answer scores.',
  summary: 'An induction duel: feed numbers into an unknown operator and be first to work out the puzzle’s answer.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two finalists.',
      '**Puzzle**: two numbers with a mystery sign between them; what the sign computes is not revealed.',
      '**Rounds**: 11.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Numbers in', body: 'When the puzzle appears, each player names one nonzero number.' },
      { title: 'Hint', body: 'The first player’s number goes in front and the second’s behind, and the result under the same rule is shown.' },
      { title: 'Buzz (1 minute)', body: 'After each hint there is a minute to buzz and answer the puzzle: right +1, wrong −1 and the chance passes.' },
      { title: 'Next hint', body: 'If nobody answers within the minute, each names another number for the next hint; after 16 hints without an answer, the next puzzle comes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'A correct answer ends the round; after eleven rounds the higher score wins the game.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Numbers from the puzzle may be used for hints, but not both at once to have the puzzle itself computed.',
      'A correct answer’s reasoning is not shown to the opponent.',
      'Items: **DOUBLE** doubles your points for a correct answer that round (a wrong one costs only −1); **SECRET** hides your first hint number from the opponent; **No penalty** cancels the deduction for a wrong answer that round. All are declared before the round.',
      ITEMS_EN,
      'The rules only said "nonzero"; whether negatives or fractions were allowed was not specified, and only natural numbers were used on air.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is a game of experimental design: **the number you feed in is the information you get**. Both see each hint, but each chooses one slot, so every hint mixes two experiments; a good input exposes the rule, a poor one may help only your opponent.' },
    { type: 'cards', items: [
      { title: 'Experiment with easy numbers', body: 'Simple numbers like 1 or 10 make the shape of the rule visible; fixing one side at 1 shows how the other drives the result. Choose inputs that stay informative whatever your opponent adds.' },
      { title: 'When to buzz', body: '+1 against −1 means buzzing pays once you are more than half sure, but a miss hands over the chance to someone who saw the same hint. The no-penalty item changes the maths and justifies an early buzz.' },
      { title: 'Hiding is a strategy', body: 'With SECRET your opponent sees the output without knowing the full input, so only you learn from that hint. And since solutions are never shown, they can’t learn what they missed.' },
    ], columns: 1 },
    { type: 'p', text: 'Every round has a new rule, so there is no memorised win; the advantage goes to whoever quickly lists the common rule types (arithmetic, digit manipulation, order-dependent operations) and eliminates them one by one.' },
  ],
  similar: [
    { name: 'Eleusis', players: '4–8', alike: 'An induction card game: infer a hidden rule from which plays are accepted.', differs: 'A player sets the rule, and it governs card sequences, not arithmetic.' },
    { name: 'Zendo', players: '2–6', alike: 'Build examples, learn whether they fit, and find the hidden rule; choosing experiments is the skill.', differs: 'Rules concern arrangements of pyramid pieces, and the solver sets the next rule.' },
  ],
});
