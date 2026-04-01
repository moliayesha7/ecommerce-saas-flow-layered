import { apiClient } from './client';

export interface LoginPayload { email: string; password: string; }

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post('/auth/login', payload),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  me: () => apiClient.get('/auth/me'),
};
