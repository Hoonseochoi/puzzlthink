// Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX". Set NEXT_PUBLIC_GA_ID in Vercel.
// Empty means no Google Analytics tag is loaded (local dev without the variable, preview builds, etc.).
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || '';
