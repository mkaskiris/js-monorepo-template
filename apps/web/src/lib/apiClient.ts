let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

type ApiRequestInit = Omit<RequestInit, 'body'> & { body?: unknown }

async function request<T>(path: string, options: ApiRequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const init: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  }

  let res = await fetch(path, init)

  // Silent token refresh on 401 (skip for the refresh endpoint itself)
  if (res.status === 401 && path !== '/auth/refresh') {
    const refreshRes = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
    if (refreshRes.ok) {
      const data = (await refreshRes.json()) as { accessToken: string }
      setAccessToken(data.accessToken)
      headers['Authorization'] = `Bearer ${data.accessToken}`
      res = await fetch(path, { ...init, headers })
    } else {
      setAccessToken(null)
      throw Object.assign(new Error('Session expired'), { status: 401 })
    }
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      /* ignore parse failure */
    }
    throw Object.assign(new Error(message), { status: res.status })
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestInit) =>
    request<T>(path, { ...options, method: 'POST', body }),
}
