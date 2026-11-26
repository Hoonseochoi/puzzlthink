// 십이장기 guide. Rules and numbers follow src/lib/janggi.ts (initialState, DIRS, dropTargets, applyAction,
// playableActions, MAX_PLY, the AI's VALUE table and search depths) and src/lib/janggiRoom.ts (90/60/30-second turns).
// Diagrams use JanggiDiagram rows 0–3 from the top: row 3 is your camp ("1st rank"), row 0 the opponent's ("4th rank").
// Columns A–C left to right, ranks 1–4 counted from your side, as in the game's move log (cellName).
import JanggiDiagram, { JanggiMoveChart, type JanggiDiagramSpec } from '@/components/janggi/JanggiDiagram';
import type { PieceType } from '@/lib/janggi';
import type { GameGuide } from './types';

const fig = (spec: JanggiDiagramSpec, label: string) => <JanggiDiagram spec={spec} label={label} />;
const moves = (type: PieceType, label: string) => <div className="mx-auto w-24"><JanggiMoveChart type={type} label={label} /></div>;

const START: JanggiDiagramSpec = {
  pieces: [['sang', 0, 3, 0], ['wang', 0, 3, 1], ['jang', 0, 3, 2], ['ja', 0, 2, 1], ['jang', 1, 0, 0], ['wang', 1, 0, 1], ['sang', 1, 0, 2], ['ja', 1, 1, 1]],
};
// 1. 子 B2×B3
const OPEN1: JanggiDiagramSpec = { ...START, arrows: [[2, 1, 1, 1, 'capture']] };
// 2. 王 B4×B3: both sides now hold a 子.
const OPEN2: JanggiDiagramSpec = {
  pieces: [['sang', 0, 3, 0], ['wang', 0, 3, 1], ['jang', 0, 3, 2], ['jang', 1, 0, 0], ['wang', 1, 1, 1], ['sang', 1, 0, 2]],
  hands: [[0, ['ja']], [1, ['ja']]],
  arrows: [[0, 1, 1, 1, 'capture']],
};
// 3. drop 子 on B2: it hits the king on B3, and B2 is guarded by 相 A1 and 王 B1.
const OPEN3: JanggiDiagramSpec = {
  pieces: [['sang', 0, 3, 0], ['wang', 0, 3, 1], ['jang', 0, 3, 2], ['ja', 0, 2, 1], ['jang', 1, 0, 0], ['wang', 1, 1, 1], ['sang', 1, 0, 2]],
  hands: [[1, ['ja']]],
  arrows: [[2, 1, 1, 1, 'capture']],
  glow: [[2, 1]],
};
// 4. The king must step away: A3, C3 or back to B4 are safe; A2 and C2 are covered.
const OPEN4: JanggiDiagramSpec = {
  pieces: [['sang', 0, 3, 0], ['wang', 0, 3, 1], ['jang', 0, 3, 2], ['ja', 0, 2, 1], ['jang', 1, 0, 0], ['wang', 1, 1, 1], ['sang', 1, 0, 2]],
  hands: [[1, ['ja']]],
  dots: [[1, 0], [1, 2], [0, 1]],
  blocked: [[2, 0], [2, 2]],
};
// Camp entry: from C3 the king can enter B4 or C4; B4 is covered by the enemy 王 and 相, C4 is not.
const ENTRY: JanggiDiagramSpec = {
  pieces: [['wang', 0, 1, 2], ['wang', 1, 0, 0], ['sang', 1, 1, 0], ['jang', 0, 3, 1]],
  arrows: [[1, 2, 0, 2]],
  blocked: [[0, 1]],
  glow: [[0, 2]],
};
// A guarded piece is safe from the king: 相 B2 is covered by 王 B1 and 將 C2, so the enemy king on B3 cannot take it.
const GUARD: JanggiDiagramSpec = {
  pieces: [['sang', 0, 2, 1], ['wang', 0, 3, 1], ['jang', 0, 2, 2], ['wang', 1, 1, 1], ['jang', 1, 0, 2]],
  arrows: [[3, 1, 2, 1], [2, 2, 2, 1]],
  glow: [[2, 1]],
};
// Drop a 子 on the 3rd rank: next move it enters the camp and turns into 侯. Nothing of theirs reaches A3 or A4.
const PROMOTE: JanggiDiagramSpec = {
  pieces: [['wang', 0, 3, 1], ['wang', 1, 0, 2], ['sang', 1, 1, 2]],
  hands: [[0, ['ja']]],
  arrows: [[4, 0, 1, 0, 'drop'], [1, 0, 0, 0]],
  glow: [[0, 0]],
};

const guide: GameGuide = {
  game: 'janggi',
  origin: { kind: 'show', show: 'genius34' },
  updated: '2026-11-26',
  related: ['cardJanggi', 'russianJanggi', 'laserJanggi', 'wallgo'],
  ko: {
    meta: {
      title: '십이장기 공략 — 첫 수 교환부터 포로 활용·입성 수읽기까지 | PUZZLTHINK',
      description: '더 지니어스 십이장기, 규칙은 알겠는데 자꾸 진다면? 말의 움직임과 예외 규칙, 첫 수 子 교환 따라 두기, 지켜진 말과 王의 관계, 포로 내려놓기 요령, 입성 승리 수읽기, AI 난이도별 특징까지 정리했어요.',
      keywords: ['십이장기 공략', '십이장기 전략', '십이장기 필승법', '십이장기 규칙', '십이장기 이기는 법', '12장기 공략', '더 지니어스 십이장기', '십이장기 포로', '십이장기 입성'],
    },
    title: '십이장기 공략',
    lead: '말은 넷, 칸은 열둘. 대신 잡은 말이 다시 살아나요.',
    intro: [
      '십이장기는 가로 3칸, 세로 4칸짜리 작은 판에서 두는 미니 장기예요. 각자 王·將·相·子 네 개로 시작하고, **잡은 상대 말을 내 말로 다시 내려놓을 수 있다**는 규칙 덕분에 말이 줄지 않고 계속 돌아요. 판이 작아서 한 수 실수가 곧바로 王을 잃는 일로 이어져요.',
      '이 공략은 게임 화면 아래의 짧은 규칙을 읽었다고 보고 그다음을 다뤄요. 헷갈리는 예외 규칙, 첫 수 교환을 실제로 따라 두는 예시, 입문·중급·고급 전략, 자주 하는 실수와 용어를 차례로 정리했어요. 좌표는 왼쪽부터 A~C열, 내 쪽 끝줄을 1줄로 해서 1~4줄이에요(게임의 기보 표기와 같아요).',
    ],
    summary: '첫 수 교환 따라 두기, 지켜진 말과 王, 포로 활용, 입성 수읽기까지.',
    sections: [
      {
        id: 'background',
        title: '십이장기는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '십이장기는 두뇌 서바이벌 예능 「더 지니어스」에 등장하면서 널리 알려졌어요. 열두 칸 판, 네 개의 말, 잡은 말을 다시 쓰는 규칙이 짧은 시간 안에 깊은 수읽기를 만들어서 방송에서도 긴장감 있는 대국이 나왔죠.' },
          { type: 'p', text: '우리에게 익숙한 장기에는 잡은 말을 다시 쓰는 규칙이 없어요. 잡은 말을 내 편으로 내려놓는 규칙은 일본 장기(쇼기)의 특징이에요. 판 크기와 말 구성은 일본에서 어린이에게 쇼기를 가르치려고 만든 3×4 미니 쇼기인 「동물 쇼기(どうぶつしょうぎ)」와 거의 같아요. 기물 이름을 한자 王·將·相·子·侯로 바꾸면 십이장기의 모습이 돼요.' },
          { type: 'p', text: 'PUZZLTHINK의 십이장기는 AI와 두는 대국, 링크로 친구와 두는 대국을 모두 지원해요. 같은 국면을 세 번째로 만드는 수는 둘 수 없고 200수가 지나면 무승부가 되어, 어떤 대국이든 반드시 끝나요.' },
        ],
      },
      {
        id: 'rules',
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판과 진영**: 3×4, 12칸이에요. 각자 자기 쪽 끝줄 3칸이 **진영**이에요. 나는 1줄, 상대는 4줄이 진영이에요.',
            '**시작 배치**: 내 쪽은 A1 相, B1 王, C1 將, 그리고 王 바로 앞 B2에 子. 상대도 똑같이 마주 보게 놓여서 상대 子는 B3에 있어요. 두 子는 처음부터 코앞에서 마주 봐요.',
            '**이동**: 차례마다 내 말 하나를 그 말이 갈 수 있는 방향으로 한 칸 움직여요. 말의 방향은 돌릴 수 없어요.',
            '**잡기**: 상대 말이 있는 칸으로 움직이면 그 말을 잡아 **포로**로 가져와요.',
            '**내려놓기**: 차례에 이동 대신 포로 하나를 빈칸에 내려놓을 수 있어요. 단 **상대 진영(4줄)에는 놓을 수 없어요.** 내 진영과 가운데 두 줄에는 놓을 수 있어요.',
            '**승급**: 子가 움직여서 상대 진영에 들어가면 侯로 뒤집혀요. 상대의 侯를 잡으면 子로 되돌아와 포로가 돼요.',
            '**승리**: 상대 王을 잡으면 이겨요. 또는 내 王이 상대 진영에 들어간 뒤, 상대가 그 王을 잡지 못한 채 내 차례가 돌아오면 이겨요(**입성 승리**).',
          ] },
          { type: 'figure', node: fig(START, '십이장기 시작 배치'), caption: '시작 배치. 아래(주황)가 나, 위(초록)가 상대예요. 맨 아랫줄이 내 진영, 맨 윗줄이 상대 진영이에요.' },
          { type: 'h3', text: '말의 움직임' },
          { type: 'cards', items: [
            { title: '王 왕', body: '여덟 방향 모두 한 칸. 가장 많이 움직이는 말이지만 잡히면 그 자리에서 져요.', figure: moves('wang', '王의 움직임') },
            { title: '將 장', body: '앞·뒤·왼쪽·오른쪽 네 방향. 줄과 열을 따라 움직여 길을 막는 데 좋아요.', figure: moves('jang', '將의 움직임') },
            { title: '相 상', body: '대각선 네 방향. 같은 색 칸만 다니는 셈이라 혼자서는 닿지 않는 칸이 많아요.', figure: moves('sang', '相의 움직임') },
            { title: '子 자', body: '앞으로 한 칸만. 뒤로도 옆으로도 못 가서, 내려놓을 자리를 잘 골라야 해요.', figure: moves('ja', '子의 움직임') },
            { title: '侯 후', body: '子가 승급한 말. 뒤쪽 대각선 둘을 뺀 여섯 방향으로 움직여요. 잡히면 子로 돌아가요.', figure: moves('hu', '侯의 움직임') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        title: '헷갈리는 규칙 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '잡은 말을 바로 내려놓을 수 있나요?', body: '잡는 것으로 그 차례가 끝나요. 내려놓기는 그다음 내 차례부터예요. 내려놓기도 한 차례를 다 써요.' },
            { title: '子를 상대 진영에 바로 내려놓으면 侯가 되나요?', body: '상대 진영에는 아예 내려놓을 수 없어요. 대신 3줄(상대 진영 바로 앞)에 내려놓은 뒤 다음 차례에 한 칸 올라가면 侯로 승급해요.' },
            { title: '내 진영에도 내려놓을 수 있나요?', body: '네. 금지되는 곳은 상대 진영뿐이라 1~3줄의 빈칸이면 어디든 돼요. 내 王 옆을 막는 수비용으로 자주 써요.' },
            { title: '王이 상대 진영에 들어가자마자 이기나요?', body: '아니요. 들어간 다음 상대 차례가 한 번 지나야 해요. 그 사이 상대가 그 王을 잡으면 오히려 내가 져요. 들어가는 순간이 아니라 **버틴 순간**에 이겨요.' },
            { title: '두 王이 서로의 진영에 들어가면?', body: '먼저 들어간 쪽이 상대 차례를 버티는 순간 이겨요. 상대가 나중에 내 진영에 들어가도, 그 수가 끝나는 시점에 먼저 들어간 王이 살아 있으면 먼저 들어간 쪽의 승리예요.' },
            { title: '같은 수를 계속 반복하면?', body: '판·포로·차례가 완전히 같은 국면을 세 번째로 만드는 수는 둘 수 없어요(그 수로 바로 이기는 경우는 예외). 모든 수가 반복이 되는 드문 경우에만 반복이 허용돼요. 그리고 200수가 지나면 무승부로 끝나요.' },
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 두기 — 첫 수 子 교환',
        lead: '내가 선공일 때 가장 먼저 눈에 들어오는 수순이에요. 네 장면으로 따라가 봐요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1수: 子로 상대 子 잡기 (B2→B3)', body: '두 子가 마주 보고 있어서 선공은 첫 수에 상대 子를 잡을 수 있어요. 잡은 子는 내 포로가 돼요.', figure: fig(OPEN1, '1수 子로 子 잡기') },
            { title: '2수: 상대 王이 되잡기 (B4→B3)', body: 'B3의 내 子는 상대 王(B4)과 相(C4) 둘 다 닿는 자리라 곧바로 잡혀요. 여기서는 王으로 되잡았다고 해 볼게요. 이제 서로 子 하나씩을 포로로 들고 있어요.', figure: fig(OPEN2, '2수 王으로 되잡기') },
            { title: '3수: 포로 子를 B2에 내려놓기', body: '방금 비운 B2에 포로 子를 내려놓으면 子가 바로 앞의 상대 王(B3)을 노려요. 상대 王은 B2를 잡을 수 없어요. B2는 내 相(A1)과 王(B1)이 지키고 있어서, 잡는 순간 내가 그 王을 잡아 이기거든요.', figure: fig(OPEN3, '3수 子 내려놓기') },
            { title: '4수: 상대 王은 물러나야 해요', body: '상대 王이 갈 수 있는 안전한 칸은 A3·C3·B4예요. A2와 C2는 내 王과 將이 닿는 칸이라 들어가면 잡혀요. 이렇게 상대가 피하는 동안 나는 한 수를 번 셈이에요. 이 템포로 子를 3줄로 올리거나 將을 앞으로 꺼내 다음 공격을 준비해요.', figure: fig(OPEN4, '4수 王이 피할 칸') },
          ] },
          { type: 'callout', tone: 'note', title: '상대가 2수에 相으로 되잡으면', text: '相(C4)으로 되잡아도 서로 子 하나씩이라는 점은 같아요. 다만 이번엔 B3의 相을 상대 王(B4)이 지키고 있어서 3수에 B2로 子를 내려놓아도 王을 노리는 수가 되지 않아요. 相이 진영을 비운 C4 쪽이 약해졌다는 점을 기억해 두고, 將을 C2로 올려 그쪽을 노리는 식으로 이어 가요.' },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        title: '입문 전략 — 王부터 지키기',
        blocks: [
          { type: 'p', text: '십이장기의 패배는 대부분 "王이 잡히는 칸을 못 봤다"에서 나와요. 판이 12칸뿐이라 모든 말의 닿는 칸을 머릿속으로 다 그릴 수 있어요. 입문 단계에서는 이 습관 하나면 충분해요.' },
          { type: 'list', items: [
            '**두기 전에 王 주변 확인**: 내 王이 서 있는 칸과 옮길 칸에 상대 말(그리고 상대가 내려놓을 수 있는 포로)이 다음 차례에 닿는지 보세요.',
            '**옮기면 빈자리가 생겨요**: 말 하나를 옮기면 그 말이 지키던 칸이 비어요. 옮긴 뒤 공짜로 잡히는 내 말이 생기지 않는지 확인하세요.',
            '**王은 지켜진 말을 못 잡아요**: 내 말이 다른 내 말에게 지켜지고 있으면, 상대 王은 그 말을 잡으러 들어올 수 없어요. 잡는 순간 내가 그 王을 잡으니까요. 서로 지켜 주는 모양을 만들면 상대 王이 들어오지 못해요.',
            '**포로는 급하게 쓰지 않기**: 포로는 언제 써도 사라지지 않아요. 지금 꼭 필요한 자리가 없다면 판 위의 말을 움직이고 포로는 아껴 두세요.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: '지켜진 말', title: '서로 받쳐 주는 모양', body: '그림에서 B2의 相은 B1의 王과 C2의 將이 함께 지키고 있어요. 상대 王(B3)이 B2를 잡으면 곧바로 王이나 將에게 잡히니 B2는 사실상 안전한 칸이에요. 이렇게 말을 서로 받치는 자리에 두면, 판 위의 말이 적어도 쉽게 무너지지 않아요.', figure: fig(GUARD, '서로 지켜 주는 배치') },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 포로를 무기로',
        blocks: [
          { type: 'p', text: '중급부터는 포로가 승부를 가르기 시작해요. 십이장기에서 말을 잡는다는 건 상대 말을 없애는 동시에 **내 손에 언제든 쓸 수 있는 말이 생긴다**는 뜻이라, 교환 한 번에 양쪽 전력이 두 배로 출렁여요.' },
          { type: 'table', caption: '말의 대략적인 가치 (PUZZLTHINK AI가 형세를 볼 때 쓰는 점수)', head: ['말', '점수', '메모'], rows: [
            ['子', '1', '앞으로만 가지만, 3줄에 내려놓으면 승급 위협이 돼요.'],
            ['相', '3', '대각선 전용. 혼자서는 닿지 않는 칸이 많아요.'],
            ['將', '4', '줄과 열을 막는 수비의 핵심이에요.'],
            ['侯', '4.5', '판 위에서 가장 강한 공격 말. 잡히면 상대에겐 子로 가요.'],
          ] },
          { type: 'p', text: 'AI는 손에 든 포로를 판 위 말의 0.9배 정도로 쳐요. 판 위에 있으면 바로 움직일 수 있지만, 손에 있으면 거의 어디든 놓을 수 있어서 값이 크게 다르지 않다는 뜻이에요.' },
          { type: 'cards', items: [
            { tag: '승급', title: '子는 3줄에 내려놓기', body: '子를 상대 진영 바로 앞(3줄)에 내려놓으면 다음 차례에 한 칸 올라가 侯가 돼요. 그 칸을 상대가 바로 지키지 못하면 侯가 생겨요. 그림처럼 A3에 놓으면 A4로 올라갈 길이 열려요.', figure: fig(PROMOTE, '子를 3줄에 내려놓기') },
            { tag: '교환', title: '잡히면 상대 손에 들어가요', body: '내 將을 내주고 상대 相을 받는 교환은 판 위에서만 보면 1점 손해지만, 그 將이 상대 손에서 바로 내 王 옆에 내려온다면 손해는 훨씬 커요. 교환 전에 "내가 내준 말이 어디에 내려올 수 있나"까지 보세요.' },
          ] },
          { type: 'list', items: [
            '**내려놓기는 수비에도 강해요**: 내 王 앞의 빈칸이나 상대 王이 들어오려는 칸에 포로를 놓으면 그 칸이 막혀요. 내 진영에도 놓을 수 있다는 점을 잊지 마세요.',
            '**포로가 많을수록 상대 진영이 위험해요**: 상대 진영에는 놓을 수 없지만, 3줄에 놓은 말은 진영을 바로 겨눠요. 포로 두 개를 들고 있으면 연속 위협을 만들 수 있어요.',
            '**侯는 아끼되 잃지 않기**: 侯는 강하지만, 잡히면 상대에게 子를 주는 데서 끝나요. 侯를 지키느라 王이 위험해지는 건 손해예요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 입성 수읽기와 반복 규칙',
        blocks: [
          { type: 'h3', text: '입성: 들어갈 칸이 아니라 버틸 칸을 본다' },
          { type: 'p', text: '내 王이 상대 진영에 들어가 상대 차례를 버티면 이겨요. 그래서 3줄까지 올라온 王은 그 자체로 큰 위협이에요. 들어가기 전에는 **들어갈 칸에 닿는 상대 말이 있는지**, 그리고 **상대가 그 칸 옆에 포로를 내려놓아 잡을 수 있는지**를 둘 다 확인해야 해요. 상대는 자기 진영(4줄)과 3줄에 포로를 내려놓을 수 있으니, 들어갈 칸에 닿는 빈칸이 있다면 그 칸도 위험해요.' },
          { type: 'cards', columns: 1, items: [
            { tag: '입성', title: '닿지 않는 칸으로 들어가기', body: '그림에서 내 王(C3)은 B4나 C4로 들어갈 수 있어요. B4는 상대 王(A4)과 相(A3)이 모두 닿는 칸이라 들어가면 바로 잡혀요. C4는 두 말 모두 닿지 않으니, 상대가 다음 수에 C4를 잡을 방법(내려놓기 포함)이 없다면 C4 입성이 곧 승리예요.', figure: fig(ENTRY, '입성할 칸 고르기') },
          ] },
          { type: 'h3', text: '입성 막기: 들어올 칸을 미리 지키기' },
          { type: 'p', text: '반대로 상대 王이 2줄까지 내려오면 다음 수에 내 진영(1줄)으로 들어올 수 있어요. 이때 王을 잡을 수 없다면, 들어올 수 있는 1줄의 모든 칸에 내 말이 닿도록 지키거나, 그 칸을 내 말이나 포로로 채워야 해요. 상대 王이 3줄에 있을 때부터 미리 준비하는 게 안전해요.' },
          { type: 'h3', text: '수읽기 습관: 3수 앞까지는 전부 본다' },
          { type: 'p', text: '십이장기는 한 국면에서 둘 수 있는 수가 많지 않아요. 판 위 말의 이동과 포로 내려놓기를 합쳐도 대개 스무 개 안팎이에요. 그래서 "내 수 → 상대의 가장 아픈 대응 → 내 다음 수"까지 세 수는 빠짐없이 볼 수 있어요. 특히 王을 노리는 수(장군)는 상대의 대응이 몇 개로 줄어들기 때문에, 연속으로 王을 노리는 수순이 있는지 먼저 찾아보세요.' },
          { type: 'h3', text: '반복 금지를 이용하기' },
          { type: 'p', text: '같은 국면을 세 번째로 만드는 수는 둘 수 없어요. 상대가 같은 두 수를 오가며 버티고 있다면, 그 왕복은 곧 막혀요. 내가 유리할 땐 같은 위협을 반복해 상대의 버티는 수를 하나씩 지워 나가고, 불리할 땐 반복으로 시간을 끄는 전략이 오래 통하지 않는다는 걸 기억하세요. 끝까지 승부가 나지 않으면 200수에서 무승부예요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**서둘러 입성하기**: 4줄에 들어가는 순간 이긴 게 아니에요. 상대 말이나 내려놓을 포로가 그 칸에 닿으면 그대로 王을 잃어요.',
            '**포로를 바로 다 쓰기**: 잡자마자 내려놓으면 상대가 다음 수에 다시 잡아 가는 일이 많아요. 지켜지는 칸이 아니면 기다리세요.',
            '**子를 막다른 곳에 놓기**: 子는 앞으로만 가요. 상대 말 바로 뒤에 내려놓으면 움직이지도 못하고 잡히기만 해요.',
            '**王을 진영에만 두기**: 王은 가장 많이 움직이는 말이에요. 끝줄에 묶어 두면 공격도 수비도 약해져요. 지켜지는 칸이라면 한 칸 앞으로 나오세요.',
            '**상대 포로를 잊기**: 상대 손에 있는 말은 판 위에 없어도 다음 수에 거의 아무 데나 나타나요. 상대가 포로를 들고 있다면 내 진영을 뺀 모든 빈칸(2~4줄)에 그 말이 나타날 수 있다고 보세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구, 꿀팁 분석',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국', '선공을 나·AI·랜덤 중에서 골라요. 턴 시간은 없음·90초·60초·30초 중에 고를 수 있고, 시간이 지나면 무작위 수가 자동으로 두어지며 세 번 연속이면 시간패예요.'],
            ['쉬움', '바로 다음 한 수만 보고, 큰 무작위성을 섞어 둬요. 공짜로 잡히는 말을 자주 남겨요.'],
            ['보통', '양쪽 수를 합쳐 서너 수 앞까지 읽어요. 단순한 함정에는 잘 안 걸리지만 긴 수순은 놓쳐요.'],
            ['어려움', '다섯 수 앞까지 읽고 무작위성이 거의 없어요. 입성 위협과 포로 내려놓기를 정확히 계산해요.'],
            ['매우 어려움', '매 수 1초 남짓 동안 십여 수 앞까지 읽고, 王 잡기·입성으로 끝나는 수순과 반복 금지를 정확히 계산해요. AI 헬모드 페이지에서도 시작할 수 있어요.'],
            ['친구 방', '1:1 방을 만들어 링크를 보내면 실시간으로 대국해요. 턴 시간은 90·60·30초 중에서 골라요.'],
            ['필승 꿀팁·복기', '진 판이 끝나면 AI가 판을 거꾸로 다시 읽어 "결정적인 한 수"를 찾아 보여 줘요. 복기로 한 수씩 다시 보면서 어디서 흐름이 넘어갔는지 확인해 보세요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '진영', def: '각자 자기 쪽 끝줄 3칸. 내 진영은 1줄, 상대 진영은 4줄이에요.' },
            { term: '포로', def: '잡아 온 상대 말. 내 차례에 이동 대신 빈칸에 내려놓아 내 말로 써요(상대 진영 제외).' },
            { term: '내려놓기', def: '포로를 판에 놓는 행동. 한 차례를 다 쓰고, 놓을 때는 승급하지 않아요.' },
            { term: '승급', def: '子가 움직여서 상대 진영에 들어가 侯로 뒤집히는 것.' },
            { term: '侯', def: '승급한 子. 뒤쪽 대각선을 뺀 여섯 방향으로 움직이고, 잡히면 子로 돌아가요.' },
            { term: '입성', def: '王이 상대 진영에 들어가는 것. 상대 차례를 버티면 승리예요.' },
            { term: '지켜진 말', def: '다른 내 말이 닿는 칸에 있는 말. 상대 王이 이런 말을 잡으면 곧바로 王을 잃어요.' },
            { term: '템포', def: '상대가 내 위협을 피하느라 쓰는 한 수. 그동안 나는 다음 수를 준비할 수 있어요.' },
            { term: '반복 금지', def: '같은 국면(판·포로·차례)을 세 번째로 만드는 수는 둘 수 없다는 규칙.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '십이장기에서 선공이 유리한가요?', a: '선공은 첫 수로 상대 子를 잡을 수 있어 먼저 주도권을 잡기 쉬워요. 다만 상대가 곧바로 되잡으면 서로 子 하나씩을 든 같은 조건이 되니, 그다음 수를 얼마나 잘 두느냐가 더 중요해요.' },
      { q: '잡은 말은 어디에 내려놓을 수 있나요?', a: '상대 진영(상대 쪽 끝줄)을 뺀 모든 빈칸이에요. 내 진영에도 놓을 수 있어요. 내려놓기도 한 차례를 써요.' },
      { q: '王이 상대 진영에 들어가면 바로 이기나요?', a: '아니요. 들어간 뒤 상대 차례를 한 번 버텨야 이겨요. 그 사이 잡히면 오히려 져요.' },
      { q: '侯를 잡으면 무엇이 되나요?', a: '子로 되돌아와 내 포로가 돼요. 다시 승급시키려면 子로 내려놓고 상대 진영까지 올라가야 해요.' },
      { q: '대국이 끝나지 않으면 어떻게 되나요?', a: '같은 국면을 세 번째로 만드는 수는 둘 수 없고, 200수가 지나면 무승부로 끝나요.' },
      { q: '어느 AI 난이도부터 시작하면 좋을까요?', a: '처음이라면 쉬움으로 말의 움직임에 익숙해지고, 이기기 시작하면 보통으로 올리세요. 어려움부터는 공짜로 잡히는 말을 거의 남기지 않아요.' },
    ],
    cta: { title: '이제 한 판 둬 볼까요?', body: '첫 수 교환부터 따라 둬 보세요. 한 판은 5분이면 충분하고, 지면 AI가 결정적인 한 수를 짚어 줘요.', button: '십이장기 두러 가기' },
    disclaimer: 'PUZZLTHINK는 더 지니어스 및 관련 방송사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요.',
  },
  en: {
    meta: {
      title: '12 Janggi strategy guide — the opening trade, drops and king entry | PUZZLTHINK',
      description: 'Know the rules of 12 Janggi from The Genius but keep losing? How every piece moves, the tricky rules, the opening pawn trade move by move, guarded pieces and the king, using captured pieces, reading king entries and what each AI level does.',
      keywords: ['12 Janggi strategy', '12 Janggi guide', 'Sibi Janggi', '12 Janggi rules', 'how to win 12 Janggi', 'The Genius 12 Janggi', 'mini janggi drops'],
    },
    title: '12 Janggi strategy guide',
    lead: 'Four pieces, twelve squares — and captured pieces come back.',
    intro: [
      '12 Janggi is a miniature janggi played on a board 3 squares wide and 4 tall. Each side starts with a king (王), general (將), minister (相) and pawn (子), and because **captured enemy pieces can be dropped back in as your own**, pieces never really leave the game. The board is so small that one slip usually costs the king.',
      'This guide assumes you have read the short rules under the board and goes further: the tricky rules, the opening trade played out move by move, beginner to advanced strategy, common mistakes and a glossary. Coordinates use columns A–C from the left and ranks 1–4 counted from your side, the same as the game’s move log.',
    ],
    summary: 'The opening trade move by move, guarded pieces, drops and reading king entries.',
    sections: [
      {
        id: 'background',
        title: 'What kind of game is 12 Janggi?',
        blocks: [
          { type: 'p', text: 'Twelve-square janggi became widely known through the Korean brain-survival show The Genius. Twelve squares, four pieces and the rule that captured pieces return create deep calculation in very little time, and it produced some of the show’s tensest matches.' },
          { type: 'p', text: 'Classical Korean janggi has no drops. Bringing captured pieces back as your own is the signature rule of Japanese chess (shogi). In board size and pieces, 12 Janggi is almost the same as Dōbutsu shōgi ("animal shogi"), a 3×4 mini shogi made in Japan to teach children; rename its pieces with the hanja 王, 將, 相, 子 and 侯 and you have 12 Janggi.' },
          { type: 'p', text: 'PUZZLTHINK’s 12 Janggi lets you play the AI or a friend by link. A move that repeats a position for the third time is not allowed and the game is drawn after 200 moves, so every game ends.' },
        ],
      },
      {
        id: 'rules',
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board and camps**: 3×4, 12 squares. The three squares on each player’s back rank are their **camp** — rank 1 for you, rank 4 for the opponent.',
            '**Setup**: on your side 相 on A1, 王 on B1, 將 on C1 and 子 on B2, right in front of the king. The opponent mirrors this, so their 子 stands on B3 — the two pawns face each other from the start.',
            '**Moving**: on your turn, move one piece one square in a direction it is allowed to go. Pieces never turn around.',
            '**Capturing**: moving onto an enemy piece captures it; it goes to your **hand**.',
            '**Dropping**: instead of moving, you may put one piece from your hand on an empty square — **but never in the enemy camp** (rank 4). Your own camp and the two middle ranks are fine.',
            '**Promotion**: a 子 that moves into the enemy camp flips into a 侯. Capture an enemy 侯 and it returns to your hand as a 子.',
            '**Winning**: capture the enemy king. Or get your king into the enemy camp and still have it there when your next turn comes (**king entry**).',
          ] },
          { type: 'figure', node: fig(START, '12 Janggi starting position'), caption: 'The starting position. You are at the bottom (orange), the opponent at the top (green). The bottom rank is your camp, the top rank theirs.' },
          { type: 'h3', text: 'How the pieces move' },
          { type: 'cards', items: [
            { title: '王 King', body: 'One square in all eight directions. The most mobile piece — and losing it ends the game.', figure: moves('wang', 'King moves') },
            { title: '將 General', body: 'Forward, back, left and right. It runs along ranks and files and is the best blocker.', figure: moves('jang', 'General moves') },
            { title: '相 Minister', body: 'The four diagonals. Like a bishop it stays on one colour of square, so it cannot reach many squares alone.', figure: moves('sang', 'Minister moves') },
            { title: '子 Pawn', body: 'One square forward only. It never goes back or sideways, so choose drop squares carefully.', figure: moves('ja', 'Pawn moves') },
            { title: '侯 Lord', body: 'The promoted pawn: six directions, everything except the two back diagonals. Captured, it turns back into a pawn.', figure: moves('hu', 'Lord moves') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        title: 'Tricky rules — what happens if…',
        blocks: [
          { type: 'cards', items: [
            { title: 'Can I drop a piece the turn I capture it?', body: 'No — the capture is your turn. You can drop it from your next turn on, and a drop uses a whole turn too.' },
            { title: 'Does a pawn dropped in the enemy camp promote?', body: 'You cannot drop into the enemy camp at all. Drop it on rank 3 instead (just in front of the camp); stepping forward next turn promotes it to 侯.' },
            { title: 'Can I drop into my own camp?', body: 'Yes. Only the enemy camp is off-limits, so any empty square on ranks 1–3 is fine. Dropping next to your own king is a common defence.' },
            { title: 'Do I win the moment my king enters?', body: 'No. One opponent turn has to pass. If they capture the king in that turn, you lose instead. You win when the king **survives**, not when it arrives.' },
            { title: 'Both kings in each other’s camps?', body: 'The king that entered first wins as soon as it survives the opponent’s turn. If the opponent answers by entering your camp, the first king is still standing when that move ends, so the first entry wins.' },
            { title: 'What about repeating moves forever?', body: 'You cannot play a move that creates the same position (board, hands and side to move) for the third time, unless that move wins outright. Only in the rare case where every move would repeat is repetition allowed. After 200 moves the game is a draw.' },
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Play along — the opening pawn trade',
        lead: 'The first sequence you notice when you move first, in four positions.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Move 1: pawn takes pawn (B2→B3)', body: 'The two pawns face each other, so the first player can take the enemy pawn on move one. It goes to your hand.', figure: fig(OPEN1, 'Move 1, pawn takes pawn') },
            { title: 'Move 2: the king recaptures (B4→B3)', body: 'Your pawn on B3 is attacked by both the enemy king (B4) and minister (C4), so it is taken straight back. Say the king recaptures. Now each side holds one pawn in hand.', figure: fig(OPEN2, 'Move 2, the king recaptures') },
            { title: 'Move 3: drop the pawn on B2', body: 'Drop your pawn on the square you just left. It now attacks the enemy king on B3. The king cannot afford to take it: B2 is guarded by your minister (A1) and king (B1), so capturing would let you take the king and win.', figure: fig(OPEN3, 'Move 3, dropping the pawn') },
            { title: 'Move 4: the king has to step away', body: 'The enemy king’s safe squares are A3, C3 and B4. A2 and C2 are covered by your king and general. While the opponent spends a move escaping, you have gained a tempo — use it to push the pawn to rank 3 or bring the general forward.', figure: fig(OPEN4, 'Move 4, where the king can go') },
          ] },
          { type: 'callout', tone: 'note', title: 'If the minister recaptures on move 2', text: 'Recapturing with the minister (C4) also leaves one pawn in each hand. But now the minister on B3 is guarded by the enemy king on B4, so dropping on B2 no longer threatens the king. Remember that C4 has been left empty, and aim there instead — for example by bringing your general up to C2.' },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        title: 'Beginner strategy — guard the king first',
        blocks: [
          { type: 'p', text: 'Most 12 Janggi losses come from not seeing a square where the king can be taken. With only 12 squares you can picture every piece’s reach in your head; at the start, that one habit is enough.' },
          { type: 'list', items: [
            '**Check around your king before every move**: can an enemy piece — or a piece the opponent could drop — reach your king’s square, or the square it is moving to, next turn?',
            '**Moving opens holes**: when a piece moves, the squares it was guarding go unguarded. Make sure no piece of yours is left hanging.',
            '**A king cannot take a guarded piece**: if your piece is protected by another of yours, the enemy king cannot afford to capture it — you would take the king right back. Pieces that guard each other keep the enemy king out.',
            '**Do not rush your drops**: a piece in hand never goes away. If there is no square it is needed on right now, move a piece on the board and keep the drop.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: 'GUARDED', title: 'Pieces that hold each other up', body: 'Here the minister on B2 is guarded by both the king on B1 and the general on C2. If the enemy king (B3) took B2 it would be captured immediately, so B2 is effectively safe. Pieces placed to support each other do not collapse easily, even with few pieces on the board.', figure: fig(GUARD, 'Pieces guarding each other') },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — your hand is a weapon',
        blocks: [
          { type: 'p', text: 'From the intermediate level, the hand starts deciding games. Capturing in 12 Janggi removes an enemy piece **and** gives you a piece to use whenever you like, so every trade swings both armies twice over.' },
          { type: 'table', caption: 'Rough piece values (the scores PUZZLTHINK’s AI uses to judge positions)', head: ['Piece', 'Value', 'Notes'], rows: [
            ['子 Pawn', '1', 'Only moves forward, but a drop on rank 3 threatens promotion.'],
            ['相 Minister', '3', 'Diagonals only; many squares are out of its reach.'],
            ['將 General', '4', 'The heart of the defence: it blocks ranks and files.'],
            ['侯 Lord', '4.5', 'The strongest attacker on the board; captured, it gives the opponent a pawn.'],
          ] },
          { type: 'p', text: 'The AI values a piece in hand at about 0.9 of the same piece on the board: on the board it can move at once, in hand it can appear almost anywhere, and the two are worth nearly the same.' },
          { type: 'cards', items: [
            { tag: 'PROMOTION', title: 'Drop pawns on rank 3', body: 'A pawn dropped just in front of the enemy camp (rank 3) promotes to 侯 by stepping forward next turn. If the opponent cannot cover that square at once, you get a lord. Dropping on A3 as in the picture opens the way to A4.', figure: fig(PROMOTE, 'Dropping a pawn on rank 3') },
            { tag: 'TRADES', title: 'What you lose goes to their hand', body: 'Giving your general for their minister costs one point on the board — but if that general can be dropped next to your king straight away, it costs far more. Before trading, ask where the piece you give up can land.' },
          ] },
          { type: 'list', items: [
            '**Drops defend well too**: dropping onto the empty square in front of your king, or the square the enemy king wants, shuts it. Remember you can drop into your own camp.',
            '**A full hand makes the enemy camp dangerous**: you cannot drop into it, but pieces dropped on rank 3 aim straight at it. With two pieces in hand you can make threat after threat.',
            '**Keep the lord, but not at any price**: a 侯 is strong, but losing it only gives the opponent a pawn. Endangering your king to save it is a bad trade.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — reading king entries and repetition',
        blocks: [
          { type: 'h3', text: 'Entering: look at where the king must survive' },
          { type: 'p', text: 'Your king wins by entering the enemy camp and surviving one opponent turn, so a king on rank 3 is a big threat by itself. Before stepping in, check both **whether any enemy piece reaches the entry square** and **whether the opponent can drop a piece next to it to take the king**. The opponent may drop into their own camp (rank 4) and onto rank 3, so any empty square from which a dropped piece would reach your king’s square is a danger too.' },
          { type: 'cards', columns: 1, items: [
            { tag: 'ENTRY', title: 'Enter where nothing reaches', body: 'Here your king (C3) can enter B4 or C4. B4 is covered by both the enemy king (A4) and minister (A3), so stepping there loses the king. Neither reaches C4 — if the opponent also has no way to capture on C4 next move (drops included), entering C4 wins.', figure: fig(ENTRY, 'Choosing the entry square') },
          ] },
          { type: 'h3', text: 'Stopping an entry: guard the squares in advance' },
          { type: 'p', text: 'When the enemy king reaches rank 2 it can enter your camp (rank 1) next move. If you cannot capture it, every rank-1 square it could enter must be covered by one of your pieces or filled with a piece or a drop. It is safer to prepare while their king is still on rank 3.' },
          { type: 'h3', text: 'Reading habit: see everything three moves deep' },
          { type: 'p', text: 'A 12 Janggi position never has many legal moves — board moves and drops together are usually around twenty. So you can check every line of "my move → their most painful reply → my next move". Moves that attack the king cut the opponent’s replies down to a few, so look first for a chain of king attacks.' },
          { type: 'h3', text: 'Using the repetition rule' },
          { type: 'p', text: 'A move that creates the same position for the third time is not allowed. If the opponent is holding on by shuffling between the same two moves, that shuffle will soon be blocked. When you are better, repeat the same threat to strip away their holding moves one by one; when you are worse, remember that stalling by repetition does not last. If nothing is decided, the game is drawn at move 200.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Entering too soon**: reaching rank 4 is not a win yet. If an enemy piece or a possible drop reaches that square, the king is simply lost.',
            '**Dropping everything at once**: a piece dropped the moment you get it is often captured straight back. Unless the square is guarded, wait.',
            '**Pawns in dead ends**: a pawn only moves forward. Drop it right behind an enemy piece and it can neither move nor escape.',
            '**Keeping the king at home**: the king is your most mobile piece. Tied to the back rank it neither attacks nor defends well; if the square is guarded, step it forward.',
            '**Forgetting the opponent’s hand**: a piece in their hand is not on the board, but next turn it can appear almost anywhere. If they hold a piece, assume it can appear on any empty square outside your camp (ranks 2–4).',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friends and move analysis',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games', 'Choose who moves first: you, the AI or random. Turn time can be off, 90, 60 or 30 seconds; when time runs out a random move is played for you, and three timeouts in a row lose the game.'],
            ['Easy', 'Looks only at the very next move and adds a lot of randomness. It often leaves pieces hanging.'],
            ['Normal', 'Reads three or four moves ahead (counting both sides’ moves). It avoids simple traps but misses long lines.'],
            ['Hard', 'Reads five moves ahead with almost no randomness, and calculates entries and drops accurately.'],
            ['Very Hard', 'Reads a dozen or more moves ahead in about a second per move, and calculates king captures, entries and the repetition rule exactly. You can also start it from the AI Hell Mode page.'],
            ['Friend rooms', 'Create a 1:1 room and send the link to play live. Turn time is 90, 60 or 30 seconds.'],
            ['Winning tips and replay', 'After a loss, the AI re-reads the game backwards to find the decisive move and shows what would have won or held. Use the replay to step through the game and see where it turned.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Camp', def: 'Each player’s back rank of three squares: rank 1 for you, rank 4 for the opponent.' },
            { term: 'Hand', def: 'Enemy pieces you have captured. On your turn you may drop one on an empty square as your own (not in the enemy camp).' },
            { term: 'Drop', def: 'Putting a piece from your hand on the board. It uses your turn, and a dropped piece never promotes on the spot.' },
            { term: 'Promotion', def: 'A pawn moving into the enemy camp and flipping into a 侯.' },
            { term: '侯 (Lord)', def: 'The promoted pawn. Moves in six directions (all but the back diagonals); captured, it returns as a pawn.' },
            { term: 'King entry', def: 'Your king entering the enemy camp. Surviving the opponent’s next turn wins.' },
            { term: 'Guarded piece', def: 'A piece on a square another of your pieces reaches. An enemy king that captures it is lost at once.' },
            { term: 'Tempo', def: 'A move your opponent spends dodging your threat, which you get to use for your next plan.' },
            { term: 'No repetition', def: 'You cannot make a move that creates the same position (board, hands and side to move) for the third time.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Is moving first an advantage in 12 Janggi?', a: 'Moving first lets you take the enemy pawn on move one, which makes it easier to seize the initiative. But if they recapture at once both sides hold one pawn, so what you do next matters more.' },
      { q: 'Where can I drop captured pieces?', a: 'On any empty square except the enemy camp (their back rank). Your own camp is allowed. A drop uses your turn.' },
      { q: 'Does my king win as soon as it enters the enemy camp?', a: 'No. It has to survive one opponent turn there. If it is captured in that turn, you lose.' },
      { q: 'What do I get for capturing a 侯?', a: 'A pawn in your hand. To promote it again you must drop it as a pawn and walk it into the enemy camp.' },
      { q: 'What if a game never ends?', a: 'A move that repeats the same position for the third time is not allowed, and after 200 moves the game is a draw.' },
      { q: 'Which AI level should I start with?', a: 'Start on Easy to learn how the pieces move, and move up to Normal once you win. From Hard on, the AI rarely leaves a piece hanging.' },
    ],
    cta: { title: 'Ready for a game?', body: 'Try the opening trade from this guide. A game takes about five minutes, and if you lose the AI points out the decisive move.', button: 'Play 12 Janggi' },
    disclaimer: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Genius or its broadcaster. Show names are used only to describe the game.',
  },
};

export default guide;
