import { env } from '../config/env';
import { ApiError } from './errors';

const TOKEN_KEY = 'clovera.accessToken';

// NOTE: sessionStorage keeps the token readable by any script on the page.
// For production prefer an httpOnly, Secure, SameSite cookie issued by the .NET API
// (this client already sends credentials: 'include'). See BACKEND_INTEGRATION.md.
export const tokenStorage = {
  get() {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
  },
  clear() {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  },
};

async function request(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? tokenStorage.get() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError("We couldn't reach the server. Check your connection and try again.", { code: 'NETWORK' });
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!response.ok) {
    // ASP.NET Core returns ProblemDetails ({ title, detail, errors }) by default.
    const message = data?.detail || data?.message || data?.title || 'Something went wrong. Please try again.';
    throw new ApiError(message, { status: response.status, code: data?.code || `HTTP_${response.status}`, details: data?.errors || null });
  }
  return data;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
};
