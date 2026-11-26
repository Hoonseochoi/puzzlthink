// Hit,Stay guide. Rules and numbers follow src/lib/hitStay.ts (HS_DECK, HS_DIE, HS_START_CHIPS, hsAnte, startRound's
// cap and first-player rotation, beginBetting's skip when the ante reaches the cap, better() for the ranking —
// bust first, then distance to the limit, then more cards — the odd-chip rule in showdown(), knock-out places,
// chooseHsAction for the AI) and src/lib/hitStayRoom.ts (HS_PICK_SEC 10, HS_TURN_SEC 30 / HS_WARN_SEC 10 in rooms,
// the AI taking an idle seat until "rejoin", fillAi for 2–5 people). Inline guide: HitStayGuide in ko/en.json.
// Probabilities were computed from the 35-card deck (3-card sums over all C(35,3) hands; draw odds by counting).
import type { GameGuide } from './types';
import { HS_TELLS } from '@/lib/hitStay';
import { personaSection } from './personaSection';

const guide: GameGuide = {
  game: 'hitStay',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-27',
  related: ['heavy13', 'russianRoulette', 'piggyBank', 'indianPoker'],
  inlineNamespace: 'HitStayGuide',
  ko: {
    meta: {
      title: 'Hit,Stay(힛스테이) 공략 — 카드 확률표, 베팅 상한, 칩 관리 | PUZZLTHINK',
      description: '데블스 플랜 3 힛스테이 공략. 35장 덱으로 계산한 HIT 성공 확률표, 한계를 다 같이 넘었을 때의 판정, 카드 수 동점 규칙, 베팅 상한과 기본 베팅 증가표, 실제 라운드 따라가기까지 정리했어요.',
      keywords: ['힛스테이 공략', 'Hit Stay 공략', '힛스테이 규칙', '데블스 플랜 3 힛스테이', '데블스플랜 힛스테이', '힛스테이 확률', '힛 스테이 전략', '데블스 플랜 준결승'],
    },
    title: 'Hit,Stay(힛스테이) 공략',
    lead: '한 장 더 받을 용기와 칩을 아낄 인내, 둘 다 숫자로 따져 봐요.',
    intro: [
      'Hit,Stay는 5명이 숫자 카드의 합을 그 라운드의 한계 숫자(5~12)에 가장 가깝게 맞추고, 칩을 두 번 걸어 살아남는 베팅 카드 게임이에요. 카드 덱이 35장으로 정해져 있고 받은 카드 대부분이 공개되기 때문에, 감이 아니라 **남은 카드를 세서** 결정할 수 있다는 점이 핵심이에요.',
      '이 공략은 게임 화면 아래의 짧은 규칙보다 깊이 들어가요. 덱 구성으로 직접 계산한 확률표, 규칙 설명에 잘 안 나오는 판정(모두 한계를 넘었을 때, 베팅이 건너뛰어질 때), 한 라운드를 처음부터 끝까지 따라가는 예시, 입문부터 고급까지의 전략과 AI·친구 방 메모를 차례로 담았어요.',
    ],
    gamePageTitle: 'Hit,Stay(힛스테이) 온라인 — 데블스 플랜 3 준결승 메인매치를 웹에서',
    summary: '35장 덱 확률표, 카드 수 동점 규칙, 베팅 상한과 칩 관리, 실제 라운드 따라가기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'Hit,Stay는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: 'Hit,Stay는 넷플릭스 「데블스 플랜: 데드 어게인」(데블스 플랜 3)의 준결승 메인매치로 등장한 게임이에요. 카드를 더 받을지 멈출지 고르는 구조는 블랙잭을 닮았지만, 목표 숫자가 매 라운드 8면체 주사위로 바뀌고 판돈을 두 번에 나눠 건다는 점에서 전혀 다른 게임이 돼요.' },
          { type: 'p', text: '블랙잭과 가장 크게 다른 점은 **딜러와 싸우지 않는다**는 거예요. 다섯 명이 같은 팟을 두고 겨루고, 칩이 0이 된 사람부터 탈락해서 마지막 한 명이 1위가 돼요. 그래서 한 라운드를 이기는 것보다 오래 살아남는 것이 더 중요하고, 남의 칩이 줄어드는 것도 내 승리에 가까워지는 일이에요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 AI 4명과 바로 5인전을 하거나, 친구 방(2~5명)과 누구나 들어오는 공개방에서 사람끼리 겨룰 수 있어요. 실제 돈과는 아무 관련이 없는 칩 게임이에요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'table', caption: '덱 구성 — 모두 35장, 숫자 합은 77이라 한 장의 평균은 2.2예요', head: ['숫자', '7', '6', '5', '4', '3', '2', '1', '-1'], rows: [['장수', '1', '2', '3', '4', '5', '6', '7', '7']] },
          { type: 'list', ordered: true, items: [
            '**시작**: 5명이 칩 30개씩 들고 시작해요. 첫 라운드의 선(先)은 추첨으로 정하고, 다음 라운드부터는 한 자리씩 옆 사람에게 넘어가요(탈락한 사람은 건너뛰어요).',
            '**기본 베팅**: 라운드가 시작되면 모두 기본 베팅을 팟에 내요. 기본 베팅은 아래 표처럼 점점 커지지만, 그 라운드 시작 때 **칩이 가장 적은 사람의 칩 수**를 넘지 않아요.',
            '**한계 숫자**: 8면체 주사위를 굴려 5~12 중 하나가 같은 확률(각 12.5%)로 정해져요.',
            '**카드 받기와 공개**: 덱을 섞어 선부터 3장씩 나눠 주고, 각자 3장 중 1장을 골라 모두에게 공개해요. 나머지 2장은 끝까지 나만 봐요.',
            '**1차 베팅**: 선부터 차례로 콜(낼 게 없으면 체크)·레이즈·포기 중 하나를 해요. 누군가 레이즈하면 나머지는 그 금액에 맞추거나 포기해야 하고, 모두가 같은 금액이 되면 끝나요.',
            '**HIT / STAY**: 선부터 차례로 HIT(1장 더 받기)나 STAY(멈추기)를 골라요. HIT로 받은 카드는 **모두에게 공개**돼요. 한 바퀴 돈 뒤에도 STAY하지 않은 사람은 다시 차례가 와요. 모두 STAY하거나 덱이 떨어지면 끝나요.',
            '**2차 베팅**: 1차와 같은 방식으로 한 번 더 걸어요.',
            '**판정**: 남은 사람의 카드를 모두 열어, 한계를 넘지 않으면서 한계에 가장 가까운 사람이 팟을 가져가요. 합이 같으면 카드가 많은 쪽이 이겨요.',
            '**탈락**: 칩이 0개가 되면 탈락이에요. 마지막까지 남은 한 명이 1위예요.',
          ] },
          { type: 'table', caption: '라운드별 기본 베팅 (가장 적은 칩 보유자의 칩 수가 상한)', head: ['라운드', '1~2', '3~4', '5~6', '7~8', '9~10', '11~12', '13~14', '15~16', '17~18', '19~20', '21~22'], rows: [['기본 베팅', '1', '2', '3', '4', '5', '6', '7', '8', '13', '18', '23']] },
          { type: 'p', text: '16라운드까지는 2라운드마다 1칩씩, 17라운드부터는 2라운드마다 5칩씩 커져요. 16라운드까지 기본 베팅만 모두 더해도 한 사람당 72칩이라, 시작 칩 30개로는 이기는 판 없이 버틸 수 없어요. 판이 길어질수록 기본 베팅이 사람을 밀어내요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 판정 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '모두 한계를 넘으면?', body: '한계 안에 든 사람이 한 명이라도 있으면 그 사람들 중에서 승자가 나오고, 넘은 사람은 모두 그 아래예요. 그런데 **남은 사람 모두가 넘었다면** 한계를 가장 적게 넘은 사람이 팟을 가져가요. 한계 8에서 10과 9만 남았다면 9가 이겨요.' },
            { title: '합이 같으면?', body: '합이 같으면 카드를 더 많이 가진 쪽이 이겨요. 한계 9에서 5+4(2장)와 3+3+2+1(4장)이면 4장 쪽이에요. 3장은 기본이니, 결국 HIT를 한 번이라도 더 한 사람이 유리해요.' },
            { title: '합도 카드 수도 같으면?', body: '팟을 똑같이 나눠요. 나누어떨어지지 않는 칩은 선부터 시계 방향으로 가장 먼저 만나는 동점자가 가져가요.' },
            { title: '다들 포기하면?', body: '한 명만 남는 순간 그 사람이 바로 팟을 가져가요. HIT/STAY나 2차 베팅도 하지 않고, 남은 사람의 숨긴 카드도 공개되지 않아요.' },
            { title: '베팅을 아예 안 하는 라운드도 있나요?', body: '기본 베팅이 이미 상한(가장 적은 칩 보유자의 칩 수)에 닿으면 아무도 레이즈할 수 없어서 1차·2차 베팅을 건너뛰어요. 칩이 바닥난 사람이 있을 때 자주 생겨요.' },
            { title: '레이즈는 얼마까지 되나요?', body: '레이즈 금액은 이번 라운드에 낸 총액 기준이고, 지금 금액보다 1칩 이상 높아야 해요. 위로는 상한까지예요. 상한은 라운드 시작 때 칩이 가장 적은 사람 기준이라, 칩 30개를 가진 사람도 상대 중 하나가 5개뿐이면 5칩까지만 걸 수 있어요.' },
            { title: '동시에 여러 명이 탈락하면?', body: '같은 라운드에 칩이 0이 된 사람들은 같은 순위를 나눠 가져요. 남은 인원이 한 명이 되면 그 사람이 1위로 게임이 끝나요.' },
            { title: '-1 카드는 언제 좋은가요?', body: '-1은 7장이나 있어서 덱의 20%예요. 한계를 1 넘긴 사람에겐 구원이고, 합을 깎으면서 카드 수를 늘리니 동점 싸움에서도 도움이 돼요. 반대로 한계에 딱 맞춘 사람이 받으면 한 칸 멀어져요.' },
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 한계 9의 한 라운드',
        lead: '1라운드, 기본 베팅 1칩, 모두 칩 30개. 선은 제로이고 차례는 제로 → 레오 → 모아 → 루나 → 나예요.',
        blocks: [
          { type: 'steps', items: [
            { title: '카드 받기와 공개', body: '한계는 9. 내 카드는 5·3·-1(합 7)이고 5를 공개했어요. 다른 사람들의 공개 카드는 제로 2, 레오 6, 모아 1, 루나 4예요. 지금 내가 모르는 카드는 35장에서 내 3장과 공개 4장을 뺀 28장이에요.' },
            { title: '1차 베팅', body: '제로 체크, 레오가 3칩으로 레이즈, 모아 포기, 루나 콜, 나도 콜, 제로가 2칩을 더 내 콜. 팟은 3칩×4명에 모아의 기본 베팅 1칩을 더해 13칩이에요. 6을 공개한 레오의 레이즈는 강해 보이지만, 공개 카드가 큰 사람은 오히려 넘기 쉽다는 점도 기억해 둬요.' },
            { title: 'HIT/STAY 첫 바퀴', body: '제로 STAY, 레오가 HIT해서 -1을 받았어요(공개). 루나 STAY. 이제 내 차례: 합 7, 여유 2. 모르는 카드 27장 중 넘지 않는 카드는 2가 5장, 1이 6장, -1이 5장으로 16장, **약 59%**예요. 딱 9를 만드는 2는 5장(약 19%). 루나(4 공개)와 레오가 높아 보여서 7로는 이기기 어렵다고 보고 HIT했고, 1을 받아 합 8, 카드 4장이 됐어요.' },
            { title: 'HIT/STAY 둘째 바퀴', body: '레오 STAY. 내 차례에 합 8, 여유 1. 모르는 카드 26장 중 넘지 않는 건 1이 5장, -1이 5장으로 10장(**약 38%**)뿐이고 그중 -1은 오히려 멀어져요. 여기선 STAY. 모두 멈췄으니 2차 베팅으로 넘어가요.' },
            { title: '2차 베팅', body: '제로 체크, 레오가 6칩으로 레이즈, 루나 콜, 나도 콜, 제로 포기. 팟은 13 + 3칩×3명 = 22칩이에요.' },
            { title: '판정', body: '레오는 6·4·1에 -1을 받아 10, 한계를 넘었어요(레이즈는 허세였죠). 루나는 4·3·1로 8(3장), 나는 5·3·-1·1로 8(4장). 합이 같으니 **카드가 많은 내가 이겨요**. 22칩을 받아, 낸 6칩을 빼고 16칩 이득이에요.' },
          ] },
          { type: 'callout', tone: 'tip', title: '이 라운드에서 배울 점', text: '합 7에서의 HIT는 넘을 확률이 41%라 무모해 보였지만, 7로는 이길 수 없다는 판단이 먼저였어요. 그리고 마지막엔 합이 같아도 카드 한 장 차이로 이겼어요. "넘을 확률"과 "멈췄을 때 이길 확률"을 함께 보는 게 Hit,Stay의 기본이에요.' },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 여유 칸으로 HIT 정하기',
        blocks: [
          { type: 'p', text: '한계에서 내 합을 뺀 값을 **여유**라고 불러 볼게요. 다음 한 장이 여유 안에 들어올 확률은 덱 구성만으로 바로 나와요. 아래 표는 아무 카드도 보이지 않았을 때(35장 전체)의 값이에요. 실제 게임에서는 공개된 카드를 빼고 다시 세면 더 정확해져요.' },
          { type: 'table', caption: '다음 한 장으로 한계를 넘지 않을 확률 (35장 기준)', head: ['여유', '0', '1', '2', '3', '4', '5', '6', '7 이상'], rows: [['넘지 않을 확률', '20%', '40%', '57%', '71%', '83%', '91%', '97%', '100%']] },
          { type: 'list', items: [
            '**여유 4 이상이면 대체로 HIT**: 넘을 확률이 17% 이하예요. 처음 3장 합은 평균 6.6이고, 한계가 10~12인 라운드에서는 거의 항상 한 장 이상 더 받게 돼요.',
            '**여유 0~1이면 STAY**: 딱 맞춘 상태(여유 0)에서 받으면 -1이 나와도 멀어질 뿐이에요. 여유 1에서도 넘지 않을 확률이 40% 남짓이라 대부분 손해예요.',
            '**여유 2~3이 고민 구간**: 이때는 확률보다 "지금 멈추면 이길 수 있나"를 먼저 보세요. 다른 사람들의 공개 카드와 HIT 카드가 높다면 받아야 하고, 다들 낮다면 멈추는 게 나아요.',
            '**공개 카드는 가운데 숫자로**: 처음엔 3장 중 중간 숫자를 공개하면 상대가 내 합을 짐작하기 어려워요.',
            '**확신 없는 판은 1차 베팅에서 포기**: 포기하면 기본 베팅만 잃어요. 칩이 0이 되면 바로 탈락이니, 초반에는 작은 손해로 오래 버티는 쪽이 이겨요.',
          ] },
          { type: 'callout', tone: 'note', title: '처음 3장만으로 한계를 넘을 확률', text: '처음 3장의 합은 -3부터 18까지 나올 수 있어요. 한계가 5인 라운드에서는 3장만으로 이미 넘어 있을 확률이 약 61%, 한계 8이면 약 31%, 한계 12면 약 6%예요. 한계가 낮은 라운드는 시작부터 넘은 사람이 많아서, 넘지 않은 것만으로도 유리해요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 상대 합의 범위 좁히기',
        blocks: [
          { type: 'p', text: '상대 카드 중 내가 모르는 건 숨긴 2장뿐이에요. 공개 카드와 HIT 카드는 모두 보이니, 상대 합은 "보이는 합 + 숨긴 2장"이에요. 숨긴 2장은 -2(−1, −1)부터 13(7, 6)까지지만, 실제로는 대부분 1~6 사이예요. 아무 정보 없이 두 장을 뽑으면 평균 4.4예요.' },
          { type: 'cards', items: [
            { tag: '읽기', title: 'HIT 횟수가 말해 주는 것', body: '여유가 큰 사람만 HIT를 계속해요. 보이는 합이 높은데도 HIT를 하는 상대는 숨긴 카드가 작다는 뜻이고, 보이는 합이 낮은데 STAY하는 상대는 숨긴 카드가 크다는 뜻이에요. 공개 6에 STAY라면 숨긴 2장이 한계 근처를 채웠을 가능성이 높아요.' },
            { tag: '동점', title: '카드 수로 이기기', body: '같은 합이면 카드가 많은 쪽이 이겨요. 그래서 여유 0에서 받는 HIT도 -1 다음에 1을 받으면 같은 합으로 카드 두 장을 늘리는 셈이에요. 다만 이건 덱에 1과 -1이 넉넉히 남았고, 다른 사람이 같은 합일 가능성이 높을 때만 노려요.' },
            { tag: '자리', title: '늦게 행동하는 자리의 이점', body: '베팅도 HIT/STAY도 선부터 시작해요. 마지막에 가까운 자리는 다른 사람의 HIT 결과를 다 보고 결정할 수 있어요. 선일 때는 정보가 적으니 베팅을 작게, 마지막 자리일 때는 남들이 멈춘 합을 보고 HIT를 정하세요.' },
            { tag: '덱', title: '남은 카드를 세는 습관', body: '35장 중 5명에게 15장이 나가면 덱에는 20장이 남아요. 공개된 7과 6이 이미 보였다면 큰 카드가 거의 없다는 뜻이라 HIT가 안전해져요. 반대로 -1과 1이 많이 보였다면 작은 카드가 줄어서 여유 1~2에서의 HIT가 더 위험해져요.' },
          ] },
          { type: 'h3', text: '베팅: 팟 대비 낼 돈' },
          { type: 'p', text: '콜할지는 "이길 확률 × 팟"과 "낼 칩"을 비교해 보면 돼요. 팟이 20칩이고 콜에 5칩이 든다면, 이길 확률이 20%만 넘어도 기댓값으로는 콜이 이득이에요. 다만 Hit,Stay는 칩이 0이 되면 끝나는 생존 게임이라, 칩이 적을수록 같은 기댓값이라도 위험을 줄이는 쪽이 나아요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 상한과 기본 베팅으로 판을 운영하기',
        blocks: [
          { type: 'h3', text: '칩이 가장 적은 사람이 판의 크기를 정해요' },
          { type: 'p', text: '한 라운드에 누구도 "라운드 시작 때 가장 적은 칩"보다 많이 낼 수 없어요. 그래서 칩이 많은 사람이 큰 판으로 몰아붙이려면 먼저 칩이 적은 사람을 탈락시켜야 해요. 반대로 칩이 적을 때는 내가 남아 있는 것만으로 모두의 베팅을 묶어 두는 셈이라, 무리하게 승부하지 않고 버티는 것 자체가 전략이 돼요.' },
          { type: 'h3', text: '17라운드부터는 기본 베팅이 승부를 대신해요' },
          { type: 'p', text: '16라운드까지 기본 베팅은 최대 8칩이지만 17라운드에 13칩, 19라운드에 18칩, 21라운드에 23칩으로 뛰어요. 이때는 기본 베팅만으로 상한에 닿아 베팅 자체가 사라지는 라운드가 많아요. 칩을 모아 둔 사람만 이 구간을 버텨요. 판이 16라운드를 넘길 것 같다면, 그 전에 칩을 30개 이상으로 불려 두는 것이 목표예요.' },
          { type: 'h3', text: '공개 카드로 거짓말하기' },
          { type: 'p', text: '공개할 1장은 상대가 내 합을 짐작하는 첫 단서예요. 7이나 6을 공개하면 상대는 내가 한계 근처라고 생각하고 1차 베팅에서 물러나기 쉬워요. 반대로 -1을 공개하면 약해 보여서 상대의 레이즈를 끌어낼 수 있어요. 같은 사람이 매번 같은 방식으로 공개하면 금방 읽히니 섞어 쓰세요.' },
          { type: 'h3', text: '모두 넘은 라운드의 숨은 기회' },
          { type: 'p', text: '한계가 5나 6인 라운드에서는 처음 3장으로 이미 넘은 사람이 많아요. 남은 사람 모두가 넘었다면 가장 적게 넘은 사람이 이기니, 나도 넘었다고 바로 포기할 필요는 없어요. 1 넘었다면 -1(덱의 20%)을 노려 HIT하는 것도 좋고, 다른 사람의 공개 카드가 커서 다 같이 넘었을 것 같다면 그대로 버티는 것도 방법이에요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**확률만 보고 HIT하기**: 넘지 않을 확률이 70%여도, 지금 합으로 이미 이기고 있다면 HIT는 손해예요. 다른 사람의 공개 카드를 먼저 보세요.',
            '**칩을 생각하지 않고 따라가기**: 레이즈마다 콜하다 보면 한 라운드에 칩 절반이 나가요. 탈락하면 다음 라운드의 좋은 패도 소용없어요.',
            '**-1을 잊기**: 덱의 20%가 -1이에요. 한계를 1 넘긴 상태라면 아직 끝난 게 아니고, 한계에 딱 맞췄다면 HIT로 받는 -1이 손해라는 것도 기억하세요.',
            '**큰 공개 카드를 강하다고만 보기**: 6이나 7을 공개한 사람은 남은 2장이 조금만 커도 넘어요. 공개 카드가 클수록 HIT 여유가 적다는 뜻이기도 해요.',
            '**기본 베팅 증가를 잊기**: 17라운드부터 기본 베팅이 크게 뛰어요. 그 전에 칩을 모아 두지 않으면 기본 베팅만 내다 탈락해요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구 방, 공개방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 4명과 5인전', 'AI는 모두 같은 최강 실력이에요. 매 결정마다 자기가 볼 수 있는 카드만으로 남은 카드를 수백 번 시뮬레이션해서 이길 확률을 계산하고, 베팅이 상한 가까이 올라가면 상대가 강하다고 읽어요. 다만 AI마다 베팅 성향이 달라서 누구는 조심스럽고 누구는 가끔 허세를 부려요. 열 명 중 넷이 매 판 무작위로 앉고, 누가 어떤 성향이었는지는 결과 화면에 나와요. 혼자 할 때는 베팅과 HIT/STAY에 시간 제한이 없어요.'],
            ['공개할 카드 고르기', '모든 모드에서 10초 안에 골라야 해요. 시간이 지나면 3장 중 아무 카드나 공개돼요. 모두 동시에 고르기 때문에 다른 사람이 먼저 골라도 내 시간은 계속 흘러요.'],
            ['친구 방', '초대 링크와 4자리 코드로 2~5명이 함께해요. 방장이 빈자리를 AI로 채울지 고르고, AI 없이 하면 최소 2명이 필요해요. 베팅과 HIT/STAY는 30초이고 마지막 10초에 경고가 떠요.'],
            ['자리를 비우면', '친구 방·공개방에서 시간을 넘기면 AI가 그 자리를 이어받아 대신 둬요. 돌아와서 복귀하면 다시 내가 해요. 한 사람 때문에 판 전체가 멈추지 않게 하는 장치예요.'],
            ['공개방', '누구나 들어오는 방이에요. 로그인하면 1위가 승리로 기록되어 기록실과 명예의 전당, 공개방 랭킹에 반영돼요.'],
            ['패보기', '이번 라운드에 누가 무엇을 공개하고 몇 번 HIT했는지, 판정 결과까지 다시 볼 수 있어요. 상대의 습관을 읽는 데 써 보세요.'],
          ] },
        ],
      },
      personaSection('ko', HS_TELLS, ['Hit,Stay의 AI는 원래 다섯 명이었고 11월 27일에 열 명이 됐어요. 빈자리 네 곳에 서로 다른 넷이 무작위로 앉아요. 남은 카드를 수백 번 시뮬레이션하는 계산은 모두 같고, **칩을 잃는 걸 얼마나 싫어하는지, 얼마나 자주 허세로 올리는지, 어떤 카드를 공개하는지**가 달라요. 추격자·초반 승부사·막판 승부사는 칩 순위와 라운드에 따라 성향이 바뀌어요.', '그리고 AI는 이번 판에서 **누가 레이즈를 정직하게 했는지** 기억해요. 레이즈한 뒤 쇼다운에서 진 적이 많은 사람의 레이즈는 덜 무섭게 보고, 레이즈할 때마다 이긴 사람의 레이즈는 더 무섭게 봐요. 허세가 잦으면 콜이 늘고, 정직하게만 올리면 AI가 잘 접어요.']),
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '한계 숫자', def: '그 라운드의 목표. 8면체 주사위로 5~12 중 하나가 정해져요.' },
            { term: '선', def: '베팅과 HIT/STAY를 가장 먼저 하는 사람. 라운드마다 한 자리씩 넘어가요.' },
            { term: '기본 베팅', def: '라운드 시작 때 모두 내는 칩. 1칩에서 시작해 점점 커져요.' },
            { term: '팟', def: '그 라운드에 모인 칩 전체. 이긴 사람이 가져가요.' },
            { term: '콜 / 체크', def: '지금 금액에 맞춰 내기. 더 낼 게 없으면 체크예요.' },
            { term: '레이즈', def: '이번 라운드에 낼 총액을 올리기. 상한까지 가능해요.' },
            { term: '포기', def: '이번 라운드에서 빠지기. 이미 낸 칩은 돌려받지 못해요.' },
            { term: 'HIT / STAY', def: '카드 1장 더 받기(공개) / 이번 라운드에는 그만 받기.' },
            { term: '상한', def: '한 사람이 한 라운드에 낼 수 있는 최대 칩. 라운드 시작 때 가장 적은 칩 수예요.' },
            { term: '여유', def: '한계 숫자에서 내 합을 뺀 값. 이 공략에서 HIT를 정할 때 쓰는 말이에요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Hit,Stay(힛스테이)는 어떤 게임인가요?', a: '넷플릭스 「데블스 플랜: 데드 어게인」 준결승 메인매치로 나온 5인 베팅 카드 게임이에요. 카드 합을 한계 숫자(5~12)에 가장 가깝게 맞추고 칩을 걸어, 마지막까지 살아남은 한 명이 1위예요.' },
      { q: '한계를 넘으면 무조건 지나요?', a: '한계 안에 든 사람이 있으면 그 사람이 이겨요. 하지만 남은 사람 모두가 넘었다면 가장 적게 넘은 사람이 팟을 가져가요.' },
      { q: '합이 같으면 누가 이기나요?', a: '카드를 더 많이 가진 쪽이 이겨요. 카드 수까지 같으면 팟을 나누고, 남는 칩은 선에 가장 가까운 동점자가 가져가요.' },
      { q: 'HIT는 몇 번까지 할 수 있나요?', a: 'STAY하기 전까지 차례가 올 때마다 계속할 수 있어요. 모두 STAY하거나 덱이 다 떨어지면 끝나요.' },
      { q: '왜 칩이 많은데 더 걸 수 없나요?', a: '한 라운드에 낼 수 있는 칩은 라운드 시작 때 칩이 가장 적은 사람의 칩 수까지예요. 칩이 적은 사람이 있으면 모두의 판이 작아져요.' },
      { q: '혼자서도 할 수 있나요?', a: '네. AI 4명과 바로 5인전을 할 수 있어요. AI는 모두 최강 실력이고, 베팅 성향만 서로 달라요.' },
    ],
    cta: { title: '한 장 더 받을까요, 멈출까요?', body: '확률표를 옆에 두고 AI 4명과 한 판 해 보세요. 한 라운드는 1분이면 충분해요.', button: 'Hit,Stay 하러 가기' },
    disclaimer: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요. 실제 돈을 거는 도박과는 아무 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Hit,Stay strategy guide — draw odds, the bet cap and chip survival | PUZZLTHINK',
      description: "Hit,Stay from The Devil's Plan: Dead Again, explained in depth: draw odds computed from the 35-card deck, what happens when everyone busts, the card-count tiebreak, the bet cap and ante schedule, and a full round played out.",
      keywords: ['Hit Stay strategy', 'Hit Stay rules', "Devil's Plan Hit Stay", "Devil's Plan 3 semifinal", 'Hit Stay card game', 'Hit Stay odds'],
    },
    title: 'Hit,Stay strategy guide',
    lead: 'The nerve to take one more card and the patience to keep your chips — both can be counted.',
    intro: [
      "Hit,Stay is a five-player betting card game: bring the sum of your number cards as close as you can to the round's limit (5–12) without going over, betting chips twice along the way and surviving until everyone else is out. The deck is a fixed 35 cards and most of what is dealt ends up face up, so you can decide by **counting the cards that are left** rather than by feel.",
      'This guide goes further than the short rules under the table: odds computed from the deck itself, the rulings the summary skips (everyone over the limit, betting that gets skipped), one round followed from the deal to the showdown, beginner to advanced strategy, and notes on the AI and rooms.',
    ],
    gamePageTitle: "Hit,Stay online — The Devil's Plan 3 semifinal main match in your browser",
    summary: 'Draw odds from the 35-card deck, the card-count tiebreak, the bet cap and chip survival, one round played out.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Hit,Stay?',
        blocks: [
          { type: 'p', text: "Hit,Stay appeared as the semifinal main match of Netflix's The Devil's Plan: Dead Again (season 3). Choosing whether to take another card feels like blackjack, but the target changes every round with an eight-sided die and the pot is bet in two stages, which makes it a very different game." },
          { type: 'p', text: 'The biggest difference from blackjack is that **there is no dealer to beat**. Five players fight over one pot, a player who reaches 0 chips is out, and the last one standing wins. Surviving matters more than winning any single round, and every chip another player loses brings you closer to first place.' },
          { type: 'p', text: 'On PUZZLTHINK you can play a five-player table against four AIs right away, or play other people in a friend room (2–5 players) or an open room. The chips have nothing to do with real money.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'table', caption: 'The deck — 35 cards summing to 77, so the average card is 2.2', head: ['Value', '7', '6', '5', '4', '3', '2', '1', '-1'], rows: [['Copies', '1', '2', '3', '4', '5', '6', '7', '7']] },
          { type: 'list', ordered: true, items: [
            '**Start**: five players with 30 chips each. A draw picks the first player of round 1; after that the first seat moves one place along every round (players who are out are skipped).',
            '**Ante**: at the start of each round everyone puts the ante in the pot. It grows over time (table below) but never exceeds **the smallest stack** at the start of the round.',
            '**The limit**: an eight-sided die sets it to 5–12, each with a 12.5% chance.',
            '**Deal and reveal**: the deck is shuffled and everyone gets 3 cards, starting from the first player. Each player turns one of the three face up; the other two stay private until the showdown.',
            '**First bet**: from the first player, call (check when nothing is owed), raise or fold. After a raise everyone else must match it or fold; the betting ends when all remaining bets are equal.',
            '**HIT / STAY**: from the first player, take one more card (HIT) or stop (STAY). Cards taken with HIT are **face up for everyone**. Anyone who has not stayed gets another turn on the next pass; the step ends when everyone has stayed or the deck runs out.',
            '**Second bet**: the same as the first.',
            '**Showdown**: every remaining hand is revealed. The player closest to the limit without going over takes the pot; equal sums go to the player with more cards.',
            '**Elimination**: at 0 chips you are out. The last player left wins.',
          ] },
          { type: 'table', caption: 'Ante by round (capped by the smallest stack)', head: ['Round', '1–2', '3–4', '5–6', '7–8', '9–10', '11–12', '13–14', '15–16', '17–18', '19–20', '21–22'], rows: [['Ante', '1', '2', '3', '4', '5', '6', '7', '8', '13', '18', '23']] },
          { type: 'p', text: 'The ante rises by 1 every two rounds up to round 16, then by 5 every two rounds. The antes of rounds 1–16 alone add up to 72 chips per player, so nobody can survive on a 30-chip stack without winning pots. The longer the game, the harder the ante pushes people out.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rulings',
        blocks: [
          { type: 'cards', items: [
            { title: 'What if everyone goes over?', body: 'If at least one remaining player is within the limit, the winner comes from those players and everyone over ranks below them. But **if every remaining player is over**, the one who went over by the least takes the pot. With a limit of 8 and only 10 and 9 left, 9 wins.' },
            { title: 'Equal sums?', body: 'The player with more cards wins. With a limit of 9, 5+4 (two cards) loses to 3+3+2+1 (four cards). Everyone starts with three, so the tiebreak rewards whoever took more hits.' },
            { title: 'Equal sums and equal card counts?', body: 'The pot is split evenly. Chips that do not divide go to the tied winner met first going around from the first player.' },
            { title: 'Everyone folds?', body: 'As soon as one player is left they take the pot. There is no HIT/STAY or second bet, and their hidden cards are never shown.' },
            { title: 'Rounds with no betting?', body: 'When the ante already reaches the cap (the smallest stack), nobody can raise, so both betting rounds are skipped. This happens often once someone is nearly out.' },
            { title: 'How much can I raise?', body: 'A raise names your total for the round, at least 1 chip above the current bet and at most the cap. The cap follows the smallest stack at the start of the round: with 30 chips you can still only bet 5 if an opponent has 5.' },
            { title: 'Several players out at once?', body: 'Players who hit 0 chips in the same round share the same place. When one player is left, the game ends with them in first place.' },
            { title: 'When is a -1 good?', body: 'There are seven -1s, 20% of the deck. One over the limit, it saves you; it also adds a card for the tiebreak. Sitting exactly on the limit, it moves you one step away.' },
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — one round with a limit of 9',
        lead: 'Round 1, ante 1, everyone on 30 chips. ZERO is first, so the order is ZERO → LEO → MOA → LUNA → you.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Deal and reveal', body: 'The limit is 9. You hold 5, 3, -1 (sum 7) and show the 5. The others show ZERO 2, LEO 6, MOA 1, LUNA 4. The cards you cannot see are the 35 minus your three and the four shown: 28.' },
            { title: 'First bet', body: 'ZERO checks, LEO raises to 3, MOA folds, LUNA calls, you call, ZERO adds 2 to call. The pot is 3 × 4 plus MOA\'s ante: 13. LEO\'s raise behind a 6 looks strong, but a big face-up card also means little room to draw.' },
            { title: 'HIT/STAY, first pass', body: 'ZERO stays; LEO hits and gets a -1 (face up); LUNA stays. Your turn: sum 7, room 2. Of the 27 unseen cards, 16 keep you within 9 (five 2s, six 1s, five -1s): **about 59%**. Exactly 9 needs a 2: five cards, about 19%. LUNA (showing 4) and LEO look high, so 7 probably loses: you hit, draw a 1 and sit on 8 with four cards.' },
            { title: 'HIT/STAY, second pass', body: 'LEO stays. Sum 8, room 1. Of 26 unseen cards only 10 keep you within (five 1s, five -1s), **about 38%**, and the -1s move you away. You stay. Everyone has stopped, so the second bet begins.' },
            { title: 'Second bet', body: 'ZERO checks, LEO raises to 6, LUNA calls, you call, ZERO folds. The pot is 13 + 3 × 3 = 22.' },
            { title: 'Showdown', body: 'LEO had 6, 4, 1 and drew -1: 10, over the limit — the raise was a bluff. LUNA has 4, 3, 1 = 8 with three cards; you have 5, 3, -1, 1 = 8 with four. Equal sums, so **the extra card wins it for you**: 22 chips, a profit of 16 after the 6 you put in.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'What this round shows', text: 'Hitting on 7 meant a 41% chance of going over, but the decision started from "7 will not win". And in the end, a tied sum was won by one extra card. Weighing the chance of going over together with the chance of winning if you stop is the core of Hit,Stay.' },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — decide hits by your room',
        blocks: [
          { type: 'p', text: "Call the limit minus your sum your **room**. The chance that the next card fits in your room follows straight from the deck. The table below assumes no cards are visible (all 35); in a real round, subtract the cards you can see and recount." },
          { type: 'table', caption: 'Chance the next card keeps you within the limit (all 35 cards)', head: ['Room', '0', '1', '2', '3', '4', '5', '6', '7+'], rows: [['Stays within', '20%', '40%', '57%', '71%', '83%', '91%', '97%', '100%']] },
          { type: 'list', items: [
            '**Room 4 or more: usually hit.** The chance of going over is 17% or less. The first three cards average 6.6, so in rounds with a limit of 10–12 you will nearly always take at least one card.',
            '**Room 0–1: stay.** On the limit exactly, even a -1 only moves you away. With room 1 you stay within only about 40% of the time.',
            '**Room 2–3 is the judgment zone.** Ask first whether your current sum can win. If the others show high cards and high hits, draw; if they look low, stop.',
            '**Show your middle card.** Early on, revealing the middle of your three makes your sum hard to guess.',
            '**Fold doubtful hands in the first bet.** Folding costs only the ante. At 0 chips you are out, so early on, small losses and a long life beat brave calls.',
          ] },
          { type: 'callout', tone: 'note', title: 'Over the limit with the first three cards', text: 'Three cards can sum to anything from -3 to 18. With a limit of 5 a hand is already over about 61% of the time; with 8, about 31%; with 12, about 6%. In low-limit rounds many players start over, so simply being within the limit is already an edge.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — narrow down their sums',
        blocks: [
          { type: 'p', text: "The only cards of an opponent you cannot see are their two hidden ones. The shown card and every hit are public, so their sum is \"visible sum + two hidden cards\". The hidden pair ranges from -2 (-1, -1) to 13 (7, 6) but usually lands between 1 and 6; two random cards average 4.4." },
          { type: 'cards', items: [
            { tag: 'Reading', title: 'What hits tell you', body: 'Only players with room keep hitting. A high visible sum that still hits means small hidden cards; a low visible sum that stays means big ones. A 6 shown followed by a stay usually means the hidden pair already filled the gap.' },
            { tag: 'Tiebreak', title: 'Winning on card count', body: 'Equal sums go to more cards, so from room 0, a -1 followed by a 1 keeps your sum and adds two cards. Only aim for it when plenty of 1s and -1s remain and a tie with someone is likely.' },
            { tag: 'Position', title: 'Acting late', body: 'Betting and HIT/STAY both start with the first player. Late seats see everyone else\'s draws before deciding. Bet small when you are first and short on information; when you are last, decide your hit from where the others stopped.' },
            { tag: 'Deck', title: 'Count what is left', body: 'With five players 15 cards are dealt and 20 remain. If the 7 and both 6s are already visible, few big cards are left and hitting is safer. If many 1s and -1s are out, small cards are scarce and hitting with room 1–2 gets riskier.' },
          ] },
          { type: 'h3', text: 'Betting: price against pot' },
          { type: 'p', text: 'To decide a call, compare "chance to win × pot" with "chips to add". With a 20-chip pot and 5 to call, a 20% chance already makes the call break even. But Hit,Stay ends at 0 chips, so the shorter your stack, the more you should prefer the lower-risk line at the same expectation.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — play the cap and the ante',
        blocks: [
          { type: 'h3', text: 'The shortest stack sets the size of every pot' },
          { type: 'p', text: 'Nobody can put in more than the smallest stack at the start of the round. A big stack that wants large pots has to knock the short stack out first. When you are the short stack, simply staying alive keeps everyone\'s bets small, so surviving without forcing fights is a strategy in itself.' },
          { type: 'h3', text: 'From round 17 the ante does the fighting' },
          { type: 'p', text: 'The ante peaks at 8 by round 16, then jumps to 13, 18, 23. Often the ante alone reaches the cap and betting disappears. Only players who banked chips survive this stretch, so if the game looks like it will pass round 16, aim to have more than 30 chips before it does.' },
          { type: 'h3', text: 'Lying with your face-up card' },
          { type: 'p', text: 'The card you reveal is the first clue to your sum. Show a 7 or 6 and opponents assume you are near the limit and back off in the first bet; show a -1 and you look weak, inviting raises. Reveal the same way every time and you will be read quickly, so mix it up.' },
          { type: 'h3', text: 'The hidden chance when everyone is over' },
          { type: 'p', text: 'With a limit of 5 or 6, many hands start over. If every remaining player is over, the least-over hand wins, so being over is not an automatic fold. One over, hit for a -1 (20% of the deck); if the others\' face-up cards suggest they are over too, holding is also an option.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Hitting on odds alone**: a 70% chance of staying within is still a bad hit if your current sum already wins. Look at the others first.',
            '**Calling without counting chips**: calling every raise can cost half your stack in one round, and once you are out, good hands later do not matter.',
            '**Forgetting the -1s**: a fifth of the deck is -1. One over is not over yet — and on the limit exactly, a -1 from a hit hurts.',
            '**Reading a big face-up card as pure strength**: a player showing 6 or 7 goes over with only slightly large hidden cards. A big face-up card also means little room.',
            '**Forgetting the ante schedule**: it jumps from round 17. Without chips banked by then, the ante alone knocks you out.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI, friend rooms, open rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['Against four AIs', 'All AIs play at the same full strength. At every decision they simulate the cards they cannot see hundreds of times from what their seat can see, and they read bets climbing toward the cap as strength. Each has its own betting temperament: some are careful, some bluff now and then. Solo play has no clock for bets or HIT/STAY. Four of ten AIs sit down at random every match; the result screen shows who played which style.'],
            ['Choosing the face-up card', 'Ten seconds in every mode, or a random card of the three is shown. Everyone picks at once, so your clock keeps running when others are done.'],
            ['Friend rooms', '2–5 players join with an invite link or 4-digit code. The host chooses whether AIs fill the empty seats; without AIs at least two people are needed. Bets and HIT/STAY have 30 seconds, with a warning for the last 10.'],
            ['Stepping away', 'If you run out of time in a friend or open room, an AI takes your seat and plays for you until you rejoin, so one idle player cannot stall the table.'],
            ['Open rooms', 'Anyone can join. Signed in, a first place counts as a win in your records, the Hall of Fame and the open-room ranking.'],
            ['Hands viewer', 'Replays who showed what, who hit how many times and how the showdown went this round — useful for reading habits.'],
          ] },
        ],
      },
      personaSection('en', HS_TELLS, ['Hit,Stay started with five AIs and has ten since 27 November; the four empty seats get four different ones at random. The simulation of the unseen cards is the same for all of them; they differ in **how much they hate losing chips, how often they raise on air and which card they show**. The Chaser, the Fast Starter and the Closer change with their chip ranking and the round.', 'The AI also remembers **whose raises were honest** this match. A player whose raises often lost at the showdown gets called more; one whose raises always won gets respect (and folds).']),
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Limit', def: 'The round\'s target, 5–12 from an eight-sided die.' },
            { term: 'First player', def: 'Acts first in both bets and HIT/STAY; moves one seat along every round.' },
            { term: 'Ante', def: 'The chips everyone puts in at the start of a round. Starts at 1 and grows.' },
            { term: 'Pot', def: 'All chips bet this round; the winner takes it.' },
            { term: 'Call / check', def: 'Match the current bet; a check when nothing is owed.' },
            { term: 'Raise', def: 'Raise your total for the round, up to the cap.' },
            { term: 'Fold', def: 'Leave the round; chips already in stay in the pot.' },
            { term: 'HIT / STAY', def: 'Take one more face-up card / stop drawing this round.' },
            { term: 'Cap', def: 'The most anyone may put in this round: the smallest stack at the start of it.' },
            { term: 'Room', def: 'The limit minus your sum; the guide\'s shorthand for deciding a hit.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is Hit,Stay?', a: "A five-player betting card game from the semifinal main match of Netflix's The Devil's Plan: Dead Again. Bring your card sum as close as possible to the limit (5–12), bet chips, and be the last player standing." },
      { q: 'Does going over the limit always lose?', a: 'If anyone remaining is within the limit, they win. If every remaining player is over, the one who went over by the least takes the pot.' },
      { q: 'Who wins on equal sums?', a: 'The player with more cards. If the card count is equal too, the pot is split and any odd chips go to the tied player nearest the first player.' },
      { q: 'How many times can I hit?', a: 'Every time your turn comes until you stay. The step ends when everyone has stayed or the deck runs out.' },
      { q: 'Why can I not bet more when I have lots of chips?', a: 'Nobody can put in more in a round than the smallest stack had at its start. A short stack keeps every pot small.' },
      { q: 'Can I play alone?', a: 'Yes — a five-player table against four AIs. They all play at full strength and differ only in betting temperament.' },
    ],
    cta: { title: 'One more card, or stop?', body: 'Keep the odds table handy and play a table against four AIs. A round takes about a minute.', button: 'Play Hit,Stay' },
    disclaimer: "PUZZLTHINK is an unofficial fan project, not affiliated with The Devil's Plan or Netflix. The programme name is used only to describe the game. It has nothing to do with real-money gambling.",
  },
};

export default guide;
