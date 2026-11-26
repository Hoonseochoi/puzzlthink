import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'zero-sum',
  category: 'concept',
  updated: '2026-11-26',
  games: [
    { game: 'blackWhite', ko: '9라운드 동안 한쪽이 점수를 얻으면 다른 쪽은 못 얻는 전형적인 일대일 제로섬 게임이에요.', en: 'A textbook one-on-one zero-sum game: a point for one is a point the other cannot have.' },
    { game: 'hitStay', ko: '칩이 사람 사이를 오갈 뿐 전체 양은 그대로예요. 다만 5명이라 견제와 동맹이 끼어들어요.', en: 'Chips only move between players — but with five, checking and alliances come in.' },
    { game: 'fourThree', ko: '게스트가 3목을 만들면 모두 실패하는, 제로섬이 아닌 구조가 섞인 게임이에요.', en: 'If the guest makes three in a row everyone fails — a non-zero-sum element in the mix.' },
    { game: 'heavy13', ko: '벌점을 누가 받느냐를 다투는 다인 게임. 제로섬이지만 여럿이라 계산이 복잡해져요.', en: 'A multiplayer fight over who takes penalties — zero-sum, but complicated by numbers.' },
  ],
  related: ['perfect-information', 'cooperative-vs-competitive', 'solved-games', 'betting-auction', 'length-and-player-count'],
  sources: [
    { title: 'Zero-sum game', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Zero-sum_game' },
    { title: 'Minimax theorem', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Minimax_theorem' },
    { title: 'Von Neumann and the development of game theory', site: 'Stanford University (CS course pages)', url: 'https://cs.stanford.edu/people/eroberts/courses/soco/projects/game-theory/neumann.html' },
    { title: 'A brief history of game theory', site: 'UCLA (Competition and Appropriation)', url: 'https://competitionandappropriation.econ.ucla.edu/wp-content/uploads/sites/95/2017/08/HistoryGameTheory.pdf' },
    { title: 'Kingmaker scenario', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Kingmaker_scenario' },
  ],
  ko: {
    meta: {
      title: '제로섬 게임이란? 뜻, 예시, 미니맥스, 그리고 셋 이상이 할 때 생기는 일',
      description: '내가 얻은 만큼 상대가 잃는 제로섬 게임. 정확한 뜻과 제로섬이 아닌 게임, 폰 노이만의 미니맥스 원리, 가위바위보가 보여 주는 혼합 전략, 여럿이 할 때 생기는 킹메이커 문제까지 보드게임 예시로 정리했어요.',
      keywords: ['제로섬 게임', '제로섬 뜻', '제로섬 게임 예시', '미니맥스', '혼합 전략', '킹메이커', '게임 이론 기초'],
    },
    title: '제로섬 게임',
    lead: '내가 얻은 만큼 상대가 잃어요. 이 단순한 구조가 생각하는 방식을 통째로 정해요.',
    intro: [
      '“제로섬”은 일상에서도 자주 쓰는 말이에요. 한쪽의 이득이 곧 다른 쪽의 손해라서, 모두의 이득과 손해를 합하면 0이 되는 상황을 말해요. 대부분의 대결형 보드게임이 바로 이런 구조예요. 내가 이기면 상대는 지니까요.',
      '이 글에서는 제로섬이 정확히 무엇인지, 그렇지 않은 게임은 무엇이 다른지, 게임 이론이 제로섬 게임에 대해 알려 주는 핵심 원리, 그리고 셋 이상이 하는 게임에서 제로섬이 어떻게 꼬이는지를 살펴봐요.',
    ],
    summary: '내가 얻은 만큼 상대가 잃는 구조. 정확한 뜻, 폰 노이만의 미니맥스, 가위바위보의 혼합 전략, 여럿이 할 때의 킹메이커 문제를 정리했어요.',
    sections: [
      sec('define', '정확한 뜻', [
        p('제로섬 게임은 **모든 플레이어의 결과를 더하면 언제나 같은 값(보통 0)이 되는 게임**이에요. 이기면 +1, 지면 −1, 비기면 둘 다 0이라고 하면, 어떤 결과가 나와도 합은 0이에요. 칩을 주고받는 포커도 마찬가지예요. 칩은 사람 사이를 오갈 뿐, 판 전체의 칩 양은 변하지 않아요.'),
        p('합이 0이 아니라 일정한 값이라도 생각하는 방식은 같아서, 이런 게임을 묶어 “상수합 게임”이라고 부르기도 해요. 보드게임에서는 둘을 거의 같은 뜻으로 써요.'),
      ]),
      sec('non', '제로섬이 아닌 게임', [
        p('모두가 함께 이기거나 함께 질 수 있다면 제로섬이 아니에요. 협력 게임이 대표적이에요. 팬데믹 같은 게임에서는 모두가 함께 이기면 모두가 +1이에요.'),
        p('경쟁 게임이라도 제로섬이 아닌 경우가 있어요. 게임 이론에서 유명한 **죄수의 딜레마**가 그 예예요. 둘이 서로 협력하면 둘 다 꽤 좋은 결과를 얻지만, 각자 자기만 생각하면 둘 다 더 나쁜 결과로 끝나는 구조예요. 이런 게임에서는 “상대를 이기는 것”보다 “함께 더 나은 결과를 만드는 것”이 중요해질 수 있어요.'),
        table(
          ['', '제로섬', '제로섬이 아님'],
          [
            ['구조', '한쪽의 이득 = 다른 쪽의 손해', '모두 이득을 보거나 모두 손해를 볼 수 있음'],
            ['상대와의 관계', '순수한 대립', '협력할 여지가 있음'],
            ['예', '바둑, 장기, 일대일 포커', '협력 게임, 반협력 게임, 죄수의 딜레마'],
          ],
        ),
      ]),
      sec('minimax', '미니맥스: 최악을 최대한 좋게', [
        p('두 사람 제로섬 게임에서는 **상대에게 가장 좋은 것이 곧 나에게 가장 나쁜 것**이에요. 그래서 “상대가 가장 잘 대응했을 때 내 결과가 가장 좋은 수”를 고르는 것이 합리적이에요. 최악의 경우(min)를 가장 크게(max) 만든다는 뜻에서 이 원리를 **미니맥스**라고 불러요.'),
        p('수학자 존 폰 노이만은 1928년 논문에서 두 사람 제로섬 게임에는 이런 의미의 최선의 전략이 언제나 존재한다는 **미니맥스 정리**를 발표했어요. 1944년에는 경제학자 오스카 모르겐슈테른과 함께 『게임 이론과 경제 행동』을 펴내 게임 이론을 하나의 학문으로 세웠어요.'),
        h3('가위바위보와 혼합 전략'),
        p('미니맥스 정리의 핵심에는 **혼합 전략**이 있어요. 가위바위보에서 늘 바위만 내면 읽혀서 지지만, 셋을 똑같이 3분의 1씩 무작위로 내면 상대가 어떻게 해도 평균적으로 손해를 보지 않아요. 순수한 한 가지 선택으로는 최선이 없을 때, 선택을 확률적으로 섞으면 최선이 생기는 거예요. 블러핑 게임에서 “가끔은 약할 때도 세게 걸어야 하는” 이유가 바로 이거예요.'),
      ]),
      sec('multi', '셋 이상이면 제로섬이 꼬인다', [
        p('두 사람 제로섬은 깔끔하지만, 셋 이상이 되면 이야기가 달라져요. 전체 합은 여전히 같아도, **누가 누구의 몫을 가져가느냐**를 두고 정치가 생기거든요.'),
        ul(
          '**견제**: 앞서는 사람을 나머지가 함께 막는 흐름이 생겨요. 혼자 최선을 다해도 다 같이 막으면 이기기 어려워요.',
          '**킹메이커**: 이길 가능성이 없어진 사람이 남은 두 사람 중 누가 이길지를 정하게 되는 상황이에요. 이 사람의 선택은 실력보다 감정이나 앙금으로 정해지기 쉬워서, 다인 게임 설계의 오래된 골칫거리예요.',
          '**일시적 동맹**: 공식적인 팀이 없어도, 공통의 적이 있는 동안에는 서로를 공격하지 않는 흐름이 생겨요.',
        ),
        note('다인 게임 설계의 지혜', '그래서 많은 다인 게임은 점수를 끝까지 숨기거나, 탈락한 사람이 판에 영향을 주지 못하게 하거나, 한 판을 짧게 만들어 킹메이커 문제를 줄여요.'),
      ]),
      sec('use', '실전에서 써먹기', [
        tip('두 사람 게임', '내 수를 고를 때 “상대가 가장 아프게 받아친다면?”을 먼저 물어보세요. 상대가 실수해야만 좋은 수는 좋은 수가 아니에요.'),
        tip('여럿이 하는 게임', '1등이 되는 것만큼 1등으로 “보이지 않는 것”이 중요해요. 제로섬 다인 게임에서는 눈에 띄게 앞선 사람이 가장 먼저 견제받아요.'),
        p('PUZZLTHINK의 일대일 게임은 대부분 깔끔한 두 사람 제로섬이에요. 반면 **Hit,Stay**, **무거운 13**, **러시안 룰렛** 같은 다인 게임에서는 견제와 일시적 동맹이 자연스럽게 생기고, **4인 3목**은 모두가 함께 실패할 수 있다는 점에서 제로섬이 아닌 요소가 섞여 있어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'What is a zero-sum game? Meaning, examples, minimax and what happens with three or more',
      description: 'In a zero-sum game, what one player gains another loses. The exact meaning and non-zero-sum games, von Neumann’s minimax, the mixed strategy behind rock-paper-scissors, and the kingmaker problem of multiplayer games, with board game examples.',
      keywords: ['zero-sum game', 'zero-sum meaning', 'zero-sum examples', 'minimax', 'mixed strategy', 'kingmaker', 'game theory basics'],
    },
    title: 'Zero-sum games',
    lead: 'What I gain, you lose. That simple structure shapes the whole way you think.',
    intro: [
      '“Zero-sum” is an everyday phrase: one side’s gain is the other side’s loss, so all gains and losses add up to zero. Most head-to-head board games are like this — if I win, you lose.',
      'This article covers exactly what zero-sum means, how other games differ, the core principle game theory offers for zero-sum games, and how zero-sum gets tangled when three or more play.',
    ],
    summary: 'What one gains, the other loses: the meaning, von Neumann’s minimax, the mixed strategy in rock-paper-scissors and the multiplayer kingmaker problem.',
    sections: [
      sec('define', 'The exact meaning', [
        p('A zero-sum game is one where **the players’ results always add up to the same value, usually zero**. Count a win as +1, a loss as −1 and a draw as 0 each, and every outcome sums to zero. Poker with chips is the same: chips move between players, but the total on the table never changes.'),
        p('If the total is a constant other than zero, the thinking is identical, so such games are also called constant-sum games. In board games the two terms are used almost interchangeably.'),
      ]),
      sec('non', 'Games that are not zero-sum', [
        p('If everyone can win or lose together, it is not zero-sum. Cooperative games are the obvious case: in a game like Pandemic, when you all win, everyone gets +1.'),
        p('Even competitive games can be non-zero-sum. Game theory’s famous **prisoner’s dilemma** is one: if both cooperate, both do fairly well, but if each looks out only for themselves, both end up worse off. In such games, making a better outcome together can matter more than beating the other side.'),
        table(
          ['', 'Zero-sum', 'Not zero-sum'],
          [
            ['Structure', 'One side’s gain = the other’s loss', 'Everyone can gain, or everyone can lose'],
            ['Relationship', 'Pure opposition', 'Room to cooperate'],
            ['Examples', 'Go, chess, heads-up poker', 'Co-op games, semi-co-op games, the prisoner’s dilemma'],
          ],
        ),
      ]),
      sec('minimax', 'Minimax: make the worst case as good as possible', [
        p('In a two-player zero-sum game, **what is best for your opponent is worst for you**. So it is rational to choose the move whose result is best when your opponent answers perfectly. Making the worst case (min) as large as possible (max) gives the principle its name: **minimax**.'),
        p('In a 1928 paper the mathematician John von Neumann published the **minimax theorem**: every two-player zero-sum game has a best strategy in this sense. In 1944 he and the economist Oskar Morgenstern published Theory of Games and Economic Behavior, establishing game theory as a field.'),
        h3('Rock-paper-scissors and mixed strategies'),
        p('At the heart of the minimax theorem is the **mixed strategy**. Always throwing rock gets you read and beaten, but throwing each option at random a third of the time means that whatever your opponent does, you lose nothing on average. When no single pure choice is best, mixing choices by probability creates a best strategy. That is exactly why bluffing games require you to bet big while weak now and then.'),
      ]),
      sec('multi', 'With three or more, zero-sum gets tangled', [
        p('Two-player zero-sum is tidy, but with three or more it changes. The total may be fixed, yet **who takes whose share** brings politics.'),
        ul(
          '**Checking the leader**: the others band together against whoever is ahead. Playing your best is not enough if everyone blocks you.',
          '**Kingmaking**: a player who can no longer win ends up deciding which of the remaining two does. Their choice is easily driven by feelings or grudges rather than skill — a long-standing headache in multiplayer design.',
          '**Temporary alliances**: even without official teams, players leave each other alone while they share an enemy.',
        ),
        note('Multiplayer design wisdom', 'That is why many multiplayer games hide scores until the end, stop eliminated players from affecting the board, or keep games short — all to reduce kingmaking.'),
      ]),
      sec('use', 'Using it in play', [
        tip('Two-player games', 'Before choosing a move, ask how your opponent could hurt you most in reply. A move that is only good if they blunder is not a good move.'),
        tip('Multiplayer games', 'Not looking like the leader matters as much as leading. In zero-sum multiplayer games, whoever is visibly ahead gets checked first.'),
        p('Most PUZZLTHINK one-on-one games are clean two-player zero-sum games. In multiplayer games like **Hit,Stay**, **Heavy 13** and **Russian Roulette**, checking and temporary alliances arise naturally, and **4 Player 3 In a Row** has a non-zero-sum element because everyone can fail together.'),
      ]),
    ],
  },
};

export default article;
