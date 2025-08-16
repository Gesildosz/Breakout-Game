-- Create game_progress table to store player progress
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 0,
  balls INTEGER NOT NULL DEFAULT 0,
  upgrades JSONB NOT NULL DEFAULT '{"ballSpeed": 1, "ballPower": 1, "coinMultiplier": 1}',
  prestige JSONB NOT NULL DEFAULT '{"level": 0, "multipliers": {"speed": 1, "power": 1, "coins": 1}}',
  settings JSONB NOT NULL DEFAULT '{"volume": 50}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);

-- Enable Row Level Security
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own data
CREATE POLICY "Users can only access their own game progress" ON game_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_game_progress_updated_at 
    BEFORE UPDATE ON game_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
