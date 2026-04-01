import { apiClient } from './client';

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: 'BKASH' | 'COD';
  couponCode?: string;
  shippingRateId?: string;
}

export const ordersApi = {
  create: (data: CreateOrderDto) =>
    apiClient.post('/customer/orders', data).then((r) => r.data.data),

  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/customer/orders', { params }).then((r) => r.data.data),

  get: (id: string) =>
    apiClient.get(`/customer/orders/${id}`).then((r) => r.data.data),

  cancel: (id: string) =>
    apiClient.patch(`/customer/orders/${id}/cancel`).then((r) => r.data.data),
};
