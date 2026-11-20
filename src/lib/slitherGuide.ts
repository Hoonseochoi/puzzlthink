// 슬리더링크 공략 page: the technique pictures and the worked example (a 5×5 board solved with the beginner
// patterns only), plus the copy in both languages. Kept as data so the page stays a plain layout.
import type { EdgeSpec } from '@/components/slitherlink/SlitherDiagram';

type Cell = [number, number];
export type Figure = { rows: number; cols: number; clues: string[]; lines?: EdgeSpec[]; crosses?: EdgeSpec[]; fresh?: EdgeSpec[]; inside?: Cell[]; outside?: Cell[]; focus?: Cell[] };

/** Technique pictures, by id; the copy for each lives in GUIDE_COPY[locale].techniques. */
export const TECH_FIGURES: Record<string, Figure> = {
  zero: { rows: 3, cols: 3, clues: ['...', '.0.', '...'], crosses: [['h', 1, 1], ['h', 2, 1], ['v', 1, 1], ['v', 1, 2]], fresh: [['h', 1, 1], ['h', 2, 1], ['v', 1, 1], ['v', 1, 2]], focus: [[1, 1]] },
  corner1: { rows: 2, cols: 3, clues: ['1..', '...'], crosses: [['h', 0, 0], ['v', 0, 0]], fresh: [['h', 0, 0], ['v', 0, 0]], focus: [[0, 0]] },
  corner3: { rows: 2, cols: 3, clues: ['3..', '...'], lines: [['h', 0, 0], ['v', 0, 0]], fresh: [['h', 0, 0], ['v', 0, 0]], focus: [[0, 0]] },
  adj33: {
    rows: 3, cols: 4, clues: ['....', '.33.', '....'],
    lines: [['v', 1, 1], ['v', 1, 2], ['v', 1, 3]], crosses: [['v', 0, 2], ['v', 2, 2]],
    fresh: [['v', 1, 1], ['v', 1, 2], ['v', 1, 3], ['v', 0, 2], ['v', 2, 2]], focus: [[1, 1], [1, 2]],
  },
  diag33: {
    rows: 4, cols: 4, clues: ['....', '.3..', '..3.', '....'],
    lines: [['h', 1, 1], ['v', 1, 1], ['h', 3, 2], ['v', 2, 3]], fresh: [['h', 1, 1], ['v', 1, 1], ['h', 3, 2], ['v', 2, 3]], focus: [[1, 1], [2, 2]],
  },
  three0: {
    rows: 3, cols: 4, clues: ['....', '.30.', '....'],
    crosses: [['v', 1, 2], ['h', 1, 2], ['h', 2, 2], ['v', 1, 3]],
    lines: [['v', 1, 1], ['h', 1, 1], ['h', 2, 1], ['v', 0, 2], ['v', 2, 2]],
    fresh: [['v', 1, 1], ['h', 1, 1], ['h', 2, 1], ['v', 0, 2], ['v', 2, 2]], focus: [[1, 1]],
  },
  dotFull: { rows: 2, cols: 2, clues: ['..', '..'], lines: [['h', 1, 0], ['v', 0, 1]], crosses: [['h', 1, 1], ['v', 1, 1]], fresh: [['h', 1, 1], ['v', 1, 1]] },
  dotExtend: { rows: 2, cols: 2, clues: ['..', '..'], lines: [['h', 1, 0], ['h', 1, 1]], crosses: [['v', 0, 1], ['v', 1, 1]], fresh: [['h', 1, 1]] },
  deadEnd: { rows: 2, cols: 2, clues: ['..', '..'], crosses: [['h', 1, 0], ['v', 0, 1], ['h', 1, 1], ['v', 1, 1]], fresh: [['v', 1, 1]] },
  clueFill: {
    rows: 1, cols: 3, clues: ['.2.'],
    crosses: [['h', 0, 1], ['v', 0, 1]], lines: [['h', 1, 1], ['v', 0, 2]], fresh: [['h', 1, 1], ['v', 0, 2]], focus: [[0, 1]],
  },
  noLoop: {
    rows: 3, cols: 4, clues: ['....', '....', '....'],
    lines: [['h', 1, 1], ['v', 1, 1], ['v', 1, 2], ['h', 3, 2], ['h', 3, 3], ['v', 2, 4]],
    crosses: [['h', 2, 1]], fresh: [['h', 2, 1]], focus: [[1, 1]],
  },
  threeEntry: {
    rows: 3, cols: 3, clues: ['...', '.3.', '...'],
    lines: [['h', 1, 0], ['h', 2, 1], ['v', 1, 2]], crosses: [['v', 0, 1]],
    fresh: [['h', 2, 1], ['v', 1, 2], ['v', 0, 1]], focus: [[1, 1]],
  },
  insideOut: {
    rows: 3, cols: 4, clues: ['.1..', '13..', '.1..'],
    lines: [['h', 1, 1], ['h', 1, 2], ['v', 1, 1], ['v', 1, 3], ['h', 2, 1], ['h', 2, 2]],
    inside: [[1, 1], [1, 2]],
    outside: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 3], [2, 0], [2, 1], [2, 2], [2, 3]],
  },
};

/** The worked example: generatePuzzle(6, 329), and what each step decides as [edge id, 1 line | 2 ✕]. */
export const EXAMPLE = {
  rows: 5, cols: 5,
  clues: ['1..1.', '0.22.', '13...', '1..13', '02..3'],
  steps: [
    [],
    [[5, 2], [10, 2], [36, 2], [37, 2], [20, 2], [25, 2], [54, 2], [55, 2]],
    [[19, 1], [24, 1], [29, 1]],
    [[0, 2], [30, 2], [59, 1]],
    [[31, 1], [58, 2], [1, 1], [6, 1], [42, 2], [48, 2], [53, 2], [26, 2], [28, 1]],
    [[52, 1], [21, 1], [56, 1], [15, 2], [18, 2], [46, 2], [47, 1], [49, 1], [22, 2], [50, 2], [23, 2], [27, 1], [57, 2]],
    [[43, 1], [51, 2], [11, 1], [16, 2], [44, 1], [12, 2], [38, 2], [17, 1], [45, 1]],
    [[7, 1], [39, 1], [32, 2], [8, 2], [33, 2], [13, 2], [40, 1], [2, 1], [3, 1], [14, 1], [41, 2]],
    [[34, 2], [4, 1], [35, 1], [9, 1]],
  ] as [number, 1 | 2][][],
};

type Tech = { id: keyof typeof TECH_FIGURES; title: string; body: string };
type Section = { id: string; title: string; intro?: string; techs: Tech[] };

export const GUIDE_COPY = {
  ko: {
    metaTitle: '슬리더링크 공략 — 처음 하는 사람을 위한 풀이법 총정리 (예제 단계별 풀이)',
    metaDescription: '슬리더링크 처음이라면 여기서 시작! 0·3·모서리 숫자 시작 패턴, 점 규칙으로 길 찾기, 작은 고리 금지, 안·밖 칠하기까지 그림으로 정리하고 5×5 예제를 처음부터 끝까지 따라 풀어 봐요.',
    keywords: ['슬리더링크 공략', '슬리더링크 푸는 법', '슬리더링크 풀이', '슬리더링크 규칙', '슬리더링크 팁', '슬리더링크 패턴', '유배지 퍼즐 공략', 'Slitherlink 공략'],
    eyebrow: 'SLITHERLINK GUIDE',
    title: '슬리더링크 공략',
    lead: '처음 하는 사람을 위한 풀이법 총정리',
    intro: '슬리더링크는 감으로 선을 긋는 게임이 아니에요. 확실한 곳부터 선과 ✕를 하나씩 채우다 보면 길이 저절로 보이는 논리 퍼즐이에요. 이 글은 시작할 때 바로 쓰는 패턴, 선을 이어 가는 점 규칙, 막혔을 때 쓰는 고급 기술을 그림으로 정리하고, 마지막에 5×5 예제를 처음부터 끝까지 함께 풀어 봐요.',
    legend: ['분홍 선 = 확정된 선', '✕ = 선이 지나가지 않는 곳', '노란색 = 이번 단계에서 새로 정한 곳'],
    tocTitle: '목차',
    rulesTitle: '규칙 30초 정리',
    rules: [
      '점과 점 사이를 이어 끊긴 곳도 갈림길도 없는 고리 하나를 만들어요.',
      '칸 안의 숫자는 그 칸의 네 변 중 고리가 지나가는 변의 개수예요.',
      '숫자가 없는 칸은 몇 변이 지나가도 괜찮아요.',
    ],
    principleTitle: '모든 풀이의 바탕이 되는 두 가지',
    principles: [
      { title: '점에는 선이 0개 아니면 2개', body: '고리는 한 줄로 이어져 있어서, 어떤 점에 선이 들어오면 반드시 하나가 나가요. 선이 1개나 3개 붙은 점은 있을 수 없어요. 이 한 문장이 길 찾기의 전부예요.' },
      { title: '✕를 아끼지 말기', body: '선이 못 지나가는 곳에 ✕를 쳐 두면, 남은 길이 하나뿐인 곳이 눈에 들어와요. 잘하는 사람일수록 선보다 ✕를 먼저, 더 많이 그려요.' },
    ],
    sections: [
      {
        id: 'start', title: '1단계 · 판을 보자마자 쓰는 시작 패턴',
        intro: '어떤 문제든 처음에는 아래 패턴부터 찾아 표시해요. 생각할 필요 없이 바로 확정되는 곳들이에요.',
        techs: [
          { id: 'zero', title: '0은 네 변 모두 ✕', body: '0은 둘레에 선이 하나도 없다는 뜻이에요. 0을 보면 네 변에 바로 ✕를 쳐요. 0 옆 칸들의 선택지가 크게 줄어들어요.' },
          { id: 'corner1', title: '귀퉁이의 1 → 바깥 두 변 ✕', body: '판 귀퉁이의 1에서 바깥쪽 두 변 중 하나에 선이 지나가면, 그 선은 귀퉁이 점에서 나머지 바깥 변으로 꺾여야 해요. 그러면 선이 2개가 되어 1이 깨지니, 바깥 두 변은 모두 ✕예요.' },
          { id: 'corner3', title: '귀퉁이의 3 → 바깥 두 변 선', body: '반대로 귀퉁이의 3은 바깥 두 변이 모두 선이에요. 귀퉁이 점은 바깥 두 변밖에 길이 없어서, 둘 중 하나만 그으면 선이 막혀 버리거든요.' },
          { id: 'adj33', title: '붙어 있는 3·3 → 선 3개 + ✕ 2개', body: '3 두 개가 옆으로 붙어 있으면 바깥쪽 두 변과 가운데 변, 이렇게 평행한 선 3개가 확정돼요. 가운데 선의 위아래 연장선은 ✕예요. 세로로 붙어 있어도 똑같아요.' },
          { id: 'diag33', title: '대각선의 3·3 → 바깥 모서리 4개', body: '3 두 개가 대각선으로 놓이면, 서로 반대쪽 바깥 모서리의 두 변씩, 모두 4개 변이 선이에요. 3이 대각선으로 여러 개 이어져 있어도 양 끝 3의 바깥 모서리가 확정돼요.' },
          { id: 'three0', title: '3 옆의 0 → 3의 나머지 세 변', body: '3과 0이 붙어 있으면 맞닿은 변은 ✕(0 때문)이니 3의 나머지 세 변이 모두 선이에요. 게다가 그 선 끝은 0 쪽으로 못 가니 위아래로 한 칸씩 더 뻗어 나가요.' },
        ],
      },
      {
        id: 'flow', title: '2단계 · 점 규칙으로 길 이어 가기',
        intro: '시작 패턴을 다 쓰고 나면, 이제부터는 아래 네 가지를 판 전체에 반복해서 적용해요. 대부분의 문제는 이것만으로 끝까지 풀려요.',
        techs: [
          { id: 'dotFull', title: '선 2개가 붙은 점 → 나머지 ✕', body: '점에 선이 이미 2개면 그 점은 끝났어요. 남은 길은 모두 ✕. 갈림길이 생기지 않게 막아 주는 가장 많이 쓰는 규칙이에요.' },
          { id: 'dotExtend', title: '선 끝에 남은 길이 하나 → 연장', body: '선이 한 개만 붙은 점은 반드시 하나가 더 나가야 해요. 나머지 길 중 ✕가 아닌 곳이 하나뿐이면 거기로 선을 이어요. "길 찾기"는 대부분 이 규칙으로 진행돼요.' },
          { id: 'deadEnd', title: '막다른 길 → ✕', body: '선이 하나도 없는 점에 남은 길이 하나뿐이면, 그 길로 들어온 선은 나갈 곳이 없어요. 그래서 그 하나도 ✕예요. 판 귀퉁이나 0 근처에서 자주 생겨요.' },
          { id: 'clueFill', title: '숫자 채우기 · 비우기', body: '칸의 선 개수가 숫자와 같아지면 나머지 변은 ✕. 반대로 ✕가 아닌 변이 숫자만큼만 남으면 남은 변은 모두 선이에요. 그림의 2는 ✕가 2개라 남은 두 변이 선이에요.' },
        ],
      },
      {
        id: 'advanced', title: '3단계 · 막혔을 때 쓰는 고급 기술',
        intro: '점 규칙을 다 돌려도 새로 정할 곳이 안 보이면 아래 기술을 꺼내요. 11×11 챌린지 맵에서 특히 자주 필요해요.',
        techs: [
          { id: 'noLoop', title: '작은 고리 금지', body: '고리는 판 전체에 하나뿐이에요. 어떤 변을 그으면 선 일부만으로 작은 고리가 닫혀 버린다면, 그 변은 ✕예요. 다른 곳에 아직 선이 남아 있을 때 특히 유용해요.' },
          { id: 'threeEntry', title: '3의 모서리로 선이 들어오면', body: '바깥에서 3의 한 모서리 점으로 선이 들어오면, 그 선은 3을 비켜 갈 수 없어요. 바깥으로 빠지면 그 모서리의 두 변이 모두 비어 3을 채울 수 없으니까요. 그래서 그 점의 남은 바깥 길은 ✕, 선은 3의 변 하나로 꺾이고, 모서리에서 먼 두 변(그림의 아래·오른쪽)은 반드시 선이에요.' },
          { id: 'insideOut', title: '안·밖 칠하기', body: '고리는 판을 안쪽과 바깥쪽으로 나눠요. 판 밖은 언제나 바깥이고, 안쪽 칸과 바깥쪽 칸 사이에는 반드시 선이, 같은 쪽 칸 사이에는 ✕가 있어요. 확실한 칸부터 칠해 나가면 선이 안 보이던 곳도 풀려요.' },
        ],
      },
    ] as Section[],
    exampleTitle: '예제 따라 풀기 — 5×5 처음부터 끝까지',
    exampleIntro: '실제 문제 하나를 위의 패턴만으로 풀어 봐요. 노란색이 각 단계에서 새로 정한 곳이에요. 처음 보는 판에서 어디부터 손을 대는지 순서를 그대로 따라가 보세요.',
    exampleSteps: [
      { title: '문제', body: '5×5 판에 숫자 13개. 답은 하나뿐이에요. 먼저 0, 3, 판 귀퉁이 숫자를 찾아요.' },
      { title: '① 0부터', body: '왼쪽 둘째 줄과 맨 아래 줄의 0은 네 변이 모두 ✕예요. 한 번에 ✕ 8개가 생겼어요.' },
      { title: '② 붙은 3·3', body: '오른쪽 아래에 3 두 개가 세로로 붙어 있어요. 위·사이·아래 가로선 3개를 바로 그어요.' },
      { title: '③ 귀퉁이 숫자', body: '왼쪽 위 귀퉁이의 1은 바깥 두 변이 ✕, 오른쪽 아래 귀퉁이의 3은 바깥 두 변이 선이에요. 아래 변은 이미 그어져 있으니 오른쪽 변만 더해요.' },
      { title: '④ 첫 번째 길 찾기', body: '왼쪽 위 1은 위·왼쪽·아래(0과 맞닿은 변)가 모두 ✕라 오른쪽 변이 선이에요. 그 선의 두 끝점은 갈 길이 오른쪽뿐이라 오른쪽으로 연장돼요. 오른쪽 아래 3은 선이 3개가 됐으니 왼쪽은 ✕, 갈 길이 하나만 남은 빈 점들도 ✕(막다른 길)로 정리해요.' },
      { title: '⑤ 아래쪽 정리', body: '맨 아래 줄 2는 왼쪽(0)과 아래가 ✕라 위·오른쪽이 선이에요. 넷째 줄 오른쪽 3은 오른쪽이 ✕가 되면서 왼쪽에 선이 생겨요. 선이 2개 붙은 점은 나머지를 ✕로 막아요.' },
      { title: '⑥ 왼쪽의 1과 3', body: '셋째 줄 왼쪽 1은 위·아래·왼쪽이 ✕라 오른쪽이 선이에요. 바로 옆 3은 아래가 ✕로 정해지면서 왼쪽·위·오른쪽 세 변이 모두 선이 돼요.' },
      { title: '⑦ 가운데 2 두 개', body: '둘째 줄 왼쪽 2는 아래·왼쪽이 ✕라 위·오른쪽이 선, 오른쪽 2는 위·아래가 ✕라 양옆이 선이에요. 선이 첫 줄로 올라가요.' },
      { title: '⑧ 완성', body: '첫 줄 오른쪽 1은 이미 선이 하나라 나머지 변은 ✕예요. 남은 선 끝을 이어 주면 고리 하나가 완성! 시작 패턴과 점 규칙만으로 끝까지 풀렸어요.' },
    ],
    mistakesTitle: '자주 하는 실수',
    mistakes: [
      '감으로 선을 먼저 긋기 — 틀린 선 하나가 판 전체를 꼬이게 해요. 확실할 때만 긋고, 애매하면 ✕도 선도 남겨 두세요.',
      '✕를 안 치기 — ✕가 없으면 "남은 길이 하나"인 곳이 안 보여요.',
      '한 곳만 파고들기 — 막히면 판의 다른 쪽 0·3·귀퉁이로 옮겨 가세요. 멀리서 정해진 선이 돌아와 막힌 곳을 풀어 줘요.',
      '마지막에 고리가 두 개 — 다 그렸는데 안 끝났다면 작은 고리가 따로 닫혀 있는지 확인하세요.',
    ],
    tipsTitle: '연습 순서 추천',
    tips: [
      '9×9 연습부터 시작해서 시작 패턴이 눈에 익게 만들어요.',
      '익숙해지면 10×10, 그다음 방송과 같은 11×11 챌린지에 도전해요.',
      '힌트는 3×3 영역의 답을 보여줘요. 막혔을 때 한 번 써 보고, 왜 그렇게 되는지 거꾸로 생각해 보면 실력이 빨리 늘어요.',
      '시간이 줄지 않는다면 "선 2개 붙은 점 → 나머지 ✕"를 습관처럼 바로바로 치는지 점검해 보세요.',
    ],
    ctaTitle: '이제 직접 풀어 볼까요?',
    ctaBody: '매번 새로 만들어지는, 답이 하나뿐인 문제로 연습하고 11×11 챌린지에서 기록을 남겨 보세요.',
    ctaPlay: '슬리더링크 하러 가기',
    faqTitle: '자주 묻는 질문',
    faq: [
      { q: '슬리더링크는 운이 필요한가요?', a: '아니요. 정답이 하나뿐인 문제라 처음부터 끝까지 논리만으로 풀 수 있어요. 찍어야 할 것 같다면 아직 못 찾은 패턴이 있다는 뜻이에요.' },
      { q: '가장 먼저 봐야 할 숫자는?', a: '0, 3, 그리고 판 귀퉁이의 숫자예요. 이 셋은 주변 정보 없이도 바로 선이나 ✕가 정해져요.' },
      { q: '숫자가 없는 칸은 어떻게 하나요?', a: '숫자가 없는 칸은 제약이 없어요. 대신 점 규칙(선 0개 또는 2개)으로 주변 선을 이어 가면 저절로 정해져요.' },
      { q: '11×11은 얼마나 걸리나요?', a: '처음에는 30~40분, 패턴이 손에 익으면 10분 안쪽까지 줄어요. 챌린지 랭킹에서 다른 사람 기록과 비교해 보세요.' },
    ],
    back: '슬리더링크로 돌아가기',
  },
  en: {
    metaTitle: 'Slitherlink strategy — how to solve it, step by step for beginners',
    metaDescription: 'New to Slitherlink? Start here: the opening patterns for 0, 3 and corners, the dot rule that finds the path, no small loops, inside/outside colouring, and a 5×5 puzzle solved from start to finish.',
    keywords: ['slitherlink strategy', 'how to solve slitherlink', 'slitherlink tips', 'slitherlink patterns', 'slitherlink rules'],
    eyebrow: 'SLITHERLINK GUIDE',
    title: 'Slitherlink strategy',
    lead: 'Every technique a beginner needs',
    intro: 'Slitherlink is not about guessing lines. Fill in what is certain, lines and ✕ marks alike, and the path shows itself. This guide pictures the opening patterns, the dot rule that carries the line forward and the advanced tricks for when you are stuck, then solves a 5×5 puzzle with you from start to finish.',
    legend: ['Pink = a line for sure', '✕ = no line here', 'Amber = decided in this step'],
    tocTitle: 'Contents',
    rulesTitle: 'The rules in 30 seconds',
    rules: [
      'Join dots into one closed loop with no breaks and no branches.',
      'A number counts how many of the four sides of its cell the loop uses.',
      'Cells without a number can have any number of sides.',
    ],
    principleTitle: 'Two ideas behind every solve',
    principles: [
      { title: 'A dot has 0 or 2 lines', body: 'The loop is one unbroken line, so whatever enters a dot must leave it. A dot never has 1 or 3 lines. That sentence is the whole of path finding.' },
      { title: 'Use ✕ generously', body: 'Marking where a line cannot go is what reveals the places with only one way left. Strong solvers draw more ✕ than lines.' },
    ],
    sections: [
      {
        id: 'start', title: 'Step 1 · Opening patterns',
        intro: 'On any new board, look for these first. They are certain without thinking about the rest of the board.',
        techs: [
          { id: 'zero', title: '0 → all four sides ✕', body: 'A 0 has no line around it, so mark all four sides at once. Its neighbours lose a lot of options.' },
          { id: 'corner1', title: 'A 1 in a corner → both outer sides ✕', body: 'If a line used one outer side, it would have to turn along the other outer side at the corner dot, giving the 1 two lines. So both outer sides are ✕.' },
          { id: 'corner3', title: 'A 3 in a corner → both outer sides are lines', body: 'The corner dot only has the two outer sides, so the 3 must use both of them.' },
          { id: 'adj33', title: 'Two 3s side by side → 3 lines + 2 ✕', body: 'The outer sides and the shared side are lines: three parallel lines. The shared line\'s extensions above and below are ✕. The same holds vertically.' },
          { id: 'diag33', title: 'Two 3s on a diagonal → 4 outer sides', body: 'Each 3 uses the two sides of its far corner. In a longer diagonal chain, the two end 3s get their outer corners.' },
          { id: 'three0', title: 'A 3 next to a 0 → its other three sides', body: 'The shared side is ✕ because of the 0, so the 3 uses its other three sides, and their ends must turn away from the 0.' },
        ],
      },
      {
        id: 'flow', title: 'Step 2 · Carry the line with the dot rule',
        intro: 'After the openings, repeat these four over the whole board. Most puzzles solve with nothing else.',
        techs: [
          { id: 'dotFull', title: 'A dot with 2 lines → the rest ✕', body: 'That dot is done; close every other way out so no branch appears.' },
          { id: 'dotExtend', title: 'A line end with one way out → extend', body: 'A dot with one line needs exactly one more. If only one way is not ✕, the line goes there. Most path finding is this rule.' },
          { id: 'deadEnd', title: 'Dead end → ✕', body: 'A dot with no lines and only one way left can never take a line (it could not leave), so that way is ✕ too.' },
          { id: 'clueFill', title: 'Fill or empty a number', body: 'When a cell has as many lines as its number, its other sides are ✕. When it has only as many open sides as its number, they are all lines.' },
        ],
      },
      {
        id: 'advanced', title: 'Step 3 · When you are stuck',
        intro: 'If the dot rule finds nothing new, reach for these. The 11×11 challenge boards need them most.',
        techs: [
          { id: 'noLoop', title: 'No small loops', body: 'There is only one loop. If a side would close a small loop while other lines remain elsewhere, it is ✕.' },
          { id: 'threeEntry', title: 'A line entering a 3\'s corner', body: 'If a line arrives at a 3\'s corner from outside, it cannot slip past: leaving outward would leave both sides at that corner empty, and the 3 could not be filled. So that dot\'s other outside way is ✕, the line turns onto one side of the 3, and the two sides away from the corner are lines.' },
          { id: 'insideOut', title: 'Inside / outside colouring', body: 'The loop splits the board into inside and outside; off the board is always outside. Between an inside and an outside cell there is a line; between two cells on the same side there is none.' },
        ],
      },
    ] as Section[],
    exampleTitle: 'Worked example — a 5×5 from start to finish',
    exampleIntro: 'A real puzzle solved with only the patterns above. Amber marks what each step decides.',
    exampleSteps: [
      { title: 'The puzzle', body: '13 numbers on a 5×5 board, one answer. Look for 0s, 3s and corner numbers first.' },
      { title: '① The 0s', body: 'Both 0s get ✕ on all four sides: eight marks at once.' },
      { title: '② Stacked 3s', body: 'Two 3s touch vertically at the bottom right, so the three horizontal sides around them are lines.' },
      { title: '③ Corner numbers', body: 'The top-left 1 gets ✕ on its outer sides; the bottom-right 3 gets lines on its outer sides (the bottom one is already drawn).' },
      { title: '④ First path', body: 'The top-left 1 has ✕ above, left and below, so its right side is the line. Both ends of that line can only go right, so they extend. The bottom-right 3 now has three lines, so its left side is ✕; dots with one way left become dead ends.' },
      { title: '⑤ The bottom', body: 'The bottom 2 has ✕ on its left and bottom, so its top and right are lines. The right-hand 3 in row 4 gets its left side. Dots with two lines close the rest.' },
      { title: '⑥ The 1 and 3 on the left', body: 'The 1 in row 3 has ✕ on three sides, so its right side is a line. Its neighbouring 3 loses its bottom and takes the other three sides.' },
      { title: '⑦ The two 2s', body: 'The left 2 in row 2 takes its top and right; the right 2 takes both sides. The line climbs to the top row.' },
      { title: '⑧ Done', body: 'The top-right 1 already has a line, so its other sides are ✕. Join the last ends and the loop is complete.' },
    ],
    mistakesTitle: 'Common mistakes',
    mistakes: [
      'Guessing a line — one wrong line tangles the whole board. Draw only what is certain.',
      'Skipping ✕ marks — without them you will not see where only one way is left.',
      'Staring at one spot — when stuck, move to another 0, 3 or corner; lines from far away come back and unlock it.',
      'Two loops at the end — if you are "done" but not solved, look for a small loop closed on its own.',
    ],
    tipsTitle: 'How to practise',
    tips: [
      'Start with 9×9 practice until the openings jump out at you.',
      'Then 10×10, then the show-sized 11×11 challenge.',
      'A hint reveals a 3×3 area. Use one when stuck and work out why it is so.',
      'If your times stall, check that you mark "2 lines → the rest ✕" instantly, every time.',
    ],
    ctaTitle: 'Ready to try?',
    ctaBody: 'Every board is freshly made with exactly one answer. Practise, then set a time on the 11×11 challenge.',
    ctaPlay: 'Play Slitherlink',
    faqTitle: 'FAQ',
    faq: [
      { q: 'Does Slitherlink need luck?', a: 'No. Every board has one answer, so logic alone gets you there. If you feel you must guess, a pattern is still waiting to be found.' },
      { q: 'Which numbers first?', a: '0s, 3s and numbers in the corners: they decide lines or ✕ on their own.' },
      { q: 'What about cells without a number?', a: 'They have no constraint; the dot rule fills them in as the lines around them connect.' },
      { q: 'How long does an 11×11 take?', a: 'Often 30–40 minutes at first, under 10 once the patterns are second nature.' },
    ],
    back: 'Back to Slitherlink',
  },
};
