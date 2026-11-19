import { createElement, type ComponentProps } from 'react';
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['en', 'ko'],
    defaultLocale: 'ko',
    localePrefix: 'always',
    localeDetection: true
});

const navigation = createNavigation(routing);
export const { redirect, usePathname, useRouter } = navigation;

/**
 * Link with prefetching off by default. Every visible link used to prefetch its page in the background
 * (the home page alone lists every game), which was most of the site's CDN requests. Pages now load on tap.
 * Pass prefetch explicitly to opt back in for a link.
 */
export function Link({ prefetch = false, ...props }: ComponentProps<typeof navigation.Link>) {
    return createElement(navigation.Link, { prefetch, ...props });
}
