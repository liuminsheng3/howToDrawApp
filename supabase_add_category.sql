-- Add category fields to tutorials table
ALTER TABLE tutorials 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Create index for category queries
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category, subcategory);

-- Update existing tutorials with categories (optional)
-- UPDATE tutorials 
-- SET category = 'animal', 
--     subcategory = CASE 
--         WHEN LOWER(topic) LIKE '%cat%' THEN 'cats'
--         WHEN LOWER(topic) LIKE '%dog%' THEN 'dogs'
--         ELSE 'other'
--     END
-- WHERE category IS NULL;