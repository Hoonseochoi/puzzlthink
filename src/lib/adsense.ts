// AdSense publisher ID, e.g. "ca-pub-1234567890123456". Set NEXT_PUBLIC_ADSENSE_CLIENT in Vercel.
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || '';

// Ad unit slot IDs (AdSense → Ads → By ad unit → Display ads → the data-ad-slot number).
// A placement whose slot is empty renders nothing in production and a dashed placeholder in development.
export const AD_SLOTS = {
  /** Game-over / result panels (all games). */
  result: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT?.trim() || '',
  /** Between the game area and the guide/FAQ below it, and on content pages. */
  inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE?.trim() || '',
} as const;

export type AdPlacement = keyof typeof AD_SLOTS;
