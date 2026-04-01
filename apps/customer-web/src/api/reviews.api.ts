import { apiClient } from './client';

export const reviewsApi = {
  list: (productId: string) =>
    apiClient.get(`/storefront/products/${productId}/reviews`).then((r) => r.data.data),

  create: (productId: string, data: { rating: number; comment: string }) =>
    apiClient.post(`/customer/reviews`, { productId, ...data }).then((r) => r.data.data),
};
