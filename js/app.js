// Shared by every signed-in page: session helpers, theme, navbar, tabs and the idle logout.
// Load it after firebase-config.js (on pages that use Firebase) and before the page's own script.

const USER_STORAGE_KEY = 'studyHiveUser';
const THEME_STORAGE_KEY = 'studyHiveTheme';
const IDLE_LOGOUT_MS = 30 * 60 * 1000;

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    } catch {
        return null;
    }
}

function saveCurrentUser(user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

// Sends signed-out visitors to the login page. The redirect doesn't stop the calling script,
// so callers still need to check the returned user before using it.
function requireAuth() {
    const user = getCurrentUser();
    if (!user) window.location.href = 'login_page.htm';
    return user;
}

async function logoutUser(redirectUrl = 'login_page.htm') {
    localStorage.removeItem(USER_STORAGE_KEY);
    // Only pages that load the Firebase SDK have `auth`; clearing localStorage is enough elsewhere.
    if (typeof auth !== 'undefined') {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Sign out failed', error);
        }
    }
    window.location.href = redirectUrl;
}

// Pages that only have a dark design opt out with <body data-theme="dark">.
function applyTheme() {
    if (document.body.dataset.theme === 'dark') return;
    document.body.classList.toggle('light-mode', localStorage.getItem(THEME_STORAGE_KEY) === 'light');
}

function setLightMode(enabled) {
    localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'light' : 'dark');
    applyTheme();
}

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

// `tabs` maps each tab element's id to the id of the section it reveals. Inactive sections get
// display:none; the active one falls back to its stylesheet display (block, flex, ...).
function setupTabs(tabs) {
    function showTab(activeTabId) {
        for (const [tabId, sectionId] of Object.entries(tabs)) {
            const isActive = tabId === activeTabId;
            document.getElementById(tabId).classList.toggle('active', isActive);
            document.getElementById(sectionId).style.display = isActive ? '' : 'none';
        }
    }

    for (const tabId of Object.keys(tabs)) {
        document.getElementById(tabId).addEventListener('click', (event) => {
            event.preventDefault();
            showTab(tabId);
        });
    }
}

// localStorage never expires on its own, so sign people out after a stretch of inactivity.
function startIdleLogout() {
    if (!getCurrentUser()) return;

    let idleTimer = null;
    const resetTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => logoutUser('login_page.htm?timeout=1'), IDLE_LOGOUT_MS);
    };

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach((eventName) => {
        document.addEventListener(eventName, resetTimer, { passive: true });
    });
    resetTimer();
}

applyTheme();
renderNavbar();
startIdleLogout();
