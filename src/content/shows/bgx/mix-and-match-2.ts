import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'mix-and-match-2',
  kind: 'death',
  when: { ko: '7일차', en: 'Day 7' },
  related: ['hiddenWord', 'nonogram', 'blindGomoku'],
  updated: '2026-11-26',
  sources: [namuDay('7'), broadcast],
  ko: {
    meta: {
      title: '믹스 앤 매치 2 규칙 — 피의 게임X 7일차 데스매치, 격자판을 겹쳐 단어 찾기',
      description: '피의 게임X 7일차 데스매치 믹스 앤 매치 Ⅱ의 규칙을 정리했어요. 3초 간격으로 지나가는 격자판, 검정 칸을 머릿속으로 겹쳐 만드는 단어, 5초 답변과 글자 수 점수, 오답 감점과 30초 대기, 12라운드와 동점 처리까지.',
      keywords: ['믹스 앤 매치', '믹스 앤 매치 2', '피의 게임X 믹스 앤 매치', '피의게임X 데스매치', '피의게임X'],
    },
    title: '믹스 앤 매치 Ⅱ — 피의 게임X 7일차 데스매치',
    name: '믹스 앤 매치 Ⅱ',
    lead: '3초마다 바뀌는 격자판의 검은 칸을 머릿속으로 겹치면 글자가 나타나요. 그 글자들이 이루는 단어를 먼저 외쳐요.',
    summary: '연달아 공개되는 격자판의 검은 칸을 머릿속에서 겹쳐 단어를 읽어 내는 3인 데스매치.',
    setup: [
      { type: 'list', items: [
        '**인원**: 3명.',
        '**격자판**: 검은 칸과 빈칸이 표시된 판 여러 장이 3초 간격으로 차례로 전광판에 떠요.',
        '**정답**: 판들을 겹쳤을 때 검은 칸이 만드는 단어. 모두 표준국어대사전에 실린 단어예요.',
        '**라운드**: 12라운드.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '판 공개', body: '라운드가 시작되면 격자판이 3초마다 한 장씩 지나가요.' },
        { title: '겹치기', body: '지나간 판들의 검은 칸을 머릿속에서 겹쳐 글자를 읽어요.' },
        { title: '정답 선언', body: '선언하고 5초 안에 단어를 말해요. 맞히면 **글자 수에 따라** 승점을 받아요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '12라운드 뒤 **승점 1위 한 명이 이기고, 나머지 두 명은 탈락**해요.',
        '동점이면 맞힌 문제가 많은 쪽이 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '오답이거나 5초를 넘기면 1점을 잃고, **30초가 지나야** 다시 선언할 수 있어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '믹스 앤 매치는 **시각 기억과 어휘력이 동시에** 필요한 게임이에요. 판 하나하나는 의미 없는 점들이지만, 겹쳐야 글자가 되므로 앞서 본 판을 놓치면 글자가 완성되지 않아요.' },
      { type: 'cards', items: [
        { title: '글자가 다 보이기 전에 추측하세요', body: '한글은 자음과 모음의 조합이라, 글자의 일부만 보여도 후보가 꽤 좁혀져요. 첫 글자와 글자 수, 몇 개의 획만으로도 단어를 떠올릴 수 있다면 판이 다 지나가기 전에 선언할 수 있어요. 사전에 있는 단어라는 조건이 추측을 돕는 단서예요.' },
        { title: '오답의 비용은 시간', body: '틀리면 1점보다 30초 대기가 더 아파요. 그동안 다른 두 사람이 자유롭게 답할 수 있으니까요. 확신이 70% 정도일 때 누를지는, 상대가 얼마나 빨리 맞힐 것 같은지에 달려 있어요.' },
        { title: '긴 단어가 큰 점수', body: '점수가 글자 수에 따라 커지므로, 긴 단어 라운드 하나가 짧은 단어 여러 라운드를 뒤집을 수 있어요. 긴 단어일수록 판이 많아 기억할 것이 늘어나지만, 일부 글자만으로 추측하기도 쉬워져요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '보글 (Boggle)', players: '2명 이상', alike: '글자 배열에서 단어를 남보다 빨리 찾아내는 단어 속도 게임이에요.', differs: '보글은 글자가 처음부터 보이고, 찾은 단어를 적어서 겨뤄요.' },
      { name: '레터 잼 (Letter Jam)', players: '2–6명', alike: '부분적인 정보로 글자를 추리해 단어를 완성하는 게임이에요.', differs: '레터 잼은 협력 게임이고, 내 글자는 남만 볼 수 있어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 글자 수별 점수와 출제 단어는 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Mix and Match II rules — The Bloody Game X, day 7 death match (overlay grids to read a word)',
      description: 'The rules of Mix and Match II from The Bloody Game X (피의 게임X): grids flashing every three seconds, overlaying their black cells in your head to read a word, five seconds to answer and points by length, the wrong-answer penalty and 30-second wait, twelve rounds and ties.',
      keywords: ['Mix and Match II', 'Bloody Game X death match', 'word puzzle game', '피의 게임X'],
    },
    title: 'Mix and Match II — The Bloody Game X, day 7 death match',
    name: 'Mix and Match II',
    lead: 'Overlay in your head the black cells of grids that change every three seconds, and letters appear. Call the word first.',
    summary: 'A three-player death match: mentally overlay a sequence of grids to read the hidden word.',
    setup: [
      { type: 'list', items: [
        '**Players**: three.',
        '**Grids**: several grids of black and blank cells shown one after another, three seconds apart.',
        '**Answer**: the word formed by the black cells when the grids are overlaid — always a word in the standard Korean dictionary.',
        '**Rounds**: twelve.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Grids', body: 'Each round, grids flash past every three seconds.' },
        { title: 'Overlay', body: 'Combine their black cells in your head to read the letters.' },
        { title: 'Answer', body: 'Declare and say the word within five seconds; a right answer scores by **word length**.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After twelve rounds **the top scorer wins and the other two are eliminated**.',
        'Ties go to more correct answers.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A wrong or late answer costs a point and blocks you for **30 seconds**.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Mix and Match needs **visual memory and vocabulary at once**: each grid is meaningless dots, and missing one leaves the letters incomplete.' },
      { type: 'cards', items: [
        { title: 'Guess before it is complete', body: 'Korean syllables combine consonants and vowels, so partial strokes already narrow the candidates. The first syllable, the length and a few strokes can be enough to call it early, and "it is a dictionary word" is itself a clue.' },
        { title: 'A miss costs time', body: 'The 30-second lock hurts more than the point, leaving the field to the others. Whether to buzz at 70% certainty depends on how fast you expect them to be.' },
        { title: 'Long words pay', body: 'Points grow with length, so one long-word round can outweigh several short ones; longer words mean more grids to remember but also more room to guess from fragments.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Boggle', players: '2+', alike: 'Race to find words in an arrangement of letters.', differs: 'The letters are visible from the start and words are written down.' },
      { name: 'Letter Jam', players: '2–6', alike: 'Deduce letters from partial information to complete words.', differs: 'It is cooperative, and only others can see your letter.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Points per length and the words themselves are not reproduced.',
  },
};

export default game;
