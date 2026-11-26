import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'doubt-and-bet',
  kind: 'main',
  when: { ko: '6일차 (준결승)', en: 'Day 6 (semifinal)' },
  related: ['piggyBank', 'indianPoker', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuDay(6), broadcast],
  ko: {
    meta: {
      title: '의심 베팅 규칙 — 데블스플랜2(데스룸) 6일차 메인매치, 색깔 카드 개수 선언과 의심',
      description: '데블스 플랜: 데스룸(데블스플랜2) 6일차 메인매치 의심 베팅의 규칙을 정리했어요. 다섯 색과 레인보우 카드 60장, 슬롯과 슬롯칩, 개수 선언과 인정·의심, 콜·레이즈·포기, 카드 공개 판정, 결승 직행 조건까지.',
      keywords: ['의심 베팅', '데블스플랜2 의심 베팅', '데블스 플랜 데스룸 의심 베팅', '데블스플랜2 메인매치', '데블스플랜2 준결승'],
    },
    title: '의심 베팅 — 데블스플랜2 6일차 메인매치',
    name: '의심 베팅',
    lead: '모두의 카드 중 특정 색이 몇 장인지 선언하고, 다음 사람은 믿거나 의심해요. 의심이 붙으면 베팅으로 이어져요.',
    summary: '모두의 슬롯에 깔린 카드 중 한 색의 개수를 선언하고, 인정하거나 의심해 칩을 거는 블러핑 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 여섯째 날 생존자 전원.',
        '**카드 60장**: 빨강·노랑·초록·파랑·보라·레인보우 각 10장.',
        '**지급품**: 각자 슬롯 5개와 슬롯칩 4개. 피스 1개로 슬롯 하나를 살 수 있지만, 최대 5개예요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '카드 받기', body: '라운드마다 각자 슬롯마다 카드 한 장씩을 받아요.' },
        { title: '선언', body: '선 플레이어가 3분 안에 "모두의 카드 중 ○색이 ○장 이상"을 1–20장 사이로 선언하고, 피스나 슬롯칩을 1개 이상 걸어요. 레인보우는 색으로 선언할 수 없고, 선언한 색으로 쳐요.' },
        { title: '인정', body: '다음 사람이 인정하면 앞사람은 건 것을 돌려받고, 인정한 사람이 새로 선언해요. 새 선언은 장수가 앞보다 많아야 하고, 색은 바꿔도 돼요.' },
        { title: '의심', body: '의심하면 의심한 사람부터 콜이나 레이즈를 해요. 선언한 사람은 레이즈에 콜·레이즈·포기로 답해요. 포기하면 남은 쪽이 판돈을 모두 가져가고, 카드는 공개하지 않아요.' },
        { title: '판정', body: '모두 같은 금액을 콜하면 카드를 전부 공개해요. 그 색과 레인보우를 합친 수가 선언보다 **적으면 의심한 사람**, **같거나 많으면 선언한 사람**이 판돈을 모두 가져가요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**3명이 남을 때까지** 계속해요.',
        '끝나면 남은 슬롯 하나당 피스 1개를 받아요. **피스가 가장 많은 1명은 결승에 직행**하고, 나머지 2명은 마지막 감옥 매치로 결승 진출자를 가려요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '슬롯칩을 잃으면 카드를 받는 슬롯이 하나씩 줄어요. 마지막 슬롯은 걸 수 없어요. 베팅으로 딴 슬롯칩은 피스 1개로 바꿔 쳐요.',
        '첫 라운드 선은 추첨, 그 뒤로는 의심에서 진 사람이 선이에요. 탈락자가 나오면 그 사람 바로 앞 사람이 다음 선이에요.',
        '15라운드부터는 5라운드마다 피스 1개를 내야 하고, 10라운드마다 추첨으로 자리와 순서를 바꿔요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '의심 베팅은 **라이어스 다이스를 카드와 베팅으로 옮긴** 게임이에요. 내 카드 몇 장만 보고 전체 카드의 분포를 추리해야 해요.' },
      { type: 'cards', items: [
        { title: '기댓값부터 계산하세요', body: '60장 중 한 색 10장과 레인보우 10장이 그 색으로 치므로, 아무 카드 한 장이 특정 색으로 셀 확률은 1/3이에요. 깔린 카드가 모두 15장이라면 한 색의 기대 장수는 5장 정도예요. 내 카드에 그 색이 많다면 조금 더 높게, 없다면 낮게 잡으면 돼요.' },
        { title: '슬롯이 곧 목숨이자 정보', body: '슬롯칩을 걸면 다음 라운드부터 받는 카드가 줄어요. 슬롯이 적을수록 정보가 줄고 선언의 근거가 약해져서, 지는 사람이 계속 지기 쉬운 구조예요.' },
        { title: '포기는 정보를 숨겨요', body: '포기하면 카드를 공개하지 않으므로, 내 선언이 블러핑이었는지 끝까지 드러나지 않아요. 판돈이 커지기 전에 포기하면 손해를 줄이면서 이미지도 지킬 수 있어요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '라이어스 다이스 (Liar’s Dice)', players: '2–6명', alike: '모두의 숨겨진 주사위 중 특정 눈이 몇 개인지 점점 높게 부르고, 의심하면 공개해 판정해요. 1이 와일드로 쓰이는 규칙이 레인보우 카드와 같아요.', differs: '라이어스 다이스는 칩 베팅이 없고, 지면 주사위를 하나씩 잃어요.' },
      { name: '스컬 (Skull)', players: '3–6명', alike: '보이지 않는 것에 대한 선언을 점점 올리고, 도전으로 확인하는 허세 게임이에요.', differs: '스컬은 내가 몇 장을 뒤집을 수 있는지 부르고 해골을 피해야 해요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Doubt and Bet rules — The Devil's Plan 2 (Death Room), day 6 main match",
      description: "The rules of Doubt and Bet from The Devil's Plan: Death Room (season 2): sixty cards in five colours plus rainbow, slots and slot chips, declaring counts and accepting or doubting, calling and raising, the reveal, and the direct place in the final.",
      keywords: ['Doubt and Bet', "Devil's Plan 2 Doubt and Bet", "Devil's Plan Death Room semifinal"],
    },
    title: "Doubt and Bet — The Devil's Plan 2, day 6 main match",
    name: 'Doubt and Bet',
    lead: 'Declare how many cards of a colour lie among everyone’s cards; the next player believes or doubts, and a doubt turns into a bet.',
    summary: 'Declare how many cards of one colour are out, then accept or doubt and bet on it.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone still in on day 6.',
        '**60 cards**: ten each of red, yellow, green, blue, purple and rainbow.',
        '**Each player**: five slots and four slot chips; a piece buys a slot, up to five.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Cards', body: 'Each round everyone gets one card per slot.' },
        { title: 'Declare', body: 'Within three minutes the first player declares "at least N cards of colour X among everyone’s" (1–20), betting at least one piece or slot chip. Rainbow cannot be declared and counts as the declared colour.' },
        { title: 'Accept', body: 'If the next player accepts, the declarer takes back their bet and the accepter declares anew — a higher count, any colour.' },
        { title: 'Doubt', body: 'A doubter calls or raises; the declarer answers a raise with call, raise or fold. A fold hands the pot to the other side without revealing cards.' },
        { title: 'Reveal', body: 'When everyone has called, all cards are shown. If that colour plus rainbows is **fewer** than declared, the doubter wins; **equal or more**, the declarer wins the pot.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Play continues **until three players remain**.',
        'Each remaining slot then gives a piece. **The player with the most pieces goes straight to the final**; the other two play the last prison match for the second place.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Losing slot chips removes slots, one each; the last slot cannot be bet. Slot chips won count as one piece each.',
        'Round 1’s first player is drawn; after that, whoever lost the doubt starts. When someone is eliminated, the player before them starts.',
        'From round 15, every five rounds costs a piece; every ten rounds seats and order are redrawn.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Doubt and Bet is **Liar’s Dice with cards and betting**: you reason about the whole spread from the few cards you can see.' },
      { type: 'cards', items: [
        { title: 'Start from the expectation', body: 'Ten cards of a colour plus ten rainbows count for it, so any card counts with probability one third. With 15 cards out, expect about five; adjust up if you hold several, down if you hold none.' },
        { title: 'Slots are life and information', body: 'Betting slot chips means fewer cards next round, so losers have less to go on and tend to keep losing.' },
        { title: 'Folding hides information', body: 'A fold reveals nothing, so nobody learns whether you bluffed. Folding before the pot grows limits losses and protects your image.' },
      ], columns: 1 },
    ],
    similar: [
      { name: "Liar's Dice", players: '2–6', alike: 'Bid ever-higher counts of a face among everyone’s hidden dice and reveal on a challenge; wild ones work like rainbow cards.', differs: 'There is no chip betting; losers lose dice.' },
      { name: 'Skull', players: '3–6', alike: 'Raise claims about what nobody can see and test them with a challenge.', differs: 'You bid how many discs you can flip while avoiding skulls.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
