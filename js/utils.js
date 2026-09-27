// Small, framework-free helpers shared across pages.

const DEPARTMENTS = [
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Computer Engineering',
    'Agricultural Engineering'
];

const AVATAR_COLORS = ['#ff416c', '#25D366', '#00c3ff', '#ffb300', '#8e44ad', '#e67e22'];

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

// Same email always maps to the same color, so a person's avatar looks the same everywhere.
function colorForEmail(email) {
    const key = email || '';
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function avatarGradient(email) {
    return `linear-gradient(145deg, ${colorForEmail(email)}, #16161a)`;
}

function initialsFor(name, email) {
    const source = (name || email || '?').trim();
    return source.split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// Appends <option>s to a <select>. Each option is either a plain string (used as both value and
// label) or a { value, label } object.
function addSelectOptions(select, options) {
    for (const option of options) {
        const { value, label } = typeof option === 'string' ? { value: option, label: option } : option;
        select.add(new Option(label, value));
    }
}
