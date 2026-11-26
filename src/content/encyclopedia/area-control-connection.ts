import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'area-control-connection',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'wallgo', ko: '말을 옮기고 벽을 세워 판을 쪼개요. 끝났을 때 내 말이 있는 공간의 칸 수가 점수예요.', en: 'Move and build walls until the board splits; your score is the size of the spaces your pieces are in.' },
    { game: 'wallgo2', ko: '사각 말은 곧게, 원형 말은 꺾어서. 움직임이 다른 두 말로 영역을 지켜요.', en: 'Square pieces go straight, round ones turn — two movement types to defend your territory with.' },
    { game: 'monorail', ko: '철로 타일을 번갈아 놓아 하나의 순환선을 완성하는 연결 게임이에요.', en: 'A connection game: lay track tiles in turn and be the one to close a single loop.' },
    { game: 'colorLinkDuel', ko: '같은 색끼리 겹치지 않게 이을 수 있는 판을 두고 겨루는 연결 대결이에요.', en: 'A duel over whether every colour pair on the board can still be joined without crossing.' },
    { game: 'colorlink', ko: '같은 색 두 점을 선으로 잇고 판을 빈틈없이 채우는 혼자 하는 연결 퍼즐이에요.', en: 'The solo version: join each colour pair and fill every cell of the board.' },
  ],
  related: ['abstract-strategy', 'history-of-baduk', 'perfect-information', 'logic-puzzles', 'solved-games'],
  sources: [
    { title: 'Hex (board game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Hex_(board_game)' },
    { title: 'Hex and beautiful minds (talk slides)', site: 'University of Alberta, Ryan Hayward', url: 'https://cs.ualberta.ca/~hayward/talks/hex.beautifulminds.pdf' },
    { title: 'Using Brouwer’s fixed point theorem (Hex theorem)', site: 'arXiv', url: 'https://arxiv.org/pdf/1409.7890' },
    { title: 'Rules of Go', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Rules_of_Go' },
    { title: 'Reversi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Reversi' },
  ],
  ko: {
    meta: {
      title: '영역 게임과 연결 게임 — 땅을 넓히고 길을 잇는 보드게임의 원리',
      description: '바둑처럼 땅을 둘러싸는 영역 게임과 헥스처럼 양쪽을 잇는 연결 게임. 두 장르가 어떻게 작동하는지, 왜 비기기 어려운지, 필요한 감각과 대표작, PUZZLTHINK 벽바둑·모노레일·컬러 링크까지 정리했어요.',
      keywords: ['영역 게임', '땅따먹기 보드게임', '연결 게임', '헥스 보드게임', '벽바둑', '영역 싸움 게임', '바둑 같은 게임'],
    },
    title: '영역 장악과 연결 게임',
    lead: '상대를 잡는 대신, 더 넓게 차지하거나 먼저 이어요.',
    intro: [
      '장기와 체스는 상대 왕을 잡으면 끝나요. 하지만 보드게임에는 아무도 잡지 않고도 이기는 방법이 있어요. 판에서 **더 넓은 땅을 차지하거나**, 판의 한쪽 끝에서 다른 쪽 끝까지 **먼저 길을 잇는** 거예요.',
      '이 두 갈래는 생김새는 달라도 생각하는 방식이 많이 닮았어요. 둘 다 “지금 이 한 수가 판 전체의 경계를 어떻게 바꾸는가”를 보는 게임이거든요. 이 글에서는 영역 게임과 연결 게임을 함께 살펴봐요.',
    ],
    summary: '상대를 잡는 대신 더 넓게 차지하거나 먼저 잇는 게임들. 바둑과 헥스, 벽바둑과 모노레일이 공유하는 생각법을 정리했어요.',
    sections: [
      sec('area', '영역 게임: 경계를 긋는 게임', [
        p('영역 게임은 판을 나눠 가지는 게임이에요. 가장 유명한 건 바둑이에요. 돌로 빈 곳을 둘러싸면 그 안이 내 집이 되고, 끝났을 때 집이 더 많은 쪽이 이겨요. 오셀로도 넓게 보면 영역 게임이에요. 판 위 돌의 개수, 즉 차지한 칸의 수로 승부를 내니까요.'),
        p('영역 게임에서 중요한 건 **경계선**이에요. 땅은 한 칸씩 채워서 얻는 게 아니라, 울타리를 쳐서 한꺼번에 얻어요. 그래서 고수는 칸을 세기 전에 “이 선이 닫히면 안쪽이 누구 것이 되나”를 먼저 봐요. 같은 한 수라도 경계를 닫는 수는 수십 칸의 가치가 있고, 경계 안쪽을 채우는 수는 거의 가치가 없어요.'),
        h3('넓게 vs 단단하게'),
        p('영역 게임의 영원한 고민은 크게 둘러싸면 약하고, 단단하게 둘러싸면 작다는 거예요. 넓게 벌린 울타리에는 상대가 비집고 들어올 틈이 생기고, 촘촘한 울타리는 손이 많이 가서 다른 곳을 놓쳐요. 이 균형 감각이 영역 게임 실력의 핵심이에요.'),
      ]),
      sec('connection', '연결 게임: 먼저 잇는 게임', [
        p('연결 게임은 정해진 두 지점이나 두 변을 내 말로 먼저 잇는 게임이에요. 대표작은 **헥스**예요. 마름모 모양의 육각형 판에서 각자 마주 보는 두 변을 맡고, 번갈아 칸 하나씩을 칠해서 내 두 변을 먼저 이으면 이겨요. 1942년 덴마크의 피트 하인이 신문에 처음 발표했고, 몇 년 뒤 미국의 수학자 존 내시가 따로 같은 게임을 생각해 냈다고 알려져 있어요.'),
        h3('막는 것이 곧 잇는 것'),
        p('헥스에는 아름다운 성질이 있어요. 판이 다 채워지면 **반드시 한쪽은 이어져 있어요.** 비길 수가 없다는 뜻이에요. 그래서 상대의 길을 완전히 막는 것과 내 길을 잇는 것이 사실상 같은 일이 돼요. 수학적으로 증명된 이 성질 덕분에 헥스는 게임 이론에서 자주 예로 쓰여요.'),
        h3('끊기지 않는 연결'),
        p('연결 게임의 고수는 칸을 일렬로 잇지 않아요. 두 칸 사이에 빈칸을 두 개 남겨 두면, 상대가 하나를 막을 때 다른 하나로 이으면 되니까 사실상 이어진 것과 같아요. 이렇게 **한 번에 끊을 수 없는 느슨한 연결**로 빠르게 뻗어 나가는 것이 연결 게임의 기본 전략이에요.'),
      ]),
      sec('compare', '두 장르 한눈에 비교', [
        table(
          ['', '영역 게임', '연결 게임'],
          [
            ['이기는 조건', '끝났을 때 더 많이 차지', '정해진 곳을 먼저 이음'],
            ['게임 길이', '판이 나뉠 때까지 진행', '연결되는 순간 바로 끝'],
            ['핵심 감각', '경계가 닫히는 곳 찾기', '끊기지 않는 길 만들기'],
            ['비김', '점수가 같으면 가능', '헥스처럼 구조상 불가능한 경우도 많음'],
            ['대표작', '바둑, 오셀로, 벽바둑', '헥스, 모노레일'],
          ],
        ),
      ]),
      sec('skills', '필요한 실력', [
        ul(
          '**전체를 보는 눈.** 한 곳의 작은 싸움보다 판 전체에서 어디가 아직 정해지지 않았는지를 봐야 해요.',
          '**가치 비교.** 큰 땅을 확정하는 수와 상대 땅을 깎는 수 중 무엇이 더 큰지 비교하는 계산이 필요해요.',
          '**마무리 정확도.** 끝내기에서 한두 칸 차이로 승패가 갈리는 경우가 많아서, 마지막 몇 수를 정확히 세는 습관이 중요해요.',
        ),
        tip('바둑의 격언이 통해요', '“큰 곳보다 급한 곳”이라는 바둑 격언은 거의 모든 영역 게임에 적용돼요. 상대가 다음 수에 크게 깰 수 있는 경계부터 막고, 그다음에 넓히세요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        p('공간을 머릿속에 그리는 걸 좋아하고, 한 번의 싸움보다 판 전체의 흐름을 운영하는 걸 즐기는 사람에게 잘 맞아요. 잡고 잡히는 게임보다 분위기가 덜 날카로워서, 공격적인 게임이 부담스러운 사람에게도 좋아요. 대신 끝날 때까지 결과가 잘 보이지 않는 경우가 많으니, 형세를 어림하는 연습이 필요해요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('**벽바둑**은 영역 게임의 핵심을 아주 짧은 규칙에 담은 게임이에요. 말을 0~2칸 옮긴 뒤 반드시 벽 하나를 세우고, 모든 플레이어의 공간이 분리되면 내 말이 있는 공간의 칸 수로 승부를 내요. 벽 하나가 곧 경계선이라서, “이 벽이 닫히면 누구 땅이 되나”를 계속 따지게 돼요. **벽바둑 II**는 말마다 움직이는 방식이 달라 같은 경계를 더 정교하게 다퉈요.'),
        p('**모노레일**은 연결 게임이에요. 직선과 ㄱ자 철로 타일을 번갈아 놓다가, 마지막 타일로 기차역에서 출발해 돌아오는 순환선을 완성하는 사람이 이겨요. **컬러 링크** 대결은 같은 색끼리 겹치지 않게 이을 수 있는 판을 지키는 게임이고, 혼자 하는 **컬러 잇기**는 연결 퍼즐로 이 감각을 연습하기에 좋아요.'),
        note('알아 두면 좋은 점', '벽바둑은 3인전과 1:1이 있어요. 셋이 하면 둘이 한 명을 견제하는 흐름이 생겨서, 순수한 영역 계산에 약간의 정치가 더해져요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Territory and connection games — claiming space and joining paths',
      description: 'Territory games like go, where you surround space, and connection games like Hex, where you join two sides. How they work, why some cannot end in a draw, the skills they need, classic examples and PUZZLTHINK’s Wallgo, Monorail and Color Link.',
      keywords: ['territory games', 'area control board games', 'connection games', 'Hex board game', 'Wallgo', 'games like go'],
    },
    title: 'Territory and connection games',
    lead: 'Instead of capturing, claim more space — or connect first.',
    intro: [
      'Chess and janggi end when a king falls. But there are games you win without capturing anything: by **owning more of the board**, or by **joining one edge to another first**.',
      'The two look different but think alike. Both ask how one move changes the borders of the whole board. This article looks at territory games and connection games together.',
    ],
    summary: 'Games won by claiming more space or connecting first rather than capturing. The way of thinking go and Hex — and Wallgo and Monorail — share.',
    sections: [
      sec('area', 'Territory games: drawing borders', [
        p('Territory games divide the board. The best known is go: surround empty points with stones and they become yours; whoever has more at the end wins. Othello is a territory game too, in a broad sense — it is decided by how many squares you hold.'),
        p('What matters in a territory game is the **border**. You do not gain land one cell at a time; you fence it in all at once. Strong players ask “if this line closes, whose is the inside?” before counting. A move that closes a border can be worth dozens of cells; a move that fills in your own area is worth almost nothing.'),
        h3('Wide versus solid'),
        p('The eternal dilemma: a wide fence is weak, a solid fence is small. A loose fence leaves gaps for invasion; a tight one costs moves you needed elsewhere. That sense of balance is the core skill.'),
      ]),
      sec('connection', 'Connection games: joining first', [
        p('In a connection game you try to be first to link two points or two edges with your pieces. The classic is **Hex**: on a rhombus of hexagons each player owns two opposite edges, and players take turns colouring one cell until someone connects their edges. Piet Hein first published it in a Danish newspaper in 1942, and the mathematician John Nash is reported to have devised the same game independently a few years later.'),
        h3('Blocking is connecting'),
        p('Hex has a beautiful property: when the board is full, **one side is always connected**. A draw is impossible. So completely blocking your opponent and completing your own path are really the same thing. Because this has been proven mathematically, Hex is a favourite example in game theory.'),
        h3('Connections that cannot be cut'),
        p('Strong players do not lay cells in a solid line. Leave two empty cells between two of yours and, if your opponent takes one, you take the other — so they are effectively connected already. Spreading fast with **loose links that cannot be cut in one move** is the basic strategy.'),
      ]),
      sec('compare', 'The two side by side', [
        table(
          ['', 'Territory', 'Connection'],
          [
            ['How you win', 'Hold more at the end', 'Join the targets first'],
            ['Length', 'Until the board is divided', 'Ends the moment a link is made'],
            ['Key sense', 'Where borders close', 'Paths that cannot be cut'],
            ['Draws', 'Possible on equal scores', 'Often impossible by design, as in Hex'],
            ['Examples', 'Go, Othello, Wallgo', 'Hex, Monorail'],
          ],
        ),
      ]),
      sec('skills', 'The skills it builds', [
        ul(
          '**Seeing the whole board.** Rather than one local fight, look for what is still undecided everywhere.',
          '**Comparing values.** Is securing a big area worth more than shaving your opponent’s? You need that arithmetic.',
          '**Precise endings.** Games are often decided by one or two cells, so count the last moves carefully.',
        ),
        tip('A go proverb that travels', '“Urgent before big” applies to almost every territory game. First close the border your opponent could break open next move, then expand.'),
      ]),
      sec('who', 'Who it suits', [
        p('People who like picturing space and prefer managing the flow of the whole board over single fights. These games feel less sharp than capture games, which suits players who find aggressive games stressful. On the other hand the result often stays unclear until the end, so practise estimating the position.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('**Wallgo** packs the core of territory play into very short rules: move a piece 0–2 cells, then you must build a wall; when everyone’s spaces are separated, the cells in the spaces holding your pieces are your score. Each wall is a border, so you keep asking whose land it seals. **Wallgo II** gives each piece a different way of moving, so the same borders are fought over more finely.'),
        p('**Monorail** is a connection game: players lay straight and curved track tiles, and whoever places the last tile of a loop leaving and returning to the station wins. The **Color Link Duel** is about keeping a board where every colour pair can still be joined, and the solo **Color Link** puzzle is a good way to train the feel for connections.'),
        note('Worth knowing', 'Wallgo has a three-player mode and a one-on-one mode. With three, two players tend to hold back the leader, so a little politics joins the pure territory arithmetic.'),
      ]),
    ],
  },
};

export default article;
