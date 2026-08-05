export type UserRole = 'student' | 'ops' | 'admin' | 'delivery_agent';

export interface AuthUser {
  id: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  campus_id: string | null;
}

export interface JwtPayload {
  id: string;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  campus_id: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
