// Single place where environment variables are read.
// All VITE_* values are public (bundled into the browser build).
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7000/api').replace(/\/+$/, ''),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
};
