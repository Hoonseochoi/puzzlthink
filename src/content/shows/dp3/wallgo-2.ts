import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, namuRules, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'wallgo-2',
  kind: 'prison',
  when: { ko: '4일차', en: 'Day 4' },
  site: 'wallgo2',
  related: ['wallgo2', 'wallgo', 'colorLinkDuel'],
  updated: '2026-11-26',
  sources: [namuDay(4), namuRules, siteEngine({ ko: '벽바둑', en: 'Wallgo' }, 'src/lib/wallgo.ts'), broadcast],
  ko: {
    meta: {
      title: '벽바둑 2 규칙 — 데블스플랜3 4일차 감옥매치, 사각 말·원형 말과 벽',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 4일차 감옥매치 벽바둑 2(벽바둑 II)의 규칙을 정리했어요. 사각 말과 원형 말의 이동, 벽 세우기, 1라운드 3인전과 벽 부수기, 2라운드 1:1, 영역 계산과 동점 처리, 승부를 가르는 지점까지.',
      keywords: ['벽바둑 2', '벽바둑2', '벽바둑 II', '데블스플랜3 벽바둑', '데블스플랜3 감옥매치', '데블스 플랜 3 4일차', '벽바둑 규칙'],
    },
    title: '벽바둑 2 — 데블스플랜3 4일차 감옥매치',
    name: '벽바둑 2',
    lead: '말을 옮길 때마다 벽을 하나씩 세워, 내 말이 있는 영역을 가장 넓게 만드는 게임이에요.',
    summary: '사각 말과 원형 말을 옮기고 벽을 세워 가장 넓은 영역을 차지하는 땅따먹기. 1라운드 3인전, 2라운드 1:1.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1라운드 3명, 2라운드는 그중 2명이 1:1로.',
        '**말**: 1라운드에는 한 사람에 **사각 말 1개, 원형 말 1개**. 2라운드에는 사각 말 2개, 원형 말 2개이고, 원형 말 2개의 시작 칸은 미리 정해져 있어요.',
        '**판과 벽**: 격자 판과, 칸과 칸 사이에 세우는 벽.',
      ] },
      { type: 'table', head: ['말', '이동'], rows: [
        ['사각 말', '상하좌우 한 방향으로 1–2칸 곧게.'],
        ['원형 말', '상하좌우로 1칸, 그다음 왼쪽이나 오른쪽으로 꺾어 1칸 더 갈 수 있어요.'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '말 놓기', body: '선 플레이어부터 사각 말과 원형 말 중 하나를 골라 빈칸에 놓아요. 두 번째 말은 역순으로 놓아요.' },
        { title: '말 이동', body: '자기 차례에는 90초 안에 말 하나를 골라 옮겨요. 다른 말이 있는 칸으로는 못 가고, 가는 길에 벽이 있는 방향으로도 못 가요.' },
        { title: '벽 세우기', body: '옮긴 말의 상하좌우 네 면 중 한 곳에 **반드시** 벽을 세워요. 이미 벽이 있는 면에는 세울 수 없어요.' },
        { title: '분리되면 끝', body: '모든 플레이어의 말이 있는 영역이 벽으로 서로 완전히 나뉘는 순간 게임이 끝나요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '끝났을 때 각자 자기 말이 들어 있는 영역의 칸 수를 더해요.',
        '1라운드(3인전)에서 **가장 넓은 영역을 만든 사람은 생존이 확정**되고, 나머지 두 명이 2라운드에서 1:1로 붙어요. 1라운드에서 더 넓게 확보한 사람이 2라운드 선이에요.',
        '**2라운드에서 진 사람이 탈락**하고, 살아남은 사람은 모두 피스 1개씩 받아요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**벽 부수기**: 1라운드에서만, 게임 중 한 번, 이동 경로에 있는 벽 하나를 부수고 지나갈 수 있어요. 2라운드에는 없어요.',
        '영역이 모두 나뉘면 벽 부수기를 아직 안 쓴 사람이 있어도 바로 끝나요.',
        '시간을 넘기면 벽이 아무 면에나 세워져요.',
        '합계 칸 수가 같으면 **더 넓은 영역 하나의 칸 수**로 순위를 가려요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '벽바둑 2는 **움직임과 차단이 한 수에 묶인** 게임이에요. 말을 옮기면 반드시 그 말 옆에 벽을 세워야 하므로, 상대의 길을 막는 벽은 내 말 근처에만 세울 수 있어요. 그래서 막으려면 먼저 다가가야 해요.' },
      { type: 'cards', items: [
        { title: '두 말의 성격이 달라요', body: '사각 말은 곧게 두 칸을 가서 넓은 공간으로 빠르게 달아나기 좋고, 원형 말은 꺾을 수 있어서 벽 모서리를 돌아 들어가기 좋아요. 두 말이 따로 영역을 만들면 합산되지만, 한쪽이 갇히면 그만큼 칸을 잃어요.' },
        { title: '문 닫기 싸움', body: '두 영역이 한두 칸짜리 통로로만 이어져 있으면, 그 통로에 벽을 세우는 순간 영역이 나뉘어요. 내 쪽이 넓을 때 문을 닫고, 좁을 때는 문이 닫히기 전에 넓은 쪽으로 들어가야 해요.' },
        { title: '3인전의 정치', body: '1라운드에서는 가장 넓은 한 명만 확정되고 나머지 두 명이 다시 싸워요. 그래서 두 사람이 앞서가는 한 명을 함께 막을지, 서로를 밀어낼지가 문제예요. 2위 다툼이 의미 없는 구조라 "1등이 아니면 다 같다"는 계산이 필요해요.' },
        { title: '벽 부수기는 마지막 탈출구', body: '1라운드에서 한 번뿐인 벽 부수기는 갇혔을 때 빠져나오는 수단이에요. 하지만 영역이 다 나뉘면 쓰지 못한 채 끝나므로, 상대가 벽 부수기를 남겨 두었다면 그 전에 판을 닫아 버리는 것도 방법이에요.' },
        { title: '지배 전략이 있을까요?', body: '판이 작고 정보가 모두 공개된 1:1(2라운드)은 이론상 끝까지 계산할 수 있는 게임이지만, 경우의 수가 커서 사람이 90초 안에 다 읽을 수는 없어요. 실전에서는 넓은 빈 공간 쪽으로 먼저 자리를 잡고, 상대 말 사이를 갈라놓는 벽을 우선하는 원칙이 강해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 벽바둑 II는 방송 규칙대로 사각 말·원형 말, 이동 뒤 벽 세우기, 1라운드 3인전(벽 부수기 1회)과 2라운드 1:1(말 4개, 원형 말 2개 고정 시작, 벽 부수기 없음), 동점 시 가장 넓은 영역 비교를 구현했어요. 판은 7×7이에요.',
        '3인전과 1:1을 따로 골라 AI나 친구와 할 수 있고, 끝난 뒤 복기할 수 있어요.',
        'PUZZLTHINK에는 말 종류가 하나뿐인 앞선 버전 **벽바둑**도 있어요. 벽바둑은 시즌 2(데스룸) 5일차 감옥 매치로 나왔고, 말이 1–2칸 움직이되 지나온 칸으로 되돌아올 수 있다는 점이 달라요. 시즌 3의 거주동에 놓여 있던 보드게임이 바로 이 벽바둑 2였어요.',
      ] },
    ],
    similar: [
      { name: '아마존 (Game of the Amazons)', players: '2명', alike: '말을 움직인 뒤 반드시 막는 수(화살)를 두어 판을 나누고, 끝에 내가 움직일 수 있는 공간이 많은 쪽이 이겨요. 이동과 차단이 한 수에 묶인 점이 벽바둑과 같아요.', differs: '아마존은 퀸처럼 멀리 움직이고 화살은 칸 자체를 막아요. 벽바둑은 칸 사이에 벽을 세우고 영역 칸 수를 세요.' },
      { name: '쿼리도 (Quoridor)', players: '2–4명', alike: '말을 옮기거나 칸 사이에 벽을 세워 상대의 길을 막는 게임이에요.', differs: '쿼리도는 반대편 끝에 먼저 도착하는 경주이고, 상대의 길을 완전히 막는 벽은 세울 수 없어요.' },
      { name: '바둑', players: '2명', alike: '판을 나눠 더 넓은 집(영역)을 만든 쪽이 이기는 땅따먹기예요.', differs: '바둑은 돌을 놓아 집을 만들고 상대 돌을 잡을 수 있어요. 벽바둑의 말은 잡히지 않고 벽으로만 갇혀요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Wallgo II rules — The Devil's Plan 3, day 4 prison match (square and round pieces)",
      description: "The rules of Wallgo II (벽바둑 2), the day-4 prison match of The Devil's Plan: Dead Again (season 3): square and round pieces, building walls, the three-player round with a wall break, the 1:1 second round, counting territory, ties, and what decides it.",
      keywords: ['Wallgo II', 'Wallgo 2', "Devil's Plan 3 Wallgo", "Devil's Plan prison match", 'Wallgo rules'],
    },
    title: "Wallgo II — The Devil's Plan 3, day 4 prison match",
    name: 'Wallgo II',
    lead: 'Every move builds a wall. Make the area your pieces stand in the largest on the board.',
    summary: 'Move square and round pieces and build walls to claim the largest territory: three players, then a 1:1.',
    setup: [
      { type: 'list', items: [
        '**Players**: 3 in round 1; two of them play round 2 head to head.',
        '**Pieces**: round 1, **one square and one round piece** each. Round 2, two of each, with both round pieces on fixed starting squares.',
        '**Board and walls**: a grid, and walls that go between cells.',
      ] },
      { type: 'table', head: ['Piece', 'Move'], rows: [
        ['Square', '1–2 cells in a straight line, up, down, left or right.'],
        ['Round', '1 cell up, down, left or right, then may turn left or right for 1 more.'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Placing', body: 'From the first player, each picks a square or round piece and places it on any empty cell; second pieces go in reverse order.' },
        { title: 'Moving', body: 'Within 90 seconds, move one of your pieces. It cannot enter an occupied cell or pass through a wall.' },
        { title: 'Building', body: 'Then you **must** build a wall on one of the four sides of the piece you moved, on a side without a wall.' },
        { title: 'The end', body: 'The moment every player’s pieces are walled off from each other, the game ends.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Each player adds up the cells of the areas their pieces are in.',
        'In round 1 (three players) **the largest territory is safe**; the other two play round 2 head to head, and whoever claimed more in round 1 goes first.',
        '**The loser of round 2 is eliminated**; every survivor gets a piece.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Wall break**: in round 1 only, once per game, a piece may break one wall on its path and go through. Round 2 has none.',
        'Once every area is separated, the game ends even if someone has not used their wall break.',
        'Running out of time puts a wall on a random side.',
        'Equal totals are broken by **the size of each player’s single largest area**.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Wallgo II **ties movement and blocking into one move**. A wall can only go next to the piece you just moved, so to block someone you first have to go to them.' },
      { type: 'cards', items: [
        { title: 'Two pieces, two characters', body: 'The square piece runs two cells straight into open space; the round piece turns corners and slips around walls. Separate areas add up, but a trapped piece costs you all that space.' },
        { title: 'The door fight', body: 'Two areas joined by a one- or two-cell passage split the moment a wall closes it. Close the door when your side is bigger; get through before it closes when it is smaller.' },
        { title: 'Three-player politics', body: 'Only the largest is safe in round 1; the other two fight again. Will the two trailing players block the leader together or push each other? Second place is worth nothing, so "first or nothing" is the calculation.' },
        { title: 'The wall break is an exit', body: 'The single round-1 wall break gets a trapped piece out — but it is useless once the board is closed, so closing the board before an opponent uses theirs is a plan in itself.' },
        { title: 'Is there a dominant strategy?', body: 'Round 2 is small with full information, so in theory it can be calculated to the end, but there are far too many lines to read in 90 seconds. In practice, settling toward open space first and prioritising walls that split the opponent’s pieces are strong principles.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Wallgo II implements the broadcast rules: square and round pieces, a wall after every move, the three-player round 1 (one wall break) and the 1:1 round 2 (four pieces, both round pieces on fixed squares, no wall break), and the largest-area tie-break. The board is 7×7.',
        'Choose the three-player game or the 1:1, against AIs or friends, and review the game afterwards.',
        'The site also has the earlier **Wallgo**, with a single kind of piece. It was the day-5 prison match of season 2 (Death Room); its pieces move 1–2 cells and may double back to where they started. The board game set out in season 3’s living quarters was this Wallgo II.',
      ] },
    ],
    similar: [
      { name: 'Game of the Amazons', players: '2', alike: 'Every move is followed by a blocking shot that divides the board, and whoever has more room at the end wins — move and block in one turn, as in Wallgo.', differs: 'Amazons move like chess queens and arrows block whole cells; Wallgo builds walls between cells and counts territory.' },
      { name: 'Quoridor', players: '2–4', alike: 'Move your pawn or place a wall between cells to block the others.', differs: 'It is a race to the far side, and a wall may never cut off someone’s path completely.' },
      { name: 'Go (baduk)', players: '2', alike: 'Divide the board and win by enclosing more territory.', differs: 'Stones are placed, not moved, and can be captured; Wallgo pieces are never captured, only walled in.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
