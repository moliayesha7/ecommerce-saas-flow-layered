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
  category?: { id: string; name: string; slug: string };
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  tenant?: { id: string; name: string; slug: string };
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  tenantSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
}

export const productsApi = {
  list: (params?: ProductsQuery) =>
    apiClient.get('/storefront/products', { params }).then((r) => r.data.data),

  get: (slug: string) =>
    apiClient.get(`/storefront/products/${slug}`).then((r) => r.data.data),

  featured: () =>
    apiClient.get('/storefront/products/featured').then((r) => r.data.data),

  related: (slug: string) =>
    apiClient.get(`/storefront/products/${slug}/related`).then((r) => r.data.data),
};
