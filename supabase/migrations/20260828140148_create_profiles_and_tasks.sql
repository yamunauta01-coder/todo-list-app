/*
# Create profiles and tasks tables for the To-Do app

1. New Tables
   - `profiles`
     - `id` (uuid, primary key, references auth.users) — one row per user
     - `full_name` (text, not null) — display name shown on dashboard
     - `email` (text, not null) — cached email for convenience
     - `created_at` (timestamptz) — when the profile was created
     - `updated_at` (timestamptz) — last modification time
   - `tasks`
     - `id` (uuid, primary key)
     - `user_id` (uuid, not null, defaults to auth.uid()) — owner of the task
     - `title` (text, not null) — task title
     - `description` (text) — optional notes
     - `category` (text, default 'General') — category label
     - `priority` (text, default 'medium') — low | medium | high
     - `status` (text, default 'pending') — pending | completed
     - `due_date` (date) — optional due date
     - `due_time` (time) — optional due time
     - `reminder_time` (timestamptz) — optional reminder trigger time
     - `is_recurring` (boolean, default false) — whether the task repeats
     - `recurrence_type` (text, default 'none') — none | daily | weekly | monthly
     - `created_at` (timestamptz) — creation timestamp
     - `updated_at` (timestamptz) — last modification timestamp

2. Security
   - Enable RLS on both `profiles` and `tasks`.
   - `profiles`: users can read/update only their own profile row.
   - `tasks`: owner-scoped CRUD — each authenticated user can only access rows they own.
   - A trigger auto-creates a profile row when a new auth.users record is created.

3. Indexes
   - `tasks_user_id_idx` for filtering tasks by owner.
   - `tasks_due_date_idx` for date-based queries (today, upcoming, overdue).
   - `tasks_status_idx` for filtering by pending/completed.

4. Notes
   - `user_id` defaults to `auth.uid()` so frontend inserts that omit `user_id` still pass the INSERT WITH CHECK policy.
   - Email confirmation stays OFF (Supabase default for this project).
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  due_date date,
  due_time time,
  reminder_time timestamptz,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_type text NOT NULL DEFAULT 'none' CHECK (recurrence_type IN ('none','daily','weekly','monthly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);

-- Auto-create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on tasks
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();