import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'dominant-strategy',
  category: 'basics',
  updated: '2026-11-26',
  games: ['blackWhite2'],
  related: ['nash-equilibrium', 'prisoners-dilemma', 'auctions', 'zero-sum'],
  ko: {
    meta: {
      title: '우월 전략과 열등 전략 — 버릴 수를 먼저 버리는 법, 3분의 2 맞히기 게임 | PUZZLTHINK 게임 이론',
      description: '상대가 무엇을 하든 더 나은 수가 우월 전략, 늘 더 나쁜 수가 열등 전략이에요. 열등 전략을 차례로 지워 게임을 푸는 법, 강한 지배와 약한 지배의 차이, "평균의 3분의 2 맞히기"에서 사람들이 실제로 몇 단계까지 생각하는지 정리했어요.',
      keywords: ['우월 전략', '열등 전략', '지배 전략', '반복 제거', '3분의 2 게임', '미인 대회 게임'],
    },
    title: '우월 전략과 열등 전략',
    lead: '좋은 수를 찾기 전에, 절대 두면 안 되는 수부터 지우세요.',
    intro: [
      '게임에서 최선의 수를 찾는 건 어렵지만, **어떤 경우에도 더 나쁜 수**를 찾는 건 생각보다 쉬워요. 그리고 그런 수를 하나씩 지우다 보면, 복잡해 보이던 게임이 놀랄 만큼 단순해지기도 해요.',
      '이 글에서는 우월 전략과 열등 전략의 정확한 뜻, 열등 전략을 반복해서 지우는 방법, 그리고 이 방법을 사람들이 실제로 어디까지 쓰는지를 "평균의 3분의 2 맞히기" 게임으로 살펴봐요.',
    ],
    summary: '상대가 무엇을 하든 더 나은 수와 더 나쁜 수. 버릴 수를 차례로 지워 게임을 푸는 법.',
    sections: [
      {
        id: 'definitions',
        title: '정의: 언제나 더 낫다, 언제나 더 나쁘다',
        blocks: [
          { type: 'glossary', items: [
            { term: '강한 우월 전략', def: '상대가 무엇을 하든 다른 모든 선택보다 **엄격하게 더 나은** 선택이에요. [죄수의 딜레마](/game-theory/prisoners-dilemma)의 배신이 대표적이에요.' },
            { term: '약한 우월 전략', def: '상대가 무엇을 하든 **더 나쁘지 않고**, 어떤 경우에는 더 나은 선택이에요. [차가 경매](/game-theory/auctions)에서 진짜 가치를 쓰는 것이 그 예예요.' },
            { term: '열등 전략', def: '다른 어떤 선택에 비해 상대가 무엇을 하든 더 나쁜 선택이에요. 이런 선택을 "지배당한다"고도 해요.' },
          ] },
          { type: 'p', text: '우월 전략이 있으면 게임은 쉬워요. 상대 생각을 읽을 필요 없이 그걸 고르면 되니까요. 하지만 대부분의 게임에는 우월 전략이 없어요. 그때 쓸모 있는 건 반대 방향의 생각이에요. **"이 수는 어떤 경우에도 저 수보다 나쁘니, 아예 고려하지 말자."**' },
          { type: 'h3', text: '흑과 백 II의 예' },
          { type: 'p', text: '[흑과 백 II](/black-white-2)에서 먼저 건 사람의 점수가 흑으로 보였다면, 그 점수는 0~9점이에요. 뒤에 거는 사람이 10점을 걸면 확실히 이겨요. 이때 11점 이상을 거는 건 10점에 **지배당하는** 선택이에요. 결과(승리)는 똑같은데 점수만 더 쓰니까요. 반대로 이번 라운드를 버릴 생각이라면 0점이 다른 모든 지는 입찰을 지배해요.' },
        ],
      },
      {
        id: 'iterated',
        title: '반복 제거: 지우고, 또 지우기',
        blocks: [
          { type: 'p', text: '열등 전략을 지우면 게임이 작아지고, 작아진 게임에서 새로운 열등 전략이 보이기도 해요. 이걸 끝까지 반복하는 방법을 **열등 전략의 반복 제거**라고 해요. 아래 표로 따라가 볼게요.' },
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['위', '가운데', '아래'], cols: ['왼쪽', '중앙', '오른쪽'],
            cells: [[[4, 3], [5, 1], [6, 2]], [[2, 1], [8, 4], [3, 6]], [[3, 0], [9, 6], [2, 8]]],
            mark: [[0, 0]],
            caption: '반복 제거 끝에 (위, 왼쪽)만 남아요. 이 칸이 이 게임의 유일한 내시 균형이에요.',
          },
          { type: 'list', ordered: true, items: [
            '**B의 "중앙"은 "오른쪽"에 지배당해요.** A가 위·가운데·아래를 고를 때 B의 점수가 중앙은 1, 4, 6이고 오른쪽은 2, 6, 8이라 늘 오른쪽이 높아요. 중앙을 지워요.',
            '**이제 A의 "가운데"와 "아래"가 "위"에 지배당해요.** 남은 열(왼쪽, 오른쪽)에서 A의 점수는 위가 4, 6, 가운데가 2, 3, 아래가 3, 2예요. 위가 늘 높으니 가운데와 아래를 지워요.',
            '**마지막으로 B는 "왼쪽"을 골라요.** A가 위를 고를 때 B는 왼쪽 3, 오른쪽 2이니까요.',
          ] },
          { type: 'p', text: '흥미로운 점은 1단계 전에는 A의 "가운데"와 "아래"가 지배당하지 않았다는 거예요. 중앙 열에서는 오히려 위(5)보다 가운데(8)와 아래(9)가 높았거든요. **B가 중앙을 고르지 않을 것**이라는 걸 먼저 확인했기 때문에 A의 선택지가 줄어든 거예요. 반복 제거는 "상대도 합리적이고, 상대도 내가 합리적인 걸 안다"는 가정을 한 단계씩 쌓는 과정이에요.' },
          { type: 'callout', tone: 'warn', title: '약한 지배는 조심해서 지우세요', text: '강한 열등 전략은 어떤 순서로 지워도 같은 결과가 남아요. 하지만 약한 열등 전략(어떤 경우엔 같고 어떤 경우엔 나쁜 선택)은 지우는 순서에 따라 남는 결과가 달라질 수 있고, 지운 선택 중에 내시 균형이 섞여 있을 수도 있어요.' },
        ],
      },
      {
        id: 'two-thirds',
        title: '평균의 3분의 2 맞히기',
        blocks: [
          { type: 'p', text: '여러 사람이 0부터 100 사이 숫자를 하나씩 적어요. 모두가 적은 숫자 평균의 **3분의 2에 가장 가까운** 사람이 이겨요. 무엇을 적어야 할까요?' },
          { type: 'list', ordered: true, items: [
            '평균은 아무리 커도 100이니, 3분의 2는 66.7을 넘을 수 없어요. 그러니 **67 이상을 적는 건 지배당하는 선택**이에요.',
            '모두가 그걸 안다면 평균은 66.7을 넘지 않고, 목표는 44.4 이하가 돼요. 이제 45 이상도 지울 수 있어요.',
            '다시 반복하면 29.6, 19.8, 13.2… 끝까지 가면 **0**만 남아요. 모두가 0을 적는 것이 유일한 균형이에요.',
          ] },
          { type: 'p', text: '경제학자 존 메이너드 케인스는 1936년 책 『고용, 이자, 화폐의 일반 이론』에서 주식 시장을 "내가 예쁘다고 생각하는 사람"이 아니라 "남들이 예쁘다고 생각할 사람"을 고르는 미인 대회에 비유했어요. 그래서 이 게임을 **케인스의 미인 대회**라고도 불러요.' },
          { type: 'h3', text: '사람들은 몇 단계까지 생각할까' },
          { type: 'p', text: '로즈메리 나겔은 1995년 이 게임으로 실험해서, 처음 하는 사람들의 답이 0과는 멀리 떨어져 있고, 많은 답이 "한두 단계" 생각한 숫자 근처(예: 50의 3분의 2인 33 근처, 그 3분의 2인 22 근처)에 몰린다는 것을 보였어요. 같은 사람들이 게임을 반복하면 답이 점점 0에 가까워졌어요.' },
          { type: 'callout', tone: 'tip', title: '균형이 정답은 아니에요', text: '이 게임에서 0을 적은 사람은 균형을 알고 있지만, 대부분 이기지 못해요. 다른 사람들이 0까지 가지 않기 때문이에요. 이길 숫자는 "상대들이 평균적으로 몇 단계까지 생각할까"에 달려 있어요. 열등 전략을 지우는 건 늘 옳지만, 상대가 그 과정을 **몇 번이나 반복할지**는 따로 읽어야 해요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**수를 고르기 전에 지울 수부터 지우세요.** 같은 결과를 더 비싸게 얻는 수, 어떤 경우에도 다른 수보다 나쁜 수를 먼저 빼면 생각할 거리가 줄어요.',
            '**상대도 그 수는 안 둘 거라고 가정하세요.** 상대의 열등 전략을 지우면 상대가 둘 수 있는 수가 줄고, 그만큼 내 계산이 쉬워져요.',
            '**하지만 상대가 몇 단계까지 생각하는지는 따로 판단하세요.** 처음 만난 상대, 시간이 부족한 상대는 한두 단계만 생각하는 경우가 많아요. 너무 깊이 읽으면 오히려 빗나가요.',
            '**우월 전략이 있는 게임이라면 속을 이유가 없어요.** 상대가 무슨 말을 하든 우월 전략은 여전히 우월해요. 대신 그 우월 전략이 둘 다를 손해로 몰고 가는 구조인지(죄수의 딜레마)는 따로 확인하세요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Rosemarie Nagel, "Unraveling in Guessing Games: An Experimental Study", American Economic Review 85(5), 1995' },
      { title: 'John Maynard Keynes, The General Theory of Employment, Interest and Money, Macmillan, 1936', note: '12장 미인 대회 비유' },
      { title: 'Stanford Encyclopedia of Philosophy, "Game Theory"', url: 'https://plato.stanford.edu/entries/game-theory/' },
      { title: 'PUZZLTHINK 흑과 백 II 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'Dominant and dominated strategies — discard the moves to discard first, and the two-thirds game | PUZZLTHINK',
      description: 'A dominant strategy is better whatever the opponent does; a dominated one is always worse. Solving games by deleting dominated strategies step by step, strict versus weak dominance, and how many steps people really reason in "guess two-thirds of the average".',
      keywords: ['dominant strategy', 'dominated strategy', 'iterated elimination', 'two-thirds game', 'Keynesian beauty contest', 'level-k reasoning'],
    },
    title: 'Dominant and dominated strategies',
    lead: 'Before looking for the best move, delete the moves you must never make.',
    intro: [
      'Finding the best move is hard, but finding a move that is **worse in every case** is often easy. Deleting such moves one by one can make a game that looked complicated surprisingly simple.',
      'This article gives the exact meaning of dominant and dominated strategies, shows how to delete dominated strategies repeatedly, and uses "guess two-thirds of the average" to see how far people actually take the method.',
    ],
    summary: 'Moves that are better, or worse, whatever the opponent does, and solving games by deleting the moves to discard.',
    sections: [
      {
        id: 'definitions',
        title: 'Definitions: always better, always worse',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Strictly dominant', def: 'A choice **strictly better** than every other whatever the opponent does. Defecting in [the prisoner’s dilemma](/game-theory/prisoners-dilemma) is the classic case.' },
            { term: 'Weakly dominant', def: 'A choice **never worse**, whatever the opponent does, and sometimes better. Bidding your true value in [a second-price auction](/game-theory/auctions) is an example.' },
            { term: 'Dominated', def: 'A choice worse than some other choice whatever the opponent does.' },
          ] },
          { type: 'p', text: 'With a dominant strategy a game is easy: pick it, no mind-reading required. But most games have none. What helps then is the reverse thought: **"this move is worse than that one in every case, so forget it."**' },
          { type: 'h3', text: 'An example from Black & White II' },
          { type: 'p', text: 'In [Black & White II](/black-white-2), if the leader’s bid shows black, it is 0–9 points, and a follower who bids 10 wins for certain. Bidding 11 or more is then **dominated** by 10: same result (a win), more points spent. Conversely, if you mean to throw the round away, 0 dominates every other losing bid.' },
        ],
      },
      {
        id: 'iterated',
        title: 'Iterated deletion: delete, then delete again',
        blocks: [
          { type: 'p', text: 'Deleting dominated strategies shrinks the game, and in the smaller game new dominated strategies can appear. Repeating to the end is **iterated elimination of dominated strategies**. Follow it in the table below.' },
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['Top', 'Middle', 'Bottom'], cols: ['Left', 'Centre', 'Right'],
            cells: [[[4, 3], [5, 1], [6, 2]], [[2, 1], [8, 4], [3, 6]], [[3, 0], [9, 6], [2, 8]]],
            mark: [[0, 0]],
            caption: 'After iterated deletion only (Top, Left) is left. It is the game’s only Nash equilibrium.',
          },
          { type: 'list', ordered: true, items: [
            '**B’s Centre is dominated by Right.** Against Top, Middle and Bottom, B gets 1, 4, 6 from Centre and 2, 6, 8 from Right, so Right is always higher. Delete Centre.',
            '**Now A’s Middle and Bottom are dominated by Top.** In the remaining columns (Left, Right), A gets 4, 6 from Top, 2, 3 from Middle and 3, 2 from Bottom. Top is always higher, so delete Middle and Bottom.',
            '**Finally B picks Left**, getting 3 against Top rather than 2 from Right.',
          ] },
          { type: 'p', text: 'Note that before step 1, A’s Middle and Bottom were not dominated: in the Centre column they beat Top (8 and 9 against 5). A’s options shrank only after confirming that **B will not play Centre**. Iterated deletion stacks up, one level at a time, the assumption that "the opponent is rational, and knows that I am too".' },
          { type: 'callout', tone: 'warn', title: 'Delete weakly dominated moves with care', text: 'Strictly dominated strategies can be deleted in any order and the same result remains. Weakly dominated ones (sometimes equal, sometimes worse) can leave different results depending on the order, and a deleted choice may even have been part of a Nash equilibrium.' },
        ],
      },
      {
        id: 'two-thirds',
        title: 'Guess two-thirds of the average',
        blocks: [
          { type: 'p', text: 'A group of people each write a number from 0 to 100. Whoever is **closest to two-thirds of the average** wins. What should you write?' },
          { type: 'list', ordered: true, items: [
            'The average is at most 100, so two-thirds of it cannot exceed 66.7. **Writing 67 or more is dominated.**',
            'If everyone knows this, the average is at most 66.7 and the target at most 44.4, so 45 and above can go too.',
            'Repeat: 29.6, 19.8, 13.2… Taken all the way, only **0** survives. Everyone writing 0 is the unique equilibrium.',
          ] },
          { type: 'p', text: 'In his 1936 General Theory of Employment, Interest and Money, John Maynard Keynes compared the stock market to a beauty contest where you pick not the face you find prettiest but the one you think others will. Hence the name **Keynesian beauty contest**.' },
          { type: 'h3', text: 'How many steps do people take?' },
          { type: 'p', text: 'In 1995 Rosemarie Nagel ran this game as an experiment and found that first-time players’ answers were far from 0, with many near numbers reached by one or two steps of reasoning (around 33, two-thirds of 50, and around 22, two-thirds of that). When the same people played again, answers moved steadily towards 0.' },
          { type: 'callout', tone: 'tip', title: 'The equilibrium is not the winning answer', text: 'Players who write 0 know the equilibrium but mostly do not win, because the others do not go all the way to 0. The winning number depends on how many steps the others take on average. Deleting dominated strategies is always right, but **how many times the others repeat it** is something you have to read separately.' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Before choosing, delete what can be deleted.** Remove moves that get the same result at a higher price and moves worse than another in every case, and there is less to think about.',
            '**Assume the opponent will not play those moves either.** Deleting their dominated strategies narrows what they can do and simplifies your calculation.',
            '**But judge separately how many steps they will take.** New opponents and opponents short of time often think only one or two steps. Reading too deep can miss.',
            '**If a game has a dominant strategy, there is no reason to be fooled.** Whatever the opponent says, a dominant strategy stays dominant. Do check, though, whether it drives both of you to a loss (the prisoner’s dilemma).',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Rosemarie Nagel, "Unraveling in Guessing Games: An Experimental Study", American Economic Review 85(5), 1995' },
      { title: 'John Maynard Keynes, The General Theory of Employment, Interest and Money, Macmillan, 1936', note: 'the beauty-contest passage in chapter 12' },
      { title: 'Stanford Encyclopedia of Philosophy, "Game Theory"', url: 'https://plato.stanford.edu/entries/game-theory/' },
      { title: 'PUZZLTHINK Black & White II rules (shown in the game)' },
    ],
  },
};

export default article;
