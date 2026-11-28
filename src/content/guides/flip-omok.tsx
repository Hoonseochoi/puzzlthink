// 뒤집기 오목 guide, 「전략적 뒤집기」 rules (version 2). Rules and numbers follow src/lib/flipOmok.ts (FLIP_CHARGES = 3
// per player; flipsFor: any length, 8 directions, only the mover flips, only when they spend a 뒤집기, runs holding a
// flipped (locked) stone never flip; play/fiveThrough: exactly five through the placed stone, none of this move's flips in
// it; isForbidden: 쌍삼 for both sides unless the move makes five, quiet and flipping moves judged apart; chooseMove:
// 중간 = casualMove, 어려움 = readerMove, both valuing a 뒤집기 at 420 window points), src/lib/flipOmokRoom.ts
// (15/30/60-second turns, default 30, a timeout plays the 중간 AI's move without a 뒤집기, three in a row lose, red drawn
// at random then swapped on rematch, full board → draw), FlipOmokGame.tsx (vs COCO you are red and move first, undo takes back the AI's
// reply too, a one-device mode) and the FlipOmokGuide / FlipOmok messages.
// Every example position was checked with the game's own play / isForbidden.
// Coordinates as in coordinateLabel: columns A–P without I, rows 1–15 from the bottom.
import type { GameGuide } from './types';

const COLS = 'ABCDEFGHJKLMNOP';
const RED = '#ff5d6c', BLUE = '#4f8dff';
type Spec = { red?: string[]; blue?: string[]; flipped?: string[]; last?: string; cross?: string[]; ring?: string[] };

/** A crop (D–L, rows 5–11). Flipped stones carry the other side's colour as an inner dot ("eyes"), as in the game. */
function FlipCrop({ spec, label }: { spec: Spec; label: string }) {
  const cols = COLS.slice(COLS.indexOf('D'), COLS.indexOf('L') + 1).split('');
  const rows = [11, 10, 9, 8, 7, 6, 5];
  const G = 10, P = 9, W = P * 2 + (cols.length - 1) * G, H = P * 2 + (rows.length - 1) * G;
  const xy = (s: string) => ({ x: P + cols.indexOf(s[0]) * G, y: P + (11 - Number(s.slice(1))) * G });
  const stone = (s: string, color: string, eye: string | null) => {
    const { x, y } = xy(s);
    return (
      <g key={s}>
        <circle cx={x} cy={y} r="4.3" fill={color} stroke={spec.ring?.includes(s) ? '#ffd166' : s === spec.last ? '#fff' : '#000'} strokeWidth={spec.ring?.includes(s) || s === spec.last ? 0.9 : 0.3} />
        {eye && <circle cx={x} cy={y} r="1.5" fill={eye} />}
      </g>
    );
  };
  return (
    <svg viewBox={`-6 -2 ${W + 8} ${H + 8}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[300px]">
      <rect x={P - 5} y={P - 5} width={W - 2 * P + 10} height={H - 2 * P + 10} rx="2" fill="#10202a" />
      {cols.map((c, i) => <line key={c} x1={P + i * G} y1={P} x2={P + i * G} y2={H - P} stroke="#2f4a58" strokeWidth="0.4" />)}
      {rows.map((r, i) => <line key={r} x1={P} y1={P + i * G} x2={W - P} y2={P + i * G} stroke="#2f4a58" strokeWidth="0.4" />)}
      {cols.map((c, i) => <text key={`t${c}`} x={P + i * G} y={H + 4} fontSize="4" textAnchor="middle" fill="#9aa1ae" fontFamily="monospace">{c}</text>)}
      {rows.map((r, i) => <text key={`n${r}`} x={-1} y={P + i * G + 1.5} fontSize="4" textAnchor="middle" fill="#9aa1ae" fontFamily="monospace">{r}</text>)}
      {spec.red?.map((s) => stone(s, RED, spec.flipped?.includes(s) ? BLUE : null))}
      {spec.blue?.map((s) => stone(s, BLUE, spec.flipped?.includes(s) ? RED : null))}
      {spec.cross?.map((s) => { const { x, y } = xy(s); return <g key={`x${s}`} stroke="#ff5d6c" strokeWidth="1" strokeLinecap="round"><line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} /><line x1={x + 3} y1={y - 3} x2={x - 3} y2={y + 3} /></g>; })}
    </svg>
  );
}
const fig = (spec: Spec, label: string) => <FlipCrop spec={spec} label={label} />;

// Red plays H8: F8 and G8 (between H8 and E8) and G7 (between H8 and F6) all turn red.
const FLIP_BEFORE: Spec = { red: ['E8', 'F6'], blue: ['F8', 'G8', 'G7'] };
const FLIP_AFTER: Spec = { red: ['E8', 'F6', 'H8', 'F8', 'G8', 'G7'], flipped: ['F8', 'G8', 'G7'], last: 'H8' };
// Red plays J8, flipping H8: E8–J8 is five red stones, but H8 was flipped by this very move, so it does not win.
const VOID: Spec = { red: ['E8', 'F8', 'G8', 'H8', 'J8'], flipped: ['H8'], last: 'J8', ring: ['E8', 'F8', 'G8', 'H8', 'J8'] };
// Red plays into the gap G8 between two blue stones: nothing happens to red (only the mover flips).
const GAP: Spec = { red: ['G8'], blue: ['F8', 'H8'], last: 'G8' };
// 쌍삼: H8 would make two open threes (F8–H8 across, H8–H10 down) — forbidden, for both colours.
const DOUBLE: Spec = { red: ['F8', 'G8', 'H9', 'H10'], cross: ['H8'] };
// Walkthrough: blue has blocked red's F8–G8 at H8.
const W1: Spec = { red: ['F8', 'G8', 'D9'], blue: ['H8', 'E9'] };
const W2: Spec = { red: ['F8', 'G8', 'D9', 'H8', 'J8'], blue: ['E9'], flipped: ['H8'], last: 'J8' };
const W3: Spec = { red: ['F8', 'G8', 'D9', 'H8', 'J8'], blue: ['E9', 'K8'], flipped: ['H8'], last: 'K8' };
const W4: Spec = { red: ['F8', 'G8', 'D9', 'H8', 'J8', 'E8'], blue: ['E9', 'K8'], flipped: ['H8'], last: 'E8', ring: ['E8', 'F8', 'G8', 'H8', 'J8'] };

const guide: GameGuide = {
  game: 'flipOmok',
  origin: { kind: 'original' },
  updated: '2026-11-28',
  related: ['propositionGo', 'blindGomoku', 'pointOmok', 'fourThree', 'blackWhite'],
  ko: {
    meta: {
      title: '뒤집기 오목 공략 — 뒤집기 3번 쓰는 법, 고정 돌, 무효 5목, 쌍삼 금지까지 | PUZZLTHINK',
      description: '오목에 오셀로 뒤집기를 섞은 뒤집기 오목 공략. 한 판에 3번뿐인 뒤집기를 언제 쓸지, 뒤집힌 돌이 고정되는 규칙, 그 수에 뒤집힌 돌이 든 5목이 무효인 이유, 막힌 줄 되살리기 따라 두기, 쌍삼 금지와 장목, AI COCO 난이도까지 정리했어요.',
      keywords: ['뒤집기 오목 공략', '뒤집기 오목 규칙', '오목 오셀로', '플립 오목', '오셀로 오목', '뒤집기오목'],
    },
    title: '뒤집기 오목 공략',
    lead: '뒤집기는 세 번. 고르는 순간이 승부예요.',
    intro: [
      '뒤집기 오목은 15×15 판에서 딱 5목을 만드는 오목에 **오셀로의 뒤집기**를 더한 PUZZLTHINK 창작 게임으로, 명제 바둑과 함께 **PUZZLTHINK ORIGINAL** 시리즈예요. 돌을 두었을 때 그 돌과 내 다른 돌 사이에 상대 돌이 한 줄로 끼이면, 끼인 돌을 모두 내 색으로 뒤집을 수 있어요. 단 뒤집기는 한 판에 **3번**뿐이고, 둘 때마다 쓸지 말지를 내가 골라요(**전략적 뒤집기**). 한 번 뒤집힌 돌은 **고정**돼 다시는 뒤집히지 않아요. 그래서 줄을 막는 돌이 한 방에 상대 줄의 일부가 되기도 하고, 끝난 줄이 되살아나기도 해요. 그 한 방을 언제 쓰느냐가 이 게임의 핵심이에요.',
      '이 공략은 뒤집기가 오목 규칙과 만나는 지점을 정확히 정리하는 데서 시작해요. 무엇이 뒤집히고 무엇이 안 뒤집히는지, 고정 돌은 어떻게 작동하는지, 왜 어떤 5목은 무효인지, 쌍삼과 장목은 어떻게 되는지를 판 그림으로 보고, 막힌 줄을 뒤집기 한 번으로 되살려 이기는 수순을 따라 둔 뒤, 뒤집기를 언제 쓸지와 단계별 전략, AI의 특징을 다뤄요. 좌표는 가로 A~P(I 없음), 세로 1~15(아래부터)예요. 그림의 안쪽 점(눈)은 한 번이라도 뒤집힌 돌의 원래 색이에요.',
    ],
    gamePageTitle: '뒤집기 오목 — 끼우고, 골라서 뒤집고, 딱 5목',
    summary: '뒤집기 3번과 고정 돌, 무효 5목, 막힌 줄 되살리기 따라 두기, 뒤집기를 쓸 때, 쌍삼 금지와 AI 난이도.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '뒤집기 오목은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '뒤집기 오목은 PUZZLTHINK 개발자가 오목과 오셀로(리버시)를 섞어 만든 창작 보드게임이에요. 방송이나 기존 보드게임을 옮긴 게 아니라 이 사이트에서 처음 만든 규칙이라, 정석도 아직 없어요. 오목 감각과 오셀로 감각이 모두 쓰이는 대신, 둘 중 하나만 믿으면 금방 함정에 빠져요.' },
          { type: 'p', text: '돌은 흑백 대신 레드(선공)와 블루예요. 뒤집힌 돌에는 원래 색의 "눈"과 🔒 표시가 남아서, 어떤 돌이 원래 누구 것이었고 이제 고정됐는지 판에서 바로 볼 수 있어요.' },
          { type: 'p', text: '처음에는 끼울 때마다 자동으로 뒤집혔어요. 그러자 돌이 계속 핑퐁처럼 오가서 판을 읽을 수 없었어요. 2026년 11월 28일부터 뒤집기는 한 판에 3번, 고르는 순간에만, 뒤집힌 돌은 고정이라는 지금의 규칙이 됐어요. AI끼리 수천 판을 두어 비교했을 때 두 번 이상 색이 바뀌는 돌이 25%에서 0%로, 한 판에 뒤집히는 돌이 33개에서 5개로 줄었고, 선공 승률은 57%에서 50%로 맞춰졌어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판과 차례**: 15×15 판의 교차점에 레드(선)와 블루가 번갈아 하나씩 둬요. 빈 교차점이면 어디든 둘 수 있어요(쌍삼 자리만 빼고). 오셀로처럼 뒤집기가 있어야만 두는 건 아니에요.',
            '**뒤집기는 고를 때만, 한 판에 3번**: 둔 돌과 내 다른 돌 사이에 상대 돌이 빈틈없이 한 줄로 끼이는 자리를 누르면 **놓기**(기본, 아무것도 안 뒤집힘)와 **놓고 뒤집기**(뒤집기 1회 사용) 중에서 골라요. 놓고 뒤집기를 고르면 그 돌이 끼우는 줄이 모두 내 색이 돼요. 가로·세로·대각선 8방향을 모두 보고, 끼인 돌 수에는 제한이 없어요. 뒤집기는 한 사람당 3번(◆◆◆)이고 남은 수는 양쪽 모두에게 보여요.',
            '**뒤집힌 돌은 고정**: 한 번 뒤집힌 돌(🔒)은 다시 뒤집히지 않아요. 고정 돌이 하나라도 낀 줄은 누구도 뒤집을 수 없어요.',
            '**두는 사람만 뒤집어요**: 상대 돌 두 개 사이 빈칸에 내가 들어가도 내 돌은 뒤집히지 않아요.',
            '**승리**: 내 색 돌이 **정확히 5개** 한 줄로 이어지면 이겨요. 예전에 뒤집혀 온 돌도 포함되지만, **그 수로 뒤집힌 돌이 든 5목은 무효**예요. 6목 이상(장목)도 승리가 아니에요.',
            '**쌍삼 금지**: 열린 3을 두 개 동시에 만드는 수는 레드·블루 모두 둘 수 없어요(화면에 ✕). 놓기와 놓고 뒤집기는 따로 따져서, 한쪽만 금지일 수도 있어요. 그 수로 5목이 완성되면 예외예요.',
            '**무승부와 시간**: 판이 가득 차면 무승부예요. 친구 방은 한 수 15·30·60초이고, 시간이 지나면 자동으로 한 수가 두어지며(뒤집기는 쓰지 않아요) 세 번 연속이면 패배예요.',
          ] },
          { type: 'cards', items: [
            { title: '두기 전', body: 'E8과 F6에 레드, F8·G8·G7에 블루가 있어요. 레드가 H8에 둘 차례예요.', figure: fig(FLIP_BEFORE, '뒤집기 전') },
            { title: 'H8에 놓고 뒤집기', body: '레드가 H8을 누르면 놓기·놓고 뒤집기 버튼이 떠요. 놓고 뒤집기를 고르면 왼쪽으로는 F8·G8이 H8과 E8 사이에, 왼쪽 아래 대각선으로는 G7이 H8과 F6 사이에 끼여서 세 돌이 한꺼번에 뒤집히고 🔒 고정돼요. 뒤집기 한 번으로 여러 방향이 동시에 뒤집혀요. 놓기를 골랐다면 H8만 놓이고 블루 돌은 그대로예요.', figure: fig(FLIP_AFTER, 'H8에 놓고 뒤집기') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '무효 5목', title: '뒤집어서 만든 5목은 그 자리에서 이기지 않아요', body: '레드 E8·F8·G8, 블루 H8인 판에서 레드가 J8에 두면 H8이 끼여 레드가 되고, E8~J8 다섯이 이어져요. 하지만 H8은 바로 이 수에 뒤집힌 돌이라 이 5목은 무효예요. 게다가 다섯 칸이 모두 찼으니 이 줄에 더 두면 6목이 될 뿐이에요. 이 줄은 이제 레드에게 쓸모없는 줄이 됐어요.', figure: fig(VOID, '뒤집기로 만든 무효 5목') },
          ] },
          { type: 'cards', items: [
            { title: '상대 돌 사이에 들어가도 되나요?', body: '돼요. 뒤집기는 두는 사람만 해서, 블루 F8·H8 사이 G8에 레드가 들어가도 레드 돌은 그대로예요. 상대 줄 한가운데를 끊는 좋은 수비예요.', figure: fig(GAP, '상대 돌 사이에 두기') },
            { title: '쌍삼 자리는 어떻게 보이나요?', body: '레드 F8·G8과 H9·H10이 있을 때 H8에 두면 가로·세로 열린 3이 동시에 생겨 금지예요(✕). 같은 자리라도 블루에게는 쌍삼이 아니라서 둘 수 있어요.', figure: fig(DOUBLE, '쌍삼 금지 자리') },
            { title: '뒤집힌 돌도 다시 뒤집혀요?', body: '아니요. 뒤집힌 돌은 고정(🔒)이에요. 그 돌이 낀 줄은 양쪽 누구도 뒤집을 수 없어서, 뺏은 돌은 끝까지 그 사람 돌이에요.' },
            { title: '뒤집기를 다 쓰면?', body: '그다음부터는 놓기만 할 수 있어요. 끼우는 자리에 둬도 아무것도 뒤집히지 않아요. 남은 뒤집기는 끝나도 점수가 되지 않아요.' },
            { title: '판 끝이나 내 돌을 등지면?', body: '끼우려면 반대쪽에 상대 돌이 있어야 해요. 판 끝에 붙은 돌이나, 뒤에 내 돌이 이어진 줄의 끝은 그 방향으로는 뒤집히지 않아요.' },
            { title: '뒤집기로 상대가 5목이 될 수도 있나요?', body: '뒤집기는 상대 돌을 내 색으로만 바꿔요. 내 수로 상대 돌이 늘어나는 일은 없어요.' },
            { title: '렌주처럼 흑만 금수인가요?', body: '아니요. 쌍삼 금지와 장목 무효는 레드·블루 모두에게 똑같이 적용돼요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — "끼일 수 있는 돌"과 상대의 ◆ 보기',
        blocks: [
          { type: 'p', text: '보통 오목에서는 막은 돌이 영원히 막은 돌이에요. 뒤집기 오목에서는 상대에게 뒤집기가 남아 있는 동안은 아니에요. 매 수 두기 전에 "상대 ◆가 몇 개 남았나, 이 돌이 다음 수에 끼일 수 있나"를 보는 습관이 첫 번째 기술이에요.' },
          { type: 'list', items: [
            '**붙여 막은 돌은 끼일 수 있어요**: 상대 줄 끝에 바로 붙여 막은 내 돌은, 그 너머에 상대가 두면 끼여서 상대 돌이 돼요. 막은 뒤에도 그 너머 칸이 비어 있는지 확인하세요.',
            '**등을 기대고 막기**: 막는 돌 뒤에 내 돌이 있거나 판 끝이면, 그 방향으로는 끼일 수가 없어요. 같은 곳을 막더라도 뒤가 든든한 쪽을 고르세요.',
            '**줄 한가운데 끊기**: 상대 돌 사이 빈칸은 내가 들어가도 안 뒤집히는 안전한 자리예요. 띈 3(●●_●)의 빈칸을 막으면 두 쪽을 한 번에 끊어요.',
            '**무효 5목을 두려워하지 않기**: 상대가 내 막는 돌을 뒤집어 5개를 이어도 그 수로는 이기지 못해요. 그 대신 그 줄이 어떻게 바뀌었는지 보고 다음 수를 막으세요.',
            '**상대 뒤집기가 0이면 마음 놓고 붙여 막기**: 상대 ◆가 모두 꺼졌다면 더는 뒤집힐 일이 없어요. 그때부터는 보통 오목처럼 막으면 돼요.',
          ] },
        ],
      },
      {
        id: 'when-to-flip',
        level: 'beginner',
        onGamePage: true,
        title: '뒤집기는 언제 쓸까 — 3번을 아끼는 법',
        blocks: [
          { type: 'p', text: '뒤집기는 판 전체에 단 세 번이에요. 돌 한두 개를 늘리는 데 쓰면 정작 상대의 4가 섰을 때 막을 방법이 없어요. 기본은 놓기, 아래 같은 순간에만 놓고 뒤집기를 쓰세요.' },
          { type: 'table', caption: '뒤집기를 쓸 만한 순간', head: ['장면', '뒤집기 효과', '메모'], rows: [
            ['상대의 4(또는 열린 3)의 돌을 끼울 수 있을 때', '그 줄이 끊기고 내 돌이 돼요', '막기와 공격을 한 번에. 가장 값진 사용처'],
            ['내 줄을 막은 돌 너머가 비어 있을 때', '막힌 줄이 열린 4로 되살아나요', '아래 따라 두기의 수순'],
            ['한 수로 여러 방향이 끼일 때', '여러 줄이 한꺼번에 바뀌어요', '이득이 큰 만큼 상대 반격도 확인'],
            ['돌 하나만 늘어날 때', '거의 없어요', '아껴 두세요'],
          ] },
          { type: 'list', items: [
            '**상대 ◆ 세기**: 상대에게 뒤집기가 많이 남았으면 내 줄 끝의 붙은 돌이 위험하고, 다 썼으면 안전해요. 내 뒤집기를 아끼는 만큼 상대도 같은 계산을 해요.',
            '**막는 돌은 고정 돌 옆에**: 고정 돌(🔒)이 낀 줄은 아무도 뒤집지 못해요. 내 뒤집힌 돌을 벽처럼 쓰면 상대 뒤집기를 피할 수 있어요.',
            '**마지막 한 번은 수비용**: 3번을 다 쓰면 상대 4를 뒤집어 끊는 수단이 사라져요. 하나는 끝까지 남겨 두는 것도 방법이에요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 두기 — 막힌 줄을 뒤집어 되살리기',
        lead: '블루가 레드의 두 돌을 H8로 막은 장면이에요. 레드는 이 막는 돌을 오히려 재료로 써요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. 막힌 줄', body: '레드 F8·G8의 오른쪽 끝을 블루 H8이 막았어요. 보통 오목이라면 이 줄은 한쪽이 막힌 2목이에요. 그런데 H8 너머 J8이 비어 있어요.', figure: fig(W1, '블루 H8이 막은 줄') },
            { title: '2. J8에 놓고 뒤집기', body: '레드가 J8을 누르고 놓고 뒤집기를 고르면(뒤집기 1회 사용) H8이 G8과 J8 사이에 끼여 레드가 되고 고정돼요. 한 수에 F8~J8 레드 4목이 생겼고, 양 끝 E8과 K8이 모두 비어 있는 **열린 4**예요. 이 수 자체는 5목이 아니라서 무효 규칙과도 상관없어요.', figure: fig(W2, 'J8로 H8 뒤집기') },
            { title: '3. 블루는 한쪽만 막을 수 있어요', body: '블루가 K8을 막아요. H8은 고정이라 블루가 뒤집기를 써도 이 줄은 다시 뒤집을 수 없어요. 한쪽 끝만 막을 수 있어요.', figure: fig(W3, '블루 K8 막기') },
            { title: '4. E8로 5목', body: '레드가 E8에 두면 E8~J8 정확히 5목이에요. H8은 앞선 수에 뒤집힌 돌이라 이번에는 5목에 들어가도 괜찮아요. 레드 승리예요.', figure: fig(W4, 'E8로 5목 완성') },
          ] },
          { type: 'callout', tone: 'tip', title: '블루는 어떻게 막았어야 했을까', text: '레드에게 뒤집기가 남아 있는 동안 H8로 바로 붙여 막은 게 문제였어요. 뒤에 블루 돌을 하나 더 둘 수 있는 자리나 E8 쪽을 막았다면 이 수순은 없었어요. 붙여 막을 때는 상대 ◆와 막는 돌 너머 칸(여기서는 J8)을 함께 보세요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 뒤집기로 두 가지 일 하기',
        blocks: [
          { type: 'list', items: [
            '**뒤집기 + 새 위협**: 귀한 뒤집기는 한 번에 두 가지를 해야 해요. 상대 돌을 뒤집어 상대 줄을 끊으면서 내 새 줄을 만드는 수가 있으면 상대는 둘 다 처리하기 어려워요.',
            '**정확히 4로 뒤집기**: 뒤집기로 바로 5개를 만들면 무효가 되고 그 줄도 죽어요. 따라 두기처럼 뒤집기로는 4(되도록 열린 4)까지만 만들고, 마지막 한 돌은 다음 수에 직접 두세요.',
            '**장목 자리 읽기**: 6목은 승리가 아니라서, 상대 4목의 빈 끝 너머에 상대 돌이 또 있으면(●●●●_●) 그 칸은 상대에게 6목 자리라 급히 막지 않아도 돼요. 반대로 내 4목을 만들 때는 이런 모양이 되지 않게 하세요.',
            '**✕ 자리 이용하기**: 상대에게 쌍삼 금지인 자리는 상대가 막을 수 없는 자리예요. 내 공격을 그 칸으로 이어 가면 상대는 다른 곳에서 막아야 해요.',
          ] },
          { type: 'table', caption: '막는 돌의 위치에 따른 위험', head: ['막는 모양', '다음 수에 끼일까?', '메모'], rows: [
            ['상대 줄 끝에 붙여 막고, 그 너머가 빈칸', '상대에게 ◆가 남았다면 끼일 수 있어요', '상대가 너머에 놓고 뒤집으면 내 돌이 상대 줄이 돼요'],
            ['고정 돌(🔒)이 낀 줄에서 막기', '안 끼여요', '고정 돌이 있는 줄은 아무도 못 뒤집어요'],
            ['붙여 막았는데, 뒤에 내 돌이나 판 끝', '그 방향으로는 안 끼여요', '가장 단단한 막기'],
            ['상대 돌 사이 빈칸에 들어가 막기', '내 돌은 그대로예요', '두는 사람만 뒤집으니까요'],
            ['한 칸 떨어뜨려 막기', '바로 끼이지는 않아요', '대신 상대가 그 사이를 채울 수 있어요'],
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 판 전체의 뒤집기 지도',
        blocks: [
          { type: 'list', items: [
            '**대각선 뒤집기를 놓치지 않기**: 가로·세로보다 대각선으로 끼이는 돌이 잘 안 보여요. 뒤집기 한 번이 8방향을 모두 뒤집는다는 걸 기억하고, 특히 내 돌들이 대각선으로 상대 돌을 사이에 두고 있는지 미리 봐 두세요. 금색 표적이 뒤집힐 돌을 미리 보여 줘요.',
            '**긴 줄 통째 뒤집기**: 끼인 돌 수에는 제한이 없어요. 상대가 길게 이어 둔 줄이 양쪽 끝에서 내 돌에 둘러싸일 수 있는 모양이면, 뒤집기 한 번으로 줄 전체를 빼앗을 수 있어요. 그 줄에 고정 돌이 하나라도 있으면 안 돼요.',
            '**고정 돌로 성 쌓기**: 뒤집힌 돌은 영원히 그 색이에요. 내 고정 돌이 들어간 줄은 상대가 뒤집기로 끊을 수 없으니, 결정적인 공격 줄은 고정 돌을 끼고 만드세요.',
            '**뒤집기 수 싸움**: 내 ◆가 상대보다 많으면 끝판에 상대 4를 끊을 수단이 하나 더 있는 셈이에요. 서로 아끼다 보면 마지막 뒤집기를 가진 쪽이 유리해요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**붙여 막고 안심하기**: 상대에게 뒤집기가 남았고 막는 돌 너머가 비어 있으면 그 돌은 다음 수에 상대 줄이 돼요.',
            '**뒤집기를 일찍 다 쓰기**: 돌 한두 개 늘리려고 3번을 써 버리면, 상대 4가 섰을 때 끊을 수단이 없어요.',
            '**뒤집기로 5목을 노리기**: 그 수에 뒤집힌 돌이 든 5목은 무효이고, 다섯 칸이 다 찬 줄은 더 늘리면 장목이 돼요.',
            '**대각선 뒤집기 못 보기**: 내 돌을 두기 전에 8방향 모두 무엇이 끼이는지 확인하세요.',
            '**6목으로 이기려 하기**: 장목은 승리가 아니에요. 정확히 다섯이어야 해요.',
            '**쌍삼 자리에 집착하기**: 나에게 ✕인 자리는 둘 수 없어요. 그 자리가 필요한 공격이라면 순서를 바꿔 열린 3을 하나씩 만드세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI COCO, 한 기기 대국, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국 (COCO)', '나는 레드(선공)예요. 무르기를 쓰면 AI의 응수까지 함께 되돌려요. 기권은 패배로 기록돼요. 난이도는 첫 수 전에만 바꿀 수 있어요.'],
            ['중간', '자기 수만 보고 둬요. 5목은 반드시 만들고 상대 5목 자리는 막아요(필요하면 뒤집기로 상대 4를 끊어요). 뒤집기 한 번을 돌 서너 개만큼 귀하게 여겨서 이득이 클 때만 쓰지만, 판단에 흔들림이 커서 열린 3을 놓치거나 뒤집기를 쓸 때를 놓치기도 해요.'],
            ['어려움', '자기 수와 상대의 가장 좋아 보이는 응수까지 읽어요. 내 뒤집기와 상대의 뒤집기를 모두 계산해서, 상대의 열린 3은 반드시 풀고 막는 돌이 뒤집히는 함정도 봐요. COCO가 뒤집기를 쓸 때는 노리는 돌을 금색 표적으로 잠깐 먼저 보여 줘요. 한 수 앞 읽기라 더 긴 수순에는 약해요.'],
            ['한 기기 대국', '한 화면에서 두 사람이 번갈아 둬요.'],
            ['친구 방', '링크나 4자리 코드로 방을 만들어요. 첫 판의 레드는 무작위이고 재대결마다 바뀌어요. 한 수 15·30·60초(기본 30초), 시간이 지나면 중간 AI가 대신 한 수를 두고(뒤집기는 쓰지 않아요), 세 번 연속이면 패배예요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '끼우기', def: '둔 돌과 내 다른 돌 사이에 상대 돌을 한 줄로 가두는 것. 놓고 뒤집기를 고르면 가둔 돌이 모두 뒤집혀요.' },
            { term: '전략적 뒤집기', def: '한 판에 3번(◆◆◆), 고를 때만 쓰는 뒤집기. 기본은 놓기예요.' },
            { term: '고정 돌', def: '한 번 뒤집힌 돌(🔒). 다시는 뒤집히지 않고, 고정 돌이 낀 줄은 아무도 뒤집지 못해요.' },
            { term: '눈', def: '뒤집힌 돌 안에 남은 원래 색 표시.' },
            { term: '무효 5목', def: '그 수에 뒤집힌 돌이 들어간 5목. 승리가 아니에요.' },
            { term: '장목', def: '6개 이상 이어진 줄. 승리가 아니에요.' },
            { term: '쌍삼', def: '열린 3을 두 개 동시에 만드는 수. 양쪽 모두 금지(5목이 되면 예외).' },
            { term: '열린 4', def: '양 끝이 모두 비어 있는 4목. 한쪽만 막을 수 있어서 다음 수에 5목이 돼요.' },
            { term: 'COCO', def: '뒤집기 오목의 AI 상대 이름.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '끼우면 항상 뒤집히나요?', a: '아니요. 끼우는 자리를 누르면 놓기(기본)와 놓고 뒤집기 중에서 골라요. 뒤집기는 한 사람당 한 판에 3번이에요.' },
      { q: '뒤집힌 돌을 다시 뒤집을 수 있나요?', a: '아니요. 뒤집힌 돌은 🔒 고정이고, 고정 돌이 낀 줄은 누구도 뒤집을 수 없어요.' },
      { q: '오셀로처럼 둘 곳이 없으면 넘기나요?', a: '아니요. 뒤집기가 없어도 빈 교차점이면 어디든 둘 수 있어요. 쌍삼(✕) 자리만 빼고요.' },
      { q: '뒤집어서 5개가 이어지면 이기나요?', a: '그 수에 뒤집힌 돌이 들어간 5목은 무효예요. 예전에 뒤집혀 온 돌은 포함돼도 괜찮아요.' },
      { q: '6목도 이기나요?', a: '아니요. 정확히 5목만 승리예요. 장목은 레드·블루 모두 무효예요.' },
      { q: '렌주처럼 흑만 금수인가요?', a: '아니요. 쌍삼 금지와 장목 무효는 레드·블루 모두에게 똑같이 적용돼요.' },
      { q: '흑백이 아니라 빨강·파랑인 이유는?', a: '뒤집힌 돌의 눈을 상대 색으로 표시하려고요. 빨간 눈을 가진 파란 돌은 원래 레드의 돌이었다는 뜻이에요.' },
      { q: '규칙이 바뀌었나요?', a: '네. 2026년 11월 28일부터 끼울 때마다 자동으로 뒤집히던 규칙이 「전략적 뒤집기」(한 판 3번, 고를 때만, 뒤집힌 돌은 고정)로 바뀌었어요. 그전 기록과 왕관은 그대로 남아요.' },
      { q: '기록이 남나요?', a: '네. AI 대국과 친구 방 결과가 기록실에 남아요.' },
    ],
    cta: { title: '뒤집어 볼까요?', body: '따라 두기처럼 막힌 줄을 뒤집기 한 번으로 되살려 보세요. 세 번뿐인 뒤집기의 무게가 바로 느껴져요.', button: '뒤집기 오목 하러 가기' },
  },
  en: {
    meta: {
      title: 'Flip Omok strategy guide — spending 3 flips, locked stones, void fives | PUZZLTHINK',
      description: 'A guide to Flip Omok, gomoku with Othello flips: when to spend your only 3 flips, why flipped stones lock, why a five that includes this move’s flips does not count, reviving a blocked line move by move, double-threes and overlines, and the AI COCO.',
      keywords: ['Flip Omok strategy', 'Flip Omok rules', 'gomoku othello', 'flip gomoku', 'othello gomoku hybrid'],
    },
    title: 'Flip Omok strategy guide',
    lead: 'Three flips a game. The moment you choose decides it.',
    intro: [
      'Flip Omok is a PUZZLTHINK original (the **PUZZLTHINK ORIGINAL** series, with Proposition Go): exactly-five gomoku on a 15×15 board plus **Othello’s flip**. When your new stone and another of yours trap a straight run of enemy stones, you may turn every trapped stone your colour — but only **3 times a game**, and only when you choose to (**strategic flip**). A flipped stone is **locked** and never flips again. So one well-timed flip turns a blocking stone into part of your line, or brings a dead line back to life. Choosing that moment is the heart of the game.',
      'This guide starts by pinning down exactly where flipping meets the gomoku rules: what flips and what does not, how locked stones work, why some fives do not count, and how double-threes and overlines work — all with diagrams. Then it plays out a win that revives a blocked line with one flip, followed by when to spend a flip, strategy by level and notes on the AI. Coordinates are columns A–P (no I) and rows 1–15 from the bottom. The inner dot (“eye”) on a stone shows its original colour if it has ever been flipped.',
    ],
    gamePageTitle: 'Flip Omok — trap, choose to flip, exactly five',
    summary: 'Three flips and locked stones, void fives, reviving a blocked line, when to flip, double-threes and the AI levels.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Flip Omok?',
        blocks: [
          { type: 'p', text: 'Flip Omok is an original board game by the PUZZLTHINK developer, mixing gomoku with Othello (Reversi). It is not adapted from a TV show or an existing board game — the rules were made here, so there is no established theory yet. You need both a gomoku eye and an Othello eye; trust only one and you walk into traps.' },
          { type: 'p', text: 'Instead of black and white, the stones are red (first) and blue. A flipped stone keeps an “eye” of its original colour and a 🔒, so the board shows whose stone each one used to be and that it is now locked.' },
          { type: 'p', text: 'At first every sandwich flipped automatically, and stones ping-ponged until the board could not be read. Since 28 November 2026 the rules are today’s: 3 flips a game, only when you choose, flipped stones locked. In thousands of AI games, stones that change colour twice or more dropped from 25% to 0%, stones flipped per game from 33 to 5, and the first player’s win rate from 57% to 50%.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board and turns**: red (first) and blue take turns placing one stone on the intersections of a 15×15 board. Any empty point is allowed except a double-three point. Unlike Othello, a move does not have to flip anything.',
            '**Flips are chosen, 3 per game**: tap a point where your new stone and another of yours would enclose an unbroken straight run of enemy stones, and choose **Place** (the default; nothing flips) or **Place & flip** (uses one flip): every run that stone encloses turns your colour. All eight directions count, and a run can be any length. Each player has 3 flips (◆◆◆); both players see how many are left.',
            '**Flipped stones lock**: a stone that was flipped (🔒) never flips again, and a run that holds one cannot be flipped by anyone.',
            '**Only the mover flips**: playing into an empty point between two enemy stones never flips your own stone.',
            '**Winning**: **exactly five** of your colour in a row wins. Stones flipped earlier count, but **a five that includes a stone flipped by this very move does not.** Six or more (an overline) does not win either.',
            '**No double-threes**: neither red nor blue may make two open threes with one move (shown as ✕), unless that move makes five. Place and Place & flip are judged separately, so only one of them may be forbidden.',
            '**Draw and clocks**: a full board is a draw. Friend rooms use 15, 30 or 60 seconds a move; on a timeout a move is played for you (never spending a flip), and three timeouts in a row lose.',
          ] },
          { type: 'cards', items: [
            { title: 'Before', body: 'Red on E8 and F6; blue on F8, G8 and G7. Red is about to play H8.', figure: fig(FLIP_BEFORE, 'Before the flip') },
            { title: 'H8, Place & flip', body: 'Red taps H8 and gets the two buttons. With Place & flip, F8 and G8 (between H8 and E8) and G7 (between H8 and F6, down-left) all flip at once and lock. One flip can turn several directions. With Place, only H8 goes down and the blue stones stay.', figure: fig(FLIP_AFTER, 'H8 with Place & flip') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations — what happens if…',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'VOID FIVE', title: 'A five made by flipping does not win on the spot', body: 'Red E8, F8, G8 and blue H8: red plays J8, H8 is trapped and turns red, and E8–J8 is five in a row. But H8 was flipped by this very move, so the five does not count. Worse, all five squares are now full, so any further stone on that line only makes six. The line has become useless to red.', figure: fig(VOID, 'A void five made by flipping') },
          ] },
          { type: 'cards', items: [
            { title: 'Can I play between two enemy stones?', body: 'Yes. Only the mover flips, so red on G8 between blue F8 and H8 stays red. It is a good way to cut their line in the middle.', figure: fig(GAP, 'Playing between enemy stones') },
            { title: 'What does a double-three point look like?', body: 'With red on F8, G8, H9 and H10, a red stone on H8 makes open threes across and down at once — forbidden (✕). The same point is not a double-three for blue, so blue may play there.', figure: fig(DOUBLE, 'A forbidden double-three point') },
            { title: 'Can a flipped stone flip back?', body: 'No. Flipped stones are locked (🔒). No run that holds one can be flipped by either player, so a stone you take stays yours.' },
            { title: 'What if I run out of flips?', body: 'From then on you can only place; sandwiching points flip nothing. Unused flips are worth nothing at the end.' },
            { title: 'What about stones against the edge or my own stones?', body: 'Trapping needs an enemy stone on the far side. A stone against the board edge, or at the end of a line backed by your own stones, cannot be flipped in that direction.' },
            { title: 'Can my move hand the opponent a five?', body: 'No. Flipping only turns their stones into yours; your move never adds stones to their colour.' },
            { title: 'Are only black’s moves restricted, as in renju?', body: 'No. The double-three ban and the overline rule apply to red and blue alike.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — spot the stones that can be trapped, and count their ◆',
        blocks: [
          { type: 'p', text: 'In ordinary gomoku a blocking stone blocks forever. Here it does only once your opponent is out of flips. The first skill is asking, every move, “how many flips do they have left, and can this stone be trapped next move?”' },
          { type: 'list', items: [
            '**A block placed right against their line can be trapped**: if the point beyond your blocker is empty, they play there and your blocker joins their line. After blocking, check that far point.',
            '**Block with your back covered**: if there is one of your stones or the board edge behind the blocker, it cannot be trapped in that direction. Given a choice, block where your back is covered.',
            '**Cut lines in the middle**: an empty point between two enemy stones is safe — you cannot be flipped there. Filling the gap of a split three (●●_●) cuts both sides at once.',
            '**Don’t fear void fives**: if they flip your blocker and line up five, that move does not win. Look at how the line changed and block the next threat instead.',
            '**Out of flips means safe**: once all their ◆ are dim, nothing of yours can flip any more. From then on, block as in ordinary gomoku.',
          ] },
        ],
      },
      {
        id: 'when-to-flip',
        level: 'beginner',
        onGamePage: true,
        title: 'When to flip — making 3 last',
        blocks: [
          { type: 'p', text: 'You get three flips for the whole game. Spend one to gain a stone or two and you may have nothing left when their four stands. Place by default, and Place & flip only at moments like these.' },
          { type: 'table', caption: 'Moments worth a flip', head: ['Situation', 'What the flip does', 'Note'], rows: [
            ['You can sandwich a stone of their four (or open three)', 'Their line breaks and the stone is yours', 'Defence and attack at once — the best use'],
            ['The point beyond the stone blocking your line is empty', 'Your blocked line returns as an open four', 'The walkthrough below'],
            ['One stone sandwiches in several directions', 'Several lines change at once', 'Big gain; check their reply too'],
            ['Only one stone would turn', 'Very little', 'Save it'],
          ] },
          { type: 'list', items: [
            '**Count their ◆**: while they have flips left, your stones against their lines are at risk; once they are out, they are safe. They are doing the same sums about yours.',
            '**Block beside a locked stone**: a run holding a locked stone (🔒) can’t be flipped by anyone, so your own flipped stones make a wall their flips can’t breach.',
            '**Keep the last one for defence**: with all three spent you have no way to cut their four. Holding one back to the end is often right.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Play along — reviving a blocked line by flipping',
        lead: 'Blue has blocked red’s two stones with H8. Red turns that blocker into material.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. A blocked line', body: 'Blue H8 blocks the right end of red’s F8–G8. In ordinary gomoku this is a two closed at one end. But J8, just beyond H8, is empty.', figure: fig(W1, 'Blue H8 blocking the line') },
            { title: '2. J8 with Place & flip', body: 'Red taps J8 and chooses Place & flip (one flip used): H8, now between G8 and J8, turns red and locks. In one move red has four, F8–J8, with both ends (E8 and K8) empty — an **open four**. It is not a five, so the void rule does not come into it.', figure: fig(W2, 'J8 flips H8') },
            { title: '3. Blue can block only one end', body: 'Blue blocks K8. H8 is locked, so even with a flip blue can’t turn this line back. Only one end can be blocked.', figure: fig(W3, 'Blue blocks K8') },
            { title: '4. Five with E8', body: 'Red plays E8: E8–J8 is exactly five. H8 was flipped on an earlier move, so this time it may be part of the five. Red wins.', figure: fig(W4, 'Five completed with E8') },
          ] },
          { type: 'callout', tone: 'tip', title: 'How should blue have blocked?', text: 'Blocking right against the line at H8 while red still had flips was the mistake. A block at E8, or one with a blue stone behind it, would have avoided this. Whenever you block right next to a line, check their ◆ and the point beyond your blocker (here J8).' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — make each flip do two jobs',
        blocks: [
          { type: 'list', items: [
            '**Flip plus a new threat**: a precious flip should do two things. A move that flips their stones to break their line while building a new line of yours is hard to answer completely.',
            '**Flip to exactly four**: flipping straight into five makes a void five and kills the line. As in the walkthrough, flip only up to a four (ideally open) and place the fifth stone yourself next move.',
            '**Read overline points**: six does not win, so if there is another enemy stone beyond the empty end of their four (●●●●_●), that point gives them six, not five, and need not be blocked in a hurry. Conversely, avoid that shape when you build a four.',
            '**Use their ✕ points**: a point that is a double-three for the opponent is a point they cannot block on. Steer your attack towards it and they must defend elsewhere.',
          ] },
          { type: 'table', caption: 'How risky is a block?', head: ['Block shape', 'Trappable next move?', 'Note'], rows: [
            ['right against their line, empty beyond', 'yes, while they have ◆ left', 'they Place & flip beyond and your stone joins their line'],
            ['in a run that holds a locked stone (🔒)', 'no', 'nobody can flip a run with a locked stone'],
            ['right against it, your stone or the edge behind', 'not in that direction', 'the firmest block'],
            ['into the gap between enemy stones', 'your stone stays', 'only the mover flips'],
            ['one point away', 'not at once', 'but they can fill the space between'],
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — a flip map of the whole board',
        blocks: [
          { type: 'list', items: [
            '**Don’t miss diagonal flips**: stones trapped diagonally are harder to see than those across or down. A flip turns all eight directions at once; the gold targets show what would turn before you confirm.',
            '**Flip whole lines**: there is no limit on run length. If a long enemy line can be enclosed by your stones at both ends, one flip takes the whole line — unless it holds a locked stone.',
            '**Build with locked stones**: a flipped stone keeps its colour for good, and a line holding your locked stone can’t be cut by their flips. Run your decisive line through one.',
            '**The flip count race**: with more ◆ left than them, you hold one more way to cut their four in the endgame. When both sides save, the last flip standing often decides it.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Blocking right against a line and relaxing**: while they have flips and the far point is empty, that stone can join their line next move.',
            '**Spending all three early**: flips used to gain a stone or two leave nothing to cut their four later.',
            '**Aiming for a five by flipping**: a five that includes this move’s flips is void, and a full line of five can only grow into an overline.',
            '**Missing diagonal flips**: check all eight directions before placing.',
            '**Trying to win with six**: overlines do not win; it must be exactly five.',
            '**Fixating on a ✕ point**: you cannot play your own double-three point. If your attack needs it, change the order and make one open three at a time.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — the AI COCO, one-device play and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games (COCO)', 'You are red and move first. Undo takes back the AI’s reply too. Resigning counts as a loss. The level can only be changed before the first move.'],
            ['Medium', 'Looks only at its own move. It always makes a five and blocks one (with a flip that cuts your four if needed). It values a flip like three or four stones and spends one only for a real gain, but its judgement is loose: open threes get past it, and it sometimes saves a flip too long.'],
            ['Hard', 'Reads its move and your best-looking reply, counting both sides’ flips. It always defuses your open three and sees the trap of a blocker that gets flipped. Before COCO flips it shows its targets in gold for a moment. It still reads only one reply deep, so longer sequences beat it.'],
            ['One device', 'Two people take turns on one screen.'],
            ['Friend rooms', 'Create a room with a link or 4-digit code. Red is drawn at random for the first game and swaps on every rematch. Moves are 15, 30 or 60 seconds (30 by default); on a timeout the Medium AI plays for you without spending a flip, and three in a row lose.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Trap', def: 'Enclosing a straight run of enemy stones between your new stone and another of yours; with Place & flip the run flips.' },
            { term: 'Strategic flip', def: 'A flip used only when you choose, 3 per game (◆◆◆). Placing is the default.' },
            { term: 'Locked stone', def: 'A stone that was flipped (🔒). It never flips again, and no run holding it can be flipped.' },
            { term: 'Eye', def: 'The dot of original colour left inside a flipped stone.' },
            { term: 'Void five', def: 'A five that includes a stone flipped by this move. It does not win.' },
            { term: 'Overline', def: 'Six or more in a row. It does not win.' },
            { term: 'Double-three', def: 'A move making two open threes at once; forbidden for both sides unless it makes five.' },
            { term: 'Open four', def: 'A four with both ends empty; only one end can be blocked, so it becomes five next move.' },
            { term: 'COCO', def: 'The name of Flip Omok’s AI opponent.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Does sandwiching always flip?', a: 'No. Tap a sandwiching point and choose Place (the default) or Place & flip. Each player has 3 flips per game.' },
      { q: 'Can a flipped stone be flipped back?', a: 'No. Flipped stones are locked (🔒), and no run holding one can be flipped.' },
      { q: 'Do I pass if I can’t flip, like in Othello?', a: 'No. You can play on any empty intersection, flip or no flip — except a double-three (✕) point.' },
      { q: 'Does lining up five by flipping win?', a: 'Not if the five includes a stone flipped by that move. Stones flipped on earlier moves may be part of a winning five.' },
      { q: 'Does six in a row win?', a: 'No. Only exactly five wins; overlines are void for both red and blue.' },
      { q: 'Are only black’s moves restricted, as in renju?', a: 'No. The double-three ban and the overline rule apply to red and blue alike.' },
      { q: 'Why red and blue instead of black and white?', a: 'So a flipped stone can show its original colour as an eye: a blue stone with a red eye used to be red’s.' },
      { q: 'Did the rules change?', a: 'Yes. On 28 November 2026 automatic flipping on every sandwich became the strategic flip (3 a game, only when you choose, flipped stones lock). Earlier records and crowns stay.' },
      { q: 'Are results recorded?', a: 'Yes. AI games and friend-room games are saved to the records page.' },
    ],
    cta: { title: 'Ready to flip?', body: 'Try reviving a blocked line with a single flip, as in the walkthrough. You will feel at once what three flips are worth.', button: 'Play Flip Omok' },
  },
};

export default guide;
