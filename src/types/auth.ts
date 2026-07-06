export type UserRole = 'student' | 'ops' | 'admin' | 'delivery_agent';

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  campus_id: string | null;
}

export interface JwtPayload {
  id: string;
  role: UserRole;
  campus_id: string | null;
}
