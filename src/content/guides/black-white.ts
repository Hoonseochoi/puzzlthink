// Black & White guide. Rules and numbers follow src/lib/blackWhite.ts (TILES 0–8, colorOf: even black / odd white,
// resolveRound, nextLeader: the winner leads and a draw keeps the leader, isOver: 9 rounds or a lead bigger than the
// rounds left, colorsLeft 5 black / 4 white, possibleHistories and chooseAiTile with the level split — easy plays half
// at random, normal one tile in four by feel, hard always samples — readRound's edge / bait / overkill labels) and
// src/lib/blackWhiteRoom.ts (BW_TURN_OPTIONS 15/30/60, a random tile on timeout, the third in a row loses).
// BlackWhiteGame.tsx has no turn clock. Inline guide: BlackWhiteGuide in ko/en.json.
// The answer table assumes the leader's colour is all the follower knows (round 1); counted by hand.
import type { GameGuide } from './types';
import { BW_TELLS } from '@/lib/blackWhite';
import { personaSection } from './personaSection';

const guide: GameGuide = {
  game: 'blackWhite',
  origin: { kind: 'show', show: 'genius2' },
  updated: '2026-11-27',
  related: ['blackWhite2', 'indianPoker', 'twoSidedPoker', 'monorail'],
  inlineNamespace: 'BlackWhiteGuide',
  ko: {
    meta: {
      title: '흑과 백 공략 — 색과 승패로 상대 타일 추리하기 | PUZZLTHINK',
      description: '더 지니어스 흑과 백 공략. 흑 5장·백 4장의 비대칭, 색별 응수 승률표, 승패와 무승부로 상대 숫자를 좁히는 추리, 4라운드 따라가기, 버림패와 한 끗 승리, AI 난이도별 특징까지 정리했어요.',
      keywords: ['흑과 백 공략', '흑과백 공략', '흑과 백 규칙', '더 지니어스 흑과 백', '흑과 백 전략', '흑과백 필승법', '흑과 백 게임', '룰 브레이커 흑과 백'],
    },
    title: '흑과 백 공략',
    lead: '숫자는 끝까지 숨겨져 있어요. 보이는 건 색과 승패뿐이에요.',
    intro: [
      '흑과 백은 두 사람이 똑같이 0~8 타일 아홉 장을 들고 한 장씩 내서 큰 숫자가 이기는 게임이에요. 단순해 보이지만 **상대가 낸 숫자는 게임이 끝날 때까지 공개되지 않고**, 짝수는 흑·홀수는 백이라는 색과 승패만 보여요. 그래서 이 게임의 실력은 "그 색과 결과에서 무엇을 알아낼 수 있느냐"에서 갈려요.',
      '이 공략에서는 흑과 백의 장수 차이가 만드는 비대칭, 첫 라운드 응수 승률표, 결과 하나하나로 상대 타일을 지워 가는 추리 과정, 네 라운드를 따라가는 예시, 단계별 전략과 AI 메모를 다뤄요.',
    ],
    gamePageTitle: '흑과 백 — 숫자를 감추고 색으로 읽는 심리전',
    summary: '흑 5장·백 4장의 비대칭, 응수 승률표, 승패와 무승부로 상대 타일 지우기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '흑과 백은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '흑과 백은 「더 지니어스: 룰 브레이커」의 데스매치로 소개된 2인 심리전이에요. 두 사람이 같은 패를 들고 시작하니 운이 끼어들 틈이 없고, 오로지 언제 큰 수를 쓰고 언제 버릴지의 판단으로 승부가 나요.' },
          { type: 'p', text: '같은 패로 싸운다는 점에서 가위바위보보다 정보가 많고, 상대 숫자를 끝까지 모른다는 점에서 일반 카드 대결보다 정보가 적어요. 그 중간에서, 색과 결과만으로 상대의 남은 패를 지워 나가는 추리가 핵심이에요. 게임이 끝나면 모든 타일을 뒤집어 라운드별로 복기할 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**타일**: 두 사람 모두 0~8 아홉 장을 받아요. 짝수 0·2·4·6·8은 흑, 홀수 1·3·5·7은 백이에요.',
            '**선과 후**: 1라운드 선은 무작위예요. 선이 타일 한 장을 뒷면으로 내면 그 색만 공개돼요. 후는 그 색을 보고 자기 타일을 내요.',
            '**승부**: 큰 숫자를 낸 쪽이 1점이에요. 같은 숫자면 무승부로 아무도 점수를 얻지 못해요.',
            '**공개 범위**: 승·패·무 결과와 두 타일의 색만 공개돼요. 숫자는 게임이 끝날 때까지 숨겨져요.',
            '**다음 선**: 이긴 사람이 다음 라운드의 선이 돼요. 무승부면 방금 선이 다시 선이에요.',
            '**종료**: 9라운드를 마치거나, 남은 라운드를 다 이겨도 따라잡을 수 없는 점수 차가 되면 끝나요. 점수가 같으면 무승부예요.',
          ] },
          { type: 'table', caption: '두 색의 구성', head: ['색', '타일', '장수', '숫자 합'], rows: [['흑', '0·2·4·6·8', '5장', '20'], ['백', '1·3·5·7', '4장', '16']] },
          { type: 'p', text: '가장 큰 8도, 가장 작은 0도 흑이에요. 그래서 흑은 "최강이거나 버림패"일 수 있어 읽기 어렵고, 백은 1~7 사이라 범위가 좁아요. 그리고 아홉 라운드를 다 하면 흑끼리 맞붙는 라운드가 적어도 한 번은 생겨요. 내 흑 다섯 장을 상대 백 네 장이 다 받아 낼 수는 없으니까요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '무승부는 어떻게 나오나요?', body: '같은 숫자를 낼 때뿐이에요. 같은 숫자는 같은 색이라, 선이 낸 색과 같은 색으로 응수했을 때만 무승부가 날 수 있어요. 그리고 무승부가 났다는 건 **두 사람이 낸 숫자가 정확히 같다**는 뜻이라, 내 숫자로 상대 숫자를 알아낼 수 있어요.' },
            { title: '0은 쓸모가 없나요?', body: '0은 이길 수 없어요. 상대도 0을 내야 비겨요. 하지만 상대가 큰 수를 낼 것 같은 라운드에 0을 버리면, 가장 싼 값으로 상대의 큰 타일 하나를 지울 수 있어요.' },
            { title: '8은 무조건 이기나요?', body: '8은 지지 않아요. 상대도 8을 내면 비기고, 그 외에는 모두 이겨요. 8은 "확실한 1점"이지만 한 번밖에 못 쓰니 언제 쓰느냐가 중요해요.' },
            { title: '일찍 끝나는 건 언제인가요?', body: '점수 차가 남은 라운드 수보다 크면 끝나요. 예를 들어 6라운드 뒤 5:1이면 남은 3라운드를 다 져도 5:4라 바로 끝나요. 쓰지 않은 타일은 복기에서 공개돼요.' },
            { title: '상대가 낸 색의 장수도 보이나요?', body: '네. 상대가 흑과 백을 몇 장씩 썼는지는 계속 보이니, 남은 흑·백 장수는 언제나 정확히 알 수 있어요. 상대 흑이 한 장 남았다면 다음 흑이 무엇인지 거의 확정되는 경우도 있어요.' },
            { title: '친구전에서 시간이 지나면?', body: '친구전은 턴마다 15·30·60초 중 방장이 고른 시간이 있어요. 시간이 지나면 남은 타일 중 하나가 무작위로 나가고, 세 번 연속이면 패배예요. AI전은 시간 제한이 없어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 색을 보고 응수하기',
        blocks: [
          { type: 'p', text: '후일 때는 선의 색을 보고 응수해요. 첫 라운드처럼 상대가 아무것도 쓰지 않았다면, 흑은 0·2·4·6·8 중 하나, 백은 1·3·5·7 중 하나예요. 다섯 장(또는 네 장)이 모두 같은 확률이라고 할 때, 내 타일로 이길 확률은 아래와 같아요. 실제로 사람은 아무 타일이나 고르지 않으니, 이 표는 출발점일 뿐이에요.' },
          { type: 'table', caption: '첫 라운드 응수 승률 (괄호는 무승부 확률)', head: ['내 타일', '0', '1', '2', '3', '4', '5', '6', '7', '8'], rows: [
            ['상대가 흑일 때', '0% (20%)', '20%', '20% (20%)', '40%', '40% (20%)', '60%', '60% (20%)', '80%', '80% (20%)'],
            ['상대가 백일 때', '0%', '0% (25%)', '25%', '25% (25%)', '50%', '50% (25%)', '75%', '75% (25%)', '100%'],
          ] },
          { type: 'list', items: [
            '**흑에는 홀수로, 백에는 짝수로 응수하면 비기지 않아요**: 색이 다르면 무승부가 없어요. 결과가 확실히 갈리니 정보도 확실히 얻어요.',
            '**백에는 6이 강해요**: 백의 최대는 7이라, 내 6은 백 1·3·5를 이기고 7에만 져요. 백 앞에서 8을 쓰는 건 낭비일 때가 많아요.',
            '**흑에는 7이 강해요**: 흑 앞의 7은 8에만 지고 나머지 흑을 다 이겨요.',
            '**질 것 같으면 가장 작은 수**: 상대 색과 지난 결과로 보아 큰 수 같다면 0이나 1을 버리세요. 지는 라운드는 싸게 지는 게 이득이에요.',
            '**이길 때는 한 끗 차이로**: 같은 1점이라면 작은 수로 이기는 쪽이 남은 라운드에서 유리해요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 네 라운드의 추리',
        lead: 'AI가 선이에요. 결과가 나올 때마다 상대(AI)가 가질 수 있는 타일을 지워 가 볼게요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1라운드: AI 흑, 나 1 → 패배', body: '흑에 가장 싼 백 1로 떠봤어요. 졌으니 AI의 흑은 1보다 커요. 0은 빠지고 **2·4·6·8 중 하나**예요. 점수 0:1, AI가 계속 선이에요.' },
            { title: '2라운드: AI 백, 나 6 → 승리', body: '백 앞에 6을 냈고 이겼어요. AI의 백은 6보다 작으니 **1·3·5 중 하나**예요. 7은 아직 AI 손에 있을 수 있어요. 점수 1:1, 이제 내가 선이에요.' },
            { title: '3라운드: 나 8, AI 흑 → 무승부', body: '흑 8로 선을 잡았는데 AI도 흑으로 응수해 비겼어요. 무승부는 같은 숫자라는 뜻이니 **AI도 방금 8을 썼어요**. 1라운드의 흑은 2·4·6 중 하나로 좁혀졌어요. 점수 1:1, 무승부라 내가 다시 선이에요.' },
            { title: '4라운드: 나 5, AI 백 → 승리', body: '백 5로 선을 잡았고 AI도 백으로 응수했는데 내가 이겼어요. AI의 이번 백은 **1·3 중 하나**예요. 2라운드의 백(1·3·5)과 이번 백(1·3)은 서로 다른 타일이니, AI가 쓴 백 두 장에 7은 없어요. **AI 손에는 7이 반드시 남아 있어요.** 점수 2:1.' },
          ] },
          { type: 'callout', tone: 'tip', title: '4라운드 뒤 정리', text: 'AI의 남은 타일: 흑은 0과 2·4·6 중 두 장, 백은 7과 1·3·5 중 한 장. AI의 8은 사라졌으니, 내 손에 남은 7은 지지 않는 타일이 됐어요(AI의 7과 만나면 비김). 반대로 AI가 백을 내면 7이거나 작은 백이에요. 7이라고 생각되면 0을 버리고, 작은 백이라고 생각되면 2나 4로 한 끗 차이를 노려요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 결과로 범위 좁히기',
        blocks: [
          { type: 'p', text: '중급부터는 매 라운드 결과를 "상대 타일의 범위"로 바꿔 적는 습관을 들여요. 화면의 추리 메모에서 숫자를 지워 가며 따라가면 실수가 줄어요.' },
          { type: 'cards', items: [
            { tag: '승패', title: '이기면 위가, 지면 아래가 지워져요', body: '내 5에 상대 흑이 졌다면 그 흑은 0·2·4, 이겼다면 6·8이에요. 결과 하나가 상대 색 범위를 둘로 잘라요. 무승부는 정확히 한 숫자로 확정돼요.' },
            { tag: '장수', title: '남은 흑·백 장수', body: '상대가 흑을 몇 장 썼는지는 항상 보여요. 흑 5장 중 4장을 썼고 그중 세 장이 이미 확정됐다면, 마지막 흑은 남은 둘 중 하나예요. 색 장수와 범위를 함께 보면 후반에는 상대 손이 거의 다 보여요.' },
            { tag: '선', title: '선일 때 중간 숫자로 떠보기', body: '선은 정보를 먼저 줘야 해서 불리해요. 3·4·5 같은 중간 숫자로 선을 잡으면, 상대가 이기려면 그보다 큰 수를 써야 하고, 버리면 작은 수를 써야 해요. 어느 쪽이든 상대 패가 드러나요.' },
            { tag: '후', title: '후일 때 버리거나 한 끗', body: '후는 선의 색을 보고 결정하는 유리한 자리예요. 상대 범위가 좁혀졌다면 이길 수 있는 가장 작은 수로 이기고, 범위가 크다면 가장 작은 수를 버려 상대의 큰 수를 소모시키세요.' },
          ] },
          { type: 'p', text: '양쪽 타일의 합은 똑같이 36이에요. 결국 아홉 라운드는 "같은 자원을 어디에 몰아 쓰느냐"의 싸움이라, 크게 이긴 라운드가 많을수록 다른 라운드에서 손해를 봐요. 복기에서 이긴 라운드의 숫자 차이를 확인해 보세요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 큰 타일의 교환과 종반 계산',
        blocks: [
          { type: 'h3', text: '8과 0은 짝을 이뤄요' },
          { type: 'p', text: '내 0으로 상대 8을 받아 내면, 나는 1점을 주고 상대는 가장 강한 타일을 잃어요. 반대로 내 8이 상대 0을 만나면 1점은 얻지만 최강 타일을 가장 싼 상대에게 쓴 셈이에요. 그래서 고수끼리는 상대 흑이 8인지 0인지를 읽는 싸움이 자주 나와요. 흑을 낸 상대가 그 직전에 무엇을 원하는 상황이었는지(점수, 선, 남은 장수)를 같이 보세요.' },
          { type: 'h3', text: '선을 잡을지, 넘길지' },
          { type: 'p', text: '이기면 다음 선이 돼요. 선은 색을 먼저 보여 줘야 해서 정보 면에서 불리하니, 일부러 한 라운드를 내주고 후를 잡는 것도 전략이에요. 특히 상대에게 큰 타일이 많이 남았을 때는 내가 선을 잡기보다 상대가 선이 되어 먼저 색을 보여 주게 만드는 편이 나아요.' },
          { type: 'h3', text: '종반: 남은 타일을 짝지어 보기' },
          { type: 'p', text: '6~7라운드쯤이면 상대 남은 타일이 두세 장으로 좁혀져요. 이때는 내 남은 타일과 상대 남은 타일을 모든 순서로 짝지어 보고, 몇 점을 더 얻을 수 있는지 세어 보세요. 남은 라운드가 적을수록 경우의 수가 작아서, 끝까지 계산으로 이길 수 있어요. 점수 차가 남은 라운드보다 커지는 순간 게임이 끝난다는 점도 계산에 넣으세요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**큰 수로 크게 이기기**: 상대 백 1에 8을 쓰면 1점을 얻고 최강 타일을 잃어요. 이길 수 있는 가장 작은 수가 좋은 수예요.',
            '**무승부의 정보를 흘려보내기**: 무승부는 상대 숫자가 내 숫자와 같다는 확실한 정보예요. 꼭 메모하세요.',
            '**흑을 강하다고만 보기**: 흑에는 8도 있지만 0도 있어요. 흑 앞에서 무조건 큰 수로 막으면 상대의 버림패에 큰 수를 잃어요.',
            '**상대 색 장수를 잊기**: 남은 흑·백 장수는 언제나 정확히 알 수 있어요. 후반에 상대가 백을 다 썼다면 다음은 무조건 흑이에요.',
            '**선을 무조건 좋은 것으로 여기기**: 선은 정보를 먼저 내줘요. 이겨서 선을 잡는 것만이 이득은 아니에요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구전, 복기',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['공통', 'AI도 사람과 똑같이 자기 타일, 내가 낸 색, 승패만 봐요. 내 숫자를 몰래 보지 않아요.'],
            ['쉬움', '절반은 아무 타일이나 내고, 나머지는 색만 보고 감으로 둬요.'],
            ['보통', '대부분은 어려움과 같은 방식으로 두지만, 네 번에 한 번은 감으로 둬요.'],
            ['어려움', '지금까지의 색과 승패에 맞는 내 타일 순서를 모두 따져 본 뒤, 남은 게임을 여러 번 시뮬레이션해서 가장 잘 이기는 타일을 골라요. 같은 상황에서 늘 같은 수를 두면 읽히기 때문에 일부러 선택을 섞어요.'],
            ['성향', '모든 난이도에서 열 가지 성향 중 하나가 무작위로 나와요. 어려움은 성향 그대로 전력으로 두고, 쉬움·보통은 같은 성향에 그 난이도의 실수(무작위·감으로 두기)가 그대로 섞여요.'],
            ['친구전', '초대 링크나 4자리 코드로 1:1 대결해요. 턴 시간은 15·30·60초 중에서 골라요. 시간이 지나면 무작위 타일이 나가고, 세 번 연속이면 패배예요.'],
            ['복기', '끝나면 모든 타일이 공개되고, "그때 내가 본 화면"과 "전부 공개"를 오가며 볼 수 있어요. 한 끗 승리(1 차이), 미끼(1 이하로 져서 상대의 6 이상을 끌어냄), 과한 승리(5 이상 차이) 같은 라운드에 표시가 붙어요.'],
          ] },
        ],
      },
      personaSection('ko', BW_TELLS, [
        '흑과 백에서 성향이 드러나는 곳은 **큰 숫자를 언제 쓰느냐**예요. 같은 판이라도 공격형은 이길 수 있는 판을 큰 수로 확실히 가져가고, 신중형과 막판 승부사는 작은 수로 흘려보내며 큰 수를 뒤로 미뤄요. AI는 내 숫자를 볼 수 없으니, 내 버릇도 **색과 승패**로만 읽어요. 예를 들어 내가 선으로 낸 판을 자주 이긴다면 "선에 큰 수를 내는 사람"으로 보고 응수를 조정해요.',
      ], ['복기 화면의 성향 카드에는 AI가 1~4라운드에 낸 숫자 합도 나와요. 고르게 쓰면 16 안팎이고, 이보다 크면 초반에 힘을 쓴 판, 작으면 아껴 둔 판이에요.']),
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '흑 / 백', def: '짝수 타일(0·2·4·6·8)과 홀수 타일(1·3·5·7). 상대에게는 색만 보여요.' },
            { term: '선 / 후', def: '먼저 타일을 내는 사람과 색을 보고 응수하는 사람.' },
            { term: '버림패', def: '질 라운드에 일부러 내는 작은 타일. 상대의 큰 타일을 싸게 지워요.' },
            { term: '한 끗 승리', def: '1 차이로 이기기. 같은 1점을 가장 적은 자원으로 얻는 방법이에요.' },
            { term: '미끼', def: '1 이하의 타일로 져서 상대의 6 이상을 끌어낸 라운드(복기 표시).' },
            { term: '범위', def: '지금까지의 색·승패로 보아 상대 타일이 될 수 있는 숫자들.' },
            { term: '조기 종료', def: '점수 차가 남은 라운드 수보다 커져서 게임이 끝나는 것.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '흑과 백은 어디서 할 수 있나요?', a: 'PUZZLTHINK 흑과 백 페이지에서 가입이나 설치 없이 PC와 모바일 브라우저로 바로 할 수 있어요.' },
      { q: '상대 숫자는 언제 알 수 있나요?', a: '게임 중에는 색과 승패만 보이고, 게임이 끝나면 모든 타일이 공개돼요. 다만 무승부가 나면 상대 숫자가 내 숫자와 같다는 걸 바로 알 수 있어요.' },
      { q: '흑과 백의 장수가 왜 다른가요?', a: '0~8 중 짝수는 0·2·4·6·8 다섯 개, 홀수는 1·3·5·7 네 개라서예요. 가장 큰 8과 가장 작은 0이 모두 흑이에요.' },
      { q: 'AI는 내 숫자를 몰래 보나요?', a: '아니요. AI도 자기 타일, 내가 낸 색, 승패만 보고 판단해요. 어려움 AI는 그 정보로 가능한 경우를 따져 시뮬레이션할 뿐이에요.' },
      { q: '친구와 하려면 어떻게 하나요?', a: '친구와 하기로 방을 만들면 초대 링크와 4자리 코드가 생겨요. 친구는 링크를 열거나 입장 화면에 코드를 넣으면 돼요.' },
      { q: '기록은 남나요?', a: '로그인하면 승·패·무 기록이 기록실에 저장돼요.' },
    ],
    cta: { title: '첫 수는 어떤 색으로 낼까요?', body: '추리 메모를 켜고 AI와 한 판 해 보세요. 끝나면 복기로 상대의 숫자를 모두 확인할 수 있어요.', button: '흑과 백 하러 가기' },
    disclaimer: '흑과 백은 방송에 소개된 게임 방식에서 착안해 PUZZLTHINK가 웹용으로 다시 만든 것으로, 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Black & White strategy guide — deduce their tiles from colours and results | PUZZLTHINK',
      description: 'Black & White from The Genius: Rule Breaker, in depth: the five-black, four-white asymmetry, answer odds by colour, narrowing their tiles from wins, losses and draws, four rounds played out, throwaways and one-point wins, and the AI levels.',
      keywords: ['Black and White strategy', 'Black and White game rules', 'The Genius black and white', 'Rule Breaker black and white', 'black white tile game', 'how to win black and white'],
    },
    title: 'Black & White strategy guide',
    lead: 'The numbers stay hidden to the end. All you see are colours and results.',
    intro: [
      "In Black & White both players hold the same nine tiles, 0 to 8, and play one each round; the higher number wins. It sounds simple, but **the numbers your opponent plays are never shown until the game ends** — only the colour (even is black, odd is white) and who won. Skill comes down to what you can work out from those colours and results.",
      'This guide covers the asymmetry between the colours, answer odds for the first round, the deduction that crosses out their tiles one result at a time, four rounds played out, strategy by level and notes on the AI.',
    ],
    gamePageTitle: 'Black & White — hide the numbers, read the colours',
    summary: 'The five-black, four-white asymmetry, answer odds, crossing out their tiles from results and draws.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Black & White?',
        blocks: [
          { type: 'p', text: 'Black & White was introduced as a death match on The Genius: Rule Breaker. Both players start with identical tiles, so there is no luck: the game is decided purely by when you spend big numbers and when you throw small ones away.' },
          { type: 'p', text: 'Holding the same hand gives you more information than rock-paper-scissors; never seeing their numbers gives you less than a normal card duel. In between sits the core of the game: crossing out their remaining tiles using only colours and results. When the game ends every tile is turned over and you can replay it round by round.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Tiles**: both players get nine tiles, 0–8. Even tiles 0, 2, 4, 6, 8 are black; odd tiles 1, 3, 5, 7 are white.',
            '**Leader and follower**: the round-1 leader is random. The leader plays a tile face down and only its colour is shown; the follower sees that colour and plays a tile.',
            '**Scoring**: the higher number scores 1 point. Equal numbers are a draw and nobody scores.',
            '**What is shown**: the result (win, loss, draw) and both colours. Numbers stay hidden until the game ends.',
            '**Next leader**: the round winner leads next. After a draw the same leader leads again.',
            '**The end**: after 9 rounds, or as soon as a lead cannot be caught in the rounds left. Equal scores are a draw.',
          ] },
          { type: 'table', caption: 'The two colours', head: ['Colour', 'Tiles', 'Count', 'Sum'], rows: [['Black', '0·2·4·6·8', '5', '20'], ['White', '1·3·5·7', '4', '16']] },
          { type: 'p', text: 'Both the strongest tile, 8, and the weakest, 0, are black, so a black tile can be "the best or a throwaway" and is hard to read; white always lies between 1 and 7. And if all nine rounds are played, at least one round is black against black: their four whites cannot meet all five of your blacks.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations',
        blocks: [
          { type: 'cards', items: [
            { title: 'When can a draw happen?', body: 'Only with equal numbers, which share a colour, so only when the follower answers in the leader\'s colour. And a draw means **their number equals yours exactly**, so you learn it.' },
            { title: 'Is the 0 useless?', body: 'It never wins; only their 0 draws it. But thrown into a round where they play big, it erases one of their big tiles at the lowest possible price.' },
            { title: 'Does the 8 always win?', body: 'It never loses: their 8 draws, everything else loses. It is one sure point, usable once, so timing is everything.' },
            { title: 'When does the game end early?', body: 'When the score gap exceeds the rounds left. After 6 rounds at 5–1, losing all three remaining rounds still leaves 5–4, so it ends at once. Unplayed tiles are shown in the replay.' },
            { title: 'Can I see how many of each colour they used?', body: 'Yes, always, so their remaining black and white counts are exact. With one black left, their next black may already be pinned down.' },
            { title: 'What if time runs out in a friend match?', body: 'Friend matches use the host\'s choice of 15, 30 or 60 seconds a turn. A timeout plays a random tile from your hand; three in a row loses. Games against the AI have no clock.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — answer the colour',
        blocks: [
          { type: 'p', text: "As follower you answer the leader's colour. When nothing has been played yet, a black is one of 0, 2, 4, 6, 8 and a white one of 1, 3, 5, 7. If each is equally likely, your tiles win as below. Real people do not pick at random, so treat this as a starting point." },
          { type: 'table', caption: 'Round-1 answer odds (draw chance in brackets)', head: ['Your tile', '0', '1', '2', '3', '4', '5', '6', '7', '8'], rows: [
            ['Against black', '0% (20%)', '20%', '20% (20%)', '40%', '40% (20%)', '60%', '60% (20%)', '80%', '80% (20%)'],
            ['Against white', '0%', '0% (25%)', '25%', '25% (25%)', '50%', '50% (25%)', '75%', '75% (25%)', '100%'],
          ] },
          { type: 'list', items: [
            '**Answer black with odd, white with even, and there is no draw**: different colours always produce a clear result, and a clear result gives clear information.',
            '**A 6 is strong against white**: white tops out at 7, so your 6 beats 1, 3 and 5 and loses only to 7. An 8 against white is often a waste.',
            '**A 7 is strong against black**: it loses only to 8.',
            '**Expect to lose? Play your smallest**: if the colour and earlier results suggest a big tile, throw a 0 or 1. Lose cheaply.',
            '**Win by one**: the point is the same, so the smaller winning tile leaves you stronger later.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — deduction over four rounds',
        lead: 'The AI leads. After each result, cross out the tiles the AI can no longer hold.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Round 1: AI black, you 1 → loss', body: 'You probe the black with your cheapest white, 1, and lose. Their black is above 1: not 0, so **one of 2, 4, 6, 8**. 0–1, the AI keeps the lead.' },
            { title: 'Round 2: AI white, you 6 → win', body: 'Your 6 beats their white, so it was **1, 3 or 5**. Their 7 may still be in hand. 1–1, you lead now.' },
            { title: 'Round 3: you 8, AI black → draw', body: 'You lead the 8 and they answer black: a draw. A draw means equal numbers, so **the AI just spent its 8** — and the round-1 black was 2, 4 or 6. 1–1, and after a draw you lead again.' },
            { title: 'Round 4: you 5, AI white → win', body: 'You lead white 5 and they answer white and lose: **1 or 3**. Their round-2 white (1, 3, 5) and this one (1, 3) are different tiles, so neither was the 7. **The AI still holds its 7.** 2–1.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'Where things stand after round 4', text: 'The AI holds black 0 plus two of 2, 4, 6, and white 7 plus one of 1, 3, 5. Its 8 is gone, so your own 7 can no longer lose (their 7 would draw it). When the AI leads white it is either the 7 or a small one: if you read the 7, throw your 0; if you read a small one, aim for a one-point win with your 2 or 4.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — turn results into ranges',
        blocks: [
          { type: 'p', text: 'From here on, write every result down as "the range of their tile". Crossing numbers out in the deduction notes on screen keeps mistakes away.' },
          { type: 'cards', items: [
            { tag: 'Results', title: 'A win crosses out the top, a loss the bottom', body: 'If their black lost to your 5 it was 0, 2 or 4; if it won, 6 or 8. Each result cuts their colour range in two, and a draw pins it to one number.' },
            { tag: 'Counts', title: 'Remaining black and white', body: 'Their colour counts are always visible. With four of five blacks used and three of them already pinned, the last black is one of two. Combining counts and ranges, their hand is almost fully visible late in the game.' },
            { tag: 'Leading', title: 'Probe with middle tiles', body: 'The leader gives information first, which is a disadvantage. Leading a 3, 4 or 5 forces them to spend something bigger to win or something smaller to throw — either way their hand shows.' },
            { tag: 'Following', title: 'Throw away or win by one', body: 'Following is the comfortable seat: you decide after seeing the colour. With a narrow range, win with the smallest tile that wins; with a wide one, throw your smallest and let them burn a big tile.' },
          ] },
          { type: 'p', text: 'Both hands sum to 36. Nine rounds are a contest over where to concentrate the same resources, so every round won by a wide margin is paid for elsewhere. Check your winning margins in the replay.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — trading big tiles and counting the endgame',
        blocks: [
          { type: 'h3', text: 'The 8 and the 0 come as a pair' },
          { type: 'p', text: 'Absorb their 8 with your 0 and you give up a point while they lose their strongest tile. Spend your 8 on their 0 and you score but waste your best tile on their cheapest. Strong players often end up fighting over whether a black is an 8 or a 0; judge it by what they needed at that moment — the score, the lead, their remaining counts.' },
          { type: 'h3', text: 'Take the lead, or give it away?' },
          { type: 'p', text: 'Winning makes you the next leader, and leading means showing your colour first. Deliberately conceding a round to follow is a real option, especially while they still hold many big tiles: let them lead and show colours first.' },
          { type: 'h3', text: 'Endgame: pair up the remaining tiles' },
          { type: 'p', text: 'By round 6 or 7 their hand is down to two or three tiles. Pair your remaining tiles with theirs in every order and count how many points you can still take. With few rounds left the cases are few, and the end can be won by calculation. Remember that the game ends the moment the gap exceeds the rounds left.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Winning big with big tiles**: an 8 against their white 1 scores once and loses your best tile. The smallest winning tile is the best tile.',
            '**Ignoring what a draw tells you**: it is hard proof that their number equals yours. Write it down.',
            '**Treating black as strong**: black includes the 8 but also the 0. Blocking every black with a big tile feeds your big tiles to their throwaways.',
            '**Forgetting their colour counts**: they are always exact. If they have used all their whites, the next tile is black.',
            '**Treating the lead as always good**: the leader gives information first. Winning just to lead is not automatically a gain.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend matches, replay',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['All levels', 'The AI sees exactly what a player sees: its tiles, your colours and the results. It never peeks at your numbers.'],
            ['Easy', 'Plays a random tile half the time and goes by colour feel otherwise.'],
            ['Normal', 'Plays mostly like Hard, but one tile in four by feel.'],
            ['Hard', 'Lists every sequence of your tiles consistent with the colours and results, plays the rest of the game out many times and picks the tile that wins most often. It mixes its choices on purpose, because a fixed choice in the same spot gets read.'],
            ['Personality', 'Every level draws one of ten personalities at random. Hard plays it at full strength; easy and normal play the same personality with their level’s usual mistakes (random or by-feel tiles) on top.'],
            ['Friend matches', 'One-on-one by invite link or 4-digit code. Turns of 15, 30 or 60 seconds; a timeout plays a random tile, and three in a row loses.'],
            ['Replay', 'Every tile is revealed and you can switch between "what I saw then" and "everything". Rounds are tagged: a one-point win, a bait (lost with 1 or less while drawing out their 6+) and an overkill (won by 5 or more).'],
          ] },
        ],
      },
      personaSection('en', BW_TELLS, [
        'In Black & White a personality shows in **when it spends its big tiles**. In the same spot the Attacker takes a winnable round with a big tile, while the Careful One and the Closer let it go cheaply and keep the big ones for later. The AI cannot see your numbers, so it reads your habits from **colours and results** only: if your leads keep winning, it takes you for someone who leads high and answers accordingly.',
      ], ['The personality card on the replay also shows the sum of the AI’s tiles in rounds 1–4. An even spread is about 16; more means it spent early, less means it saved.']),
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Black / white', def: 'Even tiles (0, 2, 4, 6, 8) and odd tiles (1, 3, 5, 7). Opponents see only the colour.' },
            { term: 'Leader / follower', def: 'The player who plays first and the one who answers the colour.' },
            { term: 'Throwaway', def: 'A small tile played into a round you expect to lose, to burn their big tile cheaply.' },
            { term: 'One-point win', def: 'Winning by exactly 1 — the point at the lowest cost.' },
            { term: 'Bait', def: 'A replay tag for a round lost with 1 or less that drew out their 6 or more.' },
            { term: 'Range', def: 'The numbers their tile can still be, given colours and results.' },
            { term: 'Early finish', def: 'The game ending because the gap exceeds the rounds left.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where can I play Black & White?', a: 'On the PUZZLTHINK Black & White page, in any PC or mobile browser, with no sign-up or install.' },
      { q: 'When do I learn their numbers?', a: 'During the game only colours and results are shown; every tile is revealed at the end. A draw, though, tells you at once that their number equals yours.' },
      { q: 'Why are there more black tiles?', a: 'From 0 to 8 there are five even numbers (0, 2, 4, 6, 8) and four odd ones (1, 3, 5, 7). Both the highest and the lowest tile are black.' },
      { q: 'Does the AI peek at my numbers?', a: 'No. It sees its own tiles, your colours and the results. Hard simply simulates every possibility consistent with that.' },
      { q: 'How do I play a friend?', a: 'Create a room with "Play with a friend" to get an invite link and 4-digit code. Your friend opens the link or enters the code on the start screen.' },
      { q: 'Are results recorded?', a: 'Signed in, wins, losses and draws are saved to your records.' },
    ],
    cta: { title: 'Which colour will you open with?', body: 'Turn on the deduction notes and play the AI. The replay reveals every tile afterwards.', button: 'Play Black & White' },
    disclaimer: 'Black & White is PUZZLTHINK\'s web version of a game format seen on TV and is not affiliated with the broadcaster or producers.',
  },
};

export default guide;
