-- AEROX-ZENITH SUPABASE POSTGRES SCHEMA
-- Run this in your Supabase SQL Editor if you wish to persist to remote Postgres.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#00f0ff',
    view_mode TEXT NOT NULL DEFAULT 'list' CHECK (view_mode IN ('list', 'board', 'calendar')),
    is_team BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Sections Table
CREATE TABLE IF NOT EXISTS public.sections (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    section_id TEXT REFERENCES public.sections(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'p4' CHECK (priority IN ('p1', 'p2', 'p3', 'p4')),
    completed BOOLEAN NOT NULL DEFAULT false,
    due_date TEXT,
    deadline TEXT,
    parent_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
    labels TEXT[] DEFAULT '{}',
    assignee_id TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    comments JSONB DEFAULT '[]'::jsonb,
    recurrence TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Karma Profiles Table
CREATE TABLE IF NOT EXISTS public.karma_profiles (
    id TEXT PRIMARY KEY,
    points INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    daily_goal INTEGER NOT NULL DEFAULT 5,
    weekly_goal INTEGER NOT NULL DEFAULT 25,
    history JSONB DEFAULT '[]'::jsonb,
    last_active_date TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karma_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public access for anon key demo
CREATE POLICY "Public full access on projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Public full access on sections" ON public.sections FOR ALL USING (true);
CREATE POLICY "Public full access on tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Public full access on karma_profiles" ON public.karma_profiles FOR ALL USING (true);

-- 7. Add tables to Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.karma_profiles;
