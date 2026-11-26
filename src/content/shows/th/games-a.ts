// 더 타임 호텔, days 1–4: 2:2 가위바위보, 코인 시세 조작, 금·은·동 게임, 타임 이즈 골드, 침묵의 오트리오, 전승 가위바위보.
import { thGame } from './shared';

export const rps22 = thGame('rock-paper-scissors-2v2', 'kairos', { ko: '1일차', en: 'Day 1' }, ['1'], ['indianPoker', 'twoSidedPoker', 'russianRoulette'], {
  meta: {
    title: '2:2 가위바위보 규칙 — 더 타임 호텔 1일차 카이로스 게임, 카드를 숨긴 팀 가위바위보',
    description: '더 타임 호텔 1일차 카이로스 게임 2:2 가위바위보의 규칙을 정리했어요. 가위·바위·보 4장씩과 특수 카드 2장, 공개된 지배인 카드, 공격 선언과 방어 팀 지목, 승부 성립 조건, 시간 증감표, 라운드 미참여 페널티까지.',
    keywords: ['2:2 가위바위보', '더 타임 호텔 가위바위보', '더타임호텔 카이로스 게임', '더 타임 호텔 1일차', '더타임호텔'],
  },
  title: '2:2 가위바위보 — 더 타임 호텔 1일차 카이로스 게임',
  name: '2:2 가위바위보',
  lead: '같은 카드를 쥔 두 사람이 짝을 지어 다른 두 사람에게 가위바위보 승부를 걸어요. 카드는 보여 줄 수 없고, 짝이 틀리면 공격한 쪽이 시간을 잃어요.',
  summary: '숨긴 카드로 짝을 맞춰 2:2 가위바위보를 거는 게임. 시간이 0이 되는 사람이 나올 때까지 계속돼요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 투숙객 10명. 각자 타임워치에 **24시간**을 갖고 시작해요.',
      '**카드**: 가위·바위·보 각 4장과 **특수 카드** 2장, 모두 14장.',
      '**배분**: 각자 1장을 몰래 받고, 남은 4장은 **지배인 카드**로 모두에게 공개돼요.',
      '**아이템**: 카드 스캔(1시간) — 한 사람을 골라 그 사람의 카드를 확인해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '공격 선언', body: '두 사람이 합의하면 **공격 팀**이 되어, 방어 팀이 될 두 사람을 지목해요. 자기 카드를 상대에게 직접 보여 주는 건 금지예요.' },
      { title: '성립 확인', body: '두 팀이 **각각 팀원끼리 같은 카드**를 쥐고 있어야 승부가 성립해요. 특수 카드는 팀원의 카드와 같은 것으로 쳐요.' },
      { title: '가위바위보', body: '성립하면 두 팀의 카드로 가위바위보를 가려 시간을 주고받아요. 결과만 지배인이 알리고, 누가 무슨 카드였는지는 공개되지 않아요.' },
      { title: '카드 교체', body: '승부에 쓴 카드는 지배인 카드와 섞어 네 사람에게 한 장씩 다시 나눠 줘요.' },
      { title: '라운드 종료', body: '승부가 **3번 성립**하거나 **15분**이 지나면 라운드가 끝나요. 그 라운드에 성립한 승부에 한 번도 끼지 못한 사람은 **3시간**을 잃어요.' },
    ] },
    { type: 'table', head: ['결과', '공격 팀(각자)', '방어 팀(각자)'], rows: [
      ['공격 팀 승리', '+2시간', '−2시간'],
      ['방어 팀 승리', '−2시간', '+3시간'],
      ['무승부', '변동 없음', '변동 없음'],
      ['승부 미성립(어느 팀이든 카드 불일치)', '−2시간', '+1시간'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '라운드를 반복하다가 **시간이 0이 된 사람**이 나오면 그 사람이 체크아웃(탈락)되고 게임이 끝나요.',
      '남은 사람은 모두 다음 카이로스 게임까지 생존 보장 시간 24시간을 받아요. 첫날에는 체크아웃 게임이 없었어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '공격하려면 반드시 짝의 동의가 필요해요. 혼자서는 공격할 수 없어요.',
      '방송에서는 특수 카드 두 장이 한 팀에 모이는 경우의 처리가 설명되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '겉모습은 가위바위보지만, 시간표를 더해 보면 **누가 이기느냐보다 어떤 결과가 나오느냐**가 중요한 게임이에요. 결과마다 네 사람의 시간 합계가 다르게 변해요.' },
    { type: 'cards', items: [
      { title: '시간이 늘어나는 결과는 하나', body: '공격 승리는 +4·−4로 합이 0, 미성립은 −4·+2로 합이 −2예요. **방어 팀 승리만 −4·+6으로 합이 +2**예요. 그래서 카드를 서로 털어놓은 네 사람이 일부러 방어 팀이 이기도록 승부를 짜면 함께 시간을 불릴 수 있어요. 카드 정보를 공유하는 큰 연합이 가장 강한 이유예요.' },
      { title: '참여하지 못하면 손해', body: '한 라운드의 성립 승부는 많아야 3번, 자리는 12개라 10명 모두 낄 수는 있어요. 하지만 짝을 구하지 못하면 매 라운드 3시간씩 빠져요. 그래서 **아무도 짝이 되어 주지 않는 사람**은 승부 없이도 몇 라운드 만에 0이 돼요. 이 게임의 진짜 무기는 카드가 아니라 따돌림이에요.' },
      { title: '공개된 정보로 추리하기', body: '지배인 카드 4장이 공개되므로 남은 10장의 구성을 계산할 수 있어요. 승부 결과와 카드 교체 뒤의 지배인 카드 변화까지 보면 상대의 카드를 꽤 좁힐 수 있어요. 1시간짜리 카드 스캔은 이 추리를 확정하는 수단이에요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략**은 없지만, 정보를 나누는 연합이 개인보다 압도적으로 유리한 구조예요. 연합 밖의 사람에게는 "같은 카드인 척"하는 블러핑으로 미성립을 유도해 방어 팀으로서 시간을 버는 길이 남아 있어요.' },
  ],
  similar: [
    { name: '쿠 (Coup)', players: '2–6명', alike: '자기 카드를 숨긴 채 말과 행동으로 정체를 주장하고, 상대의 주장을 의심하는 게임이에요.', differs: '쿠는 개인전이고 카드 능력으로 상대를 제거해요. 짝을 맞추는 과정은 없어요.' },
    { name: '스컬 (Skull)', players: '3–6명', alike: '숨긴 패를 두고 블러핑과 읽기로 승부해요.', differs: '스컬은 꽃과 해골 패를 뒤집는 내기이고, 팀이나 시간 주고받기가 없어요.' },
  ],
}, {
  meta: {
    title: '2:2 Rock Paper Scissors rules — The Time Hotel, day 1 Kairos game',
    description: 'The rules of 2:2 Rock Paper Scissors from The Time Hotel: four each of rock, paper and scissors plus two special cards, the open manager cards, declaring an attack, when a match counts, the time table and the penalty for sitting out.',
    keywords: ['2:2 rock paper scissors', 'The Time Hotel', 'Time Hotel Kairos game', '더 타임 호텔'],
  },
  title: '2:2 Rock Paper Scissors — The Time Hotel, day 1 Kairos game',
  name: '2:2 Rock Paper Scissors (2:2 가위바위보)',
  lead: 'Two players holding the same card pair up and challenge another pair to rock-paper-scissors. Cards cannot be shown, and a mismatched pair costs the attackers time.',
  summary: 'Pair up with a hidden matching card and challenge another pair; it runs until someone’s time hits zero.',
  setup: [
    { type: 'list', items: [
      '**Players**: ten guests, each starting with **24 hours** on their time watch.',
      '**Cards**: four each of rock, paper and scissors and two **special** cards, fourteen in all.',
      '**Deal**: one card each, secretly; the remaining four are **manager cards**, face up for all.',
      '**Item**: card scan (1 hour) — look at one player’s card.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Declare', body: 'Two players who agree become the **attacking team** and name two defenders. Showing your card directly is not allowed.' },
      { title: 'Check', body: 'The match counts only if **each team’s two cards match**. A special card copies its partner’s card.' },
      { title: 'Play', body: 'If it counts, the teams’ cards play rock-paper-scissors and time changes hands. The manager announces only the result, never the cards.' },
      { title: 'Re-deal', body: 'The four cards used are shuffled with the manager cards and one is dealt back to each of the four.' },
      { title: 'End of round', body: 'A round ends after **three valid matches** or **15 minutes**. Anyone who took part in no valid match that round loses **3 hours**.' },
    ] },
    { type: 'table', head: ['Result', 'Attackers (each)', 'Defenders (each)'], rows: [
      ['Attackers win', '+2 h', '−2 h'],
      ['Defenders win', '−2 h', '+3 h'],
      ['Draw', 'none', 'none'],
      ['No match (either pair mismatched)', '−2 h', '+1 h'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Rounds repeat until **someone’s time reaches zero**; that player checks out (is eliminated) and the game ends.',
      'Everyone else gets the 24-hour survival allowance until the next Kairos game. Day 1 had no checkout game.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'An attack needs a willing partner; nobody can attack alone.',
      'The broadcast did not explain what happens if both special cards end up on one team.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It looks like rock-paper-scissors, but add up the table and **which outcome happens matters more than who wins**: each outcome changes the four players’ total time differently.' },
    { type: 'cards', items: [
      { title: 'Only one outcome creates time', body: 'An attackers’ win is +4/−4 (net 0); a non-match is −4/+2 (net −2). **Only a defenders’ win, −4/+6, adds 2 hours**. Four players who share their cards can stage defenders’ wins and grow together, which is why a large card-sharing alliance is the strongest force.' },
      { title: 'Sitting out is the real danger', body: 'Three valid matches give twelve seats, enough for all ten, but without a partner you lose 3 hours every round. A player **nobody will partner** runs out within a few rounds without ever playing. The real weapon here is exclusion, not cards.' },
      { title: 'Deduce from open cards', body: 'Four manager cards are public, so the other ten can be counted. Results and how the manager cards change after a re-deal narrow down opponents’ cards; the 1-hour scan confirms a guess.' },
    ], columns: 1 },
    { type: 'p', text: 'There is **no dominant strategy**, but an information-sharing alliance beats any individual. Outside it, a player can still bluff a matching card to lure attackers into a non-match and earn time as a defender.' },
  ],
  similar: [
    { name: 'Coup', players: '2–6', alike: 'You hide your cards, claim identities by words and actions, and doubt others’ claims.', differs: 'It is every player for themselves, with card powers that knock players out; no pairing up.' },
    { name: 'Skull', players: '3–6', alike: 'Hidden tiles, bluffing and reading the table.', differs: 'It is a bet on flipping flowers and skulls, with no teams or time trading.' },
  ],
});

export const coinRigging = thGame('coin-rigging', 'kairos', { ko: '2일차', en: 'Day 2' }, ['2'], ['twoSidedPoker', 'piggyBank', 'hitStay'], {
  meta: {
    title: '코인 시세 조작 규칙 — 더 타임 호텔 2일차 카이로스 게임, 숨긴 숫자를 곱하는 투자',
    description: '더 타임 호텔 2일차 카이로스 게임 코인 시세 조작의 규칙을 정리했어요. −5부터 5까지의 투자 카드와 조작 카드, 쿼카·코알라·알파카·하이에나 코인의 정원, 곱으로 정하는 수익률, 혼자 투자하면 50%, 6–7라운드 2배, 순위별 시간 보상까지.',
    keywords: ['코인 시세 조작', '더 타임 호텔 코인', '더타임호텔 2일차', '더 타임 호텔 카이로스 게임', '더타임호텔'],
  },
  title: '코인 시세 조작 — 더 타임 호텔 2일차 카이로스 게임',
  name: '코인 시세 조작',
  lead: '각자 숨긴 숫자 카드를 들고 네 가지 코인 중 하나에 투자해요. 같은 코인에 모인 숫자를 모두 곱한 값이 수익률이 돼요.',
  summary: '음수와 양수가 섞인 투자 카드를 곱해 수익률을 정하는 7라운드 투자 게임. 조작 카드가 남의 카드를 빼앗아요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 9명.',
      '**투자 카드**: −5, −4, −3, −2, −1, 2, 3, 4, 5 아홉 장. 라운드마다 이 중 1장이 **지배인 카드**로 빠지고, 남은 8장과 **조작 카드** 1장이 무작위로 한 장씩 나눠져요. 누가 무엇을 받았는지는 비공개예요.',
      '**코인 테이블**: 쿼카(최대 2명), 코알라(3명), 알파카(3명), 하이에나(4명).',
      '**아이템**: 지배인 카드 확인(1시간) — 그 라운드의 지배인 카드를 먼저 보고, 라운드 끝의 공개도 막아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '투자', body: '10분 동안 자기 이름 카드를 원하는 코인 테이블에 올려요. 반드시 본인이 직접 옮겨야 해요.' },
      { title: '지배인 카드 공개', body: '라운드 종료 30초 전에 지배인 카드가 공개돼요(누군가 아이템을 샀다면 공개되지 않아요).' },
      { title: '조작', body: '조작 카드를 받은 사람은 **다른 테이블의 한 사람**을 골라 그 사람의 투자 카드를 자기 카드로 써요. 빼앗긴 사람은 지배인 카드의 숫자를 대신 써요.' },
      { title: '수익률 계산', body: '테이블마다 올라온 투자 카드의 숫자를 **모두 곱한 값**이 그 코인의 수익률이에요. 투자한 사람은 모두 그 수익률을 받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '7라운드의 **누적 수익률** 순위로 시간을 받아요: 1위 12시간, 2위 8, 3위 7, 4위 5, 5위 4, 6위 3, 7위 2, 8·9위 0.',
      '1위는 **체크아웃 패스권 2장**을 받아 한 장은 자신이, 한 장은 다른 사람(체크아웃 후보 제외)에게 줘요.',
      '최하위는 체크아웃 후보가 되어, 패스권이 없는 사람 중 한 명을 지목해 체크아웃 게임(금·은·동 게임)을 치러요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '테이블에 **혼자** 투자하면 카드와 상관없이 수익률 50%를 받아요.',
      '라운드가 끝날 때까지 투자하지 않은 사람은 그 라운드 코인 중 **가장 낮은 수익률**을 받아요.',
      '6·7라운드는 수익률이 **2배**예요(혼자 투자한 50%는 제외).',
      '남의 투자 카드를 대신 옮기는 것은 인정되지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이 게임의 핵심은 **곱셈의 부호**예요. 음수 카드가 5장, 양수 카드가 4장이라, 한 테이블에 음수가 짝수 장 모이면 큰 이익이 되고 홀수 장이면 큰 손해가 돼요.' },
    { type: 'cards', items: [
      { title: '누구와 같은 테이블에 앉을까', body: '내 카드만으로는 결과가 정해지지 않아요. 같은 테이블 사람들의 카드를 알아야 하니, 카드를 서로 알려 주는 신뢰 관계가 곧 수익이에요. 거짓말로 상대를 음수 테이블에 끌어들이는 것도 가능해요.' },
      { title: '혼자 앉기라는 보험', body: '혼자 앉으면 카드와 무관하게 50%가 보장돼요. 곱이 클수록 위험도 큰 이 게임에서, 정보가 없는 사람에게는 가장 단순한 안전판이에요. 다만 쿼카처럼 정원이 작은 테이블부터 누가 먼저 차지하느냐의 눈치 싸움이 붙어요.' },
      { title: '조작 카드와 지배인 카드', body: '조작 카드는 다른 테이블 사람의 숫자를 빼앗고, 빼앗긴 사람에게는 지배인 카드를 떠넘겨요. 그래서 지배인 카드가 무엇인지 아는 사람만 조작의 결과를 계산할 수 있어요. 1시간짜리 아이템이 비싼데도 의미가 있는 이유예요.' },
    ], columns: 1 },
    { type: 'p', text: '6·7라운드가 2배이므로, 앞선 라운드에서 신뢰를 쌓고 마지막 두 라운드에 크게 거는 흐름이 자연스러워요. **우월 전략은 없어요.** 혼자 앉기는 최하위를 피하는 수단이지만 1위를 노리기에는 부족해요.' },
  ],
  similar: [
    { name: '스톡파일 (Stockpile)', players: '2–5명', alike: '각자 주가 변동에 대한 비공개 정보를 받고, 그 정보를 바탕으로 투자해요.', differs: '스톡파일은 경매로 주식을 사고, 곱셈으로 수익이 정해지지 않아요.' },
    { name: '콜로레토 (Coloretto)', players: '2–5명', alike: '정원이 정해진 줄 중 어디에 합류할지 고르는 눈치 싸움이 있어요.', differs: '콜로레토는 색깔 카드를 모으는 게임이고, 마이너스 점수가 덧셈으로 쌓여요.' },
  ],
}, {
  meta: {
    title: 'Coin Rigging rules — The Time Hotel, day 2 Kairos game',
    description: 'The rules of Coin Rigging (코인 시세 조작) from The Time Hotel: investment cards from −5 to 5 and a rigging card, four coin tables with seat limits, returns set by multiplying the cards, the 50% for investing alone, doubled rounds 6–7 and the time rewards.',
    keywords: ['Coin Rigging', 'The Time Hotel', 'Time Hotel day 2', '더 타임 호텔 코인 시세 조작'],
  },
  title: 'Coin Rigging — The Time Hotel, day 2 Kairos game',
  name: 'Coin Rigging (코인 시세 조작)',
  lead: 'Each player secretly holds a number and invests in one of four coins. The numbers at a coin’s table are multiplied to give its return.',
  summary: 'A seven-round investment game where hidden positive and negative cards are multiplied; a rigging card steals someone’s number.',
  setup: [
    { type: 'list', items: [
      '**Players**: nine.',
      '**Investment cards**: −5, −4, −3, −2, −1, 2, 3, 4, 5. Each round one is set aside as the **manager card**; the other eight and one **rigging card** are dealt one each, secretly.',
      '**Coin tables**: quokka (up to 2), koala (3), alpaca (3), hyena (4).',
      '**Item**: see the manager card (1 hour) — you see it early and it is not revealed to the others.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Invest', body: 'For 10 minutes, place your name card on a coin table. You must move it yourself.' },
      { title: 'Manager card', body: 'It is revealed 30 seconds before the round ends, unless someone bought the item.' },
      { title: 'Rig', body: 'The rigging card’s holder picks **one player at another table** and uses that player’s card as their own; the victim uses the manager card instead.' },
      { title: 'Returns', body: 'Each table’s return is the **product of all its cards**; every investor there gets it.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After seven rounds, **cumulative return** decides time: 12 h, 8, 7, 5, 4, 3, 2, then 0 for 8th and 9th.',
      'First place gets **two checkout passes**, one for themselves and one to give (not to the candidate).',
      'Last place becomes the checkout candidate and names a player without a pass for the checkout game (Gold, Silver, Bronze).',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Investing **alone** at a table pays a flat 50% whatever your card.',
      'Not investing by the end of the round gets the **lowest** coin return of that round.',
      'Rounds 6 and 7 pay **double** (except the flat 50%).',
      'Moving someone else’s card does not count.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Everything turns on **the sign of a product**. There are five negative cards and four positive, so a table with an even number of negatives booms and an odd number crashes.' },
    { type: 'cards', items: [
      { title: 'Who you sit with', body: 'Your card alone decides nothing; you need your tablemates’ cards. Trust that lets people share cards is profit, and a lie can lure someone onto a negative table.' },
      { title: 'Sitting alone as insurance', body: 'Alone you get 50% regardless. In a game where big products mean big risk, that is the simplest safety net for anyone without information, which makes the small quokka table a race.' },
      { title: 'Rigging and the manager card', body: 'The rigger takes a number from another table and hands the victim the manager card, so only someone who knows the manager card can predict the effect. That is why an hour for the item can be worth it.' },
    ], columns: 1 },
    { type: 'p', text: 'With rounds 6–7 doubled, it is natural to build trust early and bet big at the end. **There is no dominant strategy**: sitting alone avoids last place but rarely wins.' },
  ],
  similar: [
    { name: 'Stockpile', players: '2–5', alike: 'Players get private information about price moves and invest on it.', differs: 'Shares are bought at auction and returns are not multiplied.' },
    { name: 'Coloretto', players: '2–5', alike: 'You choose which row with limited room to join, watching what others do.', differs: 'It is about collecting colours, with penalties that add up rather than multiply.' },
  ],
});

export const goldSilverBronze = thGame('gold-silver-bronze', 'checkout', { ko: '2·5일차, 파이널 2라운드', en: 'Days 2 and 5, final round 2' }, ['2', '5', '8'], ['indianPoker', 'twoSidedPoker', 'hitStay'], {
  meta: {
    title: '금·은·동 게임 규칙 — 더 타임 호텔 체크아웃 게임, 토끼 무게로 거는 베팅',
    description: '더 타임 호텔 체크아웃 게임이자 파이널 2라운드인 금·은·동 게임의 규칙을 정리했어요. 금토끼 3g·은토끼 2g·동토끼 1g, 12g 한도와 2g 차이, 기본 베팅 3칩, 레이즈·콜·폴드, 금>은>동 족보, 남은 토끼의 칩 환산, 파이널 3인전 변경점까지.',
    keywords: ['금은동 게임', '금·은·동 게임', '더 타임 호텔 금은동', '더타임호텔 체크아웃 게임', '더타임호텔'],
  },
  title: '금·은·동 게임 — 더 타임 호텔 체크아웃 게임',
  name: '금·은·동 게임',
  lead: '금·은·동 토끼를 무게만 공개하고 내놓은 뒤 칩을 걸어요. 무게와 상관없이 금토끼가 많은 쪽이 이겨요.',
  summary: '공개된 무게만 보고 상대의 토끼 구성을 읽는 1:1 베팅. 체크아웃 게임으로 두 번, 파이널 2라운드로 한 번 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 체크아웃 후보와 지목된 사람 1:1. 파이널에서는 3명.',
      '**토끼**: 각자 금토끼(3g) 3개, 은토끼(2g) 10개, 동토끼(1g) 20개.',
      '**칩**: 각자 30개(파이널은 40개). 기본 베팅은 3개.',
      '**아이템**: 시작 전 합계 10g까지 토끼를 시간으로 더 살 수 있어요(2일차 은 30분·동 10분, 5일차 은 1시간·동 30분).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선 플레이어', body: '최대 **12g**까지 토끼를 골라 가려 놓아요. 1라운드 선은 카이로스 게임 최하위자예요.' },
      { title: '후 플레이어', body: '선의 무게를 확인하고, 그 무게와 **최대 2g 차이** 안에서 토끼를 올려요.' },
      { title: '베팅', body: '두 사람이 무게를 확인한 뒤 기본 3칩을 걸고, 선부터 **레이즈·콜·폴드**를 해요.' },
      { title: '공개', body: '콜이면 토끼를 공개해요. **금토끼가 많은 쪽**이 이기고, 같으면 은토끼, 그것도 같으면 동토끼가 많은 쪽이 이겨요. 전체 무게는 상관없어요.' },
      { title: '정산', body: '이긴 사람이 판돈을 모두 가져가고 다음 라운드의 선이 돼요. 폴드하면 토끼를 공개하지 않고 상대가 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '누군가 남은 토끼로 최소 무게를 맞출 수 없거나 기본 베팅을 할 수 없으면 게임이 끝나요.',
      '남은 토끼는 **1g당 칩 1개**로 바꾸고, 칩이 많은 사람이 이겨요. 진 사람은 체크아웃되고, 이긴 사람은 진 사람의 시간을 모두 가져가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '무승부면 판돈이 남아, 다음 라운드의 승자가 함께 가져가요.',
      '**파이널(3인)**: 칩 40개로 시작하고, 기본 베팅을 못 하는 사람만 탈락한 채 나머지가 계속해요. 남은 토끼는 칩으로 바꿔 주지 않아요.',
      '정리된 규칙에는 "최소 무게"가 몇 g인지 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '금·은·동 게임은 **무게라는 공개 정보**와 **금토끼 3개라는 희소 자원**이 맞물린 베팅이에요.' },
    { type: 'cards', items: [
      { title: '무게가 말해 주는 것', body: '무게는 금×3 + 은×2 + 동×1이에요. 12g이라면 금이 4개 들어갈 수 없으니 최대 3개, 5g이면 금은 많아야 1개예요. 무게가 가벼울수록 금이 들어갈 자리가 좁아져요. 그래서 선이 무게를 정하는 순간 서로의 가능한 패가 좁혀지고, 후는 2g 안에서 이를 이용할 수 있어요.' },
      { title: '금 3개를 언제 쓸까', body: '금 한 개가 은·동 몇 개보다 강하니, 금은 사실상 "이기는 권리" 세 번이에요. 큰 판돈이 걸린 판에 아껴 두려면, 금이 없는 판에서도 금이 있는 척 레이즈하는 블러핑이 필요해요. 상대가 금을 몇 개 썼는지는 공개된 판에서만 알 수 있어, 폴드한 판은 기록이 남지 않아요.' },
      { title: '토끼도 칩이다', body: '1:1 체크아웃 게임에서는 남은 토끼가 1g당 1칩으로 바뀌어요. 처음 가진 토끼는 49g으로, 시작 칩 30개보다 많아요. 내놓은 토끼는 그대로 사라지므로, **무거운 패를 낼수록 끝에 받을 칩이 줄어요.** 작은 판은 가볍게 내고 버리는 것도 계산이에요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략은 없어요.** 다만 가벼운 무게로 판을 여는 선은 상대의 금 사용을 제한할 수 있고, 무승부 판돈이 다음 승자에게 넘어가는 규칙 때문에 이어지는 판의 가치가 커질 수 있어요.' },
  ],
  similar: [
    { name: '라이어스 다이스 (Perudo)', players: '2–6명', alike: '숨긴 자원(주사위)을 두고 내기를 올리며, 상대의 말과 행동에서 패를 읽어요.', differs: '페루도는 모두의 주사위 합에 대한 주장을 이어 가고, 칩 대신 주사위를 잃어요.' },
    { name: '헤일 투 더 킹 / 하겐 (Hol’s der Geier)', players: '2–5명', alike: '한정된 숫자 카드를 한 번씩만 쓰며, 센 카드를 언제 쓸지 정하는 자원 관리가 핵심이에요.', differs: '하겐은 동시에 카드를 내 점수 카드를 가져가고, 베팅이나 무게 정보가 없어요.' },
  ],
}, {
  meta: {
    title: 'Gold, Silver, Bronze rules — The Time Hotel checkout game',
    description: 'The rules of the Gold, Silver, Bronze game (금·은·동 게임) from The Time Hotel: gold 3 g, silver 2 g and bronze 1 g rabbits, the 12 g limit and 2 g gap, a 3-chip ante, raise, call and fold, gold-first ranking, leftover rabbits as chips, and the three-player final version.',
    keywords: ['Gold Silver Bronze game', 'The Time Hotel checkout game', '더 타임 호텔 금은동'],
  },
  title: 'Gold, Silver, Bronze — The Time Hotel checkout game',
  name: 'Gold, Silver, Bronze (금·은·동 게임)',
  lead: 'Put out gold, silver and bronze rabbits showing only their weight, then bet. Whatever the weight, more gold wins.',
  summary: 'A one-on-one betting game read through the declared weight; played as a checkout game twice and as final round 2.',
  setup: [
    { type: 'list', items: [
      '**Players**: the checkout candidate and the player they named; three in the final.',
      '**Rabbits**: three gold (3 g), ten silver (2 g) and twenty bronze (1 g) each.',
      '**Chips**: 30 each (40 in the final); the ante is 3.',
      '**Item**: before play, up to 10 g of extra rabbits for time (day 2: silver 30 min, bronze 10 min; day 5: silver 1 h, bronze 30 min).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Lead', body: 'The lead player hides rabbits of up to **12 g**. In round 1 the lead is the Kairos game’s last place.' },
      { title: 'Follow', body: 'The other sees the weight and puts out rabbits within **2 g** of it.' },
      { title: 'Bet', body: 'Both see the weights, ante 3 chips, and bet from the lead: **raise, call or fold**.' },
      { title: 'Show', body: 'On a call both reveal. **More gold** wins; if equal, more silver; then more bronze. Total weight does not matter.' },
      { title: 'Settle', body: 'The winner takes the pot and leads next. A fold loses without revealing.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The game ends when someone cannot make the minimum weight with what is left, or cannot ante.',
      'Leftover rabbits become **one chip per gram**, and more chips wins. The loser checks out and the winner takes all their time.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A tie leaves the pot for the next hand’s winner.',
      '**Final (three players)**: 40 chips each; a player who cannot ante is out while the others continue, and leftover rabbits are not converted.',
      'The written rules do not give the minimum weight, so it is not stated here.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The game couples **a public clue, the weight**, with **a scarce resource, three gold rabbits**.' },
    { type: 'cards', items: [
      { title: 'What weight tells you', body: 'Weight is 3×gold + 2×silver + bronze. At 12 g there can be at most three gold; at 5 g at most one. The lighter the hand, the less room for gold, so the lead’s choice narrows both hands, and the follower can exploit the 2 g window.' },
      { title: 'When to spend gold', body: 'One gold beats any amount of silver, so gold is effectively three guaranteed wins. Saving it for big pots means raising without gold sometimes. How many gold an opponent has used is known only from shown hands; folded hands leave no record.' },
      { title: 'Rabbits are chips too', body: 'In the one-on-one game leftover rabbits pay a chip per gram, and you start with 49 g, more than your 30 chips. Rabbits you put out are gone, so **heavier hands cost end-game chips**. Throwing a light hand into a small pot is part of the arithmetic.' },
    ], columns: 1 },
    { type: 'p', text: '**There is no dominant strategy.** A lead who opens light can cap the opponent’s gold, and because tied pots roll over, a hand after a tie can be worth much more.' },
  ],
  similar: [
    { name: 'Liar’s Dice (Perudo)', players: '2–6', alike: 'You bet over hidden resources and read others’ claims and behaviour.', differs: 'Players bid on the total of everyone’s dice and lose dice, not chips.' },
    { name: 'Raj (Hol’s der Geier)', players: '2–5', alike: 'Each number card is used once, so when to play strong cards is the core.', differs: 'Cards are played simultaneously for point cards; there is no betting or weight clue.' },
  ],
});

export const timeIsGold = thGame('time-is-gold', 'kairos', { ko: '3·7일차', en: 'Days 3 and 7' }, ['3', '7'], ['wallgo', 'hexagon', 'piggyBank'], {
  meta: {
    title: '타임 이즈 골드 규칙 — 더 타임 호텔 카이로스 게임, 만칼라처럼 골드핀을 금고로',
    description: '더 타임 호텔 3일차·7일차 카이로스 게임 타임 이즈 골드(Ⅰ·Ⅱ)의 규칙을 정리했어요. 2인 1팀의 인 플레이어·아웃 플레이어, 트레이 5개와 골드핀 4개씩, 시계 방향 이동과 추가 차례, 3분 제한, 더블핀·마이너스핀, 점수 계산, Ⅱ의 아웃 플레이어 드래프트까지.',
    keywords: ['타임 이즈 골드', '더 타임 호텔 타임 이즈 골드', '더타임호텔 만칼라', '더 타임 호텔 3일차', '더타임호텔'],
  },
  title: '타임 이즈 골드 — 더 타임 호텔 카이로스 게임',
  name: '타임 이즈 골드',
  lead: '트레이의 골드핀을 한 칸에 하나씩 시계 방향으로 옮겨 금고에 모아요. 만칼라를 네 팀이 한 판에서 하는 셈이에요. 생각하는 사람과 옮기는 사람이 나뉘어 있어요.',
  summary: '만칼라 방식으로 골드핀을 금고에 모으는 4팀전. 3일차에 처음, 7일차에 운동선수 아웃 플레이어와 함께 Ⅱ로 다시 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 추첨으로 2명씩 4팀(A·B·C·D). 팀마다 라인 안에서 지시하는 **인 플레이어**와 라인 밖에서 핀을 옮기는 **아웃 플레이어**를 정해요. 역할은 바꿀 수 없어요.',
      '**게임판**: 네 모서리에 팀별 금고가 있고, 각 변에 그 팀의 트레이 5개가 놓인 고리 모양이에요.',
      '**핀**: 트레이마다 골드핀 4개.',
      '**아이템**(라운드 전 전략 시간, 개인 시간으로 구매, 산 즉시 자기 트레이의 골드핀 하나와 바꿔요): **더블핀**(2시간, 전체 4개) — 끝날 때 금고에 있으면 2점을 더 줘요. **마이너스핀**(1시간, 전체 8개) — 끝날 때 금고에 있으면 1점이 깎여요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '차례', body: 'A·B·C·D 순서로 진행해요. 아웃 플레이어가 자기 팀 트레이 하나를 골라, 그 안의 핀을 모두 집어 **시계 방향으로 한 칸에 하나씩** 놓아요.' },
      { title: '상대 금고', body: '지나가는 길에 상대 팀 금고가 있으면 거기에도 핀을 하나 놓아야 해요.' },
      { title: '추가 차례', body: '**마지막 핀이 자기 팀 금고**에 떨어지면 한 번 더 트레이를 골라 옮겨요.' },
      { title: '제한 시간', body: '첫 핀을 집을 때부터 마지막 핀을 놓을 때까지 3분이에요. 넘기면 핀 1개가 제거되고, 그 뒤 30초마다 1개씩 더 제거돼요. 쓰러진 핀은 반드시 다시 세워야 해요.' },
      { title: '종료', body: '한 팀이 자기 트레이 5개를 모두 비우는 즉시 게임이 끝나요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '자기 금고의 핀 1개당 1점, **핀이 남아 있는 자기 트레이 1개당 −1점**이에요. 동점이면 제한 시간을 덜 쓴 팀이 앞서요.',
      '3일차 보상: 1위 팀 12시간, 2위 8, 3위 4, 4위 0. 최하위 팀 두 사람은 그 자리에서 체크아웃 게임(침묵의 오트리오)에 나가요.',
    ] },
  ],
  exceptions: [
    { type: 'h3', text: '타임 이즈 골드 Ⅱ (7일차)' },
    { type: 'list', items: [
      '기본 규칙은 같지만, 게스트로 온 운동선수·코미디언 네 명이 **아웃 플레이어**를 맡아요.',
      '시작 전 **시간 경매**로 아웃 플레이어를 드래프트해요. 기본 입찰 1시간, 최소 단위 30분이고, 마지막 순서는 기본 입찰액만 내요.',
      '이동 제한 시간이 **2분**으로 줄었어요.',
      '체크아웃 게임 없이 **최하위가 바로 체크아웃**돼요. 보상은 1위 8시간, 2위 4, 3위 2.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '타임 이즈 골드의 뼈대는 **만칼라의 씨뿌리기**예요. 트레이의 핀 수와 금고까지의 거리가 같으면 추가 차례를 얻는다는 계산이 전부의 출발점이에요.' },
    { type: 'cards', items: [
      { title: '거리 = 핀 수', body: '자기 금고에서 n칸 떨어진 트레이에 핀이 정확히 n개면 마지막 핀이 금고에 떨어져 한 번 더 둘 수 있어요. 금고에 가까운 트레이부터 비우면 연쇄 추가 차례를 만들 수 있어요. 한 번의 차례에 여러 트레이를 연달아 비우는 것이 점수와 종료 시점을 동시에 쥐는 길이에요.' },
      { title: '내 핀이 남에게 간다', body: '핀은 다음 팀의 변으로 넘어가 그 팀의 재료가 되고, 지나가는 상대 금고에도 하나씩 떨어져요. 큰 트레이를 멀리 보내면 상대를 돕게 돼요. 그래서 마이너스핀은 공격 무기예요. 내 트레이에 넣은 뒤 상대 금고를 지나가게 보내면 상대 점수가 깎여요.' },
      { title: '끝내는 팀이 유리한 구조', body: '핀이 남은 트레이마다 −1점이므로, 한 팀이 자기 쪽을 다 비우면 다른 팀은 남은 트레이만큼 손해를 봐요. 하지만 남이 보낸 핀이 계속 들어오니 내 쪽을 비우는 시점은 완전히 내 마음대로 되지 않아요.' },
      { title: '머리와 손의 분리', body: '계산하는 사람은 핀을 만질 수 없고, 옮기는 사람은 시간에 쫓겨요. 3분(Ⅱ는 2분) 안에 정확히 옮기는 손이 필요해, Ⅱ에서 아웃 플레이어를 경매로 사는 것도 이 분업 때문이에요.' },
    ], columns: 1 },
    { type: 'p', text: '네 팀이 한 고리를 공유하므로 2인 만칼라처럼 끝까지 읽기는 어렵고, **우월 전략은 없어요.** 추가 차례 연쇄를 노리는 계산과 상대 금고로 핀을 흘리지 않는 배분이 기본이에요.' },
  ],
  similar: [
    { name: '만칼라 (칼라)', players: '2명', alike: '구멍의 씨앗을 한 칸에 하나씩 뿌리고, 마지막 씨앗이 내 창고에 들어가면 한 번 더 두는 바로 그 규칙이에요. 방송에서도 이 게임을 모티브로 했다고 알려져 있어요.', differs: '칼라는 2인 대결이고 시간 제한이나 특수 핀이 없어요.' },
    { name: '트라야누스 (Trajan)', players: '2–4명', alike: '만칼라식으로 말을 옮겨 어떤 행동을 할지 정하는 게임이에요.', differs: '트라야누스는 만칼라를 행동 선택 장치로 쓰는 전략 게임이고, 상대의 판에 말을 보내지 않아요.' },
  ],
}, {
  meta: {
    title: 'Time Is Gold rules — The Time Hotel Kairos game, mancala for four teams',
    description: 'The rules of Time Is Gold (I and II) from The Time Hotel: two-player teams with an in-player and an out-player, five trays of four gold pins, clockwise sowing and extra turns, the 3-minute limit, double and minus pins, scoring, and the out-player draft of version II.',
    keywords: ['Time Is Gold', 'The Time Hotel mancala', 'Time Hotel Kairos game', '더 타임 호텔 타임 이즈 골드'],
  },
  title: 'Time Is Gold — The Time Hotel Kairos game',
  name: 'Time Is Gold (타임 이즈 골드)',
  lead: 'Sow gold pins one per space clockwise and gather them in your vault: mancala for four teams on one board, with the thinker and the mover split.',
  summary: 'A four-team mancala race for the vaults: first on day 3, then as Time Is Gold II on day 7 with guest athletes moving the pins.',
  setup: [
    { type: 'list', items: [
      '**Players**: four teams of two by draw (A–D). Each team picks an **in-player** who directs from inside the line and an **out-player** who moves pins from outside it; roles are fixed.',
      '**Board**: a ring with a team vault at each corner and that team’s five trays along a side.',
      '**Pins**: four gold pins per tray.',
      '**Items** (bought with personal time before a round, each replacing a gold pin in one of your trays): **double pin** (2 h, four in all) — 2 extra points if it ends in your vault; **minus pin** (1 h, eight in all) — 1 point off if it ends in a vault.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Turn', body: 'Teams play A, B, C, D. The out-player picks one of the team’s trays, takes all its pins and drops them **one per space clockwise**.' },
      { title: 'Rival vaults', body: 'A rival vault on the way gets a pin too.' },
      { title: 'Extra turn', body: 'If **the last pin lands in your own vault**, pick a tray and go again.' },
      { title: 'Time limit', body: 'Three minutes from the first pin picked to the last one placed; over that, one pin is removed, then one more every 30 seconds. Knocked-over pins must be stood up again.' },
      { title: 'End', body: 'The game ends the moment one team has emptied all five of its trays.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'One point per pin in your vault, **minus one per tray of yours still holding pins**. Ties go to the team that used less time.',
      'Day 3 rewards: 12 h for the winning team, then 8, 4, 0. Both players of the last team go straight to the checkout game (Silent Otrio).',
    ] },
  ],
  exceptions: [
    { type: 'h3', text: 'Time Is Gold II (day 7)' },
    { type: 'list', items: [
      'Same rules, but four guests (athletes and a comedian) are the **out-players**.',
      'They are drafted by **time auction** first: opening bid 1 hour, steps of 30 minutes; the last pick pays only the opening bid.',
      'The move limit drops to **2 minutes**.',
      'There is no checkout game: **last place checks out directly**. Rewards: 8 h, 4, 2.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'At heart this is **mancala sowing**: everything starts from the fact that a tray whose pin count equals its distance to your vault gives an extra turn.' },
    { type: 'cards', items: [
      { title: 'Distance equals pins', body: 'A tray n spaces from your vault holding exactly n pins drops its last pin in the vault and you move again. Emptying trays nearest the vault first can chain extra turns, and clearing several trays in one turn controls both score and the ending.' },
      { title: 'Your pins feed others', body: 'Pins run onto the next team’s side and become theirs, and each rival vault you pass gets one. Sending a big tray far helps opponents, which is also why the minus pin is a weapon: put it in your tray and sow it past a rival vault.' },
      { title: 'The finisher gains', body: 'Each tray still holding pins costs a point, so when one team empties its side the others pay for what is left. But pins keep arriving from others, so you cannot fully control when your side is empty.' },
      { title: 'Head and hands apart', body: 'The thinker cannot touch the pins and the mover is under the clock. Fast, exact hands within 3 minutes (2 in II) matter, which is why version II auctions the out-players.' },
    ], columns: 1 },
    { type: 'p', text: 'With four teams on one ring it cannot be read out like two-player mancala, so **there is no dominant strategy**. The basics are chaining extra turns and not leaking pins into rival vaults.' },
  ],
  similar: [
    { name: 'Mancala (Kalah)', players: '2', alike: 'Sow seeds one per pit and move again when the last seed lands in your store: the very rule used here, and the game the show is reported to have drawn on.', differs: 'Kalah is a two-player duel with no time limit or special pieces.' },
    { name: 'Trajan', players: '2–4', alike: 'A mancala-style track of pieces decides what you do.', differs: 'It uses mancala as an action selector in a strategy game, and you never sow onto others’ boards.' },
  ],
});

export const silentOtrio = thGame('silent-otrio', 'checkout', { ko: '3일차', en: 'Day 3' }, ['3'], ['blindGomoku', 'pointOmok', 'flipOmok'], {
  meta: {
    title: '침묵의 오트리오 규칙 — 더 타임 호텔 3일차 체크아웃 게임, 말 없이 하는 2:2 오트리오',
    description: '더 타임 호텔 3일차 체크아웃 게임 침묵의 오트리오의 규칙을 정리했어요. 조력자 선택, 크기 세 가지의 말 9개, 3×3판, 대화 금지와 15초 제한, 오트리오가 되는 세 가지 조건, 종 치기와 5점 선승까지.',
    keywords: ['침묵의 오트리오', '오트리오', '더 타임 호텔 오트리오', '더타임호텔 체크아웃 게임', '더타임호텔'],
  },
  title: '침묵의 오트리오 — 더 타임 호텔 3일차 체크아웃 게임',
  name: '침묵의 오트리오',
  lead: '크기가 다른 원형 말을 3×3판에 놓아 같은 색 세 개를 잇는 오트리오를, 조력자와 한마디도 하지 않고 2:2로 해요.',
  summary: '체크아웃 후보 두 사람이 조력자 한 명씩과 말 없이 겨루는 오트리오. 5점을 먼저 내면 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 체크아웃 후보 2명이 조력자를 1명씩 골라 2:2.',
      '**말**: 네 사람이 각자 고유한 색의 말을 받아요. 작은 것·중간 것·큰 것 3개씩, 모두 9개.',
      '**게임판**: 3×3. 한 칸에는 작은·중간·큰 말을 하나씩 겹쳐 넣을 수 있어요.',
      '**아이템**: 제한 시간 5초 추가(3시간).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '차례', body: '선 후보 → 후 후보 → 선 후보의 조력자 → 후 후보의 조력자 순서로 15초 안에 말을 하나씩 놓아요. 게임 내내 말로 소통하는 건 금지예요.' },
      { title: '오트리오', body: '말을 놓은 뒤 **자기 색이나 자기 조력자의 색**이 아래 조건 중 하나를 이루면, 체크아웃 후보가 종을 쳐요.' },
      { title: '득점', body: '종을 치는 데 성공하면 그 후보가 1점을 얻어요.' },
      { title: '판 교체', body: '더 놓을 자리가 없으면 새 판으로 바꾸고, 직전에 득점한 사람이 선이 돼요.' },
    ] },
    { type: 'list', items: [
      '같은 색·같은 크기 말 3개가 가로·세로·대각선 한 줄.',
      '같은 색 말 3개가 한 줄에서 작은–중간–큰 순서(방향 무관).',
      '같은 색 말 3개(작은·중간·큰)가 한 칸에.',
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**먼저 5점**을 얻은 후보가 체크아웃 게임에서 이기고, 진 후보는 체크아웃돼요. 이긴 사람은 진 사람의 시간을 모두 가져가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '종은 체크아웃 후보만 칠 수 있어요. 조력자는 놓을 뿐이에요.',
      '종을 잘못 쳤을 때의 벌칙은 정리된 규칙에서 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '원래의 오트리오는 개인전이지만, 여기서는 **두 가지 색이 한 팀의 점수**가 되고 **대화가 금지**돼요. 이 두 변화가 게임을 협력 읽기 싸움으로 바꿔요.' },
    { type: 'cards', items: [
      { title: '위협이 두 배', body: '한 팀에 색이 둘이라, 막아야 할 줄과 만들 수 있는 줄이 모두 두 배예요. 상대 두 색의 위협을 동시에 막기는 어려워서, 하나를 막으면 다른 하나가 열리는 갈림길이 자주 생겨요. 이때 막을지 내 줄을 만들지 결정하는 판단이 승부를 갈라요.' },
      { title: '말 없는 신호', body: '조력자는 후보가 무엇을 노리는지 말로 들을 수 없어요. 후보가 놓은 말의 위치가 곧 신호이고, 조력자는 그것을 이어 줄지 상대를 막을지 스스로 읽어야 해요. 그래서 조력자는 실력보다 **후보와 같은 방식으로 생각하는 사람**이 더 유리할 수 있어요.' },
      { title: '판은 금방 찬다', body: '한 판의 자리는 9칸×3크기 = 27개인데 네 사람의 말은 36개예요. 판이 차면 교체되므로, 5점을 내려면 여러 판을 치러야 해요. 판 교체 후 선을 잡는 직전 득점자가 다음 판에서 먼저 위협을 만들 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '오트리오 자체는 선이 유리한 편이고 세 가지 승리 조건이 겹쳐 수비가 어려워요. 여기에 15초 제한까지 더해져, **우월 전략**보다는 빠른 패턴 인식이 결정적이에요.' },
  ],
  similar: [
    { name: '오트리오 (Otrio)', players: '2–4명', alike: '이 게임의 바탕이에요. 크기가 다른 고리 세 종류, 3×3판, 세 가지 승리 조건이 같아요. 방송도 이 게임을 모티브로 했다고 알려져 있어요.', differs: '원작은 2인이면 두 색씩 쥐고, 4인이면 각자 한 색으로 겨루는 개인전이에요. 대화 금지나 제한 시간은 없어요.' },
    { name: '고블렛 고블러스 (Gobblet Gobblers)', players: '2명', alike: '크기가 다른 말을 3×3판에 놓아 한 줄을 만드는 게임이에요.', differs: '고블렛은 큰 말이 작은 말을 덮어 빼앗을 수 있고, 이미 놓은 말을 옮길 수도 있어요.' },
  ],
}, {
  meta: {
    title: 'Silent Otrio rules — The Time Hotel, day 3 checkout game',
    description: 'The rules of Silent Otrio (침묵의 오트리오) from The Time Hotel: choosing a helper, nine pieces in three sizes, the 3×3 board, no talking and 15-second turns, the three ways to score, ringing the bell and first to five points.',
    keywords: ['Silent Otrio', 'Otrio', 'The Time Hotel checkout game', '더 타임 호텔 오트리오'],
  },
  title: 'Silent Otrio — The Time Hotel, day 3 checkout game',
  name: 'Silent Otrio (침묵의 오트리오)',
  lead: 'Otrio — lining up three pieces of your colour on a 3×3 board of nesting sizes — played two against two without a single word to your helper.',
  summary: 'Two checkout candidates each pick a helper and play Otrio in silence; first to five points wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two checkout candidates, each with a helper of their choice.',
      '**Pieces**: each of the four has a colour: three small, three medium and three large pieces.',
      '**Board**: 3×3; a space can hold one small, one medium and one large piece at once.',
      '**Item**: 5 extra seconds (3 hours).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Turns', body: 'First candidate, second candidate, first’s helper, second’s helper, each placing one piece within 15 seconds. No talking at any time.' },
      { title: 'Otrio', body: 'If, after a placement, **your colour or your helper’s** meets a condition below, the candidate rings the bell.' },
      { title: 'Score', body: 'A successful bell scores the candidate 1 point.' },
      { title: 'New board', body: 'When nothing more can be placed, a fresh board is set up and the last scorer goes first.' },
    ] },
    { type: 'list', items: [
      'Three pieces of one colour and one size in a row, column or diagonal.',
      'Three of one colour in a line in size order small–medium–large (either direction).',
      'All three sizes of one colour in a single space.',
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The **first candidate to 5 points** wins; the other checks out and the winner takes all their time.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Only candidates ring the bell; helpers just place.',
      'The penalty for a wrong bell could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Ordinary Otrio is every player for themselves; here **two colours score for one team** and **talking is banned**. Those changes turn it into a contest of reading your partner.' },
    { type: 'cards', items: [
      { title: 'Twice the threats', body: 'Two colours per team means twice the lines to make and to block. Stopping both enemy colours at once is hard, so forks appear often, and the choice between blocking and building decides games.' },
      { title: 'Signals without words', body: 'The helper cannot hear the plan; the candidate’s placements are the only signal, and the helper must decide whether to extend them or block. A helper who **thinks like the candidate** may matter more than a strong one.' },
      { title: 'Boards fill fast', body: 'A board has 27 slots (9 spaces × 3 sizes) but the four players hold 36 pieces, so boards are replaced and five points take several of them. The last scorer leads the new board and can threaten first.' },
    ], columns: 1 },
    { type: 'p', text: 'Otrio already favours the first mover, and three overlapping win conditions make defence hard. With 15-second turns, fast pattern recognition matters more than any **dominant strategy**, of which there is none.' },
  ],
  similar: [
    { name: 'Otrio', players: '2–4', alike: 'The base game: three ring sizes, a 3×3 board and the same three win conditions; the show is reported to have drawn on it.', differs: 'Two players each take two colours, four players one each; it is individual, with no silence rule or timer.' },
    { name: 'Gobblet Gobblers', players: '2', alike: 'Pieces of different sizes on a 3×3 board, trying to make a line.', differs: 'Bigger pieces cover smaller ones and placed pieces can move.' },
  ],
});

export const allWinRps = thGame('all-win-rock-paper-scissors', 'kairos', { ko: '4일차', en: 'Day 4' }, ['4'], ['hiddenWord', 'nemoCount', 'russianRoulette'], {
  meta: {
    title: '전승 가위바위보 규칙 — 더 타임 호텔 4일차 카이로스 게임, 숨은 7장을 모두 이기기',
    description: '더 타임 호텔 4일차 카이로스 게임 전승 가위바위보의 규칙을 정리했어요. 숨겨진 문제판 7장, 같은 카드 최대 3장, 가위·바위·보 3장씩, 10분 라운드와 승리 횟수만 공개, 비김 알림 카드, 마지막까지 전승하지 못한 사람의 체크아웃까지.',
    keywords: ['전승 가위바위보', '더 타임 호텔 전승 가위바위보', '더타임호텔 4일차', '가위바위보 마스터마인드', '더타임호텔'],
  },
  title: '전승 가위바위보 — 더 타임 호텔 4일차 카이로스 게임',
  name: '전승 가위바위보',
  lead: '숨겨진 가위바위보 카드 7장을 순서대로 모두 이기는 배치를 찾아요. 라운드마다 알려 주는 건 이긴 개수뿐이에요.',
  summary: '이긴 개수만 듣고 숨은 7장의 배치를 맞히는 추리 게임. 마지막까지 전승하지 못한 한 사람이 바로 체크아웃돼요.',
  setup: [
    { type: 'list', items: [
      '**문제판**: 가위바위보 카드 7장이 비공개로 놓여 있어요. 같은 카드는 최대 3장까지만 쓰여요.',
      '**플레이어**: 각자 가위·바위·보 3장씩(9장)과 대결판 1개.',
      '**아이템**: 비김 알림 카드(1시간) — 3라운드부터, 가위·바위·보 중 하나로 사요. 한 번 쓰는 카드로, 그 카드가 비기면 비겼다고 알려 줘요. 라운드당 1인 1장.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '배치', body: '라운드마다 10분 안에 대결판 7칸에 카드를 놓아 지배인에게 내요.' },
      { title: '대결', body: '대결판의 각 칸은 문제판의 같은 자리 카드와 겨뤄요.' },
      { title: '결과', body: '라운드가 끝나면 사람마다 **이긴 횟수만** 한꺼번에 공개돼요. 어느 칸에서 이겼는지, 비겼는지 졌는지는 알려 주지 않아요.' },
      { title: '전승', body: '7칸을 모두 이긴 사람은 바로 전승자 대기석으로 가요. 같은 라운드에 여럿이면 먼저 낸 순서로 순위를 매겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '전승한 순서대로 시간을 받아요: 1위 12시간, 2위 9, 3위 7, 4위 6, 5위 4, 6위 2.',
      '이 날은 체크아웃 게임이 없고, **마지막까지 전승하지 못한 사람**이 바로 체크아웃돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '비김 알림 카드는 3라운드 이후에만 살 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '전승 가위바위보는 가위바위보의 탈을 쓴 **마스터마인드**예요. 돌아오는 정보는 이긴 개수 하나뿐이고, 비김과 짐은 구분해 주지 않아요.' },
    { type: 'cards', items: [
      { title: '3장 제한이 정답을 좁힌다', body: '문제판도 같은 카드가 3장까지라, 7장의 구성은 3·3·1이나 3·2·2 꼴뿐이에요. 내 손에도 종류마다 3장밖에 없어서 "7칸 모두 바위" 같은 단순한 탐색은 불가능해요. 그래서 한 칸만 바꿔 가며 승리 수의 변화를 보는 방식이 기본이에요.' },
      { title: '한 칸 바꾸기의 정보', body: '다른 칸은 그대로 두고 한 칸만 바위에서 보로 바꾸면 그 칸이 확정돼요. 승리 수가 하나 늘면 문제 카드는 바위, 하나 줄면 가위, 그대로면 보예요. 하지만 한 라운드에 한 칸씩만 바꾸면 7칸을 확인하는 데 라운드가 너무 많이 들어요. 여러 칸을 동시에 바꾸면 변화가 서로 상쇄될 수 있어, 비김을 바로 알려 주는 비김 알림 카드가 그 모호함을 줄여 줘요.' },
      { title: '혼자보다 함께', body: '문제판이 모두에게 같다면, 서로 다른 배치를 내고 결과를 나누는 사람들은 한 라운드에 몇 배의 정보를 얻어요. 탈락은 꼴찌 한 명뿐이라, 정보를 나누는 무리에 들어가는 것이 가장 확실한 생존법이에요. 반대로 공유받지 못하는 사람은 같은 시간에 훨씬 적게 배워요.' },
    ], columns: 1 },
    { type: 'p', text: '논리적으로는 한 칸씩 확인하는 탐색으로 언젠가 반드시 풀리므로, 승부는 **라운드 수**예요. 우월 전략은 없지만, 라운드당 얻는 정보를 늘리는 배치(여러 칸을 동시에 바꾸고 결과를 조합하기)가 앞서는 길이에요.' },
  ],
  similar: [
    { name: '마스터마인드 (Mastermind)', players: '2명', alike: '숨겨진 배열을 추측하고, 맞은 개수만 듣고 다음 추측을 고치는 바로 그 구조예요.', differs: '마스터마인드는 "색과 자리 모두 맞음"과 "색만 맞음"을 따로 알려 줘서 정보가 더 많아요.' },
    { name: '블랙 박스 (Black Box)', players: '2명', alike: '숨겨진 배치를 간접적인 결과만으로 추리해요.', differs: '블랙 박스는 격자 속 원자의 위치를 광선이 나오는 방향으로 알아내요.' },
  ],
}, {
  meta: {
    title: 'All-Win Rock Paper Scissors rules — The Time Hotel, day 4 Kairos game',
    description: 'The rules of All-Win Rock Paper Scissors (전승 가위바위보) from The Time Hotel: a hidden board of seven cards with at most three of a kind, three each of rock, paper and scissors, 10-minute rounds where only win counts are announced, the draw-alert card, and checkout for whoever never sweeps.',
    keywords: ['All-Win Rock Paper Scissors', 'The Time Hotel', 'rock paper scissors mastermind', '더 타임 호텔 전승 가위바위보'],
  },
  title: 'All-Win Rock Paper Scissors — The Time Hotel, day 4 Kairos game',
  name: 'All-Win Rock Paper Scissors (전승 가위바위보)',
  lead: 'Find the arrangement that beats all seven hidden rock-paper-scissors cards in order. Each round you are told only how many you won.',
  summary: 'Deduce seven hidden cards from your win count alone; the one player who never sweeps checks out on the spot.',
  setup: [
    { type: 'list', items: [
      '**Problem board**: seven hidden cards, with at most three of any kind.',
      '**Each player**: three each of rock, paper and scissors (nine cards) and an answer board.',
      '**Item**: draw-alert card (1 hour) — from round 3, bought as rock, paper or scissors; single-use, it tells you if that card drew. One per player per round.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Arrange', body: 'Each round, set cards in your board’s seven slots within 10 minutes and hand it in.' },
      { title: 'Compare', body: 'Each slot plays the problem card in the same position.' },
      { title: 'Results', body: 'Only **each player’s number of wins** is announced, all at once: not which slots, and not draws versus losses.' },
      { title: 'Sweep', body: 'Whoever wins all seven moves to the winners’ seats at once; simultaneous sweeps are ranked by submission order.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Time by sweep order: 12 h, 9, 7, 6, 4, 2.',
      'No checkout game that day: **the last player who never sweeps** checks out directly.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Draw-alert cards are on sale only from round 3.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is **Mastermind** dressed as rock-paper-scissors, with even less feedback: wins are counted, but draws and losses look the same.' },
    { type: 'cards', items: [
      { title: 'The three-card cap narrows it', body: 'The problem board also has at most three of a kind, so its make-up is 3-3-1 or 3-2-2. You hold only three of each yourself, so a naive probe like seven rocks is impossible; changing one slot at a time and watching the count is the basic method.' },
      { title: 'What one change tells you', body: 'Keep everything else and switch one slot from rock to paper, and that slot is settled: one more win means the hidden card is rock, one fewer means scissors, no change means paper. But one slot per round takes too many rounds, and changing several at once lets the shifts cancel out; the draw-alert card, which flags a draw directly, cuts through that ambiguity.' },
      { title: 'Better together', body: 'If the problem board is the same for all, players who submit different arrangements and pool results learn several times as much per round. Only last place is eliminated, so joining an information-sharing group is the surest way to survive; anyone left out learns far less in the same time.' },
    ], columns: 1 },
    { type: 'p', text: 'Slot-by-slot testing always solves it eventually, so the contest is **number of rounds**. There is no dominant strategy, but arrangements that test several slots at once and combine results get there first.' },
  ],
  similar: [
    { name: 'Mastermind', players: '2', alike: 'Guess a hidden sequence and refine it from a count of hits: the same structure.', differs: 'Mastermind reports right-colour-right-place and right-colour-wrong-place separately, giving more information.' },
    { name: 'Black Box', players: '2', alike: 'You deduce a hidden layout from indirect results only.', differs: 'You locate atoms in a grid from where fired rays emerge.' },
  ],
});
