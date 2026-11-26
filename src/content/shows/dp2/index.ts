// 데블스 플랜: 데스룸 (The Devil's Plan season 2). Netflix, 2025-05-06 – 2025-05-20, 12 episodes, 14 players.
// Games in broadcast order: each day's main match, then its prison match; the three games of the final.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuRules } from './shared';
import corruptPolice from './corrupt-police';
import removeOne from './remove-one';
import unknown from './unknown';
import timeAuction from './time-auction';
import halloweenMonster from './halloween-monster';
import sniperHoldem from './sniper-holdem';
import treasureIsland from './treasure-island';
import tripleDice from './triple-dice';
import balanceMancala from './balance-mancala';
import wallgo from './wallgo';
import doubtAndBet from './doubt-and-bet';
import equationPyramid from './equation-pyramid';
import bigSmall from './big-small';
import bagchal from './bagchal';
import questionAndTruth from './question-and-truth';

const show: Show = {
  slug: 'devils-plan-2',
  series: 'devils-plan',
  short: { ko: '데블스플랜2', en: "Devil's Plan 2" },
  aired: { start: '2025-05-06', end: '2025-05-20' },
  network: { ko: '넷플릭스', en: 'Netflix' },
  episodes: 12,
  color: '#7c6cff',
  spoiler: true,
  updated: '2026-11-26',
  games: [corruptPolice, removeOne, unknown, timeAuction, halloweenMonster, sniperHoldem, treasureIsland, tripleDice, balanceMancala, wallgo, doubtAndBet, equationPyramid, bigSmall, bagchal, questionAndTruth],
  sources: [
    { label: { ko: '나무위키 「데블스 플랜: 데스룸」 (공개일·회차)', en: 'Namuwiki, "The Devil’s Plan: Death Room" (release dates, episodes)' }, url: `https://namu.wiki/w/${encodeURIComponent('데블스 플랜: 데스룸')}` },
    namuRules,
    { label: { ko: '머니투데이 — 「호텔 같은 생활동 vs 데스룸 가는 감옥동」 (2025년 4월, 공개 전 형식 소개)', en: 'Money Today — living quarters versus the prison and its Death Room (April 2025, format preview)' }, url: 'https://www.mt.co.kr/entertainment/2025/04/22/2025042209257223302' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '데블스플랜2 게임 정리 — 데블스 플랜: 데스룸 메인매치·감옥매치·결승 전 게임 규칙',
      description: '데블스 플랜: 데스룸(데블스플랜2, 시즌 2)에 나온 게임 15개를 방송 순서대로 정리했어요. 부패 경찰부터 하나 빼기, 저격 홀덤, 벽바둑, 의심 베팅, 결승 빅 스몰·바그찰·질문과 진실까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['데블스플랜2', '데블스플랜2 게임', '데블스 플랜 데스룸', '데블스 플랜 시즌2 게임', '데블스플랜 데스룸 게임 정리', '데블스플랜2 메인매치', '데블스플랜2 감옥매치', '데블스플랜2 결승'],
    },
    title: '데블스플랜2 게임 정리 — 데블스 플랜: 데스룸',
    name: '데블스 플랜: 데스룸',
    lead: '14명, 7일, 피스가 곧 목숨. 생활동과 감옥동, 그리고 매일 밤의 데스룸. 시즌 2의 게임을 방송 순서대로 모았어요.',
    intro: [
      '「데블스 플랜: 데스룸」은 넷플릭스 두뇌 서바이벌 「데블스 플랜」의 두 번째 시즌이에요. 2025년 5월 6일부터 20일까지 공개됐고 모두 12부작이에요. 참가자 14명이 6박 7일 동안 합숙하며 매일 메인 매치와 감옥 매치를 치러요.',
      '이 페이지는 시즌 2의 게임 15개를 **방송 순서대로** 정리한 목차예요. 게임마다 따로 페이지를 두고 규칙, 승부를 가르는 지점, 비슷한 보드게임을 담았어요. 감옥 매치로 나온 **벽바둑**은 PUZZLTHINK에서 바로 둘 수 있어요.',
    ],
    summary: '2025년 5월 공개된 시즌 2. 피스가 0개면 즉시 탈락하는 규칙 아래, 메인 매치 6개와 데스룸 감옥 매치 6개, 결승 3판.',
    format: [
      { type: 'p', text: '시즌 2의 하루는 낮의 **메인 매치**와 밤의 **감옥 매치**로 이루어져요. 시즌 3과 가장 크게 다른 점은 **피스가 곧 목숨**이라는 거예요.' },
      { type: 'table', head: ['구분', '누가', '결과'], rows: [
        ['메인 매치', '생존자 전원', '결과에 따라 피스를 얻거나 잃어요. 이어서 피스 개수로 생활동(상위 절반)과 감옥동(하위 절반)을 나눠요.'],
        ['감옥 매치', '감옥동 참가자', '최하위 1명 탈락. 저녁 8시에 규칙이 공개되고 30분 준비 뒤에 데스룸에서 진행되며, 생활동에도 실시간으로 중계돼요.'],
        ['결승', '마지막 2명', '6일차 메인 매치 뒤 피스 1위가 결승에 직행하고, 나머지는 감옥 매치로 남은 한 자리를 가려요. 결승은 세 게임으로 치러요.'],
      ] },
      { type: 'h3', text: '피스와 거주동' },
      { type: 'list', items: [
        '**피스**: 모두 1개로 시작하고 게임 성과에 따라 늘거나 줄어요. 아이템을 사거나 거래할 때 쓰고, 주고받는 건 생활동·감옥동 안에서만 돼요. **게임 중 피스를 모두 잃으면 그 즉시 탈락**하고, 탈락자의 피스는 사라져요.',
        '**거주동**: 메인 매치 뒤 피스 상위 절반은 생활동, 하위 절반은 감옥동으로 가요. 인원이 홀수면 감옥동에 1명이 더 가요. 피스가 같아 절반으로 나눌 수 없으면 피스가 가장 많은 사람이 감옥동에 갈 사람을 정해요.',
        '**상금 미션**: 메인 매치마다 다른 상금 미션이 있어요. 상금은 0원에서 시작해 최대 5억 원까지 쌓여요.',
        '배신과 거짓말은 허용되지만 폭력과 절도는 금지예요.',
      ] },
    ],
    extra: [
      { id: 'board-games', title: '거주동의 보드게임', blocks: [
        { type: 'p', text: '시즌 2의 생활동과 감옥동에는 보드게임 두 가지가 놓여 있었어요. 2–4인용 **벽바둑**과 1인용 퍼즐 **기사의 여행**이에요. 벽바둑은 5일차 감옥 매치로 실제로 나왔어요. 기사의 여행은 체스의 나이트로 판의 모든 칸을 한 번씩 밟는 고전 퍼즐이에요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: "The Devil's Plan 2 games — every main match, prison match and final of Death Room",
      description: "All fifteen games of The Devil's Plan: Death Room (season 2) in broadcast order, from Corrupt Police to Remove One, Sniper Hold'em, Wallgo, Doubt and Bet and the final's Big Small, Bagh-Chal and Question and Truth: rules, what decides each one, and similar board games.",
      keywords: ["The Devil's Plan 2", "The Devil's Plan Death Room", "Devil's Plan season 2 games", "Devil's Plan Death Room rules"],
    },
    title: "The Devil's Plan 2 games — The Devil's Plan: Death Room",
    name: "The Devil's Plan: Death Room",
    lead: 'Fourteen players, seven days, and pieces that are your life. The living quarters, the prison, and every night the Death Room — season 2 in broadcast order.',
    intro: [
      "The Devil's Plan: Death Room is the second season of Netflix's Korean brain-survival show The Devil's Plan. Its 12 episodes were released from 6 to 20 May 2025. Fourteen players live together for seven days and play a main match and a prison match every day.",
      'This page lists the season’s fifteen games **in broadcast order**, each with its own page of rules, what decides it, and similar board games. **Wallgo**, one of its prison matches, can be played on PUZZLTHINK.',
    ],
    summary: 'Season 2, released May 2025: six main matches, six Death Room prison matches and a three-game final, with zero pieces meaning instant elimination.',
    format: [
      { type: 'p', text: 'A season-2 day is a daytime **main match** and an evening **prison match**. The biggest difference from season 3: **pieces are your life**.' },
      { type: 'table', head: ['Match', 'Who', 'Result'], rows: [
        ['Main match', 'Everyone still in', 'Pieces are won or lost; then the top half by pieces goes to the living quarters, the bottom half to prison.'],
        ['Prison match', 'Players in prison', 'The last place is eliminated. Rules are revealed at 8 pm, followed by 30 minutes to prepare; it is played in the Death Room and shown live to the living quarters.'],
        ['Final', 'The last two', 'After day 6’s main match the piece leader goes straight through; a prison match decides the other place. The final is three games.'],
      ] },
      { type: 'h3', text: 'Pieces and quarters' },
      { type: 'list', items: [
        '**Pieces**: everyone starts with one, gaining or losing them by results. They buy items and are traded, but change hands only inside the living areas. **Losing all your pieces during a game eliminates you on the spot**, and an eliminated player’s pieces vanish.',
        '**Quarters**: after a main match the top half by pieces go to the living quarters and the bottom half to prison (one extra to prison if odd). If ties prevent an even split, the piece leader decides who goes to prison.',
        '**Prize missions**: each main match has its own; the prize starts at ₩0 and can grow to ₩500 million.',
        'Betrayal and lies are allowed; violence and theft are not.',
      ] },
    ],
    extra: [
      { id: 'board-games', title: 'The board games in the quarters', blocks: [
        { type: 'p', text: 'Two board games were set out in season 2’s living quarters and prison: **Wallgo** for 2–4 players and the solo puzzle **Knight’s Tour**. Wallgo became the day-5 prison match. The Knight’s Tour is the classic puzzle of visiting every square once with a chess knight.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
