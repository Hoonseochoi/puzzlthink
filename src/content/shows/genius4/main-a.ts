// 더 지니어스: 그랜드 파이널, main matches of rounds 1–6: 신분 교환, 호러 레이스, 오늘의 메뉴, 생선 가게, 충신과 역적, 가넷도둑.
import { g4Game, wiki4 } from './shared';

export const idExchange = g4Game({ slug: 'id-exchange', kind: 'main', ep: 1, related: ['blackWhite', 'indianPoker', 'hiddenWord'], check: 'wiki' }, {
  meta: {
    title: '신분 교환 규칙 — 더 지니어스 그랜드 파이널 1회전 메인매치, 사형수 카드를 넘겨라',
    description: '더 지니어스: 그랜드 파이널 1회전 메인매치 신분 교환의 규칙을 정리했어요. 시민 7·귀족 5·사형수 1장, 블랙 라이트로만 보이는 신분, 공식 교환과 비공식 교환, 귀족 +1·사형수 +2·마지막 사형수 교환 +3점, 100분 뒤 사형수 보유자가 탈락후보가 되는 구조와 승부처까지.',
    keywords: ['신분 교환', '신분교환', '더 지니어스 신분 교환', '그랜드 파이널 1회전', '더 지니어스 4', '더지니어스 메인매치'],
  },
  title: '신분 교환 — 더 지니어스: 그랜드 파이널 1회전 메인매치',
  name: '신분 교환',
  lead: '겉모습이 똑같은 신분 카드 13장을 100분 동안 서로 바꿔요. 점수는 교환에서 나오지만, 끝날 때 사형수 카드를 쥔 사람이 탈락후보가 돼요.',
  summary: '시민·귀족·사형수 카드를 공식·비공식으로 바꾸며 점수를 모으고, 마지막에 사형수를 쥐지 않아야 하는 13인 교환 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 13명 전원.',
      '**신분 카드 13장**: 시민 7장, 귀족 5장, 사형수 1장. 겉모습이 모두 같고, 교환 테이블의 블랙 라이트에 비춰야만 신분이 보여요.',
      '**시간**: 100분.',
      '**시작**: 제비뽑기로 한 장씩 받고, 한 명씩 교환 테이블에서 자기 신분을 확인해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '공식 교환', body: '두 사람이 딜러가 있는 교환 테이블에서 카드를 맞바꿔요. 바꾼 뒤 새로 받은 카드의 신분을 블랙 라이트로 확인할 수 있어요. 같은 사람과는 한 번만 공식 교환할 수 있고, 원하지 않는 교환은 거절해도 돼요.' },
      { title: '비공식 교환', body: '장소와 횟수 제한 없이 어디서든 카드를 바꿀 수 있어요. 대신 받은 카드의 신분을 확인할 수 없고, 점수도 생기지 않아요.' },
      { title: '점수 계산', body: '점수는 공식 교환에서만 생겨요. 귀족 카드를 시민과 바꾸면 귀족이었던 사람이 1점, 사형수 카드를 시민과 바꾸면 사형수였던 사람이 2점을 얻어요. 시민이었던 사람은 점수를 얻지 못해요.' },
      { title: '마지막 사형수 보너스', body: '게임이 끝나기 전 마지막으로 사형수 카드를 공식 교환으로 넘긴 사람은, 받은 카드가 무엇이든 3점을 더 얻어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '100분이 지나면 끝나요. 이때 **사형수 카드를 가진 사람이 탈락후보**가 돼요.',
      '점수가 가장 높은 사람이 우승자예요. 단독 우승이면 생명의 징표를 2개 받아, 하나를 다른 사람(탈락후보 제외)에게 줄 수 있어요.',
      '탈락후보를 포함해 모두 **점수 3점마다 가넷 1개**를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '카드에 표시를 해 구별하는 것은 금지예요. 신분은 공식 교환 때 블랙 라이트로만 확인할 수 있어요.',
      '귀족끼리, 시민끼리, 귀족과 사형수가 바꾸는 공식 교환은 점수가 생기지 않아요. 단, 사형수를 넘기는 교환은 마지막 사형수 보너스(3점)의 대상이 될 수 있어요.',
      '비공식 교환 때 카드를 먼저 받고 나중에 돌려주는 식의 시차 교환이 허용되는지는 규칙에 따로 적혀 있지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '점수가 생기는 조건은 하나예요. **귀족이나 사형수 카드가 시민에게 건너갈 때**만 점수가 나와요. 시민은 점수를 내지 못하는 대신 "점수를 만들어 주는 상대"예요. 귀족 카드를 받은 시민은 이제 귀족이 되어 다른 시민에게 넘기며 1점을 벌 수 있으니, 귀족 카드 5장은 사람들 사이를 돌며 계속 점수를 만들어요.' },
    { type: 'cards', items: [
      { title: '한계는 "같은 사람과 한 번"', body: '13명이 만들 수 있는 공식 교환 짝은 78쌍뿐이고, 그중 점수가 나는 짝은 "그 순간 귀족·사형수와 시민"인 경우뿐이에요. 누구와 언제 교환할지 순서를 짜는 것이 점수 총량을 좌우해요. 다수가 순서를 미리 맞추면 거의 모두가 고르게 점수를 얻는 그림도 가능해요.' },
      { title: '사형수는 뜨거운 감자', body: '사형수를 시민에게 넘기면 2점이지만, 받는 쪽은 탈락후보 위험을 떠안아요. 공식 교환은 받기 전에는 신분을 볼 수 없으니, 받는 사람은 상대의 말을 믿어야 해요. 그리고 마지막에 넘긴 사람에게 3점이 붙기 때문에, 끝으로 갈수록 사형수를 넘기려는 쪽의 동기는 커지고 받아 줄 사람은 줄어요.' },
      { title: '비공식 교환은 신뢰 장치', body: '비공식 교환은 점수도 확인도 없지만 횟수 제한이 없어요. 서로 확인한 카드를 돌려 쓰거나, 누군가에게 모르는 카드를 떠넘기는 수단이 될 수 있어요. 받은 카드를 확인할 수 없다는 점이 곧 배신의 여지예요.' },
    ], columns: 1 },
    { type: 'p', text: '탈락후보만 피하는 가장 안전한 길은 **교환을 아예 하지 않는 것**이에요. 처음 받은 카드가 시민이나 귀족이면 남이 동의 없이 사형수를 줄 방법이 없거든요. 하지만 그러면 점수와 가넷을 하나도 얻지 못하고, 이 시즌은 다음 회전부터 가넷이 순위를 정하는 가넷매치가 이어져요. 그래서 "얼마나 위험을 지고 얼마나 벌 것인가"를 고르는 게임이 돼요.' },
  ],
  similar: [
    { name: '도둑잡기 (Old Maid)', players: '2–8명', alike: '한 장뿐인 나쁜 카드(조커)를 끝까지 쥐고 있는 사람이 지는 카드 놀이예요. 사형수 카드와 같은 역할이에요.', differs: '도둑잡기는 상대 손에서 무작위로 뽑는 운의 게임이고, 점수나 교환 협상은 없어요.' },
    { name: '피트 (Pit)', players: '3–8명', alike: '모두가 동시에 소리치며 카드를 맞바꾸는 1900년대 초의 교환 게임이에요. 무엇을 받을지 모른 채 교환하는 긴장감이 비슷해요.', differs: '피트는 같은 상품 카드를 모으면 이기는 게임이고, 피해야 할 카드나 한 번만 교환하는 제한이 없어요.' },
  ],
}, {
  meta: {
    title: 'ID Exchange rules — The Genius: Grand Final round 1 main match',
    description: 'The rules of ID Exchange (신분 교환), round 1 main match of The Genius: Grand Final: 7 commoners, 5 nobles and 1 convict that only a black light reveals, official and unofficial trades, noble +1, convict +2 and the last convict hand-off +3, and the convict holder becoming the elimination candidate after 100 minutes.',
    keywords: ['ID Exchange', 'The Genius Grand Final', 'The Genius season 4', '신분 교환'],
  },
  title: 'ID Exchange — The Genius: Grand Final round 1 main match',
  name: 'ID Exchange (신분 교환)',
  lead: 'Thirteen identical-looking identity cards change hands for 100 minutes. Trades earn points, but whoever holds the convict card at the end becomes the elimination candidate.',
  summary: 'A thirteen-player trading game: swap commoner, noble and convict cards officially or unofficially for points, and don’t be holding the convict at the end.',
  setup: [
    { type: 'list', items: [
      '**Players**: all 13.',
      '**13 identity cards**: 7 commoners, 5 nobles, 1 convict. They look identical; only the black light at the trading table shows which is which.',
      '**Time**: 100 minutes.',
      '**Start**: everyone draws a card at random and checks it at the trading table.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Official trades', body: 'Two players swap cards at the dealer’s trading table and may check the new card under the black light. Each pair may trade officially only once, and anyone may refuse a trade.' },
      { title: 'Unofficial trades', body: 'Cards can be swapped anywhere, any number of times, but the new card cannot be checked and no points are scored.' },
      { title: 'Scoring', body: 'Only official trades score. Trading a noble to a commoner gives the former noble 1 point; trading the convict to a commoner gives the former convict 2 points. Commoners score nothing.' },
      { title: 'Last convict bonus', body: 'Whoever last trades the convict away in an official trade before time runs out gets 3 extra points, whatever card they receive.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After 100 minutes, **the convict holder becomes the elimination candidate**.',
      'The highest score wins; a sole winner gets two tokens of life and may pass one to anyone but the candidate.',
      'Everyone, the candidate included, gets **one garnet per 3 points**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Marking cards is forbidden; identities can be seen only under the black light during an official trade.',
      'Official trades between two nobles, two commoners, or a noble and the convict score nothing, though handing off the convict can still earn the last-convict bonus.',
      'The rules did not say whether an unofficial trade may be done with a delay (take a card now, hand one back later).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Points come from one thing only: **a noble or the convict passing to a commoner**. Commoners cannot score but are the people who let others score. A commoner who receives a noble becomes a noble and can pass it on for a point, so the five nobles keep circulating and producing points.' },
    { type: 'cards', items: [
      { title: 'The limit: once per pair', body: 'Thirteen players form only 78 possible pairs, and only pairs that are noble/convict–commoner at that moment score. Ordering who trades with whom decides the total; a large group that plans the order can let almost everyone score evenly.' },
      { title: 'The convict is a hot potato', body: 'Passing the convict to a commoner earns 2, but the receiver takes on the risk, and since nobody sees a card before receiving it, the receiver must trust the giver’s word. With 3 extra points for the last hand-off, the urge to pass the convict grows near the end just as willing receivers vanish.' },
      { title: 'Unofficial trades run on trust', body: 'They score nothing and reveal nothing but are unlimited: a way to share known cards around, or to push an unknown card onto someone. Not being able to check what you got is exactly where betrayal lives.' },
    ], columns: 1 },
    { type: 'p', text: 'The safest way to avoid candidacy is **not trading at all**: nobody can give you the convict without your consent. But that earns no points and no garnets just before a run of garnet matches, so the game becomes a choice of how much risk to carry for how much gain.' },
  ],
  similar: [
    { name: 'Old Maid', players: '2–8', alike: 'Whoever ends up holding the single bad card loses, the role the convict plays here.', differs: 'Old Maid is luck, drawing blindly from a neighbour, with no points or negotiation.' },
    { name: 'Pit', players: '3–8', alike: 'A loud open-trading card game from the early 1900s; you swap without knowing quite what you’ll get.', differs: 'In Pit you collect a full set of one commodity; there is no card to avoid and no once-per-pair limit.' },
  ],
});

export const horrorRace = g4Game({ slug: 'horror-race', kind: 'main', ep: 2, related: ['hitStay', 'piggyBank', 'gradation'], check: 'wiki' }, {
  meta: {
    title: '호러 레이스 규칙 — 더 지니어스 그랜드 파이널 2회전 가넷매치, 응원하는 캐릭터를 골인시켜라',
    description: '더 지니어스: 그랜드 파이널 2회전 가넷매치 호러 레이스의 규칙을 정리했어요. 뱀파이어·강시·구미호·미라·좀비 다섯 캐릭터, 응원할 둘을 숨기고 남은 코인으로 이동, 1·2·4칸 구역의 최다 코인, 동률이면 멈춤, 코인 포기로 순서 바꾸기, 1·2·3등 가넷 보상과 승부처까지.',
    keywords: ['호러 레이스', '호러레이스', '더 지니어스 호러 레이스', '그랜드 파이널 2회전', '가넷매치', '더 지니어스 4'],
  },
  title: '호러 레이스 — 더 지니어스: 그랜드 파이널 2회전 가넷매치',
  name: '호러 레이스',
  lead: '다섯 괴물이 트랙을 달려요. 응원할 두 캐릭터를 몰래 정한 뒤, 상자에서 뽑은 코인을 이동 구역에 놓아 원하는 캐릭터를 앞으로 보내요.',
  summary: '응원 캐릭터 둘을 숨기고, 무작위로 뽑은 코인을 1·2·4칸 구역에 배치해 레이스를 움직이는 가넷매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 12명. 추첨으로 1–12번 순서를 정해요.',
      '**캐릭터**: 뱀파이어, 강시, 구미호, 미라, 좀비. 출발점과 결승점 사이에 12칸이 있어, 결승점을 통과하려면 13칸을 가야 해요.',
      '**코인**: 모두 다섯 캐릭터의 코인을 한 개씩 받아요. 코인에 표시하거나 훼손하면 안 돼요.',
      '**가넷매치**: 이 회전은 보유 가넷으로 순위를 정하고, 결과 발표 전까지 가넷을 주고받을 수 없어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '응원 캐릭터 고르기', body: '한 명씩 딜러 룸에 들어가 응원할 캐릭터 두 개의 코인을 딜러에게 몰래 내요. 나머지 세 코인은 코인 상자에 넣어요. 모두 끝나면 상자에는 코인 36개가 모여요.' },
      { title: '코인 배치', body: '순서대로 상자에서 코인 세 개를 무작위로 뽑아(한 번에 또는 하나씩) 1칸·2칸·4칸 세 구역에 자유롭게 놓아요. 한 구역에 몰아도 되지만, 뽑은 코인은 그 차례에 모두 놓아야 해요.' },
      { title: '이동', body: '12명이 모두 놓으면 1칸 구역에서 코인이 가장 많은 캐릭터가 1칸, 이어서 2칸 구역의 최다 캐릭터가 2칸, 마지막으로 4칸 구역의 최다 캐릭터가 4칸 움직여요. 최다가 동률이면 그 캐릭터들은 움직이지 못하고 그다음으로 많은 캐릭터가 움직여요. 모두 같은 수면 아무도 움직이지 않아요.' },
      { title: '다음 라운드', body: '구역의 코인을 상자에 다시 넣고 같은 방식으로 반복해요.' },
      { title: '코인 포기', body: '자기 차례에 코인을 뽑는 대신 포기를 선언하면 다음 라운드에 마지막(12번째)으로 뽑게 되고, 바로 다음 사람이 다음 라운드의 1번이 돼요. 한 라운드에 한 명만 선언할 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 캐릭터가 결승점을 통과하는 즉시 레이스가 끝나요. 1칸 구역 이동에서 끝나면 2·4칸 구역은 움직이지 않아요.',
      '결승점에 가까운 순서로 2등, 3등을 정해요. 응원한 캐릭터가 **1등이면 가넷 3개, 2등이면 2개, 3등이면 1개**를 받아요. 두 캐릭터가 1·2등이면 5개예요.',
      '공동 2등이면 그 캐릭터 응원자는 모두 1개씩 받고 3등은 없어요. 공동 3등이면 각각 1개씩이에요.',
      '원래 가진 가넷을 합쳐 **가장 많은 사람이 우승자, 가장 적은 사람이 탈락후보**예요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '앞 사람이 이미 코인 포기를 선언했으면 그 라운드에는 포기할 수 없어요. 상자에 손을 넣어 보거나 코인을 뽑은 뒤에는 포기할 수 없어요.',
      '영문 위키백과 정리에 따르면, 코인 중 일부는 속에 쇠가 들어 있어 자석으로 구별할 수 있도록 만들어져 있었어요. 규칙 설명에서는 알려 주지 않은 장치예요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임의 첫 역설은 **많은 사람이 응원하는 캐릭터일수록 상자 속 코인이 적다**는 거예요. 응원 코인은 딜러에게 내고 나머지만 상자에 넣으니, 인기 캐릭터는 뽑힐 확률이 낮아요. 연합이 같은 캐릭터로 몰리면 오히려 그 캐릭터를 움직일 재료가 줄어요.' },
    { type: 'cards', items: [
      { title: '막는 쪽이 더 쉽다', body: '구역에서 최다가 동률이면 둘 다 멈춰요. 그래서 상대가 미는 캐릭터와 같은 수의 다른 코인을 놓기만 해도 그 이동을 지울 수 있어요. 특히 4칸 구역은 한 라운드 최대 이동량(1+2+4=7칸)의 절반 이상이라 견제가 몰리는 곳이에요.' },
      { title: '뒤 순서가 정보를 쥔다', body: '앞 사람들이 놓은 코인을 모두 보고 마지막에 놓는 사람이 구역의 승부를 결정하기 쉬워요. 코인 포기는 자기 코인을 하나도 쓰지 않는 대신 다음 라운드의 마지막 자리를 사는 장치예요. 연속된 번호끼리 연합하면 포기를 이어 받아 뒤 순서를 계속 차지할 수 있어요.' },
      { title: '공개되는 코인이 곧 단서', body: '라운드마다 구역에 놓인 코인은 모두 보이므로, 몇 라운드 지나면 상자에 어떤 캐릭터가 적게 남았는지 추리할 수 있어요. 적게 나오는 캐릭터가 곧 많은 사람이 응원하는 캐릭터예요.' },
    ], columns: 1 },
    { type: 'p', text: '가넷매치라 최종 순위는 이번 레이스 수입이 아니라 **원래 가넷 + 수입**으로 정해져요. 처음부터 가넷이 적은 사람은 2등이나 3등 보상만으로는 따라잡기 어려워, 1등 캐릭터를 맞히는 데 더 큰 위험을 걸 이유가 있어요.' },
  ],
  similar: [
    { name: '카멜 업 (Camel Up)', players: '2–8명', alike: '여러 낙타가 달리는 레이스에 돈을 걸고, 주사위로 낙타를 움직여요. 누가 이길지 예측하며 판을 조금씩 움직이는 구조가 같아요.', differs: '카멜 업은 주사위로 움직이고 베팅이 공개돼요. 호러 레이스는 코인을 어느 구역에 놓을지 직접 정하고 응원 캐릭터를 숨겨요.' },
    { name: '로열 터프 (Royal Turf)', players: '2–6명', alike: '경주마에 몰래 표를 걸고, 모두가 함께 말을 움직이는 라이너 크니치아의 경마 게임이에요. 남이 응원하는 말을 추리하는 재미가 비슷해요.', differs: '로열 터프는 주사위 결과로 어느 말을 얼마나 움직일지 고르고, 막기(동률 정지) 규칙은 없어요.' },
  ],
}, {
  meta: {
    title: 'Horror Race rules — The Genius: Grand Final round 2 garnet match',
    description: 'The rules of Horror Race (호러 레이스), round 2 garnet match of The Genius: Grand Final: five monsters, two secretly backed characters, coins drawn from a box and placed on the 1-, 2- and 4-step zones, ties that stop movement, giving up a draw to move last, and the 3-2-1 garnet payout.',
    keywords: ['Horror Race', 'The Genius Grand Final', 'garnet match', '호러 레이스'],
  },
  title: 'Horror Race — The Genius: Grand Final round 2 garnet match',
  name: 'Horror Race (호러 레이스)',
  lead: 'Five monsters race down a track. You secretly back two, then place coins drawn from a box on the movement zones to push your favourites forward.',
  summary: 'A garnet match: back two characters in secret and steer the race by placing randomly drawn coins on the 1-, 2- and 4-step zones.',
  setup: [
    { type: 'list', items: [
      '**Players**: 12, in an order drawn by lot.',
      '**Characters**: vampire, jiangshi, gumiho, mummy, zombie. Twelve spaces lie between start and finish, so passing the finish takes 13 steps.',
      '**Coins**: everyone gets one coin of each character; marking or damaging coins is forbidden.',
      '**Garnet match**: ranking is by garnets held, and garnets cannot change hands until the result.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Backing', body: 'In the dealer room each player secretly hands over the coins of the two characters they back and drops the other three into the coin box, which ends up holding 36 coins.' },
      { title: 'Placing', body: 'In turn, each player draws three coins at random and places them freely on the 1-, 2- and 4-step zones, all on one zone if they like, but all three that turn.' },
      { title: 'Moving', body: 'After all twelve, the character with the most coins on the 1-zone moves 1, then the 2-zone leader moves 2, then the 4-zone leader moves 4. Tied leaders stay put and the next-highest moves; if all are equal, nobody moves.' },
      { title: 'Next round', body: 'The zone coins go back in the box and play repeats.' },
      { title: 'Giving up', body: 'Instead of drawing you may give up your coins and draw last next round, the next player becoming first. Only one player per round may do so.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The race ends the moment a character passes the finish; if that happens on the 1-zone move, the other zones do not move.',
      'The next closest are 2nd and 3rd. Backing **1st pays 3 garnets, 2nd pays 2, 3rd pays 1**; backing 1st and 2nd pays 5.',
      'With a tie for 2nd, each tied character’s backers get 1 and there is no 3rd; a tie for 3rd pays 1 each.',
      'Counting garnets already held, **the most wins and the fewest becomes the elimination candidate**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'You cannot give up if someone earlier did so this round, nor after reaching into the box or drawing.',
      'According to English Wikipedia, some coins had steel cores and could be told apart with a magnet, a device the rule explanation did not mention.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The first paradox: **the more players back a character, the fewer of its coins are in the box**. Backed coins go to the dealer, so a popular character is drawn less, and an alliance that piles onto one character starves it of movement.' },
    { type: 'cards', items: [
      { title: 'Blocking is easier than pushing', body: 'Tied leaders don’t move, so matching a rival’s coins on a zone with another character cancels the move. The 4-zone is more than half of the 7 steps available per round, so blocking concentrates there.' },
      { title: 'Late seats hold the information', body: 'Whoever places last sees every coin and can usually settle a zone. Giving up spends nothing this round to buy the last seat next round, and consecutive seats in one alliance can pass that privilege along.' },
      { title: 'Revealed coins are clues', body: 'All placed coins are visible, so after a few rounds you can infer which characters are scarce in the box, and scarce means widely backed.' },
    ], columns: 1 },
    { type: 'p', text: 'As a garnet match, the ranking is **garnets held plus winnings**. Players who start low rarely catch up on 2nd- or 3rd-place payouts, which gives them a reason to gamble on the winner.' },
  ],
  similar: [
    { name: 'Camel Up', players: '2–8', alike: 'Bet on a race and nudge the runners as it goes.', differs: 'Camels move by dice and bets are public; here you choose which zone each coin goes to and your backing is hidden.' },
    { name: 'Royal Turf', players: '2–6', alike: 'Reiner Knizia’s horse race: secret bets, shared movement, reading what others back.', differs: 'Movement comes from dice choices, and there is no tie-blocks-movement rule.' },
  ],
});

export const todaysMenu = g4Game({ slug: 'todays-menu', kind: 'main', ep: 3, related: ['blackWhite', 'hitStay', 'piggyBank'], check: 'wiki' }, {
  meta: {
    title: '오늘의 메뉴 규칙 — 더 지니어스 그랜드 파이널 3회전 메인매치, 같은 메뉴 고른 인원 맞히기',
    description: '더 지니어스: 그랜드 파이널 3회전 메인매치 오늘의 메뉴의 규칙을 정리했어요. 짜장면·짬뽕·볶음밥 중 하나를 골라 같은 메뉴를 고른 인원을 예측, 1명 5점·2–3명 3점·4–6명 2점·7–10명 1점·11명 4점, 1분 예측 변경, 4라운드와 가넷 환산, 승부처까지.',
    keywords: ['오늘의 메뉴', '더 지니어스 오늘의 메뉴', '그랜드 파이널 3회전', '더 지니어스 4', '짜장면 짬뽕 볶음밥 게임'],
  },
  title: '오늘의 메뉴 — 더 지니어스: 그랜드 파이널 3회전 메인매치',
  name: '오늘의 메뉴',
  lead: '짜장면, 짬뽕, 볶음밥 중 하나를 고르고, 나와 같은 메뉴를 고른 사람이 모두 몇 명일지 맞혀요. 적게 겹칠수록 점수가 커요.',
  summary: '세 메뉴 중 하나를 숨겨 고르고, 같은 메뉴를 고른 인원 구간을 예측해 점수를 얻는 11인 심리 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 11명.',
      '**준비물**: 각자 짜장면·짬뽕·볶음밥 메뉴카드 3장과 카드박스 하나. 메뉴카드는 서로 바꿀 수 없어요.',
      '**예측 칸**: 인원 구간별로 다섯 칸이 있는 테이블.',
      '**라운드**: 4라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '메뉴 고르기 (20분)', body: '고른 메뉴카드가 맨 위에 오도록 카드박스에 넣고 뚜껑을 닫아요. 넣을 때 남에게 보여 줘도 되지만, 닫은 뒤에는 바꿀 수 없어요.' },
      { title: '예측', body: '나를 포함해 나와 같은 메뉴를 고른 사람이 몇 명일지 예측해, 카드박스를 해당 칸에 올려요.' },
      { title: '예측 변경 (1분)', body: '모두 올리고 나면 1분 동안 다른 사람의 예측을 보고 칸을 옮길 수 있어요. 박스를 들었다가 시간 안에 못 내려놓으면 원래 칸으로 돌아가요.' },
      { title: '공개', body: '박스를 차례로 열어 메뉴를 공개하고, 예측이 맞은 사람만 구간 점수를 받아요.' },
    ] },
    { type: 'table', head: ['같은 메뉴 인원 (본인 포함)', '1명', '2–3명', '4–6명', '7–10명', '11명'], rows: [['맞혔을 때 점수', '5점', '3점', '2점', '1점', '4점']] },
  ],
  win: [
    { type: 'list', items: [
      '4라운드 뒤 점수가 가장 높은 사람이 우승자, 가장 낮은 사람이 탈락후보예요. 단독 우승이면 생명의 징표 2개를 받아요.',
      '11명의 점수가 모두 같으면 점수를 지우고 1라운드부터 다시 해요.',
      '모두 **점수 4점마다 가넷 1개**를 받고, 16점부터는 1점마다 가넷이 1개씩 더 붙어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '예측 칸에 한 번 내려놓은 박스는 가져갈 수 없고, 메뉴도 바꿀 수 없어요.',
      '영문 위키백과 정리에 따르면 카드박스에는 알려 주지 않은 이중 바닥이 있어, 남에게 보여 준 카드와 실제로 위에 오는 카드가 다를 수 있었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '점수표가 이 게임의 전부예요. **혼자 고르면 5점, 전원이 같으면 4점**으로 양 끝이 가장 크고, 중간 구간은 1–3점이에요. 그런데 전원이 매번 같은 메뉴를 고르면 모두 16점으로 같아져 처음부터 다시 해야 하니, "다 같이 4점"이라는 쉬운 길은 막혀 있어요. 누군가는 꼴찌가 되어야 게임이 끝나는 구조예요.' },
    { type: 'cards', items: [
      { title: '메뉴보다 예측이 승부', body: '메뉴 자체에는 우열이 없어요. 점수는 오로지 인원 구간을 맞혔는지로 정해져요. 그래서 연합은 "누가 어떤 메뉴로 몇 명씩 나뉠지"를 미리 짜서 모두가 구간을 맞히게 하려 하고, 바깥 사람은 그 계획을 읽어 끼어들거나 깨뜨리려 해요.' },
      { title: '1분의 정보', body: '메뉴는 잠긴 뒤에도 예측은 1분 동안 바꿀 수 있어요. 남들이 어느 칸에 올렸는지가 곧 메뉴 분포의 단서예요. 예컨대 "1명" 칸에 박스를 올린 사람이 둘이면 둘 중 하나는 틀린 셈이에요. 늦게 움직이는 사람일수록 정보가 많아요.' },
      { title: '구간 경계의 위험', body: '3명과 4명, 6명과 7명 사이의 경계는 한 사람만 움직여도 넘어가요. 연합이 크면 한 명의 배신으로 여러 명이 한꺼번에 틀릴 수 있어, 경계에 딱 맞춘 계획일수록 깨지기 쉬워요.' },
    ], columns: 1 },
    { type: 'p', text: '지배 전략은 없어요. 다만 박스를 보여 주는 것은 허용되고 그 보여 준 모습이 진짜인지는 확인하기 어렵기 때문에, 결국 "누구의 말을 믿을 것인가"로 승부가 기울어요.' },
  ],
  similar: [
    { name: '허드 멘탈리티 (Herd Mentality)', players: '4–20명', alike: '같은 질문에 다수와 같은 답을 쓰면 점수를 받는 파티 게임이에요. 남들이 무엇을 고를지 읽는 것이 핵심이에요.', differs: '허드 멘탈리티는 다수에 들면 점수를 받고 혼자인 사람은 벌칙을 받아요. 오늘의 메뉴는 인원 구간을 맞히는 게임이고, 혼자인 것이 가장 큰 점수예요.' },
    { name: '스캐터고리즈 (Scattergories)', players: '2–6명', alike: '남과 겹치지 않는 답을 써야 점수를 받아, 다른 사람의 선택을 예측하는 감각이 필요해요.', differs: '스캐터고리즈는 단어를 떠올리는 게임이고, 예측을 공개하거나 바꾸는 단계가 없어요.' },
  ],
}, {
  meta: {
    title: 'Today’s Menu rules — The Genius: Grand Final round 3 main match',
    description: 'The rules of Today’s Menu (오늘의 메뉴), round 3 main match of The Genius: Grand Final: choose jajangmyeon, jjamppong or fried rice in secret and predict how many chose the same, 5/3/2/1/4 points by bracket, a one-minute change window, four rounds and the garnet conversion.',
    keywords: ['Today’s Menu', 'The Genius Grand Final', '오늘의 메뉴'],
  },
  title: 'Today’s Menu — The Genius: Grand Final round 3 main match',
  name: 'Today’s Menu (오늘의 메뉴)',
  lead: 'Pick jajangmyeon, jjamppong or fried rice, then predict how many players, you included, chose the same dish. The fewer you share with, the more it pays.',
  summary: 'An eleven-player mind game: pick a dish in secret and predict the size of your group.',
  setup: [
    { type: 'list', items: [
      '**Players**: 11.',
      '**Materials**: each player has three menu cards (jajangmyeon, jjamppong, fried rice) and a card box; cards cannot be exchanged.',
      '**Prediction table**: five spaces, one per group-size bracket.',
      '**Rounds**: 4.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose (20 minutes)', body: 'Put the chosen card on top in your box and close it. You may show others while doing so; once closed it cannot change.' },
      { title: 'Predict', body: 'Place your box on the space for how many players (you included) chose your dish.' },
      { title: 'Change (1 minute)', body: 'With every box placed, you have one minute to move yours after seeing the others. A box lifted but not set down in time returns to its original space.' },
      { title: 'Reveal', body: 'Boxes open in turn; correct predictions score their bracket.' },
    ] },
    { type: 'table', head: ['Same dish (including you)', '1', '2–3', '4–6', '7–10', '11'], rows: [['Points if right', '5', '3', '2', '1', '4']] },
  ],
  win: [
    { type: 'list', items: [
      'After four rounds the top score wins and the lowest becomes the candidate; a sole winner gets two tokens.',
      'If all eleven scores are equal, scores reset and the game restarts.',
      'Everyone gets **one garnet per 4 points**, plus one more per point from 16 up.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A box once placed cannot be taken back, and the dish cannot change.',
      'According to English Wikipedia, the boxes had an undisclosed false bottom, so the card shown to others might not be the one on top.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The score table is the game. **Alone pays 5 and all eleven pays 4**; the middle pays 1–3. But if everyone always matches, all reach 16 and the game restarts, so "all of us take 4" is blocked: somebody has to finish last.' },
    { type: 'cards', items: [
      { title: 'Prediction, not the dish', body: 'No dish is better; points depend only on the bracket. Alliances plan how many go to each dish so all predict right, and outsiders try to read the plan and break in.' },
      { title: 'The one-minute window', body: 'Dishes are locked but predictions can move. Where others placed their boxes reveals the distribution; two boxes on "1" means one of them is wrong. Late movers know most.' },
      { title: 'Bracket edges', body: '3 vs 4 and 6 vs 7 flip with one person. In a big alliance one defector can make several members wrong at once, so plans built right on an edge are fragile.' },
    ], columns: 1 },
    { type: 'p', text: 'There is no dominant strategy. Showing your box is allowed but hard to verify, so it comes down to whose word you trust.' },
  ],
  similar: [
    { name: 'Herd Mentality', players: '4–20', alike: 'Score by writing the same answer as the majority; it is all about predicting others.', differs: 'There the majority scores and the odd one out is penalised; here you predict a bracket and being alone pays most.' },
    { name: 'Scattergories', players: '2–6', alike: 'Unique answers score, so you must anticipate what others will write.', differs: 'It is a word game with no public prediction or change step.' },
  ],
});

export const fishShop = g4Game({ slug: 'fish-shop', kind: 'main', ep: 4, related: ['piggyBank', 'hitStay', 'indianPoker'], check: 'wiki' }, {
  meta: {
    title: '생선 가게 규칙 — 더 지니어스 그랜드 파이널 4회전 메인매치, 최저가가 모두 판다',
    description: '더 지니어스: 그랜드 파이널 4회전 메인매치 생선 가게의 규칙을 정리했어요. 갈치·고등어·오징어, 4라운드에 나눠 쓰는 판매권 6장, 1천–5천 원 희망가 중 최저가가 판매가, 최저가 판매자가 모든 수량을 판매, 비밀·확인 아이템, 3만·4만 원 가넷 보상과 승부처까지.',
    keywords: ['생선 가게', '생선가게', '더 지니어스 생선가게', '그랜드 파이널 4회전', '더 지니어스 4', '과일가게'],
  },
  title: '생선 가게 — 더 지니어스: 그랜드 파이널 4회전 메인매치',
  name: '생선 가게',
  lead: '같은 생선을 파는 사람들 중 가장 싸게 부른 사람이 그 생선을 모두 팔아요. 다 함께 비싸게 팔지, 몰래 값을 내릴지의 게임이에요.',
  summary: '판매권으로 팔 생선을 고르고 몰래 희망가를 내, 최저가를 부른 사람이 전량을 파는 가격 경쟁 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 10명.',
      '**상품**: 갈치, 고등어, 오징어 세 가지.',
      '**판매권**: 1인 6장. 한 라운드에 다 써도, 나눠 써도, 끝까지 안 써도 돼요. 교환·양도·파기는 안 돼요.',
      '**아이템**: 게임 중 한 번, "비밀"과 "확인" 중 하나를 쓸 수 있어요.',
      '**라운드**: 4라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '판매 상품 제출', body: '각자 판매권을 써서 이번 라운드에 팔 상품을 딜러에게 내요. 모두 내면 상품별로 누가 파는지 공개돼요.' },
      { title: '희망가 결정', body: '같은 상품을 파는 사람들의 생각을 가늠해 희망가를 정해요. 1천 원부터 5천 원까지 천 원 단위예요. 한 명씩 딜러 룸에서 몰래 내요.' },
      { title: '판매', body: '상품마다 가장 낮은 희망가가 최종 판매가가 돼요. 최저가를 낸 사람이 그 라운드에 그 상품에 나온 판매 수량을 모두 그 값에 팔아 수입을 얻어요. 최저가가 여럿이면 수입을 똑같이 나눠요.' },
      { title: '결과 공개', body: '라운드가 끝나면 상품별 최종 판매가와 수입이 공개되고, 수입은 라운드마다 쌓여요.' },
    ] },
    { type: 'table', head: ['아이템', '효과'], rows: [
      ['비밀', '상품 하나를 골라, 이번 라운드 결과 발표 때 그 상품의 판매가와 수입을 비공개로 해요.'],
      ['확인', '지금까지 자신이 번 총 수입을 알 수 있어요.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '4라운드 뒤 누적 수입이 가장 높은 사람이 우승자, 가장 낮은 사람이 탈락후보예요.',
      '모두의 수입이 같으면 처음부터 다시 해요.',
      '총 수입이 **3만 원 이상이면 가넷 1개, 4만 원 이상이면 2개**를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '수입을 나눌 때 원 단위 이하는 버렸어요. 나무위키 정리로는 판매권 한 장 기준으로 나눈 값에 장수를 곱했다고 해요.',
      '희망가는 공개되지 않고, 최종 판매가와 수입만 공개돼요. 그래서 누가 최저가를 냈는지는 결과로 추리해야 해요.',
      '블랙가넷 1회전 "과일가게"를 바탕으로 한 게임이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '경제학의 **가격 경쟁(베르트랑 경쟁)** 그대로예요. 같은 생선을 파는 사람이 모두 5천 원을 부르면 수입을 고르게 나누지만, 혼자 4천 원을 부르면 남의 수량까지 전부 가져가요. 한 번의 배신이 크게 남는 구조라, 모두가 이를 의심하면 값은 1천 원까지 떨어질 수 있어요.' },
    { type: 'cards', items: [
      { title: '판매권은 수량이자 신호', body: '한 상품에 판매권을 많이 내면 그 상품의 판매 수량이 늘어 걸린 돈이 커져요. 그런데 누가 그 상품을 파는지는 공개되니, 판매권 배분이 곧 "어디서 경쟁할지"를 드러내는 신호가 돼요. 혼자 파는 상품을 만들면 5천 원을 마음껏 부를 수 있어요.' },
      { title: '4라운드의 반복', body: '한 번으로 끝나는 게임이라면 값을 내리는 쪽이 유리하지만, 4라운드 반복이라 배신자는 다음 라운드에 보복을 받을 수 있어요. 다만 판매권이 6장뿐이라 마지막 라운드로 갈수록 보복 수단이 줄어, 막판 배신의 유혹이 커져요.' },
      { title: '비밀 아이템의 쓰임', body: '희망가가 공개되지 않으므로, 최저가를 낸 사람을 가려내는 것은 판매가와 수입뿐이에요. 비밀 아이템으로 그 정보마저 가리면 몰래 값을 내린 것이 드러나지 않아요.' },
    ], columns: 1 },
    { type: 'p', text: '지배 전략은 없어요. 연합이 크면 높은 값을 지키기 쉽지만, 그만큼 한 명만 이탈해도 이득이 크게 쏠려요. 결국 "누가 같은 상품을 팔고, 그 사람이 값을 지킬 것인가"를 읽는 게임이에요.' },
  ],
  similar: [
    { name: '푸드 체인 매그넷 (Food Chain Magnate)', players: '2–5명', alike: '손님이 가장 싼 가게로 가서, 값을 내리면 경쟁자의 매출을 통째로 가져올 수 있어요.', differs: '푸드 체인 매그넷은 직원 고용과 광고까지 다루는 긴 경영 게임이에요.' },
    { name: '컨테이너 (Container)', players: '3–5명', alike: '플레이어가 자기 상품에 값을 매기고, 다른 플레이어가 그 값을 보고 살지 정해요. 가격 책정이 곧 경쟁이에요.', differs: '컨테이너는 사고파는 사람이 모두 플레이어이고, 최저가가 전량을 가져가는 규칙은 없어요.' },
  ],
}, {
  meta: {
    title: 'Fish Shop rules — The Genius: Grand Final round 4 main match',
    description: 'The rules of Fish Shop (생선 가게), round 4 main match of The Genius: Grand Final: hairtail, mackerel and squid, six sales tickets over four rounds, secret asking prices from ₩1,000 to ₩5,000, the lowest seller selling the whole volume, the Secret and Check items and the garnet reward.',
    keywords: ['Fish Shop', 'The Genius Grand Final', '생선 가게'],
  },
  title: 'Fish Shop — The Genius: Grand Final round 4 main match',
  name: 'Fish Shop (생선 가게)',
  lead: 'Among everyone selling the same fish, whoever asks the lowest price sells it all. Hold the price together, or undercut in secret?',
  summary: 'A price war: commit sales tickets to a fish, set a secret price, and the lowest seller sells the whole volume.',
  setup: [
    { type: 'list', items: [
      '**Players**: 10.',
      '**Goods**: hairtail, mackerel, squid.',
      '**Sales tickets**: six each, to use in one round, spread out, or not at all; they cannot be traded, given or destroyed.',
      '**Item**: once per game, either Secret or Check.',
      '**Rounds**: 4.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose goods', body: 'Submit tickets for the goods you want to sell this round; then who is selling each fish is revealed.' },
      { title: 'Set a price', body: 'Judging your fellow sellers, set an asking price from ₩1,000 to ₩5,000 in steps of ₩1,000, privately in the dealer room.' },
      { title: 'Sell', body: 'Each fish sells at its lowest asking price. The lowest seller sells every unit put up for that fish this round at that price; tied lowest sellers split the revenue.' },
      { title: 'Results', body: 'Each fish’s final price and revenue are announced, and earnings accumulate.' },
    ] },
    { type: 'table', head: ['Item', 'Effect'], rows: [
      ['Secret', 'Hide one fish’s price and revenue in this round’s results.'],
      ['Check', 'Learn your own total earnings so far.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After four rounds the highest earner wins and the lowest becomes the candidate.',
      'If everyone earned the same, the game restarts.',
      '**₩30,000 or more earns one garnet, ₩40,000 or more earns two.**',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Fractions were rounded down when revenue was split; the fan wiki says it was divided per ticket and multiplied by the number of tickets.',
      'Asking prices stay secret; only final prices and revenue are shown, so the undercutter must be inferred.',
      'The game is built on Black Garnet’s round 1 "Fruit Stand".',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is textbook **Bertrand price competition**. If every seller of a fish asks ₩5,000 they share evenly, but one asking ₩4,000 takes the whole volume. Defection pays so well that if everyone expects it, prices can sink to ₩1,000.' },
    { type: 'cards', items: [
      { title: 'Tickets are volume and signal', body: 'More tickets on a fish raise the money at stake, and since sellers are revealed, your tickets show where you will compete. A fish you sell alone lets you ask ₩5,000 freely.' },
      { title: 'Four rounds of repetition', body: 'In a one-shot game undercutting wins, but over four rounds a defector can be punished next time. With only six tickets, though, punishment runs out toward the end, so late betrayal tempts more.' },
      { title: 'What Secret is for', body: 'Since asking prices are hidden, only the price and revenue expose an undercutter; Secret hides even that.' },
    ], columns: 1 },
    { type: 'p', text: 'No strategy dominates. Big alliances hold prices more easily, but one defector then gains all the more. It comes down to who else sells your fish and whether they will hold the line.' },
  ],
  similar: [
    { name: 'Food Chain Magnate', players: '2–5', alike: 'Customers go to the cheapest restaurant, so a price cut can take a rival’s entire sales.', differs: 'A long business game with hiring and marketing.' },
    { name: 'Container', players: '3–5', alike: 'Players price their own goods and others decide whether to buy; pricing is the competition.', differs: 'Players are both buyers and sellers, and there is no lowest-price-takes-all rule.' },
  ],
});

export const loyalistsRebels = g4Game({ slug: 'loyalists-and-rebels', kind: 'main', ep: 5, related: ['equationTower', 'equationSignal', 'hiddenWord'], check: 'wiki' }, {
  meta: {
    title: '충신과 역적 규칙 — 더 지니어스 그랜드 파이널 5회전 메인매치, 1000을 넘기지 마라',
    description: '더 지니어스: 그랜드 파이널 5회전 메인매치 충신과 역적의 규칙을 정리했어요. 충신 6명·역적 3명, A·B열 15칸씩 30칸, 딜러가 보여 주는 숫자 4개로 오름차순 채우기, 한 번에 한 자릿수만 올리기, 왕 선출과 감옥, 1000 초과 시 마지막 왕의 역전 기회와 승부처까지.',
    keywords: ['충신과 역적', '더 지니어스 충신과 역적', '그랜드 파이널 5회전', '더 지니어스 4', '마피아 게임'],
  },
  title: '충신과 역적 — 더 지니어스: 그랜드 파이널 5회전 메인매치',
  name: '충신과 역적',
  lead: '충신은 두 열의 숫자가 1000을 넘지 않게 30칸을 채우려 하고, 정체를 숨긴 역적 셋은 숫자를 크게 올려 1000을 넘기려 해요.',
  summary: '오름차순으로 숫자를 채우는 두 열을 두고, 충신 6명과 숨은 역적 3명이 1000을 넘기느냐로 맞서는 정체 숨기기 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 9명. 제비뽑기로 6명은 충신, 3명은 역적이 돼요. 역적끼리는 서로를 알고, 충신은 누가 역적인지 몰라요.',
      '**순서**: 추첨으로 1–9번.',
      '**판**: 15칸짜리 A열과 B열, 모두 30칸.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '숫자 받기', body: '순서대로 딜러 룸에 들어가면 딜러가 그 사람에게만 숫자 4개를 보여 줘요. 매번 구성이 달라요.' },
      { title: '칸 채우기', body: '그 숫자들로 한 자리부터 네 자리까지의 수를 만들어, A열이나 B열의 비어 있는 가장 아래 칸에 써요. 채운 수는 모두에게 공개돼요.' },
      { title: '두 가지 제한', body: '같은 열의 바로 앞 칸보다 큰 수여야 해요. 그리고 자릿수는 한 번에 한 단계만 올릴 수 있어요. 앞 칸이 한 자리 수면 다음은 두 자리까지만 돼요.' },
      { title: '왕 선출과 감옥', body: '모두 한 번씩 내면 한 라운드가 끝나고, 투표로 왕을 뽑아요(자기 자신에게는 못 해요). 왕은 역적으로 의심되는 2명을 감옥에 보내고, 그 둘은 다음 라운드 숫자 제출과 왕 선거권·피선거권을 잃어요. 같은 사람이 연이어 왕이 될 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '두 열 모두 1000을 넘지 않고 30칸이 다 차면 **충신 승리**예요. 충신은 모두 생명의 징표를 받고, 역적 하나를 탈락후보로 지목해요. 탈락후보는 나머지 역적 둘 중 하나를 데스매치 상대로 골라요.',
      '어느 열이든 1000을 넘으면 역적이 이기지만, 충신에게 마지막 기회가 있어요. 감옥에 있는 2명을 뺀 사람들이 비밀투표로 **마지막 왕**을 뽑고, 그 왕이 2명을 감옥에 보내요. 둘 다 역적이면 충신의 역전승이고, 그 두 역적이 데스매치에 가요.',
      '한 명이라도 역적이 아니면 역적 승리예요. 역적 셋은 생명의 징표를 받고, 징표가 없는 사람 중 하나를 탈락후보로 지목해요.',
      '마지막 왕은 팀 결과와 상관없이 생명의 징표를 받아요. 가넷은 충신이 이기면 충신 1개씩, 역적이 이기면 역적 2개씩이에요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '1라운드 전에는 왕을 뽑지 않아요. 왕 선출은 라운드가 끝날 때마다 해요.',
      '영문 위키백과 정리에 따르면, 딜러가 보여 준 숫자들은 무작위가 아니라 원주율(π)의 자릿수를 차례로 따른 것이었어요. 규칙 설명에서는 알려 주지 않은 장치예요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '숫자 규칙을 뜯어보면 충신의 일은 단순해요. **매번 앞 칸보다 큰 수 가운데 가장 작은 수**를 쓰면 돼요. 한 열 15칸을 한 자리·두 자리·세 자리 수로 천천히 오르면 1000 근처에 닿을 일이 거의 없어요. 역적은 반대로 쓸 수 있는 가장 큰 수를 써서 자릿수를 빨리 올리고 남은 칸의 여유를 없애려 해요.' },
    { type: 'cards', items: [
      { title: '숨는 것과 미는 것의 줄다리기', body: '칸에 쓴 수는 공개되지만 받은 숫자 4개는 본인만 봐요. 그래서 큰 수를 쓴 사람이 "그 숫자밖에 없었다"고 말하면 반박하기 어려워요. 역적은 의심받지 않을 만큼만 올려야 하고, 너무 세게 밀면 왕에게 감옥으로 보내져 다음 라운드를 쉬게 돼요.' },
      { title: '자릿수 규칙이 브레이크', body: '한 번에 한 자릿수만 올릴 수 있어, 역적 한 명이 한 번에 1000을 넘길 수는 없어요. 네 자리로 올라가려면 그 열이 먼저 세 자리에 도달해 있어야 해요. 충신 입장에서는 세 자리로 넘어가는 순간을 최대한 늦추는 것이 핵심이에요.' },
      { title: '마지막 왕', body: '역적이 1000을 넘겨도 마지막 왕이 역적 둘을 정확히 맞히면 뒤집혀요. 그래서 역적은 게임 내내 의심을 고르게 흩어 놓아야 하고, 충신은 누가 어떤 수를 썼는지 기록해 두는 것이 마지막 투표의 재료가 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '숫자가 사실 정해진 순서(원주율)를 따랐다는 점은, 누군가 그 순서를 안다면 "받은 숫자"를 속일 수 없게 만든다는 뜻이에요. 정보가 공개되는 순간 역적의 거짓말이 설 자리가 사라지는, 정체 숨기기 게임의 약점을 보여 주는 장치예요.' },
  ],
  similar: [
    { name: '레지스탕스: 아발론 (The Resistance: Avalon)', players: '5–10명', alike: '서로를 아는 소수의 악당과 정체를 모르는 다수가 맞서고, 리더가 사람을 고를 때마다 의심이 오가요.', differs: '아발론은 임무 성공·실패 카드를 내는 방식이고, 숫자를 채우는 판은 없어요.' },
    { name: '시크릿 히틀러 (Secret Hitler)', players: '5–10명', alike: '투표로 뽑힌 사람이 결정을 내리고, 숨은 진영이 그 결정을 비틀어요. 공개된 결과로 거짓말을 가려내야 해요.', differs: '시크릿 히틀러는 정책 카드를 고르는 게임이고, 진영 수와 승리 조건이 달라요.' },
  ],
}, {
  meta: {
    title: 'Loyalists and Rebels rules — The Genius: Grand Final round 5 main match',
    description: 'The rules of Loyalists and Rebels (충신과 역적), round 5 main match of The Genius: Grand Final: six loyalists and three hidden rebels, two 15-slot tracks filled in ascending order from four private digits, one extra digit at a time, kings and prison, and the final king’s last chance if a track passes 1,000.',
    keywords: ['Loyalists and Rebels', 'The Genius Grand Final', '충신과 역적'],
  },
  title: 'Loyalists and Rebels — The Genius: Grand Final round 5 main match',
  name: 'Loyalists and Rebels (충신과 역적)',
  lead: 'Loyalists want to fill 30 slots without either track passing 1,000; three hidden rebels try to push the numbers over.',
  summary: 'A hidden-role game on two ascending tracks: six loyalists against three rebels who want a track over 1,000.',
  setup: [
    { type: 'list', items: [
      '**Players**: 9; by lot, 6 loyalists and 3 rebels. Rebels know each other; loyalists know nobody.',
      '**Order**: 1–9 by lot.',
      '**Board**: tracks A and B, 15 slots each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Digits', body: 'In turn, each player enters the dealer room and is shown four digits, different every time, seen only by them.' },
      { title: 'Fill a slot', body: 'From those digits they form a one- to four-digit number and write it in the lowest empty slot of A or B; written numbers are public.' },
      { title: 'Two limits', body: 'It must exceed the previous number in that track, and the digit count may rise by only one step: after a one-digit number, at most two digits.' },
      { title: 'King and prison', body: 'After everyone has played, a vote elects a king (not yourself). The king sends two suspected rebels to prison: they skip the next round’s numbers and cannot vote or be elected. The same king may be re-elected.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'If all 30 slots fill with neither track over 1,000, **loyalists win**: they all get tokens and name a rebel as candidate, who picks one of the other two rebels as opponent.',
      'If a track passes 1,000 the rebels win, but players not in prison elect a **final king** by secret ballot, who jails two players. If both are rebels, the loyalists win after all and those two rebels go to the death match.',
      'Otherwise the rebels win: all three get tokens and name a candidate among players without one.',
      'The final king gets a token regardless. Garnets: 1 per loyalist on a loyalist win, 2 per rebel on a rebel win.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'No king is elected before round 1; elections follow every round.',
      'According to English Wikipedia, the digits shown were not random but followed the digits of π in order, which the rules did not disclose.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The loyalist job is simple: **always write the smallest number larger than the last**. Climbing slowly through one-, two- and three-digit numbers, a 15-slot track rarely nears 1,000. Rebels write the largest number allowed to raise the digit count fast and eat the headroom.' },
    { type: 'cards', items: [
      { title: 'Hiding versus pushing', body: 'Numbers are public but the digits were private, so a big number can be excused as "that was all I had". Rebels must push only as hard as suspicion allows; push too hard and the king jails them for a round.' },
      { title: 'The digit rule is a brake', body: 'Since digits rise one step at a time, no single rebel can jump past 1,000; the track must already be at three digits. Loyalists win by delaying the move to three digits as long as possible.' },
      { title: 'The final king', body: 'Even after 1,000 is passed, a final king who jails exactly two rebels reverses the result, so rebels must spread suspicion evenly and loyalists should record who wrote what.' },
    ], columns: 1 },
    { type: 'p', text: 'Digits following a fixed sequence (π) mean anyone who knows it can check what each player was shown, leaving rebels no room to lie: a neat illustration of how hidden-role games collapse once information goes public.' },
  ],
  similar: [
    { name: 'The Resistance: Avalon', players: '5–10', alike: 'A small team of villains who know each other faces an uninformed majority; every leader’s choice stirs suspicion.', differs: 'Missions succeed or fail by secret cards; there is no number track.' },
    { name: 'Secret Hitler', players: '5–10', alike: 'Elected players make decisions the hidden side tries to twist; public outcomes are the evidence.', differs: 'Players enact policy cards, with different factions and win conditions.' },
  ],
});

export const garnetThief = g4Game({ slug: 'garnet-thief', kind: 'main', ep: 6, related: ['blackWhite', 'hitStay', 'indianPoker'], check: 'one', extra: [wiki4] }, {
  note: '영문 위키백과에는 이 게임의 3·7라운드 가넷 양도 규칙만 짧게 적혀 있어, 그 부분은 두 곳에서 확인했어요.',
  meta: {
    title: '가넷도둑 규칙 — 더 지니어스 그랜드 파이널 6회전 가넷매치, 마피아·카르텔·경찰·거지',
    description: '더 지니어스: 그랜드 파이널 6회전 가넷매치 가넷도둑의 규칙을 정리했어요. 8명·8라운드, 라운드마다 가넷 4개, 마피아·카르텔·경찰·거지 중 비공개 선택과 거짓 선언, 다수 조직이 나눠 갖고 남는 가넷은 거지에게, 거짓말 패널티, 3·7라운드 양도와 승부처까지.',
    keywords: ['가넷도둑', '가넷 도둑', '더 지니어스 가넷도둑', '그랜드 파이널 6회전', '가넷매치', '더 지니어스 4'],
  },
  title: '가넷도둑 — 더 지니어스: 그랜드 파이널 6회전 가넷매치',
  name: '가넷도둑',
  lead: '라운드마다 가넷 4개가 걸려요. 마피아·카르텔·경찰·거지 중 하나를 몰래 고르고 말로는 거짓을 해도 되지만, 빈손이 된 거짓말쟁이는 벌을 받아요.',
  summary: '네 캐릭터 중 하나를 숨겨 고르고 선언으로 서로를 흔들어, 매 라운드 가넷 4개를 나눠 갖는 8인 가넷매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 8명. 제비뽑기로 1–8번을 정하고, 8라운드 동안 1번부터 돌아가며 한 번씩 선이 돼요.',
      '**걸린 가넷**: 라운드마다 주최 측이 내놓는 가넷 4개.',
      '**캐릭터**: 마피아, 카르텔, 경찰, 거지.',
      '**가넷매치**: 보유 가넷으로 순위를 정해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선택과 선언', body: '선부터 차례로 캐릭터 하나를 골라 몰래 버튼을 누르고, 무엇을 골랐는지 모두가 들리게 말해요. 이때 거짓말을 해도 돼요.' },
      { title: '공개', body: '모두 고르면 마지막에 고른 사람부터 거꾸로 정체를 공개해요.' },
      { title: '분배', body: '범죄 조직인 마피아와 카르텔 중 사람이 더 많은 쪽이 가넷 4개를 똑같이 나눠요. 두 조직의 수가 같거나 범죄 조직이 아무도 없으면 경찰이 똑같이 나눠요.' },
      { title: '남는 가넷', body: '똑같이 나누고 남은 가넷은 거지들이 똑같이 나눠요. 거지까지 나누고도 남으면 주최 측이 거둬 가요.' },
      { title: '거짓말 패널티', body: '그 라운드에 가넷을 못 받은 사람 중 선언을 거짓으로 한 사람은 가넷 1개를 내야 해요. 가넷이 없으면 내지 않아도 되고, 남이 대신 낼 수는 없어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '8라운드 뒤 가넷이 가장 많은 사람이 우승자, 가장 적은 사람이 탈락후보예요. 단독 우승이면 생명의 징표를 2개 받아요.',
      '가넷이 0개가 된 사람이 있어도 8라운드까지 진행해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '가넷매치지만 이 게임만은 **3라운드와 7라운드가 끝났을 때** 다른 한 명에게서 가넷 1개를 받을 수 있어요. 한 라운드에 두 명 이상에게 받을 수는 없지만, 한 사람이 여러 명에게 줄 수는 있어요. 양도는 딜러가 확인하고, 다른 사람에게는 알리지 않아요.',
      '받을 사람이 4명보다 많으면 가넷을 똑같이 나눌 수 없어 아무도 받지 못해요. 예를 들어 다수 조직이 3명이면 1개씩 받고 1개가 남아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '분배 규칙을 숫자로 풀면 이 게임의 모양이 보여요. 4개를 받는 쪽이 **1명이면 4개, 2명이면 2개씩, 3명이면 1개씩(1개 남음), 4명이면 1개씩, 5명 이상이면 0개**예요. 다수 조직에 들어야 받지만, 다수가 너무 커지면 몫이 사라져요.' },
    { type: 'cards', items: [
      { title: '거지는 나머지를 노린다', body: '거지는 다수 쪽이 3명일 때 남는 1개를 노려요. 거지가 혼자면 그 1개를 가져가지만, 거지가 둘 이상이면 1개를 나눌 수 없어 아무도 못 받아요. 거지는 "나머지가 생기는 분배"와 "혼자인 거지"가 둘 다 맞아야 하는 좁은 길이에요.' },
      { title: '동률을 만드는 사람', body: '마피아와 카르텔이 같은 수면 경찰이 가져가요. 그래서 경찰을 고른 사람은 한쪽 조직에 끼어들어 수를 맞추고 싶어 하고, 이것이 곧 선언으로 다른 사람을 움직이려는 이유가 돼요.' },
      { title: '거짓말은 빈손일 때만 비싸다', body: '거짓 선언은 가넷을 받으면 벌이 없고, 못 받았을 때만 1개를 내요. 나중에 고르는 사람일수록 앞사람의 선언을 많이 듣지만, 그 선언이 진짜인지는 공개 전까지 알 수 없어요.' },
    ], columns: 1 },
    { type: 'p', text: '지배 전략은 없어요. 어떤 선택이든 다른 사람들이 어디로 몰리느냐에 따라 최선이 바뀌는 구조라, 매 라운드 "모두가 어디로 갈 것 같은가"를 한 단계 더 앞서 읽는 사람이 유리해요. 3·7라운드의 비공개 양도는 연합끼리 가넷을 몰아 순위를 조정하는 마지막 수단이에요.' },
  ],
  similar: [
    { name: '마스카라드 (Mascarade)', players: '2–13명', alike: '자기가 어떤 역할이라고 선언하고, 그 선언이 거짓일 수 있어요. 거짓말이 들키면 벌을 받아요.', differs: '마스카라드는 역할마다 능력이 다르고 돈을 모으는 경쟁이에요. 다수결로 나누는 규칙은 없어요.' },
    { name: '바퀴벌레 포커 (Cockroach Poker)', players: '2–6명', alike: '카드가 무엇인지 말로 선언하고, 상대는 그 말이 진짜인지 판단해야 해요.', differs: '바퀴벌레 포커는 1:1로 카드를 넘기는 블러핑이고, 여럿이 동시에 같은 몫을 나누는 구조가 없어요.' },
  ],
}, {
  note: 'English Wikipedia mentions only this game’s transfers after rounds 3 and 7, so that part was checked in two places.',
  meta: {
    title: 'Garnet Thief rules — The Genius: Grand Final round 6 garnet match',
    description: 'The rules of Garnet Thief (가넷도둑), round 6 garnet match of The Genius: Grand Final: eight players over eight rounds, four garnets a round, Mafia, Cartel, Police or Beggar chosen in secret and declared (truthfully or not), majority sharing with remainders to beggars, the liar penalty and transfers after rounds 3 and 7.',
    keywords: ['Garnet Thief', 'The Genius Grand Final', 'garnet match', '가넷도둑'],
  },
  title: 'Garnet Thief — The Genius: Grand Final round 6 garnet match',
  name: 'Garnet Thief (가넷도둑)',
  lead: 'Four garnets are at stake each round. Secretly pick Mafia, Cartel, Police or Beggar and say what you like, but a liar who ends up empty-handed pays.',
  summary: 'An eight-player garnet match: choose one of four characters in secret, bluff with your declaration, and share four garnets a round.',
  setup: [
    { type: 'list', items: [
      '**Players**: 8, numbered by lot; over 8 rounds each leads once.',
      '**Stake**: four garnets per round from the house.',
      '**Characters**: Mafia, Cartel, Police, Beggar.',
      '**Garnet match**: ranked by garnets held.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose and declare', body: 'From the leader, each player secretly presses a button for a character and then announces it aloud; the announcement may be a lie.' },
      { title: 'Reveal', body: 'Identities are revealed from the last chooser backwards.' },
      { title: 'Share', body: 'Whichever crime group, Mafia or Cartel, has more members splits the four garnets equally. If they tie or nobody chose crime, Police split them.' },
      { title: 'Remainders', body: 'Garnets left over go to Beggars equally; anything left after that returns to the house.' },
      { title: 'Liar penalty', body: 'A player who got nothing and declared falsely pays one garnet (nothing if they have none; nobody may pay for them).' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After eight rounds the most garnets wins and the fewest becomes the candidate; a sole winner gets two tokens.',
      'Play continues to round 8 even if someone hits zero.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Unusually for a garnet match, **after rounds 3 and 7** a player may receive one garnet from one other player (not from two in the same round, though one player may give to several). Transfers are confirmed by the dealer and not announced.',
      'If more than four players would share, the garnets cannot be split equally and nobody gets any; a majority of three takes one each and leaves one over.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The split rule in numbers: the receiving group gets **4 for one player, 2 each for two, 1 each for three (one left over), 1 each for four, nothing for five or more**. You need to be in the majority, but too big a majority earns nothing.' },
    { type: 'cards', items: [
      { title: 'Beggars live on remainders', body: 'A Beggar wants a majority of three and to be the only Beggar; two Beggars cannot split one garnet. It is a narrow path that needs both conditions.' },
      { title: 'Tie-makers', body: 'A Mafia–Cartel tie pays Police, so Police players want to even out the crime groups, which is why declarations try to steer others.' },
      { title: 'Lying only costs when you lose', body: 'A false declaration is free if you get paid and costs one if you don’t. Later choosers hear more declarations but cannot tell which are true.' },
    ], columns: 1 },
    { type: 'p', text: 'No strategy dominates; each choice’s value depends on where everyone else goes, so the player one step ahead in reading the table gains. The hidden transfers after rounds 3 and 7 let alliances shift garnets to fix the ranking.' },
  ],
  similar: [
    { name: 'Mascarade', players: '2–13', alike: 'You claim a role, possibly falsely, and are punished if caught.', differs: 'Roles have powers and you race for coins; there is no majority split.' },
    { name: 'Cockroach Poker', players: '2–6', alike: 'You declare what a card is and others judge the claim.', differs: 'A one-on-one passing bluff with no shared payout.' },
  ],
});
