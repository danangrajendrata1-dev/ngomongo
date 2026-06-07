import { API_URL } from '@/lib/constants';
import { getAccessToken } from '@/lib/storage';

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
  token?: string | null;
};

function getBaseUrl(): string {
  if (!API_URL) {
    throw new ApiError('API URL belum dikonfigurasi di environment.', 0, 'API_URL_MISSING');
  }

  return API_URL.replace(/\/+$/, '');
}

export function buildApiUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
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
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg?: unknown }).msg ?? '');
        }
        return '';
      })
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join(', ');
    }
  }

  return fallback;
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const message = extractMessage(payload, response.status === 401 ? 'Sesi kamu sudah berakhir. Silakan login lagi.' : 'Permintaan gagal diproses.');
  const code = (payload && typeof payload === 'object' && 'code' in payload && typeof (payload as { code?: unknown }).code === 'string')
    ? String((payload as { code?: string }).code)
    : response.status === 401
      ? 'AUTH_ERROR'
      : 'API_ERROR';

  return new ApiError(message, response.status, code);
}

export async function requestJson<T>(pathname: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = options.token ?? getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(pathname), {
      ...options,
      body,
      headers,
    });
  } catch {
    throw new ApiError('Backend tidak dapat dijangkau. Periksa koneksi atau jalankan API backend.', 0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getStoredApiUrl(): string {
  return API_URL;
}
