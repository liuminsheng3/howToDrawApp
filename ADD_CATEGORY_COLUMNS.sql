-- Add category and subcategory columns to tutorials table
ALTER TABLE tutorials 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_subcategory ON tutorials(subcategory);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_subcategory ON tutorials(category, subcategory);

-- Update existing tutorials with default categories based on topic
UPDATE tutorials 
SET 
  category = CASE 
    WHEN LOWER(topic) LIKE '%cat%' OR LOWER(topic) LIKE '%kitten%' THEN 'animal'
    WHEN LOWER(topic) LIKE '%dog%' OR LOWER(topic) LIKE '%puppy%' THEN 'animal'
    WHEN LOWER(topic) LIKE '%bird%' OR LOWER(topic) LIKE '%parrot%' OR LOWER(topic) LIKE '%eagle%' THEN 'animal'
    WHEN LOWER(topic) LIKE '%fish%' OR LOWER(topic) LIKE '%shark%' OR LOWER(topic) LIKE '%whale%' THEN 'animal'
    WHEN LOWER(topic) LIKE '%tree%' OR LOWER(topic) LIKE '%forest%' THEN 'nature'
    WHEN LOWER(topic) LIKE '%flower%' OR LOWER(topic) LIKE '%rose%' OR LOWER(topic) LIKE '%tulip%' THEN 'nature'
    WHEN LOWER(topic) LIKE '%mountain%' OR LOWER(topic) LIKE '%landscape%' THEN 'nature'
    WHEN LOWER(topic) LIKE '%car%' OR LOWER(topic) LIKE '%vehicle%' OR LOWER(topic) LIKE '%truck%' THEN 'object'
    WHEN LOWER(topic) LIKE '%house%' OR LOWER(topic) LIKE '%building%' THEN 'object'
    WHEN LOWER(topic) LIKE '%food%' OR LOWER(topic) LIKE '%fruit%' OR LOWER(topic) LIKE '%cake%' THEN 'object'
    WHEN LOWER(topic) LIKE '%face%' OR LOWER(topic) LIKE '%portrait%' OR LOWER(topic) LIKE '%person%' THEN 'people'
    WHEN LOWER(topic) LIKE '%cartoon%' OR LOWER(topic) LIKE '%character%' THEN 'people'
    ELSE 'other'
  END,
  subcategory = CASE 
    WHEN LOWER(topic) LIKE '%cat%' OR LOWER(topic) LIKE '%kitten%' THEN 'cats'
    WHEN LOWER(topic) LIKE '%dog%' OR LOWER(topic) LIKE '%puppy%' THEN 'dogs'
    WHEN LOWER(topic) LIKE '%bird%' OR LOWER(topic) LIKE '%parrot%' OR LOWER(topic) LIKE '%eagle%' THEN 'birds'
    WHEN LOWER(topic) LIKE '%fish%' OR LOWER(topic) LIKE '%shark%' OR LOWER(topic) LIKE '%whale%' THEN 'fish'
    WHEN LOWER(topic) LIKE '%tree%' OR LOWER(topic) LIKE '%forest%' THEN 'trees'
    WHEN LOWER(topic) LIKE '%flower%' OR LOWER(topic) LIKE '%rose%' OR LOWER(topic) LIKE '%tulip%' THEN 'flowers'
    WHEN LOWER(topic) LIKE '%mountain%' OR LOWER(topic) LIKE '%landscape%' THEN 'landscapes'
    WHEN LOWER(topic) LIKE '%car%' OR LOWER(topic) LIKE '%vehicle%' OR LOWER(topic) LIKE '%truck%' THEN 'vehicles'
    WHEN LOWER(topic) LIKE '%house%' OR LOWER(topic) LIKE '%building%' THEN 'buildings'
    WHEN LOWER(topic) LIKE '%food%' OR LOWER(topic) LIKE '%fruit%' OR LOWER(topic) LIKE '%cake%' THEN 'food'
    WHEN LOWER(topic) LIKE '%face%' OR LOWER(topic) LIKE '%portrait%' OR LOWER(topic) LIKE '%person%' THEN 'portraits'
    WHEN LOWER(topic) LIKE '%cartoon%' OR LOWER(topic) LIKE '%character%' THEN 'characters'
    ELSE 'misc'
  END
WHERE category IS NULL OR subcategory IS NULL;