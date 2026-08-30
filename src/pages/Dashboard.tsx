import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getGreeting, isToday, isOverdue, isUpcoming } from '@/lib/utils';
import DashboardStats from '@/components/DashboardStats';
import TaskList from '@/components/TaskList';
import { useAppContext } from '@/hooks/useAppContext';

export default function Dashboard() {
  const { profile } = useAuth();
  const { tasks, loading, toggleComplete, onAddTask, onEditTask, onDeleteTask } = useAppContext();

  const todayTasks = useMemo(() => tasks.filter((t) => isToday(t) && t.status === 'pending'), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter((t) => isOverdue(t)), [tasks]);
  const upcomingTasks = useMemo(() => tasks.filter((t) => isUpcoming(t) && t.status === 'pending'), [tasks]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: overdueTasks.length,
    completionPercentage:
      tasks.length === 0
        ? 0
        : Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100),
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <CalendarDays className="h-4 w-4" /> {today}
        </p>
      </div>

      <DashboardStats {...stats} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{todayTasks.length} tasks</span>
        </div>
        <TaskList
          tasks={todayTasks}
          loading={loading}
          onToggleComplete={toggleComplete}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onAddTask={onAddTask}
          emptyMessage="No tasks scheduled for today. Enjoy your day or add a new task."
        />
      </div>

      {overdueTasks.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Overdue</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{overdueTasks.length} tasks</span>
          </div>
          <TaskList
            tasks={overdueTasks}
            loading={false}
            onToggleComplete={toggleComplete}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onAddTask={onAddTask}
          />
        </div>
      )}

      {upcomingTasks.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{upcomingTasks.length} tasks</span>
          </div>
          <TaskList
            tasks={upcomingTasks.slice(0, 5)}
            loading={false}
            onToggleComplete={toggleComplete}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onAddTask={onAddTask}
          />
        </div>
      )}
    </div>
  );
}
