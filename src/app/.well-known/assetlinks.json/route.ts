import { PLAY_APP_FINGERPRINTS, PLAY_APP_PACKAGE } from '@/lib/playApp';

// Digital Asset Links for the Google Play app (Trusted Web Activity): lets com.puzzlthink.app open this site full
// screen. The fingerprints live in src/lib/playApp.ts (the Play App Signing one is added there after the first upload).
export const dynamic = 'force-static';

export function GET() {
  const fingerprints = Object.values(PLAY_APP_FINGERPRINTS).filter((f) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(f));
  const body = [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: PLAY_APP_PACKAGE, sha256_cert_fingerprints: fingerprints },
  }];
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
}
