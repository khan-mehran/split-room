-- Add period tracking to groups
-- Run this in Supabase SQL Editor after 003_fix_rls_for_pin_auth.sql

alter table public.groups add column if not exists last_cleared_at timestamptz;
