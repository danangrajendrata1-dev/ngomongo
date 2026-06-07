import { requestJson } from '@/services/api';
import type { AuthUser, LoginPayload, LoginResponse, RegisterPayload } from '@/types/auth';

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return requestJson<AuthUser>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function getMe(token?: string): Promise<AuthUser> {
  return requestJson<AuthUser>('/auth/me', {
    method: 'GET',
    token,
  });
}

export async function logout(): Promise<void> {
  // Backend logout endpoint belum tersedia; token dan user dibersihkan di storage lokal.
  return undefined;
}
