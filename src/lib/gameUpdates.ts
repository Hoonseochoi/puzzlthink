import { Bot, Coins, Crown, Flame, History, MousePointerClick, PenLine, Scale, Sparkles, Trophy, Undo2, Users, Wrench, type LucideIcon } from 'lucide-react';

// Update notes for players: the "업데이트" badge in a game's header opens these (src/components/GameUpdates.tsx).
//
// HOW TO ADD ONE (every session that ships a change players will notice):
//   - Put the new entry FIRST in that game's `items` (newest first), date as 'MM/DD' in KST.
//   - Korean and English, short: `title` says what changed in one line, `desc` says how it plays now (1–2 sentences).
//   - Only what players see or feel: rules, AI, modes, controls, fixes of bugs they hit. Not refactors, SEO, ids.
//   - A change undone the same day: edit or drop its entry instead of adding a second one.
//   - A game's first entry: add the game here and put <GameUpdates game="…" /> in its header(s), before <BugReport />.
//     The game's entry screen shows its newest notes by itself (GameUpdatesSection, keyed by the same id).
//   - A change to every friend/open room at once (the shared room code): add it to ROOM_NOTES at the bottom instead.

export type GameUpdate = {
  date: string; // 'MM/DD'
  icon: LucideIcon;
  ko: { title: string; desc: string };
  en: { title: string; desc: string };
};
export type GameUpdateLog = {
  name: { ko: string; en: string };
  /** Optional line under the list (e.g. thanks for the feedback the changes came from). */
  note?: { ko: string; en: string };
  items: GameUpdate[]; // newest first
};

export const GAME_UPDATES: Record<string, GameUpdateLog> = {
  hidden_word: {
    name: { ko: '히든 워드', en: 'Hidden Word' },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '확장 단어 세트가 열렸어요', desc: '봉투를 고르기 전에 기본(60단어)과 확장(186단어)을 고를 수 있어요. 확장은 감정·직업·장소·음식·문화까지, 서로 닮은 단어끼리 묶여 있고 모라의 힌트도 덜 직접적이라 조금 더 어려워요. 규칙은 같고 랭킹은 따로, 친구 방에서도 고를 수 있어요.' },
        en: { title: 'New word set: Expansion', desc: 'Before you pick an envelope, choose Basic (60 words) or Expansion (186 words): feelings, jobs, places, food and culture in look-alike groups, with less direct hints from MORA — a bit harder. Same rules, its own ranking, and friend rooms can pick it too.' },
      },
      {
        date: '11/26', icon: Wrench,
        ko: { title: '모라의 단어가 고르게 나와요', desc: '단어가 적은 묶음(주말)이 모라의 단어로 유난히 자주 나오던 것을 고쳤어요. 이제 모든 단어가 같은 확률로 나와요.' },
        en: { title: 'MORA’s words now come up evenly', desc: 'A word alone in its group (주말) used to be MORA’s word far more often than the rest. Every word is now equally likely.' },
      },
      {
        date: '11/26', icon: Users,
        ko: { title: '친구와 1:1 방이 열렸어요', desc: '링크나 4자리 코드로 친구를 불러 히든 워드를 1:1로 할 수 있어요. 규칙은 모라전과 같고, 답 2개는 피스 없이 단어마다 한 번. 친구 대전은 랭킹에 들어가지 않아요.' },
        en: { title: 'Friend rooms, one on one', desc: 'Invite a friend with a link or a 4-digit code and play Hidden Word 1:1. Same rules as against MORA; two answers are free once per word. Friend matches are not ranked.' },
      },
      {
        date: '11/26', icon: Wrench,
        ko: { title: '답 2개 제출은 이제 피스 1개를 써요', desc: '무료 찬스가 없어지고, 경쟁전 피스 1개를 쓰면 단어마다 한 번 답을 2개 낼 수 있어요. 쓴 피스는 경쟁전 개수에서 빠집니다.' },
        en: { title: 'Two answers now cost 1 piece', desc: 'The free chance is gone: once per word you can spend 1 race piece to give two answers. Spent pieces come off your race count.' },
      },
      {
        date: '11/26', icon: Wrench,
        ko: { title: '모라가 힌트로 나온 단어를 답으로 내던 문제를 고쳤어요', desc: '힌트로 나온 단어는 정답이 될 수 없어요. 이제 모라는 앞 차에 나온 힌트를 답으로 내지 않고, 내가 힌트 단어를 답으로 적으면 횟수를 쓰지 않고 다시 적게 해 줘요.' },
        en: { title: 'Fixed: MORA answering with a word that was already a hint', desc: 'A hint can never be the hidden word. MORA no longer answers with a hint from an earlier stage, and if you write a hint as your answer it is refused without using up the guess.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '랭킹 점수가 바뀌었어요: 평균 승점 + 판수 보너스', desc: '승점 합계 대신 한 판 평균 승점에 판당 0.3점(20판까지, 최대 +6)을 더해 순위를 매겨요. 3판을 끝내면 순위에 올라요.' },
        en: { title: 'New ranking score: average points + a bonus for matches played', desc: 'Instead of the total, ranks use your average points per match plus 0.3 per match (up to 20, max +6). You are ranked from 3 finished matches.' },
      },
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '히든 워드 출시 — AI 모라와 승점전', desc: '유사도 힌트로 서로의 단어를 맞히는 2라운드 승점전이에요. 끝낸 대전의 평균 승점으로 랭킹을 겨루고, 1위는 히든 워드 아이콘을 가져가요.' },
        en: { title: 'Hidden Word is here — a point match against MORA', desc: 'Two rounds of finding each other\'s word from similarity hints. Your average points per finished match make the ranking, and #1 holds the Hidden Word icon.' },
      },
    ],
  },
  equation_signal: {
    name: { ko: '수식 신호등', en: 'Equation Signal' },
    note: { ko: '의견은 언제든 버그 제보로 보내주세요. 고맙습니다!', en: 'Send us your thoughts any time with the bug report button. Thank you!' },
    items: [
      {
        date: '11/26', icon: Wrench,
        ko: { title: '친구·공개방: 방장에게 상대 수식이 보이던 문제 수정', desc: '라운드 중에는 방장에게도 다른 사람의 제출이 신호 색으로만 보여요. 숫자와 기호는 라운드가 끝나면 공개돼요.' },
        en: { title: 'Rooms: the host no longer sees other players\' equations', desc: 'During a round the host, like everyone else, sees only the signal colours of other players\' guesses. Symbols show once the round ends.' },
      },
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '수식 신호등이 열렸어요', desc: '데블스 플랜 3 결승 3회전 게임이에요. 연습하기, 10분 챌린지(랭킹), 친구·공개방 2~4명 대결을 할 수 있어요.' },
        en: { title: 'Equation Signal is open', desc: 'The third game of the Devil\'s Plan 3 final. Practice, a ranked 10-minute challenge, and friend or open rooms for 2–4.' },
      },
    ],
  },
  equation_tower: {
    name: { ko: '수식의 탑', en: 'Tower of Equations' },
    note: { ko: '의견은 언제든 버그 제보로 보내주세요. 고맙습니다!', en: 'Send us your thoughts any time with the bug report button. Thank you!' },
    items: [
      {
        date: '11/26', icon: Scale,
        ko: { title: '난이도 보통·어려움, 챌린지는 어려움으로', desc: '연습과 친구·공개방에서 보통·어려움을 고를 수 있어요. 어려움은 최소 이동 4회 이상, × 블록 2개에 더 큰 타깃. 10분 챌린지와 랭킹은 어려움으로만 진행되고, 지금까지의 기록은 그대로 남아요.' },
        en: { title: 'Normal and Hard; the challenge is Hard', desc: 'Pick Normal or Hard in practice and in friend or open rooms. Hard asks for 4 or more moves at best, with two × blocks and bigger targets. The 10-minute challenge and its ranking are Hard only, and records so far stay.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '보통은 최소 2~3회, ×·÷ 쓰는 탑 위주', desc: '보통도 최소 이동 2회만 나오지 않고 3회 문제가 더 자주 나와요. ×나 ÷를 써야 하는 탑이 답으로 많이 나옵니다.' },
        en: { title: 'Normal: 2–3 moves, more × and ÷', desc: 'Normal rounds now ask for 3 moves more often than 2, and more answers need × or ÷.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '×·÷를 먼저 계산해요', desc: '탑의 수식을 보통 수식처럼 ×·÷부터 계산해요. 7+7+2÷2−5는 이제 3이 아니라 10입니다.' },
        en: { title: '× and ÷ come first', desc: 'A tower is now worked out like an ordinary formula, × and ÷ before + and −: 7+7+2÷2−5 is 10, not 3.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '블록은 소수 2·3·5·7, 탑은 3~5층', desc: '블록의 숫자가 소수 네 가지(2, 3, 5, 7)로만 나와요. 목표 층수도 2층 없이 3~5층만 나옵니다.' },
        en: { title: 'Prime blocks (2, 3, 5, 7) and towers of 3 to 5', desc: 'Blocks now carry only the four primes 2, 3, 5 and 7, and the asked height is always 3 to 5 blocks, never 2.' },
      },
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '자리가 4칸으로 늘었어요', desc: '블록을 놓을 자리가 3칸에서 4칸이 됐어요. 옮길 여유가 생겨서 더 다양한 방법으로 탑을 쌓을 수 있어요.' },
        en: { title: 'Four stacks instead of three', desc: 'There are now four places to put blocks, so there is more room to move and more ways to build a tower.' },
      },
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '수식의 탑이 열렸어요', desc: '데블스 플랜 3 감옥 매치 게임이에요. 연습하기, 10분 챌린지(랭킹), 친구·공개방 2~4명 버저 대결을 할 수 있어요.' },
        en: { title: 'Tower of Equations is open', desc: 'A prison match from The Devil\'s Plan 3. Practice, a ranked 10-minute challenge, and a buzzer game in friend or open rooms for 2–4.' },
      },
    ],
  },
  hit_stay: {
    name: { ko: 'Hit,Stay', en: 'Hit,Stay' },
    note: { ko: '의견은 언제든 버그 제보로 보내주세요. 고맙습니다!', en: 'Send us your thoughts any time with the bug report button. Thank you!' },
    items: [
      {
        date: '11/25', icon: Coins,
        ko: { title: '한 판이 더 빨리 끝나요 (기본 베팅 변경)', desc: '기본 베팅이 2라운드마다 1칩씩 오르다가, 17라운드부터는 2라운드마다 5칩씩 올라요. 칩이 가장 적은 사람이 낼 수 있는 만큼까지만 걸어요. 한 판이 보통 24라운드 안팎이에요.' },
        en: { title: 'Shorter matches (new ante schedule)', desc: 'The ante goes up by 1 every 2 rounds, then by 5 every 2 rounds from round 17, never above the smallest stack. A match now runs about 24 rounds.' },
      },
      {
        date: '11/25', icon: Users,
        ko: { title: '친구·공개방: 1:1부터 5명까지, AI 넣기/빼기', desc: '방장이 대기실에서 AI로 빈자리를 채울지 고를 수 있어요. AI를 빼면 모인 사람끼리(2~5명) 해요.' },
        en: { title: 'Rooms: 1:1 up to five, with or without AI', desc: 'In the lobby the host chooses whether AI fills the empty seats. Without AI, just the people there play (2–5).' },
      },
      {
        date: '11/25', icon: Bot,
        ko: { title: '루나 AI가 HIT만 계속하던 문제를 고쳤어요', desc: '이미 진 판에서 덱이 빌 때까지 카드를 받던 버그예요. 이제 다른 AI처럼 판단해요.' },
        en: { title: 'LUNA no longer hits until the deck runs out', desc: 'In a hand already lost, LUNA kept drawing every card. It now decides like the other AIs.' },
      },
      {
        date: '11/25', icon: Trophy,
        ko: { title: '기록·랭킹, 패보기, 턴 시간', desc: '1위는 승리로 기록돼 명예의 전당·랭킹에 올라가요. 패보기로 모두의 공개 카드와 지난 라운드 패를 볼 수 있어요. 카드 공개 10초, 방에서는 턴당 30초예요.' },
        en: { title: 'Records and rankings, hands view, turn clocks', desc: '1st place counts as a win in the Hall of Fame and rankings. The hands view shows every visible card and last round\'s hands. 10 s to show a card; 30 s per turn in rooms.' },
      },
      {
        date: '11/24', icon: Sparkles,
        ko: { title: 'Hit,Stay 출시', desc: '데블스 플랜 3 준결승 메인매치를 웹으로. AI 4명과, 또는 친구·공개방에서 할 수 있어요.' },
        en: { title: 'Hit,Stay is out', desc: 'The Devil\'s Plan 3 semifinal main match on the web: against four AIs, or in friend and open rooms.' },
      },
    ],
  },
  slitherlink: {
    name: { ko: '슬리더링크', en: 'Slitherlink' },
    note: { ko: '플레이어분이 보내주신 의견을 반영했어요. 고맙습니다!', en: "Made from players' feedback. Thank you!" },
    items: [
      {
        date: '11/26', icon: Wrench,
        ko: { title: '챌린지 힌트는 이제 피스 1개를 써요', desc: '새로운 맵·맵 뺏기의 힌트(판마다 1번)는 경쟁전 피스 1개를 쓰고, 쓴 피스는 경쟁전 개수에서 빠져요. 연습 모드 힌트는 그대로 무료예요.' },
        en: { title: 'A challenge hint now costs 1 piece', desc: 'The one hint in New map and Take a map spends 1 race piece, which comes off your race count. Practice hints stay free.' },
      },
      {
        date: '11/25', icon: History,
        ko: { title: '내 풀이 복기에서 정답길을 같이 볼 수 있어요', desc: "정답을 본 뒤 '내 풀이 복기'를 열면 정답길이 연한 초록 띠로 깔리고, 정답과 다른 내 선과 ✕는 빨간색으로 보여요. 어디서 길이 꼬였는지 한눈에 볼 수 있어요. 보드 위 버튼으로 끄고 켤 수 있어요." },
        en: { title: 'See the answer path while replaying your play', desc: "After seeing the answer, open 'Replay my lines': the answer is laid under your lines as a soft green track, and your lines and ✕ that disagree with it show in red, so you can see exactly where your path went wrong. A button above the board turns it on or off." },
      },
      {
        date: '11/23', icon: PenLine,
        ko: { title: '펜으로 쭉 그으면 한 번에 그어져요', desc: '펜 모드에서 점 사이를 따라 드래그하면 지나간 칸이 모두 선이 돼요. 선 위에서 시작해 드래그하면 선이 한꺼번에 지워져요. 한 번에 되돌리기 한 단계예요.' },
        en: { title: 'Drag with the pen to draw in one stroke', desc: 'In pen mode, drag along the dots and every edge you cross becomes a line. Start on a line and the drag erases lines instead. One stroke is one undo step.' },
      },
      {
        date: '11/23', icon: MousePointerClick,
        ko: { title: '✕는 ✕ 버튼을 눌러야만 표시돼요', desc: '선 긋기는 그대로예요. 같은 곳을 다시 탭하면 ✕가 아니라 선이 지워져요. ✕는 ✕ 버튼을 고른 뒤에만 표시할 수 있어요.' },
        en: { title: '✕ only with the ✕ button', desc: 'Drawing lines is unchanged. Tapping a line again now clears it instead of making a ✕. You can place a ✕ only after choosing the ✕ button.' },
      },
      {
        date: '11/22', icon: Undo2,
        ko: { title: '되돌리기(Undo) 버튼이 생겼어요', desc: '방금 바꾼 칸부터 한 번에 하나씩, 원하는 만큼 되돌릴 수 있어요. 키보드에서는 Ctrl/⌘+Z.' },
        en: { title: 'New Undo button', desc: 'Step back one change at a time, as many times as you like. On a keyboard, press Ctrl/⌘+Z.' },
      },
    ],
  },
  merge2048: {
    name: { ko: '2048', en: '2048' },
    items: [
      {
        date: '11/26', icon: Crown,
        ko: { title: '블록 단계마다 아이콘을 받아요 (2048 ~ 131072)', desc: '2048뿐 아니라 4096, 8192 … 131072까지, 만든 가장 큰 블록에 맞는 프로필 아이콘을 얻어요. 이미 세운 기록에도 지급됐어요.' },
        en: { title: 'An icon for every block tier (2048 to 131072)', desc: 'Not only 2048: 4096, 8192 … up to 131072 each give a profile icon for the biggest block you made. Earlier records got theirs too.' },
      },
    ],
  },
  color_link_duel: {
    name: { ko: '컬러 링크', en: 'Color Link Duel' },
    items: [
      {
        date: '11/26', icon: Flame,
        ko: { title: 'AI 난이도가 보통 · 어려움 · 매우 어려움으로 나뉘었어요', desc: '지금까지의 AI는 매우 어려움이 되어 AI 헬모드에 들어갔어요. 이기면 블랙피스와 매우 어려움 인증서를 받아요. 어려움과 보통은 새로 생긴 AI로, 사람처럼 가끔 수를 놓쳐요.' },
        en: { title: 'AI levels: Normal, Hard and Very Hard', desc: 'The AI you knew is now Very Hard and part of AI Hell Mode: a win earns a black piece and a Very Hard certificate. Hard and Normal are new AIs that, like people, sometimes miss a move.' },
      },
    ],
  },
  flip_omok: {
    name: { ko: '뒤집기 오목', en: 'Flip Omok' },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 캐릭터 알도 뒤집히는 모습이 보여요', desc: '내 바둑알(아이콘)로 둘 때도 빙글 뒤집히는 모션이 나오고, 뒤집혀 넘어온 알에는 상대 색 테두리와 점이 붙어요. 캐릭터 알 크기도 일반 알과 같아졌어요.' },
        en: { title: 'Your character pieces flip visibly', desc: 'Pieces drawn as your own stone now spin over, a piece flipped over to your side wears a ring and dot of the other colour, and character pieces are the size of plain ones.' },
      },
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 바둑알로 둬요', desc: '기록실에서 고른 내 바둑알(색·획득 아이콘)이 판 위의 내 말로 나와요. 상대와 같은 바둑알이거나 색이 겹치면 한쪽은 색만 바뀌어요. 후원자의 말에는 얇은 무지개 테두리가 둘러져요.' },
        en: { title: 'Play with your own stone', desc: 'The stone you picked in Records (a colour or an earned icon) is now your piece on the board. If both players have the same stone or the colours clash, one of them is recoloured. A supporter\'s piece wears a thin rainbow rim.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: 'AI 난이도를 다시 맞췄어요', desc: '보통과 어려움이 너무 강해서(이긴 판 15% · 2%) 한 단계씩 낮췄어요. 예전 보통이 어려움이 되고, 보통은 한 수 앞만 보는 더 쉬운 AI가 됐어요.' },
        en: { title: 'AI levels retuned', desc: 'Normal and Hard were too strong (players won 15% and 2%), so both moved down a step: the old Normal is now Hard, and Normal is an easier AI that looks one move ahead.' },
      },
    ],
  },
  laser_janggi: {
    name: { ko: '레이저 장기', en: 'Laser Janggi' },
    items: [
      {
        date: '11/26', icon: Wrench,
        ko: { title: '어려움 AI가 스스로 지는 수를 두던 문제를 고쳤어요', desc: '둘 수 있는 수가 적을 때 어려움 AI가 자기 왕을 맞히는 수를 고르는 일이 있었어요. 이제 다른 수가 있으면 그 수는 두지 않아요.' },
        en: { title: 'Fixed: the Hard AI could shoot its own king', desc: 'With few moves left, the Hard AI sometimes chose a move that hit its own king. It no longer plays such a move while another one exists.' },
      },
    ],
  },
  monorail: {
    name: { ko: '모노레일', en: 'Monorail' },
    items: [
      {
        date: '11/26', icon: Scale,
        ko: { title: '어려움 AI가 매번 다르게 두고, 보통은 쉬워졌어요', desc: '어려움 AI는 같은 상황에서 늘 같은 수를 둬서 한 번 이긴 수순으로 계속 이길 수 있었어요. 이제 비슷하게 좋은 수 중에서 골라 둬요. 보통은 너무 강해서(이긴 판 29%) 느슨하게 조정했어요.' },
        en: { title: 'Hard no longer repeats itself; Normal is easier', desc: 'The Hard AI always answered a position the same way, so one winning line could be replayed forever. It now picks among equally good moves. Normal was too strong (players won 29%) and plays more loosely.' },
      },
    ],
  },
  nine_mens_morris: {
    name: { ko: '나인 멘스 모리스', en: "Nine Men's Morris" },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 바둑알로 둬요', desc: '기록실에서 고른 내 바둑알(색·획득 아이콘)이 판 위의 내 말로 나와요. 상대와 같은 바둑알이거나 색이 겹치면 한쪽은 색만 바뀌어요. 후원자의 말에는 얇은 무지개 테두리가 둘러져요.' },
        en: { title: 'Play with your own stone', desc: 'The stone you picked in Records (a colour or an earned icon) is now your piece on the board. If both players have the same stone or the colours clash, one of them is recoloured. A supporter\'s piece wears a thin rainbow rim.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '어려움 AI가 매번 다르게 두고 한 수 더 읽어요', desc: '같은 수순으로 계속 이길 수 있던 문제를 고쳤어요. 어려움은 한 수 더 깊이 읽고, 질 것 같은 판에서도 끝까지 버텨요.' },
        en: { title: 'Hard varies its play and reads one move deeper', desc: 'A winning line could be replayed against the AI every game; it now varies its moves. Hard also reads one move deeper and holds out longer in a lost game.' },
      },
    ],
  },
  russian_janggi: {
    name: { ko: '러시아장기', en: 'Russian Janggi' },
    items: [
      {
        date: '11/26', icon: Scale,
        ko: { title: '매우 어려움: 블랙피스는 한 주에 30개까지', desc: '블랙피스 경쟁전에서 러시아장기 승리는 한 주에 30승까지만 집계돼요. 이미 30승을 넘긴 기록은 그대로 유지돼요.' },
        en: { title: 'Very Hard: up to 30 black pieces a week', desc: 'In the black piece contest, Russian Janggi wins count up to 30 a week. Totals already past 30 stay as they are.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '보통은 쉬워지고 어려움은 강해졌어요', desc: '보통과 어려움의 실력이 거의 같았어요. 보통은 실수를 더 자주 하고, 어려움은 한 수 더 깊이 읽어요.' },
        en: { title: 'Normal is easier, Hard is stronger', desc: 'Normal and Hard played at almost the same strength. Normal now slips more often and Hard reads one move deeper.' },
      },
    ],
  },
  janggi: {
    name: { ko: '십이장기', en: '12 Janggi' },
    items: [
      {
        date: '11/26', icon: Scale,
        ko: { title: '보통 AI가 조금 쉬워졌어요', desc: '보통에서 이긴 판이 34%로 목표(절반)보다 낮아서, 보통 AI가 가끔 덜 깊이 읽도록 조정했어요. 어려움과 매우 어려움은 그대로예요.' },
        en: { title: 'Normal AI is a little easier', desc: 'Players won 34% against Normal, below the aim of about half, so it now reads less deeply on some moves. Hard and Very Hard are unchanged.' },
      },
    ],
  },
  black_white: {
    name: { ko: '흑과 백', en: 'Black & White' },
    items: [
      {
        date: '11/26', icon: Scale,
        ko: { title: '어려움 AI가 덜 읽히게 됐어요', desc: '어려움이 보통보다 쉽다는 기록이 나와서 조정했어요. 어려움은 패를 더 섞어 내서 읽기 어렵고, 보통은 네 번에 한 번 감으로 내요.' },
        en: { title: 'Hard AI is harder to read', desc: 'Records showed Hard was easier than Normal. Hard now mixes its tiles more, and Normal plays one tile in four by feel.' },
      },
    ],
  },
  heavy13: {
    name: { ko: 'HEAVY 13', en: 'HEAVY 13' },
    items: [
      {
        date: '11/26', icon: Scale,
        ko: { title: '보통 AI가 쉬워졌어요', desc: '보통과 어려움의 결과가 거의 같았어요(6명 중 평균 3.5등). 보통 AI는 절반의 턴에서 앞을 내다보지 않고 내요.' },
        en: { title: 'Normal AI is easier', desc: 'Normal and Hard gave almost the same results (average rank 3.5 of 6). The Normal AI now plays half its turns without looking ahead.' },
      },
    ],
  },
  point_omok: {
    name: { ko: '포인트 오목', en: 'Point Omok' },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 바둑알로 둬요', desc: '기록실에서 고른 내 바둑알(색·획득 아이콘)이 판 위의 내 말로 나와요. 상대와 같은 바둑알이거나 색이 겹치면 한쪽은 색만 바뀌어요. 후원자의 말에는 얇은 무지개 테두리가 둘러져요.' },
        en: { title: 'Play with your own stone', desc: 'The stone you picked in Records (a colour or an earned icon) is now your piece on the board. If both players have the same stone or the colours clash, one of them is recoloured. A supporter\'s piece wears a thin rainbow rim.' },
      },
    ],
  },
  four_three: {
    name: { ko: '4인 3목', en: '4 Player 3 In a Row' },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 바둑알로 둬요', desc: '기록실에서 고른 내 바둑알(색·획득 아이콘)이 판 위의 내 말로 나와요. 상대와 같은 바둑알이거나 색이 겹치면 한쪽은 색만 바뀌어요. 후원자의 말에는 얇은 무지개 테두리가 둘러져요.' },
        en: { title: 'Play with your own stone', desc: 'The stone you picked in Records (a colour or an earned icon) is now your piece on the board. If both players have the same stone or the colours clash, one of them is recoloured. A supporter\'s piece wears a thin rainbow rim.' },
      },
    ],
  },
  wallgo: {
    name: { ko: '벽바둑', en: 'Wallgo' },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 바둑알로 둬요', desc: '기록실에서 고른 내 바둑알(색·획득 아이콘)이 판 위의 내 말로 나와요. 상대와 같은 바둑알이거나 색이 겹치면 한쪽은 색만 바뀌어요. 후원자의 말에는 얇은 무지개 테두리가 둘러져요.' },
        en: { title: 'Play with your own stone', desc: 'The stone you picked in Records (a colour or an earned icon) is now your piece on the board. If both players have the same stone or the colours clash, one of them is recoloured. A supporter\'s piece wears a thin rainbow rim.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '1:1:1 어려움 AI가 강해졌어요', desc: '3인전에서 어려움과 보통의 차이가 없었어요. 어려움 AI는 이제 두 상대의 다음 수를 모두 읽어요. 1:1은 그대로예요.' },
        en: { title: 'Hard AI is stronger in 1:1:1', desc: 'In three-player games Hard was no harder than Normal. The Hard AI now reads the next move of both rivals. 1:1 is unchanged.' },
      },
    ],
  },
  wallgo2: {
    name: { ko: '벽바둑 II', en: 'Wallgo II' },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 바둑알로 둬요', desc: '기록실에서 고른 내 바둑알(색·획득 아이콘)이 판 위의 내 말로 나와요. 네모 말은 내가 만든 가장 높은 2048 블록 캐릭터로 나오고(없으면 기본 네모), 후원자의 말에는 얇은 무지개 테두리가 둘러져요.' },
        en: { title: 'Play with your own stone', desc: 'The stone you picked in Records (a colour or an earned icon) is now your piece on the board. Square pieces are the highest 2048 block character you have made (the plain square without one), and a supporter\'s piece wears a thin rainbow rim.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '1:1:1 어려움 AI가 강해졌어요', desc: '3인전에서 어려움과 보통의 차이가 없었어요. 어려움 AI는 이제 두 상대의 다음 수를 모두 읽어요. 1:1은 그대로예요.' },
        en: { title: 'Hard AI is stronger in 1:1:1', desc: 'In three-player games Hard was no harder than Normal. The Hard AI now reads the next move of both rivals. 1:1 is unchanged.' },
      },
    ],
  },
  blind_gomoku: {
    name: { ko: '블라인드 오목', en: 'Blind Gomoku' },
    items: [
      {
        date: '11/26', icon: Sparkles,
        ko: { title: '내 바둑알로 둬요', desc: '돌을 뒤집어 공개할 때 각자의 내 바둑알(기록실에서 고른 색·아이콘)로 보여요. 가려진 동안에는 주인이 드러나지 않게 색 돌 그대로이고, 둘의 바둑알이 같으면 한쪽은 색만 바뀌어요.' },
        en: { title: 'Play with your own stone', desc: 'When the stones are turned face up, each shows its player\'s own stone (the colour or icon picked in Records). Face down they stay plain colours, so the owner stays hidden; if both players have the same stone, one is recoloured.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '어려움 AI의 기억이 최근 36수로 늘었어요', desc: '최근 24수만 기억해서 오래 끌면 쉽게 이길 수 있었어요. 이제 36수까지 기억해요.' },
        en: { title: 'Hard AI remembers the last 36 moves', desc: 'It remembered only the last 24, so a long game was an easy win. It now remembers 36.' },
      },
    ],
  },
  russian_roulette: {
    name: { ko: '러시아 룰렛', en: 'Russian Roulette' },
    items: [
      {
        date: '11/26', icon: Bot,
        ko: { title: '보통 · 어려움 AI가 아는 정보를 쓰기 시작했어요', desc: '지금까지 AI는 자기 쪽 약실을 확인하고도 그대로 두곤 했어요. 이제 실탄을 봤으면 총구를 돌리거나 약실을 바꾸려 하고, 안전하면 크레딧을 아껴요.' },
        en: { title: 'Normal and Hard AIs now use what they know', desc: 'The AIs often ignored what they had seen in their own chamber. They now turn the muzzle or go for a swap when they have seen a bullet, and save credits when they are safe.' },
      },
    ],
  },
  indian_poker: {
    name: { ko: '인디언 포커', en: 'Indian Poker' },
    items: [
      {
        date: '11/26', icon: Wrench,
        ko: { title: '난이도 버튼의 AI 승률을 실제 기록으로 바꿨어요', desc: '버튼에 적힌 AI 승률이 실제보다 높았어요. 지금까지의 대전 기록으로 고쳤어요.' },
        en: { title: 'AI win rates on the level buttons now match the records', desc: 'The AI win rates shown on the buttons were higher than what really happened. They now come from the matches played so far.' },
      },
    ],
  },
  two_sided_poker: {
    name: { ko: '양면 포커', en: 'Two-Sided Poker' },
    items: [
      {
        date: '11/26', icon: Wrench,
        ko: { title: '난이도 버튼의 AI 승률을 실제 기록으로 바꿨어요', desc: '버튼에 적힌 AI 승률이 실제보다 높았어요. 지금까지의 대전 기록으로 고쳤어요.' },
        en: { title: 'AI win rates on the level buttons now match the records', desc: 'The AI win rates shown on the buttons were higher than what really happened. They now come from the matches played so far.' },
      },
    ],
  },
};

// ---------------------------------------------------------------------------------------------
// Notes for every game with friend and open rooms (changes to the shared room code). Newest first.
const ROOM_NOTES: GameUpdate[] = [
  {
    date: '11/26', icon: Crown,
    ko: { title: '친구·공개 대전: 방장이 나가도 방이 유지돼요', desc: '방장이 나가면 몇 초 뒤 남은 사람 중 먼저 들어온 사람이 방장을 이어받아 계속해요. 숨긴 카드가 있는 게임은 진행 중인 판을 새로 시작하거나 대기실로 돌아가요.' },
    en: { title: 'Friend and open rooms survive the host leaving', desc: 'A few seconds after the host leaves, whoever joined first takes over as host and play goes on. Games with hidden cards deal the current hand again or go back to the lobby.' },
  },
];

/** Every game with rooms, by update-log id (the name is used if the game has no notes of its own yet). */
const ROOM_GAMES: Record<string, { ko: string; en: string }> = {
  binairo: { ko: '비나이로', en: 'Binairo' }, black_white: { ko: '흑과 백', en: 'Black & White' }, black_white_2: { ko: '흑과 백 II', en: 'Black & White II' },
  blind_gomoku: { ko: '블라인드 오목', en: 'Blind Gomoku' }, card_janggi: { ko: '카드 장기', en: 'Card Janggi' }, color_link_duel: { ko: '컬러 링크', en: 'Color Link Duel' },
  colorlink: { ko: '컬러 잇기', en: 'Color Link' }, equation_signal: { ko: '수식 신호등', en: 'Equation Signal' }, equation_tower: { ko: '수식의 탑', en: 'Tower of Equations' }, flip_omok: { ko: '뒤집기 오목', en: 'Flip Omok' }, four_three: { ko: '4인 3목', en: '4 Player 3 In a Row' },
  gradation: { ko: '그라데이션', en: 'Gradation' }, gyulhap: { ko: '결합', en: 'Gyul! Hap!' }, heavy13: { ko: '무거운 13', en: 'Heavy 13' },
  hexagon: { ko: '헥사곤', en: 'Hexagon' }, hit_stay: { ko: 'Hit,Stay', en: 'Hit,Stay' }, indian_poker: { ko: '인디언 포커', en: 'Indian Poker' },
  janggi: { ko: '십이장기', en: '12 Janggi' }, laser_janggi: { ko: '레이저 장기', en: 'Laser Janggi' }, magicswap: { ko: '마방진 스왑', en: 'Magic Square Swap' },
  masyu: { ko: '마슈', en: 'Masyu' }, merge2048: { ko: '2048', en: '2048' }, monorail: { ko: '모노레일', en: 'Monorail' },
  nemo_count: { ko: '네모 세기', en: 'Nemo Count' }, nine_mens_morris: { ko: '나인 멘스 모리스', en: "Nine Men's Morris" }, nonogram: { ko: '노노그램', en: 'Nonogram' },
  onestroke: { ko: '한붓길', en: 'One Stroke' }, piggy_bank: { ko: '돼지 저금통', en: 'Piggy Bank' }, point_omok: { ko: '포인트 오목', en: 'Point Omok' },
  russian_janggi: { ko: '러시아장기', en: 'Russian Janggi' }, russian_roulette: { ko: '러시안 룰렛', en: 'Russian Roulette' }, slitherlink: { ko: '슬리더링크', en: 'Slitherlink' },
  starbattle: { ko: '스타배틀', en: 'Star Battle' }, two_sided_poker: { ko: '양면포커', en: 'Two-Sided Poker' }, wallgo: { ko: '벽바둑', en: 'Wallgo' }, wallgo2: { ko: '벽바둑 II', en: 'Wallgo II' },
};

for (const [key, name] of Object.entries(ROOM_GAMES)) {
  const log = (GAME_UPDATES[key] ??= { name, items: [] });
  // 'MM/DD' sorts by date; the sort is stable, so a game's own notes keep their order within a day.
  log.items = [...ROOM_NOTES, ...log.items].sort((a, b) => b.date.localeCompare(a.date));
}

// Catalog ids are camelCase, update logs are keyed by the records id (snake_case): 'colorLinkDuel' → 'color_link_duel'.
const LOG_KEY: Record<string, string> = { blackWhite2: 'black_white_2', nineMensMorris: 'nine_mens_morris' };
export const updateLogKey = (catalogId: string) => LOG_KEY[catalogId] ?? catalogId.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
/** Whether a game (catalog id) has update notes. */
export const hasGameUpdates = (catalogId: string) => !!GAME_UPDATES[updateLogKey(catalogId)]?.items.length;
