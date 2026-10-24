-- Guidance Office Visit Log: tables + Row Level Security

create extension if not exists "pgcrypto";

-- Staff profiles (one per guidance staff account in auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'counselor' check (role in ('counselor', 'admin')),
  created_at timestamptz not null default now()
);

-- One row per student visit
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  student_name text not null check (char_length(student_name) between 2 and 120),
  student_number text not null check (char_length(student_number) between 3 and 30),
  grade_level text not null check (char_length(grade_level) between 1 and 40),
  section text not null check (char_length(section) between 1 and 60),
  purpose text not null check (purpose in (
    'counseling', 'referral', 'consultation', 'career_guidance',
    'document_request', 'excuse_slip', 'complaint_report',
    'scholarship_assistance', 'others'
  )),
  purpose_other text check (char_length(purpose_other) <= 120),
  details text check (char_length(details) <= 1000),
  status text not null default 'waiting' check (status in ('waiting', 'in_session', 'done')),
  counselor_notes text,
  time_in timestamptz not null default now(),
  time_out timestamptz,
  handled_by uuid references auth.users (id),
  constraint others_needs_text check (purpose <> 'others' or purpose_other is not null)
);

create index visits_time_in_idx on public.visits (time_in desc);
create index visits_student_number_idx on public.visits (student_number);

-- Helper functions (security definer so RLS on profiles does not recurse)
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.visits enable row level security;

-- profiles: staff can read all profiles; users can read their own row
create policy "staff read profiles" on public.profiles
  for select to authenticated
  using (public.is_staff() or id = auth.uid());

-- visits: anonymous kiosk may ONLY insert (cannot read, update or delete)
create policy "kiosk can insert visits" on public.visits
  for insert to anon, authenticated
  with check (
    status = 'waiting'
    and counselor_notes is null
    and time_out is null
    and handled_by is null
  );

create policy "staff read visits" on public.visits
  for select to authenticated
  using (public.is_staff());

create policy "staff update visits" on public.visits
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "admin delete visits" on public.visits
  for delete to authenticated
  using (public.is_admin());

-- Do not let the kiosk's anon role touch anything beyond INSERT
revoke all on public.visits from anon;
grant insert on public.visits to anon;
revoke all on public.profiles from anon;

-- To create the first staff member:
--   1. Supabase Dashboard > Authentication > Users > Add user (email + password)
--   2. insert into public.profiles (id, full_name, role)
--      values ('<that user id>', 'Full Name', 'admin');
