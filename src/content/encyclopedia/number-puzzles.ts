import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'number-puzzles',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'sudoku', ko: '숫자를 기호처럼 쓰는 대표 퍼즐. 계산은 하나도 필요 없어요.', en: 'The classic where numbers are just symbols — no arithmetic needed.' },
    { game: 'magicswap', ko: '합이 모두 같아야 하는 마방진에서 뒤바뀐 숫자 쌍을 찾아 바꿔요.', en: 'Find and swap the misplaced pairs in a magic square whose lines must share one sum.' },
    { game: 'merge2048', ko: '같은 숫자를 밀어 합쳐 2048을 만드는 숫자 슬라이드 퍼즐이에요.', en: 'Slide and merge equal numbers until you reach 2048.' },
    { game: 'equationTower', ko: '숫자·기호 블록을 옮기고 뒤집어 타깃 넘버가 되는 탑을 쌓아요.', en: 'Move and flip number and operator blocks to build a tower equal to the target.' },
    { game: 'equationSignal', ko: '신호를 단서로 숨은 9칸 등식을 찾는 숫자 추리 게임이에요.', en: 'Deduce a hidden nine-cell equation from per-cell signals.' },
    { game: 'nemoCount', ko: '숫자 합이 타깃이 되는 직사각형을 빠짐없이 세는 문제예요.', en: 'Count every rectangle whose numbers add up to the target.' },
    { game: 'hexagon', ko: '외운 숫자 중 합이 타깃이 되는 일렬 세 칸을 찾아요.', en: 'From memorised numbers, find three cells in a line that sum to the target.' },
  ],
  related: ['logic-puzzles', 'sudoku-history', 'sliding-number-puzzles', 'memory-games', 'nikoli-puzzles'],
  sources: [
    { title: 'KenKen', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/KenKen' },
    { title: 'Tetsuya Miyamoto', site: 'Hachette Book Group', url: 'https://www.hachettebookgroup.com/contributor/tetsuya-miyamoto/' },
    { title: 'The history of number puzzles', site: 'KenKen Puzzle Journal', url: 'https://discover.kenkenpuzzle.com/journal/history-of-number-puzzles' },
    { title: 'What is a magic square?', site: 'Plus Magazine (University of Cambridge)', url: 'https://plus.maths.org/content/comment/6580' },
    { title: 'Magic square', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Magic_square' },
    { title: 'Kakuro', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Kakuro' },
  ],
  ko: {
    meta: {
      title: '숫자 퍼즐의 종류 — 스도쿠·가쿠로·켄켄·마방진, 계산 퍼즐과 논리 퍼즐의 차이',
      description: '숫자를 기호로만 쓰는 스도쿠부터 덧셈이 핵심인 가쿠로·켄켄, 수천 년 된 마방진, 2048 같은 슬라이드 퍼즐까지. 숫자 퍼즐의 종류와 푸는 요령, 3×3 마방진 가운데가 5인 이유, PUZZLTHINK 숫자 퍼즐을 정리했어요.',
      keywords: ['숫자 퍼즐', '숫자 퍼즐 종류', '마방진', '마방진 푸는 법', '가쿠로', '켄켄', '계산 퍼즐', '두뇌 숫자 게임'],
    },
    title: '숫자 퍼즐',
    lead: '숫자가 나온다고 다 같은 퍼즐은 아니에요. 계산을 하는 퍼즐과, 숫자를 이름표로만 쓰는 퍼즐이 있어요.',
    intro: [
      '“숫자 퍼즐”이라고 하면 계산을 잘해야 할 것 같지만, 가장 유명한 숫자 퍼즐인 스도쿠에는 덧셈이 단 한 번도 필요 없어요. 1부터 9는 그냥 서로 다른 아홉 가지 기호일 뿐이에요. 반대로 가쿠로나 마방진은 덧셈 감각이 풀이의 중심이에요.',
      '이 글에서는 숫자 퍼즐을 “숫자를 어떻게 쓰느냐”로 나눠 보고, 각각에 필요한 감각과 실전 요령, 그리고 PUZZLTHINK에서 즐길 수 있는 숫자 게임을 정리해요.',
    ],
    summary: '스도쿠·가쿠로·켄켄·마방진·2048까지. 숫자를 기호로 쓰는 퍼즐과 계산하는 퍼즐의 차이, 각각의 요령을 정리했어요.',
    sections: [
      sec('kinds', '숫자를 쓰는 세 가지 방식', [
        table(
          ['방식', '숫자의 역할', '대표 퍼즐'],
          [
            ['기호로서의 숫자', '서로 다르다는 것만 중요해요. 색이나 그림으로 바꿔도 퍼즐이 그대로예요.', '스도쿠, 비나이로'],
            ['합과 계산의 숫자', '덧셈·곱셈 같은 계산 결과가 조건이에요.', '가쿠로, 켄켄, 마방진, 수식 퍼즐'],
            ['크기와 변화의 숫자', '숫자가 커지거나 합쳐지는 과정을 다뤄요.', '2048, 슬라이드 숫자 퍼즐'],
          ],
        ),
        p('이 구분을 알면 퍼즐을 고르기 쉬워요. 계산이 부담스럽다면 기호형 퍼즐부터, 암산을 즐긴다면 계산형 퍼즐부터 시작하면 돼요.'),
      ]),
      sec('sum', '계산형 퍼즐의 세계', [
        h3('가쿠로'),
        p('가로세로 낱말 퍼즐처럼 생긴 판에, 줄마다 적힌 합이 되도록 1~9를 채워요. 한 줄 안에서는 같은 숫자를 다시 쓸 수 없어요. 미국의 퍼즐 잡지 출판사 델(Dell)이 「크로스 섬(Cross Sums)」이라는 이름으로 펴낸 것이 시작으로 알려져 있어요.'),
        p('가쿠로의 핵심은 **조합 외우기**예요. 두 칸으로 3을 만드는 방법은 1+2 하나뿐이고, 두 칸으로 17을 만드는 방법은 8+9 하나뿐이에요. 이렇게 방법이 하나뿐인 합을 알아 두면 판 곳곳에서 숫자가 바로 정해져요.'),
        h3('켄켄'),
        p('일본의 수학 교사 미야모토 테츠야가 2004년에 학생들을 위해 만든 퍼즐이에요. 스도쿠처럼 줄마다 숫자가 한 번씩 들어가지만, 굵은 선으로 묶인 칸마다 “합이 7”, “곱이 12” 같은 계산 조건이 붙어 있어요.'),
        h3('마방진'),
        p('가로·세로·대각선의 합이 모두 같도록 숫자를 배치한 정사각형이에요. 중국에는 강에서 나온 거북의 등에 1부터 9까지를 나타내는 점이 새겨져 있었다는 「낙서(洛書)」 전설이 전해지는데, 이 3×3 배치는 어느 줄로 더해도 15가 돼요.'),
      ]),
      sec('magic', '3×3 마방진의 가운데는 왜 5일까', [
        p('계산형 퍼즐의 맛을 보여 주는 작은 증명 하나를 소개할게요. 1부터 9까지를 한 번씩 써서 3×3 마방진을 만들면, 가운데 칸은 **언제나 5**예요.'),
        ul(
          '1부터 9까지의 합은 45예요. 가로줄 세 개가 이 숫자를 모두 나눠 가지니, 한 줄의 합은 45 ÷ 3 = 15예요.',
          '가운데를 지나는 줄은 네 개예요(가운데 가로, 가운데 세로, 대각선 둘). 이 네 줄을 모두 더하면 15 × 4 = 60이에요.',
          '이 네 줄에는 가운데를 뺀 여덟 칸이 한 번씩, 가운데 칸은 네 번 들어가요. 그러니 60 = (45 − 가운데) + 4 × 가운데 = 45 + 3 × 가운데.',
          '따라서 3 × 가운데 = 15, 가운데 = 5예요.',
        ),
        p('이런 식으로 **전체의 합에서 거꾸로 따지는 방법**은 계산형 퍼즐 대부분에서 통해요. 칸 하나하나를 보기 전에 “전체가 얼마여야 하나”부터 계산하면, 숨은 조건이 드러나요.'),
        tip('마방진 스왑에 써먹기', '줄 끝에 보이는 +, − 차이를 보세요. 어떤 가로줄이 +3이고 어떤 세로줄이 −3이라면, 두 줄이 만나는 칸 근처에 범인이 있을 가능성이 높아요. 차이가 같은 크기로 짝지어지는 곳을 찾는 게 요령이에요.'),
      ]),
      sec('symbol', '기호형 퍼즐과 변화형 퍼즐', [
        p('스도쿠는 기호형의 대표예요. 숫자 대신 아홉 가지 색을 써도 똑같이 풀 수 있어요. 그래서 계산 실력보다 **어디에 무엇이 들어갈 수 없는지**를 따지는 소거 능력이 중요해요. 스도쿠의 역사는 「스도쿠의 역사」에서 따로 다뤄요.'),
        p('2048 같은 슬라이드 퍼즐은 또 다른 갈래예요. 정답을 찾는 게 아니라, 숫자를 합쳐 가는 과정을 오래 이어 가는 게 목표예요. 판 한쪽 모서리에 가장 큰 수를 두고 순서대로 줄 세우는 전략이 유명해요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        ul(
          '**암산을 즐기는 사람**이라면 가쿠로·켄켄·수식 퍼즐이 잘 맞아요.',
          '**계산은 싫지만 논리는 좋은 사람**이라면 스도쿠 같은 기호형 퍼즐이 좋아요.',
          '**가볍게 손이 가는 게임을 찾는 사람**이라면 2048처럼 정답이 없는 변화형 퍼즐이 좋아요.',
        ),
        note('두뇌 훈련 효과에 대해', '숫자 퍼즐이 머리를 좋게 해 준다는 이야기가 많지만, 퍼즐 실력이 다른 능력으로 얼마나 옮겨 가는지는 연구마다 결론이 달라요. 여기서는 “그 퍼즐을 잘하게 된다”는 것만 확실하게 말할 수 있어요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('PUZZLTHINK에는 세 갈래가 모두 있어요. 기호형으로는 **스도쿠**, 계산형으로는 **마방진 스왑**, **수식의 탑**, **수식 신호등**, **네모 세기**, **헥사곤**이, 변화형으로는 **2048**이 있어요. 특히 수식의 탑과 수식 신호등은 계산과 논리를 함께 써야 하는 PUZZLTHINK만의 숫자 게임이에요. 네모 세기는 합이 타깃이 되는 직사각형을 빠짐없이 세야 해서, 체계적으로 세는 습관이 곧 실력이에요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Types of number puzzles — sudoku, kakuro, KenKen, magic squares and more',
      description: 'From sudoku, where numbers are only symbols, to kakuro and KenKen, built on addition, ancient magic squares and sliding puzzles like 2048: the kinds of number puzzles, how to approach each, why a 3×3 magic square has 5 in the middle, and PUZZLTHINK number games.',
      keywords: ['number puzzles', 'types of number puzzles', 'magic square', 'how to solve magic squares', 'kakuro', 'KenKen', 'math puzzles', 'number brain games'],
    },
    title: 'Number puzzles',
    lead: 'Not every puzzle with numbers is alike. Some make you calculate; others use numbers only as labels.',
    intro: [
      '“Number puzzle” sounds like you need to be good at arithmetic, yet sudoku, the most famous one, never asks you to add anything. 1 to 9 are just nine different symbols. Kakuro and magic squares, on the other hand, revolve around a feel for sums.',
      'This article sorts number puzzles by how they use numbers, then covers what each needs, practical tips and the number games on PUZZLTHINK.',
    ],
    summary: 'Sudoku, kakuro, KenKen, magic squares, 2048: the difference between puzzles that treat numbers as symbols and those that calculate, with tips for each.',
    sections: [
      sec('kinds', 'Three ways to use numbers', [
        table(
          ['Way', 'Role of the numbers', 'Examples'],
          [
            ['Numbers as symbols', 'Only being different matters; swap in colours and nothing changes.', 'Sudoku, Binairo'],
            ['Numbers to calculate', 'Sums or products are the conditions.', 'Kakuro, KenKen, magic squares, equation puzzles'],
            ['Numbers that grow', 'The puzzle is about numbers increasing or merging.', '2048, sliding number puzzles'],
          ],
        ),
        p('Knowing this makes choosing easy: if arithmetic feels like a chore, start with symbol puzzles; if you enjoy mental maths, start with calculation puzzles.'),
      ]),
      sec('sum', 'Calculation puzzles', [
        h3('Kakuro'),
        p('On a grid shaped like a crossword, fill 1–9 so each run adds up to its clue, with no repeated digit within a run. It is known to have started as “Cross Sums”, published by the American puzzle-magazine publisher Dell.'),
        p('The key to kakuro is **memorising combinations**. Two cells making 3 can only be 1+2; two cells making 17 can only be 8+9. Know the sums with a single combination and digits fall into place all over the grid.'),
        h3('KenKen'),
        p('Created in 2004 by the Japanese maths teacher Tetsuya Miyamoto for his students. Like sudoku, each digit appears once per row and column, but boldly outlined cages carry conditions like “sum 7” or “product 12”.'),
        h3('Magic squares'),
        p('A square of numbers whose rows, columns and diagonals all share one sum. A Chinese legend, the Lo Shu, tells of a turtle emerging from a river with dots for 1 to 9 on its shell; that 3×3 arrangement adds to 15 along every line.'),
      ]),
      sec('magic', 'Why the centre of a 3×3 magic square is 5', [
        p('Here is a small proof that shows the flavour of calculation puzzles. Make a 3×3 magic square with 1 to 9 once each, and the centre is **always 5**.'),
        ul(
          '1 to 9 add up to 45. Three rows share all of it, so each line sums to 45 ÷ 3 = 15.',
          'Four lines pass through the centre (middle row, middle column, two diagonals). Together they add up to 15 × 4 = 60.',
          'Those four lines contain each of the eight outer cells once and the centre four times. So 60 = (45 − centre) + 4 × centre = 45 + 3 × centre.',
          'Hence 3 × centre = 15, and the centre is 5.',
        ),
        p('**Reasoning backwards from the total** works in most calculation puzzles. Before looking at single cells, work out what the whole must add up to, and hidden conditions appear.'),
        tip('Using it in Magic Square Swap', 'Watch the +/− differences at the ends of lines. If one row is +3 and one column is −3, a culprit probably sits near where they cross. Look for places where differences pair up in equal size.'),
      ]),
      sec('symbol', 'Symbol puzzles and growth puzzles', [
        p('Sudoku is the archetypal symbol puzzle: use nine colours instead of digits and it solves the same way. So what matters is not arithmetic but working out **what cannot go where**. Its history has its own article, “The history of sudoku”.'),
        p('Sliding puzzles like 2048 are another branch. The goal is not to find an answer but to keep the merging going as long as possible. Keeping the largest number in one corner and lining the others up in order is the famous strategy.'),
      ]),
      sec('who', 'Who it suits', [
        ul(
          '**If you enjoy mental arithmetic**, try kakuro, KenKen and equation puzzles.',
          '**If you dislike calculating but like logic**, try symbol puzzles like sudoku.',
          '**If you want something to pick up casually**, try open-ended growth puzzles like 2048.',
        ),
        note('On brain-training claims', 'Number puzzles are often said to make you smarter, but studies disagree on how far puzzle skill transfers to other abilities. What can be said for sure is that you get better at that puzzle.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('PUZZLTHINK has all three branches. Symbol: **Sudoku**. Calculation: **Magic Square Swap**, **Tower of Equations**, **Equation Signal**, **Nemo Count** and **Hexagon**. Growth: **2048**. Tower of Equations and Equation Signal in particular are PUZZLTHINK number games that need calculation and logic together. Nemo Count asks you to count every rectangle that sums to the target, so a systematic counting habit is the skill.'),
      ]),
    ],
  },
};

export default article;
