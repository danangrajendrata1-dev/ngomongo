import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearAccessToken,
  clearStoredUser,
  clearTokenType,
  getAccessToken,
  getStoredUser,
  getTokenType,
  setAccessToken,
  setStoredUser,
  setTokenType,
} from '@/lib/storage';
import * as authService from '@/services/auth.service';
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  tokenType: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

async function hydrateUser(token: string): Promise<AuthUser> {
  const me = await authService.getMe(token);
  setStoredUser(me);
  return me;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser<AuthUser>());
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [tokenType, setTokenTypeState] = useState<string | null>(() => getTokenType());
  const [isLoading, setIsLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const storedToken = getAccessToken();
      const storedUser = getStoredUser<AuthUser>();

      if (!storedToken) {
        if (mounted) {
          setUser(storedUser);
          setToken(null);
          setTokenTypeState(null);
          setIsLoading(false);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const me = await hydrateUser(storedToken);
        if (mounted) {
          setUser(me);
          setToken(storedToken);
          setTokenTypeState(getTokenType());
          setError(null);
        }
      } catch {
        clearAccessToken();
        clearTokenType();
        clearStoredUser();
        if (mounted) {
          setUser(null);
          setToken(null);
          setTokenTypeState(null);
          setError('Sesi sudah kedaluwarsa. Silakan login lagi.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const clearError = () => setError(null);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(payload);
      setAccessToken(response.access_token);
      setTokenType(response.token_type);
      setToken(response.access_token);
      setTokenTypeState(response.token_type);
      const me = await hydrateUser(response.access_token);
      setUser(me);
    } catch (err) {
      setUser(null);
      setToken(null);
      setTokenTypeState(null);
      clearAccessToken();
      clearTokenType();
      clearStoredUser();
      setError(err instanceof Error ? err.message : 'Login gagal.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(payload);
      await login({
        email: payload.email,
        password: payload.password,
      });
    } catch (err) {
      setUser(null);
      setToken(null);
      setTokenTypeState(null);
      clearAccessToken();
      clearTokenType();
      clearStoredUser();
      setError(err instanceof Error ? err.message : 'Registrasi gagal.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadMe = async () => {
    const currentToken = getAccessToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setTokenTypeState(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const me = await hydrateUser(currentToken);
      setUser(me);
      setToken(currentToken);
      setTokenTypeState(getTokenType());
    } catch (err) {
      setUser(null);
      setToken(null);
      setTokenTypeState(null);
      clearAccessToken();
      clearTokenType();
      clearStoredUser();
      setError(err instanceof Error ? err.message : 'Sesi tidak valid.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    clearAccessToken();
    clearTokenType();
    clearStoredUser();
    setUser(null);
    setToken(null);
    setTokenTypeState(null);
    setError(null);
  };

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      tokenType,
      isAuthenticated: Boolean(user && token),
      isLoading,
      isBootstrapping,
      error,
      login,
      register,
      loadMe,
      logout,
      clearError,
    }),
    [user, token, tokenType, isLoading, isBootstrapping, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }

  return context;
}
