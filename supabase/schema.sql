-- ============================================================
-- FocusBill — Supabase Database Schema
-- ============================================================
-- Fully idempotent — safe to run multiple times.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================
-- Extension users who opt into cloud sync or analytics.

create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  display_name text,
  plan        text not null default 'free'
                check (plan in ('free', 'pro', 'enterprise')),
  extension_version text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_plan  on public.users (plan);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- RLS
alter table public.users enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users can read own row') then
    create policy "Users can read own row" on public.users for select using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users can update own row') then
    create policy "Users can update own row" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users can insert own row') then
    create policy "Users can insert own row" on public.users for insert with check (auth.uid() = id);
  end if;
end $$;

-- ============================================================
-- 2. EXTENSION EVENTS (telemetry / analytics)
-- ============================================================
-- High-volume table — every timer start, stop, feature use, etc.
-- Consider partitioning by month if volume exceeds ~1M rows/month.

create table if not exists public.extension_events (
  id          bigint generated always as identity primary key,
  user_id     uuid references public.users(id) on delete set null,
  event_type  text not null,
  metadata    jsonb not null default '{}',
  extension_version text,
  created_at  timestamptz not null default now()
);

comment on table public.extension_events is
  'Telemetry events from the browser extension. event_type values: '
  'timer_start, timer_stop, timer_complete, timer_pause, '
  'blocking_enabled, blocking_disabled, invoice_generated, '
  'client_created, project_created, expense_added, '
  'extension_installed, extension_updated, settings_changed';

create index if not exists idx_ext_events_type       on public.extension_events (event_type);
create index if not exists idx_ext_events_created    on public.extension_events (created_at);
create index if not exists idx_ext_events_user       on public.extension_events (user_id);
create index if not exists idx_ext_events_user_type  on public.extension_events (user_id, event_type);

alter table public.extension_events enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='extension_events' and policyname='Users can insert own events') then
    create policy "Users can insert own events" on public.extension_events for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='extension_events' and policyname='Service role can read all events') then
    create policy "Service role can read all events" on public.extension_events for select using (auth.role() = 'service_role');
  end if;
end $$;

-- ============================================================
-- 3. BILLING EVENTS (subscriptions & payments)
-- ============================================================
-- Populated by webhook handlers (Stripe, Paddle, etc.)

create table if not exists public.billing_events (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references public.users(id) on delete cascade,
  event_type       text not null
                     check (event_type in (
                       'subscription_created', 'subscription_updated',
                       'subscription_cancelled', 'subscription_renewed',
                       'payment_succeeded', 'payment_failed',
                       'refund_issued', 'plan_changed', 'trial_started',
                       'trial_ended'
                     )),
  plan             text,
  amount_cents     integer,
  currency         text not null default 'usd',
  provider         text,
  provider_event_id text,
  metadata         jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

create index if not exists idx_billing_user      on public.billing_events (user_id);
create index if not exists idx_billing_type      on public.billing_events (event_type);
create index if not exists idx_billing_created   on public.billing_events (created_at);
create index if not exists idx_billing_provider  on public.billing_events (provider_event_id);

alter table public.billing_events enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='billing_events' and policyname='Users can read own billing events') then
    create policy "Users can read own billing events" on public.billing_events for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='billing_events' and policyname='Service role full access') then
    create policy "Service role full access" on public.billing_events for all using (auth.role() = 'service_role');
  end if;
end $$;

-- ============================================================
-- 4. ERROR LOGS
-- ============================================================
-- Client-side errors and exceptions reported by the extension.

create table if not exists public.error_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid references public.users(id) on delete set null,
  error_type  text not null
                check (error_type in (
                  'runtime_error', 'api_error', 'storage_error',
                  'extension_crash', 'network_error', 'validation_error'
                )),
  message     text,
  stack_trace text,
  context     jsonb not null default '{}',
  severity    text not null default 'error'
                check (severity in ('warning', 'error', 'critical')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_errors_type      on public.error_logs (error_type);
create index if not exists idx_errors_severity  on public.error_logs (severity);
create index if not exists idx_errors_created   on public.error_logs (created_at);
create index if not exists idx_errors_user      on public.error_logs (user_id);

alter table public.error_logs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='error_logs' and policyname='Users can insert errors') then
    create policy "Users can insert errors" on public.error_logs for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='error_logs' and policyname='Service role can read errors') then
    create policy "Service role can read errors" on public.error_logs for select using (auth.role() = 'service_role');
  end if;
end $$;

-- ============================================================
-- 5. AUDIT LOG
-- ============================================================
-- Immutable record of security-relevant actions.

create table if not exists public.audit_log (
  id            bigint generated always as identity primary key,
  actor_id      uuid references public.users(id) on delete set null,
  action        text not null,
  resource_type text,
  resource_id   text,
  old_value     jsonb,
  new_value     jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

comment on column public.audit_log.action is
  'Action types: user.created, user.deleted, user.login, user.logout, '
  'settings.changed, data.exported, data.deleted, '
  'subscription.created, subscription.cancelled, admin.action';

create index if not exists idx_audit_actor    on public.audit_log (actor_id);
create index if not exists idx_audit_action   on public.audit_log (action);
create index if not exists idx_audit_created  on public.audit_log (created_at);
create index if not exists idx_audit_resource on public.audit_log (resource_type, resource_id);

alter table public.audit_log enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='audit_log' and policyname='Authenticated users can insert audit entries') then
    create policy "Authenticated users can insert audit entries" on public.audit_log for insert with check (auth.uid() = actor_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='audit_log' and policyname='Service role can read audit log') then
    create policy "Service role can read audit log" on public.audit_log for select using (auth.role() = 'service_role');
  end if;
end $$;

-- ============================================================
-- 6. WAITLIST (upgrade existing table)
-- ============================================================
-- The waitlist table already exists in Supabase.
-- These ALTER statements safely add the new columns.

alter table public.waitlist
  add column if not exists status text not null default 'pending';

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'waitlist_status_check' and conrelid = 'public.waitlist'::regclass
  ) then
    alter table public.waitlist
      add constraint waitlist_status_check
      check (status in ('pending', 'invited', 'converted'));
  end if;
end $$;

alter table public.waitlist
  add column if not exists invited_at timestamptz;

create index if not exists idx_waitlist_status on public.waitlist (status);
create index if not exists idx_waitlist_email  on public.waitlist (email);

alter table public.waitlist enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='waitlist' and policyname='Anyone can join waitlist') then
    create policy "Anyone can join waitlist" on public.waitlist for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='waitlist' and policyname='Service role can manage waitlist') then
    create policy "Service role can manage waitlist" on public.waitlist for all using (auth.role() = 'service_role');
  end if;
end $$;

-- ============================================================
-- HELPER: Audit log insert function
-- ============================================================

create or replace function public.log_audit_event(
  p_actor_id      uuid,
  p_action        text,
  p_resource_type text default null,
  p_resource_id   text default null,
  p_old_value     jsonb default null,
  p_new_value     jsonb default null,
  p_ip_address    inet default null,
  p_user_agent    text default null
)
returns void as $$
begin
  insert into public.audit_log (
    actor_id, action, resource_type, resource_id,
    old_value, new_value, ip_address, user_agent
  ) values (
    p_actor_id, p_action, p_resource_type, p_resource_id,
    p_old_value, p_new_value, p_ip_address, p_user_agent
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- DATA RETENTION (schedule via pg_cron or external cron)
-- ============================================================
--
-- Delete extension events older than 90 days:
--   delete from public.extension_events
--   where created_at < now() - interval '90 days';
--
-- Delete error logs older than 30 days:
--   delete from public.error_logs
--   where created_at < now() - interval '30 days';
--
-- Archive audit logs older than 1 year (export first):
--   delete from public.audit_log
--   where created_at < now() - interval '1 year';

-- ============================================================
-- SCALING NOTES
-- ============================================================
-- 1. extension_events: Partition by created_at (monthly) if
--    volume exceeds ~1M rows/month.
-- 2. Create materialized views for DAU, event counts, error rates.
-- 3. Consider a read replica for analytics queries.
-- 4. Use Supabase Edge Functions for Stripe webhook handlers.
