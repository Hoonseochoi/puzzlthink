import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-indian-poker',
  category: 'ai',
  games: ['indianPoker'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '인디언 포커 AI 개발기 — 자기 카드를 못 보는 AI가 베팅을 읽는 법 | 개발 노트',
      description: '더 지니어스 인디언 포커 AI 개발기. 상대 카드와 지나간 카드로 승산을 세는 방법, 난이도마다 다른 "카드 세기"와 실수, 상대의 베팅을 내 카드의 힌트로 읽게 된 이유, 목표 승률 대신 실제 기록을 버튼에 보여 주게 된 사연까지.',
      keywords: ['인디언 포커 AI', '인디언 포커 공략', '더 지니어스 인디언 포커', '인디언 포커 10 폴드', '포커 AI', '게임 AI 개발기'],
    },
    title: '인디언 포커 AI 개발기',
    lead: '자기 카드를 못 보는 건 AI도 마찬가지예요.',
    intro: [
      '인디언 포커는 1~10 카드 두 벌(20장)로 하는 1:1 베팅 게임이에요. 각자 카드 한 장을 이마에 붙이듯 상대에게만 보여 주고, 자기 카드는 볼 수 없어요. 10을 들고 폴드하면 10칩을 벌칙으로 더 내요. 처음 칩은 20개이고, 매 판 양쪽이 1칩씩 먼저 내요.',
      '이 게임의 AI는 공정해야 했어요. AI도 자기 카드는 모르고, 사람 카드와 지나간 카드, 베팅과 칩만 봐요. 이 글은 그 정보로 AI가 어떻게 승산을 세는지, 난이도마다 무엇을 덜 하게 했는지 정리한 기록이에요.',
    ],
    summary: '상대 카드와 지나간 카드로 승산을 세고, 상대의 베팅을 내 카드의 힌트로 읽는 AI. 난이도별 카드 세기와 실수, 그리고 "목표 승률"을 버린 이유.',
    sections: [
      {
        id: 'equity',
        title: '승산 세기',
        blocks: [
          { type: 'p', text: '인디언 포커는 11월 18일 오후에 결합과 함께 올라갔어요. AI의 출발점은 단순한 확률이에요. 내 카드는 모르지만 **상대 카드는 보이니까**, 남은 카드 중 상대 카드보다 큰 카드의 비율(같은 숫자는 반만 쳐요)이 내가 이길 확률이에요.' },
          { type: 'p', text: '"남은 카드"를 얼마나 정확히 아느냐가 난이도의 첫 번째 차이예요. 지나간 판의 카드를 기억하면 남은 덱의 분포가 바뀌거든요. 어려움은 지나간 카드를 **100%** 반영한 정확한 분포를 쓰고, 보통은 75%, 쉬움은 15%만 반영해요(나머지는 처음 20장 그대로라고 생각해요). 10을 들고 있을 확률도 같은 방식으로 계산해서, 10을 들고 폴드할 위험이 클수록 쉽게 접지 않아요.' },
        ],
      },
      {
        id: 'decide',
        title: '폴드·콜·레이즈 정하기',
        blocks: [
          { type: 'p', text: '승산(여기에 작은 무작위를 더한 추정치)을 "폴드 기준선"과 비교해요. 기준선은 팟 대비 콜 금액(팟 오즈)에, 내 칩에서 콜 금액이 차지하는 비율을 조금 더하고, 상대 칩이 6개 이하면 조금 빼고, 10을 들고 폴드할 위험만큼 빼서 정해요. 추정치가 기준선보다 낮으면 접어요.' },
          { type: 'list', items: [
            '먼저 걸어야 하는 차례(체크 불가)에 추정치가 0.58 미만이면 최소 금액만 걸고, 콜을 받아야 할 때 0.62 미만이면 콜만 해요.',
            '더 높으면 레이즈해요. 크기는 추정치가 0.82를 넘으면 팟의 78%, 0.67을 넘으면 48%, 아니면 난이도별 공격성(쉬움 25%, 보통 45%, 어려움 65%)만큼이에요.',
            '블러프는 상대 카드가 4 이하로 약할 때 더 자주 하고(1.35배), 크기는 올인 대신 그럴듯한 중간 크기(35%)로 해요.',
          ] },
          { type: 'table', head: ['', '쉬움', '보통', '어려움'], rows: [
            ['제대로 판단하는 비율', '30%', '66%', '96%'],
            ['지나간 카드 반영', '15%', '75%', '100%'],
            ['추정 흔들림', '±0.14', '±0.06', '±0.015'],
            ['블러프 기본 확률', '24%', '14%', '11%'],
            ['상대 베팅 읽기', '0', '0.25', '0.6'],
          ] },
          { type: 'p', text: '"제대로 판단하지 않는" 차례에도 완전히 무작위로 두지는 않아요. 코드 주석의 표현으로 "그럴듯한 실수"예요. 콜을 받아야 할 때는 좋은 팟 오즈에도 접어 버리거나, 나쁜 카드에 칩을 너무 많이 밀어 넣는 식이에요. 사람이 실제로 하는 실수의 모양을 흉내 낸 거예요.' },
        ],
      },
      {
        id: 'read',
        title: '상대의 베팅을 내 카드의 힌트로',
        blocks: [
          { type: 'p', text: '11월 20일 기록 점검에서 어려움이 생각보다 약했어요. 사람이 거의 절반을 이겼고, **처음 도전한 판에서는 65%**를 이겼어요. 원인은 AI가 중요한 정보 하나를 버리고 있었다는 점이에요. 사람은 AI의 카드를 보고 베팅해요. 그러니 사람이 크게 올리면 AI 카드가 낮을 가능성이, 조용히 체크하면 높을 가능성이 커요.' },
          { type: 'p', text: '그래서 AI가 상대의 베팅을 자기 카드의 힌트로 읽게 했어요. 콜 금액이 팟에 비해 클수록 승산을 최대 0.22까지 깎고, 상대가 이미 팟이 쌓인 상태에서 체크로만 받으면 0.04를 더해요. 다만 사람도 블러프를 하니까, 이 힌트는 난이도별 "읽기" 비율(쉬움 0, 보통 0.25, 어려움 0.6)만큼만 반영해요.' },
        ],
      },
      {
        id: 'targets',
        title: '"목표 승률"을 버튼에서 내린 이유',
        blocks: [
          { type: 'p', text: '난이도 버튼에는 AI 승률이 적혀 있어요. 처음에는 설계 목표(AI가 이길 확률 쉬움 20%, 보통 50%, 어려움 75%)를 그대로 적었어요. 11월 26일에 기록을 보니 실제로는 **보통 338경기에서 41%, 어려움 478경기에서 55%**였어요. 코드 주석의 결론은 "카드가 경기의 큰 부분을 정한다"예요. AI를 더 세게 만들어도 운의 몫이 커서 75%에는 닿기 어렵다는 거예요. 그래서 버튼의 숫자를 실제 기록에 맞춰 보통 40%, 어려움 55%로 바꾸고, 쉬움은 25%로 적었어요. 양면 포커도 같은 날 같은 방식으로 바꿨어요.' },
          { type: 'p', text: '같은 이유로 인디언 포커와 러시안 룰렛의 승리는 11월 20일부터 "피스 경쟁전" 점수에서 빠졌어요. 운이 크게 작용하는 게임이라서예요.' },
          { type: 'callout', tone: 'note', title: '한 판에 1칩씩', text: '11월 24일에는 매 판 양쪽이 1칩씩 먼저 내는 규칙을 넣었어요. 접는 데 비용이 전혀 없으면 약한 카드는 무조건 접는 게 최선이 되거든요. 이제 폴드는 언제나 최소 1칩이 들어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요.',
        blocks: [
          { type: 'table', head: ['난이도', '사람 승률', '경기 수'], rows: [
            ['쉬움', '40.0%', '10경기'],
            ['보통', '59.3%', '376경기'],
            ['어려움', '45.1%', '501경기'],
          ] },
          { type: 'p', text: '어려움 AI를 이긴 플레이어에게 주는 클리어 인증은 인디언 포커가 94명으로 모든 게임 중 가장 많아요. 운의 비중이 큰 만큼 어려움을 한 번 이기는 문턱이 낮은 게임이에요. 전체 판수(로그인 여부 무관)는 3,827판이고 AI전 2,033판, 친구 대전 1,794판으로 친구 대전 비율이 높은 게임이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { tag: '쉬움·보통', title: '카드를 덜 세요', body: '지나간 카드를 15%(쉬움)·75%(보통)만 반영해요. 10이나 높은 카드가 이미 많이 나갔다면 AI는 자기 승산을 실제보다 높게 봐요.' },
            { tag: '어려움', title: '베팅을 읽는 AI를 거꾸로', body: '어려움은 큰 베팅을 "내 카드가 낮다"는 신호로 60%만큼 받아들여요. AI 카드가 높아도 크게 올리면 접게 만들 수 있어요. 반대로 AI 카드가 낮을 때 조용히 체크하면 AI가 오히려 자신감을 가져요.' },
            { tag: '공통', title: '10 벌칙 계산', body: 'AI는 남은 덱에 10이 많을수록 폴드 기준선을 낮춰요. 10이 다 나간 뒤에는 쉽게 접으니, 후반에는 압박이 더 잘 통해요.' },
            { tag: '공통', title: '칩이 적은 상대에게 공격적', body: '사람 칩이 6개 이하면 폴드 기준선을 낮춰서 더 버텨요. 칩이 적을 때의 블러프는 잘 안 통해요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/indianPoker.ts` — POKER_AI_TARGET, choosePokerAiAction(profile, equity, hint, foldLine, 레이즈 크기)',
      '커밋 4f49cd6 (11/18 결합·인디언 포커), 1fe2d84 (11/20 베팅 읽기, 피스 경쟁전 제외), 511bafb (11/24 매 판 1칩), e227318 (11/26 버튼 승률을 기록으로)',
      'DB 집계(2026-11-26 14:22 KST): game_results(game=indian_poker, mode=ai) 난이도별 승률, hard_clears 게임별 인원, game_plays_daily 게임·모드별 합계',
    ],
  },
  en: {
    meta: {
      title: 'Indian Poker AI dev notes — how an AI that cannot see its card reads your bets | Dev notes',
      description: "How The Genius-style Indian Poker AI counts its odds from your card and the cards gone by, how levels differ in card counting and mistakes, why it learned to read your bets as a hint about its own card, and why the level buttons now show recorded win rates.",
      keywords: ['Indian Poker AI', 'Indian Poker strategy', 'The Genius Indian Poker', 'poker AI', 'game AI dev diary'],
    },
    title: 'Indian Poker AI dev notes',
    lead: 'The AI cannot see its own card either.',
    intro: [
      'Indian Poker is a 1:1 betting game with two sets of cards 1–10 (20 cards). Each player shows one card to the opponent only, as if stuck on the forehead, and never sees their own. Folding while holding a 10 costs a 10-chip penalty. You start with 20 chips and both players ante 1 each hand.',
      'The AI had to be fair: it does not know its own card either, and sees only yours, the cards gone by, the bets and the stacks. This note shows how it turns that into odds, and what each level was made to do less of.',
    ],
    summary: 'An AI that counts odds from your card and the used cards and reads your bets as a hint about its own card — level by level, and why the "target" win rates were dropped.',
    sections: [
      {
        id: 'equity',
        title: 'Counting the odds',
        blocks: [
          { type: 'p', text: 'Indian Poker went live on the afternoon of 18 November, together with Gyulhap. The AI starts from plain probability: it cannot see its card but **can see yours**, so its chance to win is the share of remaining cards higher than yours (equal ones count half).' },
          { type: 'p', text: 'How well it knows "the remaining cards" is the first difference between levels, since used cards change the deck. Hard uses the exact remaining distribution (**100%** of the used cards), Normal 75% and Easy only 15% (the rest of the time it imagines the full 20 cards). The chance of holding a 10 is computed the same way, and the bigger the risk of folding a 10, the less readily it folds.' },
        ],
      },
      {
        id: 'decide',
        title: 'Fold, call or raise',
        blocks: [
          { type: 'p', text: 'The estimate (odds plus a little noise) is compared with a fold line: the pot odds, plus a bit for how much of its stack the call takes, minus a bit if your stack is 6 or less, minus the risk of folding a 10. Below the line, it folds.' },
          { type: 'list', items: [
            'When it must open (no check), below 0.58 it bets the minimum; facing a bet, below 0.62 it only calls.',
            'Higher, it raises: 78% of the pot above 0.82, 48% above 0.67, otherwise its level’s aggression (Easy 25%, Normal 45%, Hard 65%).',
            'It bluffs more when your card is weak (4 or less, ×1.35), and with a credible medium size (35%) rather than all-in.',
          ] },
          { type: 'table', head: ['', 'Easy', 'Normal', 'Hard'], rows: [
            ['Sound decisions', '30%', '66%', '96%'],
            ['Used cards counted', '15%', '75%', '100%'],
            ['Estimate noise', '±0.14', '±0.06', '±0.015'],
            ['Base bluff chance', '24%', '14%', '11%'],
            ['Reading your bets', '0', '0.25', '0.6'],
          ] },
          { type: 'p', text: 'Even an unsound decision is not random. The code calls it "deliberately plausible": folding good pot odds, or pushing too many chips into a bad visible card — the shape of mistakes people really make.' },
        ],
      },
      {
        id: 'read',
        title: 'Your bets as a hint about its card',
        blocks: [
          { type: 'p', text: 'At the 20 November check Hard was weaker than planned: people beat it about half the time, and **65% on their first try**. It was throwing away one key piece of information. People bet looking at the AI’s card, so a big raise means its card is probably low, and a quiet check that it is probably high.' },
          { type: 'p', text: 'So the AI now reads your bet as a hint: the bigger the call relative to the pot, the more its odds are marked down (up to 0.22), and a check into a pot that has already grown adds 0.04. People bluff too, so the hint only counts as far as the level reads (Easy 0, Normal 0.25, Hard 0.6).' },
        ],
      },
      {
        id: 'targets',
        title: 'Why the target win rates left the buttons',
        blocks: [
          { type: 'p', text: 'The level buttons show the AI’s win rate. At first they showed the design targets (AI wins: Easy 20%, Normal 50%, Hard 75%). On 26 November the records said **41% of 338 Normal matches and 55% of 478 Hard ones**. The conclusion in the code comment: the cards decide a large share of every match, so a stronger AI still would not reach 75%. The buttons now follow the records — Normal 40%, Hard 55% — with Easy at 25%. Two-Sided Poker got the same change that day.' },
          { type: 'p', text: 'For the same reason, wins in Indian Poker and Russian Roulette stopped counting toward the "piece race" from 20 November: luck plays too big a part.' },
          { type: 'callout', tone: 'note', title: 'One chip a hand', text: 'On 24 November both players started putting in 1 chip every hand. If folding costs nothing, folding every weak card is simply best. Now a fold always costs at least one chip.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'table', head: ['Level', 'Human win rate', 'Matches'], rows: [
            ['Easy', '40.0%', '10'],
            ['Normal', '59.3%', '376'],
            ['Hard', '45.1%', '501'],
          ] },
          { type: 'p', text: 'Indian Poker has the most Hard-AI clear certificates of any game — 94 players. With so much luck, the bar for beating Hard once is low. Counting everyone, it had been played 3,827 times: 2,033 against the AI and 1,794 between friends, an unusually high share of friend games.' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Easy · Normal', title: 'They count cards poorly', body: 'They count only 15% (Easy) or 75% (Normal) of the used cards. When many 10s and high cards are already gone, the AI overrates its odds.' },
            { tag: 'Hard', title: 'Turn its reading around', body: 'Hard takes a big bet as 60% evidence that its card is low. Raise big even when its card is high and it may fold. Check quietly when its card is low and it grows more confident.' },
            { tag: 'All', title: 'The 10-penalty maths', body: 'The more 10s left in the deck, the lower its fold line. Once the 10s are gone it folds easily, so pressure works better late.' },
            { tag: 'All', title: 'Stubborn against a short stack', body: 'When you have 6 chips or fewer it lowers its fold line and holds on. Bluffing from a short stack works poorly.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/indianPoker.ts` — POKER_AI_TARGET, choosePokerAiAction (profile, equity, hint, foldLine, raise sizing)',
      'Commits 4f49cd6 (11/18 Gyulhap and Indian Poker), 1fe2d84 (11/20 reading bets, out of the piece race), 511bafb (11/24 one-chip ante), e227318 (11/26 recorded win rates on the buttons)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (game = indian_poker, mode = ai) win rate by level, hard_clears per game, game_plays_daily totals by game and mode',
    ],
  },
};

export default article;
