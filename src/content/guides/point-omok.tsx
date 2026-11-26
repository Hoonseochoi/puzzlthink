// 포인트 오목 guide. Rules and numbers follow src/lib/pointOmok.ts (15×15, PO_GRANT 10 a round, bids whole numbers
// ≥ 1 on each point, carryOf = half of what is left rounded down, pointOwners: a tie goes to the player who did not
// choose, fiveLines: exactly five, an overline is not a five, more fives wins, equal fives or no triple left is a draw,
// PO_SECONDS 90, fallbackTriple), src/lib/pointOmokRoom.ts (random first chooser then alternating, a missing bid is
// 1·1·1, PO_IDLE_LOSS 3, bids locked by hash first), src/lib/pointOmokAi.ts (보통 / 어려움, the six bidding styles, the
// opponent budget range) and useBidLock.ts (a draft is locked as it stands at the last second), plus the
// PointOmokGuide messages in ko.json.
// Coordinates as on the board's edge (pointOmok.ts coordinate): columns A–P without I, rows 1–15 from the bottom.
import type { GameGuide } from './types';

const COLS = 'ABCDEFGHJKLMNOP';
type Spec = { cols: [string, string]; rows: [number, number]; black?: string[]; white?: string[]; marks?: Record<string, string> };

/** A crop of the 15×15 board: black = you, white = the opponent, marks = labels on empty points. */
function OmokCrop({ spec, label }: { spec: Spec; label: string }) {
  const c0 = COLS.indexOf(spec.cols[0]), c1 = COLS.indexOf(spec.cols[1]);
  const cols = COLS.slice(c0, c1 + 1).split('');
  const rows = Array.from({ length: spec.rows[1] - spec.rows[0] + 1 }, (_, i) => spec.rows[1] - i);
  const G = 10, P = 9;
  const W = P * 2 + (cols.length - 1) * G, H = P * 2 + (rows.length - 1) * G;
  const xy = (name: string) => ({ x: P + (COLS.indexOf(name[0]) - c0) * G, y: P + (spec.rows[1] - Number(name.slice(1))) * G });
  return (
    <svg viewBox={`-6 -2 ${W + 8} ${H + 8}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[320px]">
      <rect x={P - 5} y={P - 5} width={W - 2 * P + 10} height={H - 2 * P + 10} rx="2" fill="#d8b878" />
      {cols.map((c, i) => <line key={c} x1={P + i * G} y1={P} x2={P + i * G} y2={H - P} stroke="#6b5532" strokeWidth="0.4" />)}
      {rows.map((r, i) => <line key={r} x1={P} y1={P + i * G} x2={W - P} y2={P + i * G} stroke="#6b5532" strokeWidth="0.4" />)}
      {cols.map((c, i) => <text key={`t${c}`} x={P + i * G} y={H + 4} fontSize="4" textAnchor="middle" fill="#9aa1ae" fontFamily="monospace">{c}</text>)}
      {rows.map((r, i) => <text key={`n${r}`} x={-1} y={P + i * G + 1.5} fontSize="4" textAnchor="middle" fill="#9aa1ae" fontFamily="monospace">{r}</text>)}
      {spec.black?.map((s) => { const { x, y } = xy(s); return <circle key={`b${s}`} cx={x} cy={y} r="4.2" fill="#15171c" stroke="#000" strokeWidth="0.4" />; })}
      {spec.white?.map((s) => { const { x, y } = xy(s); return <circle key={`w${s}`} cx={x} cy={y} r="4.2" fill="#eef0f4" stroke="#8a909c" strokeWidth="0.4" />; })}
      {Object.entries(spec.marks ?? {}).map(([s, m]) => { const { x, y } = xy(s); return <g key={`m${s}`}><circle cx={x} cy={y} r="4.2" fill="#ff5d8f" fillOpacity="0.35" stroke="#ff5d8f" strokeWidth="0.6" /><text x={x} y={y + 1.6} fontSize="4.4" textAnchor="middle" fontWeight="900" fill="#fff">{m}</text></g>; })}
    </svg>
  );
}
const fig = (spec: Spec, label: string) => <OmokCrop spec={spec} label={label} />;

// Legal triples: across, down or diagonal, three empty points next to each other.
const TRIPLES: Spec = { cols: ['E', 'L'], rows: [5, 11], marks: { F10: '1', G10: '2', H10: '3', K9: '1', K8: '2', K7: '3', F7: '1', G6: '2', H5: '3' } };
// The overline trap: your four E8–H8 with the opponent on D8. Winning J8 makes five; winning J8 and K8 makes six.
const OVER: Spec = { cols: ['C', 'M'], rows: [5, 11], black: ['E8', 'F8', 'G8', 'H8'], white: ['D8', 'F9', 'G7', 'H9', 'J7'], marks: { J8: '1', K8: '2', L8: '3' } };
// The decider (you choose): bids 14·1·1 on J8·K8·L8. The opponent cannot reach 14 on J8, so you take it — five.
const WIN: Spec = { cols: ['C', 'M'], rows: [5, 11], black: ['E8', 'F8', 'G8', 'H8', 'J8'], white: ['D8', 'F9', 'G7', 'H9', 'J7', 'K8', 'L8'] };

const guide: GameGuide = {
  game: 'pointOmok',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['blindGomoku', 'flipOmok', 'fourThree', 'wallgo2'],
  ko: {
    meta: {
      title: '포인트 오목 공략 — 배팅·이월 계산, 동점 규칙, 장목 함정까지 | PUZZLTHINK',
      description: '데블스 플랜 3 유배지 최종전 포인트 오목 공략. 세 점 고르기, 10포인트 배팅과 절반 이월 계산(최대 16), 동점은 고르지 않은 사람 편, 6목은 오목이 아닌 이유, 승부처 따라 두기, AI 배팅 성향까지 정리했어요.',
      keywords: ['포인트 오목 공략', '포인트오목 규칙', '포인트 오목 전략', '데블스 플랜 포인트 오목', '배팅 오목', '유배지 최종전', '데블스플랜3 포인트 오목'],
    },
    title: '포인트 오목 공략',
    lead: '돌을 두는 게 아니라, 돌이 놓일 자리를 사요.',
    intro: [
      '포인트 오목은 15×15 판에서 오목을 만드는 게임이지만 돌을 번갈아 두지 않아요. 라운드마다 한 사람이 **한 줄로 이어진 빈 점 세 개**를 고르면, 두 사람이 포인트를 몰래 나눠 걸고, **점마다 더 많이 건 사람의 돌**이 놓여요. 오목 수읽기에 배팅 심리와 포인트 관리가 겹쳐서, 같은 판이라도 지갑 사정에 따라 정답이 달라져요.',
      '이 공략은 포인트 계산을 숫자로 정확히 짚는 데서 시작해요. 이월 규칙으로 모을 수 있는 최대 포인트, 동점 규칙이 고르는 사람에게 주는 부담, 6목이 오목이 아니라서 생기는 함정을 정리하고, 실제 승부처 한 라운드를 따라 둔 뒤 단계별 전략과 AI의 배팅 방식을 다뤄요. 좌표는 판 가장자리 표기와 같이 가로 A~P(I 없음), 세로 1~15(아래부터)예요. 그림의 검은 돌이 나, 흰 돌이 상대예요.',
    ],
    gamePageTitle: '포인트 오목 규칙과 공략',
    summary: '배팅·이월 계산(최대 16), 동점 규칙, 장목 함정, 승부처 따라 두기와 AI 배팅 성향.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '포인트 오목은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '포인트 오목은 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3)의 유배지 최종전으로 나온 게임을 웹으로 옮긴 비공식 팬 게임이에요. 오목의 목표는 그대로지만, 어느 자리에 누구 돌이 놓일지를 포인트 입찰로 정한다는 점이 완전히 달라요.' },
          { type: 'p', text: '그래서 "가장 좋은 자리"를 아는 것만으로는 이길 수 없어요. 그 자리를 상대보다 비싸게 살 포인트가 있어야 하고, 상대가 그 자리를 얼마나 원하는지도 읽어야 해요. 오목을 잘 두는 사람과 배팅을 잘하는 사람이 모두 이길 수 있는 게임이에요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**한 라운드**: 선택 → 배팅 → 착수 순서예요. 첫 라운드 선택자는 무작위이고, 그다음부터는 두 사람이 번갈아 골라요.',
            '**선택**: 선택자는 90초 안에 빈 교차점 세 개를 고르는데, 가로·세로·대각선 중 한 방향으로 **바로 이웃한 세 점**이어야 해요. 떨어진 점이나 꺾인 모양은 안 돼요.',
            '**포인트**: 라운드마다 두 사람 모두 10포인트를 받아요. 여기에 지난 라운드에서 넘어온 포인트가 더해져요.',
            '**배팅**: 90초 안에 세 점에 나눠 걸어요. **한 점에 최소 1**, 정수만 걸 수 있고, 합은 가진 포인트를 넘을 수 없어요. 상대가 건 값은 보이지 않아요.',
            '**착수**: 점마다 더 많이 건 사람의 돌이 놓여요. 같으면 **그 라운드에 고르지 않은 사람**의 돌이에요. 세 돌은 동시에 놓여요.',
            '**이월**: 쓰고 남은 포인트의 **절반(소수점 버림)**만 다음 라운드로 넘어가요.',
            '**승패**: 라운드가 끝났을 때 오목이 있으면 끝나요. 오목 개수가 많은 쪽이 이기고, 같으면 무승부예요. 오목은 **정확히 5목**만 인정하고 6목 이상(장목)은 오목이 아니에요. 더 고를 수 있는 세 점이 없으면 무승부예요.',
          ] },
          { type: 'figure', node: fig(TRIPLES, '고를 수 있는 세 점의 예'), caption: '고를 수 있는 세 점의 예: 가로(F10·G10·H10), 세로(K9·K8·K7), 대각선(F7·G6·H5). 세 점 모두 비어 있고 한 줄로 바로 이웃해야 해요.' },
          { type: 'h3', text: '포인트가 쌓이는 방식' },
          { type: 'table', caption: '매 라운드 최소(1·1·1)만 걸 때와 전부 걸 때', head: ['라운드', '최소만 걸면 (가진 포인트 → 남김 → 이월)', '전부 걸면'], rows: [
            ['1', '10 → 7 남김 → 3 이월', '10 → 0'],
            ['2', '13 → 10 남김 → 5 이월', '10 → 0'],
            ['3', '15 → 12 남김 → 6 이월', '10 → 0'],
            ['4 이후', '16 → 13 남김 → 6 이월 (계속 16)', '10'],
          ] },
          { type: 'p', text: '한 라운드에 최소 3은 써야 하니, 아무리 아껴도 **한 라운드에 쓸 수 있는 포인트는 16이 최대**예요. 상대도 마찬가지라, 상대가 한 점에 걸 수 있는 값은 아무리 많아도 14(나머지 두 점에 1씩)예요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '장목', title: '두 점을 다 가져가면 오히려 오목이 사라져요', body: 'E8~H8에 내 돌 넷이 있고 D8은 상대 돌이에요. J8을 가져가면 E8~J8 정확히 5목이에요. 그런데 같은 라운드에 J8과 **K8까지** 가져가면 E8~K8이 6목(장목)이 되어 오목이 아니에요. 이런 자리에서는 K8에 1만 걸어 일부러 내주는 게 정답일 수 있어요.', figure: fig(OVER, '장목 함정') },
          ] },
          { type: 'cards', items: [
            { title: '같은 라운드에 둘 다 오목이 생기면?', body: '세 돌은 동시에 놓여서 "먼저"가 없어요. 오목 개수로 승부가 나고, 같으면 무승부예요.' },
            { title: '오목 두 개를 한 번에 만들면?', body: '서로 다른 줄의 5목은 각각 하나로 세요. 상대가 하나일 때 내가 둘이면 내가 이겨요.' },
            { title: '0을 걸어 한 점을 포기할 수 있나요?', body: '아니요. 세 점 모두 최소 1이에요. 포기하고 싶은 점에는 1을 걸면 되고, 동점이면 고르지 않은 사람이 가져가요.' },
            { title: '선택 시간이 다 되면?', body: '돌 근처(판이 비어 있으면 가운데 근처)의 세 점이 자동으로 골라져요.' },
            { title: '배팅을 확정하지 못하면?', body: '마지막 순간에 입력해 둔 값 그대로 잠겨요. 아무 값도 보내지 못하면 1·1·1로 걸려요. 세 라운드 연속 시간을 넘기면 패배예요.' },
            { title: '상대가 내 배팅을 미리 볼 수 있나요?', body: '아니요. 배팅은 먼저 암호 지문(해시)으로만 잠그고, 두 사람이 모두 잠근 뒤에 실제 값을 보내요. 게임이 끝나면 모든 배팅이 공개돼요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 아끼는 라운드와 쓰는 라운드',
        blocks: [
          { type: 'p', text: '포인트 오목의 첫 번째 기술은 "모든 라운드를 이기려 하지 않기"예요. 남은 포인트는 절반만 넘어가지만, 그래도 몇 라운드를 아끼면 승부처에서 상대가 따라올 수 없는 금액을 걸 수 있어요.' },
          { type: 'list', items: [
            '**조용한 라운드는 1·1·1**: 오목과 상관없는 세 점이 나왔다면 최소만 걸어요. 세 돌을 내줘도 그 돌이 위협이 되지 않는다면 손해가 아니에요.',
            '**3목·4목이 걸린 점에는 크게**: 상대 돌이 이어지는 자리나 내 줄이 길어지는 자리가 나오면, 그 한 점에 몰아서 거세요. 나머지 두 점은 1씩이면 충분해요.',
            '**고르는 사람은 동점에서 져요**: 내가 세 점을 골랐다면 같은 값은 상대 돌이에요. 꼭 가져야 하는 점에는 상대가 걸 수 있는 최대보다 1이라도 더 걸어야 해요.',
            '**고를 때는 내 승부처를 넣기**: 선택자는 상대가 원하지 않는 자리도 고를 수 있어요. 내가 만들고 싶은 줄의 다음 점을 세 점에 넣으면, 상대는 그걸 막느라 포인트를 써야 해요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 두기 — 모아 둔 포인트로 끝내기',
        lead: '세 라운드를 아끼고, 네 번째 라운드에 승부를 거는 흐름이에요.',
        blocks: [
          { type: 'steps', items: [
            { title: '준비: 1~3라운드 아끼기', body: '앞선 라운드에서 E8~H8 넉 점을 모았고, 그사이 조용한 라운드에서는 1·1·1만 걸었어요. 내 포인트는 16, 상대는 공격적으로 써서 13이라고 해 볼게요(상대 값은 보이지 않지만, 지난 결과로 범위를 셀 수 있어요).' },
            { title: '선택: 내 차례에 J8을 넣기', body: '이번 라운드는 내가 고를 차례예요. J8·K8·L8을 골랐어요. J8은 내 5목 자리, K8은 장목 함정, L8은 의미 없는 점이에요.', figure: fig(OVER, 'J8·K8·L8 고르기') },
            { title: '배팅: 14·1·1', body: 'J8에 14, K8과 L8에 1씩 걸어요. 동점은 상대 편이니 상대가 J8을 막으려면 14 이상이 필요한데, 13으로는 한 점에 11까지밖에 못 걸어요(나머지 두 점에 1씩). K8은 1 대 1이면 상대가 가져가니, 오히려 장목을 피할 수 있어요.' },
            { title: '착수: J8은 내 것, 5목', body: 'J8에 내 돌이 놓여 E8~J8 정확히 5목. K8·L8은 상대 돌이라 장목이 되지 않아요. 라운드가 끝나는 순간 오목 1 대 0으로 승리예요.', figure: fig(WIN, '승부처 결과') },
          ] },
          { type: 'callout', tone: 'note', title: '상대가 16을 모아 두었다면', text: '상대도 16이 있었다면 J8에 14를 걸어 동점이 되고, 동점은 고르지 않은 상대의 돌이에요. 그래서 승부처에서는 **상대 포인트의 최대치를 세는 일**이 가장 중요해요. 상대가 지난 라운드에 어떤 점을 가져갔는지 보면 최소 얼마를 썼는지 알 수 있어요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 상대 포인트 범위 세기',
        blocks: [
          { type: 'p', text: '상대의 배팅은 보이지 않지만, 돌이 어디에 놓였는지는 보여요. 그 결과와 지급·이월 규칙만으로 상대 포인트의 범위를 꽤 정확히 좁힐 수 있어요.' },
          { type: 'list', items: [
            '**가져간 점 = 나 이상을 건 점**: 상대가 가져간 점에는 상대가 나보다 많이(상대가 고르지 않은 라운드라면 같거나 많이) 걸었다는 뜻이에요. 내가 그 점에 건 값이 상대 지출의 하한이 돼요.',
            '**지출 하한 → 이월 상한**: 상대가 최소 얼마를 썼는지 알면, 남은 포인트의 상한과 다음 라운드 이월의 상한이 나와요. 이걸 매 라운드 이어 가면 상대 최대 포인트가 보여요.',
            '**16은 넘지 않아요**: 아무리 아껴도 한 라운드 최대 16이라, 내가 16을 모은 상태에서 고르지 않은 쪽이라면 한 점에 14를 걸어 동점을 만들어도 내가 가져가요.',
            '**고르는 라운드와 고르지 않는 라운드를 구분하기**: 동점이 내 편인 라운드(상대가 고른 라운드)가 승부를 걸기 더 유리해요. 내가 고르는 라운드에는 상대가 막아야만 하는 점을 넣어 상대 포인트를 빼는 데 쓰세요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 세 점의 조합 설계',
        blocks: [
          { type: 'p', text: '고급 단계에서는 세 점을 "하나의 묶음"으로 봐요. 세 점이 각각 누구 것이 되느냐에 따라 2×2×2 = 8가지 결과가 나오는데, 좋은 선택은 그중 상대에게 좋은 결과가 적은 묶음이에요.' },
          { type: 'list', items: [
            '**두 개의 위협을 한 묶음에**: 세 점 안에 내 4목 자리가 둘 들어 있으면, 상대는 두 점 모두에 크게 걸어야 막을 수 있어요. 한 점만 막으면 다른 점에서 끝나요.',
            '**상대 위협은 다른 점과 묶어서 비싸게**: 내가 골라야 하는데 상대 위협 자리를 피할 수 없다면, 그 점과 함께 상대가 막아야 하는 내 자리를 넣어 상대의 포인트를 둘로 나누게 하세요.',
            '**장목 경계**: 내 4목 끝의 두 칸이 한 묶음에 들어가면 둘 다 가져가는 순간 장목이에요. 이런 묶음에서는 끝점이 아닌 쪽에 1만 걸어 일부러 내주세요. 상대가 이를 노려 그 점에 1을 걸 수도 있으니, 동점이 누구 편인지 꼭 확인하세요.',
            '**막는 돌도 내 줄이 된다**: 상대 줄을 막으려고 산 돌이 내 다른 줄과 이어지면 한 번에 두 가지 일을 해요. 막을 자리를 고를 수 있다면 내 돌과 가까운 쪽을 고르세요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**매 라운드 전부 걸기**: 이월이 0이 되어 늘 10으로만 싸워요. 상대가 아껴 둔 승부처에서 막을 수 없어요.',
            '**동점 규칙 잊기**: 내가 고른 라운드에 상대와 같은 값을 걸면 상대 돌이에요. "한 점만 더"의 1이 승부를 갈라요.',
            '**장목 만들기**: 4목 양쪽 끝을 둘 다 사면 6목이 되어 오목이 사라져요.',
            '**상대 4목을 늦게 막기**: 상대가 고르는 라운드에 그 끝점이 나오면 이미 늦을 수 있어요. 3목일 때부터 막을 자리를 사 두세요.',
            '**고를 때 아무 세 점이나**: 선택권은 이 게임의 가장 큰 무기예요. 시간이 지나 자동으로 골라지게 두면 그 무기를 버리는 셈이에요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI 난이도와 배팅 성향, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국', '보통과 어려움 두 난이도예요. AI는 판, 지난 라운드 결과, 자기 배팅만 보고 정해요. 내 배팅이나 남은 포인트는 보지 않아요.'],
            ['보통', '세 점마다 판에 미치는 값을 계산해 그 비율대로 나눠 걸어요. 오목이 걸린 승부처에서는 가진 포인트를 다 써요.'],
            ['어려움', '지급·이월 규칙과 지난 결과로 내 포인트 범위를 추정하고, 그 범위에서 내가 걸 법한 값을 수백 번 뽑아 기대값이 가장 높은 배팅을 골라요. 남겨서 넘길 포인트의 가치도 같이 계산해요.'],
            ['배팅 성향', '판마다 균형형·저축형·공격형·저격형(한 점에 몰기)·분산형·변칙형 중 하나가 무작위로 정해지고, 일곱 라운드에 한 번꼴로 다른 성향이 섞여요. 승부처에서는 어떤 성향이든 이기는 쪽으로 걸어요. 이번 성향은 게임이 끝나면 알려 줘요.'],
            ['친구 방', '링크나 4자리 코드로 1:1 방을 만들어요. 배팅은 해시로 먼저 잠그고 둘 다 잠근 뒤에 공개돼서, 상대가 미리 볼 수 없어요. 오픈 방으로 처음 보는 사람과도 대결할 수 있어요.'],
            ['시간', '선택과 배팅 모두 90초예요. 세 라운드 연속 시간을 넘기면 패배예요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '선택자', def: '그 라운드에 세 점을 고르는 사람. 라운드마다 번갈아 맡고, 동점에서 져요.' },
            { term: '세 점', def: '가로·세로·대각선 한 방향으로 바로 이웃한 빈 교차점 세 개.' },
            { term: '배팅', def: '세 점에 포인트를 나눠 거는 것. 한 점에 최소 1, 정수만.' },
            { term: '이월', def: '쓰고 남은 포인트의 절반(소수점 버림)이 다음 라운드로 넘어가는 것.' },
            { term: '장목', def: '6개 이상 이어진 돌. 오목으로 치지 않아요.' },
            { term: '승부처', def: '오목이 완성되거나 막히는 점이 세 점에 들어간 라운드.' },
            { term: '해시 잠금', def: '배팅 값을 숨긴 채 먼저 잠그는 암호 지문. 나중에 공개된 값과 같은지 확인할 수 있어요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '포인트 오목은 어떤 게임인가요?', a: '데블스 플랜 시즌 3 유배지 최종전으로 나온 오목 변형이에요. 고른 세 점에 포인트를 몰래 나눠 걸어 더 많이 건 사람의 돌이 놓이고, 오목을 만들면 이겨요.' },
      { q: '남은 포인트는 어떻게 되나요?', a: '절반(소수점 버림)만 다음 라운드로 넘어가요. 예를 들어 3·1·1을 걸어 5가 남으면 2가 넘어가서 다음 라운드는 12포인트예요. 아무리 아껴도 한 라운드 최대 16이에요.' },
      { q: '같은 포인트를 걸면 누구 돌인가요?', a: '그 라운드에 세 점을 고르지 않은 사람의 돌이 놓여요.' },
      { q: '6목도 오목인가요?', a: '아니요. 정확히 5목만 오목이에요. 6목 이상(장목)은 오목으로 치지 않아요.' },
      { q: 'AI가 내 배팅을 보나요?', a: '아니요. AI는 판, 지난 라운드 결과, 자기 배팅만 보고 정해요. 어려움 AI는 지급·이월 규칙과 지난 결과로 내 포인트 범위를 추정해서 걸어요.' },
      { q: '몇 명이 할 수 있나요?', a: '1:1 게임이에요. AI와 혼자, 친구와 링크·4자리 코드로, 또는 오픈 방에서 처음 보는 사람과 대결할 수 있어요.' },
    ],
    cta: { title: '포인트를 모아 볼까요?', body: '조용한 라운드에 1·1·1을 걸어 16까지 모아 보세요. 승부처의 한 점을 확실히 사는 감각이 생겨요.', button: '포인트 오목 하러 가기' },
    disclaimer: '포인트 오목은 방송에 소개된 게임 방식에서 착안해 PUZZLTHINK가 웹용으로 다시 만든 것으로, 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Point Omok strategy guide — bidding, carry-over, ties and the overline trap | PUZZLTHINK',
      description: 'A guide to Point Omok from The Devil’s Plan 3: choosing three points, bidding 10 points a round with half carried over (16 at most), ties going to the player who did not choose, why six in a row is not a five, a deciding round and the AI’s bidding styles.',
      keywords: ['Point Omok strategy', 'Point Omok rules', 'Devil’s Plan point omok', 'bidding gomoku', 'Devil’s Plan 3 exile final', 'point gomoku'],
    },
    title: 'Point Omok strategy guide',
    lead: 'You don’t place stones — you buy the points they land on.',
    intro: [
      'Point Omok is about making five in a row on a 15×15 board, but nobody takes turns placing stones. Each round one player picks **three empty points in a row**, both players secretly split points over them, and **each point gets the stone of whoever bid more on it.** Gomoku reading meets bidding psychology and budgeting, so the right move on the same board depends on what is in your purse.',
      'This guide starts by getting the point arithmetic exactly right: the most you can ever save up, the burden the tie rule puts on the chooser and the trap created by six in a row not counting. Then it plays out a deciding round and covers strategy by level and how the AI bids. Coordinates follow the board edge: columns A–P (no I) and rows 1–15 from the bottom. Black stones are you, white the opponent.',
    ],
    gamePageTitle: 'Point Omok — rules and strategy',
    summary: 'Bidding and carry-over (16 at most), the tie rule, the overline trap, a deciding round and AI bidding styles.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Point Omok?',
        blocks: [
          { type: 'p', text: 'Point Omok is an unofficial fan version of the exile final in Netflix’s The Devil’s Plan: Dead Again (season 3). The goal is gomoku’s, but who gets each point is settled by a bid, which changes everything.' },
          { type: 'p', text: 'Knowing the best point is not enough: you need the points to outbid the opponent for it, and you need to read how badly they want it. Strong gomoku players and strong bidders can both win.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**A round**: choose → bid → place. The first chooser is drawn at random; after that the players take turns choosing.',
            '**Choosing**: within 90 seconds the chooser picks three empty intersections that are **right next to each other in one line** — across, down or diagonal. Gaps and bends are not allowed.',
            '**Points**: each round both players receive 10 points, added to whatever was carried over.',
            '**Bidding**: within 90 seconds, split your points over the three points — **at least 1 on each**, whole numbers, no more than you have. The opponent’s bids are hidden.',
            '**Placing**: each point gets the stone of whoever bid more. On a tie it goes to **the player who did not choose this round**. The three stones land together.',
            '**Carry-over**: **half of what you did not spend (rounded down)** goes on to the next round.',
            '**Result**: if there is a five at the end of a round, the game ends: more fives wins, equal fives is a draw. A five is **exactly five** in a row; six or more (an overline) is not a five. If no three empty points in a row remain, it is a draw.',
          ] },
          { type: 'figure', node: fig(TRIPLES, 'Examples of legal triples'), caption: 'Legal triples: across (F10·G10·H10), down (K9·K8·K7) and diagonal (F7·G6·H5). All three empty, all next to each other in one line.' },
          { type: 'h3', text: 'How points build up' },
          { type: 'table', caption: 'Bidding the minimum (1·1·1) every round versus bidding everything', head: ['Round', 'Minimum bids (have → left → carried)', 'Bid everything'], rows: [
            ['1', '10 → 7 left → 3 carried', '10 → 0'],
            ['2', '13 → 10 left → 5 carried', '10 → 0'],
            ['3', '15 → 12 left → 6 carried', '10 → 0'],
            ['4 on', '16 → 13 left → 6 carried (stays 16)', '10'],
          ] },
          { type: 'p', text: 'You must spend at least 3 a round, so however much you save, **16 is the most you can ever have in a round.** The same holds for the opponent: the most they can put on one point is 14 (with 1 on each of the other two).' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations — what happens if…',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'OVERLINE', title: 'Winning both points can erase your five', body: 'You have four on E8–H8 and the opponent sits on D8. Take J8 and E8–J8 is exactly five. But take J8 **and K8** in the same round and E8–K8 is six — an overline, which is not a five. Here the right bid may be just 1 on K8, giving it away on purpose.', figure: fig(OVER, 'The overline trap') },
          ] },
          { type: 'cards', items: [
            { title: 'Both make a five in the same round?', body: 'The three stones land together, so nobody is first. The number of fives decides; equal is a draw.' },
            { title: 'Two fives at once?', body: 'Fives on different lines count separately. Two against one wins.' },
            { title: 'Can I bid 0 to give up a point?', body: 'No, every point needs at least 1. Bid 1 on the point you are giving up; on a tie, the player who did not choose takes it.' },
            { title: 'The chooser runs out of time?', body: 'Three points next to the stones (near the centre on an empty board) are picked automatically.' },
            { title: 'I don’t lock my bid in time?', body: 'At the last second your draft is locked as it stands. If no bid arrives at all, it is 1·1·1. Three rounds in a row on the clock lose the match.' },
            { title: 'Can the opponent see my bid early?', body: 'No. Bids are first locked as a cryptographic fingerprint (a hash), and the real values are sent only once both are locked. Every bid is revealed when the game ends.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — rounds to save, rounds to spend',
        blocks: [
          { type: 'p', text: 'The first skill in Point Omok is not trying to win every round. Only half your leftover carries over, but a few saved rounds still let you bid an amount the opponent cannot match when it matters.' },
          { type: 'list', items: [
            '**Quiet rounds: 1·1·1**: if the three points have nothing to do with any five, bid the minimum. Giving away three stones costs nothing if they threaten nothing.',
            '**Go big where threes and fours are at stake**: when a point extends their line or yours, pile onto that one point. One each on the other two is enough.',
            '**The chooser loses ties**: if you chose, equal bids give the stone to the opponent. On a point you must have, bid at least one more than the most they can bid.',
            '**Choose your own decider**: the chooser can include points the opponent does not want. Put the next point of your line in the triple and they must spend to stop it.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Play along — finishing with saved points',
        lead: 'Save for three rounds, then stake everything on the fourth.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Setup: save in rounds 1–3', body: 'You have collected E8–H8 in earlier rounds and bid only 1·1·1 in the quiet ones. You hold 16; say the opponent spent freely and holds 13 (you cannot see it, but you can bound it from past results).' },
            { title: 'Choose: put J8 in the triple', body: 'It is your turn to choose. You pick J8·K8·L8: J8 is your five, K8 is the overline trap and L8 is irrelevant.', figure: fig(OVER, 'Choosing J8·K8·L8') },
            { title: 'Bid: 14·1·1', body: '14 on J8, 1 each on K8 and L8. Ties go to the opponent, so they need 14 or more on J8 to stop you — but with 13 they can put at most 11 on one point (1 on each of the others). K8 at 1 against 1 goes to them, which keeps you clear of the overline.' },
            { title: 'Place: J8 is yours — five', body: 'Your stone lands on J8: E8–J8 is exactly five. K8 and L8 are white, so there is no overline. At the end of the round it is one five to none: you win.', figure: fig(WIN, 'The deciding round') },
          ] },
          { type: 'callout', tone: 'note', title: 'If the opponent had saved 16', text: 'With 16 they could match your 14 on J8, and a tie goes to the player who did not choose — them. That is why, at the decider, **counting the opponent’s maximum** matters most. The points they took in earlier rounds tell you the least they must have spent.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — bounding the opponent’s points',
        blocks: [
          { type: 'p', text: 'The opponent’s bids are hidden, but where their stones landed is not. From those results and the grant and carry rules you can narrow their points down quite precisely.' },
          { type: 'list', items: [
            '**A point they took = a point they bid at least as much on**: they bid more than you there (or equal, in a round they did not choose). Your bid on that point is a floor on their spending.',
            '**Spending floor → carry ceiling**: knowing the least they spent gives the most they could have left, and so the most they carried. Chain that round by round and their maximum appears.',
            '**Never above 16**: nobody can have more than 16 in a round. With 16 yourself, in a round you did not choose, 14 on one point wins even if they tie it.',
            '**Choosing rounds versus non-choosing rounds**: rounds where ties go your way (the opponent chose) are better for your decider. In rounds you choose, include points they must defend, to drain their points.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — designing the triple',
        blocks: [
          { type: 'p', text: 'At the advanced level, look at the triple as one package. Who gets each of the three points gives 2×2×2 = 8 outcomes; a good choice is a triple with few outcomes that are good for the opponent.' },
          { type: 'list', items: [
            '**Two threats in one triple**: if the triple holds two points that would complete a four of yours, they must bid big on both. Stop only one and you finish on the other.',
            '**Make their threat expensive by pairing it**: if you must choose and cannot avoid their threat point, add one of your own that they must stop, so their points are split two ways.',
            '**Watch the overline**: if both ends of your four are in one triple, taking both makes six. Bid 1 on the end you do not need and give it away. The opponent may also bid 1 there to steer the outcome, so check whom ties favour.',
            '**Blocking stones build lines too**: a stone bought to stop their line can join one of yours. If you can choose where to block, pick the side next to your stones.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Bidding everything every round**: you carry nothing and always fight with 10. When the opponent cashes in saved points, you cannot stop them.',
            '**Forgetting the tie rule**: in a round you chose, matching their bid gives them the stone. One extra point decides games.',
            '**Making an overline**: buy both ends of a four and you have six — no five.',
            '**Blocking their four too late**: if its end point turns up in a round they choose, it may be too late. Start buying blocks while it is a three.',
            '**Choosing carelessly**: the choice is your biggest weapon. Letting the clock choose for you throws it away.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI levels, bidding styles and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games', 'Two levels, Normal and Hard. The AI sees the board, past round results and its own bids — never your bids or your points.'],
            ['Normal', 'Works out what each point is worth on the board and splits its bid in proportion. When a five is at stake it spends everything.'],
            ['Hard', 'Bounds your points from the grant and carry rules and past results, samples hundreds of bids you might make within that range, and plays the split with the best expected value — including what the points it carries over are worth.'],
            ['Bidding styles', 'Each game draws one style at random — balanced, saver, aggressive, sniper (piles onto one point), spread or bluffer — and about one round in seven mixes in another. At a decider every style bids to win. The style is shown when the game ends.'],
            ['Friend rooms', 'Create a 1:1 room with a link or 4-digit code. Bids are locked by hash first and revealed only when both are locked, so nobody sees the other’s early. Open rooms let you play strangers.'],
            ['Clocks', '90 seconds to choose and 90 to bid. Three rounds in a row on the clock lose the match.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Chooser', def: 'The player who picks the three points this round. The role alternates, and the chooser loses ties.' },
            { term: 'Triple', def: 'Three empty intersections right next to each other in one line.' },
            { term: 'Bid', def: 'Splitting points over the triple: at least 1 each, whole numbers.' },
            { term: 'Carry-over', def: 'Half of the unspent points (rounded down) moving on to the next round.' },
            { term: 'Overline', def: 'Six or more stones in a row. It does not count as a five.' },
            { term: 'Decider', def: 'A round whose triple includes a point that completes or blocks a five.' },
            { term: 'Hash lock', def: 'A fingerprint that locks a bid without showing it; the revealed bid can be checked against it later.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is Point Omok?', a: 'A gomoku variant from the exile final of The Devil’s Plan season 3. Players secretly split points over three chosen points, the higher bid gets its stone on each, and a five wins.' },
      { q: 'What happens to points I don’t spend?', a: 'Half of them (rounded down) carry over. Bid 3·1·1 and keep 5, and 2 carry over, so next round you have 12. However much you save, 16 is the most you can have in a round.' },
      { q: 'Who gets the stone on a tie?', a: 'The player who did not choose the three points that round.' },
      { q: 'Is six in a row a five?', a: 'No. Only exactly five counts; six or more (an overline) does not.' },
      { q: 'Does the AI see my bids?', a: 'No. It decides from the board, past round results and its own bids. The Hard AI bounds your points from the grant and carry rules and past results.' },
      { q: 'How many players?', a: 'It is 1:1: against the AI, with a friend by link or 4-digit code, or against a stranger in an open room.' },
    ],
    cta: { title: 'Ready to save up?', body: 'Bid 1·1·1 in quiet rounds until you reach 16. You will feel what it is like to buy the one point that matters.', button: 'Play Point Omok' },
    disclaimer: 'Point Omok is an unofficial fan remake by PUZZLTHINK, inspired by the game shown on the programme; it is not affiliated with the broadcaster or producers.',
  },
};

export default guide;
