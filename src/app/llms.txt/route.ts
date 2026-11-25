// /llms.txt: a plain-text map of the site for AI search assistants (the llmstxt.org format).
import { GAMES } from '@/lib/gameCatalog';
import { CERT_GAMES } from '@/lib/hardClear';
import { SITE_URL } from '@/lib/seo';
import { HELL_LIVE } from '@/lib/hell';
import type { GameId } from '@/lib/stats';

export const dynamic = 'force-static';

const STATS_ID: Record<string, GameId> = Object.fromEntries((Object.keys(CERT_GAMES) as GameId[]).map((id) => [CERT_GAMES[id].href, id]));
const GUIDES: [string, string][] = [
  ['/slitherlink/guide', '슬리더링크 공략 (Slitherlink guide)'],
  ['/binairo/guide', '비나이로 공략 (Binairo guide)'],
  ['/one-stroke/guide', '한붓길 공략 (One Stroke guide)'],
  ['/color-link/guide', '컬러 잇기 공략 (Color Link guide)'],
  ['/magic-square/guide', '마방진 스왑 공략 (Magic Square Swap guide)'],
  ['/star-battle/guide', '스타배틀 공략 (Star Battle guide)'],
  ['/masyu/guide', '마슈 공략 (Masyu guide)'],
  ['/nonogram/guide', '노노그램 공략 (Nonogram guide)'],
];

export function GET() {
  const games = GAMES.map((g) => {
    const c = CERT_GAMES[STATS_ID[g.href]];
    return `- [${c.ko} (${c.en})](${SITE_URL}/ko${g.href}): ${SITE_URL}/en${g.href}`;
  });
  const body = [
    '# PUZZLTHINK',
    '',
    "> Free browser games: brain games known from Korean brain-survival shows (The Devil's Plan, The Genius, The Society Game) and logic puzzles with challenge rankings. No sign-up; play an AI, friends (link or 4-digit code) or open matches. Korean and English. An unofficial fan-made service, not affiliated with any broadcaster.",
    '',
    '데블스 플랜·더 지니어스 등 두뇌 서바이벌 방송에서 알려진 게임과 슬리더링크·스타배틀·마슈·노노그램 같은 논리 퍼즐을 가입 없이 무료로 즐기는 웹사이트예요. 논리 퍼즐은 정답이 하나뿐인 무작위 맵이고, 새 맵 차지·맵 뺏기 챌린지 랭킹이 있어요.',
    '',
    '## Games',
    ...games,
    '',
    '## Hubs',
    `- [게임 소개 (All games with rules)](${SITE_URL}/ko/games)`,
    `- [논리 퍼즐 (Logic puzzles)](${SITE_URL}/ko/logic-puzzles)`,
    `- [기록실·랭킹 (Records and rankings)](${SITE_URL}/ko/records)`,
    ...(HELL_LIVE.length ? [`- [AI 헬모드 · 매우 어려움 AI (AI Hell Mode: the hardest AI in Wallgo II, Wallgo 1:1, 12 Janggi, Russian Janggi, Blind Gomoku and Color Link Duel; each win is a black piece on the 블랙피스 경쟁전 board)](${SITE_URL}/ko/hell)`] : []),
    '',
    '## Guides',
    ...GUIDES.map(([path, name]) => `- [${name}](${SITE_URL}/ko${path})`),
    '',
    '## About',
    `- [소개 (About)](${SITE_URL}/ko/about)`,
    `- Contact: contact@puzzlthink.com`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
