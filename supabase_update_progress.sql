-- Add progress tracking columns to tutorials table
ALTER TABLE tutorials 
ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_step TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completed_steps INTEGER DEFAULT 0;