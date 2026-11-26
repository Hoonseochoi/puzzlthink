// 더 지니어스: 게임의 법칙, main matches of rounds 1–4: 1·2·3 게임, 대선 게임, 풍요와 기근, 좀비 게임.
import { g1Game, round } from './shared';

export const oneTwoThree = g1Game('one-two-three-game', 'main', round(1), [1], ['indianPoker', 'twoSidedPoker', 'blackWhite'], {
  meta: {
    title: '1·2·3 게임 규칙 — 더 지니어스 시즌1 1회전 메인 매치, 숫자 카드 9장으로 승점 모으기',
    description: '더 지니어스: 게임의 법칙 1회전 메인 매치 1·2·3 게임의 규칙을 정리했어요. 1·2·3 카드 세 장씩 아홉 장, 상대와 상대를 고르는 1:1 대결, 카드가 남으면 0점, 자유로운 교환과 양도, 13명·117장이라는 숫자가 만드는 함정과 연합 전략까지.',
    keywords: ['1·2·3 게임', '123 게임', '더 지니어스 1·2·3 게임', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 1회전'],
  },
  title: '1·2·3 게임 — 더 지니어스 시즌1 1회전 메인 매치',
  name: '1·2·3 게임',
  lead: '모두가 1, 2, 3 카드를 세 장씩 들고 시작해요. 상대를 골라 한 장씩 내고 큰 숫자가 1점. 단, 끝날 때 카드가 한 장이라도 남아 있으면 점수가 0이 돼요.',
  summary: '숫자 카드 아홉 장을 모두 써야 하는 1:1 대결의 연속. 누구와, 어떤 순서로 카드를 쓰느냐의 게임이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 13명(시즌 첫 메인 매치).',
      '**카드**: 한 사람당 1·2·3이 적힌 카드를 세 장씩, 모두 아홉 장.',
      '**시간**: 영문 위키백과 정리에 따르면 90분이에요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '상대 정하기', body: '대결 상대와 횟수는 자유예요. 두 사람이 합의하면 메인 홀의 테이블에 마주 앉아요.' },
      { title: '카드 내기', body: '각자 카드 한 장을 엎어 놓은 뒤 동시에 뒤집어요.' },
      { title: '판정', body: '더 큰 숫자를 낸 사람이 승점 1점을 얻어요. 같은 숫자면 아무도 점수를 얻지 못해요.' },
      { title: '카드 버리기', body: '대결에 쓴 두 장은 승패와 상관없이 버려져요. 다시 쓸 수 없어요.' },
      { title: '교환과 양도', body: '게임 중에는 언제든 다른 사람과 카드를 바꾸거나 그냥 넘겨줄 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '게임이 끝났을 때 **승점이 가장 높은 사람**이 우승해 가넷 1개와 생명의 징표를 받아요.',
      '**승점이 가장 낮은 사람**이 탈락 후보가 되어 데스 매치에 나가요.',
      '끝날 때 카드를 한 장이라도 들고 있는 사람은 그때까지의 승점과 상관없이 **0점**이에요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '카드를 몰래 버리거나 잃어버린 것으로 처리하는 방법은 규칙에 없어요. 카드를 없애는 길은 대결뿐이에요.',
      '승점이 같은 1위가 여럿일 때 공동 우승으로 처리될 수 있었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임의 첫 번째 열쇠는 **카드 수의 홀짝**이에요. 13명이 아홉 장씩이면 모두 117장인데, 대결 한 번에 정확히 두 장이 사라져요. 117은 홀수라서 아무리 교환을 해도 **마지막 한 장은 누군가의 손에 남아요.** 즉 최소 한 명은 반드시 0점이 되도록 설계돼 있고, 그 한 명이 되지 않는 것이 첫 목표예요.' },
    { type: 'cards', items: [
      { title: '점수는 나눠 가질 수 있다', body: '승부가 난 대결에서는 언제나 한 사람이 1점을 얻고 한 사람이 얻지 못해요. 그래서 두 사람이 짜면 점수를 한쪽에 몰아줄 수 있어요. 예를 들어 한 사람이 2를 세 번 내고 상대가 1을 세 번 내면 3:0, 이어서 역할을 바꾸면 다시 0:3, 남은 3끼리는 비겨서 두 사람 모두 3점에 카드를 다 털어요.' },
      { title: '양도가 만드는 큰 점수', body: '교환과 양도가 자유라서 카드 구성을 바꿀 수 있어요. 한 사람이 3을 여섯 장, 2를 세 장 갖고 상대가 2 세 장과 1 여섯 장을 가지면, 아홉 번을 모두 이겨 한 사람이 9점을 낼 수 있어요. 대신 몰아준 쪽은 0점이 되니, 우승자가 넘겨주는 생명의 징표에 기대는 위험한 거래예요.' },
      { title: '약속은 카드 한 장으로 깨진다', body: '대결은 엎어 놓고 동시에 뒤집지만, 상대가 약속과 다른 숫자를 내면 점수는 그대로 굳어요. 연합 전략은 모두 "상대가 약속대로 낸다"는 믿음에 기대고 있어서, 여러 연합에 동시에 발을 걸치면 남보다 많은 점수를 챙길 수 있는 구조예요.' },
    ], columns: 1 },
    { type: 'p', text: '혼자서 이길 수 있는 **우월 전략은 없어요.** 누구와 몇 번 붙을지 정할 수 있고 카드를 주고받을 수 있으니, 결국 승점을 몰아줄 동료와, 남은 카드를 받아 줄 상대를 확보하는 게임이에요. 1위 경쟁보다 "마지막 카드를 떠안지 않는 것"과 "최하위가 되지 않는 것"에 먼저 신경 써야 해요.' },
  ],
  similar: [
    { name: '구프슈필 (Goofspiel)', players: '2명 이상', alike: '정해진 숫자 카드를 한 장씩 동시에 내고 큰 숫자가 이기는 고전 카드 게임이에요. 모든 카드를 결국 다 써야 한다는 점도 같아요.', differs: '구프슈필은 점수 카드를 놓고 모두가 동시에 겨루고, 카드를 주고받는 거래가 없어요.' },
    { name: '하이에나 (Hol\'s der Geier)', players: '2–5명', alike: '같은 숫자 카드 세트를 가진 사람들이 동시에 한 장씩 내 승부를 가려요. 상대가 무엇을 낼지 읽는 것이 핵심이에요.', differs: '같은 숫자를 낸 사람끼리는 서로 지워지고, 일대일이 아니라 전원이 동시에 내요.' },
  ],
}, {
  meta: {
    title: 'The 1·2·3 Game rules — The Genius season 1, round 1 main match',
    description: 'The rules of the 1·2·3 Game (1·2·3 게임) from The Genius: Rules of the Game: nine cards of 1, 2 and 3, one-on-one duels with partners of your choice, zero points for leftover cards, free trading, and the odd card count that guarantees someone a zero.',
    keywords: ['The Genius 1-2-3 game', 'The Genius Rules of the Game', '더 지니어스 1·2·3 게임', 'The Genius season 1'],
  },
  title: 'The 1·2·3 Game — The Genius season 1, round 1 main match',
  name: 'The 1·2·3 Game (1·2·3 게임)',
  lead: 'Everyone starts with three each of 1, 2 and 3. Pick an opponent, play one card each, higher scores a point — but holding even one card at the end makes your score zero.',
  summary: 'A string of one-on-one duels in which every one of your nine cards must be used: who you play, and in what order, is the game.',
  setup: [
    { type: 'list', items: [
      '**Players**: 13 (the season’s first main match).',
      '**Cards**: three each of 1, 2 and 3 per player, nine in all.',
      '**Time**: 90 minutes, according to English Wikipedia.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Find an opponent', body: 'Opponents and the number of duels are free; two players who agree sit down at a table in the main hall.' },
      { title: 'Play', body: 'Each places one card face down and both are turned over together.' },
      { title: 'Score', body: 'The higher number earns 1 point; equal numbers score nothing.' },
      { title: 'Discard', body: 'Both cards are discarded whatever the result.' },
      { title: 'Trade', body: 'Cards may be swapped or simply given away at any time.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The **highest score** wins a garnet and a token of life.',
      'The **lowest score** becomes the elimination candidate and goes to the death match.',
      'Anyone still holding a card at the end scores **zero**, whatever they had.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The rules give no way to throw away or lose a card; duels are the only way to get rid of one.',
      'Several players tied for first could share the win.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The first key is **parity**. Thirteen players with nine cards each make 117 cards, and every duel removes exactly two. Since 117 is odd, **one card must end up stranded in someone’s hand**, however much trading happens: the game guarantees at least one zero, and the first goal is not to be that player.' },
    { type: 'cards', items: [
      { title: 'Points can be shared out', body: 'Every decided duel gives one player a point and the other nothing, so two allies can steer points. One plays 2 three times against the other’s 1s (3–0), they swap roles (0–3), then the 3s tie: both finish on 3 with empty hands.' },
      { title: 'Trading creates big scores', body: 'With free transfers, one player holding six 3s and three 2s against a partner with three 2s and six 1s wins all nine duels. The partner scores zero, though, and depends on the winner handing over the spare token of life.' },
      { title: 'One card breaks a promise', body: 'Cards are revealed together, but if a partner plays something other than agreed, the result stands. Every alliance plan rests on trust, so whoever joins two alliances at once can collect more than anyone else.' },
    ], columns: 1 },
    { type: 'p', text: 'There is **no dominant solo strategy**. Because you choose your opponents and can pass cards around, the game is about securing a partner who feeds you points and someone who will absorb your last cards. Avoiding the stranded card and last place matters before chasing first.' },
  ],
  similar: [
    { name: 'Goofspiel', players: '2+', alike: 'A classic in which players reveal number cards simultaneously and the higher wins; every card is eventually played.', differs: 'Everyone bids at once for prize cards, and there is no trading.' },
    { name: "Hol's der Geier (Raj)", players: '2–5', alike: 'Players with identical number sets reveal one card at a time; reading what the others will play is everything.', differs: 'Matching cards cancel out, and everyone plays at once rather than in pairs.' },
  ],
});

export const election = g1Game('election-game', 'main', round(2), [2], ['twoSidedPoker', 'hiddenWord', 'blackWhite'], {
  meta: {
    title: '대선 게임 규칙 — 더 지니어스 시즌1 2회전 메인 매치, 후보와 유권자의 선거전',
    description: '더 지니어스: 게임의 법칙 2회전 메인 매치 대선 게임의 규칙을 정리했어요. 5분의 후보 등록, 언제든 가능한 사퇴, 90분 유세와 30분마다 공개되는 지지율, 후보마다 20개의 선거자금 칩, 최다·최저 득표와 당선자 칩의 가넷 교환까지.',
    keywords: ['대선 게임', '대선게임', '더 지니어스 대선 게임', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 2회전'],
  },
  title: '대선 게임 — 더 지니어스 시즌1 2회전 메인 매치',
  name: '대선 게임',
  lead: '누구든 후보로 나설 수 있고, 나머지는 유권자가 돼요. 후보는 자기 이름이 붙은 칩 20개로 지지를 사고, 당선된 후보의 칩만 가넷이 돼요.',
  summary: '후보 등록, 90분 유세, 투표. 당선자의 칩만 가치가 생기는 선거판에서 누구 편에 서느냐의 게임이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 12명.',
      '**후보 칩**: 후보마다 자기만의 칩 20개를 받아 선거자금으로 써요.',
      '**시간**: 후보 등록 5분, 유세 90분.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '후보 등록', body: '게임 시작 전 5분 동안 누구나 대선 후보로 등록할 수 있어요. 등록하지 않은 사람은 자동으로 유권자예요.' },
      { title: '유세', body: '90분 동안 후보들이 선거 운동을 해요. 칩을 유권자에게 건네며 지지를 얻을 수 있어요.' },
      { title: '지지율 공개', body: '30분마다 후보별 지지율이 공개돼요.' },
      { title: '사퇴', body: '후보는 투표 전이라면 언제든 중도에 사퇴할 수 있어요.' },
      { title: '투표', body: '유세가 끝나면 투표를 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**최다 득표 후보**가 우승해요.',
      '**최저 득표 후보**가 탈락 후보가 돼요. 후보가 한 명뿐이라 그대로 당선되면, 우승자가 탈락 후보를 지명해요.',
      '게임이 끝나면 **당선된 후보의 칩**을 가진 사람은 칩 1개당 가넷 1개로 바꿔요. 떨어진 후보의 칩은 아무 가치가 없어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '칩 1개 = 가넷 1개라는 교환 비율은 나무위키 정리에 있고, 영문 위키백과는 "가넷으로 바뀐다"고만 적고 있어요.',
      '유권자끼리 칩을 주고받을 수 있는지, 투표가 비밀인지 같은 세부 사항은 확인하지 못해 뺐어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '대선 게임의 칩은 **조건부 약속어음**이에요. 같은 칩 다섯 개라도 그 후보가 이기면 가넷 다섯 개, 지면 0이에요. 그래서 유권자는 칩의 양보다 **"이 후보가 이길 것인가"**를 먼저 따지고, 후보는 칩을 뿌리는 것만으로는 표를 살 수 없어요.' },
    { type: 'cards', items: [
      { title: '지지율 공개가 만드는 쏠림', body: '30분마다 지지율이 공개되면, 앞서가는 후보의 칩이 더 믿을 만해 보여요. 유권자가 이길 쪽으로 옮기면 그 후보는 더 앞서가는 눈덩이 구조라, 첫 공개 전까지 지지를 모으는 것이 결정적이에요.' },
      { title: '후보는 몇 명이 적당할까', body: '후보로 나서면 우승 기회가 생기지만, 최저 득표가 되면 곧바로 데스 매치예요. 후보가 둘뿐이면 진 쪽이 바로 탈락 후보가 돼요. 사퇴가 언제든 가능하니, 판세가 기울면 물러나 유권자가 되는 것도 생존 수단이에요.' },
      { title: '이긴 편 유권자의 함정', body: '생명의 징표는 우승자 중심으로 나뉘어서, 이긴 후보를 찍은 유권자라도 안전이 보장되지는 않아요. 많은 칩을 받은 유권자는 가넷이 늘어나는 만큼 다른 사람의 견제를 받기도 쉬워요.' },
    ], columns: 1 },
    { type: 'p', text: '정해진 필승법은 없지만, **초반에 다수 연합을 묶는 쪽이 압도적으로 유리한** 게임이에요. 자금을 아끼면서 이길 후보에 일찍 붙는 유권자가 가장 적은 위험으로 가장 많은 가넷을 챙길 수 있어요.' },
  ],
  similar: [
    { name: '디플로머시 (Diplomacy)', players: '7명', alike: '정해진 규칙보다 협상과 약속, 배신이 승부를 가르는 대표적인 보드게임이에요.', differs: '디플로머시는 지도 위 군대를 움직이는 전쟁 게임이고, 선거나 득표는 없어요.' },
    { name: '코스믹 인카운터 (Cosmic Encounter)', players: '3–5명', alike: '대결마다 다른 사람들을 내 편으로 초대하고, 이긴 편에 선 사람이 보상을 나눠 받아요.', differs: '외계 종족마다 특수 능력이 있고, 투표 대신 카드 대결로 승부를 내요.' },
  ],
}, {
  meta: {
    title: 'The Election Game rules — The Genius season 1, round 2 main match',
    description: 'The rules of the Election Game (대선 게임) from The Genius: Rules of the Game: five minutes to stand, withdrawal at any time, 90 minutes of campaigning with polls every 30 minutes, 20 personal chips per candidate, most and fewest votes, and only the winner’s chips turning into garnets.',
    keywords: ['The Genius Election Game', 'The Genius Rules of the Game', '더 지니어스 대선 게임', 'The Genius season 1'],
  },
  title: 'The Election Game — The Genius season 1, round 2 main match',
  name: 'The Election Game (대선 게임)',
  lead: 'Anyone may stand; everyone else votes. Candidates buy support with 20 chips of their own, and only the winner’s chips turn into garnets.',
  summary: 'Registration, a 90-minute campaign and a vote, where only the winner’s chips are worth anything: picking a side is the game.',
  setup: [
    { type: 'list', items: [
      '**Players**: 12.',
      '**Chips**: each candidate receives 20 chips of their own as campaign funds.',
      '**Time**: five minutes to register, 90 minutes of campaigning.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Register', body: 'For five minutes before the game anyone may register as a candidate; everyone else is a voter.' },
      { title: 'Campaign', body: 'Candidates campaign for 90 minutes and may hand chips to voters for support.' },
      { title: 'Polls', body: 'Each candidate’s support is announced every 30 minutes.' },
      { title: 'Withdraw', body: 'A candidate may drop out at any point before the vote.' },
      { title: 'Vote', body: 'When campaigning ends, everyone votes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The candidate with **the most votes** wins.',
      '**The fewest votes** makes a candidate the elimination candidate; if a lone candidate wins unopposed, the winner names one.',
      'Afterwards each chip of **the winning candidate** converts to a garnet; a losing candidate’s chips are worthless.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The one-chip-one-garnet rate comes from the fan wiki; English Wikipedia says only that the chips convert to garnets.',
      'Whether voters could trade chips among themselves, or whether the ballot was secret, could not be confirmed and is left out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The chips are **conditional IOUs**: five chips are five garnets if that candidate wins and nothing if not. Voters ask "will this candidate win?" before "how many chips?", so a candidate cannot buy votes with chips alone.' },
    { type: 'cards', items: [
      { title: 'Polls create a bandwagon', body: 'Each poll makes the leader’s chips look safer, voters drift to the likely winner, and the leader pulls further ahead; support gathered before the first poll is decisive.' },
      { title: 'How many candidates?', body: 'Standing gives a chance to win, but the fewest votes means the death match, and with only two candidates the loser goes straight there. Since withdrawing is always allowed, stepping back to become a voter is a way to survive.' },
      { title: 'The winning voter’s trap', body: 'Tokens of life flow through the winner, so even a voter who backed the winner is not guaranteed safety, and a voter paid many chips gains garnets — and attention — at the same time.' },
    ], columns: 1 },
    { type: 'p', text: 'There is no fixed winning line, but **whoever binds a majority early is hugely favoured**. A voter who joins the likely winner early, without demanding much, collects garnets at the least risk.' },
  ],
  similar: [
    { name: 'Diplomacy', players: '7', alike: 'The classic where negotiation, promises and betrayal decide more than the rules.', differs: 'It is a war game of armies on a map, with no elections.' },
    { name: 'Cosmic Encounter', players: '3–5', alike: 'Players invite allies to each encounter and those on the winning side share the reward.', differs: 'Alien powers and card duels replace votes.' },
  ],
});

export const feastFamine = g1Game('feast-and-famine', 'main', round(3), [3], ['heavy13', 'piggyBank', 'blackWhite'], {
  meta: {
    title: '풍요와 기근 규칙 — 더 지니어스 시즌1 3회전 메인 매치, 빵 6개와 3개를 나누는 땅 고르기',
    description: '더 지니어스: 게임의 법칙 3회전 메인 매치 풍요와 기근의 규칙을 정리했어요. 빵 6개의 풍요의 땅과 3개의 기근의 땅, 똑같이 나누고 남은 빵은 회수, 이름이 적힌 교환권 5장과 가넷으로 사는 추가 교환권, 5라운드와 빵 3개당 가넷 1개까지.',
    keywords: ['풍요와 기근', '더 지니어스 풍요와 기근', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 3회전'],
  },
  title: '풍요와 기근 — 더 지니어스 시즌1 3회전 메인 매치',
  name: '풍요와 기근',
  lead: '라운드마다 빵 6개가 있는 풍요의 땅과 3개뿐인 기근의 땅 중 하나로 가요. 빵은 온 사람끼리 똑같이 나누고, 나누어떨어지지 않는 빵은 주최 측이 가져가요.',
  summary: '사람이 몰리면 빵이 사라지는 두 개의 땅. 교환권 다섯 장을 언제, 어디에 쓰느냐의 눈치 게임이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 11명.',
      '**땅**: 빵 6개의 "풍요의 땅", 빵 3개의 "기근의 땅".',
      '**교환권**: 한 사람당 자기 이름이 적힌 티켓 교환권 5장. 모자라면 교환소에서 가넷 1개로 1장을 더 살 수 있어요.',
      '**진행**: 라운드당 15분, 모두 5라운드. 교환소는 한 사람당 한 번에 30초까지 쓸 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '땅 고르기', body: '교환권을 써서 가고 싶은 땅을 골라요. 교환권은 라운드마다 나눠 써도, 한 라운드에 몰아 써도, 한 장도 안 써도 돼요.' },
      { title: '빵 나누기', body: '라운드가 끝나면 각 땅의 빵을 그 땅을 고른 사람들에게 똑같이 나눠요. 나누고 남는 빵은 주최 측이 회수해요.' },
      { title: '결과 공개', body: '라운드마다 각 땅에 몇 명이 갔는지만 공개돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드 뒤 **빵이 가장 많은 사람**이 우승해요.',
      '**빵이 가장 적은 사람**이 탈락 후보가 돼요. 영문 위키백과 정리에는 최하위가 동률이면 우승자가 정한다고 적혀 있어요.',
      '모은 빵은 3개당 가넷 1개로 바꿔요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '받은 빵은 다른 사람에게 주거나 바꿀 수 없어요.',
      '한 라운드에 교환권 여러 장을 같은 땅에 냈을 때 몫을 어떻게 세는지는 확인한 규칙 정리에 자세히 나와 있지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '먼저 숫자를 보면 이 게임의 성격이 보여요. 빵은 **나누어떨어지는 만큼만** 받으니, 풍요의 땅은 1명이면 6개, 2명이면 3개, 3명이면 2개, 4–6명이면 1개, **7명부터는 0개**예요. 기근의 땅은 1명이면 3개, 2–3명이면 1개, 4명부터는 0개예요.' },
    { type: 'table', head: ['간 사람 수', '1', '2', '3', '4', '5', '6', '7+'], rows: [
      ['풍요의 땅 (빵 6)', '6', '3', '2', '1', '1', '1', '0'],
      ['기근의 땅 (빵 3)', '3', '1', '1', '0', '0', '0', '0'],
    ] },
    { type: 'cards', items: [
      { title: '모두가 같은 생각을 하면 모두 굶는다', body: '혼자 풍요의 땅에 가면 6개지만, 모두 그걸 노리면 빵이 0이 돼요. 남이 가지 않을 곳을 고르는 이른바 **소수파 게임**이라, 상대의 예상을 한 단계 더 읽어야 해요.' },
      { title: '협력하면 빵이 늘어난다', body: '한 라운드에 나올 수 있는 빵은 최대 9개예요. 서로 순번을 정해 한 명씩 풍요의 땅을 독차지하면 낭비 없이 빵을 나눌 수 있지만, 그 약속을 어기고 끼어드는 사람이 생기면 둘 다 3개로 줄어요.' },
      { title: '교환권 다섯 장의 타이밍', body: '교환권을 쓰지 않은 라운드는 빵을 받지 못해요. 공개되는 건 사람 수뿐이라, 다른 사람의 남은 교환권을 추측하면 사람이 적을 라운드를 노릴 수 있어요. 가넷으로 산 추가 교환권은 빵 3개가 가넷 1개라 본전을 찾기 어려워요.' },
    ], columns: 1 },
    { type: 'p', text: '혼자 정답을 찾는 **우월 전략은 없어요.** 다른 사람과 순번을 맞춰 빵을 낭비 없이 나누는 연합이 가장 강하고, 그 약속이 지켜지는지 사람 수 공개로 감시하는 게임이에요.' },
  ],
  similar: [
    { name: '파이러츠 코브 (Pirate\'s Cove)', players: '3–5명', alike: '모두가 몰래 갈 곳을 정하고 동시에 공개해요. 같은 곳에 여럿이 몰리면 손해를 보는 구조예요.', differs: '몰린 사람끼리는 전투로 승부를 내고, 배를 키우는 성장 요소가 있어요.' },
    { name: '젝스 님트 (6 nimmt!)', players: '2–10명', alike: '모두가 동시에 카드를 내고, 다른 사람의 선택에 따라 결과가 크게 바뀌어요. 남들이 어디로 갈지 읽는 게 핵심이에요.', differs: '벌점을 피하는 게임이고, 공유된 자원을 나누는 구조는 아니에요.' },
  ],
}, {
  meta: {
    title: 'Feast and Famine rules — The Genius season 1, round 3 main match',
    description: 'The rules of Feast and Famine (풍요와 기근) from The Genius: Rules of the Game: a land of six loaves and a land of three, equal shares with the remainder taken away, five named tickets plus extras for a garnet, five rounds, and three loaves to a garnet.',
    keywords: ['The Genius Feast and Famine', 'Abundance and Famine', 'The Genius Rules of the Game', '더 지니어스 풍요와 기근'],
  },
  title: 'Feast and Famine — The Genius season 1, round 3 main match',
  name: 'Feast and Famine (풍요와 기근)',
  lead: 'Each round choose the Land of Plenty, with six loaves, or the Land of Famine, with three. Loaves are shared equally among those who come; whatever does not divide evenly is taken away.',
  summary: 'Two lands where crowds make bread vanish: a guessing game about when, and where, to spend five tickets.',
  setup: [
    { type: 'list', items: [
      '**Players**: 11.',
      '**Lands**: the Land of Plenty (6 loaves) and the Land of Famine (3 loaves).',
      '**Tickets**: five tickets bearing your name; an extra costs a garnet at the exchange.',
      '**Pace**: five rounds of 15 minutes; the exchange allows 30 seconds per visit.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose a land', body: 'Use tickets to go where you want; spread them over the rounds, spend them all at once, or skip rounds entirely.' },
      { title: 'Share the bread', body: 'Each land’s loaves are split equally among those who chose it; the remainder goes back to the hosts.' },
      { title: 'Count', body: 'After each round only the number of visitors to each land is announced.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After five rounds **the most bread** wins.',
      '**The least bread** becomes the elimination candidate; English Wikipedia adds that the winner breaks a tie for last.',
      'Every three loaves convert to one garnet.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Bread cannot be traded or given away.',
      'How several tickets in the same land in one round were counted is not spelled out in the rule summaries checked.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The numbers explain the game. Only whole shares are paid, so Plenty gives 6 to one visitor, 3 each to two, 2 to three, 1 to four to six, and **nothing to seven or more**; Famine gives 3 to one, 1 each to two or three, and nothing to four or more.' },
    { type: 'table', head: ['Visitors', '1', '2', '3', '4', '5', '6', '7+'], rows: [
      ['Plenty (6 loaves)', '6', '3', '2', '1', '1', '1', '0'],
      ['Famine (3 loaves)', '3', '1', '1', '0', '0', '0', '0'],
    ] },
    { type: 'cards', items: [
      { title: 'If everyone thinks alike, everyone starves', body: 'Alone in Plenty you get six; if everyone tries it, nobody eats. It is a **minority game**: you need to guess what the others guess.' },
      { title: 'Cooperation makes more bread', body: 'A round can pay out at most nine loaves. Taking turns to have Plenty to yourself wastes nothing, but one gate-crasher cuts both shares to three.' },
      { title: 'Timing five tickets', body: 'Rounds without a ticket pay nothing. Only head-counts are public, so estimating others’ remaining tickets points to quiet rounds. A bought ticket rarely pays back, as three loaves make only one garnet.' },
    ], columns: 1 },
    { type: 'p', text: '**No solo strategy dominates.** The strongest play is an alliance that rotates the lands without waste, policing its promises through the visitor counts.' },
  ],
  similar: [
    { name: "Pirate's Cove", players: '3–5', alike: 'Everyone secretly picks a destination and reveals at once; crowding the same place costs you.', differs: 'Crowded players fight it out, and ships are upgraded over the game.' },
    { name: '6 nimmt!', players: '2–10', alike: 'Simultaneous card choices whose results hinge on what everyone else picks.', differs: 'It is about avoiding penalty points, not sharing a resource.' },
  ],
});

export const zombie = g1Game('zombie-game', 'main', round(4), [4], ['hiddenWord', 'russianRoulette', 'twoSidedPoker'], {
  meta: {
    title: '좀비 게임 규칙 — 더 지니어스 시즌1 4회전 메인 매치, 숨은 좀비와 터치·치료제',
    description: '더 지니어스: 게임의 법칙 4회전 메인 매치 좀비 게임의 규칙을 정리했어요. 비밀리에 정해지는 최초 좀비 2명과 인간 8명, 30분씩 3라운드, 공개 1:1 터치와 결과, 터치하지 않으면 좀비, 10분 안에 먹어야 하는 치료제, 인간 수에 따른 우승과 탈락 후보까지.',
    keywords: ['좀비 게임', '좀비게임', '더 지니어스 좀비 게임', '더 지니어스 시즌1', '지니어스 게임의 법칙', '더 지니어스 4회전'],
  },
  title: '좀비 게임 — 더 지니어스 시즌1 4회전 메인 매치',
  name: '좀비 게임',
  lead: '열 명 중 두 명은 처음부터 좀비예요. 사람끼리 손을 맞대면 점수가 오르지만, 상대가 좀비라면 나도 좀비가 돼요. 누가 좀비인지는 아무도 알려 주지 않아요.',
  summary: '터치할수록 점수가 오르고, 터치할수록 감염될 위험도 커지는 숨은 좀비 찾기.',
  setup: [
    { type: 'list', items: [
      '**인원**: 10명. 추첨으로 **최초 좀비 2명**과 인간 8명을 정하고, 각자의 정체는 공개하지 않아요.',
      '**진행**: 한 라운드 30분, 모두 3라운드.',
      '**치료제**: 모두 1개씩 받아요. 가넷 5개로 더 살 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '터치', body: '메인 홀에서 다른 플레이어와 공개적으로 1:1 터치를 해요. 라운드당 횟수 제한은 없어요. 결과는 전체에 알리지 않아요.' },
      { title: '터치 결과', body: '좀비와 좀비는 아무 일도 없어요. 좀비와 인간이면 인간이 좀비가 돼요. 인간과 인간이면 두 사람 모두 승점 1점을 얻어요.' },
      { title: '치료제', body: '인간이 좀비와 터치해 좀비가 됐다면, 그 라운드 안에서 터치 후 10분 이내에 치료제를 먹으면 다시 인간이 돼요.' },
      { title: '라운드 종료', body: '한 라운드 동안 한 번도 터치하지 않은 인간은 자동으로 좀비가 돼요. 라운드가 끝나면 인간 수와 좀비 수만 공개돼요. 누가 무엇인지, 인간의 승점이 몇인지는 알려 주지 않아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**인간이 0명**이면 최초 좀비 2명이 공동 우승해 각각 가넷 3개를 받고, 둘이 의논해 탈락 후보 1명을 정해요.',
      '**인간이 남았고 승점에 차이가 있으면** 승점이 가장 많은 인간이 우승해 승점만큼 가넷을 받고, 승점이 가장 적은 인간이 탈락 후보가 돼요.',
      '**남은 인간의 승점이 모두 같으면** 인간 전원이 공동 우승하고, 좀비 중에서 탈락 후보 1명을 정해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '치료제는 터치로 감염된 경우에만 효과가 있어요. 최초 좀비이거나, 터치를 하지 않아 좀비가 된 경우에는 먹어도 인간이 되지 않아요.',
      '같은 상대와의 터치 제한은 두 출처가 달라요. 나무위키 정리는 게임 전체에서 한 번, 영문 위키백과는 라운드당 한 번이라고 적고 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '좀비 게임은 **정보가 거의 공개되지 않는 감염 게임**이에요. 터치 결과는 당사자만 알고, 라운드 끝에 인원수만 공개돼요. 그래서 "몇 명이 감염됐나"라는 숫자 하나로 누가 거짓말을 하는지 추리해야 해요.' },
    { type: 'cards', items: [
      { title: '인간끼리의 동점 연합', body: '인간의 승점이 모두 같으면 인간 전원이 공동 우승하고, 탈락 후보는 좀비 중에서 나와요. 그래서 서로를 믿을 수 있는 인간들이 **똑같은 횟수만큼 서로 터치하는 것**이 가장 안전한 전략이에요. 반대로 누군가 몰래 한 번 더 터치하면 그 사람만 단독 우승이 돼요.' },
      { title: '감염된 좀비의 처지', body: '보상은 최초 좀비 두 명만 받아요. 중간에 감염된 좀비는 인간이 전멸해도 얻는 게 없고, 인간이 동점으로 끝나면 탈락 후보로 지목될 수 있어요. 감염된 사람에게는 정체를 숨기고 인간 편에 남는 척하거나, 치료제로 되돌아오는 것이 중요해요.' },
      { title: '치료제는 거짓말의 도구', body: '치료제를 먹으면 다시 인간이 되니, 좀비와의 터치가 반드시 감염으로 이어지지는 않아요. 이 때문에 인원수 공개만으로는 누가 감염됐는지 확정하기 어렵고, 좀비는 "나는 치료제를 먹었다"는 말로 의심을 피할 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '최초 좀비 입장에서는 인간을 하나씩 감염시켜 전멸을 노려야 하지만, 30분 동안 한 번도 터치하지 않은 인간은 저절로 좀비가 되기 때문에 인간도 마냥 숨을 수 없어요. **우월 전략은 없고**, 믿을 수 있는 소수끼리만 터치하는 폐쇄적인 연합이 가장 강한 구조예요.' },
  ],
  similar: [
    { name: '한밤의 늑대인간 (One Night Ultimate Werewolf)', players: '3–10명', alike: '숨겨진 정체를 가진 사람이 섞여 있고, 대화와 추리로 누가 적인지 찾아내요.', differs: '감염이 퍼지지 않고, 한 번의 밤과 투표로 끝나요.' },
    { name: '배틀스타 갤럭티카 (Battlestar Galactica: The Board Game)', players: '3–6명', alike: '숨은 배신자가 있고, 게임 도중 새로 배신자 편이 되는 사람이 생겨요. 감염되듯 편이 바뀌는 긴장감이 비슷해요.', differs: '모두가 함께 위기를 넘기는 협력 게임이 바탕이고, 훨씬 길고 복잡해요.' },
  ],
}, {
  meta: {
    title: 'The Zombie Game rules — The Genius season 1, round 4 main match',
    description: 'The rules of the Zombie Game (좀비 게임) from The Genius: Rules of the Game: two secret starting zombies among ten, three 30-minute rounds of public one-on-one touches, turning into a zombie for not touching, a cure within ten minutes, and how the number of humans left decides the winner.',
    keywords: ['The Genius Zombie Game', 'The Genius Rules of the Game', '더 지니어스 좀비 게임', 'The Genius season 1'],
  },
  title: 'The Zombie Game — The Genius season 1, round 4 main match',
  name: 'The Zombie Game (좀비 게임)',
  lead: 'Two of the ten players start as zombies. Humans who touch hands both score, but touching a zombie makes you one — and no one is told who is what.',
  summary: 'Every touch scores, and every touch risks infection: a hunt for hidden zombies.',
  setup: [
    { type: 'list', items: [
      '**Players**: 10; a draw makes **two starting zombies** and eight humans, identities kept secret.',
      '**Pace**: three rounds of 30 minutes.',
      '**Cure**: one each; more cost 5 garnets.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Touch', body: 'Players touch one-on-one, openly, in the main hall, as often as they like; results are not announced.' },
      { title: 'Results', body: 'Zombie and zombie: nothing. Zombie and human: the human becomes a zombie. Human and human: both score a point.' },
      { title: 'Cure', body: 'A human infected by a touch becomes human again by taking a cure within 10 minutes, in the same round.' },
      { title: 'End of round', body: 'A human who touched no one during the round becomes a zombie. Only the numbers of humans and zombies are announced — not who, and not anyone’s score.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**No humans left**: the two starting zombies share the win, take 3 garnets each and choose the elimination candidate together.',
      '**Humans left, scores differ**: the top-scoring human wins garnets equal to their points; the lowest-scoring human is the candidate.',
      '**Humans left, all tied**: every human shares the win, and a zombie is chosen as the candidate.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The cure works only on infection by touch: not for starting zombies, nor for anyone turned for not touching.',
      'The sources differ on repeat touches: the fan wiki says a pair may touch once in the whole game, English Wikipedia once per round.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is an **infection game with almost no public information**: only those involved know a touch’s result, and only head-counts are announced, so one number — how many were infected — is all there is to catch a liar.' },
    { type: 'cards', items: [
      { title: 'The humans’ tie alliance', body: 'If every surviving human has the same score, they all win and the candidate comes from the zombies. Humans who trust each other should **touch one another the same number of times**; one secret extra touch, though, makes that player the sole winner.' },
      { title: 'The infected zombie’s plight', body: 'Only the two starting zombies are rewarded. Infected players gain nothing if the humans fall and become candidates if the humans tie, so they hide it, stay with the humans or use a cure.' },
      { title: 'The cure as a cover story', body: 'Because a cure undoes infection, a zombie touch does not always show up in the counts, and a zombie can deflect suspicion with "I took my cure."' },
    ], columns: 1 },
    { type: 'p', text: 'The starting zombies must infect humans one by one, while humans cannot simply hide, since a round without a touch infects them anyway. **No strategy dominates**; a closed alliance of a few trusted humans is the strongest shape.' },
  ],
  similar: [
    { name: 'One Night Ultimate Werewolf', players: '3–10', alike: 'Hidden identities among the players, found through talk and deduction.', differs: 'Nothing spreads; one night and one vote end it.' },
    { name: 'Battlestar Galactica: The Board Game', players: '3–6', alike: 'Hidden traitors, with players switching to the traitors’ side mid-game, like an infection.', differs: 'It is built on cooperative crisis management and is far longer.' },
  ],
});
