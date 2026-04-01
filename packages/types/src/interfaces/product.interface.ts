import { ProductStatus } from '../enums';

export interface IProduct {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  status: ProductStatus;
  trackInventory: boolean;
  allowBackorder: boolean;
  weight?: number;
  tags?: string[];
  images?: IProductImage[];
  variants?: IProductVariant[];
  inventory?: IInventory;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  position: number;
  isDefault: boolean;
}

export interface IProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  attributes: Record<string, string>;
  stock: number;
  isActive: boolean;
}

export interface IInventory {
  id: string;
  productId: string;
  tenantId: string;
  variantId?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
}
