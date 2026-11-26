import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'nikoli-puzzles',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'slitherlink', ko: '니콜리에서 태어난 고리 퍼즐. 숫자만큼 변을 지나는 끊김 없는 고리 하나를 그려요.', en: 'The loop puzzle born at Nikoli: one unbroken loop passing each number’s edges that many times.' },
    { game: 'masyu', ko: '흰 돌은 곧게 지나고 옆에서 꺾기, 검은 돌은 그 자리에서 꺾고 두 칸씩 뻗기. 니콜리의 진주 목걸이 퍼즐이에요.', en: 'Go straight through white pearls and turn beside them; turn on black pearls and extend two each way.' },
    { game: 'colorlink', ko: '같은 색 두 점을 잇는 넘버링크 계열 퍼즐이에요.', en: 'A Numberlink-style puzzle: join each matching pair.' },
    { game: 'starbattle', ko: '니콜리 출신은 아니지만 같은 펜슬 퍼즐 문화에서 사랑받는 배치 퍼즐이에요.', en: 'Not a Nikoli puzzle, but a placement puzzle loved in the same pencil-puzzle culture.' },
    { game: 'sudoku', ko: '이름을 니콜리가 붙인, 가장 유명한 니콜리식 퍼즐이에요.', en: 'Named by Nikoli — the most famous Nikoli-style puzzle of all.' },
  ],
  related: ['logic-puzzles', 'sudoku-history', 'nonogram-history', 'number-puzzles', 'what-to-play'],
  sources: [
    { title: 'Nikoli (publisher)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Nikoli_(publisher)' },
    { title: 'Maki Kaji', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Maki_Kaji' },
    { title: 'The Japanese puzzle magazine Nikoli (Puzzle Communication Nikoli)', site: 'Atlas Obscura', url: 'https://atlasobscura.com/articles/nikoli-puzzle-communication' },
    { title: 'What game devs can learn from Japan’s most interesting puzzle magazine', site: 'Game Developer', url: 'https://gamedeveloper.com/design/what-game-devs-can-learn-from-japan-s-most-interesting-puzzle-magazine' },
    { title: 'Slitherlink', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Slitherlink' },
    { title: 'Masyu', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Masyu' },
    { title: 'List of Nikoli puzzle types', site: 'Wiki2', url: 'https://wiki2.org/en/List_of_Nikoli_puzzle_types' },
    { title: 'Maki Kaji obituary', site: 'inkl', url: 'https://www.inkl.com/news/maki-kaji-obituary' },
  ],
  ko: {
    meta: {
      title: '니콜리와 펜슬 퍼즐의 계보 — 슬리더링크·마슈는 어떻게 태어났나',
      description: '스도쿠에 이름을 붙이고 슬리더링크와 마슈를 세상에 내놓은 일본의 퍼즐 회사 니콜리. 독자가 퍼즐을 만드는 잡지 문화, 슬리더링크와 마슈의 탄생, 니콜리식 퍼즐의 특징과 푸는 요령을 정리했어요.',
      keywords: ['니콜리', '니콜리 퍼즐', '슬리더링크 역사', '마슈 퍼즐', '펜슬 퍼즐 종류', '일본 퍼즐', '슬리더링크 푸는 법'],
    },
    title: '니콜리와 펜슬 퍼즐의 계보',
    lead: '독자가 퍼즐을 보내고, 잡지가 그 퍼즐을 다듬어요. 슬리더링크와 마슈는 그렇게 태어났어요.',
    intro: [
      '스도쿠, 슬리더링크, 마슈. 지금 전 세계에서 즐기는 논리 퍼즐 중 상당수는 일본의 작은 퍼즐 회사 **니콜리**를 거쳐 세상에 알려졌어요. 니콜리는 퍼즐을 직접 발명하기도 했지만, 그보다 더 특별한 건 **독자들이 새 퍼즐을 만들어 보내는 문화**를 키웠다는 점이에요.',
      '이 글에서는 니콜리가 어떻게 시작됐는지, 슬리더링크와 마슈가 어떻게 태어났는지, 그리고 니콜리식 퍼즐이 공유하는 특징과 PUZZLTHINK에서 바로 써먹을 수 있는 풀이 요령을 정리해요.',
    ],
    summary: '스도쿠에 이름을 붙이고 슬리더링크와 마슈를 내놓은 니콜리. 독자가 퍼즐을 만드는 잡지 문화와 니콜리식 퍼즐의 특징, 푸는 요령을 정리했어요.',
    sections: [
      sec('nikoli', '니콜리의 시작', [
        p('니콜리는 1980년 **가지 마키**가 어린 시절 친구 두 명과 함께 퍼즐 잡지를 창간하면서 시작됐어요. 잡지 이름은 1980년 아일랜드의 큰 경마 대회에서 우승한 경주마의 이름에서 따왔다고 해요. 이 잡지가 나중에 『퍼즐 통신 니콜리』로 이어졌어요.'),
        p('니콜리의 가장 큰 특징은 **독자 참여**예요. 잡지에는 독자가 만든 새로운 퍼즐을 소개하는 코너가 있었고, 반응이 좋은 퍼즐은 정식 연재 퍼즐로 올라갔어요. 니콜리는 이렇게 수많은 퍼즐 종류를 시험하고 다듬었고, 그중 살아남은 것들이 오늘날 “니콜리 퍼즐”로 불려요. 가지 마키는 스도쿠를 세계에 알린 공로로 “스도쿠의 대부”라 불렸고, 2021년에 세상을 떠났어요.'),
      ]),
      sec('slitherlink', '슬리더링크의 탄생', [
        p('슬리더링크도 이런 독자 문화에서 태어났어요. 한 독자가 보낸 아이디어를 니콜리 직원이 다듬다가, 또 다른 독자 도도로키 유키의 제안을 합쳐 지금의 슬리더링크를 만들었다고 전해져요. 니콜리가 내놓은 독창적인 퍼즐 중 초기 대표작으로, 독자 코너에서 시작해 금세 잡지의 정식 퍼즐로 자리 잡았어요.'),
        p('규칙은 짧아요. 점과 점 사이에 선을 그어 **끊기거나 갈라지지 않는 고리 하나**를 만들고, 칸 안의 숫자는 그 칸의 네 변 중 선이 지나는 변의 개수예요. 이 단순한 규칙에서 놀라울 만큼 다양한 추론이 나와요.'),
        note('연도에 대해', '슬리더링크가 니콜리에 처음 실린 정확한 호수와 연도는 두 자료 이상에서 일치하는 기록을 찾지 못해서 적지 않았어요.'),
      ]),
      sec('masyu', '마슈: 진주 목걸이 퍼즐', [
        p('마슈의 초기 형태는 『퍼즐 통신 니콜리』 84호에 「진주 목걸이(신주노쿠비카자리)」라는 이름으로 처음 실렸고, 103호에서 지금의 이름 “마슈”로 바뀌었어요. 판 위의 흰 돌과 검은 돌이 진주처럼 보이고, 그 진주를 모두 꿰는 고리 하나를 그리는 퍼즐이에요.'),
        ul(
          '**검은 돌**: 그 칸에서 반드시 꺾이고, 꺾인 양쪽으로 한 칸 이상 곧게 더 뻗어요.',
          '**흰 돌**: 그 칸은 곧게 지나고, 바로 앞이나 뒤 칸 중 한 곳 이상에서 꺾여요.',
        ),
        p('슬리더링크가 “변”을 다룬다면, 마슈는 칸의 가운데를 지나는 “길”을 다뤄요. 같은 고리 퍼즐이지만 생각하는 방식이 꽤 달라서, 둘을 번갈아 풀면 고리 퍼즐 감각이 넓어져요.'),
      ]),
      sec('family', '니콜리식 퍼즐의 친척들', [
        table(
          ['퍼즐', '갈래', '한 줄 설명'],
          [
            ['스도쿠', '숫자 배치', '이름을 니콜리가 붙였어요. 원형은 미국의 넘버 플레이스예요.'],
            ['슬리더링크', '고리', '숫자만큼 변을 지나는 고리 하나'],
            ['마슈', '고리', '흰 돌·검은 돌의 꺾임 규칙을 지키는 고리'],
            ['넘버링크', '연결', '같은 숫자끼리 겹치지 않게 잇기'],
            ['누리카베, 헤야와케, 하시', '칠하기·다리 놓기', '니콜리 잡지에서 다듬어진 대표 퍼즐들'],
          ],
        ),
        p('스타배틀과 비나이로는 니콜리 출신이 아니에요. 스타배틀은 네덜란드에서, 비나이로는 벨기에에서 나온 것으로 알려져 있어요. 하지만 “정답 하나, 추측 없이 논리로”라는 같은 원칙을 공유해서, 니콜리식 퍼즐과 한 가족처럼 즐겨져요.'),
      ]),
      sec('style', '니콜리식 퍼즐의 약속', [
        ul(
          '**정답은 하나.** 답이 둘 이상인 퍼즐은 실패작으로 여겨요.',
          '**사람이 만든 맛.** 니콜리는 사람 출제자가 의도한 “깨달음의 순간”을 중시해요. 컴퓨터가 만든 퍼즐과 사람이 만든 퍼즐의 차이를 이야기하는 사람이 많아요.',
          '**짧은 규칙.** 대부분 규칙이 두세 줄이에요. 깊이는 규칙이 아니라 판의 설계에서 나와요.',
        ),
      ]),
      sec('tips', 'PUZZLTHINK에서 써먹는 요령', [
        h3('슬리더링크'),
        ul(
          '0 주변의 네 변에는 모두 ✕를 치고 시작하세요.',
          '모서리의 3은 모서리 쪽 두 변이 반드시 선이에요.',
          '나란히 붙은 3과 3은 사이 변과 양쪽 바깥 변이 선이 돼요.',
          '고리는 하나뿐이라서, 작은 고리가 따로 닫히게 만드는 선은 그을 수 없어요.',
        ),
        h3('마슈'),
        ul(
          '판 가장자리에 붙은 검은 돌은 가장자리 반대쪽으로 뻗을 수밖에 없어요.',
          '흰 돌 세 개가 한 줄로 이어져 있으면, 셋 모두 그 줄을 가로지르는 방향으로 지나요.',
          '검은 돌에서 뻗어 나간 첫 칸은 곧게 지나야 해서, 그 칸에서는 꺾을 수 없어요.',
        ),
        tip('막히면', '슬리더링크든 마슈든 고리 퍼즐에서는 “선이 지나는 곳”보다 “선이 절대 지나지 않는 곳”을 먼저 확정하는 편이 빨라요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Nikoli and the lineage of pencil puzzles — how slitherlink and masyu were born',
      description: 'Nikoli, the Japanese puzzle company that named sudoku and introduced slitherlink and masyu: its reader-built magazine culture, the birth of slitherlink and masyu, what Nikoli-style puzzles share, and solving tips.',
      keywords: ['Nikoli', 'Nikoli puzzles', 'history of slitherlink', 'masyu puzzle', 'types of pencil puzzles', 'Japanese logic puzzles', 'how to solve slitherlink'],
    },
    title: 'Nikoli and the lineage of pencil puzzles',
    lead: 'Readers send in puzzles; the magazine polishes them. That is how slitherlink and masyu were born.',
    intro: [
      'Sudoku, slitherlink, masyu: many of the logic puzzles enjoyed worldwide reached the world through a small Japanese puzzle company, **Nikoli**. Nikoli invented puzzles itself, but more special was the **culture of readers creating and sending in new puzzles** that it nurtured.',
      'This article covers how Nikoli began, how slitherlink and masyu were born, what Nikoli-style puzzles share, and solving tips you can use on PUZZLTHINK right away.',
    ],
    summary: 'Nikoli named sudoku and introduced slitherlink and masyu. Its reader-built magazine culture, what its puzzles share, and how to solve them.',
    sections: [
      sec('nikoli', 'How Nikoli began', [
        p('Nikoli began in 1980 when **Maki Kaji** launched a puzzle magazine with two childhood friends. The name reportedly came from a racehorse that won a major Irish race that year. The magazine continued as Puzzle Communication Nikoli.'),
        p('Nikoli’s defining trait is **reader participation**. The magazine had a section introducing new puzzles made by readers, and popular ones were promoted to regular features. Nikoli tested and refined many puzzle types this way, and the survivors are what we call “Nikoli puzzles” today. Kaji, called “the godfather of sudoku” for bringing it to the world, died in 2021.'),
      ]),
      sec('slitherlink', 'The birth of slitherlink', [
        p('Slitherlink came out of this reader culture. A Nikoli staff member developing one reader’s idea combined it with a suggestion from another reader, Yuki Todoroki, to create today’s slitherlink. One of Nikoli’s early original puzzles, it started in the reader section and was soon promoted to the main magazine.'),
        p('The rules are short: draw lines between dots to form **one loop with no breaks or branches**, where a number in a cell says how many of its four edges the loop uses. Remarkably varied reasoning comes out of that simple rule.'),
        note('About the date', 'No record of the exact issue and year slitherlink first appeared in was found to agree across two sources, so it is not given.'),
      ]),
      sec('masyu', 'Masyu: the pearl necklace puzzle', [
        p('An early form of masyu first appeared in Puzzle Communication Nikoli issue 84 as “Shinju no Kubikazari” (pearl necklace) and took its current name, masyu, in issue 103. The white and black circles look like pearls, and you draw one loop that strings them all.'),
        ul(
          '**Black pearl**: the loop must turn there and go straight for at least one more cell on both sides of the turn.',
          '**White pearl**: the loop goes straight through it and turns in at least one of the cells just before or after.',
        ),
        p('Slitherlink is about “edges”; masyu is about “paths” through the centres of cells. Both are loop puzzles but they think quite differently, so alternating between them widens your loop instincts.'),
      ]),
      sec('family', 'Relatives of the Nikoli puzzles', [
        table(
          ['Puzzle', 'Branch', 'In one line'],
          [
            ['Sudoku', 'Number placement', 'Named by Nikoli; the original was America’s Number Place.'],
            ['Slitherlink', 'Loop', 'One loop using each number’s count of edges'],
            ['Masyu', 'Loop', 'A loop obeying white and black pearl rules'],
            ['Numberlink', 'Connection', 'Join matching numbers without crossing'],
            ['Nurikabe, Heyawake, Hashi', 'Shading, bridges', 'Classic puzzles refined in Nikoli’s magazine'],
          ],
        ),
        p('Star Battle and Binairo are not from Nikoli — they are credited to the Netherlands and Belgium respectively — but they share the same principle of “one answer, logic without guessing”, so they are enjoyed as part of the same family.'),
      ]),
      sec('style', 'The Nikoli promise', [
        ul(
          '**One answer.** A puzzle with two answers is considered a failure.',
          '**The human touch.** Nikoli values the “aha” moment a human setter intends. Many people talk about the difference between computer-generated and hand-made puzzles.',
          '**Short rules.** Most have two or three lines of rules; the depth comes from the grid’s design.',
        ),
      ]),
      sec('tips', 'Tips to use on PUZZLTHINK', [
        h3('Slitherlink'),
        ul(
          'Start by crossing out all four edges around every 0.',
          'A 3 in a corner always uses its two corner edges.',
          'Two adjacent 3s use the edge between them and both outer parallel edges.',
          'There is only one loop, so you can never draw a line that closes a small separate loop.',
        ),
        h3('Masyu'),
        ul(
          'A black pearl on the border can only extend away from the border.',
          'Three white pearls in a row are all passed across that row, perpendicular to it.',
          'The first cell on each leg out of a black pearl must be passed straight, so the loop cannot turn there.',
        ),
        tip('When stuck', 'In any loop puzzle, settling where the line can never go is usually faster than finding where it goes.'),
      ]),
    ],
  },
};

export default article;
