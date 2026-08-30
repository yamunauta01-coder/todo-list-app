import { useState } from 'react';
import { User, Bell, Palette, LogOut, Trash2, Shield, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function Settings() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { permission, notificationsEnabled, requestPermission, setNotificationsEnabled } = useNotifications();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast('Name cannot be empty', 'error');
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile!.id);
    setSavingProfile(false);

    if (error) {
      toast('Failed to update profile', 'error');
    } else {
      await refreshProfile();
      toast('Profile updated', 'success');
    }
  };

  const handleChangePassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'error');
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);

    if (error) {
      toast(error.message, 'error');
    } else {
      setNewPassword('');
      toast('Password updated', 'success');
    }
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      toast('Notifications enabled', 'success');
    } else if (Notification.permission === 'denied') {
      toast('Notification permission denied. Please enable it in your browser settings.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_own_account');

    if (error) {
      toast('Account deletion could not be completed. Please contact support.', 'error');
    } else {
      toast('Account deleted', 'info');
      await signOut();
    }
  };

  const permissionLabel = {
    granted: 'Granted',
    denied: 'Denied',
    default: 'Not requested',
    unsupported: 'Not supported',
  }[permission];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Profile */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Permission status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{permissionLabel}</p>
            </div>
            <span
              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                permission === 'granted'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : permission === 'denied'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {permissionLabel}
            </span>
          </div>

          {permission === 'default' && (
            <button
              onClick={handleEnableNotifications}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Enable notifications
            </button>
          )}

          {permission === 'granted' && (
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Task reminders</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified before tasks are due</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative h-6 w-11 rounded-full transition ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${notificationsEnabled ? 'left-[22px]' : 'left-0.5'}`}
                />
              </button>
            </div>
          )}

          {permission === 'denied' && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              Notifications are blocked. Please enable them in your browser settings to receive reminders.
            </div>
          )}

          {permission === 'unsupported' && (
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Your browser does not support push notifications.
            </div>
          )}
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light' as const, label: 'Light', icon: Sun },
            { value: 'dark' as const, label: 'Dark', icon: Moon },
            { value: 'system' as const, label: 'System', icon: Monitor },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 py-4 transition ${
                  theme === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${theme === option.value ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${theme === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Account */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Account</h2>
        </div>

        <form onSubmit={handleChangePassword} className="mb-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            Change password
          </button>
        </form>

        <div className="space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5" /> Sign out
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-5 w-5" /> Delete account
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete account?"
        message="This will permanently delete your account and all your tasks. This action cannot be undone."
        confirmLabel="Delete account"
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
