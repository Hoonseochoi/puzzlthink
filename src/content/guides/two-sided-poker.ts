// Two-Sided Poker guide. Rules and numbers follow src/lib/twoSidedPoker.ts (TSP_KINDS: 50 front/back pairs of
// opposite parity, TSP_SETS 4 → 200-card shoe reshuffled when it runs out, TSP_START_CHIPS 40, TSP_ANTE 1,
// TSP_DOUBLE_BONUS 10, tspOptions: levels are chips per face, a 양면 bet costs twice, faces lock once chosen, both
// players cannot bet 양면, the max level is what the other side can answer; tspShowdownWinner: a 양면 bettor needs
// both numbers above the other face and loses ties; settle: ties carry, the 10 bonus is paid on a 양면 win at a
// showdown or on a fold against it; tspBackOdds: folded backs stay hidden; the AI PROFILE and TSP_AI_TARGET)
// and src/lib/twoSidedPokerRoom.ts (turn 30/20/45 s, a timeout folds, the third missed turn in a row loses).
// TwoSidedPokerGame.tsx: the AI game has no clock and offers a replay. Inline guide: TwoSidedPokerGuide.
// Back odds were counted from TSP_KINDS (each front has five possible backs, four copies each in a fresh shoe).
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'twoSidedPoker',
  origin: { kind: 'show', show: 'genius3' },
  updated: '2026-11-26',
  related: ['indianPoker', 'hitStay', 'blackWhite2', 'blackWhite'],
  inlineNamespace: 'TwoSidedPokerGuide',
  ko: {
    meta: {
      title: '양면포커 공략 — 뒷면 확률표, 양면베팅 계산, 면 고르기 | PUZZLTHINK',
      description: '더 지니어스 양면포커 공략. 앞면 숫자로 본 상대 뒷면 확률표, 홀짝 규칙, 양면베팅이 이득인 카드와 10칩 보너스, 면을 고르는 순서의 이점, 한 판 따라가기, AI 난이도별 특징까지 정리했어요.',
      keywords: ['양면포커 공략', '양면포커 규칙', '양면베팅', '더 지니어스 양면포커', '양면 포커 전략', '블랙가넷 양면포커', '양면포커 확률', '양면포커 온라인'],
    },
    title: '양면포커 공략',
    lead: '숫자는 두 개, 공개되는 건 하나. 어느 면을 고르느냐가 곧 베팅이에요.',
    intro: [
      '양면포커는 앞뒤에 서로 다른 숫자가 적힌 카드 한 장으로 겨루는 1:1 포커예요. **앞면은 둘 다 보고, 뒷면은 카드 주인만 봐요.** 승부할 면을 고르는 순간 상대에게 정보가 새어 나가고, 상대가 고른 면에서도 그 사람의 뒷면이 보이기 시작해요.',
      '이 공략은 PUZZLTHINK 양면포커의 실제 규칙으로 계산한 뒷면 확률표, 양면베팅이 언제 이득인지, 한 판을 처음부터 끝까지 따라가는 예시, 단계별 전략과 AI 메모를 담았어요.',
    ],
    gamePageTitle: '양면포커 — 앞면과 뒷면, 어느 쪽에 칩을 걸까',
    summary: '앞면으로 본 뒷면 확률표, 홀짝 규칙, 양면베팅 계산, 면 고르기의 정보 싸움.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '양면포커는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '양면포커는 「더 지니어스: 블랙가넷」의 데스매치와 그랜드 파이널에 나온 게임이에요. PUZZLTHINK는 그랜드 파이널 규칙을 웹으로 옮겼어요.' },
          { type: 'p', text: '일반 포커가 "내 패는 알고 상대 패는 모르는" 게임이라면, 양면포커는 서로 절반씩 알고 시작해요. 상대 앞면은 보이니 상대 카드의 반은 알고, 내 뒷면은 숨겨져 있으니 내 카드의 반은 비밀이에요. 그래서 "어느 면으로 승부하느냐"가 그 자체로 신호가 되고, 그 신호를 거꾸로 쓰는 허세가 생겨요.' },
          { type: 'p', text: 'AI(쉬움·보통·어려움)와 바로 둘 수 있고, 친구 방이나 오픈 대전에서 사람과 1:1로 겨룰 수 있어요. 끝난 판은 복기로 한 판씩 다시 볼 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**카드**: 앞면 1~10 각각에, 홀짝이 반대인 뒷면 다섯 가지가 짝지어져 50종이에요. 이걸 4세트 섞어 200장으로 써요. 다 쓰면 새로 섞어요.',
            '**칩**: 두 사람 모두 40개로 시작해요. 판마다 둘 다 기본 1칩을 내요. 칩을 모두 잃으면 져요.',
            '**선**: 선은 판마다 번갈아 맡아요(첫 판은 무작위). 선이 먼저 면(앞면·뒷면·양면)을 고르고 베팅해요. 선은 대신 포기하고 기본 1칩만 내줄 수도 있어요.',
            '**응수**: 상대도 면을 고른 뒤 콜·레이즈·포기 중 하나를 해요. 한 번 고른 면은 그 판 동안 바꿀 수 없어요. 레이즈하면 다시 상대 차례예요.',
            '**공개**: 콜하는 순간 바로 공개해서, 각자 고른 면의 숫자가 큰 쪽이 판돈을 가져가요. 같으면 판돈은 다음 판 승자에게 넘어가요.',
            '**양면베팅**: 두 면 모두로 승부하는 베팅이에요. 칩을 두 배로 걸고, **내 두 숫자가 모두 상대가 고른 면보다 커야** 이겨요. 하나라도 같거나 작으면 져요. 이기면 판돈에 더해 칩 10개를 더 받아요.',
            '**양면베팅 앞의 포기**: 상대가 양면베팅을 했는데 내가 포기하면, 판돈과 별개로 칩 10개를 내줘요.',
          ] },
          { type: 'callout', tone: 'note', title: '홀짝 규칙', text: '한 카드의 앞면과 뒷면은 홀짝이 반드시 달라요. 상대 앞면이 짝수면 뒷면은 1·3·5·7·9 중 하나, 홀수면 2·4·6·8·10 중 하나예요. 그래서 한 카드의 두 숫자는 절대 같지 않아요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '베팅 금액은 어떻게 세나요?', body: '베팅은 "면 하나당 칩 수"예요. 3을 걸면 한 면은 3칩, 양면은 6칩이 나가요. 상대가 내 양면 3에 콜하면 한 면으로 3칩만 내요.' },
            { title: '둘 다 양면베팅을 할 수 있나요?', body: '아니요. 상대가 이미 양면을 골랐다면 나는 앞면이나 뒷면 중 하나만 고를 수 있어요.' },
            { title: '양면베팅에서 비기면?', body: '양면베팅은 같은 숫자도 패배예요. 내 카드가 8/9이고 상대가 8을 골랐다면, 9는 이기지만 8이 같아서 져요.' },
            { title: '한 면끼리 비기면?', body: '판돈이 다음 판으로 넘어가 그 판의 승자가 전부 가져가요. 비김이 이어지면 계속 쌓여요.' },
            { title: '얼마까지 걸 수 있나요?', body: '상대가 받아 줄 수 있는 만큼까지예요. 상대 칩이 적으면 내 칩이 많아도 그 이상은 못 걸어요. 양면은 두 배가 드니 칩의 절반까지만 면당 금액으로 걸 수 있어요.' },
            { title: '양면베팅의 10칩은 언제 오가나요?', body: '양면베팅이 이길 때만이에요. 공개해서 이기든 상대가 포기하든 10칩을 더 받아요(상대 칩이 10개보다 적으면 남은 만큼). 양면베팅이 지면 두 배로 건 칩만 잃고, 10칩을 더 내지는 않아요.' },
            { title: '기본 칩만으로 칩이 바닥나면?', body: '아무도 더 걸 수 없으니 자동으로 각자 큰 면으로 공개해서 승부해요.' },
            { title: '포기하면 상대 뒷면을 볼 수 있나요?', body: '아니요. 포기한 판은 상대 뒷면이 공개되지 않아요. 공개되는 건 콜해서 승부한 판뿐이에요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 상대 앞면으로 뒷면 짐작하기',
        blocks: [
          { type: 'p', text: '상대 앞면이 정해지면 뒷면은 다섯 가지 중 하나예요. 새로 섞은 슈에서는 다섯 가지가 4장씩 같은 비율로 들어 있어요. 아래 표는 그 다섯 가지 중 앞면보다 큰 뒷면이 몇 개인지, 그리고 상대가 둘 중 큰 면을 고른다고 할 때 그 숫자의 평균이에요.' },
          { type: 'table', caption: '상대 앞면별 뒷면 확률 (새 슈 기준)', head: ['상대 앞면', '가능한 뒷면', '뒷면이 더 클 확률', '큰 면의 평균'], rows: [
            ['1', '2·4·6·8·10', '100%', '6.0'],
            ['2', '1·3·5·7·9', '80%', '5.2'],
            ['3', '2·4·6·8·10', '80%', '6.2'],
            ['4', '1·3·5·7·9', '60%', '5.8'],
            ['5', '2·4·6·8·10', '60%', '6.8'],
            ['6', '1·3·5·7·9', '40%', '6.8'],
            ['7', '2·4·6·8·10', '40%', '7.8'],
            ['8', '1·3·5·7·9', '20%', '8.2'],
            ['9', '2·4·6·8·10', '20%', '9.2'],
            ['10', '1·3·5·7·9', '0%', '10.0'],
          ] },
          { type: 'list', items: [
            '**내 큰 면이 상대 큰 면 평균보다 크면 승부**: 상대 앞면이 2인데 내 큰 면이 8이라면, 상대 뒷면이 9일 때(20%)만 져요.',
            '**상대 앞면 10은 피하기**: 상대는 10으로 승부할 수 있으니 내 10과 비기는 게 최선이에요. 선이라면 포기하고 1칩만 내주는 것도 방법이에요.',
            '**내 뒷면이 작으면 앞면으로**: 앞면을 고르면 상대가 이미 아는 숫자로 싸우는 셈이에요. 정보는 새지 않지만, 상대도 계산이 쉬워져요.',
            '**양면베팅은 두 숫자가 다 클 때만**: 50종 중 두 숫자가 모두 7 이상인 카드는 8종(16%), 둘 다 8 이상은 4종(8%)뿐이에요. 애매하면 한 면만 거세요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 7/10 카드로 한 판',
        lead: '양쪽 칩 39개(기본 칩을 낸 뒤), 내가 선이에요.',
        blocks: [
          { type: 'steps', items: [
            { title: '카드 확인', body: '내 카드는 앞면 7, 뒷면 10. 상대 앞면은 4라서 상대 뒷면은 1·3·5·7·9 중 하나예요. 상대 쪽에는 10이 나올 수 없어요.' },
            { title: '면 비교', body: '앞면 7로 걸면 상대 뒷면이 1·3·5일 때 이기고(60%), 7이면 비기고, 9면 져요. 뒷면 10으로 걸면 상대가 무엇을 골라도 **반드시 이겨요**. 양면으로 걸면 두 숫자 중 작은 7이 기준이라, 상대가 뒷면 7이나 9를 고르면 져요(이길 확률 60%).' },
            { title: '선의 베팅: 뒷면 3', body: '확실히 이기는 뒷면을 골랐어요. 다만 크게 걸면 상대가 포기해서 판돈이 작아지니, 면당 3칩으로 작게 열었어요. 상대 눈에는 "앞면 7인 카드가 뒷면으로 걸었다"는 것만 보여요. 앞면 7의 뒷면은 2·4·6·8·10이고 그중 7보다 큰 건 8과 10, 40%예요.' },
            { title: '상대의 레이즈', body: '상대 뒷면은 9였어요. 상대가 보기엔 내 뒷면이 2·4·6·8이면 9가 이기니 80%로 유리해 보여요. 상대는 뒷면을 고르고 면당 8칩으로 올렸어요.' },
            { title: '맞레이즈와 콜', body: '나는 면당 15칩으로 다시 올렸고, 상대가 콜했어요. 공개해 보니 10 대 9, 내가 이겼어요. 판돈은 기본 칩 2 + 15 + 15 = 32칩. 낸 16칩을 빼면 16칩 이득이에요.' },
          ] },
          { type: 'callout', tone: 'tip', title: '이 판에서 배울 점', text: '확실한 판일수록 작게 열어 상대가 따라오게 하는 게 이득이에요. 그리고 상대 입장에서 "앞면 7의 뒷면"은 대부분 7보다 작아 보였어요. 상대가 보는 확률을 같이 계산하면, 상대가 언제 크게 따라올지 예측할 수 있어요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 면 선택이 주는 정보',
        blocks: [
          { type: 'p', text: '선은 면을 먼저 골라야 해서 정보를 먼저 내줘요. 응수하는 쪽은 선의 선택을 보고 자기 면을 고를 수 있어요. 그래서 같은 카드라도 선일 때와 응수할 때의 작전이 달라요.' },
          { type: 'cards', items: [
            { tag: '읽기', title: '뒷면을 고른 상대', body: '앞면을 두고 뒷면을 골랐다면 뒷면이 앞면보다 클 가능성이 높아요. 상대 앞면이 8인데 뒷면을 골랐다면, 뒷면이 9일 확률은 원래 20%지만 실제로는 9이거나 허세라고 보는 게 맞아요.' },
            { tag: '읽기', title: '앞면을 고른 상대', body: '앞면을 골랐다면 뒷면이 더 작거나, 뒷면을 숨기고 싶은 거예요. 앞면 승부는 숫자가 완전히 드러나 있으니 계산이 정확해져요. 내 큰 면이 그 숫자보다 크면 크게 걸어도 돼요.' },
            { tag: '양면', title: '양면베팅은 작게 열기', body: '양면베팅에 상대가 포기하면 10칩이 들어오고, 상대가 콜해서 내가 이겨도 10칩이 더 들어와요. 그래서 양면은 작게 열어 상대를 따라오게 하는 편이 좋아요. 상대 입장에서는 포기도 10칩이라 콜하기 쉬워요.' },
            { tag: '양면 앞에서', title: '상대가 양면베팅을 했다면', body: '포기하면 10칩을 더 내니, 웬만하면 콜해 보세요. 상대가 양면으로 이기려면 두 숫자가 모두 내 숫자보다 커야 해요. 내 큰 면이 상대 앞면보다 크면 그것만으로 상대 양면은 실패예요.' },
          ] },
          { type: 'h3', text: '카운팅: 공개된 카드 세기' },
          { type: 'p', text: '200장에는 같은 카드가 4장씩 있어요. 공개된 판에서는 상대 카드 두 면이 다 보이니, 같은 슈에서 어떤 조합이 빠졌는지 셀 수 있어요. 예를 들어 앞면 4/뒷면 9가 이미 두 장 나왔다면, 다음에 상대 앞면 4가 보일 때 뒷면이 9일 확률은 20%(20장 중 4장)에서 약 11%(18장 중 2장)로 떨어져요. 포기한 판은 뒷면이 공개되지 않으니 셀 수 없어요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 허세와 칩 관리',
        blocks: [
          { type: 'h3', text: '허세는 뒷면으로만' },
          { type: 'p', text: '앞면은 상대가 이미 아는 숫자라 허세가 통하지 않아요. 허세는 숨겨진 뒷면을 고르고 크게 걸 때만 의미가 있어요. 특히 앞면이 6 이상인 카드는 상대 눈에 "앞면도 크니 뒷면은 더 크겠지"라는 인상을 주기 좋아요. 반대로 앞면이 1이면 뒷면은 무조건 앞면보다 커서, 뒷면 승부가 너무 뻔해요.' },
          { type: 'h3', text: '이월된 판돈' },
          { type: 'p', text: '비긴 판돈은 다음 판 승자가 전부 가져가요. 이월이 쌓인 판에서는 기본 칩 1개로 시작해도 판돈이 커서, 선의 포기가 비싸져요. 이런 판에서는 평소보다 넓은 범위로 승부하세요.' },
          { type: 'h3', text: '칩이 적을 때와 많을 때' },
          { type: 'p', text: '베팅 한도는 받는 쪽이 감당할 수 있는 만큼이에요. 칩이 많은 쪽은 매 판 상대 칩 전부를 걸 수 있다는 압박을 주고, 칩이 적은 쪽은 양면베팅 한 번(이기면 10칩 보너스)으로 판을 뒤집을 기회를 노려요. 다만 칩이 10개 남짓일 때 상대의 양면베팅에 포기하면 10칩 벌칙으로 그대로 질 수 있으니 조심하세요.' },
          { type: 'h3', text: '선일 때 포기하는 판' },
          { type: 'p', text: '선은 면을 먼저 보여 줘야 해서 불리해요. 내 큰 면이 상대 앞면보다 작고 상대 앞면이 크다면, 첫 베팅 대신 포기해 1칩만 내주는 게 가장 싼 선택일 때가 많아요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**양면베팅에서 비김을 잊기**: 양면은 같은 숫자도 패배예요. 8/9 카드로 양면을 걸었는데 상대가 8을 고르면 져요.',
            '**양면 앞에서 쉽게 포기하기**: 포기에도 10칩이 따라와요. 이길 가능성이 조금이라도 있으면 콜이 나을 때가 많아요.',
            '**홀짝 규칙을 잊기**: 상대 앞면이 홀수면 뒷면은 짝수예요. 내 숫자와 같은 숫자가 상대 뒷면에 나올 수 있는지부터 확인하세요.',
            '**확실한 판에서 크게 열기**: 이기는 게 확실할 때 크게 걸면 상대가 포기해서 기본 칩만 받아요.',
            '**포기한 판 카드를 셌다고 착각하기**: 포기한 판은 상대 뒷면이 공개되지 않아요. 공개된 판만 세세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구 방, 복기',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['공통', '모든 AI는 내 뒷면을 보지 못해요. 내 앞면, 자기 카드, 자기가 기억하는 슈만으로 판단하고, 절대 이길 수 없는 판에는 칩을 넣지 않아요. 괄호 안 숫자는 실제 대국 기록에서 잰 AI 승률이에요.'],
            ['쉬움 (약 30%)', '슈를 기억하지 않고, 내 면 선택과 베팅 크기도 읽지 않아요. 콜이 많고 허세도 자주 해요.'],
            ['보통 (약 40%)', '슈를 일부 기억하고, 내 선택을 조금 읽어요. 아주 약한 패가 아니면 포기하지 않아요.'],
            ['어려움 (약 50%)', '슈를 정확히 세고, 내가 뒷면이나 양면을 고른 것과 베팅 크기를 읽어요. 약한 패는 선에서 바로 포기하고, 강한 패는 크게 올리고, 양면베팅도 노려요.'],
            ['AI전 시간', 'AI전에는 시간 제한이 없어요. 판이 끝난 뒤 복기로 한 판씩 다시 볼 수 있어요.'],
            ['친구 방·오픈 대전', '링크나 4자리 코드로 1:1 대결해요. 방장이 턴 시간을 20·30·45초 중에서 골라요. 시간이 지나면 자동 포기이고(상대가 양면이면 10칩도 내요), 연속 세 번 놓치면 시간패예요. 내 뒷면은 공개된 판에서만 상대 화면에 보여요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '앞면', def: '모두에게 보이는 숫자.' },
            { term: '뒷면', def: '카드 주인만 보는 숫자. 앞면과 홀짝이 반대예요.' },
            { term: '양면베팅', def: '두 면으로 승부. 칩이 두 배로 들고, 두 숫자 모두 상대 면보다 커야 이겨요. 이기면 10칩 보너스.' },
            { term: '면당 금액', def: '베팅 숫자의 뜻. 한 면은 그대로, 양면은 두 배가 나가요.' },
            { term: '선', def: '먼저 면을 고르고 베팅하는 사람. 판마다 번갈아 맡아요.' },
            { term: '이월', def: '비긴 판돈이 다음 판으로 넘어가는 것.' },
            { term: '슈', def: '50종 × 4세트, 200장 카드 더미. 다 쓰면 새로 섞어요.' },
            { term: '홀짝 규칙', def: '한 카드의 앞면과 뒷면은 홀짝이 반드시 다르다는 규칙.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '양면포커는 어떤 방송에 나온 게임인가요?', a: '「더 지니어스: 블랙가넷」의 데스매치와 그랜드 파이널에 나온 게임이에요. PUZZLTHINK는 그랜드 파이널 규칙을 웹으로 옮겼어요.' },
      { q: '양면베팅은 언제 이기나요?', a: '내 앞면과 뒷면이 모두 상대가 고른 면의 숫자보다 클 때만 이겨요. 하나라도 같거나 작으면 져요. 이기면 판돈에 더해 칩 10개를 더 받아요.' },
      { q: '상대가 양면베팅을 하면 포기해도 되나요?', a: '포기할 수 있지만 판돈과 별개로 칩 10개를 내줘요. 그래서 이길 가능성이 있으면 콜하는 편이 나을 때가 많아요.' },
      { q: '상대 뒷면은 어떻게 짐작하나요?', a: '홀짝 규칙상 상대 뒷면은 앞면과 홀짝이 반대인 다섯 숫자 중 하나예요. 여기에 상대가 고른 면과 베팅 크기, 이미 공개된 카드를 더해 범위를 좁혀요.' },
      { q: '가입해야 하나요?', a: '아니요. 가입 없이 AI와 바로 할 수 있어요. 로그인하면 기록과 랭킹이 남아요.' },
      { q: '친구와 하려면 어떻게 하나요?', a: '게임 첫 화면에서 친구 방을 만들고 링크나 4자리 초대코드를 보내면 돼요. 오픈 대전에서는 모르는 사람과 1:1로 붙을 수 있어요.' },
    ],
    cta: { title: '어느 면에 걸까요?', body: '뒷면 확률표를 떠올리며 AI와 한 판 해 보세요. 끝나면 복기로 승부처를 다시 볼 수 있어요.', button: '양면포커 하러 가기' },
    disclaimer: 'PUZZLTHINK는 더 지니어스 및 관련 방송사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요. 실제 돈을 거는 도박과는 아무 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Two-Sided Poker strategy guide — back odds, double bets and picking a face | PUZZLTHINK',
      description: 'Two-Sided Poker from The Genius: Black Garnet, in depth: the odds of their hidden back by front, the parity rule, when a double bet and its 10-chip bonus pay, the edge of choosing second, a hand played out and what each AI level does.',
      keywords: ['Two-Sided Poker strategy', 'Two-Sided Poker rules', 'The Genius two-sided poker', 'double bet poker', 'Black Garnet poker', 'two-sided poker odds'],
    },
    title: 'Two-Sided Poker strategy guide',
    lead: 'Two numbers, one of them public. Choosing a face is already a bet.',
    intro: [
      "Two-Sided Poker is a one-on-one poker game played with a single card that carries a different number on each side. **Both players see the fronts; only the owner sees the back.** The moment you pick the face you will fight with, you leak information — and the face your opponent picks starts to reveal theirs.",
      "This guide covers back odds computed from PUZZLTHINK's actual card set, when a double bet pays, one hand followed from deal to showdown, strategy by level and notes on the AI.",
    ],
    gamePageTitle: 'Two-Sided Poker — front or back, where do your chips go?',
    summary: 'Back odds by front, the parity rule, double-bet maths and the information fight over faces.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Two-Sided Poker?',
        blocks: [
          { type: 'p', text: 'Two-Sided Poker appeared in the death match and grand final of The Genius: Black Garnet. PUZZLTHINK brings the grand final rules to the web.' },
          { type: 'p', text: 'Normal poker is "I know my hand, not theirs". In Two-Sided Poker each player starts knowing half of everything: you see their front, so half their card is known, and your back is hidden, so half yours is secret. Which face you fight with becomes a signal in itself — and bluffs turn that signal around.' },
          { type: 'p', text: 'Play the AI (Easy, Normal, Hard) right away, or play people one-on-one in friend rooms and open matches. Finished matches can be replayed hand by hand.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Cards**: each front from 1 to 10 is paired with five backs of the opposite parity, giving 50 kinds. Four sets are shuffled into a 200-card shoe, reshuffled when it runs out.',
            '**Chips**: both players start with 40 and ante 1 every hand. Running out of chips loses.',
            '**First player**: alternates every hand (the first hand is random). The first player picks a face (front, back or both) and bets — or folds instead, giving up just the ante.',
            '**The reply**: the other player picks a face and calls, raises or folds. A face cannot be changed once chosen. A raise passes the turn back.',
            '**Showdown**: the moment someone calls, the cards are shown and the higher chosen number takes the pot. Equal numbers carry the pot to the next hand\'s winner.',
            '**Double bet (양면베팅)**: fight with both faces. It costs twice the chips and wins only if **both your numbers beat the face the other side chose**; if either is equal or lower, it loses. A win collects 10 extra chips on top of the pot.',
            '**Folding to a double bet**: if your opponent bets both faces and you fold, you pay 10 chips on top of the pot.',
          ] },
          { type: 'callout', tone: 'note', title: 'The parity rule', text: 'A card\'s front and back always have opposite parity. An even front has a back of 1, 3, 5, 7 or 9; an odd front, 2, 4, 6, 8 or 10. So the two numbers on one card are never equal.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rulings',
        blocks: [
          { type: 'cards', items: [
            { title: 'How are bets counted?', body: 'A bet is "chips per face". Bet 3 and a single face costs 3, a double bet 6. If they call your double 3 with one face, they put in 3.' },
            { title: 'Can both players bet double?', body: 'No. If your opponent already chose both faces, you may pick only the front or the back.' },
            { title: 'A tie on a double bet?', body: 'A double bet loses ties. With an 8/9 card against their 8, the 9 wins but the 8 ties, so the double bet loses.' },
            { title: 'A tie between single faces?', body: 'The pot carries to the next hand and its winner takes all. Repeated ties keep stacking it.' },
            { title: 'How much can I bet?', body: 'As much as the other side can answer. If they are short, your big stack does not help. A double bet costs twice, so its per-face amount is at most half your stack.' },
            { title: 'When do the 10 chips move?', body: 'Only when a double bet wins — at the showdown or because the other side folded (or whatever they have left if under 10). A losing double bet costs only its doubled chips, nothing extra.' },
            { title: 'What if the ante empties a stack?', body: 'Nobody can bet more, so both sides automatically show down with their higher face.' },
            { title: 'Do I see their back when I fold?', body: 'No. Backs are revealed only in hands that went to a showdown.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — guess the back from the front',
        blocks: [
          { type: 'p', text: "Once you see their front, their back is one of five numbers, and in a fresh shoe each comes four times. The table shows how many of those five beat the front, and the average of their higher face if they pick the better one." },
          { type: 'table', caption: 'Back odds by their front (fresh shoe)', head: ['Their front', 'Possible backs', 'Back is higher', 'Average higher face'], rows: [
            ['1', '2·4·6·8·10', '100%', '6.0'],
            ['2', '1·3·5·7·9', '80%', '5.2'],
            ['3', '2·4·6·8·10', '80%', '6.2'],
            ['4', '1·3·5·7·9', '60%', '5.8'],
            ['5', '2·4·6·8·10', '60%', '6.8'],
            ['6', '1·3·5·7·9', '40%', '6.8'],
            ['7', '2·4·6·8·10', '40%', '7.8'],
            ['8', '1·3·5·7·9', '20%', '8.2'],
            ['9', '2·4·6·8·10', '20%', '9.2'],
            ['10', '1·3·5·7·9', '0%', '10.0'],
          ] },
          { type: 'list', items: [
            '**Fight when your higher face beats their average**: against a front of 2, your 8 loses only to a back of 9 (20%).',
            '**Avoid their 10**: they can fight with the 10, so your best result is a tie with your own 10. As first player, folding for 1 chip is an option.',
            '**Small back? Use the front**: fighting with your front uses a number they already know. Nothing leaks, but their calculation is easy too.',
            '**Double only with two big numbers**: of the 50 kinds, only 8 (16%) have both numbers 7 or higher, and 4 (8%) both 8 or higher. When in doubt, bet one face.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — a hand with a 7/10 card',
        lead: 'Both players on 39 chips after the ante; you are first.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Read the cards', body: 'Your card is front 7, back 10. Their front is 4, so their back is 1, 3, 5, 7 or 9 — never a 10.' },
            { title: 'Compare faces', body: 'Front 7 beats backs 1, 3, 5 (60%), ties a 7 and loses to a 9. Back 10 **wins whatever they choose**. A double bet is judged by your smaller number, 7, so it loses if they pick a back of 7 or 9 (60% to win).' },
            { title: 'Your bet: back, 3', body: 'You pick the sure-winning back, but betting big would make them fold and shrink the pot, so you open at 3 a face. All they see is "a front-7 card betting its back". Front 7 has backs 2, 4, 6, 8, 10, and only 8 and 10 are above 7: 40%.' },
            { title: 'They raise', body: 'Their back is 9. From their side your back is 2, 4, 6 or 8 80% of the time, all beaten by 9. They pick the back and raise to 8 a face.' },
            { title: 'Re-raise and call', body: 'You raise to 15 a face and they call. Showdown: 10 against 9, you win. The pot is 2 antes + 15 + 15 = 32, a profit of 16 after your 16.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'What this hand shows', text: 'The surer the hand, the smaller the opening, so they follow. And from their side, the back of a front-7 card usually looked lower than 7. Work out the odds they see as well as yours, and you can predict when they will follow you up.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — what a face choice says',
        blocks: [
          { type: 'p', text: 'The first player picks a face first and so gives information first; the reply comes after seeing that choice. The same card calls for different plans depending on which seat you are in.' },
          { type: 'cards', items: [
            { tag: 'Reading', title: 'They chose the back', body: 'Picking the back over the front suggests the back is higher. With a front of 8, a back of 9 is only 20% a priori, but once they bet the back it is either the 9 or a bluff.' },
            { tag: 'Reading', title: 'They chose the front', body: 'Their back is lower or they want it hidden. A front fight is fully exposed, so your maths is exact: if your higher face beats it, bet big.' },
            { tag: 'Double', title: 'Open double bets small', body: 'A fold pays you 10 and a called win pays 10 extra, so open small and let them follow. For them, folding also costs 10, which makes calling easy.' },
            { tag: 'Facing double', title: 'When they bet double', body: 'Folding costs 10 more, so call when you can. Their double bet needs both numbers above yours: if your higher face beats their front, their double bet has already failed.' },
          ] },
          { type: 'h3', text: 'Counting the shown cards' },
          { type: 'p', text: 'Every card exists four times in the 200. At a showdown both sides of their card are visible, so you can track which pairs have left the shoe. If two 4/9 cards have been shown, the next time they show a front of 4, a back of 9 drops from 20% (4 of 20) to about 11% (2 of 18). Folded hands keep the back hidden and cannot be counted.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — bluffs and chips',
        blocks: [
          { type: 'h3', text: 'Bluff only with the back' },
          { type: 'p', text: 'Your front is a known number, so it cannot bluff. A bluff only means something when you pick the hidden back and bet big. Cards with a front of 6 or more sell "the back must be even bigger" well. With a front of 1 the back is always higher, so a back bet tells them nothing new.' },
          { type: 'h3', text: 'Carried pots' },
          { type: 'p', text: 'A tied pot goes to the next winner, so a hand with carried chips starts big from a 1-chip ante and folding as first player gets expensive. Fight with a wider range in those hands.' },
          { type: 'h3', text: 'Short stack, big stack' },
          { type: 'p', text: 'Bets are capped by what the other side can answer. The big stack can threaten the opponent\'s whole stack every hand; the short stack looks for a double bet (and its 10-chip bonus) to turn things around. But with around 10 chips left, folding to their double bet can end the match on the penalty alone.' },
          { type: 'h3', text: 'Folding as first player' },
          { type: 'p', text: 'The first player has to show a face first. If your higher face is below their high front, folding for 1 chip is often the cheapest choice.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Forgetting double bets lose ties**: an 8/9 double bet against their 8 loses.',
            '**Folding to double bets too easily**: the fold costs 10 more. Any real chance to win usually makes calling better.',
            '**Forgetting parity**: an odd front means an even back. Check whether their back can even match your number.',
            '**Opening sure wins big**: they fold and you collect only the antes.',
            '**Counting folded hands**: their back stays hidden. Count only showdowns.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend rooms, replays',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['All levels', 'No AI sees your back. It decides from your front, its own card and what it remembers of the shoe, and never puts chips into a hand that cannot win. The figures are the AI\'s measured win rates from real matches.'],
            ['Easy (~30%)', 'Remembers nothing of the shoe and does not read your face choice or bet size. Calls a lot and bluffs often.'],
            ['Normal (~40%)', 'Remembers part of the shoe and reads your choice a little. Rarely folds anything but very weak hands.'],
            ['Hard (~50%)', 'Counts the shoe exactly and reads your choice of back or both and your bet size. Folds weak hands as first player, raises strong ones big and goes for double bets.'],
            ['Clock vs AI', 'No time limit. After the match you can replay it hand by hand.'],
            ['Friend rooms and open matches', 'One-on-one by link or 4-digit code. The host picks 20, 30 or 45 seconds a turn. Running out folds automatically (paying 10 against a double bet), and three missed turns in a row lose the match. Your back appears on their screen only in hands that reach a showdown.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Front', def: 'The number everyone sees.' },
            { term: 'Back', def: 'The number only the owner sees; opposite parity to the front.' },
            { term: 'Double bet', def: 'Fight with both faces: twice the chips, both numbers must beat theirs, 10-chip bonus on a win.' },
            { term: 'Per-face amount', def: 'What a bet number means: paid once for one face, twice for both.' },
            { term: 'First player', def: 'Picks a face and bets first; alternates every hand.' },
            { term: 'Carry', def: 'A tied pot moving on to the next hand.' },
            { term: 'Shoe', def: 'The 200-card stack of 50 kinds × 4, reshuffled when used up.' },
            { term: 'Parity rule', def: 'A card\'s front and back are always one odd, one even.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Which show is Two-Sided Poker from?', a: 'The death match and grand final of The Genius: Black Garnet. PUZZLTHINK uses the grand final rules.' },
      { q: 'When does a double bet win?', a: 'Only when both your front and back are higher than the number of the face the other side chose. If either is equal or lower it loses. A win also collects 10 extra chips.' },
      { q: 'Can I fold to a double bet?', a: 'Yes, but you pay 10 chips on top of the pot, so calling is often better when you have any chance to win.' },
      { q: 'How do I guess their back?', a: 'By parity it is one of five numbers of the opposite parity to their front. Narrow it with the face they chose, their bet size and the cards already shown.' },
      { q: 'Do I need an account?', a: 'No. Play the AI right away; sign in to keep records and appear in rankings.' },
      { q: 'How do I play a friend?', a: 'Create a friend room on the start screen and send the link or 4-digit code. Open matches pair you with someone you do not know.' },
    ],
    cta: { title: 'Which face will you bet?', body: 'Keep the back-odds table in mind and play the AI. Replay the match afterwards to find the turning point.', button: 'Play Two-Sided Poker' },
    disclaimer: 'PUZZLTHINK is an unofficial fan project, not affiliated with The Genius or its broadcaster. The programme name is used only to describe the game. It has nothing to do with real-money gambling.',
  },
};

export default guide;
