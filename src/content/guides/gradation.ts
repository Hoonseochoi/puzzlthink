// 그라데이션 guide. Rules and numbers follow src/lib/gradation.ts (GR_CUPS 7, GR_SUM 30, GR_ROUNDS 7, GR_COPIES 2, grTier:
// shades dark·grey·light·white·light·grey·dark, grValid, applyGrAction: the winner leads, a tie keeps the lead, grDecided
// early end, grNext rematch after a tie up to GR_SETS_MAX 5 matches then a draw, GR_OPENINGS, the four GR_PERSONA AIs,
// grBelief) and src/lib/gradationRoom.ts (5-minute placing in every mode, 30-second cup turns in rooms only, 3 missed
// turns lose, a timed-out row is a random 30-sum row), plus the GradationGuide messages.
// Counts and per-cup ranges below were computed with grAllRows(): 2,123 legal rows, 245 of them summing to 30. The worked
// match uses two rows from GR_OPENINGS and was played out by the rules above.
import type { GameGuide, GuideBlock } from './types';

type Lang = 'ko' | 'en';
const SHADES: Record<Lang, string[]> = {
  ko: ['검정', '회색', '밝은', '흰', '밝은', '회색', '검정'],
  en: ['Dark', 'Grey', 'Light', 'White', 'Light', 'Grey', 'Dark'],
};
const row = (lang: Lang, label: string, cubes: number[], caption: string): GuideBlock => ({
  type: 'table',
  caption,
  head: [lang === 'ko' ? '통' : 'Cup', ...SHADES[lang].map((s, i) => `${i + 1} ${s}`)],
  rows: [[label, ...cubes.map(String)]],
});
const ME = [0, 0, 1, 3, 8, 9, 9];
const AI = [1, 1, 2, 2, 7, 8, 9];

const guide: GameGuide = {
  game: 'gradation',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['equationTower', 'hiddenWord', 'colorLinkDuel', 'indianPoker'],
  inlineNamespace: 'GradationGuide',
  ko: {
    meta: {
      title: '그라데이션 공략 — 데블스플랜3 감옥매치, 배치와 통 색 읽기 | PUZZLTHINK',
      description: '데블스 플랜 3 감옥 매치 그라데이션, 어떻게 배치하고 어떤 통을 내야 할까요? 통 색마다 들어갈 수 있는 숫자 범위, 희생 큐브 배치, 공개된 숫자로 상대 배치를 좁히는 법, 한 판을 라운드별로 따라 하는 예시, AI 4명의 성향까지 정리했어요.',
      keywords: ['그라데이션 공략', '그라데이션 게임 규칙', '데블스플랜3 그라데이션', '데블스 플랜 감옥 매치', '데블스 플랜 3 6일차', '그라데이션 배치', '숫자 큐브 게임', '1:1 심리전'],
    },
    title: '그라데이션 공략',
    lead: '일곱 판 중 네 판. 나머지 세 판은 싸게 지는 게 실력이에요.',
    intro: [
      '그라데이션은 숫자 큐브 7개를 오름차순으로, 합 30 이하로 통 7개에 숨긴 뒤, 한 라운드에 한 통씩 내서 더 큰 숫자를 낸 쪽이 이기는 1:1 심리전이에요. 상대에게 보이는 건 **통의 색**뿐이에요. 통은 양 끝이 가장 어둡고 가운데로 갈수록 밝아져서, 같은 색 통이 두 개씩 있어요. 그래서 검정 통 하나만 봐서는 그게 상대의 가장 작은 숫자인지 가장 큰 숫자인지 알 수 없어요.',
      '이 공략은 규칙을 안다고 보고 그다음을 다뤄요. 합 30 배치에서 통마다 들어갈 수 있는 숫자 범위, 강한 배치의 모양, 공개된 숫자로 상대 배치를 좁히는 법, 그리고 실제 한 판을 라운드마다 따라가며 어디서 이기고 어디서 버리는지 보여 줘요.',
    ],
    gamePageTitle: '그라데이션 온라인 — 데블스 플랜 3 감옥 매치를 웹에서',
    summary: '통 색별 숫자 범위, 희생 큐브 배치, 상대 배치 좁히기, 한 판 따라 하기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '그라데이션은 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3) 6일차 감옥 매치로 나온 1:1 숫자 심리전이에요. 숫자 자체는 단순하지만, 상대가 내는 통의 색과 지금까지 공개된 숫자를 엮어 상대의 남은 큐브를 추리하는 게임이라 수읽기와 블러핑이 함께 들어가요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 성향이 다른 AI 4명 중 한 명과 두거나, 친구 방·공개방에서 사람과 1:1로 겨룰 수 있어요. 한 판은 7라운드이고, 동점이면 새로 배치해서 다시 붙어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**준비물**: 각자 통 7개(검정·회색·밝은·흰·밝은·회색·검정)와 숫자 큐브 20개(0~9가 2개씩)를 받아요.',
            '**배치**: 5분 안에 통마다 큐브를 1개씩 몰래 넣어요. 왼쪽에서 오른쪽으로 숫자가 **작아지면 안 되고**(같아도 돼요), 같은 숫자는 두 번까지, 7개의 합은 **30 이하**예요.',
            '**라운드**: 선 플레이어가 통 1개를 내요. 상대에게는 통의 색만 보이고 몇 번째 자리였는지는 안 보여요. 이어서 상대가 통 1개를 내요.',
            '**승부**: 두 큐브를 공개해 더 큰 숫자를 낸 쪽이 1점을 얻어요. 같으면 점수 없이 넘어가요.',
            '**다음 선**: 라운드를 이긴 쪽이 다음 라운드의 선이에요. 비기면 선이 그대로예요. 1라운드 선은 무작위예요.',
            '**끝**: 7라운드 뒤 점수가 높은 쪽이 이겨요. 남은 라운드를 다 이겨도 뒤집을 수 없으면 그 자리에서 끝나요. 동점이면 둘 다 새로 배치해 다시 붙고(선은 그대로), 다섯 판 연속 동점이면 무승부예요.',
          ] },
          { type: 'h3', text: '통 색이 알려 주는 것' },
          { type: 'p', text: '오름차순 규칙 때문에 검정 통 둘은 **가장 작은 숫자와 가장 큰 숫자**, 회색은 두 번째로 작은 것과 두 번째로 큰 것, 밝은 통은 세 번째로 작은 것과 세 번째로 큰 것이에요. 흰 통만 하나라 가운데 숫자예요. 같은 색 두 통에는 언제나 서로 다른 숫자가 들어가요(같으면 그 사이 통까지 같은 숫자가 세 개 이상이 되니까요).' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙',
        blocks: [
          { type: 'cards', items: [
            { title: '같은 숫자는 두 번까지', body: '큐브가 숫자마다 2개라 4·4처럼 나란히 둘 수 있지만, 세 번은 못 써요.' },
            { title: '합 30을 꼭 채워야 하나요?', body: '30보다 작아도 규칙 위반은 아니에요. 하지만 큰 숫자는 언제나 작은 숫자보다 유리해서 보통 30을 꽉 채워요.' },
            { title: '배치 시간을 넘기면', body: '5분 안에 내지 않으면 합 30인 배치가 무작위로 들어가요.' },
            { title: '비긴 라운드', body: '아무도 점수를 얻지 못하고, 선도 바뀌지 않아요. 두 큐브는 그대로 써 버린 거예요.' },
            { title: '통의 자리는 끝까지 비밀', body: '상대가 낸 통의 색과 숫자는 보이지만 몇 번째 자리였는지는 안 보여요. 다만 숫자가 나오면 색과 합쳐 자리를 거의 알 수 있어요(아래 범위표).' },
            { title: '남은 색 수는 공개', body: '각자 어떤 색 통을 몇 개 썼는지는 모두에게 보여요. 상대의 검정 통이 하나 남았다면, 그게 가장 작은 쪽인지 큰 쪽인지는 앞서 나온 검정 숫자로 알 수 있어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 네 번만 이기는 배치',
        blocks: [
          { type: 'p', text: '7라운드 중 **4번만 이기면** 돼요. 일곱 칸을 고르게 채우면 매 라운드가 비슷한 싸움이 되지만, 작은 큐브 두세 개를 일부러 "버릴 큐브"로 두고 남은 합을 위쪽 네다섯 칸에 몰아 주면, 이기는 라운드를 확실하게 이길 수 있어요.' },
          { type: 'table', caption: 'AI가 자기 대국으로 골라 낸 강한 배치 몇 가지 (모두 합 30)', head: ['배치', '모양'], rows: [
            ['1 1 2 2 7 8 9', '작은 네 개 + 큰 세 개'],
            ['0 1 1 3 8 8 9', '작은 셋 + 중간 하나 + 큰 셋'],
            ['0 0 1 3 8 9 9', '0 두 개를 버리고 위를 최대로'],
            ['0 1 2 3 7 8 9', '고르게 오르다가 위에서 뛰는 모양'],
          ] },
          { type: 'list', items: [
            '**버릴 큐브는 0과 1**: 지는 라운드에 내는 큐브예요. 어차피 질 라운드라면 0으로 지든 4로 지든 같은 1패예요.',
            '**큰 숫자는 7~9로 세 개**: 이 셋이 확실한 승리를 가져와요. 네 번째 승리는 중간 숫자나 상대의 실수에서 나와요.',
            '**후공일 때 못 이길 것 같으면 가장 작은 걸로**: 상대 통이 크게 보이면 내 버릴 큐브로 받아요. 아낀 큰 큐브로 다음 라운드를 가져와요.',
          ] },
        ],
      },
      {
        id: 'ranges',
        title: '통 색마다 들어갈 수 있는 숫자',
        lead: '합을 30으로 꽉 채운 배치는 245가지뿐이에요. 그 안에서 각 통에 올 수 있는 숫자는 생각보다 좁아요.',
        blocks: [
          { type: 'table', caption: '합 30 배치 245가지에서 통마다 나올 수 있는 숫자', head: ['자리', '색', '범위', '가장 흔한 숫자'], rows: [
            ['1번', '검정', '0~3', '0'],
            ['2번', '회색', '0~4', '1, 2'],
            ['3번', '밝은', '1~5', '3'],
            ['4번', '흰', '2~6', '4'],
            ['5번', '밝은', '4~8', '5, 6'],
            ['6번', '회색', '5~9', '7'],
            ['7번', '검정', '6~9', '9'],
          ] },
          { type: 'list', items: [
            '**검정이 0~3이면 가장 작은 쪽, 6~9면 가장 큰 쪽**이에요. 4나 5인 검정은 합 30 배치에서는 나오지 않아요. 그러니 검정 통의 숫자가 공개되면 상대의 다른 검정이 어느 쪽인지 곧바로 알 수 있어요.',
            '**회색도 0~4면 작은 쪽, 5~9면 큰 쪽**이에요. 범위가 겹치지 않아 공개되면 자리가 확정돼요.',
            '**밝은 통만 4~5에서 겹쳐요**. 밝은 통에서 4나 5가 나오면 어느 쪽인지 다른 숫자들과 견줘 봐야 해요.',
            '**흰 통은 2~6**: 흰 통으로 7 이상은 나올 수 없어요. 상대가 흰 통을 내면 7로 받으면 반드시 이겨요.',
          ] },
          { type: 'callout', tone: 'tip', title: '합 30이 강한 단서예요', text: '공개된 숫자의 합을 30에서 빼면 상대에게 남은 큐브의 합이 나와요. 큰 숫자 두 개가 이미 나왔다면, 남은 큐브들은 작을 수밖에 없어요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 하기 — 한 판 읽기',
        lead: '내 배치와 상대 배치는 둘 다 AI가 쓰는 강한 배치예요. 나는 상대 배치를 모른 채 색과 숫자만 보고 둬요.',
        blocks: [
          row('ko', '나', ME, '내 배치 (합 30)'),
          row('ko', '상대', AI, '상대 배치 (합 30, 끝날 때 공개)'),
          { type: 'steps', items: [
            { title: '1라운드 — 내 선: 검정 0을 버리기', body: '내 검정 1번(0)을 내요. 상대는 내 검정이 0일지 9일지 몰라요. 상대는 회색으로 받았고, 공개해 보니 1이었어요. 0 대 1로 상대 승, 상대가 선이 돼요. 이제 상대도 알아요: 내 남은 검정은 내 가장 큰 숫자예요. 나도 알아요: 회색 1은 상대의 두 번째로 작은 숫자라, 상대의 남은 회색은 두 번째로 큰 숫자(5~9)예요.' },
            { title: '2라운드 — 상대 선: 검정을 버림으로 받기', body: '상대가 검정을 내요. 상대의 검정은 가장 작은 쪽(1 이하, 회색이 1이었으니까)이거나 가장 큰 쪽이에요. 나는 회색 0으로 받아 버려요. 공개하니 상대 검정은 9, 상대 승(0 : 2). 하지만 정보가 생겼어요: 상대의 큰 9가 나갔고, 남은 검정은 상대의 가장 작은 숫자(0이나 1)예요.' },
            { title: '3라운드 — 상대 선: 밝은 통을 8로 받기', body: '상대가 밝은 통을 내요. 내 남은 큐브는 1·3·8·9·9. 8로 받으면 8을 넘는 밝은 통은 없으니(밝은 통은 많아야 8) 지지 않아요. 공개하니 상대는 7, 내 승(1 : 2). 7은 밝은 통의 큰 쪽(4~8)이니, 상대의 남은 회색은 7과 9 사이, 남은 밝은 통은 작은 쪽이에요.' },
            { title: '상대의 남은 큐브 계산', body: '공개된 상대 숫자는 1·9·7, 합 17. 남은 네 큐브의 합은 많아야 13이고, 그중 회색이 7 이상이니 나머지 셋(검정·밝은·흰)의 합은 6 이하예요. **상대에게 남은 큰 숫자는 회색 하나뿐**이에요. 내게는 9가 두 개 있어요.' },
            { title: '4라운드 — 내 선: 1을 버려서 선을 넘기기', body: '0 : 2로 지고 있지만 남은 네 판 중 셋을 이기면 돼요. 내 밝은 1을 내 상대가 2로 이기게 둬요(1 : 3). 대신 상대가 선이 되어 먼저 색을 보여 줘야 해요.' },
            { title: '5~7라운드 — 받는 쪽에서 모두 이기기', body: '상대가 무엇을 내든 받을 수 있어요. 회색(7~9)이면 9로, 작은 통이면 3으로 받아요(남은 셋의 합이 6 이하라 3을 넘는 통은 많아야 하나예요). 실제로 상대는 회색 8을 냈고 9로 받아 이겼어요(2 : 3). 이제 내 선에서 검정 9를 내고(상대 검정 1로 받음, 3 : 3), 마지막 흰 3이 상대 흰 2를 이겨 **4 : 3 승리**예요.' },
          ] },
          { type: 'callout', tone: 'note', title: '이 판에서 배울 점', text: '나는 0·0·1, 세 개를 지는 라운드에 썼어요. 대신 상대의 9와 7을 일찍 끌어내 남은 큐브를 계산할 수 있게 됐고, 끝에는 상대가 큰 숫자 하나로 내 9 두 개를 상대해야 했어요. 지는 라운드에 무엇을 내느냐가 이기는 라운드를 만들어요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 선과 후공의 차이',
        blocks: [
          { type: 'p', text: '선 플레이어는 색을 먼저 보여 주고, 후공은 그 색을 보고 고를 수 있어요. 그래서 같은 큐브라도 **후공일 때 훨씬 효율적으로** 써요. 이기면 선이 되니, 이긴 뒤의 라운드는 정보 면에서 불리하다는 점을 기억하세요.' },
          { type: 'list', items: [
            '**선일 때 흰 통은 신중히**: 흰 통은 많아야 6이라, 상대는 7만 있으면 확실히 이겨요. 반대로 상대가 큰 숫자를 아끼게 만들려면 흰 통으로 "작은 수를 내는 척"하기 좋아요.',
            '**선일 때 검정은 블러핑**: 검정은 가장 작거나 가장 큰 숫자라, 상대는 큰 숫자로 받을지 버림으로 받을지 고민해야 해요. 다만 한 번 공개되면 남은 검정의 정체가 드러나요.',
            '**후공일 때는 최소한으로 이기기**: 이길 수 있다면 이기는 가장 작은 큐브로 받으세요. 같은 1승이라도 남는 큐브가 달라요.',
            '**비기기의 가치**: 비기면 선이 그대로예요. 내가 선을 넘기고 싶지 않을 때, 같은 숫자로 받아 비기는 것도 한 수예요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 남은 큐브를 세는 습관',
        blocks: [
          { type: 'p', text: '라운드가 지날 때마다 상대 배치는 빠르게 좁혀져요. 세 가지를 계속 갱신하세요.' },
          { type: 'list', ordered: true, items: [
            '**남은 합**: 30 − (공개된 상대 숫자의 합). 상대가 30을 다 채웠다고 보면 거의 틀리지 않아요.',
            '**남은 색과 자리**: 공개된 숫자로 그 통이 작은 쪽이었는지 큰 쪽이었는지 정해지면, 같은 색의 남은 통이 반대쪽이라는 게 확정돼요. 오름차순이라 그 통의 숫자는 이웃한 공개 숫자 사이에 있어요.',
            '**큰 숫자의 수**: 상대에게 7 이상이 몇 개 남았는지 세요. 내 큰 숫자가 상대보다 많아지는 순간부터는, 상대의 큰 숫자를 내 버릴 큐브로 받고 내 큰 숫자로 나머지를 이기면 돼요.',
          ] },
          { type: 'p', text: '점수 차도 같이 보세요. 남은 라운드보다 점수 차가 크면 그 자리에서 끝나고, 동점으로 끝나면 처음부터 다시 배치해요. 한 점 앞서 있다면 마지막 라운드에서 비기기만 해도 이겨요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**고르게 4·4·4·4·5·5·4 같은 배치**: 모든 라운드가 박빙이 되어 운에 맡기게 돼요. 이길 곳과 버릴 곳을 나누세요.',
            '**큰 숫자로 큰 숫자를 받기**: 상대 검정이 9일 수도 있는데 내 9로 받으면, 비기거나(둘 다 9) 상대가 0이었다면 9를 낭비해요.',
            '**흰 통에 큰 숫자를 쓰기**: 흰 통은 많아야 6이에요. 상대 흰 통을 9로 받는 건 대부분 낭비예요. 7이면 충분해요.',
            '**공개된 숫자를 잊기**: 상대의 큰 숫자가 몇 개 나갔는지 세지 않으면, 끝판에 남은 상대의 작은 숫자에 내 큰 숫자를 쓰게 돼요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI 4명, 친구 방, 공개방',
        blocks: [
          { type: 'table', head: ['상대', '특징'], rows: [
            ['노바 (계산형)', '이길 확률이 가장 높은 수만 둬요. 가장 강한 배치 몇 가지에서 거의 벗어나지 않아요.'],
            ['렉스 (공격형)', '맨 위 두 칸이 큰 배치를 좋아해서 큰 숫자로 기선을 잡으려 해요.'],
            ['미로 (수비형)', '최솟값과 최댓값의 차가 작은 고른 배치를 좋아해서 중반 싸움이 길어요.'],
            ['쥬드 (심리형)', '0이 많은 배치를 좋아하고 검정 통으로 흔들어요.'],
          ] },
          { type: 'p', text: '넷 모두 같은 실력(어려움)이고, 매 판 무작위로 한 명이 나와요. 내 배치를 엿보지 않고, 지금까지 나온 색과 숫자에 맞는 상대 배치를 모두 따져 수백 번의 가상 대국을 돌린 뒤 이길 확률이 가장 높은 통을 내요. 성향은 확률이 거의 같은 수 사이에서만 드러나요. AI전에는 통을 내는 시간 제한이 없어요.' },
          { type: 'p', text: '친구 방은 링크나 4자리 코드로 초대하고, 공개방은 다른 사람과 바로 1:1로 만나요. 사람끼리 둘 때는 통을 낼 때마다 30초 제한이 있고, 시간이 지나면 남은 통 중 하나가 무작위로 나가요. 세 번 연속 놓치면 그 판을 져요. 배치와 낸 통은 공개될 때까지 상대에게 보이지 않아요.' },
          { type: 'p', text: '로그인하면 AI전 승리는 명예의 전당과 어려움 클리어 인증서에, 친구·공개방 기록은 공개방 랭킹에 남아요. AI전 1위에게는 그라데이션 챔피언 아이콘이 붙어요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '그라데이션 통', def: '양 끝이 검정, 가운데로 갈수록 밝아지는 통 7개. 색으로 대략의 자리를 알려 줘요.' },
            { term: '선', def: '그 라운드에 통을 먼저 내는 사람. 직전 라운드의 승자예요.' },
            { term: '버릴 큐브', def: '질 라운드에 쓰려고 일부러 둔 작은 큐브(주로 0·1).' },
            { term: '합 30 배치', def: '큐브 합을 상한까지 채운 배치. 245가지가 있어요.' },
            { term: '조기 종료', def: '남은 라운드를 다 이겨도 뒤집을 수 없을 때 판이 바로 끝나는 것.' },
            { term: '재대결', def: '7라운드가 동점으로 끝나 둘 다 새로 배치해 다시 두는 것. 다섯 판까지예요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '그라데이션은 어떤 게임인가요?', a: '넷플릭스 「데블스 플랜: 데드 어게인」(데블스 플랜 3) 6일차 감옥 매치로 나온 1:1 숫자 심리전이에요. 숫자 큐브 7개를 오름차순·합 30 이하로 그라데이션 통에 숨기고, 통의 색만 보고 한 개씩 맞대결해 더 많이 이기면 승리해요.' },
      { q: '어떻게 배치하는 게 좋나요?', a: '7라운드 중 4번만 이기면 되니, 0·1 같은 작은 큐브 두세 개를 버릴 큐브로 두고 남은 합을 위쪽 칸에 몰아 주는 배치가 강해요. 예를 들어 1·1·2·2·7·8·9나 0·0·1·3·8·9·9예요.' },
      { q: '검정 통이 나오면 어떻게 읽나요?', a: '검정 통은 상대의 가장 작은 숫자 아니면 가장 큰 숫자예요. 합 30 배치라면 작은 쪽은 0~3, 큰 쪽은 6~9라, 한 번 공개되면 남은 검정이 어느 쪽인지 바로 알 수 있어요.' },
      { q: 'AI는 얼마나 강한가요?', a: 'AI는 어려움 한 단계예요. 상대의 배치를 보지 않고, 공개된 색과 숫자에 맞는 모든 배치를 따져 수백 번의 가상 대국을 돌린 뒤 가장 이길 확률이 높은 통을 내요. 성향이 다른 4명 중 한 명이 매 판 무작위로 나와요.' },
      { q: '친구와 할 수 있나요?', a: '네. 친구 방을 만들어 링크나 4자리 코드를 보내면 1:1로 대결할 수 있고, 공개방에서 다른 사람과 매칭할 수도 있어요. 배치와 낸 통은 공개 전까지 상대에게 보이지 않아요.' },
    ],
    cta: { title: '통 일곱 개를 채워 볼까요?', body: '버릴 큐브 둘을 정하고, 큰 숫자 셋으로 네 판을 노려 보세요.', button: '그라데이션 하러 가기' },
    disclaimer: '그라데이션은 넷플릭스 「데블스 플랜: 데드 어게인」에 등장한 게임의 규칙을 참고한 비공식 팬 게임이며, 넷플릭스 및 제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: "Gradation strategy — The Devil's Plan 3 prison match, rows and reading shades | PUZZLTHINK",
      description: "How to arrange your cubes and which cup to play in Gradation from The Devil's Plan 3: the numbers each shade can hold, sacrifice rows, narrowing the opponent's row from revealed cubes, a full match round by round, and the four AI players.",
      keywords: ['Gradation strategy', 'Gradation game rules', "Devil's Plan 3 Gradation", "Devil's Plan prison match", 'number cube game', '1:1 mind game'],
    },
    title: 'Gradation strategy guide',
    lead: 'Four rounds out of seven — losing the other three cheaply is the skill.',
    intro: [
      'Gradation is a 1:1 mind game: hide seven number cubes in seven cups, rising from left to right and adding up to 30 or less, then play one cup a round — the higher cube wins. All your opponent sees is **the cup’s shade**. The cups are darkest at both ends and lighten toward the middle, so every shade but white comes in pairs: one dark cup alone does not say whether it holds the smallest number or the largest.',
      'This guide assumes you know the rules and goes further: which numbers each cup can hold in a 30-sum row, what strong rows look like, how revealed cubes narrow the opponent’s row, and a whole match played round by round, showing where to win and where to throw.',
    ],
    gamePageTitle: "Gradation online — The Devil's Plan 3 prison match in your browser",
    summary: 'Number ranges by shade, sacrifice rows, narrowing a row, a match round by round.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "Gradation was the day-6 prison match of Netflix's The Devil's Plan: Dead Again (season 3). The numbers are simple, but the game is about combining the shades your opponent plays with the cubes already revealed to work out what they have left — calculation and bluffing together." },
          { type: 'p', text: 'On PUZZLTHINK you can play one of four AI players with different styles, or another person 1:1 in a friend or open room. A match is 7 rounds; a tie means both rearrange and play again.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Equipment**: each player gets 7 cups (dark, grey, light, white, light, grey, dark) and 20 number cubes (0–9, two of each).',
            '**Arranging**: within 5 minutes, secretly put one cube in each cup. From left to right the numbers **may not go down** (equal is fine), no number more than twice, and the seven add up to **30 or less**.',
            '**A round**: the lead player hands in a cup. The other side sees only its shade, never which position it came from. Then the other player hands in a cup.',
            '**The duel**: both cubes are revealed and the higher one scores a point. A tie scores nothing.',
            '**Next lead**: the round’s winner leads the next one; a tie keeps the lead where it was. Round 1’s lead is random.',
            '**The end**: after 7 rounds the higher score wins. If one side is ahead by more than the rounds left, the match ends at once. A tie means both arrange new rows and play again (the lead stays); five tied matches in a row is a draw.',
          ] },
          { type: 'h3', text: 'What a shade tells you' },
          { type: 'p', text: 'Because rows never go down, the two dark cups hold **the smallest and the largest number**, the greys the second smallest and second largest, the lights the third smallest and third largest. White is alone and holds the middle number. The two cups of a shade always hold different numbers (if they were equal, the cups between them would make three or more of that number).' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rules',
        blocks: [
          { type: 'cards', items: [
            { title: 'Each number twice at most', body: 'There are two cubes of each number, so 4, 4 side by side is fine — three 4s is not.' },
            { title: 'Must the row add to 30?', body: 'Less than 30 is legal, but higher numbers always beat lower ones, so rows nearly always use the full 30.' },
            { title: 'Out of arranging time', body: 'If you do not hand in a row within 5 minutes, a random 30-sum row is used.' },
            { title: 'Tied rounds', body: 'Nobody scores and the lead does not change — but both cubes are used up.' },
            { title: 'Positions stay secret', body: 'You see the shade and number of each cup your opponent plays, never its position. Once the number is out, though, shade plus number nearly always pins it down (see the range table).' },
            { title: 'Shades used are public', body: 'Everyone sees how many cups of each shade each player has used. If your opponent has one dark cup left, the dark number already revealed tells you whether it is their smallest or largest.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — a row built to win four',
        blocks: [
          { type: 'p', text: 'You only need **four wins out of seven**. Spread the 30 evenly and every round is a coin flip. Keep two or three small cubes as deliberate throwaways and pile the rest of the sum into the top four or five cups, and the rounds you mean to win, you win.' },
          { type: 'table', caption: 'Some strong rows the AI picked from its own self-play (all sum to 30)', head: ['Row', 'Shape'], rows: [
            ['1 1 2 2 7 8 9', 'four small + three big'],
            ['0 1 1 3 8 8 9', 'three small + one middle + three big'],
            ['0 0 1 3 8 9 9', 'throw two 0s, maximise the top'],
            ['0 1 2 3 7 8 9', 'a steady climb that jumps at the top'],
          ] },
          { type: 'list', items: [
            '**Throwaways are 0 and 1**: these are the cubes for rounds you will lose. A loss with a 0 is the same single loss as a loss with a 4.',
            '**Three big cubes, 7–9**: these bring the sure wins. The fourth win comes from a middle cube or your opponent’s mistake.',
            '**When answering, throw if you cannot win**: if their cup looks big, answer with a throwaway and keep your big cube for the next round.',
          ] },
        ],
      },
      {
        id: 'ranges',
        title: 'Which numbers each shade can hold',
        lead: 'There are only 245 rows that use the full 30. Within them, each cup’s possible numbers are narrower than you would think.',
        blocks: [
          { type: 'table', caption: 'Numbers each cup can hold across the 245 rows summing to 30', head: ['Cup', 'Shade', 'Range', 'Most common'], rows: [
            ['1', 'Dark', '0–3', '0'],
            ['2', 'Grey', '0–4', '1, 2'],
            ['3', 'Light', '1–5', '3'],
            ['4', 'White', '2–6', '4'],
            ['5', 'Light', '4–8', '5, 6'],
            ['6', 'Grey', '5–9', '7'],
            ['7', 'Dark', '6–9', '9'],
          ] },
          { type: 'list', items: [
            '**A dark cube of 0–3 is the small end; 6–9 is the large end.** A dark 4 or 5 never occurs in a 30-sum row, so once a dark cube is revealed you know at once what the other dark cup holds.',
            '**Greys split cleanly too**: 0–4 is the small one, 5–9 the large one.',
            '**Only lights overlap, at 4–5.** A light 4 or 5 has to be placed by comparing it with other revealed cubes.',
            '**White is 2–6**: a white cup can never hold 7 or more, so answering a white cup with a 7 always wins.',
          ] },
          { type: 'callout', tone: 'tip', title: 'The 30 is a strong clue', text: 'Subtract the opponent’s revealed cubes from 30 and you have the sum of what they have left. Once two of their big numbers are out, the rest must be small.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — reading one match',
        lead: 'Both rows are strong rows the AI uses. You play without seeing your opponent’s row — only shades and revealed cubes.',
        blocks: [
          row('en', 'You', ME, 'Your row (sums to 30)'),
          row('en', 'Opponent', AI, 'Opponent’s row (sums to 30, shown at the end)'),
          { type: 'steps', items: [
            { title: 'Round 1 — you lead: throw the dark 0', body: 'You play dark cup 1 (0). Your opponent cannot tell whether it is your 0 or your 9. They answer with a grey, revealed as 1: 0 v 1, they win and lead next. Now they know your remaining dark is your largest number. And you know their grey 1 is their second smallest, so their other grey is their second largest (5–9).' },
            { title: 'Round 2 — they lead: answer a dark with a throwaway', body: 'They play a dark. It is either their smallest (1 or less, since their grey was 1) or their largest. You answer with your grey 0. Revealed: their dark is 9, they win (0 : 2). But now their big 9 is gone, and their remaining dark is their smallest number, 0 or 1.' },
            { title: 'Round 3 — they lead: answer a light with 8', body: 'They play a light. You have 1, 3, 8, 9, 9 left. An 8 cannot lose to a light cup (lights hold at most 8). Revealed: 7, you win (1 : 2). A light 7 is the large light (4–8), so their remaining grey lies between 7 and 9, and their remaining light is the small one.' },
            { title: 'Count what they have left', body: 'Their revealed cubes are 1, 9 and 7: 17. The four left add up to 13 at most, and the grey is 7 or more, so the other three (dark, light, white) total 6 or less. **They have only one big cube left — the grey.** You have two 9s.' },
            { title: 'Round 4 — you lead: throw the 1 and hand over the lead', body: 'You trail 0 : 2 but three wins in the last four is enough. Play your light 1 and let their light 2 take it (1 : 3). In return they lead next and must show their shade first.' },
            { title: 'Rounds 5–7 — win every answer', body: 'Whatever they play, you can answer: a grey (7–9) with a 9, a small cup with your 3 (the other three total 6 or less, so at most one of them beats a 3). They played the grey 8; your 9 took it (2 : 3). Now you lead your dark 9 (they answer with dark 1, 3 : 3), and your white 3 beats their white 2 in the last round: **4 : 3, you win.**' },
          ] },
          { type: 'callout', tone: 'note', title: 'The lesson', text: 'You spent three cubes — 0, 0 and 1 — on lost rounds. In exchange you drew out their 9 and 7 early, could count what they had left, and in the end they had one big cube against your two 9s. What you play in the rounds you lose builds the rounds you win.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — leading versus answering',
        blocks: [
          { type: 'p', text: 'The lead shows a shade first; the answer chooses after seeing it. The same cube is **far more efficient when you answer**. Winning gives you the lead, so the round after a win is the one where you are worse off for information.' },
          { type: 'list', items: [
            '**Lead white carefully**: white holds 6 at most, so any 7 beats it for sure. On the other hand, white is a good way to pretend to play small and make your opponent hold back a big cube.',
            '**Lead dark to bluff**: a dark cup is the smallest or largest, so your opponent must choose between a big answer and a throw. Once one is revealed, though, the other dark is exposed.',
            '**Answer with the smallest winner**: if you can win, use the smallest cube that does. The win counts the same; what you keep does not.',
            '**Ties have a use**: a tie keeps the lead where it is. When you do not want to pass the lead, a matching cube for a tie is a real option.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — keep counting',
        blocks: [
          { type: 'p', text: 'Every round narrows the opponent’s row quickly. Keep three things up to date.' },
          { type: 'list', ordered: true, items: [
            '**The remaining sum**: 30 minus their revealed cubes. Assuming they used the full 30 is almost never wrong.',
            '**Remaining shades and positions**: once a revealed cube shows it was the small or large cup of its shade, the other cup of that shade is the opposite end — and, as rows rise, its number lies between the revealed cubes next to it.',
            '**How many big cubes**: count how many 7s or higher they have left. From the moment you have more big cubes than they do, throw at their big ones and win the rest with yours.',
          ] },
          { type: 'p', text: 'Watch the score too. A lead bigger than the rounds left ends the match on the spot, and a tie after 7 rounds starts over with new rows. One point ahead going into the last round, a tie is enough.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**An even row like 4 4 4 4 5 5 4**: every round becomes a toss-up. Decide where you win and where you throw.',
            '**Answering big with big**: their dark might be a 9; answering with your 9 ties at best, and wastes it if they played a 0.',
            '**Spending a 9 on a white**: white is at most 6. A 7 is enough.',
            '**Forgetting what was revealed**: if you do not count their big cubes, you end up spending your big ones on their small leftovers.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — four AIs, friend rooms, open rooms',
        blocks: [
          { type: 'table', head: ['Opponent', 'Style'], rows: [
            ['Nova (calculator)', 'Always plays the likeliest win and rarely strays from the very strongest rows.'],
            ['Rex (aggressor)', 'Likes rows with big top cups and tries to take an early lead.'],
            ['Miro (wall)', 'Likes even rows with a small spread, so the middle of the match is long.'],
            ['Jude (trickster)', 'Likes rows with zeros and bluffs with dark cups.'],
          ] },
          { type: 'p', text: 'All four are the same strength (Hard), and one is drawn at random each match. None of them looks at your row: they consider every row that fits the shades and cubes seen so far, play the rest of the match out hundreds of times and hand in the cup with the best chance. Style only shows between moves that are almost equally good. The AI match has no clock on handing in cups.' },
          { type: 'p', text: 'Invite a friend by link or 4-digit code, or meet another player 1:1 in an open room. Between people each cup has a 30-second clock; when it runs out a random free cup is played, and three misses in a row lose the match. Rows and played cups stay hidden from the other side until they are revealed.' },
          { type: 'p', text: 'Signed in, AI wins go to the hall of fame and the Hard clear certificate, and room results to the open-room ranking. First place against the AI wears the Gradation champion icon.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Gradation cups', def: 'Seven cups, dark at both ends and lighter toward the middle; a shade tells roughly where a cup stood.' },
            { term: 'Lead', def: 'The player who hands in a cup first this round — the winner of the last round.' },
            { term: 'Throwaway', def: 'A small cube (usually 0 or 1) kept on purpose for rounds you will lose.' },
            { term: '30-sum row', def: 'A row that uses the full sum. There are 245.' },
            { term: 'Early end', def: 'The match stopping as soon as the trailing side cannot catch up even by winning every round left.' },
            { term: 'Rematch', def: 'Both players arranging new rows after a 7-round tie. Up to five matches.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is Gradation?', a: "A 1:1 number mind game from the day-6 prison match of Netflix's The Devil's Plan: Dead Again (season 3). Hide seven cubes in shaded cups, rising and adding to 30 or less, and duel one cup at a time seeing only the shades; win more rounds to win." },
      { q: 'What is a good row?', a: 'You only need four wins out of seven, so keep two or three small cubes such as 0 and 1 as throwaways and pile the rest of the sum into the top cups — for example 1 1 2 2 7 8 9 or 0 0 1 3 8 9 9.' },
      { q: 'How do I read a dark cup?', a: 'A dark cup is the opponent’s smallest or largest number. In a 30-sum row the small one is 0–3 and the large one 6–9, so once one is revealed you know which the other one is.' },
      { q: 'How strong is the AI?', a: 'There is one level, Hard. The AI never looks at your row: it considers every row that fits the shades and numbers shown, plays the match out hundreds of times and hands in the cup most likely to win. One of four players with different styles is drawn at random each match.' },
      { q: 'Can I play with friends?', a: 'Yes. Create a friend room and send the link or 4-digit code for a 1:1 match, or find someone in an open room. Rows and played cups stay hidden from the other side until revealed.' },
    ],
    cta: { title: 'Ready to fill seven cups?', body: 'Pick two throwaways, then go for four wins with three big cubes.', button: 'Play Gradation' },
    disclaimer: "Gradation is an unofficial fan game based on a game from Netflix's The Devil's Plan: Dead Again and is not affiliated with Netflix or the producers.",
  },
};
export default guide;
