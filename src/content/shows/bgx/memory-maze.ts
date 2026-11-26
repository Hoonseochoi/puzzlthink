import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'memory-maze',
  kind: 'revival',
  when: { ko: '5일차', en: 'Day 5' },
  related: ['blindGomoku', 'onestroke', 'nemoCount'],
  updated: '2026-11-26',
  sources: [namuDay('5'), broadcast],
  ko: {
    meta: {
      title: '기억 미로 규칙 — 피의 게임X 리바이벌 매치, 화살표 판 외우기',
      description: '피의 게임X 5일차 리바이벌 매치 기억 미로의 규칙을 정리했어요. 5×5 화살표 판 3분 암기, 15문제 버저 퀴즈, 5초 정답 선언, 라운드마다 못 맞힌 사람 탈락, 3명이 남았을 때의 최종 라운드까지.',
      keywords: ['기억 미로', '피의 게임X 기억 미로', '피의게임X 리바이벌 매치', '기억력 게임', '피의게임X'],
    },
    title: '기억 미로 — 피의 게임X 리바이벌 매치',
    name: '기억 미로',
    lead: '화살표가 그려진 5×5 판을 3분 동안 외우고, 판이 사라진 뒤 "여기서 출발하면 어디에 도착할까"를 맞혀요.',
    summary: '5×5 화살표 판을 3분간 외우고 경로 문제를 버저로 맞히는 패자부활전. 이긴 두 명이 저택으로 돌아가요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 팀 데스매치에서 탈락한 사람들.',
        '**판**: 5×5 격자(가로 A–E, 세로 1–5). 화살표가 적힌 칸에 들어가면 그 방향으로 한 칸 더 움직여요.',
        '**라운드**: 최대 5라운드.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '암기 (3분)', body: '판이 3분 동안 공개돼요. 끝나면 판이 가려져요.' },
        { title: '문제', body: '15문제가 차례로 나와요. 판 위의 이동에 관한 문제예요.' },
        { title: '버저', body: '버저를 누르고 5초 안에 답을 말해요. 맞히면 그 라운드에서 바로 생존이고, 틀리거나 시간을 넘기면 그 문제에는 다시 답할 수 없어요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '라운드가 끝날 때까지 한 문제도 못 맞힌 사람은 탈락해요.',
        '살아남은 사람이 3명이 되면 최종 라운드(10문제)를 하고, **가장 많이 맞힌 두 명이 우승**해 피의 저택으로 돌아가요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '한 라운드에서 한 문제만 맞히면 되므로, 앞 문제에서 맞힌 사람은 그 라운드의 남은 문제에서 빠지는 셈이에요.',
        '문제 형식과 판의 화살표 배치는 이 페이지에 적지 않았어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '기억 미로는 판 전체를 외우는 것보다 **화살표가 이어지는 "흐름"을 외우는** 쪽이 유리해요. 화살표 칸은 다음 칸으로 밀어내므로, 여러 화살표가 이어지면 한 번에 멀리 가는 길이 생겨요.' },
      { type: 'cards', items: [
        { title: '흐름으로 묶어 외우기', body: '25칸을 따로 외우면 많지만, "B2에서 출발하면 오른쪽으로 두 번 밀려 D2"처럼 길 단위로 외우면 덩어리가 줄어요. 화살표가 서로를 가리키는 고리가 있다면 그 자체가 기억하기 좋은 표지예요.' },
        { title: '버저 타이밍', body: '한 라운드에 한 번만 맞히면 살아남으므로, 확실한 문제를 기다리는 것이 기본이에요. 그런데 다른 사람이 먼저 맞히면 남은 문제는 남은 사람끼리 다투니, 문제가 뒤로 갈수록 경쟁자는 줄어요. 다만 15문제가 다 지나면 끝이라, 너무 오래 기다리면 기회가 사라져요.' },
        { title: '최종 라운드는 다른 게임', body: '최종 라운드는 맞힌 개수로 순위를 정해요. 한 문제만 맞히면 되던 앞 라운드와 달리, 틀려도 다음 문제를 노리는 공격적인 버저가 필요해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '메모리 (Concentration)', players: '1명 이상', alike: '잠깐 본 배치를 기억해 맞히는 기억력 게임이에요.', differs: '메모리는 같은 그림 두 장을 뒤집어 맞히고, 경로를 따라가는 계산이 없어요.' },
      { name: '로보 랠리 (Robo Rally)', players: '2–6명', alike: '판 위의 화살표(컨베이어 벨트)가 말을 밀어 이동시키는 장치가 있어요.', differs: '로보 랠리는 판이 늘 보이고, 이동 카드를 미리 짜는 레이스예요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: 'Memory Maze rules — The Bloody Game X revival match',
      description: 'The rules of Memory Maze, the day-5 revival match of The Bloody Game X (피의 게임X): memorise a 5×5 arrow board for three minutes, fifteen buzzer questions, five seconds to answer, elimination for anyone without a right answer, and the final round when three remain.',
      keywords: ['Memory Maze', 'Bloody Game X revival match', 'memory game', '피의 게임X'],
    },
    title: 'Memory Maze — The Bloody Game X revival match',
    name: 'Memory Maze',
    lead: 'Memorise a 5×5 board of arrows for three minutes, then answer "start here — where do you end up?" with the board hidden.',
    summary: 'A comeback match: memorise a 5×5 arrow board, then buzz in on route questions; the two best return to the mansion.',
    setup: [
      { type: 'list', items: [
        '**Players**: those eliminated in the team death match.',
        '**Board**: 5×5 (columns A–E, rows 1–5). Entering an arrow cell pushes you one cell further that way.',
        '**Rounds**: up to five.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Memorise (3 minutes)', body: 'The board is shown for three minutes, then hidden.' },
        { title: 'Questions', body: 'Fifteen questions follow, about movement on the board.' },
        { title: 'Buzzer', body: 'Buzz and answer within five seconds. A right answer means you survive the round; a wrong or late one loses that question.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Anyone without a right answer by the end of a round is eliminated.',
        'When three remain, a final round of ten questions is played and **the two with the most right answers win** a return to the mansion.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'One right answer per round is enough, so survivors effectively drop out of the rest of the round.',
        'The question formats and the arrow layout are not reproduced here.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'It pays to memorise **flows** rather than the whole board: arrows push into further cells, so chains of arrows make long single moves.' },
      { type: 'cards', items: [
        { title: 'Chunk by routes', body: 'Twenty-five cells is a lot; "from B2, pushed right twice to D2" is one chunk. Arrows pointing at each other in a loop are especially memorable landmarks.' },
        { title: 'Buzzer timing', body: 'One right answer survives the round, so waiting for a sure question is the default — and as others survive, fewer rivals remain. But after fifteen questions the round is over, so waiting too long is fatal.' },
        { title: 'The final round is different', body: 'It ranks by how many you get right, so aggressive buzzing — accepting misses to chase the next question — replaces caution.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Memory (Concentration)', players: '1+', alike: 'Recall a layout you only glimpsed.', differs: 'You match pairs of pictures; there is no route-following.' },
      { name: 'Robo Rally', players: '2–6', alike: 'Arrow conveyor belts on the board push pieces along.', differs: 'The board is always visible and movement is programmed with cards.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
