import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'heavy-13',
  kind: 'prison',
  when: { ko: '1일차', en: 'Day 1' },
  site: 'heavy13',
  related: ['heavy13', 'hitStay', 'piggyBank'],
  updated: '2026-11-26',
  sources: [namuDay(1), siteEngine({ ko: '무거운 13', en: 'Heavy 13' }, 'src/lib/heavy13.ts'), broadcast],
  ko: {
    meta: {
      title: '무거운 13 규칙 — 데블스플랜3 1일차 감옥매치, 받침대 합 13 피하기',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 첫 감옥매치 무거운 13의 규칙을 정리했어요. 바위 카드와 색깔 칩, 배치 순서, 패스, 13 이상이 되면 받는 벌점, 14라운드 순위와 동점 처리, 승부를 가르는 지점까지.',
      keywords: ['무거운 13', '무거운13', '데블스플랜3 무거운 13', '데블스플랜3 감옥매치', '데블스 플랜 3 1일차 감옥매치', '무거운 13 규칙', 'Heavy 13'],
    },
    title: '무거운 13 — 데블스플랜3 첫 감옥매치',
    name: '무거운 13',
    lead: '세 받침대에 바위를 올리다가 합을 13 이상으로 만든 사람이, 그때까지 쌓인 바위를 모두 벌점으로 떠안아요.',
    summary: '세 받침대 중 하나에 바위를 몰래 정해 올리고, 합이 13을 넘기게 만든 사람이 벌점을 받는 7인 눈치 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 7명(첫날 감옥동 인원).',
        '**받침대**: 빨강·초록·파랑 짐꾼 받침대 세 개가 가운데 있어요.',
        '**개인 지급품**: 0부터 6까지 적힌 바위 카드 7장, 빨강·초록·파랑 칩 각 2개, 레인보우 칩 1개.',
        '**선 플레이어**: 메인 매치 순위가 가장 높았던 사람이 1라운드 선 플레이어 표식을 가져요. 처음 앉을 자리는 자유롭게 고르지만, 그 뒤로는 바꿀 수 없어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '비공개 제출', body: '모두 3분 안에 바위 카드 한 장과 색깔 칩 하나를 몰래 내요. 칩의 색이 바위를 올릴 받침대, 카드의 숫자가 바위의 무게예요.' },
        { title: '공개와 순서 정하기', body: '칩을 먼저 공개하고 이어서 카드를 공개해요. 레인보우 칩을 낸 사람이 가장 먼저 놓고, 그다음은 높은 숫자를 낸 사람 순서예요. 같은 조건끼리는 선 플레이어부터 시계 방향으로 정해요.' },
        { title: '배치', body: '정해진 순서대로 딜러가 그 사람의 바위를 받침대에 올려요. 레인보우 칩을 낸 사람은 받침대 색을 직접 골라요.' },
        { title: '패스', body: '라운드마다 한 번, 자기 바위가 놓일 차례에 패스할 수 있어요. 패스한 사람의 바위는 다른 모든 사람이 놓은 뒤에 놓이고, 여러 명이 패스했다면 패스한 순서의 반대로(먼저 패스한 사람이 가장 나중에) 놓여요.' },
        { title: '13 이상이면 무너져요', body: '바위를 올려 그 받침대의 합이 13 이상이 되면, 원래 받침대에 있던 바위를 모두 거둬 그 **개수만큼 벌점**을 받아요. 방금 올린 바위는 빈 받침대에 홀로 남아요.' },
        { title: '다음 라운드', body: '그 라운드에서 마지막으로 벌점을 받은 사람이 다음 라운드의 선 플레이어가 돼요.' },
      ] },
      { type: 'p', text: '7라운드가 끝나면 카드와 칩을 한 벌 새로 받아요. 받침대 위의 바위는 치우지 않고 그대로 이어서 14라운드까지 해요.' },
    ],
    win: [
      { type: 'list', items: [
        '14라운드가 끝났을 때 **벌점이 적을수록 높은 순위**예요.',
        '1위는 피스 4개를 받아요. 1위가 여러 명이면 4개를 똑같이 나누고 남는 피스는 버려요.',
        '**6위와 7위, 두 명이 탈락**해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '벌점이 같으면 **더 최근에 벌점을 받은 사람**이 더 낮은 순위예요.',
        '벌점은 무게가 아니라 **바위 개수**로 매겨요. 0 카드는 무게는 없지만 받침대의 바위 수를 늘려요.',
        '레인보우 칩은 한 벌에 하나뿐이라, 7라운드에 한 번씩만 쓸 수 있어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '무거운 13은 **배치 순서를 누가 정하느냐**의 게임이에요. 같은 받침대를 고른 사람이 여럿일 때, 누가 먼저 놓느냐에 따라 무너뜨리는 사람이 정해지기 때문이에요. 순서는 숫자 크기로 정해지는데, 큰 숫자는 받침대를 빨리 채워서 위험해요. 그래서 "먼저 놓고 싶지만 큰 수는 내기 싫다"는 모순이 생겨요.' },
      { type: 'cards', items: [
        { title: '벌점은 개수라서 0이 무기가 돼요', body: '0을 올리면 합은 그대로인데 바위 수만 늘어요. 이미 바위가 많이 쌓인 받침대를 누군가 곧 무너뜨릴 것 같다면, 0을 더해 그 사람의 벌점을 키울 수 있어요. 반대로 내가 무너뜨릴 위험이 있을 때도 0은 가장 안전한 카드예요.' },
        { title: '패스는 순서를 뒤집는 장치', body: '큰 숫자로 앞 순서를 받은 다음 패스하면 맨 뒤로 갈 수 있어요. 앞사람이 받침대를 한 번 무너뜨려 비워 준 뒤에 들어가는 노림수예요. 그러나 모두가 패스를 생각하면 패스한 사람들끼리 다시 순서 싸움이 벌어지고, 먼저 패스한 사람이 가장 나중이 돼요.' },
        { title: '세 받침대 중 어디가 몰릴지 읽기', body: '칩은 색마다 두 개씩이라, 공개된 칩을 세면 누가 어떤 색을 더 낼 수 있는지 알 수 있어요. 받침대 합이 12 근처면 아무도 가지 않으려 하고, 10 근처면 "작은 수 하나쯤은 괜찮겠지" 하는 사람이 몰려 서로 무너뜨려요.' },
        { title: '지배 전략은 없어요', body: '어떤 카드·칩 조합이 안전한지는 다른 여섯 명이 무엇을 내느냐에 달려 있어요. 모두가 안전한 곳을 찾으면 그곳이 가장 위험해지는 구조라, 남들이 "안전하다"고 생각할 곳을 한 단계 더 앞서 읽는 쪽이 유리해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 무거운 13은 방송 규칙(카드·칩 구성, 배치 순서, 패스 역순, 13 이상 붕괴, 14라운드, 동점 처리)을 그대로 따라요.',
        '방송은 7명이지만 PUZZLTHINK에서는 **4–7명**으로 할 수 있어요. AI 6명과 바로 하거나, 친구를 초대하고 빈자리는 AI로 채울 수 있어요.',
        '방송의 결과(피스 지급, 6·7위 탈락)는 사이트에서는 순위로만 보여 줘요.',
      ] },
    ],
    similar: [
      { name: '젝스 님트 (6 nimmt!)', players: '2–10명', alike: '모두 카드를 동시에 내고 숫자 크기로 놓는 순서가 정해지며, 줄을 넘치게 만든 사람이 그 줄의 카드를 벌점으로 가져가요. 무거운 13과 가장 닮은 게임이에요.', differs: '젝스 님트는 여섯 번째 카드를 놓는 사람이 벌점을 받고, 카드마다 소머리 수로 벌점이 달라요. 놓을 줄은 숫자가 정해 줘서 고를 수 없어요.' },
      { name: '할리갈리 (Halli Galli)', players: '2–6명', alike: '공개된 숫자의 합이 기준(과일 5개)에 맞는 순간을 놓치지 않고 계산해야 해요.', differs: '할리갈리는 순발력으로 종을 치는 게임이라, 순서 싸움이나 몰래 내는 카드가 없어요.' },
      { name: '블랙잭', players: '2명 이상', alike: '합이 한계를 넘으면 지는 "버스트" 구조예요.', differs: '블랙잭은 각자 자기 패의 합을 관리하고, 무거운 13은 모두가 같은 받침대의 합을 함께 키워요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Heavy 13 rules — The Devil's Plan 3, day 1 prison match",
      description: "The rules of Heavy 13, the first prison match of The Devil's Plan: Dead Again (season 3): rock cards and colour chips, placement order, passing, the penalty for reaching 13, ranking after 14 rounds, ties, and what decides it.",
      keywords: ['Heavy 13', "Devil's Plan 3 Heavy 13", "Devil's Plan prison match", 'Heavy 13 rules'],
    },
    title: "Heavy 13 — The Devil's Plan 3, first prison match",
    name: 'Heavy 13',
    lead: 'Rocks go onto three stands; whoever pushes a stand to 13 or more takes every rock that was on it as penalty points.',
    summary: 'Seven players secretly choose a stand and a rock weight; whoever tips a stand to 13 takes the penalty.',
    setup: [
      { type: 'list', items: [
        '**Players**: 7 (the day-1 prison).',
        '**Stands**: red, green and blue porter stands in the middle.',
        '**Each player**: seven rock cards numbered 0–6, two chips each of red, green and blue, and one rainbow chip.',
        '**First player**: the best main-match finisher holds the first-player marker in round 1. Seats are chosen freely at the start and then fixed.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Secret submission', body: 'Within three minutes everyone hands in one rock card and one chip, face down. The chip is the stand, the card the rock’s weight.' },
        { title: 'Reveal and order', body: 'Chips are revealed first, then cards. Rainbow chips place first, then higher numbers; equal players go clockwise from the first player.' },
        { title: 'Placing', body: 'In that order the dealer puts each rock on its stand. A rainbow chip lets its player choose the stand.' },
        { title: 'Passing', body: 'Once a round, when your rock is about to be placed, you may pass. Passed rocks go after everyone else’s, in reverse order of passing (the first to pass goes last).' },
        { title: 'Reaching 13', body: 'If a rock brings a stand to 13 or more, every rock that was already there is removed and the placer takes **one penalty point per rock removed**. The new rock stays, alone.' },
        { title: 'Next round', body: 'The last player penalised in the round becomes the next first player.' },
      ] },
      { type: 'p', text: 'After round 7 everyone gets a fresh set of cards and chips. The stands are not cleared; play continues to round 14.' },
    ],
    win: [
      { type: 'list', items: [
        'After 14 rounds, **fewer penalty points ranks higher**.',
        'First place gets 4 pieces; tied first places share them equally and the remainder is discarded.',
        '**Places 6 and 7 are eliminated.**',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'On equal penalties, **whoever was penalised more recently ranks lower**.',
        'Penalties count **rocks, not weight**. A 0 adds nothing to the total but adds a rock.',
        'There is one rainbow chip per set, so it can be used once every seven rounds.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Heavy 13 is about **who controls the placement order**. When several players choose the same stand, the order decides who tips it. Order goes by card size, yet big cards fill a stand fast — so you want to go early without playing high.' },
      { type: 'cards', items: [
        { title: 'Penalties count rocks, so 0 is a weapon', body: 'A 0 adds a rock without adding weight. If someone is about to tip a crowded stand, a 0 makes their penalty bigger; if you are the one at risk, a 0 is your safest card.' },
        { title: 'Passing flips the order', body: 'Play high to be placed early, then pass to go last, after someone else has emptied the stand. If everyone thinks of it, the passers fight over order again, and the first to pass goes last.' },
        { title: 'Reading which stand will crowd', body: 'Two chips per colour means counting revealed chips tells you who can still play which colour. Near 12 nobody goes; near 10, several players think one small rock is safe and tip it on each other.' },
        { title: 'No dominant strategy', body: 'Whether a card and chip are safe depends on what the other six do. The place everyone thinks is safe becomes the most dangerous, so it pays to read one step further than the table.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Heavy 13 follows the broadcast rules: the same cards and chips, placement order, reverse-order passing, the collapse at 13, 14 rounds and the tie-break.',
        'The show had 7 players; PUZZLTHINK plays with **4–7**. Play six AIs straight away, or invite friends and fill empty seats with AIs.',
        'The show’s stakes (pieces, elimination of 6th and 7th) appear on the site only as the final ranking.',
      ] },
    ],
    similar: [
      { name: '6 nimmt!', players: '2–10', alike: 'Cards are played at once and placed in number order; whoever overfills a row takes its cards as penalties. It is the closest relative of Heavy 13.', differs: 'The sixth card in a row triggers the penalty and cards carry different penalty values; the number decides the row, so you cannot choose it.' },
      { name: 'Halli Galli', players: '2–6', alike: 'You must notice the moment visible numbers add up to a target.', differs: 'It is a reflex game of ringing a bell, with no hidden play or order to fight over.' },
      { name: 'Blackjack', players: '2+', alike: 'Going over a limit loses ("bust").', differs: 'Each player manages their own hand; in Heavy 13 everyone builds the same totals together.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
