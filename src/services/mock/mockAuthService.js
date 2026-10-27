// DEMO ONLY. Used when VITE_USE_MOCK_API=true so the screens can be tried without a backend.
// It accepts any well-formed input, stores nothing on a server and proves nothing about identity.
// Remove this folder (and the mock branches in authService.js) when the .NET API is ready.
import { ApiError } from '../errors';

const USER_KEY = 'clovera.mockUser';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function saveUser(user) {
  try { sessionStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* ignore */ }
  return user;
}

export async function login({ email }) {
  await wait(600);
  const name = email.split('@')[0];
  return { accessToken: 'demo-token', user: saveUser({ id: 'demo', name, email }) };
}

export async function register({ username, email }) {
  await wait(700);
  return { accessToken: 'demo-token', user: saveUser({ id: 'demo', name: username, email }) };
}

export async function getCurrentUser() {
  await wait(150);
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  throw new ApiError('Not signed in.', { status: 401, code: 'HTTP_401' });
}

export function clear() {
  try { sessionStorage.removeItem(USER_KEY); } catch { /* ignore */ }
}
