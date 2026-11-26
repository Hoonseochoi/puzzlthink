import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'tectonic-shift',
  kind: 'semi',
  when: { ko: '준결승', en: 'Semifinal' },
  episode: { ko: '8화', en: 'Episode 8' },
  related: ['wallgo', 'wallgo2', 'colorLinkDuel'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '지각 변동 규칙 — 데스게임2 준결승, 무너지는 육각 타일 위의 말 이동',
      description: '넷플릭스 데스게임2 준결승 지각 변동의 규칙을 정리했어요. 1–5점 육각 타일 120개, 가장자리에서 시작하는 말 5개, 막힐 때까지 직진하고 떠난 타일의 점수를 먹는 이동, 고립된 말의 제거, 종료와 동점 처리, 3인 1라운드와 2인 2라운드까지.',
      keywords: ['지각 변동', '지각변동', '데스게임2 지각 변동', '데스게임 준결승', '추상전략 게임'],
    },
    title: '지각 변동 — 데스게임2 준결승',
    name: '지각 변동',
    lead: '말이 떠난 자리는 무너져요. 막힐 때까지 곧장 미끄러지며, 떠나는 타일의 점수를 가져가요.',
    summary: '말이 떠난 육각 타일의 점수를 먹고 그 타일을 없애며, 상대의 길을 끊어 고립시키는 추상전략 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1라운드 3명, 2라운드 2명.',
        '**판**: 정육각형 타일 120개. 타일마다 1–5점이 적혀 있어요.',
        '**말**: 각자 5개를, 점수가 없는 판 가장자리에 놓고 시작해요. 순서는 추첨으로 정해요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '이동 (90초)', body: '자기 말 하나를 골라 한 방향으로 곧게 움직여요. 말은 판 가장자리나 다른 말에 막히기 전까지 일직선으로 가요. 시간 안에 못 두면 차례가 끝나요.' },
        { title: '점수와 붕괴', body: '이동이 끝나면 **출발한 타일의 점수**를 받고, 그 타일은 판에서 사라져요.' },
        { title: '빈칸 금지', body: '타일이 없어진 곳으로는 갈 수 없고, 곧게 움직일 때 빈칸을 뛰어넘을 수 없어요.' },
        { title: '고립', body: '이웃 타일이 모두 사라져 움직일 수 없는 말은 제거돼요. 그 말이 서 있던 타일의 점수는 받지 못해요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**한 사람의 말 5개가 모두 제거되면** 바로 끝나고, 누적 점수가 가장 높은 사람이 이겨요.',
        '동점이면 판에 남은 말이 많은 쪽이 이겨요.',
        '준결승은 2라운드예요. 1라운드(3명) 승자가 먼저 결승에 가고, 남은 2명이 바뀐 규칙의 2라운드를 해서 승자가 결승에 가요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '움직일 수 없는 이유가 **다른 사람의 말이 한 면을 막고 있기 때문**이라면 바로 제거되지 않고, 주변 말이 모두 움직인 뒤에 제거돼요.',
        '2라운드에 바뀐 규칙은 정리 자료에서 따로 접혀 있어 이 페이지에는 적지 않았어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '지각 변동은 보드게임 **"헤이, 내 물고기야!"**와 같은 구조예요. 점수는 떠나는 칸에서 나오고, 떠난 칸은 사라지므로, 모든 이동이 판을 조금씩 쪼개요.' },
      { type: 'cards', items: [
        { title: '높은 점수 칸에 "서 있는" 가치', body: '점수는 도착할 때가 아니라 떠날 때 받아요. 그래서 5점 칸에 도착한 말은 다음 이동 때 5점을 확보하고, 그 사이 상대가 그 말을 고립시키면 점수를 잃어요. 높은 칸에 올라탄 말을 지키는 것이 점수를 지키는 거예요.' },
        { title: '판을 나누는 것이 공격', body: '타일이 사라지며 판이 여러 섬으로 쪼개져요. 내 말이 넓은 섬에, 상대 말이 좁은 섬에 갇히면 끝 무렵 점수 차가 크게 벌어져요. 상대 말과 넓은 지역 사이의 "다리"가 되는 타일을 먼저 밟고 떠나 없애는 것이 핵심 전술이에요.' },
        { title: '말을 잃으면 게임이 끝나요', body: '누군가 말 다섯 개를 모두 잃는 순간 끝나므로, 앞서는 사람은 상대 말을 빨리 고립시켜 게임을 끝내고 싶어하고, 뒤처진 사람은 오래 버텨야 해요. 3인전에서는 앞서는 사람을 두 명이 함께 견제하는 흐름이 생겨요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '헤이, 내 물고기야! (Hey, That’s My Fish!)', players: '2–4명', alike: '펭귄이 곧게 미끄러지고, 떠난 육각 얼음판의 물고기를 가져가며 그 판을 없애요. 고립된 펭귄은 더 못 움직여요. 지각 변동과 거의 같은 규칙이에요.', differs: '헤이, 내 물고기야!는 원하는 칸에서 멈출 수 있고, 고립되면 서 있던 판의 물고기를 가져가요.' },
      { name: '아마존 (Game of the Amazons)', players: '2명', alike: '움직이는 만큼 판이 막혀 가고, 끝에 움직일 공간이 많은 쪽이 유리해요.', differs: '아마존은 화살로 칸을 막고, 점수 칸이 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 이동 중 원하는 칸에서 멈출 수 있는지는 정리 자료만으로 분명하지 않아 단정하지 않았어요.',
  },
  en: {
    meta: {
      title: 'Tectonic Shift rules — Death Game 2 (The Risk Takers season 2), semifinal',
      description: 'The rules of Tectonic Shift (지각 변동) from Netflix’s Death Game season 2: 120 hexagonal tiles worth 1–5, five pieces starting on the edge, sliding until blocked and scoring the tile you leave, isolated pieces removed, the end and tie-break, and the three-player then two-player rounds.',
      keywords: ['Tectonic Shift', 'Death Game 2 semifinal', 'abstract strategy game', 'The Risk Takers season 2'],
    },
    title: 'Tectonic Shift — Death Game 2, semifinal',
    name: 'Tectonic Shift',
    lead: 'The ground a piece leaves collapses. Slide straight until something stops you, and take the points of the tile you left.',
    summary: 'An abstract game of sliding pieces that score and destroy the hex tiles they leave, cutting off opponents.',
    setup: [
      { type: 'list', items: [
        '**Players**: three in round 1, two in round 2.',
        '**Board**: 120 hexagonal tiles marked 1–5.',
        '**Pieces**: five each, starting on the pointless edge; order by draw.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Move (90 seconds)', body: 'Move one piece in a straight line until the edge or another piece blocks it (whether you may stop earlier is not clear from the source). No move in time ends your turn.' },
        { title: 'Score and collapse', body: 'You score **the tile you started from**, which is then removed.' },
        { title: 'No gaps', body: 'You cannot enter removed spaces or jump them when sliding.' },
        { title: 'Isolation', body: 'A piece whose neighbouring tiles are all gone is removed, without scoring its tile.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'The game ends **as soon as a player loses all five pieces**; the highest total wins.',
        'Ties go to more pieces left on the board.',
        'The semifinal has two rounds: the round-1 (three-player) winner reaches the final; the other two play round 2 with changed rules for the second place.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A piece stuck only because another player’s piece blocks one side is not removed until the surrounding pieces have moved.',
        'Round 2’s changed rules are folded away in the source and not described here.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Tectonic Shift shares the structure of **Hey, That’s My Fish!**: points come from the tile you leave, and that tile disappears, so every move breaks up the board.' },
      { type: 'cards', items: [
        { title: 'Standing on a high tile', body: 'Points come when leaving, not arriving: a piece on a 5 banks it on its next move — unless it is isolated first. Protecting pieces on high tiles protects points.' },
        { title: 'Splitting the board is attack', body: 'As tiles vanish the board becomes islands. Your pieces on big islands and theirs on small ones make the endgame gap. Leaving (and so removing) the "bridge" tiles between their pieces and open ground is the key tactic.' },
        { title: 'Losing pieces ends it', body: 'The game stops when anyone loses all five, so a leader wants to isolate pieces fast and a trailing player wants time. With three players, two tend to gang up on the leader.' },
      ], columns: 1 },
    ],
    similar: [
      { name: "Hey, That's My Fish!", players: '2–4', alike: 'Penguins slide in straight lines, take the fish on the ice tile they leave and remove it; trapped penguins stop. Almost the same rules.', differs: 'You may stop anywhere along the line, and a trapped penguin keeps its tile’s fish.' },
      { name: 'Game of the Amazons', players: '2', alike: 'The board fills up as you move, and more room at the end wins.', differs: 'Arrows block cells and there are no scoring tiles.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Whether a piece may stop before being blocked is not clear from the source and is not asserted.',
  },
};

export default game;
