// Russian Roulette guide. Rules and numbers follow src/lib/russianRoulette.ts (RR_PLAYERS 6, RR_CHAMBERS 6, two
// loaded chambers, RR_START_CREDITS 16, RR_COST 1/2/3/4 and manipulate 1–3, RR_MANIPULATE_AT 6 with the overflow
// lost and the filler learning the swapped pair, advance: one action a turn, the round start moving one seat, the
// shots once three players reach 0 credits; resolveShots: chamber c fires at seat muzzle + c; RR_INFORMED for the
// AI levels) and src/lib/russianRouletteRoom.ts (60-second turns in rooms and no clock solo, a timeout plays a
// move for you and a second one in a row hands the seat to the AI; redactRussianRoulette: credits, the pool,
// private inspections and passes stay hidden — a pass looks like a manipulation). Inline guide: RussianRouletteGuide.
// Probabilities counted over the 15 ways to load two of six chambers.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'russianRoulette',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['heavy13', 'hitStay', 'piggyBank', 'hexagon'],
  inlineNamespace: 'RussianRouletteGuide',
  ko: {
    meta: {
      title: '러시안 룰렛 공략 — 약실 확률, 총구 회전, 조작 타이밍 | PUZZLTHINK',
      description: '데블스 플랜 3 감옥 매치 러시안 룰렛 공략. 15가지 장전 경우로 계산한 약실 확률, 총구 기준 자리 세기, 공개·비공개 조사의 차이, 붙어 있는 총알과 1칸 회전의 함정, 조작 풀을 채우는 법, 실제 판 따라가기까지 정리했어요.',
      keywords: ['러시안 룰렛 공략', '데블스 플랜 러시안 룰렛', '데블스 플랜 3 감옥 매치', '러시안룰렛 규칙', '러시안 룰렛 전략', '데블스플랜 감옥', '러시안 룰렛 조작'],
    },
    title: '러시안 룰렛 공략',
    lead: '총알 두 발, 약실 여섯 칸, 크레딧 16개. 살아남는 네 명이 되는 계산법이에요.',
    intro: [
      '러시안 룰렛은 6명이 리볼버 하나를 두고 벌이는 추리 게임이에요. 여섯 약실 중 두 칸에 총알이 들어 있고, 각자 크레딧 16개로 약실을 조사하거나 총구를 돌리거나 몰래 약실을 바꿔요. 격발 때 총알을 맞은 2명이 탈락하고 4명이 살아남아요. 아무것도 하지 않으면 누구나 3분의 1 확률로 맞으니, **이 확률을 0으로 만드는 정보와 행동**을 얼마나 싸게 얻느냐가 승부예요.',
      '이 공략은 실제 규칙으로 계산한 약실 확률, 총구 기준으로 자리를 세는 법, 조사·회전·조작 각각의 득실, 한 판을 따라가는 예시, 단계별 전략과 AI·친구 방 메모를 담았어요. 실제 총기와는 아무 관련이 없는 두뇌 게임이에요.',
    ],
    gamePageTitle: '러시안 룰렛 온라인 — 데블스 플랜 감옥 매치를 웹에서',
    summary: '약실 확률 계산, 총구 기준 자리 세기, 1칸 회전의 함정, 조작 풀을 채우는 타이밍.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '러시안 룰렛은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '러시안 룰렛은 넷플릭스 「데블스 플랜: 데드 어게인」의 감옥 매치로 등장한 게임이에요. PUZZLTHINK는 6명, 약실 6개에 총알 2발, 크레딧 16개, 조사·회전·조작의 비용과 격발 방식을 그대로 옮겼어요.' },
          { type: 'p', text: '이 게임의 긴장은 "정보는 공짜가 아니다"에서 나와요. 약실을 보려면 크레딧이 들고, 싸게 보면 남들도 같이 봐요. 내가 위험하다는 걸 알아도 총구를 돌리면 다른 사람이 위험해지고, 그 사람도 다시 돌릴 수 있어요. 게다가 누군가 몰래 약실을 바꿨다면 내가 본 정보가 틀린 정보가 돼요.' },
          { type: 'p', text: '혼자서는 AI 5명과, 친구 방에서는 사람과 함께해요. 빈자리는 AI가 채워요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**준비**: 6명이 원형으로 앉아요. 여섯 약실 중 무작위 두 칸에 총알이 들어가고, 총구는 무작위 한 명을 향해요. 각자 비공개 크레딧 16개를 받아요.',
            '**차례**: 시작 플레이어부터 시계 방향으로 한 번에 행동 하나씩 해요. 한 바퀴가 돌면 다음 라운드의 시작 플레이어가 한 칸 옆으로 옮겨 가요. 모든 행동에는 크레딧이 들어서, 차례마다 반드시 1개 이상 쓰게 돼요.',
            '**격발 시점**: 크레딧을 다 쓴 사람은 남은 차례를 넘겨요. **3명이 크레딧을 모두 쓰는 순간** 곧바로 격발해요.',
            '**격발**: 첫 번째 약실은 총구가 향한 사람에게, 두 번째 약실은 그 시계 방향 옆 사람에게… 이렇게 한 칸씩 짝지어 쏴요. 총알을 맞은 2명이 탈락하고 4명이 살아남아요.',
          ] },
          { type: 'table', caption: '행동과 비용', head: ['행동', '비용', '하는 일', '다른 사람이 아는 것'], rows: [
            ['공개 조사', '1', '붙어 있는 두 약실을 열어 결과를 모두에게 보여 줘요.', '결과까지 전부'],
            ['비공개 조사', '2', '붙어 있는 두 약실을 나만 확인해요.', '내가 비공개 조사를 했다는 사실만'],
            ['총구 1칸 회전', '3', '총구를 시계 방향으로 한 사람 옮겨요.', '회전과 새 방향'],
            ['총구 2칸 회전', '4', '총구를 시계 방향으로 두 사람 옮겨요.', '회전과 새 방향'],
            ['조작', '1~3', '숨겨진 조작 풀에 크레딧을 넣어요. 풀이 6에 닿게 만든 사람이 고른 붙어 있는 두 약실의 내용이 서로 바뀌어요.', '격발 전까지 아무것도 몰라요'],
          ] },
          { type: 'h3', text: '조작 풀' },
          { type: 'p', text: '조작에 낸 크레딧은 모두 한 풀에 모여요. 누구도 풀이 얼마나 찼는지 몰라요. 내가 낸 크레딧으로 풀이 6 이상이 되면 내가 고른 두 약실이 서로 바뀌고, 풀은 0으로 돌아가요. 6을 넘긴 몫은 사라져요. 바꾼 사람은 바뀐 두 칸의 새 내용을 알게 되고, 다른 사람에게는 아무 알림도 없어요. 누가 언제 얼마를 냈는지는 격발 뒤에 공개돼요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '내가 몇 번째 약실을 맞나요?', body: '총구가 향한 사람이 첫 번째, 그 시계 방향 옆이 두 번째예요. 총구에서 시계 방향으로 세어 내가 k번째 자리라면 k번째 약실을 맞아요. 총알은 두 발뿐이라, 맞는 두 사람은 총알이 든 두 약실의 자리로 정해져요.' },
            { title: '회전하면 무엇이 바뀌나요?', body: '총구가 한 칸 옮겨 가면 모든 사람의 약실 번호가 하나씩 바뀌어요. 총알 자체는 그대로지만 총알이 향하는 사람이 시계 방향으로 한 명씩 밀려요. 회전은 시계 방향으로만 할 수 있어요.' },
            { title: '총알이 붙어 있으면?', body: '총알 두 발이 붙어 있는 약실에 들어 있으면, 1칸 회전으로는 앞쪽 총알을 피해도 뒤쪽 총알 자리에 들어가요. 두 발이 붙어 있을 확률은 15가지 장전 중 6가지, 40%예요. 이때는 2칸 회전이 필요해요.' },
            { title: '크레딧이 0인 사람을 알 수 있나요?', body: '정확히는 몰라요. 남의 크레딧은 비공개이고, 차례를 넘기는 것도 다른 사람 눈에는 조작처럼 보여요. 공개된 행동(조사 1·2, 회전 3·4)의 비용을 더하면 최소한 얼마를 썼는지는 셀 수 있어요.' },
            { title: '조작을 했는데 아무 일도 없었다면?', body: '풀이 아직 6에 닿지 않은 거예요. 내 크레딧은 풀에 남아, 다음에 누군가 6을 채우면 그 사람의 선택으로 쓰여요.' },
            { title: '조사로 본 정보는 계속 맞나요?', body: '누군가 조작으로 그 칸을 바꿨다면 틀린 정보가 돼요. 화면에는 알림이 뜨지 않아요. 오래된 정보일수록, 특히 조작이 의심되는 흐름일수록 다시 확인할 가치가 있어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 내 약실부터 확인하기',
        blocks: [
          { type: 'p', text: '두 발이 여섯 칸에 들어가는 방법은 15가지예요. 아무 정보가 없을 때 한 약실에 총알이 있을 확률은 3분의 1(약 33%)이에요. 붙어 있는 두 칸을 조사하면 결과는 아래 셋 중 하나이고, 결과에 따라 나머지 칸의 확률이 크게 달라져요.' },
          { type: 'table', caption: '붙어 있는 두 약실을 조사했을 때', head: ['조사 결과', '나올 확률', '나머지 네 칸 각각의 확률'], rows: [
            ['둘 다 빈칸', '40% (15가지 중 6)', '50% — 남은 두 발이 네 칸에 있어요'],
            ['한 칸에 총알', '53% (15가지 중 8)', '25% — 남은 한 발이 네 칸에 있어요'],
            ['둘 다 총알', '7% (15가지 중 1)', '0% — 총알을 다 찾았어요'],
          ] },
          { type: 'list', items: [
            '**첫 행동은 내 약실이 들어간 두 칸**: 총구 기준으로 내 자리를 세고, 내 약실과 그 옆 칸을 조사하세요. 내가 맞는지가 바로 갈려요.',
            '**내 칸은 비공개로**: 2크레딧이 들지만, 내가 위험하다는 사실을 남이 모르게 할 수 있어요. 위험이 드러나면 다른 사람들은 총구를 돌려 줄 이유가 없어요.',
            '**위험하면 회전, 안전하면 아끼기**: 내 칸에 총알이 있다면 회전으로 피하고, 비어 있다면 큰 행동은 하지 말고 1크레딧짜리로 차례를 넘기세요.',
            '**총알 두 발을 다 찾으면 끝까지 계산 가능**: 두 칸의 위치를 알면 지금 누가 맞을지 정확히 알아요. 이후로는 회전만 지켜보면 돼요(조작이 없다면).',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 조사 두 번과 회전 한 번',
        lead: '시계 방향으로 나 → AI1 → AI2 → AI3 → AI4 → AI5. 총구는 AI3을 향하고 있어요. 총알은 (아무도 모르지만) 2번과 4번 약실에 있어요.',
        blocks: [
          { type: 'steps', items: [
            { title: '자리 세기', body: '총구가 AI3이니 1번 약실은 AI3, 2번 AI4, 3번 AI5, 4번 나, 5번 AI1, 6번 AI2예요. 나는 4번 약실을 맞는 자리예요.' },
            { title: '1라운드, 내 차례: 4·5번 비공개 조사 (2크레딧)', body: '4번에 총알, 5번은 빈칸이에요. 나는 맞는 자리라는 걸 알았지만, 다른 사람들은 내가 무언가를 조사했다는 것만 알아요. 남은 크레딧 14.' },
            { title: 'AI1: 1·2번 공개 조사 (1크레딧)', body: '1번 빈칸, 2번 총알. 이제 모두가 AI4가 맞는다는 걸 알아요. 나는 4번까지 알고 있으니 **총알 두 발이 모두 보여요**: 2번과 4번. 3·5·6번은 빈칸이 확실해요.' },
            { title: '2라운드, 내 차례: 1칸 회전 (3크레딧)', body: '총구를 AI4로 돌리면 1번 약실은 AI4, 2번 AI5, 3번 나, 4번 AI1이 돼요. 3번은 빈칸이니 **나는 안전**해지고, 이제 AI5(2번)와 AI1(4번)이 맞는 자리예요. 남은 크레딧 11.' },
            { title: '그다음의 위험', body: '회전은 모두가 봐요. 비공개 조사 직후의 회전이라, 눈치 빠른 상대는 "방금까지 저 사람을 겨누던 약실에 총알이 있었구나"라고 읽을 수 있어요. 그리고 AI5가 다시 1칸 돌리면 나는 2번 약실에 들어가 다시 맞게 돼요. 이제부터는 회전 한 번 한 번을 내 자리로 다시 세어 봐야 해요.' },
          ] },
          { type: 'callout', tone: 'tip', title: '이 판에서 배울 점', text: '내 약실을 비공개로 본 덕분에, 공개 조사 하나만으로 총알 두 발을 모두 알았어요. 반대로 회전은 공개 행동이라 "위험했다"는 신호를 남겨요. 언제 돌릴지, 돌린 뒤 남이 다시 돌릴 크레딧이 있는지까지 따져야 해요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 회전과 크레딧의 계산',
        blocks: [
          { type: 'cards', items: [
            { tag: '회전', title: '1칸과 2칸 고르기', body: '내 약실에 총알이 있을 때, 1칸 회전하면 바로 앞 번호 약실로, 2칸 회전하면 두 칸 앞 약실로 옮겨 가요. 그 칸이 빈칸인지 알고 있다면 싼 쪽을, 모른다면 확률이 낮은 쪽을 고르세요. 총알 한 발의 위치만 알 때 모르는 칸의 확률은 남은 한 발 ÷ 모르는 칸 수예요.' },
            { tag: '회전', title: '돌리면 남도 돌릴 수 있어요', body: '회전은 3~4크레딧이라 비싸요. 내가 돌려서 새로 맞게 된 사람도 크레딧이 남아 있다면 다시 돌릴 거예요. 그 사람이 1칸 돌리면 내가 어느 약실에 들어가는지 미리 확인해 두세요.' },
            { tag: '크레딧', title: '격발 시계를 읽기', body: '격발은 3명이 0이 될 때예요. 크레딧 16개는 1크레딧 행동만 하면 16번, 회전을 섞으면 훨씬 빨리 끝나요. 다른 사람이 공개적으로 쓴 크레딧(조사 1·2, 회전 3·4)을 더해 두면 누가 곧 바닥날지 짐작할 수 있어요.' },
            { tag: '크레딧', title: '안전할 때는 빨리, 위험할 때는 천천히', body: '내가 안전하다면 크레딧을 빨리 써서 격발을 앞당기는 게 좋아요. 위험하다면 크레딧을 아껴 회전과 조작으로 판을 바꿀 시간을 버세요. 다만 내가 0이 돼도 다른 두 명이 0이 되기 전까지는 격발하지 않아요.' },
          ] },
          { type: 'p', text: '공개 조사는 1크레딧으로 가장 싸지만, 결과가 모두에게 돌아가요. 남이 위험해지는 정보(그 사람이 회전에 크레딧을 쓰게 만드는 정보)는 공개로, 내가 위험해지는 정보는 비공개로 보는 것이 기본이에요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 조작 풀과 낡은 정보',
        blocks: [
          { type: 'h3', text: '풀을 채우는 사람만 고를 수 있어요' },
          { type: 'p', text: '조작은 풀을 6으로 만든 사람의 선택만 반영돼요. 앞에서 1~2개씩 넣은 사람은 남의 조작 비용을 대 준 셈이에요. 풀은 아무도 볼 수 없지만, 다른 사람의 "조작" 표시가 몇 번 나왔는지는 보여요(단, 크레딧이 바닥나 차례를 넘긴 것도 같은 표시로 보여요). 조작 표시가 여러 번 쌓였다면 풀이 꽤 찼을 수 있으니, 그때 3크레딧을 넣어 채우는 쪽을 노려 보세요.' },
          { type: 'h3', text: '조작으로 바꿀 두 칸 고르기' },
          { type: 'p', text: '조작은 붙어 있는 두 칸의 내용을 맞바꿔요. 내 약실에 총알이 있고 옆 칸이 빈칸이라면 둘을 바꿔서 피할 수 있어요. 회전과 달리 아무도 모르게 일어나고, 다른 사람들은 예전 조사 결과를 믿은 채 움직여요. 채우는 데 성공하면 나는 바뀐 두 칸의 새 내용을 알게 돼요.' },
          { type: 'h3', text: '낡은 정보를 의심하기' },
          { type: 'p', text: '조작 표시가 여러 번 나온 뒤라면, 처음에 본 약실이 지금도 같다는 보장이 없어요. 격발이 가까워졌을 때 내 약실을 다시 조사하는 2크레딧은 생명 보험이에요. 반대로 내가 조작에 성공했다면, 다른 사람들이 낡은 공개 정보를 믿게 두는 것 자체가 무기예요.' },
          { type: 'h3', text: '공개 정보로 남을 움직이기' },
          { type: 'p', text: '어떤 사람이 위험하다는 걸 공개 조사로 드러내면, 그 사람은 회전이나 조작에 크레딧을 써요. 그 회전이 나에게 유리한지(돌리면 내가 안전한 칸에 들어가는지)를 먼저 계산하고 공개 조사를 고르면, 1크레딧으로 남의 3~4크레딧을 내 편으로 쓸 수 있어요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**내 칸을 공개로 조사하기**: 내 칸에 총알이 있다는 게 드러나면 아무도 총구를 돌려 주지 않아요.',
            '**붙은 총알을 1칸 회전으로 피하려 하기**: 총알 두 발이 붙어 있으면 1칸 회전은 다른 총알 자리로 옮겨 갈 뿐이에요. 옆 칸을 먼저 확인하세요.',
            '**회전한 뒤 다시 세지 않기**: 누군가 돌릴 때마다 모든 사람의 약실이 바뀌어요. 회전 표시가 뜨면 내 자리를 다시 세세요.',
            '**조작에 조금씩 넣기**: 풀을 채우지 못한 크레딧은 남의 조작 비용이 돼요.',
            '**처음 본 정보를 끝까지 믿기**: 조작은 알림이 없어요. 조작 표시가 많았다면 다시 확인하세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구 방, 복기',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대전', '나와 AI 5명이 함께해요. AI는 내 비공개 정보나 남의 크레딧을 보지 않고, 자기가 본 것만으로 판단해요. 혼자 할 때는 시간 제한이 없어요.'],
            ['쉬움', '자기 약실이 위험한지 따지지 않고 습관대로 조사·회전·조작을 섞어요.'],
            ['보통', '절반은 자기 약실의 위험을 따져서 둬요. 안 본 칸이면 조사하고, 총알이 있으면 가장 안전한 쪽으로 회전하거나 조작해요.'],
            ['어려움', '열 번 중 아홉 번은 그렇게 따져서 둬요. 자기 칸이 안전하면 크레딧을 아끼고, 위험하면 비싸더라도 피해요.'],
            ['친구 방', '링크나 4자리 코드로 초대하고 빈자리는 AI가 채워요. 한 턴에 60초예요. 시간이 지나면 자동으로 행동이 하나 두어지고, 두 번 연속이면 AI가 그 자리를 이어받아요. 돌아와서 복귀하면 다시 내가 해요.'],
            ['격발 뒤 공개', '격발이 끝나면 총알 위치, 누가 언제 조작에 얼마를 넣었는지, 어떤 두 칸이 바뀌었는지까지 모두 공개돼요. 복기로 한 수씩 다시 볼 수 있어요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '약실', def: '총알이 들어갈 수 있는 여섯 칸. 그중 두 칸에 총알이 있어요.' },
            { term: '총구', def: '첫 번째 약실을 맞는 사람. 시계 방향으로만 돌릴 수 있어요.' },
            { term: '크레딧', def: '행동에 쓰는 비공개 자원. 각자 16개, 3명이 바닥나면 격발해요.' },
            { term: '공개 조사', def: '1크레딧. 붙어 있는 두 약실을 모두에게 보여 줘요.' },
            { term: '비공개 조사', def: '2크레딧. 붙어 있는 두 약실을 나만 봐요.' },
            { term: '조작 풀', def: '모두가 몰래 크레딧을 넣는 곳. 6에 닿게 만든 사람이 두 약실을 바꿔요.' },
            { term: '격발', def: '총구가 향한 사람부터 한 칸씩 약실을 짝지어 쏘는 단계. 2명이 탈락해요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '러시안 룰렛은 어디서 할 수 있나요?', a: 'PUZZLTHINK 러시안 룰렛 페이지에서 가입이나 설치 없이 PC와 모바일 브라우저로 바로 할 수 있어요.' },
      { q: '아무것도 안 하면 맞을 확률은요?', a: '여섯 약실 중 두 칸에 총알이 있으니 누구나 3분의 1이에요. 조사로 내 약실을 확인하면 0이나 1로 정해져요.' },
      { q: '격발은 언제 하나요?', a: '3명이 크레딧을 모두 쓰는 순간이에요. 남은 사람이 크레딧을 얼마나 갖고 있든 바로 격발해요.' },
      { q: '조작하면 다른 사람이 알 수 있나요?', a: '누가 조작에 크레딧을 넣었다는 표시만 보이고, 금액과 바뀐 칸은 격발 뒤에 공개돼요. 약실이 바뀌어도 알림은 없어요.' },
      { q: '혼자서도 할 수 있나요?', a: '네. 나와 AI 5명이 함께하고, AI 난이도를 쉬움·보통·어려움 중에 고를 수 있어요.' },
      { q: '친구와 하려면 어떻게 하나요?', a: '친구 방을 만들고 링크나 4자리 초대코드를 보내면 돼요. 빈자리는 AI가 채우고, 한 턴에 60초가 주어져요.' },
    ],
    cta: { title: '먼저 내 약실부터 확인해 볼까요?', body: '총구 기준으로 자리를 세고, AI 5명과 한 판 해 보세요. 격발 뒤에는 모든 조작이 공개돼요.', button: '러시안 룰렛 하러 가기' },
    disclaimer: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요. 이 게임은 실제 총기 사용과 아무 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Russian Roulette strategy guide — chamber odds, turning the muzzle, timing a swap | PUZZLTHINK',
      description: "Russian Roulette from The Devil's Plan: Dead Again prison match, in depth: chamber odds over the 15 ways to load two bullets, counting seats from the muzzle, public versus private checks, the trap of a one-step turn with adjacent bullets, filling the swap pool, and a game played out.",
      keywords: ['Russian Roulette strategy', "Devil's Plan Russian Roulette", "Devil's Plan prison match", 'Russian Roulette game rules', 'Russian Roulette deduction game'],
    },
    title: 'Russian Roulette strategy guide',
    lead: 'Two bullets, six chambers, sixteen credits — how to be one of the four who survive.',
    intro: [
      "Russian Roulette is a six-player deduction game around a single revolver. Two of its six chambers are loaded, and with 16 credits each, players inspect chambers, turn the muzzle or secretly swap chambers. When it fires, the two players hit are out and four survive. Do nothing and everyone has a one-in-three chance of being hit, so the game is about how cheaply you can buy **the information and actions that bring that chance to zero**.",
      'This guide covers chamber odds computed from the real rules, counting seats from the muzzle, the trade-offs of inspecting, turning and swapping, one game followed step by step, strategy by level and notes on the AI and rooms. It has nothing to do with real firearms.',
    ],
    gamePageTitle: "Russian Roulette online — The Devil's Plan prison match on the web",
    summary: 'Chamber odds, counting seats from the muzzle, the one-step-turn trap, timing the swap pool.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Russian Roulette?',
        blocks: [
          { type: 'p', text: "Russian Roulette appeared as a prison match on Netflix's The Devil's Plan: Dead Again. PUZZLTHINK keeps six players, six chambers with two bullets, 16 credits each, and the same costs for inspecting, turning and swapping, and the same way of firing." },
          { type: 'p', text: 'The tension comes from information never being free. Looking costs credits, and looking cheaply lets everyone look. Knowing you are in danger and turning the muzzle puts someone else in danger, and they can turn it again. And if someone secretly swapped chambers, what you saw may no longer be true.' },
          { type: 'p', text: 'Play alone with five AIs, or with people in a friend room where AIs fill the empty seats.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Setup**: six players sit in a circle. Two random chambers of six are loaded and the muzzle points at a random player. Everyone gets 16 private credits.',
            '**Turns**: from the starting player, clockwise, one action per turn. After a full pass, the next round starts one seat further along. Every action costs credits, so each turn spends at least one.',
            '**When it fires**: a player with no credits passes. **The moment three players have spent all their credits**, the gun fires.',
            '**Firing**: the first chamber fires at the player the muzzle points at, the second at the next player clockwise, and so on. The two players hit are out; four survive.',
          ] },
          { type: 'table', caption: 'Actions and costs', head: ['Action', 'Cost', 'What it does', 'What others learn'], rows: [
            ['Public inspect', '1', 'Opens two adjacent chambers for everyone to see.', 'Everything'],
            ['Private inspect', '2', 'Shows two adjacent chambers to you alone.', 'Only that you inspected'],
            ['Turn 1', '3', 'Moves the muzzle one player clockwise.', 'The turn and the new direction'],
            ['Turn 2', '4', 'Moves the muzzle two players clockwise.', 'The turn and the new direction'],
            ['Swap', '1–3', 'Pays into the hidden swap pool. Whoever brings it to 6 swaps the contents of two adjacent chambers of their choice.', 'Nothing until the shots'],
          ] },
          { type: 'h3', text: 'The swap pool' },
          { type: 'p', text: 'Every credit paid into swaps goes into one pool and nobody can see how full it is. If your payment brings it to 6 or more, the two chambers you chose swap contents and the pool resets to 0; anything above 6 is lost. The swapper learns the new contents of the two chambers, and nobody else gets any notice. Who paid what, and when, is revealed after the shots.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rulings',
        blocks: [
          { type: 'cards', items: [
            { title: 'Which chamber is mine?', body: 'The muzzle\'s player gets the first chamber, the next clockwise the second. Counting clockwise from the muzzle, if you are k-th you get chamber k. With only two bullets, the two players hit are fixed by the two loaded chambers.' },
            { title: 'What does a turn change?', body: 'Moving the muzzle one player renumbers everyone\'s chamber. The bullets stay put, but the players they point at shift one seat clockwise. Turns go clockwise only.' },
            { title: 'Adjacent bullets?', body: 'If the two bullets sit in adjacent chambers, a one-step turn moves you off one bullet straight onto the other. That happens in 6 of the 15 loadings, 40%. You need a two-step turn.' },
            { title: 'Can I tell who is at 0 credits?', body: 'Not exactly. Credits are private, and passing looks like a swap payment to everyone else. Adding up the public costs (inspects 1 and 2, turns 3 and 4) tells you the least each player has spent.' },
            { title: 'I paid into a swap and nothing happened?', body: 'The pool has not reached 6 yet. Your credits stay in it and will serve whoever fills it next.' },
            { title: 'Does inspected information stay true?', body: 'Not if someone swapped those chambers, and there is no notice when it happens. The older the information — especially after signs of swapping — the more a recheck is worth.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — check your own chamber first',
        blocks: [
          { type: 'p', text: 'Two bullets can sit in six chambers in 15 ways. With no information, any chamber is loaded one time in three (about 33%). Inspecting two adjacent chambers gives one of three results, and each changes the odds of the other four a lot.' },
          { type: 'table', caption: 'Inspecting two adjacent chambers', head: ['Result', 'How often', 'Each of the other four'], rows: [
            ['Both empty', '40% (6 of 15)', '50% — two bullets in four chambers'],
            ['One loaded', '53% (8 of 15)', '25% — one bullet in four chambers'],
            ['Both loaded', '7% (1 of 15)', '0% — both bullets found'],
          ] },
          { type: 'list', items: [
            '**First action: the pair that includes your chamber.** Count your seat from the muzzle and inspect your chamber with a neighbour; you learn at once whether you are hit.',
            '**Inspect your own chamber privately.** It costs 2, but nobody learns you are in danger. Once that is public, nobody has a reason to turn the muzzle away from you.',
            '**In danger, turn; safe, save.** If your chamber is loaded, turn away; if it is empty, avoid big actions and pass turns with 1-credit moves.',
            '**Both bullets found means full control.** Knowing both positions tells you exactly who is hit now; from then on, only the turns matter (barring swaps).',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — two inspections and a turn',
        lead: 'Clockwise: you → AI1 → AI2 → AI3 → AI4 → AI5. The muzzle points at AI3. The bullets (unknown to anyone) are in chambers 2 and 4.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Count the seats', body: 'The muzzle is on AI3, so chamber 1 is AI3, 2 AI4, 3 AI5, 4 you, 5 AI1, 6 AI2. You take chamber 4.' },
            { title: 'Round 1, your turn: private inspect of 4–5 (2 credits)', body: 'Chamber 4 is loaded, 5 empty. You know you are hit; the others only know you inspected something. 14 credits left.' },
            { title: 'AI1: public inspect of 1–2 (1 credit)', body: 'Chamber 1 empty, 2 loaded: everyone now knows AI4 is hit. Knowing chamber 4 too, **you can see both bullets**: 2 and 4. Chambers 3, 5 and 6 are certainly empty.' },
            { title: 'Round 2, your turn: turn 1 (3 credits)', body: 'With the muzzle on AI4, chamber 1 is AI4, 2 AI5, 3 you, 4 AI1. Chamber 3 is empty: **you are safe**, and AI5 (chamber 2) and AI1 (chamber 4) are now the ones hit. 11 credits left.' },
            { title: 'The danger after', body: 'Everyone saw the turn. Coming right after your private inspect, a sharp opponent can read "the chamber that pointed at that player was loaded". And if AI5 turns one step again, you land on chamber 2 and are hit again. From now on, recount your seat after every turn.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'What this game shows', text: 'Your private look at your own chamber meant a single public inspection revealed both bullets. A turn, though, is public and signals that you were in danger. Decide when to turn, and whether the player you endanger still has credits to turn it back.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — the maths of turns and credits',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Turns', title: 'One step or two', body: 'With a loaded chamber, turning one step moves you to the chamber numbered one lower, two steps two lower. If you know which is empty, take the cheaper; if not, the less likely. Knowing one bullet, each unknown chamber holds the other with "1 ÷ unknown chambers".' },
            { tag: 'Turns', title: 'Others can turn too', body: 'Turns cost 3–4. Whoever you just put in danger will turn again if they have credits. Check in advance which chamber you land on if they turn one step.' },
            { tag: 'Credits', title: 'Read the clock', body: 'The gun fires when three players reach 0. Sixteen credits last 16 turns of 1-credit actions and far fewer with turns. Adding up each player\'s public spending (inspects 1–2, turns 3–4) shows who is close to empty.' },
            { tag: 'Credits', title: 'Safe: spend fast. In danger: slow down', body: 'When you are safe, spending quickly brings the shots closer. When you are in danger, save credits to buy time for turns and swaps. Your own 0 does not fire the gun until two others are at 0 as well.' },
          ] },
          { type: 'p', text: 'A public inspect is the cheapest move but hands the result to everyone. Look publicly at information that puts others in danger (and makes them spend on turns); look privately at information that concerns your own chamber.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — the swap pool and stale information',
        blocks: [
          { type: 'h3', text: 'Only the filler chooses' },
          { type: 'p', text: 'A swap follows the choice of whoever brought the pool to 6. Players who paid 1 or 2 before them only funded someone else\'s swap. The pool is invisible, but how many "swap" marks have appeared is not (though a player out of credits passing shows the same mark). After several marks the pool may be nearly full: that is the moment to put in 3 and be the one who fills it.' },
          { type: 'h3', text: 'Choosing the pair to swap' },
          { type: 'p', text: 'A swap exchanges the contents of two adjacent chambers. If your chamber is loaded and its neighbour empty, swapping them saves you — and unlike a turn, nobody sees it, so everyone keeps acting on old inspections. If you fill the pool, you learn the new contents of both chambers.' },
          { type: 'h3', text: 'Distrust old information' },
          { type: 'p', text: 'After several swap marks there is no guarantee your early inspection still holds. Close to the shots, 2 credits to recheck your own chamber are life insurance. Conversely, after a successful swap of your own, letting others trust stale public information is the weapon.' },
          { type: 'h3', text: 'Move others with public information' },
          { type: 'p', text: 'Expose a player\'s danger with a public inspect and they will spend on a turn or swap. Work out first whether their turn helps you (does it put you on an empty chamber?), and a 1-credit inspect makes their 3–4 credits work for you.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Inspecting your own chamber publicly**: once everyone knows you are loaded, nobody turns the muzzle for you.',
            '**Escaping adjacent bullets with one step**: it just moves you onto the other bullet. Check the neighbour first.',
            '**Not recounting after a turn**: every turn renumbers everyone. Recount whenever one appears.',
            '**Paying into swaps in small amounts**: credits that do not fill the pool pay for someone else\'s swap.',
            '**Trusting first information forever**: swaps come with no notice. After many swap marks, check again.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend rooms, the reveal',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['Against the AI', 'You and five AIs. They never see your private information or anyone\'s credits and act only on what they have seen. Solo play has no clock.'],
            ['Easy', 'Mixes inspects, turns and swaps by habit without checking whether its own chamber is in danger.'],
            ['Normal', 'Half the time weighs its own chamber: inspects it if unseen, turns to the safest side or swaps if it is loaded.'],
            ['Hard', 'Plays that way nine times in ten: saves credits when safe, pays to escape when in danger.'],
            ['Friend rooms', 'Invite by link or 4-digit code; AIs fill empty seats. Turns last 60 seconds. A timeout plays a move for you, and two in a row hand your seat to the AI until you rejoin.'],
            ['After the shots', 'Everything is revealed: the bullets, who paid into swaps when and how much, and which chambers were swapped. The replay steps through every action.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Chamber', def: 'One of six slots; two hold bullets.' },
            { term: 'Muzzle', def: 'Points at the player who takes the first chamber; turns clockwise only.' },
            { term: 'Credits', def: 'Private currency for actions; 16 each, and the gun fires when three players run out.' },
            { term: 'Public inspect', def: '1 credit: two adjacent chambers shown to everyone.' },
            { term: 'Private inspect', def: '2 credits: two adjacent chambers shown to you alone.' },
            { term: 'Swap pool', def: 'Hidden pot everyone can pay into; whoever brings it to 6 swaps two chambers.' },
            { term: 'Firing', def: 'Chambers matched to players one by one from the muzzle; two players are hit.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where can I play Russian Roulette?', a: 'On the PUZZLTHINK Russian Roulette page, in any PC or mobile browser, with no sign-up or install.' },
      { q: 'What are my odds if I do nothing?', a: 'Two of six chambers are loaded, so one in three for everyone. Inspecting your own chamber turns that into 0 or 1.' },
      { q: 'When does the gun fire?', a: 'The moment three players have spent all their credits, however many the others still have.' },
      { q: 'Can others tell I swapped?', a: 'They see only a mark that someone paid into swaps; amounts and swapped chambers are revealed after the shots. A swap gives no notice when it happens.' },
      { q: 'Can I play alone?', a: 'Yes: you and five AIs, at Easy, Normal or Hard.' },
      { q: 'How do I play with friends?', a: 'Create a friend room and send the link or 4-digit code. AIs fill the empty seats and each turn lasts 60 seconds.' },
    ],
    cta: { title: 'Start by checking your own chamber', body: 'Count your seat from the muzzle and play a table with five AIs. Every swap is revealed after the shots.', button: 'Play Russian Roulette' },
    disclaimer: "PUZZLTHINK is an unofficial fan project, not affiliated with The Devil's Plan or Netflix. The programme name is used only to describe the game. It has nothing to do with real firearms.",
  },
};

export default guide;
