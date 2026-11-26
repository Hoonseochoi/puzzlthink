import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'sys-lounge-support',
  category: 'systems',
  games: [],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '라운지 채팅과 서포터 커버 개발기 — 1인 사이트의 대화방과 후원 | 개발 노트',
      description: 'PUZZLTHINK 라운지(사이트 전체 채팅)가 어떤 원칙으로 만들어졌는지, 왜 24시간 뒤 사라지게 했는지, 그리고 광고를 걷어 내고 자율 후원 → 서버비 펀딩 → ₩3,000 서포터 커버로 이어진 후원 이야기를 커밋 기록으로 정리했어요.',
      keywords: ['PUZZLTHINK 라운지', '사이트 채팅', '서포터 커버', '자율 후원', '1인 개발 사이트', '웹게임 운영', '개발 노트'],
    },
    title: '라운지 채팅과 서포터 커버 개발기',
    lead: '게임 밖에서 사람들이 만나는 자리, 그리고 그 자리를 유지하는 비용.',
    intro: [
      '방 채팅은 같은 방에 있는 사람끼리의 대화예요. 하지만 게임을 고르는 중이거나 AI와 두는 중인 사람들도 서로 이야기할 곳이 필요했어요. 그게 11월 23일 밤에 생긴 **라운지**예요.',
      '라운지가 생기기 전부터 사이트에는 "자율 후원" 버튼이 있었어요. 이 글은 사이트 전체 채팅을 만든 원칙과, 후원 버튼이 광고·서버비·서포터 커버로 모양을 바꿔 온 과정을 함께 정리했어요.',
    ],
    summary: '사이트 전체 채팅 라운지를 만든 원칙과 24시간 뒤 사라지게 한 이유, 광고를 걷어 내고 ₩3,000 서포터 커버에 이른 후원 이야기.',
    sections: [
      {
        id: 'lounge',
        title: '라운지: 어느 페이지에서나',
        blocks: [
          { type: 'p', text: '라운지는 11월 23일 밤 10시 50분에 들어갔어요. 처음부터 홈과 모든 게임 페이지(시작 화면, AI전, 도전, 오픈 대전 대기실)에서 열 수 있었고, 이름 옆에는 그 사람이 지금 있는 게임이 붙어요. "닉네임(벽바둑 II)"처럼요. 화면에 보일 때, 라운지를 켜 뒀을 때만 실시간 채널에 접속해요.' },
          { type: 'p', text: '그 뒤 30분 동안 작은 커밋 여덟 개가 이어졌어요. 접속자 수 위의 반투명 버튼, 오른쪽으로 밀어서 닫기, 메시지 옆 보낸 시각, 안 읽은 메시지의 빨간 숫자(99개가 넘으면 99+), 그리고 **친구·오픈 대전의 대국이 진행 중일 때만 숨기기**까지요. 대국 중에는 방 채팅이 있고, 라운지의 알림이 수읽기를 방해하면 안 되니까요.' },
          { type: 'p', text: '라운지 이름 옆에는 처음엔 피스 경쟁전 피스 수가 보였는데, 11월 25일 프로필 아이콘이 생기면서 그 사람의 아이콘으로 바뀌었어요. 11월 26일에는 휴대폰 아래쪽 탭 바에 라운지 버튼이 들어갔어요.' },
        ],
      },
      {
        id: 'rules',
        title: '규칙은 서버가 지켜요',
        blocks: [
          { type: 'p', text: '모르는 사람끼리 이야기하는 곳에서는 규칙이 필요해요. 라운지의 원칙은 **규칙을 화면이 아니라 서버가 지킨다**는 거예요. 메시지는 데이터베이스의 함수 하나를 거쳐서만 보낼 수 있고, 그 함수가 모든 걸 확인해요.' },
          { type: 'list', items: [
            '로그인한 사람만 보낼 수 있어요.',
            '너무 빨리, 너무 많이 보내거나 같은 말을 되풀이하면 막혀요. 계속하면 잠시 보낼 수 없게 돼요.',
            '욕설과 성적인 표현, 그리고 전화번호·이메일·메신저 아이디·외부 링크 같은 개인정보와 연락처는 걸러요. 걸러진 메시지는 **저장도, 전송도 되지 않아요.**',
            '여러 사람이 같은 메시지를 신고하면 그 메시지는 지워지고, 보낸 사람은 잠시 보낼 수 없게 돼요.',
          ] },
          { type: 'p', text: '거르는 단어 목록과 정확한 기준은 공개하지 않아요. 피해 가는 방법을 알려 주는 셈이 되니까요.' },
        ],
      },
      {
        id: 'expire',
        title: '24시간 뒤 사라지는 대화',
        blocks: [
          { type: 'p', text: '처음에는 최근 50개 메시지를 남겼어요. 11월 26일 새벽, 메시지가 **24시간 뒤 사라지도록** 바꿨어요. 라운지는 24시간 안의 메시지만 보여 주고, 10분마다 도는 작업이 그보다 오래된 메시지를 지워요. 열려 있는 라운지 화면에서도 24시간이 지난 메시지는 바로 빠져요. 안내 문구도 "24시간 뒤 사라져요"로 바꿨어요. 2026-11-26 14시(KST) 기준으로 라운지에 남아 있는 메시지는 48개였어요.' },
        ],
      },
      {
        id: 'support',
        title: '후원: 광고를 걷어 내기까지',
        blocks: [
          { type: 'p', text: '후원 버튼은 11월 17일 오후, 푸터와 홈과 모든 게임 시작 화면에 처음 붙었어요(CTEE). 그다음 이틀 동안은 자리를 여러 번 옮겼어요.' },
          { type: 'steps', items: [
            { title: '11/18 오후', body: '축하 팝업에 따뜻한 후원 한 줄(하루 한 번)을 넣고, 어디서 누른 후원인지 자리별로 세기 시작했어요.' },
            { title: '11/18 저녁', body: '결과 화면과 게임 아래에 있던 광고 자리를 걷어 내고 후원을 단순하게 정리했어요.' },
            { title: '11/19', body: '푸터는 소개·문의·자율 후원·정책만 남겼다가, 결과 화면과 순위 상승 팝업에 조용한 후원 한 줄을 되살렸어요. 저녁에는 서버비 안내(상단 배너, 헤더 버튼, 게임 뒤 카드)를 붙였어요.' },
            { title: '11/20 · 11/21', body: '배너 버튼 문구는 "개발자 응원하기"로, 다음 날 피크 시간 장애를 겪은 뒤에는 "서버비 펀딩 중"으로 바뀌었어요.' },
          ] },
        ],
      },
      {
        id: 'cover',
        title: '서포터 커버',
        blocks: [
          { type: 'p', text: '11월 26일 아침, 후원에 처음으로 "돌아오는 것"이 생겼어요. **₩3,000 서버비 후원**을 한 사람의 프로필 아이콘에 씌우는 **서포터 커버**예요. 처음 문구는 "3,000원 이상"이었는데, 11분 뒤 "1인 개발자에게 하는 정해진 금액 ₩3,000 후원"으로 고쳤어요. 그때까지 후원 안내에 있던, 후원해도 돌아오는 것은 없다는 문구도 빠졌어요.' },
          { type: 'p', text: '커버는 40여 분 사이에 세 번 다시 그렸어요. 빛이 훑고 지나가는 홀로그램 띠, 금색 날개, 별과 루비 하트를 단 화려한 버전에서, 아이콘 밖으로 퍼지며 날갯짓하는 깃털 날개로, 다시 세 겹 깃털의 부드럽고 둥근 천사 날개로요. 벽바둑 II 판 위에서는 말을 가리지 않도록 얇은 무지개 테두리만 둘러요. 서포터가 커버를 받은 뒤 처음 사이트에 오면 한 번만 감사 팝업이 떠요.' },
          { type: 'p', text: '후원 확인은 사람이 해요. 후원 버튼 아래의 작은 양식으로 후원자 이름과 사이트 닉네임을 보내면, 운영자가 확인하고 그 닉네임에 커버를 줘요.' },
        ],
      },
    ],
    sources: [
      '`src/components/LoungeChat.tsx`, `src/lib/lounge.ts`, `src/components/SupportLink.tsx`',
      '커밋 d457b69~126573a (11/23 라운지와 후속 수정 여덟 개), 4883b56 (11/25 이름 옆 아이콘), 20cb161 (11/26 탭 바), eea4cc4·8bf4b33 (11/26 24시간 삭제), 79372aa (11/17 후원 링크), d3cad32·166f8e9 (11/18 후원 한 줄, 광고 제거), fc1bc4e·d2a8f28·2b20413 (11/19), dbc6e64·ead1681 (11/20·21 문구), 0bac228·032b258·7d75561·a7a269b·fb5a066 (11/26 서포터 커버), 4cac493 (11/26 후원 확인 요청), 97df5e0 (11/26 판 위 무지개 테두리), 81fd06a (11/26 감사 팝업)',
      'DB 집계(2026-11-26 14:22 KST): lounge_messages 행 수',
      '라운지의 거름 기준·단어 목록·운영자 기능은 일부러 적지 않았어요.',
    ],
  },
  en: {
    meta: {
      title: 'Lounge chat and supporter cover dev notes — chat and support on a one-person site | Dev notes',
      description: 'The principles behind the PUZZLTHINK lounge (site-wide chat), why its messages vanish after 24 hours, and how the support button went from voluntary support, without ads, to a server fund and a ₩3,000 supporter cover — from the commit history.',
      keywords: ['PUZZLTHINK lounge', 'site chat', 'supporter cover', 'voluntary support', 'one-person website', 'dev notes'],
    },
    title: 'Lounge chat and supporter cover dev notes',
    lead: 'A place for people to meet outside the games, and what it costs to keep it.',
    intro: [
      'Room chat is for people in the same room. But people choosing a game or playing the AI needed somewhere to talk too — the **lounge**, added on the night of 23 November.',
      'Before the lounge, the site already had a "voluntary support" button. This note covers the principles of the site-wide chat, and how the support button changed shape — ads, server costs, a supporter cover.',
    ],
    summary: 'The principles behind the site-wide lounge, why its messages vanish after 24 hours, and how support went from removing ads to a ₩3,000 supporter cover.',
    sections: [
      {
        id: 'lounge',
        title: 'The lounge, on every page',
        blocks: [
          { type: 'p', text: 'The lounge went in at 10:50 pm on 23 November, available from the start on the home page and every game page (entry screen, AI games, challenges, open-room waiting). Next to each name is the game that person is on — "nickname (Wallgo II)". It joins its realtime channel only while visible and switched on.' },
          { type: 'p', text: 'Eight small commits followed in thirty minutes: a translucent button above the online count, swipe right to close, send times beside messages, a red unread count (99+ past 99), and **hiding only while a friend or open match is in progress** — a match has its own room chat, and lounge alerts should not break anyone’s concentration.' },
          { type: 'p', text: 'Names first showed the person’s piece-race count; on 25 November, with profile icons, that became their icon. On 26 November the lounge button moved into the phone’s bottom tab bar.' },
        ],
      },
      {
        id: 'rules',
        title: 'The server keeps the rules',
        blocks: [
          { type: 'p', text: 'Strangers talking need rules. The lounge’s principle is that **the server, not the page, enforces them**: a message can only be sent through one database function, and that function checks everything.' },
          { type: 'list', items: [
            'Only signed-in players can send.',
            'Sending too fast, too much or the same line over and over is refused; keep going and you are blocked for a while.',
            'Abuse and sexual language, and personal details or contacts — phone numbers, emails, messenger IDs, outside links — are filtered. A filtered message is **neither stored nor sent**.',
            'When several people report the same message it is removed and its sender is blocked for a while.',
          ] },
          { type: 'p', text: 'The word lists and exact thresholds are not published: that would be a guide to getting around them.' },
        ],
      },
      {
        id: 'expire',
        title: 'Conversations that vanish after 24 hours',
        blocks: [
          { type: 'p', text: 'At first the last 50 messages were kept. In the early hours of 26 November messages were made to **vanish after 24 hours**: the lounge shows only the last 24 hours, a job every 10 minutes deletes older messages, and an open lounge drops them as they pass 24 hours. The notice now says so. As of 2026-11-26, 14:00 KST, the lounge held 48 messages.' },
        ],
      },
      {
        id: 'support',
        title: 'Support, and taking the ads down',
        blocks: [
          { type: 'p', text: 'A support button (CTEE) first appeared on the afternoon of 17 November in the footer, on the home page and on every game’s entry screen. Over the next two days it moved several times.' },
          { type: 'steps', items: [
            { title: '11/18 afternoon', body: 'A warm support line in celebration popups (once a day), and click counts by where the button was pressed.' },
            { title: '11/18 evening', body: 'The ad slots on result screens and below games were removed and support was simplified.' },
            { title: '11/19', body: 'The footer was cut to About, Contact, voluntary support and the policies; then a quiet support line returned to result screens and rank-up popups. In the evening a server-cost notice arrived (top banner, header button, post-game card).' },
            { title: '11/20 · 11/21', body: 'The banner button read "cheer the developer", and after the next day’s peak-time outage, "server fund in progress".' },
          ] },
        ],
      },
      {
        id: 'cover',
        title: 'The supporter cover',
        blocks: [
          { type: 'p', text: 'On the morning of 26 November support first gave something back: a **supporter cover** over the profile icon of anyone who made the **₩3,000 server support**. The first wording said "₩3,000 or more"; eleven minutes later it became "the fixed ₩3,000 support for a solo developer". The old note saying support brings nothing in return was dropped.' },
          { type: 'p', text: 'The cover was redrawn three times in about forty minutes: a showy holographic band with a light sweep, gold wings, a star and a ruby heart; then feathered wings spreading past the icon and flapping; then soft, rounded angel wings in three feather layers. On the Wallgo II board it is only a thin rainbow rim, so it never hides a piece. The first time a supporter visits after receiving it, a one-time thank-you popup appears.' },
          { type: 'p', text: 'Support is confirmed by hand: a small form under the support button sends the supporter’s name and site nickname, and the owner checks it and grants the cover to that nickname.' },
        ],
      },
    ],
    sources: [
      '`src/components/LoungeChat.tsx`, `src/lib/lounge.ts`, `src/components/SupportLink.tsx`',
      'Commits d457b69 to 126573a (11/23 the lounge and eight follow-ups), 4883b56 (11/25 icons by names), 20cb161 (11/26 tab bar), eea4cc4 and 8bf4b33 (11/26 24-hour expiry), 79372aa (11/17 support link), d3cad32 and 166f8e9 (11/18 support line, ads removed), fc1bc4e, d2a8f28 and 2b20413 (11/19), dbc6e64 and ead1681 (11/20–21 wording), 0bac228, 032b258, 7d75561, a7a269b and fb5a066 (11/26 supporter cover), 4cac493 (11/26 confirmation form), 97df5e0 (11/26 rainbow rim on the board), 81fd06a (11/26 thank-you popup)',
      'DB aggregate (2026-11-26 14:22 KST): number of lounge_messages rows',
      'The lounge’s filter rules, word lists and operator tools are deliberately left out.',
    ],
  },
};

export default article;
