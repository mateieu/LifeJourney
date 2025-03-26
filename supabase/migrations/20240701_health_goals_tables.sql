-- Create health_goals table
CREATE TABLE IF NOT EXISTS public.health_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    goal_type text NOT NULL,
    target_value numeric NOT NULL,
    current_value numeric DEFAULT 0,
    start_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
    target_date timestamp with time zone,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create health_activities table
CREATE TABLE IF NOT EXISTS public.health_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    activity_type text NOT NULL,
    value numeric NOT NULL,
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create health_suggestions table
CREATE TABLE IF NOT EXISTS public.health_suggestions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    suggestion_type text NOT NULL,
    content text NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create health_streaks table
CREATE TABLE IF NOT EXISTS public.health_streaks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    streak_type text NOT NULL,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_activity_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for health_goals
DROP POLICY IF EXISTS "Users can view own health goals" ON public.health_goals;
CREATE POLICY "Users can view own health goals"
    ON public.health_goals
    FOR SELECT
    USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own health goals" ON public.health_goals;
CREATE POLICY "Users can insert own health goals"
    ON public.health_goals
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own health goals" ON public.health_goals;
CREATE POLICY "Users can update own health goals"
    ON public.health_goals
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Create policies for health_activities
DROP POLICY IF EXISTS "Users can view own health activities" ON public.health_activities;
CREATE POLICY "Users can view own health activities"
    ON public.health_activities
    FOR SELECT
    USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own health activities" ON public.health_activities;
CREATE POLICY "Users can insert own health activities"
    ON public.health_activities
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Create policies for health_suggestions
DROP POLICY IF EXISTS "Users can view own health suggestions" ON public.health_suggestions;
CREATE POLICY "Users can view own health suggestions"
    ON public.health_suggestions
    FOR SELECT
    USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own health suggestions" ON public.health_suggestions;
CREATE POLICY "Users can update own health suggestions"
    ON public.health_suggestions
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Create policies for health_streaks
DROP POLICY IF EXISTS "Users can view own health streaks" ON public.health_streaks;
CREATE POLICY "Users can view own health streaks"
    ON public.health_streaks
    FOR SELECT
    USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own health streaks" ON public.health_streaks;
CREATE POLICY "Users can update own health streaks"
    ON public.health_streaks
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table health_goals;
alter publication supabase_realtime add table health_activities;
alter publication supabase_realtime add table health_suggestions;
alter publication supabase_realtime add table health_streaks;