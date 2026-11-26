import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'first-move-advantage',
  category: 'concept',
  updated: '2026-11-26',
  games: [
    { game: 'cardJanggi', ko: '선공은 카드 5장을 모두, 후공은 첫 묶음만 4장을 배치해요. 선후공의 차이를 규칙으로 조절한 예예요.', en: 'The first player orders all five cards; the second orders only four in the first set — a rule that tunes the first-move gap.' },
    { game: 'colorLinkDuel', ko: '라운드를 여는 선공은 말 1개만, 그다음부터는 2개씩 놓아요. 첫 수의 이점을 줄이는 장치예요.', en: 'The opening player places one piece, then everyone places two — a device to shrink the first-move edge.' },
    { game: 'blackWhite', ko: '라운드 승자가 다음 선이 되는 구조라, 선이 꼭 유리하지만은 않아요. 색을 먼저 보여 줘야 하거든요.', en: 'The round winner leads next — and leading is not always good, because you show your colour first.' },
    { game: 'pointOmok', ko: '첫 선택자는 무작위, 그다음부터는 번갈아 가며 점을 골라요.', en: 'The first chooser is random; after that players alternate choosing the spots.' },
  ],
  related: ['solved-games', 'gomoku-renju', 'history-of-baduk', 'perfect-information', 'n-in-a-row'],
  sources: [
    { title: 'First-move advantage in chess', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/First-move_advantage_in_chess' },
    { title: 'What is the advantage with the white pieces?', site: 'Chess.com', url: 'https://www.chess.com/blog/Mensch-Maschine/what-is-the-advantage-with-the-white-pieces' },
    { title: 'How well do different opening moves score across rating ranges', site: 'Lichess', url: 'https://lichess.org/@/jk_182/blog/how-well-do-different-opening-moves-score-across-rating-ranges/JUtaqwSn' },
    { title: 'Komi (Go)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Komi_(Go)' },
    { title: 'Hex (board game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Hex_(board_game)' },
    { title: 'Dōbutsu shōgi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/D%C5%8Dbutsu_sh%C5%8Dgi' },
    { title: 'Pie rule', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Pie_rule' },
  ],
  ko: {
    meta: {
      title: '선공은 왜 유리할까? 선공 이점과 덤·금수·파이 규칙 같은 균형 장치',
      description: '체스에서 백은 얼마나 유리할까요? 바둑의 덤, 오목의 금수, 헥스의 파이 규칙처럼 선공 이점을 줄이는 장치들, 반대로 후공이 유리한 게임과 차례가 손해인 상황(추크추방)까지 정리했어요.',
      keywords: ['선공 유리', '선공 이점', '바둑 덤 이유', '오목 선공 필승', '파이 규칙', '체스 백 승률', '선후공'],
    },
    title: '선공은 왜 유리할까',
    lead: '먼저 두는 한 수의 무게. 그리고 그 무게를 덜어 내려는 여러 가지 지혜.',
    intro: [
      '두 사람이 번갈아 두는 게임에서는 누군가 먼저 둬야 해요. 그리고 많은 게임에서 이 “먼저”가 작지 않은 이점이 돼요. 먼저 둔 사람은 늘 상대보다 한 수 많거나 같은 수를 두고 있으니까요.',
      '이 글에서는 선공 이점이 실제로 얼마나 되는지, 왜 생기는지, 게임들이 이 불균형을 어떻게 메워 왔는지, 그리고 반대로 먼저 두는 게 손해인 경우까지 살펴봐요.',
    ],
    summary: '먼저 두는 한 수의 무게와, 그걸 덜어 내는 지혜. 체스 백의 승률, 바둑의 덤, 오목의 금수, 헥스의 파이 규칙, 후공이 유리한 게임까지 정리했어요.',
    sections: [
      sec('why', '왜 먼저 두면 유리할까', [
        p('가장 큰 이유는 **주도권**이에요. 먼저 둔 쪽이 먼저 위협을 만들고, 후공은 그 위협에 답하느라 자기 계획을 미뤄요. 판 위에 놓인 말이나 돌이 많을수록 강해지는 게임에서는 “늘 한 수 앞서 있다”는 것 자체가 힘이에요.'),
        p('특히 **놓을수록 좋아지는 게임**에서 선공 이점이 커요. 오목이나 헥스처럼 내 돌이 하나 더 있는 것이 결코 손해가 되지 않는 게임에서는, 이론적으로 선공이 질 수 없다는 증명까지 있어요. 이에 대해서는 아래 「전략 훔치기」에서 다뤄요.'),
      ]),
      sec('numbers', '실제로 얼마나 유리할까', [
        table(
          ['게임', '선공의 이점', '근거'],
          [
            ['체스', '강한 선수들 사이에서 백의 득점률은 대략 52~56%', '대규모 대국 기록 통계. 비김은 반 점으로 계산해요.'],
            ['바둑', '덤이 없으면 흑이 뚜렷이 유리', '그래서 한국·일본 6.5집, 중국 7.5점의 덤을 둬요.'],
            ['자유 오목', '흑 필승', '컴퓨터로 증명됐어요.'],
            ['커넥트 포', '선공 필승', '1988년 컴퓨터로 증명됐어요.'],
            ['헥스', '선공 필승법이 존재', '존 내시의 “전략 훔치기” 증명. 실제 필승법은 큰 판에서 알려지지 않았어요.'],
          ],
          '체스의 득점률은 표본과 실력대에 따라 달라요. 아마추어 온라인 대국에서도 백이 약 52%를 기록한다는 분석이 있어요.',
        ),
        p('체스의 2~6% 차이가 작아 보일 수 있지만, 실력이 비슷한 선수끼리라면 꽤 큰 차이예요. 그래서 체스 대회에서는 흑백을 번갈아 맡거나 공정하게 배정하는 걸 아주 중요하게 여겨요.'),
      ]),
      sec('steal', '전략 훔치기: 선공은 질 수 없다', [
        p('수학자 존 내시는 헥스에 대해 아름다운 논증을 남겼어요. 흐름은 이래요.'),
        ul(
          '후공에게 반드시 이기는 전략이 있다고 가정해 봐요.',
          '그렇다면 선공은 첫 수를 아무 데나 둔 뒤, 자기가 후공인 척하며 그 전략을 그대로 “훔쳐” 쓸 수 있어요.',
          '헥스에서는 돌이 하나 더 있는 게 손해가 될 수 없으니, 처음 아무 데나 둔 돌은 방해가 되지 않아요. 전략이 그 자리에 두라고 하면 다른 곳에 아무 데나 두면 돼요.',
          '그러면 선공도 반드시 이기게 되는데, 두 사람이 동시에 반드시 이길 수는 없어요. 모순이에요.',
          '헥스는 비김이 없으니, 결국 반드시 이기는 쪽은 선공이에요.',
        ),
        p('이 논증은 “선공 필승법이 있다”는 것만 보여 주고, 그 필승법이 무엇인지는 알려 주지 않아요. 그래서 큰 헥스 판에서 선공이 어떻게 이겨야 하는지는 여전히 열린 문제예요.'),
      ]),
      sec('fixes', '균형을 맞추는 장치들', [
        table(
          ['장치', '방법', '쓰는 게임'],
          [
            ['덤', '후공에게 점수를 미리 얹어 줘요.', '바둑'],
            ['금수', '선공의 가장 강한 수를 금지해요.', '렌주 (흑의 쌍삼·쌍사·장목)'],
            ['파이 규칙', '한 사람이 첫 수를 두면, 다른 사람이 그 수를 자기 것으로 가져갈지 정해요. 너무 좋은 첫 수를 두면 빼앗기니까, 첫 수를 공평하게 두게 돼요.', '헥스 등'],
            ['수량 조절', '첫 차례에 놓는 개수를 줄여요.', '처음엔 1개, 그다음부터 2개씩 놓는 게임들'],
            ['선후공 교대', '여러 판을 두며 선공을 번갈아 맡아요.', '체스 대회, 대부분의 다판 승부'],
          ],
        ),
        note('케이크 자르기와 같은 원리', '파이 규칙은 “한 사람이 자르고 다른 사람이 고른다”는 케이크 나누기 방법과 같은 원리예요. 자르는 사람은 어느 쪽을 받아도 괜찮도록 최대한 공평하게 자르게 되죠.'),
      ]),
      sec('second', '후공이 유리한 게임도 있어요', [
        p('선공이 늘 유리한 건 아니에요. 3×4칸 미니 쇼기인 **도부츠 쇼기**는 컴퓨터로 끝까지 분석한 결과, 양쪽이 완벽하게 두면 **후공이 이기는** 것으로 밝혀졌어요.'),
        h3('차례가 오는 게 손해일 때: 추크추방'),
        p('체스에는 **추크추방(Zugzwang)**이라는 말이 있어요. 독일어로 “두어야 하는 강박”이라는 뜻으로, 아무 수도 두지 않을 수 있다면 좋겠는데 규칙상 반드시 둬야 해서 오히려 불리해지는 상황이에요. 끝내기에서 자주 나와요. 판이 꽉 막힌 게임일수록 “먼저 움직여야 하는 쪽”이 손해를 보는 경우가 많아요.'),
        p('정보를 먼저 보여 줘야 하는 게임도 비슷해요. 먼저 내는 쪽이 정보를 흘리고, 나중에 내는 쪽이 그 정보를 보고 대응할 수 있다면, 오히려 나중에 두는 게 유리해질 수 있어요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('PUZZLTHINK 게임들도 선후공 차이를 다양하게 조절해요. **카드 장기**는 후공이 첫 묶음에서 카드 4장만 배치해요. **컬러 링크** 대결은 라운드를 여는 선공이 말을 1개만 놓고 그다음부터 2개씩 놓아요. **흑과 백**에서는 라운드 승자가 다음 선이 되는데, 선은 타일의 색을 먼저 보여 줘야 해서 꼭 유리하지만은 않아요.'),
        tip('선후공을 고를 수 있다면', '“먼저 두는 게 유리한 게임인가, 먼저 보여 주는 게 불리한 게임인가?”를 먼저 따져 보세요. 놓을수록 좋은 게임이면 선공을, 정보를 먼저 흘려야 하는 게임이면 후공을 고려해 볼 만해요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Why does moving first help? First-move advantage and the devices that balance it',
      description: 'How big is White’s edge in chess? Devices that shrink the first-move advantage — komi in go, forbidden moves in renju, the pie rule in Hex — games where the second player wins, and zugzwang, when having to move hurts.',
      keywords: ['first move advantage', 'first player advantage', 'komi reason', 'gomoku first player wins', 'pie rule', 'white win rate chess', 'second player advantage'],
    },
    title: 'Why does moving first help?',
    lead: 'The weight of the first move — and the many ways games try to lighten it.',
    intro: [
      'In a game of alternating turns someone has to go first, and in many games “first” is no small advantage: the first player always has one more move on the board than their opponent, or the same number.',
      'This article looks at how large the first-move advantage really is, why it arises, how games have compensated for it, and the cases where moving first is actually a disadvantage.',
    ],
    summary: 'The weight of the first move and how games lighten it: White’s chess score, komi, renju restrictions, the pie rule, and games the second player wins.',
    sections: [
      sec('why', 'Why moving first helps', [
        p('The main reason is **initiative**. The first player makes threats first, and the second player postpones their own plans to answer. In games where more pieces on the board means more strength, always being a move ahead is power in itself.'),
        p('The edge is biggest in **games where an extra piece never hurts**. In games like gomoku or Hex, where one more stone of yours can never be a disadvantage, there is even a proof that the first player cannot lose — see “strategy stealing” below.'),
      ]),
      sec('numbers', 'How big is it?', [
        table(
          ['Game', 'First-player edge', 'Basis'],
          [
            ['Chess', 'Among strong players White scores roughly 52–56%', 'Large game databases; draws count as half a point.'],
            ['Go', 'Without komi Black is clearly better', 'Hence komi: 6.5 in Korea and Japan, 7.5 in China.'],
            ['Free-style gomoku', 'Black wins', 'Proven by computer.'],
            ['Connect Four', 'First player wins', 'Proven by computer in 1988.'],
            ['Hex', 'A first-player winning strategy exists', 'John Nash’s strategy-stealing proof; the actual strategy is unknown on large boards.'],
          ],
          'Chess scores vary with sample and level; one analysis finds White at about 52% even in amateur online games.',
        ),
        p('Two to six percent may look small in chess, but between evenly matched players it is a lot. That is why chess events take great care to alternate or fairly assign colours.'),
      ]),
      sec('steal', 'Strategy stealing: the first player cannot lose', [
        p('The mathematician John Nash left a beautiful argument about Hex. It goes like this.'),
        ul(
          'Suppose the second player has a winning strategy.',
          'Then the first player can place a first stone anywhere, pretend to be the second player, and “steal” that strategy.',
          'In Hex an extra stone can never hurt, so the stray first stone is no obstacle. If the strategy ever says to play on it, play anywhere else.',
          'Then the first player wins too — but both players cannot be certain to win. Contradiction.',
          'Hex has no draws, so the player with the winning strategy must be the first player.',
        ),
        p('The argument shows only that a winning strategy exists, not what it is. How the first player should actually win on large Hex boards remains open.'),
      ]),
      sec('fixes', 'Devices that restore balance', [
        table(
          ['Device', 'How', 'Used in'],
          [
            ['Komi', 'Give the second player points up front.', 'Go'],
            ['Forbidden moves', 'Ban the first player’s strongest moves.', 'Renju (Black’s 3-3, 4-4, overline)'],
            ['Pie rule', 'One player makes the first move; the other decides whether to take that move as their own. A too-strong opening gets stolen, so openings become fair.', 'Hex and others'],
            ['Quantity', 'Place fewer pieces on the first turn.', 'Games where the first turn places one piece and later turns two'],
            ['Alternating colours', 'Swap who goes first across games.', 'Chess events, most multi-game matches'],
          ],
        ),
        note('The same idea as cutting cake', 'The pie rule works like “one cuts, the other chooses”. Whoever cuts makes the pieces as even as possible, since they might get either.'),
      ]),
      sec('second', 'Some games favour the second player', [
        p('Moving first does not always help. **Dobutsu shogi**, the 3×4 mini shogi, was analysed to the end by computer: with perfect play the **second player wins**.'),
        h3('When it hurts to have to move: zugzwang'),
        p('Chess has the term **zugzwang**, German for “compulsion to move”: a position where you would love to pass, but the rules force you to move and that makes things worse. It is common in endgames. The more locked-up a game, the more often the side that must move first suffers.'),
        p('Games where you must reveal information first are similar. If the first player leaks information and the second can respond to it, moving later can be the advantage.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('PUZZLTHINK games tune the first-move gap in different ways. In **Card Janggi** the second player orders only four cards in the first set. In the **Color Link Duel**, whoever opens a round places one piece and everyone then places two. In **Black & White** the round winner leads next — and leading means showing your tile’s colour first, so it is not always an advantage.'),
        tip('If you get to choose', 'Ask first: is this a game where moving first is strong, or one where revealing first is weak? In games where more pieces are better, consider going first; in games where you must leak information first, consider going second.'),
      ]),
    ],
  },
};

export default article;
