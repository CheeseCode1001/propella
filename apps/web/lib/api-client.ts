import { API_URL } from './constants'

const TOKEN_KEY = 'propella_access_token'

let _accessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

export function setAccessToken(token: string | null) {
  _accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
}

export function getAccessToken() {
  if (!_accessToken && typeof window !== 'undefined') {
    _accessToken = localStorage.getItem(TOKEN_KEY)
  }
  return _accessToken
}

let refreshPromise: Promise<string | null> | null = null

async function doRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { data: { accessToken: string } }
        setAccessToken(data.data.accessToken)
        return data.data.accessToken
      }
      if (refreshRes.status === 401 || refreshRes.status === 403) {
        setAccessToken(null)
        window.dispatchEvent(new CustomEvent('propella:logout'))
      }
      return null
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    const newToken = await doRefreshToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      const retry = await fetch(`${API_URL}/api${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!retry.ok) {
        const err = (await retry.json().catch(() => ({ error: 'Request failed' }))) as {
          error?: string
        }
        throw new Error(err.error ?? 'Request failed')
      }
      if (retry.status === 204) return undefined as T
      return retry.json() as Promise<T>
    } else {
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: 'Request failed' }))) as {
      error?: string
    }
    throw new Error(err.error ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
}
