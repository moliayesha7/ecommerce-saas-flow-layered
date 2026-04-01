import { apiClient } from './client';

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export const discountsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/subscriber/coupons', { params }).then((r) => r.data.data),

  create: (data: Partial<Coupon>) =>
    apiClient.post('/subscriber/coupons', data).then((r) => r.data.data),

  update: (id: string, data: Partial<Coupon>) =>
    apiClient.patch(`/subscriber/coupons/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/subscriber/coupons/${id}`).then((r) => r.data),
};
