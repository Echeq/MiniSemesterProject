# TODO — PivotPoint backend migration fixes

- [x] Make avatar storage policies idempotent to prevent `supabase db reset` crash
  - [x] Update `supabase/migrations/20260612140000_avatars_storage.sql`
  - [x] Update `supabase/migrations/20260617120100_account_management.sql`
- [x] Harden/redirect legacy RPC `public.delete_account()` to enforce “last admin” guard
  - [x] Update `supabase/migrations/20260617000000_delete_account_rpc.sql`
- [x] Fix documentation mismatches for RPC/function signatures and role enum types
  - [x] Update `AGENTS.md`
  - [x] Update `docs/database.md`
- [ ] Verify by running `supabase db reset` / `supabase db push` (manual step)
