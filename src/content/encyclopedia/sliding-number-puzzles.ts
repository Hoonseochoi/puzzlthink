import type { WikiArticle } from './types';
import { p, h3, ol, table, tip, note, sec } from './blocks';

const STRATEGY_KO = ol(
      '**한 모서리를 정하세요.** 가장 큰 숫자를 한쪽 모서리에 두고, 웬만하면 그 자리에서 움직이지 않게 해요.',
      '**쓰는 방향을 줄이세요.** 예를 들어 왼쪽 아래 모서리를 정했다면 주로 왼쪽과 아래로 밀고, 오른쪽은 가끔, 위쪽은 꼭 필요할 때만 밀어요. 위로 밀면 모서리의 큰 숫자가 빠져나가기 쉬워요.',
      '**줄을 크기 순서로 세우세요.** 모서리에서부터 큰 숫자 → 작은 숫자 순으로 한 줄을 채우면, 합칠 때 연쇄적으로 합쳐져요.',
      '**빈칸을 아끼세요.** 빈칸이 많을수록 새 블록이 생겨도 대처할 여유가 생겨요. 합칠 수 있는 수를 남겨 두는 것도 빈칸을 아끼는 방법이에요.',
);

const STRATEGY_EN = ol(
      '**Pick a corner.** Keep your largest number in one corner and avoid moving it.',
      '**Limit your directions.** With the bottom-left corner, for instance, slide mostly left and down, right sometimes, and up only when you must — sliding up easily pulls the big number out of its corner.',
      '**Order the edge row by size.** Fill one row from the corner, biggest to smallest, and merges cascade.',
      '**Save empty cells.** The more empty cells, the more room to cope with new tiles. Leaving merges available is another way to save space.',
);

const article: WikiArticle = {
  slug: 'sliding-number-puzzles',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'merge2048', ko: '4×4 판에서 같은 숫자를 밀어 합쳐요. 2~64는 네모, 128부터는 바둑알 캐릭터로 자라나요.', en: 'Slide and merge equal numbers on 4×4; tiles grow from little squares into go-stone characters from 128.' },
    { game: 'equationTower', ko: '블록 묶음을 들어 옮기고 뒤집는, 움직임 자체가 퍼즐인 숫자 게임이에요.', en: 'A number game where moving and flipping stacks of blocks is the puzzle.' },
    { game: 'magicswap', ko: '두 칸을 맞바꿔 마방진을 되돌려요. 슬라이드 퍼즐처럼 “움직여서 정리하는” 퍼즐이에요.', en: 'Swap pairs of cells to restore a magic square — like a sliding puzzle, it is about tidying by moving.' },
  ],
  related: ['number-puzzles', 'logic-puzzles', 'sudoku-history', 'luck-and-skill', 'what-to-play'],
  sources: [
    { title: '15 puzzle', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/15_puzzle' },
    { title: '15 Puzzle', site: 'Wolfram MathWorld', url: 'https://mathworld.wolfram.com/15Puzzle.html' },
    { title: 'Sam Loyd’s Fifteen', site: 'Cut the Knot', url: 'https://www.cut-the-knot.org/pythagoras/history15.shtml' },
    { title: 'The 15 Puzzle (Slocum & Sonneveld), review', site: 'Cut the Knot', url: 'https://www.cut-the-knot.org/books/Reviews/The15Puzzle.shtml' },
    { title: 'Sam Loyd', site: 'Linda Hall Library', url: 'https://www.lindahall.org/sam-loyd' },
    { title: '2048 (video game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2048_(video_game)' },
    { title: 'gabrielecirulli/2048 README (via fork)', site: 'GitHub', url: 'https://github.com/MicBrain/2048' },
    { title: 'Threes, 2048 and the history of the clones', site: 'The Daily Dot', url: 'https://dailydot.com/threes-2048-app-strategy-history' },
    { title: 'From viral sensation to full-time passion: the 2048 story', site: 'hey.gg', url: 'https://hey.gg/blog/2048' },
  ],
  ko: {
    meta: {
      title: '2048과 슬라이드 숫자 퍼즐의 역사 — 15 퍼즐 열풍에서 2048까지',
      description: '1880년 미국을 휩쓴 15 퍼즐, 그 발명자를 둘러싼 오해, 절반의 배치는 절대 풀 수 없는 이유, 2014년 주말 프로젝트로 시작된 2048과 그 뿌리인 1024·Threes, 그리고 2048을 오래 버티는 전략까지 정리했어요.',
      keywords: ['2048 역사', '2048 만든 사람', '15 퍼즐', '슬라이드 퍼즐', '숫자 퍼즐 역사', '2048 공략', '2048 전략'],
    },
    title: '2048과 슬라이드 숫자 퍼즐',
    lead: '칸을 밀어 숫자를 정리하는 퍼즐. 140년 전의 대유행과 2014년의 대유행은 생각보다 닮았어요.',
    intro: [
      '네모난 틀 안에서 조각을 밀어 움직이는 퍼즐은 오래전부터 있었어요. 그중에서도 숫자가 적힌 조각을 밀어 정리하는 퍼즐은 두 번의 큰 유행을 만들었어요. 한 번은 1880년 미국의 **15 퍼즐**, 또 한 번은 2014년 전 세계의 **2048**이에요.',
      '두 퍼즐은 규칙도 목표도 다르지만, 단순한 조작 하나로 사람들을 몇 시간씩 붙잡아 두었다는 점, 그리고 그 발명을 둘러싸고 이야기가 엇갈렸다는 점이 닮았어요. 이 글에서는 두 퍼즐의 이야기와, 그 안에 숨은 수학과 전략을 정리해요.',
    ],
    summary: '1880년의 15 퍼즐 열풍부터 2014년의 2048까지. 발명을 둘러싼 오해, 절반은 풀 수 없는 수학, 2048을 오래 버티는 전략을 정리했어요.',
    sections: [
      sec('fifteen', '1880년의 열풍, 15 퍼즐', [
        p('15 퍼즐은 4×4 틀 안에 1부터 15까지 적힌 조각 15개와 빈칸 하나가 있는 퍼즐이에요. 빈칸 옆의 조각을 빈칸으로 밀어 넣는 것만 할 수 있고, 섞인 조각을 1부터 15까지 순서대로 정리하면 완성이에요.'),
        p('이 퍼즐은 1880년 미국에서 큰 유행을 일으켰고, 곧 유럽으로도 퍼졌어요. 발명자로 인정받는 사람은 뉴욕주 캐너스토타의 우체국장이었던 **노이스 파머 채프먼**이에요. 그는 1880년에 이 퍼즐로 특허를 신청했어요. 특허 신청 날짜를 2월로 적는 자료와 3월로 적는 자료가 있고, 아이디어 자체는 1870년대에 나왔다는 이야기도 있어요.'),
        h3('샘 로이드를 둘러싼 오해'),
        p('오랫동안 15 퍼즐의 발명자는 미국의 유명한 퍼즐 작가 **샘 로이드**로 알려져 있었어요. 로이드 자신이 1891년부터 1911년 세상을 떠날 때까지 자기가 만들었다고 주장했거든요. 하지만 퍼즐 역사가 제리 슬로컴과 딕 소너벨트의 조사로, 로이드는 이 퍼즐의 발명에도 유행에도 관여하지 않았다는 사실이 밝혀졌어요.'),
      ]),
      sec('math', '절반은 절대 풀 수 없다', [
        p('15 퍼즐에는 유명한 수학적 사실이 있어요. 조각을 틀에서 꺼내 아무렇게나 다시 끼우면, **가능한 배치의 정확히 절반은 아무리 밀어도 완성할 수 없어요.**'),
        p('이유는 “홀짝”에 있어요. 조각을 한 번 밀 때마다 조각들의 순서와 빈칸의 위치가 정해진 방식으로 함께 바뀌는데, 이 둘을 묶은 어떤 홀짝 값은 밀기를 아무리 해도 변하지 않아요. 그래서 완성 상태와 홀짝 값이 다른 배치에서 출발하면 영원히 완성에 닿을 수 없어요. 예를 들어 완성된 판에서 14와 15 두 조각만 맞바꿔 끼운 배치는 절대 풀리지 않아요.'),
        note('밀기 퍼즐의 공통점', '이 성질은 15 퍼즐만이 아니라 빈칸 하나로 조각을 미는 퍼즐 대부분에 나타나요. 잘 만든 슬라이드 퍼즐 앱은 반드시 풀 수 있는 배치에서만 시작하도록 섞어요.'),
      ]),
      sec('2048', '2014년, 주말에 만든 2048', [
        p('2048은 이탈리아의 19살 개발자 **가브리엘레 치룰리**가 만든 웹 게임이에요. 2014년 3월 9일 공개됐고, 코드도 오픈소스로 함께 올라갔어요. 치룰리는 이 게임을 주말 동안 만든 프로젝트라고 소개했어요.'),
        p('2048에는 뿌리가 있어요. 치룰리는 베이보 스튜디오의 앱 「1024」를 바탕으로 만들었다고 밝혔고, 1024는 그보다 앞서 2014년 1월에 나온 모바일 게임 「Threes」를 닮은 게임이었어요. 치룰리는 처음 1024를 접했을 때 Threes를 알지 못했다고 말했어요. 그래서 2048은 Threes의 “간접적인 후손”이라고 부를 수 있어요.'),
        table(
          ['', '15 퍼즐', '2048'],
          [
            ['판', '4×4, 빈칸 하나', '4×4, 빈칸 여러 개'],
            ['조작', '빈칸 옆 조각 하나를 밀기', '모든 블록을 한 방향으로 밀기'],
            ['목표', '정해진 순서로 정리', '합쳐서 2048 만들기 (그 뒤로도 계속)'],
            ['운', '없음 (처음 배치만 섞임)', '있음 (새 블록이 무작위 칸에 생김)'],
            ['끝', '완성하면 끝', '더 밀 수 없으면 끝'],
          ],
        ),
      ]),
      sec('strategy', '2048을 오래 버티는 전략', [
        p('2048에는 새 블록이 빈칸 아무 곳에나 생기는 운 요소가 있지만, 전략에 따라 결과가 크게 달라져요. 가장 널리 알려진 전략은 이래요.'),
        STRATEGY_KO,
        tip('PUZZLTHINK 2048', 'PUZZLTHINK의 2048은 2부터 64까지는 네모 캐릭터, 128부터는 바둑알 캐릭터로 자라고, 2048은 왕관을 써요. 모서리 전략을 지키면 바둑알 캐릭터를 훨씬 자주 만나게 될 거예요.'),
      ]),
      sec('why', '왜 밀기 퍼즐에 빠질까', [
        p('밀기 퍼즐의 매력은 **조작이 단순하고 결과가 바로 보인다**는 거예요. 한 번 밀 때마다 판이 정리되거나 어지러워지는 게 즉시 보이고, “한 번만 더”를 부르는 리듬이 생겨요. 15 퍼즐이 1880년에 그랬듯, 2048도 이 단순함 덕분에 짧은 시간에 전 세계로 퍼졌어요.'),
        p('또 하나는 **계획과 즉흥의 균형**이에요. 15 퍼즐은 완전히 계획의 퍼즐이고, 2048은 계획을 세워도 새 블록 하나에 흔들려요. 그래서 2048을 잘하는 사람은 완벽한 계획보다 “흔들려도 무너지지 않는 모양”을 유지하는 데 집중해요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: '2048 and sliding number puzzles — from the 15 puzzle craze to 2048',
      description: 'The 15 puzzle that swept America in 1880, the myth about its inventor, why half of all arrangements can never be solved, 2048 as a 2014 weekend project and its roots in 1024 and Threes, and strategies to last longer in 2048.',
      keywords: ['history of 2048', 'who made 2048', '15 puzzle', 'sliding puzzle', 'history of number puzzles', '2048 strategy', '2048 tips'],
    },
    title: '2048 and sliding number puzzles',
    lead: 'Puzzles about tidying numbers by sliding them. A craze 140 years ago and one in 2014 have more in common than you would think.',
    intro: [
      'Puzzles where you slide pieces inside a frame are old. Among them, puzzles of sliding numbered pieces into order caused two great crazes: the **15 puzzle** in America in 1880, and **2048** worldwide in 2014.',
      'Their rules and goals differ, but both held people for hours with one simple action, and both have tangled stories about who invented them. This article tells both stories and the mathematics and strategy inside them.',
    ],
    summary: 'From the 1880 15-puzzle craze to 2048 in 2014: the myths about their inventors, the maths that makes half of all positions unsolvable, and how to last longer in 2048.',
    sections: [
      sec('fifteen', 'The craze of 1880: the 15 puzzle', [
        p('The 15 puzzle is a 4×4 frame with fifteen tiles numbered 1 to 15 and one gap. You can only slide a tile next to the gap into it; put the scrambled tiles in order from 1 to 15 and you are done.'),
        p('It caused a huge craze in America in 1880 and soon spread to Europe. The recognised inventor is **Noyes Palmer Chapman**, postmaster of Canastota, New York, who applied for a patent on it in 1880. Some sources date the application to February and others to March, and some say the idea itself goes back to the 1870s.'),
        h3('The Sam Loyd myth'),
        p('For a long time the inventor was believed to be the famous American puzzle writer **Sam Loyd**, who claimed it from 1891 until his death in 1911. Research by the puzzle historians Jerry Slocum and Dic Sonneveld showed that Loyd had nothing to do with either the invention or the craze.'),
      ]),
      sec('math', 'Half can never be solved', [
        p('The 15 puzzle comes with a famous mathematical fact. Take the tiles out and put them back at random, and **exactly half of all possible arrangements can never be completed**, however much you slide.'),
        p('The reason is parity. Each slide changes the order of the tiles and the position of the gap in a fixed way, and a certain combined odd/even value never changes no matter how you slide. Start from an arrangement whose value differs from the solved state and you can never reach it. For example, the solved board with only 14 and 15 swapped is impossible.'),
        note('Common to sliding puzzles', 'This property appears not just in the 15 puzzle but in most one-gap sliding puzzles. Well-made sliding puzzle apps scramble only into arrangements that can be solved.'),
      ]),
      sec('2048', '2014: 2048, made over a weekend', [
        p('2048 is a web game by **Gabriele Cirulli**, a 19-year-old Italian developer, released on 9 March 2014 with its code published as open source. Cirulli described it as a weekend project.'),
        p('2048 has roots. Cirulli said it was based on the app 1024 by Veewo Studio, and 1024 was itself a game resembling Threes, a mobile game released earlier, in January 2014. Cirulli has said he had not heard of Threes when he first came across 1024, so 2048 can be called an indirect descendant of Threes.'),
        table(
          ['', '15 puzzle', '2048'],
          [
            ['Board', '4×4, one gap', '4×4, several empty cells'],
            ['Action', 'Slide one tile next to the gap', 'Slide every tile one direction'],
            ['Goal', 'Arrange in a set order', 'Merge up to 2048 (and keep going)'],
            ['Luck', 'None (only the start is scrambled)', 'Yes (new tiles appear in random cells)'],
            ['End', 'When solved', 'When no move is possible'],
          ],
        ),
      ]),
      sec('strategy', 'Strategies to last longer in 2048', [
        p('2048 has luck — new tiles appear in any empty cell — but strategy changes results a great deal. The best-known strategy:'),
        STRATEGY_EN,
        tip('2048 on PUZZLTHINK', 'On PUZZLTHINK, tiles 2 to 64 are little square characters, from 128 they grow into go-stone characters, and 2048 wears a crown. Keep the corner strategy and you will meet the go-stone characters far more often.'),
      ]),
      sec('why', 'Why sliding puzzles hook you', [
        p('The appeal is that **the action is simple and the result is instant**. Each slide visibly tidies or messes up the board, creating a “just one more” rhythm. As the 15 puzzle did in 1880, 2048 spread worldwide in a short time thanks to that simplicity.'),
        p('There is also **the balance of planning and improvising**. The 15 puzzle is pure planning; in 2048 one new tile can shake any plan. So good 2048 players focus less on a perfect plan than on keeping a shape that bends without breaking.'),
      ]),
    ],
  },
};

export default article;
