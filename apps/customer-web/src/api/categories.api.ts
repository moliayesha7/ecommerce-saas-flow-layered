import { apiClient } from './client';

export const categoriesApi = {
  list: () =>
    apiClient.get('/storefront/categories').then((r) => r.data.data),
};
