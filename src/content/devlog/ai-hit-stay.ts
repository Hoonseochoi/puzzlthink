import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-hit-stay',
  category: 'ai',
  games: ['hitStay'],
  published: '2026-11-26',
  updated: '2026-11-27',
  ko: {
    meta: {
      title: 'Hit,Stay AI 개발기 — 몬테카를로로 판단하고 성격으로 베팅하는 다섯 AI | 개발 노트',
      description: 'Hit,Stay(힛, 스테이)의 AI 다섯 명은 모두 같은 몬테카를로 계산을 하고, 베팅 성격만 달라요. 승률 추정, 생존을 고려한 베팅, 루나가 덱이 바닥날 때까지 카드를 뽑던 버그, 실력이 운을 이기도록 기본 베팅 곡선을 바꾼 과정까지.',
      keywords: ['Hit Stay AI', '힛 스테이', 'HIT STAY 게임', '베팅 게임 AI', '몬테카를로', '포커 AI', '게임 AI 개발기'],
    },
    title: 'Hit,Stay AI 개발기',
    lead: '다섯 AI 모두 전력으로 계산해요. 다른 건 성격뿐이에요.',
    intro: [
      'Hit,Stay는 다섯 명이 숫자 카드 합을 그 판의 제한 숫자(8면 주사위로 정하는 5~12)에 최대한 가깝게, 넘지 않게 맞추는 베팅 게임이에요. 카드는 7 한 장, 6 두 장 … 1 일곱 장, 그리고 −1 일곱 장까지 35장이에요. 세 장을 받아 한 장을 공개하고, 베팅 → HIT/STAY → 다시 베팅 → 쇼다운 순서로 진행해요.',
      '이 게임은 11월 24일 밤에 올라갔어요. AI전에서는 사람 한 명이 AI 넷과 앉는데, 그 넷은 난이도가 없어요. 모두 같은 계산을 하고, 이름마다 베팅 성격만 달라요. 이 글은 그 계산과 성격, 그리고 "실력이 운을 이기게" 만든 조정의 기록이에요.',
    ],
    summary: '다섯 AI가 모두 같은 몬테카를로 계산을 하고 베팅 성격만 다른 이유, 덱을 다 뽑던 루나 버그, 실력이 운을 이기게 만든 기본 베팅 곡선.',
    sections: [
      {
        id: 'sees',
        title: 'AI가 아는 것',
        blocks: [
          { type: 'p', text: 'AI 코드 첫머리 주석은 "그 자리에서 보이는 것만 쓴다"예요. 내 카드, 모두의 공개 카드, 그리고 카드 구성이요. 남이 숨긴 카드와 덱에 남은 카드는 "보이지 않는 카드 묶음"으로 합쳐서 계산해요.' },
        ],
      },
      {
        id: 'monte-carlo',
        title: '판단: 360번 미리 해 보기',
        blocks: [
          { type: 'p', text: 'AI의 모든 판단은 **몬테카를로 시뮬레이션**에서 나와요. 보이지 않는 카드를 무작위로 섞어서 각자의 숨은 카드를 채우고, 남은 HIT/STAY 단계를 단순한 규칙으로 끝까지 진행시킨 뒤, 쇼다운에서 내가 이겼는지를 봐요. 이걸 한 번의 판단마다 **360번** 반복해서 승률을 구해요. 공동 1등이면 1/공동 인원만큼만 이긴 걸로 쳐요.' },
          { type: 'p', text: '시뮬레이션 속 사람들은 "한 장 더 뽑았을 때 기대값이 지금보다 좋으면 뽑는다"는 단순한 규칙으로 움직여요. 기대값은 합이 제한 이하면 그 합, 넘으면 크게 깎인 값으로 계산해요(−1 카드가 남아 있으면 넘은 합도 되살아날 수 있으니까요). 나 자신은 0.15, 남들은 0.35만큼 더 좋아야 뽑는다고 가정해요.' },
          { type: 'p', text: 'HIT/STAY 차례에서는 "이번에 HIT"와 "이번에 STAY"를 각각 360번씩 시뮬레이션해서, 승률이 높은 쪽을 골라요.' },
        ],
      },
      {
        id: 'betting',
        title: '베팅: 칩의 효용',
        blocks: [
          { type: 'p', text: '베팅은 기대 효용으로 골라요. 칩 c개의 가치를 **c의 risk 제곱**(risk < 1)으로 계산해요. 1보다 작은 지수는 "칩을 잃는 아픔이 따는 기쁨보다 크다"는 뜻이에요. 칩이 0이 되면 탈락이니까, 살아남는 걸 중요하게 여기게 만든 거예요. 폴드, 콜, 그리고 가능한 모든 레이즈 금액마다 "이기면 팟을 얻고, 지면 넣은 만큼 잃는다"로 효용을 계산해 가장 큰 걸 골라요.' },
          { type: 'p', text: '한 가지 보정이 더 있어요. 시뮬레이션은 남의 숨은 카드를 무작위로 보지만, 베팅이 상한 가까이 올라갔다면 누군가 좋은 패를 쥐었다는 뜻이에요. 그래서 **베팅이 올라간 만큼 승률을 최대 40%까지 깎아요.** 큰 레이즈를 고려할 때도 "이 금액을 받는 상대는 강할 것"이라고 보고 같은 식으로 깎아요.' },
        ],
      },
      {
        id: 'personas',
        title: '다섯 개의 성격',
        lead: '게임 안에서는 보여 주지 않는 설정이에요. 계산은 같고, 같은 승률을 행동으로 바꾸는 방식만 달라요.',
        blocks: [
          { type: 'table', head: ['AI', '공개 카드', '성격'], rows: [
            ['제로', '중간 카드', '기준형. 조심성 보통, 블러프 3%, 좋은 패의 10%는 콜만.'],
            ['레오', '가장 큰 카드', '공격형. 덜 조심하고, 레이즈 쪽 승률을 6% 높게 보고, 블러프 10%.'],
            ['모아', '중간 카드', '신중형. 가장 조심스럽고, 블러프 0%, HIT를 살짝 덜 해요.'],
            ['루나', '중간 카드', '도박형. 가장 덜 조심하고, 블러프 7%, HIT를 살짝 더 해요.'],
            ['카이', '가장 크거나 가장 작은 카드(반반)', '속임수형. 블러프 9%, 좋은 패의 40%는 콜만 하며 숨겨요.'],
          ] },
          { type: 'p', text: '"블러프"는 패가 없어도 작은 레이즈를 하는 확률이에요. 모든 레이즈가 강한 패로 읽히지 않게 하려는 장치예요. 다만 콜하는 것이 폴드보다 거의 같거나 나을 때만 해요.' },
          { type: 'h3', text: '루나가 덱을 다 뽑던 버그' },
          { type: 'p', text: '출시 다음 날 새벽에 고친 버그예요. 루나는 HIT 쪽에 고정으로 +0.02를 얹어 판단했는데, 이미 진 패(HIT도 STAY도 승률이 거의 0)에서는 이 0.02가 늘 이겨서 **덱이 바닥날 때까지 카드를 뽑았어요.** 그래서 이 기울기를 min(HIT 승률, STAY 승률, 1 − STAY 승률)에 비례하게 바꿨어요. 이미 졌거나 이미 이긴 판에서는 0이 되고, 팽팽할 때만 판단을 기울여요. 시뮬레이션으로 루나의 한 판 평균 HIT가 4.7장에서 1.3장(최대 29장에서 9장)으로 줄어 다른 AI와 비슷해졌어요.' },
        ],
      },
      {
        id: 'personas',
        title: '11/27: 다섯에서 열로 — 같은 계산, 다른 성향',
        blocks: [
          { type: 'p', text: '11월 27일에 AI가 열 명이 됐어요. 사이트의 베팅 게임 다섯 개(흑과 백, 흑과 백 II, 인디언 포커, 양면 포커, Hit,Stay)가 같은 열 명을 써요. 원래의 다섯 명은 이름과 색, 성격이 그대로이고(레오=공격형, 모아=신중형, 루나=블러퍼, 카이=함정 설치형, 제로=계산기), 추격자 베가, 변덕쟁이 미로, 버티기형 도담, 초반 승부사 하루, 막판 승부사 녹스가 새로 앉아요.' },
          { type: 'list', items: [
            '**같은 계산**: 모두 360번의 시뮬레이션으로 같은 승률을 구해요. 성향은 위의 표처럼 조심성(risk), 레이즈 쪽 가중치, 블러프·슬로플레이 빈도, HIT 쪽 기울기만 바꿔요.',
            '**상황에 따라 바뀌는 성향**: 추격자는 칩 순위가 아래 절반이면 과감해지고 1등이면 조여요. 초반 승부사는 10라운드까지, 막판 승부사는 13라운드부터 과감해져요(기본 베팅은 17라운드부터 빠르게 커져요). 변덕쟁이는 결정마다 성향을 새로 뽑아요.',
            '**판마다 조금씩 다르게**: 매치마다 시드로 조심성 ±4%, 블러프 ±20%가 달라지고, 결정의 8%는 기준형으로 둬요.',
            '**레이즈 읽기**: 예전에는 베팅이 상한에 가까울수록 누가 올렸든 같은 비율(40%)로 "강하다"고 읽었어요. 이제는 이번 판에서 마지막으로 올린 사람이 지난 라운드들에서 레이즈한 뒤 쇼다운에서 이겼는지를 세서, 0.4~1.6배로 읽어요. 공개된 정보(레이즈와 쇼다운 패)만 써요.',
          ] },
          { type: 'p', text: '시뮬레이션(한 결정당 200번으로 줄여 모두 같은 조건)에서 성향 하나를 예전 AI 넷과 붙이면 1등 비율이 16.7~24.3%(공평하면 20%, 오차 ±5%p), 열 명 중 다섯을 무작위로 앉힌 700판에서는 14.9~23.7%였어요. 버티기형 도담이 리그에서 가장 낮게 나왔는데, 설정이 계산기와 거의 같아 운의 몫이 큰 것으로 보고 있어요. 이 과정에서 하나 배운 점: HIT 쪽 기울기가 음수인 성향(STAY를 선호)이 꾸준히 졌어요. 공통 계산이 원래 살짝 STAY 쪽이라는 뜻이라, 성향의 기울기를 0~+0.015 안으로 좁혔어요.' },
        ],
      },
      {
        id: 'ante',
        title: '실력이 운을 이기게: 기본 베팅 곡선',
        blocks: [
          { type: 'p', text: '11월 25일에는 경기 길이와 운의 비중을 세 번 연달아 고쳤어요.' },
          { type: 'steps', items: [
            { title: '처음: 10판마다 +1', body: '자기대국에서 한 경기가 중앙값 51판이나 걸렸어요. 너무 길었어요.' },
            { title: '시작 칩 줄이기 (되돌림)', body: 'AI전 시작 칩을 15개로 줄여 봤지만 경기가 거의 짧아지지 않았어요. 베팅 상한이 가장 적은 칩에 묶여서 같이 줄어들기 때문이에요. 6분 만에 되돌렸어요.' },
            { title: '3판마다 +5', body: '기본 베팅을 1 → 6 → 11로 빠르게 올리자 중앙값이 14판으로 줄었어요. 그런데 이번엔 카드가 승부를 거의 다 정했어요. 자기대국에서 강한 플레이어의 1등 비율이 31%로, 순수한 운(5명 중 1명, 20%)보다 조금 나은 정도였어요.' },
            { title: '지금: 느리게, 그다음 빠르게', body: '16판까지는 2판마다 +1(1, 1, 2, 2 … 8), 그 뒤로는 2판마다 +5(13, 13, 18 …). 16가지 곡선을 자기대국으로 비교해서 골랐어요. 강한 플레이어가 5인 테이블에서 약 42%를 이기고, 경기는 약 24판, 38판을 넘는 일은 드물어요.' },
          ] },
        ],
      },
      {
        id: 'numbers',
        title: '실제 기록',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요.',
        blocks: [
          { type: 'table', head: ['최종 순위', '판수', '비율'], rows: [
            ['1등', '130판', '48.0%'],
            ['2등', '52판', '19.2%'],
            ['3등', '34판', '12.5%'],
            ['4등', '27판', '10.0%'],
            ['5등', '28판', '10.3%'],
          ] },
          { type: 'p', text: 'AI 넷과 앉은 사람이 운만으로 1등할 확률은 20%인데, 기록된 271판에서는 48.0%가 1등이었어요. AI전 한 경기는 평균 25.3판이었어요. 이 기록은 베팅 곡선이 세 번 바뀌는 동안 쌓인 것이라 곡선별로 나뉘어 있지 않아요. 로그인 여부와 상관없이 센 전체 판수는 1,201판(AI전 657판)이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { title: '공개 카드는 성격을 말해요', body: '레오는 항상 가장 큰 카드를, 카이는 가장 크거나 가장 작은 카드를 공개해요. 나머지는 중간 카드예요. 레오의 공개 카드가 작으면 나머지 두 장도 작아요.' },
            { title: '큰 베팅에는 약해져요', body: 'AI는 베팅이 상한에 가까울수록 자기 승률을 깎아요(최대 40%). 확신이 있을 때 크게 걸면 AI가 접을 가능성이 커지고, 반대로 큰 베팅을 블러프로 쓰는 것도 통해요.' },
            { title: '시뮬레이션 속 상대는 단순해요', body: 'AI는 다른 사람들이 "기대값으로만 HIT하는" 사람이라고 가정해요. 일부러 낮은 합에서 STAY하거나, 높은 합에서 HIT하는 사람의 패는 잘못 읽어요.' },
            { title: '탈락이 두려운 AI', body: '칩이 적을수록 효용 곡선 때문에 더 조심해요. 칩이 적은 AI에게 압박을 주면 좋은 패도 접는 경우가 생겨요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/hitStay.ts` — 규칙, hsAnte, HS_PERSONA, STYLE, unseen, wantsHit, winChance, chooseHsAction',
      '커밋 e7313d8 (11/24 Hit,Stay), 250af41 (11/25 기록·랭킹), f5ae749 (11/25 루나 HIT 버그), 1a68974·00b1494 (11/25 시작 칩 15개 시도와 되돌림, 3판마다 +5), cd19fec (11/25 지금의 베팅 곡선)',
      'DB 집계(2026-11-26 14:22 KST): game_results(game=hit_stay, mode=ai) 최종 순위 분포와 평균 판수, game_plays_daily 합계',
    ],
  },
  en: {
    meta: {
      title: 'Hit,Stay AI dev notes — five AIs that judge by Monte Carlo and bet by temperament | Dev notes',
      description: 'All five Hit,Stay AIs run the same Monte Carlo calculation; only their betting temperament differs. Win-chance estimates, survival-aware betting, the bug that made LUNA draw until the deck ran out, and the ante curve that lets skill beat luck.',
      keywords: ['Hit Stay AI', 'HIT STAY game', 'betting game AI', 'Monte Carlo', 'poker AI', 'game AI dev diary'],
    },
    title: 'Hit,Stay AI dev notes',
    lead: 'All five AIs calculate at full strength. Only their temperament differs.',
    intro: [
      'Hit,Stay is a five-player betting game: bring the sum of your number cards as close as you dare to the round’s limit (an eight-sided die, 5–12) without going over. The 35-card deck holds one 7, two 6s … seven 1s and seven −1s. You get three cards, show one, then bet → HIT or STAY → bet again → showdown.',
      'It went live on the night of 24 November. Against the AI you sit with four AIs, and they have no difficulty levels: all compute the same thing, and each name has its own betting temperament. This note covers that calculation, those temperaments, and the tuning that made skill beat luck.',
    ],
    summary: 'Why all five AIs share one Monte Carlo calculation and differ only in betting temperament, the LUNA deck-drawing bug, and an ante curve that lets skill beat luck.',
    sections: [
      {
        id: 'sees',
        title: 'What the AI knows',
        blocks: [
          { type: 'p', text: 'The comment at the top of the AI code says it uses only what that seat can see: its own cards, everyone’s face-up cards and the card counts. Other players’ hidden cards and the deck are pooled into "cards I cannot see".' },
        ],
      },
      {
        id: 'monte-carlo',
        title: 'Judging: play it out 360 times',
        blocks: [
          { type: 'p', text: 'Every AI decision comes from **Monte Carlo simulation**. It shuffles the unseen cards to fill everyone’s hidden cards, plays out the rest of the HIT/STAY step with a simple policy, and checks whether it wins the showdown — **360 times** per decision. A shared first place counts as 1/(number tied).' },
          { type: 'p', text: 'In the simulation people follow a simple rule: draw if the expected value after one more card beats the current one. Value is the total if at or under the limit, and heavily marked down if over (a −1 can still rescue it). It assumes it needs a 0.15 edge to draw itself, others 0.35.' },
          { type: 'p', text: 'On a HIT/STAY turn it simulates "HIT now" and "STAY now" 360 times each and takes the side with the higher win chance.' },
        ],
      },
      {
        id: 'betting',
        title: 'Betting: the utility of chips',
        blocks: [
          { type: 'p', text: 'Bets are chosen by expected utility, valuing a stack of c chips as **c to the power risk** (risk < 1): losing chips hurts more than winning them helps, because a player at zero is out. Fold, call and every possible raise are scored as "win the pot or lose what I put in", and the best is played.' },
          { type: 'p', text: 'One correction: the simulation treats hidden cards as random, but a bet that has climbed toward the cap means someone has a good hand. So **the win chance is marked down by up to 40% as the bet climbs**. When weighing a big raise it assumes whoever calls it is strong, and marks down the same way.' },
        ],
      },
      {
        id: 'personas',
        title: 'Five temperaments',
        lead: 'Never shown in the game. The calculation is the same; only how a win chance becomes an action differs.',
        blocks: [
          { type: 'table', head: ['AI', 'Face-up card', 'Temperament'], rows: [
            ['ZERO', 'middle card', 'The baseline. Average caution, 3% bluffs, only calls with 10% of strong hands.'],
            ['LEO', 'highest card', 'Aggressive. Less cautious, rates raises 6% better, 10% bluffs.'],
            ['MOA', 'middle card', 'Careful. The most cautious, never bluffs, hits slightly less.'],
            ['LUNA', 'middle card', 'Gambler. The least cautious, 7% bluffs, hits slightly more.'],
            ['KAI', 'highest or lowest (half and half)', 'Trickster. 9% bluffs, only calls with 40% of strong hands to hide them.'],
          ] },
          { type: 'p', text: 'A "bluff" is a small raise without the hand, so that not every raise reads as strength — made only when calling is about as good as folding or better.' },
          { type: 'h3', text: 'The bug that made LUNA draw the whole deck' },
          { type: 'p', text: 'Fixed in the early hours after launch. LUNA added a fixed +0.02 to the HIT side, and in a lost hand (both HIT and STAY near 0) that 0.02 always won — so **it drew until the deck ran out**. The lean now scales with min(HIT, STAY, 1 − STAY): zero when the round is already lost or won, tipping only close calls. In simulation LUNA’s average went from 4.7 to 1.3 hits a round (maximum 29 → 9), in line with the others.' },
        ],
      },
      {
        id: 'personas',
        title: '11/27: from five to ten — same calculation, different temperaments',
        blocks: [
          { type: 'p', text: 'On 27 November the AI grew to ten. All five betting games on the site (Black & White, Black & White II, Indian Poker, Two-Sided Poker, Hit,Stay) now share the same ten. The original five keep their names, colours and characters (LEO the Attacker, MOA the Careful One, LUNA the Bluffer, KAI the Trapper, ZERO the Calculator), joined by VEGA the Chaser, MIRO the Wildcard, DODAM the Grinder, HARU the Fast Starter and NOX the Closer.' },
          { type: 'list', items: [
            '**Same calculation**: all of them get the same win chance from 360 simulations. A temperament only changes caution (risk), the weight on raising, bluff and slow-play rates and a lean toward HIT.',
            '**Temperaments that move**: the Chaser turns bold in the bottom half of the chip ranking and tight as the leader; the Fast Starter is bold until round 10, the Closer from round 13 (antes grow fast from round 17); the Wildcard draws a new temperament every decision.',
            '**A little different every match**: a seed moves caution by ±4% and bluffing by ±20% per match, and 8% of decisions use the plain base.',
            '**Reading raises**: the old AI read a bet near the cap as strength by the same 40% whoever raised. Now it counts whether the last raiser’s earlier raises won at the showdown and reads them 0.4–1.6× as strongly. Only public information is used (raises and shown hands).',
          ] },
          { type: 'p', text: 'In simulation (200 deals per decision for every seat alike), one personality against four of the old AIs took first place 16.7–24.3% of the time (20% = even, ±5 points noise), and in 700 tables of five random personalities 14.9–23.7%. DODAM the Grinder came out lowest in the league; its settings are close to the Calculator’s, so luck is a big part of that. One lesson on the way: personalities with a negative HIT lean (preferring STAY) kept losing, which means the shared estimate already leans slightly toward STAY, so the leans now stay within 0 to +0.015.' },
        ],
      },
      {
        id: 'ante',
        title: 'Letting skill beat luck: the ante curve',
        blocks: [
          { type: 'p', text: 'On 25 November match length and the share of luck were changed three times in a row.' },
          { type: 'steps', items: [
            { title: 'At first: +1 every 10 rounds', body: 'In self-play a match took a median of 51 rounds — far too long.' },
            { title: 'Fewer chips (reverted)', body: 'Starting AI matches at 15 chips barely shortened them, because bets are capped at the smallest stack and shrink with it. Reverted six minutes later.' },
            { title: '+5 every 3 rounds', body: 'Raising the ante 1 → 6 → 11 cut the median to 14 rounds — but now the cards decided almost everything. In self-play a strong player won 31% of five-player tables, hardly above the 20% of pure luck.' },
            { title: 'Now: slow, then fast', body: '+1 every 2 rounds up to round 16 (1, 1, 2, 2 … 8), then +5 every 2 rounds (13, 13, 18 …), chosen by self-play over 16 schedules. A strong player wins about 42% of five-player tables; matches last about 24 rounds and rarely pass 38.' },
          ] },
        ],
      },
      {
        id: 'numbers',
        title: 'Real records',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'table', head: ['Final place', 'Matches', 'Share'], rows: [
            ['1st', '130', '48.0%'],
            ['2nd', '52', '19.2%'],
            ['3rd', '34', '12.5%'],
            ['4th', '27', '10.0%'],
            ['5th', '28', '10.3%'],
          ] },
          { type: 'p', text: 'Pure luck would give a human 20% first places against four AIs; over these 271 matches it was 48.0%. An AI match averaged 25.3 rounds. The records span all three ante curves and are not split by curve. Counting everyone, the game had been played 1,201 times (657 against the AI).' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { title: 'The face-up card gives the temperament away', body: 'LEO always shows its highest card, KAI its highest or lowest, the rest a middle card. If LEO shows a low card, the other two are low too.' },
            { title: 'Big bets make it doubt', body: 'The AI marks its win chance down as the bet nears the cap (up to 40%). Bet big when you are sure and it is more likely to fold — and a big bet works as a bluff for the same reason.' },
            { title: 'Its imagined opponents are simple', body: 'The AI assumes everyone hits by expected value only. If you stay on a low total or hit on a high one on purpose, it misreads your hand.' },
            { title: 'It fears elimination', body: 'The fewer chips it has, the more careful the utility curve makes it. Pressure a short-stacked AI and it folds even good hands.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/hitStay.ts` — rules, hsAnte, HS_PERSONA, STYLE, unseen, wantsHit, winChance, chooseHsAction',
      'Commits e7313d8 (11/24 Hit,Stay), 250af41 (11/25 records and rankings), f5ae749 (11/25 LUNA HIT bug), 1a68974 and 00b1494 (11/25 15-chip try and revert, +5 every 3 rounds), cd19fec (11/25 the current ante curve)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (game = hit_stay, mode = ai) final-place distribution and average rounds, game_plays_daily totals',
    ],
  },
};

export default article;
