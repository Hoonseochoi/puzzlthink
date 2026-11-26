import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'morris-family',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'nineMensMorris', ko: '24개의 점에 말 9개씩. 놓기·옮기기·날기의 세 단계를 거치며 밀을 만들어 상대 말을 잡아요. 3판 2선승이에요.', en: 'Nine pieces each on 24 points; make mills through placing, moving and flying phases. Best of three.' },
    { game: 'russianJanggi', ko: '3×3 판에서 셋을 잇는 게임. 작은 판 3목의 또 다른 변형이에요.', en: 'Three in a row on 3×3 — another take on the small-board line game.' },
    { game: 'fourThree', ko: '4×4 판에서 쌓아 올린 말로 3목을 다투는 4인 게임이에요.', en: 'A four-player race for three in a row with stacked pieces on 4×4.' },
  ],
  related: ['n-in-a-row', 'solved-games', 'abstract-strategy', 'capture-games', 'perfect-information'],
  sources: [
    { title: 'Nine men’s morris', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Nine_men%27s_morris' },
    { title: 'Nine Men’s Morris', site: 'Traditional Games (tradgames.org.uk)', url: 'https://tradgames.org.uk/games/Nine-Mens-Morris.htm' },
    { title: 'The best board games of the ancient world', site: 'Smithsonian Magazine', url: 'https://www.smithsonianmag.com/science-nature/best-board-games-ancient-world-180974094/' },
    { title: 'Solving Nine Men’s Morris (Ralph Gasser)', site: 'MSRI Publications, Games of No Chance', url: 'https://library2.msri.org/books/Book29/files/gasser.pdf' },
    { title: 'Nine Men’s Morris is a draw', site: 'UC Irvine, David Eppstein', url: 'https://ics.uci.edu/~eppstein/cgt/morris.html' },
    { title: 'Strong solution of the mills games (Danner & Gévay)', site: 'University of Szeged', url: 'https://www.inf.u-szeged.hu/~danner/mills' },
  ],
  ko: {
    meta: {
      title: '나인 멘스 모리스의 역사 — 로마에서 셰익스피어까지, 그리고 무승부로 풀린 고전',
      description: '세 개를 한 줄로 세워 상대 말을 잡는 나인 멘스 모리스. 로마 시대부터 이어진 기록, 이집트 기원설이 의심받는 이유, 셰익스피어 희곡 속 모리스 판, 세 단계 규칙과 변형들, 1990년대 컴퓨터가 밝혀낸 무승부 결론까지 정리했어요.',
      keywords: ['나인 멘스 모리스', '나인 멘스 모리스 규칙', '모리스 게임 역사', '밀 게임', '고대 보드게임', '나인멘스모리스 필승법'],
    },
    title: '나인 멘스 모리스와 모리스 가족',
    lead: '세 줄짜리 사각형 판 위에서, 셋을 세우면 하나를 잡아요. 유럽에서 가장 오래 사랑받은 전략 게임 중 하나예요.',
    intro: [
      '나인 멘스 모리스는 겹겹의 정사각형 세 개와 그 변을 잇는 선으로 된 판 위에서 두는 게임이에요. 말 9개씩을 번갈아 놓다가, 세 개를 한 줄로 세우면 **밀(mill)**이 되어 상대 말을 하나 잡아요. 틱택토의 사촌 같지만, 놓은 뒤에 말을 옮길 수 있어서 훨씬 깊어요.',
      '이 글에서는 모리스 게임이 얼마나 오래됐는지, 그 오래됨에 대한 이야기 중 무엇이 확실하고 무엇이 의심받는지, 가족에 어떤 변형이 있는지, 그리고 컴퓨터가 이 게임에 내린 결론을 살펴봐요.',
    ],
    summary: '셋을 세우면 하나를 잡는 고전. 로마 시대의 기록, 의심받는 이집트 기원설, 셰익스피어 속 모리스, 무승부로 풀린 결론까지 정리했어요.',
    sections: [
      sec('rules', '세 단계로 진행되는 게임', [
        p('나인 멘스 모리스의 판에는 점이 24개 있어요. 게임은 세 단계로 흘러가요.'),
        table(
          ['단계', '하는 일', '핵심'],
          [
            ['놓기', '번갈아 말 9개를 빈 점에 하나씩 놓아요.', '다 놓기 전에는 옮길 수 없어요. 놓는 순간 밀을 만들 수도 있어요.'],
            ['옮기기', '말 하나를 선을 따라 이웃한 빈 점으로 옮겨요.', '밀을 열었다가 다시 닫으면 또 상대 말을 잡을 수 있어요.'],
            ['날기', '말이 3개만 남으면 아무 빈 점으로나 날아갈 수 있어요.', '불리한 쪽에게 주어지는 반격 수단이에요.'],
          ],
        ),
        p('밀을 만들면 상대 말 하나를 잡아요. 이미 밀에 들어 있는 상대 말은 보통 잡을 수 없어요. 말이 2개가 되거나 움직일 곳이 없으면 져요. 날기 규칙은 지역이나 규칙집마다 쓰기도 하고 안 쓰기도 해요.'),
        h3('옮기기 단계의 묘미'),
        p('이 게임의 백미는 **밀을 열고 닫는 리듬**이에요. 밀에서 말 하나를 빼냈다가 다음 차례에 다시 넣으면 밀이 새로 생겨서 또 잡을 수 있어요. 특히 두 밀이 말 하나를 공유하도록 배치하면, 그 말을 왔다 갔다 할 때마다 매번 밀이 생겨요. 이 모양을 만든 쪽은 매 차례 상대 말을 하나씩 잡아낼 수 있어요.'),
      ]),
      sec('history', '얼마나 오래된 게임일까', [
        p('나인 멘스 모리스는 **적어도 로마 제국 시대부터** 있었던 것으로 보는 데 자료들이 일치해요. 그보다 앞선 기원은 확실하지 않아요.'),
        note('이집트 기원설이 의심받는 이유', '이집트 쿠르나의 신전 지붕돌에 새겨진 판이 기원전 1400년 무렵의 것이라는 설명이 널리 퍼져 있어요. 하지만 연구자 프리드리히 베르거는 그 그림들 중 일부에 콥트 십자가가 함께 새겨져 있다는 점을 들어, 훨씬 뒤에 새겨졌을 가능성을 지적했어요. 그래서 이 연대는 확정된 사실로 보기 어려워요.'),
        p('중세 유럽에서는 크게 유행했어요. 영국의 여러 대성당 회랑 돌의자에 판이 새겨져 있다는 이야기가 전해지는데, 이는 한 자료에서만 확인돼서 여기서는 소개만 할게요. 확실한 건 셰익스피어의 희곡 『한여름 밤의 꿈』에 요정 여왕 티타니아가 진흙으로 메워진 모리스 판을 언급하는 대사가 나온다는 점이에요. 16세기 영국 관객들에게 모리스 판이 익숙한 풍경이었다는 뜻이죠.'),
      ]),
      sec('family', '모리스 가족', [
        p('“나인 멘스”는 말 9개라는 뜻이에요. 말 수와 판 크기를 바꾼 친척 게임들이 있어요.'),
        ul(
          '**스리 멘스 모리스**: 말 3개씩, 3×3 점 판에서 두는 가장 작은 모리스예요. 틱택토와 비슷하지만 다 놓은 뒤에 말을 옮겨요.',
          '**식스 멘스 모리스**: 말 6개씩, 정사각형 두 겹 판에서 둬요.',
          '**트웰브 멘스 모리스**: 말 12개씩, 대각선이 추가된 판에서 둬요. 판이 가득 찰 수 있어서 비기는 일이 잦아요.',
        ),
        p('이 가족은 “셋을 세우면 잡는다”는 규칙을 공유해요. 줄을 만드는 것 자체가 목표인 오목 같은 n목 게임과 달리, 모리스에서 줄은 **잡기 위한 수단**이에요. 그래서 줄 만들기 게임과 잡기 게임의 중간에 있는 독특한 가족이에요.'),
      ]),
      sec('solved', '컴퓨터가 내린 결론: 무승부', [
        p('나인 멘스 모리스는 컴퓨터로 완전히 분석된 게임이에요. 컴퓨터 과학자 랄프 가서가 1993년 11월에 결과를 처음 알렸고, 1996년 논문으로 정리했어요. 결론은 **양쪽이 완벽하게 두면 무승부**예요.'),
        p('방법도 흥미로워요. 먼저 끝내기 쪽에서 거꾸로 계산해 약 100억 개 국면의 결과를 담은 데이터베이스를 만들고, 그다음 처음 국면부터 18수 깊이를 탐색해 이 데이터베이스와 연결했어요. 이후 다른 연구자들은 옮기기 단계의 모든 국면에 대한 결과까지 계산했어요.'),
        note('무승부라는 결론이 뜻하는 것', '완벽한 수를 기억하는 사람은 없기 때문에, 사람끼리의 대국에서는 여전히 승패가 분명하게 갈려요. 다만 “처음부터 한쪽이 반드시 이긴다”는 구조가 아니니, 실수하지 않는 쪽이 이기는 공정한 게임이라는 뜻이기도 해요.'),
      ]),
      sec('tips', '처음 두는 사람을 위한 요령', [
        ul(
          '**놓기 단계에서 밀을 서두르지 마세요.** 이 단계에서 밀 하나보다, 옮기기 단계에서 움직일 길이 많은 배치가 더 중요할 때가 많아요.',
          '**교차점을 노리세요.** 네 방향으로 이어진 점은 여러 줄에 동시에 걸쳐 있어서 가치가 높아요.',
          '**상대의 열고 닫기를 막으세요.** 상대가 밀을 열었다면, 다시 닫힐 자리에 내 말을 밀어 넣는 것이 가장 좋은 수비예요.',
          '**움직일 곳을 남기세요.** 말이 많아도 모두 갇히면 지는 게임이에요.',
        ),
        tip('PUZZLTHINK에서', 'PUZZLTHINK의 나인 멘스 모리스는 3개가 남으면 날 수 있고, 2개가 되거나 움직일 수 없으면 지는 규칙이에요. 3판 2선승이라 한 판을 져도 만회할 기회가 있어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Nine men’s morris — from Rome to Shakespeare, and a classic solved as a draw',
      description: 'Nine men’s morris, where three in a row captures: records from Roman times, why the Egyptian origin is doubted, the morris board in Shakespeare, the three phases and family variants, and the 1990s computer result that it is a draw.',
      keywords: ['nine mens morris', 'nine mens morris rules', 'history of morris games', 'mill game', 'ancient board games', 'nine mens morris strategy'],
    },
    title: 'Nine men’s morris and the morris family',
    lead: 'On a board of three nested squares, line up three to take one. One of Europe’s longest-loved strategy games.',
    intro: [
      'Nine men’s morris is played on three nested squares joined at the midpoints of their sides. Players alternate placing nine pieces each; three in a line forms a **mill**, which captures an enemy piece. It looks like a cousin of tic-tac-toe, but because pieces move after placement it runs much deeper.',
      'This article looks at how old morris games are, which parts of that story are certain and which are doubted, the variants in the family, and what computers concluded about the game.',
    ],
    summary: 'The classic where three in a line takes a piece: Roman-era records, the doubted Egyptian origin, morris in Shakespeare, and the result that it is a draw.',
    sections: [
      sec('rules', 'A game in three phases', [
        p('The nine men’s morris board has 24 points. Play flows through three phases.'),
        table(
          ['Phase', 'What you do', 'Key point'],
          [
            ['Placing', 'Alternate placing nine pieces on empty points.', 'No moving until all are placed; a placement can form a mill.'],
            ['Moving', 'Move one piece along a line to an adjacent empty point.', 'Open a mill and close it again to capture again.'],
            ['Flying', 'With only three pieces left, move to any empty point.', 'A counter-weapon for the side that is behind.'],
          ],
        ),
        p('A mill captures one enemy piece; pieces already in a mill usually cannot be taken. You lose when reduced to two pieces or unable to move. Flying is used in some regions and rule books and not in others.'),
        h3('The beauty of the moving phase'),
        p('The highlight is the **rhythm of opening and closing mills**. Move a piece out of a mill and back next turn, and a new mill forms, capturing again. Arrange two mills sharing one piece, and each back-and-forth makes a mill — the side that builds this shape can take a piece every turn.'),
      ]),
      sec('history', 'How old is it?', [
        p('Sources agree nine men’s morris existed **at least by the time of the Roman Empire**. Anything earlier is uncertain.'),
        note('Why the Egyptian origin is doubted', 'A board carved on roofing slabs of the temple at Kurna, Egypt, is widely said to date from around 1400 BCE. But the researcher Friedrich Berger noted that some of those diagrams appear alongside Coptic crosses, suggesting they could have been carved much later. So that date is hard to treat as fact.'),
        p('The game was hugely popular in medieval Europe. Boards are said to be cut into cloister seats in several English cathedrals, but only one source confirms this, so it is mentioned only in passing. What is certain is that in Shakespeare’s A Midsummer Night’s Dream, the fairy queen Titania speaks of a morris board filled up with mud — a sign that 16th-century English audiences knew such boards well.'),
      ]),
      sec('family', 'The morris family', [
        p('“Nine men’s” refers to the nine pieces. Relatives change the number of pieces and the board.'),
        ul(
          '**Three men’s morris**: three pieces each on a 3×3 grid of points — like tic-tac-toe, except pieces move after placement.',
          '**Six men’s morris**: six pieces each on two nested squares.',
          '**Twelve men’s morris**: twelve pieces each on a board with added diagonals; the board can fill up, so draws are common.',
        ),
        p('The family shares “three in a line captures”. Unlike n-in-a-row games such as gomoku, where the line is the goal, in morris a line is **a means to capture** — putting the family between line games and capture games.'),
      ]),
      sec('solved', 'The computer’s verdict: a draw', [
        p('Nine men’s morris has been fully analysed by computer. The computer scientist Ralph Gasser first announced the result in November 1993 and wrote it up in a 1996 paper: **with perfect play it is a draw**.'),
        p('The method is interesting too. He first worked backwards from endgames to build databases holding the results of about ten billion positions, then searched 18 plies deep from the opening position to connect to them. Later researchers computed results for every position in the moving phase.'),
        note('What a draw means', 'Nobody remembers perfect play, so human games still end decisively. But since the game is not a forced win for one side from the start, it is a fair game where whoever avoids mistakes wins.'),
      ]),
      sec('tips', 'Tips for first-timers', [
        ul(
          '**Do not rush mills in the placing phase.** A position with room to move later often matters more than one early mill.',
          '**Take the crossings.** Points joined in four directions sit on several lines and are worth more.',
          '**Stop their open-and-close.** If your opponent opens a mill, pushing a piece into the gap is the best defence.',
          '**Leave yourself moves.** Plenty of pieces do not help if they are all boxed in.',
        ),
        tip('On PUZZLTHINK', 'In PUZZLTHINK’s Nine Men’s Morris you fly with three pieces and lose with two or with no moves. Matches are best of three, so one loss can be made up.'),
      ]),
    ],
  },
};

export default article;
