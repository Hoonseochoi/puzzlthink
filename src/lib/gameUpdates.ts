import { BellRing, Bot, Coins, DoorOpen, Crosshair, Crown, Flame, History, MousePointerClick, PenLine, Scale, Share2, Sparkles, Swords, Timer, Trophy, Undo2, Users, Wrench, type LucideIcon } from 'lucide-react';

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
  proposition_go: {
    name: { ko: '명제 바둑', en: 'Proposition Go' },
    items: [
      {
        date: '11/28', icon: Trophy,
        ko: { title: '5분 안에 풀면 피스, 1·2·3위는 피스 5개 더', desc: '오늘의 명제 바둑을 5분 안에(힌트 시간 포함) 풀면 피스 1개를 받아요. 다음 날 새 문제가 열리면 전날 1·2·3위가 피스 5개를 더 받고, 입장·결과 화면에 어제와 오늘의 포디움이 보여요.' },
        en: { title: 'Pieces for a 5-minute solve, 5 more for the top three', desc: "Solve today's Proposition Go within 5 minutes (hint time included) for 1 piece. When the next day's set opens, yesterday's top three get 5 more pieces, and the entry and result screens show yesterday's and today's podium." },
      },
      {
        date: '11/28', icon: Coins,
        ko: { title: '12/2부터 남은 피스는 현자의 징표가 돼요', desc: '12/2(수) 3W가 시작될 때 1W·2W에 남은 피스를 현자의 징표로 한꺼번에 교환해 드리고, 그 뒤로도 매주 수요일 남은 피스가 징표로 바뀌어 계속 남아요. 힌트·아이템에는 징표가 먼저 쓰이고, 다 쓰면 이번 주 피스를 써요.' },
        en: { title: "From 12/2, leftover pieces become Sage's Tokens", desc: "When week 3 starts on Wed 12/2, your leftover week 1 and week 2 pieces are exchanged for Sage's Tokens together, and every Wednesday after that the past week's leftover pieces become tokens that stay for good. Hints and items use tokens first, then this week's pieces." },
      },
      {
        date: '11/28', icon: Sparkles,
        ko: { title: '명제 바둑이 나왔어요 — PUZZLTHINK ORIGINAL 첫 퍼즐', desc: '색 바둑알을 놓아 모든 명제를 참으로 만드는 논리 퍼즐이에요. 매일 모두 같은 3문제를 시계 하나로 풀고(세 번째는 거짓말 찾기), 막히면 피스로 명제를 하나 더(+30초), 블랙피스로 돌 하나의 자리를(+40초) 받을 수 있어요. 힌트는 한 판에 3개까지예요.' },
        en: { title: 'Proposition Go is here — the first PUZZLTHINK ORIGINAL puzzle', desc: 'Place coloured stones so every proposition is true. Everyone plays the same three puzzles each day on one clock (the third hides a lie); stuck, a piece buys one more proposition (+30 s) and a black piece shows one stone (+40 s), up to 3 hints per run.' },
      },
    ],
  },
  mine_oblivion: {
    name: { ko: '망각의 지뢰', en: 'Mine of Oblivion' },
    items: [
      {
        date: '11/28', icon: Coins,
        ko: { title: '12/2부터 남은 피스는 현자의 징표가 돼요', desc: '12/2(수) 3W가 시작될 때 1W·2W에 남은 피스를 현자의 징표로 한꺼번에 교환해 드리고, 그 뒤로도 매주 수요일 남은 피스가 징표로 바뀌어 계속 남아요. 힌트·아이템에는 징표가 먼저 쓰이고, 다 쓰면 이번 주 피스를 써요.' },
        en: { title: "From 12/2, leftover pieces become Sage's Tokens", desc: "When week 3 starts on Wed 12/2, your leftover week 1 and week 2 pieces are exchanged for Sage's Tokens together, and every Wednesday after that the past week's leftover pieces become tokens that stay for good. Hints and items use tokens first, then this week's pieces." },
      },
      {
        date: '11/28', icon: Scale,
        ko: { title: '결과 화면에 점수 내역', desc: '보물(몇 번째에 찾았는지)·지뢰 감점·숫자 점수·합계를 두 사람 나란히 보여 주고, 차이가 가장 큰 줄을 승부처로 표시해요. 복기 끝에도 같은 내역이 나와요.' },
        en: { title: 'Score breakdown on the result', desc: 'Treasure (and in which order it was found), mine penalties, number points and the total, side by side, with the line that decided the game marked. The same breakdown ends the replay.' },
      },
      {
        date: '11/28', icon: Coins,
        ko: { title: 'AI 대전에 아이템이 생겼어요', desc: '회원은 피스로 탐지기(옆 칸 둘레 지뢰 수)·기억 되살리기(내 지뢰 2초), 블랙피스로 방폭복(다음 지뢰 한 번 무효)을 쓸 수 있어요. 아이템을 쓴 판은 어려움 인증·피스 획득·명예의 전당 승수에서 빠져요.' },
        en: { title: 'Items in AI matches', desc: 'Members can spend pieces on Detector (mines around a cell next to you) and Recall (your mines for 2 s), and a black piece on the Blast suit (your next mine costs nothing). Item games do not count for the Hard certificate, piece earnings or Hall wins.' },
      },
      {
        date: '11/28', icon: Sparkles,
        ko: { title: '망각의 지뢰가 열렸어요', desc: '데스게임 6회차 1:1 게임을 방송 규칙대로 옮겼어요. 지뢰 15개를 몰래 묻고, 내 지뢰마저 사라진 판을 걸으며 숫자를 기억해 보물을 찾아요. AI 보통·어려움과 친구·공개방 1:1.' },
        en: { title: 'Mine of Oblivion is here', desc: 'The 1:1 match from Death Game, with the broadcast rules: bury 15 secret mines, then walk a board that hides even yours, remembering the numbers to find treasure. Normal and hard AI, friend and open rooms.' },
      },
    ],
  },
  hidden_word_plus: {
    name: { ko: '히든 워드 확장판', en: 'Hidden Word: Expansion' },
    items: [
      {
        date: '11/28', icon: DoorOpen,
        ko: { title: '오픈 대전이 생겼어요 (방은 앱 테스터만 열 수 있어요)', desc: '처음 보는 사람과 붙는 오픈 대전이에요. 1:1 대전만 열려요. 방은 Google Play 테스트 앱에서만 열 수 있고, 참가는 웹·아이폰 어디서든 돼요. 봉투와 숨긴 단어는 서버가 맡아서 상대 화면에는 끝날 때까지 보이지 않아요.' },
        en: { title: 'Open matches are here (app testers host them)', desc: 'Matches against people you do not know. 1:1 only. Rooms are opened only in the Google Play test app; anyone can join, on the web or an iPhone. The server holds the envelopes and hidden words, so the other side never sees yours before the turn ends.' },
      },
      {
        date: '11/28', icon: Undo2,
        ko: { title: '뒤로가기를 고치고, 끝난 판에 홈으로 버튼을 달았어요', desc: '대전 중 왼쪽 위 ← 가 먹히지 않던 문제를 고쳤고, 규칙·랭킹 창은 휴대폰 뒤로가기로 닫혀요. 대전 중 Google 로그인을 하면 하던 대전으로 돌아오고, 결과 화면에 홈으로 버튼이 생겼어요.' },
        en: { title: 'Back fixed, and a Home button after the match', desc: 'The ← at the top left now leaves a match, and the phone\'s back closes the rules and ranking popups. Signing in with Google mid-match brings you back to the match, and results now have a Home button.' },
      },
      {
        date: '11/27', icon: Wrench,
        ko: { title: 'MORA가 이미 나온 단어를 힌트로 다시 내던 문제를 고쳤어요', desc: '내가 답으로 냈다가 틀린 단어를 MORA가 다음 단계 힌트로 다시 내는 일이 있었어요. 이제 판에 나온 단어는 다시 나오지 않고, 친구 파티 방에서도 앞 단계에 나온 답은 다시 낼 수 없어요.' },
        en: { title: 'Fixed: MORA repeated a word already on the board', desc: 'MORA sometimes gave your wrong answer back to you as a hint in the next stage. Words already on the board no longer come back, and in party rooms an answer from an earlier stage cannot be given again.' },
      },
      {
        date: '11/27', icon: Users,
        ko: { title: '친구 2~5명 파티 방이 열렸어요', desc: '방송 메인매치처럼 모두가 한 번씩 출제하고 나머지가 동시에 답해요. 맞힌 사람마다 +1, 아무도 못 맞히면 출제자 +1·+2·+3, 2라운드는 2배. 내 봉투 단어는 나만 봐요.' },
        en: { title: 'Party rooms for 2–5 friends', desc: 'Like the show\'s main match: everyone sets once a round and the rest answer together. +1 for each right answer, +1/+2/+3 for the setter if nobody gets it, round 2 doubled. Only you see your envelope.' },
      },
      {
        date: '11/27', icon: Sparkles,
        ko: { title: '히든 워드 확장판 출시', desc: '감정·직업·장소·음식·문화까지, 서로 닮은 186단어가 30개 묶음으로 나와요. 95% 힌트로 묶음을 찾고 그 안에서 모라의 단어를 가려내세요. 모라의 힌트는 덜 직접적이고, 랭킹과 1위 아이콘은 확장판 따로예요. 로그인한 회원만 할 수 있어요.' },
        en: { title: 'Hidden Word: Expansion is here', desc: '186 look-alike words in 30 groups: feelings, jobs, places, food, culture. A 95% hint finds the group; then pick MORA\'s word out of it. MORA hints less directly, and the ranking and #1 icon are the Expansion\'s own. For signed-in members only.' },
      },
    ],
  },
  sniper_holdem: {
    name: { ko: '스나이퍼 홀덤', en: "Sniper Hold'em" },
    note: { ko: '의견은 언제든 버그 제보로 보내주세요. 고맙습니다!', en: 'Send us your thoughts any time with the bug report button. Thank you!' },
    items: [
      {
        date: '11/27', icon: History,
        ko: { title: '복기와 게임 보기가 생겼어요', desc: '게임이 끝나면 마지막 판을 잠깐 보여준 뒤 결과가 떠요. 결과 창의 「게임 보기」로 마지막 테이블로 돌아가고, 「복기하기」로 판마다 모두의 패·공유 카드·베팅 순서·저격·팟의 주인을 다시 볼 수 있어요(친구방에서는 내가 본 패만).' },
        en: { title: 'Replay and View game', desc: 'When a match ends, the last hand stays up for a moment before the result. "View game" takes you back to the final table, and "Replay" steps through every hand: all cards, the shared cards, each bet in order, the snipes and who took the pot (in rooms, only the cards you saw).' },
      },
      {
        date: '11/27', icon: Crosshair,
        ko: { title: '저격할 때 공유 카드와 베팅이 보여요', desc: '저격 창 안에 공유 카드 4장과 내 카드, 이번 판에 각자 건 칩과 포기한 사람, 팟이 함께 보여요. 테이블을 가리지 않고도 무엇을 저격할지 고를 수 있어요.' },
        en: { title: 'Shared cards and bets while sniping', desc: 'The snipe picker now shows the four shared cards, your cards, what each player put in this hand (and who folded) and the pot, so you can choose a snipe without the table hidden behind it.' },
      },
      {
        date: '11/27', icon: Bot,
        ko: { title: 'AI가 1칩씩 주고받는 레이즈를 멈췄어요', desc: 'AI끼리 1칩씩 끝없이 올리던 핑퐁이 사라졌어요. 이제 패가 확실하면 판돈의 절반 이상이나 올인으로 크게 걸고, 한 번 레이즈한 뒤 다시 올려 오면 콜·폴드하거나 크게 한 번만 받아쳐요. 성향에 따라 크게 거는 기준은 달라요.' },
        en: { title: 'The AI stopped trading 1-chip raises', desc: 'AIs no longer raise each other by 1 chip over and over. A clearly strong hand now bets half the pot or more, sometimes all in, and an AI that gets re-raised calls, folds or answers once with a big raise. How strong a hand must be to bet big depends on the personality.' },
      },
      {
        date: '11/27', icon: Bot,
        ko: { title: 'AI 상대 10가지 성향과 심리전', desc: '블러퍼, 바위, 콜링 스테이션, 저격 난사꾼, 큰 판만 노리는 독사 등 10가지 성향 중 매 판 무작위로 앉고 그날 기분도 달라요. 지난 판에 공개된 패와 저격을 기억해 당신의 버릇을 읽고, 가끔은 성향과 다르게 둬요. 대사도 하고, 진짜 성향은 결과 화면에서 공개돼요.' },
        en: { title: '10 AI personalities and mind games', desc: 'Bluffers, rocks, calling stations, trigger-happy snipers, a viper that waits for big pots and more: each match seats a random few, each in its own mood. They remember hands shown and snipes made to read your habits, sometimes play out of character, talk at the table, and their true styles are revealed at the end.' },
      },
      {
        date: '11/27', icon: Coins,
        ko: { title: '기본 베팅이 점점 올라요', desc: '처음 4라운드는 방송처럼 1칩, 그 뒤로 2라운드마다 올라서(2·3·4·6·8칩, 그다음 +3칩씩) 한 판이 늘어지지 않아요. AI 5인전은 보통 15라운드 안팎에 끝나요. 친구·공개방은 방장이 방송 규칙(1칩 고정)을 고를 수 있고, 테이블에 지금 기본 베팅과 다음에 오르는 라운드가 보여요.' },
        en: { title: 'The ante now rises', desc: 'One chip for the first 4 rounds, as on the show, then it goes up every 2 rounds (2, 3, 4, 6, 8, then +3 each time), so matches no longer drag: about 15 rounds at five against the AI. Room hosts can pick show rules (fixed 1 chip), and the table shows the ante and when it rises next.' },
      },
      {
        date: '11/27', icon: Sparkles,
        ko: { title: '스나이퍼 홀덤이 열렸어요', desc: '데블스 플랜 2(데스룸) 3일차 감옥 매치예요. 상대 족보를 숫자까지 맞혀 저격하면 꼴찌! AI 5인전·1:1, 친구·공개방 2~5명으로 할 수 있어요.' },
        en: { title: "Sniper Hold'em is open", desc: "The day-3 prison match of The Devil's Plan 2 (Death Room): name an opponent's exact hand and it ranks last. Five-player or 1:1 vs AI, and friend or open rooms for 2–5." },
      },
    ],
  },
  hidden_word: {
    name: { ko: '히든 워드', en: 'Hidden Word' },
    items: [
      {
        date: '11/28', icon: Coins,
        ko: { title: '12/2부터 남은 피스는 현자의 징표가 돼요', desc: '12/2(수) 3W가 시작될 때 1W·2W에 남은 피스를 현자의 징표로 한꺼번에 교환해 드리고, 그 뒤로도 매주 수요일 남은 피스가 징표로 바뀌어 계속 남아요. 힌트·아이템에는 징표가 먼저 쓰이고, 다 쓰면 이번 주 피스를 써요.' },
        en: { title: "From 12/2, leftover pieces become Sage's Tokens", desc: "When week 3 starts on Wed 12/2, your leftover week 1 and week 2 pieces are exchanged for Sage's Tokens together, and every Wednesday after that the past week's leftover pieces become tokens that stay for good. Hints and items use tokens first, then this week's pieces." },
      },
      {
        date: '11/28', icon: DoorOpen,
        ko: { title: '오픈 대전이 생겼어요 (방은 앱 테스터만 열 수 있어요)', desc: '처음 보는 사람과 붙는 오픈 대전이에요. 방은 Google Play 테스트 앱에서만 열 수 있고, 참가는 웹·아이폰 어디서든 돼요. 봉투와 숨긴 단어는 서버가 맡아서 상대 화면에는 끝날 때까지 보이지 않아요.' },
        en: { title: 'Open matches are here (app testers host them)', desc: 'Matches against people you do not know. Rooms are opened only in the Google Play test app; anyone can join, on the web or an iPhone. The server holds the envelopes and hidden words, so the other side never sees yours before the turn ends.' },
      },
      {
        date: '11/28', icon: Undo2,
        ko: { title: '뒤로가기를 고치고, 끝난 판에 홈으로 버튼을 달았어요', desc: '대전 중 왼쪽 위 ← 가 먹히지 않던 문제를 고쳤고, 규칙·랭킹 창은 휴대폰 뒤로가기로 닫혀요. 대전 중 Google 로그인을 하면 하던 대전으로 돌아오고, 결과 화면에 홈으로 버튼이 생겼어요.' },
        en: { title: 'Back fixed, and a Home button after the match', desc: 'The ← at the top left now leaves a match, and the phone\'s back closes the rules and ranking popups. Signing in with Google mid-match brings you back to the match, and results now have a Home button.' },
      },
      {
        date: '11/27', icon: Wrench,
        ko: { title: 'MORA가 이미 나온 단어를 힌트로 다시 내던 문제를 고쳤어요', desc: '내가 답으로 냈다가 틀린 단어를 MORA가 다음 단계 힌트로 다시 내는 일이 있었어요. 이제 판에 이미 나온 단어는 힌트로도, 마지막에 공개되는 가장 가까운 단어로도 다시 나오지 않아요.' },
        en: { title: 'Fixed: MORA repeated a word already on the board', desc: 'MORA sometimes gave your wrong answer back to you as a hint in the next stage. Words already on the board no longer come back as hints or as the revealed closest word.' },
      },
      {
        date: '11/27', icon: Sparkles,
        ko: { title: '히든 워드 확장판이 따로 나왔어요', desc: '닮은 단어 186개로 하는 확장판은 이제 자기 화면과 랭킹이 있는 게임이에요. 히든 워드는 기본 60단어로 하고, 첫 화면의 "확장판 하러 가기"로 넘어갈 수 있어요. 어젯밤 확장으로 둔 대전은 확장판 랭킹으로 옮겼어요.' },
        en: { title: 'Hidden Word: Expansion is now its own game', desc: 'The 186-word Expansion now has its own page and ranking. Hidden Word plays its 60 words again; "Play the Expansion" on its entry screen takes you over. Expansion matches played last night moved to the Expansion ranking.' },
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
        date: '11/28', icon: Swords,
        ko: { title: '새 모드: 1:1 출제 대결', desc: '친구 방·공개방에서 둘이 3분 동안 서로 풀 수식을 내고, 동시에 상대의 수식을 맞혀요. 맞힌 쪽이 이기고, 둘 다 맞히면 제출이 적은 쪽, 같으면 더 빨리 맞힌 쪽이 이겨요.' },
        en: { title: 'New mode: 1:1 puzzle duel', desc: 'In a friend or open room, each of you writes an equation in 3 minutes, then you both find the other\'s at once. Solving wins; if both solve, fewer guesses wins, then the faster solve.' },
      },
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
  time_auction: {
    name: { ko: '시간 경매', en: 'Time Auction' },
    items: [
      {
        date: '11/27', icon: Timer,
        ko: { title: '버튼을 계속 누르지 않아도 돼요', desc: '한 번 누르면 시작하고, 다시 누르면 멈춰요. 카운트다운 안에 다시 누르면 포기, 그 뒤에 누르면 그 시간에 입찰이 끝나요.' },
        en: { title: 'No more holding the button', desc: 'One tap starts and the next tap stops. Tap again during the countdown to drop out; after it, your tap ends your bid at that time.' },
      },
      {
        date: '11/27', icon: Timer,
        ko: { title: '내 남은 시간이 보여요 · 기본은 표준 5분', desc: '버튼 위에 내 남은 시간이 보이고, 누르는 동안 0.1초 단위로 줄어요. 다른 사람의 시간은 그대로 비공개예요(친구 방은 방장이 방송처럼 숨길 수 있어요). 기본 경매는 표준 5분 × 13경매가 됐어요.' },
        en: { title: 'See your own time · Standard 5:00 by default', desc: 'Your remaining time now shows above the button and drains to 0.1 s while you hold; everyone else\'s stays hidden (friend-room hosts can hide it as on the show). The default is now Standard, 5:00 × 13 auctions.' },
      },
      {
        date: '11/27', icon: Sparkles,
        ko: { title: '시간 경매가 열렸어요', desc: '데블스 플랜 2 감옥매치를 방송 규칙대로 옮겼어요. 경매마다 바둑알 하나가 올라오고 버튼을 가장 오래 누른 사람이 가져가요. PUZZLTHINK 아이콘이 바둑알로 올라오고, 좋은 아이콘일수록 점수가 커요(중급 2점, 마지막 최상급 3점 · 실제 아이콘은 지급되지 않아요). 가장 먼저 손을 뗀 사람은 헬모드 마이너스 바둑알(−1)을 받아요. AI는 10명의 캐릭터 중 5명이 매 판 다른 기분으로 앉아요. 친구·공개방 2~6명.' },
        en: { title: 'Time Auction is open', desc: "The Devil's Plan 2 prison match with the broadcast rules: each auction puts up one go stone and whoever holds longest takes it. PUZZLTHINK icons go up as pieces and better icons score more (mid-tier 2, the last top icon 3; no real icon is granted); whoever lets go first takes the hell-mode minus stone (−1). Five of ten AI characters sit each match, each in a different mood; 2–6 in rooms." },
      },
    ],
  },
  hit_stay: {
    name: { ko: 'Hit,Stay', en: 'Hit,Stay' },
    note: { ko: '의견은 언제든 버그 제보로 보내주세요. 고맙습니다!', en: 'Send us your thoughts any time with the bug report button. Thank you!' },
    items: [
      {
        date: '11/27', icon: Users,
        ko: { title: 'AI가 열 명이 됐어요', desc: '빈자리 넷에 열 명 중 서로 다른 AI가 무작위로 앉아요. 모두 같은 계산으로 최선을 찾고 위험을 대하는 성향만 달라요. 이번 판에서 누가 허세로 레이즈했는지도 기억하고, 결과 화면에서 각자의 성향이 공개돼요.' },
        en: { title: 'Ten AI players now', desc: 'The four empty seats get four different AIs out of ten. All find the best move with the same calculation and differ only in how they treat risk; they remember who raised on air this match, and the result screen reveals each style.' },
      },
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
        date: '11/28', icon: Coins,
        ko: { title: '12/2부터 남은 피스는 현자의 징표가 돼요', desc: '12/2(수) 3W가 시작될 때 1W·2W에 남은 피스를 현자의 징표로 한꺼번에 교환해 드리고, 그 뒤로도 매주 수요일 남은 피스가 징표로 바뀌어 계속 남아요. 힌트·아이템에는 징표가 먼저 쓰이고, 다 쓰면 이번 주 피스를 써요.' },
        en: { title: "From 12/2, leftover pieces become Sage's Tokens", desc: "When week 3 starts on Wed 12/2, your leftover week 1 and week 2 pieces are exchanged for Sage's Tokens together, and every Wednesday after that the past week's leftover pieces become tokens that stay for good. Hints and items use tokens first, then this week's pieces." },
      },
      {
        date: '11/27', icon: Sparkles,
        ko: { title: '크리스마스 테마가 나왔어요 (기본 적용)', desc: "사탕 지팡이 숫자와 꼬마전구 선, 눈 내리는 밤으로 바뀌었어요. 클리어하면 고리를 따라 불이 켜져요. 위쪽 '테마' 버튼에서 예전 '기본' 보드로 돌아가거나 효과를 끌 수 있어요." },
        en: { title: 'New Christmas theme (on by default)', desc: "Candy-cane numbers, fairy-light lines and a snowy night. On a clear the lights switch on around the loop. The 'Theme' button at the top brings back the Classic board or turns the effects off." },
      },
      {
        date: '11/27', icon: Share2,
        ko: { title: '클리어 카드를 SNS에 공유할 수 있어요', desc: '풀고 나면 내 보드와 기록이 담긴 카드 이미지가 만들어져요. 휴대폰에서는 카톡·인스타·X로 바로 보내고, 저장하거나 링크만 복사할 수도 있어요.' },
        en: { title: 'Share a clear card', desc: 'After a clear you get a picture of your solved board and time. On a phone send it straight to any app, or save it, or copy the link.' },
      },
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
        date: '11/27', icon: Crown,
        ko: { title: '블록 아이콘이 단계마다 더 화려해지고, 1위 아이콘이 새로 바뀌었어요', desc: '큰 블록일수록 왕관·보석·빛살·테두리가 하나씩 더해져요. 랭킹 1위 아이콘은 모든 블록 색이 담긴 프리즘 왕관으로 사다리 맨 위에 섭니다.' },
        en: { title: 'Block icons grow grander each tier, and a new #1 icon', desc: 'Each bigger block adds a crown, jewel, sunburst or frame. The ranking #1 icon is now a prism-crowned stone in every tier colour, above the whole ladder.' },
      },
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
        date: '11/27', icon: Trophy,
        ko: { title: '마지막 판을 본 뒤 결과가 떠요', desc: '게임이 끝나면 마지막으로 이은 판이 잠깐 보인 뒤 결과가 떠요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'See the final board before the result', desc: 'When the game ends the last links stay on screen for a moment before the result. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/28', icon: Bot,
        ko: { title: 'COCO가 제대로 막고 읽어요', desc: '이제 COCO는 보통·어려움 모두 상대의 4와 열린 3을 꼭 막고, 6목이 될 쓸모없는 줄을 늘리거나 그런 데 뒤집기를 쓰지 않아요. 어려움은 4를 연달아 두는 승리 수순까지 읽어요.' },
        en: { title: 'COCO now blocks and reads properly', desc: 'At both levels COCO now always blocks your fours and open threes, and never grows a line that can only become six or spends a flip on one. Hard also reads winning runs of fours.' },
      },
      {
        date: '11/28', icon: Flame,
        ko: { title: '새 규칙 「전략적 뒤집기」: 뒤집기는 한 판에 3번, 내가 고를 때만', desc: '이제 상대 돌을 끼워도 바로 뒤집히지 않고, ‘놓기’와 ‘놓고 뒤집기’ 중에 골라요. 뒤집기는 한 판에 3번뿐이고 뒤집힌 돌은 🔒 고정돼서 다시 뒤집히지 않아요.' },
        en: { title: 'New rule, strategic flip: 3 flips a game, only when you choose', desc: 'Sandwiching no longer flips by itself: choose Place or Place & flip. You get 3 flips a game, and flipped stones lock 🔒 so they never flip back.' },
      },
      {
        date: '11/28', icon: Sparkles,
        ko: { title: '뒤집기 오목이 PUZZLTHINK ORIGINAL 시리즈가 됐어요', desc: 'PUZZLTHINK가 직접 만든 게임들을 ORIGINAL 시리즈로 묶었어요. 규칙은 그대로이고, 홈의 ORIGINAL 줄에서 새 오리지널 퍼즐 명제 바둑과 함께 찾을 수 있어요.' },
        en: { title: 'Flip Omok joins the PUZZLTHINK ORIGINAL series', desc: 'The games PUZZLTHINK made itself now form the ORIGINAL series. The rules are unchanged; find it in the ORIGINAL row on the home page, next to the new original puzzle Proposition Go.' },
      },
      {
        date: '11/27', icon: Trophy,
        ko: { title: '이긴 다섯 알에 선이 그어진 뒤 결과가 떠요', desc: '게임이 끝나면 판이 그대로 남고, 이긴 다섯 알에 선이 그어지며 빛나요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'The winning five are lined through before the result', desc: 'When the game ends the board stays up and the winning five light up with a line through them. Wait a moment or tap anywhere to open the result.' },
      },
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
  card_janggi: {
    name: { ko: '카드 장기', en: 'Card Janggi' },
    items: [
      {
        date: '11/27', icon: Trophy,
        ko: { title: '마지막 판을 본 뒤 결과가 떠요', desc: '승부가 난 마지막 라운드의 판이 잠깐 보인 뒤 결과가 떠요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'See the final board before the result', desc: 'The deciding round\'s final board stays up for a moment before the match result. Wait a moment or tap anywhere to open the result.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '코끼리는 대각선으로 2칸까지만 가요', desc: '방송 규칙서대로 코끼리가 대각선 한 방향으로 1–2칸만 움직여요. 1칸째에 말이 있으면 뛰어넘지 못해요. 전에는 비숍처럼 대각선 끝까지 갈 수 있었어요.' },
        en: { title: 'The elephant now moves at most two squares', desc: 'As in the show’s rulebook, the elephant moves 1–2 squares in one diagonal direction and cannot jump a piece on the first square. It used to slide any distance like a bishop.' },
      },
    ],
  },
  laser_janggi: {
    name: { ko: '레이저 장기', en: 'Laser Janggi' },
    items: [
      {
        date: '11/28', icon: Wrench,
        ko: { title: '시작 판을 방송 판 그대로 바꿨어요', desc: '방송에서 규칙을 설명한 판을 한 칸씩 옮겼어요. 이제 각자 네모기사 2·세모기사 5개로 시작하고, 스플리터는 반대쪽 구석(H1·A8)에 있으며, 두 레이저의 첫 빛은 가운데 나비넥타이를 지나가요. 거울 면은 반사, 다른 면에 맞은 말은 제거, 레이저와 스플리터는 맞아도 남는 규칙은 그대로예요.' },
        en: { title: 'The starting board now matches the show exactly', desc: "Copied square by square from the board the show used to explain the rules: each side now has two square and five triangle knights, the splitters sit in the far corners (H1, A8) and both opening beams run through the centre bow tie. Mirrors still reflect, other faces still remove the piece, and lasers and splitters are never removed." },
      },
      {
        date: '11/28', icon: Bot,
        ko: { title: 'AI가 자기 빛으로 자기 말을 맞히지 않아요', desc: '쉬움·보통 AI도 다른 수가 있으면 자기 말을 레이저로 맞히는 수는 두지 않아요.' },
        en: { title: 'The AI no longer shoots its own pieces', desc: 'Easy and Normal AI too now avoid any move whose beam removes one of their own pieces, as long as another move exists.' },
      },
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
        date: '11/27', icon: Trophy,
        ko: { title: '마지막 판을 본 뒤 결과가 떠요', desc: '게임이 끝나면 마지막 선로가 놓인 판이 잠깐 보인 뒤 결과가 떠요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'See the final board before the result', desc: 'When the game ends the board with its last rails stays up for a moment before the result. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/27', icon: Trophy,
        ko: { title: '이긴 세 줄에 선이 그어진 뒤 결과가 떠요', desc: '대국이 끝나면 이긴 한 줄에 그 색의 선이 그어진 판이 잠깐 보여요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'The winning three are lined through before the result', desc: 'When the game ends the winning row gets a line in the winner\'s colour for a moment. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/27', icon: Trophy,
        ko: { title: '王을 잡은 수가 표시된 뒤 결과가 떠요', desc: '대국이 끝나면 王을 잡은 말에 테두리가, 잡힌 王과 마지막 이동에 표시가 나타나요. 적진에 들어가 이긴 王도 빛나요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'The move that took the 王 is shown before the result', desc: 'When the game ends the piece that took the 王 is ringed, with the taken 王 and the last move marked. A 王 that won by entering the camp lights up too. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/27', icon: Users,
        ko: { title: 'AI 상대가 열 가지 성향으로 나와요', desc: '판마다 공격형·신중형·블러퍼·막판 승부사 등 열 명 중 한 명이 무작위로 나와요. 판단력은 모두 같고 큰 숫자를 쓰는 타이밍이 달라요. 이번 판의 내 버릇도 색과 승패로 읽고, 누구였는지는 끝나면 공개돼요.' },
        en: { title: 'The AI now comes in ten personalities', desc: 'Each game draws one of ten (the Attacker, the Careful One, the Bluffer, the Closer…). All judge equally well but spend their big tiles at different times; they read your habits from colours and results, and the personality is revealed at the end.' },
      },
      {
        date: '11/26', icon: Scale,
        ko: { title: '어려움 AI가 덜 읽히게 됐어요', desc: '어려움이 보통보다 쉽다는 기록이 나와서 조정했어요. 어려움은 패를 더 섞어 내서 읽기 어렵고, 보통은 네 번에 한 번 감으로 내요.' },
        en: { title: 'Hard AI is harder to read', desc: 'Records showed Hard was easier than Normal. Hard now mixes its tiles more, and Normal plays one tile in four by feel.' },
      },
    ],
  },
  black_white_2: {
    name: { ko: '흑과 백 II', en: 'Black & White II' },
    items: [
      {
        date: '11/27', icon: Users,
        ko: { title: 'AI 상대가 열 가지 성향으로 나와요', desc: '판마다 열 명 중 한 명이 무작위로 나와요. 판단력은 모두 같고 포인트를 몰아 쓰는 판과 색을 쓰는 방식이 달라요. 이번 판의 내 버릇도 색·승패로 읽고, 누구였는지는 끝나면 공개돼요.' },
        en: { title: 'The AI now comes in ten personalities', desc: 'Each game draws one of ten. All judge equally well but spend their points in different rounds and use colours differently; they read your habits from colours and results, and the personality is revealed at the end.' },
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
        date: '11/27', icon: Trophy,
        ko: { title: '마지막 수와 오목 선을 본 뒤 결과가 떠요', desc: '마지막 라운드의 돌이 떨어지고 오목에 선이 그어질 때까지 결과 창이 기다려요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'See the last stones and the five before the result', desc: 'The result waits until the last round\'s stones have dropped and the five is lined through. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/27', icon: Trophy,
        ko: { title: '마지막 판을 본 뒤 결과가 떠요', desc: '4라운드가 끝나면 마지막 판과 3목 선이 잠깐 보인 뒤 결과가 떠요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'See the final board before the result', desc: 'After round 4 the last board and its three-in-a-row stay up for a moment before the result. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/27', icon: Trophy,
        ko: { title: '마지막 판을 본 뒤 결과가 떠요', desc: '게임이 끝나면 마지막 벽이 세워진 판이 잠깐 보인 뒤 결과가 떠요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'See the final board before the result', desc: 'When the game ends the board with its last walls stays up for a moment before the result. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/27', icon: Trophy,
        ko: { title: '마지막 판을 본 뒤 결과가 떠요', desc: '게임이 끝나면 마지막 벽이 세워진 판이 잠깐 보인 뒤 결과가 떠요. 잠깐 기다리거나 화면을 누르면 결과 창이 열려요.' },
        en: { title: 'See the final board before the result', desc: 'When the game ends the board with its last walls stays up for a moment before the result. Wait a moment or tap anywhere to open the result.' },
      },
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
        date: '11/27', icon: Users,
        ko: { title: 'AI 상대가 열 가지 성향으로 나와요', desc: '판마다 블러퍼·신중형·추격자 등 열 명 중 한 명이 나와 베팅 크기와 블러프 빈도가 달라요. 판단력은 모두 같고, 이제 공개된 카드로 내 베팅 버릇도 읽어요. 어려움은 일부러 하는 실수 없이 둬요.' },
        en: { title: 'The AI now comes in ten personalities', desc: 'Each match draws one of ten (the Bluffer, the Careful One, the Chaser…) with its own bet sizes and bluff rate. All judge equally well, they now read your betting habits from the revealed cards, and hard no longer makes deliberate slips.' },
      },
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
        date: '11/27', icon: Users,
        ko: { title: 'AI 상대가 열 가지 성향으로 나와요', desc: '판마다 블러퍼·함정 설치형·막판 승부사 등 열 명 중 한 명이 나와 베팅 크기와 뒷면 블러프 빈도가 달라요. 판단력은 모두 같고, 쇼다운에서 공개된 카드로 내 뒷면 베팅이 정직했는지도 읽어요.' },
        en: { title: 'The AI now comes in ten personalities', desc: 'Each match draws one of ten (the Bluffer, the Trapper, the Closer…) with its own bet sizes and back-bluff rate. All judge equally well, and they read from showdowns whether your hidden-back bets were honest.' },
      },
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
    date: '11/28', icon: BellRing,
    ko: { title: '오픈 대전: AI전 중인 사람에게 초대 보내기', desc: '오픈 대전 방장은 대기실에서 지금 그 게임 AI전을 하고 있는 사람들에게 초대를 보낼 수 있어요(1분에 한 번, 방마다 5번까지). 초대받은 사람 화면 위쪽에 작은 알림이 뜨고 「참가」로 바로 들어와요. 1분이 지나거나 방이 차면 사라지고, 「오늘은 초대 받지 않기」로 끌 수 있어요.' },
    en: { title: 'Open matches: invite people playing the AI', desc: "An open room's host can invite everyone playing that game's AI right now from the waiting room (once a minute, 5 times per room). They get a small card at the top of the screen and join with one tap. It goes away after a minute or when the room fills, and \"No invites for today\" turns it off." },
  },
  {
    date: '11/28', icon: Sparkles,
    ko: { title: '친구·오픈 대전: 시작할 때 VS 화면, 결과에 승자 아이콘', desc: '대전이 시작되면 2초쯤 내 아이콘과 상대 아이콘이 크게 맞붙고(탭하면 바로 넘어가요), 상대의 대전 전적과 1위·히든 미션 같은 칭호가 보여요. 위쪽 이름표는 아이콘이 먼저 보이고, 희귀 아이콘은 테두리가 빛나요.' },
    en: { title: 'Friend and open matches: a VS screen at the start, the winner\'s icon at the end', desc: 'When a match starts, your icon and your opponent\'s face off for about 2 seconds (tap to skip), with their record against people and titles like #1 or Hidden Mission. The name plates at the top now lead with the icon, and rare icons get a glowing rim.' },
  },
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
  hexagon: { ko: '헥사곤', en: 'Hexagon' }, sniper_holdem: { ko: '스나이퍼 홀덤', en: "Sniper Hold'em" }, hit_stay: { ko: 'Hit,Stay', en: 'Hit,Stay' }, indian_poker: { ko: '인디언 포커', en: 'Indian Poker' },
  janggi: { ko: '십이장기', en: '12 Janggi' }, laser_janggi: { ko: '레이저 장기', en: 'Laser Janggi' }, magicswap: { ko: '마방진 스왑', en: 'Magic Square Swap' },
  masyu: { ko: '마슈', en: 'Masyu' }, merge2048: { ko: '2048', en: '2048' }, monorail: { ko: '모노레일', en: 'Monorail' },
  nemo_count: { ko: '네모 세기', en: 'Nemo Count' }, nine_mens_morris: { ko: '나인 멘스 모리스', en: "Nine Men's Morris" }, nonogram: { ko: '노노그램', en: 'Nonogram' },
  onestroke: { ko: '한붓길', en: 'One Stroke' }, piggy_bank: { ko: '돼지 저금통', en: 'Piggy Bank' }, point_omok: { ko: '포인트 오목', en: 'Point Omok' },
  russian_janggi: { ko: '러시아장기', en: 'Russian Janggi' }, russian_roulette: { ko: '러시안 룰렛', en: 'Russian Roulette' }, slitherlink: { ko: '슬리더링크', en: 'Slitherlink' },
  starbattle: { ko: '스타배틀', en: 'Star Battle' }, two_sided_poker: { ko: '양면포커', en: 'Two-Sided Poker' }, wallgo: { ko: '벽바둑', en: 'Wallgo' }, wallgo2: { ko: '벽바둑 II', en: 'Wallgo II' },
  time_auction: { ko: '시간 경매', en: 'Time Auction' }, mine_oblivion: { ko: '망각의 지뢰', en: 'Mine of Oblivion' },
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
