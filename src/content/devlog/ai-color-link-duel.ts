import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-color-link-duel',
  category: 'ai',
  games: ['colorLinkDuel'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '컬러 링크 AI 개발기 — 퍼즐 풀이기로 두는 AI와 "공간 경주" | 개발 노트',
      description: '데블스 플랜 3 결승의 컬러 링크를 두는 AI 개발기. 선을 모두 이을 수 있는지 증명하는 풀이기, 판을 "남은 외톨이 색과 빈 선"의 경주로 바꿔 계산하는 방법, 사람이 2.7%밖에 못 이기던 AI가 매우 어려움(헬모드)이 된 사연까지 정리했어요.',
      keywords: ['컬러 링크 AI', '컬러 링크 헬모드', '데블스플랜3 컬러 링크', '데블스 플랜 결승', '컬러 링크 공략', '퍼즐 풀이기', '게임 AI 개발기'],
    },
    title: '컬러 링크 AI 개발기',
    lead: '두는 AI보다 먼저, 증명하는 풀이기를 만들었어요.',
    intro: [
      '컬러 링크는 데블스 플랜 3 결승 2회차 게임이에요. 두 사람이 번갈아 판에 색 돌을 놓는데, 같은 색 돌 두 개는 언제나 **6칸 이상의 자기 선**으로 이어질 수 있어야 하고, 선끼리는 교차하거나 칸을 나눠 쓸 수 없어요. 상대가 방금 놓은 돌 때문에 더 이상 다 이을 수 없다고 생각하면 "불가능"을 외치고, 돌을 놓은 쪽은 모든 선을 직접 그려서 증명해야 해요.',
      '이 게임의 AI는 수를 "읽는" 대신 퍼즐을 "푸는" 데서 시작했어요. 이 글은 그 풀이기와, 풀이기 위에 얹은 전략, 그리고 너무 강해서 매우 어려움이 된 AI의 이야기예요.',
    ],
    summary: '선을 모두 이을 수 있는지 증명하는 풀이기와, 판을 "외톨이 색과 빈 선"의 경주로 계산하는 전략. 사람이 2.7%만 이기던 AI가 헬모드가 되기까지.',
    sections: [
      {
        id: 'solver',
        title: '먼저 풀이기',
        blocks: [
          { type: 'p', text: '컬러 링크는 11월 25일 새벽에 올라갔어요. 이 게임은 판정부터 컴퓨터가 해야 해요. "불가능"이 맞는지, 증명이 맞는지 따지려면 **지금 판의 모든 색을 이을 수 있는가**에 답하는 풀이기가 필요하거든요. 같은 풀이기가 AI의 눈이 되고, 증명에 실패했을 때 "이렇게 이으면 됐어요"를 보여 주는 데에도 쓰여요.' },
          { type: 'p', text: '풀이기는 깊이 우선 탐색으로 한 번에 한 색씩 선을 그어 봐요. 가장 비좁은 색부터, 목표 쪽으로 선을 늘려 가요. 짝이 아직 없는 외톨이 돌은 정확히 6칸짜리 선이 들어갈 자리가 있는지를 봐요. 탐색이 폭발하지 않도록 세 가지로 가지를 쳐요.' },
          { type: 'list', items: [
            '**지름길**: 선이 자기 자신에 닿는 모양은 필요 없어요. 지름길로 가도 6칸 이상이면 그쪽이 칸을 덜 쓰니까요.',
            '**도달과 공간**: 아직 안 그린 색은 두 돌이 같은 빈 영역에 있어야 하고, 그 영역이 선을 담을 만큼 커야 해요. 그 영역만 쓸 수 있는 색들이 모두 들어가야 하고요.',
            '**이미 본 막다른 길**: 같은 칸이 차 있고 같은 색들이 끝난 상태는 다시 탐색하지 않아요.',
          ] },
          { type: 'p', text: '탐색량에 상한을 두어서, 넘으면 "모름"이라고 답해요. AI는 "불가능"을 외칠 때 이 풀이기가 **확실히 불가능하다고 증명한 경우에만** 외쳐요. 자기 판을 증명할 때도 풀이기가 찾은 선을 그대로 써요. 그래서 이길 수 있는 증명을 놓치지 않고, 살릴 수 있는 판에 불가능을 외치지도 않아요.' },
        ],
      },
      {
        id: 'race',
        title: '판을 숫자 두 개로: "공간 경주"',
        blocks: [
          { type: 'p', text: '풀이기만으로는 "어디에 놓을지"가 나오지 않아요. 여기서 코드 주석에 적은 관찰이 핵심이 돼요. **차례인 사람은 외톨이 색 두 개를 선 끝에 짝을 놓아 완성하는 수가 언제나 가능하다.** 그러니 막히는 경우는 딱 하나예요. 외톨이 색이 정확히 하나 남았고, 새 색의 6칸 선이 들어갈 자리가 전혀 없을 때예요.' },
          { type: 'p', text: '그래서 판을 숫자 두 개로 줄였어요. s = 차례인 사람 앞의 외톨이 색 수, f = 빈 땅에 아직 들어갈 수 있는 새 6칸 선의 수(모서리부터 욕심내서 채워 본 대략값). 한 차례에 할 수 있는 일은 세 가지예요.' },
          { type: 'table', head: ['수', 's', 'f'], rows: [
            ['외톨이 두 개를 완성', 's − 2', '그대로'],
            ['하나 완성 + 새 색 하나 시작', '그대로', 'f − 1'],
            ['새 색 두 개 시작', 's + 2', 'f − 2'],
          ] },
          { type: 'p', text: '이 작은 게임은 미리 끝까지 풀어 둘 수 있어요. s가 15, f가 12까지인 모든 경우에 "차례인 사람이 이기는가"를 표로 만들어 두고(이기는 수 = 상대를 지는 칸으로 보내는 수), AI는 실제로 놓을 수 있는 모든 자리를 풀이기로 확인한 뒤 그 표에서 **상대가 이길 수 없는 쪽**으로 판을 몰아요.' },
        ],
      },
      {
        id: 'place',
        title: '매우 어려움이 한 차례에 하는 일',
        blocks: [
          { type: 'steps', items: [
            { title: '첫 돌', body: '게임의 첫 돌은 가장자리를 피해서, 네 이웃이 모두 빈 칸 중 아무 데나 놓아요. 경주에 쓸 공간을 남기기 위해서예요.' },
            { title: '이어질 수 있는 수만', body: '가능한 배치를 섞은 뒤 하나씩 풀이기에 넣어, 놓은 뒤에도 모든 색을 이을 수 있는 배치만 남겨요. 새 색은 서로 바꿔도 같으니 하나로 대표해요.' },
            { title: '끝내는 수 찾기', body: '상대를 "외톨이 하나, 빈 선 0"으로 만드는 배치가 있으면, 판의 칸을 하나하나 확인해서 정말 막히는지 증명한 다음 둬요.' },
            { title: '경주 표', body: '없으면 경주 표에서 상대가 이길 수 없는 쪽, 빈 선을 덜 남기는 쪽을 골라요. 같은 점수끼리는 작은 무작위로 섞어요.' },
            { title: '상대의 끝내는 수 막기', body: '상위 12개 후보 중에서, 놓은 뒤 상대에게 끝내는 수가 생기지 않는 첫 배치를 둬요.' },
          ] },
          { type: 'p', text: '이을 수 있는 배치가 하나도 없으면(이미 진 판이면) 풀이기가 가장 오래 헤맨 배치, 즉 **가장 꿰뚫어 보기 어려운 배치**를 둬요. 사람이 불가능을 외치지 못하고 지나칠 가능성을 남기는 거예요.' },
        ],
      },
      {
        id: 'too-strong',
        title: '너무 강해서 헬모드가 됐어요',
        blocks: [
          { type: 'p', text: '처음 AI는 한 판에 1.8초를 생각했고, 같은 날 아침 한 판으로 끝나는 규칙(첫 점수가 승리, 놓기 1분, 증명 2분)으로 바꾸면서 0.9초로 줄였어요. 그날 밤에는 방송의 7×7 판에 더해 모양 판 12개(네 방, 도넛, 기둥 숲, 액자, 계단, H, 지그재그, 화살표, 하트, 다이아몬드, 십자, 모래시계)를 넣고, AI전 난이도를 "판의 난이도"로 정했어요. AI는 그대로 두고 판이 난이도를 정하는 방식이었죠. 판 난이도는 자기대국으로 나눴어요. 놓을 때 판을 깨지는 않지만 계획은 없는 플레이어가 큰 열린 판(네 방, 도넛)에서는 약 30%, 좁은 판(클래식, 하트)에서는 약 10%를 이겼어요. 미로와 소용돌이는 거의 외길이라 금방 끝나서 빠졌어요.' },
          { type: 'p', text: '그런데 이 AI는 사람에게 너무 강했어요. 코드 주석의 기록으로, 11월 26일까지 **590판에서 사람이 2.7%만** 이겼어요. 그래서 11월 26일에 이 AI를 그대로 **매우 어려움**으로 올리고(헬모드 판에서는 어려운 판만 나와요), 사람처럼 빈틈이 있는 어려움과 보통을 새로 만들었어요.' },
          { type: 'table', head: ['난이도', '계획하는 차례', '불가능을 놓칠 확률', '확인 없이 놓기'], rows: [
            ['보통', '0%', '50%', '7%'],
            ['어려움', '40%', '30%', '0%'],
            ['매우 어려움', '100%', '0%', '0%'],
          ] },
          { type: 'p', text: '"계획하지 않는 차례"에는 섞은 배치 중 이어질 수 있는 첫 배치를 아무거나 둬요. "불가능을 놓치면" 이미 깨진 판에서 불가능을 외치지 않고 계속 둬요. 보통의 "확인 없이 놓기"는 판을 깰 수도 있는 배치예요. 이 숫자들은 코드에 "첫 추측, 기록을 보고 다시 맞출 것"이라고 적어 둔 값이에요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요. 새 난이도가 생긴 지 반나절 남짓 된 숫자예요.',
        blocks: [
          { type: 'table', head: ['난이도 (11/26 이후)', '사람 승률', '판수'], rows: [
            ['보통', '38.8%', '98판'],
            ['어려움', '35.1%', '77판'],
            ['매우 어려움', '20.4%', '137판'],
          ] },
          { type: 'p', text: '같은 AI인데도 매우 어려움의 승률이 예전 2.7%보다 훨씬 높아요. 판별로 보면 십자 판에서 44.4%(27판)로 유난히 높고, 하트 판은 3.3%(30판)였어요. 판 수가 아직 적어서 판 자체의 차이인지는 더 지켜봐야 해요. 매우 어려움 인증서를 받은 사람은 9명이에요. 전체 판수(로그인 여부 무관)는 2,359판, 그중 AI전 1,935판이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { tag: '보통', title: '깨진 판을 반은 못 봐요', body: '판이 이미 이을 수 없게 됐는데도 절반 확률로 불가능을 외치지 않아요. 그리고 7%의 차례는 확인 없이 놓기 때문에, AI가 놓은 직후 판을 의심해 볼 가치가 있어요.' },
            { tag: '어려움', title: '계획은 열 번 중 네 번', body: '나머지 차례에는 이어질 수 있는 아무 배치나 둬요. 외톨이 색 수를 홀짝으로 맞춰 경주를 내 쪽으로 가져오기 좋아요.' },
            { tag: '매우 어려움', title: '빈 선 세기는 대략값', body: '빈 땅에 들어갈 새 선의 수 f는 모서리부터 욕심내서 채워 본 근사값이에요. 좁은 통로가 많은 판에서는 실제보다 많거나 적게 셀 수 있어서, 경주 표의 판단이 어긋날 여지가 있어요. 끝내는 수는 칸 단위로 증명하지만, 그 전 단계의 길잡이는 근사예요.' },
            { tag: '공통', title: '"모름"은 이을 수 없음으로', body: '풀이기가 시간 안에 답을 못 내는 배치는 AI가 고르지 않아요. 아주 복잡한 판으로 끌고 가면 AI의 선택지가 줄어요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/colorLinkDuel.ts` — 규칙과 풀이기(solve)',
      '`src/lib/colorLinkDuelAi.ts` — CLD_LEVELS, 공간 경주 표(raceWin), freeLines, aiPlace, stuck, opponentFinishes',
      '`src/lib/colorLinkDuelBoards.ts` — 판 13개와 판 난이도(자기대국 근거 주석)',
      '`scripts/color-link-duel-arena.ts`, `scripts/color-link-duel-boards.ts`, `scripts/color-link-duel-tiers.ts` — 자기대국',
      '커밋 8788eea (11/25 컬러 링크), 939a7b6 (11/25 한 판 승부·0.9초), 7a9c4fe (11/25 판 13개), e227318 (11/26 매우 어려움·새 보통/어려움)',
      'DB 집계(2026-11-26 14:22 KST): game_results(game=color_link_duel, mode=ai)의 11/26 00:24 이후 난이도별 승률과 매우 어려움의 판별 승률, hell_clears 인원, game_plays_daily 합계',
    ],
  },
  en: {
    meta: {
      title: 'Color Link AI dev notes — an AI built on a puzzle solver and a "race of space" | Dev notes',
      description: "How the AI for Color Link, the Devil's Plan 3 final game, was built: a solver that proves every line can still be drawn, a way to turn the board into a race between lone colours and free lines, and how an AI people beat 2.7% of the time became the Very Hard (hell mode) level.",
      keywords: ['Color Link AI', 'Color Link hell mode', "Devil's Plan 3 Color Link", "Devil's Plan final", 'puzzle solver', 'game AI dev diary'],
    },
    title: 'Color Link AI dev notes',
    lead: 'Before an AI that plays, a solver that proves.',
    intro: [
      "Color Link is the second game of The Devil's Plan 3 final. Two players take turns placing coloured stones; every pair of same-coloured stones must always be joinable by **its own line of 6 cells or more**, and lines may not cross or share a cell. If you think the stones just placed made that impossible, you call it, and the player who placed them must prove otherwise by drawing every line.",
      'This AI starts not from reading moves but from solving the puzzle. This note covers the solver, the strategy on top of it, and how the AI turned out so strong it became the Very Hard level.',
    ],
    summary: 'A solver that proves every line can be drawn, and a strategy that turns the board into a race of lone colours and free lines — the AI people beat 2.7% of the time became hell mode.',
    sections: [
      {
        id: 'solver',
        title: 'The solver comes first',
        blocks: [
          { type: 'p', text: 'Color Link launched in the early hours of 25 November. In this game even the referee has to be a computer: to judge a call or a proof you need a solver that answers **can every colour on this board still be joined?** The same solver is the AI’s eyes, and shows "this is how it could have been joined" after a failed proof.' },
          { type: 'p', text: 'It is a depth-first search that draws one colour at a time, the most cramped first, growing each line toward its target. A lone stone without its partner needs room for a line of exactly 6 cells. Three kinds of pruning keep it from exploding:' },
          { type: 'list', items: [
            '**Shortcuts**: a line never needs to touch itself — if the shortcut is still 6 cells or more, it uses fewer cells.',
            '**Reach and room**: each colour still to draw needs both stones in the same open region, big enough for its line, and a region must hold all the colours that can only use it.',
            '**Dead ends already seen**: the same cells taken with the same colours done is never searched twice.',
          ] },
          { type: 'p', text: 'Its work is capped; past the cap it answers "unknown". The AI calls a board impossible **only when the solver proves it**, and proves its own boards with the solver’s lines. So it never loses a proof it could win and never calls a board that can be saved.' },
        ],
      },
      {
        id: 'race',
        title: 'The board as two numbers: a race of space',
        blocks: [
          { type: 'p', text: 'The solver says what is legal, not where to play. The key is an observation in the code comment: **the player to move can always complete two lone colours by placing their partners at the ends of their lines.** So there is only one way to get stuck — facing exactly one lone colour with no room left for a new colour’s 6-cell line.' },
          { type: 'p', text: 'That reduces the board to two numbers: s, the lone colours facing the mover, and f, how many new 6-cell lines the free ground still holds (a greedy packing, corners first). A turn can do one of three things:' },
          { type: 'table', head: ['Move', 's', 'f'], rows: [
            ['Complete two lone colours', 's − 2', 'same'],
            ['Complete one, start one', 'same', 'f − 1'],
            ['Start two new colours', 's + 2', 'f − 2'],
          ] },
          { type: 'p', text: 'That little game can be solved in advance: a table says, for every s up to 15 and f up to 12, whether the mover wins (a winning move sends the opponent to a losing entry). The AI checks every real placement with the solver, then steers toward **the side of the table the opponent cannot win from**.' },
        ],
      },
      {
        id: 'place',
        title: 'What Very Hard does on a turn',
        blocks: [
          { type: 'steps', items: [
            { title: 'Opening stone', body: 'Anywhere away from the edge, on a cell whose four neighbours are all empty — leaving space for the race.' },
            { title: 'Only joinable placements', body: 'Shuffle every placement and keep those after which the solver can still join every colour. New colours are interchangeable, so one stands for all.' },
            { title: 'Look for a finish', body: 'If a placement may leave the opponent with one lone colour and no free line, prove it cell by cell, then play it.' },
            { title: 'The race table', body: 'Otherwise pick the side of the table the opponent cannot win from, leaving fewer free lines; ties are mixed with a little randomness.' },
            { title: 'Deny their finish', body: 'Among the top 12, play the first placement after which the opponent has no finishing move.' },
          ] },
          { type: 'p', text: 'If no placement can be joined (the board is already lost), it plays the one the solver struggled with longest — **the hardest one to see through** — leaving a chance that you miss the call.' },
        ],
      },
      {
        id: 'too-strong',
        title: 'So strong it became hell mode',
        blocks: [
          { type: 'p', text: 'At first the AI thought for 1.8 s; the same morning, with single-round games (first point wins, 1-minute placements, 2-minute proofs), that dropped to 0.9 s. That night the show’s 7×7 board was joined by twelve shaped boards (Four Rooms, Donut, Pillar Forest, Frame, Stairs, H, Zigzag, Arrow, Heart, Diamond, Cross, Hourglass), and the AI difficulty became the board’s difficulty: the same AI everywhere, the board deciding how hard it is. Board tiers came from self-play: a player who never breaks the board but plans nothing won about 30% on big open boards (Four Rooms, Donut) and about 10% on tight ones (Classic, Heart). Maze and Spiral were left out — nearly all one-lane corridors, short forced games.' },
          { type: 'p', text: 'But this AI was too strong for people. The code comment records that by 26 November **people had won 2.7% of 590 games**. So on 26 November it became the **Very Hard** level as it was (hell games deal only hard boards), and new Hard and Normal levels with human-like gaps were added.' },
          { type: 'table', head: ['Level', 'Turns it plans', 'Misses a broken board', 'Places without checking'], rows: [
            ['Normal', '0%', '50%', '7%'],
            ['Hard', '40%', '30%', '0%'],
            ['Very Hard', '100%', '0%', '0%'],
          ] },
          { type: 'p', text: 'On an unplanned turn it plays the first joinable placement in random order. When it "misses", it plays on instead of calling an already broken board. Normal’s unchecked placements may break the board themselves. The code marks these numbers as first guesses, to be retuned from play data.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST — about half a day after the new levels.',
        blocks: [
          { type: 'table', head: ['Level (from 11/26)', 'Human win rate', 'Games'], rows: [
            ['Normal', '38.8%', '98'],
            ['Hard', '35.1%', '77'],
            ['Very Hard', '20.4%', '137'],
          ] },
          { type: 'p', text: 'The same AI now loses far more often than its earlier 2.7%. By board, Cross stands out at 44.4% (27 games) while Heart was 3.3% (30 games); with so few games it is too early to say how much is the boards themselves. Nine players hold the Very Hard certificate. In all (signed in or not) the game had been played 2,359 times, 1,935 against the AI.' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Normal', title: 'Blind to half the broken boards', body: 'Half the time it does not call a board that can no longer be joined. And on 7% of turns it places without checking — right after its move is a good time to doubt the board.' },
            { tag: 'Hard', title: 'Plans four turns in ten', body: 'On the other turns it plays any joinable placement. A good moment to set the parity of lone colours so the race comes your way.' },
            { tag: 'Very Hard', title: 'Free lines are an estimate', body: 'f, the number of new lines the free ground holds, is a greedy approximation. On boards with many narrow passages it can be off, so the race table can mislead it. Finishing moves are proven cell by cell; the guidance before that is approximate.' },
            { tag: 'All', title: '"Unknown" counts as unjoinable', body: 'Placements the solver cannot settle in time are never chosen. Drag the board into complexity and the AI’s options shrink.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/colorLinkDuel.ts` — rules and the solver (solve)',
      '`src/lib/colorLinkDuelAi.ts` — CLD_LEVELS, the race table (raceWin), freeLines, aiPlace, stuck, opponentFinishes',
      '`src/lib/colorLinkDuelBoards.ts` — the 13 boards and their tiers (self-play notes)',
      '`scripts/color-link-duel-arena.ts`, `scripts/color-link-duel-boards.ts`, `scripts/color-link-duel-tiers.ts` — self-play',
      'Commits 8788eea (11/25 Color Link), 939a7b6 (11/25 single round, 0.9 s), 7a9c4fe (11/25 13 boards), e227318 (11/26 Very Hard, new Normal/Hard)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (game = color_link_duel, mode = ai) win rate by level since 11/26 00:24 and Very Hard by board, hell_clears count, game_plays_daily totals',
    ],
  },
};

export default article;
