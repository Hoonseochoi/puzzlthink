// 피의 게임 (The Bloody Game, season 1). MBC with Wavve, 2021-11-01 – 2022-01-24, 12 episodes plus a special.
// Games in the order played: money challenges (days 2–6), the 피의 복수 challenges (7–9), the semifinal and the final.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, namuRules } from './shared';
import { battleRps, distribution, equation43, mineGame, richGame } from './games-a';
import { minusLadder, moneyBug, runningPuzzle, strategicEquation, strategyCard } from './games-b';

const show: Show = {
  slug: 'bloody-game-1',
  series: 'bloody-game',
  short: { ko: '피의 게임1', en: 'Bloody Game 1' },
  aired: { start: '2021-11-01', end: '2022-01-24' },
  network: { ko: 'MBC·웨이브', en: 'MBC and Wavve' },
  episodes: 13,
  color: '#6e1a24',
  spoiler: false,
  updated: '2026-11-26',
  games: [distribution, equation43, mineGame, richGame, battleRps, strategicEquation, strategyCard, moneyBug, minusLadder, runningPuzzle],
  sources: [namuMain, namuRules, broadcast],
  ko: {
    meta: {
      title: '피의 게임 시즌1 게임 정리 — 머니 챌린지·피의 복수 챌린지·결승 전 게임 규칙',
      description: 'MBC·웨이브 「피의 게임」 시즌1(2021–2022)에 나온 게임 10개를 방송 순서대로 정리했어요. 분배 게임, 수식 게임, 지뢰 게임, 부자 게임, 배틀 가위바위보, 전략 카드게임부터 세미파이널 돈·벌레 게임, 결승 마이너스 사다리·러닝 퍼즐까지 규칙과 승부처.',
      keywords: ['피의 게임', '피의 게임 시즌1', '피의게임1', '피의 게임1 게임', '피의 게임 시즌1 게임 정리', '피의 게임 머니 챌린지', '피의 게임 결승'],
    },
    title: '피의 게임 시즌1 게임 정리',
    name: '피의 게임 (시즌 1)',
    lead: '피의 저택의 지상층과, 탈락자들이 모인 비밀의 지하층. 매일 머니 챌린지와 탈락자 투표가 이어진 첫 시즌의 게임을 방송 순서대로 모았어요.',
    intro: [
      '「피의 게임」 시즌1은 MBC와 웨이브가 함께 선보인 서바이벌이에요. 2021년 11월 1일부터 2022년 1월 24일까지 MBC에서 방송됐고, 웨이브에서 먼저 공개됐어요. 본편 12회와 스페셜 1회예요.',
      '이 페이지는 규칙이 확인된 게임 10개를 **방송 순서대로** 정리한 목차예요.',
    ],
    summary: '2021년 11월–2022년 1월 방송. 투표로 탈락한 사람이 비밀 지하층에서 복귀를 노리고, 지상층과 지하층의 팀전을 거쳐 결승으로 끝나요.',
    format: [
      { type: 'p', text: '시즌1의 하루는 **머니 챌린지 한 번과 탈락자 투표 한 번**이에요. 데스매치 없이 투표로 탈락자가 정해지는 것이 이후 시즌과 가장 큰 차이예요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['개인 자금', '다른 참가자의 실제 작년 연봉을 비공개로 무작위로 골라 받아요(최소 2,000만 원, 최대 1억 원). 하루 2,000만 원까지 양도할 수 있어요.'],
        ['머니 챌린지', '우승자는 상금과 탈락 면제권을 받고, 둘 다 남에게 줄 수 있어요. 면제권은 그날 투표에서만 쓸 수 있어요.'],
        ['탈락자 투표', '매일 투표로 한 명이 탈락해요.'],
        ['지하층', '탈락자는 비밀 공간인 지하층으로 가요. 개인 자금이 사라지고, 노동과 퀴즈로 돈을 벌어 지상층 복귀를 노려요. 지상층 사람에게 들키면 불이익이 있어요.'],
        ['피의 복수 챌린지', '지하층이 5명이 되면 지하층의 존재가 공개되고, 지상층 팀 대 지하층 팀의 대결이 이어져요(7–9일차). 이긴 팀이 지상층에 살고, 진 팀은 투표로 최종 탈락자를 정해요.'],
        ['결승', '세미파이널(돈·벌레 게임) 뒤 파이널 1라운드에서 상위 2명을 가리고, 최종 라운드의 승자가 남은 개인 자금에 1억 원을 더해 받아요(최대 3억 원).'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 게임', blocks: [
        { type: 'p', text: '1일차 "탈락자 선정"은 대화 뒤 투표만 하는 순서라 규칙 페이지를 따로 두지 않았어요.' },
        { type: 'p', text: '5일차의 "체인지 박스"는 지하층 사람들이 치른 머니 챌린지인데, 본방송에서 거의 편집되어 규칙을 확인할 수 없어 뺐어요. 지하층의 브레인 챌린지와 노동도 게임 페이지를 두지 않았어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Bloody Game season 1 games — every money challenge, revenge challenge and final game',
      description: "Ten games of MBC and Wavve's The Bloody Game season 1 (2021–2022) in broadcast order, from the Distribution Game, Equation Game, Mine Game, Rich Game, Battle Rock Paper Scissors and Strategy Card Game to the semifinal's Money and Bug Game and the final's Minus Ladder and Running Puzzle.",
      keywords: ['The Bloody Game season 1', 'Bloody Game 1 games', '피의 게임 시즌1', 'Korean survival show games'],
    },
    title: 'The Bloody Game season 1 games',
    name: 'The Bloody Game (season 1)',
    lead: 'The upper floor of the mansion and a secret basement for the voted out: the first season’s games, in broadcast order.',
    intro: [
      'The first season of The Bloody Game was made by MBC with Wavve, broadcast on MBC from 1 November 2021 to 24 January 2022 and released first on Wavve: twelve episodes plus a special.',
      'This page lists the ten games whose rules could be confirmed, **in broadcast order**.',
    ],
    summary: 'Broadcast November 2021 – January 2022: the voted-out plot a comeback from a secret basement, then upper floor and basement face off before the final.',
    format: [
      { type: 'p', text: 'Each day of season 1 is **one money challenge and one elimination vote**; unlike later seasons there is no death match.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Personal funds', 'Each player secretly draws another contestant’s real salary from last year (between ₩20 million and ₩100 million); up to ₩20 million a day can be transferred.'],
        ['Money challenge', 'The winner gets prize money and an immunity pass, both giftable; the pass works only in that day’s vote.'],
        ['Elimination vote', 'One player is voted out every day.'],
        ['Basement', 'The voted out go to a secret basement, losing their funds, and earn money through labour and quizzes to return; being spotted by the upper floor is penalised.'],
        ['Revenge challenges', 'Once the basement holds five, its existence is revealed and the upper floor plays the basement as teams (days 7–9); winners live upstairs and losers vote one player out for good.'],
        ['Final', 'After the semifinal (Money and Bug Game), final round 1 picks two, and the last round’s winner gets their remaining funds plus ₩100 million (up to ₩300 million).'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: 'Games not listed', blocks: [
        { type: 'p', text: 'Day 1’s "elimination pick" is a discussion and vote, with no rules page.' },
        { type: 'p', text: 'Day 5’s "Change Box", a money challenge run by the basement players, was almost entirely cut from the broadcast, so its rules could not be confirmed. Basement quizzes and labour have no pages either.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
