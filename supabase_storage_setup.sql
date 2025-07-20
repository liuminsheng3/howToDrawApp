-- Create a storage bucket for tutorial images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutorial-images', 'tutorial-images', true)
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'tutorial-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tutorial-images');

CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'tutorial-images');

CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'tutorial-images');

-- Add stored_image_url column to tutorial_steps table
ALTER TABLE tutorial_steps 
ADD COLUMN IF NOT EXISTS stored_image_url TEXT;