-- Migration: add stock column to products
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock integer;
