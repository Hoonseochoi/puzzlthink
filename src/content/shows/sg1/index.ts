// 소사이어티 게임 (The Society Game, season 1). tvN, Sundays 2016-10-16 – 2017-01-01, 12 episodes; fourteen days.
// Games in the order played: one challenge a day (days 2–13, none on day 11), then the three-round final on day 14.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, tvdbSeason } from './shared';
import { floorRemoval, foulBall, fourLegged, humanJanggi, numberClimbing, roundTable } from './games-a';
import { indomitableRunner, lumberjack, mosaic, rollingWord, wringingLaundry } from './games-b';
import { halfPipe, indomitableRunner2, puzzleTower } from './final';

const show: Show = {
  slug: 'society-game-1',
  series: 'society-game',
  short: { ko: '소사이어티 게임1', en: 'Society Game 1' },
  aired: { start: '2016-10-16', end: '2017-01-01' },
  network: { ko: 'tvN', en: 'tvN' },
  episodes: 12,
  color: '#2f6f5e',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    humanJanggi, roundTable, fourLegged, floorRemoval, numberClimbing, foulBall,
    indomitableRunner, lumberjack, mosaic, rollingWord, wringingLaundry,
    halfPipe, puzzleTower, indomitableRunner2,
  ],
  sources: [
    namuMain,
    tvdbSeason,
    { label: { ko: '서울신문 「‘소사이어티 게임’ 첫방」 기사 (2016년 10월 17일, 첫 방송 확인)', en: 'Seoul Shinmun, report on the first episode of The Society Game (17 October 2016; premiere date)' }, url: 'https://m.seoul.co.kr/news/2016/10/17/20161017500040' },
    { label: { ko: '부산일보 「새 예능 ‘소사이어티 게임’, 첫 방송 120분」 기사 (2016년 10월, 편성 확인)', en: 'Busan Ilbo, report on The Society Game’s 120-minute premiere (October 2016; schedule)' }, url: 'https://www.busan.com/view/busan/view.php?code=20161011000217' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '소사이어티 게임 시즌1 게임 정리 — 높동·마동의 챌린지 11개와 파이널 3라운드 전 규칙',
      description: 'tvN 「소사이어티 게임」 시즌1(2016)에 나온 챌린지 14개를 방송 순서대로 정리했어요. 인간장기, 고난의 원탁, 바닥빼기, 숫자 클라이밍, 불굴의 러너, 모자이크, 롤링워드부터 파이널 하프 파이프·퍼즐 타워·불굴의 러너Ⅱ까지, 리더·블랙리스트·주민 교환 같은 전체 형식과 함께 규칙과 승부처를 담았어요.',
      keywords: ['소사이어티 게임', '소사이어티 게임 시즌1', '소사이어티게임', '소사이어티 게임 챌린지', '소사이어티 게임 높동 마동', '소사이어티 게임 파이널', 'tvN 소사이어티 게임'],
    },
    title: '소사이어티 게임 시즌1 게임 정리',
    name: '소사이어티 게임 (시즌 1)',
    lead: '22명이 원형 마을의 두 사회, 높동과 마동으로 나뉘어 14일 동안 겨뤄요. 낮에는 마을 대항 챌린지, 밤에는 리더의 결정. 그 챌린지들을 방송 순서대로 모았어요.',
    intro: [
      '「소사이어티 게임」은 tvN의 모의 사회 서바이벌 예능 첫 시즌이에요. 2016년 10월 16일부터 2017년 1월 1일까지 매주 일요일 밤에 방송됐고, 모두 12부작이에요. 첫 회는 120분으로 편성됐어요.',
      '리더를 뽑는 방식이 다른 두 마을이 매일 하나의 챌린지로 맞붙어요. 이 페이지는 그 챌린지 11개와 파이널 3라운드, 모두 14개를 **방송 순서대로** 정리한 목차예요. 신체·두뇌·감각이 한 게임 안에 섞인 팀 대항전이 많아요.',
    ],
    summary: '2016년 10월–2017년 1월 방송. 투표로 리더를 뽑는 높동과 반란으로만 리더가 바뀌는 마동이 매일 챌린지로 맞붙고, 마을별 3명이 파이널에서 겨뤄요.',
    format: [
      { type: 'p', text: '원형 마을은 두 거주 구역과 챌린지가 열리는 **중립동**으로 나뉘어요. 22명은 사전 테스트 순위대로 두 마을 중 하나를 골라 들어가요. 마을마다 남자 7명, 여자 4명으로 정원이 정해져 있어요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['높동의 리더', '매일 아침 투표로 뽑아요. 30분 동안 최대 3명이 입후보하고(전 리더는 자동 입후보), 자기에게 투표할 수 있으며 기권은 안 돼요. 표가 같으면 전 리더가 정해요.'],
        ['마동의 리더', '첫 리더는 통과 의례로 정해요. 리더는 **반란의 열쇠**를 두 사람에게 나눠 주고, 열쇠를 가진 사람이 반란의 방의 징을 울린 뒤 30분 안에 주민 과반이 징을 치면 리더가 바뀌어요.'],
        ['리더의 권한', '리더의 방·감옥·리더 박스 열쇠를 갖고, 상금 분배·탈락자 지명·블랙리스트 작성 권한이 있어요. 리더 박스로 매일 아침 보상과 힌트가 와요.'],
        ['챌린지', '매일 낮 두 마을이 중립동에서 겨루는 팀전이에요. 이긴 마을은 **1,000만 원**과 생활 보상을 얻고, 리더가 상금을 100만 원 단위로 비공개 분배해요.'],
        ['탈락', '진 마을은 그날 저녁 리더가 아닌 주민 한 명을 탈락시켜요. 또 이긴 마을의 리더가 쓰는 **블랙리스트**에 두 번 이름이 오른 주민도 탈락해요. 블랙리스트는 지울 수 없어요.'],
        ['주민 교환', '특정한 날에는 두 마을이 주민을 한 명씩 맞바꿔요. 옮긴 주민의 개인 상금과 블랙리스트 기록도 함께 옮겨 가요.'],
        ['파이널', '마을마다 3명이 나와요. 남은 주민이 4명 이상이면 리더가 자신을 포함한 3명을 고르는 **파이널 디시전**이 열려요. 세 라운드 중 2라운드를 먼저 이긴 마을이 우승하고, 우승자들은 각자의 개인 상금만큼 우승 상금을 받아요.'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 것', blocks: [
        { type: 'p', text: '챌린지 규칙 설명 뒤 각 마을 대표 한 명씩이 겨루던 **미니게임**(석상 떨어뜨리기, 주사위 산수 등, 대부분 그날 챌린지의 한 부분과 같음)과, 마을을 고르기 위한 1일차 **사전 테스트**, 마동 첫 리더를 정한 통과 의례, 복권·경매 같은 생활 이벤트는 게임 페이지를 따로 두지 않았어요. 11일차는 비로 쉬어 챌린지가 없었어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Society Game season 1 games — all eleven challenges and the three-round final',
      description: 'All fourteen games of tvN’s The Society Game season 1 (2016) in broadcast order, from Human Janggi, The Round Table of Hardship, Floor Removal, Number Climbing, The Indomitable Runner, Mosaic and Rolling Word to the final’s Half Pipe, Puzzle Tower and The Indomitable Runner II, with the format: leaders, the blacklist and resident swaps.',
      keywords: ['The Society Game', 'Society Game season 1', '소사이어티 게임', 'Korean survival show games', 'Nopdong Madong'],
    },
    title: 'The Society Game season 1 games',
    name: 'The Society Game (season 1)',
    lead: 'Twenty-two players split into two societies of a circular village, Nopdong and Madong, for fourteen days: a village-against-village challenge by day, the leader’s decisions by night. Every challenge, in broadcast order.',
    intro: [
      'The Society Game is tvN’s mock-society survival show. Its first season aired on Sunday nights from 16 October 2016 to 1 January 2017, twelve episodes in all; the premiere ran 120 minutes.',
      'Two villages that choose their leaders differently meet in one challenge a day. This page lists the eleven challenges and the three final rounds, fourteen games **in broadcast order**; most mix body, brain and sense in one team event.',
    ],
    summary: 'Aired October 2016 – January 2017: Nopdong elects its leader by vote, Madong changes leaders only by rebellion; they meet daily in a challenge, and three from each village play the final.',
    format: [
      { type: 'p', text: 'The circular village has two living quarters and a **neutral zone** where challenges are held. The 22 players pick a village in order of a preliminary test; each village holds seven men and four women.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Nopdong’s leader', 'Elected by vote every morning: up to three candidates within 30 minutes (the previous leader is automatically one), self-votes allowed, no abstentions; ties are settled by the previous leader.'],
        ['Madong’s leader', 'The first is chosen by an initiation rite. The leader gives **rebellion keys** to two residents; a keyholder strikes the gong in the rebellion room, and if a majority strike it within 30 minutes, the leader changes.'],
        ['Leader’s powers', 'Keys to the leader’s room, the prison and the leader box; the power to split prize money, name the eliminee and write the blacklist. The leader box brings rewards and hints every morning.'],
        ['Challenge', 'A daily team event in the neutral zone. The winning village earns **₩10 million** and supplies; its leader splits the money privately in ₩1 million units.'],
        ['Elimination', 'The losing village eliminates one non-leader that evening. Anyone named twice on the **blacklist**, written by the winning leader, is also out; names cannot be removed.'],
        ['Resident swap', 'On certain days the villages exchange one resident each; prize money and blacklist marks move with them.'],
        ['Final', 'Three per village. If four or more remain, the leader picks the three, including themself, in the **final decision**. First to two of three rounds wins, and each winner receives their personal prize money as winnings.'],
      ] },
    ],
    extra: [
      { id: 'not-listed', title: 'Not listed', blocks: [
        { type: 'p', text: 'The **mini-games** played by one representative per village after each rules briefing (mostly a piece of that day’s challenge), the day 1 **preliminary test** used to choose villages, Madong’s first-leader rite and life events such as the lottery and auction have no pages of their own. Day 11 was a rest day because of rain, with no challenge.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
