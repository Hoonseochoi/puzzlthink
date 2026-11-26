import type { ShowGame } from '../types';
import { broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'sniper-holdem',
  kind: 'prison',
  when: { ko: '3일차', en: 'Day 3' },
  site: 'sniperHoldem',
  related: ['indianPoker', 'twoSidedPoker', 'hitStay'],
  updated: '2026-11-27',
  sources: [
    namuDay(3),
    { label: { ko: 'Yoshiki O, 「Devil’s Plan Season 2 Day 3 Prison Match “Sniper Hold’em” Analysis」 (Medium, 영어)', en: 'Yoshiki O, "Devil’s Plan Season 2 Day 3 Prison Match ‘Sniper Hold’em’ Analysis" (Medium)' }, url: 'https://medium.com/@yoshiki_o/devils-plan-season-2-day-3-prison-match-sniper-hold-em-analysis-fb81e75484b4' },
    { label: { ko: 'Scripted Murder, 「Sniper Hold’em」 규칙 정리 (팬 사이트, 영어)', en: 'Scripted Murder, "Sniper Hold’em" rules summary (fan site)' }, url: 'https://www.scriptedmurder.com/devils-plan/sniper-holdem' },
    broadcast,
  ],
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
        '**인원**: 셋째 날 감옥동 인원 전원(5명).',
        '**카드**: 1부터 10까지 숫자 카드 4세트(40장). 문양이 없어 플러시가 없고, 1이 가장 낮은 숫자예요(10-1-2-3-4는 스트레이트가 아니에요).',
        '**칩**: 각자 60개.',
        '**순서**: 카드를 뽑아 정하고, 선부터 시계 방향. 선은 라운드마다 한 자리씩 옮겨가요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '기본 베팅과 개인 카드', body: '라운드마다 칩 1개씩 걸고, 남에게 보이지 않는 개인 카드 2장을 받아요.' },
        { title: '공유 카드 2장 → 1차 베팅', body: '딜러가 공유 카드 2장을 공개하고 선부터 1차 베팅을 해요. 방송에서 체크(0칩)는 한 번도 나오지 않았고, 첫 사람은 최소 1칩을 걸거나 포기했어요. 모두 같은 칩을 걸면 끝나요.' },
        { title: '공유 카드 2장 더 → 2차 베팅', body: '공유 카드 2장을 더 공개하고 같은 방식으로 2차 베팅을 해요.' },
        { title: '저격', body: '개인 카드를 공개하기 전, 남은 사람이 선부터 차례로 원하는 족보 하나를 저격하거나 넘어갈 수 있어요. 족보 이름과 그 족보의 가장 높은 숫자를 함께 말해요(예: 4·5·6·7·8이면 "8 스트레이트", 7·7·5·5면 "7 투페어"). 풀하우스는 트리플의 숫자로 말해요. 자기 족보를 저격하는 것도 가능해요.' },
        { title: '승부', body: '모두 개인 카드를 공개해, 가장 높은 족보가 칩을 가져가요. **저격당한 족보는 최하위**가 되고, 그 족보를 가진 사람이 여럿이면 모두 최하위예요. 저격당한 족보끼리는 비교하지 않아요. 한 사람만 남기고 모두 포기하면 저격 없이 그 사람이 가져가요.' },
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
        '걸 수 있는 칩은 칩이 가장 적은 사람의 칩 수를 넘을 수 없어요. 그래서 상한까지 걸면 모두가 따라갈 수 있고, 1차 베팅에서 상한에 닿으면 2차 베팅 없이 저격으로 넘어가요.',
        '족보가 같으면 족보에 쓴 숫자가 높은 사람, 그것도 같으면 개인 카드의 높은 숫자, 그다음 다른 개인 카드 순서로 비교해요. 족보에 쓰이지 않은 개인 카드도 비교에 들어가요.',
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
    siteDiff: [
      { type: 'list', items: [
        '**기본 베팅이 점점 올라가요** (방송은 매 라운드 1칩): 처음 4라운드는 방송처럼 1칩, 5라운드 2칩 · 7라운드 3칩 · 9라운드 4칩 · 11라운드 6칩 · 13라운드 8칩, 그다음 2라운드마다 3칩씩 올라요(24칩 판은 0.4배, 최소 1칩). 1칩 고정이면 AI 5인전이 보통 30라운드를 넘고 길면 100라운드도 넘게 이어져서 정한 사이트 규칙이에요. 친구·공개방에서는 방장이 **방송 규칙(1칩 고정)**을 고를 수 있어요.',
        'PUZZLTHINK 스나이퍼 홀덤은 그 밖의 방송 규칙(40장 덱, 칩 60개, 공유 카드 2+2장, 체크 없는 두 번의 베팅과 상한, 저격 선언법, 동점·무승부 처리, 생존과 탈락)을 그대로 따라요.',
        '방송은 5명이지만 PUZZLTHINK에서는 **2~5명**으로 할 수 있어요. 인원이 달라도 같은 구조가 되도록 생존선을 시작 칩 × 인원 ÷ (인원 − 1)로 정해요(5명 75 · 4명 80 · 3명 90 · 2명 120). 친구 방에서는 빠른 판(시작 칩 24개)도 고를 수 있어요.',
        '생존자의 남는 칩은 직접 고르지 않고, 0칩인 사람에게 1개씩 먼저 준 뒤 칩이 적은 사람부터 고르게 나눠 줘요. 친구·공개방은 베팅과 저격마다 30초 제한이 있어요.',
      ] },
    ],
    sourceNote: '규칙의 원문은 방송 화면의 규칙서를 옮긴 정리(나무위키) 한 곳에 있고, 영어 분석 글과 팬 사이트의 정리로 주요 규칙을 한 번 더 확인했어요. 체크 금지, 저격을 넘어가기, 자기 족보 저격처럼 규칙서에 적혀 있지 않은 부분은 방송에 나온 라운드 기록으로 확인한 것만 적었어요.',
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
        '**Players**: everyone in prison on day 3 (five).',
        '**Cards**: four sets of 1 to 10 (40 cards). No suits, so no flush; 1 is the lowest number (10-1-2-3-4 is not a straight).',
        '**Chips**: 60 each.',
        '**Order**: drawn by cards; clockwise from the first player, who moves one seat every round.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Ante and private cards', body: 'Each round everyone antes a chip and receives two hidden private cards.' },
        { title: 'Two shared cards → bet 1', body: 'Two shared cards are revealed, then a betting round from the first player until bets are equal. Nobody ever checked on the show: the opener bet at least 1 or folded.' },
        { title: 'Two more → bet 2', body: 'Two more shared cards, then a second betting round.' },
        { title: 'Sniping', body: 'Before private cards are shown, each player still in may snipe one hand or pass, in turn from the first player, naming its type and top number ("8 straight" for 4-5-6-7-8, "7 two pair" for 7-7-5-5; a full house by its triple). Sniping your own hand is allowed.' },
        { title: 'Showdown', body: 'Private cards are revealed and the best hand wins the pot. **A sniped hand ranks last** — for everyone who holds it — and sniped hands are not compared with each other. If everyone else folds, the last player takes the pot with no snipes.' },
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
        'No bet may exceed the smallest stack, so everyone can always call; reaching that cap in bet 1 skips bet 2 and goes straight to the snipes.',
        'Equal hands compare the hand’s numbers, then the higher private card, then the other private card — private cards count even when they are not part of the hand.',
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
    siteDiff: [
      { type: 'list', items: [
        '**The ante rises** (the show kept it at 1): 1 chip for the first 4 rounds as on the show, then 2 from round 5, 3 from 7, 4 from 9, 6 from 11, 8 from 13, and 3 more every 2 rounds after that (×0.4 at 24 chips, never below 1). With a fixed 1-chip ante a five-player AI match often ran past 30 rounds and sometimes past 100, so this is a site rule. In friend and open rooms the host can pick **show rules (fixed 1-chip ante)**.',
        "Otherwise PUZZLTHINK's Sniper Hold'em follows the broadcast rules: the 40-card deck, 60 chips, 2 + 2 shared cards, two betting rounds with no checking and the cap, how snipes are called, ties and draws, safety and elimination.",
        'The show had 5 players; PUZZLTHINK plays with **2–5**. To keep the same structure the safety line is start × players ÷ (players − 1) (5 → 75, 4 → 80, 3 → 90, 2 → 120). Rooms can also pick a quick table with 24 starting chips.',
        'A survivor’s surplus is not handed out by choice: 1 to each 0-chip player first, then evenly, smaller stacks first. Friend and open rooms give 30 seconds per bet or snipe.',
      ] },
    ],
    sourceNote: 'The rule card itself is transcribed in one place (the Korean fan wiki); an English analysis and a fan rules summary confirm the main rules. Points the card does not state — no checking, passing on a snipe, sniping your own hand — are included only where the rounds shown on air confirm them.',
  },
};

export default game;
