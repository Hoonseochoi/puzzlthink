import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'bluffing',
  category: 'information',
  updated: '2026-11-26',
  games: ['indianPoker', 'twoSidedPoker', 'piggyBank', 'hitStay'],
  related: ['minimax-mixed-strategy', 'signaling-cheap-talk', 'nash-equilibrium', 'colonel-blotto'],
  ko: {
    meta: {
      title: '블러핑은 언제 이득일까 — 간단한 포커 모형으로 계산하는 허세의 비율 | PUZZLTHINK 게임 이론',
      description: '블러핑은 배짱이 아니라 비율의 문제예요. 패 두 종류짜리 간단한 포커 모형으로 균형 블러핑 빈도와 콜 빈도를 직접 계산하고, 쿤 포커의 결과, 인디언 포커·양면포커·돼지 저금통에서 써먹는 법까지 정리했어요.',
      keywords: ['블러핑', '블러핑 전략', '포커 게임 이론', '쿤 포커', '인디언 포커 전략', '블러핑 비율'],
    },
    title: '블러핑은 언제 이득인가',
    lead: '허세는 배짱이 아니라 비율이에요. 그리고 진짜 수익은 강한 패에서 나와요.',
    intro: [
      '약한 패로 크게 걸어 상대를 접게 만드는 것, 블러핑은 포커의 꽃처럼 여겨져요. 그런데 블러핑을 "얼마나 자주" 해야 하는지, 그리고 블러핑으로 "어디서" 돈을 버는지 물어보면 의외로 답이 엇갈려요.',
      '게임 이론은 이 질문에 꽤 정확한 답을 줘요. 이 글에서는 패가 두 종류뿐인 아주 작은 포커로 균형 블러핑 비율을 직접 계산하고, 그 결과가 PUZZLTHINK의 심리전 게임에서 무엇을 뜻하는지 살펴봐요.',
    ],
    summary: '패 두 종류짜리 포커로 균형 블러핑 비율을 계산하면, 허세의 진짜 이익이 어디서 오는지 보여요.',
    sections: [
      {
        id: 'history',
        title: '블러핑을 수학으로 다룬 사람들',
        blocks: [
          { type: 'p', text: '게임 이론의 아버지로 불리는 존 폰 노이만은 포커에 큰 관심이 있었고, 1944년 오스카어 모르겐슈테른과 함께 쓴 『게임 이론과 경제 행동』에서 단순화한 포커 모형을 분석해 블러핑이 합리적인 전략의 일부라는 것을 보였어요. 1950년에는 해럴드 쿤이 카드 세 장(J, Q, K)으로 하는 더 작은 포커를 만들어 완전히 풀었는데, 이것이 지금도 교과서에 나오는 **쿤 포커**예요.' },
          { type: 'p', text: '두 모형 모두 같은 결론을 내요. **균형에서 블러핑은 반드시 일어나고, 그 빈도는 정해진 비율이에요.** 블러핑을 전혀 안 하는 것도, 마구 하는 것도 상대에게 이용당해요.' },
        ],
      },
      {
        id: 'model',
        title: '작은 모형: 강한 패와 약한 패',
        blocks: [
          { type: 'p', text: '두 사람이 1칩씩 내서 판돈은 2칩이에요. A만 카드를 받는데, 절반 확률로 **강한 패**(쇼다운에서 무조건 이김), 절반 확률로 **약한 패**(무조건 짐)예요. B는 A의 패를 몰라요. A는 1칩을 걸거나 체크할 수 있어요. A가 체크하면 바로 패를 비교하고, A가 걸면 B는 1칩을 내고 따라가거나(콜) 포기(폴드)해요.' },
          { type: 'p', text: 'A는 강한 패라면 당연히 걸어요. 문제는 약한 패예요. 약한 패로 걸면 블러핑이에요. A가 약한 패일 때 블러핑할 확률을 x, B가 콜할 확률을 y라고 해요.' },
          { type: 'h3', text: 'B는 언제 콜해야 할까' },
          { type: 'p', text: 'B가 콜하면 1칩을 더 걸고 판돈 3칩(양쪽 기본 2칩 + A의 베팅 1칩)을 노려요. 폴드와 비교하면, 상대가 강한 패일 때 콜은 1칩을 더 잃고, 블러핑일 때 콜은 3칩을 더 벌어요. A가 건 상황에서 강한 패일 가능성과 블러핑일 가능성의 비는 1 : x예요.' },
          { type: 'table', head: ['A가 걸었을 때 실제 패', '상대적 가능성', 'B가 콜하면 (폴드 대비)'], rows: [
            ['강한 패', '1/2', '−1칩'],
            ['약한 패(블러핑)', 'x/2', '+3칩'],
          ], caption: 'B가 콜과 폴드 사이에서 무관심해지려면 (1/2)(−1) + (x/2)(3) = 0, 즉 x = 1/3이어야 해요.' },
          { type: 'p', text: '그러니 균형에서 **A는 약한 패의 1/3을 블러핑**해요. A가 건 베팅 넷 중 하나가 블러핑인 셈이에요. B 입장에서 1칩을 걸어 3칩을 노리니 25%만 맞으면 본전이라는 계산(팟 오즈)과 정확히 맞아요.' },
          { type: 'h3', text: 'A는 언제 블러핑해야 할까' },
          { type: 'p', text: '약한 패로 체크하면 A는 기본 1칩을 잃어요. 블러핑하면, B가 콜하면 2칩을 잃고(기본 + 베팅), B가 폴드하면 판돈을 가져와 1칩을 벌어요. A가 블러핑과 체크 사이에서 무관심해지려면 −1 = y(−2) + (1 − y)(+1), 즉 **y = 2/3**이에요. B는 베팅을 받으면 2/3 확률로 콜해요.' },
          { type: 'callout', tone: 'note', title: '블러핑의 진짜 이익은 강한 패에서 나와요', text: '균형에서 A가 약한 패로 얻는 기대값은 체크하든 블러핑하든 −1칩으로 같아요. 그럼 블러핑은 왜 할까요? A가 블러핑을 전혀 안 하면, B는 A의 베팅을 보자마자 늘 폴드해서 A의 강한 패는 1칩밖에 못 벌어요. 블러핑을 섞으면 B가 2/3 확률로 콜해 주니 강한 패의 기대값이 (2/3)×2 + (1/3)×1 = 5/3칩으로 올라가요. 전체 기대값은 판당 0칩에서 1/3칩이 돼요. **블러핑은 약한 패를 살리는 기술이 아니라, 강한 패에 돈을 붙여 주는 기술이에요.**' },
        ],
      },
      {
        id: 'kuhn',
        title: '쿤 포커가 보여 준 것',
        blocks: [
          { type: 'p', text: '쿤 포커는 J, Q, K 세 장 중 한 장씩 받고 1칩씩 낸 뒤, 한 번만 1칩을 걸 수 있는 게임이에요. 쿤은 이 게임의 균형이 하나가 아니라 하나의 변수로 이어진 여러 개라는 것을 보였어요. 균형에서 먼저 두는 사람은 가장 약한 J로 0에서 1/3 사이의 확률로 블러핑하고, 그 비율에 맞춰 K로 거는 비율도 정해져요. 중간 패인 Q는 체크한 뒤 상황에 따라 콜해요.' },
          { type: 'p', text: '두 가지가 눈에 띄어요. 첫째, **가장 약한 패가 블러핑에 쓰여요.** 중간 패 Q는 체크하고 쇼다운에서 J를 이기는 게 낫기 때문에 블러핑할 이유가 적어요. 둘째, 이 게임은 먼저 두는 사람에게 불리해서, 균형에서 먼저 두는 사람의 기대값은 판당 −1/18칩이에요. 정보가 나중에 드러나는 쪽, 즉 상대의 행동을 보고 결정하는 쪽이 유리해요.' },
        ],
      },
      {
        id: 'people',
        title: '사람들이 자주 틀리는 지점',
        blocks: [
          { type: 'list', items: [
            '**블러핑을 너무 적게 해요.** 많은 사람이 "들키면 창피하다"는 이유로 블러핑을 아껴요. 그러면 상대는 내 베팅에 늘 폴드해도 손해를 보지 않아, 강한 패로 벌 기회가 줄어요.',
            '**블러핑을 너무 많이 해요.** 반대로 블러핑을 즐기는 사람은 모형이 말하는 비율을 넘기기 쉬워요. 그러면 상대는 늘 콜하는 것으로 이겨요.',
            '**결과로 판단해요.** 한 번 블러핑이 들켰다고 그 판단이 틀린 건 아니에요. 균형 비율이라면 B가 2/3 확률로 콜하니 블러핑은 원래 자주 들켜요. 중요한 건 여러 판에 걸친 비율이에요.',
          ] },
          { type: 'callout', tone: 'warn', title: '균형이 언제나 최선은 아니에요', text: '균형 비율은 "상대가 무엇을 하든 이용당하지 않는" 방어적인 기준이에요. 상대가 지나치게 자주 폴드한다면 블러핑을 늘리고, 지나치게 자주 콜한다면 블러핑을 줄이고 강한 패로만 거는 편이 더 벌어요. 대신 그렇게 하는 순간 나도 읽힐 위험을 지게 돼요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'h3', text: '인디언 포커: 내 카드는 상대의 베팅 속에 있어요' },
          { type: 'p', text: '[인디언 포커](/indian-poker)는 정보 구조가 거꾸로예요. 1~10 카드 두 벌에서 한 장씩 받아, 내 카드는 이마에 붙이고 상대 카드만 봐요. 그래서 블러핑의 의미도 달라져요. 내가 크게 걸면 상대는 "내 카드가 낮아 보이나?"라고 읽어요. 내 베팅은 상대에게 **상대 자신의 카드에 대한 정보**가 되는 거예요. 상대 카드가 높을 때도 가끔 크게 걸어야 내 베팅이 상대 카드의 신호가 되지 않아요. 또 이 게임은 10을 들고 폴드하면 10칩을 추가로 내야 해서, 상대 카드가 높아 보여도 쉽게 접기 어려운 구조예요. 남은 카드를 세어 내 카드가 10일 확률을 따져 보세요.' },
          { type: 'h3', text: '양면포커: 앞면은 공개, 뒷면은 나만' },
          { type: 'p', text: '[양면포커](/two-sided-poker)는 카드 앞면 숫자는 모두가 보고 뒷면은 주인만 봐요. 어느 면으로 승부할지 고르는 것 자체가 신호가 돼요. 앞면이 약한데 뒷면을 고르며 크게 건다면 "뒷면이 강하다"는 메시지이고, 이걸 블러핑으로 쓸 수도 있어요. 위 모형처럼 "강할 때 거는 횟수"에 맞춰 블러핑을 섞어야, 뒷면 선택이 곧 강하다는 신호로 읽히지 않아요.' },
          { type: 'h3', text: '돼지 저금통: 의심의 기대값' },
          { type: 'p', text: '[돼지 저금통](/piggy-bank)에서는 다른 사람의 대답을 의심할 수 있어요. 의심이 맞으면 의심한 사람 +1점, 대답한 사람 −1점이고, 틀리면 의심한 사람만 −1점이에요. 대답이 틀렸을 확률을 q라고 하면 의심의 기대값은 q × (+1) + (1 − q) × (−1) = 2q − 1이에요. 그러니 **틀렸을 확률이 절반을 넘을 때만** 의심하는 게 이득이에요. 반대로 대답하는 쪽은, 다른 사람이 동전 수를 얼마나 정확히 기억하고 있을지를 생각해야 해요.' },
          { type: 'h3', text: 'Hit,Stay: 콜의 가격' },
          { type: 'p', text: '[Hit,Stay](/hit-stay)처럼 여럿이 칩을 거는 게임에서도 같은 계산이 쓰여요. 따라가는 데 드는 칩과 이길 때 받는 판돈의 비(팟 오즈)를 이길 확률과 비교하고, 다른 사람이 공개한 카드로 그 확률을 가늠해 보세요.' },
        ],
      },
    ],
    refs: [
      { title: 'John von Neumann, Oskar Morgenstern, Theory of Games and Economic Behavior, Princeton University Press, 1944' },
      { title: 'H. W. Kuhn, "A Simplified Two-Person Poker", Contributions to the Theory of Games I, Princeton University Press, 1950' },
      { title: 'Kuhn poker 정리 (Dartmouth 학부 논문, 2014)', url: 'https://math.dartmouth.edu/theses/undergrad/2014/Miao-thesis.pdf' },
      { title: 'Bill Chen, Jerrod Ankenman, The Mathematics of Poker, ConJelCo, 2006' },
      { title: 'PUZZLTHINK 인디언 포커·양면포커·돼지 저금통·Hit,Stay 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'When does bluffing pay? Working out the bluff ratio with a tiny poker model | PUZZLTHINK',
      description: 'Bluffing is a matter of ratios, not nerve. Compute the equilibrium bluffing and calling frequencies in a two-hand poker model, see what Kuhn poker shows, and use it in Indian Poker, Two-Sided Poker and Piggy Bank.',
      keywords: ['bluffing', 'bluffing strategy', 'poker game theory', 'Kuhn poker', 'Indian poker strategy', 'bluff frequency'],
    },
    title: 'When does bluffing pay?',
    lead: 'Bluffing is a ratio, not nerve. And the real profit comes from your strong hands.',
    intro: [
      'Betting big on a weak hand to make the opponent fold is seen as the soul of poker. But ask how often to bluff, and where the money from bluffing actually comes from, and answers diverge.',
      'Game theory answers both questions quite precisely. This article computes the equilibrium bluffing rate in a tiny poker with only two kinds of hand, then looks at what it means in PUZZLTHINK’s mind games.',
    ],
    summary: 'Work out the equilibrium bluff rate in a two-hand poker, and you see where the profit from bluffing really comes from.',
    sections: [
      {
        id: 'history',
        title: 'The people who put bluffing into equations',
        blocks: [
          { type: 'p', text: 'John von Neumann, often called the father of game theory, was keenly interested in poker. In Theory of Games and Economic Behavior (1944), written with Oskar Morgenstern, he analysed simplified poker models and showed that bluffing is part of rational play. In 1950 Harold Kuhn built and fully solved an even smaller poker with three cards (J, Q, K): **Kuhn poker**, still a textbook example.' },
          { type: 'p', text: 'Both models reach the same conclusion: **in equilibrium bluffing must happen, at a specific frequency.** Never bluffing and bluffing wildly are both exploitable.' },
        ],
      },
      {
        id: 'model',
        title: 'A small model: strong hand, weak hand',
        blocks: [
          { type: 'p', text: 'Each player antes 1 chip, so the pot is 2. Only A gets a card: half the time a **strong hand** (always wins a showdown), half the time a **weak hand** (always loses). B does not know which. A may bet 1 chip or check. If A checks, the hands are compared at once; if A bets, B either calls 1 chip or folds.' },
          { type: 'p', text: 'With a strong hand A obviously bets. The question is the weak hand: betting it is a bluff. Let x be the probability that A bluffs with a weak hand and y the probability that B calls.' },
          { type: 'h3', text: 'When should B call?' },
          { type: 'p', text: 'Calling puts 1 more chip in to win a pot of 3 (the 2 antes plus A’s bet). Compared with folding, calling loses 1 more chip against a strong hand and gains 3 against a bluff. When A has bet, strong and bluff are in the ratio 1 : x.' },
          { type: 'table', head: ['A’s actual hand after a bet', 'Relative chance', 'B calling (vs folding)'], rows: [
            ['Strong', '1/2', '−1 chip'],
            ['Weak (bluff)', 'x/2', '+3 chips'],
          ], caption: 'For B to be indifferent between calling and folding, (1/2)(−1) + (x/2)(3) = 0, so x = 1/3.' },
          { type: 'p', text: 'So in equilibrium **A bluffs with a third of the weak hands**: one bet in four is a bluff. That matches B’s pot odds exactly: risking 1 to win 3 breaks even if right 25% of the time.' },
          { type: 'h3', text: 'When should A bluff?' },
          { type: 'p', text: 'Checking a weak hand loses the 1-chip ante. Bluffing loses 2 chips if called (ante plus bet) and wins 1 if B folds. For A to be indifferent, −1 = y(−2) + (1 − y)(+1), so **y = 2/3**: facing a bet, B calls two-thirds of the time.' },
          { type: 'callout', tone: 'note', title: 'The profit from bluffing comes from strong hands', text: 'In equilibrium A’s weak hand is worth −1 whether it checks or bluffs. So why bluff? If A never bluffed, B would fold to every bet and A’s strong hands would win only 1 chip. Mixing in bluffs makes B call two-thirds of the time, raising a strong hand’s value to (2/3)×2 + (1/3)×1 = 5/3. A’s overall expectation goes from 0 to 1/3 chip per hand. **Bluffing is not a way to rescue weak hands; it is a way to get paid on strong ones.**' },
        ],
      },
      {
        id: 'kuhn',
        title: 'What Kuhn poker shows',
        blocks: [
          { type: 'p', text: 'In Kuhn poker each player is dealt one of J, Q, K, antes 1, and there is a single bet of 1. Kuhn showed the game has not one equilibrium but a family linked by one parameter. In equilibrium the first player bluffs with the weakest card, the J, with some probability between 0 and 1/3, and bets the K at a rate tied to that bluffing rate. The middle card, the Q, checks and then calls depending on the situation.' },
          { type: 'p', text: 'Two things stand out. First, **the weakest hand is the one used to bluff**: the Q does better to check and beat a J at showdown, so it has little reason to bluff. Second, the game favours the second player: in equilibrium the first player expects −1/18 chip per hand. Acting after seeing what the other side did is an advantage.' },
        ],
      },
      {
        id: 'people',
        title: 'Where people usually go wrong',
        blocks: [
          { type: 'list', items: [
            '**Bluffing too little.** Many people save their bluffs because getting caught is embarrassing. Then opponents can fold to every bet at no cost, and the strong hands earn less.',
            '**Bluffing too much.** Those who enjoy bluffing easily overshoot the model’s ratio, and opponents win simply by always calling.',
            '**Judging by results.** A bluff that got called was not necessarily a mistake. At the equilibrium ratio B calls two-thirds of the time, so bluffs are caught often. What matters is the ratio over many hands.',
          ] },
          { type: 'callout', tone: 'warn', title: 'Equilibrium is not always best', text: 'The equilibrium ratio is a defensive baseline that cannot be exploited whatever the opponent does. Against someone who folds too often, bluff more; against someone who calls too often, bluff less and bet only strong hands. But the moment you do, you can be read in turn.' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'h3', text: 'Indian Poker: your card is hidden in their bet' },
          { type: 'p', text: '[Indian Poker](/indian-poker) turns the information around. From two sets of 1–10, each player holds one card to their forehead and sees only the opponent’s. That changes what a bluff means: when I bet big, the opponent reads it as "my own card must look low". My bet becomes **information about their own card**. I need to bet big sometimes when their card is high, too, or my bets become a signal of their card. In this game folding a 10 also costs ten extra chips, so folding is costly even when the opponent’s card looks strong; count the cards already used to judge the chance that yours is a 10.' },
          { type: 'h3', text: 'Two-Sided Poker: one public face, one private' },
          { type: 'p', text: 'In [Two-Sided Poker](/two-sided-poker) everyone sees a card’s front number and only its owner sees the back. Choosing which face to play is itself a signal: a weak front, a back chosen and a big bet says "my back is strong", and that can be a bluff. As in the model, mix bluffs in proportion to how often you bet genuine strength, or choosing the back will simply be read as strength.' },
          { type: 'h3', text: 'Piggy Bank: the value of a doubt' },
          { type: 'p', text: 'In [Piggy Bank](/piggy-bank) you may doubt another player’s answer. A correct doubt gives the doubter +1 and the answerer −1; a wrong doubt costs the doubter 1. If the answer is wrong with probability q, a doubt is worth q × (+1) + (1 − q) × (−1) = 2q − 1. So **doubt only when the answer is more likely wrong than right**. As the answerer, think about how precisely the others remember the coins.' },
          { type: 'h3', text: 'Hit,Stay: the price of a call' },
          { type: 'p', text: 'The same arithmetic applies in multiplayer betting games such as [Hit,Stay](/hit-stay): compare the chips needed to call with the pot you stand to win (the pot odds) against your chance of winning, judged from the cards the others have shown.' },
        ],
      },
    ],
    refs: [
      { title: 'John von Neumann, Oskar Morgenstern, Theory of Games and Economic Behavior, Princeton University Press, 1944' },
      { title: 'H. W. Kuhn, "A Simplified Two-Person Poker", Contributions to the Theory of Games I, Princeton University Press, 1950' },
      { title: 'Kuhn poker analysis (Dartmouth undergraduate thesis, 2014)', url: 'https://math.dartmouth.edu/theses/undergrad/2014/Miao-thesis.pdf' },
      { title: 'Bill Chen, Jerrod Ankenman, The Mathematics of Poker, ConJelCo, 2006' },
      { title: 'PUZZLTHINK Indian Poker, Two-Sided Poker, Piggy Bank and Hit,Stay rules (shown in each game)' },
    ],
  },
};

export default article;
