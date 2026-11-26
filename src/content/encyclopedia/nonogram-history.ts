import type { WikiArticle } from './types';
import { p, h3, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'nonogram-history',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'nonogram', ko: '가로·세로 숫자로 칸을 칠해 숨은 그림을 완성해요. 매번 새 맵이고 찍기 없이 논리로만 풀려요.', en: 'Fill cells from the row and column clues to reveal a picture; every map is new and solvable by logic alone.' },
    { game: 'binairo', ko: '칸마다 흑과 백 중 하나를 정하는, 노노그램과 닮은 이진 배치 퍼즐이에요.', en: 'A binary placement puzzle — each cell black or white — close in spirit to nonograms.' },
    { game: 'starbattle', ko: '줄마다 정해진 개수를 놓는다는 점에서 노노그램과 같은 “줄 단위 추론”을 써요.', en: 'Like nonograms, it is solved by reasoning line by line about how many things each line holds.' },
  ],
  related: ['logic-puzzles', 'nikoli-puzzles', 'sudoku-history', 'number-puzzles', 'what-to-play'],
  sources: [
    { title: 'Nonogram', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Nonogram' },
    { title: 'Hanjie', site: 'Puzzler', url: 'https://puzzler.com/puzzles-a-z/hanjie' },
    { title: 'Nonogram', site: 'Puzzles Wiki', url: 'https://www.puzzles.wiki/wiki/Nonogram' },
    { title: 'Nonograms (blog post)', site: 'The Strong National Museum of Play', url: 'https://museumofplay.org/?p=9063' },
    { title: 'Mario’s Picross', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mario%27s_Picross' },
    { title: 'Nonogram (complexity)', site: 'HandWiki', url: 'https://handwiki.org/wiki/Nonogram' },
    { title: 'Mario’s Picross', site: 'Super Mario Wiki', url: 'https://www.mariowiki.com/Mario%27s_Picross' },
  ],
  ko: {
    meta: {
      title: '노노그램(네모로직)의 역사 — 빌딩 창문 그림에서 신문 퍼즐, 게임기까지',
      description: '숫자로 칸을 칠해 그림을 찾는 노노그램은 어디서 왔을까요? 1980년대 말 일본의 두 출제자, 노노그램이라는 이름의 유래, 영국 신문 연재, 게임기용 피크로스까지 노노그램의 계보와 푸는 요령을 정리했어요.',
      keywords: ['노노그램 역사', '네모로직', '노노그램 뜻', '노노그램 기원', '피크로스', '그림 로직', '노노그램 푸는 법'],
    },
    title: '노노그램(네모로직)의 역사',
    lead: '숫자만 보고 칠하다 보면 그림이 나타나요. 이 퍼즐은 빌딩 창문의 불빛에서 시작됐다고 전해져요.',
    intro: [
      '노노그램은 판 옆과 위에 적힌 숫자를 보고 칸을 칠해 숨은 그림을 완성하는 퍼즐이에요. 한국에서는 “네모로직”이라는 이름으로도 많이 알려져 있어요. 다른 논리 퍼즐과 달리 다 풀었을 때 **그림이라는 보상**이 있다는 게 특별해요.',
      '이 글에서는 노노그램이 일본에서 어떻게 태어났는지, 이름은 누가 붙였는지, 어떻게 세계로 퍼졌는지를 따라가고, 마지막에 풀이의 기본 원리를 정리해요.',
    ],
    summary: '빌딩 창문의 불빛에서 시작됐다는 퍼즐. 일본의 두 출제자, 이름의 유래, 영국 신문 연재와 피크로스까지 노노그램의 계보를 정리했어요.',
    sections: [
      sec('rules', '노노그램은 이런 퍼즐이에요', [
        p('줄 옆의 숫자는 그 줄에 **연달아 칠해진 칸 덩어리의 길이**를 순서대로 알려 줘요. “3 1”이라면 세 칸짜리 덩어리 하나와 한 칸짜리 덩어리 하나가 이 순서로 있고, 그 사이에는 최소 한 칸 이상 빈칸이 있다는 뜻이에요. 모든 가로줄과 세로줄의 숫자를 동시에 만족시키면 그림이 완성돼요.'),
      ]),
      sec('origin', '1980년대 말 일본, 두 사람의 같은 생각', [
        p('노노그램의 탄생에는 두 사람이 등장해요. 첫 번째는 일본의 그래픽 편집자 **이시다 논**이에요. 이시다 논은 도쿄 고층 빌딩의 창문 불을 켜고 끄는 방식으로 그림을 만드는 아이디어를 바탕으로 이 퍼즐을 고안했다고 알려져 있어요. 비슷한 시기에 일본의 전문 퍼즐 출제자 **니시오 데쓰야**도 따로 같은 형식의 퍼즐을 만들어 다른 잡지에 발표했어요.'),
        note('연도가 엇갈려요', '이시다 논이 이 퍼즐을 처음 내놓은 해를 1987년으로 적은 자료가 많지만, 1988년에 「창문 그림 퍼즐」이라는 이름으로 발표했다고 적은 자료도 있어요. 디자인 공모전과의 관계도 자료마다 설명이 조금씩 달라서, 여기서는 “1980년대 말”로 적었어요.'),
      ]),
      sec('name', '“노노그램”이라는 이름', [
        p('“노노그램(Nonogram)”이라는 이름은 영국의 퍼즐 공급업자 **제임스 달제티**가 붙였다는 데 자료들이 대체로 일치해요. 이시다 논의 이름 “논(Non)”에 도표를 뜻하는 “다이어그램(diagram)”을 합친 말이에요.'),
        p('달제티의 주선으로 영국 신문 『선데이 텔레그래프』가 1990년부터 이시다 논의 퍼즐을 매주 싣기 시작했어요. 이 신문은 1998년 독자 공모로 자기 신문의 퍼즐 이름을 「그리들러(Griddlers)」로 정하기도 했어요. 그래서 노노그램은 지금도 나라와 매체마다 이름이 제각각이에요.'),
        table(
          ['이름', '쓰이는 곳'],
          [
            ['노노그램', '가장 널리 쓰이는 일반 명칭'],
            ['네모로직', '한국에서 흔히 쓰는 이름'],
            ['피크로스', '닌텐도 게임 시리즈의 이름'],
            ['그리들러, 한지에', '영국 등지의 신문·잡지 이름'],
          ],
        ),
      ]),
      sec('picross', '게임기로 간 노노그램', [
        p('노노그램이 더 많은 사람에게 알려진 데에는 비디오 게임도 큰 역할을 했어요. 1995년 3월 일본에서 게임보이용으로 나온 **「마리오의 피크로스」**가 대표적이에요. 닌텐도가 발매한 이 게임은 노노그램 퍼즐을 모은 작품으로, 서양에서는 크게 흥행하지 못했지만 일본에서는 잘 팔려 여러 후속작으로 이어졌어요. 이후 “피크로스”라는 이름의 시리즈가 여러 게임기로 이어졌어요.'),
        p('화면 위의 노노그램은 종이와 다른 장점이 있어요. 드래그로 한 줄을 쭉 칠하고, 틀린 곳을 바로 지울 수 있고, 크기가 큰 퍼즐도 확대해서 볼 수 있어요. 노노그램이 디지털 퍼즐로 특히 잘 어울리는 이유예요.'),
      ]),
      sec('good', '좋은 노노그램, 어려운 노노그램', [
        p('숫자를 아무렇게나 붙인다고 좋은 노노그램이 되지는 않아요. 같은 숫자를 만족하는 그림이 두 가지 이상이면, 푸는 사람은 어느 순간 찍어야 해요. 그래서 잘 만든 노노그램은 **정답이 하나뿐**이고, 가능하면 줄 단위 추론만으로 끝까지 풀리도록 다듬어요.'),
        p('반대로 줄 하나만 봐서는 아무것도 확정되지 않고, 두 줄 이상을 함께 가정해 봐야 풀리는 노노그램도 있어요. 이런 퍼즐은 훨씬 어려워요. 실제로 크기가 제한 없는 일반적인 노노그램 풀이는 컴퓨터 과학에서 NP-완전 문제로 알려져 있어요. 판이 커질수록 일반적인 방법으로는 풀이 시간이 급격히 늘어날 수 있다는 뜻이에요.'),
        p('그래서 노노그램 앱이나 사이트는 대부분 정답이 하나이고 논리로 풀리는지 미리 검사한 퍼즐만 내놓아요. 처음 시작한다면 10×10 정도의 작은 판에서 겹치는 칸 찾기에 익숙해진 뒤 크기를 늘려 가는 게 좋아요.'),
      ]),
      sec('solve', '노노그램 풀이의 기본 원리', [
        h3('겹치는 칸 찾기'),
        p('길이 10인 줄에 숫자 7이 하나 있다면, 7칸짜리 덩어리를 왼쪽 끝에 붙였을 때와 오른쪽 끝에 붙였을 때 **겹치는 가운데 4칸**은 어느 경우든 칠해져요. 이처럼 가능한 배치의 양 끝을 맞대어 보고 겹치는 칸을 확정하는 것이 가장 기본적인 기술이에요.'),
        h3('빈칸 확정하기'),
        p('칠할 칸만큼 칠하지 않을 칸을 확정하는 것도 중요해요. 덩어리가 모두 자리를 잡은 줄의 나머지 칸, 어떤 덩어리도 닿을 수 없는 칸에는 ✕를 쳐 두세요. 가로줄의 ✕가 세로줄의 새 단서가 돼요.'),
        h3('가로와 세로를 번갈아'),
        p('노노그램은 한 줄만 보고는 거의 풀리지 않아요. 가로줄에서 얻은 칸으로 세로줄을 다시 보고, 세로줄에서 얻은 칸으로 다시 가로줄을 보는 **왕복**이 풀이의 리듬이에요.'),
        tip('큰 숫자부터', '처음 시작할 땐 줄 길이에 비해 숫자 합이 큰 줄부터 보세요. 여유 칸이 적을수록 겹치는 칸이 많아서, 판 전체를 여는 첫 실마리가 돼요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'The history of nonograms — from skyscraper windows to newspapers and Picross',
      description: 'Where did nonograms come from? Two Japanese setters in the late 1980s, the origin of the name, the British newspaper series, Picross on game consoles, and the basic techniques for solving them.',
      keywords: ['history of nonograms', 'nonogram meaning', 'origin of nonograms', 'Picross', 'griddlers', 'hanjie', 'how to solve nonograms'],
    },
    title: 'The history of nonograms',
    lead: 'Shade cells from numbers alone and a picture appears. The puzzle is said to have started with skyscraper windows.',
    intro: [
      'A nonogram is a puzzle where the numbers beside and above a grid tell you which cells to fill, revealing a hidden picture. In Korea it is widely known as “nemo logic”. Unlike other logic puzzles, finishing one gives you **a picture as a reward**.',
      'This article follows how nonograms were born in Japan, who named them and how they spread worldwide, and closes with the basic principles of solving.',
    ],
    summary: 'The puzzle said to start with skyscraper windows: two Japanese setters, the name, the British newspaper series and Picross.',
    sections: [
      sec('rules', 'What a nonogram is', [
        p('The numbers beside a line give the **lengths of the runs of filled cells** in that line, in order. “3 1” means a run of three, then a run of one, with at least one empty cell between. Satisfy every row and column at once and the picture is complete.'),
      ]),
      sec('origin', 'Late-1980s Japan: two people, one idea', [
        p('Two people appear in the nonogram’s birth. The first is **Non Ishida**, a Japanese graphics editor, who is said to have devised it from the idea of making pictures by switching skyscraper windows in Tokyo on and off. Around the same time the professional Japanese puzzle setter **Tetsuya Nishio** independently created the same kind of puzzle and published it in a different magazine.'),
        note('Dates differ', 'Many sources say Ishida first presented the puzzle in 1987, but others say Ishida published it in 1988 as “Window Art Puzzles”. Accounts of a design competition also differ, so “the late 1980s” is used here.'),
      ]),
      sec('name', 'The name “nonogram”', [
        p('Sources broadly agree that the name “nonogram” came from **James Dalgety**, a British puzzle supplier, who joined “Non” from Ishida’s name with “diagram”.'),
        p('Through Dalgety, the British newspaper The Sunday Telegraph began printing Ishida’s puzzles weekly in 1990. In 1998 the paper held a reader contest that renamed its puzzles “Griddlers”. That is why nonograms still go by different names in different countries and publications.'),
        table(
          ['Name', 'Where used'],
          [
            ['Nonogram', 'The most widely used general name'],
            ['Nemo logic', 'A common name in Korea'],
            ['Picross', 'Nintendo’s game series'],
            ['Griddlers, Hanjie', 'Newspaper and magazine names in the UK and elsewhere'],
          ],
        ),
      ]),
      sec('picross', 'Nonograms on consoles', [
        p('Video games helped bring nonograms to many more people. A landmark is **Mario’s Picross**, released for the Game Boy in Japan in March 1995. Published by Nintendo, it collected nonogram puzzles; it did not take off in the West but sold well in Japan and led to several sequels, and a “Picross” series continued across many consoles.'),
        p('On a screen nonograms gain advantages over paper: drag to fill a line, erase mistakes instantly, zoom in on large grids. That is why the puzzle suits digital play so well.'),
      ]),
      sec('good', 'Good nonograms and hard ones', [
        p('Attaching numbers to any picture does not make a good nonogram. If two pictures fit the same clues, the solver must guess at some point. So well-made nonograms have **exactly one answer** and are polished so that line-by-line reasoning carries you to the end where possible.'),
        p('Some nonograms, though, give nothing from any single line and only yield when you reason about two or more lines together. Those are much harder. In fact, solving general nonograms of unlimited size is known in computer science to be NP-complete — meaning that as grids grow, solving time by general methods can rise steeply.'),
        p('That is why most nonogram apps and sites only publish puzzles checked in advance to have one answer reachable by logic. If you are starting out, get comfortable finding overlaps on grids of around 10×10, then grow from there.'),
      ]),
      sec('solve', 'The basic principles of solving', [
        h3('Find the overlap'),
        p('In a line of 10 with a single clue of 7, push the run to the left end and to the right end: the **four middle cells where they overlap** are filled either way. Comparing the extreme placements and fixing the overlap is the most basic technique.'),
        h3('Fix the empty cells'),
        p('Settling cells that stay empty matters as much as settling filled ones. Mark ✕ on the rest of a line whose runs are all placed, and on cells no run can reach. An ✕ in a row is a new clue for a column.'),
        h3('Alternate rows and columns'),
        p('A nonogram rarely yields to one line alone. Use cells from rows to revisit columns, then cells from columns to revisit rows — that **back-and-forth** is the rhythm of solving.'),
        tip('Start with big clues', 'At the start, look at lines whose clues add up to nearly the line’s length. The less slack, the more overlap, which gives the first foothold into the whole grid.'),
      ]),
    ],
  },
};

export default article;
