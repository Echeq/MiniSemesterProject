# Supabase setup

1. Create a free account at https://supabase.com
2. Create a new project
3. Copy your `URL` and `anon key` from Project Settings > API
4. Create `frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Backend is pure Supabase — no server code to run. Database schema and Edge Functions go in `supabase/`.
