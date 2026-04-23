import type { PaginatedResponse } from './api.types';
import type { User } from './auth.types';

export type { User };

export interface UpdateUserDto {
  name?: string;
}

export interface UpdateRoleDto {
  role: 'USER' | 'ADMIN';
}

export interface UsersQuery {
  limit?: number;
  cursor?: string;
  search?: string;
}

export type PaginatedUsers = PaginatedResponse<User>;
