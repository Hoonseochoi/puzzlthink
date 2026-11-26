import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'mosaic-puzzle',
  kind: 'death',
  when: { ko: '1–2일차', en: 'Days 1–2' },
  related: ['colorlink', 'starbattle', 'gradation'],
  updated: '2026-11-26',
  sources: [namuDay('1-2'), broadcast],
  ko: {
    meta: {
      title: '모자이크 퍼즐 규칙 — 피의 게임X 첫 데스매치, 같은 색을 가장 크게 잇기',
      description: '피의 게임X 첫 데스매치 모자이크 퍼즐의 규칙을 정리했어요. 4색 4분면 타일 90장, 말 앞 세 장 중 고르기, 4×4 개인 판 배치, 재배치와 점수 등록, 가장 큰 두 색 덩어리로 매기는 점수, 동점 처리까지.',
      keywords: ['모자이크 퍼즐', '피의 게임X 모자이크 퍼즐', '피의게임X 데스매치', '타일 배치 게임', '피의게임X'],
    },
    title: '모자이크 퍼즐 — 피의 게임X 첫 데스매치',
    name: '모자이크 퍼즐',
    lead: '네 칸으로 나뉜 색 타일을 4×4 판에 놓아, 같은 색이 이어진 덩어리를 가장 크게 만드는 퍼즐 대결이에요.',
    summary: '네 색이 나뉜 타일을 골라 4×4 판에 놓고, 가장 크게 이어진 두 색으로 점수를 내는 6인 데스매치.',
    setup: [
      { type: 'list', items: [
        '**인원**: 탈락 후보 6명의 개인전.',
        '**타일 90장**: 한 장이 네 구역(4분면)으로 나뉘어 있고, 구역마다 네 가지 색이 무작위로 칠해져 있어요.',
        '**개인 판**: 4×4, 16칸.',
        '**말**: 타일 더미 위를 움직이며, 다음 사람이 고를 수 있는 세 장을 가리켜요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '타일 고르기', body: '추첨한 순서대로, 말 앞에 놓인 타일 세 장 중 한 장을 가져와요. 그러면 말이 그 타일이 빠진 자리로 옮겨 가고, 다음 사람은 새 위치의 앞 세 장 중에서 골라요. 90장이 떨어질 때까지 반복해요.' },
        { title: '배치', body: '가져온 타일은 돌려서 원하는 칸에 놓아요. 한 번 놓으면 자리와 방향을 바꿀 수 없고, 새 타일을 가져오려면 이미 가져온 타일을 먼저 놓아야 해요.' },
        { title: '재배치와 점수 등록 (30분)', body: '모두 15장을 놓으면 30분 동안 대화 없이 타일을 옮길 수 있어요. 빈칸 쪽으로 밀어 옮기는 것만 되고, 빼서 돌리거나 바꾸는 건 안 돼요. 그동안 투표룸에서 몇 번이든 점수를 등록할 수 있어요.' },
      ] },
      { type: 'callout', tone: 'note', title: '점수 계산', text: '판에서 색마다 **가장 크게 이어진 구역의 칸 수**가 그 색의 점수예요. 그중 높은 두 색의 점수를 더한 값이 내 점수예요.' },
    ],
    win: [
      { type: 'list', items: [
        '30분이 끝나면 각자 등록한 점수 중 가장 높은 점수가 최종 점수예요.',
        '**최종 점수가 가장 낮은 1명이 최종 탈락**해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '등록된 점수 중 가장 낮은 점수는 메인 홀에 실시간으로 공개되다가, 끝나기 5분 전부터는 가려져요.',
        '최하위가 동점이면, 계산에 쓰지 않은 나머지 두 색의 점수까지 더해 낮은 쪽이 탈락해요.',
        '판은 16칸인데 놓는 타일은 15장이라, 빈칸이 하나 남아요. 재배치는 이 빈칸을 이용한 밀기 퍼즐이 돼요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '모자이크 퍼즐은 **드래프트(고르기)와 슬라이딩 퍼즐이 합쳐진** 게임이에요. 고르는 단계에서는 남의 선택지를 조종하고, 재배치 단계에서는 빈칸 하나로 판을 정리해요.' },
      { type: 'cards', items: [
        { title: '두 색에 집중하세요', body: '점수는 가장 높은 두 색만 세요. 네 색을 다 살리려 하면 덩어리가 잘게 쪼개져요. 처음 몇 장에서 많이 나오는 두 색을 정하고, 그 두 색이 판의 한쪽씩을 차지하도록 놓으면 타일 경계마다 색이 이어질 확률이 커요.' },
        { title: '타일 한 장 안의 네 구역', body: '타일 하나에 네 구역이 있어서, 이웃한 두 타일이 맞닿는 변에서는 두 구역씩 만나요. 같은 색이 한 변의 두 구역을 모두 차지한 타일이 덩어리를 잇기에 가장 좋아요. 돌릴 수 있으니, 그런 변을 이미 놓은 덩어리 쪽으로 향하게 하세요.' },
        { title: '말의 위치는 공격 수단', body: '내가 고른 자리로 말이 옮겨 가므로, 내 선택이 다음 사람의 세 장을 정해요. 다음 사람에게 좋은 타일이 남지 않는 자리를 고르는 방어적 선택이 가능해요. 6명이 같은 더미를 나눠 쓰는 만큼, 순서가 가까운 사람끼리의 신경전이 커요.' },
        { title: '빈칸 하나의 슬라이딩', body: '재배치는 빈칸 한 칸으로 타일을 밀어 옮기는 15퍼즐과 같아요. 원하는 배치를 떠올려도 거기까지 가는 이동이 많아 30분이 짧을 수 있어요. 중간에 좋은 점수가 나올 때마다 등록해 두면 최고점이 남으므로, 자주 등록하는 것이 안전해요.' },
        { title: '최저 점수 공개의 의미', body: '최저 점수가 공개되는 동안에는 "꼴찌만 아니면 된다"는 기준이 보여요. 마지막 5분에 가려지는 것은 그 기준에 맞춰 멈추는 전략을 막기 위해서예요. 결국 끝까지 점수를 올리는 쪽이 안전해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '카르카손 (Carcassonne)', players: '2–5명', alike: '타일을 돌려 맞대어 놓으며 같은 지형을 크게 이어 점수를 내요.', differs: '카르카손은 모두가 같은 판을 함께 만들고, 일꾼을 놓아 점수를 가져가요.' },
      { name: '15 퍼즐', players: '1명', alike: '빈칸 하나를 이용해 칸을 밀어 원하는 배치를 만드는 슬라이딩 퍼즐이에요.', differs: '15 퍼즐은 정답 배치가 하나로 정해져 있고, 고르는 단계가 없어요.' },
      { name: '아줄 (Azul)', players: '2–4명', alike: '공용 타일 묶음에서 고르면서 남에게 남길 타일까지 계산하는 드래프트가 있어요.', differs: '아줄은 개인 판의 줄과 열을 채워 점수를 내고, 덩어리 크기는 따지지 않아요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: 'Mosaic Puzzle rules — The Bloody Game X, first death match',
      description: 'The rules of Mosaic Puzzle from The Bloody Game X (피의 게임X): 90 tiles with four coloured quadrants, picking from the three in front of the marker, a 4×4 personal board, sliding and score registration, scoring by the two largest colour groups, and the tie-break.',
      keywords: ['Mosaic Puzzle', 'Bloody Game X death match', 'tile placement game', '피의 게임X'],
    },
    title: 'Mosaic Puzzle — The Bloody Game X, first death match',
    name: 'Mosaic Puzzle',
    lead: 'Place tiles split into four coloured quadrants on a 4×4 board to make the biggest connected patches of colour.',
    summary: 'Draft quartered colour tiles onto a 4×4 board and score your two biggest colour groups; lowest score is out.',
    setup: [
      { type: 'list', items: [
        '**Players**: six candidates for elimination, each for themselves.',
        '**90 tiles**: each split into four quadrants coloured at random in four colours.',
        '**Personal board**: 4×4, sixteen cells.',
        '**Marker**: moves over the tile spread, pointing at the three tiles the next player may take.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Picking', body: 'In drawn order, take one of the three tiles in front of the marker; the marker moves to the gap, and the next player picks from the three in front of it. Repeat until all 90 are gone.' },
        { title: 'Placing', body: 'Rotate a tile and place it in any cell. Placed tiles cannot move or turn, and you must place one before taking another.' },
        { title: 'Sliding and registering (30 minutes)', body: 'With 15 tiles placed, players have 30 silent minutes to slide tiles into the empty cell (no lifting, turning or swapping) and may register a score in the voting room as often as they like.' },
      ] },
      { type: 'callout', tone: 'note', title: 'Scoring', text: 'Each colour scores **the size of its largest connected area**; your score is the sum of your two best colours.' },
    ],
    win: [
      { type: 'list', items: [
        'Each player’s best registered score is final.',
        '**The lowest final score is eliminated.**',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'The lowest registered score is shown live in the main hall, then hidden for the last five minutes.',
        'A tie for last adds the two unused colours; the lower total is eliminated.',
        'Sixteen cells and fifteen tiles leave one gap, which turns the rearrangement into a sliding puzzle.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Mosaic Puzzle combines **a draft with a sliding puzzle**: steer others’ options while picking, then tidy the board with a single gap.' },
      { type: 'cards', items: [
        { title: 'Commit to two colours', body: 'Only your top two colours score; chasing all four fragments the groups. Pick two colours early and give each its side of the board, so tile edges keep matching.' },
        { title: 'Quadrants meet in pairs', body: 'Adjacent tiles meet along an edge where two quadrants face two quadrants. Tiles with one colour on both quadrants of an edge join groups best; rotate that edge toward the group.' },
        { title: 'The marker is a weapon', body: 'Your pick moves the marker, so it decides the next player’s three options. Choosing a gap that leaves them nothing good is a real defensive move among six players sharing one spread.' },
        { title: 'One-gap sliding', body: 'The rearrangement is a 15-puzzle: the target layout may need many slides, and 30 minutes is short. Your best registration counts, so register every improvement.' },
        { title: 'Why the minimum is hidden late', body: 'While the lowest score is visible you know the bar to clear; hiding it for the last five minutes stops players from stopping just above it. Keep improving to the end.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Carcassonne', players: '2–5', alike: 'Rotate and match tiles to grow large connected areas.', differs: 'Everyone builds one shared map and scores with placed followers.' },
      { name: '15 puzzle', players: '1', alike: 'Slide pieces into a single gap to reach a layout.', differs: 'The target is fixed and there is no drafting.' },
      { name: 'Azul', players: '2–4', alike: 'Drafting from shared tiles while thinking about what you leave for others.', differs: 'You fill rows and columns of a personal board; group size does not matter.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
