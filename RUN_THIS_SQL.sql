-- IMPORTANT: Run this SQL in your Supabase SQL Editor
-- This file combines all necessary database updates

-- 1. Add progress tracking columns to tutorials table (from supabase_update_progress.sql)
ALTER TABLE tutorials 
ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_step TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completed_steps INTEGER DEFAULT 0;

-- 2. Add stored_image_url column to tutorial_steps table (from supabase_storage_setup.sql)
ALTER TABLE tutorial_steps 
ADD COLUMN IF NOT EXISTS stored_image_url TEXT;

-- 3. Create storage bucket for tutorial images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutorial-images', 'tutorial-images', true)
ON CONFLICT DO NOTHING;

-- 4. Set up storage policies
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'tutorial-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tutorial-images');

CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'tutorial-images');

CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'tutorial-images');

-- 5. Update existing tutorials to have default values
UPDATE tutorials 
SET total_steps = 0, completed_steps = 0 
WHERE total_steps IS NULL;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tutorials' 
AND column_name IN ('total_steps', 'current_step', 'completed_steps');