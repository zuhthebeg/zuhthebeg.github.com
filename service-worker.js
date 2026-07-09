// network-first SW: HTML은 항상 네트워크 우선, 실패 시에만 캐시 폴백.
// v2: 구 sandbox-cache-v1(cache-first) 무효화 — index 교체가 기존 방문자에게 즉시 반영되도록.
const CACHE_NAME = 'cocy-portal-v2';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok && new URL(event.request.url).origin === location.origin) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
