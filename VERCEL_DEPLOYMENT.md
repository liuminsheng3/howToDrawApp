# Vercel Deployment Guide

## Environment Variables (CRITICAL!)

You MUST set these environment variables in Vercel Dashboard:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each of these variables ONE BY ONE:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
REPLICATE_API_TOKEN=your_replicate_token
```

## Important Notes

1. **Runtime**: We use Node.js runtime (not Edge) because:
   - Edge runtime doesn't support background tasks
   - We need to generate images asynchronously

2. **Timeout**: Maximum 60 seconds for the generate endpoint

3. **After Adding Environment Variables**:
   - Redeploy your application
   - Go to Deployments → Three dots → Redeploy

## Debugging Deployment Issues

1. Check Function Logs:
   - Vercel Dashboard → Functions → View logs

2. Test endpoints:
   - `/api/test` - Tests all service connections
   - `/api/test-replicate` - Tests image generation
   - `/api/debug/[tutorial-id]` - Debug specific tutorial

3. Common Issues:
   - Missing environment variables
   - API key format issues
   - Timeout errors (consider breaking into smaller tasks)