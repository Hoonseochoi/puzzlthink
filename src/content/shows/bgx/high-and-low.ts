import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'high-and-low',
  kind: 'death',
  when: { ko: '6일차', en: 'Day 6' },
  related: ['blackWhite', 'gradation', 'blackWhite2'],
  updated: '2026-11-26',
  sources: [namuDay('6'), broadcast],
  ko: {
    meta: {
      title: '하이 앤 로우 규칙 — 피의 게임X 6일차 데스매치, 높은 수가 이길까 낮은 수가 이길까',
      description: '피의 게임X 6일차 데스매치 하이 앤 로우의 규칙을 정리했어요. 1–10 숫자 카드와 뒷면 색, 노멀·리버스 카드, 리버스 개수로 바뀌는 우위, 공개 포기 규칙, 동점 처리와 이월, 마이너스 점수 카드의 특수 규칙까지.',
      keywords: ['하이 앤 로우', '피의 게임X 하이 앤 로우', '피의게임X 데스매치', '하이로우 카드 게임', '피의게임X'],
    },
    title: '하이 앤 로우 — 피의 게임X 6일차 데스매치',
    name: '하이 앤 로우',
    lead: '점수 카드 한 장을 두고 숫자 카드를 내요. 이번 판에 높은 수가 이길지 낮은 수가 이길지는 몰래 낸 리버스 카드의 개수가 정해요.',
    summary: '숫자 카드와 함께 노멀·리버스 카드를 몰래 내, 높은 수와 낮은 수 중 무엇이 이길지 바꾸는 4인 점수 카드 쟁탈전.',
    setup: [
      { type: 'list', items: [
        '**인원**: 4명 개인전.',
        '**숫자 카드**: 각자 1–10. 1–5는 뒷면이 파란색, 6–10은 노란색이에요.',
        '**특수 카드**: 각자 노멀 카드와 리버스 카드.',
        '**점수 카드**: 2, 4, 6, 8, 10과 −1, −3, −5, −7, −9의 10장 중 무작위로 1장을 빼고 9장을 써요.',
        '**라운드**: 9라운드.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '점수 카드 공개', body: '라운드마다 점수 카드 한 장이 공개돼요.' },
        { title: '제출', body: '숫자 카드 한 장과 특수 카드 한 장을 겹쳐 내요.' },
        { title: '우위 결정', body: '나온 **리버스 카드가 홀수 개**면 이번 판은 **낮은 숫자**가, 아니면 **높은 숫자**가 우위예요. 리버스 카드는 게임 중 한 번만 쓸 수 있어요.' },
        { title: '공개', body: '모두 숫자 카드의 뒷면(색)을 먼저 보여 준 뒤, 선부터 앞면을 공개해요. 한 라운드에 한 명만 공개를 포기할 수 있어요(선 플레이어와 직전 라운드 포기자는 불가).' },
        { title: '획득', body: '가장 우위인 카드를 낸 사람이 점수 카드를 가져가요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '9라운드 뒤 **점수 합 상위 2명이 생존**해요.',
        '동점이면 더 높은 점수 카드를 가진 사람이 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '가장 우위인 카드가 여러 장이면, 그다음 우위를 **혼자** 낸 사람이 가져가요. 그런 사람도 없으면 점수 카드는 다음 라운드로 넘어가요.',
        '**마이너스 점수 카드**일 때는, 공개를 포기한 사람이 있으면 그 사람이 가져가요.',
        '마이너스 카드에서 같은 숫자를 낸 사람이 있으면, 카드를 가져가게 된 사람이 그들 중 한 명에게 넘길 수 있어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '하이 앤 로우의 핵심은 **리버스 카드의 홀짝**이에요. 내가 리버스를 내도 다른 누군가가 또 내면 짝수가 되어 원래대로 돌아가요. 한 번뿐인 리버스를 언제 쓰느냐가 승부예요.' },
      { type: 'cards', items: [
        { title: '뒷면 색은 절반의 정보', body: '앞면을 공개하기 전에 모두의 뒷면 색이 보여요. 파란색(1–5)과 노란색(6–10)만 알아도, 이번 판에 높은 수와 낮은 수 중 누가 유리할지 짐작할 수 있어요. 공개를 포기할지 정할 때 이 정보가 결정적이에요.' },
        { title: '같은 수는 서로를 지워요', body: '가장 우위인 카드가 겹치면 그다음 단독 우위가 가져가요. 그래서 10이나 1처럼 극단적인 카드는 남과 겹치기 쉬워 오히려 위험하고, 9나 2처럼 한 칸 물러난 카드가 "겹친 사람들 다음"으로 이길 수 있어요.' },
        { title: '마이너스 카드는 떠넘기기', body: '마이너스 점수 카드는 받으면 손해라, 공개를 포기한 사람이 떠안는 규칙은 포기에 대가를 붙여요. 같은 숫자를 낸 사람에게 넘길 수 있는 규칙 때문에, 마이너스 판에서는 남과 같은 숫자를 내는 것이 위험해요.' },
        { title: '카드 한 장씩의 예산', body: '1–10을 9라운드에 한 장씩 쓰므로 한 장은 남아요. 큰 점수 카드에 강한 카드를 쓰고 작은 점수에는 버리는 카드를 쓰는 배분이 기본인데, 리버스가 나오면 "강한 카드"의 뜻이 뒤집혀요. 상대가 리버스를 이미 썼는지 세는 것이 중요해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '하이에나 (Hol’s der Geier)', players: '2–5명', alike: '점수 카드(플러스와 마이너스)를 두고 숫자 카드를 동시에 내며, 같은 숫자는 서로 지워지고 다음 단독 숫자가 가져가요. 마이너스 카드에서는 낮은 숫자가 가져가요. 규칙의 뼈대가 거의 같아요.', differs: '하이에나에는 리버스 카드가 없고, 마이너스 카드에서 우위가 정해진 방식으로 뒤집혀요.' },
      { name: '구프스필 (Goofspiel)', players: '2명 이상', alike: '트럼프 한 무늬씩을 손에 들고, 공개된 점수 카드를 두고 동시에 한 장씩 내 가장 높은 카드가 가져가는 고전 입찰 게임이에요.', differs: '구프스필에는 마이너스 점수나 우위를 뒤집는 카드가 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: 'High and Low rules — The Bloody Game X, day 6 death match',
      description: 'The rules of High and Low from The Bloody Game X (피의 게임X): number cards 1–10 with coloured backs, normal and reverse cards, how the count of reverses flips the winning direction, folding the reveal, ties and carry-over, and the special rules for negative score cards.',
      keywords: ['High and Low', 'Bloody Game X death match', 'card game', '피의 게임X'],
    },
    title: 'High and Low — The Bloody Game X, day 6 death match',
    name: 'High and Low',
    lead: 'Play a number card for a score card — but whether high or low wins this round depends on how many secret reverse cards were played.',
    summary: 'Four players fight over score cards with number cards, using reverse cards to flip whether high or low wins.',
    setup: [
      { type: 'list', items: [
        '**Players**: four, each for themselves.',
        '**Number cards**: 1–10 each; 1–5 have blue backs, 6–10 yellow.',
        '**Special cards**: a normal card and a reverse card each.',
        '**Score cards**: 2, 4, 6, 8, 10 and −1, −3, −5, −7, −9; one is removed at random, nine are used.',
        '**Rounds**: nine.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Score card', body: 'A score card is revealed each round.' },
        { title: 'Submit', body: 'Play one number card stacked with one special card.' },
        { title: 'Direction', body: 'An **odd number of reverse cards** means **low wins** this round; otherwise high wins. Each reverse card can be used once per game.' },
        { title: 'Reveal', body: 'Everyone shows their card backs (colours), then fronts are revealed from the first player. One player per round may decline to reveal — not the first player, nor whoever declined last round.' },
        { title: 'Take', body: 'The best card takes the score card.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After nine rounds **the top two totals survive**.',
        'Ties go to whoever holds the higher single score card.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'If several share the best card, the player with the next-best **unique** card takes it; if none, the score card carries over.',
        'For a **negative** score card, a player who declined to reveal takes it.',
        'For a negative card, if others played the same number, the taker may pass it to one of them.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Everything hinges on **the parity of reverse cards**: if you reverse and someone else does too, the direction flips back. When to spend your one reverse decides the game.' },
      { type: 'cards', items: [
        { title: 'Backs are half the information', body: 'Card colours (blue 1–5, yellow 6–10) are visible before the fronts, hinting who is favoured this round — crucial when deciding whether to decline the reveal.' },
        { title: 'Equal numbers cancel', body: 'Shared best cards hand the win to the next unique card, so extremes like 10 or 1 often collide; one step back, 9 or 2, can win "after the collision".' },
        { title: 'Negative cards get dumped', body: 'Declining the reveal makes you take a negative card, which puts a price on folding, and the pass-on rule makes matching someone’s number dangerous in negative rounds.' },
        { title: 'One card per round', body: 'Nine rounds from ten cards leaves one unused. Strong cards for big prizes and throwaways for small ones is the baseline, but a reverse flips what "strong" means — track who has already used theirs.' },
      ], columns: 1 },
    ],
    similar: [
      { name: "Hol's der Geier (Raj)", players: '2–5', alike: 'Bid number cards on plus and minus score cards; equal numbers cancel and the next unique number takes it, and on minus cards the low card takes it — nearly the same skeleton.', differs: 'There are no reverse cards; the direction flips in a fixed way on minus cards.' },
      { name: 'Goofspiel', players: '2+', alike: 'A classic bidding game: each player holds one suit and plays a card at once for a revealed prize card, highest taking it.', differs: 'There are no negative prizes and nothing flips the direction.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
