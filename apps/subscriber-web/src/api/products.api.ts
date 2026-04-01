import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  category?: { id: string; name: string };
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export const productsApi = {
  list: (params?: ProductsQuery) =>
    apiClient.get('/subscriber/products', { params }).then((r) => r.data.data),

  get: (id: string) =>
    apiClient.get(`/subscriber/products/${id}`).then((r) => r.data.data),

  create: (data: Partial<Product>) =>
    apiClient.post('/subscriber/products', data).then((r) => r.data.data),

  update: (id: string, data: Partial<Product>) =>
    apiClient.patch(`/subscriber/products/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/subscriber/products/${id}`).then((r) => r.data),
};
