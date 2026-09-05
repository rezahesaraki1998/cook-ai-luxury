-- Add payment gateway link to subscription plans
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS payment_link TEXT;
