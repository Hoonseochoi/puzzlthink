// 피의 게임X (The Bloody Game X). Wavve, 2026-07-03 – 2026-08-28, 10 episodes, 20 players in five teams.
// Games in broadcast order: each day's money challenge, then its death match; the revival match, the semifinal and the
// three games of the final tournament.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuRules } from './shared';
import teamEscape from './team-escape';
import runningMate from './running-mate';
import mosaicPuzzle from './mosaic-puzzle';
import mysteryTime2 from './mystery-time-2';
import threeStoryOmok from './three-story-omok';
import blindAuction from './blind-auction';
import rushHourHell from './rush-hour-hell';
import equationCombo from './equation-combo';
import ringTheBell from './ring-the-bell';
import memoryMaze from './memory-maze';
import killerGame from './killer-game';
import highAndLow from './high-and-low';
import projectGalaxy from './project-galaxy';
import mixAndMatch2 from './mix-and-match-2';
import predictionRace from './prediction-race';
import pyramidNumber from './pyramid-number';
import choiceHoldem from './choice-holdem';
import cardChess from './card-chess';

const show: Show = {
  slug: 'bloody-game-x',
  series: 'bloody-game',
  short: { ko: '피의 게임X', en: 'Bloody Game X' },
  aired: { start: '2026-07-03', end: '2026-08-28' },
  network: { ko: '웨이브', en: 'Wavve' },
  episodes: 10,
  color: '#c81e3a',
  spoiler: true,
  updated: '2026-11-26',
  games: [teamEscape, runningMate, mosaicPuzzle, mysteryTime2, threeStoryOmok, blindAuction, rushHourHell, equationCombo, ringTheBell, memoryMaze, killerGame, highAndLow, projectGalaxy, mixAndMatch2, predictionRace, pyramidNumber, choiceHoldem, cardChess],
  sources: [
    { label: { ko: '나무위키 「피의 게임X」 (공개일·회차·출연 형식)', en: 'Namuwiki, "The Bloody Game X" (release dates, episodes, format)' }, url: `https://namu.wiki/w/${encodeURIComponent('피의 게임X')}` },
    namuRules,
    { label: { ko: '이데일리 — 「피의 게임X」 7월 3일 공개 후 시리즈 신규 가입 견인 보도', en: 'Edaily — The Bloody Game X launched on 3 July 2026' }, url: 'https://en.edaily.co.kr/news/eda202607065288' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '피의 게임X 게임 정리 — 머니 챌린지·데스매치·파이널 전 게임 규칙',
      description: '웨이브 「피의 게임X」(2026)에 나온 게임 18개를 방송 순서대로 정리했어요. 러닝 메이트, 미스터리 타임 Ⅱ, 블라인드 경매, 살인마 게임, 프로젝트 갤럭시부터 파이널 피라미드 넘버·초이스 홀덤·카드 체스까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['피의 게임X', '피의게임X', '피의 게임X 게임', '피의게임X 게임 정리', '피의 게임X 머니 챌린지', '피의 게임X 데스매치', '피의 게임X 파이널'],
    },
    title: '피의 게임X 게임 정리',
    name: '피의 게임X',
    lead: '역대 시즌의 대표 플레이어와 새 얼굴 20명, 다섯 팀. 저택 안과 밖으로 갈린 생존전에 나온 게임을 방송 순서대로 모았어요.',
    intro: [
      '「피의 게임X」는 웨이브의 서바이벌 「피의 게임」 시리즈의 네 번째 작품이에요. 2026년 7월 3일부터 8월 28일까지 매주 금요일 공개됐고 모두 10부작이에요. 시즌 1–3의 대표 플레이어로 꾸린 세 팀과 챌린저 팀, 루키 팀까지 다섯 팀 20명이 팀전으로 시작해요.',
      '이 페이지는 방송에 나온 게임 18개를 **방송 순서대로** 정리한 목차예요. 게임마다 따로 페이지를 두고 규칙, 승부를 가르는 지점, 비슷한 보드게임을 담았어요.',
    ],
    summary: '2026년 7–8월 공개. 20명 5팀이 저택과 외부 생존지로 갈려 머니 챌린지와 데스매치를 치르고, 4인 토너먼트 파이널로 끝나요.',
    format: [
      { type: 'p', text: '피의 게임X는 **팀전으로 시작해 개인전으로** 바뀌어요. 매일 팀 자금을 걸고 겨루는 **머니 챌린지**가 있고, 그 결과로 정해진 탈락 후보가 **데스매치**에서 생존을 다퉈요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['피의 저택', '플레이어들이 생활하는 본거지예요. 게임에 쓰는 돈은 가상의 현금(팀 자금·개인 자금)이고, 이 돈은 최종 상금에 포함되지 않아요.'],
        ['외부 생존지', '머니 챌린지 최하위 팀(첫날은 오프닝 게임 최하위 팀)이 쫓겨나는 야외 공간이에요. 하루 한 번 최소한의 식량만 나오고, 저택의 자금은 쓸 수 없어요.'],
        ['유령 카지노', '외부 생존지에서 하루 한 번 열려요. 식재료나 손질한 마늘을 코인으로 바꿔(하루 1인 5코인까지) 카지노 게임으로 코인을 불리고, 코인으로 생필품을 사요. 코인은 저택에서는 쓸 수 없어요.'],
        ['데스매치', '탈락 후보끼리 겨뤄, 지면 피의 게임X에서 추방돼요. 팀 단위 데스매치도 있었어요.'],
        ['파이널', '세미파이널 상위 4명이 4인 토너먼트를 해요. 세미파이널 1·2위가 1·2라운드 종목을 고르고, 남은 종목이 3라운드가 돼요. 3라운드 승자가 우승 상금 1억 원을 받아요.'],
      ] },
      { type: 'h3', text: '판도라의 금고와 개인전 전환' },
      { type: 'p', text: '외부 생존지의 메뉴판에서 코인 1개로 "판도라의 금고 열쇠"를 살 수 있었고, 금고를 열면 이익과 불이익이 함께 생겼어요. 세 번째 금고가 열리며 이벤트 "약탈의 날"이 일어났고, 그 뒤 모든 팀이 해체되어 머니 챌린지가 개인전으로 바뀌고 외부 생존지도 닫혔어요.' },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 게임', blocks: [
        { type: 'p', text: '유령 카지노에서 열린 작은 게임들(돈벌레 게임, 더블 컬링 등)은 방송에서 규칙이 자세히 소개되지 않아 이 목록에 넣지 않았어요. 5일차 이벤트 "약탈의 날"은 저택에 숨겨진 금고를 두고 몸으로 겨루는 이벤트라 게임 규칙 페이지를 따로 두지 않았어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Bloody Game X games — every money challenge, death match and final game',
      description: "All eighteen games of Wavve's The Bloody Game X (2026) in broadcast order, from Running Mate, Mystery Time II, Blind Auction, Killer Game and Project Galaxy to the final's Pyramid Number, Choice Hold'em and Card Chess: rules, what decides each one, and similar board games.",
      keywords: ['The Bloody Game X', 'Bloody Game X games', '피의 게임X', 'Korean survival show games'],
    },
    title: 'The Bloody Game X games',
    name: 'The Bloody Game X',
    lead: 'Twenty players in five teams — stars of past seasons and newcomers — split between a mansion and the outdoors. Every game, in broadcast order.',
    intro: [
      "The Bloody Game X is the fourth instalment of Wavve's survival series The Bloody Game. Its 10 episodes were released on Fridays from 3 July to 28 August 2026. Three teams of standout players from seasons 1–3, a challenger team and a rookie team — 20 players — start as teams.",
      'This page lists its eighteen games **in broadcast order**, each with its own page of rules, what decides it, and similar board games.',
    ],
    summary: 'Released July–August 2026: twenty players in five teams, money challenges and death matches between a mansion and an outdoor camp, ending in a four-player knockout final.',
    format: [
      { type: 'p', text: 'The Bloody Game X **starts as a team game and becomes individual**. Each day a **money challenge** is played for team funds, and its losers face a **death match**.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['The mansion', 'Where players live. Game money (team and personal funds) is virtual and does not count toward the final prize.'],
        ['Outdoor camp', 'Where the last team of a money challenge (on day 1, of the opening game) is sent. Minimal food once a day; mansion funds cannot be used.'],
        ['Ghost casino', 'Opens once a day at the camp. Ingredients or prepared garlic are exchanged for coins (up to five per person per day), grown in casino games and spent on supplies. Coins are useless in the mansion.'],
        ['Death match', 'Candidates for elimination play; the loser leaves. Some death matches were team against team.'],
        ['Final', 'The top four of the semifinal play a knockout. The semifinal’s first and second pick the first two games; the remaining one is the third round, whose winner takes the ₩100 million prize.'],
      ] },
      { type: 'h3', text: 'Pandora’s vault and the switch to individual play' },
      { type: 'p', text: 'At the camp a "Pandora’s vault key" cost one coin; opening a vault brought both a gain and a penalty. The third vault triggered the event "Day of Plunder", after which every team was dissolved, money challenges became individual and the camp closed.' },
    ],
    extra: [
      { id: 'not-listed', title: 'Games not listed', blocks: [
        { type: 'p', text: 'The small ghost-casino games (such as the money-bug game and double curling) were not shown in enough detail and are left out. The day-5 event "Day of Plunder", a physical contest over vaults hidden in the mansion, has no rules page.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
