import { apiClient } from './client';

export interface InventoryItem {
  id: string;
  productId: string;
  product: { name: string; sku: string };
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  location?: string;
}

export interface AdjustInventoryDto {
  productId: string;
  quantity: number;
  type: 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE';
  note?: string;
}

export const inventoryApi = {
  list: (params?: { page?: number; limit?: number; lowStock?: boolean }) =>
    apiClient.get('/subscriber/inventory', { params }).then((r) => r.data.data),

  adjust: (data: AdjustInventoryDto) =>
    apiClient.post('/subscriber/inventory/adjust', data).then((r) => r.data.data),

  movements: (productId: string) =>
    apiClient.get(`/subscriber/inventory/${productId}/movements`).then((r) => r.data.data),
};
