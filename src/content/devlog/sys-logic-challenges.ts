import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'sys-logic-challenges',
  category: 'systems',
  games: ['slitherlink', 'starbattle', 'nonogram', 'masyu', 'binairo', 'onestroke', 'colorlink'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '슬리더링크 맵 챌린지 개발기 — 답이 하나뿐인 무작위 퍼즐과 "맵 뺏기" | 개발 노트',
      description: '슬리더링크와 논리 퍼즐의 "새 맵 차지·맵 뺏기" 챌린지가 만들어진 과정. 같은 시드면 같은 판이 나오는 생성기, 답이 하나뿐인지 확인하며 숫자를 지우는 방법, 시간 랭킹에서 맵 수집 랭킹으로 바꾼 이유, 지금까지 만들어진 1만 개 넘는 판의 숫자까지.',
      keywords: ['슬리더링크', '슬리더링크 챌린지', '맵 뺏기', '논리 퍼즐 생성', '유일해 퍼즐', '데블스플랜 슬리더링크', '개발 노트'],
    },
    title: '슬리더링크 맵 챌린지 개발기',
    lead: '푼 판은 내 것이 되고, 더 빨리 푼 사람이 가져가요.',
    intro: [
      '슬리더링크는 점선 격자 위에 닫힌 고리 하나를 그려서, 모든 숫자가 그 칸을 둘러싼 고리의 변 수와 맞게 하는 퍼즐이에요. 데블스 플랜에 나온 그 퍼즐이에요. PUZZLTHINK에서는 11월 19일 오후에 올라갔고, 이 게임의 "맵 챌린지"는 사흘 뒤 마슈·노노그램·스타배틀·비나이로·한붓길·컬러 잇기까지 여섯 개 논리 퍼즐로 퍼졌어요.',
      '이 글은 그 챌린지의 두 가지 축, **답이 하나뿐인 무작위 판을 만드는 일**과 **판을 소유하고 빼앗는 규칙**이 만들어진 과정을 정리한 개발 노트예요.',
    ],
    summary: '같은 시드면 같은 판, 답이 하나뿐인지 확인하며 숫자 지우기, 시간 순위에서 맵 수집 순위로. 1만 개 넘게 만들어진 슬리더링크 판의 숫자까지.',
    sections: [
      {
        id: 'generate',
        title: '답이 하나뿐인 판 만들기',
        blocks: [
          { type: 'p', text: '퍼즐은 **시드**에서 만들어져요. 같은 시드를 넣으면 언제나 같은 판이 나와요. 그래서 판을 통째로 저장하거나 보낼 필요 없이 숫자 하나로 공유하고, 여러 사람이 같은 판으로 경주하고, 푼 과정을 다시 재생할 수 있어요.' },
          { type: 'steps', items: [
            { title: '고리부터', body: '시드로 정한 무작위 순서로 칸을 이어 붙여 하나의 영역을 키우고, 그 영역의 테두리를 정답 고리로 써요.' },
            { title: '숫자 채우기', body: '모든 칸에 "정답 고리가 이 칸의 몇 변을 지나는지"를 적어요. 이 상태에서 답이 정확히 하나인지 풀이기로 확인하고, 아니면 다시 만들어요.' },
            { title: '숫자 지우기', body: '칸을 무작위 순서로 돌면서 숫자를 하나씩 지워 봐요. 지운 뒤에도 답이 하나뿐이면 그대로 지우고, 답이 둘 이상이 되면 되돌려요.' },
            { title: '목표 개수에서 멈추기', body: '남길 숫자의 비율은 판 크기별로 정해 뒀어요(9×9 점 판 56%, 10×10 53%, 11×11 50%). 코드 주석에 따르면 방송의 10×10 판에는 숫자가 칸의 절반쯤 있었어요.' },
          ] },
          { type: 'p', text: '풀이기는 "답의 개수"를 두 개까지만 세요. 두 번째 답이 나오는 순간 "유일하지 않음"이니까요. 그리고 계산량에 상한이 있어서, 시간 안에 답을 못 내면 **유일하지 않은 것으로** 쳐요. 확신할 수 없는 숫자는 지우지 않는 쪽으로요. 사흘 뒤 들어간 마슈는 풀이기가 진주를 놓을 자리를 정하는 방식으로 유일해를 만들고, 노노그램은 줄 단위 논리만으로 끝까지 풀리는 좌우 대칭 그림으로 만들어요.' },
        ],
      },
      {
        id: 'challenge',
        title: '새 맵 차지, 맵 뺏기',
        blocks: [
          { type: 'p', text: '첫 버전부터 챌린지는 두 가지였어요.' },
          { type: 'cards', items: [
            { tag: 'NEW', title: '새로운 챌린지', body: '서버가 새 11×11 점 판을 무작위로 내주고 시간을 재요. 풀면 그 판이 공개되고, 그 판의 주인이 돼요.' },
            { tag: 'BEAT', title: '기존 챌린지 깨기', body: '공개된 판을 그 주인의 기록보다 빨리 풀면 판을 빼앗아요. **한 판에 한 사람당 한 번만** 도전할 수 있고, 답은 보여 주지 않아요. 도전하는 순간 기회가 쓰여요.' },
          ] },
          { type: 'p', text: '힌트는 챌린지에서 한 번(지금은 경쟁전 피스 하나를 써야 해요), 연습에서는 무제한이에요. 풀이 시간을 화면이 아니라 **서버가 잰다**는 것이 챌린지의 기본 전제예요.' },
          { type: 'h3', text: '시간 순위에서 맵 수집 순위로' },
          { type: 'p', text: '첫 순위는 시간이었어요(예: "#4 · 39분"). 그런데 같은 날 몇 분 사이에 커밋 두 개가 이어졌어요. 판에 주인의 이름을 붙이고("○○님의 맵 해보기"), 랭킹 줄마다 그 사람의 판을 바로 열 수 있게 하고, 공유 링크로 판을 열 수 있게 했어요. 그리고 순위를 **가진 판의 수(맵 수집)**로 바꿨어요. 더 빠른 사람에게 판을 빼앗기면 내 수가 줄어요. 시간 순위는 한 번의 기록으로 끝나지만, 맵 수집은 계속 지켜야 하는 순위예요.' },
          { type: 'p', text: '그 뒤로 판에는 이야기가 쌓이기 시작했어요. 11월 20일에는 판을 빼앗을 때 "n번째 뺏었어요"와 라이벌 목록이 붙었고, 판마다 **맵 히스토리**(NEW → 1번째 → 2번째…, 각자의 기록)를 볼 수 있게 됐어요. 같은 사람에게서 한 번만 빼앗을 수 있게 했다가 되돌린 기록도 남아 있어요. 11월 22일에는 여섯 논리 퍼즐의 맵 뺏기 목록에도 주인의 기록과 히스토리가 들어갔고, 홈의 게임 카드에는 NEW 대신 챌린지 성공률이 붙었어요.' },
        ],
      },
      {
        id: 'input',
        title: '선 긋기 입력을 네 번 바꿨어요',
        blocks: [
          { type: 'p', text: '퍼즐 게임에서 가장 많이 고친 건 의외로 "선을 긋는 방법"이었어요.' },
          { type: 'list', items: [
            '**11/19** 펜·지우개·전체 지우기·✕ 표시 도구로 시작했어요.',
            '**11/20** 펜으로 점 사이를 탭하면 ✕가 찍히고, 선이나 ✕를 다시 탭하면 지워지게 했어요.',
            '**11/22** 플레이어 의견을 받아 탭 입력으로 돌아갔어요. 탭할 때마다 빈칸 → 선 → ✕ → 빈칸. 드래그는 뺐고, 되돌리기(Ctrl/⌘+Z)를 넣었어요.',
            '**11/23** 펜 탭은 선만 켜고 끄고, ✕는 ✕ 버튼으로만. 그날 저녁 펜 드래그가 돌아왔어요. 지나간 모든 변을 한 번에 긋고(되돌리기 한 번), 선 위에서 시작하면 지우는 방식이에요.',
          ] },
        ],
      },
      {
        id: 'learn',
        title: '배우는 길: 공략과 플레이 영상',
        blocks: [
          { type: 'p', text: '11월 21일 새벽, "처음이라면?" 버튼으로 여는 슬리더링크 공략 페이지가 생겼어요. 그림으로 보는 기법과 5×5 판을 처음부터 끝까지 푸는 예제가 들어 있어요. 11월 22일에는 **플레이 영상으로 배우기**가 생겼어요. 퍼즐마다 시연용 판 하나를 사람처럼 한 단계씩 풀어 가며, 설명하는 칸에 말풍선을 붙여요. 비나이로·노노그램·스타배틀은 규칙에 따른 추론으로, 마슈는 진주의 다리부터, 한붓길과 컬러 잇기는 중요한 칸마다 메모를 달아서요. 재생·정지·한 단계·2배속·되감기를 할 수 있어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '숫자로 보면',
        lead: '2026-11-26 14시(KST) 기준.',
        blocks: [
          { type: 'table', caption: '슬리더링크 맵 챌린지 (11×11 점 판)', head: ['', '값'], rows: [
            ['만들어진 판', '10,159개'],
            ['풀려서 공개된 판', '1,083개'],
            ['새 판을 처음 푼 시간의 중앙값', '8.3분'],
            ['지금 주인 기록의 중앙값', '5.5분'],
            ['맵 뺏기 도전', '3,648번'],
            ['빼앗긴 횟수', '937번'],
          ] },
          { type: 'p', text: '새 판 도전 중 끝까지 간 판(성공 또는 실패)에서 성공한 비율은 13.5%, 맵 뺏기는 29.6%였어요. 로그인 여부와 상관없이 센 슬리더링크 판수는 15,189판으로 사이트의 모든 게임 중 가장 많아요.' },
          { type: 'table', caption: '여섯 논리 퍼즐의 챌린지 성공률 (끝난 도전 중)', head: ['퍼즐', '새 맵', '맵 뺏기'], rows: [
            ['한붓길', '70.3%', '47.9%'],
            ['비나이로', '66.7%', '62.6%'],
            ['노노그램', '54.3%', '39.3%'],
            ['스타배틀', '45.6%', '44.8%'],
            ['컬러 잇기', '35.3%', '38.8%'],
            ['마슈', '12.4%', '16.7%'],
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/slitherlink.ts` — generatePuzzle, countSolutions, KEEP', '`src/lib/masyu.ts`, `src/lib/nonogram.ts`, `src/lib/logicChallenge.ts`, `src/lib/logicReplay.ts`',
      '커밋 170b871·674c6e2·51e6790 (11/19 챌린지, 주인 이름, 맵 수집 순위), 284c163·14dff26·a8bcba9 (11/20 뺏기 기록·히스토리·한 번의 기회), 1be9d5d·79ca0b2·e165dad·22a72eb (입력 방식), f541038 (11/21 공략), 3f3cba9·f08fe88·4eb29d7 (11/22 논리 퍼즐 여섯 개), ddd292c·8f22bf5 (11/22 플레이 영상), b16819f·83c3c38 (11/22 히스토리·성공률)',
      'DB 집계(2026-11-26 14:22 KST): slither_challenges(판 수, 공개 수, 처음 기록·주인 기록 중앙값, 도전 수), slither_takeovers 수, slither_runs·logic_runs 종류·결과별 수, game_plays_daily 합계',
      '챌린지 기록의 부정행위 판정 방법은 일부러 적지 않았어요.',
    ],
  },
  en: {
    meta: {
      title: 'Slitherlink map challenge dev notes — unique-answer random puzzles and taking boards | Dev notes',
      description: "How the 'claim a new map / take a map' challenges of Slitherlink and the logic puzzles were built: a seeded generator, removing clues while checking the answer stays unique, switching from a time ranking to a boards-owned ranking, and the numbers behind more than ten thousand boards.",
      keywords: ['Slitherlink', 'Slitherlink challenge', 'logic puzzle generator', 'unique solution puzzle', "Devil's Plan Slitherlink", 'dev notes'],
    },
    title: 'Slitherlink map challenge dev notes',
    lead: 'Solve a board and it is yours — until someone solves it faster.',
    intro: [
      'Slitherlink asks you to draw one closed loop on a dotted grid so that every number matches how many sides of its cell the loop uses — the puzzle from The Devil’s Plan. It went live on the afternoon of 19 November, and three days later its "map challenge" spread to six more logic puzzles: Masyu, Nonogram, Star Battle, Binairo, One Stroke and Color Link.',
      'This note covers the challenge’s two halves: **making random boards with exactly one answer**, and **the rules for owning and taking boards**.',
    ],
    summary: 'Same seed, same board; clues removed while the answer stays unique; from a time ranking to a boards-owned ranking — and the numbers behind 10,000+ Slitherlink boards.',
    sections: [
      {
        id: 'generate',
        title: 'Boards with exactly one answer',
        blocks: [
          { type: 'p', text: 'Every puzzle comes from a **seed**: the same seed always gives the same board. So a board can be shared as a single number, raced on by several people and replayed, without storing or sending the board itself.' },
          { type: 'steps', items: [
            { title: 'The loop first', body: 'Grow one region by joining cells in a seeded random order, and use the region’s outline as the answer loop.' },
            { title: 'Fill in the numbers', body: 'Write in every cell how many of its sides the loop uses, check with the solver that there is exactly one answer, and start over if not.' },
            { title: 'Remove numbers', body: 'Visit cells in random order and try removing each number. If the answer is still unique, it stays removed; if a second answer appears, it goes back.' },
            { title: 'Stop at the target', body: 'The share of numbers to keep is set per size (56% on 9×9-dot boards, 53% on 10×10, 50% on 11×11). The code notes the show’s 10×10 board had about half.' },
          ] },
          { type: 'p', text: 'The solver only counts answers up to two — a second one already means "not unique". Its work is capped, and if it cannot decide in time the board counts **as not unique**, so a number is never removed on a guess. Masyu, added three days later, places its pearls under the solver’s guidance to get a unique answer, and Nonograms are mirror-symmetric pictures that line logic alone solves completely.' },
        ],
      },
      {
        id: 'challenge',
        title: 'Claim a new map, take a map',
        blocks: [
          { type: 'p', text: 'From the first version there were two challenges:' },
          { type: 'cards', items: [
            { tag: 'NEW', title: 'New challenge', body: 'The server deals a fresh random 11×11-dot board and times you. Solve it and the board is published — and it is yours.' },
            { tag: 'BEAT', title: 'Beat a challenge', body: 'Solve a published board faster than its holder and you take it. **One try per person per board**, no answer shown, and the try is spent the moment you start.' },
          ] },
          { type: 'p', text: 'Challenges allow one hint (now it costs a contest piece); practice allows any number. The challenge rests on one premise: **the server, not the page, keeps the time.**' },
          { type: 'h3', text: 'From a time ranking to a collection' },
          { type: 'p', text: 'The first ranking was by time ("#4 · 39 min"). Within minutes the same day, two more commits followed: boards were titled with their owner ("try ○○’s map"), each ranking row could open that player’s board, and boards opened from share links. Then the ranking became **the number of boards you own**. Lose one to a faster solve and your count drops. A time ranking is one record; a collection has to be defended.' },
          { type: 'p', text: 'Boards then started to collect stories. On 20 November taking a board showed "you took your n-th" with a rivals panel, and each board got a **map history** (NEW → 1st → 2nd…, with everyone’s times). Allowing only one take from the same rival was tried and reverted. On 22 November the six logic puzzles’ take-a-map lists gained holder times and histories, and home cards replaced NEW with the challenge success rate.' },
        ],
      },
      {
        id: 'input',
        title: 'Drawing lines, changed four times',
        blocks: [
          { type: 'p', text: 'Surprisingly, the thing changed most in the puzzle games was how you draw a line.' },
          { type: 'list', items: [
            '**11/19** Pen, eraser, clear-all and an ✕ marker.',
            '**11/20** With the pen, tapping between dots marks ✕; tapping a line or ✕ clears it.',
            '**11/22** After player feedback, back to taps: each tap cycles empty → line → ✕ → empty. Dragging removed; undo (Ctrl/⌘+Z) added.',
            '**11/23** A pen tap toggles the line only; ✕ only via the ✕ button. That evening pen dragging came back: it draws every edge it crosses in one stroke (one undo step), and erases if started on a line.',
          ] },
        ],
      },
      {
        id: 'learn',
        title: 'Ways to learn: a guide and solve replays',
        blocks: [
          { type: 'p', text: 'In the early hours of 21 November a Slitherlink guide opened from a "new to this?" button, with pictured techniques and a 5×5 board solved from start to finish. On 22 November came **learn from a replay**: one demo board per puzzle, solved step by step the way a person would, with a speech bubble on the cell being explained — rule-based deduction for Binairo, Nonogram and Star Battle, pearls’ legs first for Masyu, notes at key cells for One Stroke and Color Link — with play, pause, step, 2× and scrubbing.' },
        ],
      },
      {
        id: 'numbers',
        title: 'In numbers',
        lead: 'As of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'table', caption: 'Slitherlink map challenge (11×11-dot boards)', head: ['', 'Value'], rows: [
            ['Boards generated', '10,159'],
            ['Boards solved and published', '1,083'],
            ['Median time of the first solve', '8.3 min'],
            ['Median time of the current holder', '5.5 min'],
            ['Take attempts', '3,648'],
            ['Boards taken', '937'],
          ] },
          { type: 'p', text: 'Of new-board runs that finished (solved or failed), 13.5% were solved; of take attempts, 29.6%. Counting everyone, Slitherlink had been played 15,189 times — the most of any game on the site.' },
          { type: 'table', caption: 'Challenge success rate in the six logic puzzles (finished runs)', head: ['Puzzle', 'New map', 'Take a map'], rows: [
            ['One Stroke', '70.3%', '47.9%'],
            ['Binairo', '66.7%', '62.6%'],
            ['Nonogram', '54.3%', '39.3%'],
            ['Star Battle', '45.6%', '44.8%'],
            ['Color Link', '35.3%', '38.8%'],
            ['Masyu', '12.4%', '16.7%'],
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/slitherlink.ts` — generatePuzzle, countSolutions, KEEP', '`src/lib/masyu.ts`, `src/lib/nonogram.ts`, `src/lib/logicChallenge.ts`, `src/lib/logicReplay.ts`',
      'Commits 170b871, 674c6e2 and 51e6790 (11/19 challenges, owner names, collection ranking), 284c163, 14dff26 and a8bcba9 (11/20 take tallies, history, one try), 1be9d5d, 79ca0b2, e165dad and 22a72eb (input), f541038 (11/21 guide), 3f3cba9, f08fe88 and 4eb29d7 (11/22 six logic puzzles), ddd292c and 8f22bf5 (11/22 replays), b16819f and 83c3c38 (11/22 history, success rates)',
      'DB aggregates (2026-11-26 14:22 KST): slither_challenges (boards, published, median first and holder times, attempts), slither_takeovers count, slither_runs and logic_runs by kind and result, game_plays_daily totals',
      'How challenge records are checked for cheating is deliberately left out.',
    ],
  },
};

export default article;
