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
VITE_SUPABASE_ANON_KEY=<publishable-key>
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=your-password
```

## Available commands

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173, LAN via `host: true`) |
| `npm test` | Run Vitest (89 tests, excludes api.test.js) |
| `npm run test:watch` | Vitest watch mode |
| `npm run build` | Production build |
| `npx vitest run --reporter=verbose` | All tests with names |
| `npx vitest run tests/api.test.js` | API integration tests (excluded from default) |
