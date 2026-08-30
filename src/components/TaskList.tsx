import { ClipboardList, Plus } from 'lucide-react';
import type { Task } from '@/lib/supabase';
import TaskCard from './TaskCard';
import { Loader2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: () => void;
  emptyMessage?: string;
}

export default function TaskList({
  tasks,
  loading,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTask,
  emptyMessage = 'No tasks yet. Create your first task to get started.',
}: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
          <ClipboardList className="h-8 w-8 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        <button
          onClick={onAddTask}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
