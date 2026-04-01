import { apiClient } from './client';

export const tenantsApi = {
  findAll: (params?: Record<string, unknown>) =>
    apiClient.get('/admin/tenants', { params }),

  findById: (id: string) => apiClient.get(`/admin/tenants/${id}`),

  stats: () => apiClient.get('/admin/tenants/stats'),

  approve: (id: string) => apiClient.patch(`/admin/tenants/${id}/approve`),

  suspend: (id: string, reason: string) =>
    apiClient.patch(`/admin/tenants/${id}/suspend`, { reason }),

  activate: (id: string) => apiClient.patch(`/admin/tenants/${id}/activate`),
};
