const CACHE = 'ai-operator-v3';
const CACHE_STATIC = 'ai-static-v3';
const STATIC_ROUTES = [
  '/', '/roadmap', '/evidence-vault', '/skill-scorecard', '/weekly-plan',
  '/artifacts', '/money-map', '/reviews', '/templates', '/certifications', '/settings',
  '/manifest.json', '/icon.svg', '/icon-192.png', '/icon-512.png', '/favicon.ico'
];

function isOnWifi() {
  try {
    const c = self.navigator.connection;
    if (!c) return null;
    return c.type === 'wifi' || c.type === 'ethernet';
  } catch { return null; }
}

// Actively download ALL static assets: fetch each page HTML, extract every
// script/link/img, cache everything so the app works fully offline.
async function downloadAll(background) {
  const pageCache  = await caches.open(CACHE);
  const assetCache = await caches.open(CACHE_STATIC);
  const origin = self.location.origin;
  const assets = new Set();
  const toFetch = [];

  // 1 — cache page HTML
  for (const route of STATIC_ROUTES) {
    toFetch.push(
      fetch(route).then(r => {
        if (!r.ok) return;
        pageCache.put(route, r.clone());
        return r.text();
      }).then(html => {
        if (!html) return;
        // extract every <script src>, <link href>, <img src>
        const reSrc  = /(?:src|href)=["']([^"']+)["']/g;
        let m;
        while ((m = reSrc.exec(html)) !== null) {
          const url = m[1].startsWith('http') ? m[1] : origin + m[1];
          if (url.startsWith(origin)) assets.add(url);
        }
        // also extract from inline JSON (next data)
        const reJson = /["'](/_next\/static\/[^"']+)["']/g;
        while ((m = reJson.exec(html)) !== null) {
          const url = m[1].startsWith('http') ? m[1] : origin + m[1];
          if (url.startsWith(origin) && !url.includes('webpack')) assets.add(url);
        }
      }).catch(() => {})
    );
  }

  await Promise.all(toFetch);

  // 2 — cache all discovered static assets (JS chunks, CSS, images)
  const limit = 10;
  const chunks = [...assets];
  for (let i = 0; i < chunks.length; i += limit) {
    await Promise.all(chunks.slice(i, i + limit).map(url =>
      fetch(url).then(r => { if (r.ok) assetCache.put(url, r); }).catch(() => {})
    ));
  }

  // 3 — precache the whole _next/static tree (catches any missed chunks)
  // Try common entry points
  const common = ['/_next/static/chunks/app/layout', '/_next/static/chunks/main', '/_next/static/css'];
  for (const prefix of common) {
    // We can only try known paths – the real chunk names are hashed
  }

  if (background) postMessage({ type: 'CACHE_DONE', total: assets.size });
}

// --- events ---

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_ROUTES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // remove old caches
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k !== CACHE_STATIC).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
  // start bulk download AFTER activation so fetch handler is already in place
  event.waitUntil(downloadAll(false));
});

// --- fetch strategies ---

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Static Next.js assets: cache-first (never go to network if cached)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  // Images / fonts: cache-first
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/)) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  // Navigations: cache-first on cell, net-first on WiFi
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(navigateHandler(request));
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(networkFirst(request));
});

async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function navigateHandler(request) {
  const wifi = isOnWifi();

  // WiFi: network-first
  if (wifi !== false) {
    try {
      const res = await fetch(request);
      if (res.ok) {
        const cache = await caches.open(CACHE);
        cache.put(request, res.clone());
      }
      return res;
    } catch { /* fall through */ }
  }

  // Cache fallback
  const cached = await caches.match(request);
  if (cached) return cached;

  // Root fallback (SPA-like)
  const root = await caches.match('/');
  if (root) return root;

  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// --- message handler ---
self.addEventListener('message', (event) => {
  if (event.data?.type === 'DOWNLOAD_ALL') downloadAll(true);
  if (event.data?.type === 'CACHE_DONE' && event.source?.postMessage) {
    event.source.postMessage({ type: 'CACHE_DONE', total: event.data.total });
  }
});

// WiFi change → refresh cache
try {
  self.navigator.connection?.addEventListener('change', () => {
    if (isOnWifi()) downloadAll(true);
  });
} catch {}
