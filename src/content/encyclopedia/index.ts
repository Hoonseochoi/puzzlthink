// Registry of 보드게임 백과 articles (/[locale]/board-games/<slug>). Order here is the order on the hub within
// each category. Server-only: never import this from a client component.
import abstractStrategy from './abstract-strategy';
import bluffingDeduction from './bluffing-deduction';
import bettingAuction from './betting-auction';
import areaControlConnection from './area-control-connection';
import nInARow from './n-in-a-row';
import captureGames from './capture-games';
import memoryGames from './memory-games';
import hiddenInformation from './hidden-information';
import cooperativeVsCompetitive from './cooperative-vs-competitive';
import partyGames from './party-games';
import logicPuzzles from './logic-puzzles';
import numberPuzzles from './number-puzzles';
import historyOfBaduk from './history-of-baduk';
import chessFamilyHistory from './chess-family-history';
import gomokuRenju from './gomoku-renju';
import morrisFamily from './morris-family';
import sudokuHistory from './sudoku-history';
import nonogramHistory from './nonogram-history';
import nikoliPuzzles from './nikoli-puzzles';
import slidingNumberPuzzles from './sliding-number-puzzles';
import type { WikiArticle, WikiCategory, WikiLocale } from './types';

const ARTICLES_IN_ORDER: WikiArticle[] = [
  abstractStrategy,
  bluffingDeduction,
  bettingAuction,
  areaControlConnection,
  nInARow,
  captureGames,
  memoryGames,
  hiddenInformation,
  cooperativeVsCompetitive,
  partyGames,
  logicPuzzles,
  numberPuzzles,
  historyOfBaduk,
  chessFamilyHistory,
  gomokuRenju,
  morrisFamily,
  sudokuHistory,
  nonogramHistory,
  nikoliPuzzles,
  slidingNumberPuzzles,
];

export const WIKI_BASE = '/board-games';
export const wikiPath = (slug: string) => `${WIKI_BASE}/${slug}`;
export const wikiLocale = (locale: string): WikiLocale => (locale === 'en' ? 'en' : 'ko');

export const ARTICLES: WikiArticle[] = ARTICLES_IN_ORDER;
export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug) ?? null;

export const CATEGORIES: { id: WikiCategory; accent: string; ko: { title: string; blurb: string }; en: { title: string; blurb: string } }[] = [
  {
    id: 'genre', accent: '#ffcc4d',
    ko: { title: '장르와 메커니즘', blurb: '추상 전략, 블러핑, 베팅, n목처럼 게임을 움직이는 핵심 장치별로 묶었어요. 무엇이 재미를 만들고 어떤 실력이 필요한지부터 봐요.' },
    en: { title: 'Genres and mechanics', blurb: 'Grouped by the engine that drives the game — abstract strategy, bluffing, betting, n-in-a-row. What makes each fun, and what skill it asks for.' },
  },
  {
    id: 'lineage', accent: '#ff8a5b',
    ko: { title: '계보와 역사', blurb: '바둑, 장기와 체스, 오목과 렌주, 스도쿠와 니콜리 퍼즐까지. 오늘 두는 게임이 어디서 왔는지 따라가 봐요.' },
    en: { title: 'Lineages and history', blurb: 'Go, the chess family, gomoku and renju, sudoku and the Nikoli puzzles — where the games we play today came from.' },
  },
  {
    id: 'concept', accent: '#7cc4ff',
    ko: { title: '개념과 용어', blurb: '완전 정보, 제로섬, 선공 유리, 풀린 게임, 운과 실력. 게임을 한 단계 깊게 보게 해 주는 개념들이에요.' },
    en: { title: 'Concepts and terms', blurb: 'Perfect information, zero-sum, first-move advantage, solved games, luck and skill — ideas that let you see games one level deeper.' },
  },
  {
    id: 'pick', accent: '#8be28b',
    ko: { title: '상황별 추천', blurb: '둘이서 5분, 혼자 머리 쓰기, 여럿이 심리전. 지금 상황에 맞는 게임을 골라 드려요.' },
    en: { title: 'Picks for the moment', blurb: 'Five minutes for two, a solo brain workout, mind games for a group — games matched to the moment.' },
  },
];

export const categoryOf = (id: WikiCategory) => CATEGORIES.find((c) => c.id === id)!;
