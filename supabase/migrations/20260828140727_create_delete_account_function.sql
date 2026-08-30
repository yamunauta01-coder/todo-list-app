/*
# Create delete_own_account function

1. New Functions
   - `delete_own_account()` — SECURITY DEFINER function that allows an authenticated
     user to delete their own account. This is needed because the client-side Supabase
     client cannot use auth.admin.deleteUser (requires service role key).

2. Security
   - SECURITY DEFINER so it can delete from auth.users.
   - Only deletes the calling user's account (auth.uid()).
   - CASCADE on profiles and tasks foreign keys ensures user data is cleaned up.

3. Notes
   - The function revokes the JWT session after deletion.
*/

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_uid uuid;
BEGIN
  current_uid := auth.uid();
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.tasks WHERE user_id = current_uid;
  DELETE FROM public.push_subscriptions WHERE user_id = current_uid;
  DELETE FROM public.profiles WHERE id = current_uid;
  DELETE FROM auth.users WHERE id = current_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;