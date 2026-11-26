import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'equation-combo',
  kind: 'money',
  when: { ko: '5일차', en: 'Day 5' },
  related: ['equationTower', 'hexagon', 'equationSignal'],
  updated: '2026-11-26',
  sources: [namuDay('5'), broadcast],
  ko: {
    meta: {
      title: '수식 콤보 규칙 — 피의 게임X 5일차 머니 챌린지, 10의 거듭제곱 만들기',
      description: '피의 게임X 5일차 머니 챌린지 수식 콤보의 규칙을 정리했어요. 저택에 숨겨진 수식 타일 175개, 127칸 육각 게임판, 5라운드 수색, 말을 옮기며 즉시 계산하는 콤보, 10·100·1000만 인정, 승점 공식과 미사용 타일 감점까지.',
      keywords: ['수식 콤보', '피의 게임X 수식 콤보', '피의게임X 머니 챌린지', '수식 게임', '피의게임X'],
    },
    title: '수식 콤보 — 피의 게임X 5일차 머니 챌린지',
    name: '수식 콤보',
    lead: '저택 곳곳에 숨은 수식 타일을 찾아 육각 판에 깔고, 말을 굴려 10, 100, 1000 같은 값을 만드는 연합전이에요.',
    summary: '숨겨진 수식 타일을 찾아 육각 판을 꾸미고, 말이 지나간 길의 계산값이 10의 거듭제곱이 되는 콤보를 만드는 2:2 연합전.',
    setup: [
      { type: 'list', items: [
        '**인원**: 두 팀씩 묶은 연합 두 개(2:2 연합전).',
        '**게임판**: 연합마다 육각형 127칸짜리 판.',
        '**수식 타일 175개**: 저택 곳곳에 숨어 있어요. +와 −는 1–9가 8세트씩, ×는 1–5가 3세트, ÷는 1–4가 4세트예요.',
        '**라운드**: 5라운드. 1–4라운드는 15분, 5라운드는 30분이고 사이에 10분씩 준비 시간이 있어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '수색', body: '라운드마다 연합당 두 명이 저택을 뒤져 타일이 든 봉투를 찾고, 투표룸에서 타일로 바꿔요.' },
        { title: '판 꾸미기', body: '찾은 타일을 연합의 판에 놓아요. 5라운드에는 새로 등록할 수 없고, 처음 10분 동안 투표룸에 타일을 버릴 수 있으며, 버려진 타일은 누구나 가져갈 수 있어요. 5라운드가 끝나기 전에 판을 제출하면 더는 고칠 수 없어요.' },
        { title: '콤보 만들기 (20분)', body: '연합 대표가 투표룸에서 필기 없이, 말 하나를 판의 타일 위에 올리고 이웃한 타일로 옮겨 가며 수식을 쌓아요. **시작 칸의 기호는 무시**하고, 계산은 **우선순위 없이 옮길 때마다 바로** 해요.' },
        { title: '콤보 선언', body: '원할 때 멈춰 콤보를 선언해요. 값이 **10의 거듭제곱(10, 100, 1000…)**일 때만 인정돼요. 성공하면 시작 타일이 빠지고, 마지막에 멈춘 타일이 새 시작이 되어 이어서 콤보를 노릴 수 있어요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**콤보 승점** = 사용한 타일 수 × 결과값의 0의 개수.',
        '**최종 승점** = (콤보 승점의 합 − 미사용 타일 수) × 콤보 개수. 가장 많은 타일로 콤보를 완성하면 +100점.',
        '이긴 연합은 전원 탈락 면제와 팀마다 5,000만 원을 받고, 진 연합은 전원 탈락 후보가 되어 팀전 데스매치를 해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**미사용 타일**: 판에 놓지 않은 타일과, 판에 놓았지만 말이 한 번도 지나가지 않은 칸의 타일이에요.',
        '말이 막히면 처음 구역에서 다시 시작할 수 있고, 더는 콤보가 불가능하면 자동으로 끝나요.',
        '아이템(1,000만 원): **+10 타일**(계산에 쓸 타일 추가), **수색 인원 추가**(다음 라운드 수색자 1명 추가).',
      ] },
    ],
    analysis: [
      { type: 'p', text: '수식 콤보의 점수 공식은 **콤보 개수를 곱한다**는 점이 결정적이에요. 아무리 긴 콤보 하나를 만들어도, 짧은 콤보 여러 개를 이어 붙인 쪽이 곱셈 덕에 크게 앞설 수 있어요.' },
      { type: 'cards', items: [
        { title: '즉시 계산은 설계를 쉽게 해요', body: '우선순위 없이 지나갈 때마다 계산하므로, 지금 값과 다음 타일만 보면 돼요. 예를 들어 값이 5일 때 ×2 칸으로 가면 10, 이어서 ×10이 없다면 ×5와 ×2를 차례로 지나 100을 만들 수 있어요. 판을 꾸밀 때 "10을 만드는 짧은 길"을 여러 개 이어 놓는 것이 기본 설계예요.' },
        { title: '이어지는 콤보의 구조', body: '콤보에 성공하면 마지막 칸이 다음 시작이 되는데, 시작 칸의 기호는 무시되므로 그 칸의 숫자 하나로 새 계산이 시작돼요. 그래서 콤보의 끝 칸을 "다음 콤보의 좋은 출발 숫자"로 설계하면 한 줄의 길에서 콤보를 연달아 터뜨릴 수 있어요.' },
        { title: '안 쓰는 타일은 벌점', body: '판에 놓고 말이 지나가지 않은 타일도 감점이라, 많이 찾는 것보다 쓸모 있게 놓는 것이 중요해요. 5라운드에 쓸모없는 타일을 투표룸에 버리는 규칙은 감점을 피하는 출구이자, 상대 연합에게 타일을 넘기는 위험이기도 해요.' },
        { title: '수색과 계산의 분업', body: '타일은 저택 곳곳에 숨어 있어 몸을 쓰는 수색이 필요하고, 마지막 20분은 대표 한 명의 계산이 전부예요. 수색자와 설계자, 콤보를 실행할 대표의 역할을 일찍 나누고, 대표가 필기 없이 따라갈 수 있게 판을 단순한 길로 꾸미는 연합이 유리해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '크립토 (Krypto)', players: '1명 이상', alike: '숫자 카드를 사칙연산으로 이어 목표 값을 만드는 게임이에요.', differs: '크립토는 판도 길도 없이 숫자를 자유롭게 조합해요.' },
      { name: '스크래블 (Scrabble)', players: '2–4명', alike: '모은 타일을 판에 배치해, 길게 이어질수록 점수가 커지는 조합을 만들어요.', differs: '스크래블은 글자로 단어를 만들고, 타일은 무작위로 뽑아요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 히든 아이템과 연합 구성의 세부는 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Equation Combo rules — The Bloody Game X, day 5 money challenge (make powers of ten)',
      description: 'The rules of Equation Combo from The Bloody Game X (피의 게임X): 175 equation tiles hidden in the mansion, a 127-hex board, five search rounds, combos computed step by step as a marker moves, only 10, 100, 1000… count, the scoring formula and the unused-tile penalty.',
      keywords: ['Equation Combo', 'Bloody Game X Equation Combo', 'maths board game', '피의 게임X'],
    },
    title: 'Equation Combo — The Bloody Game X, day 5 money challenge',
    name: 'Equation Combo',
    lead: 'Find equation tiles hidden around the mansion, lay them on a hex board, and walk a marker over them to make 10, 100 or 1,000.',
    summary: 'A 2-vs-2 alliance game: search for hidden tiles, build a hex board, and walk paths whose running value hits a power of ten.',
    setup: [
      { type: 'list', items: [
        '**Players**: two alliances of two teams.',
        '**Board**: a 127-hex board per alliance.',
        '**175 tiles**, hidden around the mansion: + and − 1–9 (eight sets each), × 1–5 (three sets), ÷ 1–4 (four sets).',
        '**Rounds**: five — 15 minutes each for rounds 1–4, 30 for round 5, with 10 minutes between.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Search', body: 'Each round two players per alliance search for envelopes and exchange them for tiles in the voting room.' },
        { title: 'Build', body: 'Tiles go on the alliance board. In round 5 nothing new is registered; during its first 10 minutes tiles may be dumped in the voting room, where anyone may take them. A submitted board cannot be changed.' },
        { title: 'Combos (20 minutes)', body: 'An alliance representative, without notes, puts a marker on a tile and moves it to adjacent tiles, building an equation. **The starting tile’s sign is ignored**, and the value is computed **at each step, with no precedence**.' },
        { title: 'Declaring', body: 'Stop at any time to declare; only **powers of ten (10, 100, 1,000…)** count. A success removes the start tile and the final tile becomes the next start.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**Combo points** = tiles used × zeros in the result.',
        '**Final score** = (sum of combo points − unused tiles) × number of combos, +100 for the combo using the most tiles.',
        'The winning alliance is immune and each team gets ₩50 million; the losing alliance goes to a team death match.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Unused tiles**: tiles never placed, and placed tiles the marker never visited.',
        'A stuck marker may restart from the starting area; when no combo is possible, the phase ends.',
        'Items (₩10 million): a **+10 tile**, and **an extra searcher** next round.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'The decisive part of the formula is that it **multiplies by the number of combos**. One long combo loses to several short ones chained together.' },
      { type: 'cards', items: [
        { title: 'Step-by-step maths makes design easy', body: 'With no precedence you only need the current value and the next tile: at 5, a ×2 tile makes 10; then ×5 and ×2 make 100. Designing several short paths to 10 is the basic plan.' },
        { title: 'Chaining', body: 'After a combo the last tile is the new start, and its sign is ignored, so its number begins a new calculation. End each combo on a good starting number and a single path can fire combos one after another.' },
        { title: 'Unused tiles cost points', body: 'Placed tiles the marker never crosses count against you, so useful placement beats finding many. Dumping useless tiles in round 5 avoids the penalty but may hand them to the other alliance.' },
        { title: 'Division of labour', body: 'Searching is physical, the final 20 minutes is one person’s arithmetic. Alliances that assign searchers, designers and a representative early, and build simple paths the representative can follow without notes, have the edge.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Krypto', players: '1+', alike: 'Chain numbers with arithmetic to hit a target.', differs: 'No board or path; numbers combine freely.' },
      { name: 'Scrabble', players: '2–4', alike: 'Lay collected tiles on a board so longer combinations score more.', differs: 'It makes words, and tiles are drawn at random.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The hidden item and alliance details are not described.',
  },
};

export default game;
