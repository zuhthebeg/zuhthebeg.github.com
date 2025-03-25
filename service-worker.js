const CACHE_NAME = 'sandbox-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/common.css',
    '/manifest.json',
    // 필요한 다른 파일들 추가
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
}); 