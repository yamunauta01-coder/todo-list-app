import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import TaskForm from '@/components/TaskForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/context/ToastContext';
import type { Task } from '@/lib/supabase';

export default function AppLayout() {
  const { createTask, updateTask, toggleComplete, deleteTask, tasks, loading } = useTasks();
  const { toast } = useToast();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormLoading, setTaskFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const openAddTask = useCallback(() => {
    setEditingTask(null);
    setTaskFormOpen(true);
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  const closeTaskForm = useCallback(() => {
    setTaskFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleSubmitTask = useCallback(
    async (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      setTaskFormLoading(true);
      if (editingTask) {
        await updateTask(editingTask.id, data);
      closeTaskForm();
      setTaskFormLoading(false);
      return;
      }
      const created = await createTask(data);
      if (created) {
        closeTaskForm();
      }
      setTaskFormLoading(false);
    },
    [editingTask, createTask, updateTask, closeTaskForm],
  );

  const handleDeleteTask = useCallback((task: Task) => {
    setDeleteTarget(task);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteTask(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteTask]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden pb-24 lg:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet
            context={{
              tasks,
              loading,
              toggleComplete,
              onAddTask: openAddTask,
              onEditTask: openEditTask,
              onDeleteTask: handleDeleteTask,
              taskFormOpen,
              onCloseTaskForm: closeTaskForm,
              editingTask,
              onSubmitTask: handleSubmitTask,
              taskFormLoading,
              deleteTarget,
              onConfirmDelete: confirmDelete,
              onCancelDelete: () => setDeleteTarget(null),
            }}
          />
        </div>
      </main>

      <MobileNav onAddTask={openAddTask} />

      <TaskForm
        open={taskFormOpen}
        onClose={closeTaskForm}
        onSubmit={handleSubmitTask}
        task={editingTask}
        loading={taskFormLoading}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task?"
        message={`"${deleteTarget?.title}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
