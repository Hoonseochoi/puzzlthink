import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'treasure-island',
  kind: 'main',
  when: { ko: '4일차', en: 'Day 4' },
  related: ['monorail', 'colorLinkDuel', 'onestroke'],
  updated: '2026-11-26',
  sources: [namuDay(4), broadcast],
  ko: {
    meta: {
      title: '보물섬 규칙 — 데블스플랜2(데스룸) 4일차 메인매치, 화살표로 상자 열기',
      description: '데블스 플랜: 데스룸(데블스플랜2) 4일차 메인매치 보물섬의 규칙을 정리했어요. 9×9 게임판과 숨겨진 상자 10개, 경매 칩 20개로 사는 화살표, 경매 라운드와 탐색 라운드, 화살표 연결 규칙, 상자 승점과 피스 증감까지.',
      keywords: ['보물섬', '데블스플랜2 보물섬', '데블스 플랜 데스룸 보물섬', '데블스플랜2 메인매치', '보물섬 규칙'],
    },
    title: '보물섬 — 데블스플랜2 4일차 메인매치',
    name: '보물섬',
    lead: '경매로 화살표를 사 모으고, 화살표를 이어 붙여 섬 곳곳의 상자를 열어요. 단서를 모아 진짜 보물 상자를 찾아야 해요.',
    summary: '경매로 산 화살표를 이어 길을 만들어 숨겨진 상자를 열고, 단서로 보물 상자를 찾는 탐색 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 넷째 날 생존자 전원.',
        '**게임판**: 9×9 칸. 땅 칸, 물 칸, 울타리, 벽으로 이루어져 있어요.',
        '**상자**: 땅 칸 10곳에 숨겨져 있어요. 하나는 보물 상자이고, 나머지 아홉은 보물 상자에 대한 단서와 승점이 들어 있어요.',
        '**지급품**: 경매 칩 20개(경매 부스에 보관, 양도 불가)와 기본 화살표 1개.',
      ] },
    ],
    flow: [
      { type: 'p', text: '모두 9라운드예요. **1·2·3·5·7라운드는 화살표 경매**, **4·6·8·9라운드는 탐색**이에요.' },
      { type: 'steps', items: [
        { title: '화살표 경매', body: '라운드마다 화살표 11–13개가 매물로 나와요. 각자 경매 부스에서 칩을 1개 이상 몰래 내고, 많이 낸 사람부터 원하는 화살표를 골라 가져가요.' },
        { title: '탐색 (40분)', body: '라운드 동안 딜러룸에 한 번, 최대 3분 들어가 내 화살표를 판에 놓아 길을 만들어요.' },
        { title: '화살표 잇기', body: '첫 화살표는 스타트 지점에서 시작해요. 화살표의 빨간 점이 판의 빨간 점과 맞닿게 놓고, 끝도 빨간 점에 닿아야 해요. 끝에 새 화살표를 몇 개든 이어 붙일 수 있지만, 시작점과 끝점 말고는 화살표끼리 닿으면 안 돼요.' },
        { title: '상자 열기', body: '화살표가 상자에 닿으면 그 상자를 열 수 있어요(그냥 지나가도 돼요). 상자를 연 화살표들은 그 라운드 동안 회수되고, 남은 화살표로 스타트부터 다시 다른 상자를 찾을 수 있어요. 회수된 화살표는 다음 라운드에 돌려받아요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '탐색 라운드가 끝나면, 상자를 **처음으로 연 사람들**이 그 상자의 승점(색에 따라 5·8·12·15점)을 받아요. 한 번 열린 상자는 그 뒤로 5점이에요.',
        '9라운드가 끝나거나 **누군가 보물 상자를 찾으면** 게임이 끝나요. 보물 상자를 연 사람은 특별한 피스 보상을 받아요(내용은 열었을 때 공개돼요).',
        '끝날 때 승점에 따라 피스가 늘거나 줄어요. 31점 이상은 +1, 41점 이상은 +2, 20점 이하는 −1이고, 점수가 더 낮으면 −2예요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '경매에서 같은 칩을 내면 피스가 많은 사람이 먼저, 그것도 같으면 추첨이에요.',
        '화살표는 주거나 바꿀 수 없지만, 합의하면 한 개까지 빌려 쓸 수 있어요. 화살표를 부수거나 변형하면 안 돼요.',
        '이미 연 상자는 다시 열 수 없어요. 피스 1개로 상자의 단서를 볼 수는 있지만, 그 상자의 승점은 받지 못해요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '보물섬은 **길 만들기 퍼즐, 경매, 추리**가 겹친 게임이에요. 좋은 화살표가 있어야 먼 상자에 닿고, 상자를 열어야 단서가 모이며, 단서가 있어야 보물 상자를 찾아요.' },
      { type: 'cards', items: [
        { title: '화살표는 모양이 전부', body: '화살표끼리 닿으면 안 되고 끝이 빨간 점에 맞아야 하므로, 길이가 길다고 늘 좋은 건 아니에요. 지형(물, 울타리, 벽)을 돌아갈 수 있는 모양을 갖추는 것이 중요해서, 경매에서 어떤 화살표를 먼저 고르느냐가 탐색 결과를 정해요.' },
        { title: '먼저 여는 사람이 큰 점수', body: '같은 탐색 라운드에 처음 연 사람들은 모두 원래 점수를 받지만, 그다음부터는 5점뿐이에요. 높은 점수의 상자는 모두가 노리므로, 첫 탐색 라운드에 닿을 수 있는 화살표를 확보하는 것이 경매의 목표예요.' },
        { title: '단서는 공유될 수 있어요', body: '상자를 연 사람만 단서를 보지만, 그 내용을 말로 나눌 수 있어요. 거짓말도 허용되므로, 단서를 공유해 협력할지, 혼자 보물을 노릴지가 갈려요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '보물섬 (Treasure Island, 2018)', players: '2–5명', alike: '섬 지도 위에서 숨겨진 보물의 위치를 단서와 탐색으로 좁혀 가는 게임이에요.', differs: '이 보드게임은 한 사람이 보물을 숨긴 해적 역할을 하고, 나머지가 지도에 직접 탐색 범위를 그려요.' },
      { name: '쓰루 (Tsuro)', players: '2–8명', alike: '길 타일을 이어 붙여 경로를 만들고, 경로의 모양이 어디에 닿을지를 정해요.', differs: '쓰루는 경로가 서로 부딪히면 탈락하는 생존 게임이고, 경매나 추리는 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 정리 자료에는 가장 낮은 점수 구간이 "10점 이상 −2"로 적혀 있어 앞 구간과 맞지 않아요. 그래서 이 페이지에서는 "더 낮으면 −2"라고만 적었어요.',
  },
  en: {
    meta: {
      title: "Treasure Island rules — The Devil's Plan 2 (Death Room), day 4 main match",
      description: "The rules of Treasure Island from The Devil's Plan: Death Room (season 2): a 9×9 board with ten hidden chests, arrows bought with 20 auction chips, auction and search rounds, how arrows connect, chest points and piece rewards.",
      keywords: ['Treasure Island', "Devil's Plan 2 Treasure Island", "Devil's Plan Death Room main match"],
    },
    title: "Treasure Island — The Devil's Plan 2, day 4 main match",
    name: 'Treasure Island',
    lead: 'Buy arrows at auction, chain them across the island to open hidden chests, and use the clues to find the real treasure.',
    summary: 'Chain auctioned arrows into paths to open hidden chests, and follow the clues to the treasure chest.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone still in on day 4.',
        '**Board**: 9×9 cells of land, water, fences and walls.',
        '**Chests**: hidden on ten land cells — one treasure chest and nine holding clues to it and points.',
        '**Each player**: 20 auction chips (kept in the auction booth, not transferable) and one basic arrow.',
      ] },
    ],
    flow: [
      { type: 'p', text: 'Nine rounds: **rounds 1, 2, 3, 5 and 7 are arrow auctions**, **4, 6, 8 and 9 are searches**.' },
      { type: 'steps', items: [
        { title: 'Arrow auction', body: '11–13 arrows are offered. Everyone secretly bids at least one chip; highest bidders pick first.' },
        { title: 'Search (40 minutes)', body: 'Each player may enter the dealer room once, for up to three minutes, to lay arrows on the board.' },
        { title: 'Connecting arrows', body: 'The first arrow starts at the start point. Each arrow’s red dot must meet a red dot on the board, and so must its tip. Any number of arrows may be chained, but arrows may touch only at their ends.' },
        { title: 'Opening chests', body: 'An arrow touching a chest may open it (or pass by). Arrows used to open a chest are withdrawn for the round; remaining arrows can start again from the start point. They return next round.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After a search round, **the first players to open a chest** score its points (5, 8, 12 or 15 by colour); afterwards it is worth 5.',
        'The game ends after round 9 or **when someone finds the treasure chest**, whose opener gets a special piece reward revealed on opening.',
        'Final points adjust pieces: 31+ gains one, 41+ gains two, 20 or less loses one, and lower still loses two.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Equal bids go to more pieces, then to a draw.',
        'Arrows cannot be given or traded, but one may be borrowed by agreement; breaking or bending arrows is forbidden.',
        'You cannot reopen a chest. A piece shows a chest’s clue, but forfeits its points.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Treasure Island layers **a path puzzle, an auction and a deduction**: good arrows reach distant chests, chests give clues, and clues find the treasure.' },
      { type: 'cards', items: [
        { title: 'Shape is everything', body: 'Arrows may not touch and must end on red dots, so longer is not always better. Shapes that bend around water, fences and walls decide what you can reach — which arrow you pick first in the auction decides the search.' },
        { title: 'First openers score big', body: 'Everyone who opens a chest first in the same search scores its full value; later openers get 5. Securing arrows that reach high-value chests in the first search is the auction’s aim.' },
        { title: 'Clues can be shared', body: 'Only the opener sees a clue, but may tell others — truthfully or not. Whether to cooperate or hunt the treasure alone is the choice.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Treasure Island (2018)', players: '2–5', alike: 'Narrow down a hidden treasure on an island map from clues and searches.', differs: 'One player is the pirate who hid it; the others draw their search areas on the map.' },
      { name: 'Tsuro', players: '2–8', alike: 'Lay path tiles and let the path’s shape decide where it leads.', differs: 'Paths colliding knocks players out; there is no auction or deduction.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The source lists the lowest band as "10 or more: −2", which contradicts the band above it, so this page only says "lower still loses two".',
  },
};

export default game;
