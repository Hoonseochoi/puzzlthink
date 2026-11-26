import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'sniper-holdem',
  kind: 'prison',
  when: { ko: '3일차', en: 'Day 3' },
  related: ['indianPoker', 'twoSidedPoker', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuDay(3), broadcast],
  ko: {
    meta: {
      title: '저격 홀덤 규칙 — 데블스플랜2(데스룸) 3일차 감옥매치, 상대 족보를 저격하는 포커',
      description: '데블스 플랜: 데스룸(데블스플랜2) 3일차 감옥매치 저격 홀덤의 규칙을 정리했어요. 1–10 카드 4세트와 칩 60개, 공유 카드 4장, 두 번의 베팅, 족보와 저격 선언, 동점 처리, 칩 75개로 생존 확정하기까지.',
      keywords: ['저격 홀덤', '저격홀덤', '데블스플랜2 저격 홀덤', '데블스 플랜 데스룸 저격 홀덤', '데블스플랜2 감옥매치'],
    },
    title: '저격 홀덤 — 데블스플랜2 3일차 감옥매치',
    name: '저격 홀덤',
    lead: '포커처럼 족보로 겨루지만, 상대가 가졌을 족보를 정확히 맞혀 "저격"하면 그 족보는 꼴찌가 돼요.',
    summary: '공유 카드 4장으로 만드는 족보 대결에, 상대의 족보를 맞혀 무력화하는 저격을 더한 홀덤.',
    setup: [
      { type: 'list', items: [
        '**인원**: 셋째 날 감옥동 인원 전원.',
        '**카드**: 1부터 10까지 숫자 카드 4세트(40장).',
        '**칩**: 각자 60개.',
        '**순서**: 카드를 뽑아 정하고, 선부터 시계 방향.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '기본 베팅과 개인 카드', body: '라운드마다 칩 1개씩 걸고, 남에게 보이지 않는 개인 카드 2장을 받아요.' },
        { title: '공유 카드 2장 → 1차 베팅', body: '딜러가 공유 카드 2장을 공개하고 1차 베팅을 해요. 모두 같은 칩을 걸면 끝나요.' },
        { title: '공유 카드 2장 더 → 2차 베팅', body: '공유 카드 2장을 더 공개하고 같은 방식으로 2차 베팅을 해요.' },
        { title: '저격', body: '개인 카드를 공개하기 전, 선부터 차례로 원하는 족보 하나를 저격할 수 있어요. 족보 이름과 그 족보의 가장 높은 숫자를 함께 말해요(예: 4·5·6·7·8이면 "8 스트레이트"). 풀하우스는 트리플의 숫자로 말해요.' },
        { title: '승부', body: '모두 개인 카드를 공개해, 가장 높은 족보가 칩을 가져가요. **저격당한 족보는 최하위**가 돼요.' },
      ] },
      { type: 'table', head: ['족보 (높은 순)', '조건'], rows: [
        ['포카드', '같은 숫자 4장'],
        ['풀하우스', '트리플 + 페어'],
        ['스트레이트', '이어지는 숫자 5장'],
        ['트리플', '같은 숫자 3장'],
        ['투페어', '페어 두 쌍'],
        ['원페어', '같은 숫자 2장'],
        ['하이카드', '위 어느 것도 아님'],
      ], caption: '공유 카드 4장 + 개인 카드 2장으로 만드는 가장 좋은 조합' },
    ],
    win: [
      { type: 'list', items: [
        '게임 중 칩이 **75개 이상**이 되면 딜러에게 75개를 내고 **생존을 확정**해요. 남는 칩은 원하는 사람에게 나눠 주는데, 칩이 0개인 사람에게는 최소 1개를 줘야 해요.',
        '끝까지 생존을 확정하지 못하고 남은 한 명이 탈락해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '한 번에 걸 수 있는 칩은 칩이 가장 적은 사람의 칩 수를 넘을 수 없어요.',
        '족보가 같으면 족보에 쓴 숫자가 높은 사람, 그것도 같으면 개인 카드의 높은 숫자, 그다음 다른 개인 카드 순서로 비교해요.',
        '개인 카드까지 완전히 같거나 모든 족보가 저격당하면 무승부로, 칩을 똑같이 나누고 남는 칩은 베팅 순서가 빠른 사람부터 하나씩 가져가요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '저격 홀덤에서는 **강한 패가 곧 표적**이에요. 공유 카드가 4장이나 공개되므로, 공유 카드로 만들 수 있는 강한 족보는 모두가 짐작할 수 있고, 그 족보는 저격당하기 쉬워요.' },
      { type: 'cards', items: [
        { title: '저격의 기본은 "가장 그럴듯한 1등"', body: '공유 카드를 보고 누가 어떤 족보를 가졌을지 추리해, 내 패보다 위에 있을 가장 그럴듯한 족보를 저격해요. 베팅을 크게 올린 사람이 있다면 그 사람이 노리는 족보가 무엇인지가 힌트예요.' },
        { title: '두 번째로 강한 패가 유리할 수 있어요', body: '모두가 가장 강해 보이는 족보를 저격하면, 그 바로 아래 족보가 이겨요. 그래서 너무 뻔한 1등 족보보다, 저격을 피할 만큼 애매한 2등 족보로 베팅을 키우는 전략이 생겨요.' },
        { title: '75개 생존 규칙', body: '75개를 모으면 바로 빠질 수 있고, 남는 칩을 원하는 사람에게 줄 수 있어요. 그래서 먼저 살아남는 사람이 누구에게 칩을 주느냐가 나머지 사람들의 생존을 좌우하고, 연합의 이유가 돼요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '텍사스 홀덤 포커', players: '2–10명', alike: '개인 카드와 공유 카드를 합쳐 족보를 만들고, 여러 번의 베팅 라운드로 겨루는 바탕 규칙이에요.', differs: '홀덤은 공유 카드가 5장이고 문양(플러시)이 있으며, 저격 같은 상대 패 지목은 없어요.' },
      { name: '라이어스 다이스 (Liar’s Dice)', players: '2–6명', alike: '보이지 않는 상대의 패를 추리해, 정확히 맞히는 선언으로 판을 뒤집는 구조예요.', differs: '라이어스 다이스는 주사위 개수를 부르는 게임이고, 베팅 칩이 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Sniper Hold'em rules — The Devil's Plan 2 (Death Room), day 3 prison match",
      description: "The rules of Sniper Hold'em from The Devil's Plan: Death Room (season 2): four sets of 1–10 and 60 chips, four shared cards, two betting rounds, hand rankings and sniping, ties, and buying safety with 75 chips.",
      keywords: ["Sniper Hold'em", "Devil's Plan 2 Sniper Hold'em", "Devil's Plan Death Room prison match"],
    },
    title: "Sniper Hold'em — The Devil's Plan 2, day 3 prison match",
    name: "Sniper Hold'em",
    lead: 'Hands are ranked like poker — but name the exact hand someone holds, "snipe" it, and it drops to last.',
    summary: 'A hold’em with four shared cards where you can snipe the hand you think an opponent holds.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone in prison on day 3.',
        '**Cards**: four sets of 1 to 10 (40 cards).',
        '**Chips**: 60 each.',
        '**Order**: drawn by cards; clockwise from the first player.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Ante and private cards', body: 'Each round everyone antes a chip and receives two hidden private cards.' },
        { title: 'Two shared cards → bet 1', body: 'Two shared cards are revealed, then a betting round until bets are equal.' },
        { title: 'Two more → bet 2', body: 'Two more shared cards, then a second betting round.' },
        { title: 'Sniping', body: 'Before private cards are shown, each player in turn may snipe one hand, naming its type and top number ("8 straight" for 4-5-6-7-8; a full house by its triple).' },
        { title: 'Showdown', body: 'Private cards are revealed and the best hand wins the pot. **A sniped hand ranks last.**' },
      ] },
      { type: 'table', head: ['Hand (high to low)', 'Needs'], rows: [
        ['Four of a kind', 'Four of one number'],
        ['Full house', 'Three of a kind + a pair'],
        ['Straight', 'Five consecutive numbers'],
        ['Three of a kind', 'Three of one number'],
        ['Two pair', 'Two pairs'],
        ['One pair', 'Two of one number'],
        ['High card', 'None of the above'],
      ], caption: 'Best combination from four shared and two private cards' },
    ],
    win: [
      { type: 'list', items: [
        'Reaching **75 chips** lets you pay 75 to the dealer and **be safe**; you hand any extra to whoever you like, giving at least one to any player on zero.',
        'The last player not to reach safety is eliminated.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'No bet may exceed the smallest stack.',
        'Equal hands compare the hand’s numbers, then the higher private card, then the other private card.',
        'Identical private cards, or every hand sniped, is a draw: the pot is split and leftover chips go one each from the earliest bettor.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'In Sniper Hold’em **a strong hand is a target**. With four shared cards on view, the strong hands they allow are guessable — and so easy to snipe.' },
      { type: 'cards', items: [
        { title: 'Snipe the likeliest winner', body: 'Read the shared cards and snipe the most plausible hand above yours. Big raises hint at which hand someone is betting on.' },
        { title: 'Second best can be best', body: 'If everyone snipes the obvious top hand, the one just below wins. Betting up an ambiguous second-best hand that dodges snipes is a real strategy.' },
        { title: 'The 75-chip exit', body: 'Reaching 75 lets you leave and give away the surplus, so who the first survivor favours shapes everyone else’s survival — a reason for alliances.' },
      ], columns: 1 },
    ],
    similar: [
      { name: "Texas hold'em poker", players: '2–10', alike: 'Private and shared cards make a hand, over several betting rounds.', differs: 'There are five shared cards and suits (flushes), and no naming of an opponent’s hand.' },
      { name: "Liar's Dice", players: '2–6', alike: 'Deduce hidden holdings and turn the round with an exact call.', differs: 'It is about bidding dice counts, with no chips.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
