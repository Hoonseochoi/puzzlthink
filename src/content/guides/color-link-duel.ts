// 컬러 링크 guide. Rules and numbers follow src/lib/colorLinkDuel.ts (CLD_COLORS 14, CLD_MIN 6, stonesToPlace,
// legalPlacement, checkProof/pathOk: a lone stone's line ends on the empty cell where its partner would go),
// src/lib/colorLinkDuelRoom.ts (CLD_TURN_SEC 60, CLD_PROOF_SEC 120, CLD_CHOOSE_SEC 30, coin toss for the opener in rooms,
// canDeclare only after the first placement, timeouts), src/lib/colorLinkDuelBoards.ts (13 layouts and their tiers; cell
// counts below were computed from the rows), src/lib/colorLinkDuelAi.ts (CLD_LEVELS normal/hard/hell),
// src/components/colorLinkDuel/CldGame.tsx (AI level → board tier), copy.ts and the ColorLinkDuelGuide messages.
// Mini boards are tables: rows 1–7 from the top, columns 1–7 from the left; '·' is an empty cell.
import type { GameGuide, GuideBlock } from './types';

const grid = (rows: string[], caption: string): GuideBlock => ({
  type: 'table',
  caption,
  head: ['', ...rows[0].split('').map((_, i) => String(i + 1))],
  rows: rows.map((r, i) => [String(i + 1), ...r.split('').map((ch) => (ch === '.' ? '·' : ch))]),
});

// A pair side by side still needs a 6-cell line: it loops through a 2×3 block.
const ADJ = ['AA...', 'aa...', 'aa...'];
// The corner trap: lone A in the corner, B and C close the only two ways out.
const TRAP = ['A.B..', '.C...', 'B....', '.....'];

const guide: GameGuide = {
  game: 'colorLinkDuel',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['colorlink', 'equationSignal', 'hiddenWord', 'gradation'],
  inlineNamespace: 'ColorLinkDuelGuide',
  ko: {
    meta: {
      title: '컬러 링크 공략 — 데블스플랜3 결승 게임, 불가능 선언과 공간 싸움 | PUZZLTHINK',
      description: '데블스 플랜 3 결승 컬러 링크, 언제 불가능을 선언하고 어떻게 판을 넘겨야 할까요? 6칸 규칙과 짝 없는 말, 판마다 들어가는 색의 수, 갇힌 말·경계 교차 판정법, 홀수 규칙과 공간 싸움, AI 난이도까지 정리했어요.',
      keywords: ['컬러 링크 공략', '컬러링크 공략', '컬러 링크 규칙', '데블스플랜3 컬러링크', '데블스 플랜 3 결승 게임', '컬러 링크 불가능 선언', '컬러 링크 필승법', '컬러 링크 이기는 법'],
    },
    title: '컬러 링크 공략',
    lead: '판을 깨는 쪽이 아니라, 깨진 판을 받는 쪽이 되지 마세요.',
    intro: [
      '컬러 링크는 둘이 번갈아 색깔 말을 놓으면서, 같은 색끼리 **서로 겹치지 않는 6칸 이상의 선**으로 이을 수 있는 판을 지켜 내는 1:1 대결이에요. 상대가 놓은 판이 더는 이어질 수 없다고 보면 **불가능 선언**을 하고, 상대는 2분 안에 모든 선을 그려 반박해야 해요. 판을 깨뜨린 쪽이 지지만, 깨지지 않은 판에 선언하면 선언한 쪽이 져요.',
      '이 공략은 규칙을 한 번 읽었다고 보고 그다음을 다뤄요. 선의 길이를 세는 법, 짝이 없는 말이 판을 어떻게 묶는지, 판마다 들어갈 수 있는 색의 수, 불가능을 빠르게 알아보는 세 가지 모양, 그리고 공간이 바닥날 때 누가 몰리는지를 순서대로 정리했어요. 좌표는 위에서부터 1행, 왼쪽부터 1열로 (행,열)처럼 적어요.',
    ],
    gamePageTitle: '컬러 링크 규칙과 공략 — 데블스 플랜 3 결승전 2회차 매치',
    summary: '6칸 규칙, 짝 없는 말, 판별 색 수, 불가능 판정법과 공간 싸움까지.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '컬러 링크는 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3) 결승전 2회차 매치로 나온 게임이에요. 혼자 푸는 퍼즐인 「컬러 잇기」(같은 색 점을 겹치지 않게 잇는 퍼즐)를 두 사람의 대결로 바꾼 형태라고 보면 쉬워요. 퍼즐을 푸는 사람이 아니라, 아직 풀리는 퍼즐을 **상대에게 넘기는 사람**이 되어야 해요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 방송과 같은 7×7 클래식 판에 더해, 하트·도넛·네 방 같은 모양 판 12가지까지 모두 13가지 판으로 둘 수 있어요. AI와 두거나, 링크·4자리 코드로 친구를 부르거나, 공개방에서 다른 사람과 1:1로 겨룰 수 있어요. 승부는 단판이에요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**말**: A부터 N까지 14가지 색이 색마다 2개씩, 모두 28개예요. 판 위의 말은 누구 것도 아니라서, 두 사람이 같은 말 더미에서 꺼내 놓아요.',
            '**첫 차례**: 라운드를 여는 사람(선공)은 말 **1개**만 놓아요.',
            '**그다음부터**: 차례마다 **서로 다른 색 말 2개**를 빈칸에 놓아요. 제한 시간은 1분이고, 시간 안에 놓지 못하면 그 자리에서 져요. 남은 색이 하나뿐이면 1개만 놓아요.',
            '**지켜야 할 조건**: 판 위의 같은 색 두 말을 선으로 잇는다고 할 때, 모든 선이 서로 칸을 나눠 쓰지 않고(겹침·교차 금지), 선마다 양 끝 말을 포함해 **6칸 이상**이어야 해요. 선은 상하좌우로 이웃한 칸으로만 이어지고, 다른 말 위는 지나갈 수 없어요.',
            '**짝 없는 말**: 하나만 놓인 색은 "어딘가에 짝을 놓으면 6칸 이상으로 이어진다"가 성립해야 해요. 증명할 때는 그 말에서 6칸 이상 선을 그리고, 선이 끝나는 빈칸에 짝이 놓인다고 봐요.',
            '**불가능 선언**: 내 차례에 말을 놓는 대신, 상대가 방금 만든 판이 조건을 어겼다고 선언할 수 있어요. 첫 수가 놓인 뒤부터 할 수 있어요.',
            '**증명**: 선언을 받은 사람은 2분 안에 모든 색의 선을 그려야 해요. 성공하면 증명한 사람이, 포기하거나 시간을 넘기면 선언한 사람이 이겨요.',
          ] },
          { type: 'callout', tone: 'note', title: '선공·후공 정하기', text: 'AI와 둘 때는 내가 선공·후공을 골라요. 친구 방과 공개방에서는 동전 던지기로 고를 사람을 정하고, 30초 안에 고르지 않으면 고를 사람이 선공이 돼요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 경우',
        blocks: [
          { type: 'cards', items: [
            { title: '바로 옆에 붙은 짝도 6칸이 필요해요', body: '선은 말 두 개를 포함해 6칸 이상이라, 붙어 있는 짝은 빙 돌아가는 고리를 만들어야 해요. 아래 그림처럼 2×3 칸 한 덩어리를 통째로 먹어요. 가까이 놓은 짝이 오히려 공간을 많이 먹을 수 있어요.' },
            { title: '선은 정해져 있지 않아요', body: '판 위에 선이 실제로 그려져 있지는 않아요. "모든 색을 동시에 잇는 방법이 하나라도 있는가"만 따져요. 그래서 내가 떠올린 선과 다른 길로 이어지는 경우도 많아요.' },
            { title: '선언이 맞아도 질 수 있나요?', body: '아니요. 정말 이을 수 없는 판이면 증명이 성공할 수 없으니 선언한 쪽이 이겨요. 반대로 이을 수 있는 판이라도 상대가 2분 안에 그리지 못하면 선언한 쪽이 이겨요.' },
            { title: '말이 다 떨어지면', body: '28개를 모두 놓은 뒤에 차례가 온 사람은 놓을 말이 없어 불가능 선언만 할 수 있어요. 다만 대부분의 판은 말이 떨어지기 훨씬 전에 공간이 먼저 떨어져요(아래 "판마다 들어가는 색의 수").' },
            { title: '벽', body: '모양 판의 빈 공간(벽)에는 말도 선도 못 들어가요. 벽 옆 칸은 이웃이 적어 선이 쉽게 막혀요.' },
            { title: '방금 놓은 말만 보나요?', body: '선언은 "지금 판 전체"를 따져요. 깨진 원인이 이전 수에 있었더라도, 상대가 방금 놓은 뒤의 판이 이어지지 않으면 선언이 성립해요. 그래서 깨진 판을 받은 사람은 놓지 말고 바로 선언해야 해요.' },
          ] },
          grid(ADJ, '붙어 있는 짝 A(1,1)·(1,2)의 가장 짧은 선: (1,1)→(2,1)→(3,1)→(3,2)→(2,2)→(1,2), 6칸. 소문자 a가 선이 지나는 칸이에요.'),
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 두기 전에 한 번 잇고, 받으면 한 번 의심하기',
        blocks: [
          { type: 'p', text: '입문 단계의 패배는 둘 중 하나예요. 내가 판을 깨 놓고 모르거나, 상대가 깬 판을 모르고 그 위에 또 두는 거예요. 차례마다 아래 순서를 지키면 둘 다 막을 수 있어요.' },
          { type: 'list', ordered: true, items: [
            '**상대가 둔 판부터 확인**: 내 차례가 오면 먼저 "지금 이 판이 이어지나?"를 봐요. 구석이나 벽 옆에서 갇힌 말이 없는지, 짝끼리 가는 길이 막히지 않았는지 확인해요.',
            '**내가 둘 말로 다시 잇기**: 놓을 두 칸을 정했으면, 놓은 뒤의 판에서 모든 선을 머릿속으로 그려 봐요. 하나라도 막히면 다른 자리를 찾아요.',
            '**짝 없는 말의 짝 먼저**: 판에 하나만 놓인 색이 있으면, 그 색의 선이 끝나는 자리에 짝을 놓는 게 가장 안전한 수예요. 이미 이을 길이 있는 선을 그대로 확정하는 거라 새 공간을 거의 쓰지 않아요.',
            '**넓은 판에서 시작**: AI 보통을 고르면 넓은 쉬움·보통 판이 나와서 실수해도 회복할 공간이 있어요. 선 그리는 감을 익힌 뒤 어려움 판으로 가세요.',
          ] },
          { type: 'callout', tone: 'tip', title: '짝 두 개를 마무리하는 수는 늘 안전해요', text: '판이 이어지는 상태이고 짝 없는 색이 두 개 이상이면, 그중 두 색의 짝을 각자 선이 끝나는 칸에 놓으면 판은 그대로 이어져요. 선 모양이 바뀌지 않으니까요. 급할 때 쓰는 가장 확실한 안전 수예요.' },
        ],
      },
      {
        id: 'reading',
        title: '불가능을 알아보는 세 가지 모양',
        lead: '선언은 확신이 들 때만 해야 해요. 아래 세 모양은 그림 한 장으로 확신할 수 있어요.',
        blocks: [
          { type: 'h3', text: '1. 갇힌 말 — 열린 칸이 6칸이 안 될 때' },
          grid(TRAP, '왼쪽 위 구석. 나머지 칸은 비어 있다고 해요.'),
          { type: 'p', text: '짝 없는 A가 구석 (1,1)에 있어요. A가 나갈 수 있는 칸은 (1,2)와 (2,1) 둘뿐이에요. (1,2)의 이웃은 (1,3) B와 (2,2) C로 막혀 있고, (2,1)의 이웃은 (3,1) B와 (2,2) C로 막혀 있어요. A에서 닿는 칸은 A 자신을 포함해 3칸뿐이니 6칸 선을 그릴 수 없어요. 상대가 방금 (2,2)에 C를 놓아 이 모양을 만들었다면, 바로 선언하면 이겨요.' },
          { type: 'p', text: '짝이 있는 색도 같은 식으로 봐요. 두 말이 함께 닿는 빈 영역의 칸 수가 (6 − 2)칸보다 적거나, 두 말이 아예 다른 영역에 갇히면 이을 수 없어요.' },
          { type: 'h3', text: '2. 경계 교차 — 바깥 테두리 위의 엇갈린 짝' },
          { type: 'p', text: '클래식 7×7 판에서 A가 (1,4)와 (7,4), B가 (4,1)과 (4,7)에 있다고 해 봐요. 네 말 모두 판 바깥 테두리 위에 있고, 테두리를 따라 돌면 A·B·A·B 순서로 엇갈려요. A의 선은 위 테두리에서 아래 테두리까지 판을 가로지르니 판을 왼쪽과 오른쪽으로 나눠요. B의 두 말은 서로 반대편에 남으니 B의 선은 A를 건너야 하고, 그건 규칙 위반이에요. 길이를 세 볼 필요도 없이 불가능이에요.' },
          { type: 'callout', tone: 'warn', title: '구멍이 있는 판에서는 안 통해요', text: '도넛처럼 가운데에 벽이 뚫린 판에서는 선이 구멍 반대편으로 돌아갈 수 있어서 이 판정이 성립하지 않아요. 바깥 테두리로만 둘러싸인 판(클래식 등)에서, 네 말이 모두 바깥 테두리 위에 있을 때만 쓰세요.' },
          { type: 'h3', text: '3. 좁은 통로 — 두 선이 한 칸짜리 길을 같이 써야 할 때' },
          { type: 'p', text: '모양 판의 한 칸 너비 통로는 선 하나만 지나갈 수 있어요. 통로 양쪽에 짝이 갈라진 색이 두 개 있고 통로 말고는 돌아갈 길이 없다면, 둘 중 하나는 반드시 막혀요. 계단·지그재그·화살표 판에서 자주 나오고, 네 방 판의 방과 방 사이 문도 이런 통로예요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 판마다 들어가는 색의 수 세기',
        blocks: [
          { type: 'p', text: '선은 말을 포함해 6칸 이상이고 칸을 나눠 쓰지 못하니, 판 위에 동시에 있을 수 있는 색의 수는 **판의 칸 수 ÷ 6**을 넘지 못해요. 실제로는 벽과 모서리 때문에 그보다 적어요. 이 상한을 알고 있으면 판이 얼마나 남았는지 감이 와요.' },
          { type: 'table', caption: '판별 칸 수와 이론상 최대 색 수 (칸 수 ÷ 6, 내림)', head: ['판', '난이도', '칸 수', '최대 색'], rows: [
            ['클래식 7×7', '어려움', '49', '8'],
            ['십자', '어려움', '45', '7'],
            ['모래시계', '어려움', '51', '8'],
            ['다이아몬드', '어려움', '61', '10'],
            ['하트', '어려움', '81', '13'],
            ['화살표', '보통', '50', '8'],
            ['계단', '보통', '57', '9'],
            ['H', '보통', '63', '10'],
            ['지그재그', '보통', '68', '11'],
            ['도넛', '쉬움', '72', '12'],
            ['기둥 숲', '쉬움', '72', '12'],
            ['액자', '쉬움', '81', '13'],
            ['네 방', '쉬움', '105', '17'],
          ] },
          { type: 'p', text: '방송 판인 클래식은 49칸이라 14색 중 많아야 8색만 올라갈 수 있어요. 말 28개를 다 쓰기 훨씬 전에 누군가 판을 깨게 되어 있다는 뜻이에요. 반대로 네 방은 105칸이라 14색이 다 올라갈 여유가 있어서, 공간보다 말이 먼저 떨어질 수도 있어요.' },
          { type: 'list', items: [
            '**짝 사이 거리도 공간이에요**: 짝의 선은 최소 max(6, 두 말의 가로·세로 거리 합 + 1)칸을 써요. 대각선 반대 구석에 놓인 짝은 7×7에서 13칸이나 먹어요.',
            '**넓은 빈 땅을 쪼개기**: 큰 빈 공간은 상대가 안전하게 둘 자리예요. 선이 지나가야 하는 길목에 말을 놓아 공간을 나누면, 상대가 새 색을 놓을 6칸짜리 자리가 빨리 줄어요.',
            '**벽에 붙여 선을 세우기**: 내 머릿속 선을 벽과 다른 선에 바짝 붙여 그리면 가운데 땅이 남아요. 증명할 때도 같은 요령이 통해요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 홀수 규칙과 공간 싸움',
        blocks: [
          { type: 'h3', text: '짝 없는 색의 수는 늘 홀수예요' },
          { type: 'p', text: '선공은 첫 수에 말 1개를 놓으니 짝 없는 색이 1개로 시작해요. 그 뒤로는 한 번에 서로 다른 색 2개를 놓는데, 말 하나하나가 짝 없는 색을 하나 줄이거나(짝 완성) 하나 늘려요(새 색). 그래서 한 차례에 짝 없는 색의 수는 −2, 0, +2만큼만 변하고, **말이 넉넉한 동안에는 항상 홀수**예요. 0이 되는 일이 없어요.' },
          { type: 'h3', text: '몰리는 순간: 짝 없는 색 1개, 새 선 자리 0개' },
          { type: 'p', text: '짝 없는 색이 3개 이상이면 위의 "짝 두 개 마무리" 수로 언제나 안전하게 둘 수 있어요. 위험한 건 짝 없는 색이 **딱 1개**일 때예요. 그 색의 짝을 마무리해도 두 번째 말은 새 색이어야 하고, 새 색은 6칸짜리 선이 들어갈 빈 땅이 있어야 해요. 그런 땅이 남아 있지 않으면, 어떤 두 칸에 놓아도 판이 깨져요. 남은 건 깨진 판을 넘기는 것뿐이고, 상대는 선언하면 이겨요.' },
          { type: 'p', text: '그래서 고수의 싸움은 "상대 차례에 짝 없는 색 1개 + 새 선 자리 없음"을 만드는 쪽으로 흘러가요. 내 수가 끝난 판에서 ① 짝 없는 색이 몇 개인지, ② 새 6칸 선이 몇 개 더 들어갈 수 있는지 세어 보세요. 새 선 자리가 한두 개 남았을 때는, 그 땅을 내가 마지막으로 쓰고 상대에게 빈손을 넘기는 순서를 찾는 게 핵심이에요.' },
          { type: 'callout', tone: 'note', title: 'AI 매우 어려움이 하는 일', text: 'AI 매우 어려움은 정확히 이 계산을 해요. 상대를 "짝 없는 색 1개, 새 선 자리 없음"으로 만드는 배치를 칸마다 확인해 찾고, 못 찾으면 남은 6칸 선의 수를 세어 상대가 이길 수 없는 쪽으로 맞춰 가요. 선언은 판이 정말 이어지지 않을 때만 해요.' },
          { type: 'h3', text: '증명 2분을 쓰는 요령' },
          { type: 'list', items: [
            '**길이 하나뿐인 선부터**: 구석·막다른 칸·좁은 통로의 선은 갈 길이 거의 정해져 있어요. 이걸 먼저 그리면 나머지 선의 길이 자연스럽게 좁혀져요.',
            '**짝 없는 말은 마지막에**: 짝 없는 말은 남은 빈 땅 어디로든 6칸만 뻗으면 돼서 가장 자유로워요. 다른 선을 다 그린 뒤 남는 땅에 그리세요.',
            '**짧게 그리기**: 짝의 선은 필요한 만큼만 돌아가게 그려요. 길게 돌린 선은 다른 색이 쓸 칸을 빼앗아요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**깨진 판 위에 또 두기**: 상대가 깬 판을 못 알아보고 말을 놓으면, 이제 깨진 판을 넘기는 사람은 내가 돼요. 상대가 선언하면 져요.',
            '**짝을 붙여 놓고 안심하기**: 붙은 짝도 2×3 고리가 필요해요. 구석에 붙여 놓은 짝은 생각보다 넓은 땅을 먹어요.',
            '**느낌으로 선언하기**: "복잡해 보인다"는 근거가 아니에요. 선언이 틀리면 바로 져요. 위의 세 모양처럼 그림으로 설명할 수 있을 때만 선언하세요.',
            '**짝 없는 말 잊기**: 하나만 놓인 색도 6칸 선이 필요해요. 그 말 주변을 다른 색으로 둘러싸면 내가 판을 깨게 돼요.',
            '**1분 시계 놓치기**: 2개를 다 놓고 "놓기 완료"를 눌러야 차례가 끝나요. 1분이 지나면 그대로 져요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구 방, 공개방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 보통', '자기 수를 미리 계획하지 않고, 깨진 판을 두 번에 한 번꼴로 놓쳐요. 가끔(약 7%) 선을 확인하지 않고 놓아 스스로 판을 깨기도 해요. 판은 쉬움·보통 판 중에서 나와요.'],
            ['AI 어려움', '열 번 중 네 번쯤 공간 싸움을 계산하고, 깨진 판을 놓치는 일도 가끔 있어요(약 30%). 판은 어려움 판에서 나와요.'],
            ['AI 매우 어려움', '모든 수에서 계산하고, 판이 정말 깨졌을 때만 빠짐없이 선언하며, 자기 판은 늘 증명해요. AI 헬모드에 들어 있고, 이기면 블랙피스와 인증서를 받아요. 판은 어려움 판이에요.'],
            ['친구 방', '링크나 4자리 코드로 초대해요. 방장이 13가지 판 중 하나를 고르거나 랜덤으로 정해요.'],
            ['공개방', '다른 플레이어와 1:1로 바로 만나요. 판 고르기 규칙은 친구 방과 같아요.'],
          ] },
          { type: 'p', text: '증명이 실패하면 결과 화면에서 "이렇게 이을 수 있었어요"로 실제로 가능했던 선을 보여 주거나, "정말로 이을 방법이 없는 판이었어요"라고 알려 줘요. 진 판을 이 화면으로 복기하면 선을 보는 눈이 빨리 늘어요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '선', def: '같은 색 두 말을 상하좌우로 이웃한 빈칸으로 잇는 길. 말 포함 6칸 이상, 다른 선과 칸을 나눠 쓰지 않아요.' },
            { term: '짝 없는 말', def: '하나만 놓인 색의 말. 증명할 때는 6칸 이상 선을 그리고 끝 칸에 짝이 놓인다고 봐요.' },
            { term: '불가능 선언', def: '상대가 방금 만든 판을 이을 수 없다고 주장하는 것. 말을 놓는 대신 해요.' },
            { term: '증명', def: '선언을 받은 쪽이 2분 안에 모든 색의 선을 그려 보이는 것.' },
            { term: '갇힌 말', def: '주변이 막혀 닿을 수 있는 빈칸이 6칸에 모자라는 말.' },
            { term: '경계 교차', def: '바깥 테두리 위의 두 짝이 테두리를 따라 A·B·A·B로 엇갈린 모양. 구멍 없는 판에서는 이을 수 없어요.' },
            { term: '공간 싸움', def: '새 6칸 선이 몇 개 더 들어갈지 세어, 상대 차례에 자리가 바닥나도록 순서를 맞추는 싸움.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '데블스 플랜 3 결승전 컬러 링크 규칙은?', a: '14가지 색 말(색마다 2개)을 둘이 번갈아 놓아요. 선공은 첫 수에 1개, 그 뒤로는 차례마다 서로 다른 색 2개를 1분 안에 놓아요. 같은 색끼리 선이 겹치지 않고 말 포함 6칸 이상으로 이어질 수 있어야 하고, 상대 판이 이어질 수 없다고 보면 불가능을 선언해요. 상대가 2분 안에 증명하지 못하면 선언한 쪽이 이겨요.' },
      { q: '혼자 하는 컬러 잇기와 무엇이 다른가요?', a: '컬러 잇기는 주어진 점을 혼자 잇는 퍼즐이고, 컬러 링크는 둘이 번갈아 말을 놓으며 상대에게 이을 수 없는 판을 넘기도록 몰아붙이는 대결이에요. 선 길이 6칸 이상이라는 조건도 컬러 링크에만 있어요.' },
      { q: '판 난이도와 AI 난이도는 어떻게 다른가요?', a: '판은 넓고 트인 쉬움(네 방·도넛·액자·기둥 숲), 통로가 섞인 보통(계단·H·지그재그·화살표), 좁은 어려움(클래식·하트·다이아몬드·십자·모래시계)으로 나뉘어요. AI는 보통·어려움·매우 어려움 세 단계이고, AI 보통은 쉬움·보통 판에서, 어려움과 매우 어려움은 어려움 판에서 둬요.' },
      { q: '불가능 선언은 언제 해야 하나요?', a: '구석에 갇힌 말, 바깥 테두리에서 엇갈린 두 짝, 두 선이 함께 지나야 하는 한 칸 통로처럼 이을 수 없는 이유를 하나 짚을 수 있을 때요. 선언이 틀리면 바로 지니까, 근거 없이 선언하지 마세요.' },
      { q: '친구와 함께 할 수 있나요?', a: '네. 친구 대전에서 링크나 4자리 코드로 초대하거나, 공개방에서 다른 플레이어와 1:1로 겨룰 수 있어요. 방장이 판을 고르거나 랜덤으로 정해요.' },
    ],
    cta: { title: '판을 넘겨 볼까요?', body: '넓은 판의 AI 보통부터 시작해, 짝 없는 말과 공간을 세는 감을 잡아 보세요.', button: '컬러 링크 하러 가기' },
    disclaimer: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스와 무관한 비공식 팬 제작 게임입니다. 프로그램명은 게임을 소개하기 위한 목적으로만 사용되었습니다.',
  },
  en: {
    meta: {
      title: "Color Link Duel strategy — the Devil's Plan 3 final, impossible calls and the space race | PUZZLTHINK",
      description: "How to play Color Link Duel from The Devil's Plan 3 final: the 6-cell rule and lone stones, how many colours each board holds, three ways to spot an impossible board, the odd-count rule and the race for space, and the AI levels.",
      keywords: ['Color Link Duel strategy', 'Color Link Duel rules', "Devil's Plan 3 final game", 'Color Link impossible call', 'how to win Color Link Duel', 'two-player flow puzzle'],
    },
    title: 'Color Link Duel strategy guide',
    lead: "Breaking the board is fine — as long as you're not the one handing it over.",
    intro: [
      'Color Link Duel is a 1:1 duel in which two players take turns placing coloured stones while keeping the board **joinable**: every pair of same-coloured stones must still be linkable by its own line of **6 cells or more**, with no two lines sharing a cell. If you think the board your opponent just left can no longer be joined, you **call it impossible**, and they have 2 minutes to draw every line. Whoever breaks the board loses — but calling a board that still works loses too.',
      'This guide assumes you have read the rules once and goes further: how line length is counted, how a lone stone ties up space, how many colours each board can hold, three shapes that prove a board impossible, and who gets squeezed when the space runs out. Coordinates are (row, column) counted from the top-left.',
    ],
    gamePageTitle: "Color Link Duel rules and strategy — The Devil's Plan 3 final, round 2",
    summary: 'The 6-cell rule, lone stones, colours per board, impossible shapes and the space race.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "Color Link Duel was the second game of the final of Netflix's The Devil's Plan: Dead Again (season 3). Think of the solo puzzle Color Link (join same-coloured dots without crossing) turned into a two-player fight: your job is not to solve the puzzle but to **hand your opponent a puzzle that is still solvable** — until they can't." },
          { type: 'p', text: "On PUZZLTHINK you can play the show's 7×7 board and twelve shaped boards such as Heart, Donut and Four Rooms — thirteen in all — against the AI, with a friend by link or 4-digit code, or with another player in an open room. A match is a single round." },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Stones**: 14 colours, A to N, two of each — 28 in all. Stones belong to nobody; both players draw from the same supply.',
            '**Opening**: the player who opens the round places **one** stone.',
            '**After that**: each turn, place **two stones of different colours** on empty cells within 1 minute — run out of time and you lose. If only one colour is left in the supply, you place one.',
            '**The condition**: imagine a line joining each same-coloured pair. All lines must avoid sharing cells (no overlaps, no crossings), and each must be **at least 6 cells long counting both stones**. Lines step between side-by-side cells only and never pass over another stone.',
            '**Lone stones**: a colour with only one stone placed must still have room for its partner, joined by 6 cells or more. In a proof you draw a line of 6+ cells from it, and its partner is taken to sit on the empty cell where the line ends.',
            '**Calling impossible**: on your turn, instead of placing, you may claim the board your opponent just left breaks the condition. Possible from the second turn on.',
            '**The proof**: the called player has 2 minutes to draw every line. Succeed and the prover wins; give up or run out of time and the caller wins.',
          ] },
          { type: 'callout', tone: 'note', title: 'Who opens', text: 'Against the AI you choose to open or go second. In friend and open rooms a coin toss decides who chooses; if they do not choose within 30 seconds, they open.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky cases',
        blocks: [
          { type: 'cards', items: [
            { title: 'Even touching pairs need 6 cells', body: 'A line includes both stones and must be 6 cells or more, so two stones side by side have to loop around — they eat a whole 2×3 block, as below. A close pair can cost more space than you expect.' },
            { title: 'Lines are not fixed', body: 'No lines are drawn on the board during play. The only question is whether some way of joining every colour at once exists — often by routes other than the ones you had in mind.' },
            { title: 'Can a correct call lose?', body: 'No. If the board truly cannot be joined, no proof can succeed and the caller wins. And if the board can be joined but the prover does not draw it in 2 minutes, the caller wins as well.' },
            { title: 'When the stones run out', body: 'A player whose turn comes after all 28 stones are placed has nothing to place and can only call impossible. On most boards, though, space runs out long before stones do (see "Colours per board").' },
            { title: 'Walls', body: 'Shaped boards have gaps (walls) that neither stones nor lines can enter. Cells next to walls have fewer neighbours, so lines get blocked there easily.' },
            { title: 'Only the last stones?', body: 'A call judges the whole board as it is now. Even if the real damage was done earlier, the call stands if the board after your opponent’s placement cannot be joined. So when you receive a broken board, call it — do not place on it.' },
          ] },
          grid(ADJ, 'The shortest line for the touching pair A (1,1)–(1,2): (1,1)→(2,1)→(3,1)→(3,2)→(2,2)→(1,2), 6 cells. Lower-case a marks cells the line uses.'),
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — join once before you place, doubt once when you receive',
        blocks: [
          { type: 'p', text: 'Beginners lose in one of two ways: they break the board without noticing, or they place on a board their opponent already broke. This routine, every turn, stops both.' },
          { type: 'list', ordered: true, items: [
            '**Check the board you were handed**: before anything else ask "can this be joined?" Look for stones boxed into corners or against walls, and pairs whose way to each other is cut.',
            '**Join it again with your stones**: once you have picked two cells, picture every line on the board after you place. If one gets stuck, choose different cells.',
            '**Partners of lone stones first**: if a colour has one stone on the board, placing its partner where that line ends is the safest move there is — it fixes a line that already fits and uses almost no new space.',
            '**Start on a roomy board**: the Normal AI deals the big easy and normal boards, where there is space to recover from a slip. Move to the hard boards once you see lines quickly.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Finishing two lone colours is always safe', text: 'If the board is joinable and two or more colours have a lone stone, put each partner on the end cell of its line and the board stays joinable — none of the lines change. It is the surest move when you are short of ideas.' },
        ],
      },
      {
        id: 'reading',
        title: 'Three shapes that prove a board impossible',
        lead: 'Only call when you are sure. Each of these shapes is proof in one picture.',
        blocks: [
          { type: 'h3', text: '1. The boxed stone — fewer than 6 cells to reach' },
          grid(TRAP, 'The top-left corner; assume the rest of the board is empty.'),
          { type: 'p', text: 'Lone A sits in the corner (1,1). It can only step to (1,2) or (2,1). The neighbours of (1,2) are B at (1,3) and C at (2,2); the neighbours of (2,1) are B at (3,1) and C at (2,2). A can reach just 3 cells including itself, so no 6-cell line exists. If your opponent just created this by placing C on (2,2), call it and you win.' },
          { type: 'p', text: 'Pairs work the same way: if the open region both stones touch has fewer than 4 free cells, or the two stones are cut into different regions, the pair cannot be joined.' },
          { type: 'h3', text: '2. Crossing on the edge — interleaved pairs on the outer border' },
          { type: 'p', text: 'On the classic 7×7, put A on (1,4) and (7,4) and B on (4,1) and (4,7). All four stones lie on the outer border, and going round it they alternate A, B, A, B. Any A line runs from the top edge to the bottom edge and splits the board into a left and a right part, leaving the B stones on opposite sides — B would have to cross A. Impossible, without counting a single cell.' },
          { type: 'callout', tone: 'warn', title: 'Not on boards with holes', text: 'On a board with a wall in the middle, such as Donut, a line can go round the other side of the hole, so this test fails. Use it only on boards bounded by their outer edge alone (like the classic board) and only when all four stones are on that outer edge.' },
          { type: 'h3', text: '3. The narrow corridor — two lines needing one lane' },
          { type: 'p', text: 'A one-cell-wide corridor on a shaped board carries one line. If two colours each have a stone on both sides of it and there is no other way round, one of them is cut. It comes up often on Stairs, Zigzag and Arrow, and the doors between the rooms of Four Rooms are such corridors.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — count the colours a board can hold',
        blocks: [
          { type: 'p', text: 'Each line uses 6 cells or more and cells cannot be shared, so the number of colours on a board at once can never exceed **cells ÷ 6** — and walls and corners make the real number lower. Knowing this ceiling tells you how much game is left.' },
          { type: 'table', caption: 'Cells per board and the theoretical maximum of colours (cells ÷ 6, rounded down)', head: ['Board', 'Tier', 'Cells', 'Max colours'], rows: [
            ['Classic 7×7', 'Hard', '49', '8'],
            ['Cross', 'Hard', '45', '7'],
            ['Hourglass', 'Hard', '51', '8'],
            ['Diamond', 'Hard', '61', '10'],
            ['Heart', 'Hard', '81', '13'],
            ['Arrow', 'Normal', '50', '8'],
            ['Stairs', 'Normal', '57', '9'],
            ['H', 'Normal', '63', '10'],
            ['Zigzag', 'Normal', '68', '11'],
            ['Donut', 'Easy', '72', '12'],
            ['Pillar Forest', 'Easy', '72', '12'],
            ['Frame', 'Easy', '81', '13'],
            ['Four Rooms', 'Easy', '105', '17'],
          ] },
          { type: 'p', text: "The show's classic board has 49 cells, so at most 8 of the 14 colours can ever be on it: someone is bound to break it long before the 28 stones are used. Four Rooms, at 105 cells, has room for all 14, so there the stones may run out before the space does." },
          { type: 'list', items: [
            '**Distance is space too**: a pair’s line needs at least max(6, row distance + column distance + 1) cells. A pair in opposite corners of the 7×7 eats 13.',
            '**Split the open ground**: a big empty area is where your opponent places safely. Put stones on the paths lines must take and you cut it into pieces too small for new 6-cell lines.',
            '**Hug walls**: draw your mental lines tight against walls and other lines, so the middle stays free. The same habit makes proofs faster.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — the odd-count rule and the race for space',
        blocks: [
          { type: 'h3', text: 'The number of lone colours is always odd' },
          { type: 'p', text: 'The opener places one stone, so play begins with one lone colour. From then on each turn places two stones of different colours, and each stone either completes a lone colour (−1) or starts a new one (+1). A turn changes the count by −2, 0 or +2, so **while stones last, the number of lone colours is always odd** — it never drops to zero.' },
          { type: 'h3', text: 'The squeeze: one lone colour, no room for a new line' },
          { type: 'p', text: 'With three or more lone colours you can always play the safe "finish two partners" move. The danger is **exactly one** lone colour. You can finish it, but your second stone must start a new colour, and a new colour needs free ground for a 6-cell line. If none is left, every placement breaks the board; all you can do is hand over a broken board and lose to the call.' },
          { type: 'p', text: 'So strong play steers toward leaving the opponent with "one lone colour and no room for a new line". After your move, count (1) how many lone colours there are and (2) how many more 6-cell lines the free ground can take. When only one or two such spaces remain, look for the order in which you use the last one and hand over an empty-handed board.' },
          { type: 'callout', tone: 'note', title: 'What the Very Hard AI does', text: 'The Very Hard AI runs exactly this calculation. It searches, cell by cell, for a placement that leaves you with one lone colour and no room; failing that, it counts the 6-cell lines the free ground still holds and steers to the side of that count you cannot win from. It calls impossible only when the board truly cannot be joined.' },
          { type: 'h3', text: 'Using the 2-minute proof' },
          { type: 'list', items: [
            '**Forced lines first**: lines in corners, dead ends and corridors have almost no choice of route. Draw them first and the rest narrows down by itself.',
            '**Lone stones last**: a lone stone just needs 6 cells in any direction, so it is the most flexible. Draw it in whatever space is left.',
            '**Draw short**: give a pair’s line only the detour it needs; a long loop steals cells other colours need.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Placing on a broken board**: if you miss that your opponent broke it and place anyway, you are now the one handing over a broken board — and the call beats you.',
            '**Trusting touching pairs**: a touching pair still needs a 2×3 loop; in a corner it eats more ground than it seems.',
            '**Calling on a hunch**: "it looks crowded" is not a reason. A wrong call loses on the spot. Call when you can point to one of the three shapes above.',
            '**Forgetting lone stones**: a lone stone needs a 6-cell line too. Surround it with other colours and you are the one who broke the board.',
            '**Missing the 1-minute clock**: the turn ends only when both stones are down and you press Place. When the minute runs out, you lose.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend rooms, open rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Good to know'], rows: [
            ['AI Normal', 'Never plans ahead and misses a broken board about half the time. Now and then (about 7%) it places without checking the lines and breaks the board itself. Boards come from the easy and normal tiers.'],
            ['AI Hard', 'Plans the space race on about four turns in ten and sometimes (about 30%) misses a broken board. Boards come from the hard tier.'],
            ['AI Very Hard', 'Plans every turn, calls every truly broken board and always proves its own. Part of AI Hell Mode — a win earns a black piece and a certificate. Hard-tier boards.'],
            ['Friend room', 'Invite by link or 4-digit code. The host picks one of the 13 boards or leaves it random.'],
            ['Open room', 'Meet another player 1:1 right away. Boards are chosen as in friend rooms.'],
          ] },
          { type: 'p', text: 'After a failed proof the result screen shows "here is how it could be joined" with real lines, or tells you the board truly had no way out. Replaying lost games on that screen trains your eye for lines quickly.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Line', def: 'A route of side-by-side empty cells joining two same-coloured stones: 6 cells or more including the stones, sharing no cell with another line.' },
            { term: 'Lone stone', def: 'The only stone of its colour on the board. In a proof it gets a 6+ cell line and its partner sits on the end cell.' },
            { term: 'Impossible call', def: 'Claiming, instead of placing, that the board your opponent just left cannot be joined.' },
            { term: 'Proof', def: 'The called player drawing every line within 2 minutes.' },
            { term: 'Boxed stone', def: 'A stone hemmed in so that fewer than 6 cells are reachable.' },
            { term: 'Edge crossing', def: 'Two pairs on the outer border alternating A, B, A, B around it. Unjoinable on boards without holes.' },
            { term: 'Space race', def: 'Counting how many more 6-cell lines fit, and timing it so the space runs out on your opponent’s turn.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: "What are the rules of Color Link Duel from The Devil's Plan 3 final?", a: 'Two players place stones of 14 colours (two each) in turn: the opener places one, then each turn two of different colours within 1 minute. Every same-coloured pair must stay joinable by a line of 6 cells or more, with no lines sharing cells. If you think the board cannot be joined, call it impossible; if your opponent cannot draw every line within 2 minutes, you win.' },
      { q: 'How is it different from the solo Color Link puzzle?', a: 'Color Link is a puzzle where you join given dots on your own. Color Link Duel is a duel in which players take turns placing stones, each trying to leave the other a board that cannot be joined. The 6-cell minimum is unique to the duel.' },
      { q: 'How do board tiers and AI levels differ?', a: 'Boards come in easy (Four Rooms, Donut, Frame, Pillar Forest), normal (Stairs, H, Zigzag, Arrow) and hard (Classic, Heart, Diamond, Cross, Hourglass). The AI has three levels: Normal plays on easy and normal boards, Hard and Very Hard on hard boards.' },
      { q: 'When should I call impossible?', a: 'When you can name the reason: a boxed-in stone, two pairs interleaved on the outer edge, or two lines needing the same one-cell corridor. A wrong call loses at once, so never call on a hunch.' },
      { q: 'Can I play with friends?', a: 'Yes. Invite a friend by link or 4-digit code, or meet another player 1:1 in an open room. The host picks the board or leaves it random.' },
    ],
    cta: { title: 'Ready to hand over a board?', body: 'Start with the Normal AI on a roomy board and get a feel for lone stones and counting space.', button: 'Play Color Link Duel' },
    disclaimer: "PUZZLTHINK is an unofficial fan-made game, not affiliated with The Devil's Plan or Netflix. The programme's name is used only to describe the game.",
  },
};
export default guide;
