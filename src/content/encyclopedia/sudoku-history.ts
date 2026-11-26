import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'sudoku-history',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'sudoku', ko: '모든 퍼즐이 정답 하나, 추측 없이 논리만으로 풀려요. 실수 3번이면 끝나니 확실한 칸부터 채우세요.', en: 'Every puzzle has one answer and needs no guessing. Three mistakes end the game, so fill certain cells first.' },
    { game: 'binairo', ko: '스도쿠처럼 줄마다 조건이 걸린 배치 퍼즐. 숫자 대신 흑백 돌을 써요.', en: 'A placement puzzle with per-line rules like sudoku, using black and white stones instead of digits.' },
    { game: 'magicswap', ko: '스도쿠와 같은 정사각형 숫자 판이지만, 이번엔 합을 맞추는 계산 퍼즐이에요.', en: 'Another square grid of numbers — but this time a calculation puzzle about sums.' },
  ],
  related: ['number-puzzles', 'logic-puzzles', 'nikoli-puzzles', 'nonogram-history', 'solved-games'],
  sources: [
    { title: 'Sudoku', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Sudoku' },
    { title: 'Howard Garns', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Howard_Garns' },
    { title: 'Sudoku', site: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/topic/sudoku' },
    { title: 'The history of sudoku', site: 'Sudoku.com', url: 'https://sudoku.com/how-to-play/the-history-of-sudoku/' },
    { title: 'Sudoku’s creator, Maki Kaji (feature)', site: 'nippon.com', url: 'https://www.nippon.com/en/articles/-/16085' },
    { title: 'Maki Kaji', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Maki_Kaji' },
    { title: 'Mathematics of Sudoku', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mathematics_of_Sudoku' },
    { title: 'There is no 16-clue Sudoku (McGuire, Tugemann, Civario)', site: 'arXiv', url: 'https://arxiv.org/abs/1201.0749' },
    { title: 'Mathematician claims breakthrough in Sudoku puzzle', site: 'Scientific American', url: 'https://www.scientificamerican.com/article/mathematician-claims-breakthrough/' },
  ],
  ko: {
    meta: {
      title: '스도쿠의 역사 — 미국 잡지의 넘버 플레이스에서 니콜리, 그리고 세계로',
      description: '스도쿠는 일본 퍼즐일까요? 1979년 미국 잡지의 「넘버 플레이스」, 1984년 니콜리가 붙인 스도쿠라는 이름, 2004년 영국 신문을 통한 세계적 유행, 최소 힌트 17개 증명과 완성판 개수까지 스도쿠의 계보를 정리했어요.',
      keywords: ['스도쿠 역사', '스도쿠 기원', '스도쿠 뜻', '넘버 플레이스', '니콜리 스도쿠', '스도쿠 최소 힌트 17', '스도쿠 경우의 수'],
    },
    title: '스도쿠의 역사',
    lead: '일본 이름을 단 미국 퍼즐이 영국 신문을 타고 세계로. 스도쿠가 걸어온 길은 생각보다 길어요.',
    intro: [
      '스도쿠는 일본어 이름 때문에 일본에서 처음 만든 퍼즐로 알려져 있지만, 지금 형태의 첫 퍼즐은 미국 잡지에 실렸어요. 그 퍼즐이 일본에서 이름과 모양을 얻고, 다시 영국 신문을 통해 전 세계로 퍼졌어요. 이 글은 그 여정을 순서대로 따라가요.',
      '마지막에는 스도쿠를 둘러싼 수학 이야기도 정리해요. 힌트가 최소 몇 개여야 정답이 하나로 정해지는지, 완성된 스도쿠 판은 모두 몇 가지인지 같은 질문들이에요.',
    ],
    summary: '1979년 미국 잡지의 넘버 플레이스, 1984년 니콜리가 붙인 이름, 2004년 영국 신문의 유행까지. 스도쿠의 여정과 수학 이야기를 정리했어요.',
    sections: [
      sec('before', '스도쿠 이전', [
        p('가로·세로에 같은 기호가 겹치지 않게 채운 정사각형 배열은 수학에서 **라틴 방진**이라고 불러요. 스도쿠의 완성된 판은 여기에 “3×3 상자마다도 겹치지 않는다”는 조건을 하나 더한 라틴 방진이에요. 19세기 말 프랑스 신문에 숫자를 채우는 비슷한 퍼즐이 실렸다는 기록도 있지만, 지금의 스도쿠와 같은 형태는 아니었어요.'),
      ]),
      sec('garns', '1979년, 미국의 「넘버 플레이스」', [
        p('지금 형태의 스도쿠는 미국의 건축가이자 프리랜서 퍼즐 출제자였던 **하워드 간스**가 만든 것으로 인정받고 있어요. 1979년 5월, 미국의 퍼즐 잡지 『델 펜슬 퍼즐 앤드 워드 게임스(Dell Pencil Puzzles and Word Games)』에 「넘버 플레이스(Number Place)」라는 이름으로 처음 실렸어요.'),
        p('잡지는 퍼즐에 출제자 이름을 싣지 않았어요. 나중에 뉴욕타임스 십자말풀이 편집자 윌 쇼츠가, 넘버 플레이스가 실린 호마다 앞쪽 기고자 명단에 간스의 이름이 있다는 사실을 찾아내면서 출제자가 밝혀졌어요. 간스는 1989년에 세상을 떠나서, 자기 퍼즐이 세계적으로 유행하는 모습은 보지 못했어요.'),
      ]),
      sec('nikoli', '1984년, 일본에서 얻은 이름', [
        p('넘버 플레이스를 일본에 소개한 곳은 퍼즐 회사 **니콜리**예요. 니콜리의 대표였던 가지 마키가 1984년 4월 퍼즐 잡지에 이 퍼즐을 실으면서 이름을 붙였어요. 원래 이름은 “숫자는 독신에 한한다”는 뜻의 긴 문장이었고, 이것이 줄어 **스도쿠(数独)**, 즉 “숫자는 하나씩”이라는 이름이 됐어요.'),
        p('니콜리는 스도쿠에 자기만의 미감도 더했어요. 처음 주어지는 숫자가 판 위에 **대칭으로 배치**되도록 만든 거예요. 지금도 잘 만든 스도쿠의 상당수가 이 전통을 따라요. 가지 마키는 여러 퍼즐을 일본과 세계에 알린 공로로 “스도쿠의 대부”라고 불렸고, 2021년에 세상을 떠났어요.'),
      ]),
      sec('world', '2004년, 영국 신문을 타고 세계로', [
        p('스도쿠를 세계적인 현상으로 만든 사람은 뉴질랜드 출신으로 홍콩에서 판사로 일했던 **웨인 굴드**예요. 그는 1997년 도쿄의 서점에서 스도쿠 책을 발견했고, 이후 몇 년에 걸쳐 스도쿠를 자동으로 만들어 내는 컴퓨터 프로그램을 개발했어요.'),
        p('그리고 2004년 11월, 영국의 『더 타임스』를 설득해 스도쿠를 싣게 했어요. 반응은 폭발적이었고, 곧 다른 신문들도 앞다투어 스도쿠를 싣기 시작했어요. 스도쿠가 일본 이름을 단 채 전 세계 신문의 퍼즐 면에 자리 잡게 된 계기예요.'),
        table(
          ['연도', '일', '어디서'],
          [
            ['1979', '「넘버 플레이스」 첫 게재 (하워드 간스)', '미국, 델 퍼즐 잡지'],
            ['1984', '「스도쿠」라는 이름으로 소개 (니콜리)', '일본'],
            ['1997', '웨인 굴드가 스도쿠 책을 발견', '일본 도쿄'],
            ['2004', '『더 타임스』 연재 시작, 세계적 유행', '영국'],
          ],
        ),
      ]),
      sec('math', '스도쿠를 둘러싼 수학', [
        h3('힌트는 최소 17개'),
        p('처음 주어진 숫자가 너무 적으면 정답이 여러 개가 돼요. 그렇다면 정답이 하나뿐인 스도쿠의 최소 힌트 수는 몇 개일까요? 17개짜리 퍼즐은 많이 발견됐지만, 16개로는 불가능하다는 걸 증명하는 건 오랜 숙제였어요. 2012년 1월 아일랜드의 수학자 개리 맥과이어 연구팀이 컴퓨터로 모든 경우를 확인해 **16개짜리는 존재하지 않는다**는 결과를 발표했고, 논문은 2014년에 정식으로 실렸어요.'),
        h3('완성된 판은 약 6.67×10²¹가지'),
        p('규칙에 맞게 꽉 채운 스도쿠 판은 모두 6,670,903,752,021,072,936,960가지예요. 2005년 베르트람 펠겐하우어와 프레이저 자비스가 계산했어요. 숫자를 바꾸거나 판을 돌리는 등 본질적으로 같은 판을 하나로 치면 5,472,730,538가지로 줄어요.'),
        note('정답이 하나뿐인 이유', '좋은 스도쿠는 정답이 하나뿐이도록 만들어요. 정답이 둘 이상이면 어느 순간 찍어야 하기 때문이에요. 그래서 “정답이 하나”라는 사실 자체를 단서로 쓰는 고급 기법도 있어요.'),
      ]),
      sec('play', '스도쿠를 잘 푸는 첫걸음', [
        ul(
          '**한 칸이 아니라 한 숫자를 따라가 보세요.** “이 상자에서 7이 들어갈 수 있는 칸은?”을 물으면 빈칸 하나에 들어갈 숫자를 고민할 때보다 빨리 풀리는 경우가 많아요.',
          '**후보를 작게 적어 두세요.** 칸마다 가능한 숫자를 메모하면, 두 칸에 같은 두 후보만 남는 모양(짝) 같은 패턴이 보여요.',
          '**막히면 줄과 상자의 겹침을 보세요.** 한 상자 안에서 어떤 숫자가 한 줄에만 들어갈 수 있다면, 그 줄의 다른 상자에서는 그 숫자를 지울 수 있어요.',
        ),
        tip('PUZZLTHINK 스도쿠', 'PUZZLTHINK의 스도쿠는 모든 퍼즐이 정답 하나이고, 추측 없이 논리만으로 풀 수 있어요. 실수가 3번 쌓이면 끝나니, 확신이 없는 칸은 비워 두고 확실한 칸부터 채우세요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'The history of sudoku — from an American magazine to Nikoli and the world',
      description: 'Is sudoku Japanese? The 1979 “Number Place” in an American magazine, the name Nikoli gave it in 1984, the worldwide craze through a British newspaper in 2004, the proof that 17 clues is the minimum and the number of completed grids.',
      keywords: ['history of sudoku', 'origin of sudoku', 'sudoku meaning', 'Number Place', 'Nikoli sudoku', 'sudoku 17 clues', 'number of sudoku grids'],
    },
    title: 'The history of sudoku',
    lead: 'An American puzzle with a Japanese name that reached the world through a British newspaper.',
    intro: [
      'Because of its Japanese name sudoku is often thought to be a Japanese invention, but the first puzzle in today’s form appeared in an American magazine. It gained its name and look in Japan, then spread worldwide through a British newspaper. This article follows that journey in order.',
      'At the end come the mathematical questions around sudoku: how few clues can still give a single answer, and how many completed grids exist.',
    ],
    summary: 'From the 1979 Number Place to the name Nikoli gave it in 1984 and the 2004 British newspaper craze — sudoku’s journey and its mathematics.',
    sections: [
      sec('before', 'Before sudoku', [
        p('A square filled so that no symbol repeats in any row or column is what mathematicians call a **Latin square**. A completed sudoku is a Latin square with one more condition: no repeats in each 3×3 box either. Number-filling puzzles reportedly appeared in French newspapers in the late 19th century, but not in today’s form.'),
      ]),
      sec('garns', '1979: Number Place in America', [
        p('Today’s sudoku is credited to **Howard Garns**, an American architect and freelance puzzle constructor. It first appeared as “Number Place” in the May 1979 issue of Dell Pencil Puzzles and Word Games.'),
        p('The magazine did not print setters’ names. Later Will Shortz, the New York Times crossword editor, noticed that Garns’s name appeared in the contributor list at the front of every issue that carried Number Place. Garns died in 1989, before his puzzle became a global craze.'),
      ]),
      sec('nikoli', '1984: a name from Japan', [
        p('The puzzle company **Nikoli** brought Number Place to Japan. Its president, Maki Kaji, published it in a Nikoli magazine in April 1984 and named it. The original name was a long phrase meaning “digits must be single”, which was shortened to **sudoku** (数独), “single number”.'),
        p('Nikoli added its own aesthetic: the given numbers are **arranged symmetrically** on the grid. Many well-made sudoku still follow that tradition. Kaji, called “the godfather of sudoku” for spreading many puzzles in Japan and abroad, died in 2021.'),
      ]),
      sec('world', '2004: around the world via a British newspaper', [
        p('The man who made sudoku a global phenomenon was **Wayne Gould**, a New Zealander who had worked as a judge in Hong Kong. He found a sudoku book in a Tokyo bookshop in 1997 and spent the following years writing a computer program that could generate the puzzles.'),
        p('In November 2004 he persuaded The Times in London to print them. The response was explosive, and other newspapers soon rushed to follow — which is how sudoku settled into puzzle pages worldwide with its Japanese name.'),
        table(
          ['Year', 'Event', 'Where'],
          [
            ['1979', 'First “Number Place” (Howard Garns)', 'USA, Dell puzzle magazine'],
            ['1984', 'Introduced under the name “sudoku” (Nikoli)', 'Japan'],
            ['1997', 'Wayne Gould finds a sudoku book', 'Tokyo, Japan'],
            ['2004', 'The Times begins printing it; global craze', 'UK'],
          ],
        ),
      ]),
      sec('math', 'The mathematics of sudoku', [
        h3('At least 17 clues'),
        p('With too few givens a sudoku has several answers. So what is the minimum for a unique answer? Many 17-clue puzzles were known, but proving 16 impossible was a long-standing problem. In January 2012 a team led by the Irish mathematician Gary McGuire announced, after checking every case by computer, that **no 16-clue sudoku exists**; the paper was formally published in 2014.'),
        h3('About 6.67 × 10²¹ completed grids'),
        p('There are 6,670,903,752,021,072,936,960 valid completed grids, as calculated in 2005 by Bertram Felgenhauer and Frazer Jarvis. Counting grids that are essentially the same — relabelled digits, rotations and so on — as one, the number drops to 5,472,730,538.'),
        note('Why one answer', 'Good sudoku are made to have exactly one answer, because two or more would force a guess at some point. Some advanced techniques even use uniqueness itself as a clue.'),
      ]),
      sec('play', 'First steps to solving well', [
        ul(
          '**Follow a digit, not a cell.** Asking “where can 7 go in this box?” often goes faster than asking what fits one empty cell.',
          '**Pencil in small candidates.** With candidates noted, patterns appear — like two cells holding the same two candidates only (a pair).',
          '**When stuck, look where lines and boxes overlap.** If a digit in a box can only go in one row, remove it from that row in the other boxes.',
        ),
        tip('Sudoku on PUZZLTHINK', 'Every PUZZLTHINK sudoku has one answer and can be solved by logic alone. Three mistakes end the game, so leave unsure cells empty and fill certain ones first.'),
      ]),
    ],
  },
};

export default article;
