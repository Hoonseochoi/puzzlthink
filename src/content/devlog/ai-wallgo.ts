import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-wallgo',
  category: 'ai',
  games: ['wallgo', 'wallgo2'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '벽바둑 AI는 어떻게 두나 — 쉬움부터 매우 어려움(헬모드)까지 | 개발 노트',
      description: '벽바둑·벽바둑 II AI 개발기. 첫날의 단순한 점수식, "먼저 닿는 칸" 영역 추정, 다음 사람의 응수를 읽는 어려움, 알파베타 탐색과 치환표로 끝까지 읽는 매우 어려움 AI까지. 사람이 파고들 수 있는 틈과 실제 승률 집계도 담았어요.',
      keywords: ['벽바둑 AI', '벽바둑 헬모드', '벽바둑 매우 어려움', '벽바둑 II AI', '데블스플랜 벽바둑', '알파베타 탐색', '보로노이 영역 추정', '게임 AI 개발기'],
    },
    title: '벽바둑 AI는 어떻게 두나',
    lead: '점수식 하나로 시작해서, 끝까지 읽는 탐색 AI가 되기까지.',
    intro: [
      '벽바둑은 PUZZLTHINK가 처음으로 만든 보드게임이에요. 그래서 AI도 가장 여러 번 갈아엎었어요. 이 글은 벽바둑과 벽바둑 II의 AI가 난이도마다 실제로 무엇을 계산하는지, 왜 그렇게 바꿨는지를 커밋 기록을 따라 정리한 개발 노트예요.',
      '난이도별 계산을 숨기지 않고 그대로 적었어요. 매우 어려움 AI가 어디까지 읽고 어디서 읽기를 멈추는지도요. 이기고 싶다면 마지막 장의 "사람이 파고들 수 있는 틈"부터 읽어도 좋아요.',
    ],
    summary: '"먼저 닿는 칸" 영역 추정에서 알파베타·치환표 탐색까지. 벽바둑과 벽바둑 II AI가 난이도마다 하는 계산과 그 틈.',
    sections: [
      {
        id: 'first-ai',
        title: '첫날의 AI: 점수식 하나',
        blocks: [
          { type: 'p', text: '벽바둑이 사이트에 처음 올라간 건 11월 16일 오후예요. 그날 AI는 아주 단순했어요. 둘 수 있는 모든 "이동 + 벽" 조합을 하나씩 해 보고, 그 결과를 점수식 하나로 매겼어요. **이미 닫힌 내 영역 × 7, 내 가장 큰 영역 × 2, 상대 최고 영역 × 3을 빼고, 내 이동 가능 수는 조금 더하고**, 여기에 작은 무작위 값을 섞는 식이었어요. 쉬움은 그중 아무거나, 보통은 상위 4개 중 하나, 어려움은 1등을 골랐어요.' },
          { type: 'p', text: '문제는 벽바둑의 영역이 게임 막바지가 되기 전까지는 거의 닫히지 않는다는 점이었어요. 닫힌 영역만 세는 점수식은 초반·중반 내내 대부분의 수를 "0점 차이"로 보게 되고, 결국 무작위 값이 수를 고르는 셈이었어요. 배치도 마찬가지였어요. 처음엔 "내 말끼리 멀리, 가운데 가깝게" 같은 거리 규칙으로만 자리를 골랐어요.' },
        ],
      },
      {
        id: 'reach-first',
        title: '같은 날 밤: "먼저 닿는 칸"을 세기',
        blocks: [
          { type: 'p', text: '그날 밤 10시쯤 AI를 처음으로 크게 고쳤어요(커밋 메시지는 "reach-first territory estimate, 2-ply hard mode"). 핵심은 아직 닫히지 않은 영역도 미리 세는 거예요. 각 플레이어의 말에서 동시에 너비 우선 탐색(BFS)을 돌려서, 빈칸마다 **누가 가장 적은 걸음으로 닿는지**를 구해요. 벽과 다른 말은 길을 막고, 두 사람이 같은 걸음에 닿는 칸은 아무의 것도 아니에요. 바둑 AI에서 흔히 쓰는 "보로노이 영역" 추정과 같은 생각이에요.' },
          { type: 'p', text: '지금의 평가식은 이렇게 생겼어요. 내 예상 영역 × 3에서 가장 강한 상대의 예상 영역 × 2를 빼고, 나머지 상대의 영역은 × 0.6만 빼요. 이미 확정된 내 칸은 × 0.5를 더하고, 말 주변에 열린 변이 0개면 4점, 1개면 1.5점의 "갇힘 벌점"을 줘요. 판이 완전히 갈라져 승패가 정해졌으면 이 계산 대신 ±10,000점(공동 승리는 5,000점)을 써요.' },
          { type: 'callout', tone: 'note', title: '벽 부수기는 아껴 쓰기', text: '1:1:1에서 한 번만 쓸 수 있는 벽 부수기는 평가값에서 6점을 빼고 시작해요. 한 번뿐인 자원이라, 확실히 이득일 때만 쓰게 하려는 장치예요.' },
        ],
      },
      {
        id: 'levels',
        title: '쉬움·보통·어려움이 고르는 방법',
        blocks: [
          { type: 'p', text: '세 난이도는 모두 같은 후보 목록에서 출발해요. 가능한 모든 "이동 + 벽"을 위 평가식으로 점수 매겨 높은 순으로 줄 세운 목록이에요. 차이는 그 목록에서 무엇을 고르느냐예요.' },
          { type: 'table', head: ['난이도', '수 고르기', '배치'], rows: [
            ['쉬움', '상위 절반 중 무작위. 이기는 수가 있어도 지나칠 수 있어요.', '빈칸 아무 데나'],
            ['보통', '바로 이기는 수가 있으면 그 수, 없으면 상위 3개 중 무작위', '영역 추정 + 큰 무작위(±1.5)'],
            ['어려움', '상위 10~14개 후보마다 다음 사람의 최선 응수까지 읽고, 그 결과 75% + 지금 점수 25%로 비교', '영역 추정 + 작은 무작위(±0.3)'],
          ] },
          { type: 'p', text: '어려움의 "다음 사람의 최선 응수"는 상대도 같은 1수짜리 평가로 고른다고 가정해요. 1:1이면 후보 14개, 1:1:1이면 후보 10개를 읽어요.' },
          { type: 'h3', text: '1:1:1의 어려움이 보통과 다를 바 없었던 이유' },
          { type: 'p', text: '11월 26일에 난이도를 플레이 기록으로 다시 맞췄는데, 1:1:1 어려움에서 이상한 숫자가 나왔어요. 코드 주석에 남긴 그대로 옮기면, 사람이 어려움과 보통을 상대로 **둘 다 47% 정도** 이기고 있었어요. 세 명이 실력이 같다면 33%가 정상이에요. 원인은 어려움이 두 상대 중 **바로 다음 사람의 응수만** 읽고 있었다는 점이에요. 그래서 1:1:1에서는 세 번째 사람의 응수까지 읽도록 바꿨어요. 대신 계산량이 늘어나는 만큼 후보는 14개에서 10개로 줄였어요.' },
        ],
      },
      {
        id: 'hell',
        title: '매우 어려움: 끝까지 읽는 탐색',
        lead: '11월 24일, 1:1 전용으로 만든 헬모드 AI예요. 벽바둑과 벽바둑 II가 같은 엔진을 써요.',
        blocks: [
          { type: 'p', text: '어려움은 "내 수 → 상대 응수" 두 수까지만 봐요. 매우 어려움은 그 한계를 없애려고 완전히 새로 짰어요. 구조는 체스 엔진에서 쓰는 방식 그대로예요. **반복 심화 네가맥스 + 알파베타 가지치기 + 치환표**. 여기서 한 "수"는 배치 하나, 또는 이동과 그 뒤의 벽 하나를 합친 한 턴 전체예요. 배치 단계도 같은 탐색 트리로 읽어요.' },
          { type: 'steps', items: [
            { title: '판을 숫자 배열로', body: '7×7 판을 49칸짜리 배열로, 벽은 칸마다 4비트로 바꿔요. 같은 국면을 다시 만나면 계산을 재사용할 수 있도록 국면마다 조브리스트 해시를 붙이고, 약 52만 칸(2^19)짜리 치환표에 결과를 저장해요.' },
            { title: '후보 줄이기', body: '모든 수를 끝까지 읽기에는 너무 많아서, 정적 평가로 줄 세운 뒤 루트에서는 상위 28개, 깊어질수록 16 → 11 → 8 → 7 → 6개만 읽어요(전방 가지치기).' },
            { title: '깊이를 하나씩 늘리며', body: '2수, 3수, 4수… 깊이를 하나씩 늘려 가며 다시 읽어요. 앞 깊이에서 가장 좋았던 수를 먼저 읽으면 알파베타가 훨씬 많이 잘라내요. 두 번째 수부터는 "널 윈도"로 빠르게 확인하고, 더 좋아 보일 때만 다시 정확히 읽어요.' },
            { title: '막판에는 전부', body: '아직 주인이 정해지지 않은 칸이 14개 이하로 줄면 가지치기를 끄고 모든 수를 읽어요. 시간 안에 끝까지 읽히면 그 결과는 추정이 아니라 정확한 승패예요.' },
          ] },
          { type: 'p', text: '평가식도 다시 썼어요. 기본은 어려움과 같은 "먼저 닿는 칸" 세기지만, 같은 걸음에 닿는 칸의 35%를 둘 차례인 쪽에 얹어 주고, 말 주변의 열린 변(활로)과 갇힘을 따로 계산하고, 배치 단계에서는 가장자리에 붙은 말에 감점을 줘요. 마지막으로 국면마다 정해지는 아주 작은 흔들림(±0.175)을 더해서, 점수가 같은 수 사이에서는 판마다 다른 수를 고르게 했어요.' },
          { type: 'p', text: '생각하는 시간은 PC에서 1.5초, 휴대폰·태블릿에서 1초예요. 탐색은 웹 워커(Web Worker)에서 돌아서 그동안 화면이 멈추지 않고, 워커를 못 쓰는 브라우저에서는 메인 스레드로 대신 돌려요. 다음 깊이를 끝내지 못할 것 같으면(시간의 55%를 넘기면) 거기서 멈추고, 이미 끝난 깊이의 최선 수를 둬요.' },
          { type: 'callout', tone: 'tip', title: '자기대국으로 확인하기', text: '공개 전에 `scripts/wallgo-selfplay.ts`로 매우 어려움과 어려움을 208판씩 붙였어요(한 수 1.5초, 자리와 선공을 번갈아). 매우 어려움의 승률은 벽바둑 95.7%, 벽바둑 II 98.6%였어요. 스크립트는 매우 어려움의 수가 규칙 엔진의 합법수 목록에 있는지도 한 수마다 확인해요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록을 집계한 값이에요.',
        blocks: [
          { type: 'table', caption: '1:1 모드, 사람의 승률 (전체 판수 중 이긴 비율)', head: ['난이도', '벽바둑', '벽바둑 II'], rows: [
            ['쉬움', '93.9% (33판)', '77.3% (22판)'],
            ['보통', '49.1% (426판)', '51.0% (392판)'],
            ['어려움', '27.0% (477판)', '31.2% (282판)'],
            ['매우 어려움', '7.6% (158판)', '11.6% (155판)'],
          ] },
          { type: 'p', text: '같은 시각까지 매우 어려움을 이기고 헬모드 인증서를 받은 플레이어는 벽바둑 9명, 벽바둑 II 15명이에요. 로그인 여부와 상관없이 센 전체 판수는 벽바둑 8,750판(AI전 7,636판), 벽바둑 II 7,624판(AI전 6,006판)이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'p', text: 'AI가 하는 계산을 알면 약한 곳도 보여요. 코드에서 그대로 읽히는 틈만 적었어요.' },
          { type: 'cards', items: [
            { tag: '보통', title: '이기는 수 말고는 운', body: '보통은 상위 3개 중 무작위예요. 당장 판을 끝내는 수가 아니면 2·3등 수도 자주 두니, 한 번 실수를 기다렸다가 크게 가르는 벽을 치면 돼요.' },
            { tag: '어려움', title: '두 턴 뒤의 함정', body: '어려움은 내 수와 상대의 "1수짜리 최선" 응수까지만 봐요. 세 번째 턴에야 드러나는 포위(벽 두 장으로 닫히는 방)는 못 봐요. 그리고 후보는 1수 평가 상위 10~14개뿐이라, 지금 당장은 손해처럼 보이는 수는 아예 검토하지 않아요.' },
            { tag: '매우 어려움', title: '가지치기 바깥의 수', body: '정적 평가가 낮은 수는 깊은 곳일수록 읽지 않아요(깊이 3에서 11개, 그 아래는 8개 이하). 당장은 영역이 줄어 보이지만 몇 턴 뒤에 큰 방을 닫는 "희생 수"가 가장 잘 통하는 종류예요.' },
            { tag: '매우 어려움', title: '중반을 길게', body: '정확한 끝내기 읽기는 미확정 칸이 14개 이하일 때부터예요. 그 전에는 추정 평가예요. 중반에 영역을 일찍 확정하려 하지 말고, 미확정 칸이 많은 상태에서 차이를 벌려야 해요.' },
            { tag: '매우 어려움', title: '휴대폰이 조금 더 약해요', body: '같은 AI지만 터치 기기에서는 1초만 생각해요. 깊이 하나 차이가 나는 국면이 생겨요.' },
            { tag: '공통', title: '가장자리 배치를 싫어해요', body: '어려움 이하도 배치에서 중앙을 선호하고, 매우 어려움은 가장자리 말에 감점을 줘요. AI 말이 가운데로 몰리는 걸 예상하고 자리를 잡으면 첫 벽을 칠 때 유리해요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/wallgo.ts` — AI 섹션(estimateTerritory, evaluatePosition, chooseBotAction, chooseBotPlacement)',
      '`src/lib/wallgoHell.ts`, `src/lib/wallgoHellClient.ts`, `src/lib/wallgoHell.worker.ts` — 매우 어려움 탐색',
      '`scripts/wallgo-selfplay.ts` — 자기대국 스크립트',
      '커밋 2930926 (11/16 첫 벽바둑), 3f3d32f (11/16 영역 추정·2수 어려움), a58d850 (11/19 벽바둑 II), 230c126 (11/24 매우 어려움, 자기대국 결과), e227318 (11/26 1:1:1 어려움 재조정)',
      'DB 집계(2026-11-26 14:22 KST): game_results의 mode=ai 판을 게임·인원·난이도별로 센 승률, hell_clears 게임별 인원, game_plays_daily 게임·모드별 합계',
    ],
  },
  en: {
    meta: {
      title: 'How the Wallgo AI plays — from Easy to Very Hard (hell mode) | Dev notes',
      description: "A dev diary of the Wallgo and Wallgo II AIs: a day-one scoring formula, a reach-first territory estimate, a Hard level that reads the next reply, and a Very Hard alpha-beta search with a transposition table. With the gaps a human can use and real win rates.",
      keywords: ['Wallgo AI', 'Wallgo hell mode', "Devil's Plan Wallgo", 'alpha-beta search', 'Voronoi territory', 'game AI dev diary'],
    },
    title: 'How the Wallgo AI plays',
    lead: 'From one scoring formula to a search that reads to the end of the game.',
    intro: [
      'Wallgo was the first board game built for PUZZLTHINK, and its AI was rewritten more often than any other. This note follows the commit history to explain what each Wallgo and Wallgo II difficulty actually computes, and why it changed.',
      "Nothing is hidden: every level's calculation is written out, including where the Very Hard AI stops reading. If you only want to win, skip to the last section, \"Gaps a human can use\".",
    ],
    summary: 'From a reach-first territory estimate to alpha-beta with a transposition table: what each Wallgo AI level computes, and where it is weak.',
    sections: [
      {
        id: 'first-ai',
        title: 'Day one: a single formula',
        blocks: [
          { type: 'p', text: 'Wallgo went live on the afternoon of 16 November, with a very simple AI. It tried every "move + wall" combination and scored the result with one formula: **closed territory × 7, largest own area × 2, minus the best rival’s territory × 3, plus a little for mobility**, plus some randomness. Easy picked any of them, Normal one of the top four, Hard the best.' },
          { type: 'p', text: 'The trouble is that Wallgo areas hardly ever close before the end. A formula that only counts closed areas sees almost every opening and middle-game move as "no difference", so the random term was really choosing. Placement was the same: it only followed distance rules such as "keep my pieces apart, stay near the centre".' },
        ],
      },
      {
        id: 'reach-first',
        title: 'That night: counting the squares you reach first',
        blocks: [
          { type: 'p', text: 'Around 10 pm the same day came the first big rewrite (commit message: "reach-first territory estimate, 2-ply hard mode"). The idea is to count territory before it is closed. A breadth-first search runs from every player’s pieces at once and finds, for each empty square, **who reaches it in the fewest steps**. Walls and pieces block the way; a square two players reach in the same number of steps belongs to nobody. It is the "Voronoi territory" idea familiar from Go programs.' },
          { type: 'p', text: 'Today’s evaluation is: my expected territory × 3, minus the strongest rival’s × 2, minus the other rival’s × 0.6, plus already-settled squares × 0.5, and a "trapped" penalty of 4 for a piece with no open side and 1.5 for a piece with one. Once the board is fully separated the game is decided, and ±10,000 (5,000 for a shared win) replaces the estimate.' },
          { type: 'callout', tone: 'note', title: 'Saving the wall break', text: 'The one-time wall break in 1:1:1 starts with a 6-point penalty, so the AI spends it only for a clear gain.' },
        ],
      },
      {
        id: 'levels',
        title: 'How Easy, Normal and Hard choose',
        blocks: [
          { type: 'p', text: 'All three levels start from the same candidate list: every "move + wall", scored with the evaluation above and sorted. They differ in what they take from it.' },
          { type: 'table', head: ['Level', 'Choosing a move', 'Placement'], rows: [
            ['Easy', 'Random from the better half; it can miss a winning move.', 'Any empty square'],
            ['Normal', 'A move that wins on the spot if there is one, otherwise random from the top 3', 'Territory estimate + large noise (±1.5)'],
            ['Hard', 'For the top 10–14 candidates, reads the next player’s best reply and compares 75% of that result with 25% of the current score', 'Territory estimate + small noise (±0.3)'],
          ] },
          { type: 'p', text: 'Hard assumes the opponent answers with the same one-move evaluation. It reads 14 candidates in 1:1 and 10 in 1:1:1.' },
          { type: 'h3', text: 'Why 1:1:1 Hard was no harder than Normal' },
          { type: 'p', text: 'When the levels were retuned from play data on 26 November, 1:1:1 Hard showed an odd number. As the code comment records, people were winning **about 47% against both Hard and Normal**, where three equal players would each win 33%. The cause: Hard only read the reply of the **next** player, not the third. In 1:1:1 it now reads the third player’s answer too, with 10 candidates instead of 14 to pay for the extra work.' },
        ],
      },
      {
        id: 'hell',
        title: 'Very Hard: a search that reads to the end',
        lead: 'The hell-mode AI added on 24 November, 1:1 only. Wallgo and Wallgo II share the engine.',
        blocks: [
          { type: 'p', text: 'Hard looks two plies deep: my move, then the reply. Very Hard was written from scratch to remove that limit, in the way chess engines are built: **iterative-deepening negamax with alpha-beta pruning and a transposition table**. Here one ply is a whole turn — a placement, or a move plus the wall that follows it. The placement phase is searched with the same tree.' },
          { type: 'steps', items: [
            { title: 'The board as numbers', body: 'The 7×7 board becomes a 49-cell array and each cell keeps its walls in 4 bits. Every position gets a Zobrist hash, so results can be reused from a transposition table of about 520,000 (2^19) slots when the same position comes up again.' },
            { title: 'Fewer candidates', body: 'There are too many moves to read them all, so they are ordered by the static evaluation and only the top 28 are read at the root, then 16 → 11 → 8 → 7 → 6 deeper down (forward pruning).' },
            { title: 'One depth at a time', body: 'It searches 2 plies, then 3, then 4… Reading the previous depth’s best move first lets alpha-beta cut far more. From the second move on, a quick null-window probe checks whether a move can beat the best so far, and only then is it searched exactly.' },
            { title: 'Everything at the end', body: 'Once 14 or fewer squares are still contested, pruning is switched off and every move is read. If that finishes in time the result is not an estimate but the exact outcome.' },
          ] },
          { type: 'p', text: 'The evaluation was rewritten too. It still counts squares reached first, but gives 35% of the equidistant squares to the side to move, scores open sides (liberties) and trapped pieces separately, and during placement penalises pieces on the board edge. Finally a tiny per-position jitter (±0.175) makes equal moves vary from game to game.' },
          { type: 'p', text: 'It thinks for 1.5 s on a computer and 1 s on phones and tablets. The search runs in a Web Worker so the page never freezes, falling back to the main thread where workers are not available. If the next depth would not finish (55% of the time is gone), it stops and plays the best move of the last finished depth.' },
          { type: 'callout', tone: 'tip', title: 'Checked by self-play', text: 'Before release, `scripts/wallgo-selfplay.ts` played Very Hard against Hard for 208 games per variant (1.5 s a move, seats and first move alternating). Very Hard won 95.7% in Wallgo and 98.6% in Wallgo II. The script also checks every Very Hard move against the rule engine’s list of legal moves.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI, aggregated on 2026-11-26 at 14:00 KST.',
        blocks: [
          { type: 'table', caption: '1:1, the human’s win rate over all games', head: ['Level', 'Wallgo', 'Wallgo II'], rows: [
            ['Easy', '93.9% (33 games)', '77.3% (22 games)'],
            ['Normal', '49.1% (426)', '51.0% (392)'],
            ['Hard', '27.0% (477)', '31.2% (282)'],
            ['Very Hard', '7.6% (158)', '11.6% (155)'],
          ] },
          { type: 'p', text: 'By then 9 players had beaten Very Hard Wallgo and 15 had beaten Very Hard Wallgo II, earning the hell certificate. Counting everyone, signed in or not, Wallgo had been played 8,750 times (7,636 against the AI) and Wallgo II 7,624 times (6,006 against the AI).' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'p', text: 'Knowing what the AI computes shows where it is weak. Only gaps that can be read straight from the code are listed.' },
          { type: 'cards', items: [
            { tag: 'Normal', title: 'Luck unless it can win now', body: 'Normal picks at random from the top three. Unless a move ends the game, it often plays the second or third best — wait for one slip, then build the wall that splits the board.' },
            { tag: 'Hard', title: 'Traps two turns away', body: 'Hard sees its move and the opponent’s one-move best reply, no more. A room that closes with two walls on your third turn is invisible to it. And only the top 10–14 one-move candidates are read, so a move that looks like a loss right now is never considered.' },
            { tag: 'Very Hard', title: 'Moves outside the pruning', body: 'Moves with a poor static score are not read deep in the tree (11 at depth 3, 8 or fewer below). "Sacrifices" that shrink your area now but close a big room a few turns later are the kind most likely to work.' },
            { tag: 'Very Hard', title: 'Keep the middle game long', body: 'Exact endgame reading starts only at 14 or fewer contested squares; before that it is an estimate. Build your lead while many squares are still open rather than settling areas early.' },
            { tag: 'Very Hard', title: 'A little weaker on phones', body: 'Same AI, but only 1 s of thinking on touch devices — some positions are one depth shallower.' },
            { tag: 'All', title: 'It dislikes the edge', body: 'Every level prefers central placements and Very Hard penalises edge pieces. Expect the AI to crowd the middle and place to make your first walls count.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/wallgo.ts` — the AI section (estimateTerritory, evaluatePosition, chooseBotAction, chooseBotPlacement)',
      '`src/lib/wallgoHell.ts`, `src/lib/wallgoHellClient.ts`, `src/lib/wallgoHell.worker.ts` — the Very Hard search',
      '`scripts/wallgo-selfplay.ts` — the self-play script',
      'Commits 2930926 (11/16 first Wallgo), 3f3d32f (11/16 territory estimate, 2-ply Hard), a58d850 (11/19 Wallgo II), 230c126 (11/24 Very Hard and its self-play results), e227318 (11/26 1:1:1 Hard retune)',
      'DB aggregates (2026-11-26 14:22 KST): win rates from game_results (mode = ai) by game, player count and level; hell_clears per game; game_plays_daily totals by game and mode',
    ],
  },
};

export default article;
