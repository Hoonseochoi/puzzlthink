import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'n-in-a-row',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'flipOmok', ko: '상대 돌을 끼워 뒤집는 오목. 뒤집기는 한 판에 3번, 고를 때만 쓰고 뒤집힌 돌은 고정돼요. 정확히 5목만 인정하고, 방금 뒤집은 돌이 든 5목은 무효예요.', en: 'Gomoku with flanking flips — 3 per game, used only when you choose, and flipped stones lock. Only exactly five counts, and not a five that uses a stone you just flipped.' },
    { game: 'pointOmok', ko: '돌을 포인트로 사는 오목. 줄을 만드는 감각에 입찰 심리가 더해져요.', en: 'Gomoku where stones are bought with points: line-making plus bidding psychology.' },
    { game: 'blindGomoku', ko: '돌의 진영이 보이지 않는 오목. 누가 어디에 뒀는지 기억해야 줄을 볼 수 있어요.', en: 'Gomoku where you cannot see whose stone is whose — you have to remember to see the lines.' },
    { game: 'fourThree', ko: '4×4 판에 3층까지 쌓는 4인 3목. 위에서 봤을 때의 줄만 인정돼요.', en: 'Four-player three in a row on a 4×4 board with stacks up to three high; only what shows from above counts.' },
    { game: 'russianJanggi', ko: '큰 말이 작은 말을 덮는 3×3 한 줄 만들기. 말을 옮기면 덮인 줄이 드러날 수 있어요.', en: 'Three in a row on 3×3 where big pieces cover small ones — moving can uncover a line.' },
    { game: 'nineMensMorris', ko: '셋을 한 줄로 세우면(밀) 상대 말을 하나 잡는, 줄 만들기의 고전이에요.', en: 'The classic where three in a line (a mill) captures an enemy piece.' },
  ],
  related: ['gomoku-renju', 'first-move-advantage', 'solved-games', 'abstract-strategy', 'morris-family'],
  sources: [
    { title: 'Go-Moku Solved (summary and references)', site: 'UC Irvine, David Eppstein', url: 'https://www.ics.uci.edu/~eppstein/cgt/gomoku.html' },
    { title: 'Go-moku family of games', site: 'ICGA', url: 'https://icga.org/icga/games/go-moku' },
    { title: 'Solved game', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Solved_game' },
    { title: 'Connect Four', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Connect_Four' },
    { title: 'Renju', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Renju' },
    { title: 'The rules and the history of Renju', site: 'Renju International Federation', url: 'https://renju.se/rif/r1rulhis.htm' },
    { title: 'Gobblet Gobblers rules', site: 'Blue Orange Games', url: 'https://www.blueorangegames.com/webroot/img/games/rules/Gobblers_Rules_US.pdf' },
  ],
  ko: {
    meta: {
      title: 'n목 게임이란? 틱택토·사목·오목으로 보는 줄 만들기 게임의 원리',
      description: '틱택토, 커넥트 포, 오목, 렌주까지. 같은 색을 한 줄로 잇는 n목 게임은 왜 선공이 유리한지, 금수는 왜 생겼는지, 열린 삼과 사 같은 위협을 어떻게 다루는지 정리했어요.',
      keywords: ['n목 게임', '오목 규칙', '틱택토', '사목', '3목 게임', '쌍삼 금지', '오목 잘 두는 법'],
    },
    title: 'n목 게임 (오목 가족)',
    lead: '같은 색 n개를 한 줄로. 가장 쉬운 규칙에서 가장 날카로운 수싸움이 나와요.',
    intro: [
      '공책 구석에 그리던 틱택토, 세로 판에 동전을 떨어뜨리는 사목, 바둑판 위의 오목. 이 게임들은 모두 **같은 색 돌 n개를 가로·세로·대각선 한 줄로 먼저 잇는** 게임이에요. 그래서 한데 묶어 n목 게임이라고 불러요.',
      '규칙은 누구나 바로 이해하지만, 이 가족에는 게임 이론에서 아주 중요한 이야기들이 숨어 있어요. 왜 대부분 먼저 두는 쪽이 유리한지, 그래서 어떤 규칙이 덧붙었는지, 실제로 이기려면 어떤 수를 노려야 하는지 차례로 살펴봐요.',
    ],
    summary: '틱택토부터 오목·렌주까지, 한 줄을 먼저 잇는 게임들. 선공이 유리한 이유, 금수가 생긴 이유, 위협을 쌓아 이기는 원리를 정리했어요.',
    sections: [
      sec('family', '판 크기와 n이 만드는 차이', [
        p('n목 게임은 “판이 얼마나 큰가”와 “몇 개를 이어야 하는가”라는 두 숫자로 성격이 거의 정해져요.'),
        table(
          ['게임', '판', 'n', '완벽하게 두면'],
          [
            ['틱택토', '3×3', '3', '비김'],
            ['커넥트 포', '가로 7 × 세로 6, 아래부터 쌓임', '4', '선공 승리 (1988년 증명)'],
            ['자유 오목', '15×15', '5 이상', '선공 승리 (1990년대 초 증명)'],
            ['렌주', '15×15, 흑에 금수', '5', '시합용 개시 규칙에서는 아직 풀리지 않음'],
          ],
          '“완벽하게 두면”은 양쪽 모두 실수가 없을 때의 결과예요.',
        ),
        p('판이 작고 n이 크면 막기가 쉬워서 비기는 쪽으로 기울어요. 판이 넓고 n이 적당하면 먼저 둔 쪽이 공격 기회를 계속 만들 수 있어서 선공이 이기는 쪽으로 기울어요. 오목이 바로 그런 경우예요.'),
      ]),
      sec('threats', '이기는 원리: 위협을 겹치기', [
        p('n목 게임에서 한 줄을 그냥 늘려서 이기는 일은 거의 없어요. 상대가 그 끝을 막으면 그만이니까요. 이기는 방법은 **한 수로 위협 두 개를 동시에 만드는 것**이에요. 상대는 한 번에 한 곳만 막을 수 있으니, 둘 중 하나는 완성돼요.'),
        h3('오목에서 쓰는 말'),
        ul(
          '**사(4)**: 한 수만 더 두면 5목이 되는 모양. 상대가 반드시 막아야 해요.',
          '**열린 삼**: 양쪽이 비어 있어서 다음 수에 막을 수 없는 사(열린 사)가 될 수 있는 삼. 이것도 상대가 미리 막아야 해요.',
          '**사삼**: 사와 열린 삼을 한 수로 동시에 만드는 수. 대표적인 승리 수예요.',
          '**쌍삼·쌍사**: 열린 삼 두 개, 또는 사 두 개를 한 번에 만드는 수.',
        ),
        p('그래서 오목의 실전은 “상대가 막아야 하는 수”를 연달아 두면서, 막는 동안 상대 돌이 엉뚱한 곳에 놓이게 만들고, 마지막에 두 갈래 위협을 터뜨리는 흐름이에요. 이렇게 계속 몰아붙여 이기는 수순을 흔히 연속 공격이라고 하고, 영어 약어로 VCF(사로만 몰아붙이는 승리)·VCT(삼과 사로 몰아붙이는 승리)라고 부르기도 해요.'),
      ]),
      sec('forbidden', '금수는 왜 생겼나', [
        p('오목은 판이 넓어서 먼저 두는 흑이 너무 유리해요. 컴퓨터 분석으로 아무 제한이 없는 오목은 흑이 반드시 이길 수 있다는 것이 증명되기도 했어요. 사람끼리의 대국에서도 흑의 이점이 크다는 건 오래전부터 알려져 있었죠.'),
        p('이 불균형을 줄이기 위해 생긴 것이 **금수**예요. 시합용 오목인 렌주에서는 흑만 쌍삼, 쌍사, 6목 이상(장목)을 둘 수 없어요. 흑의 가장 강력한 무기를 묶어서 백에게 기회를 주는 거예요. 여기에 첫 몇 수의 위치를 정하는 개시 규칙까지 더해 균형을 맞춰요.'),
        note('게임마다 금수가 달라요', '“오목 규칙”이라고 해도 사이트나 지역마다 금수가 제각각이에요. 둘 다 쌍삼을 금지하기도 하고, 아무 금수가 없기도 하고, 정확히 5목만 인정하기도 해요. 새 오목을 둘 땐 금수부터 확인하세요.'),
      ]),
      sec('variants', '줄 만들기에 다른 장치를 섞으면', [
        p('n목은 다른 메커니즘과 섞기 좋은 뼈대예요. 몇 가지 대표적인 변형을 보면 장르의 폭이 느껴져요.'),
        ul(
          '**중력**: 커넥트 포처럼 돌이 아래부터 쌓이면, 원하는 칸에 바로 둘 수 없어서 “누가 그 칸 바로 아래를 채우게 되나”가 중요해져요.',
          '**덮기**: 고블렛 고블러스처럼 큰 말이 작은 말을 덮을 수 있으면, 이미 놓인 줄도 뒤집힐 수 있어요.',
          '**옮기기**: 나인 멘스 모리스처럼 말을 다 놓은 뒤 옮겨 줄을 다시 만들 수 있으면, 줄을 “깼다가 다시 만드는” 리듬이 생겨요.',
          '**숨기기·뒤집기·입찰**: 진영을 숨기거나, 끼운 돌을 뒤집거나, 돌을 포인트로 사게 만들면 전혀 다른 게임이 돼요.',
        ),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        p('규칙 설명 없이 바로 시작하고 싶은 사람, 짧은 시간에 날카로운 수싸움을 원하는 사람에게 좋아요. 위협을 놓치면 한 수에 끝나기 때문에 집중력이 많이 필요하지만, 그만큼 한 판이 짧고 승부가 분명해요. 바둑이나 장기처럼 긴 공부 없이도 “위협 두 개 만들기” 하나만 익히면 실력이 확 늘어요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('PUZZLTHINK에는 오목 뼈대에 다른 장치를 하나씩 얹은 게임이 많아요. **뒤집기 오목**은 상대 돌을 끼워 내 색으로 뒤집을 수 있는데, 한 판에 3번뿐이고 뒤집힌 돌은 고정돼서 그 한 방을 언제 쓰느냐가 승부예요. 정확히 5목만 인정하고, 쌍삼은 양쪽 모두 금지예요. **포인트 오목**은 돌을 놓을 자리를 포인트 입찰로 정하고, **블라인드 오목**은 돌의 진영이 안 보여서 기억력이 곧 실력이 돼요.'),
        p('3목 쪽으로는 4×4 판에 쌓아 올리는 4인용 **4인 3목**, 큰 말이 작은 말을 덮는 **러시아장기**, 줄을 만들면 상대 말을 잡는 **나인 멘스 모리스**가 있어요.'),
        tip('어떤 n목이든 통하는 한 가지', '내 차례마다 “상대가 다음 수에 사나 열린 삼을 만들 수 있는 곳”을 먼저 확인하세요. 공격보다 이 확인을 먼저 하는 습관만으로도 승률이 눈에 띄게 올라가요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'N-in-a-row games — tic-tac-toe, Connect Four, gomoku and how they work',
      description: 'Tic-tac-toe, Connect Four, gomoku and renju: why the first player usually has the edge, why forbidden moves exist, and how to win by stacking threats — plus PUZZLTHINK’s gomoku variants.',
      keywords: ['n in a row games', 'gomoku rules', 'tic-tac-toe', 'Connect Four', 'three in a row games', 'double three rule', 'how to win gomoku'],
    },
    title: 'N-in-a-row games (the gomoku family)',
    lead: 'Get n of your colour in a line. The simplest rule produces some of the sharpest fights.',
    intro: [
      'Tic-tac-toe in the corner of a notebook, Connect Four with its falling discs, gomoku on a go board — all are games of being first to get **n stones of one colour in a row**, horizontally, vertically or diagonally. Together they are called n-in-a-row games.',
      'Anyone grasps the rules at once, but this family holds some of game theory’s most important stories: why the first player is usually better off, which rules were added because of it, and which moves you should actually aim for.',
    ],
    summary: 'From tic-tac-toe to gomoku and renju: why the first player has the edge, why forbidden moves exist, and how stacked threats win games.',
    sections: [
      sec('family', 'Board size and n change everything', [
        p('An n-in-a-row game is largely defined by two numbers: how big the board is and how many you need to connect.'),
        table(
          ['Game', 'Board', 'n', 'With perfect play'],
          [
            ['Tic-tac-toe', '3×3', '3', 'Draw'],
            ['Connect Four', '7 wide × 6 high, filled from the bottom', '4', 'First player wins (proven 1988)'],
            ['Free-style gomoku', '15×15', '5 or more', 'First player wins (proven early 1990s)'],
            ['Renju', '15×15, restrictions on Black', '5', 'Not solved under tournament opening rules'],
          ],
          '“With perfect play” means the result when neither side makes a mistake.',
        ),
        p('A small board with a large n makes blocking easy, so games lean toward draws. A wide board with a moderate n lets the first player keep creating attacks, so games lean toward first-player wins. Gomoku is exactly that case.'),
      ]),
      sec('threats', 'How games are won: double threats', [
        p('You almost never win by simply extending a line — your opponent blocks the end. You win by **making two threats with one move**. They can block only one, so the other completes.'),
        h3('Gomoku vocabulary'),
        ul(
          '**Four**: a shape one move from five. It must be blocked.',
          '**Open three**: a three with both ends free that can become an unblockable open four next move. It also has to be answered.',
          '**Four-three**: a move that makes a four and an open three at once — the classic winning move.',
          '**Double three / double four**: two open threes, or two fours, from one move.',
        ),
        p('So practical gomoku is a chain of moves your opponent must answer, steering their blocking stones to useless places, until a double threat breaks through. Such forcing sequences are often written as VCF or VCT (victory by continuous fours, or threes).'),
      ]),
      sec('forbidden', 'Why forbidden moves exist', [
        p('Gomoku’s board is wide, so Black, moving first, is too strong. Computer analysis even proved that unrestricted gomoku is a forced win for Black, and players had long known Black’s edge in practice.'),
        p('**Forbidden moves** came in to reduce that imbalance. In renju, the tournament form of the game, only Black is barred from double threes, double fours and lines of six or more. Tying up Black’s strongest weapons gives White a chance; opening rules that fix where the first few stones go add more balance.'),
        note('Every gomoku differs', '“Gomoku rules” vary by site and region: some bar double threes for both sides, some have no restrictions, some count exactly five only. Check the forbidden moves first whenever you try a new version.'),
      ]),
      sec('variants', 'Mixing other mechanics into a line game', [
        p('N-in-a-row is a great skeleton for other mechanics. A few variants show how wide the family is.'),
        ul(
          '**Gravity**: when discs stack from the bottom, as in Connect Four, you cannot play any cell you like, so who is forced to fill the cell just below a key square matters.',
          '**Covering**: when big pieces can cover small ones, as in Gobblet Gobblers, a finished line can be overturned.',
          '**Moving**: when pieces move after placement, as in nine men’s morris, you get a rhythm of breaking a line and remaking it.',
          '**Hiding, flipping, bidding**: hide sides, flip flanked stones or buy stones with points and it becomes a different game.',
        ),
      ]),
      sec('who', 'Who it suits', [
        p('Anyone who wants to start without a rules lecture and enjoys short, sharp fights. Miss one threat and the game ends in a move, so focus matters, but games are short and decisive. Unlike go or chess, you do not need long study: learn to make two threats at once and you improve fast.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('PUZZLTHINK has many games that put one extra mechanic on a gomoku skeleton. In **Flip Omok** you may flip flanked stones to your colour — only 3 times a game, and flipped stones lock — so the timing of each flip decides games; only exactly five wins and double threes are barred for both. **Point Omok** decides who gets each spot by a points bid, and in **Blind Gomoku** you cannot see whose stone is whose, so memory becomes skill.'),
        p('For three in a row there is **4 Player 3 In a Row**, stacking on a 4×4 board; **Russian Janggi**, where big pieces cover small ones; and **Nine Men’s Morris**, where a line captures.'),
        tip('One habit for every n-in-a-row game', 'Each turn, first check where your opponent could make a four or an open three next move. Doing that check before attacking raises your win rate noticeably.'),
      ]),
    ],
  },
};

export default article;
