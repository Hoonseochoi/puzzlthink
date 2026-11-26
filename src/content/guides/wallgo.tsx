// 벽바둑 guide. Rules and numbers follow src/lib/wallgo.ts (MODES, getMoveOptions, getTerritory, noOneCanMove)
// and src/components/WallGoGame.tsx (90-second turns, turn skip when no piece can move).
// Board coordinates match WallGoDiagram: columns A–G, rows 1–7 from the top. Player 0 is red (you), 1 blue, 2 grey.
import WallGoDiagram, { type DiagramSpec } from '@/components/WallGoDiagram';
import type { GameGuide } from './types';

const fig = (spec: DiagramSpec, label: string) => <WallGoDiagram spec={spec} label={label} />;

// A turn: D4 has a wall above and a blue piece to its right, so it can step left or down only.
const MOVE: DiagramSpec = {
  pieces: [[0, 'D4'], [1, 'E4']],
  walls: [['D4', 'up']],
  moves: [['D4', 'C4'], ['C4', 'C3'], ['D4', 'D5'], ['D5', 'D6']],
  blocked: ['D3'],
};
// After D4 → C4 → C3, the wall goes on one of C3's four sides.
const WALL: DiagramSpec = {
  pieces: [[0, 'C3'], [1, 'E4']],
  walls: [['D4', 'up'], ['C3', 'left']],
  hint: [['C3', 'up'], ['C3', 'right'], ['C3', 'down']],
};
// 1:1 starting position: the two fixed pieces of each player.
const DUEL_START: DiagramSpec = { pieces: [[0, 'B2'], [0, 'F6'], [1, 'F2'], [1, 'B6']] };
// The gate: one gap between the left 21 squares and the right 28.
const GATE: DiagramSpec = {
  pieces: [[0, 'C4'], [0, 'B2'], [1, 'E4'], [1, 'F6']],
  walls: [['C1', 'right'], ['C2', 'right'], ['C3', 'right'], ['C5', 'right'], ['C6', 'right'], ['C7', 'right']],
  danger: [['C4', 'right']],
};
const GATE_ANSWER: DiagramSpec = {
  pieces: [[0, 'D4'], [0, 'B2'], [1, 'E4'], [1, 'F6']],
  walls: [['C1', 'right'], ['C2', 'right'], ['C3', 'right'], ['C5', 'right'], ['C6', 'right'], ['C7', 'right'], ['D4', 'right']],
  moves: [['C4', 'D4']],
  hint: [['C4', 'right']],
};
// A sealed 1-wide strip: whichever wall the piece builds cuts squares off from it.
const STRIP: DiagramSpec = {
  pieces: [[0, 'G2']],
  zones: [{ player: 0, cells: ['G1', 'G2', 'G3', 'G4'] }],
  walls: [['G1', 'left'], ['G2', 'left'], ['G3', 'left'], ['G4', 'left'], ['G4', 'down']],
  danger: [['G2', 'up'], ['G2', 'down']],
};
// A roomy 3×3 room absorbs forced walls: an inner wall does not cut anything off.
const ROOM: DiagramSpec = {
  pieces: [[0, 'B2']],
  zones: [{ player: 0, cells: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3'] }],
  walls: [['C1', 'right'], ['C2', 'right'], ['C3', 'right'], ['A3', 'down'], ['B3', 'down'], ['C3', 'down'], ['B2', 'up']],
  hint: [['B2', 'right']],
};
// Cutting your own area: the wall under C5 leaves A6–C7 with no piece of yours, so they score for nobody.
const ORPHAN: DiagramSpec = {
  pieces: [[0, 'C5']],
  zones: [{ player: 0, cells: ['A6', 'B6', 'C6', 'A7', 'B7', 'C7'] }],
  walls: [['A5', 'down'], ['B5', 'down'], ['C5', 'right'], ['C6', 'right'], ['C7', 'right']],
  danger: [['C5', 'down']],
};
// Three walls around a piece: one more and it is stuck.
const TRAP: DiagramSpec = {
  pieces: [[0, 'D4'], [1, 'D6']],
  walls: [['D4', 'up'], ['D4', 'left'], ['D4', 'right']],
  danger: [['D4', 'down']],
  moves: [['D6', 'D5']],
};

const guide: GameGuide = {
  game: 'wallgo',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['wallgo2', 'pointOmok', 'colorLinkDuel', 'blindGomoku'],
  ko: {
    meta: {
      title: '벽바둑 공략 — 규칙 예외부터 배치·끝내기 계산까지 총정리 | PUZZLTHINK',
      description: '데블스플랜 벽바둑, 규칙은 알겠는데 자꾸 진다면? 이동·벽 규칙의 예외 상황, 3인전과 1:1 배치 요령, 문 닫기 싸움, 내 땅을 잘라 먹는 실수, 끝내기 칸 수 계산과 AI 난이도별 공략을 정리했어요.',
      keywords: ['벽바둑 공략', '벽바둑 전략', '벽바둑 규칙', '벽바둑 필승법', '벽바둑 이기는 법', '벽바둑 1대1', '벽바둑 3인전', '데블스플랜 벽바둑', '벽바둑 벽 부수기'],
    },
    title: '벽바둑 공략',
    lead: '벽 한 장이 집이 되고, 벽 한 장이 감옥이 돼요.',
    intro: [
      '벽바둑은 7×7 판 위에서 말을 움직이고, 움직인 말 옆에 벽을 하나씩 세워 서로의 공간을 갈라 놓는 영역 싸움이에요. 마지막에 **내 말이 들어 있는 구역의 칸 수**가 가장 많은 사람이 이겨요. 바둑처럼 집을 다투지만, 돌을 놓는 대신 칸과 칸 사이에 경계를 긋는다는 점이 다르죠.',
      '이 공략은 게임 화면 아래의 짧은 설명을 이미 읽었다고 보고, 그다음 단계를 다뤄요. 규칙이 헷갈리는 예외 상황을 먼저 정리하고, 입문·중급·고급으로 나눠 배치, 길 막기, 문 닫기 싸움, 끝내기 계산을 차례로 설명해요. 판 그림의 좌표는 가로 A~G, 세로 1~7(위에서부터)이에요.',
    ],
    gamePageTitle: '벽바둑 온라인 — 데블스플랜 그 게임을 웹에서',
    summary: '이동·벽 규칙의 예외, 배치 요령, 문 닫기 싸움, 끝내기 칸 수 계산까지.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '벽바둑은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '벽바둑은 넷플릭스 두뇌 서바이벌 예능 「데블스 플랜: 데드 어게인」에 나와 알려진 게임이에요. PUZZLTHINK의 벽바둑은 방송에 나온 핵심 규칙인 이동, 벽 세우기, 영역 계산을 그대로 살려 웹에서 혼자서도, 친구와도 둘 수 있게 만든 팬 제작 버전이에요.' },
          { type: 'p', text: '모드는 두 가지예요. 세 명이 말 2개씩 들고 겨루는 **3인전**(벽 부수기 있음)과, 두 명이 말 4개씩 들고 겨루는 **1:1 2인전**(벽 부수기 없음)이에요. 같은 이름의 후속작으로, 말 종류가 둘로 나뉘고 제자리 이동이 없는 「벽바둑 II」도 따로 있어요. 이 글은 원래 벽바둑을 다뤄요.' },
          { type: 'p', text: '이 게임의 재미는 **벽이 의무**라는 데서 나와요. 매 차례 반드시 벽을 하나 세워야 하니, 판이 좁아질수록 세우고 싶지 않은 벽까지 세우게 돼요. 그래서 "어디에 벽을 세울까"만큼 "어디에 벽을 세우게 만들까"가 중요해요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리 — 한 차례에 하는 일',
        lead: '한 차례는 언제나 "말 하나 이동 → 그 말 옆에 벽 하나" 두 단계예요.',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**배치**: 빈 칸을 골라 말을 놓아요. 3인전은 각자 2개씩 1→2→3→3→2→1 순서로 놓고, 1:1은 각자 2개가 정해진 자리(B2·F6 / F2·B6)에 미리 놓인 채 추첨으로 정한 선공부터 선→후→후→선 순서로 2개씩 더 놓아요.',
            '**이동**: 내 말 하나를 상하좌우로 0~2칸 움직여요. 두 칸은 한 방향으로 곧게 가도 되고 한 번 꺾어도 돼요. 다른 말이 있는 칸과 벽 너머로는 갈 수 없어요.',
            '**벽**: 방금 움직인(또는 제자리에 머문) 그 말의 네 면 중, 아직 벽이 없는 면 하나에 벽을 세워요. 판의 바깥 테두리는 이미 막혀 있는 것으로 치고, 그쪽엔 벽을 세울 수 없어요.',
            '**시간**: 한 차례는 90초예요. 시간이 지나면 가능한 행동과 벽이 자동으로 처리돼요.',
            '**끝**: 모든 말을 놓은 뒤, 모든 구역이 한 사람의 말만 담게 되면(=서로 완전히 갈리면) 끝나요. 아무도 움직일 수 없게 되어도 끝나요.',
            '**점수**: 내 말만 들어 있는 구역의 칸 수를 모두 더해요. 가장 많은 사람이 이기고, 같으면 공동 승리예요.',
          ] },
          { type: 'figure', node: fig(DUEL_START, '1:1 2인전 시작 배치'), caption: '1:1 2인전의 고정 말. 빨강(나) B2·F6, 파랑(상대) F2·B6. 남은 2개씩은 직접 배치해요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '제자리(0칸)는 언제나 되나요?', body: '아니요. 제자리에 머물려면 그 말이 **최소 한 칸은 움직일 수 있는 상태**여야 해요. 사방이 벽·말·테두리로 막힌 말은 머무는 것도, 벽을 세우는 것도 할 수 없어요.' },
            { title: '도착한 칸에 벽 세울 면이 없으면?', body: '그 칸으로는 애초에 갈 수 없어요. 이동은 도착한 뒤 **벽을 세울 수 있는 면이 하나 이상 남는 칸**으로만 허용돼요. 그래서 빛나는 칸이 생각보다 적을 때가 있어요.' },
            { title: '움직일 수 있는 말이 하나도 없으면?', body: '그 차례는 자동으로 넘어가요. 벽도 세우지 않아요. 3인전에서 한 사람만 갇혔다면 나머지 두 사람끼리 계속 둬요.' },
            { title: '아무도 말이 없는 구역은 누구 땅?', body: '**누구의 땅도 아니에요.** 벽으로 갈라진 구역에 말이 하나도 없으면 그 칸들은 점수에서 빠져요. 내 땅을 내 벽으로 잘라 버리는 실수가 여기서 나와요(아래 "자주 하는 실수" 참고).' },
            { title: '말 두 개가 다른 구역에 있으면?', body: '두 구역의 칸 수를 더해요. 한 구역에 내 말이 둘 있어도 그 구역은 한 번만 세요. 1:1에서는 말이 4개라 땅을 여러 곳에 나눠 가질 수 있어요.' },
            { title: '여러 사람이 한 구역에 갇혀 아무도 못 움직이면?', body: '그 구역은 누구의 땅도 아니고, 그 안의 **각 말이 서 있는 칸만 1칸씩** 점수가 돼요. 서로 끼어 꼼짝 못 하는 모양은 모두에게 손해예요.' },
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '한 차례 따라 해 보기',
        lead: '말 하나를 골라 움직이고 벽을 세우는 한 차례를 그림으로 따라가 봐요.',
        blocks: [
          { type: 'steps', items: [
            { title: '갈 수 있는 칸 확인하기', body: '빨강 말이 D4에 있어요. 위쪽은 벽, 오른쪽 E4는 파랑 말이라 막혀 있어요. 그래서 첫걸음은 왼쪽(C4)이나 아래(D5)뿐이고, 거기서 한 번 더 가거나 꺾으면 B4·C3·C5·D6·E5까지 닿아요. 벽 너머 D3에는 갈 수 없어요.', figure: fig(MOVE, '이동할 수 있는 칸') },
            { title: '도착한 말 옆에 벽 세우기', body: 'C4를 거쳐 C3에 섰다면 벽은 C3의 네 면 중 하나에 세워요. 왼쪽에 이미 벽이 있다면 위·오른쪽·아래 중에서 골라요. 멀리 떨어진 다른 곳에는 세울 수 없다는 게 핵심이에요. 벽을 세우고 싶은 자리가 있다면, 먼저 그 자리 옆으로 말을 보내야 해요.', figure: fig(WALL, '벽을 세울 수 있는 면') },
            { title: '이 차례로 무엇이 바뀌었는지 보기', body: '벽 하나가 새로 생기면 어떤 칸까지 누가 먼저 닿는지가 달라져요. 두기 전에 "이 벽 때문에 상대가 더 빨리 닿게 되는 칸이 생기나?"를 한 번만 확인해도 실수가 크게 줄어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 갇히지 않고 넓게',
        blocks: [
          { type: 'p', text: '처음 몇 판은 "넓게 차지하기"보다 "갇히지 않기"가 먼저예요. 벽바둑에서 가장 크게 지는 방법은 말 하나가 귀퉁이 몇 칸에 갇히는 거예요.' },
          { type: 'cards', columns: 1, items: [
            { tag: '위험', title: '벽 3개 자리에 들어가지 않기', body: '세 면이 막힌 칸에 서면, 상대가 남은 한 면에 벽을 세우는 순간 그 말은 1칸짜리 감옥에 갇혀요. 그림처럼 D4의 위·왼쪽·오른쪽이 막혔는데 파랑이 D5로 다가오면 다음 벽으로 끝이에요. 3인전에서는 상대가 둘이라 **벽 2개 자리도** 한 바퀴 안에 막힐 수 있어요.', figure: fig(TRAP, '벽 3개에 둘러싸인 말') },
          ] },
          { type: 'list', items: [
            '**배치는 가운데 쪽으로**: 7×7 판에서 C3~E5의 가운데 9칸은 사방으로 두 칸씩 움직일 수 있어 기동력이 가장 좋아요. 테두리 칸은 처음부터 한 면이 막혀 있는 셈이에요.',
            '**내 말끼리 너무 붙이지 않기**: 두 말이 붙어 있으면 서로의 길을 막고, 한 번에 같이 갇히기 쉬워요. 3인전에서는 두 말을 서로 다른 방향으로 벌려 두는 편이 안전해요.',
            '**말도 벽이에요**: 다른 말이 있는 칸은 아무도 지나갈 수 없어요. 상대가 넓은 쪽으로 빠져나가려는 길목에 말을 세워 두면 벽을 세우지 않고도 길을 막을 수 있어요.',
            '**점수판을 보면서 두기**: 화면의 확보 칸 수는 이미 갈라진 구역만 세요. 아직 열린 땅은 "누가 먼저 닿느냐"로 생각하면 돼요.',
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 문을 누가 닫느냐',
        blocks: [
          { type: 'p', text: '판이 어느 정도 갈리기 시작하면, 두 구역을 잇는 **좁은 문**(벽 사이에 한 칸 남은 틈)이 생겨요. 중반 이후의 승부는 대부분 이 문을 누가, 언제 닫느냐로 정해져요.' },
          { type: 'cards', columns: 1, items: [
            { tag: '문 닫기', title: '닫으면 지는 문은 닫지 말고 지키기', body: '그림에서 C열과 D열 사이가 벽으로 막혀 있고 C4|D4만 열려 있어요. 지금 문이 닫히면 왼쪽 A~C열 21칸과 오른쪽 D~G열 28칸으로 갈려요. 오른쪽에 말이 더 많은 쪽이 파랑이라면, 파랑은 E4에서 D4로 와서 D4의 왼쪽 면에 벽을 세우는 것만으로 이겨요. 빨강 차례라면 문을 직접 닫으면 안 돼요(21 대 28로 져요).', figure: fig(GATE, '두 구역을 잇는 문') },
            { tag: '해법', title: '문 칸을 말로 막고 상대 쪽에 벽 세우기', body: '빨강은 C4에서 D4로 한 칸 들어가 문 칸을 직접 차지해요. 다른 말이 있는 칸에는 아무도 설 수 없으니 파랑은 이제 문을 닫을 수 없어요. 벽은 D4의 오른쪽에 세워 E4의 파랑이 다가오는 길까지 막아요. 이렇게 오른쪽 땅에 발을 걸쳐 두면 28칸을 혼자 내주지 않아도 돼요.', figure: fig(GATE_ANSWER, '문 칸을 말로 막은 모습') },
          ] },
          { type: 'list', items: [
            '**문은 두 칸짜리 일이에요**: 어떤 경계에 벽을 세우려면 그 경계 양쪽 칸 중 하나에 말이 서야 해요. 그러니 문 양쪽 칸에 누가 먼저 닿는지만 세어 보면 누가 닫을 수 있는지 바로 보여요.',
            '**애매한 땅은 닫아 주지 않기**: 상대의 좁은 땅을 내가 굳이 닫아 줄 필요는 없어요. 열어 두면 상대는 그 안에서 벽을 세우며 시간을 써야 해요.',
            '**3인전은 1등과 2등의 차이**: 3인전에서는 제일 강한 사람을 함께 견제하는 흐름이 자연스럽게 생겨요. 누가 앞서는지 보고, 앞선 사람의 문을 막는 쪽에 벽을 보태세요.',
            '**벽 부수기(3인전)는 문 앞에서**: 게임당 한 번, 내 말 옆의 벽 하나를 부수고 그대로 0~2칸 움직일 수 있어요. 상대가 마지막 문을 닫은 직후나, 넓은 구역 바로 옆에서 쓰면 판이 뒤집혀요. 너무 일찍 쓰면 정말 필요할 때 카드가 없어요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 끝내기와 강제 벽',
        blocks: [
          { type: 'h3', text: '칸 수 계산: 몇 칸이면 이기나' },
          { type: 'p', text: '판은 모두 49칸이에요. 1:1에서는 **25칸을 확보하면 무조건 이겨요**(상대는 많아야 24칸). 아무도 없는 구역이 생기면 그만큼 기준이 내려가요. 예를 들어 3칸이 누구의 땅도 아니게 되면 남은 46칸을 둘이 나누니 24칸이면 이기고 23 대 23이면 공동 승리예요.' },
          { type: 'table', caption: '1:1에서 확정 승리 기준 (누구의 땅도 아닌 칸이 생겼을 때)', head: ['아무도 없는 칸', '나눠 갖는 칸', '이기는 기준', '비기는 경우'], rows: [
            ['0칸', '49칸', '25칸 이상', '— (홀수라 비길 수 없어요)'],
            ['1칸', '48칸', '25칸 이상', '24 대 24'],
            ['3칸', '46칸', '24칸 이상', '23 대 23'],
            ['5칸', '44칸', '23칸 이상', '22 대 22'],
          ] },
          { type: 'p', text: '3인전에는 고정된 기준이 없어요. 대신 "**두 상대 중 더 큰 쪽보다 많이**"가 목표예요. 그래서 3인전에선 내 땅을 1칸 늘리는 수보다 가장 앞선 상대의 땅을 2칸 줄이는 수가 더 클 때가 많아요.' },
          { type: 'h3', text: '강제 벽: 다 갈린 뒤에도 벽은 계속 세워야 해요' },
          { type: 'p', text: '게임은 **모든** 구역이 갈려야 끝나요. 3인전에서 내 두 말이 이미 각자의 구역에 갇혔더라도, 다른 두 사람이 아직 같은 구역을 다투고 있다면 나는 매 차례 내 구역 안에서 말을 움직이고 벽을 세워야 해요. 이 벽이 내 땅을 갉아먹을 수 있어요.' },
          { type: 'cards', items: [
            { tag: '좁은 땅', title: '한 줄짜리 땅은 스스로 잘려요', body: 'G1~G4처럼 폭이 한 칸인 땅에 갇힌 말은 세울 수 있는 벽이 위나 아래뿐이고(왼쪽은 이미 벽, 오른쪽은 테두리), 어느 쪽이든 말이 없는 쪽 칸들이 잘려 나가 누구의 땅도 아니게 돼요.', figure: fig(STRIP, '한 줄짜리 땅') },
            { tag: '넓은 땅', title: '방처럼 넓은 땅은 벽을 흡수해요', body: '3×3 같은 덩어리 땅은 안쪽에 벽을 몇 개 세워도 칸들이 여전히 이어져 있어요. 3×3 방은 칸 사이 경계가 12개인데 9칸을 잇는 데는 8개면 충분해서, 자리를 잘 고르면 4장까지는 아무것도 잘리지 않아요.', figure: fig(ROOM, '넓은 3×3 땅') },
          ] },
          { type: 'callout', tone: 'tip', title: '그래서 3인전의 고수는 일찍 잠그지 않아요', text: '넓은 땅을 먼저 닫았다고 끝이 아니에요. 다른 두 사람이 오래 싸울수록 내 땅에 강제 벽이 쌓여요. 길고 좁은 모양보다 네모난 모양으로 닫고, 가능하면 말 하나는 아직 열린 곳에 남겨 두세요. 열린 곳의 말을 움직이면 내 구역 안에 벽을 세우지 않아도 되니까요.' },
          { type: 'h3', text: '1:1에서는 반대로 "마지막 문"이 전부예요' },
          { type: 'p', text: '1:1에서는 서로 같은 구역에 있는 말이 하나도 없게 되는 순간 바로 끝나요. 그래서 1:1의 끝내기는 강제 벽보다 **마지막 문을 누가 닫느냐**의 계산이에요. 남은 열린 칸을 둘로 나눠 보고, 내가 닫았을 때와 상대가 닫았을 때의 칸 수를 비교한 뒤, 유리하면 바로 닫고 불리하면 문 칸을 말로 막아 시간을 버세요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'cards', items: [
            { tag: '실수', title: '내 벽으로 내 땅 잘라 먹기', body: '그림처럼 C5의 빨강이 아래쪽에 벽을 세우면 A6~C7의 6칸에는 내 말이 하나도 없게 돼요. 그 6칸은 누구의 땅도 아니에요. 벽을 세우기 전에 "이 벽 너머에 내 말이 남아 있나?"를 꼭 확인하세요.', figure: fig(ORPHAN, '내 땅을 잘라 먹는 벽') },
            { tag: '실수', title: '벽을 세울 수 있는 곳만 보고 이동하기', body: '벽은 움직인 말 옆에만 세울 수 있어요. 막고 싶은 곳이 있다면 이동 단계에서 그 옆으로 가야 해요. 이동을 다 하고 나서 "여기 막고 싶었는데" 하는 경우가 정말 많아요.' },
          ] },
          { type: 'list', items: [
            '**나만 보는 수**: 내 땅을 넓히는 데만 집중하다가, 상대가 다음 차례에 닫을 수 있는 문을 놓쳐요. 두기 전에 상대가 닿는 칸을 한 번 세어 보세요.',
            '**3인전에서 벽 2개 자리에 서기**: 1:1이라면 괜찮은 자리도, 상대 둘이 가까이 있으면 한 바퀴 만에 갇혀요.',
            '**벽 부수기를 첫 몇 턴에 쓰기**: 벽이 거의 없을 때는 부술 벽도, 넘어갈 이유도 적어요. 진짜 가치는 판이 거의 닫혔을 때 나와요.',
            '**시간 다 쓰기**: 90초가 지나면 벽이 아무 면에나 자동으로 세워져요. 내 땅을 자르는 면이 걸릴 수도 있으니 어려운 장면일수록 먼저 이동만이라도 끝내 두세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구, 오픈 대전',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 3인전', 'AI 두 명과 겨뤄요. 내가 배치를 처음과 마지막(1번째·6번째)에 하고, 첫 이동도 내가 해요. 벽 부수기는 세 사람 모두 한 번씩 있어요.'],
            ['AI 1:1', '말 4개, 그중 2개는 고정 자리예요. 추첨으로 선공을 정하고, 배치를 먼저 한 사람이 첫 이동도 해요. 벽 부수기는 없어요.'],
            ['쉬움 · 보통', '쉬움은 괜찮은 수들 가운데 꽤 자유롭게 골라 실수가 잦아요. 보통은 가장 좋아 보이는 몇 수 중에서 골라요. 두 난이도 모두 내 문 닫기 수를 바로 알아채지는 못할 때가 있어요.'],
            ['어려움', '다음 사람의 가장 좋은 대응까지 생각하고 둬요. 3인전에서는 세 번째 사람의 대응까지 읽어요. 문을 열어 두면 바로 닫으러 와요.'],
            ['매우 어려움 (1:1 전용)', '한 차례(이동+벽)를 한 수로 보고 몇 차례 앞까지 읽어요. 다툼이 남은 칸이 적어지면 끝까지 계산해서, 끝내기에서는 실수를 거의 하지 않아요. AI 헬모드 페이지에서도 바로 시작할 수 있어요.'],
            ['친구 방', '링크나 4자리 초대 코드로 1:1 또는 1:1:1 방을 만들어요. 규칙과 90초 제한은 AI 대전과 같아요.'],
            ['오픈 대전', '지금 접속한 사람과 바로 붙어요. 결과가 양쪽 모두에게 기록되도록 로그인이 필요해요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '구역', def: '벽과 판 테두리로 둘러싸여 서로 이어진 칸들의 덩어리예요. 점수는 구역 단위로 세요.' },
            { term: '확보 칸', def: '내 말만 들어 있는 구역들의 칸 수 합이에요. 화면의 점수판에 나오는 숫자예요.' },
            { term: '분리', def: '모든 구역이 한 사람의 말만 담게 된 상태예요. 이 순간 게임이 끝나요.' },
            { term: '제자리', def: '0칸 이동. 최소 한 칸은 움직일 수 있는 말만 할 수 있고, 그 자리에서 벽을 세워요.' },
            { term: '문', def: '두 구역을 잇는 마지막 한 칸짜리 틈. 이 경계에 누가 벽을 세우느냐가 끝내기를 정해요.' },
            { term: '강제 벽', def: '세우고 싶지 않아도 규칙상 세워야 하는 벽. 갇힌 뒤에도 게임이 이어지면 내 구역 안에 쌓여요.' },
            { term: '벽 부수기', def: '3인전에서 각자 한 번, 내 말 옆의 벽 하나를 없애고 이어서 이동하는 행동이에요.' },
            { term: '고정 말', def: '1:1에서 처음부터 B2·F6(빨강), F2·B6(파랑)에 놓여 있는 말이에요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '벽바둑에서 이기려면 몇 칸이 필요한가요?', a: '1:1에서는 49칸 중 25칸을 확보하면 무조건 이겨요. 아무도 없는 구역이 생기면 기준이 그만큼 내려가요. 3인전은 고정된 기준 없이 두 상대 중 더 많은 쪽보다 많으면 이겨요.' },
      { q: '벽은 아무 데나 세울 수 있나요?', a: '아니요. 이번 차례에 움직인(또는 제자리에 머문) 말의 네 면 중 벽이 없는 면에만 세울 수 있어요. 판 테두리 쪽에는 세울 수 없어요.' },
      { q: '말이 한 칸도 못 움직이면 어떻게 되나요?', a: '그 말은 제자리 벽도 세울 수 없어요. 움직일 수 있는 내 말이 하나도 없으면 그 차례는 자동으로 넘어가요.' },
      { q: '벽 부수기는 1:1에서도 쓸 수 있나요?', a: '아니요. 벽 부수기는 3인전에서만, 각자 게임당 한 번 쓸 수 있어요.' },
      { q: '점수가 같으면 어떻게 되나요?', a: '벽바둑에서는 공동 승리예요. 후속작 벽바둑 II는 동점이면 더 넓은 단일 구역을 가진 사람이 앞서요.' },
      { q: '매우 어려움 AI는 3인전에서도 고를 수 있나요?', a: '매우 어려움은 1:1 전용이에요. 3인전에서는 쉬움·보통·어려움 중에서 골라요.' },
    ],
    cta: { title: '이제 한 판 둬 볼까요?', body: '문 닫기 계산은 직접 해 봐야 감이 와요. AI 1:1 보통으로 시작해서, 이기면 어려움으로 올려 보세요.', button: '벽바둑 두러 가기' },
    disclaimer: 'PUZZLTHINK는 데블스 플랜 및 관련 방송사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요.',
  },
  en: {
    meta: {
      title: 'Wallgo strategy guide — rules, openings, gates and endgame counting | PUZZLTHINK',
      description: "Know the Wallgo rules from The Devil's Plan but keep losing? The edge cases of moving and walls, placement for 3-player and 1:1, the fight over the last gate, cutting off your own land, endgame counting and what each AI level does.",
      keywords: ['Wallgo strategy', 'Wallgo guide', 'Wallgo rules', 'how to win Wallgo', 'Wallgo 1v1', "Devil's Plan Wallgo", 'Wallgo wall break'],
    },
    title: 'Wallgo strategy guide',
    lead: 'One wall makes a home; one wall makes a prison.',
    intro: [
      'Wallgo is a territory game on a 7×7 board: you move a piece, then build one wall next to that piece, and little by little the players cut the board apart. At the end, whoever has the most **squares in the areas holding their pieces** wins. It is about territory like Go, but instead of placing stones you draw borders between squares.',
      'This guide assumes you have read the short notes under the board and goes further. First the edge cases of the rules, then strategy in three levels: placement, blocking, the fight over gates and endgame counting. Board diagrams use columns A–G and rows 1–7 from the top.',
    ],
    gamePageTitle: "Wallgo Online — the Devil's Plan game, on the web",
    summary: 'Edge cases of the rules, placement, the gate fight and endgame counting.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Wallgo?',
        blocks: [
          { type: 'p', text: "Wallgo became known through the Netflix brain-survival show The Devil's Plan: Dead Again. PUZZLTHINK's Wallgo keeps the core rules seen on the show — moving, building walls and scoring territory — in a fan-made web version you can play alone or with friends." },
          { type: 'p', text: 'There are two modes: a **3-player game** with 2 pieces each (with a wall break), and a **1:1 duel** with 4 pieces each (no wall break). A sequel, Wallgo II, splits the pieces into two kinds and removes staying put; this guide covers the original Wallgo.' },
          { type: 'p', text: 'The game is interesting because **walls are compulsory**. Every turn you must build one, so as the board shrinks you end up building walls you would rather not. Where you make your opponent build matters as much as where you build.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules — what happens on a turn',
        lead: 'A turn is always two steps: move one piece, then build one wall next to that piece.',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Placement**: put your pieces on empty squares. In the 3-player game everyone places 2, in the order 1→2→3→3→2→1. In 1:1 each player already has 2 pieces on fixed squares (B2·F6 / F2·B6); a draw decides who starts, and the other 2 each are placed first→second→second→first.',
            '**Move**: move one of your pieces 0–2 squares up, down, left or right. Two squares may go straight or turn once. You cannot enter a square with another piece or cross a wall.',
            '**Wall**: build a wall on one open side of the piece you just moved (or kept in place). The outer edge of the board already counts as closed; you cannot build there.',
            '**Time**: a turn lasts 90 seconds. When it runs out, a legal action and wall are played for you.',
            '**End**: once every piece is placed, the game ends as soon as every area holds pieces of only one player — or when no one can move.',
            '**Score**: add up the squares of every area that holds only your pieces. Most squares wins; a tie is a shared win.',
          ] },
          { type: 'figure', node: fig(DUEL_START, '1:1 starting position'), caption: 'The fixed pieces in a 1:1 duel: red (you) on B2 and F6, blue on F2 and B6. The other two each are placed by the players.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rules — what happens if…',
        blocks: [
          { type: 'cards', items: [
            { title: 'Can I always stay put?', body: 'No. A piece may stay only if it **could move at least one square**. A piece boxed in by walls, pieces and the edge can neither stay nor build.' },
            { title: 'What if the square I land on has no open side?', body: 'Then you cannot move there at all. A move is only allowed to a square that **still has at least one side for the wall**, which is why fewer squares light up than you might expect.' },
            { title: 'What if none of my pieces can move?', body: 'Your turn is skipped, and you build no wall. In a 3-player game, if one player is sealed in, the other two keep playing.' },
            { title: 'Who owns an area with no pieces?', body: '**Nobody.** If a walled-off area contains no piece at all, its squares are not counted for anyone. This is how players cut off their own land (see Common mistakes).' },
            { title: 'My two pieces are in different areas?', body: 'Both areas count, added together. Two of your pieces in the same area still count that area once. With 4 pieces in a 1:1 game you can own land in several places.' },
            { title: 'Several players stuck together, no one can move?', body: 'That area belongs to nobody, and **each piece scores only the square it stands on**. Being jammed together hurts everyone.' },
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walk through one turn',
        lead: 'Follow one turn — pick a piece, move it, build a wall — in pictures.',
        blocks: [
          { type: 'steps', items: [
            { title: 'See where the piece can go', body: 'The red piece is on D4. There is a wall above it, and E4 to its right holds a blue piece. So the first step can only be left (C4) or down (D5); one more step, straight or turning, reaches B4, C3, C5, D6 or E5. D3, behind the wall, is out of reach.', figure: fig(MOVE, 'Squares the piece can reach') },
            { title: 'Build the wall next to the piece', body: 'Having gone through C4 to C3, the wall goes on one of C3’s four sides. If the left side already has a wall, choose top, right or bottom. You cannot build anywhere else on the board — if you want a wall somewhere, first move a piece next to it.', figure: fig(WALL, 'Sides where the wall can go') },
            { title: 'Check what the turn changed', body: 'Each new wall changes who reaches which squares first. Asking once before you commit — "does this wall let an opponent reach any square sooner?" — removes most mistakes.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — stay free, spread out',
        blocks: [
          { type: 'p', text: 'For your first games, not getting trapped matters more than grabbing space. The biggest way to lose Wallgo is one piece shut into a few corner squares.' },
          { type: 'cards', columns: 1, items: [
            { tag: 'DANGER', title: 'Never step into a three-wall square', body: 'On a square closed on three sides, one more wall from an opponent locks that piece in a one-square cell. In the picture D4 is closed above, left and right, and blue is coming to D5 to build the last wall. In a 3-player game there are two opponents, so even a **two-wall square** can be sealed within one round.', figure: fig(TRAP, 'A piece inside three walls') },
          ] },
          { type: 'list', items: [
            '**Place toward the middle**: the nine centre squares C3–E5 can move two squares in every direction. An edge square starts the game with one side already closed.',
            '**Keep your pieces apart**: two pieces side by side block each other and are easy to trap together. In 3-player games spread your two pieces in different directions.',
            '**Pieces are walls too**: no one can pass through a square with a piece on it. Park a piece in the corridor an opponent needs and you block it without spending a wall.',
            '**Read the score strip**: the squares shown there count only areas already sealed. For open ground, think "who gets there first".',
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — who closes the gate',
        blocks: [
          { type: 'p', text: 'Once the board starts to split, narrow **gates** appear — single gaps between two areas. From the middle game on, most games are decided by who closes which gate, and when.' },
          { type: 'cards', columns: 1, items: [
            { tag: 'GATES', title: 'If closing loses, guard the gate instead', body: 'Here columns C and D are walled apart except at C4|D4. If that gate closes, the board splits into 21 squares on the left (A–C) and 28 on the right (D–G). Blue, with more pieces on the right, wins just by moving from E4 to D4 and building a wall on D4’s left side. If it is red’s turn, red must not close the gate — 21 to 28 loses.', figure: fig(GATE, 'A gate between two areas') },
            { tag: 'ANSWER', title: 'Stand in the gate, wall the other side', body: 'Red steps from C4 into D4 and occupies the gate square. No piece can stand where another piece is, so blue can no longer close it. Red builds the wall on D4’s right, cutting off blue’s approach from E4. With a foot in the right side, red no longer hands over all 28 squares.', figure: fig(GATE_ANSWER, 'Blocking the gate with a piece') },
          ] },
          { type: 'list', items: [
            '**A gate is a two-square problem**: to wall a border, a piece must stand on one of the two squares beside it. Count who reaches either square first and you know who can close it.',
            '**Do not close awkward land for them**: there is no need to seal an opponent’s narrow strip. Left open, they keep spending walls inside it.',
            '**In 3-player games, watch first versus second**: the two trailing players naturally gang up on the leader. See who is ahead and add your wall to the gate that holds them back.',
            '**Wall break (3-player) belongs at the gate**: once per game you can knock down one wall next to your piece and then move 0–2 squares as normal. Used right after an opponent closes the last gate, or next to a big area, it flips the game. Used too early, it is gone when you need it.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — endgames and forced walls',
        blocks: [
          { type: 'h3', text: 'Counting: how many squares win' },
          { type: 'p', text: 'The board has 49 squares. In 1:1, **25 squares always wins** (the opponent has at most 24). Areas that belong to nobody lower the bar: if 3 squares end up empty, 46 are shared, so 24 wins and 23–23 is a shared win.' },
          { type: 'table', caption: 'Sure-win threshold in 1:1 when some squares belong to nobody', head: ['Squares nobody owns', 'Shared squares', 'Sure win at', 'Tie'], rows: [
            ['0', '49', '25 or more', '— (odd total, no tie)'],
            ['1', '48', '25 or more', '24–24'],
            ['3', '46', '24 or more', '23–23'],
            ['5', '44', '23 or more', '22–22'],
          ] },
          { type: 'p', text: 'There is no fixed threshold in the 3-player game; the target is "**more than the larger of my two opponents**". That is why taking 2 squares off the leader is often worth more than adding 1 to yourself.' },
          { type: 'h3', text: 'Forced walls: you keep building after you are sealed' },
          { type: 'p', text: 'The game only ends when **every** area is split. In a 3-player game, even if both your pieces are sealed in their own areas, while the other two still share an area you must keep moving and building a wall inside your own land every turn — and those walls can eat into it.' },
          { type: 'cards', items: [
            { tag: 'NARROW', title: 'A one-wide strip cuts itself', body: 'A piece sealed in a one-square-wide strip like G1–G4 can only build above or below (the left is walled, the right is the edge), and either way the squares on the far side lose their piece and score for nobody.', figure: fig(STRIP, 'A one-wide strip') },
            { tag: 'ROOMY', title: 'A room absorbs walls', body: 'A block like 3×3 can take a few inner walls and its squares stay connected. A 3×3 room has 12 inner borders and needs only 8 to keep its 9 squares joined, so up to 4 well-placed walls inside cut nothing off.', figure: fig(ROOM, 'A roomy 3×3 area') },
          ] },
          { type: 'callout', tone: 'tip', title: 'Strong 3-player players do not lock in early', text: 'Sealing a big area first is not the end. The longer the other two fight, the more forced walls pile up in your land. Seal square shapes rather than long thin ones, and if you can, keep one piece outside in open ground — moving that piece means you never have to build inside your own area.' },
          { type: 'h3', text: 'In 1:1, the last gate is everything' },
          { type: 'p', text: 'A 1:1 game ends the moment no area holds pieces of both players. So the 1:1 endgame is not about forced walls but about **who closes the last gate**. Split the remaining open squares both ways, compare the count if you close against the count if they close, then close at once if it wins — or block the gate square with a piece to buy time if it loses.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'cards', items: [
            { tag: 'MISTAKE', title: 'Cutting off your own land', body: 'In the picture, if red on C5 builds below itself, none of red’s pieces is left in A6–C7. Those 6 squares belong to nobody. Before building, always ask: "is one of my pieces still on the far side of this wall?"', figure: fig(ORPHAN, 'A wall that cuts off your own land') },
            { tag: 'MISTAKE', title: 'Moving without thinking about the wall', body: 'You can only build next to the piece you moved. If there is a border you want to close, the move itself has to take you there. "I wanted to block that" after moving is the most common regret in the game.' },
          ] },
          { type: 'list', items: [
            '**Only looking at your own side**: busy growing your land, you miss the gate an opponent can close next turn. Count the squares they can reach before you commit.',
            '**Two-wall squares in 3-player games**: fine in 1:1, but with both opponents nearby they can seal you in one round.',
            '**Spending the wall break in the first few turns**: with few walls on the board there is little to break and little reason to cross. Its value peaks when the board is nearly closed.',
            '**Running out the clock**: after 90 seconds the wall goes on a random side — possibly one that cuts your own land. In hard positions, at least make the move early.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friends and open matches',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI 3-player', 'You face two AIs. You place first and last (1st and 6th) and make the first move. Everyone has one wall break.'],
            ['AI 1:1', '4 pieces each, 2 on fixed squares. A draw decides who starts; whoever places first also moves first. No wall break.'],
            ['Easy · Normal', 'Easy picks fairly freely among decent moves and slips often. Normal chooses among the few moves that look best. Neither always spots a gate you are about to close.'],
            ['Hard', 'Considers the next player’s best reply before moving; in 3-player games it also reads the third player’s reply. Leave a gate open and it comes to close it.'],
            ['Very Hard (1:1 only)', 'Treats a whole turn (move and wall) as one step and reads several turns ahead. When few contested squares remain it calculates to the end, so it rarely errs in the endgame. You can also start it from the AI Hell Mode page.'],
            ['Friend rooms', 'Create a 1:1 or 1:1:1 room and share the link or 4-digit code. Same rules and the same 90-second turns as the AI games.'],
            ['Open matches', 'Play whoever is online right now. Sign-in is required so the result is recorded for both players.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Area', def: 'A group of connected squares enclosed by walls and the board edge. Scoring is done area by area.' },
            { term: 'Secured squares', def: 'The total size of the areas that hold only your pieces — the number on the score strip.' },
            { term: 'Separation', def: 'The state where every area holds pieces of only one player. The game ends at that moment.' },
            { term: 'Staying put', def: 'A 0-square move. Only a piece that could move at least one square may do it; it then builds a wall where it stands.' },
            { term: 'Gate', def: 'The last one-square gap between two areas. Whoever walls that border usually decides the endgame.' },
            { term: 'Forced wall', def: 'A wall the rules make you build even though you would rather not. After you are sealed in, these pile up inside your own area.' },
            { term: 'Wall break', def: 'In 3-player games, once each: remove one wall next to your piece, then move as normal.' },
            { term: 'Fixed pieces', def: 'In 1:1, the pieces that start on B2·F6 (red) and F2·B6 (blue).' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'How many squares do I need to win Wallgo?', a: 'In 1:1, 25 of the 49 squares always wins. Areas that belong to nobody lower that number. In the 3-player game there is no fixed number; you need more than the larger of your two opponents.' },
      { q: 'Can I build a wall anywhere?', a: 'No. Only on an open side of the piece you moved (or kept in place) this turn, and never along the board edge.' },
      { q: 'What happens if a piece cannot move at all?', a: 'It can neither stay nor build. If none of your pieces can move, your turn is skipped automatically.' },
      { q: 'Is there a wall break in 1:1?', a: 'No. The wall break exists only in the 3-player game, once per player per game.' },
      { q: 'What if scores are tied?', a: 'In Wallgo it is a shared win. In the sequel, Wallgo II, a tie goes to whoever has the larger single area.' },
      { q: 'Can I choose the Very Hard AI in the 3-player game?', a: 'Very Hard is 1:1 only. In 3-player games choose Easy, Normal or Hard.' },
    ],
    cta: { title: 'Ready for a game?', body: 'Gate counting only clicks once you try it. Start with a 1:1 game on Normal, and move up to Hard once you win.', button: 'Play Wallgo' },
    disclaimer: "PUZZLTHINK is an unofficial fan project and is not affiliated with The Devil's Plan or its broadcaster. Show names are used only to describe the game.",
  },
};

export default guide;
