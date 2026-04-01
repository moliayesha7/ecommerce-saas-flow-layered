import React from 'react';
import { Menu, ChevronLeft, ChevronRight, Bell, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '@saas-commerce/ui';

interface TopBarProps {
  collapsed: boolean;
  onMenuOpen: () => void;
  onToggleCollapse: () => void;
}

export default function TopBar({ collapsed, onMenuOpen, onToggleCollapse }: TopBarProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-secondary-200 bg-white px-4">
      <button
        onClick={onMenuOpen}
        className="rounded-md p-2 text-secondary-500 hover:bg-secondary-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onToggleCollapse}
        className="hidden rounded-md p-2 text-secondary-500 hover:bg-secondary-100 md:flex"
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>

      <div className="flex-1" />

      <button className="relative rounded-md p-2 text-secondary-500 hover:bg-secondary-100">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-500" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden text-sm font-medium text-secondary-700 sm:block">
          {user?.firstName} {user?.lastName}
        </span>
      </div>

      <Button variant="ghost" size="icon-sm" onClick={logout} title="Logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
