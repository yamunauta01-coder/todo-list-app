import { useOutletContext } from 'react-router-dom';
import type { Task } from '@/lib/supabase';

export interface AppContextType {
  tasks: Task[];
  loading: boolean;
  toggleComplete: (task: Task) => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  taskFormOpen: boolean;
  onCloseTaskForm: () => void;
  editingTask: Task | null;
  onSubmitTask: (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  taskFormLoading: boolean;
  deleteTarget: Task | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function useAppContext() {
  return useOutletContext<AppContextType>();
}
