import { Bot, Coins, History, MousePointerClick, PenLine, Sparkles, Trophy, Undo2, Users, type LucideIcon } from 'lucide-react';

// Update notes for players: the "업데이트" badge in a game's header opens these (src/components/GameUpdates.tsx).
//
// HOW TO ADD ONE (every session that ships a change players will notice):
//   - Put the new entry FIRST in that game's `items` (newest first), date as 'MM/DD' in KST.
//   - Korean and English, short: `title` says what changed in one line, `desc` says how it plays now (1–2 sentences).
//   - Only what players see or feel: rules, AI, modes, controls, fixes of bugs they hit. Not refactors, SEO, ids.
//   - A change undone the same day: edit or drop its entry instead of adding a second one.
//   - A game's first entry: add the game here and put <GameUpdates game="…" /> in its header(s), before <BugReport />.

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
  hit_stay: {
    name: { ko: 'Hit,Stay', en: 'Hit,Stay' },
    note: { ko: '의견은 언제든 버그 제보로 보내주세요. 고맙습니다!', en: 'Send us your thoughts any time with the bug report button. Thank you!' },
    items: [
      {
        date: '11/25', icon: Coins,
        ko: { title: '한 판이 더 빨리 끝나요 (기본 베팅 변경)', desc: '기본 베팅이 2라운드마다 1칩씩 오르다가, 16라운드부터는 2라운드마다 5칩씩 올라요. 한 판이 보통 24라운드 안팎이에요.' },
        en: { title: 'Shorter matches (new ante schedule)', desc: 'The ante goes up by 1 every 2 rounds, then by 5 every 2 rounds from round 16. A match now runs about 24 rounds.' },
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
};
