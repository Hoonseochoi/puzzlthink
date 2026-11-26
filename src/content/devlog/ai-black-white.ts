import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'ai-black-white',
  category: 'ai',
  games: ['blackWhite', 'blackWhite2'],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '흑과 백 AI 개발기 — 계산을 정확하게 할수록 사람이 더 이겼어요 | 개발 노트',
      description: '더 지니어스 흑과 백 AI 개발기. 상대가 낼 수 있었던 모든 타일 순서를 나열하고 남은 판을 수백 번 시뮬레이션하는 AI가, 왜 계산을 정확하게 할수록 더 많이 졌는지. 기록으로 두 번 확인하고 결국 어려움까지 "대충 계산"으로 바꾼 이야기와 흑과 백 II AI.',
      keywords: ['흑과 백 AI', '흑과 백 공략', '더 지니어스 흑과 백', '흑과 백 2', '심리전 게임 AI', '몬테카를로', '게임 AI 개발기'],
    },
    title: '흑과 백 AI 개발기',
    lead: '계산을 정확하게 할수록 사람이 더 이겼어요.',
    intro: [
      '흑과 백은 두 사람이 0~8 타일을 하나씩 내서 큰 숫자가 이기는 게임이에요. 짝수는 검은색, 홀수는 흰색이고, 상대에게는 색만 보여요. 아홉 판 동안 숫자는 끝까지 공개되지 않고, 색과 승패만 쌓여요.',
      '이 게임의 AI 이야기는 다른 게임과 반대예요. 보통은 계산을 깊게 할수록 AI가 강해지는데, 흑과 백에서는 기록을 두 번이나 확인한 끝에 **계산을 더 대충 하게** 바꿨어요. 왜 그랬는지 코드에 남은 숫자로 따라가 볼게요.',
    ],
    summary: '상대가 낼 수 있었던 모든 순서를 세고 수백 번 시뮬레이션하는 AI가, 왜 정확할수록 더 졌는지. 어려움까지 "대충 계산"으로 바꾼 기록.',
    sections: [
      {
        id: 'how',
        title: 'AI가 보는 것, 하는 계산',
        blocks: [
          { type: 'p', text: '흑과 백은 11월 17일 저녁에 올라갔어요. AI는 사람이 보는 것과 똑같은 것만 봐요. 내 타일, 상대 타일의 색, 그리고 판마다의 승패요. 이것만으로 계산하는 순서는 이래요.' },
          { type: 'steps', items: [
            { title: '가능한 과거 모두 나열', body: '지금까지 상대가 낼 수 있었던 타일 순서를 모두 찾아요. 판마다 색이 맞아야 하고, 내 타일과 비교한 승패도 실제 결과와 같아야 해요. 최대 6,000가지까지 나열해요.' },
            { title: '상대 손패 뽑기', body: '그 가능한 과거 중 하나를 무작위로 골라, 상대에게 남은 타일을 정해요. 상대가 먼저 냈다면 그 색에 맞는 타일 하나를 상대의 이번 수로 정해요.' },
            { title: '끝까지 해 보기', body: '내가 낼 수 있는 타일마다 이번 판을 정하고, 남은 판은 간단한 규칙(중간·낮은 타일 위주로 먼저 내고, 따라 낼 때는 이길 확률에서 큰 타일을 쓰는 비용을 빼서 고르기)으로 끝까지 둬 봐요. 이기면 1, 비기면 0.5.' },
            { title: '반복하고 섞어서 고르기', body: '이걸 여러 번(샘플 수) 반복해 타일별 승률을 구하고, 가장 높은 것만 고르는 대신 **소프트맥스**로 섞어서 골라요. 승률이 높을수록 자주, 하지만 늘 같은 타일은 아니게요.' },
          ] },
          { type: 'p', text: '소프트맥스의 "온도"가 낮을수록 1등 타일만 고르고, 높을수록 골고루 섞어요. 샘플 수와 온도, 이 두 숫자가 난이도의 전부였어요.' },
        ],
      },
      {
        id: 'first-surprise',
        title: '첫 번째 놀라움: 어려움이 보통보다 쉬웠어요',
        blocks: [
          { type: 'p', text: '처음 설정은 상식대로였어요. 어려움은 360번 시뮬레이션에 온도 0.035(거의 늘 1등 타일), 보통은 90번에 온도 0.09였어요. 11월 20일, 두 난이도를 모두 둔 플레이어끼리 비교해 보니 **어려움을 66%, 보통을 51%** 이겼어요. 더 정확하고 더 단호한 AI가 더 쉽게 졌던 거예요.' },
          { type: 'p', text: '코드 주석에 남은 진단은 이래요. **"거의 고정된 선택은 학습되고 공략당한다."** 흑과 백은 심리전이에요. AI가 같은 상황에서 늘 같은 타일을 내면, 몇 판만 해 봐도 사람이 그 패턴을 읽어요. 그래서 어려움의 시뮬레이션을 700번으로 늘려 추정은 더 정확하게 하되, 온도를 0.08로 올려 더 많이 섞게 했어요. 보통은 60번, 온도 0.11로 더 거칠게 했고요.' },
        ],
      },
      {
        id: 'second-surprise',
        title: '두 번째 놀라움: 정확할수록 더 졌어요',
        blocks: [
          { type: 'p', text: '11월 26일에 다시 봤더니 같은 현상이 한 번 더 나왔어요. 이번엔 온도가 아니라 **샘플 수** 쪽이었어요.' },
          { type: 'table', head: ['', '700번 시뮬레이션 (어려움)', '60번 시뮬레이션 (보통)'], rows: [
            ['사람 승률', '47%', '41%'],
            ['무승부', '24%', '20%'],
            ['둘 다 둔 사람끼리', '51%', '46%'],
          ] },
          { type: 'p', text: '코드 주석은 이렇게 정리해요. **정확한 추정은 스스로를 반복해서 읽히고, 거친 추정은 타일을 섞는다.** 700번을 돌리면 같은 상황에서 같은 결론이 나와요. 온도로 섞어도 1등과 2등의 차이가 뚜렷하니 결국 비슷한 타일이 나와요. 60번이면 추정 자체가 흔들려서 판마다 다른 타일이 1등이 되고요.' },
          { type: 'p', text: '그래서 지금은 **모든 난이도가 60번 시뮬레이션, 온도 0.11**을 써요. 보통과 어려움의 차이는 하나뿐이에요. 보통은 네 번에 한 번 "감으로" 둬요(색만 보고 간단한 규칙으로 고르기). 쉬움은 늘 감으로 두고, 그중 절반은 완전히 무작위예요.' },
          { type: 'callout', tone: 'note', title: '무승부가 많은 이유', text: '흑과 백은 같은 숫자를 내면 그 판은 아무도 점수를 얻지 못하고, 전체 점수가 같으면 무승부예요. 그래서 AI전 기록에서도 무승부가 20%를 넘어요.' },
        ],
      },
      {
        id: 'bw2',
        title: '흑과 백 II: 99점 나누기',
        blocks: [
          { type: 'p', text: '흑과 백 II는 같은 날 40여 분 뒤에 올라왔어요. 두 사람이 99점을 아홉 판에 몰래 나눠 걸고, 한 자리 수는 검은색, 두 자리 수는 흰색으로 보여요. 남은 점수는 20점 단위 다섯 칸 게이지로 늘 공개돼요.' },
          { type: 'p', text: 'AI 구조는 흑과 백과 같아요. 공개 정보(상대의 색, 승패, 게이지, 내가 따라 낼 때는 상대가 방금 낸 색과 줄어든 게이지)로 **상대의 남은 점수 범위를 좁히고**, 그 범위에서 상대 점수를 뽑아, 후보 베팅마다 끝까지 시뮬레이션해요. 상대가 먼저 냈다면 색과 게이지 변화에 맞는 베팅만 상대의 이번 수로 써요. 어려움은 500번에 온도 0.025, 보통은 120번에 0.06이고, 쉬움은 감으로 둬요. 흑과 백 II는 아직 "정확할수록 쉬워지는" 현상이 기록에 보이지 않아서 이 설정을 유지하고 있어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '실제 승률',
        lead: '2026-11-26 14시(KST) 기준, 로그인한 플레이어의 AI전 기록이에요. 흑과 백은 대부분 11월 26일 재조정 전의 판이에요.',
        blocks: [
          { type: 'table', head: ['게임 · 난이도', '사람 승률', '무승부', '판수'], rows: [
            ['흑과 백 · 보통', '40.6%', '21.8%', '298판'],
            ['흑과 백 · 어려움', '47.0%', '23.5%', '562판'],
            ['흑과 백 II · 보통', '44.2%', '1.9%', '154판'],
            ['흑과 백 II · 어려움', '38.4%', '2.3%', '341판'],
          ] },
          { type: 'p', text: '흑과 백 어려움 AI를 이겨 클리어 인증을 받은 사람은 85명으로, 인디언 포커 다음으로 많아요. 흑과 백 II는 42명이에요. 전체 판수(로그인 여부 무관)는 흑과 백 2,996판(AI전 2,236판), 흑과 백 II 1,201판(AI전 950판)이에요.' },
        ],
      },
      {
        id: 'exploits',
        title: '사람이 파고들 수 있는 틈',
        blocks: [
          { type: 'cards', items: [
            { tag: '흑과 백', title: 'AI의 시뮬레이션 속 나는 단순해요', body: 'AI는 남은 판에서 사람이 "중간·낮은 타일을 먼저 내고, 이길 만할 때만 큰 타일을 쓰는" 사람이라고 가정해요. 초반에 큰 타일을 먼저 내는 식으로 그 가정을 벗어나면 AI의 승률 계산이 어긋나요.' },
            { tag: '흑과 백', title: '보통은 네 번에 한 번 감으로', body: '감으로 두는 차례는 색과 남은 타일만 봐요. 따라 낼 때 이길 확률이 30% 아래면 가장 작은 타일을 버려요. 내가 약한 색으로 먼저 내면 AI가 작은 타일을 버리는 경우가 많아요.' },
            { tag: '흑과 백 II', title: '게이지는 20점 단위', body: 'AI가 상대 점수를 좁히는 단서는 색과 20점 단위 게이지뿐이에요. 같은 칸 안에서 점수를 크게 쓰면(예: 게이지가 한 칸만 줄도록) AI의 범위 추정이 넓어져요.' },
            { tag: '흑과 백 II', title: '어려움은 단호해요', body: '온도가 0.025로 낮아서 비슷한 상황에서는 비슷한 베팅을 해요. 흑과 백이 그랬듯, 몇 판 두며 AI의 베팅 습관을 관찰하는 게 가장 효과적이에요.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/blackWhite.ts` — possibleHistories, holdChances, quickFollow, quickLead, playOut, chooseAiTile(샘플 수·온도 주석)',
      '`src/lib/blackWhite2.ts` — rivalBankRange, chooseBw2AiBid',
      '커밋 d1a5648 (11/17 흑과 백), be2fa13·992473c (11/17 흑과 백 II), 1fe2d84 (11/20 어려움 66% vs 보통 51%, 700번·온도 0.08), e227318 (11/26 모든 난이도 60번)',
      'DB 집계(2026-11-26 14:22 KST): game_results(game=black_white·black_white_2, mode=ai) 난이도별 승률·무승부, hard_clears 인원, game_plays_daily 합계',
    ],
  },
  en: {
    meta: {
      title: 'Black & White AI dev notes — the more precise it got, the more people won | Dev notes',
      description: "How The Genius-style Black & White AI lists every tile sequence you could have played and simulates the rest of the game — and why it lost more as it got more precise. Checked twice against the records, Hard ended up on the rough estimate too. Plus the Black & White II AI.",
      keywords: ['Black and White AI', 'The Genius Black and White', 'Black & White II', 'mind game AI', 'Monte Carlo', 'game AI dev diary'],
    },
    title: 'Black & White AI dev notes',
    lead: 'The more precisely it calculated, the more people won.',
    intro: [
      'In Black & White two players each play a tile from 0–8 and the higher number wins the round. Even tiles are black, odd ones white, and the opponent sees only the colour. Over nine rounds the numbers are never revealed — only colours and results pile up.',
      'This AI’s story runs opposite to the others. Usually deeper calculation makes an AI stronger; here, after checking the records twice, the AI was made to calculate **more roughly**. The numbers left in the code tell why.',
    ],
    summary: 'An AI that counts every sequence you could have played and simulates hundreds of endings — and why it lost more the more precise it was. Even Hard now uses the rough estimate.',
    sections: [
      {
        id: 'how',
        title: 'What it sees, what it computes',
        blocks: [
          { type: 'p', text: 'Black & White launched on the evening of 17 November. The AI sees exactly what a player sees: its own tiles, the colours of yours, and each round’s result. From that it computes:' },
          { type: 'steps', items: [
            { title: 'List every possible past', body: 'Every sequence of tiles you could have played so far, matching each round’s colour and, compared with its own tile, the actual result. Up to 6,000 of them.' },
            { title: 'Sample your hand', body: 'Pick one of those pasts at random to decide which tiles you still hold. If you led this round, pick a tile of the colour you laid as your move.' },
            { title: 'Play it out', body: 'For each tile it could play, settle this round, then play the rest with a simple policy (lead mostly middle and low tiles; when following, weigh the chance to win against the cost of spending a big tile). Win 1, draw 0.5.' },
            { title: 'Repeat, then mix', body: 'Repeat that (the sample count) to get each tile’s win rate, then choose with a **softmax** rather than always the best: better tiles more often, but not always the same one.' },
          ] },
          { type: 'p', text: 'The lower the softmax "temperature", the more it sticks to the top tile; the higher, the more it mixes. Sample count and temperature were the whole difficulty.' },
        ],
      },
      {
        id: 'first-surprise',
        title: 'First surprise: Hard was easier than Normal',
        blocks: [
          { type: 'p', text: 'The first settings were the obvious ones: Hard ran 360 simulations at temperature 0.035 (nearly always the top tile), Normal 90 at 0.09. On 20 November, comparing players who had played both, people beat **Hard 66% of the time and Normal 51%**. The more precise, more decisive AI lost more.' },
          { type: 'p', text: 'The diagnosis in the code comment: **"a near-fixed choice gets learned and exploited."** Black & White is a mind game. If the AI always plays the same tile in the same situation, a few games are enough to read it. Hard went to 700 simulations for a sharper estimate but temperature 0.08 to mix more; Normal went rougher, 60 simulations at 0.11.' },
        ],
      },
      {
        id: 'second-surprise',
        title: 'Second surprise: more precise, more losses',
        blocks: [
          { type: 'p', text: 'On 26 November the same thing showed up again — this time in the sample count, not the temperature.' },
          { type: 'table', head: ['', '700 simulations (Hard)', '60 simulations (Normal)'], rows: [
            ['Human win rate', '47%', '41%'],
            ['Draws', '24%', '20%'],
            ['Players who played both', '51%', '46%'],
          ] },
          { type: 'p', text: 'The code comment sums it up: **a precise estimate repeats itself and gets read; a rough one mixes its tiles.** With 700 runs the same situation yields the same conclusion, and even with a temperature the gap between first and second is clear, so similar tiles come out. With 60 runs the estimate itself wobbles and a different tile comes out on top from game to game.' },
          { type: 'p', text: 'So now **every level uses 60 simulations at temperature 0.11**. The only difference between Normal and Hard: Normal plays one tile in four "by feel" (a simple colour-aware choice). Easy always plays by feel, half the time completely at random.' },
          { type: 'callout', tone: 'note', title: 'Why so many draws', text: 'Equal numbers score for nobody, and equal totals are a draw, so even against the AI more than 20% of games are drawn.' },
        ],
      },
      {
        id: 'bw2',
        title: 'Black & White II: splitting 99 points',
        blocks: [
          { type: 'p', text: 'Black & White II arrived about 40 minutes later the same day. Both players secretly split 99 points over nine rounds; a one-digit bid shows as black, a two-digit bid as white, and the points left are always public on a five-band gauge (20 points a band).' },
          { type: 'p', text: 'The AI has the same shape: from public information (your colours, results, gauge, and when it follows, the colour and new gauge of your bid) it **narrows down how many points you have left**, samples a figure from that range and plays each candidate bid out to the end. If you led, it uses only bids that fit the colour and the gauge change. Hard runs 500 simulations at temperature 0.025, Normal 120 at 0.06, Easy plays by feel. The records have not shown the "more precise, easier" effect here yet, so these settings stay.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Real win rates',
        lead: 'Signed-in players’ games against the AI as of 2026-11-26, 14:00 KST. For Black & White, most predate the 26 November retune.',
        blocks: [
          { type: 'table', head: ['Game · level', 'Human win rate', 'Draws', 'Games'], rows: [
            ['B&W · Normal', '40.6%', '21.8%', '298'],
            ['B&W · Hard', '47.0%', '23.5%', '562'],
            ['B&W II · Normal', '44.2%', '1.9%', '154'],
            ['B&W II · Hard', '38.4%', '2.3%', '341'],
          ] },
          { type: 'p', text: 'Eighty-five players hold a Black & White Hard-AI clear certificate, second only to Indian Poker; Black & White II has 42. Counting everyone, Black & White had been played 2,996 times (2,236 against the AI) and Black & White II 1,201 times (950).' },
        ],
      },
      {
        id: 'exploits',
        title: 'Gaps a human can use',
        blocks: [
          { type: 'cards', items: [
            { tag: 'B&W', title: 'You are simple in its simulation', body: 'The AI assumes you will lead middle and low tiles and spend big ones only when they are likely to win. Break that assumption — lead a big tile early, for instance — and its win rates are off.' },
            { tag: 'B&W', title: 'Normal plays by feel one time in four', body: 'Those turns look only at colours and remaining tiles; when following with under a 30% chance to win, it throws away its smallest tile. Lead the weaker colour and it often discards.' },
            { tag: 'B&W II', title: 'The gauge moves in 20s', body: 'Its only clues to your points are colours and a 20-point gauge. Spend big within one band (so the gauge drops just one step) and its range widens.' },
            { tag: 'B&W II', title: 'Hard is decisive', body: 'At temperature 0.025 it bets alike in similar situations. As with Black & White, watching its habits over a few games works best.' },
          ] },
        ],
      },
    ],
    sources: [
      '`src/lib/blackWhite.ts` — possibleHistories, holdChances, quickFollow, quickLead, playOut, chooseAiTile (sample and temperature comments)',
      '`src/lib/blackWhite2.ts` — rivalBankRange, chooseBw2AiBid',
      'Commits d1a5648 (11/17 Black & White), be2fa13 and 992473c (11/17 Black & White II), 1fe2d84 (11/20 Hard 66% vs Normal 51%, 700 runs at 0.08), e227318 (11/26 60 runs for every level)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (game = black_white, black_white_2; mode = ai) win and draw rates by level, hard_clears counts, game_plays_daily totals',
    ],
  },
};

export default article;
