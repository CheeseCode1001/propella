import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const TOKEN_KEY = 'propella_access_token';
const API_URL_KEY = 'propella_custom_api_url';

/**
 * Dynamically resolves the API URL:
 * 1. Custom URL stored in AsyncStorage
 * 2. EXPO_PUBLIC_API_URL if set to a remote domain
 * 3. Metro Host IP if running on physical device / Expo Go
 * 4. 10.0.2.2:5000 if running on Android Emulator
 * 5. localhost:5000 if running on iOS simulator or web
 */
export function resolveDefaultApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Physical device or Expo Go: extract host machine IP from Metro debugger URI
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000`;
    }
  }

  // Android emulator loopback to host
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return envUrl || 'http://localhost:5000';
}

export const DEFAULT_API_URL = resolveDefaultApiUrl();

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
  return resolveDefaultApiUrl();
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

export async function testApiConnection(): Promise<{
  ok: boolean;
  url: string;
  latencyMs: number;
  error?: string;
}> {
  const url = await getApiUrl();
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { ok: true, url, latencyMs };
    }
    return { ok: false, url, latencyMs, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return {
      ok: false,
      url,
      latencyMs: Date.now() - start,
      error: err?.name === 'AbortError' ? 'Connection timed out' : 'Unreachable',
    };
  }
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
