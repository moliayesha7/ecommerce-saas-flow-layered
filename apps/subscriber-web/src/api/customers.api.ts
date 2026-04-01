import { apiClient } from './client';

export const customersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/subscriber/customers', { params }).then((r) => r.data.data),

  get: (id: string) =>
    apiClient.get(`/subscriber/customers/${id}`).then((r) => r.data.data),
};
