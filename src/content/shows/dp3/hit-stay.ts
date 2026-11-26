import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'hit-stay',
  kind: 'main',
  when: { ko: '6일차 (준결승)', en: 'Day 6 (semifinal)' },
  site: 'hitStay',
  related: ['hitStay', 'indianPoker', 'twoSidedPoker'],
  updated: '2026-11-26',
  sources: [namuDay(6), siteEngine({ ko: 'HIT, STAY', en: 'Hit, Stay' }, 'src/lib/hitStay.ts'), broadcast],
  ko: {
    meta: {
      title: '힛스테이(HIT, STAY) 규칙 — 데블스플랜3 6일차 준결승 메인매치 정리',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 준결승 메인매치 HIT, STAY(힛스테이)의 규칙을 정리했어요. 숫자 카드 35장과 8면체 주사위 한계 숫자, 기본 베팅, 두 번의 베팅과 HIT·STAY, 승부 판정과 동점 처리, 칩 0개 탈락, 승부를 가르는 지점까지.',
      keywords: ['힛스테이', 'HIT STAY', 'Hit,Stay', '데블스플랜3 힛스테이', '데블스플랜3 준결승', '데블스 플랜 3 6일차', '힛스테이 규칙', '한계 숫자 게임'],
    },
    title: '힛스테이 (HIT, STAY) — 데블스플랜3 준결승 메인매치',
    name: 'HIT, STAY',
    lead: '주사위가 정한 한계 숫자에 카드 합을 가장 가깝게. 카드를 더 받을지(HIT) 멈출지(STAY), 그리고 얼마를 걸지 정하는 5인 베팅 게임이에요.',
    summary: '8면체 주사위가 정한 한계 숫자에 카드 합을 맞추며 칩을 거는 5인 베팅 게임. 마지막 한 명이 결승에 가요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 여섯째 날 생존자 5명.',
        '**숫자 카드 35장**: 7 한 장, 6 두 장, 5 세 장, 4 네 장, 3 다섯 장, 2 여섯 장, 1 일곱 장, −1 일곱 장.',
        '**칩**: 기본 30개. 가지고 있던 피스는 1개당 칩 1개로 모두 바꿔요.',
        '**주사위**: 5–12가 적힌 8면체 주사위(라운드의 한계 숫자).',
        '**순서**: 추첨 볼로 선 플레이어를 정하고 시계 방향으로 진행해요. 라운드마다 선 플레이어 왼쪽 사람이 새 선이 돼요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '기본 베팅', body: '라운드를 시작할 때 모두 칩 1개씩을 내요. 10라운드가 지날 때마다 기본 베팅이 1개씩 올라가요.' },
        { title: '한계 숫자', body: '딜러가 8면체 주사위를 굴려 이번 라운드의 한계 숫자(5–12)를 정해요. 카드 합이 이 숫자를 넘으면 안 돼요.' },
        { title: '카드 3장', body: '한 사람에 3장씩 뒷면으로 받고, 그중 1장을 골라 모두에게 공개해요.' },
        { title: '1차 베팅', body: '선 플레이어부터 콜·레이즈·포기 중 하나를 골라요. 모두가 건 칩 수가 같아지면 끝나요.' },
        { title: 'HIT 또는 STAY', body: '포기하지 않은 사람은 선 플레이어부터 HIT(카드 1장 더 받기, 받은 카드는 공개)나 STAY(그만 받기)를 골라요. 모두 STAY하거나 카드가 떨어질 때까지 반복해요.' },
        { title: '2차 베팅과 승부', body: '1차와 같은 방식으로 다시 건 뒤, 남은 사람이 카드를 모두 공개해요. 이긴 사람이 라운드의 칩을 전부 가져가요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '카드 합이 **한계 숫자를 넘지 않으면서 가장 가까운 사람**이 이겨요.',
        '합이 한계를 넘은 사람은 그 라운드의 최하위예요.',
        '**칩이 가장 먼저 0개가 된 사람이 탈락**하고, 나머지가 칩을 다 잃을 때까지 계속해요. **마지막까지 남은 한 명이 결승에 직행**하고, 탈락자를 뺀 나머지 세 명은 감옥 매치로 가요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '한 번에 걸 수 있는 칩은 **칩이 가장 적은 사람의 칩 수**를 넘을 수 없어요.',
        '합이 같으면 **카드가 더 많은 사람**이 이겨요. 카드 수까지 같으면 무승부예요.',
        '모두가 한계를 넘었다면 그 라운드는 무승부예요.',
        '무승부일 때는 무승부인 사람끼리 칩을 똑같이 나누고, 남는 칩은 선 플레이어에 가까운 쪽이 가져요.',
        '−1 카드는 합을 줄여 줘서, 한계를 넘을 뻔한 합을 되돌리는 데 쓰여요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '힛스테이는 블랙잭의 "넘으면 진다"에 포커의 베팅을 얹은 게임이에요. 그런데 결정적인 차이가 하나 있어요. **추가로 받은 카드는 공개**되기 때문에, 라운드가 진행될수록 각자의 합에 대한 정보가 쌓이고 베팅이 그 정보를 따라 움직여요.' },
      { type: 'cards', items: [
        { title: '덱의 구성을 외우세요', body: '35장 중 1과 −1이 14장, 즉 40%예요. 큰 숫자(5–7)는 6장뿐이라, 한계 숫자가 낮을 때는 HIT 한 번으로 넘을 위험이 생각보다 작고, 반대로 한계가 높을 때 큰 수를 기다리는 건 오래 걸려요. 공개된 카드를 빼고 남은 카드를 세면 HIT의 위험을 대략 계산할 수 있어요.' },
        { title: '카드 수 동점 규칙', body: '합이 같으면 카드가 많은 쪽이 이기므로, 1이나 −1을 받아 카드 수를 늘리는 HIT에도 가치가 있어요. 한계에 이미 맞춘 사람도 −1과 1을 연달아 받아 같은 합에 카드만 늘릴 수 있다는 점을 생각해야 해요.' },
        { title: '베팅 한도가 약자를 보호해요', body: '한 번에 걸 수 있는 칩이 가장 적은 사람의 칩 수로 묶여 있어서, 칩이 많은 사람도 한 판에 상대를 무너뜨리기 어려워요. 그래서 이 게임은 큰 판 한 번보다 작은 판을 꾸준히 이기는 쪽이 유리하고, 기본 베팅이 오르는 후반에야 칩 차이가 크게 벌어져요.' },
        { title: '포기도 전략이에요', body: '첫 공개 카드와 내 숨은 카드 두 장만 보고도, 이번 한계 숫자에서 내가 이길 가능성이 낮다는 걸 알 수 있어요. 기본 베팅만 잃고 빠지는 것이 끝까지 따라가 칩을 잃는 것보다 나은 경우가 많아요.' },
        { title: '지배 전략은 없어요', body: '카드 운이 크게 작용하고, 상대의 숨은 카드 두 장은 끝까지 보이지 않아요. 확률 계산은 기본이고, 그 위에 상대가 얼마나 공격적으로 거는 사람인지를 읽는 것이 승부를 나눠요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 힛스테이는 방송의 카드 구성(35장), 8면체 주사위 한계 숫자, 두 번의 베팅과 HIT·STAY, 판정과 동점 처리를 그대로 따라요.',
        '**기본 베팅이 오르는 속도가 달라요.** 방송은 10라운드마다 1개씩 오르지만, 사이트는 판이 너무 길어지지 않도록 16라운드까지 2라운드마다 1개씩, 그 뒤로는 2라운드마다 5개씩 올라가요.',
        '방송은 피스를 칩으로 바꿔 더했지만, 사이트에서는 모두 30개로 시작해요. 마지막 한 명이 이기면 끝나요.',
        'AI 4명과 5인전을 하거나, 친구·공개방에서 할 수 있어요.',
      ] },
    ],
    similar: [
      { name: '블랙잭', players: '2명 이상', alike: '카드 합을 기준에 가깝게 맞추되 넘으면 지는 "버스트" 구조와, 카드를 더 받을지(히트) 멈출지(스탠드) 고르는 방식이 같아요.', differs: '블랙잭은 기준이 21로 고정이고 딜러와 일대일로 겨뤄요. 플레이어끼리 서로 베팅을 올리지 않아요.' },
      { name: '텍사스 홀덤 포커', players: '2–10명', alike: '콜·레이즈·폴드로 이루어진 베팅 라운드가 두 번 있고, 공개 카드로 상대의 패를 추리해요.', differs: '홀덤은 족보로 승부하고 칩 한도는 각자의 스택이에요. 한계 숫자 같은 라운드마다 바뀌는 목표가 없어요.' },
      { name: '캔트 스톱 (Can’t Stop)', players: '2–4명', alike: '더 갈지 멈출지를 정하는 "욕심 조절(푸시 유어 럭)" 게임이에요.', differs: '캔트 스톱은 주사위로 길을 오르는 경주이고, 베팅이나 상대와의 직접 대결은 없어요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Hit, Stay rules — The Devil's Plan 3, day 6 semifinal main match",
      description: "The rules of Hit, Stay, the semifinal main match of The Devil's Plan: Dead Again (season 3): 35 number cards and an eight-sided limit die, antes, two betting rounds with HIT or STAY between them, showdown and ties, elimination at zero chips, and what decides it.",
      keywords: ['Hit Stay', 'Hit, Stay', "Devil's Plan 3 Hit Stay", "Devil's Plan semifinal", 'Hit Stay rules'],
    },
    title: "Hit, Stay — The Devil's Plan 3 semifinal main match",
    name: 'Hit, Stay',
    lead: 'Get your card total closest to the die’s limit: take another card (HIT) or stop (STAY), and decide how much to bet. A five-player betting game.',
    summary: 'Five players bet chips on getting their card total closest to a limit set by an eight-sided die; the last one standing reaches the final.',
    setup: [
      { type: 'list', items: [
        '**Players**: the 5 still in on day 6.',
        '**35 number cards**: one 7, two 6s, three 5s, four 4s, five 3s, six 2s, seven 1s and seven −1s.',
        '**Chips**: 30 each, plus one chip per piece held (all pieces are converted).',
        '**Die**: an eight-sided die numbered 5–12 (the round’s limit).',
        '**Order**: a drawn ball picks the first player; play is clockwise and the first player moves one seat left each round.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Ante', body: 'Everyone puts in one chip at the start of a round; the ante rises by one every ten rounds.' },
        { title: 'Limit', body: 'The dealer rolls the die to set the round’s limit (5–12). Your total must not exceed it.' },
        { title: 'Three cards', body: 'Everyone gets three cards face down and reveals one of them.' },
        { title: 'First betting round', body: 'From the first player: call, raise or fold, until all bets are equal.' },
        { title: 'HIT or STAY', body: 'Players still in choose, from the first player, HIT (one more card, dealt face up) or STAY. Repeat until everyone stays or the deck runs out.' },
        { title: 'Second betting round and showdown', body: 'Bet again as before; then everyone left reveals all their cards and the winner takes every chip bet this round.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**The total closest to the limit without going over** wins.',
        'Going over makes you last for the round.',
        '**The first player down to zero chips is eliminated**, and play continues until all but one have lost everything. **The last one standing goes straight to the final**; the other three go to the prison match.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'No bet may exceed **the chip count of the player with the fewest chips**.',
        'On equal totals, **more cards wins**; equal cards too is a draw.',
        'If everyone goes over, the round is a draw.',
        'In a draw, the drawn players split the pot equally and the remainder goes to the one nearest the first player.',
        'A −1 lowers your total, pulling back a hand about to go over.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Hit, Stay puts poker betting on top of blackjack’s bust rule, with one decisive twist: **extra cards are dealt face up**, so information about every total builds through the round and betting follows it.' },
      { type: 'cards', items: [
        { title: 'Know the deck', body: 'Fourteen of the 35 cards are 1 or −1 — 40%. Only six cards are 5 or higher, so with a low limit one HIT is less dangerous than it feels, and with a high limit waiting for big cards takes a while. Subtract the visible cards to estimate the risk of a HIT.' },
        { title: 'The card-count tie-break', body: 'Equal totals go to more cards, so a HIT for a 1 or −1 that just adds a card has value. Even a player already on the limit can add a −1 then a 1 and gain a card.' },
        { title: 'The bet cap protects the short stack', body: 'Bets are capped at the smallest stack, so a big stack cannot knock someone out in one hand. Winning many small pots beats one big one, and stacks only spread far once the ante climbs.' },
        { title: 'Folding is a strategy', body: 'Your shown card and two hidden ones are often enough to see this limit is not yours. Losing just the ante usually beats following to the end.' },
        { title: 'No dominant strategy', body: 'Card luck matters and two of every opponent’s cards stay hidden to the end. Probability is the baseline; reading how aggressively each player bets decides the rest.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Hit, Stay keeps the broadcast deck (35 cards), the eight-sided limit die, two betting rounds with HIT and STAY between them, and the showdown and tie rules.',
        '**The ante rises at a different pace.** On the show it went up by one every ten rounds; on the site, to keep games from dragging, it rises by one every two rounds up to round 16 and by five every two rounds after that.',
        'The show converted pieces into extra chips; on the site everyone starts with 30. The last player standing wins.',
        'Play a five-player game with four AIs, or with friends or an open room.',
      ] },
    ],
    similar: [
      { name: 'Blackjack', players: '2+', alike: 'Get a total near a target without going over, choosing to hit or stand.', differs: 'The target is always 21 and you play the dealer, not each other; players never raise each other.' },
      { name: "Texas hold'em poker", players: '2–10', alike: 'Two rounds of call, raise or fold, reading opponents from visible cards.', differs: 'Hands are ranked by poker combinations and each player can bet their whole stack; there is no changing limit.' },
      { name: "Can't Stop", players: '2–4', alike: 'A push-your-luck game about whether to keep going or stop.', differs: 'It is a dice race up columns, with no betting or head-to-head showdown.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
