// 데블스 플랜 (The Devil's Plan, season 1). Netflix, 2023-09-26 – 2023-10-10, 12 episodes; seven days.
// Games in the order played: each day's main match and prize match, the hidden stage in the prison, then the final.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, namuRules } from './shared';
import { coopPuzzle, memoryFragments, rulesRace, secretNumber, virusGame, wordTower } from './days-1-3';
import { blindGomoku, equationHighLow, fourThree, layingGrass, montage, scaleGame, zoo } from './days-4-6';
import { hexagon, ninMensMorris } from './final';

const show: Show = {
  slug: 'devils-plan-1',
  seo: 'dp1',
  series: 'devils-plan',
  short: { ko: '데블스플랜1', en: "Devil's Plan 1" },
  aired: { start: '2023-09-26', end: '2023-10-10' },
  network: { ko: '넷플릭스', en: 'Netflix' },
  episodes: 12,
  color: '#3d2a6b',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    virusGame, coopPuzzle, rulesRace, memoryFragments, secretNumber, wordTower, zoo, scaleGame,
    layingGrass, blindGomoku, montage, equationHighLow, fourThree, ninMensMorris, hexagon,
  ],
  sources: [
    namuMain,
    namuRules,
    { label: { ko: '파이낸셜뉴스 「데블스 플랜」 관련 기사 (2023년 10월, 공개 일정 확인)', en: "Financial News, report on The Devil's Plan (October 2023; release schedule)" }, url: 'https://www.fnnews.com/news/202310111129285406' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '데블스 플랜 시즌1 게임 정리 — 메인 매치·상금 매치·히든 스테이지·결승 전 게임 규칙',
      description: '넷플릭스 「데블스 플랜」 시즌1(2023)에 나온 게임 15개를 방송 순서대로 정리했어요. 바이러스 게임, 규칙 레이스, 시크릿 넘버, 동물원, 땅따먹기, 수식 하이 로우부터 블라인드 오목·4인 3목, 결승 나인 멘스 모리스·헥사곤까지 규칙과 승부처, PUZZLTHINK에서 바로 플레이.',
      keywords: ['데블스 플랜', '데블스 플랜 시즌1', '데블스플랜1', '데블스플랜 시즌1 게임', '데블스 플랜 게임 정리', '데블스 플랜 메인 매치', '데블스 플랜 결승'],
    },
    title: '데블스 플랜 시즌1 게임 정리',
    name: '데블스 플랜 (시즌 1)',
    lead: '12명이 6박 7일 동안 피스를 모아 결승을 노려요. 낮에는 경쟁하는 메인 매치, 저녁에는 함께하는 상금 매치. 그 게임들을 방송 순서대로 모았어요.',
    intro: [
      '「데블스 플랜」은 넷플릭스의 두뇌 서바이벌 예능 첫 시즌이에요. 2023년 9월 26일부터 10월 10일까지 몇 편씩 나눠 공개됐고, 모두 12부작이에요.',
      '이 페이지는 규칙이 확인된 게임 15개를 **방송 순서대로** 정리한 목차예요. 그중 블라인드 오목, 4인 3목, 나인 멘스 모리스, 헥사곤은 PUZZLTHINK에서 바로 플레이할 수 있어요.',
    ],
    summary: '2023년 9–10월 공개. 피스를 모으는 메인 매치와 상금을 쌓는 협동 상금 매치, 감옥의 비밀 방을 거쳐 2인 결승으로 끝나요.',
    format: [
      { type: 'p', text: '데블스 플랜의 화폐는 **피스**예요. 모두 1개로 시작해, 게임 결과에 따라 얻거나 잃어요. 피스는 거래와 아이템 구매에 쓰이고, 생활동에서는 서로 주고받을 수도 있어요. **피스를 모두 잃으면 즉시 탈락**해요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['메인 매치', '낮에 모든 생존자가 참가하는 경쟁 게임이에요. 끝나면 피스가 가장 적은 두 사람이 감옥에 가요. 최하위가 셋 이상이면 피스 최다 보유자가 감옥에 갈 사람을 지목해요.'],
        ['상금 매치', '저녁에 감옥에 가지 않은 사람들이 함께하는 협동 게임이에요. 성공할 때마다 최종 상금이 쌓여요(0원에서 시작, 최대 5억 원). 여섯 번 열렸어요.'],
        ['감옥', '수감자는 상금 매치에 참여할 수 없고 다음 날 메인 매치 전까지 갇혀요. 감옥에 숨겨진 퍼즐을 풀면 피스 1개를 받아요. 수감은 5일차까지만 있었어요.'],
        ['비밀의 방', '감옥 안 비밀 금고를 열면 비밀의 방으로 가는 통로가 나와요. 하루 한 명이 모든 피스를 걸고 히든 스테이지에 도전할 수 있어요.'],
        ['결승', '피스가 가장 많은 두 명이 세 경기로 겨뤄요. 두 경기를 먼저 이긴 사람이 우승하고, 피스가 많은 사람은 경기마다 베네핏을 받아요.'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 것', blocks: [
        { type: 'p', text: '결승 세 번째 경기로 준비된 "주사위 포커"는 규칙을 자세히 확인하지 못해 목록에서 뺐어요. 감옥의 1인용 퍼즐과, 3일차에 함께 진행된 "감옥 수감자 맞히기" 베팅도 게임 페이지를 따로 두지 않았어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: "The Devil's Plan season 1 games — every main match, prize match, hidden stage and final game",
      description: "All fifteen confirmed games of Netflix's The Devil's Plan season 1 (2023) in broadcast order, from The Virus Game, Rules Race, Secret Number, Zoo, Laying Grass and Equation High-Low to Blind Gomoku, 4 Player 3 in a Row and the final's Nine Men's Morris and Hexagon — four of them playable on PUZZLTHINK.",
      keywords: ["The Devil's Plan", "The Devil's Plan season 1 games", '데블스 플랜 시즌1', 'Korean survival show games'],
    },
    title: "The Devil's Plan season 1 games",
    name: "The Devil's Plan (season 1)",
    lead: 'Twelve players spend seven days collecting pieces to reach the final: competitive main matches by day, cooperative prize matches by night. Every game, in broadcast order.',
    intro: [
      "The Devil's Plan is Netflix's brain-survival show; its first season was released in batches from 26 September to 10 October 2023, twelve episodes in all.",
      'This page lists its fifteen confirmed games **in broadcast order**. Blind Gomoku, 4 Player 3 in a Row, Nine Men’s Morris and Hexagon can be played on PUZZLTHINK.',
    ],
    summary: 'Released September–October 2023: competitive main matches for pieces, cooperative prize matches for the prize pool, a secret room in the prison, and a two-player final.',
    format: [
      { type: 'p', text: "The currency is **pieces**: everyone starts with one and gains or loses them by results. Pieces buy items and seal deals and can be handed over in the living quarters. **Losing every piece means instant elimination.**" },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Main match', 'A competitive game by day for all survivors; afterwards the two with the fewest pieces go to prison, and if three or more tie for fewest, the piece leader chooses.'],
        ['Prize match', 'A cooperative evening game for everyone not in prison; each success adds to the prize pool (from zero up to ₩500 million). There were six.'],
        ['Prison', 'Prisoners miss the prize match and stay locked up until the next main match; solving a hidden puzzle there earns a piece. Prison ran only until day 5.'],
        ['Secret room', 'A hidden safe in the prison opens a passage to a secret room, where one prisoner a day may stake all their pieces on the hidden stage.'],
        ['Final', 'The two piece leaders play three games; the first to win two takes the title, and the player with more pieces gets a benefit in each game.'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: 'Not listed', blocks: [
        { type: 'p', text: '"Dice Poker", prepared as the final’s third game, is left out because its rules could not be confirmed in detail. The one-player prison puzzles and day 3’s side bet on who would go to prison have no pages either.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
