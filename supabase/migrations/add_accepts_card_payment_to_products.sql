-- Migration: add accepts_card_payment column to products
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS accepts_card_payment boolean DEFAULT false;
