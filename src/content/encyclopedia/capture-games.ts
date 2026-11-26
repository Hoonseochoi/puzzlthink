import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'capture-games',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'janggi', ko: '3×4칸에 말 4개씩. 잡은 말을 내 말로 다시 내려놓고, 왕이 적진에서 한 턴 버텨도 이겨요.', en: 'Four pieces each on 3×4. Captured pieces return as yours, and a king that survives a turn in the enemy camp wins.' },
    { game: 'cardJanggi', ko: '말마다 행마가 정해진 게 아니라, 몰래 순서를 정한 행마 카드가 이번 수의 움직임을 정해요.', en: 'Moves are not tied to pieces: a secretly ordered deck of move cards decides how you move this turn.' },
    { game: 'laserJanggi', ko: '말이 직접 잡지 않고, 거울로 반사한 레이저가 말을 제거해요. 상대 왕을 먼저 맞히면 승리예요.', en: 'Pieces do not capture directly; a laser bounced off mirrors removes them. Hit the enemy king first to win.' },
    { game: 'nineMensMorris', ko: '줄을 만들 때마다 상대 말을 하나씩 잡아내는, 잡기와 줄 만들기가 섞인 고전이에요.', en: 'A classic that mixes lines and captures: every mill removes an enemy piece.' },
  ],
  related: ['chess-family-history', 'abstract-strategy', 'solved-games', 'first-move-advantage', 'perfect-information'],
  sources: [
    { title: 'Dōbutsu shōgi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/D%C5%8Dbutsu_sh%C5%8Dgi' },
    { title: 'Dobutsu Shogi rules', site: 'The Chess Variant Pages', url: 'https://chessvariants.org/rules/dobutsushogi' },
    { title: 'どうぶつしょうぎの完全解析 (analysis slides)', site: 'University of Tokyo, Tanaka lab', url: 'https://www.tanaka.ecc.u-tokyo.ac.jp/ktanaka/dobutsushogi/20090626.pptx.pdf' },
    { title: 'Shogi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Shogi' },
    { title: 'Janggi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Janggi' },
    { title: 'Janggi (Korean chess)', site: 'The Chess Variant Pages', url: 'https://ChessVariants.com/oriental.dir/koreanchess.html' },
  ],
  ko: {
    meta: {
      title: '말을 움직여 잡는 게임 — 장기·체스형 게임의 구조와 실력',
      description: '장기·체스·쇼기처럼 말을 움직여 상대를 잡는 게임은 어떻게 설계될까요? 말의 움직임 종류, 승리 조건, 잡은 말 재사용과 승급, 미니 장기 변형, 필요한 실력과 PUZZLTHINK 십이장기·카드 장기·레이저 장기까지 정리했어요.',
      keywords: ['장기 같은 게임', '체스형 게임', '말 잡기 게임', '미니 장기', '십이장기', '쇼기 잡은 말', '도부츠 쇼기'],
    },
    title: '말을 움직여 잡는 게임 (장기·체스형)',
    lead: '말마다 정해진 움직임, 그리고 잡느냐 잡히느냐. 가장 오래된 전쟁 놀이의 구조예요.',
    intro: [
      '장기, 체스, 샹치, 쇼기는 나라도 규칙도 다르지만 한눈에 같은 가족이라는 걸 알 수 있어요. **말마다 움직임이 정해져 있고, 상대 말이 있는 칸으로 가면 그 말을 잡고, 상대의 핵심 말(왕·궁)을 잡으면 이긴다**는 뼈대가 같거든요.',
      '이 글은 그 뼈대를 메커니즘으로 뜯어봐요. 말의 움직임에는 어떤 종류가 있는지, 이기는 조건은 어떻게 다를 수 있는지, 잡은 말을 다시 쓰는 규칙이 게임을 얼마나 바꾸는지를 알면, 처음 보는 장기 변형도 금방 감을 잡을 수 있어요. 이 가족의 역사는 「장기·샹치·쇼기·체스의 계보」에서 따로 다뤄요.',
    ],
    summary: '말마다 정해진 움직임과 잡기로 겨루는 게임의 설계도. 움직임의 종류, 승리 조건, 잡은 말 재사용, 미니 장기 변형까지 정리했어요.',
    sections: [
      sec('moves', '말의 움직임은 세 종류', [
        p('말이 수십 가지라도 움직이는 방식은 크게 세 가지로 나눌 수 있어요.'),
        table(
          ['종류', '움직임', '예'],
          [
            ['한 칸씩 걷는 말', '정해진 방향으로 한 칸만 가요.', '체스의 킹, 장기의 졸·사, 십이장기의 말 대부분'],
            ['끝까지 달리는 말', '막히지 않는 한 한 방향으로 몇 칸이든 가요.', '체스의 룩·비숍, 장기의 차'],
            ['뛰어넘는 말', '중간을 건너뛰어 정해진 자리에 내려앉아요.', '체스의 나이트, 장기의 마·상(가는 길이 막히면 못 가요), 장기의 포(다른 말을 하나 넘어야 해요)'],
          ],
        ),
        p('달리는 말은 판이 넓을수록 강하고, 걷는 말은 판이 좁을수록 상대적으로 강해져요. 판이 아주 작은 미니 장기에 달리는 말이 거의 없는 이유예요. 뛰어넘는 말은 막고 있는 말을 무시하기 때문에, 포위나 견제를 깨는 역할을 맡아요.'),
      ]),
      sec('goal', '이기는 조건도 여러 가지', [
        ul(
          '**외통(체크메이트)**: 체스와 장기처럼, 왕이 공격받고 있는데 피할 방법이 없으면 끝나요. 실제로 왕을 잡지는 않아요.',
          '**왕 잡기**: 십이장기처럼 상대 왕을 실제로 잡으면 이기는 게임도 있어요. 규칙이 직관적이라 미니 게임에서 자주 써요.',
          '**진영 들어가기**: 내 왕이 상대 진영 끝에 도달해 버티면 이기는 규칙이에요. 공격만이 아니라 왕의 “달리기”가 전략이 돼요.',
          '**간접 공격**: 레이저 장기처럼 말이 직접 잡지 않고, 반사된 빛이나 다른 장치가 대신 공격하기도 해요.',
        ),
        p('승리 조건이 하나 늘면 게임의 성격이 크게 달라져요. 진영 들어가기 규칙이 있으면, 상대 왕을 쫓던 말들이 동시에 상대 왕의 앞길도 막아야 해서 수비와 공격의 경계가 흐려져요.'),
      ]),
      sec('drops', '잡은 말을 다시 쓰면', [
        p('일본의 쇼기에는 다른 장기에 없는 큰 특징이 있어요. **잡은 상대 말을 내 말로 판 위에 다시 내려놓을 수 있어요.** 그래서 판 위의 말이 끝까지 잘 줄어들지 않고, 끝내기에서도 공격이 계속 이어져요.'),
        p('이 규칙 하나로 게임의 감각이 완전히 달라져요. 체스에서는 말을 하나 앞서면 교환을 거듭해 단순하게 이기는 길이 있지만, 쇼기에서는 잡은 말이 곧 다음 공격의 재료라서 교환이 끝없는 공방으로 이어져요. 내려놓을 자리도 거의 자유로워서, “이 칸에 무엇이 떨어질 수 있나”를 늘 계산해야 해요.'),
        h3('승급'),
        p('약한 말이 상대 진영에 들어가면 더 강한 말로 바뀌는 규칙도 이 가족의 단골이에요. 체스의 폰은 끝 줄에 닿으면 다른 말로 바뀌고, 쇼기의 말 대부분은 적진에서 뒤집혀 강해져요. 끝까지 살아남은 졸 하나가 판을 뒤집는 이야기가 여기서 나와요.'),
      ]),
      sec('mini', '미니 장기의 세계', [
        p('판과 말을 확 줄인 미니 장기도 하나의 흐름이에요. 대표적인 예가 일본의 **도부츠 쇼기(동물 쇼기)**예요. 2008년 여성 프로 쇼기 기사 기타오 마도카가 어린이용으로 고안했고, 3×4칸 판에 사자·기린·코끼리·병아리 말을 써요. 잡은 말을 다시 쓰는 쇼기 규칙과, 사자가 상대 진영에 들어가 버티면 이기는 규칙이 있어요.'),
        p('판이 작은 만큼 컴퓨터가 끝까지 계산할 수 있어서, 2009년 도쿄대학 연구진이 이 게임을 완전히 분석했어요. 결과는 **양쪽이 완벽하게 두면 후공이 이긴다**는 것이었어요. 작은 판에서도 사람에게는 충분히 어렵고, 동시에 정답이 존재한다는 점이 미니 장기의 묘한 매력이에요.'),
        note('PUZZLTHINK의 십이장기와의 관계', 'PUZZLTHINK의 십이장기도 3×4칸 판에 將·相·王·子 네 말을 쓰고, 잡은 말을 다시 내려놓으며, 王이 적진에서 한 턴을 버티면 이기는 구조예요. 도부츠 쇼기와 매우 닮은 미니 장기라서, 작은 판에서 쇼기식 감각을 익히기에 좋아요.'),
      ]),
      sec('skills', '필요한 실력', [
        h3('말의 가치 감각'),
        p('어떤 말을 주고 어떤 말을 받을지 판단하려면 말마다 대략의 가치를 알아야 해요. 다만 가치는 고정돼 있지 않아요. 판이 열리면 달리는 말이, 판이 막히면 뛰어넘는 말이 비싸져요.'),
        h3('왕의 안전'),
        p('잡기 게임에서는 말을 아무리 많이 따도 왕이 잡히면 끝이에요. 공격하기 전에 내 왕 주변에 상대가 들어올 길이 있는지부터 확인하는 습관이 중요해요.'),
        h3('수읽기와 전술'),
        p('양쪽을 동시에 노리는 양수겸장, 앞의 말을 움직이면 뒤의 말이 드러나는 공격, 피할 수 없게 묶는 견제 같은 전술 패턴이 이 가족의 공통 언어예요. 한 게임에서 익힌 패턴이 다른 장기에서도 그대로 통해요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('**십이장기**는 위에서 본 미니 장기의 재미를 그대로 담고 있어요. **카드 장기**는 6×5 판에서 쥐·말·원숭이·코끼리·기린 다섯 장의 행마 카드 순서를 몰래 정하고, 공개된 카드대로만 말을 움직여요. 말에 움직임이 붙어 있지 않다는 점에서 전통 장기와 정반대의 발상이에요. **레이저 장기**는 말이 직접 잡지 않고 거울과 레이저로 공격하는 간접 공격형 게임이에요.'),
        tip('작은 판부터', '장기나 체스가 어렵게 느껴진다면 십이장기처럼 작은 판에서 시작해 보세요. 말 몇 개로도 양수겸장과 왕의 안전 같은 핵심 개념을 모두 경험할 수 있어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Capture games — how chess-like games are built and what they ask of you',
      description: 'How games like chess, janggi and shogi are designed: the kinds of piece movement, win conditions, reusing captured pieces, promotion, miniature variants like Dobutsu shogi, the skills involved, and PUZZLTHINK’s 12 Janggi, Card Janggi and Laser Janggi.',
      keywords: ['chess like games', 'capture games', 'mini shogi', '12 Janggi', 'shogi drops', 'Dobutsu shogi', 'chess variants'],
    },
    title: 'Capture games (chess-like games)',
    lead: 'Each piece has its own move, and the question is who captures whom — the structure of the oldest war game.',
    intro: [
      'Janggi, chess, xiangqi and shogi differ in country and rules, yet you can tell at a glance they are one family. **Each piece moves in its own way, moving onto an enemy piece captures it, and capturing the key piece — the king or general — wins.**',
      'This article takes that skeleton apart as mechanics: the kinds of movement, the ways a game can be won, and how reusing captured pieces changes everything. Know these and any new chess variant makes sense quickly. The family’s history is covered separately in “The chess family: janggi, xiangqi, shogi and chess”.',
    ],
    summary: 'The blueprint of games where pieces move and capture: kinds of movement, win conditions, reusing captured pieces, and miniature variants.',
    sections: [
      sec('moves', 'Three kinds of movement', [
        p('However many pieces a game has, they move in roughly three ways.'),
        table(
          ['Kind', 'Movement', 'Examples'],
          [
            ['Steppers', 'One square in set directions.', 'The chess king; janggi soldiers and guards; most 12 Janggi pieces'],
            ['Riders', 'Any distance in a line until blocked.', 'Chess rook and bishop; janggi chariot'],
            ['Leapers', 'Jump over the middle to a fixed landing square.', 'Chess knight; janggi horse and elephant (blocked if the path is occupied); janggi cannon (must jump exactly one piece)'],
          ],
        ),
        p('Riders get stronger on bigger boards; steppers gain relative strength on small ones — which is why tiny chess variants have almost no riders. Leapers ignore whatever blocks them, so they are the pieces that break blockades.'),
      ]),
      sec('goal', 'Many ways to win', [
        ul(
          '**Checkmate**: as in chess and janggi, the game ends when the king is attacked and cannot escape. The king is never actually taken.',
          '**Capturing the king**: some games, like 12 Janggi, are won by actually taking the king. It is intuitive, so mini games use it often.',
          '**Reaching the camp**: your king wins by reaching and holding the far side. The king’s run becomes a strategy, not just attack.',
          '**Indirect attack**: in Laser Janggi pieces do not capture; a reflected beam does the attacking.',
        ),
        p('One extra win condition changes a game’s character. With a “reach the camp” rule, pieces chasing the enemy king must also block its run, blurring attack and defence.'),
      ]),
      sec('drops', 'When captured pieces come back', [
        p('Japanese shogi has a feature the other members lack: **a captured enemy piece can be dropped back onto the board as your own**. Material rarely thins out, and attacks continue right into the endgame.'),
        p('That one rule changes the feel entirely. In chess, a piece up, you can trade down to a simple win; in shogi every captured piece is ammunition, so trades turn into endless back-and-forth. Drops can land almost anywhere, so you constantly ask what could fall onto a given square.'),
        h3('Promotion'),
        p('Weak pieces turning stronger when they enter enemy territory is another family staple. A chess pawn reaching the last rank becomes another piece; most shogi pieces flip and strengthen in the enemy camp. Stories of one surviving pawn turning a game come from here.'),
      ]),
      sec('mini', 'The world of mini chess', [
        p('Shrinking board and pieces is a tradition of its own. A well-known example is Japan’s **Dobutsu shogi** (“animal shogi”), devised for children in 2008 by the women’s professional shogi player Madoka Kitao. It uses a 3×4 board with lion, giraffe, elephant and chick, shogi-style drops, and a lion that wins by reaching and surviving in the enemy camp.'),
        p('Being small, it could be calculated to the end: in 2009 researchers at the University of Tokyo analysed it completely. With perfect play, **the second player wins**. Hard enough for humans, yet with a known answer — that is the odd charm of mini chess.'),
        note('How it relates to PUZZLTHINK’s 12 Janggi', '12 Janggi also uses a 3×4 board with four pieces (將, 相, 王, 子), drops captured pieces back in, and is won when 王 survives a turn in the enemy camp. It is a mini game very close to Dobutsu shogi, and a good place to pick up shogi-style instincts.'),
      ]),
      sec('skills', 'The skills it builds', [
        h3('A sense of piece value'),
        p('Deciding what to give and what to take requires rough values for each piece. They are not fixed, though: open positions favour riders, closed ones favour leapers.'),
        h3('King safety'),
        p('However much material you win, losing the king ends the game. Before attacking, check whether there is a way into your own king’s area.'),
        h3('Reading and tactics'),
        p('Forks that hit two targets, discovered attacks where moving one piece unmasks another, pins that freeze a piece — these tactics are the family’s shared language. What you learn in one game carries straight over to the others.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('**12 Janggi** captures the fun of the mini games above. In **Card Janggi** you secretly order five move cards — mouse, horse, monkey, elephant, giraffe — on a 6×5 board and may only move as the revealed card says: movement is not tied to pieces, the opposite of traditional chess. **Laser Janggi** is an indirect-attack game where mirrors and a laser do the capturing.'),
        tip('Start small', 'If janggi or chess feels daunting, start on a small board like 12 Janggi. With just a few pieces you will meet forks, king safety and every other core idea.'),
      ]),
    ],
  },
};

export default article;
