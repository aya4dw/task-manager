import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { LayoutDashboard, KanbanSquare } from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: '仪表盘' },
  { path: '/kanban', icon: <KanbanSquare className="w-5 h-5" />, label: '看板' },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  return (
    <div className="h-screen bg-gray-100 flex" style={{ height: '100vh' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg" style={{ height: '100vh' }}>
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">任务管理系统</h1>
          <p className="text-xs text-gray-500 mt-1">Task Manager</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <p className="text-xs text-gray-400">
            v1.0.0 • Built with React
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" style={{ height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
