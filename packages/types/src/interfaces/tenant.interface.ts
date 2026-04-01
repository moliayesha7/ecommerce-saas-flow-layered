import { TenantStatus } from '../enums';

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: TenantStatus;
  logo?: string;
  email: string;
  phone?: string;
  address?: string;
  settings?: ITenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenantSettings {
  id: string;
  tenantId: string;
  currency: string;
  timezone: string;
  language: string;
  taxRate: number;
  lowStockThreshold: number;
  orderPrefix: string;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableCoupons: boolean;
  maintenanceMode: boolean;
  metaTitle?: string;
  metaDescription?: string;
}
