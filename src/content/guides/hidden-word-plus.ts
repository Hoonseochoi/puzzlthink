// 히든 워드 확장판 guide. Same match as 히든 워드 (rules: supabase/migrations/20271126000000_hidden_word.sql hw_cfg — cut 95,
// 3 stages, 5 hints, setPoints 1/2/3, guessPoints 6/3/1, 120 s / 75 s; 20271126060000 a hint is never the answer;
// 20271126070000 the second answer costs one 피스) on the 확장 words: 20271127000000_hidden_word_levels.sql (hw_level_cfg
// 'plus': MORA gives one warm-up of 70–82 / 78–88 / 85–93 % and closes with its 95 %+ hint at positions 0 / 0.15 / 0.4
// of its list ordered from most to fewest other pool words fitted; aiNoise 3), 20271127100000_hidden_word_plus_game.sql
// (own game id hidden_word_plus, own board and crown), scripts/hidden-word/README.md (186 words in 30 groups, the
// similarity model) and src/components/hiddenWord/*. Every number in the worked example was read from the hw_score /
// hw_hints tables for 그리움 (scratch copy of the live data, 2026-11-27).
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'hiddenWordPlus',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-27',
  related: ['hiddenWord', 'equationSignal', 'gradation', 'equationTower'],
  ko: {
    meta: {
      title: '히든 워드 확장판 공략 — 닮은 단어 186개, 묶음 안에서 정답 좁히기 | PUZZLTHINK',
      description: '히든 워드 확장판은 감정·직업·장소·음식·문화처럼 서로 닮은 186단어가 30개 묶음으로 나와요. 기본과 무엇이 다른지, 묶음을 숨기는 힌트, 오답 숫자로 후보를 가르는 법, 실제 유사도로 따라 푸는 예시까지 정리했어요.',
      keywords: ['히든 워드 확장판', '히든 워드 확장판 공략', '히든워드 확장판', '히든 워드 공략', '데블스플랜3 히든워드', '유사도 단어 게임', '단어 유사도 게임', '꼬맨틀'],
    },
    title: '히든 워드 확장판 공략',
    lead: '95%는 묶음까지만 알려 줘요. 승부는 그 다음 숫자에서 나요.',
    intro: [
      '히든 워드 확장판은 규칙과 승점은 히든 워드와 같고, **단어가 달라요**. 단어 186개가 서로 닮은 30개 묶음(기쁨·슬픔·질투·그리움, 의사·간호사·약사, 아침·저녁·새벽·봄…)으로 나와서, 95% 힌트 하나로는 "어느 묶음인지"까지만 알 수 있는 일이 많아요. 모라도 확장판에서는 힌트를 덜 직접적으로 내요.',
      '이 공략은 히든 워드를 한두 판 해 본 사람을 위한 거예요. 기본과 달라지는 점, 묶음 안에서 정답을 가르는 법을 실제 유사도 숫자로 따라가고, 출제할 때 묶음을 숨기는 힌트를 고르는 법을 정리했어요.',
    ],
    gamePageTitle: '히든 워드 확장판 — 닮은 단어 186개 속에서 유사도로 맞히는 단어 게임',
    summary: '닮은 단어 30묶음, 묶음 안에서 가르는 힌트, 오답 숫자 읽기, 실제 숫자로 따라 풀기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '「데블스 플랜: 데드 어게인」(시즌 3) 5화 메인매치 히든 워드를 바탕으로 한 PUZZLTHINK의 히든 워드에, 더 많고 더 헷갈리는 단어를 넣은 확장판이에요. AI "모라"와 번갈아 출제하고 추리하는 **1:1 승점전**이고, 친구와 1:1 방도 열 수 있어요.' },
          { type: 'p', text: '히든 워드(기본)의 60단어는 과일·동물·날씨처럼 서로 멀리 떨어진 묶음이라, 95% 힌트 하나면 거의 답이 보였어요. 확장판의 186단어는 감정, 마음가짐, 직업, 장소, 집 안, 지형, 한식, 간식, 양념, 날씨, 하루와 계절, 학교, 미디어, 음악, 놀이, 구기, 과학, 몸속, 소지품, 문구, 동물, 식물, 사람 사이, 명절, 옷처럼 **한 묶음 안의 단어끼리 연상이 겹치게** 골랐어요. "눈물"은 슬픔에도, 그리움에도, 외로움에도 잘 어울려요.' },
          { type: 'p', text: '랭킹은 기본 히든 워드와 **따로**예요. 확장판 랭킹 1위는 확장판 아이콘을 가져가요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '기본과 같은 것, 다른 것',
        blocks: [
          { type: 'table', head: ['', '히든 워드', '확장판'], rows: [
            ['단어', '60개, 12묶음', '186개, 30묶음 (닮은 단어끼리)'],
            ['한 차의 힌트', '5개, 2분 · 95% 이상이면 끝', '같음'],
            ['승점', '공격 6·3·1 · 수비 +1·+2·+3 · 2라운드 2배', '같음'],
            ['모라의 데우기 힌트', '차마다 1~2개', '차마다 1개'],
            ['모라의 마무리 힌트', '1차는 여러 단어에 맞는 쪽, 3차는 가장 구체적인 쪽', '2·3차도 여러 단어에 맞는 쪽에 머물러요'],
            ['랭킹', '평균 승점 + 판당 0.3점, 3판부터', '같은 방식, 확장판 랭킹 따로'],
          ] },
          { type: 'p', text: '봉투는 6개, 봉투마다 명사 5개이고 한 봉투에는 한 묶음에서 하나씩만 들어 있어요. 라운드마다 한 번 출제하고 한 번 맞히며, 답은 단어마다 한 번 **피스 1개로 2개**까지 낼 수 있어요. 힌트로 나온 단어는 정답이 될 수 없고, 오답은 그 단어의 유사도가 공개돼요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙',
        blocks: [
          { type: 'cards', items: [
            { title: '같은 묶음의 오답은 높게 나와요', body: '확장판에서는 틀린 답도 85~93%가 흔해요. "그리움"이 정답일 때 "슬픔"과 "외로움"은 93%, "설렘"은 88%예요. 높은 오답은 "묶음은 맞았다"는 뜻이지, 거의 맞혔다는 뜻이 아니에요.' },
            { title: '힌트가 다른 히든 워드일 수도 있어요', body: '"추억", "설날", "추석"처럼 확장판의 다른 히든 워드가 힌트로 나오기도 해요. 힌트로 나온 단어는 정답이 될 수 없으니 그 단어는 지우세요.' },
            { title: '한 글자 단어', body: '말·차·밤·감·병·상은 뜻이 여러 개라 힌트가 어느 뜻을 가리키는지부터 읽어야 해요. "녹차"는 차, "군밤"은 밤, "상장"은 상이에요.' },
            { title: '합성어 조각은 뜻으로 매겨요', body: '한 글자 힌트가 히든 워드와 붙어 단어가 되면, 그 단어의 뜻이 히든 워드와 얼마나 가까운지로 숫자가 나와요. "수영+장"처럼 뜻이 이어지면 높고, 글자만 붙는 말장난은 높지 않아요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        onGamePage: true,
        level: 'beginner',
        title: '입문 전략 — 묶음을 숨기고, 묶음 안에서 가르기',
        blocks: [
          { type: 'h3', text: '출제: 묶음이 아니라 내 단어만 가리키는 95%' },
          { type: 'p', text: '"감정", "직업", "계절"처럼 묶음 전체에 맞는 힌트는 95%가 쉽게 나오지만, 모라에게 묶음을 통째로 알려 줘요. 확장판에서 모라는 묶음까지는 금방 찾고, 그 안에서 고르는 데서 틀려요. 그러니 **내 단어에만 높고 이웃 단어에는 낮은 힌트**가 좋아요. 다의어라면 다른 뜻 쪽 힌트도 좋은 숨김이에요(밤 → "군밤", 병 → "유리병").' },
          { type: 'h3', text: '추리: 1차에는 묶음을, 2차부터는 후보를' },
          { type: 'p', text: '1차 마무리 힌트는 보통 묶음 전체에 맞는 단어예요. 1차에 바로 맞히려고 무리하기보다, 묶음의 후보를 적어 두고 데우기 힌트가 어느 후보 쪽으로 기우는지 보세요. 확신이 없으면 묶음 안에서 **가장 다른 후보**를 골라 답해요. 틀려도 그 오답의 숫자가 다음 차의 단서가 돼요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 풀기 — "그리움"을 찾는 세 차',
        lead: '모라가 감정 묶음의 "그리움"을 숨겼을 때 나올 수 있는 힌트예요. 숫자는 게임의 유사도 표에서 그대로 가져왔어요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1차: 기차 78%, 추억 96.5%', body: '확장판의 1차 마무리는 다른 히든 워드에도 잘 맞는 힌트예요. "추억"은 그리움 96.5%, 슬픔·외로움 85%, 설렘 84.2%, 기쁨 82.5%, 불안·질투 80%로 감정 묶음 전체에 높아요. 묶음은 감정, 후보는 일곱이에요. "추억"은 그 자체가 다른 묶음(삶)의 히든 워드라 정답에서 빠져요.' },
            { title: '데우기 힌트로 기울이기', body: '"기차"는 그리움 78%, 기쁨 60.5%, 분노 53.7%, 설렘 51.4%, 질투 48.7%, 슬픔 46.9%, 외로움 32.8%, 불안 29.1%예요. 떠나고 돌아오는 장면이 떠오르는 단어라 그리움이 가장 높아요. 숫자가 낮아도, 후보끼리 크게 갈리면 좋은 단서예요.' },
            { title: '1차에 "슬픔"으로 답했다면', body: '슬픔은 그리움과 93%라 틀려도 높게 나와요. "묶음은 맞다"는 확인일 뿐이에요. 출제자인 모라가 1점을 가져가고 2차로 넘어가요.' },
            { title: '2차: 명절 78%, 회상 95%', body: '"회상"은 그리움 95%, 설렘 77.7%, 슬픔 76.3%, 질투 73.7%, 기쁨 72.3%, 분노 66.6%, 외로움 60.3%, 불안 55.2%예요. "기차"와 같은 쪽을 가리키니 그리움으로 답해요. 2차 정답은 3점(2라운드면 6점)이에요.' },
          ] },
          { type: 'table', caption: '같은 힌트가 감정 묶음의 후보마다 몇 %로 나오는지 (게임의 유사도 표)', head: ['힌트', '그리움', '슬픔', '외로움', '설렘', '기쁨', '질투', '불안', '분노'], rows: [
            ['추억', '96.5', '85', '85', '84.2', '82.5', '80', '80', '58.6'],
            ['기차', '78', '46.9', '32.8', '51.4', '60.5', '48.7', '29.1', '53.7'],
            ['회상', '95', '76.3', '60.3', '77.7', '72.3', '73.7', '55.2', '66.6'],
            ['고향', '95', '70.1', '49.3', '57', '67.1', '32.7', '31.3', '55.1'],
            ['눈물', '93', '98', '88', '78.6', '82', '78', '68.7', '81'],
            ['첫사랑', '95', '47.1', '83', '95', '43.6', '83', '18.9', '12.8'],
          ] },
          { type: 'callout', tone: 'tip', title: '표를 읽는 법', text: '"추억"이나 "눈물"처럼 묶음 전체에 높은 힌트는 묶음만 알려 줘요. "고향"처럼 정답만 높고 나머지가 크게 떨어지는 힌트가 하나를 골라 줘요. 출제할 때는 거꾸로, "첫사랑"처럼 이웃(설렘)에도 95%가 나오는 힌트로 끝내면 모라가 둘 사이에서 헷갈려요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 모라가 확장판에서 하는 일',
        blocks: [
          { type: 'p', text: '모라는 점수표를 보지 않고 단어의 뜻으로 추리해요. 공개된 힌트들과 뜻이 가까운 후보를 높게, 낮게 나온 힌트와 가까운 후보를 낮게 매겨 가장 그럴듯한 단어를 골라요. 확장판에서는 기본보다 숫자를 조금 더 날카롭게 읽어서, **두 번째로 그럴듯한 후보와의 차이**가 작을 때 피스 없이도 2차부터 답을 두 개 낼 수 있어요.' },
          { type: 'list', items: [
            '**낮은 힌트도 단서예요.** 모라는 60% 아래 힌트를 "이 쪽은 아니다"로 읽어요. 이웃 단어에 가까운 힌트를 일부러 낮게 보여 주면 모라가 그 이웃을 지워요. 내 단어를 숨기려면 이웃을 지우는 힌트는 피하세요.',
            '**모라가 낸 오답의 숫자를 보세요.** 모라의 오답도 유사도가 공개되고, 모라는 다음 차에 그 숫자까지 단서로 써요. 93% 오답 뒤에는 모라도 묶음을 확신해요.',
            '**2·3차에도 모라의 힌트는 넓어요.** 기본에서는 3차 힌트가 가장 구체적이었지만, 확장판은 3차도 묶음 쪽에 머물러요. 3차에서는 데우기 힌트와 오답 숫자가 더 중요해요.',
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 점수 계산과 피스',
        blocks: [
          { type: 'p', text: '한 판 만점은 36점이에요(1라운드 6+6, 2라운드 12+12). 확장판에서는 1차 정답이 기본보다 드물어서, 2차 정답(3점, 2라운드 6점)과 수비 점수(+1·+2·+3)의 비중이 커져요. 시뮬레이션으로 보면 같은 실력의 사람이 확장판에서 한 판에 1점쯤 덜 얻어요.' },
          { type: 'p', text: '피스는 "후보가 둘로 좁혀졌는데 숫자로 가를 수 없을 때" 쓰세요. 확장판은 묶음 안의 두 단어가 같은 힌트에 비슷하게 나오는 일(그리움과 설렘의 "첫사랑" 95%)이 많아서, 기본보다 피스의 값어치가 커요. 2라운드 2차에서 쓰면 맞혔을 때 6점이에요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**묶음 이름으로 출제 끝내기**: "감정 96.5%"는 모라에게 일곱 후보를 한 번에 알려 줘요.',
            '**높은 오답에 들뜨기**: 93% 오답은 같은 묶음이라는 뜻일 뿐이에요.',
            '**다의어의 한 뜻만 보기**: 말·차·밤·감·병·상, 기타(악기/그밖), 북(악기/방향), 위(몸속/위쪽), 시장(장터/시장님)은 힌트가 어느 뜻인지부터 읽으세요.',
            '**힌트로 나온 히든 워드를 답하기**: 힌트는 정답이 아니에요. "추억"이 힌트로 나왔다면 추억은 후보에서 빼세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드 메모',
        blocks: [
          { type: 'p', text: '**파티 방(2~6명)**에서는 방송 메인매치 방식으로 해요. 모두가 한 번씩 출제자가 되고(순서는 추첨, 6명이면 6턴), 출제자가 힌트를 내면 나머지가 75초 안에 동시에 답해요. 맞힌 사람마다 +1점이고 그 단어는 끝나요. 아무도 못 맞히면 출제자가 1차 +1, 2차 +2, 3차 +3점을 얻어요. 방송은 2라운드(2라운드 점수 2배)였지만 여기서는 한 바퀴로 끝나요. 봉투 단어는 서버에서 나눠 주고 힌트·답의 유사도도 서버가 계산해서 내 봉투는 나만 봐요. 방장은 2~6명 중 인원을 정하고, 친구 방 말고 **오픈 파티 방**으로 열면 누구나 들어올 수 있어요(오픈 방은 다른 히든 워드 오픈 대전처럼 앱에서만 열 수 있어요). 여럿이 할 때는 "한 명만 맞혀도 끝난다"는 점이 중요해요. 출제자는 한 명이라도 알아챌 힌트를 피해야 하고, 맞히는 쪽은 남보다 먼저가 아니라 함께 막는다는 생각으로 답해도 좋아요.' },
          { type: 'p', text: 'AI 모라와 1:1 승점전, 링크나 4자리 코드로 여는 친구 1:1 방이 있어요. 확장판에서 만든 방은 확장판 단어로 해요. 친구 대전은 랭킹에 들어가지 않아요. 로그인하지 않아도 둘 수 있지만, 랭킹과 피스는 로그인해야 해요. 기본 60단어로 하고 싶다면 히든 워드로 가세요. 랭킹은 서로 따로예요.' },
        ],
      },
    ],
    faq: [
      { q: '히든 워드와 확장판은 무엇이 다른가요?', a: '규칙과 승점은 같고 단어가 달라요. 확장판은 서로 닮은 단어 186개가 30개 묶음으로 나오고, 모라가 힌트를 덜 직접적으로 내요. 랭킹도 따로예요.' },
      { q: '확장판이 더 어려운가요?', a: '조금요. 95% 힌트 하나로는 묶음까지만 좁혀지는 일이 많아서, 모라의 단어를 1차에 맞히기가 더 어려워요. 대신 모라도 내 단어를 묶음 안에서 헷갈려요.' },
      { q: '확장판 랭킹은 어떻게 매기나요?', a: '기본과 같은 방식이에요. 한 판 평균 승점에 판당 0.3점(20판까지, 최대 +6)을 더하고, 로그인하고 3판을 끝내면 순위에 올라요. 기본 히든 워드와는 따로 겨뤄요.' },
      { q: '유사도는 어떻게 정하나요?', a: '히든 워드마다 만든 연상표, 국립국어원 우리말샘의 관련어, 미리 계산한 단어 벡터를 합쳐 0~100%로 매겨요. 확장판에는 한국어에 맞춘 의미 모델을 하나 더 더했어요.' },
      { q: '친구 방에서도 확장판 단어로 할 수 있나요?', a: '네. 확장판 화면에서 만든 방은 확장판 단어로 하고, 초대 링크도 확장판으로 열려요.' },
    ],
    cta: { title: '닮은 단어 사이에서 찾아볼까요?', body: '첫 판은 묶음을 찾는 데서, 둘째 판부터는 묶음 안에서 가르는 데서 갈려요.', button: '확장판 하러 가기' },
    disclaimer: 'PUZZLTHINK의 히든 워드 확장판은 방송에 나온 게임 규칙을 참고해 만든 비공식 팬 게임이며, 해당 프로그램 및 제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: 'Hidden Word: Expansion strategy — 186 look-alike words, narrowing inside a group | PUZZLTHINK',
      description: 'Hidden Word: Expansion deals 186 look-alike Korean words in 30 groups: feelings, jobs, places, food, culture. What changes from Hidden Word, hints that hide the group, reading wrong-answer numbers, and a worked example with real similarity numbers.',
      keywords: ['Hidden Word Expansion', 'Hidden Word strategy', "Devil's Plan 3 Hidden Word", 'word similarity game', 'Korean word guessing game'],
    },
    title: 'Hidden Word: Expansion strategy guide',
    lead: 'A 95% hint only tells you the group. The game is decided by the next number.',
    intro: [
      'Hidden Word: Expansion keeps the rules and points of Hidden Word and **changes the words**: 186 of them in 30 groups of look-alikes (joy, sadness, jealousy, longing; doctor, nurse, pharmacist; morning, evening, dawn, spring…). One 95% hint often narrows things down to the group and no further, and Mora hints less directly here.',
      'This guide is for players who have played Hidden Word once or twice. It shows what changes, follows a real example of splitting a group with the actual numbers, and explains how to pick a closing hint that hides your group.',
    ],
    gamePageTitle: 'Hidden Word: Expansion — find the word among 186 look-alikes by similarity',
    summary: '30 look-alike groups, hints that split a group, reading wrong answers, a worked example.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "PUZZLTHINK's Hidden Word is built on the episode 5 main match of The Devil's Plan: Dead Again (season 3); the Expansion fills it with more, and more confusable, words. It is a **one-on-one point match** against the AI Mora, taking turns to set and guess, and you can open a one-on-one room for a friend." },
          { type: 'p', text: "The original's 60 words sit in far-apart groups (fruit, animals, weather), so one 95% hint nearly gave the answer away. The Expansion's 186 words were picked so that **words in a group share their associations**: feelings, attitudes, jobs, places, rooms, landforms, Korean dishes, snacks, seasonings, weather, times of day and seasons, school, media, music, games, ball sports, science, the body, belongings, stationery, animals, plants, people, holidays and clothes. \"Tears\" suits sadness, longing and loneliness alike." },
          { type: 'p', text: 'The ranking is **separate** from Hidden Word, and the Expansion #1 holds the Expansion icon.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'What stays, what changes',
        blocks: [
          { type: 'table', head: ['', 'Hidden Word', 'Expansion'], rows: [
            ['Words', '60 in 12 groups', '186 in 30 look-alike groups'],
            ['Hints per stage', '5 in 2 minutes; 95% ends it', 'Same'],
            ['Points', 'Guess 6·3·1, hold +1·+2·+3, round 2 doubled', 'Same'],
            ["Mora's warm-up hints", '1–2 per stage', '1 per stage'],
            ["Mora's closing hint", 'Broad at stage 1, most specific at stage 3', 'Stays on the broad side in stages 2 and 3'],
            ['Ranking', 'Average points + 0.3 per match, from 3 matches', 'Same formula, its own ranking'],
          ] },
          { type: 'p', text: 'Six envelopes, five nouns each, at most one per group in an envelope. Each round you set once and guess once; once per word you may spend **1 piece for two answers**. A hint can never be the answer, and a wrong answer shows its similarity.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rules',
        blocks: [
          { type: 'cards', items: [
            { title: 'Wrong answers from the group score high', body: 'Misses of 85–93% are common. With 그리움 (longing) hidden, 슬픔 (sadness) and 외로움 (loneliness) score 93% and 설렘 (flutter) 88%. A high miss means "right group", not "almost right".' },
            { title: 'A hint may be another hidden word', body: 'Other Expansion words such as 추억 (memories), 설날 or 추석 can turn up as hints. A hint is never the answer, so cross it off.' },
            { title: 'One-syllable words', body: '말, 차, 밤, 감, 병 and 상 each have several meanings; first work out which one a hint points at: 녹차 is tea (차), 군밤 a chestnut (밤), 상장 an award (상).' },
            { title: 'Compound pieces score by meaning', body: 'When a one-syllable hint joins the hidden word into a real word, its number is how close that word\'s meaning is: 수영+장 (pool) is high; a pun that only joins letters is not.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        onGamePage: true,
        level: 'beginner',
        title: 'Beginner strategy — hide the group, split the group',
        blocks: [
          { type: 'h3', text: 'Setting: a 95% that points at your word, not the group' },
          { type: 'p', text: 'Hints like "feeling", "job" or "season" reach 95% easily but hand Mora the whole group. In the Expansion Mora finds the group quickly and goes wrong choosing inside it, so prefer a hint that is **high for your word and low for its neighbours**. For a word with several meanings, a hint for the other meaning hides well (밤 → 군밤, 병 → 유리병).' },
          { type: 'h3', text: 'Guessing: the group at stage 1, the candidate from stage 2' },
          { type: 'p', text: "Mora's stage-1 closing hint usually fits the whole group. Rather than forcing a stage-1 answer, list the group's candidates and see which way the warm-up hint leans. If unsure, answer with **the candidate least like the others**; its number is a clue for the next stage even when wrong." },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — finding 그리움 in three stages',
        lead: 'Hints Mora can give when it hides 그리움 (longing) from the feelings group. The numbers come straight from the game\'s similarity table.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Stage 1: 기차 (train) 78%, 추억 (memories) 96.5%', body: 'In the Expansion the stage-1 closer fits other hidden words too. 추억 scores 96.5% for 그리움, 85% for sadness and loneliness, 84.2% for flutter, 82.5% for joy, 80% for anxiety and jealousy: high across the feelings group. Group found, seven candidates. 추억 itself is a hidden word of another group, so it is out.' },
            { title: 'Let the warm-up tip the balance', body: '기차 scores 78% for longing, 60.5% joy, 53.7% anger, 51.4% flutter, 48.7% jealousy, 46.9% sadness, 32.8% loneliness, 29.1% anxiety. Departures and homecomings put longing on top. A low number is still a good clue when it splits the candidates widely.' },
            { title: 'If you answered 슬픔 (sadness)', body: 'Sadness scores 93% against longing, high but wrong: it only confirms the group. Mora, as setter, takes 1 point and stage 2 begins.' },
            { title: 'Stage 2: 명절 (holiday) 78%, 회상 (recollection) 95%', body: '회상 scores 95% for longing, 77.7% flutter, 76.3% sadness, 73.7% jealousy, 72.3% joy, 66.6% anger, 60.3% loneliness, 55.2% anxiety. It agrees with 기차, so answer 그리움: 3 points at stage 2 (6 in round 2).' },
          ] },
          { type: 'table', caption: 'The same hint against each candidate of the feelings group (the game\'s similarity table)', head: ['Hint', '그리움', '슬픔', '외로움', '설렘', '기쁨', '질투', '불안', '분노'], rows: [
            ['추억', '96.5', '85', '85', '84.2', '82.5', '80', '80', '58.6'],
            ['기차', '78', '46.9', '32.8', '51.4', '60.5', '48.7', '29.1', '53.7'],
            ['회상', '95', '76.3', '60.3', '77.7', '72.3', '73.7', '55.2', '66.6'],
            ['고향', '95', '70.1', '49.3', '57', '67.1', '32.7', '31.3', '55.1'],
            ['눈물', '93', '98', '88', '78.6', '82', '78', '68.7', '81'],
            ['첫사랑', '95', '47.1', '83', '95', '43.6', '83', '18.9', '12.8'],
          ] },
          { type: 'callout', tone: 'tip', title: 'Reading the table', text: 'Hints high across the group (추억, 눈물) only name the group; a hint high for one word and far lower for the rest (고향, hometown) picks it out. When setting, do the opposite: close with a hint that also hits 95% for a neighbour (첫사랑, first love, for flutter too) and Mora is torn between the two.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — what Mora does in the Expansion',
        blocks: [
          { type: 'p', text: 'Mora never reads the score table: it reasons from meaning, ranking candidates up for hints shown high and down for hints shown low. In the Expansion it reads the numbers a little more sharply, and from stage 2 it may give two answers when **its top two candidates are close**.' },
          { type: 'list', items: [
            '**Low hints are clues too.** Mora reads anything under 60% as "not this way". A low hint close to a neighbour makes Mora cross that neighbour off; avoid it when hiding your word.',
            "**Watch the numbers on Mora's misses.** Its wrong answers are scored too, and Mora uses them as clues next stage. After a 93% miss Mora is sure of the group.",
            "**Mora's hints stay broad in stages 2 and 3.** In the original, stage 3 brought the most specific hint; here it stays on the group side, so warm-ups and wrong-answer numbers matter more.",
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — the score and pieces',
        blocks: [
          { type: 'p', text: 'A perfect match is 36 points (6+6 in round 1, 12+12 in round 2). Stage-1 hits are rarer in the Expansion, so stage-2 hits (3, or 6 in round 2) and holding points (+1, +2, +3) weigh more. In simulations an equally skilled player scores about one point less per match here.' },
          { type: 'p', text: 'Spend a piece when two candidates are left and no number separates them. Look-alike pairs that score alike on the same hint (longing and flutter, both 95% for 첫사랑) are common here, so a piece is worth more than in the original. In round 2, stage 2, a hit with it is worth 6.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Closing on the group\'s name**: "feeling 96.5%" hands Mora seven candidates at once.',
            '**Getting excited about a high miss**: 93% only means the same group.',
            '**Seeing one meaning only**: 말, 차, 밤, 감, 병, 상, 기타 (guitar / others), 북 (drum / north), 위 (stomach / above) and 시장 (market / mayor) — read which meaning a hint points at.',
            '**Answering a hidden word shown as a hint**: a hint is never the answer.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes',
        blocks: [
          { type: 'p', text: 'A **party room (2–6 players)** plays the show\'s main-match rules: everyone sets once (order drawn, six turns at a full table), and while the setter gives hints the others answer together within 75 seconds. Each right answer scores +1 and ends the word; if nobody gets it the setter scores +1, +2, +3 by stage. The show played two rounds with round 2 doubled; here the game ends after one. Envelopes are dealt and every similarity is computed by the server, so only you see your words; the host picks two to six seats, and an **open party room** lets anyone in (like every Hidden Word open room, it is opened from the app). With several players one right answer ends the word, so the setter must avoid any hint that even one player would read, and the guessers are blocking the setter together as much as racing each other.' },
          { type: 'p', text: 'There is the one-on-one point match against Mora and a one-on-one friend room opened by link or 4-digit code; rooms made here use the Expansion words. Friend matches are not ranked. You can play signed out, but the ranking and pieces need an account. For the original 60 words, go to Hidden Word; the rankings are separate.' },
        ],
      },
    ],
    faq: [
      { q: 'How is the Expansion different from Hidden Word?', a: 'Same rules and points, different words: 186 look-alikes in 30 groups, and Mora hints less directly. It has its own ranking.' },
      { q: 'Is the Expansion harder?', a: "A little. One 95% hint often narrows it to the group only, so finding Mora's word at stage 1 is harder. Mora also gets lost inside your group." },
      { q: 'How is the Expansion ranked?', a: 'As in Hidden Word: average points per match plus 0.3 per match (up to 20, max +6), ranked from 3 finished matches when signed in, separately from the original.' },
      { q: 'How is similarity decided?', a: "From each hidden word's association list, the National Institute of Korean Language's Urimalsaem related words and precomputed word vectors, combined into 0–100%. The Expansion adds a Korean-tuned meaning model." },
      { q: 'Can friend rooms use the Expansion words?', a: 'Yes. A room made on the Expansion page plays its words, and its invite link opens the Expansion.' },
    ],
    cta: { title: 'Find it among the look-alikes?', body: 'Your first match is about finding the group; from the second on, about splitting it.', button: 'Play the Expansion' },
    disclaimer: "PUZZLTHINK's Hidden Word: Expansion is an unofficial fan game inspired by the rules shown on the program and is not affiliated with the program or its producers.",
  },
};

export default guide;
