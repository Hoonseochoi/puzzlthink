import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'rush-hour-hell',
  kind: 'death',
  when: { ko: '4일차', en: 'Day 4' },
  related: ['monorail', 'wallgo', 'equationTower'],
  updated: '2026-11-26',
  sources: [namuDay('4'), broadcast],
  ko: {
    meta: {
      title: '지옥의 출근길 규칙 — 피의 게임X 4일차 데스매치, 자동차 타일 탈출 팀전',
      description: '피의 게임X 4일차 데스매치 지옥의 출근길의 규칙을 정리했어요. 14×14 판과 중립 차·구조물, 시작 위치 정하기, 막힐 때까지 직진하는 이동, 직전에 움직인 중립 차 금지, 1분 제한 시간과 교대, 타임아웃, 3대 먼저 탈출하기까지.',
      keywords: ['지옥의 출근길', '피의 게임X 지옥의 출근길', '피의게임X 데스매치', '러시아워 게임', '피의게임X'],
    },
    title: '지옥의 출근길 — 피의 게임X 4일차 데스매치',
    name: '지옥의 출근길',
    lead: '꽉 막힌 도로에서 자기 팀 차 네 대 중 세 대를 판 밖으로 먼저 빼내는 팀 대결이에요. 차는 막힐 때까지 곧장 미끄러져요.',
    summary: '막힐 때까지 직진하는 자동차 타일을 움직여, 자기 팀 차 3대를 먼저 판 밖으로 탈출시키는 팀 데스매치.',
    setup: [
      { type: 'list', items: [
        '**인원**: 머니 챌린지 4·5위 두 팀의 팀원 전원. 한 번에 팀마다 한 명씩 나와 1:1로 둬요.',
        '**판**: 14×14. 움직일 수 있는 **중립 자동차 타일**과 움직이지 않는 **구조물**이 놓여 있어요.',
        '**팀 자동차**: 팀마다 4대. 가운데 구역의 시작 자리 8곳에 놓여요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '시작 위치', body: '머니 챌린지 순위가 높았던 팀이 선후공을 정해요. 후공 팀이 상대 팀 차 3대의 자리를 정하고, 선공 팀이 자기 팀 마지막 차 1대의 자리를 정해요. 남은 네 곳에는 후공 팀 차가 자동으로 놓여요.' },
        { title: '출전 순서', body: '미리 낸 순서대로 팀마다 한 명씩 나와요. 나온 사람은 대기 중인 팀원과 이야기할 수 없어요.' },
        { title: '이동', body: '번갈아 차례를 진행하고, 차례마다 타일 하나를 골라 움직여요. 차는 다른 차나 구조물에 막힐 때까지 **곧장 미끄러져요**.' },
        { title: '움직일 수 있는 차', body: '자기 팀 차, 또는 **상대가 직전에 움직이지 않은** 중립 차만 움직일 수 있어요. 상대 팀 차는 움직일 수 없어요.' },
        { title: '탈출', body: '팀 차가 판 가장자리에 닿으면 탈출해요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '팀 차 4대 중 **3대를 먼저 탈출시킨 팀**이 데스매치에서 이겨요. 진 팀은 탈락해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '나온 사람마다 **제한 시간 1분**이 있고, 자기 차례 동안만 줄어요. 1분을 다 쓰면 다음 순서 팀원과 교대해요.',
        '자기 차례에 아무것도 움직이지 않으면 상대에게 차례가 넘어가요.',
        '팀마다 한 번 **타임아웃**을 부를 수 있고, 그동안은 모두가 자유롭게 이야기할 수 있어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '지옥의 출근길은 **막힐 때까지 미끄러지는 이동**이 핵심이에요. 한 칸만 움직일 수 없어서, 차를 원하는 곳에 세우려면 그 자리에 "멈출 벽"이 있어야 해요.' },
      { type: 'cards', items: [
        { title: '중립 차는 벽이자 길', body: '중립 차는 둘 다 움직일 수 있어서, 내 차가 멈출 벽을 만들거나 상대 차의 탈출로를 막는 데 써요. 다만 상대가 방금 움직인 중립 차는 내가 바로 되돌릴 수 없어서, 상대의 막기를 한 수 늦게만 풀 수 있어요.' },
        { title: '내 차가 상대의 벽이 될 수도', body: '상대 팀 차는 내가 움직일 수 없어요. 그래서 내 차가 상대 차 앞에 서 있으면 상대는 그 차를 치울 수 없어 우회해야 해요. 내 차 한 대를 일부러 남겨 상대의 길목을 막는 것도 전략이에요. 탈출은 네 대 중 세 대면 되니까요.' },
        { title: '처음 배치가 반을 정해요', body: '후공 팀이 상대 차 세 대의 자리를 정해요. 탈출하기 가장 어려운 자리에 상대 차를 놓는 권리예요. 대신 선공은 먼저 움직이고, 자기 마지막 차 하나는 직접 고를 수 있어요.' },
        { title: '시간은 팀이 나눠 써요', body: '한 사람에게 1분씩이라, 빠르게 많이 두면 시간이 금방 사라지고 다음 팀원에게 넘어가요. 팀원끼리 대화할 수 없으니, 판을 읽는 능력이 좋은 사람을 결정적인 순간에 배치하는 출전 순서가 중요해요. 타임아웃은 전원이 판을 함께 보는 유일한 기회예요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '러시 아워 (Rush Hour)', players: '1명', alike: '꽉 막힌 주차장에서 차를 앞뒤로 밀어 탈출로를 여는 슬라이딩 퍼즐이에요. 이름 그대로 출근길 정체를 다뤄요.', differs: '러시 아워는 혼자 푸는 퍼즐이고, 차는 원하는 칸 수만큼 움직일 수 있어요.' },
      { name: '리코셰 로봇 (Ricochet Robots)', players: '1명 이상', alike: '로봇이 벽이나 다른 로봇에 부딪힐 때까지 미끄러지는 이동 방식이 똑같아요. 다른 로봇을 벽으로 쓰는 계산도 같아요.', differs: '리코셰 로봇은 목표 칸에 가장 적은 이동으로 도착하는 방법을 먼저 찾는 경쟁이에요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 판의 구조물 배치는 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Commute from Hell rules — The Bloody Game X, day 4 death match (sliding car tiles)',
      description: 'The rules of Commute from Hell (지옥의 출근길) from The Bloody Game X: a 14×14 board with neutral cars and fixed structures, choosing start positions, cars sliding until blocked, the rule on neutral cars just moved, one-minute clocks and substitution, time-outs, and getting three cars out first.',
      keywords: ['Commute from Hell', 'Bloody Game X death match', 'sliding car puzzle', '피의 게임X'],
    },
    title: 'Commute from Hell — The Bloody Game X, day 4 death match',
    name: 'Commute from Hell (지옥의 출근길)',
    lead: 'A team race to get three of your four cars off a gridlocked board. Every car slides until something stops it.',
    summary: 'Slide car tiles until blocked and be the first team to get three of its cars off the board.',
    setup: [
      { type: 'list', items: [
        '**Players**: every member of the money challenge’s 4th and 5th teams; one player per team at the board at a time.',
        '**Board**: 14×14, with movable **neutral cars** and fixed **structures**.',
        '**Team cars**: four per team, on eight starting spaces in the centre.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Start positions', body: 'The better-ranked team chooses who goes first. The second team places three of the first team’s cars, the first team places its own last car, and the second team’s four fill the rest.' },
        { title: 'Line-up', body: 'Players come in a pre-submitted order and may not talk to waiting teammates.' },
        { title: 'Moving', body: 'Players alternate; each turn moves one tile, which **slides until blocked** by a car or structure.' },
        { title: 'Which cars', body: 'Your own team’s cars, or a neutral car **the opponent did not just move**. Never the other team’s cars.' },
        { title: 'Escape', body: 'A team car reaching the board’s edge escapes.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**First team to get three of its four cars out** wins; the other team is eliminated.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Each player has **one minute**, running only on their own turns; when it is gone, the next teammate takes over.',
        'Making no move passes the turn.',
        'Each team may call one **time-out**, when everyone may talk freely.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Everything turns on **sliding until blocked**: you cannot move one square, so stopping a car where you want needs a wall there.' },
      { type: 'cards', items: [
        { title: 'Neutral cars are walls and roads', body: 'Both sides can move them, to build a stopping wall for your car or to block an exit. The car the opponent just moved cannot be moved back at once, so their block can only be undone a move later.' },
        { title: 'Your car can block them', body: 'The opponent cannot move your cars, so one of yours parked in their path forces a detour. Only three of four need to escape, so sacrificing one as a roadblock is a plan.' },
        { title: 'The setup is half the game', body: 'The second team places three of the first team’s cars — the right to put them in the worst spots. In return the first team moves first and places its last car itself.' },
        { title: 'The team shares the clock', body: 'With one minute each, rapid play burns time and hands over to the next player, and nobody can coach. Who plays at the decisive moment matters; the time-out is the only moment everyone reads the board together.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Rush Hour', players: '1', alike: 'Slide cars back and forth in a jammed car park to clear an exit — commuter gridlock, as the name says.', differs: 'It is a solo puzzle and cars move any number of squares you like.' },
      { name: 'Ricochet Robots', players: '1+', alike: 'Robots slide until they hit a wall or another robot, and other robots serve as walls — the same movement.', differs: 'It is a race to find the fewest moves to a target.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The board’s layout is not reproduced.',
  },
};

export default game;
