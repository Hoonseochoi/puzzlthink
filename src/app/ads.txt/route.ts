import { ADSENSE_CLIENT } from '@/lib/adsense';

export const dynamic = 'force-static';

export function GET() {
  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, '');
  const body = publisherId ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n` : '';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
