// Shared logic used across every StudyHive page: theme init, the navbar, reading the
// signed-in user (with or without a forced redirect), and logging out. This replaces
// near-identical inline <script> blocks that had drifted apart across pages - e.g.
// social.html never applied the saved theme at all, and live_quiz.html's redirect
// didn't actually stop the rest of its script from running against a null user.
//
// Load this AFTER firebase-config.js (if the page uses Firebase) and BEFORE the page's
// own inline <script>, since page scripts call requireAuth()/getCurrentUser() directly.
// initTheme() and renderNavbar() run themselves immediately below, so simply including
// this file is enough to get the theme and nav working - no call needed for those two.

function initTheme() {
    if (localStorage.getItem('studyHiveTheme') === 'light') {
        document.body.classList.add('light-mode');
    }
}

// Returns the signed-in user (parsed from localStorage), or null if nobody's signed in.
// Never redirects - use this on pages where anonymous viewing is fine.
function getCurrentUser() {
    const raw = localStorage.getItem('studyHiveUser');
    return raw ? JSON.parse(raw) : null;
}

// Same as getCurrentUser(), but sends signed-out visitors to login_page.htm.
// Note this returns null in that case rather than stopping the page's script (a plain
// <script> tag can't "return" out of the rest of the file) - the browser navigation is
// asynchronous, so a few more lines of the calling page can still run before it takes
// effect. Callers must guard with `if (user) { ...rest of page logic... }`.
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login_page.htm';
    }
    return user;
}

async function logoutUser() {
    if (typeof auth !== 'undefined' && auth && typeof auth.signOut === 'function') {
        try { await auth.signOut(); } catch (error) { console.error('Sign out failed', error); }
    }
    localStorage.removeItem('studyHiveUser');
    window.location.href = 'login_page.htm';
}

// Injects the standard nav into <div id="navbar-container"></div>. Pages with a
// deliberately different header (live_quiz.html's match header) don't include that
// container and simply keep their own markup - this is a no-op there.
function renderNavbar() {
    const target = document.getElementById('navbar-container');
    if (!target) return;

    target.innerHTML = `
        <nav>
            <div class="logo">StudyHive <i class="fab fa-hive"></i></div>
            <div class="nav-links">
                <a href="home.html"><i class="fas fa-home"></i> Dashboard</a>
                <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
            </div>
        </nav>
    `;
}

initTheme();
renderNavbar();
