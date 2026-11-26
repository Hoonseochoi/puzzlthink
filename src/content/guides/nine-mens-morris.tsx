// 나인 멘스 모리스 guide. Rules and numbers follow src/lib/morris.ts (24 POINTS, 16 MILLS, ADJ along the drawn lines,
// PIECES 9, removable: never a piece in a mill — and nothing at all when every enemy piece is in one, flying at three
// once all are placed, settle: fewer than three or no move loses, STALL_TURNS 10 each once someone is down to three,
// QUIET_LIMIT 120 half-moves → draw, AI depths 2 / 3 / 6 half-moves (+1 for hard in the endgame) with random margins),
// src/lib/morrisRoom.ts (best of three, MORRIS_WINS 2, at most 5 rounds, draws don't count, sides swap every round,
// 90/60/30-second turns, a timeout plays a random move, three in a row lose the round) and MorrisGame.tsx (vs OTTO you
// are black in round one, then the sides swap; no clock), plus the MorrisGuide messages.
// Points are named as on the board (columns A–G, rows 1–7 from the bottom).
import { MILLS, POINTS, POS } from '@/lib/morris';
import type { GameGuide } from './types';

type Spec = { black?: string[]; white?: string[]; mark?: string[]; arrows?: [string, string][] };

/** The 24-point board, drawn from the game's own point and line tables. */
function MorrisBoard({ spec, label }: { spec: Spec; label: string }) {
  const S = 20, O = 12;
  const xy = (name: string) => { const p = POS[POINTS.indexOf(name as (typeof POINTS)[number])]; return { x: O + p.col * S, y: O + p.row * S }; };
  return (
    <svg viewBox="0 0 144 146" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[280px]">
      <rect x="2" y="2" width="140" height="140" rx="6" fill="#0b1a1d" />
      {MILLS.map((m, i) => { const a = xy(POINTS[m[0]]), b = xy(POINTS[m[2]]); return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2fa7b5" strokeWidth="1.2" />; })}
      {POINTS.map((name) => { const { x, y } = xy(name); return <g key={name}><circle cx={x} cy={y} r="2" fill="#2fa7b5" /><text x={x + 3} y={y - 3} fontSize="4" fill="#6f8f94" fontFamily="monospace">{name}</text></g>; })}
      {spec.mark?.map((name) => { const { x, y } = xy(name); return <circle key={`m${name}`} cx={x} cy={y} r="7.5" fill="none" stroke="#ffd166" strokeWidth="1.2" strokeDasharray="2 1.5" />; })}
      {spec.arrows?.map(([from, to]) => { const a = xy(from), b = xy(to); return <line key={`a${from}${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffd166" strokeWidth="2" strokeLinecap="round" opacity="0.8" />; })}
      {spec.black?.map((name) => { const { x, y } = xy(name); return <circle key={`b${name}`} cx={x} cy={y} r="5.5" fill="#15171c" stroke="#8a909c" strokeWidth="0.6" />; })}
      {spec.white?.map((name) => { const { x, y } = xy(name); return <circle key={`w${name}`} cx={x} cy={y} r="5.5" fill="#eef0f4" stroke="#8a909c" strokeWidth="0.6" />; })}
    </svg>
  );
}
const fig = (spec: Spec, label: string) => <MorrisBoard spec={spec} label={label} />;

const EMPTY: Spec = { mark: ['D6', 'B4', 'F4', 'D2'] };
// Black closes A7–D7–G7. White's B6–D6–F6 is a mill, so only white C4 or E3 may be taken.
const MILL: Spec = { black: ['A7', 'D7', 'G7', 'A1'], white: ['B6', 'D6', 'F6', 'C4', 'E3'], mark: ['C4', 'E3'] };
// Running mill, step 1: black's mill A1–D1–G1; G4 is free and no white piece can reach G1.
const RUN1: Spec = { black: ['A1', 'D1', 'G1', 'B4', 'D6'], white: ['G7', 'F6', 'E4', 'C3', 'B6'] };
const RUN2: Spec = { black: ['A1', 'D1', 'G4', 'B4', 'D6'], white: ['G7', 'F6', 'E4', 'C3', 'B6'], arrows: [['G1', 'G4']], mark: ['G1'] };
// White answered E4→F4 (next to G4), but G1 is still out of its reach; black closes the mill and removes F4.
const RUN3: Spec = { black: ['A1', 'D1', 'G1', 'B4', 'D6'], white: ['G7', 'F6', 'C3', 'B6'], arrows: [['G4', 'G1']], mark: ['F4'] };
// Double mill: the piece on A4 closes A7–A4–A1; stepping to B4 closes B6–B4–B2. Every move is a mill.
const DOUBLE: Spec = { black: ['A7', 'A1', 'A4', 'B6', 'B2'], white: ['D7', 'C5', 'E4', 'D2', 'G1'], arrows: [['A4', 'B4']] };

const guide: GameGuide = {
  game: 'nineMensMorris',
  origin: { kind: 'classic' },
  updated: '2026-11-26',
  related: ['fourThree', 'russianJanggi', 'blindGomoku', 'wallgo2'],
  ko: {
    meta: {
      title: '나인 멘스 모리스 공략 — 밀 굴리기, 양쪽 밀, 날기와 교착 10턴 규칙 | PUZZLTHINK',
      description: '데블스 플랜 결승전 나인 멘스 모리스 공략. 24점 판과 16개의 밀, 밀 속 말 보호 규칙, 놓기 단계 교차점 선점, 밀 굴리기 따라 두기, 양쪽 밀, 3개 남은 날기와 교착 10턴, AI OTTO 난이도까지 정리했어요.',
      keywords: ['나인 멘스 모리스 공략', '나인멘스모리스 규칙', '나인 멘스 모리스 전략', '데블스 플랜 나인 멘스 모리스', '밀 게임', '모리스 게임 이기는 법'],
    },
    title: '나인 멘스 모리스 공략',
    lead: '세 개를 세우면 하나를 잡고, 셋만 남으면 날아다녀요.',
    intro: [
      '나인 멘스 모리스는 세 개의 사각형이 이어진 판의 24개 점에 말 9개씩을 놓고 옮기며, **내 말 3개를 한 줄(밀)로 세울 때마다 상대 말을 하나씩 잡는** 2인 전략 게임이에요. 말이 2개가 되거나 움직일 곳이 없으면 져요. 운이 전혀 없는 게임이라, 놓기 단계의 자리 선점과 옮기기 단계의 수읽기가 그대로 승부를 가려요.',
      '이 공략은 PUZZLTHINK가 따르는 방송 규칙(밀 속 말 보호, 3개 날기, 교착 10턴)을 정확히 짚고, 놓기·옮기기·날기 세 단계별 전략을 다뤄요. 밀을 열었다 닫으며 매 차례 말을 잡는 "밀 굴리기"를 따라 두고, 양쪽 밀, 자주 하는 실수, AI와 친구 방 규칙도 정리했어요. 점 이름은 판과 같이 가로 A~G, 세로 1~7(아래부터)이에요.',
    ],
    gamePageTitle: '나인 멘스 모리스 — 세 줄로 잡고, 날아서 버티기',
    summary: '밀 속 말 보호, 교차점 선점, 밀 굴리기 따라 두기, 양쪽 밀, 날기와 교착 10턴.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '나인 멘스 모리스는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '나인 멘스 모리스(Nine Men\'s Morris)는 유럽에서 오래전부터 즐겨 온 전통 보드게임이에요. 영어권에서는 "Mill(밀)", 독일에서는 "Mühle"라고도 불러요. 국내에서는 넷플릭스 「데블스 플랜」 시즌 1 결승전 1경기로 나오며 널리 알려졌어요.' },
          { type: 'p', text: 'PUZZLTHINK는 방송에서 쓴 규칙을 따라요. 일반적인 규칙과 가장 크게 다른 점은 **밀 속에 있는 말은 끝까지 잡을 수 없다**는 것과, 3개 남은 쪽이 생기면 **10턴 교착 규칙**이 시작된다는 거예요. 한 경기는 3판 2선승이고 판마다 흑백이 바뀌어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판**: 24개의 점이 선으로 이어져 있어요. 점 세 개가 곧게 이어진 줄이 16개 있고, 이 줄을 내 말로 채우면 **밀**이에요.',
            '**놓기 단계**: 흑부터 번갈아 빈 점에 말을 하나씩 놓아요. 9개를 다 놓기 전에는 판 위의 말을 옮길 수 없어요.',
            '**옮기기 단계**: 9개를 모두 놓으면 차례마다 말 하나를 선을 따라 이웃한 빈 점으로 한 칸 옮겨요.',
            '**밀과 잡기**: 놓거나 옮겨서 밀을 만들면 상대 말 하나를 골라 없애요. 단, **상대 밀 속에 있는 말은 없앨 수 없어요.** 상대 말이 모두 밀 속이면 그 밀로는 아무것도 잡지 못해요.',
            '**날기**: 9개를 다 놓은 뒤 내 말이 정확히 3개 남으면, 이웃이 아니어도 아무 빈 점으로나 옮길 수 있어요.',
            '**패배**: 말이 2개가 되거나, 내 차례에 움직일 수 있는 말이 하나도 없으면 그 판을 져요.',
            '**교착**: 누군가 말이 3개가 된 뒤 잡기 없이 10턴(양쪽 각 10번)이 지나면 말이 적은 쪽이 져요. 같으면 무승부예요. 잡기 없이 120번(양쪽 합계)이 지나도 무승부예요.',
          ] },
          { type: 'figure', node: fig(EMPTY, '나인 멘스 모리스 판'), caption: '24개의 점과 16개의 줄. 점선 원(D6·B4·F4·D2)은 네 방향으로 이어진 교차점이에요. 모서리 점은 두 방향, 나머지 점은 세 방향으로 이어져요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '밀 보호', title: '밀 속 말은 잡을 수 없어요', body: '흑이 A7–D7–G7 밀을 만들었어요. 백의 B6–D6–F6은 밀이라 그 세 말은 잡을 수 없고, 고를 수 있는 건 C4와 E3뿐이에요(점선 원). 만약 백 말이 모두 밀 속에 있었다면 이번 밀로는 아무것도 잡지 못해요.', figure: fig(MILL, '잡을 수 있는 말') },
          ] },
          { type: 'cards', items: [
            { title: '한 수로 밀 두 개가 생기면?', body: '잡을 수 있는 말은 하나뿐이에요. 두 밀이 동시에 생겨도 두 개를 잡지는 않아요.' },
            { title: '놓기 단계에도 밀이 되나요?', body: '네. 놓아서 만든 밀도 똑같이 상대 말 하나를 잡아요. 놓기 단계의 밀 싸움이 첫 승부처예요.' },
            { title: '다 놓은 순간 갇히면?', body: '놓기 단계에는 빈 점에 놓기만 하면 되니 갇힐 일이 없어요. 하지만 9개를 다 놓은 뒤 내 말이 모두 막혀 있으면 첫 옮기기 차례에 바로 져요.' },
            { title: '날기는 언제부터예요?', body: '9개를 다 놓은 뒤, 판 위 내 말이 정확히 3개일 때만이에요. 놓기 단계에 3개만 남아도 아직 날 수 없어요.' },
            { title: '교착 10턴은 언제부터 세요?', body: '어느 한쪽이라도 말을 다 놓은 상태로 3개가 되면 세기 시작해요. 누구든 잡으면 다시 0부터예요. 화면에 남은 턴 수가 표시돼요.' },
            { title: '밀을 열었다 다시 닫아도 잡나요?', body: '네. 밀에서 말을 뺐다가 다음 차례에 다시 넣으면 새 밀을 만든 것이라 또 잡아요. 이것이 "밀 굴리기"예요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 놓기 단계에서 지지 않기',
        blocks: [
          { type: 'p', text: '나인 멘스 모리스는 놓기 단계에서 이미 반쯤 결정돼요. 초반에 밀을 서두르기보다, 옮기기 단계에서 움직일 수 있는 판을 만드는 게 먼저예요.' },
          { type: 'list', items: [
            '**교차점 먼저**: D6·B4·F4·D2는 네 방향으로 이어져 옮기기 단계에서 가장 유연해요. 모서리 점(A7, G1 같은)은 두 방향뿐이라 쉽게 막혀요.',
            '**두 개 줄은 바로 막기**: 상대 말 2개가 한 줄에 있고 나머지 점이 비어 있으면 다음 차례에 밀이 돼요. 놓기 단계에서는 특히 먼저 막으세요.',
            '**막히지 않게 놓기**: 다 놓았을 때 움직일 곳이 없으면 그대로 져요. 상대 말 사이 구석에 내 말을 몰아 넣지 마세요.',
            '**밀 하나보다 위협 둘**: 한 줄에 2개를 놓아 위협하면 상대가 막아요. 한 번 놓아서 두 줄을 동시에 위협하면 하나는 막지 못해요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 두기 — 밀 굴리기',
        lead: '옮기기 단계에서 이미 만든 밀을 열었다 닫으며 매 차례 말을 잡는 기본 기술이에요. 나는 흑이에요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. 밀이 있는 판', body: '흑이 A1–D1–G1 밀을 가지고 있어요. 이 밀은 이미 만들어진 것이라 그대로 두면 더 잡지 못해요. 눈여겨볼 점은 G1의 이웃이 D1(흑)과 G4(빈 점)뿐이라는 거예요.', figure: fig(RUN1, '밀이 있는 판') },
            { title: '2. 밀을 열기: G1→G4', body: 'G1의 말을 G4로 옮겨 밀을 열어요. 이제 G1이 비었는데, G1에 닿는 이웃은 D1(흑)과 G4(흑)뿐이라 **백은 G1에 들어올 수 없어요.** 백이 날 수 있는 상태(3개)가 아니라면 이 문은 백이 막을 방법이 없어요.', figure: fig(RUN2, 'G1에서 G4로 밀 열기') },
            { title: '3. 밀을 닫기: G4→G1, 잡기', body: '백은 E4→F4로 G4 옆에 붙었지만 G1에는 여전히 닿지 못해요. 흑이 G4의 말을 다시 G1로 옮기면 A1–D1–G1이 다시 완성돼 새 밀이 되고, 백 말 하나를 잡아요. 여기서는 G4를 노리던 F4를 없앴어요. 같은 일을 매 두 차례마다 되풀이할 수 있어요.', figure: fig(RUN3, 'G1로 밀 닫고 잡기') },
          ] },
          { type: 'callout', tone: 'tip', title: '백의 대응은?', text: '밀을 여는 쪽 점(여기서는 G4)을 백이 먼저 차지하면 흑은 밀을 열 수 없어요. 그래서 상대 밀 옆의 빈 점은 미리 막아 두는 게 수비의 핵심이에요. 백이 3개가 되어 날 수 있게 되면 언제든 G1을 막을 수 있으니, 밀 굴리기는 상대가 4개 이상일 때 가장 강해요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 양쪽 밀과 이동력',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '양쪽 밀', title: '한 말이 오갈 때마다 밀', body: '흑 A7·A1·B6·B2가 있고 A4의 말이 오가요. A4에 있으면 A7–A4–A1, B4로 가면 B6–B4–B2 밀이 완성돼요. 한 번 움직일 때마다 밀이 생겨서 매 차례 백 말을 잡아요. 백은 A4나 B4 중 빈 쪽을 막아야 하는데, 두 점 모두 흑 말에 둘러싸여 있으면 막을 수가 없어요.', figure: fig(DOUBLE, '양쪽 밀') },
          ] },
          { type: 'list', items: [
            '**이동력 세기**: 옮기기 단계에서는 "내 말이 갈 수 있는 빈 점의 수"가 곧 힘이에요. 상대의 이동력을 줄여 마지막 한 칸까지 막으면, 잡지 않고도 이겨요(움직일 수 없으면 패배).',
            '**밀 속에 숨기**: 밀 속의 말은 잡히지 않아요. 말이 적을 때는 밀을 유지한 채 다른 말로만 움직이며 버티는 것도 방법이에요. 단, 상대 말이 모두 밀 속이면 내 밀도 잡을 게 없으니, 상대도 같은 방법을 쓸 수 있어요.',
            '**잡을 말 고르기**: 잡을 수 있는 말 중에서는 상대의 다음 밀 재료(한 줄에 2개 중 하나)나 이동력이 가장 큰 말을 고르세요. 구석에 갇힌 말은 남겨 둬도 상대에게 도움이 안 돼요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 날기와 교착 10턴',
        blocks: [
          { type: 'p', text: '말이 3개가 되면 날 수 있어서, 상대의 밀 자리를 어디서든 막을 수 있어요. 대신 3개짜리는 한 번만 더 잡혀도 지고, 교착 10턴이 시작돼요.' },
          { type: 'list', items: [
            '**3개 대 여러 개**: 많은 쪽은 한 번에 두 곳을 위협하는 모양(두 줄에 2개씩)을 만들어야 해요. 날기는 한 번에 하나만 막을 수 있으니까요. 10턴 안에 만들지 못하면 교착 규칙으로 판이 끝나는데, 그때도 말이 많은 쪽이 이기니 서두를 필요는 없어요.',
            '**3개 대 3개**: 둘 다 날 수 있으면 서로의 밀 자리를 계속 막게 돼요. 10턴이 지나면 말 수가 같아 무승부예요. 상대의 두 줄 위협을 막으면서 내 두 줄 위협을 만드는 쪽이 이겨요.',
            '**적은 쪽이라면**: 교착 10턴은 말이 많은 쪽 편이에요. 날기로 버티는 것만으로는 시간이 끝나면 져요. 그전에 상대 말을 하나라도 잡아 카운트를 되돌리거나 개수를 맞춰야 해요.',
            '**날기 전 단계에서 준비**: 내가 4개일 때 잡히면 3개가 되어 날 수 있어요. 날게 될 순간을 위해, 내 남은 말들이 이미 두 줄을 노리는 자리에 있도록 미리 배치해 두세요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**초반에 밀만 노리기**: 놓기 단계에서 밀 하나를 만들고도 말들이 구석에 몰려 옮기기 단계에서 막히는 경우가 많아요.',
            '**상대 두 개 줄 놓치기**: 놓기 단계에서 한 번 놓치면 바로 말 하나를 잃어요.',
            '**밀 속 말을 노리기**: 방송 규칙에서는 밀 속 말을 잡을 수 없어요. 상대가 밀을 유지하면 잡을 수 있는 말이 줄어들어요.',
            '**밀을 열 때 문 막히기**: 밀에서 뺀 말이 돌아갈 점을 상대가 먼저 차지할 수 있는지 확인하세요.',
            '**교착 카운트 잊기**: 3개 남은 쪽이 생기면 10턴 카운트가 시작돼요. 말이 적은 쪽은 시간이 지날수록 불리해요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI OTTO, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국 (OTTO)', '3판 2선승이고 첫 판은 내가 흑(선)이에요. 판마다 흑백이 바뀌고, 무승부 판은 세지 않으며 최대 5판까지 해요. 시간 제한은 없어요.'],
            ['하', '양쪽 합쳐 2수 앞까지만 보고, 판단에 흔들림이 커서 자주 실수해요.'],
            ['중', '3수 앞까지 읽어요. 바로 생기는 밀과 막기는 잘 보지만 긴 수순은 놓쳐요.'],
            ['상', '6수 앞까지 읽고, 말이 줄어든 끝판에는 한 수 더 읽어요. 같은 국면에서도 비슷한 수 중 하나를 골라, 이긴 수순을 그대로 반복해도 똑같이 이기기는 어려워요.'],
            ['친구 방', '링크나 4자리 초대코드로 방을 만들어요. 첫 판 흑은 무작위이고 판마다 바뀌어요. 한 수 시간은 90·60·30초 중에서 고르고, 시간이 지나면 무작위 수가 두어지며 세 번 연속이면 그 판을 져요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '밀(Mill)', def: '곧게 이어진 세 점에 내 말 3개가 선 것. 만들 때마다 상대 말 하나를 잡아요.' },
            { term: '놓기 단계', def: '말 9개를 번갈아 빈 점에 놓는 단계.' },
            { term: '옮기기 단계', def: '다 놓은 뒤 선을 따라 이웃한 빈 점으로 한 칸씩 옮기는 단계.' },
            { term: '날기', def: '말이 3개 남았을 때 아무 빈 점으로나 옮길 수 있는 것.' },
            { term: '밀 굴리기', def: '밀에서 말을 뺐다가 다시 넣어 매번 새 밀을 만드는 기술.' },
            { term: '양쪽 밀', def: '한 말이 두 점을 오갈 때마다 서로 다른 밀이 완성되는 모양.' },
            { term: '교착 10턴', def: '3개 남은 쪽이 생긴 뒤 잡기 없이 양쪽 10턴이 지나면 말이 적은 쪽이 지는 규칙.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '데블스 플랜 규칙과 같은가요?', a: '네. 말 9개, 밀 속 말 보호, 3개 남으면 날기, 2개가 되면 패배, 3개 남은 뒤 잡기 없는 10턴이 지나면 말이 적은 쪽 패배, 3판 2선승을 방송 규칙대로 따랐어요. 판마다 흑백이 바뀌어요.' },
      { q: '밀 속에 있는 말도 잡을 수 있나요?', a: '아니요. 밀 속 말은 잡을 수 없고, 상대 말이 모두 밀 속이면 그 밀로는 아무것도 잡지 못해요.' },
      { q: '한 번에 밀 두 개를 만들면 두 개를 잡나요?', a: '아니요. 한 수에 잡을 수 있는 말은 하나예요.' },
      { q: '말이 3개 남으면 어떻게 되나요?', a: '9개를 다 놓은 뒤라면 아무 빈 점으로나 날 수 있어요. 동시에 잡기 없는 10턴 교착 카운트가 시작돼요.' },
      { q: 'AI는 얼마나 강한가요?', a: '하는 자주 실수하고, 중은 3수, 상은 6수 앞까지 읽어요. 상을 이기면 어려움 클리어 인증서를 받을 수 있어요.' },
      { q: '친구와 하려면 어떻게 하나요?', a: '친구와 하기로 방을 만들면 초대 링크와 4자리 초대코드가 생겨요. 친구는 링크를 열거나 코드를 넣으면 돼요.' },
    ],
    cta: { title: '밀을 굴려 볼까요?', body: '놓기 단계에서 교차점부터 잡고, 옮기기 단계에서는 상대가 막을 수 없는 쪽으로 밀을 열어 보세요.', button: '나인 멘스 모리스 하러 가기' },
  },
  en: {
    meta: {
      title: 'Nine Men’s Morris strategy guide — running mills, double mills, flying and the 10-turn rule | PUZZLTHINK',
      description: 'A guide to Nine Men’s Morris as played in The Devil’s Plan final: the 24-point board and its 16 mills, the protected-mill rule, taking junctions while placing, a running mill move by move, double mills, flying at three, the 10-turn stall rule and the AI OTTO.',
      keywords: ['Nine Men’s Morris strategy', 'Nine Men’s Morris rules', 'how to win nine mens morris', 'Devil’s Plan nine mens morris', 'mill board game', 'running mill'],
    },
    title: 'Nine Men’s Morris strategy guide',
    lead: 'Line up three to take one — and fly when only three are left.',
    intro: [
      'Nine Men’s Morris is a two-player strategy game on the 24 points of three nested squares. Each side places and moves nine pieces, and **every time you line up three of yours (a mill) you remove an enemy piece.** Drop to two pieces, or have no move on your turn, and you lose. There is no luck at all: points taken while placing and calculation while moving decide the game.',
      'This guide pins down the rules PUZZLTHINK follows from the show — protected mills, flying at three and the 10-turn stall — and covers strategy for the three phases: placing, moving and flying. It plays out the running mill, which takes a piece every other turn, then covers double mills, common mistakes and the AI and room rules. Points are named as on the board: columns A–G, rows 1–7 from the bottom.',
    ],
    gamePageTitle: 'Nine Men’s Morris — mill three, then fly to survive',
    summary: 'Protected mills, junctions, the running mill move by move, double mills, flying and the 10-turn rule.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Nine Men’s Morris?',
        blocks: [
          { type: 'p', text: 'Nine Men’s Morris is a traditional board game long played across Europe; in English it is also called “Mill”, and in German “Mühle”. In Korea it became widely known as the first game of the final in season 1 of Netflix’s The Devil’s Plan.' },
          { type: 'p', text: 'PUZZLTHINK follows the rules used on the show. The biggest differences from common rules are that **a piece in a mill can never be taken**, and that once someone is down to three pieces, **a 10-turn stall rule** starts. A match is best of three, and colours swap every round.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**The board**: 24 points joined by lines. There are 16 straight lines of three points; filling one with your pieces is a **mill**.',
            '**Placing**: starting with black, take turns putting one piece on an empty point. Until all nine are placed you may not move pieces on the board.',
            '**Moving**: once all nine are placed, each turn move one piece along a line to a neighbouring empty point.',
            '**Mills and captures**: making a mill, by placing or moving, lets you remove one enemy piece — **but never one that is in a mill.** If every enemy piece is in a mill, that mill takes nothing.',
            '**Flying**: once all nine are placed and you have exactly three on the board, you may move to any empty point, neighbour or not.',
            '**Losing**: you lose the round when you are down to two pieces, or when you have no legal move on your turn.',
            '**Stall**: once someone is down to three, ten turns each without a capture end the round: fewer pieces loses, equal is a draw. 120 moves in total without a capture is also a draw.',
          ] },
          { type: 'figure', node: fig(EMPTY, 'The Nine Men’s Morris board'), caption: '24 points and 16 lines. The dashed circles (D6, B4, F4, D2) are junctions with four neighbours. Corners have two, every other point three.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations — what happens if…',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'PROTECTED', title: 'Pieces in a mill cannot be taken', body: 'Black has made A7–D7–G7. White’s B6–D6–F6 is a mill, so those three are safe; only C4 or E3 may be taken (dashed circles). Had every white piece been in a mill, this mill would take nothing.', figure: fig(MILL, 'Which pieces can be taken') },
          ] },
          { type: 'cards', items: [
            { title: 'Two mills with one move?', body: 'You still remove only one piece.' },
            { title: 'Do mills count while placing?', body: 'Yes. A mill made by placing also takes a piece. The placing phase is the first battle.' },
            { title: 'Boxed in once all are placed?', body: 'While placing you only need an empty point, so you cannot be stuck. But if all your pieces are blocked when the last one goes down, you lose on your first moving turn.' },
            { title: 'When does flying start?', body: 'Only after all nine are placed and exactly three are left on the board. Three left while still placing is not enough.' },
            { title: 'When does the 10-turn count start?', body: 'As soon as either player is down to three with nothing left to place. Any capture resets it, and the screen shows how many turns are left.' },
            { title: 'Does reopening and closing a mill capture again?', body: 'Yes. Move a piece out and back next turn and it is a new mill, so it captures again. That is the running mill.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — don’t lose the placing phase',
        blocks: [
          { type: 'p', text: 'Nine Men’s Morris is half decided while placing. Rather than rushing a mill, first build a position that can still move once the pieces are down.' },
          { type: 'list', items: [
            '**Junctions first**: D6, B4, F4 and D2 connect in four directions and are the most flexible points in the moving phase. Corners such as A7 or G1 have only two and are easily blocked.',
            '**Block two-in-a-row at once**: two enemy pieces on a line with the third point empty is a mill next turn. While placing, block it before anything else.',
            '**Don’t box yourself in**: no move when placing ends means you lose. Do not pile your pieces into corners among enemy pieces.',
            '**Two threats beat one mill**: two on a line gets blocked. One placement that threatens two lines at once cannot be fully stopped.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Play along — the running mill',
        lead: 'The basic technique of the moving phase: open a mill you already have and close it again, taking a piece every other turn. You are black.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. A mill on the board', body: 'Black has the mill A1–D1–G1. An existing mill takes nothing more if you leave it. Note that G1’s only neighbours are D1 (black) and G4 (empty).', figure: fig(RUN1, 'A board with a mill') },
            { title: '2. Open the mill: G1→G4', body: 'Move the G1 piece to G4 and the mill opens. G1 is now empty — but its only neighbours are D1 and G4, both black, so **white cannot step into G1.** Unless white is down to three and flying, it has no way to shut this door.', figure: fig(RUN2, 'Opening the mill with G1 to G4') },
            { title: '3. Close the mill: G4→G1 and capture', body: 'White answers E4→F4, next to G4, but still cannot reach G1. Black moves G4 back to G1: A1–D1–G1 is complete again, a new mill, and black removes a white piece — here F4, the one pressing on G4. You can repeat this every two turns.', figure: fig(RUN3, 'Closing the mill on G1 and capturing') },
          ] },
          { type: 'callout', tone: 'tip', title: 'How should white respond?', text: 'If white takes the point the mill opens towards (here G4) first, black cannot open the mill at all. Occupying the empty points next to an enemy mill is the heart of defence. Once white is down to three and can fly, it can block G1 at any time, so the running mill is strongest while the opponent has four or more.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — double mills and mobility',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'DOUBLE MILL', title: 'A mill every time one piece moves', body: 'Black has A7, A1, B6 and B2, and a piece shuttling from A4. On A4 it completes A7–A4–A1; on B4 it completes B6–B4–B2. Every move makes a mill, so black captures every turn. White must fill whichever of A4 and B4 is empty — and if both are surrounded by black pieces, it cannot.', figure: fig(DOUBLE, 'A double mill') },
          ] },
          { type: 'list', items: [
            '**Count mobility**: in the moving phase, the number of empty points your pieces can reach is your strength. Squeeze the opponent’s mobility down to nothing and you win without capturing — no move means defeat.',
            '**Hide in mills**: pieces in a mill cannot be taken. With few pieces, keep your mill and move other pieces to hold on. But if every enemy piece is in a mill your mills take nothing either, so the opponent can use the same trick.',
            '**Choose what to take**: among the pieces you may take, pick the one that is half of their next mill (one of two on a line) or the one with the most room to move. A piece already boxed into a corner is little use to them anyway.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — flying and the 10-turn rule',
        blocks: [
          { type: 'p', text: 'At three pieces you can fly, which lets you block an enemy mill point anywhere. But one more capture and you lose, and the 10-turn stall count begins.' },
          { type: 'list', items: [
            '**Three against many**: the larger side must build a shape that threatens two places at once (two lines with two each), because a flier can block only one per turn. If it cannot within ten turns, the stall rule ends the round — still in favour of the side with more pieces, so there is no need to rush.',
            '**Three against three**: both sides fly and keep blocking each other’s mill points. After ten turns equal numbers make it a draw. Whoever blocks the other’s double threat while building one of their own wins.',
            '**If you are the smaller side**: the stall rule favours the side with more pieces. Flying around to survive loses when the count runs out. Before then you must take a piece — resetting the count — or level the numbers.',
            '**Prepare before you fly**: at four pieces, one capture leaves you three and flying. Arrange your remaining pieces in advance so they already aim at two lines the moment you can fly.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Chasing an early mill**: you make one mill while placing, but your pieces end up cornered and blocked once moving starts.',
            '**Missing their two-in-a-row**: miss one while placing and you lose a piece at once.',
            '**Targeting pieces in mills**: under the show’s rules they cannot be taken. An opponent who keeps a mill shrinks your choice of targets.',
            '**Opening a mill into a closed door**: check whether the opponent can take the point your piece must return to.',
            '**Forgetting the stall count**: once someone is down to three, the 10-turn count runs, and time works against the side with fewer pieces.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — the AI OTTO and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games (OTTO)', 'Best of three; you are black (first) in round one and colours swap every round. Drawn rounds do not count, up to five rounds in all. There is no clock.'],
            ['Easy', 'Looks only two half-moves ahead and its judgement wobbles a lot, so it slips often.'],
            ['Normal', 'Reads three half-moves ahead: it sees immediate mills and blocks, but misses longer plans.'],
            ['Hard', 'Reads six half-moves ahead, one more in the endgame when few pieces are left. It picks among near-equal moves, so replaying a line that once beat it rarely wins the same way twice.'],
            ['Friend rooms', 'Create a room with a link or 4-digit invite code. Black in round one is random and swaps every round. Moves are 90, 60 or 30 seconds; on a timeout a random move is played, and three in a row lose the round.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Mill', def: 'Three of your pieces on a straight line of three points. Making one removes an enemy piece.' },
            { term: 'Placing phase', def: 'Taking turns putting the nine pieces on empty points.' },
            { term: 'Moving phase', def: 'After placing, moving one piece a step along a line to an empty neighbour.' },
            { term: 'Flying', def: 'Moving to any empty point when you have exactly three pieces left.' },
            { term: 'Running mill', def: 'Opening a mill and closing it again to make a new mill every other turn.' },
            { term: 'Double mill', def: 'A shape where one piece shuttling between two points completes a different mill each time.' },
            { term: '10-turn stall', def: 'Once someone is down to three, ten turns each without a capture end the round; fewer pieces loses.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Are these the rules from The Devil’s Plan?', a: 'Yes: nine pieces, protected mills, flying at three, losing at two, the side with fewer pieces losing after ten capture-free turns once someone is down to three, and best of three. Colours swap every round.' },
      { q: 'Can I take a piece that is in a mill?', a: 'No. Pieces in a mill are safe, and if every enemy piece is in one, your mill takes nothing.' },
      { q: 'Do two mills at once take two pieces?', a: 'No. One move removes at most one piece.' },
      { q: 'What happens when I am down to three?', a: 'If all nine have been placed, you can fly to any empty point. At the same time the 10-turn stall count begins.' },
      { q: 'How strong is the AI?', a: 'Easy slips often, Normal reads three half-moves and Hard six. Beat Hard to earn the hard-clear certificate.' },
      { q: 'How do I play with a friend?', a: 'Create a room under Play with friends to get an invite link and a 4-digit code. Your friend opens the link or enters the code.' },
    ],
    cta: { title: 'Ready to run a mill?', body: 'Take the junctions while placing, and in the moving phase open your mill towards a point the opponent cannot reach.', button: 'Play Nine Men’s Morris' },
  },
};

export default guide;
