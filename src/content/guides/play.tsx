// 스도쿠 (/play) guide. Rules and numbers follow src/lib/sudoku.ts (generatePuzzle: a random full grid, clues removed while
// the solution stays unique, aiming at 38 / 30 / 24 clues for easy / medium / hard), src/hooks/useSudoku.ts (3 mistakes end
// the game, a wrong digit stays until erased, correct digits lock and clear matching notes, one hint per game on the empty
// cell with the fewest candidates, notes mode, pause), src/components/PlayClient.tsx and the SudokuGuide messages (the old
// inline guide, src/components/SudokuGuide.tsx, is replaced by GameArticle).
// The walkthrough puzzle was made by the game's own generatePuzzle('easy') (38 clues) and its first eight steps were found
// and checked with a hidden/naked-single solver. Every technique diagram was checked for legality cell by cell.
import type { GameGuide } from './types';

type Spec = {
  givens: [number, number, number][]; // row, col, digit (0-based)
  placed?: [number, number, number][]; // digits filled in so far (blue)
  target?: [number, number, number];
  rows?: number[];
  cols?: number[];
  boxes?: number[]; // 0–8, highlighted 3×3 boxes
  notes?: [number, number, string][];
  struck?: [number, number][];
};

function SudokuDiagram({ spec, label }: { spec: Spec; label: string }) {
  const S = 22, P = 4, W = S * 9 + P * 2;
  const at = (n: number) => P + n * S;
  const hl = (r: number, c: number) => spec.rows?.includes(r) || spec.cols?.includes(c) || spec.boxes?.includes(Math.floor(r / 3) * 3 + Math.floor(c / 3));
  const digit = (r: number, c: number, d: number, fill: string, key: string) => (
    <text key={key} x={at(c) + S / 2} y={at(r) + S / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="800" fill={fill}>{d}</text>
  );
  return (
    <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[320px]">
      <rect x="0" y="0" width={W} height={W} rx="8" fill="#ffffff" />
      {Array.from({ length: 81 }).map((_, i) => {
        const r = Math.floor(i / 9), c = i % 9;
        const target = spec.target && spec.target[0] === r && spec.target[1] === c;
        return <rect key={i} x={at(c)} y={at(r)} width={S} height={S} fill={target ? '#4b7bff' : hl(r, c) ? '#e6edff' : '#ffffff'} />;
      })}
      {Array.from({ length: 10 }).map((_, i) => (
        <g key={i} stroke="#17201e" strokeOpacity={i % 3 === 0 ? 0.85 : 0.15} strokeWidth={i % 3 === 0 ? 1.4 : 0.6}>
          <line x1={at(i)} y1={P} x2={at(i)} y2={W - P} /><line x1={P} y1={at(i)} x2={W - P} y2={at(i)} />
        </g>
      ))}
      {spec.givens.map(([r, c, d]) => digit(r, c, d, '#17201e', `g${r}${c}`))}
      {spec.placed?.map(([r, c, d]) => digit(r, c, d, '#4b7bff', `p${r}${c}`))}
      {spec.notes?.map(([r, c, n]) => <text key={`n${r}${c}`} x={at(c) + S / 2} y={at(r) + S / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="700" fill="#4b7bff">{n}</text>)}
      {spec.struck?.map(([r, c]) => <line key={`s${r}${c}`} x1={at(c) + 3} y1={at(r) + S - 3} x2={at(c) + S - 3} y2={at(r) + 3} stroke="#ff6b4a" strokeWidth="1.2" />)}
      {spec.target && <text x={at(spec.target[1]) + S / 2} y={at(spec.target[0]) + S / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fill="#ffffff">{spec.target[2]}</text>}
    </svg>
  );
}
const fig = (spec: Spec, label: string) => <SudokuDiagram spec={spec} label={label} />;

// The walkthrough puzzle (generatePuzzle('easy'), 38 clues), rows top to bottom.
const PUZZLE = [
  [0, 8, 3, 4, 6, 0, 0, 9, 2],
  [0, 0, 5, 0, 8, 0, 1, 7, 0],
  [0, 6, 0, 0, 9, 1, 3, 0, 4],
  [0, 0, 0, 3, 0, 0, 9, 0, 0],
  [3, 9, 8, 0, 5, 0, 0, 0, 0],
  [5, 0, 0, 0, 0, 9, 6, 0, 0],
  [0, 5, 9, 0, 1, 8, 7, 0, 0],
  [6, 0, 0, 7, 2, 5, 0, 0, 0],
  [8, 0, 0, 9, 0, 4, 2, 6, 0],
];
const GIVENS = PUZZLE.flatMap((row, r) => row.flatMap((d, c) => (d ? [[r, c, d] as [number, number, number]] : [])));
// Steps 1–8 in order: [row, col, digit].
const STEPS: [number, number, number][] = [[0, 0, 1], [1, 0, 9], [1, 1, 4], [1, 5, 3], [2, 3, 5], [1, 3, 2], [0, 5, 7], [0, 6, 5]];
const WALK_START: Spec = { givens: GIVENS, boxes: [0] };
const WALK_STEP1: Spec = { givens: GIVENS, target: STEPS[0], rows: [1, 2], boxes: [0] };
const WALK_STEP4: Spec = { givens: GIVENS, placed: STEPS.slice(0, 3), target: STEPS[3], cols: [3], rows: [0], boxes: [1] };
const WALK_END: Spec = { givens: GIVENS, placed: STEPS.slice(0, 7), target: STEPS[7], rows: [0] };

// Techniques.
const CROSS: Spec = { givens: [[1, 5, 5], [2, 7, 5], [5, 0, 5], [7, 1, 5], [0, 0, 8], [1, 1, 3]], target: [0, 2, 5], rows: [1, 2], cols: [0, 1], boxes: [0] };
const NAKED: Spec = { givens: [[4, 0, 1], [4, 1, 2], [4, 8, 3], [0, 4, 4], [2, 4, 5], [8, 4, 6], [3, 3, 7], [5, 5, 8]], target: [4, 4, 9], rows: [4], cols: [4], boxes: [4] };
const PAIR: Spec = { givens: [[0, 0, 1], [0, 2, 5], [0, 6, 9], [0, 8, 4]], notes: [[0, 1, '2 7'], [0, 4, '2 7'], [0, 3, '2 3 6'], [0, 5, '3 7 8'], [0, 7, '2 6 8']], struck: [[0, 3], [0, 5], [0, 7]], rows: [0] };
// Pointing: box 1's 4 must sit in row 1, so row 1 has no 4 elsewhere; in box 3 that leaves only row 3, column 9.
const POINT: Spec = {
  givens: [[1, 0, 1], [1, 1, 2], [1, 2, 3], [2, 0, 5], [2, 1, 6], [2, 2, 7], [1, 8, 9], [3, 6, 4], [6, 7, 4]],
  notes: [[0, 0, '4'], [0, 1, '4'], [0, 2, '4']], struck: [[0, 8]], target: [2, 8, 4], boxes: [0, 2],
};
// X-wing on 7: in rows 2 and 6 the 7 can only go in columns 3 and 7, so columns 3 and 7 lose 7 everywhere else.
const XWING: Spec = {
  givens: [],
  notes: [[1, 2, '7'], [1, 6, '7'], [5, 2, '7'], [5, 6, '7'], [3, 2, '7 8'], [8, 2, '2 7'], [0, 6, '3 7'], [7, 6, '7 9']],
  struck: [[3, 2], [8, 2], [0, 6], [7, 6]], rows: [1, 5],
};

const guide: GameGuide = {
  game: 'sudoku',
  origin: { kind: 'classic' },
  updated: '2026-11-26',
  related: ['merge2048', 'nemoCount', 'gyulhap', 'magicswap'],
  ko: {
    meta: {
      title: '스도쿠 공략 — 기초 규칙부터 짝 지우기·X-윙까지, 따라 푸는 해법 | PUZZLTHINK',
      description: '스도쿠를 처음 배우거나 어려움에서 막힌다면? 십자 교차, 후보가 하나뿐인 칸, 메모와 짝 지우기, 박스-줄 지우기, X-윙을 그림으로 설명하고, 실제 퍼즐의 첫 여덟 칸을 한 수씩 따라 풀어요. 난이도별 차이와 실수·힌트 규칙도 정리했어요.',
      keywords: ['스도쿠 공략', '스도쿠 푸는 법', '스도쿠 요령', '스도쿠 규칙', '스도쿠 초보', '스도쿠 어려움', '스도쿠 X윙', '온라인 스도쿠'],
    },
    title: '스도쿠 공략',
    lead: '계산은 하나도 없어요. 지우고 남은 자리가 답이에요.',
    intro: [
      '스도쿠는 9×9 판의 빈칸에 1부터 9까지 숫자를 채우는 논리 퍼즐이에요. 모든 **행**, 모든 **열**, 굵은 선으로 나뉜 모든 **3×3 박스**에 1~9가 한 번씩만 들어가야 해요. 숫자를 더하거나 빼는 일은 없고, "여기에는 이 숫자가 올 수 없다"를 하나씩 지워 나가다 보면 남는 자리가 답이 돼요.',
      '이 공략은 기초 기술부터 차례로 그림과 함께 설명해요. 십자 교차와 후보가 하나뿐인 칸으로 시작해, 메모를 이용한 짝 지우기, 박스-줄 지우기, X-윙까지 다뤄요. 중간에는 PUZZLTHINK가 실제로 만든 쉬움 퍼즐의 첫 여덟 칸을 한 수씩 따라 풀어 봐요. 좌표는 위에서부터 1~9행, 왼쪽부터 1~9열이에요.',
    ],
    gamePageTitle: '온라인 스도쿠 — 규칙부터 푸는 요령까지',
    summary: '십자 교차, 후보 하나, 짝 지우기, 박스-줄 지우기, X-윙과 따라 풀기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '스도쿠는 어디서 왔나요',
        blocks: [
          { type: 'p', text: '지금 같은 모양의 스도쿠는 1979년 미국의 퍼즐 잡지에 「넘버 플레이스(Number Place)」라는 이름으로 처음 실렸어요. 1980년대에 일본의 퍼즐 출판사 니콜리가 소개하면서 "숫자는 한 번만"이라는 뜻의 일본어를 줄인 「스도쿠(数独)」라는 이름이 붙었고, 2000년대 중반 영국 신문에 연재되면서 전 세계로 퍼졌어요.' },
          { type: 'p', text: '답이 하나뿐인 스도쿠가 되려면 처음 주어진 숫자가 적어도 17개는 있어야 한다는 사실이 2012년 컴퓨터 전수 탐색으로 증명됐어요. PUZZLTHINK 스도쿠는 완성된 판에서 숫자를 하나씩 지우되, 지울 때마다 답이 여전히 하나뿐인지 확인해서 만들어요. 그래서 모든 퍼즐의 답은 정확히 하나예요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판**: 가로 9줄(행), 세로 9줄(열), 굵은 선으로 나뉜 3×3 박스 9개로 이루어져 있어요.',
            '**행**: 각 행에 1~9가 한 번씩.',
            '**열**: 각 열에 1~9가 한 번씩.',
            '**박스**: 각 3×3 박스에 1~9가 한 번씩.',
            '**처음 숫자**: 처음부터 적혀 있는 숫자는 바꿀 수 없어요. 모든 빈칸을 채우면 완성이에요.',
          ] },
          { type: 'h3', text: 'PUZZLTHINK 스도쿠의 규칙' },
          { type: 'list', items: [
            '**실수 3번**: 정답과 다른 숫자를 넣으면 실수 1번이에요. 3번이 쌓이면 게임이 끝나요. 틀린 숫자는 지울 때까지 칸에 남아요.',
            '**맞힌 칸은 고정**: 정답을 넣은 칸은 바꾸거나 지울 수 없고, 같은 행·열·박스의 메모에서 그 숫자가 자동으로 지워져요.',
            '**힌트 1번**: 게임당 한 번, 지금 후보가 가장 적은 빈칸에 정답을 채워 줘요.',
            '**메모**: 메모 버튼이나 스페이스바로 메모 모드를 켜면 칸에 후보 숫자를 작게 적을 수 있어요.',
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 기술 — 지우고 남는 자리 찾기',
        lead: '파란 칸이 이번에 확정되는 칸, 연한 파란 줄과 박스가 근거예요.',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '기술 1', title: '십자 교차 (박스 안에서 자리 찾기)', body: '왼쪽 위 박스에 5가 들어갈 자리를 찾아요. 2행과 3행에는 다른 박스에 이미 5가 있으니 이 박스의 2·3행에는 5가 못 와요. 1열과 2열에도 아래쪽에 5가 있어요. 남는 칸은 1행 3열 하나뿐이라 그 칸이 5예요. 숫자 하나를 정해 놓고 박스마다 훑는, 가장 먼저 익혀야 하는 기술이에요.', figure: fig(CROSS, '십자 교차로 5의 자리 찾기') },
            { tag: '기술 2', title: '후보가 하나뿐인 칸', body: '가운데 칸(5행 5열)을 기준으로 봐요. 같은 행에 1·2·3, 같은 열에 4·5·6, 같은 박스에 7·8이 있어요. 1~8이 모두 막혔으니 이 칸에 올 수 있는 숫자는 9뿐이에요. 칸 하나를 정해 행·열·박스를 동시에 보는 기술이에요.', figure: fig(NAKED, '후보가 하나뿐인 칸') },
          ] },
          { type: 'list', items: [
            '**하나만 비어 있는 줄부터**: 행·열·박스 중 빈칸이 하나뿐인 곳은 빠진 숫자 하나가 바로 답이에요. 시작하자마자 이런 곳부터 채우면 다른 칸의 단서가 늘어나요.',
            '**숫자 하나씩 훑기**: 1을 정해 아홉 박스를 다 훑고, 그다음 2, 3… 판에 많이 나온 숫자일수록 남은 자리가 적어서 찾기 쉬워요.',
            '**확실하지 않으면 넣지 않기**: 틀린 숫자는 실수로 세어지고, 세 번이면 끝나요. 후보가 두 개 이상이면 메모로 적어 두세요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 풀기 — 실제 퍼즐의 첫 여덟 칸',
        lead: 'PUZZLTHINK가 만든 쉬움 퍼즐(주어진 숫자 38개)이에요. 십자 교차만으로 여덟 칸이 차례로 풀려요.',
        blocks: [
          { type: 'figure', node: fig(WALK_START, '따라 풀기 퍼즐의 처음 모습'), caption: '처음 모습. 왼쪽 위 박스에 빈칸이 다섯 개 있어요.' },
          { type: 'steps', items: [
            { title: '1. 1행 1열 = 1', body: '왼쪽 위 박스에 1이 없어요. 2행에는 1이 7열에, 3행에는 6열에 있어서 이 박스의 2·3행에는 1이 못 와요. 남는 빈칸은 1행 1열뿐이에요.', figure: fig(WALK_STEP1, '1단계: 1행 1열에 1') },
            { title: '2. 2행 1열 = 9', body: '같은 박스의 9를 찾아요. 3행에는 5열에 9가 있고, 2열에는 5행에 9가 있어요. 남은 빈칸 2행 1열·2행 2열·3행 1열·3행 3열 중 9가 갈 수 있는 곳은 2행 1열뿐이에요.' },
            { title: '3. 2행 2열 = 4', body: '3행 9열에 4가 있어서 이 박스의 3행에는 4가 못 와요. 남는 2행 2열이 4예요. 이제 이 박스에는 3행 1열과 3행 3열이 남는데, 둘 다 2나 7이 될 수 있어서 아직 정할 수 없어요. 그럴 땐 다른 박스로 넘어가요.' },
            { title: '4. 2행 6열 = 3', body: '위 가운데 박스로 가요. 빈칸은 1행 6열, 2행 4열, 2행 6열, 3행 4열. 4열에는 4행에 3이 있어 2·3행의 4열은 안 되고, 1행에는 3열에 3이 있어요. 남는 2행 6열이 3이에요.', figure: fig(WALK_STEP4, '4단계: 2행 6열에 3') },
            { title: '5~6. 3행 4열 = 5, 2행 4열 = 2', body: '2행에는 3열에 5가 있고 6열에는 8행에 5가 있으니, 5는 3행 4열이에요. 그다음 2는 1행(9열에 2)에 못 와서 2행 4열이에요.' },
            { title: '7. 1행 6열 = 7', body: '위 가운데 박스에 빈칸이 하나만 남았어요. 이 박스에 없는 숫자는 7뿐이라 1행 6열은 7이에요.' },
            { title: '8. 1행 7열 = 5', body: '이제 1행은 1·8·3·4·6·7·□·9·2로 빈칸이 하나예요. 빠진 숫자는 5라 1행 7열이 5예요.', figure: fig(WALK_END, '8단계: 1행 7열에 5') },
          ] },
          { type: 'callout', tone: 'tip', title: '흐름을 보세요', text: '하나를 채우면 그 숫자가 다른 칸의 근거가 돼요. 막히면 같은 박스에 매달리지 말고 다른 박스, 다른 숫자로 옮겨 보세요. 3단계에서 남겨 둔 2와 7도, 나중에 1열이나 3열에 2나 7이 채워지면 바로 정해져요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 기술 — 메모로 후보 줄이기',
        lead: '보통 난이도부터는 메모가 필요해요. 후보를 적어 두면 아래 두 가지 모양이 눈에 들어와요.',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '기술 3', title: '짝 지우기 (네이키드 페어)', body: '1행의 두 칸(1행 2열과 1행 5열)에 후보가 똑같이 2와 7만 남았어요. 2와 7은 반드시 이 두 칸에 하나씩 들어가니, 같은 행의 다른 칸에서는 2와 7을 지울 수 있어요. 1행 4열은 3·6, 1행 6열은 3·8, 1행 8열은 6·8로 줄어요. 같은 원리로 세 칸에 후보 세 개가 갇히면 세 숫자를 지울 수 있어요.', figure: fig(PAIR, '짝 지우기') },
            { tag: '기술 4', title: '박스-줄 지우기 (포인팅)', body: '왼쪽 위 박스는 2·3행이 다 차 있어서, 이 박스의 4는 1행의 세 칸 중 하나에 들어가요. 그러면 1행의 다른 박스에는 4가 올 수 없어요. 오른쪽 위 박스를 보면 7열과 8열은 아래쪽의 4 때문에 막혀 있고, 2행 9열은 9로 차 있고, 1행 9열은 방금 지웠어요. 남는 3행 9열이 4예요. 박스 안에서 한 숫자가 한 줄에 몰리면, 그 줄의 나머지를 지울 수 있어요.', figure: fig(POINT, '박스-줄 지우기') },
          ] },
          { type: 'list', items: [
            '**메모는 한 번에 다 적지 않아도 돼요**: 후보가 두세 개인 칸부터 적으면 충분해요. 맞는 숫자를 넣으면 같은 행·열·박스의 메모가 자동으로 지워져요.',
            '**숨은 싱글**: 한 칸의 후보가 여러 개여도, 그 행(또는 열, 박스)에서 어떤 숫자가 들어갈 수 있는 칸이 그 칸 하나뿐이면 답이에요. 십자 교차를 행과 열에도 쓰는 셈이에요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 기술 — X-윙',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '기술 5', title: 'X-윙', body: '메모를 보니 2행에서 7이 들어갈 수 있는 칸이 3열과 7열 두 칸뿐이고, 6행에서도 3열과 7열 두 칸뿐이에요. 2행의 7이 3열이면 6행의 7은 7열, 2행이 7열이면 6행은 3열이에요. 어느 쪽이든 3열과 7열의 7은 2행과 6행이 가져가요. 그래서 3열과 7열의 다른 칸에서는 7을 지울 수 있어요(그림의 빗금 칸).', figure: fig(XWING, 'X-윙') },
          ] },
          { type: 'p', text: '어려움 퍼즐은 주어진 숫자가 24개 안팎이라 십자 교차만으로는 금방 막혀요. 그럴 때는 순서를 정해 두세요. ① 모든 칸에 메모를 채운다 → ② 후보 하나뿐인 칸과 숨은 싱글을 찾는다 → ③ 짝 지우기와 박스-줄 지우기로 후보를 줄인다 → ④ 그래도 막히면 숫자 하나를 정해 X-윙 모양을 찾는다. 대부분은 ③까지에서 다시 풀리기 시작해요.' },
          { type: 'callout', tone: 'note', title: '찍기는 왜 손해일까요', text: '이 게임은 넣는 순간 정답인지 판정해서, 틀리면 실수 하나가 쌓여요. 두 후보 중 하나를 찍으면 절반은 실수예요. 세 번이면 끝나니, 어려움일수록 한 칸이라도 근거가 있을 때만 넣으세요.' },
        ],
      },
      {
        id: 'levels',
        title: '난이도별 특징',
        blocks: [
          { type: 'table', head: ['난이도', '주어진 숫자', '주로 쓰는 기술'], rows: [
            ['쉬움', '약 38개', '십자 교차, 하나만 빈 줄. 메모 없이도 풀려요.'],
            ['보통', '약 30개', '후보가 하나뿐인 칸, 숨은 싱글. 메모를 조금씩 써요.'],
            ['어려움', '약 24개', '메모 필수. 짝 지우기, 박스-줄 지우기, 때로 X-윙.'],
          ] },
          { type: 'p', text: '주어진 숫자 개수는 목표치예요. 숫자를 지우다 답이 둘 이상이 되면 그 숫자는 지우지 않기 때문에, 가끔은 목표보다 몇 개 더 남은 채로 나와요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**박스를 잊기**: 행과 열만 보고 같은 박스에 같은 숫자를 넣는 실수가 가장 흔해요.',
            '**메모를 갱신하지 않기**: 맞힌 칸의 숫자는 자동으로 지워지지만, 짝 지우기로 지운 후보는 직접 지워야 해요.',
            '**한 박스에 매달리기**: 막히면 다른 박스, 다른 숫자로 옮기세요. 다른 곳의 숫자 하나가 막힌 곳을 풀어 줘요.',
            '**힌트를 너무 일찍 쓰기**: 힌트는 한 번뿐이에요. 어려움의 중반, 정말 막혔을 때를 위해 아껴 두세요.',
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '행·열·박스', def: '가로줄, 세로줄, 굵은 선으로 나뉜 3×3 칸. 각각에 1~9가 한 번씩 들어가요.' },
            { term: '후보', def: '그 칸에 아직 들어갈 수 있는 숫자들. 메모로 적어요.' },
            { term: '네이키드 싱글', def: '후보가 하나뿐인 칸.' },
            { term: '히든 싱글', def: '한 행·열·박스 안에서 어떤 숫자가 들어갈 수 있는 칸이 하나뿐인 경우.' },
            { term: '네이키드 페어', def: '같은 줄이나 박스의 두 칸에 같은 후보 두 개만 남은 모양. 그 둘을 다른 칸에서 지워요.' },
            { term: '포인팅', def: '박스 안의 한 숫자가 한 줄에 몰려 있어, 그 줄의 박스 밖에서 그 숫자를 지우는 기술.' },
            { term: 'X-윙', def: '두 줄에서 한 숫자의 후보가 같은 두 열(또는 행)에만 있을 때, 그 열의 나머지에서 그 숫자를 지우는 기술.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '스도쿠는 무료인가요?', a: '네. 가입 없이 PC와 모바일 브라우저에서 무료로 할 수 있어요.' },
      { q: '스도쿠를 처음 푸는데 어디서부터 보나요?', a: '빈칸이 하나뿐인 행·열·박스부터 채우고, 그다음 숫자 하나를 정해 아홉 박스를 훑으며 들어갈 자리가 하나뿐인 곳을 찾으세요. 쉬움은 이 두 가지로 끝까지 풀려요.' },
      { q: '힌트를 쓰면 어떻게 되나요?', a: '힌트는 게임당 한 번, 지금 후보가 가장 적은 빈칸 하나에 정답을 채워 줘요. 막혔을 때 흐름을 다시 잡는 용도로 쓰세요.' },
      { q: '실수는 몇 번까지 되나요?', a: '정답과 다른 숫자를 넣을 때마다 실수 1번이고, 3번이면 게임이 끝나요. 확실하지 않은 칸은 메모로 적어 두세요.' },
      { q: '모든 퍼즐에 답이 하나뿐인가요?', a: '네. 숫자를 지울 때마다 답이 하나뿐인지 확인하며 만들기 때문에, 모든 퍼즐의 정답은 하나예요.' },
    ],
    cta: { title: '첫 칸을 채워 볼까요?', body: '쉬움에서 십자 교차를 익히고, 보통과 어려움에서 메모 기술을 써 보세요.', button: '스도쿠 하러 가기' },
  },
  en: {
    meta: {
      title: 'Sudoku strategy — from the basics to naked pairs and X-wings, solved step by step | PUZZLTHINK',
      description: 'New to Sudoku or stuck on Hard? Cross-hatching, single-candidate cells, notes and naked pairs, pointing pairs and the X-wing, each with a diagram, plus the first eight cells of a real puzzle solved move by move, the difficulty levels, and the mistake and hint rules.',
      keywords: ['Sudoku strategy', 'how to solve Sudoku', 'Sudoku tips', 'Sudoku rules', 'Sudoku for beginners', 'Sudoku X-wing', 'online Sudoku'],
    },
    title: 'Sudoku strategy guide',
    lead: 'No arithmetic at all — the answer is whatever is left after you rule things out.',
    intro: [
      'Sudoku is a logic puzzle: fill the empty cells of a 9×9 grid with the digits 1 to 9 so that every **row**, every **column** and every bold-lined **3×3 box** contains each digit exactly once. There is no adding or subtracting; you rule out "this digit cannot go here" again and again until only one place is left.',
      'This guide explains the techniques in order, each with a diagram: cross-hatching and single-candidate cells first, then naked pairs with notes, pointing pairs and the X-wing. In between, it solves the first eight cells of an easy puzzle PUZZLTHINK actually generated, one move at a time. Coordinates are rows 1–9 from the top and columns 1–9 from the left.',
    ],
    gamePageTitle: 'Online Sudoku — rules and solving techniques',
    summary: 'Cross-hatching, single candidates, naked pairs, pointing, X-wing and a step-by-step solve.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'Where Sudoku comes from',
        blocks: [
          { type: 'p', text: 'Sudoku in its modern form first appeared in 1979 in an American puzzle magazine under the name Number Place. In the 1980s the Japanese puzzle publisher Nikoli introduced it in Japan, where it got the name Sudoku (数独), short for a phrase meaning "the digits must be single". It went worldwide in the mid-2000s after British newspapers began printing it.' },
          { type: 'p', text: 'A Sudoku with a unique solution needs at least 17 starting digits — a fact proved by an exhaustive computer search in 2012. PUZZLTHINK’s Sudoku starts from a full grid and removes digits one at a time, checking after each removal that the solution is still unique, so every puzzle has exactly one answer.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**The grid**: 9 rows, 9 columns and 9 bold-lined 3×3 boxes.',
            '**Rows**: each row holds 1–9 once.',
            '**Columns**: each column holds 1–9 once.',
            '**Boxes**: each 3×3 box holds 1–9 once.',
            '**Starting digits**: the digits printed at the start cannot be changed. Fill every empty cell to finish.',
          ] },
          { type: 'h3', text: 'PUZZLTHINK’s Sudoku rules' },
          { type: 'list', items: [
            '**Three mistakes**: entering a digit that differs from the solution is a mistake; three mistakes end the game. A wrong digit stays in its cell until you erase it.',
            '**Correct cells lock**: a correct digit cannot be changed or erased, and it is cleared automatically from the notes in its row, column and box.',
            '**One hint**: once per game, a hint fills in the empty cell with the fewest candidates right now.',
            '**Notes**: switch on notes mode with the button or the space bar to pencil small candidate digits into a cell.',
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner techniques — find the place that is left',
        lead: 'The blue cell is the one being solved; the light blue lines and boxes are the reason.',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'Technique 1', title: 'Cross-hatching (a place in a box)', body: 'Where does 5 go in the top-left box? Rows 2 and 3 already have a 5 in other boxes, so this box’s rows 2 and 3 are out. Columns 1 and 2 have a 5 further down too. Only row 1, column 3 is left, so it is the 5. Fixing one digit and sweeping box by box is the first technique to learn.', figure: fig(CROSS, 'Cross-hatching to place a 5') },
            { tag: 'Technique 2', title: 'The single-candidate cell', body: 'Look at the centre cell (row 5, column 5). Its row holds 1, 2 and 3, its column 4, 5 and 6, and its box 7 and 8. With 1–8 ruled out, only 9 can go there. This technique fixes one cell and checks its row, column and box at once.', figure: fig(NAKED, 'A cell with a single candidate') },
          ] },
          { type: 'list', items: [
            '**Start with nearly full units**: a row, column or box with one empty cell gives its missing digit straight away. Filling these first gives you more clues everywhere else.',
            '**Sweep one digit at a time**: take 1 and sweep all nine boxes, then 2, then 3… Digits already common on the grid have few places left and are the easiest.',
            '**Do not enter what you are unsure of**: wrong digits count as mistakes, and three end the game. With two or more candidates, write notes instead.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — the first eight cells of a real puzzle',
        lead: 'An easy puzzle generated by PUZZLTHINK (38 starting digits). Cross-hatching alone solves eight cells in a row.',
        blocks: [
          { type: 'figure', node: fig(WALK_START, 'The walkthrough puzzle at the start'), caption: 'The start. The top-left box has five empty cells.' },
          { type: 'steps', items: [
            { title: '1. Row 1, column 1 = 1', body: 'The top-left box has no 1. Row 2 has a 1 in column 7 and row 3 in column 6, so this box’s rows 2 and 3 cannot hold it. The only empty cell left is row 1, column 1.', figure: fig(WALK_STEP1, 'Step 1: a 1 in row 1, column 1') },
            { title: '2. Row 2, column 1 = 9', body: 'Now the 9 in the same box. Row 3 has a 9 in column 5, and column 2 has a 9 in row 5. Of the empty cells — row 2 columns 1 and 2, row 3 columns 1 and 3 — only row 2, column 1 can take it.' },
            { title: '3. Row 2, column 2 = 4', body: 'Row 3 has a 4 in column 9, so this box’s row 3 is out; row 2, column 2 is the 4. Row 3, columns 1 and 3 remain, both able to be 2 or 7 — not decidable yet. Move to another box.' },
            { title: '4. Row 2, column 6 = 3', body: 'On to the top-middle box: empty cells row 1 column 6, row 2 column 4, row 2 column 6, row 3 column 4. Column 4 has a 3 in row 4, ruling out column 4; row 1 has a 3 in column 3. Row 2, column 6 is the 3.', figure: fig(WALK_STEP4, 'Step 4: a 3 in row 2, column 6') },
            { title: '5–6. Row 3, column 4 = 5; row 2, column 4 = 2', body: 'Row 2 has a 5 in column 3 and column 6 has a 5 in row 8, so the 5 is in row 3, column 4. Then the 2 cannot go in row 1 (which has a 2 in column 9), so it is row 2, column 4.' },
            { title: '7. Row 1, column 6 = 7', body: 'The top-middle box has one empty cell left, and the only digit it is missing is 7.' },
            { title: '8. Row 1, column 7 = 5', body: 'Row 1 now reads 1, 8, 3, 4, 6, 7, □, 9, 2 — one gap, and the missing digit is 5.', figure: fig(WALK_END, 'Step 8: a 5 in row 1, column 7') },
          ] },
          { type: 'callout', tone: 'tip', title: 'Follow the flow', text: 'Each digit you place becomes a reason somewhere else. When stuck, do not stare at one box — switch boxes or digits. The 2 and 7 left open in step 3 resolve as soon as a 2 or 7 lands in column 1 or 3.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate techniques — cutting candidates with notes',
        lead: 'From Medium on you will need notes. Once candidates are written down, these two shapes start to stand out.',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'Technique 3', title: 'Naked pair', body: 'Two cells of row 1 (columns 2 and 5) have exactly the candidates 2 and 7. Those two digits must go in those two cells, one each, so 2 and 7 can be removed from the rest of the row: column 4 drops to 3 6, column 6 to 3 8 and column 8 to 6 8. Likewise three cells sharing three candidates lock those three digits.', figure: fig(PAIR, 'Naked pair') },
            { tag: 'Technique 4', title: 'Pointing pair (box–line reduction)', body: 'In the top-left box rows 2 and 3 are full, so this box’s 4 is in one of row 1’s three cells. So no other box can put a 4 in row 1. In the top-right box, columns 7 and 8 are blocked by the 4s lower down, row 2, column 9 already holds a 9, and row 1, column 9 has just been ruled out — leaving row 3, column 9 as the 4. When a digit’s places inside a box all sit on one line, the rest of that line loses it.', figure: fig(POINT, 'Pointing pair') },
          ] },
          { type: 'list', items: [
            '**You need not note everything at once**: start with cells that have two or three candidates. Placing a correct digit clears it from the notes in its row, column and box automatically.',
            '**Hidden singles**: a cell can have many candidates, yet if it is the only cell in its row (or column, or box) that can take some digit, that digit is the answer. It is cross-hatching applied to rows and columns.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced technique — the X-wing',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'Technique 5', title: 'X-wing', body: 'The notes show that in row 2 a 7 can only go in columns 3 and 7, and in row 6 also only in columns 3 and 7. If row 2’s 7 is in column 3, row 6’s is in column 7, and vice versa. Either way, rows 2 and 6 take the 7s of columns 3 and 7 — so every other cell of columns 3 and 7 can drop 7 (the slashed cells).', figure: fig(XWING, 'X-wing') },
          ] },
          { type: 'p', text: 'Hard puzzles start with about 24 digits, so cross-hatching soon runs dry. Have an order ready: (1) fill notes in every cell; (2) look for single-candidate cells and hidden singles; (3) cut candidates with naked pairs and pointing; (4) if still stuck, pick a digit and look for an X-wing. Most puzzles open up again by step 3.' },
          { type: 'callout', tone: 'note', title: 'Why guessing costs you', text: 'The game checks each digit the moment you enter it, and a wrong one is a mistake. Guess between two candidates and you are wrong half the time; three mistakes end the game. On Hard especially, only enter a digit you can justify.' },
        ],
      },
      {
        id: 'levels',
        title: 'The difficulty levels',
        blocks: [
          { type: 'table', head: ['Level', 'Starting digits', 'Main techniques'], rows: [
            ['Easy', 'about 38', 'Cross-hatching and nearly full units. Solvable without notes.'],
            ['Medium', 'about 30', 'Single-candidate cells and hidden singles, with a few notes.'],
            ['Hard', 'about 24', 'Notes are a must: naked pairs, pointing pairs, sometimes an X-wing.'],
          ] },
          { type: 'p', text: 'The digit count is a target. A digit whose removal would allow a second solution stays in, so a puzzle sometimes arrives with a few more digits than the target.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Forgetting the box**: checking only the row and column and repeating a digit inside a box is the most common slip.',
            '**Stale notes**: correct digits clear themselves from notes, but candidates removed by a naked pair have to be erased by hand.',
            '**Staring at one box**: when stuck, switch boxes or digits. A digit placed elsewhere is often what unlocks it.',
            '**Spending the hint early**: there is only one. Save it for the middle of a Hard puzzle when you are truly stuck.',
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Row, column, box', def: 'A horizontal line, a vertical line and a bold-lined 3×3 block; each holds 1–9 once.' },
            { term: 'Candidate', def: 'A digit that could still go in a cell; written as a note.' },
            { term: 'Naked single', def: 'A cell with only one candidate.' },
            { term: 'Hidden single', def: 'A digit that has only one possible cell within a row, column or box.' },
            { term: 'Naked pair', def: 'Two cells of a line or box with the same two candidates and no others; those digits leave the other cells.' },
            { term: 'Pointing', def: 'A digit confined to one line within a box, so it leaves the rest of that line outside the box.' },
            { term: 'X-wing', def: 'A digit whose candidates in two rows sit in the same two columns (or vice versa), so it leaves the rest of those columns.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Is Sudoku free?', a: 'Yes. Play free in any desktop or mobile browser with no sign-up.' },
      { q: 'I am new to Sudoku — where do I start?', a: 'Fill rows, columns and boxes with a single gap first, then pick one digit and sweep the nine boxes for places where only one cell can take it. Easy puzzles are solved to the end with these two.' },
      { q: 'What does a hint do?', a: 'Once per game, it fills in the correct digit in the empty cell with the fewest candidates at that moment. Use it to get moving again when stuck.' },
      { q: 'How many mistakes are allowed?', a: 'Each digit that differs from the solution is a mistake, and the third ends the game. Write uncertain cells as notes instead.' },
      { q: 'Does every puzzle have only one solution?', a: 'Yes. Each removal is checked to keep the solution unique, so every puzzle has exactly one answer.' },
    ],
    cta: { title: 'Ready for the first cell?', body: 'Learn cross-hatching on Easy, then bring out the note techniques on Medium and Hard.', button: 'Play Sudoku' },
  },
};
export default guide;
