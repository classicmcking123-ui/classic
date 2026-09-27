// StudyHive service worker: caches the app shell (HTML pages, local scripts, the
// FontAwesome/Firebase SDK CDN files every page depends on) so previously-visited pages -
// especially Course Outlines and Notes, which are pure static content with no backend calls -
// keep working with no connection. Firebase Auth/Firestore/Storage network requests are never
// intercepted here (see the origin check in the fetch handler below), so live features like
// chat and quizzes are untouched; they simply won't work offline, same as before this existed.

const CACHE_NAME = 'studyhive-shell-v1';

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
    '/firebase-config.js',
    '/quiz-questions.js',
    '/idle-timeout.js',
    '/register-sw.js',
    '/download.jpg',
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

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Cache each file individually rather than cache.addAll(), which aborts the whole
            // install if even one URL 404s - a single bad CDN request shouldn't break offline
            // support for everything else.
            const results = await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    console.warn('[service-worker] Failed to precache', APP_SHELL[i], result.reason);
                }
            });
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Only handle simple GET page/asset loads. Firebase Auth/Firestore/Storage calls (and any
    // other POST/PUT traffic) pass straight through untouched, exactly as if this file didn't exist.
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    const isAppShellOrigin = url.origin === self.location.origin
        || url.origin === 'https://cdnjs.cloudflare.com'
        || url.origin === 'https://www.gstatic.com';
    if (!isAppShellOrigin) return;

    event.respondWith(
        caches.match(request).then((cached) => {
            const networkFetch = fetch(request)
                .then((response) => {
                    if (response && response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    if (cached) return cached;
                    if (request.mode === 'navigate') return caches.match('/offline.html');
                    return undefined;
                });

            // Stale-while-revalidate: serve the cached copy instantly if we have one (this is
            // what makes offline viewing work), while quietly fetching a fresh copy for next time.
            return cached || networkFetch;
        })
    );
});
