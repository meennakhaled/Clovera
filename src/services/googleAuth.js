import { env } from '../config/env';
import { ApiError } from './errors';

// Google Identity Services, OAuth 2.0 "authorization code" popup flow.
// The browser only receives a one-time `code`. The .NET backend exchanges it
// (using the client SECRET, which never leaves the server), validates the ID token
// and issues the app's own session. Nothing returned here counts as proof of login.
const GIS_SRC = 'https://accounts.google.com/gsi/client';
let scriptPromise = null;

export function preloadGoogleScript() {
  if (typeof window === 'undefined' || window.google?.accounts?.oauth2) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        script.remove();
        reject(new ApiError("Google sign-in couldn't load. Check your connection and try again.", { code: 'GOOGLE_SCRIPT' }));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export async function requestGoogleAuthCode() {
  if (!env.googleClientId) {
    throw new ApiError('Google sign-in is not set up yet. Add VITE_GOOGLE_CLIENT_ID to your .env file.', { code: 'GOOGLE_NOT_CONFIGURED' });
  }
  await preloadGoogleScript();

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: env.googleClientId,
      scope: 'openid email profile',
      ux_mode: 'popup',
      callback: (response) => {
        if (response.error) {
          const cancelled = response.error === 'access_denied';
          reject(new ApiError(cancelled ? 'Google sign-in was cancelled.' : 'Google sign-in failed. Please try again.', { code: cancelled ? 'GOOGLE_CANCELLED' : 'GOOGLE_FAILED' }));
        } else {
          resolve(response.code);
        }
      },
      error_callback: (error) => {
        if (error?.type === 'popup_closed') {
          reject(new ApiError('Google sign-in was cancelled.', { code: 'GOOGLE_CANCELLED' }));
        } else if (error?.type === 'popup_failed_to_open') {
          reject(new ApiError('Your browser blocked the Google window. Allow pop-ups for this site and try again.', { code: 'GOOGLE_POPUP_BLOCKED' }));
        } else {
          reject(new ApiError('Google sign-in failed. Please try again.', { code: 'GOOGLE_FAILED' }));
        }
      },
    });
    client.requestCode();
  });
}
