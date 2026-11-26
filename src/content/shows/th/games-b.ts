// 더 타임 호텔, days 4–8: 무제한 보석 경매, 마약왕 게임, 사칙 연산 로또, 온 앤 오프, 파이널 카르마 나인·블라인드 수식.
import { thGame } from './shared';

export const jewelAuction = thGame('unlimited-jewel-auction', 'kairos', { ko: '4일차 패자부활전, 6일차', en: 'Day 4 revival, day 6' }, ['4', '6'], ['piggyBank', 'twoSidedPoker', 'hitStay'], {
  meta: {
    title: '무제한 보석 경매 규칙 — 더 타임 호텔 패자부활전·6일차 카이로스 게임',
    description: '더 타임 호텔 4일차 패자부활전과 6일차 카이로스 게임 무제한 보석 경매의 규칙을 정리했어요. 루비 1점부터 다이아몬드 4점, 한도 없는 비공개 입찰, 최저 입찰 −1점, 4라운드마다 공개되는 누적 낙찰액, 가장 많이 쓴 사람은 우승할 수 없는 규칙, 더블 포인트와 보석 정보 경매까지.',
    keywords: ['무제한 보석 경매', '더 타임 호텔 보석 경매', '더타임호텔 경매', 'QE 보드게임', '더타임호텔'],
  },
  title: '무제한 보석 경매 — 더 타임 호텔 패자부활전·6일차',
  name: '무제한 보석 경매',
  lead: '얼마든지 써서 보석을 낙찰받을 수 있어요. 단, 가장 많이 쓴 사람은 점수가 1등이어도 우승하지 못해요.',
  summary: '한도 없는 비공개 입찰로 보석 점수를 모으되, 최고 지출자가 되지 않아야 하는 경매. 패자부활전과 6일차에 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 4일차는 1–4일차 체크아웃된 사람들의 패자부활전, 6일차는 남은 투숙객 전원.',
      '**보석**: 루비 1점, 사파이어 2점, 에메랄드 3점, 다이아몬드 4점. 보석과 감점 표시(돌멩이)는 주고받거나 버릴 수 없어요.',
      '**입찰 금액**: 가상의 금액이라 **한도가 없어요**.',
      '**비공개 정보**: 전체 라운드 수와 보석별 개수.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '출품', body: '라운드마다 보석 하나가 경매에 나와요.' },
      { title: '입찰', body: '5분 안에 각자 원하는 금액을 경매 용지에 적어 비공개로 내요.' },
      { title: '낙찰', body: '가장 높은 금액을 쓴 사람이 보석을 받아요. 낙찰자는 공개되지만 금액은 공개되지 않아요.' },
      { title: '최저 입찰', body: '그 라운드에 **가장 적은 금액**을 쓴 사람은 1점이 깎여요.' },
      { title: '중간 공개', body: '4라운드마다 사람별 누적 낙찰 금액이 공지돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '모든 경매가 끝나면 **보석 점수가 가장 높은 사람**이 우승해요. 동점이면 누적 낙찰 금액이 적은 쪽이 앞서요.',
      '단, 점수 1위가 **누적 낙찰 금액도 1위**라면 우승하지 못하고, 다음 점수의 사람이 우승해요.',
      '**4일차 패자부활전**: 우승자 한 명이 호텔에 다시 체크인하고, 호텔에 있는 사람 하나를 골라 그 사람이 가진 만큼의 시간을 받아요.',
      '**6일차**: 누적 낙찰 금액 1위와 점수 최하위가 체크아웃 후보가 되어 체크아웃 게임(사칙 연산 로또)에 나가요. 우승은 이 두 사람을 뺀 사람 중에서 정하고, 보상은 1위 12시간, 2위 8, 3위 4.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**스페셜 라운드**에는 보석 대신 정보가 경매에 나와요. 4일차에는 앞으로 나올 보석의 종류와 개수를 알려 주는 아이템이었고, 이 낙찰가도 누적 금액에 들어가요.',
      '6일차의 정보 경매는 **실제 남은 시간**으로 입찰하고 최저 입찰 감점이 없어요. 낙찰자는 보석별 남은 개수를 알게 돼요.',
      '6일차 아이템 **더블 포인트**(1시간): 그 라운드에 낙찰받으면 보석 점수가 2배가 돼요. 겹쳐 쓸 수 없고, 낙찰 여부와 상관없이 라운드가 끝나면 사라져요. 낙찰자가 썼다면 공지돼요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '입찰 한도가 없으면 금액의 크기 자체는 아무 의미가 없어요. 중요한 건 **남들보다 얼마나 더, 혹은 덜 썼느냐**뿐이에요. 이 게임은 보드게임 QE의 구조를 그대로 따라요.' },
    { type: 'cards', items: [
      { title: '1등이 되는 법은 2등 지출', body: '점수를 많이 얻으려면 비싸게 사야 하지만, 지출 1위가 되면 모든 게 무너져요. 그래서 이상적인 자리는 "점수 1위, 지출은 1위가 아닌 사람"이에요. 마지막 판에 누군가 상상할 수 없는 금액을 적어 지출 1위를 떠안기면, 점수 1위가 바뀌기도 해요.' },
      { title: '0을 쓸 수 없는 이유', body: '최저 입찰자는 1점이 깎이므로, 관심 없는 보석에도 아주 적은 금액은 쓸 수 없어요. 남들이 얼마를 쓸지 모르니 "최저만 피하는" 금액을 고르는 것도 눈치 싸움이에요.' },
      { title: '중간 공개와 정보 경매', body: '4라운드마다 누적 금액이 공개되어, 지금 누가 지출 1위인지가 드러나요. 남은 라운드와 보석 수를 모르면 언제 크게 쓸지 정할 수 없으니, 보석 정보 아이템은 점수보다 값진 정보예요. 6일차에는 그 정보를 실제 시간으로 사야 해서 대가가 더 무거웠어요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략은 없어요.** 금액이 상대적이라 어떤 숫자도 안전하지 않고, 결국 다른 사람들이 얼마나 공격적으로 쓰는지 읽는 게임이에요.' },
  ],
  similar: [
    { name: 'QE', players: '3–5명', alike: '한도 없는 금액으로 입찰하고, 가장 많이 쓴 사람은 우승할 수 없다는 핵심 규칙이 같아요. 방송도 이 게임을 모티브로 했다고 알려져 있어요.', differs: 'QE는 경매 방식(공개·비공개 혼합)과 나라·산업 세트 점수가 있고, 최저 입찰 감점은 없어요.' },
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '돈을 써서 점수를 모으되, 극단적인 지출이 벌을 받는 경매예요.', differs: '하이 소사이어티는 돈이 가장 적게 남은 사람이 탈락하고, 입찰은 공개된 지폐 카드로 해요.' },
  ],
}, {
  meta: {
    title: 'Unlimited Jewel Auction rules — The Time Hotel revival and day 6 Kairos game',
    description: 'The rules of the Unlimited Jewel Auction (무제한 보석 경매) from The Time Hotel: rubies worth 1 up to diamonds worth 4, sealed bids with no limit, −1 for the lowest bid, totals announced every four rounds, why the biggest spender cannot win, double points and the information auction.',
    keywords: ['Unlimited Jewel Auction', 'The Time Hotel auction', 'QE board game', '더 타임 호텔 보석 경매'],
  },
  title: 'Unlimited Jewel Auction — The Time Hotel revival and day 6',
  name: 'Unlimited Jewel Auction (무제한 보석 경매)',
  lead: 'Bid any amount you like for jewels — but the biggest spender cannot win, even with the most points.',
  summary: 'Collect jewel points with unlimited sealed bids without becoming the top spender; played as the revival match and on day 6.',
  setup: [
    { type: 'list', items: [
      '**Players**: on day 4, those checked out on days 1–4 (a revival match); on day 6, every remaining guest.',
      '**Jewels**: ruby 1 point, sapphire 2, emerald 3, diamond 4. Jewels and penalty stones cannot be traded or discarded.',
      '**Bids**: imaginary money, **with no limit**.',
      '**Hidden**: the number of rounds and of each jewel.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Lot', body: 'Each round one jewel goes up.' },
      { title: 'Bid', body: 'Within 5 minutes everyone writes a sealed bid.' },
      { title: 'Win', body: 'The highest bid takes the jewel; the winner is announced, the amount is not.' },
      { title: 'Lowest bid', body: 'The **lowest** bidder that round loses 1 point.' },
      { title: 'Totals', body: 'Every four rounds each player’s total spending is announced.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After the last lot, **the most jewel points** wins; ties go to whoever spent less.',
      'But if the top scorer is also **the top spender**, they cannot win and the next scorer does.',
      '**Day 4 revival**: the single winner checks back in and takes as much time as one chosen guest in the hotel holds.',
      '**Day 6**: the top spender and the lowest scorer become checkout candidates for the checkout game (Arithmetic Lotto); the winner comes from everyone else. Rewards: 12 h, 8, 4.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A **special round** auctions information instead of a jewel. On day 4 it revealed the kinds and numbers of jewels still to come, and its price counted toward your total.',
      'On day 6 the information auction used **real remaining time**, with no lowest-bid penalty; the winner learned how many of each jewel were left.',
      'Day 6 item **double points** (1 hour): if you win that round, the jewel scores double. Not stackable; it expires at round end either way, and is announced if the winner used it.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'With no limit, the size of a bid means nothing in itself; only **how much more or less than others** you spend matters. The structure is the board game QE’s.' },
    { type: 'cards', items: [
      { title: 'Win by spending second-most', body: 'Points cost money, but top spender ruins everything, so the ideal spot is top score without top spend. A wild bid in the last round can dump top spender on someone else and change the winner.' },
      { title: 'Why you cannot bid zero', body: 'The lowest bid costs a point, so even a jewel you do not want needs a bid that is not the lowest, another guess about everyone else.' },
      { title: 'Totals and the information lot', body: 'Totals every four rounds reveal who leads in spending. Without knowing how many rounds and jewels remain you cannot time a big bid, so the information lot can be worth more than a jewel; on day 6 it cost real time.' },
    ], columns: 1 },
    { type: 'p', text: '**There is no dominant strategy.** Because amounts are relative, no number is safe; it is a game of reading how aggressively others spend.' },
  ],
  similar: [
    { name: 'QE', players: '3–5', alike: 'Unlimited bids and the rule that the biggest spender cannot win; the show is reported to have drawn on it.', differs: 'QE mixes open and sealed bidding and scores country and industry sets; there is no lowest-bid penalty.' },
    { name: 'High Society', players: '3–5', alike: 'Spend to collect points while extreme spending is punished.', differs: 'Whoever has the least money left is eliminated, and bids are open money cards.' },
  ],
});

export const drugLord = thGame('drug-lord', 'kairos', { ko: '5일차', en: 'Day 5' }, ['5'], ['russianRoulette', 'indianPoker', 'hiddenWord'], {
  meta: {
    title: '마약왕 게임 규칙 — 더 타임 호텔 5일차 카이로스 게임, 마약상과 경찰의 정체 숨기기',
    description: '더 타임 호텔 5일차 카이로스 게임 마약왕 게임의 규칙을 정리했어요. 마약상 팀 4명(마약왕·오른팔·조직원)과 경찰 팀 3명(특수요원·저격수·정보원), 역할별 정보, 거래 팀장과 거수 투표, 라운드별 거래 인원, 성공·실패 투표, 저격수의 마지막 지목까지.',
    keywords: ['마약왕 게임', '더 타임 호텔 마약왕', '더타임호텔 아발론', '더 타임 호텔 5일차', '더타임호텔'],
  },
  title: '마약왕 게임 — 더 타임 호텔 5일차 카이로스 게임',
  name: '마약왕 게임',
  lead: '마약상 팀은 거래를 세 번 성공시키고, 숨어든 경찰은 거래를 세 번 망쳐야 해요. 마약상이 이기더라도 경찰 저격수가 마약왕을 찾아내면 뒤집혀요.',
  summary: '정체를 숨긴 7명이 거래 멤버를 뽑고 성공·실패를 투표하는 팀전. 레지스탕스 아발론의 구조를 따라요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 7명. **마약상 팀** 4명(마약왕, 오른팔, 조직원 2명)과 **경찰 팀** 3명(특수요원, 저격수, 정보원).',
      '**마약왕**: 특수요원과 저격수가 누구인지 알아요.',
      '**오른팔**: 마약왕과 특수요원, 두 사람이 누구인지 알지만 어느 쪽이 마약왕인지는 몰라요.',
      '**특수요원·저격수**: 서로를 알고, 라운드가 끝날 때마다 둘만의 대화 시간이 있어요.',
      '**조직원 2명·정보원**: 특별한 정보가 없어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '거래 팀장', body: '좌석 순서대로 시계 방향으로 팀장이 돌아가요. 첫 팀장은 무작위예요. 팀장은 투표 전에 두 사람까지 1:1로 면담할 수 있어요.' },
      { title: '거래원 투표', body: '팀장이 거래에 나갈 사람을 고르면 전원이 거수로 투표해요. 과반이 찬성하면 확정, 반대하면 해산되고 다음 사람이 팀장이 돼요.' },
      { title: '거래 투표', body: '거래원은 성공·실패를 비공개로 투표해요. **경찰은 자유롭게**, **마약상은 성공만** 낼 수 있어요. 결과만 공지돼요.' },
    ] },
    { type: 'table', head: ['라운드', '거래 인원', '성공 조건'], rows: [
      ['1', '2명', '전원 성공'],
      ['2', '3명', '전원 성공'],
      ['3', '3명', '전원 성공'],
      ['4', '4명', '3명 이상 성공'],
      ['5', '4명', '정리된 표에서 확인'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '거래가 **3번 실패**하면 경찰 팀이 이겨요.',
      '거래가 **3번 성공**하면 마약상 팀이 이기는데, 그 전에 **저격수가 마약왕을 지목**할 기회가 있어요. 맞히면 경찰 팀의 역전승이에요.',
      '이긴 팀 전원이 체크아웃 패스권을 받고, 팀이 자유롭게 나눌 24시간을 받아요.',
      '진 팀에서 시간이 가장 적은 사람이 팀원 한 명을 지목해 체크아웃 게임(금·은·동 게임)을 치러요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '팀장의 면담과 경찰의 능력 사용 시간 말고는 게임 중 자리를 떠날 수 없어요.',
      '5라운드의 성공 조건은 원 자료의 표가 칸이 합쳐진 모양이라 정확히 옮기지 못했어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임은 7인 **레지스탕스 아발론**과 역할이 하나씩 맞아떨어져요. 마약상 = 선, 경찰 = 악, 마약왕 = 멀린, 오른팔 = 퍼시발, 특수요원 = 모르가나, 저격수 = 암살자, 정보원 = 오베론이에요. 라운드별 인원(2·3·3·4·4)과 4라운드의 실패 허용까지 같아요.' },
    { type: 'cards', items: [
      { title: '마약왕의 딜레마', body: '마약왕은 경찰 둘을 알고 있어서, 그들을 거래에서 빼면 마약상 팀이 이겨요. 하지만 너무 정확하게 빼면 저격수에게 정체가 드러나요. 아는 것을 흘리되 자신이 흘렸다는 티를 내지 않는 것이 마약왕의 일이에요.' },
      { title: '오른팔이라는 방패', body: '오른팔은 두 사람 중 하나가 마약왕이라는 것만 알아요. 그래서 오른팔이 마약왕처럼 행동해 저격수의 표적을 가져오는 것이 마약상 팀의 핵심 수비예요. 반대로 특수요원은 마약왕인 척해 오른팔을 헷갈리게 해요.' },
      { title: '정보원은 혼자', body: '정보원은 같은 편 경찰을 모르고, 경찰 둘도 정보원을 모르는 것으로 보여요. 실패를 던질 수 있는 사람은 셋이지만 손발을 맞출 수 있는 건 둘뿐이라, 같은 거래에 경찰이 둘 들어가 실패가 두 장 나오면 정체가 금방 좁혀져요.' },
    ], columns: 1 },
    { type: 'p', text: '아발론과 마찬가지로 **우월 전략은 없어요.** 투표 기록(누가 어떤 거래원에 찬성했는지)과 실패가 나온 거래의 구성원을 교차해 보는 것이 공통의 분석 도구예요.' },
  ],
  similar: [
    { name: '레지스탕스: 아발론 (The Resistance: Avalon)', players: '5–10명', alike: '팀장이 원정대를 고르고 거수로 승인한 뒤 비밀리에 성공·실패를 내는 진행, 멀린·퍼시발·암살자 같은 역할 구조가 같아요. 방송도 이 게임을 모티브로 했다고 알려져 있어요.', differs: '아발론은 다섯 번째 거부가 나면 악이 이기는 등 세부 규칙이 있고, 시간이나 상금이 걸리지 않아요.' },
    { name: '시크릿 히틀러 (Secret Hitler)', players: '5–10명', alike: '정체를 숨긴 소수 팀이 투표로 뽑힌 사람의 비밀 선택을 통해 다수 팀을 속여요.', differs: '시크릿 히틀러는 정책 카드를 내는 방식이고, 실패를 던지는 대신 카드 더미의 운이 섞여요.' },
  ],
}, {
  meta: {
    title: 'Drug Lord rules — The Time Hotel, day 5 Kairos game',
    description: 'The rules of the Drug Lord game (마약왕 게임) from The Time Hotel: four dealers (the lord, the right hand and two members) against three police (special agent, sniper, informant), what each role knows, deal leaders and show-of-hands votes, deal sizes by round, success and fail votes, and the sniper’s last shot.',
    keywords: ['Drug Lord game', 'The Time Hotel Avalon', 'Time Hotel day 5', '더 타임 호텔 마약왕 게임'],
  },
  title: 'Drug Lord — The Time Hotel, day 5 Kairos game',
  name: 'Drug Lord (마약왕 게임)',
  lead: 'The dealers must pull off three deals and the hidden police must ruin three. Even if the dealers win, the police sniper can reverse it by naming the drug lord.',
  summary: 'Seven hidden roles pick deal crews and vote success or failure: the structure of The Resistance: Avalon.',
  setup: [
    { type: 'list', items: [
      '**Players**: seven. **Dealers** (4): the drug lord, the right hand and two members. **Police** (3): special agent, sniper, informant.',
      '**Drug lord**: knows the special agent and the sniper.',
      '**Right hand**: knows who the drug lord and the special agent are, but not which is which.',
      '**Special agent and sniper**: know each other and get a private talk after each round.',
      '**Two members and the informant**: no special knowledge.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Leader', body: 'Leadership passes clockwise around the seats from a random start. The leader may talk privately with up to two players before the vote.' },
      { title: 'Crew vote', body: 'The leader picks the deal crew and everyone votes by show of hands. A majority approves; otherwise the crew disbands and the next player leads.' },
      { title: 'Deal vote', body: 'Crew members vote success or failure in secret. **Police may vote either**, **dealers only success**. Only the result is announced.' },
    ] },
    { type: 'table', head: ['Round', 'Crew size', 'Deal succeeds if'], rows: [
      ['1', '2', 'all succeed'],
      ['2', '3', 'all succeed'],
      ['3', '3', 'all succeed'],
      ['4', '4', 'at least 3 succeed'],
      ['5', '4', 'see note'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Three failed deals**: the police win.',
      '**Three successful deals**: the dealers win, unless the **sniper names the drug lord** correctly, which reverses it.',
      'Every winner gets a checkout pass, and the team gets 24 hours to split as it likes.',
      'On the losing team, the player with the least time names a teammate for the checkout game (Gold, Silver, Bronze).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Apart from the leader’s talks and police abilities, nobody may leave the table.',
      'The round-5 condition could not be transcribed exactly: the source table has merged cells.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Role for role, this is seven-player **The Resistance: Avalon**: dealers are good, police evil, the drug lord Merlin, the right hand Percival, the special agent Morgana, the sniper the Assassin and the informant Oberon. Even the crew sizes (2, 3, 3, 4, 4) and the tolerated failure in round 4 match.' },
    { type: 'cards', items: [
      { title: 'The lord’s dilemma', body: 'The drug lord knows two police and could keep them off every crew, but doing it too precisely tells the sniper who the lord is. The job is to leak what you know without looking like the source.' },
      { title: 'The right hand as a shield', body: 'The right hand only knows that one of two players is the lord, so acting like the lord to draw the sniper’s shot is the dealers’ key defence. The special agent, in turn, poses as the lord to confuse the right hand.' },
      { title: 'The lonely informant', body: 'The informant knows no fellow police, and the other two apparently do not know the informant. Three people can fail a deal but only two can coordinate, so two police on one crew producing two fails narrows things quickly.' },
    ], columns: 1 },
    { type: 'p', text: 'As in Avalon, **there is no dominant strategy**. Crossing the vote record (who approved which crews) with the members of failed deals is everyone’s main tool.' },
  ],
  similar: [
    { name: 'The Resistance: Avalon', players: '5–10', alike: 'Leaders choose quests, a show of hands approves them, members secretly play success or fail, with Merlin, Percival and Assassin roles; the show is reported to have drawn on it.', differs: 'Avalon has extra rules such as evil winning on a fifth rejected team, and nothing like time or prize money.' },
    { name: 'Secret Hitler', players: '5–10', alike: 'A hidden minority fools the majority through the secret choices of voted-in players.', differs: 'Players enact policy cards from a deck, so luck of the draw replaces playing a fail.' },
  ],
});

export const arithmeticLotto = thGame('arithmetic-lotto', 'checkout', { ko: '6일차, 파이널 4라운드', en: 'Day 6, final round 4' }, ['6', '8'], ['equationTower', 'equationSignal', 'fourThree'], {
  meta: {
    title: '사칙 연산 로또 규칙 — 더 타임 호텔 체크아웃 게임·파이널, 주사위 기호로 당첨 번호 만들기',
    description: '더 타임 호텔 6일차 체크아웃 게임이자 파이널 4라운드인 사칙 연산 로또의 규칙을 정리했어요. 당첨 번호 6개, 1–6 숫자 카드 8장, + − × ÷ ^ ★ 연산 주사위 3개, 제곱→사칙연산→별 순서, 별 기호의 숫자 이어 붙이기, 종 치기와 15초, 재도전 제한까지.',
    keywords: ['사칙 연산 로또', '사칙연산 로또', '더 타임 호텔 사칙 연산', '더타임호텔 파이널', '더타임호텔'],
  },
  title: '사칙 연산 로또 — 더 타임 호텔 체크아웃 게임·파이널',
  name: '사칙 연산 로또',
  lead: '주사위로 나온 연산 기호 세 개와 내 숫자 카드 네 장으로 당첨 번호를 만들어요. 별(★)은 앞뒤 숫자를 이어 붙이는 기호예요.',
  summary: '연산 주사위 세 개와 숫자 카드 네 장으로 당첨 번호 6개를 먼저 다 만드는 계산 속도전. 6일차 체크아웃 게임과 파이널 4라운드에 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 6일차는 체크아웃 후보 1:1, 파이널 4라운드는 3명.',
      '**당첨 번호**: 시작할 때 만들어야 할 번호 6개가 공개돼요.',
      '**숫자 카드**: 1–6 중 무작위 8장을 각자 받아요.',
      '**연산 주사위** 3개: 면마다 더하기(+), 빼기(−), 곱하기(×), 나누기(÷), 제곱(^), 별(★).',
      '**아이템**: 카드 교체권(30분) — 숫자 카드 1장을 반납하고 1장을 새로 뽑아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '주사위', body: '지배인이 연산 주사위 3개를 동시에 굴려요.' },
      { title: '종', body: '먼저 종을 친 사람이 15초 안에 **자기 숫자 카드 4장과 나온 기호 3개를 모두** 써서 수식을 완성해요.' },
      { title: '계산 순서', body: '**제곱 → 사칙연산 → 별** 순서로 계산해요. 별은 앞뒤 결과를 이어 붙여요. 예: 1×2★3+4 = 2★7 = 27.' },
      { title: '판정', body: '결과가 당첨 번호 중 하나면 성공이에요. 쓴 카드 4장은 걷어 가고 새 카드 4장을 받아요.' },
      { title: '기호 리셋', body: '누군가 성공하거나, 주사위를 굴린 뒤 3분 동안 아무도 못 맞히면 주사위를 다시 굴려요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**당첨 번호 6개를 먼저 모두 만든 사람**이 이겨요. 6일차에는 진 사람이 체크아웃되고, 파이널에서는 이 라운드의 승리 1회가 돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '실패하거나 15초를 넘기면, 기호가 리셋될 때까지 다시 도전할 수 없어요.',
      '파이널에서는 세 명 모두 3분 안에 실패하면 기호가 리셋돼요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '사칙 연산 로또는 **계산 속도**와 **도전 타이밍**의 게임이에요. 종을 먼저 친 사람만 기회를 얻지만, 틀리면 그 주사위에서는 다시 못 나서요.' },
    { type: 'cards', items: [
      { title: '별과 제곱이 판을 바꾼다', body: '사칙연산만으로는 1–6 숫자 네 개로 만들 수 있는 범위가 좁아요. 제곱은 수를 키우고, 별은 두 결과를 이어 붙여 두 자리·세 자리 수를 만들어요. 계산 순서상 별이 맨 마지막이라, "앞부분 결과 + 뒷부분 결과"를 따로 맞춘다고 생각하면 큰 당첨 번호를 빨리 찾을 수 있어요.' },
      { title: '확신할 때만 종을', body: '먼저 치는 사람이 기회를 가져가니 서두르고 싶지만, 실패하면 그 기호 조합에서 빠져요. 상대가 먼저 쳐서 실패하면 남은 사람에게는 3분이 고스란히 남아요. 1:1에서는 상대의 실패가 곧 나의 독점 시간이에요.' },
      { title: '손패 관리', body: '성공할 때마다 카드 4장이 바뀌므로, 남은 4장과 새로 받을 4장의 조합이 다음 기회를 좌우해요. 어려운 당첨 번호를 마지막까지 남기면 끝에 막히기 쉬워서, 만들 수 있는 것보다 **만들기 어려운 번호부터** 노리는 것도 방법이에요. 카드 교체권은 그 막힘을 푸는 수단이에요.' },
    ], columns: 1 },
    { type: 'p', text: '운(주사위·카드)이 섞인 속도전이라 **우월 전략은 없어요.** 다만 실패의 대가가 크기 때문에, 계산이 확실할 때만 종을 치는 규율이 장기적으로 앞서요.' },
  ],
  similar: [
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '숫자 카드 다섯 장을 사칙연산으로 묶어 목표 숫자를 만드는 계산 게임이에요.', differs: '크립토는 연산 기호를 자유롭게 고르고, 제곱이나 숫자 이어 붙이기가 없어요.' },
    { name: '매스 다이스 (Math Dice)', players: '2명 이상', alike: '주사위로 정해진 목표 수에 가깝게 수식을 만드는 속도 게임이에요.', differs: '매스 다이스는 숫자를 주사위로 굴리고, 연산 기호는 정해져 있지 않아요.' },
  ],
}, {
  meta: {
    title: 'Arithmetic Lotto rules — The Time Hotel checkout game and final round',
    description: 'The rules of Arithmetic Lotto (사칙 연산 로또) from The Time Hotel: six winning numbers, eight number cards from 1–6, three operator dice with + − × ÷ ^ ★, the order power → arithmetic → star, the star that joins digits, the bell, 15 seconds and the retry lockout.',
    keywords: ['Arithmetic Lotto', 'The Time Hotel final', 'Time Hotel checkout game', '더 타임 호텔 사칙 연산 로또'],
  },
  title: 'Arithmetic Lotto — The Time Hotel checkout game and final',
  name: 'Arithmetic Lotto (사칙 연산 로또)',
  lead: 'Make a winning number from the three operators rolled on dice and four of your number cards. The star (★) joins the numbers either side.',
  summary: 'A speed-arithmetic race to make all six winning numbers with three rolled operators and four cards: day 6’s checkout game and the final’s round 4.',
  setup: [
    { type: 'list', items: [
      '**Players**: two checkout candidates on day 6; three in final round 4.',
      '**Winning numbers**: six, shown at the start.',
      '**Number cards**: eight each, at random from 1–6.',
      '**Operator dice** (3): plus, minus, times, divide, power (^) and star (★).',
      '**Item**: card swap (30 minutes) — return one number card and draw another.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Roll', body: 'The manager rolls the three operator dice together.' },
      { title: 'Bell', body: 'The first to ring the bell has 15 seconds to build an expression using **four of their cards and all three operators**.' },
      { title: 'Order', body: 'Evaluate **powers, then arithmetic, then stars**. A star joins the results either side: 1×2★3+4 = 2★7 = 27.' },
      { title: 'Check', body: 'If the result is one of the winning numbers it counts; the four cards are collected and four new ones dealt.' },
      { title: 'Re-roll', body: 'After a success, or 3 minutes with no success, the dice are rolled again.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first to make all six winning numbers** wins. On day 6 the loser checks out; in the final it is one round win.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A wrong answer or running out of time locks you out until the next roll.',
      'In the final, if all three fail within 3 minutes the dice are re-rolled.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Arithmetic Lotto is about **calculation speed** and **when to ring**. Only the first bell gets a chance, but a miss locks you out of that roll.' },
    { type: 'cards', items: [
      { title: 'Star and power change everything', body: 'Plain arithmetic on four numbers from 1–6 covers a narrow range. Powers make numbers large and the star glues two results into two- or three-digit numbers. Since stars come last, think "left result, then right result" to find big winning numbers quickly.' },
      { title: 'Ring only when sure', body: 'The first bell takes the chance, but a miss removes you from that roll, leaving your rival all three minutes. One-on-one, an opponent’s miss is your exclusive time.' },
      { title: 'Managing the hand', body: 'Each success replaces four cards, so what you keep shapes the next chance. Leaving the hardest winning numbers to the end tends to stall you, so going for **the hard ones first** can pay, and the card swap is the way out of a stall.' },
    ], columns: 1 },
    { type: 'p', text: 'With dice and cards involved there is **no dominant strategy**, but because misses are costly, ringing only on a sure answer wins out over time.' },
  ],
  similar: [
    { name: 'Krypto', players: '1+', alike: 'Combine five number cards with arithmetic to hit a target.', differs: 'Operators are chosen freely, with no powers or digit-joining.' },
    { name: 'Math Dice', players: '2+', alike: 'A race to build an expression close to a target set by dice.', differs: 'The numbers are rolled, and operators are not fixed by dice.' },
  ],
});

export const onAndOff = thGame('on-and-off', 'kairos', { ko: '7일차', en: 'Day 7' }, ['7'], ['russianRoulette', 'hiddenWord', 'indianPoker'], {
  meta: {
    title: '온 앤 오프 규칙 — 더 타임 호텔 7일차 카이로스 게임, 꺼진 조명 수 예측하기',
    description: '더 타임 호텔 7일차 카이로스 게임 온 앤 오프의 규칙을 정리했어요. 4라운드, 순서 결정권 시간 경매, 분리된 객실과 3분 전화, 한 번 끄면 다시 켤 수 없는 조명, 꺼진 조명 수에 따른 1–6점, 최하위의 즉시 체크아웃까지.',
    keywords: ['온 앤 오프', '더 타임 호텔 온 앤 오프', '더타임호텔 7일차', '더 타임 호텔 조명 게임', '더타임호텔'],
  },
  title: '온 앤 오프 — 더 타임 호텔 7일차 카이로스 게임',
  name: '온 앤 오프',
  lead: '각자 다른 객실에 갇혀, 전화로만 이야기하고 조명을 켜 둘지 끌지 정해요. 차례인 사람은 꺼진 조명의 수를 맞혀야 점수를 얻어요.',
  summary: '분리된 객실에서 전화로 상의하고, 꺼진 조명 수를 예측해 점수를 얻는 4라운드 게임. 최하위는 바로 체크아웃돼요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 남은 5명. 각자 조명이 있는 객실 하나.',
      '**전화**: 객실마다 다른 플레이어와 통화할 수 있는 전화기.',
      '**라운드**: 4라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '순서 결정권 경매', body: '공개 입찰로 자신을 포함한 모든 플레이어의 예측 순서를 정할 권리를 사요. 개인 시간으로 입찰하고, 최소 1시간, 30분 단위예요.' },
      { title: '객실 분리', body: '각자 정해진 객실로 들어가고, 다음 라운드가 시작될 때까지 밖으로 나올 수 없어요.' },
      { title: '통화', body: '차례마다 3분 동안 전화로 자유롭게 상의해요.' },
      { title: '온·오프', body: '1분 안에 객실 조명을 켜 둘지(On) 끌지(Off) 정해요. **한 번 끈 조명은 그 라운드가 끝날 때까지 다시 켤 수 없어요.**' },
      { title: '예측', body: '차례인 사람이 꺼진 조명의 수를 예측해요. 맞히면 점수를 얻어요.' },
    ] },
    { type: 'table', head: ['켜짐 / 꺼짐', '5/0', '4/1', '3/2', '2/3', '1/4', '0/5'], rows: [
      ['예측 성공 시 점수', '1', '2', '3', '4', '5', '6'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '차례마다 예측의 성공 여부만 공개되고, 자세한 온·오프와 점수는 라운드가 끝날 때 공지돼요.',
      '누적 점수 순위로 시간을 받아요: 1위 10시간, 2위 7, 3위 5, 4위 2. 동점이면 **조명을 끈 횟수가 적은 사람**이 앞서요.',
      '이 날은 체크아웃 게임 없이 **최하위가 바로 체크아웃**돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드가 바뀌면 조명은 다시 켤 수 있는 것으로 보이지만, 정리된 규칙에 명시되어 있지는 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '온 앤 오프는 **한 방향으로만 움직이는 숫자**를 두고 벌이는 협상이에요. 꺼진 조명 수는 라운드 안에서 늘어나기만 하고, 많이 꺼져 있을수록 맞혔을 때 점수가 커요.' },
    { type: 'cards', items: [
      { title: '뒤 차례가 유리할까', body: '라운드 후반에는 꺼진 조명이 많아 맞히면 큰 점수를 받을 수 있어요. 대신 앞사람들이 이미 끈 수를 정확히 알아야 하고, 그 정보는 전화로 들은 말뿐이에요. 순서 결정권 경매는 결국 "나는 언제, 남은 언제"를 사는 일이라, 자신의 자리뿐 아니라 경쟁자를 불리한 자리에 보내는 데도 쓰여요.' },
      { title: '끄는 것은 남을 돕는 일', body: '내가 조명을 끄면 그 뒤 차례 사람들의 점수판이 커져요. 그런데 동점 규칙은 끈 횟수가 적은 사람을 앞세워요. 그래서 "나는 끄지 않고 남이 꺼 주기를" 바라는 무임승차의 유혹이 있고, 서로 끄기로 약속하는 연합이 생겨요.' },
      { title: '약속을 지키는지 알 수 없다', body: '각자 객실에 있어 누가 실제로 껐는지 볼 수 없어요. 차례마다 공개되는 건 예측의 성공 여부뿐이라, 실패가 나오면 누군가 약속과 다르게 했다는 것만 알 수 있어요. 반복되는 라운드 속에서 신뢰를 쌓고 확인하는 과정이 이 게임의 본질이에요.' },
    ], columns: 1 },
    { type: 'p', text: '전원이 정직하게 정보를 나누면 모두가 매번 맞힐 수 있는 협력 게임이지만, 순위가 있고 꼴찌는 탈락이에요. **우월 전략은 없고**, 예측이 틀리도록 일부러 조명을 끄는 배신이 언제나 가능해요.' },
  ],
  similar: [
    { name: '페루도 (Perudo)', players: '2–6명', alike: '나만 아는 정보와 남의 말을 합쳐 전체의 개수를 추정해요.', differs: '페루도는 주사위의 개수를 추정하는 경매이고, 조명처럼 되돌릴 수 없는 선택이나 통화가 없어요.' },
    { name: '이토 (ito)', players: '2–10명', alike: '각자 숨긴 정보를 말로만 전해서 순서와 숫자를 맞춰야 해요.', differs: '이토는 완전한 협력 게임이라 배신할 이유가 없어요.' },
  ],
}, {
  meta: {
    title: 'On and Off rules — The Time Hotel, day 7 Kairos game',
    description: 'The rules of On and Off (온 앤 오프) from The Time Hotel: four rounds, a time auction for the turn order, separate rooms and 3-minute phone calls, lights that cannot be turned back on, 1 to 6 points by the number of lights off, and immediate checkout for last place.',
    keywords: ['On and Off', 'The Time Hotel', 'Time Hotel day 7', '더 타임 호텔 온 앤 오프'],
  },
  title: 'On and Off — The Time Hotel, day 7 Kairos game',
  name: 'On and Off (온 앤 오프)',
  lead: 'Locked in separate rooms and talking only by phone, everyone decides whether to leave their light on or switch it off. The player whose turn it is scores by predicting how many are off.',
  summary: 'Talk by phone from separate rooms and predict how many lights are off, over four rounds; last place checks out at once.',
  setup: [
    { type: 'list', items: [
      '**Players**: the remaining five, each in a room with its own light.',
      '**Phones**: each room has a phone to call the others.',
      '**Rounds**: four.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Order auction', body: 'An open auction sells the right to set everyone’s prediction order, including your own. Bids are in personal time: at least 1 hour, in steps of 30 minutes.' },
      { title: 'Separate', body: 'Everyone goes to their room and stays until the next round.' },
      { title: 'Call', body: 'Each turn there are 3 minutes of free phone talk.' },
      { title: 'On or off', body: 'Within 1 minute decide whether your light stays on or goes off. **Once off, it stays off for the rest of the round.**' },
      { title: 'Predict', body: 'The player whose turn it is predicts how many lights are off and scores if right.' },
    ] },
    { type: 'table', head: ['On / off', '5/0', '4/1', '3/2', '2/3', '1/4', '0/5'], rows: [
      ['Points for a correct prediction', '1', '2', '3', '4', '5', '6'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Each turn only whether the prediction was right is announced; details and scores come at the end of the round.',
      'Time by total points: 10 h, 7, 5, 2. Ties go to whoever **switched off fewer times**.',
      'No checkout game that day: **last place checks out directly**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Lights apparently reset between rounds, but the written rules do not say so explicitly.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'On and Off is a negotiation over **a number that only goes up**: within a round lights only go off, and the more are off, the more a correct prediction scores.' },
    { type: 'cards', items: [
      { title: 'Is a late turn better?', body: 'Late in a round many lights are off, so a hit scores big, but you must know exactly how many, and all you have is what people said on the phone. The order auction buys "when I go and when others go", useful for putting rivals in bad spots as well as yourself in a good one.' },
      { title: 'Switching off helps others', body: 'Your light going off raises later players’ potential scores, yet the tie-break favours those who switched off less. That invites free-riding ("let others switch off") and alliances that promise to.' },
      { title: 'Promises cannot be checked', body: 'Nobody can see whether others really switched off. Only success or failure is announced each turn, so a miss tells you someone broke a promise, not who. Building and testing trust over the rounds is the heart of it.' },
    ], columns: 1 },
    { type: 'p', text: 'If everyone shared honestly, everyone could hit every time; but there is a ranking and last place leaves. **There is no dominant strategy**, and betrayal by switching off to spoil a prediction is always possible.' },
  ],
  similar: [
    { name: 'Perudo', players: '2–6', alike: 'You combine private knowledge with what others say to estimate a total.', differs: 'It is a bidding game on dice, with no irreversible choices or phone calls.' },
    { name: 'ito', players: '2–10', alike: 'Hidden information shared only through words must line up numbers.', differs: 'It is fully cooperative, so nobody has a reason to betray.' },
  ],
});

export const karmaNine = thGame('karma-nine', 'final', { ko: '파이널 1라운드', en: 'Final, round 1' }, ['8'], ['gyulhap', 'nemoCount', 'gradation'], {
  meta: {
    title: '카르마 나인 규칙 — 더 타임 호텔 파이널 1라운드, 가짜 카드가 섞인 세트 찾기',
    description: '더 타임 호텔 파이널 1라운드 카르마 나인의 규칙을 정리했어요. 배경·모양·색깔이 다른 27장 중 9장의 카르마 판, 체크아웃 게스트가 건넨 진짜·가짜 카드, 고정된 8·9번, 모두 같거나 모두 다른 CHECK 조건, +2점·−1점, 20초 제한과 진짜 카드 확인권까지.',
    keywords: ['카르마 나인', '더 타임 호텔 카르마 나인', '더타임호텔 파이널', '세트 게임', '더타임호텔'],
  },
  title: '카르마 나인 — 더 타임 호텔 파이널 1라운드',
  name: '카르마 나인',
  lead: '세 가지 속성이 모두 같거나 모두 다른 카드 세 장을 찾는 "세트" 게임인데, 내 판에는 가짜 카드가 섞여 있어요.',
  summary: '가짜 카드가 섞인 9장 판에서 진짜 정답판의 조합을 찾아내는 파이널 1라운드.',
  setup: [
    { type: 'list', items: [
      '**인원**: 파이널 진출자 3명.',
      '**카드**: 배경(검정·하양·회색) × 모양(토끼·고양이·시계) × 색깔(빨강·노랑·초록), 서로 다른 27장.',
      '**카르마 판**: 1–9번 자리에 카드 9장. 정답판과 다른 **가짜 카드**가 섞여 있고, 몇 장인지 어디인지는 알려 주지 않아요. 8·9번은 언제나 진짜예요.',
      '**가짜 카드의 출처**: 체크아웃된 게스트들이 탈락 순서대로 1–7번을 맡아, 진출자 두 명에게는 진짜 카드를, 한 명에게는 가짜 카드를 건넸어요.',
      '**아이템**: 진짜 카드 확인권(1시간) — 예상하는 카드가 진짜인지 지배인이 알려 줘요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '차례', body: '차례가 오면 20초 안에 CHECK를 외쳐 카드 세 장을 말해요. 못 외치면 다음 사람에게 넘어가요.' },
      { title: 'CHECK 조건', body: '세 장의 배경이 모두 같거나 모두 다르고, 모양도, 색깔도 각각 그래야 해요.' },
      { title: '판정', body: '**정답판** 기준으로 성립하면 정답이에요. 내 판에 가짜가 섞여 있어도 정답판에서 성립하면 인정돼요. 맞히면 10초가 더 주어져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '성공 +2점, 실패 −1점, 이미 나온 답을 다시 말하면 −1점.',
      '마지막 CHECK가 나오면 게임이 끝나고, 점수가 가장 높은 사람이 이 라운드를 이겨요. 파이널은 네 라운드 중 **두 라운드를 먼저 이긴 사람**이 우승해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '파이널 우승자의 상금은 타임워치에 남은 시간을 시간당 500만 원으로 바꿔 정해요(최대 3억 원).',
    ] },
  ],
  analysis: [
    { type: 'p', text: '카르마 나인은 보드게임 SET에 **불완전한 정보**를 더한 게임이에요. SET의 수학적 성질을 알면 추리의 출발점이 생겨요.' },
    { type: 'cards', items: [
      { title: '두 장이 세 번째를 정한다', body: '27장 SET 구조에서는 어떤 두 장을 고르든, 그 둘과 CHECK가 되는 세 번째 카드는 **정확히 한 장**뿐이에요. 속성마다 "같으면 같은 것, 다르면 남은 하나"로 정해지기 때문이에요. 그래서 진짜로 보장된 8·9번 카드를 짝지으면 필요한 세 번째 카드가 바로 계산돼요.' },
      { title: '가짜는 한 사람에게만', body: '1–7번 자리마다 세 진출자 중 정확히 한 명이 가짜를 받았어요. 내 판이 남들과 같은지 직접 볼 수는 없어도, 상대가 CHECK에 쓰는 카드와 그 성패가 내 판의 진위를 알려 주는 단서가 돼요. 상대가 같은 자리를 쓰고 성공했다면, 그 자리의 상대 카드가 진짜였다는 뜻이에요.' },
      { title: '확실한 것부터', body: '실패하면 −1점이므로, 확신이 없는 조합은 피하고 진짜가 보장된 카드가 들어간 CHECK부터 챙기는 것이 기댓값이 높아요. 진짜 카드 확인권은 의심되는 한 장을 확정해, 그 카드가 들어간 모든 조합을 한 번에 살리거나 지워요.' },
    ], columns: 1 },
    { type: 'p', text: '찾을 수 있는 CHECK의 수는 정해져 있고 중복은 감점이라, 빨리 찾는 것만큼 **남이 아직 말하지 않은 답을 기억하는 것**도 중요해요. 우월 전략은 없어요.' },
  ],
  similar: [
    { name: 'SET', players: '1명 이상', alike: '네 가지 속성이 모두 같거나 모두 다른 카드 세 장을 찾는 바로 그 규칙이에요. 방송도 이 게임을 모티브로 했다고 알려져 있어요.', differs: 'SET은 속성이 넷(81장)이고 모든 카드가 공개되어 있어요. 가짜 카드나 감점이 없어요.' },
    { name: '쿼르토 (Quarto)', players: '2명', alike: '여러 속성 중 하나라도 공통인 말을 한 줄로 모으는, 속성 조합을 읽는 게임이에요.', differs: '쿼르토는 4×4판에 말을 놓는 대결이고, "모두 다름"은 조건이 아니에요.' },
  ],
}, {
  meta: {
    title: 'Karma Nine rules — The Time Hotel final, round 1',
    description: 'The rules of Karma Nine (카르마 나인) from The Time Hotel: a board of nine of 27 cards varying in background, shape and colour, real and fake cards handed over by checked-out guests, fixed cards 8 and 9, the all-same-or-all-different CHECK, +2 and −1 points, 20-second turns and the real-card check.',
    keywords: ['Karma Nine', 'The Time Hotel final', 'SET card game', '더 타임 호텔 카르마 나인'],
  },
  title: 'Karma Nine — The Time Hotel final, round 1',
  name: 'Karma Nine (카르마 나인)',
  lead: 'A SET-style hunt for three cards whose features are all the same or all different — except your board has fake cards mixed in.',
  summary: 'The final’s first round: find combinations that hold on the true answer board from a nine-card board seeded with fakes.',
  setup: [
    { type: 'list', items: [
      '**Players**: the three finalists.',
      '**Cards**: 27, every combination of background (black, white, grey), shape (rabbit, cat, clock) and colour (red, yellow, green).',
      '**Karma board**: nine cards in positions 1–9, with **fake cards** that differ from the answer board; how many and where is not revealed. Positions 8 and 9 are always real.',
      '**Where fakes come from**: checked-out guests, in elimination order, took positions 1–7 and gave real cards to two finalists and a fake to one.',
      '**Item**: real-card check (1 hour) — the manager says whether the card you suspect is real.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Turn', body: 'On your turn, call CHECK and name three cards within 20 seconds, or the turn passes.' },
      { title: 'CHECK', body: 'Backgrounds must be all the same or all different, and likewise shapes and colours.' },
      { title: 'Judging', body: 'It counts if it holds on **the answer board**, fakes on your board notwithstanding. A correct call adds 10 seconds.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Correct +2, wrong −1, repeating an earlier answer −1.',
      'The game ends when the last CHECK is found; the highest score wins the round. The final goes to **the first to win two of its four rounds**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The champion’s prize is the time left on their watch at ₩5 million per hour (up to ₩300 million).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Karma Nine is SET with **imperfect information**. SET’s mathematics gives deduction a starting point.' },
    { type: 'cards', items: [
      { title: 'Two cards fix the third', body: 'In a 27-card SET deck, any two cards have **exactly one** third card that completes a CHECK: each feature is either the same or the remaining one. So pairing the guaranteed cards 8 and 9 tells you at once which third card you need.' },
      { title: 'Only one finalist gets each fake', body: 'For each of positions 1–7, exactly one of three finalists has a fake. You cannot see others’ boards, but which cards they call and whether they succeed are clues: a success using a position means their card there was real.' },
      { title: 'Sure things first', body: 'A miss costs a point, so CHECKs built on guaranteed cards have the best expectation. The real-card check settles one suspect card and with it every combination that uses it.' },
    ], columns: 1 },
    { type: 'p', text: 'The number of CHECKs is fixed and repeats cost points, so **remembering which answers are still unsaid** matters as much as speed. There is no dominant strategy.' },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'Find three cards whose features are each all the same or all different: the same rule; the show is reported to have drawn on it.', differs: 'SET has four features (81 cards), everything face up, and no fakes or penalties.' },
    { name: 'Quarto', players: '2', alike: 'Reading combinations of several features to line up pieces sharing one.', differs: 'It is a duel on a 4×4 board, and "all different" is not a condition.' },
  ],
});

export const blindEquation = thGame('blind-equation', 'final', { ko: '파이널 3라운드', en: 'Final, round 3' }, ['8'], ['equationTower', 'equationSignal', 'heavy13'], {
  meta: {
    title: '블라인드 수식 규칙 — 더 타임 호텔 파이널 3라운드, 외운 숫자와 기호로 만드는 수식',
    description: '더 타임 호텔 파이널 3라운드 블라인드 수식의 규칙을 정리했어요. 6×6 숫자판과 기호판 72칸 암기 5분, 홀수 라운드 숫자·짝수 라운드 기호, 내 수식과 상대 수식에 넣는 공격과 수비, 17라운드, 한 칸 확인권과 부호 리버스까지.',
    keywords: ['블라인드 수식', '더 타임 호텔 블라인드 수식', '더타임호텔 파이널', '암기 수식 게임', '더타임호텔'],
  },
  title: '블라인드 수식 — 더 타임 호텔 파이널 3라운드',
  name: '블라인드 수식',
  lead: '숫자 36칸과 연산 기호 36칸을 5분 동안 외운 뒤, 가려진 판에서 칸을 불러 수식을 채워요. 남의 수식에 넣어 망칠 수도 있어요.',
  summary: '72칸을 외워 수식을 채우는 암기·계산 싸움. 가장 큰 값을 만든 사람이 이 라운드를 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 파이널 진출자 3명.',
      '**숫자판·기호판**: 각각 6×6, 36칸. 숫자판에는 숫자, 기호판에는 사칙 연산 기호가 규칙 없이 놓여 있어요.',
      '**아이템**(한 번에 하나만): **한 칸 확인권**(30분) — 열리지 않은 한 칸을 확인해요. **부호 리버스**(1시간) — 숫자 라운드에 쓰면 음수와 양수를, 기호 라운드에 쓰면 +와 −, ×와 ÷를 서로 바꿔요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기', body: '5분 동안 두 판의 모든 칸을 외워요. 시간이 끝나면 판이 가려져요.' },
      { title: '부르기', body: '홀수 라운드에는 숫자판에서, 짝수 라운드에는 기호판에서 칸을 하나씩 불러요. 이미 열린 칸은 다시 부를 수 없어요.' },
      { title: '넣기', body: '고른 숫자나 기호는 **내 수식에도, 다른 사람의 수식에도** 넣을 수 있어요. 다만 수식이 이미 다 찼다면 남은 빈자리를 채워야 해요. 한 번 채운 자리는 바꿀 수 없어요.' },
      { title: '순서', body: '처음 순서는 숫자 카드를 뽑아 정하고, 공정하도록 라운드마다 바뀌어요. 고른 숫자와 기호는 전광판에 차례로 표시돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '17라운드 뒤 모든 수식이 완성되면 **사칙연산의 순서대로** 계산해, 가장 큰 값을 만든 사람이 이 라운드를 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '수식의 길이(숫자와 기호 몇 칸인지)는 정리된 규칙에서 확인되지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '블라인드 수식은 **암기**, **계산**, **방해**가 한 판에 겹친 게임이에요. 72칸을 다 외우기는 어렵기 때문에, 무엇을 외울지 고르는 것부터가 전략이에요.' },
    { type: 'cards', items: [
      { title: '외울 칸을 고르기', body: '수식의 값을 키우는 건 큰 숫자와 ×예요. 그래서 5분 동안 모든 칸을 고르게 외우기보다, 큰 숫자와 ×·÷의 위치를 확실히 외우는 편이 효율적이에요. 다른 사람도 같은 칸을 노리니, 두 번째·세 번째 후보까지 외워 두어야 해요.' },
      { title: '남의 수식이 표적', body: '내 수식을 키우는 대신 상대 수식에 ÷나 −, 작은 숫자를 넣어 망칠 수 있어요. 세 명이 겨루니 1위를 끌어내리는 데 두 사람의 이해가 맞기 쉬워요. 공격당할 차례를 줄이려면 내 수식을 일찍 채우는 것도 수비가 돼요.' },
      { title: '부호 리버스', body: '숫자 라운드에서 음수를 양수로, 기호 라운드에서 ÷를 ×로 바꾸면 불리한 칸이 단숨에 유리해져요. 반대로 상대에게 넣은 기호를 뒤집어 피해를 키울 수도 있어요. 한 번에 하나만 쓸 수 있어 언제 쓰느냐가 관건이에요.' },
    ], columns: 1 },
    { type: 'p', text: '이미 열린 칸은 다시 부를 수 없으므로, 좋은 칸은 라운드가 지날수록 줄어요. **우월 전략은 없지만**, 기억이 정확한 사람이 초반에 큰 수와 ×를 가져가고, 후반에는 남은 자리 채우기와 방해가 승부를 가르는 흐름이 자연스러워요.' },
  ],
  similar: [
    { name: '메모리 (같은 그림 찾기)', players: '2명 이상', alike: '뒤집힌 카드의 위치를 기억해 원하는 카드를 불러오는 기억력 게임이에요.', differs: '메모리는 짝을 맞추는 것으로 끝나고, 계산이나 방해가 없어요.' },
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자와 연산으로 수식을 만들어 값을 다투는 계산 게임이에요.', differs: '크립토는 숫자가 모두 공개되고, 목표 숫자를 맞히는 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Blind Equation rules — The Time Hotel final, round 3',
    description: 'The rules of Blind Equation (블라인드 수식) from The Time Hotel: five minutes to memorise 72 cells on a 6×6 number board and a 6×6 operator board, numbers on odd rounds and operators on even ones, attacking and defending by filling anyone’s equation, 17 rounds, the one-cell check and the sign reverse.',
    keywords: ['Blind Equation', 'The Time Hotel final', 'memory math game', '더 타임 호텔 블라인드 수식'],
  },
  title: 'Blind Equation — The Time Hotel final, round 3',
  name: 'Blind Equation (블라인드 수식)',
  lead: 'Memorise 36 numbers and 36 operators in five minutes, then call cells from the covered boards to fill equations, your own or a rival’s.',
  summary: 'A memory-and-arithmetic fight over 72 cells; whoever ends with the largest value wins the round.',
  setup: [
    { type: 'list', items: [
      '**Players**: the three finalists.',
      '**Boards**: a 6×6 number board and a 6×6 operator board, 36 cells each, laid out without pattern.',
      '**Items** (one at a time): **one-cell check** (30 minutes) — look at one unopened cell; **sign reverse** (1 hour) — on a number round, swap negative and positive; on an operator round, swap + with − and × with ÷.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise', body: 'Five minutes to learn both boards; then they are covered.' },
      { title: 'Call', body: 'Odd rounds call a number cell, even rounds an operator cell, one each. Opened cells cannot be called again.' },
      { title: 'Place', body: 'What you call can go into **your equation or someone else’s**; if an equation is already full, you must fill an empty spot. Filled spots cannot change.' },
      { title: 'Order', body: 'The first order is drawn with number cards and changes every round for fairness; calls appear on a display in order.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After 17 rounds, with every equation complete, each is evaluated **with the usual order of operations**; the largest value wins the round.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How many numbers and operators an equation holds could not be confirmed, so it is not stated.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Blind Equation stacks **memory**, **arithmetic** and **sabotage**. Seventy-two cells are too many to learn fully, so choosing what to memorise is the first decision.' },
    { type: 'cards', items: [
      { title: 'Choose what to learn', body: 'Big numbers and × make values large, so learning their positions for certain beats spreading attention evenly. Rivals want the same cells, so learn second and third choices too.' },
      { title: 'Rivals are targets', body: 'Instead of building your own, drop ÷, − or a small number into a rival’s equation. With three players, two have a shared interest in pulling down the leader; filling your own equation early also limits how often you can be hit.' },
      { title: 'Sign reverse', body: 'Turning a negative positive, or ÷ into ×, flips a bad cell into a good one; used on what you gave a rival, it deepens the damage. One item at a time makes timing everything.' },
    ], columns: 1 },
    { type: 'p', text: 'Opened cells are gone, so good cells dwindle. **There is no dominant strategy**, but the natural shape is accurate memories taking the big numbers and × early, with filling the remaining spots and sabotage deciding the end.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '2+', alike: 'Remember where face-down cards are to call the one you want.', differs: 'It ends at matching pairs, with no arithmetic or sabotage.' },
    { name: 'Krypto', players: '1+', alike: 'Build expressions from given numbers and operators.', differs: 'All numbers are visible and the aim is to hit a target.' },
  ],
});
