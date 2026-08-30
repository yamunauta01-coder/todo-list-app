/*
# Create push_subscriptions table for web push notifications

1. New Tables
   - `push_subscriptions`
     - `id` (uuid, primary key)
     - `user_id` (uuid, not null, references auth.users) — owner
     - `endpoint` (text, not null) — push service endpoint URL
     - `keys` (jsonb) — p256dh and auth keys for encryption
     - `created_at` (timestamptz)

2. Security
   - Enable RLS on `push_subscriptions`.
   - Owner-scoped CRUD: users can only manage their own push subscriptions.

3. Notes
   - This table stores browser push subscription data so the edge function can send
     push notifications to users when task reminders are due.
   - VAPID keys must be configured as edge function secrets for full push delivery.
*/

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  keys jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON push_subscriptions;
CREATE POLICY "select_own_subscriptions" ON push_subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON push_subscriptions;
CREATE POLICY "insert_own_subscriptions" ON push_subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON push_subscriptions;
CREATE POLICY "delete_own_subscriptions" ON push_subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions(user_id);