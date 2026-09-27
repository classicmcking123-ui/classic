// Username rules and the live availability check used by sign-up and the profile page.
// Requires firebase-config.js (for `db`).

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const USERNAME_RULES = '3-20 characters: letters, numbers, underscores only';

const STATUS_COLORS = { error: '#ff4b2b', pending: '#888', success: '#25D366' };

async function isUsernameTaken(username) {
    const doc = await db.collection('usernames').doc(username.toLowerCase()).get();
    return doc.exists;
}

// Checks availability as the user types (debounced) and writes the result into `statusEl`.
// `onChange(state)` receives one of: empty, unchanged, invalid, checking, taken, available, error.
// On the profile page, pass `currentUsername` (a function) so the user's own handle isn't
// reported as taken.
function watchUsernameAvailability(input, statusEl, { currentUsername, onChange = () => {} } = {}) {
    let available = false;
    let latestCheckId = 0;
    let debounceTimer = null;

    function setStatus(state, text = '', color = '') {
        statusEl.textContent = text;
        statusEl.style.color = color;
        onChange(state);
    }

    const showTaken = () => setStatus('taken', 'Username is already taken', STATUS_COLORS.error);

    input.addEventListener('input', () => {
        const value = input.value.trim();
        const checkId = ++latestCheckId;
        clearTimeout(debounceTimer);
        available = false;

        if (currentUsername && value.toLowerCase() === currentUsername().toLowerCase()) {
            available = true;
            return setStatus('unchanged');
        }
        if (!value) return setStatus('empty');
        if (!USERNAME_PATTERN.test(value)) return setStatus('invalid', USERNAME_RULES, STATUS_COLORS.error);

        setStatus('checking', 'Checking availability...', STATUS_COLORS.pending);
        debounceTimer = setTimeout(async () => {
            try {
                const taken = await isUsernameTaken(value);
                if (checkId !== latestCheckId) return; // a newer keystroke superseded this check

                if (taken) {
                    showTaken();
                } else {
                    available = true;
                    setStatus('available', 'Username is available', STATUS_COLORS.success);
                }
            } catch (error) {
                if (checkId !== latestCheckId) return;
                console.error('Username availability check failed', error);
                setStatus('error', 'Could not check availability right now', STATUS_COLORS.error);
            }
        }, 400);
    });

    return {
        isAvailable: () => available,
        showTaken,
        clear: () => setStatus('empty')
    };
}
