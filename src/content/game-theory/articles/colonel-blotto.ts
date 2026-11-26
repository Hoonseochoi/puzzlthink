import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'colonel-blotto',
  category: 'allocation',
  updated: '2026-11-26',
  games: ['blackWhite', 'blackWhite2'],
  related: ['minimax-mixed-strategy', 'zero-sum', 'auctions', 'bluffing'],
  ko: {
    meta: {
      title: '블로토 대령 게임 — 한정된 자원을 어디에 걸까, 흑과 백으로 읽기 | PUZZLTHINK 게임 이론',
      description: '병력을 여러 전장에 나눠 더 많은 전장에서 이기는 블로토 대령 게임. 왜 "정답 배분"이 없는지, 버리는 판과 아슬아슬한 승리의 가치, 그리고 흑과 백·흑과 백 II에 그대로 숨어 있는 블로토 구조를 정리했어요.',
      keywords: ['블로토 게임', '블로토 대령 게임', '자원 배분 게임', '흑과 백 전략', '흑과 백 공략', '더 지니어스 흑과 백'],
    },
    title: '블로토 대령 게임',
    lead: '모든 곳에서 이길 수는 없어요. 어디서 질지를 고르는 게임.',
    intro: [
      '두 장군이 같은 수의 병력을 가지고 여러 전장에 동시에 군대를 보내요. 각 전장에서는 더 많이 보낸 쪽이 이기고, 더 많은 전장을 이긴 쪽이 전쟁에서 이겨요. 이것이 **블로토 대령 게임(Colonel Blotto game)**이에요.',
      '규칙은 단순한데, 이 게임에는 "이렇게 나누면 무조건 좋다"는 배분이 없어요. 그리고 이 구조는 [흑과 백](/black-white)과 [흑과 백 II](/black-white-2)에 거의 그대로 들어 있어요. 숫자 타일이나 점수를 아홉 라운드에 나눠 쓰는 순간, 여러분은 블로토 대령이 되는 거예요.',
    ],
    summary: '같은 병력을 여러 전장에 나눠 과반을 이기는 게임. 흑과 백·흑과 백 II의 뼈대.',
    sections: [
      {
        id: 'origin',
        title: '게임의 기원',
        blocks: [
          { type: 'p', text: '이 게임은 프랑스 수학자 에밀 보렐이 1921년 논문에서 처음 제시했어요. "블로토 대령"이라는 이름은 1950년 미국 랜드 연구소의 올리버 그로스와 로버트 와그너가 쓴 보고서에서 붙었어요. 그 뒤로 군사 전략뿐 아니라 선거 운동에서 어느 지역에 예산을 쓸지, 회사가 여러 시장에 자원을 어떻게 나눌지 같은 문제의 모형으로 쓰였어요.' },
        ],
      },
      {
        id: 'model',
        title: '작은 모형: 병사 6명, 전장 3곳',
        blocks: [
          { type: 'p', text: '두 사람이 각각 병사 6명을 가지고 전장 셋(가·나·다)에 나눠 보내요. 각 전장에서 더 많이 보낸 쪽이 그 전장을 이기고, 같으면 무승부예요. 세 전장 중 더 많이 이긴 쪽이 승리해요.' },
          { type: 'p', text: '가장 공평해 보이는 (2, 2, 2)부터 볼까요? 이 배분은 (3, 3, 0)에 져요. 가와 나에서 3 대 2로 지고, 다에서만 2 대 0으로 이기니까요. 그럼 (3, 3, 0)이 좋은 배분일까요? 아니에요. (4, 0, 2)가 가에서 4 대 3, 다에서 2 대 0으로 이겨요. 그리고 (4, 0, 2)는 (0, 1, 5)에 져요. 나와 다를 내주거든요.' },
          { type: 'table', head: ['내 배분', '이 배분을 이기는 배분', '이유'], rows: [
            ['(2, 2, 2)', '(3, 3, 0)', '두 곳에서 한 명씩 더, 한 곳은 포기'],
            ['(3, 3, 0)', '(4, 0, 2)', '비어 있는 다를 싸게 먹고 가를 한 명 차이로'],
            ['(4, 0, 2)', '(0, 1, 5)', '비어 있는 나를 1명으로, 다를 크게'],
            ['(0, 1, 5)', '(1, 2, 3)', '가와 나를 한 명씩 차이로'],
          ], caption: '어떤 배분이든 그것을 이기는 배분이 있어요. 가위바위보처럼 끝없이 돌아요.' },
          { type: 'callout', tone: 'note', title: '정답 배분이 없다', text: '어떤 배분을 고정하든 상대가 그걸 알면 이길 수 있어요. 그래서 이 예처럼 자원이 같은 블로토 게임에는 **순수 전략 균형이 없고**, 균형은 여러 배분을 섞는 혼합 전략이에요. 자원이 같고 전장 가치도 같은 연속 버전에서는, 균형에서 한 전장에 넣는 양이 0부터 평균의 두 배까지 고르게 퍼진다는 것이 알려져 있어요. "늘 공평하게" 나누는 것도, "늘 한곳에 몰빵"하는 것도 균형이 아니라는 뜻이에요.' },
        ],
      },
      {
        id: 'lessons',
        title: '블로토가 가르쳐 주는 세 가지',
        blocks: [
          { type: 'list', items: [
            '**과반만 이기면 돼요.** 전부 이길 필요가 없어요. 세 전장이라면 둘, 아홉 라운드라면 다섯이에요. 나머지는 버려도 되고, 버리는 쪽이 오히려 효율적이에요.',
            '**이길 때는 아슬아슬하게, 질 때는 크게.** 한 명 차이로 이긴 전장과 다섯 명 차이로 이긴 전장은 똑같이 한 승이에요. 남는 병력은 다른 곳에서 쓰는 게 이득이에요. 반대로 질 전장에는 아무것도 안 보내는 게 가장 싸요.',
            '**읽히면 끝이에요.** 내 배분 습관을 상대가 알면 정확히 한 명씩 더 넣어 이길 수 있어요. 그래서 균형이 혼합 전략이에요.',
          ] },
        ],
      },
      {
        id: 'black-white',
        title: '흑과 백: 숫자 9개짜리 블로토',
        blocks: [
          { type: 'p', text: '[흑과 백](/black-white)에서 두 사람은 똑같이 0부터 8까지 타일 9장을 가져요. 라운드마다 한 장씩 내고, 더 큰 숫자를 낸 쪽이 그 라운드를 이겨요(같으면 무승부). 아홉 라운드에서 더 많이 이긴 쪽이 승리하고, 따라잡을 수 없을 만큼 앞서면 바로 끝나요.' },
          { type: 'p', text: '이것을 블로토로 보면, 아홉 개의 전장에 총합 36의 병력을 나누는데 **각 전장에 넣는 양이 0~8 중 서로 다른 숫자여야 하는** 특별한 블로토예요. 그리고 순수한 블로토와 다른 점이 두 가지 있어요.' },
          { type: 'list', items: [
            '**순서가 있어요.** 라운드를 이긴 사람이 다음 라운드에 먼저 내요. 먼저 내는 사람은 타일을 엎어 내고, 상대는 그 색(짝수는 흑, 홀수는 백)만 보고 응수해요.',
            '**정보가 조금씩 새어요.** 숫자는 끝까지 공개되지 않지만, 색과 승패는 공개돼요. "흑을 냈는데 내 7에 졌다"면 그 타일은 8이었다는 걸 알 수 있어요. 블로토에 추리가 섞이는 거예요.',
          ] },
          { type: 'h3', text: '버리는 판의 가치' },
          { type: 'p', text: '블로토의 교훈 "질 때는 크게"는 흑과 백에서 아주 구체적이에요. 상대가 8을 낼 것 같은 라운드에 내 0을 내면, 상대는 가장 강한 타일을 써서 고작 1승을 얻어요. 그 대가로 나는 남은 라운드에서 상대의 8이 없다는 이점을 얻어요. 반대로 내 8로 상대의 0을 이기면 1승은 얻지만 가장 비싼 타일을 낭비한 셈이에요.' },
          { type: 'callout', tone: 'tip', title: '흑과 백에서 써먹기', text: '이기는 라운드는 한 끗 차이로, 지는 라운드는 가장 작은 타일로 지는 것이 이상적이에요. 상대의 흑·백 색과 승패를 기록해 남은 타일을 좁혀 가면, 상대가 어느 라운드에 큰 타일을 "낭비"했는지 보이기 시작해요. 그리고 나 자신도 "큰 타일은 초반에" 같은 습관을 들이지 마세요. 블로토에서는 읽히는 배분이 지는 배분이에요.' },
        ],
      },
      {
        id: 'black-white-2',
        title: '흑과 백 II: 99점을 아홉 라운드에',
        blocks: [
          { type: 'p', text: '[흑과 백 II](/black-white-2)는 블로토에 더 가까워요. 두 사람이 각자 99점을 가지고, 라운드마다 비밀리에 몇 점을 걸지 정해요(0점도 가능). 더 많이 건 쪽이 라운드를 이기고, 다섯 라운드를 먼저 이기면 승리해요. 건 점수는 사라져요. 한 자리 숫자를 걸면 흑, 두 자리 숫자를 걸면 백으로 표시되고, 남은 점수는 20점 단위 게이지로 늘 공개돼요. 아홉 라운드 뒤 동점이면 33점으로 세 라운드 연장전을 해요.' },
          { type: 'list', items: [
            '**평균은 20점 정도예요.** 다섯 승에 99점을 쓴다면 한 승에 평균 약 20점이에요. 하지만 블로토의 교훈대로라면, 어떤 라운드는 0~1점으로 버리고 어떤 라운드는 크게 걸어야 해요.',
            '**색이 보내는 신호.** 흑(0~9점)은 "이번 판은 버리거나 싸게 이기려 한다"는 뜻일 가능성이 높아요. 먼저 거는 사람이 흑을 냈다면, 뒤에 거는 사람은 (남은 점수가 있다면) 10점만 걸어도 확실히 이겨요. 그래서 먼저 거는 사람은 일부러 10~15점 정도의 "작은 백"을 섞어 상대를 헷갈리게 할 수 있어요.',
            '**게이지로 상대 예산을 추적하세요.** 게이지가 언제, 몇 칸 내려가는지를 기록하면 상대가 남긴 점수의 범위가 좁혀져요(경계 근처라면 1점만 써도 한 칸 내려갈 수 있으니 범위로 생각하세요). 남은 라운드 수와 상대가 필요한 승수를 같이 보면, 상대가 언제 크게 걸어야만 하는지가 보여요.',
          ] },
          { type: 'callout', tone: 'warn', title: '균형은 "섞기"예요', text: '흑과 백 II를 완전히 푼 해법을 여기서 제시하지는 않아요. 다만 블로토 이론이 분명히 말해 주는 건, 매번 같은 방식(예: 늘 20점씩, 늘 초반 몰빵)으로 거는 사람은 상대가 정확히 한 점씩 더 걸어 이길 수 있다는 거예요.' },
        ],
      },
      {
        id: 'beyond',
        title: '현실의 블로토',
        blocks: [
          { type: 'p', text: '선거 운동은 블로토의 교과서적인 예예요. 여러 지역에서 과반을 얻어야 하는 제도에서는, 어차피 이길 곳과 어차피 질 곳에는 돈을 덜 쓰고 접전 지역에 집중하는 경향이 나타나요. 스포츠에서 감독이 체력이 한정된 선수들을 여러 경기에 나눠 쓰는 것, 회사가 여러 제품군에 연구비를 나누는 것도 비슷한 구조예요. 다만 현실에서는 전장마다 가치가 다르고, 자원이 서로 다르며, 정보가 새기 때문에 위의 작은 모형보다 훨씬 복잡해요.' },
        ],
      },
    ],
    refs: [
      { title: 'Émile Borel, "La théorie du jeu et les équations intégrales à noyau symétrique", Comptes Rendus de l’Académie des Sciences, 1921 (영역: Econometrica 21, 1953)' },
      { title: 'Oliver Gross, Robert Wagner, "A Continuous Colonel Blotto Game", RAND Research Memorandum RM-408, 1950', url: 'https://www.rand.org/pubs/research_memoranda/RM408.html' },
      { title: 'Brian Roberson, "The Colonel Blotto game", Economic Theory 29, 2006' },
      { title: 'Wolfram MathWorld, "Blotto Game"', url: 'https://mathworld.wolfram.com/BlottoGame.html' },
      { title: 'PUZZLTHINK 흑과 백·흑과 백 II 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'The Colonel Blotto game — where to put a limited budget, read through Black & White | PUZZLTHINK',
      description: 'Split your troops across several battlefields and win more of them: the Colonel Blotto game. Why there is no "right" split, the value of throwaway rounds and narrow wins, and the Blotto structure hidden in Black & White and Black & White II.',
      keywords: ['Colonel Blotto', 'Blotto game', 'resource allocation game', 'Black and White strategy', 'The Genius Black and White', 'allocation strategy'],
    },
    title: 'The Colonel Blotto game',
    lead: 'You cannot win everywhere. The game is choosing where to lose.',
    intro: [
      'Two generals with equal armies send troops to several battlefields at once. On each battlefield the side that sent more wins, and whoever wins more battlefields wins the war. That is the **Colonel Blotto game**.',
      'The rules are simple, yet there is no split that is "simply good". And the structure sits almost unchanged inside [Black & White](/black-white) and [Black & White II](/black-white-2): the moment you spread number tiles or points over nine rounds, you are Colonel Blotto.',
    ],
    summary: 'Split equal armies across battlefields and win a majority: the skeleton of Black & White and Black & White II.',
    sections: [
      {
        id: 'origin',
        title: 'Where it comes from',
        blocks: [
          { type: 'p', text: 'The French mathematician Émile Borel first posed the game in a 1921 paper. The name "Colonel Blotto" comes from a 1950 RAND Corporation report by Oliver Gross and Robert Wagner. Since then it has modelled not only military strategy but also which regions a campaign should spend in and how a company should split resources across markets.' },
        ],
      },
      {
        id: 'model',
        title: 'A small model: six soldiers, three battlefields',
        blocks: [
          { type: 'p', text: 'Each player has six soldiers to send to three battlefields (A, B, C). On each battlefield the side with more soldiers wins; equal numbers are a draw. Whoever wins more of the three battlefields wins.' },
          { type: 'p', text: 'Start with the fair-looking (2, 2, 2). It loses to (3, 3, 0): 3–2 on A and B, and only C goes 2–0 the other way. So is (3, 3, 0) good? No: (4, 0, 2) beats it 4–3 on A and 2–0 on C. And (4, 0, 2) loses to (0, 1, 5), which takes B and C.' },
          { type: 'table', head: ['My split', 'A split that beats it', 'Why'], rows: [
            ['(2, 2, 2)', '(3, 3, 0)', 'One more on two fields, give up the third'],
            ['(3, 3, 0)', '(4, 0, 2)', 'Take the empty C cheaply, win A by one'],
            ['(4, 0, 2)', '(0, 1, 5)', 'Take the empty B with one, C big'],
            ['(0, 1, 5)', '(1, 2, 3)', 'Win A and B by one each'],
          ], caption: 'Every split has a split that beats it. Like rock–paper–scissors, it goes round forever.' },
          { type: 'callout', tone: 'note', title: 'No right split', text: 'Whatever split you fix, an opponent who knows it can beat it. So a Blotto game with equal resources like this one has **no pure-strategy equilibrium**; its equilibria are mixed strategies over many splits. In the continuous version with equal resources and equally valuable battlefields, it is known that in equilibrium the amount sent to a battlefield is spread evenly between zero and twice the average. Neither "always split evenly" nor "always pile into one place" is an equilibrium.' },
        ],
      },
      {
        id: 'lessons',
        title: 'Three lessons from Blotto',
        blocks: [
          { type: 'list', items: [
            '**A majority is enough.** You need not win everything: two of three battlefields, five of nine rounds. The rest can be given up, and giving them up is efficient.',
            '**Win narrowly, lose cheaply.** A battlefield won by one soldier and one won by five both count as one win; spare troops are better used elsewhere. On a battlefield you will lose anyway, sending nothing is cheapest.',
            '**Once read, you are done.** If the opponent knows your habits, they add exactly one soldier where it matters. That is why the equilibrium is mixed.',
          ] },
        ],
      },
      {
        id: 'black-white',
        title: 'Black & White: a nine-tile Blotto',
        blocks: [
          { type: 'p', text: 'In [Black & White](/black-white) both players hold the same nine tiles, 0 to 8. Each round each plays one; the higher number wins the round (equal numbers: no point). Whoever wins more of the nine rounds wins, and the game ends early once a lead cannot be caught.' },
          { type: 'p', text: 'As a Blotto game, it spreads a total of 36 over nine battlefields, with the special constraint that **each battlefield gets a different number from 0 to 8**. It also differs from pure Blotto in two ways.' },
          { type: 'list', items: [
            '**There is an order.** The round winner leads the next round. The leader lays a tile face down and the other player answers seeing only its colour (even is black, odd is white).',
            '**Information leaks bit by bit.** Numbers stay hidden to the end, but colours and results are public. "They led black and beat my 7" means that tile was the 8. Deduction gets mixed into Blotto.',
          ] },
          { type: 'h3', text: 'The value of a throwaway round' },
          { type: 'p', text: 'Blotto’s "lose cheaply" is very concrete here. Play your 0 in a round where the opponent is likely to play their 8, and they spend their strongest tile for a single win, while you enjoy the rest of the game without facing their 8. Beat their 0 with your 8 and you gain one win but waste your most expensive tile.' },
          { type: 'callout', tone: 'tip', title: 'Using it in Black & White', text: 'Ideally, win rounds by the smallest margin and lose them with your smallest tiles. Track the opponent’s colours and results to narrow down their remaining tiles, and you start to see where they "wasted" a big tile. And do not form habits like "big tiles early" yourself: in Blotto, a predictable split is a losing split.' },
        ],
      },
      {
        id: 'black-white-2',
        title: 'Black & White II: 99 points over nine rounds',
        blocks: [
          { type: 'p', text: '[Black & White II](/black-white-2) is closer still to Blotto. Each player has 99 points and secretly chooses how many to bid each round (zero is allowed). The higher bid wins the round, the first to five round wins takes the game, and bid points are spent. A one-digit bid shows as black, a two-digit bid as white, and each player’s remaining points are always shown on a gauge in 20-point bands. If the nine rounds end level, a three-round overtime with 33 points follows.' },
          { type: 'list', items: [
            '**The average is about 20.** Spending 99 points on five wins is roughly 20 per win. But by Blotto’s lessons, some rounds should be thrown away with 0–1 points and others bid big.',
            '**Colour is a signal.** Black (0–9) most likely means "throwing this round away or trying to win it cheaply". If the leader bids black, the follower wins for certain with 10 (if they have it). So a leader can mix in "small whites" of 10–15 to keep the follower guessing.',
            '**Track the budget with the gauge.** Note when and by how many bands the opponent’s gauge drops, and the range of their remaining points narrows (near a band edge a single point can drop it a band, so think in ranges). Combine that with the rounds left and the wins they still need, and you can see when they will be forced to bid big.',
          ] },
          { type: 'callout', tone: 'warn', title: 'Equilibrium means mixing', text: 'This article does not offer a full solution to Black & White II. What Blotto theory does say clearly is that a player who bids the same way every time — always about 20, always front-loading — can be beaten by an opponent who bids exactly one more.' },
        ],
      },
      {
        id: 'beyond',
        title: 'Blotto in the real world',
        blocks: [
          { type: 'p', text: 'Election campaigns are the textbook example. Where you need majorities across many regions, campaigns tend to spend less where they will surely win or surely lose and concentrate on close contests. A coach spreading players with limited stamina over several matches, or a company splitting research money over product lines, has a similar structure. Real cases are much messier than the small model: battlefields differ in value, resources are unequal and information leaks.' },
        ],
      },
    ],
    refs: [
      { title: 'Émile Borel, "La théorie du jeu et les équations intégrales à noyau symétrique", Comptes Rendus de l’Académie des Sciences, 1921 (English translation: Econometrica 21, 1953)' },
      { title: 'Oliver Gross, Robert Wagner, "A Continuous Colonel Blotto Game", RAND Research Memorandum RM-408, 1950', url: 'https://www.rand.org/pubs/research_memoranda/RM408.html' },
      { title: 'Brian Roberson, "The Colonel Blotto game", Economic Theory 29, 2006' },
      { title: 'Wolfram MathWorld, "Blotto Game"', url: 'https://mathworld.wolfram.com/BlottoGame.html' },
      { title: 'PUZZLTHINK Black & White and Black & White II rules (shown in each game)' },
    ],
  },
};

export default article;
