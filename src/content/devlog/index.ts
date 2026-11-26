// Registry of 개발 노트 articles. Order inside a category is the hub's display order.
// Server-only: never import this from a client component.
import type { DevlogArticle, DevlogCategory, DevlogLocale } from './types';
import aiWallgo from './ai-wallgo';
import aiTwelveJanggi from './ai-twelve-janggi';

const ARTICLES: DevlogArticle[] = [
  aiWallgo,
  aiTwelveJanggi,
];

export const DEVLOG: readonly DevlogArticle[] = ARTICLES;

export const devlogLocale = (locale: string): DevlogLocale => (locale === 'en' ? 'en' : 'ko');
export const devlogPath = (slug: string) => `/devlog/${slug}`;
export const devlogBySlug = (slug: string) => DEVLOG.find((a) => a.slug === slug);

export const DEVLOG_CATEGORIES: { id: DevlogCategory; ko: string; en: string; koLead: string; enLead: string }[] = [
  { id: 'ai', ko: 'AI 상대 만들기', en: 'Building the AI opponents', koLead: '난이도마다 AI가 수를 고르는 방법, 매우 어려움(헬모드) AI의 탐색, 그리고 사람이 파고들 수 있는 틈.', enLead: 'How each difficulty picks a move, how the Very Hard (hell) AIs search, and the gaps a human can use.' },
  { id: 'systems', ko: '사이트의 장치들', en: 'Site systems', koLead: '아이콘과 배지, 명예의 전당, 오픈 대전, 라운지 같은 게임 밖의 장치가 만들어진 과정.', enLead: 'How the things around the games were built: icons and badges, the Hall of Fame, open matches, the lounge.' },
  { id: 'story', ko: '사이트 이야기', en: 'The site story', koLead: '커밋 기록으로 다시 짚어 본 PUZZLTHINK의 열흘.', enLead: "PUZZLTHINK's first days, retold from the commit history." },
];

/** Every article of a category, in registry order. */
export const devlogByCategory = (category: DevlogCategory) => DEVLOG.filter((a) => a.category === category);

/** Other articles about the same games (then the same category), for the "read next" list. */
export function relatedDevlog(article: DevlogArticle, limit = 3) {
  const sameGame = DEVLOG.filter((a) => a !== article && a.games.some((g) => article.games.includes(g)));
  const sameCategory = DEVLOG.filter((a) => a !== article && a.category === article.category && !sameGame.includes(a));
  return [...sameGame, ...sameCategory].slice(0, limit);
}

/** The dev note about one game, if there is one (AI articles first), for links from elsewhere. */
export const devlogForGame = (game: DevlogArticle['games'][number]) =>
  DEVLOG.find((a) => a.category === 'ai' && a.games.includes(game)) ?? DEVLOG.find((a) => a.games.includes(game));
