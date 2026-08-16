import axios from 'axios';

const clientApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
});

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
