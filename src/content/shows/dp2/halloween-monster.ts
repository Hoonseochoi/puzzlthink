import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'halloween-monster',
  kind: 'main',
  when: { ko: '3일차', en: 'Day 3' },
  related: ['heavy13', 'hitStay', 'piggyBank'],
  updated: '2026-11-26',
  sources: [namuDay(3), broadcast],
  ko: {
    meta: {
      title: '핼러윈 몬스터 규칙 — 데블스플랜2(데스룸) 3일차 메인매치, 막타를 노리는 몬스터 사냥',
      description: '데블스 플랜: 데스룸(데블스플랜2) 3일차 메인매치 핼러윈 몬스터의 규칙을 정리했어요. 동맹 맺기, 승점 양도, 승점 순 공격 순서, 전장과 대기열, 무기 카드와 마지막 일격, 스카우터와 순서 바꾸기, 동맹 점수 나누기까지.',
      keywords: ['핼러윈 몬스터', '할로윈 몬스터', '데블스플랜2 핼러윈 몬스터', '데블스 플랜 데스룸 3일차', '데블스플랜2 메인매치'],
    },
    title: '핼러윈 몬스터 — 데블스플랜2 3일차 메인매치',
    name: '핼러윈 몬스터',
    lead: '몬스터를 쓰러뜨린 사람이 보상을 가져가요. 정확히는, 마지막 한 방을 친 사람이요.',
    summary: '전장의 몬스터를 공격해 마지막 일격을 넣은 사람이 승점과 전리품을 가져가는 사냥 게임. 동맹은 끝에 점수를 나눠요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 셋째 날 생존자 전원.',
        '**지급품**: 승점 5점과 기본 무기 카드 "단검".',
        '**몬스터**: 화면에 전장(이중 실선 안)과 대기열이 나오고, 몬스터마다 승점(♥ 숫자, 곧 생명력)과 전리품(피스, 특수 무기 카드)이 달라요.',
        '**동맹**: 시작 전 60분 동안, 최대 3명이 함께 딜러룸에 들어가 동맹을 맺을 수 있어요. 한 동맹에만, 취소할 수 없어요. 맺지 않으면 솔로 플레이어예요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '승점 양도 (20분)', body: '동맹끼리 딜러룸에서 서로 승점을 넘길 수 있어요. 넘긴 뒤에도 최소 1점은 남아야 해요.' },
        { title: '공격 순서', body: '승점이 높은 사람부터 공격해요. 같으면 추첨하고, 2라운드부터는 같은 승점이면 지난 라운드에 먼저 공격한 사람이 뒤로 가요.' },
        { title: '전장과 무기 고르기 (30분)', body: '각자 딜러룸에서 2분 안에 공격할 전장 번호와 쓸 무기 카드 한 장을 골라요. 라운드마다 반드시 한 번 공격해야 해요. 단검은 돌려받지만 특수 무기는 쓰면 사라져요.' },
        { title: '자동 공격', body: '순서대로 공격이 적용되고, 무기의 공격력만큼 몬스터의 생명력이 줄어요. 남은 생명력과 누가 어디를 골랐는지는 공개되지 않아요.' },
        { title: '처치와 교체', body: '생명력이 0이 되면 **마지막으로 공격한 사람**이 공개되고 그 몬스터의 승점과 전리품을 가져가요. 빈자리는 대기열 맨 왼쪽 몬스터가 채우고, 뒤 순서로 그 전장을 고른 사람은 새 몬스터를 공격하게 돼요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '대기열에서 나온 몬스터가 모두 쓰러지면 게임이 끝나요.',
        '**동맹원의 승점은 합한 뒤 인원수로 나눠요**(소수점 첫째 자리까지).',
        '최종 승점 1위는 피스 6개를 받아요(공동 1위면 똑같이 나누고 남는 건 버려요).',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '몬스터의 남은 생명력보다 센 무기를 쓰면, 몬스터는 쓰러지고 남은 공격력은 사라져요.',
        '피스 1개로 언제든 특수 아이템을 살 수 있어요. **스카우터**는 그 라운드 전장 몬스터의 남은 체력을 딜러룸에서 확인하게 해 주고, **순서 바꾸기**는 무기를 낼 때 내 공격 순서를 원하는 자리로 옮겨 줘요.',
        '특수 무기와 아이템은 동맹과 관계없이 주고받을 수 있지만, 잃어버리면 다시 주지 않아요.',
        '상금 미션: 이 메인 매치에서 탈락자가 1명이면 상금이 쌓였어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '핼러윈 몬스터의 보상은 **막타(마지막 일격)**에만 가요. 몬스터를 거의 다 깎아 놓은 사람이 아니라, 그 뒤에 딱 맞게 친 사람이 이득을 봐요.' },
      { type: 'cards', items: [
        { title: '순서가 곧 힘', body: '승점이 높을수록 먼저 공격하는데, 막타 게임에서는 늦게 치는 쪽이 유리할 때가 많아요. 그래서 동맹끼리 승점을 넘겨 일부러 순서를 조정하거나, "순서 바꾸기"로 맨 뒤를 차지하는 것이 핵심 전술이에요.' },
        { title: '정보가 숨겨진 공격', body: '남은 생명력도, 누가 어디를 쳤는지도 보이지 않아요. 처치될 때마다 막타 주인만 공개되므로, 각 전장에 얼마의 피해가 쌓였는지 추정하는 기억과 계산이 필요해요. 스카우터는 이 추정을 확인하는 수단이에요.' },
        { title: '동맹은 평균이에요', body: '동맹은 끝에 점수를 나누기 때문에, 한 사람이 크게 버는 것보다 모두가 꾸준히 버는 것과 같은 효과예요. 대신 동맹 안에서 누가 막타를 칠지 조율할 수 있어서, 솔로보다 효율적으로 큰 몬스터를 잡을 수 있어요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '먼치킨 (Munchkin)', players: '3–6명', alike: '몬스터를 쓰러뜨려 보물을 얻고, 다른 사람의 사냥에 끼어들어 이득을 빼앗는 경쟁이 있어요.', differs: '먼치킨은 한 사람이 자기 차례에 몬스터와 싸우고, 레벨 10에 먼저 오르면 이겨요.' },
      { name: '킹 오브 도쿄 (King of Tokyo)', players: '2–6명', alike: '공격 대상을 고르고 피해를 주며 승점을 모으는 게임이에요.', differs: '킹 오브 도쿄는 주사위로 공격과 회복을 정하고, 플레이어끼리 직접 싸워요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 무기와 몬스터별 수치는 옮기지 않았어요.',
  },
  en: {
    meta: {
      title: "Halloween Monster rules — The Devil's Plan 2 (Death Room), day 3 main match",
      description: "The rules of Halloween Monster from The Devil's Plan: Death Room (season 2): alliances, transferring points, attack order by points, battlefields and the queue, weapon cards and the last hit, the scouter and order swap, and splitting an alliance’s score.",
      keywords: ['Halloween Monster', "Devil's Plan 2 Halloween Monster", "Devil's Plan Death Room main match"],
    },
    title: "Halloween Monster — The Devil's Plan 2, day 3 main match",
    name: 'Halloween Monster',
    lead: 'Whoever kills a monster takes its reward — to be exact, whoever lands the last hit.',
    summary: 'Attack monsters on the battlefield; the last hit takes the points and loot, and alliances share their score at the end.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone still in on day 3.',
        '**Each player**: 5 points and a basic "dagger" weapon card.',
        '**Monsters**: a screen shows battlefields (inside double lines) and a queue; each monster has points (♥, which are also its health) and loot (pieces, special weapons).',
        '**Alliances**: in the first 60 minutes, up to three players may enter the dealer room together to form one, irreversibly. Anyone without one plays solo.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Transfer (20 minutes)', body: 'Allies may hand each other points in the dealer room, keeping at least 1.' },
        { title: 'Attack order', body: 'Highest points attack first; ties are drawn, and from round 2 a tied player who went earlier last round goes later.' },
        { title: 'Choose (30 minutes)', body: 'In the dealer room, within two minutes, each picks a battlefield and one weapon card. Everyone must attack every round. The dagger comes back; special weapons are spent.' },
        { title: 'Attacks resolve', body: 'In order, each weapon’s power is taken off that monster’s health. Remaining health and who chose what stay hidden.' },
        { title: 'Kills and replacements', body: 'At zero health, **the last attacker** is revealed and takes the monster’s points and loot. The leftmost queued monster fills the gap, and later attackers on that battlefield hit the newcomer.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'It ends when every monster from the queue is dead.',
        '**An alliance’s points are added and divided by its size** (to one decimal place).',
        'The top final score gets 6 pieces (shared if tied, remainder discarded).',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Overkill is wasted: excess power beyond the monster’s health disappears.',
        'A piece buys a special item at any time: the **scouter** shows the current battlefield monsters’ health in the dealer room; the **order swap** moves your attack to any position.',
        'Special weapons and items may be traded freely, but are not replaced if lost.',
        'Prize mission: only one elimination in this main match added prize money.',
      ], },
    ],
    analysis: [
      { type: 'p', text: 'Rewards go only to **the last hit**. Not the player who wore the monster down, but the one who finishes it exactly.' },
      { type: 'cards', items: [
        { title: 'Order is power', body: 'Higher points attack earlier, yet in a last-hit game later is often better. Allies shifting points to adjust order, or an order swap to take the last slot, are the key tactics.' },
        { title: 'Attacks in the dark', body: 'Health and choices are hidden; only the killer is revealed. You must estimate the damage on each battlefield from memory; the scouter checks the estimate.' },
        { title: 'An alliance is an average', body: 'Splitting the score means steady earnings across the alliance count as much as one big win — but allies can coordinate who takes the last hit and bring down big monsters more efficiently than solo players.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Munchkin', players: '3–6', alike: 'Kill monsters for treasure, and butt into others’ fights to steal the reward.', differs: 'One player fights on their own turn, and reaching level 10 first wins.' },
      { name: 'King of Tokyo', players: '2–6', alike: 'Choose targets, deal damage and collect points.', differs: 'Dice decide attacks and healing, and players fight each other directly.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Individual weapon and monster values are not reproduced.',
  },
};

export default game;
