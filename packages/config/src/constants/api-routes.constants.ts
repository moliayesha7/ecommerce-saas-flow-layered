export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

export const AUTH_ROUTES = {
  BASE: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  ME: '/auth/me',
} as const;

export const ADMIN_ROUTES = {
  BASE: '/admin',
  TENANTS: '/admin/tenants',
  USERS: '/admin/users',
  PLANS: '/admin/plans',
  PAYMENTS: '/admin/payments',
  REPORTS: '/admin/reports',
  SETTINGS: '/admin/settings',
  DASHBOARD: '/admin/dashboard',
} as const;

export const SUBSCRIBER_ROUTES = {
  BASE: '/subscriber',
  PRODUCTS: '/subscriber/products',
  CATEGORIES: '/subscriber/categories',
  INVENTORY: '/subscriber/inventory',
  ORDERS: '/subscriber/orders',
  CUSTOMERS: '/subscriber/customers',
  ANALYTICS: '/subscriber/analytics',
  SETTINGS: '/subscriber/settings',
  SHIPPING: '/subscriber/shipping',
  DISCOUNTS: '/subscriber/discounts',
  UPLOADS: '/subscriber/uploads',
} as const;

export const CUSTOMER_ROUTES = {
  BASE: '/customer',
  CART: '/customer/cart',
  CHECKOUT: '/customer/checkout',
  ORDERS: '/customer/orders',
  PROFILE: '/customer/profile',
  ADDRESSES: '/customer/addresses',
  REVIEWS: '/customer/reviews',
  WISHLIST: '/customer/wishlist',
} as const;
