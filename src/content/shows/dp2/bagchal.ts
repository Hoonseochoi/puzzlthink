import type { ShowGame } from '../types';
import { broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'bagchal',
  kind: 'final',
  when: { ko: '7일차 결승 2회전', en: 'Day 7, final game 2' },
  related: ['nineMensMorris', 'janggi', 'cardJanggi'],
  updated: '2026-11-26',
  sources: [
    namuDay(7),
    { label: { ko: '바그찰(Bagh-Chal) — 네팔 전통 보드게임 소개 (위키백과)', en: 'Bagh-Chal — the traditional Nepali board game (Wikipedia)' }, url: 'https://en.wikipedia.org/wiki/Bagh-Chal' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '바그찰 규칙 — 데블스플랜2(데스룸) 결승 2회전, 호랑이와 염소를 판 두 개로',
      description: '데블스 플랜: 데스룸(데블스플랜2) 결승 2회전 바그찰의 규칙을 정리했어요. 네팔 전통 게임 바그찰의 호랑이 4·염소 20, 배치와 이동, 뛰어넘어 잡기, 승리 조건, 그리고 방송의 판 두 개 동시 진행과 차례 순서까지.',
      keywords: ['바그찰', 'Bagh Chal', '데블스플랜2 바그찰', '데블스 플랜 데스룸 결승', '호랑이와 염소 게임'],
    },
    title: '바그찰 — 데블스플랜2 결승 2회전',
    name: '바그찰',
    lead: '호랑이 넷은 염소를 잡고, 염소 스물은 호랑이를 가둬요. 결승에서는 판 두 개에서 두 역할을 동시에 맡았어요.',
    summary: '네팔 전통 게임 바그찰을 판 두 개로 동시에 두는 결승 2회전. 한 판에서는 호랑이, 다른 판에서는 염소예요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 진출자 2명.',
        '**게임판**: 선으로 이어진 점 위에서 두는 바그찰 판. 결승에서는 **판 두 개**를 썼어요.',
        '**호랑이**: 말 4개, 판의 네 구석에서 시작해요.',
        '**염소**: 말 20개, 판 밖에서 시작해요.',
        '**역할**: 각자 자기 기준 왼쪽 판에서는 염소, 오른쪽 판에서는 호랑이를 맡아요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '염소 놓기', body: '염소가 먼저, 90초 안에 염소 말 하나를 판의 빈 점에 놓아요. 20개를 다 놓은 뒤부터는 염소 하나를 선을 따라 한 칸 옮겨요.' },
        { title: '호랑이 차례', body: '호랑이는 선을 따라 한 칸 옮기거나, 바로 옆 염소를 뛰어넘어 그 너머 빈 점으로 가며 그 염소를 잡아요.' },
        { title: '두 판 진행', body: '선공이 염소를 맡은 판에서 각자 한 번씩 두고, 후공이 염소를 맡은 판에서 각자 두 번씩 둔 뒤, 그다음부터는 판을 번갈아 가며 두 번씩 진행해요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**호랑이가 염소 5개를 잡으면** 호랑이를 맡은 사람이, **호랑이가 더 움직일 수 없으면** 염소를 맡은 사람이 그 판을 이겨요.',
        '결승에서는 **두 판 중 한 판이라도 끝나면** 게임이 끝나고, 그 판의 승자가 2회전을 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '경기 전 관전하던 탈락자 한 명과 30분 동안 연습할 수 있었고, 피스로 선후공이나 연습 상대를 먼저 고를 수 있었어요.',
        '호랑이는 한 번에 염소 하나만 뛰어넘어요. 염소 뒤가 비어 있지 않으면 잡을 수 없어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '바그찰은 **비대칭 게임**이에요. 호랑이는 힘이 세고 염소는 수가 많아요. 결승에서는 두 역할을 동시에 맡아서, 한 판의 공격과 다른 판의 수비를 함께 계산해야 해요.' },
      { type: 'cards', items: [
        { title: '염소의 원칙: 빈틈을 만들지 마세요', body: '호랑이는 염소 뒤가 비어 있을 때만 잡을 수 있어요. 염소는 서로 붙어서, 그리고 판의 가장자리와 구석부터 채워 뛰어넘을 공간을 주지 않는 것이 기본이에요. 20개를 다 놓기 전의 배치 단계가 가장 위험해요.' },
        { title: '호랑이의 원칙: 흩어져서 위협하세요', body: '호랑이 넷이 서로 다른 방향에서 위협하면, 염소는 한 번에 한 곳만 막을 수 있어요. 호랑이끼리 붙어 있으면 갇히기 쉬워요.' },
        { title: '두 판의 시간 배분', body: '한 판만 끝나도 결승 2회전이 정해지므로, 두 판 중 내가 더 유리한 판을 빨리 끝내는 쪽이 이겨요. 상대도 같은 계산을 하니, 내가 불리한 판에서는 최대한 오래 버티는 수가 필요해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '바그찰 (Bagh-Chal)', players: '2명', alike: '방송의 게임 그 자체예요. 네팔의 전통 보드게임으로, 호랑이 4마리와 염소 20마리가 겨뤄요.', differs: '전통 바그찰은 판 하나에서 한 사람은 호랑이, 다른 사람은 염소만 맡아요.' },
      { name: '여우와 거위 (Fox and Geese)', players: '2명', alike: '수가 적은 쪽(여우)은 뛰어넘어 잡고, 수가 많은 쪽(거위)은 가두는 비대칭 추격 게임이에요.', differs: '여우와 거위는 십자 모양 판에서 여우 한 마리로 하고, 거위는 처음부터 판 위에 있어요.' },
    ],
    sourceNote: '방송 규칙은 규칙서를 옮긴 정리(나무위키) 한 곳에서만 자세히 확인했어요. 호랑이·염소의 기본 규칙은 전통 바그찰 소개 자료와 맞춰 봤고, 두 판을 동시에 두는 방식은 방송만의 규칙이에요.',
  },
  en: {
    meta: {
      title: "Bagh-Chal rules — The Devil's Plan 2 (Death Room), final game 2",
      description: "The rules of Bagh-Chal as the second game of The Devil's Plan: Death Room (season 2) final: four tigers and twenty goats, placing and moving, capturing by jumping, how each side wins, and the show’s two simultaneous boards.",
      keywords: ['Bagh-Chal', 'Bagh Chal', "Devil's Plan 2 Bagh-Chal", "Devil's Plan Death Room final", 'tigers and goats game'],
    },
    title: "Bagh-Chal — The Devil's Plan 2, final game 2",
    name: 'Bagh-Chal',
    lead: 'Four tigers hunt goats; twenty goats try to trap the tigers. In the final, each finalist played both sides at once on two boards.',
    summary: 'The traditional Nepali game Bagh-Chal played on two boards at once: tiger on one, goats on the other.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two finalists.',
        '**Board**: the Bagh-Chal board of points joined by lines — **two of them** in the final.',
        '**Tigers**: four pieces, starting on the four corners.',
        '**Goats**: twenty pieces, starting off the board.',
        '**Roles**: each player is the goats on their left board and the tigers on their right.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Placing goats', body: 'Goats move first: within 90 seconds, place a goat on an empty point. Once all twenty are down, move one goat one step along a line.' },
        { title: 'Tigers', body: 'A tiger moves one step along a line, or jumps an adjacent goat to the empty point beyond, capturing it.' },
        { title: 'Two boards', body: 'Each takes one turn on the board where the first player has the goats, then two turns each on the other board, then the boards alternate two turns at a time.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**Five goats captured** wins for the tiger; **tigers unable to move** wins for the goats.',
        'In the final, **the game ends when either board ends**, and that board’s winner takes game 2.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Before the match each finalist could practise for 30 minutes with an eliminated spectator, and pieces bought the choice of turn order or first pick of practice partner.',
        'A tiger jumps one goat at a time, and only onto an empty point.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Bagh-Chal is **asymmetric**: tigers are strong, goats numerous. Playing both roles at once means weighing attack on one board against defence on the other.' },
      { type: 'cards', items: [
        { title: 'Goats: leave no gaps', body: 'Tigers only capture with an empty point behind a goat. Goats cluster and fill edges and corners first to deny landing points; the placing phase is the most dangerous.' },
        { title: 'Tigers: spread the threats', body: 'Tigers threatening from different directions overload goats that can block one place a turn; clustered tigers are easy to trap.' },
        { title: 'Splitting attention', body: 'One finished board decides the game, so finishing your stronger board fast wins — and on your weaker board you must last as long as possible.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Bagh-Chal', players: '2', alike: 'The show’s game itself: the traditional Nepali board game of four tigers against twenty goats.', differs: 'Traditionally one board, with one player as tigers and the other as goats.' },
      { name: 'Fox and Geese', players: '2', alike: 'An asymmetric hunt where the few capture by jumping and the many try to trap them.', differs: 'It uses a cross-shaped board, a single fox, and geese already on the board.' },
    ],
    sourceNote: 'The broadcast rules were found in detail in one written source only (the fan wiki). The basic tiger-and-goat rules were checked against descriptions of traditional Bagh-Chal; the two simultaneous boards are the show’s own rule.',
  },
};

export default game;
