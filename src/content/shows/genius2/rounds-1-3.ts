// 더 지니어스: 룰 브레이커, rounds 1–3: 먹이사슬, 콰트로 (also the final's third game), 자리 바꾸기, 해 달 별 (rounds 2 and 4),
// 왕 게임, 결! 합!.
import { g2Game, namuGame } from './shared';

export const foodChain = g2Game({ slug: 'food-chain', kind: 'main', rounds: [1], related: ['hiddenWord', 'russianRoulette', 'indianPoker'], check: 'two' }, {
  meta: {
    title: '먹이사슬 규칙 — 더 지니어스 시즌2 룰 브레이커 1회전 메인 매치, 숨은 동물들의 생존 게임',
    description: '더 지니어스: 룰 브레이커 1회전 메인 매치 먹이사슬의 규칙을 정리했어요. 13마리 동물의 서열과 서식지, 동물마다 다른 승리 조건, 굶주림 제한, 공격 스티커, 뱀과 피식자 연합의 특수 능력, 엿보기와 까마귀의 예측까지. 승부처와 비슷한 보드게임도 함께.',
    keywords: ['먹이사슬', '먹이사슬 게임', '더 지니어스 먹이사슬', '룰 브레이커 먹이사슬', '더 지니어스2', '더 지니어스 시즌2'],
  },
  title: '먹이사슬 — 더 지니어스: 룰 브레이커 1회전 메인 매치',
  name: '먹이사슬',
  lead: '13명이 몰래 동물 하나씩을 맡아요. 포식자는 굶지 않으려 사냥하고, 피식자는 살아남으려 숨어요. 동물마다 이기는 조건이 달라서, 누가 누구 편인지부터 알아내야 해요.',
  summary: '동물마다 승리 조건이 다른 정체 숨기기 게임. 네 라운드 동안 서식지를 옮겨 다니며 사냥하고 피해요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 13명. 제비뽑기로 동물 하나씩을 받고, 자기 동물은 남에게 공개되지 않아요.',
      '**지역**: 하늘·강·들·숲 네 곳. 동물마다 주 서식지가 있어요.',
      '**도구**: 공격 스티커. 공격하려면 상대 몸에 스티커를 직접 붙여야 해요.',
      '**엿보기**: 동물이 정해진 뒤, 모두 다른 사람 한 명의 동물을 몰래 확인해요.',
    ] },
    { type: 'table', head: ['서식지', '포식자', '피식자'], rows: [
      ['하늘', '독수리', '청둥오리, 까마귀'],
      ['강', '악어', '수달, 악어새'],
      ['들', '사자, 하이에나', '사슴'],
      ['숲', '—', '카멜레온, 뱀, 토끼, 쥐'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '이동', body: '라운드마다 네 지역 중 한 곳으로 가요. 사자·하이에나·쥐는 하늘에 갈 수 없어요. 주 서식지가 아닌 곳에서 한 라운드를 보냈다면, 다음 라운드에는 반드시 주 서식지로 돌아가야 해요.' },
      { title: '공격', body: '같은 지역에 있는 동물에게 스티커를 붙여 공격해요. 서열이 낮은 동물을 공격하면 잡아먹고, 같은 서열이면 아무 일도 없고, 서열이 높은 동물을 공격하면 오히려 내가 먹혀요.' },
      { title: '공개', body: '공격 장면은 같은 지역에 있던 사람만 봐요. 죽은 사람이 나오면 이름만 모두에게 알려지고, 어떤 동물이었는지는 알려지지 않아요.' },
      { title: '네 라운드', body: '이렇게 네 라운드를 하면 게임이 끝나고, 각자 자기 동물의 승리 조건을 채웠는지 따져요.' },
    ] },
    { type: 'table', head: ['동물 (서열)', '승리 조건', '특이 사항'], rows: [
      ['사자 (1위)', '끝까지 생존', '한 라운드라도 굶으면 죽어요.'],
      ['악어 (2위)', '끝까지 생존', '두 라운드 연속 굶으면 죽어요.'],
      ['독수리 (3위)', '끝까지 생존', '굶주림 제한이 없어요.'],
      ['하이에나 (4위)', '사자가 죽는 것', '세 라운드 연속 굶으면 죽어요. 자신은 죽어도 돼요.'],
      ['뱀 (피식자)', '게임이 끝날 때 9명 이상 사망', '공격할 수 없고, 뱀을 공격한 동물은 죽어요.'],
      ['카멜레온 (피식자)', '끝까지 생존', '엿보기를 당할 때 다른 동물로 위장할 수 있어요.'],
      ['사슴·수달·토끼·청둥오리 (피식자)', '끝까지 생존', '살아 있는 넷 모두가 한 지역에 모여 있으면 공격받아도 죽지 않아요.'],
      ['까마귀 (피식자)', '처음에 고른 동물의 승리를 맞히기', '엿보기를 두 명 할 수 있어요.'],
      ['악어새 (피식자)', '악어의 승리', ''],
      ['쥐 (피식자)', '사자의 승리', ''],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '승리 조건을 채운 사람은 **모두 우승자**가 되어 생명의 징표, 가넷 1개, 불멸의 징표 단서를 받아요.',
      '우승자들은 패배한 사람 중 한 명을 탈락 후보로 정하고, 탈락 후보는 우승자가 아닌 사람 중 데스매치 상대를 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '피식자 연합(사슴·수달·토끼·청둥오리)의 보호는 한 마리만 살아남았을 때도 적용돼요. 다만 연합 동물이라도 뱀을 공격하면 죽어요.',
      '까마귀는 동물을 뽑는 단계에서 승리를 예측할 동물을 정하고, 자기 자신은 고를 수 없어요.',
      '라운드 시간은 영어 위키백과 기준 10분이에요. 나무위키 회차 문서에는 라운드 시간이 따로 적혀 있지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '먹이사슬은 **서열보다 승리 조건**이 중요한 게임이에요. 꼭대기의 사자가 가장 강해 보이지만, 매 라운드 먹어야 한다는 조건 때문에 실제로는 가장 빠듯해요. 반대로 하이에나는 사자만 죽으면 자기가 먹혀도 이겨요.' },
    { type: 'cards', items: [
      { title: '먹이는 생각보다 적다', body: '사자는 네 번, 악어는 최소 두 번, 하이에나는 최소 한 번 먹어야 해요. 그런데 뱀은 먹을 수 없고, 피식자 연합은 모여 있으면 먹히지 않아요. 포식자끼리 먹이를 나눠 먹는 구조라, 포식자에게는 아래 포식자를 먼저 치워 경쟁자를 줄이는 동기가 생겨요.' },
      { title: '연합이 모일 수 있는 라운드', body: '피식자 연합 넷은 서식지가 하늘·강·들·숲으로 모두 달라요. 한 곳에 모이면 누군가는 집을 떠난 것이라 다음 라운드에는 흩어져야 해요. 그래서 이 연합은 한 라운드씩 걸러 가며 무적이 되고, 흩어지는 라운드가 가장 위험해요. 마지막 한 마리는 혼자여도 무적이라, 연합 안에서도 끝까지 서로를 믿기 어려워요.' },
      { title: '공개되는 것은 이름뿐', body: '죽은 사람의 동물이 공개되지 않으니, 누가 무엇이었는지는 엿보기와 말로만 퍼져요. 뱀은 정체를 밝혀 공격을 피하려 하고, 카멜레온은 뱀인 척해 같은 효과를 노릴 수 있어요. 말과 엿보기 결과가 어긋나는 사람을 찾는 것이 정보전의 중심이에요.' },
    ], columns: 1 },
    { type: 'p', text: '동물마다 목표가 달라 **모두에게 통하는 우월 전략은 없어요.** 다만 쥐-사자, 악어새-악어처럼 승리 조건이 묶인 짝, 하이에나-뱀처럼 많이 죽을수록 좋은 짝이 있어서, 이해관계가 같은 사람을 먼저 찾는 쪽이 유리해요.' },
  ],
  similar: [
    { name: '뱅! (BANG!)', players: '4–7명', alike: '보안관·무법자·배신자처럼 역할마다 이기는 조건이 다르고, 정체를 숨긴 채 서로를 공격해요.', differs: '뱅!은 카드로 공격하고 차례대로 진행해요. 서식지 이동이나 서열 같은 개념은 없어요.' },
    { name: '한밤의 늑대인간 (One Night Ultimate Werewolf)', players: '3–10명', alike: '역할 카드를 몰래 확인하고, 다른 사람의 역할을 엿보는 능력으로 정보를 모아요.', differs: '한밤의 늑대인간은 한 번의 밤과 투표로 끝나고, 사냥이나 굶주림 규칙이 없어요.' },
  ],
}, {
  meta: {
    title: 'Food Chain rules — The Genius: Rule Breaker, round 1 main match',
    description: 'The rules of Food Chain (먹이사슬), the first main match of The Genius: Rule Breaker: thirteen hidden animals, ranks and habitats, a different win condition for each, starvation limits, attack stickers, the snake and the herbivore union, peeking and the crow’s prediction — plus what decides it and similar board games.',
    keywords: ['Food Chain', 'The Genius Food Chain', 'The Genius Rule Breaker', '먹이사슬', '더 지니어스 시즌2'],
  },
  title: 'Food Chain — The Genius: Rule Breaker, round 1 main match',
  name: 'Food Chain (먹이사슬)',
  lead: 'Thirteen players secretly become animals. Predators hunt so as not to starve, prey hide to survive, and every animal wins in its own way, so first you must work out who is on whose side.',
  summary: 'A hidden-role game where each animal has its own win condition, played over four rounds of moving between habitats, hunting and hiding.',
  setup: [
    { type: 'list', items: [
      '**Players**: 13, each drawing a secret animal.',
      '**Areas**: sky, river, field and forest; every animal has a home habitat.',
      '**Tools**: attack stickers, which only count when stuck on the target by hand.',
      '**Peek**: once animals are drawn, everyone secretly looks at one other player’s animal.',
    ] },
    { type: 'table', head: ['Habitat', 'Predators', 'Prey'], rows: [
      ['Sky', 'Eagle', 'Mallard, crow'],
      ['River', 'Crocodile', 'Otter, plover (crocodile bird)'],
      ['Field', 'Lion, hyena', 'Deer'],
      ['Forest', '—', 'Chameleon, snake, rabbit, mouse'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Move', body: 'Each round go to one of the four areas; the lion, hyena and mouse cannot go to the sky. After a round away from home you must return home the next round.' },
      { title: 'Attack', body: 'Stick a sticker on an animal in the same area. Attacking a lower rank eats it; the same rank does nothing; a higher rank eats you instead.' },
      { title: 'Reveal', body: 'Only players in the same area see an attack. The dead are named to everyone, but their animal is not revealed.' },
      { title: 'Four rounds', body: 'After four rounds the game ends and each player checks their animal’s win condition.' },
    ] },
    { type: 'table', head: ['Animal (rank)', 'Wins if', 'Special'], rows: [
      ['Lion (1)', 'It survives', 'Dies if it goes a single round without eating.'],
      ['Crocodile (2)', 'It survives', 'Dies after two rounds in a row without eating.'],
      ['Eagle (3)', 'It survives', 'No starvation limit.'],
      ['Hyena (4)', 'The lion dies', 'Dies after three rounds in a row without eating; may die itself.'],
      ['Snake (prey)', 'Nine or more players are dead at the end', 'Cannot attack; any animal attacking it dies.'],
      ['Chameleon (prey)', 'It survives', 'Can show a disguise when peeked at.'],
      ['Deer, otter, rabbit, mallard (prey)', 'It survives', 'Cannot be killed while all surviving members of the four are in one area.'],
      ['Crow (prey)', 'Its predicted animal wins', 'Peeks at two players.'],
      ['Plover (prey)', 'The crocodile wins', ''],
      ['Mouse (prey)', 'The lion wins', ''],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Everyone who meets their condition is **a winner**, earning a Token of Life, a garnet and a clue to the Token of Immortality.',
      'The winners choose one loser as the Death Match candidate, who then names an opponent among the non-winners.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The herbivore union’s protection holds even when only one of them is left, but a union member that attacks the snake still dies.',
      'The crow names the animal it backs while animals are drawn, and cannot name itself.',
      'Rounds last ten minutes according to English Wikipedia; the fan wiki’s episode page does not state the length.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Food Chain is decided by **win conditions more than rank**. The lion at the top looks strongest but must eat every round, which makes it the tightest role; the hyena, by contrast, wins as soon as the lion dies, even if it is eaten itself.' },
    { type: 'cards', items: [
      { title: 'There is less food than it seems', body: 'The lion must eat four times, the crocodile at least twice and the hyena at least once — yet the snake cannot be eaten and the union cannot be eaten while gathered. Predators share a small pool, so each has a reason to remove the predators below it first.' },
      { title: 'When the union can gather', body: 'The four union animals live in four different habitats. Gathering means someone left home, so next round they must split. The union is invincible only every other round, and the split rounds are the dangerous ones; the last survivor is invincible alone, which makes trust inside the union fragile.' },
      { title: 'Only names are revealed', body: 'Since the dead player’s animal stays hidden, identities spread only through peeks and talk. The snake wants to be known so nobody attacks it, and the chameleon can claim to be the snake for the same protection. Finding the player whose claim clashes with a peek is the heart of the information game.' },
    ], columns: 1 },
    { type: 'p', text: 'With a different goal for every animal there is **no dominant strategy for everyone**. Linked pairs (mouse and lion, plover and crocodile) and players who gain from many deaths (hyena and snake) do exist, so whoever finds their natural allies first has the edge.' },
  ],
  similar: [
    { name: 'BANG!', players: '4–7', alike: 'Roles such as sheriff, outlaw and renegade win in different ways, and players attack each other with hidden identities.', differs: 'BANG! uses cards and turns; there are no habitats or ranks.' },
    { name: 'One Night Ultimate Werewolf', players: '3–10', alike: 'Secret role cards and abilities that peek at other players’ roles.', differs: 'It ends after one night and a vote, with no hunting or starvation.' },
  ],
});

export const quattro = g2Game({ slug: 'quattro', kind: 'death', rounds: [1, 12], related: ['indianPoker', 'twoSidedPoker', 'hitStay'], check: 'two' }, {
  meta: {
    title: '콰트로 규칙 — 더 지니어스 시즌2 룰 브레이커 1회전 데스매치·결승 3경기, 색과 숫자가 모두 다른 4장',
    description: '더 지니어스: 룰 브레이커 1회전 데스매치이자 결승 세 번째 경기 콰트로의 규칙을 정리했어요. 4색 1–10 카드와 0 카드 41장, 관전자 11명과의 카드 교환, 한 장씩 공개하기, 콰트로의 합 비교, 0 카드 패배, 결승에서 바뀐 멀리건·3명 교환·0 카드 인정 규칙까지.',
    keywords: ['콰트로', '콰트로 게임', '더 지니어스 콰트로', '룰 브레이커 콰트로', '더 지니어스2 데스매치', '더 지니어스 결승'],
  },
  title: '콰트로 — 더 지니어스: 룰 브레이커 1회전 데스매치 · 결승 3경기',
  name: '콰트로',
  lead: '숫자도 색도 모두 다른 카드 4장, 콰트로를 만들어 합을 겨뤄요. 손에 든 카드는 관전하는 사람들과 바꿔야만 좋아져요.',
  summary: '관전자들과 카드를 바꿔 색·숫자가 모두 다른 4장을 만드는 데스매치. 결승 마지막 경기로 다시 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명과 관전자 11명.',
      '**카드**: 빨강·파랑·노랑·초록 1–10 각 10장과 0 카드 1장, 모두 41장.',
      '**배분**: 섞은 뒤 진출자 2명은 4장씩, 관전자 11명은 3장씩 받아요.',
      '**콰트로**: 색과 숫자가 모두 다른 카드 4장. 가능한 가장 큰 합은 7·8·9·10의 34예요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '첫 공개', body: '두 진출자가 4장 중 1장씩을 앞면으로 공개해요. 공개한 카드는 더 이상 바꿀 수 없어요.' },
      { title: '교환', body: '진출자는 관전자와 카드를 1장씩 맞바꿔요. 순서는 자유지만, 한 번 교환한 관전자와는 다시 교환할 수 없어요.' },
      { title: '다음 공개', body: '두 사람 모두 더 바꾸고 싶지 않으면 다음 카드를 1장 공개해요. 이렇게 4장을 모두 공개할 때까지 반복해요.' },
      { title: '모두와 교환', body: '네 번째 카드를 공개하기 전까지 **관전자 11명 모두와 한 번씩**, 모두 11번 교환해야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '둘 다 콰트로를 만들면 **숫자 합이 큰 사람**이 이겨요. 합이 같으면 가장 큰 숫자 카드를 가진 사람이 이겨요.',
      '한 사람만 콰트로를 못 만들면 그 사람이 져요.',
      '공개된 카드에 **0 카드**가 있으면, 상대의 콰트로 여부와 상관없이 0 카드를 가진 사람이 져요.',
      '둘 다 콰트로가 없거나 조합이 완전히 같으면 무승부로 다시 해요(영어 위키백과 기준).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**결승 3경기 콰트로**는 규칙이 달라요. 처음 4장이 마음에 들지 않으면 멀리건(4장 새로 받기)을 두 번까지 할 수 있고, 관전자 한 명의 패를 미리 볼 수 있어요.',
      '결승에서는 관전자 11명 중 **3명하고만** 교환할 수 있고, 색·숫자가 모두 다른 3장에 0 카드를 더한 4장도 콰트로로 인정해요.',
      '결승에서는 탈락자들이 고른 아이템으로 멀리건 1회 추가, 교환 1회 추가, 0 카드 강제 교환을 쓸 수 있었어요.',
      '영어 위키백과에 따르면 결승 때 관전자들은 다른 방에 있어서 결승 진출자와 필요한 카드를 상의할 수 없었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '1회전 콰트로의 본질은 **카드 게임이 아니라 관전자 11명과의 관계**예요. 열한 번의 교환을 모두 해야 하니, 누가 어떤 카드를 줄지가 곧 내 패가 돼요.' },
    { type: 'cards', items: [
      { title: '공개 순서가 선택지를 지운다', body: '공개한 카드는 바꿀 수 없어서, 일찍 공개할수록 콰트로의 색과 숫자 조합이 고정돼요. 좋은 카드가 두세 장 있어도 한 장만 먼저 공개하고 나머지는 열어 두는 편이, 관전자가 협조하지 않을 때 다른 길로 갈 여지를 남겨요.' },
      { title: '교환은 정보이기도 하다', body: '관전자의 패를 정확히 알면 어떤 순서로 누구와 바꿀지 계획할 수 있어요. 다만 공개적으로 알려 주면 상대도 같은 정보를 얻으니, 우호적인 관전자와는 몰래 신호를 주고받는 쪽이 유리해요.' },
      { title: '0 카드라는 함정', body: '0 카드를 가진 채 끝나면 무조건 지지만, 받은 뒤에도 다음 관전자와 바꿔 내보낼 수 있어요. 실제로 위협이 되려면 상대의 마지막 교환 상대에게 0 카드가 가 있고, 그 관전자가 협조해야 해요. 반대로 결승에서는 0 카드가 콰트로의 일부로 인정돼 성격이 완전히 바뀌어요.' },
    ], columns: 1 },
    { type: 'p', text: '1회전 방식에서는 관전자의 협조가 결정적이라 **혼자 힘으로 이기는 우월 전략은 없어요.** 결승 방식은 교환이 세 번뿐이고 상의도 막혀서, 처음 받은 4장과 멀리건의 운이 훨씬 크게 작용해요.' },
  ],
  similar: [
    { name: '루미큐브 (Rummikub)', players: '2–4명', alike: '4색 숫자 타일로 같은 숫자·다른 색의 묶음을 만들어요.', differs: '루미큐브는 연속 숫자 묶음도 쓰고, 다른 사람과 카드를 교환하지 않아요.' },
    { name: '핏 (Pit)', players: '3–8명', alike: '여러 사람과 카드를 맞바꿔 원하는 패를 완성해요.', differs: '핏은 같은 종류를 모으는 게임이고, 모두가 동시에 소리치며 거래해요.' },
  ],
  note: '결승 규칙의 아이템과 관전자 격리는 영어 위키백과와 나무위키 결승 회차 문서를 함께 참고했어요.',
}, {
  meta: {
    title: 'Quattro rules — The Genius: Rule Breaker, round 1 Death Match and the final’s third game',
    description: 'The rules of Quattro (콰트로) from The Genius: Rule Breaker: 41 cards in four colours plus a zero, trading one card with each of 11 onlookers, revealing cards one by one, comparing Quattro totals, the zero card that loses, and the final’s changed rules (mulligans, only three trades, zero allowed in a Quattro).',
    keywords: ['Quattro', 'The Genius Quattro', 'The Genius Rule Breaker death match', '콰트로', '더 지니어스'],
  },
  title: 'Quattro — The Genius: Rule Breaker, round 1 Death Match and final game 3',
  name: 'Quattro (콰트로)',
  lead: 'Make a Quattro — four cards that differ in both colour and number — with the higher total. The only way to improve your hand is to trade with the onlookers.',
  summary: 'A Death Match of trading with onlookers to build four cards of different colours and numbers; it returned as the final’s last game.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two Death Match candidates and 11 onlookers.',
      '**Cards**: red, blue, yellow and green 1–10 plus one zero card, 41 in all.',
      '**Deal**: four cards to each candidate, three to each onlooker.',
      '**Quattro**: four cards all of different colours and numbers; the highest possible total is 7+8+9+10 = 34.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'First reveal', body: 'Each candidate turns one card face up; revealed cards can no longer be traded.' },
      { title: 'Trade', body: 'Candidates swap one card at a time with onlookers, in any order, but never twice with the same onlooker.' },
      { title: 'Next reveal', body: 'When neither wants to trade further, each reveals another card, until all four are face up.' },
      { title: 'Trade with all', body: 'Before the fourth reveal each candidate must have traded **once with every one of the 11 onlookers**.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'If both complete a Quattro, **the higher total** wins; on a tie, the higher single card.',
      'If only one completes a Quattro, the other loses.',
      'Whoever ends with **the zero card** face up loses regardless of the other hand.',
      'If neither completes one, or both hands are identical in numbers, the game is replayed (per English Wikipedia).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**The final’s Quattro** changed: each finalist may take up to two mulligans (a fresh four cards) and look at one onlooker’s hand.',
      'In the final each finalist trades with **only three** onlookers, and three different cards plus the zero count as a Quattro.',
      'Advantages chosen by eliminated players added an extra mulligan, an extra trade or a forced trade for the zero card.',
      'According to English Wikipedia the onlookers sat in a separate room in the final, so they could not discuss cards with the finalists.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Round 1’s Quattro is really about **the eleven onlookers, not the cards**. All eleven trades must happen, so who gives you what is your hand.' },
    { type: 'cards', items: [
      { title: 'Reveal order closes options', body: 'Revealed cards are locked, so every early reveal fixes part of your colour-and-number pattern. Even with two or three good cards, revealing one and keeping the rest open leaves another route if an onlooker will not help.' },
      { title: 'Trades are information', body: 'Knowing onlookers’ hands lets you plan whom to trade with and when; saying it aloud tells your opponent too, so quiet signals with friendly onlookers are worth more.' },
      { title: 'The zero trap', body: 'Ending with the zero loses outright, but a zero you receive can be passed on in your next trade. It only bites if it sits with your opponent’s last trading partner and that onlooker cooperates. In the final the zero becomes part of a valid Quattro, which changes its role completely.' },
    ], columns: 1 },
    { type: 'p', text: 'In round 1 the onlookers’ cooperation decides so much that **no strategy wins on its own**. The final version, with three trades and no talking, leans far more on the opening four cards and the mulligans.' },
  ],
  similar: [
    { name: 'Rummikub', players: '2–4', alike: 'Tiles in four colours and numbers, grouped as one number in different colours.', differs: 'Rummikub also uses runs and has no trading.' },
    { name: 'Pit', players: '3–8', alike: 'You swap cards with many players to complete a hand.', differs: 'Pit collects one commodity and everyone trades at once, shouting.' },
  ],
  note: 'The final’s advantages and the separated onlookers were checked in both English Wikipedia and the fan wiki’s final-episode page.',
});

export const seatExchange = g2Game({ slug: 'seat-exchange', kind: 'main', rounds: [2], related: ['blackWhite', 'nemoCount', 'gyulhap'], check: 'two' }, {
  meta: {
    title: '자리 바꾸기 규칙 — 더 지니어스 시즌2 룰 브레이커 2회전 메인 매치, 다섯 명의 스트레이트',
    description: '더 지니어스: 룰 브레이커 2회전 메인 매치 자리 바꾸기의 규칙을 정리했어요. 1–11과 X의 고유번호, 라운드마다 1씩 오르는 번호, 쌍방 동의 자리 교환, 최다 연속 인원 공개, 다섯 명 스트레이트와 여섯 명 이상 무효, X의 탈락 후보 규칙까지.',
    keywords: ['자리 바꾸기', '자리바꾸기 게임', '더 지니어스 자리 바꾸기', '룰 브레이커 자리 바꾸기', '더 지니어스2'],
  },
  title: '자리 바꾸기 — 더 지니어스: 룰 브레이커 2회전 메인 매치',
  name: '자리 바꾸기',
  lead: '각자 남몰래 번호를 받고 둥글게 앉아요. 번호가 이어지는 다섯 명이 나란히 앉으면 끝. 그런데 번호는 라운드마다 하나씩 올라가요.',
  summary: '라운드마다 바뀌는 비밀 번호로, 연속된 다섯 명이 나란히 앉는 스트레이트를 만드는 자리 교환 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 12명. 1–11과 X 중 하나를 비밀 고유번호로 받아요.',
      '**자리**: 원하는 자리에 앉은 뒤 각자 자기 번호만 확인해요.',
      '**스트레이트**: 고유번호가 연속된 5명이 나란히 앉은 상태. 11 다음은 1로 이어져요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '번호 확인과 공개', body: '모두 앉으면 자기 번호를 확인하고, 지금 가장 길게 이어 앉은 인원수(최다 연속 인원)가 공개돼요.' },
      { title: '자리 바꾸기', body: '라운드마다 한 번, 두 사람이 서로 동의하면 자리를 맞바꿀 수 있어요.' },
      { title: '다시 공개', body: '교환 시간이 끝나면 최다 연속 인원이 다시 공개돼요. 이때 스트레이트가 있으면 게임이 끝나요.' },
      { title: '번호 올리기', body: '끝나지 않았다면 다음 라운드 시작 때 모두의 번호가 1씩 올라가요. 11은 X가 되고, X는 1이 돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '스트레이트에 든 5명은 모두 생명의 징표를 받아요.',
      '스트레이트의 가운데 사람은 우승자가 되어 가넷과 불멸의 징표 단서를 받아요.',
      '게임이 끝날 때 **X인 사람이 탈락 후보**가 되어, 생명의 징표가 없는 사람 중 데스매치 상대를 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'X가 끼면 스트레이트가 되지 않아요. 연속된 사람이 6명 이상이어도 스트레이트로 인정되지 않아요.',
      '가운데 사람의 가넷 보상은 정리마다 달라요. 나무위키는 10개, 영어 위키백과는 5개로 적고 있어 숫자는 확정하지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '자리 바꾸기는 **연합을 만드는 게임이지만, 연합이 시간에 따라 무너지게 설계**돼 있어요. 다섯 명이 번호를 서로 알려 주고 모이면 스트레이트는 어렵지 않은데, 번호가 매 라운드 오르면서 가장 높은 번호부터 차례로 X가 돼요.' },
    { type: 'cards', items: [
      { title: 'X가 될 사람은 정해져 있다', body: '번호가 1씩 오르니, 지금 11인 사람이 다음 라운드의 X예요. 연합 안에서 가장 높은 번호의 사람은 곧 스트레이트를 막는 존재가 되고, 나머지는 그 사람을 버리고 새 사람을 들일지 고민해요. 그래서 높은 번호일수록 빨리 끝내고 싶고, 낮은 번호일수록 서두르지 않아도 돼요.' },
      { title: '여섯 번째 사람', body: '스트레이트는 정확히 다섯 명이라, 이미 모인 다섯 옆에 번호가 이어지는 여섯 번째 사람이 앉으면 무효가 돼요. 스트레이트 밖에 있는 사람은 데스매치 상대가 될 수 있으니, 방해하려는 동기가 분명해요. 교환은 쌍방 동의가 필요하지만, 바로 옆자리 사람에게는 그 교환을 거절할 이유가 별로 없어요.' },
      { title: '공개되는 숫자 하나', body: '공개되는 것은 최다 연속 인원뿐이라, 누가 거짓 번호를 말했는지는 교환 결과로만 짐작할 수 있어요. 한 번의 교환 뒤 숫자가 어떻게 변했는지가 중요한 단서예요.' },
    ], columns: 1 },
    { type: 'p', text: '혼자서는 절대 이길 수 없는 구조라 **개인 우월 전략은 없어요.** 다만 X가 될 순서가 미리 정해져 있다는 점 때문에, 낮은 번호를 가진 사람이 협상에서 더 유리한 자리에 서요.' },
  ],
  similar: [
    { name: '보난자 (Bohnanza)', players: '3–5명', alike: '서로 동의해야만 거래가 성립하고, 거래의 이익이 한쪽에 쏠리면 협상이 깨져요.', differs: '보난자는 콩 카드를 밭에 심어 점수를 내는 게임이고, 자리나 번호 개념이 없어요.' },
    { name: '코스믹 인카운터 (Cosmic Encounter)', players: '3–5명', alike: '혼자서는 이기기 어렵고, 협상으로 연합을 짰다가 상황에 따라 바꾸는 것이 핵심이에요.', differs: '코스믹 인카운터는 외계 종족마다 특수 능력이 있고, 행성을 차지해 이겨요.' },
  ],
}, {
  meta: {
    title: 'Seat Exchange rules — The Genius: Rule Breaker, round 2 main match',
    description: 'The rules of Seat Exchange (자리 바꾸기) from The Genius: Rule Breaker: secret numbers 1–11 and X that rise each round, swaps by mutual consent, the announced longest run, a straight of exactly five, and the X player as Death Match candidate.',
    keywords: ['Seat Exchange', 'The Genius Seat Exchange', 'The Genius Rule Breaker', '자리 바꾸기', '더 지니어스2'],
  },
  title: 'Seat Exchange — The Genius: Rule Breaker, round 2 main match',
  name: 'Seat Exchange (자리 바꾸기)',
  lead: 'Everyone gets a secret number and sits in a circle. Five consecutive numbers side by side end the game — but every number goes up by one each round.',
  summary: 'A seat-swapping game where secret, ever-rising numbers must form a straight of five neighbours.',
  setup: [
    { type: 'list', items: [
      '**Players**: 12, each secretly given a number from 1 to 11 or X.',
      '**Seats**: players sit where they like, then each sees only their own number.',
      '**Straight**: five players with consecutive numbers seated side by side; 11 wraps to 1.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Numbers and count', body: 'Once seated, players see their numbers and the length of the longest consecutive run at the table is announced.' },
      { title: 'Swap', body: 'Once per round, two players may swap seats if both agree.' },
      { title: 'Count again', body: 'After the swapping time the longest run is announced again; a straight ends the game.' },
      { title: 'Numbers rise', body: 'Otherwise every number goes up by one at the start of the next round: 11 becomes X and X becomes 1.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'All five players in the straight receive a Token of Life.',
      'The player in the middle of the straight wins, receiving garnets and a clue to the Token of Immortality.',
      '**Whoever is X at the end** is the Death Match candidate and names an opponent without a Token of Life.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A run containing X is not a straight, and neither is a run of six or more.',
      'The sources disagree on the middle player’s garnets (ten in the fan wiki, five in English Wikipedia), so the number is left open.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Seat Exchange is an **alliance game built so that alliances decay over time**. Five players who share numbers can line up easily, but numbers rise every round, so the highest number in any group becomes X next.' },
    { type: 'cards', items: [
      { title: 'You know who becomes X', body: 'Whoever holds 11 now is X next round. The highest number in an alliance is about to block its straight, and the rest weigh dropping them for someone new — so high numbers want to finish fast and low numbers can afford to wait.' },
      { title: 'The sixth player', body: 'A straight must be exactly five, so a sixth consecutive number sitting next to the five spoils it. Anyone outside the straight can be named for the Death Match, so the motive to spoil is strong, and the neighbour asked to make that swap has little reason to refuse.' },
      { title: 'One public number', body: 'Only the longest run is announced, so lies about numbers show up only through how that count changes after a swap.' },
    ], columns: 1 },
    { type: 'p', text: 'Nobody can win alone, so **there is no individual dominant strategy**; but because the order of becoming X is fixed in advance, low numbers negotiate from strength.' },
  ],
  similar: [
    { name: 'Bohnanza', players: '3–5', alike: 'Trades happen only by mutual consent, and lopsided deals break down.', differs: 'It is about planting bean cards for points; no seats or numbers.' },
    { name: 'Cosmic Encounter', players: '3–5', alike: 'Hard to win alone; negotiated alliances form and shift with the situation.', differs: 'Alien powers and planets, not seats.' },
  ],
});

export const sunMoonStar = g2Game({ slug: 'sun-moon-star', kind: 'death', rounds: [2, 4], related: ['hitStay', 'indianPoker', 'russianRoulette'], check: 'two' }, {
  meta: {
    title: '해 달 별 규칙 — 더 지니어스 시즌2 룰 브레이커 2·4회전 데스매치, 관전자의 표식에 거는 베팅',
    description: '더 지니어스: 룰 브레이커 2·4회전 데스매치 해 달 별의 규칙을 정리했어요. 관전자가 컵 아래 숨긴 해·달·별 표식, 칩 4개, 선 플레이어의 베팅 한도와 후 플레이어의 두 배 베팅, 분산 베팅과 배당, 관전자의 가넷 베팅까지.',
    keywords: ['해 달 별', '해달별', '해달별 게임', '더 지니어스 해 달 별', '룰 브레이커 데스매치', '더 지니어스2'],
  },
  title: '해 달 별 — 더 지니어스: 룰 브레이커 2·4회전 데스매치',
  name: '해 달 별',
  lead: '관전자들이 해·달·별 중 하나를 컵 아래 숨겨요. 두 사람은 그 표식을 맞히는 데 칩을 걸어요. 표식을 아는 건 관전자뿐이에요.',
  summary: '관전자가 숨긴 해·달·별을 맞히는 베팅 데스매치. 이 시즌에 두 번 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명과 관전자들. 관전자 수만큼 라운드를 해요(2회전은 10명, 4회전은 8명).',
      '**표식**: 관전자는 제비뽑기로 순서를 정하고, 해·달·별 중 하나를 골라 자기 컵 아래 숨겨요.',
      '**칩**: 두 진출자는 칩 4개씩으로 시작해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선후 정하기', body: '두 사람이 라운드마다 번갈아 선 플레이어가 돼요. 1라운드 선 플레이어는 나무위키 기준 가넷이 많은 사람이 정해요.' },
      { title: '선 베팅', body: '선 플레이어는 그 라운드 관전자의 표식에 0개부터 **상대 칩의 절반**까지 걸 수 있어요.' },
      { title: '후 베팅', body: '후 플레이어는 선 플레이어가 건 칩의 두 배를 걸어야 해요. 두 사람 모두 여러 표식에 나눠 걸 수 있어요.' },
      { title: '확인', body: '컵을 열어 표식을 확인해요. 맞힌 칩은 세 배로 돌려받고(건 칩 포함, 2:1 배당), 틀린 칩은 딜러가 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '마지막 라운드가 끝났을 때 **칩이 적은 사람이 탈락**해요.',
      '도중에 칩을 모두 잃어도 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '관전자들은 데스매치 결과에 자기 가넷을 걸 수 있었어요. 맞히면 두 배를 받고, 틀리면 주최 측이 가져가요.',
      '관전자는 자기 표식을 진출자에게 알려 줄 수 있어요(영어 위키백과).',
      '정리마다 다른 부분: 나무위키는 후 베팅을 "두 배 이상", 영어 위키백과는 "정확히 두 배"로, 1라운드 선 플레이어도 각각 "가넷이 많은 사람이 정함"과 "가넷이 적은 사람부터"로 적고 있어요.',
      '같은 게임이 2회전과 4회전에 같은 규칙으로 쓰였고, 라운드 수만 관전자 수에 따라 달라졌어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '해 달 별은 겉보기에는 베팅 심리전이지만, 실제로는 **관전자에게서 표식 정보를 얼마나 얻느냐**의 싸움이에요. 표식을 아는 쪽이 있으면 승부가 사실상 정해져요.' },
    { type: 'cards', items: [
      { title: '베팅 한도가 커지는 구조', body: '선 플레이어는 상대 칩의 절반까지, 후 플레이어는 그 두 배를 걸어요. 상대가 가진 칩 전부를 후 플레이어가 걸 수 있는 셈이라, 칩이 늘어날수록 한 라운드에 걸리는 양도 빠르게 커져요. 후반의 우호적인 관전자 라운드에서 후 플레이어가 되는 것이 가장 큰 기회예요.' },
      { title: '심리전이 생기는 순간은 하나', body: '둘 다 표식을 알면 둘 다 맞히고, 둘 다 모르면 운이에요. 한쪽만 알 때 비로소 상대의 베팅을 보고 판단하는 심리전이 생겨요. 분산 베팅으로 손실을 줄일 수 있지만, 세 표식에 고르게 나눠 걸면 기대 수익이 0이에요.' },
      { title: '선후 순서 짜기', body: '라운드 순서는 미리 정해지고 선후는 번갈아 바뀌어요. 그래서 1라운드 선을 누가 잡느냐에 따라, 어떤 관전자의 차례에 내가 후 플레이어가 될지가 결정돼요.' },
    ], columns: 1 },
    { type: 'p', text: '관전자들이 결과에 가넷을 걸 수 있어서, 관전자 다수가 한쪽을 밀어주는 구도가 생기기 쉬워요. 진출자 개인의 실력으로 뒤집을 여지가 적어, **정보를 가진 쪽이 지배하는 게임**이에요.' },
  ],
  similar: [
    { name: '카멜 업 (Camel Up)', players: '2–8명', alike: '결과가 나오기 전에 예측에 걸고, 맞히면 배당을 받아요.', differs: '카멜 업은 주사위로 낙타 경주 결과가 정해지고, 정보를 주는 사람이 따로 없어요.' },
    { name: '스컬 (Skull)', players: '3–6명', alike: '숨겨진 표식을 두고 얼마나 걸지 겨루는 블러핑 게임이에요.', differs: '스컬은 내가 숨긴 패를 남이 맞히는 구조이고, 칩 배당이 없어요.' },
  ],
}, {
  meta: {
    title: 'Sun, Moon, Star rules — The Genius: Rule Breaker, rounds 2 and 4 Death Match',
    description: 'The rules of Sun, Moon, Star (해 달 별) from The Genius: Rule Breaker: symbols hidden under onlookers’ cups, four chips each, the first bettor’s limit and the second’s double bet, split bets and 2:1 payouts, and onlookers betting garnets on the result.',
    keywords: ['Sun Moon Star', 'The Genius Sun Moon Star', 'The Genius Rule Breaker death match', '해 달 별', '해달별'],
  },
  title: 'Sun, Moon, Star — The Genius: Rule Breaker, rounds 2 and 4 Death Match',
  name: 'Sun, Moon, Star (해 달 별)',
  lead: 'Each onlooker hides a sun, moon or star under a cup; the two candidates bet chips on which. Only the onlookers know.',
  summary: 'A betting Death Match on symbols hidden by the onlookers, used twice in the season.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates and the onlookers; there is one round per onlooker (ten in round 2, eight in round 4).',
      '**Symbols**: onlookers draw an order and hide a sun, moon or star under their cup.',
      '**Chips**: both candidates start with four.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Order', body: 'The candidates alternate as first bettor; per the fan wiki the player with more garnets decides who starts.' },
      { title: 'First bet', body: 'The first bettor stakes from zero up to **half of the opponent’s chips** on that onlooker’s symbol.' },
      { title: 'Second bet', body: 'The other must stake twice that amount; both may split chips across symbols.' },
      { title: 'Reveal', body: 'The cup is lifted. Correct chips come back threefold (stake included, 2:1 odds); wrong chips go to the dealer.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After the last round, **the player with fewer chips is eliminated**.',
      'Losing every chip earlier also means elimination.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Onlookers could bet their own garnets on the result, doubling them if right and losing them to the house if wrong.',
      'Onlookers may tell the candidates their symbols (English Wikipedia).',
      'The sources differ: the fan wiki has the second bet as "at least double" and the richer player choosing who starts; English Wikipedia says "exactly double" and that the poorer player bets first.',
      'Rounds 2 and 4 used the same rules; only the number of rounds changed with the number of onlookers.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It looks like a betting duel, but Sun, Moon, Star is really about **how much symbol information you can get from the onlookers**. If one side knows, the result is close to settled.' },
    { type: 'cards', items: [
      { title: 'Limits that grow', body: 'The first bettor may stake half the opponent’s chips and the second must stake double that — up to the opponent’s whole stack — so the amounts snowball. Being second bettor on a late, friendly onlooker is the biggest chance in the game.' },
      { title: 'Only one case is a mind game', body: 'If both know the symbol both win; if neither does it is luck. Only when one side knows does reading the other’s bet matter. Splitting limits losses, but an even split over three symbols has zero expected gain.' },
      { title: 'Planning the order', body: 'The onlooker order is fixed in advance and first bettor alternates, so who starts round 1 decides on which onlookers you will be the second bettor.' },
    ], columns: 1 },
    { type: 'p', text: 'Because onlookers can bet garnets on the result, a majority backing one candidate forms easily. There is little room for individual skill: **it is a game ruled by whoever holds the information**.' },
  ],
  similar: [
    { name: 'Camel Up', players: '2–8', alike: 'Bet on a prediction before the result and get paid if right.', differs: 'Dice decide a camel race; nobody supplies inside information.' },
    { name: 'Skull', players: '3–6', alike: 'A bluffing game about hidden markers and how much to commit.', differs: 'Players guess others’ hidden discs; no chip odds.' },
  ],
});

export const kingGame = g2Game({ slug: 'king-game', kind: 'main', rounds: [3], related: ['blackWhite', 'blackWhite2', 'twoSidedPoker'], check: 'two' }, {
  meta: {
    title: '왕 게임 규칙 — 더 지니어스 시즌2 룰 브레이커 3회전 메인 매치, 엄지와 검지의 소수결',
    description: '더 지니어스: 룰 브레이커 3회전 메인 매치 왕 게임의 규칙을 정리했어요. 두 라운드마다 고르는 엄지·검지, 왕이 나누는 A·B 구역, 구역마다 적은 쪽이 얻는 승점, 11라운드 왕위 승계, 데스매치 진출 규칙, 가넷으로 구역을 옮기는 반역의 징표까지.',
    keywords: ['왕 게임', '왕게임', '더 지니어스 왕 게임', '룰 브레이커 왕 게임', '엄지 검지 게임', '더 지니어스2'],
  },
  title: '왕 게임 — 더 지니어스: 룰 브레이커 3회전 메인 매치',
  name: '왕 게임',
  lead: '모두 엄지나 검지 중 하나를 골라요. 왕이 사람들을 두 구역으로 나누면, 구역마다 적은 쪽을 고른 사람이 점수를 얻어요.',
  summary: '왕이 나눈 두 구역에서 엄지·검지 중 소수 쪽이 점수를 얻는 11라운드 소수결 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 11명.',
      '**손가락**: 두 라운드마다 엄지와 검지 중 하나를 골라요. 같은 손가락을 두 라운드 동안 유지해요.',
      '**반역의 징표**: 모두 하나씩 가져요. 가넷을 내고 쓰면 자기 구역을 옮길 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '첫 왕', body: '1라운드에는 투표로 왕을 정해요.' },
      { title: '구역 나누기', body: '왕은 사람들을 A 구역과 B 구역으로 마음대로 나눠요. 한 구역에는 최소 2명을 보내야 해요.' },
      { title: '판정', body: '구역마다 엄지와 검지 중 고른 사람이 더 적은 쪽이 승점 1점을 얻어요. 수가 같거나 한쪽으로만 몰리면 아무도 얻지 못해요.' },
      { title: '왕위 승계', body: '라운드가 끝나면 왕은 아직 왕을 하지 않은 사람에게 왕위를 넘겨요. 11라운드 동안 모두가 한 번씩 왕이 돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '11라운드가 끝났을 때 **승점이 가장 높은 사람이 우승**해 불멸의 징표 단서를 받아요.',
      '승점이 가장 낮은 사람이 여럿이면 모두 데스매치에 가요. 가장 낮은 사람이 한 명뿐이면 그다음으로 낮은 사람(들)도 함께 데스매치에 가요.',
      '데스매치에 가지 않은 사람은 모두 가넷 1개를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '반역의 징표는 처음 쓰는 사람이 가넷 2개를 내고, 쓸 때마다 필요한 가넷이 1개씩 늘어나요.',
      '반역의 징표는 규칙 영상에는 나오지 않았고 게임 중에 안내된 것으로 정리돼 있어요(나무위키). 영어 위키백과에는 이 징표가 적혀 있지 않아요.',
      '라운드가 끝날 때 승점을 얻은 사람이 공지되므로, 두 번째 라운드에서는 남들이 어떤 손가락을 들었는지 짐작할 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '왕 게임은 **소수결 게임에 "구역을 나누는 권력"을 더한 것**이에요. 구역 안에서 소수 쪽만 점수를 얻으니, 왕이 누구를 어느 구역에 넣느냐가 곧 누구에게 점수를 줄지 정하는 일이에요.' },
    { type: 'cards', items: [
      { title: '두 라운드 고정의 의미', body: '손가락은 두 라운드 동안 그대로예요. 첫 라운드 결과로 누가 점수를 얻었는지 공지되면, 다음 왕은 사람들의 손가락을 상당 부분 알고 구역을 나눌 수 있어요. 홀수 라운드의 왕보다 짝수 라운드의 왕이 훨씬 정확하게 점수를 몰아줄 수 있어요.' },
      { title: '2명 구역의 힘', body: '엄지 1명과 검지 1명을 한 구역에 넣으면 동수라 아무도 못 얻고, 같은 손가락 2명을 넣으면 한쪽으로 몰려 역시 아무도 못 얻어요. 반대로 엄지 1명·검지 2명처럼 3명이면 엄지가 점수를 얻어요. 왕은 작은 구역을 이용해 특정한 사람을 점수에서 배제할 수 있어요.' },
      { title: '반역은 비싸질수록 늦게 쓴다', body: '반역의 징표는 쓸수록 비싸져서, 먼저 쓰는 사람이 가장 싸게 써요. 하지만 왕은 반역을 예상하고 구역을 짤 수 있으니, 마지막 라운드처럼 되돌릴 기회가 없는 순간에 가장 효과가 커요.' },
    ], columns: 1 },
    { type: 'p', text: '열한 명이 모두 한 번씩 왕이 되니 권력은 공평하게 돌아가요. 그래서 **왕이 됐을 때 누구에게 점수를 줄지 약속하는 연합**이 승부를 가르고, 연합에 끼지 못한 사람이 왕들의 구역 배치로 계속 점수를 잃는 구조예요. 혼자서 통하는 우월 전략은 없어요.' },
  ],
  similar: [
    { name: '레지스탕스: 아발론 (The Resistance: Avalon)', players: '5–10명', alike: '리더 역할이 돌아가며 원정대를 고르고, 누구를 넣고 뺄지가 곧 정치예요.', differs: '아발론은 숨은 선악 진영과 원정 성공·실패로 승부가 나요.' },
    { name: '캐시 앤 건즈 (Cash ’n Guns)', players: '4–8명', alike: '모두 동시에 비밀 선택을 하고, 남들과 겹치는지에 따라 결과가 달라져요.', differs: '캐시 앤 건즈는 총구를 겨누는 블러핑으로 전리품을 나누고, 소수결 판정은 없어요.' },
  ],
}, {
  meta: {
    title: 'King Game rules — The Genius: Rule Breaker, round 3 main match',
    description: 'The rules of the King Game (왕 게임) from The Genius: Rule Breaker: thumb or index finger chosen every two rounds, the king splitting players into areas A and B, the minority in each area scoring, the crown passing over eleven rounds, the Death Match rule, and the garnet-priced Token of Rebellion.',
    keywords: ['King Game', 'The Genius King Game', 'The Genius Rule Breaker', '왕 게임', '더 지니어스2'],
  },
  title: 'King Game — The Genius: Rule Breaker, round 3 main match',
  name: 'King Game (왕 게임)',
  lead: 'Everyone shows a thumb or an index finger. The king splits players into two areas, and in each area whoever chose the rarer finger scores.',
  summary: 'An eleven-round minority game where the king decides who stands in which area.',
  setup: [
    { type: 'list', items: [
      '**Players**: 11.',
      '**Fingers**: every two rounds each player chooses thumb or index finger and keeps it for both rounds.',
      '**Token of Rebellion**: everyone has one; paying garnets lets you switch areas.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'First king', body: 'The round 1 king is chosen by vote.' },
      { title: 'Split', body: 'The king divides players into area A and area B as they like, with at least two in an area.' },
      { title: 'Score', body: 'In each area, the finger chosen by fewer players scores a point for them; a tie or a unanimous area scores nothing.' },
      { title: 'Pass the crown', body: 'The king passes the crown to someone who has not been king; over eleven rounds everyone reigns once.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After eleven rounds **the top scorer wins** and gets a clue to the Token of Immortality.',
      'If several share the lowest score they all go to the Death Match; if one player alone is lowest, the next-lowest player(s) go too.',
      'Everyone not in the Death Match earns one garnet.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The first Token of Rebellion costs two garnets, and each later use costs one more.',
      'Per the fan wiki the token was not in the rules video and was announced during play; English Wikipedia does not mention it.',
      'Scorers are announced after each round, so in the second round of a pair others’ fingers can be inferred.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The King Game is **a minority game plus the power to draw the areas**. Only the minority in an area scores, so placing players is choosing who scores.' },
    { type: 'cards', items: [
      { title: 'Why the two-round lock matters', body: 'Fingers stay fixed for two rounds, and the first round’s scorers are announced. The next king can then infer most fingers and steer points precisely, so even-round kings hold far more power than odd-round ones.' },
      { title: 'The two-player area', body: 'One thumb and one index finger tie; two of the same finger are unanimous; either way nobody scores. With three — say one thumb, two index — the thumb scores. Small areas let a king shut specific players out of points.' },
      { title: 'Rebel late', body: 'The token gets dearer with use, so the first user pays least; but kings can plan around it, so it bites hardest when nothing can undo it, such as the last round.' },
    ], columns: 1 },
    { type: 'p', text: 'With every player reigning once, power is evenly spread, so **alliances that promise points to each other when crowned** decide it, and anyone outside them keeps losing points to the kings’ placements. No strategy works alone.' },
  ],
  similar: [
    { name: 'The Resistance: Avalon', players: '5–10', alike: 'A rotating leader picks teams, and who is put in or left out is the politics.', differs: 'Hidden good and evil sides and missions decide it.' },
    { name: "Cash 'n Guns", players: '4–8', alike: 'Everyone makes a secret choice at once and the outcome depends on overlaps.', differs: 'It is a bluffing game of pointing foam guns over loot; no minority scoring.' },
  ],
});

export const gyulHap = g2Game({
  slug: 'gyul-hap', kind: 'death', rounds: [3], related: ['hexagon', 'nemoCount', 'equationTower'], check: 'two',
  extra: [namuGame('결! 합!', 'Gyul! Hap!')],
  site: { id: 'gyulhap', name: { ko: '결! 합!', en: 'Gyul! Hap!' }, file: 'src/lib/gyulhap.ts, src/lib/gyulhapRoom.ts' },
}, {
  meta: {
    title: '결! 합! 규칙 — 더 지니어스 시즌2 룰 브레이커 3회전 데스매치, 세 속성이 모두 같거나 다른 세 장',
    description: '더 지니어스: 룰 브레이커 3회전 데스매치 결! 합!의 규칙을 정리했어요. 도형·도형 색·배경색 27장 중 9장, 합의 조건, 10초 차례, 합 +1·−1, 결 +3·−1, 연속 패스로 끝나는 라운드, 10라운드. 시즌1과 달라진 점, PUZZLTHINK에서 바로 플레이.',
    keywords: ['결합', '결! 합!', '결합 게임', '더 지니어스 결합', '룰 브레이커 결합', '더 지니어스 데스매치'],
  },
  title: '결! 합! — 더 지니어스: 룰 브레이커 3회전 데스매치',
  name: '결! 합!',
  lead: '그림 9장 중에서 세 속성이 모두 같거나 모두 다른 세 장(합)을 찾아요. 더 이상 합이 없다고 생각되면 "결!"을 외쳐요.',
  summary: '9장의 그림에서 합을 찾고 마지막에 결을 외치는 관찰력 대결. 더 지니어스 네 시즌에 모두 나온 게임이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**그림**: 도형(○△□), 도형 색(파랑·빨강·노랑), 배경색(흰색·회색·검은색)의 조합 27장.',
      '**합**: 세 속성 각각이 세 장 모두 같거나 모두 다른 세 장의 묶음.',
      '**판**: 라운드마다 27장 중 9장이 공개돼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '차례', body: '두 사람이 번갈아 10초씩 차례를 가져요.' },
      { title: '합', body: '합을 찾았다면 "합!"을 외치고 그림 번호 세 개를 말해요. 맞으면 +1점, 틀리면 −1점이에요.' },
      { title: '결', body: '남은 합이 없다고 판단되면 "결!"을 외쳐요. 정말 없으면 +3점을 얻고 라운드가 끝나요. 아직 합이 남아 있으면 −1점이고 차례가 넘어가요.' },
      { title: '패스', body: '차례에 아무것도 외치지 않으면 점수 변화 없이 상대에게 넘어가요. 계속 패스만 이어지면 라운드가 끝나요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '10라운드 뒤 **승점이 높은 사람이 이겨요.** 진 사람이 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '"합!"을 외친 뒤 번호를 말하지 못하면 틀린 것으로 봐요.',
      '이미 나온 합을 다시 말해도 점수가 되지 않아요.',
      '시즌1 결승 때와 달리, 패스가 이어지면 라운드가 끝나는 규칙이 더해졌어요. 몇 번 연속인지는 정리마다 달라요(나무위키 6번, 영어 위키백과 5번).',
      '결! 합!은 더 지니어스 시즌1–4에 모두 나온 게임이에요. 다른 시즌의 규칙은 해당 시즌 페이지에서 따로 다뤄요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '결! 합!은 **빠른 탐색과 완전한 탐색**을 동시에 요구해요. 합 하나는 1점이지만 마지막 결은 3점이라, 판에 있는 합을 빠짐없이 세는 사람이 라운드마다 큰 점수를 가져가요.' },
    { type: 'cards', items: [
      { title: '두 장이면 세 번째가 정해진다', body: '어떤 두 장을 고르든, 그 둘과 합이 되는 세 번째 그림은 27장 중 정확히 하나예요. 속성마다 둘이 같으면 같은 값, 다르면 남은 값이니까요. 그래서 판의 두 장씩을 차례로 보며 "필요한 세 번째가 판에 있나"만 확인하면, 9장에서 36쌍을 빠짐없이 훑을 수 있어요.' },
      { title: '결은 계산 싸움', body: '9장에서 나올 수 있는 합은 많지 않아서, 남은 합이 없는지 확인하는 것이 핵심이에요. 상대가 합을 하나 말할 때마다 남은 목록에서 지워 두면, 상대가 놓친 순간 결을 외칠 수 있어요. 결을 잘못 외치면 −1점과 함께 차례가 넘어가 상대에게 결을 내줄 수도 있어요.' },
      { title: '패스도 전략', body: '찾은 합이 없을 때 섣불리 외치면 −1점이에요. 확신이 없으면 넘기는 편이 낫지만, 연속 패스로 라운드가 끝나면 결 3점이 아무에게도 가지 않아요. 앞선 사람에게는 패스로 라운드를 끝내는 것이 손해가 아니에요.' },
    ], columns: 1 },
    { type: 'p', text: '두 사람이 같은 판을 보는 순수 실력 게임이라 **우월 전략은 없어요.** 탐색 방법을 정해 두고 실수를 줄이는 쪽이 이겨요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 결! 합!은 27장 구성, 9장 판, 합 +1·−1, 결 +3·−1, 10라운드가 방송과 같아요.',
      '친구 방에서는 2–4명이 차례로 겨루고, 차례 시간은 10·15·20초 중에서 골라요. 시간을 넘기면 패스로 처리해요.',
      '사이트에서는 **연속 패스로 라운드가 끝나지 않아요.** 라운드는 맞는 결이 나와야 끝나요.',
      '혼자 하는 10분·5분 챌린지와 연습 모드가 있고, 혼자 하기에서 틀린 결은 −1점만 받고 같은 판에 남아요.',
    ] },
  ],
  similar: [
    { name: 'SET', players: '1명 이상', alike: '속성마다 모두 같거나 모두 다른 세 장을 찾는 규칙이 결! 합!과 같아요.', differs: 'SET은 속성이 네 가지(81장)이고, 차례 없이 먼저 외친 사람이 가져가며 "결" 같은 마무리 선언이 없어요.' },
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '여러 그림 중 조건에 맞는 것을 남보다 빨리 찾아 외쳐요.', differs: '도블은 두 카드에 공통으로 있는 그림 하나를 찾는 순발력 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Gyul! Hap! rules — The Genius: Rule Breaker, round 3 Death Match',
    description: 'The rules of Gyul! Hap! (결! 합!) from The Genius: Rule Breaker: 27 pictures of shape, colour and background, nine on the table, what makes a hap, ten-second turns, hap +1/−1, gyul +3/−1, rounds ending after repeated passes, ten rounds — how it differs from season 1, and play it on PUZZLTHINK.',
    keywords: ['Gyul Hap', 'Gyul! Hap!', 'The Genius Gyul Hap', 'Same or Different', '결합 게임'],
  },
  title: 'Gyul! Hap! — The Genius: Rule Breaker, round 3 Death Match',
  name: 'Gyul! Hap! (결! 합!)',
  lead: 'Find three of nine pictures whose attributes are each all the same or all different (a hap). When you think none are left, shout "Gyul!"',
  summary: 'A duel of spotting haps among nine pictures and calling gyul at the end — the one game used in all four seasons of The Genius.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two Death Match candidates.',
      '**Pictures**: 27 combinations of shape (circle, triangle, square), shape colour (blue, red, yellow) and background (white, grey, black).',
      '**Hap**: three pictures where each attribute is all the same or all different.',
      '**Board**: nine of the 27 are shown each round.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Turns', body: 'Players alternate ten-second turns.' },
      { title: 'Hap', body: 'Shout "Hap!" and name three picture numbers: +1 if right, −1 if wrong.' },
      { title: 'Gyul', body: 'Shout "Gyul!" if no hap remains: +3 and the round ends if right; −1 and the turn passes if a hap is still there.' },
      { title: 'Pass', body: 'Saying nothing passes the turn with no change; a run of passes ends the round.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After ten rounds **the higher score wins**; the loser is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Shouting "Hap!" without naming numbers counts as wrong.',
      'Repeating a hap already found does not score.',
      'New since the season 1 final: repeated passes end the round. The count differs between sources (six in the fan wiki, five in English Wikipedia).',
      'Gyul! Hap! appeared in all four seasons; other seasons are covered on their own pages.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Gyul! Hap! asks for **fast search and complete search** at once. A hap is worth 1 but the final gyul is worth 3, so whoever counts every hap on the board takes the big points.' },
    { type: 'cards', items: [
      { title: 'Two cards fix the third', body: 'For any two pictures exactly one of the 27 completes a hap — the same value where they match, the missing value where they differ. Checking whether that third picture is on the table for each of the 36 pairs sweeps the board without gaps.' },
      { title: 'Gyul is bookkeeping', body: 'Nine pictures hold few haps, so the real task is knowing when none are left. Crossing off each hap your opponent names lets you call gyul the moment they miss; a wrong gyul costs a point and hands them the turn.' },
      { title: 'Passing is a move', body: 'Guessing costs a point, so passing is safer when unsure — but a round ended by passes gives the 3 points to nobody, which suits the player in front.' },
    ], columns: 1 },
    { type: 'p', text: 'Both players see the same board, so **there is no dominant strategy**; a fixed search method and fewer mistakes win.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      "PUZZLTHINK's Gyul! Hap! matches the 27 pictures, nine-card boards, hap +1/−1, gyul +3/−1 and ten rounds.",
      'Rooms with friends take 2–4 players in turn, with 10, 15 or 20-second turns; a timeout counts as a pass.',
      'On the site **passes never end a round**; a round ends only with a correct gyul.',
      'Solo there are 10- and 5-minute challenges and practice; a wrong gyul solo costs one point and keeps the same board.',
    ] },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'The same all-same-or-all-different rule for three cards.', differs: 'SET has four attributes (81 cards), no turns — first to call takes it — and no closing "gyul".' },
    { name: 'Dobble / Spot It!', players: '2–8', alike: 'Race to spot the matching picture and call it.', differs: 'It is about finding the one symbol two cards share.' },
  ],
});
