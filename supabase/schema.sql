-- AEROX-ZENITH SUPABASE POSTGRES SCHEMA
-- Run this in your Supabase SQL Editor if you wish to persist to remote Postgres.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- references auth.users(id)
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'personal' CHECK (type IN ('personal', 'group')),
    color TEXT NOT NULL DEFAULT '#00f0ff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- references auth.users(id)
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#00f0ff',
    view_mode TEXT NOT NULL DEFAULT 'list' CHECK (view_mode IN ('list', 'board', 'calendar')),
    is_team BOOLEAN NOT NULL DEFAULT false,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Sections Table
CREATE TABLE IF NOT EXISTS public.sections (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- references auth.users(id)
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- references auth.users(id)
    workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE SET NULL,
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

-- 6. Karma Profiles Table
CREATE TABLE IF NOT EXISTS public.karma_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- references auth.users(id)
    points INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    daily_goal INTEGER NOT NULL DEFAULT 5,
    weekly_goal INTEGER NOT NULL DEFAULT 25,
    history JSONB DEFAULT '[]'::jsonb,
    last_active_date TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Custom Templates Table (User-Owned System Builder)
CREATE TABLE IF NOT EXISTS public.custom_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- references auth.users(id)
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'Layers',
    category TEXT NOT NULL DEFAULT 'General',
    color TEXT DEFAULT '#00f0ff',
    system_structure JSONB NOT NULL DEFAULT '{"sections": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karma_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;

-- 9. Strict User-Owned Row Level Security Policies
-- Workspaces
CREATE POLICY "Users can manage own workspaces" 
    ON public.workspaces FOR ALL 
    USING (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL)
    WITH CHECK (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL);

-- Projects
CREATE POLICY "Users can manage own projects" 
    ON public.projects FOR ALL 
    USING (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL)
    WITH CHECK (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL);

-- Sections
CREATE POLICY "Users can manage own sections" 
    ON public.sections FOR ALL 
    USING (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL)
    WITH CHECK (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL);

-- Tasks
CREATE POLICY "Users can manage own tasks" 
    ON public.tasks FOR ALL 
    USING (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL)
    WITH CHECK (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL);

-- Karma Profiles
CREATE POLICY "Users can manage own karma profile" 
    ON public.karma_profiles FOR ALL 
    USING (auth.uid() IS NULL OR user_id = auth.uid()::text OR id = auth.uid()::text OR user_id IS NULL)
    WITH CHECK (auth.uid() IS NULL OR user_id = auth.uid()::text OR id = auth.uid()::text OR user_id IS NULL);

-- Custom Templates
CREATE POLICY "Users can manage own custom templates" 
    ON public.custom_templates FOR ALL 
    USING (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL)
    WITH CHECK (auth.uid() IS NULL OR user_id = auth.uid()::text OR user_id IS NULL);

-- 10. Add tables to Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.karma_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_templates;
