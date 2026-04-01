import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-secondary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">SaaS Commerce</h1>
          <p className="mt-1 text-primary-200">Admin Dashboard</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
