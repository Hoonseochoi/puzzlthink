import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'signaling-cheap-talk',
  category: 'information',
  updated: '2026-11-26',
  games: ['indianPoker', 'twoSidedPoker', 'piggyBank'],
  related: ['bluffing', 'commitment-threats', 'stag-hunt', 'auctions'],
  ko: {
    meta: {
      title: '신호, 값싼 말, 정보의 비대칭 — 레몬 시장부터 스펜스의 신호 이론까지 | PUZZLTHINK 게임 이론',
      description: '상대만 아는 정보가 있을 때 시장과 게임은 어떻게 될까요? 중고차 레몬 시장이 무너지는 계산, 비용이 드는 신호가 믿을 만한 이유(스펜스), 공짜 말이 통하는 조건(크로퍼드·소벨), 그리고 인디언 포커·양면포커에서의 신호.',
      keywords: ['정보의 비대칭', '레몬 시장', '신호 이론', '값싼 말', '역선택', '스펜스 신호'],
    },
    title: '신호, 값싼 말, 정보의 비대칭',
    lead: '모르는 쪽은 의심하고, 아는 쪽은 증명해야 해요. 그 증명에는 값이 들어요.',
    intro: [
      '중고차를 살 때 차 상태는 파는 사람이 훨씬 잘 알아요. 면접에서 내 능력은 내가 회사보다 잘 알아요. 포커에서 내 패는 나만 알아요. 이렇게 한쪽만 아는 정보가 있는 상황을 **정보의 비대칭**이라고 해요.',
      '이 글에서는 정보의 비대칭이 어떻게 시장을 무너뜨릴 수 있는지, 정보를 가진 쪽이 어떻게 그걸 믿게 전달하는지, 그리고 아무 비용도 없는 말이 언제 의미를 갖는지를 차례로 살펴봐요.',
    ],
    summary: '상대만 아는 정보가 있을 때: 무너지는 레몬 시장, 비용이 드는 신호, 그리고 공짜 말이 통하는 조건.',
    sections: [
      {
        id: 'lemons',
        title: '레몬 시장: 좋은 차가 사라지는 계산',
        blocks: [
          { type: 'p', text: '경제학자 조지 애컬로프는 1970년 논문 「레몬 시장」에서 정보의 비대칭이 시장을 무너뜨릴 수 있다는 것을 보였어요. 미국에서 "레몬"은 겉보기와 달리 결함이 있는 중고차를 가리키는 말이에요. 숫자로 따라가 볼게요.' },
          { type: 'table', head: ['차의 종류', '비율', '파는 사람이 생각하는 가치', '사는 사람이 생각하는 가치'], rows: [
            ['좋은 차', '절반', '800만 원', '1,000만 원'],
            ['레몬', '절반', '300만 원', '400만 원'],
          ], caption: '어느 차든 사는 사람이 더 높게 평가하니, 정보만 있다면 모든 차가 거래되는 게 서로 이득이에요.' },
          { type: 'list', ordered: true, items: [
            '사는 사람은 어떤 차가 좋은 차인지 몰라요. 평균적으로 따지면 (1,000 + 400) / 2 = **700만 원**까지만 낼 수 있어요.',
            '그런데 좋은 차 주인은 800만 원 아래로는 팔지 않아요. 700만 원 시장에는 **좋은 차가 나오지 않아요.**',
            '그걸 아는 사는 사람은 시장에 남은 차가 레몬뿐이라고 판단하고, 400만 원 넘게 내지 않아요.',
            '결국 레몬만 300~400만 원 사이에서 거래되고, **좋은 차 거래는 사라져요.** 좋은 차는 사는 사람에게 1,000만 원의 가치가 있는데도요.',
          ] },
          { type: 'p', text: '이렇게 정보가 부족한 쪽이 평균을 기준으로 값을 매기면 좋은 쪽이 빠져나가고, 나쁜 쪽만 남는 현상을 **역선택**이라고 해요. 보험, 대출, 채용에서도 같은 문제가 생겨요. 애컬로프는 이 연구로 마이클 스펜스, 조지프 스티글리츠와 함께 2001년 노벨 경제학상을 받았어요.' },
        ],
      },
      {
        id: 'signaling',
        title: '비용이 드는 신호: 스펜스의 교육 모형',
        blocks: [
          { type: 'p', text: '좋은 차 주인이 "제 차는 좋아요"라고 말하는 것만으로는 소용이 없어요. 레몬 주인도 똑같이 말할 수 있으니까요. 믿을 만한 신호가 되려면, **좋은 쪽에게는 싸고 나쁜 쪽에게는 비싼** 행동이어야 해요. 품질 보증서가 그런 예예요. 좋은 차 주인에게 보증은 거의 공짜지만, 레몬 주인에게는 큰 비용이에요.' },
          { type: 'p', text: '마이클 스펜스는 1973년 논문 「취업 시장의 신호」에서 이 원리를 교육에 적용했어요. 간단한 숫자로 보면 이래요.' },
          { type: 'list', items: [
            '능력이 높은 사람은 회사에 2만큼, 낮은 사람은 1만큼 기여해요. 회사는 누가 어느 쪽인지 몰라요.',
            '회사는 "교육을 e* 이상 받은 사람에게는 2, 아니면 1을 준다"는 규칙을 내걸어요.',
            '교육 한 단위의 비용은 능력이 낮은 사람에게 1, 높은 사람에게 0.5라고 해요(공부가 더 쉬우니까요).',
          ] },
          { type: 'p', text: '능력이 낮은 사람이 흉내 내려면 e*만큼 교육받아 2를 받아야 하는데, 그러면 2 − e*를 얻어요. 흉내 내지 않으면 1이에요. 그러니 **e*가 1보다 크면** 낮은 사람은 흉내 내지 않아요. 능력이 높은 사람은 교육받으면 2 − 0.5e*, 안 받으면 1이니 **e*가 2 이하**면 교육받아요. 따라서 e*가 1과 2 사이라면, 높은 사람만 교육받고 회사는 교육을 보고 정확히 구별해요. 이런 상태를 **분리 균형**이라고 해요.' },
          { type: 'callout', tone: 'note', title: '교육이 쓸모없어도 신호가 돼요', text: '이 모형에서 교육은 생산성을 전혀 올리지 않아요. 그래도 신호로서 가치가 있어요. 신호가 통하는 이유는 내용이 아니라 **비용의 차이**예요. 물론 이 모형이 "현실의 교육은 쓸모없다"는 뜻은 아니에요. 비용이 드는 행동이 왜 정보를 전달할 수 있는지를 보여 주는 단순화예요.' },
        ],
      },
      {
        id: 'cheap-talk',
        title: '값싼 말: 공짜 말은 언제 통할까',
        blocks: [
          { type: 'p', text: '그럼 비용이 전혀 없는 말은 늘 무의미할까요? 빈센트 크로퍼드와 조엘 소벨은 1982년 논문에서 이런 **값싼 말(cheap talk)**을 분석했어요. 결론을 아주 간단히 말하면, **말하는 사람과 듣는 사람의 이해관계가 가까울수록 말이 더 많은 정보를 전할 수 있어요.** 이해관계가 크게 다르면 말은 거의 아무 정보도 전하지 못해요.' },
          { type: 'list', items: [
            '**이해관계가 같을 때.** 「[사슴 사냥](/game-theory/stag-hunt)」처럼 둘 다 같은 결과를 원한다면 "나 사슴 갈게"는 믿을 수 있어요. 거짓말할 이유가 없으니까요.',
            '**이해관계가 조금 다를 때.** 대략적인 정보는 전해지지만 세부는 흐려져요. "꽤 좋아" 정도는 믿을 수 있어도 "정확히 몇 점"은 믿기 어려워요.',
            '**이해관계가 정반대일 때.** 포커에서 "나 패 좋아"는 아무 의미가 없어요. 좋든 나쁘든 그렇게 말할 테니까요. 이런 게임에서 정보를 주는 건 칩을 거는 것처럼 **비용이 드는 행동**뿐이에요.',
          ] },
        ],
      },
      {
        id: 'shows',
        title: '서바이벌 게임에서의 신호',
        blocks: [
          { type: 'p', text: '두뇌 서바이벌 게임에서는 말이 넘쳐나요. 이론의 기준으로 보면 정리가 쉬워져요(특정 회차가 아니라 구조 이야기예요).' },
          { type: 'list', items: [
            '**"나는 이미 답을 알아"라는 말.** 같은 팀이라면 유용한 정보일 수 있지만, 경쟁자에게 하는 말이라면 상대를 흔들려는 값싼 말일 가능성이 커요.',
            '**자기 패를 일부 공개하기.** 카드나 정보를 실제로 보여 주는 건 비용이 드는 행동이라 말보다 신뢰를 얻어요. 다만 보여 준 부분만 골라 보여 줬을 가능성도 생각해야 해요.',
            '**포기한 것 보여 주기.** 자기 아이템이나 점수를 먼저 내려놓는 행동은 "나는 협력할 유형"이라는 신호가 돼요. 스펜스 모형의 교육처럼, 진짜 협력할 사람에게 더 싼 행동이기 때문이에요.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**[인디언 포커](/indian-poker)에서 베팅은 비싼 신호예요.** 칩이 걸린 행동이라 말보다 무게가 있지만, 블러핑이 섞여 있다는 걸 잊지 마세요. 상대 베팅이 내 카드에 대해 무엇을 말해 주는지(상대는 내 카드를 보고 있어요)를 따져 보세요.',
            '**[양면포커](/two-sided-poker)의 면 선택은 공개된 신호예요.** 어느 면으로 승부할지가 모두에게 보이니, 그 선택 자체가 정보가 돼요. 상대의 앞면 숫자와 면 선택을 같이 보면 뒷면이 어느 쪽일지 추측할 수 있어요(앞뒤 숫자는 홀짝이 서로 달라요).',
            '**[돼지 저금통](/piggy-bank)의 선언은 규칙이 강제하는 진실이에요.** 동전을 넣는 사람은 넣은 개수를 사실대로 말해야 하니, 그 정보는 믿을 수 있어요. 문제는 그걸 기억하는 거예요. 정보가 공짜로 주어질 때는 기억력이 승부를 가르고, 의심은 그 기억의 차이를 노리는 행동이에요.',
            '**상대의 말을 들으면 "이 사람은 진실이든 거짓이든 이렇게 말할까?"를 물어보세요.** 그렇다면 그 말에는 정보가 없어요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'George A. Akerlof, "The Market for Lemons: Quality Uncertainty and the Market Mechanism", Quarterly Journal of Economics 84(3), 1970' },
      { title: 'Michael Spence, "Job Market Signaling", Quarterly Journal of Economics 87(3), 1973' },
      { title: 'Vincent P. Crawford, Joel Sobel, "Strategic Information Transmission", Econometrica 50(6), 1982' },
      { title: 'Joel Sobel, "Signaling Games" (encyclopedia entry)', url: 'https://econweb.ucsd.edu/~jsobel/Paris_Lectures/20070527_Signal_encyc_Sobel.pdf' },
      { title: 'The Nobel Prize in Economic Sciences 2001 (Akerlof, Spence, Stiglitz), popular information', url: 'https://www.nobelprize.org/prizes/economic-sciences/2001/popular-information/' },
      { title: 'PUZZLTHINK 인디언 포커·양면포커·돼지 저금통 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'Signals, cheap talk and asymmetric information — from the market for lemons to Spence’s signalling | PUZZLTHINK',
      description: 'What happens to markets and games when only one side knows something? How the market for lemons collapses, why costly signals are believable (Spence), when free talk works (Crawford and Sobel), and signals in Indian Poker and Two-Sided Poker.',
      keywords: ['asymmetric information', 'market for lemons', 'signaling theory', 'cheap talk', 'adverse selection', 'Spence signaling'],
    },
    title: 'Signals, cheap talk and asymmetric information',
    lead: 'The side that does not know suspects; the side that knows must prove it, and proof costs something.',
    intro: [
      'When you buy a used car, the seller knows its condition far better than you. In a job interview you know your abilities better than the company does. In poker only you know your hand. Situations where only one side knows something are called **asymmetric information**.',
      'This article looks at how asymmetric information can bring a market down, how the informed side can pass its information on believably, and when talk that costs nothing still means something.',
    ],
    summary: 'When only one side knows: the collapsing market for lemons, costly signals, and when free talk works.',
    sections: [
      {
        id: 'lemons',
        title: 'The market for lemons: how good cars disappear',
        blocks: [
          { type: 'p', text: 'In his 1970 paper "The Market for Lemons" the economist George Akerlof showed that asymmetric information can bring a market down. In American slang a "lemon" is a used car that looks fine but is defective. Follow the numbers.' },
          { type: 'table', head: ['Car', 'Share', 'Worth to the seller', 'Worth to the buyer'], rows: [
            ['Good car', 'Half', '8 million won', '10 million won'],
            ['Lemon', 'Half', '3 million won', '4 million won'],
          ], caption: 'Buyers value every car more than sellers do, so with full information trading every car would benefit both sides.' },
          { type: 'list', ordered: true, items: [
            'Buyers cannot tell which cars are good. On average a car is worth (10 + 4) / 2 = **7 million** to them, so that is the most they will pay.',
            'But owners of good cars will not sell below 8 million, so **no good cars come onto a 7-million market**.',
            'Buyers who realise this conclude that only lemons are on offer and will not pay more than 4 million.',
            'In the end only lemons trade, at 3–4 million, and **trade in good cars disappears**, even though a good car is worth 10 million to a buyer.',
          ] },
          { type: 'p', text: 'When the less informed side prices by the average, the better items leave and only the worse remain: **adverse selection**. Insurance, lending and hiring face the same problem. Akerlof shared the 2001 Nobel Memorial Prize in Economic Sciences with Michael Spence and Joseph Stiglitz for work on markets with asymmetric information.' },
        ],
      },
      {
        id: 'signaling',
        title: 'Costly signals: Spence’s education model',
        blocks: [
          { type: 'p', text: 'A good-car owner saying "my car is good" achieves nothing; a lemon owner can say the same. To be a believable signal, an action must be **cheap for the good type and expensive for the bad type**. A warranty is an example: nearly free for the owner of a good car, very costly for the owner of a lemon.' },
          { type: 'p', text: 'In his 1973 paper "Job Market Signaling", Michael Spence applied the idea to education. In simple numbers:' },
          { type: 'list', items: [
            'A high-ability worker produces 2 for the firm, a low-ability worker 1. The firm cannot tell them apart.',
            'The firm announces: "workers with at least e* units of education get 2, others get 1".',
            'Each unit of education costs a low-ability worker 1 and a high-ability worker 0.5 (study comes easier to them).',
          ] },
          { type: 'p', text: 'To imitate, a low-ability worker would get e* units of education and earn 2, netting 2 − e*; not imitating gives 1. So **if e* exceeds 1**, low types do not imitate. A high-ability worker nets 2 − 0.5e* with education and 1 without, so gets educated **if e* is at most 2**. With e* between 1 and 2, only high types get educated and the firm tells them apart exactly. That is a **separating equilibrium**.' },
          { type: 'callout', tone: 'note', title: 'A signal even if education is useless', text: 'In this model education adds nothing to productivity, yet it is valuable as a signal. What makes the signal work is not its content but **the difference in cost**. The model does not claim that real education is useless; it is a simplification that shows why costly actions can carry information.' },
        ],
      },
      {
        id: 'cheap-talk',
        title: 'Cheap talk: when does free talk work?',
        blocks: [
          { type: 'p', text: 'Is talk that costs nothing always meaningless? In a 1982 paper Vincent Crawford and Joel Sobel analysed such **cheap talk**. Put very simply: **the closer the interests of speaker and listener, the more information talk can carry**; when interests differ a lot, talk carries almost none.' },
          { type: 'list', items: [
            '**Same interests.** If both want the same outcome, as in [the stag hunt](/game-theory/stag-hunt), "I’m going for the stag" is believable: there is no reason to lie.',
            '**Somewhat different interests.** Rough information gets through but details blur. "Pretty good" can be believed; "exactly this many points" is harder to.',
            '**Opposite interests.** In poker, "I have a good hand" means nothing; you would say it either way. In such games only **costly actions**, such as betting chips, convey information.',
          ] },
        ],
      },
      {
        id: 'shows',
        title: 'Signals in survival games',
        blocks: [
          { type: 'p', text: 'Brain-survival games overflow with talk. The theory sorts it out (this is about structure, not particular episodes).' },
          { type: 'list', items: [
            '**"I already know the answer."** Among teammates it may be useful information; said to a rival it is likely cheap talk meant to unsettle them.',
            '**Revealing part of your hand.** Actually showing cards or information is costly, so it earns more trust than words. But consider that only the parts that suit the shower may have been shown.',
            '**Showing what you gave up.** Putting your own item or points down first signals "I am the cooperating type". Like education in Spence’s model, it is cheaper for someone who genuinely means to cooperate.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**In [Indian Poker](/indian-poker), a bet is a costly signal.** It carries more weight than words because chips are at stake, but remember bluffs are mixed in. Ask what the opponent’s bet says about your own card, which they can see.',
            '**In [Two-Sided Poker](/two-sided-poker), face choice is a public signal.** Everyone sees which face a player chooses, so the choice itself is information. Combine the opponent’s front number with their face choice to guess their back (front and back always differ in parity).',
            '**In [Piggy Bank](/piggy-bank), announcements are truths enforced by the rules.** Whoever puts coins in must state truthfully how many, so that information is reliable; the hard part is remembering it. When information is free, memory decides the game, and a doubt is a bet on the difference in memories.',
            '**When someone talks, ask: "would they say this whether or not it were true?"** If so, the words carry no information.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'George A. Akerlof, "The Market for Lemons: Quality Uncertainty and the Market Mechanism", Quarterly Journal of Economics 84(3), 1970' },
      { title: 'Michael Spence, "Job Market Signaling", Quarterly Journal of Economics 87(3), 1973' },
      { title: 'Vincent P. Crawford, Joel Sobel, "Strategic Information Transmission", Econometrica 50(6), 1982' },
      { title: 'Joel Sobel, "Signaling Games" (encyclopedia entry)', url: 'https://econweb.ucsd.edu/~jsobel/Paris_Lectures/20070527_Signal_encyc_Sobel.pdf' },
      { title: 'The Nobel Prize in Economic Sciences 2001 (Akerlof, Spence, Stiglitz), popular information', url: 'https://www.nobelprize.org/prizes/economic-sciences/2001/popular-information/' },
      { title: 'PUZZLTHINK Indian Poker, Two-Sided Poker and Piggy Bank rules (shown in each game)' },
    ],
  },
};

export default article;
