import { NavLink } from 'react-router-dom';
import { Home, ListTodo, CalendarDays, CalendarClock, Settings, Plus } from 'lucide-react';

const navItems = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/tasks', label: 'Tasks', icon: ListTodo, end: false },
  { to: '/app/today', label: 'Today', icon: CalendarDays, end: false },
  { to: '/app/upcoming', label: 'Soon', icon: CalendarClock, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
];

interface MobileNavProps {
  onAddTask: () => void;
}

export default function MobileNav({ onAddTask }: MobileNavProps) {
  return (
    <>
      {/* Floating Add button */}
      <button
        onClick={onAddTask}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-700 active:scale-95 lg:hidden"
        aria-label="Add task"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
