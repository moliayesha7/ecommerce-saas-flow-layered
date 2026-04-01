import React from 'react';
import { Menu, Bell, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';
import { authApi } from '../../api/auth.api';

export default function TopBar() {
  const { user, refreshToken, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-4 shadow-sm">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-secondary-500 hover:bg-secondary-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-secondary-500 hover:bg-secondary-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger-500" />
        </button>

        <div className="flex items-center gap-2 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-secondary-900">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-secondary-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
