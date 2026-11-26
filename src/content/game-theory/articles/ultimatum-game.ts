import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'ultimatum-game',
  category: 'cooperation',
  updated: '2026-11-26',
  games: [],
  related: ['backward-induction', 'public-goods', 'commitment-threats', 'voting-coalitions'],
  ko: {
    meta: {
      title: '최후통첩 게임과 독재자 게임 — 사람들은 왜 공짜 돈을 거절할까 | PUZZLTHINK 게임 이론',
      description: '이론은 "1원이라도 받아라"라고 하는데, 실험 속 사람들은 불공정한 제안을 거절해요. 최후통첩 게임의 역진 귀납 예측과 실제 결과, 독재자 게임이 보여 주는 것, 그리고 상금 분배 협상에서 써먹는 법.',
      keywords: ['최후통첩 게임', '독재자 게임', '공정성 실험', '행동경제학 게임', '협상 게임 이론', '상금 분배'],
    },
    title: '최후통첩 게임과 독재자 게임',
    lead: '사람들은 공짜 돈을 거절해요. 그것도 꽤 자주.',
    intro: [
      '상금 1만 원을 두 사람이 나눠요. 한 사람이 나누는 비율을 제안하고, 다른 사람은 받아들이거나 거절할 수 있어요. 거절하면 **둘 다 한 푼도 못 받아요.** 협상도, 다음 기회도 없어요. 이것이 **최후통첩 게임**이에요.',
      '게임 이론의 계산은 아주 간단한 결론을 내요. 그런데 실제 사람들은 그 결론과 정반대로 움직여요. 이 차이는 경제학에서 "공정함"을 진지하게 다루게 만든 출발점 중 하나가 됐어요.',
    ],
    summary: '"1원이라도 받아라"는 이론과, 불공정한 제안을 거절하는 사람들. 공정함이 전략에 들어오는 순간.',
    sections: [
      {
        id: 'theory',
        title: '이론의 예측: 거의 다 가져가라',
        blocks: [
          { type: 'p', text: '뒤에서부터 생각해 볼게요(이 방법을 **역진 귀납**이라고 해요). 응답자는 제안을 받은 시점에 두 가지 중 하나를 골라요. 받으면 제안 금액, 거절하면 0원이에요. 점수만 따진다면 0원보다 많은 제안은 무엇이든 받아야 해요.' },
          { type: 'table', head: ['제안자 몫', '응답자 몫', '응답자가 받으면', '거절하면'], rows: [
            ['5,000원', '5,000원', '(5,000, 5,000)', '(0, 0)'],
            ['8,000원', '2,000원', '(8,000, 2,000)', '(0, 0)'],
            ['9,900원', '100원', '(9,900, 100)', '(0, 0)'],
          ], caption: '괄호 안은 (제안자, 응답자) 금액. 점수만 따지면 응답자는 어느 줄에서든 받는 게 나아요.' },
          { type: 'p', text: '제안자는 이걸 알기 때문에 가능한 가장 작은 단위(예: 100원)만 주고 나머지를 가져가요. 이것이 이 게임의 **부분 게임 완전 균형**이에요. 거절하겠다는 위협은 실제로 거절하면 자기만 손해이니 믿을 수 없는 위협이라는 거예요.' },
          { type: 'callout', tone: 'note', title: '다른 균형도 있어요', text: '엄밀히는 "4,000원 미만이면 거절한다"는 응답자 전략과 "6,000 : 4,000으로 제안한다"는 제안자 전략의 조합도 내시 균형이에요. 제안자가 그 위협을 믿는다면 4,000원을 주는 게 최선이니까요. 다만 이런 위협은 막상 2,000원을 제안받으면 실행할 이유가 없어서, 순서를 고려한 더 엄격한 기준(부분 게임 완전성)에서는 걸러져요.' },
        ],
      },
      {
        id: 'experiments',
        title: '실험 속 사람들',
        blocks: [
          { type: 'p', text: '1982년 독일의 경제학자 베르너 귀트, 롤프 슈미트베르거, 베른트 슈바르체가 이 게임을 실험실에서 처음 체계적으로 시험했어요. 결과는 이론과 전혀 달랐어요. 가장 흔한 제안은 **반반**이었고, 평균 제안도 전체의 3분의 1이 넘었어요. 그리고 적은 금액을 제안받은 응답자들은 상당수가 **거절**했어요.' },
          { type: 'p', text: '이후 수많은 나라에서 반복된 실험들도 비슷한 경향을 보여요. 제안은 대체로 전체의 40~50% 근처에 몰리고, 20%에 못 미치는 제안은 드물며 거절되는 경우가 많아요. 사람들은 손해를 감수하고서라도 불공정한 제안을 벌하려 해요.' },
          { type: 'callout', tone: 'warn', title: '"사람은 이타적이다"로 읽으면 안 돼요', text: '반반 제안이 많다고 제안자가 착해서라고 단정할 수는 없어요. 거절당할까 봐 두려워서 많이 주는 것일 수도 있거든요. 이걸 가려내려면 거절할 수 없는 게임을 해 봐야 해요. 그게 독재자 게임이에요.' },
        ],
      },
      {
        id: 'dictator',
        title: '독재자 게임: 거절이 없다면',
        blocks: [
          { type: 'p', text: '**독재자 게임**에서는 응답자가 아무 선택도 못 해요. 제안자가 나눈 대로 끝나요. 대니얼 카너먼, 잭 네치, 리처드 탈러가 1986년 연구에서 비슷한 설계를 썼고, 1994년 로버트 포사이스 등이 지금 흔히 쓰는 형태로 단순하게 만들어 최후통첩 게임과 비교했어요.' },
          { type: 'list', items: [
            '독재자 게임에서 사람들이 주는 몫은 최후통첩 게임보다 **확연히 적어요.** 평균은 대략 전체의 20~30% 정도로 보고되고, 한 푼도 주지 않는 사람도 많아요.',
            '그래도 **0은 아니에요.** 아무 위협이 없는데도 적지 않은 사람이 일부를 나눠요.',
            '즉 최후통첩 게임의 높은 제안에는 **공정함에 대한 선호**와 **거절에 대한 두려움**이 함께 들어 있어요. 둘의 차이가 바로 "전략적으로 준 몫"이에요.',
          ] },
          { type: 'p', text: '문화에 따른 차이도 커요. 조지프 헨릭 등의 연구진은 세계 여러 소규모 사회에서 같은 게임을 해 보고, 공동체의 생활 방식(예: 시장 거래나 공동 작업이 얼마나 많은지)에 따라 제안 수준이 크게 달라진다는 결과를 보고했어요. "공정한 몫"의 기준 자체가 사회마다 다르다는 뜻이에요.' },
        ],
      },
      {
        id: 'shows',
        title: '서바이벌 게임 속 최후통첩',
        blocks: [
          { type: 'p', text: '서바이벌 게임에는 "한 사람이 분배를 정하고, 다른 사람은 받거나 판을 엎는" 구조가 자주 들어가요(특정 회차가 아니라 구조 이야기예요).' },
          { type: 'list', items: [
            '**상금이나 생존권 분배.** 한 명이 점수나 아이템을 나눌 권한을 갖고, 나머지가 반대하면 아무도 못 받는 규칙이라면 최후통첩 게임이에요. 이론대로 "최소한만 주면 받겠지"라고 생각하면 위험해요. 실제 사람들은 모욕적인 제안을 거절하는 경우가 많으니까요.',
            '**공개된 자리에서의 분배.** 다른 참가자들이 지켜보는 앞이라면 거절이 "나는 만만하지 않다"는 평판을 만들어요. 반복되는 관계에서는 거절이 오히려 합리적인 투자가 될 수 있어요.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**제안자라면, 상대의 "거절 문턱"을 넘기세요.** 실험 결과로 보면 너무 적은 몫은 위험해요. 상대가 평판이나 자존심을 걸 수 있는 상황일수록 문턱이 높아요.',
            '**응답자라면, 거절의 위협을 미리 믿게 만드세요.** 제안을 받기 전에 "이 이하로는 안 받는다"는 걸 분명히 하고, 그걸 지킬 이유(지켜보는 사람, 다음 라운드)를 보여 주면 제안이 올라가요. 자세한 원리는 「[약속과 위협의 신빙성](/game-theory/commitment-threats)」에서 다뤄요.',
            '**제안할 권한 자체를 노리세요.** 최후통첩 게임에서 제안자는 대체로 절반 이상을 가져가요. 누가 제안권을 갖는지 정하는 단계가 있다면, 그 단계가 사실상 본게임이에요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Werner Güth, Rolf Schmittberger, Bernd Schwarze, "An Experimental Analysis of Ultimatum Bargaining", Journal of Economic Behavior and Organization 3(4), 1982' },
      { title: 'Daniel Kahneman, Jack L. Knetsch, Richard H. Thaler, "Fairness and the Assumptions of Economics", Journal of Business 59(4), 1986' },
      { title: 'Robert Forsythe, Joel L. Horowitz, N. E. Savin, Martin Sefton, "Fairness in Simple Bargaining Experiments", Games and Economic Behavior 6(3), 1994' },
      { title: 'Christoph Engel, "Dictator games: a meta study", Experimental Economics 14, 2011', url: 'https://www.cambridge.org/core/journals/experimental-economics/article/abs/dictator-games-a-meta-study/8597E66280017C3A83863C12A7F8F687' },
      { title: 'Joseph Henrich et al., "In Search of Homo Economicus: Behavioral Experiments in 15 Small-Scale Societies", American Economic Review 91(2), 2001' },
    ],
  },
  en: {
    meta: {
      title: 'The ultimatum and dictator games — why people turn down free money | PUZZLTHINK',
      description: 'Theory says take even a penny, but in experiments people reject unfair offers. The backward-induction prediction of the ultimatum game and what really happens, what the dictator game reveals, and how to use it when splitting a prize.',
      keywords: ['ultimatum game', 'dictator game', 'fairness experiment', 'behavioral economics games', 'bargaining game theory', 'splitting a prize'],
    },
    title: 'The ultimatum game and the dictator game',
    lead: 'People turn down free money, and fairly often.',
    intro: [
      'Two people split a prize of 10,000 won. One proposes the split; the other accepts or rejects. If they reject, **neither gets anything**. No negotiation, no second chance. This is the **ultimatum game**.',
      'Game theory’s arithmetic reaches a very simple conclusion, and real people do almost the opposite. That gap became one of the starting points for economists to take fairness seriously.',
    ],
    summary: 'Theory says take even a penny; people reject unfair offers. The moment fairness enters strategy.',
    sections: [
      {
        id: 'theory',
        title: 'The prediction: take almost everything',
        blocks: [
          { type: 'p', text: 'Reason from the end (this method is **backward induction**). When the responder receives an offer, accepting gets the offer and rejecting gets nothing. Counting money only, any positive offer should be accepted.' },
          { type: 'table', head: ['Proposer keeps', 'Responder gets', 'If accepted', 'If rejected'], rows: [
            ['5,000', '5,000', '(5,000, 5,000)', '(0, 0)'],
            ['8,000', '2,000', '(8,000, 2,000)', '(0, 0)'],
            ['9,900', '100', '(9,900, 100)', '(0, 0)'],
          ], caption: '(Proposer, responder) amounts in won. Counting money only, accepting is better on every row.' },
          { type: 'p', text: 'Knowing this, the proposer offers the smallest possible unit (say 100 won) and keeps the rest. That is the game’s **subgame-perfect equilibrium**. A threat to reject is not credible, because carrying it out only hurts the responder.' },
          { type: 'callout', tone: 'note', title: 'There are other equilibria', text: 'Strictly, the responder strategy "reject anything below 4,000" together with the proposer strategy "offer 6,000 : 4,000" is also a Nash equilibrium: if the proposer believes the threat, offering 4,000 is best. But faced with an actual offer of 2,000, the responder has no reason to carry out the threat, so the stricter standard that respects the order of moves (subgame perfection) rules it out.' },
        ],
      },
      {
        id: 'experiments',
        title: 'People in experiments',
        blocks: [
          { type: 'p', text: 'In 1982 the German economists Werner Güth, Rolf Schmittberger and Bernd Schwarze ran the first systematic laboratory tests of the game. The results were nothing like the theory. The most common offer was **an even split**, the average offer was above a third of the pie, and many responders offered small amounts **rejected** them.' },
          { type: 'p', text: 'Countless later experiments in many countries show a similar pattern: offers cluster around 40–50% of the pie, offers below 20% are rare and often rejected. People are willing to lose money to punish an unfair offer.' },
          { type: 'callout', tone: 'warn', title: 'Do not read it as "people are altruistic"', text: 'Many even splits do not prove proposers are kind; they may be afraid of rejection. To separate the two you need a game where rejection is impossible: the dictator game.' },
        ],
      },
      {
        id: 'dictator',
        title: 'The dictator game: no rejection allowed',
        blocks: [
          { type: 'p', text: 'In the **dictator game** the recipient has no choice; the proposer’s split stands. Daniel Kahneman, Jack Knetsch and Richard Thaler used a related design in 1986, and in 1994 Robert Forsythe and colleagues simplified it into the form common today and compared it with the ultimatum game.' },
          { type: 'list', items: [
            'Dictators give **clearly less** than ultimatum proposers. The average is reported at roughly 20–30% of the pie, and many give nothing at all.',
            'Still, **not zero**: with no threat at all, a fair number of people share some.',
            'So the high offers in the ultimatum game mix **a taste for fairness** with **fear of rejection**. The difference between the two games is the part given strategically.',
          ] },
          { type: 'p', text: 'Culture matters a lot too. A team led by Joseph Henrich ran the same games in small-scale societies around the world and reported that offers varied widely with how a community lives (for example, how much it relies on market exchange or cooperative work). What counts as a "fair share" itself differs between societies.' },
        ],
      },
      {
        id: 'shows',
        title: 'Ultimatums in survival games',
        blocks: [
          { type: 'p', text: 'Survival games often contain a structure where one player decides the split and the others accept it or blow it up (this is about structure, not particular episodes).' },
          { type: 'list', items: [
            '**Splitting prizes or immunity.** If one player has the right to divide points or items and the others can veto, leaving everyone with nothing, it is an ultimatum game. Thinking "they will take the minimum" is dangerous: real people often reject insulting offers.',
            '**Splits in front of others.** When other players are watching, rejecting builds a reputation for not being a pushover. In repeated relationships a rejection can be a rational investment.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**As proposer, clear the other side’s rejection threshold.** Going by experiments, too small a share is risky, and the threshold is higher when the responder has reputation or pride at stake.',
            '**As responder, make your rejection threat believable in advance.** State "nothing below this" before the offer arrives and show reasons to stick to it (people watching, a next round), and offers rise. The principle is covered in [Promises, threats and credibility](/game-theory/commitment-threats).',
            '**Go after the right to propose.** Ultimatum proposers usually keep half or more. If there is a stage that decides who proposes, that stage is the real game.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Werner Güth, Rolf Schmittberger, Bernd Schwarze, "An Experimental Analysis of Ultimatum Bargaining", Journal of Economic Behavior and Organization 3(4), 1982' },
      { title: 'Daniel Kahneman, Jack L. Knetsch, Richard H. Thaler, "Fairness and the Assumptions of Economics", Journal of Business 59(4), 1986' },
      { title: 'Robert Forsythe, Joel L. Horowitz, N. E. Savin, Martin Sefton, "Fairness in Simple Bargaining Experiments", Games and Economic Behavior 6(3), 1994' },
      { title: 'Christoph Engel, "Dictator games: a meta study", Experimental Economics 14, 2011', url: 'https://www.cambridge.org/core/journals/experimental-economics/article/abs/dictator-games-a-meta-study/8597E66280017C3A83863C12A7F8F687' },
      { title: 'Joseph Henrich et al., "In Search of Homo Economicus: Behavioral Experiments in 15 Small-Scale Societies", American Economic Review 91(2), 2001' },
    ],
  },
};

export default article;
