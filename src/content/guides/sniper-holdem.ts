// 스나이퍼 홀덤 guide. Rules and numbers follow src/lib/sniperHoldem.ts (SH_DECK 1–10 ×4, SH_ANTE 1, startRound's cap
// = smallest stack among players still in, beginBetting's skip at the cap, shCanAct: no checking, shEvaluate's
// ranking and keys, shResolve: sniped hands tie for last, private-card tie-break, all sniped = split, shSplit's odd
// chips from the 선, shGifts, shTarget = start × N ÷ (N − 1)), src/lib/sniperHoldemRoom.ts (SH_TURN_SEC 30 /
// SH_WARN_SEC 10, AI takeover, 60 or 24 chips, AI on/off) and src/lib/sniperHoldemAi.ts (levels). The broadcast rules
// and their sources are listed at the top of src/lib/sniperHoldem.ts. Percentages: 400,000 random deals of 4 shared +
// 2 private cards from the 40-card deck (high card 19.7%, pair 49.3%, two pair 19.6%, triple 5.6%, straight 3.8%,
// full house 1.8%, four 0.2%; your hand is the shared cards' own hand 35% of the time; pocket pair 60/780 = 7.7%).
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'sniperHoldem',
  origin: { kind: 'show', show: 'dp2' },
  updated: '2026-11-27',
  related: ['hitStay', 'indianPoker', 'twoSidedPoker', 'heavy13'],
  ko: {
    meta: {
      title: '스나이퍼 홀덤(저격 홀덤) 공략 — 데블스플랜2 감옥매치 룰, 족보 확률, 저격 요령 | PUZZLTHINK',
      description: '데블스 플랜: 데스룸(데블스플랜2) 저격 홀덤 공략. 40장 덱 족보 확률표, 저격 선언법과 동점 규칙, 75칩 생존 계산, 방송 라운드 따라가기, 저격을 피하는 히든 페어와 자기 족보 저격까지 정리했어요.',
      keywords: ['저격 홀덤 공략', '스나이퍼 홀덤 공략', '저격홀덤 룰', '데블스플랜2 저격 홀덤', '데블스 플랜 데스룸 감옥매치', '저격 홀덤 족보', '저격 홀덤 전략', '데블스플랜 홀덤'],
    },
    title: '스나이퍼 홀덤(저격 홀덤) 공략',
    lead: '가장 강한 패가 가장 위험한 패. 공유 카드로 상대를 읽고, 내 패는 숨기는 법.',
    intro: [
      '스나이퍼 홀덤(방송 이름 「저격 홀덤」)은 공유 카드 4장과 개인 카드 2장으로 족보를 만들어 겨루는 홀덤에, 상대의 족보를 정확히 맞혀 **꼴찌로 만드는 저격**을 더한 게임이에요. 공유 카드가 모두에게 보이기 때문에 강한 족보일수록 짐작하기 쉽고, 짐작하기 쉬운 족보일수록 저격당해요. 그래서 이 게임의 실력은 "좋은 패를 받는 것"보다 **"읽히지 않는 패를 키우는 것"**에서 나와요.',
      '이 공략은 방송 규칙을 확인한 정리, 40장 덱으로 직접 계산한 족보 확률, 규칙 카드에 잘 드러나지 않는 판정(저격이 여러 사람에게 맞을 때, 모두 저격당했을 때, 올인 뒤 베팅이 건너뛰어질 때), 방송의 한 라운드를 따라가는 예시, 입문부터 고급까지의 전략과 PUZZLTHINK 버전의 차이를 차례로 담았어요.',
    ],
    gamePageTitle: '스나이퍼 홀덤(저격 홀덤) 온라인 — 데블스플랜2 감옥매치를 웹에서',
    summary: '족보 확률표, 저격 선언법과 동점 규칙, 75칩 생존 계산, 저격을 피하는 히든 페어 전략.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '스나이퍼 홀덤은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '넷플릭스 「데블스 플랜: 데스룸」(데블스 플랜 시즌 2) 3일차 밤, 감옥동에 모인 5명이 치른 감옥 매치예요. 방송에서는 칩 75개를 먼저 모은 사람부터 차례로 생존을 확정했고, 끝까지 남은 한 명이 탈락했어요. 마지막 1:1은 상대의 칩을 모두 따야 끝나는 구조라 수십 라운드가 이어졌어요.' },
          { type: 'p', text: '텍사스 홀덤과 닮았지만 다른 점이 많아요. 카드는 문양 없는 **1~10 숫자 카드 4세트(40장)**라 플러시가 없고, 공유 카드는 5장이 아니라 **4장**이에요. 무엇보다 **저격**이 있어요. 개인 카드를 공개하기 전에 "8 스트레이트", "7 투페어"처럼 족보를 숫자까지 불러 맞히면, 그 족보를 가진 사람은 아무리 높은 족보라도 꼴찌가 돼요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 AI 4명과 5인전(보통·어려움), AI와 1:1, 친구 방과 공개방(2~5명)으로 할 수 있어요. 실제 돈과는 아무 관련 없는 칩 게임이에요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '기본 규칙',
        blocks: [
          { type: 'steps', items: [
            { title: '기본 베팅과 개인 카드', body: '라운드마다 모두 기본 베팅을 내고(방송은 늘 1칩, PUZZLTHINK는 처음 4라운드 1칩 뒤로 점점 올라요 — 아래 「방송과 다른 점」), 나만 보는 개인 카드 2장을 받아요. 선(먼저 행동하는 사람)은 라운드마다 한 자리씩 옮겨가요.' },
            { title: '공유 카드 2장 → 1차 베팅', body: '공유 카드 2장을 공개하고 선부터 베팅해요. **체크는 없어요.** 첫 사람은 최소 1칩을 걸거나 포기하고, 다음 사람들은 콜(같은 만큼)·레이즈(더 많이)·포기 중에서 골라요. 모두 같은 칩을 내면 끝나요.' },
            { title: '공유 카드 2장 더 → 2차 베팅', body: '공유 카드 2장을 더 공개하고 같은 방식으로 2차 베팅을 해요.' },
            { title: '저격', body: '개인 카드를 공개하기 전, 남은 사람들이 선부터 차례로 족보 하나를 저격하거나 넘어가요. 앞사람의 저격은 모두가 듣고 정해요.' },
            { title: '승부', body: '개인 카드를 공개해, **저격당하지 않은** 가장 높은 족보가 팟을 모두 가져가요. 한 사람만 남기고 모두 포기하면 저격 없이 그 사람이 가져가요.' },
          ] },
          { type: 'table', head: ['족보 (높은 순)', '조건', '저격할 때 부르는 숫자'], rows: [
            ['포카드', '같은 숫자 4장', '그 숫자 (7777 → 7 포카드)'],
            ['풀하우스', '트리플 + 페어', '**트리플의 숫자** (77733 → 7 풀하우스)'],
            ['스트레이트', '이어지는 숫자 5장 (1–5부터 6–10까지, 10-1로 돌아가지 않음)', '가장 높은 숫자 (45678 → 8 스트레이트)'],
            ['트리플', '같은 숫자 3장', '그 숫자'],
            ['투페어', '페어 2쌍', '높은 페어의 숫자 (7755 → 7 투페어)'],
            ['원페어', '같은 숫자 2장', '그 숫자'],
            ['하이카드', '위 어느 것도 아님', '가장 높은 숫자 1장'],
          ], caption: '공유 카드 4장 + 개인 카드 2장, 6장 중에서 만들 수 있는 가장 좋은 조합이 내 족보예요.' },
          { type: 'list', items: [
            '**베팅 상한**: 한 사람이 한 라운드에 내는 칩(기본 베팅 포함)은 그 라운드 시작 때 칩이 가장 적은 사람의 칩 수를 넘을 수 없어요. 그래서 모두가 상한까지 낼 수 있고, 사이드팟이 없어요.',
            '**생존**: 라운드가 끝났을 때 칩이 75개 이상이면 75개를 내고 생존을 확정해요. 남는 칩은 다른 사람에게 나눠 주는데, 칩이 0개인 사람에게는 최소 1개를 줘야 해요.',
            '**탈락**: 끝까지 생존하지 못하고 남은 한 명이 탈락해요.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리기 쉬운 판정',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { title: '같은 족보끼리는 어떻게 비교하나요?', body: '먼저 족보에 쓴 숫자를 비교해요(9 투페어 > 8 투페어, 투페어가 같으면 낮은 페어, 풀하우스는 트리플 다음 페어). 그래도 같으면 **개인 카드 중 높은 숫자**, 그다음 **다른 개인 카드**를 비교해요. 족보에 쓰이지 않은 개인 카드도 비교에 들어가요. 방송 40라운드에서 10·8과 10·5가 둘 다 "10 하이카드"였는데, 두 번째 개인 카드 8이 5를 이겼어요.' },
            { title: '저격은 그 족보를 가진 모든 사람에게 맞아요', body: '저격은 사람이 아니라 족보를 지목해요. "9 투페어"를 저격했는데 두 사람이 9 투페어라면 둘 다 꼴찌가 돼요. 저격당한 족보끼리는 높낮이를 비교하지 않고 공동 꼴찌예요.' },
            { title: '모두 저격당하면 무승부', body: '승부에 남은 사람이 전부 저격당하면 그 라운드는 무승부라 팟을 똑같이 나눠요. 나누고 남는 칩은 베팅 순서(선부터)대로 1개씩 가져가요. 개인 카드까지 완전히 같은 경우도 똑같이 나눠요.' },
            { title: '내 족보를 저격해도 되나요?', body: '돼요. 내 족보도 꼴찌가 되지만, 상대도 같은 족보이면서 개인 카드가 더 높을 것 같을 때 일부러 둘 다 꼴찌로 만들어 무승부를 노리는 수예요. 방송 8라운드에 실제로 나왔어요.' },
            { title: '올인하면 2차 베팅은?', body: '1차 베팅에서 이미 상한까지 냈다면 더 걸 수 있는 칩이 없으니 2차 베팅은 건너뛰고, 공유 카드 2장을 더 공개한 뒤 바로 저격으로 가요.' },
            { title: '저격은 꼭 해야 하나요?', body: '아니요. 넘어갈 수 있어요. 저격한 족보는 "내 패는 그보다 아래"라는 힌트가 되기 때문에, 패가 강하면 일부러 저격하지 않기도 해요. 다만 마지막 순서에서 넘어가는 건 정보를 줄 걱정이 없으니 대부분 손해예요.' },
          ] },
        ],
      },
      {
        id: 'site-version',
        onGamePage: true,
        title: 'PUZZLTHINK 버전이 방송과 다른 점',
        blocks: [
          { type: 'p', text: '규칙은 방송 그대로 옮겼고, 온라인에서 2~5명이 하도록 몇 가지를 정했어요.' },
          { type: 'table', head: ['', '방송', 'PUZZLTHINK'], rows: [
            ['인원', '5명', '2~5명 (AI전 5명 또는 1:1, 방은 AI로 채우기 선택)'],
            ['시작 칩', '60개', '60개 (방에서는 빠른 판 24개도 선택)'],
            ['기본 베팅', '매 라운드 1칩', '처음 4라운드 1칩 → 5R 2 · 7R 3 · 9R 4 · 11R 6 · 13R 8 → 2라운드마다 +3 (24칩 판은 0.4배). 친구·공개방은 방송 규칙(1칩 고정)도 선택'],
            ['생존선', '75개', '시작 칩 × 인원 ÷ (인원 − 1): 5명 75 · 4명 80 · 3명 90 · 2명 120 (24칩이면 30 · 32 · 36 · 48)'],
            ['남은 칩 나누기', '생존자가 원하는 대로 (0칩에게 최소 1개)', '0칩에게 1개씩 먼저, 나머지는 칩이 적은 사람부터 고르게'],
            ['시간', '제한 없음', 'AI전은 제한 없음, 친구·공개방은 베팅·저격마다 30초 (넘기면 AI가 대신)'],
          ] },
          { type: 'p', text: '생존선을 이렇게 정한 이유가 있어요. 방송의 60 × 5 = 300 = 75 × 4라는 관계 덕분에, n명이 남았을 때 테이블의 칩은 언제나 정확히 75 × (n − 1)개예요. 그래서 누군가 0칩이 되는 순간 다른 누군가는 반드시 75개 이상이라 바로 생존하고, 그 사람의 남는 칩으로 0칩인 사람에게 1개를 줄 수 있어요. 인원이 달라도 이 구조가 똑같이 유지되도록 같은 식을 썼어요. 2명이면 생존선이 테이블의 칩 전부라, 방송의 마지막 1:1처럼 상대를 올인시켜야 끝나요.' },
        ],
      },
      {
        id: 'probabilities',
        title: '족보는 얼마나 자주 나오나요',
        lead: '40장 덱에서 공유 카드 4장 + 개인 카드 2장을 무작위로 40만 번 뽑아 센 결과예요.',
        blocks: [
          { type: 'table', head: ['족보', '내 족보가 될 확률'], rows: [
            ['포카드', '0.2%'], ['풀하우스', '1.8%'], ['스트레이트', '3.8%'], ['트리플', '5.6%'], ['투페어', '19.6%'], ['원페어', '49.3%'], ['하이카드', '19.7%'],
          ], caption: '절반이 원페어예요. 트리플 이상은 열 판에 한 번 남짓.' },
          { type: 'list', items: [
            '내 족보가 **공유 카드 4장만으로 만든 족보와 같을 확률은 약 35%**예요. 이때 상대는 공유 카드만 보고도 내 족보를 그대로 저격할 수 있어요.',
            '개인 카드 2장이 같은 숫자(히든 페어)일 확률은 60/780 ≈ **7.7%**예요. 공유 카드에 그 숫자가 없으면 상대가 짐작할 단서가 거의 없어요.',
            '공유 카드 4장에 페어가 하나라도 있을 확률은 약 41%예요. 이때는 모두가 최소 원페어라, 투페어·트리플·풀하우스를 노리는 저격이 몰려요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '방송 라운드 따라가기: 9·9·1·1의 큰 판',
        lead: '방송 4인전 첫 라운드는 저격의 모든 요소가 한 판에 나온 라운드였어요.',
        blocks: [
          { type: 'steps', items: [
            { title: '공유 카드 9·9', body: '첫 두 장에 9 페어가 깔렸어요. 9를 한 장 가진 사람은 트리플, 페어를 가진 사람은 투페어가 확정이라, 이런 판은 크게 붙기 쉬워요. 개인 카드가 8·1이던 플레이어는 일찍 포기했어요.' },
            { title: '공유 카드 1·1', body: '나머지 두 장마저 1 페어. 이제 테이블의 모두가 최소 "9 투페어"(9-9-1-1)예요. 9를 한 장 가진 사람은 9 풀하우스, 1을 가진 사람은 1 풀하우스가 돼요. 남은 세 명이 10칩씩 더 걸어 판이 커졌어요.' },
            { title: '세 번의 저격', body: '첫 저격자는 "9 풀하우스"를 불러 9를 가진 사람(8·9)을 잡았어요. 두 번째 사람(10·4)은 자기 족보인 **"9 투페어"를 스스로 저격**했어요. 풀하우스가 지워졌다면 남은 건 투페어끼리의 비교인데, 9-9-1-1은 어떤 페어를 가진 사람에게도 지는 가장 낮은 투페어라, 같은 9 투페어인 사람을 같이 꼴찌로 만들어 무승부를 노린 수예요. 세 번째 사람은 "1 풀하우스"를 불렀지만 빗나갔어요.' },
            { title: '공개: 10·10', body: '첫 저격자의 개인 카드는 10·10이었어요. 6장 중 가장 좋은 조합은 10-10-9-9, 즉 **"10 투페어"**라 아무 저격에도 걸리지 않았고, 9 투페어보다 높아 큰 팟을 가져가며 생존을 확정했어요. 공유 카드에 없는 숫자의 히든 페어가 얼마나 강한지 보여 준 판이에요.' },
          ] },
          { type: 'callout', tone: 'note', title: '이 판에서 배울 점', text: '공유 카드가 페어로 깔리면 모두가 같은 족보를 바라보고, 저격도 그 족보들(트리플·풀하우스·같은 투페어)에 몰려요. 그 바깥에 있는 패, 특히 공유 카드에 없는 히든 페어가 가장 안전해요.' },
        ],
      },
      {
        id: 'beginner',
        onGamePage: true,
        level: 'beginner',
        title: '처음이라면: 기본 전략',
        blocks: [
          { type: 'cards', items: [
            { title: '"보드만으로 보이는 족보"는 위험해요', body: '내 족보가 공유 카드만으로 만든 족보와 같다면, 상대도 그 족보를 그대로 부를 수 있어요. 게임 화면의 "내 족보" 아래에 공유 카드에 다 보이는 족보인지 알려 줘요. 그런 패로는 크게 걸지 마세요.' },
            { title: '히든 페어는 아껴 키우세요', body: '개인 카드 2장이 같은 숫자이고 공유 카드에 그 숫자가 없으면, 상대가 저격할 단서가 거의 없어요. 열세 판에 한 번꼴로 오는 기회라, 이때는 조금씩 올리며 따라오게 만드는 것이 좋아요.' },
            { title: '저격은 "내 패보다 위에 있을 가장 그럴듯한 족보"', body: '공유 카드를 보고 상대가 가졌을 만한 족보 중, 내 패를 이기는 것 하나를 고르세요. 크게 레이즈한 사람이 있다면 그 사람이 무엇을 노렸는지가 힌트예요.' },
            { title: '포기는 손해가 아니에요', body: '초반 기본 베팅은 1칩뿐이에요. 기본 베팅이 오르는 후반에는 포기도 비싸지니, 약한 패는 초반에 정리하세요. 패도 약하고 저격으로 뒤집을 그림도 안 보이면 1차 베팅에서 바로 접는 것이 가장 싸요. 방송에서도 대부분의 라운드가 포기로 작게 끝났어요.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급: 베팅과 저격의 정보 싸움',
        blocks: [
          { type: 'p', text: '이 게임에서는 모든 행동이 정보예요. 레이즈는 "강한 패"라는 신호이고, 저격은 "내 패는 그 아래"라는 신호예요. 상대도 그걸 읽는다는 걸 전제로 움직여야 해요.' },
          { type: 'list', items: [
            '**큰 레이즈는 저격을 부른다**: 공유 카드에 스트레이트 그림이 있는데 크게 올리면, 상대는 그 스트레이트부터 저격해요. 강한 패일수록 레이즈 크기를 작게 해 "애매한 2등"처럼 보이는 편이 나을 때가 많아요.',
            '**순서가 늦을수록 저격이 정확하다**: 앞사람들의 저격을 다 듣고 고를 수 있어요. 앞사람이 높은 족보를 저격했다면 그 사람의 패는 그보다 낮을 가능성이 커요.',
            '**블러핑 저격**: 먼저 저격해야 할 때, 내 패보다 낮은 족보를 저격하면 상대는 내 패를 그 아래로 착각해요. 다만 그 족보가 실제로 누군가에게 맞을 가능성이 있는 것으로 골라야 손해가 적어요.',
            '**상한을 기억하세요**: 칩이 적은 사람이 있으면 그 사람 칩까지만 걸 수 있어 판이 커지지 않아요. 칩이 적은 사람이 있을 때 큰 패를 만나면 여러 라운드에 나눠 따야 해요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급: 생존 계산과 자기 저격',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { title: '인원이 줄수록 생존이 어려워져요', body: '5명일 때 생존선 75는 테이블 칩 300개의 25%라, 시작 칩 60에서 15개만 더 벌면 돼요. 4명이 남으면 225개 중 75개(33%), 3명이면 150개 중 75개(50%), 2명이면 75개 전부예요. 앞쪽에서 빨리 살아남는 것이 확률상 유리하니, 초반에 기회가 오면 적극적으로 키우는 것이 좋아요.' },
            { title: '1:1에서는 마지막 저격자가 유리해요', body: '둘만 남으면 선은 매 라운드 바뀌어요. 내가 뒤에서 저격할 차례라면 상대의 저격으로 상대 패의 상한을 알 수 있어요. 앞 순서일 때는 저격하지 않거나 블러핑 저격으로 정보를 숨기세요.' },
            { title: '자기 족보 저격으로 무승부 만들기', body: '공유 카드만으로 모두가 같은 족보(예: 9 투페어)가 되는 판에서, 내 개인 카드가 낮아 동점 규칙에 질 것 같으면 그 족보를 직접 저격하세요. 같은 족보인 사람이 모두 꼴찌가 되고, 승부에 남은 사람이 전부 저격당하면 무승부로 칩을 돌려받아요. 상대가 그 족보보다 높은 히든 페어를 가졌다면 실패하니, 그 가능성이 낮을 때만 쓰세요.' },
            { title: '최소 베팅의 의미', body: '체크가 없어 첫 사람은 최소 1칩을 걸어야 해요. 그래서 1칩 오픈은 거의 정보가 없고, 두 번째부터의 레이즈 크기가 진짜 신호예요.' },
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'AI와 친구 방',
        blocks: [
          { type: 'list', items: [
            '**AI 5인전 (보통·어려움)**과 **1:1 (어려움)**을 할 수 있어요. AI는 자기 자리에서 보이는 것(자기 카드, 공유 카드, 모두의 베팅과 저격)만 보고 판단하고, 숨겨진 카드는 보지 않아요.',
            '보통 AI는 상대의 베팅을 읽어 상대 패를 추정하고, 그 추정으로 승률과 저격을 계산해요. 어려움 AI는 여기에 더해 **자기 레이즈와 저격이 상대에게 어떻게 읽힐지**까지 따져, 강한 패를 숨기거나 낮은 족보를 저격하기도 해요.',
            'AI는 10가지 성향이 있고 매 판 무작위로 앉아요. 성향은 같은 계산 위에서 **거의 같은 값의 수 가운데 무엇을 고르느냐**만 바꾸기 때문에, 어떤 성향도 약하지 않아요(보통 5인전 200판에서 성향별 탈락률 18~23%, 공평하면 20%). 난이도는 계산의 깊이만 바꿔요: 1:1에서 어려움이 보통을 약 53%, 보통이 쉬움을 약 61% 이겨요. 5인전은 운의 몫이 커서 어려움과 보통의 차이가 거의 없어요. AI는 패가 확실하면 판돈의 절반 이상이나 올인으로 크게 걸고, 같은 베팅 안에서 1칩씩 레이즈를 주고받지 않아요.',
            '**친구 방·공개방**은 2~5명이 할 수 있어요. 방장이 AI로 빈자리를 채울지, 시작 칩을 60개(방송)로 할지 24개(빠른 판)로 할지, AI 난이도를 정해요. 베팅과 저격은 30초 안에 해야 하고, 마지막 10초에 경고가 뜬 뒤 시간이 지나면 AI가 그 자리를 대신해요. 돌아오면 "다시 참여"로 자리를 돌려받아요.',
            '기록: 생존하면 승, 탈락하면 패로 남아요. 어려움 AI 테이블에서 **가장 먼저 생존**하면 어려움 클리어 인증서를 받아요.',
          ] },
        ],
      },
      {
        id: 'reading-opponents',
        level: 'intermediate',
        title: '상대 성향 읽는 법',
        lead: 'AI전에는 10가지 성향의 상대가 매 판 무작위로 앉고, 그날 기분에 따라 조금씩 다르게 둬요. 몇 라운드만 보면 버릇이 드러나요.',
        blocks: [
          { type: 'p', text: '첫 두 라운드 동안 테이블 위에 「오늘의 상대」와 한 줄 소개가 떠요. 소개는 힌트일 뿐이고, 진짜 성향은 결과 화면에서 공개돼요. 그 사이에는 **승부에서 공개된 패와 그때 걸었던 칩, 저격한 족보**를 보고 읽어야 해요. AI도 똑같이 당신을 읽어요. 크게 걸고 약한 패를 보여 준 적이 있다면, 다음부터 당신의 큰 베팅을 덜 믿어요.' },
          { type: 'cards', items: [
            { title: '레이즈가 잦은데 공개된 패가 약하다', body: '블러퍼(징크스 같은 사기꾼, 불도저 렉스)예요. 큰 베팅을 그대로 믿지 말고, 저격도 "가장 센 족보"보다 보드에 실제로 맞는 족보를 노리세요.' },
            { title: '거의 접다가 갑자기 간다', body: '바위형(아울)이에요. 그때는 진짜 패일 가능성이 높아요. 피하거나, 공유 카드에 보이는 그 족보를 저격하세요.' },
            { title: '무엇이든 따라온다', body: '콜링 스테이션(모노)은 약한 패로도 끝까지 와요. 블러프는 안 통하고, 좋은 패로 크게 받아 내는 상대예요.' },
            { title: '저격을 매번 쏜다 / 거의 안 쏜다', body: '난사꾼(루나)은 저격이 많아 당신의 보드 족보가 자주 맞아요. 반대로 독사(바이퍼)는 큰 판에서만 저격하니, 작은 판에서는 보드 족보로도 안전한 편이에요.' },
            { title: '자기 족보 아래를 저격한다', body: '저격한 족보 바로 아래가 그 사람 패라는 공식을 거꾸로 이용하는 페인트예요. 지난 판에 그런 저격을 보여 준 상대라면, 저격 하나만 보고 패를 단정하지 마세요.' },
            { title: '언제나 같은 크기로 건다', body: '같은 족보에 같은 크기를 거는 상대는 금방 읽혀요. AI는 가끔 일부러 성향과 다른 수를 둬서, 버릇이 믿을 만하지만 확실하지는 않게 만들어요. 당신도 가끔 섞어 주세요.' },
          ] },
          { type: 'callout', tone: 'tip', title: '난이도와 성향은 따로예요', text: '쉬움·보통·어려움은 계산 실력(읽기와 시뮬레이션의 깊이)만 바꾸고, 성향은 모든 난이도에서 똑같이 나와요. 어려움의 바위형은 보통의 바위형보다 더 정확히 접고, 더 정확히 저격해요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어',
        blocks: [
          { type: 'glossary', items: [
            { term: '선', def: '그 라운드에 가장 먼저 베팅하고 가장 먼저 저격하는 사람. 라운드마다 한 자리씩 옮겨가요.' },
            { term: '기본 베팅', def: '라운드마다 모두 내는 칩. 방송은 늘 1칩, PUZZLTHINK는 처음 4라운드 1칩 뒤로 올라가요.' },
            { term: '공유 카드', def: '모두가 함께 쓰는 4장. 2장씩 두 번 공개돼요.' },
            { term: '개인 카드', def: '나만 보는 2장. 승부 때 공개돼요.' },
            { term: '저격', def: '"숫자 + 족보"로 족보 하나를 지목해, 그 족보를 가진 사람을 모두 꼴찌로 만드는 선언.' },
            { term: '히든 페어', def: '개인 카드 2장이 같은 숫자인 경우(포켓 페어). 공유 카드에 그 숫자가 없으면 읽히기 어려워요.' },
            { term: '상한', def: '한 라운드에 한 사람이 낼 수 있는 칩의 최대치. 칩이 가장 적은 사람의 칩 수예요.' },
            { term: '생존선', def: '이만큼 모으면 칩을 내고 생존을 확정하는 칩 수. 방송 5인전은 75개.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '저격 홀덤과 스나이퍼 홀덤은 같은 게임인가요?', a: '네. 방송(데블스 플랜: 데스룸)의 이름은 「저격 홀덤」이고 영문 이름은 Sniper Hold’em이에요. PUZZLTHINK에서는 스나이퍼 홀덤이라는 이름으로 같은 규칙을 옮겼어요.' },
      { q: '저격은 어떻게 말하나요?', a: '족보를 이루는 숫자 중 가장 높은 숫자와 족보 이름을 함께 말해요. 4-5-6-7-8은 "8 스트레이트", 7-7-5-5는 "7 투페어"예요. 풀하우스만 예외로 트리플의 숫자를 불러요(7-7-7-3-3은 "7 풀하우스").' },
      { q: '플러시는 없나요?', a: '없어요. 카드에 문양이 없는 1~10 숫자 카드 4세트라, 족보는 포카드·풀하우스·스트레이트·트리플·투페어·원페어·하이카드 7가지예요.' },
      { q: '체크(0칩)는 할 수 없나요?', a: '할 수 없어요. 방송에서 기록된 베팅 라운드는 모두 최소 1칩 베팅으로 시작했어요. 첫 사람은 1칩 이상 걸거나 포기하고, 다음 사람들은 콜·레이즈·포기 중에서 골라요.' },
      { q: '모두 저격당하면 어떻게 되나요?', a: '무승부예요. 승부에 남은 사람들이 팟을 똑같이 나누고, 나누고 남는 칩은 선부터 1개씩 가져가요.' },
      { q: '2명이나 3명이서도 할 수 있나요?', a: '네. 생존선을 시작 칩 × 인원 ÷ (인원 − 1)로 정해 방송과 같은 구조를 유지해요. 60칩으로 3명이면 90칩, 2명이면 120칩(상대 칩 전부)이에요.' },
    ],
    cta: { title: '저격 한 방으로 판을 뒤집어 보세요', body: 'AI 4명과 5인전, AI와 1:1, 친구·공개방에서 바로 할 수 있어요.', button: '스나이퍼 홀덤 하러 가기' },
    disclaimer: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요.',
  },
  en: {
    meta: {
      title: "Sniper Hold'em guide — The Devil's Plan 2 prison match rules, hand odds, how to snipe | PUZZLTHINK",
      description: "A guide to Sniper Hold'em from The Devil's Plan: Death Room (season 2): hand odds on the 40-card deck, how snipes are called and ties broken, the 75-chip survival math, a broadcast round replayed, and how hidden pairs and self-snipes win.",
      keywords: ["Sniper Hold'em guide", "Sniper Hold'em rules", "Devil's Plan 2 Sniper Hold'em", "Devil's Plan Death Room prison match", 'snipe poker strategy'],
    },
    title: "Sniper Hold'em guide",
    lead: 'The strongest hand is the most exposed one. Read the board, and keep your own hand unreadable.',
    intro: [
      "Sniper Hold'em is a hold'em with four shared cards and two private ones, plus the **snipe**: name the exact hand someone holds and it ranks last. Because the shared cards are on view, strong hands are easy to guess — and easy-to-guess hands get sniped. Skill here is less about being dealt good cards than about **growing a hand nobody can read**.",
      'This guide covers the broadcast rules as checked, hand odds counted on the 40-card deck, the rulings the rule card leaves implicit (a snipe hitting several players, everyone sniped, betting skipped after an all-in), a round from the show replayed, strategy from beginner to advanced, and how the PUZZLTHINK version differs.',
    ],
    gamePageTitle: "Sniper Hold'em online — The Devil's Plan 2 prison match in your browser",
    summary: 'Hand odds, how to call a snipe, tie rules, the 75-chip survival math, and the hidden-pair strategy.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: "What is Sniper Hold'em?",
        blocks: [
          { type: 'p', text: "It was the day-3 prison match of Netflix's The Devil's Plan: Death Room (season 2), played by the five players in the prison block. On the show, players who reached 75 chips became safe one by one, and the last one left was eliminated. The final 1:1 only ends when one side holds every chip, so it ran for dozens of rounds." },
          { type: 'p', text: "It looks like Texas hold'em but differs in key ways. The deck is **four sets of number cards 1–10 (40 cards)** with no suits, so there is no flush, and there are **four** shared cards, not five. Above all there is the **snipe**: before private cards are shown, call a hand like \"8 straight\" or \"7 two pair\", and whoever holds it ranks last, however strong it is." },
          { type: 'p', text: 'On PUZZLTHINK you can play five-handed against four AI (normal or hard), 1:1 against the AI, or in friend and open rooms for 2–5. The chips have nothing to do with real money.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'Rules',
        blocks: [
          { type: 'steps', items: [
            { title: 'Ante and private cards', body: 'Each round everyone pays the ante (always 1 on the show; on PUZZLTHINK 1 for the first 4 rounds, then rising — see "How the PUZZLTHINK version differs") and gets two private cards only they see. The first player (who acts first) moves one seat every round.' },
            { title: 'Two shared cards → bet 1', body: 'Two shared cards go up and betting starts from the first player. **There is no checking.** The opener bets at least 1 or folds; the others call, raise or fold. It ends when everyone still in has put in the same.' },
            { title: 'Two more → bet 2', body: 'Two more shared cards go up, and a second round of betting follows the same way.' },
            { title: 'Snipes', body: 'Before private cards are shown, the players still in may each snipe one hand or pass, in turn from the first player. Everyone hears the earlier snipes.' },
            { title: 'Showdown', body: 'Private cards go up and the best **unsniped** hand takes the whole pot. If everyone else folds, the last player takes it with no snipes.' },
          ] },
          { type: 'table', head: ['Hand (high to low)', 'Needs', 'Number you call when sniping'], rows: [
            ['Four of a kind', 'Four of one number', 'That number (7777 → 7 four of a kind)'],
            ['Full house', 'Triple + pair', '**The triple’s number** (77733 → 7 full house)'],
            ['Straight', 'Five in a row (1–5 up to 6–10; no 10-1 wrap)', 'The top number (45678 → 8 straight)'],
            ['Three of a kind', 'Three of one number', 'That number'],
            ['Two pair', 'Two pairs', 'The higher pair (7755 → 7 two pair)'],
            ['Pair', 'Two of one number', 'That number'],
            ['High card', 'None of the above', 'Your top number'],
          ], caption: 'Your hand is the best combination of the six cards: four shared and two private.' },
          { type: 'list', items: [
            '**Bet cap**: what one player puts in over a round (ante included) cannot exceed the chips of the smallest stack at the start of that round. Everyone can always cover it, so there are no side pots.',
            '**Safety**: anyone on 75+ chips after a round pays 75 and is safe. They hand their surplus to the others, at least 1 to anyone on 0.',
            '**Elimination**: the last player left who has not reached safety is eliminated.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Rulings that trip people up',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { title: 'How are equal hands compared?', body: 'First by the numbers in the hand (9 two pair beats 8 two pair; for two pair then the lower pair, for a full house the pair). Still equal: the **higher private card**, then the **other private card** — even when it is not part of the hand. In round 40 on the show, 10·8 and 10·5 were both "10 high card"; the 8 beat the 5.' },
            { title: 'A snipe hits everyone with that hand', body: 'A snipe names a hand, not a player. If two players both hold "9 two pair" and it is sniped, both rank last. Sniped hands are not compared with each other: they tie for last.' },
            { title: 'Everyone sniped is a draw', body: 'If every player in the showdown is sniped, the round is a draw and the pot is split evenly; odd chips go one each in betting order from the first player. Identical private cards split the same way.' },
            { title: 'Can I snipe my own hand?', body: 'Yes. You rank last too, but when an opponent likely holds the same hand with better private cards, sniping it sinks you both and aims for a draw. It happened on the show in round 8.' },
            { title: 'All in, then what?', body: 'If the cap was reached in bet 1, nobody can bet more: bet 2 is skipped, the last two shared cards go up and it is straight to the snipes.' },
            { title: 'Do I have to snipe?', body: 'No, you can pass. A snipe hints that your hand is below it, so a strong hand sometimes stays quiet. Passing as the last sniper, though, gives nothing away anyway and usually just wastes the shot.' },
          ] },
        ],
      },
      {
        id: 'site-version',
        onGamePage: true,
        title: 'How the PUZZLTHINK version differs',
        blocks: [
          { type: 'p', text: 'The rules are the broadcast’s; a few choices make it work online for 2–5 players.' },
          { type: 'table', head: ['', 'The show', 'PUZZLTHINK'], rows: [
            ['Players', '5', '2–5 (AI: five or 1:1; rooms can fill seats with AI)'],
            ['Starting chips', '60', '60 (rooms can pick a quick 24)'],
            ['Ante', '1 every round', '1 for rounds 1–4 → 2 from R5 · 3 R7 · 4 R9 · 6 R11 · 8 R13 → +3 every 2 rounds (×0.4 at 24 chips). Rooms can pick show rules (fixed 1)'],
            ['Safety line', '75', 'start × players ÷ (players − 1): 5 → 75 · 4 → 80 · 3 → 90 · 2 → 120 (at 24 chips: 30 · 32 · 36 · 48)'],
            ['Surplus chips', 'As the survivor likes (at least 1 to anyone on 0)', '1 to each 0-chip player first, the rest evenly, smaller stacks first'],
            ['Time', 'No clock', 'No clock vs AI; 30 s per bet or snipe in rooms (then the AI takes over)'],
          ] },
          { type: 'p', text: 'The safety line keeps the show’s arithmetic. Because 60 × 5 = 300 = 75 × 4, with n players left the table always holds exactly 75 × (n − 1) chips: the moment someone hits 0, someone else must have 75+ and leaves, and their surplus can give the broke player a chip. The same formula keeps that true at any table size. At two players the line is every chip on the table, like the show’s final 1:1.' },
        ],
      },
      {
        id: 'probabilities',
        title: 'How often each hand comes up',
        lead: 'Counted over 400,000 random deals of four shared and two private cards from the 40-card deck.',
        blocks: [
          { type: 'table', head: ['Hand', 'Chance it is your hand'], rows: [
            ['Four of a kind', '0.2%'], ['Full house', '1.8%'], ['Straight', '3.8%'], ['Three of a kind', '5.6%'], ['Two pair', '19.6%'], ['Pair', '49.3%'], ['High card', '19.7%'],
          ], caption: 'Half of all hands are one pair; three of a kind or better is about one in ten.' },
          { type: 'list', items: [
            'About **35%** of the time your hand is exactly the hand the four shared cards make on their own — then anyone can snipe it from the board alone.',
            'Two private cards of the same number (a hidden pair) come 60/780 ≈ **7.7%** of the time. If the board has none of that number, opponents have almost nothing to read.',
            'The shared cards hold a pair about 41% of the time. Everyone then has at least a pair, and snipes pile onto two pair, triples and full houses.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'A round from the show: the big 9·9·1·1 pot',
        lead: 'The first round with four players had every element of sniping in one hand.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Shared 9·9', body: 'A pair of 9s on the first two cards. Anyone with a 9 has a triple, anyone with a pair has two pair: these boards make big pots. The player holding 8·1 folded early.' },
            { title: 'Shared 1·1', body: 'The other two cards were a pair of 1s. Now everyone has at least "9 two pair" (9-9-1-1); a 9 in hand makes a 9 full house, a 1 a 1 full house. The three left each put in 10 more.' },
            { title: 'Three snipes', body: 'The first sniper called "9 full house" and caught the 8·9 holder. The second (10·4) **sniped their own "9 two pair"**: with full houses out of the way it was two pair against two pair, and 9-9-1-1 loses to any other pair, so sinking every 9 two pair aimed for a draw. The third called "1 full house" and missed.' },
            { title: 'Reveal: 10·10', body: 'The first sniper held 10·10. The best five of six was 10-10-9-9, a **"10 two pair"**, hit by no snipe and higher than 9 two pair, so they took the big pot and were safe. It showed how strong a hidden pair of a number not on the board is.' },
          ] },
          { type: 'callout', tone: 'note', title: 'The lesson', text: 'When the board pairs, everyone looks at the same hands and snipes go there (triples, full houses, the shared two pair). Hands outside that picture — above all a hidden pair not on the board — are the safest.' },
        ],
      },
      {
        id: 'beginner',
        onGamePage: true,
        level: 'beginner',
        title: 'Starting out: basic strategy',
        blocks: [
          { type: 'cards', items: [
            { title: 'A hand the board shows is a target', body: 'If your hand is the same as the board’s own hand, opponents can call it straight off the board. Under "My hand" the table tells you when your hand is all on the shared cards. Don’t bet big with those.' },
            { title: 'Grow hidden pairs slowly', body: 'Two private cards of one number, with that number not on the board, leave almost no clue. It comes about once in thirteen hands: raise a little at a time and keep the others calling.' },
            { title: 'Snipe "the likeliest hand above mine"', body: 'From the board, pick the hand an opponent most plausibly holds that beats yours. A big raise is a hint at what they are playing.' },
            { title: 'Folding is cheap', body: 'Early on the ante is a single chip (later, as it rises, folding costs more — clear weak hands early). With a weak hand and no snipe likely to save it, folding in bet 1 is the cheapest move. On the show most rounds ended small, with folds.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate: the information game',
        blocks: [
          { type: 'p', text: 'Every move gives something away. A raise says "strong"; a snipe says "my hand is below that". Assume your opponents read both.' },
          { type: 'list', items: [
            '**Big raises draw snipes**: raise big on a board with a straight on it and the straight is the first thing sniped. With a strong hand a small raise that looks like an unclear second-best often does better.',
            '**Later snipers are more accurate**: they hear every earlier snipe. Someone who sniped a high hand probably holds something lower.',
            '**Bluff snipes**: when you must snipe early, sniping below your own hand makes the table place your hand lower. Pick a hand that might really be out there, so the shot is not wasted.',
            '**Mind the cap**: a short stack keeps every pot small. Meet a big hand then and you will have to win it over several rounds.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced: survival math and self-snipes',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { title: 'Safety gets harder as players leave', body: 'At five, the 75 line is 25% of the 300 chips: 15 more than you started with. At four it is 75 of 225 (33%), at three 75 of 150 (50%), at two all 75. Getting out early is the easier path, so press your chances in the opening rounds.' },
            { title: 'In a 1:1 the last sniper has the edge', body: 'Heads-up the first player alternates. Sniping second, their snipe caps their hand for you. Sniping first, pass or bluff-snipe to hide yours.' },
            { title: 'Self-snipe for a draw', body: 'When the board alone gives everyone the same hand (say 9 two pair) and your private cards would lose the tie, snipe that hand yourself. Everyone on it ranks last, and if everyone in the showdown is sniped the pot is split. It fails if someone holds a higher hidden pair, so use it when that is unlikely.' },
            { title: 'What a minimum bet means', body: 'With no checking, the opener must bet at least 1, so a 1-chip open says little. The size of the raises after it is the real signal.' },
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'AI and rooms',
        blocks: [
          { type: 'list', items: [
            '**Five players vs AI (normal or hard)** and **1:1 (hard)**. The AI sees only what its seat would: its own cards, the shared cards, every bet and snipe. It never looks at hidden cards.',
            'Normal AI reads opponents’ bets into a guess at their cards and works out its odds and snipes from that. Hard AI also weighs **how its own raises and snipes will be read**, so it hides strong hands and sometimes snipes low.',
            'The AI has 10 personalities and a random few sit down each match. A personality only changes **which of the nearly equally good moves** it picks on top of the same calculation, so none is weaker (200 normal five-player matches: 18–23% eliminated per personality, 20% would be even). The level changes only how deep the calculation goes: in 1:1, hard beats normal about 53% of the time and normal beats easy about 61%. At five players luck weighs more, so hard and normal are close there. With a clearly strong hand the AI bets big (half the pot or more, sometimes all in), and it does not trade 1-chip raises within a betting round.',
            '**Friend and open rooms** seat 2–5. The host chooses whether AI fills empty seats, 60 starting chips (the show) or 24 (quick), and the AI level. Bets and snipes have 30 seconds; after a warning in the last 10 the AI takes the seat until you press "rejoin".',
            'Records: reaching safety is a win, being eliminated a loss. Be **first to safety at a hard AI table** for the hard clear certificate.',
          ] },
        ],
      },
      {
        id: 'reading-opponents',
        level: 'intermediate',
        title: 'Reading your opponents',
        lead: 'In AI matches a random few of 10 personalities sit down, each in a slightly different mood. A few rounds show their habits.',
        blocks: [
          { type: 'p', text: 'For the first two rounds "Today’s table" shows who is playing, with a one-line blurb. The blurb is a hint; the true styles are revealed on the result screen. Until then, read **the hands shown down, what was bet with them, and what each player sniped**. The AI reads you the same way: show a weak hand after a big bet and it trusts your big bets less.' },
          { type: 'cards', items: [
            { title: 'Raises a lot, shows weak hands', body: 'A bluffer (Jinx the trickster, Rex the bulldozer). Do not take big bets at face value, and snipe the hand the board really makes, not the strongest one.' },
            { title: 'Folds and folds, then goes', body: 'The rock (Owl). Now it probably has it: get out of the way, or snipe the board hand it is likely on.' },
            { title: 'Calls everything', body: 'The calling station (Mono) rides weak hands to the end. Bluffs fail; value bets get paid.' },
            { title: 'Snipes every time / almost never', body: 'Luna fires at every chance, so your board hand is often hit. Viper snipes only in big pots, so in small pots a board hand is fairly safe.' },
            { title: 'Snipes below its own hand', body: 'A feint that turns "their hand is just under their snipe" against you. If someone has shown that before, do not read a hand from one snipe.' },
            { title: 'Always the same bet size', body: 'A player who bets the same way with the same hand is easy to read. The AI sometimes plays out of character on purpose, so tells are useful but never certain. Mix yours up too.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'Level and personality are separate', text: 'Easy, normal and hard change only how well a seat calculates (how deeply it reads and simulates); every personality appears at every level. A hard rock folds and snipes more precisely than a normal one.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'First player (선)', def: 'Bets first and snipes first in a round; moves one seat each round.' },
            { term: 'Ante', def: 'What everyone puts in every round: always 1 on the show; on PUZZLTHINK 1 for the first 4 rounds, then rising.' },
            { term: 'Shared cards', def: 'The four cards everyone uses, turned up two at a time.' },
            { term: 'Private cards', def: 'Your two cards, shown at the showdown.' },
            { term: 'Snipe', def: 'Calling a hand by "number + type"; everyone holding it ranks last.' },
            { term: 'Hidden pair', def: 'Two private cards of one number (a pocket pair). Hard to read when the board lacks that number.' },
            { term: 'Cap', def: 'The most one player may put in a round: the smallest stack.' },
            { term: 'Safety line', def: 'The chip count that buys safety. 75 in the show’s five-player game.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: "Is 저격 홀덤 the same as Sniper Hold'em?", a: "Yes. The show (The Devil's Plan: Death Room) called it 저격 홀덤, Sniper Hold'em in English. PUZZLTHINK brings the same rules to the web." },
      { q: 'How do I call a snipe?', a: 'Say the top number of the cards that make the hand and its type: 4-5-6-7-8 is "8 straight", 7-7-5-5 is "7 two pair". A full house is the exception: it goes by its triple (7-7-7-3-3 is "7 full house").' },
      { q: 'Is there a flush?', a: 'No. The cards are four sets of 1–10 with no suits, so there are seven hands: four of a kind, full house, straight, three of a kind, two pair, pair and high card.' },
      { q: 'Can I check?', a: 'No. Every recorded betting round on the show opened with a bet of at least 1. The opener bets 1 or more or folds; everyone after calls, raises or folds.' },
      { q: 'What if everyone is sniped?', a: 'It is a draw: the players in the showdown split the pot evenly, odd chips one each from the first player.' },
      { q: 'Can two or three people play?', a: 'Yes. The safety line is start × players ÷ (players − 1), which keeps the show’s structure: at 60 chips, 90 for three and 120 (every chip) for two.' },
    ],
    cta: { title: 'One good snipe turns the table', body: 'Play five-handed against four AI, 1:1, or in friend and open rooms.', button: "Play Sniper Hold'em" },
    disclaimer: "PUZZLTHINK is an unofficial fan project and is not affiliated with The Devil's Plan, Netflix or the production company. Show names are used only to describe the games.",
  },
};

export default guide;
