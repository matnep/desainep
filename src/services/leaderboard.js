const API_BASE = 'https://simpleboards.dev/api';
const CORS_PROXY = 'https://corsproxy.io/?url=';
const API_KEY = import.meta.env.VITE_SIMPLEBOARDS_API_KEY || '';
const LEADERBOARD_ID = import.meta.env.VITE_SIMPLEBOARDS_LEADERBOARD_ID || '';

// Use proxy in production (GitHub Pages), direct in localhost
const proxied = (url) => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return url;
    }
    return `${CORS_PROXY}${encodeURIComponent(url)}`;
};

// Fallback localStorage for when SimpleBoards is not configured
const STORAGE_KEY = 'designo-leaderboard';
const FALLBACK_LEADERBOARD = [
    { player_name: 'ACE', time_ms: 45000, rank: 1 },
    { player_name: 'FOX', time_ms: 52000, rank: 2 },
    { player_name: 'SKY', time_ms: 58000, rank: 3 },
    { player_name: 'JAX', time_ms: 63000, rank: 4 },
    { player_name: 'NEO', time_ms: 71000, rank: 5 },
];

const isConfigured = () => !!API_KEY && !!LEADERBOARD_ID;

// Get leaderboard entries from SimpleBoards (sorted by score ascending = fastest time)
export async function getLeaderboard(limit = 10) {
    if (!isConfigured()) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : FALLBACK_LEADERBOARD;
        return data
            .sort((a, b) => a.time_ms - b.time_ms)
            .slice(0, limit)
            .map((entry, i) => ({ ...entry, rank: i + 1 }));
    }

    try {
        const res = await fetch(
            proxied(`${API_BASE}/leaderboards/${LEADERBOARD_ID}/entries`),
            { headers: { 'x-api-key': API_KEY } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const entries = await res.json();

        // SimpleBoards returns entries; map to our format
        // Score = time in ms (lower is better)
        return entries
            .sort((a, b) => a.Score - b.Score)
            .slice(0, limit)
            .map((entry, i) => ({
                id: entry.Id || entry.PlayerId,
                player_name: entry.PlayerDisplayName || entry.PlayerId,
                time_ms: entry.Score,
                rank: i + 1,
            }));
    } catch (err) {
        console.error('SimpleBoards fetch failed, falling back to localStorage:', err);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return data.sort((a, b) => a.time_ms - b.time_ms).slice(0, limit)
                .map((entry, i) => ({ ...entry, rank: i + 1 }));
        }
        return FALLBACK_LEADERBOARD;
    }
}

// Submit a score to SimpleBoards
export async function submitScore(playerName, timeMs) {
    if (!playerName || !timeMs) {
        throw new Error('Player name and time are required');
    }

    const cleanName = playerName.toUpperCase().slice(0, 20);
    const score = Math.round(timeMs);

    if (!isConfigured()) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const leaderboard = stored ? JSON.parse(stored) : [];
        const newEntry = {
            id: Date.now(),
            player_name: cleanName,
            time_ms: score,
            created_at: new Date().toISOString(),
        };
        leaderboard.push(newEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
        return newEntry;
    }

    try {
        const res = await fetch(proxied(`${API_BASE}/entries`), {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LeaderboardId: LEADERBOARD_ID,
                PlayerId: `player_${cleanName}_${Date.now()}`,
                PlayerDisplayName: cleanName,
                Score: score,
                Metadata: JSON.stringify({ game: 'designo-rocket' }),
            }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('SimpleBoards submit failed, saving locally:', err);
        const stored = localStorage.getItem(STORAGE_KEY);
        const leaderboard = stored ? JSON.parse(stored) : [];
        leaderboard.push({
            id: Date.now(),
            player_name: cleanName,
            time_ms: score,
            created_at: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
        return { player_name: cleanName, time_ms: score };
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
    const rank = leaderboard.filter(entry => entry.time_ms < timeMs).length + 1;
    return rank;
}
