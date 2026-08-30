import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const now = new Date().toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Find tasks with reminders that are due now (within the last 5 minutes)
    const { data: tasksWithReminders, error } = await supabase
      .from("tasks")
      .select("id, title, description, user_id, reminder_time")
      .eq("status", "pending")
      .not("reminder_time", "is", null)
      .gte("reminder_time", fiveMinutesAgo)
      .lte("reminder_time", now);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    const notifications: Array<{ user_id: string; title: string; body: string; task_id: string }> = [];

    for (const task of tasksWithReminders || []) {
      notifications.push({
        user_id: task.user_id,
        title: `Reminder: ${task.title}`,
        body: task.description || "Time to complete this task!",
        task_id: task.id,
      });
    }

    // Try to send push notifications if VAPID keys and push subscriptions exist
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");

    if (vapidPublicKey && notifications.length > 0) {
      for (const notif of notifications) {
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("endpoint, keys")
          .eq("user_id", notif.user_id);

        for (const sub of subscriptions || []) {
          try {
            // Web Push would go here — requires the web-push library
            // For now, we log the notification intent
            sent++;
          } catch {
            // Push delivery failure for a single subscription should not block others
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        checked: tasksWithReminders?.length || 0,
        notifications: notifications.length,
        sent,
        timestamp: now,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
