// Indian Poker guide. Rules and numbers follow src/lib/indianPoker.ts (POKER_DECK 1–10 ×2, POKER_START_CHIPS 20,
// POKER_ANTE 1, maxMatchableBet, pokerWinner, POKER_AI_TARGET, choosePokerAiAction's level profiles) and
// src/lib/indianPokerRoom.ts (deal: reshuffle only when the 20 cards are used up — 10 hands a deck — and the first
// player alternating; bet: the opener must raise past the antes and cannot fold; a call ends the hand; reveal: a tie
// carries the pot unless someone is all in, then it is split; fold: a folded 10 pays min(10, stack) more;
// timeout: the late player folds, and a third timeout without a bet in between loses; turn 30/20/45 s, 30 solo).
// Components: IndianPokerGame (AI levels with ~25/40/55%), IndianPokerParts (PokerHistory: last 10 hands, 10F mark).
// Inline guide: IndianPokerGuide in ko/en.json. Odds counted by hand from the 20-card deck.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'indianPoker',
  origin: { kind: 'show', show: 'genius1' },
  updated: '2026-11-26',
  related: ['twoSidedPoker', 'hitStay', 'blackWhite', 'blackWhite2'],
  inlineNamespace: 'IndianPokerGuide',
  ko: {
    meta: {
      title: '인디언 포커 공략 — 승률표, 덱 카운팅, 10 폴드 페널티 계산 | PUZZLTHINK',
      description: '더 지니어스 인디언 포커 공략. 상대 숫자별 내 승률표, 20장 덱을 10핸드마다 섞는다는 점을 이용한 카운팅, 10을 접을 때의 페널티 기댓값, 상대 베팅으로 내 카드 읽기, 마지막 핸드에 내 카드를 확정하는 법까지 정리했어요.',
      keywords: ['인디언 포커 공략', '인디언 포커 규칙', '인디언 포커 전략', '인디언 포커 확률', '더 지니어스 인디언 포커', '인디언포커 이기는 법', '인디언 포커 10 페널티', '인디언 포커 온라인'],
    },
    title: '인디언 포커 공략',
    lead: '내 카드는 못 보지만, 상대가 내 카드를 보고 움직이는 모습은 볼 수 있어요.',
    intro: [
      '인디언 포커는 각자 카드 한 장을 받아 **자기 카드는 보지 못하고 상대 카드만 보는** 1:1 포커예요. 상대 숫자가 낮을수록 내가 이길 확률이 높지만, 상대도 내 숫자를 보고 베팅하기 때문에 상대의 베팅 하나하나가 곧 내 카드에 대한 힌트이자 함정이 돼요.',
      '이 공략은 PUZZLTHINK 인디언 포커의 실제 규칙을 바탕으로, 상대 숫자별 승률표와 덱 카운팅, 10을 접을 때 드는 페널티의 기댓값, 핸드 하나를 끝까지 따라가는 예시, 단계별 전략과 AI 난이도 메모를 차례로 정리했어요.',
    ],
    gamePageTitle: '인디언 포커 — 상대 숫자로 내 패를 읽는 심리전',
    summary: '상대 숫자별 승률표, 10핸드 덱 카운팅, 10 폴드 페널티 계산, 상대 베팅으로 내 카드 읽기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '인디언 포커는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '자기 카드를 이마에 대고 상대 카드만 보며 베팅하는 방식은 오래전부터 여러 이름으로 즐겨 온 카드 놀이예요. 국내에서는 「더 지니어스: 게임의 법칙」에 등장하면서 "인디언 포커"라는 이름으로 널리 알려졌어요. 카드를 이마에 붙인 모습이 깃털 머리띠를 닮았다고 해서 붙은 이름이에요.' },
          { type: 'p', text: '일반 포커와 정보가 정반대라는 점이 이 게임의 재미예요. 일반 포커에서는 내 패를 알고 상대 패를 추측하지만, 인디언 포커에서는 상대 패를 알고 내 패를 추측해요. 그래서 상대가 크게 걸면 "내 카드가 낮은가?" 하고 의심하게 되고, 그 의심을 이용하는 허세가 생겨요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 세 단계 AI와 1:1로 두거나, 친구에게 링크를 보내 실시간으로 대결할 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**덱과 칩**: 1부터 10까지 카드가 두 장씩, 모두 20장이에요. 두 사람 모두 칩 20개로 시작해요.',
            '**카드 받기**: 핸드마다 한 장씩 받아요. 상대 카드는 보이고, 내 카드는 핸드가 끝날 때까지 볼 수 없어요.',
            '**기본 베팅**: 카드를 받으면 두 사람 모두 1칩을 먼저 팟에 내요.',
            '**선의 첫 베팅**: 선은 반드시 1칩 이상 더 걸어야 해요(총 2칩 이상). 첫 베팅에서 선은 체크도 포기도 할 수 없어요.',
            '**응수**: 상대는 콜(같은 금액으로 맞추기), 레이즈(더 올리기), 폴드(포기) 중에 골라요. 레이즈하면 다시 선에게 차례가 넘어가고, 이렇게 주고받다가 누군가 콜하면 바로 카드를 공개해요.',
            '**승부**: 높은 숫자가 팟을 가져가요. 같은 숫자면 팟이 다음 핸드로 넘어가요.',
            '**10 폴드 페널티**: 내 카드가 10인데 폴드하면, 이미 건 칩과 별개로 칩 10개를 상대에게 더 줘요.',
            '**선 교대와 종료**: 선은 핸드마다 번갈아 맡아요(첫 핸드만 무작위). 칩을 모두 잃은 쪽이 져요.',
          ] },
          { type: 'h3', text: '덱은 10핸드마다 새로 섞여요' },
          { type: 'p', text: '한 핸드에 두 장씩 쓰니, 20장 덱은 정확히 10핸드를 버텨요. 다 쓰기 전에는 다시 섞지 않아요. 핸드가 끝나면 두 카드 모두 공개되고 화면 옆의 기록에 최근 10핸드가 남으니, 같은 덱에서 어떤 숫자가 빠졌는지 셀 수 있어요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '건 칩보다 더 걸 수 있나요?', body: '상대가 맞출 수 없는 금액은 걸 수 없어요. 한 핸드의 최대 금액은 "내 칩 + 이미 건 칩"과 "상대 칩 + 상대가 건 칩" 중 작은 쪽이에요. 칩이 30개라도 상대가 8개뿐이면 그 핸드는 총 8칩이 한계예요.' },
            { title: '10을 들고 폴드했는데 칩이 10개가 안 되면?', body: '남은 칩을 전부 줘요. 그러면 칩이 0이 되어 그대로 경기가 끝나요.' },
            { title: '내 카드가 10인지 어떻게 알고 폴드하나요?', body: '알 수 없어요. 그래서 폴드에는 항상 "혹시 10이면 10칩 더"라는 위험이 따라와요. 새 덱에서 상대가 10이 아닌 카드를 보여 줄 때, 내 카드가 10일 확률은 19장 중 2장, 약 10.5%예요.' },
            { title: '동점 팟은 언제까지 넘어가나요?', body: '다음 핸드의 팟에 그대로 더해지고, 그 핸드의 승자가 전부 가져가요. 다만 한쪽이 올인해서 칩이 0인 상태로 비기면, 다음 핸드를 할 수 없으니 팟을 반씩 나눠요.' },
            { title: '기본 베팅만으로 칩이 바닥나면?', body: '기본 베팅으로 한쪽 칩이 0이 되면 더 걸 수 없으니 곧바로 카드를 공개해 승부해요.' },
            { title: '시간이 다 되면?', body: '내 차례에 시간이 지나면 자동으로 폴드해요(10이었다면 페널티도 내요). 베팅 없이 시간 초과가 세 번째로 쌓이면 시간패예요. 턴 시간은 AI전 30초, 친구 방은 20·30·45초 중에서 골라요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 상대 숫자로 승률 읽기',
        blocks: [
          { type: 'p', text: '새로 섞은 덱에서 상대 카드가 보이면, 내 카드는 남은 19장 중 하나예요. 내 카드가 상대보다 높을 확률은 "상대보다 높은 카드 수 ÷ 19"로 바로 나와요. 같은 숫자는 상대가 쥔 것 말고 한 장만 남아 있어서 비길 확률은 언제나 19장 중 1장(약 5%)이에요.' },
          { type: 'table', caption: '새 덱에서 상대 숫자별 내 승률 (비김 약 5%는 따로)', head: ['상대 카드', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], rows: [['내가 이길 확률', '95%', '84%', '74%', '63%', '53%', '42%', '32%', '21%', '11%', '0%']] },
          { type: 'list', items: [
            '**상대가 1~4면 공격**: 이길 확률이 60%를 넘어요. 선이라면 크게 열고, 상대가 올리면 받아 주세요.',
            '**상대가 5~6이면 신중하게**: 반반 승부예요. 작은 금액으로 상대 반응을 보세요.',
            '**상대가 8~10이면 물러나기**: 이길 확률이 20% 남짓 이하예요. 상대가 크게 올리면 미련 없이 폴드하세요. 상대가 10이면 이길 수 없고, 비겨야 본전이에요.',
            '**폴드의 숨은 비용을 기억하기**: 폴드할 때마다 내가 10일 가능성(약 10%) 때문에 평균 1칩쯤이 더 나간다고 보세요. 낼 칩이 1~2개뿐인 아슬아슬한 상황이라면 콜이 나을 때가 많아요.',
            '**선일 때 최소 베팅**: 선은 첫 베팅에서 포기할 수 없어요. 상대 카드가 높으면 최소 금액(총 2칩)만 열고 넘기세요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 덱 중반의 한 핸드',
        lead: '이번 덱에서 이미 세 핸드가 지나갔어요. 기록에 남은 카드는 9·10, 10·8, 2·5예요.',
        blocks: [
          { type: 'steps', items: [
            { title: '남은 카드 세기', body: '쓰인 카드는 9, 10, 10, 8, 2, 5. 남은 14장은 1·1·2·3·3·4·4·5·6·6·7·7·8·9예요. 10은 두 장 모두 나왔으니 **이번 덱에서는 10 폴드 페널티를 걱정할 필요가 없어요**.' },
            { title: '상대 카드 확인: 7', body: '이번 핸드 상대 카드는 7. 내 카드는 남은 13장(1·1·2·3·3·4·4·5·6·6·7·8·9) 중 하나예요. 이기는 카드는 8과 9로 2장(약 15%), 비기는 7이 1장(약 8%)이에요. 새 덱이라면 32%였을 승률이 큰 숫자가 빠지면서 절반으로 줄었어요.' },
            { title: '선의 첫 베팅', body: '내가 선이에요. 첫 베팅은 포기할 수 없으니 최소 금액인 총 2칩만 걸었어요. 큰 금액을 걸면 상대는 "내 카드가 낮구나" 하고 접을 수도 있지만, 승률 15%에서 허세에 칩을 쓰기엔 아까워요.' },
            { title: '상대의 레이즈', body: '상대가 총 6칩으로 올렸어요. 상대는 내 카드를 보고 있으니, 이 레이즈는 "네 카드가 낮다"는 신호일 가능성이 커요. 콜하려면 4칩을 더 내서 총 12칩짜리 팟을 노리는 셈이라 승률이 33%는 있어야 하는데, 내 승률은 15%(비김 포함해도 20% 남짓)예요.' },
            { title: '폴드와 공개', body: '폴드해서 2칩만 잃었어요. 공개된 내 카드는 3. 상대의 레이즈는 진짜였어요. 10이 모두 빠진 덱이라 폴드 페널티 걱정도 없었죠.' },
          ] },
          { type: 'callout', tone: 'tip', title: '같은 덱이 계속되는 동안', text: '이 덱에는 이제 3·7이 빠지고 12장이 남아요. 다음 핸드부터는 큰 숫자가 9와 8 하나씩뿐이라, 상대가 5만 보여 줘도 내 승률은 생각보다 낮아요. 이 덱의 열 번째 핸드가 끝날 때까지 계속 세어 두세요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 상대 베팅으로 내 카드 읽기',
        blocks: [
          { type: 'p', text: '상대는 내 카드를 보고 베팅해요. 그러니 상대의 베팅은 내 카드에 대한 상대의 평가예요. 확률표가 "상대 카드로 본 내 승률"이라면, 중급부터는 여기에 "상대가 내 카드를 보고 어떻게 행동했는가"를 더해요.' },
          { type: 'cards', items: [
            { tag: '읽기', title: '큰 레이즈 = 내 카드가 낮다?', body: '상대가 내 카드를 보고 크게 올렸다면 내 카드가 낮을 가능성이 커요. 반대로 상대가 최소 금액만 걸거나 바로 콜하면 내 카드가 높아서 조심하는 걸 수 있어요. 다만 상대도 이걸 알고 허세를 섞으니, 한 번의 행동보다 여러 핸드에 걸친 습관을 보세요.' },
            { tag: '팟 오즈', title: '콜에 필요한 승률', body: '콜할 칩 ÷ 콜한 뒤 전체 팟이 필요한 승률이에요. 상대가 2칩에서 6칩으로 올렸다면 4칩을 내고 12칩 팟을 노리니 33%가 필요해요. 여기에 폴드 페널티 위험을 더하면, 아슬아슬할 땐 콜 쪽이 조금 더 유리해져요.' },
            { tag: '카운팅', title: '덱 단위로 세기', body: '덱은 10핸드마다 바뀌어요. 같은 덱에서 9와 10이 일찍 나오면 남은 핸드는 낮은 숫자 싸움이 되고, 1과 2가 일찍 나오면 상대의 중간 숫자도 무서워져요. 10이 두 장 다 나오면 그 덱이 끝날 때까지 폴드가 공짜가 돼요.' },
            { tag: '이월', title: '동점 팟이 쌓이면', body: '비기면 팟이 다음 핸드로 넘어가요. 다음 핸드는 시작부터 팟이 크니, 같은 승률이라도 콜할 가치가 커지고 폴드의 손해도 커져요. 이월된 핸드에서는 평소보다 한 단계 더 버텨 보세요.' },
          ] },
          { type: 'p', text: '선은 핸드마다 바뀌어요. 선은 반드시 먼저 걸어야 해서 정보를 먼저 내주는 자리예요. 상대 카드가 높을 때 선이 되면 최소 금액으로 열고, 상대가 선일 때는 상대의 첫 금액을 보고 내 카드를 짐작하세요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 마지막 핸드와 허세의 크기',
        blocks: [
          { type: 'h3', text: '덱의 마지막 핸드는 내 카드를 알 수 있어요' },
          { type: 'p', text: '20장 덱의 열 번째 핸드에서는 앞의 18장이 모두 공개되어 있어요. 남은 두 장 중 하나를 상대가 쥐고 있으니, **내 카드는 나머지 한 장으로 정해져요**. 아홉 번째 핸드도 남은 4장 중 상대 것을 빼면 세 장 중 하나예요. 덱을 끝까지 세어 온 사람에게 마지막 핸드는 확실한 승부처예요. 기록에는 최근 10핸드가 남으니 덱이 몇 번째 핸드인지 놓치지 마세요.' },
          { type: 'h3', text: '허세는 상대가 접고 싶은 상황에서' },
          { type: 'p', text: '상대는 내 카드만 보고 자기 카드를 추측해요. 내 카드가 높게 보이는 상황(상대 눈에 내가 8~9)에서 내가 크게 걸면, 상대는 "내 카드도 낮은가 보다"라고 생각하기 쉬워요. 이때 상대가 접으면 상대가 10을 쥐었을 때 10칩 페널티까지 받아 와요. 반대로 상대 눈에 내 카드가 1~2라면 상대는 거의 접지 않으니 허세가 통하지 않아요.' },
          { type: 'h3', text: '칩 차이로 압박하기' },
          { type: 'p', text: '한 핸드의 최대 금액은 적게 가진 쪽의 칩까지예요. 내가 칩을 많이 쥐고 있으면 매 핸드 상대 칩 전부를 걸 수 있다는 압박을 줄 수 있어요. 상대 칩이 10개 남짓까지 줄면 10 폴드 페널티 한 번으로도 끝날 수 있어서, 상대는 폴드하기 점점 어려워져요. 이때는 높은 카드가 보이는 핸드에서도 큰 베팅으로 상대에게 콜이냐 폴드냐를 강요해 보세요.' },
          { type: 'h3', text: '베팅 크기를 섞기' },
          { type: 'p', text: '상대 카드가 낮을 때만 크게 걸면, 상대는 내 베팅 크기로 자기 카드를 정확히 읽어요. 좋은 핸드에서도 가끔 작게, 나쁜 핸드에서도 가끔 크게 걸어서 내 베팅이 상대 카드의 신호가 되지 않게 하세요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**덱이 섞이는 시점을 잊기**: 덱은 10핸드마다 새로 섞여요. 지난 덱의 카드를 이번 덱 계산에 넣으면 승률이 엉망이 돼요.',
            '**상대 10 앞에서 버티기**: 상대가 10이면 내가 이길 방법은 없어요. 비겨야 본전이니 상대가 올리면 접으세요.',
            '**폴드를 공짜로 생각하기**: 폴드할 때마다 내가 10일 수 있어요. 낼 칩이 아주 적은 상황에서 접으면 오히려 손해일 때가 있어요.',
            '**상대의 베팅을 무시하기**: 상대는 내 카드를 보고 있어요. 확률표만 믿고 상대의 큰 레이즈에 계속 콜하면 낮은 카드로 큰 팟을 잃기 쉬워요.',
            '**늘 같은 크기로 걸기**: 베팅 크기가 상대 카드에 따라 일정하면, 상대에게 그 카드의 세기를 알려 주는 셈이에요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI 난이도와 친구 대전',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['쉬움 (약 25%)', '공개된 카드를 거의 기억하지 않고, 판단 실수가 잦아요. 낮은 카드 앞에서 접거나 높은 카드 앞에서 무리하게 거는 일이 있어요. 괄호 안 숫자는 실제 대국 기록에서 잰 AI 승률이에요.'],
            ['보통 (약 40%)', '공개된 카드를 일부 기억하고 팟 오즈를 따져요. 상대의 베팅도 조금은 읽어요.'],
            ['어려움 (약 55%)', '남은 덱을 정확히 세고, 팟 오즈·칩 압박·10 페널티 위험까지 계산해요. 상대의 큰 레이즈를 "내 카드가 낮다"는 신호로 읽지만, 사람이 허세를 섞는다는 것도 감안해요. 허세도 적당히 섞어요.'],
            ['AI전 시간', '턴마다 30초예요. 시간이 지나면 자동 폴드예요.'],
            ['친구 방', '링크로 초대해 1:1로 대결해요. 방장이 턴 시간을 20·30·45초 중에서 골라요. 각자 화면에는 상대 카드만 보이고, 내 카드는 핸드가 끝날 때 공개돼요.'],
          ] },
          { type: 'callout', tone: 'note', title: '카드 운의 비중', text: '같은 실력이라도 카드에 따라 결과가 크게 달라지는 게임이에요. 어려움 AI도 승률이 55% 정도인 이유예요. 한 판보다는 여러 판의 결과로 실력을 가늠해 보세요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '기본 베팅', def: '핸드마다 두 사람이 먼저 내는 1칩. 폴드해도 돌려받지 못해요.' },
            { term: '선', def: '핸드에서 먼저 거는 사람. 첫 베팅은 반드시 1칩 이상 올려야 해요. 핸드마다 번갈아 맡아요.' },
            { term: '콜', def: '상대가 건 금액에 맞추기. 콜하면 바로 카드를 공개해요.' },
            { term: '레이즈', def: '상대보다 더 걸기. 상대가 맞출 수 있는 금액까지만 돼요.' },
            { term: '폴드', def: '포기하기. 이미 건 칩은 상대가 가져가고, 내 카드가 10이면 10칩을 더 줘요.' },
            { term: '이월', def: '비긴 핸드의 팟이 다음 핸드로 넘어가는 것.' },
            { term: '팟 오즈', def: '콜할 칩 ÷ 콜한 뒤 팟. 콜이 이득이 되는 최소 승률이에요.' },
            { term: '카운팅', def: '같은 덱에서 이미 나온 카드를 세어 남은 카드를 좁히는 것.' },
            { term: '10F', def: '기록판에서 10을 들고 폴드한 핸드에 붙는 표시.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '내 카드는 정말 볼 수 없나요?', a: '네. 핸드가 끝날 때만 공개돼요. 친구 대전에서도 내 화면에는 상대 카드만 보여요.' },
      { q: '같은 숫자가 나오면 어떻게 되나요?', a: '팟이 다음 핸드로 넘어가 그 핸드의 승자가 모두 가져가요. 한쪽이 올인한 상태로 비기면 팟을 반씩 나눠요.' },
      { q: '10을 들고 폴드하면 얼마를 잃나요?', a: '이미 건 칩에 더해 칩 10개를 상대에게 줘요. 칩이 10개보다 적으면 남은 칩을 모두 주고 경기가 끝나요.' },
      { q: '덱은 언제 다시 섞이나요?', a: '20장을 다 쓸 때, 즉 10핸드마다 섞어요. 그 전까지는 이미 나온 카드를 세어 승률을 계산할 수 있어요.' },
      { q: '선은 포기할 수 있나요?', a: '선의 첫 베팅은 반드시 1칩 이상 올려야 해서 포기할 수 없어요. 상대가 레이즈한 뒤에는 포기할 수 있어요.' },
      { q: '어떤 난이도부터 시작하면 좋을까요?', a: '처음엔 쉬움으로 승률표에 익숙해지고, 카운팅이 손에 익으면 보통과 어려움으로 올려 보세요.' },
    ],
    cta: { title: '상대 카드부터 보고 시작해요', body: '승률표와 카운팅을 떠올리며 AI와 한 판 해 보세요. 한 핸드는 30초면 끝나요.', button: '인디언 포커 하러 가기' },
    disclaimer: 'PUZZLTHINK는 더 지니어스 및 관련 방송사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요. 실제 돈을 거는 도박과는 아무 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Indian Poker strategy guide — win odds, deck counting and the 10-fold penalty | PUZZLTHINK',
      description: "Indian Poker from The Genius, in depth: your win chance against every visible card, counting a 20-card deck that lasts exactly 10 hands, the expected cost of folding a hidden 10, reading your own card from their bets, and knowing it outright on a deck's last hand.",
      keywords: ['Indian Poker strategy', 'Indian Poker rules', 'Indian Poker odds', 'The Genius Indian Poker', 'blind man\'s bluff poker', 'how to win Indian Poker'],
    },
    title: 'Indian Poker strategy guide',
    lead: 'You cannot see your card — but you can watch your opponent react to it.',
    intro: [
      "Indian Poker is a one-card, one-on-one poker game in which **you see your opponent's card but never your own**. The lower their number, the better your chances, but they are looking at your card while they bet, so every bet they make is both a hint about your card and a possible trap.",
      "Built on PUZZLTHINK's actual rules, this guide covers the win-chance table, counting the deck, the expected cost of folding when you might hold a 10, one hand followed to the end, strategy by level and notes on the AI.",
    ],
    gamePageTitle: 'Indian Poker — read your own hand through theirs',
    summary: 'Win odds by visible card, counting a 10-hand deck, the 10-fold penalty, reading your card from their bets.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Indian Poker?',
        blocks: [
          { type: 'p', text: 'Holding your card to your forehead and betting on what you see of everyone else is an old parlour game known by several names. In Korea it became widely known as "Indian Poker" after it appeared on The Genius: Rules of the Game; the name comes from the card on the forehead looking like a feather headband.' },
          { type: 'p', text: 'What makes it interesting is that the information is the reverse of normal poker. Normally you know your hand and guess theirs; here you know theirs and guess yours. A big bet from them makes you wonder "is my card low?" — and that doubt is exactly what a bluff exploits.' },
          { type: 'p', text: 'On PUZZLTHINK you can play one-on-one against three AI levels or send a friend a link and play in real time.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Deck and chips**: two of each card from 1 to 10, 20 cards in all. Both players start with 20 chips.',
            '**The deal**: one card each per hand. You see your opponent\'s card; yours stays hidden until the hand ends.',
            '**Ante**: both players put 1 chip in the pot as soon as the cards are dealt.',
            '**The opening bet**: the first player must add at least 1 chip (2 or more in total). On that opening bet they can neither check nor fold.',
            '**The reply**: the other player calls (matches), raises or folds. A raise passes the turn back, and the moment someone calls, both cards are shown.',
            '**The showdown**: the higher card takes the pot. Equal cards carry the pot to the next hand.',
            '**The 10-fold penalty**: if you fold while holding a 10, you pay 10 more chips to your opponent on top of what you bet.',
            '**Turns and the end**: the first player alternates every hand (the first hand is random). Whoever runs out of chips loses.',
          ] },
          { type: 'h3', text: 'The deck is reshuffled every 10 hands' },
          { type: 'p', text: 'Each hand uses two cards, so the 20-card deck lasts exactly 10 hands and is not reshuffled before it runs out. Both cards are shown at the end of every hand and the history beside the table keeps the last 10 hands, so you can count what has left the current deck.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rulings',
        blocks: [
          { type: 'cards', items: [
            { title: 'Can I bet more than they can match?', body: 'No. The most a hand can reach is the smaller of "my chips + my bet" and "their chips + their bet". With 30 chips against an opponent holding 8, the hand tops out at 8.' },
            { title: 'Folding a 10 with fewer than 10 chips?', body: 'You pay everything you have left, which takes you to 0 and ends the match.' },
            { title: 'How would I know I am folding a 10?', body: 'You cannot. Every fold carries the risk of "10 more if it was a 10". From a fresh deck, when your opponent shows anything but a 10, your card is a 10 with probability 2 in 19, about 10.5%.' },
            { title: 'How long does a tied pot carry?', body: 'It is added to the next hand\'s pot and that hand\'s winner takes all of it. If one player is all in at 0 chips when the tie happens, there can be no next hand, so the pot is split in half.' },
            { title: 'What if the ante empties a stack?', body: 'Nobody can bet further, so the cards are shown at once.' },
            { title: 'What happens when time runs out?', body: 'You fold automatically (and pay the penalty if it was a 10). A third timeout with no bet of yours in between loses the match. Turns are 30 seconds against the AI; friend rooms choose 20, 30 or 45.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — read your odds from their card',
        blocks: [
          { type: 'p', text: "From a fresh deck, once you see their card, yours is one of the other 19. Your chance of being higher is simply \"cards above theirs ÷ 19\". Only one card of their number is left besides theirs, so a tie is always 1 in 19 (about 5%)." },
          { type: 'table', caption: 'Your win chance by their card, fresh deck (ties of ~5% aside)', head: ['Their card', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], rows: [['You win', '95%', '84%', '74%', '63%', '53%', '42%', '32%', '21%', '11%', '0%']] },
          { type: 'list', items: [
            '**They show 1–4: attack.** You win more than 60% of the time. Open big when you are first and take their raises.',
            '**They show 5–6: careful.** A coin flip. Bet small and watch how they respond.',
            '**They show 8–10: back off.** You win about 20% or less. Fold to a big raise without regret. Against a 10 you cannot win; a tie is the best case.',
            '**Remember the hidden cost of folding.** Because you hold a 10 about 10% of the time, every fold costs roughly one extra chip on average. When calling costs only 1–2 chips, calling is often better.',
            '**Minimum opens.** The first player cannot fold the opening bet. Against a high card, open with the minimum (2 in total) and pass the decision over.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — a hand in the middle of a deck',
        lead: 'Three hands of this deck have been played. The history shows 9·10, 10·8 and 2·5.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Count the remaining cards', body: 'Used: 9, 10, 10, 8, 2, 5. The 14 left are 1·1·2·3·3·4·4·5·6·6·7·7·8·9. Both 10s are gone, so **for the rest of this deck the 10-fold penalty cannot hit you**.' },
            { title: 'Their card: 7', body: 'Yours is one of the 13 others (1·1·2·3·3·4·4·5·6·6·7·8·9). Only the 8 and 9 beat it — about 15% — and the other 7 ties (about 8%). With a fresh deck it would have been 32%; the missing high cards halved it.' },
            { title: 'Your opening bet', body: 'You are first and cannot fold the opener, so you bet the minimum: 2 in total. A big bet might convince them their own card is low, but a 15% hand is a poor place to spend chips on a bluff.' },
            { title: 'They raise', body: 'They raise to 6. They can see your card, so the raise most likely says "your card is low". Calling means adding 4 for a 12-chip pot, which needs 33%; you have about 15% (just over 20% counting ties).' },
            { title: 'Fold and reveal', body: 'You fold and lose 2. Your card was a 3 — their raise was real. And with both 10s gone, the fold carried no penalty risk.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'While the same deck lasts', text: 'The 3 and 7 are now gone too, leaving 12 cards, and the only high cards left are one 9 and one 8. Even a 5 from them is scarier than it looks. Keep counting until the tenth hand of this deck is over.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — read your card from their bets',
        blocks: [
          { type: 'p', text: 'Your opponent bets while looking at your card, so their bet is their opinion of your card. The table tells you your odds from their card; from here on, add what their behaviour says about yours.' },
          { type: 'cards', items: [
            { tag: 'Reading', title: 'Big raise = my card is low?', body: 'A big raise after looking at your card suggests it is low. A minimum bet or a quick call can mean your card is high and they are being careful. They know you read this too and mix in bluffs, so trust habits across hands more than any single action.' },
            { tag: 'Pot odds', title: 'The chance a call needs', body: 'Chips to call ÷ the pot after calling. If they raise from 2 to 6, you add 4 for a 12-chip pot: 33%. Add the fold-penalty risk and close calls lean slightly towards calling.' },
            { tag: 'Counting', title: 'Count by the deck', body: 'The deck changes every 10 hands. If 9s and 10s come out early, the rest of the deck is a low-card fight; if 1s and 2s go early, even their middling cards are dangerous. Once both 10s are out, folding is free until the deck ends.' },
            { tag: 'Carry', title: 'When ties pile up', body: 'A tie carries the pot over, so the next hand starts big: the same odds make calling worth more and folding cost more. Hold on one step longer than usual in a carried hand.' },
          ] },
          { type: 'p', text: 'The first seat alternates. The first player has to bet first and so gives information first. When you are first against a high card, open with the minimum; when they are first, use their opening size to guess your card.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — the last hand and sizing bluffs',
        blocks: [
          { type: 'h3', text: 'On the last hand of a deck you know your card' },
          { type: 'p', text: "On the tenth hand of a deck, 18 cards have already been shown. Two remain and your opponent holds one, so **yours is the other**. On the ninth hand it is one of three. For someone who has counted the whole deck, the last hand is a sure thing. The history keeps the last 10 hands — do not lose track of where the deck is." },
          { type: 'h3', text: 'Bluff when they want to fold' },
          { type: 'p', text: 'They only see your card and guess their own. When your card looks high to them (an 8 or 9), a big bet from you makes them think their card is low too. If they fold while holding a 10, you collect the 10-chip penalty as well. When they see a 1 or 2 on you, they almost never fold, so bluffing does nothing.' },
          { type: 'h3', text: 'Pressure with a chip lead' },
          { type: 'p', text: 'A hand can only go as high as the shorter stack. With the bigger stack you can threaten their whole stack every hand. Once they are down to around 10 chips, a single folded 10 can end it, so folding gets harder and harder for them. Use big bets even on hands where you see a high card to force a call-or-fold decision.' },
          { type: 'h3', text: 'Mix your sizes' },
          { type: 'p', text: 'If you only bet big when their card is low, your bet size tells them exactly what they hold. Bet small with good spots now and then and big with bad ones, so your bets stop being a signal.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Losing track of the reshuffle**: the deck changes every 10 hands. Counting the previous deck\'s cards ruins the odds.',
            '**Hanging on against a 10**: you cannot beat it; a tie is the best case. Fold when they raise.',
            '**Treating folds as free**: you might be folding a 10. Folding when the call is tiny can be the bigger loss.',
            '**Ignoring their bets**: they can see your card. Calling every big raise because the table looked good loses big pots with low cards.',
            '**Always betting the same way**: if your size tracks their card, you are telling them what they hold.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI levels and friend matches',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['Easy (~25%)', 'Barely remembers shown cards and makes frequent mistakes: folding against low cards, overbetting against high ones. The figure is the AI\'s measured win rate from real matches.'],
            ['Normal (~40%)', 'Remembers some shown cards and weighs pot odds; reads your bets a little.'],
            ['Hard (~55%)', 'Counts the remaining deck exactly and weighs pot odds, stack pressure and the 10-fold risk. Reads big raises as a sign its card is low, allowing for human bluffs, and bluffs at a measured rate itself.'],
            ['Clock vs AI', '30 seconds a turn; running out folds automatically.'],
            ['Friend rooms', 'One-on-one by invite link. The host picks 20, 30 or 45 seconds a turn. Each screen shows only the other player\'s card; yours is revealed when the hand ends.'],
          ] },
          { type: 'callout', tone: 'note', title: 'How much is luck', text: 'Cards swing results a lot even between equal players, which is why even Hard wins only about 55%. Judge your play over several matches, not one.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Ante', def: 'The 1 chip both players put in at the start of every hand; lost on a fold.' },
            { term: 'First player', def: 'Bets first and must raise by at least 1 on the opener; alternates every hand.' },
            { term: 'Call', def: 'Match their bet; the cards are shown at once.' },
            { term: 'Raise', def: 'Bet more than them, up to what they can match.' },
            { term: 'Fold', def: 'Give up; your bet goes to them, plus 10 chips if your card was a 10.' },
            { term: 'Carry', def: 'A tied pot moving to the next hand.' },
            { term: 'Pot odds', def: 'Chips to call ÷ the pot after calling — the least win chance a call needs.' },
            { term: 'Counting', def: 'Tracking the cards already used from the current deck.' },
            { term: '10F', def: 'The history mark on a hand where a 10 was folded.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Can I really not see my own card?', a: 'No — it is shown only when the hand ends. In friend matches, too, your screen shows only their card.' },
      { q: 'What if both cards are equal?', a: 'The pot carries to the next hand and its winner takes everything. If one player is all in during the tie, the pot is split.' },
      { q: 'How much does folding a 10 cost?', a: 'Ten chips to your opponent on top of what you bet. With fewer than 10 chips, you pay them all and the match ends.' },
      { q: 'When is the deck reshuffled?', a: 'When all 20 cards are used — every 10 hands. Until then you can count the cards already shown.' },
      { q: 'Can the first player fold?', a: 'Not on the opening bet, which must raise by at least 1 chip. After a raise from the opponent, yes.' },
      { q: 'Which level should I start with?', a: 'Easy, to get used to the odds table; move up to Normal and Hard once counting feels natural.' },
    ],
    cta: { title: 'Start by looking at their card', body: 'Keep the odds table and the count in mind and play the AI. A hand takes about 30 seconds.', button: 'Play Indian Poker' },
    disclaimer: 'PUZZLTHINK is an unofficial fan project, not affiliated with The Genius or its broadcaster. The programme name is used only to describe the game. It has nothing to do with real-money gambling.',
  },
};

export default guide;
