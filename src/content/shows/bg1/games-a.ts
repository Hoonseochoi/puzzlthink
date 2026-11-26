// 피의 게임 (season 1), days 2–7: 분배 게임, 수식 게임, 지뢰 게임, 부자 게임, 배틀 가위바위보.
import { bg1Game } from './shared';

export const distribution = bg1Game('distribution-game', 'money', '2', ['russianRoulette', 'indianPoker', 'hiddenWord'], {
  meta: {
    title: '분배 게임 규칙 — 피의 게임 시즌1 2일차 머니 챌린지, 숨은 킹과 퀸 찾기',
    description: '피의 게임 시즌1 2일차 머니 챌린지 분배 게임의 규칙을 정리했어요. 숨겨진 쪽지로 정해지는 킹과 퀸, 두 사람이 정하는 분배 순서, 상금 2,000만 원과 면제권 가져가기, 7–9번의 예/아니오 질문, 추가 질문권, 과반 투표로 킹·퀸 맞히기까지.',
    keywords: ['분배 게임', '피의 게임 분배 게임', '피의 게임 시즌1', '피의게임 킹 퀸', '피의게임1'],
  },
  title: '분배 게임 — 피의 게임 시즌1 2일차 머니 챌린지',
  name: '분배 게임',
  lead: '플레이어 중에 몰래 킹과 퀸이 숨어 있어요. 두 사람이 정한 순서대로 상금을 나눠 가진 뒤, 나머지가 킹과 퀸을 찾아내야 해요.',
  summary: '숨은 킹·퀸이 분배 순서를 정하고, 나머지가 질문과 투표로 정체를 맞히는 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 9명.',
      '**킹과 퀸**: 1일차에 저택 어딘가 숨겨진 쪽지를 찾은 사람이 킹, 킹이 지목한 사람이 퀸이에요.',
      '**보상**: 상금 2,000만 원과 탈락 면제권.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '순서 정하기', body: '킹과 퀸이 합의해 자신들을 포함한 9명 모두의 분배 순서를 정해요.' },
      { title: '분배', body: '순서대로 한 명씩 투표룸에 들어가 탈락 면제권과 상금(100만 원 단위)을 원하는 만큼 가져가요.' },
      { title: '질문', body: '7·8·9번은 이름이 공개되고, 킹·퀸의 정체에 대해 집사에게 예/아니오 질문을 하나씩 비공개로 할 수 있어요. 집사는 반드시 사실만 답해요.' },
      { title: '추가 질문', body: '분배가 끝나면 누구나 1,000만 원에 추가 질문권을 살 수 있어요. 추가 질문과 답은 모두에게 공개돼요.' },
      { title: '투표', body: '논의 뒤 모두 킹과 퀸이 누구인지 투표해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**과반이 킹·퀸을 맞히면** 일반 플레이어 승리: 상금 2,000만 원과, 킹·퀸을 정확히 지목한 사람 수만큼의 탈락 면제권.',
      '**과반이 못 맞히면** 킹·퀸 승리: 상금 2,000만 원과 탈락 면제권 2장.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '앞 순서에서 가져가는 양에는 정해진 한도가 없어서, 앞사람이 많이 가져가면 뒷사람 몫이 없어질 수 있어요.',
      '탈락 면제권은 다른 사람에게 양도할 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '겉으로는 마피아 게임이지만, 규칙을 따져 보면 **숨는 것보다 드러내는 것이 이득**일 수 있는 구조예요.' },
    { type: 'cards', items: [
      { title: '면제권 개수의 빈틈', body: '일반 플레이어가 이기면 "맞힌 사람 수만큼" 면제권이 나와요. 킹과 퀸도 투표에 참여하니, 킹·퀸이 스스로 정체를 밝히고 모두가 정답을 쓰면 면제권이 최대로 쏟아져요. 면제권은 양도도 되니, 킹·퀸과 손잡은 다수 연합이 상금과 면제권을 거의 독차지할 수 있어요.' },
      { title: '분배 순서가 곧 권력', body: '킹·퀸은 순서를 정하고 앞사람은 원하는 만큼 가져가요. 연합 안의 사람을 앞에 두면 연합이 상금을 먼저 가져가요. 정체를 끝까지 숨기려 한다면, 오히려 자신을 눈에 띄지 않는 중간 순서에 두는 것이 안전해요.' },
      { title: '질문의 설계', body: '예/아니오 질문 하나로 9명 중 두 명을 찾아야 해요. "킹은 남자인가요?"처럼 후보를 절반씩 가르는 질문이 정보량이 가장 커요. 7–9번의 질문은 비공개라, 그들이 무엇을 들었다고 말하는지가 또 다른 진실 공방이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '숨는 쪽으로 플레이하면 일반적인 마피아식 추리 게임이지만, 정체 공개를 포함한 다수 연합이 만들어지면 사실상 **필승 구조**가 생겨요. 이 게임의 승부는 추리보다 연합 협상에 있어요.' },
  ],
  similar: [
    { name: '마피아 / 늑대인간 (Werewolf)', players: '6명 이상', alike: '숨은 소수를 다수가 토론과 투표로 찾아내요.', differs: '늑대인간은 밤마다 사람이 탈락하고, 상금을 나누는 단계가 없어요.' },
    { name: '인사이더 (Insider)', players: '4–8명', alike: '숨은 한 사람이 진행을 조종하고, 끝에 투표로 그 사람을 찾아요. 질문에 예/아니오로만 답하는 것도 같아요.', differs: '인사이더는 정답 단어를 맞히는 협력 단계가 먼저 있어요.' },
  ],
}, {
  meta: {
    title: 'Distribution Game rules — The Bloody Game season 1, day 2 money challenge',
    description: 'The rules of the Distribution Game (분배 게임) from The Bloody Game season 1: a hidden King and Queen chosen by a secret note, the order they set for taking prize money and immunity, yes/no questions for players 7–9, paid extra questions, and a majority vote to unmask them.',
    keywords: ['Distribution Game', 'Bloody Game season 1', 'King and Queen game', '피의 게임 분배 게임'],
  },
  title: 'Distribution Game — The Bloody Game season 1, day 2 money challenge',
  name: 'Distribution Game (분배 게임)',
  lead: 'A secret King and Queen hide among the players. After everyone takes a share of the prize in the order the two chose, the rest must unmask them.',
  summary: 'A hidden King and Queen set the share-out order; the others ask questions and vote to find them.',
  setup: [
    { type: 'list', items: [
      '**Players**: nine.',
      '**King and Queen**: whoever found a note hidden in the mansion on day 1 is King, and the King names the Queen.',
      '**Rewards**: ₩20 million and immunity passes.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Order', body: 'The King and Queen agree on the order for all nine, themselves included.' },
      { title: 'Share-out', body: 'One by one, players enter the voting room and take as many immunity passes and as much money (in ₩1 million units) as they like.' },
      { title: 'Questions', body: 'Players 7, 8 and 9 are named publicly and may each ask the butler a private yes/no question about the King and Queen; the butler answers truthfully.' },
      { title: 'Extra questions', body: 'Afterwards anyone may buy extra questions for ₩10 million; these are asked and answered publicly.' },
      { title: 'Vote', body: 'After discussion, everyone votes for who the King and Queen are.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**If a majority names them correctly**, the players win ₩20 million and as many immunity passes as players who named both correctly.',
      '**Otherwise** the King and Queen win ₩20 million and two immunity passes.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'There is no cap on what early players take, so later shares can vanish.',
      'Immunity passes can be given away.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It looks like Mafia, but the rules can make **revealing yourself more profitable than hiding**.' },
    { type: 'cards', items: [
      { title: 'The pass-count loophole', body: 'A player win pays a pass per correct voter, and the King and Queen vote too. If they reveal themselves and everyone votes correctly, the most passes appear, and since passes transfer, a majority alliance with the King and Queen can sweep money and passes.' },
      { title: 'Order is power', body: 'The pair sets the order and early players take what they like, so placing allies first funnels the money. To stay hidden, a quiet middle position is safer for themselves.' },
      { title: 'Designing questions', body: 'One yes/no question must find two of nine; questions that split the field in half carry the most information. Players 7–9 ask privately, so what they claim to have heard becomes its own contest of truth.' },
    ], columns: 1 },
    { type: 'p', text: 'Played as hide-and-seek it is ordinary deduction, but a majority alliance built on revealing creates **a near-certain win**; the real contest is negotiation, not deduction.' },
  ],
  similar: [
    { name: 'Mafia / Werewolf', players: '6+', alike: 'A majority hunts a hidden minority through discussion and votes.', differs: 'Players are eliminated each night and there is no share-out.' },
    { name: 'Insider', players: '4–8', alike: 'A hidden player steers the game and is voted on at the end; questions get yes/no answers.', differs: 'A cooperative word-guessing phase comes first.' },
  ],
});

export const equation43 = bg1Game('equation-game', 'money', '3', ['equationTower', 'equationSignal', 'heavy13'], {
  meta: {
    title: '수식 게임 규칙 — 피의 게임 시즌1 3일차 머니 챌린지, 숨은 카드로 43 만들기',
    description: '피의 게임 시즌1 3일차 머니 챌린지 수식 게임의 규칙을 정리했어요. 폐공장에 숨긴 봉투, 집사를 거쳐 여는 카드, 카드 교환과 300만 원 폐기, 연산 기호 1개 이상과 숫자 붙이기, 한 사람 한 수식, 43과 같거나 가장 가까운 값, 동점 판정까지.',
    keywords: ['수식 게임', '피의 게임 수식 게임', '피의 게임 시즌1 3일차', '43 만들기', '피의게임1'],
  },
  title: '수식 게임 — 피의 게임 시즌1 3일차 머니 챌린지',
  name: '수식 게임',
  lead: '폐공장 곳곳에 숨은 숫자·기호 카드를 찾아, 값이 정확히 43인 수식을 만들어요. 카드는 서로 바꿀 수 있어요.',
  summary: '숨겨진 카드를 모으고 교환해 43을 만드는 120분 개인전.',
  setup: [
    { type: 'list', items: [
      '**장소**: 저택 밖 폐공장. 제한 시간 120분.',
      '**카드**: 봉투에 담겨 곳곳에 숨겨져 있어요. 집사에게 가져가야 열 수 있고, 연 카드는 내 카드로 등록돼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '찾기', body: '봉투를 찾아 집사에게 가져가 열어요. 집사를 거치지 않고 열면 안 돼요.' },
      { title: '교환·폐기', body: '등록된 카드는 서로 자유롭게 교환할 수 있어요. 내 카드를 버리려면 집사에게 300만 원을 내야 해요. 열지 않은 봉투는 자유롭게 주거나 버릴 수 있지만, 연 카드를 일방적으로 넘기는 것은 금지예요.' },
      { title: '수식 등록', body: '시간 안에 수식을 하나 등록해요. 연산 기호가 1개 이상 있어야 하고, 숫자 카드는 붙여 쓸 수 있어요. 한 번 등록하면 고치거나 버릴 수 없어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '값이 **정확히 43**인 사람이 이겨요. 여럿이면 연산 기호를 더 많이 쓴 사람, 그것도 같으면 쓴 숫자 카드 중 가장 큰 숫자를 쓴 사람이 이겨요.',
      '43이 없으면 43에 가장 가까운 사람이 이기고, 동률이면 위 판정을 써요. 우승자는 상금 2,000만 원과 면제권 1장을 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '수식은 한 사람당 하나뿐이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '43은 소수라 곱셈으로 바로 만들 수 없어요. 그래도 숫자를 붙일 수 있으니 4와 3, 그리고 1이나 0 같은 카드가 있으면 "43×1"이나 "43+0"처럼 쉽게 끝나요. 승부는 **동점 판정**에서 나요.' },
    { type: 'cards', items: [
      { title: '기호를 많이 쓸수록 유리', body: '43을 만든 사람이 여럿이면 기호 개수로 가려요. 그래서 43을 만든 뒤에도 "+1−1", "×1÷1"처럼 값을 바꾸지 않는 기호를 계속 덧붙이는 것이 승리 전략이에요. 결국 기호 카드를 얼마나 많이 모으느냐의 싸움이 돼요.' },
      { title: '교환은 되지만 증여는 안 된다', body: '연 카드는 교환만 되고 일방적으로 줄 수 없어요. 내게 필요 없는 카드는 남에게 필요한 카드와 바꾸는 협상 재료예요. 열지 않은 봉투는 자유롭게 넘길 수 있어, 동맹에게 봉투째 몰아주는 길이 있어요.' },
      { title: '등록은 한 번뿐', body: '수정이 불가능하니, 일찍 등록하면 확실하지만 나중에 더 긴 수식을 만든 사람에게 질 수 있어요. 남은 시간과 남이 모은 기호 수를 보며 등록 시점을 정해야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략은** "43을 확보한 뒤 값이 0인 덧붙임으로 기호 수를 최대화하기"에 가까워요. 남는 변수는 기호 카드의 총량과, 그것을 누가 쥐느냐예요.' },
  ],
  similar: [
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자로 목표 숫자를 만드는 계산 게임이에요.', differs: '크립토는 숫자가 모두 주어지고, 기호를 자유롭게 써요.' },
    { name: '이퀘이트 (Equate)', players: '2–4명', alike: '숫자·기호 타일로 맞는 식을 만들어 점수를 얻는 수식판 스크래블이에요.', differs: '이퀘이트는 판 위에 등식을 가로세로로 이어 놓고, 목표 숫자가 정해져 있지 않아요.' },
  ],
}, {
  meta: {
    title: 'Equation Game rules — The Bloody Game season 1, day 3 money challenge',
    description: 'The rules of the Equation Game (수식 게임) from The Bloody Game season 1: envelopes hidden in a disused factory, cards opened through the butler, trading cards and discarding for ₩3 million, at least one operator and joined digits, one equation each, exactly 43 or closest, and the tie-breaks.',
    keywords: ['Equation Game', 'Bloody Game season 1', 'make 43', '피의 게임 수식 게임'],
  },
  title: 'Equation Game — The Bloody Game season 1, day 3 money challenge',
  name: 'Equation Game (수식 게임)',
  lead: 'Find number and operator cards hidden around a disused factory and build an equation worth exactly 43. Cards can be traded.',
  summary: 'A 120-minute individual hunt: collect and trade hidden cards to make 43.',
  setup: [
    { type: 'list', items: [
      '**Venue**: a disused factory outside the mansion; 120 minutes.',
      '**Cards**: in envelopes hidden around the site, opened only by the butler and then registered as yours.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Find', body: 'Bring envelopes to the butler to open; opening them yourself is not allowed.' },
      { title: 'Trade or discard', body: 'Registered cards may be traded freely; discarding one costs ₩3 million. Unopened envelopes may be given or thrown away, but opened cards cannot simply be given.' },
      { title: 'Register', body: 'Register one equation before time is up, with at least one operator; digits may be joined. It cannot be changed or withdrawn.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'A value of **exactly 43** wins; among several, more operators wins, then the highest number card used.',
      'If nobody makes 43, the closest wins, with the same tie-breaks. The winner gets ₩20 million and an immunity pass.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'One equation per player.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '43 is prime, but joined digits make it easy: with a 4, a 3 and a 1 or 0, "43×1" or "43+0" will do. The contest is in **the tie-breaks**.' },
    { type: 'cards', items: [
      { title: 'More operators win', body: 'Ties between 43s go to operator count, so after reaching 43 you keep appending value-neutral pieces like "+1−1" or "×1÷1". It becomes a fight over operator cards.' },
      { title: 'Trade, not gift', body: 'Opened cards can be traded but not given, so useless cards are bargaining chips; unopened envelopes can be handed to allies freely.' },
      { title: 'One registration', body: 'Registering early is safe but can lose to a longer equation later; watch the clock and others’ operator counts.' },
    ], columns: 1 },
    { type: 'p', text: 'The **near-dominant strategy** is to secure 43 and then maximise operators with zero-value additions; what remains is how many operator cards exist and who holds them.' },
  ],
  similar: [
    { name: 'Krypto', players: '1+', alike: 'Make a target number from given numbers.', differs: 'All numbers are dealt and operators are free.' },
    { name: 'Equate', players: '2–4', alike: 'Score by building correct equations from number and operator tiles.', differs: 'Equations interlock on a board like Scrabble, with no single target.' },
  ],
});

export const mineGame = bg1Game('mine-game', 'money', '4', ['russianRoulette', 'indianPoker', 'piggyBank'], {
  meta: {
    title: '지뢰 게임 규칙 — 피의 게임 시즌1 4일차 머니 챌린지, 지뢰가 숨은 팀 만들기',
    description: '피의 게임 시즌1 4일차 머니 챌린지 지뢰 게임의 규칙을 정리했어요. 라운드마다 한 명이 몰래 지뢰, 2·3·4·5·6인 팀 결성, 30분 제한, 지뢰 없는 팀 전원 +1점, 지뢰가 있으면 지뢰 +2점·나머지 −1점, 5점 선승까지.',
    keywords: ['지뢰 게임', '피의 게임 지뢰 게임', '피의 게임 시즌1 4일차', '피의게임1 머니 챌린지', '피의게임1'],
  },
  title: '지뢰 게임 — 피의 게임 시즌1 4일차 머니 챌린지',
  name: '지뢰 게임',
  lead: '라운드마다 정해진 인원으로 팀을 만들어요. 팀에 몰래 지뢰가 섞여 있으면 지뢰만 점수를 얻고 나머지는 점수를 잃어요.',
  summary: '매 라운드 숨은 지뢰 한 명을 피해 팀을 짜는 신뢰 게임. 5점을 먼저 얻으면 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 개인전.',
      '**지뢰**: 라운드마다 한 명이 몰래 지뢰가 되고, 같은 사람이 연속으로 지뢰가 되지는 않아요.',
      '**팀 크기**: 1라운드 2명, 2라운드 3명, 3라운드 4명, 4라운드 5명, 5라운드 6명.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '팀 결성', body: '30분 안에 정해진 인원의 팀을 만들고, 팀원 모두가 투표룸에서 결성을 보고해요.' },
      { title: '점수', body: '지뢰가 없는 팀은 전원 +1점. 지뢰가 있는 팀은 **지뢰 +2점, 나머지 −1점**. 팀을 못 만든 사람은 변동이 없어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '누적 **5점**을 먼저 얻은 사람이 이겨 상금 2,000만 원과 면제권 1장을 받아요. 5라운드 뒤에도 없으면 연장 라운드를 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '팀을 만들지 않으면 점수를 잃지도 얻지도 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '지뢰 게임은 **배신의 보상이 정해진** 신뢰 게임이에요. 지뢰에게 팀은 +2점의 기회이고, 나머지에게는 −1점의 위험이에요.' },
    { type: 'cards', items: [
      { title: '팀이 커질수록 위험', body: '라운드가 갈수록 팀 크기가 커져, 6명 팀에서는 지뢰가 섞일 확률이 높아져요. 대신 지뢰가 없으면 6명이 모두 1점을 얻어요. 초반 2인 팀은 신뢰할 한 사람만 고르면 되지만, 후반에는 사실상 모두를 믿어야 해요.' },
      { title: '지뢰는 언제 드러날까', body: '지뢰가 있는 팀은 결과로 드러나요. 누가 +2를 받았는지는 점수 변화를 아는 사람만 알 수 있으니, 공개되는 정보가 어디까지인지가 추리의 범위를 정해요. 같은 사람이 연속으로 지뢰가 되지 않으니, 방금 지뢰였던 사람은 다음 라운드에 가장 안전한 팀원이에요.' },
      { title: '빠지는 선택', body: '팀을 만들지 않으면 0점이라, 의심스러우면 빠지는 것도 방법이에요. 하지만 5점에 먼저 닿아야 이기는 게임이라, 계속 빠지면 우승은 멀어져요.' },
    ], columns: 1 },
    { type: 'p', text: '지뢰 입장에서는 팀에 들어가는 것이 언제나 이득이고, 일반 플레이어 입장에서는 확신이 있을 때만 들어가는 게 이득이에요. **우월 전략은 없고**, "직전 라운드 지뢰"라는 확실한 정보를 어떻게 쓰느냐가 핵심이에요.' },
  ],
  similar: [
    { name: '레지스탕스 (The Resistance)', players: '5–10명', alike: '숨은 배신자가 섞였을지 모르는 팀을 꾸리고, 결과로 배신자를 추리해요.', differs: '레지스탕스는 팀 역할이 게임 내내 고정이고, 팀장이 원정대를 골라요.' },
    { name: '스컬 (Skull)', players: '3–6명', alike: '남이 숨긴 위험(해골)을 피해 믿을 수 있는 것을 고르는 게임이에요.', differs: '스컬은 정체가 아닌 패를 숨기고, 팀을 만들지 않아요.' },
  ],
}, {
  meta: {
    title: 'Mine Game rules — The Bloody Game season 1, day 4 money challenge',
    description: 'The rules of the Mine Game (지뢰 게임) from The Bloody Game season 1: one secret mine each round, teams of 2, 3, 4, 5 and 6, a 30-minute limit, +1 each for a mine-free team, +2 for the mine and −1 for the others, and first to 5 points.',
    keywords: ['Mine Game', 'Bloody Game season 1', '피의 게임 지뢰 게임'],
  },
  title: 'Mine Game — The Bloody Game season 1, day 4 money challenge',
  name: 'Mine Game (지뢰 게임)',
  lead: 'Each round, form a team of a set size. If a secret mine is in your team, only the mine scores and everyone else loses a point.',
  summary: 'A trust game of building teams around one hidden mine per round; first to 5 points wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: individual.',
      '**Mine**: one player each round, secretly, never the same player twice in a row.',
      '**Team sizes**: 2, 3, 4, 5 and 6 in rounds 1–5.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Form', body: 'Within 30 minutes form a team of the set size; all members report it in the voting room.' },
      { title: 'Score', body: 'Mine-free team: +1 each. Team with the mine: **mine +2, others −1**. Unteamed players: no change.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'First to **5 points** wins ₩20 million and an immunity pass; if nobody has after five rounds, extra rounds follow.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Not joining a team neither gains nor loses.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The Mine Game is a trust game with **a fixed reward for betrayal**: for the mine, a team is +2; for others it is a −1 risk.' },
    { type: 'cards', items: [
      { title: 'Bigger teams, bigger risk', body: 'Teams grow each round, so a mine is likelier in a six-player team, though a clean one gives six people a point. Early pairs need one trusted partner; late teams need almost everyone.' },
      { title: 'When is the mine revealed?', body: 'A mined team shows in the results; who got +2 is known only to those who see score changes, which bounds deduction. Since nobody is mine twice in a row, last round’s mine is next round’s safest teammate.' },
      { title: 'Sitting out', body: 'Staying out scores 0, an option when suspicious, but someone must reach 5 first, so sitting out too often costs the win.' },
    ], columns: 1 },
    { type: 'p', text: 'For the mine, joining always pays; for others, only when sure. **There is no dominant strategy**; using the one certain fact, last round’s mine, is key.' },
  ],
  similar: [
    { name: 'The Resistance', players: '5–10', alike: 'Build teams that may hide a traitor and deduce from results.', differs: 'Roles are fixed for the game and leaders choose the teams.' },
    { name: 'Skull', players: '3–6', alike: 'Choose what to trust while avoiding hidden danger.', differs: 'Tiles, not identities, are hidden, and there are no teams.' },
  ],
});

export const richGame = bg1Game('rich-game', 'money', '6', ['piggyBank', 'twoSidedPoker', 'hitStay'], {
  meta: {
    title: '부자 게임 규칙 — 피의 게임 시즌1 6일차 머니 챌린지, 실제 시세로 움직이는 네 종목 입찰',
    description: '피의 게임 시즌1 6일차 머니 챌린지 부자 게임의 규칙을 정리했어요. 부동산·가상화폐·현물·주식이 숨은 A–D 종목, 2018–2021년 실제 시세, 종목별 칩 10개, 최다 칩 낙찰과 동률 무효, 정보 공개권·등락 정보·추가 칩, 칩 양도까지.',
    keywords: ['부자 게임', '피의 게임 부자 게임', '피의 게임 시즌1 6일차', '투자 게임', '피의게임1'],
  },
  title: '부자 게임 — 피의 게임 시즌1 6일차 머니 챌린지',
  name: '부자 게임',
  lead: '정체를 모르는 네 종목에 칩을 걸어요. 각 종목의 값은 2018–2021년의 실제 시세를 따라가고, 가장 많이 건 사람이 그 값을 가져가요.',
  summary: '실제 과거 시세로 움직이는 네 종목에 칩으로 입찰하는 5라운드 게임. 칩은 주고받을 수 있어요.',
  setup: [
    { type: 'list', items: [
      '**종목**: A·B·C·D. 각각 부동산·가상화폐·현물·주식인데, 어느 것이 무엇인지는 숨겨져 있어요.',
      '**시세**: 1라운드 2018년 1월 1일, 2라운드 2019년 1월 1일, 3라운드 2020년 1월 1일, 4라운드 2021년 1월 1일, 5라운드 2021년 9월 1일의 실제 가격.',
      '**칩**: 종목마다 10개씩. 그 종목에만 걸 수 있어요. 칩은 서로 자유롭게 주고받을 수 있어요.',
      '**아이템**: 정보 공개권(500만 원, 종목의 정체 확인), 등락 정보(300만 원, 한 종목의 다음 라운드가 상승·폭등·하락·폭락 중 무엇인지), 베팅 칩(개당 500만 원).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '입찰', body: '라운드마다 한 명씩 투표룸에 들어가 원하는 종목에 칩을 걸어요. 걸 칩이 없어도 반드시 들어가야 해요.' },
      { title: '낙찰', body: '종목마다 칩을 가장 많이 건 사람이 그 종목의 금액을 가져가요.' },
      { title: '동률', body: '최다 칩이 동률이면 그 입찰들은 무효가 되고, 다음으로 많이 건 사람이 가져가요. 그런 사람도 없으면 유찰이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드가 끝나면 종목의 정체가 공개되고, **얻은 금액이 가장 많은 사람**이 이겨 상금 2,000만 원과 면제권 1장을 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '낙찰에 실패해도 건 칩은 돌려받지 못해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '부자 게임은 경제 지식의 게임처럼 보이지만, 규칙의 핵심은 **칩을 양도할 수 있다**는 점이에요.' },
    { type: 'cards', items: [
      { title: '몰아주기', body: '칩을 주고받을 수 있으니, 연합이 칩을 한 사람에게 몰아주면 그 사람은 원하는 종목을 매 라운드 차지할 수 있어요. 종목마다 칩이 10개씩이라, 몇 사람의 칩만 모아도 혼자서는 이길 수 없는 입찰이 돼요. 결국 우승자는 연합이 정해요.' },
      { title: '역사를 아는 것', body: '2018–2021년의 가상화폐는 크게 오르내렸고, 부동산과 주식은 다른 흐름이었어요. 종목의 정체를 맞히면 다음 라운드 값을 짐작할 수 있어, 정보 공개권과 등락 정보는 연합에게 특히 값져요. 어느 라운드에 어느 종목이 비싼지 알면 칩을 그 라운드에 집중할 수 있어요.' },
      { title: '동률 무효의 함정', body: '1등 입찰이 동률이면 무효가 되고 2등이 가져가요. 그래서 경쟁자와 같은 수를 거는 것은 두 사람 모두에게 최악이고, 일부러 2등 자리에 적게 거는 수가 통하기도 해요.' },
    ], columns: 1 },
    { type: 'p', text: '칩 양도가 자유롭기 때문에 다수 연합의 몰아주기가 **사실상 우월 전략**이에요. 개인의 지식은 그 연합 안에서 칩을 어디에 쓸지 정할 때 빛나요.' },
  ],
  similar: [
    { name: '스톡파일 (Stockpile)', players: '2–5명', alike: '주가 변동에 대한 정보를 일부만 알고 투자 결정을 내려요.', differs: '스톡파일의 주가는 카드로 정해지고, 경매로 주식 묶음을 사요.' },
    { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '가치가 라운드마다 바뀌는 대상에 입찰하고, 언제 무엇에 돈을 쓸지가 승부예요.', differs: '모던 아트는 그림의 가치가 플레이어들의 선택으로 정해져요.' },
  ],
}, {
  meta: {
    title: 'Rich Game rules — The Bloody Game season 1, day 6 money challenge',
    description: 'The rules of the Rich Game (부자 게임) from The Bloody Game season 1: four disguised assets (property, cryptocurrency, commodity, stocks), real prices from 2018 to 2021, ten chips per asset, highest bid wins with ties void, information items and extra chips, and freely transferable chips.',
    keywords: ['Rich Game', 'Bloody Game season 1', 'investment game', '피의 게임 부자 게임'],
  },
  title: 'Rich Game — The Bloody Game season 1, day 6 money challenge',
  name: 'Rich Game (부자 게임)',
  lead: 'Bid chips on four assets whose identities are hidden. Their values follow real prices from 2018 to 2021, and the highest bidder takes the value.',
  summary: 'Five rounds of chip bids on four assets moving with real past prices; chips can be traded.',
  setup: [
    { type: 'list', items: [
      '**Assets**: A–D are property, cryptocurrency, a commodity and stocks, in hidden order.',
      '**Prices**: real values on 1 January 2018, 2019, 2020 and 2021, and 1 September 2021 for rounds 1–5.',
      '**Chips**: ten per asset, usable only on that asset; freely tradeable.',
      '**Items**: identity reveal (₩5 million), next-round movement of one asset — rise, surge, fall or crash (₩3 million), extra chips (₩5 million each).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Bid', body: 'Each round players enter the voting room one at a time and bid; you must enter even with no chips.' },
      { title: 'Win', body: 'The most chips on an asset takes its value.' },
      { title: 'Ties', body: 'Tied top bids are void and the next-highest takes it; if none, nobody does.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After round 5 the identities are revealed and **the most money earned** wins ₩20 million and an immunity pass.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Chips bid are spent whether or not you win.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It looks like a test of economic knowledge, but the key rule is that **chips can be transferred**.' },
    { type: 'cards', items: [
      { title: 'Pooling', body: 'An alliance that funnels chips to one player can take any asset every round; with ten chips per asset, a few pooled stacks beat any individual. The alliance chooses the winner.' },
      { title: 'Knowing history', body: 'Cryptocurrency swung wildly in 2018–2021 while property and stocks moved differently; identifying assets predicts next values, which makes the reveal and movement items valuable for alliances timing their chips.' },
      { title: 'Void ties', body: 'Tied top bids are void and second place wins, so matching a rival’s bid hurts both, and a deliberately small second bid can work.' },
    ], columns: 1 },
    { type: 'p', text: 'With free transfers, majority pooling is **effectively dominant**; individual knowledge shines in deciding where the pool goes.' },
  ],
  similar: [
    { name: 'Stockpile', players: '2–5', alike: 'Invest with partial information about price moves.', differs: 'Prices come from cards and stock lots are auctioned.' },
    { name: 'Modern Art', players: '3–5', alike: 'Bid on items whose values change each round; when to spend is the game.', differs: 'Values come from players’ choices.' },
  ],
});

export const battleRps = bg1Game('battle-rock-paper-scissors', 'revival', '7', ['indianPoker', 'twoSidedPoker', 'russianRoulette'], {
  meta: {
    title: '배틀 가위바위보 규칙 — 피의 게임 시즌1 7일차 피의 복수 챌린지, 특수 카드가 있는 팀 가위바위보',
    description: '피의 게임 시즌1 7일차 피의 복수 챌린지 배틀 가위바위보의 규칙을 정리했어요. 지상층 팀 대 지하층 팀, 가위·바위·보 2장씩과 빅토리·체인지·빈 카드, 대표가 한 장씩 내는 5라운드, 같은 특수 카드의 상쇄까지.',
    keywords: ['배틀 가위바위보', '피의 게임 배틀 가위바위보', '피의 게임 시즌1 7일차', '피의 복수 챌린지', '피의게임1'],
  },
  title: '배틀 가위바위보 — 피의 게임 시즌1 7일차 피의 복수 챌린지',
  name: '배틀 가위바위보',
  lead: '팀마다 가위·바위·보 카드와 특수 카드로 다섯 번 겨뤄요. 무조건 이기는 빅토리, 서로의 카드를 맞바꾸는 체인지가 승부를 흔들어요.',
  summary: '지상층과 지하층이 특수 카드를 섞어 다섯 번 겨루는 팀 가위바위보.',
  setup: [
    { type: 'list', items: [
      '**인원**: 지상층 팀 대 지하층 팀.',
      '**카드**: 팀마다 가위·바위·보 2장씩과 특수 카드 **빅토리**, **체인지**, **빈 카드** 각 1장, 모두 9장.',
      '**라운드**: 5라운드, 라운드마다 한 명씩 돌아가며 대표가 돼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '제출', body: '대표가 가위바위보 카드 1장과 특수 카드 1장을 함께 내요.' },
      { title: '빅토리', body: '가위바위보와 상관없이 이겨요. 게임 중 한 번만 쓸 수 있어요.' },
      { title: '체인지', body: '나와 상대의 가위바위보 카드를 맞바꿔요. 상대가 빅토리를 냈다면 내가 이겨요. 한 번만 쓸 수 있어요.' },
      { title: '빈 카드', body: '빅토리나 체인지를 내지 않을 때 내요. 여러 번 쓸 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드 뒤 승점이 많은 팀이 이겨요. 이긴 팀은 다음 챌린지까지 지상층에 머물거나 복귀하고, 진 팀은 지하층에 남거나 내려가며 투표로 최종 탈락자를 정해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두 팀이 같은 특수 카드를 내면 효과가 사라지고 가위바위보로만 겨뤄요.',
      '가위바위보 카드는 2장씩이라 한 번 낸 카드는 다시 쓰지 못하는 것으로 보여요. 정리된 규칙에 명시되어 있지는 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '배틀 가위바위보는 **남은 카드 세기**와 **특수 카드 타이밍**의 게임이에요. 가위·바위·보가 2장씩이라 다섯 판 중 한 종류는 다 쓸 수 없고, 상대가 남긴 카드도 점점 드러나요.' },
    { type: 'cards', items: [
      { title: '체인지는 빅토리의 천적', body: '상대가 빅토리를 낼 것 같은 판에 체인지를 내면 내가 이겨요. 그래서 빅토리는 "상대가 체인지를 이미 썼을 때" 가장 안전해요. 서로 상대의 특수 카드가 남았는지를 보며 언제 쓸지 눈치를 봐요.' },
      { title: '체인지의 계산', body: '체인지는 가위바위보 카드를 맞바꾸니, 상대가 낼 카드를 이기는 카드가 아니라 **상대 카드에 지는 카드**를 내야 해요. 바꾼 뒤에는 내가 상대 카드를 갖게 되니까요. 이 반대 계산을 정확히 해야 체인지가 무기가 돼요.' },
      { title: '마지막 판', body: '5라운드쯤이면 양쪽에 남은 카드가 거의 드러나요. 마지막 판의 결과가 앞선 판들의 카드 사용으로 이미 정해지는 경우도 있어, 초반 판에서 무엇을 남길지가 막판을 좌우해요.' },
    ], columns: 1 },
    { type: 'p', text: '양 팀이 같은 카드로 시작해 **우월 전략은 없어요.** 남은 카드와 특수 카드를 기록하고, 마지막 판에서 상대에게 선택지를 남기지 않도록 카드를 쓰는 팀이 유리해요.' },
  ],
  similar: [
    { name: '쿠 (Coup)', players: '2–6명', alike: '숨긴 카드와 능력의 타이밍으로 상대를 읽는 심리전이에요.', differs: '쿠는 카드 능력을 거짓으로 주장할 수 있고, 가위바위보가 없어요.' },
    { name: '하겐 (Hol’s der Geier)', players: '2–5명', alike: '한정된 카드를 동시에 내며, 남은 카드를 세어 상대의 다음 수를 짐작해요.', differs: '하겐은 숫자의 크기로 겨뤄요.' },
  ],
}, {
  meta: {
    title: 'Battle Rock Paper Scissors rules — The Bloody Game season 1, day 7 revenge challenge',
    description: 'The rules of Battle Rock Paper Scissors (배틀 가위바위보) from The Bloody Game season 1: the upper floor against the basement, two each of rock, paper and scissors plus Victory, Change and Blank cards, five rounds with rotating representatives, and matching special cards cancelling.',
    keywords: ['Battle Rock Paper Scissors', 'Bloody Game season 1', 'revenge challenge', '피의 게임 배틀 가위바위보'],
  },
  title: 'Battle Rock Paper Scissors — The Bloody Game season 1, day 7 revenge challenge',
  name: 'Battle Rock Paper Scissors (배틀 가위바위보)',
  lead: 'Each team plays five rounds with rock-paper-scissors cards plus specials: Victory always wins, Change swaps the two cards.',
  summary: 'Upper floor against basement in five rounds of team rock-paper-scissors with special cards.',
  setup: [
    { type: 'list', items: [
      '**Teams**: the upper floor against the basement.',
      '**Cards**: per team, two each of rock, paper and scissors and one each of **Victory**, **Change** and **Blank**: nine.',
      '**Rounds**: five, with a rotating representative.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Play', body: 'The representative plays one rock-paper-scissors card and one special card.' },
      { title: 'Victory', body: 'Wins regardless; once per game.' },
      { title: 'Change', body: 'Swaps the two teams’ rock-paper-scissors cards; against Victory it wins. Once per game.' },
      { title: 'Blank', body: 'Played when using neither special; reusable.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'More points after five rounds wins. Winners stay on or return to the upper floor until the next challenge; losers stay in or go down to the basement and vote out one player for good.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If both play the same special, it cancels and only rock-paper-scissors counts.',
      'With two of each rock-paper-scissors card, used cards appear to be spent.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is **card counting** plus **timing of specials**. With two of each, one kind cannot be played in every round, and leftovers become visible.' },
    { type: 'cards', items: [
      { title: 'Change beats Victory', body: 'Change wins against Victory, so Victory is safest once the rival’s Change is gone; each side watches which specials remain.' },
      { title: 'Change arithmetic', body: 'Change swaps the cards, so you must play the card that **loses** to the rival’s, since you will end up holding theirs. Getting this inverse reasoning right makes Change a weapon.' },
      { title: 'The last round', body: 'By round 5 both hands are nearly known and the outcome can be fixed by earlier choices, so what you keep early decides the end.' },
    ], columns: 1 },
    { type: 'p', text: 'Both start equal, so **there is no dominant strategy**; recording cards and leaving the rival no options in the last round wins.' },
  ],
  similar: [
    { name: 'Coup', players: '2–6', alike: 'Hidden cards and timing of abilities in a mind game.', differs: 'Abilities can be bluffed and there is no rock-paper-scissors.' },
    { name: 'Raj (Hol’s der Geier)', players: '2–5', alike: 'Limited cards played simultaneously, counting what remains.', differs: 'It compares number sizes.' },
  ],
});
