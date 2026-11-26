import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'balance-mancala',
  kind: 'main',
  when: { ko: '5일차', en: 'Day 5' },
  related: ['gradation', 'fourThree', 'nineMensMorris'],
  updated: '2026-11-26',
  sources: [namuDay(5), broadcast],
  ko: {
    meta: {
      title: '균형의 만칼라 규칙 — 데블스플랜2(데스룸) 5일차 메인매치, 세 색을 고르게',
      description: '데블스 플랜: 데스룸(데블스플랜2) 5일차 메인매치 균형의 만칼라의 규칙을 정리했어요. 빨강·파랑·초록 접시와 천사칸·악마칸, 말 뿌리기와 점수, 30점 종료, "가장 적은 색 − 차이" 최종 점수, 피스 페널티까지.',
      keywords: ['균형의 만칼라', '만칼라', '데블스플랜2 균형의 만칼라', '데블스 플랜 데스룸 만칼라', '데블스플랜2 메인매치'],
    },
    title: '균형의 만칼라 — 데블스플랜2 5일차 메인매치',
    name: '균형의 만칼라',
    lead: '만칼라처럼 말을 한 칸씩 뿌려 점수를 얻는데, 세 가지 색의 점수가 고를수록 높은 점수예요.',
    summary: '말을 시계 방향으로 뿌리며 빨강·파랑·초록 점수를 모으고, 세 색을 고르게 맞출수록 이기는 만칼라.',
    setup: [
      { type: 'list', items: [
        '**인원**: 다섯째 날 생존자 7명.',
        '**게임판**: 빨강·파랑·초록 접시가 번갈아 둥글게 놓이고, 맨 위에 검은 **악마칸**, 맨 아래에 흰 **천사칸**이 있어요.',
        '**말**: 각자 개인 말 4개.',
        '**순서**: 추첨으로 1–7번을 정하고, 순서대로 말을 하나씩 판에 놓아요. 한 접시에는 최대 2개까지예요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '집어 들기', body: '1번부터 차례로, 내 말이 있는 칸 하나를 골라 그 칸의 말을 **전부**(남의 말 포함) 집어 들어요.' },
        { title: '뿌리기', body: '시계 방향으로 한 칸에 하나씩 내려놓아요.' },
        { title: '점수', body: '**마지막으로 내려놓은 말의 주인**이, 그 칸에 있는 말 개수만큼 그 접시 색의 점수를 받아요.' },
        { title: '천사·악마칸', body: '마지막 말이 천사칸에 떨어지면 그 주인이 가장 적게 가진 색의 점수를, 악마칸이면 가장 많이 가진 색의 점수를 말 개수만큼 받아요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '누군가 **한 색에서 30점 이상**이 되면 바로 끝나요.',
        '최종 점수는 **가장 적은 색 점수 − (가장 많은 색 점수 − 가장 적은 색 점수)**예요. 예를 들어 13·11·20이면 11 − 9 = 2점이에요.',
        '15점 이하인 사람은 가진 피스의 절반(내림)을 내요. 1위는 꼴찌에게서 피스 5개를 빼앗아요(5개가 안 되면 전부).',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '점수는 말을 움직인 사람이 아니라 **마지막 말의 주인**이 받아요. 내 차례에 남에게 점수를 줄 수도 있어요.',
        '천사·악마칸에서 가장 적은(많은) 색이 둘 이상 같으면, 말을 움직인 사람이 색을 골라요.',
        '점수 현황은 실시간으로 모두에게 공개돼요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '균형의 만칼라는 **많이 버는 게임이 아니라 고르게 버는 게임**이에요. 최종 점수 공식 때문에 한 색만 높으면 오히려 점수가 깎여요.' },
      { type: 'cards', items: [
        { title: '30점은 끝내기 버튼', body: '누군가 한 색에서 30점이 되면 끝나는데, 그 사람은 보통 세 색이 고르지 않아 최종 점수가 낮아요. 그래서 한 색이 높은 사람에게 점수를 몰아줘 게임을 일찍 끝내는 것도 공격이 될 수 있어요.' },
        { title: '악마칸은 독, 천사칸은 약', body: '악마칸은 가장 많은 색에 점수를 더해 불균형을 키우고, 천사칸은 가장 적은 색을 채워 균형을 맞춰요. 남의 말이 악마칸에 마지막으로 떨어지게 만드는 것이 좋은 방해 수예요.' },
        { title: '내 말이 남의 손에', body: '남이 내 말이 있는 칸을 집어 뿌리면 내 말이 마지막에 떨어질 수도 있어요. 모든 이동이 모든 사람의 점수를 바꿀 수 있어, 7명 사이의 계산이 복잡해져요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '만칼라 (칼라)', players: '2명', alike: '구멍의 씨앗을 모두 집어 한 칸씩 뿌리고, 마지막 씨앗이 떨어진 곳에 따라 결과가 갈리는 바탕 규칙이에요.', differs: '전통 만칼라는 둘이서 씨앗을 많이 모으는 게임이고, 색이나 균형 개념은 없어요.' },
      { name: '파이브 트라이브스 (Five Tribes)', players: '2–4명', alike: '타일 위의 말을 모두 집어 한 칸씩 내려놓는 만칼라식 이동으로, 마지막 칸에서 행동해요.', differs: '파이브 트라이브스는 말 색깔마다 다른 능력과 점수가 있고, 경매로 순서를 정해요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Balance Mancala rules — The Devil's Plan 2 (Death Room), day 5 main match",
      description: "The rules of Balance Mancala from The Devil's Plan: Death Room (season 2): red, blue and green dishes with an angel and a devil space, sowing pieces and scoring, the end at 30, the final score of lowest minus spread, and the piece penalties.",
      keywords: ['Balance Mancala', "Devil's Plan 2 Balance Mancala", "Devil's Plan Death Room main match", 'mancala'],
    },
    title: "Balance Mancala — The Devil's Plan 2, day 5 main match",
    name: 'Balance Mancala',
    lead: 'Sow pieces one dish at a time like mancala — but the more even your three colours, the higher your score.',
    summary: 'Sow pieces clockwise to collect red, blue and green points; the most balanced scores win.',
    setup: [
      { type: 'list', items: [
        '**Players**: the 7 still in on day 5.',
        '**Board**: red, blue and green dishes in a ring, with a black **devil space** at the top and a white **angel space** at the bottom.',
        '**Pieces**: four personal pieces each.',
        '**Order**: drawn 1–7; players place pieces one at a time, at most two per dish.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Pick up', body: 'From player 1, choose a space holding one of your pieces and pick up **every** piece there, anyone’s.' },
        { title: 'Sow', body: 'Drop them one per space, clockwise.' },
        { title: 'Score', body: '**The owner of the last piece dropped** scores as many points of that dish’s colour as there are pieces there.' },
        { title: 'Angel and devil', body: 'Last piece in the angel space: its owner scores that many in their lowest colour; in the devil space, in their highest.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'The game ends at once when anyone reaches **30 in one colour**.',
        'Final score = **lowest colour − (highest colour − lowest colour)**; 13/11/20 gives 11 − 9 = 2.',
        'Players on 15 or less pay half their pieces (rounded down); first place takes 5 pieces from last place (all, if fewer).',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Points go to **the last piece’s owner**, not the mover — your turn can score for someone else.',
        'If two colours tie for lowest (or highest) at the angel (devil) space, the mover picks the colour.',
        'Scores are shown live to everyone.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Balance Mancala is **about earning evenly, not earning a lot**. The final formula punishes a single high colour.' },
      { type: 'cards', items: [
        { title: '30 is the off switch', body: 'Whoever hits 30 in one colour ends the game, usually with an unbalanced, low final score. Feeding points to a lopsided player to end the game early is itself an attack.' },
        { title: 'Devil poisons, angel heals', body: 'The devil adds to your highest colour, widening the spread; the angel fills your lowest. Making someone else’s piece land last on the devil space is a strong spoiler.' },
        { title: 'Your piece in their hands', body: 'Others sowing from a space with your piece may drop it last. Every move can change everyone’s score, which makes seven-player calculation hard.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Mancala (Kalah)', players: '2', alike: 'Pick up all seeds in a pit and sow one per pit; where the last lands decides what happens.', differs: 'Two players collect as many seeds as possible; there is no colour or balance.' },
      { name: 'Five Tribes', players: '2–4', alike: 'Mancala-style movement: pick up every meeple on a tile and drop them one by one, acting where the last lands.', differs: 'Meeple colours carry different abilities and points, and turn order is bid for.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
