-- SQL script to create 'news' table in Supabase
CREATE TABLE IF NOT EXISTS public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  slug TEXT,
  published_at TIMESTAMPTZ
);
