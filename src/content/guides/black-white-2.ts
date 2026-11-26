// Black & White II guide. Rules and numbers follow src/lib/blackWhite2.ts (BW2_MAIN_POINTS 99, 9 main rounds,
// BW2_WIN_SCORE 5, bw2ColorOf: under 10 black, bw2GaugeOf: five 20-point bands, bw2NextLeader, bw2IsOver: 5 wins
// or 9 rounds, a tie goes to an overtime of 33 points over at most 3 rounds, bw2WinnerOf on the total score so an
// overtime can end level; chooseBw2AiBid: easy by feel, normal 120 / hard 500 play-outs on the rival's bank range;
// readBw2Round labels) and src/lib/blackWhite2Room.ts (the leader's gauge updates before the reply, turns of
// 30/45/60 s, an automatic bid of up to twice a fair share on timeout, the third in a row loses; bids and
// remaining points redacted for the other seat). Inline guide: BlackWhite2Guide in ko/en.json.
// Bid ranges in the walkthrough were worked out from colour + result + gauge, as the AI's rivalBankRange does.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'blackWhite2',
  origin: { kind: 'show', show: 'genius3' },
  updated: '2026-11-26',
  related: ['blackWhite', 'twoSidedPoker', 'indianPoker', 'heavy13'],
  inlineNamespace: 'BlackWhite2Guide',
  ko: {
    meta: {
      title: '흑과 백 II 공략 — 99포인트 배분, 표시등 읽기, 연장전 | PUZZLTHINK',
      description: '흑과 백 II 공략. 99포인트를 9라운드에 나누는 예산 계산, 흑(0~9)과 백(10 이상)의 의미, 표시등 다섯 구간으로 상대 입찰 범위 좁히기, 흑에 10으로 답하기, 33포인트 연장전과 무승부, AI 난이도별 특징까지 정리했어요.',
      keywords: ['흑과 백 2 공략', '흑과백 2 공략', '흑과 백 II 규칙', '흑과 백 2 전략', '더 지니어스 흑과 백 2', '흑과 백 블라인드 입찰', '흑과백2 필승법'],
    },
    title: '흑과 백 II 공략',
    lead: '정확한 숫자는 숨기고, 색과 표시등만 보여 주는 입찰 싸움이에요.',
    intro: [
      '흑과 백 II는 두 사람이 99포인트씩 들고 최대 아홉 라운드에 걸쳐 몰래 입찰하는 게임이에요. 더 많이 낸 쪽이 그 라운드를 가져가고, 먼저 5승을 하면 이겨요. 상대가 낸 정확한 숫자는 보이지 않고, **한 자리(0~9)면 흑, 두 자리(10 이상)면 백**이라는 색과, 남은 포인트를 20 단위로 보여 주는 다섯 칸 표시등만 보여요.',
      '이 공략에서는 5승까지의 예산 계산, 색과 표시등으로 상대 입찰 범위를 좁히는 방법을 실제 라운드로 따라가 보고, 단계별 전략, 연장전, AI와 친구전 메모를 정리했어요.',
    ],
    gamePageTitle: '흑과 백 II — 표시등 사이의 숫자를 읽는 심리전',
    summary: '5승까지의 예산 계산, 흑과 백의 의미, 표시등으로 입찰 범위 좁히기, 33포인트 연장전.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '흑과 백 II는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '흑과 백 II는 「더 지니어스: 블랙가넷」에 소개된 게임 방식을 바탕으로 만든 2인 블라인드 입찰 게임이에요. 0~8 타일로 하는 흑과 백과 이름은 같지만, 정해진 타일 대신 **포인트를 원하는 만큼** 낸다는 점이 달라요.' },
          { type: 'p', text: '타일이 정해진 흑과 백은 "어떤 패를 언제 쓰느냐"의 게임이라면, II는 "얼마를 어디에 쓰느냐"의 게임이에요. 같은 1승이라도 11로 10을 이기는 것과 40으로 10을 이기는 것은 남은 예산이 29나 차이 나요. 그래서 이기는 법만큼 **싸게 지는 법**이 중요해요.' },
          { type: 'p', text: 'AI와 3단계 난이도로 두거나, 초대 링크·4자리 코드로 친구와 1:1 대결할 수 있어요. 끝나면 모든 숫자를 공개하는 복기와 라운드별 해설이 나와요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**포인트**: 두 사람 모두 99포인트로 시작해요. 라운드마다 0부터 남은 전부까지 원하는 만큼 내고, 낸 포인트는 사라져요.',
            '**선과 후**: 1라운드 선은 무작위예요. 선이 먼저 포인트를 확정하면 색(0~9 흑, 10 이상 백)이 공개되고, **선의 표시등이 곧바로 갱신돼요**. 후는 그 색과 표시등을 보고 포인트를 내요.',
            '**승부**: 더 많이 낸 쪽이 1승이고 다음 라운드의 선이 돼요. 같으면 아무도 승을 얻지 못하고 방금 선이 다시 선이에요.',
            '**표시등**: 남은 포인트를 0~19, 20~39, 40~59, 60~79, 80~99의 다섯 구간으로 보여 줘요. 0포인트가 남아도 첫 칸은 켜져 있어요. 정확한 잔여 포인트는 본인만 알아요.',
            '**승리**: 먼저 5승을 하면 그 즉시 이겨요. 9라운드가 끝나면 승이 많은 쪽이 이겨요.',
            '**연장전**: 9라운드 뒤 승이 같으면 남은 포인트는 모두 사라지고, 둘 다 새로 33포인트를 받아 최대 3라운드를 더 해요. 먼저 2승을 하면 이기고, 3라운드 뒤에도 같으면 무승부예요.',
          ] },
          { type: 'table', caption: '선이 99에서 입찰했을 때, 표시등으로 알 수 있는 입찰 범위', head: ['입찰 뒤 표시등', '5칸', '4칸', '3칸', '2칸', '1칸'], rows: [['남은 포인트', '80~99', '60~79', '40~59', '20~39', '0~19'], ['입찰 범위', '0~19', '20~39', '40~59', '60~79', '80~99']] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '0을 내도 되나요?', body: '네. 0은 흑으로 보이고 포인트도 줄지 않아요. 상대가 0을 내야 비기고 그 외에는 져요. 대신 상대가 백이나 큰 수를 쓰게 만드는 미끼가 돼요.' },
            { title: '흑에는 10이면 무조건 이기나요?', body: '흑은 0~9이니, 후가 10을 내면 반드시 이겨요. 다만 상대가 0이었다면 10을 주고 1승을 산 셈이에요. 9를 내면 9를 뺀 모든 흑을 이기고, 상대도 9면 비겨요.' },
            { title: '표시등은 언제 바뀌나요?', body: '선이 입찰을 확정하는 즉시 선의 표시등이 바뀌어서, 후는 답을 내기 전에 그 변화를 봐요. 후의 표시등은 라운드가 끝날 때 바뀌어요.' },
            { title: '비기면 포인트는요?', body: '두 사람 모두 낸 만큼 잃어요. 승은 아무도 얻지 못하고 선은 그대로예요.' },
            { title: '연장전에 남은 포인트를 가져가나요?', body: '아니요. 본 게임에서 아낀 포인트는 사라지고 둘 다 33포인트로 다시 시작해요. 연장전은 표시등 2칸(20~39)에서 시작해요.' },
            { title: '무승부로 끝날 수도 있나요?', body: '9라운드 동점이면 연장전으로 가고, 연장전 세 라운드 뒤에도 승이 같으면(비김이 섞인 경우) 무승부로 끝나요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 5승의 예산 짜기',
        blocks: [
          { type: 'p', text: '이기려면 5승이 필요하고, 질 수 있는 라운드는 넷까지예요(비김은 따로). 99를 5승에 고르게 나누면 한 번에 약 20이에요. 진 라운드에 0~9만 썼다면 이길 라운드에 더 쓸 수 있어요. 게임을 시작하기 전에 "어디서 이기고, 어디서 싸게 질지"를 대략 정해 두세요.' },
          { type: 'list', items: [
            '**질 라운드는 흑으로 싸게**: 0~9로 지면 상대는 이기려고 10 이상을 써야 해요. 한 번 질 때마다 상대와의 예산 차이가 벌어져요.',
            '**흑을 보면 10을 먼저 떠올리기**: 상대가 흑을 내면 10이 확실한 1승이에요. 상대가 이미 4승이라면 흑에는 반드시 10 이상으로 답하세요.',
            '**백을 보면 표시등부터**: 상대가 백을 냈다면 10 이상이에요. 상대 표시등이 한 칸 이상 꺼졌다면 꽤 큰 입찰이니, 무리하게 따라가지 말고 흑으로 싸게 지는 것도 방법이에요.',
            '**이길 때는 1~2 차이로**: 같은 1승이라면 작은 차이로 이기는 게 남은 라운드에서 힘이 돼요.',
            '**마지막을 위해 남기기**: 4:4로 가면 마지막엔 더 많이 남긴 쪽이 유리해요. 초반에 다 쓰지 마세요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 두 라운드로 상대 예산 좁히기',
        lead: '내가 1라운드 선이에요. 상대(AI)의 정확한 숫자는 모르지만, 색·승패·표시등으로 범위를 좁혀 볼게요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1라운드: 나 0(흑) → 패배', body: '첫 라운드는 싸게 넘기기로 하고 0을 냈어요. 상대는 흑을 보고 백으로 답해 이겼어요. 상대 입찰은 10 이상이고, 라운드 뒤 상대 표시등은 그대로 5칸(80 이상)이에요. 그러니 상대 입찰은 **10~19**, 남은 포인트는 **80~89**예요. 점수 0:1, 내 포인트는 그대로 99.' },
            { title: '2라운드: 상대가 선, 백 + 표시등 4칸', body: '상대가 백을 냈고 표시등이 4칸(60~79)으로 줄었어요. 직전 잔액이 80~89였으니 입찰은 1~29인데 백이니까 **10~29**예요. 20을 내면 10~19는 이기고 20은 비기고 21~29는 져요.' },
            { title: '2라운드 결과: 나 20 → 승리', body: '20으로 이겼어요. 상대 입찰은 20보다 작았으니 **10~19**. 상대 잔액은 99에서 두 번의 10~19를 뺀 61~79예요(표시등 4칸과도 맞아요). 점수 1:1, 내 잔액은 79, 이제 내가 선이에요.' },
          ] },
          { type: 'callout', tone: 'tip', title: '두 라운드 뒤 정리', text: '나는 99-20 = 79, 상대는 61~79. 예산은 내가 같거나 최대 18 많아요. 남은 7라운드에 서로 4승이 필요해요. 1라운드의 0은 상대에게 1승을 줬지만, 상대가 그 대가로 10 이상을 썼기 때문에 예산에서는 손해를 보지 않았어요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 표시등으로 상대 잔액 추적하기',
        blocks: [
          { type: 'p', text: '상대가 매 라운드 낸 숫자는 모르지만, 색이 정해 주는 범위(흑 0~9, 백 10 이상), 승패가 정해 주는 범위(내 숫자보다 크다/작다/같다), 표시등이 정해 주는 범위를 겹치면 상대 잔액이 꽤 좁혀져요. AI도 정확히 이 방법으로 상대 잔액을 계산해요.' },
          { type: 'cards', items: [
            { tag: '비김', title: '무승부는 정확한 숫자', body: '비겼다면 상대 입찰은 내 입찰과 정확히 같아요. 상대 잔액 범위가 한꺼번에 좁혀지는 가장 확실한 정보예요.' },
            { tag: '표시등', title: '경계 근처의 잔액', body: '표시등은 20 단위로만 바뀌어요. 내 잔액이 경계 바로 위(예: 81)라면 2만 내도 한 칸이 꺼져서 큰 입찰처럼 보여요. 반대로 경계 바로 아래(예: 79)라면 19까지 내도 칸이 그대로예요. 경계를 이용해 입찰 크기를 숨기세요.' },
            { tag: '후', title: '흑에 9로 답하기', body: '흑에 10은 확실하지만, 상대가 0을 냈다면 10을 낭비해요. 상대가 이기려고 흑을 낸 게 아니라 버리려고 낸 것 같다면 9 이하로 비김이나 승을 노리고, 상대가 8~9 같은 큰 흑을 냈을 것 같다면 10으로 확실히 가져가세요.' },
            { tag: '선', title: '선의 흑은 정보를 덜 줘요', body: '흑은 0~9라 범위가 좁고, 표시등도 거의 안 바뀌어요. 선일 때 흑을 내면 상대는 10을 낼지 말지만 고민하게 돼요. 백은 표시등이 바뀔 수 있어 정보를 더 줘요.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 점수 상황별 입찰',
        blocks: [
          { type: 'h3', text: '상대가 4승일 때' },
          { type: 'p', text: '상대가 한 번만 더 이기면 끝나는 상황에서는 모든 라운드가 결승이에요. 내가 선이라면 흑을 내는 순간 상대가 10으로 끝낼 수 있으니, 백으로 상대가 쉽게 넘을 수 없는 금액을 내야 해요. 상대 잔액 범위를 계산해서 "상대가 다 걸어도 못 넘는" 금액을 낼 수 있는지가 관건이에요.' },
          { type: 'h3', text: '내가 4승일 때' },
          { type: 'p', text: '이번엔 상대가 매 라운드 버텨야 해요. 내가 후라면 상대 흑에는 10으로 끝낼 수 있고, 상대 백에는 표시등으로 크기를 읽어 이길 만큼만 내요. 내가 선이라면 작은 흑을 던져 상대가 막느라 포인트를 쓰게 만들고, 다음 라운드에서 끝내는 흐름도 좋아요.' },
          { type: 'h3', text: '4:4 마지막 라운드와 연장전' },
          { type: 'p', text: '4:4에서 남은 라운드가 하나라면, 더 많이 남긴 쪽이 상대보다 큰 수를 낼 수 있어요. 상대 잔액 범위의 최댓값보다 내 잔액이 크면 전부 걸어 이길 수 있어요. 9라운드 동점이면 포인트가 33으로 초기화되니, 본 게임 마지막에 아낀 포인트는 쓰지 않으면 사라진다는 점도 기억하세요.' },
          { type: 'h3', text: '같은 패턴을 반복하지 않기' },
          { type: 'p', text: '"흑에는 항상 10", "질 땐 항상 0"처럼 패턴이 굳으면 상대는 그 반대로 둬요. 흑에 10을 기대하는 상대에게는 9를 흑으로 내서 1 차이로 지게 만들고, 0을 기대하는 상대에게는 9를 내서 싸게 이기려던 상대의 계산을 흔들어 보세요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**초반에 크게 이기기**: 40으로 10을 이기면 1승을 얻고 30을 낭비해요. 남은 라운드에서 그 차이가 돌아와요.',
            '**흑에 무조건 10**: 상대가 0을 냈다면 10을 주고 1승을 산 셈이에요. 상대가 4승이 아니라면 흑에 9 이하로 답할지도 따져 보세요.',
            '**표시등을 안 보기**: 선의 표시등이 두 칸 꺼졌다면 큰 입찰이에요. 그 라운드에 따라가면 비싸게 져요.',
            '**연장전을 생각하지 않고 아끼기**: 9라운드 동점이면 남은 포인트가 사라져요. 마지막 라운드에 남긴 포인트는 의미가 없어요.',
            '**자기 패턴을 반복하기**: AI 보통·어려움은 내 색과 결과로 잔액을 추적해요. 같은 크기를 반복하면 금방 읽혀요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구전, 복기',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['공통', 'AI는 자기 잔액과, 사람에게도 공개되는 색·표시등·승패·라운드 정보만 써요. 내 정확한 포인트는 보지 않아요.'],
            ['쉬움', '계산 없이 감으로 둬요. 선일 때는 대략 "남은 포인트 ÷ 필요한 승수" 근처를 내고, 흑을 보면 대부분 10으로 답해요.'],
            ['보통', '색·승패·표시등으로 내 잔액 범위를 좁힌 뒤, 여러 후보 입찰을 남은 게임까지 120번 정도 시뮬레이션해서 골라요.'],
            ['어려움', '같은 방식으로 500번 시뮬레이션하고, 가장 좋은 수를 더 일관되게 골라요. 그래도 완전히 같은 수만 두지는 않아요.'],
            ['친구전', '초대 링크나 4자리 코드로 1:1 대결해요. 턴 시간은 30·45·60초 중에서 골라요. 시간이 지나면 "남은 포인트를 남은 라운드로 나눈 값"의 두 배 이내에서 무작위로 입찰되고, 세 번 연속이면 패배예요. 상대 화면에는 내 정확한 숫자와 잔액이 전달되지 않아요.'],
            ['복기', '끝나면 모든 숫자가 공개돼요. 1~2 차이 승리, 미끼(흑으로 져서 상대의 백을 끌어냄), 과한 승리(12 이상 차이), 올인, 표시등 압박 같은 라운드에 해설이 붙어요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '흑 / 백', def: '0~9 입찰과 10 이상 입찰. 상대에게는 색만 보여요.' },
            { term: '표시등', def: '남은 포인트를 20 단위 다섯 칸으로 보여 주는 공개 정보.' },
            { term: '선 / 후', def: '먼저 입찰하는 사람과, 색과 표시등을 보고 답하는 사람.' },
            { term: '미끼', def: '흑으로 싸게 져서 상대가 10 이상을 쓰게 만드는 라운드.' },
            { term: '잔액 범위', def: '색·승패·표시등으로 좁힌 상대의 남은 포인트 범위.' },
            { term: '연장전', def: '9라운드 동점 뒤 33포인트로 다시 하는 최대 3라운드. 먼저 2승이면 승리.' },
            { term: '올인', def: '남은 포인트를 한 번에 모두 내는 입찰.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '흑과 백 II는 어디서 할 수 있나요?', a: 'PUZZLTHINK 흑과 백 II 페이지에서 설치나 가입 없이 모바일과 PC로 바로 할 수 있어요.' },
      { q: '상대가 낸 정확한 숫자가 보이나요?', a: '게임 중에는 색과 다섯 칸 표시등, 승패만 보여요. 게임이 끝나면 복기 화면에서 모든 숫자가 공개돼요.' },
      { q: '흑과 백은 정확히 어떻게 나뉘나요?', a: '0~9(한 자리)는 흑, 10 이상(두 자리)은 백이에요. 그래서 흑에는 10이 언제나 이겨요.' },
      { q: '9라운드 동점이면 어떻게 되나요?', a: '남은 포인트를 모두 버리고 두 사람 모두 33포인트를 받아 최대 3라운드 연장전을 해요. 먼저 2승이면 이기고, 끝까지 같으면 무승부예요.' },
      { q: 'AI가 내 포인트를 몰래 보나요?', a: '아니요. AI는 자기 잔액과 사람에게도 공개되는 색·표시등·승패만 써요.' },
      { q: '친구와는 어떻게 하나요?', a: '친구와 하기를 누른 뒤 초대 링크나 4자리 코드를 보내면 1:1 방에 바로 들어와요.' },
    ],
    cta: { title: '첫 라운드에 얼마를 걸까요?', body: '5승 예산을 대략 짜 두고 AI와 한 판 해 보세요. 끝나면 모든 숫자가 공개돼요.', button: '흑과 백 II 하러 가기' },
    disclaimer: '흑과 백 II는 방송에 소개된 게임 방식에서 착안해 PUZZLTHINK가 웹용으로 다시 만든 것으로, 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Black & White II strategy guide — budgeting 99 points, reading gauges, overtime | PUZZLTHINK',
      description: 'Black & White II in depth: budgeting 99 points across nine rounds, what black (0–9) and white (10+) mean, narrowing their bids with the five-band gauge, answering black with 10, the 33-point overtime and draws, and what each AI level does.',
      keywords: ['Black and White II strategy', 'Black and White 2 rules', 'blind bidding game', 'The Genius black and white 2', 'Black & White II tips'],
    },
    title: 'Black & White II strategy guide',
    lead: 'A bidding fight where the numbers stay hidden and only colours and gauges show.',
    intro: [
      'In Black & White II both players hold 99 points and bid secretly over up to nine rounds. The higher bid takes the round, and the first to five wins takes the game. You never see their exact bid — only **black for a one-digit bid (0–9), white for two digits (10+)**, plus a five-band gauge that shows their remaining points in steps of 20.',
      'This guide covers budgeting for five wins, narrowing their bids from colour and gauge in a real sequence of rounds, strategy by level, the overtime, and notes on the AI and friend matches.',
    ],
    gamePageTitle: 'Black & White II — read the numbers between the gauge lights',
    summary: 'Budgeting for five wins, what black and white mean, narrowing bids with the gauge, the 33-point overtime.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Black & White II?',
        blocks: [
          { type: 'p', text: 'Black & White II is a two-player blind bidding game based on a format seen on The Genius: Black Garnet. It shares its name with the 0–8 tile game Black & White, but instead of fixed tiles you bid **any number of points** you like.' },
          { type: 'p', text: 'Black & White asks which tile to play when; II asks how much to spend where. A win by 11 against 10 and a win by 40 against 10 score the same, but leave budgets 29 points apart. Losing cheaply matters as much as winning.' },
          { type: 'p', text: 'Play the AI at three levels or a friend one-on-one by invite link or 4-digit code. At the end every number is revealed in a replay with round-by-round commentary.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Points**: both players start with 99. Each round you bid anything from 0 to all you have left; bid points are gone.',
            '**Leader and follower**: the round-1 leader is random. The leader locks a bid first, its colour (0–9 black, 10+ white) is shown and **the leader\'s gauge updates immediately**. The follower bids after seeing both.',
            '**Scoring**: the higher bid wins the round and leads next. Equal bids win nothing and the same leader leads again.',
            '**Gauge**: remaining points in five bands: 0–19, 20–39, 40–59, 60–79, 80–99. The first light stays on even at 0. Only you know your exact total.',
            '**Winning**: five wins ends the game at once. After nine rounds, more wins takes it.',
            '**Overtime**: if wins are equal after nine rounds, all remaining points vanish and both players get a fresh 33 for up to three more rounds. The first to two wins takes it; still level after three, it is a draw.',
          ] },
          { type: 'table', caption: 'What the gauge reveals when the leader bids from 99', head: ['Gauge after the bid', '5 lights', '4', '3', '2', '1'], rows: [['Points left', '80–99', '60–79', '40–59', '20–39', '0–19'], ['So the bid was', '0–19', '20–39', '40–59', '60–79', '80–99']] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations',
        blocks: [
          { type: 'cards', items: [
            { title: 'Can I bid 0?', body: 'Yes. It shows as black and costs nothing. It draws only against their 0 and loses otherwise, but it can bait them into spending a white bid.' },
            { title: 'Does 10 always beat black?', body: 'Black is 0–9, so a follower\'s 10 always wins — though against a 0 you paid 10 for the point. A 9 beats every black except a 9, which draws.' },
            { title: 'When does the gauge change?', body: 'The leader\'s gauge changes the moment the bid is locked, so the follower sees it before answering. The follower\'s gauge changes when the round resolves.' },
            { title: 'What about points on a draw?', body: 'Both players lose what they bid. Nobody wins the round and the leader stays.' },
            { title: 'Do saved points carry into overtime?', body: 'No. Everything left vanishes and both restart at 33, which starts the gauge at two lights (20–39).' },
            { title: 'Can the game end in a draw?', body: 'A tie after nine rounds goes to overtime; if wins are still level after its three rounds (draws included), the game is drawn.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — budget for five wins',
        blocks: [
          { type: 'p', text: 'You need five wins and can afford at most four losses (draws aside). Split 99 evenly over five wins and each costs about 20; if your losses cost only 0–9, your wins can cost more. Before the game, sketch where you plan to win and where to lose cheaply.' },
          { type: 'list', items: [
            '**Lose with black**: a 0–9 loss forces them to spend 10 or more to win it, widening the budget gap every time.',
            '**See black, think 10**: a 10 wins any black. If they already have four wins, always answer black with 10 or more.',
            '**See white, check the gauge**: white means 10+. If a light went out, it was a big bid; rather than chasing it, losing cheaply with black is often better.',
            '**Win by 1–2**: the same win at a smaller margin is strength saved for later.',
            '**Save something for the end**: at 4–4 the player with more left can outbid the other. Do not spend it all early.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — narrowing their budget over two rounds',
        lead: 'You lead round 1. You never see the AI\'s numbers, but colours, results and the gauge narrow them down.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Round 1: you bid 0 (black) → loss', body: 'You give the first round away cheaply with 0. The AI sees black, answers white and wins: at least 10. After the round its gauge still shows five lights (80+), so its bid was **10–19** and it has **80–89** left. 0–1, and you still have 99.' },
            { title: 'Round 2: AI leads, white + four lights', body: 'The AI bids white and its gauge drops to four lights (60–79). From 80–89 that means a bid of 1–29, and white makes it **10–29**. A bid of 20 beats 10–19, draws 20 and loses to 21–29.' },
            { title: 'Round 2 result: you bid 20 → win', body: 'You win with 20, so its bid was below 20: **10–19**. Its balance is 99 minus two bids of 10–19: 61–79, consistent with four lights. 1–1, you have 79, and you lead now.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'Where things stand after two rounds', text: 'You have 99 − 20 = 79; the AI has 61–79. Your budget is equal or up to 18 larger, and each side needs four more wins in seven rounds. Your round-1 zero gave away a win, but the AI paid 10 or more for it, so you lost nothing in budget.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — track their balance through the gauge',
        blocks: [
          { type: 'p', text: 'You never learn their exact bids, but overlapping three ranges — the colour (black 0–9, white 10+), the result (above, below or equal to your bid) and the gauge — narrows their balance a lot. The AI tracks you exactly this way.' },
          { type: 'cards', items: [
            { tag: 'Draws', title: 'A draw is an exact number', body: 'Their bid equalled yours exactly. Nothing narrows their balance faster.' },
            { tag: 'Gauge', title: 'Balances near a boundary', body: 'The gauge only moves in steps of 20. Just above a boundary (say 81), bidding 2 turns a light off and looks like a big bid; just below one (say 79), you can bid up to 19 without any change. Use the boundaries to hide your bid size.' },
            { tag: 'Following', title: 'Answer black with 9', body: 'A 10 is certain against black, but wasted against a 0. If their black looks like a throwaway, aim for a draw or win with 9 or less; if it looks like a big black (8 or 9), take the round with 10.' },
            { tag: 'Leading', title: 'A leading black gives little away', body: 'Black is 0–9 and barely moves the gauge, so all they decide is whether to pay 10. White can move the gauge and tells them more.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — bidding by the score',
        blocks: [
          { type: 'h3', text: 'When they have four wins' },
          { type: 'p', text: 'Every round is a final. Leading with black lets them finish with a 10, so you have to lead white with an amount they cannot easily top. Work out the top of their balance range: can you bid more than they could possibly spend?' },
          { type: 'h3', text: 'When you have four wins' },
          { type: 'p', text: 'Now they have to survive every round. As follower you finish any black with 10 and read the size of any white from the gauge to bid just enough. As leader, a small black that makes them spend points to block it sets up the finish next round.' },
          { type: 'h3', text: '4–4 in the last round, and overtime' },
          { type: 'p', text: 'At 4–4 with one round left, whoever has more left can outbid the other: if your balance exceeds the top of their range, bid everything. A tie after nine rounds resets both to 33, so points saved in the last main round simply vanish if unused.' },
          { type: 'h3', text: 'Do not repeat yourself' },
          { type: 'p', text: '"Always 10 against black" or "always 0 when losing" gets countered. Against someone expecting your 10, lead a black 9 and make them lose by one; against someone expecting your 0, a 9 spoils their plan to win cheaply.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Winning big early**: beating 10 with 40 scores once and wastes 30 that you will miss later.',
            '**Always 10 against black**: against a 0 you bought a win for 10. Unless they are on four wins, consider answering black with 9 or less.',
            '**Ignoring the gauge**: two lights out on the leader means a big bid; following it is an expensive loss.',
            '**Saving for nothing**: a tie after nine rounds wipes your remaining points. Points kept in the last round are worthless.',
            '**Repeating your pattern**: Normal and Hard track your balance from colours and results. Repeat a size and you will be read.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend matches, replay',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['All levels', 'The AI uses its own balance and the public colours, gauges, results and round count only — never your exact points.'],
            ['Easy', 'Plays by feel: leads roughly "points left ÷ wins needed" and usually answers black with 10.'],
            ['Normal', 'Narrows your balance from colours, results and gauge, then plays each candidate bid out to the end about 120 times.'],
            ['Hard', 'The same with 500 play-outs, choosing the best bid more consistently — though never the exact same bid every time.'],
            ['Friend matches', 'One-on-one by invite link or 4-digit code. Turns of 30, 45 or 60 seconds; a timeout places a random bid of up to twice "points left ÷ rounds left", and three in a row loses. Your exact bids and balance are never sent to their screen.'],
            ['Replay', 'Every number is revealed, with notes on rounds won by 1–2, baits (a black loss that drew out a white), overkills (won by 12+), all-ins and gauge pressure.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Black / white', def: 'A bid of 0–9 / 10 or more. Opponents see only the colour.' },
            { term: 'Gauge', def: 'Public lights showing remaining points in five bands of 20.' },
            { term: 'Leader / follower', def: 'The player who bids first, and the one who answers after seeing colour and gauge.' },
            { term: 'Bait', def: 'A cheap black loss that makes them spend 10 or more.' },
            { term: 'Balance range', def: 'Their possible remaining points, narrowed by colour, result and gauge.' },
            { term: 'Overtime', def: 'Up to three more rounds with 33 points each after a nine-round tie; first to two wins.' },
            { term: 'All-in', def: 'Bidding everything you have left at once.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where can I play Black & White II?', a: 'On the PUZZLTHINK Black & White II page, on mobile or PC, with no install or sign-up.' },
      { q: 'Can I see their exact bids?', a: 'During the game you see only colours, the five-light gauge and results. The replay reveals every number at the end.' },
      { q: 'How are black and white split?', a: '0–9 (one digit) is black, 10 and up (two digits) is white — so a 10 always beats black.' },
      { q: 'What if it is tied after nine rounds?', a: 'All remaining points are discarded and both players get 33 for an overtime of up to three rounds. First to two wins takes it; level at the end is a draw.' },
      { q: 'Does the AI peek at my points?', a: 'No. It uses its own balance plus the colours, gauges and results everyone can see.' },
      { q: 'How do I play a friend?', a: 'Press "Play with a friend" and send the invite link or 4-digit code; they join the one-on-one room directly.' },
    ],
    cta: { title: 'What will you bid in round one?', body: 'Sketch a five-win budget and play the AI. Every number is revealed at the end.', button: 'Play Black & White II' },
    disclaimer: 'Black & White II is PUZZLTHINK\'s web version of a game format seen on TV and is not affiliated with the broadcaster or producers.',
  },
};

export default guide;
