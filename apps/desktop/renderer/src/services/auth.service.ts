import { buildApiUrl, requestJson } from '@/services/api';
import type { AuthUser, LoginPayload, LoginResponse, RegisterPayload } from '@/types/auth';

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  if (import.meta.env.DEV) {
    console.log('[auth.register]', {
      name: payload.name,
      email: payload.email,
    });
  }

  return requestJson<AuthUser>(buildApiUrl('/auth/register'), {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', payload.email);
  formData.append('password', payload.password);

  return requestJson<LoginResponse>(buildApiUrl('/auth/login'), {
    method: 'POST',
    bodyType: 'form',
    body: formData,
    errorMessages: {
      unprocessable: 'Format login tidak sesuai.',
    },
  });
}

export async function getMe(token?: string): Promise<AuthUser> {
  return requestJson<AuthUser>(buildApiUrl('/auth/me'), {
    method: 'GET',
    token,
  });
}

export async function logout(): Promise<void> {
  // Backend logout endpoint belum tersedia; token dan user dibersihkan di storage lokal.
  return undefined;
}
