-- Supabase Schema for Anti-Gravity Game Leaderboard

-- Create the leaderboard table
CREATE TABLE public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name VARCHAR(3) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast sorting by score (highest to lowest)
CREATE INDEX idx_leaderboard_score ON public.leaderboard (score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (so anyone can view the leaderboard)
CREATE POLICY "Allow public read access" ON public.leaderboard
    FOR SELECT
    USING (true);

-- Allow anonymous insert (so players can submit their scores)
CREATE POLICY "Allow public insert" ON public.leaderboard
    FOR INSERT
    WITH CHECK (true);
