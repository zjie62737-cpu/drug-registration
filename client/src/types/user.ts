export type Role = 'applicant' | 'reviewer' | 'approver' | 'admin';

export interface User {
  id: number;
  username: string;
  realName: string;
  organization: string;
  role: Role;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  realName: string;
  organization: string;
  role?: Role;
  email?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
