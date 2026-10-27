import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { tokenStorage } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'loading' only while restoring a saved session; otherwise 'anonymous' or 'authenticated'.
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'anonymous'));

  useEffect(() => {
    if (status !== 'loading') return undefined;
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return;
        setUser(currentUser?.user || currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        tokenStorage.clear();
        if (!cancelled) setStatus('anonymous');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyResult = useCallback((result) => {
    if (result?.user) {
      setUser(result.user);
      setStatus('authenticated');
    }
    return result;
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === 'authenticated',
    login: async (credentials) => applyResult(await authService.login(credentials)),
    register: async (details) => applyResult(await authService.register(details)),
    loginWithGoogle: async () => applyResult(await authService.loginWithGoogle()),
    logout: async () => {
      await authService.logout();
      setUser(null);
      setStatus('anonymous');
    },
  }), [user, status, applyResult]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
