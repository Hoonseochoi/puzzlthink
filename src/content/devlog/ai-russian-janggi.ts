import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-russian-janggi',
  category: 'ai',
  games: ['russianJanggi'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '러시아장기 AI 개발기 — 완벽한 AI도 지는 첫 수, 가운데 큰 컵 | 개발 노트',
      description: '러시아장기(컵 쌓기 틱택토) AI가 난이도마다 몇 수를 읽는지, 보통과 어려움이 똑같아졌던 일, 그리고 끝까지 읽는 매우 어려움(헬모드)이 왜 선공의 "가운데 큰 컵"에는 질 수밖에 없는지, 그래서 어떤 대비를 넣었는지 정리했어요.',
      keywords: ['러시아장기 AI', '러시아장기 헬모드', '러시아장기 필승법', '소사이어티 게임 러시아장기', '컵 틱택토', '고블렛 게임 AI', '게임 AI 개발기'],
    },
    title: '러시아장기 AI 개발기',
    lead: '끝까지 읽는 AI를 만들었더니, 이길 수 없는 첫 수가 보였어요.',
    intro: [
      '러시아장기는 3×3 판의 틱택토에 "컵 덮기"를 더한 게임이에요. 양쪽 모두 작은·중간·큰 컵을 두 개씩 들고, 빈칸이나 더 작은 컵 위에 컵을 놓거나, 판 위의 내 컵을 들어 옮겨요. 컵을 들면 밑에 있던 줄이 드러날 수 있고, 그 줄이 상대 색이면 상대가 이겨요.',
      '말이 적고 판이 작아서 컴퓨터가 끝까지 읽을 수 있는 게임이에요. 그래서 이 게임에서는 다른 게임과 반대되는 일이 생겼어요. 가장 강한 AI가, 가장 많이 지는 헬모드 AI가 되었거든요. 그 이유를 코드와 기록으로 풀어 볼게요.',
    ],
    summary: '끝까지 읽는 매우 어려움도 선공의 "가운데 큰 컵"에는 이론상 져요. 그 사실이 AI 설계와 실제 승률에 남긴 흔적.',
    sections: [
      {
        id: 'first',
        title: '첫날 밤: 놓기만 하던 게임에서 옮기는 게임으로',
        blocks: [
          { type: 'p', text: '러시아장기는 11월 16일 밤 11시에 처음 올라갔어요. 첫 버전은 컵을 놓기만 할 수 있었고, AI는 0.7초 안에서 반복 심화 알파베타 탐색을 했어요. 24분 뒤 들어간 수정에서 판 위의 내 컵을 옮기는 규칙이 생겼어요. 컵을 들면 밑의 줄이 드러나는 규칙도 이때 생겼고, 옮기기만 하며 끝없이 버틸 수 있어서 **80수 무승부** 제한도 같이 넣었어요. AI도 옮기는 수까지 읽도록 바뀌었어요.' },
          { type: 'p', text: '쉬움~어려움의 평가식은 틱택토 AI의 고전적인 방식이에요. 여덟 줄(가로 3, 세로 3, 대각 2)마다, 상대 컵이 하나도 보이지 않는 줄이면 **내 컵 수의 제곱 × 3**과 그 줄의 내 큰 컵 × 2를 더해요(상대도 똑같이 빼요). 가운데 칸 맨 위가 내 컵이면 4점, 손에 남은 큰 컵은 하나에 3점, 중간 컵은 1점이에요. 큰 컵은 아무것도 덮을 수 없으니 오래 들고 있을수록 마지막 한 방이 된다고 본 거예요. 탐색은 가운데 → 모서리 → 변 순서로 칸을 읽어요.' },
        ],
      },
      {
        id: 'retune',
        title: '보통과 어려움이 똑같아졌어요',
        blocks: [
          { type: 'p', text: '11월 20일 첫 기록 점검에서 러시아장기는 반대로 너무 어려웠어요. 사람 승률이 보통 18%, 어려움 11%였어요(목표는 50%와 25%). 그래서 탐색을 얕게 하고 무작위를 늘렸어요. 보통은 가끔 "당장 지지 않는 아무 수"를 두게 했고, 어려움은 대략 예전 보통 정도로 낮췄어요.' },
          { type: 'p', text: '그런데 11월 26일에 다시 보니 이번엔 보통과 어려움이 **둘 다 두 수를 읽어서 사실상 같은 AI**가 되어 있었어요. 코드 주석에 남은 숫자로는 보통 27%, 어려움 40%로 오히려 어려움이 더 쉬웠고, 두 난이도를 모두 둔 사람끼리만 비교하면 34%와 33%로 차이가 없었어요. 그래서 지금은 이렇게 나눴어요.' },
          { type: 'table', head: ['난이도', '수 고르기'], rows: [
            ['쉬움', '바로 이기는 수가 있으면 75% 확률로 둬요. 나머지는 55% 확률로 "2수 탐색에서 지지 않는 수" 중 무작위, 아니면 아무 수.'],
            ['보통', '열 번 중 네 번은 "바로 지지 않는 수" 중 무작위. 나머지는 2수 탐색(0.12초) + 큰 무작위(14점).'],
            ['어려움', '3수 탐색(0.3초) + 작은 무작위(7점). 승패가 정해진 수에는 무작위를 더하지 않아요.'],
            ['매우 어려움', '최대 60수까지 반복 심화(PC 1.5초, 휴대폰 1초). 아래에서 자세히.'],
          ] },
        ],
      },
      {
        id: 'hell',
        title: '매우 어려움: 운도, 숨은 정보도 없는 게임',
        blocks: [
          { type: 'p', text: '11월 24일, 십이장기와 같은 커밋으로 매우 어려움이 들어갔어요. 코드 첫 줄 주석이 이 게임의 성격을 정확히 말해 줘요. **주사위도 숨은 컵도 없는 완전 정보 게임이라 평균 낼 것이 없고, 탐색은 정확한 결과를 읽는다.** 구조는 십이장기 엔진과 같은 PVS + 치환표 + 킬러·히스토리 정렬이고, 판은 "칸 × 크기" 27칸 배열로 표현해요.' },
          { type: 'list', items: [
            '**드러나는 줄까지 정확히**: 컵을 들어서 밑에 있던 상대 줄이 드러나는 경우까지 승패로 계산해요. 그런 수는 아예 후보에서 빼요.',
            '**바로 이기는 수는 바로**: 탐색 전에 한 수 만에 끝나는 수가 있는지 먼저 봐요.',
            '**반복은 무승부로**: 지금까지의 국면(최근 120개)을 기억해서, 이길 때는 같은 국면으로 돌아가지 않고 밀어붙여요.',
            '**비슷한 수는 섞어서**: 최선 수와 8점 이내인 수 중에서 무작위로 골라요.',
          ] },
          { type: 'p', text: '평가식은 다시 만들었어요. 내 컵만 둘 보이는 줄(위협) 34점, 하나만 보이는 줄 5점, 위협이 두 개 이상이면(이중 위협) 22점을 더해요. 칸마다 지나가는 줄 수(가운데 4, 모서리 3, 변 2)에 비례해 맨 위 컵의 자리 점수를 주고, 상대 컵을 덮고 있으면 7점, 손에 남은 큰 컵 16점, 중간 컵 5점, 둘 차례인 쪽에 8점이에요.' },
          { type: 'callout', tone: 'tip', title: '자기대국 결과', text: '어려움을 상대로 선후를 바꿔 400판씩 둔 결과, 한 수 1.5초에서 98.3%, 1초에서 99.3%를 이겼어요(`scripts/hell-janggi-selfplay.mjs`).' },
        ],
      },
      {
        id: 'opening',
        title: '선공의 "가운데 큰 컵"',
        lead: '끝까지 읽는 엔진을 만들자 보인 사실이에요.',
        blocks: [
          { type: 'p', text: '코드 주석에는 이렇게 적혀 있어요. **선공이 첫 수로 가운데에 큰 컵을 놓으면 이론상 선공이 이긴다.** 큰 컵은 어떤 컵으로도 덮을 수 없으니, 가운데 큰 컵은 네 줄을 영구히 쥐는 셈이에요. 이 국면에서는 완벽하게 두는 AI도 완벽하게 두는 사람을 이길 수 없어요.' },
          { type: 'p', text: '그래서 매우 어려움에는 두 가지 대비가 들어갔어요. 하나는 **한 국면짜리 오프닝 북**이에요. 상대가 가운데 큰 컵으로 시작하면 탐색 없이 모서리에 컵을 놓아요. 오프라인에서 응수마다 3초씩 탐색해 보니, 모서리 응수는 상대에게 이기는 수를 가장 적게 남겼어요(큰 컵이면 28개 중 16개, 작은 컵이면 31개 중 18개, 다른 응수는 19~23개). 다른 하나는 **질 국면에서의 수 고르기**예요. 완벽하게 받으면 지는 국면이라면, 그저 오래 버티는 대신 상대의 그럴듯한 응수 중 이기는 응수의 비율이 가장 낮은 수, 그리고 한눈에 보이는 즉승이 없는 수를 골라요. 사람이 정확한 수를 찾아야만 이기게 만드는 거예요.' },
          { type: 'h3', text: '기록에 그대로 남았어요' },
          { type: 'p', text: '2026-11-26 14시(KST) 기준으로, 로그인한 플레이어가 매우 어려움을 이긴 판 중 복기 기록이 남은 110판을 세어 봤어요. **110판 모두 사람이 선공이었고, 그중 107판이 첫 수로 가운데에 큰 컵을 놓았어요.** 복기가 남은 승리 중에 AI가 먼저 둔 판은 한 판도 없었어요. 매우 어려움 전체로는 517판 중 25.0%를 사람이 이겼고, 이는 헬모드가 있는 여섯 게임 중 가장 높은 승률이에요. 헬모드 인증서를 받은 사람도 22명으로 가장 많아요.' },
          { type: 'callout', tone: 'note', title: '선공을 고를 수 있어요', text: 'AI전에서는 시작 전에 "내가 먼저 / AI가 먼저 / 무작위"를 고를 수 있어요. 매우 어려움에 도전한다면 이 선택이 가장 큰 차이를 만들어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요.',
        blocks: [
          { type: 'table', head: ['난이도', '사람 승률', '판수'], rows: [
            ['쉬움', '85.0%', '20판'],
            ['보통', '27.2%', '947판'],
            ['어려움', '39.0%', '1,102판'],
            ['매우 어려움', '25.0%', '517판'],
          ] },
          { type: 'p', text: '보통이 어려움보다 낮은 건 위에서 말한 "둘 다 두 수를 읽던" 시기의 기록이 대부분이라서예요. 11월 26일 재조정 이후의 판은 아직 적어요. 로그인 여부와 상관없이 센 러시아장기 전체 판수는 9,636판으로 보드게임 중 가장 많고, 그중 8,554판이 AI전이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { tag: '매우 어려움', title: '선공 + 가운데 큰 컵', body: '이론상 이기는 첫 수예요. 다만 AI는 모서리로 받고, 지는 국면에서도 이기는 응수가 가장 적은 수를 골라요. 이후에도 정확하게 두어야 이겨요.' },
            { tag: '어려움', title: '네 수째의 이중 위협', body: '어려움은 3수까지 읽어요. 내 수 → 상대 → 내 수 다음에 생기는 이중 위협(두 줄을 동시에 노리기)은 미리 막지 못해요.' },
            { tag: '보통', title: '열 번 중 네 번은 대충', body: '당장 지지 않는 수 중 아무거나 두는 차례가 있어요. 한 수 뒤에 줄이 완성되는 위협을 만들어 두면 자주 놓쳐요.' },
            { tag: '공통', title: '큰 컵을 아끼는 성향', body: '쉬움~어려움은 손에 남은 큰 컵에 점수를 줘서 오래 들고 있으려 해요. 판 위에서 큰 컵의 자리를 먼저 차지하면 AI의 큰 컵이 놓일 자리가 줄어요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/russianJanggi.ts` — 규칙과 쉬움·보통·어려움 AI(sEval, sNegamax, rootScores, chooseAiAction)',
      '`src/lib/russianJanggiHell.ts`, `src/lib/russianJanggiHellClient.ts`, `src/lib/russianJanggiHell.worker.ts` — 매우 어려움, 오프닝 북, trickiest',
      '`src/components/russianJanggi/RJGame.tsx` — 선공 선택, 결과 기록',
      '커밋 73fef3a (11/16 러시아장기), 1769c8e (11/16 컵 옮기기·80수 무승부), 1fe2d84 (11/20 재조정: 보통 18%·어려움 11%), eb8f15e (11/24 매우 어려움, 자기대국), e227318 (11/26 재조정)',
      'DB 집계(2026-11-26 14:22 KST): game_results(game=russian_janggi, mode=ai) 난이도별 승률; 매우 어려움 승리 중 복기가 남은 판의 선공·첫 수 분포; hell_clears 인원; game_plays_daily 합계',
    ],
  },
  en: {
    meta: {
      title: 'Russian Janggi AI dev notes — the opening even a perfect AI loses to | Dev notes',
      description: 'How the Russian Janggi (nesting-cup tic-tac-toe) AI levels read, how Normal and Hard became the same AI, and why the Very Hard engine that reads to the end must lose to a first-move large cup in the centre — and what was added against it.',
      keywords: ['Russian Janggi AI', 'Russian Janggi hell mode', 'Society Game Russian Janggi', 'gobblet AI', 'nesting tic-tac-toe', 'game AI dev diary'],
    },
    title: 'Russian Janggi AI dev notes',
    lead: 'Once the AI could read to the end, an unbeatable opening showed up.',
    intro: [
      'Russian Janggi is 3×3 tic-tac-toe with cups that cover each other. Each side has two small, two medium and two large cups; you place one on an empty cell or over a smaller cup, or lift one of your cups on the board and move it. Lifting can reveal a line underneath — if it is the opponent’s colour, they win.',
      'With so few pieces on so small a board, a computer can read the game to the end. That led to something unusual: the strongest AI became the hell-mode AI that loses most often. Here is why, from the code and the records.',
    ],
    summary: 'Even the Very Hard engine that reads to the end must lose to a first-move large cup in the centre — and how that shaped the AI and its win rate.',
    sections: [
      {
        id: 'first',
        title: 'Night one: from placing to moving',
        blocks: [
          { type: 'p', text: 'Russian Janggi launched at 11 pm on 16 November. The first version only let you place cups, and the AI ran an iterative-deepening alpha-beta search within 0.7 s. Twenty-four minutes later came moving your own cups on the board — and with it, lines revealed by lifting a cup, and an **80-ply draw limit**, since cups can be shuffled forever. The AI learned to search moves as well.' },
          { type: 'p', text: 'The Easy–Hard evaluation is classic tic-tac-toe AI. For each of the eight lines with none of the opponent’s cups showing, add **the square of my cups in it × 3** plus 2 per large cup of mine there (and subtract the same for the opponent). The centre on top is worth 4, a large cup still in hand 3 and a medium cup 1 — a large cup can never be covered, so holding it makes it a final blow. Cells are searched centre first, then corners, then edges.' },
        ],
      },
      {
        id: 'retune',
        title: 'Normal and Hard became the same AI',
        blocks: [
          { type: 'p', text: 'At the first record check on 20 November, Russian Janggi was too hard: people won 18% against Normal and 11% against Hard (targets 50% and 25%). The search was made shallower and noisier; Normal sometimes played "any move that does not lose at once", and Hard came down to roughly the old Normal.' },
          { type: 'p', text: 'On 26 November another look showed that **both now read two moves and were effectively the same AI**. The numbers kept in the code comment: 27% against Normal and 40% against Hard — Hard was the easier one — and for people who had played both, 34% and 33%. The levels are now split like this:' },
          { type: 'table', head: ['Level', 'Choosing a move'], rows: [
            ['Easy', 'Plays a winning move with 75% probability. Otherwise, 55% of the time a random move that survives a 2-ply search, else any move.'],
            ['Normal', 'Four turns in ten, a random move that does not lose at once. Otherwise a 2-ply search (0.12 s) plus big noise (14).'],
            ['Hard', '3-ply search (0.3 s) plus small noise (7). No noise on moves whose result is decided.'],
            ['Very Hard', 'Iterative deepening up to 60 plies (1.5 s desktop, 1 s phone). Details below.'],
          ] },
        ],
      },
      {
        id: 'hell',
        title: 'Very Hard: no dice, no hidden cups',
        blocks: [
          { type: 'p', text: 'Very Hard arrived on 24 November in the same commit as 12 Janggi’s. The first comment in its file sums the game up: **full information, no dice and no hidden cups — nothing to average over, so the search reads exact outcomes.** It shares 12 Janggi’s structure (PVS, transposition table, killer and history ordering) on a 27-slot "cell × size" array.' },
          { type: 'list', items: [
            '**Revealed lines, exactly**: a lift that uncovers the opponent’s line is scored as a loss and removed from the candidates.',
            '**Win at once**: before searching it checks for a move that ends the game now.',
            '**Repetition is a draw**: it remembers the last 120 positions, so when ahead it presses on instead of going back.',
            '**Mix near-equal moves**: it picks at random among moves within 8 points of the best.',
          ] },
          { type: 'p', text: 'Its evaluation is new: 34 for a line showing two of my cups and none of theirs (a threat), 5 for one, 22 more for two or more threats at once (a fork). Each top cup earns a place score proportional to the lines through its cell (centre 4, corner 3, edge 2), covering an enemy cup is worth 7, a large cup in hand 16, a medium one 5, and the side to move gets 8.' },
          { type: 'callout', tone: 'tip', title: 'Self-play results', text: 'Against Hard over 400 games with colours swapped, it won 98.3% at 1.5 s a move and 99.3% at 1 s (`scripts/hell-janggi-selfplay.mjs`).' },
        ],
      },
      {
        id: 'opening',
        title: 'The first player’s large cup in the centre',
        lead: 'What the engine revealed once it could read to the end.',
        blocks: [
          { type: 'p', text: 'The code comment says it plainly: **a large cup in the centre as the first move is a theoretical win for the first player.** A large cup can never be covered, so it holds four lines for good. From there, even a perfect AI cannot beat a perfect human.' },
          { type: 'p', text: 'So Very Hard got two defences. First, a **one-position opening book**: when the opponent opens with a large centre cup, it answers in a corner without searching. Offline searches of 3 s per answer showed the corner leaves the fewest winning replies — 16 of 28 with a large cup, 18 of 31 with a small one, against 19–23 for other answers. Second, **how it plays a lost position**: rather than just dragging the game out, it picks the move after which the smallest share of the opponent’s sensible replies still win, and none wins on the spot. You have to find the exact moves to win.' },
          { type: 'h3', text: 'It shows in the records' },
          { type: 'p', text: 'As of 2026-11-26, 14:00 KST, signed-in players had 110 Very Hard wins with a saved replay. **In all 110 the human moved first, and in 107 the first move was a large cup in the centre.** Not one of those wins came with the AI moving first. Overall people won 25.0% of 517 Very Hard games — the highest of the six hell-mode games — and 22 players hold its hell certificate, also the most.' },
          { type: 'callout', tone: 'note', title: 'You can choose who starts', text: 'Before an AI game you choose "me first / AI first / random". Against Very Hard, that choice matters more than anything else.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'table', head: ['Level', 'Human win rate', 'Games'], rows: [
            ['Easy', '85.0%', '20'],
            ['Normal', '27.2%', '947'],
            ['Hard', '39.0%', '1,102'],
            ['Very Hard', '25.0%', '517'],
          ] },
          { type: 'p', text: 'Normal is lower than Hard because most of these games come from the period when both read two moves; few games have been played since the 26 November retune. Counting everyone, Russian Janggi had been played 9,636 times — the most of any board game on the site — 8,554 of them against the AI.' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Very Hard', title: 'Move first, large cup in the centre', body: 'A theoretical win. But the AI answers in a corner and, when lost, picks the move with the fewest winning replies — you still have to play exactly.' },
            { tag: 'Hard', title: 'A fork on the fourth ply', body: 'Hard reads three plies. A fork (two lines threatened at once) that appears after your move → its reply → your move is not prevented.' },
            { tag: 'Normal', title: 'Careless four times in ten', body: 'On some turns it plays any move that does not lose immediately. Set up a threat that completes a line one move later and it is often missed.' },
            { tag: 'All', title: 'It hoards large cups', body: 'Easy to Hard score large cups in hand, so they keep them. Take the strong cells with your own large cups first and the AI’s have nowhere good to go.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/russianJanggi.ts` — rules and the Easy/Normal/Hard AI (sEval, sNegamax, rootScores, chooseAiAction)',
      '`src/lib/russianJanggiHell.ts`, `src/lib/russianJanggiHellClient.ts`, `src/lib/russianJanggiHell.worker.ts` — Very Hard, the opening book, trickiest',
      '`src/components/russianJanggi/RJGame.tsx` — choosing who starts, recording results',
      'Commits 73fef3a (11/16 Russian Janggi), 1769c8e (11/16 moving cups, 80-ply draw), 1fe2d84 (11/20 retune: Normal 18%, Hard 11%), eb8f15e (11/24 Very Hard, self-play), e227318 (11/26 retune)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (game = russian_janggi, mode = ai) win rate by level; first player and first move among Very Hard wins with a saved replay; hell_clears count; game_plays_daily totals',
    ],
  },
};

export default article;
