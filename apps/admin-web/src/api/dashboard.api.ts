import { apiClient } from './client';

export const dashboardApi = {
  getAdminStats: () => apiClient.get('/admin/dashboard'),
  getPaymentStats: () => apiClient.get('/admin/payments/stats'),
};
