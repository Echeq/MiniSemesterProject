create unique index if not exists join_requests_unique_pending
  on public.join_requests (requester_id)
  where status = 'pending';
