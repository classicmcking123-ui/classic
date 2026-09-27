// Registers the offline service worker. Include on every page (see service-worker.js
// for what actually gets cached and why).
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch((error) => {
            console.error('Service worker registration failed', error);
        });
    });
}
