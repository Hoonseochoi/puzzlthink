import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'three-story-omok',
  kind: 'death',
  when: { ko: '3일차', en: 'Day 3' },
  related: ['fourThree', 'russianJanggi', 'pointOmok'],
  updated: '2026-11-26',
  sources: [namuDay('3'), broadcast],
  ko: {
    meta: {
      title: '3층 오목 규칙 — 피의 게임X 3일차 데스매치, 쌓을 수 있는 오목',
      description: '피의 게임X 3일차 데스매치 3층 오목의 규칙을 정리했어요. 삼각형 격자 판과 돌 25개, 1-2-2-1 기본 배치와 금지 칸, 돌 놓기와 돌 이동(쌓기), 3층 제한, 세 가지 승리 조건, 동시 충족과 3판 2선승까지.',
      keywords: ['3층 오목', '피의 게임X 3층 오목', '피의게임X 데스매치', '쌓는 오목', '피의게임X'],
    },
    title: '3층 오목 — 피의 게임X 3일차 데스매치',
    name: '3층 오목',
    lead: '돌을 놓거나, 이미 놓은 돌을 옆 칸 돌 위로 쌓아 올려요. 오목을 만들거나 3층을 차지하면 이겨요.',
    summary: '삼각형 격자 위에서 돌을 놓고 옮겨 3층까지 쌓는 1:1 오목. 승리 방법이 세 가지예요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1.',
        '**판**: 삼각형 격자. 칸마다 여섯 방향으로 이웃해요.',
        '**돌**: 각자 25개.',
        '**선후공**: 1라운드는 투표로 정해진 탈락 후보가, 그 뒤로는 직전 라운드에서 진 사람이 정해요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '기본 배치', body: '선이 1개, 후가 2개, 선이 2개, 후가 1개를 차례로 놓아요. 이때 판 정중앙 칸과, 내가 이미 놓은 돌의 이웃 칸에는 놓을 수 없어요.' },
        { title: '돌 놓기', body: '차례마다 빈칸 아무 곳에 내 돌 하나를 새로 놓거나,' },
        { title: '돌 이동', body: '판 위의 내 돌 하나를 이웃 칸으로 옮겨요. 옮긴 칸에 돌이 있으면 그 위에 쌓여요(상대 돌 위도 돼요).' },
      ] },
      { type: 'list', items: [
        '돌은 **최대 3층**까지 쌓여요.',
        '옮겨 갈 칸의 더미가 **지금 서 있는 칸의 더미보다 높으면** 옮길 수 없어요. 높이가 같은 더미까지는 올라탈 수 있어요(1층 돌은 돌 하나짜리 더미 위로, 2층 돌은 2층 더미 위로).',
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**오목**: 위에서 봤을 때 내 돌이 한 줄로 정확히 5개 이어지면 이겨요(6개 이상은 인정하지 않아요).',
        '**3층 다섯**: 판 어디든 내 돌 5개가 3층에 있으면 이겨요.',
        '**이웃한 3층 셋**: 서로 이웃한 세 칸의 3층을 내 돌이 모두 차지하면 이겨요.',
        '3라운드 중 **먼저 2번 이긴 사람**이 데스매치에서 살아남아요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '한 수로 두 사람의 승리 조건이 동시에 갖춰지면, 그 수를 둔 사람이 이겨요.',
        '위에서 보는 판정이라, 쌓인 더미는 맨 위 돌의 색으로만 줄에 들어가요. 아래 돌은 덮이면 줄에서 빠져요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '3층 오목의 핵심은 **덮기**예요. 상대 돌 위에 내 돌을 올리면 그 칸이 내 것이 되면서 상대의 줄이 끊겨요. 놓는 수만 있는 보통 오목과 달리, 수비와 공격이 한 수에 일어나요.' },
      { type: 'cards', items: [
        { title: '"더 높은 더미로는 못 간다"는 규칙의 의미', body: '돌은 자기가 서 있는 더미보다 높은 더미 위로는 갈 수 없어요. 그래서 3층은 2층에 선 돌이 이웃한 2층 더미 위로 올라탈 때만 생겨요. 결국 2층 더미 두 개를 나란히 만드는 것이 3층 승리의 준비 동작이고, 상대가 그런 쌍을 만들면 미리 한쪽을 무너뜨리거나 덮어야 해요.' },
        { title: '돌 25개는 넉넉하지 않아요', body: '쌓을수록 판 위의 돌 수는 같아도 차지한 칸은 줄어요. 오목은 넓게 퍼진 돌이, 3층 승리는 좁게 모인 돌이 유리해서, 두 방향의 승리 조건이 서로 다른 배치를 요구해요. 상대가 어느 쪽을 노리는지 읽고 반대 방향의 위협으로 압박하는 것이 효과적이에요.' },
        { title: '기억도 무기예요', body: '쌓인 더미 아래에 어떤 색이 깔려 있는지는 위에서 보이지 않아요. 맨 위 돌이 옮겨 가면 아래 돌이 다시 드러나므로, 더미 속의 순서를 기억하는 사람만 "이 돌을 옮기면 무엇이 드러나는지"를 계산할 수 있어요.' },
        { title: '기본 배치의 금지 칸', body: '정중앙과 내 돌 옆에는 놓을 수 없어서, 처음 여섯 개의 돌은 반드시 흩어져요. 서로의 돌이 섞여 시작하므로, 첫 수부터 덮기 싸움이 가능한 거리에 있어요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '고블렛 고블러스 (Gobblet Gobblers)', players: '2명', alike: '더 큰 말로 상대 말을 덮어 칸을 빼앗고, 덮인 말은 들어 올리면 다시 드러나요. 덮기로 줄을 끊는 점이 같아요.', differs: '고블렛은 3×3 판의 삼목이고, 말 크기로 덮을 수 있는지가 정해져요. PUZZLTHINK의 러시아장기가 이 방식이에요.' },
      { name: '오목 (고모쿠)', players: '2명', alike: '다섯을 한 줄로 만드는 바탕 규칙과 장목 불인정이 같아요.', differs: '돌을 옮기거나 쌓지 않아요.' },
      { name: '산토리니 (Santorini)', players: '2–4명', alike: '높이가 있는 판에서 높이 제한이 이동을 막고, 3층에 오르는 것이 승리 조건이에요.', differs: '산토리니는 건물을 짓고 일꾼을 올리는 게임이고, 한 번에 한 층만 오를 수 있어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 정리 자료의 "원래 있던 칸보다 더 높은 층으로 이동 불가"는, 지금 서 있는 더미보다 높은 더미 위로는 갈 수 없다는 뜻으로 해석했어요(그래야 3층을 만들 수 있어요).',
  },
  en: {
    meta: {
      title: 'Three-Story Omok rules — The Bloody Game X, day 3 death match (gomoku you can stack)',
      description: 'The rules of Three-Story Omok from The Bloody Game X (피의 게임X): a triangular grid and 25 stones each, the 1-2-2-1 opening and forbidden cells, placing or moving (stacking) stones, the three-level limit, three ways to win, simultaneous wins and best of three.',
      keywords: ['Three-Story Omok', 'stacking gomoku', 'Bloody Game X death match', '피의 게임X'],
    },
    title: 'Three-Story Omok — The Bloody Game X, day 3 death match',
    name: 'Three-Story Omok',
    lead: 'Place a stone, or move one onto a neighbouring stack. Make five in a row or own the third level to win.',
    summary: 'A 1:1 gomoku on a triangular grid where stones move and stack up to three high, with three ways to win.',
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1.',
        '**Board**: a triangular grid; each cell has six neighbours.',
        '**Stones**: 25 each.',
        '**Order**: in round 1 the voted-in candidate chooses; afterwards the previous round’s loser.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Opening', body: 'First player places 1, second 2, first 2, second 1 — never on the centre cell or next to your own stones.' },
        { title: 'Place', body: 'On a turn, place a new stone on any empty cell, or…' },
        { title: 'Move', body: '…move one of your stones to a neighbouring cell, stacking it on any stone there (either colour).' },
      ] },
      { type: 'list', items: [
        'Stacks reach **at most three**.',
        'A stone may not move onto a stack **taller than the one it stands on**; equal height is fine (a level-1 stone onto a single stone, a level-2 stone onto a two-high stack).',
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**Five**: seen from above, exactly five of your stones in a line (six or more do not count).',
        '**Five on top**: five of your stones on the third level anywhere.',
        '**Three adjacent on top**: your stones on the third level of three mutually adjacent cells.',
        '**First to two round wins** (of three) survives.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'If a move completes both players’ conditions, the mover wins.',
        'Judged from above, a stack counts only as its top stone; covered stones drop out of lines.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'The heart of Three-Story Omok is **covering**: putting your stone on theirs takes the cell and breaks their line, so attack and defence happen in one move.' },
      { type: 'cards', items: [
        { title: 'What "no taller stacks" means', body: 'A stone can never move onto a stack taller than its own, so a third-level stone appears only when a stone standing at level two moves onto a neighbouring two-high stack. Building two adjacent two-high stacks prepares the third-level wins — and an opponent’s pair must be broken up or covered early.' },
        { title: 'Twenty-five stones is tight', body: 'Stacking covers fewer cells. Five in a row wants spread stones, third-level wins want clustered ones, so the win conditions pull in different directions; threaten the one your opponent is not preparing for.' },
        { title: 'Memory matters', body: 'You cannot see what lies under a stack; moving a top stone reveals the one below. Only a player who remembers each stack’s order can calculate what a move will uncover.' },
        { title: 'The opening restriction', body: 'No centre and no cells next to your own stones means the first six stones scatter and intermingle, so covering fights are possible from the first move.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Gobblet Gobblers', players: '2', alike: 'Cover an opponent’s piece to take its cell; lifting a piece reveals what was under it. PUZZLTHINK’s Russian Janggi works this way.', differs: 'It is three in a row on 3×3, and piece size decides what can cover what.' },
      { name: 'Gomoku', players: '2', alike: 'Five in a row, overlines not counting.', differs: 'Stones never move or stack.' },
      { name: 'Santorini', players: '2–4', alike: 'Height limits movement and reaching the third level wins.', differs: 'You build towers and climb with workers, one level at a time.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The source’s "cannot move to a higher level than the original cell" is read as "cannot move onto a stack taller than the one it stands on", which is the reading under which a third level can be built.',
  },
};

export default game;
