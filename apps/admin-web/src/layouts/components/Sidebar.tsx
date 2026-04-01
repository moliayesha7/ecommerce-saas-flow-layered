import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, CreditCard, BarChart3,
  Settings, Package, FileText, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { cn } from '@saas-commerce/ui';
import { useUIStore } from '../../stores/ui.store';
import { useMediaQuery } from '@saas-commerce/hooks';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Store, label: 'Tenants', to: '/tenants' },
  { icon: Users, label: 'Users', to: '/users' },
  { icon: Package, label: 'Plans', to: '/plans' },
  { icon: CreditCard, label: 'Payments', to: '/payments' },
  { icon: BarChart3, label: 'Analytics', to: '/analytics' },
  { icon: FileText, label: 'Reports', to: '/reports' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export default function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleCollapsed } = useUIStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const collapsed = !isMobile && sidebarCollapsed;

  if (isMobile && !sidebarOpen) return null;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-secondary-900 text-white transition-all duration-300',
        isMobile ? 'w-64' : collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-secondary-700 px-4">
        {!collapsed && (
          <div>
            <span className="text-lg font-bold text-white">SaaS Commerce</span>
            <p className="text-xs text-secondary-400">Admin Panel</p>
          </div>
        )}
        <button
          onClick={isMobile ? () => setSidebarOpen(false) : toggleCollapsed}
          className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-700 hover:text-white"
        >
          {isMobile ? (
            <X className="h-5 w-5" />
          ) : collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-300 hover:bg-secondary-700 hover:text-white',
                    collapsed && 'justify-center px-2',
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
