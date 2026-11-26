// Registry of the 게임 이론 (game theory) section: /[locale]/game-theory and /[locale]/game-theory/<slug>.
// Add an article = one file in ./articles plus one line in ARTICLES (hub order within a category follows this list).
// Server-only: never import from a client component.
import type { GTArticle, GTCategory, GTLocale } from './types';
import nashEquilibrium from './articles/nash-equilibrium';
import prisonersDilemma from './articles/prisoners-dilemma';
import titForTat from './articles/tit-for-tat';
import blotto from './articles/colonel-blotto';
import bluffing from './articles/bluffing';
import minimaxMixed from './articles/minimax-mixed-strategy';
// @gt-imports

export const GT_PATH = '/game-theory';
export const gtLocale = (locale: string): GTLocale => (locale === 'en' ? 'en' : 'ko');
export const articlePath = (slug: string) => `${GT_PATH}/${slug}`;

export const ARTICLES: GTArticle[] = [
  nashEquilibrium,
  prisonersDilemma,
  titForTat,
  blotto,
  bluffing,
  minimaxMixed,
  // @gt-list
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug) ?? null;

export const CATEGORIES: { id: GTCategory; ko: { title: string; lead: string }; en: { title: string; lead: string } }[] = [
  { id: 'basics',
    ko: { title: '기초 개념', lead: '균형, 우월 전략, 제로섬, 혼합 전략. 나머지 글을 읽기 위한 공통 언어예요.' },
    en: { title: 'Foundations', lead: 'Equilibrium, dominance, zero-sum games and mixed strategies: the shared vocabulary for everything else.' } },
  { id: 'cooperation',
    ko: { title: '협력과 배신', lead: '모두에게 좋은 길이 있는데도 왜 그 길로 가기 어려운지, 그리고 어떻게 하면 가능해지는지.' },
    en: { title: 'Cooperation and betrayal', lead: 'Why the road that is good for everyone is so hard to take, and what makes it possible.' } },
  { id: 'information',
    ko: { title: '베팅, 블러핑, 정보', lead: '내가 모르는 것과 상대가 모르는 것이 게임을 어떻게 바꾸는지.' },
    en: { title: 'Betting, bluffing and information', lead: 'How what you do not know, and what the other side does not know, changes the game.' } },
  { id: 'allocation',
    ko: { title: '자원 배분과 경매', lead: '한정된 점수와 칩을 어디에, 얼마나 걸 것인가.' },
    en: { title: 'Allocation and auctions', lead: 'Where to put a limited budget of points or chips, and how much.' } },
  { id: 'coalitions',
    ko: { title: '투표, 연합, 순위', lead: '셋 이상이 모이면 생기는 일: 편 가르기, 킹메이커, 꼴찌 피하기.' },
    en: { title: 'Voting, coalitions and rank', lead: 'What happens with three or more players: alliances, kingmakers and avoiding last place.' } },
  { id: 'sequence',
    ko: { title: '순서, 약속, 위협', lead: '끝에서부터 거꾸로 읽기, 그리고 말이 믿을 만해지는 조건.' },
    en: { title: 'Order, promises and threats', lead: 'Reading the game backwards from the end, and what makes words believable.' } },
];
