import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'choice-holdem',
  kind: 'final',
  when: { ko: '9일차 파이널', en: 'Day 9, final' },
  related: ['indianPoker', 'twoSidedPoker', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuDay('9'), broadcast],
  ko: {
    meta: {
      title: '초이스 홀덤 규칙 — 피의 게임X 파이널, 내가 나누고 네가 고르는 홀덤',
      description: '피의 게임X 파이널 초이스 홀덤의 규칙을 정리했어요. 1–5 카드 4세트, 칩 20개와 기본 베팅, 공유 카드 3장과 개인 카드 1장, 1차 베팅, 한 장은 앞면·한 장은 뒷면으로 내놓는 카드 선택, 2차 베팅, 족보와 동점 이월까지.',
      keywords: ['초이스 홀덤', '피의 게임X 초이스 홀덤', '피의게임X 파이널', '홀덤 변형', '피의게임X'],
    },
    title: '초이스 홀덤 — 피의 게임X 파이널',
    name: '초이스 홀덤',
    lead: '선이 두 장을 받아 한 장은 앞면, 한 장은 뒷면으로 내놓으면, 상대가 그중 하나를 골라 가져가요.',
    summary: '1–5 카드 20장으로 하는 1:1 홀덤. 두 번째 개인 카드는 선이 나누고 후가 골라요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1(4인 토너먼트 결승의 한 경기).',
        '**카드**: 1–5 숫자 카드 4세트, 20장.',
        '**칩**: 각자 20개.',
        '**선후공**: 세미파이널 순위가 높았던 사람이 정하고, 라운드마다 바뀌어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '기본 베팅', body: '라운드마다 칩 1개씩 내요. 10라운드마다 1개씩 늘어나요.' },
        { title: '카드', body: '각자 개인 카드 1장을 받고, 공유 카드 3장이 앞면으로 공개돼요.' },
        { title: '1차 베팅', body: '선부터 콜, 레이즈, 폴드 중 하나를 해요. 폴드하면 카드는 공개되지 않고 판돈은 상대가 가져가요.' },
        { title: '카드 선택', body: '선이 카드 2장을 받아 보고, **한 장은 앞면, 한 장은 뒷면**으로 내놓아요. 후가 둘 중 하나를 가져가고, 남은 한 장은 선이 가져가요.' },
        { title: '2차 베팅과 승부', body: '같은 방식으로 다시 건 뒤, 개인 카드 2장과 공유 카드 3장으로 더 높은 조합을 만든 쪽이 판돈을 모두 가져가요.' },
      ] },
      { type: 'table', head: ['조합 (높은 순)', '조건'], rows: [
        ['포카드', '같은 숫자 4장'],
        ['풀하우스', '같은 숫자 3장 + 2장'],
        ['스트레이트', '1–5가 모두 있음'],
        ['트리플', '같은 숫자 3장'],
        ['투페어', '같은 숫자 2장씩 두 쌍'],
        ['원페어', '같은 숫자 2장'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '상대가 기본 베팅을 낼 칩이 없어지면 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '조합이 같으면 더 높은 숫자로 된 조합이, 그것도 같으면 조합에 안 쓰인 개인 카드가 높은 쪽이 이겨요.',
        '모든 것이 같으면 판돈을 그대로 두고 다음 라운드로 넘어가요. 이때는 선이 바뀌지 않고 추가 기본 베팅도 없어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '초이스 홀덤의 중심은 **"나누는 사람과 고르는 사람"**이에요. 케이크를 한 사람이 자르고 다른 사람이 고르는 공정 분배 문제를 카드에 옮긴 구조예요.' },
      { type: 'cards', items: [
        { title: '선의 딜레마: 무엇을 보여 줄까', body: '선은 두 장을 다 보고 하나를 공개해요. 좋은 카드를 앞면으로 두면 후가 가져가 버리고, 뒷면에 숨기면 후는 "앞면이 이렇게 약한데 뒷면은 좋은 카드겠지"라고 읽을 수 있어요. 결국 선은 두 장 중 어느 쪽을 상대가 가져가도 크게 손해 보지 않도록, 혹은 상대가 잘못 고르도록 배치해야 해요.' },
        { title: '덱이 작아서 셀 수 있어요', body: '숫자가 1–5뿐이고 장마다 넉 장이라, 공유 카드 3장과 내 카드 1장만 봐도 남은 카드의 분포를 거의 정확히 알 수 있어요. 스트레이트는 1–5가 다 있어야 해서, 공유 카드에 겹치는 숫자가 있으면 사실상 불가능해요.' },
        { title: '두 번의 베팅에 정보가 다르게 실려요', body: '1차 베팅 때는 개인 카드 한 장뿐이라 정보가 적고, 2차 베팅 때는 카드 선택에서 상대가 무엇을 골랐는지가 보여요. 후가 앞면 카드를 가져갔다면 그 카드가 상대 패에 맞았다는 신호예요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '텍사스 홀덤 포커', players: '2–10명', alike: '공유 카드와 개인 카드를 합친 족보로 겨루고, 콜·레이즈·폴드로 베팅해요.', differs: '홀덤은 52장 덱에 무늬가 있고, 카드를 나눠 고르는 단계가 없어요.' },
      { name: '피스 오 케이크 (Piece o’ Cake)', players: '2–5명', alike: '한 사람이 나누고 다른 사람이 고르는 "케이크 자르기" 원리를 게임으로 만든 카드 게임이에요.', differs: '피스 오 케이크는 베팅 없이, 고른 조각의 점수를 모아요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Choice Hold'em rules — The Bloody Game X final",
      description: "The rules of Choice Hold'em from the final of The Bloody Game X (피의 게임X): four sets of 1–5, 20 chips and antes, three shared cards and one private card, the first bet, the split where one card is face up and one face down, the second bet, hand rankings and carried-over ties.",
      keywords: ["Choice Hold'em", 'Bloody Game X final', "hold'em variant", '피의 게임X'],
    },
    title: "Choice Hold'em — The Bloody Game X final",
    name: "Choice Hold'em",
    lead: 'The first player takes two cards and lays one face up, one face down; the opponent picks one of them.',
    summary: "A 1:1 hold'em with twenty cards of 1–5 where the second private card is split by one player and chosen by the other.",
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1 (one match of the four-player knockout final).',
        '**Cards**: four sets of 1–5, twenty cards.',
        '**Chips**: 20 each.',
        '**Order**: the better semifinalist chooses; it alternates each round.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Ante', body: 'One chip each per round, rising by one every ten rounds.' },
        { title: 'Cards', body: 'One private card each, and three shared cards face up.' },
        { title: 'First bet', body: 'From the first player: call, raise or fold. A fold hands over the pot without showing cards.' },
        { title: 'The split', body: 'The first player takes two cards, looks, and lays **one face up and one face down**. The second player takes one; the first keeps the other.' },
        { title: 'Second bet and showdown', body: 'Bet again; the better hand from two private and three shared cards takes the pot.' },
      ] },
      { type: 'table', head: ['Hand (high to low)', 'Needs'], rows: [
        ['Four of a kind', 'Four of a number'],
        ['Full house', 'Three of a number + two of another'],
        ['Straight', '1 to 5'],
        ['Three of a kind', 'Three of a number'],
        ['Two pair', 'Two pairs'],
        ['One pair', 'Two of a number'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        'You win when your opponent cannot pay the ante.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Equal hands compare the hand’s numbers, then the unused private card.',
        'If everything is equal, the pot stays for the next round, with the same first player and no extra ante.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Choice Hold’em centres on **"I split, you choose"** — the cake-cutting problem of fair division, turned into cards.' },
      { type: 'cards', items: [
        { title: 'What to show', body: 'Show a good card and it gets taken; hide it and the chooser may reason "a weak face-up card means a strong hidden one". The splitter wants a layout where either choice costs little, or one that tempts the wrong pick.' },
        { title: 'A countable deck', body: 'Only 1–5, four of each: three shared cards and your own almost pin down what is left. A straight needs all five numbers, so a pair among the shared cards practically rules it out.' },
        { title: 'Two bets, different information', body: 'The first bet rests on one private card; by the second you have seen what the opponent chose. Taking the face-up card signals it fitted their hand.' },
      ], columns: 1 },
    ],
    similar: [
      { name: "Texas hold'em poker", players: '2–10', alike: 'Shared and private cards make hands; bets are call, raise or fold.', differs: 'A 52-card deck with suits, and no split-and-choose step.' },
      { name: "Piece o' Cake", players: '2–5', alike: 'A card game built on the cake-cutting rule that one divides and another chooses.', differs: 'There is no betting; you collect points from the pieces you choose.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
