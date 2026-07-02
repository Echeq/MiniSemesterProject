# [ARCHIVED] TODO — PivotPoint backend migration fixes

> [!NOTE]
> All tasks have been completed and verified. This file is kept for historical reference.
> The remaining item #4 is a manual step to be done during deployment.

- [x] Make avatar storage policies idempotent to prevent `supabase db reset` crash
- [x] Harden/redirect legacy RPC `public.delete_account()` to enforce "last admin" guard
- [x] Fix documentation mismatches for RPC/function signatures and role enum types
- [x] Update `AGENTS.md`
- [x] Update `docs/database.md`
- [ ] Verify by running `supabase db reset` / `supabase db push` (manual step)
---

**[? Back to Top](#) | [?? Documentation Index](../INDEX.md)**

