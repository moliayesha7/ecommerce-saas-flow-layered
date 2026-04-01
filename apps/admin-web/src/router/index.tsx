import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

const ProtectedRoute = React.lazy(() => import('./protected-route'));
const DashboardLayout = React.lazy(() => import('../layouts/DashboardLayout'));
const AuthLayout = React.lazy(() => import('../layouts/AuthLayout'));

const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const TenantsListPage = React.lazy(() => import('../pages/tenants/TenantsListPage'));
const TenantDetailPage = React.lazy(() => import('../pages/tenants/TenantDetailPage'));
const UsersListPage = React.lazy(() => import('../pages/users/UsersListPage'));
const PlansListPage = React.lazy(() => import('../pages/plans/PlansListPage'));
const PaymentsListPage = React.lazy(() => import('../pages/payments/PaymentsListPage'));
const AnalyticsPage = React.lazy(() => import('../pages/analytics/AnalyticsOverviewPage'));
const SettingsPage = React.lazy(() => import('../pages/settings/PlatformSettingsPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>}>
        <ProtectedRoute />
      </React.Suspense>
    ),
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'tenants', element: <TenantsListPage /> },
          { path: 'tenants/:id', element: <TenantDetailPage /> },
          { path: 'users', element: <UsersListPage /> },
          { path: 'plans', element: <PlansListPage /> },
          { path: 'payments', element: <PaymentsListPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <React.Suspense fallback={null}>
        <AuthLayout />
      </React.Suspense>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/login',
    element: (
      <React.Suspense fallback={null}>
        <LoginPage />
      </React.Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <React.Suspense fallback={null}>
        <NotFoundPage />
      </React.Suspense>
    ),
  },
]);
