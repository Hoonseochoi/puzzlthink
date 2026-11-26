// 네모 세기 guide. Rules and numbers follow src/lib/nemoCount.ts (a 네모 is any rectangle of whole cells inside the shape,
// 1×1 included, blanks are 0; allRects/countNemo/solutionRects smallest first; generateProblem: easy/normal/hard boards,
// about four in ten "count the blank rectangles" boards with target 0 (or 1–2 on normal/hard), numbered boards with
// targets of 8+/12+; CHALLENGE_MS 30 min), src/lib/nemoCountRoom.ts (2–6 players, 5/10/15 problems, 1–5 min or no limit,
// 10 s to answer after a buzz, 3 s before buzzing again, one agreed pass per player per game, ranked by correct answers
// then total time), src/lib/nemoDuel.ts (도전장: same seeded boards, 5 problems, more correct then faster),
// src/components/nemoCount/NemoGame.tsx (challenge per difficulty, one answer per board, skip; practice give-up with
// the solution replay) and the NemoCountGuide messages.
// Both worked examples were counted with countNemo/allRects: 6 rectangles for target 9, and 48 − 20 = 28 for the blank board.
import type { GameGuide, GuideBlock } from './types';

type Lang = 'ko' | 'en';
const grid = (lang: Lang, rows: (number | null)[][], caption: string): GuideBlock => ({
  type: 'table',
  caption,
  head: ['', ...rows[0].map((_, i) => (lang === 'ko' ? `${i + 1}열` : `C${i + 1}`))],
  rows: rows.map((r, i) => [lang === 'ko' ? `${i + 1}행` : `R${i + 1}`, ...r.map((v) => (v === null ? '■' : v === 0 ? '·' : String(v)))]),
});
const NUM = [[2, 5, 1, 3], [4, 1, 6, 2], [3, 7, 2, 4]];
const BLANK = [[0, 0, 0, null], [0, 1, 0, 0], [0, 0, 0, 0]];

const guide: GameGuide = {
  game: 'nemoCount',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['gyulhap', 'equationSignal', 'merge2048', 'sudoku'],
  inlineNamespace: 'NemoCountGuide',
  ko: {
    meta: {
      title: '네모 세기 공략 — 데블스플랜3 그 게임, 빠짐없이 세는 순서와 공식 | PUZZLTHINK',
      description: '네모 세기에서 자꾸 하나씩 빠뜨린다면? 크기별로 세는 순서, 합이 넘치면 멈추는 가지치기, 빈 네모를 세는 공식과 "전체 빼기" 방법, 실제 판으로 따라 세는 예시 두 개, 30분 챌린지와 친구 버저전 요령까지 정리했어요.',
      keywords: ['네모 세기 공략', '네모세기', '네모 세기 공식', '데블스플랜3 네모 세기', '직사각형 개수 세기', '네모 세기 게임', '두뇌 게임', '직사각형 개수 공식'],
    },
    title: '네모 세기 공략',
    lead: '계산보다 순서. 하나도 빠뜨리지 않고, 두 번 세지도 않는 법.',
    intro: [
      '네모 세기는 칸으로 된 판에서 **숫자 합이 타깃 넘버가 되는 직사각형**이 몇 개인지 세는 게임이에요. 1칸짜리도, 정사각형도, 길쭉한 직사각형도 모두 네모예요. 빈칸은 0으로 쳐요. 답은 하나의 숫자라, 하나만 빠뜨리거나 하나만 두 번 세도 틀려요.',
      '이 공략은 "어떤 순서로 세야 빠뜨리지 않는가"에 집중해요. 크기별로 나눠 세는 법, 합이 넘치면 그 방향을 끊는 가지치기, 빈 네모를 공식으로 한 번에 세는 법, 그리고 숫자 판과 빈 판 하나씩을 실제로 따라 세어 봐요. 30분 챌린지와 친구 버저전에서 쓰는 요령도 정리했어요.',
    ],
    gamePageTitle: '네모 세기 — 데블스 플랜 그 게임, 빠르고 정확하게 세는 법',
    summary: '크기별 세기, 가지치기, 빈 네모 공식과 전체 빼기, 따라 세기 두 판.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '네모 세기는 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3)에 나온 계산 게임이에요. 방송에서는 숫자가 적힌 판과 대부분이 빈칸인 판이 나왔고, 정답자가 갈린 건 암산 실력보다 **세는 순서**였어요. 튜토리얼에서 방송의 두 판을 직접 세어 볼 수 있어요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 쉬움·보통·어려움 난이도에 맞춰 판을 매번 새로 만들고, 정답과 풀이는 프로그램이 판 위의 모든 직사각형을 계산해 정해요. 그래서 정답이 틀릴 일은 없고, 몇 문제든 새로 풀 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판**: 정사각형 칸으로 된 울퉁불퉁한 모양이에요. 칸에는 숫자가 적혀 있거나 비어 있어요(빈칸 = 0).',
            '**네모**: 칸으로 이루어진 직사각형이에요. 1칸짜리, 정사각형, 가로세로가 다른 직사각형 모두 포함해요. 네모의 **모든 칸이 판 위에 있어야** 해요.',
            '**세기**: 네모 안 숫자를 모두 더한 값이 타깃 넘버와 같으면 1개로 세요. 같은 칸을 쓰는 네모끼리 겹쳐도 각각 따로 세요.',
            '**답하기**: 센 개수를 숫자로 입력해요. 30분 챌린지는 문제마다 한 번만 답할 수 있고, 패스하면 다음 문제로 넘어가요.',
          ] },
          { type: 'h3', text: '판의 두 종류' },
          { type: 'list', items: [
            '**숫자 판**: 칸마다 숫자가 있고 타깃은 쉬움 8 이상, 보통·어려움 12 이상이에요. 답은 대개 쉬움 2~5개, 보통 3~9개, 어려움 5~14개예요. 한 칸짜리 통로에 12~25 같은 큰 숫자가 놓이기도 해요.',
            '**빈 판**: 거의 전부 빈칸이고 1(어려움에서는 2도)이 몇 개 박혀 있어요. 타깃은 쉬움은 0, 보통은 0이나 1, 어려움은 0·1·2예요. 열 판 중 네 판쯤이 이 종류이고, 답이 수십에서 이백 개가 넘기도 해요.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 점',
        blocks: [
          { type: 'cards', items: [
            { title: '1칸도 네모예요', body: '타깃과 같은 숫자가 적힌 칸 하나도 네모 1개예요. 타깃이 0이면 빈칸 하나하나가 모두 네모예요.' },
            { title: '정사각형만이 아니에요', body: '1×3, 2×4처럼 가로세로가 다른 직사각형도 모두 세요.' },
            { title: '판 밖을 지나면 안 돼요', body: '판 모양이 울퉁불퉁해서, 직사각형의 한 칸이라도 판 밖(■)이면 세지 않아요.' },
            { title: '타깃보다 큰 숫자는 벽', body: '숫자는 모두 0 이상이라, 타깃보다 큰 숫자가 있는 칸은 어떤 네모에도 들어갈 수 없어요. 그 칸을 기준으로 판을 나누면 셀 곳이 줄어요.' },
            { title: '타깃 1인 빈 판', body: '1이 정확히 하나 들어간 네모를 세요. 1이 두 개 들어가면 합이 2라 빠져요. 2가 있는 칸은 타깃 1에서 벽이에요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 크기별로, 작은 것부터',
        blocks: [
          { type: 'p', text: '가장 흔한 실수는 "눈에 띄는 것부터 세다가 빠뜨리기"예요. 크기를 정해 놓고 차례로 훑으면 빠뜨림이 확 줄어요. 풀이 재생도 같은 순서(작은 네모부터)로 보여 줘요.' },
          { type: 'list', ordered: true, items: [
            '**1칸**: 타깃과 같은 숫자가 적힌 칸.',
            '**가로줄**: 1×2, 1×3, 1×4… 줄마다 왼쪽에서 오른쪽으로 밀며 더해 봐요.',
            '**세로줄**: 2×1, 3×1… 열마다 위에서 아래로.',
            '**큰 네모**: 2×2, 2×3, 3×2… 마지막으로.',
          ] },
          { type: 'callout', tone: 'tip', title: '합이 넘치면 멈추기', text: '숫자에 음수가 없어서, 한 방향으로 늘려 가다 합이 타깃을 넘으면 그 방향은 더 볼 필요가 없어요. 가장 작은 2×2의 합이 이미 타깃보다 크면, 2×2 이상은 통째로 건너뛰어도 돼요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 세기 — 숫자 판과 빈 판',
        blocks: [
          { type: 'h3', text: '숫자 판: 타깃 9' },
          grid('ko', NUM, '3행 4열, 모든 칸에 숫자가 있어요.'),
          { type: 'steps', items: [
            { title: '1칸: 0개', body: '9가 적힌 칸이 없어요.' },
            { title: '가로 2칸: 1개', body: '1행은 7·6·4, 2행은 5·7·8, 3행은 10·9·6. 3행의 7+2 = 9 하나예요.' },
            { title: '가로 3칸: 2개, 가로 4칸: 0개', body: '1행 5+1+3 = 9, 2행 1+6+2 = 9. 나머지(8, 11, 12, 13)는 아니에요. 줄 전체 합은 11·13·16이라 가로 4칸은 없어요.' },
            { title: '세로 2칸: 0개, 세로 3칸: 3개', body: '세로 2칸 합은 6·7·6·8·7·8·5·6으로 9가 없어요. 열 전체는 1열 2+4+3 = 9, 2열 13, 3열 1+6+2 = 9, 4열 3+2+4 = 9. 세 개예요.' },
            { title: '2×2 이상: 0개 (가지치기)', body: '2×2 여섯 개의 합은 12·13·12·15·16·14로 가장 작은 것도 12예요. 더 큰 네모는 모두 2×2를 품고 있어서 9가 될 수 없어요. 볼 필요가 없어요.' },
            { title: '합계: 6개', body: '1 + 2 + 3 = 6. 크기별로 나눠 세니 큰 네모를 하나하나 더해 볼 필요도 없었어요.' },
          ] },
          { type: 'h3', text: '빈 판: 타깃 0, "전체에서 빼기"' },
          grid('ko', BLANK, '■는 판 밖, ·는 빈칸. 2행 2열에 1이 하나 있어요.'),
          { type: 'p', text: '빈칸만으로 된 네모를 하나씩 세면 수십 개라 빠뜨리기 쉬워요. 대신 **판 모양 안의 모든 네모를 센 뒤, 1을 품은 네모를 빼요**.' },
          { type: 'steps', items: [
            { title: '꽉 찬 3×4라면 60개', body: '가로 a칸 × 세로 b칸 직사각형 안의 네모 수는 a(a+1)/2 × b(b+1)/2예요. 가로 4칸은 10, 세로 3칸은 6, 10 × 6 = 60개.' },
            { title: '판 밖 칸(1행 4열)을 품은 네모 12개 빼기', body: '어떤 칸을 품은 네모의 수는 (위로 고를 수 있는 줄 수) × (아래로) × (왼쪽으로) × (오른쪽으로)예요. 1행 4열은 위 1 × 아래 3 × 왼쪽 4 × 오른쪽 1 = 12. 판 모양 안의 네모는 60 − 12 = 48개예요.' },
            { title: '1이 있는 칸(2행 2열)을 품은 네모 20개 빼기', body: '꽉 찬 판에서 2행 2열을 품은 네모는 2 × 2 × 2 × 3 = 24개. 그중 판 밖 칸까지 품은 4개(1행에서 시작해 4열까지 가는 것)는 이미 빠졌으니 24 − 4 = 20개예요.' },
            { title: '답: 28개', body: '48 − 20 = 28. 게임이 계산한 정답과 같아요.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 기준 칸 정하기와 덩어리 나누기',
        blocks: [
          { type: 'h3', text: '왼쪽 위 칸을 기준으로' },
          { type: 'p', text: '모든 네모에는 왼쪽 위 꼭짓점 칸이 딱 하나 있어요. 칸을 하나씩 짚으며 "여기서 시작하는 네모"만 세면 같은 네모를 두 번 셀 일이 없어요. 시작 칸에서 오른쪽으로, 그다음 한 줄씩 아래로 늘려 가며 더하고, 합이 넘치는 순간 그 방향을 멈춰요. 게임이 정답을 계산하는 방법도 이 방식이에요.' },
          { type: 'h3', text: '꽉 찬 덩어리는 공식으로' },
          { type: 'p', text: '빈칸만 있는 가로 a × 세로 b 덩어리에는 a(a+1)/2 × b(b+1)/2개의 네모가 있어요. 1×n 줄은 n(n+1)/2, 2×2는 3 × 3 = 9, 2×3은 3 × 6 = 18, 3×3은 6 × 6 = 36개예요. 판이 덩어리 몇 개와 한 칸짜리 다리로 되어 있다면, 덩어리마다 공식으로 세고 다리를 지나는 네모만 따로 더해요.' },
          { type: 'table', caption: '빈 직사각형 덩어리 안의 네모 수', head: ['크기', '1', '2', '3', '4'], rows: [
            ['1줄', '1', '3', '6', '10'],
            ['2줄', '3', '9', '18', '30'],
            ['3줄', '6', '18', '36', '60'],
          ] },
          { type: 'h3', text: '벽으로 판 나누기' },
          { type: 'p', text: '타깃보다 큰 숫자, 타깃 0에서의 1 같은 칸은 어떤 네모에도 못 들어가는 벽이에요. 벽을 기준으로 판을 조각내면, 조각끼리는 서로 영향을 주지 않으니 조각마다 따로 세서 더하면 돼요. 숫자 판에서 통로에 놓인 21 같은 큰 숫자가 바로 이런 벽이에요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 큰 빈 판을 빠르게',
        blocks: [
          { type: 'p', text: '어려움의 빈 판은 답이 이백 개를 넘기도 해서 하나씩 세는 건 거의 불가능해요. 위의 "전체에서 빼기"를 일반화하면 이렇게 돼요.' },
          { type: 'list', ordered: true, items: [
            '**판을 감싸는 큰 직사각형**의 네모 수를 공식으로 구해요.',
            '**판 밖 칸**을 품은 네모를 빼요. 판 밖 칸이 많으면, 반대로 판을 꽉 찬 덩어리 몇 개로 나눠 더하는 편이 빨라요.',
            '**타깃 0이면 숫자 칸을 품은 네모**를 빼요. 한 칸을 품은 네모 수는 (위) × (아래) × (왼쪽) × (오른쪽)이에요.',
            '**두 번 뺀 것을 되돌리기**: 판 밖 칸과 숫자 칸을 둘 다 품은 네모는 두 번 빠졌으니 한 번 더해요(포함·배제).',
          ] },
          { type: 'p', text: '타깃이 1인 빈 판은 "1을 정확히 하나 품은 네모"예요. 1이 있는 칸마다, 그 칸을 품되 다른 1이나 판 밖 칸은 품지 않는 네모를 세서 더하면 돼요. 1끼리 멀리 떨어져 있으면 칸마다 따로 세기 쉬워요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**1칸 네모 빼먹기**: 타깃과 같은 숫자 칸, 타깃 0의 빈칸 하나하나도 네모예요.',
            '**세로줄 잊기**: 가로줄만 훑고 넘어가는 일이 많아요. 크기 순서를 정해 두세요.',
            '**판 밖을 지나는 직사각형 세기**: 울퉁불퉁한 모서리에서 판 밖 칸을 품은 네모를 세기 쉬워요.',
            '**덩어리 공식을 겹쳐서 쓰기**: 두 덩어리가 겹치는 부분은 두 번 세어져요. 겹친 부분을 빼거나, 겹치지 않게 나누세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — 연습, 30분 챌린지, 도전장, 친구 버저전',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['연습', '시간 제한이 없어요. 답 대신 "정답·풀이 보기"를 누르면 맞는 네모를 작은 것부터 하나씩 짚어 줘요.'],
            ['30분 챌린지', '난이도를 골라 30분 동안 맞힌 개수가 기록이에요. 문제마다 한 번만 답하고, 패스하면 바로 다음 문제예요. 최고 기록은 난이도마다 따로 남아요. 다른 탭이나 앱으로 3번 이상 넘어가면 그 기록은 순위에 들어가지 않아요.'],
            ['도전장', '같은 판 묶음(빠른 도전장은 5문제)을 링크로 보내, 받은 사람 모두가 같은 판을 풀고 한 순위표에 올라요. 많이 맞힌 순, 같으면 빨리 푼 순이에요.'],
            ['친구 버저전', '2~6명. 문제 수(5·10·15)와 문제당 시간(1~5분 또는 무제한)을 골라요. 버저를 먼저 누른 사람이 10초 안에 답하고, 틀려도 3초 뒤 다시 누를 수 있어요. 패스는 모두가 10초 안에 동의하면 넘어가고, 동의된 패스는 한 사람당 게임에 한 번이에요. 정답 수, 같으면 풀이 시간 합으로 순위를 정해요.'],
          ] },
          { type: 'p', text: '버저전에서는 끝까지 세기 전에 누르고 싶은 유혹이 커요. 틀려도 탈락하지 않지만 3초 동안 다른 사람이 먼저 누를 수 있어요. 큰 빈 판에서는 공식으로 빨리 계산하는 사람이, 숫자 판에서는 가지치기를 잘하는 사람이 유리해요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '네모', def: '칸으로 이루어진 직사각형. 1칸짜리와 정사각형도 포함해요.' },
            { term: '타깃 넘버', def: '네모 안 숫자의 합이 되어야 하는 값.' },
            { term: '벽', def: '어떤 네모에도 들어갈 수 없는 칸. 타깃보다 큰 숫자, 타깃 0에서의 숫자 칸.' },
            { term: '가지치기', def: '합이 타깃을 넘는 순간 그 방향으로 더 늘리지 않는 것.' },
            { term: '덩어리 공식', def: '가로 a × 세로 b 빈 직사각형 안의 네모 수 a(a+1)/2 × b(b+1)/2.' },
            { term: '전체에서 빼기', def: '모든 네모를 센 뒤 조건에 안 맞는 네모를 빼는 방법. 겹쳐 뺀 것은 다시 더해요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '네모 세기는 어디서 할 수 있나요?', a: 'PUZZLTHINK 네모 세기 페이지에서 가입이나 설치 없이 PC와 모바일 브라우저로 바로 할 수 있어요.' },
      { q: '문제는 몇 개나 있나요?', a: '정해진 문제집이 아니라 난이도(쉬움·보통·어려움)에 맞춰 매번 새 판을 무작위로 만들어요. 정답과 풀이는 프로그램이 모든 네모를 계산해서 정하므로 틀린 정답이 없어요.' },
      { q: '빈칸만 있는 네모는 어떻게 빨리 세나요?', a: '가로 a칸 × 세로 b칸 빈 덩어리에는 a(a+1)/2 × b(b+1)/2개의 네모가 있어요. 판 전체를 감싸는 직사각형으로 센 뒤, 판 밖 칸이나 숫자 칸을 품은 네모를 빼면 빨라요.' },
      { q: '정사각형만 세나요?', a: '아니요. 가로세로 길이가 달라도 칸으로 된 직사각형이면 모두 세요. 1칸짜리도 포함해요.' },
      { q: '친구와는 몇 명까지 할 수 있나요?', a: '2명부터 6명까지예요. 친구와 하기에서 방을 만들고 초대 링크나 4자리 코드를 보내면 돼요. 같은 판을 친구에게 보내 기록을 겨루는 도전장도 있어요.' },
    ],
    cta: { title: '첫 판을 세어 볼까요?', body: '연습 모드의 풀이 재생으로 크기별 세기를 익힌 뒤 30분 챌린지에 도전해 보세요.', button: '네모 세기 하러 가기' },
    disclaimer: '네모 세기는 방송에 소개된 게임 방식을 바탕으로 PUZZLTHINK가 웹용으로 다시 만든 것으로, 방송사·제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: "Nemo Count strategy — the Devil's Plan 3 counting game, order and formulas | PUZZLTHINK",
      description: 'Keep missing one rectangle in Nemo Count? Counting by size, stopping when a sum overshoots, the formula for blank rectangles and the "count all, then subtract" method, two boards counted step by step, and tips for the 30-minute challenge and buzzer rooms.',
      keywords: ['Nemo Count strategy', 'Nemo Count', "Devil's Plan counting game", 'count rectangles puzzle', 'number of rectangles formula', 'brain game'],
    },
    title: 'Nemo Count strategy guide',
    lead: 'Order beats arithmetic: miss none, count none twice.',
    intro: [
      'Nemo Count asks how many **rectangles of cells add up to the target number** on a board. Single cells, squares and long thin rectangles all count. Blank cells are 0. The answer is a single number, so missing one rectangle or counting one twice is just as wrong.',
      'This guide is about the order that leaves nothing out: counting by size, cutting off a direction once its sum overshoots, counting blank rectangles with a formula, and two boards — one numbered, one blank — counted step by step. It ends with tips for the 30-minute challenge and the buzzer game with friends.',
    ],
    gamePageTitle: "Nemo Count — the Devil's Plan counting game, and how to count fast",
    summary: 'Counting by size, pruning, the blank-rectangle formula and subtraction, two worked boards.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "Nemo Count is a counting game from Netflix's The Devil's Plan: Dead Again (season 3). The show used a board of numbers and a board that was nearly all blank, and what separated the players was not mental arithmetic but **the order they counted in**. The tutorial lets you count the show's two boards yourself." },
          { type: 'p', text: 'PUZZLTHINK generates a fresh board every time for easy, normal or hard, and the program computes the answer and solution by checking every rectangle on the board — so the answer is never wrong and there is always another board.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board**: an irregular shape made of square cells. Each cell holds a number or is blank (blank = 0).',
            '**Rectangle**: any rectangle of whole cells — single cells, squares and rectangles of any proportions. **Every cell of it must be on the board.**',
            '**Counting**: a rectangle counts once if the numbers inside add up to the target. Rectangles that overlap still count separately.',
            '**Answering**: type the number you counted. In the 30-minute challenge you get one answer per board, and passing moves on to the next.',
          ] },
          { type: 'h3', text: 'Two kinds of board' },
          { type: 'list', items: [
            '**Numbered boards**: every cell has a number; the target is 8 or more on easy and 12 or more on normal and hard. Answers are usually 2–5 on easy, 3–9 on normal and 5–14 on hard. A one-cell corridor sometimes carries a big number such as 12–25.',
            '**Blank boards**: nearly all blank with a few 1s (and on hard, 2s). The target is 0 on easy, 0 or 1 on normal, and 0, 1 or 2 on hard. About four boards in ten are this kind, with answers from dozens to over two hundred.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Easy to get wrong',
        blocks: [
          { type: 'cards', items: [
            { title: 'A single cell counts', body: 'A cell holding the target number is one rectangle. With a target of 0, every blank cell is one.' },
            { title: 'Not only squares', body: 'Rectangles like 1×3 and 2×4 count too.' },
            { title: 'No leaving the board', body: 'The board is irregular; a rectangle with even one cell off the board (■) does not count.' },
            { title: 'Numbers above the target are walls', body: 'All numbers are 0 or more, so a cell larger than the target can never be inside a counted rectangle. Splitting the board at such cells shrinks the work.' },
            { title: 'Blank boards with target 1', body: 'Count rectangles containing exactly one 1. Two 1s make 2 and fall out; a cell with a 2 is a wall for target 1.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — by size, smallest first',
        blocks: [
          { type: 'p', text: 'The most common mistake is counting whatever catches the eye and missing the rest. Fix the sizes in advance and sweep through them in order. The solution replay walks through rectangles in the same order, smallest first.' },
          { type: 'list', ordered: true, items: [
            '**Single cells**: cells holding the target.',
            '**Horizontal runs**: 1×2, 1×3, 1×4… sliding along each row.',
            '**Vertical runs**: 2×1, 3×1… down each column.',
            '**Bigger rectangles**: 2×2, 2×3, 3×2… last.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Stop when you overshoot', text: 'There are no negative numbers, so once a sum passes the target while you extend in one direction, nothing further that way can work. If even the smallest 2×2 adds up to more than the target, skip every rectangle of 2×2 or larger.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked examples — a numbered board and a blank one',
        blocks: [
          { type: 'h3', text: 'Numbered board, target 9' },
          grid('en', NUM, '3 rows by 4 columns, a number in every cell.'),
          { type: 'steps', items: [
            { title: 'Single cells: 0', body: 'No cell holds a 9.' },
            { title: 'Two across: 1', body: 'Row 1 gives 7, 6, 4; row 2 gives 5, 7, 8; row 3 gives 10, 9, 6. Only 7+2 = 9 in row 3.' },
            { title: 'Three across: 2; four across: 0', body: 'Row 1: 5+1+3 = 9; row 2: 1+6+2 = 9. The others (8, 11, 12, 13) miss. Whole rows add to 11, 13 and 16, so no four-across rectangle works.' },
            { title: 'Two down: 0; three down: 3', body: 'Two-down sums are 6, 7, 6, 8, 7, 8, 5, 6 — no 9. Whole columns: column 1 is 2+4+3 = 9, column 2 is 13, column 3 is 1+6+2 = 9, column 4 is 3+2+4 = 9. Three.' },
            { title: '2×2 and larger: 0 (pruned)', body: 'The six 2×2 sums are 12, 13, 12, 15, 16 and 14 — the smallest is already 12. Every larger rectangle contains a 2×2, so none can make 9. No need to look.' },
            { title: 'Total: 6', body: '1 + 2 + 3 = 6. Counting by size meant never adding up a big rectangle at all.' },
          ] },
          { type: 'h3', text: 'Blank board, target 0: count all, then subtract' },
          grid('en', BLANK, '■ is off the board, · is blank. There is a 1 in row 2, column 2.'),
          { type: 'p', text: 'Listing blank rectangles one by one runs to dozens and invites mistakes. Instead, **count every rectangle inside the shape, then subtract those containing the 1**.' },
          { type: 'steps', items: [
            { title: 'A full 3×4 has 60', body: 'A blank block a cells wide and b tall holds a(a+1)/2 × b(b+1)/2 rectangles. Four across gives 10, three down gives 6: 10 × 6 = 60.' },
            { title: 'Remove the 12 that contain the missing cell (row 1, column 4)', body: 'The number of rectangles containing a given cell is (rows available above, including its own) × (below) × (columns to the left) × (to the right). For row 1, column 4: 1 × 3 × 4 × 1 = 12. So the shape holds 60 − 12 = 48.' },
            { title: 'Remove the 20 that contain the 1 (row 2, column 2)', body: 'In the full grid, 2 × 2 × 2 × 3 = 24 rectangles contain row 2, column 2. Four of them (starting in row 1 and reaching column 4) also contain the missing cell and were already removed: 24 − 4 = 20.' },
            { title: 'Answer: 28', body: '48 − 20 = 28, the same answer the game computes.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — anchor cells and splitting into blocks',
        blocks: [
          { type: 'h3', text: 'Anchor on the top-left cell' },
          { type: 'p', text: 'Every rectangle has exactly one top-left cell. Touch the cells one at a time and count only the rectangles that start there, and nothing is ever counted twice. From the anchor, extend right, then one row down at a time, adding as you go and stopping the moment the sum overshoots. This is also how the game computes its answers.' },
          { type: 'h3', text: 'Formulas for solid blocks' },
          { type: 'p', text: 'A blank block a wide and b tall holds a(a+1)/2 × b(b+1)/2 rectangles. A 1×n strip holds n(n+1)/2; a 2×2 holds 3 × 3 = 9; a 2×3 holds 3 × 6 = 18; a 3×3 holds 6 × 6 = 36. If a board is a few blocks joined by one-cell bridges, count each block by formula and add only the rectangles that run through the bridges.' },
          { type: 'table', caption: 'Rectangles inside a blank block', head: ['Size', '1', '2', '3', '4'], rows: [
            ['1 row', '1', '3', '6', '10'],
            ['2 rows', '3', '9', '18', '30'],
            ['3 rows', '6', '18', '36', '60'],
          ] },
          { type: 'h3', text: 'Split the board at walls' },
          { type: 'p', text: 'A number above the target — or any numbered cell when the target is 0 — can never be inside a counted rectangle. Cut the board into pieces at those walls: the pieces do not affect each other, so count each one and add. A big number such as 21 sitting in a corridor of a numbered board is exactly such a wall.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — big blank boards, fast',
        blocks: [
          { type: 'p', text: 'Hard blank boards can have over two hundred answers; counting them one by one is hopeless. Generalising "count all, then subtract":' },
          { type: 'list', ordered: true, items: [
            '**Count the bounding rectangle** around the board by formula.',
            '**Subtract rectangles containing off-board cells.** With many off-board cells it is quicker to split the board into solid blocks and add instead.',
            '**For target 0, subtract rectangles containing numbered cells.** Rectangles containing one cell: (above) × (below) × (left) × (right).',
            '**Add back what was subtracted twice**: a rectangle containing both an off-board cell and a numbered cell was removed twice, so add it once (inclusion–exclusion).',
          ] },
          { type: 'p', text: 'For a blank board with target 1, count rectangles containing exactly one 1: for each 1, the rectangles containing it but no other 1 and no off-board cell. When the 1s are far apart, each is easy to count on its own.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Forgetting single cells**: a cell holding the target, and every blank cell when the target is 0, is a rectangle.',
            '**Forgetting vertical runs**: it is easy to sweep the rows and move on. Fix your order of sizes.',
            '**Counting rectangles that leave the board**: irregular edges make it easy to include an off-board cell.',
            '**Overlapping block formulas**: two blocks that overlap count their shared part twice. Subtract it, or split without overlap.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — practice, 30-minute challenge, challenge links, buzzer rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Good to know'], rows: [
            ['Practice', 'No time limit. Instead of answering you can press "show answer and solution" to see each correct rectangle, smallest first.'],
            ['30-minute challenge', 'Pick a difficulty; your record is how many boards you solve in 30 minutes. One answer per board, and passing goes straight to the next. Bests are kept per difficulty. Switching to another tab or app 3 times or more voids the run for the ranking.'],
            ['Challenge link', 'Send a fixed set of boards (5 for a quick one) by link; everyone who opens it solves the same boards on one leaderboard, ranked by correct answers, then speed.'],
            ['Buzzer room', '2–6 players. Choose 5, 10 or 15 boards and 1–5 minutes per board or no limit. The first to buzz answers within 10 seconds; a wrong answer does not knock you out, and you may buzz again after 3 seconds. A pass goes through if everyone else agrees within 10 seconds, and each player gets one agreed pass per game. Ranked by correct answers, then total solving time.'],
          ] },
          { type: 'p', text: 'In the buzzer room it is tempting to buzz before you finish counting. A wrong answer does not eliminate you, but for 3 seconds someone else can buzz first. Formula users win on big blank boards; good pruners win on numbered ones.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Rectangle (네모)', def: 'Any rectangle of whole cells, including single cells and squares.' },
            { term: 'Target number', def: 'What the numbers inside a rectangle must add up to.' },
            { term: 'Wall', def: 'A cell no counted rectangle can contain: a number above the target, or any number when the target is 0.' },
            { term: 'Pruning', def: 'Stopping a direction as soon as its sum passes the target.' },
            { term: 'Block formula', def: 'a(a+1)/2 × b(b+1)/2 rectangles in a blank block a wide and b tall.' },
            { term: 'Count all, then subtract', def: 'Counting every rectangle, then removing those that break the rule — adding back any removed twice.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where can I play Nemo Count?', a: 'On PUZZLTHINK’s Nemo Count page, in any desktop or mobile browser, with no sign-up or install.' },
      { q: 'How many puzzles are there?', a: 'There is no fixed set: a new board is generated each time for easy, normal or hard. The program computes the answer and solution by checking every rectangle, so the answer is never wrong.' },
      { q: 'How do I count blank rectangles quickly?', a: 'A blank block a wide and b tall holds a(a+1)/2 × b(b+1)/2 rectangles. Count the rectangle around the whole board, then subtract the rectangles containing off-board or numbered cells.' },
      { q: 'Do I only count squares?', a: 'No. Every rectangle of cells counts whatever its proportions, including single cells.' },
      { q: 'How many friends can play?', a: 'Two to six. Create a room under Play with friends and send the invite link or 4-digit code. You can also send a challenge link so friends race on the same boards.' },
    ],
    cta: { title: 'Ready to count the first board?', body: 'Learn counting by size with the practice replay, then take on the 30-minute challenge.', button: 'Play Nemo Count' },
    disclaimer: 'Nemo Count is PUZZLTHINK’s web version of a game shown on the programme and is not affiliated with the broadcaster or producers.',
  },
};
export default guide;
