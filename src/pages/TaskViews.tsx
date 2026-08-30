import TaskViewPage from '@/pages/TaskViewPage';
import { useAppContext } from '@/hooks/useAppContext';

export function AllTasks() {
  const { tasks, loading, toggleComplete, onAddTask, onEditTask, onDeleteTask } = useAppContext();
  return (
    <TaskViewPage
      title="All Tasks"
      view="all"
      tasks={tasks}
      loading={loading}
      toggleComplete={toggleComplete}
      onAddTask={onAddTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
    />
  );
}

export function TodayTasks() {
  const { tasks, loading, toggleComplete, onAddTask, onEditTask, onDeleteTask } = useAppContext();
  return (
    <TaskViewPage
      title="Today"
      view="today"
      tasks={tasks}
      loading={loading}
      toggleComplete={toggleComplete}
      onAddTask={onAddTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
    />
  );
}

export function UpcomingTasks() {
  const { tasks, loading, toggleComplete, onAddTask, onEditTask, onDeleteTask } = useAppContext();
  return (
    <TaskViewPage
      title="Upcoming"
      view="upcoming"
      tasks={tasks}
      loading={loading}
      toggleComplete={toggleComplete}
      onAddTask={onAddTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
    />
  );
}

export function CompletedTasks() {
  const { tasks, loading, toggleComplete, onAddTask, onEditTask, onDeleteTask } = useAppContext();
  return (
    <TaskViewPage
      title="Completed"
      view="completed"
      tasks={tasks}
      loading={loading}
      toggleComplete={toggleComplete}
      onAddTask={onAddTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
    />
  );
}

export function OverdueTasks() {
  const { tasks, loading, toggleComplete, onAddTask, onEditTask, onDeleteTask } = useAppContext();
  return (
    <TaskViewPage
      title="Overdue"
      view="overdue"
      tasks={tasks}
      loading={loading}
      toggleComplete={toggleComplete}
      onAddTask={onAddTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
    />
  );
}
