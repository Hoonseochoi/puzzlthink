// Lets the scripts here import src/lib files the way the app does (extensionless relative imports → .ts).
// Usage: node --import ./scripts/proposition-go/resolve-ts.mjs scripts/proposition-go/check.ts
import { register } from 'node:module';

register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  try { return await next(spec, ctx); } catch (e) {
    if ((spec.startsWith('./') || spec.startsWith('../')) && !/\\.[cm]?[jt]sx?$/.test(spec)) return next(spec + '.ts', ctx);
    throw e;
  }
}`));
