import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'auctions',
  category: 'allocation',
  updated: '2026-11-26',
  games: ['blackWhite2'],
  related: ['colonel-blotto', 'chicken-game', 'dominant-strategy', 'signaling-cheap-talk'],
  ko: {
    meta: {
      title: '경매 이론 쉽게 — 차가 경매, 승자의 저주, 달러 경매 | PUZZLTHINK 게임 이론',
      description: '왜 두 번째로 높은 가격을 내는 경매에서는 솔직하게 써야 할까요? 경매 네 가지 방식, 비크리 경매의 우월 전략, 낙찰되고도 손해 보는 승자의 저주, 1달러를 1달러 넘게 사는 달러 경매, 흑과 백 II의 전원 지불 경매 구조까지.',
      keywords: ['경매 이론', '비크리 경매', '차가 경매', '승자의 저주', '달러 경매', '전원 지불 경매'],
    },
    title: '경매 이론: 승자의 저주와 차가 경매',
    lead: '낙찰은 이긴 걸까요, 진 걸까요? 경매의 규칙이 입찰자의 머릿속을 바꿔요.',
    intro: [
      '경매는 가장 오래된 게임 중 하나예요. 미술품, 중고 물건, 광고 자리, 전파 사용권까지 경매로 팔려요. 그리고 두뇌 서바이벌 게임에서도 점수나 칩으로 무언가를 사는 경매 라운드가 단골로 나와요.',
      '경매 이론은 **규칙이 바뀌면 사람들이 쓰는 금액이 어떻게 바뀌는지**를 다뤄요. 이 글에서는 네 가지 기본 방식과, 솔직하게 써도 되는 신기한 경매, 이기고도 손해 보는 승자의 저주, 그리고 모두가 돈을 내는 경매를 살펴봐요.',
    ],
    summary: '솔직하게 써도 되는 차가 경매, 이기고도 손해 보는 승자의 저주, 모두가 내는 전원 지불 경매.',
    sections: [
      {
        id: 'formats',
        title: '경매의 네 가지 기본 방식',
        blocks: [
          { type: 'table', head: ['방식', '진행', '낙찰자가 내는 돈'], rows: [
            ['영국식(오름 경매)', '가격을 점점 올리며 공개적으로 부르고, 마지막까지 남은 사람이 낙찰', '마지막 가격 (사실상 2등이 포기한 가격 바로 위)'],
            ['네덜란드식(내림 경매)', '높은 가격에서 점점 내리다가 처음 "사겠다"고 외친 사람이 낙찰', '그 순간의 가격'],
            ['최고가 밀봉 입찰', '각자 몰래 금액을 써 내고 가장 높은 사람이 낙찰', '자기가 쓴 금액'],
            ['차가 밀봉 입찰(비크리 경매)', '각자 몰래 써 내고 가장 높은 사람이 낙찰', '**두 번째로 높은 금액**'],
          ] },
          { type: 'p', text: '네덜란드식 경매와 최고가 밀봉 입찰은 사실상 같은 게임이에요. 두 경우 모두 "얼마에서 손을 들까(얼마를 쓸까)"를 다른 사람의 정보 없이 정하고, 자기가 정한 값을 내니까요.' },
        ],
      },
      {
        id: 'vickrey',
        title: '차가 경매: 솔직함이 우월 전략',
        blocks: [
          { type: 'p', text: '경제학자 윌리엄 비크리는 1961년 논문에서, 1등이 2등의 금액을 내는 밀봉 입찰에서는 **자기가 생각하는 물건의 가치를 그대로 쓰는 것이 우월 전략**이라는 것을 보였어요. 비크리는 이 연구 등으로 1996년 노벨 경제학상을 받았어요.' },
          { type: 'p', text: '내가 이 물건을 10만 원어치로 여긴다고 해 봐요. 다른 사람들 중 가장 높은 입찰을 B라고 할 때, 여러 경우를 따져 보면 이래요.' },
          { type: 'table', head: ['다른 사람의 최고 입찰 B', '10만 원을 쓰면', '12만 원을 쓰면(과장)', '8만 원을 쓰면(축소)'], rows: [
            ['B = 7만 원', '낙찰, 7만 원 냄 (+3만)', '낙찰, 7만 원 냄 (+3만)', '낙찰, 7만 원 냄 (+3만)'],
            ['B = 9만 원', '낙찰, 9만 원 냄 (+1만)', '낙찰, 9만 원 냄 (+1만)', '**탈락 (0)** — 1만 원 이득을 놓침'],
            ['B = 11만 원', '탈락 (0)', '**낙찰, 11만 원 냄 (−1만)**', '탈락 (0)'],
            ['B = 13만 원', '탈락 (0)', '탈락 (0)', '탈락 (0)'],
          ], caption: '괄호는 내 이득(가치 − 낸 돈). 진짜 가치를 쓰는 것이 어떤 경우에도 다른 선택보다 나쁘지 않고, 어떤 경우엔 더 좋아요.' },
          { type: 'p', text: '핵심은 **내가 쓴 금액이 내가 낼 돈을 정하지 않는다**는 거예요. 내 입찰은 "낙찰받을지 말지"만 정하고, 가격은 남이 정해요. 그러니 가치보다 높게 쓰면 손해 보는 낙찰이 생기고, 낮게 쓰면 이득 보는 낙찰을 놓칠 뿐이에요. 영국식 오름 경매에서 "내 가치에 도달할 때까지만 버틴다"가 최선인 것과 같은 원리예요.' },
          { type: 'h3', text: '최고가 입찰에서는 깎아서 써야 해요' },
          { type: 'p', text: '자기 금액을 그대로 내는 최고가 밀봉 입찰에서는 사정이 달라요. 가치만큼 쓰면 낙찰돼도 이득이 0이니, 조금 낮춰 써야 해요. 교과서적인 모형(입찰자 n명, 가치가 0과 1 사이에서 고르게 무작위)에서는 균형 입찰이 **가치 × (n − 1)/n**이에요. 두 명이면 가치의 절반, 열 명이면 90%를 써요. 경쟁자가 많을수록 덜 깎아요.' },
          { type: 'callout', tone: 'note', title: '수입 동등성', text: '놀랍게도 이런 이상적인 조건(입찰자가 위험에 중립적이고, 가치가 서로 독립적인 경우 등)에서는 네 가지 방식 모두 판매자의 기대 수입이 같다는 정리가 있어요. 비크리가 처음 보였고, 이후 로저 마이어슨 등이 일반화했어요. 현실에서는 그 조건이 깨지기 때문에 어떤 방식을 쓰느냐가 중요해져요.' },
        ],
      },
      {
        id: 'curse',
        title: '승자의 저주: 이긴 이유가 곧 손해의 이유',
        blocks: [
          { type: 'p', text: '이번에는 물건의 진짜 가치가 **모두에게 같은데 아무도 정확히 모르는** 경우를 생각해 봐요. 동전이 가득 든 유리병을 경매에 붙이면, 병 속 금액은 누구에게나 같지만 각자 눈대중으로만 짐작해요.' },
          { type: 'p', text: '각자의 짐작이 평균적으로는 맞더라도, **가장 높게 짐작한 사람이 낙찰**돼요. 그러니 낙찰자는 대체로 가치를 과대평가한 사람이고, 짐작한 대로 입찰했다면 손해를 보기 쉬워요. 이것이 **승자의 저주**예요.' },
          { type: 'list', items: [
            '1971년 석유 회사 아틀랜틱 리치필드의 엔지니어 에드 케이픈, 로버트 클랩, 윌리엄 캠벨은 해상 유전 채굴권 경매에서 낙찰받은 회사들의 수익이 기대보다 해마다 낮았다는 문제를 이 논리로 설명했어요. 승자의 저주라는 말이 여기서 퍼졌어요.',
            '1983년 맥스 베이저먼과 윌리엄 새뮤얼슨은 경영대학원 수업에서 동전 병 같은 물건을 경매에 붙이는 실험을 했어요. 낙찰 금액은 평균적으로 병의 실제 가치를 넘었고, 낙찰자들은 평균적으로 손해를 봤어요.',
          ] },
          { type: 'callout', tone: 'tip', title: '저주를 피하는 법', text: '"내가 이긴다면 그건 내가 가장 높게 짐작했기 때문일 것"이라고 미리 가정하고 입찰을 낮추세요. 경쟁자가 많을수록, 가치가 불확실할수록 더 많이 낮춰야 해요. 이기는 것 자체가 나쁜 소식일 수 있다는 걸 계산에 넣는 거예요.' },
        ],
      },
      {
        id: 'all-pay',
        title: '모두가 내는 경매: 달러 경매와 흑과 백 II',
        blocks: [
          { type: 'p', text: '1971년 게임 이론가 마틴 슈빅은 이상한 경매를 소개했어요. 1달러짜리 지폐를 경매하는데, 1등은 지폐를 받고 자기 입찰액을 내지만 **2등도 자기 입찰액을 내야 해요.** 처음엔 싸게 사려고 입찰이 시작되지만, 2등이 되면 그냥 돈만 내니 조금 더 올려 1등이 되려 해요. 그러다 보면 입찰이 1달러를 넘어서도 멈추지 않아요. 슈빅은 실제로 지폐가 1달러를 훌쩍 넘는 가격에 팔리는 일이 드물지 않다고 보고했어요.' },
          { type: 'p', text: '이렇게 이긴 사람뿐 아니라 진 사람도 입찰액을 내는 방식을 **전원 지불 경매(all-pay auction)**라고 해요. 선거 운동 비용, 특허 경쟁, 스포츠의 훈련 투자처럼 이기든 지든 비용을 치르는 경쟁이 이런 구조예요. 진 사람도 내니 "이미 낸 돈"이 아까워 계속 올리는 함정이 생겨요.' },
          { type: 'h3', text: '흑과 백 II의 라운드는 전원 지불 경매예요' },
          { type: 'p', text: '[흑과 백 II](/black-white-2)에서는 두 사람이 각자 99점 중 몇 점을 걸지 몰래 정하고, 더 많이 건 사람이 라운드를 이겨요. 그리고 **이긴 사람과 진 사람 모두 건 점수가 사라져요.** 한 라운드만 보면 두 사람짜리 전원 지불 경매인 거예요. 여기에 아홉 라운드 동안 같은 예산을 나눠 써야 하는 [블로토](/game-theory/colonel-blotto) 구조가 겹쳐 있어요.' },
          { type: 'list', items: [
            '**질 라운드에는 아무것도 걸지 마세요.** 전원 지불 경매에서 지는 입찰은 순수한 낭비예요. 질 거라면 0~1점이 가장 싸요.',
            '**이미 쓴 점수는 잊으세요.** 앞 라운드에서 많이 걸고 졌다고 다음 라운드에 만회하려 더 크게 걸 필요는 없어요. 중요한 건 남은 점수와 남은 라운드뿐이에요.',
            '**상대의 남은 예산을 추적하세요.** 남은 점수 게이지와 흑(한 자리)·백(두 자리) 표시를 보면 상대가 얼마나 썼는지 범위가 좁혀져요. 상대가 크게 걸 수 없는 라운드가 내가 싸게 이길 수 있는 라운드예요.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**경매 방식부터 확인하세요.** 낙찰자가 자기 금액을 내는지, 2등 금액을 내는지, 진 사람도 내는지에 따라 최선의 입찰이 완전히 달라요.',
            '**물건의 가치가 모두에게 같은지 생각하세요.** 다음 라운드의 정보, 공용 아이템처럼 가치가 공통이라면 승자의 저주를 의심하고 낮춰 쓰세요.',
            '**전원 지불 구조에서는 매몰 비용에 끌려가지 마세요.** "여기까지 왔는데"는 가장 비싼 생각이에요. 달러 경매에서 가장 좋은 수는 대개 처음부터 들어가지 않거나, 일찍 빠지는 거예요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'William Vickrey, "Counterspeculation, Auctions, and Competitive Sealed Tenders", Journal of Finance 16(1), 1961' },
      { title: 'E. C. Capen, R. V. Clapp, W. M. Campbell, "Competitive Bidding in High-Risk Situations", Journal of Petroleum Technology 23, 1971' },
      { title: 'Max H. Bazerman, William F. Samuelson, "I Won the Auction But Don’t Want the Prize", Journal of Conflict Resolution 27(4), 1983' },
      { title: 'Richard H. Thaler, "Anomalies: The Winner’s Curse", Journal of Economic Perspectives 2(1), 1988' },
      { title: 'Martin Shubik, "The Dollar Auction Game: A Paradox in Noncooperative Behavior and Escalation", Journal of Conflict Resolution 15(1), 1971' },
      { title: 'Roger B. Myerson, "Optimal Auction Design", Mathematics of Operations Research 6(1), 1981' },
      { title: 'The Nobel Prize in Economic Sciences 1996 (Mirrlees, Vickrey)', url: 'https://www.nobelprize.org/prizes/economic-sciences/1996/summary/' },
      { title: 'PUZZLTHINK 흑과 백 II 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'Auction theory made simple — second-price auctions, the winner’s curse and the dollar auction | PUZZLTHINK',
      description: 'Why should you bid honestly when the winner pays the second-highest price? The four basic formats, the dominant strategy in a Vickrey auction, the winner’s curse, the dollar auction where a dollar sells for more than a dollar, and the all-pay structure of Black & White II.',
      keywords: ['auction theory', 'Vickrey auction', 'second-price auction', "winner's curse", 'dollar auction', 'all-pay auction'],
    },
    title: 'Auction theory: the winner’s curse and second-price auctions',
    lead: 'Is winning an auction a win or a loss? The rules change what goes on in bidders’ heads.',
    intro: [
      'Auctions are among the oldest games. Art, second-hand goods, ad slots and radio spectrum are all sold by auction, and brain-survival games regularly include rounds where players buy something with points or chips.',
      'Auction theory studies **how the amounts people bid change when the rules change**. This article covers the four basic formats, a curious auction where honesty is the best policy, the winner’s curse, and auctions where everybody pays.',
    ],
    summary: 'The second-price auction where honesty pays, the winner’s curse, and the all-pay auction where everybody pays.',
    sections: [
      {
        id: 'formats',
        title: 'The four basic formats',
        blocks: [
          { type: 'table', head: ['Format', 'How it runs', 'What the winner pays'], rows: [
            ['English (ascending)', 'Prices are called out in public and rise; the last bidder standing wins', 'The final price (in effect just above where the runner-up quit)'],
            ['Dutch (descending)', 'The price starts high and falls; the first to shout "mine" wins', 'The price at that moment'],
            ['First-price sealed bid', 'Everyone secretly writes a bid; the highest wins', 'Their own bid'],
            ['Second-price sealed bid (Vickrey)', 'Everyone secretly writes a bid; the highest wins', '**The second-highest bid**'],
          ] },
          { type: 'p', text: 'The Dutch auction and the first-price sealed bid are effectively the same game: in both you decide, without information from others, at what price to raise your hand (what to write), and you pay that price.' },
        ],
      },
      {
        id: 'vickrey',
        title: 'Second-price auctions: honesty is dominant',
        blocks: [
          { type: 'p', text: 'In a 1961 paper the economist William Vickrey showed that in a sealed-bid auction where the winner pays the second-highest bid, **bidding exactly what the item is worth to you is a dominant strategy**. Vickrey shared the 1996 Nobel Memorial Prize in Economic Sciences, in part for this work.' },
          { type: 'p', text: 'Say the item is worth 100,000 won to you, and let B be the highest of the other bids. Go through the cases:' },
          { type: 'table', head: ['Highest other bid B', 'Bid 100,000', 'Bid 120,000 (overstate)', 'Bid 80,000 (understate)'], rows: [
            ['B = 70,000', 'Win, pay 70,000 (+30,000)', 'Win, pay 70,000 (+30,000)', 'Win, pay 70,000 (+30,000)'],
            ['B = 90,000', 'Win, pay 90,000 (+10,000)', 'Win, pay 90,000 (+10,000)', '**Lose (0)**, missing a 10,000 gain'],
            ['B = 110,000', 'Lose (0)', '**Win, pay 110,000 (−10,000)**', 'Lose (0)'],
            ['B = 130,000', 'Lose (0)', 'Lose (0)', 'Lose (0)'],
          ], caption: 'In brackets, your gain (value minus price). Bidding your true value is never worse than the alternatives and sometimes better.' },
          { type: 'p', text: 'The key is that **your bid does not set what you pay**. It only decides whether you win; someone else sets the price. Overbidding can only add losing wins, and underbidding can only throw away profitable ones. It is the same logic as an English auction, where staying in exactly until the price reaches your value is best.' },
          { type: 'h3', text: 'In first-price auctions, shade your bid' },
          { type: 'p', text: 'When you pay your own bid, things change: bidding your full value means zero gain even if you win, so you bid less. In the textbook model (n bidders, values uniformly random between 0 and 1) the equilibrium bid is **value × (n − 1)/n**: half your value with two bidders, 90% with ten. The more competitors, the less you shade.' },
          { type: 'callout', tone: 'note', title: 'Revenue equivalence', text: 'Remarkably, under idealised conditions (risk-neutral bidders, independent values and so on) all four formats give the seller the same expected revenue. Vickrey showed this first, and Roger Myerson and others generalised it. In practice those conditions fail, which is why the choice of format matters.' },
        ],
      },
      {
        id: 'curse',
        title: 'The winner’s curse: why you won is why you lost',
        blocks: [
          { type: 'p', text: 'Now suppose the item’s true value is **the same for everyone, but nobody knows it exactly**. Auction a jar full of coins: the amount inside is the same for all, but each bidder can only estimate it by eye.' },
          { type: 'p', text: 'Even if estimates are right on average, **the highest estimate wins**. So the winner is usually the one who overestimated, and bidding the estimate tends to lose money. That is the **winner’s curse**.' },
          { type: 'list', items: [
            'In 1971 Ed Capen, Robert Clapp and William Campbell, engineers at the oil company Atlantic Richfield, used this logic to explain why companies winning offshore oil-lease auctions kept earning less than expected, year after year. The term spread from their paper.',
            'In 1983 Max Bazerman and William Samuelson auctioned jars of coins and similar items in business-school classes. The winning bids exceeded the jars’ true value on average, and the winners lost money on average.',
          ] },
          { type: 'callout', tone: 'tip', title: 'How to avoid the curse', text: 'Assume in advance that "if I win, it will be because my estimate was the highest", and bid lower. The more bidders and the more uncertain the value, the more you should shade. You are building in the fact that winning itself can be bad news.' },
        ],
      },
      {
        id: 'all-pay',
        title: 'Auctions where everyone pays: the dollar auction and Black & White II',
        blocks: [
          { type: 'p', text: 'In 1971 the game theorist Martin Shubik described a strange auction. A one-dollar bill is auctioned; the highest bidder gets the bill and pays their bid, but **the second-highest bidder pays their bid too**. Bidding starts in the hope of a bargain, but the runner-up just loses money, so they raise to get on top, and the bidding does not stop even past one dollar. Shubik reported that the bill selling for well over a dollar was not unusual.' },
          { type: 'p', text: 'An auction where losers as well as the winner pay their bids is an **all-pay auction**. Campaign spending, patent races and training investment in sport all have this structure: you pay whether you win or lose. Because losers pay, the money already spent pulls people into raising further.' },
          { type: 'h3', text: 'Each round of Black & White II is an all-pay auction' },
          { type: 'p', text: 'In [Black & White II](/black-white-2) both players secretly decide how many of their 99 points to bid, and the higher bid wins the round. **Both the winner’s and the loser’s bids are spent.** Taken one round at a time, it is a two-player all-pay auction, layered on top of the [Blotto](/game-theory/colonel-blotto) structure of splitting one budget over nine rounds.' },
          { type: 'list', items: [
            '**Bid nothing on rounds you will lose.** In an all-pay auction a losing bid is pure waste. If you are going to lose, 0–1 points is cheapest.',
            '**Forget points already spent.** Having bid big and lost does not mean you should bid bigger next round to make up for it. Only the points and rounds left matter.',
            '**Track the opponent’s remaining budget.** The remaining-points gauge and the black (one digit) / white (two digits) display narrow down how much they have spent. Rounds where they cannot bid big are the ones you can win cheaply.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Check the format first.** Whether the winner pays their own bid, the runner-up’s bid, or everybody pays changes the best bid completely.',
            '**Ask whether the prize is worth the same to everyone.** For common-value prizes such as information about the next round or a shared item, suspect the winner’s curse and bid lower.',
            '**In all-pay structures, ignore sunk costs.** "We have come this far" is the most expensive thought there is. In the dollar auction the best move is usually not to enter, or to get out early.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'William Vickrey, "Counterspeculation, Auctions, and Competitive Sealed Tenders", Journal of Finance 16(1), 1961' },
      { title: 'E. C. Capen, R. V. Clapp, W. M. Campbell, "Competitive Bidding in High-Risk Situations", Journal of Petroleum Technology 23, 1971' },
      { title: 'Max H. Bazerman, William F. Samuelson, "I Won the Auction But Don’t Want the Prize", Journal of Conflict Resolution 27(4), 1983' },
      { title: 'Richard H. Thaler, "Anomalies: The Winner’s Curse", Journal of Economic Perspectives 2(1), 1988' },
      { title: 'Martin Shubik, "The Dollar Auction Game: A Paradox in Noncooperative Behavior and Escalation", Journal of Conflict Resolution 15(1), 1971' },
      { title: 'Roger B. Myerson, "Optimal Auction Design", Mathematics of Operations Research 6(1), 1981' },
      { title: 'The Nobel Prize in Economic Sciences 1996 (Mirrlees, Vickrey)', url: 'https://www.nobelprize.org/prizes/economic-sciences/1996/summary/' },
      { title: 'PUZZLTHINK Black & White II rules (shown in the game)' },
    ],
  },
};

export default article;
