-- Only counselors (staff) may edit visits. Admins can read and delete, not update.
-- (The app already blocks this; this makes the database enforce it too.)

create or replace function public.is_counselor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'counselor');
$$;

drop policy "staff update visits" on public.visits;
create policy "counselor update visits" on public.visits
  for update to authenticated
  using (public.is_counselor())
  with check (public.is_counselor());
