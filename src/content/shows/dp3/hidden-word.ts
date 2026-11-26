import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'hidden-word',
  kind: 'main',
  when: { ko: '5일차', en: 'Day 5' },
  site: 'hiddenWord',
  related: ['hiddenWord', 'equationSignal', 'gyulhap'],
  updated: '2026-11-26',
  sources: [namuDay(5), siteEngine({ ko: '히든 워드', en: 'Hidden Word' }, 'src/lib/hiddenWord.ts'), broadcast],
  ko: {
    meta: {
      title: '히든 워드 규칙 — 데블스플랜3 5일차 메인매치, AI 유사도로 단어 맞히기',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 5일차 메인매치 히든 워드의 규칙을 정리했어요. 단어 봉투와 히든 워드, 힌트 제시와 AI 유사도, 95% 즉시 종료, 정답 유추와 피스, 1·2·3차 승점과 2라운드 2배, 그리고 승부를 가르는 지점까지.',
      keywords: ['히든 워드', '히든워드', '데블스플랜3 히든 워드', '데블스 플랜 3 5일차', '데블스플랜3 메인매치', '히든 워드 규칙', '유사도 게임'],
    },
    title: '히든 워드 — 데블스플랜3 5일차 메인매치',
    name: '히든 워드',
    lead: '내 단어를 설명하되 들키면 안 돼요. AI가 매긴 "유사도" 숫자만 보고 서로의 숨긴 단어를 맞히는 게임이에요.',
    summary: '힌트 단어와 숨긴 단어 사이의 AI 유사도를 보고 서로의 히든 워드를 맞히는 단어 심리전.',
    setup: [
      { type: 'list', items: [
        '**인원**: 다섯째 날 생존자 6명.',
        '**단어 봉투**: 시작 전 딜러룸에서, 고유명사가 아닌 명사 5개가 든 봉투 6개 중 하나를 골라요.',
        '**히든 워드**: 5개 중 하나를 1라운드의 히든 워드로 정해요. 2라운드에는 남은 4개 중 하나를 써요.',
        '**유사도**: 힌트와 히든 워드가 얼마나 가까운지를 AI 언어 모델이 숫자로 매겨요. 사전적 뜻이 얼마나 겹치는지, 같은 맥락에 얼마나 자주 함께 나오는지, 어떤 관계로 이어져 있는지를 종합한 값이에요.',
      ] },
    ],
    flow: [
      { type: 'p', text: '2라운드로 진행하고, 라운드마다 모두가 한 번씩 출제자가 돼요(순서는 추첨). 출제자 한 명의 차례는 **힌트 제시 → 정답 유추**를 최대 3차까지 반복해요.' },
      { type: 'steps', items: [
        { title: '힌트 제시', body: '출제자는 히든 워드와 관련된 한글 명사를 힌트로 내요. 낼 때마다 그 힌트의 유사도가 공개돼요. 15분 안에 최대 10개까지 낼 수 있고, 유사도 95% 이상인 힌트가 나오면 그 즉시 힌트 제시가 끝나요. 10개 안에 95%가 나오지 않으면 히든 워드와 가장 가까운 단어가 대신 공개돼요.' },
        { title: '정답 유추', body: '출제자를 뺀 모두가 5분 안에 답을 적어 동시에 공개해요. 피스 1개를 쓰면 답을 하나 더 적을 수 있어요(단어 하나에 피스 1개까지).' },
        { title: '맞히면', body: '맞힌 사람이 승점 1점을 얻고, 다음 사람이 출제자가 돼요.' },
        { title: '아무도 못 맞히면', body: '출제자가 승점을 얻고 다음 차 힌트 제시로 넘어가요. 1차에서 버티면 1점, 2차 2점, 3차 3점이에요.' },
      ] },
      { type: 'p', text: '모두가 출제를 마치면 1라운드가 끝나요. **2라운드는 모든 승점이 2배**예요.' },
    ],
    win: [
      { type: 'list', items: [
        '2라운드까지 끝난 뒤 승점으로 순위를 정해요.',
        '**1–2위는 생활동, 3–5위는 감옥동, 6위는 탈락**이에요.',
        '1위는 피스 4개를 받아요. 이 게임에는 연맹의 징표가 없었어요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '힌트는 한글 명사만 낼 수 있어요.',
        '95% 이상 힌트는 사실상 정답을 크게 드러내므로, 나오는 순간 힌트 제시가 강제로 끝나요.',
        '힌트를 잘 내도 낮은 유사도 숫자까지 모두 공개되기 때문에, 엉뚱한 힌트도 상대에게는 단서가 돼요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '히든 워드의 출제자는 **설명하면서 숨겨야** 해요. 힌트를 내야만 시간이 흐르고 유사도가 공개되는데, 공개된 숫자는 상대에게도 단서예요. 그래서 출제자에게 가장 좋은 힌트는 "내게는 정보지만 남에게는 정보가 아닌" 단어예요.' },
      { type: 'cards', items: [
        { title: '출제자의 점수 구조', body: '출제자는 한 차를 버틸 때마다 1·2·3점을 차례로 받아요. 세 차를 모두 버티면 6점(2라운드는 12점)이라, 출제자에게는 맞히기 어려운 단어를 고르는 것이 가장 큰 무기예요. 봉투 안 단어 5개 중 어떤 것을 1라운드에 쓰고 어떤 것을 승점이 2배인 2라운드에 아낄지도 전략이에요.' },
        { title: '유사도는 사람의 감각과 달라요', body: '유사도는 AI가 문장 속 쓰임을 보고 매긴 값이라, 사람이 보기엔 먼 단어가 높게 나오거나 그 반대일 수 있어요. 낮게 나온 힌트도 "이 방향은 아니다"라는 정보가 되므로, 맞히는 쪽은 높은 숫자만이 아니라 숫자들의 패턴 전체를 봐야 해요.' },
        { title: '맞히는 쪽의 딜레마', body: '맞히면 겨우 1점이지만, 못 맞히면 출제자가 점수를 쌓아요. 그래서 맞히는 쪽의 진짜 목적은 내 점수보다 **출제자의 점수를 막는 것**에 가까워요. 한 명만 맞혀도 출제가 끝나기 때문에, 나 말고 다른 사람이 맞혀도 나쁘지 않은 경우가 많아요.' },
        { title: '피스의 쓰임', body: '피스 한 개로 답을 하나 더 낼 수 있어서, 후보가 두 개로 좁혀졌을 때 가장 가치가 커요. 1위가 피스 4개를 받는 구조라, 피스를 쓸지 아낄지도 계산에 들어가요.' },
        { title: '지배 전략은 없어요', body: '유사도 계산 방식을 미리 알 수 없고 단어 목록도 봉투마다 달라서, 확실히 이기는 힌트 순서는 없어요. 다만 상위어(과일, 동물)처럼 범위를 넓게 여는 힌트는 출제자에게 불리하고, 같은 맥락에서 자주 함께 쓰이지만 뜻은 다른 단어가 출제자에게 유리한 경향이 있어요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 히든 워드는 방송 규칙을 바탕으로 한 **AI "모라"와의 1:1 승점전**이에요. 라운드마다 한 번은 내가 출제하고 한 번은 모라의 단어를 맞혀요.',
        '한 차의 힌트는 **5개, 2분**까지예요(방송은 10개, 15분). 95% 이상이면 즉시 끝나고, 시간이 지나면 가장 가까운 단어가 공개되는 것은 같아요.',
        '맞히는 쪽의 점수가 다르게 매겨져요. 사이트에서는 빨리 맞힐수록 큰 점수(1차 6점, 2차 3점, 3차 1점)를 받고, 방송은 맞힌 사람이 1점을 받아요. 출제자의 1·2·3점과 2라운드 2배는 같아요.',
        '유사도는 사이트가 쓰는 연상표 기준이라, 방송의 AI가 매긴 숫자와 같지 않아요.',
        '서로 닮은 단어 186개(30개 묶음)로 하는 **히든 워드 확장판**이 따로 있어요. 히든 워드는 방송에 나온 단어를 포함한 60단어로 하고, 확장판은 감정·직업·장소·문화처럼 닮은 단어끼리 묶여 조금 더 어려워요. 랭킹은 게임마다 따로예요.',
      ] },
    ],
    similar: [
      { name: '디크립토 (Decrypto)', players: '3–8명', alike: '우리 팀은 알아듣고 상대 팀은 못 알아듣게 단서를 내는 게임이라, "설명하면서 숨기는" 히든 워드의 출제자와 똑같은 고민을 해요.', differs: '디크립토는 팀전이고 숫자 암호를 맞히는 게임이에요. 유사도 같은 객관적인 숫자는 없어요.' },
      { name: '코드네임 (Codenames)', players: '2–8명', alike: '단어 하나로 여러 단어를 연상시키는 연상 게임이에요.', differs: '코드네임은 팀장이 우리 팀 단어를 찾게 돕는 협력 방향이라, 숨길 단어가 아니라 피해야 할 단어가 있어요.' },
      { name: '저스트 원 (Just One)', players: '3–7명', alike: '정답 단어를 한 단어 힌트로 맞히게 하는 단어 게임이에요.', differs: '저스트 원은 모두가 한 사람을 돕는 협력 게임이고, 같은 힌트는 지워져요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Hidden Word rules — The Devil's Plan 3, day 5 main match (guessing by AI similarity)",
      description: "The rules of Hidden Word from The Devil's Plan: Dead Again (season 3): word envelopes, hints and their AI similarity score, the 95% cut-off, guessing with an extra piece, scoring by stage and the doubled second round, and what decides it.",
      keywords: ['Hidden Word', "Devil's Plan 3 Hidden Word", "Devil's Plan main match", 'word similarity game'],
    },
    title: "Hidden Word — The Devil's Plan 3, day 5 main match",
    name: 'Hidden Word',
    lead: 'Describe your word without giving it away. Players guess each other’s hidden words from nothing but an AI’s similarity scores.',
    summary: 'Guess each other’s hidden words from the AI similarity between each hint and the secret word.',
    setup: [
      { type: 'list', items: [
        '**Players**: the 6 still in on day 5.',
        '**Envelopes**: in the dealer room each player picks one of six envelopes holding five common nouns (no proper nouns).',
        '**Hidden word**: one of the five is the round-1 hidden word; round 2 uses one of the remaining four.',
        '**Similarity**: an AI language model scores how close a hint is to the hidden word, combining overlap in meaning, how often the two appear in the same context, and how they relate.',
      ] },
    ],
    flow: [
      { type: 'p', text: 'Two rounds; in each, everyone is the setter once (order by draw). A setter’s turn repeats **hints → guesses** up to three times.' },
      { type: 'steps', items: [
        { title: 'Hints', body: 'The setter gives Korean nouns related to the hidden word, and each hint’s similarity is shown. Up to 10 hints in 15 minutes; a hint scoring 95% or more ends the hints at once. If none reaches 95%, the word closest to the hidden word is revealed instead.' },
        { title: 'Guesses', body: 'Everyone else writes a guess within five minutes, revealed together. A piece buys one extra guess (one piece per word).' },
        { title: 'A right guess', body: 'Whoever guessed it gets 1 point, and the next player becomes setter.' },
        { title: 'No right guess', body: 'The setter scores and moves to the next set of hints: 1 point for surviving the first, 2 for the second, 3 for the third.' },
      ] },
      { type: 'p', text: 'Round 1 ends when everyone has set a word. **Round 2 doubles every score.**' },
    ],
    win: [
      { type: 'list', items: [
        'Players rank by points after round 2.',
        '**Places 1–2 go to the living quarters, 3–5 to prison, and 6th is eliminated.**',
        'First place gets 4 pieces; this game had no Alliance token.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Hints must be Korean nouns.',
        'A 95%+ hint gives too much away, so it forces the hints to stop.',
        'Even low scores are shown, so a poor hint is still a clue for the guessers.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'The setter must **explain while hiding**. Only hints move the game on and reveal scores, and every score is a clue for the others too. The best hint is one that informs you and not them.' },
      { type: 'cards', items: [
        { title: 'The setter’s scoring', body: 'Surviving each stage pays 1, 2, then 3 — six points for all three (twelve in round 2). A hard word is the setter’s strongest weapon, and which of the five words to spend in round 1 and which to save for the doubled round 2 is a strategy in itself.' },
        { title: 'Similarity is not human intuition', body: 'The AI scores words by how they are used, so words that feel far apart can score high and vice versa. A low score still says "not this way", so guessers should read the whole pattern, not just the highest number.' },
        { title: 'The guesser’s dilemma', body: 'A right guess is only 1 point, but a miss lets the setter bank points. The real aim of guessing is closer to **stopping the setter** than scoring, and since one right guess ends the turn, someone else guessing it is often fine.' },
        { title: 'Using pieces', body: 'An extra guess is worth most when you are down to two candidates. With 4 pieces for first place, whether to spend one is part of the calculation.' },
        { title: 'No dominant strategy', body: 'The scoring model cannot be known in advance and each envelope differs, so no hint order is sure to win. Broad category words (fruit, animal) tend to help guessers, while words that share a context but not a meaning tend to help the setter.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Hidden Word is **a 1:1 points match against the AI "Mora"**, built on the broadcast rules: each round you set once and guess Mora’s word once.',
        'Each stage allows **5 hints in 2 minutes** (10 hints in 15 minutes on the show). The 95% stop and the closest-word reveal are the same.',
        'Guessing is scored differently: the faster you guess, the more you get (6, 3 or 1 point by stage), where on the show a right guess is worth 1. The setter’s 1-2-3 and the doubled round 2 are the same.',
        'Similarity comes from the site’s own association table, so its numbers are not the show’s.',
        'There is also **Hidden Word: Expansion**, a separate game with 186 look-alike words in 30 groups. Hidden Word plays 60 words including the show’s own; the Expansion groups look-alikes such as feelings, jobs, places and culture, and is a bit harder. Each has its own ranking.',
      ] },
    ],
    similar: [
      { name: 'Decrypto', players: '3–8', alike: 'Give clues your team understands and the other team does not — exactly the setter’s problem in Hidden Word.', differs: 'It is a team game about decoding number codes, with no objective score like similarity.' },
      { name: 'Codenames', players: '2–8', alike: 'One word has to bring several others to mind.', differs: 'The clue-giver helps their own team find words; there is a word to avoid rather than one to hide.' },
      { name: 'Just One', players: '3–7', alike: 'Get someone to a secret word with one-word hints.', differs: 'It is fully cooperative, and duplicate hints are cancelled.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
