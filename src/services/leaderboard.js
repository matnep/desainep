// JSONBin.io leaderboard service
// Stores the entire leaderboard as one JSON bin (array of entries)
// API: GET to read, PUT to update (read-modify-write pattern)

const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY || '';
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID || '';

// Fallback localStorage for when JSONBin is not configured
const STORAGE_KEY = 'designo-leaderboard';
const PLAYER_ID_KEY = 'designo-player-id';
const PLAYER_NAME_KEY = 'designo-player-name';
const FALLBACK_LEADERBOARD = [
    { player_name: 'ACE', time_ms: 45000, rank: 1 },
    { player_name: 'FOX', time_ms: 52000, rank: 2 },
    { player_name: 'SKY', time_ms: 58000, rank: 3 },
    { player_name: 'JAX', time_ms: 63000, rank: 4 },
    { player_name: 'NEO', time_ms: 71000, rank: 5 },
];

const MAX_ENTRIES = 10;
const MIN_VALID_TIME_MS = 5000;
const MAX_VALID_TIME_MS = 30 * 60 * 1000;
const REQUIRED_ASTEROIDS = 10;
const REQUIRED_BOSS_HITS = 50;

const isConfigured = () => !!MASTER_KEY && !!BIN_ID;

function sanitizePlayerName(name) {
    return String(name || '').trim().toUpperCase().slice(0, 20);
}

function createPlayerId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `player_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCurrentPlayerId() {
    let playerId = localStorage.getItem(PLAYER_ID_KEY);
    if (!playerId) {
        playerId = createPlayerId();
        localStorage.setItem(PLAYER_ID_KEY, playerId);
    }
    return playerId;
}

export function getCurrentPlayerName() {
    return sanitizePlayerName(localStorage.getItem(PLAYER_NAME_KEY) || '');
}

export function setCurrentPlayerName(nextName) {
    const safeName = sanitizePlayerName(nextName);
    if (!safeName) {
        localStorage.removeItem(PLAYER_NAME_KEY);
        return '';
    }
    localStorage.setItem(PLAYER_NAME_KEY, safeName);
    return safeName;
}

function getEntryIdentity(entry) {
    if (entry.player_id) return entry.player_id;
    return String(entry.player_name || '').trim().toUpperCase();
}

// Deduplicate: keep only the best (lowest) time per player identity
// Identity is player_id when present, otherwise legacy player_name.
function deduplicateBest(entries) {
    const best = new Map();
    for (const entry of entries) {
        const identity = getEntryIdentity(entry);
        if (!identity) continue;
        if (!best.has(identity) || entry.time_ms < best.get(identity).time_ms) {
            best.set(identity, entry);
        }
    }
    return Array.from(best.values());
}

// Read the leaderboard from JSONBin
export async function getLeaderboard(limit = MAX_ENTRIES) {
    if (!isConfigured()) {
        return getLocalLeaderboard(limit);
    }

    try {
        const res = await fetch(`${JSONBIN_BASE}/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Meta': 'false' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const entries = deduplicateBest(Array.isArray(data) ? data : []);
        return entries
            .sort((a, b) => a.time_ms - b.time_ms)
            .slice(0, limit)
            .map((entry, i) => ({ ...entry, rank: i + 1 }));
    } catch (err) {
        console.error('JSONBin fetch failed, falling back to localStorage:', err);
        return getLocalLeaderboard(limit);
    }
}

function validateScoreSubmission(timeMs, analytics) {
    if (!Number.isFinite(timeMs)) {
        return { valid: false, reason: 'Invalid completion time.' };
    }
    if (timeMs < MIN_VALID_TIME_MS) {
        return { valid: false, reason: 'Run rejected: completion time is unrealistically low.' };
    }
    if (timeMs > MAX_VALID_TIME_MS) {
        return { valid: false, reason: 'Run rejected: completion time exceeded the leaderboard limit.' };
    }
    if (!analytics) {
        return { valid: true };
    }

    const shotsFired = Number(analytics.shotsFired ?? 0);
    const asteroidsDestroyed = Number(analytics.asteroidsDestroyed ?? 0);
    const bossHits = Number(analytics.bossHits ?? 0);
    const totalHits = Number(analytics.totalHits ?? (Number(analytics.shotsHitAsteroids ?? 0) + bossHits));

    if (shotsFired < 0 || asteroidsDestroyed < 0 || bossHits < 0 || totalHits < 0) {
        return { valid: false, reason: 'Run rejected: invalid combat metrics.' };
    }
    if (totalHits > shotsFired) {
        return { valid: false, reason: 'Run rejected: hit count exceeds shots fired.' };
    }
    if (asteroidsDestroyed < REQUIRED_ASTEROIDS) {
        return { valid: false, reason: 'Run rejected: asteroid objective was not met.' };
    }
    if (bossHits < REQUIRED_BOSS_HITS) {
        return { valid: false, reason: 'Run rejected: insufficient boss hits recorded.' };
    }

    return { valid: true };
}

// Submit a score — only keeps best time per player identity, max 10 entries.
export async function submitScore(playerName, timeMs, options = {}) {
    const validation = validateScoreSubmission(timeMs, options.analytics);
    if (!validation.valid) {
        throw new Error(validation.reason);
    }

    const safeName = sanitizePlayerName(playerName) || getCurrentPlayerName();
    if (!safeName) {
        throw new Error('Player name is required');
    }
    const playerId = getCurrentPlayerId();
    setCurrentPlayerName(safeName);

    const newEntry = {
        player_name: safeName,
        player_id: playerId,
        time_ms: Math.round(timeMs),
        created_at: new Date().toISOString(),
    };

    if (!isConfigured()) {
        return submitLocal(newEntry);
    }

    try {
        // 1. Read current leaderboard
        const readRes = await fetch(`${JSONBIN_BASE}/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Meta': 'false' },
        });
        let entries = [];
        if (readRes.ok) {
            const data = await readRes.json();
            entries = Array.isArray(data) ? data : [];
        }

        // 2. Append new entry
        entries.push(newEntry);

        // Keep profile name consistent across old runs for the same player.
        entries = entries.map((entry) => (
            getEntryIdentity(entry) === playerId
                ? { ...entry, player_id: playerId, player_name: safeName }
                : entry
        ));

        // 3. Deduplicate (best time per player identity), sort, keep top 10
        entries = deduplicateBest(entries);
        entries.sort((a, b) => a.time_ms - b.time_ms);
        entries = entries.slice(0, MAX_ENTRIES);

        // 4. Write back to JSONBin
        const writeRes = await fetch(`${JSONBIN_BASE}/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY,
            },
            body: JSON.stringify(entries),
        });
        if (!writeRes.ok) throw new Error(`PUT failed: HTTP ${writeRes.status}`);

        return newEntry;
    } catch (err) {
        console.error('JSONBin submit failed, saving locally:', err);
        return submitLocal(newEntry);
    }
}

// Format time from milliseconds to readable format
export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = ms % 1000;

    if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    return `${remainingSeconds}.${milliseconds.toString().padStart(3, '0')}`;
}

// Get the current player's rank for a given time
export async function getPlayerRank(timeMs) {
    const leaderboard = await getLeaderboard(MAX_ENTRIES);
    return leaderboard.filter(entry => entry.time_ms < timeMs).length + 1;
}

// --- Local storage helpers ---
function getLocalLeaderboard(limit) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : FALLBACK_LEADERBOARD;
    return deduplicateBest(data)
        .sort((a, b) => a.time_ms - b.time_ms)
        .slice(0, limit)
        .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

function submitLocal(entry) {
    const stored = localStorage.getItem(STORAGE_KEY);
    let leaderboard = stored ? JSON.parse(stored) : [];
    leaderboard.push({ ...entry, id: Date.now() });
    leaderboard = leaderboard.map((saved) => (
        getEntryIdentity(saved) === entry.player_id
            ? { ...saved, player_id: entry.player_id, player_name: entry.player_name }
            : saved
    ));
    leaderboard = deduplicateBest(leaderboard);
    leaderboard.sort((a, b) => a.time_ms - b.time_ms);
    leaderboard = leaderboard.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
    return entry;
}
