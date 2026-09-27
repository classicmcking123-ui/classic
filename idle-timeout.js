// Auto-logs the user out after a period of no interaction. Sessions would otherwise stay
// "logged in" forever, since localStorage.studyHiveUser (what every page checks to decide
// you're signed in) never expires on its own. Include this script on every page that
// requires a signed-in user - it's a no-op if nobody's logged in.
(function () {
    const INACTIVITY_MINUTES = 30;
    const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;
    let idleTimer = null;

    function logoutForInactivity() {
        localStorage.removeItem('studyHiveUser');
        // auth.signOut() is only available on pages that load the Firebase Auth SDK -
        // clearing localStorage alone is already enough for the app to treat you as signed out.
        if (typeof auth !== 'undefined' && auth && typeof auth.signOut === 'function') {
            auth.signOut().catch(() => {}).finally(() => {
                window.location.href = 'login_page.htm?timeout=1';
            });
        } else {
            window.location.href = 'login_page.htm?timeout=1';
        }
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(logoutForInactivity, INACTIVITY_MS);
    }

    if (localStorage.getItem('studyHiveUser')) {
        ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach((evt) => {
            document.addEventListener(evt, resetIdleTimer, { passive: true });
        });
        resetIdleTimer();
    }
})();
