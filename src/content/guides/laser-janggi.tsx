// 레이저 장기 guide. Rules and numbers follow src/lib/laserJanggi.ts (initialLaserPieces, legalActions: one step in 8
// directions or a 90° turn, the laser only turns and never off the board; triangleReflection, splitterReflection,
// the square's single mirror face; traceLaser hits both sides' pieces; applyLaserAction: only the mover's laser
// fires, hitting your own king loses; chooseLaserAiAction levels), src/lib/laserJanggiRoom.ts (60/30/90-second turns,
// a timed-out turn is played by the easy AI, the third timeout in a row loses, LASER_MAX_TURNS 200 → draw, random
// first player) and LaserJanggiGame.tsx (vs AI you are blue/cyan and move first, no clock), plus the LaserJanggiGuide
// and LaserJanggi messages in ko.json.
// Every beam in the diagrams is computed with the game's own traceLaser from positions reached by legal moves.
// Squares: files A–H left to right, ranks 1–8 from the bottom (your side). Row index 0 = rank 8.
import LaserPiece from '@/components/laserJanggi/LaserPiece';
import { LASER_BOARD_SIZE, type LaserAction, type LaserOwner, type LaserPiece as Piece, applyLaserAction, initialLaserPieces, traceLaser } from '@/lib/laserJanggi';
import type { GameGuide } from './types';

const N = LASER_BOARD_SIZE;
const sq = (name: string) => ({ row: N - Number(name.slice(1)), col: name.charCodeAt(0) - 65 });
const idAt = (pieces: Piece[], name: string) => { const { row, col } = sq(name); return pieces.find((p) => p.row === row && p.col === col)!.id; };
const rotate = (pieces: Piece[], name: string, delta: -1 | 1): LaserAction => ({ type: 'rotate', pieceId: idAt(pieces, name), delta });
const play = (pieces: Piece[], owner: LaserOwner, action: (p: Piece[]) => LaserAction) => applyLaserAction(pieces, owner, action(pieces))!;

const START = initialLaserPieces();
// 1. Blue turns E1 clockwise: the beam goes up the E file and hits red's E4 triangle on a short side.
const M1 = play(START, 0, (p) => rotate(p, 'E1', 1));
// 2. Red answers in kind: D8 turned, the beam comes down the D file and destroys blue's D5 triangle.
const M2 = play(M1.pieces, 1, (p) => rotate(p, 'D8', 1));
// Alternative first move: E1 steps to E2 (row 6). Blue's beam now runs H1 → H3 → A3 (splitter) and destroys blue's own A2.
const ALT = START.map((p) => (p.id === 'b-triangle-4' ? { ...p, row: 6 } : p));

type Fig = { pieces: Piece[]; owner: LaserOwner; danger?: string[]; label: string };
function LaserFigure({ pieces, owner, danger = [], label }: Fig) {
  const shot = traceLaser(pieces, owner);
  const at = (v: number) => ((v + 0.5) / N) * 100;
  const color = owner === 0 ? '#59e6ff' : '#ff4d6d';
  const hit = new Set(shot.captured);
  return (
    <div role="img" aria-label={label} className="relative mx-auto aspect-square w-full max-w-[300px] rounded-lg border border-white/15 bg-[#060a10]">
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {Array.from({ length: N * N }, (_, i) => {
          const row = Math.floor(i / N), col = i % N;
          const name = `${String.fromCharCode(65 + col)}${N - row}`;
          const p = pieces.find((x) => x.row === row && x.col === col);
          return (
            <div key={name} className={`relative border border-white/[0.06] ${danger.includes(name) ? 'bg-[#ff4d6d]/25' : (row + col) % 2 ? 'bg-white/[0.02]' : ''}`}>
              {col === 0 && <span className="absolute left-0.5 top-0 font-mono text-[6px] text-white/30">{N - row}</span>}
              {row === N - 1 && <span className="absolute bottom-0 right-0.5 font-mono text-[6px] text-white/30">{String.fromCharCode(65 + col)}</span>}
              {p && <div className={`absolute inset-[8%] ${hit.has(p.id) ? 'opacity-40' : ''}`}><LaserPiece piece={p} /></div>}
            </div>
          );
        })}
      </div>
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
        {shot.segments.map((s, i) => <line key={i} x1={at(s.from.col)} y1={at(s.from.row)} x2={at(s.to.col)} y2={at(s.to.row)} stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />)}
        {shot.segments.filter((s) => s.outcome === 'capture' || s.outcome === 'king').map((s, i) => <circle key={`x${i}`} cx={at(s.to.col)} cy={at(s.to.row)} r="4.5" fill="none" stroke="#ffd166" strokeWidth="1.2" />)}
      </svg>
    </div>
  );
}
const fig = (f: Fig) => <LaserFigure {...f} />;

const guide: GameGuide = {
  game: 'laserJanggi',
  origin: { kind: 'show', show: 'genius2' },
  updated: '2026-11-26',
  related: ['janggi', 'cardJanggi', 'russianJanggi', 'wallgo'],
  ko: {
    meta: {
      title: '레이저 장기 공략 — 세모·네모기사 반사 규칙, 스플리터, 자기 피격까지 | PUZZLTHINK',
      description: '더 지니어스 데스매치 레이저 장기 공략. 세모기사·네모기사·스플리터가 빛을 꺾는 방식, 내 레이저가 내 말을 맞히는 경우, 첫 수 따라 두기, 광선 그림자에 왕 숨기기, AI 난이도와 친구 방 시간 규칙까지 정리했어요.',
      keywords: ['레이저 장기 공략', '레이저장기 규칙', '레이저 장기 전략', '더 지니어스 레이저 장기', '레이저 체스 규칙', '레이저 장기 스플리터', '룰 브레이커 데스매치'],
    },
    title: '레이저 장기 공략',
    lead: '말을 움직이는 게 아니라, 빛이 지나갈 길을 다시 놓는 게임이에요.',
    intro: [
      '레이저 장기는 8×8 판에서 내 말 하나를 한 칸 움직이거나 90도 돌린 뒤, **내 레이저가 자동으로 발사되는** 게임이에요. 빛은 거울 면을 만나면 꺾이고, 거울이 아닌 면에 맞은 말은 사라지며, 왕이 맞으면 그 자리에서 승부가 나요. 상대 왕까지 빛의 길을 이어 붙이는 사람이 이겨요.',
      '이 공략은 말마다 빛이 어떻게 꺾이는지부터 정확히 정리하고, 실제 첫 두 수를 따라 두며 광선이 어디로 가는지 보여 줘요. 그다음 단계별 전략과 자주 하는 실수, AI와 친구 방 규칙을 다뤄요. 칸 이름은 가로 A~H(왼쪽부터), 세로 1~8(내 쪽 아래부터)이에요. 그림의 청록 말이 나, 빨강 말이 상대이고, 노란 원은 그 수에 빛에 맞아 사라지는 말이에요. 그림의 광선은 모두 게임과 같은 계산으로 그렸어요.',
    ],
    gamePageTitle: '레이저 장기 완전 가이드',
    summary: '말마다 빛이 꺾이는 방식, 첫 수 따라 두기, 광선 그림자와 자기 피격 피하기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '레이저 장기는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '레이저 장기는 「더 지니어스: 룰 브레이커」의 데스매치로 나온 게임이에요. 레이저와 거울로 상대 왕을 맞히는 이런 방식의 보드게임은 흔히 "레이저 체스"라고 불려요. PUZZLTHINK는 방송 화면의 판을 읽어 시작 배치를 옮겼어요.' },
          { type: 'p', text: '각자 레이저 1, 왕 1, 스플리터 1, 네모기사 1, 세모기사 6, 모두 10개의 말로 시작해요. 내 말은 왼쪽 A열에 늘어서고 레이저는 A1 구석에서 오른쪽을 향해요. 상대는 같은 배치를 180도 돌린 모양이라, 상대 레이저는 H8에서 왼쪽을 향해요. 가운데 D4·D5(나)와 E4·E5(상대)의 세모기사 네 개는 거울이 모두 가운데를 보는 "나비넥타이" 모양이에요.' },
          { type: 'figure', node: fig({ pieces: START, owner: 0, label: '레이저 장기 시작 배치와 내 첫 광선' }), caption: '시작 배치. 내 레이저(A1)의 빛은 E1 세모기사의 거울에 꺾여 판 밖으로 나가요. 처음에는 양쪽 모두 아무것도 맞히지 않아요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**한 차례**: 내 말 하나를 골라 ① 빈 이웃 칸(대각선 포함 8방향)으로 한 칸 움직이거나 ② 제자리에서 왼쪽·오른쪽으로 90도 돌려요. 말을 잡으러 다른 말 칸으로 들어갈 수는 없어요.',
            '**발사**: 행동이 끝나면 **내 레이저만** 자동으로 발사돼요. 상대 레이저는 상대 차례에만 쏴요.',
            '**레이저**: 움직일 수 없고 돌리기만 해요. 판 밖을 향하는 방향으로는 돌릴 수 없어서, A1 구석의 내 레이저는 오른쪽이나 위쪽만 볼 수 있어요. 레이저는 빛에 맞아도 사라지지 않고 빛을 막아요.',
            '**피격**: 빛은 편을 가리지 않아요. 거울이 아닌 면에 맞은 기사는 **내 것이든 상대 것이든** 사라져요.',
            '**승리**: 빛이 왕에 닿으면 끝나요. 상대 왕이면 내가 이기고, **내 왕이면 내가 져요.** 한 번의 발사로 두 왕이 다 맞으면 쏜 사람이 져요.',
            '**무승부**: 양쪽 합쳐 200수가 지나도 끝나지 않으면 무승부예요.',
          ] },
          { type: 'h3', text: '말마다 빛을 다루는 방식' },
          { type: 'table', head: ['말', '거울', '맞으면'], rows: [
            ['세모기사 (6개)', '빗변 하나. 빗변이 바라보는 두 방향', '빗변으로 들어온 빛은 90도 꺾여요. 직각을 이루는 짧은 두 면에 맞으면 사라져요.'],
            ['네모기사 (1개)', '빛나는 막대가 있는 한 면', '그 면에 정면으로 들어온 빛은 온 길로 그대로 되돌아가요. 나머지 세 면에 맞으면 사라져요.'],
            ['스플리터 (1개)', '대각선 거울', '빛을 그대로 통과시키면서, 거울 방향으로 꺾인 빛을 하나 더 만들어요. 절대 사라지지 않아요.'],
            ['왕 (1개)', '없음', '어느 면이든 맞으면 그 자리에서 승부가 나요.'],
            ['레이저 (1개)', '없음', '빛을 막을 뿐 사라지지 않아요.'],
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: '스플리터 · 자기 피격', title: '거울 하나를 비켰더니 내 말이 사라졌어요', body: '첫 수로 E1 세모기사를 E2로 한 칸 올려 보면, 빛은 E1을 지나 H1(내 세모기사)에서 위로, H3(상대 세모기사)에서 왼쪽으로 꺾여 3줄을 가로질러 A3의 내 스플리터에 닿아요. 스플리터는 빛을 그대로 판 밖으로 통과시키면서 아래로 하나를 더 꺾는데, 그 빛이 **A2의 내 세모기사**의 짧은 면을 때려 내 말이 사라져요. 내 레이저는 내 진영 바로 옆을 지나간다는 걸 잊으면 이런 일이 생겨요.', figure: fig({ pieces: ALT, owner: 0, label: 'E1을 E2로 옮겼을 때의 광선' }) },
          ] },
          { type: 'cards', items: [
            { title: '상대 말이 있는 칸으로 가서 잡을 수 있나요?', body: '아니요. 이동은 빈칸으로만 해요. 말을 없애는 방법은 빛뿐이에요.' },
            { title: '움직인 뒤 발사인가요, 발사 뒤 움직임인가요?', body: '움직이거나 돌린 **뒤에** 발사해요. 그래서 이번 수로 빛의 길을 바꾸고, 바뀐 길로 바로 쏘는 거예요.' },
            { title: '빛이 같은 곳을 맴돌면?', body: '빛이 거울에서 꺾여 이미 한 번 출발했던 자리에서 같은 방향으로 다시 출발하게 되면 거기서 멈춰요. 끝없이 맴도는 일은 없어요.' },
            { title: '스플리터에 뒤에서 맞아도 되나요?', body: '네. 스플리터는 어느 방향에서 맞아도 통과 + 꺾임 두 갈래를 만들고, 사라지지 않아요. 상대 빛도 내 스플리터를 이용할 수 있어요.' },
            { title: '네모기사가 되돌린 빛은 어디로 가요?', body: '온 길을 거꾸로 따라가요. 그 길에 있던 거울은 반대 방향으로 다시 꺾어 주니, 결국 내 레이저로 돌아와 막히는 경우가 많아요.' },
            { title: '레이저를 돌리는 것도 한 수인가요?', body: '네. 레이저를 돌리면 그 수의 행동은 끝나고, 새 방향으로 바로 발사돼요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 쏘기 전에 끝까지 따라가기',
        blocks: [
          { type: 'p', text: '레이저 장기의 패배는 대부분 "빛이 거기까지 갈 줄 몰랐다"에서 나와요. 입문 단계에서는 매 수 이 세 가지만 확인하세요.' },
          { type: 'list', ordered: true, items: [
            '**내 빛을 끝까지**: 이번 수를 둔 뒤 내 레이저에서 시작해 거울을 하나씩 따라가며, 빛이 판 밖으로 나가거나 막힐 때까지 그려 보세요. 스플리터가 있으면 두 갈래 모두요.',
            '**내 말이 맞지 않나**: 그 길 위에 내 기사의 짧은 면이나, 무엇보다 내 왕이 없는지 확인해요.',
            '**상대의 다음 빛**: 상대가 말 하나를 돌리거나 움직였을 때 상대 빛이 내 왕에 닿을 수 있는지 봐요. 지금 상대 빛의 길에서 한 번 꺾으면 내 왕에 닿는 거울이 있다면 위험해요.',
          ] },
          { type: 'list', items: [
            '**왕은 그림자에**: 내 왕 앞뒤좌우를 내 기사(특히 거울이 바깥을 향한 기사)로 가려 두면, 빛이 왕에 직접 닿는 길이 줄어요.',
            '**짧은 면을 상대 빛 쪽으로 두지 않기**: 상대 빛의 길 위에 있는 내 세모기사는 빗변이 그 빛을 받도록 돌려 두세요. 짧은 면이 향하면 그냥 사라져요.',
            '**거울 하나를 바꾸는 게 공격**: 한 수로 할 수 있는 건 작아도, 거울 하나의 방향을 바꾸면 빛의 길 전체가 바뀌어요. 내 거울 중 "돌리면 빛이 상대 쪽으로 가는" 것을 찾아보세요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 두기 — 첫 두 수와 그 뒤의 함정',
        lead: '내가 선공이에요(AI 대국에서는 항상 내가 먼저 둬요). 첫 수로 바로 상대 말을 잡을 수 있는 길이 있어요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1수: E1 세모기사를 시계 방향으로', body: '시작할 때 E1의 거울은 빛을 아래(판 밖)로 보내요. 이 세모기사를 오른쪽으로 90도 돌리면 거울이 왼쪽·위를 보게 되어, 빛이 E열을 따라 위로 올라가요. E2·E3을 지나 **E4의 상대 세모기사 짧은 면**에 맞아 상대 말이 사라져요.', figure: fig({ pieces: M1.pieces.concat(START.filter((p) => M1.shot.captured.includes(p.id))), owner: 0, label: '1수 E1 돌리기' }) },
            { title: '2수: 상대도 똑같이 갚아요', body: '배치가 180도 대칭이라 상대는 D8 세모기사를 돌려 빛을 D열 아래로 보내요. 이번엔 **D5의 내 세모기사**가 짧은 면을 맞아 사라져요. 서로 기사 하나씩 주고받았어요.', figure: fig({ pieces: M2.pieces.concat(M1.pieces.filter((p) => M2.shot.captured.includes(p.id))), owner: 1, label: '2수 D8 돌리기' }) },
            { title: '3수 전에: 지금 내 빛은 어디로 가나', body: '지금 아무것도 하지 않은 채 쏜다고 생각하고 빛을 따라가 봐요. E1에서 위로, E5(상대 세모기사)에서 왼쪽으로 꺾여 5줄을 가로질러 A5의 내 네모기사 거울에 맞고 되돌아가요. 다시 E5·E1을 거쳐 내 레이저에 막혀요. 즉 **B5·C5·D5는 내 빛이 지나가는 칸**이에요(빨간 칸). 여기서 왕을 A4→B5로 올리면 내 빛에 내 왕이 맞아 그대로 져요. A5 네모기사를 돌려도 거울이 아닌 면이 빛을 받아 내 말이 사라지고요.', figure: fig({ pieces: M2.pieces, owner: 0, danger: ['B5', 'C5', 'D5'], label: '3수 전 내 광선이 지나는 칸' }) },
          ] },
          { type: 'callout', tone: 'note', title: '이 장면에서 상대 말을 잡는 수는 없어요', text: '2수 뒤 국면에서 내 수 중 무언가를 맞히는 수는 모두 내 말을 맞혀요(E1을 비키면 A2, D4를 E4나 E3으로 옮기면 그 말, 왕을 B5로 올리면 왕). 그래서 3수는 잡기보다 다음 공격 길을 준비하거나 내 왕 주변을 가리는 수가 좋아요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 거울 사슬 설계하기',
        blocks: [
          { type: 'p', text: '중급부터는 "이번 수의 빛"보다 "**다음 내 차례의 빛**"을 설계해요. 한 수에 바꿀 수 있는 건 말 하나지만, 빛의 길은 여러 거울이 이어진 사슬이라 마지막 고리 하나만 바꿔도 결과가 완전히 달라져요.' },
          { type: 'list', items: [
            '**두 수짜리 위협**: 이번 수에 거울 하나를 제자리에 두고, 다음 수에 다른 하나를 돌리면 왕에 닿는 길을 만들어 두세요. 상대는 그 사이에 한 수로 막아야 하는데, 막을 곳이 두 군데면 하나는 뚫려요.',
            '**스플리터는 교차로**: 스플리터는 빛을 두 갈래로 나눠 한 번에 두 방향을 위협해요. 가운데 쪽으로 옮기면 두 갈래가 닿는 범위가 넓어져요. 상대 빛도 내 스플리터를 지나간다는 점은 늘 같이 계산하세요.',
            '**네모기사는 방패이자 되돌리개**: 거울 면을 상대 빛 쪽으로 향하게 두면 그 방향의 공격을 통째로 돌려보내요. 단 나머지 세 면은 약하니, 상대 빛이 옆에서 들어올 수 있는 자리에는 두지 마세요.',
            '**세모기사의 두 얼굴**: 같은 세모기사가 돌린 방향에 따라 내 빛을 꺾는 거울도 되고, 상대 빛을 막는 벽(짧은 면은 사라지지만 그 뒤를 가려 줘요)도 돼요. 왕 앞의 세모기사는 "맞아서 사라지더라도 그 수에는 왕을 지켜 주는" 마지막 방패예요.',
          ] },
          { type: 'callout', tone: 'tip', title: '말 가치를 대략 알아 두기', text: '이 게임의 AI는 스플리터를 7, 네모기사를 5, 세모기사를 3 정도로 보고 형세를 판단해요. 스플리터와 레이저는 사라지지 않으니, 실제로 잃을 수 있는 건 기사들이에요. 세모기사 하나를 내주고 상대 네모기사를 없애는 교환은 대개 이득이에요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 상대 빛까지 내 설계에 넣기',
        blocks: [
          { type: 'list', items: [
            '**상대 차례의 빛을 미리 그리기**: 상대는 자기 차례에 말 하나를 바꾸고 쏴요. 상대 빛의 지금 길에서 "한 번 바뀌면 닿는 칸"을 모두 표시해 두면, 내 왕이 서면 안 되는 칸이 보여요.',
            '**미끼 기사**: 내 기사 하나를 상대 빛이 맞히기 좋은 자리에 두면 상대는 그 기사를 잡으러 거울을 돌려요. 그 돌림이 상대 왕 쪽의 방패를 비우는 수라면, 다음 내 빛이 그 틈으로 들어가요.',
            '**레이저 돌리기는 최후의 카드**: 레이저 방향을 바꾸면 빛의 출발점 자체가 바뀌어 상대가 준비한 방어가 한꺼번에 무너질 수 있어요. 구석 레이저는 두 방향뿐이라 상대도 읽기 쉬우니, 길이 거의 완성됐을 때 쓰세요.',
            '**200수 무승부**: 서로 방어만 하면 판이 굳어요. 기사 수에서 앞서 있다면 무리하지 않고 왕을 그림자에 둔 채 200수 무승부를 받아들이는 것도 선택지지만, 기사가 많을수록 거울 사슬을 만들기 쉬우니 앞선 쪽이 공격하는 게 보통 이득이에요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**내 빛에 내 왕 맞히기**: 가장 흔하고 가장 아픈 패배예요. 특히 왕을 옮긴 수에서 자주 나와요. 왕을 움직일 땐 그 칸이 지금 내 빛의 길 위인지 먼저 보세요.',
            '**스플리터의 두 번째 갈래 잊기**: 통과하는 빛만 보고 꺾여 나가는 빛을 놓쳐 내 말을 잃어요.',
            '**네모기사를 돌리다 사라지기**: 네모기사의 거울은 한 면뿐이라, 빛이 지나가는 자리에서 돌리면 거울이 아닌 면이 빛을 받아요.',
            '**거울 하나를 비켜 길 열어 주기**: 내 기사를 옮겼더니 그 뒤에 가려져 있던 길이 열려 상대 빛이 왕까지 닿는 경우예요.',
            '**빛을 반만 따라가기**: 되돌아온 빛, 다른 거울에서 다시 꺾인 빛까지 끝까지 따라가야 해요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI 난이도와 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국', '나는 청록 진영이고 항상 먼저 둬요. 시간 제한은 없어요. 난이도는 첫 수 전에만 바꿀 수 있어요.'],
            ['쉬움', '왕을 바로 맞힐 수 있으면 놓치지 않지만, 그 밖에는 괜찮은 수 열두 개 중 아무거나 골라 실수가 많아요.'],
            ['보통', '바로 이기는 수를 먼저 보고, 그 밖에는 형세 점수가 높은 네 수 가운데 대부분 가장 좋은 수를 둬요.'],
            ['어려움', '좋은 후보 24수마다 내 강한 응수 24수까지 읽고, 가장 덜 손해 보는 수를 골라요. 자기 왕을 맞히는 수는 절대 두지 않아요.'],
            ['친구 방', '링크나 4자리 코드로 방을 만들어요. 한 수 시간은 60·30·90초 중에서 방장이 정하고, 선공은 무작위예요. 시간이 지나면 쉬움 AI가 대신 한 수를 두고, 세 번 연속 시간이 지나면 패배예요. 오픈 대전에 방을 열 수도 있어요.'],
            ['복기', '끝난 판은 한 수씩 광선과 함께 다시 볼 수 있어요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '빗변', def: '세모기사의 긴 면. 이 면이 거울이라 두 방향에서 온 빛을 90도 꺾어요.' },
            { term: '짧은 면', def: '세모기사의 직각을 이루는 두 면. 여기에 빛이 맞으면 세모기사가 사라져요.' },
            { term: '거울 면', def: '네모기사의 빛나는 막대가 있는 면. 정면으로 들어온 빛을 되돌려 보내요.' },
            { term: '스플리터', def: '빛을 통과시키면서 하나 더 꺾어 두 갈래로 나누는 말. 사라지지 않아요.' },
            { term: '자기 피격', def: '내 레이저의 빛이 내 말이나 내 왕을 맞히는 것. 내 왕이면 즉시 패배예요.' },
            { term: '그림자', def: '상대 빛이 닿지 않도록 다른 말 뒤에 가려진 칸.' },
            { term: '거울 사슬', def: '레이저에서 목표까지 빛을 이어 주는 거울들의 순서.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '레이저는 움직일 수 있나요?', a: '아니요. 제자리에서 90도 돌리기만 할 수 있고, 판 밖을 향하는 방향으로는 돌릴 수 없어요.' },
      { q: '내 레이저로 내 말을 맞힐 수도 있나요?', a: '네. 빛은 편을 가리지 않아요. 내 기사도 사라질 수 있고, 내 왕을 맞히면 내가 져요.' },
      { q: '스플리터는 빛을 막나요?', a: '아니요. 원래 방향으로 통과시키면서 거울 방향으로 두 번째 빛을 만들어요. 스플리터 자체는 사라지지 않아요.' },
      { q: '상대 말을 직접 잡을 수 있나요?', a: '아니요. 이동은 빈칸으로만 할 수 있고, 말을 없애는 방법은 레이저뿐이에요.' },
      { q: '게임이 끝나지 않으면 어떻게 되나요?', a: '양쪽 합쳐 200수가 지나면 무승부예요.' },
      { q: '친구와 어떻게 하나요?', a: '친구와 하기에서 방을 만들고 초대 링크나 4자리 코드를 보내면 돼요. 한 수 시간은 60·30·90초 중에서 고를 수 있어요.' },
    ],
    cta: { title: '빛의 길을 그려 볼까요?', body: '첫 수로 E1을 돌려 보세요. 내 빛이 어디까지 가는지 따라가는 습관이 곧 실력이에요.', button: '레이저 장기 하러 가기' },
    disclaimer: '레이저 장기는 방송에 소개된 규칙을 바탕으로 PUZZLTHINK가 웹용으로 재구성한 비공식 팬 프로젝트이며, 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Laser Janggi strategy guide — mirrors, the splitter and self-hits | PUZZLTHINK',
      description: 'A guide to Laser Janggi from The Genius death match: how triangle and square knights and the splitter bend the beam, when your own laser hits your pieces, the first two moves played out, hiding your king in shadow, AI levels and friend-room clocks.',
      keywords: ['Laser Janggi strategy', 'Laser Janggi rules', 'laser chess rules', 'The Genius laser janggi', 'laser chess splitter', 'Rule Breaker death match'],
    },
    title: 'Laser Janggi strategy guide',
    lead: 'You are not moving pieces so much as re-laying the path of a beam.',
    intro: [
      'In Laser Janggi you move one of your pieces one square or turn it 90° on an 8×8 board — and then **your laser fires automatically.** A beam bends when it meets a mirror face, a piece hit anywhere else is destroyed, and a beam that reaches a king ends the game on the spot. Whoever links a path of light to the enemy king wins.',
      'This guide first pins down exactly how each piece handles the beam, then plays the first two moves of a real game to show where the light goes, followed by strategy by level, common mistakes and the AI and room rules. Squares are files A–H from the left and ranks 1–8 from your side at the bottom. Cyan pieces are you, red the opponent, and a yellow ring marks a piece destroyed by that shot. Every beam in the diagrams is computed exactly as the game computes it.',
    ],
    gamePageTitle: 'Laser Janggi — the complete guide',
    summary: 'How each piece bends the beam, the first two moves, beam shadows and avoiding self-hits.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Laser Janggi?',
        blocks: [
          { type: 'p', text: 'Laser Janggi appeared as a death match in The Genius: Rule Breaker. Board games where you hit the enemy king with a laser and mirrors are commonly called “laser chess”. PUZZLTHINK’s starting setup was read off the board shown on the broadcast.' },
          { type: 'p', text: 'Each side starts with ten pieces: a laser, a king, a splitter, a square knight and six triangle knights. Yours line the left-hand A file, with the laser in the A1 corner pointing right. The opponent has the same setup turned 180°, so their laser sits on H8 pointing left. The four triangles in the centre — D4 and D5 (yours), E4 and E5 (theirs) — form a “bow tie” with every mirror facing the middle.' },
          { type: 'figure', node: fig({ pieces: START, owner: 0, label: 'Starting position and your first beam' }), caption: 'The start. The beam from your laser (A1) is bent by the triangle on E1 and leaves the board. At first, neither side hits anything.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**A turn**: choose one of your pieces and either ① move it one square into an empty neighbouring square (8 directions) or ② turn it 90° left or right where it stands. You can never move onto another piece.',
            '**Firing**: after your action **only your laser** fires automatically. The opponent’s laser fires on their turn.',
            '**The laser**: it never moves, only turns, and it cannot turn to face off the board — your corner laser on A1 can point only right or up. A laser hit by a beam is not destroyed; it simply stops the beam.',
            '**Hits**: the beam does not care whose piece it hits. A knight hit on a non-mirror face is destroyed, **yours or theirs**.',
            '**Winning**: a beam reaching a king ends the game. Their king: you win. **Your own king: you lose.** If one shot hits both kings, the shooter loses.',
            '**Draw**: if nothing is decided after 200 moves (both sides together), the game is drawn.',
          ] },
          { type: 'h3', text: 'How each piece handles the beam' },
          { type: 'table', head: ['Piece', 'Mirror', 'When hit'], rows: [
            ['Triangle knight (6)', 'its long side, facing two directions', 'A beam entering through the long side turns 90°. Hit on either short side, it is destroyed.'],
            ['Square knight (1)', 'the one face with the bright bar', 'A beam hitting that face head-on goes straight back the way it came. Hit on any other face, it is destroyed.'],
            ['Splitter (1)', 'a diagonal mirror', 'Lets the beam straight through and also sends a second beam off the mirror. Never destroyed.'],
            ['King (1)', 'none', 'Hit on any face, the game is over.'],
            ['Laser (1)', 'none', 'Blocks the beam and is never destroyed.'],
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations — what happens if…',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { tag: 'SPLITTER · SELF-HIT', title: 'I moved one mirror and lost my own piece', body: 'Try stepping the E1 triangle up to E2 as your first move. The beam now passes E1, turns up at H1 (your triangle), turns left at H3 (theirs), crosses rank 3 and reaches your own splitter on A3. The splitter lets it through and off the board, and also bends one beam downwards — which strikes **your triangle on A2** on a short side and destroys it. Forget that your beam runs right past your own pieces and this is what happens.', figure: fig({ pieces: ALT, owner: 0, label: 'The beam after E1 moves to E2' }) },
          ] },
          { type: 'cards', items: [
            { title: 'Can I capture by moving onto an enemy piece?', body: 'No. Pieces move only into empty squares; the beam is the only way to remove a piece.' },
            { title: 'Move then fire, or fire then move?', body: 'You fire **after** moving or turning. Your action reshapes the path and the shot uses the new path at once.' },
            { title: 'What if the beam goes round in circles?', body: 'A beam that would set off again from a mirror it already left in the same direction stops there. It never loops forever.' },
            { title: 'Can a splitter be hit from behind?', body: 'Yes. From any direction it produces two beams — straight through and bent — and is never destroyed. The opponent’s beam can use your splitter too.' },
            { title: 'Where does a beam sent back by the square go?', body: 'Back along its own path. Mirrors on the way bend it the opposite way, so it often ends up back at your laser and stops.' },
            { title: 'Is turning the laser a move?', body: 'Yes. Turning it is your whole action, and it fires in the new direction straight away.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — follow the beam to the end before firing',
        blocks: [
          { type: 'p', text: 'Most Laser Janggi losses come from “I didn’t think the beam would get that far.” At the start, check just these three things every move.' },
          { type: 'list', ordered: true, items: [
            '**Your beam, all the way**: after your intended action, start at your laser and follow the light mirror by mirror until it leaves the board or stops — both branches, if it meets a splitter.',
            '**None of yours on the path**: make sure the path does not cross a short side of one of your knights — and above all not your king.',
            '**Their next beam**: if the opponent turns or moves one piece, can their beam reach your king? A mirror on their current path that would send light to your king with one turn is a danger.',
          ] },
          { type: 'list', items: [
            '**Keep the king in shadow**: knights around your king — especially with mirrors facing outwards — cut down the routes by which a beam can reach it.',
            '**Never show a short side to their beam**: a triangle of yours on the enemy beam’s path should take it on its long side. Facing a short side, it simply disappears.',
            '**Turning one mirror is an attack**: one action is small, but changing a single mirror reroutes the whole beam. Look for your mirrors that would send the light towards them if turned.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Play along — the first two moves and the trap after them',
        lead: 'You move first (against the AI you always do). There is a way to take an enemy piece on move one.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Move 1: turn the E1 triangle clockwise', body: 'At the start the mirror on E1 sends your beam down and off the board. Turn that triangle 90° clockwise and its mirror faces left and up, so the beam runs up the E file, past E2 and E3, and strikes **the short side of the enemy triangle on E4**, destroying it.', figure: fig({ pieces: M1.pieces.concat(START.filter((p) => M1.shot.captured.includes(p.id))), owner: 0, label: 'Move 1, turning E1' }) },
            { title: 'Move 2: they pay you back in kind', body: 'The setup is symmetric, so the opponent turns the D8 triangle and sends their beam down the D file. This time **your triangle on D5** is hit on a short side and destroyed. One knight each.', figure: fig({ pieces: M2.pieces.concat(M1.pieces.filter((p) => M2.shot.captured.includes(p.id))), owner: 1, label: 'Move 2, turning D8' }) },
            { title: 'Before move 3: where does your beam go now?', body: 'Imagine firing without changing anything and follow the light. Up from E1, left at E5 (their triangle), across rank 5 to the mirror of your square knight on A5, which sends it straight back — through E5 and E1 again until your laser stops it. So **B5, C5 and D5 are on your own beam** (red). Step your king from A4 to B5 and your own beam hits it: game over. Turn the A5 square and a non-mirror face takes the beam, destroying your own piece.', figure: fig({ pieces: M2.pieces, owner: 0, danger: ['B5', 'C5', 'D5'], label: 'Squares on your beam before move 3' }) },
          ] },
          { type: 'callout', tone: 'note', title: 'No move here takes an enemy piece', text: 'In the position after move 2, every move of yours that hits anything hits your own piece (move E1 aside and A2 goes, move D4 to E4 or E3 and that triangle goes, step the king to B5 and the king goes). So move 3 is about preparing the next attack or covering your king, not capturing.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — designing mirror chains',
        blocks: [
          { type: 'p', text: 'From the intermediate level you design **your next turn’s beam**, not just this one. You change only one piece per move, but the beam is a chain of mirrors: change the last link and the result changes completely.' },
          { type: 'list', items: [
            '**Two-move threats**: set one mirror now so that turning another next move opens a path to the king. The opponent has a single move to stop it; give them two places to block and one will give.',
            '**The splitter is a crossroads**: it splits the beam in two and threatens two directions at once. Brought towards the centre, the two branches cover more of the board. Always remember the enemy beam passes through your splitter too.',
            '**The square is shield and reflector**: with its mirror facing the enemy beam it sends that whole line of attack back. Its other three faces are weak, so keep it out of places where a beam can arrive from the side.',
            '**The two faces of a triangle**: depending on how it is turned, the same triangle is a mirror for your beam or a wall against theirs (hit on a short side it is destroyed, but it shields what lies behind it that turn). A triangle in front of your king is your last shield.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Rough piece values', text: 'The AI judges positions with the splitter at about 7, the square knight 5 and a triangle 3. The splitter and the laser can never be destroyed, so the pieces you can actually lose are the knights. Giving a triangle to remove their square knight is usually a good trade.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — make their beam part of your plan',
        blocks: [
          { type: 'list', items: [
            '**Draw their beam in advance**: on their turn they change one piece and fire. Mark every square their current beam would reach after one change and you know where your king must not stand.',
            '**Bait knights**: leave a knight where their beam can easily hit it and they will turn a mirror to take it. If that turn empties a shield in front of their king, your next beam goes through the gap.',
            '**Turning the laser is the last card**: changing your laser’s direction moves the beam’s starting point and can collapse a prepared defence in one go. A corner laser has only two directions, so it is easy to read; save it for when the path is nearly complete.',
            '**The 200-move draw**: if both sides only defend, the board freezes. A knight up, you could keep your king in shadow and accept the draw at move 200 — but more knights make mirror chains easier, so the side ahead usually does better by attacking.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Shooting your own king**: the most common and most painful loss, often on a king move. Before moving the king, check the destination is not on your own beam.',
            '**Forgetting the splitter’s second branch**: you trace the beam that passes straight through and miss the one bent away, losing a piece.',
            '**Turning the square in the beam**: it has only one mirror face, so turning it where the beam passes exposes a non-mirror face.',
            '**Opening a path by moving a mirror**: you move a knight and uncover the route it was blocking, letting their beam reach your king.',
            '**Following half the beam**: follow reflected beams and beams bent again by other mirrors all the way to the end.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI levels and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games', 'You play cyan and always move first. There is no clock. The level can be changed only before the first move.'],
            ['Easy', 'Never misses a direct king hit, but otherwise picks any of its twelve best-looking moves, so it errs often.'],
            ['Normal', 'Looks for an immediate win first; otherwise it usually plays the best of its top four moves by evaluation.'],
            ['Hard', 'For each of its 24 best candidates it reads your 24 strongest replies and plays the move that loses least. It never plays a move that hits its own king.'],
            ['Friend rooms', 'Create a room with a link or 4-digit code. The host sets 60, 30 or 90 seconds per move and the first player is random. On a timeout the easy AI plays a move for you, and three timeouts in a row lose. You can also open the room in Open match.'],
            ['Replay', 'Finished games can be stepped through move by move, beams included.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Long side', def: 'The triangle knight’s mirror; it turns beams from two directions by 90°.' },
            { term: 'Short sides', def: 'The two sides of a triangle knight that meet at the right angle. A beam there destroys it.' },
            { term: 'Mirror face', def: 'The square knight’s face with the bright bar; it sends a head-on beam straight back.' },
            { term: 'Splitter', def: 'Passes the beam and bends a second one off, splitting it in two. Never destroyed.' },
            { term: 'Self-hit', def: 'Your own beam hitting your own piece or king. Your king means instant defeat.' },
            { term: 'Shadow', def: 'A square hidden behind other pieces where the enemy beam cannot reach.' },
            { term: 'Mirror chain', def: 'The sequence of mirrors carrying the beam from a laser to its target.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Can the laser move?', a: 'No. It can only turn 90° where it stands, and never to face off the board.' },
      { q: 'Can my laser hit my own pieces?', a: 'Yes. The beam does not take sides: your knights can be destroyed, and hitting your own king loses the game.' },
      { q: 'Does the splitter block the beam?', a: 'No. It lets the beam through and sends a second beam off its mirror. The splitter itself is never destroyed.' },
      { q: 'Can I capture an enemy piece directly?', a: 'No. Pieces only move into empty squares; the laser is the only way to remove a piece.' },
      { q: 'What if the game never ends?', a: 'After 200 moves (both sides together) it is a draw.' },
      { q: 'How do I play with a friend?', a: 'Create a room under Play with friends and send the invite link or 4-digit code. Moves can be timed at 60, 30 or 90 seconds.' },
    ],
    cta: { title: 'Ready to draw some light?', body: 'Try turning E1 on your first move. Following your beam to the end is the whole skill.', button: 'Play Laser Janggi' },
    disclaimer: 'Laser Janggi is an unofficial fan project by PUZZLTHINK, rebuilt for the web from the rules shown on the programme; it is not affiliated with the broadcaster or producers.',
  },
};

export default guide;
