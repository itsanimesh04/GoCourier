import clientApi from '../apis/clientApi';
import type { User } from '../utils/types';
import { digitsOnly } from './mappers';

class AuthService {
  me() {
    return clientApi.get<{ success: boolean; data: { user: User } }>('/auth/me');
  }

  login(identifier: string, password: string) {
    return clientApi.post<{ success: boolean; data: { token: string; user: User } }>('/auth/login', {
      identifier,
      password,
    });
  }

  signup(input: { name: string; password: string; email?: string; phone?: string }) {
    const body: Record<string, string> = {
      name: input.name,
      password: input.password,
    };
    if (input.email) body.email = input.email;
    if (input.phone) body.phone = digitsOnly(input.phone);
    return clientApi.post<{ success: boolean; data: { token: string; user: User } }>('/auth/signup', body);
  }

  logout() {
    return clientApi.post('/auth/logout');
  }

  setCampus(campusId: string) {
    return clientApi.post<{ success: boolean; data: User }>('/me/campus', { campus_id: campusId });
  }
}

export default new AuthService();
