-- Add PIN column to users table for cross-device authentication
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

alter table public.users add column if not exists pin text;

-- Existing users will have pin = null; they will need to re-register or reset.
-- The app enforces pin on new signups via the insert statement.
