// Caches the app shell (pages, local scripts/styles and the CDN files every page needs) so
// previously visited pages keep working offline. Firebase API traffic is never intercepted, so
// live features like chat and quizzes simply need a connection.

// Bump the version whenever APP_SHELL changes so old caches get cleared on activate.
const CACHE_NAME = 'studyhive-shell-v2';

const APP_SHELL = [
    '/index.html',
    '/home.html',
    '/login_page.htm',
    '/profile.html',
    '/social.html',
    '/quiz_arena.html',
    '/live_quiz.html',
    '/course_outlines.html',
    '/notes.html',
    '/past_questions.html',
    '/404.html',
    '/offline.html',
    '/manifest.json',
    '/css/app.css',
    '/js/app.js',
    '/js/firebase-config.js',
    '/js/quiz.js',
    '/js/quiz-questions.js',
    '/js/register-sw.js',
    '/js/username.js',
    '/js/utils.js',
    '/images/login-background.jpg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage-compat.js'
];

const CACHEABLE_ORIGINS = [self.location.origin, 'https://cdnjs.cloudflare.com', 'https://www.gstatic.com'];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // Cache files one by one: cache.addAll() fails the whole install if a single URL fails
        const results = await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
        results.forEach((result, i) => {
            if (result.status === 'rejected') console.warn('[service-worker] Failed to precache', APP_SHELL[i], result.reason);
        });
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
        await self.clients.claim();
    })());
});

// Stale-while-revalidate: answer from the cache immediately when possible (this is what makes
// offline work) and refresh the cached copy from the network in the background.
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    if (!CACHEABLE_ORIGINS.includes(new URL(request.url).origin)) return;

    event.respondWith((async () => {
        const cached = await caches.match(request);
        const networkFetch = fetch(request)
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return response;
            })
            .catch(() => {
                if (cached) return cached;
                if (request.mode === 'navigate') return caches.match('/offline.html');
                return Response.error();
            });

        return cached || networkFetch;
    })());
});
