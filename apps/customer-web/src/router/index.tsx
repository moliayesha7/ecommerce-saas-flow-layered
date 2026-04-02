import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

const StorefrontLayout = React.lazy(() => import('../layouts/StorefrontLayout'));
const AccountLayout = React.lazy(() => import('../layouts/AccountLayout'));

const HomePage = React.lazy(() => import('../pages/home/HomePage'));
const ProductListPage = React.lazy(() => import('../pages/shop/ProductListPage'));
const ProductDetailPage = React.lazy(() => import('../pages/shop/ProductDetailPage'));
const CartPage = React.lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage = React.lazy(() => import('../pages/checkout/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('../pages/checkout/OrderConfirmationPage'));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const ProfilePage = React.lazy(() => import('../pages/account/ProfilePage'));
const OrdersPage = React.lazy(() => import('../pages/account/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('../pages/account/OrderDetailPage'));
const WishlistPage = React.lazy(() => import('../pages/account/WishlistPage'));
const AddressesPage = React.lazy(() => import('../pages/account/AddressesPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: <StorefrontLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <ProductListPage /> },
      { path: '/product/:slug', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/checkout',
        element: <RequireAuth><CheckoutPage /></RequireAuth>,
      },
      {
        path: '/order-confirmation/:id',
        element: <RequireAuth><OrderConfirmationPage /></RequireAuth>,
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <AccountLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/account', element: <ProfilePage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
      { path: '/wishlist', element: <WishlistPage /> },
      { path: '/addresses', element: <AddressesPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
