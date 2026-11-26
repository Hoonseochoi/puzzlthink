// Heavy 13 guide. Rules and numbers follow src/lib/heavy13.ts (PLAYERS 7 with 4–7 in rooms, ROUNDS 14, LIMIT 13,
// FULL_CARDS 0–6 and FULL_CHIPS r2 g2 b2 w1 — so every card and chip is used exactly once per seven rounds —
// placementOrder: rainbow first, then the higher card, ties clockwise from the start player; place: a stand that
// reaches 13 or more hands its old cubes to the placer as penalty and keeps the new cube; pass once a round, passers
// placing in reverse pass order; endRound: the last player penalised that round starts the next, the refill at
// round 8 with the stands kept; ranking: fewer penalties, ties to the older penalty; planSubmissions /
// placementDecision for the AI levels, NORMAL_SLIP 0.5) and src/lib/heavy13Room.ts (submit clock 180/90/60/30 s in
// rooms, PLACE_SEC 20, random submit / auto place on timeout, the AI taking a seat after two misses).
// Heavy13Result.tsx marks places 6–7 as eliminated. Replaces src/components/heavy13/Heavy13Guide.tsx on the game page;
// its order example (start ④) is reused and was re-derived from placementOrder.
import { ChipToken, RockCard, StandMini } from '@/components/heavy13/Bits';
import type { Chip } from '@/lib/heavy13';
import type { GameGuide } from './types';

const STAND_NAME = { ko: { r: '빨강', g: '초록', b: '파랑' }, en: { r: 'Red', g: 'Green', b: 'Blue' } } as const;

/** Seat, chip, card, resulting place in the order — start player ④. */
const ORDER: [string, Chip, number, number][] = [
  ['①', 'r', 6, 2], ['②', 'b', 5, 6], ['③', 'r', 5, 7], ['④', 'r', 5, 3], ['⑤', 'g', 6, 1], ['⑥', 'b', 5, 4], ['⑦', 'g', 5, 5],
];
const orderFigure = (label: string) => (
  <div role="img" aria-label={label} className="grid grid-cols-7 gap-1.5 sm:gap-3">
    {ORDER.map(([seat, chip, card, order]) => (
      <div key={seat} className="flex flex-col items-center gap-1.5 text-center">
        <span className={`text-xs font-black ${seat === '④' ? 'text-[#e6c48a]' : 'text-white/60'}`}>{seat}{seat === '④' ? '★' : ''}</span>
        <ChipToken chip={chip} size={18} />
        <RockCard value={card} size="sm" />
        <span className="rounded-full bg-white/10 px-1.5 font-mono text-[10px] font-black">#{order}</span>
      </div>
    ))}
  </div>
);
const collapseFigure = (lang: 'ko' | 'en') => (
  <div className="flex items-end justify-center gap-3">
    <StandMini color="r" cubes={[6, 5]} label={STAND_NAME[lang].r} />
    <span className="pb-10 text-white/40">+</span>
    <RockCard value={5} />
    <span className="pb-10 text-white/40">→</span>
    <StandMini color="r" cubes={[5]} label={STAND_NAME[lang].r} glow />
  </div>
);
const standsFigure = (lang: 'ko' | 'en') => (
  <div className="flex items-end justify-center gap-3">
    <StandMini color="r" cubes={[5]} label={STAND_NAME[lang].r} />
    <StandMini color="g" cubes={[6, 5]} label={STAND_NAME[lang].g} />
    <StandMini color="b" cubes={[5, 5]} label={STAND_NAME[lang].b} />
  </div>
);

const guide: GameGuide = {
  game: 'heavy13',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['russianRoulette', 'hitStay', 'piggyBank', 'hexagon'],
  ko: {
    meta: {
      title: '무거운 13 공략 — 배치 순서, 패스, 0과 레인보우 쓰는 법 | PUZZLTHINK',
      description: '데블스 플랜 3 감옥매치 무거운 13 공략. 배치 순서 정하는 법, 13 이상에서 무너지는 받침대, 패스의 역순 배치, 반마다 카드와 칩을 한 번씩 다 쓰는 구조, 받침대별 안전한 카드 계산, 실제 라운드 따라가기, AI 난이도까지 정리했어요.',
      keywords: ['무거운 13 공략', '무거운13 공략', '무거운 13 규칙', '데블스 플랜 무거운 13', '데블스플랜 감옥매치', '데블스 플랜 3 무거운 13', '무거운 13 전략', 'Heavy 13'],
    },
    title: '무거운 13 공략',
    lead: '받침대 셋, 한계 13. 무너뜨린 사람이 쌓인 바위를 떠안아요.',
    intro: [
      '무거운 13은 7명이 빨강·초록·파랑 세 받침대에 0~6 무게의 바위를 올리다가, **합이 13 이상이 되게 만든 사람이 그동안 쌓인 바위를 벌점으로 떠안는** 게임이에요. 모두가 카드와 칩을 동시에 몰래 내고, 공개된 뒤 정해진 순서대로 올리기 때문에, 숫자 계산보다 "남들이 어디에 낼까"를 읽는 눈치 싸움이 핵심이에요.',
      '이 공략에서는 배치 순서 규칙과 패스, 반(7라운드)마다 카드와 칩을 정확히 한 번씩 다 쓰는 구조, 받침대 합으로 안전한 카드를 세는 법, 실제 한 라운드를 따라가는 예시, 단계별 전략과 AI·친구 방 메모를 다뤄요.',
    ],
    gamePageTitle: '무거운 13 — 데블스플랜 감옥매치를 웹에서',
    summary: '배치 순서와 역순 패스, 반마다 다 쓰는 카드와 칩, 받침대별 안전한 카드 계산.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '무거운 13은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '무거운 13은 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3)의 첫 감옥매치로 등장한 7인 게임이에요. PUZZLTHINK에서는 AI 6명과 바로 하거나, 친구 방에서 4~7명으로 할 수 있고 빈자리는 AI로 채울 수 있어요.' },
          { type: 'p', text: '각자 고른 줄에 숫자를 놓고 한계를 넘긴 사람이 벌점을 떠안는다는 점에서 카드 게임 젝스님트(6 nimmt!)를 떠올리게 해요. 다만 무거운 13은 카드 장수가 아니라 **무게의 합**으로 무너지고, 선 플레이어·레인보우 칩·패스 덕분에 순서를 내가 어느 정도 조절할 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**준비물**: 각자 0~6 바위 카드 7장, 빨강·초록·파랑 칩 2개씩, 레인보우 칩 1개를 받아요.',
            '**동시 제출**: 라운드마다 모두 카드 1장과 칩 1개를 몰래 동시에 내요. 칩은 받침대 색, 카드는 올릴 바위 무게예요. 모두 낼 때까지 아무것도 공개되지 않아요.',
            '**배치 순서**: 공개 뒤 레인보우 칩을 낸 사람이 가장 먼저, 그다음은 높은 숫자 순서예요. 같은 등급끼리는 선 플레이어부터 시계 방향이에요.',
            '**배치**: 순서대로 바위를 받침대에 올려요. 레인보우를 낸 사람은 받침대 색을 직접 골라요.',
            '**무너짐**: 올려서 합이 13 이상이 되면, 원래 있던 바위가 모두 수거되어 그 개수만큼 벌점을 받아요. 방금 올린 바위 1개는 받침대에 홀로 남아요.',
            '**패스**: 자기 차례에 라운드당 한 번 패스할 수 있어요. 패스한 사람은 다른 모두가 놓은 뒤에, **먼저 패스한 사람이 더 나중에** 놓아요.',
            '**다음 선**: 그 라운드에 마지막으로 벌점을 받은 사람이 다음 라운드의 선이에요(그 라운드에 벌점이 없었다면 가장 최근에 벌점을 받은 사람).',
            '**재지급**: 7라운드가 끝나면 카드와 칩을 다시 받아요. 받침대의 바위는 그대로 이어져요. 모두 14라운드예요.',
            '**순위**: 벌점이 적을수록 높아요. 같으면 더 최근에 벌점을 받은 사람이 아래예요. 1위가 승리하고 6·7위는 탈락이에요.',
          ] },
          { type: 'figure', node: orderFigure('배치 순서 예시: 선 플레이어 ④'), caption: '배치 순서 예시. ④가 선(★)일 때, 6을 낸 ⑤와 ①이 먼저(④에서 시계 방향으로 가까운 ⑤가 1번), 그다음 5를 낸 다섯 명이 ④부터 시계 방향으로 순서를 받아요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'figure', node: collapseFigure('ko'), caption: '빨강 받침대에 6과 5(합 11)가 있을 때 5를 올리면 16이 돼요. 원래 있던 바위 2개를 수거해 벌점 2, 방금 올린 5는 홀로 남아요.' },
          { type: 'cards', items: [
            { title: '0은 무너뜨릴 수 있나요?', body: '아니요. 받침대 합은 언제나 12 이하라, 0을 올려도 13이 되지 않아요. 0은 완전히 안전한 카드예요. 대신 바위 개수를 하나 늘려서, 다음에 무너뜨리는 사람의 벌점을 1 키워요.' },
            { title: '빈 받침대에서 무너질 수 있나요?', body: '아니요. 가장 무거운 바위가 6이라 빈 받침대에 무엇을 올려도 13이 되지 않아요. 수거할 바위도 없으니 벌점도 없어요.' },
            { title: '패스는 몇 번 되나요?', body: '라운드당 한 번이에요. 패스한 사람들이 역순으로 놓는 동안에는 다시 패스할 수 없어요.' },
            { title: '레인보우 둘 이상이면?', body: '레인보우끼리는 높은 숫자가 먼저, 숫자도 같으면 선부터 시계 방향이에요. 레인보우를 낸 사람은 모두 숫자 칩을 낸 사람보다 먼저 놓아요.' },
            { title: '8라운드에 무엇이 바뀌나요?', body: '카드 7장과 칩 7개를 새로 받아요. 받침대 위 바위는 그대로라, 새 패의 첫 라운드부터 무거운 받침대가 있을 수 있어요.' },
            { title: '벌점이 같으면?', body: '더 최근에 벌점을 받은 사람이 아래예요. 벌점을 한 번도 받지 않은 사람이 가장 유리해요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 받침대의 여유 세기',
        blocks: [
          { type: 'p', text: '받침대 합이 s일 때, 혼자 올린다면 **12 − s 이하**의 카드는 안전해요. 합 11이면 0과 1만, 합 10이면 0~2, 합 6 이하면 어떤 카드도 혼자서는 무너뜨리지 않아요. 문제는 나 혼자 올리지 않는다는 거예요. 같은 받침대에 나보다 먼저 놓는 사람의 무게가 더해져요.' },
          { type: 'table', caption: '받침대 합별로 혼자 올려도 안전한 카드', head: ['받침대 합', '0~6', '7', '8', '9', '10', '11', '12'], rows: [['안전한 카드', '전부', '0~5', '0~4', '0~3', '0~2', '0~1', '0']] },
          { type: 'list', items: [
            '**순서를 먼저 계산하기**: 큰 숫자를 낼수록 먼저 놓아요. 먼저 놓으면 받침대가 덜 쌓인 상태라 안전하지만, 앞사람이 비운 받침대에 들어갈 기회도 없어요.',
            '**0은 아껴 두기**: 0은 한 반에 한 장뿐이고 절대 무너뜨리지 않아요. 세 받침대가 모두 위험한 라운드를 위해 남겨 두세요.',
            '**레인보우도 아껴 두기**: 한 반에 한 번, 가장 먼저 놓고 색까지 고를 수 있는 칩이에요. 초반에 쓰면 후반의 위험한 라운드에 피할 수단이 없어요.',
            '**벌점 1은 괜찮아요**: 바위가 하나뿐인 받침대를 무너뜨리면 벌점 1이에요. 바위가 많이 쌓인 받침대를 피하는 게 우선이에요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 위 예시의 1라운드',
        lead: '받침대는 모두 비어 있고, 배치 순서는 위 그림과 같아요(⑤ → ① → ④ → ⑥ → ⑦ → ② → ③).',
        blocks: [
          { type: 'steps', items: [
            { title: '#1 ⑤ 초록 6, #2 ① 빨강 6', body: '빈 받침대라 안전해요. 초록 6, 빨강 6.' },
            { title: '#3 ④ 빨강 5', body: '빨강 6 + 5 = 11. 아직 13이 안 돼요. 빨강은 이제 0과 1만 안전한 받침대가 됐어요.' },
            { title: '#4 ⑥ 파랑 5, #5 ⑦ 초록 5, #6 ② 파랑 5', body: '파랑 5, 초록 6 + 5 = 11, 파랑 5 + 5 = 10. 모두 무사해요.' },
            { title: '#7 ③ 빨강 5 → 무너짐', body: '빨강 11 + 5 = 16. ③이 원래 있던 바위 2개를 떠안아 벌점 2, 빨강에는 5만 남아요. ③은 맨 마지막이라 패스해도 순서가 바뀌지 않아요.' },
            { title: '만약 ④가 패스했다면', body: '④가 #3에서 패스하면 ⑥·⑦·②가 놓은 뒤 ③이 빨강 6 위에 5를 올려 11이 되고, 마지막에 ④가 5를 올려 16, 이번엔 ④가 벌점 2를 받아요. 앞에서 받침대가 비워질 일이 없을 때의 패스는 손해예요.' },
          ] },
          { type: 'figure', node: standsFigure('ko'), caption: '1라운드 뒤: 빨강 5, 초록 11(바위 2), 파랑 10(바위 2). 다음 라운드 선은 벌점을 받은 ③이에요.' },
          { type: 'callout', tone: 'tip', title: '2라운드는 어디가 붐빌까', text: '초록은 0·1, 파랑은 0~2만 안전해요. 그래서 대부분 빨강으로 몰릴 거예요. 빨강은 5라 혼자서는 무엇을 올려도 괜찮지만, 여러 명이 몰리면 금방 13을 넘어요. 이럴 때 큰 숫자를 빨강에 내서 일찍 놓거나, 다들 빨강으로 갈 거라 보고 파랑에 2를 내는 식의 눈치 싸움이 시작돼요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 모두의 남은 패를 세기',
        blocks: [
          { type: 'p', text: '카드 0~6 일곱 장과 칩 일곱 개(빨강·초록·파랑 2개씩, 레인보우 1개)는 **한 반(7라운드) 동안 정확히 한 번씩 다 써요**. 그리고 낸 카드와 칩은 매 라운드 공개되니, 다른 사람이 무엇을 남겼는지 언제나 알 수 있어요. 반이 끝나 갈수록 모두의 선택지가 줄어들어, 7라운드와 14라운드에는 모든 사람의 카드와 칩이 이미 정해져 있어요.' },
          { type: 'cards', items: [
            { tag: '세기', title: '색 칩이 떨어진 사람', body: '빨강 칩 두 개를 다 쓴 사람은 그 반에 다시 빨강에 올 수 없어요(레인보우가 남았다면 예외). 위험한 받침대 색의 칩을 몇 명이 아직 갖고 있는지 세면, 그 받침대가 붐빌지 알 수 있어요.' },
            { tag: '세기', title: '큰 숫자가 남은 사람', body: '6과 5를 아직 쥔 사람은 다음 라운드에 앞 순서로 올 수 있어요. 큰 숫자가 다 빠진 반 후반에는 작은 숫자끼리 순서를 다퉈서, 선 플레이어 위치가 중요해져요.' },
            { tag: '패스', title: '높게 내고 패스하기', body: '큰 숫자를 내면 앞 순서가 되지만 패스하면 맨 뒤로 가요. 앞사람이 받침대를 한 번 무너뜨려 비워 준 뒤에 들어가는 노림수예요. 위 예시처럼 아무도 비워 주지 않으면 오히려 손해예요.' },
            { tag: '선', title: '선 자리의 의미', body: '같은 숫자끼리는 선부터 순서를 받아요. 벌점을 받으면 다음 라운드 선이 되니, 벌점 1을 받는 대신 다음 라운드의 순서 우선권을 얻는 셈이에요.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 받침대를 설계하기',
        blocks: [
          { type: 'h3', text: '12로 꽉 채우기 vs 여유 두기' },
          { type: 'p', text: '받침대를 12로 꽉 채우면 0 말고는 아무도 그쪽에 가지 않아서, 다른 두 받침대의 경쟁이 치열해져요. 반대로 1~2쯤 여유를 남기면 "나 혼자 1을 내면 괜찮겠지" 하는 사람들이 몰려 서로 무너뜨려요. 그 색 칩을 내가 이미 다 써서 더 갈 일이 없다면 꽉 막아 남들끼리 싸우게 하고, 아직 갈 일이 있다면 여유를 남겨 두세요.' },
          { type: 'h3', text: '0으로 벌점 키우기' },
          { type: 'p', text: '0은 합을 늘리지 않지만 바위 개수는 늘려요. 곧 무너질 받침대에 0을 올리면 나는 안전하고, 다음에 무너뜨리는 사람의 벌점이 1 늘어요. 순위가 벌점 차이로 갈리는 후반에는 이 1점이 커요.' },
          { type: 'h3', text: '8라운드와 14라운드' },
          { type: 'p', text: '8라운드에는 모두가 새 패를 받지만 받침대는 무거운 채로 이어져요. 새 패의 첫 라운드부터 0이나 레인보우를 꺼내야 할 수도 있어요. 반대로 14라운드는 모두의 카드와 칩이 정해져 있어서, 배치 순서와 결과를 미리 끝까지 계산할 수 있어요. 남은 건 패스할지와 레인보우 색 선택뿐이에요.' },
          { type: 'h3', text: '레인보우와 패스의 조합' },
          { type: 'p', text: '레인보우는 가장 먼저 놓는 권리지만, 낮은 숫자와 함께 내고 패스하면 맨 마지막에 받침대 상태를 다 보고 가장 안전한 색을 고를 수 있어요. 앞사람들이 받침대를 무너뜨려 비워 놓았다면 그곳에 들어가면 돼요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**순서를 계산하지 않고 내기**: 같은 받침대에 나보다 먼저 놓는 사람의 무게가 더해져요. 큰 숫자를 낸 사람이 먼저라는 걸 잊지 마세요.',
            '**아무도 비워 주지 않는데 패스하기**: 패스는 뒤로 가는 것뿐이에요. 앞에서 그 받침대가 무너질 일이 없으면 더 무거운 상태에서 놓게 돼요.',
            '**0과 레인보우를 초반에 쓰기**: 한 반에 한 번뿐이에요. 7라운드쯤 세 받침대가 모두 위험할 때 남아 있어야 해요.',
            '**8라운드의 받침대를 잊기**: 패는 새로 받아도 받침대는 그대로예요.',
            '**벌점 동점 규칙을 잊기**: 같은 벌점이면 최근에 받은 사람이 아래예요. 마지막 라운드의 벌점 1은 순위를 크게 바꿀 수 있어요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 6명과', '혼자 하면 AI 6명과 7인전을 해요. 제출과 배치에 시간 제한이 없어요. AI는 다른 사람의 비공개 제출을 보지 않고, 공개된 남은 패만으로 판단해요.'],
            ['쉬움', '카드와 칩을 무작위로 내고, 패스하지 않아요.'],
            ['보통', '절반은 무작위로 내고, 나머지는 어려움처럼 계산해요.'],
            ['어려움', '다른 사람들이 무엇을 낼지 먼저 예측한 뒤, 그 예측에 맞서 라운드를 여러 번 시뮬레이션해서 벌점이 가장 적은 선택을 골라요. 0과 레인보우는 반 후반까지 아끼는 편이고, 배치 때는 패스와 레인보우 색까지 끝까지 계산해요.'],
            ['친구 방', '초대 링크로 4~7명이 함께하고, 빈자리 AI를 켜면 AI가 채워요. 끄면 고른 인원이 다 모여야 시작해요. 제출 시간은 방장이 180·90·60·30초 중에서 고르고, 배치 차례는 20초예요. 시간이 지나면 무작위로 제출되거나 자동으로 놓이고, 두 번 연속이면 AI가 그 자리를 이어받아요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '받침대', def: '빨강·초록·파랑 세 곳. 바위 무게의 합이 13 이상이 되면 무너져요.' },
            { term: '바위 카드', def: '0~6 무게. 한 반에 각 숫자를 한 번씩 써요.' },
            { term: '레인보우 칩', def: '한 반에 하나. 가장 먼저 놓고 받침대 색을 직접 골라요.' },
            { term: '무너짐', def: '합이 13 이상이 되는 것. 원래 있던 바위 수만큼 벌점, 새 바위는 남아요.' },
            { term: '패스', def: '라운드당 한 번, 내 배치를 맨 뒤로 미루기. 먼저 패스한 사람이 더 나중에 놓아요.' },
            { term: '선 플레이어', def: '같은 등급끼리의 순서 기준. 직전 라운드에 마지막으로 벌점을 받은 사람이에요.' },
            { term: '반', def: '7라운드. 반이 끝나면 카드와 칩을 다시 받아요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '7명이 다 모여야 하나요?', a: '아니요. 혼자서는 AI 6명과 하고, 친구 방에서는 총 4~7명을 고를 수 있어요. 빈자리 AI를 끄면 고른 인원이 다 모인 뒤 친구들끼리만 시작해요.' },
      { q: '다른 사람이 낸 카드를 미리 볼 수 있나요?', a: '아니요. 모두가 낼 때까지 칩과 카드는 공개되지 않아요. 다만 지난 라운드에 낸 것은 모두 공개되니 남은 패는 셀 수 있어요.' },
      { q: '0을 올리면 무너질 수 있나요?', a: '아니요. 받침대 합은 항상 12 이하라 0으로는 13이 될 수 없어요. 대신 바위 개수가 늘어 다음에 무너뜨리는 사람의 벌점이 커져요.' },
      { q: '패스하면 언제 놓나요?', a: '패스하지 않은 사람이 모두 놓은 뒤, 패스한 순서의 반대로 놓아요. 먼저 패스한 사람이 가장 마지막이에요.' },
      { q: '시간 안에 못 내면 어떻게 되나요?', a: '친구 방에서 제출 시간이 끝나면 남은 카드와 칩 중에서 무작위로 내고, 배치 차례에 20초가 지나면 자동으로 놓아요. 두 번 연속이면 AI가 대신해요.' },
      { q: '무료인가요?', a: '네, 모든 게임은 무료예요.' },
    ],
    cta: { title: '어느 받침대에 올릴까요?', body: '받침대 합과 배치 순서를 세면서 AI 6명과 한 판 해 보세요.', button: '무거운 13 하러 가기' },
    disclaimer: 'PUZZLTHINK는 데블스 플랜 및 관련 방송사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요.',
  },
  en: {
    meta: {
      title: 'Heavy 13 strategy guide — placement order, passing, the 0 and the rainbow | PUZZLTHINK',
      description: "Heavy 13 from The Devil's Plan: Dead Again prison match, in depth: how placement order works, stands collapsing at 13, passers placing in reverse, every card and chip used once per half, safe cards by stand total, a round played out and the AI levels.",
      keywords: ['Heavy 13 strategy', 'Heavy 13 rules', "Devil's Plan Heavy 13", "Devil's Plan prison match", 'Heavy 13 game'],
    },
    title: 'Heavy 13 strategy guide',
    lead: 'Three stands, a limit of 13 — and whoever topples one takes the rocks.',
    intro: [
      'In Heavy 13, seven players load rocks weighing 0–6 onto red, green and blue stands, and **whoever brings a stand to 13 or more takes the rocks already on it as penalty**. Everyone picks a card and a chip secretly and at the same time, then places in a fixed order once they are revealed, so the game is less about arithmetic than about reading where everyone else will go.',
      'This guide covers the placement order and passing, the fact that every card and chip is used exactly once per half (seven rounds), counting safe cards from a stand\'s total, one round followed step by step, strategy by level and notes on the AI and friend rooms.',
    ],
    gamePageTitle: "Heavy 13 — The Devil's Plan prison match, on the web",
    summary: 'Placement order and reverse passing, a hand used up each half, safe cards by stand total.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Heavy 13?',
        blocks: [
          { type: 'p', text: "Heavy 13 appeared as the first prison match of Netflix's The Devil's Plan: Dead Again (season 3), a seven-player game. On PUZZLTHINK you can play six AIs right away, or play with 4–7 people in a friend room with AIs filling empty seats if you like." },
          { type: 'p', text: 'Placing numbers into rows and penalising whoever crosses a threshold recalls the card game 6 nimmt!. But Heavy 13 collapses on the **sum of the weights**, not the number of cards, and the start player, the rainbow chip and passing let you control the order to a degree.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Kit**: everyone gets seven rock cards 0–6, two chips each of red, green and blue, and one rainbow chip.',
            '**Simultaneous pick**: each round everyone secretly plays one card and one chip. The chip is the stand colour, the card the rock\'s weight. Nothing is revealed until all have played.',
            '**Placement order**: rainbow chips go first, then higher cards. Within a tier, clockwise from the start player.',
            '**Placing**: in order, rocks go onto stands. A rainbow player chooses the stand colour.',
            '**Collapse**: if a rock brings a stand to 13 or more, the rocks already there are collected and their count is your penalty. The rock just placed stays on the stand alone.',
            '**Pass**: once per round, on your turn, you may pass. Passers place after everyone else, **the first to pass placing last**.',
            '**Next start player**: whoever was penalised last in the round (if nobody was, the most recently penalised player).',
            '**Refill**: after round 7 everyone gets a fresh hand of cards and chips; the rocks on the stands stay. Fourteen rounds in all.',
            '**Ranking**: fewer penalties rank higher; on a tie, the more recent penalty ranks lower. First place wins; places 6 and 7 are eliminated.',
          ] },
          { type: 'figure', node: orderFigure('Placement order example: start player ④'), caption: 'Placement order example. With ④ as start player (★), the two 6s go first (⑤, nearer clockwise from ④, is #1), then the five 5s take turns clockwise from ④.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rulings',
        blocks: [
          { type: 'figure', node: collapseFigure('en'), caption: 'Red holds 6 and 5 (11). A 5 makes 16: the two rocks are collected for a 2-point penalty and the new 5 stays alone.' },
          { type: 'cards', items: [
            { title: 'Can a 0 topple a stand?', body: 'No. A stand never holds more than 12, so a 0 cannot reach 13. The 0 is perfectly safe — but it adds a rock, raising the next toppler\'s penalty by 1.' },
            { title: 'Can an empty stand collapse?', body: 'No. The heaviest rock is 6, so nothing placed on an empty stand reaches 13, and there would be nothing to collect anyway.' },
            { title: 'How often can I pass?', body: 'Once per round, and not while the passers are being placed.' },
            { title: 'Two or more rainbows?', body: 'Among rainbows the higher card goes first, then clockwise from the start player. Every rainbow places before every coloured chip.' },
            { title: 'What changes in round 8?', body: 'Everyone gets seven new cards and seven new chips, but the stands keep their rocks, so a new hand can open on heavy stands.' },
            { title: 'Equal penalties?', body: 'The more recent penalty ranks lower. Never being penalised at all is best.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — count each stand\'s room',
        blocks: [
          { type: 'p', text: 'With a stand at total s, any card of **12 − s or less** is safe if you are alone there. At 11 only 0 and 1 are safe; at 10, 0–2; at 6 or less, nothing you place alone will topple it. The catch is that you are rarely alone: everyone placing on that stand before you adds their weight.' },
          { type: 'table', caption: 'Cards that are safe on their own, by stand total', head: ['Stand total', '0–6', '7', '8', '9', '10', '11', '12'], rows: [['Safe cards', 'all', '0–5', '0–4', '0–3', '0–2', '0–1', '0']] },
          { type: 'list', items: [
            '**Work out the order first.** Higher cards place earlier, onto a lighter stand — but then nobody ahead of you can empty it for you.',
            '**Save your 0.** You have one per half and it never topples anything. Keep it for the round when all three stands are dangerous.',
            '**Save the rainbow too.** Once per half, it places first and picks the colour. Spend it early and you have no escape later.',
            '**A 1-point penalty is fine.** Toppling a stand with one rock costs 1. Avoiding the stands with many rocks matters more.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — round 1 of the example above',
        lead: 'All stands start empty; the order is as in the figure (⑤ → ① → ④ → ⑥ → ⑦ → ② → ③).',
        blocks: [
          { type: 'steps', items: [
            { title: '#1 ⑤ green 6, #2 ① red 6', body: 'Empty stands, so both are safe: green 6, red 6.' },
            { title: '#3 ④ red 5', body: 'Red 6 + 5 = 11, still under 13. Red is now safe only for 0 and 1.' },
            { title: '#4 ⑥ blue 5, #5 ⑦ green 5, #6 ② blue 5', body: 'Blue 5, green 6 + 5 = 11, blue 5 + 5 = 10. All safe.' },
            { title: '#7 ③ red 5 → collapse', body: 'Red 11 + 5 = 16. ③ collects the two rocks for 2 points and red is left with the 5. ③ is last anyway, so passing would change nothing.' },
            { title: 'What if ④ had passed?', body: 'If ④ passes at #3, ⑥, ⑦ and ② place, ③ puts a 5 on red 6 for 11, and ④ comes last: 16, and now ④ takes 2. Passing when nobody ahead will empty the stand only costs you.' },
          ] },
          { type: 'figure', node: standsFigure('en'), caption: 'After round 1: red 5, green 11 (two rocks), blue 10 (two rocks). ③, penalised, starts round 2.' },
          { type: 'callout', tone: 'tip', title: 'Where will round 2 crowd?', text: 'Green is safe only for 0 and 1, blue for 0–2, so most players will head for red. At 5, red is safe for any single card, but a crowd tops 13 quickly. This is where the reading starts: play a big card on red to place early, or expect the crowd on red and slip a 2 onto blue.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — count everyone\'s remaining hand',
        blocks: [
          { type: 'p', text: 'Your seven cards (0–6) and seven chips (two each of red, green, blue and one rainbow) are **each used exactly once per half**. Everything played is revealed each round, so you always know what everyone has left. Choices shrink as the half goes on, and in rounds 7 and 14 everyone\'s card and chip are already fixed.' },
          { type: 'cards', items: [
            { tag: 'Counting', title: 'Who is out of a colour', body: 'Someone who has used both red chips cannot come to red again this half (unless their rainbow is left). Count how many players still hold the dangerous stand\'s colour to see whether it will crowd.' },
            { tag: 'Counting', title: 'Who still holds big cards', body: 'Players holding 6 and 5 can place early next round. Late in a half, with the big cards gone, small cards fight over the order and the start seat matters more.' },
            { tag: 'Passing', title: 'Play high, then pass', body: 'A big card puts you early, but a pass sends you to the back: a play for entering after someone ahead has toppled and emptied the stand. As in the example, if nobody empties it, it backfires.' },
            { tag: 'Start seat', title: 'What the start seat is worth', body: 'Ties are ordered from the start player, and a penalty makes you start player next round — a 1-point penalty buys you priority in the next order.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — shaping the stands',
        blocks: [
          { type: 'h3', text: 'Fill to 12, or leave room?' },
          { type: 'p', text: 'A stand at 12 takes only zeros, so the fight moves to the other two. Leaving 1–2 of room instead lures players who think "a 1 alone will be fine" into toppling each other. If you have no chips of that colour left, block it at 12 and let the others fight; if you still need it, leave room.' },
          { type: 'h3', text: 'Use the 0 to raise penalties' },
          { type: 'p', text: 'A 0 adds no weight but adds a rock. On a stand about to fall it keeps you safe and raises the next toppler\'s penalty by one — a point that matters late, when rankings are decided by small gaps.' },
          { type: 'h3', text: 'Rounds 8 and 14' },
          { type: 'p', text: 'In round 8 everyone has a fresh hand but the stands are still heavy, so you may need your 0 or rainbow straight away. In round 14 every card and chip is fixed, so the order and outcome can be calculated to the end; only passes and rainbow colours remain to decide.' },
          { type: 'h3', text: 'Rainbow plus pass' },
          { type: 'p', text: 'The rainbow normally places first, but played with a low card and followed by a pass, it lets you choose the safest colour at the very end, after seeing every stand. If someone ahead has toppled a stand, step into the emptied one.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Playing without working out the order**: everyone placing before you on that stand adds weight. Higher cards go first.',
            '**Passing when nobody will empty the stand**: passing only moves you back; the stand will be heavier when you get there.',
            '**Spending the 0 and rainbow early**: one each per half. You want them when all three stands are dangerous around round 7.',
            '**Forgetting round 8\'s stands**: the hand is new, the stands are not.',
            '**Forgetting the tiebreak**: equal penalties rank the more recent one lower. A 1-point penalty in the last round can swing your place.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['Six AIs', 'Solo play is a seven-player table with six AIs and no clock. The AIs never see anyone\'s secret pick; they use only the public remaining hands.'],
            ['Easy', 'Plays a random card and chip and never passes.'],
            ['Normal', 'Half the time plays at random, otherwise calculates like Hard.'],
            ['Hard', 'Forecasts what everyone else is likely to play, then simulates the round against that forecast many times and takes the choice with the fewest penalties. Tends to save the 0 and rainbow for late in the half, and calculates passes and rainbow colours to the end of the round.'],
            ['Friend rooms', '4–7 players by invite link; with AI fill on, AIs take empty seats, otherwise the chosen number of people must gather. The host picks 180, 90, 60 or 30 seconds to pick; placing has 20 seconds. Timeouts pick at random or place automatically, and two in a row hand your seat to the AI.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Stand', def: 'Red, green or blue. It collapses when its weight reaches 13 or more.' },
            { term: 'Rock card', def: 'A weight from 0 to 6; each is used once per half.' },
            { term: 'Rainbow chip', def: 'One per half: places first and chooses its colour.' },
            { term: 'Collapse', def: 'A stand reaching 13+: penalty equal to the rocks already there; the new rock stays.' },
            { term: 'Pass', def: 'Once a round, move your placement to the back; the first to pass places last.' },
            { term: 'Start player', def: 'Where tie-ordering starts: the last player penalised in the previous round.' },
            { term: 'Half', def: 'Seven rounds; hands are refilled after each.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Do I need seven people?', a: 'No. Solo play uses six AIs, and friend rooms take 4–7 players. Turn AI fill off to start only when the chosen number of friends have joined.' },
      { q: 'Can I see what others played before placing?', a: 'Not before everyone has picked. But everything played in past rounds is public, so remaining hands can be counted.' },
      { q: 'Can a 0 topple a stand?', a: 'No — stands never hold more than 12, so a 0 cannot reach 13. It does add a rock, raising the next toppler\'s penalty.' },
      { q: 'When do passers place?', a: 'After everyone who did not pass, in reverse pass order: the first to pass places last.' },
      { q: 'What if I run out of time?', a: 'In friend rooms a pick is made at random from your remaining cards and chips, and after 20 seconds of placing your rock is placed automatically. Two misses in a row hand your seat to the AI.' },
      { q: 'Is it free?', a: 'Yes, every game is free.' },
    ],
    cta: { title: 'Which stand will you load?', body: 'Count stand totals and the placement order, and play a table with six AIs.', button: 'Play Heavy 13' },
    disclaimer: "PUZZLTHINK is an unofficial fan project, not affiliated with The Devil's Plan or its broadcaster. The programme name is used only to describe the game.",
  },
};

export default guide;
