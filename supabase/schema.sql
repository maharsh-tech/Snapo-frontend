-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Images table
create table public.images (
  id              uuid primary key default uuid_generate_v4(),
  encrypted_code  text not null unique,
  mime_type       text not null,
  file_size       bigint,
  file_name       text,
  uploaded_at     timestamptz default now(),
  uploader_ip     text,
  user_id         uuid references auth.users(id) on delete set null,
  views           bigint default 0,
  is_deleted      boolean default false
);

-- Fast lookup indexes
create index idx_images_encrypted_code on public.images(encrypted_code);
create index idx_images_user_id on public.images(user_id);

-- Enable RLS (Row Level Security)
-- We enable RLS but do not create any public policies.
-- This ensures the table cannot be queried directly from the browser via the Anon Key.
-- The Next.js API routes will use the Service Role Key to bypass RLS.
alter table public.images enable row level security;
