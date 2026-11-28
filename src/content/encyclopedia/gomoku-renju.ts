import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'gomoku-renju',
  category: 'lineage',
  updated: '2026-11-26',
  games: [
    { game: 'flipOmok', ko: '쌍삼을 양쪽 모두 금지하고 정확히 5목만 인정해요. 여기에 한 판 3번뿐인 끼워 뒤집기를 더한 창작 오목이에요.', en: 'Double threes are barred for both and only exactly five wins — plus flanking flips, three per game.' },
    { game: 'blindGomoku', ko: '33·44 금수 없이 5목 이상이면 이기는 자유 오목 규칙에, 진영을 숨기는 장치를 더했어요.', en: 'Free-style rules — five or more wins, no 3-3 or 4-4 restrictions — with hidden sides.' },
    { game: 'pointOmok', ko: '정확히 5목만 인정하는 오목에 포인트 입찰을 결합했어요.', en: 'Exactly-five gomoku combined with points bidding.' },
  ],
  related: ['n-in-a-row', 'first-move-advantage', 'solved-games', 'history-of-baduk', 'abstract-strategy'],
  sources: [
    { title: 'Renju', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Renju' },
    { title: 'The rules and the history of Renju and other five-in-a-row games', site: 'Renju International Federation', url: 'https://renju.se/rif/r1rulhis.htm' },
    { title: 'Renju International Federation', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Renju_International_Federation' },
    { title: 'Renju for beginners', site: 'Renju International Federation', url: 'https://www.renju.se/rif/nosovsky/renjuforbeginners.pdf' },
    { title: 'Go-Moku solved (summary and references)', site: 'UC Irvine, David Eppstein', url: 'https://www.ics.uci.edu/~eppstein/cgt/gomoku.html' },
    { title: 'Go-moku family of games', site: 'ICGA', url: 'https://icga.org/icga/games/go-moku' },
    { title: 'Solving Renju (Wágner & Virág, ICGA Journal 2001)', site: 'ICGA Journal', url: 'https://unpaywall.org/10.3233%2FICG-2001-24104' },
    { title: 'Gomoku', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Gomoku' },
  ],
  ko: {
    meta: {
      title: '오목과 렌주 — 오목의 역사, 렌주 금수 규칙, 오목은 정말 풀렸을까',
      description: '바둑판에서 다섯 개를 잇던 놀이가 어떻게 시합용 게임 렌주가 되었을까요? 렌주라는 이름의 유래, 흑만 받는 금수(쌍삼·쌍사·장목)가 생긴 이유, 국제 렌주 연맹, 오목과 렌주가 컴퓨터로 풀렸는지까지 정리했어요.',
      keywords: ['오목 역사', '렌주', '렌주 규칙', '오목 금수', '쌍삼 금지', '오목 선공 필승', '오목 규칙 차이'],
    },
    title: '오목과 렌주',
    lead: '누구나 아는 다섯 개 잇기. 그 뒤에는 100년 넘게 이어진 “흑이 너무 유리하다”와의 싸움이 있어요.',
    intro: [
      '오목만큼 설명이 필요 없는 게임도 드물어요. 바둑판과 바둑돌만 있으면 되고, 같은 색 다섯 개를 먼저 한 줄로 이으면 이겨요. 그런데 이 단순한 게임을 진지한 시합으로 만들려던 사람들은 곧 큰 문제에 부딪혔어요. **먼저 두는 흑이 너무 유리하다**는 거였어요.',
      '이 글에서는 오목이 어떻게 시합용 게임 **렌주**로 다듬어졌는지, 렌주의 금수는 왜 흑에게만 있는지, 그리고 컴퓨터가 오목과 렌주에 대해 무엇을 밝혀냈는지를 따라가 봐요.',
    ],
    summary: '다섯 개 잇기 놀이가 시합용 렌주가 되기까지. 렌주라는 이름, 흑에게만 있는 금수, 오목이 컴퓨터로 풀렸다는 이야기의 진짜 의미를 정리했어요.',
    sections: [
      sec('origin', '바둑판 위의 다섯 개 잇기', [
        p('오목은 일본에서 “고모쿠나라베(五目並べ)”라는 이름으로 널리 즐겨졌고, 영어 이름 “고모쿠(gomoku)”도 여기서 왔어요. 바둑과 같은 판과 돌을 쓰기 때문에 바둑이 퍼진 동아시아 곳곳에서 자연스럽게 함께 놀이로 자리 잡았어요.'),
        note('더 오래된 기원에 대해', '오목이 훨씬 오래전 중국이나 고대 일본에서 시작됐다는 이야기도 전해지지만, 둘 이상의 자료로 확인되는 기록은 찾기 어려웠어요. 그래서 이 글은 비교적 분명한 근대 이후의 흐름만 다뤄요.'),
      ]),
      sec('renju', '렌주라는 이름', [
        p('시합용 오목인 **렌주(連珠)**는 “구슬을 꿴 것”이라는 뜻이에요. 이 이름은 1899년 12월 6일 일본의 신문 『요로즈초호(萬朝報)』를 통해 붙여졌다는 데 자료들이 일치해요. 다만 이름을 지은 사람을 신문 쪽 인물인 구로이와 루이코로 적는 자료와, 렌주 명인 다카야마 고라쿠로 적는 자료가 있어서 이 부분은 확정하지 않았어요.'),
        p('이후 일본에서 렌주 단체가 만들어지고 규칙이 정비되었고, 1988년 8월 8일에는 스웨덴 스톡홀름에서 **국제 렌주 연맹(RIF)**이 세워졌어요. 처음 회원은 일본, 소련, 스웨덴 세 곳이었어요. 연맹은 세계 각국의 렌주·오목 단체를 묶고 국제 대회를 열어요.'),
      ]),
      sec('forbidden', '금수: 흑에게만 걸린 족쇄', [
        p('렌주의 가장 큰 특징은 **흑만 둘 수 없는 수**, 즉 금수예요.'),
        table(
          ['금수', '뜻', '왜 막았나'],
          [
            ['쌍삼(3-3)', '한 수로 열린 삼 두 개를 동시에 만드는 수', '막을 수 없는 이중 위협이라 흑의 가장 쉬운 승리 수단이에요.'],
            ['쌍사(4-4)', '한 수로 사 두 개를 동시에 만드는 수', '역시 한 번에 둘을 막을 수 없어요.'],
            ['장목', '여섯 개 이상을 한 줄로 잇는 수', '흑은 정확히 다섯이어야 해요. 백은 장목으로도 이길 수 있어요.'],
          ],
        ),
        p('여기서 재미있는 전략이 생겨요. 백은 흑이 금수 자리밖에 둘 수 없게 몰아붙여 이기는 방법을 노릴 수 있어요. 흑이 막아야 할 자리가 하필 금수라면, 흑은 막을 수 없거든요. 그래서 렌주에서는 흑은 금수를 피하며 공격하고, 백은 흑을 금수로 몰아넣는 서로 다른 전략이 생겨요.'),
        h3('개시 규칙'),
        p('금수만으로는 균형이 충분하지 않아서, 시합에서는 첫 몇 수를 어디에 둘지 정하는 **개시 규칙**도 써요. 한 사람이 첫 몇 수를 놓고 다른 사람이 흑과 백 중 하나를 고르게 하는 식으로, 처음 놓는 사람이 너무 유리한 배치를 만들지 못하게 해요. 야마구치 규칙, 소소르브 규칙처럼 여러 방식이 있어요.'),
      ]),
      sec('solved', '오목은 정말 풀렸을까', [
        p('“오목은 선공 필승이 증명됐다”는 말을 들어 봤을 거예요. 사실이지만, 정확히 어떤 오목인지가 중요해요.'),
        table(
          ['게임', '결과', '누가, 언제'],
          [
            ['자유 오목 (15×15, 제한 없음)', '흑 필승', '빅터 알리스, 1990년대 초 (1993년 발표, 1994년 학위 논문으로 정리)'],
            ['개시 규칙 없는 렌주형 게임', '흑 필승으로 주장됨', '바그너와 비라그, 2001년'],
            ['현대 개시 규칙의 렌주', '아직 풀리지 않음', ''],
          ],
        ),
        p('즉 아무 제한 없는 오목은 흑이 완벽하게 두면 반드시 이긴다는 것이 증명됐어요. 하지만 시합에서 쓰는 개시 규칙까지 갖춘 렌주는 아직 풀리지 않았어요. 사람과 사람 사이의 승부로서 렌주가 여전히 살아 있는 이유예요.'),
        note('“풀렸다”의 의미', '필승법이 존재한다는 증명과, 사람이 그 필승법을 외워서 쓸 수 있다는 건 전혀 다른 이야기예요. 자유 오목에서도 사람끼리 두면 백이 이기는 판이 얼마든지 나와요. 풀린 게임이 무엇인지는 「풀린 게임」에서 자세히 다뤄요.'),
      ]),
      sec('rules-today', '우리가 두는 오목은 어떤 규칙일까', [
        p('일상에서 두는 오목은 렌주가 아닌 경우가 많아요. 흔히 볼 수 있는 규칙을 정리하면 이래요.'),
        ul(
          '**자유 오목**: 아무 금수가 없고, 다섯 개 이상이면 이겨요. 흑이 크게 유리해요.',
          '**양쪽 쌍삼 금지**: 흑과 백 모두 쌍삼을 둘 수 없어요. 일상 오목에서 많이 쓰는 방식이에요.',
          '**정확히 5목**: 여섯 개 이상은 인정하지 않아요. 장목으로 이기는 걸 막아요.',
          '**렌주**: 흑에게만 쌍삼·쌍사·장목 금수가 있고, 시합에서는 개시 규칙을 더해요.',
        ),
        tip('규칙에 따라 전략이 바뀌어요', '자유 오목에서는 흑으로 쌍삼을 노리는 공격이 강하지만, 쌍삼이 금지된 규칙에서는 사삼(사와 열린 삼을 동시에)을 만드는 연습이 중요해요. 정확히 5목 규칙에서는 내 돌이 여섯 개로 이어져 무효가 되지 않는지도 늘 확인하세요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Gomoku and renju — history, the forbidden moves, and whether gomoku is solved',
      description: 'How did five-in-a-row on a go board become the tournament game renju? The origin of the name, why only Black has forbidden moves (double three, double four, overline), the Renju International Federation, and what computers have proven about gomoku and renju.',
      keywords: ['history of gomoku', 'renju', 'renju rules', 'gomoku forbidden moves', 'double three rule', 'gomoku solved', 'gomoku rule variants'],
    },
    title: 'Gomoku and renju',
    lead: 'The five-in-a-row everyone knows — and behind it, more than a century of fighting the fact that Black is too strong.',
    intro: [
      'Few games need less explanation than gomoku. A go board and stones are enough; be first to get five of your colour in a row and you win. But people who tried to turn it into serious competition hit a big problem: **Black, moving first, is too strong**.',
      'This article follows how gomoku was refined into the tournament game **renju**, why renju’s forbidden moves apply only to Black, and what computers have revealed about gomoku and renju.',
    ],
    summary: 'From five-in-a-row to tournament renju: the name, the forbidden moves only Black has, and what “gomoku is solved” really means.',
    sections: [
      sec('origin', 'Five in a row on a go board', [
        p('Gomoku was widely played in Japan as gomoku-narabe, which gave the English name. Because it uses the same board and stones as go, it settled in naturally as a pastime wherever go spread in East Asia.'),
        note('On older origins', 'Stories place gomoku’s beginnings much earlier, in China or ancient Japan, but records confirmed by more than one source are hard to find, so this article covers only the clearer modern history.'),
      ]),
      sec('renju', 'The name renju', [
        p('The tournament form, **renju** (連珠), means “a string of pearls”. Sources agree the name was given on 6 December 1899 through the Japanese newspaper Yorozu Chōhō. Some credit the journalist Kuroiwa Ruikō and others the renju master Takayama Goraku, so who coined it is left open here.'),
        p('Renju organisations and rules developed in Japan afterwards, and on 8 August 1988 the **Renju International Federation (RIF)** was founded in Stockholm, Sweden. Its founding members were Japan, the Soviet Union and Sweden. It unites renju and gomoku bodies worldwide and runs international events.'),
      ]),
      sec('forbidden', 'Forbidden moves: shackles on Black only', [
        p('Renju’s defining feature is **moves Black may not make**.'),
        table(
          ['Forbidden', 'Meaning', 'Why'],
          [
            ['Double three (3-3)', 'One move creating two open threes', 'An unstoppable double threat — Black’s easiest win.'],
            ['Double four (4-4)', 'One move creating two fours', 'Likewise impossible to block both.'],
            ['Overline', 'Six or more in a row', 'Black needs exactly five; White may win with six or more.'],
          ],
        ),
        p('This creates an interesting strategy: White can try to force Black into a spot where the only defence is a forbidden point. If the square Black must block is forbidden, Black cannot block. So Black attacks while avoiding forbidden points, and White tries to drive Black onto them.'),
        h3('Opening rules'),
        p('Forbidden moves alone do not balance the game, so tournaments add **opening rules** for the first few stones — for instance, one player places the opening stones and the other chooses which colour to play, so whoever places them cannot set up an overly favourable position. Several systems exist, such as Yamaguchi and Soosõrv.'),
      ]),
      sec('solved', 'Is gomoku really solved?', [
        p('You may have heard that gomoku is a proven first-player win. That is true, but which gomoku matters.'),
        table(
          ['Game', 'Result', 'Who, when'],
          [
            ['Free-style gomoku (15×15, no restrictions)', 'Black wins', 'Victor Allis, early 1990s (announced 1993, written up in his 1994 thesis)'],
            ['Renju-like game without opening rules', 'Claimed Black win', 'Wágner and Virág, 2001'],
            ['Renju with modern opening rules', 'Not solved', ''],
          ],
        ),
        p('So unrestricted gomoku is proven to be a forced win for Black with perfect play, but renju with tournament opening rules is not solved. That is why renju is still alive as a human contest.'),
        note('What “solved” means', 'Proving a winning strategy exists is very different from people being able to memorise and use it. Even in free-style gomoku, White wins plenty of games between humans. See “Solved games” for more.'),
      ]),
      sec('rules-today', 'Which rules do everyday games use?', [
        p('Everyday gomoku is often not renju. Common rule sets:'),
        ul(
          '**Free-style**: no restrictions; five or more wins. Black is much stronger.',
          '**Double three barred for both**: neither side may make a 3-3. Common in casual play.',
          '**Exactly five**: six or more does not count, so overlines cannot win.',
          '**Renju**: Black alone is barred from 3-3, 4-4 and overlines, with opening rules in tournaments.',
        ),
        tip('Strategy follows the rules', 'In free-style, Black’s double-three attacks are strong; where double threes are barred, practise the four-three (a four and an open three at once). Under exactly-five rules, always check your stones will not join into an invalid six.'),
      ]),
    ],
  },
};

export default article;
