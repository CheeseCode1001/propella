'use client'

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

const TOKEN_KEY = 'propella-admin-token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode — the session simply will not persist */
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  // exactOptionalPropertyTypes forbids an explicit `undefined` body, so the
  // key is only added when there is one.
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    credentials: 'include',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(res.status, payload?.error ?? `Request failed (${res.status})`)
  }

  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
