import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'russian-roulette',
  kind: 'prison',
  when: { ko: '2일차', en: 'Day 2' },
  site: 'russianRoulette',
  related: ['russianRoulette', 'piggyBank', 'heavy13'],
  updated: '2026-11-26',
  sources: [namuDay(2), siteEngine({ ko: '러시안 룰렛', en: 'Russian Roulette' }, 'src/lib/russianRoulette.ts'), broadcast],
  ko: {
    meta: {
      title: '러시안 룰렛 규칙 — 데블스플랜3 2일차 감옥매치 (조사·회전·조작) 정리',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 2일차 감옥매치 러시안 룰렛의 규칙을 정리했어요. 약실 6칸·총알 2발·크레딧 16개, 공개/비공개 조사, 총구 회전, 몰래 하는 조작, 게임 종료와 격발 순서, 승부를 가르는 지점까지.',
      keywords: ['러시안 룰렛', '데블스플랜3 러시안 룰렛', '데블스 플랜 3 감옥매치', '데블스플랜3 2일차', '러시안 룰렛 규칙', '러시안룰렛 게임'],
    },
    title: '러시안 룰렛 — 데블스플랜3 2일차 감옥매치',
    name: '러시안 룰렛',
    lead: '총알 두 발이 어디 있는지, 총구가 누구를 향할지. 크레딧으로 정보를 사고 총을 돌려 마지막 격발을 피하는 6인 게임이에요.',
    summary: '크레딧 16개로 약실을 조사하고 총구를 돌리고 몰래 총알을 옮겨, 마지막 격발에서 살아남는 6인 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 6명. 앉는 자리는 추첨으로 정해요.',
        '**총**: 약실 6칸짜리 회전식 총에 총알 2발. 총알 위치는 시작 전에 알려 주지 않아요.',
        '**개인 지급품**: 단말기와 크레딧 16개. 내가 가진 크레딧은 나만 알아요.',
        '**선 플레이어**: 1번 자리부터 시작하고, 라운드마다 시계 방향으로 넘어가요.',
      ] },
    ],
    flow: [
      { type: 'p', text: '자기 차례에는 아래 행동 중 하나를 골라요.' },
      { type: 'table', head: ['행동', '크레딧', '효과'], rows: [
        ['공개 조사', '1', '붙어 있는 약실 2칸을 골라 총알이 있는지 모두에게 공개해요.'],
        ['비공개 조사', '2', '붙어 있는 약실 2칸을 골라 총알이 있는지 나만 확인해요.'],
        ['1칸 회전', '3', '총구를 시계 방향으로 1칸 돌려요.'],
        ['2칸 회전', '4', '총구를 시계 방향으로 2칸 돌려요.'],
        ['조작', '모아서 6', '한 번에 1–3개를 몰래 내요. 내 크레딧으로 합계 6을 채운 사람이 조작권을 얻어, 붙어 있는 약실 2칸의 총알 상태를 맞바꿔요. 6을 넘긴 크레딧은 사라져요.'],
      ] },
      { type: 'p', text: '크레딧을 다 쓴 사람은 그 뒤로 자동으로 패스해요. **세 명이 크레딧을 모두 쓰면** 게임이 끝나요.' },
    ],
    win: [
      { type: 'list', items: [
        '게임이 끝나면 총구가 향한 사람부터 시계 방향으로 한 사람에 한 번씩 방아쇠를 당겨요.',
        '총알에 맞은 **두 명이 탈락**하고, 살아남은 네 명은 피스를 1개씩 받아요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '비공개 조사(2)와 조작 적립(1–3)은 겉으로 구분되지 않아요. 남이 몇 개를 썼는지는 공개 행동만 정확히 셀 수 있어요.',
        '조작은 크레딧이 한 번에 다 나가지 않고 여러 차례에 나눠 쌓여요. 누가 얼마를 쌓았는지는 끝날 때까지 공개되지 않아요.',
        '테이블에 손이 묶여 있어 옆자리 외에는 몰래 이야기할 수 없고, 필기도구도 없었어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '러시안 룰렛은 **정보와 행동의 가격 차이**를 이용하는 게임이에요. 정보(조사)는 싸고, 결과를 바꾸는 행동(회전·조작)은 비싸요. 크레딧은 16개뿐이라, 언제 정보를 사고 언제 결과를 바꿀지 정하는 것이 전부예요.' },
      { type: 'cards', items: [
        { title: '공개 정보는 금방 낡아요', body: '조사로 알아낸 총알 위치는 누군가 조작을 하면 바로 틀린 정보가 돼요. 그래서 초반에는 싼 공개 조사로 판을 함께 파악하고, 크레딧은 막판의 회전이나 조작을 위해 아껴 두는 편이 효율적이에요.' },
        { title: '비공개 행동은 연막이에요', body: '비공개 조사와 조작 적립은 밖에서 똑같아 보여요. 비공개 행동을 하는 것만으로 "혹시 조작하나?" 하는 의심을 만들 수 있고, 반대로 진짜 조작을 조사처럼 숨길 수도 있어요.' },
        { title: '크레딧 세기', body: '공개 행동은 정확히 세고, 비공개 행동은 대략 2개 남짓으로 잡아 상대의 남은 크레딧을 추정하세요. 세 명이 크레딧을 다 쓰는 순간 게임이 끝나므로, 누가 곧 0이 될지를 알면 게임이 언제 끝날지도 알 수 있어요.' },
        { title: '마지막 행동이 가장 강해요', body: '총구 방향과 총알 위치는 마지막에 움직인 사람이 정해요. 그래서 게임 종료 직전에 크레딧이 남아 있는 사람이 유리해요. 모두가 그걸 알기 때문에, 일부러 크레딧을 남겨 두는 사람과 그 사람을 견제하려는 사람 사이의 신경전이 생겨요.' },
        { title: '다수 연합의 힘', body: '6명 중 2명이 탈락하므로, 네 명이 손을 잡고 나머지 두 명을 향해 총구를 맞추면 연합 전원이 살 수 있어요. 규칙상 이를 막을 장치는 없어서, 소수 쪽은 비공개 조작으로 연합의 계산을 깨뜨리는 것 말고는 방법이 적어요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 러시안 룰렛은 방송 규칙(6명, 약실 6칸, 총알 2발, 크레딧 16개, 다섯 가지 행동과 비용, 세 명이 크레딧을 다 쓰면 종료)을 그대로 따라요.',
        '혼자 할 때는 AI 5명과 해요. 조작 내역은 격발 뒤에 공개돼요.',
        '방송처럼 손을 묶을 수는 없어서, 친구전에서 대화를 어떻게 할지는 함께 정하면 돼요.',
      ] },
    ],
    similar: [
      { name: '배틀십 (Battleship)', players: '2명', alike: '보이지 않는 판의 칸을 하나씩 확인해 숨겨진 위치를 좁혀 가는 탐색 게임이에요.', differs: '배틀십은 정보가 바뀌지 않고, 상대의 배를 찾아 맞히는 쪽이 이겨요. 러시안 룰렛은 확인한 정보가 조작으로 바뀔 수 있어요.' },
      { name: '클루 (Cluedo)', players: '2–6명', alike: '공개 정보와 나만 아는 정보를 조합해 숨겨진 사실을 추리해요.', differs: '클루의 정답은 끝까지 그대로이고, 먼저 정확히 맞힌 사람이 이겨요.' },
      { name: '캐시 앤 건즈 (Ca$h \'n Gun$)', players: '4–8명', alike: '여럿이 동시에 서로를 겨누고, 누가 맞을지를 두고 블러핑하는 게임이에요.', differs: '캐시 앤 건즈는 총알 카드와 빈 카드로 허세를 부리고 전리품을 나누는 파티 게임이라 탐색 요소가 없어요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Russian Roulette rules — The Devil's Plan 3, day 2 prison match (inspect, rotate, manipulate)",
      description: "The rules of Russian Roulette, the day-2 prison match of The Devil's Plan: Dead Again (season 3): six chambers, two bullets, 16 credits, public and private inspection, rotating the gun, secret manipulation, the end and the firing order, and what decides it.",
      keywords: ['Russian Roulette', "Devil's Plan 3 Russian Roulette", "Devil's Plan prison match", 'Russian Roulette game rules'],
    },
    title: "Russian Roulette — The Devil's Plan 3, day 2 prison match",
    name: 'Russian Roulette',
    lead: 'Where are the two bullets, and who will the gun point at? Spend credits on information and on turning the gun to survive the final shots.',
    summary: 'Six players spend 16 credits inspecting chambers, turning the gun and secretly moving bullets to survive the last shots.',
    setup: [
      { type: 'list', items: [
        '**Players**: 6, seated by draw.',
        '**The gun**: a six-chamber revolver with two bullets in unknown chambers.',
        '**Each player**: a terminal and 16 credits; only you know how many you have.',
        '**First player**: seat 1, moving clockwise each round.',
      ] },
    ],
    flow: [
      { type: 'p', text: 'On your turn, choose one action.' },
      { type: 'table', head: ['Action', 'Credits', 'Effect'], rows: [
        ['Public inspection', '1', 'Choose two adjacent chambers; whether they hold a bullet is shown to everyone.'],
        ['Private inspection', '2', 'Choose two adjacent chambers; only you see whether they hold a bullet.'],
        ['Rotate 1', '3', 'Turn the muzzle one step clockwise.'],
        ['Rotate 2', '4', 'Turn the muzzle two steps clockwise.'],
        ['Manipulate', '6 in total', 'Pay in 1–3 secretly at a time. Whoever completes 6 with their own credits swaps the contents of two adjacent chambers; credits past 6 are lost.'],
      ] },
      { type: 'p', text: 'A player with no credits passes automatically. **When three players have run out**, the game ends.' },
    ],
    win: [
      { type: 'list', items: [
        'The gun is fired once at each player, starting with whoever it points at and going clockwise.',
        '**The two players hit are eliminated**; the four survivors get a piece each.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A private inspection (2) and a manipulation payment (1–3) look the same from outside; only public actions can be counted exactly.',
        'Manipulation is paid in instalments, and who paid what stays hidden until the end.',
        'Players were cuffed to the table, so only neighbours could whisper, and there was nothing to write with.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Russian Roulette turns on **the price gap between information and action**: inspection is cheap, changing the outcome (rotating, manipulating) is expensive, and 16 credits must cover both.' },
      { type: 'cards', items: [
        { title: 'Public information goes stale', body: 'Any manipulation can make a known bullet position wrong. Cheap public inspections early, sharing the picture, and saving credits for late rotations or manipulation is efficient.' },
        { title: 'Private actions are smoke', body: 'A private inspection and a manipulation payment look identical, so a private action alone plants the suspicion of manipulation — and real manipulation can hide as inspection.' },
        { title: 'Count credits', body: 'Count public actions exactly and treat private ones as about two credits each. Since the game ends when three players hit zero, knowing who is about to run out tells you when it will end.' },
        { title: 'The last move is strongest', body: 'Whoever moves last sets the muzzle and bullets, so credits left near the end are power. Everyone knows it, which starts a standoff between players hoarding credits and those trying to stop them.' },
        { title: 'The majority alliance', body: 'Two of six are eliminated, so four players aiming the gun at the other two can all survive. Nothing in the rules prevents it; the minority’s main hope is secret manipulation that breaks the alliance’s calculation.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK follows the broadcast rules: 6 players, 6 chambers, 2 bullets, 16 credits, the five actions and their costs, and the end when three players run out.',
        'Solo play is against five AIs, and the manipulation history is revealed after the shots.',
        'Nobody is cuffed to the table, so in a friends’ game you agree yourselves how much talking is allowed.',
      ] },
    ],
    similar: [
      { name: 'Battleship', players: '2', alike: 'Probe cells of a hidden grid to narrow down where things are.', differs: 'Information never changes, and you win by finding the other fleet; in Russian Roulette what you learned can be manipulated.' },
      { name: 'Cluedo', players: '2–6', alike: 'Combine public and private information to deduce a hidden fact.', differs: 'The solution never changes, and the first correct accusation wins.' },
      { name: "Ca$h 'n Gun$", players: '4–8', alike: 'Everyone points at each other at once and bluffs about who will be hit.', differs: 'It is a party game of bluffing with bullet and blank cards and sharing loot, with no searching.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
