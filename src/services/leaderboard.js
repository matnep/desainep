import { supabase } from '../lib/supabaseClient.js';

// Fallback localStorage for when Supabase is not configured
const STORAGE_KEY = 'designo-leaderboard';
const FALLBACK_LEADERBOARD = [
    { player_name: 'ACE', time_ms: 45000, rank: 1 },
    { player_name: 'FOX', time_ms: 52000, rank: 2 },
    { player_name: 'SKY', time_ms: 58000, rank: 3 },
    { player_name: 'JAX', time_ms: 63000, rank: 4 },
    { player_name: 'NEO', time_ms: 71000, rank: 5 },
];

const isSupabaseConfigured = () => {
    return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Get all leaderboard entries sorted by time (best first)
export async function getLeaderboard(limit = 100) {
    if (!isSupabaseConfigured()) {
        // Fallback to localStorage or default data
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : FALLBACK_LEADERBOARD;
        return data
            .sort((a, b) => a.time_ms - b.time_ms)
            .slice(0, limit)
            .map((entry, i) => ({ ...entry, rank: i + 1 }));
    }

    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('time_ms', { ascending: true })
            .limit(limit);

        if (error) throw error;

        // Add rank to each entry
        return data.map((entry, i) => ({ ...entry, rank: i + 1 }));
    } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return data.sort((a, b) => a.time_ms - b.time_ms).slice(0, limit);
        }
        return FALLBACK_LEADERBOARD;
    }
}

// Submit a new score to the leaderboard
export async function submitScore(playerName, timeMs) {
    if (!playerName || !timeMs) {
        throw new Error('Player name and time are required');
    }

    const newEntry = {
        player_name: playerName.toUpperCase().slice(0, 20),
        time_ms: Math.round(timeMs),
    };

    if (!isSupabaseConfigured()) {
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const leaderboard = stored ? JSON.parse(stored) : [];
        leaderboard.push({
            ...newEntry,
            id: Date.now(),
            created_at: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
        return newEntry;
    }

    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .insert([newEntry])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Failed to submit score:', err);
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const leaderboard = stored ? JSON.parse(stored) : [];
        leaderboard.push({
            ...newEntry,
            id: Date.now(),
            created_at: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
        return newEntry;
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
    const leaderboard = await getLeaderboard();
    const rank = leaderboard.filter(entry => entry.time_ms < timeMs).length + 1;
    return rank;
}
