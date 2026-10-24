-- Outcome, no-show status, follow-up date, and session start time

alter table public.visits
  add column outcome text
    check (outcome in ('resolved', 'needs_follow_up', 'referred', 'parent_conference')),
  add column follow_up_date date,
  add column session_started_at timestamptz;

-- Allow the new 'no_show' status
alter table public.visits drop constraint visits_status_check;
alter table public.visits
  add constraint visits_status_check
  check (status in ('waiting', 'in_session', 'done', 'no_show'));

-- A finished visit must say how it ended
alter table public.visits
  add constraint done_needs_outcome check (status <> 'done' or outcome is not null);

-- The anonymous kiosk may still only insert a fresh, untouched visit
drop policy "kiosk can insert visits" on public.visits;
create policy "kiosk can insert visits" on public.visits
  for insert to anon, authenticated
  with check (
    status = 'waiting'
    and counselor_notes is null
    and time_out is null
    and handled_by is null
    and outcome is null
    and follow_up_date is null
    and session_started_at is null
  );
