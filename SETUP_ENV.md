# Environment Setup Instructions

## Important: You need to create a `.env.local` file

The application won't work without proper environment variables. Follow these steps:

1. Create a file named `.env.local` in the root directory
2. Copy the following content and replace with your actual API keys:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key

# Replicate API Configuration
REPLICATE_API_TOKEN=your_replicate_api_token
```

## How to get these keys:

### Supabase
1. Go to https://app.supabase.com
2. Create a new project or select existing
3. Go to Settings > API
4. Copy the URL, anon key, and service role key

### OpenRouter
1. Go to https://openrouter.ai
2. Sign up/login
3. Go to Keys section
4. Create a new API key

### Replicate
1. Go to https://replicate.com
2. Sign up/login
3. Go to Account Settings
4. Copy your API token

## Testing your configuration

After setting up `.env.local`, visit: http://localhost:3000/api/test

This will show you which services are properly configured.