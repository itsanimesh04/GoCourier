import axios from 'axios';
import { getToken, clearToken } from '../lib/secureToken';
import { notifyUnauthorized } from '../lib/authRedirect';

const clientApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'https://server.gocourierservice.com/api/v1',
  timeout: 20000,
});

clientApi.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clientApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const headers = error.config?.headers;
      const authHeader =
        headers?.Authorization ??
        headers?.authorization ??
        (typeof headers?.get === 'function' ? headers.get('Authorization') : undefined);
      const hadAuth = Boolean(authHeader);
      await clearToken();
      // Only redirect on real session expiry (request carried a token), not anonymous 401s.
      if (hadAuth) notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === 'string' && message.length > 0) return message;
    return error.message;
  }
  return 'Something went wrong';
}

export function isConflictError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

export default clientApi;
