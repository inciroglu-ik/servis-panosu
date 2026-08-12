/* İnciroğlu Otomotiv — Servis Danışmanı Performans Panosu
   Basit önbellek: uygulama kabuğu çevrimdışı da açılır, veri Firestore'dan gelir. */
const CACHE = 'servis-panosu-v1';
const DOSYALAR = ['./', './index.html', './manifest.json', './logo.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DOSYALAR).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  /* Firestore ve CDN istekleri her zaman ağdan geçer. */
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const kopya = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopya)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
