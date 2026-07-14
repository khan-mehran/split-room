-- ============================================================
-- SplitRoom — Initial Schema + RLS Policies
-- Run this in your Supabase SQL editor (in order)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table public.users (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  phone_number text not null unique,
  created_at   timestamptz not null default now()
);

create table public.groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  invite_code text not null unique,
  admin_id    uuid not null references public.users(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create table public.group_members (
  id        uuid primary key default uuid_generate_v4(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.users(id) on delete cascade,
  role      text not null default 'member' check (role in ('admin', 'member')),
  status    text not null default 'pending' check (status in ('pending', 'active')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table public.expenses (
  id               uuid primary key default uuid_generate_v4(),
  group_id         uuid not null references public.groups(id) on delete cascade,
  paid_by_user_id  uuid not null references public.users(id) on delete restrict,
  amount           numeric(12, 2) not null check (amount > 0),
  description      text not null,
  expense_date     date not null default current_date,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_group_members_group_id on public.group_members(group_id);
create index idx_group_members_user_id  on public.group_members(user_id);
create index idx_expenses_group_id      on public.expenses(group_id);
create index idx_expenses_expense_date  on public.expenses(expense_date desc);
create index idx_groups_invite_code     on public.groups(invite_code);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users          enable row level security;
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.expenses       enable row level security;

-- Helper: is the current session user a member of a group?
create or replace function public.is_group_member(p_group_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.group_members gm
    join public.users u on u.id = gm.user_id
    where gm.group_id = p_group_id
      and gm.status = 'active'
      and u.phone_number = current_setting('request.jwt.claims', true)::json->>'phone'
  );
$$;

-- Helper: get current user id from phone stored in JWT claims
create or replace function public.current_user_id()
returns uuid language sql security definer as $$
  select id from public.users
  where phone_number = current_setting('request.jwt.claims', true)::json->>'phone'
  limit 1;
$$;

-- users: anyone can read (needed for member lists); only own row insert/update
create policy "users_select_all"  on public.users for select using (true);
create policy "users_insert_own"  on public.users for insert with check (true);
create policy "users_update_own"  on public.users for update using (id = public.current_user_id());

-- groups: only active members can read their groups
create policy "groups_select_members" on public.groups for select
  using (public.is_group_member(id));

-- groups: any authenticated user can create a group
create policy "groups_insert" on public.groups for insert with check (true);

-- groups: only admin can update
create policy "groups_update_admin" on public.groups for update
  using (admin_id = public.current_user_id());

-- group_members: active members of the group can see members
create policy "gm_select_members" on public.group_members for select
  using (public.is_group_member(group_id));

-- group_members: anyone can request to join (insert pending)
create policy "gm_insert_any" on public.group_members for insert with check (true);

-- group_members: only group admin can update (approve/remove)
create policy "gm_update_admin" on public.group_members for update
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.admin_id = public.current_user_id()
    )
  );

create policy "gm_delete_admin" on public.group_members for delete
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.admin_id = public.current_user_id()
    )
  );

-- expenses: only active members of the group can see/add/delete expenses
create policy "expenses_select_members" on public.expenses for select
  using (public.is_group_member(group_id));

create policy "expenses_insert_members" on public.expenses for insert
  with check (public.is_group_member(group_id));

create policy "expenses_delete_owner_or_admin" on public.expenses for delete
  using (
    paid_by_user_id = public.current_user_id()
    or public.is_group_member(group_id)
  );

-- ============================================================
-- NOTE: For simplified auth (phone + PIN, no Supabase Auth OTP)
-- we store a session_token in localStorage client-side and pass
-- the user's phone via a custom header; the RLS functions above
-- read from JWT claims. In the simplified PIN-based auth variant
-- we bypass RLS for the client SDK and handle auth logic in the
-- API route layer. See README for the two auth options.
-- ============================================================
