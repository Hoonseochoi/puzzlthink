import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-blind-gomoku',
  category: 'ai',
  games: ['blindGomoku'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '블라인드 오목 AI 개발기 — "기억력"으로 난이도를 만든 이유 | 개발 노트',
      description: '블라인드 오목 AI는 수읽기가 아니라 기억력으로 난이도가 갈려요. 최근 3·8·36수만 기억하는 AI가 실제로 무엇을 잊는지, 판 전체를 기억하고 VCF·VCT 위협 탐색을 하는 매우 어려움(헬모드)은 어떻게 두는지, 사람이 노릴 수 있는 틈까지 정리했어요.',
      keywords: ['블라인드 오목 AI', '블라인드 오목 헬모드', '데블스플랜 블라인드 오목', '오목 AI', 'VCF', 'VCT', '오목 위협 탐색', '게임 AI 개발기'],
    },
    title: '블라인드 오목 AI 개발기',
    lead: '수읽기는 똑같이, 기억력만 다르게.',
    intro: [
      '블라인드 오목은 겉면은 색만 보이고 밑면이 흑·백인 돌로 두는 오목이에요. 판 위에서는 어느 돌이 누구 것인지 보이지 않아요. 사람은 흑으로 먼저 두고, 매 차례 겉색을 고르면 AI는 직전에 사람이 쓴 것과 같은 겉색으로 둬요. 판을 뒤집어 흑·백을 5초 동안 확인하는 기회는 한 판에 두 번이에요.',
      '이 게임에서 컴퓨터에게 어려운 건 수읽기가 아니에요. 컴퓨터는 누가 어디에 두었는지 절대 잊지 않거든요. 그래서 난이도를 "몇 수까지 기억하느냐"로 만들었어요. 이 글은 그 기억력 AI와, 모든 걸 기억하는 매우 어려움 AI의 이야기예요.',
    ],
    summary: '최근 3·8·36수만 기억하는 AI와, 판 전체를 기억하고 VCF·VCT 위협 탐색으로 두는 매우 어려움. 잊힌 돌이 어떻게 틈이 되는지.',
    sections: [
      {
        id: 'memory',
        title: '난이도 = 기억력',
        blocks: [
          { type: 'p', text: '블라인드 오목은 11월 17일 오전에 올라갔어요. 쉬움~어려움 AI는 같은 계산을 해요. 기존 돌 주변 2칸 안의 빈칸을 모두 후보로 놓고, 칸마다 네 방향의 줄 모양을 봐서 점수를 매겨요. 다섯이면 100만, 양쪽이 열린 넷이면 8만, 한쪽만 열린 넷이면 2만, 열린 셋 8,000, 막힌 셋 1,400, 열린 둘 420… 이런 식이에요. **내가 이 칸에 두었을 때의 공격 점수 × 1.08 + 상대가 이 칸에 두었을 때의 수비 점수**에 가운데 가산점과 작은 무작위를 더하고, 가장 높은 칸에 둬요.' },
          { type: 'p', text: '차이는 딱 하나예요. 줄 모양을 볼 때 **최근 몇 수의 돌만** 넣어요. 기억 밖의 돌은 계산에서 아예 사라져요. 내 돌로도, 상대 돌로도, 길을 막는 돌로도 보지 않아요. 다만 이미 돌이 있는 칸에 두지는 않아요. 판에 돌이 있다는 건 보이지만, 그게 누구 돌인지는 잊은 사람처럼 행동하는 거예요.' },
          { type: 'table', head: ['난이도', '처음(11/17)', '11/20', '지금(11/26~)'], rows: [
            ['쉬움(하)', '최근 5수', '최근 3수', '최근 3수'],
            ['보통(중)', '최근 15수', '최근 8수', '최근 8수'],
            ['어려움(상)', '전부', '최근 24수', '최근 36수'],
            ['매우 어려움', '—', '—', '전부 + 위협 탐색'],
          ] },
        ],
      },
      {
        id: 'retune',
        title: '두 번의 조정',
        blocks: [
          { type: 'p', text: '처음 어려움은 판 전체를 기억했어요. 11월 20일 기록을 보니 사람 승률이 보통 22%, 어려움 8%였어요. 목표(50%, 25%)보다 한참 어려웠죠. 그래서 기억을 5·15·전부에서 **3·8·24수**로 줄였어요.' },
          { type: 'p', text: '11월 26일에는 반대 방향으로 고쳤어요. 코드 주석에 남긴 숫자로, 24수 기억의 어려움을 상대로 사람이 41%를 이겼는데, **몇 판 해 본 사람은 58%**를 이겼어요. 요령이 금방 퍼진 거예요. "AI가 잊어버릴 때까지 오래 끌기." 판이 길어지면 초반 돌이 기억 밖으로 밀려나니까요. 그래서 어려움의 기억을 36수로 늘려 한 판의 대부분을 기억하게 했어요.' },
        ],
      },
      {
        id: 'hell',
        title: '매우 어려움: 전부 기억하는 사람',
        lead: '11월 24일에 들어간 헬모드 AI예요.',
        blocks: [
          { type: 'p', text: '매우 어려움을 만들 때 가장 먼저 정한 건 "AI가 무엇을 아는가"였어요. 화면에서 돌의 밑면(흑·백)을 읽는 건 반칙이에요. 그래서 엔진에는 **돌이 놓인 자리와 순서만** 넘겨요. 흑이 먼저 두니까 홀수 번째 돌은 흑, 짝수 번째는 백이에요. 처음부터 끝까지 지켜보며 순서를 다 기억한 사람이 아는 것과 정확히 같은 정보예요. 코드 주석의 표현으로는 "숨은 면은 순서를 기억하는 사람에게는 아무것도 숨기지 않는다"예요.' },
          { type: 'steps', items: [
            { title: '다섯 / 막기', body: '내가 바로 다섯을 만들 수 있으면 두고, 상대가 다음 수에 다섯을 만들 수 있으면 막아요.' },
            { title: 'VCF (시간의 25%까지)', body: '"사(四)로만 이기는 수순"을 찾아요. 매 수가 넷이라 상대는 막을 수밖에 없고, 그렇게 이어 가다 열린 넷이나 쌍사가 생기면 이겨요. 최대 24수 깊이까지 읽어요.' },
            { title: 'VCT (시간의 45%까지)', body: '넷뿐 아니라 열린 셋까지 써서 몰아붙이는 수순이에요. 상대의 모든 방어(셋을 막는 칸과 반격하는 넷)를 확인하며 4단계까지 읽어요.' },
            { title: '안전한 후보만', body: '이기는 수순이 없으면 후보 18개를 뽑고, 그 수를 두었을 때 상대에게 VCF가 생기는 수는 빼요.' },
            { title: '알파베타 (시간의 92%까지)', body: '남은 후보로 깊이를 하나씩 늘리며 치환표를 쓰는 알파베타 탐색을 해요. 상대가 열린 넷이나 쌍사를 노리면 막는 수나 반격하는 넷만 후보로 둬요.' },
          ] },
          { type: 'p', text: '마지막에는 최선 수와 점수 차가 작은(40점 또는 최선 점수의 4% 이내) 수 중 상위 3개에서 무작위로 골라요. 승패가 정해진 국면에서는 무작위 없이 최선 수를 둬요. AI의 첫 수는 탐색 없이, 사람의 첫 돌 바로 옆(가로·세로·대각) 칸 중 하나예요.' },
          { type: 'callout', tone: 'note', title: '왜 2색으로 고정했나', text: '매우 어려움에서는 겉색이 2가지로 고정돼요. 게임 안내 문구 그대로, 색이 많으면 같은 색 짝으로 위치를 외우기 쉬워지기 때문이에요. 모든 걸 기억하는 AI를 상대로 사람에게만 기억 단서가 많아지면 안 되니까, 사람도 가장 기억하기 어려운 조건에서 두게 했어요.' },
          { type: 'callout', tone: 'tip', title: '자기대국 결과', text: '`scripts/blind-gomoku-arena.ts`로 매우 어려움과 어려움(당시 24수 기억)을 색을 바꿔 가며 240판 붙였어요. 한 수 1.5초에서 98.8%, 1초에서 100%를 이겼어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요.',
        blocks: [
          { type: 'table', head: ['난이도', '사람 승률', '판수'], rows: [
            ['쉬움', '66.7%', '18판'],
            ['보통', '52.3%', '237판'],
            ['어려움', '39.9%', '301판'],
            ['매우 어려움', '23.1%', '156판'],
          ] },
          { type: 'p', text: '보통은 목표인 50%에 거의 맞았어요. 어려움의 39.9%는 대부분 24수 기억 시절의 판이에요. 매우 어려움을 이기고 인증서를 받은 사람은 4명이에요. 전체 판수(로그인 여부 무관)는 2,310판이고 그중 1,748판이 AI전이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { tag: '쉬움~어려움', title: '잊힌 돌로 줄 만들기', body: 'AI는 기억 밖의 내 돌을 내 돌로 보지 않아요. 오래전에 둔 돌 두세 개에 새 돌을 이어 붙이면, AI 눈에는 외톨이 돌 하나로 보여서 막지 않아요. 쉬움은 3수, 보통은 8수, 어려움은 36수가 지나면 잊어요.' },
            { tag: '쉬움~어려움', title: '잊힌 돌은 벽도 아니에요', body: '기억 밖의 AI 자기 돌도 계산에서 사라져요. 그래서 AI가 이미 막혀 있는 줄을 "열린 줄"로 착각하고 공격에 수를 쓰기도 해요.' },
            { tag: '매우 어려움', title: '순서를 아는 상대', body: '이 AI에게는 블라인드가 없어요. 평범한 오목 AI로 생각하고 두어야 해요. 초반 VCF는 거의 다 찾아내니, 넷을 연달아 만드는 수순보다 셋 두 개를 겹치는 느린 압박이 통할 여지가 커요. VCT 탐색은 4단계까지라 그보다 긴 압박은 알파베타 평가에 맡겨져요.' },
            { tag: '공통', title: '판 뒤집기 두 번', body: '사람은 한 판에 두 번 판을 뒤집어 흑·백을 5초 동안 볼 수 있어요. 기억이 흐려지는 중반, 큰 결정을 내리기 직전에 쓰는 게 좋아요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/blindGomoku.ts` — DIFFICULTY_MEMORY, linePotential, candidateScore, chooseAiMove',
      '`src/lib/blindGomokuHell.ts`, `src/lib/blindGomokuHell.worker.ts` — 매우 어려움(VCF, VCT, 알파베타, 무작위 선택)',
      '`scripts/blind-gomoku-arena.ts` — 자기대국',
      '`src/messages/ko.json` BlindGomoku — 규칙 문구(판 뒤집기 두 번, 2색 고정 이유) 읽기만 함',
      '커밋 b1cc658 (11/17 블라인드 오목), 599e8a3 (11/17 색 규칙), 1fe2d84 (11/20 기억 3/8/24, 보통 22%·어려움 8%), 44f49a9 (11/24 매우 어려움, 자기대국), 0d9a9c9 (11/24 매우 어려움 2색 고정), e227318 (11/26 어려움 36수)',
      'DB 집계(2026-11-26 14:22 KST): game_results(game=blind_gomoku, mode=ai) 난이도별 승률, hell_clears 인원, game_plays_daily 합계',
    ],
  },
  en: {
    meta: {
      title: 'Blind Gomoku AI dev notes — difficulty made of memory | Dev notes',
      description: 'In Blind Gomoku the AI levels differ in memory, not search. What an AI that remembers only the last 3, 8 or 36 moves actually forgets, how the Very Hard (hell mode) AI with full memory and VCF/VCT threat search plays, and the gaps a human can use.',
      keywords: ['Blind Gomoku AI', 'Blind Gomoku hell mode', "Devil's Plan Blind Gomoku", 'gomoku AI', 'VCF', 'VCT', 'threat-space search', 'game AI dev diary'],
    },
    title: 'Blind Gomoku AI dev notes',
    lead: 'The same reading at every level — only the memory changes.',
    intro: [
      'Blind Gomoku is gomoku with stones that show only a colour on top and hide black or white underneath, so you cannot see whose stone is whose. You play black and move first; each turn you choose an outer colour and the AI plays the same colour you just used. Twice per game you may flip the board for 5 seconds to see black and white.',
      'For a computer the hard part is not reading — a computer never forgets who played where. So the levels were built on how many moves the AI remembers. This note is about those memory AIs, and the Very Hard AI that remembers everything.',
    ],
    summary: 'AIs that remember only the last 3, 8 or 36 moves, and a Very Hard one with full memory and VCF/VCT threat search — and how forgotten stones become a weakness.',
    sections: [
      {
        id: 'memory',
        title: 'Difficulty = memory',
        blocks: [
          { type: 'p', text: 'Blind Gomoku launched on the morning of 17 November. Easy to Hard all compute the same thing: every empty cell within two of an existing stone is a candidate, scored by the line shapes in four directions — five 1,000,000, open four 80,000, closed four 20,000, open three 8,000, closed three 1,400, open two 420, and so on. **Attack score if I play here × 1.08 + defence score if the opponent played here**, plus a centre bonus and a little noise; the highest cell is played.' },
          { type: 'p', text: 'The one difference: line shapes are read from **the stones of the last few moves only**. Stones outside that memory vanish from the calculation — not mine, not theirs, not even blockers. It still never plays on an occupied cell. It acts like someone who can see there is a stone but has forgotten whose it is.' },
          { type: 'table', head: ['Level', 'At launch (11/17)', '11/20', 'Now (from 11/26)'], rows: [
            ['Easy', 'last 5 moves', 'last 3', 'last 3'],
            ['Normal', 'last 15', 'last 8', 'last 8'],
            ['Hard', 'all', 'last 24', 'last 36'],
            ['Very Hard', '—', '—', 'all + threat search'],
          ] },
        ],
      },
      {
        id: 'retune',
        title: 'Two adjustments',
        blocks: [
          { type: 'p', text: 'At first Hard remembered the whole game. The records on 20 November showed people winning 22% against Normal and 8% against Hard, far below the 50% and 25% targets, so memory went from 5 / 15 / all down to **3 / 8 / 24 moves**.' },
          { type: 'p', text: 'On 26 November it went the other way. As the code comment records, people won 41% against a 24-move Hard — and **58% once they had played a few games**. The trick spread fast: play on until it forgets. In a long game the early stones slide out of its memory. Hard now remembers 36 moves, most of a game.' },
        ],
      },
      {
        id: 'hell',
        title: 'Very Hard: the player who remembers everything',
        lead: 'The hell-mode AI added on 24 November.',
        blocks: [
          { type: 'p', text: 'The first decision for Very Hard was what the AI is allowed to know. Reading the hidden face of a stone would be cheating, so the engine receives **only where each stone went and in what order**. Black moves first, so odd-numbered stones are black and even ones white — exactly what someone who watched the whole game and remembered the order would know. In the words of the code comment, the hidden face hides nothing from someone who remembers the order.' },
          { type: 'steps', items: [
            { title: 'Five / block', body: 'If it can make five now, it does; if the opponent can next move, it blocks.' },
            { title: 'VCF (up to 25% of the time)', body: 'Victory by continuous fours: every move is a four, so the opponent must block, until an open four or double four wins. Read up to 24 plies deep.' },
            { title: 'VCT (up to 45%)', body: 'Victory by continuous threats, using open threes as well as fours, checking every defence (cells that stop the three, and counter-fours), four levels deep.' },
            { title: 'Safe candidates only', body: 'With no forced win, it takes 18 candidates and drops any move that gives the opponent a VCF.' },
            { title: 'Alpha-beta (up to 92%)', body: 'The remaining candidates go into iterative-deepening alpha-beta with a transposition table. When the opponent threatens an open four or double four, only blocks and counter-fours are considered.' },
          ] },
          { type: 'p', text: 'Finally it picks at random among the top three moves close to the best (within 40 points or 4% of the best score); in a decided position it plays the best move. Its first move is not searched: one of the cells right next to your first stone (straight or diagonal).' },
          { type: 'callout', tone: 'note', title: 'Why two colours', text: 'Very Hard is locked to two outer colours. As the game’s own note explains, more colours make positions easier to memorise by colour pairs. Against an AI that remembers everything, the human plays under the hardest memory conditions too.' },
          { type: 'callout', tone: 'tip', title: 'Self-play results', text: '`scripts/blind-gomoku-arena.ts` played Very Hard against Hard (then 24-move memory) for 240 games with colours swapped: 98.8% wins at 1.5 s a move, 100% at 1 s.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'table', head: ['Level', 'Human win rate', 'Games'], rows: [
            ['Easy', '66.7%', '18'],
            ['Normal', '52.3%', '237'],
            ['Hard', '39.9%', '301'],
            ['Very Hard', '23.1%', '156'],
          ] },
          { type: 'p', text: 'Normal is close to its 50% target. Hard’s 39.9% comes mostly from the 24-move period. Four players hold the Very Hard certificate. In all (signed in or not) the game had been played 2,310 times, 1,748 against the AI.' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Easy–Hard', title: 'Build lines from forgotten stones', body: 'The AI does not see your stones outside its memory as yours. Add new stones to two or three old ones and it sees a lone stone, not a line, and does not block. Easy forgets after 3 moves, Normal after 8, Hard after 36.' },
            { tag: 'Easy–Hard', title: 'Forgotten stones are not walls either', body: 'Its own forgotten stones vanish too, so it may take a blocked line for an open one and spend moves attacking it.' },
            { tag: 'Very Hard', title: 'An opponent who knows the order', body: 'There is no blindness for this AI — play it as an ordinary gomoku AI. It finds almost every VCF, so slow pressure with overlapping threes has a better chance than chains of fours. VCT is read four levels deep; longer pressure is left to the alpha-beta evaluation.' },
            { tag: 'All', title: 'Two flips', body: 'You may flip the board twice per game for 5 seconds. Save them for the middle game, when memory blurs, right before a big decision.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/blindGomoku.ts` — DIFFICULTY_MEMORY, linePotential, candidateScore, chooseAiMove',
      '`src/lib/blindGomokuHell.ts`, `src/lib/blindGomokuHell.worker.ts` — Very Hard (VCF, VCT, alpha-beta, random pick)',
      '`scripts/blind-gomoku-arena.ts` — self-play',
      '`src/messages/ko.json` BlindGomoku — rule text (two flips, two-colour lock), read only',
      'Commits b1cc658 (11/17 Blind Gomoku), 599e8a3 (11/17 colour rule), 1fe2d84 (11/20 memory 3/8/24; Normal 22%, Hard 8%), 44f49a9 (11/24 Very Hard, self-play), 0d9a9c9 (11/24 Very Hard locked to 2 colours), e227318 (11/26 Hard 36 moves)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (game = blind_gomoku, mode = ai) win rate by level, hell_clears count, game_plays_daily totals',
    ],
  },
};

export default article;
