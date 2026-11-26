import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'remove-one',
  kind: 'prison',
  when: { ko: '1일차', en: 'Day 1' },
  related: ['blackWhite', 'blackWhite2', 'heavy13'],
  updated: '2026-11-26',
  sources: [namuDay(1), broadcast],
  ko: {
    meta: {
      title: '하나 빼기 규칙 — 데블스플랜2(데스룸) 1일차 감옥매치, 겹치지 않는 가장 작은 수',
      description: '데블스 플랜: 데스룸(데블스플랜2) 첫 감옥매치 하나 빼기의 규칙을 정리했어요. 1–8 카드 두 장 내고 하나 빼기, 겹치지 않는 가장 낮은 숫자의 승리, 보관 구역, 18라운드와 생존 정산, 동점 처리, 승부를 가르는 지점까지.',
      keywords: ['하나 빼기', '데블스플랜2 하나 빼기', '데블스 플랜 데스룸 하나 빼기', '데블스플랜2 감옥매치', '하나 빼기 규칙'],
    },
    title: '하나 빼기 — 데블스플랜2 1일차 감옥매치',
    name: '하나 빼기',
    lead: '두 장을 내 보이고, 그중 한 장을 몰래 빼요. 남들과 겹치지 않는 가장 작은 숫자를 낸 사람이 이겨요.',
    summary: '두 장을 공개한 뒤 한 장만 몰래 쓰고, 겹치지 않는 가장 작은 숫자가 이기는 감옥동 생존 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 첫날 감옥동 인원 전원.',
        '**카드**: 각자 1부터 8까지 숫자 카드 한 장씩, 8장.',
        '**기타**: 왼쪽·오른쪽 제출 칸, 어느 쪽을 쓸지 고르는 마커, 승리의 표식, 임시 보관 구역.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '두 장 내기', body: '라운드마다 카드 두 장을 왼쪽 칸과 오른쪽 칸에 한 장씩 내요.' },
        { title: '공개와 선택', body: '모두 내면 두 장씩 전부 공개해요. 그다음 각자 어느 쪽을 쓸지 마커를 손에 쥐어 몰래 정해요.' },
        { title: '승자', body: '쓴 카드 중 **다른 사람과 겹치지 않는 가장 낮은 숫자**를 낸 한 명이 이겨요. 그 숫자만큼 승점과 승리의 표식 1개를 받아요.' },
        { title: '카드 정리', body: '쓴 카드는 게임에서 빠지고, 안 쓴 카드는 임시 보관 구역에 가서 **다음 라운드에만** 쓸 수 없어요.' },
      ] },
      { type: 'p', text: '모두 18라운드이고, 6·12라운드가 끝나면 숫자 카드가 다시 채워져요.' },
    ],
    win: [
      { type: 'list', items: [
        '3·6·9·12라운드는 **생존 라운드**예요. 끝나면 승리의 표식 1개당 1점을 더한 뒤, 승점이 가장 높은 한 명의 생존이 확정되고 게임에서 빠져요.',
        '생존자가 정해지면 남은 사람의 승점은 0으로 돌아가요. 승리의 표식은 그대로 남아요.',
        '마지막 세 명은 13–18라운드 여섯 판을 한 뒤 정산해 **상위 2명이 살아남고**, 그중 승점 1위는 피스 1개를 받아요. 18라운드까지 살아남지 못한 한 명이 탈락해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '최고 승점이 같으면 승리의 표식이 많은 사람, 그것도 같으면 가장 최근 라운드에서 이긴 사람이 살아남아요.',
        '모두가 겹치면 그 라운드에는 이긴 사람이 없을 수 있어요.',
        '마커는 다른 사람에게 보여 줄 수 없어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '하나 빼기는 **"가장 작은 유일한 숫자"** 게임이에요. 작은 숫자일수록 이기기 쉽지만 승점은 적고, 모두가 작은 숫자를 노리면 겹쳐서 무효가 돼요.' },
      { type: 'cards', items: [
        { title: '두 장 공개가 핵심', body: '두 장을 먼저 보여 주기 때문에, 다른 사람의 두 후보를 보고 내가 어느 쪽을 쓸지 정할 수 있어요. 반대로 상대도 내 두 후보를 보고 있어요. 1과 8처럼 극단적인 두 장을 내면 상대가 내 선택을 읽기 어려워요.' },
        { title: '보관 구역이 다음 판을 예고해요', body: '안 쓴 카드는 다음 라운드에 못 쓰므로, 지금 누가 어떤 카드를 보관 구역에 남겼는지 보면 다음 라운드의 후보가 줄어들어요. 카드가 리셋되기 직전 라운드는 남은 카드가 거의 다 보여서 계산 싸움이 돼요.' },
        { title: '승점과 표식의 차이', body: '승점은 생존자가 나올 때마다 사라지지만 표식은 끝까지 남아요. 일찍 생존하지 못해도 표식을 모아 두면 이후 정산에서 출발점이 높아져요. 작은 숫자로 자주 이겨 표식을 모으는 길과, 큰 숫자로 한 번에 승점을 내는 길 사이의 선택이 있어요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '하이에나 (Hol’s der Geier)', players: '2–5명', alike: '모두 숫자 카드를 동시에 내고, **같은 숫자를 낸 사람끼리는 무효**가 되는 규칙이 하나 빼기의 "겹치면 진다"와 같아요.', differs: '하이에나는 보통 큰 숫자가 이기고, 걸린 점수 카드가 매번 달라요.' },
      { name: '젝스 님트 (6 nimmt!)', players: '2–10명', alike: '카드를 동시에 내고 공개해, 남들이 무엇을 냈느냐에 따라 결과가 갈리는 게임이에요.', differs: '젝스 님트는 줄에 카드를 이어 붙이며 벌점을 피하는 게임이에요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Remove One rules — The Devil's Plan 2 (Death Room), day 1 prison match",
      description: "The rules of Remove One from The Devil's Plan: Death Room (season 2): show two cards 1–8 and secretly keep one, the lowest unique number wins, the holding area, 18 rounds with survival settlements, tie-breaks, and what decides it.",
      keywords: ['Remove One', "Devil's Plan 2 Remove One", "Devil's Plan Death Room prison match"],
    },
    title: "Remove One — The Devil's Plan 2, day 1 prison match",
    name: 'Remove One',
    lead: 'Show two cards, then secretly drop one. The lowest number nobody else played wins.',
    summary: 'Reveal two cards, secretly use one, and win with the lowest unique number.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone in prison on day 1.',
        '**Cards**: one each of 1 to 8 per player.',
        '**Also**: a left and a right slot, a marker to choose a side, victory tokens, a holding area.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Two cards', body: 'Each round you put one card in your left slot and one in your right.' },
        { title: 'Reveal and choose', body: 'All cards are revealed; then each player secretly closes a marker in their hand to choose which side counts.' },
        { title: 'Winner', body: 'The player with **the lowest number nobody else used** wins, scoring that many points and a victory token.' },
        { title: 'Clean-up', body: 'Used cards leave the game; the unused one goes to the holding area and cannot be played **next round only**.' },
      ] },
      { type: 'p', text: '18 rounds in all; the cards are refreshed after rounds 6 and 12.' },
    ],
    win: [
      { type: 'list', items: [
        'Rounds 3, 6, 9 and 12 are **survival rounds**: each victory token adds a point, and the single highest scorer is safe and leaves the game.',
        'Then everyone else’s points reset; victory tokens stay.',
        'The last three play rounds 13–18 and the **top two survive**; the top scorer also gets a piece. Whoever has not survived by round 18 is eliminated.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Tied top scores go to more victory tokens, then to the most recent round winner.',
        'If every card is matched, nobody wins the round.',
        'Markers may not be shown to others.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Remove One is a **lowest unique number** game: small numbers win more easily but score little, and if everyone aims low they cancel each other out.' },
      { type: 'cards', items: [
        { title: 'The two revealed cards', body: 'You see everyone’s two candidates before choosing, and they see yours. A spread like 1 and 8 makes your choice hard to read.' },
        { title: 'The holding area predicts the next round', body: 'An unused card is unavailable next round, so the holding area narrows everyone’s next options. Just before a refresh, nearly every remaining card is visible and it becomes pure calculation.' },
        { title: 'Points versus tokens', body: 'Points vanish at every settlement; tokens stay. Collecting tokens with frequent small wins raises your starting point in later settlements, against scoring big once with a high card.' },
      ], columns: 1 },
    ],
    similar: [
      { name: "Hol's der Geier (Raj)", players: '2–5', alike: 'Everyone plays a number card at once and **matching cards cancel**, exactly like Remove One.', differs: 'Usually the highest card wins, and the prize changes every round.' },
      { name: '6 nimmt!', players: '2–10', alike: 'Simultaneous reveals where the outcome depends on what everyone else played.', differs: 'Cards extend rows and you avoid penalty cards.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
