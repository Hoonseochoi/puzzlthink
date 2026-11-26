import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'tit-for-tat',
  category: 'cooperation',
  updated: '2026-11-26',
  games: [],
  related: ['prisoners-dilemma', 'backward-induction', 'public-goods', 'commitment-threats'],
  ko: {
    meta: {
      title: '팃포탯과 반복 게임 — 액설로드 대회, 관대한 팃포탯, 잡음이 중요한 이유 | PUZZLTHINK 게임 이론',
      description: '받은 대로 돌려주는 팃포탯은 왜 액설로드의 컴퓨터 대회에서 우승했을까요? 반복 죄수의 딜레마에서 협력이 유지되는 조건, 실수(잡음)가 있을 때의 약점과 관대한 팃포탯·파블로프 전략까지 정리했어요.',
      keywords: ['팃포탯', '팃포탯 전략', '액설로드 대회', '반복 죄수의 딜레마', '관대한 팃포탯', '협력의 진화'],
    },
    title: '반복 게임과 팃포탯',
    lead: '먼저 손 내밀고, 받은 대로 돌려준다. 단순한 규칙이 강했던 이유.',
    intro: [
      '[죄수의 딜레마](/game-theory/prisoners-dilemma)를 한 번만 한다면 배신이 우월 전략이에요. 그런데 서바이벌 게임에서 같은 사람과 한 번만 만나는 일은 드물어요. 오늘 손잡았던 사람과 내일 또 같은 방에 들어가고, 오늘 배신한 사람을 다음 라운드에서 다시 만나요.',
      '이렇게 같은 게임을 되풀이하면 무엇이 달라질까요? 1980년 무렵 정치학자 로버트 액설로드는 이 질문을 컴퓨터 대회로 시험했고, 결과는 많은 사람을 놀라게 했어요. 가장 짧은 프로그램 중 하나인 **팃포탯(Tit for Tat, 받은 대로 갚기)**이 우승했거든요.',
    ],
    summary: '먼저 협력하고 받은 대로 돌려준다. 액설로드 대회의 결과와, 실수가 있을 때 필요한 관대함.',
    sections: [
      {
        id: 'tournament',
        title: '액설로드의 컴퓨터 대회',
        blocks: [
          { type: 'p', text: '액설로드는 게임 이론가, 경제학자, 심리학자 등에게 반복 죄수의 딜레마를 두는 프로그램을 보내 달라고 했어요. 점수는 상호 협력 3점, 상호 배신 1점, 혼자 배신 5점, 혼자 협력 0점이었어요. 모든 프로그램이 서로 한 번씩 긴 대전을 치르는 리그전이었고, 무작위로 두는 프로그램도 함께 넣었어요.' },
          { type: 'table', head: ['', '1차 대회', '2차 대회'], rows: [
            ['참가 프로그램', '14개 (+ 무작위 프로그램)', '여러 나라에서 온 62개 (+ 무작위 프로그램)'],
            ['대전 길이', '정해진 횟수', '매 수마다 일정 확률로 끝남 (언제 끝날지 모름)'],
            ['우승', '팃포탯 (아나톨 라포포트 제출)', '팃포탯 (같은 라포포트가 다시 제출)'],
          ], caption: '두 번째 대회 참가자들은 1차 결과를 알고 참가했는데도 팃포탯이 또 이겼어요. 2차 대회 참가 수는 자료에 따라 63개로 세기도 해요.' },
          { type: 'p', text: '팃포탯의 규칙은 딱 두 줄이에요. **첫 판은 협력한다. 그다음부터는 상대가 지난 판에 한 대로 한다.** 액설로드는 결과를 1980년 논문과 1984년 책 『협력의 진화』로 정리했어요.' },
        ],
      },
      {
        id: 'why',
        title: '왜 팃포탯이 강했을까',
        blocks: [
          { type: 'p', text: '액설로드는 상위권 전략들의 공통점을 네 가지로 정리했어요.' },
          { type: 'list', items: [
            '**착하다(nice).** 먼저 배신하지 않아요. 상위권 전략 대부분이 이 성질을 가졌어요. 착한 전략끼리 만나면 처음부터 끝까지 협력해서 3점씩 꾸준히 쌓아요.',
            '**보복한다(retaliatory).** 배신당하면 바로 다음 판에 갚아요. 그래서 계속 이용당하지 않아요.',
            '**용서한다(forgiving).** 상대가 다시 협력하면 바로 다음 판에 협력으로 돌아와요. 원한을 오래 끌지 않으니 관계가 회복될 수 있어요.',
            '**분명하다(clear).** 규칙이 단순해서 상대 프로그램이 금방 "이 녀석과는 협력하는 게 낫다"는 걸 알아챌 수 있어요.',
          ] },
          { type: 'callout', tone: 'note', title: '팃포탯은 한 번도 상대를 이기지 않아요', text: '팃포탯은 한 대전 안에서 상대보다 점수가 높을 수가 없어요. 먼저 배신하지 않고, 당한 만큼만 갚기 때문이에요. 기껏해야 비기거나 조금 져요. 그런데도 리그 전체 합계에서 1등을 했어요. 상대를 꺾는 대신, 협력할 줄 아는 상대들과 높은 점수를 함께 만들었기 때문이에요. "이기는 것"과 "많이 버는 것"이 다르다는 걸 보여 주는 결과예요.' },
          { type: 'h3', text: '협력이 유지되는 조건' },
          { type: 'p', text: '반복 게임에서 협력이 버티려면 미래가 충분히 중요해야 해요. 다음 판이 있을 확률(또는 미래 점수의 가중치)을 δ라고 하고, 상대가 "한 번이라도 배신하면 영원히 배신한다"는 엄격한 전략을 쓴다고 해 봐요. 계속 협력하면 매 판 3점이고, 지금 배신하면 이번에 5점을 받는 대신 이후 매 판 1점이에요. 계산하면 **δ ≥ 1/2**일 때 계속 협력하는 편이 나아요. 일반적으로는 δ ≥ (T−R)/(T−P)예요. 다음 판이 있을 가능성이 절반 이상이면, 오늘의 5점 유혹보다 앞으로의 협력이 더 값지다는 뜻이에요.' },
          { type: 'callout', tone: 'warn', title: '끝이 정해져 있으면 무너져요', text: '모두가 "정확히 10판 하고 끝"이라는 걸 안다면, 10번째 판에는 보복이 없으니 배신하고, 그걸 아니 9번째 판도 배신하고… 이렇게 거꾸로 따지면 첫 판부터 배신이 균형이 돼요. 자세한 내용은 「[역진 귀납과 지네 게임](/game-theory/backward-induction)」에서 다뤄요. 액설로드가 2차 대회에서 대전 길이를 무작위로 정한 이유도 이것이에요.' },
        ],
      },
      {
        id: 'noise',
        title: '실수가 섞이면: 메아리처럼 이어지는 보복',
        blocks: [
          { type: 'p', text: '현실에서는 실수가 일어나요. 협력하려다 버튼을 잘못 누르거나, 상대의 협력을 배신으로 오해하기도 해요. 이런 **잡음(noise)**이 있으면 팃포탯끼리의 대결에 약점이 드러나요.' },
          { type: 'table', head: ['판', '1', '2', '3', '4', '5', '6', '7'], rows: [
            ['A (팃포탯)', '협력', '협력', '**배신 (실수)**', '협력', '배신', '협력', '배신'],
            ['B (팃포탯)', '협력', '협력', '협력', '배신', '협력', '배신', '협력'],
          ], caption: '3판에 A가 한 번 실수하자, 두 팃포탯은 서로의 지난 수를 따라 하며 배신을 번갈아 주고받아요. 누군가 다시 실수하기 전까지 이 엇갈림이 계속돼요.' },
          { type: 'p', text: '번갈아 배신하는 동안 두 사람의 평균 점수는 판당 (5 + 0) / 2 = 2.5점이에요. 계속 협력했을 때의 3점보다 낮아요. 한 번의 실수가 긴 손해로 번지는 거예요. 또 한 번 실수가 나면 둘 다 배신하는 상태로 빠져 판당 1점까지 떨어질 수도 있어요.' },
          { type: 'h3', text: '해법 1: 관대한 팃포탯' },
          { type: 'p', text: '배신당했을 때 **가끔은 갚지 않고 넘어가는** 전략이에요. 일정 확률로 용서해 주면 위와 같은 메아리가 금방 끊겨요. 마틴 노박과 카를 지그문트는 1992년 연구에서, 실수가 있는 환경의 진화 시뮬레이션에서 이렇게 관대한 변형이 잘 자리 잡는다는 결과를 보였어요. 너무 자주 용서하면 이용당하니, 용서하는 비율에는 적당한 범위가 있어요.' },
          { type: 'h3', text: '해법 2: 뉘우치는 팃포탯과 파블로프' },
          { type: 'p', text: '**뉘우치는(contrite) 팃포탯**은 "내 실수로 시작된 보복"이라면 한 번 참고 협력으로 돌아가요. **파블로프(이기면 유지, 지면 바꾸기)**는 지난 판 결과가 좋았으면(3점이나 5점) 같은 수를, 나빴으면(0점이나 1점) 다른 수를 내요. 둘 다 배신해 1점을 받았다면 둘 다 협력으로 바꾸니, 실수 뒤에 저절로 협력이 회복돼요. 다만 파블로프는 늘 배신하는 상대에게는 협력과 배신을 오가며 이용당하는 약점이 있어요. 우와 액설로드의 1995년 연구는 잡음이 있는 대회에서 관대함이나 뉘우침을 더한 팃포탯이 잘 버텼고, 파블로프는 상대에 따라 성적이 흔들렸다고 보고했어요.' },
        ],
      },
      {
        id: 'limits',
        title: '과장하지 말아야 할 것들',
        blocks: [
          { type: 'list', items: [
            '**팃포탯이 "가장 좋은 전략"인 건 아니에요.** 대회 결과는 참가한 전략들의 구성에 달려 있어요. 착한 전략이 많은 판에서 강했던 것이고, 다른 구성에서는 다른 전략이 이길 수 있어요.',
            '**잡음에 약해요.** 위에서 본 것처럼 실수가 있는 환경에서는 순수한 팃포탯보다 관대한 변형이 나아요.',
            '**현실의 관계는 2인 대칭 게임보다 복잡해요.** 협력의 크기가 정해져 있지 않고, 상대가 여럿이며, 평판이 퍼지기도 해요. 그래도 "착하게 시작하고, 보복하되, 용서하라"는 교훈은 여러 상황에서 그럴듯한 출발점이에요.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**처음 만나는 상대에게는 협력으로 시작하되, 이용당하면 바로 반응하세요.** 반복되는 라운드가 있는 서바이벌 게임에서 첫 배신을 그냥 넘기면 "이 사람은 계속 이용해도 된다"는 신호가 돼요.',
            '**보복은 비례해서, 짧게.** 한 번 당했다고 끝까지 원한을 품으면 서로 손해 보는 배신의 고리에 갇혀요. 상대가 돌아오면 받아 주세요.',
            '**실수인지 의도인지 확인할 통로를 만드세요.** 말할 수 있는 게임이라면 "방금 건 실수였어"라는 말 한마디가 메아리를 끊어요. 말이 통하지 않는다면 관대한 팃포탯처럼 가끔은 먼저 손을 내밀어 보세요.',
            '**마지막 라운드를 조심하세요.** 끝이 보이면 보복의 위협이 사라져요. 상대도 그걸 알고 있다는 걸 기억하세요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Robert Axelrod, "Effective Choice in the Prisoner’s Dilemma", Journal of Conflict Resolution 24(1), 1980' },
      { title: 'Robert Axelrod, "More Effective Choice in the Prisoner’s Dilemma", Journal of Conflict Resolution 24(3), 1980' },
      { title: 'Robert Axelrod, The Evolution of Cooperation, Basic Books, 1984' },
      { title: 'Martin A. Nowak, Karl Sigmund, "Tit for tat in heterogeneous populations", Nature 355, 1992' },
      { title: 'Martin Nowak, Karl Sigmund, "A strategy of win-stay, lose-shift that outperforms tit-for-tat in the Prisoner’s Dilemma game", Nature 364, 1993' },
      { title: 'Jianzhong Wu, Robert Axelrod, "How to Cope with Noise in the Iterated Prisoner’s Dilemma", Journal of Conflict Resolution 39(1), 1995', url: 'https://ideas.repec.org/a/sae/jocore/v39y1995i1p183-189.html' },
      { title: 'Axelrod library documentation, "Overview of past tournaments"', url: 'https://axelrod.readthedocs.io/en/latest/discussion/overview_of_past_tournaments.html' },
    ],
  },
  en: {
    meta: {
      title: 'Tit-for-tat and repeated games — Axelrod’s tournaments, generous tit-for-tat and why noise matters | PUZZLTHINK',
      description: 'Why did tit-for-tat, which simply returns what it gets, win Axelrod’s computer tournaments? When cooperation survives in the repeated prisoner’s dilemma, its weakness when mistakes happen, and the generous, contrite and Pavlov fixes.',
      keywords: ['tit for tat', 'tit-for-tat strategy', 'Axelrod tournament', 'iterated prisoner’s dilemma', 'generous tit for tat', 'evolution of cooperation'],
    },
    title: 'Repeated games and tit-for-tat',
    lead: 'Cooperate first, then return what you get. Why such a simple rule did so well.',
    intro: [
      'Play [the prisoner’s dilemma](/game-theory/prisoners-dilemma) once and defecting is dominant. But in survival games you rarely meet someone only once. The player you teamed up with today walks into the same room tomorrow, and the one who betrayed you turns up again next round.',
      'What changes when the same game is repeated? Around 1980 the political scientist Robert Axelrod tested the question with computer tournaments, and the result surprised many: one of the shortest programs entered, **Tit for Tat**, won.',
    ],
    summary: 'Cooperate first and return what you get: Axelrod’s tournaments, and the generosity needed when mistakes happen.',
    sections: [
      {
        id: 'tournament',
        title: 'Axelrod’s computer tournaments',
        blocks: [
          { type: 'p', text: 'Axelrod invited game theorists, economists, psychologists and others to submit programs that play the repeated prisoner’s dilemma. Mutual cooperation scored 3, mutual defection 1, defecting on a cooperator 5 and being defected on 0. Every program played a long match against every other in a round robin, together with a program that moved at random.' },
          { type: 'table', head: ['', 'First tournament', 'Second tournament'], rows: [
            ['Entries', '14 (+ a random program)', '62 from several countries (+ a random program)'],
            ['Match length', 'A fixed number of moves', 'Could end after any move with a set probability (nobody knew when)'],
            ['Winner', 'Tit for Tat (entered by Anatol Rapoport)', 'Tit for Tat (entered again by Rapoport)'],
          ], caption: 'Entrants to the second tournament knew the first results, and Tit for Tat still won. Some sources count 63 entries in the second tournament.' },
          { type: 'p', text: 'Tit for Tat’s rule fits in two lines: **cooperate on the first move; after that, do whatever the opponent did on the previous move.** Axelrod reported the results in two 1980 papers and the 1984 book The Evolution of Cooperation.' },
        ],
      },
      {
        id: 'why',
        title: 'Why tit-for-tat did so well',
        blocks: [
          { type: 'p', text: 'Axelrod summed up what the top strategies had in common in four properties.' },
          { type: 'list', items: [
            '**Nice.** It never defects first. Most of the top strategies shared this. Two nice strategies cooperate from start to finish and steadily collect 3 points a move.',
            '**Retaliatory.** Defected on, it hits back on the very next move, so it is not exploited for long.',
            '**Forgiving.** When the opponent cooperates again, it returns to cooperation right away. No long grudges, so the relationship can recover.',
            '**Clear.** The rule is simple, so other programs quickly learn that cooperating with it pays.',
          ] },
          { type: 'callout', tone: 'note', title: 'Tit-for-tat never beats its opponent', text: 'Within a single match Tit for Tat can never score more than its opponent: it never defects first and only pays back what it receives. At best it ties; often it loses narrowly. Yet it topped the overall table. Rather than beating opponents, it built high scores together with opponents able to cooperate. Winning and earning a lot are different things.' },
          { type: 'h3', text: 'When cooperation holds' },
          { type: 'p', text: 'For cooperation to survive, the future must matter enough. Let δ be the chance that there is another round (or the weight of future points), and suppose the opponent uses the strict rule "defect forever after a single defection". Cooperating forever pays 3 every round; defecting now pays 5 once and 1 every round after. Working it out, cooperating is better when **δ ≥ 1/2**; in general, when δ ≥ (T − R)/(T − P). If the chance of another round is at least one half, future cooperation is worth more than today’s temptation of 5.' },
          { type: 'callout', tone: 'warn', title: 'A known last round unravels it', text: 'If everyone knows the game lasts exactly ten rounds, nobody can retaliate in round ten, so you defect there; knowing that, you defect in round nine… Reasoning backwards, defecting from the first round becomes the equilibrium. See [Backward induction and the centipede game](/game-theory/backward-induction). This is why Axelrod made match length random in the second tournament.' },
        ],
      },
      {
        id: 'noise',
        title: 'Add mistakes: retaliation that echoes',
        blocks: [
          { type: 'p', text: 'In reality mistakes happen. You press the wrong button, or misread a cooperative move as a betrayal. With such **noise**, a match between two Tit for Tats shows a weakness.' },
          { type: 'table', head: ['Move', '1', '2', '3', '4', '5', '6', '7'], rows: [
            ['A (Tit for Tat)', 'C', 'C', '**D (mistake)**', 'C', 'D', 'C', 'D'],
            ['B (Tit for Tat)', 'C', 'C', 'C', 'D', 'C', 'D', 'C'],
          ], caption: 'After A’s single mistake on move 3, the two copy each other’s last move and trade defections in turn. The alternation lasts until someone makes another mistake.' },
          { type: 'p', text: 'While they alternate, each averages (5 + 0) / 2 = 2.5 a move, less than the 3 of steady cooperation: one mistake turns into a long loss. A second mistake can tip them into mutual defection at 1 a move.' },
          { type: 'h3', text: 'Fix 1: generous tit-for-tat' },
          { type: 'p', text: 'This variant **sometimes lets a defection go unanswered**. Forgiving with some probability breaks echoes like the one above quickly. In 1992 Martin Nowak and Karl Sigmund showed that in evolutionary simulations with errors, such generous variants establish themselves well. Forgive too often and you get exploited, so there is a sensible range for the forgiveness rate.' },
          { type: 'h3', text: 'Fix 2: contrite tit-for-tat and Pavlov' },
          { type: 'p', text: '**Contrite** Tit for Tat accepts one punishment without hitting back when the trouble started with its own mistake, then returns to cooperation. **Pavlov (win-stay, lose-shift)** repeats its last move after a good result (3 or 5) and switches after a bad one (0 or 1). After mutual defection (1 each) both switch to cooperation, so cooperation recovers by itself after a mistake. Pavlov’s weakness is an opponent who always defects, against whom it keeps flipping and is exploited. Wu and Axelrod (1995) reported that in a noisy tournament Tit for Tat with added generosity or contrition held up well, while Pavlov’s results depended on the opponents.' },
        ],
      },
      {
        id: 'limits',
        title: 'What not to overclaim',
        blocks: [
          { type: 'list', items: [
            '**Tit-for-tat is not "the best strategy".** Tournament results depend on which strategies entered. It was strong in a field full of nice strategies; with a different field, others can win.',
            '**It is fragile under noise.** As shown above, with mistakes a generous variant beats pure Tit for Tat.',
            '**Real relationships are messier than a symmetric two-player game.** The size of cooperation varies, there are many partners, and reputations spread. Still, "start nice, retaliate, forgive" is a reasonable starting point in many situations.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Open with cooperation towards a new player, but respond immediately to exploitation.** In a survival game with repeated rounds, letting the first betrayal slide signals that you can be used again and again.',
            '**Retaliate in proportion, and briefly.** Holding a grudge to the end locks both of you into a cycle of mutual betrayal. When they come back, take them back.',
            '**Create a way to tell mistakes from intent.** If talking is allowed, "that was a mistake" breaks the echo. If not, be generous like generous Tit for Tat and sometimes offer cooperation first.',
            '**Beware the last round.** When the end is in sight the threat of retaliation disappears, and the other side knows it too.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Robert Axelrod, "Effective Choice in the Prisoner’s Dilemma", Journal of Conflict Resolution 24(1), 1980' },
      { title: 'Robert Axelrod, "More Effective Choice in the Prisoner’s Dilemma", Journal of Conflict Resolution 24(3), 1980' },
      { title: 'Robert Axelrod, The Evolution of Cooperation, Basic Books, 1984' },
      { title: 'Martin A. Nowak, Karl Sigmund, "Tit for tat in heterogeneous populations", Nature 355, 1992' },
      { title: 'Martin Nowak, Karl Sigmund, "A strategy of win-stay, lose-shift that outperforms tit-for-tat in the Prisoner’s Dilemma game", Nature 364, 1993' },
      { title: 'Jianzhong Wu, Robert Axelrod, "How to Cope with Noise in the Iterated Prisoner’s Dilemma", Journal of Conflict Resolution 39(1), 1995', url: 'https://ideas.repec.org/a/sae/jocore/v39y1995i1p183-189.html' },
      { title: 'Axelrod library documentation, "Overview of past tournaments"', url: 'https://axelrod.readthedocs.io/en/latest/discussion/overview_of_past_tournaments.html' },
    ],
  },
};

export default article;
