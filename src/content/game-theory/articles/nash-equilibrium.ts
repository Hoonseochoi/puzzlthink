import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'nash-equilibrium',
  category: 'basics',
  updated: '2026-11-26',
  games: ['indianPoker', 'blackWhite'],
  related: ['dominant-strategy', 'minimax-mixed-strategy', 'prisoners-dilemma', 'stag-hunt'],
  ko: {
    meta: {
      title: '내시 균형 쉽게 이해하기 — 아무도 혼자 바꾸고 싶지 않은 상태 | PUZZLTHINK 게임 이론',
      description: '내시 균형은 "상대가 그대로라면 나도 바꿀 이유가 없는" 선택의 조합이에요. 최선 응답 표시법, 균형이 여러 개인 경우, 혼합 전략 균형까지 작은 보수표로 직접 찾아봐요.',
      keywords: ['내시 균형', '내시균형 뜻', '내시 균형 예시', '최선 응답', '게임 이론 기초', '혼합 전략 균형'],
    },
    title: '내시 균형',
    lead: '모두가 "상대가 이대로라면 나도 이대로가 낫다"고 생각하는 지점.',
    intro: [
      '두뇌 게임을 하다 보면 이런 생각을 자주 하게 돼요. "쟤가 저걸 낼 걸 알면 나는 이걸 내야지. 그런데 쟤도 내가 그렇게 생각할 걸 알 텐데…" 생각이 끝없이 돌고 도는 것 같지만, 게임 이론에는 이 고리가 멈추는 지점을 가리키는 이름이 있어요. 바로 **내시 균형**이에요.',
      '이 글에서는 내시 균형이 정확히 무엇인지, 보수표에서 어떻게 찾는지, 그리고 균형이 "좋은 결과"와 왜 다른지를 차례로 살펴봐요.',
    ],
    summary: '상대가 그대로라면 나도 바꿀 이유가 없는 선택의 조합. 보수표에서 균형을 직접 찾는 법.',
    sections: [
      {
        id: 'situation',
        title: '상황: 세 개의 버튼',
        blocks: [
          { type: 'p', text: '두 참가자 A와 B가 칸막이를 사이에 두고 동시에 버튼 하나씩을 눌러요. 버튼은 가·나·다 세 개예요. 가와 나는 일종의 눈치 게임이라, 상대가 무엇을 눌렀는지에 따라 큰 점수를 얻거나 한 푼도 못 받아요. 다는 크게 벌지는 못하지만 비교적 안전한 선택이에요. 점수는 아래 표와 같아요.' },
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['가', '나', '다'], cols: ['가', '나', '다'],
            cells: [[[0, 4], [4, 0], [1, 3]], [[4, 0], [0, 4], [1, 3]], [[3, 1], [3, 1], [2, 2]]],
            mark: [[2, 2]],
            caption: '각 칸은 (A의 점수, B의 점수). 강조한 칸 (다, 다)가 이 게임의 유일한 순수 전략 내시 균형이에요.',
          },
          { type: 'p', text: '표를 보면 가·나 칸에서는 한 사람이 4점, 다른 사람이 0점이에요. 누가 4점을 가져갈지는 서로의 수를 맞히느냐에 달려 있어요. 반면 (다, 다)에서는 둘 다 2점으로, 화려하지는 않지만 안정적이에요.' },
        ],
      },
      {
        id: 'definition',
        title: '정의: 혼자서는 바꿀 이유가 없는 상태',
        blocks: [
          { type: 'p', text: '내시 균형은 **모든 참가자가, 다른 사람의 선택이 그대로라는 전제에서, 자기 선택을 바꿔도 이득을 볼 수 없는 선택의 조합**이에요. 핵심은 "혼자서"예요. 둘이 짜고 동시에 바꾸면 더 나아지는 경우가 있어도, 혼자 바꿔서 나아지지 않는다면 균형이에요.' },
          { type: 'p', text: '이 개념은 수학자 존 내시가 1950년 미국 국립과학원회보(PNAS)에 실은 짧은 논문과 1951년 논문에서 정리했어요. 그 전까지 폰 노이만과 모르겐슈테른의 이론은 주로 2인 제로섬 게임을 다뤘는데, 내시는 참가자 수와 점수 구조에 제한이 없는 게임으로 균형 개념을 넓혔어요. 특히 **유한한 게임에는 (혼합 전략까지 허용하면) 균형이 적어도 하나 존재한다**는 것을 증명했어요. 이 업적으로 내시는 1994년 하사니, 젤텐과 함께 노벨 경제학상을 받았어요.' },
          { type: 'h3', text: '찾는 법: 최선 응답에 표시하기' },
          { type: 'list', ordered: true, items: [
            'B의 선택 하나(표의 열 하나)를 고정하고, 그때 A가 가장 많이 받는 칸을 찾아 표시해요. 이것이 A의 **최선 응답**이에요.',
            '모든 열에 대해 반복해요. 위 표에서 B가 가면 A는 나(4점), B가 나면 A는 가(4점), B가 다면 A는 다(2점)가 최선이에요.',
            '이번에는 A의 선택(행)을 하나씩 고정하고 B의 최선 응답을 표시해요. A가 가면 B는 가(4점), 나면 나(4점), 다면 다(2점)예요.',
            '두 사람의 표시가 **겹치는 칸**이 순수 전략 내시 균형이에요. 위 표에서는 (다, 다) 하나뿐이에요.',
          ] },
          { type: 'p', text: '(가, 가)를 확인해 볼까요? B는 4점을 받아 만족하지만, A는 0점이라 나로 바꾸면 4점을 받아요. 그러니 균형이 아니에요. 가와 나가 얽힌 네 칸은 늘 누군가 0점이라, 그 사람이 바꾸고 싶어 해요. 생각이 "돌고 도는" 구간이 바로 여기예요. 반면 (다, 다)에서는 A가 가나 나로 바꿔 봐야 1점이 되고, B도 마찬가지예요.' },
        ],
      },
      {
        id: 'many',
        title: '균형이 여러 개일 때: 약속 장소 게임',
        blocks: [
          { type: 'p', text: '균형이 늘 하나인 건 아니에요. 친구 둘이 휴대폰 배터리가 꺼진 채로 만나야 한다고 해 봐요. 후보는 강남역과 홍대입구역이에요. A는 강남을, B는 홍대를 조금 더 좋아하지만, 무엇보다 **만나는 것**이 중요해요.' },
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['강남', '홍대'], cols: ['강남', '홍대'],
            cells: [[[2, 1], [0, 0]], [[0, 0], [1, 2]]],
            mark: [[0, 0], [1, 1]],
            caption: '(강남, 강남)과 (홍대, 홍대) 둘 다 순수 전략 내시 균형이에요. 엇갈리면 둘 다 0점.',
          },
          { type: 'p', text: '두 칸 모두 혼자 바꾸면 0점이 되니 균형이에요. 그런데 이론은 둘 중 어느 쪽이 일어날지 말해 주지 않아요. 이때 실제로 결과를 가르는 건 "지난번에 강남에서 만났지", "보통 큰 역에서 만나잖아" 같은 **눈에 띄는 기준**이에요. 경제학자 토머스 셸링은 1960년 책 『갈등의 전략』에서 이런 기준을 **초점(focal point)**이라고 불렀어요.' },
          { type: 'h3', text: '숨은 세 번째 균형' },
          { type: 'p', text: '이 게임에는 순수 전략 균형 말고 **혼합 전략 균형**도 하나 더 있어요. A가 강남을 2/3 확률로, B가 강남을 1/3 확률로 고르는 경우예요. 계산해 보면, B가 이렇게 섞으면 A는 강남에서 2 × 1/3 = 2/3점, 홍대에서 1 × 2/3 = 2/3점으로 어느 쪽이든 기대 점수가 같아서 섞는 것을 바꿀 이유가 없어요. B 쪽도 같은 방식으로 맞아떨어져요.' },
          { type: 'callout', tone: 'note', title: '균형인데 둘 다 손해', text: '혼합 전략 균형에서 두 사람의 기대 점수는 각각 2/3점이에요. 어느 순수 균형(최소 1점)보다도 낮아요. 서로 상대에 맞춰 섞다 보니 엇갈릴 확률이 5/9나 되기 때문이에요. 균형은 "안정된 상태"이지 "좋은 상태"가 아니라는 걸 잘 보여 줘요.' },
        ],
      },
      {
        id: 'limits',
        title: '균형이 말해 주는 것과 말해 주지 않는 것',
        blocks: [
          { type: 'list', items: [
            '**균형은 최선의 결과가 아니에요.** 「[죄수의 딜레마](/game-theory/prisoners-dilemma)」에서는 유일한 균형이 두 사람 모두에게 더 나쁜 결과예요.',
            '**균형은 예측이라기보다 정지 조건이에요.** 모두가 서로의 전략을 정확히 예상하고 있다면 그 상태에서 벗어날 사람이 없다는 뜻이지, 처음 만난 사람들이 곧바로 그곳에 도착한다는 뜻은 아니에요.',
            '**사람은 단계적으로 생각해요.** "상대 수의 3분의 2를 맞히기"처럼 균형을 찾으려면 생각을 여러 번 반복해야 하는 게임에서, 처음 하는 사람들의 답은 균형(0)과 꽤 떨어져 있고 같은 게임을 반복하면 점점 가까워진다는 실험 결과가 잘 알려져 있어요(로즈메리 나겔, 1995).',
            '**혼합 전략 균형은 "운에 맡기라"는 뜻이 아니에요.** 상대가 내 패턴을 이용할 수 없도록 섞는 비율이 정해져 있다는 뜻이에요. 자세한 내용은 「[미니맥스와 혼합 전략](/game-theory/minimax-mixed-strategy)」에서 다뤄요.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'p', text: '실전에서 내시 균형을 계산할 일은 드물지만, 균형의 정의 자체가 아주 쓸모 있는 점검표가 돼요. **"상대가 내 방식을 완전히 안다고 해도, 나는 이 방식을 유지할 것인가?"** 이 질문에 "아니요"라면, 내 전략은 읽히는 순간 무너지는 전략이에요.' },
          { type: 'list', items: [
            '[인디언 포커](/indian-poker)에서는 내 카드는 못 보고 상대 카드만 보여요. 그런데 내가 "상대 카드가 낮으면 크게, 높으면 작게"만 건다면, 상대는 내 베팅 크기만 보고 자기 카드를 거의 알아낼 수 있어요. 읽히는 순간 무너지는 전략이죠. 반대로 상대 습관이 뻔히 보인다면 균형에서 벗어나 그 습관을 공략하는 편이 더 벌어요. 균형은 상대를 모를 때의 안전한 기준선이에요.',
            '[흑과 백](/black-white)처럼 서로의 수를 읽는 게임에서 위 표의 가·나 구간 같은 "돌고 도는" 상황이 오면, 특정 수에 집착하지 말고 상대가 내 경향을 이용하지 못하게 고르는 것이 기본이에요.',
            '여러 명이 같이 하는 게임에서 균형이 여러 개라면, 다른 사람이 "당연히 그쪽이지"라고 생각할 만한 초점을 먼저 떠올려 보세요. 서로 말을 못 하는 상황일수록 초점이 결과를 정해요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'John F. Nash, "Equilibrium Points in n-Person Games", PNAS 36(1), 1950', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1063129/' },
      { title: 'John Nash, "Non-Cooperative Games", Annals of Mathematics 54(2), 1951' },
      { title: 'Thomas C. Schelling, The Strategy of Conflict, Harvard University Press, 1960', note: '초점(focal point)' },
      { title: 'Rosemarie Nagel, "Unraveling in Guessing Games: An Experimental Study", American Economic Review 85(5), 1995' },
      { title: 'The Nobel Prize in Economic Sciences 1994 (Harsanyi, Nash, Selten)', url: 'https://www.nobelprize.org/prizes/economic-sciences/1994/summary/' },
    ],
  },
  en: {
    meta: {
      title: 'Nash equilibrium explained — the point where nobody wants to switch alone | PUZZLTHINK',
      description: 'A Nash equilibrium is a set of choices where nobody gains by changing their own choice while the others stay put. Find equilibria in small payoff tables by marking best responses, and meet multiple and mixed equilibria.',
      keywords: ['Nash equilibrium', 'Nash equilibrium example', 'best response', 'game theory basics', 'mixed strategy equilibrium', 'focal point'],
    },
    title: 'Nash equilibrium',
    lead: 'The point where everyone thinks, "if they stay as they are, so should I."',
    intro: [
      'Play enough mind games and you will catch yourself thinking: "If I know they will play that, I should play this. But they know I think that, so…" The reasoning seems to spin forever, but game theory has a name for the place where it stops: the **Nash equilibrium**.',
      'This article covers what a Nash equilibrium is, how to find one in a payoff table, and why an equilibrium is not the same thing as a good outcome.',
    ],
    summary: 'A set of choices nobody wants to change alone. How to find equilibria in a payoff table by hand.',
    sections: [
      {
        id: 'situation',
        title: 'The situation: three buttons',
        blocks: [
          { type: 'p', text: 'Two players, A and B, sit on either side of a screen and each press one button at the same time: X, Y or Z. X and Y are a guessing game: depending on what the other pressed, you either score big or get nothing. Z never pays much, but it is comparatively safe. The points are below.' },
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['X', 'Y', 'Z'], cols: ['X', 'Y', 'Z'],
            cells: [[[0, 4], [4, 0], [1, 3]], [[4, 0], [0, 4], [1, 3]], [[3, 1], [3, 1], [2, 2]]],
            mark: [[2, 2]],
            caption: 'Each cell is (A’s points, B’s points). The highlighted cell (Z, Z) is the only pure-strategy Nash equilibrium.',
          },
          { type: 'p', text: 'In the X/Y cells one player gets 4 and the other 0, and who gets the 4 depends on reading the other correctly. In (Z, Z) both get 2: not glamorous, but stable.' },
        ],
      },
      {
        id: 'definition',
        title: 'The definition: no reason to switch alone',
        blocks: [
          { type: 'p', text: 'A Nash equilibrium is **a combination of choices in which no player can gain by changing their own choice, given that everyone else keeps theirs**. The key word is "alone". Even if two players could both do better by switching together, the combination is an equilibrium as long as no single player gains by switching on their own.' },
          { type: 'p', text: 'The mathematician John Nash set out the idea in a short 1950 paper in the Proceedings of the National Academy of Sciences and a 1951 paper. Von Neumann and Morgenstern’s theory had mostly dealt with two-player zero-sum games; Nash extended the notion of equilibrium to games with any number of players and any payoffs, and proved that **every finite game has at least one equilibrium once mixed strategies are allowed**. He shared the 1994 Nobel Memorial Prize in Economic Sciences with Harsanyi and Selten for this work.' },
          { type: 'h3', text: 'How to find one: mark the best responses' },
          { type: 'list', ordered: true, items: [
            'Fix one choice of B (one column) and mark the cell where A scores most. That is A’s **best response** to it.',
            'Repeat for every column. Above, if B plays X, A’s best is Y (4); if B plays Y, A’s best is X (4); if B plays Z, A’s best is Z (2).',
            'Now fix each of A’s choices (rows) and mark B’s best response: X against X (4), Y against Y (4), Z against Z (2).',
            'Any cell marked **for both players** is a pure-strategy Nash equilibrium. Above there is just one: (Z, Z).',
          ] },
          { type: 'p', text: 'Check (X, X): B is happy with 4, but A has 0 and would get 4 by switching to Y, so it is not an equilibrium. In the four X/Y cells somebody always has 0 and wants to move; that is the "spinning" part of the reasoning. In (Z, Z), A switching to X or Y drops to 1, and the same goes for B.' },
        ],
      },
      {
        id: 'many',
        title: 'More than one equilibrium: the meeting game',
        blocks: [
          { type: 'p', text: 'There is not always just one equilibrium. Two friends must meet with their phones dead. The options are the north station and the south station. A slightly prefers north, B slightly prefers south, but above all they want to **meet**.' },
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['North', 'South'], cols: ['North', 'South'],
            cells: [[[2, 1], [0, 0]], [[0, 0], [1, 2]]],
            mark: [[0, 0], [1, 1]],
            caption: '(North, North) and (South, South) are both pure-strategy Nash equilibria. Missing each other gives both 0.',
          },
          { type: 'p', text: 'In both cells, switching alone drops you to 0, so both are equilibria, and the theory alone does not say which one happens. In practice the outcome is settled by something that stands out — "we met there last time", "people meet at the bigger station". The economist Thomas Schelling, in his 1960 book The Strategy of Conflict, called such a cue a **focal point**.' },
          { type: 'h3', text: 'The hidden third equilibrium' },
          { type: 'p', text: 'The game also has a **mixed-strategy equilibrium**: A picks north with probability 2/3 and B picks north with probability 1/3. If B mixes like that, A expects 2 × 1/3 = 2/3 at north and 1 × 2/3 = 2/3 at south, the same either way, so A has no reason to change the mix; B’s side works out the same way.' },
          { type: 'callout', tone: 'note', title: 'An equilibrium that hurts both', text: 'In the mixed equilibrium each friend expects 2/3, less than in either pure equilibrium (at least 1). Mixing against each other, they miss with probability 5/9. An equilibrium is a stable state, not a good one.' },
        ],
      },
      {
        id: 'limits',
        title: 'What an equilibrium does and does not tell you',
        blocks: [
          { type: 'list', items: [
            '**An equilibrium is not the best outcome.** In [the prisoner’s dilemma](/game-theory/prisoners-dilemma) the only equilibrium is worse for both players.',
            '**It is a resting condition more than a forecast.** If everyone correctly expects everyone else’s strategy, nobody wants to leave. That does not mean strangers land there straight away.',
            '**People reason in steps.** In games where reaching the equilibrium takes many rounds of "they think that I think…", such as guessing two-thirds of the average, first-time players answer well away from the equilibrium (0) and move closer as the game is repeated — a well-known experimental finding (Rosemarie Nagel, 1995).',
            '**A mixed equilibrium does not mean "leave it to luck".** It means there is a specific mix that leaves the other side nothing to exploit. See [Minimax and mixed strategies](/game-theory/minimax-mixed-strategy).',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'p', text: 'You will rarely compute an equilibrium at the table, but the definition is a superb checklist: **"If my opponent knew exactly how I play, would I still play this way?"** If the answer is no, your strategy collapses the moment it is read.' },
          { type: 'list', items: [
            'In [Indian Poker](/indian-poker) you see only the opponent’s card, never your own. If you bet big only when their card is low and small when it is high, they can work out their own card from the size of your bet alone: a strategy that collapses once read. Conversely, if an opponent’s habit is obvious, leaving equilibrium to exploit it earns more. Equilibrium play is the safe baseline when you do not know the opponent.',
            'In games of reading each other such as [Black & White](/black-white), when you hit a spinning X/Y situation like the one above, do not get attached to one move; choose so that the opponent cannot exploit your tendencies.',
            'In multiplayer games with several equilibria, think first of the focal point others will consider "obvious". The less people can talk, the more the focal point decides.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'John F. Nash, "Equilibrium Points in n-Person Games", PNAS 36(1), 1950', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1063129/' },
      { title: 'John Nash, "Non-Cooperative Games", Annals of Mathematics 54(2), 1951' },
      { title: 'Thomas C. Schelling, The Strategy of Conflict, Harvard University Press, 1960', note: 'focal points' },
      { title: 'Rosemarie Nagel, "Unraveling in Guessing Games: An Experimental Study", American Economic Review 85(5), 1995' },
      { title: 'The Nobel Prize in Economic Sciences 1994 (Harsanyi, Nash, Selten)', url: 'https://www.nobelprize.org/prizes/economic-sciences/1994/summary/' },
    ],
  },
};

export default article;
