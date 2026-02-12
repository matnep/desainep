-- Run this SQL in your Supabase SQL Editor to set up the leaderboard table

-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL CHECK (char_length(player_name) <= 20),
    time_ms INTEGER NOT NULL CHECK (time_ms > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_time_ms ON leaderboard(time_ms ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);

-- Enable Row Level Security (optional - remove if you want open access)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read the leaderboard
CREATE POLICY "Allow public read access"
    ON leaderboard FOR SELECT
    TO public
    USING (true);

-- Create policy to allow anyone to insert their own score
CREATE POLICY "Allow public insert access"
    ON leaderboard FOR INSERT
    TO public
    WITH CHECK (true);

-- Create a function to get top scores
CREATE OR REPLACE FUNCTION get_top_scores(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    id UUID,
    player_name TEXT,
    time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    rank INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.player_name,
        l.time_ms,
        l.created_at,
        RANK() OVER (ORDER BY l.time_ms ASC) as rank
    FROM leaderboard l
    ORDER BY l.time_ms ASC
    LIMIT limit_count;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_top_scores(INTEGER) TO public;
