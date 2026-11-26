import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'chess-family-history',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'janggi', ko: '쇼기처럼 잡은 말을 다시 쓰는 3×4칸 미니 장기예요. 큰 가족의 감각을 몇 분 만에 맛볼 수 있어요.', en: 'A 3×4 mini game with shogi-style drops — the family’s instincts in a few minutes.' },
    { game: 'cardJanggi', ko: '말이 아니라 카드가 움직임을 정하는, 장기 가족을 비튼 변형이에요.', en: 'A twist on the family where cards, not pieces, decide the movement.' },
    { game: 'laserJanggi', ko: '말이 직접 잡지 않고 레이저로 공격하는, 장기라는 이름을 단 새로운 전략 게임이에요.', en: 'A newer strategy game in the janggi name where a laser does the capturing.' },
  ],
  related: ['capture-games', 'abstract-strategy', 'first-move-advantage', 'solved-games', 'history-of-baduk'],
  sources: [
    { title: 'Chaturanga', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Chaturanga' },
    { title: 'The history of chess', site: 'World History Encyclopedia', url: 'https://www.worldhistory.org/article/2793/the-history-of-chess/' },
    { title: 'Shatranj', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Shatranj' },
    { title: 'Scachs d’amor: the empowered queen', site: 'ChessBase', url: 'https://en.chessbase.com/post/scachs-damor-poem-part-3' },
    { title: 'Scachs d’amor', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Scachs_d%27amor' },
    { title: 'Janggi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Janggi' },
    { title: 'Differences of janggi (Korean chess) to xiangqi (Chinese chess)', site: 'hartwork blog', url: 'https://blog.hartwork.org/posts/differences-of-janggi-korean-chess-to-xiangqi-chinese-chess/' },
    { title: 'Janggi (Korean chess)', site: 'The Chess Variant Pages', url: 'https://ChessVariants.com/oriental.dir/koreanchess.html' },
    { title: 'Shogi', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Shogi' },
    { title: 'Deep Blue versus Garry Kasparov', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Deep_Blue_versus_Garry_Kasparov' },
  ],
  ko: {
    meta: {
      title: '장기·샹치·쇼기·체스의 계보 — 하나의 조상에서 갈라진 전쟁 게임들',
      description: '인도의 차투랑가에서 페르시아의 샤트란지, 유럽의 체스, 중국의 샹치, 한국의 장기, 일본의 쇼기까지. 장기 가족이 어떻게 퍼지고 나라마다 어떻게 달라졌는지, 장기와 샹치의 차이, 쇼기의 잡은 말 규칙, 퀸의 등장까지 정리했어요.',
      keywords: ['장기 역사', '체스 역사', '장기 기원', '샹치', '쇼기', '차투랑가', '장기와 샹치 차이', '퀸의 역사'],
    },
    title: '장기·샹치·쇼기·체스의 계보',
    lead: '왕을 지키고 왕을 노리는 게임. 서로 다른 나라의 장기가 사실은 먼 친척이에요.',
    intro: [
      '한국의 장기, 중국의 샹치(象棋), 일본의 쇼기(将棋), 서양의 체스. 판의 모양도 말의 이름도 다르지만, 판 위에서 군대를 움직여 상대의 왕을 노린다는 뼈대는 같아요. 체스 역사가들 사이에서는 이 게임들이 **하나의 조상에서 갈라져 나왔다**는 견해가 널리 받아들여지고 있어요.',
      '이 글에서는 그 조상으로 꼽히는 인도의 게임부터 시작해, 서쪽과 동쪽으로 퍼져 가며 각 나라에서 어떻게 달라졌는지를 따라가 봐요. 마지막에는 우리에게 가장 가까운 장기가 샹치와 무엇이 다른지도 정리해요.',
    ],
    summary: '인도의 차투랑가에서 체스·샹치·장기·쇼기까지. 하나의 조상에서 갈라진 전쟁 게임들이 나라마다 어떻게 달라졌는지 따라가요.',
    sections: [
      sec('root', '뿌리: 인도의 차투랑가', [
        p('장기 가족의 조상으로 가장 많이 꼽히는 게임은 인도의 **차투랑가**예요. 분명한 기록으로는 6세기 북인도 굽타 왕조 시대의 것이 가장 이르고, 7세기 무렵에는 확실히 존재했던 것으로 보고 있어요. “차투랑가”는 보병·기병·코끼리·전차라는 고대 인도 군대의 네 부대를 가리키는 말로 알려져 있어요.'),
        note('다른 견해도 있어요', '차투랑가가 공통 조상이라는 것이 주류 견해이지만 완전히 정리된 사실은 아니에요. 소수 견해로 차투랑가 자체가 중국의 옛 장기에서 나왔다는 주장도 있어요. 훨씬 더 오래된 인더스 문명까지 거슬러 올라가는 주장도 있지만 근거가 약해요.'),
      ]),
      sec('west', '서쪽으로: 샤트란지를 거쳐 체스로', [
        p('차투랑가는 서쪽으로 페르시아(사산 왕조)에 전해져 **차트랑**이 되었고, 7세기 중반 아랍이 페르시아를 정복하면서 이슬람 세계로 빠르게 퍼져 **샤트란지**가 됐어요. 이름이 이어지는 모습 자체가 게임이 인도에서 왔다는 증거로 여겨져요.'),
        p('이슬람 세계를 거쳐 유럽에 들어온 이 게임은 오랫동안 지금보다 훨씬 느린 게임이었어요. 결정적인 변화는 **퀸**이었어요. 원래 왕 옆에서 대각선으로 한 칸만 움직이던 약한 말이, 가로·세로·대각선으로 끝까지 달리는 가장 강한 말이 된 거예요. 이 새로운 움직임을 담은 가장 이른 문헌으로 스페인 발렌시아의 시 「스카스 다모르(Scachs d’amor)」가 흔히 꼽혀요. 1475년 무렵의 작품으로 소개되지만 정확한 연도는 확정되지 않았어요. 이 “퀸의 체스”는 빠르게 유럽 전역으로 퍼져 옛 방식을 대체했어요.'),
      ]),
      sec('east', '동쪽으로: 샹치, 장기, 쇼기', [
        h3('중국의 샹치'),
        p('샹치는 칸 안이 아니라 **선의 교차점**에 말을 놓아요. 판 가운데에는 양 진영을 가르는 “강”이 있고, 각 진영에는 장수가 벗어날 수 없는 “궁”이 있어요. 다른 말을 하나 넘어서 잡는 **포(炮)**가 특징적인 말이에요.'),
        h3('한국의 장기'),
        p('장기는 샹치에서 갈라져 나온 것으로 널리 받아들여지고 있어요. 그래서 궁, 포, 교차점에 놓는 방식 같은 뼈대를 공유하지만, 차이도 분명해요. 아래 표에서 따로 정리할게요.'),
        h3('일본의 쇼기'),
        p('쇼기는 칸 안에 말을 놓고, 말이 모두 같은 색의 오각형 패라서 방향으로 편을 구분해요. 가장 큰 특징은 **잡은 상대 말을 내 말로 다시 내려놓는 규칙**이에요. 이 규칙이 언제 생겼는지는 확실하지 않지만 16세기 무렵으로 보는 자료가 많아요. 이 규칙 덕분에 쇼기는 끝까지 말이 줄지 않는, 가족 중 가장 공격적인 게임이 됐어요.'),
      ]),
      sec('janggi-vs-xiangqi', '장기와 샹치, 무엇이 다를까', [
        table(
          ['', '장기', '샹치'],
          [
            ['강', '없어요. 모든 말이 판 전체를 오갈 수 있어요.', '있어요. 상(象)과 사(士)는 강을 건너지 못해요.'],
            ['장수의 시작 자리', '궁의 한가운데', '궁의 맨 뒷줄 가운데'],
            ['포', '움직일 때도 잡을 때도 반드시 다른 말 하나를 넘어야 해요. 포끼리는 넘지도 잡지도 못해요.', '움직일 때는 그냥 가고, 잡을 때만 하나를 넘어요.'],
            ['시작 배치', '마와 상의 자리를 대국 전에 바꿔 고를 수 있어요.', '정해져 있어요.'],
            ['궁 안의 대각선', '궁 안에서는 대각선을 따라 움직일 수 있는 말이 있어요.', '사와 장수만 정해진 방식으로 움직여요.'],
          ],
          '세부 규칙은 대회와 단체마다 조금씩 다를 수 있어요.',
        ),
        p('장기에서 두 장수가 가로막는 말 없이 마주 보게 되는 상황을 **빅장**이라고 해요. 빅장을 어떻게 처리할지는 자료와 규칙마다 달라요. 비김으로 보는 경우도 있고, 점수로 승부를 가리는 경우도 있어요.'),
      ]),
      sec('computers', '기계와의 대결', [
        p('장기 가족은 컴퓨터와의 대결에서도 상징적인 무대였어요. 1997년 IBM의 **딥 블루**가 당시 체스 세계 챔피언 가리 카스파로프와의 대국에서 이기면서, 컴퓨터가 체스에서 사람을 넘어섰다는 사실이 널리 알려졌어요. 그 뒤로도 체스는 끝까지 계산이 끝나지 않은 “풀리지 않은 게임”으로 남아 있어요. 경우의 수가 너무 많아서, 양쪽이 완벽하게 두면 누가 이기는지는 아직 아무도 몰라요.'),
      ]),
      sec('learn', '가족을 알면 좋은 점', [
        ul(
          '**전술이 그대로 통해요.** 양쪽을 동시에 노리는 수, 앞의 말을 비켜 뒤의 말을 드러내는 공격 같은 전술은 어느 장기에서나 같아요.',
          '**차이를 보면 규칙이 쉽게 외워져요.** “장기 포는 움직일 때도 넘어야 한다”처럼 차이점 중심으로 외우면 헷갈리지 않아요.',
          '**새 변형도 금방 익혀요.** 미니 장기나 변형 게임을 처음 볼 때 “이 말은 어느 말의 변형이지?”를 물으면 감이 빨리 와요.',
        ),
        tip('PUZZLTHINK에서 시작하기', '정통 장기가 부담스럽다면 3×4칸 십이장기로 가족의 감각을 먼저 익혀 보세요. 잡은 말을 다시 쓰는 규칙 덕분에 쇼기의 맛도 함께 느낄 수 있어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'The chess family — janggi, xiangqi, shogi and chess from one ancestor',
      description: 'From India’s chaturanga to Persia’s shatranj, European chess, Chinese xiangqi, Korean janggi and Japanese shogi: how the family spread and changed in each country, how janggi differs from xiangqi, shogi’s drop rule and the arrival of the modern queen.',
      keywords: ['history of chess', 'janggi history', 'xiangqi', 'shogi', 'chaturanga', 'janggi vs xiangqi', 'history of the queen in chess'],
    },
    title: 'The chess family: janggi, xiangqi, shogi and chess',
    lead: 'Games of guarding your king and hunting theirs — distant relatives across many countries.',
    intro: [
      'Korean janggi, Chinese xiangqi, Japanese shogi and Western chess differ in boards and piece names, but share a skeleton: move an army to hunt the enemy king. Among chess historians it is widely accepted that these games **branched from a single ancestor**.',
      'This article starts with the Indian game usually named as that ancestor and follows it west and east, watching how each country changed it. At the end we look at how janggi, the one closest to home for Korean players, differs from xiangqi.',
    ],
    summary: 'From chaturanga to chess, xiangqi, janggi and shogi: how war games from one ancestor changed country by country.',
    sections: [
      sec('root', 'The root: chaturanga', [
        p('The game most often named as the family’s ancestor is India’s **chaturanga**. The earliest clear references come from the Gupta era in northern India in the 6th century, and by around the 7th century it certainly existed. “Chaturanga” is understood to refer to the four divisions of an ancient Indian army: infantry, cavalry, elephants and chariots.'),
        note('Other views', 'Chaturanga as common ancestor is the mainstream view but not fully settled. A minority argues chaturanga itself came from an early Chinese game, and claims reaching back to the Indus Valley civilisation rest on weak evidence.'),
      ]),
      sec('west', 'West: through shatranj to chess', [
        p('Chaturanga travelled west to Sassanid Persia as **chatrang**, and after the Arab conquest of Persia in the mid-7th century spread rapidly through the Islamic world as **shatranj**. The chain of names itself is taken as evidence the game came from India.'),
        p('Reaching Europe via the Islamic world, the game long remained much slower than today. The decisive change was the **queen**: a weak piece that moved one square diagonally beside the king became the strongest piece, sweeping any distance along ranks, files and diagonals. The earliest text describing the new move is usually said to be the Valencian poem Scachs d’amor, often dated to around 1475, though the exact year is not settled. This “queen’s chess” spread quickly through Europe and replaced the old form.'),
      ]),
      sec('east', 'East: xiangqi, janggi and shogi', [
        h3('Chinese xiangqi'),
        p('Xiangqi places pieces on **intersections**, not squares. A “river” divides the two sides, and each side has a “palace” the general cannot leave. Its signature piece is the **cannon**, which captures by jumping over exactly one piece.'),
        h3('Korean janggi'),
        p('Janggi is widely accepted to have branched from xiangqi. It shares the palace, the cannon and play on intersections, but the differences are clear — see the table below.'),
        h3('Japanese shogi'),
        p('Shogi uses squares, and all pieces are same-coloured pentagonal tiles whose direction shows their side. Its great feature is **dropping captured enemy pieces back as your own**. When the rule arose is uncertain, but many sources place it around the 16th century. Thanks to it, shogi never runs out of material and is the most aggressive game in the family.'),
      ]),
      sec('janggi-vs-xiangqi', 'Janggi versus xiangqi', [
        table(
          ['', 'Janggi', 'Xiangqi'],
          [
            ['River', 'None — every piece can roam the whole board.', 'Yes — elephants and advisors cannot cross it.'],
            ['General starts', 'In the centre of the palace', 'On the back edge of the palace'],
            ['Cannon', 'Must jump exactly one piece to move as well as to capture; cannot jump or capture another cannon.', 'Moves normally; jumps only to capture.'],
            ['Setup', 'Horse and elephant positions can be swapped by choice before play.', 'Fixed.'],
            ['Palace diagonals', 'Some pieces may move along the palace’s diagonal lines.', 'Only advisors and the general move in set ways there.'],
          ],
          'Details can vary slightly between associations and events.',
        ),
        p('In janggi, when the two generals face each other with nothing between them it is called **bikjang**. How it is resolved differs by source and rule set — some treat it as a draw, others settle the game on points.'),
      ]),
      sec('computers', 'Against the machine', [
        p('The chess family was also a symbolic arena for computers. In 1997 IBM’s **Deep Blue** beat the reigning world chess champion Garry Kasparov in a match, making it widely known that computers had overtaken humans at chess. Chess nonetheless remains unsolved: there are so many possibilities that nobody yet knows who wins with perfect play.'),
      ]),
      sec('learn', 'Why knowing the family helps', [
        ul(
          '**Tactics carry over.** Forks, discovered attacks and the like work the same in every member.',
          '**Differences make rules easy to remember.** Learn them as contrasts — “the janggi cannon must jump even to move” — and you will not mix them up.',
          '**New variants come quickly.** Facing a mini game or variant, ask “which piece is this a version of?” and it clicks.',
        ),
        tip('Starting on PUZZLTHINK', 'If full janggi feels heavy, pick up the family’s instincts on the 3×4 board of 12 Janggi first. Its drop rule gives you a taste of shogi too.'),
      ]),
    ],
  },
};

export default article;
