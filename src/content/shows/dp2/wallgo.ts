import type { ShowGame } from '../types';
import { broadcast, namuDay, namuRules } from './shared';

const game: ShowGame = {
  slug: 'wallgo',
  kind: 'prison',
  when: { ko: '5일차', en: 'Day 5' },
  site: 'wallgo',
  related: ['wallgo', 'wallgo2', 'colorLinkDuel'],
  updated: '2026-11-26',
  sources: [namuDay(5), namuRules, { label: { ko: 'PUZZLTHINK 벽바둑 규칙 구현 (src/lib/wallgo.ts)', en: "PUZZLTHINK's Wallgo rules engine (src/lib/wallgo.ts)" } }, broadcast],
  ko: {
    meta: {
      title: '벽바둑 규칙 — 데블스플랜2(데스룸) 5일차 감옥매치, 말 옮기고 벽 하나',
      description: '데블스 플랜: 데스룸(데블스플랜2) 5일차 감옥매치이자 거주동 보드게임이던 벽바둑의 규칙을 정리했어요. 말 1–2칸 이동과 벽 세우기, 1라운드 3인전과 벽 부수기, 2라운드 1:1, 영역 계산과 동점 처리, 그리고 PUZZLTHINK에서 바로 두기까지.',
      keywords: ['벽바둑', '벽바둑 규칙', '데블스플랜2 벽바둑', '데블스 플랜 데스룸 벽바둑', '데블스플랜2 감옥매치', '벽바둑 온라인'],
    },
    title: '벽바둑 — 데블스플랜2 5일차 감옥매치',
    name: '벽바둑',
    lead: '말을 한두 칸 옮기고 그 옆에 벽을 하나 세워요. 모든 말이 벽으로 갈라졌을 때, 내 영역이 가장 넓으면 살아남아요.',
    summary: '말을 옮길 때마다 벽을 세워 가장 넓은 영역을 차지하는 땅따먹기. 1라운드 3인전, 2라운드 1:1.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1라운드 3명, 2라운드는 그중 2명이 1:1로.',
        '**말**: 1라운드에는 각자 2개. 2라운드에는 각자 4개이고, 그중 2개는 시작 칸이 정해져 있어요.',
        '**판과 벽**: 격자 판과 칸 사이에 세우는 벽. 시즌 2에서는 생활동과 감옥동에 2–4인용 보드게임으로 미리 놓여 있었어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '말 놓기', body: '추첨한 순서로, 정순과 역순을 번갈아(1-2-3-3-2-1) 말을 하나씩 빈칸에 놓아요.' },
        { title: '말 이동 (90초)', body: '자기 말 하나를 상하좌우 빈칸으로 1칸 또는 2칸 옮겨요. 지나온 칸으로 되돌아와도 돼요. 다른 말이 있는 칸이나 벽 너머로는 갈 수 없어요.' },
        { title: '벽 세우기', body: '옮긴 말의 네 면 중 벽이 없는 한 곳에 **반드시** 벽을 세워요.' },
        { title: '분리되면 끝', body: '벽 때문에 모든 플레이어의 공간이 서로 나뉘면 바로 끝나요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '말이 있는 공간의 칸 수를 더해 **가장 많은 사람이 생존**하고 피스 1개를 받아요.',
        '나머지 두 사람이 2라운드에서 1:1로 붙고, 1라운드에서 더 넓게 차지한 쪽이 선이에요. **2라운드에서 진 사람이 탈락**해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**벽 부수기**: 1라운드에서 각자 한 번, 이동 경로에 있는 벽을 부수고 지나갈 수 있어요. 2라운드에는 없어요.',
        '공간이 모두 나뉘면 벽 부수기를 안 쓴 사람이 있어도 끝나요.',
        '90초를 넘기면 벽이 아무 면에나 세워져요.',
        '합계가 같으면 가장 넓은 공간 하나의 칸 수가 많은 쪽이 이겨요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '벽바둑은 이동과 차단이 한 수에 묶여 있어서, **상대를 막으려면 내 말이 그 근처에 있어야** 해요. 벽은 늘 방금 움직인 말 옆에만 생기니까요.' },
      { type: 'cards', items: [
        { title: '되돌아오기 = 제자리', body: '두 칸 갔다가 돌아오는 이동이 허용돼서, 사실상 그 자리에 머물며 벽만 세울 수 있어요. 좋은 자리를 잡은 말이 움직이지 않고 주변을 닫을 수 있다는 뜻이라, 벽바둑 II(제자리 이동 불가)보다 수비가 쉬워요.' },
        { title: '문을 닫는 타이밍', body: '두 영역이 좁은 통로로 이어져 있을 때, 넓은 쪽에 있는 사람은 문을 닫고, 좁은 쪽에 있는 사람은 닫히기 전에 빠져나가야 해요. 말 두 개가 서로 다른 영역에 있으면 한쪽이 갇혀도 다른 쪽이 점수를 지켜요.' },
        { title: '3인전은 1등만 의미가 있어요', body: '1라운드는 1등만 살고 2·3등은 다시 싸우므로, 앞서가는 한 명을 나머지 둘이 함께 막는 흐름이 자연스러워요. 1등 후보는 일찍 넓은 공간을 확정 짓는 것이 안전해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 벽바둑은 7×7 판에서 방송과 같은 이동(0–2칸, 되돌아오기 가능)과 벽 세우기, 3인전(말 2개, 벽 부수기 1회)과 1:1(말 4개 중 2개 고정 시작, 벽 부수기 없음), 동점 처리를 구현했어요.',
        'AI 3인전·1:1과 링크 하나로 하는 친구전이 있고, 1:1에는 매우 어려움(헬모드) AI도 있어요.',
        '말이 사각·원형 두 종류로 나뉘고 제자리 이동이 없는 후속작 **벽바둑 2**는 시즌 3 감옥 매치로 나왔고, PUZZLTHINK에도 있어요.',
      ] },
    ],
    similar: [
      { name: '아마존 (Game of the Amazons)', players: '2명', alike: '움직인 뒤 반드시 막는 수를 두어 판을 나누고, 공간이 많은 쪽이 이겨요.', differs: '말이 퀸처럼 멀리 움직이고, 화살이 칸 자체를 막아요.' },
      { name: '쿼리도 (Quoridor)', players: '2–4명', alike: '칸 사이에 벽을 세워 상대의 길을 막아요.', differs: '반대편 끝에 먼저 닿는 경주이고, 길을 완전히 막는 벽은 금지예요.' },
      { name: '바둑', players: '2명', alike: '판을 나눠 더 넓은 집을 짓는 땅따먹기예요.', differs: '돌을 놓기만 하고 움직이지 않으며, 상대 돌을 잡을 수 있어요.' },
    ],
    sourceNote: '규칙은 방송 규칙서를 옮긴 정리(나무위키)와 PUZZLTHINK 구현을 서로 맞춰 확인했어요. PUZZLTHINK의 벽바둑 소개 문구 일부에는 "데블스플랜3"라고 적혀 있지만, 감옥 매치로 나온 것은 시즌 2(데스룸) 5일차예요.',
  },
  en: {
    meta: {
      title: "Wallgo rules — The Devil's Plan 2 (Death Room), day 5 prison match",
      description: "The rules of Wallgo (벽바둑), the day-5 prison match of The Devil's Plan: Death Room (season 2) and the board game in its living quarters: moving 1–2 cells and building a wall, the three-player round with a wall break, the 1:1 round, counting territory and ties — playable on PUZZLTHINK.",
      keywords: ['Wallgo', 'Wall Go', "Devil's Plan 2 Wallgo", "Devil's Plan Death Room prison match", 'Wallgo online'],
    },
    title: "Wallgo — The Devil's Plan 2, day 5 prison match",
    name: 'Wallgo',
    lead: 'Move a piece one or two cells and build a wall beside it. When every piece is walled apart, the largest territory survives.',
    summary: 'Build a wall after every move and claim the largest territory: three players, then a 1:1.',
    setup: [
      { type: 'list', items: [
        '**Players**: 3 in round 1; two of them play round 2 head to head.',
        '**Pieces**: two each in round 1; four each in round 2, two of them on fixed starting cells.',
        '**Board and walls**: a grid with walls between cells. In season 2 it sat in both living areas as a 2–4 player board game.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Placing', body: 'In drawn order, forwards then backwards (1-2-3-3-2-1), each places a piece on an empty cell.' },
        { title: 'Moving (90 seconds)', body: 'Move one of your pieces one or two cells up, down, left or right through empty cells; doubling back is allowed. No occupied cells, no crossing walls.' },
        { title: 'Building', body: 'Then you **must** build a wall on a free side of the piece you moved.' },
        { title: 'The end', body: 'When walls separate every player’s space, the game ends at once.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Add up the cells of the spaces your pieces are in; **the largest survives** and gets a piece.',
        'The other two play round 2 head to head, the bigger round-1 territory going first. **The loser of round 2 is eliminated.**',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Wall break**: once each in round 1, break a wall on your path and pass through. None in round 2.',
        'The game ends once everything is separated, even with wall breaks unused.',
        'After 90 seconds a wall is built on a random side.',
        'Equal totals go to the larger single space.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Moving and blocking are one action, so **to block someone your piece must be near them** — walls only appear beside the piece just moved.' },
      { type: 'cards', items: [
        { title: 'Doubling back = staying put', body: 'Moving two cells and back is allowed, so a well-placed piece can in effect stay and wall in its surroundings. Defence is easier than in Wallgo II, where staying put is impossible.' },
        { title: 'When to close the door', body: 'With two areas joined by a narrow passage, the player on the larger side closes it and the one on the smaller side must slip through first. Two pieces in different areas protect your score if one is trapped.' },
        { title: 'Only first place counts in round 1', body: 'Only the winner is safe, so the other two naturally gang up on the leader; the leader should lock in a large area early.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Wallgo plays on a 7×7 board with the broadcast movement (0–2 cells, doubling back allowed), the wall after every move, the three-player round (two pieces, one wall break) and the 1:1 (four pieces, two fixed, no wall break), and the tie-break.',
        'Play the AI in the three-player game or 1:1, or friends by link; the 1:1 also has a very hard (Hell Mode) AI.',
        'The sequel **Wallgo II**, with square and round pieces and no staying put, was a season-3 prison match and is also on PUZZLTHINK.',
      ] },
    ],
    similar: [
      { name: 'Game of the Amazons', players: '2', alike: 'Every move is followed by a block that divides the board; more room wins.', differs: 'Pieces move like queens and arrows block whole cells.' },
      { name: 'Quoridor', players: '2–4', alike: 'Walls between cells block the others’ paths.', differs: 'It is a race to the far side, and fully blocking a path is forbidden.' },
      { name: 'Go (baduk)', players: '2', alike: 'Divide the board and enclose more territory.', differs: 'Stones are placed, never moved, and can be captured.' },
    ],
    sourceNote: 'The rules were checked by comparing the fan wiki’s transcription of the rulebook with PUZZLTHINK’s implementation. Some of PUZZLTHINK’s Wallgo copy calls it a Devil’s Plan 3 game, but its prison match was in season 2 (Death Room), day 5.',
  },
};

export default game;
