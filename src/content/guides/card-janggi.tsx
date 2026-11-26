// 카드 장기 guide. Rules and numbers follow src/lib/cardJanggi.ts (startBoard, STEPS/RAYS: giraffe jumps, elephant
// slides one or two squares and stops at the first piece, layoutSize: 후 lays out 4 in its first cycle, afterCard/settle: a card with no
// legal move is used up, CJ_MAX_PLY 60 → more pieces wins, else draw, CJ_MAX_ROUNDS 1), src/lib/cardJanggiRoom.ts
// (90 s layout and move clocks, the opponent makes a late player's move within 20 s, a random layout on a layout
// timeout, 3 timeouts in a row lose, 30 s to pick 선/후, the human picks against the AI and a coin toss picks the
// chooser in rooms), src/lib/cardJanggiAi.ts (the only AI level: searches every order the hidden cards could be in;
// CardJanggiGame.tsx gives it 1.8 s a move and 2.6 s a layout), cardJanggiTips.ts and the CardJanggiGuide messages.
// Squares are named as in the game (CjParts squareName): files a–e left to right, ranks 1–6 from your side.
// You (red) start 왕 c1, small b1 c2 d1; the opponent (blue) 왕 c6, small b6 c5 d6.
import type { GameGuide } from './types';

type Pc = [seat: 0 | 1, king: boolean, square: string];
type BoardSpec = { pieces: Pc[]; reach?: string[]; danger?: string[]; goal?: boolean };
const FILES = 'abcde';
const COLOR = ['#ff4f5e', '#3d8bff'];

function CjBoard({ spec, label }: { spec: BoardSpec; label: string }) {
  const at = new Map(spec.pieces.map((p) => [p[2], p]));
  return (
    <div role="img" aria-label={label} className="mx-auto w-full max-w-[210px]">
      <div className="grid grid-cols-5 gap-[3px] rounded-xl border border-white/15 bg-[#120a1f] p-2">
        {[6, 5, 4, 3, 2, 1].flatMap((rank) => [...FILES].map((file) => {
          const sq = `${file}${rank}`;
          const p = at.get(sq);
          const home = spec.goal && (sq === 'c1' || sq === 'c6');
          const cls = spec.danger?.includes(sq) ? 'border-[#ff4f5e] bg-[#ff4f5e]/15' : spec.reach?.includes(sq) ? 'border-[#b07cff] bg-[#b07cff]/20' : home ? 'border-dashed border-white/40' : 'border-white/10 bg-white/[0.03]';
          return (
            <div key={sq} className={`relative flex aspect-square items-center justify-center rounded-[4px] border ${cls}`}>
              <span className="absolute left-0.5 top-0 font-mono text-[7px] text-white/30">{sq}</span>
              {p && <span className="flex items-center justify-center rounded-full font-black text-white shadow" style={{ background: COLOR[p[0]], width: p[1] ? '78%' : '52%', height: p[1] ? '78%' : '52%', fontSize: p[1] ? 11 : 0 }}>{p[1] ? '王' : ''}</span>}
            </div>
          );
        }))}
      </div>
    </div>
  );
}
const fig = (spec: BoardSpec, label: string) => <CjBoard spec={spec} label={label} />;

// A card's move pattern on a 5×5 window, the piece in the middle (elephant: one or two steps, as drawn).
const PATTERNS: [number, number][][] = [
  [[1, 0], [-1, 0], [0, 1], [0, -1]],
  [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]],
  [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
  [[1, 1], [1, -1], [-1, 1], [-1, -1], [2, 2], [2, -2], [-2, 2], [-2, -2]],
  [[2, 0], [-2, 0], [0, 2], [0, -2]],
];
function CardPattern({ card, label }: { card: number; label: string }) {
  const lit = new Set(PATTERNS[card].map(([dx, dy]) => (dy + 2) * 5 + dx + 2));
  return (
    <div role="img" aria-label={label} className="mx-auto grid w-20 grid-cols-5 gap-px rounded-md bg-white/20 p-px">
      {Array.from({ length: 25 }, (_, i) => <span key={i} className={`aspect-square ${i === 12 ? 'bg-[#ff4f5e]' : lit.has(i) ? 'bg-[#b07cff]' : 'bg-[#1b1229]'}`} />)}
    </div>
  );
}
const card = (n: number, label: string) => <CardPattern card={n} label={label} />;

const START: BoardSpec = { pieces: [[0, true, 'c1'], [0, false, 'b1'], [0, false, 'c2'], [0, false, 'd1'], [1, true, 'c6'], [1, false, 'b6'], [1, false, 'c5'], [1, false, 'd6']], goal: true };
// Walkthrough. Your face-up card: giraffe. Theirs: horse.
const W_POS: Pc[] = [[0, true, 'c2'], [0, false, 'b3'], [0, false, 'd2'], [0, false, 'a1'], [1, true, 'c5'], [1, false, 'e4'], [1, false, 'b5'], [1, false, 'd6']];
// Their horse: c5 → b3/d3/a4/a6/e6, e4 → d2/c3, b5 → a3/c3/d4, d6 → c4. Red squares are your pieces it hits.
const W1: BoardSpec = { pieces: W_POS, danger: ['b3', 'd2'], reach: ['c3', 'd3', 'a4', 'a3', 'd4', 'a6', 'e6', 'c4'] };
// Your giraffe: b3 → b5 (capture), b1, d3; c2 → c4, a2, e2; d2 → d4, b2; a1 → a3, c1.
const W2: BoardSpec = { pieces: W_POS, reach: ['b5', 'b1', 'd3', 'c4', 'a2', 'e2', 'd4', 'b2', 'a3', 'c1'] };
// After b3×b5 your next card (monkey) is turned up: b5 now hits their 왕 on c5.
const W3: BoardSpec = { pieces: [[0, true, 'c2'], [0, false, 'b5'], [0, false, 'd2'], [0, false, 'a1'], [1, true, 'c5'], [1, false, 'e4'], [1, false, 'd6']], danger: ['c5'] };
// Elephant ray: yours on e4 would hit c6 two steps away, through an empty d5.
const RAY: BoardSpec = { pieces: [[0, true, 'b2'], [0, false, 'e4'], [0, false, 'a1'], [1, true, 'c6'], [1, false, 'b5'], [1, false, 'a3']], reach: ['d5'], danger: ['c6'] };
// The goal: their 왕 has left c6; your 왕 on c4 with the giraffe jumps straight in.
const GOAL: BoardSpec = { pieces: [[0, true, 'c4'], [0, false, 'b2'], [0, false, 'd3'], [1, true, 'e5'], [1, false, 'c5'], [1, false, 'a4']], reach: ['c6'], goal: true };

const guide: GameGuide = {
  game: 'cardJanggi',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['janggi', 'laserJanggi', 'russianJanggi', 'wallgo2'],
  ko: {
    meta: {
      title: '카드 장기 공략 — 데블스 플랜 3 결승전 규칙·카드 순서 짜기·필승 수읽기 | PUZZLTHINK',
      description: '데블스 플랜: 데드 어게인 결승전 1회차 카드 장기 공략. 쥐·말·원숭이·코끼리·기린 카드 행마, 후공 4장 규칙, 마지막 카드 타이밍, 시작 칸 입성 승리, 한 수 읽기 예시와 카드 순서 짜는 요령, AI 특징까지 정리했어요.',
      keywords: ['카드 장기 공략', '카드장기 규칙', '데블스 플랜 3 결승전', '데블스플랜3 카드 장기', '카드 장기 필승법', '카드 장기 전략', '데드 어게인 결승 카드 장기'],
    },
    title: '카드 장기 공략',
    lead: '말은 내가 고르지만, 어떻게 움직일지는 몇 수 전의 내가 정해 뒀어요.',
    intro: [
      '카드 장기는 6×5 판에서 큰 말(王) 하나와 작은 말 셋으로 겨루는 2인 게임이에요. 말은 장기처럼 움직이지만, **어떤 행마로 움직일지는 미리 몰래 정해 둔 카드 다섯 장의 순서가 결정해요.** 상대가 다음에 쓸 카드 한 장은 보이고 그 뒤는 숨겨져 있어서, 지금 판의 수읽기와 카드 순서를 짜는 머리싸움이 동시에 벌어져요.',
      '이 공략은 카드 다섯 장의 정확한 행마와 순서 규칙부터 정리하고, 실제 국면 하나로 "한 수 읽기"를 따라가 본 뒤, 카드 순서 짜기와 단계별 전략, 자주 하는 실수, AI와 방 규칙을 다뤄요. 칸 이름은 게임과 같이 가로 a~e(왼쪽부터), 세로 1~6(내 쪽부터)이에요. 그림의 빨강이 나, 파랑이 상대예요.',
    ],
    gamePageTitle: '카드 장기 규칙과 공략 — 데블스 플랜 3 결승전 1회차 매치',
    summary: '다섯 카드의 행마, 후공 4장, 한 수 읽기 예시, 카드 순서 짜기와 AI의 특징.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '카드 장기는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '카드 장기는 넷플릭스 「데블스 플랜: 데드 어게인」(데블스 플랜 3) 결승전의 1회차 매치로 나온 게임이에요. 판과 말은 단순하지만, 행마가 카드 순서로 묶여 있어서 "가장 좋은 수"가 아니라 "지금 들고 있는 카드로 둘 수 있는 가장 좋은 수"를 찾아야 해요.' },
          { type: 'p', text: 'PUZZLTHINK는 방송 화면과 같은 판과 시작 배치, 다섯 장의 카드를 그대로 옮겼어요. 빠른 대국을 위해 **한 라운드 단판 승부**로 진행하고, 방송에서 정해지지 않았던 몇몇 경우(움직일 수 없는 카드, 끝나지 않는 라운드)는 따로 규칙을 정했어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판과 말**: 가로 5칸, 세로 6칸이에요. 나는 王 c1, 작은 말 b1·c2·d1, 상대는 王 c6, 작은 말 b6·c5·d6에서 시작해요.',
            '**선·후 정하기**: AI 대국은 내가 선공·후공을 골라요. 친구 방은 동전 던지기로 고를 사람을 정해요(30초 안에 고르지 않으면 자동으로 정해져요).',
            '**카드 배치**: 둘이 동시에 카드 순서를 몰래 정해 엎어 놓아요. 선공은 다섯 장 모두, **후공은 첫 묶음에서만 다섯 장 중 네 장**을 골라요. 첫 카드는 둘이 동시에 뒤집어요.',
            '**이동**: 선공부터 번갈아, 앞면 카드의 행마대로 **내 말 아무거나 하나**를 움직이고 다음 카드를 뒤집어요. 상대 말 칸으로 가면 잡고, 내 말 칸으로는 갈 수 없어요.',
            '**다시 배치**: 마지막 카드를 쓴 사람은 그 즉시 다섯 장의 순서를 새로 정하고 첫 카드만 뒤집어요. 그다음 상대가 움직여요.',
            '**승리**: 상대 王을 잡거나, **내 王이 상대 王의 시작 칸(나는 c6)에 들어가면** 이겨요. 한 라운드를 이기면 최종 승리예요.',
            '**시간**: 배치와 한 수에 각각 90초예요. 시간 안에 두지 않으면 그 카드의 행마로 **상대가 내 말을 대신 움직여요**. 세 번 연속 시간을 넘기면 패배예요.',
          ] },
          { type: 'figure', node: fig(START, '카드 장기 시작 배치'), caption: '시작 배치. 점선 칸(c1·c6)이 두 王의 시작 칸이에요. 내 王이 c6에, 상대 王이 c1에 들어가면 그쪽이 이겨요.' },
          { type: 'h3', text: '다섯 장의 행마 카드' },
          { type: 'cards', items: [
            { tag: '쥐', title: '🐭 상하좌우 1칸', body: '가장 짧은 행마. 王 바로 옆에 붙은 말을 잡거나, 한 칸만 비켜 서는 데 써요.', figure: card(0, '쥐 카드 행마') },
            { tag: '말', title: '🐴 L자로 점프', body: '체스의 나이트처럼 한 방향 2칸 + 옆으로 1칸, 사이의 말은 뛰어넘어요. 막을 수가 없어서 기습에 강해요.', figure: card(1, '말 카드 행마') },
            { tag: '원숭이', title: '🐵 주변 8칸', body: '王처럼 주변 여덟 칸 중 하나로. 어떤 판에서도 쓸모가 있는 가장 안전한 카드예요.', figure: card(2, '원숭이 카드 행마') },
            { tag: '코끼리', title: '🐘 대각선 1–2칸', body: '대각선 한 방향으로 1칸이나 2칸 가요. 1칸째에 말이 있으면 거기서 멈추고, 그 말이 상대 말이면 잡을 수 있어요(뛰어넘지는 못해요).', figure: card(3, '코끼리 카드 행마') },
            { tag: '기린', title: '🦒 상하좌우 정확히 2칸', body: '사이에 말이 있어도 뛰어넘어 정확히 두 칸 떨어진 칸에 가요. 1칸은 못 가요.', figure: card(4, '기린 카드 행마') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 경우 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '앞면 카드로 움직일 말이 없으면?', body: '그 카드는 움직임 없이 쓴 것으로 치고 넘어가요. 모든 말이 갇혔을 때만 생기는 드문 경우로, 방송에 없던 상황이라 PUZZLTHINK가 정한 처리예요.' },
            { title: '같은 카드를 두 번 쓸 수 있나요?', body: '한 묶음 안에서는 안 돼요. 다섯 장을 한 번씩 순서대로 써요. 그래서 상대가 이번 묶음에서 쓴 카드를 지워 가면 남은 카드가 좁혀져요.' },
            { title: '후공은 왜 네 장인가요?', body: '첫 묶음만 네 장이라 후공이 먼저 묶음을 끝내고 다시 배치해요. 그 덕에 이후로는 두 사람 모두 "상대의 새 첫 카드를 본 뒤 내 마지막 카드를 쓰는" 흐름이 이어져요.' },
            { title: '王이 상대 시작 칸에 들어갔는데 상대 말이 있었다면?', body: '그 말을 잡으면서 들어가는 것도 입성 승리예요. 상대 王이 아직 그 칸에 있다면 王을 잡은 것이니 역시 승리예요.' },
            { title: '시간을 넘기면 누가 내 말을 움직이나요?', body: 'AI 대국에서는 AI가, 친구 방에서는 상대가 20초 안에 내 앞면 카드로 내 말 하나를 골라 움직여요. 당연히 나에게 가장 나쁜 수를 골라요. 상대도 고르지 않으면 무작위 수가 두어져요. 배치 시간을 넘기면 카드 순서가 무작위로 정해져요.' },
            { title: '60수가 넘도록 끝나지 않으면?', body: '양쪽 합쳐 60수가 지나면 남은 말이 많은 쪽이 이겨요. 말 수가 같으면 무승부예요. 단판이라 무승부 라운드는 곧 무승부 경기예요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 상대 앞면 카드부터 보기',
        blocks: [
          { type: 'p', text: '카드 장기에서 가장 확실한 정보는 **상대의 앞면 카드 한 장**이에요. 상대의 다음 수는 반드시 그 카드의 행마예요. 매 수 아래 순서로 확인하면 큰 실수는 대부분 막을 수 있어요.' },
          { type: 'list', ordered: true, items: [
            '**내 카드로 지금 이길 수 있나?** 내 앞면 카드로 상대 王을 잡거나 내 王이 c6에 들어갈 수 있으면 그게 먼저예요.',
            '**상대 앞면 카드가 내 王에 닿나?** 상대 말 넷 각각에서 그 카드의 행마를 그려 보고, 내 王 칸이나 c1(내 王의 시작 칸, 상대 王이 들어오면 내가 져요)에 닿는지 확인해요.',
            '**내가 움직인 뒤에도 안전한가?** 말을 옮기면 길이 열려요. 특히 코끼리는 대각선 한 칸이 비는 순간 두 칸 떨어진 곳까지 닿아요.',
          ] },
          { type: 'list', items: [
            '**원숭이는 뒤쪽에**: 원숭이는 어디서나 쓸모가 있어서, 묶음 뒤쪽에 두면 앞의 카드가 꼬였을 때 수습해 줘요.',
            '**작은 말로 c1 지키기**: 상대 王이 c1에 들어오면 져요. 작은 말 하나를 c1 근처에 두면 그 칸을 막거나 들어오는 王을 잡을 수 있어요.',
            '**잡을 수 있다고 다 잡지 않기**: 잡은 말이 상대 앞면 카드의 사정권이면 바로 되잡혀요. 잡기 전에 그 칸이 안전한지 보세요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 읽기 — 기린 한 장으로 위협 두 개 풀기',
        lead: '내 앞면 카드는 기린, 상대 앞면 카드는 말(나이트)이에요. 내 차례에 무엇을 확인하고 어떻게 고르는지 순서대로 봐요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. 상대 말 카드가 닿는 칸', body: '상대의 다음 수는 말(L자 점프)이에요. 상대 王 c5에서 b3·d3·a4·a6·e6, e4에서 d2·c3, b5에서 a3·c3·d4, d6에서 c4에 닿아요. **내 작은 말 b3과 d2가 둘 다 노려지고 있어요**(빨간 칸). 내 王 c2에 닿는 수는 없어요.', figure: fig(W1, '상대 말 카드가 닿는 칸') },
            { title: '2. 내 기린 카드로 갈 수 있는 칸', body: '기린은 정확히 두 칸이에요. b3에서 b5(상대 작은 말을 잡음)·b1·d3, 王 c2에서 c4·a2·e2, d2에서 d4·b2, a1에서 a3·c1. 위협받는 두 말 중 하나만 피할 수 있으니, **피하면서 이득을 보는 수**를 찾아요. b3→b5는 위협받던 말을 빼면서 상대 말 하나를 잡아요. b5는 상대 말 카드가 닿지 않는 칸이에요(c5에서도 e4에서도 안 닿아요).', figure: fig(W2, '기린 카드로 갈 수 있는 칸') },
            { title: '3. 다음 카드가 위협이 되게', body: 'b3×b5 뒤 내 다음 카드가 원숭이라면, 뒤집는 순간 b5가 바로 옆 c5의 상대 王을 노려요. 이제 상대가 말 카드로 d2를 잡으면 원숭이로 王을 잡아 내가 이겨요. 상대는 d6→b5(말 카드)로 되잡거나 王을 e6으로 피해야 해요. 어느 쪽이든 d2는 살아남아요.', figure: fig(W3, 'b5가 상대 王을 노리는 모습') },
          ] },
          { type: 'callout', tone: 'tip', title: '이 장면의 교훈', text: '카드 장기에서는 "이번 카드로 무엇을 할까"와 함께 "**다음 카드가 뒤집혔을 때 판이 어떻게 보일까**"를 봐야 해요. 내 다음 카드는 상대 차례 전에 공개되니, 그 카드로 생기는 위협이 상대의 선택지를 줄여 줘요.' },
        ],
      },
      {
        id: 'layout',
        level: 'intermediate',
        title: '중급 전략 — 카드 순서 짜기',
        blocks: [
          { type: 'p', text: '배치는 "앞으로 다섯 수의 행마를 미리 고르는 일"이에요. 첫 카드는 지금 판, 두 번째 카드는 첫 수가 만든 판, 세 번째부터는 상대가 무엇을 할지 모르는 판에서 써야 해요. 그래서 뒤로 갈수록 범용 카드를 두는 게 기본이에요.' },
          { type: 'table', caption: '카드별 성격과 놓기 좋은 자리', head: ['카드', '성격', '놓기 좋은 자리'], rows: [
            ['🐵 원숭이', '어디서나 쓸 수 있는 만능 카드', '뒤쪽 — 꼬인 판을 수습'],
            ['🐭 쥐', '짧지만 王 옆을 정리', '王 가까이 싸움이 벌어질 때'],
            ['🐴 말', '막을 수 없는 점프 기습', '노릴 칸이 보일 때 앞쪽'],
            ['🐘 코끼리', '대각선 2칸까지 닿는 기습', '대각선 사이 칸이 비어 있을 때'],
            ['🦒 기린', '정확히 2칸, 뛰어넘기', '목표 칸까지 2칸이 보일 때'],
          ] },
          { type: 'list', items: [
            '**후공의 빼는 한 장**: 후공은 첫 묶음에서 한 장을 빼요. 지금 판에서 가장 쓸모없어 보이는 카드를 빼면 되고, 한 묶음 일찍 재배치해 상대의 마지막 카드를 압박할 수 있어요.',
            '**마지막 카드는 결정타 자리**: 재배치 흐름 때문에 묶음의 마지막 카드는 상대의 새 첫 카드를 본 뒤에 써요. 상대가 막을 수단이 없는 걸 확인하고 칠 수 있으니, 王을 노리는 카드를 끝에 두는 계획이 통해요.',
            '**상대 남은 카드 세기**: 같은 묶음에서 쓴 카드는 다시 나오지 않아요. 상대가 이번 묶음에서 말과 코끼리를 이미 썼다면, 그 묶음이 끝날 때까지 그 두 행마는 걱정하지 않아도 돼요. 마지막 한두 장은 거의 확정돼요.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: '코끼리 경계', title: '열린 대각선은 두 칸 너머까지 닿아요', body: '내 작은 말 e4에서 d5를 지나 c6까지 대각선이 비어 있어요. 앞면 카드가 코끼리라면 e4→c6으로 상대 王을 바로 잡아요. 반대로 내 王이 상대 말과 빈 대각선으로 이어져 있으면, 상대 앞면 카드가 코끼리인 순간 위험해요. 대각선 중간에 말 하나만 있어도 코끼리는 멈춰요.', figure: fig(RAY, '코끼리가 닿는 열린 대각선') },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 입성 승리와 숨은 카드 계산',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '입성', title: '비어 있는 시작 칸은 가장 빠른 승리 길', body: '상대 王이 c6을 떠나 e5로 갔어요. 내 王 c4에서 기린이면 c5의 말을 뛰어넘어 c6에 바로 들어가 이겨요. 상대 王을 잡지 않아도 되니, 王끼리의 싸움보다 시작 칸까지의 거리를 세는 쪽이 빠를 때가 많아요. 반대로 내 王이 c1을 떠났다면, 상대 王과 c1 사이의 거리를 카드별로 세어 두세요.', figure: fig(GOAL, '시작 칸 입성') },
          ] },
          { type: 'list', items: [
            '**숨은 카드는 경우의 수로**: 상대 앞면 다음의 카드는 보이지 않지만 후보는 이번 묶음에서 아직 안 쓴 카드뿐이에요. 남은 후보 각각으로 상대가 내 王이나 c1에 닿는지 확인하면, "두 수 뒤의 위험"도 셀 수 있어요.',
            '**말 수 앞서면 60수 판정을 의식**: 60수가 지나면 말이 많은 쪽이 이겨요. 작은 말 하나를 앞선 상태라면 무리한 공격보다 王과 c1을 지키며 수를 흘려보내는 것도 이기는 길이에요.',
            '**대신 두기 피하기**: 시간을 넘기면 상대가 내 카드로 내 말을 가장 나쁘게 움직여요. 어려운 국면일수록 90초 안에 차선이라도 직접 두는 게 훨씬 나아요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**코끼리 대각선을 잊기**: 대각선으로 두 칸 떨어진 상대 말도 사이 칸이 비어 있으면 한 번에 닿아요. 말을 옮겨 대각선을 열어 주는 수를 특히 조심하세요.',
            '**기린을 1칸으로 착각하기**: 기린은 정확히 2칸이에요. 바로 옆 칸은 못 가는 대신 사이의 말을 뛰어넘어요.',
            '**강한 카드를 다 앞에 두기**: 말·코끼리를 앞에 몰면 뒤쪽에서 쓸 카드가 쥐·기린만 남아 판이 바뀌었을 때 대응이 어려워요.',
            '**c1을 비워 두기**: 王끼리 싸우는 데 집중하다 상대 王이 c1에 들어오는 길을 놓쳐요.',
            '**다음 카드의 공개를 잊기**: 내가 움직이면 내 다음 카드가 상대에게 보여요. 그 카드로 생기는 내 약점도 상대에게 그대로 보인다는 뜻이에요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구 방, 오픈 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국', 'AI는 한 가지 난이도(어려움)예요. 내가 선공·후공을 고르고, 시계는 방과 같이 배치·한 수 각 90초예요.'],
            ['AI의 정보', 'AI는 내 숨은 카드를 보지 않아요. 사람처럼 내가 쓴 카드와 앞면 카드만 보고, 숨은 카드가 놓일 수 있는 모든 순서(최대 24가지)를 각각 읽어 평균적으로 가장 좋은 수를 둬요. 한 수에 1.8초, 배치에 2.6초쯤 생각해요.'],
            ['친구 방', '링크나 4자리 코드로 1:1 방을 만들어요. 동전 던지기로 선·후를 고를 사람이 정해지고, 내 숨은 카드는 상대에게 전송되지 않아요.'],
            ['오픈 방', '모르는 사람과 1:1로 겨뤄요. 결과는 기록실 랭킹에 남아요.'],
            ['필승 꿀팁', '진 판이 끝나면 AI가 내 수를 다시 읽어, 승률이 크게 떨어진 수와 대신 둘 수 있었던 수를 짚어 줘요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '앞면 카드', def: '지금 뒤집혀 있는, 다음 수에 쓸 카드. 양쪽 모두에게 보여요.' },
            { term: '묶음', def: '한 번에 정한 카드 순서(보통 다섯 장, 후공의 첫 묶음만 네 장).' },
            { term: '재배치', def: '마지막 카드를 쓴 직후 다섯 장의 순서를 새로 정하는 것.' },
            { term: '입성', def: '내 王이 상대 王의 시작 칸에 들어가는 것. 즉시 승리예요.' },
            { term: '사정권', def: '상대 앞면 카드로 상대 말이 닿을 수 있는 칸들.' },
            { term: '대신 두기', def: '시간을 넘긴 사람의 수를 상대가 그 사람의 카드로 대신 두는 것.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '데블스 플랜 3 결승전 카드 장기 규칙은?', a: '6×5 판에서 王 하나와 작은 말 셋으로 겨루고, 쥐·말·원숭이·코끼리·기린 카드 다섯 장의 순서를 몰래 정해 그 순서대로만 움직여요. 상대 王을 잡거나 내 王이 상대 王의 시작 칸에 들어가면 이겨요. PUZZLTHINK는 단판 승부예요.' },
      { q: '선공과 후공은 무엇이 다른가요?', a: '선공은 다섯 장을 모두 쓰고, 후공은 첫 묶음에서만 네 장을 골라 써요. 이후로는 둘 다 다섯 장씩, 마지막 카드를 쓴 사람이 바로 재배치해요.' },
      { q: '제한 시간을 넘기면 어떻게 되나요?', a: '한 수 90초를 넘기면 내 앞면 카드의 행마로 상대(AI 대국에서는 AI)가 내 말을 대신 움직여요. 세 번 연속 시간을 넘기면 패배예요.' },
      { q: 'AI는 내 카드 순서를 보나요?', a: '아니요. 쓴 카드와 앞면 카드만 보고, 숨은 카드가 놓일 수 있는 모든 순서를 따져 평균적으로 가장 좋은 수를 둬요.' },
      { q: '무승부도 있나요?', a: '60수가 지나면 남은 말이 많은 쪽이 이기고, 같으면 무승부예요.' },
      { q: '코끼리는 몇 칸 가나요?', a: '대각선 한 방향으로 1칸이나 2칸 가요(방송 규칙서대로). 1칸째에 상대 말이 있으면 그 말을 잡고 멈추고, 내 말이면 지나가지 못해요.' },
    ],
    cta: { title: '카드를 짜 볼까요?', body: '첫 묶음은 원숭이를 뒤쪽에 두는 것부터 시작해 보세요. 상대 앞면 카드를 확인하는 습관이 승률을 바꿔요.', button: '카드 장기 하러 가기' },
    disclaimer: '카드 장기는 방송에 소개된 게임 방식에서 착안해 PUZZLTHINK가 웹용으로 다시 만든 비공식 팬 프로젝트로, 넷플릭스·데블스 플랜 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Card Janggi strategy guide — The Devil’s Plan 3 final, card order and reading | PUZZLTHINK',
      description: 'A guide to Card Janggi from the final of The Devil’s Plan: Dead Again: how the rat, horse, monkey, elephant and giraffe cards move, the second player’s four cards, last-card timing, winning by entering the start square, a worked turn, building card orders and the AI.',
      keywords: ['Card Janggi strategy', 'Card Janggi rules', 'Devil’s Plan 3 final', 'Devil’s Plan Dead Again card janggi', 'how to win Card Janggi'],
    },
    title: 'Card Janggi strategy guide',
    lead: 'You choose the piece — but how it moves was decided by you, a few moves ago.',
    intro: [
      'Card Janggi is a two-player game on a 6×5 board, each side with one king (王) and three small pieces. Pieces move like chess or janggi pieces, but **the move you may make is fixed by the order of five cards you laid out in secret.** The opponent’s next card is face up and the rest are hidden, so you fight over the board and over card order at the same time.',
      'This guide covers exactly how the five cards move and how the order works, reads one real position move by move, then turns to building card orders, strategy by level, common mistakes and the AI and room rules. Squares are named as in the game: files a–e from the left, ranks 1–6 from your side. In the boards red is you and blue the opponent.',
    ],
    gamePageTitle: 'Card Janggi rules and strategy — The Devil’s Plan 3 final, match 1',
    summary: 'How the five cards move, the second player’s four cards, a worked turn, card orders and the AI.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Card Janggi?',
        blocks: [
          { type: 'p', text: 'Card Janggi was the first match of the final in Netflix’s The Devil’s Plan: Dead Again (The Devil’s Plan 3). Board and pieces are simple, but because moves are tied to card order, you are never looking for the best move — only for the best move the card in your hand allows.' },
          { type: 'p', text: 'PUZZLTHINK keeps the show’s board, starting setup and five cards. For quick games it plays **a single round**, and it fills in a few cases the show left open (a card that cannot move anything, a round that never ends) with rules of its own.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board and pieces**: 5 files by 6 ranks. You start with 王 c1 and small pieces on b1, c2 and d1; the opponent with 王 c6 and small pieces on b6, c5 and d6.',
            '**Who starts**: against the AI you choose first or second. In friend rooms a coin toss picks who chooses (within 30 seconds, or it is decided for them).',
            '**Laying out**: both players secretly lay out their cards face down at the same time. The first player uses all five; **the second player uses four of the five, in the first cycle only.** The first cards are turned up together.',
            '**Moving**: starting with the first player, move **any one of your pieces** as your face-up card allows, then turn up your next card. Moving onto an enemy piece captures it; you cannot move onto your own.',
            '**Re-laying**: whoever uses their last card immediately lays out all five again and turns up the first one. Then the other player moves.',
            '**Winning**: capture the enemy king, or **move your king onto the enemy king’s starting square (c6 for you)**. Winning the round wins the match.',
            '**Clocks**: 90 seconds per layout and per move. Miss the move clock and **the opponent moves one of your pieces** with your face-up card. Three timeouts in a row lose the match.',
          ] },
          { type: 'figure', node: fig(START, 'Card Janggi starting position'), caption: 'The start. The dashed squares (c1 and c6) are the kings’ starting squares: your king on c6, or theirs on c1, wins.' },
          { type: 'h3', text: 'The five move cards' },
          { type: 'cards', items: [
            { tag: 'RAT', title: '🐭 One square orthogonally', body: 'The shortest move: take a piece right next to your king or step one square aside.', figure: card(0, 'Rat card moves') },
            { tag: 'HORSE', title: '🐴 Knight’s jump', body: 'Like a chess knight: two squares one way and one to the side, jumping over anything in between. It cannot be blocked, which makes it the surprise card.', figure: card(1, 'Horse card moves') },
            { tag: 'MONKEY', title: '🐵 Any neighbouring square', body: 'Like a king: any of the eight surrounding squares. Useful in every position — the safest card.', figure: card(2, 'Monkey card moves') },
            { tag: 'ELEPHANT', title: '🐘 One or two squares diagonally', body: 'One or two squares in one diagonal direction. If a piece is on the first square it stops there, taking it if it is an enemy (it cannot jump).', figure: card(3, 'Elephant card moves') },
            { tag: 'GIRAFFE', title: '🦒 Exactly two orthogonally', body: 'Jumps over whatever is in between and lands exactly two squares away. It can never go just one.', figure: card(4, 'Giraffe card moves') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky cases — what happens if…',
        blocks: [
          { type: 'cards', items: [
            { title: 'What if my face-up card cannot move any piece?', body: 'It counts as used, with no move. It only happens when every piece is boxed in; the show never covered it, so this is PUZZLTHINK’s rule.' },
            { title: 'Can I use the same card twice?', body: 'Not within a cycle: each of the five cards is used once, in order. So crossing off the cards the opponent has used narrows down what is left.' },
            { title: 'Why does the second player get four cards?', body: 'Only the first cycle has four, so the second player finishes first and re-lays first. From then on, both players use their last card after seeing the other’s new first card.' },
            { title: 'My king enters their start square onto an enemy piece?', body: 'Capturing a piece on that square still counts as entering and wins. If their king is still standing there, you have captured the king — also a win.' },
            { title: 'Who moves my piece when I time out?', body: 'Against the AI, the AI; in a room, the opponent, within 20 seconds, using your face-up card — and naturally they pick the worst move for you. If they do not pick either, a random move is played. Miss the layout clock and your order is dealt at random.' },
            { title: 'What if nothing happens for 60 moves?', body: 'After 60 moves (both sides together) the side with more pieces wins; equal numbers is a draw. With a single round, a drawn round is a drawn match.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — look at their face-up card first',
        blocks: [
          { type: 'p', text: 'The surest information in Card Janggi is **the opponent’s face-up card**: their next move will use it, no matter what. Running these checks every move stops most big mistakes.' },
          { type: 'list', ordered: true, items: [
            '**Can my card win now?** If your face-up card takes their king or puts your king on c6, play it.',
            '**Does their card reach my king?** Trace that card’s move from each of their four pieces and check your king’s square — and c1, your king’s start square, where their king would win.',
            '**Am I still safe after moving?** Moving a piece opens lines. The elephant in particular reaches two squares away the moment the square between clears.',
          ] },
          { type: 'list', items: [
            '**Monkey near the back**: the monkey is useful anywhere, so late in a cycle it rescues you when earlier cards went wrong.',
            '**Guard c1 with a small piece**: their king entering c1 loses you the game. A small piece near c1 can block it or take the king on its way in.',
            '**Do not take everything you can**: a piece that captures into their card’s reach is taken straight back. Check the square before you capture.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Read along — one giraffe, two threats',
        lead: 'Your face-up card is the giraffe; theirs is the horse. Follow what to check on your turn and how to choose.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. Where their horse reaches', body: 'Their next move is a knight’s jump. From their king on c5 it reaches b3, d3, a4, a6 and e6; from e4, d2 and c3; from b5, a3, c3 and d4; from d6, c4. **Both your small pieces on b3 and d2 are attacked** (red). Nothing reaches your king on c2.', figure: fig(W1, 'Where their horse card reaches') },
            { title: '2. Where your giraffe goes', body: 'The giraffe moves exactly two squares: b3 to b5 (capturing their small piece), b1 or d3; your king c2 to c4, a2 or e2; d2 to d4 or b2; a1 to a3 or c1. You can rescue only one of the two attacked pieces, so look for **an escape that also gains something**. b3 → b5 removes the attacked piece and takes one of theirs — and b5 is out of the horse’s reach from both c5 and e4.', figure: fig(W2, 'Where your giraffe card goes') },
            { title: '3. Make the next card a threat', body: 'If your next card is the monkey, turning it up after b3×b5 makes b5 hit their king on c5, right next to it. Now if they take d2 with the horse, the monkey takes their king and you win. They must recapture with d6 → b5 (a horse move) or step the king to e6. Either way, d2 survives.', figure: fig(W3, 'b5 now attacks their king') },
          ] },
          { type: 'callout', tone: 'tip', title: 'The lesson', text: 'In Card Janggi, ask not only “what do I do with this card?” but also “**what will the board look like when my next card turns up?**” Your next card is revealed before their move, and the threat it creates narrows their choices.' },
        ],
      },
      {
        id: 'layout',
        level: 'intermediate',
        title: 'Intermediate strategy — building a card order',
        blocks: [
          { type: 'p', text: 'A layout picks your next five moves in advance. The first card plays on today’s board, the second on the board your first move creates, and from the third on you are playing positions you cannot foresee. So the basic rule is: the further back, the more general-purpose the card.' },
          { type: 'table', caption: 'What each card is like and where it belongs', head: ['Card', 'Character', 'Good slot'], rows: [
            ['🐵 Monkey', 'useful anywhere', 'late — cleans up a tangled board'],
            ['🐭 Rat', 'short, tidies up around the king', 'when the fight is close to the kings'],
            ['🐴 Horse', 'an unblockable jump', 'early, when you see a target'],
            ['🐘 Elephant', 'a two-square diagonal strike', 'when the square between is empty'],
            ['🦒 Giraffe', 'exactly two, jumping', 'when a target is exactly two away'],
          ] },
          { type: 'list', items: [
            '**The second player’s dropped card**: in the first cycle the second player leaves one card out. Drop the one that looks least useful on the current board, and use the early re-lay to pressure the first player’s last card.',
            '**The last card is the finishing slot**: because of the re-lay rhythm, you use your last card after seeing their new first card. You can check they have no defence before you strike, so a king-attacking card at the end is a real plan.',
            '**Count their cards**: a card used this cycle will not come back until the next. If they have already used the horse and the elephant, you can forget those two moves until they re-lay. The last one or two cards are nearly certain.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: 'ELEPHANT ALERT', title: 'An open diagonal reaches two squares', body: 'The diagonal from your small piece on e4 through d5 to c6 is empty. With the elephant face up, e4 → c6 takes their king at once. Turn it around: if your king is joined to an enemy piece by an empty diagonal, you are in danger the moment their face-up card is the elephant. A single piece in between stops it.', figure: fig(RAY, 'An open diagonal for the elephant') },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — entering the start square and hidden cards',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'ENTRY', title: 'An empty start square is the fastest win', body: 'Their king has left c6 for e5. From c4 your king, with the giraffe, jumps over c5 straight onto c6 and wins. You do not need to catch their king, so counting the distance to the start square is often faster than chasing kings. And if your own king has left c1, count — card by card — how far their king is from it.', figure: fig(GOAL, 'Entering the start square') },
          ] },
          { type: 'list', items: [
            '**Hidden cards as cases**: the cards behind their face-up one are hidden, but they can only be cards not yet used this cycle. Check each candidate for a route to your king or c1 and you can count dangers two moves deep.',
            '**A piece up? Mind move 60**: after 60 moves the side with more pieces wins. A piece ahead, guarding your king and c1 while the moves run out is a winning plan too.',
            '**Never let them move for you**: a timeout lets the opponent play your card in the worst way for you. In hard positions, play even a second-best move yourself within 90 seconds.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Forgetting the elephant’s diagonal**: an enemy piece two squares away diagonally reaches in one move if the square between is empty. Beware moves that open one.',
            '**Treating the giraffe as a one-step**: it moves exactly two. It cannot step next door, but it jumps over pieces.',
            '**Front-loading the strong cards**: put horse and elephant first and you are left with rat and giraffe when the board has changed.',
            '**Leaving c1 open**: busy with the kings’ fight, you miss their king’s route into c1.',
            '**Forgetting your next card is shown**: once you move, your next card is visible — and so is any weakness it creates.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend rooms and open rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games', 'There is one AI level (Hard). You choose first or second; clocks are the same as in rooms, 90 seconds per layout and per move.'],
            ['What the AI knows', 'It never sees your hidden cards. Like a person, it sees your used cards and face-up card, reads every order your hidden cards could be in (up to 24) and plays the move that is best on average. It thinks about 1.8 seconds a move and 2.6 seconds a layout.'],
            ['Friend rooms', 'Create a 1:1 room with a link or 4-digit code. A coin toss picks who chooses first or second, and your hidden cards are never sent to the other player.'],
            ['Open rooms', 'Play strangers 1:1; results go on the records ranking.'],
            ['Winning tips', 'After a loss the AI re-reads your moves and points out where your winning chances dropped most and what you could have played instead.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Face-up card', def: 'The card turned up for your next move. Both players can see it.' },
            { term: 'Cycle', def: 'One layout of cards (normally five; four in the second player’s first cycle).' },
            { term: 'Re-lay', def: 'Laying out all five cards again right after using your last one.' },
            { term: 'Entry', def: 'Your king moving onto the enemy king’s starting square: an instant win.' },
            { term: 'Reach', def: 'The squares the opponent’s pieces can reach with their face-up card.' },
            { term: 'Proxy move', def: 'The opponent playing a timed-out player’s move with that player’s card.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What are the rules of Card Janggi from The Devil’s Plan 3 final?', a: 'On a 6×5 board each side has a king and three small pieces, and moves only in the order of five secretly laid-out cards: rat, horse, monkey, elephant and giraffe. Capture the enemy king or move your king onto its starting square to win. PUZZLTHINK plays a single round.' },
      { q: 'How do first and second player differ?', a: 'The first player uses all five cards; the second uses four in the first cycle only. After that both use five, and whoever uses their last card re-lays at once.' },
      { q: 'What happens if I run out of time?', a: 'Miss the 90-second move clock and the opponent (the AI, against the AI) moves one of your pieces with your face-up card. Three timeouts in a row lose the match.' },
      { q: 'Does the AI see my card order?', a: 'No. It sees only your used cards and face-up card, considers every order your hidden cards could be in and plays the move that is best on average.' },
      { q: 'Can the game be drawn?', a: 'After 60 moves the side with more pieces wins; equal numbers is a draw.' },
      { q: 'How far does the elephant move?', a: 'One or two squares in one diagonal direction, as in the show’s rulebook. An enemy piece on the first square is taken and the elephant stops there; one of your own blocks it.' },
    ],
    cta: { title: 'Ready to lay out your cards?', body: 'Start your first cycle with the monkey near the back. Checking their face-up card every move changes how often you win.', button: 'Play Card Janggi' },
    disclaimer: 'Card Janggi is an unofficial fan remake by PUZZLTHINK, inspired by the game shown on the programme; it is not affiliated with Netflix, The Devil’s Plan or its producers.',
  },
};

export default guide;
