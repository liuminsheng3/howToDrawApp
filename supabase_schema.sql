-- Create tutorials table
CREATE TABLE IF NOT EXISTS tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    intro TEXT NOT NULL,
    outro TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'generating',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create tutorial_steps table
CREATE TABLE IF NOT EXISTS tutorial_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutorial_id UUID NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    image_prompt TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON tutorials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorial_steps_tutorial_id ON tutorial_steps(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_steps_step_number ON tutorial_steps(tutorial_id, step_number);

-- Enable Row Level Security (RLS)
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
-- Allow anyone to read tutorials
CREATE POLICY "Enable read access for all users" ON tutorials
    FOR SELECT USING (true);

-- Allow anyone to insert tutorials
CREATE POLICY "Enable insert for all users" ON tutorials
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update tutorials
CREATE POLICY "Enable update for all users" ON tutorials
    FOR UPDATE USING (true);

-- Allow anyone to read tutorial steps
CREATE POLICY "Enable read access for all users" ON tutorial_steps
    FOR SELECT USING (true);

-- Allow anyone to insert tutorial steps
CREATE POLICY "Enable insert for all users" ON tutorial_steps
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update tutorial steps
CREATE POLICY "Enable update for all users" ON tutorial_steps
    FOR UPDATE USING (true);