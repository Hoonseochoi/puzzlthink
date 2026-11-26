import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'card-janggi',
  kind: 'final',
  when: { ko: '7일차 결승 1회전', en: 'Day 7, final game 1' },
  site: 'cardJanggi',
  related: ['cardJanggi', 'janggi', 'laserJanggi'],
  updated: '2026-11-26',
  sources: [namuDay(7), siteEngine({ ko: '카드 장기', en: 'Card Janggi' }, 'src/lib/cardJanggi.ts'), broadcast],
  ko: {
    meta: {
      title: '카드 장기 규칙 — 데블스플랜3 결승 1회전, 행마 카드 순서를 미리 정하는 장기',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 결승 1회전 카드 장기의 규칙을 정리했어요. 큰 말 1개·작은 말 3개, 쥐·말·원숭이·코끼리·기린 행마 카드 5장, 뒤집어 놓는 카드 순서, 후공의 4장 배치, 시간 초과, 승리 조건과 3판 2선승, 승부를 가르는 지점까지.',
      keywords: ['카드 장기', '카드장기', '데블스플랜3 카드 장기', '데블스플랜3 결승', '데블스 플랜 3 결승전', '카드 장기 규칙', '행마 카드'],
    },
    title: '카드 장기 — 데블스플랜3 결승 1회전',
    name: '카드 장기',
    lead: '말을 어떻게 움직일지는 카드가 정해요. 다섯 장의 순서를 미리 뒤집어 정해 두고, 그 순서대로만 움직일 수 있어요.',
    summary: '다섯 장의 행마 카드 순서를 미리 정해 두고 그대로 말을 움직여 상대의 큰 말을 잡는 1:1 장기.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 진출자 2명.',
        '**말**: 각자 큰 말 1개와 작은 말 3개. 시작 칸에 미리 놓여 있어요.',
        '**행마 카드 5장**: 두 사람이 같은 다섯 종류를 한 장씩 가져요.',
      ] },
      { type: 'table', head: ['카드', '움직임'], rows: [
        ['쥐', '상하좌우 한 방향으로 1칸.'],
        ['말', '상하좌우로 2칸 간 뒤, 옆으로 꺾어 1칸 더(체스의 나이트와 같은 자리).'],
        ['원숭이', '둘러싼 8칸 중 한 칸.'],
        ['코끼리', '대각선 한 방향으로 1–2칸.'],
        ['기린', '상하좌우 한 방향으로 2칸.'],
      ], caption: '방송 규칙서 기준' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '선후공', body: '1라운드는 동전 던지기로 선을 정하고, 그 뒤로는 라운드마다 번갈아 선이 돼요.' },
        { title: '카드 순서 정하기', body: '각자 쓸 행마 카드의 순서를 정해 뒷면으로 늘어놓아요. **첫 배치에서만 후공은 4장**만 놓아요.' },
        { title: '첫 카드 공개', body: '첫 배치가 끝나면 두 사람이 첫 카드를 동시에 뒤집어요.' },
        { title: '말 이동', body: '선공부터 90초 안에, 지금 앞면인 카드대로 자기 말 하나를 움직여요. 상대 말이 있는 칸으로 들어가면 그 말을 잡아요. 그다음 상대가 같은 식으로 움직이고, 각자 다음 카드를 뒤집으며 이어가요.' },
        { title: '다시 배치', body: '마지막 카드를 쓰고 나면 3분 안에 다섯 장을 다시 순서대로 늘어놓고, 첫 카드를 공개해요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**상대의 큰 말을 잡으면** 그 라운드를 이겨요.',
        '**내 큰 말이 상대 큰 말의 시작 칸에 들어가도** 이겨요.',
        '3라운드 중 **두 라운드를 먼저 이기면** 결승 1회전 승리예요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '90초 안에 움직이지 못하면, **상대가 그 카드로 내 말 중 하나를 골라** 움직여요.',
        '카드 순서는 한 번 정하면 다섯 장을 다 쓸 때까지 바꿀 수 없어요.',
        '경기 전 두 사람은 탈락자 게스트 한 명을 지목해 30분 동안 연습할 수 있었어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '카드 장기의 핵심은 **다섯 수 앞을 미리 정해 두는 것**이에요. 보통의 장기나 체스에서는 상대의 수를 보고 대응하지만, 여기서는 내가 쓸 카드의 순서가 이미 정해져 있어서 상대의 수에 맞춰 바꿀 수 없어요.' },
      { type: 'cards', items: [
        { title: '상대의 다음 카드는 보이지 않아요', body: '지금 앞면인 카드는 보이지만, 그다음 카드는 뒤집혀 있어요. 하지만 다섯 종류를 한 장씩 쓰므로, 상대가 이미 쓴 카드를 기억하면 남은 카드가 무엇인지는 알 수 있어요. 한 바퀴의 끝으로 갈수록 상대의 다음 수가 좁혀져요.' },
        { title: '마지막 카드 직후가 위험해요', body: '다섯 장을 다 쓰면 다시 배치해야 하는데, 이때 상대는 내 새 첫 카드를 보고 움직일 수 있어요. 한 바퀴가 끝나는 순간이 정보에서 가장 불리한 때라, 그 직전의 배치가 수비적이어야 해요.' },
        { title: '큰 말의 돌진', body: '큰 말이 상대 큰 말의 시작 칸에 들어가도 이기므로, 상대 큰 말이 자리를 비우면 그 칸이 곧 목표가 돼요. 큰 말을 움직이는 순간 내 시작 칸도 비게 되니, 공격과 수비가 같은 말로 묶여 있어요.' },
        { title: '카드마다 쓰임이 달라요', body: '원숭이는 어디로든 한 칸이라 수비에 좋고, 말과 기린은 멀리 뛰어 기습에 좋아요. 어떤 카드를 바퀴의 처음과 끝에 둘지가 곧 작전이에요.' },
        { title: '지배 전략이 있을까요?', body: '판이 작고 말이 적어 계산이 가능한 범위지만, 상대의 카드 순서를 모르는 동시 결정이 섞여 있어서 늘 이기는 순서는 없어요. 상대가 어떤 카드를 언제 쓸지 예측하고, 그 예측이 틀려도 큰 말이 잡히지 않는 순서를 고르는 게 기본이에요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 카드 장기는 방송 화면대로 6×5 판과 말의 시작 칸, 다섯 장의 카드, 뒤집어 놓는 순서와 후공의 첫 4장, 승리 조건을 구현했어요.',
        '코끼리는 방송 규칙서대로 대각선 한 방향으로 1–2칸 가요. 1칸째에 말이 있으면 뛰어넘지 못해요.',
        '기린은 사이에 있는 말을 뛰어넘어요. 움직일 수 없는 카드는 이동 없이 쓰이고, 정해진 수 안에 끝나지 않으면 말이 많이 남은 쪽이 이겨요. 이 부분은 방송이 정하지 않아 사이트가 정했어요.',
        '사이트에서는 빠른 한 판을 위해 **한 라운드로 승부**를 내요(방송은 3판 2선승).',
      ] },
    ],
    similar: [
      { name: '오니타마 (Onitama)', players: '2명', alike: '움직임이 그려진 카드로 말을 옮기고, 상대의 대장 말을 잡거나 내 대장이 상대 진영의 출발 칸에 들어가면 이기는 구조가 카드 장기와 거의 같아요.', differs: '오니타마는 5×5 판에서 카드 두 장 중 하나를 골라 쓰고, 쓴 카드가 상대에게 넘어가요. 순서를 미리 정하지 않아요.' },
      { name: '체스', players: '2명', alike: '나이트·비숍처럼 정해진 모양으로 움직이는 말로 상대의 왕을 노려요.', differs: '체스는 말마다 움직임이 고정돼 있고, 매 수 원하는 말을 자유롭게 골라요.' },
      { name: '장기', players: '2명', alike: '큰 말(궁)을 지키며 상대의 궁을 잡는 것이 목표인 한국 전통 보드게임이에요.', differs: '장기는 말이 32개이고 궁성 안의 규칙이 있으며, 카드 없이 말의 종류가 움직임을 정해요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Card Janggi rules — The Devil's Plan 3, final game 1",
      description: "The rules of Card Janggi, the first game of The Devil's Plan: Dead Again (season 3) final: one big and three small pieces, five movement cards (rat, horse, monkey, elephant, giraffe), laying the cards face down in order, the second player’s four cards, time-outs, how to win and best of three.",
      keywords: ['Card Janggi', "Devil's Plan 3 Card Janggi", "Devil's Plan final", 'Card Janggi rules', 'movement card chess'],
    },
    title: "Card Janggi — The Devil's Plan 3, final game 1",
    name: 'Card Janggi',
    lead: 'Cards decide how your pieces move. Lay all five face down in order in advance — and you can only move in that order.',
    summary: 'Commit to the order of five movement cards and move by them to capture the opponent’s big piece.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two finalists.',
        '**Pieces**: one big and three small pieces each, already on their starting squares.',
        '**Five movement cards**: both players hold the same five.',
      ] },
      { type: 'table', head: ['Card', 'Move'], rows: [
        ['Rat', '1 square up, down, left or right.'],
        ['Horse', '2 squares straight, then 1 to the side (a chess knight’s squares).'],
        ['Monkey', 'Any of the 8 neighbouring squares.'],
        ['Elephant', '1–2 squares in one diagonal direction.'],
        ['Giraffe', '2 squares up, down, left or right.'],
      ], caption: 'As written in the show’s rulebook' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Who goes first', body: 'A coin decides round 1; after that the first player alternates.' },
        { title: 'Ordering the cards', body: 'Each player lays out their cards face down in the order they will use them. **In the first layout only, the second player lays out four.**' },
        { title: 'First reveal', body: 'Both turn their first card up at the same time.' },
        { title: 'Moving', body: 'From the first player, within 90 seconds, move one of your pieces as your face-up card allows; moving onto an enemy piece captures it. Then the other player moves, and each turns up their next card.' },
        { title: 'Re-laying', body: 'After using your last card, you have three minutes to lay out all five again and reveal the first.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**Capture the opponent’s big piece** to win the round,',
        '**or move your big piece onto the square the opponent’s big piece started on.**',
        '**First to two round wins** out of three takes final game 1.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'If you do not move within 90 seconds, **your opponent moves one of your pieces** with that card.',
        'Once laid out, the order cannot change until all five are used.',
        'Before the match each finalist could pick an eliminated guest to practise with for 30 minutes.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Card Janggi is about **committing five moves ahead**. In janggi or chess you answer what the opponent does; here your sequence of cards is fixed and cannot adapt to theirs.' },
      { type: 'cards', items: [
        { title: 'You cannot see their next card', body: 'The face-up card is visible, the next is not. But with one of each kind, remembering what they have used tells you what is left, and their options narrow toward the end of each cycle.' },
        { title: 'Right after the last card is dangerous', body: 'Re-laying lets the opponent see your new first card before they move. The end of a cycle is your weakest moment for information, so the cards just before it should be defensive.' },
        { title: 'The big piece’s charge', body: 'Reaching the enemy big piece’s starting square also wins, so once it leaves, that square is a target. Moving your own big piece empties yours too: attack and defence are tied to the same piece.' },
        { title: 'Each card has a job', body: 'The monkey reaches any neighbour and defends well; the horse and giraffe jump far for surprise attacks. Which card opens and which closes a cycle is the plan.' },
        { title: 'Is there a dominant strategy?', body: 'The board and piece count are small enough to calculate, but the opponent’s hidden order makes each cycle a simultaneous decision, so no order always wins. Predict when they will use which card, and pick an order that keeps your big piece safe even if you are wrong.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Card Janggi implements the 6×5 board and starting squares seen on screen, the five cards, the face-down order with the second player’s first four, and both ways to win.',
        'The elephant moves 1–2 squares in one diagonal direction, as in the show’s rulebook; it cannot jump a piece on the first square.',
        'The giraffe jumps over whatever is between. A card with no legal move is used without moving, and a round that runs too long goes to the side with more pieces. The show left these open, so the site decided them.',
        'For quick games the site plays **a single round** (the show was best of three).',
      ] },
    ],
    similar: [
      { name: 'Onitama', players: '2', alike: 'Pieces move by pictured movement cards, and you win by capturing the enemy master or moving your master onto their starting square — almost the same structure.', differs: 'On a 5×5 board you choose one of two cards each turn, and the used card passes to the opponent; nothing is ordered in advance.' },
      { name: 'Chess', players: '2', alike: 'Pieces move in fixed patterns such as the knight and bishop to attack the king.', differs: 'Each piece’s move is fixed and you choose freely which piece to move every turn.' },
      { name: 'Janggi (Korean chess)', players: '2', alike: 'Protect your general and capture theirs.', differs: 'It has 32 pieces and palace rules, and the piece type, not a card, decides the move.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
