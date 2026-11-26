import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'minimax-mixed-strategy',
  category: 'basics',
  updated: '2026-11-26',
  games: ['blackWhite', 'indianPoker'],
  related: ['zero-sum', 'nash-equilibrium', 'bluffing', 'colonel-blotto'],
  ko: {
    meta: {
      title: '미니맥스와 혼합 전략 — 가위바위보와 페널티킥에서 섞는 비율 계산하기 | PUZZLTHINK 게임 이론',
      description: '읽히면 지는 게임에서는 섞어야 해요. 폰 노이만의 미니맥스 정리, 페널티킥 보수표로 계산하는 균형 비율, 바위에 보너스를 주면 오히려 보가 늘어나는 가위바위보 변형, 그리고 실제 축구 데이터가 보여 준 것까지.',
      keywords: ['미니맥스', '혼합 전략', '가위바위보 게임 이론', '페널티킥 게임 이론', '미니맥스 정리', '혼합 전략 계산'],
    },
    title: '미니맥스와 혼합 전략',
    lead: '읽히면 지는 게임에서, 섞는 비율에도 정답이 있어요.',
    intro: [
      '가위바위보에서 "나는 늘 바위"라고 정한 사람은 곧 상대에게 보로 털려요. 페널티킥에서 늘 같은 쪽으로 차는 키커는 골키퍼에게 막혀요. 이런 게임에서는 어떤 한 수도 그 자체로 좋은 수가 아니에요. 상대가 모르게 **섞는 것**이 전략이에요.',
      '그런데 아무렇게나 섞으면 될까요? 이 글에서는 섞는 비율을 계산하는 법과, 그 비율이 내 점수가 아니라 **상대의 점수**로 정해진다는 놀라운 사실을 살펴봐요.',
    ],
    summary: '읽히면 지는 게임에서 섞는 비율을 계산하는 법. 페널티킥과 가위바위보 변형으로.',
    sections: [
      {
        id: 'minimax',
        title: '미니맥스: 최악을 최대한 좋게',
        blocks: [
          { type: 'p', text: '한쪽이 얻는 만큼 다른 쪽이 잃는 2인 제로섬 게임을 생각해 봐요. 신중한 사람은 이렇게 생각할 거예요. "내가 어떤 전략을 쓰든 상대는 나에게 가장 나쁜 대응을 할 거야. 그렇다면 최악의 경우가 가장 덜 나쁜 전략을 고르자." 이것이 **최소 최대화(maximin)**, 흔히 미니맥스라고 부르는 사고방식이에요.' },
          { type: 'p', text: '존 폰 노이만은 1928년 논문에서 **미니맥스 정리**를 증명했어요. 2인 제로섬 게임에서 혼합 전략을 허용하면, "내가 보장할 수 있는 최소 점수의 최댓값"과 "상대가 나에게 허용할 수밖에 없는 최대 점수의 최솟값"이 항상 같다는 정리예요. 이 같은 값을 **게임의 값**이라고 해요. 즉 두 사람이 모두 신중하게 두면 결과는 정해진 값으로 수렴하고, 그 값을 보장하는 전략이 있어요.' },
          { type: 'callout', tone: 'note', title: '왜 "혼합"이 꼭 필요할까', text: '가위바위보에서 순수 전략(바위만, 보만…)으로는 최악의 경우가 늘 "짐"이에요. 하지만 셋을 1/3씩 섞으면 상대가 무엇을 내든 기대 점수가 0이에요. 섞기를 허용해야 비로소 양쪽의 보장값이 만나요.' },
        ],
      },
      {
        id: 'penalty',
        title: '페널티킥 보수표',
        blocks: [
          { type: 'p', text: '키커는 왼쪽이나 오른쪽으로 차고, 골키퍼는 동시에 왼쪽이나 오른쪽으로 몸을 날려요(키커 기준 방향). 표의 숫자는 골이 들어갈 확률(%)이에요. 키커는 이 값을 높이고 싶고, 골키퍼는 낮추고 싶어요.' },
          {
            type: 'matrix', rowPlayer: '키커', colPlayer: '골키퍼', rows: ['왼쪽으로 참', '오른쪽으로 참'], cols: ['왼쪽으로 뜀', '오른쪽으로 뜀'],
            cells: [[[50, 50], [90, 10]], [[80, 20], [60, 40]]],
            caption: '(골 확률 %, 막을 확률 %). 한쪽이 얻는 만큼 다른 쪽이 잃는 제로섬 게임이고, 순수 전략 균형은 없어요.',
          },
          { type: 'p', text: '어느 칸도 균형이 아니에요. 골키퍼가 늘 왼쪽으로 뜨면 키커는 오른쪽(80%)으로, 그러면 골키퍼는 오른쪽(60%)으로, 그러면 키커는 왼쪽(90%)으로… 끝없이 돌아요. 그래서 섞어야 해요.' },
          { type: 'h3', text: '골키퍼의 비율은 키커의 숫자로 정해져요' },
          { type: 'p', text: '골키퍼가 왼쪽으로 뜨는 확률을 q라고 해요. 골키퍼는 키커가 어느 쪽으로 차도 골 확률이 같아지도록 q를 정해야 해요. 그래야 키커가 한쪽을 노려 이득을 볼 수 없어요. 왼쪽으로 차면 50q + 90(1 − q), 오른쪽으로 차면 80q + 60(1 − q)이니, 두 값이 같아지는 q = 1/2이에요. 이때 골 확률은 70%예요.' },
          { type: 'h3', text: '키커의 비율은 골키퍼의 숫자로 정해져요' },
          { type: 'p', text: '키커가 왼쪽으로 차는 확률을 p라고 해요. 이번에는 골키퍼가 어느 쪽으로 떠도 같아지게 해야 해요. 골키퍼가 왼쪽으로 뜨면 50p + 80(1 − p), 오른쪽이면 90p + 60(1 − p)이니 p = 1/3이에요. 확인해 보면 둘 다 70%예요. 이 게임의 값은 **골 확률 70%**예요.' },
          { type: 'callout', tone: 'tip', title: '직관과 다른 결론', text: '키커는 왼쪽으로 찼을 때 골키퍼가 못 막으면 90%나 들어가는데도, 균형에서는 왼쪽을 1/3만 차요. 왼쪽이 "막혔을 때 손해(50%)"가 더 크기 때문이에요. 혼합 전략 균형에서 **내 비율은 상대를 무관심하게 만들도록 정해져요.** 그래서 내 비율을 결정하는 건 내 숫자가 아니라 상대 입장의 숫자예요.' },
        ],
      },
      {
        id: 'evidence',
        title: '프로 선수들은 정말 섞을까',
        blocks: [
          { type: 'p', text: '페널티킥은 혼합 전략 이론을 현실에서 시험하기 좋은 무대예요. 거의 동시에 결정하고, 결과가 분명하고, 기록이 많거든요. 피에르앙드레 키아포리, 스티븐 레빗, 팀 그로스클로스는 2002년 프랑스와 이탈리아 리그 자료로, 이그나시오 팔라시오스우에르타는 2003년 여러 유럽 리그의 더 많은 자료로 이 문제를 연구했어요.' },
          { type: 'p', text: '두 연구 모두 이론과 잘 맞는 결과를 보고했어요. 키커가 어느 쪽으로 차든 골 확률이 통계적으로 비슷했고(균형이라면 그래야 해요), 선수들의 선택이 이전 킥에 끌려가는 패턴도 뚜렷하지 않았어요. 팔라시오스우에르타의 논문 제목이 「프로는 미니맥스를 쓴다」인 이유예요.' },
          { type: 'callout', tone: 'warn', title: '한계', text: '이 결과가 "사람은 늘 혼합 전략 균형대로 움직인다"는 뜻은 아니에요. 오랜 경험과 큰 보상이 있는 프로의 경우에 잘 맞았다는 것이고, 실험실에서 일반인을 대상으로 한 연구에서는 사람들이 "무작위"를 흉내 낼 때 같은 선택을 너무 피하거나 너무 자주 바꾸는 경향이 자주 보고돼요.' },
        ],
      },
      {
        id: 'rps-variant',
        title: '가위바위보 변형: 바위에 보너스를 주면',
        blocks: [
          { type: 'p', text: '평범한 가위바위보의 균형은 셋을 1/3씩 내는 거예요. 이제 규칙을 바꿔서 **바위로 이기면 2점**, 나머지 승리는 1점이라고 해 봐요(진 사람은 그만큼 잃어요). 바위가 매력적이니 바위를 더 내야 할까요?' },
          {
            type: 'matrix', rowPlayer: '나', colPlayer: '상대', rows: ['바위', '보', '가위'], cols: ['바위', '보', '가위'],
            cells: [[[0, 0], ['−1', 1], [2, '−2']], [[1, '−1'], [0, 0], ['−1', 1]], [['−2', 2], [1, '−1'], [0, 0]]],
            caption: '바위로 가위를 이기면 2점. 균형은 바위 1/4, 보 1/2, 가위 1/4이에요.',
          },
          { type: 'p', text: '상대가 바위·보·가위를 r, p, s 비율로 낸다고 할 때, 내가 무엇을 내도 기대 점수가 같아야 해요. 바위를 내면 −p + 2s, 보를 내면 r − s, 가위를 내면 −2r + p예요. 대칭 게임이라 게임의 값은 0이니, 세 식을 모두 0으로 놓으면 r = s, p = 2s가 나와요. 즉 **바위 1/4, 보 1/2, 가위 1/4**이에요.' },
          { type: 'p', text: '바위에 보너스를 줬더니 바위는 오히려 줄고 **보가 늘어났어요.** 보너스 때문에 손해가 커진 쪽은 바위에 지는 가위예요. 가위가 줄면 바위의 이점도 줄고, 바위를 노리는 보가 늘어나요. 규칙의 작은 변화가 비율 전체를 움직이는 거예요. 게임 디자이너들이 "이 수를 강하게 만들면 무엇이 늘어날까"를 따질 때 쓰는 생각이기도 해요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**섞을 때는 머리 대신 장치를 쓰세요.** 사람은 무작위를 잘 못 만들어요. 시계 초침, 마음속으로 정한 숫자 규칙처럼 내 감정과 상관없는 기준으로 고르면 패턴이 덜 생겨요.',
            '**상대가 무관심해지는 비율을 찾으세요.** "내가 가장 좋아하는 수"가 아니라 "상대가 어느 쪽을 골라도 같은 결과가 나오게 하는 비율"이 방어적인 기준이에요.',
            '**상대가 섞지 못한다면 이용하세요.** 균형 비율은 상대를 모를 때의 안전한 기준이에요. 상대가 한쪽에 치우쳐 있으면 그쪽을 공략하는 게 더 벌어요. 다만 나도 같은 방식으로 읽힐 수 있다는 걸 기억하세요.',
            '[흑과 백](/black-white)에서 먼저 타일을 내는 사람은 흑(짝수)과 백(홀수) 중 하나를 보여 줘야 해요. 큰 타일을 낼 때 늘 같은 색이면 색만으로 읽혀요. [인디언 포커](/indian-poker)에서도 베팅 크기의 패턴이 곧 정보가 되니, 강할 때와 약할 때의 행동을 일정 비율로 섞어 주세요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'John von Neumann, "Zur Theorie der Gesellschaftsspiele", Mathematische Annalen 100, 1928' },
      { title: 'P.-A. Chiappori, S. Levitt, T. Groseclose, "Testing Mixed-Strategy Equilibria When Players Are Heterogeneous: The Case of Penalty Kicks in Soccer", American Economic Review 92(4), 2002' },
      { title: 'Ignacio Palacios-Huerta, "Professionals Play Minimax", Review of Economic Studies 70(2), 2003' },
      { title: 'Stanford Encyclopedia of Philosophy, "Game Theory"', url: 'https://plato.stanford.edu/entries/game-theory/' },
    ],
  },
  en: {
    meta: {
      title: 'Minimax and mixed strategies — computing the mix in rock–paper–scissors and penalty kicks | PUZZLTHINK',
      description: 'In games where being read means losing, you must mix. Von Neumann’s minimax theorem, the equilibrium mix in a penalty-kick table, a rock–paper–scissors variant where a bonus for rock makes paper more common, and what real football data showed.',
      keywords: ['minimax', 'mixed strategy', 'rock paper scissors game theory', 'penalty kick game theory', 'minimax theorem', 'mixed strategy calculation'],
    },
    title: 'Minimax and mixed strategies',
    lead: 'In games where being read means losing, even the mix has a right answer.',
    intro: [
      'Decide "I always play rock" at rock–paper–scissors and paper soon cleans you out. A penalty taker who always shoots the same way gets saved. In such games no single move is good on its own; **mixing** unpredictably is the strategy.',
      'But will any mix do? This article shows how to compute the mix, and the surprising fact that your mix is fixed by **your opponent’s payoffs**, not your own.',
    ],
    summary: 'How to compute the mix in games where being read means losing, with penalty kicks and a rock–paper–scissors variant.',
    sections: [
      {
        id: 'minimax',
        title: 'Minimax: make the worst case as good as possible',
        blocks: [
          { type: 'p', text: 'Take a two-player zero-sum game, where one side gains exactly what the other loses. A cautious player reasons: "whatever I do, my opponent will answer in the way that hurts me most, so let me pick the strategy whose worst case is least bad." That is **maximin**, often loosely called minimax.' },
          { type: 'p', text: 'In a 1928 paper John von Neumann proved the **minimax theorem**: in a two-player zero-sum game with mixed strategies allowed, the most I can guarantee myself equals the least my opponent can hold me to. That common number is the **value of the game**. If both play carefully, the result settles at that value, and there are strategies that guarantee it.' },
          { type: 'callout', tone: 'note', title: 'Why mixing is essential', text: 'In rock–paper–scissors, any pure strategy (only rock, only paper…) has "lose" as its worst case. Mixing the three at 1/3 each gives an expected score of 0 whatever the opponent plays. Only once mixing is allowed do the two guarantees meet.' },
        ],
      },
      {
        id: 'penalty',
        title: 'A penalty-kick table',
        blocks: [
          { type: 'p', text: 'The kicker shoots left or right; the goalkeeper dives left or right at the same moment (directions from the kicker’s view). The numbers are the chances of a goal. The kicker wants them high, the goalkeeper low.' },
          {
            type: 'matrix', rowPlayer: 'Kicker', colPlayer: 'Goalkeeper', rows: ['Shoots left', 'Shoots right'], cols: ['Dives left', 'Dives right'],
            cells: [[[50, 50], [90, 10]], [[80, 20], [60, 40]]],
            caption: '(chance of a goal %, chance of a save %). What one side gains the other loses, and there is no pure-strategy equilibrium.',
          },
          { type: 'p', text: 'No cell is an equilibrium. If the keeper always dives left, the kicker shoots right (80%); then the keeper dives right (60%); then the kicker shoots left (90%)… round and round. So both must mix.' },
          { type: 'h3', text: 'The keeper’s mix is set by the kicker’s numbers' },
          { type: 'p', text: 'Let q be the chance the keeper dives left. The keeper must choose q so the kicker scores equally often whichever way he shoots; otherwise the kicker aims at the better side. Shooting left scores 50q + 90(1 − q), shooting right 80q + 60(1 − q); they are equal at q = 1/2, where the scoring chance is 70%.' },
          { type: 'h3', text: 'The kicker’s mix is set by the keeper’s numbers' },
          { type: 'p', text: 'Let p be the chance the kicker shoots left. Now the keeper must be indifferent: diving left concedes 50p + 80(1 − p), diving right 90p + 60(1 − p), equal at p = 1/3. Both come to 70%. The value of this game is a **70% scoring chance**.' },
          { type: 'callout', tone: 'tip', title: 'A counter-intuitive result', text: 'Shooting left scores 90% when the keeper guesses wrong, yet in equilibrium the kicker shoots left only a third of the time, because being guessed on the left costs more (down to 50%). In a mixed equilibrium **your mix is chosen to make the opponent indifferent**, so it is set by the numbers on the opponent’s side, not your own.' },
        ],
      },
      {
        id: 'evidence',
        title: 'Do professionals really mix?',
        blocks: [
          { type: 'p', text: 'Penalty kicks are an ideal test of mixed-strategy theory: decisions are nearly simultaneous, outcomes are clear and records are plentiful. Pierre-André Chiappori, Steven Levitt and Tim Groseclose studied French and Italian league data in 2002, and Ignacio Palacios-Huerta studied a larger set of professional matches in 2003.' },
          { type: 'p', text: 'Both reported results that fit the theory well. Scoring rates were statistically similar whichever side the kicker chose (as they must be in equilibrium), and choices showed no clear tendency to follow the previous kick. Hence the title of Palacios-Huerta’s paper, "Professionals Play Minimax".' },
          { type: 'callout', tone: 'warn', title: 'Limits', text: 'This does not mean people always play mixed equilibria. It fits professionals with long experience and high stakes. Laboratory studies of ordinary people often report that when they try to act randomly, they avoid repeating a choice too much or switch too often.' },
        ],
      },
      {
        id: 'rps-variant',
        title: 'A rock–paper–scissors variant: give rock a bonus',
        blocks: [
          { type: 'p', text: 'Ordinary rock–paper–scissors has the equilibrium 1/3 each. Now change the rules: **winning with rock scores 2**, other wins score 1 (the loser loses as much). Rock looks attractive, so should you play more of it?' },
          {
            type: 'matrix', rowPlayer: 'Me', colPlayer: 'Opponent', rows: ['Rock', 'Paper', 'Scissors'], cols: ['Rock', 'Paper', 'Scissors'],
            cells: [[[0, 0], ['−1', 1], [2, '−2']], [[1, '−1'], [0, 0], ['−1', 1]], [['−2', 2], [1, '−1'], [0, 0]]],
            caption: 'Rock beating scissors scores 2. The equilibrium is rock 1/4, paper 1/2, scissors 1/4.',
          },
          { type: 'p', text: 'If the opponent plays rock, paper and scissors in proportions r, p and s, every one of my options must earn the same. Rock earns −p + 2s, paper r − s, scissors −2r + p. The game is symmetric, so its value is 0; setting all three to zero gives r = s and p = 2s: **rock 1/4, paper 1/2, scissors 1/4**.' },
          { type: 'p', text: 'The bonus for rock made rock rarer and **paper more common**. The one put at risk by rock is the scissors player; with fewer scissors rock gains less, and paper, which preys on rock, grows. A small rule change moves the whole mix — the kind of reasoning game designers use when they ask "if I make this move stronger, what becomes more common?"' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Mix with a device, not your gut.** People are bad at being random. Choosing by something unrelated to your feelings, such as the second hand of a clock or a number rule fixed in advance, leaves fewer patterns.',
            '**Find the mix that leaves the opponent indifferent.** Not your favourite move, but the proportions that make every reply of theirs equally good, is the defensive baseline.',
            '**Exploit opponents who cannot mix.** The equilibrium mix is the safe choice against an unknown opponent. If one leans one way, attacking that lean earns more — but remember you can be read the same way.',
            'In [Black & White](/black-white) the player who leads must show black (even) or white (odd). If your big tiles always come in the same colour, the colour alone gives you away. In [Indian Poker](/indian-poker) the pattern of your bet sizes is information too, so mix your behaviour with strong and weak hands in steady proportions.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'John von Neumann, "Zur Theorie der Gesellschaftsspiele", Mathematische Annalen 100, 1928' },
      { title: 'P.-A. Chiappori, S. Levitt, T. Groseclose, "Testing Mixed-Strategy Equilibria When Players Are Heterogeneous: The Case of Penalty Kicks in Soccer", American Economic Review 92(4), 2002' },
      { title: 'Ignacio Palacios-Huerta, "Professionals Play Minimax", Review of Economic Studies 70(2), 2003' },
      { title: 'Stanford Encyclopedia of Philosophy, "Game Theory"', url: 'https://plato.stanford.edu/entries/game-theory/' },
    ],
  },
};

export default article;
