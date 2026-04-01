import { apiClient } from './client';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }).then((r) => r.data.data),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => apiClient.post('/auth/register/customer', data).then((r) => r.data.data),

  profile: () =>
    apiClient.get('/auth/me').then((r) => r.data.data),

  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    apiClient.patch('/customer/profile', data).then((r) => r.data.data),
};
