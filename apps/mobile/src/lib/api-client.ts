import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'propella_access_token';
const API_URL_KEY = 'propella_custom_api_url';

/**
 * Android emulator uses 10.0.2.2 to connect to host machine localhost:5000.
 * iOS simulator / web uses localhost:5000.
 * Default can also point to production API.
 */
export const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

let _accessToken: string | null = null;
let _hasLoadedToken = false;

export async function setAccessToken(token: string | null): Promise<void> {
  _accessToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export async function getAccessToken(): Promise<string | null> {
  if (!_hasLoadedToken) {
    try {
      _accessToken = await AsyncStorage.getItem(TOKEN_KEY);
      _hasLoadedToken = true;
    } catch {
      _accessToken = null;
    }
  }
  return _accessToken;
}

export async function getApiUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    if (custom) return custom;
  } catch {}
  return DEFAULT_API_URL;
}

export async function setCustomApiUrl(url: string | null): Promise<void> {
  try {
    if (url) {
      await AsyncStorage.setItem(API_URL_KEY, url);
    } else {
      await AsyncStorage.removeItem(API_URL_KEY);
    }
  } catch {}
}

let refreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const baseUrl = await getApiUrl();
      const currentToken = await getAccessToken();
      const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
      });

      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { data: { accessToken: string } };
        await setAccessToken(data.data.accessToken);
        return data.data.accessToken;
      }
      if (refreshRes.status === 401 || refreshRes.status === 403) {
        await setAccessToken(null);
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const baseUrl = await getApiUrl();
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    const newToken = await doRefreshToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retry = await fetch(`${baseUrl}/api${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) {
        const err = (await retry.json().catch(() => ({ error: 'Request failed' }))) as {
          error?: string;
        };
        throw new Error(err.error ?? 'Request failed');
      }
      if (retry.status === 204) return undefined as T;
      return retry.json() as Promise<T>;
    } else {
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: 'Request failed' }))) as {
      error?: string;
    };
    throw new Error(err.error ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
