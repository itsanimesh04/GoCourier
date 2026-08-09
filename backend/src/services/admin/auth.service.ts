import type { Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../utils/errors';
import { authService } from '../auth.service';
import { userRepository } from '../../repositories/user.repository';
import type { AuthUser } from '../../types/auth';

export class AdminAuthService {
  async login(email: string, password: string, res: Response) {
    const result = await authService.login(email, password, res);
    if (result.user.role !== 'admin') {
      authService.logout(res);
      throw new ForbiddenError('Admin access required');
    }
    return result;
  }

  async identity(user: AuthUser | undefined) {
    if (!user) {
      throw new UnauthorizedError();
    }
    const row = await userRepository.findById(user.id);
    if (!row || !row.is_active || row.role !== 'admin') {
      throw new UnauthorizedError('Admin session invalid');
    }
    return {
      id: row.id,
      phone: row.phone,
      email: row.email,
      name: row.name,
      role: row.role,
      campus_id: row.campus_id
    };
  }

  logout(res: Response) {
    return authService.logout(res);
  }
}

export const adminAuthService = new AdminAuthService();
