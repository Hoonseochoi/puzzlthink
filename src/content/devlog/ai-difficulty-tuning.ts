import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-difficulty-tuning',
  category: 'ai',
  games: ['heavy13', 'flipOmok', 'nineMensMorris', 'monorail', 'laserJanggi'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: 'AI 난이도를 기록으로 맞추는 법 — 80·50·25%를 향한 두 번의 재조정 | 개발 노트',
      description: '쉬움 80%, 보통 50%, 어려움 25%. PUZZLTHINK가 플레이 기록으로 AI 난이도를 맞춘 방법과, 그 과정에서 반복해서 나온 세 가지 실패(너무 강함, 두 난이도가 같아짐, 늘 같은 수를 둬서 외워짐)를 무거운 13·뒤집기 오목·나인 멘스 모리스·모노레일·레이저 장기의 실제 사례로 정리했어요.',
      keywords: ['게임 AI 난이도', 'AI 난이도 조정', '무거운 13 AI', '뒤집기 오목 AI', '나인 멘스 모리스 AI', '모노레일 AI', '레이저 장기 AI', '게임 AI 개발기'],
    },
    title: 'AI 난이도를 기록으로 맞추는 법',
    lead: '목표는 사람 승률 80·50·25%. 기록은 매번 다른 이야기를 했어요.',
    intro: [
      'AI를 만들 때 "강하게"는 비교적 쉬워요. 어려운 건 "적당히"예요. PUZZLTHINK는 11월 20일과 11월 26일, 두 번에 걸쳐 거의 모든 게임의 AI 난이도를 실제 플레이 기록으로 다시 맞췄어요. 이 글은 그 방법과, 여러 게임에서 되풀이된 실패의 모양을 정리한 기록이에요.',
      '게임 하나하나의 자세한 AI 이야기는 따로 썼어요(벽바둑, 십이장기, 러시아장기, 블라인드 오목, 흑과 백 등). 여기서는 그 글들에 없는 게임의 사례와 공통된 교훈을 모았어요.',
    ],
    summary: '사람 승률 80·50·25%를 목표로 기록을 보며 AI를 다시 맞춘 방법, 그리고 반복된 세 가지 실패: 너무 강함, 두 난이도가 같아짐, 외워지는 AI.',
    sections: [
      {
        id: 'method',
        title: '방법: 같은 사람끼리 비교하기',
        blocks: [
          { type: 'p', text: '11월 20일 커밋에 목표가 처음 적혔어요. **사람 승률 쉬움 80%, 보통 50%, 어려움 25%.** 근거는 로그인한 플레이어의 AI전 결과예요. 게임마다 난이도별로 사람이 이긴 비율을 셌어요.' },
          { type: 'p', text: '다만 단순 비교에는 함정이 있어요. 어려움은 잘하는 사람이 주로 고르니까, 어려움 승률이 높게 나와도 "어려움이 쉬워서"인지 "잘하는 사람이 골라서"인지 알 수 없어요. 그래서 커밋 메시지에 적힌 대로 **두 난이도를 모두 둔 같은 사람들끼리** 비교했어요(same-player comparison). 같은 사람이 보통보다 어려움을 더 자주 이긴다면, 그건 정말 어려움이 쉬운 거예요.' },
          { type: 'p', text: 'AI끼리도 붙였어요. 난이도를 바꾼 뒤에는 쉬움 < 보통 < 어려움 순서가 지켜지는지 AI 대 AI 시뮬레이션으로 확인했어요(11월 20일 커밋에는 십이장기와 러시아장기의 확인 결과가 적혀 있어요).' },
        ],
      },
      {
        id: 'too-strong',
        title: '실패 1: 너무 강했어요',
        blocks: [
          { type: 'p', text: '가장 흔한 실패예요. 처음 만든 AI는 대개 "최선을 다하는" AI라서, 사람에게는 너무 강했어요.' },
          { type: 'table', head: ['게임', '기록', '바꾼 것'], rows: [
            ['십이장기 어려움', '사람 승률 5% (11/20)', '7수 → 5수 탐색'],
            ['블라인드 오목', '보통 22%, 어려움 8% (11/20)', '기억 5·15·전부 → 3·8·24수'],
            ['뒤집기 오목 보통', '15%, 첫 도전 4% (11/26)', '두 수 읽던 AI를 어려움으로 올리고, 자기 수만 보는 새 보통을 만듦'],
            ['뒤집기 오목 어려움', '120판 중 1.7% (11/26)', '알파베타 탐색 AI를 난이도에서 내리고, 나중의 매우 어려움용 엔진으로 보관'],
            ['컬러 링크', '590판 중 2.7% (11/26)', '그대로 매우 어려움으로 올리고 새 보통·어려움을 만듦'],
          ] },
          { type: 'p', text: '뒤집기 오목의 새 보통은 이렇게 생겼어요. 자기 수만 보고, 다섯을 만드는 수와 상대의 다섯을 막는 수는 꼭 둬요. 상대에게 즉승을 넘겨주는 수는 90% 확률로 피하지만, 판단에 큰 무작위(±350점 범위)가 섞여 있어서 열린 셋이나 줄을 뒤집는 수를 놓칠 수 있어요.' },
        ],
      },
      {
        id: 'same',
        title: '실패 2: 두 난이도가 같아졌어요',
        blocks: [
          { type: 'p', text: '"보통은 어려움보다 조금 덜"을 여러 숫자로 조절하다 보면, 어느새 두 난이도가 똑같이 강해지기도 해요.' },
          { type: 'h3', text: '무거운 13' },
          { type: 'p', text: '무거운 13은 일곱 명이 숫자 카드와 색 칩을 몰래 내서 세 개의 짐받이에 큐브를 쌓는 게임이에요. 한 짐받이의 합이 13 이상이 되면 무너져요. 이 게임의 AI는 출시 다음 날 아침에 한 번 크게 바뀌었어요. 처음 AI는 "다른 사람들은 무작위로 낸다"고 가정하고 최선을 골랐는데, 그러면 모든 AI가 같은 "안전한" 짐받이를 찾아내서 **다 같이 한 곳에 몰렸어요.** 그래서 지금은 한 단계 더 생각해요. 먼저 다른 사람들이 낼 법한 수를 확률 분포로 예측하고(무작위 상대에 대한 좋은 수들을 소프트맥스로 펼쳐서), 그 예측에 대한 최선을 골라요. 패스는 벌점을 줄일 때만 해요.' },
          { type: 'p', text: '보통은 이 계산을 가끔 건너뛰고 아무 카드나 내게 했어요. 11월 20일에 건너뛰는 비율을 30%로 정했는데, 11월 26일에 보니 사람이 1등한 비율이 보통 상대로 19%, 어려움 상대로 25%였어요. 평균 순위도 3.48과 3.41로 거의 같았어요. 보통이 전혀 쉽지 않았던 거예요. 그래서 지금 보통은 **절반의 차례에** 계산을 건너뛰어요.' },
          { type: 'h3', text: '러시아장기, 흑과 백' },
          { type: 'p', text: '러시아장기는 첫 재조정 뒤 보통과 어려움이 둘 다 두 수를 읽게 되어, 같은 사람 기준 34%와 33%로 차이가 사라졌어요. 흑과 백은 반대로 어려움이 보통보다 쉬웠고요. 두 이야기는 각 게임의 개발 노트에 자세히 적었어요.' },
        ],
      },
      {
        id: 'memorized',
        title: '실패 3: 늘 같은 수를 둬서 외워졌어요',
        blocks: [
          { type: 'p', text: '가장 흥미로운 실패예요. 결정론적인 AI는, 아무리 강해도, **한 번 이긴 수순을 그대로 반복하면 또 이길 수 있어요.**' },
          { type: 'cards', items: [
            { title: '나인 멘스 모리스', body: '어려움이 같은 국면에 늘 같은 수로 답했어요. 기록에는 어려움을 상대로 13~16판을 두어 모두 이긴 사람이 여럿 있었어요. 이긴 수순을 그대로 다시 둔 거예요. 지금은 난이도마다 "최선 수에서 이만큼 아래까지는 고를 수 있다"는 폭(말 하나 = 1000점 기준 쉬움 700, 보통 60, 어려움 18)을 둬서, 비슷한 수 중에서 섞어 둬요. 그 김에 어려움의 탐색을 5수에서 6수로 늘리고, 모든 수에 탐색 예산을 똑같이 나눠 마지막 후보가 얕게 평가되지 않게 했어요. 질 때는 "더 늦게 지는 수"를 고르도록 부호가 뒤집혀 있던 버그도 고쳤어요.' },
            { title: '모노레일', body: 'AI가 경로를 판단할 때 쓰는 무작위 표본이 고정돼 있어서, 같은 국면에 늘 같은 답을 했어요. 이긴 수순을 그대로 다시 둘 수 있었죠. 이제 판단할 때마다 표본이 바뀌어요. 어려움은 구분할 수 없을 만큼 비슷한 계획 중에서 무작위로 고르고, 보통(사람 승률 29%였어요)은 세 번에 한 번 정도 "경로를 깨지 않는 아무 수"를 둬요.' },
            { title: '흑과 백', body: '어려움의 거의 고정된 선택이 읽혀서 보통보다 쉬웠어요. 결국 모든 난이도가 일부러 거친 추정을 쓰게 됐어요.' },
          ] },
          { type: 'p', text: '이 실패들 때문에, 이후에 만든 매우 어려움 AI들은 모두 **최선 수와 거의 같은 점수의 수 중에서 무작위로 고르는** 장치를 갖고 있어요. 십이장기는 자 0.12개 값 이내, 러시아장기는 8점 이내, 블라인드 오목은 상위 3개 안에서요.' },
        ],
      },
      {
        id: 'bugs',
        title: '난이도가 아니라 버그였던 경우',
        blocks: [
          { type: 'p', text: '레이저 장기의 어려움은 가끔 **자기 레이저로 자기 왕을 맞히는 수**를 골랐어요. 승패가 정해지는 수를 찾으면 바로 두는 코드가, 내가 지는 수와 이기는 수를 구분하지 않았던 거예요. 바로 이기는 수는 그 앞에서 이미 처리하니까, 이 지점에서 승패가 정해지는 수는 곧 지는 수예요. 이제 다른 수가 있으면 절대 두지 않아요.' },
          { type: 'p', text: '러시안 룰렛의 AI는 같은 날 "아는 것을 믿는" 판단을 얻었어요. 장전된 약실은 정확히 두 개이고, 약실 c는 총구 + c 자리에서 발사돼요. AI는 자기 자리를 겨누는 약실을 직접 봤으면 그 결과를 믿고(장전돼 있으면 가장 안전한 약실로 총구를 돌리고), 못 봤으면 남은 총알 비율로 위험을 계산해 먼저 확인하러 가요.' },
        ],
      },
      {
        id: 'buttons',
        title: '숫자를 고치는 대신 보여 주기',
        blocks: [
          { type: 'p', text: '운이 큰 게임은 AI를 아무리 고쳐도 목표 승률에 닿지 않았어요. 인디언 포커는 AI가 이길 확률을 50%·75%로 설계했지만 실제로는 41%·55%였어요. 이런 게임은 AI를 무리하게 바꾸는 대신, 11월 26일부터 **난이도 버튼에 실제 기록의 승률**을 적었어요(인디언 포커, 양면 포커). 같은 이유로 러시안 룰렛과 인디언 포커의 승리는 11월 20일부터 피스 경쟁전 점수에서 빠졌어요.' },
          { type: 'p', text: '11월 26일 재조정과 함께 모든 게임의 시작 화면에 "업데이트" 칸과 전체 기록 팝업이 생겼어요. AI가 바뀌면 플레이어도 알 수 있게요.' },
        ],
      },
      {
        id: 'numbers',
        title: '지금의 숫자',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요. 11월 26일 재조정 뒤의 판은 아직 적어서, 대부분 재조정 전의 숫자예요.',
        blocks: [
          { type: 'table', head: ['게임 · 난이도', '사람 결과', '판수'], rows: [
            ['무거운 13 · 보통', '1등 20.6%, 평균 3.40등', '749판'],
            ['무거운 13 · 어려움', '1등 24.7%, 평균 3.40등', '486판'],
            ['뒤집기 오목 · 보통', '승률 14.8%', '283판'],
            ['뒤집기 오목 · 어려움', '승률 1.7%', '121판'],
            ['나인 멘스 모리스 · 보통', '승률 47.9%', '71판'],
            ['나인 멘스 모리스 · 어려움', '승률 63.8%', '94판'],
            ['모노레일 · 보통', '승률 26.8%', '231판'],
            ['모노레일 · 어려움', '승률 54.3%', '385판'],
          ] },
          { type: 'p', text: '나인 멘스 모리스와 모노레일의 어려움 승률이 보통보다 높은 건, 위에서 말한 "이긴 수순 반복"이 통하던 시기의 기록이 섞여 있기 때문이에요. 다음 재조정은 11월 26일 이후의 기록이 충분히 쌓인 뒤가 될 거예요.' },
        ],
      },
    ],
    sources: [
      '`src/lib/heavy13.ts` — planSubmissions(예측 후 응수), NORMAL_SLIP, LEVELS',
      '`src/lib/flipOmok.ts` — casualMove, readerMove, searchMove 주석',
      '`src/lib/morris.ts` — DEPTH, MARGIN 주석', '`src/lib/monorail.ts` — routeSalt, 보통·어려움 선택 주석',
      '`src/lib/laserJanggi.ts`, `src/lib/russianRoulette.ts`(informedRRAction), `src/lib/indianPoker.ts`(POKER_AI_TARGET)',
      '커밋 58b4daf (11/17 무거운 13 예측 AI), 1fe2d84 (11/20 첫 재조정, 목표 80/50/25%), e227318 (11/26 두 번째 재조정, 업데이트 칸)',
      'DB 집계(2026-11-26 14:22 KST): game_results(mode=ai) 무거운 13의 난이도별 1등 비율·평균 순위, 뒤집기 오목·나인 멘스 모리스·모노레일 난이도별 승률',
    ],
  },
  en: {
    meta: {
      title: 'Tuning AI difficulty from play data — two retunes toward 80, 50 and 25% | Dev notes',
      description: 'Easy 80%, Normal 50%, Hard 25%: how PUZZLTHINK tuned its AI levels from play records, and the three failures that kept coming back — too strong, two levels that became the same, and an AI that got memorised — with Heavy 13, Flip Omok, Nine Men’s Morris, Monorail and Laser Janggi as examples.',
      keywords: ['game AI difficulty', 'difficulty tuning', 'Heavy 13 AI', 'Flip Omok AI', "Nine Men's Morris AI", 'Monorail AI', 'game AI dev diary'],
    },
    title: 'Tuning AI difficulty from play data',
    lead: 'The target: human win rates of 80, 50 and 25%. The records told a different story each time.',
    intro: [
      'Making an AI strong is the comparatively easy part; making it *just right* is hard. On 20 and 26 November PUZZLTHINK retuned the AI levels of almost every game from real play records. This note describes the method and the failures that repeated across games.',
      'Each game with a detailed AI story has its own note (Wallgo, 12 Janggi, Russian Janggi, Blind Gomoku, Black & White…). This one gathers the cases from other games and the lessons they share.',
    ],
    summary: 'Retuning AIs toward human win rates of 80/50/25% from the records, and three recurring failures: too strong, two levels turning into one, and AIs that get memorised.',
    sections: [
      {
        id: 'method',
        title: 'Method: compare the same people',
        blocks: [
          { type: 'p', text: 'The target first appears in the 20 November commit: **human win rates of 80% on Easy, 50% on Normal and 25% on Hard**, measured from signed-in players’ games against the AI, game by game and level by level.' },
          { type: 'p', text: 'A plain comparison has a trap: strong players pick Hard, so a high win rate on Hard may mean Hard is easy — or that good players chose it. So, as the commit says, the comparison was made **among the same players who had played both levels**. If the same people beat Hard more often than Normal, Hard really is easier.' },
          { type: 'p', text: 'AIs were also pitted against each other: after each change, AI-vs-AI simulations checked that Easy < Normal < Hard still held (the 20 November commit records this for 12 Janggi and Russian Janggi).' },
        ],
      },
      {
        id: 'too-strong',
        title: 'Failure 1: too strong',
        blocks: [
          { type: 'p', text: 'The most common one. A first AI usually does its best, which is far too much for people.' },
          { type: 'table', head: ['Game', 'Record', 'Change'], rows: [
            ['12 Janggi, Hard', '5% human wins (11/20)', '7-ply → 5-ply search'],
            ['Blind Gomoku', 'Normal 22%, Hard 8% (11/20)', 'Memory 5 / 15 / all → 3 / 8 / 24 moves'],
            ['Flip Omok, Normal', '15%, 4% on a first try (11/26)', 'The two-move reader became Hard; a new Normal looks at its own move only'],
            ['Flip Omok, Hard', '1.7% of 120 games (11/26)', 'The alpha-beta AI was withdrawn and kept as a future Very Hard engine'],
            ['Color Link', '2.7% of 590 games (11/26)', 'Promoted to Very Hard as it was; new Normal and Hard added'],
          ] },
          { type: 'p', text: 'Flip Omok’s new Normal looks only at its own move. It always makes five and always blocks a five, avoids handing over an immediate win 90% of the time, but its judgement carries wide noise (a ±350-point range), so an open three or a line-flipping move can get past it.' },
        ],
      },
      {
        id: 'same',
        title: 'Failure 2: two levels became the same',
        blocks: [
          { type: 'p', text: 'Tuning "Normal is a bit less than Hard" with several numbers can quietly make both equally strong.' },
          { type: 'h3', text: 'Heavy 13' },
          { type: 'p', text: 'In Heavy 13 seven players secretly submit a number card and a colour chip to stack cubes on three porter stands; a stand that reaches 13 collapses. Its AI changed a lot the morning after launch. The first one assumed everyone else played at random and picked its best answer — so every AI found the same "safe" stand and **they all piled onto it**. Now it thinks one step further: it forecasts what each player is likely to play (spreading their good answers against random play with a softmax), then picks the best answer to that forecast. It passes only when that saves penalty.' },
          { type: 'p', text: 'Normal skips this calculation some of the time and plays any card. On 20 November that was set to 30%; on 26 November people took first place 19% of the time against Normal and 25% against Hard, with average ranks of 3.48 and 3.41 — Normal was no easier at all. It now skips on **half** its turns.' },
          { type: 'h3', text: 'Russian Janggi, Black & White' },
          { type: 'p', text: 'After the first retune Russian Janggi’s Normal and Hard both read two moves, and for the same players the difference vanished (34% vs 33%). In Black & White, Hard was even easier than Normal. Both stories are told in those games’ own notes.' },
        ],
      },
      {
        id: 'memorized',
        title: 'Failure 3: always the same move, so it got memorised',
        blocks: [
          { type: 'p', text: 'The most interesting one. A deterministic AI, however strong, **loses again to a winning line that is simply replayed.**' },
          { type: 'cards', items: [
            { title: 'Nine Men’s Morris', body: 'Hard answered a position the same way every time. The records showed several people with 13–16 wins out of 13–16 games against it — they were replaying a winning line. Each level now has a margin below its best move that it may still pick (with a piece worth 1000: Easy 700, Normal 60, Hard 18), mixing near-equal moves. Hard also went from 5 to 6 half-moves, with the node budget split evenly so the last candidates are not judged on a shallower search, and a sign bug that made it prefer losing *sooner* was fixed.' },
            { title: 'Monorail', body: 'The random sample of routes the AI judged by was fixed, so the same position always got the same answer and a winning line could be replayed. The sample now changes with every decision. Hard picks at random among plans it cannot tell apart; Normal (people won 29%) plays any route-safe move about one turn in three.' },
            { title: 'Black & White', body: 'Hard’s near-fixed choices were read, making it easier than Normal. In the end every level was made to use a deliberately rough estimate.' },
          ] },
          { type: 'p', text: 'Because of these, every Very Hard AI built afterwards **picks at random among moves almost as good as the best**: within 0.12 of a man in 12 Janggi, within 8 points in Russian Janggi, among the top three in Blind Gomoku.' },
        ],
      },
      {
        id: 'bugs',
        title: 'When it was a bug, not a level',
        blocks: [
          { type: 'p', text: 'Laser Janggi’s Hard sometimes picked **a move whose laser hit its own king**. The code that played any move with a decided result did not tell a win from a loss. Immediate wins are already taken earlier, so a decided result at that point can only be a loss; such a move is now never played while another exists.' },
          { type: 'p', text: 'Russian Roulette’s AI got "trust what you know" the same day. Exactly two chambers are loaded and chamber c fires at seat muzzle + c. If the AI has seen the chamber aimed at its seat it trusts that (and if loaded, turns the muzzle to the safest chamber it can afford); if not, it estimates the risk from the share of unseen bullets and goes to look first.' },
        ],
      },
      {
        id: 'buttons',
        title: 'Showing the numbers instead of forcing them',
        blocks: [
          { type: 'p', text: 'In luck-heavy games no amount of tuning reached the target. Indian Poker’s AI was designed to win 50% and 75%, and actually won 41% and 55%. For such games, from 26 November **the level buttons show the recorded win rates** instead (Indian Poker, Two-Sided Poker). For the same reason, Russian Roulette and Indian Poker wins stopped counting toward the piece race from 20 November.' },
          { type: 'p', text: 'With the 26 November retune every game’s entry screen also got an "Updates" section and a full history popup, so players can see when an AI changes.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Where the numbers stand',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST. Few games have been played since the 26 November retune, so most of these predate it.',
        blocks: [
          { type: 'table', head: ['Game · level', 'Human result', 'Games'], rows: [
            ['Heavy 13 · Normal', '1st 20.6%, average place 3.40', '749'],
            ['Heavy 13 · Hard', '1st 24.7%, average place 3.40', '486'],
            ['Flip Omok · Normal', '14.8% wins', '283'],
            ['Flip Omok · Hard', '1.7% wins', '121'],
            ['Nine Men’s Morris · Normal', '47.9% wins', '71'],
            ['Nine Men’s Morris · Hard', '63.8% wins', '94'],
            ['Monorail · Normal', '26.8% wins', '231'],
            ['Monorail · Hard', '54.3% wins', '385'],
          ] },
          { type: 'p', text: 'Hard beating Normal in Morris and Monorail reflects the period when replaying a winning line worked. The next retune will wait until enough games have been played since 26 November.' },
        ],
      },
    ],
    sources: [
      '`src/lib/heavy13.ts` — planSubmissions (forecast, then answer), NORMAL_SLIP, LEVELS',
      '`src/lib/flipOmok.ts` — casualMove, readerMove, searchMove comments',
      '`src/lib/morris.ts` — DEPTH and MARGIN comments', '`src/lib/monorail.ts` — routeSalt, Normal/Hard choice comments',
      '`src/lib/laserJanggi.ts`, `src/lib/russianRoulette.ts` (informedRRAction), `src/lib/indianPoker.ts` (POKER_AI_TARGET)',
      'Commits 58b4daf (11/17 Heavy 13 forecast AI), 1fe2d84 (11/20 first retune, 80/50/25% targets), e227318 (11/26 second retune, Updates section)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (mode = ai) — Heavy 13 first-place share and average place by level; Flip Omok, Nine Men’s Morris and Monorail win rates by level',
    ],
  },
};

export default article;
