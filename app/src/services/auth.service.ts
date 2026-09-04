import clientApi from '../apis/clientApi';
import { setToken, clearToken } from '../lib/secureToken';
import type { User } from '../utils/types';
import { digitsOnly } from './mappers';

class AuthService {
  me() {
    return clientApi.get<{ success: boolean; data: { user: User } }>('/auth/me');
  }

  async login(identifier: string, password: string) {
    const res = await clientApi.post<{ success: boolean; data: { token: string; user: User } }>(
      '/auth/login',
      { identifier, password }
    );
    if (res.data.data.token) await setToken(res.data.data.token);
    return res;
  }

  async signup(input: { name: string; password: string; email?: string; phone?: string }) {
    const body: Record<string, string> = {
      name: input.name,
      password: input.password,
    };
    if (input.email) body.email = input.email;
    if (input.phone) body.phone = digitsOnly(input.phone);
    const res = await clientApi.post<{ success: boolean; data: { token: string; user: User } }>(
      '/auth/signup',
      body
    );
    if (res.data.data.token) await setToken(res.data.data.token);
    return res;
  }

  async logout() {
    try {
      await clientApi.post('/auth/logout');
    } finally {
      await clearToken();
    }
  }

  setCampus(campusId: string) {
    return clientApi.post<{ success: boolean; data: User }>('/me/campus', { campus_id: campusId });
  }
}

export default new AuthService();
