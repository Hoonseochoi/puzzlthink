import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'zero-sum',
  category: 'basics',
  updated: '2026-11-26',
  games: ['janggi', 'piggyBank', 'hitStay'],
  related: ['minimax-mixed-strategy', 'prisoners-dilemma', 'voting-coalitions', 'tournament-incentives'],
  ko: {
    meta: {
      title: '제로섬과 비제로섬 — 파이를 나누는 게임과 키우는 게임 | PUZZLTHINK 게임 이론',
      description: '내가 얻는 만큼 상대가 잃는 제로섬 게임과, 함께 얻거나 함께 잃을 수 있는 비제로섬 게임. 두 구조에서 협력·대화·정보의 의미가 어떻게 달라지는지, 셋이 나누는 제로섬에서 연합이 끝없이 바뀌는 이유, 돼지 저금통·Hit,Stay의 점수 구조까지.',
      keywords: ['제로섬 게임', '비제로섬 게임', '제로섬 뜻', '상수합 게임', '게임 이론 기초', '윈윈 게임'],
    },
    title: '제로섬과 비제로섬',
    lead: '파이를 나누는 게임인가, 파이를 키우거나 태우는 게임인가.',
    intro: [
      '"제로섬"은 일상에서도 자주 쓰는 말이에요. 누군가 얻으면 누군가는 그만큼 잃는 상황이요. 그런데 이 구분은 단순한 비유가 아니라, **어떤 전략이 말이 되는지**를 정하는 기준이에요. 제로섬 게임에서는 협력할 이유가 없고, 비제로섬 게임에서는 협력이 가장 큰 이득이 될 수도 있어요.',
      '이 글에서는 두 구조를 정확히 구분하고, 각각에서 대화와 정보, 연합이 어떤 의미를 갖는지 살펴봐요.',
    ],
    summary: '나누는 게임과 키우는(또는 태우는) 게임. 구조에 따라 협력·대화·정보의 의미가 바뀌어요.',
    sections: [
      {
        id: 'definition',
        title: '정의: 합이 늘 같은 게임',
        blocks: [
          { type: 'p', text: '**제로섬 게임**은 어떤 결과가 나오든 참가자들의 보수를 더하면 0인 게임이에요. 더 넓게는 합이 늘 같은 값인 **상수합 게임**도 같은 성격이에요. 합이 늘 10이라면, 각자의 보수에서 5씩 빼면 제로섬과 똑같은 게임이 되니까요. 핵심은 **결과가 무엇이든 파이의 크기가 같다**는 거예요.' },
          {
            type: 'matrix', rowPlayer: '나', colPlayer: '상대', rows: ['홀', '짝'], cols: ['홀', '짝'],
            cells: [[[1, '−1'], ['−1', 1]], [['−1', 1], [1, '−1']]],
            caption: '홀짝 맞히기: 같으면 내가 1점, 다르면 상대가 1점. 어느 칸이든 합이 0이에요.',
          },
          { type: 'p', text: '반대로 결과에 따라 합이 달라지는 게임이 **비제로섬 게임**이에요. [죄수의 딜레마](/game-theory/prisoners-dilemma)에서는 둘 다 협력하면 합이 6, 둘 다 배신하면 2였어요. [치킨 게임](/game-theory/chicken-game)에서는 둘 다 돌진하면 합이 −20이에요. 파이가 커지기도 하고 타 버리기도 하는 거예요.' },
          { type: 'callout', tone: 'note', title: '승패만 있는 1:1 게임은 제로섬이에요', text: '[십이장기](/janggi), 체스, 1:1 보드게임처럼 결과가 "내 승 = 상대 패"인 게임은 제로섬이에요. 무승부도 둘이 반씩 나눈 것으로 보면 합이 같아요. 그래서 이런 게임에는 미니맥스 정리가 그대로 적용돼요.' },
        ],
      },
      {
        id: 'difference',
        title: '두 구조에서 달라지는 것들',
        blocks: [
          { type: 'table', head: ['', '2인 제로섬', '비제로섬'], rows: [
            ['협력', '할 이유가 없어요. 내 이득이 곧 상대 손해예요.', '둘 다 이득인 결과가 있을 수 있어요.'],
            ['대화와 약속', '상대의 말은 나를 속이려는 말로 보는 게 안전해요.', '진실한 말이 서로에게 이득일 때가 있어요.'],
            ['정보 공개', '내 정보를 알려 줘서 내가 이득 볼 일은 거의 없어요.', '정보를 나눠야 조정이 되는 경우가 많아요.'],
            ['풀이 방법', '미니맥스: 최악을 최대한 좋게. 게임의 값이 정해져 있어요.', '균형이 여럿이거나 비효율적일 수 있어요.'],
          ] },
          { type: 'p', text: '2인 제로섬 게임의 가장 큰 특징은 **신중함이 손해가 아니라는 것**이에요. 「[미니맥스와 혼합 전략](/game-theory/minimax-mixed-strategy)」에서 본 것처럼, 상대가 최선을 다한다고 가정하고 최악을 대비한 전략으로도 게임의 값을 보장받을 수 있어요. 비제로섬 게임에서는 이렇게 하면 오히려 함께 얻을 수 있었던 이득을 놓칠 수 있어요.' },
        ],
      },
      {
        id: 'three',
        title: '셋이 나누는 제로섬: 끝나지 않는 연합',
        blocks: [
          { type: 'p', text: '제로섬이라도 사람이 셋 이상이면 이야기가 달라져요. 상금 100을 세 사람이 나누는데, **두 사람 이상이 찬성하는 분배안**이 채택된다고 해 봐요. 파이 크기는 늘 100이니 제로섬이에요.' },
          { type: 'list', ordered: true, items: [
            '공평하게 (34, 33, 33)으로 시작해요.',
            'A와 B가 짜고 (50, 50, 0)을 내면 둘 다 더 많이 받으니 통과돼요.',
            '그러자 C가 B에게 (0, 60, 40)을 제안해요. B는 50보다 60이 낫고 C는 0보다 40이 나으니 통과돼요.',
            '이번엔 A가 C에게 (30, 0, 70)을…',
          ] },
          { type: 'p', text: '이 과정은 끝나지 않아요. **어떤 분배안이든, 그보다 둘에게 더 좋은 안이 늘 있어요.** 협력 게임 이론의 말로 하면 이 게임은 어떤 연합도 깰 수 없는 안정적인 분배(코어)가 비어 있어요. 「[투표와 연합](/game-theory/voting-coalitions)」에서 본 콩도르세의 순환과 같은 모양이에요. 그래서 셋 이상의 제로섬에서는 "누구와 손잡느냐"가 승부를 정하고, 연합은 늘 불안정해요.' },
        ],
      },
      {
        id: 'site-games',
        title: '점수 구조를 읽어 보면',
        blocks: [
          { type: 'p', text: '같은 게임 안에서도 어떤 행동은 제로섬이고 어떤 행동은 아니에요. 점수가 어디서 생기고 어디로 사라지는지 보면 전략이 보여요.' },
          { type: 'list', items: [
            '**[돼지 저금통](/piggy-bank)의 의심.** 의심이 맞으면 의심한 사람 +1, 대답한 사람 −1이라 점수가 옮겨 갈 뿐이에요(제로섬). 의심이 틀리면 의심한 사람만 −1이라 판 전체의 점수가 줄어요. 다른 사람들 입장에서는, 누군가 틀린 의심을 하면 나는 아무것도 안 했는데 상대적으로 올라가요. 순위로 겨루는 게임에서 **남의 실수는 나의 이득**이에요.',
            '**[Hit,Stay](/hit-stay)의 칩.** 판돈은 참가자들의 칩으로만 만들어지고 이긴 사람에게 옮겨 가니, 칩의 총량은 변하지 않아요(상수합). 그런데 다섯 명이 하는 게임이라 위의 "셋이 나누는 제로섬"처럼 누가 누구를 공격하느냐가 중요해져요. 두 사람이 크게 맞붙는 판은 지켜보는 세 사람에게 이득일 수 있어요.',
            '**승패만 남는 1:1 게임.** [십이장기](/janggi) 같은 게임에서는 상대에게 이득인 수는 곧 나에게 손해예요. 상대가 "좋은 수"라고 권하는 수를 의심하는 게 기본이에요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '흔한 착각',
        blocks: [
          { type: 'list', items: [
            '**비제로섬을 제로섬으로 보기.** 협상이나 협업처럼 함께 파이를 키울 수 있는 상황을 "누가 더 가져가나"로만 보면, 둘 다 더 나아질 기회를 놓쳐요.',
            '**제로섬을 비제로섬으로 보기.** 1:1 승부에서 상대의 "윈윈" 제안은 대개 한쪽에 유리하게 짜여 있어요. 승패만 남는 게임이라면 진짜 윈윈은 없어요.',
            '**점수와 순위를 헷갈리기.** 점수로는 비제로섬인 게임도 순위로 겨루면 제로섬이 돼요. 모두의 점수가 올라도 1등은 한 명이니까요. 이 차이는 「[꼴찌 피하기 vs 1등 노리기](/game-theory/tournament-incentives)」에서 더 다뤄요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'John von Neumann, Oskar Morgenstern, Theory of Games and Economic Behavior, Princeton University Press, 1944' },
      { title: 'R. Duncan Luce, Howard Raiffa, Games and Decisions, Wiley, 1957' },
      { title: 'Stanford Encyclopedia of Philosophy, "Game Theory"', url: 'https://plato.stanford.edu/entries/game-theory/' },
      { title: 'PUZZLTHINK 돼지 저금통·Hit,Stay·십이장기 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'Zero-sum and non-zero-sum games — dividing the pie vs growing it | PUZZLTHINK',
      description: 'Zero-sum games where my gain is your loss, and non-zero-sum games where both can gain or both can lose. How cooperation, talk and information change meaning between the two, why alliances never settle when three split a fixed pie, and the scoring of Piggy Bank and Hit,Stay.',
      keywords: ['zero-sum game', 'non-zero-sum game', 'zero sum meaning', 'constant-sum game', 'game theory basics', 'win-win game'],
    },
    title: 'Zero-sum and non-zero-sum',
    lead: 'Is the game dividing a pie, or growing it — or burning it?',
    intro: [
      '"Zero-sum" is an everyday phrase for situations where one person’s gain is another’s loss. But the distinction is more than a metaphor: it decides **which strategies make sense**. In a zero-sum game there is no reason to cooperate; in a non-zero-sum game cooperation can be the biggest gain of all.',
      'This article separates the two structures exactly and looks at what talk, information and alliances mean in each.',
    ],
    summary: 'Games that divide and games that grow (or burn) the pie. The structure changes what cooperation, talk and information mean.',
    sections: [
      {
        id: 'definition',
        title: 'Definition: a total that never changes',
        blocks: [
          { type: 'p', text: 'A **zero-sum game** is one where the players’ payoffs add up to 0 whatever happens. More broadly, a **constant-sum game**, whose total is always the same number, has the same character: if the total is always 10, subtracting 5 from each payoff gives an identical zero-sum game. The point is that **the pie is the same size whatever the outcome**.' },
          {
            type: 'matrix', rowPlayer: 'Me', colPlayer: 'Opponent', rows: ['Odd', 'Even'], cols: ['Odd', 'Even'],
            cells: [[[1, '−1'], ['−1', 1]], [['−1', 1], [1, '−1']]],
            caption: 'Matching pennies: same choice, I score 1; different, the opponent scores 1. Every cell sums to 0.',
          },
          { type: 'p', text: 'A game whose total depends on the outcome is **non-zero-sum**. In [the prisoner’s dilemma](/game-theory/prisoners-dilemma) mutual cooperation totals 6 and mutual defection 2. In [chicken](/game-theory/chicken-game) a crash totals −20. The pie can grow, and it can burn.' },
          { type: 'callout', tone: 'note', title: 'Win-or-lose one-on-one games are zero-sum', text: 'Games like [12 Janggi](/janggi), chess and other one-on-one board games, where my win is your loss, are zero-sum; a draw counts as half each, so the total is unchanged. The minimax theorem applies to them directly.' },
        ],
      },
      {
        id: 'difference',
        title: 'What differs between the two',
        blocks: [
          { type: 'table', head: ['', 'Two-player zero-sum', 'Non-zero-sum'], rows: [
            ['Cooperation', 'No reason: my gain is your loss.', 'There may be outcomes good for both.'],
            ['Talk and promises', 'Safest to treat the opponent’s words as attempts to mislead.', 'Honest talk can benefit both.'],
            ['Sharing information', 'Revealing your information rarely helps you.', 'Coordination often requires sharing.'],
            ['How to solve', 'Minimax: make the worst case as good as possible. The game has a value.', 'Equilibria can be many, or inefficient.'],
          ] },
          { type: 'p', text: 'The hallmark of two-player zero-sum games is that **caution costs nothing**. As [Minimax and mixed strategies](/game-theory/minimax-mixed-strategy) showed, assuming the opponent plays their best and guarding against the worst still guarantees you the game’s value. In a non-zero-sum game the same caution can throw away gains you could have made together.' },
        ],
      },
      {
        id: 'three',
        title: 'Zero-sum among three: alliances that never settle',
        blocks: [
          { type: 'p', text: 'Even a zero-sum game changes with three or more players. Three people split a prize of 100, and **any split at least two of them approve** is adopted. The pie is always 100, so it is zero-sum.' },
          { type: 'list', ordered: true, items: [
            'Start fair: (34, 33, 33).',
            'A and B team up on (50, 50, 0); both get more, so it passes.',
            'Then C offers B (0, 60, 40): B prefers 60 to 50, C prefers 40 to 0, so it passes.',
            'Now A offers C (30, 0, 70)…',
          ] },
          { type: 'p', text: 'It never ends: **for any split there is another that two players prefer**. In cooperative game theory this game’s core — the set of splits no coalition can overturn — is empty. It has the same shape as Condorcet’s cycle in [Voting and coalitions](/game-theory/voting-coalitions). So in zero-sum games with three or more players, who you team up with decides the outcome, and alliances are always unstable.' },
        ],
      },
      {
        id: 'site-games',
        title: 'Reading the scoring',
        blocks: [
          { type: 'p', text: 'Within one game some actions are zero-sum and others are not. Look at where points come from and where they go, and strategy appears.' },
          { type: 'list', items: [
            '**Doubts in [Piggy Bank](/piggy-bank).** A correct doubt gives the doubter +1 and the answerer −1: points just move (zero-sum). A wrong doubt costs only the doubter 1, so the table’s total shrinks. For everyone else, someone’s wrong doubt lifts them relatively without doing anything. In a game ranked by score, **other people’s mistakes are your gain**.',
            '**Chips in [Hit,Stay](/hit-stay).** The pot is made only of players’ chips and moves to the winner, so the total number of chips never changes (constant-sum). But with five players, as in the three-way split above, who attacks whom matters: a big clash between two players can benefit the three who watch.',
            '**One-on-one win-or-lose games.** In games like [12 Janggi](/janggi), a move that helps the opponent hurts you. Be suspicious of any move the opponent calls "good".',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common confusions',
        blocks: [
          { type: 'list', items: [
            '**Treating non-zero-sum as zero-sum.** Seeing a negotiation or joint project only as "who gets more" throws away chances for both to do better.',
            '**Treating zero-sum as non-zero-sum.** In a one-on-one contest, an opponent’s "win-win" proposal is usually tilted their way. If only winning and losing remain, there is no true win-win.',
            '**Confusing points with rank.** A game that is non-zero-sum in points becomes zero-sum when ranked: everyone’s score can rise, but there is still only one first place. More in [Avoiding last place vs going for first](/game-theory/tournament-incentives).',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'John von Neumann, Oskar Morgenstern, Theory of Games and Economic Behavior, Princeton University Press, 1944' },
      { title: 'R. Duncan Luce, Howard Raiffa, Games and Decisions, Wiley, 1957' },
      { title: 'Stanford Encyclopedia of Philosophy, "Game Theory"', url: 'https://plato.stanford.edu/entries/game-theory/' },
      { title: 'PUZZLTHINK Piggy Bank, Hit,Stay and 12 Janggi rules (shown in each game)' },
    ],
  },
};

export default article;
