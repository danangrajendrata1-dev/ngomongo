import { STORAGE_KEYS } from './constants';

export function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorageValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageValue(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(key);
}

// TODO: Ganti localStorage ke secure Electron storage atau keytar saat hardening keamanan.
export function getAccessToken(): string | null {
  return readStorageValue<string | null>(STORAGE_KEYS.accessToken, null);
}

export function setAccessToken(token: string): void {
  writeStorageValue(STORAGE_KEYS.accessToken, token);
}

export function clearAccessToken(): void {
  removeStorageValue(STORAGE_KEYS.accessToken);
}

export function getStoredUser<T>(): T | null {
  return readStorageValue<T | null>(STORAGE_KEYS.user, null);
}

export function setStoredUser<T>(user: T): void {
  writeStorageValue(STORAGE_KEYS.user, user);
}

export function clearStoredUser(): void {
  removeStorageValue(STORAGE_KEYS.user);
}

export function getOrCreateDesktopDeviceId(): string {
  const existing = readStorageValue<string | null>(STORAGE_KEYS.desktopDeviceId, null);
  if (existing) {
    return existing;
  }

  const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `device-${Date.now()}`;
  writeStorageValue(STORAGE_KEYS.desktopDeviceId, generated);
  return generated;
}
