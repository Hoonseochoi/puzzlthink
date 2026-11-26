// Piggy Bank guide. Rules and numbers follow src/lib/piggyBank.ts (PB_PLAYERS 4, PB_WIN 5, PB_MAX_PUT 5, pigs start
// at 1 black 1 white, pigs 1–4 under each seat in the drawn order and pig 5 on the first player's table; putCoins:
// coins go into your under-table pig, which moves to the receiver's table while your table pig drops under;
// answerCount / the asked colour alternating; doubt: +1/−1 or −1, the opened pig leaves and the point loser gets a
// new 1/1 pig and the turn; RESET_VOTES 3 with the all-in guess +3/−2; timers PUT_MS 30 s, ANSWER_MS 20 s (a timeout
// answers 0), DOUBT_MS 10 s, ALLIN_MS 45 s; ranking by score then turn order; the AI's RECALL 62/80/93% per count and
// the SPREAD of levels) and src/lib/piggyBankRoom.ts (2–4 people, empty seats to AI). Inline guide: PiggyBankGuide.
// The walkthrough's slot moves were traced through putCoins and doubt by hand.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'piggyBank',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['hexagon', 'heavy13', 'russianRoulette', 'hitStay'],
  inlineNamespace: 'PiggyBankGuide',
  ko: {
    meta: {
      title: '돼지 저금통 공략 — 저금통 추적법, 의심 기댓값, 리셋과 올인 | PUZZLTHINK',
      description: '데블스 플랜 3 감옥 매치에서 착안한 돼지 저금통 공략. 위칸·아래칸으로 움직이는 저금통 따라가기, 의심이 이득이 되는 확률, 리셋 투표와 전체 맞히기(+3/−2)의 기댓값, 실제 세 차례 따라가기, AI 기억력 차이까지 정리했어요.',
      keywords: ['돼지 저금통 공략', '돼지저금통 게임', '데블스 플랜 돼지 저금통', '데블스 플랜 3 감옥 매치', '돼지 저금통 규칙', '기억력 게임', '데블스플랜 돼지저금통'],
    },
    title: '돼지 저금통 공략',
    lead: '넣은 동전은 모두 공개돼요. 다만 기록이 남지 않을 뿐이에요.',
    intro: [
      '돼지 저금통은 4명이 저금통 다섯 개에 흑·백 동전을 넣고 주고받으며, 받은 저금통 속 동전 수를 맞히는 기억 게임이에요. 누가 어느 저금통에 무엇을 넣었는지는 **모두 사실대로 공개되지만 몇 초 뒤 사라지고 메모도 없어요**. 그래서 이 게임의 실력은 다섯 저금통의 숫자를 끝까지 들고 가는 기억력과, 남의 대답을 언제 의심할지 고르는 판단력이에요.',
      '이 공략에서는 저금통이 위칸과 아래칸을 오가는 규칙을 실제 차례로 따라가 보고, 의심·리셋·전체 맞히기의 기댓값을 계산하고, 기억을 정리하는 요령과 AI 메모를 담았어요.',
    ],
    gamePageTitle: '돼지 저금통 — 기억하고, 의심하라',
    summary: '움직이는 저금통 따라가기, 의심이 이득인 확률, 리셋과 전체 맞히기 기댓값.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '돼지 저금통은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '돼지 저금통은 넷플릭스 「데블스 플랜: 데드 어게인」의 감옥 매치에서 착안해 PUZZLTHINK가 웹용으로 다시 만든 4인 기억 게임이에요.' },
          { type: 'p', text: '숨기는 정보가 하나도 없다는 점이 특이해요. 넣은 동전의 색과 개수는 모두에게 공개되니, 이론상 모두가 모든 저금통의 내용을 알 수 있어요. 하지만 저금통이 사람 사이를 계속 옮겨 다니고, 화면의 공개는 잠깐뿐이라 시간이 지날수록 기억이 어긋나요. 그 어긋남을 먼저 알아채는 사람이 점수를 가져가요.' },
          { type: 'p', text: '혼자서는 기억력이 서로 다른 AI 3명과 4인전을 하고, 친구 방에서는 2~4명이 모이면 빈자리를 AI가 채워요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**자리와 저금통**: 각자 테이블 아래칸과 위칸이 있어요. 저금통은 처음에 흑 1개·백 1개가 들어 있고, 1~4번이 차례 순서대로 각자의 아래칸에, 5번이 첫 플레이어의 위칸에 놓여요.',
            '**넣기(30초)**: 차례인 사람은 자기 **아래칸** 저금통에 흑·백 합쳐 1~5개를 넣어요. 넣은 색과 개수는 자동으로 공개돼요.',
            '**전달**: 그 저금통을 원하는 사람에게 넘기면 받은 사람의 위칸에 놓이고, 넘긴 사람의 위칸 저금통은 아래칸으로 내려와요.',
            '**대답(20초)**: 받은 사람은 위칸 저금통 속 지정 색 동전 수를 말해요. 지정 색은 흑 → 백 → 흑 순서로 대답할 때마다 바뀌어요. 시간이 지나면 0개라고 말한 것으로 처리돼요.',
            '**의심(10초)**: 다른 사람들은 의심하거나 넘길 수 있어요. 모두 넘기면 받은 사람이 다음 차례예요.',
            '**의심 판정**: 의심하면 저금통을 열어요. 대답이 틀렸으면 의심한 사람 +1, 대답한 사람 −1. 맞았으면 의심한 사람만 −1이에요.',
            '**새 저금통**: 연 저금통은 빠지고, 점수를 잃은 사람이 다음 번호의 새 저금통(흑 1·백 1)을 위칸에 받아 차례를 이어가요. 저금통은 항상 다섯 개예요.',
            '**종료**: 누군가 5점이 되면 바로 끝나요. 점수가 같으면 처음 정한 차례 순서가 빠른 사람이 위예요.',
          ] },
          { type: 'h3', text: '리셋과 전체 맞히기' },
          { type: 'p', text: '아무 때나 리셋에 투표할 수 있어요. 세 명이 투표하면, 투표하지 않은 사람은 45초 안에 **모든 저금통의 흑·백 개수**를 맞히는 도전을 할 수 있어요. 전부 맞으면 +3, 하나라도 틀리면 −2예요. 그다음 모든 저금통이 흑 1·백 1로 돌아가요. 점수와 저금통 번호는 그대로예요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '내가 받은 저금통은 어느 것인가요?', body: '방금 넘긴 사람이 동전을 넣은 그 저금통이에요. 넘긴 사람의 아래칸에 있던 저금통이라, 방금 넣은 동전 말고 그 전에 들어 있던 동전까지 기억해야 해요.' },
            { title: '대답을 일부러 틀리게 해도 되나요?', body: '말할 수는 있지만 이득이 없어요. 틀린 대답은 의심받으면 −1이고, 맞는 대답은 의심받아도 잃을 게 없어요. 늘 내가 믿는 숫자를 말하세요.' },
            { title: '의심이 틀리면?', body: '의심한 사람이 1점을 잃고, 새 저금통을 받아 차례를 이어가요. 대답한 사람은 점수가 그대로예요.' },
            { title: '점수가 음수가 될 수 있나요?', body: '네. 의심 실패나 전체 맞히기 실패로 0 아래로 내려갈 수 있어요.' },
            { title: '리셋하면 무엇이 남나요?', body: '동전만 흑 1·백 1로 돌아가요. 점수, 저금통 번호, 누가 어느 칸에 무엇을 들고 있는지는 그대로예요.' },
            { title: '전체 맞히기는 누가 하나요?', body: '세 번째 투표가 나왔을 때 투표하지 않은 사람이에요. 4인전이라 언제나 한 명이에요. 도전하지 않고 넘길 수도 있어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 다섯 줄로 기억하기',
        blocks: [
          { type: 'p', text: '저금통은 늘 다섯 개예요. "1번 흑2백1, 2번 흑1백1, …"처럼 **번호와 숫자를 한 줄씩** 머릿속에 두고, 동전이 들어갈 때마다 그 줄만 고치세요. 저금통이 어느 자리로 옮겨 갔는지는 화면에 보이니, 기억해야 하는 건 숫자뿐이에요.' },
          { type: 'list', items: [
            '**처음은 모두 1·1**: 넣은 동전만 더하면 돼요. 동전이 안 들어간 저금통은 아직 1·1이에요.',
            '**새 저금통도 1·1**: 의심으로 열린 저금통은 빠지고, 새 번호가 1·1로 들어와요. 열린 저금통의 숫자는 지워도 돼요.',
            '**의심은 확실할 때만**: 의심이 맞을 확률이 p라면 기댓값은 p×(+1) + (1−p)×(−1) = 2p − 1이에요. **50%를 넘어야** 이득이고, 70%면 +0.4, 90%면 +0.8이에요.',
            '**내가 넣은 저금통은 특히 잘 기억하기**: 내가 넣은 동전은 확실히 알아요. 그 저금통을 받은 사람이 틀리면 의심하기 가장 좋은 기회예요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 세 차례 동안 저금통 추적',
        lead: '차례 순서는 A → B → C → D. 1~4번이 각자의 아래칸, 5번이 A의 위칸에 있어요. 모두 흑 1·백 1.',
        blocks: [
          { type: 'steps', items: [
            { title: '1차례: A가 1번에 흑 2·백 1 → C에게', body: '1번은 흑 3·백 2가 돼요. 1번은 C의 위칸으로, A의 위칸에 있던 5번은 A의 아래칸으로 내려와요. 지정 색은 흑, C는 "3개". 맞는 대답이라 아무도 의심하지 않았고, C가 다음 차례예요.' },
            { title: '2차례: C가 3번에 백 4 → A에게', body: 'C의 아래칸 3번이 흑 1·백 5가 되어 A의 위칸으로 가요. C의 위칸 1번(흑 3·백 2)은 C의 아래칸으로 내려와요. 지정 색은 이제 백, A는 "4개"라고 했어요.' },
            { title: '의심: B가 의심 → 성공', body: '3번을 열어 보니 백 5개. A가 틀렸으니 B +1, A −1이에요. 3번은 빠지고, 점수를 잃은 A가 새 6번(흑 1·백 1)을 위칸에 받아 차례를 이어가요. 지정 색은 다시 흑.' },
            { title: '3차례: A가 5번에 흑 1·백 1 → D에게', body: 'A의 아래칸 5번이 흑 2·백 2가 되어 D의 위칸으로 가고, A의 위칸 6번은 A의 아래칸으로 내려와요. D는 흑 "2개".' },
          ] },
          { type: 'table', caption: '3차례 뒤 저금통 위치와 내용', head: ['저금통', '자리', '흑', '백'], rows: [
            ['1번', 'C 아래칸', '3', '2'],
            ['2번', 'B 아래칸', '1', '1'],
            ['4번', 'D 아래칸', '1', '1'],
            ['5번', 'D 위칸', '2', '2'],
            ['6번', 'A 아래칸', '1', '1'],
          ] },
          { type: 'callout', tone: 'tip', title: '이 흐름에서 배울 점', text: 'A가 틀린 이유는 3번이 처음부터 1·1이었다는 걸 놓치고 넣은 백 4만 떠올렸기 때문이에요. 받은 저금통의 숫자는 "원래 들어 있던 것 + 방금 넣은 것"이에요. 그리고 다음에 C가 차례를 잡으면 아래칸의 1번(흑 3·백 2)을 넣고 넘기게 되니, 1번 숫자를 가장 단단히 기억해 두세요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 남의 기억을 흔들기',
        blocks: [
          { type: 'cards', items: [
            { tag: '흔들기', title: '많이 바뀐 저금통을 넘기기', body: '내 아래칸 저금통에 동전이 여러 번 들어갔다면, 받는 사람이 틀리기 쉬워요. 거기에 동전을 더 넣어 숫자를 크게 만들고, 기억이 약해 보이는 사람에게 넘기세요.' },
            { tag: '흔들기', title: '지정 색을 노리기', body: '지정 색은 대답마다 흑과 백이 번갈아 바뀌어요. 다음 지정 색을 미리 세어 두고, 그 색의 동전을 많이 넣으면 받는 사람이 셀 숫자가 커져요.' },
            { tag: '선두', title: '앞선 사람에게 넘기기', body: '누군가 4점이라면 그 사람이 틀릴 기회를 늘리는 게 좋아요. 대답이 틀리면 −1이고, 의심한 사람이 +1을 가져가요.' },
            { tag: '차례', title: '차례를 잡는 쪽', body: '의심이 없으면 받은 사람이 다음 차례를 잡고, 의심이 나오면 점수를 잃은 사람이 잡아요. 차례를 잡으면 내 아래칸 저금통을 골라 넘길 수 있으니, 그 저금통의 숫자를 정확히 알고 있을수록 유리해요.' },
          ] },
          { type: 'p', text: '의심은 점수 차이를 두 배로 벌려요. 의심이 맞으면 나는 +1, 상대는 −1이라 둘 사이는 2점 차가 생겨요. 선두를 쫓아갈 때는 선두의 대답을 특히 주의 깊게 보세요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 리셋 투표와 전체 맞히기',
        blocks: [
          { type: 'h3', text: '전체 맞히기의 기댓값' },
          { type: 'p', text: '전체 맞히기는 성공 +3, 실패 −2예요. 다섯 저금통의 흑·백 열 개 숫자를 모두 맞힐 확률을 q라고 하면 기댓값은 3q − 2(1 − q) = 5q − 2라서, **q가 40%를 넘어야** 이득이에요. 저금통 하나라도 자신이 없으면 넘기는 게 나아요.' },
          { type: 'h3', text: '투표하지 않고 기다리기' },
          { type: 'p', text: '전체 맞히기는 세 번째 투표가 나올 때 투표하지 않은 사람만 할 수 있어요. 다섯 저금통을 모두 확신한다면 리셋에 투표하지 말고 남들이 투표하기를 기다리세요. 반대로 내 기억이 흐려졌다면 먼저 투표해서, 모두가 1·1에서 다시 시작하는 편이 나아요.' },
          { type: 'h3', text: '다른 사람의 투표 읽기' },
          { type: 'p', text: '리셋에 투표한 사람은 "기억이 흐려졌다"고 알린 셈이에요. 투표한 사람의 대답은 틀릴 가능성이 높으니 의심의 근거가 되고, 투표하지 않고 버티는 사람은 전체 맞히기를 노리고 있을 수 있어요.' },
          { type: 'h3', text: '5점 직전의 계산' },
          { type: 'p', text: '5점이 되는 순간 끝나요. 3점이라면 전체 맞히기 성공 한 번으로 바로 이길 수 있고, 4점이라면 맞는 의심 한 번이면 끝이에요. 상대가 4점일 때는 그 사람이 의심할 거리를 주지 않도록, 내가 대답할 저금통의 숫자를 특히 정확히 기억해 두세요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**방금 넣은 동전만 떠올리기**: 받은 저금통에는 원래 들어 있던 동전도 있어요. 처음 1·1부터 더하세요.',
            '**지정 색을 헷갈리기**: 흑과 백은 대답마다 번갈아 바뀌어요. 다른 색을 세면 맞는 기억으로도 틀려요.',
            '**반반인데 의심하기**: 확률 50%의 의심은 기댓값 0이에요. 그보다 낮으면 손해예요.',
            '**자신 없이 전체 맞히기**: 열 개 숫자 중 하나만 틀려도 −2예요.',
            '**열린 저금통의 숫자를 계속 들고 있기**: 빠진 저금통은 지우고, 새 번호를 1·1로 적으세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI와 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['공통', 'AI도 공개된 숫자만 기억해요. 동전이 들어갈 때마다 흑·백 각각을 일정 확률로 정확히 기억하고, 못 하면 한 개 차이로 잘못 기억한 채 "헷갈리는 저금통"으로 표시해 둬요.'],
            ['쉬움', '세 AI가 쉬움·쉬움·보통이에요. 쉬움 AI는 숫자 하나를 기억할 확률이 62%예요.'],
            ['보통', '세 AI가 쉬움·보통·어려움으로 섞여요. 보통 AI는 80%를 기억해요.'],
            ['어려움', '세 AI가 보통·어려움·어려움이에요. 어려움 AI는 93%를 기억해요.'],
            ['AI의 의심과 리셋', 'AI는 자기 기억과 다른 대답에만 의심하고, 헷갈린 적이 없는 저금통일수록 자주 의심해요. 헷갈린 저금통이 많아지면 가끔 리셋에 투표하고, 모든 저금통을 확신할 때만 전체 맞히기에 도전해요.'],
            ['친구 방', '2~4명이 모이면 빈자리를 AI가 채워 4인전으로 시작해요. 방장이 AI 난이도를 골라요. 시간 제한은 넣기 30초, 대답 20초, 의심 10초, 전체 맞히기 45초로 같아요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '위칸 / 아래칸', def: '테이블 위와 아래의 저금통 자리. 차례인 사람만 위칸에 저금통을 들고 있어요.' },
            { term: '지정 색', def: '대답할 동전 색. 흑과 백이 대답마다 번갈아 바뀌어요.' },
            { term: '의심', def: '대답이 틀렸다고 보고 저금통을 여는 것. 맞으면 +1, 틀리면 −1.' },
            { term: '리셋', def: '세 명이 투표하면 모든 저금통을 흑 1·백 1로 되돌리는 것.' },
            { term: '전체 맞히기', def: '리셋 직전, 투표하지 않은 사람이 모든 저금통의 흑·백을 맞히는 도전. +3 / −2.' },
            { term: '헷갈리는 저금통', def: '내 기억이 확실하지 않은 저금통. 의심과 전체 맞히기를 피해야 할 곳이에요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '돼지 저금통은 어디서 할 수 있나요?', a: 'PUZZLTHINK 돼지 저금통 페이지에서 설치나 가입 없이 PC와 모바일 브라우저로 바로 할 수 있어요.' },
      { q: '친구와 할 수 있나요?', a: '네. 친구 방에 2~4명이 모이면 빈자리를 AI가 채워 4인전으로 시작해요. 혼자서는 AI 3명과 해요.' },
      { q: '의심은 언제 하는 게 좋나요?', a: '대답이 틀렸을 확률이 50%를 넘을 때만이에요. 의심이 맞으면 +1, 틀리면 −1이라 그보다 낮으면 손해예요.' },
      { q: '대답 시간이 지나면 어떻게 되나요?', a: '20초 안에 대답하지 않으면 0개라고 말한 것으로 처리돼요. 다른 사람들은 그 대답도 의심할 수 있어요.' },
      { q: 'AI는 동전 수를 다 알고 있나요?', a: '아니요. AI도 공개된 숫자만 기억하고, 난이도에 따라 가끔 잘못 기억해요. 쉬움일수록 자주 헷갈려요.' },
      { q: '기록이 남나요?', a: '로그인하면 1위는 승리, 나머지는 패배로 기록실에 저장돼요.' },
    ],
    cta: { title: '다섯 줄, 기억할 준비 됐나요?', body: '저금통 번호와 숫자를 한 줄씩 들고 AI 3명과 한 판 해 보세요.', button: '돼지 저금통 하러 가기' },
    disclaimer: '돼지 저금통은 방송에 소개된 게임 방식에서 착안해 PUZZLTHINK가 웹용으로 다시 만든 것으로, 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Piggy Bank strategy guide — tracking pigs, when to doubt, resets and all-in | PUZZLTHINK',
      description: "Piggy Bank, inspired by a prison match on The Devil's Plan: Dead Again, in depth: following pigs between the table and under-table slots, the odds at which a doubt pays, the expected value of reset votes and the all-pigs guess (+3/−2), three turns traced, and how the AIs remember.",
      keywords: ['Piggy Bank game strategy', "Devil's Plan piggy bank", 'Piggy Bank memory game', 'Piggy Bank rules', "Devil's Plan prison match"],
    },
    title: 'Piggy Bank strategy guide',
    lead: 'Every coin dropped in is announced. It just is not written down.',
    intro: [
      "Piggy Bank is a four-player memory game: drop black and white coins into five piggy banks, pass them around, and name how many coins of a colour the pig you receive holds. Every drop is **announced truthfully but vanishes after a few seconds, and there are no notes**. Skill means carrying all five pigs' numbers in your head and judging when someone else's answer deserves a doubt.",
      'This guide follows the pigs moving between table and under-table slots over real turns, works out the expected value of doubts, resets and the all-pigs guess, and gives memory tips and notes on the AI.',
    ],
    gamePageTitle: 'Piggy Bank — remember and doubt',
    summary: 'Following moving pigs, the odds at which doubting pays, the value of resets and the all-in guess.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Piggy Bank?',
        blocks: [
          { type: 'p', text: "Piggy Bank is a four-player memory game PUZZLTHINK rebuilt for the web, inspired by a prison match on Netflix's The Devil's Plan: Dead Again." },
          { type: 'p', text: 'Nothing is hidden: the colour and number of every coin dropped is shown to everyone, so in theory everyone knows every pig. But the pigs keep moving between players and each announcement is brief, so memories drift over time. Whoever notices the drift first scores.' },
          { type: 'p', text: 'Solo play is a four-player game against three AIs with different memories; in a friend room, 2–4 people play and AIs fill the empty seats.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Seats and pigs**: everyone has an under-table slot and a table slot. Pigs start with 1 black and 1 white coin; pigs 1–4 go under each player in turn order and pig 5 on the first player\'s table.',
            '**Drop (30 s)**: the player whose turn it is drops 1–5 coins (any mix of black and white) into their **under-table** pig. The colours and counts are announced automatically.',
            '**Pass**: that pig goes to the table slot of any player you choose, and your own table pig drops to your under-table slot.',
            '**Answer (20 s)**: the receiver names how many coins of the asked colour their table pig holds. The asked colour alternates black → white → black with every answer. Running out of time answers 0.',
            '**Doubt (10 s)**: the others may doubt or pass. If everyone passes, the receiver takes the next turn.',
            '**Settling a doubt**: the pig is opened. A wrong answer gives the doubter +1 and the answerer −1; a right answer costs the doubter 1.',
            '**New pig**: the opened pig leaves the game, and whoever lost a point gets a new pig (1 black, 1 white, next number) on their table and takes the turn. There are always five pigs.',
            '**End**: the moment someone reaches 5 points. Equal scores are ordered by the turn order drawn at the start.',
          ] },
          { type: 'h3', text: 'Resets and the all-pigs guess' },
          { type: 'p', text: 'Anyone may vote for a reset at any time. When the third vote comes in, the player who did not vote may spend 45 seconds naming **the black and white count of every pig**: all right is +3, any mistake −2. Then every pig goes back to 1 black and 1 white; scores and pig numbers stay.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations',
        blocks: [
          { type: 'cards', items: [
            { title: 'Which pig did I receive?', body: 'The one the passer just dropped coins into — it came from their under-table slot, so you need what was already inside as well as the coins just added.' },
            { title: 'May I answer wrong on purpose?', body: 'You may, but it never helps. A wrong answer loses 1 if doubted, while a right one cannot lose anything. Always say the number you believe.' },
            { title: 'A wrong doubt?', body: 'The doubter loses 1 point, gets a new pig and takes the turn. The answerer\'s score is unchanged.' },
            { title: 'Can scores go negative?', body: 'Yes, through failed doubts or a failed all-pigs guess.' },
            { title: 'What survives a reset?', body: 'Only the coins change, back to 1 and 1. Scores, pig numbers and who holds which pig where all stay.' },
            { title: 'Who gets the all-pigs guess?', body: 'Whoever had not voted when the third vote came in — in a four-player game, always exactly one person. They may also pass.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — remember five lines',
        blocks: [
          { type: 'p', text: 'There are always five pigs. Keep **one line per pig** in your head — "pig 1: black 2 white 1, pig 2: black 1 white 1, …" — and update only that line when coins go in. Where each pig sits is shown on screen; the numbers are all you need to remember.' },
          { type: 'list', items: [
            '**Everything starts at 1 and 1**: just add the drops. A pig nobody has dropped into is still 1 and 1.',
            '**New pigs are 1 and 1 too**: an opened pig leaves and a new number arrives at 1 and 1. Forget the opened pig\'s numbers.',
            '**Doubt only when sure**: if the chance your doubt is right is p, its value is p × (+1) + (1 − p) × (−1) = 2p − 1. It pays only **above 50%**: +0.4 at 70%, +0.8 at 90%.',
            '**Remember your own drops best**: you know exactly what you put in. If the receiver gets it wrong, that is your best chance to doubt.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — tracking pigs over three turns',
        lead: 'Turn order A → B → C → D. Pigs 1–4 are under each player, pig 5 on A\'s table, all at 1 black 1 white.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Turn 1: A drops 2 black, 1 white into pig 1 → C', body: 'Pig 1 is now 3 black, 2 white and goes to C\'s table; A\'s table pig 5 drops under A. Asked colour black: C says 3. Right, nobody doubts, and C takes the next turn.' },
            { title: 'Turn 2: C drops 4 white into pig 3 → A', body: 'C\'s under-table pig 3 becomes 1 black, 5 white and goes to A\'s table; C\'s table pig 1 (3 black, 2 white) drops under C. The asked colour is now white: A says 4.' },
            { title: 'The doubt: B doubts → right', body: 'Pig 3 holds 5 white. A was wrong: B +1, A −1. Pig 3 leaves, and A, who lost the point, gets new pig 6 (1 and 1) on the table and takes the turn. Asked colour: black again.' },
            { title: 'Turn 3: A drops 1 black, 1 white into pig 5 → D', body: 'A\'s under-table pig 5 becomes 2 black, 2 white and goes to D\'s table; A\'s table pig 6 drops under A. D answers black: 2.' },
          ] },
          { type: 'table', caption: 'Where the pigs are after three turns', head: ['Pig', 'Slot', 'Black', 'White'], rows: [
            ['1', 'under C', '3', '2'],
            ['2', 'under B', '1', '1'],
            ['4', 'under D', '1', '1'],
            ['5', 'D\'s table', '2', '2'],
            ['6', 'under A', '1', '1'],
          ] },
          { type: 'callout', tone: 'tip', title: 'What these turns show', text: 'A got it wrong by remembering only the 4 white just dropped and forgetting pig 3 started with 1 and 1. A received pig holds "what was in it + what was just dropped". And when C next takes a turn, C will drop into and pass pig 1 (3 black, 2 white), so that is the line to hold tightest.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — shake other people\'s memories',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Shaking', title: 'Pass the busiest pig', body: 'If your under-table pig has had many drops, the receiver is likely to slip. Make the numbers bigger and pass it to whoever seems shakiest.' },
            { tag: 'Shaking', title: 'Aim at the asked colour', body: 'The asked colour alternates with every answer. Work out the next one and load that colour so the receiver has a bigger count to get right.' },
            { tag: 'Leader', title: 'Pass to the leader', body: 'If someone is on 4, give them more chances to slip: a wrong answer is −1 for them and +1 for whoever doubts.' },
            { tag: 'Turn', title: 'Who takes the turn', body: 'With no doubt the receiver takes the turn; after a doubt, the player who lost a point does. The turn lets you choose where your under-table pig goes, so the better you know that pig, the stronger your turn.' },
          ] },
          { type: 'p', text: 'A doubt swings the gap by two: a right doubt is +1 for you and −1 for them. When chasing the leader, watch their answers especially closely.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — reset votes and the all-pigs guess',
        blocks: [
          { type: 'h3', text: 'The value of the all-pigs guess' },
          { type: 'p', text: 'It pays +3 or costs 2. If q is your chance of getting all ten numbers of the five pigs right, its value is 3q − 2(1 − q) = 5q − 2, so it pays only **when q is above 40%**. If even one pig is uncertain, pass.' },
          { type: 'h3', text: 'Wait instead of voting' },
          { type: 'p', text: 'Only a player who had not voted when the third vote arrives may guess. If you are sure of all five pigs, do not vote — wait for the others to. If your memory has gone hazy, vote early and let everyone restart from 1 and 1.' },
          { type: 'h3', text: 'Read other people\'s votes' },
          { type: 'p', text: 'A reset vote announces "my memory has slipped". That player\'s answers are more likely wrong — grounds for a doubt — while someone holding out may be aiming for the all-pigs guess.' },
          { type: 'h3', text: 'The maths near 5 points' },
          { type: 'p', text: 'The game ends the moment someone reaches 5. On 3, one successful all-pigs guess wins outright; on 4, one right doubt does. When an opponent is on 4, make sure the pig you must answer about is one you know exactly, so they have nothing to doubt.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Remembering only the latest drop**: the received pig also holds what was already inside. Start from 1 and 1.',
            '**Mixing up the asked colour**: it alternates with every answer. Count the wrong colour and a correct memory still loses.',
            '**Doubting at even odds**: a 50% doubt is worth nothing; below that it costs.',
            '**Guessing all pigs without certainty**: one wrong number of ten costs 2.',
            '**Keeping opened pigs in your head**: drop the pig that left and add the new number at 1 and 1.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['All levels', 'The AIs only remember what was announced. On each drop they recall the black and the white count correctly with a set chance; otherwise they remember one coin off and mark that pig as uncertain.'],
            ['Easy', 'The three AIs are easy, easy and normal. An easy AI recalls each count 62% of the time.'],
            ['Normal', 'A mix of easy, normal and hard. A normal AI recalls 80%.'],
            ['Hard', 'Normal, hard and hard. A hard AI recalls 93%.'],
            ['AI doubts and resets', 'An AI doubts only answers that disagree with its memory, and more readily for pigs it has never been unsure about. With many uncertain pigs it sometimes votes to reset, and it tries the all-pigs guess only when sure of every pig.'],
            ['Friend rooms', 'With 2–4 people, AIs fill the empty seats for a four-player game; the host picks the AI level. The clocks are the same: 30 s to drop, 20 s to answer, 10 s to doubt, 45 s for the all-pigs guess.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Table / under-table slot', def: 'Each player\'s two pig spots. Only the player whose turn it is holds a pig on the table.' },
            { term: 'Asked colour', def: 'The colour to count; it alternates black and white with every answer.' },
            { term: 'Doubt', def: 'Opening the pig because you think the answer is wrong: +1 if right, −1 if not.' },
            { term: 'Reset', def: 'Three votes return every pig to 1 black, 1 white.' },
            { term: 'All-pigs guess', def: 'Just before a reset, the non-voter names every pig\'s counts: +3 / −2.' },
            { term: 'Uncertain pig', def: 'A pig you are not sure of — avoid doubting or all-in guessing on it.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where can I play Piggy Bank?', a: 'On the PUZZLTHINK Piggy Bank page, in any PC or mobile browser, with no install or sign-up.' },
      { q: 'Can I play with friends?', a: 'Yes. Once 2–4 people are in a friend room, AIs fill the empty seats for a four-player game. Alone, you play three AIs.' },
      { q: 'When should I doubt?', a: 'Only when the answer is more than 50% likely to be wrong. A right doubt is +1 and a wrong one −1, so anything less loses on average.' },
      { q: 'What if I run out of time to answer?', a: 'After 20 seconds you are treated as answering 0, and the others may doubt that too.' },
      { q: 'Does the AI know all the counts?', a: 'No. It remembers only what was announced and sometimes misremembers depending on its level; easy AIs slip most.' },
      { q: 'Are results recorded?', a: 'Signed in, first place is saved as a win and other places as losses.' },
    ],
    cta: { title: 'Ready to hold five lines?', body: 'Keep one line per pig and play a table with three AIs.', button: 'Play Piggy Bank' },
    disclaimer: 'Piggy Bank is PUZZLTHINK\'s web version of a game format seen on TV and is not affiliated with the broadcaster or producers.',
  },
};

export default guide;
