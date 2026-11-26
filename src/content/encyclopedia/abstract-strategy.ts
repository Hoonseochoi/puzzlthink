import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'abstract-strategy',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'wallgo', ko: '말을 옮기고 벽을 세워 땅을 나누는 게임. 주사위도 숨은 카드도 없이 수읽기만으로 겨뤄요.', en: 'Move, then build a wall, until the board splits into territories. No dice, no hidden cards — only reading.' },
    { game: 'wallgo2', ko: '사각 말과 원형 말의 움직임이 달라서, 같은 벽 규칙 위에 더 촘촘한 계산이 붙어요.', en: 'Square and round pieces move differently, so the same wall rule asks for finer calculation.' },
    { game: 'janggi', ko: '3×4칸 판 위의 작은 장기. 잡은 말을 다시 내려놓을 수 있어 판이 작아도 수가 깊어요.', en: 'A tiny chess-like game on a 3×4 board. Captured pieces come back as your own, so the small board runs deep.' },
    { game: 'russianJanggi', ko: '큰 말이 작은 말을 덮는 3×3 한 줄 만들기. 덮인 말이 다시 드러나는 순간을 읽어야 해요.', en: 'Three in a row on 3×3 where bigger pieces cover smaller ones — and a covered line can reappear.' },
    { game: 'laserJanggi', ko: '거울을 돌리고 옮겨 레이저의 길을 설계하는 게임. 모든 정보가 판 위에 다 보여요.', en: 'Turn and move mirrors to route a laser. Everything you need is on the board.' },
    { game: 'nineMensMorris', ko: '수천 년 이어진 고전 추상 전략. 놓기, 옮기기, 날기의 세 단계가 있어요.', en: 'A classic that has lasted for centuries, with placing, moving and flying phases.' },
    { game: 'flipOmok', ko: '오목에 끼워 뒤집기를 섞은 PUZZLTHINK 창작 게임. 한 수에 판이 크게 바뀌어요.', en: 'A PUZZLTHINK original that mixes five-in-a-row with flanking captures. One move can swing the board.' },
    { game: 'colorLinkDuel', ko: '이을 수 있는 판을 지키며 말을 놓는 대결. 운 없이 상대가 증명하지 못할 판을 노려요.', en: 'Place colored pieces while keeping the board solvable; win by building one your opponent cannot prove.' },
  ],
  related: ['perfect-information', 'n-in-a-row', 'capture-games', 'solved-games', 'first-move-advantage'],
  sources: [
    { title: 'Abstract strategy game', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Abstract_strategy_game' },
    { title: 'Hex (board game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Hex_(board_game)' },
    { title: 'Othello History', site: 'World Othello Federation', url: 'https://www.worldothello.org/about/about-othello/othello-history/pre-history' },
    { title: 'Reversi -- History, Curiosities, and Variants', site: 'Solitaire Laboratory', url: 'https://www.solitairelaboratory.com/abstract/reversi.html' },
    { title: 'Connect Four', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Connect_Four' },
    { title: 'Gobblet Gobblers rules', site: 'Blue Orange Games', url: 'https://www.blueorangegames.com/webroot/img/games/rules/Gobblers_Rules_US.pdf' },
    { title: 'Abstract games', site: 'World of Abstract Games', url: 'https://jpneto.github.io/world_abstract_games/othello.htm' },
  ],
  ko: {
    meta: {
      title: '추상 전략 게임이란? 운 없이 수읽기로 겨루는 게임의 특징과 대표작',
      description: '주사위도 숨은 카드도 없는 추상 전략 게임. 바둑·체스·헥스·오셀로 같은 대표작, 필요한 실력, 어떤 사람에게 맞는지, PUZZLTHINK에서 바로 둘 수 있는 추상 전략 게임까지 정리했어요.',
      keywords: ['추상 전략 게임', '추상 전략 보드게임', '운 없는 보드게임', '2인 전략 게임', '헥스 보드게임', '오셀로 역사'],
    },
    title: '추상 전략 게임',
    lead: '운도, 숨은 정보도 없어요. 이기면 내가 잘한 거고, 지면 내가 놓친 거예요.',
    intro: [
      '바둑판 앞에 앉으면 두 사람이 보는 정보는 똑같아요. 주사위를 굴리지도 않고, 상대가 손에 무엇을 숨겼는지 궁금해할 필요도 없어요. 승부를 가르는 건 오직 다음 몇 수를 얼마나 멀리, 정확하게 내다보느냐예요. 이런 게임을 묶어 **추상 전략 게임**이라고 불러요.',
      '이 글에서는 추상 전략 게임이 무엇인지, 어디서 재미가 나오고 어떤 실력이 늘어야 하는지, 그리고 이 장르를 대표하는 게임과 PUZZLTHINK에서 바로 둘 수 있는 게임을 차례로 살펴봐요.',
    ],
    summary: '운도 숨은 정보도 없이 수읽기로만 겨루는 장르. 바둑·체스부터 벽바둑까지, 무엇이 재미를 만들고 어떤 실력이 필요한지 정리했어요.',
    sections: [
      sec('what', '추상 전략 게임이란', [
        p('딱 잘라 정한 공식 정의는 없지만, 보통 세 가지 성질을 갖춘 게임을 추상 전략 게임이라고 불러요.'),
        ul(
          '**모든 정보가 공개돼요.** 판 위의 상황을 두 사람이 똑같이 봐요. 이런 성질을 완전 정보라고 해요.',
          '**운이 끼어들지 않아요.** 주사위나 카드 뽑기처럼 결과를 우연에 맡기는 장치가 없어요. 같은 수를 두면 언제나 같은 결과가 나와요.',
          '**테마가 거의 중요하지 않아요.** 장기의 말에 ‘차’나 ‘포’라는 이름이 붙어 있어도, 규칙을 이해하는 데 전쟁 이야기는 필요 없어요. 이름을 기호로 바꿔도 게임은 그대로예요.',
        ),
        p('대부분 두 사람이 번갈아 두는 형식이에요. 셋 이상이 하면 “누가 누구를 견제하느냐” 같은 정치가 끼어들어서, 순수하게 수읽기만으로 승부를 내기 어려워지기 때문이에요.'),
        note('경계는 생각보다 흐릿해요', '주사위를 쓰는 백개먼을 추상 전략 게임에 넣는 사람도 있고, 빼는 사람도 있어요. 숨은 정보가 조금 섞인 게임도 마찬가지예요. 분류는 게임을 이해하는 도구일 뿐이니, “이 게임은 어디까지 순수한가”를 따져 보는 정도로 쓰면 충분해요.'),
      ]),
      sec('fun', '무엇이 재미를 만드나', [
        p('추상 전략 게임의 재미는 **변명할 곳이 없다**는 데서 나와요. 패를 잘못 받아서, 주사위가 안 나와서 졌다는 말을 할 수 없어요. 그래서 이겼을 때의 만족감이 크고, 졌을 때는 어디서 잘못됐는지를 끝까지 추적할 수 있어요. 판을 처음부터 다시 놓아 보며 따져 보는 복기 문화가 바둑과 장기에서 특히 발달한 것도 이 때문이에요.'),
        p('또 하나는 **짧은 규칙과 깊은 내용의 차이**예요. 오목은 규칙을 1분이면 설명할 수 있지만, 잘 두는 사람과 처음 두는 사람의 차이는 엄청나게 커요. 규칙이 단순할수록 그 차이는 순전히 생각의 깊이에서 나오기 때문에, 실력이 느는 과정이 눈에 잘 보여요.'),
        p('마지막으로, 판 하나에 두 사람의 계획이 정면으로 부딪쳐요. 내가 세운 계획을 상대가 읽고 막고, 나는 그걸 다시 비틀어요. 서로의 생각을 판 위에서 대화하듯 주고받는 느낌이 이 장르의 가장 큰 매력이에요.'),
      ]),
      sec('skills', '필요한 실력', [
        h3('수읽기'),
        p('“내가 여기 두면 상대는 어디에 둘까, 그러면 나는?”을 몇 단계까지 따라가는 힘이에요. 모든 가능성을 다 볼 수는 없으니, 의미 있는 후보 몇 개만 골라 깊게 보는 것이 핵심이에요.'),
        h3('형세 판단'),
        p('끝까지 읽을 수 없을 때, 지금 판이 누구에게 유리한지 가늠하는 감각이에요. 벽바둑이라면 “지금 벽을 다 세우면 내 땅이 몇 칸쯤 될까”를, 장기라면 말의 가치와 왕의 안전을 저울질하는 식이에요.'),
        h3('주도권'),
        p('상대가 반드시 받아야 하는 수를 두면, 상대는 자기 계획을 미루고 내 수에 답해야 해요. 이렇게 흐름을 쥐는 감각을 바둑에서는 선수, 체스에서는 템포라고 불러요. 같은 실력이라도 주도권을 쥔 쪽이 훨씬 편하게 둬요.'),
        h3('패턴 인식'),
        p('많이 둘수록 “이 모양은 위험하다”, “이 배치는 곧 막힌다” 같은 패턴이 쌓여요. 고수가 빨리 두는 건 모든 수를 계산해서가 아니라, 계산할 필요가 없는 수를 패턴으로 걸러 내기 때문이에요.'),
      ]),
      sec('classics', '알아 두면 좋은 대표 게임', [
        table(
          ['게임', '어떤 게임인가', '눈여겨볼 점'],
          [
            ['바둑', '돌로 집을 둘러싸 더 넓은 영역을 차지하는 게임', '규칙은 몇 줄인데 경우의 수는 천문학적이에요. 동아시아에서 2천 년 넘게 이어졌어요.'],
            ['체스·장기·샹치·쇼기', '말을 움직여 상대 왕을 잡는 게임', '같은 조상에서 갈라졌다고 보는 견해가 널리 받아들여져요. 나라마다 규칙이 달라졌어요.'],
            ['헥스', '육각형 칸으로 판의 양쪽 변을 잇는 게임', '1942년 덴마크의 피트 하인이 처음 발표했고, 수학자 존 내시가 따로 다시 고안했어요. 비길 수 없는 구조로 유명해요.'],
            ['오셀로·리버시', '상대 돌을 끼워 뒤집어 판을 더 많이 차지하는 게임', '리버시는 1880년대 영국에서 나왔고, 오셀로는 1971년 일본의 하세가와 고로가 특허를 냈어요.'],
            ['커넥트 포', '세워진 판에 돌을 떨어뜨려 넷을 잇는 게임', '1974년 미국에서 처음 팔렸고, 1988년에 선공이 이기는 게임으로 증명됐어요.'],
            ['나인 멘스 모리스', '셋을 한 줄로 세워 상대 말을 잡는 게임', '로마 시대부터 기록이 남은 고전이에요. 컴퓨터 분석으로 비기는 게임임이 밝혀졌어요.'],
          ],
          '연도와 인물은 둘 이상의 자료가 일치하는 것만 적었어요.',
        ),
        p('여기에 고블렛 고블러스처럼 큰 말이 작은 말을 덮는 3목 게임, 씨앗을 구멍에 나눠 담는 만칼라 계열 같은 게임도 추상 전략의 넓은 가족에 들어가요. 공통점은 판 위에 모든 것이 드러나 있고, 결과가 두는 사람의 선택으로만 정해진다는 거예요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        ul(
          '**혼자 곱씹는 걸 좋아하는 사람.** 한 판이 끝나도 “그때 다른 데 뒀으면?”을 계속 생각하게 돼요.',
          '**실력이 느는 걸 눈으로 보고 싶은 사람.** 운이 없으니 승률이 곧 실력이에요. AI 상대로 이기는 단계가 하나씩 올라가는 재미가 커요.',
          '**짧은 시간에 진하게 집중하고 싶은 사람.** 3×4칸 십이장기나 3×3 러시아장기처럼 몇 분이면 끝나는 작은 판도 많아요.',
        ),
        p('반대로 왁자지껄한 분위기나 역전의 짜릿함을 원한다면 블러핑이나 파티 게임이 더 잘 맞을 수 있어요. 실력 차이가 크면 추상 전략 게임은 거의 늘 실력이 높은 쪽이 이겨서, 처음 배우는 사람과 고수가 함께 즐기기는 쉽지 않아요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK의 추상 전략 게임', [
        p('PUZZLTHINK에는 순수한 추상 전략 게임이 여럿 있어요. **벽바둑**과 **벽바둑 II**는 말을 옮긴 뒤 반드시 벽을 하나 세우는 게임이라, 한 수 한 수가 영역 싸움이 돼요. **십이장기**와 **러시아장기**는 아주 작은 판에서 끝까지 계산해 볼 수 있는 미니 전략 게임이고, **레이저 장기**는 거울로 빛의 길을 설계하는 독특한 게임이에요.'),
        p('반면 **카드 장기**는 행마 카드의 순서를 몰래 정하기 때문에 숨은 정보가 섞여 있고, **블라인드 오목**은 돌의 진영이 보이지 않아서 기억력이 필요해요. 둘 다 판 위의 전략이 중심이지만, 엄밀하게는 추상 전략 게임 바깥쪽 경계에 있는 게임이에요. 이런 차이를 알고 두면 각 게임에서 무엇을 연습해야 하는지가 더 분명해져요.'),
        tip('처음이라면', '규칙이 짧은 게임부터 AI와 두어 보세요. 진 판에서 결정적인 실수 한 수만 찾아내는 습관을 들이면, 어떤 추상 전략 게임이든 빠르게 늘어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'What is an abstract strategy game? Features, skills and classic examples',
      description: 'Abstract strategy games have no dice and no hidden cards. What defines them, what makes them fun, the skills they reward, classics like go, chess, Hex and Othello, and the abstract games you can play on PUZZLTHINK.',
      keywords: ['abstract strategy game', 'abstract strategy board games', 'no luck board games', 'two player strategy games', 'Hex board game', 'history of Othello'],
    },
    title: 'Abstract strategy games',
    lead: 'No luck and nothing hidden. If you win, you played better; if you lose, you missed something.',
    intro: [
      'Sit down at a go board and both players see exactly the same thing. Nobody rolls dice, and nobody wonders what the other is holding. The game is decided by how far and how accurately each of you can see the next few moves. Games like this are called **abstract strategy games**.',
      'This article covers what makes a game abstract, where the fun comes from, which skills you build, the classics that define the genre, and the abstract games you can play on PUZZLTHINK right now.',
    ],
    summary: 'The genre where reading ahead is everything: no dice, nothing hidden. From go and chess to Wallgo — what makes it fun and what it asks of you.',
    sections: [
      sec('what', 'What counts as abstract strategy', [
        p('There is no single official definition, but a game is usually called abstract strategy when it has three properties.'),
        ul(
          '**Everything is visible.** Both players see the full position. This is called perfect information.',
          '**Nothing is left to chance.** No dice, no card draws. The same moves always lead to the same result.',
          '**The theme hardly matters.** Janggi pieces may be called chariots and cannons, but you do not need the war story to understand the rules. Replace the names with symbols and the game is unchanged.',
        ),
        p('Most are two-player games played in turns. With three or more players, politics creeps in — who gangs up on whom — and the result stops depending purely on reading the board.'),
        note('The border is blurry', 'Some people count backgammon, which uses dice, as abstract; others do not. Games with a little hidden information sit in the same grey zone. Classification is a tool for understanding games, so use it to ask “how pure is this game?” rather than to draw hard lines.'),
      ]),
      sec('fun', 'Where the fun comes from', [
        p('The appeal of abstract games is that **there is no excuse**. You cannot blame a bad hand or a bad roll. Wins feel earned, and after a loss you can trace exactly where it went wrong. That is why go and janggi players have such a strong habit of replaying a game move by move afterwards.'),
        p('The second draw is the **gap between short rules and deep play**. You can explain gomoku in a minute, yet a strong player and a beginner are worlds apart. The simpler the rules, the more the difference comes from thinking alone, so you can actually watch yourself improve.'),
        p('Finally, two plans collide on one board. Your opponent reads your plan and blocks it; you twist it again. It feels like a conversation held in moves — the deepest pleasure of the genre.'),
      ]),
      sec('skills', 'The skills it builds', [
        h3('Reading ahead'),
        p('“If I play here, where do they answer, and then what?” — followed several steps deep. You cannot check every possibility, so the real skill is picking a few meaningful candidates and reading those deeply.'),
        h3('Judging the position'),
        p('When you cannot read to the end, you estimate who is better. In Wallgo that means “if every wall went up now, how many cells would be mine?”; in janggi it means weighing material against king safety.'),
        h3('Initiative'),
        p('A move your opponent must answer forces them to postpone their own plan. Go players call this sente; chess players talk about tempo. Between equal players, the one holding the initiative has a much easier game.'),
        h3('Pattern recognition'),
        p('The more you play, the more shapes you recognise: “this is dangerous”, “this is about to be sealed off”. Strong players move fast not because they calculate everything, but because patterns let them skip moves that need no calculation.'),
      ]),
      sec('classics', 'Classics worth knowing', [
        table(
          ['Game', 'What it is', 'Worth noting'],
          [
            ['Go', 'Surround territory with stones', 'A few lines of rules and an astronomical number of positions; played in East Asia for over two thousand years.'],
            ['Chess, janggi, xiangqi, shogi', 'Move pieces to capture the enemy king', 'Widely believed to share one ancestor; each country changed the rules its own way.'],
            ['Hex', 'Connect your two sides of a board of hexagons', 'First published by Piet Hein in Denmark in 1942 and independently devised again by John Nash; famous for being unable to end in a draw.'],
            ['Othello / Reversi', 'Flank and flip stones to own more of the board', 'Reversi dates from 1880s England; Othello was patented in Japan by Goro Hasegawa in 1971.'],
            ['Connect Four', 'Drop discs into an upright grid to make four in a row', 'First sold in the US in 1974; proven a first-player win in 1988.'],
            ["Nine men's morris", 'Line up three to capture an enemy piece', 'Recorded since Roman times; computer analysis showed it is a draw.'],
          ],
          'Dates and names are given only where at least two sources agree.',
        ),
        p('Games like Gobblet Gobblers, where big pieces cover small ones, and the mancala family, where seeds are sown around pits, belong to the same wide family. What they share: everything is on the board, and only the players’ choices decide the result.'),
      ]),
      sec('who', 'Who it suits', [
        ul(
          '**People who like to mull things over.** After a game ends you keep asking “what if I had played there?”',
          '**People who want to see themselves improve.** With no luck, your win rate is your skill. Climbing AI levels one by one is deeply satisfying.',
          '**People who want short, intense focus.** Small boards like 12 Janggi (3×4) or Russian Janggi (3×3) finish in minutes.',
        ),
        p('If you want noise and dramatic comebacks, bluffing or party games may suit you better. When skill levels differ a lot, an abstract game is almost always won by the stronger player, which makes mixed groups hard.'),
      ]),
      sec('puzzlthink', 'Abstract games on PUZZLTHINK', [
        p('PUZZLTHINK has several pure abstract games. In **Wallgo** and **Wallgo II** every move must end with a wall, so each turn is a fight over territory. **12 Janggi** and **Russian Janggi** are miniature games you can calculate almost to the end, and **Laser Janggi** has you design the path of a beam with mirrors.'),
        p('**Card Janggi**, by contrast, has you secretly order your move cards, so hidden information enters; **Blind Gomoku** hides which side each stone belongs to, so memory matters. Both are board-strategy games at heart, but strictly they sit at the outer edge of the genre. Knowing the difference makes it clearer what each game trains.'),
        tip('Starting out', 'Pick a game with short rules and play the AI. After each loss, find just the one decisive mistake. That habit improves you quickly in any abstract game.'),
      ]),
    ],
  },
};

export default article;
