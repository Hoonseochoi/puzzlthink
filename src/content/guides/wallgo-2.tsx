// 벽바둑 II guide. Rules and numbers follow src/lib/wallgo.ts (MODES2, kindsToPlace, placementOrder, getMoveOptions2,
// getWallOptions, getTerritory incl. the "frozen" case, noOneCanMove, getWinners with tiebreakLargest, chooseBotAction
// levels), src/components/WallGoGame.tsx (90-second turns, random move/wall on timeout, turn skip, take-back before the
// wall, random first mover in 1:1, hell = 1:1 only), src/lib/wallgoRoom.ts (TURN_MS 90 s, random order in rooms),
// src/lib/wallgoHell.ts + wallgoHellClient.ts (iterative deepening, 1.5 s per move, 1 s on touch screens) and the
// WallGo2Guide / WallGo messages in src/messages/ko.json.
// WallGoDiagram draws every piece the same way, so captions say which piece is square (□) and which is round (○).
// Coordinates as in WallGoDiagram: columns A–G, rows 1–7 from the top. Player 0 is red (you), 1 blue, 2 grey.
import WallGoDiagram, { type DiagramSpec } from '@/components/WallGoDiagram';
import type { GameGuide } from './types';

const fig = (spec: DiagramSpec, label: string) => <WallGoDiagram spec={spec} label={label} />;

// A square piece on D4: 1–2 squares in one straight line, 8 destinations.
const SQUARE: DiagramSpec = {
  pieces: [[0, 'D4']],
  moves: [['D4', 'D3'], ['D3', 'D2'], ['D4', 'D5'], ['D5', 'D6'], ['D4', 'C4'], ['C4', 'B4'], ['D4', 'E4'], ['E4', 'F4']],
};
// A round piece on D4: one step, then optionally a 90° turn for one more — 4 neighbours + 4 diagonals.
const ROUND: DiagramSpec = {
  pieces: [[0, 'D4']],
  moves: [['D4', 'D3'], ['D3', 'C3'], ['D3', 'E3'], ['D4', 'D5'], ['D5', 'C5'], ['D5', 'E5'], ['D4', 'C4'], ['D4', 'E4']],
};
// Round piece on D4 with a wall above it and a blue piece on C4: D3 is shut, and C3 is shut too (both paths to it are blocked).
const ROUND_BLOCKED: DiagramSpec = {
  pieces: [[0, 'D4'], [1, 'C4']],
  walls: [['D4', 'up']],
  moves: [['D4', 'E4'], ['E4', 'E3'], ['E4', 'E5'], ['D4', 'D5'], ['D5', 'C5']],
  blocked: ['D3', 'C3'],
};
// Round 1 wall break: the square piece on B2 crosses the wall on its right and goes on to D2.
const BREAK: DiagramSpec = {
  pieces: [[0, 'D2'], [0, 'E6'], [1, 'E5'], [1, 'F2'], [2, 'B6'], [2, 'A4']],
  walls: [['B2', 'down'], ['A2', 'down'], ['A1', 'right'], ['D2', 'down']],
  broken: [['B2', 'right']],
  breakMoves: [['B2', 'C2'], ['C2', 'D2']],
};
// Round 2 start: each player's two round pieces on fixed squares.
const DUEL_START: DiagramSpec = { pieces: [[0, 'B2'], [0, 'F6'], [1, 'F2'], [1, 'B6']] };
// After placement: red □ D4, □ C5; blue □ D3, □ E4. Red's □ D4 is pinned on two sides.
const AFTER_PLACE: DiagramSpec = {
  pieces: [[0, 'B2'], [0, 'F6'], [0, 'D4'], [0, 'C5'], [1, 'F2'], [1, 'B6'], [1, 'D3'], [1, 'E4']],
  moves: [['D4', 'D5'], ['D5', 'D6'], ['D4', 'C4'], ['C4', 'B4']],
};
// The gate: walls down the C|D line except C4|D4. Only red's □ on D6 can reach D4 and close it this turn.
const GATE: DiagramSpec = {
  pieces: [[0, 'D6'], [0, 'B2'], [0, 'F6'], [0, 'A5'], [1, 'F4'], [1, 'B6'], [1, 'F2'], [1, 'G6']],
  walls: [['C1', 'right'], ['C2', 'right'], ['C3', 'right'], ['C5', 'right'], ['C6', 'right'], ['C7', 'right']],
  moves: [['D6', 'D5'], ['D5', 'D4']],
  danger: [['C4', 'right']],
};
// Self-trap: a round piece in a 1-wide corridor. With walls on three sides it has one exit left.
const CORRIDOR: DiagramSpec = {
  pieces: [[0, 'A4'], [1, 'B6']],
  walls: [['A4', 'right'], ['A3', 'right'], ['A5', 'right'], ['A2', 'down']],
  danger: [['A5', 'down']],
  zones: [{ player: 0, cells: ['A3', 'A4', 'A5'] }],
};

const guide: GameGuide = {
  game: 'wallgo2',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['wallgo', 'pointOmok', 'colorLinkDuel', 'nineMensMorris'],
  ko: {
    meta: {
      title: '벽바둑 II 공략 — 사각 말·원형 말 움직임, 동률 규칙, 1:1 배치 요령 | PUZZLTHINK',
      description: '데블스플랜3 감옥매치 10화 벽바둑 2(II) 공략. 사각 말과 원형 말이 닿는 칸, 제자리가 없을 때 생기는 일, 경로 위 벽 부수기, 동률이면 큰 방이 이기는 규칙, 1:1 배치와 길목 닫기, AI 매우 어려움까지 정리했어요.',
      keywords: ['벽바둑 2 공략', '벽바둑 II 공략', '벽바둑2 규칙', '벽바둑 2 전략', '감옥매치 벽바둑', '데블스플랜3 벽바둑 2', '벽바둑 원형 말', '벽바둑 사각 말', '벽바둑 2 이기는 법'],
    },
    title: '벽바둑 II 공략',
    lead: '곧게 뻗는 사각 말, 모퉁이를 도는 원형 말. 그리고 멈출 수 없는 차례.',
    intro: [
      '벽바둑 II는 7×7 판에서 말을 옮기고, 옮긴 말 옆에 벽을 하나씩 세워 가장 넓은 구역을 차지하는 게임이에요. 벽바둑과 뼈대는 같지만 **말이 사각·원형 두 종류로 나뉘고, 제자리에 머무를 수 없고, 동률이면 가장 큰 방 하나로 순위를 가린다**는 세 가지가 판을 완전히 바꿔 놓아요. 한 칸 덜 가거나 더 가는 차이가 그대로 영역 차이가 돼요.',
      '이 공략은 두 말이 정확히 어느 칸에 닿는지부터 시작해, 헷갈리는 장면, 1:1 배치를 따라 두는 예시, 단계별 전략과 자주 하는 실수, AI와 친구 방에 대한 메모를 차례로 다뤄요. 좌표는 가로 A~G, 세로 1~7(위에서부터)이고, 그림의 말은 모두 동그랗게 그려지니 설명에 □(사각)·○(원형)로 적어 둘게요.',
    ],
    gamePageTitle: '벽바둑 II — 사각 말과 원형 말로 영역을 나누는 법',
    summary: '두 말이 닿는 칸, 동률 규칙, 1:1 배치와 길목 닫기, 매우 어려움 AI까지.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '벽바둑 II는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '벽바둑 II는 「데블스 플랜: 데드 어게인」(데블스플랜3) 감옥매치 10화에 나온 게임이에요. 앞서 나온 벽바둑을 바탕으로 말의 종류와 움직임, 벽 부수기와 동률 처리를 바꿨어요. PUZZLTHINK에서는 방송과 같은 두 라운드 구성을 그대로 골라 둘 수 있어요.' },
          { type: 'table', head: ['', '1라운드 (3인전)', '2라운드 (1:1)'], rows: [
            ['내 말', '□ 1개 + ○ 1개', '□ 2개 + ○ 2개'],
            ['직접 놓는 말', '둘 다', '□ 2개 (○ 2개는 고정 칸)'],
            ['놓는 순서', '1→2→3, 다시 3→2→1', '선→후→후→선'],
            ['벽 부수기', '각자 게임 중 한 번', '없음'],
          ] },
          { type: 'p', text: '벽바둑에서 가장 자주 쓰던 "제자리에서 벽만 세우기"가 사라졌기 때문에, 벽바둑 II에서는 말이 움직일 공간 자체가 자원이에요. 좁은 곳에 들어간 말은 곧 움직일 수 없게 되고, 움직일 수 없는 말은 고를 수도 없어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**배치**: 빈칸 아무 데나 내 말을 하나씩 놓아요. 1라운드는 놓을 때마다 □와 ○ 중 남은 것을 골라요. 2라운드는 ○ 두 개가 B2·F6(나), F2·B6(상대)에 미리 놓여 있고 □ 두 개만 놓아요.',
            '**이동**: 내 차례에 말 하나를 골라 반드시 움직여요. □는 상하좌우 한 방향으로 곧게 1칸 또는 2칸, ○는 상하좌우로 1칸 간 뒤 원하면 왼쪽이나 오른쪽으로 꺾어 1칸 더 가요.',
            '**막힘**: 다른 말이 있는 칸으로는 들어가지도 지나가지도 못하고, 벽을 넘을 수 없어요. 판 가장자리도 벽과 같아요.',
            '**벽 세우기**: 이동을 마친 말의 네 면 중 아직 벽이 없는 면(가장자리 제외) 하나에 반드시 벽을 세워요. 그래서 벽을 세울 면이 남지 않는 칸으로는 이동할 수 없어요.',
            '**벽 부수기 (1라운드만)**: 게임 중 한 번, 이동 경로 위의 벽 하나를 부수고 지나갈 수 있어요.',
            '**시간**: 한 차례(이동+벽)는 90초예요. 시간이 다 되면 무작위 이동과 무작위 벽이 자동으로 두어져요.',
            '**종료**: 모든 플레이어의 말이 벽으로 서로 다른 구역에 갇히는 순간, 또는 아무도 움직일 수 없게 되는 순간 끝나요.',
            '**점수**: 내 말이 있는 구역의 칸 수를 모두 더해요. 가장 많은 사람이 이기고, 합이 같으면 **가장 큰 구역 하나의 크기**가 큰 사람이 이겨요. 그것까지 같으면 공동 승리예요.',
          ] },
          { type: 'h3', text: '두 말이 닿는 칸' },
          { type: 'cards', items: [
            { title: '□ 사각 말 — 직선 8칸', body: '가운데 D4에서 위·아래·왼쪽·오른쪽으로 1칸이나 2칸, 모두 8칸에 닿아요. 2칸을 갈 때는 바로 앞 칸이 비어 있고 그 사이에 벽이 없어야 해요. 꺾을 수는 없어요.', figure: fig(SQUARE, '사각 말이 닿는 칸') },
            { title: '○ 원형 말 — 이웃 4칸 + 대각선 4칸', body: '1칸 간 뒤 90도로 꺾어 1칸 더 가므로, 이웃한 4칸과 대각선 4칸에 닿아요. 곧게 2칸은 갈 수 없어요. 대각선 칸에는 두 갈래 길(먼저 세로로, 또는 먼저 가로로)이 있어요.', figure: fig(ROUND, '원형 말이 닿는 칸') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '○ 길 막힘', title: '대각선 칸은 두 길이 다 막혀야 막혀요', body: '○ D4 위쪽에 벽이 있고 왼쪽 C4에 상대 말이 있어요. D3은 벽 때문에, C4는 말 때문에 못 가요. C3으로 가는 길은 D3을 거치거나 C4를 거치는 두 갈래뿐인데 둘 다 막혀서 C3도 못 가요. 반면 E3은 E4를 거쳐, C5와 E5는 D5나 E4를 거쳐 갈 수 있어요. 한쪽 길만 막혔다면 대각선 칸은 여전히 갈 수 있다는 점을 기억하세요.', figure: fig(ROUND_BLOCKED, '길이 막힌 원형 말') },
            { tag: '벽 부수기', title: '부수는 벽은 경로 위 아무 곳이나 하나', body: '1라운드의 벽 부수기는 말 바로 옆 벽만이 아니라 이동하는 길 위의 벽 하나를 부숴요. 그림의 □는 B2 오른쪽 벽을 부수고 C2를 지나 D2까지 갔어요. 한 번 이동에 벽은 하나만 넘을 수 있고, 다른 말은 여전히 지나갈 수 없어요. 화면에서는 부숴야만 갈 수 있는 칸이 빨간색으로 표시되고, 부수지 않고도 갈 수 있는 칸은 부수지 않는 이동으로 처리돼요.', figure: fig(BREAK, '경로 위 벽 부수기') },
          ] },
          { type: 'cards', items: [
            { title: '움직일 수 있는 말이 없으면?', body: '제자리가 없으니, 갈 곳이 없는 말은 고를 수 없어요. 내 말이 모두 움직일 수 없으면 그 차례는 자동으로 건너뛰어요. 다른 사람은 계속 두고, 그 사이 벽이 바뀌어 길이 열리면 다시 둘 수 있어요.' },
            { title: '움직였는데 벽 세울 면이 없으면?', body: '그런 칸은 애초에 이동 후보에 나오지 않아요. 네 면이 모두 벽이거나 가장자리인 칸으로는 갈 수 없어요.' },
            { title: '벽을 세우기 전에 이동을 무를 수 있나요?', body: 'AI 대국에서는 벽을 세우기 전에 내 말을 다시 누르면 방금 한 이동이 취소되고 그 말을 다시 고를 수 있어요. 벽을 세우면 그 차례는 끝나요.' },
            { title: '벽 부수기를 안 쓴 사람이 있어도 끝나나요?', body: '네. 모든 말이 서로 다른 구역에 갇히면 벽 부수기가 남아 있어도 그 자리에서 끝나요. 아껴 두기만 하면 못 쓰고 끝날 수 있어요.' },
            { title: '서로 다른 사람 말이 한 구역에 남은 채 끝나면?', body: '아무도 움직일 수 없어서 끝났는데 한 구역에 여러 사람의 말이 섞여 있으면, 그 구역은 누구의 점수도 아니에요. 다만 말들이 완전히 꽁꽁 묶여 아무 데도 못 가는 경우엔 각자 자기 말이 선 1칸씩만 얻어요.' },
            { title: '시간이 다 되면 벽 부수기도 쓰나요?', body: '자동 이동은 부수지 않는 이동 중에서 무작위로 골라요. 부수지 않고는 갈 곳이 없을 때만 벽 부수기를 써요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 말의 성격대로 쓰기',
        blocks: [
          { type: 'p', text: '처음에는 두 말을 똑같이 다루다가 지는 경우가 많아요. □는 **멀리, 곧게**, ○는 **가까이, 비스듬히**. 이 차이만 몸에 익혀도 판이 훨씬 잘 보여요.' },
          { type: 'list', items: [
            '**길목은 □로 끊기**: 벽은 말이 멈춘 칸 옆에만 세울 수 있어요. 두 칸 떨어진 길목까지 한 번에 가서 벽을 세울 수 있는 건 □뿐이에요. 상대가 넘어오려는 통로가 2칸 거리에 있으면 □를 먼저 떠올리세요.',
            '**○는 탈출용으로 아끼기**: ○는 대각선으로 빠져나갈 수 있어서 좁은 곳에서도 잘 갇히지 않아요. 가운데 가까이에 두면 어느 방향 구역이든 뒤늦게 들어갈 수 있어요.',
            '**벽은 내 말 등 뒤에**: 세운 벽이 내 말과 상대 말 사이에 오도록 세우세요. 내 말 앞(내 구역 안쪽)에 세운 벽은 내 방을 좁히기만 해요.',
            '**두기 전 "다음 차례에 움직일 수 있나" 확인**: 이번에 세운 벽으로 내 말 주변 세 면이 막히면, 상대가 남은 한 면만 막아도 그 말은 고를 수 없는 말이 돼요.',
          ] },
          { type: 'callout', tone: 'tip', title: '1라운드 배치 순서 이용하기', text: '1라운드는 1→2→3→3→2→1 순서로 놓아요. 1번은 첫 말과 마지막 말을, 3번은 두 말을 연달아 놓아요. 먼저 놓는 사람은 ○를 가운데 가까이, 연달아 놓는 사람은 두 말을 서로 다른 넓은 빈 곳에 나눠 놓는 게 무난해요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 두기 — 2라운드(1:1) 배치와 첫 수',
        lead: '고정된 ○ 네 개에서 출발해 □ 네 개가 놓이고, 첫 차례에 어떤 이동이 가능한지 직접 세어 봐요.',
        blocks: [
          { type: 'steps', items: [
            { title: '시작: ○ 네 개가 고정 칸에', body: '내(빨강) ○는 B2와 F6, 상대(파랑) ○는 F2와 B6에 있어요. 각자 왼쪽 위·오른쪽 아래, 오른쪽 위·왼쪽 아래 모서리 근처를 하나씩 맡는 모양이라, 가운데 D열·4행을 누가 쥐느냐가 첫 싸움이에요. 선은 무작위로 정해져요.', figure: fig(DUEL_START, '2라운드 시작 배치') },
            { title: '배치: 선→후→후→선', body: '선인 내가 □를 D4에 놓았어요. 상대는 연달아 □ 두 개를 D3과 E4에 붙여 내 D4의 위와 오른쪽을 막았어요. 나는 마지막 □를 C5에 놓았어요. 연달아 놓는 쪽(후)은 이렇게 상대 말을 바로 옆에서 누르는 배치를 할 수 있어요.', figure: fig(AFTER_PLACE, '배치가 끝난 모습') },
            { title: '첫 차례: 갈 수 있는 칸 세기', body: '□ D4는 위(D3)와 오른쪽(E4)이 막혀 D5·D6·C4·B4 네 칸뿐이에요. 반면 □ C5는 C4·C3·C6·C7·B5·A5·D5·E5 여덟 칸, ○ B2와 ○ F6도 각각 여덟 칸에 닿아요. 눌린 말을 먼저 풀어 줄지, 넓은 말로 땅을 먼저 넓힐지를 고르는 장면이에요. 눌린 D4를 그대로 두면 상대가 D5나 C4를 막을 때 갈 곳이 두 칸으로 줄어요.' },
            { title: '벽을 어디에 세울까', body: '예를 들어 □ D4를 D6으로 내리면, D6의 네 면 중 오른쪽(E6 쪽)에 벽을 세워 F6의 ○와 함께 오른쪽 아래를 내 방으로 굳히는 방향을 잡을 수 있어요. 왼쪽(C6 쪽)에 세우면 B6의 파랑 ○를 왼쪽 아래에 가두는 쪽으로 쓰이고요. 같은 이동이라도 벽 방향에 따라 계획이 달라져요.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 문 닫기와 "고를 수 없는 말"',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '문 닫기', title: '한 칸짜리 틈은 닿는 말이 먼저 닫아요', body: 'C열과 D열 사이에 벽이 늘어서 있고 C4|D4 한 곳만 열려 있어요. 이 틈을 닫으려면 D4나 C4에 멈춰서 그 면에 벽을 세워야 해요. 내 □ D6은 D5를 지나 D4까지 곧게 2칸이라 이번 차례에 닫을 수 있어요. 같은 자리의 ○였다면 D5나 대각선 칸까지만 가서 닫지 못해요. 틈까지의 거리를 □ 기준(직선 2칸)과 ○ 기준(꺾어서 2칸)으로 따로 세는 습관을 들이세요.', figure: fig(GATE, '틈을 닫는 사각 말') },
          ] },
          { type: 'list', items: [
            '**상대 말을 "고를 수 없게" 만들기**: 벽바둑 II에서는 갈 곳이 없는 말은 아예 쓸 수 없어요. 상대 말 주변에 벽을 쌓아 움직임을 없애면, 상대는 남은 말로만 두어야 해서 선택지가 크게 줄어요. 단, 그 말이 있는 구역은 여전히 상대 점수가 될 수 있으니, 가둘 때는 작은 방에 가두세요.',
            '**두 말을 서로 다른 방에**: 1:1에서 내 말 네 개가 모두 한 방에 있으면, 그 방이 크지 않은 한 점수가 늘지 않아요. 반대로 너무 잘게 나누면 동률 판정에서 불리해요. 큰 방 하나 + 작은 방 하나 정도가 다루기 쉬워요.',
            '**상대 차례를 세기**: 1:1에서는 내가 한 번 두면 상대도 한 번 둬요. 내가 틈 두 개를 동시에 위협하면 상대는 하나만 막을 수 있어요. 반대로 상대에게 두 개의 틈을 동시에 주면 하나는 뚫려요.',
            '**○의 두 갈래 길 끊기**: 상대 ○가 대각선 칸으로 빠져나가는 걸 막으려면 두 갈래 길을 모두 끊어야 해요. 한쪽만 막는 벽은 ○에게는 거의 의미가 없어요.',
          ] },
          { type: 'callout', tone: 'note', title: '벽 부수기의 값 (1라운드)', text: '부수기는 경로 위의 벽 하나를 지나가게 해 줘서, 거의 닫힌 방에서 큰 방으로 넘어가는 "탈출권"이에요. 상대들도 각자 한 번씩 갖고 있으니, 벽 한 장 너머에 상대 말이 있는 경계는 아직 닫힌 게 아니라고 보세요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 끝내기 계산과 동률 판정',
        blocks: [
          { type: 'p', text: '판이 거의 갈라지면 남은 경계 하나하나가 몇 칸짜리인지 세어 보세요. 7×7은 49칸이라, 1:1에서 25칸이면 반드시 이기고 24.5칸 근처의 싸움은 동률 판정까지 갈 수 있어요. 동률일 때는 **합계가 아니라 가장 큰 방 하나**를 비교하니, 같은 24칸이라도 24칸 한 방이 14칸+10칸 두 방을 이겨요.' },
          { type: 'table', caption: '동률 판정 예시 (1:1)', head: ['나', '상대', '결과'], rows: [
            ['24칸 (한 방)', '24칸 (16+8)', '나의 승리 — 가장 큰 방 24 > 16'],
            ['24칸 (12+12)', '24칸 (12+12)', '공동 승리'],
            ['25칸 (13+12)', '24칸 (한 방)', '나의 승리 — 합계가 먼저'],
          ] },
          { type: 'list', items: [
            '**마지막 벽은 내가 세우게**: 판을 완전히 가르는 마지막 벽을 세우는 순간 바로 끝나요. 경계가 하나 남았을 때 그걸 닫는 사람이 누구인지, 닫는 쪽의 방이 더 큰지를 먼저 계산하세요.',
            '**억지 벽을 흡수할 방 만들기**: 매 차례 벽을 반드시 세워야 해서, 판이 갈라진 뒤에도 게임이 이어지는 동안은 내 방 안에 벽을 세워야 할 때가 있어요. 안쪽 벽이 방을 쪼개지 않도록, 넓고 네모난 방이 길쭉한 방보다 안전해요.',
            '**움직일 공간 = 남은 차례**: 내 말이 모두 갇히면 나는 차례를 건너뛰고 상대만 둬요. 상대가 그 시간에 경계를 마음대로 다듬을 수 있으니, 마지막까지 움직일 수 있는 말 하나는 남겨 두세요.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: '자기 함정', title: '한 줄짜리 복도에 들어간 ○', body: '○ A4는 오른쪽이 벽이고 위아래로만 A3~A5를 오갈 수 있어요. 여기서 A5 아래 면까지 막히면, 이 말은 세 칸짜리 복도에 갇혀 3점짜리 말이 돼요. 게다가 벽을 세울 때마다 복도의 면을 써야 해서 곧 움직일 수 없게 돼요. ○의 장점인 대각선 탈출은 옆으로 열린 칸이 있어야만 쓸 수 있어요.', figure: fig(CORRIDOR, '복도에 갇히기 직전의 원형 말') },
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**벽바둑처럼 "제자리"를 기대하기**: 벽바둑 II에는 제자리가 없어요. 좋은 자리에 있는 말도 차례가 오면 반드시 비켜야 해요. 두 칸 이상 자유롭게 오갈 수 있는 자리를 남겨 두세요.',
            '**○로 곧게 2칸 가려고 하기**: ○는 2칸째에 반드시 꺾어요. 2칸 떨어진 틈을 닫을 수 있는 건 □뿐이에요.',
            '**□를 가장자리에 붙이기**: □는 꺾지 못해서, 가장자리나 모서리에서는 갈 수 있는 방향이 둘로 줄어요. 상대가 벽 두 장만 세우면 고를 수 없는 말이 돼요.',
            '**벽 부수기를 끝까지 아끼기**: 모두가 갈라지면 남은 부수기와 상관없이 끝나요. 쓸 기회가 왔을 때 큰 방으로 넘어갈 수 있다면 쓰는 게 이득이에요.',
            '**합계만 보고 방을 쪼개기**: 동률이면 가장 큰 방이 이겨요. 1~2칸을 더 얻으려고 내 큰 방을 반으로 가르는 벽은 동률 판정에서 손해가 될 수 있어요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 매우 어려움, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 3인전', '나는 항상 1번(가장 먼저 놓고 마지막에 한 번 더 놓는 자리)이에요. AI 두 명과 벽 부수기가 있는 1라운드 규칙으로 둬요.'],
            ['AI 1:1', '2라운드 규칙이에요. 선은 매 판 무작위로 정해져요.'],
            ['쉬움', '괜찮은 수 절반 가운데서 무작위로 골라 실수가 잦아요.'],
            ['보통', '바로 끝낼 수 있는 수는 놓치지 않고, 그 밖에는 상위 세 수 중 하나를 골라요.'],
            ['어려움', '좋은 후보마다 다음 사람의 최선 응수(3인전에서는 세 번째 사람까지)를 읽고 골라요.'],
            ['매우 어려움', '1:1 전용이에요. 한 차례(이동+벽)를 한 수로 보고 몇 차례 앞까지 깊게 읽어요. 한 수에 1.5초(터치 화면에서는 1초) 정도 생각하고, 판이 단순해지면 끝까지 읽어요. AI 헬모드 페이지에서도 시작할 수 있어요.'],
            ['친구 방', '링크나 4자리 코드로 방을 만들어 실시간으로 둬요. 한 차례는 90초이고, 놓는 순서는 무작위로 정해져요. 오픈 대전에 방을 열면 모르는 사람과도 둘 수 있어요.'],
            ['복기', '끝난 판은 배치·이동·벽 하나하나를 다시 볼 수 있어요. 어디서 방이 쪼개졌는지 확인해 보세요.'],
          ] },
          { type: 'callout', tone: 'note', title: '2라운드 선은 무작위예요', text: '방송에서는 1라운드 결과로 2라운드 선을 정했지만, PUZZLTHINK에서는 두 라운드를 따로 두기 때문에 1:1의 선은 AI 대국과 친구 방 모두 무작위로 정해져요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '□ 사각 말', def: '상하좌우 한 방향으로 곧게 1~2칸 움직이는 말.' },
            { term: '○ 원형 말', def: '1칸 간 뒤 90도 꺾어 1칸 더 갈 수 있는 말. 이웃 4칸과 대각선 4칸에 닿아요.' },
            { term: '구역(방)', def: '벽과 가장자리로 둘러싸여 서로 이어진 칸들. 내 말만 있는 구역의 칸 수가 내 점수예요.' },
            { term: '분리', def: '모든 플레이어의 말이 서로 다른 구역에 놓인 상태. 이렇게 되는 순간 게임이 끝나요.' },
            { term: '벽 부수기', def: '1라운드에서 각자 한 번, 이동 경로 위의 벽 하나를 부수고 지나가는 것.' },
            { term: '고정 칸', def: '2라운드에서 ○가 미리 놓이는 칸. 나는 B2·F6, 상대는 F2·B6이에요.' },
            { term: '동률 판정', def: '점수 합이 같을 때 가장 큰 구역 하나의 크기로 순위를 가리는 규칙.' },
            { term: '틈(문)', def: '두 구역을 잇는 마지막 열린 면. 여기에 벽이 서면 구역이 나뉘어요.' },
            { term: '차례 건너뛰기', def: '내 말이 모두 움직일 수 없을 때 차례가 자동으로 넘어가는 것.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '벽바둑과 벽바둑 II는 무엇이 다른가요?', a: '말이 □(곧게 1~2칸)와 ○(1칸 후 꺾어서 1칸)로 나뉘고, 제자리에 머무를 수 없어요. 벽 부수기는 경로 위의 벽을 부수고, 점수가 같으면 가장 큰 구역으로 순위를 가려요.' },
      { q: '원형 말로 두 칸 곧게 갈 수 있나요?', a: '아니요. ○는 1칸 간 뒤 꺾어야만 2칸째를 갈 수 있어서, 결과적으로 이웃한 칸이나 대각선 칸에만 도착해요.' },
      { q: '내 말이 모두 갇히면 어떻게 되나요?', a: '움직일 수 있는 말이 없으면 그 차례는 자동으로 건너뛰어요. 모든 사람이 움직일 수 없게 되면 게임이 끝나요.' },
      { q: '점수가 같으면 누가 이기나요?', a: '가장 큰 구역 하나의 칸 수가 큰 사람이 이겨요. 그것까지 같으면 공동 승리예요.' },
      { q: '2라운드에서 원형 말은 어디서 시작하나요?', a: '내 ○는 B2와 F6, 상대 ○는 F2와 B6의 고정 칸에서 시작해요. 직접 놓는 건 □ 두 개뿐이에요.' },
      { q: '매우 어려움은 3인전에서도 할 수 있나요?', a: '아니요. 매우 어려움은 1:1 전용이에요. 3인전은 쉬움·보통·어려움 중에서 골라요.' },
    ],
    cta: { title: '두 말로 한 판 해 볼까요?', body: '1:1 배치부터 따라 해 보세요. □로 길목을 끊고 ○로 빠져나가는 감각이 금방 잡혀요.', button: '벽바둑 II 하러 가기' },
    disclaimer: 'PUZZLTHINK는 넷플릭스·데블스플랜과 관련 없는 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요.',
  },
  en: {
    meta: {
      title: 'Wall Go 2 (Wallgo II) strategy — square and round pieces, ties, 1:1 setup | PUZZLTHINK',
      description: 'A guide to Wallgo II from The Devil’s Plan 3 prison match, episode 10: where square and round pieces can go, what happens with no staying put, the wall break on the path, the biggest-room tiebreak, 1:1 setup and closing gates, and the Very Hard AI.',
      keywords: ['Wall Go 2 strategy', 'Wall Go 2 rules', 'Wallgo II strategy', 'Wallgo 2 rules', 'Wallgo 2 guide', 'Devil’s Plan 3 Wallgo 2', 'Wallgo round piece', 'Wallgo square piece', 'how to win Wallgo 2'],
    },
    title: 'Wallgo II strategy guide',
    lead: 'Square pieces run straight, round pieces turn corners — and nobody gets to stand still.',
    intro: [
      'Wallgo II is played on a 7×7 board: move a piece, build a wall beside it, and end with the largest territory. The skeleton is the same as Wallgo, but three changes transform the game: **there are square and round pieces, you can never stay put, and a tie goes to whoever has the biggest single room.** One square more or less of movement turns straight into territory.',
      'This guide starts with exactly which squares each piece reaches, then covers the tricky situations, a 1:1 setup played out move by move, strategy by level, common mistakes and notes on the AI and friend rooms. Coordinates are columns A–G and rows 1–7 from the top. The diagrams draw every piece as a disc, so the text marks them □ (square) and ○ (round).',
    ],
    gamePageTitle: 'Wallgo II — splitting the board with square and round pieces',
    summary: 'Where each piece reaches, the tiebreak, 1:1 setup and closing gates, and the Very Hard AI.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Wallgo II?',
        blocks: [
          { type: 'p', text: 'Wallgo II appeared in episode 10 of the prison match in The Devil’s Plan: Dead Again (The Devil’s Plan 3). It builds on the earlier Wallgo and changes the pieces and how they move, the wall break and how ties are settled. On PUZZLTHINK you can play either of the show’s two rounds.' },
          { type: 'table', head: ['', 'Round 1 (3 players)', 'Round 2 (1:1)'], rows: [
            ['Your pieces', '1 □ + 1 ○', '2 □ + 2 ○'],
            ['Pieces you place', 'both', 'the 2 □ (the ○ start on fixed squares)'],
            ['Placement order', '1→2→3, then 3→2→1', 'first → second → second → first'],
            ['Wall break', 'once per player per game', 'none'],
          ] },
          { type: 'p', text: 'Wallgo’s most common move — staying put and only building a wall — is gone. In Wallgo II, room to move is itself a resource: a piece that walks into a tight spot soon cannot move, and a piece that cannot move cannot be chosen.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Placement**: put your pieces one at a time on any empty square. In round 1 you choose □ or ○ each time from what you have left. In round 2 the round pieces already stand on B2 and F6 (you) and F2 and B6 (opponent); you place only the two □.',
            '**Moving**: on your turn pick one piece and move it — moving is compulsory. A □ goes 1 or 2 squares in one straight line. A ○ goes 1 square and may then turn left or right for 1 more.',
            '**Blocking**: you cannot move onto or through another piece, or through a wall. The board edge counts as a wall.',
            '**Building**: after moving, build a wall on one side of that piece that has no wall yet (not the board edge). So you can never move to a square with no free side left.',
            '**Wall break (round 1 only)**: once per game you may knock down one wall on your path and pass through it.',
            '**Time**: a turn (move + wall) has 90 seconds. When it runs out, a random move and a random wall are played for you.',
            '**End**: the game ends the moment every player’s pieces are walled into separate areas, or when nobody can move.',
            '**Score**: add up the squares of the areas your pieces are in. Highest total wins; on equal totals, the **largest single area** wins; if that is equal too, it is a shared win.',
          ] },
          { type: 'h3', text: 'Where the two pieces reach' },
          { type: 'cards', items: [
            { title: '□ Square — 8 straight squares', body: 'From D4 it reaches 1 or 2 squares up, down, left or right: 8 squares in all. For 2 squares the square in between must be empty with no wall on the way. It cannot turn.', figure: fig(SQUARE, 'Where a square piece reaches') },
            { title: '○ Round — 4 neighbours + 4 diagonals', body: 'One step, then an optional 90° turn for one more, so it reaches the 4 neighbouring squares and the 4 diagonal ones. It can never go 2 straight. Each diagonal has two routes: vertical first or horizontal first.', figure: fig(ROUND, 'Where a round piece reaches') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations — what happens if…',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '○ BLOCKED', title: 'A diagonal is closed only when both routes are', body: 'The ○ on D4 has a wall above it and a blue piece on its left (C4). D3 is shut by the wall and C4 by the piece. C3 can only be reached through D3 or through C4, and both are blocked, so C3 is out too. E3 is still reachable through E4, and C5 and E5 through D5 or E4. If only one route is blocked, the diagonal is still open.', figure: fig(ROUND_BLOCKED, 'A blocked round piece') },
            { tag: 'WALL BREAK', title: 'Break any one wall on the path', body: 'Round 1’s wall break is not limited to walls next to the piece: you break one wall anywhere on the path you take. Here the □ broke the wall on B2’s right, passed C2 and stopped on D2. A move can cross only one wall, and pieces still block. On screen, squares you can only reach by breaking are shown in red; a square you can reach without breaking is always played as a normal move.', figure: fig(BREAK, 'Breaking a wall on the path') },
          ] },
          { type: 'cards', items: [
            { title: 'What if none of my pieces can move?', body: 'With no staying put, a piece with nowhere to go cannot be picked. If none of yours can move, your turn is skipped automatically. Others keep playing, and if the walls change and a path opens you play again.' },
            { title: 'What if I move and have no side to build on?', body: 'Such a move is never offered. You cannot move to a square whose four sides are all walls or board edge.' },
            { title: 'Can I take back a move before building?', body: 'Against the AI, tapping one of your pieces before the wall goes down undoes the move and lets you pick again. Once the wall is built, the turn is over.' },
            { title: 'Does it end even if someone still has a wall break?', body: 'Yes. Once every piece is walled apart the game ends on the spot, unused breaks or not. Saved forever, a break may never be used.' },
            { title: 'What if pieces of different players share an area at the end?', body: 'If the game ends because nobody can move and an area still holds several players’ pieces, that area scores for nobody. If those pieces are completely locked in with nowhere to step, each scores just the one square it stands on.' },
            { title: 'Does a timeout use my wall break?', body: 'The automatic move picks at random among moves that do not break a wall. It only uses the break when there is no other way to move.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — play each piece to its nature',
        blocks: [
          { type: 'p', text: 'Most early losses come from treating the two pieces the same. □ is **far and straight**, ○ is **near and diagonal**. Getting that into your fingers makes the board far easier to read.' },
          { type: 'list', items: [
            '**Cut lanes with the □**: you can only build next to the square you stop on. Only the □ can travel two squares to a gap and wall it in the same turn. When the lane the opponent wants is two squares away, think □ first.',
            '**Keep the ○ for escapes**: the ○ slips out diagonally and is hard to trap in tight places. Kept near the centre, it can still join any area late.',
            '**Build behind your piece**: put the wall between your piece and theirs. A wall in front of your piece, inside your own area, only makes your room smaller.',
            '**Before moving, ask “can it move next turn?”**: if this wall leaves three sides of your piece closed, the opponent needs only the last side to make it a piece you cannot pick.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Use the round-1 placement order', text: 'Round 1 places in the order 1→2→3→3→2→1. Seat 1 places the first and the last piece; seat 3 places two in a row. Placing first, put the ○ near the centre; placing two in a row, spread them into two different open areas.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Play along — round 2 (1:1) setup and the first move',
        lead: 'Start from the four fixed ○, place the four □, then count exactly what the first turn allows.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Start: four ○ on fixed squares', body: 'Your (red) ○ stand on B2 and F6, the opponent’s (blue) on F2 and B6. Each side holds one piece near two opposite corners, so the first fight is over the centre — column D and row 4. Who moves first is random.', figure: fig(DUEL_START, 'Round 2 start') },
            { title: 'Placement: first → second → second → first', body: 'Moving first, you place a □ on D4. The opponent places two □ in a row, on D3 and E4, pressing on D4 from above and from the right. You put your last □ on C5. The second player’s double placement is what makes this kind of press possible.', figure: fig(AFTER_PLACE, 'After placement') },
            { title: 'Turn 1: count the options', body: '□ D4 is blocked above (D3) and to the right (E4), leaving only D5, D6, C4 and B4. □ C5 reaches eight squares: C4, C3, C6, C7, B5, A5, D5 and E5; ○ B2 and ○ F6 reach eight each. The choice is between freeing the pressed piece and expanding with a free one. Leave D4 alone and one blue wall at D5 or C4 cuts its options to two.' },
            { title: 'Which side gets the wall?', body: 'Say you move □ D4 down to D6. A wall on D6’s right (towards E6) starts sealing the bottom right as your room together with ○ F6; a wall on its left (towards C6) works instead at boxing blue’s ○ B6 into the bottom left. The same move serves different plans depending on the wall.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — closing gates and unpickable pieces',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'GATE', title: 'A one-square gap goes to whoever reaches it', body: 'Walls run down the line between columns C and D, with only C4|D4 open. To close it you must stop on D4 or C4 and wall that side. Your □ on D6 goes straight through D5 to D4 — two squares — and closes it this turn. A ○ on the same square would stop on D5 or a diagonal and could not. Count the distance to a gap twice: straight two for □, bent two for ○.', figure: fig(GATE, 'A square piece closing the gap') },
          ] },
          { type: 'list', items: [
            '**Make their pieces unpickable**: in Wallgo II a piece with nowhere to go cannot be used. Wall one in and the opponent must play with the rest, which cuts their choices sharply. Their area still scores for them, though, so trap pieces in small rooms.',
            '**Pieces in different rooms**: in 1:1, if all four of your pieces sit in one room, your score is just that room. Split too finely and the tiebreak goes against you. One big room plus one small room is easiest to handle.',
            '**Count turns**: in 1:1 every move of yours gets one reply. Threaten two gaps at once and they can close only one; give them two gaps at once and one will fall.',
            '**Cut both routes of a ○**: to stop an enemy ○ escaping diagonally you have to block both routes to that square. A wall across only one of them barely matters to a ○.',
          ] },
          { type: 'callout', tone: 'note', title: 'What the wall break is worth (round 1)', text: 'The break lets you pass one wall on your path — a ticket from an almost-closed room into a big one. Every opponent has one too, so a border with an enemy piece one wall away is not closed yet.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — counting the endgame and the tiebreak',
        blocks: [
          { type: 'p', text: 'When the board is nearly split, count how many squares each remaining border is worth. The board has 49 squares, so in 1:1 25 always wins, and fights around 24 can go to the tiebreak. The tiebreak compares **the largest single room, not the total**: a 24-square room beats 24 squares split 14 + 10.' },
          { type: 'table', caption: 'Tiebreak examples (1:1)', head: ['You', 'Opponent', 'Result'], rows: [
            ['24 (one room)', '24 (16 + 8)', 'You win — largest room 24 > 16'],
            ['24 (12 + 12)', '24 (12 + 12)', 'Shared win'],
            ['25 (13 + 12)', '24 (one room)', 'You win — the total comes first'],
          ] },
          { type: 'list', items: [
            '**Build the last wall yourself**: the wall that separates everyone ends the game at once. With one border left, work out who closes it and whether the closing side ends with more.',
            '**Keep a room that can absorb forced walls**: you must build a wall every turn, so while the game goes on you sometimes have to wall inside your own room. A wide, square-ish room survives inner walls better than a long thin one.',
            '**Room to move = turns left**: if all your pieces are stuck you skip and only the opponent plays, free to reshape the borders. Keep one piece that can still move until the end.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: 'SELF-TRAP', title: 'A ○ in a one-wide corridor', body: 'The ○ on A4 has a wall on its right and can only shuttle between A3 and A5. Close the side below A5 and it is locked in a three-square corridor — a three-point piece. Worse, every wall it builds uses up a corridor side, so it soon cannot move at all. A ○’s diagonal escape only works with an open square to the side.', figure: fig(CORRIDOR, 'A round piece about to be trapped in a corridor') },
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Expecting to stay put, as in Wallgo**: there is no staying put. Even a perfectly placed piece must step aside when its turn comes. Leave room to shuttle at least two squares.',
            '**Trying to go two straight with a ○**: a ○ always turns on its second step. Only a □ can close a gap two squares away.',
            '**Parking a □ on the edge**: a □ cannot turn, so on an edge or in a corner it has only two directions. Two enemy walls make it unpickable.',
            '**Hoarding the wall break**: when everyone is separated the game ends regardless. If a break can take you into a big room, use it.',
            '**Splitting a room for the total**: ties go to the largest room. A wall that halves your big room for one or two extra squares can lose the tiebreak.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, Very Hard and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI, 3 players', 'You are always seat 1 (first to place, and again last). Two AIs, round-1 rules with the wall break.'],
            ['AI, 1:1', 'Round-2 rules. The first player is drawn at random each game.'],
            ['Easy', 'Picks at random from the better half of its moves, so it slips often.'],
            ['Normal', 'Never misses a move that ends the game in its favour; otherwise picks one of its top three moves.'],
            ['Hard', 'For each promising move it reads the next player’s best reply (and, with three players, the third player’s too).'],
            ['Very Hard', '1:1 only. It treats a whole turn (move + wall) as one ply and reads several turns deep, thinking about 1.5 seconds a move (1 second on touch screens) and reading to the end once the board is simple. You can also start it from the AI Hell Mode page.'],
            ['Friend rooms', 'Create a room and share the link or 4-digit code to play live. Turns are 90 seconds and the placement order is drawn at random. Open a room in Open match to play strangers.'],
            ['Replay', 'Finished games can be stepped through placement by placement, move by move and wall by wall — find where your room was split.'],
          ] },
          { type: 'callout', tone: 'note', title: 'The round-2 first player is random', text: 'On the show, round 1 decided who started round 2. PUZZLTHINK plays the two rounds as separate games, so in 1:1 the first player is random, against the AI and in friend rooms alike.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: '□ Square piece', def: 'Moves 1–2 squares in one straight line.' },
            { term: '○ Round piece', def: 'Moves 1 square and may turn 90° for 1 more; reaches the 4 neighbours and 4 diagonals.' },
            { term: 'Area (room)', def: 'Connected squares enclosed by walls and the edge. Areas holding only your pieces are your score.' },
            { term: 'Separation', def: 'Every player’s pieces in different areas. The game ends the moment this happens.' },
            { term: 'Wall break', def: 'Round 1, once each: knock down one wall on your path and pass through.' },
            { term: 'Fixed squares', def: 'Where the ○ start in round 2: B2 and F6 for you, F2 and B6 for the opponent.' },
            { term: 'Tiebreak', def: 'On equal totals, the larger single area ranks higher.' },
            { term: 'Gap (gate)', def: 'The last open side connecting two areas. A wall there splits them.' },
            { term: 'Skipped turn', def: 'When none of your pieces can move, your turn passes automatically.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'How is Wallgo II different from Wallgo?', a: 'Pieces are □ (1–2 straight) and ○ (1, then a turn for 1 more), and you can never stay put. The wall break crosses a wall on the path, and equal totals are settled by the largest area.' },
      { q: 'Can a round piece move two squares straight?', a: 'No. A ○ must turn to take a second step, so it always ends on a neighbouring or a diagonal square.' },
      { q: 'What if all my pieces are stuck?', a: 'If no piece of yours can move, your turn is skipped automatically. When nobody can move, the game ends.' },
      { q: 'Who wins on equal scores?', a: 'Whoever has the larger single area. If that is equal as well, it is a shared win.' },
      { q: 'Where do the round pieces start in round 2?', a: 'Yours on B2 and F6, the opponent’s on F2 and B6. You place only your two □.' },
      { q: 'Is Very Hard available with three players?', a: 'No, Very Hard is 1:1 only. Three-player games offer Easy, Normal and Hard.' },
    ],
    cta: { title: 'Ready to try both pieces?', body: 'Play the 1:1 setup from this guide. Cutting lanes with □ and slipping out with ○ clicks quickly.', button: 'Play Wallgo II' },
    disclaimer: 'PUZZLTHINK is an unofficial fan project and is not affiliated with Netflix or The Devil’s Plan. Show names are used only to describe the game.',
  },
};

export default guide;
