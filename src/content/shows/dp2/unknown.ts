import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'unknown',
  kind: 'main',
  when: { ko: '2일차', en: 'Day 2' },
  related: ['wallgo', 'monorail', 'fourThree'],
  updated: '2026-11-26',
  sources: [namuDay(2), broadcast],
  ko: {
    meta: {
      title: '언노운 규칙 — 데블스플랜2(데스룸) 2일차 메인매치, 숨겨진 규칙의 주사위 말',
      description: '데블스 플랜: 데스룸(데블스플랜2) 2일차 메인매치 언노운의 규칙을 정리했어요. 여섯 색 칸 게임판과 주사위 모양 말, 굴려서 한 칸 이동과 밀어내기, 골인과 순위, 라운드마다 하나씩 공개되는 숨겨진 규칙, 승부를 가르는 지점까지.',
      keywords: ['언노운', '데블스플랜2 언노운', '데블스 플랜 데스룸 언노운', '데블스플랜2 메인매치', '언노운 규칙'],
    },
    title: '언노운 — 데블스플랜2 2일차 메인매치',
    name: '언노운',
    lead: '주사위 모양의 말을 굴려 골인 지점으로 가요. 그런데 판에는 아무도 모르는 규칙이 숨어 있어요.',
    summary: '주사위 모양 말을 굴려 골인 지점에 가장 먼저 도착하는 레이스. 숨겨진 규칙을 먼저 알아채는 사람이 유리해요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 둘째 날 생존자 전원.',
        '**게임판**: 빨강·노랑·파랑·초록·보라·흰색 여섯 색 칸, 회색 출발 구역, 골인 지점 하나.',
        '**말**: 각자 여섯 면이 여섯 색으로 칠해진 정육면체 말 하나. 굴리는 방향을 연습할 수 있게 같은 전개도의 주사위도 하나씩 받아요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '출발 구역 고르기', body: '각자 회색 출발 구역 하나를 골라 말을 놓아요. 겹치면 합의로 정해요. 출발 구역 번호가 작은 순서가 게임 순서가 되고, 이 순서는 끝까지 바뀌지 않아요.' },
        { title: '굴려서 이동', body: '자기 차례에 상하좌우 한 방향으로 말을 **한 번 굴려** 한 칸 옮겨요. 굴리면 윗면 색이 바뀌어요.' },
        { title: '밀어내기', body: '가려는 칸에 다른 말이 있으면 그 말도 같은 방향으로 한 칸 굴려 밀어내요.' },
        { title: '숨겨진 규칙', body: '말의 움직임에 따라 숨겨진 규칙이 발동하면 딜러가 그대로 적용하지만, 어떤 규칙인지는 말해 주지 않아요. 라운드가 끝날 때마다 미리 정해진 순서로 숨겨진 규칙이 하나씩 공개돼요.' },
      ] },
      { type: 'p', text: '본게임 전에 3라운드짜리 연습 게임을 해요. 숨겨진 규칙은 연습과 본게임이 같지만, 게임판은 미리 알리지 않은 채 바뀌어요.' },
    ],
    win: [
      { type: 'list', items: [
        '누군가의 말이 **골인 지점에 도착하면** 게임이 끝나고, 그 사람이 1위예요.',
        '나머지는 끝났을 때 서 있는 칸의 숫자가 큰 순서로 순위를 매겨요.',
        '1위는 피스 3개, 2–5위는 피스 1개를 받아요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '게임 중 출발 구역이 바뀌어도 게임 순서는 처음 그대로예요.',
        '상금 미션: 이 메인 매치에서 탈락자가 1명뿐이면 상금이 쌓였어요.',
        '숨겨진 규칙의 내용은 이 페이지에 적지 않았어요. 방송을 볼 사람에게는 그 자체가 게임의 재미이기 때문이에요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '언노운은 **규칙을 추리하는 게임**이에요. 같은 이동이라도 숨겨진 규칙 때문에 결과가 달라지고, 그 원인을 먼저 알아낸 사람만 규칙을 의도적으로 쓸 수 있어요.' },
      { type: 'cards', items: [
        { title: '연습 게임은 정보 수집 시간', body: '숨겨진 규칙은 연습과 본게임이 같으므로, 연습 3라운드에서 일어난 이상한 일을 기록해 두면 본게임의 큰 무기가 돼요. 판이 바뀐다는 사실을 몰라도, 규칙 자체는 그대로 쓸 수 있어요.' },
        { title: '윗면의 색을 계산하세요', body: '말을 굴리면 윗면 색이 정해진 방식으로 바뀌어요. 숨겨진 규칙이 색과 관련이 있다면, 골까지 가는 길뿐 아니라 어떤 색을 위로 한 채 어떤 칸에 서는지도 계산해야 해요. 전개도 주사위로 미리 굴려 보는 것이 그래서 중요해요.' },
        { title: '밀어내기는 공격이자 협력', body: '다른 말을 밀면 그 말의 위치와 윗면이 함께 바뀌어요. 앞서가는 사람을 뒤로 돌리거나, 같은 편을 골 쪽으로 밀어 줄 수 있어서 연합의 여지가 생겨요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '젠도 (Zendo)', players: '2–6명', alike: '숨겨진 규칙을 실험과 관찰로 추리하는 게임이에요. "왜 이런 결과가 나왔지?"를 가설로 세워 검증하는 과정이 같아요.', differs: '젠도는 레이스가 아니라 블록 배치로 규칙을 맞히는 게임이고, 정답을 말하면 이겨요.' },
      { name: '로보 랠리 (Robo Rally)', players: '2–6명', alike: '판 위의 장치와 서로의 밀어내기 때문에 계획대로 움직이기 어려운 레이스 게임이에요.', differs: '로보 랠리는 이동 카드를 미리 프로그래밍하고, 판의 장치는 처음부터 공개돼요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Unknown rules — The Devil's Plan 2 (Death Room), day 2 main match",
      description: "The rules of Unknown from The Devil's Plan: Death Room (season 2): a six-colour board and cube-shaped pieces, rolling one cell and pushing, reaching the goal and ranking, and the hidden rules revealed one per round.",
      keywords: ['Unknown', "Devil's Plan 2 Unknown", "Devil's Plan Death Room main match"],
    },
    title: "Unknown — The Devil's Plan 2, day 2 main match",
    name: 'Unknown',
    lead: 'Roll your cube-shaped piece to the goal — on a board hiding rules nobody knows.',
    summary: 'A race of rolling cube pieces to a goal; whoever spots the hidden rules first has the edge.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone still in on day 2.',
        '**Board**: cells in six colours (red, yellow, blue, green, purple, white), grey starting areas and one goal.',
        '**Pieces**: a cube with a different colour on each face, plus a matching die to practise rolls on.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Starting areas', body: 'Each player picks a grey starting area (clashes settled by agreement). Lower area numbers play first, and this order never changes.' },
        { title: 'Roll to move', body: 'On your turn, **roll** your piece one cell up, down, left or right, changing its top colour.' },
        { title: 'Pushing', body: 'If the cell is occupied, that piece is rolled one cell further the same way.' },
        { title: 'Hidden rules', body: 'When a move triggers a hidden rule, the dealer applies it without saying what it is. At the end of each round, one hidden rule is revealed in a set order.' },
      ] },
      { type: 'p', text: 'A three-round practice game comes first, with the same hidden rules but — without warning — a different board.' },
    ],
    win: [
      { type: 'list', items: [
        'The game ends when **a piece reaches the goal**; its owner is first.',
        'Everyone else ranks by the number of the cell they stand on, highest first.',
        'First place gets 3 pieces; 2nd to 5th get one each.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'The play order stays as it was set, even if starting areas change.',
        'Prize mission: only one elimination in this main match added prize money.',
        'The hidden rules themselves are not described here; working them out is the point of the game for anyone yet to watch.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Unknown is **a game of deducing rules**. The same move can end differently because of a hidden rule, and only whoever finds the cause can use it on purpose.' },
      { type: 'cards', items: [
        { title: 'Practice is for gathering evidence', body: 'The hidden rules carry over from the practice game, so anything odd in those three rounds is a weapon later, even though the board changes.' },
        { title: 'Track the top face', body: 'Rolling changes the top colour predictably. If a hidden rule involves colour, you must plan not just the route but which colour faces up on which cell — which is why the practice die matters.' },
        { title: 'Pushing attacks and helps', body: 'Pushing changes another piece’s cell and top face. It can send a leader back or nudge an ally forward, which opens room for alliances.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Zendo', players: '2–6', alike: 'Deduce a hidden rule by experiment and observation, forming and testing hypotheses.', differs: 'It is not a race; you build arrangements of pieces and win by naming the rule.' },
      { name: 'Robo Rally', players: '2–6', alike: 'A race where board elements and pushing make it hard to move as planned.', differs: 'Moves are programmed with cards in advance, and the board elements are visible from the start.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
