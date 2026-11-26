import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'sys-infra',
  category: 'systems',
  games: [],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '사이트를 옮긴 기록 — Vercel에서 Cloudflare로, 클라우드 DB에서 직접 운영하는 DB로 | 개발 노트',
      description: '1인 운영 웹게임 사이트 PUZZLTHINK의 인프라 이야기. CDN 요청을 줄이다 Vercel에서 Cloudflare Workers(vinext)로 옮긴 날, 동시 접속 174명에 무료 DB가 멈춘 날, 직접 운영하는 Supabase로 옮기며 모두가 한 번 다시 로그인해야 했던 이유, 배포 순간 깨진 페이지가 남던 404 캐시 문제까지.',
      keywords: ['Cloudflare Workers', 'vinext', 'Next.js Cloudflare 배포', 'Supabase 셀프호스팅', '1인 개발 인프라', '웹게임 서버', '개발 노트'],
    },
    title: '사이트를 옮긴 기록',
    lead: '열흘 동안 호스팅을 한 번, 데이터베이스를 한 번 옮겼어요.',
    intro: [
      'PUZZLTHINK는 혼자 만들고 혼자 운영하는 사이트예요. 처음에는 가장 손이 덜 가는 조합으로 시작했어요. Next.js를 Vercel에 올리고, 데이터베이스·로그인·실시간 통신은 Supabase 클라우드 무료 요금제를 썼어요.',
      '이 글은 사람이 늘면서 그 조합을 어떻게 바꿨는지, 커밋 기록과 커밋 메시지에 남은 숫자로 정리한 기록이에요.',
    ],
    summary: 'CDN 요청을 줄이다 Cloudflare Workers로 옮긴 날, 무료 DB가 멈춘 날, 직접 운영하는 DB로 옮긴 날, 배포 순간의 404가 캐시에 남던 문제.',
    sections: [
      {
        id: 'vercel',
        title: '11월 19일: CDN 요청 줄이기',
        blocks: [
          { type: 'p', text: '첫 경고는 CDN 요청 수였어요. 11월 19일 저녁의 커밋은 Vercel CDN 요청을 줄이는 세 가지를 했어요. 화면에 보이는 링크마다 다음 페이지를 미리 받아 두던 프리페치를 끄고, 아이콘과 매니페스트에 긴 브라우저 캐시를 주고(그전에는 max-age=0이었어요), Vercel의 분석 도구 두 개를 뺐어요(방문 통계는 Google Analytics가 이미 하고 있었어요).' },
        ],
      },
      {
        id: 'cloudflare',
        title: '11월 20일: Cloudflare Workers로',
        blocks: [
          { type: 'p', text: '다음 날 오후, 사이트를 Cloudflare Workers로 옮겼어요. 도구는 **vinext**예요. Next.js 앱 라우터 코드를 그대로 두고, Vite로 빌드해서 Workers에서 돌리는 방식이에요. 정적 자원은 미리 렌더링해서 Workers의 정적 자원으로 내보내고, 그 외의 요청만 Worker가 처리해요. 도메인은 www.puzzlthink.com으로 모으고(맨 도메인은 www로), workers.dev 주소는 직접 확인용으로 남겼어요.' },
          { type: 'p', text: '옮기면서 생긴 문제도 커밋에 남아 있어요. Next.js용 Google Analytics 컴포넌트가 vinext에서는 undefined를 그려서 **모든 페이지가 실패**했어요. 그래서 GA 태그를 직접 넣는 방식으로 바꿨어요. 두 시간 뒤에는 main 브랜치에 올라갈 때마다 자동으로 Cloudflare에 배포되게 했고, 공개해도 되는 클라이언트 설정값을 저장소의 `.env.production`에 넣어서 CI 빌드와 로컬 빌드가 같게 했어요.' },
        ],
      },
      {
        id: 'peak',
        title: '11월 21일 오후 4시 10분',
        blocks: [
          { type: 'p', text: '그다음 고비는 데이터베이스였어요. 11월 21일 16시 10분, 무료 Supabase 클라우드 프로젝트가 한계에 닿았어요. 커밋 메시지에 남은 그때의 동시 접속은 **약 174명**이에요. API 호출 대부분이 504로 실패했고, 그 자리에서 요청을 줄였어요. 홈 랭킹과 명예의 전당은 60초 캐시, 접속 확인은 120초 간격, 홈의 열린 방 목록은 60초 간격으로요.' },
          { type: 'p', text: '같은 날 저녁 7시 19분에는 근본적인 해결이 커밋됐어요. 데이터베이스, 로그인, 실시간 통신, 슬리더링크 완료 확인 함수를 **직접 운영하는 서버**의 Supabase로 옮기고, 데이터를 복사해서 api.puzzlthink.com으로 연결했어요. 이 커밋에는 "계획한 전환 시점에, 마지막 데이터 복사 직후에만 합칠 것"이라고 적혀 있어요.' },
          { type: 'h3', text: '모두가 한 번 다시 로그인한 이유' },
          { type: 'p', text: '새 서버는 로그인 토큰을 서명하는 비밀값이 달라서, 클라우드에서 받은 로그인 세션을 확인할 수 없었어요. 그대로 두면 모든 요청이 거절될 토큰을 계속 보내게 돼요. 그래서 브라우저에 저장하는 로그인 키 이름을 바꾸고 옛 키를 지웠어요. **모두가 한 번만 다시 로그인하면** 되고, 계정과 기록은 그대로 남아요.' },
          { type: 'p', text: '11월 24일 오전 10시~10시 30분에는 서버 작업이 한 번 더 있었어요. 작업 직전인 9시 56분부터 헤더 아래에 검은 띠로 점검 안내가 흘렀고(10시 40분이 지나면 저절로 사라지게 만들었어요), 작업이 끝난 10시 19분에 띠를 내렸어요.' },
        ],
      },
      {
        id: 'snapshots',
        title: '5분마다 남기는 숫자',
        blocks: [
          { type: 'p', text: '11월 20일 저녁부터는 5분마다 접속자 수, 오늘 방문 수, 오늘 판수를 데이터베이스에 스냅숏으로 남겨요(180일 보관). 2026-11-26 14시(KST)까지 기록된 가장 높은 동시 접속은 **11월 26일 14시 10분의 193명**이에요. 플레이 수는 11월 25일 하루 14,823판이 가장 많았어요.' },
        ],
      },
      {
        id: 'static404',
        title: '배포 순간의 404가 캐시에 남던 문제',
        blocks: [
          { type: 'p', text: '11월 25일 밤에 고친 문제예요. Next.js가 만드는 `/_next/static/` 파일은 이름에 내용의 해시가 들어가서, 한 번 받으면 1년 동안 다시 받지 않아도 되도록(immutable) 캐시해요. 그런데 **없는 파일에 대한 404 응답까지 같은 1년짜리 캐시**로 나가고 있었어요.' },
          { type: 'p', text: '배포가 바뀌는 순간에 페이지를 연 사람은, 옛 페이지가 새 파일을 찾거나 새 페이지가 아직 안 올라간 파일을 찾으면서 404를 받을 수 있어요. 그 404가 브라우저에 1년 동안 남으니, 그 사람에게는 새로고침을 해도 "페이지를 불러올 수 없음"이 계속 떴어요.' },
          { type: 'p', text: '그래서 모든 페이지의 head에 작은 스크립트를 넣었어요. 정적 파일 로딩이 실패하면 그 주소를 모아서 캐시를 건너뛰고(`cache: \'reload\'`) 다시 받아 보고, 이번엔 받아지면 페이지를 한 번 새로고침해요. 같은 파일로 두 번 새로고침하지 않도록 세션마다 한 번만 시도해요.' },
        ],
      },
      {
        id: 'today',
        title: '지금의 모습',
        blocks: [
          { type: 'list', items: [
            '**웹**: Next.js(앱 라우터, next-intl로 한국어·영어)를 vinext로 빌드해 Cloudflare Workers에서 서비스해요. main에 올라가면 자동 배포돼요.',
            '**데이터**: 직접 운영하는 Supabase(Postgres, 로그인, 실시간 통신). 게임 기록, 랭킹, 아이콘, 경쟁전 같은 규칙은 데이터베이스 함수와 예약 작업으로 돌아가요.',
            '**게임 로직**: 거의 전부 브라우저에서 돌아요. AI도, 친구 대전의 진행도(방장 브라우저) 마찬가지라 서버는 기록과 목록만 맡아요. 무거운 매우 어려움 AI 탐색은 브라우저의 웹 워커에서 돌아요.',
          ] },
        ],
      },
    ],
    sources: [
      '`cloudflare.config.ts`, `vite.config.ts`, `src/app/[locale]/layout.tsx`(STATIC_HEAL)',
      '커밋 1eb6cfe (11/19 CDN 요청 줄이기), d46c657 (11/20 Cloudflare Workers·vinext, GA 수정), f7e53aa (11/20 자동 배포), a3651c4 (11/20 5분 스냅숏), d2dd35e (11/21 16:10 대응), c1d1732 (11/21 직접 운영하는 Supabase로, 다시 로그인), ecdb72d·4046042 (11/24 점검 띠), d9bdc7d (11/25 정적 404 자가 복구)',
      'DB 집계(2026-11-26 14:22 KST): online_snapshots의 최대 동시 접속과 그 시각, game_plays_daily 날짜별 합계',
      '서버의 위치와 구성, 비밀값, 접근 방법은 일부러 적지 않았어요.',
    ],
  },
  en: {
    meta: {
      title: 'Moving the site — from Vercel to Cloudflare, from a cloud DB to a self-run one | Dev notes',
      description: 'The infrastructure story of PUZZLTHINK, a one-person web game site: cutting CDN requests and moving from Vercel to Cloudflare Workers (vinext), the day 174 concurrent users stalled the free database, moving to a self-run Supabase (and why everyone had to sign in once more), and the cached 404 that kept pages broken after a deploy.',
      keywords: ['Cloudflare Workers', 'vinext', 'Next.js on Cloudflare', 'self-hosted Supabase', 'solo developer infrastructure', 'dev notes'],
    },
    title: 'Moving the site',
    lead: 'In ten days the hosting moved once and the database moved once.',
    intro: [
      'PUZZLTHINK is built and run by one person. It started on the lowest-effort stack: Next.js on Vercel, with Supabase Cloud’s free plan for the database, sign-in and realtime.',
      'This note records how that stack changed as more people came, using the commits and the numbers in their messages.',
    ],
    summary: 'Cutting CDN requests and moving to Cloudflare Workers, the day the free database stalled, moving to a self-run database, and deploy-time 404s stuck in the cache.',
    sections: [
      {
        id: 'vercel',
        title: '19 November: fewer CDN requests',
        blocks: [
          { type: 'p', text: 'The first warning was the number of CDN requests. A commit on the evening of 19 November cut Vercel CDN requests three ways: links stopped prefetching every visible page in the background, icons and the manifest got a long browser cache (they had max-age=0), and Vercel’s two analytics tools were removed (Google Analytics already covered traffic).' },
        ],
      },
      {
        id: 'cloudflare',
        title: '20 November: onto Cloudflare Workers',
        blocks: [
          { type: 'p', text: 'The next afternoon the site moved to Cloudflare Workers using **vinext**, which keeps the Next.js app-router code as it is, builds it with Vite and runs it on Workers. Static assets are prerendered and served as Workers static assets; only other requests reach the Worker. The site settled on www.puzzlthink.com (the bare domain redirects), with the workers.dev address kept for direct checks.' },
          { type: 'p', text: 'The commits record the problems too: the Next.js Google Analytics component rendered undefined under vinext and **made every page fail**, so the GA tag is now added by hand. Two hours later every push to main deployed to Cloudflare automatically, and public client settings moved into a committed `.env.production` so CI builds match local ones.' },
        ],
      },
      {
        id: 'peak',
        title: '21 November, 4:10 pm',
        blocks: [
          { type: 'p', text: 'The next limit was the database. At 16:10 on 21 November the free Supabase Cloud project saturated, at **about 174 concurrent users** according to the commit. Most API calls failed with 504, and requests were cut on the spot: home rankings and the Hall of Fame from a 60-second cache, the online heartbeat every 120 s, the home open-room list every 60 s.' },
          { type: 'p', text: 'The real fix was committed at 7:19 pm the same day: the database, sign-in, realtime and the Slitherlink finish check moved to Supabase on **a self-run server**, with the data copied over and served at api.puzzlthink.com. The commit says to merge it only at the planned cutover, right after the final data copy.' },
          { type: 'h3', text: 'Why everyone signed in once more' },
          { type: 'p', text: 'The new server signs sign-in tokens with a different secret, so it could not verify sessions issued by the cloud. Left alone, browsers would keep sending tokens that every request rejects. So the browser’s sign-in storage key was renamed and the old keys removed: **everyone signs in once more**, and accounts and records stay as they were.' },
          { type: 'p', text: 'There was one more server job on 24 November, 10:00–10:30. From 9:56, just before, a black band under the header scrolled a maintenance notice (built to hide itself after 10:40), and it came down at 10:19 when the work was done.' },
        ],
      },
      {
        id: 'snapshots',
        title: 'Numbers every five minutes',
        blocks: [
          { type: 'p', text: 'Since the evening of 20 November the database keeps a snapshot every five minutes of users online, today’s visits and today’s plays (kept 180 days). Up to 2026-11-26, 14:00 KST, the highest concurrency recorded was **193 users at 14:10 on 26 November**. The busiest day for plays was 25 November with 14,823.' },
        ],
      },
      {
        id: 'static404',
        title: 'Deploy-time 404s stuck in the cache',
        blocks: [
          { type: 'p', text: 'Fixed on the night of 25 November. Files under `/_next/static/` carry a content hash in their names, so they are cached for a year as immutable. But **404 responses for missing files went out with the same one-year cache.**' },
          { type: 'p', text: 'Someone opening a page right as a deploy switched over could get a 404 — an old page asking for a new file, or a new page asking for one not uploaded yet — and that 404 stayed in their browser for a year. For them, even reloading showed "this page couldn’t load".' },
          { type: 'p', text: 'So every page now has a small script in its head. When a static file fails to load, it collects the address, refetches it past the cache (`cache: \'reload\'`), and if that works, reloads the page once. Each file is tried only once per session, so it never reloads in a loop.' },
        ],
      },
      {
        id: 'today',
        title: 'Where it stands',
        blocks: [
          { type: 'list', items: [
            '**Web**: Next.js (app router, Korean and English with next-intl) built with vinext and served from Cloudflare Workers, deployed automatically from main.',
            '**Data**: a self-run Supabase (Postgres, sign-in, realtime). Records, rankings, icons and contests run as database functions and scheduled jobs.',
            '**Game logic**: almost all in the browser — the AIs, and friend-room games (on the host’s browser) — so the server only keeps records and lists. The heavy Very Hard searches run in Web Workers.',
          ] },
        ],
      },
    ],
    sources: [
      '`cloudflare.config.ts`, `vite.config.ts`, `src/app/[locale]/layout.tsx` (STATIC_HEAL)',
      'Commits 1eb6cfe (11/19 fewer CDN requests), d46c657 (11/20 Cloudflare Workers and vinext, GA fix), f7e53aa (11/20 automatic deploys), a3651c4 (11/20 five-minute snapshots), d2dd35e (11/21 the 16:10 response), c1d1732 (11/21 self-run Supabase, signing in again), ecdb72d and 4046042 (11/24 maintenance band), d9bdc7d (11/25 static 404 self-heal)',
      'DB aggregates (2026-11-26 14:22 KST): highest online count in online_snapshots and its time, game_plays_daily totals by day',
      'Where the server is, how it is set up, its secrets and how it is reached are deliberately left out.',
    ],
  },
};

export default article;
