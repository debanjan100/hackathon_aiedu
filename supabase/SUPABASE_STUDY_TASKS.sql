-- Study Tasks Table Structure
-- (Includes RLS, updated_at trigger, and default values)

-- 1. Create the table if not already exists
CREATE TABLE IF NOT EXISTS public.study_tasks ( 
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, 
  title TEXT NOT NULL, 
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium', 
  scheduled_date DATE DEFAULT NULL, 
  is_completed BOOLEAN DEFAULT FALSE, 
  created_at TIMESTAMPTZ DEFAULT NOW(), 
  updated_at TIMESTAMPTZ DEFAULT NOW() 
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can only see their own tasks
CREATE POLICY "Users can view their own study tasks" 
ON public.study_tasks FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own tasks
CREATE POLICY "Users can insert their own study tasks" 
ON public.study_tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own tasks
CREATE POLICY "Users can update their own study tasks" 
ON public.study_tasks FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own tasks
CREATE POLICY "Users can delete their own study tasks" 
ON public.study_tasks FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create trigger for automatically updating 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_tasks_updated_at
    BEFORE UPDATE ON public.study_tasks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 5. Enable Realtime for this table
-- (Note: Run this if not already enabled via Supabase dashboard)
-- ALTER TABLE public.study_tasks REPLICA IDENTITY FULL;
-- Add the table to the 'supabase_realtime' publication
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
--     CREATE PUBLICATION supabase_realtime;
--   END IF;
--   ALTER PUBLICATION supabase_realtime ADD TABLE public.study_tasks;
-- END $$;
