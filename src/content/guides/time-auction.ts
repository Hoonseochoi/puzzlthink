// 시간 경매 guide. Rules and numbers follow src/lib/timeAuction.ts (TA_FORMATS 2:00×9 / 5:00×13 / 10:00×19,
// TA_COUNTDOWN_MS 5000, TA_UNIT 0.1 s truncation, taRelease's cap at the time left and 0.0 s = gave up, taJudge's
// top-bid tie = void and no bids = no token, taStandings' tokens → time left → shared place, taSafeTokens) and
// src/lib/timeAuctionRoom.ts (TA_READY_SEC 15 and two misses → AI, the pass shortcut, heartbeats and TA_LAG_MAX,
// leaving the tab = letting go), src/lib/timeAuctionAi.ts (five styles, two levels, public information only).
// Broadcast facts: 나무위키 「데블스 플랜: 데스룸/2일차」 §5 rule card and round table, checked 2026-11-26.
// Quick-format price figures: scripts/time-auction/sim.ts (3,000 AI matches, 2026-11-26).
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'timeAuction',
  origin: { kind: 'show', show: 'dp2' },
  updated: '2026-11-26',
  related: ['hitStay', 'pointOmok', 'blackWhite2', 'piggyBank'],
  ko: {
    meta: {
      title: '시간 경매 공략 — 데블스플랜2 감옥매치 규칙, 안전선 계산, 낙찰가 읽기 | PUZZLTHINK',
      description: '데블스 플랜: 데스룸(데블스플랜2) 감옥매치 시간 경매 공략. 올페이 경매의 원리, 몇 개를 따야 살아남는지, 낙찰 시간으로 상대의 남은 시간 한도를 세는 법, 방송 기록으로 본 실제 흐름까지 정리했어요.',
      keywords: ['시간 경매 공략', '시간경매 공략', '데블스플랜2 시간 경매', '데블스 플랜 데스룸 시간 경매', '시간 경매 규칙', '시간 경매 전략', '데블스플랜 감옥매치'],
    },
    title: '시간 경매 공략',
    lead: '돈이 아니라 시간으로 사는 경매. 이기는 것보다 덜 잃는 것이 먼저예요.',
    intro: [
      '시간 경매는 모두 같은 시간을 자금으로 받아, 경매마다 버튼을 가장 오래 누르고 버틴 사람이 승리 표식을 가져가는 게임이에요. 진 사람도 버틴 시간을 돌려받지 못하고, 자기 남은 시간조차 화면에 나오지 않기 때문에 **언제 싸우고 언제 빠질지**와 **내가 얼마를 썼는지 기억하는 것**이 승부를 가릅니다.',
      '이 공략은 게임 화면 아래의 짧은 규칙보다 깊이 들어가요. 헷갈리기 쉬운 판정(0.1초 동점, 시간이 바닥났을 때, 아무도 입찰하지 않을 때), 몇 개를 따야 안전한지 계산하는 법, 낙찰 시간으로 상대의 남은 시간을 세는 법, 방송 기록으로 따라가 보는 실제 흐름, AI 성향과 친구 방의 시간 재기까지 담았어요.',
    ],
    gamePageTitle: '시간 경매 온라인 — 데블스플랜2 데스룸 감옥매치를 웹에서',
    summary: '올페이 경매의 원리, 안전선 계산, 낙찰 시간으로 남은 시간 세기, 방송 기록으로 본 흐름.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '시간 경매는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '시간 경매는 넷플릭스 「데블스 플랜: 데스룸」(데블스 플랜 2) 둘째 날 밤의 감옥매치로 나온 게임이에요. 감옥동 6명이 각자 10분을 받아 19번의 경매를 치렀고, 표식을 가장 적게 받은 1명이 탈락했어요. 방송에서는 표식 1개에 그친 참가자가 탈락했고, 5개를 모은 참가자가 피스를 받았어요.' },
          { type: 'p', text: '경매 이론으로 보면 **올페이 경매**(all-pay auction)예요. 보통 경매는 낙찰자만 돈을 내지만, 여기서는 입찰한 모두가 자기가 버틴 만큼을 냅니다. 그래서 두 사람이 끝까지 버티는 경매는 둘 다 크게 잃고 한 명만 표식을 얻는, 이른바 치킨 게임이 돼요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 AI 5명과 6인전을 하거나, 친구 방·공개방에서 2~6명이 겨룰 수 있어요. 규칙은 방송 그대로이고, 한 판이 너무 길지 않도록 **빠른 경매(2분 × 9경매, 기본)**, **표준(5분 × 13경매)**, **방송 규칙(10분 × 19경매)** 중에서 고를 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '기본 규칙',
        blocks: [
          { type: 'list', ordered: true, items: [
            '모두 같은 시간을 경매 자금으로 받아요. 시간은 **0.1초 단위**로만 기록해요(그 아래는 버려요: 12.38초를 눌렀다면 12.3초).',
            '경매마다 모두 버튼을 누르고 기다리면 **5초 카운트다운**이 시작돼요.',
            '카운트다운 안에 손을 떼면 이번 경매를 **포기**해요. 시간이 전혀 들지 않아요.',
            '카운트다운이 끝나면 버튼을 누르고 있는 사람의 시간이 줄기 시작해요. 원하는 만큼 썼다면 손을 떼요.',
            '전광판에는 이번 경매에서 흐른 시간만 보여요. 누가 누르고 있는지, 누가 포기했는지는 보이지 않아요.',
            '마지막까지 누르고 있던 사람이 손을 떼면 전광판이 멈추고, 그 사람이 **승리 표식**을 받아요. 낙찰자와 멈춘 시간만 공개돼요.',
            '진 사람도 자기가 누른 시간만큼 잃어요.',
            '남은 시간은 **본인에게도** 보이지 않아요. 쓴 시간을 기억해야 해요.',
            '**바둑알 점수(사이트 추가 규칙)**: 경매에는 PUZZLTHINK 프로필 아이콘 모양의 바둑알이 올라와요. 기본 바둑알(기본 컬러, 플레이 10·20시간, 2048)은 1점, 세 번째 경매마다 나오는 중급 아이콘(플레이 30·50시간, 친구·오픈 대전 승리, 시간 경매 어려움 클리어 등)은 2점, 마지막 경매의 최상급 아이콘(오픈대전 1위, 플레이 100시간, 피스 2W 1위, 시간 경매 1위 등)은 3점이에요. 어떤 경매에 어떤 바둑알이 나오는지는 처음부터 화면 위에 보여요. 경매에 나오는 바둑알은 게임 속 점수예요. 실제 아이콘은 지급되지 않아요.',
            '**마이너스 바둑알(사이트 추가 규칙)**: 헬모드 바둑알 모양이에요. 두 명 이상 입찰한 경매에서는 가장 먼저 손을 뗀 1명이 −1점을 받아요. 카운트다운 안에 포기한 사람은 받지 않아요.',
            '마지막 경매가 끝나면 점수(딴 바둑알 점수의 합 − 마이너스 바둑알 수)가 가장 높은 사람이 1위(방송에서는 표식 수로 피스), 가장 낮은 사람이 탈락이에요.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리기 쉬운 판정',
        blocks: [
          { type: 'cards', columns: 2, items: [
            { title: '0.1초까지 같으면 유찰', body: '가장 오래 버틴 사람이 둘 이상이고 0.1초까지 같은 시간이면 그 경매의 표식은 아무도 받지 못해요. 동점이 된 사람들도 시간은 그대로 잃어요. 2등끼리 같은 시간인 것은 아무 상관이 없어요.' },
            { title: '시간이 바닥나면 버튼이 밀려나요', body: '누르고 있다가 남은 시간을 다 쓰면 그 순간 버튼이 저절로 밀려나요. 그래서 가진 시간보다 많이 입찰할 수는 없어요. 이때만은 휴대폰이 진동해서 시간이 다 됐다는 걸 알 수 있어요. 남은 시간이 0이면 그 뒤 경매에는 참여할 수 없어요.' },
            { title: '아무도 입찰하지 않으면', body: '모두 카운트다운 안에 손을 떼면 그 경매의 표식은 사라져요. 방송 규칙에는 없는 경우라 이 사이트에서 정한 처리예요.' },
            { title: '0.0초는 입찰이 아니에요', body: '카운트다운이 끝나고 0.1초가 지나기 전에 손을 떼면 기록되는 시간이 0.0초라, 시간이 들지 않는 포기로 처리해요. 가장 짧은 입찰은 0.1초예요.' },
            { title: '동점이면 남은 시간으로', body: '표식 수가 같으면 남은 시간이 많은 쪽이 위예요. 그래서 1위 다툼에서는 시간을 남기는 것이, 꼴찌 다툼에서는 시간을 다 써서라도 표식을 따는 것이 중요해요. 표식도 시간도 같으면 같은 순위이고, 그게 꼴찌라면 모두 탈락해요.' },
            { title: '마이너스 바둑알은 누구에게', body: '카운트다운이 끝난 뒤까지 누르고 있던 사람이 두 명 이상일 때, 그중 가장 먼저 손을 뗀 1명이 받아요. 0.1초까지 같은 시간에 뗀 사람이 둘 이상이면 아무도 받지 않고, 혼자 입찰했다면 낙찰만 받아요. 1등이 동점으로 유찰돼도 마이너스는 따로 정해져요.' },
            { title: '이번엔 포기 버튼', body: '준비 단계에서 "이번 경매는 포기"를 누르면 버튼을 눌렀다가 카운트다운 안에 뗀 것과 똑같아요. 다른 사람에게는 누가 포기했는지 보이지 않아요.' },
          ] },
        ],
      },
      {
        id: 'safety-line',
        onGamePage: true,
        level: 'beginner',
        title: '입문: 몇 개를 따야 살아남나요',
        blocks: [
          { type: 'p', text: '탈락은 표식이 가장 적은 1명뿐이에요. 그러니 목표는 모든 경매를 이기는 것이 아니라 **꼴찌만 피하는 것**이에요. 몇 개면 절대 꼴찌가 아닌지는 간단히 계산돼요. 내가 k개를 가졌을 때 나머지 사람이 모두 k개 이상이 되려면 남은 표식이 (인원 − 1) × k개 이상 있어야 하니까, **경매 수 ÷ 인원보다 많이** 따면 안전해요.' },
          { type: 'table', head: ['형식', '인원', '경매 수', '확실한 안전선'], rows: [
            ['빠른 경매 (2분)', '6명', '9', '2개'],
            ['표준 (5분)', '6명', '13', '3개'],
            ['방송 규칙 (10분)', '6명', '19', '4개'],
          ], caption: '안전선 = 경매 수 ÷ 인원의 몫 + 1. 표식 화면에도 같은 숫자가 나와요.' },
          { type: 'callout', tone: 'warn', title: '마이너스 바둑알이 있으면 보장이 아니에요', text: '위의 안전선은 바둑알만 셀 때의 계산이에요. 이 사이트는 가장 먼저 손을 뗀 사람에게 −1을 주기 때문에, 바둑알을 안전선만큼 따도 마이너스를 여러 개 받으면 꼴찌가 될 수 있어요. 목표는 **점수(바둑알 − 마이너스)** 로 세세요.' },
          { type: 'p', text: '안전선보다 하나 적어도 대부분 살아남아요. 방송 형식에서 3개로 탈락하려면 나머지 다섯 명이 4·3·3·3·3처럼 모두 3개 이상이고 내 시간이 가장 적어야 하거든요. 그래서 입문 전략은 **필요한 개수만큼만, 싸게 이길 수 있는 경매를 고르는 것**이에요.' },
          { type: 'callout', tone: 'tip', title: '한 개당 예산을 정해 두세요', text: '빠른 경매에서 2개가 목표라면 1개당 쓸 수 있는 시간은 대략 1분이에요. 이 예산을 넘는 싸움이 붙은 것 같으면 미련 없이 빠지는 것이 낫습니다. 이미 누른 시간은 손을 떼든 계속 누르든 돌아오지 않으니, "지금까지 쓴 게 아까워서" 버티는 것이 가장 흔한 실수예요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '방송 기록으로 따라가 보기',
        blocks: [
          { type: 'p', text: '방송의 첫 경매에서는 두 사람이 입찰했어요. 한 명은 1분 23.4초에 손을 뗐고, 다른 한 명은 1분 49.8초까지 버텨 표식을 가져갔어요. 전광판은 1분 49.8초에 멈췄고, 진 쪽은 표식 없이 1분 23.4초를 잃었어요. 첫 경매부터 두 사람이 합쳐 3분 13초, 6명 전체 자금(60분)의 5% 넘게 한 번에 사라진 셈이에요.' },
          { type: 'steps', items: [
            { title: '초반: 비싼 경매가 이어져요', body: '방송의 첫 여섯 경매 낙찰가는 1분 26.6초에서 3분 1.3초 사이였어요. 10분 중 2분을 쓰면 남은 18번의 경매를 8분으로 치러야 하니, 초반에 두 번 크게 지면 그 사람은 사실상 후반에 싸울 힘이 없어져요.' },
            { title: '중반: 싸게 따는 경매', body: '다른 사람들이 지친 틈에 58초처럼 초반보다 훨씬 싼 낙찰이 나왔어요. 누가 빠졌는지 보이지 않으니, 앞선 경매에서 큰 시간이 나간 직후가 들어가기 좋은 때예요.' },
            { title: '후반: 아껴 둔 사람이 가져가요', body: '초반을 거의 쉬며 시간을 아낀 참가자가 마지막 다섯 경매에서 2분 21.9초, 2분 23.4초, 4분 9.9초를 쓰며 세 번을 이겼어요. 마지막 경매의 4분 9.9초는 다른 누구도 그만큼 남아 있지 않을 거라는 계산이 깔린 입찰이에요.' },
            { title: '결과', body: '표식 5·4·3·3·3·1. 표식 1개에 그친 참가자가 탈락했고, 5개를 딴 참가자는 시간을 0.0초까지 다 쓰고도 1위였어요. 시간을 남기는 것보다 필요한 경매를 따는 것이 먼저라는 걸 보여 준 판이에요.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급: 낙찰 시간으로 남은 시간 세기',
        blocks: [
          { type: 'p', text: '상대의 남은 시간은 보이지 않지만, **최대 얼마까지 남았는지**는 셀 수 있어요. 낙찰자와 낙찰 시간은 매번 공개되니까, 처음 시간에서 그 사람이 이긴 경매의 낙찰 시간을 모두 빼면 그 사람이 가질 수 있는 시간의 상한이 나와요. 진 경매에서 쓴 시간은 모르니 실제로는 그보다 적어요.' },
          { type: 'table', head: ['', 'A', 'B', 'C'], rows: [
            ['처음', '2:00.0', '2:00.0', '2:00.0'],
            ['이긴 경매', '0:41.3, 0:38.0', '0:52.1', '—'],
            ['남은 시간 상한', '0:40.7', '1:07.9', '2:00.0'],
          ], caption: '빠른 경매 예시. 표식이 많은 A는 시간 상한이 가장 낮아요.' },
          { type: 'p', text: '내 시간이 다른 모든 사람의 상한보다 많다면, 상한 + 0.1초를 입찰하면 그 경매는 **반드시** 이겨요. 경기 후반에 표식이 부족할 때 이 계산이 탈출구가 돼요. 반대로 한 번도 이기지 않은 사람(위의 C)은 상한이 처음 시간 그대로라 위협적이에요. 아무 표식도 없는 사람이 후반까지 시간을 아끼고 있다면 큰 입찰이 올 거라고 생각하세요.' },
          { type: 'callout', tone: 'note', title: '전체 시간은 정해져 있어요', text: '6명이 2분씩이면 판 전체의 시간은 12분이에요. 지금까지 공개된 낙찰 시간의 합을 빼면 "모두가 남겼을 수 있는 시간"의 최대치가 나오고, 남은 경매 수로 나누면 평균적으로 한 경매에 얼마까지 몰릴 수 있는지 감이 와요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급: 경매를 고르는 눈',
        blocks: [
          { type: 'cards', items: [
            { title: '2점과 3점은 값을 따로 매기세요', body: '중급 아이콘 하나는 기본 바둑알 두 개, 마지막 최상급 아이콘은 세 개와 같아요. AI끼리 3,000판을 돌려 보면 2점짜리는 1점짜리의 약 두 배 값에 낙찰됐는데, 3점짜리는 다들 시간이 바닥난 마지막이라 2점짜리보다 비싸지 않았어요. 끝까지 시간을 남겨 둔 사람에게 마지막 최상급 아이콘은 가장 싼 3점이 될 수 있어요.' },
            { title: '비싼 경매 다음 경매', body: '누군가 큰 시간으로 낙찰받았다면 그 경매에서 진 사람도 크게 잃었을 가능성이 높아요. 바로 다음 경매는 다들 몸을 사리기 쉬워 싸게 딸 기회예요.' },
            { title: '짧은 입찰은 양날의 검', body: '아무도 입찰하지 않을 것 같은 경매에 몇 초만 걸어 두면, 다른 사람이 모두 빠졌을 때 거의 공짜로 바둑알을 얻어요. 하지만 이 사이트에서는 누군가 함께 입찰하는 순간 내가 가장 먼저 손을 뗀 사람이 되어 **마이너스 바둑알**을 받아요. 들어갈 거면 제대로 들어가고, 아니면 카운트다운 안에 빠지는 것이 기본이에요. 비싼 경매 바로 다음처럼 다들 지친 때만 노려 보세요.' },
            { title: '동점을 피하는 시간', body: '2분 00초나 1분 30초처럼 딱 떨어지는 시간은 다른 사람도 고르기 쉬워요. 동점이면 둘 다 잃고 표식은 사라지니, 노린 시간보다 조금 더 버티는 버릇을 들이세요.' },
            { title: '마지막 경매의 계산', body: '마지막 경매에서는 남길 이유가 없어요. 표식이 꼴찌 근처라면 가진 시간을 모두 쓰는 것이 맞고, 이미 안전하다면 1위를 노리는 사람만 남은 시간으로 승부해요. 표식이 같으면 남은 시간이 많은 쪽이 위라는 것도 잊지 마세요.' },
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**쓴 시간이 아까워서 계속 버티기.** 이미 쓴 시간은 손을 떼도 계속 눌러도 똑같이 사라져요. 판단은 "지금부터 더 쓸 시간으로 이길 수 있나"로만 하세요.',
            '**초반에 몰아 쓰기.** 앞에서 크게 이기면 표식은 늘지만, 후반에 남은 시간 상한이 낮다는 걸 모두가 알게 돼요. 그 뒤로는 싸게 이길 수가 없어요.',
            '**자기 시간을 잘못 기억하기.** 생각보다 시간이 적으면 큰 입찰 도중 버튼이 밀려나 그 시간을 모두 잃어요. 경매가 끝날 때마다 남은 시간을 속으로 한 번씩 업데이트하세요.',
            '**어정쩡하게 들어갔다 빠지기.** 카운트다운이 끝난 뒤 몇 초 만에 손을 떼면 시간은 시간대로 쓰고 마이너스 바둑알까지 받기 쉬워요. 망설여지면 카운트다운 안에 떼세요.',
            '**전광판만 보고 따라가기.** 전광판은 누군가 아직 누르고 있다는 것만 알려 줘요. 몇 명인지, 누구인지는 끝까지 알 수 없어요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'AI와 친구 방',
        blocks: [
          { type: 'p', text: 'AI는 다섯 성향이 있어요. **신중**은 필요한 만큼만 평소 낙찰가 근처로, **돌격**은 초반에 크게 질러 표식을 먼저 모으고, **잠복**은 초반을 거의 쉬다가 후반에 시간을 몰아 써요. **줍줍**은 다들 지친 틈을 타 짧은 입찰로 빈 경매를 노리고(들키면 마이너스 바둑알이에요), **계산**은 낙찰 시간을 세어 상대의 시간 상한을 따져요. 모든 AI는 공개된 정보(낙찰자, 낙찰 시간, 표식 수)와 자기 시간만 보고 결정하고, 누가 지금 누르고 있는지는 보지 못해요.' },
          { type: 'p', text: '**보통** AI는 자기가 쓴 시간을 대충 기억해서, 가진 것보다 큰 입찰을 계획했다가 버튼이 밀려나기도 해요. **어려움** AI는 정확히 기억하고, 상대의 시간 상한을 세어 이길 수 있는 경매를 골라요. AI끼리 3,000판을 돌려 보면 어려움 AI가 탈락하는 비율은 약 12%, 보통 AI는 약 22%였어요(빠른 경매 기준).' },
          { type: 'p', text: '친구 방과 공개방은 2~6명이 할 수 있고, 빈자리를 AI로 채울지 방장이 골라요. 준비 단계에서 15초 안에 버튼을 누르지 않으면 그 경매는 포기로 처리되고, 두 번 연속이면 다시 들어올 때까지 AI가 대신해요.' },
          { type: 'callout', tone: 'note', title: '시간은 각자의 기기에서 재요', text: '버튼을 누른 시간은 내 기기에서 내 카운트다운 기준으로 재고, 방장 기기가 그 기록이 실제로 가능한 시간인지 확인해요. 인터넷이 느려도 입찰 시간은 바뀌지 않아요. 다른 앱으로 가거나 화면을 끄면 그 순간 손을 뗀 것으로 처리되니, 경매 중에는 화면을 켜 두세요.' },
        ],
      },
      {
        id: 'differences',
        onGamePage: true,
        title: '방송과 다른 점',
        blocks: [
          { type: 'table', head: ['', '방송', 'PUZZLTHINK'], rows: [
            ['인원', '6명', 'AI전 6명 · 친구·공개방 2~6명'],
            ['바둑알 점수', '모든 표식 1개씩', '기본 바둑알 1점 · 세 번째마다 중급 아이콘 2점 · 마지막 최상급 아이콘 3점'],
            ['마이너스 바둑알', '없음', '두 명 이상 입찰하면 가장 먼저 뗀 1명이 −1 (0.1초 동점이면 없음). 순위는 점수(바둑알 − 마이너스)'],
            ['경매 물건', '승리 표식', '경매마다 아이콘 바둑알 하나. 점수만 다를 뿐 승리 표식처럼 세고, 실제 아이콘은 지급되지 않아요'],
            ['시간 × 경매 수', '10분 × 19번', '2분 × 9번(기본) · 5분 × 13번 · 10분 × 19번'],
            ['보상', '1위 피스 1개 · 꼴찌 탈락', '1위 · 꼴찌 탈락(기록에 남아요)'],
            ['포기', '카운트다운 안에 손 떼기', '같음 + "이번 경매는 포기" 버튼'],
            ['준비 시간', '진행자가 진행', '친구 방은 15초 안에 누르기'],
            ['동점 꼴찌', '방송에서 나오지 않음', '표식·시간이 모두 같으면 모두 탈락'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어',
        blocks: [
          { type: 'glossary', items: [
            { term: '승리 표식', def: '경매 하나를 낙찰받으면 받는 표. 최종 순위는 표식 수로 정해요.' },
            { term: '낙찰 시간', def: '전광판이 멈춘 시간. 낙찰자가 버틴 시간이자 낸 값이에요.' },
            { term: '유찰', def: '가장 오래 버틴 사람이 둘 이상이라 표식이 사라지는 것.' },
            { term: '올페이 경매', def: '낙찰받지 못한 입찰자도 입찰한 만큼을 내는 경매.' },
            { term: '안전선', def: '그만큼 따면 절대 꼴찌가 되지 않는 표식 수(경매 수 ÷ 인원 + 1).' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '시간 경매에서 진 사람도 시간을 잃나요?', a: '네. 카운트다운이 끝난 뒤 버튼을 누르고 있던 시간은 낙찰받지 못해도 모두 잃어요. 시간이 들지 않는 건 카운트다운 안에 손을 뗀 경우뿐이에요.' },
      { q: '내 남은 시간은 어디서 보나요?', a: '보이지 않아요. 방송 규칙 그대로 남은 시간은 본인에게도 공개되지 않으니 쓴 시간을 기억해야 해요. 시간을 다 쓰면 버튼이 밀려나며 진동으로 알려 주고, 경기가 끝나면 모두의 남은 시간과 입찰 기록이 공개돼요.' },
      { q: '몇 개를 따야 탈락하지 않나요?', a: '바둑알만 보면 경매 수 ÷ 인원보다 많이 따면 안전해요(6명 기준 빠른 경매 2개, 표준 3개, 방송 규칙 4개). 다만 이 사이트는 가장 먼저 손을 뗀 사람에게 마이너스 바둑알을 주니, 순위는 점수(바둑알 − 마이너스)로 정해지고 확실한 보장은 없어요.' },
      { q: '마이너스 바둑알과 바둑알 점수는 방송 규칙인가요?', a: '아니에요. 둘 다 PUZZLTHINK에서 더한 규칙이에요. 바둑알은 기본 1점, 중급 아이콘 2점, 마지막 최상급 아이콘 3점이고(실제 아이콘은 지급되지 않아요), 두 명 이상 입찰한 경매에서 가장 먼저 손을 뗀 1명이 −1점을 받고, 카운트다운 안에 포기한 사람은 받지 않아요.' },
      { q: '0.1초까지 같은 시간에 손을 떼면 어떻게 되나요?', a: '가장 오래 버틴 사람끼리 0.1초까지 같으면 그 경매는 유찰되어 아무도 표식을 받지 못하고, 동점자들도 시간은 그대로 잃어요.' },
      { q: '방송과 같은 10분 19번 경매로 할 수 있나요?', a: '네. 게임 시작에서 "방송 규칙 10분 × 19경매"를 고르거나, 친구 방에서 방장이 경매 규모를 방송 규칙으로 바꾸면 돼요. 한 판에 40분 안팎 걸려요.' },
      { q: '인터넷이 느리면 불리한가요?', a: '아니에요. 입찰 시간은 각자의 기기에서 자기 카운트다운 기준으로 재기 때문에 지연이 시간에 더해지지 않아요. 방장 기기는 그 기록이 실제로 가능한 범위인지만 확인해요.' },
    ],
    cta: { title: '얼마나 버틸 수 있나요?', body: 'AI 5명과 빠른 경매 한 판은 8분 정도면 끝나요. 안전선을 정해 두고 시작해 보세요.', button: '시간 경매 하러 가기' },
    disclaimer: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요. 실제 돈을 거는 도박과는 아무 관련이 없어요.',
  },
  en: {
    meta: {
      title: "Time Auction strategy — The Devil's Plan 2 prison match rules, safety line, reading prices | PUZZLTHINK",
      description: "A guide to Time Auction from The Devil's Plan: Death Room (season 2): how an all-pay auction works, how many tokens keep you safe, counting rivals' time from winning prices, and how the broadcast match played out.",
      keywords: ['Time Auction strategy', "Devil's Plan 2 Time Auction", "Devil's Plan Death Room", 'Time Auction rules', 'all-pay auction game'],
    },
    title: 'Time Auction strategy',
    lead: 'An auction paid in time. Losing less comes before winning more.',
    intro: [
      'In Time Auction everyone starts with the same amount of time, and in each auction whoever holds the button longest takes the victory token. Losers never get their time back, and not even your own remaining time is shown, so the match turns on **when to fight and when to drop out** — and on **remembering what you have spent**.',
      'This guide goes past the short rules under the game: the rulings people trip over (ties to 0.1 s, running out, nobody bidding), how many tokens you need to be safe, how to cap a rival’s time from winning prices, a walk through the broadcast match, the AI styles and how timing works in friend rooms.',
    ],
    gamePageTitle: "Time Auction online — The Devil's Plan 2 prison match on the web",
    summary: 'How an all-pay auction works, the safety line, counting time from winning prices, the broadcast match.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Time Auction?',
        blocks: [
          { type: 'p', text: "Time Auction was the prison match on the second night of Netflix's The Devil's Plan: Death Room (season 2). The six players in the prison wing each got ten minutes for nineteen auctions, and the one with the fewest tokens was eliminated. On the show, the player who won only one token went out and the one who won five took the piece." },
          { type: 'p', text: 'In auction theory it is an **all-pay auction**: in a normal auction only the winner pays, but here every bidder pays what they held. Two players who both refuse to let go both lose big while only one gets the token — a game of chicken.' },
          { type: 'p', text: 'On PUZZLTHINK you can play six-handed against five AIs, or 2–6 people in friend and open rooms. The rules are the broadcast rules; so a match does not take too long you can pick **Quick (2:00 × 9 auctions, default)**, **Standard (5:00 × 13)** or **Broadcast (10:00 × 19)**.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'Rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            'Everyone gets the same time to spend. Time is recorded to **0.1 s** only (the rest is dropped: holding 12.38 s is a 12.3 s bid).',
            'Each auction, everyone presses and holds the button; then a **5-second countdown** starts.',
            'Let go during the countdown to **drop out** of that auction. It costs nothing.',
            'When the countdown ends, the time of everyone still pressing starts to drain. Let go when you have spent as much as you want.',
            'The board shows only the time running in this auction — never who is holding or who dropped out.',
            'When the last player lets go the board stops and that player wins a **victory token**. Only the winner and the stopped time are announced.',
            'Losers lose the time they held too.',
            'Your remaining time is hidden, **even from you**. Remember what you spend.',
            '**Piece values (house rule)**: the auctions put up pieces drawn as PUZZLTHINK profile icons. Starter pieces (basic colours, 10/20 hours played, 2048) are worth 1 point, every third auction\'s mid-tier icon (30/50 hours played, friend/open match wins, Time Auction Hard clear…) 2, the last auction\'s top icon (Open match #1, 100 hours played, Piece week 2 #1, Time Auction #1…) 3. The whole order is shown from the start. The pieces on auction are points in this game only; no real profile icon is granted.',
            '**The minus stone (house rule)**: it looks like the hell-mode stone. When two or more bid in an auction, whoever let go first takes −1. Dropping out during the countdown never takes it.',
            'After the last auction, the highest score (points won − minus stones) is 1st (on the show: most tokens took the piece); the lowest is eliminated.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Rulings that trip people up',
        blocks: [
          { type: 'cards', columns: 2, items: [
            { title: 'A tie to 0.1 s is void', body: 'If two or more share the longest hold to the tenth of a second, nobody gets that token, and the tied players still lose their time. A tie between losers changes nothing.' },
            { title: 'Out of time, out of the auction', body: 'If your time runs out while you hold, the button is pushed out at that moment, so you can never bid more than you have. Your phone vibrates — the one time you learn your balance. With 0:00.0 left you cannot take part any more.' },
            { title: 'Nobody bids', body: 'If everyone lets go in the countdown, the token is lost. The broadcast rules do not cover this; it is this site’s ruling.' },
            { title: '0.0 s is not a bid', body: 'Letting go less than 0.1 s after the countdown records 0.0 s, which counts as dropping out at no cost. The smallest bid is 0.1 s.' },
            { title: 'Ties on tokens go to time', body: 'Equal tokens rank by time left, more is better. So when fighting for 1st, keep time; when fighting to avoid last, spend it. Equal tokens and equal time share the place — all of them out if it is last.' },
            { title: 'Who takes the minus stone', body: 'When two or more players held past the countdown, the first of them to let go takes it. If two or more let go at the same tenth, nobody does; a lone bidder only wins. A tie at the top (void) does not cancel the minus stone.' },
            { title: 'The sit-out button', body: '"Sit this one out" in the ready step is the same as pressing and letting go during the countdown. Nobody else can see who did it.' },
          ] },
        ],
      },
      {
        id: 'safety-line',
        onGamePage: true,
        level: 'beginner',
        title: 'Beginner: how many tokens keep you safe?',
        blocks: [
          { type: 'p', text: 'Only the single player with the fewest tokens is eliminated, so the aim is not to win every auction but to **avoid last place**. If you hold k tokens, everyone else can only match you if (players − 1) × k tokens are left for them, so winning **more than auctions ÷ players** makes you safe for certain.' },
          { type: 'table', head: ['Format', 'Players', 'Auctions', 'Safe for certain'], rows: [
            ['Quick (2:00)', '6', '9', '2'],
            ['Standard (5:00)', '6', '13', '3'],
            ['Broadcast (10:00)', '6', '19', '4'],
          ], caption: 'Safe line = auctions ÷ players, rounded down, + 1. The token panel shows the same number.' },
          { type: 'callout', tone: 'warn', title: 'With minus stones it is not a guarantee', text: 'The safe line above counts stones only. This site gives −1 to whoever lets go first, so reaching the line and then taking several minus stones can still leave you last. Count your **score (stones − minus)**.' },
          { type: 'p', text: 'One fewer usually survives too: in the broadcast format, three tokens only lose if the other five all have three or more (4·3·3·3·3) and you have the least time. So the beginner plan is to **win just the number you need, in auctions you can win cheaply**.' },
          { type: 'callout', tone: 'tip', title: 'Set a budget per token', text: 'In Quick with a target of two, you can afford about a minute per token. If an auction looks like it will cost more, let go. Time already held is gone whether you let go or not, so holding on "because I have already spent so much" is the most common mistake.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'The broadcast match, step by step',
        blocks: [
          { type: 'p', text: 'Two players bid in the first auction on the show. One let go at 1:23.4; the other held to 1:49.8 and took the token. The board stopped at 1:49.8, and the loser walked away with nothing for 1:23.4. Between them, more than 5% of the table’s sixty minutes went in a single auction.' },
          { type: 'steps', items: [
            { title: 'Early: expensive auctions', body: 'The first six auctions on the show went for between 1:26.6 and 3:01.3. Spending two minutes of ten leaves eight for eighteen auctions, so a player who loses two big fights early has little left for the end.' },
            { title: 'Middle: cheaper wins', body: 'While others were tired, a token went for 58.0 s, far below the early prices. You cannot see who dropped out, so right after an expensive auction is a good time to go in.' },
            { title: 'Late: the saver collects', body: 'A player who sat out most early auctions won three of the last five with 2:21.9, 2:23.4 and 4:09.9. The final 4:09.9 was a bid made on the belief that nobody else had that much left.' },
            { title: 'Result', body: 'Tokens 5·4·3·3·3·1. The one-token player was eliminated; the five-token player finished first with 0:00.0 left. Winning the auctions you need comes before keeping time.' },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate: counting time from winning prices',
        blocks: [
          { type: 'p', text: 'You cannot see a rival’s time, but you can count **the most they can have left**. Winners and prices are public, so starting time minus the prices of the auctions they won is an upper bound. Their losing bids are unknown, so the truth is lower.' },
          { type: 'table', head: ['', 'A', 'B', 'C'], rows: [
            ['Start', '2:00.0', '2:00.0', '2:00.0'],
            ['Auctions won', '0:41.3, 0:38.0', '0:52.1', '—'],
            ['Most time left', '0:40.7', '1:07.9', '2:00.0'],
          ], caption: 'A Quick example. A, with the most tokens, has the lowest cap.' },
          { type: 'p', text: 'If your time beats every rival’s cap, bidding the highest cap + 0.1 s **guarantees** the token. Late in a match, when you are short of tokens, that is your way out. A player who has not won yet (C above) still has the full cap: if they are saving into the late game, expect a big bid.' },
          { type: 'callout', tone: 'note', title: 'The total is fixed', text: 'Six players with 2:00 each is 12:00 on the table. Subtract every public price so far for the most anyone can have saved, and divide by the auctions left to see how much can pile into one auction.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced: choosing your auctions',
        blocks: [
          { type: 'cards', items: [
            { title: 'Price 2- and 3-point pieces separately', body: 'A mid-tier icon is worth two starter pieces, the final top icon three. In 3,000 AI-only matches 2-point pieces went for about twice a 1-point piece, but the 3-pointer — in the last auction, when everyone is nearly out of time — went for no more than a 2-pointer. Whoever kept time to the end can take the cheapest 3 points of the match.' },
            { title: 'After an expensive auction', body: 'A big winning price usually means the runner-up lost big too. Everyone tends to hold back in the very next auction — a chance to win cheaply.' },
            { title: 'Short bids cut both ways', body: 'A few seconds in an auction nobody seems to want wins a near-free stone when everyone else drops out. But here, as soon as anyone else bids, you are the first to let go and take the **minus stone**. Go in properly or drop out in the countdown; try short bids only when everyone is likely tired, such as right after an expensive auction.' },
            { title: 'Avoid round numbers', body: 'Times like 2:00 or 1:30 are easy for others to pick too. A tie loses both bids and the token, so get used to holding a little past your target.' },
            { title: 'The last auction', body: 'There is no reason to keep time in the last auction. Near the bottom, spend everything; already safe, only the race for 1st remains — and equal tokens go to more time left.' },
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Holding on because of what you already spent.** Spent time is gone either way. Decide only on whether the time you are about to add can win.',
            '**Spending it all early.** Early wins add tokens, but everyone then knows your cap is low, and you can no longer win cheaply.',
            '**Misremembering your time.** With less than you think, a big bid ends with your button pushed out and all of it gone. Update your count after every auction.',
            '**Going in half-heartedly.** Letting go a few seconds after the countdown spends time and often takes the minus stone too. If in doubt, let go during the countdown.',
            '**Reading too much into the board.** The board only says someone is still holding — never how many or who.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'AI and friend rooms',
        blocks: [
          { type: 'p', text: 'There are five AI styles. **Steady** bids only as often as it needs, near the usual price; **Rush** spends big early to bank tokens; **Lurker** sits out early and pours its time into the late auctions; **Penny** slips in short bids when everyone seems tired (and takes the minus stone if caught); **Counter** counts winning prices to cap each rival’s time. Every AI decides from public information (winners, prices, tokens) and its own time; none can see who is holding.' },
          { type: 'p', text: '**Normal** AIs keep only a rough count of their own time and sometimes plan a bid they cannot pay, so the button gets pushed out. **Hard** AIs count exactly and pick auctions they can win. Over 3,000 AI-only matches in Quick, hard AIs were eliminated about 12% of the time, normal ones about 22%.' },
          { type: 'p', text: 'Friend and open rooms take 2–6 people; the host chooses whether AI fills the empty seats. In the ready step you have 15 seconds to press, or you sit that auction out; miss twice in a row and the AI plays your seat until you come back.' },
          { type: 'callout', tone: 'note', title: 'Your hold is timed on your device', text: 'Your hold is measured on your own device from your own countdown, and the host’s device checks that the claim is possible. A slow connection does not change your bid. Switching apps or turning the screen off counts as letting go at that moment, so keep the screen on during an auction.' },
        ],
      },
      {
        id: 'differences',
        onGamePage: true,
        title: 'How this differs from the broadcast',
        blocks: [
          { type: 'table', head: ['', 'Broadcast', 'PUZZLTHINK'], rows: [
            ['Players', '6', '6 vs AI · 2–6 in rooms'],
            ['Piece values', 'Every token counts 1', 'Starter 1 · every third a mid-tier icon 2 · the last a top icon 3'],
            ['Minus stone', 'None', 'With two or more bids, the first to let go takes −1 (a tie to 0.1 s: nobody). Places go by score (stones − minus)'],
            ['What is sold', 'A victory token', 'One icon piece per auction. Only the points differ from a token; no real icon is granted'],
            ['Time × auctions', '10:00 × 19', '2:00 × 9 (default) · 5:00 × 13 · 10:00 × 19'],
            ['Stakes', '1st gets a piece · last is eliminated', '1st · last is eliminated (kept in your records)'],
            ['Dropping out', 'Let go in the countdown', 'Same, plus a "sit this one out" button'],
            ['Ready step', 'Run by the dealer', 'Rooms: press within 15 s'],
            ['Tie for last', 'Never came up', 'Equal tokens and time: all of them out'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Victory token', def: 'What the winner of one auction gets. Final places go by tokens.' },
            { term: 'Price', def: 'The time the board stopped at: what the winner held and paid.' },
            { term: 'Void', def: 'Two or more share the longest hold, so nobody gets the token.' },
            { term: 'All-pay auction', def: 'An auction where losing bidders pay their bids too.' },
            { term: 'Safe line', def: 'The tokens that make last place impossible (auctions ÷ players + 1).' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Do losers lose time in Time Auction?', a: 'Yes. Everything you hold after the countdown is gone even if you do not win. Only letting go during the countdown is free.' },
      { q: 'Where do I see my remaining time?', a: 'You do not. As on the show, your remaining time is hidden even from you, so you must remember what you spent. When it runs out the button is pushed out and your phone vibrates; at the end everyone’s time and every bid is revealed.' },
      { q: 'How many stones do I need to survive?', a: 'Counting stones only, more than auctions ÷ players is safe (with six: 2 in Quick, 3 in Standard, 4 in Broadcast). But this site gives a minus stone to whoever lets go first, so places go by score (stones − minus) and nothing is guaranteed.' },
      { q: 'Are the minus stone and stone values broadcast rules?', a: 'No, both are PUZZLTHINK house rules. Pieces are worth 1, mid-tier 2 and the last top icon 3 (no real icon is granted); when two or more bid, the first to let go takes −1; dropping out in the countdown never takes it.' },
      { q: 'What if two players let go at the same tenth of a second?', a: 'If the longest holds tie to 0.1 s, the auction is void: nobody gets the token and the tied players still lose their time.' },
      { q: 'Can I play the broadcast format, 10 minutes and 19 auctions?', a: 'Yes. Pick "Broadcast rules 10:00 × 19" when you start, or set the match size to Broadcast in a friend room. A match takes about 40 minutes.' },
      { q: 'Does a slow connection hurt me?', a: 'No. Your hold is timed on your own device from your own countdown, so delay is not added to your bid. The host’s device only checks the claim is possible.' },
    ],
    cta: { title: 'How long can you hold?', body: 'A Quick match against five AIs takes about eight minutes. Set your safe line and start.', button: 'Play Time Auction' },
    disclaimer: "PUZZLTHINK is an unofficial fan project, not affiliated with The Devil's Plan or Netflix. The programme name is used only to describe the game. It has nothing to do with real-money gambling.",
  },
};

export default guide;
