// 더 지니어스: 룰 브레이커, rounds 4–7: 암전 게임 (round 4 main, round 6 death), 7계명, 레이저 장기, 독점 게임, 신의 판결,
// 인디언 홀덤 (rounds 7 and 10, and the final's first game).
import { g2Game } from './shared';

export const blackout = g2Game({ slug: 'blackout-game', kind: 'main', rounds: [4, 6], label: { ko: '4회전 메인 · 6회전 데스매치', en: 'Round 4 main match, round 6 Death Match' }, related: ['blindGomoku', 'russianRoulette', 'blackWhite'], check: 'two' }, {
  meta: {
    title: '암전 게임 규칙 — 더 지니어스 시즌2 룰 브레이커 4회전 메인 매치·6회전 데스매치, 어둠 속 경계선 넘기',
    description: '더 지니어스: 룰 브레이커 4회전 메인 매치이자 6회전 데스매치 암전 게임의 규칙을 정리했어요. 5:5 팀전, 1분 암전 동안 경계선 넘기, 수비수의 빨간·초록 버튼, 빨간 버튼 횟수 제한과 수비 페널티, 성공할수록 커지는 승점, 4:4 데스매치 방식까지.',
    keywords: ['암전 게임', '암전게임', '더 지니어스 암전 게임', '룰 브레이커 암전', '더 지니어스2', '더 지니어스 팀전'],
  },
  title: '암전 게임 — 더 지니어스: 룰 브레이커 4회전 메인 매치 · 6회전 데스매치',
  name: '암전 게임',
  lead: '불이 꺼진 1분 동안 공격 팀은 홀 가운데 경계선을 넘어가요. 불이 켜지기 전, 수비수는 누가 넘었는지 보지도 못한 채 빨간 버튼과 초록 버튼 중 하나를 눌러야 해요.',
  summary: '어둠 속에서 경계선을 넘는 공격 팀과, 넘었는지 짐작해 버튼을 누르는 수비수의 팀 심리전. 데스매치로도 쓰였어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 메인 매치는 10명이 5명씩 두 팀. 팀장은 제작진의 사전 투표로 정해진 사람이에요.',
      '**구성**: 두 번의 회전에서 두 팀이 한 번씩 공격과 수비를 맡아요. 한 회전은 수비 팀 5명이 한 번씩 수비수가 되는 5라운드예요.',
      '**장소**: 가운데 경계선이 있는 홀. 라운드 동안 완전히 어두워지고, 이름표 불빛도 꺼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암전', body: '라운드가 시작되면 불이 꺼지고, 공격 팀은 1분 안에 경계선을 넘을 수 있어요. 몇 명이 넘든 제한이 없고, 아무도 안 넘어도 돼요.' },
      { title: '빨간 버튼', body: '수비수가 누군가 넘었다고 보면 빨간 버튼을 눌러요. 넘은 사람이 있었다면 그 사람들은 남은 공격에서 빠져요. 아무도 안 넘었다면 수비 페널티로, 공격 팀이 고른 1명을 경계선 너머로 보내 줘요(그 사람은 성공으로 쳐요).' },
      { title: '초록 버튼', body: '아무도 안 넘었다고 보면 초록 버튼을 눌러요. 정말 아무도 없었다면 아무 일도 없어요. 넘은 사람이 있었다면 그 사람들이 승점을 얻어요.' },
      { title: '승점', body: '같은 사람이 성공할 때마다 승점이 1점씩 커져요. 처음 성공은 1점, 두 번째는 2점, 세 번째는 3점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '두 회전이 끝난 뒤 **승점이 높은 팀**이 이겨요. 이긴 팀 전원이 생명의 징표, 가넷 1개, 불멸의 징표 단서를 받아요.',
      '이긴 팀이 진 팀에서 탈락 후보 한 명을 정하고, 탈락 후보는 자기 팀원 중에서 데스매치 상대를 골라요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '메인 매치에서 빨간 버튼은 **5라운드 동안 4번까지만** 누를 수 있어요. 초록 버튼은 제한이 없어요.',
      '**6회전 데스매치**는 같은 방식에 인원만 줄였어요. 데스매치 진출자 두 명이 4명 팀의 팀장이 되고, 한 회전이 4라운드이며 빨간 버튼은 3번까지예요. 진 팀의 팀장이 탈락해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '암전 게임은 "넘었나, 안 넘었나"를 맞히는 단순한 추측 게임처럼 보이지만, **버튼 횟수 제한과 커지는 승점** 때문에 계산할 거리가 많아요.' },
    { type: 'cards', items: [
      { title: '수비수는 초록을 한 번은 눌러야 한다', body: '5라운드에 빨간 버튼은 4번뿐이라, 수비 팀은 적어도 한 번 초록을 눌러야 해요. 공격 팀이 빨간 버튼의 남은 횟수를 세고 있으면, 빨간 버튼을 다 쓴 뒤의 라운드는 사실상 "무조건 초록"이 돼 전원이 안전하게 넘을 수 있어요. 수비 팀은 빨간 버튼을 아끼면 그 정보를 감출 수 있지만, 아낀 만큼 다른 라운드에서 초록의 위험을 떠안아요.' },
      { title: '페널티를 한 사람에게 몰기', body: '빨간 버튼이 빗나가면 공격 팀이 고른 한 명이 넘어가요. 같은 사람에게 계속 몰아주면 그 사람의 성공 횟수가 쌓여 1, 2, 3, 4점처럼 커져요. 그래서 수비 쪽에서는 빨간 버튼이 빗나가는 비용이 횟수가 쌓일수록 커져요.' },
      { title: '공격은 몇 명을 보낼까', body: '한 번에 많이 넘기면 초록 라운드에서 크게 벌지만, 빨간 라운드에 걸리면 그만큼 공격수가 사라져요. 한 명씩만 보내면 손실은 작지만 점수도 작아요. 수비수가 어느 버튼을 누를지 예측이 설 때만 크게 거는 것이 기본이에요.' },
    ], columns: 1 },
    { type: 'p', text: '양쪽 모두 상대의 선택을 모른 채 동시에 고르는 구조라 **항상 이기는 수는 없어요.** 다만 빨간 버튼 횟수가 공개된 정보라, 그 숫자를 따라가며 마지막 라운드들을 예측 가능하게 만드는 쪽이 유리해요.' },
  ],
  similar: [
    { name: '스컬 (Skull)', players: '3–6명', alike: '보이지 않는 상태에서 상대가 "있다/없다" 중 무엇을 골랐을지 맞히는 블러핑이에요.', differs: '스컬은 원반을 뒤집어 확인하는 개인전이고, 팀 공격이나 버튼 횟수 제한이 없어요.' },
    { name: '바퀴벌레 포커 (Kakerlakenpoker)', players: '2–6명', alike: '상대가 하는 말이 참인지 거짓인지 판단해 고르는 이분법 심리전이에요.', differs: '바퀴벌레 포커는 카드를 넘기며 이름을 말하는 게임이고, 같은 카드가 쌓이면 져요.' },
  ],
}, {
  meta: {
    title: 'Blackout Game rules — The Genius: Rule Breaker, round 4 main match and round 6 Death Match',
    description: 'The rules of the Blackout Game (암전 게임) from The Genius: Rule Breaker: five against five, crossing a line during a 60-second blackout, the defender’s red and green buttons, the limited reds and the defence penalty, points that grow with each success, and the four-a-side Death Match version.',
    keywords: ['Blackout Game', 'The Genius Blackout', 'The Genius Rule Breaker', '암전 게임', '더 지니어스2'],
  },
  title: 'Blackout Game — The Genius: Rule Breaker, round 4 main match and round 6 Death Match',
  name: 'Blackout Game (암전 게임)',
  lead: 'For a minute in total darkness the attacking team may cross the line in the middle of the hall. Before the lights return, the defender — who saw nothing — must press red or green.',
  summary: 'A team bluffing game of crossing a line in the dark while a defender guesses; it was reused as a Death Match.',
  setup: [
    { type: 'list', items: [
      '**Players**: ten in the main match, in two teams of five; captains were chosen by a pre-game vote run by the producers.',
      '**Structure**: two halves, each team attacking once and defending once; a half has five rounds, each defending player taking one turn as defender.',
      '**Room**: a hall with a line across the middle, fully dark during rounds, name-tag lights included.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Blackout', body: 'The lights go out and the attackers have 60 seconds to cross; any number may cross, or none.' },
      { title: 'Red', body: 'If the defender thinks someone crossed, they press red: anyone who crossed is out of the attack. If nobody crossed, the attackers send one player of their choice across as a penalty, and it counts as a success.' },
      { title: 'Green', body: 'If the defender thinks nobody crossed, they press green: nothing happens if that is right; anyone who did cross scores.' },
      { title: 'Points', body: 'A player’s successes grow in value: 1 point for the first, 2 for the second, 3 for the third.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After both halves **the team with more points** wins; all its members get a Token of Life, a garnet and a clue.',
      'The winners pick a Death Match candidate from the losing team, who picks an opponent from their own team.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'In the main match red may be pressed **only four times in five rounds**; green is unlimited.',
      '**The round 6 Death Match** used the same rules, smaller: the two candidates captained teams of four, halves had four rounds and three reds, and the losing captain was eliminated.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It looks like a pure guess — crossed or not — but **the button limit and the growing points** give it plenty to calculate.' },
    { type: 'cards', items: [
      { title: 'The defence must press green once', body: 'With four reds for five rounds, at least one round is green. If the attackers count the reds, once they run out the next rounds are certain greens and everyone crosses safely. Saving reds hides that information but means accepting green risks elsewhere.' },
      { title: 'Stack penalties on one player', body: 'Each wrong red sends one attacker of the attackers’ choice across. Sending the same player again and again stacks their successes — 1, 2, 3, 4 points — so wasted reds get more costly as the half goes on.' },
      { title: 'How many to send', body: 'Sending many wins big on a green but loses many attackers on a red; sending one keeps losses and gains small. Committing heavily only when the button is predictable is the basic rule.' },
    ], columns: 1 },
    { type: 'p', text: 'Both sides choose blind and at once, so **nothing wins every time**; but the number of reds used is public, and the side that tracks it can make the late rounds predictable.' },
  ],
  similar: [
    { name: 'Skull', players: '3–6', alike: 'A bluffing game of guessing whether something is there without seeing it.', differs: 'Skull is individual, flipping discs, with no teams or button limits.' },
    { name: 'Cockroach Poker', players: '2–6', alike: 'A yes-or-no judgement about whether the other side is bluffing.', differs: 'Cards are passed with claims, and collecting four of a kind loses.' },
  ],
});

export const sevenCommandments = g2Game({ slug: 'seven-commandments', kind: 'main', rounds: [5], related: ['piggyBank', 'hitStay', 'twoSidedPoker'], check: 'two' }, {
  meta: {
    title: '7계명 규칙 — 더 지니어스 시즌2 룰 브레이커 5회전 메인 매치, 법안을 만들어 점수를 바꾸는 게임',
    description: '더 지니어스: 룰 브레이커 5회전 메인 매치 7계명의 규칙을 정리했어요. 4색 칩, 공개되지 않는 개인 법안, 빈칸을 채워 내는 전체 법안 10종, 찬성·반대·절대찬성·절대반대 투표와 와일드카드, 7개까지 쌓이고 밀려나는 법안, 120분 뒤 점수 계산까지.',
    keywords: ['7계명', '칠계명', '7계명 게임', '더 지니어스 7계명', '룰 브레이커 7계명', '더 지니어스2'],
  },
  title: '7계명 — 더 지니어스: 룰 브레이커 5회전 메인 매치',
  name: '7계명',
  lead: '칩 하나가 1점인 게임에서, 규칙 자체를 투표로 바꿔요. 통과된 법안은 즉시 적용되고, 일곱 개까지만 남아요. 저마다 숨긴 개인 법안이 있어서 누구에게 어떤 법이 유리한지가 다 달라요.',
  summary: '빈칸을 채운 법안을 투표로 통과시켜 점수 규칙을 바꾸는 입법 게임. 숨겨진 개인 법안이 변수예요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 9명.',
      '**칩**: 빨강·노랑·초록·파랑 4색, 기본 1개 1점. 주머니에서 무작위로 4개씩 뽑아 시작하고, 게임 중 얻은 칩은 모두에게 공개돼요.',
      '**개인 법안**: 시작할 때 하나씩 받아요. 내용이 모두 다르고, 투표 없이 적용되며, 남에게 공개되지 않아요.',
      '**전체 법안 카드**: 빈칸을 채워 완성하는 10가지 법안을 모두 똑같이 받아요.',
      '**와일드카드**: 한 장씩 받아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '법안 제출', body: '120분 동안 언제든 전체 법안의 빈칸을 채워 제출할 수 있어요. 제출되면 바로 투표해요.' },
      { title: '투표', body: '찬성·반대·절대찬성·절대반대 중 하나를 골라요. 보통은 찬성이 많으면 통과, 반대가 많으면 부결이에요.' },
      { title: '절대 투표', body: '절대찬성이 하나라도 있으면 찬반 수와 상관없이 통과, 절대반대가 있으면 부결이에요. 절대 투표에는 와일드카드를 함께 내야 해요.' },
      { title: '7계명', body: '통과된 법안은 즉시 효력이 생기고 7계명에 올라요. 일곱 개가 찬 뒤 새 법안이 통과되면 가장 먼저 오른 법안이 없어져요.' },
      { title: '마무리', body: '120분이 지나면 모두 마지막으로 한 번씩 법안을 낼 기회를 갖고 끝나요. 개인 법안을 공개하고, 남은 전체 법안과 개인 법안에 따라 점수를 계산해요.' },
    ] },
    { type: 'table', head: ['전체 법안의 종류', '예시'], rows: [
      ['즉시 한 번 적용', '모두가 특정 색 칩 전부, 또는 와일드카드 한 장을 반납'],
      ['투표 규칙 바꾸기', '일정 인원 이상 찬성하면 절대 투표와 상관없이 통과 / 절대 투표 금지, 칩 색 고르기, 와일드카드 양도 허용(이 법안은 폐기되지 않음)'],
      ['칩을 얻는 조건', '법안이 통과될 때, 와일드카드를 쓸 때, 칩이 0개가 될 때 칩 얻기 / 통과·부결 쪽에 투표한 사람이 칩 얻기 / 특정 색을 얻을 때 남에게 칩 주기'],
      ['칩 교환', '칩 여러 개나 와일드카드를 원하는 색 칩으로 바꾸기, 칩이 적은 사람은 원하는 색으로 받기'],
      ['종료 시 점수', '한 가지 색만 / 네 색 하나씩 / 와일드카드 보유 시 보너스나 감점, 특정 색 칩 1개당 점수 가감'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '점수가 **가장 높은 사람이 우승**, 가장 낮은 사람이 탈락 후보예요.',
      '단독 우승이면 가넷 7개, 생명의 징표 2개, 불멸의 징표 단서를 받아요. 공동 우승이면 각자 생명의 징표와 단서만 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '와일드카드 없이 절대 투표를 하면 가진 칩을 모두 반납해야 해요.',
      '절대찬성과 절대반대가 함께 나오면 더 많은 쪽을 따르고, 같으면 절대 투표를 뺀 나머지 표로 정해요.',
      '개인 법안의 예: 끝날 때 칩이 0개면 큰 보너스, 다른 사람들이 가진 특정 색 칩 수가 내 점수, 원하는 한 색의 칩 점수를 두 배로(모두에게 적용), 내 칩을 원하는 한 색으로 바꾸기, 법안이 통과될 때마다 누군가의 칩 하나 반납시키기 등이 있었어요.',
      '전체 법안 10종과 개인 법안의 자세한 문구는 나무위키에만 정리돼 있어요. 영어 위키백과에는 진행과 보상만 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '7계명은 **점수 규칙을 플레이어가 직접 쓰는 게임**이에요. 칩을 많이 모으는 것보다, 내 칩 구성에 맞는 법을 통과시키고 남에게 유리한 법을 막는 것이 점수를 정해요.' },
    { type: 'cards', items: [
      { title: '개인 법안이 이해관계를 갈라놓는다', body: '칩이 0개일 때 보너스를 받는 사람, 남의 칩이 많아야 좋은 사람, 특정 색이 두 배가 되는 사람처럼 목표가 정반대예요. 그래서 "칩이 많을수록 좋다"는 공통 전제가 없고, 누구의 개인 법안이 무엇인지 알아내는 것이 곧 누가 어느 법안에 찬성할지 아는 일이에요. 개인 법안 카드를 보여 주는 것은 확실한 신호지만, 그만큼 견제도 받아요.' },
      { title: '와일드카드는 한 번의 거부권', body: '절대 투표는 다수결을 뒤집는 유일한 수단인데, 와일드카드는 한 장뿐이에요. 다수 연합에 맞서는 쪽에게는 이 한 장이 가장 중요한 자원이고, 다수 쪽에서는 와일드카드를 반납시키거나 절대 투표를 금지하는 법안으로 상대의 거부권을 먼저 없애려 해요.' },
      { title: '일곱 칸과 마지막 기회', body: '법안은 일곱 개까지만 남고 오래된 것부터 밀려나요. 끝날 때 적용되는 점수 법안은 일찍 통과시키면 나중에 밀려날 수 있어서, 늦게 낼수록 안전해요. 120분 뒤 모두에게 주어지는 마지막 제출 기회까지 생각하면, 마지막 순간에 판을 뒤집을 법안을 남겨 두는 것이 중요해요.' },
    ], columns: 1 },
    { type: 'p', text: '규칙이 계속 바뀌니 **고정된 우월 전략은 없어요.** 다만 개인 법안이 서로 맞물리는 사람끼리 일찍 손잡고, 투표 다수를 확보한 쪽이 법안 통과를 거의 마음대로 할 수 있어서, 결국 표 계산의 게임이 돼요.' },
  ],
  similar: [
    { name: '데모크레이지 (Democrazy)', players: '3–8명', alike: '플레이어가 법을 제안하고 투표로 통과시켜 점수 규칙을 바꿔요. 7계명의 바탕이 된 게임으로 알려져 있어요.', differs: '데모크레이지는 정해진 법 카드를 쓰고, 숨겨진 개인 법안이나 와일드카드가 없어요.' },
    { name: '노믹 (Nomic)', players: '2명 이상', alike: '게임 규칙 자체를 바꾸는 것이 게임의 내용이에요.', differs: '노믹은 규칙을 자유롭게 써서 제안하고, 칩이나 정해진 법안 틀이 없어요.' },
  ],
  note: '전체 법안·개인 법안의 세부 내용은 나무위키 한 곳에만 있어 요지만 옮겼어요.',
}, {
  meta: {
    title: 'Seven Commandments rules — The Genius: Rule Breaker, round 5 main match',
    description: 'The rules of the Seven Commandments (7계명) from The Genius: Rule Breaker: chips in four colours, secret personal bills, ten fill-in-the-blank global bills, votes for, against, absolutely for and absolutely against with wildcards, seven slots where the oldest bill drops, and scoring after 120 minutes.',
    keywords: ['7 Commandments', 'Seven Commandments', 'The Genius Rule Breaker', '7계명', '더 지니어스2'],
  },
  title: 'Seven Commandments — The Genius: Rule Breaker, round 5 main match',
  name: 'Seven Commandments (7계명)',
  lead: 'Each chip is a point — and the rules themselves are voted on. Passed bills apply at once and only seven stay in force, while every player hides a personal bill that makes different laws good for them.',
  summary: 'A law-making game: pass fill-in-the-blank bills to change the scoring, with hidden personal bills as the twist.',
  setup: [
    { type: 'list', items: [
      '**Players**: 9.',
      '**Chips**: red, yellow, green and blue, one point each; everyone draws four at random, and chips gained later are public.',
      '**Personal bill**: one each, all different, always in force and kept secret.',
      '**Global bill cards**: every player gets the same ten fill-in-the-blank bills.',
      '**Wildcard**: one each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Propose', body: 'At any time during 120 minutes, fill in a global bill and submit it; a vote follows at once.' },
      { title: 'Vote', body: 'Vote for, against, absolutely for or absolutely against; normally the majority decides.' },
      { title: 'Absolute votes', body: 'Any absolute-for passes a bill regardless of the count, and an absolute-against blocks it; an absolute vote must be cast with a wildcard.' },
      { title: 'Seven slots', body: 'Passed bills take effect immediately; once seven are in force, each new one pushes out the oldest.' },
      { title: 'Finish', body: 'After 120 minutes everyone gets one last proposal, personal bills are revealed, and scores are counted under the bills in force.' },
    ] },
    { type: 'table', head: ['Kind of global bill', 'Examples'], rows: [
      ['One-off', 'Everyone returns all chips of a colour, or a wildcard'],
      ['Voting rules', 'A bill passes with a set number of yes votes regardless of absolutes / no absolute votes, choose chip colours, wildcards tradeable (this bill is never discarded)'],
      ['Gaining chips', 'Gain a chip when your bill passes, when you use a wildcard, or when you hit zero / those who voted with the result gain a chip / give a chip away when gaining a colour'],
      ['Exchanges', 'Swap chips or a wildcard for a chosen colour; players with few chips pick their colour'],
      ['End scoring', 'Bonus or penalty for a single colour, one of each colour, or holding a wildcard; points per chip of a colour'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The highest score wins** and the lowest is the Death Match candidate.',
      'A sole winner earns seven garnets, two Tokens of Life and a clue; joint winners each get a Token of Life and a clue only.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Casting an absolute vote without a wildcard costs all of your chips.',
      'If both absolute votes appear, the more numerous side wins; if equal, the ordinary votes decide.',
      'Personal bills included a big bonus for ending with no chips, scoring the number of a colour other players hold, doubling one colour for everyone, recolouring your own chips, and making someone return a chip whenever a bill passes.',
      'The exact wording of all bills is recorded only in the fan wiki; English Wikipedia gives the flow and rewards.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'In the Seven Commandments **players write the scoring rules**. Passing laws that fit your chips, and blocking those that fit others, matters more than collecting chips.' },
    { type: 'cards', items: [
      { title: 'Personal bills split interests', body: 'One player wants zero chips, another wants others to have many, another wants one colour doubled. There is no shared "more chips is better", so learning who holds which personal bill tells you who will vote for what; showing your card is a credible signal that also draws fire.' },
      { title: 'A wildcard is a single veto', body: 'Absolute votes are the only way to overturn a majority and each player has one wildcard. For the minority it is the key resource, so a majority will try to strip wildcards or ban absolute votes first.' },
      { title: 'Seven slots and the last word', body: 'Only seven bills survive, oldest out first, so end-of-game scoring bills passed early can be pushed out; later is safer. With a final proposal round for everyone, keeping a game-changing bill for the end is crucial.' },
    ], columns: 1 },
    { type: 'p', text: 'The rules keep changing, so **there is no fixed dominant strategy**; but players whose personal bills mesh can ally early, and a voting majority can pass almost anything, so it becomes a game of counting votes.' },
  ],
  similar: [
    { name: 'Democrazy', players: '3–8', alike: 'Players propose and vote on laws that change how points are scored; it is known as the inspiration for this game.', differs: 'It uses fixed law cards and has no hidden personal laws or wildcards.' },
    { name: 'Nomic', players: '2+', alike: 'Changing the rules is the game.', differs: 'Rules are written freely; no chips or set bill templates.' },
  ],
  note: 'The global and personal bill texts come only from the fan wiki, so only their gist is given.',
});

export const laserJanggi = g2Game({
  slug: 'laser-janggi', kind: 'death', rounds: [5], related: ['janggi', 'cardJanggi', 'russianJanggi'], check: 'two',
  site: { id: 'laserJanggi', name: { ko: '레이저 장기', en: 'Laser Janggi' }, file: 'src/lib/laserJanggi.ts, src/lib/laserJanggiRoom.ts' },
}, {
  meta: {
    title: '레이저 장기 규칙 — 더 지니어스 시즌2 룰 브레이커 5회전 데스매치, 거울로 레이저를 꺾어 왕 맞히기',
    description: '더 지니어스: 룰 브레이커 5회전 데스매치 레이저 장기의 규칙을 정리했어요. 8×8 판, 레이저·스플리터·왕·세모기사·네모기사, 한 칸 이동 또는 90도 회전, 차례마다 자동 발사, 거울 없는 면에 맞으면 제거, 왕이 맞으면 패배. 원작 Khet과의 차이와 PUZZLTHINK에서 바로 플레이.',
    keywords: ['레이저 장기', '레이저장기', '더 지니어스 레이저 장기', '룰 브레이커 데스매치', '레이저 체스', 'Khet'],
  },
  title: '레이저 장기 — 더 지니어스: 룰 브레이커 5회전 데스매치',
  name: '레이저 장기',
  lead: '내 차례가 끝날 때마다 내 레이저가 발사돼요. 거울 달린 말로 빛을 꺾어 상대 왕을 맞히면 이겨요. 거울이 없는 면에 맞은 말은 내 것이든 상대 것이든 사라져요.',
  summary: '거울 말로 레이저를 꺾어 상대 왕을 맞히는 2인 전략 게임. 보드게임 Khet을 바꾼 버전이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**판**: 8×8 칸. 말은 정해진 자리에서 시작해요.',
      '**레이저(1개)**: 움직일 수 없고, 맞아도 사라지지 않아요. 차례가 끝나면 자동으로 발사돼요.',
      '**스플리터(1개)**: 빛을 그대로 통과시키면서 옆으로도 반사해 두 갈래로 나눠요. 맞아도 사라지지 않아요.',
      '**왕(1개)**: 어느 면이든 빛에 맞으면 바로 져요.',
      '**세모기사·네모기사**: 거울 면으로 빛을 반사해요. 거울이 없는 면에 맞으면 판에서 제거돼요. 나무위키 기준 세모기사 5개, 네모기사 2개예요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '한 가지 행동', body: '차례마다 말 하나를 상하좌우·대각선으로 한 칸 옮기거나, 말 하나를 90도 돌려요. 레이저는 옮길 수 없고 돌리기만 돼요.' },
      { title: '레이저 방향', body: '레이저는 판 바깥쪽을 향하도록 돌릴 수 없어요.' },
      { title: '발사', body: '행동이 끝나면 내 레이저가 발사돼요. 빛은 거울에서 꺾이고 스플리터에서 갈라져요.' },
      { title: '제거', body: '거울이 아닌 면에 빛을 맞은 말은 누구의 것이든 즉시 제거되고, 차례가 상대에게 넘어가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '상대 왕을 빛으로 맞히면 이겨요. **먼저 왕이 제거된 사람이 탈락**해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '원작 Khet과 비교하면 레이저 앞 칸 같은 금지 구역이 없고, 말 이름이 바뀌었으며, 일부 말(풍뎅이)이 빠졌어요.',
      '세모기사는 대각선 거울로 빛을 90도 꺾고, 네모기사는 한 면의 거울로 빛을 되돌려 보내요(영어 위키백과).',
      '내 레이저도 내 말을 맞힐 수 있어요. 빛이 꺾여 돌아오면 내 왕도 위험해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '레이저 장기는 장기나 체스와 달리 **말이 직접 잡지 않고 빛이 잡아요.** 한 수에 할 수 있는 일은 작지만, 거울 하나의 방향만 바꿔도 빛의 경로 전체가 바뀌어 판 반대편의 말이 사라질 수 있어요.' },
    { type: 'cards', items: [
      { title: '두 개의 레이저를 모두 계산한다', body: '내 차례 끝에는 내 레이저만 발사되지만, 다음 차례에 상대 레이저가 어디로 갈지도 봐야 해요. 내가 거울을 옮기면 상대 빛의 길도 바뀌어, 내 수가 상대에게 길을 열어 줄 수 있어요.' },
      { title: '상대 레이저를 내 것으로', body: '상대 레이저 바로 앞에 내 세모기사를 놓으면 상대의 빛을 막거나, 각도를 맞춰 상대 진영 쪽으로 돌려 보낼 수 있어요. 레이저는 움직일 수 없으니 그 앞의 칸은 늘 다툼의 중심이에요.' },
      { title: '왕을 감싸는 수비', body: '왕 주위를 거울 면이 바깥을 향한 기사들로 감싸면 어느 방향의 빛도 튕겨 낼 수 있어요. 다만 기사의 거울 없는 면이 노출되면 기사가 먼저 사라지고 구멍이 생겨요. 스플리터는 맞아도 사라지지 않아 공격과 수비 양쪽에서 가장 귀한 말이에요.' },
    ], columns: 1 },
    { type: 'p', text: '완전 정보 2인 게임이라 운이 없고, 이론상 결과는 정해져 있지만 사람이 다 계산할 수는 없어요. **우월 전략보다 수읽기 깊이**가 승부를 가르는 게임이에요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 레이저 장기는 8×8 판, 한 칸 이동(대각선 포함) 또는 90도 회전, 차례마다 자동 발사, 거울 없는 면 제거, 왕 피격 패배가 방송과 같아요.',
      '시작 배치는 방송 화면의 판을 읽어 옮겼어요. 사이트는 한쪽당 **세모기사 6개, 네모기사 1개**로, 나무위키에 적힌 수(세모 5, 네모 2)와 달라요. 이 차이는 방송 판을 다시 확인하지 못해 그대로 적어 둬요.',
      '혼자 하면 AI(쉬움·보통·어려움)와 두고, 내가 항상 먼저 두며 시간 제한이 없어요.',
      '친구 방에서는 차례 시간을 30·60·90초 중에서 골라요. 시간을 넘긴 차례는 쉬움 AI가 대신 두고, 세 번 연속이면 져요. 200수가 지나면 무승부예요.',
    ] },
  ],
  similar: [
    { name: '케트 (Khet)', players: '2명', alike: '레이저 장기의 원작이에요. 거울 달린 피라미드 말로 레이저를 꺾어 상대 파라오를 맞혀요.', differs: '케트는 금지 칸이 있고, 말을 맞바꾸는 풍뎅이 같은 말이 더 있어요.' },
    { name: '레이저 메이즈 (Laser Maze)', players: '1명', alike: '거울과 스플리터를 배치해 레이저를 목표에 맞히는 원리가 같아요.', differs: '레이저 메이즈는 혼자 푸는 퍼즐이고, 상대가 없어요.' },
  ],
}, {
  meta: {
    title: 'Laser Janggi rules — The Genius: Rule Breaker, round 5 Death Match (laser chess)',
    description: 'The rules of Laser Janggi (레이저 장기, laser chess) from The Genius: Rule Breaker: an 8×8 board, laser, splitter, king, triangle and square knights, move one square or rotate 90°, an automatic shot every turn, pieces removed when hit on an unmirrored side, a hit king loses — how it differs from Khet, and play it on PUZZLTHINK.',
    keywords: ['Laser Janggi', 'Laser Chess', 'The Genius laser chess', 'Khet', '레이저 장기'],
  },
  title: 'Laser Janggi — The Genius: Rule Breaker, round 5 Death Match',
  name: 'Laser Janggi (레이저 장기)',
  lead: 'Your laser fires at the end of every turn of yours. Bend the beam with mirrored pieces to hit the enemy king; any piece hit on a side without a mirror — yours or theirs — is gone.',
  summary: 'A two-player strategy game of bending a laser with mirror pieces to hit the enemy king, adapted from the board game Khet.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two Death Match candidates.',
      '**Board**: 8×8, pieces on fixed starting squares.',
      '**Laser (1)**: cannot move or be destroyed; fires automatically at the end of your turn.',
      '**Splitter (1)**: lets the beam pass straight through while also reflecting it, splitting it in two; cannot be destroyed.',
      '**King (1)**: lost the moment a beam hits it on any side.',
      '**Triangle and square knights**: reflect off their mirrored faces and are removed if hit elsewhere; the fan wiki gives five triangles and two squares.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'One action', body: 'Move one piece one square in any of eight directions, or rotate one piece 90°. The laser can only rotate.' },
      { title: 'Laser facing', body: 'The laser can never be turned to face off the board.' },
      { title: 'Fire', body: 'Your laser fires after your action, bending at mirrors and splitting at the splitter.' },
      { title: 'Remove', body: 'Any piece hit on a non-mirrored side is removed at once, and the turn passes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Hit the enemy king to win; **the player whose king falls first is eliminated**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Compared with Khet: no forbidden squares such as the one in front of a laser, renamed pieces, and some pieces (the scarab) removed.',
      'Triangle knights turn the beam 90° with a diagonal mirror; square knights send it straight back from one mirrored face (English Wikipedia).',
      'Your own beam can hit your own pieces, king included, if it bends back.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Unlike janggi or chess, **pieces never capture; the beam does.** A single move is small, but turning one mirror can reroute the whole beam and remove a piece across the board.' },
    { type: 'cards', items: [
      { title: 'Count both lasers', body: 'Only your laser fires on your turn, but you must also see where the opponent’s will go next; moving a mirror changes their path too and can open a line onto you.' },
      { title: 'Borrow their laser', body: 'A triangle knight placed right in front of the enemy laser can block it, or be angled to send that beam back into their camp. Since the laser cannot move, the square in front of it is always contested.' },
      { title: 'Shelter the king', body: 'Knights with mirrors facing outward can deflect beams from any side, but an exposed unmirrored face makes a knight disappear first and opens a hole. The indestructible splitter is the most valuable piece on both attack and defence.' },
    ], columns: 1 },
    { type: 'p', text: 'It is a perfect-information game with no luck: the result is fixed in theory but far beyond human calculation, so **reading depth, not a dominant strategy,** decides it.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      "PUZZLTHINK's Laser Janggi matches the 8×8 board, one-square moves (diagonals included) or 90° turns, the automatic shot, removal on unmirrored faces and losing when the king is hit.",
      'The starting layout was read off the broadcast board. The site gives each side **six triangle knights and one square knight**, which differs from the fan wiki’s count (five and two); this has not been re-checked against the episode, so both are noted.',
      'Solo you play an AI (easy, normal, hard), always moving first, with no clock.',
      'Rooms with a friend offer 30, 60 or 90-second turns; a timed-out turn is played by the easy AI, three in a row loses, and the game is drawn after 200 turns.',
    ] },
  ],
  similar: [
    { name: 'Khet', players: '2', alike: 'The original: mirrored pyramids bend a laser to hit the opposing pharaoh.', differs: 'Khet has restricted squares and extra pieces such as the swapping scarab.' },
    { name: 'Laser Maze', players: '1', alike: 'Mirrors and splitters route a laser to a target on the same principle.', differs: 'A solo puzzle with no opponent.' },
  ],
});

export const monopolyGame = g2Game({ slug: 'monopoly-game', kind: 'main', rounds: [6], related: ['piggyBank', 'hitStay', 'twoSidedPoker'], check: 'two' }, {
  meta: {
    title: '독점 게임 규칙 — 더 지니어스 시즌2 룰 브레이커 6회전 메인 매치, 한 가지 자원을 모두 모으기',
    description: '더 지니어스: 룰 브레이커 6회전 메인 매치 독점 게임의 규칙을 정리했어요. 자원 8종과 폭탄 64장, 8장씩 나눈 카드와 신분증, 같은 장수 맞교환, 가넷 10개로 폭탄 해체, 자원 독점과 폭탄 독점의 보상과 탈락 후보 규칙까지.',
    keywords: ['독점 게임', '독점게임', '더 지니어스 독점 게임', '룰 브레이커 독점', '더 지니어스2'],
  },
  title: '독점 게임 — 더 지니어스: 룰 브레이커 6회전 메인 매치',
  name: '독점 게임',
  lead: '여덟 명이 카드 8장씩을 나눠 갖고 맞바꿔요. 한 가지 자원을 전부 모으면 독점 버튼을 눌러 바로 우승해요. 그때 폭탄을 가장 많이 든 사람이 탈락 후보가 돼요.',
  summary: '카드를 맞바꿔 한 가지 자원을 독점하면 끝나는 거래 게임. 폭탄 카드를 피하거나 모으는 선택이 있어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 8명.',
      '**카드 64장**: 석탄·철·나무 각 8장, 물·석유·금·쌀·다이아몬드 각 7장, 폭탄 5장.',
      '**배분**: 섞은 카드를 8장씩 나눈 더미 중 하나를 골라 확인한 뒤, 딜러가 관리하는 서랍에 보관해요.',
      '**신분증**: 자기 카드를 열람할 수 있는 신분증을 하나씩 받아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '카드 꺼내기', body: '교환하려는 사람은 딜러에게 신분증을 보여 주고 자기 카드를 받아요.' },
      { title: '맞교환', body: '두 사람이 **같은 장수**의 카드를 맞바꿔요. 교환이 끝나면 카드를 다시 맡기고 신분증을 돌려받아요.' },
      { title: '폭탄 해체', body: '가넷 10개를 내면 폭탄 카드 하나를 해체할 수 있어요. 해체된 폭탄은 게임에서 빠지고, 해체 사실은 다른 사람에게 알려지지 않아요.' },
      { title: '독점', body: '한 종류의 카드를 모두 모은 사람이 독점 버튼을 눌러 성공하면 게임이 바로 끝나요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '독점에 성공한 사람이 **단독 우승자**예요.',
      '**자원으로 독점**하면 우승자는 생명의 징표 2개, 가넷 5개, 불멸의 징표 단서를 받고, 폭탄을 가장 많이 가진 사람이 탈락 후보가 돼요.',
      '**폭탄 5장으로 독점**하면 우승자는 생명의 징표 2개, 가넷 10개, 단서를 받고, 자원 종류를 가장 많이 가진 사람이 탈락 후보가 돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '자원 독점 때 폭탄 최다 보유자가 여럿이면 우승자가 탈락 후보를 정해요(영어 위키백과).',
      '교환은 둘이서만, 같은 장수로만 할 수 있어요. 그래서 각자 손에 든 카드 수는 해체하지 않는 한 8장 그대로예요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '독점 게임의 핵심 제약은 **손패가 늘 8장**이라는 점이에요. 맞교환은 같은 장수끼리만 되니, 한 자원을 독점하려면 그 자원만으로 손을 채워야 해요.' },
    { type: 'cards', items: [
      { title: '8장 자원과 7장 자원', body: '석탄·철·나무는 8장이라 독점하면 손패 전체가 그 자원이에요. 7장 자원은 한 칸이 남아 다른 카드 하나를 들고 있을 수 있어요. 폭탄을 해체하면 손패가 7장이 돼 8장 자원은 독점할 수 없게 되니, 해체는 꼴찌를 피하는 대신 우승 길 하나를 닫는 선택이에요.' },
      { title: '한 장이면 막을 수 있다', body: '독점은 모든 카드를 모아야 하니, 그 자원 한 장만 들고 있어도 막을 수 있어요. 그래서 누가 무엇을 모으는지 알면 그 자원의 마지막 한 장이 가장 비싼 카드가 돼요. 반대로 여러 자원을 한 장씩 들고 있으면, 폭탄 독점이 나왔을 때 "자원 종류 최다"로 탈락 후보가 될 위험이 생겨요.' },
      { title: '폭탄의 두 얼굴', body: '폭탄은 누군가 자원을 독점하면 꼴찌를 정하는 벌칙이지만, 5장만 모으면 되는 가장 빠른 독점이기도 해요. 폭탄을 모으기 시작하면 남들이 폭탄을 넘겨주고 싶어 하는 것도 유리하지만, 그 전에 다른 사람이 자원을 독점하면 바로 탈락 후보가 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '카드는 서랍에 있고 교환도 둘만 아니, 남의 손패는 말로만 알 수 있어요. **우월 전략은 없지만**, 한 명이 모으고 다른 한 명이 나머지 자원을 하나씩 쥐어 막아 주는 두 사람 연합처럼, 막기와 모으기를 나눠 맡는 협력이 강해요.' },
  ],
  similar: [
    { name: '핏 (Pit)', players: '3–8명', alike: '같은 장수의 카드를 맞바꿔 한 상품을 모두 모으면 이겨요. 독점 게임의 바탕이 된 게임이에요.', differs: '핏은 모두가 동시에 외치며 거래하고, 같은 종류의 카드만 묶어 내야 해요. 폭탄 대신 와일드카드와 벌칙 카드가 있어요.' },
    { name: '보난자 (Bohnanza)', players: '3–5명', alike: '같은 종류의 카드를 모으려고 서로 협상하며 맞바꿔요.', differs: '보난자는 콩을 밭에 심어 팔아 점수를 내고, 한 종류를 독점할 필요가 없어요.' },
  ],
}, {
  meta: {
    title: 'Monopoly Game rules — The Genius: Rule Breaker, round 6 main match',
    description: 'The rules of the Monopoly Game (독점 게임) from The Genius: Rule Breaker: 64 cards of eight resources and bombs, eight-card hands kept in drawers, ID cards, equal swaps between two players, defusing bombs for ten garnets, and the rewards and Death Match rules for a resource or a bomb monopoly.',
    keywords: ['Monopoly Game', 'The Genius Monopoly', 'The Genius Rule Breaker', '독점 게임', '더 지니어스2'],
  },
  title: 'Monopoly Game — The Genius: Rule Breaker, round 6 main match',
  name: 'Monopoly Game (독점 게임)',
  lead: 'Eight players hold eight cards each and swap them. Collect every card of one resource, press the Monopolize button and you win at once — and whoever holds the most bombs becomes the Death Match candidate.',
  summary: 'A trading game that ends the moment someone owns every card of one resource, with bomb cards to dodge or to collect.',
  setup: [
    { type: 'list', items: [
      '**Players**: 8.',
      '**64 cards**: coal, iron and wood 8 each; water, oil, gold, rice and diamond 7 each; 5 bombs.',
      '**Deal**: the shuffled cards are split into piles of eight; each player takes one, looks, and leaves it in a drawer kept by the dealer.',
      '**ID card**: each player’s pass to see their own cards.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Take out cards', body: 'To trade, show the dealer your ID and receive your cards.' },
      { title: 'Swap', body: 'Two players exchange **the same number** of cards, then return their cards and get their IDs back.' },
      { title: 'Defuse', body: 'Pay ten garnets to defuse a bomb; it leaves the game and nobody else is told.' },
      { title: 'Monopolize', body: 'Holding every card of one kind, press the button; a successful monopoly ends the game.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The player who monopolizes is **the sole winner**.',
      '**A resource monopoly** earns two Tokens of Life, five garnets and a clue; the player with the most bombs is the Death Match candidate.',
      '**A bomb monopoly (all five)** earns two Tokens of Life, ten garnets and a clue; the player with the most different resources is the candidate.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If several tie for most bombs after a resource monopoly, the winner chooses the candidate (English Wikipedia).',
      'Swaps are between two players for equal numbers of cards, so every hand stays at eight unless a bomb is defused.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The key constraint is that **a hand is always eight cards**: swaps are equal, so monopolizing means filling your hand with that resource.' },
    { type: 'cards', items: [
      { title: 'Eight-card and seven-card resources', body: 'Coal, iron and wood have eight cards, so owning one means your whole hand is that resource; seven-card resources leave one free slot. Defusing a bomb drops you to seven cards and rules out the eight-card resources: it avoids last place but closes a road to victory.' },
      { title: 'One card blocks', body: 'A monopoly needs every card, so holding a single one blocks it. Once you know who collects what, the last card of their resource becomes the most valuable card in the game. Holding one each of many resources, though, risks being "most resource types" if someone completes the bombs.' },
      { title: 'Two faces of the bomb', body: 'Bombs are the penalty when someone monopolizes a resource, but five bombs is also the fastest monopoly — and others are happy to hand them over. Start collecting them and anyone else’s resource monopoly makes you the candidate at once.' },
    ], columns: 1 },
    { type: 'p', text: 'Cards sit in drawers and only the two traders see a swap, so hands are known only by what people say. **There is no dominant strategy**, but splitting roles — one collects, a partner holds one of each other resource to block — makes a strong two-person alliance.' },
  ],
  similar: [
    { name: 'Pit', players: '3–8', alike: 'Swap equal numbers of cards to corner a commodity; the game this one is based on.', differs: 'Everyone trades at once, shouting, with matching cards only, and Pit has a wild card and a penalty card instead of bombs.' },
    { name: 'Bohnanza', players: '3–5', alike: 'Negotiated trades to collect sets of one kind.', differs: 'Beans are planted and sold for points; no monopoly is needed.' },
  ],
});

export const godsJudgment = g2Game({ slug: 'gods-judgment', kind: 'main', rounds: [7], related: ['russianRoulette', 'hitStay', 'piggyBank'], check: 'two' }, {
  meta: {
    title: '신의 판결 규칙 — 더 지니어스 시즌2 룰 브레이커 7회전 메인 매치, 주사위 합 예측하기',
    description: '더 지니어스: 룰 브레이커 7회전 메인 매치 신의 판결의 규칙을 정리했어요. 기본 주사위와 홀수·짝수 주사위, 1–24 중 두 숫자 고르기, 열 번 던지기, 가넷 5개 보증금의 특수 주사위 두 종류, 주사위 양도·교환, 단독·공동 우승 보상, 확률 계산까지.',
    keywords: ['신의 판결', '신의판결', '더 지니어스 신의 판결', '룰 브레이커 주사위', '더 지니어스2'],
  },
  title: '신의 판결 — 더 지니어스: 룰 브레이커 7회전 메인 매치',
  name: '신의 판결',
  lead: '주사위 두 개를 열 번 던지기 전에 숫자 두 개를 골라요. 합이 고른 숫자와 같을 때마다 1점. 어떤 주사위를 들고 던지느냐가 확률을 정해요.',
  summary: '고른 숫자가 주사위 합으로 몇 번 나오는지 겨루는 확률 게임. 주사위를 사고 바꾸며 확률을 높여요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 7명.',
      '**주사위 주머니**: 주사위가 2개씩 든 주머니 중 하나를 골라요. 1–6 기본 주사위 1개와, 홀수 주사위나 짝수 주사위 중 1개가 무작위로 들어 있어요.',
      '**숫자 고르기**: 시작 전에 1–24 중 두 숫자에 자기 마커를 올려요.',
      '**특수 주사위**: 3·4·5가 두 면씩인 주사위와 4·5·6이 두 면씩인 주사위, 두 종류예요. 1개당 가넷 5개를 보증금으로 맡기고, 주머니에서 무작위로 뽑아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '준비', body: '주사위는 서로 양도하거나 바꿀 수 있고, 연습으로 던져 볼 수도 있어요.' },
      { title: '던지기', body: '가넷이 많은 순서대로, 자기 차례에 고른 주사위 2개를 10번 연속 던져요.' },
      { title: '득점', body: '두 주사위 눈의 합이 고른 숫자 중 하나와 같으면 1점이에요.' },
      { title: '수거', body: '던지기를 시작하면 고른 2개는 바꿀 수 없고, 다 던진 주사위는 딜러가 거둬 가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '모두 던진 뒤 **승점이 가장 높은 사람이 우승**, 가장 낮은 사람이 탈락 후보예요.',
      '공동 우승이면 모두 생명의 징표를 받아요. 단독 우승이면 생명의 징표 2개와 가넷, 불멸의 징표 단서를 받아요.',
      '특수 주사위 보증금은 **우승자만** 돌려받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '단독 우승자의 가넷은 정리마다 달라요. 나무위키는 "자기 승점만큼", 영어 위키백과는 "가넷 10개"로 적고 있어요.',
      '방송에서는 주사위가 위아래 두 조각으로 나뉘어, 다른 주사위의 조각과 합쳐 새 눈 구성을 만들 수 있다는 점이 드러났어요. 규칙에 적혀 있지 않은 이 "숨은 해법"은 나무위키에만 자세히 정리돼 있어요.',
      '같은 숫자를 두 번 고른다고 점수가 두 배가 되지는 않는다고 정리돼 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '신의 판결은 **주사위 두 개의 합 분포**를 얼마나 좁히느냐의 게임이에요. 나올 수 있는 합이 적을수록 고른 두 숫자가 나올 확률이 커져요.' },
    { type: 'cards', items: [
      { title: '기본 주사위 둘', body: '1–6 주사위 두 개면 합은 2–12의 11가지이고, 가장 흔한 7은 6/36, 6과 8은 5/36이에요. 7과 이웃 숫자를 고르면 11/36, 약 31%예요. 그래서 처음 받은 기본·홀짝 조합보다, 다른 사람과 주사위를 바꿔 같은 종류 두 개를 맞추는 것만으로도 확률이 크게 올라요.' },
      { title: '특수 주사위 둘', body: '3·4·5 주사위 두 개면 합은 6–10의 다섯 가지뿐이고, 가운데 8이 12/36, 7과 9가 8/36이에요. 8과 이웃 숫자를 고르면 20/36, 약 56%예요. 3·4·5와 4·5·6을 섞어도 분포 모양은 같아요. 열 번 던지면 기대 점수가 5.5점 정도로, 기본 주사위의 약 3점보다 훨씬 높아요.' },
      { title: '보증금이 만드는 협상', body: '특수 주사위 보증금은 우승자만 돌려받아요. 공동 우승이면 모두 돌려받으니, 모두가 같은 확률을 갖추고 공동 우승을 노리면 가넷 손해가 없어요. 하지만 단독 우승의 보상이 커서, 누군가 몰래 확률을 더 높이면 협력이 깨져요.' },
    ], columns: 1 },
    { type: 'p', text: '규칙에 적힌 도구만 쓰면 결국 **특수 주사위 두 개가 가장 좋은 선택**이고, 남는 것은 운이에요. 방송에서는 주사위를 분해해 합이 하나뿐인 조합을 만드는 방법이 드러났고, 그렇게 하면 확률이 100%가 돼요. 이름 그대로 "규칙 밖의 해법"이 우월 전략인 게임이었어요.' },
  ],
  similar: [
    { name: '캔트 스톱 (Can’t Stop)', players: '2–4명', alike: '주사위 합의 확률을 계산해 어떤 숫자에 걸지 정하는 게임이에요.', differs: '캔트 스톱은 주사위 4개를 둘씩 나눠 쓰고, 언제 멈출지 정하는 위험 관리가 핵심이에요.' },
    { name: '카탄 (CATAN)', players: '3–4명', alike: '두 주사위의 합이 6·8 같은 가운데 숫자일 때 자주 나온다는 확률 감각이 중요해요.', differs: '카탄은 자원을 모아 건설하는 게임이고, 주사위를 바꾸거나 살 수 없어요.' },
  ],
}, {
  meta: {
    title: "God's Judgment rules — The Genius: Rule Breaker, round 7 main match",
    description: "The rules of God's Judgment (신의 판결) from The Genius: Rule Breaker: a standard die plus an odd or even die, two numbers chosen from 1 to 24, ten rolls, two kinds of special dice for a five-garnet deposit, trading dice, rewards for sole and joint winners, and the probabilities.",
    keywords: ["God's Judgment", 'The Genius dice game', 'The Genius Rule Breaker', '신의 판결', '더 지니어스2'],
  },
  title: "God's Judgment — The Genius: Rule Breaker, round 7 main match",
  name: "God's Judgment (신의 판결)",
  lead: 'Before rolling two dice ten times, pick two numbers. Each time the total matches one, you score — and which dice you hold sets your odds.',
  summary: 'A probability game of how often your chosen totals come up, improved by buying and trading dice.',
  setup: [
    { type: 'list', items: [
      '**Players**: 7.',
      '**Dice pouches**: each player takes a pouch with two dice: a standard 1–6 die and, at random, an odd or an even die.',
      '**Numbers**: before play, each player marks two numbers from 1 to 24.',
      '**Special dice**: two kinds — 3, 4, 5 on two faces each, and 4, 5, 6 on two faces each — for a deposit of five garnets apiece, drawn at random from a pouch.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Prepare', body: 'Dice may be given away or traded, and practice rolls are allowed.' },
      { title: 'Roll', body: 'In garnet order, each player rolls their two chosen dice ten times in a row.' },
      { title: 'Score', body: 'A total equal to one of your numbers scores a point.' },
      { title: 'Collect', body: 'Once rolling starts the two dice are fixed, and the dealer collects them afterwards.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After everyone rolls, **the highest score wins** and the lowest is the Death Match candidate.',
      'Joint winners each get a Token of Life; a sole winner gets two Tokens, garnets and a clue.',
      'Only **winners** get their special-dice deposits back.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The sole winner’s garnets differ between sources: "as many as their points" in the fan wiki, ten in English Wikipedia.',
      'On air it emerged that the dice split into top and bottom halves that can be recombined into new faces; this unwritten trick is described in detail only in the fan wiki.',
      'Marking the same number twice does not double the score, per the fan wiki.',
    ] },
  ],
  analysis: [
    { type: 'p', text: "God's Judgment is about **narrowing the distribution of two dice**: the fewer possible totals, the likelier your two numbers." },
    { type: 'cards', items: [
      { title: 'Two standard dice', body: 'Two 1–6 dice give eleven totals from 2 to 12; 7 comes up 6/36 and 6 or 8 5/36, so 7 and a neighbour give 11/36, about 31%. Simply trading so that you hold two dice of the same kind beats the mixed pair you start with.' },
      { title: 'Two special dice', body: 'Two 3-4-5 dice give only five totals, 6 to 10: 8 comes up 12/36 and 7 or 9 8/36, so 8 and a neighbour give 20/36, about 56%. Mixing 3-4-5 with 4-5-6 gives the same shape. Over ten rolls that is about 5.5 points against about 3.' },
      { title: 'Deposits drive deals', body: 'Only winners get deposits back, and joint winners all do, so if everyone equips the same odds and aims for a tie nobody loses garnets. The big sole-winner prize means anyone quietly improving their odds breaks the deal.' },
    ], columns: 1 },
    { type: 'p', text: 'Within the written rules **two special dice are the best you can do**, and the rest is luck. On air, taking dice apart to build a pair with a single possible total turned out to make scoring certain — a true "rule breaker" solution as the dominant strategy.' },
  ],
  similar: [
    { name: "Can't Stop", players: '2–4', alike: 'Judging which dice totals are likely and betting on them.', differs: 'Four dice are paired each turn and push-your-luck is the core.' },
    { name: 'CATAN', players: '3–4', alike: 'A feel for two-dice totals — 6 and 8 come often — matters.', differs: 'It is about gathering resources and building; dice cannot be traded or bought.' },
  ],
});

export const indianHoldem = g2Game({ slug: 'indian-holdem', kind: 'death', rounds: [7, 10, 12], related: ['indianPoker', 'twoSidedPoker', 'hitStay'], check: 'two' }, {
  meta: {
    title: '인디언 홀덤 규칙 — 더 지니어스 시즌2 룰 브레이커 7·10회전 데스매치·결승 1경기, 공유 카드가 있는 인디언 포커',
    description: '더 지니어스: 룰 브레이커 7·10회전 데스매치와 결승 첫 경기 인디언 홀덤의 규칙을 정리했어요. 1–10 카드 40장, 공유 카드 2장, 이마에 붙이는 내 카드, 트리플·스트레이트·더블·하이카드, 콜·레이즈·포기와 10칩 페널티, 가넷을 칩으로 바꾸는 비율, 결승의 칩 20개와 아이템까지.',
    keywords: ['인디언 홀덤', '인디언홀덤', '더 지니어스 인디언 홀덤', '룰 브레이커 데스매치', '인디언 포커', '더 지니어스 결승'],
  },
  title: '인디언 홀덤 — 더 지니어스: 룰 브레이커 7·10회전 데스매치 · 결승 1경기',
  name: '인디언 홀덤',
  lead: '내 카드는 이마에 붙어 있어 나만 못 봐요. 상대 카드와 바닥의 공유 카드 2장을 보고, 내 카드가 무엇일지 짐작해 칩을 걸어요.',
  summary: '시즌1의 인디언 포커에 공유 카드 2장을 더한 1:1 베팅 게임. 데스매치로 두 번, 결승 첫 경기로 한 번 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 2명.',
      '**카드**: 1–10 숫자 카드 4벌, 40장. 다 쓰면 새 카드를 열어요.',
      '**배분**: 공유 카드 2장을 앞면으로 펼치고, 각자 카드 1장을 받아 보지 않은 채 이마에 붙여요.',
      '**칩**: 데스매치에서는 가넷을 칩으로 바꿔 써요. 7회전은 가넷 1개당 칩 5개, 10회전은 가넷 1개당 칩 2개였어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '기본 베팅', body: '두 사람이 칩 1개씩 낸 뒤, 선 플레이어부터 베팅해요. 베팅 수에는 제한이 없어요.' },
      { title: '족보', body: '공유 카드와 아무 조합이 없으면 숫자가 높은 쪽이 이겨요. 내 카드가 공유 카드 하나와 같으면 **더블**, 셋이 연속이면 **스트레이트**(1과 10도 이어져요), 셋이 같으면 **트리플**이에요. 트리플 > 스트레이트 > 더블 > 조합 없음 순으로 강해요.' },
      { title: '베팅 선택', body: '상대와 같은 수를 걸면(콜) 베팅이 끝나고 카드를 공개해요. 더 많이 걸면(레이즈) 베팅이 이어져요. 포기하면 상대가 걸린 칩을 모두 가져가요.' },
      { title: '판정', body: '같은 족보면 내 카드 숫자가 높은 쪽이 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 사람이 **칩을 모두 잃으면** 끝나요. 데스매치에서는 칩을 잃은 사람이 탈락해요.',
      '남은 칩은 끝난 뒤 다시 가넷으로 바꿀 수 있어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**스트레이트나 트리플을 가진 채 포기하면** 페널티로 칩 10개를 상대에게 줘야 해요.',
      '숫자가 같아 비기면 걸린 칩은 다음 판으로 넘어가고, 다음 판은 기본 베팅 없이 해요.',
      '**결승 1경기**에서는 두 사람 모두 칩 20개로 시작하고, 더블을 가진 채 포기해도 페널티 5개를 줘요. 비긴 판의 칩은 다음 판 승자가 가져가요. 아이템으로 칩 5개 추가(2개 존재)와, 베팅 전 공유 카드 교체가 있었어요.',
      '같은 게임이 7회전과 10회전 데스매치, 결승 1경기에 쓰였어요. 10회전은 가넷-칩 교환 비율만 달랐어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '인디언 홀덤의 정보 구조는 비대칭이에요. **상대의 족보는 정확히 알고, 내 족보는 확률로만 알아요.** 상대도 마찬가지라, 서로 상대의 베팅에서 "내 이마의 카드"를 읽으려 해요.' },
    { type: 'cards', items: [
      { title: '카드 세기', body: '40장은 숫자마다 4장씩이라, 지금까지 나온 카드를 세면 내 카드가 각 숫자일 확률을 꽤 정확히 알 수 있어요. 상대가 더블이라면 내가 이길 수 있는 경우(트리플, 스트레이트, 더 높은 더블)가 남은 카드 중 몇 장인지 세는 것이 판단의 기본이에요.' },
      { title: '페널티가 걸리는 바닥', body: '포기 페널티는 스트레이트나 트리플일 때만 생겨요. 공유 카드 두 장이 같거나, 차이가 1·2(또는 1과 10처럼 이어지는 경우)일 때만 내가 그런 족보일 수 있어요. 공유 카드 차이가 3–7이면 스트레이트도 트리플도 불가능하니, 마음 편히 포기할 수 있어요.' },
      { title: '칩 비율이 판을 바꾼다', body: '데스매치의 칩은 가넷에서 나오니, 가넷이 많은 사람이 더 많은 칩으로 시작해요. 10회전처럼 비율이 낮으면 칩 수 차이가 덜 벌어지지만, 그래도 칩이 적은 쪽은 큰 베팅을 버티기 어려워요.' },
    ], columns: 1 },
    { type: 'p', text: '운이 크게 작용하지만, 카드 세기와 상대 베팅 읽기로 기대값을 꾸준히 쌓을 수 있어 **장기적으로는 실력이 이기는 게임**이에요. 항상 통하는 우월 전략은 없어요.' },
  ],
  similar: [
    { name: '블라인드 맨스 블러프 (인디언 포커)', players: '2명 이상', alike: '자기 카드를 이마에 대고 남의 카드만 보며 베팅하는 방식이 같아요. PUZZLTHINK의 인디언 포커가 이 방식이에요.', differs: '공유 카드가 없어서 숫자 크기로만 승부가 나요.' },
    { name: '텍사스 홀덤 (Texas Hold’em)', players: '2–10명', alike: '공유 카드와 내 카드를 합쳐 족보를 만들고, 콜·레이즈·폴드로 베팅해요.', differs: '내 카드는 내가 보고, 공유 카드가 5장이며 족보가 훨씬 다양해요.' },
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '내 카드는 못 보고 남의 카드만 보는 정보 구조예요.', differs: '하나비는 모두가 힘을 합치는 협력 게임이에요.' },
  ],
}, {
  meta: {
    title: "Indian Hold'em rules — The Genius: Rule Breaker, rounds 7 and 10 Death Match and final game 1",
    description: "The rules of Indian Hold'em (인디언 홀덤) from The Genius: Rule Breaker: 40 cards 1–10, two community cards, your own card on your forehead, triple, straight, double and high card, call, raise and fold with the 10-chip penalty, garnet-to-chip rates, and the final's 20 chips and advantages.",
    keywords: ["Indian Hold'em", 'Indian Holdem', 'The Genius Indian Holdem', 'Indian Poker', '인디언 홀덤'],
  },
  title: "Indian Hold'em — The Genius: Rule Breaker, rounds 7 and 10 Death Match, final game 1",
  name: "Indian Hold'em (인디언 홀덤)",
  lead: 'Your card is on your forehead, so only you cannot see it. From the opponent’s card and two community cards, judge what yours might be and bet.',
  summary: 'Season 1’s Indian Poker with two community cards added; twice a Death Match and once the final’s first game.',
  setup: [
    { type: 'list', items: [
      '**Players**: 2.',
      '**Cards**: four sets of 1–10, 40 cards; a fresh deck is opened when it runs out.',
      '**Deal**: two community cards face up; each player gets one card and puts it on their forehead unseen.',
      '**Chips**: in the Death Matches garnets were changed into chips — five per garnet in round 7, two per garnet in round 10.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Ante', body: 'Both put in one chip, then betting starts with the first player, with no limit.' },
      { title: 'Hands', body: 'With no combination the higher card wins. Your card matching one community card is a **double**, three in a row a **straight** (1 and 10 connect), three the same a **triple**: triple > straight > double > nothing.' },
      { title: 'Options', body: 'Match the bet (call) to end betting and reveal; bet more (raise) to continue; or fold and give the opponent the pot.' },
      { title: 'Ties', body: 'With the same hand, the higher own card wins.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'It ends when **one player has no chips left**; in a Death Match that player is eliminated.',
      'Remaining chips can be changed back into garnets afterwards.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Folding with a straight or a triple** costs a ten-chip penalty to the opponent.',
      'If the cards are equal the pot carries over to the next hand, which has no ante.',
      '**In final game 1** both started with 20 chips, folding with a double cost five, and a tied pot went to the next hand’s winner. Advantages offered five extra chips (two existed) and swapping the community cards before betting.',
      'The same game served as the round 7 and round 10 Death Matches and the final’s first game; round 10 changed only the chip rate.',
    ] },
  ],
  analysis: [
    { type: 'p', text: "Indian Hold'em is asymmetric: **you know the opponent’s hand exactly and your own only as odds.** They are in the same position, so each tries to read their own forehead from the other’s bets." },
    { type: 'cards', items: [
      { title: 'Count the cards', body: 'With four of each number in 40 cards, counting what has gone tells you fairly precisely how likely each value of your own card is. Against a double, count how many remaining cards beat it — triples, straights, higher doubles.' },
      { title: 'Boards that carry a penalty', body: 'The fold penalty applies only to straights and triples, which are possible only if the community cards are equal or one or two apart (including 1–10 wraps). If they are three to seven apart, neither is possible and folding is free.' },
      { title: 'The chip rate matters', body: 'Death Match chips come from garnets, so the richer player starts deeper. A lower rate, as in round 10, narrows the gap, but the shorter stack still struggles to withstand big bets.' },
    ], columns: 1 },
    { type: 'p', text: 'Luck is large, yet counting and reading bets steadily build expected value, so **skill wins over time**. Nothing wins every hand.' },
  ],
  similar: [
    { name: "Blind Man's Bluff (Indian Poker)", players: '2+', alike: 'Hold your card to your forehead and bet seeing only others’ cards; PUZZLTHINK’s Indian Poker plays this way.', differs: 'No community cards — only the numbers decide.' },
    { name: "Texas Hold'em", players: '2–10', alike: 'Combine community cards with your own and bet by call, raise and fold.', differs: 'You see your cards, there are five community cards and many more hands.' },
    { name: 'Hanabi', players: '2–5', alike: 'You cannot see your own cards, only everyone else’s.', differs: 'A fully cooperative game.' },
  ],
});
