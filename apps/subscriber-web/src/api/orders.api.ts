import { apiClient } from './client';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  customer: { id: string; firstName: string; lastName: string; email: string };
  items: OrderItem[];
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    apiClient.get('/subscriber/orders', { params }).then((r) => r.data.data),

  get: (id: string) =>
    apiClient.get(`/subscriber/orders/${id}`).then((r) => r.data.data),

  updateStatus: (id: string, status: string, note?: string) =>
    apiClient.patch(`/subscriber/orders/${id}/status`, { status, note }).then((r) => r.data.data),

  fulfill: (id: string, trackingNumber: string, carrier: string) =>
    apiClient.post(`/subscriber/orders/${id}/fulfill`, { trackingNumber, carrier }).then((r) => r.data.data),
};
