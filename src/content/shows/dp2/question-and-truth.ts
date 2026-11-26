import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'question-and-truth',
  kind: 'final',
  when: { ko: '7일차 결승 3회전', en: 'Day 7, final game 3' },
  related: ['equationSignal', 'hiddenWord', 'gradation'],
  updated: '2026-11-26',
  sources: [namuDay(7), broadcast],
  ko: {
    meta: {
      title: '질문과 진실 규칙 — 데블스플랜2(데스룸) 결승 3회전, 질문으로 상대 카드 배열 맞히기',
      description: '데블스 플랜: 데스룸(데블스플랜2) 결승 3회전 질문과 진실의 규칙을 정리했어요. 트럼프 8장 배치와 같은 모양 오름차순 조건, 토큰 입찰, 정해진 11가지 질문(합·장수·위치), 진실 선언과 승리 조건까지.',
      keywords: ['질문과 진실', '데블스플랜2 질문과 진실', '데블스 플랜 데스룸 결승', '데블스플랜2 결승전', '질문과 진실 규칙'],
    },
    title: '질문과 진실 — 데블스플랜2 결승 3회전',
    name: '질문과 진실',
    lead: '상대가 늘어놓은 카드 8장의 배열을 맞혀요. 토큰을 더 많이 낸 사람이 질문하거나, 정답을 외칠 수 있어요.',
    summary: '토큰을 걸어 질문권을 얻고, 정해진 질문으로 상대의 카드 8장 배열을 알아내 먼저 맞히는 추리 대결.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 진출자 2명.',
        '**카드**: 각자 조커를 뺀 트럼프 52장과 토큰 10개.',
        '**배치**: 각자 8장을 골라 카드 칸에 왼쪽부터 늘어놓아요. **같은 모양끼리는 왼쪽에서 오른쪽으로 오름차순**이어야 하고(A=1, J=11, Q=12, K=13), 모양이 다른 카드와는 순서가 상관없어요. 같은 모양을 붙여 놓을 필요도 없어요. 한 번 놓으면 바꿀 수 없어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '토큰 내기 (30초)', body: '몇 개의 토큰을 쓸지 정해 몰래 내요. 낼 때마다 각자 토큰 2개를 새로 받아요.' },
        { title: '행동권', body: '더 많이 낸 사람이 **질문**과 **진실** 중 하나를 해요. 같으면 낸 토큰을 거두고, 2개씩 받은 뒤 다시 내요.' },
        { title: '질문', body: '정해진 11가지 질문 중 하나를 해요. 상대는 반드시 사실대로 답해야 하고, 같은 질문을 여러 번 해도 돼요.' },
        { title: '진실', body: '상대의 8장을 왼쪽부터 선언해요. 숫자(알파벳)만 맞히면 되고 모양은 맞힐 필요가 없어요.' },
      ] },
      { type: 'table', head: ['유형', '질문'], rows: [
        ['합', '고른 카드 3장의 합 · 고른 모양 카드의 합 · 알파벳(J·Q·K·A) 카드의 합 · 숫자 카드의 합'],
        ['장수', '알파벳 카드의 장수 · 숫자 카드의 장수 · 특정 숫자/알파벳의 장수'],
        ['위치', '특정 모양 카드의 위치 · 같은 숫자/알파벳 카드의 위치 · 연속되는 숫자/알파벳의 위치 · 가장 큰(또는 작은) 숫자의 위치'],
      ], caption: '방송에서 정해진 질문 11가지를 유형별로 묶었어요' },
    ],
    win: [
      { type: 'list', items: [
        '진실에서 **8장을 모두 정확히 맞히면** 이겨요.',
        '하나라도 틀리면 오답으로 처리되고 다음 라운드로 넘어가요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '토큰이 5개 이하가 되면 경고등이 켜지고, 6개 이상으로 돌아오면 꺼져요. 상대의 남은 토큰을 짐작하는 단서가 돼요.',
        '질문에는 거짓말할 수 없어요. 이 게임의 허세는 배치와 토큰 입찰에만 있어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '질문과 진실은 **어떤 질문이 가장 많은 정보를 주는지**를 계산하는 게임이에요. 가능한 배치의 수가 엄청나게 많아서, 질문 하나로 후보를 얼마나 줄이느냐가 승부예요.' },
      { type: 'cards', items: [
        { title: '같은 모양 오름차순이 단서예요', body: '같은 모양은 반드시 오름차순이라, 어떤 모양의 위치를 알면 그 카드들의 상대적인 크기 순서도 알게 돼요. "특정 모양 카드의 위치" 질문은 그래서 위치와 순서를 한 번에 알려 주는 강한 질문이에요.' },
        { title: '배치로 상대를 괴롭히세요', body: '같은 숫자를 여러 모양으로 넣거나, 모양을 여러 가지로 섞으면 오름차순 단서가 약해져요. 반대로 한 모양만 쓰면 정렬된 수열이 되어 쉽게 풀려요. 배치 단계에서 이미 수비가 시작돼요.' },
        { title: '토큰은 템포', body: '토큰을 많이 내면 행동권을 얻지만 다음 입찰이 약해져요. 매번 2개씩 들어오므로, 중요한 질문이나 확실한 진실 선언 직전에 토큰을 몰아 쓰는 리듬이 필요해요. 경고등은 상대가 지금 몰아 쓸 수 있는지를 알려 줘요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '게스 후 (Guess Who?)', players: '2명', alike: '예·아니오로 답해야 하는 질문을 번갈아 하며 상대의 숨은 답을 좁혀 가요. 질문 하나로 후보를 절반씩 줄이는 계산이 같아요.', differs: '게스 후는 질문을 자유롭게 만들고, 숨긴 것은 인물 하나뿐이에요.' },
      { name: '마스터마인드 (Mastermind)', players: '2명', alike: '숨겨진 순서 있는 배열을 피드백으로 알아내는 추리 게임이에요.', differs: '마스터마인드는 추측할 때마다 정해진 형태의 피드백을 받고, 질문권을 경매하지 않아요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Question and Truth rules — The Devil's Plan 2 (Death Room), final game 3",
      description: "The rules of Question and Truth, the third game of The Devil's Plan: Death Room (season 2) final: arranging eight playing cards with each suit ascending, bidding tokens, the eleven fixed questions (sums, counts, positions), declaring the truth, and how to win.",
      keywords: ['Question and Truth', "Devil's Plan 2 Question and Truth", "Devil's Plan Death Room final"],
    },
    title: "Question and Truth — The Devil's Plan 2, final game 3",
    name: 'Question and Truth',
    lead: 'Work out the order of the eight cards your opponent laid out. Bid more tokens to ask a question — or to call the answer.',
    summary: 'Bid tokens for the right to ask fixed questions about the opponent’s eight cards, then name the order first.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two finalists.',
        '**Cards**: a 52-card deck without jokers and ten tokens each.',
        '**Arrangement**: each lays out eight cards from the left. **Cards of the same suit must ascend from left to right** (A = 1, J = 11, Q = 12, K = 13); different suits may sit in any order and need not be grouped. It cannot change once laid.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Bid tokens (30 seconds)', body: 'Secretly submit how many tokens to use; each submission also brings two new tokens to each player.' },
        { title: 'The right to act', body: 'The higher bid chooses **Question** or **Truth**. Equal bids are taken by the dealer, two tokens are given, and both bid again.' },
        { title: 'Question', body: 'Ask one of eleven fixed questions; the answer must be true. Repeats are allowed.' },
        { title: 'Truth', body: 'Name the opponent’s eight cards from the left — ranks only, suits do not matter.' },
      ] },
      { type: 'table', head: ['Type', 'Questions'], rows: [
        ['Sum', 'of three chosen cards · of a chosen suit · of picture cards (J, Q, K, A) · of number cards'],
        ['Count', 'of picture cards · of number cards · of a given rank'],
        ['Position', 'of a given suit · of cards sharing a rank · of consecutive ranks · of the highest (or lowest) number'],
      ], caption: 'The show’s eleven questions, grouped by type' },
    ],
    win: [
      { type: 'list', items: [
        'Naming **all eight correctly** in Truth wins.',
        'Any mistake counts as wrong, and play moves to the next round.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A warning light comes on at five tokens or fewer and goes off again at six or more — a clue to the opponent’s reserve.',
        'Answers may not lie; bluffing lives only in the arrangement and the bids.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Question and Truth is about **which question gives the most information**. The possible arrangements are vast; the game turns on how much each question cuts them down.' },
      { type: 'cards', items: [
        { title: 'Ascending suits are a clue', body: 'Same-suit cards always ascend, so knowing where a suit sits also gives its cards’ relative order. "Where is suit X?" therefore reveals positions and ordering at once.' },
        { title: 'Defend with the arrangement', body: 'Repeating ranks across suits, or mixing many suits, weakens the ascending clue; a single suit becomes a sorted list that is easy to crack. Defence starts at setup.' },
        { title: 'Tokens are tempo', body: 'Big bids win the action but weaken the next bid, and two tokens arrive each time, so save up for a key question or a sure Truth. The warning light tells you whether the opponent can do the same.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Guess Who?', players: '2', alike: 'Take turns asking questions to narrow down the opponent’s hidden answer, halving the candidates each time.', differs: 'Questions are free-form yes/no, and only one person is hidden.' },
      { name: 'Mastermind', players: '2', alike: 'Deduce a hidden ordered code from feedback.', differs: 'Feedback comes after every guess in a fixed form; there is no bidding for turns.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
