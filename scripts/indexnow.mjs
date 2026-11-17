// Tells IndexNow search engines (Bing, Naver, Seznam, Yandex…) that the site's pages changed.
// Run after a deploy:  node scripts/indexnow.mjs
// The key file public/3c86c22c0a8dddc5372f7f2ad18880eb.txt must be live at https://www.puzzlthink.com/3c86c22c0a8dddc5372f7f2ad18880eb.txt first.
const HOST = 'www.puzzlthink.com';
const KEY = '3c86c22c0a8dddc5372f7f2ad18880eb';
const ENDPOINTS = ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'];

const sitemap = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`${urlList.length} URLs from the sitemap`);
for (const endpoint of ENDPOINTS) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  console.log(endpoint, res.status, res.statusText);
}
