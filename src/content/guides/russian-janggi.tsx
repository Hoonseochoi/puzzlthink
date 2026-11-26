// 러시아장기 guide. Rules and numbers follow src/lib/russianJanggi.ts (PER_SIZE 2, canPlace "strictly bigger",
// moveTargets, applyAction: the opponent's revealed line is checked first, passTo skip/draw, TURN_SECONDS 10,
// MAX_PLY 80, chooseAiAction levels), src/lib/russianJanggiHell.ts (iterative deepening to the end, 1.5 s / 1 s on
// touch screens, returning to an earlier position scored as a draw), src/lib/russianJanggiRoom.ts (10-second turns,
// a timeout passes the turn, six timeouts in a row abandon the game, random first player), RJGame.tsx (first player
// me/AI/random, timer on/off, resign), RJTips (winning tips) and the RussianJanggiGuide messages in ko.json.
// Coordinates follow the game's move log (describe.ts cellName): columns A–C left to right, rows 3 (top) to 1.
// Boards are drawn with the game's own cup (RJPiece): red "+" cups are you, blue "○" cups the opponent.
import RJPiece from '@/components/russianJanggi/RJPiece';
import type { Side, Size } from '@/lib/russianJanggi';
import type { GameGuide } from './types';

type Cup = `${'r' | 'b'}${Size}`; // r = red (you), b = blue; 0 small, 1 medium, 2 large
type BoardSpec = { cells: Partial<Record<string, Cup[]>>; threat?: string[]; mark?: string[] }; // stacks bottom → top

const CELLS = ['A3', 'B3', 'C3', 'A2', 'B2', 'C2', 'A1', 'B1', 'C1'];
const WIDTH = ['42%', '62%', '84%'];
const SIZE_LETTER = ['S', 'M', 'L'];

function RJBoard({ spec, label }: { spec: BoardSpec; label: string }) {
  return (
    <div role="img" aria-label={label} className="mx-auto w-full max-w-[220px]">
      <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/15 bg-[#14110b] p-2">
        {CELLS.map((cell) => {
          const stack = spec.cells[cell] ?? [];
          const topCup = stack[stack.length - 1];
          const under = stack.slice(0, -1);
          const threat = spec.threat?.includes(cell);
          const mark = spec.mark?.includes(cell);
          return (
            <div key={cell} className={`relative flex aspect-square items-end justify-center rounded-md border pb-1 ${mark ? 'border-[#f2b84b] bg-[#f2b84b]/10' : threat ? 'border-dashed border-[#f2b84b]/70' : 'border-white/10 bg-white/[0.03]'}`}>
              <span className="absolute left-1 top-0.5 font-mono text-[8px] text-white/30">{cell}</span>
              {topCup && <RJPiece owner={(topCup[0] === 'r' ? 0 : 1) as Side} size={Number(topCup[1]) as Size} style={{ width: WIDTH[Number(topCup[1])] }} />}
              {under.length > 0 && (
                <span className="absolute right-1 top-0.5 flex gap-0.5">
                  {under.map((cup, i) => <span key={i} className={`rounded px-0.5 font-mono text-[7px] font-black text-white ${cup[0] === 'r' ? 'bg-[#ec3b2c]' : 'bg-[#2f6fe8]'}`}>{SIZE_LETTER[Number(cup[1])]}</span>)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const fig = (spec: BoardSpec, label: string) => <RJBoard spec={spec} label={label} />;

// Lifting trap: red's large on B3 covers a blue small, between two blue mediums. Moving it anywhere but A3 or C3
// reveals blue's top row; moving it onto A3 (over the blue medium) keeps the row broken.
const REVEAL: BoardSpec = { cells: { A3: ['b1'], B3: ['b0', 'r2'], C3: ['b1'], A2: ['r0'], C1: ['r1'] }, mark: ['B3'], threat: ['A3'] };
// Both lines at once: moving the large B3 → C1 completes red's column C but reveals blue's column B — blue wins.
// Placing a cup from hand on C1 wins instead.
const PRIORITY: BoardSpec = { cells: { B3: ['b0', 'r2'], B2: ['b1'], B1: ['b1'], C3: ['r1'], C2: ['r0'] }, mark: ['C1'] };
// Walkthrough (red moves first).
const W3: BoardSpec = { cells: { B2: ['r2'], A3: ['b2'], C3: ['r1'] }, threat: ['A1'] };
const W4: BoardSpec = { cells: { B2: ['r2'], A3: ['b2'], C3: ['r1'], A1: ['b2'] }, threat: ['A2'] };
const W5: BoardSpec = { cells: { B2: ['r2'], A3: ['b2'], C3: ['r1'], A1: ['b2'], A2: ['r1'] }, threat: ['C2'] };
const W6: BoardSpec = { cells: { B2: ['r2'], C3: ['r1'], A1: ['b2'], A2: ['r1'], C2: ['b2'] }, mark: ['C2'] };
const W7: BoardSpec = { cells: { B2: ['r2'], C3: ['r1'], A1: ['b2'], A2: ['r1'], C2: ['b2'], A3: ['r2'] }, mark: ['A3'], threat: ['B3', 'C1'] };

const guide: GameGuide = {
  game: 'russianJanggi',
  origin: { kind: 'show', show: 'society2' },
  updated: '2026-11-26',
  related: ['janggi', 'pointOmok', 'fourThree', 'nineMensMorris'],
  ko: {
    meta: {
      title: '러시아장기 공략 — 덮기·옮기기 규칙, 드러나는 줄, 선공 필승 수순 | PUZZLTHINK',
      description: '소사이어티 게임 2 러시아장기 공략. 큰 말이 작은 말을 덮는 규칙, 말을 들 때 드러나는 상대 줄, 동시에 두 줄이 생기면 누가 이기는지, 선공 양수(포크) 따라 두기, 큰말 아끼는 법, AI 매우 어려움까지 정리했어요.',
      keywords: ['러시아장기 공략', '러시아장기 규칙', '러시아장기 필승법', '러시아장기 이기는 법', '소사이어티 게임 러시아장기', '덮는 틱택토', '고블렛 고블러스 전략', '러시아 장기'],
    },
    title: '러시아장기 공략',
    lead: '9칸짜리 삼목인데, 큰 컵이 작은 컵을 삼켜요.',
    intro: [
      '러시아장기는 3×3 판에서 맨 위에 보이는 내 말 세 개를 한 줄로 만드는 게임이에요. 틱택토와 다른 점은 두 가지예요. **큰 말이 작은 말을 컵처럼 덮을 수 있고, 판 위에 놓인 내 말을 다른 칸으로 옮길 수도 있어요.** 그래서 9칸이 다 차도 끝나지 않고, 덮인 말이 다시 드러나면서 판이 한 수 만에 뒤집혀요.',
      '이 공략은 규칙의 경계선부터 정확히 짚고, 실제 한 판을 처음부터 따라 두며 "양수(포크)"가 어떻게 만들어지는지 보여 줘요. 그다음 단계별 전략, 자주 하는 실수, AI 난이도와 친구 방 메모를 정리했어요. 좌표는 게임의 기보와 같이 가로 A~C(왼쪽부터), 세로 3~1(위에서부터)이에요. 그림의 빨강(+)이 나, 파랑(○)이 상대이고, 칸 오른쪽 위의 작은 S·M·L 표시는 그 칸 아래에 덮여 있는 말이에요.',
    ],
    gamePageTitle: '러시아장기 온라인 — 소사이어티 게임 2 그 게임을 웹에서',
    summary: '덮기와 드러나는 줄, 선공 양수 따라 두기, 큰말 아끼는 법, 매우 어려움 AI까지.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '러시아장기는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '러시아장기는 tvN 「소사이어티 게임 2」에 나온 두뇌 게임이에요. 크기가 다른 말이 서로를 덮는 모습이 마트료시카 인형을 닮아 "러시아"라는 이름이 붙었다고 보면 기억하기 쉬워요. 보드게임 고블렛 고블러스(Gobblet Gobblers)와 같은 계열의 규칙이에요.' },
          { type: 'p', text: 'PUZZLTHINK의 러시아장기는 각자 큰말·중간말·작은말을 2개씩, 모두 6개를 들고 시작하고, 한 턴은 10초예요. 운이 끼어들 틈이 없는 완전 정보 게임이라, 같은 국면이면 같은 답이 있어요. 그만큼 수읽기가 그대로 실력이 돼요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**말**: 각자 큰말(L) 2개, 중간말(M) 2개, 작은말(S) 2개를 손에 들고 시작해요.',
            '**차례에 할 일**: 둘 중 하나예요. ① 손에 있는 말 하나를 판에 **놓기**, ② 판 위에서 맨 위에 보이는 내 말 하나를 다른 칸으로 **옮기기**.',
            '**덮기**: 빈칸에 놓거나, **자기보다 작은** 말 위에 덮을 수 있어요. 내 말이든 상대 말이든 상관없고, 같은 크기끼리는 덮을 수 없어요. 그래서 큰말은 무엇으로도 덮이지 않아요.',
            '**옮기기**: 맨 위에 있는 내 말만 옮길 수 있어요. 옮길 때도 덮기 규칙은 같아서, 도착 칸이 비어 있거나 더 작은 말이 맨 위에 있어야 해요. 덮여 있는 내 말은 위의 말이 떠나기 전엔 움직일 수 없어요.',
            '**승리**: 맨 위에 보이는 내 말 셋이 가로·세로·대각선 한 줄이 되면 이겨요. 덮인 말은 줄로 치지 않아요.',
            '**드러나는 줄**: 말을 옮겨서 아래 말이 드러났을 때 상대 줄이 완성되면 **상대가 이겨요.** 그 수로 내 줄과 상대 줄이 동시에 생겨도 상대가 이겨요.',
            '**시간과 무승부**: 한 턴은 10초예요(AI 대국은 시간 제한을 끌 수 있어요). 시간이 지나거나 둘 수 있는 수가 없으면 차례가 넘어가고, 두 사람 모두 둘 수 없으면 무승부예요. 80수가 지나도 무승부로 끝나요.',
          ] },
          { type: 'table', caption: '누가 누구를 덮을 수 있나', head: ['맨 위의 말', '작은말로', '중간말로', '큰말로'], rows: [
            ['빈칸', '○', '○', '○'],
            ['작은말 (누구 것이든)', '×', '○', '○'],
            ['중간말', '×', '×', '○'],
            ['큰말', '×', '×', '×'],
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '드러나는 줄', title: '판정은 말이 내려앉은 뒤에 해요', body: '내 큰말(B3)이 파랑 작은말을 덮어 위쪽 가로줄을 막고 있어요. 이 큰말을 A2·B2·C2 같은 다른 칸으로 옮기면 B3의 파랑이 드러나 A3–B3–C3가 완성되고 그대로 져요. 하지만 **A3나 C3의 파랑 중간말 위로** 옮기면 이야기가 달라요. 줄 판정은 말을 들고 내려놓은 뒤의 모습으로 하기 때문에, 덮은 칸이 빨강이 되어 줄이 여전히 끊겨 있어요. 막고 있는 말을 옮길 땐 "그 줄 안의 다른 칸을 덮는" 수만 안전해요.', figure: fig(REVEAL, '들면 상대 줄이 드러나는 큰말') },
            { tag: '동시 완성', title: '두 줄이 같이 생기면 상대 승리', body: '내 C3·C2가 세로줄을 거의 만들었고, B3의 큰말 아래에는 파랑 작은말이 있으며 B2·B1도 파랑이에요. 큰말을 B3에서 C1로 옮기면 C열이 완성되지만 동시에 B열 파랑 줄이 드러나요. 이럴 땐 상대 줄을 먼저 보기 때문에 파랑이 이겨요. 정답은 손에 있는 말을 C1에 **놓는** 거예요. 놓기는 아무것도 드러내지 않아요.', figure: fig(PRIORITY, '두 줄이 동시에 생기는 장면') },
          ] },
          { type: 'cards', items: [
            { title: '덮인 말은 사라지나요?', body: '아니요. 보이지 않을 뿐 그 칸에 그대로 있어요. 위의 말이 떠나면 다시 드러나고, 그 순간부터 다시 줄에 들어가요. 한 칸에 최대 세 개(작은·중간·큰)까지 쌓일 수 있어요.' },
            { title: '방금 덮인 내 말을 옮길 수 있나요?', body: '아니요. 옮길 수 있는 건 맨 위에 보이는 내 말뿐이에요. 상대 큰말 아래 깔린 내 말은 그 큰말이 떠날 때까지 묶여 있어요.' },
            { title: '옮겨서 같은 칸에 그대로 둘 수 있나요?', body: '아니요. 옮기기는 반드시 다른 칸으로 가야 해요. 차례를 그냥 넘기는 수도 없어요.' },
            { title: '둘 수 있는 수가 없으면?', body: '손이 비었고 판 위의 내 말도 갈 곳이 없으면 차례가 자동으로 넘어가요. 두 사람 다 둘 수 없으면 무승부예요.' },
            { title: '10초가 지나면 지나요?', body: '지지 않아요. 그 차례만 넘어가요. 다만 친구 방에서 양쪽 합쳐 시간 초과가 여섯 번 연속 나오면 대국이 중단돼요.' },
            { title: '왜 80수에서 끝나나요?', body: '옮기기 덕분에 같은 모양을 끝없이 오갈 수 있어서예요. 80수(양쪽 합계, 넘어간 차례 포함)가 지나면 무승부예요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 10초 안에 보는 세 가지',
        blocks: [
          { type: 'p', text: '10초는 생각보다 짧아요. 처음에는 매 차례 아래 순서대로만 확인해도 지는 판이 크게 줄어요.' },
          { type: 'list', ordered: true, items: [
            '**지금 이길 수 있나?** 내 말 두 개가 놓인 줄에 빈칸이 있거나, 덮을 수 있는 상대 말이 있으면 그 수가 먼저예요.',
            '**상대가 다음 수에 이기나?** 상대 말 두 개가 놓인 줄의 남은 칸을 막거나, 그 줄의 상대 말 하나를 더 큰 말로 덮어요.',
            '**옮기려는 말 아래에 무엇이 있나?** 옮기는 순간 드러나는 말이 상대 줄을 완성하지 않는지 마지막으로 확인해요.',
          ] },
          { type: 'list', items: [
            '**가운데 B2를 큰말로**: 가운데는 가로·세로·대각선 둘, 네 줄에 걸린 유일한 칸이에요. 큰말을 놓으면 아무도 덮을 수 없어 그 네 줄의 한 자리를 영구히 쥐어요.',
            '**막을 땐 덮이지 않는 크기로**: 상대 손에 큰말이 남아 있으면 내 중간말은 덮일 수 있어요. 상대 손을 보고, 상대가 더 이상 덮을 수 없는 크기로 막으세요.',
            '**작은말은 늦게**: 작은말은 상대의 중간말·큰말 모두에 덮여요. 판이 정리된 뒤, 덮을 말이 바닥난 상대를 상대로 쓰면 오래 살아남아요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 두기 — 선공이 양수로 이기는 한 판',
        lead: '빨강(나)이 선공이에요. 한 수 한 수 왜 그렇게 두는지, 상대에게 어떤 대안이 있었는지 함께 봐요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1~3수: 가운데 큰말, 그리고 대각선 위협', body: '1. 빨강 큰말 B2. 2. 파랑 큰말 A3(모서리). 3. 빨강 중간말 C3. 이제 C3–B2–A1 대각선에 빨강이 둘이라, A1이 비어 있으면 다음 수에 이겨요(점선 칸).', figure: fig(W3, '3수 뒤') },
            { title: '4수: 파랑은 큰말로 막아요', body: '파랑이 A1을 중간말로 막으면 빨강의 남은 큰말이 그대로 덮어 이겨요. 그래서 파랑은 큰말로 A1을 막거나 C3의 빨강 중간말을 덮어야 하는데, 여기서는 마지막 큰말을 A1에 썼어요. 그러자 파랑 A3·A1 사이 A2가 비어 이번엔 파랑이 A열 위협을 만들었어요.', figure: fig(W4, '4수 뒤') },
            { title: '5수: 중간말로 막으며 다시 위협', body: '빨강은 A2를 막아야 해요. 파랑 손에는 이제 큰말이 없으니 중간말로 막아도 덮이지 않아요. 빨강 중간말 A2. 그러면 A2–B2–C2 가로줄에 빨강 둘, C2가 새 위협이에요. **막는 수가 동시에 위협이 되는 것**이 러시아장기 수순의 기본 리듬이에요.', figure: fig(W5, '5수 뒤') },
            { title: '6수: 파랑은 어떤 큰말을 옮길까', body: '파랑은 C2를 막아야 하는데 중간말을 놓으면 빨강 큰말에 덮여요. 그래서 판 위의 큰말을 옮겨요. A1→C2는 A1을 비워 빨강 대각선(C3–B2–A1)을 열어 주니 안 돼요. C2를 직접 막는 수 중에서는 A3→C2만 버텨요. A3 아래엔 아무것도 없어서 드러나는 것도 없어요.', figure: fig(W6, '6수 뒤') },
            { title: '7수: 큰말로 양수', body: '빨강 마지막 큰말 A3. A3–B3–C3 가로줄(B3)과 A3–B2–C1 대각선(C1), 두 곳이 동시에 위협이 돼요. A3는 큰말이라 덮을 수도 없어요. 파랑이 한쪽을 막으면 빨강이 다른 쪽을 채워 9수에 이겨요. 파랑이 C2 큰말을 C3 위로 옮겨 가로줄을 끊어도, C2가 비면서 A2–B2–C2가 열려요.', figure: fig(W7, '7수 뒤 양수') },
          ] },
          { type: 'callout', tone: 'note', title: '6수에 파랑이 A3를 A2 위로 옮겼다면', text: '파랑 큰말 A3→A2는 빨강 중간말을 덮어 가로줄을 끊고, A2·A1로 A3 위협까지 만드는 좋은 수처럼 보여요. 하지만 빨강이 A3에 큰말을 놓아 막으면 다시 B3(가로줄)과 C1(대각선) 양수가 생겨요. 이 판에서 파랑의 문제는 4수까지 큰말 두 개를 다 써 버려, 빨강 중간말을 덮을 수단이 없어진 데 있어요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 손에 남은 말이 곧 힘',
        blocks: [
          { type: 'p', text: '러시아장기의 수읽기는 판 위만 보면 반쪽이에요. 양쪽 손에 남은 큰말 수가 "어떤 막기가 버티는지"를 정해요.' },
          { type: 'table', caption: '상대 손에 남은 말에 따라 내 막기가 버티는가', head: ['내가 막은 말', '상대 손에 큰말 있음', '상대 손에 중간말만', '상대 손에 작은말만'], rows: [
            ['작은말', '덮여요', '덮여요', '버텨요'],
            ['중간말', '덮여요', '버텨요', '버텨요'],
            ['큰말', '버텨요', '버텨요', '버텨요'],
          ] },
          { type: 'list', items: [
            '**큰말 하나는 끝까지**: 큰말은 공격(덮이지 않는 위협)과 수비(무엇이든 덮는 막기)를 모두 해요. 두 개를 다 쓴 쪽은 상대 중간말 위협을 덮어서 막을 수 없게 돼요. 따라 두기의 파랑이 바로 그렇게 졌어요.',
            '**덮기는 막기 + 내 칸 얻기**: 상대 줄을 빈칸에 막으면 칸 하나를 쓰지만, 상대 말을 덮으면 상대 줄을 끊으면서 그 칸이 내 것이 돼요. 덮은 칸이 내 다른 줄에도 걸리면 바로 반격이 돼요.',
            '**상대를 "족쇄"에 묶기**: 상대 줄을 막고 있는 상대 자신의 말은 옮기면 상대 줄이 아니라 내 줄이 열리는 경우가 있어요. 반대로 내 말이 내 줄의 마개 노릇을 하고 있다면, 그 말은 함부로 못 움직이는 말이라고 생각하세요.',
            '**양수 만들기**: 한 수로 두 줄에 동시에 두 개씩 놓이면 상대는 하나만 막을 수 있어요. 가운데와 모서리를 함께 쥐면 이런 갈림길이 가장 쉽게 생겨요(모서리는 세 줄, 변은 두 줄에 걸려요).',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 옮기기 수읽기와 끝내기',
        blocks: [
          { type: 'h3', text: '판이 찬 뒤에는 옮기기 싸움' },
          { type: 'p', text: '양쪽이 말 6개를 다 놓고 나면 남는 건 옮기기뿐이에요. 이때부터는 매 수가 "한 칸을 비우고 한 칸을 덮는" 수라서, 비우는 칸에서 무엇이 드러나는지와 덮는 칸이 어느 줄에 걸리는지를 동시에 봐야 해요. 아래 말이 상대 것인 칸에서 내 말을 들면 상대에게 한 칸을 돌려주는 셈이에요.' },
          { type: 'list', items: [
            '**아래가 내 말인 칸은 자유 칸**: 내 말 위에 내 말이 올라간 칸에서는 위의 말을 들어도 내 말이 드러나요. 그 칸의 줄 상황이 변하지 않으니 마음 놓고 옮길 수 있는 말이에요.',
            '**아래가 상대 말인 칸은 볼모**: 상대 말 위의 내 말은 드는 순간 상대 칸이 돼요. 가장 마지막에 쓰는 말로 남겨 두세요.',
            '**덮인 말 기억하기**: 화면에서는 맨 위만 보여요. 누가 누구를 덮었는지 머릿속에 지도를 그려 두면 상대가 어떤 말을 못 움직이는지, 어디서 줄이 되살아나는지 미리 알 수 있어요.',
          ] },
          { type: 'h3', text: '80수 무승부와 반복' },
          { type: 'p', text: '옮기기만 남으면 같은 모양을 오가며 시간을 끌 수 있어요. 유리한 쪽은 반복을 피하고 새 위협을 만들어야 하고, 불리한 쪽은 막는 수만 정확히 이어 가면 80수 무승부를 노릴 수 있어요. 매우 어려움 AI도 앞서 나온 국면으로 돌아가는 수를 무승부로 보고, 이길 수 있을 때는 다른 길을 찾아요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**마개를 뽑기**: 상대 말을 덮어 막아 둔 내 말을 공격에 쓰려고 옮기다가 상대 줄을 열어 주는 실수. 가장 흔한 역전패예요.',
            '**이기는 수를 옮기기로 두기**: 같은 칸에 놓아도 이기고 옮겨도 이긴다면 놓는 쪽이 안전해요. 옮기면 아래 말이 드러나 상대 줄이 먼저 완성될 수 있어요.',
            '**큰말 두 개를 초반에 다 쓰기**: 이후 상대 중간말 위협을 덮어서 막을 방법이 사라져요.',
            '**상대 손 확인하지 않기**: 내 중간말 막기가 버티는지는 상대 손의 큰말 수에 달렸어요.',
            '**시간에 쫓겨 아무 데나 두기**: 10초가 지나면 차례가 넘어갈 뿐 지지는 않아요. 서두른 나쁜 수보다 넘어간 차례가 나을 때도 있지만, 상대에게 한 수를 공짜로 주는 셈이니 세 가지 확인 순서를 몸에 익히세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI 난이도, 매우 어려움, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국', '선공을 나·AI·랜덤 중에서 고르고, 시간 제한(10초)을 켜거나 끌 수 있어요. 언제든 기권할 수 있어요.'],
            ['쉬움', '바로 이기는 수가 있으면 대체로 두지만 가끔 놓치고, 나머지는 거의 무작위예요.'],
            ['보통', '열에 네 번쯤은 "바로 지지만 않는 수" 중에서 아무거나 두고, 나머지는 두 수 앞까지 읽어요.'],
            ['어려움', '세 수 앞까지 읽고 무작위성이 작아요. 단순한 드러나는 줄 함정에는 걸리지 않아요.'],
            ['매우 어려움', '매 수 1.5초(터치 화면은 1초) 동안 판이 끝날 때까지 가까이 읽어요. 이기는 수순이 보이면 끝까지 정확히 두고, 앞서 나온 국면으로 돌아가는 수는 무승부로 계산해요. AI 헬모드 페이지에서도 시작할 수 있어요.'],
            ['친구 방', '방을 만들어 링크나 코드를 보내면 실시간으로 둬요. 선공은 무작위, 한 턴은 10초이고, 시간이 지나면 차례가 넘어가요. 오픈 대전에 방을 열 수도 있어요.'],
            ['필승 꿀팁·복기', '진 판이 끝나면 AI가 내 수를 거꾸로 다시 읽어, 그 수 때문에 지게 된 결정적인 순간과 대신 둘 수 있었던 수를 보여 줘요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '덮기', def: '자기보다 작은 말 위에 놓거나 옮겨서 그 말을 가리는 것. 같은 크기끼리는 안 돼요.' },
            { term: '옮기기', def: '판 위에서 맨 위에 보이는 내 말을 다른 칸으로 옮기는 것.' },
            { term: '드러나는 줄', def: '말을 옮겨 아래 말이 보이면서 완성되는 줄. 상대 줄이면 상대가 이겨요.' },
            { term: '마개', def: '상대 줄을 덮거나 막고 있어서 함부로 옮기면 안 되는 내 말.' },
            { term: '양수(포크)', def: '한 수로 이길 자리가 두 곳 생기는 것. 상대는 하나만 막을 수 있어요.' },
            { term: '손', def: '아직 판에 놓지 않은 내 말. 양쪽 손에 남은 큰말 수가 막기의 성패를 정해요.' },
            { term: '차례 넘김', def: '시간이 지나거나 둘 수 있는 수가 없을 때 차례가 상대에게 넘어가는 것.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '러시아장기는 어디에 나온 게임인가요?', a: 'tvN 「소사이어티 게임 2」에 나온 게임이에요. 보드게임 고블렛 고블러스와 같은 계열의 규칙이에요.' },
      { q: '말을 옮겨서 상대 줄이 드러나면 어떻게 되나요?', a: '상대가 이겨요. 그 수로 내 줄이 동시에 완성돼도 상대 줄을 먼저 봐서 상대가 이겨요. 다만 옮긴 말이 그 줄의 다른 칸을 덮으면 줄이 끊긴 채라 괜찮아요.' },
      { q: '같은 크기의 말은 덮을 수 없나요?', a: '네. 반드시 더 큰 말로만 덮을 수 있어요. 그래서 큰말은 한 번 놓이면 주인이 옮기기 전까지 그 칸을 지켜요.' },
      { q: '시간 안에 못 두면 지나요?', a: '지지 않고 차례만 넘어가요. AI 대국에서는 시간 제한을 끌 수도 있어요.' },
      { q: '무승부도 있나요?', a: '80수가 지나거나 두 사람 모두 둘 수 있는 수가 없으면 무승부예요.' },
      { q: '선공이 유리한가요?', a: '가운데에 큰말을 먼저 놓을 수 있어 선공이 조금 유리해요. AI 대국에서는 선공을 나·AI·랜덤 중에서 고를 수 있어요.' },
    ],
    cta: { title: '이제 한 판 둬 볼까요?', body: '따라 두기의 수순을 직접 둬 보세요. 큰말 하나를 아끼는 것만으로 승률이 달라져요.', button: '러시아장기 두러 가기' },
    disclaimer: 'PUZZLTHINK는 소사이어티 게임, tvN 및 고블렛 고블러스 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램명과 게임명은 게임을 소개하기 위해서만 사용했어요.',
  },
  en: {
    meta: {
      title: 'Russian Janggi strategy guide — covering, moving, revealed lines and forks | PUZZLTHINK',
      description: 'A guide to Russian Janggi from The Society Game 2: covering smaller cups, the line revealed when you lift a cup, who wins when two lines appear at once, a first-player fork move by move, saving a large cup, and the Very Hard AI.',
      keywords: ['Russian Janggi strategy', 'Russian Janggi rules', 'Society Game Russian Janggi', 'how to win Russian Janggi', 'Gobblet Gobblers strategy', 'stacking tic-tac-toe'],
    },
    title: 'Russian Janggi strategy guide',
    lead: 'Tic-tac-toe on nine squares — where big cups swallow small ones.',
    intro: [
      'Russian Janggi is played on a 3×3 board: get three of your cups showing on top in a row. Two things set it apart from tic-tac-toe. **A bigger cup can cover a smaller one, and you can move your own cups already on the board.** The game does not stop when all nine squares are full, and a covered cup coming back into view can turn the board over in one move.',
      'This guide pins down the exact edges of the rules, then plays a whole game from the start to show how a fork is built, followed by strategy by level, common mistakes and notes on the AI levels and friend rooms. Coordinates follow the game’s move log: columns A–C from the left, rows 3–1 from the top. In the boards red (+) is you and blue (○) the opponent; the small S/M/L tags in a square’s corner are cups covered underneath.',
    ],
    gamePageTitle: 'Russian Janggi Online — the game from The Society Game 2',
    summary: 'Covering and revealed lines, a first-player fork move by move, saving a large cup, and the Very Hard AI.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Russian Janggi?',
        blocks: [
          { type: 'p', text: 'Russian Janggi is a brain game from tvN’s The Society Game 2. Cups of different sizes nesting over each other look like matryoshka dolls — an easy way to remember the “Russian” in the name. The rules belong to the same family as the board game Gobblet Gobblers.' },
          { type: 'p', text: 'On PUZZLTHINK each side starts with two large, two medium and two small cups, six in all, and a turn lasts 10 seconds. It is a game of perfect information with no luck at all: the same position always has the same answer, so reading ahead is the whole skill.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Cups**: each side starts with 2 large (L), 2 medium (M) and 2 small (S) cups in hand.',
            '**Your turn**: do one of two things. ① **Place** a cup from your hand, or ② **move** one of your cups that is showing on top to another square.',
            '**Covering**: a cup may go on an empty square or over a **strictly smaller** cup — yours or the opponent’s. Equal sizes cannot cover each other, so a large cup can never be covered.',
            '**Moving**: only your cups on top can move, and the same covering rule applies at the destination. A covered cup of yours is stuck until the cup above it leaves.',
            '**Winning**: three of your cups showing on top in a row, column or diagonal. Covered cups do not count.',
            '**Revealed lines**: if moving a cup uncovers something that completes the opponent’s line, **the opponent wins** — even if the same move completes a line of yours.',
            '**Time and draws**: a turn is 10 seconds (the timer can be switched off against the AI). If time runs out, or you have no legal move, the turn passes; if neither side can move, it is a draw. The game is also drawn after 80 moves.',
          ] },
          { type: 'table', caption: 'What can cover what', head: ['Cup on top', 'with a small', 'with a medium', 'with a large'], rows: [
            ['empty square', 'yes', 'yes', 'yes'],
            ['small (either side)', 'no', 'yes', 'yes'],
            ['medium', 'no', 'no', 'yes'],
            ['large', 'no', 'no', 'no'],
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rules — what happens if…',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'REVEALED LINE', title: 'The check happens after the cup lands', body: 'Your large cup on B3 covers a blue small and blocks blue’s top row. Move it to another square such as A2, B2 or C2 and the blue cup on B3 reappears, completing A3–B3–C3: you lose on the spot. But moving it **onto the blue medium on A3 or C3** is different. Lines are checked once the cup has been lifted and set down, so the covered square is now red and the row is still broken. When you move a blocking cup, only moves that cover another square of the same line are safe.', figure: fig(REVEAL, 'A large cup that reveals a line when lifted') },
            { tag: 'BOTH AT ONCE', title: 'Two lines at once — the opponent wins', body: 'Your C3 and C2 almost make a column, your large cup on B3 covers a blue small, and B2 and B1 are blue. Moving the large cup B3 → C1 completes column C but reveals blue’s column B at the same time — and the opponent’s line is checked first, so blue wins. The right move is to **place** a cup from your hand on C1. Placing never uncovers anything.', figure: fig(PRIORITY, 'Two lines completed at once') },
          ] },
          { type: 'cards', items: [
            { title: 'Does a covered cup disappear?', body: 'No. It is out of sight but still on that square. When the cup above leaves, it shows again and counts for lines from that moment. A square can hold up to three cups (small, medium, large).' },
            { title: 'Can I move my cup that was just covered?', body: 'No. Only your cups showing on top can move. A cup of yours under an enemy large cup is stuck until that cup leaves.' },
            { title: 'Can I “move” a cup back to the same square?', body: 'No. A move must go to a different square, and there is no voluntary pass.' },
            { title: 'What if I have no legal move?', body: 'If your hand is empty and none of your cups can go anywhere, your turn passes automatically. If neither side can move, the game is drawn.' },
            { title: 'Do I lose when my 10 seconds run out?', body: 'No — only that turn passes. In friend rooms, though, six timeouts in a row (from either side) stop the game.' },
            { title: 'Why does it end at 80 moves?', body: 'Because moving lets players shuttle through the same shapes forever. After 80 moves (both sides, passed turns included) the game is drawn.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — three checks in ten seconds',
        blocks: [
          { type: 'p', text: 'Ten seconds is shorter than it sounds. At first, just run these checks in order every turn and you will lose far fewer games.' },
          { type: 'list', ordered: true, items: [
            '**Can I win now?** A line with two of your cups and an empty square — or an enemy cup you can cover — comes first.',
            '**Does the opponent win next move?** Block the open square of their two-in-a-row, or cover one of its cups with a bigger cup.',
            '**What is under the cup I want to move?** Last of all, make sure lifting it does not complete their line.',
          ] },
          { type: 'list', items: [
            '**A large cup on the centre (B2)**: the centre is the only square on four lines (row, column, both diagonals). A large cup there cannot be covered, so it holds one place on all four lines for good.',
            '**Block with a size they cannot cover**: if the opponent still has a large cup in hand, your medium can be covered. Look at their hand and block with a size they can no longer beat.',
            '**Small cups late**: a small cup can be covered by any medium or large. Played later, against an opponent who has run out of covering cups, it lasts.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Play along — a first-player win by fork',
        lead: 'Red (you) moves first. Follow why each move is played and what the opponent could have tried instead.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Moves 1–3: large in the centre, then a diagonal threat', body: '1. Red large B2. 2. Blue large A3 (a corner). 3. Red medium C3. Red now has two on the C3–B2–A1 diagonal, so with A1 empty red wins next move (dashed square).', figure: fig(W3, 'After move 3') },
            { title: 'Move 4: blue blocks with a large', body: 'If blue blocked A1 with a medium, red’s remaining large would cover it and win. So blue must either block with a large or cover red’s medium on C3; here it spends its last large on A1. That leaves A2 empty between blue’s A3 and A1 — now blue threatens column A.', figure: fig(W4, 'After move 4') },
            { title: 'Move 5: block with a medium, threaten again', body: 'Red has to block A2. Blue has no large left in hand, so a medium cannot be covered. Red medium A2 — and now A2–B2–C2 has two red cups, a new threat at C2. **A block that is also a threat** is the basic rhythm of this game.', figure: fig(W5, 'After move 5') },
            { title: 'Move 6: which large does blue move?', body: 'Blue must stop C2, but a medium placed there would be covered by red’s large. So blue moves a large already on the board. A1 → C2 empties A1 and opens red’s C3–B2–A1 diagonal, so that fails. Of the moves that block C2 directly, only A3 → C2 holds; nothing was under A3, so nothing is revealed.', figure: fig(W6, 'After move 6') },
            { title: 'Move 7: the fork', body: 'Red plays its last large on A3. That threatens the top row (B3) and the A3–B2–C1 diagonal (C1) at once, and A3 cannot be covered. Whichever blue blocks, red fills the other on move 9. If blue moves its C2 large onto C3 to break the row, C2 empties and A2–B2–C2 opens.', figure: fig(W7, 'After move 7, the fork') },
          ] },
          { type: 'callout', tone: 'note', title: 'If blue had moved A3 onto A2 on move 6', text: 'Blue’s large A3 → A2 covers red’s medium, breaks the row and even threatens A3 with A2 and A1. It looks strong — but red blocks with a large on A3 and again forks B3 (row) and C1 (diagonal). Blue’s real problem in this game was spending both large cups by move 4, leaving nothing to cover red’s mediums.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — the cups in hand are your power',
        blocks: [
          { type: 'p', text: 'Reading only the board is half the job. How many large cups each side still holds decides which blocks hold.' },
          { type: 'table', caption: 'Does your block hold, given the opponent’s hand?', head: ['Your blocking cup', 'They hold a large', 'They hold mediums only', 'They hold smalls only'], rows: [
            ['small', 'covered', 'covered', 'holds'],
            ['medium', 'covered', 'holds', 'holds'],
            ['large', 'holds', 'holds', 'holds'],
          ] },
          { type: 'list', items: [
            '**Keep one large to the end**: a large cup attacks (a threat that cannot be covered) and defends (a block that covers anything). Spend both and you can no longer answer a medium threat by covering it — exactly how blue lost the walkthrough game.',
            '**Covering blocks and gains a square**: blocking an empty square spends a square; covering an enemy cup breaks their line and takes the square. If that square lies on another line of yours, it is a counter-attack at once.',
            '**Shackles**: a cup that blocks a line can be one its owner cannot afford to move. If your own cup is plugging a line, treat it as a piece you cannot move freely.',
            '**Build forks**: one move that puts two cups on two lines leaves the opponent able to block only one. Holding the centre plus a corner creates these most easily (a corner lies on three lines, an edge on two).',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — reading moves and the endgame',
        blocks: [
          { type: 'h3', text: 'Once the hands are empty, it is all moves' },
          { type: 'p', text: 'When both sides have placed all six cups, only moves remain. Every move now empties one square and covers another, so you must see what the empty square reveals and which lines the covered square joins — both at once. Lifting your cup off an enemy cup hands that square back to them.' },
          { type: 'list', items: [
            '**Your cup over your cup is free**: lifting it still reveals your colour, so that square’s lines do not change. It is the cup you can move without fear.',
            '**Your cup over theirs is a hostage**: the moment you lift it, the square is theirs. Keep it as the last cup you move.',
            '**Remember what is covered**: the screen shows only the top. Keep a mental map of who covers whom and you know which cups the opponent cannot move and where lines can come back to life.',
          ] },
          { type: 'h3', text: 'The 80-move draw and repetition' },
          { type: 'p', text: 'With only moves left you can shuttle through the same shapes and run down the clock. The side that is better must avoid repeating and create new threats; the side that is worse can aim for the 80-move draw by blocking accurately. The Very Hard AI also scores a return to an earlier position as a draw and looks for another route when it can win.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Pulling the plug**: moving the cup that covers an enemy cup to use it in an attack, and reopening their line. The most common way to throw a won game.',
            '**Winning by a move when a placement wins too**: if both win on the same square, place. A move can uncover a line that is checked first.',
            '**Spending both large cups early**: afterwards you cannot answer a medium threat by covering it.',
            '**Ignoring the opponent’s hand**: whether your medium block holds depends on how many large cups they still have.',
            '**Panic moves**: when 10 seconds run out the turn passes; you do not lose. Still, a passed turn is a free move for the opponent, so drill the three checks until they are automatic.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI levels, Very Hard and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games', 'Choose who moves first (you, the AI or random) and switch the 10-second timer on or off. You can resign at any time.'],
            ['Easy', 'Usually plays a winning move when there is one but sometimes misses it; otherwise close to random.'],
            ['Normal', 'About four turns in ten it plays any move that does not lose at once; otherwise it reads two moves ahead.'],
            ['Hard', 'Reads three moves ahead with little randomness. It does not fall for simple revealed-line traps.'],
            ['Very Hard', 'Thinks 1.5 seconds a move (1 second on touch screens), reading close to the end of the game. Once it sees a forced win it plays it out exactly, and it counts going back to an earlier position as a draw. You can also start it from the AI Hell Mode page.'],
            ['Friend rooms', 'Create a room and share the link or code to play live. The first player is random, turns are 10 seconds and a timeout passes the turn. You can also open the room to strangers in Open match.'],
            ['Winning tips and replay', 'After a loss the AI re-reads your moves backwards to find the move that lost by force and shows what you could have played instead.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Cover', def: 'Placing or moving a cup over a strictly smaller one, hiding it. Equal sizes cannot cover.' },
            { term: 'Move', def: 'Taking one of your cups showing on top and putting it on another square.' },
            { term: 'Revealed line', def: 'A line completed when lifting a cup uncovers the one beneath. If it is the opponent’s, they win.' },
            { term: 'Plug', def: 'Your cup that covers or blocks an enemy line, and so must not be moved carelessly.' },
            { term: 'Fork', def: 'One move that creates two winning squares; the opponent can block only one.' },
            { term: 'Hand', def: 'Your cups not yet placed. The number of large cups in each hand decides which blocks hold.' },
            { term: 'Passed turn', def: 'The turn moving to the opponent because time ran out or there was no legal move.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where does Russian Janggi come from?', a: 'It appeared in tvN’s The Society Game 2. Its rules are in the same family as the board game Gobblet Gobblers.' },
      { q: 'What happens if moving a cup reveals the opponent’s line?', a: 'The opponent wins — even if the same move completes your line, because theirs is checked first. If the moved cup covers another square of that line, the line stays broken and you are safe.' },
      { q: 'Can a cup cover one of the same size?', a: 'No, only a strictly bigger cup can cover. So a large cup holds its square until its owner moves it.' },
      { q: 'Do I lose if I run out of time?', a: 'No, only that turn passes. Against the AI you can also switch the timer off.' },
      { q: 'Can the game be drawn?', a: 'Yes — after 80 moves, or when neither player has a legal move.' },
      { q: 'Is moving first an advantage?', a: 'A little: the first player can take the centre with a large cup. Against the AI you can choose who starts — you, the AI or random.' },
    ],
    cta: { title: 'Ready for a game?', body: 'Play the walkthrough line yourself. Saving one large cup alone changes how often you win.', button: 'Play Russian Janggi' },
    disclaimer: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Society Game, tvN or the makers of Gobblet Gobblers. Names are used only to describe the game.',
  },
};

export default guide;
