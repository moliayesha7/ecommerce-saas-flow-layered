export const CACHE_KEYS = {
  TENANT: (id: string) => `tenant:${id}`,
  TENANT_BY_SLUG: (slug: string) => `tenant:slug:${slug}`,
  TENANT_SETTINGS: (tenantId: string) => `tenant:settings:${tenantId}`,
  USER: (id: string) => `user:${id}`,
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCTS_LIST: (tenantId: string, query: string) => `products:${tenantId}:${query}`,
  CATEGORIES: (tenantId: string) => `categories:${tenantId}`,
  CART: (userId: string) => `cart:${userId}`,
  SESSION: (userId: string) => `session:${userId}`,
  REFRESH_TOKEN: (userId: string) => `refresh_token:${userId}`,
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  OTP: (email: string) => `otp:${email}`,
} as const;

export const CACHE_TTL = {
  TENANT: 3600,
  USER: 1800,
  PRODUCT: 900,
  PRODUCTS_LIST: 300,
  CATEGORIES: 3600,
  CART: 86400,
  SESSION: 86400,
  REFRESH_TOKEN: 604800,
  OTP: 600,
} as const;
