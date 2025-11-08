-- Add unique constraint to phone number in profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);