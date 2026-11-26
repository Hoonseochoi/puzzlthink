// Monorail guide. Rules and numbers follow src/lib/monorail.ts (TILE_COUNT 16, the two horizontal STATIONS side by
// side, legalMove: 1–3 tiles in one straight contiguous row that touch the layout, rails free to mismatch while
// playing; isComplete: one loop through every tile; declareImpossible at the start of a turn, proveCompletion with
// any number of tiles anywhere, giveUpChallenge showing a completion that existed; chooseMonorailAction: normal and
// hard, every AI move keeps a full loop possible, tempo on "remaining % 4") and src/lib/monorailRoom.ts (turns of
// 90/60/30 s, a timeout loses, the first player drawn at random). MonorailGame.tsx: you move first against VICKY and
// there is no clock. Inline guide: MonorailGuide in ko/en.json. The walkthrough uses coordinates relative to the
// left station; every placement in it was checked against legalMove and the loop shapes against PORTS.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'monorail',
  origin: { kind: 'show', show: 'genius2' },
  updated: '2026-11-26',
  related: ['wallgo', 'colorLinkDuel', 'blackWhite', 'nineMensMorris'],
  inlineNamespace: 'MonorailGuide',
  ko: {
    meta: {
      title: '모노레일 공략 — 짝수 루프, 3칸 끝내기, 불가능 선언 | PUZZLTHINK',
      description: '더 지니어스 모노레일 공략. 루프가 항상 짝수 장인 이유, 6장짜리 최단 고리, 일직선 3칸 끝내기와 "4칸 일렬" 함정, 우회로로 차례 뒤집기, 불가능 선언과 완성 시도, 좌표로 따라가는 초반 수순까지 정리했어요.',
      keywords: ['모노레일 공략', '모노레일 게임', '모노레일 필승법', '더 지니어스 모노레일', '모노레일 규칙', 'Venice Connection', '모노레일 불가능 선언', '룰 브레이커 모노레일'],
    },
    title: '모노레일 공략',
    lead: '열여섯 장으로 고리 하나. 마지막 조각을 놓는 사람이 이겨요.',
    intro: [
      '모노레일은 기차역 두 장에서 시작해, 직선·곡선 철로 타일을 번갈아 1~3장씩 놓아 **판 위의 모든 타일이 하나의 순환선**이 되게 만드는 2인 게임이에요. 순환선을 완성한 사람이 이기고, 운이 끼어들 자리가 없어요. 철로가 당장 맞지 않아도 놓을 수 있어서, 지금 모양보다 "완성까지 몇 칸이 어떤 모양으로 남는가"를 읽는 게 핵심이에요.',
      '이 공략은 루프의 짝수 성질과 최단 고리, 3칸 끝내기와 그 반대인 4칸 함정, 우회로로 차례를 뒤집는 법, 불가능 선언의 판정을 다루고, 실제 좌표로 초반 네 수를 따라가 봐요.',
    ],
    gamePageTitle: '모노레일 — 마지막 한 장을 남기는 공간 수싸움',
    summary: '짝수 루프와 6장 최단 고리, 3칸 끝내기와 4칸 함정, 우회로, 불가능 선언.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '모노레일은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '모노레일은 「더 지니어스: 룰 브레이커」에 등장해 알려진 게임으로, 보드게임 Venice Connection을 바탕으로 해요. 둘이 함께 하나의 고리를 만들지만, 고리를 닫는 마지막 수를 두는 사람만 이기는 구조라 협력처럼 보이는 경쟁이에요.' },
          { type: 'p', text: '운 요소가 없고 모든 정보가 공개된 게임이라, 결국은 남은 칸과 남은 장수를 정확히 세는 사람이 이겨요. 철로 끝이 놓는 순간 맞을 필요가 없다는 규칙 덕분에 길이 여러 갈래로 열려 있어서, 그 계산이 생각보다 깊어요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 AI(중간·어려움)와 두거나, 친구 방과 오픈 대전에서 1:1로 대결할 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**시작**: 가운데에 기차역 두 장이 나란히 놓여 있어요. 두 역은 가로 철로이고, 안쪽 끝끼리 붙어 있어요. 철로 타일은 16장이고, 한 장마다 직선(가로·세로)과 곡선(네 방향) 중 하나로 놓아요.',
            '**차례**: 번갈아 1~3장을 놓아요. 여러 장을 놓을 때는 한 줄(같은 가로줄이나 같은 세로줄)에 빈틈없이 붙여 놓아야 해요.',
            '**놓을 수 있는 곳**: 새 묶음은 이미 놓인 타일(역 포함)에 상하좌우로 닿아야 해요. 철로 방향은 놓는 순간 맞지 않아도 돼요.',
            '**승리**: 놓인 모든 타일이 두 역을 포함한 단 하나의 순환선이 되면, 마지막으로 놓은 사람이 이겨요. 16장을 다 쓸 필요는 없어요.',
            '**불가능 선언**: 자기 차례를 시작할 때(타일을 고르기 전) "불가능"을 선언할 수 있어요. 그러면 상대가 남은 타일로 완성을 시도해요. 완성하면 상대가, 포기하면 선언한 쪽이 이겨요.',
          ] },
          { type: 'h3', text: '완성 시도의 특별 규칙' },
          { type: 'p', text: '불가능 선언을 받은 쪽은 1~3장 제한과 일렬 규칙 없이, 남은 타일을 원하는 빈칸에 몇 장이든 한꺼번에 놓아 완성을 보여 줘요. 완성하지 못하고 포기하면, 실제로는 완성할 수 있었더라도 선언한 쪽이 이겨요. 이때 결과 화면에 가능했던 완성 예가 반투명 타일로 표시돼요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 판정 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '어긋난 타일은 나중에 고칠 수 있나요?', body: '아니요. 한 번 놓은 타일은 움직이거나 바꿀 수 없고, 최종 순환선에 그대로 들어가야 해요. 그래서 어긋난 타일은 "앞으로 루프가 반드시 이렇게 지나가야 한다"는 약속이 돼요.' },
            { title: '내 수 때문에 완성이 불가능해지면?', body: '상대가 다음 차례 시작에 불가능을 선언하면, 나는 완성을 보여 줄 수 없으니 져요. 막다른 곡선이나 역 옆구리를 향하는 철로를 놓기 전에 꼭 확인하세요.' },
            { title: '16장을 다 놓았는데 완성이 안 됐다면?', body: '더 놓을 타일이 없으니 다음 차례의 사람이 불가능을 선언하면 이겨요.' },
            { title: '불가능 선언이 틀렸다면?', body: '상대가 실제로 완성해 보이면 상대가 이겨요. 선언은 "남은 장수로 지금 놓인 모든 타일을 포함한 고리를 만들 수 없다"고 확신할 때만 하세요.' },
            { title: '판 끝에 막히지 않나요?', body: '실제 테이블에는 끝이 없어요. 화면의 판은 16장으로 만들 수 있는 어떤 고리도 다 들어가는 크기라, 판 끝 때문에 완성이 막히는 일은 없어요.' },
            { title: '친구전에서 시간이 다 되면?', body: '턴 시간(90·60·30초 중 방장 선택)이 지나면 그 사람이 져요. AI전에는 시간 제한이 없어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 루프의 모양부터 알기',
        blocks: [
          { type: 'cards', items: [
            { tag: '짝수', title: '완성 루프는 항상 짝수 칸', body: '격자 위의 닫힌 길은 오른쪽으로 간 만큼 왼쪽으로, 아래로 간 만큼 위로 돌아와야 해서 칸 수가 반드시 짝수예요. 역 두 칸을 빼면 철로 타일도 6·8·10·12·14·16장 중 하나로만 끝나요. 루프를 한쪽으로 불룩하게 밀면 한 번에 2칸씩 늘어나요.' },
            { tag: '최단', title: '가장 짧은 고리는 6장', body: '두 역의 바깥 끝에서 한 칸씩 나와 아래(또는 위)로 꺾어 한 줄 돌아 만나는 2×4 고리예요. 곡선 4장과 직선 2장이에요. 초반에 이 고리의 남은 칸을 상대가 한 번에 채울 수 있게 두면 바로 져요.' },
            { tag: '곡선', title: '곡선은 최소 4장', body: '닫힌 고리는 바깥으로 꺾이는 모서리가 안으로 꺾이는 모서리보다 정확히 4개 많아요. 곡선 한 장은 루프가 지나갈 두 방향을 못 박기 때문에, 직선보다 상대의 선택지를 훨씬 많이 줄여요.' },
            { tag: '끝내기', title: '일직선 3칸 이하면 끝', body: '한 번에 한 줄로 최대 3장을 놓을 수 있어요. 완성까지 필요한 빈칸이 한 줄로 붙은 3칸 이하가 되는 순간, 차례가 온 사람이 이겨요. 내 수를 둔 뒤 그런 모양이 남지 않는지 먼저 확인하세요.' },
          ] },
          { type: 'p', text: '차례가 오면 먼저 두 가지를 확인하는 습관을 들이세요. 첫째, 지금 판의 모든 타일을 포함한 고리가 남은 장수 안에 가능한가(불가능이면 선언해서 이겨요). 둘째, 한 번에 끝낼 수 있는 일직선 3칸 이하가 있는가(있으면 바로 완성해요).' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 초반 네 수와 "4칸 일렬"',
        lead: '왼쪽 역을 (0,0), 오른쪽 역을 (0,1)로 두고 (행, 열)로 적을게요. 행은 아래로 갈수록 커지고, 열은 오른쪽으로 갈수록 커져요. 내가 선공이에요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1수(나): (0,−1)에 곡선(동·남)', body: '왼쪽 역 바로 왼쪽에 역과 이어지고 아래로 꺾이는 곡선을 놓았어요. 이제 루프는 반드시 이 칸에서 아래로 내려가요. 6장 최단 고리로 끝내려면 (1,−1), (1,0), (1,1), (1,2), (0,2) 다섯 칸이 남아요. 한 줄에 다 있지 않으니 상대는 한 번에 못 끝내요.' },
            { title: '2수(상대): (0,2)에 곡선(서·남)', body: '오른쪽 역 바로 오른쪽에 대칭으로 놓았어요. 6장 고리에 남은 칸은 (1,−1)~(1,2) 네 칸으로, **한 줄로 붙은 4칸**이에요. 나는 한 번에 3장까지만 놓을 수 있어서 끝낼 수 없어요.' },
            { title: '3수(나)의 고민', body: '네 칸 중 끝의 1장이나 붙은 3장을 놓으면 한 줄로 붙은 3칸 이하가 남아 상대가 끝내요. 가운데 한 칸을 놓아도 상대가 남은 세 칸 중 하나를 골라 놓으면, 떨어진 두 칸이 남아 내가 하나를 놓고 상대가 마지막을 놓아요. 그래서 이 고리 안에서는 내가 져요. 해법은 **우회**예요: (1,−1)에 세로 직선을 놓아 루프를 한 줄 더 아래로 보내요.' },
            { title: '4수(상대): (1,2)에 세로 직선', body: '이제 고리는 8장짜리가 돼요. 남은 칸은 (2,−1), (2,0), (2,1), (2,2) 네 칸이고, 상대가 오른쪽도 한 줄 내려서 다시 **한 줄로 붙은 4칸**을 나에게 넘겼어요. 같은 모양이 한 줄 아래에서 반복된 거예요.' },
          ] },
          { type: 'callout', tone: 'tip', title: '이 수순에서 배울 점', text: '"한 줄로 붙은 4칸"을 넘겨받으면 그 고리 안에서는 지는 쪽이에요. 우회는 고리를 2칸씩 늘려 차례를 바꾸는 수단이지만, 상대도 같은 방식으로 맞받아칠 수 있어요. 그리고 우회할 때마다 16장 한도가 줄어요. 결국 승부는 "몇 번 더 우회할 수 있는가"와, 우회할 때 4칸 일렬이 아닌 꺾인 모양을 남길 수 있는가에서 갈려요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 남은 칸 수와 모양 세기',
        blocks: [
          { type: 'p', text: '한 번에 1~3장을 가져가는 게임에서는 상대에게 4의 배수를 남기면 이긴다는 계산이 유명해요. 모노레일도 비슷하지만 두 가지가 달라요. 3장을 놓으려면 그 세 칸이 한 줄로 붙어 있어야 하고, 우회로 필요한 칸을 2칸씩 늘릴 수 있어요. 그래서 "남은 칸 수"와 "그 칸들의 모양"을 함께 세요.' },
          { type: 'cards', items: [
            { tag: '모양', title: '꺾인 칸은 한 번에 못 채워요', body: '필요한 칸이 두 줄에 걸쳐 있으면 한 번에 다 놓을 수 없어요. 3칸만 남았어도 ㄱ자로 꺾여 있으면 상대는 끝내지 못해요. 내 수 뒤에 남는 칸이 꺾여 있는지 확인하세요.' },
            { tag: '우회', title: '우회는 2칸 단위', body: '루프를 한 줄 밀어내면 필요한 칸이 2칸 늘어요. 남은 칸 수의 리듬이 나에게 불리하면 우회로 바꾸고, 유리하면 상대가 우회할 길을 먼저 막아요.' },
            { tag: '장수', title: '16장 한도를 세기', body: '놓인 철로 + 남은 칸 ≤ 16이어야 해요. 한도에 가까워지면 우회할 여유가 사라지고, 그때 남은 칸의 모양이 그대로 승패가 돼요.' },
            { tag: '고정', title: '곡선으로 길 묶기', body: '곡선은 루프의 방향을 두 개 고정해요. 상대가 우회할 길목에 곡선을 먼저 놓으면, 상대의 선택지가 크게 줄어요.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 불가능 선언과 열린 길',
        blocks: [
          { type: 'h3', text: '불가능은 매 차례 시작에 확인' },
          { type: 'p', text: '불가능 선언은 타일을 고르기 전에만 할 수 있어요. 상대가 막다른 곡선, 서로 엇갈린 직선, 역의 옆구리를 향한 철로를 남겼다면 바로 선언해서 이겨요. 반대로 상대가 이기는 완성을 숨기고 있는데 섣불리 선언하면, 상대가 그 자리에서 완성해 보이고 이겨요.' },
          { type: 'h3', text: '어긋난 타일을 일부러 놓기' },
          { type: 'p', text: '철로는 놓는 순간 맞을 필요가 없어요. 루프에서 떨어진 칸에 미리 타일을 놓으면 "루프가 여기를 반드시 지나가야 한다"는 조건이 생겨요. 이렇게 길을 미리 정해 두면 상대의 우회 경로를 막을 수 있지만, 그 조건 때문에 완성이 불가능해지면 상대의 불가능 선언에 져요. 놓기 전에 그 타일을 포함한 완성 경로를 하나는 머릿속에 그려 두세요.' },
          { type: 'h3', text: '선공은 정확하게, 후공은 넓게' },
          { type: 'p', text: '선공은 정해진 수순을 정확히 지켜야 하고, 후공은 상대의 작은 실수를 기다리는 게임이에요. 후공이라면 루프가 갈 수 있는 길을 여러 갈래로 남겨 칸 계산을 복잡하게 만들고, 상대가 끝내기 계산을 틀리는 순간을 노리세요. 대칭으로 따라 두는 작전은 상대가 대칭축 위의 칸을 먼저 차지하면 짝이 깨지니 믿을 만하지 않아요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**한 줄 3칸 이하를 남기기**: 내 수 뒤에 완성까지 필요한 칸이 한 줄로 붙은 3칸 이하라면 상대가 바로 끝내요.',
            '**불가능 확인을 건너뛰기**: 차례를 시작하면 먼저 완성이 가능한지 보세요. 상대의 실수는 선언 한 번으로 승리예요.',
            '**막다른 타일 놓기**: 놓는 순간 맞을 필요가 없다고 아무렇게나 놓으면, 완성이 불가능해져 상대의 선언에 져요.',
            '**장수 한도를 잊기**: 우회는 2칸씩 들어요. 16장을 넘기는 고리는 만들 수 없어요.',
            '**섣부른 불가능 선언**: 상대가 완성을 보여 주면 져요. 확신이 없다면 두는 쪽이 나아요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구 방, 복기',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI전', 'AI VICKY와 두고, 내가 선공이에요. 시간 제한은 없어요. 어느 난이도든 AI는 완성이 불가능해지는 수를 두지 않아서 공짜 불가능 승리는 주지 않아요. 내가 불가능을 선언하면 AI가 그 자리에서 완성해 보이거나 패배를 인정해요.'],
            ['중간', '완성 경로를 몇 개 살펴보고 좋은 수 중에서 느슨하게 골라요. 세 번에 한 번쯤은 완성만 유지하는 아무 수나 둬요.'],
            ['어려움', '더 많은 완성 경로를 비교하고 세 수 앞까지 읽어요. 남은 칸이 4의 배수가 되게 넘기는 수를 선호해요. 똑같이 좋은 수 사이에서는 무작위로 골라 같은 판이 반복되지 않아요.'],
            ['친구 방·오픈 대전', '링크·4자리 코드나 오픈 대전으로 1:1 대결해요. 선공은 무작위로 정해지고, 턴 시간(90·60·30초)이 지나면 시간패예요.'],
            ['복기', '끝난 판은 한 수씩 다시 볼 수 있어요. 어디서 4칸 일렬을 넘겨받았는지 확인해 보세요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '순환선(루프)', def: '두 역과 놓인 모든 타일을 지나 제자리로 돌아오는 하나의 닫힌 철로.' },
            { term: '직선 / 곡선', def: '가로·세로로 곧게 지나는 타일과, 두 방향을 잇는 꺾인 타일(네 종류).' },
            { term: '필요한 칸', def: '지금 놓인 타일로 완성할 수 있는 고리에서 아직 비어 있는 칸.' },
            { term: '3칸 끝내기', def: '필요한 칸이 한 줄로 붙은 3칸 이하일 때 한 번에 완성하는 것.' },
            { term: '우회', def: '루프를 한쪽으로 밀어 필요한 칸을 2칸 늘리는 수.' },
            { term: '불가능 선언', def: '차례 시작에 "완성 불가능"을 주장하기. 상대가 완성하면 상대 승, 포기하면 선언자 승.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '친구와 온라인으로 할 수 있나요?', a: '네. 친구 방 링크·4자리 코드와 로그인 기반 오픈 대전 1:1을 모두 지원해요.' },
      { q: '16장을 다 써야 하나요?', a: '아니요. 더 적은 장수로 끝내도 돼요. 다만 놓인 타일은 모두 최종 순환선에 들어가야 하고, 완성 루프의 철로 수는 항상 짝수(6~16장)예요.' },
      { q: '불가능을 선언하면 어떻게 되나요?', a: '상대가 남은 타일로 직접 완성을 시도해요. 완성하면 상대가, 포기하면 선언한 쪽이 이겨요. AI에게 선언하면 AI가 그 자리에서 완성해 보이거나 패배를 인정해요.' },
      { q: '철로가 어긋난 타일도 놓을 수 있나요?', a: '네. 기존 타일에 맞닿기만 하면 돼요. 철로 연결은 완성 순간에만 검사해요.' },
      { q: 'AI 난이도는 어떻게 다른가요?', a: '중간은 좋은 수와 느슨한 수를 섞고, 어려움은 더 많은 완성 경로와 세 수 앞을 읽어요. 둘 다 완성이 불가능해지는 수는 두지 않아요.' },
      { q: '필승법이 있나요?', a: '운이 없는 완전정보 게임이라 이론상 한쪽에 필승 수순이 있지만, 실전에서는 남은 칸의 수와 모양, 우회 여유를 끝까지 세는 쪽이 이겨요.' },
    ],
    cta: { title: '첫 곡선은 어디에 놓을까요?', body: '남은 칸이 한 줄 4칸이 되게 넘기는 감각을 AI전에서 익혀 보세요.', button: '모노레일 하러 가기' },
    disclaimer: 'Venice Connection과 방송 속 모노레일을 참고한 비공식 팬 제작 웹 게임이며 방송사·제작사·원작 권리자와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Monorail strategy guide — even loops, the three-in-a-row finish, calling Impossible | PUZZLTHINK',
      description: 'Monorail from The Genius: Rule Breaker, in depth: why every loop uses an even number of tiles, the six-tile shortest loop, the three-in-a-row finish and the four-in-a-row trap, detours that flip the tempo, calling Impossible, and an opening followed by coordinates.',
      keywords: ['Monorail strategy', 'Monorail board game', 'Venice Connection strategy', 'The Genius Monorail', 'Monorail rules', 'Monorail Impossible'],
    },
    title: 'Monorail strategy guide',
    lead: 'One loop from sixteen tiles. Whoever lays the last piece wins.',
    intro: [
      'Monorail starts from two station tiles; players take turns laying 1–3 straight or curved rail tiles until **every tile on the table forms a single loop**. Whoever completes it wins, and there is no luck involved. Rails do not have to match the moment they are laid, so the key is reading how many empty cells the loop still needs and in what shape.',
      'This guide covers the even-loop property and the shortest loop, the three-in-a-row finish and its mirror image, the four-in-a-row trap, flipping the tempo with detours, how Impossible calls are judged, and the first four moves of a game by coordinates.',
    ],
    gamePageTitle: 'Monorail — win the fight for the final tile',
    summary: 'Even loops and the six-tile minimum, three-in-a-row finishes and four-in-a-row traps, detours, Impossible.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Monorail?',
        blocks: [
          { type: 'p', text: 'Monorail became known through The Genius: Rule Breaker and is based on the board game Venice Connection. Both players build one shared loop, but only the player who closes it wins — a competition that looks like cooperation.' },
          { type: 'p', text: 'With no luck and everything in the open, the player who counts the remaining cells and tiles correctly wins. Because rails need not match when laid, many routes stay open, and the counting runs deeper than it looks.' },
          { type: 'p', text: 'On PUZZLTHINK you can play the AI (Medium or Hard) or play one-on-one in friend rooms and open matches.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Start**: two stations sit side by side in the middle, horizontal rails joined at their inner ends. There are 16 rail tiles, each laid as a straight (horizontal or vertical) or a curve (four orientations).',
            '**Turns**: lay 1–3 tiles. Several tiles must go in one row or column, with no gaps.',
            '**Where**: the new group must touch an existing tile (stations included) orthogonally. Rails need not line up when laid.',
            '**Winning**: when every tile on the table forms a single loop through both stations, the player who laid the last tile wins. You do not need all 16.',
            '**Impossible**: at the start of your turn (before choosing tiles) you may declare Impossible. Your opponent then tries to finish the loop with the remaining tiles: if they do, they win; if they give up, you win.',
          ] },
          { type: 'h3', text: 'Special rules for the completion attempt' },
          { type: 'p', text: 'The challenged player may lay any number of the remaining tiles on any empty cells at once, free of the 1–3 limit and the row rule. Giving up hands the win to the caller even if a completion existed; the result screen then shows one possible completion in translucent tiles.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rulings',
        blocks: [
          { type: 'cards', items: [
            { title: 'Can a mismatched tile be fixed later?', body: 'No. Laid tiles never move or change and must be part of the final loop. A mismatched tile is a promise: "the loop will pass through here this way".' },
            { title: 'What if my move makes completion impossible?', body: 'Your opponent declares Impossible at the start of their turn and you cannot show a completion, so you lose. Check before laying dead-end curves or rails aimed at a station\'s side.' },
            { title: 'All 16 tiles laid, no loop?', body: 'There is nothing left to lay, so whoever is next declares Impossible and wins.' },
            { title: 'A wrong Impossible call?', body: 'If the opponent completes the loop, they win. Declare only when you are sure no loop with the remaining tiles can include every tile on the table.' },
            { title: 'Can the board edge block me?', body: 'The real table has no edge, and the on-screen board is big enough for any loop 16 tiles can make, so the edge never decides anything.' },
            { title: 'Running out of time in a friend match?', body: 'When the turn clock (90, 60 or 30 seconds, the host\'s choice) runs out, that player loses. Games against the AI have no clock.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — know the shape of a loop',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Even', title: 'Loops always use an even number of cells', body: 'A closed path on a grid must come back left as far as it went right and up as far as it went down, so its length is always even. Minus the two stations, a finished loop uses 6, 8, 10, 12, 14 or 16 rail tiles, and pushing it out by one row adds 2 at a time.' },
            { tag: 'Shortest', title: 'The shortest loop is 6 tiles', body: 'Step out one cell from each station\'s outer end, turn down (or up) and meet along one row: a 2×4 ring of four curves and two straights. Leave its remaining cells open for one move of your opponent\'s, and you lose at once.' },
            { tag: 'Curves', title: 'At least four curves', body: 'A closed loop has exactly four more outward corners than inward ones. A curve fixes two directions of the route, cutting your opponent\'s options far more than a straight.' },
            { tag: 'Finish', title: 'Three in a row or fewer ends it', body: 'You can lay up to three tiles in a line. The moment the cells still needed form a straight run of three or fewer, the player to move wins. Check that your move does not leave that.' },
          ] },
          { type: 'p', text: 'Make two checks the habit of every turn. First: can any loop including every tile on the table still be built with the tiles left? (If not, declare Impossible and win.) Second: is there a straight run of three or fewer that finishes it? (If so, finish now.)' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — four opening moves and "four in a row"',
        lead: 'Call the left station (0,0) and the right station (0,1), writing cells as (row, column); rows grow downward, columns to the right. You move first.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Move 1 (you): a curve (east–south) at (0,−1)', body: 'Just left of the left station, joining it and turning down: the loop must now go down from here. To finish the six-tile loop, (1,−1), (1,0), (1,1), (1,2) and (0,2) remain — not in one line, so your opponent cannot finish.' },
            { title: 'Move 2 (opponent): a curve (west–south) at (0,2)', body: 'The mirror move on the right. The six-tile loop now needs (1,−1) to (1,2): **four cells in one row**. You can lay only three per turn, so you cannot finish.' },
            { title: 'Move 3 (you): the problem', body: 'Lay an end tile or three joined tiles and a straight run of three or fewer is left for them. Lay a middle tile and they lay one of the remaining three, leaving two separated cells: you lay one, they lay the last. Inside this loop, you lose. The way out is a **detour**: a vertical straight at (1,−1) sends the loop one row lower.' },
            { title: 'Move 4 (opponent): a vertical straight at (1,2)', body: 'The loop is now eight tiles. The cells left are (2,−1) to (2,2) — and by taking the right side down a row too, your opponent has handed you **four in a row** again. The same shape, one row lower.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'What this opening shows', text: 'Receiving four cells in a row means losing that version of the loop. A detour changes the tempo by adding two cells, but your opponent can answer in kind, and every detour eats into the 16-tile limit. The game comes down to how many detours remain, and whether a detour can leave a bent shape instead of a straight four.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — count the cells and their shape',
        blocks: [
          { type: 'p', text: 'In take-away games where you remove 1–3 at a time, leaving a multiple of four wins. Monorail is similar with two twists: three tiles can only be laid if the three cells are in one joined line, and detours can add two cells at a time. So count both the number of needed cells and their shape.' },
          { type: 'cards', items: [
            { tag: 'Shape', title: 'Bent cells cannot be filled at once', body: 'Cells spread over two lines cannot all be filled in one move. Even three cells, bent into an L, cannot be finished by your opponent. Check whether what you leave is bent.' },
            { tag: 'Detour', title: 'Detours come in twos', body: 'Pushing the loop out one row adds two needed cells. If the rhythm of remaining cells is against you, change it with a detour; if it favours you, block the routes your opponent could detour through.' },
            { tag: 'Tiles', title: 'Count the 16-tile limit', body: 'Tiles laid plus cells needed must stay at or under 16. Near the limit there is no room left to detour, and the shape of the remaining cells becomes the result.' },
            { tag: 'Fixing', title: 'Pin routes with curves', body: 'A curve fixes two of the loop\'s directions. Lay one where your opponent would detour and their options shrink drastically.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — Impossible calls and open routes',
        blocks: [
          { type: 'h3', text: 'Check Impossible at the start of every turn' },
          { type: 'p', text: 'You can only declare before choosing tiles. If your opponent left a dead-end curve, crossed straights or a rail aimed at a station\'s side, declare and win. But call it while they hold a hidden completion and they will lay it out on the spot and win.' },
          { type: 'h3', text: 'Laying a mismatched tile on purpose' },
          { type: 'p', text: 'Rails need not match when laid. A tile placed away from the current loop adds the condition "the loop must pass here". That can close off your opponent\'s detours — but if the condition makes completion impossible, their Impossible call beats you. Before laying it, have at least one completion through it in mind.' },
          { type: 'h3', text: 'Precise as first player, broad as second' },
          { type: 'p', text: 'The first player has to keep to an exact line; the second waits for small mistakes. As second player, keep several routes open to make the counting complicated, and pounce when your opponent miscounts the finish. Mirroring your opponent is unreliable: once they take a cell on the axis of symmetry, the pairing breaks.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Leaving three or fewer in a row**: if the cells needed after your move form a straight run of three or fewer, your opponent finishes.',
            '**Skipping the Impossible check**: look first at whether completion is still possible. Your opponent\'s mistake is one call away from your win.',
            '**Laying dead ends**: "rails need not match yet" is not "anything goes". A tile that makes completion impossible loses to an Impossible call.',
            '**Forgetting the tile limit**: detours cost two tiles each, and no loop can exceed 16.',
            '**Calling Impossible too early**: if they show a completion, you lose. When unsure, play on.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend rooms, replay',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['Against the AI', 'You play VICKY and move first, with no clock. At every level the AI never makes completion impossible, so it never hands you a free Impossible win. If you declare Impossible, it either completes the loop in front of you or concedes.'],
            ['Medium', 'Looks at a few completion routes and picks loosely among good moves; about one turn in three it plays any move that keeps a completion.'],
            ['Hard', 'Compares more completion routes and reads three moves ahead, preferring moves that leave a multiple of four cells. Between equally good moves it picks at random, so games do not repeat.'],
            ['Friend rooms and open matches', 'One-on-one by link, 4-digit code or open match. The first player is drawn at random, and running out of turn time (90, 60 or 30 seconds) loses.'],
            ['Replay', 'Step through a finished game move by move and find where you were handed four in a row.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Loop', def: 'The single closed track through both stations and every tile laid.' },
            { term: 'Straight / curve', def: 'A tile running straight across or down, and a tile joining two directions at a corner (four kinds).' },
            { term: 'Needed cells', def: 'The empty cells of a loop that the tiles on the table could still complete.' },
            { term: 'Three-in-a-row finish', def: 'Completing the loop in one move when the needed cells are a straight run of three or fewer.' },
            { term: 'Detour', def: 'Pushing the loop out to add two needed cells.' },
            { term: 'Impossible', def: 'A call at the start of a turn that no completion exists: if the opponent completes it they win, if they give up the caller wins.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Can I play friends online?', a: 'Yes — friend rooms by link or 4-digit code, and signed-in one-on-one open matches.' },
      { q: 'Do I have to use all 16 tiles?', a: 'No. You may finish with fewer, but every tile laid must be in the final loop, and a finished loop always uses an even number of rail tiles (6–16).' },
      { q: 'What happens when I declare Impossible?', a: 'Your opponent tries to finish with the remaining tiles: finishing wins for them, giving up wins for you. The AI either completes it on the spot or concedes.' },
      { q: 'Can I lay a tile whose rails do not match?', a: 'Yes, as long as it touches an existing tile. Connections are checked only when the loop is complete.' },
      { q: 'How do the AI levels differ?', a: 'Medium mixes good and loose moves; Hard reads more completion routes and three moves ahead. Neither ever makes completion impossible.' },
      { q: 'Is there a winning strategy?', a: 'As a luck-free game of perfect information, one side has a winning line in theory; in practice, the player who keeps counting remaining cells, their shape and the detours left wins.' },
    ],
    cta: { title: 'Where will your first curve go?', body: 'Practise handing your opponent four cells in a row against the AI.', button: 'Play Monorail' },
    disclaimer: 'An unofficial fan-made web game inspired by Venice Connection and the Monorail game seen on TV; not affiliated with the broadcaster, producers or rights holders.',
  },
};

export default guide;
