// 4인 3목 guide. Rules and numbers follow src/lib/fourThree.ts (4×4, HAND 5, MAX_HEIGHT 3, place anywhere below
// height 3 or move a top piece to one of the 8 neighbours, lines seen from above, LINES = 24, two colours at once =
// nobody scores, PLY_CAP 120, roundOrder rotating the first colour, ROUNDS 4, WIN_REWARD 3, the single AI strength:
// max-n 5 actions deep, allies never leave the guest a ready line) and src/lib/fourThreeRoom.ts (TURN 90/60/30 s,
// a timeout passes the turn, the guest is always an AI at a random colour (never you in solo), mission = every round
// won by a player, finalists = top two by pieces, ties at second go through, never with zero; roomAway: 20 s away or
// two missed turns hand the seat to an AI), plus the FourThreeGuide messages.
// Cells are named as in the game (CELL_NAME): columns A–D left to right, rows 1–4 from the top.
import { CELLS, LINES } from '@/lib/fourThree';
import type { GameGuide } from './types';

const COLORS = ['#ff4d5e', '#ffc93c', '#3ddc84', '#3f8cff']; // red, yellow, green, blue
const GUEST = 3; // blue is the guest in these pictures
const NAMES = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2', 'A3', 'B3', 'C3', 'D3', 'A4', 'B4', 'C4', 'D4'];
type Spec = { cells: Partial<Record<string, number[]>>; hot?: string[]; line?: string[] }; // stacks bottom → top

function FtMini({ spec, label }: { spec: Spec; label: string }) {
  return (
    <div role="img" aria-label={label} className="mx-auto grid w-full max-w-[200px] grid-cols-4 gap-1 rounded-xl border border-white/15 bg-[#0d0f16] p-2">
      {NAMES.map((name) => {
        const stack = spec.cells[name] ?? [];
        const top = stack[stack.length - 1];
        const cls = spec.line?.includes(name) ? 'border-white/80' : spec.hot?.includes(name) ? 'border-dashed border-[#ffc93c]' : 'border-white/10';
        return (
          <div key={name} className={`relative flex aspect-square items-center justify-center rounded-md border bg-white/[0.03] ${cls}`}>
            <span className="absolute left-0.5 top-0 font-mono text-[7px] text-white/30">{name}</span>
            {top !== undefined && (
              <span className="flex items-center justify-center rounded-full text-[10px] font-black text-black/70" style={{ background: COLORS[top], width: `${44 + stack.length * 12}%`, height: `${44 + stack.length * 12}%` }}>
                {top === GUEST ? '★' : stack.length > 1 ? stack.length : ''}
              </span>
            )}
            {stack.length > 1 && <span className="absolute bottom-0.5 right-0.5 flex gap-px">{stack.slice(0, -1).map((c, i) => <i key={i} className="block h-1.5 w-1.5 rounded-full" style={{ background: COLORS[c] }} />)}</span>}
          </div>
        );
      })}
    </div>
  );
}
const fig = (spec: Spec, label: string) => <FtMini spec={spec} label={label} />;

// Lines through each cell, from the game's own LINES table.
const LINES_THROUGH = Array.from({ length: CELLS }, (_, i) => LINES.filter((l) => l.includes(i)).length);
const COUNT: Spec = { cells: {}, hot: NAMES.filter((_, i) => LINES_THROUGH[i] === 7) };
// Stacking: a red piece on a yellow one (B2), and a three-high stack on C3 that nobody can add to.
const STACK: Spec = { cells: { B2: [1, 0], C3: [3, 2, 1], A1: [0] } };
// The guest (★ blue) has B2 and C2: A2 and D2 would both complete a line. Covering C2 stops both.
const PAIR: Spec = { cells: { B2: [3], C2: [3], A3: [0], C4: [1] }, hot: ['A2', 'D2'] };
const COVERED: Spec = { cells: { B2: [3], C2: [3, 0], A3: [0], C4: [1] } };
// Lifting trap: your red on B2 sits on a guest piece. A1 and C3 are the guest's, so moving B2 away reveals A1–B2–C3.
const LIFT: Spec = { cells: { A1: [3], B2: [3, 0], C3: [3], D1: [2], B4: [1] }, line: ['A1', 'B2', 'C3'] };
// A shared line: red moves its piece B1 → C2, completing A2–B2–C2, and the green piece it uncovers on B1 completes
// A1–B1–C1 in the same action — the round ends with nobody scoring.
const SHARED: Spec = { cells: { A1: [2], B1: [2], C1: [2], A2: [0], B2: [0], C2: [0] }, line: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2'] };

const guide: GameGuide = {
  game: 'fourThree',
  origin: { kind: 'show', show: 'dp1' },
  updated: '2026-11-26',
  related: ['russianJanggi', 'blindGomoku', 'pointOmok', 'nineMensMorris'],
  ko: {
    meta: {
      title: '4인 3목 공략 — 쌓기·옮기기 규칙, 스페셜 게스트 막기, 결승 진출 계산 | PUZZLTHINK',
      description: '데블스 플랜 시즌 1 상금 매치 4인 3목 공략. 4×4 판의 24줄과 가운데 4칸, 쌓기·옮기기 규칙, 말을 들면 드러나는 3목, 동시 3목 처리, 스페셜 게스트 막는 덮기 수비, 피스 계산과 결승 진출 조건까지 정리했어요.',
      keywords: ['4인 3목 공략', '4인3목 규칙', '데블스 플랜 4인 3목', '스페셜 게스트', '사인 삼목', '데블스플랜 상금 매치'],
    },
    title: '4인 3목 공략',
    lead: '셋은 한편이면서 경쟁자, 하나는 모두의 적이에요.',
    intro: [
      '4인 3목은 4×4 판에서 네 명이 말을 놓고, 쌓고, 옮기며 **위에서 봤을 때 같은 색 3개를 한 줄로** 만드는 게임이에요. 네 명 중 셋은 플레이어, 하나는 스페셜 게스트예요. 플레이어들은 라운드를 이겨 피스를 모으는 경쟁자이면서, 네 라운드 동안 게스트가 3목을 한 번도 못 만들게 막아야 하는 한 팀이기도 해요.',
      '이 공략은 작은 판의 구조부터 숫자로 정리해요. 24개의 줄, 줄이 가장 많이 지나가는 가운데 4칸, 쌓기와 옮기기에서 생기는 함정을 그림으로 보고, 게스트를 막는 수비와 피스를 챙기는 공격 사이의 균형, 결승 진출 계산, AI의 특징을 다뤄요. 칸 이름은 게임과 같이 가로 A~D(왼쪽부터), 세로 1~4(위에서부터)예요. 그림의 ★가 게스트 말이고, 칸 오른쪽 아래 작은 점은 아래에 깔린 말이에요.',
    ],
    gamePageTitle: '4인 3목 규칙과 공략',
    summary: '24줄과 가운데 4칸, 쌓기·옮기기 함정, 게스트 막는 덮기, 피스와 결승 진출 계산.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '4인 3목은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '4인 3목은 넷플릭스 「데블스 플랜」 시즌 1 6일차 상금 매치로 나온 게임이에요. 틱택토처럼 3목을 만들지만, 판이 4×4이고 네 명이 함께 두며 말을 쌓고 옮길 수 있어서 판이 쉴 새 없이 바뀌어요.' },
          { type: 'p', text: '방송에서는 누가 게스트인지 숨겨졌지만, PUZZLTHINK에서는 게임 시작 때 게스트의 색을 공개하고 게스트 말에 ★를 표시해요. 게스트는 늘 AI가 맡아요. 혼자 하면 나와 아군 AI 둘, 게스트 AI 하나가 한 판을 이뤄요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판과 말**: 4×4 판에서 빨강·노랑·초록·파랑 네 명이 말 5개씩 들고 시작해요. 셋은 플레이어, 하나는 스페셜 게스트(AI)예요.',
            '**순서**: 빨강→노랑→초록→파랑 순서로 두고, 라운드마다 첫 차례가 다음 색으로 넘어가요. 네 라운드면 모든 색이 한 번씩 먼저 둬요.',
            '**한 차례**: ① 손에 있는 말 하나를 아무 칸에 **놓거나**(다른 말 위도 돼요), ② 판에서 맨 위에 보이는 내 말 하나를 이웃한 8칸 중 한 곳으로 **옮겨요**. 어느 쪽이든 도착 칸은 3층 미만이어야 해요.',
            '**3목**: 위에서 봤을 때 같은 색 3개가 가로·세로·대각선으로 이어지면 라운드가 끝나요. 그 한 명이 이기면 피스 3개를 받아요. **한 수로 두 명 이상의 3목이 동시에 보이면** 라운드는 끝나지만 아무도 피스를 받지 못해요.',
            '**넘기기**: 둘 수 있는 수가 없거나 시간(한 차례 90·60·30초)이 지나면 차례가 넘어가요. 120수(넘김 포함)가 지나도 3목이 없으면 승자 없이 끝나요.',
            '**미션**: 네 라운드 모두 플레이어 중 누군가가 이겨야 미션 성공이에요. 게스트가 3목을 만들거나(다른 사람과 동시여도), 승자 없이 끝난 라운드가 하나라도 있으면 미션 실패예요.',
            '**결승 진출과 승리**: 네 라운드 뒤 피스가 많은 플레이어 2명이 결승에 진출해요(2위 동점은 모두 진출, 피스 0개는 진출 못 해요). **미션 성공 + 결승 진출**을 모두 이루면 승리예요.',
          ] },
          { type: 'cards', items: [
            { title: '쌓기', body: 'B2는 노랑 위에 빨강이 올라가 위에서는 빨강으로 보여요. C3는 이미 3층이라 더는 놓거나 옮길 수 없어요. 맨 아래 말은 위의 말이 떠나야 다시 보여요.', figure: fig(STACK, '말 쌓기') },
            { title: '줄이 지나가는 수', body: '4×4 판에는 3칸짜리 줄이 24개 있어요. 모서리 칸은 3줄, 변의 칸은 4줄, 가운데 B2·C2·B3·C3는 7줄이 지나가요(점선 칸). 가운데를 쥔 색이 가장 많은 줄에 관여해요.', figure: fig(COUNT, '줄이 가장 많은 가운데 4칸') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 상황 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '드러나는 3목', title: '말을 들었더니 게스트 3목이 열렸어요', body: 'B2에서 내 빨강 말이 게스트 말 위에 올라가 있고, A1과 C3도 게스트 말이에요. 지금은 대각선이 내 말 때문에 끊겨 있지만, B2의 빨강을 다른 칸으로 옮기는 순간 아래의 ★가 드러나 A1–B2–C3 게스트 3목이 완성되고 미션이 실패해요. 게스트 말 위에 올라간 내 말은 "마개"라고 생각하고 함부로 옮기지 마세요.', figure: fig(LIFT, '들면 드러나는 게스트 3목') },
            { tag: '동시 3목', title: '두 색이 한꺼번에 3목이면 아무도 못 받아요', body: '빨강이 초록 말을 덮고 있던 B1의 말을 C2로 옮겨 A2–B2–C2를 만들었어요. 그런데 B1에서 드러난 초록 때문에 A1–B1–C1도 같은 수에 완성돼요. 두 색의 3목이 동시에 보이니 라운드는 끝나지만 피스는 아무도 받지 못해요. 게스트가 끼지 않았으니 미션은 이어져요. 게스트가 끼어 있으면 미션 실패예요.', figure: fig(SHARED, '두 색이 동시에 3목') },
          ] },
          { type: 'cards', items: [
            { title: '남의 말을 옮길 수 있나요?', body: '아니요. 옮길 수 있는 건 맨 위에 보이는 내 말뿐이에요. 내 말이 다른 말 아래에 깔려 있으면 그 말은 위가 비기 전까지 못 움직여요.' },
            { title: '말을 옮겼더니 남의 3목이 생기면?', body: '옮긴 자리 아래에서 드러난 말로 다른 사람의 3목이 완성되면, 그 사람이 라운드를 이겨요(한 명뿐이라면).' },
            { title: '말 5개를 다 놓으면?', body: '그 뒤로는 옮기기만 할 수 있어요. 옮길 수 있는 말이 없으면 차례를 넘겨요.' },
            { title: '플레이어 둘이 동시에 3목이면 미션은?', body: '게스트가 없으면 미션은 이어져요. 다만 그 라운드는 아무도 피스를 받지 못해요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 게스트부터, 그다음 내 줄',
        blocks: [
          { type: 'p', text: '이 게임에서 가장 비싼 실수는 게스트에게 3목 한 번을 내주는 거예요. 그 순간 미션이 실패해서, 피스를 아무리 모아도 이길 수 없어요. 그래서 입문 단계에서는 매 차례 아래 순서로 판을 보세요.' },
          { type: 'list', ordered: true, items: [
            '**게스트가 다음 차례에 3목을 만들 수 있나?** 게스트 말 두 개가 놓인 줄의 남은 칸, 그리고 게스트가 옮겨서 채울 수 있는 칸까지 확인해요.',
            '**내가 지금 3목을 만들 수 있나?** 있다면 그게 가장 좋은 수비이기도 해요. 라운드가 바로 끝나니까요.',
            '**내 수가 무엇을 드러내나?** 옮기기라면, 들어 올리는 말 아래에 누구 말이 있는지 확인해요.',
          ] },
          { type: 'cards', items: [
            { tag: '덮기', title: '게스트 둘은 하나를 덮어요', body: '게스트가 B2·C2를 가지면 A2와 D2 두 칸이 모두 3목 자리예요. 한 칸만 막으면 다른 칸이 남아요.', figure: fig(PAIR, '게스트의 두 칸 위협') },
            { tag: '덮기', title: 'C2 위에 놓으면 두 위협이 한 번에', body: 'C2의 게스트 말 위에 내 말을 놓으면 위에서 보이는 색이 빨강이 되어 A2–B2–C2와 B2–C2–D2 두 줄이 동시에 끊겨요. 빈칸을 막는 것보다 덮는 게 훨씬 강해요.', figure: fig(COVERED, '게스트 말을 덮은 모습') },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 막으면서 피스 챙기기',
        blocks: [
          { type: 'p', text: '아군 AI도 피스를 노려요. 게스트만 막다 보면 아군이 라운드를 가져가고, 미션은 성공해도 나는 결승에 못 가요. 중급부터는 "막는 수 중에서 내 줄도 키우는 수"를 찾는 게 핵심이에요.' },
          { type: 'list', items: [
            '**가운데 덮기**: 가운데 4칸은 7줄이 지나가요. 게스트나 경쟁자의 가운데 말을 덮으면 그 줄들을 끊으면서 내 줄 7개에 한 번에 관여해요.',
            '**손에 든 말을 아끼기**: 새 말은 판 어디에나 놓을 수 있어서 가장 좋은 막기 카드예요. 초반에 다 쓰면 후반에는 이웃 칸으로 옮기기만 할 수 있어 먼 곳의 위협을 막지 못해요.',
            '**두 갈래 위협**: 한 수로 두 줄이 동시에 3목 직전이 되면 다른 셋이 한 번에 다 막기 어려워요. 옮기기로 만드는 양갈래가 특히 잘 보이지 않아서 잘 통해요.',
            '**차례 순서 세기**: 라운드마다 첫 차례가 바뀌어요. 내 차례가 게스트 바로 다음이라면 게스트의 위협을 가장 먼저 막는 사람이 나예요. 게스트 바로 앞이라면 내 수가 게스트에게 기회를 주지 않는지가 더 중요해요.',
          ] },
          { type: 'table', caption: '피스와 결승 진출 계산 (라운드 승리 = 3개)', head: ['상황', '결과'], rows: [
            ['플레이어가 네 라운드를 나눠 이김 (예: 나 2, 아군 1, 아군 1)', '미션 성공. 나는 6개로 1위, 3개 동점 둘이 2위로 함께 진출'],
            ['한 라운드는 플레이어 둘이 동시 3목', '미션은 이어지지만 그 라운드 피스는 없음'],
            ['한 라운드가 120수까지 승자 없음', '미션 실패 — 피스와 상관없이 패배'],
            ['게스트가 한 번이라도 3목 (동시 포함)', '미션 실패'],
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 쌓인 판 읽기',
        blocks: [
          { type: 'list', items: [
            '**아래층 지도**: 판이 쌓일수록 위에서 보이는 것과 실제 말이 달라져요. 어느 칸 아래에 누구 말이 있는지 기억해 두면, 누군가 말을 들 때 무엇이 드러날지 미리 알 수 있어요.',
            '**3층 칸은 벽**: 3층이 된 칸은 더는 놓을 수도 옮겨 들어갈 수도 없어요. 그 칸의 맨 위 색은 주인이 옮기기 전까지 고정이라, 내 색으로 3층을 만들면 그 칸이 걸친 줄의 한 자리를 굳혀요.',
            '**마개를 상대에게 떠넘기기**: 게스트 말 위에 다른 플레이어의 말이 마개로 올라가 있으면 그 플레이어는 그 말을 못 움직여요. 반대로 내 말이 마개라면 나는 그만큼 쓸 수 있는 말이 줄어든 거예요. 마개 역할은 되도록 남에게 맡기세요.',
            '**120수 무승부도 실패**: 막기만 계속하면 아무도 3목을 못 만들고 120수에 닿아 미션이 실패해요. 판이 굳으면 플레이어 쪽에서 먼저 3목을 만들어 끝내는 게 모두에게 이득이에요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**마개 뽑기**: 게스트 말 위의 내 말을 옮겨 게스트 3목을 열어 주는 실수. 미션이 그 자리에서 끝나요.',
            '**빈칸 하나만 막기**: 게스트 두 말이 가운데 줄에 나란하면 양쪽 끝이 다 3목 자리예요. 덮어서 한 번에 끊으세요.',
            '**새 말을 초반에 다 쓰기**: 후반에 먼 곳을 막을 수단이 없어져요.',
            '**피스를 잊기**: 미션이 성공해도 결승에 못 가면 패배로 기록돼요. 막으면서 내 줄을 키우세요.',
            '**동시 3목 만들기**: 내 3목을 만들면서 다른 색의 3목도 드러나게 하면 피스를 못 받아요. 게스트 색이 섞이면 미션 실패예요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 혼자 하기, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['혼자 하기', '나는 빨강이에요. 빈자리는 아군 AI 둘이 채우고, 게스트 AI가 노랑·초록·파랑 중 하나의 색으로 앉아요. 한 차례 시간이 지나면 차례가 넘어가요.'],
            ['AI의 강도', '난이도는 하나예요. 아군과 게스트 모두 실수 없이 다섯 차례 앞(한 바퀴 이상)을 읽고 최선의 수를 둬요. 아군은 게스트에게 3목 자리를 남기거나 열어 주는 수를 두지 않아요. 그래서 판은 내 실수가 없으면 이기고, 실수하면 지도록 짜여 있어요.'],
            ['친구 방', '2~3명이 링크나 4자리 초대코드로 모여요. 빈자리는 아군 AI가 채우고 게스트는 늘 AI예요. 방장이 한 차례 시간(90·60·30초)을 정해요.'],
            ['자리 비움', '친구 방에서 연결이 20초 끊기거나 두 차례 연속 시간을 넘기면 AI가 그 자리를 대신 두고, 돌아오면 다시 넘겨받을 수 있어요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '스페셜 게스트', def: '플레이어 셋이 함께 막아야 하는 AI 상대. 게스트 말에는 ★가 표시돼요.' },
            { term: '미션', def: '네 라운드 모두 플레이어가 이기는 것. 하나라도 놓치면 실패예요.' },
            { term: '피스', def: '라운드를 혼자 이긴 플레이어가 받는 보상, 한 번에 3개.' },
            { term: '결승 진출', def: '네 라운드 뒤 피스 상위 2명(2위 동점 포함, 0개 제외).' },
            { term: '덮기', def: '다른 말 위에 내 말을 놓거나 옮겨, 위에서 보이는 색을 바꾸는 것.' },
            { term: '마개', def: '상대 말을 덮어 그 줄을 끊고 있는 내 말. 옮기면 줄이 되살아나요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '4인 3목은 어떤 게임인가요?', a: '4×4 판에서 네 명이 말을 놓고 쌓고 옮기며, 위에서 봤을 때 같은 색 3개를 먼저 한 줄로 만드는 게임이에요. 데블스 플랜 시즌 1 상금 매치에서 나왔어요.' },
      { q: '스페셜 게스트는 누구인가요?', a: '플레이어 셋이 함께 막아야 할 상대로, 늘 AI가 맡아요. PUZZLTHINK에서는 게임 시작 때 게스트의 색을 공개하고 게스트 말에 ★를 표시해요.' },
      { q: '두 명이 동시에 3목이면 어떻게 되나요?', a: '라운드는 끝나지만 아무도 피스를 받지 못해요. 게스트가 끼어 있으면 미션 실패예요.' },
      { q: 'AI 난이도는 고를 수 있나요?', a: '아니요. 아군과 게스트 AI 모두 늘 최선의 수를 둬요. 내가 잘 두면 이기고 실수하면 지도록 만들었어요.' },
      { q: '친구와 하려면 몇 명이 필요한가요?', a: '2~3명이에요. 빈자리는 아군 AI가 채우고, 게스트는 항상 AI예요. 링크나 4자리 초대코드로 초대할 수 있어요.' },
      { q: '승리 기준은 무엇인가요?', a: '미션 성공(네 라운드 모두 플레이어 승리)과 결승 진출(피스 상위 2명)을 모두 이루면 승리로 기록돼요.' },
    ],
    cta: { title: '게스트를 막아 볼까요?', body: '게스트 말 두 개가 나란히 서면 하나를 덮는 것부터 해 보세요. 덮기 한 수가 판을 바꿔요.', button: '4인 3목 하러 가기' },
    disclaimer: 'PUZZLTHINK는 방송사와 관계없는 비공식 팬 메이드 서비스예요. 게임 규칙은 방송 내용을 바탕으로 웹에서 즐기기 좋게 다듬었어요.',
  },
  en: {
    meta: {
      title: '4 Player 3 in a Row strategy guide — stacking, moving, stopping the Special Guest | PUZZLTHINK',
      description: 'A guide to 4 Player 3 in a Row from The Devil’s Plan season 1: the 24 lines and the four centre cells of a 4×4 board, stacking and moving, lines revealed by lifting a piece, simultaneous lines, covering the Special Guest, and counting pieces for the final.',
      keywords: ['4 player 3 in a row', 'four player tic tac toe', 'Devil’s Plan 3 in a row', 'Special Guest', 'Devil’s Plan prize match'],
    },
    title: '4 Player 3 in a Row strategy guide',
    lead: 'Three are allies and rivals at once; one is everyone’s enemy.',
    intro: [
      '4 Player 3 in a Row is played by four people on a 4×4 board: place, stack and move pieces until **three of one colour show in a row from above.** Three of the four are players, one is the Special Guest. The players race each other for pieces by winning rounds, yet must also work as a team to stop the guest from making a single line in four rounds.',
      'This guide lays out the small board in numbers first: its 24 lines, the four centre cells that most lines run through, and the traps of stacking and moving, all with diagrams. Then it covers the balance between stopping the guest and scoring yourself, the arithmetic of reaching the final and how the AI plays. Cells are named as in the game: columns A–D from the left, rows 1–4 from the top. ★ marks a guest piece; the small dots in a cell’s corner are pieces buried underneath.',
    ],
    gamePageTitle: '4 Player 3 in a Row — rules and strategy',
    summary: 'The 24 lines and centre cells, stacking traps, covering the guest, pieces and the final.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is 4 Player 3 in a Row?',
        blocks: [
          { type: 'p', text: '4 Player 3 in a Row was the day-6 prize match in season 1 of Netflix’s The Devil’s Plan. It is tic-tac-toe at heart, but on a 4×4 board with four players, and pieces can be stacked and moved, so the board never stops changing.' },
          { type: 'p', text: 'On the show the guest’s identity was hidden; on PUZZLTHINK the guest’s colour is revealed at the start and its pieces carry a ★. The guest is always an AI. Playing alone, you sit with two ally AIs against one guest AI.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board and pieces**: four players — red, yellow, green and blue — each start with 5 pieces on a 4×4 board. Three are players and one is the Special Guest (an AI).',
            '**Order**: red → yellow → green → blue, and the first turn passes to the next colour every round, so in four rounds every colour starts once.',
            '**A turn**: ① **place** a piece from your hand on any cell (on top of other pieces too), or ② **move** one of your pieces showing on top to one of the 8 neighbouring cells. Either way the destination must be below three high.',
            '**Three in a row**: three of one colour showing from above in a row, column or diagonal ends the round. A sole winner receives 3 pieces. **If one action shows lines for two or more colours at once**, the round ends and nobody scores.',
            '**Passing**: with no legal action, or when the clock (90, 60 or 30 s a turn) runs out, the turn passes. A round with no line after 120 actions (passes included) ends with no winner.',
            '**The mission**: the players succeed only if a player wins every one of the four rounds. A guest line (even shared) or a round with no winner fails it.',
            '**The final and winning**: after four rounds the two players with the most pieces reach the final (everyone tied for second goes through; zero pieces never does). You win by achieving **mission success and a place in the final**.',
          ] },
          { type: 'cards', items: [
            { title: 'Stacking', body: 'On B2 red sits on yellow, so from above it shows red. C3 is already three high: nothing more can be placed or moved there. A buried piece shows again only when the one above leaves.', figure: fig(STACK, 'Stacking pieces') },
            { title: 'How many lines pass each cell', body: 'A 4×4 board has 24 three-cell lines. Corners lie on 3, edge cells on 4 and the centre cells B2, C2, B3 and C3 on 7 (dashed). Whoever holds the centre has a say in the most lines.', figure: fig(COUNT, 'The four centre cells') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations — what happens if…',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'REVEALED LINE', title: 'I lifted a piece and opened a guest line', body: 'Your red piece on B2 sits on a guest piece, and A1 and C3 are the guest’s too. For now your piece breaks the diagonal — but the moment you move it off B2, the ★ underneath shows, A1–B2–C3 is a guest line and the mission fails. Treat a piece of yours sitting on a guest piece as a plug, and do not move it lightly.', figure: fig(LIFT, 'A guest line revealed by lifting') },
            { tag: 'SHARED LINE', title: 'Two colours at once — nobody scores', body: 'Red moves the piece that covered green on B1 to C2, completing A2–B2–C2 — but the green piece uncovered on B1 completes A1–B1–C1 with the same action. Two colours show lines at once, so the round ends and nobody gets pieces. With no guest involved the mission goes on; had the guest been in it, the mission would fail.', figure: fig(SHARED, 'Two colours with lines at once') },
          ] },
          { type: 'cards', items: [
            { title: 'Can I move someone else’s piece?', body: 'No. Only your pieces showing on top can move. A piece of yours buried under another stays put until the top is clear.' },
            { title: 'What if my move reveals someone else’s line?', body: 'If a piece uncovered by your move completes another player’s line, that player wins the round (if they are the only one).' },
            { title: 'What happens once all 5 pieces are placed?', body: 'From then on you can only move. With nothing to move, you pass.' },
            { title: 'Two players make lines at once — is the mission over?', body: 'Not if the guest is not one of them. But nobody scores that round.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — guest first, then your line',
        blocks: [
          { type: 'p', text: 'The most expensive mistake here is letting the guest make one line: the mission fails on the spot and no number of pieces can save you. So at first, look at the board in this order every turn.' },
          { type: 'list', ordered: true, items: [
            '**Can the guest make a line on its next turn?** Check the open cell of every line with two guest pieces — and the cells the guest could fill by moving.',
            '**Can I make a line now?** If so, it is also the best defence: the round ends at once.',
            '**What does my action uncover?** If you are moving, check whose piece is under the one you lift.',
          ] },
          { type: 'cards', items: [
            { tag: 'COVER', title: 'Two guest pieces? Cover one', body: 'With the guest on B2 and C2, both A2 and D2 complete a line. Block one empty cell and the other remains.', figure: fig(PAIR, 'A two-way guest threat') },
            { tag: 'COVER', title: 'Placing on C2 stops both', body: 'Put your piece on top of the guest on C2 and that cell shows red, breaking both A2–B2–C2 and B2–C2–D2 at once. Covering beats blocking an empty cell.', figure: fig(COVERED, 'The guest piece covered') },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — block and score at once',
        blocks: [
          { type: 'p', text: 'The ally AIs are after pieces too. Spend every move on the guest and an ally takes the rounds: the mission succeeds, but you miss the final. From here on, the key is finding the block that also grows your own line.' },
          { type: 'list', items: [
            '**Cover in the centre**: the four centre cells lie on 7 lines each. Covering a guest or rival piece there cuts those lines and puts you on seven at once.',
            '**Save pieces in hand**: a new piece can go anywhere, which makes it your best blocking card. Spend them all early and later you can only shuffle to neighbouring cells, unable to reach a distant threat.',
            '**Two-way threats**: one action that leaves two lines one short is hard for the others to cover at once. Forks made by moving are especially hard to see.',
            '**Count the order**: the first turn rotates every round. If you play right after the guest, you are first to answer its threats; right before it, make sure your move hands it nothing.',
          ] },
          { type: 'table', caption: 'Pieces and the final (a round win = 3 pieces)', head: ['Situation', 'Result'], rows: [
            ['players share the four rounds (e.g. you 2, ally 1, ally 1)', 'mission succeeds; you are first with 6 and the two on 3 tie for second and both go through'],
            ['one round ends with two players’ lines at once', 'the mission goes on, but nobody scores that round'],
            ['one round reaches 120 actions with no line', 'mission fails — a loss whatever your pieces'],
            ['the guest makes a line (even shared)', 'mission fails'],
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — reading a stacked board',
        blocks: [
          { type: 'list', items: [
            '**A map of the lower floors**: the more the board stacks, the more what you see differs from what is there. Remember whose piece is under each cell and you know in advance what a lift will reveal.',
            '**Three-high cells are walls**: nothing can be placed on or moved into them. The top colour stays until its owner moves it, so a three-high stack in your colour fixes your place on every line through that cell.',
            '**Hand the plug job to others**: a player whose piece plugs a guest piece cannot move it. If the plug is yours, you have one piece fewer to play with. Let someone else be the plug when you can.',
            '**A 120-action stalemate fails too**: if everyone only blocks, no one makes a line and the round reaches 120 actions — mission failed. When the board locks up, a player finishing a line is good for every player.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Pulling the plug**: moving your piece off a guest piece and opening a guest line. The mission ends there.',
            '**Blocking just one end**: two guest pieces side by side in a middle row threaten both ends. Cover one of them.',
            '**Spending new pieces early**: later you have no way to reach a distant threat.',
            '**Forgetting your pieces**: a successful mission still counts as a loss if you miss the final. Block in ways that grow your own line.',
            '**Making a shared line**: complete your line while another colour’s line shows and you score nothing; if it is the guest’s colour, the mission fails.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, solo play and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['Solo', 'You are red. Two ally AIs fill the other player seats and the guest AI takes yellow, green or blue. When your turn’s clock runs out, the turn passes.'],
            ['AI strength', 'There is one level. Allies and guest alike read five actions ahead (more than a full round of the table) and always play their best move. Allies never leave or open a ready-made line for the guest. So the game is built to be won if you make no mistakes and lost if you do.'],
            ['Friend rooms', '2–3 people join by link or 4-digit invite code. Empty seats get ally AIs and the guest is always an AI. The host sets the turn time (90, 60 or 30 s).'],
            ['Away seats', 'In a room, a player disconnected for 20 seconds or timing out twice in a row is replaced by an AI until they come back and take the seat again.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Special Guest', def: 'The AI opponent the three players must stop together. Its pieces carry a ★.' },
            { term: 'Mission', def: 'A player winning all four rounds. Miss one and it fails.' },
            { term: 'Pieces', def: 'The reward for winning a round alone: 3 at a time.' },
            { term: 'Final', def: 'The top two players by pieces after four rounds (ties for second included, never with zero).' },
            { term: 'Cover', def: 'Placing or moving your piece onto another, changing the colour seen from above.' },
            { term: 'Plug', def: 'Your piece covering an enemy piece and breaking its line; move it and the line returns.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is 4 Player 3 in a Row?', a: 'Four players place, stack and move pieces on a 4×4 board, racing to show three of their colour in a row from above. It was a prize match in season 1 of The Devil’s Plan.' },
      { q: 'Who is the Special Guest?', a: 'The opponent the three players must stop together, always played by an AI. On PUZZLTHINK its colour is revealed at the start and its pieces carry a ★.' },
      { q: 'What if two players make a line at once?', a: 'The round ends but nobody scores. If the guest is one of them, the mission fails.' },
      { q: 'Can I choose the AI level?', a: 'No. Allies and guest always play their best move, so you win if you play well and lose if you slip.' },
      { q: 'How many people do I need to play with friends?', a: '2–3. Empty seats get ally AIs and the guest is always an AI. Invite by link or 4-digit code.' },
      { q: 'What counts as a win?', a: 'Mission success (players win all four rounds) and a place in the final (top two by pieces), both together.' },
    ],
    cta: { title: 'Ready to stop the guest?', body: 'Start by covering one of the guest’s pieces whenever two stand side by side. One cover changes the board.', button: 'Play 4 Player 3 in a Row' },
    disclaimer: 'PUZZLTHINK is an unofficial fan-made service, not affiliated with the broadcaster. The rules follow what was shown on the programme, adapted for play on the web.',
  },
};

export default guide;
