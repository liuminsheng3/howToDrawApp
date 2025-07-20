# How to Draw - AI Tutorial Generator

AI-powered drawing tutorial generator that creates step-by-step guides with illustrations.

## Features
- Generate custom drawing tutorials for any topic
- AI-generated step-by-step instructions 
- Black and white line art illustrations for each step
- Browse all generated tutorials
- Mobile-responsive design

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Storage)
- OpenRouter (GPT-4o for instructions)
- Replicate (Imagen-4 for illustrations)
- SWR (Data fetching)
- Vercel (Deployment)

## Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
create table tutorials (
  id uuid primary key default gen_random_uuid(),
  topic text, 
  title text, 
  intro text, 
  outro text,
  status text default 'ready',
  created_at timestamptz default now()
);

create table tutorial_steps (
  id bigserial primary key,
  tutorial_id uuid references tutorials(id) on delete cascade,
  step_number int, 
  text text,
  image_prompt text, 
  image_url text,
  created_at timestamptz default now()
);
```

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd how-to-draw-app
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Fill in your API keys in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `REPLICATE_API_TOKEN`: Your Replicate API token

4. Install dependencies:
```bash
npm install
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to GitHub

2. Import your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Configure environment variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local.example` with your actual values

4. Deploy:
   - Vercel will automatically deploy on push to main
   - Default build command: `next build`
   - Output: Next.js (Serverless/Edge Functions)

## API Endpoints

- `POST /api/generate` - Generate a new tutorial
  - Body: `{ topic: string }`
  - Returns: `{ id: string, status: string }`

## TODO (Future Features)

- [ ] Automated high-volume keyword scraping
- [ ] Batch generation task queue
- [ ] User authentication and saved tutorials
- [ ] Tutorial sharing and embedding
- [ ] Multiple art styles (not just line art)
- [ ] Progress tracking for multi-step tutorials
- [ ] PDF export functionality
- [ ] Tutorial categories and search
- [ ] Rate limiting and usage quotas
- [ ] Supabase RLS policies for data security

## Notes

- The generate API uses Edge Runtime by default for fast cold starts
- Images are generated at 1:1 aspect ratio for consistency
- Tutorial generation typically takes 30-60 seconds
- All tutorials are currently public (no auth required)