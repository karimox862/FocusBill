-- ============================================================
-- FIX: All integer columns that store Date.now() values → bigint
-- ============================================================
-- Date.now() produces values like 1773618958836 which exceed
-- the integer max of 2,147,483,647.
--
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- local_id columns (all 6 data tables)
ALTER TABLE public.clients    ALTER COLUMN local_id TYPE bigint;
ALTER TABLE public.projects   ALTER COLUMN local_id TYPE bigint;
ALTER TABLE public.time_logs  ALTER COLUMN local_id TYPE bigint;
ALTER TABLE public.invoices   ALTER COLUMN local_id TYPE bigint;
ALTER TABLE public.expenses   ALTER COLUMN local_id TYPE bigint;
ALTER TABLE public.notes      ALTER COLUMN local_id TYPE bigint;

-- client_id columns (also stores Date.now() from the extension)
ALTER TABLE public.projects   ALTER COLUMN client_id TYPE bigint;
ALTER TABLE public.invoices   ALTER COLUMN client_id TYPE bigint;

-- Add missing updated_at to time_logs
ALTER TABLE public.time_logs
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
