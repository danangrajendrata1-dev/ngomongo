import { getAccessToken } from '@/lib/storage';

const API_URL = import.meta.env.VITE_API_URL?.trim() || 'http://127.0.0.1:8000';

if (import.meta.env.DEV) {
  console.log('NGOMONGO API URL:', API_URL);
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 0, code = 'NETWORK_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  bodyType?: 'json' | 'form';
  token?: string | null;
  errorMessages?: {
    unprocessable?: string;
  };
};

function getBaseUrl(): string {
  if (!API_URL) {
    throw new ApiError('API URL belum dikonfigurasi di environment.', 0, 'API_URL_MISSING');
  }

  return API_URL.replace(/\/+$/, '');
}

export function buildApiUrl(pathnameOrUrl: string): string {
  if (/^https?:\/\//i.test(pathnameOrUrl)) {
    return pathnameOrUrl;
  }

  const normalizedPath = pathnameOrUrl.startsWith('/') ? pathnameOrUrl : `/${pathnameOrUrl}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return '';
        }

        const message = 'msg' in item ? String((item as { msg?: unknown }).msg ?? '') : '';
        const location = Array.isArray((item as { loc?: unknown }).loc)
          ? (item as { loc?: unknown[] }).loc
              .map((part) => String(part))
              .filter(Boolean)
              .filter((part) => part !== 'body')
              .join('.')
          : '';

        if (message && location) {
          return `${location}: ${message}`;
        }

        return message || location;
      })
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join(', ');
    }
  }

  return fallback;
}

async function parseError(response: Response, errorMessages?: RequestOptions['errorMessages']): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const validationMessage = response.status === 422
    ? extractMessage(payload, errorMessages?.unprocessable ?? 'Format request tidak sesuai.')
    : null;
  const fallbackMessage = response.status === 400
    ? 'Email atau password salah.'
    : response.status === 401
      ? 'Email atau password salah.'
      : response.status === 409
        ? 'Email sudah terdaftar.'
        : response.status === 422
          ? errorMessages?.unprocessable ?? 'Format request tidak sesuai.'
          : response.status >= 500
            ? 'Server sedang bermasalah. Coba lagi beberapa saat.'
            : 'Permintaan gagal diproses.';
  const message = response.status === 422
    ? validationMessage ?? fallbackMessage
    : extractMessage(payload, fallbackMessage);
  const code = (payload && typeof payload === 'object' && 'code' in payload && typeof (payload as { code?: unknown }).code === 'string')
    ? String((payload as { code?: string }).code)
    : response.status === 400
      ? 'BAD_REQUEST'
    : response.status === 401
      ? 'AUTH_ERROR'
      : response.status === 409
        ? 'CONFLICT'
      : response.status === 422
        ? 'UNPROCESSABLE_ENTITY'
      : response.status >= 500
        ? 'SERVER_ERROR'
      : 'API_ERROR';

  return new ApiError(message, response.status, code);
}

export async function requestJson<T>(pathnameOrUrl: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = options.token ?? getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.bodyType === 'form') {
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
      if (options.body instanceof URLSearchParams) {
        body = options.body.toString();
      } else if (options.body && typeof options.body === 'object') {
        const params = new URLSearchParams();
        Object.entries(options.body as Record<string, unknown>).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.set(key, String(value));
          }
        });
        body = params.toString();
      }
      headers.set('Accept', 'application/json');
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(pathnameOrUrl), {
      ...options,
      body,
      headers,
    });
  } catch {
    throw new ApiError('Backend tidak dapat dijangkau. Periksa koneksi atau jalankan API backend.', 0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    throw await parseError(response, options.errorMessages);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getStoredApiUrl(): string {
  return API_URL;
}
