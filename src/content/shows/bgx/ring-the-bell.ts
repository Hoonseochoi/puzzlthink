import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'ring-the-bell',
  kind: 'death',
  when: { ko: '5일차', en: 'Day 5' },
  related: ['hitStay', 'indianPoker', 'twoSidedPoker'],
  updated: '2026-11-26',
  sources: [namuDay('5'), broadcast],
  ko: {
    meta: {
      title: '링 더 벨 규칙 — 피의 게임X 5일차 데스매치, 카드를 바꾸다 종을 치는 팀전',
      description: '피의 게임X 5일차 팀 데스매치 링 더 벨의 규칙을 정리했어요. 4색 1–10 카드, 팀당 2명씩 4인 테이블, 카드 교환과 종 치기, 같은 숫자나 같은 색으로 만드는 조합, 가장 낮은 합의 라이프 손실, 종 친 사람의 추가 벌칙, 포카드 선언까지.',
      keywords: ['링 더 벨', '피의 게임X 링 더 벨', '피의게임X 데스매치', '카드 게임 종 치기', '피의게임X'],
    },
    title: '링 더 벨 — 피의 게임X 5일차 데스매치',
    name: '링 더 벨',
    lead: '카드를 한 장씩 바꾸며 패를 키우다, 이길 것 같을 때 종을 쳐요. 종을 쳤는데 꼴찌면 벌이 두 배예요.',
    summary: '카드를 바꿔 같은 숫자·같은 색 조합을 키우고, 적당한 때 종을 쳐 합이 가장 낮은 사람이 라이프를 잃는 2:2 팀 데스매치.',
    setup: [
      { type: 'list', items: [
        '**인원**: 두 팀. 라운드마다 팀별로 2명씩, 4명이 한 테이블에 앉아요. 2라운드까지 팀의 모든 사람이 적어도 한 번은 나와야 해요.',
        '**카드**: 네 가지 색, 색마다 1–10.',
        '**라이프**: 라운드마다 각자 3개.',
        '**라운드**: 3라운드(라운드마다 최대 9세트). 라운드 전에 전략 회의 시간이 있어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '세트 시작', body: '각자 4장을 받고, 나머지는 뒷면 더미로 쌓은 뒤 맨 위 한 장을 앞면으로 뒤집어 둬요. 1세트 선은 무작위, 그 뒤로는 직전 세트에서 종을 친 사람이 선이에요.' },
        { title: '카드 교환', body: '자기 차례에 뒷면 더미나 앞면 카드 중 한 장을 가져오고, 손의 카드 한 장을 앞면으로 버려요(가져온 카드를 바로 버려도 돼요). 버린 카드가 다음 사람의 앞면 카드가 돼요.' },
        { title: '종 치기', body: '교환 대신 종을 칠 수 있어요. 그러면 나머지 사람들이 차례대로 한 번씩 더 교환하고, 종을 친 사람부터 조합을 공개해요.' },
        { title: '조합', body: '1–4장을 골라 조합을 만들어요. 2장 이상이면 모두 **같은 숫자**이거나 **같은 색**이어야 해요. 조합의 숫자 합을 비교해요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '합이 **가장 낮은 사람이 라이프 1개**를 잃어요(동률이면 모두).',
        '세트가 끝났을 때 라이프를 모두 잃은 사람이 있으면, 그 사람의 팀이 그 라운드를 져요.',
        '**두 라운드를 먼저 이긴 팀**이 살아남고, 진 팀은 전원 탈락해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**종을 친 사람의 합이 가장 낮으면** 라이프를 하나 더 잃어요.',
        '**포카드 선언**: 자기 차례에 같은 숫자 4장이 모이면 선언하고 바로 종을 칠 수 있어요. 조합 비교 없이 상대 팀 두 명이 모두 라이프 1개를 잃어요.',
        '뒷면 더미가 다 떨어지면, 마지막 장을 가져간 사람의 다음 사람부터 바로 조합을 공개해요.',
        '두 팀에서 동시에 라이프를 모두 잃은 사람이 나오면, 마지막 세트에서 종을 친 사람의 팀이 이겨요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '링 더 벨은 **"언제 멈출까"의 게임**이에요. 종을 일찍 치면 상대가 패를 키울 시간이 줄지만, 내 패도 덜 큰 상태예요. 종을 친 사람만 꼴찌일 때 두 배로 잃는 규칙이 이 판단을 무겁게 만들어요.' },
      { type: 'cards', items: [
        { title: '같은 색이 같은 숫자보다 쉬워요', body: '한 색에 열 장, 한 숫자에 넉 장이라 같은 색 조합이 훨씬 모으기 쉬워요. 같은 색 4장이면 합이 30을 넘을 수도 있어요. 같은 숫자 조합은 높은 숫자일 때만 강하고, 대신 4장을 다 모으면 포카드로 상대 두 명을 동시에 때려요.' },
        { title: '앞면 카드는 정보예요', body: '누군가 버린 카드는 그 사람이 그 색이나 숫자를 모으지 않는다는 신호이고, 앞면 카드를 가져가면 무엇을 모으는지가 드러나요. 뒷면에서만 뽑으면 정보를 숨길 수 있지만, 원하는 카드를 얻을 확률은 낮아요.' },
        { title: '같은 팀이 바로 옆에', body: '팀원 두 명이 한 테이블에 있어서, 내가 버리는 카드가 팀원에게 가도록 앉는 순서와 버리는 카드를 맞출 수 있어요. 반대로 상대 팀 바로 앞자리라면 그 사람이 원하는 카드를 버리지 않는 것이 중요해요.' },
        { title: '라이프 3개의 분배', body: '팀원 중 한 명만 라이프가 바닥나도 팀이 지므로, 라이프가 적은 팀원을 보호하는 것이 우선이에요. 꼴찌가 될 것 같으면 상대가 더 낮을 때 종을 쳐 주거나, 종 치기를 늦춰 팀원이 패를 키울 시간을 버는 식의 협력이 필요해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '카보 (Cabo)', players: '2–4명', alike: '카드를 한 장씩 바꾸다 누군가 "카보"를 외치면 모두 한 번 더 하고 공개해요. 외친 사람이 이기지 못하면 벌점이 붙는 구조가 종 치기와 같아요.', differs: '카보는 합이 낮은 쪽이 이기고, 카드 일부가 뒤집혀 있어 기억이 중요해요.' },
      { name: '진 러미 (Gin Rummy)', players: '2명', alike: '버린 더미와 뒷면 더미에서 한 장 가져오고 한 장 버리며 같은 숫자·같은 무늬 조합을 만들고, 원할 때 "노크"로 끝내요.', differs: '진 러미는 조합에 안 들어간 카드의 점수가 적은 쪽이 이기고, 연속 숫자도 조합이 돼요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: 'Ring the Bell rules — The Bloody Game X, day 5 death match',
      description: 'The rules of Ring the Bell from The Bloody Game X (피의 게임X): four colours of 1–10, two players per team at a four-player table, drawing and discarding or ringing the bell, combinations of one number or one colour, losing lives for the lowest total, the bell-ringer’s extra penalty and four of a kind.',
      keywords: ['Ring the Bell', 'Bloody Game X death match', 'card game', '피의 게임X'],
    },
    title: 'Ring the Bell — The Bloody Game X, day 5 death match',
    name: 'Ring the Bell',
    lead: 'Swap cards one at a time to build your hand, and ring the bell when you think you are ahead. Ring and come last, and you pay double.',
    summary: 'A 2-vs-2 team death match: build same-number or same-colour sets and ring the bell; the lowest total loses a life.',
    setup: [
      { type: 'list', items: [
        '**Players**: two teams; each round two from each team sit at one table, and by round 2 every team member must have played.',
        '**Cards**: four colours, 1–10 each.',
        '**Lives**: three per player per round.',
        '**Rounds**: three (up to nine sets each), with strategy time before each.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'A set begins', body: 'Four cards each; the rest form a face-down pile with its top card turned up. The first set’s leader is random; afterwards whoever rang the bell leads.' },
        { title: 'Swap', body: 'Take the face-up card or the top of the pile and discard a card face up (possibly the one just taken); it becomes the next player’s face-up card.' },
        { title: 'Ring', body: 'Instead of swapping, ring the bell: everyone else swaps once more, then hands are shown starting with the ringer.' },
        { title: 'Sets', body: 'Use one to four cards; two or more must share **a number** or **a colour**. Totals are compared.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**The lowest total loses a life** (all tied lowest lose one).',
        'If a player has lost all lives at the end of a set, their team loses the round.',
        '**First team to two rounds** survives; the other team is eliminated.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**If the ringer has the lowest total**, they lose an extra life.',
        '**Four of a kind**: holding four of one number on your turn lets you declare and ring at once; without comparing, both opponents lose a life.',
        'If the face-down pile runs out, hands are shown immediately from the player after the one who took the last card.',
        'If players on both teams run out of lives at once, the team of the last ringer wins.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Ring the Bell is about **when to stop**. Ringing early gives opponents less time, but your hand is smaller too, and the double penalty for a losing ringer makes the call heavy.' },
      { type: 'cards', items: [
        { title: 'Colours beat numbers for building', body: 'Ten cards per colour against four per number make colour sets far easier; four of one colour can exceed 30. Number sets only pay with high numbers — but all four make a four of a kind that hits both opponents.' },
        { title: 'Face-up cards talk', body: 'A discard says someone is not collecting that colour or number; taking the face-up card shows what you are. Drawing blind hides information but rarely gets what you need.' },
        { title: 'Your teammate is at the table', body: 'Seating and discards can feed your teammate; if an opponent sits after you, never discard what they want.' },
        { title: 'Spreading three lives', body: 'One teammate running out loses the round, so protecting the weaker teammate comes first — ringing when an opponent is lower, or delaying to let a teammate improve.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Cabo', players: '2–4', alike: 'Swap cards until someone calls "Cabo", everyone takes one more turn, then hands are shown; a caller who does not win is penalised.', differs: 'The lowest total wins and some cards are face down, so memory matters.' },
      { name: 'Gin Rummy', players: '2', alike: 'Draw from the discard or the stock, discard one, build sets of a number or suit, and knock when ready.', differs: 'The winner has the fewest unmatched points, and runs also count.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
