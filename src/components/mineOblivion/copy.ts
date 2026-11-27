import type { CSSProperties } from 'react';
import { accentVars } from '../ui/gameUi';
import type { MoEnding } from '@/lib/mineOblivion';
import type { MoLevel } from '@/lib/mineOblivionAi';

export const MO_ACCENT = '#ffb020';
export const MO_INK = '#141006';
export const MO_ROOT_STYLE: CSSProperties = {
  ...accentVars(MO_ACCENT, MO_INK),
  background: 'radial-gradient(120% 60% at 50% -10%, #5b2c4a 0%, #2a1a33 38%, #0d0b12 75%)',
};

const ko = {
  title: '망각의 지뢰', back: '망각의 지뢰', you: '나', opp: '상대', ai: 'AI', guest: '손님',
  rules: '규칙', again: '다시 하기', close: '닫기', showResult: '결과 보기', replay: '복기', resign: '기권', resignConfirm: '정말 기권할까요? 바로 패배로 끝나요.',
  sound: '소리', levelName: { normal: '보통', hard: '어려움' } as Record<MoLevel, string>,
  phases: ['묻기', '이동', '결과'],
  // HUD
  minedCells: '지뢰 칸', treasuresLeft: '남은 보물', moveCount: '수', ofMoves: (n: number, max: number) => `${n} / ${max}`,
  score: '점수', turnYou: '내 차례 — 둘레 8칸 중 갈 곳을 누르세요', turnOpp: (n: string) => `${n} 차례…`, thinking: '생각 중',
  respawnYou: '지뢰! 출발지 옆 세 칸 중 돌아갈 곳을 고르세요', respawnOpp: (n: string) => `${n}이(가) 돌아갈 곳을 고르는 중…`,
  memorize: '내 지뢰를 외우세요', memorizeSub: (s: number) => `${s}초 뒤 판에서 사라져요. 이제부터는 기억으로만!`,
  // Burying
  buryTitle: '지뢰 묻기', buryHelp: (n: number) => `칸을 눌러 지뢰 ${n}개를 묻으세요. 노란 줄무늬 칸(출발지 근처)과 보물 칸에는 못 묻어요.`,
  buryCount: (n: number, max: number) => `${n} / ${max}`, buryRandom: '무작위로 채우기', buryClear: '모두 지우기', buryDone: '묻기 완료',
  buryWaitOpp: '상대가 지뢰를 묻는 중…', buryWaitMe: '묻기를 마쳤어요. 상대를 기다려요', buryOppReady: '상대는 다 묻었어요',
  buryTip: '팁: 내 지뢰 옆은 나만 아는 안전한 점수 밭이에요. 내가 다닐 길은 비워 두세요.',
  // Announcements
  legend: '숫자 = 밟은 칸 둘레 8칸에 있는 지뢰 수 (내 것 + 상대 것, 겹친 칸은 2)',
  saw: {
    score: (who: string, n: number) => `${who} · 둘레 지뢰 ${n}`,
    blank: (who: string) => `${who} · 이미 점수를 받은 칸 (0점)`,
    mine: (who: string) => `${who} · 지뢰를 밟았어요!`,
    treasure: (who: string, v: number) => `${who} · 보물 발견! +${v}`,
  },
  gain: (g: number) => (g > 0 ? `+${g}점` : g < 0 ? `${g}점` : '0점'),
  sawHint: '이 숫자는 곧 사라져요. 기억해 두세요.',
  craterNote: '지뢰가 터진 칸은 비었어요(나중에 밟으면 점수 계산).',
  whoMine: '누구의 지뢰였는지는 알려 주지 않아요.',
  // Seen vs remember
  seeTitle: '보이는 것 / 외울 것',
  see: ['두 사람의 위치와 점수', '발자국(이미 점수를 받은 칸)과 터진 자리', '남은 보물과 지뢰가 든 칸의 수'],
  remember: ['내가 묻은 지뢰 위치 (시작 뒤 사라져요)', '밟을 때마다 나온 숫자 (잠깐만 보여요)', '그 숫자로 추리한 상대 지뢰'],
  // End
  endTreasure: '보물 세 개를 모두 찾았어요', endMoves: (n: number) => `${n}수 제한에 닿았어요`, endResign: (who: string) => `${who}이(가) 기권했어요`,
  winYou: '승리!', loseYou: '패배', draw: '무승부', win: (n: string) => `${n} 승리`,
  revealTitle: '지뢰밭 공개', revealMine: '내 지뢰', revealOpp: '상대 지뢰', revealBoth: '겹친 칸', path: '지나간 길',
  stats: { treasures: '보물', blasts: '밟은 지뢰', own: '그중 내 지뢰', points: '점수' },
  resultTitle: 'RESULT', exitLabel: '나가기',
  // Replay
  replayTitle: '복기', replayStart: '시작', replayStep: (n: number, max: number) => `${n} / ${max}수`, prev: '이전', next: '다음', play: '재생', pause: '멈춤',
  replayAll: '모든 지뢰가 보여요. 터진 지뢰는 X 자리로 남아요.',
  // Rooms
  online: 'ONLINE', lobby: 'LOBBY', lobbyTitle: '1:1 망각의 지뢰', inviteTitle: '친구 초대', inviteDesc: '링크나 4자리 코드를 보내면 바로 들어와요.',
  copy: '링크 복사', copied: '복사됨', share: '공유', start: '게임 시작', needTwo: '두 사람이 모이면 시작해요', waitingHost: '방장이 시작하길 기다려요', roomFull: '자리가 다 찼어요 (관전)',
  nickname: '닉네임', rename: '변경', connecting: '연결 중…', unconfigured: '온라인 기능이 설정되지 않았어요.', connectionError: '연결에 문제가 있어요.', roomNotFound: '방을 찾지 못했어요.', hostOffline: '방장이 잠시 나갔어요.', backToEntry: '처음으로',
  joined: (n: string) => `${n} 님이 들어왔어요`, left2: (n: string) => `${n} 님이 나갔어요`, shareText: '망각의 지뢰 1:1 한 판 해요!', rematchWait: '방장이 다시 시작하길 기다려요', emptySeat: '빈 자리',
  fairTitle: '공정하게', fair: ['상대 지뢰는 판이 끝날 때까지 어느 화면에도 보내지 않아요.', '숫자와 폭발은 방장 브라우저가 계산해 두 사람에게 똑같이 알려요.', '묻기 120초, 한 수 30초. 시간을 넘기면 그 수는 AI가 대신 둬요.'],
  clock: (s: number) => `${s}초`,
  // Tutorial
  tutorial: '튜토리얼', tutorialNext: '다음', tutorialDone: '시작하기', tutorialSkip: '건너뛰기',
  quick: [
    '각자 11×11 판에 지뢰 15개를 몰래 묻어요. 출발지 근처(노란 줄무늬)와 보물 칸은 안 돼요.',
    '시작하면 내 지뢰도 판에서 사라져요. 이제부터는 기억이 전부예요.',
    '번갈아 둘레 8칸 중 한 칸으로 옮겨요. 지뢰가 없으면 그 칸 둘레 8칸의 지뢰 수만큼 점수(내 것도 포함, 겹친 칸은 2).',
    '이미 누가 점수를 받은 칸(발자국)은 다시 0점. 지뢰는 누구 것이든 −5점, 출발지 옆 세 칸 중 하나로 돌아가요.',
    '보물은 찾은 순서대로 +10, +15, +20. 세 개를 다 찾으면(또는 70수) 끝, 점수가 높은 쪽이 이겨요.',
  ],
  siteDiff: '방송과 다른 점',
  siteDiffs: [
    '숫자는 화면에 잠깐 크게 떴다가 사라져요(방송은 말로 공지). 발자국과 터진 자리는 판에 남겨요.',
    '지뢰를 밟은 뒤 돌아갈 칸은 직접 골라요. 겹친 칸을 밟아도 −5점은 한 번이에요.',
    '보물 칸도 처음 밟은 사람은 둘레 숫자만큼 점수를 더 받아요.',
    '시즌 2처럼 70수 제한을 두고, 같은 점수면 무승부예요. 시한폭탄(시즌 2)과 연습판은 없어요.',
  ],
  aiNote: '보통 AI는 사람처럼 자기 지뢰와 지난 숫자를 조금씩 잊어요. 어려움 AI는 본 것을 모두 기억하고 숫자로 상대 지뢰 위치를 확률로 계산해요. 둘 다 상대 지뢰는 몰라요.',
};

export type MoCopy = typeof ko;

const en: MoCopy = {
  title: 'Mine of Oblivion', back: 'Mine of Oblivion', you: 'You', opp: 'Opponent', ai: 'AI', guest: 'Guest',
  rules: 'Rules', again: 'Play again', close: 'Close', showResult: 'Show result', replay: 'Replay', resign: 'Resign', resignConfirm: 'Resign now? The game ends as a loss.',
  sound: 'Sound', levelName: { normal: 'Normal', hard: 'Hard' },
  phases: ['Bury', 'Walk', 'Result'],
  minedCells: 'Mined cells', treasuresLeft: 'Treasure left', moveCount: 'Move', ofMoves: (n, max) => `${n} / ${max}`,
  score: 'Score', turnYou: 'Your move: tap one of the eight cells around you', turnOpp: (n) => `${n} to move…`, thinking: 'thinking',
  respawnYou: 'Mine! Pick one of the three cells by your start', respawnOpp: (n) => `${n} is picking where to go back to…`,
  memorize: 'Memorise your mines', memorizeSub: (s) => `They vanish from the board in ${s} s. From now on, memory only!`,
  buryTitle: 'Bury your mines', buryHelp: (n) => `Tap cells to bury ${n} mines. Not on the striped cells near the starts, nor on treasure.`,
  buryCount: (n, max) => `${n} / ${max}`, buryRandom: 'Fill at random', buryClear: 'Clear all', buryDone: 'Done burying',
  buryWaitOpp: 'Your opponent is burying…', buryWaitMe: 'Buried. Waiting for your opponent', buryOppReady: 'Your opponent is done',
  buryTip: 'Tip: cells next to your own mines are safe points only you know about. Keep your own route clear.',
  legend: 'Number = mines in the eight cells around the cell stepped on (yours and theirs; a shared cell counts 2)',
  saw: {
    score: (who, n) => `${who} · ${n} mine${n === 1 ? '' : 's'} around`,
    blank: (who) => `${who} · already scored (0)`,
    mine: (who) => `${who} · stepped on a mine!`,
    treasure: (who, v) => `${who} · treasure! +${v}`,
  },
  gain: (g) => (g > 0 ? `+${g}` : `${g}`),
  sawHint: 'This number will fade. Remember it.',
  craterNote: 'A blown cell is empty now (it scores when stepped on later).',
  whoMine: 'Nobody is told whose mine it was.',
  seeTitle: 'What you see / what you remember',
  see: ['Both pieces and scores', 'Footprints (cells already scored) and craters', 'Treasure left and how many cells hold a mine'],
  remember: ['Where you buried your mines (they vanish at the start)', 'Each number as it is announced (shown for a moment)', 'What those numbers say about the opponent’s mines'],
  endTreasure: 'All three treasures found', endMoves: (n) => `The ${n}-move limit was reached`, endResign: (who) => `${who} resigned`,
  winYou: 'You win!', loseYou: 'You lose', draw: 'Draw', win: (n) => `${n} wins`,
  revealTitle: 'The minefield', revealMine: 'Your mines', revealOpp: 'Their mines', revealBoth: 'Shared cell', path: 'Path',
  stats: { treasures: 'Treasure', blasts: 'Mines hit', own: 'of them yours', points: 'Points' },
  resultTitle: 'RESULT', exitLabel: 'Exit',
  replayTitle: 'Replay', replayStart: 'Start', replayStep: (n, max) => `${n} / ${max}`, prev: 'Back', next: 'Next', play: 'Play', pause: 'Pause',
  replayAll: 'Every mine is shown. Exploded ones stay as craters.',
  online: 'ONLINE', lobby: 'LOBBY', lobbyTitle: '1:1 Mine of Oblivion', inviteTitle: 'Invite a friend', inviteDesc: 'Send the link or the 4-digit code.',
  copy: 'Copy link', copied: 'Copied', share: 'Share', start: 'Start', needTwo: 'Starts when two players are here', waitingHost: 'Waiting for the host to start', roomFull: 'The room is full (watching)',
  nickname: 'Nickname', rename: 'Change', connecting: 'Connecting…', unconfigured: 'Online play is not configured.', connectionError: 'Connection problem.', roomNotFound: 'Room not found.', hostOffline: 'The host stepped away.', backToEntry: 'Back',
  joined: (n) => `${n} joined`, left2: (n) => `${n} left`, shareText: 'A 1:1 game of Mine of Oblivion?', rematchWait: 'Waiting for the host to restart', emptySeat: 'Empty seat',
  fairTitle: 'Fair play', fair: ['Neither screen receives the opponent’s mines until the game is over.', 'The host’s browser works out every number and explosion and announces it to both alike.', '120 s to bury, 30 s a move; a missed move is played by the AI.'],
  clock: (s) => `${s}s`,
  tutorial: 'Tutorial', tutorialNext: 'Next', tutorialDone: 'Start', tutorialSkip: 'Skip',
  quick: [
    'Each player secretly buries 15 mines on the 11×11 board, never near the starts (striped) or on treasure.',
    'When the walk starts, even your own mines vanish from the board. From then on it is all memory.',
    'Take turns moving to one of the eight cells around you. On a clear cell you score the mines around it (yours count too; a shared cell counts 2).',
    'A cell someone has scored (footprints) scores 0 again. Any mine costs 5 and sends you back to one of the three cells by your start.',
    'Treasure scores +10, +15, +20 in order found. When all three are found (or after 70 moves) the higher score wins.',
  ],
  siteDiff: 'How this differs from the show',
  siteDiffs: [
    'Numbers appear large for a moment and then fade (the show announced them aloud). Footprints and craters stay on the board.',
    'After a mine you pick which of the three cells to go back to. A shared cell still costs 5 once.',
    'The first visitor to a treasure also scores its number.',
    'A 70-move limit as in season 2, and equal scores are a draw. No time bombs (season 2) and no practice board.',
  ],
  aiNote: 'Normal AI forgets some of its own mines and older numbers, like a person. Hard AI remembers everything it saw and computes where your mines can be from the numbers. Neither knows your mines.',
};

export const moCopy = (locale: string): MoCopy => (locale === 'en' ? en : ko);
export const endingText = (t: MoCopy, ending: MoEnding | null, moves: number, resigner: string) =>
  ending === 'treasure' ? t.endTreasure : ending === 'moves' ? t.endMoves(moves) : ending === 'resign' ? t.endResign(resigner) : '';
