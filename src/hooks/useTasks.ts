import { useCallback, useEffect, useState } from 'react';
import { supabase, type Task } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNotifications } from '@/context/NotificationContext';
import { isOverdue } from '@/lib/utils';

export function useTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { scheduleReminder } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast('Failed to load tasks', 'error');
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: user.id })
        .select()
        .single();

      if (error) {
        toast('Failed to create task', 'error');
        return null;
      }

      const newTask = data as Task;
      setTasks((prev) => [newTask, ...prev]);
      toast('Task created successfully', 'success');
      scheduleReminder(newTask);
      return newTask;
    },
    [user, toast, scheduleReminder],
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast('Failed to update task', 'error');
        return null;
      }

      const updated = data as Task;
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast('Task updated', 'success');
      return updated;
    },
    [toast],
  );

  const toggleComplete = useCallback(
    async (task: Task) => {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id)
        .select()
        .single();

      if (error) {
        toast('Failed to update task', 'error');
        return;
      }

      const updated = data as Task;
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      if (newStatus === 'completed') toast('Task completed!', 'success');
    },
    [toast],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        toast('Failed to delete task', 'error');
        return false;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast('Task deleted', 'info');
      return true;
    },
    [toast],
  );

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
    completionPercentage:
      tasks.length === 0
        ? 0
        : Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100),
  };

  return { tasks, loading, fetchTasks, createTask, updateTask, toggleComplete, deleteTask, stats };
}
