// JSONBin.io leaderboard service
// Stores the entire leaderboard as one JSON bin (array of entries)
// API: GET to read, PUT to update (read-modify-write pattern)

const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY || '';
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID || '';

// Fallback localStorage for when JSONBin is not configured
const STORAGE_KEY = 'designo-leaderboard';
const FALLBACK_LEADERBOARD = [
    { player_name: 'ACE', time_ms: 45000, rank: 1 },
    { player_name: 'FOX', time_ms: 52000, rank: 2 },
    { player_name: 'SKY', time_ms: 58000, rank: 3 },
    { player_name: 'JAX', time_ms: 63000, rank: 4 },
    { player_name: 'NEO', time_ms: 71000, rank: 5 },
];

const isConfigured = () => !!MASTER_KEY && !!BIN_ID;

// Read the leaderboard from JSONBin
export async function getLeaderboard(limit = 10) {
    if (!isConfigured()) {
        return getLocalLeaderboard(limit);
    }

    try {
        const res = await fetch(`${JSONBIN_BASE}/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Meta': 'false' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // data should be an array of { player_name, time_ms }
        const entries = Array.isArray(data) ? data : [];
        return entries
            .sort((a, b) => a.time_ms - b.time_ms)
            .slice(0, limit)
            .map((entry, i) => ({ ...entry, rank: i + 1 }));
    } catch (err) {
        console.error('JSONBin fetch failed, falling back to localStorage:', err);
        return getLocalLeaderboard(limit);
    }
}

// Submit a score — reads current data, appends, writes back
export async function submitScore(playerName, timeMs) {
    if (!playerName || !timeMs) {
        throw new Error('Player name and time are required');
    }

    const newEntry = {
        player_name: playerName.toUpperCase().slice(0, 20),
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

        // 3. Keep only top 50 entries (sorted by time)
        entries.sort((a, b) => a.time_ms - b.time_ms);
        entries = entries.slice(0, 50);

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
    const leaderboard = await getLeaderboard(100);
    return leaderboard.filter(entry => entry.time_ms < timeMs).length + 1;
}

// --- Local storage helpers ---
function getLocalLeaderboard(limit) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : FALLBACK_LEADERBOARD;
    return data
        .sort((a, b) => a.time_ms - b.time_ms)
        .slice(0, limit)
        .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

function submitLocal(entry) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const leaderboard = stored ? JSON.parse(stored) : [];
    leaderboard.push({ ...entry, id: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
    return entry;
}
