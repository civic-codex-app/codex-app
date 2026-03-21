-- ============================================================
-- Fix: RLS infinite recursion on profiles table
-- The "Users can read own profile" policy referenced profiles
-- from within itself, causing cascading failures on any table
-- whose admin policy checks profiles.role
-- ============================================================

-- Drop the recursive policy
drop policy if exists "Users can read own profile" on profiles;

-- Recreate: everyone can read their own row,
-- and use auth.jwt() to check admin role without querying profiles
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select
  using (
    id = auth.uid()
    or (auth.jwt() ->> 'role') = 'service_role'
  );

-- Also add a policy for admins to read all profiles
-- Uses a security definer function to avoid recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

drop policy if exists "Admins can read all profiles" on profiles;
create policy "Admins can read all profiles"
  on profiles for select
  using (public.is_admin());

-- Now fix all other admin policies to use the same function
-- so they don't trigger profile RLS recursion

-- Politicians
drop policy if exists "Admins can insert politicians" on politicians;
create policy "Admins can insert politicians"
  on politicians for insert
  with check (public.is_admin());

drop policy if exists "Admins can update politicians" on politicians;
create policy "Admins can update politicians"
  on politicians for update
  using (public.is_admin());

drop policy if exists "Admins can delete politicians" on politicians;
create policy "Admins can delete politicians"
  on politicians for delete
  using (public.is_admin());

-- Bills
drop policy if exists "Admins can manage bills" on bills;
create policy "Admins can manage bills"
  on bills for all
  using (public.is_admin());

-- Voting records
drop policy if exists "Admins can manage voting records" on voting_records;
create policy "Admins can manage voting records"
  on voting_records for all
  using (public.is_admin());

-- Campaign finance
drop policy if exists "Admins can manage campaign finance" on campaign_finance;
create policy "Admins can manage campaign finance"
  on campaign_finance for all
  using (public.is_admin());

-- Issues
drop policy if exists "Admins can manage issues" on issues;
create policy "Admins can manage issues"
  on issues for all
  using (public.is_admin());

-- Politician issues
drop policy if exists "Admins can manage politician issues" on politician_issues;
create policy "Admins can manage politician issues"
  on politician_issues for all
  using (public.is_admin());

-- Committees
drop policy if exists "Admins can manage committees" on committees;
create policy "Admins can manage committees"
  on committees for all
  using (public.is_admin());

-- Politician committees
drop policy if exists "Admins can manage politician committees" on politician_committees;
create policy "Admins can manage politician committees"
  on politician_committees for all
  using (public.is_admin());

-- Polls
drop policy if exists "Admins can manage polls" on polls;
create policy "Admins can manage polls"
  on polls for all
  using (public.is_admin());

-- Poll options
drop policy if exists "Admins can manage poll options" on poll_options;
create policy "Admins can manage poll options"
  on poll_options for all
  using (public.is_admin());
