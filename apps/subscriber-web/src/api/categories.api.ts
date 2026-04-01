import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
}

export const categoriesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/subscriber/categories', { params }).then((r) => r.data.data),

  get: (id: string) =>
    apiClient.get(`/subscriber/categories/${id}`).then((r) => r.data.data),

  create: (data: Partial<Category>) =>
    apiClient.post('/subscriber/categories', data).then((r) => r.data.data),

  update: (id: string, data: Partial<Category>) =>
    apiClient.patch(`/subscriber/categories/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/subscriber/categories/${id}`).then((r) => r.data),
};
