// 더 지니어스: 게임의 법칙 (The Genius, season 1). tvN, 2013-04-26 – 2013-07-12, 12 episodes, one round per episode.
// Games in the order played; a death match used in several rounds has one page, placed at its first appearance.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, namuSeries, wikipedia } from './shared';
import { election, feastFamine, oneTwoThree, zombie } from './main-1-4';
import { beanDilemma, catchThief, horseRace, openPass } from './main-5-8';
import { equationAuction, fiveFive, lockedHorseRace } from './main-9-11';
import { imageGame, indianPoker, samePicture, strategicYut, winningStreak } from './death';
import { gyulHap } from './final';

const show: Show = {
  slug: 'the-genius-1',
  seo: 'genius1',
  series: 'the-genius',
  short: { ko: '더지니어스1', en: 'The Genius 1' },
  aired: { start: '2013-04-26', end: '2013-07-12' },
  network: { ko: 'tvN', en: 'tvN' },
  episodes: 12,
  color: '#8a1c3c',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    oneTwoThree, winningStreak, election, feastFamine, strategicYut, zombie, horseRace, catchThief, indianPoker,
    openPass, beanDilemma, imageGame, equationAuction, lockedHorseRace, fiveFive, samePicture, gyulHap,
  ],
  sources: [
    namuMain,
    namuSeries,
    wikipedia,
    { label: { ko: '뉴스토마토 「더 지니어스: 게임의 법칙」 관련 기사 (2013년, 첫 방송일 확인)', en: 'News Tomato, report on The Genius: Rules of the Game (2013; premiere date)' }, url: 'https://www.newstomato.com/RealTime/RealTimeDetail.aspx?no=360499' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '더 지니어스 시즌1 게임의 법칙 게임 정리 — 메인 매치·데스 매치·결승 전 게임 규칙',
      description: 'tvN 「더 지니어스: 게임의 법칙」(2013)에 나온 게임 17개를 방송 순서대로 정리했어요. 1·2·3 게임, 대선 게임, 좀비 게임, 사기 경마, 도둑잡기, 오픈 패스, 콩의 딜레마, 수식 경매, 5 대 5부터 데스 매치 연승 게임·전략 윷놀이·인디언 포커·같은 그림 찾기, 결승 결! 합!까지 규칙과 승부처, PUZZLTHINK에서 바로 플레이.',
      keywords: ['더 지니어스', '더 지니어스 시즌1', '더지니어스1', '더 지니어스 게임의 법칙', '지니어스 게임의 법칙 게임', '더 지니어스 게임 정리', '더 지니어스 데스매치', '더 지니어스 메인매치'],
    },
    title: '더 지니어스 시즌1 「게임의 법칙」 게임 정리',
    name: '더 지니어스: 게임의 법칙 (시즌 1)',
    lead: '13명이 12회전 동안 매주 한 명씩 떨어지는 두뇌 서바이벌의 첫 시즌. 메인 매치로 살아남을 사람을, 데스 매치로 떠날 사람을 가렸어요. 그 게임들을 방송 순서대로 모았어요.',
    intro: [
      '「더 지니어스: 게임의 법칙」은 tvN의 두뇌 서바이벌 예능 「더 지니어스」의 첫 시즌이에요. 2013년 4월 26일부터 7월 12일까지 매주 금요일 밤에 방송됐고, 모두 12부작이에요. 한 화가 한 회전이에요.',
      '이 페이지는 메인 매치 11개, 데스 매치 5개, 결승에서 처음 나온 결! 합!까지 **17개 게임을 방송 순서대로** 정리한 목차예요. 여러 회전에 쓰인 데스 매치는 처음 나온 자리에 한 번만 두었어요. 그중 인디언 포커와 결! 합!은 PUZZLTHINK에서 바로 플레이할 수 있어요.',
    ],
    summary: '2013년 4–7월 방송. 매 회전 메인 매치와 1:1 데스 매치로 한 명씩 탈락하고, 3전 2선승 결승으로 끝나는 시리즈의 첫 시즌이에요.',
    format: [
      { type: 'p', text: '게임의 화폐는 **가넷**이에요. 모두 가넷 1개로 시작하고, 가넷 1개는 상금 100만 원의 가치가 있어요. 최종 우승자는 가진 가넷만큼을 상금으로 받아요. 규칙에 어긋나지 않는 행동은 무엇이든 허용되지만, **폭력과 절도는 금지**예요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['메인 매치', '생존자 전원이 참가하는 게임이에요. 우승자는 **생명의 징표**를 받아 그 회전의 탈락을 피해요. 단독 우승자는 여분의 징표 하나를 최하위 탈락 후보가 아닌 다른 사람에게 줄 수 있어요.'],
        ['탈락 후보', '메인 매치의 최하위가 탈락 후보가 되고, 생명의 징표가 없는 사람 중 한 명을 데스 매치 상대로 지목해요.'],
        ['데스 매치', '1:1 게임이에요. 진 사람이 그 회전의 탈락자가 돼요. 10·11회전에는 지목 없이 징표가 없는 두 사람이 자동으로 나갔어요.'],
        ['결승 (12회전)', '세 경기 중 두 경기를 먼저 이기면 우승이에요. 첫 경기는 "게임 선택" 아이템을 가진 사람이 정하고, 두 번째는 결! 합!이에요. 우승자는 두 사람의 가넷에 특별 상금 가넷 20개를 더해 받아요.'],
        ['결승 아이템', '아이템 12개 중 11개를 탈락자들이 하나씩 뽑아 지지하는 결승 진출자에게 주고, 남은 하나는 가넷이 많은 사람이 가져요. 칩 5개 추가, 카드 숫자 +2, 상대 아이템 무효화, 아이템 복사, 합 개수 공개, 점수 2배, 그림 전체 보기, 1칸 전진, 3칸 이동 같은 아이템이 있었어요.'],
      ] },
    ],
    extra: [
      { id: 'recurring', title: '여러 번 쓰인 데스 매치', blocks: [
        { type: 'p', text: '이 시즌의 데스 매치는 다섯 종류뿐이라 같은 게임이 여러 번 나왔어요. 연승 게임은 1·2·5회전, 전략 윷놀이는 3·4·10회전, 인디언 포커는 6·7·9회전과 결승 1회전에 쓰였어요. 같은 그림 찾기는 11회전에 나온 뒤 결승 3회전으로도 준비됐지만, 결승이 두 경기로 끝나 실제로 하지는 않았어요.' },
        { type: 'p', text: '인디언 포커, 전략 윷놀이, 같은 그림 찾기, 결! 합!은 이후 시즌에도 다시 나와요. 이 페이지들은 시즌1의 규칙으로 썼고, 다른 시즌의 규칙은 해당 시즌 페이지에서 다뤄요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Genius season 1 (Rules of the Game) games — every main match, death match and final game',
      description: 'All seventeen games of tvN’s The Genius: Rules of the Game (2013) in broadcast order, from the 1·2·3 Game, the Election Game, the Zombie Game, the Fraud Horse Race, Catch the Thief, Open Pass, the Bean Dilemma, the Equation Auction and Five to Five to the death matches and the final’s Gyul! Hap! — two of them playable on PUZZLTHINK.',
      keywords: ['The Genius', 'The Genius season 1', 'The Genius Rules of the Game games', '더 지니어스 시즌1', 'Korean survival show games'],
    },
    title: 'The Genius season 1, "Rules of the Game": the games',
    name: 'The Genius: Rules of the Game (season 1)',
    lead: 'The first season of the brain-survival series: thirteen players, twelve rounds, one elimination a week — a main match to decide who is safe and a death match to decide who leaves. Every game, in broadcast order.',
    intro: [
      'The Genius: Rules of the Game is the first season of tvN’s brain-survival show The Genius, broadcast on Friday nights from 26 April to 12 July 2013 — twelve episodes, one round each.',
      'This page lists **all seventeen games in broadcast order**: eleven main matches, five death matches and Gyul! Hap!, introduced in the final. Death matches used in several rounds appear once, where they first appeared. Indian Poker and Gyul! Hap! can be played on PUZZLTHINK.',
    ],
    summary: 'Broadcast April–July 2013: a main match and a one-on-one death match each round, ending in a best-of-three final — the series’ first season.',
    format: [
      { type: 'p', text: 'The currency is **garnets**: everyone starts with one, each worth ₩1 million of prize money, and the champion takes their garnets as the prize. Anything the rules do not forbid is allowed, except **violence and theft**.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Main match', 'All survivors play; the winner gets a **token of life** and is safe that round. A sole winner may give a spare token to anyone but the elimination candidate.'],
        ['Elimination candidate', 'The main match’s last place becomes the candidate and names a death-match opponent from those without a token.'],
        ['Death match', 'A one-on-one game; the loser is eliminated. In rounds 10 and 11 the two without tokens went straight there, without a nomination.'],
        ['Final (round 12)', 'First to win two of three games. The holder of the "game choice" item picks game one; game two is Gyul! Hap!. The champion takes both finalists’ garnets plus a 20-garnet bonus.'],
        ['Final items', 'The eliminated players each draw one of twelve items for the finalist they support; the last goes to the finalist with more garnets. They included five extra chips, +2 to a card, cancelling an item, copying an item, number of haps, double score, see the whole board, advance one and move three.'],
      ] },
    ],
    extra: [
      { id: 'recurring', title: 'Death matches used more than once', blocks: [
        { type: 'p', text: 'There were only five death matches, so they repeated: the Winning Streak in rounds 1, 2 and 5, Strategic Yut in rounds 3, 4 and 10, and Indian Poker in rounds 6, 7 and 9 and the final’s first game. Same Picture Hunt followed in round 11 and was prepared as the final’s third game, which was never needed.' },
        { type: 'p', text: 'Indian Poker, Strategic Yut, Same Picture Hunt and Gyul! Hap! return in later seasons; these pages give the season-1 rules, and later seasons are covered on their own pages.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
