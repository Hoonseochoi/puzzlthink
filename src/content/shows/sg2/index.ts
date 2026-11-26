// 소사이어티 게임 2 (The Society Game 2). tvN, 2017-08-25 – 2017-11-10, 12 episodes; 22 players, 13 days in the round village.
// Games in the order played: one challenge a day from day 2 to day 12, then the three-round final on day 13.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, namuSeries, tvdbSeason, xports } from './shared';
import { cubeCode, jungleGym, russianJanggi, swingBridge, tenMade, triangleTug } from './games-a';
import { colorPunch, memoryHoldem, multiCount, towerOfMemory, unlockRelay } from './games-b';
import { equationScrabble, gravityBingo, obstacleRelay } from './final';

const show: Show = {
  slug: 'society-game-2',
  seo: 'society2',
  series: 'society-game',
  short: { ko: '소사이어티 게임2', en: 'Society Game 2' },
  aired: { start: '2017-08-25', end: '2017-11-10' },
  network: { ko: 'tvN', en: 'tvN' },
  episodes: 12,
  color: '#1f6b5c',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    tenMade, jungleGym, russianJanggi, swingBridge, triangleTug, cubeCode,
    colorPunch, memoryHoldem, multiCount, unlockRelay, towerOfMemory,
    gravityBingo, equationScrabble, obstacleRelay,
  ],
  sources: [namuMain, namuSeries, tvdbSeason, xports, broadcast],
  ko: {
    meta: {
      title: '소사이어티 게임2 게임 정리 — 챌린지 11개와 파이널 3라운드 전 게임 규칙',
      description: 'tvN 「소사이어티 게임 2」(2017)의 챌린지 14개를 방송 순서대로 정리했어요. 텐메이드, 정글짐, 러시아 장기, 흔들다리, 삼각 줄다리기, 큐브 코드, 컬러 펀치, 기억의 홀덤, 멀티 카운트, 언락 릴레이, 기억의 탑과 파이널 중력 빙고·수식 스크래블·장애물 계주까지 규칙과 승부처, 러시아 장기는 PUZZLTHINK에서 바로 플레이.',
      keywords: ['소사이어티 게임2', '소사이어티게임2', '소사이어티 게임 시즌2', '소사이어티 게임2 챌린지', '소사이어티 게임2 게임 정리', '소사이어티 게임 러시아 장기', '소사이어티 게임2 파이널'],
    },
    title: '소사이어티 게임2 게임 정리',
    name: '소사이어티 게임 2',
    lead: '22명이 두 마을로 나뉘어 13일 동안 함께 살아요. 매일 낮 두 마을이 몸과 머리를 함께 쓰는 챌린지로 맞붙고, 진 마을은 그날 밤 한 명을 떠나보내요. 그 챌린지들을 방송 순서대로 모았어요.',
    intro: [
      '「소사이어티 게임 2」는 tvN의 모의 사회 서바이벌 두 번째 시즌이에요. 2017년 8월 25일부터 11월 10일까지 매주 금요일 밤에 방송됐고, 모두 12부작이에요.',
      '이 페이지는 2일차부터 12일차까지 하루 하나씩 열린 챌린지 11개와 13일차 파이널의 세 라운드를 **방송 순서대로** 정리한 목차예요. 그중 러시아 장기는 PUZZLTHINK에서 바로 플레이할 수 있어요.',
    ],
    summary: '2017년 8–11월 방송. 다수결의 높동과 리더 중심의 마동이 매일 신체·두뇌 혼합 챌린지로 겨루고, 3라운드 파이널로 끝나요.',
    format: [
      { type: 'p', text: '참가자 22명은 원형 마을의 두 동, **높동**과 **마동** 중 한 곳의 주민이 돼요. 마을마다 리더가 한 명 있고, 리더는 상금 분배와 블랙리스트 같은 권한을 가져요. 시즌 2에서는 첫날 주민이 마을을 직접 골랐고, 인원 차이는 그날 저녁 주민 이동으로 맞췄어요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['챌린지', '낮에 두 마을이 겨루는 팀전이에요. 참가 인원은 두 마을이 같아야 해서, 인원이 많은 마을은 적은 마을이 지목한 주민을 빼고 나와요(리더는 지목할 수 없고, 같은 주민을 두 번 연속 지목할 수 없어요).'],
        ['상금', '챌린지마다 1,000만 원으로 정해져 있고, 이긴 마을의 리더가 주민 **한 명에게** 줘요. 하루 한 번 1,000만 원 단위로 다시 나눌 수 있고, 누가 얼마를 가졌는지는 파이널 직전까지 리더만 알아요.'],
        ['블랙리스트', '이긴 마을의 리더는 블랙리스트에 이름을 적을 수 있어요(적지 않아도 돼요). 이름이 두 번 오르면 그 자리에서 탈락해요.'],
        ['높동의 탈락', '높동은 투표로 리더를 뽑아요. 챌린지에서 지면 주민 전원이 투표해 가장 많은 표를 받은 주민이 탈락해요. 동점이면 리더가 정하고, 리더는 탈락 대상에서 빠져요.'],
        ['마동의 탈락', '마동의 리더는 임기 제한이 없고, 챌린지에서 지면 리더가 탈락자를 정해요. 리더를 바꾸는 길은 반란뿐이에요. 반란의 열쇠를 받은 주민이 징을 치고 30분 안에 주민 과반이 따라 치면, 열쇠 주인이 새 리더가 돼요. 시즌 2에서는 반란에 실패한 열쇠 주인의 이름이 블랙리스트에 자동으로 올라가요.'],
        ['주민 교환', '정해진 날 두 마을 리더가 주민 한 명씩을 골라 맞바꿔요. 한 번이라도 마을을 옮긴 주민(첫날 인원 조정 포함)은 다시 교환 대상이 될 수 없어요.'],
        ['파이널', '13일차에 마을마다 3명이 나서 세 라운드를 치르고, 두 라운드를 먼저 이긴 마을이 우승해요. 생존자가 4명 이상이면 리더가 자신을 포함한 3명을 고르고(파이널 디시전), 나머지는 탈락해요. 우승한 마을의 세 사람은 각자 모은 상금을 받아요.'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 것', blocks: [
        { type: 'p', text: '챌린지 규칙 설명 뒤 연습 삼아 열린 미니게임, 데일리 이벤트(추억의 고전 오락기), 감옥 미션과 리더 방의 파이널 힌트는 게임 페이지를 따로 두지 않았어요. 첫 챌린지 텐메이드의 1:1 대결 4종목도 세부 규칙이 공개되지 않아 텐메이드 페이지 안에서만 짧게 다뤘어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Society Game 2 games — all eleven challenges and the three-round final',
      description: "All fourteen challenges of tvN's The Society Game 2 (2017) in broadcast order: Ten Made, Jungle Gym, Russian Janggi, Swing Bridge, Triangle Tug of War, Cube Code, Color Punch, Memory Hold’em, Multi Count, Unlock Relay, Tower of Memory and the final’s Gravity Bingo, Equation Scrabble and Obstacle Relay — with Russian Janggi playable on PUZZLTHINK.",
      keywords: ['The Society Game 2', 'Society Game 2 challenges', '소사이어티 게임2', 'Korean survival show games'],
    },
    title: 'The Society Game 2 games',
    name: 'The Society Game 2 (소사이어티 게임 2)',
    lead: 'Twenty-two people live in two villages for thirteen days. Every day the villages meet in a challenge mixing strength and brains, and the losing village sends one person home that night. Every challenge, in broadcast order.',
    intro: [
      "The Society Game 2 is the second season of tvN's mock-society survival show, broadcast on Friday nights from 25 August to 10 November 2017 — twelve episodes in all.",
      'This page lists the eleven challenges held one a day from day 2 to day 12 and the three rounds of the day-13 final, **in broadcast order**. Russian Janggi can be played on PUZZLTHINK.',
    ],
    summary: 'Broadcast August–November 2017: the majority-rule village and the leader-run village meet daily in hybrid strength-and-brain challenges, ending in a three-round final.',
    format: [
      { type: 'p', text: 'The twenty-two players become residents of one of two villages in the round village, **Nopdong** (높동) or **Madong** (마동). Each village has a leader who controls the prize money and the blacklist. In season 2 players chose their village on day 1, and numbers were evened out by moves that evening.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Challenge', 'A daily team contest between the villages. Both must field the same number, so the larger village sits out players named by the smaller one (never the leader, and never the same player twice running).'],
        ['Prize money', 'Fixed at ₩10 million per challenge, given by the winning leader to **one** villager. It may be reassigned once a day in ₩10 million units, and only the leader knows who holds what until just before the final.'],
        ['Blacklist', 'The winning leader may write a name on the blacklist (or none); a name written twice is eliminated at once.'],
        ['Losing in Nopdong', 'Nopdong elects its leader by vote. After a loss everyone votes and the player with most votes leaves; the leader breaks ties and cannot be eliminated.'],
        ['Losing in Madong', 'Madong’s leader has no term limit and picks who leaves after a loss. The only way to replace them is rebellion: a key holder strikes the gong, and if a majority strike it within 30 minutes, the key holder becomes leader. In season 2 a key holder whose rebellion fails goes straight onto the blacklist.'],
        ['Exchange', 'On set days each leader picks one resident and the two swap villages. Anyone who has moved once (including the day-1 balancing) cannot be exchanged again.'],
        ['Final', 'On day 13 three players per village play three rounds; the first village to two wins takes it. A village with four or more survivors has its leader choose the three, themselves included (the final decision), and the rest are eliminated. The winning three each receive the prize money they hold.'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: 'Not listed', blocks: [
        { type: 'p', text: 'The practice mini-games held after each rules briefing, the daily event (retro arcade machines), the prison missions and the final hints hidden in the leaders’ rooms have no pages. The four duel events inside the first challenge, Ten Made, were not published in detail and are only mentioned on that page.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
