import { blueMoonStory } from './blue-moon';
import { blueMoonStoryEn } from './blue-moon-en';
import type { EscapeStory } from '@/types/escape';

const storiesKo: Record<string, EscapeStory> = {
  'blue-moon': blueMoonStory,
};

const storiesEn: Record<string, EscapeStory> = {
  'blue-moon': blueMoonStoryEn,
};

const localeMap = { ko: storiesKo, en: storiesEn } as const;

export function getEscapeStory(storyId: string, locale?: string): EscapeStory | undefined {
  const lang = locale === 'en' ? 'en' : 'ko';
  return localeMap[lang][storyId];
}

export function getAllEscapeStoryIds(): string[] {
  return Object.keys(storiesKo);
}

export { blueMoonStory, blueMoonStoryEn };
