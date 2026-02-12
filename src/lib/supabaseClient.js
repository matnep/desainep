import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
// https://supabase.com/dashboard/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Leaderboard will use fallback mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
