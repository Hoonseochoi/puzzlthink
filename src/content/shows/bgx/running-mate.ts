import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'running-mate',
  kind: 'money',
  when: { ko: '1–2일차', en: 'Days 1–2' },
  related: ['hitStay', 'indianPoker', 'blackWhite'],
  updated: '2026-11-26',
  sources: [namuDay('1-2'), broadcast],
  ko: {
    meta: {
      title: '러닝 메이트 규칙 — 피의 게임X 첫 머니 챌린지, 승수 베팅 트릭테이킹',
      description: '피의 게임X 첫 머니 챌린지 러닝 메이트의 규칙을 정리했어요. 4색 1–16 카드와 독재자·암살자, 마스터 베팅과 0승 선언, 카드 교환, 숫자로 메이트 지명, 리드 컬러를 따르는 카드 대결, 승점 정산과 아이템까지.',
      keywords: ['러닝 메이트', '피의 게임X 러닝 메이트', '피의게임X 머니 챌린지', '트릭테이킹 게임', '피의게임X'],
    },
    title: '러닝 메이트 — 피의 게임X 첫 머니 챌린지',
    name: '러닝 메이트',
    lead: '이번 판 몇 번 이길지 가장 높게 부른 사람이 "마스터"가 되고, 숨은 짝 "메이트"와 함께 그 약속을 지켜야 해요.',
    summary: '승수를 경매로 부른 마스터가 숨은 메이트와 함께 트릭을 따내는 4인 트릭테이킹. 팀마다 한 명씩 대표로 나와요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 첫날 저택에 들어간 네 팀. 라운드마다 팀별로 한 명이 대진표 순서대로 대표로 나와 4명이 한 테이블에서 겨뤄요.',
        '**덱 66장 (팀마다 같은 구성)**: 빨강·노랑·초록·파랑 1–16 숫자 카드 64장, 특수 카드 **독재자** 1장, **암살자** 1장.',
        '**라운드**: 8라운드. 대표는 카드 8장을 들고 나와요. 1·5라운드 전에 자리를 추첨하고, 선 플레이어는 라운드마다 돌아가요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '마스터 베팅', body: '선부터 "마스터 컬러"와 이번 라운드에 거둘 승리 횟수를 불러요. 다음 사람은 더 많은 승수를 부르거나(색은 바꿔도 돼요) 포기해요. **0승 예측은 가장 큰 승수로** 쳐요. 한 명만 남거나 누군가 0승을 부르면 그 사람이 마스터예요.' },
        { title: '카드 교환', body: '나머지 세 명이 마스터에게 카드를 한 장씩 주고, 마스터는 그것을 본 뒤 자기 카드 3장을 한 장씩 돌려줘요.' },
        { title: '메이트 지명', body: '마스터가 1–16 중 숫자 하나를 불러요. 카드 대결 중 **그 숫자 카드를 가장 먼저 낸 사람**이 메이트가 돼요. 지명을 생략할 수도 있어요.' },
        { title: '카드 대결 (최대 8세트)', body: '첫 세트는 마스터가 먼저 내고, 그 뒤로는 직전 세트 승자가 먼저 내요. 먼저 낸 카드의 색이 **리드 컬러**이고, 나머지는 그 색이 있으면 반드시 그 색을 내야 해요. 없을 때만 다른 색을 낼 수 있어요. 독재자·암살자는 언제든 낼 수 있어요.' },
        { title: '세트 승자', body: '독재자가 나오면 독재자가 이기고, 독재자와 암살자가 함께 나오면 암살자가 이겨요. 특수 카드가 없으면 마스터 컬러 중 가장 높은 숫자, 그것도 없으면 리드 컬러 중 가장 높은 숫자가 이겨요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '라운드 승점 = 마스터가 부른 승수(0승이면 10점) + 라운드별 추가 점수(1–2R 0, 3–4R 1, 5–6R 2, 7–8R 3).',
        '**마스터가 예측을 지키면** 마스터와 메이트가 승점을 반씩 나눠요(메이트가 없으면 마스터 혼자).',
        '**마스터가 실패하면** 마스터와 메이트를 뺀 나머지가 승점을 나눠요. 0승 예측에 실패했다면 다른 사람이 얻은 만큼 마스터와 메이트의 승점이 깎여요.',
        '8라운드 뒤 누적 승점 1위 팀이 팀 자금 5,000만 원과 팀원 전원의 탈락 면제권을 받아요. 나머지 팀에서는 모두 탈락 후보가 나와요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '선 플레이어가 특수 카드로 시작하면 그 세트에는 리드 컬러가 없어요.',
        '승리 조건을 만족한 카드가 여러 장이면 먼저 낸 카드가 이겨요.',
        '마스터가 더 이상 예측을 지킬 수 없게 되면 남은 세트 없이 라운드가 바로 끝나요.',
        '아이템(팀 자금으로 구입): **역방향권**은 그 라운드의 카드 내는 순서를 반시계로 바꾸고, **손패 추가권**은 들고 나올 카드를 한 장 늘려 줘요. 카드와 아이템은 주고받거나 버릴 수 없어요.',
        '승점을 나눌 때 소수점 아래는 버려요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '러닝 메이트는 **트릭테이킹 카드 게임에 "숨은 파트너"를 얹은** 구조예요. 브리지나 스페이드처럼 승수를 미리 약속하지만, 파트너가 처음부터 정해지지 않고 카드 한 장으로 드러나요.' },
      { type: 'cards', items: [
        { title: '마스터 컬러는 트럼프예요', body: '마스터 컬러 카드는 어떤 리드 컬러보다 강해요. 마스터 컬러를 많이 가진 사람이 마스터가 되기 쉬운 이유예요. 단, 리드 컬러를 반드시 따라야 하므로, 다른 색이 바닥났을 때만 마스터 컬러를 끼워 넣어 이길 수 있어요. 손에 없는 색이 많을수록 트럼프를 쓸 기회가 많아요.' },
        { title: '메이트 숫자를 고르는 기술', body: '마스터는 교환으로 다른 사람의 카드를 한 장씩 봤기 때문에, 누가 어떤 숫자를 가졌을지 조금은 알아요. 부르는 숫자는 "믿을 만한 사람이 들고 있을 것 같은 숫자"여야 해요. 그런데 같은 숫자는 네 색에 한 장씩 있어서, 원치 않는 사람이 먼저 내 메이트가 될 수도 있어요.' },
        { title: '메이트가 되는 것은 선택이에요', body: '지명된 숫자를 가진 사람은 그 카드를 언제 낼지로 메이트가 될지 말지를 어느 정도 고를 수 있어요. 마스터가 성공할 것 같으면 빨리 내서 승점의 절반을 노리고, 실패할 것 같으면 늦추거나 다른 사람이 먼저 내게 두는 편이 이득이에요. 실패하면 나머지 사람들이 승점을 나누니까요.' },
        { title: '0승 예측은 고위험 고수익', body: '0승은 가장 큰 승수로 취급돼 바로 마스터가 되고, 성공하면 기본 10점이에요. 하지만 한 세트라도 이기면 실패하고, 실패하면 다른 사람이 얻은 만큼 깎여요. 약한 패를 들었을 때의 무기이지만, 다른 세 명이 일부러 이기지 않으려고 하면 피하기 어려워요.' },
        { title: '팀 게임의 개인 대표', body: '각 라운드는 개인 대결이지만 승점은 팀에 쌓여요. 그래서 다른 팀끼리 일시적으로 손을 잡고 앞서가는 팀의 마스터를 실패시키는 연합이 자연스럽게 생겨요. 뒤 라운드일수록 추가 점수가 커서, 후반 대표의 무게가 더 커요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '브리지 (Contract Bridge)', players: '4명', alike: '트럼프와 승수를 경매로 정하고, 약속한 트릭 수를 채우면 점수를 얻는 트릭테이킹의 대표 게임이에요.', differs: '브리지는 파트너가 처음부터 고정돼 있고, 두 팀이 맞서요.' },
      { name: '셰프코프 (Schafkopf)', players: '3–5명', alike: '셰프코프는 경매로 가장 높게 부른 사람이 특정 카드를 지명하고, 그 카드를 가진 사람이 숨은 파트너가 돼요. 러닝 메이트의 메이트 지명과 가장 닮았어요.', differs: '셰프코프는 카드 점수의 합으로 승부하고, 트럼프 구성이 고정돼 있어요.' },
      { name: '위저드 (Wizard)', players: '3–6명', alike: '라운드마다 이길 트릭 수를 예측하고 정확히 맞혀야 점수를 받아요. 모든 색을 이기는 특수 카드가 있어요.', differs: '위저드는 모두가 각자 예측하고, 마스터나 파트너가 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 5라운드 전에 공개된 히든 아이템은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Running Mate rules — The Bloody Game X, first money challenge (a trick-taking game with a hidden partner)',
      description: 'The rules of Running Mate from The Bloody Game X (피의 게임X): four colours of 1–16 plus the Dictator and Assassin, bidding for master, the zero bid, card exchange, naming a number for the mate, following the lead colour, scoring and items.',
      keywords: ['Running Mate', 'Bloody Game X Running Mate', 'trick-taking game', '피의 게임X'],
    },
    title: 'Running Mate — The Bloody Game X, first money challenge',
    name: 'Running Mate',
    lead: 'Bid the most tricks and you are the "master" — and must keep that promise with a hidden partner, the "mate".',
    summary: 'A four-player trick-taking game: the master bids tricks and wins them with a hidden mate; each team sends one player per round.',
    setup: [
      { type: 'list', items: [
        '**Players**: the four teams inside the mansion on day 1; each round every team sends one representative, so four play at a table.',
        '**66 cards per team (identical)**: 1–16 in red, yellow, green and blue (64), plus the **Dictator** and the **Assassin**.',
        '**Rounds**: eight; each representative brings eight cards. Seats are redrawn before rounds 1 and 5, and the first player rotates.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Master bid', body: 'From the first player, bid a "master colour" and a number of tricks; each next player bids more (colour may change) or passes. **A zero bid counts as the highest.** The last bidder standing, or anyone bidding zero, is master.' },
        { title: 'Exchange', body: 'The other three each give the master a card; the master looks, then gives one of their own back to each.' },
        { title: 'Naming the mate', body: 'The master names a number 1–16. **Whoever first plays a card of that number** becomes the mate. The master may skip this.' },
        { title: 'Tricks (up to eight)', body: 'The master leads the first; afterwards each trick’s winner leads. The lead card’s colour must be followed if possible; only otherwise may you play another colour. The Dictator and Assassin may be played any time.' },
        { title: 'Who wins a trick', body: 'The Dictator wins — unless the Assassin is also played, which beats it. Otherwise the highest master-colour card, then the highest lead-colour card.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Round points = the master’s bid (10 for a zero bid) + a round bonus (0 in rounds 1–2, 1 in 3–4, 2 in 5–6, 3 in 7–8).',
        '**If the master makes the bid**, master and mate split the points (the master keeps all without a mate).',
        '**If the master fails**, everyone else splits them; a failed zero bid also costs master and mate what the others gained.',
        'After eight rounds the top team wins ₩50 million in team funds and immunity for all its members; every other team puts up a player for elimination.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A trick led with a special card has no lead colour.',
        'If several cards meet the winning condition, the one played first wins.',
        'The round ends at once when the master can no longer make the bid.',
        'Items, bought with team funds: **Reverse** turns play order anticlockwise for a round; **Extra card** lets a representative bring one more card. Cards and items cannot be traded or discarded.',
        'Fractions are dropped when points are split.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Running Mate is **trick-taking with a hidden partner**. Like bridge or spades you promise a number of tricks, but your partner is revealed by a single card instead of being fixed.' },
      { type: 'cards', items: [
        { title: 'The master colour is trumps', body: 'Master-colour cards beat any lead colour, so whoever holds many tends to become master. Since you must follow the lead, trumps only come in once you are out of a colour — the more colours you lack, the more chances to trump.' },
        { title: 'Choosing the mate’s number', body: 'The exchange showed the master one card from each player, a hint at who holds what. The number named should be one a trusted player probably holds — but each number exists in four colours, so the wrong player may reach it first.' },
        { title: 'Being the mate is a choice', body: 'The holder of the named number can partly choose by timing that card: play it early if the master looks likely to succeed, delay if not, since a failure pays everyone else.' },
        { title: 'The zero bid', body: 'Zero counts as the top bid and pays a base 10, but winning a single trick fails it, and failure costs what the others gain. It is a weapon for weak hands, yet hard to pull off if the other three refuse to win tricks.' },
        { title: 'Individuals playing for teams', body: 'Each round is individual but points go to teams, so trailing teams naturally ally to sink the leading team’s master. Bonuses grow in later rounds, making late representatives matter most.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Contract Bridge', players: '4', alike: 'Trumps and a trick target are set by auction and you score by making it.', differs: 'Partners are fixed from the start, two against two.' },
      { name: 'Sheepshead (Schafkopf)', players: '3–5', alike: 'The high bidder calls a card and its holder becomes a hidden partner — the closest relative of the mate rule.', differs: 'Scoring counts card points, and the trump suit is fixed.' },
      { name: 'Wizard', players: '3–6', alike: 'Predict your exact tricks each round; special cards beat every suit.', differs: 'Everyone bids for themselves; there is no master or partner.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The hidden item revealed before round 5 is not described.',
  },
};

export default game;
