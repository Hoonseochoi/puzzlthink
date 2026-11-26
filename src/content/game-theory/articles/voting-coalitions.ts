import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'voting-coalitions',
  category: 'coalitions',
  updated: '2026-11-26',
  games: ['wallgo', 'wallgo2'],
  related: ['tournament-incentives', 'commitment-threats', 'stag-hunt', 'ultimatum-game'],
  ko: {
    meta: {
      title: '투표와 연합의 게임 이론 — 콩도르세의 역설, 섀플리 값, 킹메이커 | PUZZLTHINK 게임 이론',
      description: '다수결은 왜 돌고 돌까요? 콩도르세의 역설과 안건 순서의 힘, 표 수와 실제 영향력이 다른 이유를 보여 주는 섀플리 값, 그리고 벽바둑 3인전처럼 셋이 겨루는 게임의 킹메이커 문제까지 쉽게 정리했어요.',
      keywords: ['콩도르세의 역설', '섀플리 값', '섀플리 슈빅 지수', '연합 게임', '킹메이커', '서바이벌 투표 전략'],
    },
    title: '투표와 연합: 콩도르세의 역설과 섀플리 값',
    lead: '셋 이상이 모이면, 표의 수와 실제 힘은 달라져요.',
    intro: [
      '서바이벌 게임에서 가장 무서운 순간은 투표예요. 누가 탈락할지, 누구에게 무엇을 줄지 다수결로 정하는 순간, 게임은 머리싸움에서 편 가르기로 바뀌어요. 그리고 편 가르기에도 수학이 있어요.',
      '이 글에서는 다수결이 왜 모순에 빠질 수 있는지(콩도르세의 역설), 연합 안에서 누가 진짜 힘을 갖는지(섀플리 값), 그리고 세 사람이 겨루는 게임에서 꼴찌가 승자를 정하는 문제(킹메이커)를 차례로 살펴봐요.',
    ],
    summary: '돌고 도는 다수결, 표 수와 다른 실제 영향력, 그리고 셋이 겨룰 때의 킹메이커.',
    sections: [
      {
        id: 'condorcet',
        title: '콩도르세의 역설: 다수결이 돌고 돌 때',
        blocks: [
          { type: 'p', text: '세 사람 갑, 을, 병이 후보 A, B, C 중 하나를 다수결로 고른다고 해 봐요. 각자의 선호 순서는 이래요.' },
          { type: 'table', head: ['투표자', '1순위', '2순위', '3순위'], rows: [
            ['갑', 'A', 'B', 'C'],
            ['을', 'B', 'C', 'A'],
            ['병', 'C', 'A', 'B'],
          ] },
          { type: 'p', text: '둘씩 붙여 보면 이상한 일이 생겨요. A 대 B는 갑과 병이 A를 좋아해서 **A가 2 대 1로 이겨요.** B 대 C는 갑과 을이 B를 좋아해서 **B가 이겨요.** C 대 A는 을과 병이 C를 좋아해서 **C가 이겨요.** A가 B를 이기고, B가 C를 이기고, C가 A를 이겨요. 집단의 선호가 가위바위보처럼 돌아요.' },
          { type: 'p', text: '18세기 프랑스의 수학자이자 철학자 콩도르세 후작이 1785년에 이 현상을 지적해서 **콩도르세의 역설**이라고 불러요. 각 개인은 일관된 순서를 가졌는데, 다수결로 모으니 일관성이 사라진 거예요.' },
          { type: 'h3', text: '안건 순서를 정하는 사람이 결과를 정해요' },
          { type: 'p', text: '이런 상황에서 "먼저 두 후보를 붙이고, 이긴 쪽을 남은 후보와 붙이자"고 하면, 어떤 순서로 붙이느냐에 따라 결과가 달라져요.' },
          { type: 'table', head: ['먼저 붙이는 두 후보', '1차 승자', '최종 대결', '최종 승자'], rows: [
            ['A 대 B', 'A', 'A 대 C', '**C**'],
            ['B 대 C', 'B', 'B 대 A', '**A**'],
            ['C 대 A', 'C', 'C 대 B', '**B**'],
          ], caption: '처음에 빠져 있던 후보가 항상 최종 승자가 돼요. 순서를 정하는 사람이 원하는 결과를 고를 수 있어요.' },
          { type: 'callout', tone: 'note', title: '애로의 불가능성 정리', text: '경제학자 케네스 애로는 1951년 책 『사회적 선택과 개인의 가치』에서 더 일반적인 결과를 증명했어요. 선택지가 셋 이상일 때, 몇 가지 그럴듯한 조건(모두가 A를 B보다 좋아하면 집단도 그래야 한다, 독재자가 없어야 한다 등)을 동시에 만족하는 투표 규칙은 없다는 거예요. 애로는 1972년 노벨 경제학상을 받았어요. 다수결이 틀렸다는 뜻이 아니라, **어떤 투표 규칙이든 약점이 있다**는 뜻이에요.' },
        ],
      },
      {
        id: 'shapley',
        title: '섀플리 값: 표 수와 실제 힘은 달라요',
        blocks: [
          { type: 'p', text: '이번엔 연합을 생각해 봐요. 아홉 명이 투표로 무언가를 정하는데 다섯 표가 있어야 통과해요. 참가자들이 네 명짜리 그룹 둘(가, 나)과 혼자인 한 명(다)으로 나뉘어 있고, 그룹은 한 몸처럼 투표해요. 누가 가장 힘이 셀까요?' },
          { type: 'p', text: '가와 나가 손잡으면 8표, 가와 다가 손잡으면 5표, 나와 다가 손잡으면 5표예요. **셋 중 어느 둘이든 손잡으면 통과**하고, 혼자서는 아무도 못 해요. 그러니 네 명짜리 그룹과 혼자인 한 명이 **똑같은 힘**을 가져요. 혼자인 사람은 양쪽에서 러브콜을 받는 킹메이커예요.' },
          { type: 'h3', text: '계산하는 법: 줄 서기에서 결정적인 사람' },
          { type: 'p', text: '로이드 섀플리는 1953년 논문에서 협력의 성과를 나누는 공정한 방법으로 **섀플리 값**을 제시했어요. 투표에 적용한 것이 1954년 섀플리와 마틴 슈빅의 **섀플리-슈빅 지수**예요. 방법은 이래요. 참가자들이 가능한 모든 순서로 한 명씩 연합에 들어온다고 상상하고, 그 사람이 들어오는 순간 처음으로 통과선을 넘는 경우를 셉니다. 그 비율이 그 사람의 힘이에요.' },
          { type: 'p', text: '조금 더 극적인 예를 볼까요? 표가 A 50표, B 49표, C 1표이고 51표가 있어야 통과해요. 세 사람이 들어오는 순서는 6가지예요.' },
          { type: 'table', head: ['들어오는 순서', '통과선을 넘기는 사람'], rows: [
            ['A → B → C', 'B (50 + 49)'],
            ['A → C → B', 'C (50 + 1 = 51)'],
            ['B → A → C', 'A'],
            ['B → C → A', 'A (49 + 1 = 50, A가 들어와야 넘음)'],
            ['C → A → B', 'A (1 + 50 = 51)'],
            ['C → B → A', 'A'],
          ], caption: 'A가 6번 중 4번, B와 C가 1번씩 결정적이에요. 섀플리-슈빅 지수는 A 2/3, B 1/6, C 1/6.' },
          { type: 'p', text: '**49표를 가진 B와 1표를 가진 C의 힘이 똑같아요.** A는 둘 중 누구와 손잡아도 통과하니, B와 C는 A의 파트너 자리를 두고 똑같은 처지에서 경쟁해요. 표가 많다고 힘이 비례해서 커지는 게 아니라, **"내가 빠지면 무너지는 연합이 얼마나 많은가"**가 힘이에요. 섀플리는 이런 연구로 2012년 앨빈 로스와 함께 노벨 경제학상을 받았어요.' },
        ],
      },
      {
        id: 'kingmaker',
        title: '셋이 겨루면: 킹메이커와 1위 견제',
        blocks: [
          { type: 'p', text: '두 사람 게임에서는 내가 이기면 상대가 져요. 그런데 세 사람이 겨루는 게임에서는 새로운 일이 생겨요.' },
          { type: 'list', items: [
            '**1위 견제.** 앞서가는 사람이 생기면, 나머지 둘은 서로 싸우기보다 1위를 함께 막는 게 각자에게 이득일 때가 많아요. 그래서 앞서 나가는 순간 표적이 되기 쉬워요.',
            '**킹메이커.** 더 이상 이길 수 없는 사람의 선택이 나머지 두 사람 중 누가 이길지를 정하는 상황이에요. 이 사람에게는 승패가 걸려 있지 않으니, 감정이나 다음 게임의 관계 같은 것이 결정을 좌우해요.',
            '**연합의 불안정성.** 둘이 손잡고 1위를 끌어내리면, 그 순간 둘 중 하나가 새 1위가 되어 다시 표적이 돼요. 셋 사이의 연합은 이렇게 계속 바뀌기 쉬워요. 앞의 콩도르세 순환과 같은 모양이에요.',
          ] },
          { type: 'h3', text: '벽바둑 3인전' },
          { type: 'p', text: '[벽바둑](/wallgo)과 [벽바둑 II](/wallgo-2)의 3인전은 세 사람이 각자 말 두 개로 움직이며 벽을 세워 자기 영역을 넓히는 게임이에요. 가장 넓은 영역을 가진 사람이 이기고, 3인전에서는 각자 한 번씩 벽을 부술 수 있어요. 이 구조에서는 위의 세 가지가 모두 나타나요.' },
          { type: 'list', items: [
            '내가 벽 하나로 영역을 크게 닫을 수 있는 수가 보이면, 다른 두 사람에게도 그게 보여요. 둘이 차례로 나를 막으면 한 사람이 막는 것보다 훨씬 효과적이에요. **너무 일찍 크게 앞서 보이지 않는 것**이 3인전의 기본 전략이에요.',
            '반대로 다른 사람이 앞서가면, 지금 나에게 가장 큰 이익이 되는 수보다 **선두의 영역을 줄이는 수**가 결국 더 나을 수 있어요. 세 번째 사람도 같은 생각을 할 테니, 내가 막지 않아도 그 사람이 막을지 따져 보세요. 남이 대신 막아 주길 기다리는 건 [치킨 게임](/game-theory/chicken-game)이에요.',
            '벽 부수기는 한 번뿐인 자원이에요. 선두를 막는 데 쓸지, 내 영역을 지키는 데 아껴 둘지는 다른 두 사람의 남은 벽 부수기와 함께 판단하세요.',
          ] },
        ],
      },
      {
        id: 'shows',
        title: '서바이벌 게임 속 투표와 연합',
        blocks: [
          { type: 'p', text: '두뇌 서바이벌 프로그램에서 투표와 연합은 게임 밖에서도 계속되는 또 하나의 게임이에요. 아래는 특정 회차가 아니라 구조에 대한 이야기예요.' },
          { type: 'list', items: [
            '**탈락자 지목 투표.** 다수결로 한 명을 지목하는 구조에서는, 큰 연합보다 **어느 쪽에도 붙을 수 있는 소수**가 힘을 갖는 경우가 많아요. 섀플리 값의 "4, 4, 1" 예와 같은 구조예요.',
            '**투표 순서와 방식.** 공개 투표인지 비밀 투표인지, 한 번에 정하는지 여러 단계로 나눠 정하는지에 따라 결과가 달라질 수 있어요. 안건 순서의 힘은 콩도르세 예에서 본 그대로예요.',
            '**연합의 크기.** 이기는 데 필요한 최소한보다 큰 연합은 나눌 몫이 줄어서 오래가기 어려워요. 그래서 연합은 "딱 이길 만큼"의 크기로 줄어드는 경향이 있다는 주장도 있어요(정치학자 윌리엄 라이커의 최소 승리 연합 이론).',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**내가 결정적인 연합이 몇 개인지 세어 보세요.** 표 수가 적어도 여러 연합의 마지막 퍼즐 조각이라면, 그만큼 협상력이 있어요.',
            '**순서를 정하는 자리를 노리세요.** 무엇을 먼저 투표할지, 누구를 먼저 지목할지 정하는 권한이 결과를 바꿀 수 있어요.',
            '**3인 게임에서는 2위로 버티세요.** 끝나기 직전까지 표적이 되지 않는 위치가 가장 안전한 경우가 많아요.',
            '**킹메이커에게는 미래를 약속하세요.** 이길 수 없는 사람을 내 편으로 만드는 건 지금의 점수가 아니라 다음 게임에서의 관계일 때가 많아요. 그 약속이 믿을 만한지는 「[약속과 위협의 신빙성](/game-theory/commitment-threats)」을 참고하세요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Marquis de Condorcet, Essai sur l’application de l’analyse à la probabilité des décisions rendues à la pluralité des voix, 1785' },
      { title: 'Kenneth J. Arrow, Social Choice and Individual Values, Wiley, 1951' },
      { title: 'Stanford Encyclopedia of Philosophy, "Arrow’s Theorem"', url: 'https://plato.stanford.edu/entries/arrows-theorem/' },
      { title: 'L. S. Shapley, "A Value for n-Person Games", Contributions to the Theory of Games II, Princeton University Press, 1953' },
      { title: 'L. S. Shapley, Martin Shubik, "A Method for Evaluating the Distribution of Power in a Committee System", American Political Science Review 48(3), 1954' },
      { title: 'William H. Riker, The Theory of Political Coalitions, Yale University Press, 1962' },
      { title: 'PUZZLTHINK 벽바둑·벽바둑 II 3인전 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'The game theory of voting and coalitions — Condorcet’s paradox, the Shapley value and kingmakers | PUZZLTHINK',
      description: 'Why can majority voting go round in circles? Condorcet’s paradox and the power of the agenda, the Shapley value showing why votes and real influence differ, and the kingmaker problem in three-player games such as three-player Wallgo.',
      keywords: ["Condorcet paradox", 'Shapley value', 'Shapley–Shubik index', 'coalition game', 'kingmaker', 'survival game voting strategy'],
    },
    title: 'Voting and coalitions: Condorcet’s paradox and the Shapley value',
    lead: 'Once three or more people are involved, the number of votes and real power part ways.',
    intro: [
      'The scariest moment in a survival game is the vote. Once elimination or rewards are decided by majority, the game turns from a battle of wits into a battle of sides. Taking sides has its own mathematics.',
      'This article looks at why majority voting can contradict itself (Condorcet’s paradox), who holds real power inside a coalition (the Shapley value), and the problem of the last-placed player deciding the winner in three-player games (the kingmaker).',
    ],
    summary: 'Majorities that go in circles, influence that differs from vote counts, and the kingmaker in three-way games.',
    sections: [
      {
        id: 'condorcet',
        title: 'Condorcet’s paradox: when the majority goes in circles',
        blocks: [
          { type: 'p', text: 'Three voters, X, Y and Z, choose one of the candidates A, B and C by majority. Their rankings:' },
          { type: 'table', head: ['Voter', '1st', '2nd', '3rd'], rows: [
            ['X', 'A', 'B', 'C'],
            ['Y', 'B', 'C', 'A'],
            ['Z', 'C', 'A', 'B'],
          ] },
          { type: 'p', text: 'Compare them in pairs and something odd happens. In A against B, X and Z prefer A, so **A wins 2–1**. In B against C, X and Y prefer B, so **B wins**. In C against A, Y and Z prefer C, so **C wins**. A beats B, B beats C and C beats A: the group’s preference goes round like rock–paper–scissors.' },
          { type: 'p', text: 'The eighteenth-century French mathematician and philosopher the Marquis de Condorcet pointed this out in 1785, so it is called **Condorcet’s paradox**. Each individual has a consistent ranking, yet aggregating them by majority loses consistency.' },
          { type: 'h3', text: 'Whoever sets the agenda sets the result' },
          { type: 'p', text: 'Suppose the rule is "pit two candidates against each other, then the winner against the third". The result depends on the order.' },
          { type: 'table', head: ['First pair', 'First winner', 'Final', 'Overall winner'], rows: [
            ['A vs B', 'A', 'A vs C', '**C**'],
            ['B vs C', 'B', 'B vs A', '**A**'],
            ['C vs A', 'C', 'C vs B', '**B**'],
          ], caption: 'The candidate left out of the first vote always wins. Whoever sets the order can pick the result.' },
          { type: 'callout', tone: 'note', title: 'Arrow’s impossibility theorem', text: 'In Social Choice and Individual Values (1951) the economist Kenneth Arrow proved a far more general result: with three or more options, no voting rule satisfies a handful of reasonable conditions at once (if everyone prefers A to B so should the group; there must be no dictator; and so on). Arrow received the Nobel Memorial Prize in Economic Sciences in 1972. The point is not that majority voting is wrong, but that **every voting rule has weaknesses**.' },
        ],
      },
      {
        id: 'shapley',
        title: 'The Shapley value: votes are not power',
        blocks: [
          { type: 'p', text: 'Now consider coalitions. Nine people vote, and a motion needs five votes. They are split into two blocs of four (P and Q) and one independent (R), and each bloc votes as one. Who is most powerful?' },
          { type: 'p', text: 'P and Q together have 8 votes, P and R 5, Q and R 5. **Any two of the three pass the motion**, and nobody can do it alone. So the four-person blocs and the lone independent have **exactly the same power**. The independent is a kingmaker courted by both sides.' },
          { type: 'h3', text: 'How to compute it: who is pivotal in the queue' },
          { type: 'p', text: 'In a 1953 paper Lloyd Shapley proposed the **Shapley value** as a fair way to divide what a group achieves together. Applied to voting it became the **Shapley–Shubik index** of Shapley and Martin Shubik (1954). Imagine the players joining a coalition one at a time in every possible order, and count how often each one is the player whose arrival first pushes the total over the line. That share is their power.' },
          { type: 'p', text: 'A more dramatic example: A has 50 votes, B 49 and C 1, and 51 are needed. There are six orders in which the three can arrive.' },
          { type: 'table', head: ['Order of arrival', 'Who pushes it over the line'], rows: [
            ['A → B → C', 'B (50 + 49)'],
            ['A → C → B', 'C (50 + 1 = 51)'],
            ['B → A → C', 'A'],
            ['B → C → A', 'A (49 + 1 = 50; only A’s arrival crosses it)'],
            ['C → A → B', 'A (1 + 50 = 51)'],
            ['C → B → A', 'A'],
          ], caption: 'A is pivotal in 4 of 6 orders, B and C in 1 each. The Shapley–Shubik index is A 2/3, B 1/6, C 1/6.' },
          { type: 'p', text: '**B with 49 votes has exactly the same power as C with 1.** A passes the motion with either of them, so B and C compete on equal terms to be A’s partner. Power does not grow in proportion to votes; it is **how many coalitions collapse without you**. Shapley shared the 2012 Nobel Memorial Prize in Economic Sciences with Alvin Roth for work in this tradition.' },
        ],
      },
      {
        id: 'kingmaker',
        title: 'Three-way contests: kingmakers and ganging up on the leader',
        blocks: [
          { type: 'p', text: 'In a two-player game, my win is the opponent’s loss. With three players, new things happen.' },
          { type: 'list', items: [
            '**Ganging up on the leader.** Once someone pulls ahead, the other two often do better stopping the leader together than fighting each other. Getting ahead makes you a target.',
            '**The kingmaker.** A player who can no longer win decides which of the other two does. With nothing at stake for them, feelings or relationships in the next game drive the decision.',
            '**Unstable alliances.** When two players pull down the leader, one of them becomes the new leader and the next target. Alliances among three keep shifting, the same shape as Condorcet’s cycle.',
          ] },
          { type: 'h3', text: 'Three-player Wallgo' },
          { type: 'p', text: 'In three-player [Wallgo](/wallgo) and [Wallgo II](/wallgo-2), three players each move two pieces and build walls to enlarge their own territory; the largest territory wins, and in the three-player game each player may knock down one wall. All three effects above appear.' },
          { type: 'list', items: [
            'If you see a move that closes off a big territory with one wall, the other two see it too, and two players blocking you in turn is far more effective than one. **Not looking too far ahead too early** is basic three-player strategy.',
            'Conversely, when someone else leads, a move that **shrinks the leader’s territory** may in the end be better than the move that gains you most right now. The third player is thinking the same, so weigh whether they will block if you do not. Waiting for someone else to do the blocking is [a game of chicken](/game-theory/chicken-game).',
            'The wall break is a one-off resource. Decide whether to spend it stopping the leader or keep it to protect your own territory with the other two players’ remaining breaks in mind.',
          ] },
        ],
      },
      {
        id: 'shows',
        title: 'Voting and alliances in survival games',
        blocks: [
          { type: 'p', text: 'In brain-survival shows, voting and alliances are a second game that runs on outside the official one. What follows is about structure, not particular episodes.' },
          { type: 'list', items: [
            '**Elimination votes.** When the majority names one player, **a small group that can side with anyone** often holds more power than a large alliance: the "4, 4, 1" structure from the Shapley example.',
            '**Order and method.** Open or secret ballots, one round or several stages: the result can change with the procedure. The power of the agenda is exactly what the Condorcet example showed.',
            '**Alliance size.** An alliance larger than needed to win has less to share per member and is hard to keep. Hence the claim that alliances tend to shrink to "just enough to win" (the political scientist William Riker’s minimal winning coalition theory).',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Count the coalitions in which you are pivotal.** Even with few votes, being the last piece of many coalitions gives you bargaining power.',
            '**Go for the seat that sets the order.** The power to decide what is voted on first, or who is named first, can change the result.',
            '**In three-player games, sit in second place.** A position that is not a target until just before the end is often the safest.',
            '**Offer kingmakers a future.** What wins over a player who cannot win is often the relationship in the next game, not points now. Whether such a promise is believable is covered in [Promises, threats and credibility](/game-theory/commitment-threats).',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Marquis de Condorcet, Essai sur l’application de l’analyse à la probabilité des décisions rendues à la pluralité des voix, 1785' },
      { title: 'Kenneth J. Arrow, Social Choice and Individual Values, Wiley, 1951' },
      { title: 'Stanford Encyclopedia of Philosophy, "Arrow’s Theorem"', url: 'https://plato.stanford.edu/entries/arrows-theorem/' },
      { title: 'L. S. Shapley, "A Value for n-Person Games", Contributions to the Theory of Games II, Princeton University Press, 1953' },
      { title: 'L. S. Shapley, Martin Shubik, "A Method for Evaluating the Distribution of Power in a Committee System", American Political Science Review 48(3), 1954' },
      { title: 'William H. Riker, The Theory of Political Coalitions, Yale University Press, 1962' },
      { title: 'PUZZLTHINK Wallgo and Wallgo II three-player rules (shown in each game)' },
    ],
  },
};

export default article;
