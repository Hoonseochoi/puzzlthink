import { getEscapeStory } from '@/data/escape';
import { notFound } from 'next/navigation';
import EscapeRoomClient from '@/components/escape/EscapeRoomClient';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string; storyId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, storyId } = await params;
  const story = getEscapeStory(storyId, locale);
  const sectionTitle = locale === 'ko' ? '웹 크라임씬' : 'WEB CRIME SCENE';
  if (!story) return { title: sectionTitle };
  return {
    title: `${story.title} | ${sectionTitle}`,
    description: story.summary,
  };
}

export default async function EscapeStoryPage({ params }: Props) {
  const { locale, storyId } = await params;
  const story = getEscapeStory(storyId, locale);
  if (!story) notFound();
  return <EscapeRoomClient story={story} />;
}
