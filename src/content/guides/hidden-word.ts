// 히든 워드 guide. The game runs on the server: rules follow supabase/migrations/20271126000000_hidden_word.sql
// (hw_cfg: cut 95, 3 stages, 5 hints a stage, setPoints 1/2/3, guessPoints 6/3/1, hintSecs 120, guessSecs 75; hw_start's
// six envelopes of five words with no two of a group; hw_begin_turn's turn order; hw_ai_hints: one or two warm-ups of
// 72–86 / 80–91 / 86–94.5 % then a 95 %+ closer that fits the most pool words at stage 1 and the fewest at stage 3;
// hw_ai_guess: pool words only, clues weighted by (s − 60) / 40, a second answer from stage 2 when its top two are close),
// 20271126060000_hidden_word_no_hint_answers.sql (hw_act: a hint is never the answer; wrong answers show their %),
// 20271126070000_piece_spends.sql (the second answer costs one 피스), 20271126050000_hidden_word_avg_ranking.sql
// (avg + 0.3 × matches up to 20, ranked from 3), src/lib/hiddenWord.ts (1–8 Hangul letters) and the HiddenWordGuide
// messages. The similarity numbers in the worked example were read from the live hw_score / hw_hints tables for 포도.
// Word sets: 20271127000000_hidden_word_levels.sql (기본 60 words as before; 확장 186 words in 30 look-alike groups,
// hw_level_cfg: same rules and points, MORA gives one warm-up of 70–82 / 78–88 / 85–93 % and closes with hints from the
// shared end at every stage; separate ranking; friend rooms pick a set), scripts/hidden-word/README.md for the model.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'hiddenWord',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['equationSignal', 'colorLinkDuel', 'gradation', 'equationTower'],
  inlineNamespace: 'HiddenWordGuide',
  ko: {
    meta: {
      title: '히든 워드 공략 — 데블스플랜3 5화 유사도 단어 게임, 힌트 고르기와 정답 좁히기 | PUZZLTHINK',
      description: '데블스 플랜 3 5화 메인매치 히든 워드, 어떤 힌트를 내야 안 들키고 어떻게 정답을 좁힐까요? 승점표, 95% 힌트 한 번에 끝내기, 낮은 유사도 읽는 법, 실제 유사도로 따라 푸는 예시, 모라 AI가 추리하는 방식까지 정리했어요.',
      keywords: ['히든 워드 공략', '히든워드 공략', '히든 워드 규칙', '데블스플랜3 히든워드', '데블스 플랜 3 5화', '유사도 단어 게임', '히든 워드 힌트', '꼬맨틀', '단어 유사도 게임'],
    },
    title: '히든 워드 공략',
    lead: '95%를 넘기는 힌트 하나. 그게 상대에게 가장 적게 알려 주는 방법이에요.',
    intro: [
      '히든 워드는 내 단어는 숨기고 상대의 단어는 찾아내는 단어 심리전이에요. 출제자가 힌트를 낼 때마다 그 힌트가 숨긴 단어와 얼마나 가까운지가 **0~100% 유사도**로 공개되고, 95% 이상인 힌트가 나오면 힌트가 끝나요. 맞히는 쪽은 공개된 힌트와 숫자만 보고 정답을 추리해요. 빨리 맞힐수록, 반대로 오래 버틸수록 승점이 커요.',
      '이 공략은 규칙을 한 번 본 사람을 위한 거예요. 승점이 어디서 갈리는지, 출제할 때 힌트를 몇 개 내야 하는지, 낮은 유사도를 어떻게 읽는지, 그리고 실제 게임의 유사도 숫자로 정답을 좁혀 가는 과정을 따라가 봐요. 상대 AI "모라"가 무엇을 보고 추리하는지도 정리했어요.',
    ],
    gamePageTitle: '히든 워드 온라인 — 데블스 플랜 3 5화 메인매치, 유사도로 단어를 맞히는 게임',
    summary: '승점표, 95% 힌트 한 번에 끝내기, 낮은 유사도 읽기, 실제 숫자로 따라 풀기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '히든 워드는 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3) 5화 메인매치로 나온 게임이에요. PUZZLTHINK에서는 그 규칙을 바탕으로 AI "모라"와 번갈아 출제하고 추리하는 **1:1 승점전**으로 만들었어요. 유사도 숫자로 단어를 맞힌다는 점은 꼬맨틀 같은 단어 유사도 게임과 닮았지만, 여기서는 **상대가 힌트를 고른다**는 점이 달라요. 출제자는 숫자가 높으면서도 정답을 드러내지 않는 단어를 골라야 해요.' },
          { type: 'p', text: '유사도는 미리 계산해 둔 단어 벡터, 국립국어원 우리말샘의 비슷한말·상위어·반대말, 숨긴 단어마다 만들어 둔 연상표를 합쳐서 매겨요. 대전 중에는 AI를 호출하지 않고, 모라의 단어는 대전이 끝나기 전까지 서버 밖으로 나오지 않아요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**봉투**: 시작할 때 봉투 6개 중 하나를 골라요. 봉투에는 명사 5개가 들어 있고, 비슷한 단어끼리 묶인 무리에서 한 무리당 하나씩만 들어 있어요. 1라운드에 1개, 2라운드에 남은 4개 중 1개를 히든 워드로 써요.',
            '**라운드와 순서**: 2라운드예요. 라운드마다 내가 한 번 출제하고 한 번 맞혀요. 1라운드 순서는 추첨이고, 2라운드는 1라운드와 반대 역할로 시작해요.',
            '**힌트 제시**: 출제자는 한 차에 힌트를 최대 5개, 2분 안에 내요. 힌트마다 유사도가 공개되고, **95% 이상**이 나오는 순간 그 차의 힌트가 끝나요. 5개를 다 쓰거나 2분이 지나도 95%를 못 넘기면, 연상표에서 히든 워드와 가장 가까운 단어가 대신 공개돼요.',
            '**정답 유추**: 힌트가 끝나면 상대가 75초 안에 답을 내요. 틀리면 출제자가 승점을 받고 다음 차로 넘어가요. 3차까지 가요.',
            '**승점**: 출제자는 버틴 차마다 1차 1점, 2차 2점, 3차 3점. 맞히는 쪽은 1차 6점, 2차 3점, 3차 1점. 2라운드는 모두 2배예요.',
            '**두 번째 답**: 단어마다 한 번, 경쟁전 피스 1개를 쓰면 답을 2개 낼 수 있어요(로그인 필요).',
            '**낼 수 있는 단어**: 띄어쓰기 없는 한글 1~8자, 약 7만 4천 개의 명사와 명사형이에요. 히든 워드 자체, 이미 나온 힌트와 답은 다시 낼 수 없어요.',
          ] },
          { type: 'table', caption: '한 단어에서 나올 수 있는 승점 (1라운드 기준, 2라운드는 2배)', head: ['결과', '출제자', '맞힌 사람'], rows: [
            ['1차에 맞힘', '0', '6'],
            ['2차에 맞힘', '1', '3'],
            ['3차에 맞힘', '1 + 2 = 3', '1'],
            ['끝까지 못 맞힘', '1 + 2 + 3 = 6', '0'],
          ] },
          { type: 'p', text: '한 판 만점은 36점이에요. 1라운드에 출제 6점 + 추리 6점, 2라운드에 그 두 배인 24점이에요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙',
        blocks: [
          { type: 'cards', items: [
            { title: '낮게 나온 힌트도 다 보여요', body: '95%를 노리고 낸 단어가 80%로 나와도 그대로 상대 화면에 남아요. 힌트는 많이 낼수록 상대의 단서가 늘어나요.' },
            { title: '힌트는 정답이 아니에요', body: '출제자는 히든 워드를 힌트로 낼 수 없어서, 화면에 나온 힌트 단어는 정답 후보에서 지워도 돼요. 답으로 내려 해도 받아 주지 않아요.' },
            { title: '오답에도 숫자가 붙어요', body: '틀린 답은 히든 워드와의 유사도가 함께 공개돼요. 내 오답이 88%였다면 "같은 무리의 다른 단어"라는 강한 단서예요. 모라도 자기 오답의 숫자를 단서로 써요.' },
            { title: '시간이 지나면 공개되는 단어', body: '95%를 못 넘긴 채 힌트 5개나 2분을 다 쓰면, 연상표에서 가장 가까운 단어가 자동으로 공개돼요. 이 단어는 보통 정답과 아주 가까워서 출제자에게 불리해요.' },
            { title: '모라의 단어는 내 봉투에 없어요', body: '모라가 숨기는 단어는 내 봉투 5개가 아닌 단어 중에서, 서로 다른 무리 두 곳에서 하나씩 뽑혀요. 내 손에 있는 단어는 답에서 빼도 돼요.' },
            { title: '합성어 힌트', body: '히든 워드를 품은 합성어(딸기 → 딸기잼)는 낼 수 있지만, 사실상 정답을 알려 주는 셈이에요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 출제는 한 방에, 추리는 무리부터',
        blocks: [
          { type: 'h3', text: '출제: 95%를 넘기는 힌트 하나로 끝내기' },
          { type: 'p', text: '힌트가 95%를 넘기는 순간 그 차가 끝나요. 그러니 **첫 힌트로 95%를 넘기는 것**이 상대에게 정보를 가장 적게 주는 방법이에요. 80%짜리 힌트를 여러 개 흘리면 상대는 그 단어들이 함께 가리키는 곳을 보고 금방 좁혀요. 확실히 95%가 나올 것 같은 단어, 그중에서도 **여러 단어에 똑같이 어울리는 단어**를 먼저 내세요.' },
          { type: 'p', text: '예를 들어 "포도"를 지킬 때 "과일"은 포도에 95%예요. 그런데 사과·딸기·수박·배에도 모두 96.5%로 나오는 단어라, 이 힌트 하나로는 과일 중 어느 것인지 알 수 없어요. 반대로 "와인"은 포도에 98%로 높지만 와인과 이어지는 과일은 사실상 포도 하나뿐이에요.' },
          { type: 'h3', text: '추리: 먼저 무리를 정하고, 그다음 하나를 고르기' },
          { type: 'list', items: [
            '**95% 힌트로 무리 정하기**: 마지막 힌트는 정답과 아주 가까운 단어예요. 그 단어가 가리키는 무리(과일, 동물, 탈것…)부터 정해요.',
            '**낮은 힌트로 하나 고르기**: 앞에 나온 70~80%대 힌트는 무리 안의 어느 단어인지를 알려 줘요. 무리의 후보 하나하나에 그 힌트가 어울리는지 대어 보세요.',
            '**기본 명사로 답하기**: 히든 워드는 일상에서 흔히 쓰는 기본 명사예요. 어려운 단어나 합성어보다 "사과", "기차" 같은 단어가 정답일 가능성이 커요.',
            '**1차를 아끼지 않기**: 1차에 맞히면 6점, 2차는 3점이에요. 후보가 두셋으로 좁혀졌다면 1차에 과감히 답하는 게 기대 점수가 커요. 틀려도 그 오답의 유사도가 다음 차의 단서가 돼요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 풀기 — 실제 유사도로 정답 좁히기',
        lead: '모라가 "포도"를 숨겼을 때 나올 수 있는 힌트예요. 숫자는 게임의 유사도 표에서 그대로 가져왔어요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1차 힌트: 여우 85%, 과일 95%', body: '마지막 힌트 "과일"이 95%라 정답은 과일 무리일 가능성이 커요. 그런데 과일 이름만으로는 사과·딸기·수박·배·포도 중 무엇인지 알 수 없어요. 열쇠는 그 앞의 **"여우 85%"**예요. 과일 하나와 여우가 이만큼 가깝다는 건 흔한 일이 아니에요.' },
            { title: '후보마다 대어 보기', body: '"여우"와 가장 잘 어울리는 과일은 이솝 우화 「여우와 신 포도」의 포도예요. 실제로 "여우"의 유사도는 포도 85%, 딸기 54.7%, 사과 29.1%, 배 25.3%, 수박 12.5%예요. 85%는 포도 말고는 나올 수 없는 숫자예요.' },
            { title: '1차에 "포도"로 답하기', body: '확신이 들면 1차에 답해요. 맞히면 6점(2라운드면 12점)이에요. 만약 사과로 답해 틀렸다면 "사과 88%"가 공개되고, 출제자가 1점을 가져가요. 88%는 "같은 무리의 다른 단어"라는 뜻이라 과일 무리가 확정돼요.' },
            { title: '2차로 넘어갔다면', body: '모라의 2차 힌트는 80~91% 사이 한두 개와, 1차보다 정답 쪽으로 좁혀진 95% 이상 하나예요. 예를 들어 "넝쿨 95%"가 나오면, 넝쿨은 포도 95%, 수박 82%, 딸기 73.4%, 사과 33.7%, 배 20.3%라 덩굴 열매인 포도·수박 쪽으로 기울어요. 3차 힌트는 거의 정답 하나에만 맞는 단어가 나와요.' },
          ] },
          { type: 'table', caption: '같은 힌트가 후보마다 몇 %로 나오는지 (게임의 유사도 표)', head: ['힌트', '포도', '딸기', '사과', '배', '수박'], rows: [
            ['과일', '95', '96.5', '96.5', '96.5', '96.5'],
            ['여우', '85', '54.7', '29.1', '25.3', '12.5'],
            ['넝쿨', '95', '73.4', '33.7', '20.3', '82'],
            ['송이', '96.5', '78.5', '51.2', '90', '31.6'],
            ['보라색', '93', '49.2', '41.1', '50.4', '28.7'],
          ] },
          { type: 'callout', tone: 'tip', title: '표를 읽는 법', text: '"과일"처럼 모든 후보에서 비슷한 숫자가 나오는 힌트는 무리만 알려 주고, "여우"처럼 후보마다 숫자가 크게 갈리는 힌트가 하나를 골라 줘요. 출제할 때는 앞의 것을, 추리할 때는 뒤의 것을 찾으세요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 모라가 단서를 읽는 방식 이용하기',
        blocks: [
          { type: 'p', text: '모라는 점수표를 보지 않고, 단어 사이의 뜻이 얼마나 가까운지로 추리해요. 공개된 힌트(그리고 자기 오답)마다 유사도에서 60을 뺀 만큼 무게를 주고, 정답 후보 목록의 단어 가운데 그 무게가 가장 잘 맞는 단어를 골라요. 여기서 두 가지가 나와요.' },
          { type: 'list', items: [
            '**60%보다 높은 힌트는 끌어당겨요**: 높게 나온 힌트일수록, 그 힌트와 뜻이 가까운 후보로 모라의 답이 쏠려요. 여러 후보에 고르게 가까운 힌트를 내면 모라는 그중 하나를 찍게 돼요.',
            '**60%보다 낮은 힌트는 밀어내요**: 낮게 나온 힌트는 "정답은 이 단어와 거리가 멀다"는 단서로 읽혀요. 정답과 먼 단어를 일부러 내면 그 단어와 가까운 후보가 지워지니, 오히려 정답이 드러날 수 있어요.',
            '**2차부터 답 2개**: 모라도 2차부터는 가장 그럴듯한 두 단어의 점수가 비슷하면 답을 2개 내요. 2차에 무리 안의 두 후보가 비슷해 보이게 만드는 힌트는 위험해요.',
          ] },
          { type: 'h3', text: '다의어는 방패가 돼요' },
          { type: 'p', text: '배(과일·배·몸), 눈(얼굴·날씨), 다리처럼 뜻이 여럿인 단어는 다른 뜻 쪽 힌트로 95%를 넘길 수 있어요. 상대의 추리가 엉뚱한 무리로 빠지기 쉬워서, 봉투에 다의어가 있다면 출제용으로 아껴 두세요.' },
          { type: 'h3', text: '세 차의 힌트를 미리 정하기' },
          { type: 'p', text: '한 단어를 3차까지 지키려면 95%를 넘기는 힌트가 세 개 필요하고, 같은 힌트는 다시 쓸 수 없어요. 단어를 고를 때 "무리 전체에 두루 맞는 힌트"를 세 개쯤 떠올릴 수 있는지 먼저 따져 보세요. 1차에 가장 넓은 힌트, 3차에 가장 좁은 힌트를 쓰는 순서가 버티기 좋아요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 점수 계산과 피스 쓰는 시점',
        blocks: [
          { type: 'h3', text: '2라운드가 절반 이상이에요' },
          { type: 'p', text: '2라운드는 모든 점수가 2배라 만점 36점 중 24점이 2라운드에 걸려 있어요. 1라운드에는 쉬운 단어로 감을 잡고, 봉투에서 가장 지키기 좋은 단어(다의어, 무리 전체에 두루 맞는 힌트가 많은 단어)를 2라운드용으로 남겨 두세요.' },
          { type: 'h3', text: '피스는 2차에' },
          { type: 'p', text: '두 번째 답은 단어마다 한 번이고 피스 1개가 들어요. 1차에는 후보가 많아 두 개를 내도 맞을 확률이 낮고, 3차는 맞혀도 1점뿐이에요. 1차 힌트와 오답으로 후보가 둘로 좁혀진 **2차**(3점, 2라운드는 6점)에 쓰는 게 기대 승점이 가장 커요.' },
          { type: 'h3', text: '모라의 힌트 패턴 읽기' },
          { type: 'p', text: '모라는 차마다 70~90%대 힌트 한두 개를 먼저 내고, 마지막에 95% 이상 하나로 마무리해요. 1차 마무리 힌트는 후보 목록에서 **가장 많은 단어에 두루 맞는** 것, 3차 마무리는 **가장 적은 단어에 맞는** 것이에요. 그래서 1차 95% 힌트는 무리만, 앞의 낮은 힌트가 단어를 알려 줄 때가 많아요. 3차까지 왔다면 마무리 힌트 하나가 거의 정답을 가리켜요.' },
          { type: 'h3', text: '랭킹 점수' },
          { type: 'p', text: '랭킹 점수는 한 판 평균 승점에 끝낸 판마다 0.3점(20판까지, 최대 +6)을 더한 값이에요. 평균 19.5점으로 6판을 끝냈다면 19.5 + 1.8 = 21.3점이에요. 로그인하고 3판을 끝내면 순위에 올라요. 판수 보너스는 20판에서 멈추니, 그 뒤로는 평균을 올리는 게 전부예요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**힌트를 조금씩 흘리기**: 확신 없는 단어로 시작해 70%, 80%를 쌓으면 상대에게 지도를 그려 주는 셈이에요.',
            '**너무 정확한 힌트**: 98%짜리 힌트는 안전해 보이지만 정답 하나만 가리키는 경우가 많아요(포도의 "와인"). 95%를 넘기면 충분해요.',
            '**2분을 넘기기**: 시간이 지나면 연상표에서 가장 가까운 단어가 공개되는데, 그건 내가 고른 단어보다 훨씬 정답에 가까워요.',
            '**힌트 단어로 답하기**: 화면에 나온 힌트는 정답이 될 수 없어요. 무리의 다른 단어를 찾으세요.',
            '**오답 숫자 무시하기**: 내 오답의 유사도도 단서예요. 85% 이상이면 같은 무리, 60% 아래면 무리부터 다시 생각하세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드 메모',
        blocks: [
          { type: 'p', text: 'AI 모라와 두는 1:1 승점전과, 링크나 코드로 친구를 부르는 1:1 방이 있어요. 로그인하지 않아도 둘 수 있지만, 랭킹 기록과 피스 사용은 로그인해야 해요. 로그인하지 않은 채 시작한 대전도 끝내기 전에 로그인하면 그 계정의 기록으로 남아요. 친구 대전은 랭킹에 들어가지 않아요.' },
          { type: 'p', text: '봉투를 고르기 전에 **단어 세트**를 골라요. **기본**은 60단어로 과일·동물·날씨처럼 익숙한 묶음에 방송에 나온 단어가 들어 있어요. **확장**은 186단어로 감정(기쁨·슬픔·질투…), 직업, 장소, 음식, 문화, 과학, 계절(봄·여름·아침·새벽…)처럼 **서로 닮은 단어끼리 한 묶음**이라, 95% 힌트 하나로는 무리까지만 좁혀지는 일이 많아요. 모라도 확장에서는 데우기 힌트를 하나만 내고, 2·3차에도 무리 전체에 들어맞는 쪽의 힌트로 마무리해요. 규칙과 승점은 같고, 랭킹은 세트마다 따로예요.' },
          { type: 'p', text: '확장에서 추리할 때는 **오답의 숫자**가 더 중요해져요. 같은 무리의 오답은 85% 이상으로 나오기 쉬우니, 1차에 무리를 확신하면 2차에 그 무리 안에서 가장 다른 단어를 골라 숫자로 갈라 보세요. 출제할 때는 내 단어만의 뜻(다의어라면 다른 뜻)으로 95%를 넘기는 힌트가 무리를 숨기기에 좋아요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '히든 워드', def: '출제자가 숨긴 단어. 봉투의 명사 5개 중에서 골라요.' },
            { term: '유사도', def: '어떤 단어가 히든 워드와 얼마나 가까운지를 0~100%로 나타낸 숫자.' },
            { term: '차', def: '힌트 제시와 정답 유추 한 번. 한 단어에 3차까지 가요.' },
            { term: '컷(95%)', def: '이 숫자 이상인 힌트가 나오면 그 차의 힌트가 끝나요.' },
            { term: '무리', def: '비슷한 단어끼리 묶인 정답 후보 묶음(과일, 동물, 탈것 등). 봉투에는 한 무리에서 하나만 들어가요.' },
            { term: '피스', def: '경쟁전에서 모으는 조각. 히든 워드에서는 두 번째 답을 낼 때 1개를 써요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '히든 워드는 어떤 방송에 나온 게임인가요?', a: '넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3) 5화 메인매치로 나온 게임이에요. PUZZLTHINK의 히든 워드는 그 규칙을 바탕으로 AI와 1:1 승점전으로 다시 짠 비공식 팬 게임이에요.' },
      { q: '출제할 때 힌트는 몇 개 내는 게 좋나요?', a: '되도록 하나요. 95% 이상이 나오는 순간 그 차가 끝나니, 첫 힌트로 95%를 넘기면 상대가 볼 단서가 하나뿐이에요. 여러 단어에 두루 맞는 단어(포도를 지킬 때 "과일")가 가장 좋아요.' },
      { q: '유사도는 어떻게 계산하나요?', a: '미리 계산해 둔 단어 벡터, 국립국어원 우리말샘의 비슷한말·상위어·반대말, 히든 워드마다 만들어 둔 연상표를 합쳐 0~100%로 나타내요. 플레이 중에는 AI를 호출하지 않아요.' },
      { q: '어떤 단어를 힌트로 낼 수 있나요?', a: '띄어쓰기 없는 한글 1~8자, 사전에 있는 명사와 명사형(딱딱함, 물음)이에요. 약 7만 4천 단어를 알아봐요. 히든 워드 자체와 이미 나온 단어는 낼 수 없어요.' },
      { q: '모라가 내 단어를 미리 아는 건 아닌가요?', a: '아니에요. 모라는 공개된 힌트와 유사도만 보고, 단어 사이의 뜻이 얼마나 가까운지로 추리해요. 모라의 히든 워드도 대전이 끝나기 전에는 서버 밖으로 나오지 않아요.' },
      { q: '랭킹은 어떻게 매기나요?', a: '한 판 평균 승점에 끝낸 판마다 0.3점(20판까지, 최대 +6)을 더해요. 한 판 만점은 36점이고, 로그인하고 3판을 끝내면 순위에 올라요.' },
    ],
    cta: { title: '모라의 단어를 찾아볼까요?', body: '첫 힌트 하나로 95%를 넘기는 연습부터 해 보세요.', button: '히든 워드 하러 가기' },
    disclaimer: 'PUZZLTHINK의 히든 워드는 방송에 나온 게임 규칙을 참고해 만든 비공식 팬 게임이며, 해당 프로그램 및 제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: "Hidden Word strategy — The Devil's Plan 3 episode 5 similarity word game | PUZZLTHINK",
      description: "Hidden Word from The Devil's Plan 3, episode 5: which hints keep your word safe and how to narrow down the opponent's. The points table, ending on one 95% hint, reading low scores, a worked example with real similarity numbers, and how the AI Mora reasons.",
      keywords: ['Hidden Word strategy', 'Hidden Word rules', "Devil's Plan 3 Hidden Word", "Devil's Plan episode 5", 'word similarity game', 'Korean word guessing game'],
    },
    title: 'Hidden Word strategy guide',
    lead: 'One hint that clears 95% — the least you can possibly tell your opponent.',
    intro: [
      "Hidden Word is a word duel: hide your own word, find the other side's. Each time the setter gives a hint, its **similarity to the hidden word (0–100%)** is shown, and a hint at 95% or more ends the hints. The guesser reasons from the hints and their numbers alone. The sooner you guess, or the longer you hold out, the more points you score. The words are Korean nouns.",
      'This guide is for players who have read the rules once. It covers where the points are decided, how many hints to give as setter, how to read low numbers, and a worked example narrowing an answer with the game’s real similarity numbers. It also explains what the AI opponent, Mora, looks at when it guesses.',
    ],
    gamePageTitle: "Hidden Word online — The Devil's Plan 3 episode 5 main match, the similarity word game",
    summary: 'The points table, ending on one 95% hint, reading low numbers, a worked example.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "Hidden Word was the main match of episode 5 of Netflix's The Devil's Plan: Dead Again (season 3). PUZZLTHINK turns its rules into a **one-on-one point match** against an AI called Mora, taking turns to set and guess. Guessing a word from similarity scores is familiar from word-similarity puzzles, but here **your opponent chooses the hints**: a setter wants words that score high without giving the answer away." },
          { type: 'p', text: "Similarity combines precomputed word vectors, synonyms, broader terms and antonyms from the National Institute of Korean Language's Urimalsaem dictionary, and an association list made for each hidden word. No AI is called during play, and Mora's word never leaves the server until the match is over." },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Envelopes**: at the start pick one of 6 envelopes. It holds 5 nouns, at most one from each group of look-alike words. You hide one in round 1 and one of the remaining four in round 2.',
            '**Rounds and order**: there are 2 rounds; in each you set once and guess once. Round 1’s order is drawn at random, and round 2 starts with the opposite role.',
            '**Hints**: the setter gives up to 5 hints per stage within 2 minutes. Each hint’s similarity is shown, and the stage’s hints end **the moment one scores 95% or more**. If 5 hints or 2 minutes pass without one, the closest word on the hidden word’s association list is revealed instead.',
            '**Guessing**: after the hints, the other side answers within 75 seconds. A miss gives the setter points and moves on to the next stage, up to stage 3.',
            '**Points**: the setter earns 1, 2 and 3 points for surviving stages 1, 2 and 3. The guesser earns 6, 3 or 1 for a right answer at stage 1, 2 or 3. Everything is doubled in round 2.',
            '**A second answer**: once per word you may spend one contest piece to give two answers (signed in only).',
            '**Allowed words**: 1–8 Hangul letters without spaces, about 74,000 nouns and noun forms. The hidden word itself and words already shown cannot be used again.',
          ] },
          { type: 'table', caption: 'Points from one word (round 1; doubled in round 2)', head: ['Outcome', 'Setter', 'Guesser'], rows: [
            ['Guessed at stage 1', '0', '6'],
            ['Guessed at stage 2', '1', '3'],
            ['Guessed at stage 3', '1 + 2 = 3', '1'],
            ['Never guessed', '1 + 2 + 3 = 6', '0'],
          ] },
          { type: 'p', text: 'A perfect match is 36 points: 6 for setting and 6 for guessing in round 1, and twice that, 24, in round 2.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rules',
        blocks: [
          { type: 'cards', items: [
            { title: 'Low hints stay visible', body: 'A word you hoped would hit 95% but scored 80% stays on your opponent’s screen. Every extra hint is another clue for them.' },
            { title: 'A hint is never the answer', body: 'The setter cannot use the hidden word as a hint, so every hint on the board can be crossed off. The game will not even accept one as an answer.' },
            { title: 'Wrong answers show a number', body: 'A wrong answer is shown with its similarity to the hidden word. An 88% miss means "another word from the same group" — a strong clue. Mora uses its own misses the same way.' },
            { title: 'The revealed word', body: 'If 5 hints or 2 minutes pass without a 95% hint, the closest word on the association list is revealed. It is usually very close to the answer — bad news for the setter.' },
            { title: 'Mora’s word is never in your envelope', body: 'Mora’s words are drawn from words not in your envelope, one each from two different groups. Your own five words can be ruled out.' },
            { title: 'Compound hints', body: 'A compound that contains the hidden word (strawberry → strawberry jam) is allowed, but it all but gives the answer away.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — set in one shot, guess the group first',
        blocks: [
          { type: 'h3', text: 'Setting: finish with a single hint over 95%' },
          { type: 'p', text: 'The stage ends the moment a hint scores 95% or more, so **clearing 95% with your first hint** gives the least away. A string of 80% hints lets your opponent triangulate. Lead with a word you are sure will reach 95% — ideally one that **fits many words equally well**.' },
          { type: 'p', text: 'Guarding 포도 (grape), for example, the hint 과일 (fruit) scores 95% — but it scores 96.5% for apple, strawberry, watermelon and pear too, so on its own it does not say which fruit. 와인 (wine) scores higher, 98%, but the only fruit tied to wine is the grape.' },
          { type: 'h3', text: 'Guessing: pick the group, then the word' },
          { type: 'list', items: [
            '**Use the 95% hint for the group**: the last hint is very close to the answer. Settle the group it points to (fruit, animals, vehicles…) first.',
            '**Use the lower hints for the word**: the 70–80% hints before it tell you which member of the group it is. Test each candidate against them.',
            '**Answer with plain nouns**: hidden words are basic everyday nouns. Something like "apple" or "train" is far likelier than a rare word or a compound.',
            '**Do not waste stage 1**: stage 1 pays 6, stage 2 only 3. With two or three candidates left, answering at stage 1 has the better expected score — and a miss still gives you its number as a clue.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — narrowing it down with real numbers',
        lead: 'Hints Mora could give when it hides 포도 (grape). The numbers are taken from the game’s similarity table.',
        blocks: [
          { type: 'steps', items: [
            { title: 'Stage 1 hints: 여우 (fox) 85%, 과일 (fruit) 95%', body: 'The closing hint "fruit" at 95% says the answer is probably a fruit — but not which: apple, strawberry, watermelon, pear, grape… The key is the earlier **"fox" at 85%**. A fruit that close to "fox" is unusual.' },
            { title: 'Test each candidate', body: 'The fruit everyone links to a fox is the grape of Aesop’s "The Fox and the Grapes". The table agrees: "fox" scores 85% for grape, 54.7% for strawberry, 29.1% for apple, 25.3% for pear and 12.5% for watermelon. Only grape gives 85%.' },
            { title: 'Answer 포도 at stage 1', body: 'If you are sure, answer now: 6 points (12 in round 2). Had you answered apple instead, "apple 88%" would be shown and the setter would take 1 point — and 88% confirms the fruit group.' },
            { title: 'If it goes to stage 2', body: 'Mora’s stage-2 hints are one or two between 80% and 91%, then one at 95%+ that points more narrowly than stage 1’s. "넝쿨 (vine) 95%", for instance, scores 95% for grape, 82% for watermelon, 73.4% for strawberry, 33.7% for apple and 20.3% for pear — it leans to the vine fruits. By stage 3 the closing hint fits almost nothing but the answer.' },
          ] },
          { type: 'table', caption: 'The same hint scored against each candidate (the game’s similarity table)', head: ['Hint', 'Grape', 'Strawberry', 'Apple', 'Pear', 'Watermelon'], rows: [
            ['과일 fruit', '95', '96.5', '96.5', '96.5', '96.5'],
            ['여우 fox', '85', '54.7', '29.1', '25.3', '12.5'],
            ['넝쿨 vine', '95', '73.4', '33.7', '20.3', '82'],
            ['송이 bunch', '96.5', '78.5', '51.2', '90', '31.6'],
            ['보라색 purple', '93', '49.2', '41.1', '50.4', '28.7'],
          ] },
          { type: 'callout', tone: 'tip', title: 'How to read the table', text: 'A hint that scores about the same for every candidate, like "fruit", only tells you the group. A hint whose number swings between candidates, like "fox", picks the word. As setter look for the first kind; as guesser, for the second.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — use the way Mora reads clues',
        blocks: [
          { type: 'p', text: 'Mora never reads the score table; it reasons from how close words are in meaning. Each shown hint (and each of its own misses) is weighted by its similarity minus 60, and Mora picks the word from the candidate list that fits those weights best. Two things follow.' },
          { type: 'list', items: [
            '**Hints above 60% pull**: the higher a hint scores, the more Mora leans toward candidates close in meaning to it. A hint that is close to several candidates equally leaves Mora guessing among them.',
            '**Hints below 60% push**: a low hint reads as "the answer is far from this". Throwing in an unrelated word rules out the candidates near it — and can end up exposing the answer.',
            '**Two answers from stage 2**: from stage 2 Mora also answers twice when its two best words score about the same. A stage-2 hint that makes two members of the group look alike is risky.',
          ] },
          { type: 'h3', text: 'Words with several meanings are shields' },
          { type: 'p', text: 'Words like 배 (pear, boat, belly), 눈 (eye, snow) or 다리 (leg, bridge) can clear 95% with a hint from the other meaning, sending the guesser to the wrong group. If your envelope has one, keep it for setting.' },
          { type: 'h3', text: 'Plan all three stages' },
          { type: 'p', text: 'Holding a word to stage 3 takes three different hints over 95%, and no hint can be reused. Before you pick a word, check that you can think of about three hints that fit the whole group. Spend the broadest one at stage 1 and the narrowest at stage 3.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — the score and when to spend a piece',
        blocks: [
          { type: 'h3', text: 'Round 2 is more than half' },
          { type: 'p', text: 'Everything doubles in round 2, so 24 of the 36 possible points are there. Use an easy word to warm up in round 1 and keep the most defensible word in your envelope — one with several meanings, or many hints that fit its whole group — for round 2.' },
          { type: 'h3', text: 'Spend the piece at stage 2' },
          { type: 'p', text: 'The second answer is once per word and costs a piece. At stage 1 there are too many candidates for two answers to help much, and stage 3 pays just 1. **Stage 2** — 3 points, 6 in round 2 — after the first hints and a miss have cut it to two candidates, gives the best expected return.' },
          { type: 'h3', text: 'Read Mora’s hint pattern' },
          { type: 'p', text: 'Each stage Mora gives one or two hints in the 70–90% range, then closes with one at 95%+. The stage-1 closer is the hint that **fits the most words** on the candidate list; the stage-3 closer fits **the fewest**. So at stage 1 the 95% hint usually gives only the group and the low hints before it give the word; by stage 3 the closer all but names the answer.' },
          { type: 'h3', text: 'The ranking score' },
          { type: 'p', text: 'Your ranking score is your average points per match plus 0.3 per finished match, up to 20 matches (at most +6). An average of 19.5 over 6 matches gives 19.5 + 1.8 = 21.3. Sign in and finish 3 matches to be ranked. The bonus stops at 20 matches; after that only your average moves you up.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Leaking hints**: starting with unsure words and piling up 70s and 80s draws your opponent a map.',
            '**Hints that are too exact**: a 98% hint feels safe but often points at one word only (wine for grape). Clearing 95% is enough.',
            '**Running past 2 minutes**: the word revealed on timeout is far closer to the answer than anything you would have chosen.',
            '**Answering with a hint**: a hint on the board is never the answer. Look for another member of its group.',
            '**Ignoring your misses**: a wrong answer’s number is a clue too. 85% or more means the same group; under 60%, rethink the group.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes',
        blocks: [
          { type: 'p', text: 'There is the one-on-one point match against Mora and a one-on-one room you open for a friend with a link or a code. You can play signed out, but rankings and pieces need an account; a match started signed out counts for you if you sign in before it ends. Friend matches are not ranked.' },
          { type: 'p', text: 'Before the envelopes you pick a **word set**. **Basic** has 60 words in familiar groups (fruit, animals, weather) including the show’s own words. **Expansion** has 186 words where **look-alike words share a group**: feelings (joy, sadness, jealousy…), jobs, places, food, culture, science, seasons and times of day, so a single 95% hint often narrows it down to the group and no further. Mora also gives just one warm-up hint there and closes every stage with a hint that suits the whole group. Same rules and points; each set has its own ranking.' },
          { type: 'p', text: 'In Expansion, **the numbers on wrong answers** matter more. A wrong answer from the right group easily scores 85% or more, so once you are sure of the group, use stage 2 on the member most unlike the others and let the number split the rest. When setting, a 95% hint that only your word has (another meaning, if it has one) hides the group best.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Hidden word', def: 'The word the setter hides, chosen from the five nouns in the envelope.' },
            { term: 'Similarity', def: 'How close a word is to the hidden word, from 0 to 100%.' },
            { term: 'Stage', def: 'One round of hints and one answer. A word lasts up to 3 stages.' },
            { term: 'Cut (95%)', def: 'A hint at or above this ends the stage’s hints.' },
            { term: 'Group', def: 'A bundle of look-alike candidate words (fruit, animals, vehicles…). An envelope holds at most one from each.' },
            { term: 'Piece', def: 'A token collected in the contest; in Hidden Word one buys a second answer.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Which show is Hidden Word from?', a: "It was the main match of episode 5 of Netflix's The Devil's Plan: Dead Again (season 3). PUZZLTHINK's Hidden Word is an unofficial fan game that rebuilds those rules as a one-on-one point match against an AI." },
      { q: 'How many hints should I give as setter?', a: 'Ideally one. The stage ends as soon as a hint reaches 95%, so if your first hint clears it your opponent has a single clue. A word that fits many candidates equally ("fruit" when guarding grape) is best.' },
      { q: 'How is similarity calculated?', a: "It combines precomputed word vectors, synonyms, broader terms and antonyms from the Urimalsaem dictionary, and an association list made for each hidden word, shown as 0–100%. No AI is called during play." },
      { q: 'Which words can I use as hints?', a: 'Korean nouns and noun forms of 1–8 Hangul letters without spaces — about 74,000 words. The hidden word itself and words already shown are not allowed.' },
      { q: 'Does Mora know my word in advance?', a: 'No. Mora sees only the shown hints and their numbers and reasons from how close words are in meaning. Its own hidden word never leaves the server until the match is over.' },
      { q: 'How does the ranking work?', a: 'Average points per match plus 0.3 per finished match, up to 20 matches (at most +6). A perfect match is 36 points; sign in and finish 3 matches to be ranked.' },
    ],
    cta: { title: 'Ready to find Mora’s word?', body: 'Practise clearing 95% with your very first hint.', button: 'Play Hidden Word' },
    disclaimer: 'PUZZLTHINK’s Hidden Word is an unofficial fan game based on the rules shown on the programme and is not affiliated with the programme or its producers.',
  },
};
export default guide;
