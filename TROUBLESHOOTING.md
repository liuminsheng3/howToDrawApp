# Troubleshooting Guide

## Schema Cache Error

If you see this error after running the SQL:
```
Could not find the 'completed_steps' column of 'tutorials' in the schema cache
```

### Solutions:

1. **Refresh Schema Cache (Recommended)**
   - Go to Supabase Dashboard
   - Navigate to Settings > API
   - Find "Schema cache" section
   - Click "Reload schema cache" button
   - Wait a few seconds for the cache to update

2. **Alternative: Restart Your Project**
   - Go to Supabase Dashboard
   - Settings > General
   - Click "Restart project"
   - This will force a schema refresh

3. **Quick Fix: Use the API without progress tracking**
   - The code already has fallbacks
   - It will work without the progress columns
   - Just the progress tracking won't be available

4. **Verify Columns Exist**
   Run this SQL to check:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'tutorials' 
   ORDER BY ordinal_position;
   ```

5. **Manual Cache Refresh via API**
   If you have the Supabase CLI:
   ```bash
   supabase db reset --db-url "your-database-url"
   ```

## Still Having Issues?

The app will still work without these columns! The API has fallback handling:
- Tutorials will generate successfully
- Images will be created and stored
- Only the progress tracking feature will be disabled