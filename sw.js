// Tablette de match VNCTSTATIC : copie complète de l'outil sur l'iPad, pour qu'il s'ouvre sans réseau au gymnase.
// Changer VERSION à chaque mise en ligne : l'iPad prend la nouvelle copie à la prochaine ouverture, jamais en plein match.
const VERSION = 'vnct-tablette-1.0.0';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/archivo-400-800-latin.woff2', 'fonts/archivo-400-800-latin-ext.woff2', 'fonts/dm-mono-500-latin.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('vnct-tablette-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Toujours la copie gardée d'abord : au gymnase, rien n'attend le réseau.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, {ignoreSearch: true}) || (req.mode === 'navigate' ? await c.match('index.html') : null);
    if (hit) return hit;
    try { return await fetch(req); } catch (err){ return new Response('Hors ligne', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}}); }
  }));
});
