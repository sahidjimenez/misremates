-- Migration: add plan_key column to subscriptions
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_key text;
