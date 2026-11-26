// 2048 guide. Rules and numbers follow src/lib/merge2048.ts (SIZE 4, two starting blocks, spawn 2 at 90 % / 4 at 10 % from
// a seeded generator after every move that changes the board, merges from the edge the blocks move towards, one merge
// per block per move, score = the merged blocks' values, canMove), src/lib/merge2048Room.ts (2–4 players, one seed,
// 5 or 10 minutes, ranked by biggest block then score, a stuck board stops), src/components/merge2048/Merge2048Game.tsx
// (free play with one-step undo and autosave, 챌린지 도전 with no undo until stuck), and the Merge2048 /
// Merge2048Guide messages (block characters and legend names).
// The line results and the chain example below were produced by the game's own move() (spawn positions depend on the seed).
import type { GameGuide, GuideBlock } from './types';

const board = (rows: number[][], caption: string): GuideBlock => ({
  type: 'table',
  caption,
  head: ['', '1', '2', '3', '4'],
  rows: rows.map((r, i) => [String(i + 1), ...r.map((v) => (v ? String(v) : '·'))]),
});
const B0 = [[2, 0, 0, 0], [4, 0, 0, 2], [8, 2, 0, 16], [128, 64, 32, 16]];
const B1 = [[2, 2, 0, 0], [4, 0, 0, 0], [8, 2, 0, 2], [128, 64, 32, 32]];
const B2 = [[4, 0, 0, 0], [4, 0, 0, 0], [8, 4, 0, 0], [128, 64, 64, 2]];
const B4 = [[4, 0, 0, 0], [4, 2, 0, 2], [8, 4, 0, 0], [256, 2, 0, 0]];

const guide: GameGuide = {
  game: 'merge2048',
  origin: { kind: 'classic' },
  updated: '2026-11-26',
  related: ['sudoku', 'nemoCount', 'equationTower', 'gyulhap'],
  inlineNamespace: 'Merge2048Guide',
  ko: {
    meta: {
      title: '2048 공략 — 구석 전략, 합치기 규칙, 점수 계산까지 | PUZZLTHINK',
      description: '2048 잘하는 법이 궁금하다면? 한 번에 한 번만 합쳐지는 규칙, 구석에 큰 블럭을 두는 이유, 줄을 큰 순서로 잇는 뱀 모양, 실제 판으로 따라 하는 연쇄 합치기, 점수가 쌓이는 원리, 친구 대결과 챌린지 요령까지 정리했어요.',
      keywords: ['2048 공략', '2048 잘하는 법', '2048 전략', '2048 구석 전략', '2048 규칙', '2048 점수', '2048 팁', '2048 친구 대결'],
    },
    title: '2048 공략',
    lead: '구석 하나, 줄 하나, 방향 둘. 높은 블럭은 대부분 이 셋에서 나와요.',
    intro: [
      '2048은 4×4 판의 숫자 블럭을 상하좌우로 밀어서, 같은 숫자끼리 부딪히면 하나로 합쳐 두 배로 만드는 퍼즐이에요. 밀 때마다 빈칸에 새 블럭이 하나씩 생기니 판은 점점 차고, 더는 밀 수 없게 되면 끝나요. 규칙은 1분이면 배우지만, 판을 어떻게 정리하느냐에 따라 256에서 멈추기도 하고 4096을 넘기도 해요.',
      '이 공략은 합치기 규칙의 세부부터 시작해, 큰 블럭을 한 구석에 두는 이유와 줄을 큰 순서로 잇는 방법, 실제 판에서 한 번에 연쇄로 합쳐지는 과정, 점수가 어떻게 쌓이는지를 차례로 다뤄요. PUZZLTHINK의 자유 플레이·챌린지 도전·친구 대결에서 쓰는 요령도 정리했어요.',
    ],
    gamePageTitle: '2048 — 네모가 바둑알이 될 때까지, 힐링 숫자 퍼즐',
    summary: '합치기 규칙의 세부, 구석 전략, 연쇄 합치기 따라 하기, 점수 계산.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '2048은 어디서 왔나요',
        blocks: [
          { type: 'p', text: '2048은 2014년 이탈리아의 개발자 가브리엘레 치룰리(Gabriele Cirulli)가 오픈소스로 공개한 웹 게임이에요. 공개 당시 소개 글에 밝혔듯 앞서 나온 「1024」를 바탕으로 했고, 숫자 타일을 밀어 합친다는 발상은 「Threes!」와 닮았어요. 누구나 고쳐 쓸 수 있는 오픈소스였던 덕분에 수많은 변형판이 나오며 전 세계로 퍼졌어요.' },
          { type: 'p', text: 'PUZZLTHINK의 2048은 같은 규칙을 표정 있는 캐릭터 블럭으로 다시 그렸어요. 2부터 64까지는 파스텔 네모, 128부터 1024까지는 바둑알, 2048부터는 왕관을 쓴 전설 블럭(금빛 바둑알, 흑돌 왕, 백돌 왕, 오로라 바둑알, 우주 바둑알)이에요. 한 번 만든 블럭은 도감에 색이 채워져요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판**: 4×4, 16칸. 처음에는 블럭 두 개가 놓여 있어요.',
            '**밀기**: 상하좌우 중 한 방향으로 밀면 모든 블럭이 그 방향 끝까지 미끄러져요.',
            '**합치기**: 같은 숫자 두 블럭이 부딪히면 하나로 합쳐져 두 배가 되고, 합쳐진 숫자만큼 점수가 올라요.',
            '**한 번에 한 번**: 한 번 밀 때 한 블럭은 한 번만 합쳐져요. 2·2·2·2를 왼쪽으로 밀면 4·4가 되지 8이 되지 않아요.',
            '**새 블럭**: 블럭이 하나라도 움직이거나 합쳐지면 빈칸 하나에 새 블럭이 생겨요. 90%는 2, 10%는 4예요. 아무것도 바뀌지 않는 방향으로는 밀리지 않고, 새 블럭도 생기지 않아요.',
            '**끝**: 빈칸이 없고, 상하좌우로 이웃한 같은 숫자도 없으면 끝나요. 2048을 만들어도 끝나지 않고 계속할 수 있어요.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '합치기의 세부 — 어느 쪽이 먼저 합쳐지나요',
        blocks: [
          { type: 'p', text: '합치기는 **미는 방향의 끝에서부터** 차례로 일어나요. 아래 표는 한 줄을 왼쪽으로 밀었을 때의 결과로, 게임 엔진에서 그대로 계산한 거예요.' },
          { type: 'table', caption: '한 줄을 왼쪽으로 밀 때 (· = 빈칸)', head: ['밀기 전', '민 뒤', '얻는 점수', '이유'], rows: [
            ['2 2 2 2', '4 4 · ·', '8', '앞의 두 개, 뒤의 두 개가 따로 합쳐져요.'],
            ['2 2 2 ·', '4 2 · ·', '4', '왼쪽 끝의 두 개가 먼저 합쳐지고, 세 번째는 남아요.'],
            ['4 2 2 ·', '4 4 · ·', '4', '새로 생긴 4는 이번 밀기에서 다시 합쳐지지 않아요.'],
            ['2 2 4 4', '4 8 · ·', '12', '두 쌍이 각각 합쳐져요.'],
            ['8 · 8 8', '16 8 · ·', '16', '빈칸은 건너뛰고, 끝 쪽의 두 8이 먼저 만나요.'],
            ['2 · · 2', '4 · · ·', '4', '사이가 비어 있으면 멀리 떨어져 있어도 합쳐져요.'],
          ] },
          { type: 'cards', items: [
            { title: '오른쪽으로 밀면 반대예요', body: '2·2·2를 오른쪽으로 밀면 오른쪽 끝의 두 개가 먼저 합쳐져 ·,·,2,4가 돼요. 같은 줄이라도 방향에 따라 남는 블럭의 자리가 달라요.' },
            { title: '되돌리기와 새 블럭', body: '자유 플레이의 되돌리기는 한 수 전으로 돌아가요. 새 블럭은 정해진 순서로 나오기 때문에, 되돌린 뒤 같은 방향으로 밀면 같은 자리에 같은 블럭이 다시 나와요. 다른 방향으로 밀어야 결과가 달라져요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 구석 하나를 집으로',
        blocks: [
          { type: 'p', text: '높은 숫자까지 가는 사람들은 대부분 같은 방법을 써요. **가장 큰 블럭을 한 구석에 붙여 두고, 그 구석에서 멀어지는 방향은 되도록 쓰지 않는 것**이에요.' },
          { type: 'list', ordered: true, items: [
            '**구석 정하기**: 예를 들어 왼쪽 아래를 집으로 정해요. 가장 큰 블럭은 항상 그 칸에 있게 해요.',
            '**두 방향 위주로**: 왼쪽과 아래를 번갈아 써요. 오른쪽은 가끔, 위쪽은 정말 다른 수가 없을 때만 써요.',
            '**맨 아랫줄을 꽉 채워 두기**: 맨 아랫줄 네 칸이 다 차 있으면 왼쪽·오른쪽으로 밀어도 그 줄이 흐트러지지 않아요. 아랫줄에 빈칸이 있을 때 위로 밀면 새 블럭이 구석으로 들어올 수 있어요.',
            '**급하게 합치지 않기**: 합칠 수 있다고 다 합치기보다, 큰 블럭이 구석에서 떨어지지 않는 수를 먼저 고르세요.',
          ] },
          { type: 'callout', tone: 'warn', title: '위로 밀어야 할 때', text: '다른 방향이 모두 막혀 위로 밀어야 한다면, 그다음 수에 바로 아래로 밀어 큰 블럭을 제자리로 돌려놓으세요. 그 사이 빈 구석에 2나 4가 들어오면 큰 블럭이 갇힐 수 있어요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 하기 — 한 줄이 연쇄로 합쳐지는 순간',
        lead: '왼쪽 아래를 집으로 쓰는 판이에요. 새 블럭의 자리는 판마다 달라지니, 합쳐지는 흐름에 주목해 보세요.',
        blocks: [
          board(B0, '시작. 맨 아랫줄이 128·64·32·16으로 큰 순서로 이어져 있고, 그 위에 16이 하나 더 있어요.'),
          { type: 'steps', items: [
            { title: '아래로 밀기 (+32)', body: '4열의 16 두 개가 합쳐져 아랫줄 끝이 32가 돼요. 이제 아랫줄은 128·64·32·32. 왼쪽 1열의 2·4·8·128은 이미 바닥까지 붙어 있어서 움직이지 않아요.' },
            { title: '왼쪽으로 밀기 (+72)', body: '아랫줄의 32 두 개가 합쳐져 64가 되고, 다른 줄에서도 2+2, 2+2가 합쳐져요. 아랫줄은 128·64·64, 그리고 빈 끝칸에 새 2가 들어왔어요.' },
            { title: '왼쪽으로 한 번 더 (+128)', body: '64 두 개가 합쳐져 128. 아랫줄이 128·128·2가 돼요. 한 번 밀 때 한 번만 합쳐지기 때문에, 새 128은 이번에는 옆의 128과 합쳐지지 않아요.' },
            { title: '왼쪽으로 마지막 (+256)', body: '128 두 개가 합쳐져 구석에 256이 생겨요. 네 번 미는 동안 얻은 점수는 32 + 72 + 128 + 256 = 488점이에요.' },
          ] },
          board(B1, '아래로 민 뒤 (1행 2열의 2는 새 블럭)'),
          board(B2, '왼쪽으로 한 번 민 뒤'),
          board(B4, '왼쪽으로 세 번 민 뒤: 구석의 256'),
          { type: 'callout', tone: 'tip', title: '왜 큰 순서로 이어 두나요', text: '맨 아랫줄이 128·64·32·16처럼 큰 순서였기 때문에, 끝의 16 하나가 맞춰지자 32 → 64 → 128 → 256으로 줄을 따라 차례로 합쳐졌어요. 순서가 뒤섞여 있었다면 같은 블럭끼리 만나지 못해 판에 남았을 거예요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 뱀 모양으로 줄 잇기',
        blocks: [
          { type: 'p', text: '맨 아랫줄을 큰 순서로 채웠다면, 그 위의 줄은 **반대 방향으로** 이어서 큰 순서를 계속 잇는 게 좋아요. 맨 아랫줄이 왼쪽부터 512·256·128·64라면, 그 윗줄은 오른쪽부터 32·16·8·4로 이어 가는 식이에요. 판 전체가 구불구불한 한 줄이 되어, 끝에서 하나가 맞춰지면 줄을 따라 연쇄로 합쳐져요.' },
          { type: 'list', items: [
            '**윗줄 끝을 아랫줄 끝에 맞추기**: 아랫줄의 가장 작은 블럭(오른쪽 끝) 바로 위에 같은 숫자를 만들면, 아래로 한 번 밀어 합칠 수 있어요.',
            '**새 블럭은 판의 반대편에서**: 2와 4는 큰 블럭에서 먼 쪽(위쪽 오른편)에서 키워 내려보내요.',
            '**빈칸 수 세기**: 빈칸이 서너 개 아래로 떨어지면 위험 신호예요. 작은 블럭끼리 합쳐 빈칸을 먼저 늘리세요.',
            '**4를 경계하기**: 새 블럭의 10%는 4예요. 2만 기다리는 자리에 4가 들어오면 줄이 막히니, 한 칸만 남은 자리에 기대를 걸지 마세요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 — 점수는 어떻게 쌓이나요',
        blocks: [
          { type: 'p', text: '점수는 합쳐질 때 새로 생긴 블럭의 숫자만큼 올라요. 그래서 큰 블럭 하나에는 그 블럭을 만드는 동안의 모든 합치기 점수가 담겨 있어요.' },
          { type: 'list', items: [
            '4를 2+2로 만들면 4점. 8은 8 + (4를 두 번) = 16점. 16은 16 + 16 × 2 = 48점이에요.',
            '이렇게 2만으로 2의 n제곱 블럭을 만들면 (n − 1) × 2ⁿ점이 쌓여요. 2048(2의 11제곱)은 10 × 2048 = **20,480점**이에요.',
            '새 블럭으로 4가 나오면 2+2를 합치는 점수 4점이 빠지니, 실제 점수는 이보다 조금 낮아요.',
          ] },
          { type: 'table', caption: '2만으로 만들었을 때 블럭 하나에 담긴 점수', head: ['블럭', '점수'], rows: [
            ['128', '768'], ['256', '1,792'], ['512', '4,096'], ['1024', '9,216'], ['2048', '20,480'], ['4096', '45,056'],
          ] },
          { type: 'p', text: '그래서 점수만 보고도 대략 어디까지 갔는지 알 수 있어요. 챌린지 도전 랭킹에서 2만 점을 넘었다면 2048을 만들었을 가능성이 커요. 4×4 판에서 이론적으로 만들 수 있는 가장 큰 블럭은 131072예요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**네 방향을 고르게 쓰기**: 큰 블럭이 판 가운데로 끌려 나와 구석이 비고, 작은 블럭이 그 사이를 막아요.',
            '**아랫줄에 빈칸 남기기**: 빈칸이 있는 줄은 좌우로 밀 때 블럭이 움직여 순서가 깨져요.',
            '**큰 블럭 옆에 작은 블럭 끼우기**: 512 옆에 2가 붙으면 그 2를 키울 때까지 줄이 멈춰요.',
            '**되돌리기에 기대기**: 자유 플레이의 되돌리기는 한 수뿐이에요. 같은 방향으로 다시 밀면 같은 결과가 나와요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — 자유 플레이, 챌린지 도전, 친구 대결',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['자유 플레이', '시간 제한 없이, 한 수 되돌리기가 있어요. 판이 이 브라우저에 자동 저장돼서 나중에 이어서 할 수 있어요.'],
            ['챌린지 도전', '되돌리기 없이 더는 밀 수 없을 때까지 한 판을 이어 가요. 그때의 점수가 2048 랭킹에 올라가요(로그인 필요). 판은 자동 저장되지만, 새로 시작하면 진행 중인 판은 기록되지 않아요.'],
            ['친구·공개방 대결', '2~4명이 같은 시드로 각자 판을 시작해, 5분이나 10분 동안 겨뤄요. 가장 큰 블럭을 만든 사람이 이기고, 같으면 점수가 높은 사람이 이겨요. 판이 막히면 그 자리에서 기록이 멈춰요.'],
          ] },
          { type: 'p', text: '대결은 같은 시드로 시작해 처음 판과 새 블럭의 숫자(2인지 4인지) 순서가 같아요. 다만 새 블럭이 들어갈 자리는 각자의 빈칸에 따라 달라져요. 시간이 정해진 대결에서는 막히지 않는 게 먼저예요. 남은 시간이 적을 때만 과감하게 합치세요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '구석 전략', def: '가장 큰 블럭을 한 구석에 고정하고 그 구석에서 멀어지는 방향을 피하는 방법.' },
            { term: '뱀 모양', def: '줄마다 방향을 바꿔 판 전체를 큰 순서의 한 줄로 잇는 배치.' },
            { term: '연쇄 합치기', def: '큰 순서로 이어진 줄의 끝이 맞춰지면서 여러 블럭이 차례로 합쳐지는 것.' },
            { term: '시드', def: '새 블럭의 순서를 정하는 값. 대결에서는 모두 같은 시드로 시작해요.' },
            { term: '전설 블럭', def: 'PUZZLTHINK 2048에서 2048 이상의 왕관 쓴 블럭. 금빛 바둑알부터 우주 바둑알까지 있어요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '2048은 어디서 할 수 있나요?', a: 'PUZZLTHINK 2048 페이지에서 가입이나 설치 없이 PC와 모바일 브라우저로 바로 할 수 있어요. PC는 방향키나 WASD, 모바일은 판을 스와이프해서 밀어요.' },
      { q: '2048을 잘하는 방법이 있나요?', a: '가장 큰 블럭을 한 구석에 두고, 주로 두 방향(예: 왼쪽과 아래)만 쓰며, 그 구석이 있는 줄을 큰 순서로 이어 두는 게 기본이에요. 그러면 끝에서 하나가 맞춰질 때 줄을 따라 연쇄로 합쳐져요.' },
      { q: '2048을 만들면 끝나나요?', a: '아니요. 2048을 만들면 축하 화면이 나오고, 계속하기를 누르면 4096, 8192처럼 더 큰 블럭에 도전할 수 있어요.' },
      { q: '친구전은 공평한가요?', a: '네. 모두 같은 시드로 시작해 처음 판이 같고, 새 블럭의 숫자도 같은 순서로 나와요. 어떻게 미느냐에 따라 판이 달라질 뿐이에요.' },
      { q: '기록은 어디에 남나요?', a: '로그인하면 챌린지 도전 점수가 2048 랭킹과 기록실 챌린지 랭킹에 올라가고, 친구전과 공개방 결과도 전적에 남아요. 자유 플레이 최고 점수는 이 브라우저에 저장돼요.' },
    ],
    cta: { title: '구석 하나를 정해 볼까요?', body: '자유 플레이에서 구석 전략을 익힌 뒤 챌린지 도전 랭킹에 올라 보세요.', button: '2048 하러 가기' },
  },
  en: {
    meta: {
      title: '2048 strategy — the corner method, merge rules and how scoring works | PUZZLTHINK',
      description: 'Want to get better at 2048? Why each block merges only once a move, why the biggest block lives in a corner, the snake pattern, a chain merge played out on a real board, how the score adds up, and tips for friend races and the challenge.',
      keywords: ['2048 strategy', 'how to win 2048', '2048 tips', '2048 corner strategy', '2048 rules', '2048 score', '2048 multiplayer'],
    },
    title: '2048 strategy guide',
    lead: 'One corner, one line, two directions — that is where big blocks come from.',
    intro: [
      '2048 is a puzzle on a 4×4 board: slide every block up, down, left or right, and two equal blocks that meet merge into one worth double. Every move adds a new block to an empty cell, so the board fills up, and when no move is left the game ends. The rules take a minute to learn, but how you keep the board decides whether you stall at 256 or pass 4096.',
      'This guide starts with the fine print of merging, then covers why the biggest block belongs in a corner, how to keep a line in descending order, a real board where one move sets off a chain of merges, and how the score adds up. It ends with tips for PUZZLTHINK’s free play, challenge and friend races.',
    ],
    gamePageTitle: '2048 — a calm number puzzle, from square to stone',
    summary: 'Merge fine print, the corner method, a chain merge step by step, scoring.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'Where 2048 comes from',
        blocks: [
          { type: 'p', text: '2048 is a web game released as open source in 2014 by the Italian developer Gabriele Cirulli. As its release notes say, it was based on the earlier game 1024 and is similar in concept to the tile-sliding puzzle Threes!. Because anyone could copy and change the code, countless variants followed and it spread around the world.' },
          { type: 'p', text: 'PUZZLTHINK’s 2048 keeps the rules and redraws the blocks as characters with faces: pastel squares from 2 to 64, go stones from 128 to 1024, and crowned legend blocks from 2048 on (golden stone, black stone king, white stone king, aurora stone, cosmic stone). Every block you make is filled in in the collection.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board**: 4×4, 16 cells, starting with two blocks.',
            '**Sliding**: push up, down, left or right and every block slides as far as it can that way.',
            '**Merging**: two equal blocks that meet become one worth double, and you score the new block’s value.',
            '**Once per move**: a block merges at most once per move. 2·2·2·2 pushed left becomes 4·4, not 8.',
            '**New blocks**: if anything moved or merged, a new block appears in an empty cell — a 2 nine times in ten, a 4 otherwise. A direction that changes nothing does nothing, and adds no block.',
            '**The end**: no empty cells and no equal neighbours means game over. Making 2048 does not end the game; you can keep going.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Merge fine print — which pair merges first?',
        blocks: [
          { type: 'p', text: 'Merges happen **starting from the edge you push towards**. The table shows one row pushed left, computed by the game’s own engine.' },
          { type: 'table', caption: 'One row pushed left (· = empty)', head: ['Before', 'After', 'Points', 'Why'], rows: [
            ['2 2 2 2', '4 4 · ·', '8', 'The front pair and the back pair merge separately.'],
            ['2 2 2 ·', '4 2 · ·', '4', 'The two at the left edge merge first; the third stays.'],
            ['4 2 2 ·', '4 4 · ·', '4', 'The new 4 does not merge again in the same move.'],
            ['2 2 4 4', '4 8 · ·', '12', 'Both pairs merge.'],
            ['8 · 8 8', '16 8 · ·', '16', 'Gaps are skipped; the two 8s nearest the edge meet first.'],
            ['2 · · 2', '4 · · ·', '4', 'Blocks far apart still merge if only empty cells lie between.'],
          ] },
          { type: 'cards', items: [
            { title: 'Pushing right is the mirror', body: '2·2·2 pushed right merges the two at the right edge first, giving ·,·,2,4. The same row leaves its spare block in a different place depending on the direction.' },
            { title: 'Undo and new blocks', body: 'Undo in free play steps back one move. New blocks come in a fixed order, so undoing and pushing the same way again brings back the same block in the same cell. Only a different direction changes the outcome.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — make one corner home',
        blocks: [
          { type: 'p', text: 'Most players who reach high numbers do the same thing: **keep the biggest block in one corner and avoid the direction that pulls it away.**' },
          { type: 'list', ordered: true, items: [
            '**Pick a corner**: say bottom-left. The biggest block always sits there.',
            '**Two main directions**: alternate left and down. Use right now and then, and up only when nothing else works.',
            '**Keep the bottom row full**: when all four bottom cells are filled, pushing left or right cannot disturb that row. With a gap in it, pushing up can let a new block drop into your corner.',
            '**Do not merge in a hurry**: before taking every merge you can, prefer the move that keeps the big block in its corner.',
          ] },
          { type: 'callout', tone: 'warn', title: 'When you must push up', text: 'If every other direction is blocked and you have to push up, push down again right away to put the big block back. If a 2 or 4 lands in the empty corner in between, your big block can get trapped.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — a line merging in a chain',
        lead: 'A board using the bottom-left corner as home. Where new blocks land varies from game to game; watch how the merges flow.',
        blocks: [
          board(B0, 'Start. The bottom row runs 128, 64, 32, 16 in descending order, with another 16 above the last one.'),
          { type: 'steps', items: [
            { title: 'Push down (+32)', body: 'The two 16s in column 4 merge, so the bottom row ends in 32: 128, 64, 32, 32. Column 1 (2, 4, 8, 128) is already packed to the floor and does not move.' },
            { title: 'Push left (+72)', body: 'The bottom row’s 32s merge into 64, and 2+2 merges happen in other rows too. The bottom row is now 128, 64, 64, with a new 2 in the free end cell.' },
            { title: 'Left again (+128)', body: 'The 64s become 128, making the bottom row 128, 128, 2. Because a block merges once per move, the new 128 does not join its neighbour yet.' },
            { title: 'Left once more (+256)', body: 'The two 128s merge and a 256 sits in the corner. Over four pushes you scored 32 + 72 + 128 + 256 = 488.' },
          ] },
          board(B1, 'After pushing down (the 2 in row 1, column 2 is the new block)'),
          board(B2, 'After one push left'),
          board(B4, 'After three pushes left: 256 in the corner'),
          { type: 'callout', tone: 'tip', title: 'Why keep the line in order?', text: 'Because the bottom row ran 128, 64, 32, 16, matching the last 16 set off 32 → 64 → 128 → 256 along the line. With the order scrambled, equal blocks would never have met and would have stayed on the board.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — the snake',
        blocks: [
          { type: 'p', text: 'Once the bottom row is in descending order, continue the order in the row above **running the other way**. If the bottom row is 512, 256, 128, 64 from the left, the row above continues 32, 16, 8, 4 from the right. The whole board becomes one winding line, and matching its end sets off merges all the way along.' },
          { type: 'list', items: [
            '**Line up the row ends**: build a block equal to the bottom row’s smallest (right-end) block directly above it, and one push down merges them.',
            '**Grow small blocks far from home**: raise 2s and 4s on the side away from the big blocks (top right) and bring them down.',
            '**Count empty cells**: three or four empty cells is a warning. Merge small blocks to open space first.',
            '**Beware of 4s**: one new block in ten is a 4. A single cell waiting for a 2 can be blocked by a 4, so do not stake everything on it.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced — how the score adds up',
        blocks: [
          { type: 'p', text: 'Each merge scores the value of the new block. So a big block carries the points of every merge that went into it.' },
          { type: 'list', items: [
            'A 4 from 2+2 scores 4. An 8 scores 8 plus two 4s: 16. A 16 scores 16 + 16 × 2 = 48.',
            'Built from 2s only, a block of 2ⁿ carries (n − 1) × 2ⁿ points. 2048 (2¹¹) is 10 × 2048 = **20,480**.',
            'When a new block arrives as a 4, the 4 points for merging 2+2 are skipped, so real scores run a little lower.',
          ] },
          { type: 'table', caption: 'Points inside one block built from 2s only', head: ['Block', 'Points'], rows: [
            ['128', '768'], ['256', '1,792'], ['512', '4,096'], ['1024', '9,216'], ['2048', '20,480'], ['4096', '45,056'],
          ] },
          { type: 'p', text: 'So a score alone tells you roughly how far a game went: a challenge score above 20,000 very likely made a 2048. The largest block theoretically possible on a 4×4 board is 131072.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Using all four directions evenly**: the big block drifts to the middle, the corner empties and small blocks wedge in.',
            '**Gaps in the bottom row**: a row with a gap shifts when you push sideways and its order breaks.',
            '**Small blocks next to big ones**: a 2 beside a 512 stalls the line until that 2 grows.',
            '**Relying on undo**: free-play undo is one move only, and pushing the same way again gives the same result.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — free play, challenge, friend races',
        blocks: [
          { type: 'table', head: ['Mode', 'Good to know'], rows: [
            ['Free play', 'No time limit and a one-move undo. The board saves in this browser so you can continue later.'],
            ['Challenge', 'No undo; one board until no move is left. Your final score goes on the 2048 ranking (signed in). The board autosaves, but starting a new one discards the run in progress.'],
            ['Friend and open rooms', '2–4 players start their own boards from the same seed and race for 5 or 10 minutes. The biggest block wins, then the higher score. A stuck board stops where it is.'],
          ] },
          { type: 'p', text: 'In a race everyone starts from the same seed, so the first board and the order of new block values (2 or 4) are shared; where a new block lands still depends on each player’s empty cells. With a clock running, not getting stuck comes first — merge boldly only near the end.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Corner method', def: 'Keeping the biggest block fixed in one corner and avoiding the direction that pulls it out.' },
            { term: 'Snake', def: 'Reversing direction row by row so the whole board forms one line in descending order.' },
            { term: 'Chain merge', def: 'Several merges in a row along an ordered line once its end is matched.' },
            { term: 'Seed', def: 'The value that fixes the order of new blocks. Races give everyone the same one.' },
            { term: 'Legend block', def: 'A crowned block of 2048 or more in PUZZLTHINK’s 2048, from the golden stone to the cosmic stone.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where can I play 2048?', a: 'On PUZZLTHINK’s 2048 page, in any desktop or mobile browser, with no sign-up or install. Use the arrow keys or WASD on a computer, or swipe the board on a phone.' },
      { q: 'How do I get better at 2048?', a: 'Keep the biggest block in one corner, use mostly two directions (say left and down), and keep the corner’s row in descending order. When its end is matched, the line merges in a chain.' },
      { q: 'Does the game end at 2048?', a: 'No. Making 2048 shows a celebration, and Continue lets you go for 4096, 8192 and beyond.' },
      { q: 'Are friend races fair?', a: 'Yes. Everyone starts from the same seed, so the first board is the same and new block values come in the same order. Only how you play makes the boards differ.' },
      { q: 'Where are my results kept?', a: 'Signed in, challenge scores go on the 2048 ranking and the records challenge ranking, and friend and open-room results go into your record. Your free-play best is kept in this browser.' },
    ],
    cta: { title: 'Ready to pick a corner?', body: 'Learn the corner method in free play, then climb the challenge ranking.', button: 'Play 2048' },
  },
};
export default guide;
