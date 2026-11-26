import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-twelve-janggi',
  category: 'ai',
  games: ['janggi'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '십이장기 AI 개발기 — 7수를 읽던 어려움을 5수로 줄인 이유와 매우 어려움의 탐색 | 개발 노트',
      description: '십이장기 AI가 난이도별로 몇 수를 읽는지, 왜 어려움을 일부러 약하게 했는지, 같은 수 세 번 금지 규칙이 생긴 사연, 그리고 PVS·치환표·정지 탐색으로 13~19수를 읽는 매우 어려움(헬모드) AI까지 코드와 커밋 기록으로 정리했어요.',
      keywords: ['십이장기 AI', '십이장기 헬모드', '십이장기 매우 어려움', '더 지니어스 십이장기', '12장기 공략', '알파베타', 'PVS 탐색', '게임 AI 개발기'],
    },
    title: '십이장기 AI 개발기',
    lead: '너무 강해서 줄이고, 다시 끝까지 강하게 만든 이야기.',
    intro: [
      '십이장기는 3×4 칸짜리 작은 판에서 장(將)·상(相)·왕(王)·자(子) 네 가지 말로 두는 게임이에요. 판이 작고 잡은 말을 다시 내려놓을 수 있어서, 컴퓨터가 수를 깊게 읽기 좋은 게임이기도 해요. 그래서 이 게임의 AI 이야기는 대부분 "얼마나 덜 읽게 할까"의 이야기예요.',
      '이 글은 십이장기가 처음 올라간 11월 16일부터 매우 어려움이 생긴 11월 24일, 난이도를 다시 맞춘 11월 26일까지의 기록이에요. 각 난이도가 실제로 몇 수를 읽는지, 어디에 무작위를 섞는지 그대로 적었어요.',
    ],
    summary: '7수를 읽던 어려움이 거의 이길 수 없어서 5수로 줄인 이유, 같은 수 세 번 금지, 그리고 13~19수를 읽는 매우 어려움.',
    sections: [
      {
        id: 'first',
        title: '처음부터 탐색 AI였어요',
        blocks: [
          { type: 'p', text: '십이장기는 11월 16일 저녁에 처음 올라갔어요. 벽바둑과 달리 이 게임은 첫날부터 AI가 "탐색"을 했어요. 둘 수 있는 수를 하나씩 두어 보고, 상대의 응수, 다시 나의 응수를 정해진 깊이까지 따라가서 가장 좋은 결과로 이어지는 수를 고르는 방식이에요. 정확히는 **반복 심화 네가맥스 + 알파베타 가지치기**예요. 판이 3×4로 작아서 가능한 수가 적고, 그래서 꽤 깊이 읽어도 금방 끝나요.' },
          { type: 'p', text: '평가식은 단순해요. 말 값을 더하고 빼요. 자 1, 상 3, 장 4, 후(侯, 자가 뒤집힌 말) 4.5, 손에 든 말은 판 위 값의 0.9배예요. 왕은 값 대신 **앞으로 나아간 줄 수 × 0.35**를 받아요. 상대 진영에 들어가 살아남으면 이기는 규칙이 있어서, 왕이 앞으로 나가는 것 자체가 점수예요. 알파베타가 더 많이 잘라내도록, 값비싼 말을 잡는 수부터 먼저 읽어요.' },
          { type: 'p', text: '첫 버전의 난이도는 깊이로만 갈렸어요. 쉬움 1수, 보통 3수, 어려움 7수(0.9초 안에서)였고, 고른 값에 작은 무작위(쉬움 2.5, 보통 0.6, 어려움 0.05)를 더해 판마다 조금씩 다르게 두게 했어요.' },
        ],
      },
      {
        id: 'repetition',
        title: '같은 수를 영원히 반복할 수 있었어요',
        blocks: [
          { type: 'p', text: '다음 날 새벽 1시 반에 들어간 수정은 플레이어 제보에서 시작했어요. 같은 수를 끝없이 반복할 수 있다는 제보였어요. 방송의 십이장기 규칙에는 반복에 의한 무승부가 없고, 사이트에는 200수 무승부만 있었어요. 그래서 **같은 국면(판, 양쪽 손에 든 말, 둘 차례까지 같은 상태)을 세 번째로 만드는 수**를 금지했어요. 한국 장기에서 같은 수를 세 번 두지 않는 관례를 따른 거예요.' },
          { type: 'p', text: '이 규칙은 사람, AI, 친구 대전, 시간 초과 자동 수에 똑같이 적용돼요. 판에서는 금지된 칸을 숨기고 이유를 보여 줘요. 모든 수가 반복이 되는 드문 경우에는 아무도 수가 없어지지 않도록 금지를 풀어요. 쉬움~어려움 AI는 이 금지를 맨 위(지금 둘 수)에서만 확인하고, 매우 어려움은 탐색 안쪽까지 이 규칙을 넣었어요(아래에서 다시 이야기해요).' },
        ],
      },
      {
        id: 'too-strong',
        title: '어려움이 너무 강했어요: 7수 → 5수',
        blocks: [
          { type: 'p', text: '11월 20일, 처음으로 실제 기록(로그인한 플레이어의 AI전 결과)으로 난이도를 점검했어요. 목표는 **사람 승률 쉬움 80%, 보통 50%, 어려움 25%**였어요. 결과는 정반대였어요. 보통에서는 사람이 82%를 이겼고, 어려움에서는 5%밖에 이기지 못했어요. 7수를 읽는 어려움은 "거의 이길 수 없는" 상대였던 거예요.' },
          { type: 'list', items: [
            '어려움: 7수 → **5수**로 줄이고, 무작위를 0.05 → 0.2로 늘렸어요. 생각 시간은 0.7초.',
            '보통: 3수 → 4수로 늘리고 무작위를 0.35로 줄였어요.',
            '같은 날 AI끼리 붙여서 쉬움 < 보통 < 어려움 순서가 유지되는지 확인했어요.',
          ] },
          { type: 'p', text: '11월 26일에 한 번 더 맞췄어요. 어려움은 사람 승률 25%로 목표에 맞았지만, 4수 보통은 34%로 조금 강했어요. 3수로 내리면 너무 약했고요. 그래서 지금의 보통은 **세 번에 한 번은 3수, 나머지는 4수**를 읽고, 무작위를 0.6으로 다시 늘렸어요. 바로 이기는 수가 보이면 어느 난이도든 무작위 없이 그 수를 둬요.' },
          { type: 'table', head: ['난이도', '읽는 깊이', '무작위', '시간'], rows: [
            ['쉬움', '1수', '2.5 (말 하나 값보다 커요)', '0.45초'],
            ['보통', '3수(35%) 또는 4수', '0.6', '0.45초'],
            ['어려움', '5수', '0.2', '0.7초'],
            ['매우 어려움', '보통 13~19수', '최선 수와 자 0.12개 값 이내 중 무작위', 'PC 1.5초 / 휴대폰 1초'],
          ] },
        ],
      },
      {
        id: 'hell',
        title: '매우 어려움: 체스 엔진처럼',
        lead: '11월 24일, 러시아장기와 같은 커밋으로 들어간 헬모드 AI예요.',
        blocks: [
          { type: 'p', text: '어려움을 5수로 줄인 뒤에는 "정말 강한 상대"가 따로 필요했어요. 매우 어려움은 기존 코드 위에 쌓지 않고 따로 새로 짰어요. 기존 AI는 매 수마다 판 객체를 새로 만드는 방식이라 느렸어요. 새 엔진은 12칸짜리 숫자 배열 하나를 직접 고쳤다 되돌리고, 각 말이 공격하는 칸을 비트 마스크로 계산해요. 커밋 기록에 따르면 초당 약 250만 국면을 보고, 한 수에 13~19수 깊이까지 읽어요.' },
          { type: 'cards', items: [
            { title: 'PVS + 치환표', body: '첫 수는 정확히, 나머지는 "더 좋은지만" 빠르게 확인하는 주 변화 탐색(PVS)이에요. 국면마다 64비트(32비트 두 개) 조브리스트 해시를 붙여서 같은 국면을 다시 계산하지 않아요.' },
            { title: '킬러·히스토리 정렬', body: '다른 가지에서 상대를 잘라낸 조용한 수를 기억해 먼저 읽어요. 깊은 곳의 늦은 조용한 수는 한 수 덜 읽어요.' },
            { title: '정지 탐색', body: '정해진 깊이에서 바로 평가하면 "잡히기 직전"을 놓쳐요. 그래서 끝에서는 잡는 수를 더 잡을 게 없을 때까지 따라가고, 장군을 받은 상태면 처음 6수 동안은 피하는 수까지 모두 읽어요.' },
            { title: '정확한 승리 판정', body: '왕을 잡을 수 있으면 승리, 내 왕이 상대 진영에서 살아남았으면 승리, 상대가 공격하지 않는 진영 칸으로 왕이 들어갈 수 있으면 "두 수 뒤 승리"로 바로 계산해요.' },
          ] },
          { type: 'p', text: '평가식도 훨씬 자세해졌어요(단위는 "자 하나 = 100"). 판 위의 장 380, 상 330, 후 470이고, **손에 든 말은 판 위보다 비싸요**(장 420, 상 360, 자 120). 손에 든 말은 원하는 칸에 내려놓을 수 있으니 그만큼 쓸모가 크다고 본 거예요. 왕은 한 줄 나아갈 때마다 35, 상대 진영 바로 앞 줄이면 60을 더 받아요. 여기에 공격하는 칸 수 × 6, 상대 왕 주변을 공격하는 칸 × 14, 그리고 "지키는 말 없이 공격받는 상대 말"의 값 35%를 미리 얻은 것으로 쳐요.' },
          { type: 'h3', text: '반복 금지를 탐색 안에 넣기' },
          { type: 'p', text: '매우 어려움은 지금까지의 게임 기록에서 나온 국면들을 해시로 기억해요. 탐색 중에 어떤 수가 그 국면을 세 번째로 만들면 그 수는 "둘 수 없는 수"로 계산돼요. 덕분에 반복으로 버티려는 수순에 끌려가지 않고, 반대로 상대가 반복 금지 때문에 좋은 수를 못 두게 되는 국면도 계산에 넣어요.' },
          { type: 'callout', tone: 'tip', title: '자기대국 결과', text: '`scripts/hell-janggi-selfplay.mjs`로 매우 어려움과 어려움을 선후를 바꿔 가며 400판씩 붙였어요. 한 수 1.5초에서 매우 어려움 100%, 1초에서 99.5%를 이겼어요.' },
        ],
      },
      {
        id: 'tips',
        title: '같은 탐색으로 만든 "필승 꿀팁"',
        blocks: [
          { type: 'p', text: '11월 17일 아침에는 지고 난 뒤 볼 수 있는 "필승 꿀팁 보기"를 붙였어요. 게임을 끝에서부터 거꾸로 되짚으며, 내가 둔 수마다 AI 탐색(국면당 약 0.3초)을 돌려요. **내가 둔 수는 강제로 지는 수였는데, 다른 수였다면 이기거나 최소한 지지 않았던 마지막 지점**을 찾아서, 내 수와 더 나은 수를 판 위에 나란히 보여 줘요. 반복 금지에 걸리는 수는 추천하지 않아요. 내 수 최대 10개까지만 되짚기 때문에, 그보다 앞에서 이미 기운 판은 "전환점"을 찾지 못할 수도 있어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요. 대부분은 11월 26일 재조정 전에 둔 판이에요.',
        blocks: [
          { type: 'table', head: ['난이도', '사람 승률', '판수'], rows: [
            ['쉬움', '96.2%', '26판'],
            ['보통', '33.3%', '681판'],
            ['어려움', '25.9%', '740판'],
            ['매우 어려움', '1.6%', '500판'],
          ] },
          { type: 'p', text: '매우 어려움은 500판 중 8판만 사람이 이겼고, 헬모드 인증서를 받은 사람은 4명이에요. 헬모드가 있는 여섯 게임 중에서 가장 낮은 승률이에요. 로그인 여부와 상관없이 센 십이장기 전체 판수는 7,266판이고 그중 6,773판이 AI전이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { tag: '쉬움', title: '1수만 봐요', body: '쉬움은 한 수 앞만 보고 무작위도 커서, 두 수짜리 함정(내 말을 미끼로 주고 다음 수에 왕을 노리기)에 바로 걸려요.' },
            { tag: '보통', title: '3수짜리 판단이 섞여요', body: '세 번에 한 번은 3수만 읽어요. 4수째에 드러나는 내려놓기(손에 든 말로 장군 걸기) 수순을 노리면 잘 통해요.' },
            { tag: '어려움', title: '5수 너머의 진영 입성', body: '어려움의 평가는 말 값과 왕의 전진뿐이에요. 왕이 상대 진영으로 들어가는 수순이 6수 이상 걸리면 미리 막지 못하는 경우가 있어요. 또 반복 금지는 지금 둘 수에서만 확인해요.' },
            { tag: '매우 어려움', title: '가장 정직한 상대', body: '정지 탐색 덕분에 "잡히기 직전"을 놓치지 않고, 진영 입성도 정확히 계산해요. 그나마 틈이라면 최선 수와 자 0.12개 값 이내인 수 중 하나를 무작위로 고른다는 점이에요. 막상막하의 국면이 길게 이어질수록 AI가 미세하게 덜 좋은 수를 고를 기회가 쌓여요. 휴대폰에서는 1초만 생각해요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/janggi.ts` — 쉬움·보통·어려움 AI(evaluate, negamax, chooseAiAction)와 필승 꿀팁(scoreActions, turningPointAt)',
      '`src/lib/janggiHell.ts`, `src/lib/janggiHellClient.ts`, `src/lib/janggiHell.worker.ts` — 매우 어려움 엔진',
      '`scripts/hell-janggi-selfplay.mjs` — 매우 어려움 대 어려움 자기대국',
      '커밋 c611a3b (11/16 십이장기 추가), c9e2ba8 (11/17 같은 국면 세 번 금지), 0a24120 (11/17 필승 꿀팁), 1fe2d84 (11/20 난이도 재조정: 보통 82%·어려움 5%), eb8f15e (11/24 매우 어려움, 자기대국 결과), e227318 (11/26 보통 재조정)',
      'DB 집계(2026-11-26 14:22 KST): game_results(mode=ai, game=janggi) 난이도별 승률, hell_clears 인원, game_plays_daily 합계',
    ],
  },
  en: {
    meta: {
      title: '12 Janggi AI dev notes — why Hard went from 7 plies to 5, and the Very Hard search | Dev notes',
      description: 'How many plies each 12 Janggi AI level reads, why Hard was made weaker on purpose, where the no-third-repetition rule came from, and the Very Hard (hell mode) PVS search with a transposition table and quiescence that reads 13–19 plies.',
      keywords: ['12 Janggi AI', '12 Janggi hell mode', 'The Genius 12 Janggi', 'alpha-beta', 'PVS search', 'game AI dev diary'],
    },
    title: '12 Janggi AI dev notes',
    lead: 'Too strong, toned down, then made strong again on purpose.',
    intro: [
      '12 Janggi is played on a 3×4 board with four kinds of piece: general (將), minister (相), king (王) and man (子). The board is tiny and captured pieces can be dropped back in, so a computer can read very deep. Most of this AI’s story is therefore about how much *less* to read.',
      'This note runs from the game’s launch on 16 November to the Very Hard level on 24 November and the retune on 26 November. It states exactly how many plies each level reads and where it adds randomness.',
    ],
    summary: 'Why a 7-ply Hard was almost unbeatable and went down to 5, the no-third-repetition ban, and a Very Hard that reads 13–19 plies.',
    sections: [
      {
        id: 'first',
        title: 'A search AI from the start',
        blocks: [
          { type: 'p', text: '12 Janggi launched on the evening of 16 November, and unlike Wallgo its AI searched from day one: it tries each move, follows the replies to a fixed depth and keeps the move that leads to the best result — **iterative-deepening negamax with alpha-beta pruning**. On a 3×4 board there are few moves, so even deep searches finish quickly.' },
          { type: 'p', text: 'The evaluation is plain material: man 1, minister 3, general 4, feudal lord (侯, a promoted man) 4.5, and pieces in hand at 0.9 of that. The king scores **0.35 for every row it has advanced** instead, because a king that enters the enemy camp and survives wins. Captures of valuable pieces are searched first so alpha-beta cuts more.' },
          { type: 'p', text: 'At first the levels differed only in depth: Easy 1 ply, Normal 3, Hard 7 (within 0.9 s), each with a little noise added (2.5, 0.6 and 0.05) so games vary.' },
        ],
      },
      {
        id: 'repetition',
        title: 'You could repeat the same moves forever',
        blocks: [
          { type: 'p', text: 'A fix at 1:30 the next morning started with a player’s report: the same moves could be repeated endlessly. The show’s rules have no draw by repetition, and the site only had a 200-move draw. So **a move that brings the same position (board, both hands and side to move) back a third time** became illegal, following the Korean janggi convention of not playing the same move three times.' },
          { type: 'p', text: 'The ban applies to players, the AI, friend rooms and timeout auto-moves alike; the board hides those targets and says why. In the rare case that every move would repeat, the ban is lifted so nobody is left without a move. The Easy–Hard AIs check it only for the move they are about to play; Very Hard models it inside the search (more below).' },
        ],
      },
      {
        id: 'too-strong',
        title: 'Hard was too strong: 7 plies → 5',
        blocks: [
          { type: 'p', text: 'On 20 November the levels were checked against real records (signed-in players’ games against the AI) for the first time. The target was **human win rates of 80% on Easy, 50% on Normal and 25% on Hard**. Reality was the other way round: people won 82% against Normal and only 5% against Hard. A 7-ply Hard was close to unbeatable.' },
          { type: 'list', items: [
            'Hard: 7 plies → **5**, noise 0.05 → 0.2, 0.7 s to think.',
            'Normal: 3 plies → 4, noise down to 0.35.',
            'AI-vs-AI games the same day confirmed the Easy < Normal < Hard order.',
          ] },
          { type: 'p', text: 'It was tuned once more on 26 November. Hard hit its 25% target, but a 4-ply Normal was a little strong at 34%, and 3 plies was too weak. Today’s Normal reads **3 plies on about a third of its moves and 4 on the rest**, with noise back up to 0.6. Any level plays an immediate win when it sees one, without noise.' },
          { type: 'table', head: ['Level', 'Depth', 'Noise', 'Time'], rows: [
            ['Easy', '1 ply', '2.5 (more than a piece)', '0.45 s'],
            ['Normal', '3 plies (35%) or 4', '0.6', '0.45 s'],
            ['Hard', '5 plies', '0.2', '0.7 s'],
            ['Very Hard', 'usually 13–19 plies', 'random among moves within 0.12 of a man of the best', '1.5 s desktop / 1 s phone'],
          ] },
        ],
      },
      {
        id: 'hell',
        title: 'Very Hard: built like a chess engine',
        lead: 'The hell-mode AI, added on 24 November in the same commit as Russian Janggi’s.',
        blocks: [
          { type: 'p', text: 'With Hard toned down to 5 plies, a genuinely strong opponent had to live somewhere else. Very Hard was written as a separate engine. The old AI built a new board object for every move and was slow; the new one edits a single 12-cell array in place and undoes it, and computes attacked cells as bit masks. According to the commit it looks at about 2.5 million positions a second and reaches 13–19 plies per move.' },
          { type: 'cards', items: [
            { title: 'PVS + transposition table', body: 'Principal variation search: the first move is searched exactly, the rest only checked for "is it better?". Each position has a 64-bit (two 32-bit halves) Zobrist hash so nothing is computed twice.' },
            { title: 'Killer and history ordering', body: 'Quiet moves that caused a cut elsewhere are remembered and tried first. Late quiet moves deep in the tree are searched one ply shallower.' },
            { title: 'Quiescence search', body: 'Evaluating right at the depth limit misses "about to be captured". At the leaves it follows captures until the position is quiet, and when in check it reads every escape for the first 6 extra plies.' },
            { title: 'Exact wins', body: 'Can take the king: win. Own king survived in the enemy camp: win. King can step into an enemy-camp cell they do not attack: win in two plies — computed directly.' },
          ] },
          { type: 'p', text: 'The evaluation is much richer (in units where a man = 100): general 380, minister 330, lord 470 on the board, and **pieces in hand are worth more than on the board** (general 420, minister 360, man 120), since a piece in hand can go anywhere. The king earns 35 per row advanced and 60 more one row from the enemy camp. Add 6 per attacked cell, 14 per attacked cell around the enemy king, and 35% of the value of an enemy piece that is attacked and undefended, counted as already won.' },
          { type: 'h3', text: 'The repetition ban inside the search' },
          { type: 'p', text: 'Very Hard keeps the hashes of every position in the game so far. A move that would make one of them appear a third time scores as unplayable inside the search. So it is never dragged into a line that relies on repetition, and it counts positions where the ban stops *you* from playing your best move.' },
          { type: 'callout', tone: 'tip', title: 'Self-play results', text: '`scripts/hell-janggi-selfplay.mjs` played Very Hard against Hard for 400 games, swapping who moves first. At 1.5 s a move Very Hard won 100%; at 1 s, 99.5%.' },
        ],
      },
      {
        id: 'tips',
        title: '"Winning tips" from the same search',
        blocks: [
          { type: 'p', text: 'On the morning of 17 November a "winning tips" button was added to the loss screen. It walks the game backwards and runs the AI search on each of your moves (about 0.3 s per position), looking for **the last point where your move lost by force while another move would have won or at least held**. It shows your move and the better one side by side, never suggesting a move the repetition ban forbids. Only your last 10 moves are checked, so a game that tipped earlier may show no turning point.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST. Most were played before the 26 November retune.',
        blocks: [
          { type: 'table', head: ['Level', 'Human win rate', 'Games'], rows: [
            ['Easy', '96.2%', '26'],
            ['Normal', '33.3%', '681'],
            ['Hard', '25.9%', '740'],
            ['Very Hard', '1.6%', '500'],
          ] },
          { type: 'p', text: 'People won 8 of 500 games against Very Hard, and 4 players hold its hell certificate — the lowest win rate of the six hell-mode games. Counting everyone, 12 Janggi had been played 7,266 times, 6,773 of them against the AI.' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Easy', title: 'One ply only', body: 'Easy sees one move ahead with heavy noise, so two-move traps — offer a piece as bait, then go for the king — work at once.' },
            { tag: 'Normal', title: 'Some 3-ply decisions', body: 'A third of its moves are read only 3 plies deep. Lines whose point (a drop that checks the king) appears on the fourth ply work well.' },
            { tag: 'Hard', title: 'Camp entry beyond 5 plies', body: 'Hard’s evaluation is only material and king advance. A king march into the enemy camp that takes six plies or more may not be stopped in time. It also checks the repetition ban only for the move it plays now.' },
            { tag: 'Very Hard', title: 'The most honest opponent', body: 'Quiescence means it does not miss hanging pieces, and camp entry is computed exactly. The only gap is that it picks at random among moves within 0.12 of a man of the best, so the longer a balanced game lasts, the more chances it has to pick a slightly worse one. On phones it thinks for 1 s.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/janggi.ts` — Easy/Normal/Hard AI (evaluate, negamax, chooseAiAction) and winning tips (scoreActions, turningPointAt)',
      '`src/lib/janggiHell.ts`, `src/lib/janggiHellClient.ts`, `src/lib/janggiHell.worker.ts` — the Very Hard engine',
      '`scripts/hell-janggi-selfplay.mjs` — Very Hard vs Hard self-play',
      'Commits c611a3b (11/16 12 Janggi), c9e2ba8 (11/17 third-repetition ban), 0a24120 (11/17 winning tips), 1fe2d84 (11/20 retune: Normal 82%, Hard 5%), eb8f15e (11/24 Very Hard and self-play results), e227318 (11/26 Normal retune)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (mode = ai, game = janggi) win rate by level, hell_clears count, game_plays_daily totals',
    ],
  },
};

export default article;
