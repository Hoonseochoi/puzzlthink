import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'sys-hall-of-fame',
  category: 'systems',
  games: [],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '명예의 전당·클리어 인증서·경쟁전 개발기 — "이겼다"를 남기는 방법 | 개발 노트',
      description: 'PUZZLTHINK의 기록실, 명예의 전당, 번호가 매겨지는 어려움 클리어 인증서, 피스 경쟁전과 블랙피스 경쟁전이 어떻게 생기고 바뀌었는지. 5승에서 1승으로 내린 문턱, 쉬움을 뺀 이유, 러시아장기에만 상한을 둔 이유까지 커밋 기록으로 정리했어요.',
      keywords: ['명예의 전당', '클리어 인증서', '피스 경쟁전', '블랙피스 경쟁전', 'PUZZLTHINK 기록실', '게임 랭킹', '개발 노트'],
    },
    title: '명예의 전당·클리어 인증서·경쟁전 개발기',
    lead: '이긴 판을 어떻게 남기고, 어떻게 겨루게 할까.',
    intro: [
      '게임을 이기면 그 기록이 어딘가에 남아야 다시 오고 싶어져요. PUZZLTHINK에서는 그 역할을 기록실, 명예의 전당, 클리어 인증서, 그리고 주간 경쟁전이 나눠 맡아요.',
      '이 글은 그 장치들이 첫날 밤부터 열흘 동안 어떻게 생기고, 숫자 하나하나가 어떻게 바뀌었는지를 커밋 기록으로 정리한 개발 노트예요.',
    ],
    summary: '기록실과 명예의 전당, 번호가 매겨지는 클리어 인증서, 피스·블랙피스 경쟁전. 문턱을 5승에서 1승으로 내리고, 러시아장기에만 상한을 둔 이유.',
    sections: [
      {
        id: 'records',
        title: '첫날 밤: 기록실과 명예의 전당',
        blocks: [
          { type: 'p', text: '11월 16일 밤 9시 40분, 벽바둑·십이장기·무거운 13이 생긴 그날에 플레이어 프로필과 게임 기록이 들어갔어요. 구글로 로그인하면 프로필이 생기고, 게임이 끝날 때마다 결과가 저장되고, 기록실에서 게임별로 AI전·친구전 전적과 총 플레이 시간을 볼 수 있었어요. 게임별 상위 3명을 보여 주는 명예의 전당도 같이 생겼어요. 닉네임과 명예의 전당 노출 여부는 본인이 정할 수 있어요.' },
          { type: 'p', text: '한 시간 반 뒤에는 결과 화면에 "이 기록을 남길까요?" 로그인 카드를 붙였어요. 로그아웃 상태로 끝낸 판도 그 자리에서 로그인하면 저장돼요. 같은 커밋에서 명예의 전당의 문턱을 **최소 5승**으로 정했고, 이긴 판으로 상위 3위 안에 들면 폭죽과 축하 팝업이 떠요.' },
        ],
      },
      {
        id: 'thresholds',
        title: '문턱 조정: 쉬움은 빼고, 5승은 1승으로',
        blocks: [
          { type: 'list', items: [
            '**11월 18일 14:09** — 명예의 전당은 보통·어려움 AI전만 세요. 쉬움 AI 결과는 내 기록에는 남지만 명예의 전당에는 들어가지 않아요.',
            '**같은 날 15:54** — 명예의 전당 문턱을 5승에서 **1승**으로 내렸어요. 이제 한 판만 이겨도 이름을 올릴 수 있어요.',
            '**같은 날 16:00** — 오픈 대전 랭킹도 3승에서 1승으로 내렸어요.',
            '**11월 20일** — 홈 화면의 게임 카드마다 오른쪽 위에 작은 명예의 전당 시상대(2-1-3)를 붙였어요.',
          ] },
        ],
      },
      {
        id: 'cert',
        title: '번호가 매겨지는 클리어 인증서',
        blocks: [
          { type: 'p', text: '11월 18일 오후에는 어려움 클리어 인증서가 생겼어요. 어떤 게임의 어려움 AI를 처음 이기면, **그 게임에서 몇 번째로 어려움을 이긴 사람인지** 번호가 붙은 인증서를 받아요. "러시아장기 AI 어려움 3번째 클리어" 같은 식이에요. 이미 이긴 기록이 있던 사람들은 과거 결과로 순서를 매겨 번호를 줬어요.' },
          { type: 'p', text: '인증서는 공유를 생각하고 만들었어요. 폭죽 팝업에서 이미지 저장, 링크 복사, 공유를 할 수 있고, 공유한 링크는 사이트 안의 인증서 페이지로 열려서 인증서 이미지가 미리보기로 떠요. 그 페이지에는 닉네임만 보이고, "나도 도전하기" 버튼이 있어요. 로그아웃 상태로 이겼다면 로그인 안내가 그 판을 저장하고 번호를 발급해요.' },
          { type: 'p', text: '11월 24일에는 같은 방식의 **헬모드 인증서**가 생겼어요. 매우 어려움을 이기면 받고, 어려움 인증서와는 따로 번호가 매겨져요.' },
        ],
      },
      {
        id: 'piece',
        title: '피스 경쟁전',
        blocks: [
          { type: 'p', text: '11월 20일 오전, 기록실에 **피스 경쟁전**이 열렸어요. 어떤 게임이든 어려움 AI를 이긴 판 하나가 피스 하나예요(데블스 플랜의 피스를 본뜬 금색 지그재그 아이콘이에요). 한 게임에서 최대 30개까지 세고, 동점이면 그 개수에 먼저 도달한 사람이 앞서요. 상위 3명은 시상대에 서고, 홈 화면에는 실시간 상위 3명을 보여 주는 OPEN 배너가 붙었어요. 같은 날 오후에는 순위 옆에 한국 시간 자정 이후의 순위 변화(▲▼, NEW)를 붙였어요.' },
          { type: 'p', text: '같은 날 낮, 러시안 룰렛과 인디언 포커의 승리는 피스에서 빠졌어요. 운이 크게 작용하는 게임이라서요.' },
          { type: 'h3', text: '주간제로' },
          { type: 'p', text: '11월 25일, 경쟁전이 주 단위로 바뀌었어요. 1주 차(11월 24일까지의 모든 어려움 승리, 게임당 최대 30개)는 그대로 얼려서 "1W 명예의 전당"으로 남기고, 1주 차 상위 3명은 플래티넘 금·은·동 왕관을 영구히 달게 됐어요. 2주 차는 11월 25일 0시부터, **게임당 최대 5개**로 세요. 상한이 5개라서, 피스를 많이 모으려면 여러 게임에서 이겨야 해요.' },
          { type: 'p', text: '11월 26일에는 피스를 "쓸" 수 있게 됐어요. 히든 워드의 두 번째 답과 슬리더링크 도전의 힌트가 피스 하나씩이에요. 쓴 피스는 경쟁전 점수에서 빠져요.' },
        ],
      },
      {
        id: 'black',
        title: '블랙피스 경쟁전과 러시아장기 상한',
        blocks: [
          { type: 'p', text: '11월 24일 매우 어려움 AI와 함께 **블랙피스 경쟁전**이 열렸어요. 매우 어려움을 이긴 판이 블랙피스 하나예요(벽바둑과 벽바둑 II는 1:1만 세요). 다음 날 주간제가 되어 1주 차는 출시부터 12월 1일까지, 그 뒤로는 7일씩이고, 주마다 상위 3명이 헬모드 아이콘을 받아요.' },
          { type: 'p', text: '11월 26일 아침, 러시아장기에만 상한이 생겼어요. 이 노트의 러시아장기 AI 글에 적었듯, 러시아장기 매우 어려움에는 **선공이 가운데에 큰 컵을 놓으면 이론상 이기는 수순**이 있어요. 마이그레이션 주석의 표현으로 "언제나 이기는 수순"이 있으니, 그 게임의 승리만으로 블랙피스를 무한히 쌓을 수 있었어요. 그래서 러시아장기 승리는 **한 주에 30개까지만** 세요. 이미 30개를 넘긴 기록은 그대로 두고, 그 주에는 더 늘지 않아요.' },
        ],
      },
      {
        id: 'numbers',
        title: '숫자로 보면',
        lead: '2026-11-26 14시(KST) 기준.',
        blocks: [
          { type: 'table', head: ['', '인증서 수', '받은 사람'], rows: [
            ['어려움 클리어 인증서', '866장', '400명'],
            ['헬모드 인증서', '65장', '48명'],
          ] },
          { type: 'table', caption: '게임별 어려움 클리어 인증서 (많은 순, 상위 8개)', head: ['게임', '인증서'], rows: [
            ['인디언 포커', '94'], ['흑과 백', '85'], ['벽바둑 II', '84'], ['벽바둑', '77'],
            ['모노레일', '57'], ['러시아장기', '57'], ['무거운 13', '55'], ['포인트 오목', '46'],
          ] },
          { type: 'table', caption: '게임별 헬모드 인증서', head: ['게임', '인증서'], rows: [
            ['러시아장기', '22'], ['벽바둑 II', '15'], ['벽바둑', '9'], ['컬러 링크', '9'], ['십이장기', '4'], ['블라인드 오목', '4'],
          ] },
          { type: 'p', text: '첫 어려움 클리어 기록은 11월 17일 새벽 2시에 남았어요. 인증서 기능이 생기기 전이었지만, 나중에 과거 결과로 번호를 매길 때 이 판이 1번이 됐어요.' },
        ],
      },
    ],
    sources: [
      '`src/lib/hardClear.ts`, `src/lib/hell.ts`(isHellClear, 블랙피스 주차), `src/components/CompetitionBoard.tsx`, `src/components/HallPodium.tsx`',
      '`supabase/migrations/20271126080000_russian_janggi_hell_cap.sql` — 러시아장기 상한 주석',
      '커밋 66dbbd6 (11/16 프로필·기록실·명예의 전당), 99748c3 (11/16 로그인 카드·5승 문턱), 0085da5·36f65cb·aca18bf (11/18 쉬움 제외, 1승 문턱), 36b4e90 (11/18 어려움 클리어 인증서), 86a3c88·064e358 (11/20 피스 경쟁전), 1fe2d84 (11/20 운 게임 제외), 083f3c9 (11/20 홈 시상대), d2025e2 (11/24 헬모드·블랙피스·헬 인증서), 5f30f75 (11/25 2주 차), f048e27 (11/26 러시아장기 상한), bbd6c50 (11/26 피스 쓰기)',
      'DB 집계(2026-11-26 14:22 KST): hard_clears·hell_clears의 수와 인원, 게임별 수, 첫 hard_clears 시각',
    ],
  },
  en: {
    meta: {
      title: 'Hall of Fame, clear certificates and contests dev notes — how a win is kept | Dev notes',
      description: 'How the PUZZLTHINK records page, Hall of Fame, numbered Hard-clear certificates and the weekly piece and black piece contests were built and changed — the threshold cut from 5 wins to 1, why Easy was dropped, and why only Russian Janggi has a cap.',
      keywords: ['hall of fame', 'clear certificate', 'piece race', 'black piece contest', 'game rankings', 'dev notes'],
    },
    title: 'Hall of Fame, clear certificates and contests dev notes',
    lead: 'How to keep a win, and how to make people compete for it.',
    intro: [
      'A win has to be kept somewhere for people to come back. On PUZZLTHINK that job is shared by the records page, the Hall of Fame, clear certificates and weekly contests.',
      'This note follows the commits as those pieces appeared from the first night and as each of their numbers changed over ten days.',
    ],
    summary: 'Records and the Hall of Fame, numbered clear certificates, the piece and black piece contests — why the bar dropped from 5 wins to 1 and why only Russian Janggi is capped.',
    sections: [
      {
        id: 'records',
        title: 'Night one: records and the Hall of Fame',
        blocks: [
          { type: 'p', text: 'At 9:40 pm on 16 November — the day Wallgo, 12 Janggi and Heavy 13 appeared — player profiles and game records went in. Signing in with Google creates a profile, every finished game saves a result, and the records page shows your record per game against the AI and friends plus total play time. A Hall of Fame showing each game’s top three came with it; your nickname and whether you appear there are your choice.' },
          { type: 'p', text: 'An hour and a half later result screens got a "keep this on record?" sign-in card: a game finished while signed out is saved once you sign in right there. The same commit set the Hall of Fame bar at **at least 5 wins**, with fireworks and a popup when a win lifts you into the top three.' },
        ],
      },
      {
        id: 'thresholds',
        title: 'Moving the bar: no Easy, 1 win instead of 5',
        blocks: [
          { type: 'list', items: [
            '**18 November, 14:09** — the Hall of Fame counts only Normal and Hard AI games. Easy results stay in your own records but not in the Hall.',
            '**15:54 the same day** — the bar dropped from 5 wins to **1**: a single win now puts you on the board.',
            '**16:00 the same day** — the open-match ranking went from 3 wins to 1 as well.',
            '**20 November** — each game card on the home page got a tiny Hall of Fame podium (2-1-3) in its top-right corner.',
          ] },
        ],
      },
      {
        id: 'cert',
        title: 'Numbered clear certificates',
        blocks: [
          { type: 'p', text: 'On the afternoon of 18 November came the Hard-clear certificate. The first time you beat a game’s Hard AI you get a certificate numbered by **how many people beat that game’s Hard AI before you** — "Russian Janggi AI Hard, 3rd clear". Players who had already won were numbered from their past results.' },
          { type: 'p', text: 'It was built to be shared. The fireworks popup offers save image, copy link and share; a shared link opens a certificate page on the site with the certificate as its preview image, showing only the nickname and a "try it yourself" button. If you won while signed out, the sign-in prompt saves the game and issues the number.' },
          { type: 'p', text: 'On 24 November a **hell certificate** followed the same pattern: earned by beating Very Hard, numbered separately from the Hard certificates.' },
        ],
      },
      {
        id: 'piece',
        title: 'The piece race',
        blocks: [
          { type: 'p', text: 'On the morning of 20 November the records page opened the **piece race**: every win over a Hard AI in any game is one piece (a gold zigzag icon after the pieces in The Devil’s Plan), up to 30 per game, ties going to whoever reached the count first. The top three stand on a podium and the home page got an OPEN banner with the live top three. That afternoon each row gained its rank change since midnight KST (▲▼, NEW).' },
          { type: 'p', text: 'The same day, Russian Roulette and Indian Poker wins stopped counting — too much luck.' },
          { type: 'h3', text: 'Weekly' },
          { type: 'p', text: 'On 25 November the race went weekly. Week 1 (every Hard win through 24 November, up to 30 per game) was frozen as the "1W Hall of Fame", and its top three wear platinum gold, silver and bronze crowns for good. Week 2 counts from midnight on 25 November with **at most 5 pieces per game** — so collecting many pieces means winning in many games.' },
          { type: 'p', text: 'On 26 November pieces became spendable: Hidden Word’s second answer and a Slitherlink challenge hint cost one each, and spent pieces come off your race total.' },
        ],
      },
      {
        id: 'black',
        title: 'The black piece contest and the Russian Janggi cap',
        blocks: [
          { type: 'p', text: 'The **black piece contest** opened with the Very Hard AIs on 24 November: each Very Hard win is a black piece (1:1 only for Wallgo and Wallgo II). The next day it went weekly too — week 1 from launch to 1 December, then 7 days each — and each week’s top three get hell-mode icons.' },
          { type: 'p', text: 'On the morning of 26 November Russian Janggi alone got a cap. As the Russian Janggi AI note explains, its Very Hard AI loses to a **first-player opening with a large cup in the centre**. In the words of the migration comment there is "a line that always wins", so wins in that one game could pile up black pieces without limit. Russian Janggi wins now count **up to 30 a week**; totals already past 30 stay, and earn no more that week.' },
        ],
      },
      {
        id: 'numbers',
        title: 'In numbers',
        lead: 'As of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'table', head: ['', 'Certificates', 'Players'], rows: [
            ['Hard-clear certificates', '866', '400'],
            ['Hell certificates', '65', '48'],
          ] },
          { type: 'table', caption: 'Hard-clear certificates by game (top 8)', head: ['Game', 'Certificates'], rows: [
            ['Indian Poker', '94'], ['Black & White', '85'], ['Wallgo II', '84'], ['Wallgo', '77'],
            ['Monorail', '57'], ['Russian Janggi', '57'], ['Heavy 13', '55'], ['Point Omok', '46'],
          ] },
          { type: 'table', caption: 'Hell certificates by game', head: ['Game', 'Certificates'], rows: [
            ['Russian Janggi', '22'], ['Wallgo II', '15'], ['Wallgo', '9'], ['Color Link', '9'], ['12 Janggi', '4'], ['Blind Gomoku', '4'],
          ] },
          { type: 'p', text: 'The first Hard clear on record dates from 2 am on 17 November — before certificates existed, but when past results were numbered it became number one.' },
        ],
      },
    ],
    sources: [
      '`src/lib/hardClear.ts`, `src/lib/hell.ts` (isHellClear, black piece weeks), `src/components/CompetitionBoard.tsx`, `src/components/HallPodium.tsx`',
      '`supabase/migrations/20271126080000_russian_janggi_hell_cap.sql` — the cap comment',
      'Commits 66dbbd6 (11/16 profiles, records, Hall of Fame), 99748c3 (11/16 sign-in card, 5-win bar), 0085da5, 36f65cb and aca18bf (11/18 Easy dropped, 1-win bar), 36b4e90 (11/18 Hard-clear certificate), 86a3c88 and 064e358 (11/20 piece race), 1fe2d84 (11/20 luck games dropped), 083f3c9 (11/20 home podiums), d2025e2 (11/24 hell mode, black pieces, hell certificate), 5f30f75 (11/25 week 2), f048e27 (11/26 Russian Janggi cap), bbd6c50 (11/26 spending pieces)',
      'DB aggregates (2026-11-26 14:22 KST): hard_clears and hell_clears counts and players, counts by game, time of the first hard_clears row',
    ],
  },
};

export default article;
