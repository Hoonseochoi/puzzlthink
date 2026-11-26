import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'story-timeline',
  category: 'story',
  games: [],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: 'PUZZLTHINK의 열흘 — 커밋 기록으로 본 사이트 연대기 | 개발 노트',
      description: '스도쿠 하나로 시작한 사이트가 11월 16일 벽바둑을 시작으로 열흘 만에 38개 게임이 되기까지. 날짜별로 어떤 게임이 언제 생겼는지, 하루 방문과 판수가 어떻게 늘었는지, 그사이 바뀐 장치들을 커밋 370여 개로 정리한 연대기예요.',
      keywords: ['PUZZLTHINK', '퍼즐띵크', '웹게임 개발기', '데블스플랜 게임 사이트', '1인 개발', '사이트 연대기', '개발 노트'],
    },
    title: 'PUZZLTHINK의 열흘',
    lead: '스도쿠 하나에서 38개 게임까지, 커밋 기록으로 다시 걸어 본 길.',
    intro: [
      'PUZZLTHINK의 저장소에는 2026년 11월 26일 오후까지 커밋이 379개 있어요. 그중 9개는 2월 22일, 나머지 370개는 11월 16일부터 열하루 동안의 것이에요. 이 글은 그 기록을 날짜순으로 따라가며, 어떤 게임이 언제 들어왔고 사이트가 어떻게 바뀌었는지 정리한 연대기예요.',
      '시각은 모두 한국 시간(KST)이고, 방문과 판수는 사이트의 일별 집계(2026-11-26 14시 기준, 11월 26일은 그 시각까지)예요.',
    ],
    summary: '2월의 스도쿠 MVP에서 11월 16일 벽바둑, 그리고 열흘 만의 38개 게임까지. 날짜별 출시 순서와 방문·판수, 바뀐 장치들.',
    sections: [
      {
        id: 'feb',
        title: '2월 22일: 스도쿠 하나',
        blocks: [
          { type: 'p', text: '첫 커밋은 2월 22일이에요. 커밋 메시지는 "PUZZL THINK MVP"였고, 한국어·영어 지원과 스도쿠 엔진이 들어 있었어요. 같은 날 헤더·푸터, Supabase 랭킹, 신뢰 페이지(소개·정책), SEO와 구조화 데이터, 구글 로그인까지 아홉 개 커밋이 이어졌어요. 그리고 기록은 거의 아홉 달 동안 멈춰요.' },
        ],
      },
      {
        id: 'nov16',
        title: '11월 16일: 벽바둑의 날 (커밋 41개)',
        blocks: [
          { type: 'p', text: '오후 4시 59분, "add playable Wallgo game". 데블스 플랜의 벽바둑이 사이트의 첫 보드게임이 됐어요. 그날 밤 자정까지 이 사이트의 뼈대가 거의 다 생겼어요.' },
          { type: 'table', head: ['시각', '일'], rows: [
            ['16:59', '벽바둑'],
            ['18:12', '벽바둑 1:1 모드와 그림 공략'],
            ['18:28', '링크로 하는 친구 대전'],
            ['19:00', '십이장기 (AI, 친구 대전)'],
            ['20:29', '무거운 13 (AI, 초대 방, AI가 채우는 빈자리)'],
            ['21:10', '구글 로그인'],
            ['21:40', '프로필, 게임 기록, 플레이 시간, 기록실, 명예의 전당'],
            ['22:03', '더 똑똑한 벽바둑 AI (영역 추정, 두 수를 읽는 어려움)'],
            ['22:08', '6인 러시안 룰렛'],
            ['23:02', '러시아장기 (24분 뒤 컵 옮기기 규칙)'],
            ['23:13', '게임 뒤 로그인 안내, 명예의 전당 축하'],
          ] },
          { type: 'p', text: '자정 직후에는 벽바둑의 디자인(검은 무대, 철판 프레임, 작은 대문자 라벨)을 모든 게임에 입혔어요. 첫날 방문은 416, 판수는 112였어요.' },
        ],
      },
      {
        id: 'nov17',
        title: '11월 17일: 가장 바쁜 날 (커밋 61개)',
        blocks: [
          { type: 'p', text: '커밋이 가장 많은 날이에요. 새벽에는 십이장기에 같은 국면 세 번 금지가 들어갔고(플레이어 제보), 아침에는 모든 게임의 시작 화면이 "공략 먼저" 구조로 바뀌었어요. 게임은 플레이어가 시작할 때만 열리고, 시작하면 주소에 #play가 붙어서 뒤로 가기는 시작 화면으로, 새로고침은 게임으로 돌아가요. 공략은 검색 엔진을 위해 서버 HTML에 그대로 남아요. 그 화면에 "AI와 하기 / 친구와 하기"와 4자리 초대 코드가 붙었어요.' },
          { type: 'list', items: [
            '11:03 블라인드 오목, 12:01 네온 레이저 장기, 13:34 네모 세기',
            '16:46 후원 링크, 17:06 친구 대전에서 나간 사람 자리를 AI가 대신 두기',
            '17:55 흑과 백, 18:38 흑과 백 II',
            '19:09~19:44 오픈 대전, 리벤지 배지, 오픈 대전 랭킹, 닉네임',
          ] },
          { type: 'p', text: '방문은 2,022, 판수는 8,273으로 하루 만에 뛰었어요.' },
        ],
      },
      {
        id: 'nov18-19',
        title: '11월 18~19일: 인증서와 슬리더링크',
        blocks: [
          { type: 'list', items: [
            '**11/18** 00:22 돼지 저금통, 11:38 벽바둑·레이저 장기·무거운 13·러시안 룰렛 복기, 14:30 **어려움 클리어 인증서**, 15:51 헥사곤, 17:04 결합과 인디언 포커. 저녁에는 결과 화면의 광고 자리를 걷어 냈어요.',
            '**11/19** 14:17 **슬리더링크** — 연습과 무작위 맵 챌린지, 몇 분 뒤 맵 수집 순위. 19:36 **벽바둑 II**(감옥매치 10화의 네모·동그라미 말).',
          ] },
        ],
      },
      {
        id: 'nov20-21',
        title: '11월 20~21일: 기록으로 고치기, 서버 옮기기',
        blocks: [
          { type: 'list', items: [
            '**11/20** 11:12 나인 멘스 모리스(데블스 플랜 1 결승전), 11:47 **피스 경쟁전**, 12:08 첫 AI 난이도 재조정(목표 사람 승률 80·50·25%), 15:43 **Vercel에서 Cloudflare Workers로**, 19:44 뒤집기 오목(개발자 창작 시험판).',
            '**11/21** 16:10 동시 접속 약 174명에서 무료 데이터베이스가 한계에 닿음. 19:19 직접 운영하는 Supabase로 옮기는 커밋. 23:57 모노레일.',
          ] },
          { type: 'p', text: '11월 21일은 지금까지 방문이 가장 많았던 날(3,400)이에요.' },
        ],
      },
      {
        id: 'nov22-23',
        title: '11월 22~23일: 논리 퍼즐의 날, 라운지',
        blocks: [
          { type: 'list', items: [
            '**11/22** 00:36 양면 포커, 05:16 마슈·노노그램, 12:24 스타배틀, 14:18 비나이로·한붓길·컬러 잇기, 14:28 여섯 논리 퍼즐의 플레이 영상, 18:09 4인 3목. 하루에 게임 여덟 개가 들어왔어요.',
            '**11/23** 11:31 마방진 스왑, 22:50 **라운지 채팅**과 후속 수정 여덟 개.',
          ] },
        ],
      },
      {
        id: 'nov24',
        title: '11월 24일: AI 헬모드',
        blocks: [
          { type: 'p', text: '01:03 2048. 오전 10시에는 서버 작업이 있었고, 낮 12시 49분부터 13시 9분 사이에 **매우 어려움(헬모드) AI** 다섯 개가 커밋 네 개로 들어왔어요. 벽바둑·벽바둑 II, 블라인드 오목, 십이장기·러시아장기, 그리고 헬모드 페이지와 블랙피스 경쟁전, 헬모드 인증서까지요. 첫 헬모드 판은 13시 9분(러시아장기)에 기록됐어요. 밤에는 23:12 포인트 오목, 23:56 Hit,Stay.' },
        ],
      },
      {
        id: 'nov25',
        title: '11월 25일: 데블스 플랜 3 결승과 아이콘',
        blocks: [
          { type: 'list', items: [
            '01:34 카드 장기(데블스 플랜 3 결승 1회차), 01:44 컬러 링크(결승 2회차)',
            '16:38 피스 경쟁전 2주 차, 21:53 **받는 프로필 아이콘**, 22:14 아이콘 컬렉션과 정적 404 자가 복구, 22:21 그라데이션, 23:10 컬러 링크 판 13개',
          ] },
          { type: 'p', text: '하루 판수가 처음으로 14,000을 넘었어요(14,823판, 지금까지 가장 많은 날).' },
        ],
      },
      {
        id: 'nov26',
        title: '11월 26일: 오늘 (오후 2시까지 커밋 57개)',
        blocks: [
          { type: 'p', text: '자정을 막 넘겨 컬러 링크 매우 어려움과 두 번째 AI 난이도 재조정, 모든 게임 시작 화면의 "업데이트" 칸이 들어갔어요. 00:29 수식 신호등·수식의 탑, 00:32 히든 워드로 게임은 38개가 됐어요. 새벽에는 업적 배지와 HIDDEN MISSION, 라운지의 24시간 삭제, 휴대폰 아래 탭 바. 아침에는 서포터 커버, 피스로 사는 힌트, 1위 왕관을 빼앗겼을 때의 안내. 오후에는 게임별 공략 페이지가 생겼어요.' },
          { type: 'p', text: '오늘 14시 10분의 동시 접속 193명은 5분 단위 기록을 남기기 시작한 뒤 가장 높은 숫자예요.' },
        ],
      },
      {
        id: 'numbers',
        title: '날짜별 숫자',
        lead: '방문(daily_visits)과 판수(game_plays_daily, 로그인 여부 무관) — 2026-11-26 14시(KST) 기준, 26일은 그 시각까지.',
        blocks: [
          { type: 'table', head: ['날짜', '커밋', '방문', '판수'], rows: [
            ['11/16', '41', '416', '112'],
            ['11/17', '61', '2,022', '8,273'],
            ['11/18', '31', '1,909', '5,946'],
            ['11/19', '17', '2,317', '6,460'],
            ['11/20', '37', '2,604', '7,828'],
            ['11/21', '19', '3,400', '8,079'],
            ['11/22', '28', '2,146', '10,872'],
            ['11/23', '25', '2,337', '11,412'],
            ['11/24', '24', '2,173', '9,572'],
            ['11/25', '30', '3,253', '14,823'],
            ['11/26', '57', '2,032', '11,883'],
          ] },
          { type: 'p', text: '열하루 동안 방문은 모두 24,608, 판수는 95,252판이에요. 가장 많이 플레이된 게임은 슬리더링크(15,189판), 러시아장기(9,636), 벽바둑(8,750), 무거운 13(7,749), 벽바둑 II(7,624), 십이장기(7,266) 순이에요.' },
        ],
      },
    ],
    sources: [
      '`git log` 전체(커밋 379개)의 날짜·시각과 커밋 메시지',
      '`src/components/GameGate.tsx` — 시작 화면 구조 주석', '`src/lib/gameCatalog.ts` — 게임 목록(38개)',
      'DB 집계(2026-11-26 14:22 KST): daily_visits 날짜별, game_plays_daily 날짜별·게임별 합계, game_results의 첫 매우 어려움 판 시각, online_snapshots 최댓값',
    ],
  },
  en: {
    meta: {
      title: 'PUZZLTHINK’s first ten days — the site’s timeline from its commit history | Dev notes',
      description: "From a single Sudoku to 38 games in ten days, starting with Wallgo on 16 November: when each game arrived, how daily visits and plays grew, and what changed along the way — a timeline built from some 370 commits.",
      keywords: ['PUZZLTHINK', 'web game development', "Devil's Plan games site", 'solo developer', 'site timeline', 'dev notes'],
    },
    title: 'PUZZLTHINK’s first ten days',
    lead: 'From one Sudoku to 38 games, walked again through the commit log.',
    intro: [
      'By the afternoon of 26 November 2026 the PUZZLTHINK repository held 379 commits: 9 from 22 February and 370 from the eleven days starting 16 November. This timeline follows them in order — which game arrived when, and how the site changed.',
      'All times are Korea time (KST). Visits and plays are the site’s daily aggregates as of 2026-11-26 14:00 KST (26 November up to that time).',
    ],
    summary: 'From a February Sudoku MVP to Wallgo on 16 November and 38 games ten days later: launches by date, visits and plays, and what changed.',
    sections: [
      {
        id: 'feb',
        title: '22 February: a single Sudoku',
        blocks: [
          { type: 'p', text: 'The first commit is from 22 February: "PUZZL THINK MVP", with Korean and English and a Sudoku engine. Nine commits that day added a header and footer, Supabase rankings, trust pages (about, policies), SEO and structured data, and Google sign-in. Then the history goes quiet for almost nine months.' },
        ],
      },
      {
        id: 'nov16',
        title: '16 November: Wallgo day (41 commits)',
        blocks: [
          { type: 'p', text: 'At 4:59 pm: "add playable Wallgo game". The Devil’s Plan’s Wallgo became the site’s first board game, and by midnight almost the whole skeleton of the site was there.' },
          { type: 'table', head: ['Time', 'What'], rows: [
            ['16:59', 'Wallgo'],
            ['18:12', 'Wallgo 1:1 mode and illustrated guide'],
            ['18:28', 'Friend rooms over a link'],
            ['19:00', '12 Janggi (AI, friend rooms)'],
            ['20:29', 'Heavy 13 (AI, invite rooms, AI-filled seats)'],
            ['21:10', 'Google sign-in'],
            ['21:40', 'Profiles, game records, play time, records page, Hall of Fame'],
            ['22:03', 'A smarter Wallgo AI (territory estimate, two-ply Hard)'],
            ['22:08', 'Six-player Russian Roulette'],
            ['23:02', 'Russian Janggi (moving cups 24 minutes later)'],
            ['23:13', 'Post-game sign-in prompt, Hall of Fame celebration'],
          ] },
          { type: 'p', text: 'Just after midnight Wallgo’s look (a dark stage, steel frames, tiny uppercase labels) was applied to every game. Day one had 416 visits and 112 plays.' },
        ],
      },
      {
        id: 'nov17',
        title: '17 November: the busiest day (61 commits)',
        blocks: [
          { type: 'p', text: 'The day with the most commits. Before dawn 12 Janggi got the no-third-repetition rule (from a player’s report); in the morning every game’s entry screen became "guide first": the game opens only when you start it, starting adds #play to the address so Back returns to the entry screen and reload keeps you in the game, and the guide stays in the server HTML for search engines. That screen got "play the AI / play friends" and four-digit invite codes.' },
          { type: 'list', items: [
            '11:03 Blind Gomoku, 12:01 neon Laser Janggi, 13:34 Nemo Count',
            '16:46 support link, 17:06 the AI plays the seats of players who drop out of friend games',
            '17:55 Black & White, 18:38 Black & White II',
            '19:09–19:44 open matches, revenge badges, open-match rankings, nicknames',
          ] },
          { type: 'p', text: 'Visits jumped to 2,022 and plays to 8,273 in a day.' },
        ],
      },
      {
        id: 'nov18-19',
        title: '18–19 November: certificates and Slitherlink',
        blocks: [
          { type: 'list', items: [
            '**11/18** 00:22 Piggy Bank, 11:38 replays for Wallgo, Laser Janggi, Heavy 13 and Russian Roulette, 14:30 **Hard-clear certificates**, 15:51 Hexagon, 17:04 Gyulhap and Indian Poker. In the evening the ad slots on result screens were removed.',
            '**11/19** 14:17 **Slitherlink** — practice and random map challenges, with a boards-owned ranking minutes later. 19:36 **Wallgo II** (square and round pieces from prison match episode 10).',
          ] },
        ],
      },
      {
        id: 'nov20-21',
        title: '20–21 November: fixing from records, moving servers',
        blocks: [
          { type: 'list', items: [
            '**11/20** 11:12 Nine Men’s Morris (The Devil’s Plan 1 final), 11:47 the **piece race**, 12:08 the first AI retune (target human win rates 80/50/25%), 15:43 **Vercel to Cloudflare Workers**, 19:44 Flip Omok (a developer-original trial).',
            '**11/21** 16:10 the free database saturates at about 174 concurrent users; 19:19 the commit moving to a self-run Supabase; 23:57 Monorail.',
          ] },
          { type: 'p', text: '21 November is still the day with the most visits (3,400).' },
        ],
      },
      {
        id: 'nov22-23',
        title: '22–23 November: logic-puzzle day, the lounge',
        blocks: [
          { type: 'list', items: [
            '**11/22** 00:36 Two-Sided Poker, 05:16 Masyu and Nonogram, 12:24 Star Battle, 14:18 Binairo, One Stroke and Color Link, 14:28 solve replays for the six logic puzzles, 18:09 4 Player 3 in a Row — eight games in one day.',
            '**11/23** 11:31 Magic Square Swap, 22:50 **lounge chat** and eight follow-ups.',
          ] },
        ],
      },
      {
        id: 'nov24',
        title: '24 November: AI hell mode',
        blocks: [
          { type: 'p', text: '01:03 2048. Server work at 10 am, then between 12:49 and 13:09 four commits brought five **Very Hard (hell mode) AIs** — Wallgo and Wallgo II, Blind Gomoku, 12 Janggi and Russian Janggi — with the hell-mode page, the black piece contest and hell certificates. The first hell-mode game was recorded at 13:09 (Russian Janggi). At night: 23:12 Point Omok, 23:56 Hit,Stay.' },
        ],
      },
      {
        id: 'nov25',
        title: '25 November: the Devil’s Plan 3 final, and icons',
        blocks: [
          { type: 'list', items: [
            '01:34 Card Janggi (Devil’s Plan 3 final, match 1), 01:44 Color Link (final, match 2)',
            '16:38 piece race week 2, 21:53 **earned profile icons**, 22:14 the icon collection and the static-404 self-heal, 22:21 Gradation, 23:10 thirteen Color Link boards',
          ] },
          { type: 'p', text: 'Daily plays passed 14,000 for the first time (14,823, the busiest day so far).' },
        ],
      },
      {
        id: 'nov26',
        title: '26 November: today (57 commits by 2 pm)',
        blocks: [
          { type: 'p', text: 'Just after midnight: Color Link’s Very Hard level, the second AI retune, and an "Updates" section on every game’s entry screen. 00:29 Equation Signal and Equation Tower, 00:32 Hidden Word — 38 games. Before dawn: achievement badges and HIDDEN MISSION, 24-hour lounge expiry, a bottom tab bar on phones. In the morning: the supporter cover, hints bought with pieces, a notice when your #1 crown is taken. In the afternoon: dedicated guide pages per game.' },
          { type: 'p', text: 'Today at 14:10, 193 users online — the highest since five-minute snapshots began.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Day by day',
        lead: 'Visits (daily_visits) and plays (game_plays_daily, signed in or not) as of 2026-11-26 14:00 KST; the 26th is up to that time.',
        blocks: [
          { type: 'table', head: ['Date', 'Commits', 'Visits', 'Plays'], rows: [
            ['11/16', '41', '416', '112'],
            ['11/17', '61', '2,022', '8,273'],
            ['11/18', '31', '1,909', '5,946'],
            ['11/19', '17', '2,317', '6,460'],
            ['11/20', '37', '2,604', '7,828'],
            ['11/21', '19', '3,400', '8,079'],
            ['11/22', '28', '2,146', '10,872'],
            ['11/23', '25', '2,337', '11,412'],
            ['11/24', '24', '2,173', '9,572'],
            ['11/25', '30', '3,253', '14,823'],
            ['11/26', '57', '2,032', '11,883'],
          ] },
          { type: 'p', text: 'Over the eleven days: 24,608 visits and 95,252 plays. The most played games: Slitherlink (15,189), Russian Janggi (9,636), Wallgo (8,750), Heavy 13 (7,749), Wallgo II (7,624) and 12 Janggi (7,266).' },
        ],
      },
    ],
    sources: [
      'The whole `git log` (379 commits): dates, times and messages',
      '`src/components/GameGate.tsx` — entry-screen comment', '`src/lib/gameCatalog.ts` — the game list (38 games)',
      'DB aggregates (2026-11-26 14:22 KST): daily_visits by day, game_plays_daily by day and by game, time of the first Very Hard game in game_results, the online_snapshots maximum',
    ],
  },
};

export default article;
