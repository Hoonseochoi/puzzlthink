// Minimal service worker: makes the site installable as an app (some Android browsers still require one).
// It deliberately caches nothing — every request goes to the network, so deploys show up immediately.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
