// 더 지니어스: 블랙가넷, rounds 4–6: 검과 방패, 양면포커, 광부 게임, 폭풍의 증권시장.
import { ep, g3Game, namuGame, round } from './shared';

export const swordsAndShields = g3Game({
  slug: 'swords-and-shields', kind: 'main', when: round(4), episode: ep(4), eps: [4], note: 'two',
  related: ['russianRoulette', 'indianPoker', 'twoSidedPoker'],
}, {
  meta: {
    title: '검과 방패 규칙 — 더 지니어스 시즌3 블랙가넷 4회전 메인매치, 거짓 공격과 의심의 팀전',
    description: '더 지니어스: 블랙가넷 4회전 메인매치 검과 방패의 규칙을 정리했어요. 베리타·팔소 5:5, 숨은 리더, 검·쌍검·방패·맨손 배분, 왼손·오른손 선언, 의심 성공과 실패, 블랙가넷 보상까지, 그리고 무기 수를 세면 보이는 것.',
    keywords: ['검과 방패', '더 지니어스 검과 방패', '더 지니어스3 검과방패', '블랙가넷 4회전', '베리타 팔소', '지니어스 블러핑 게임'],
  },
  title: '검과 방패 — 더 지니어스: 블랙가넷 4회전 메인매치',
  name: '검과 방패',
  lead: '두 팀이 번갈아 "왼손 검으로 공격합니다"처럼 선언만 하고 싸워요. 무기는 보여 주지 않아서 공격도 방어도 거짓일 수 있어요. 숨은 리더가 쓰러지면 그 팀이 져요.',
  summary: '무기를 숨긴 채 선언만으로 공격·방어하고, 거짓을 의심으로 잡아내는 5:5 블러핑 팀전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 10명. 드래프트로 **베리타(Verita)** 5명과 **팔소(Falso)** 5명으로 나눠요.',
      '**리더**: 팀마다 제비뽑기로 한 명. 같은 팀원에게도 알려지지 않아요.',
      '**무기(팀당)**: 검 4(상대 한 명에게 피해 1번), 쌍검 1(피해 2번), 방패 3(공격을 3번까지 막음), 맨손 2(아무 능력 없음). 팀이 상의해 한 사람당 두 개씩 나눠요.',
      '**장착**: 각자 받은 두 개를 왼팔·오른팔에 몰래 달아요. 위치는 끝까지 못 바꿔요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '순서', body: '팀마다 공격 순서를 정하고, 동전으로 선공 팀을 정해요. 두 팀이 한 명씩 번갈아 공격해요.' },
      { title: '공격 선언', body: '공격자는 상대 한 명과 손을 골라 "오른손 검으로 ○○를 공격"처럼 말로만 선언해요. 공격하고 싶지 않으면 패스할 수 있어요.' },
      { title: '방어 선언', body: '공격받은 사람도 무기를 보이지 않고 어느 손으로 막을지 선언해요. 막지 못하면 그 자리에서 사망하고, 무기는 공개되지 않아요.' },
      { title: '의심', body: '누구든 **바로 직전에 선언된 무기**를 의심할 수 있어요. 의심받은 사람이 무기를 공개해, 선언과 다르면 그 무기는 효과가 없고 의심받은 사람이 사망해요. 선언과 같으면 효과가 그대로 나고 **의심한 사람**이 사망해요.' },
      { title: '라운드', body: '모두 한 번씩 공격하면 라운드가 끝나고 다음 라운드는 선후공이 바뀌어요. 사망자가 생기면 다음 사람이 순번을 당겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 팀의 리더가 사망하는 순간 게임이 끝나요.',
      '이긴 팀은 모두 가넷 2개와 생명의 징표를 받고, 생명의 징표 하나를 더 받아 진 팀의 리더가 아닌 한 명에게 줄 수 있어요.',
      '이긴 팀이 상의해 진 팀에서 탈락후보를 고르고, 탈락후보는 생명의 징표가 없는 사람 중에서 데스매치 상대를 지목해요.',
      '**처음으로 의심에 성공한 사람**은 블랙가넷 1개를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '사망자는 끝날 때까지 공격하지 못해요.',
      '의심은 공격자나 방어자가 아닌 사람도 할 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '검과 방패는 블러핑 게임 「쿠」처럼 **선언과 의심**이 중심이에요. 의심이 틀리면 내가 죽으니, 의심은 확신이 있을 때만 할 수 있어요. 그 확신을 만드는 것은 감이 아니라 **개수**예요.' },
    { type: 'cards', items: [
      { title: '무기 수는 공개 정보다', body: '팀마다 무기 구성이 똑같이 정해져 있어요(검 4, 쌍검 1, 방패 3, 맨손 2). 상대 팀이 지금까지 선언한 무기를 세면, 예를 들어 방패를 쓴다고 말한 사람이 넷째가 되는 순간 거짓이 확실해져요. 한 사람이 두 손으로 같은 무기를 서로 다르게 말해도 모순이 드러나요. 확실한 의심은 블랙가넷까지 가져와요.' },
      { title: '맨손도 공격할 수 있다', body: '선언만 하면 되니 맨손인 사람도 검을 쥔 척 공격할 수 있어요. 들키지 않는 한 손해가 없어서, 상대가 셀 수 있는 정보를 일부러 흐리는 용도로 쓸 수 있어요. 대신 무기를 모두 아는 우리 팀원에게는 거짓이 보여요.' },
      { title: '리더 찾기', body: '리더는 같은 팀도 몰라요. 그래서 팀은 리더를 콕 집어 지킬 수 없고, 상대는 방어 선언의 망설임이나 방패 배분 같은 단서로 리더를 짐작해요. 리더 본인은 방패를 받아 두는 것이 가장 확실한 생존법이지만, 그 선택이 곧 단서가 되기도 해요.' },
    ], columns: 1 },
    { type: 'p', text: '거짓 선언에 정해진 정답이 없어 **우월 전략은 없어요.** 다만 의심의 위험이 커서 실제 게임은 대부분 정직한 선언으로 흘러가고, 승부는 개수로 모순이 생기는 순간을 누가 먼저 잡느냐에서 갈려요.' },
  ],
  similar: [
    { name: '쿠 (Coup)', players: '2–6명', alike: '능력을 선언만 하고 쓰며, 누구든 의심할 수 있고 틀린 쪽이 목숨(카드)을 잃어요.', differs: '개인전이고, 숨겨진 리더나 팀 구성은 없어요.' },
    { name: '블러드 바운드 (BloodBound)', players: '6–12명', alike: '두 진영이 서로를 공격하며 상대의 숨은 리더를 찾아 쓰러뜨려야 이겨요.', differs: '정보가 상처를 입을 때마다 조금씩 공개되고, 세 번째 진영도 끼어들어요.' },
  ],
}, {
  meta: {
    title: 'Swords and Shields rules — The Genius: Black Garnet round 4 main match, bluffed attacks and challenges',
    description: 'The rules of Swords and Shields (검과 방패), round 4 main match of The Genius: Black Garnet: Verita against Falso five on five, hidden leaders, swords, a dual sword, shields and bare hands, left- and right-hand declarations, challenges and their cost, the black-garnet reward, and what counting the weapons reveals.',
    keywords: ['Swords and Shields', 'The Genius Swords and Shields', 'The Genius Black Garnet', 'Verita Falso', '검과 방패'],
  },
  title: 'Swords and Shields — The Genius: Black Garnet, round 4 main match',
  name: 'Swords and Shields (검과 방패)',
  lead: 'Two teams fight by declaration alone—“left-hand sword on so-and-so”—without showing weapons, so attacks and blocks can be lies. A team loses when its hidden leader falls.',
  summary: 'A five-on-five bluffing fight: attack and block by declaration with hidden weapons, and catch the lies by challenging.',
  setup: [
    { type: 'list', items: [
      '**Players**: ten, drafted into **Verita** and **Falso**, five each.',
      '**Leader**: one per team by lot, hidden even from teammates.',
      '**Weapons per team**: 4 swords (one hit on one opponent), 1 dual sword (two hits), 3 shields (block up to three attacks), 2 bare hands (nothing). The team shares them out, two per player.',
      '**Equipping**: each player secretly straps their two items to the left and right arm; positions never change.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Order', body: 'Each team sets its attack order and a coin decides who starts; the teams alternate, one attacker at a time.' },
      { title: 'Attack', body: 'The attacker names an opponent and a hand—“right-hand sword on X”—without showing anything, or passes.' },
      { title: 'Block', body: 'The target declares a hand to block with, also unseen. A target who cannot block dies at once, weapons unrevealed.' },
      { title: 'Challenge', body: 'Anyone may challenge **the declaration just made**. The challenged player shows that weapon: if it differs, it has no effect and they die; if it matches, it works and **the challenger** dies.' },
      { title: 'Rounds', body: 'When everyone has attacked once the round ends and the starting team switches; after deaths the next player moves up.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The game ends the moment a team’s leader dies.',
      'The winners each get 2 garnets and a token of life, plus one more token to give to a loser other than their leader.',
      'The winners choose the elimination candidate from the losing team, who names an opponent without a token.',
      '**The first successful challenge** earns a black garnet.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Dead players make no further attacks.',
      'Players other than the attacker and defender may challenge too.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Like the bluffing game Coup, Swords and Shields turns on **declarations and challenges**. A wrong challenge kills you, so you challenge only when sure, and certainty comes not from instinct but from **counting**.' },
    { type: 'cards', items: [
      { title: 'The weapon count is public', body: 'Every team holds the same set (4 swords, 1 dual sword, 3 shields, 2 bare hands). Counting the other team’s claims exposes a lie for certain—a fourth player claiming a shield, say, or one player’s two hands contradicting each other. A certain challenge also earns the black garnet.' },
      { title: 'Bare hands can attack', body: 'Since only a declaration is needed, a bare-handed player can attack with an imaginary sword at no cost unless challenged, blurring what opponents can count. Teammates, who know the share-out, can see the lie.' },
      { title: 'Finding the leader', body: 'Not even teammates know the leader, so a team cannot shield them on purpose, and opponents read hesitation in blocks or the way shields were shared. Holding a shield is the leader’s surest protection, but that choice is itself a clue.' },
    ], columns: 1 },
    { type: 'p', text: 'There is no right answer to a bluff, so **no dominant strategy** exists. Because challenges are so costly, play tends toward honest declarations, and the game is decided by who first spots a count that cannot be true.' },
  ],
  similar: [
    { name: 'Coup', players: '2–6', alike: 'Powers are used by claim alone, anyone can challenge, and whoever is wrong loses a life (card).', differs: 'Every player is alone; there are no teams or hidden leaders.' },
    { name: 'BloodBound', players: '6–12', alike: 'Two factions attack each other and win by finding and downing the other side’s hidden leader.', differs: 'Information leaks a little with each wound, and a third faction can interfere.' },
  ],
});

export const doubleSidedPoker = g3Game({
  slug: 'double-sided-poker', kind: 'death', when: { ko: '4·5회전', en: 'Rounds 4 and 5' }, episode: { ko: '4·5화', en: 'Episodes 4 and 5' },
  eps: [4, 5], extra: [namuGame('양면포커', 'Double-sided Poker')], note: 'two',
  related: ['twoSidedPoker', 'indianPoker', 'hitStay'],
  site: { id: 'twoSidedPoker', name: { ko: '양면포커', en: 'Two-Sided Poker' }, file: 'src/lib/twoSidedPoker.ts' },
}, {
  meta: {
    title: '양면포커 규칙 — 더 지니어스 시즌3 블랙가넷 4·5회전 데스매치, 앞뒤가 다른 숫자 카드 베팅',
    description: '더 지니어스: 블랙가넷 4·5회전 데스매치 양면포커의 규칙을 정리했어요. 앞면은 공개·뒷면은 나만 보는 양면 카드, 면 선택과 베팅, 양면베팅의 10칩 보너스, 무승부 이월, 칩 30개 규칙과 PUZZLTHINK에서 바로 플레이.',
    keywords: ['양면포커', '양면 포커', '더 지니어스 양면포커', '더 지니어스3 데스매치', '블랙가넷 데스매치', '양면포커 규칙'],
  },
  title: '양면포커 — 더 지니어스: 블랙가넷 4·5회전 데스매치',
  name: '양면포커',
  lead: '카드 앞면은 모두가 보고, 뒷면은 나만 봐요. 어느 면으로 승부할지 골라 칩을 걸고, 두 면 모두로 이길 자신이 있으면 양면베팅으로 10칩을 더 노려요.',
  summary: '앞면은 공개, 뒷면은 비공개인 양면 숫자 카드로 면을 골라 베팅하는 1:1 포커. 상대 칩을 모두 따면 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**카드**: 앞뒤에 서로 다른 숫자가 적힌 양면 카드 90장.',
      '**칩**: 각자 30개.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '배분', body: '딜러가 카드를 한 장씩 **앞면이 보이게** 놓아 줘요. 두 사람 모두 양쪽 앞면을 보고, 뒷면은 자기 것만 확인해요.' },
      { title: '기본 베팅', body: '둘 다 칩 1개씩을 내요.' },
      { title: '면 선택과 베팅', body: '선 플레이어부터 앞면과 뒷면 중 어느 면으로 승부할지 정하고 베팅해요. 한 번 정한 면은 바꿀 수 없어요.' },
      { title: '콜·레이즈·포기', body: '상대가 같은 수만큼 걸면(콜) 바로 두 사람이 고른 면을 공개해 큰 숫자가 이겨요. 더 많이 걸면 공개 없이 베팅이 이어지고, 포기하면 상대가 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '칩을 모두 잃은 사람이 져서 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**양면베팅**: 내 앞면과 뒷면이 둘 다 상대가 고른 면보다 크다고 생각되면 선언해요. 상대가 건 만큼을 앞면·뒷면에 각각, 즉 두 배로 걸어야 해요. 두 면 모두 크면 이기고 상대 칩 10개를 더 가져와요. 한 면이라도 같거나 작으면 상대가 이겨요.',
      '양면베팅을 받고 포기해도 상대에게 칩 10개를 줘야 해요. 양면베팅한 쪽은 져도 10개를 주지 않아요.',
      '두 숫자가 같으면 무승부이고, 그 판의 칩은 다음 판 승자가 모두 가져가요.',
      '카드 숫자의 범위는 이 시즌 자료에 나오지 않아 적지 않았어요. 이후 「그랜드 파이널」에서는 1–10, 앞뒤 홀짝이 다른 카드 200장, 칩 40개로 바뀌어 다시 나왔어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '양면포커의 묘미는 **면을 고르는 순간 정보가 새어 나간다**는 데 있어요. 앞면을 고르면 내 숫자가 그대로 드러나고, 뒷면을 고르면 "앞면보다 뒷면이 낫다고 믿는다"는 사실만 드러나요.' },
    { type: 'cards', items: [
      { title: '앞면 승부는 공개 패', body: '앞면으로 승부하면 상대는 내 숫자를 정확히 알고 자기 두 면과 비교해 콜이나 포기를 고를 수 있어요. 그래서 앞면이 아주 높을 때 말고는 앞면 승부는 정보를 공짜로 주는 셈이에요. 반대로 높은 앞면을 두고 굳이 뒷면을 고르면 "뒷면이 더 높다"는 강한 신호가 되고, 그 신호를 블러핑에 쓸 수도 있어요.' },
      { title: '양면베팅은 확신의 값', body: '양면베팅은 두 배를 걸고 두 면 모두 이겨야 하는 대신, 이기면 10칩, 상대가 포기해도 10칩을 가져와요. 상대가 고른 면이 공개된 앞면이라 숫자를 알 때 가장 계산하기 쉬워요. 상대가 뒷면으로 승부할 때 양면베팅은 모르는 숫자를 두 면 모두로 이겨야 하는 큰 도박이에요.' },
      { title: '칩 30개의 속도', body: '기본 베팅 1개, 양면 보너스 10개라 판이 오래 가지 않아요. 양면 한 번이 판세를 뒤집을 수 있어서, 칩이 적은 쪽은 상대의 앞면이 낮게 나오는 판을 기다렸다가 양면을 노리는 것이 현실적인 역전 경로예요.' },
    ], columns: 1 },
    { type: 'p', text: '양쪽 모두 정보가 절반씩만 있는 포커라 **우월 전략은 없어요.** 다만 앞면 승부를 줄이고, 면 선택 자체를 신호로 쓰는 쪽이 정보 싸움에서 앞서요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 양면포커는 이후 시즌(「그랜드 파이널」) 규칙을 따라요. 1–10 숫자로 앞뒤 홀짝이 서로 다른 50장 × 4세트(200장)와 **칩 40개**로 해요. 블랙가넷 데스매치는 90장, 칩 30개였어요.',
      '기본 베팅, 면 선택, 콜·레이즈·포기, 양면베팅의 10칩 보너스와 포기 시 10칩, 무승부 칩 이월은 같아요.',
      'AI(난이도 선택)나 친구와 온라인으로 하고, 첫 선은 무작위로 정해요.',
    ] },
  ],
  similar: [
    { name: '인디언 포커 (Indian Poker)', players: '2명 이상', alike: '한쪽만 볼 수 있는 숫자를 두고 칩을 걸어, 아는 정보와 모르는 정보가 엇갈려요.', differs: '내 카드는 나만 못 보고 상대만 봐요. 면을 고르는 선택이 없어요.' },
    { name: '바퀴벌레 포커 (Cockroach Poker)', players: '2–6명', alike: '내가 무엇을 내놓았는지에 대한 말과 진실이 엇갈리는 블러핑이에요.', differs: '숫자 비교가 아니라 "이 카드가 무엇이다"라는 주장을 믿을지 말지를 가려요.' },
  ],
}, {
  meta: {
    title: 'Double-sided Poker rules — The Genius: Black Garnet death match, betting on two-faced number cards',
    description: 'The rules of Double-sided Poker (양면포커), death match of rounds 4 and 5 of The Genius: Black Garnet: cards with a public front and a private back, choosing a face and betting, the both-sides bet and its 10-chip bonus, carried-over ties, 30 chips, and a playable version on PUZZLTHINK.',
    keywords: ['Double-sided Poker', 'Two-Sided Poker', 'The Genius poker', 'The Genius death match', '양면포커'],
  },
  title: 'Double-sided Poker — The Genius: Black Garnet, death match of rounds 4 and 5',
  name: 'Double-sided Poker (양면포커)',
  lead: 'Both players see the front of each card; only you see your back. Choose which face to play and bet; if both faces can win, a both-sides bet goes after 10 extra chips.',
  summary: 'Heads-up poker with two-faced number cards—public front, private back. Pick a face, bet, and take all the opponent’s chips.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two death-match players.',
      '**Cards**: 90 cards with a different number on each side.',
      '**Chips**: 30 each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Deal', body: 'The dealer lays one card in front of each player **front up**; both see both fronts, and each checks only their own back.' },
      { title: 'Ante', body: 'Both put in one chip.' },
      { title: 'Face and bet', body: 'The first player chooses to play the front or the back and bets; the face cannot change afterwards.' },
      { title: 'Call, raise, fold', body: 'Matching the bet ends betting: the chosen faces are shown and the higher number wins. Betting more continues without a reveal; folding gives the pot away.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The player who loses every chip is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Both-sides bet**: declared when both your faces should beat the face the opponent chose. You stake the opponent’s bet on each face—double. If both are higher you win and take 10 extra chips; if either is equal or lower, the opponent wins.',
      'Folding to a both-sides bet still costs 10 chips; the both-sides bettor pays no 10 if they lose.',
      'Equal numbers are a tie, and the pot goes to the winner of the next hand.',
      'This season’s sources do not give the range of numbers, so it is left out. The game returned in The Genius: Grand Final with 200 cards numbered 1–10 (opposite parity front and back) and 40 chips.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The heart of Double-sided Poker is that **choosing a face leaks information**. Playing the front shows your exact number; playing the back says only that you think your back beats your front.' },
    { type: 'cards', items: [
      { title: 'Playing the front is playing face up', body: 'Against a front play the opponent knows your number and can compare it with both their faces before calling or folding, so unless the front is very high it gives information away. Choosing the back over a high front sends a strong signal that the back is higher—one you can bluff with.' },
      { title: 'Both sides is the price of certainty', body: 'It doubles the stake and must win on both faces, but pays 10 chips on a win and 10 even when the opponent folds. It is easiest to judge when the opponent played their public front; against a back play it means beating an unknown number twice.' },
      { title: 'Thirty chips go fast', body: 'With a one-chip ante and a 10-chip bonus, games are short and one both-sides win can turn them. The realistic comeback for the short stack is to wait for a low opposing front and go for both sides.' },
    ], columns: 1 },
    { type: 'p', text: 'Each side holds half the information, so **there is no dominant strategy**; the player who plays fewer fronts and uses the face choice itself as a signal wins the information battle.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Two-Sided Poker follows the later Grand Final rules: 50 cards numbered 1–10 with opposite parity front and back, four sets (200 cards), and **40 chips**. The Black Garnet death match used 90 cards and 30 chips.',
      'The ante, face choice, call/raise/fold, the both-sides bet’s 10-chip bonus and fold penalty, and carried-over ties are the same.',
      'You play the AI (choose a level) or a friend online; the first player is random.',
    ] },
  ],
  similar: [
    { name: 'Indian Poker', players: '2+', alike: 'Chips are bet over numbers only one side can see, so known and unknown information cross.', differs: 'You cannot see your own card while your opponent can, and there is no face to choose.' },
    { name: 'Cockroach Poker', players: '2–6', alike: 'A bluffing game where what you say you played and what you played can differ.', differs: 'It is about believing a claim about a card, not comparing numbers.' },
  ],
});

export const minerGame = g3Game({
  slug: 'miner-game', kind: 'main', when: round(5), episode: ep(5), eps: [5], note: 'two',
  related: ['hitStay', 'piggyBank', 'heavy13'],
}, {
  meta: {
    title: '광부 게임 규칙 — 더 지니어스 시즌3 블랙가넷 5회전 메인매치, 폭탄을 피해 캐고 몫을 부르는 게임',
    description: '더 지니어스: 블랙가넷 5회전 메인매치 광부 게임의 규칙을 정리했어요. 3인 3조, 금·은·동·다이아몬드·폭탄 49개 광산, 폭탄 3개 실패, 구경꾼의 1–50점 몫 제시, 몫 합보다 적게 캤을 때의 벌점, 조별 최고점 가넷까지.',
    keywords: ['광부 게임', '광부게임', '더 지니어스 광부게임', '더 지니어스3 광부 게임', '블랙가넷 5회전', '지니어스 시즌3 메인매치'],
  },
  title: '광부 게임 — 더 지니어스: 블랙가넷 5회전 메인매치',
  name: '광부 게임',
  lead: '한 조가 광산에서 광물을 캐는 동안, 나머지 여섯 명은 그 광물에서 자기 몫을 몰래 불러요. 다 같이 너무 많이 부르면 아무도 못 받고, 가장 욕심낸 사람은 벌점까지 받아요.',
  summary: '폭탄을 피해 광물을 캐는 조와, 그 수확에서 몰래 몫을 부르는 구경꾼이 엇갈리는 운과 눈치의 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 9명. 제비뽑기로 3명씩 3조.',
      '**광산**: 금 14(3점), 은 14(2점), 동 14(1점), 다이아몬드 2(승점 합 2배), 폭탄 5, 모두 49개.',
      '**라운드**: 모든 조가 한 번씩 광부가 되면 한 라운드, 모두 3라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '몫 제시', body: '한 조가 광부가 되면, 나머지 6명은 그 조가 캐 올 승점에서 자기가 받고 싶은 몫을 1–50점 사이로 몰래 적어요. 몫은 캐기가 끝난 뒤 공개돼요.' },
      { title: '캐기', body: '광부 조는 순서를 정해 한 명씩 돌아가며 원하는 만큼 꺼내요. 같은 사람이 연속으로 두 번 캘 수는 없지만, 돌아가는 횟수와 개수에는 제한이 없어요.' },
      { title: '스톱', body: '자기 차례에 꺼내기 전에 스톱을 외치면 그 조의 캐기가 바로 끝나요. **폭탄이 3개** 나오면 캐기는 실패예요.' },
      { title: '정산', body: '아래 표대로 나누고, 광물은 광산으로 돌려놓아요. 2라운드부터는 조원 승점 합이 가장 낮은 조부터 캐요.' },
    ] },
    { type: 'table', head: ['경우', '구경꾼 6명', '광부 3명'], rows: [
      ['캔 승점 ≥ 몫의 합', '각자 적은 몫을 받아요.', '남은 승점을 똑같이 나누고, 나머지는 버려요.'],
      ['캔 승점 < 몫의 합', '아무도 받지 못해요. 가장 큰 몫을 적은 사람은 그만큼 감점되고, 그 점수는 가장 작은 몫을 적은 사람이 가져가요.', '캔 승점을 모두 똑같이 나눠요.'],
      ['폭탄 3개로 실패', '각자 적은 몫을 그대로 받아요.', '아무것도 받지 못해요.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '3라운드 뒤 승점 1위가 우승, 꼴찌가 탈락후보예요. 우승자는 생명의 징표를 받고, 단독 우승이면 생명의 징표 2개와 블랙가넷 1개를 받아요.',
      '조마다 혼자 승점이 가장 높은 사람은 가넷 3개를 받아요.',
      '탈락후보는 생명의 징표가 없는 사람 중에서 데스매치 상대를 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '스톱은 광물을 꺼내기 전에만 외칠 수 있어요.',
      '영어 위키백과의 요약도 같은 정산 구조(몫의 합과 수확 비교, 가장 욕심낸 사람의 벌점)를 전해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '광부 게임은 두 가지 게임이 겹쳐 있어요. 광부에게는 폭탄을 피하는 **위험 감수(푸시 유어 럭)** 게임이고, 구경꾼에게는 여섯 명이 한정된 몫을 나누는 **공유지의 딜레마**예요.' },
    { type: 'cards', items: [
      { title: '광산의 기댓값', body: '폭탄이 아닌 42개의 평균은 2점(금·은·동이 같은 수)이고, 폭탄은 49개 중 5개라 처음에는 한 번 꺼낼 때 폭탄일 확률이 약 10%예요. 폭탄이 쌓일수록 다음 폭탄 하나가 곧 실패라 위험이 급격히 커지고, 다이아몬드가 나오면 지금까지의 합이 두 배가 되어 멈추고 싶은 유혹이 커져요.' },
      { title: '구경꾼은 폭탄을 반긴다', body: '폭탄으로 실패하면 구경꾼은 적은 몫을 그대로 받아요. 반대로 광부가 일찍 멈춰 수확이 몫의 합보다 적으면 구경꾼은 모두 0이고, 가장 욕심낸 사람은 벌점까지 받아요. 그래서 구경꾼에게 가장 위험한 것은 실패가 아니라 **광부의 이른 스톱**이에요.' },
      { title: '광부의 계산', body: '광부는 몫의 합을 모른 채 캐요. 몫의 합을 넘겨 캐면 남는 것만 받고, 못 넘기면 전부를 받아요. 즉 광부 입장에서는 구경꾼들이 크게 불렀다면 적당히 캐고 멈추는 쪽이 오히려 유리할 수 있어요. 구경꾼과 광부가 말로 맺는 약속이 이 게임의 진짜 무대예요.' },
    ], columns: 1 },
    { type: 'p', text: '상대의 몫과 광산의 운이 함께 작용해 **우월 전략은 없어요.** 다만 조원 셋이 광부일 때 수확을 똑같이 나누므로, 조 안의 순위는 구경꾼으로서 얼마나 잘 불렀느냐에서 갈려요. 조별 1위에 걸린 가넷 3개가 같은 조끼리도 경쟁하게 만들어요.' },
  ],
  similar: [
    { name: '인카의 황금 (Incan Gold / Diamant)', players: '3–8명', alike: '동굴을 더 탐험할지 돌아갈지 정하고, 같은 위험이 겹치면 그 판의 수확을 모두 잃어요.', differs: '각자 개인적으로 돌아갈지 정하고, 남의 수확에서 몫을 부르는 규칙은 없어요.' },
    { name: '캔트 스톱 (Can’t Stop)', players: '2–4명', alike: '계속 굴릴수록 많이 얻지만 한 번의 실패로 그 차례의 진행을 모두 잃는 위험 감수 게임이에요.', differs: '주사위 조합으로 길을 오르는 개인전이에요.' },
  ],
}, {
  meta: {
    title: 'Miner Game rules — The Genius: Black Garnet round 5 main match, mining past bombs and claiming shares',
    description: 'The rules of the Miner Game (광부 게임), round 5 main match of The Genius: Black Garnet: three teams of three, a 49-piece mine of gold, silver, bronze, diamonds and bombs, failure on three bombs, spectators claiming 1–50 points, the penalty when claims exceed the haul, and team-best garnets.',
    keywords: ['Miner Game', 'The Genius Miner Game', 'The Genius Black Garnet', 'The Genius season 3', '광부 게임'],
  },
  title: 'Miner Game — The Genius: Black Garnet, round 5 main match',
  name: 'Miner Game (광부 게임)',
  lead: 'While one team digs, the other six secretly claim a share of its haul. If they claim too much together nobody gets anything, and the greediest is penalised too.',
  summary: 'One team digs past bombs while the others secretly claim shares of the haul: luck and nerve on both sides.',
  setup: [
    { type: 'list', items: [
      '**Players**: nine, drawn into three teams of three.',
      '**The mine**: 14 gold (3 points), 14 silver (2), 14 bronze (1), 2 diamonds (double the total), 5 bombs; 49 pieces.',
      '**Rounds**: a round ends when every team has mined once; three rounds.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Claims', body: 'When a team mines, the other six secretly write the share of its haul they want, 1–50 points; claims are revealed after the mining.' },
      { title: 'Mining', body: 'The miners take turns in an agreed order, each drawing as many pieces as they like. Nobody may mine twice in a row, but the number of turns and pieces is unlimited.' },
      { title: 'Stop', body: 'A miner may call stop before drawing, ending the team’s mining at once. **Three bombs** mean the mining fails.' },
      { title: 'Settling', body: 'Points are shared as in the table and the pieces go back into the mine. From round 2 the team with the lowest combined score mines first.' },
    ] },
    { type: 'table', head: ['Case', 'Six spectators', 'Three miners'], rows: [
      ['Haul ≥ total claims', 'Each gets their claim.', 'Split the rest equally; any remainder is discarded.'],
      ['Haul < total claims', 'Nobody gets anything; the highest claimer loses that many points, which go to the lowest claimer.', 'Split the whole haul equally.'],
      ['Failed on three bombs', 'Each still gets their claim.', 'Get nothing.'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After three rounds the top scorer wins and the lowest is the candidate. The winner gets a token of life; a sole winner gets two tokens and a black garnet.',
      'The sole top scorer in each team earns 3 garnets.',
      'The candidate names an opponent from players without a token.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Stop must be called before drawing.',
      'English Wikipedia’s summary describes the same settlement (claims against the haul, the greediest player’s penalty).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The Miner Game stacks two games: a **push-your-luck** game for the miners dodging bombs, and a **tragedy of the commons** for six spectators sharing a limited haul.' },
    { type: 'cards', items: [
      { title: 'What the mine is worth', body: 'The 42 non-bombs average 2 points (equal numbers of gold, silver and bronze), and 5 of 49 pieces are bombs, so the first draw is a bomb about 10% of the time. As bombs accumulate the next one becomes fatal, while a diamond doubles everything so far and makes stopping tempting.' },
      { title: 'Spectators welcome bombs', body: 'A bomb failure still pays every claim. If the miners stop early with less than the total claims, the spectators all get nothing and the greediest is penalised. For spectators the real danger is not failure but **an early stop**.' },
      { title: 'The miners’ sum', body: 'Miners dig without knowing the total claims. Beating it leaves them only the remainder; falling short gives them everything. If the spectators claimed big, a modest haul can actually suit the miners. Spoken deals between the two sides are where the game is played.' },
    ], columns: 1 },
    { type: 'p', text: 'Other players’ claims and the mine’s luck combine, so **there is no dominant strategy**. Teammates split their own hauls equally, so ranking inside a team comes from claiming well as a spectator, and the 3 garnets for each team’s best set teammates against each other.' },
  ],
  similar: [
    { name: 'Incan Gold (Diamant)', players: '3–8', alike: 'Choose to go deeper or head home; a repeated hazard wipes that expedition’s haul.', differs: 'Everyone decides individually, and nobody claims shares of others’ hauls.' },
    { name: 'Can’t Stop', players: '2–4', alike: 'Each roll gains more, but one bust loses the whole turn’s progress.', differs: 'It is an individual dice game of climbing columns.' },
  ],
});

export const stormyStockMarket = g3Game({
  slug: 'stormy-stock-market', kind: 'main', when: round(6), episode: ep(6), eps: [6], note: 'two',
  related: ['piggyBank', 'hitStay', 'equationTower'],
}, {
  meta: {
    title: '폭풍의 증권시장 규칙 — 더 지니어스 시즌3 블랙가넷 6회전 메인매치, 나눠 받은 주가 정보로 하는 주식 게임',
    description: '더 지니어스: 블랙가넷 6회전 메인매치 폭풍의 증권시장의 규칙을 정리했어요. 현금 1만 원, 다섯 회사 주식 15주씩, 게임시각 5분마다 바뀌는 주가, 이웃과 나눠 받는 24개 정보, 거래소 40초, 회사당 7주 제한, 우승 가넷 8개까지.',
    keywords: ['폭풍의 증권시장', '더 지니어스 증권시장', '더 지니어스3 주식 게임', '블랙가넷 6회전', '지니어스 주식시장 게임', '폭풍의 증권시장 규칙'],
  },
  title: '폭풍의 증권시장 — 더 지니어스: 블랙가넷 6회전 메인매치',
  name: '폭풍의 증권시장',
  lead: '주가가 언제 얼마나 오르내릴지 정보가 미리 정해져 있고, 여덟 명이 그 정보를 조각내어 나눠 가져요. 정보를 모으고, 남보다 먼저 거래소에 들어가는 게임이에요.',
  summary: '미리 정해진 주가 변동 정보를 이웃끼리 나눠 받고, 한정된 주식을 사고팔아 현금을 불리는 정보 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 8명. 각자 현금 1만 원으로 시작해요.',
      '**주식**: 다섯 회사(단절통신·사망생명·석기전자·지진건설·파산은행), 회사마다 15주. 모두 한 주에 2천 원에서 시작해요.',
      '**시간**: 실제 시간과 다른 게임시각이 있어요. 1라운드는 게임시각 1시–2시, 2라운드는 2시–3시, 각각 60분이 쉬지 않고 흘러요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '정보 배분', body: '라운드마다 "게임시각·회사·오르내림" 정보 24개가 있어요. 제비뽑기 순서대로 1·2번이 함께 들어가 정보 3개를 보고, 2·3번이 새 정보 3개를, 3·4번이 또 3개를 보는 식이에요(8번과 1번도 이어져요). 그래서 각자 앞뒤 이웃과 나눠 본 정보 6개를 알아요.' },
      { title: '주가 변동', body: '라운드가 시작되면 게임시각 5분마다 그 정보대로 주가가 바뀌어요.' },
      { title: '거래', body: '모든 거래는 거래소에서 해요. 몇 번이든 들어갈 수 있지만 한 번에 최대 40초까지 머물러요. 한 회사 주식은 7주까지만 가질 수 있어요.' },
      { title: '2라운드', body: '1라운드가 끝나면 게임시각이 30분 멈추고, 같은 순서로 2라운드 정보 24개를 나눠 받아요. 주가는 그대로 이어져요.' },
      { title: '정산', body: '2라운드가 끝나면 가진 주식을 그 시점 주가로 현금으로 바꿔요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '현금이 가장 많은 사람이 우승해 생명의 징표와 **가넷 8개**를 받아요. 단독 우승이면 생명의 징표를 하나 더 받아요.',
      '현금이 가장 적은 사람이 탈락후보가 되어, 생명의 징표가 없는 사람 중에서 데스매치 상대를 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '플레이어끼리 주식이나 돈을 주고받을 수 없어요. 보유 주식과 현금은 공개되지 않아요.',
      '거래소에 있는 동안 게임시각이 바뀌면 바뀐 가격으로 거래해요.',
      '회사별 남은 주식 수는 거래소 안에서만 볼 수 있어요.',
      '거래소 줄에서 내 차례가 되었을 때 일부러 입장을 미룰 수 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '폭풍의 증권시장의 주가는 **모두 미리 정해져 있어요.** 운이 없는 대신, 승부는 정보를 얼마나 모으느냐와 정보를 행동으로 옮기는 **타이밍**에서 갈려요.' },
    { type: 'cards', items: [
      { title: '정보는 고리로 이어져 있다', body: '정보 하나는 늘 두 사람이 함께 봐요. 그래서 누군가 정보를 거짓으로 전하면 같은 정보를 본 이웃이 바로잡을 수 있어요. 여덟 명이 정직하게 모두 공유하면 모두가 24개를 다 알게 되는데, 그러면 정보의 우위가 사라지고 순위는 거래 속도와 주식 수량 싸움으로 넘어가요.' },
      { title: '15주와 7주의 산수', body: '회사마다 15주뿐인데 한 사람이 7주까지 가질 수 있어서, 두 사람만 먼저 들어가도 오를 주식이 거의 동나요. 같은 정보를 안다면 줄을 먼저 서는 사람이 이겨요. 남은 수량을 거래소 안에서만 볼 수 있는 것도 이 경쟁을 더 치열하게 만들어요.' },
      { title: '40초 안의 변동', body: '거래소 안에서 시각이 바뀌면 새 가격으로 거래돼요. 오르기 직전에 사서 오른 직후에 파는 일을 한 번의 입장 안에 해낼 수 있어서, 게임시각과 실제 입장 시각을 맞추는 계산이 핵심 기술이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '정보만 완벽하다면 이론상 최적의 매매 경로가 정해져 있지만, 수량 제한과 줄서기 때문에 모두가 그 경로를 동시에 탈 수는 없어요. 그래서 **우월 전략은 없고**, 공유할 정보와 숨길 정보를 고르는 협상이 이 게임의 정치예요.' },
  ],
  similar: [
    { name: '스톡파일 (Stockpile)', players: '2–5명', alike: '각자 몇몇 회사의 주가 변동 내부 정보를 미리 보고, 그 정보를 바탕으로 주식을 사고팔아요.', differs: '주식 묶음을 경매로 사고, 정보는 혼자만 봐요.' },
    { name: '합 운트 굿 (Hab & Gut)', players: '3–5명', alike: '부분적인 주가 정보를 가지고 주식을 거래하며 주가를 움직여요.', differs: '플레이어가 카드로 직접 주가를 올리고 내리며, 기부금이 가장 적은 사람이 탈락해요.' },
  ],
}, {
  meta: {
    title: 'Stormy Stock Market rules — The Genius: Black Garnet round 6 main match, trading on shared tips',
    description: 'The rules of the Stormy Stock Market (폭풍의 증권시장), round 6 main match of The Genius: Black Garnet: ₩10,000 cash, five companies with 15 shares each, prices moving every five game-minutes, 24 tips shared between neighbours, 40-second visits to the exchange, a seven-share cap and 8 garnets for the winner.',
    keywords: ['Stormy Stock Market', 'The Genius stock market', 'The Genius Black Garnet', 'The Genius season 3', '폭풍의 증권시장'],
  },
  title: 'Stormy Stock Market — The Genius: Black Garnet, round 6 main match',
  name: 'Stormy Stock Market (폭풍의 증권시장)',
  lead: 'Every price move is fixed in advance, and the eight players each hold a slice of that information. Gather the tips, then beat everyone else to the exchange.',
  summary: 'Neighbours share slices of pre-set price tips, then buy and sell scarce shares to grow their cash.',
  setup: [
    { type: 'list', items: [
      '**Players**: eight, each starting with ₩10,000 cash.',
      '**Shares**: five companies, 15 shares each, all starting at ₩2,000.',
      '**Time**: a game clock separate from real time. Round 1 runs from 1:00 to 2:00, round 2 from 2:00 to 3:00, sixty non-stop minutes each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Tips', body: 'Each round has 24 tips of the form “game time, company, up or down by how much”. In a drawn order, players 1 and 2 enter together and see three, players 2 and 3 see three new ones, and so on around the circle (8 links back to 1), so everyone knows six tips shared with their two neighbours.' },
      { title: 'Price moves', body: 'Every five game-minutes the prices change as the tips say.' },
      { title: 'Trading', body: 'All trades happen in the exchange. Visits are unlimited but last at most 40 seconds, and nobody may hold more than seven shares of one company.' },
      { title: 'Round 2', body: 'After round 1 the clock stops for thirty minutes while round 2’s 24 tips are shared the same way; prices carry over.' },
      { title: 'Settlement', body: 'At the end of round 2 all shares are cashed in at the final prices.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The most cash wins a token of life and **8 garnets**; a sole winner gets an extra token.',
      'The least cash is the candidate, who names an opponent without a token.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'No shares or money may change hands between players; holdings and cash stay hidden.',
      'If the clock ticks over during a visit, the trade uses the new price.',
      'Remaining shares per company can be seen only inside the exchange.',
      'In the queue, nobody may let their turn pass on purpose.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Every price in the Stormy Stock Market is **set in advance**. There is no luck; the game is decided by how much information you gather and how well you **time** acting on it.' },
    { type: 'cards', items: [
      { title: 'Tips come in a chain', body: 'Each tip is always seen by two people, so a false relay can be corrected by the neighbour who saw it too. If all eight share honestly, everyone knows all 24 and the information edge disappears; the ranking then turns on trading speed and share supply.' },
      { title: 'Fifteen shares, seven each', body: 'With fifteen shares per company and a seven-share cap, two early buyers nearly empty a rising stock. With equal information, whoever queues first wins, and remaining supply being visible only inside the exchange sharpens the race.' },
      { title: 'Moves inside forty seconds', body: 'A clock change during a visit applies at once, so buying just before a rise and selling just after can happen in a single visit. Matching the game clock to when you enter is the core skill.' },
    ], columns: 1 },
    { type: 'p', text: 'With perfect information an optimal trading path exists in theory, but supply limits and the queue mean not everyone can take it. So **there is no dominant strategy**, and the politics lie in choosing which tips to share and which to keep.' },
  ],
  similar: [
    { name: 'Stockpile', players: '2–5', alike: 'Each player sees insider information on some companies’ coming price moves and trades on it.', differs: 'Shares are bought in auctioned piles, and insider information is private.' },
    { name: 'Hab & Gut', players: '3–5', alike: 'Players trade shares with partial knowledge of prices and push those prices around.', differs: 'Players move prices with cards, and the smallest charity donor is knocked out.' },
  ],
});
