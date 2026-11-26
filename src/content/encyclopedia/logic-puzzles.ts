import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'logic-puzzles',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'slitherlink', ko: '숫자만큼 변을 지나는 닫힌 고리 하나를 그리는 선 퍼즐이에요.', en: 'Draw one closed loop that passes each number’s cell edges exactly that many times.' },
    { game: 'masyu', ko: '흰 돌과 검은 돌의 꺾임 규칙을 지키며 모든 돌을 지나는 고리를 그려요.', en: 'Draw a loop through every pearl, obeying the turning rules of white and black pearls.' },
    { game: 'nonogram', ko: '줄마다 적힌 숫자로 칠할 칸을 찾아 숨은 그림을 완성해요.', en: 'Use the numbers on each line to find which cells to fill and reveal a picture.' },
    { game: 'starbattle', ko: '줄·열·구역마다 하나씩, 서로 붙지 않게 별(바둑알)을 놓는 배치 퍼즐이에요.', en: 'Place one star per row, column and region, never touching.' },
    { game: 'binairo', ko: '같은 색 셋 연속 금지, 줄마다 흑백 반반. 두 규칙으로 판을 채워요.', en: 'No three of a colour in a row, equal black and white per line.' },
    { game: 'onestroke', ko: '숫자를 순서대로 지나며 모든 칸을 한 번씩만 지나는 선 하나를 그려요.', en: 'One line through every cell exactly once, passing the numbers in order.' },
    { game: 'colorlink', ko: '같은 색 두 점을 겹치지 않는 선으로 잇고 판을 빈틈없이 채워요.', en: 'Join each colour pair without crossing and leave no cell empty.' },
    { game: 'sudoku', ko: '행·열·박스마다 1~9가 한 번씩. 논리 퍼즐의 가장 유명한 얼굴이에요.', en: '1–9 once per row, column and box — the most famous face of logic puzzles.' },
  ],
  related: ['nikoli-puzzles', 'sudoku-history', 'nonogram-history', 'number-puzzles', 'what-to-play'],
  sources: [
    { title: 'Nikoli (publisher)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Nikoli_(publisher)' },
    { title: 'List of Nikoli puzzle types', site: 'Wiki2', url: 'https://wiki2.org/en/List_of_Nikoli_puzzle_types' },
    { title: 'Star Battle rules and info', site: 'GM Puzzles', url: 'https://www.gmpuzzles.com/blog/?p=350' },
    { title: 'Star Battle', site: 'Puzzles Wiki', url: 'https://www.puzzles.wiki/wiki/Star_Battle' },
    { title: 'Takuzu', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Takuzu' },
    { title: 'What game devs can learn from Japan’s most interesting puzzle magazine', site: 'Game Developer', url: 'https://gamedeveloper.com/design/what-game-devs-can-learn-from-japan-s-most-interesting-puzzle-magazine' },
  ],
  ko: {
    meta: {
      title: '논리 퍼즐이란? 스도쿠·노노그램·슬리더링크로 보는 펜슬 퍼즐의 세계',
      description: '정답이 하나뿐이고 추측 없이 풀리는 논리 퍼즐. 선 퍼즐·배치 퍼즐·칠하기 퍼즐·숫자 퍼즐로 나눠 보는 종류, 모든 퍼즐에 통하는 풀이 기술(소거·가정·전체 조건), 대표 퍼즐과 PUZZLTHINK 논리 퍼즐을 정리했어요.',
      keywords: ['논리 퍼즐', '펜슬 퍼즐', '논리 퍼즐 종류', '퍼즐 푸는 법', '슬리더링크', '스타배틀', '비나이로', '니콜리 퍼즐'],
    },
    title: '논리 퍼즐 (펜슬 퍼즐)',
    lead: '정답은 하나, 찍을 필요는 없어요. 규칙에서 출발해 한 칸씩 확정해 가는 즐거움.',
    intro: [
      '스도쿠, 노노그램, 슬리더링크. 이름도 생김새도 다르지만, 이 퍼즐들은 한 가족이에요. **정해진 규칙만으로 정답 하나가 정확하게 결정되고, 운이나 추측 없이 논리만으로 끝까지 풀 수 있다**는 점이 같거든요. 종이와 연필만 있으면 된다는 뜻에서 펜슬 퍼즐이라고도 불러요.',
      '이 글에서는 논리 퍼즐을 모양에 따라 나눠 보고, 어떤 퍼즐에나 통하는 풀이 기술을 정리해요. 하나를 익히면 다른 퍼즐이 훨씬 쉬워지는 이유도 여기에 있어요.',
    ],
    summary: '정답이 하나뿐이고 추측 없이 풀리는 퍼즐들. 선·배치·칠하기·숫자 퍼즐로 나눈 종류와, 모든 퍼즐에 통하는 풀이 기술을 정리했어요.',
    sections: [
      sec('what', '좋은 논리 퍼즐의 약속', [
        p('잘 만든 논리 퍼즐은 푸는 사람과 두 가지 약속을 해요.'),
        ul(
          '**정답이 딱 하나예요.** 답이 여러 개라면 어느 순간 찍어야 해요. 정답이 하나라는 사실 자체가 풀이의 단서가 되기도 해요.',
          '**추측 없이 풀려요.** 매 단계에서 규칙만으로 확정할 수 있는 칸이 반드시 있어요. 막힌 것 같아도 아직 못 본 논리가 있다는 뜻이에요.',
        ),
        p('이 약속 덕분에 논리 퍼즐은 운이 전혀 없는 게임이 돼요. 상대도 없으니, 사실상 **출제자와 푸는 사람 사이의 대화**예요. 출제자는 어려운 단서를 숨겨 두고, 푸는 사람은 그 단서를 찾아내요.'),
      ]),
      sec('kinds', '모양으로 나눈 네 가지 갈래', [
        table(
          ['갈래', '무엇을 하나', '대표 퍼즐'],
          [
            ['선 퍼즐', '선을 그어 고리나 길을 만들어요.', '슬리더링크, 마슈, 한붓길, 넘버링크(컬러 잇기)'],
            ['배치 퍼즐', '정해진 조건에 맞게 물건을 놓아요.', '스타배틀, 비나이로'],
            ['칠하기 퍼즐', '칸을 칠할지 비울지 정해요.', '노노그램'],
            ['숫자 퍼즐', '칸에 숫자를 채워 넣어요.', '스도쿠, 가쿠로, 켄켄'],
          ],
        ),
        p('일본의 퍼즐 회사 니콜리는 이런 퍼즐을 수십 가지 만들거나 다듬어 세계에 알렸어요. 슬리더링크와 마슈가 니콜리에서 나왔고, 스도쿠라는 이름도 니콜리가 붙였어요. 스타배틀은 네덜란드의 한스 엔데박이 2003년 세계 퍼즐 선수권을 위해 고안한 것으로 알려져 있고, 비나이로는 2009년 벨기에의 두 출제자가 만들었다는 설명이 많지만 비슷한 시기의 다른 기원 주장도 있어요.'),
      ]),
      sec('techniques', '모든 퍼즐에 통하는 풀이 기술', [
        h3('1. 확실한 것부터: 소거법'),
        p('“여기는 반드시 이렇다”만큼 “여기는 절대 아니다”도 중요해요. 슬리더링크의 0 주변 변, 스타배틀에서 별 옆 8칸처럼 **안 되는 곳을 먼저 지우면** 남은 곳이 저절로 정해져요. 많은 퍼즐 화면에 ✕ 표시 기능이 있는 이유예요.'),
        h3('2. 국소 패턴 외우기'),
        p('퍼즐마다 자주 나오는 모양이 있어요. 슬리더링크의 3과 3이 붙어 있는 모양, 노노그램에서 줄 길이에 비해 큰 숫자가 있는 줄 같은 것들이요. 이런 패턴을 알면 판을 보자마자 몇 칸을 확정할 수 있어요.'),
        h3('3. 전체 조건 이용하기'),
        p('규칙 중에는 판 전체에 걸린 조건이 있어요. “고리는 하나뿐”, “줄마다 흑백 반반”, “1~9가 한 번씩” 같은 것이요. 국소적인 단서가 바닥났을 때 이런 전체 조건이 결정적인 실마리가 돼요. 예를 들어 고리 퍼즐에서는 작은 고리가 따로 닫히면 안 되기 때문에, 그렇게 될 수밖에 없는 선을 지울 수 있어요.'),
        h3('4. 가정해 보기'),
        p('정말 막혔을 때는 “여기가 칠해졌다고 치면?”을 따라가 봐요. 몇 수 안에 모순이 나오면 반대가 정답이에요. 이건 찍기와 달라요. 결과를 확인하고 되돌아오는 논리적 검증이거든요. 다만 너무 깊이 가정하면 길을 잃기 쉬우니, 짧은 가정부터 시도하는 게 좋아요.'),
        tip('막혔을 때 체크리스트', '1) 아직 ✕를 안 친 “절대 안 되는 곳”이 있는지, 2) 판 전체 조건을 다 썼는지, 3) 두세 수 안에 모순이 나는 칸이 있는지를 차례로 확인해 보세요.'),
      ]),
      sec('why', '왜 계속 풀게 될까', [
        p('논리 퍼즐의 매력은 **확정의 쾌감**이에요. 안개 같던 판이 한 칸씩 정해지다가, 어느 순간 연쇄적으로 쭉 풀리는 구간이 와요. 그 구간이 주는 리듬이 다음 퍼즐로 손을 이끌어요.'),
        p('또 성장이 눈에 보여요. 처음엔 20분 걸리던 크기가 일주일 뒤엔 5분 만에 풀려요. 같은 기술이 다른 퍼즐에서도 통하기 때문에, 한 종류를 깊게 판 사람은 처음 보는 퍼즐도 금방 익혀요.'),
        note('퍼즐과 게임의 차이', '논리 퍼즐에는 상대가 없지만, 같은 문제를 누가 빨리 푸는지 겨루면 훌륭한 대결 게임이 돼요. 세계 퍼즐 선수권 같은 대회가 바로 그런 형식이에요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        ul(
          '**혼자 조용히 집중하고 싶은 사람.** 상대 없이 나만의 속도로 즐길 수 있어요.',
          '**정답이 분명한 걸 좋아하는 사람.** 끝나면 맞았는지 틀렸는지가 확실해요.',
          '**짧은 틈을 채우고 싶은 사람.** 작은 판은 몇 분이면 끝나요.',
        ),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('PUZZLTHINK의 논리 퍼즐은 매번 새로 만든 무작위 맵이고, 모두 정답이 하나뿐이에요. 선 퍼즐로는 **슬리더링크**, **마슈**, **한붓길**, **컬러 잇기**가, 배치 퍼즐로는 **스타배틀**과 **비나이로**가, 칠하기 퍼즐로는 **노노그램**이, 숫자 퍼즐로는 **스도쿠**와 **마방진 스왑**이 있어요. 새 맵을 차지하거나 남의 맵 기록을 뺏는 챌린지와 친구 대결로, 혼자 하는 퍼즐을 겨루는 게임으로 바꿔 즐길 수도 있어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Logic puzzles — the world of pencil puzzles, from sudoku to slitherlink',
      description: 'Logic puzzles have one answer and need no guessing. Their kinds (loop, placement, shading and number puzzles), techniques that work in every one (elimination, assumption, global rules), famous examples and PUZZLTHINK’s logic puzzles.',
      keywords: ['logic puzzles', 'pencil puzzles', 'types of logic puzzles', 'how to solve logic puzzles', 'slitherlink', 'star battle', 'binairo', 'Nikoli puzzles'],
    },
    title: 'Logic puzzles (pencil puzzles)',
    lead: 'One answer, and no guessing. The pleasure of settling the grid one cell at a time, starting from the rules.',
    intro: [
      'Sudoku, nonograms, slitherlink: different names and looks, one family. **The rules alone determine exactly one answer, and you can reach it by logic without luck or guesswork.** Because paper and pencil are all you need, they are also called pencil puzzles.',
      'This article sorts logic puzzles by shape and collects the techniques that work in all of them — which is why learning one makes the others so much easier.',
    ],
    summary: 'Puzzles with one answer and no guessing: loop, placement, shading and number puzzles, and the techniques that work in all of them.',
    sections: [
      sec('what', 'The promise of a good logic puzzle', [
        p('A well-made logic puzzle makes the solver two promises.'),
        ul(
          '**Exactly one answer.** With several, you would eventually have to guess. The uniqueness itself can even be a clue.',
          '**No guessing needed.** At every stage some cell can be settled by the rules alone. If you feel stuck, there is logic you have not seen yet.',
        ),
        p('Those promises make logic puzzles a game with no luck at all. With no opponent, it is really **a conversation between setter and solver**: the setter hides hard clues, the solver finds them.'),
      ]),
      sec('kinds', 'Four branches by shape', [
        table(
          ['Branch', 'What you do', 'Examples'],
          [
            ['Loop and path puzzles', 'Draw lines into loops or paths', 'Slitherlink, Masyu, One Stroke, Numberlink (Color Link)'],
            ['Placement puzzles', 'Place objects to fit conditions', 'Star Battle, Binairo'],
            ['Shading puzzles', 'Decide which cells to fill', 'Nonograms'],
            ['Number puzzles', 'Fill cells with numbers', 'Sudoku, Kakuro, KenKen'],
          ],
        ),
        p('The Japanese puzzle company Nikoli created or refined dozens of these and spread them worldwide: Slitherlink and Masyu come from Nikoli, and Nikoli gave sudoku its name. Star Battle is credited to Hans Eendebak of the Netherlands, devised for the 2003 World Puzzle Championship; Binairo is usually credited to two Belgian setters in 2009, though other origin claims from around the same time exist.'),
      ]),
      sec('techniques', 'Techniques that work everywhere', [
        h3('1. Certain things first: elimination'),
        p('“This cell cannot be” matters as much as “this cell must be”. Cross out the impossible first — the edges around a 0 in slitherlink, the eight cells around a star in Star Battle — and what remains settles itself. That is why so many puzzle screens let you mark ✕.'),
        h3('2. Learn local patterns'),
        p('Every puzzle has shapes that recur: two adjacent 3s in slitherlink, a nonogram line whose clue is large relative to its length. Know them and a few cells are settled the moment you look.'),
        h3('3. Use the global rules'),
        p('Some rules cover the whole grid: “only one loop”, “equal black and white per line”, “1–9 once each”. When local clues run dry, these become the decisive lead. In loop puzzles, for instance, a small loop must never close on its own, so you can remove any line that would force one.'),
        h3('4. Try an assumption'),
        p('When truly stuck, follow “suppose this cell is filled”. If a contradiction appears within a few steps, the opposite is true. This is not guessing — it is a logical check you verify and come back from. Go too deep and you get lost, so try short assumptions first.'),
        tip('A checklist for when you are stuck', '1) Are there impossible places you have not marked yet? 2) Have you used every global rule? 3) Is there a cell that leads to a contradiction within two or three steps?'),
      ]),
      sec('why', 'Why you keep solving', [
        p('The appeal is **the pleasure of certainty**. A foggy grid settles cell by cell until a stretch arrives where everything falls in a chain. That rhythm pulls you to the next puzzle.'),
        p('Progress is visible too. A size that took 20 minutes takes five a week later. Since the same techniques carry across puzzles, someone who digs deep into one type picks up new ones quickly.'),
        note('Puzzles versus games', 'Logic puzzles have no opponent, but racing to solve the same puzzle makes a fine contest. Events like the World Puzzle Championship are exactly that.'),
      ]),
      sec('who', 'Who it suits', [
        ul(
          '**People who want quiet focus alone.** No opponent, your own pace.',
          '**People who like clear answers.** When you finish, you know whether you were right.',
          '**People filling short gaps.** Small grids take minutes.',
        ),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('PUZZLTHINK’s logic puzzles are freshly generated random grids, each with exactly one answer. Loop puzzles: **Slitherlink**, **Masyu**, **One Stroke**, **Color Link**. Placement: **Star Battle** and **Binairo**. Shading: **Nonogram**. Numbers: **Sudoku** and **Magic Square Swap**. Challenges to claim new maps or steal others’ records, and friend duels, turn solo puzzles into contests.'),
      ]),
    ],
  },
};

export default article;
