# Frontend setup

## First time

```bash
cd frontend
npm install
cp .env.example .env   # then fill in Supabase credentials
npm run dev             # http://localhost:5173
```

## Environment variables

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_TEST_USER_EMAIL=test@example.com      # for integration tests
VITE_TEST_USER_PASSWORD=your-password       # for integration tests
```

## Available commands

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server (LAN: `host: true`) |
| `npm test` | Run Vitest (hits real Supabase) |
| `npm run test:watch` | Vitest watch mode |
| `npm run build` | Production build |
| `npx vitest run tests/api.test.js` | API integration tests (excluded from default) |
