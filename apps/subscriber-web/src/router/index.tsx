import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';

const AuthLayout = React.lazy(() => import('../layouts/AuthLayout'));
const DashboardLayout = React.lazy(() => import('../layouts/DashboardLayout'));

const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const ProductsListPage = React.lazy(() => import('../pages/products/ProductsListPage'));
const ProductCreatePage = React.lazy(() => import('../pages/products/ProductCreatePage'));
const ProductEditPage = React.lazy(() => import('../pages/products/ProductEditPage'));
const CategoriesListPage = React.lazy(() => import('../pages/categories/CategoriesListPage'));
const InventoryListPage = React.lazy(() => import('../pages/inventory/InventoryListPage'));
const OrdersListPage = React.lazy(() => import('../pages/orders/OrdersListPage'));
const OrderDetailPage = React.lazy(() => import('../pages/orders/OrderDetailPage'));
const CustomersListPage = React.lazy(() => import('../pages/customers/CustomersListPage'));
const DiscountsListPage = React.lazy(() => import('../pages/discounts/DiscountsListPage'));
const ShippingZonesPage = React.lazy(() => import('../pages/shipping/ShippingZonesPage'));
const AnalyticsPage = React.lazy(() => import('../pages/analytics/AnalyticsPage'));
const StoreSettingsPage = React.lazy(() => import('../pages/settings/StoreSettingsPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'products', element: <ProductsListPage /> },
          { path: 'products/new', element: <ProductCreatePage /> },
          { path: 'products/:id/edit', element: <ProductEditPage /> },
          { path: 'categories', element: <CategoriesListPage /> },
          { path: 'inventory', element: <InventoryListPage /> },
          { path: 'orders', element: <OrdersListPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'customers', element: <CustomersListPage /> },
          { path: 'discounts', element: <DiscountsListPage /> },
          { path: 'shipping', element: <ShippingZonesPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <StoreSettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
