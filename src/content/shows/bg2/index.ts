// 피의 게임2 (The Bloody Game 2). Wavve, 2023-04-28 – 2023-06-16, 13 episodes plus a behind-the-scenes episode.
// Games in the order played: each day's money challenge and death match, the semifinal, then the final bracket.
// A game that came back (정글 메이즈, 컬러턴, 시크릿 다이스) has one page, placed at its first appearance.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, namuRules } from './shared';
import { ascending, colorTurn, firstCome, jungleMaze } from './days-1-2';
import { equationRoad, mazeCode, mysteryNumber, numberChange, realTime, secretDice } from './days-4-6';
import { battleAscending, blackAndWhite, dayAndNight, hiddenMission, mainColor, numberAuction, patternBlock, realTimeAuction } from './days-7-11';

const show: Show = {
  slug: 'bloody-game-2',
  series: 'bloody-game',
  short: { ko: '피의 게임2', en: 'Bloody Game 2' },
  aired: { start: '2023-04-28', end: '2023-06-16' },
  network: { ko: '웨이브', en: 'Wavve' },
  episodes: 14,
  color: '#7d1f1f',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    firstCome, jungleMaze, ascending, colorTurn, numberChange, secretDice, equationRoad, mysteryNumber, realTime, mazeCode,
    blackAndWhite, dayAndNight, patternBlock, mainColor, realTimeAuction, battleAscending, numberAuction, hiddenMission,
  ],
  sources: [namuMain, namuRules, broadcast],
  ko: {
    meta: {
      title: '피의 게임2 게임 정리 — 머니 챌린지·데스매치·세미파이널·파이널 전 게임 규칙',
      description: '웨이브 「피의 게임2」(2023)에 나온 게임 18개를 방송 순서대로 정리했어요. 선착순, 정글 메이즈, 오름차순, 컬러턴, 넘버 체인지, 시크릿 다이스부터 세미파이널 숫자 경매, 파이널 히든 미션까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['피의 게임2', '피의게임2', '피의 게임 시즌2', '피의 게임2 게임', '피의게임2 게임 정리', '피의 게임2 머니 챌린지', '피의 게임2 데스매치', '피의 게임2 결승'],
    },
    title: '피의 게임2 게임 정리',
    name: '피의 게임2',
    lead: '피의 저택과 야생, 그리고 지하감옥. 매일 머니 챌린지와 투표, 데스매치가 이어져요. 그 게임들을 방송 순서대로 모았어요.',
    intro: [
      '「피의 게임2」는 웨이브의 서바이벌 「피의 게임」 시리즈의 두 번째 시즌이에요. 2023년 4월 28일부터 6월 16일까지 매주 금요일에 공개됐고, 본편 13회와 비하인드 1회로 모두 14회예요.',
      '이 페이지는 방송에 나온 게임 18개를 **처음 나온 순서대로** 정리한 목차예요. 다시 나온 게임(정글 메이즈, 컬러턴, 시크릿 다이스)은 한 페이지에 함께 담았어요.',
    ],
    summary: '2023년 4–6월 공개. 저택과 야생으로 나뉜 플레이어들이 머니 챌린지와 데스매치를 치르고, 세미파이널을 거쳐 1:1 토너먼트 파이널로 끝나요.',
    format: [
      { type: 'p', text: '피의 게임2는 **매일 머니 챌린지 → 투표 → 데스매치**가 반복되는 서바이벌이에요. 참가자는 실제 소득 구간에 따라 다른 개인 자금(게임 속 돈)을 받고 시작하고, 자금은 딜러를 통해 서로 주고받을 수 있어요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['머니 챌린지', '우승자는 상금 2,000만 원과 탈락 면제권을 받아요. 최하위는 탈락후보가 돼요.'],
        ['투표', '최하위가 두 사람을 지목하면, 투표로 그중 한 명을 또 다른 탈락후보로 정해요. 동률이면 재투표, 그래도 동률이면 그날의 우승자가 정해요.'],
        ['데스매치', '두 탈락후보가 1:1로 겨뤄 진 사람이 탈락하고, 그 사람의 개인 자금은 사라져요. 구경하는 사람들은 규칙도 진행도 볼 수 없어요.'],
        ['히든 메뉴판', '2,000만 원을 내면 볼 수 있는 비밀 아이템 목록이에요. 자금 공개권, 추가 투표권, 투표 스틸권 같은 아이템이 있었어요.'],
        ['판도라의 상자', '머니 챌린지 우승자가 받는 열쇠로 열 수 있는 상자예요. 이익과 불이익이 함께 들어 있어요.'],
        ['결승', '살아남은 5명이 세미파이널을 치르고, 최하위는 바로 탈락해요. 남은 4명이 1:1 토너먼트를 치러 우승자를 정하고, 우승자는 남은 개인 자금에 5,000만 원을 더해 받아요(최대 3억 원).'],
      ] },
      { type: 'h3', text: '저택과 야생' },
      { type: 'p', text: '3일차 "습격의 날"에 저택이 습격당하면서, 이후 한동안은 **저택 팀과 야생 팀의 팀전**이 이어졌어요. 진 팀은 야생에서 지내고, 투표로 고른 탈락후보가 지하감옥 수감자와 데스매치를 치렀어요. 개인전으로 돌아온 뒤에는 머니 챌린지 우승자가 **권력자**가 되어 한 사람을 하루 동안 저택 밖으로 내보낼 수 있었어요. 정체를 숨긴 **유령 플레이어**와 생필품을 얻는 **유령 카지노**도 있었어요.' },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 게임', blocks: [
        { type: 'p', text: '3일차 "습격의 날"처럼 몸으로 겨루는 이벤트와, 유령 카지노의 작은 게임들은 규칙 페이지를 따로 두지 않았어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Bloody Game 2 games — every money challenge, death match, semifinal and final game',
      description: "All eighteen games of Wavve's The Bloody Game 2 (2023) in order of play, from First Come, Jungle Maze, Ascending Order, Color Turn, Number Change and Secret Dice to the semifinal's Number Auction and the final's Hidden Mission: rules, what decides each one, and similar board games.",
      keywords: ['The Bloody Game 2', 'Bloody Game season 2 games', '피의 게임2', 'Korean survival show games'],
    },
    title: 'The Bloody Game 2 games',
    name: 'The Bloody Game 2',
    lead: 'A mansion, the wild and an underground prison: a money challenge, a vote and a death match every day. Every game, in order of play.',
    intro: [
      "The Bloody Game 2 is the second season of Wavve's survival series The Bloody Game, released on Fridays from 28 April to 16 June 2023: thirteen episodes plus a behind-the-scenes episode.",
      'This page lists its eighteen games **in order of first appearance**; games that returned (Jungle Maze, Color Turn, Secret Dice) share one page.',
    ],
    summary: 'Released April–June 2023: players split between a mansion and the wild play money challenges and death matches, then a semifinal and a one-on-one final bracket.',
    format: [
      { type: 'p', text: 'The Bloody Game 2 repeats **money challenge → vote → death match** each day. Players start with in-game personal funds set by their real income band, and can transfer funds through the dealer.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Money challenge', 'The winner gets ₩20 million and an immunity pass; last place becomes a candidate.'],
        ['Vote', 'Last place names two players and a vote makes one of them the second candidate; ties are revoted, then decided by the day’s winner.'],
        ['Death match', 'The two candidates play one-on-one; the loser leaves and their funds vanish. Spectators see neither rules nor play.'],
        ['Hidden menu', 'For ₩20 million you could see secret items such as a funds reveal, an extra vote or a vote steal.'],
        ['Pandora’s box', 'Opened with the key the challenge winner receives; it holds a benefit and a drawback together.'],
        ['Final', 'Five survivors play the semifinal and last place leaves at once; four play a one-on-one bracket, and the champion receives their remaining funds plus ₩50 million (up to ₩300 million).'],
      ] },
      { type: 'h3', text: 'The mansion and the wild' },
      { type: 'p', text: 'After the mansion fell on day 3’s "raid day", the game ran for a while as **mansion team against wild team**: the losers lived outdoors and their voted candidate faced the prisoner in the death match. Back to individual play, the challenge winner became the **ruler** and could expel one player from the mansion for a day. Hidden **ghost players** and a **ghost casino** for supplies also appeared.' },
    ],
    extra: [
      { id: 'not-listed', title: 'Games not listed', blocks: [
        { type: 'p', text: 'Physical events such as day 3’s raid and the small ghost-casino games have no rules page.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
