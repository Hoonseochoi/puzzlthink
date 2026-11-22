// 마슈 · 노노그램 · 스타배틀 공략 pages: copy (ko / en) and the small pictures for each technique.
import type { Figure } from '@/components/logic/LogicDiagram';
import type { LogicGameId } from './logicPuzzles';

type Tech = { id: string; title: string; body: string };
export type GuideCopy = {
  metaTitle: string; metaDescription: string; keywords: string[];
  back: string; eyebrow: string; title: string; lead: string; intro: string;
  tocTitle: string; rulesTitle: string; rules: string[];
  principleTitle: string; principles: { title: string; body: string }[];
  sections: { id: string; title: string; intro?: string; techs: Tech[] }[];
  mistakesTitle: string; mistakes: string[]; tipsTitle: string; tips: string[];
  ctaTitle: string; ctaBody: string; ctaPlay: string;
  faqTitle: string; faq: { q: string; a: string }[];
};

// ── Pictures ──
export const FIGURES: Record<string, Figure> = {
  // 마슈
  ruleBlack: { kind: 'masyu', rows: 4, cols: 5, pearls: [[1, 2, 'b']], fresh: [[1, 2, 1, 4], [1, 2, 3, 2]] },
  ruleWhite: { kind: 'masyu', rows: 3, cols: 5, pearls: [[1, 2, 'w']], lines: [[1, 1, 1, 3]], fresh: [[1, 3, 0, 3]] },
  edgeBlack: { kind: 'masyu', rows: 4, cols: 4, pearls: [[0, 1, 'b']], fresh: [[0, 1, 0, 3], [0, 1, 2, 1]], crosses: [[0, 0, 0, 1]] },
  blackPair: { kind: 'masyu', rows: 4, cols: 6, pearls: [[1, 2, 'b'], [1, 3, 'b']], fresh: [[1, 2, 1, 0], [1, 3, 1, 5]], crosses: [[1, 2, 1, 3]] },
  edgeWhite: { kind: 'masyu', rows: 3, cols: 5, pearls: [[0, 2, 'w']], fresh: [[0, 1, 0, 3]], crosses: [[0, 2, 1, 2]] },
  whiteRow: { kind: 'masyu', rows: 3, cols: 5, pearls: [[1, 1, 'w'], [1, 2, 'w'], [1, 3, 'w']], fresh: [[0, 1, 2, 1], [0, 2, 2, 2], [0, 3, 2, 3]], crosses: [[1, 0, 1, 1], [1, 1, 1, 2], [1, 2, 1, 3], [1, 3, 1, 4]] },
  whitePairEnd: { kind: 'masyu', rows: 3, cols: 6, pearls: [[1, 2, 'w'], [1, 3, 'w']], lines: [[1, 1, 1, 4]], crosses: [[1, 0, 1, 1], [1, 4, 1, 5]] },
  secondRowBlack: { kind: 'masyu', rows: 4, cols: 4, pearls: [[1, 1, 'b']], fresh: [[1, 1, 3, 1], [1, 1, 1, 3]], crosses: [[0, 1, 1, 1], [1, 0, 1, 1]] },
  corner: { kind: 'masyu', rows: 3, cols: 4, pearls: [], lines: [[0, 2, 0, 0]], fresh: [[0, 0, 1, 0]] },
  smallLoop: { kind: 'masyu', rows: 3, cols: 4, pearls: [], lines: [[0, 1, 0, 2], [0, 2, 1, 2], [0, 1, 1, 1]], crosses: [[1, 1, 1, 2]] },
  // 노노그램
  overlap: { kind: 'nono', clue: [7], cells: '...####...', fresh: [3, 4, 5, 6] },
  fullLine: { kind: 'nono', clue: [3, 2, 3], cells: '###x##x###', fresh: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  multiOverlap: { kind: 'nono', clue: [4, 3], cells: '..##...#..', fresh: [2, 3, 7] },
  edgePush: { kind: 'nono', clue: [3], cells: '.##.xxxxxx', fresh: [2, 4, 5, 6, 7, 8, 9] },
  capBlock: { kind: 'nono', clue: [1, 3], cells: '..x###x...', fresh: [2, 6] },
  unreachable: { kind: 'nono', clue: [2], cells: 'xxxxx.#.xx', fresh: [0, 1, 2, 3, 4, 8, 9] },
  zeroLine: { kind: 'nono', clue: [0], cells: 'xxxxxxxxxx', fresh: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  gapTooSmall: { kind: 'nono', clue: [3, 3], cells: '###xxxx###', fresh: [4, 6] },
  // 스타배틀
  ruleLines: { kind: 'star', regions: ['aabbb', 'aabcc', 'ddbcc', 'ddeee', 'ddeee'], stones: [[1, 1]], fresh: [[1, 0], [1, 2], [1, 3], [1, 4], [0, 1], [2, 1], [3, 1], [4, 1], [0, 0]] },
  ruleTouch: { kind: 'star', plain: true, regions: ['aaa', 'aaa', 'aaa'], stones: [[1, 1]], fresh: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]] },
  confinedRow: { kind: 'star', regions: ['bbbccc', 'baaacc', 'bbdddc'], fresh: [[1, 0], [1, 4], [1, 5]] },
  rowOneRegion: { kind: 'star', regions: ['aaaaaa', 'abbbcc', 'abdccc'], fresh: [[1, 0], [2, 0]] },
  smallRegion: { kind: 'star', regions: ['bbcc', 'bacc', 'badd', 'bbdd'], fresh: [[1, 0], [2, 0], [1, 2], [2, 2]] },
  lShape: { kind: 'star', regions: ['bbcc', 'baac', 'badd', 'bbdd'], fresh: [[2, 2]] },
  blocker: { kind: 'star', regions: ['bbbbb', 'bbbcc', 'daaac', 'ddddc'], fresh: [[1, 2], [3, 2]] },
  twoRows: { kind: 'star', regions: ['bbbbdd', 'baaccd', 'bbaccd', 'bbbddd'], fresh: [[1, 0], [2, 0], [2, 1], [1, 5], [2, 5]] },
};

// ── Copy ──
const MASYU_KO: GuideCopy = {
  metaTitle: '마슈(Masyu) 공략 — 흰 돌·검은 돌 규칙과 풀이 기술 총정리 | PUZZLTHINK',
  metaDescription: '마슈(○● 퍼즐) 처음이라면? 검은 돌·흰 돌 규칙, 가장자리 패턴, 흰 돌 세 개, 작은 고리 금지 등 실전 풀이 기술을 그림으로 정리했어요.',
  keywords: ['마슈', 'Masyu', '마슈 공략', '마슈 푸는 법', '진주 퍼즐', '흰돌 검은돌 퍼즐', '니코리 퍼즐', '논리 퍼즐'],
  back: '마슈로 돌아가기', eyebrow: 'MASYU GUIDE', title: '마슈 공략', lead: '흰 돌은 곧게, 검은 돌은 꺾어서.',
  intro: '마슈는 칸의 가운데를 지나는 고리 하나를 그려서 모든 돌을 지나가게 하는 논리 퍼즐이에요. 규칙은 단 두 줄이지만, 돌들이 서로 힌트를 주고받으면서 선이 하나씩 확정돼요. 아래 패턴만 익혀도 10×10 챌린지를 혼자 풀 수 있어요.',
  tocTitle: '목차', rulesTitle: '기본 규칙',
  rules: [
    '칸의 가운데와 가운데를 가로·세로로 이어, 끊기거나 갈라지지 않는 고리 하나를 그려요. 한 칸은 한 번만 지나요.',
    '고리는 모든 돌(흰 돌·검은 돌)을 지나야 해요. 돌이 없는 칸은 지나도 되고 안 지나도 돼요.',
    '● 검은 돌: 그 칸에서 반드시 90° 꺾이고, 꺾인 양쪽으로 최소 한 칸 더 곧게 뻗어요.',
    '○ 흰 돌: 그 칸은 곧게 지나가고, 바로 앞이나 뒤 칸 중 적어도 한 곳에서 꺾여요.',
  ],
  principleTitle: '그림으로 보는 두 규칙',
  principles: [
    { title: '검은 돌 = 꺾고, 두 칸씩 뻗기', body: '검은 돌에서 나가는 선은 두 갈래이고, 각 갈래는 돌 바로 옆 칸을 곧게 지나 최소 두 칸 길이가 돼요. 그래서 검은 돌 근처의 공간이 모자라면 방향이 바로 정해져요.' },
    { title: '흰 돌 = 곧게, 옆에서 꺾기', body: '흰 돌은 직선 위에 있어요. 그런데 양옆 칸까지 모두 직선이면 안 되고, 어느 한쪽에서는 꺾여야 해요. 흰 돌 여러 개가 줄지어 있으면 이 조건 때문에 방향이 바뀌어요.' },
  ],
  sections: [
    { id: 'black', title: '검은 돌 패턴', intro: '검은 돌은 선이 갈 수 있는 길이 좁아서 가장 먼저 확정되는 곳이에요.', techs: [
      { id: 'edgeBlack', title: '벽에 붙은 검은 돌', body: '검은 돌의 선은 한 방향으로 두 칸을 뻗어야 해요. 벽 쪽(또는 벽까지 한 칸뿐인 쪽)으로는 두 칸이 안 나오니, 반대쪽으로 두 칸이 바로 확정돼요. 가장자리 둘째 줄의 검은 돌도 같은 이유로 안쪽을 향해요.' },
      { id: 'blackPair', title: '나란히 붙은 검은 돌 두 개', body: '두 검은 돌 사이를 선이 지나면 둘 중 하나는 한 칸밖에 못 뻗어요. 그래서 둘 사이에는 ✕, 각각 바깥쪽으로 두 칸씩 뻗어요.' },
      { id: 'secondRowBlack', title: '벽에서 두 번째 칸의 검은 돌', body: '벽까지 한 칸밖에 없으면 그쪽으로 나간 다리가 곧게 한 칸 더 갈 수 없어요. 그래서 위·왼쪽처럼 벽 쪽 두 방향은 ✕, 아래·오른쪽으로 두 칸씩 확정이에요. 모서리 근처 검은 돌은 이렇게 한 번에 풀려요.' },
    ] },
    { id: 'white', title: '흰 돌 패턴', intro: '흰 돌은 혼자서는 약하지만, 벽이나 다른 흰 돌과 만나면 강력해져요.', techs: [
      { id: 'edgeWhite', title: '벽에 붙은 흰 돌', body: '흰 돌은 곧게 지나가야 하는데 벽 쪽으로는 나갈 수 없으니, 벽과 나란히 지나가요. 벽에 수직인 방향은 바로 ✕예요.' },
      { id: 'whiteRow', title: '흰 돌 세 개가 한 줄', body: '세 흰 돌을 한 직선으로 지나가면 가운데 흰 돌의 앞뒤 칸이 둘 다 직선이 돼서 규칙을 어겨요. 그래서 세 돌 모두 줄에 수직으로 지나가요.' },
      { id: 'whitePairEnd', title: '흰 돌 두 개를 한 번에 지날 때', body: '나란한 흰 돌 두 개를 같은 직선으로 지나면, 각 돌의 "옆에서 꺾기"는 바깥쪽 칸에서만 가능해요. 그래서 양쪽 끝 칸에서 둘 다 꺾이고, 그 너머로 곧게 이어지지 않아요(✕).' },
    ] },
    { id: 'loop', title: '고리 전체 보기', intro: '돌 근처를 다 채웠는데 막혔다면, 고리 전체의 모양으로 생각해 보세요.', techs: [
      { id: 'corner', title: '모서리와 막다른 칸', body: '모서리 칸에 선이 들어오면 나갈 길이 하나뿐이라 반드시 꺾여요. 빈칸이든 돌이든, 들어오면 나가야 해요. 나갈 길이 하나도 없는 칸에는 선을 넣을 수 없어요.' },
      { id: 'smallLoop', title: '작은 고리 금지', body: '아직 지나지 않은 돌이 남아 있는데 선이 닫혀 버리면 안 돼요. 선 두 끝이 바로 이웃하게 되면, 그 사이를 잇는 칸은 ✕예요.' },
    ] },
  ],
  mistakesTitle: '자주 하는 실수',
  mistakes: [
    '검은 돌의 다리를 한 칸만 그리고 바로 꺾기 — 검은 돌에서 나간 선은 바로 옆 칸을 곧게 지나야 해요.',
    '흰 돌 앞뒤를 모두 직선으로 이어 버리기 — 한쪽에서는 꼭 꺾여야 해요.',
    '돌을 모두 지났다고 끝난 줄 알기 — 선이 하나의 고리로 닫혀야 정답이에요.',
    '✕를 안 쓰고 머릿속으로만 지우기 — 확신한 곳은 두 번 탭해 ✕로 남겨 두세요.',
  ],
  tipsTitle: '빠르게 푸는 꿀팁',
  tips: [
    '가장자리의 검은 돌부터 찾아요. 방향이 바로 정해지는 곳이에요.',
    '흰 돌이 줄지어 있거나 벽에 붙어 있으면 그다음이에요.',
    '선 끝이 생기면 그 끝이 갈 수 있는 길을 세어 보세요. 길이 하나뿐이면 바로 그려요.',
    '막히면 "여기로 가면?"을 가정해 보고, 모순이 나면 되돌리기로 돌아와 반대 방향을 그려요.',
    '확정된 선과 ✕만 남기고, 애매한 선은 그리지 않는 게 결국 빨라요.',
  ],
  ctaTitle: '이제 직접 풀어 볼까요?', ctaBody: '연습 6×6으로 감을 잡고, 10×10 챌린지에서 새 맵을 차지해 보세요. 남의 맵을 그 사람보다 빨리 풀면 뺏을 수도 있어요.', ctaPlay: '마슈 하러 가기',
  faqTitle: '자주 묻는 질문',
  faq: [
    { q: '마슈는 무슨 뜻인가요?', a: '일본 퍼즐 잡지 니코리(Nikoli)에서 나온 퍼즐로, "진주"를 뜻하는 말에서 왔어요. 그래서 흰 진주·검은 진주 퍼즐이라고도 불러요. PUZZLTHINK에서는 우리 바둑알 캐릭터로 그렸어요.' },
    { q: '정답은 하나뿐인가요?', a: '네. PUZZLTHINK의 모든 마슈 맵은 컴퓨터로 확인해서 정답이 딱 하나인 맵만 내보내요. 찍지 않고 논리로만 풀 수 있어요.' },
    { q: '챌린지 기록은 어떻게 매겨지나요?', a: '새로운 맵을 제한 없이 풀어 성공하면 그 맵의 주인이 돼요. 다른 사람이 내 기록보다 빨리 풀면 맵을 뺏겨요. 랭킹은 지금 가진 맵 개수로 정해져요.' },
  ],
};

const MASYU_EN: GuideCopy = {
  metaTitle: 'Masyu Guide — Black & White Pearl Rules and Solving Techniques | PUZZLTHINK',
  metaDescription: 'New to Masyu? The black and white pearl rules, edge patterns, three whites in a row, no small loops and more, explained with pictures.',
  keywords: ['Masyu', 'Masyu guide', 'how to solve Masyu', 'pearl puzzle', 'Nikoli puzzle', 'logic puzzle'],
  back: 'Back to Masyu', eyebrow: 'MASYU GUIDE', title: 'Masyu Guide', lead: 'Go straight through white, turn on black.',
  intro: 'Masyu is a logic puzzle: draw one loop through the centers of the cells so it passes every pearl. The rules fit in two lines, but the pearls give each other clues until every line is forced. Learn the patterns below and the 10×10 challenge is yours.',
  tocTitle: 'Contents', rulesTitle: 'Rules',
  rules: [
    'Connect cell centers horizontally and vertically into one closed loop with no branches or breaks. Each cell is visited at most once.',
    'The loop must pass every pearl (white and black). Empty cells may or may not be used.',
    '● Black pearl: the loop turns 90° on it and goes straight for at least one more cell on both sides.',
    '○ White pearl: the loop goes straight through it and turns in at least one of the two cells next to it.',
  ],
  principleTitle: 'The two rules in pictures',
  principles: [
    { title: 'Black = turn, then two cells each way', body: 'Both legs leaving a black pearl run straight through the next cell, so each leg is at least two cells long. When there is no room for that, the direction is forced right away.' },
    { title: 'White = straight, turn next door', body: 'A white pearl sits on a straight line, but the line must turn on at least one side. Rows of white pearls flip direction because of this.' },
  ],
  sections: [
    { id: 'black', title: 'Black pearl patterns', intro: 'Black pearls leave the fewest options, so they are where lines get fixed first.', techs: [
      { id: 'edgeBlack', title: 'Black pearl by the wall', body: 'A black pearl needs two cells of straight line in each direction it leaves. Toward the wall (or with only one cell before it) there is no room, so the legs go the other way.' },
      { id: 'blackPair', title: 'Two black pearls side by side', body: 'If the line ran between them, one of them could only extend one cell. So ✕ between them, and each one extends two cells outward.' },
      { id: 'secondRowBlack', title: 'Black pearl one cell from the wall', body: 'With only one cell before the wall, a leg that way cannot go straight one more cell. So both wall-side directions are ✕ and the legs run two cells the other ways. Black pearls near corners fall at once.' },
    ] },
    { id: 'white', title: 'White pearl patterns', intro: 'A white pearl alone says little, but next to a wall or other whites it is strong.', techs: [
      { id: 'edgeWhite', title: 'White pearl by the wall', body: 'It must go straight, and it cannot leave through the wall, so it runs along the wall. The direction into the wall is ✕.' },
      { id: 'whiteRow', title: 'Three white pearls in a row', body: 'One straight line through all three would leave the middle pearl with no turn next to it. So all three are crossed at right angles.' },
      { id: 'whitePairEnd', title: 'Two white pearls on one line', body: 'Going through two adjacent whites in one line, each can only turn on its outer side. So the line turns at both outer cells, and never runs straight past them.' },
    ] },
    { id: 'loop', title: 'Thinking about the whole loop', intro: 'Stuck after the pearls? Look at the loop as a whole.', techs: [
      { id: 'corner', title: 'Corners and dead ends', body: 'A line entering a corner cell has one way out, so it turns there. Any cell a line enters must also be left; a cell with no way out stays empty.' },
      { id: 'smallLoop', title: 'No small loops', body: 'The loop cannot close while pearls are still left. When two line ends sit next to each other, the edge between them is ✕.' },
    ] },
  ],
  mistakesTitle: 'Common mistakes',
  mistakes: [
    'Turning one cell after a black pearl: each leg must go straight through the next cell.',
    'Making both sides of a white pearl straight: one side must turn.',
    'Thinking you are done once every pearl is passed: it must be one closed loop.',
    'Keeping ✕ in your head: tap twice to leave a ✕ where you are sure.',
  ],
  tipsTitle: 'Tips',
  tips: [
    'Start with black pearls on the edge: their direction is fixed.',
    'Then whites in rows or along a wall.',
    'Whenever a line end appears, count its ways forward. One way? Draw it.',
    'Stuck? Try a direction; if it breaks, undo and draw the other one.',
    'Draw only what is certain plus ✕ marks. It ends up faster.',
  ],
  ctaTitle: 'Ready to try?', ctaBody: 'Warm up on 6×6 practice, then claim new maps in the 10×10 challenge. Solve someone else\'s map faster than them and it becomes yours.', ctaPlay: 'Play Masyu',
  faqTitle: 'FAQ',
  faq: [
    { q: 'What does Masyu mean?', a: 'It is a puzzle from the Japanese publisher Nikoli, named after the word for "pearl". On PUZZLTHINK the pearls are our stone characters.' },
    { q: 'Does every board have one answer?', a: 'Yes. Every Masyu board here is checked by computer to have exactly one answer, so it can be solved by logic alone.' },
    { q: 'How does the challenge ranking work?', a: 'Clear a new map and it is yours. If someone solves it faster than your time, they take it. The ranking counts the maps you own.' },
  ],
};

const NONO_KO: GuideCopy = {
  metaTitle: '노노그램(네모로직) 공략 — 겹치기부터 고급 기술까지 | PUZZLTHINK',
  metaDescription: '노노그램 처음이라면? 숫자 읽는 법, 겹치기, 꽉 찬 줄, 가장자리 밀기, 닿지 않는 칸 지우기 등 실전 풀이 기술을 그림으로 정리했어요.',
  keywords: ['노노그램', '네모로직', 'Nonogram', '노노그램 공략', '노노그램 푸는 법', '피크로스', '그림 퍼즐', '논리 퍼즐'],
  back: '노노그램으로 돌아가기', eyebrow: 'NONOGRAM GUIDE', title: '노노그램 공략', lead: '숫자만 보고 그림을 찾아내는 법.',
  intro: '노노그램(네모로직)은 가로·세로 숫자만 보고 칸을 칠해서 숨은 그림을 찾는 퍼즐이에요. 한 줄씩 "확실한 칸"만 칠해 나가면 찍지 않고도 끝까지 풀려요. 아래 기술은 그 확실한 칸을 찾는 방법이에요.',
  tocTitle: '목차', rulesTitle: '기본 규칙',
  rules: [
    '각 줄의 숫자는 그 줄에 연속으로 칠해진 칸 덩어리의 길이를 순서대로 알려줘요. "3 1"이면 3칸 덩어리, 한 칸 이상 띄고 1칸 덩어리.',
    '덩어리와 덩어리 사이에는 적어도 한 칸이 비어 있어요.',
    '모든 가로줄과 세로줄의 숫자가 맞으면 완성! 그림이 컬러로 빛나요.',
    '칠하면 안 되는 칸에는 ✕를 쳐 두면 헷갈리지 않아요.',
  ],
  principleTitle: '풀이의 두 원칙',
  principles: [
    { title: '한 줄씩, 확실한 칸만', body: '한 줄을 볼 때 "덩어리를 어떻게 놓아도 항상 칠해지는 칸"과 "항상 비는 칸"만 표시해요. 이것만 반복해도 PUZZLTHINK의 모든 노노그램이 풀려요.' },
    { title: '가로 ↔ 세로 번갈아', body: '가로줄에서 칸 하나가 정해지면 그 칸이 속한 세로줄에 새 정보가 생겨요. 방금 바뀐 줄을 따라가면 막힘이 줄어요.' },
  ],
  sections: [
    { id: 'basic', title: '기본 기술', intro: '처음 판을 보면 큰 숫자가 있는 줄부터 시작하세요.', techs: [
      { id: 'overlap', title: '겹치기', body: '10칸 줄에 7이면, 덩어리를 왼쪽 끝에 붙여도 오른쪽 끝에 붙여도 가운데 4칸은 항상 칠해져요. "줄 길이 − 숫자"만큼 양쪽에서 빼면 겹치는 칸이 나와요.' },
      { id: 'fullLine', title: '꽉 찬 줄', body: '숫자의 합 + (덩어리 수 − 1)이 줄 길이와 같으면 놓을 방법이 하나뿐이에요. 3 2 3은 3+2+3+2 = 10이라 바로 다 칠할 수 있어요.' },
      { id: 'zeroLine', title: '0인 줄', body: '숫자가 0이면 그 줄은 전부 비어요. 전부 ✕로 지워 두면 세로줄을 볼 때 편해요.' },
      { id: 'multiOverlap', title: '숫자가 여러 개일 때의 겹치기', body: '4 3은 최소 4+1+3 = 8칸이 필요하니 남는 칸은 2칸. 각 덩어리를 왼쪽으로 몰았을 때와 오른쪽으로 몰았을 때 겹치는 칸이 확정이에요.' },
    ] },
    { id: 'advanced', title: '중급 기술', intro: '칠해진 칸이 생기기 시작하면 쓸 수 있는 기술이에요.', techs: [
      { id: 'edgePush', title: '가장자리 밀기', body: '벽에서 두 번째 칸이 칠해졌고 첫 숫자가 3이면, 그 덩어리는 벽에서 멀어질 수 없어요. 그래서 바로 옆 칸까지 확정되고, 닿을 수 없는 먼 칸은 ✕예요.' },
      { id: 'capBlock', title: '완성된 덩어리 막기', body: '숫자 3과 길이가 같은 덩어리가 칠해졌다면 그 덩어리는 끝난 거예요. 양쪽 끝을 바로 ✕로 막으세요.' },
      { id: 'unreachable', title: '닿을 수 없는 칸', body: '숫자가 2 하나뿐인데 6번째 칸이 칠해져 있으면, 덩어리는 5~7번째 안에 있어요. 거기서 먼 칸은 모두 ✕예요.' },
      { id: 'gapTooSmall', title: '너무 좁은 틈', body: '✕ 사이에 낀 1칸짜리 틈에는 3칸 덩어리가 들어갈 수 없어요. 들어갈 수 있는 덩어리가 없는 틈은 모두 ✕예요.' },
    ] },
  ],
  mistakesTitle: '자주 하는 실수',
  mistakes: [
    '덩어리의 순서를 잊기 — "2 5"면 왼쪽(위쪽)부터 2, 그다음 5예요.',
    '덩어리 사이 빈칸을 빼먹고 계산하기 — 숫자 사이에는 항상 한 칸 이상 비어요.',
    '감으로 칠하기 — 틀린 칸 하나가 줄줄이 모순을 만들어요. 애매하면 되돌리기!',
    '✕를 안 쓰기 — 빈칸 확정도 칠한 칸만큼 중요한 정보예요.',
  ],
  tipsTitle: '빠르게 푸는 꿀팁',
  tips: [
    '큰 숫자, 꽉 찬 줄, 0인 줄부터 훑어요.',
    '숫자가 다 맞은 줄은 숫자가 흐려져요. 남은 칸은 바로 ✕로 채우세요.',
    '드래그로 한 줄을 쭉 칠하거나 ✕할 수 있어요. 시작한 칸이 칠해져 있으면 드래그가 지우개가 돼요.',
    '5칸마다 굵은 선이 있어요. 칸 수를 셀 때 기준으로 쓰세요.',
    '막히면 가장 많이 정해진 줄로 돌아가 다시 겹치기를 해 보세요.',
  ],
  ctaTitle: '이제 직접 풀어 볼까요?', ctaBody: '연습 5×5로 감을 잡고, 15×15 챌린지에서 새 맵을 차지해 보세요. 남의 맵을 그 사람보다 빨리 풀면 뺏을 수도 있어요.', ctaPlay: '노노그램 하러 가기',
  faqTitle: '자주 묻는 질문',
  faq: [
    { q: '네모로직과 노노그램은 같은 건가요?', a: '네. 노노그램, 네모로직, 피크로스, 그림 로직은 모두 같은 규칙의 퍼즐을 부르는 이름이에요.' },
    { q: '찍어야 하는 문제도 있나요?', a: '없어요. PUZZLTHINK의 노노그램은 한 줄씩 논리로만 풀어서 끝까지 확정되는 맵만 내보내요. 정답도 하나뿐이에요.' },
    { q: '챌린지 기록은 어떻게 매겨지나요?', a: '새로운 맵을 제한 없이 풀어 성공하면 그 맵의 주인이 돼요. 다른 사람이 내 기록보다 빨리 풀면 맵을 뺏겨요. 랭킹은 지금 가진 맵 개수로 정해져요.' },
  ],
};

const NONO_EN: GuideCopy = {
  metaTitle: 'Nonogram Guide — From Overlap to Advanced Techniques | PUZZLTHINK',
  metaDescription: 'New to nonograms? Reading the clues, overlap, full lines, edge pushing, unreachable cells and more, explained with pictures.',
  keywords: ['Nonogram', 'Picross', 'Griddler', 'nonogram guide', 'how to solve nonograms', 'logic puzzle', 'picture puzzle'],
  back: 'Back to Nonogram', eyebrow: 'NONOGRAM GUIDE', title: 'Nonogram Guide', lead: 'Find the picture from numbers alone.',
  intro: 'A nonogram hides a picture: the numbers beside each row and column tell you which cells to fill. Fill only the cells that are certain, one line at a time, and you never need to guess. The techniques below are how you find those cells.',
  tocTitle: 'Contents', rulesTitle: 'Rules',
  rules: [
    'The numbers of a line are the lengths of its runs of filled cells, in order. "3 1" means a run of 3, a gap, then a run of 1.',
    'Runs are separated by at least one empty cell.',
    'When every row and column matches its numbers, the picture is done and lights up in colour.',
    'Mark cells that must stay empty with ✕ to keep track.',
  ],
  principleTitle: 'Two principles',
  principles: [
    { title: 'One line, certain cells only', body: 'For a line, mark only the cells that are filled (or empty) in every possible placement of its runs. Repeating this solves every nonogram on PUZZLTHINK.' },
    { title: 'Rows ↔ columns', body: 'A cell found in a row gives its column new information. Follow the lines that just changed.' },
  ],
  sections: [
    { id: 'basic', title: 'Basics', intro: 'Start with the lines that have big numbers.', techs: [
      { id: 'overlap', title: 'Overlap', body: 'A 7 in a line of 10: whether the run sits at the left or the right end, the middle 4 cells are filled. Take "line length − number" off both ends.' },
      { id: 'fullLine', title: 'Full lines', body: 'If the numbers plus one gap between each fill the line exactly, there is only one placement. 3 2 3 → 3+2+3+2 = 10.' },
      { id: 'zeroLine', title: 'Zero lines', body: 'A 0 means the whole line is empty. Cross it out: it helps when reading the columns.' },
      { id: 'multiOverlap', title: 'Overlap with several numbers', body: '4 3 needs at least 4+1+3 = 8 cells, leaving 2 to spare. Push every run left, then right: cells covered both times are filled.' },
    ] },
    { id: 'advanced', title: 'Next steps', intro: 'Once some cells are filled:', techs: [
      { id: 'edgePush', title: 'Pushing from the edge', body: 'The second cell is filled and the first number is 3: that run cannot move away from the wall, so the next cell is filled too and far cells are ✕.' },
      { id: 'capBlock', title: 'Capping a finished run', body: 'A filled run as long as its number is complete. Put ✕ at both ends.' },
      { id: 'unreachable', title: 'Unreachable cells', body: 'A single 2 with cell 6 filled: the run lies within cells 5–7. Everything else is ✕.' },
      { id: 'gapTooSmall', title: 'Gaps too small', body: 'A one-cell gap between ✕ marks cannot hold a run of 3. Any gap no run fits in is ✕.' },
    ] },
  ],
  mistakesTitle: 'Common mistakes',
  mistakes: [
    'Forgetting the order: "2 5" means 2 first (left / top), then 5.',
    'Forgetting the gap between runs when counting.',
    'Filling by feel: one wrong cell causes a chain of contradictions. Undo when unsure.',
    'Skipping ✕ marks: empty cells are information too.',
  ],
  tipsTitle: 'Tips',
  tips: [
    'Scan for big numbers, full lines and zero lines first.',
    'A line whose numbers are met fades its numbers: cross out the rest.',
    'Drag to fill or ✕ a whole run. Starting on a filled cell makes the drag erase.',
    'Thick lines every 5 cells help you count.',
    'Stuck? Go back to the most decided line and redo the overlap.',
  ],
  ctaTitle: 'Ready to try?', ctaBody: 'Warm up on 5×5 practice, then claim new maps in the 15×15 challenge. Solve someone else\'s map faster than them and it becomes yours.', ctaPlay: 'Play Nonogram',
  faqTitle: 'FAQ',
  faq: [
    { q: 'Are Picross and nonograms the same?', a: 'Yes. Nonogram, Picross, Griddlers and Paint by Numbers are names for the same puzzle.' },
    { q: 'Do I ever need to guess?', a: 'No. Every nonogram here is solvable line by line with logic alone, and has exactly one answer.' },
    { q: 'How does the challenge ranking work?', a: 'Clear a new map and it is yours. If someone solves it faster than your time, they take it. The ranking counts the maps you own.' },
  ],
};

const STAR_KO: GuideCopy = {
  metaTitle: '스타배틀(Star Battle) 공략 — 바둑알 배치 규칙과 풀이 기술 총정리 | PUZZLTHINK',
  metaDescription: '스타배틀 처음이라면? 줄·구역마다 하나, 붙으면 안 되는 규칙부터 작은 구역, 한 줄에 갇힌 구역, 두 구역·두 줄 같은 실전 풀이 기술을 그림으로 정리했어요.',
  keywords: ['스타배틀', 'Star Battle', '스타배틀 공략', '스타배틀 푸는 법', '퀸 퍼즐 공략', '별 배치 퍼즐', '논리 퍼즐'],
  back: '스타배틀로 돌아가기', eyebrow: 'STAR BATTLE GUIDE', title: '스타배틀 공략', lead: '놓을 곳보다, 못 놓을 곳을 먼저.',
  intro: '스타배틀은 줄마다, 구역마다 바둑알을 하나씩 놓는 퍼즐이에요. 잘 푸는 사람은 바둑알을 어디에 놓을지보다 어디에 못 놓는지를 먼저 찾아요. ✕가 쌓이면 바둑알 자리는 저절로 하나만 남거든요. 아래 기술 여섯 개면 10×10 챌린지도 찍지 않고 풀 수 있어요.',
  tocTitle: '목차', rulesTitle: '기본 규칙',
  rules: [
    'N×N 판에 바둑알 N개를 놓아요. 판은 색깔이 다른 구역 N개로 나뉘어 있어요.',
    '가로줄마다, 세로줄마다, 색깔 구역마다 바둑알이 정확히 하나씩 있어야 해요.',
    '바둑알끼리는 가로·세로·대각선 어느 방향으로도 맞닿으면 안 돼요.',
    '바둑알이 올 수 없는 칸은 ✕로 지워 두세요. 남은 칸이 곧 답이에요.',
  ],
  principleTitle: '그림으로 보는 두 규칙',
  principles: [
    { title: '줄·세로줄·구역에 하나', body: '바둑알을 하나 놓으면 그 가로줄, 그 세로줄, 그 색깔 구역에는 더 놓을 수 없어요. 금색 ✕가 한 알이 지우는 칸이에요.' },
    { title: '주변 8칸은 비워 두기', body: '바둑알은 대각선으로도 붙으면 안 돼요. 그래서 한 알을 놓으면 둘러싼 8칸이 모두 ✕가 돼요. 이 규칙이 구역 모양 기술의 바탕이에요.' },
  ],
  sections: [
    { id: 'basic', title: '기본 기술', intro: '판을 처음 볼 때 가장 먼저 찾는 패턴이에요.', techs: [
      { id: 'confinedRow', title: '한 줄에 갇힌 구역', body: '빨간 구역이 가로줄 하나 안에만 있어요. 이 구역의 바둑알은 반드시 그 줄에 놓이니, 그 줄의 바둑알 자리는 이미 찼어요. 같은 줄의 다른 구역 칸은 모두 ✕. 세로줄에 갇힌 구역도 똑같아요.' },
      { id: 'rowOneRegion', title: '한 구역뿐인 줄', body: '반대로, 어떤 줄이 통째로 한 구역이면 그 줄의 바둑알이 곧 그 구역의 바둑알이에요. 그래서 그 구역이 줄 밖으로 뻗은 칸은 모두 ✕예요. ✕를 지우다 보면 줄의 남은 칸이 한 구역만 남는 경우가 많아요.' },
      { id: 'smallRegion', title: '두 칸짜리 구역', body: '두 칸 중 어디에 바둑알이 놓이든, 두 칸 모두와 맞닿는 칸에는 바둑알이 올 수 없어요. 세로로 긴 두 칸이면 양옆 네 칸이 ✕예요.' },
    ] },
    { id: 'shape', title: '구역 모양 기술', intro: '구역의 모양만 보고 주변 칸을 지우는 기술이에요.', techs: [
      { id: 'lShape', title: 'ㄱ자 세 칸 구역', body: '세 칸 모두와 맞닿는 칸이 하나 있어요(금색). 거기에 바둑알을 놓으면 구역 전체가 지워지니, 그 칸은 ✕예요. 2×2 안에 들어가는 구역은 항상 이런 칸이 생겨요.' },
      { id: 'blocker', title: '구역을 막는 칸', body: '어떤 칸에 바둑알을 놓았을 때 한 구역의 남은 칸이 전부 지워진다면, 그 칸은 ✕예요. 가로로 세 칸인 구역의 가운데 위·아래 칸이 대표적이에요.' },
    ] },
    { id: 'advanced', title: '고급 기술', intro: '막혔을 때 꺼내는 세기 기술이에요.', techs: [
      { id: 'twoRows', title: '두 구역, 두 줄', body: '두 구역(빨강·노랑)이 가로줄 두 개 안에 모두 들어 있어요. 이 두 줄에는 바둑알이 두 개뿐인데, 두 구역이 하나씩 가져가야 해요. 그래서 두 줄의 다른 구역 칸은 모두 ✕예요. 세 구역·세 줄, 세로줄에서도 똑같이 쓸 수 있어요.' },
    ] },
  ],
  mistakesTitle: '자주 하는 실수',
  mistakes: [
    '대각선을 잊기 — 바둑알은 모서리끼리도 붙으면 안 돼요.',
    '바둑알부터 놓기 — 확실하지 않으면 ✕부터 지우세요. 틀린 바둑알 하나가 판 전체를 꼬이게 해요.',
    '세로줄 확인을 빼먹기 — 가로줄에서 쓴 기술은 세로줄에서도 그대로 통해요.',
    '구역 경계를 잘못 보기 — 굵은 선이 구역의 경계예요. 색이 비슷하면 굵은 선을 따라가 보세요.',
  ],
  tipsTitle: '빠르게 푸는 꿀팁',
  tips: [
    '가장 작은 구역부터 보세요. 칸이 적을수록 지울 칸이 많아요.',
    '바둑알을 놓자마자 줄·세로줄·구역·주변 8칸을 ✕로 지우세요. 드래그하면 한 번에 그어져요.',
    '한 줄에 갇힌 구역이 보이면 그 줄은 바로 정리돼요.',
    '찡그린 돌이 보이면 그 돌이 다른 돌과 겹친 거예요. 되돌리기(Ctrl/⌘+Z)로 바로잡아요.',
    '막히면 두 구역이 두 줄 안에 들어가는 곳이 없는지 세어 보세요.',
  ],
  ctaTitle: '이제 직접 풀어 볼까요?', ctaBody: '연습 6×6으로 감을 잡고, 10×10 챌린지에서 새 맵을 차지해 보세요. 남의 맵을 그 사람보다 빨리 풀면 뺏을 수도 있어요.', ctaPlay: '스타배틀 하러 가기',
  faqTitle: '자주 묻는 질문',
  faq: [
    { q: '스타배틀은 어떤 퍼즐인가요?', a: '별을 놓는 논리 퍼즐 장르로, 세계 퍼즐 대회에서도 자주 나와요. 별 하나 버전은 \'퀸 퍼즐\'이라는 이름으로도 알려져 있어요. PUZZLTHINK에서는 별 대신 바둑알 캐릭터를 놓아요.' },
    { q: '찍어야 하는 문제도 있나요?', a: '없어요. 모든 맵은 정답이 하나뿐인지 컴퓨터로 확인한 뒤에 나와요. 논리만으로 끝까지 풀 수 있어요.' },
    { q: '챌린지 기록은 어떻게 매겨지나요?', a: '새로운 맵을 풀어 성공하면 그 맵의 주인이 돼요. 다른 사람이 내 기록보다 빨리 풀면 맵을 뺏겨요. 랭킹은 지금 가진 맵 개수로 정해져요.' },
  ],
};

const STAR_EN: GuideCopy = {
  metaTitle: 'Star Battle Guide — Rules and Solving Techniques | PUZZLTHINK',
  metaDescription: 'New to Star Battle? One per row, column and region, no touching, then small regions, regions stuck in a row, two regions in two rows and more, explained with pictures.',
  keywords: ['Star Battle', 'Star Battle guide', 'how to solve Star Battle', 'queens puzzle tips', 'Two Not Touch', 'logic puzzle'],
  back: 'Back to Star Battle', eyebrow: 'STAR BATTLE GUIDE', title: 'Star Battle Guide', lead: 'Find where stones can\'t go first.',
  intro: 'Star Battle asks for one stone in every row, column and region. Good solvers look for where a stone cannot go before where it can: as ✕ marks pile up, each stone is left with a single place. The six techniques below are enough to solve the 10×10 challenge without guessing.',
  tocTitle: 'Contents', rulesTitle: 'Rules',
  rules: [
    'Place N stones on an N×N board divided into N coloured regions.',
    'Every row, every column and every region holds exactly one stone.',
    'Stones may not touch, horizontally, vertically or diagonally.',
    'Cross out cells that cannot hold a stone. What is left is the answer.',
  ],
  principleTitle: 'Two rules in pictures',
  principles: [
    { title: 'One per row, column and region', body: 'A stone fills its row, its column and its region. The gold ✕ marks are the cells one stone rules out.' },
    { title: 'Keep the 8 neighbours empty', body: 'Stones never touch, not even diagonally, so every stone rules out the 8 cells around it. The shape techniques build on this.' },
  ],
  sections: [
    { id: 'basic', title: 'Basics', intro: 'The first patterns to look for on a new board.', techs: [
      { id: 'confinedRow', title: 'A region inside one row', body: 'The red region lies within a single row, so its stone is in that row and the row\'s stone is taken. Every other cell of the row is ✕. The same works for columns.' },
      { id: 'rowOneRegion', title: 'A row of one region', body: 'The other way round: if a row is all one region, the row\'s stone is that region\'s stone, so the region\'s cells outside the row are ✕. Crossing out often leaves a row with only one region.' },
      { id: 'smallRegion', title: 'Two-cell regions', body: 'Wherever the stone goes, any cell touching both cells cannot hold a stone. For a vertical domino, the four cells beside it are ✕.' },
    ] },
    { id: 'shape', title: 'Shape techniques', intro: 'Rule out cells from a region\'s shape alone.', techs: [
      { id: 'lShape', title: 'L-shaped three cells', body: 'One cell touches all three (gold). A stone there would wipe out the whole region, so it is ✕. Any region that fits in a 2×2 square has such a cell.' },
      { id: 'blocker', title: 'Cells that block a region', body: 'If a stone on a cell would cross out every remaining cell of some region, that cell is ✕. The cells above and below the middle of a three-cell row are the classic case.' },
    ] },
    { id: 'advanced', title: 'Advanced', intro: 'A counting trick for when you are stuck.', techs: [
      { id: 'twoRows', title: 'Two regions, two rows', body: 'Two regions (red and yellow) fit entirely inside two rows. Those rows hold only two stones and both regions need one, so every other cell in the two rows is ✕. It works for three regions in three rows, and for columns.' },
    ] },
  ],
  mistakesTitle: 'Common mistakes',
  mistakes: [
    'Forgetting diagonals: stones may not touch corner to corner.',
    'Placing stones first: when unsure, cross out instead. One wrong stone tangles the whole board.',
    'Skipping the columns: every row technique works on columns too.',
    'Misreading borders: thick lines mark regions. Follow them when colours look alike.',
  ],
  tipsTitle: 'Tips',
  tips: [
    'Start with the smallest region: fewer cells, more to cross out.',
    'Right after placing a stone, ✕ its row, column, region and 8 neighbours. Drag to mark many at once.',
    'A region stuck in one row clears that row immediately.',
    'A worried stone overlaps another. Undo (Ctrl/⌘+Z) and fix it.',
    'Stuck? Count: do two regions fit inside two rows somewhere?',
  ],
  ctaTitle: 'Ready to try?', ctaBody: 'Warm up on 6×6 practice, then claim new maps in the 10×10 challenge. Solve someone else\'s map faster than them and it becomes yours.', ctaPlay: 'Play Star Battle',
  faqTitle: 'FAQ',
  faq: [
    { q: 'What is Star Battle?', a: 'A logic puzzle genre where you place stars, often seen at world puzzle championships. The one-star version is also known as the queens puzzle. Here you place our stone characters instead.' },
    { q: 'Do I ever need to guess?', a: 'No. Every board is checked by computer to have exactly one answer, so logic alone gets you to the end.' },
    { q: 'How does the challenge ranking work?', a: 'Clear a new map and it is yours. If someone solves it faster than your time, they take it. The ranking counts the maps you own.' },
  ],
};

export const GUIDE_COPY: Record<LogicGameId, Record<'ko' | 'en', GuideCopy>> = {
  masyu: { ko: MASYU_KO, en: MASYU_EN },
  nonogram: { ko: NONO_KO, en: NONO_EN },
  starbattle: { ko: STAR_KO, en: STAR_EN },
};
