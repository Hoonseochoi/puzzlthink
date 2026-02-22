import { getTranslations } from 'next-intl/server';
import PlayClient from '@/components/PlayClient';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ difficulty?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale } = await params;
    const { difficulty } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Sudoku' });

    const diffLabel = difficulty ? t(difficulty as any) : t('medium');

    return {
        title: `${diffLabel} Sudoku`,
        description: t('description') || 'Play Sudoku online with multiple difficulties and global leaderboards.',
    };
}

export default async function PlayPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { difficulty } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Sudoku' });

    const diffLabel = difficulty ? t(difficulty as any) : t('medium');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: `${diffLabel} Sudoku — PUZZL THINK`,
        description: 'A logic-based, combinatorial number-placement puzzle game.',
        genre: 'Puzzle Game',
        author: {
            '@type': 'Organization',
            name: 'PUZZL THINK',
        },
        publisher: {
            '@type': 'Organization',
            name: 'PUZZL THINK',
        },
        url: 'https://puzzlthink.com/play',
        screenshot: 'https://puzzlthink.com/og-image.png',
        inLanguage: locale,
        applicationCategory: 'Game',
        operatingSystem: 'Any',
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://puzzlthink.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Play Sudoku',
                item: `https://puzzlthink.com/play?difficulty=${difficulty || 'medium'}`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <PlayClient />
        </>
    );
}
