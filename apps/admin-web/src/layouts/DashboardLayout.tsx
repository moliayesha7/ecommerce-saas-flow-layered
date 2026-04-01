import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '../stores/ui.store';
import { useMediaQuery } from '@saas-commerce/hooks';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export default function DashboardLayout() {
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen } = useUIStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          !isMobile && sidebarOpen
            ? sidebarCollapsed ? 'ml-16' : 'ml-64'
            : 'ml-0'
        }`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
