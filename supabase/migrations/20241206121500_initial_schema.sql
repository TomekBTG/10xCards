-- 20241206121500_initial_schema.sql
-- Description: Initial database schema for 10xCards flashcard application
-- Created tables: users (managed by Supabase Auth), flashcards, flashcard_generation_logs
-- Includes indexes, relationships, and RLS policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-----------------------
-- Table definitions --
-----------------------

-- NOTE: The users table is automatically managed by Supabase Auth
-- Reference it via auth.users

-- Flashcard generation logs to track AI generation statistics
create table if not exists public.flashcard_generation_logs (
  id uuid primary key not null default uuid_generate_v4(),
  generated_at timestamptz not null default now(),
  generation_duration integer not null, -- in milliseconds
  user_input text not null,
  number_generated integer not null,
  user_id uuid not null references auth.users(id) on delete cascade
);

comment on table public.flashcard_generation_logs is 'Tracks statistics about AI-generated flashcards';

-- Flashcards table for storing user's flashcards
create table if not exists public.flashcards (
  id uuid primary key not null default uuid_generate_v4(),
  front varchar(200) not null check (char_length(front) <= 200),
  back varchar(500) not null check (char_length(back) <= 500),
  status varchar not null check (status in ('accepted', 'rejected', 'pending')),
  is_ai_generated boolean not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_generation_logs_id uuid references public.flashcard_generation_logs(id) on delete set null
);

comment on table public.flashcards is 'Stores flashcards created by users';

--------------
-- Indexes --
--------------

create index if not exists idx_flashcards_user_id on public.flashcards(user_id);
create index if not exists idx_flashcards_is_public on public.flashcards(is_public);
create index if not exists idx_flashcards_status on public.flashcards(status);
create index if not exists idx_flashcards_generation_logs_id on public.flashcards(flashcard_generation_logs_id);

------------------------------
-- Row Level Security (RLS) --
------------------------------

-- Enable RLS on all tables
alter table public.flashcards enable row level security;
alter table public.flashcard_generation_logs enable row level security;

-- Flashcards RLS policies

-- Policy for authenticated users to select their own flashcards or public ones
create policy "Users can view their own flashcards or public ones" 
on public.flashcards for select 
to authenticated
using (auth.uid() = user_id or is_public = true);

-- Policy for anonymous users to only view public flashcards
create policy "Anonymous users can only view public flashcards" 
on public.flashcards for select 
to anon
using (is_public = true);

-- Policy for authenticated users to insert their own flashcards
create policy "Users can insert their own flashcards" 
on public.flashcards for insert 
to authenticated
with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own flashcards
create policy "Users can update their own flashcards" 
on public.flashcards for update 
to authenticated
using (auth.uid() = user_id);

-- Policy for authenticated users to delete their own flashcards
create policy "Users can delete their own flashcards" 
on public.flashcards for delete 
to authenticated
using (auth.uid() = user_id);

-- Flashcard generation logs RLS policies

-- Policy for authenticated users to select their own generation logs
create policy "Users can view their own generation logs" 
on public.flashcard_generation_logs for select 
to authenticated
using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own generation logs
create policy "Users can insert their own generation logs" 
on public.flashcard_generation_logs for insert 
to authenticated
with check (auth.uid() = user_id);

-- No update/delete policies for generation logs as they should be immutable records 