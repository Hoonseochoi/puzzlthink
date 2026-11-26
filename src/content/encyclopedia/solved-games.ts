import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'solved-games',
  category: 'concept',
  updated: '2026-11-26',
  games: [
    { game: 'nineMensMorris', ko: '양쪽이 완벽하게 두면 무승부로 풀린 고전. 하지만 사람끼리는 승부가 분명하게 갈려요.', en: 'Solved as a draw with perfect play — yet games between people end decisively.' },
    { game: 'janggi', ko: '같은 3×4칸 판의 도부츠 쇼기는 후공 필승으로 풀렸어요. 십이장기에서 직접 그 깊이를 느껴 보세요.', en: 'Dobutsu shogi on the same 3×4 board is a solved second-player win; feel that depth in 12 Janggi.' },
    { game: 'russianJanggi', ko: '3×3처럼 작은 판도 덮기와 옮기기가 더해지면 사람에게는 충분히 깊어요.', en: 'Even a 3×3 board runs deep for humans once covering and moving are added.' },
    { game: 'blindGomoku', ko: '자유 오목은 흑 필승으로 풀렸지만, 진영이 안 보이면 이야기가 완전히 달라져요.', en: 'Free-style gomoku is a solved Black win — but hide the sides and the story changes completely.' },
  ],
  related: ['perfect-information', 'first-move-advantage', 'gomoku-renju', 'morris-family', 'capture-games'],
  sources: [
    { title: 'Solved game', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Solved_game' },
    { title: 'Solving games (survey)', site: 'University of Texas, Marijn Heule', url: 'https://www.cs.utexas.edu/~marijn/publications/solving_games.pdf' },
    { title: 'Checkers is solved (Schaeffer et al., Science 2007)', site: 'University of South Carolina (course copy)', url: 'https://www.cse.sc.edu/~mgv/csce580sp17/gradPres/schaeffer_CheckersIsSolved_Science2007.pdf' },
    { title: 'Chinook project milestones', site: 'University of Alberta', url: 'https://webdocs.cs.ualberta.ca/~chinook/project/milestones.html' },
    { title: 'Checkers solved', site: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/checkers-solved' },
    { title: 'Nine Men’s Morris is a draw', site: 'UC Irvine, David Eppstein', url: 'https://ics.uci.edu/~eppstein/cgt/morris.html' },
    { title: 'Go-Moku solved', site: 'UC Irvine, David Eppstein', url: 'https://www.ics.uci.edu/~eppstein/cgt/gomoku.html' },
    { title: 'Othello is Solved (Takizawa)', site: 'arXiv', url: 'https://arxiv.org/abs/2310.19387' },
    { title: 'Computer scientist solves the game of Othello', site: 'Discover Magazine', url: 'https://www.discovermagazine.com/technology/computer-scientist-solves-the-game-of-othello' },
    { title: 'Dōbutsu shōgi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/D%C5%8Dbutsu_sh%C5%8Dgi' },
  ],
  ko: {
    meta: {
      title: '풀린 게임이란? 틱택토·사목·체커·오셀로까지, 완벽한 수가 밝혀진 게임들',
      description: '“풀렸다”는 건 무슨 뜻일까요? 약한 풀이와 강한 풀이의 차이, 틱택토·커넥트 포·나인 멘스 모리스·오목·체커·오셀로·도부츠 쇼기가 풀린 결과, 체스와 바둑이 아직 안 풀린 이유, 풀린 게임도 여전히 재미있는 이유를 정리했어요.',
      keywords: ['풀린 게임', '필승법', '게임 필승법 증명', '체커 풀림', '오셀로 풀림', '틱택토 필승법', '사목 선공 필승'],
    },
    title: '풀린 게임',
    lead: '양쪽이 완벽하게 두면 누가 이기는지 이미 밝혀진 게임들. 그런데 왜 우리는 여전히 둘까요?',
    intro: [
      '컴퓨터가 발전하면서 몇몇 게임은 “정답”이 밝혀졌어요. 처음부터 끝까지 양쪽이 한 번도 실수하지 않으면 결과가 선공 승리인지, 후공 승리인지, 무승부인지가 계산으로 확정된 거예요. 이런 게임을 **풀린 게임**이라고 불러요.',
      '이 글에서는 “풀렸다”의 정확한 뜻과 단계, 지금까지 풀린 대표적인 게임들, 아직 풀리지 않은 게임과 그 이유, 그리고 풀린 게임이 사람에게 여전히 재미있는 이유를 정리해요.',
    ],
    summary: '완벽한 수가 밝혀진 게임들. 풀이의 세 단계, 틱택토부터 체커·오셀로까지 풀린 결과, 체스와 바둑이 아직 남은 이유를 정리했어요.',
    sections: [
      sec('levels', '“풀렸다”의 세 단계', [
        p('게임이 풀렸다는 말에는 강도가 서로 다른 세 가지 뜻이 있어요.'),
        table(
          ['단계', '뜻', '예'],
          [
            ['아주 약한 풀이', '처음 국면의 결과(선공 승·후공 승·무승부)만 알아요. 어떻게 두어야 하는지는 몰라도 돼요.', '헥스 (선공 필승이라는 것만 증명됨)'],
            ['약한 풀이', '처음 국면에서 시작해 그 결과를 실제로 얻어 내는 전략까지 알아요.', '체커, 오셀로'],
            ['강한 풀이', '처음 국면뿐 아니라 나올 수 있는 모든 국면에서 최선의 수를 알아요.', '틱택토, 커넥트 포'],
          ],
        ),
        p('강한 풀이가 가장 완전해요. 중간에 누가 실수해서 처음 계획에서 벗어나도, 그 국면에서의 최선이 무엇인지 알 수 있거든요.'),
      ]),
      sec('list', '지금까지 풀린 대표적인 게임', [
        table(
          ['게임', '완벽하게 두면', '언제, 누가'],
          [
            ['틱택토', '무승부', '손으로도 확인할 수 있을 만큼 작아요.'],
            ['커넥트 포', '선공 승리', '1988년, 제임스 앨런과 빅터 알리스가 각각 따로'],
            ['나인 멘스 모리스', '무승부', '1993년 발표, 1996년 논문 (랄프 가서)'],
            ['자유 오목 (15×15)', '선공 승리', '1990년대 초 (빅터 알리스)'],
            ['도부츠 쇼기', '후공 승리', '2009년 (도쿄대학 연구진)'],
            ['체커 (영미식, 8×8)', '무승부', '2007년 (조너선 섀퍼 연구팀, 치누크)'],
            ['오셀로 (8×8)', '무승부', '2023년 (다키자와 히로키, 약한 풀이)'],
          ],
          '각 결과는 그 게임의 특정 규칙을 기준으로 해요. 규칙이 조금만 바뀌어도 결과가 달라질 수 있어요.',
        ),
        h3('체커가 특별한 이유'),
        p('체커의 풀이는 특히 큰 사건이었어요. 커넥트 포보다 훨씬 복잡한 게임을 18년 넘는 계산 끝에 풀어낸 거예요. 연구팀은 이를 약한 풀이라고 밝혔고, 대표적인 시작 수순들이 모두 무승부로 끝난다는 걸 보였어요.'),
      ]),
      sec('how', '게임은 어떻게 푸는 걸까', [
        p('게임을 푸는 기본 아이디어는 의외로 단순해요. **끝에서부터 거꾸로** 따지는 거예요. 이미 끝난 국면은 누가 이겼는지 바로 알 수 있어요. 그 한 수 전 국면은, 둘 수 있는 수 중 하나라도 “이기는 국면”으로 이어지면 이기는 국면이고, 모든 수가 “지는 국면”으로 이어지면 지는 국면이에요. 이렇게 한 단계씩 거슬러 올라가면 언젠가 처음 국면의 결과가 나와요.'),
        p('문제는 국면의 수예요. 틱택토는 손으로도 따질 수 있지만, 체커나 오셀로는 거대한 계산이 필요해요. 그래서 실제로는 두 가지 방법을 섞어요. 하나는 끝내기 국면들의 결과를 미리 계산해 저장한 **데이터베이스**, 다른 하나는 처음 국면에서 앞으로 몇십 수를 내다보며 필요 없는 가지를 쳐 내는 **탐색**이에요. 두 방법이 중간에서 만나면 처음 국면의 값이 확정돼요. 나인 멘스 모리스와 체커가 모두 이런 방식으로 풀렸어요.'),
        p('대칭도 큰 도움이 돼요. 판을 돌리거나 뒤집어서 같아지는 국면은 한 번만 계산하면 되니까요. 그래도 체스나 바둑은 이런 요령을 모두 써도 계산할 국면이 너무 많아서, 지금의 기술로는 끝까지 갈 수 없어요.'),
      ]),
      sec('unsolved', '아직 풀리지 않은 게임', [
        p('체스와 바둑은 아직 풀리지 않았어요. 이유는 단순해요. **가능한 국면이 너무 많아서**예요. 컴퓨터가 사람보다 훨씬 잘 두게 된 지금도, 처음 국면에서 완벽하게 두면 결과가 무엇인지는 아무도 몰라요.'),
        p('여기서 중요한 구분이 있어요. **사람보다 잘 두는 것**과 **게임을 푸는 것**은 전혀 다른 일이에요. 알파고는 바둑에서 사람을 이겼지만 바둑을 푼 건 아니에요. 아주 강한 수를 찾았을 뿐, 그 수가 완벽하다는 증명은 없어요.'),
        note('렌주도 아직이에요', '자유 오목은 풀렸지만, 금수와 시합용 개시 규칙을 갖춘 렌주는 아직 풀리지 않았어요. 규칙 몇 줄이 게임을 “풀린 것”에서 “열린 것”으로 바꿔 놓은 셈이에요.'),
      ]),
      sec('still-fun', '풀린 게임도 여전히 재미있는 이유', [
        ul(
          '**사람은 그 답을 외울 수 없어요.** 나인 멘스 모리스의 완벽한 수는 약 100억 개 국면에 대한 데이터베이스에 담겨 있어요. 이걸 머릿속에 넣고 두는 사람은 없어요.',
          '**완벽한 상대는 없어요.** 사람끼리 두면 결국 실수를 덜 하는 쪽이 이겨요. 이론상 무승부인 게임도 실제로는 승패가 분명하게 갈려요.',
          '**정답이 있다는 건 오히려 공정하다는 뜻이에요.** 무승부로 풀린 게임은 처음부터 한쪽이 불리하지 않다는 보증이기도 해요.',
        ),
        p('틱택토처럼 사람도 금방 정답을 익힐 수 있는 아주 작은 게임만이 “풀려서 재미없는” 게임이 돼요. 그래서 많은 현대 게임은 작은 판에 덮기, 옮기기, 숨기기 같은 장치를 더해 사람이 쉽게 정답에 닿지 못하게 만들어요.'),
        tip('작은 판 게임을 즐기는 법', '판이 작은 게임은 “이 국면은 이기는 국면일까?”를 끝까지 따져 볼 수 있다는 게 매력이에요. 진 판을 처음부터 다시 놓고, 어느 순간 이기는 국면이 지는 국면으로 바뀌었는지 찾아보세요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Solved games — tic-tac-toe, Connect Four, checkers, Othello and more',
      description: 'What does “solved” mean? Ultra-weak, weak and strong solutions; the results for tic-tac-toe, Connect Four, nine men’s morris, gomoku, checkers, Othello and Dobutsu shogi; why chess and go are unsolved; and why solved games are still fun.',
      keywords: ['solved games', 'solved game list', 'winning strategy proof', 'checkers solved', 'Othello solved', 'tic-tac-toe perfect play', 'Connect Four solved'],
    },
    title: 'Solved games',
    lead: 'Games where we already know who wins with perfect play. So why do we still play them?',
    intro: [
      'As computers advanced, some games had their “answer” found: if neither side ever makes a mistake, whether the result is a first-player win, a second-player win or a draw has been settled by calculation. These are called **solved games**.',
      'This article covers what “solved” means and its levels, the best-known solved games, the ones still unsolved and why, and why solved games stay fun for people.',
    ],
    summary: 'Games whose perfect play is known: the three levels of solution, results from tic-tac-toe to checkers and Othello, and why chess and go remain open.',
    sections: [
      sec('levels', 'Three levels of “solved”', [
        p('“Solved” has three meanings of different strength.'),
        table(
          ['Level', 'Meaning', 'Example'],
          [
            ['Ultra-weakly solved', 'Only the result of the starting position is known; not how to achieve it.', 'Hex (only proven a first-player win)'],
            ['Weakly solved', 'A strategy achieving that result from the starting position is known.', 'Checkers, Othello'],
            ['Strongly solved', 'The best move is known from every reachable position, not just the start.', 'Tic-tac-toe, Connect Four'],
          ],
        ),
        p('A strong solution is the most complete: even if someone deviates by mistake, you still know the best play from that position.'),
      ]),
      sec('list', 'Notable solved games', [
        table(
          ['Game', 'With perfect play', 'When and who'],
          [
            ['Tic-tac-toe', 'Draw', 'Small enough to check by hand.'],
            ['Connect Four', 'First player wins', '1988, James Allen and Victor Allis independently'],
            ['Nine men’s morris', 'Draw', 'Announced 1993, paper 1996 (Ralph Gasser)'],
            ['Free-style gomoku (15×15)', 'First player wins', 'Early 1990s (Victor Allis)'],
            ['Dobutsu shogi', 'Second player wins', '2009 (University of Tokyo researchers)'],
            ['Checkers (English draughts, 8×8)', 'Draw', '2007 (Jonathan Schaeffer’s team, Chinook)'],
            ['Othello (8×8)', 'Draw', '2023 (Hiroki Takizawa, weak solution)'],
          ],
          'Each result applies to that game’s specific rules; a small rule change can change the answer.',
        ),
        h3('Why checkers stands out'),
        p('Solving checkers was a major event: a game far more complex than Connect Four, solved after more than eighteen years of computation. The team described it as a weak solution and showed that the standard opening lines all end in draws.'),
      ]),
      sec('how', 'How a game gets solved', [
        p('The basic idea is surprisingly simple: **work backwards from the end**. A finished position has a known winner. One move earlier, a position is a win if any move leads to a winning position, and a loss if every move leads to a losing one. Step back like this far enough and you reach the value of the starting position.'),
        p('The problem is the number of positions. Tic-tac-toe can be checked by hand, but checkers or Othello need enormous computation. So in practice two methods are combined: **databases** of precomputed endgame results, and **search** that looks dozens of moves ahead from the start while pruning useless branches. When the two meet in the middle, the starting value is settled. Nine men’s morris and checkers were both solved this way.'),
        p('Symmetry helps a lot: positions that match after rotating or flipping the board need calculating only once. Even with every trick, chess and go have too many positions to finish with today’s technology.'),
      ]),
      sec('unsolved', 'Still unsolved', [
        p('Chess and go are unsolved, for a simple reason: **there are far too many positions**. Even now that computers play far better than people, nobody knows the result of perfect play from the start.'),
        p('An important distinction: **playing better than humans** and **solving the game** are entirely different. AlphaGo beat humans at go, but it did not solve go. It found very strong moves, with no proof that they are perfect.'),
        note('Renju is still open', 'Free-style gomoku is solved, but renju with forbidden moves and tournament opening rules is not. A few lines of rules turned a solved game back into an open one.'),
      ]),
      sec('still-fun', 'Why solved games are still fun', [
        ul(
          '**People cannot memorise the answer.** Perfect play in nine men’s morris lives in databases of some ten billion positions. Nobody plays with that in their head.',
          '**There is no perfect opponent.** Between people, whoever makes fewer mistakes wins. Games that are theoretically drawn end decisively in practice.',
          '**An answer means fairness.** A game solved as a draw is a guarantee that neither side starts at a disadvantage.',
        ),
        p('Only tiny games like tic-tac-toe, whose answer people learn quickly, become “solved and boring”. That is why many modern games add covering, moving or hiding to a small board, so that people cannot easily reach the answer.'),
        tip('Enjoying small-board games', 'The charm of a small board is that you can ask “is this position won?” all the way down. Replay a lost game from the start and find the moment a winning position turned into a losing one.'),
      ]),
    ],
  },
};

export default article;
