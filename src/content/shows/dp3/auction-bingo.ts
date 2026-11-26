import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'auction-bingo',
  kind: 'main',
  when: { ko: '4일차', en: 'Day 4' },
  related: ['blackWhite2', 'pointOmok', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuDay(4), broadcast],
  ko: {
    meta: {
      title: '경매 빙고 규칙 — 데블스플랜3 4일차 메인매치, 코인 입찰로 빙고판 채우기',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 4일차 메인매치 경매 빙고의 규칙을 정리했어요. 3×3 빙고판과 동그라미·세모·별, 네임 티켓 7장, 쪼갤 수 없는 코인 10개, 도형 선택과 비공개 입찰, 낙찰과 비밀 처리, 자동 배치와 순위 기준까지.',
      keywords: ['경매 빙고', '경매빙고', '데블스플랜3 경매 빙고', '데블스 플랜 3 4일차', '데블스플랜3 메인매치', '경매 빙고 규칙'],
    },
    title: '경매 빙고 — 데블스플랜3 4일차 메인매치',
    name: '경매 빙고',
    lead: '빙고판에 필요한 도형을 경매로 사 오는 게임이에요. 무엇을 샀는지는 끝날 때까지 아무도, 심지어 나도 몰라요.',
    summary: '도형을 고르고 쪼갤 수 없는 코인으로 비공개 입찰해 3×3 빙고판을 채우는 7라운드 경매.',
    setup: [
      { type: 'list', items: [
        '**인원**: 넷째 날 생존자 7명과 게스트 1명. 게스트는 피스 1개를 들고 참가하고, 순위 정산에서는 빠져요.',
        '**빙고판**: 9칸(3×3). 칸마다 동그라미·세모·별 중 하나가 정해져 있고, 모두 같은 판을 써요.',
        '**네임 티켓**: 1인당 7장.',
        '**코인 10개**: 1원 3개, 2원 3개, 3원 2개, 5원 1개, 10원 1개(합 30원). 딜러룸에 보관하고, 큰 코인을 작은 코인으로 쪼개 쓸 수 없어요.',
      ] },
    ],
    flow: [
      { type: 'p', text: '모두 7라운드이고, 한 라운드는 **도형 선택 → 입찰 → 결과 발표**로 이루어져요.' },
      { type: 'steps', items: [
        { title: '도형 선택 (15분)', body: '네임 티켓 한 장을 동그라미·세모·별 상자 중 하나에 넣어요. 모두 넣고 나면 어느 도형에 몇 명이 몰렸는지가 공개돼요.' },
        { title: '입찰 (20분)', body: '딜러룸에서 1원 이상의 코인을 몰래 내요. 피스 1개를 1원으로 쓸 수 있어요. 낸 코인은 낙찰 여부와 상관없이 돌려받지 못해요.' },
        { title: '결과 발표', body: '도형마다 그 도형을 고른 사람 가운데 **가장 많이 낸 사람이 낙찰**되어, 그 도형을 고른 인원 수만큼 도형을 가져가요. 발표되는 건 도형별 낙찰가뿐이고, 누가 낙찰받았는지는 본인에게도 알려 주지 않아요. 게다가 낙찰가가 가장 높은 도형은 낙찰가마저 비밀이에요.' },
      ] },
      { type: 'h3', text: '마지막 배치' },
      { type: 'p', text: '7라운드가 끝나면 각자 얻은 도형을 공개해요. 판에 놓을 자리가 없는 도형은 버리고, 나머지는 **빙고 줄이 가장 많아지도록 자동으로** 배치해요.' },
    ],
    win: [
      { type: 'list', items: [
        '순위는 **빙고 줄 수 → 채운 칸 수 → 남은 코인** 순서로 비교해요.',
        '**1–2위는 생활동, 3–6위는 감옥동, 7위는 탈락**이에요. 1위는 연맹의 징표를 받아요.',
        '빙고판 9칸을 모두 채우면 피스 4개를 받아요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '어느 라운드든 1원 이상을 내지 못하면 그 자리에서 최하위가 돼요. 코인을 다 쓰면 피스가 있어야만 버틸 수 있어요.',
        '최고액이 같으면 동률인 사람이 모두 낙찰되고, 그 도형을 똑같이 나눈 뒤 나머지는 버려요.',
        '게스트에게는 "메인 매치 1위"와 "빙고판 모두 채우기" 두 미션이 따로 있었어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '경매 빙고는 **30원으로 7라운드를 버티는 예산 게임**이에요. 매 라운드 최소 1원은 내야 하니 실제로 쓸 수 있는 여유는 더 적고, 코인을 쪼갤 수 없어서 10원짜리 한 개를 내면 그 라운드에 10원을 다 써야 해요.' },
      { type: 'cards', items: [
        { title: '빙고판의 모양을 먼저 보세요', body: '9칸에는 도형이 정해져 있어서, 줄 하나를 완성하려면 특정 도형 조합이 필요해요. 어떤 도형이 몇 칸인지, 어떤 줄이 같은 도형으로 많이 이루어져 있는지를 보면 내게 꼭 필요한 도형과 없어도 되는 도형이 갈려요.' },
        { title: '몰리는 도형은 비싸지만 많이 줘요', body: '낙찰자는 그 도형을 고른 인원 수만큼 가져가요. 여러 명이 몰린 도형은 경쟁이 심하지만, 이기면 한 번에 여러 칸을 채울 수 있어요. 혼자 고른 도형은 1원만 내도 낙찰되지만 한 개뿐이에요.' },
        { title: '모르는 상태로 끝까지', body: '내가 낙찰받았는지조차 알려 주지 않으므로, 낙찰가를 보고 거꾸로 추리해야 해요. 내가 낸 금액과 발표된 낙찰가가 같으면 낙찰됐을 가능성이 높지만, 같은 금액을 낸 사람이 또 있을 수도 있어요. 가장 비싼 도형은 낙찰가도 비밀이라 더 헷갈려요.' },
        { title: '남은 코인이 동점 처리 기준', body: '빙고 줄과 채운 칸이 같으면 남은 코인이 많은 쪽이 이겨요. 그래서 마지막 라운드까지 코인을 아끼는 사람과 먼저 칸을 확보하는 사람 사이의 선택이 생겨요.' },
        { title: '지배 전략은 없어요', body: '최적의 입찰은 다른 사람의 남은 코인과 필요한 도형에 달려 있어요. 공개되는 정보(도형별 인원, 낙찰가)를 기록해 각자의 남은 예산을 추정하는 사람이 다음 라운드의 낙찰가를 가장 잘 예측해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '라 (Ra)', players: '2–5명', alike: '정해진 숫자 토큰으로만 입찰해 금액을 쪼갤 수 없고, 한 번 쓴 토큰이 이후 입찰력을 바꾸는 경매 게임이에요.', differs: '라는 공개 경매이고 이긴 사람이 낸 토큰이 다음 경매에 나와요. 경매 빙고는 비공개 입찰이고 낸 코인은 사라져요.' },
      { name: '포 세일 (For Sale)', players: '3–6명', alike: '한정된 돈으로 여러 라운드를 버티며, 언제 많이 쓰고 언제 아낄지가 핵심이에요.', differs: '포 세일은 공개 입찰로 건물을 사고, 후반에 건물을 팔아 수표로 점수를 내요.' },
      { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '같은 종류를 누가 얼마나 모으느냐에 따라 가치가 달라지는 경매 게임이에요.', differs: '모던 아트는 플레이어가 경매인이 되어 그림을 팔고, 경매 방식도 여러 가지예요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Auction Bingo rules — The Devil's Plan 3, day 4 main match",
      description: "The rules of Auction Bingo from The Devil's Plan: Dead Again (season 3): a 3×3 board of circles, triangles and stars, seven name tickets, ten coins that cannot be split, choosing shapes and sealed bids, hidden results, automatic placement and the ranking order.",
      keywords: ['Auction Bingo', "Devil's Plan 3 Auction Bingo", "Devil's Plan main match", 'auction bingo rules'],
    },
    title: "Auction Bingo — The Devil's Plan 3, day 4 main match",
    name: 'Auction Bingo',
    lead: 'Buy the shapes your bingo board needs at auction — and nobody, not even you, knows what you bought until the end.',
    summary: 'Choose a shape, bid sealed with coins that cannot be split, and fill a 3×3 bingo board over seven rounds.',
    setup: [
      { type: 'list', items: [
        '**Players**: the 7 still in on day 4, plus one guest who brings a piece and is left out of the ranking.',
        '**Board**: nine cells (3×3), each marked circle, triangle or star; everyone has the same board.',
        '**Name tickets**: 7 each.',
        '**Ten coins**: three ₩1, three ₩2, two ₩3, one ₩5, one ₩10 (₩30 in all), kept in the dealer room. A coin cannot be broken into smaller ones.',
      ] },
    ],
    flow: [
      { type: 'p', text: 'Seven rounds, each made of **choosing a shape → bidding → results**.' },
      { type: 'steps', items: [
        { title: 'Choose (15 minutes)', body: 'Put one name ticket into the circle, triangle or star box. Then the number of tickets per shape is revealed.' },
        { title: 'Bid (20 minutes)', body: 'In the dealer room, hand in ₩1 or more in coins, secretly. A piece counts as ₩1. Coins bid are gone whether you win or not.' },
        { title: 'Results', body: 'For each shape, **the highest bidder among those who chose it wins** as many of that shape as players chose it. Only each shape’s winning price is announced — not who won, even to the winner — and the most expensive shape’s price is kept secret too.' },
      ] },
      { type: 'h3', text: 'Final placement' },
      { type: 'p', text: 'After round 7 everyone’s shapes are revealed. Shapes with no free cell are discarded and the rest are placed **automatically to make as many bingo lines as possible**.' },
    ],
    win: [
      { type: 'list', items: [
        'Ranking goes by **bingo lines → cells filled → coins left**.',
        '**Places 1–2 go to the living quarters, 3–6 to prison, and 7th is eliminated.** First place gets the Alliance token.',
        'Filling all nine cells earns 4 pieces.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Failing to bid at least ₩1 in any round makes you last on the spot; once your coins are gone, only pieces keep you going.',
        'Tied top bids all win; the shapes are shared equally and the remainder discarded.',
        'The guest had two missions of their own: finish first, and fill the whole board.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Auction Bingo is **a budget game: ₩30 to last seven rounds**. Every round costs at least ₩1, so the real slack is smaller, and since coins cannot be split, playing the ₩10 coin spends all ten.' },
      { type: 'cards', items: [
        { title: 'Read the board first', body: 'Each cell’s shape is fixed, so a line needs a particular mix. Counting how many cells each shape has and which lines share shapes tells you which shapes you need and which you can skip.' },
        { title: 'Crowded shapes cost more but pay more', body: 'The winner takes as many shapes as people who chose that box. A crowded shape is contested but fills several cells at once; a shape you chose alone goes for ₩1 but gives one.' },
        { title: 'Playing blind', body: 'You are not told whether you won, so you work it out backwards from the prices. If the announced price equals your bid you probably won — unless someone tied. The top shape’s hidden price makes it murkier.' },
        { title: 'Coins left break ties', body: 'With equal lines and cells, more coins left wins, so there is a real choice between saving coins and securing cells early.' },
        { title: 'No dominant strategy', body: 'The best bid depends on others’ remaining coins and needs. Whoever records the public information (choices per shape, prices) and estimates everyone’s budget predicts the next prices best.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Ra', players: '2–5', alike: 'You bid only with fixed-value tokens that cannot be split, and each token you spend changes your future bidding power.', differs: 'Auctions are open and the winning token comes back into play; in Auction Bingo bids are sealed and coins are gone.' },
      { name: 'For Sale', players: '3–6', alike: 'Limited money over several rounds; the skill is knowing when to spend and when to save.', differs: 'Bids are open, and later you sell the properties you bought for cheques.' },
      { name: 'Modern Art', players: '3–5', alike: 'An auction game where a kind’s value depends on how many of it are collected.', differs: 'Players act as auctioneers selling paintings, with several auction formats.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
