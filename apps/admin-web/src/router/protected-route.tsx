import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { UserRole } from '@saas-commerce/types';

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== UserRole.SUPER_ADMIN) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
