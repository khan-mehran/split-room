-- ============================================================
-- Fix RLS policies for PIN-based auth (no Supabase Auth JWT)
-- The helper functions current_user_id() / is_group_member()
-- rely on JWT claims which don't exist in our auth model.
-- Replace all policies with open anon-friendly ones — auth is
-- enforced at the application layer instead.
-- ============================================================

-- Drop JWT-dependent policies
drop policy if exists "groups_select_members"          on public.groups;
drop policy if exists "groups_insert"                  on public.groups;
drop policy if exists "groups_update_admin"            on public.groups;

drop policy if exists "gm_select_members"              on public.group_members;
drop policy if exists "gm_insert_any"                  on public.group_members;
drop policy if exists "gm_update_admin"                on public.group_members;
drop policy if exists "gm_delete_admin"                on public.group_members;

drop policy if exists "expenses_select_members"        on public.expenses;
drop policy if exists "expenses_insert_members"        on public.expenses;
drop policy if exists "expenses_delete_owner_or_admin" on public.expenses;

drop policy if exists "users_update_own"               on public.users;

-- Replace with open policies (app layer handles authorization)
create policy "groups_all"   on public.groups        for all using (true) with check (true);
create policy "gm_all"       on public.group_members for all using (true) with check (true);
create policy "expenses_all" on public.expenses      for all using (true) with check (true);
create policy "users_update" on public.users         for update using (true) with check (true);
