export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  accessToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface TwoFactorRequiredResponse {
  requires_2fa: true;
  two_factor_token: string;
}

export interface VerifyTwoFactorDto {
  two_factor_token: string;
  code: string;
  trust_device?: boolean;
}

export type LoginResult = { access_token: string; user: User } | TwoFactorRequiredResponse;
