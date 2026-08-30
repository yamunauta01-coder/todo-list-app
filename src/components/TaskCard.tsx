import { CheckCircle2, Circle, Pencil, Trash2, Clock, Bell, Repeat, AlertTriangle } from 'lucide-react';
import type { Task } from '@/lib/supabase';
import { formatDate, formatTime, isOverdue, priorityColors, priorityDot, priorityBorder } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const completed = task.status === 'completed';
  const overdue = isOverdue(task);

  return (
    <div
      className={`group relative rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${priorityBorder[task.priority]} ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task)}
          className="mt-0.5 shrink-0 text-gray-300 transition hover:text-blue-600 dark:text-gray-600"
        >
          {completed ? (
            <CheckCircle2 className="h-6 w-6 fill-emerald-500 text-white" />
          ) : (
            <Circle className="h-6 w-6" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-medium text-gray-900 dark:text-white ${
                completed ? 'line-through' : ''
              }`}
            >
              {task.title}
            </h3>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => onEdit(task)}
                className="rounded-lg p-1.5 text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="rounded-lg p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[task.priority]}`} />
              {task.priority}
            </span>

            <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {task.category}
            </span>

            {task.due_date && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                  overdue
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <Clock className="h-3 w-3" />
                {formatDate(task.due_date)}
                {task.due_time && ` ${formatTime(task.due_time)}`}
              </span>
            )}

            {overdue && (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" /> Overdue
              </span>
            )}

            {task.reminder_time && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Bell className="h-3 w-3" />
                {new Date(task.reminder_time).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}

            {task.is_recurring && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <Repeat className="h-3 w-3" /> {task.recurrence_type}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
