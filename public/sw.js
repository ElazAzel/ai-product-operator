const CACHE = 'ai-operator-v2';
const ROUTES = [
  '/', '/roadmap', '/evidence-vault', '/skill-scorecard', '/weekly-plan',
  '/artifacts', '/money-map', '/reviews', '/templates', '/certifications', '/settings',
  '/manifest.json', '/icon.svg', '/icon-192.png', '/icon-512.png', '/favicon.ico'
];

function isOnWifi() {
  try {
    const conn = self.navigator.connection;
    if (!conn) return null;
    return conn.type === 'wifi' || conn.type === 'ethernet';
  } catch {
    return null;
  }
}

function cacheOnWifi() {
  if (isOnWifi() !== false) {
    caches.open(CACHE).then(cache => {
      ROUTES.forEach(url => {
        fetch(url).then(res => { if (res.ok) cache.put(url, res); }).catch(() => {});
      });
    });
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ROUTES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
  cacheOnWifi();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(navigateHandler(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) { caches.open(CACHE).then(c => c.put(request, res.clone())); }
    return res;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function navigateHandler(request) {
  const wifi = isOnWifi();

  // WiFi: network-first with cache fallback
  if (wifi !== false) {
    try {
      const res = await fetch(request);
      if (res.ok) { caches.open(CACHE).then(c => c.put(request, res.clone())); }
      return res;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      const root = await caches.match('/');
      if (root) return root;
      return new Response('Offline', { status: 503 });
    }
  }

  // Cellular or unknown: cache-first, background refresh
  const cached = await caches.match(request);
  if (cached) {
    fetch(request).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(request, res));
    }).catch(() => {});
    return cached;
  }

  try {
    const res = await fetch(request);
    if (res.ok) { caches.open(CACHE).then(c => c.put(request, res.clone())); }
    return res;
  } catch {
    const root = await caches.match('/');
    if (root) return root;
    return new Response('Offline', { status: 503 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'cache-update') cacheOnWifi();
});

// Listen for connection changes to refresh cache on WiFi
try {
  self.navigator.connection.addEventListener('change', () => {
    if (isOnWifi()) cacheOnWifi();
  });
} catch {}
