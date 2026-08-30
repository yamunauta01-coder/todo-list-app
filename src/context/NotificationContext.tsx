import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { Task } from '@/lib/supabase';

type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

interface NotificationContextValue {
  permission: NotificationPermission;
  notificationsEnabled: boolean;
  requestPermission: () => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => void;
  scheduleReminder: (task: Task) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('notificationsEnabled') === 'true';
  });

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as NotificationPermission);
  }, []);

  const registerPushSubscription = useCallback(async () => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
      });

      const subData = sub.toJSON();
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: subData.endpoint,
          keys: subData.keys,
        },
        { onConflict: 'user_id,endpoint' },
      );
    } catch {
      // Push subscription may fail if VAPID keys aren't configured — non-blocking
    }
  }, [user]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    if (Notification.permission === 'granted') {
      setPermission('granted');
      return;
    }
    if (Notification.permission === 'denied') {
      setPermission('denied');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
    if (result === 'granted') {
      await registerPushSubscription();
    }
  }, [registerPushSubscription]);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem('notificationsEnabled', String(enabled));
    setNotificationsEnabledState(enabled);
  }, []);

  const scheduleReminder = useCallback(
    (task: Task) => {
      if (!notificationsEnabled || permission !== 'granted') return;
      if (!task.reminder_time) return;

      const reminderTime = new Date(task.reminder_time).getTime();
      const now = Date.now();
      const delay = reminderTime - now;

      if (delay <= 0) return;

      setTimeout(() => {
        const n = new Notification(`Reminder: ${task.title}`, {
          body: task.description || 'Time to complete this task!',
          icon: '/icons/icon-192.png',
          tag: task.id,
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      }, delay);
    },
    [notificationsEnabled, permission],
  );

  // Check for due reminders periodically while the app is open
  useEffect(() => {
    if (!user || !notificationsEnabled || permission !== 'granted') return;

    const checkReminders = async () => {
      const now = new Date().toISOString();
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .not('reminder_time', 'is', null)
        .gte('reminder_time', tenMinutesAgo)
        .lte('reminder_time', now);

      if (data) {
        const alreadyNotified = JSON.parse(
          localStorage.getItem('notifiedReminders') || '[]',
        ) as string[];
        data.forEach((task: Task) => {
          if (!alreadyNotified.includes(task.id)) {
            new Notification(`Reminder: ${task.title}`, {
              body: task.description || 'Time to complete this task!',
              icon: '/icons/icon-192.png',
              tag: task.id,
            });
            alreadyNotified.push(task.id);
            localStorage.setItem('notifiedReminders', JSON.stringify(alreadyNotified.slice(-50)));
          }
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [user, notificationsEnabled, permission]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        notificationsEnabled,
        requestPermission,
        setNotificationsEnabled,
        scheduleReminder,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
