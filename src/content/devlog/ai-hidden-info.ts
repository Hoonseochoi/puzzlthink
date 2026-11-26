import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-hidden-info',
  category: 'ai',
  games: ['cardJanggi', 'pointOmok'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '카드 장기·포인트 오목 AI 개발기 — 보이지 않는 카드와 몰래 거는 점수 | 개발 노트',
      description: '데블스 플랜 3 결승의 카드 장기와 비밀 베팅 오목인 포인트 오목. 상대 정보를 볼 수 없는 두 게임에서 AI가 "가능한 세계"를 모두 탐색하는 방법, 카드 순서를 한 장씩 키우는 빔 탐색, 판마다 바뀌는 여섯 가지 베팅 성격과 성격별 실제 승률까지.',
      keywords: ['카드 장기 AI', '포인트 오목 AI', '데블스플랜3 카드 장기', '데블스 플랜 결승', '비밀 베팅 게임', '불완전 정보 게임 AI', '게임 AI 개발기'],
    },
    title: '카드 장기·포인트 오목 AI 개발기',
    lead: '상대의 손을 볼 수 없을 때, AI는 가능한 모든 경우를 상상해요.',
    intro: [
      '카드 장기와 포인트 오목은 둘 다 11월 24~25일 밤에 들어온 게임이고, 둘 다 **상대가 무엇을 골랐는지 모르는 채로** 둬야 하는 게임이에요. 카드 장기는 상대가 엎어 놓은 카드의 순서를, 포인트 오목은 상대가 몰래 건 점수를 몰라요.',
      '이런 게임에서 AI를 공정하게 만드는 첫 원칙은 같아요. **AI에게는 그 자리의 플레이어가 아는 것만 넘긴다.** 그 위에서 각 AI가 모르는 것을 어떻게 다루는지 정리했어요.',
    ],
    summary: '엎어 놓은 카드의 가능한 순서를 모두 탐색하는 카드 장기 AI, 상대 예산을 좁혀 베팅을 표본으로 뽑는 포인트 오목 AI와 판마다 바뀌는 여섯 성격.',
    sections: [
      {
        id: 'card-rules',
        title: '카드 장기: 규칙부터',
        blocks: [
          { type: 'p', text: '카드 장기는 「데블스 플랜: 데드 어게인」 결승전 1회차 게임이에요. 6×5 판에 왕 하나와 작은 말 셋, 그리고 양쪽이 똑같이 가진 이동 카드 다섯 장(쥐: 상하좌우 한 칸, 말: 나이트, 원숭이: 여덟 방향 한 칸, 코끼리: 대각선으로 미끄러지기, 기린: 상하좌우로 정확히 두 칸 뛰기)으로 둬요. 두 사람이 카드 순서를 동시에 엎어 놓고(선은 다섯 장, 후는 첫 순환에만 네 장), 한 장씩 뒤집으며 그 카드대로 말을 움직여요. 상대 왕을 잡거나 내 왕을 상대 왕의 출발 칸에 올리면 이겨요.' },
          { type: 'p', text: '방송이 정하지 않은 부분은 사이트가 정했어요. 움직일 수 없는 카드는 그냥 쓰이고 지나가고, 기린은 뛰어넘고 코끼리는 막히며, 정해진 수 안에 승부가 안 나면 남은 말 수로 정해요. 코드 주석에 "방송이 열어 둔 판정(우리 판정)"으로 따로 적어 뒀어요.' },
        ],
      },
      {
        id: 'card-ai',
        title: '카드 장기 AI: 가능한 세계 모두',
        blocks: [
          { type: 'p', text: '카드 장기 AI는 어려움 하나뿐이에요. AI가 받는 정보는 자기 카드 배치, 그리고 상대의 이미 쓴 카드와 지금 뒤집힌 카드뿐이에요. 상대의 남은 엎어진 카드는 순서를 몰라요.' },
          { type: 'steps', items: [
            { title: '세계 만들기', body: '상대의 엎어진 카드가 놓였을 수 있는 순서 하나하나를 "세계"로 봐요. 엎어진 카드가 많아야 네 장이라 세계는 최대 4! = 24개예요.' },
            { title: '세계마다 보통의 게임', body: '한 세계 안에서는 양쪽 카드 순서가 모두 정해지니, 숨은 정보가 없는 보통의 2인 게임이에요. 여기서 알파베타 탐색(치환표, 반복 심화)으로 모든 수에 점수를 매겨요.' },
            { title: '평균으로 고르기', body: '모든 세계에 걸친 평균 승률이 가장 높은 수를 둬요. 어느 한 세계에서만 좋은 수보다, 대부분의 세계에서 괜찮은 수를 고르는 셈이에요.' },
          ] },
          { type: 'p', text: '카드를 엎어 놓는 단계는 더 어려워요. 다섯 장의 순서는 120가지라서, AI는 순서를 **한 장씩 키워요.** 첫 장 후보, 그다음 두 장 후보… 이렇게 접두사를 키우며 좋은 것만 남기는 빔 탐색이에요. 각 접두사는 그 카드들이 다 쓰일 만큼만 탐색해서, 가능한 상대 순서들에 대해 평가해요. 알려진 배치가 끝난 뒤에는 그 순환에 남은 아무 카드나 쓸 수 있다고 보고 읽어요.' },
          { type: 'callout', tone: 'note', title: '시간 초과 때도 같은 탐색', text: '카드 장기는 한 사람이 시간을 넘기면 상대가 그 사람의 카드로 대신 말을 움직이는 규칙이 있어요. AI가 사람 대신 둘 때는 같은 탐색으로 **사람에게 가장 나쁜 수**를 골라요.' },
          { type: 'p', text: '출시 커밋에는 자기대국 스크립트(`scripts/card-janggi-arena.ts`)도 함께 들어갔어요. AI를 "이길 수 있으면 이기고, 잡을 수 있으면 잡는" 단순한 상대나 무작위 상대와 붙이면서, 판마다 왕이 하나씩 있는지, 말이 갑자기 생기지 않는지, 엎어진 카드가 상대 쪽으로 넘어가지 않는지를 매 상태마다 확인해요.' },
        ],
      },
      {
        id: 'point-rules',
        title: '포인트 오목: 규칙부터',
        blocks: [
          { type: 'p', text: '포인트 오목은 매 라운드 고르는 사람이 일렬로 붙은 빈 점 세 개를 정하고, 두 사람이 자기 점수를 그 세 점에 몰래 나눠 거는 오목이에요. 점마다 더 많이 건 사람의 돌이 놓이고, 같으면 고르지 않은 사람이 가져가요. 매 라운드 10점을 받고, 남은 점수의 절반(내림)이 다음 라운드로 넘어가요. 각 점에 최소 1점씩은 걸어야 해요. 다섯이 더 많은 쪽이 이기고, 여섯 이상(장목)은 다섯이 아니에요. 출시 직후 장목을 다섯에서 빼는 수정이 따로 들어갔어요.' },
        ],
      },
      {
        id: 'point-ai',
        title: '포인트 오목 AI: 예산 좁히기와 성격',
        blocks: [
          { type: 'p', text: 'AI가 받는 건 판, 라운드마다의 공개 기록(누가 골랐는지, 어느 점이었는지, 어느 점에 누구 돌이 놓였는지), 그리고 자기 베팅뿐이에요. 상대의 베팅이나 남은 점수는 절대 받지 않아요.' },
          { type: 'list', items: [
            '**점 고르기**: 돌 근처에서 가능한 세 점 줄마다, 세 점이 나뉠 수 있는 여덟 가지 결과(각 점을 누가 가져가는지)에 대해 판이 어떻게 될지를 보고, 각 결과의 가능성으로 가중 평균해요.',
            '**베팅(어려움)**: 받는 점수와 이월 규칙, 지난 라운드 결과로 상대의 남은 점수를 범위로 좁히고, 그 범위에서 상대 베팅을 표본으로 뽑아요. 내 점수를 나누는 모든 방법을 "판의 기대값 + 이월할 점수의 가치"로 평가해서, 좋은 것들 중에서 섞어 골라요. 판만 보고는 AI의 베팅을 읽을 수 없게요.',
          ] },
          { type: 'h3', text: '여섯 가지 베팅 성격' },
          { type: 'p', text: '출시 8분 뒤, 쉬움을 빼고 **AI 게임마다 베팅 성격 하나를 무작위로 뽑게** 했어요. 판마다 다른 성격이라 지난 판의 습관으로 이번 판을 읽을 수 없고, 라운드의 7분의 1쯤은 다른 성격으로 두기도 해요. 성격은 결과 화면에 공개돼요. 성격은 조용한 라운드의 베팅만 바꿔요. 다섯이 걸린 라운드에서는 기대값이 압도해서 모든 성격이 이기려고 걸어요.' },
          { type: 'table', head: ['성격', '이월 중시', '거는 비율', '몰아 걸기', '섞는 정도'], rows: [
            ['균형형', '1', '65~90%', '보통', '0.25'],
            ['저축형', '1.9 (많이 아껴요)', '45~70%', '보통', '0.25'],
            ['공격형', '0.35 (거의 안 아껴요)', '90~100%', '보통', '0.2'],
            ['저격형', '1', '70~100%', '한 점에 몰아요 (2.2)', '0.3'],
            ['분산형', '0.9', '65~90%', '고르게 나눠요 (0.6)', '0.25'],
            ['변칙형', '1.1', '50~100%', '보통', '0.55 (가장 많이 섞어요)'],
          ] },
          { type: 'p', text: '커밋 기록에 따르면 자기대국에서 어려움은 어떤 성격이든 보통을 20판 중 19~20판 이겼어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요.',
        blocks: [
          { type: 'p', text: '카드 장기 어려움은 416판 중 사람이 **18.8%**를 이겼어요. 목표 25%보다 조금 어려운 편이에요. 포인트 오목은 어려움 45.5%(233판), 보통 56.1%(132판)였어요.' },
          { type: 'table', caption: '포인트 오목, 성격별 사람 승률 (보통·어려움 합산)', head: ['성격', '사람 승률', '판수'], rows: [
            ['변칙형', '36.0%', '75판'],
            ['저축형', '46.4%', '56판'],
            ['저격형', '47.8%', '67판'],
            ['분산형', '48.2%', '56판'],
            ['균형형', '56.9%', '58판'],
            ['공격형', '61.9%', '63판'],
          ] },
          { type: 'p', text: '가장 많이 섞는 변칙형이 가장 어렵고, 점수를 아끼지 않는 공격형이 가장 쉬웠어요. 흑과 백에서 본 "읽히지 않는 AI가 강하다"는 교훈이 여기서도 보여요. 다만 성격마다 판수가 아직 60판 안팎이라 차이는 더 지켜봐야 해요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { tag: '카드 장기', title: '평균의 함정', body: 'AI는 모든 세계의 평균으로 수를 골라요. 내 카드 순서가 "드문 세계"일수록 AI의 대비가 얇아요. 첫 카드들을 뻔하지 않게 배치하면 AI의 평균 계산이 빗나가요.' },
            { tag: '카드 장기', title: '빔 바깥의 배치', body: 'AI 자신의 카드 순서는 한 장씩 키우며 좋은 것만 남긴 결과라, 첫 두세 장은 "당장 좋은" 카드일 가능성이 커요. 뒤집힌 첫 카드로 나머지 순서를 짐작해 보세요.' },
            { tag: '포인트 오목', title: '성격은 결과 화면에서', body: '한 판 안에서는 같은 성격이 대부분의 라운드를 둬요. 초반 몇 라운드의 베팅 크기와 몰아 걸기를 보고 성격을 짐작하면, 남은 라운드의 이월 전략을 맞출 수 있어요.' },
            { tag: '포인트 오목', title: '조용한 라운드', body: '성격이 드러나는 건 다섯이 걸리지 않은 라운드예요. 저축형·변칙형은 그런 라운드에서 적게 걸 때가 많으니, 이때 싸게 자리를 차지해 두세요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/cardJanggi.ts`(규칙과 방송이 열어 둔 판정 주석), `src/lib/cardJanggiAi.ts`(세계·빔 탐색), `scripts/card-janggi-arena.ts`',
      '`src/lib/pointOmok.ts`(규칙), `src/lib/pointOmokAi.ts`(PO_STYLES, STYLE, 베팅)',
      '커밋 d915a97 (11/24 포인트 오목, 장목 수정), 3e2be87 (11/24 쉬움 제외, 여섯 성격, 자기대국), d8bb731 (11/25 카드 장기)',
      'DB 집계(2026-11-26 14:22 KST): game_results(game=card_janggi·point_omok, mode=ai) 난이도별 승률, 포인트 오목 detail.style별 승률',
    ],
  },
  en: {
    meta: {
      title: 'Card Janggi and Point Omok AI dev notes — hidden cards and secret bids | Dev notes',
      description: "Card Janggi from the Devil's Plan 3 final and Point Omok, a secret-bid gomoku: how the AI searches every possible world when it cannot see your choice, a beam search that grows its card order one card at a time, six bidding styles drawn per game, and real win rates by style.",
      keywords: ['Card Janggi AI', 'Point Omok AI', "Devil's Plan 3 Card Janggi", 'secret bid game', 'imperfect information game AI', 'game AI dev diary'],
    },
    title: 'Card Janggi and Point Omok AI dev notes',
    lead: 'When it cannot see your hand, the AI imagines every possibility.',
    intro: [
      'Card Janggi and Point Omok both arrived on the nights of 24–25 November, and in both you play **without knowing what the other side chose**: in Card Janggi, the order of their face-down cards; in Point Omok, the points they bid in secret.',
      'The first rule for a fair AI is the same in both: **it gets only what a player in that seat knows.** This note shows how each AI handles what it does not know.',
    ],
    summary: 'A Card Janggi AI that searches every possible order of your face-down cards, and a Point Omok AI that narrows your budget, samples your bids and plays one of six styles per game.',
    sections: [
      {
        id: 'card-rules',
        title: 'Card Janggi: the rules',
        blocks: [
          { type: 'p', text: 'Card Janggi is match 1 of the final of The Devil’s Plan: Dead Again. On a 6×5 board each side has a king and three small pieces, and both share the same five movement cards (rat: one square orthogonally; horse: a knight’s jump; monkey: one square in eight directions; elephant: a diagonal slide; giraffe: exactly two squares orthogonally, jumping). Both lay out their card order face down at the same time (the first player five cards, the second four in its first cycle only) and turn them up one by one, moving a piece as each card allows. Take the enemy king, or move your king onto its starting square, to win.' },
          { type: 'p', text: 'What the show left open, the site decided: a card with no legal move is simply used up, the giraffe jumps while the elephant is blocked, and a round that runs too long goes to the side with more pieces. The code comment lists these separately as "calls the show left open (ours)".' },
        ],
      },
      {
        id: 'card-ai',
        title: 'The Card Janggi AI: every possible world',
        blocks: [
          { type: 'p', text: 'Card Janggi has a single AI level, Hard. It is given its own layout, and of yours only the cards already used and the one face up. The order of your remaining face-down cards is unknown.' },
          { type: 'steps', items: [
            { title: 'Build the worlds', body: 'Each order your face-down cards could be in is a "world". With at most four face-down cards there are at most 4! = 24.' },
            { title: 'An ordinary game per world', body: 'Within one world both layouts are fixed, so it is an ordinary two-player game with no hidden information. Alpha-beta with a transposition table (iterative deepening) scores every move.' },
            { title: 'Pick by the average', body: 'It plays the move with the best average win chance over all worlds — a move that is decent in most worlds rather than great in one.' },
          ] },
          { type: 'p', text: 'Laying out cards is harder: five cards have 120 orders, so the AI **grows the order one card at a time** — candidate first cards, then first two, keeping only the best prefixes (a beam search). Each prefix is searched just far enough to see all its cards played, against the possible orders of yours. Beyond the end of a known layout, a side is assumed to play any card it has left in that cycle.' },
          { type: 'callout', tone: 'note', title: 'The same search on a timeout', text: 'In Card Janggi, if a player runs out of time the opponent moves for them using their card. When the AI moves for you, the same search picks **the move worst for you**.' },
          { type: 'p', text: 'The launch commit also included a self-play script (`scripts/card-janggi-arena.ts`). It plays the AI against a simple "win or capture when you can" side and a random one, checking every state on the way: one king each while the round is on, no piece appearing from nowhere, face-down cards never handed to the other side.' },
        ],
      },
      {
        id: 'point-rules',
        title: 'Point Omok: the rules',
        blocks: [
          { type: 'p', text: 'In Point Omok, each round the chooser marks three empty points in a row, and both players secretly split their points over them. Each point gets the stone of whoever bid more; a tie goes to the player who did not choose. You get 10 points a round, half of what is left (rounded down) carries over, and every point needs at least 1. More fives wins, and six or more in a row is not a five — a fix made separately right after launch.' },
        ],
      },
      {
        id: 'point-ai',
        title: 'The Point Omok AI: narrowing budgets, and styles',
        blocks: [
          { type: 'p', text: 'The AI gets the board, the public record of each round (who chose, which points, whose stone landed where) and its own bids — never your bids or your points.' },
          { type: 'list', items: [
            '**Choosing points**: for each line of three near the stones, it looks at how the board would be after each of the eight ways the three points could fall, weighted by how likely each is.',
            '**Bidding (Hard)**: from the grant and carry rules and past results it narrows your remaining points to a range, samples your bids from it, scores every split of its own points by expected board value plus the value of what it carries over, and draws one of the best — so its bids cannot be read off the board.',
          ] },
          { type: 'h3', text: 'Six bidding styles' },
          { type: 'p', text: 'Eight minutes after launch Easy was dropped and **each AI game draws a bidding style at random**, so habits from one game do not carry to the next; about one round in seven is played in another style. The style is revealed on the result screen. Styles bend only quiet rounds: with a five at stake the expected value dominates and every style bids to win.' },
          { type: 'table', head: ['Style', 'Values carrying', 'Share bid', 'Piling', 'Mixing'], rows: [
            ['Balanced', '1', '65–90%', 'normal', '0.25'],
            ['Saver', '1.9 (saves a lot)', '45–70%', 'normal', '0.25'],
            ['Aggressive', '0.35 (hardly saves)', '90–100%', 'normal', '0.2'],
            ['Sniper', '1', '70–100%', 'piles on one point (2.2)', '0.3'],
            ['Spread', '0.9', '65–90%', 'spreads evenly (0.6)', '0.25'],
            ['Bluffer', '1.1', '50–100%', 'normal', '0.55 (mixes most)'],
          ] },
          { type: 'p', text: 'According to the commit, in self-play Hard beat Normal 19–20 games out of 20 in every style.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'p', text: 'People won **18.8%** of 416 games against Card Janggi’s Hard — a little harder than the 25% target. In Point Omok they won 45.5% against Hard (233 games) and 56.1% against Normal (132).' },
          { type: 'table', caption: 'Point Omok: human win rate by AI style (Normal and Hard together)', head: ['Style', 'Human win rate', 'Games'], rows: [
            ['Bluffer', '36.0%', '75'],
            ['Saver', '46.4%', '56'],
            ['Sniper', '47.8%', '67'],
            ['Spread', '48.2%', '56'],
            ['Balanced', '56.9%', '58'],
            ['Aggressive', '61.9%', '63'],
          ] },
          { type: 'p', text: 'The Bluffer, which mixes most, was hardest, and the Aggressive style, which never saves, easiest — the same lesson as Black & White: an AI that cannot be read is strong. With only about 60 games per style, though, the gaps need more time.' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Card Janggi', title: 'The trap of averages', body: 'The AI chooses by the average over all worlds. The rarer your actual order is among them, the thinner its preparation. Lay out your first cards unpredictably and its averages miss.' },
            { tag: 'Card Janggi', title: 'Outside its beam', body: 'Its own order is grown one card at a time keeping the best prefixes, so its first two or three cards are likely the "good right now" ones. Use its face-up first card to guess the rest.' },
            { tag: 'Point Omok', title: 'Read the style early', body: 'Within a game, one style plays most rounds. Watch the size and piling of its first few bids, guess the style, and set your carry-over plan for the rest.' },
            { tag: 'Point Omok', title: 'Quiet rounds', body: 'Styles show in rounds with no five at stake. Savers and Bluffers often bid low then — take your points cheaply.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/cardJanggi.ts` (rules and the show’s open calls), `src/lib/cardJanggiAi.ts` (worlds, beam search), `scripts/card-janggi-arena.ts`',
      '`src/lib/pointOmok.ts` (rules), `src/lib/pointOmokAi.ts` (PO_STYLES, STYLE, bidding)',
      'Commits d915a97 (11/24 Point Omok, overline fix), 3e2be87 (11/24 Easy dropped, six styles, self-play), d8bb731 (11/25 Card Janggi)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (game = card_janggi, point_omok; mode = ai) win rate by level, Point Omok win rate by detail.style',
    ],
  },
};

export default article;
