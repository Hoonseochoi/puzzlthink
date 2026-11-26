import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'history-of-baduk',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'wallgo', ko: '이름처럼 바둑의 영역 싸움을 벽으로 옮긴 게임. 돌 대신 벽 하나하나가 경계선이 돼요.', en: 'As its Korean name (wall-baduk) says, go’s territory fight moved to walls: each wall is a border.' },
    { game: 'wallgo2', ko: '움직임이 다른 두 종류의 말로 영역을 다투는 벽바둑의 후속 게임이에요.', en: 'The sequel, with two kinds of pieces that move differently.' },
    { game: 'blindGomoku', ko: '바둑판과 바둑돌로 하는 또 다른 고전, 오목에 기억 요소를 더했어요.', en: 'Another classic played with go stones — gomoku — with memory added.' },
  ],
  related: ['area-control-connection', 'first-move-advantage', 'perfect-information', 'gomoku-renju', 'solved-games'],
  sources: [
    { title: 'History of Go', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/History_of_Go' },
    { title: 'A brief history of Go: the oldest board game in the world', site: 'Culture Trip', url: 'https://theculturetrip.com/asia/china/articles/a-brief-history-of-go-the-oldest-board-game-in-the-world' },
    { title: 'History of Go in China', site: 'GoBase', url: 'https://gobase.org/history/china/?sec=part-4' },
    { title: 'Go in Korea: rules (Sunjang baduk)', site: 'GoBase', url: 'https://gobase.org/history/korea/?sec=rules' },
    { title: 'Lesson 114: the number of star points', site: 'The Korea Times', url: 'https://www.koreatimes.co.kr/lifestyle/others/20070920/lesson-114-the-number-of-star-points' },
    { title: 'Komi (Go)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Komi_(Go)' },
    { title: 'Go rules comparison matrix', site: 'Online-Go.com', url: 'https://online-go.com/docs/go-rules-comparison-matrix' },
    { title: 'AlphaGo’s ultimate challenge: a five-game match against Lee Sedol', site: 'Google Blog', url: 'https://blog.google/technology/ai/alphagos-ultimate-challenge/' },
    { title: 'AlphaGo versus Lee Sedol', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol' },
  ],
  ko: {
    meta: {
      title: '바둑의 역사 — 중국에서 한국으로, 순장바둑과 덤, 알파고까지',
      description: '바둑은 언제 어디서 시작됐을까요? 중국의 오래된 기록, 한국과 일본으로 건너간 길, 한국 고유의 순장바둑, 덤이 6.5집과 7.5집으로 다른 이유, 2016년 알파고와 이세돌 대국까지 바둑의 계보를 정리했어요.',
      keywords: ['바둑 역사', '바둑 기원', '순장바둑', '바둑 덤', '덤 6.5집', '알파고 이세돌', '바둑 규칙 차이'],
    },
    title: '바둑의 역사',
    lead: '검은 돌과 흰 돌, 그리고 열아홉 줄. 2천 년 넘게 사람들이 둘러앉아 온 게임의 계보예요.',
    intro: [
      '바둑은 지금도 널리 두는 보드게임 중 가장 오래된 축에 들어요. 규칙은 몇 줄이면 설명할 수 있는데, 둘 수 있는 판의 수는 상상하기 어려울 만큼 많아요. 그래서 오랫동안 “사람의 직관이 기계를 이기는 마지막 게임”으로 불리기도 했죠.',
      '이 글에서는 바둑이 어디서 시작됐는지, 한국과 일본으로 어떻게 건너갔는지, 한국에서 독자적으로 이어진 순장바둑은 무엇이었는지, 나라마다 규칙이 왜 조금씩 다른지, 그리고 2016년 알파고 대국이 무엇을 바꿨는지를 차례로 살펴봐요.',
    ],
    summary: '중국에서 시작해 한국과 일본으로 건너간 바둑의 계보. 순장바둑, 나라마다 다른 덤, 알파고와 이세돌 대국까지 정리했어요.',
    sections: [
      sec('origin', '어디서 시작됐나', [
        p('바둑은 중국에서 시작됐다는 데 자료들이 일치해요. 중국에서는 웨이치(围棋, 위기), 한국에서는 바둑, 일본에서는 고(碁)라고 불러요. 서양에서 쓰는 “Go”라는 이름은 일본어에서 왔어요.'),
        p('글로 남은 가장 이른 기록으로는 중국의 역사서 『좌전(左傳)』이 흔히 꼽혀요. 기원전 548년의 일을 다루는 대목에 바둑을 좋아하는 사람이 등장해요. 다만 『좌전』이 쓰인 시기는 그보다 뒤인 기원전 4세기 무렵으로 보는 견해가 많아요. 실물로는 한나라 시대(기원전 206년~서기 24년의 전한) 것으로 보이는 도자기 바둑판 조각이 산시성에서 발견된 적이 있어요.'),
        note('전설과 기록 구분하기', '요임금이 아들을 가르치려고 바둑을 만들었다는 이야기처럼 훨씬 오래된 기원 전설도 있어요. 하지만 이런 이야기는 역사적으로 확인되지 않아서, 기록과 유물로 뒷받침되는 시기만 사실로 적었어요.'),
      ]),
      sec('spread', '한국과 일본으로', [
        p('바둑은 대략 5~7세기 사이에 중국에서 한반도로 건너온 것으로 보고, 일본에는 7세기 무렵 전해져 8세기부터 궁정에서 크게 유행했어요. “바둑”이라는 우리말이 어디서 왔는지는 의견이 갈려서 정설이 없어요.'),
        p('근대에 들어서는 일본이 바둑의 제도와 이론을 크게 발전시켰고, 그 영향으로 지금 세계에서 쓰는 바둑 용어 중 상당수가 일본어에서 왔어요. 이후 한국과 중국의 기사들이 세계 대회에서 두각을 나타내면서, 오늘날 바둑은 한·중·일이 함께 이끄는 게임이 됐어요.'),
      ]),
      sec('sunjang', '한국 고유의 바둑: 순장바둑', [
        p('한국에는 현대 바둑과 다른 독자적인 바둑이 오랫동안 이어졌어요. **순장바둑**이라고 불리는 방식이에요. 판은 같은 19줄이지만, 대국을 시작하기 전에 흑과 백이 정해진 자리에 돌을 8개씩, 모두 16개를 미리 놓고 시작해요. 그리고 흑의 첫 수는 판의 한가운데로 정해져 있었어요. 판 위에 미리 정해진 17개의 점이 그 자리를 표시했어요.'),
        p('미리 놓인 돌 때문에 순장바둑은 첫 수부터 바로 싸움이 벌어지는, 매우 전투적인 바둑이었어요. 남아 있는 순장바둑 기보는 대부분 1880년대의 것이에요. 20세기에 들어 일본식 현대 바둑이 퍼지면서 점차 사라졌는데, 언제쯤 완전히 자리를 내줬는지는 20세기 초로 보는 자료와 1950년대로 보는 자료가 엇갈려요.'),
      ]),
      sec('rules', '규칙의 뼈대와 나라별 차이', [
        h3('모두가 같은 부분'),
        ul(
          '흑과 백이 번갈아 교차점에 돌을 하나씩 놓아요.',
          '돌이나 돌 덩어리는 상하좌우로 맞닿은 빈 점(활로)이 모두 막히면 따내져요.',
          '같은 모양이 끝없이 반복되지 않도록 “패” 규칙이 있어요. 따낸 직후 바로 다시 따내는 걸 막아요.',
          '끝났을 때 더 넓은 영역을 차지한 쪽이 이겨요.',
        ),
        h3('세는 방법과 덤'),
        p('나라마다 다른 건 주로 **세는 방법**과 **덤**이에요. 한국과 일본 규칙은 둘러싼 빈 집과 따낸 돌을 세는 방식이고, 중국 규칙은 판 위에 살아 있는 돌과 집을 함께 세는 방식이에요. 결과는 대부분 같지만 세부에서 차이가 나요.'),
        table(
          ['규칙', '덤', '메모'],
          [
            ['한국', '6.5집', '예전에는 5.5집이었어요.'],
            ['일본', '6.5집', ''],
            ['중국', '7.5점', '세는 방식이 달라서 같은 크기의 덤도 숫자가 달라져요.'],
          ],
          '덤은 먼저 두는 흑의 이점을 메우려고 백에게 주는 점수예요.',
        ),
        p('덤에 0.5가 붙는 이유는 비김을 없애기 위해서예요. 집은 정수로 세기 때문에, 반 집을 더해 두면 반드시 한쪽이 이겨요. 덤이 왜 필요한지는 「선공은 왜 유리할까」에서 더 자세히 다뤄요.'),
      ]),
      sec('alphago', '2016년, 알파고', [
        p('바둑은 경우의 수가 워낙 많아서, 체스에서 컴퓨터가 사람을 이긴 뒤에도 오랫동안 사람이 앞서 있었어요. 이 흐름이 바뀐 게 2016년 3월 9일부터 15일까지 서울에서 열린 **알파고와 이세돌 9단의 다섯 판 대국**이에요. 구글 딥마인드의 알파고가 4승 1패로 이겼고, 이세돌 9단은 네 번째 판에서 180수 만에 불계승을 거뒀어요. 이 대국은 중국 규칙에 덤 7.5점으로 치러졌어요.'),
        p('이후 바둑을 공부하는 방식이 크게 바뀌었어요. 프로 기사들도 인공지능의 수를 연구하고, 예전에는 나쁜 수로 여겨지던 수가 다시 평가받기도 했어요. 그래도 바둑판 앞에서 사람끼리 마주 앉는 즐거움은 그대로예요. 기계가 더 잘 둔다고 해서 사람이 두는 재미가 사라지지는 않으니까요.'),
      ]),
      sec('today', '지금 바둑을 즐기는 법', [
        p('19줄 판이 부담스럽다면 9줄이나 13줄 판으로 시작하는 것이 일반적이에요. 판이 작으면 한 판이 짧고, 돌을 따내고 살리는 기본기를 빨리 익힐 수 있어요. 바둑의 핵심 감각인 **경계 짓기**와 **선수 잡기**는 다른 영역 게임에도 그대로 통해요.'),
        tip('PUZZLTHINK와 연결하기', '벽바둑은 바둑의 영역 개념을 벽으로 옮긴 게임이에요. 바둑의 “큰 곳보다 급한 곳”이라는 격언을 그대로 적용해 보세요. 상대가 다음 수에 깰 수 있는 경계부터 닫는 습관이 승률을 올려 줘요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'The history of go (baduk) — from China to Korea, sunjang baduk, komi and AlphaGo',
      description: 'Where and when did go begin? The early Chinese records, its path to Korea and Japan, Korea’s own sunjang baduk, why komi is 6.5 in some rules and 7.5 in others, and the 2016 AlphaGo–Lee Sedol match.',
      keywords: ['history of go', 'origin of go', 'baduk history', 'sunjang baduk', 'komi', 'AlphaGo Lee Sedol', 'go rules differences'],
    },
    title: 'The history of go (baduk)',
    lead: 'Black stones, white stones and nineteen lines — the lineage of a game people have gathered around for over two thousand years.',
    intro: [
      'Go is among the oldest board games still widely played. Its rules fit in a few lines, yet the number of possible positions is almost unimaginable — which is why it was long called the last game where human intuition beat machines.',
      'This article follows where go began, how it reached Korea and Japan, what Korea’s own sunjang baduk was, why the rules differ slightly by country, and what the 2016 AlphaGo match changed.',
    ],
    summary: 'Go’s path from China to Korea and Japan: sunjang baduk, why komi differs by country, and the AlphaGo–Lee Sedol match.',
    sections: [
      sec('origin', 'Where it began', [
        p('Sources agree that go began in China. It is called weiqi in Chinese, baduk in Korean and go in Japanese; the Western name comes from Japanese.'),
        p('The earliest written reference usually cited is the Chinese chronicle Zuo Zhuan, in a passage about events of 548 BCE that mentions a man fond of the game. Many date the text itself later, to around the 4th century BCE. As for objects, a fragment of a pottery go board thought to date from the Western Han dynasty (206 BCE – 24 CE) has been found in Shaanxi province.'),
        note('Legend versus record', 'There are much older origin legends, such as Emperor Yao inventing go to teach his son. They are not historically confirmed, so only periods backed by texts and artefacts are stated as fact here.'),
      ]),
      sec('spread', 'To Korea and Japan', [
        p('Go is thought to have reached the Korean peninsula from China sometime between the 5th and 7th centuries, and Japan around the 7th century, becoming popular at the imperial court from the 8th century. Where the Korean word “baduk” comes from is disputed; there is no settled answer.'),
        p('In the modern era Japan developed go’s institutions and theory greatly, which is why many go terms used worldwide are Japanese. Later Korean and Chinese players rose to the top of international events, and today go is led by China, Japan and Korea together.'),
      ]),
      sec('sunjang', 'Korea’s own go: sunjang baduk', [
        p('Korea long kept its own form of the game, **sunjang baduk**. The board had the same 19 lines, but before play Black and White each placed 8 stones on fixed points — 16 in all — and Black’s first move was fixed at the centre. Seventeen marked points on the board showed those positions.'),
        p('With stones already down, sunjang baduk was fiercely combative, with fighting from the first move. Most surviving game records date from the 1880s. It faded in the 20th century as modern Japanese-style go spread; sources differ on whether it had disappeared by the early 20th century or as late as the 1950s.'),
      ]),
      sec('rules', 'The core rules and national differences', [
        h3('What everyone shares'),
        ul(
          'Black and White alternate placing one stone on an intersection.',
          'A stone or group is captured when all its adjacent empty points (liberties) are filled.',
          'The ko rule prevents endless repetition by forbidding an immediate recapture.',
          'At the end, the side controlling more of the board wins.',
        ),
        h3('Counting and komi'),
        p('What differs is mainly **counting** and **komi**. Korean and Japanese rules count surrounded empty points plus captures; Chinese rules count living stones on the board plus territory. Results almost always agree, but details differ.'),
        table(
          ['Rules', 'Komi', 'Note'],
          [
            ['Korean', '6.5 points', 'Formerly 5.5.'],
            ['Japanese', '6.5 points', ''],
            ['Chinese', '7.5 points', 'Different counting makes an equivalent komi a different number.'],
          ],
          'Komi is the compensation given to White for Black’s first-move advantage.',
        ),
        p('The half point exists to rule out draws: territory is counted in whole points, so adding half a point guarantees a winner. Why komi is needed at all is covered in “Why does moving first help?”.'),
      ]),
      sec('alphago', '2016: AlphaGo', [
        p('Go has so many possibilities that humans stayed ahead long after computers beat them at chess. That changed with the **five-game match between AlphaGo and Lee Sedol 9-dan in Seoul, 9–15 March 2016**. Google DeepMind’s AlphaGo won 4–1; Lee won the fourth game by resignation at move 180. The match was played under Chinese rules with 7.5 komi.'),
        p('How people study go changed a lot afterwards. Professionals study AI moves, and some moves once thought bad have been re-evaluated. Yet the pleasure of sitting across a board from another person is unchanged — a machine playing better does not take away the fun of playing.'),
      ]),
      sec('today', 'Enjoying go today', [
        p('If 19 lines feel daunting, the usual start is a 9×9 or 13×13 board. Games are short, and you learn capturing and making groups live quickly. Go’s core instincts — **drawing borders** and **keeping the initiative** — carry over to other territory games.'),
        tip('Connecting it to PUZZLTHINK', 'Wallgo moves go’s idea of territory onto walls. Apply the go proverb “urgent before big”: close the border your opponent could break next move first, and your results improve.'),
      ]),
    ],
  },
};

export default article;
