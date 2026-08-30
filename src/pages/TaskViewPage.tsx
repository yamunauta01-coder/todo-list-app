import { useMemo, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { isToday, isUpcoming, isOverdue, priorityOrder } from '@/lib/utils';
import type { FilterOption, SortOption } from '@/lib/utils';
import type { Task } from '@/lib/supabase';
import TaskList from '@/components/TaskList';
import SearchToolbar from '@/components/SearchToolbar';

interface TaskViewPageProps {
  title: string;
  view: 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  toggleComplete: (task: Task) => void;
  tasks: Task[];
  loading: boolean;
}

export default function TaskViewPage({
  title,
  view,
  onAddTask,
  onEditTask,
  onDeleteTask,
  toggleComplete,
  tasks,
  loading,
}: TaskViewPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('dueDate');

  const viewFiltered = useMemo(() => {
    switch (view) {
      case 'today':
        return tasks.filter((t) => isToday(t));
      case 'upcoming':
        return tasks.filter((t) => isUpcoming(t));
      case 'completed':
        return tasks.filter((t) => t.status === 'completed');
      case 'overdue':
        return tasks.filter((t) => isOverdue(t));
      default:
        return tasks;
    }
  }, [tasks, view]);

  const filteredAndSorted = useMemo(() => {
    let result = [...viewFiltered];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }

    switch (filter) {
      case 'pending':
        result = result.filter((t) => t.status === 'pending');
        break;
      case 'completed':
        result = result.filter((t) => t.status === 'completed');
        break;
      case 'high':
      case 'medium':
      case 'low':
        result = result.filter((t) => t.priority === filter);
        break;
      case 'today':
        result = result.filter((t) => isToday(t));
        break;
      case 'upcoming':
        result = result.filter((t) => isUpcoming(t));
        break;
      case 'overdue':
        result = result.filter((t) => isOverdue(t));
        break;
    }

    switch (sort) {
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        });
        break;
      case 'priority':
        result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'created':
        result.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [viewFiltered, search, filter, sort]);

  const emptyMessages: Record<string, string> = {
    all: 'No tasks yet. Create your first task to get started.',
    today: 'No tasks scheduled for today. Enjoy your day!',
    upcoming: 'No upcoming tasks. You\'re all caught up!',
    completed: 'No completed tasks yet. Complete a task to see it here.',
    overdue: 'No overdue tasks. Great job staying on top of things!',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>

      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      <TaskList
        tasks={filteredAndSorted}
        loading={loading}
        onToggleComplete={toggleComplete}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onAddTask={onAddTask}
        emptyMessage={emptyMessages[view]}
      />
    </div>
  );
}
