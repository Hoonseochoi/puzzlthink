import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'signal',
  kind: 'tournament',
  when: { ko: '본선 1차', en: 'Main round 1' },
  episode: { ko: '3화', en: 'Episode 3' },
  related: ['hiddenWord', 'equationSignal', 'piggyBank'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '시그널 규칙 — 데스게임2 본선 1차, 과거와 현재 단서로 푸는 2인조 추리',
      description: '넷플릭스 데스게임2 본선 1차 시그널의 규칙을 정리했어요. 2인 3팀, 과거 단서와 현재 단서, 필기 없는 15분 단서 확인과 10분 공유, 사건 개요 공개, 질문·단서 재확인 힌트 5회, 정답 선언과 5분 입장 제한까지.',
      keywords: ['시그널', '데스게임2 시그널', '데스게임 시즌2 본선', '추리 게임', '넷플릭스 데스게임'],
    },
    title: '시그널 — 데스게임2 본선 1차',
    name: '시그널',
    lead: '두 사람이 한 팀. 한 명은 사건 전의 단서를, 다른 한 명은 사건 직전·직후의 단서를 외워 와서 합쳐야 사건의 전말이 보여요.',
    summary: '팀원이 서로 다른 시점의 단서를 따로 외워 와 합쳐서 사건을 푸는 2인조 추리 레이스.',
    setup: [
      { type: 'list', items: [
        '**인원**: 2명씩 3팀.',
        '**단서**: 사건 전의 정황을 담은 **과거 단서**와, 사건 직전 또는 이후의 정황을 담은 **현재 단서**. 서로 다른 단서 룸에 있어요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '단서 확인 (15분)', body: '팀원끼리 정해 각자 다른 단서 룸으로 가서 단서를 봐요. 필기도구는 쓸 수 없어요.' },
        { title: '공유 (10분)', body: '다시 모여 기억한 단서를 나눠요. 이때부터는 필기할 수 있어요.' },
        { title: '문제 공개', body: '10분이 지나면 사건의 개요와 문제가 공개돼요.' },
        { title: '힌트와 정답', body: '딜러룸에서 힌트를 얻거나 정답을 선언해요. 힌트는 팀마다 5번까지예요.' },
      ] },
      { type: 'table', head: ['딜러룸 행동', '내용'], rows: [
        ['질문', '예/아니오로 답할 수 있는 질문. 답은 "예 / 아니오 / 중요하지 않습니다 / 그럴 수 있습니다" 중 하나예요.'],
        ['단서 재확인', '원하는 단서 하나를 1분 동안 다시 봐요.'],
        ['정답 선언', '1분 안에 답해요. 틀리거나 말하지 못하면 5분 동안 딜러룸에 들어갈 수 없어요.'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**가장 먼저 정답을 맞힌 팀**이 이겨, 두 사람 모두 시드 1개를 받고 다음 라운드로 가요.',
        '나머지 네 명은 본선 2차 게임으로 가요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '힌트 5번은 질문과 단서 재확인을 합친 횟수예요.',
        '정답 선언 실패의 대가는 점수가 아니라 시간(5분)이에요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '시그널은 **기억의 분업**이 핵심이에요. 각자 절반의 단서만 보고 필기 없이 외워 와야 해서, 무엇을 외울지 정하는 단계부터 이미 추리가 시작돼요.' },
      { type: 'cards', items: [
        { title: '15분 동안 무엇을 외울까', body: '모든 단서를 똑같이 외우려 하면 다 놓쳐요. 사람, 시간, 장소, 물건처럼 범주를 나눠 핵심 명사와 시각부터 외우는 쪽이 공유 단계에서 쓸모가 커요. 문제는 그 뒤에 공개되므로, "무엇이 이상한가"를 기준으로 외우는 것이 좋아요.' },
        { title: '두 시점이 만나는 곳이 답이에요', body: '과거 단서와 현재 단서 사이의 변화가 사건의 원인을 가리켜요. 공유할 때 각자의 단서를 시간 순으로 늘어놓고 "그 사이에 무엇이 바뀌었나"를 찾으면 문제를 보기 전에도 윤곽을 잡을 수 있어요.' },
        { title: '힌트는 다섯 번뿐', body: '질문과 단서 재확인이 횟수를 나눠 써요. 기억이 흐린 단서를 다시 보는 것이 질문 두세 개보다 정확할 때가 많아요. 정답 선언 실패는 5분을 잃으므로, 경쟁 팀의 움직임을 보며 언제 승부를 걸지 정해야 해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '셜록 홈즈: 컨설팅 디텍티브', players: '1–8명', alike: '흩어진 단서를 모아 사건의 전말을 추리하고, 정답과 비교해 평가받는 협력 추리 게임이에요.', differs: '컨설팅 디텍티브는 시간 제한이나 기억 제한 없이, 장소를 방문하며 단서를 읽어요.' },
      { name: '블랙 스토리 (Black Stories)', players: '2명 이상', alike: '예·아니오 질문으로 사건의 숨은 사정을 맞히는 수평적 사고 게임이에요.', differs: '블랙 스토리는 미리 보는 단서가 없고, 질문만으로 풀어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 사건과 단서의 내용은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Signal rules — Death Game 2 (The Risk Takers season 2), main round 1',
      description: 'The rules of Signal from Netflix’s Death Game season 2: three teams of two, past and present clues, 15 minutes of note-free clue viewing and 10 minutes of sharing, the case reveal, five hints (questions or clue re-checks), answering and the five-minute lock-out.',
      keywords: ['Signal', 'Death Game 2 Signal', 'The Risk Takers season 2', 'deduction game'],
    },
    title: 'Signal — Death Game 2, main round 1',
    name: 'Signal',
    lead: 'Two to a team: one memorises clues from before the incident, the other from just before and after. Only together do they see what happened.',
    summary: 'Teammates memorise clues from different moments separately, then combine them to solve the case first.',
    setup: [
      { type: 'list', items: [
        '**Players**: three teams of two.',
        '**Clues**: **past clues** (circumstances before the incident) and **present clues** (just before or after), in separate clue rooms.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Viewing (15 minutes)', body: 'Teammates split between the two clue rooms; no writing.' },
        { title: 'Sharing (10 minutes)', body: 'They regroup and share what they remember; notes are now allowed.' },
        { title: 'The case', body: 'After 10 minutes the case summary and the question are revealed.' },
        { title: 'Hints and answers', body: 'In the dealer room, take hints or answer; five hints per team.' },
      ] },
      { type: 'table', head: ['Dealer room', 'What it does'], rows: [
        ['Question', 'A yes/no question, answered "yes", "no", "not important" or "could be".'],
        ['Clue re-check', 'See one clue again for one minute.'],
        ['Answer', 'One minute to answer; a wrong or missing answer bars the team from the dealer room for five minutes.'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**The first team to answer correctly** wins a seed each and advances.',
        'The other four go to main round 2.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'The five hints are shared between questions and re-checks.',
        'A failed answer costs time (five minutes), not points.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Signal is built on **dividing memory**. Each player sees half the clues and must memorise them without notes, so deciding what to remember is already deduction.' },
      { type: 'cards', items: [
        { title: 'What to memorise', body: 'Trying to remember everything loses everything. Splitting by category — people, times, places, objects — and fixing key nouns and times first pays off when sharing. The question comes later, so memorise "what is odd".' },
        { title: 'The answer lies between the two moments', body: 'What changed between past and present clues points at the cause. Laying both sets out in time order and asking what changed sketches the case before the question appears.' },
        { title: 'Only five hints', body: 'A re-check of a hazy clue is often worth more than several questions. A failed answer costs five minutes, so time your attempt against the other teams.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Sherlock Holmes Consulting Detective', players: '1–8', alike: 'Gather scattered clues and reconstruct a case, then compare with the solution.', differs: 'No time or memory limits; you read clues by visiting locations.' },
      { name: 'Black Stories', players: '2+', alike: 'Yes/no questions to uncover the hidden story behind an incident.', differs: 'There are no clues to study beforehand.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The case and clues are not described.',
  },
};

export default game;
