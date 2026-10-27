import { env } from '../config/env';
import { apiClient, tokenStorage } from './apiClient';
import { requestGoogleAuthCode } from './googleAuth';
import { ApiError } from './errors';
import * as mock from './mock/mockAuthService';

// Expected result of login / register / google (see BACKEND_INTEGRATION.md):
//   { accessToken?: string, user: { id, name, email, avatarUrl? } }
// If the backend uses cookie sessions, accessToken can be omitted.
function persist(result) {
  if (result?.accessToken) tokenStorage.set(result.accessToken);
  return result;
}

export async function login({ email, password }) {
  if (env.useMockApi) return persist(await mock.login({ email, password }));
  return persist(await apiClient.post('/auth/login', { email, password }, { auth: false }));
}

export async function register({ username, email, password, confirmPassword }) {
  if (env.useMockApi) return persist(await mock.register({ username, email, password }));
  return persist(await apiClient.post('/auth/register', { username, email, password, confirmPassword }, { auth: false }));
}

export async function loginWithGoogle() {
  if (env.useMockApi) {
    // Google login is never faked: it needs the backend to verify the credential.
    throw new ApiError('Google sign-in works once the backend is connected. Set VITE_USE_MOCK_API=false.', { code: 'GOOGLE_BACKEND_REQUIRED' });
  }
  const code = await requestGoogleAuthCode();
  return persist(await apiClient.post('/auth/google', { code, redirectUri: 'postmessage' }, { auth: false }));
}

export async function getCurrentUser() {
  if (env.useMockApi) return mock.getCurrentUser();
  return apiClient.get('/auth/me');
}

export async function logout() {
  try {
    if (env.useMockApi) mock.clear();
    else await apiClient.post('/auth/logout', {});
  } catch {
    // Signing out locally must work even if the request fails.
  } finally {
    tokenStorage.clear();
  }
}
